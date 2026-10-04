import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { createHmac, timingSafeEqual } from "node:crypto";
import { Model, Types } from "mongoose";
import { CommunityRecord } from "./community-record.schema";
import { VerifyPaymentDto } from "./resource.dto";

type ResidentClaims = { sub: string; societyId: string };

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(CommunityRecord.name)
    private readonly records: Model<CommunityRecord>,
    private readonly config: ConfigService,
  ) {}

  private credentials() {
    const keyId = this.config.get<string>("RAZORPAY_KEY_ID");
    const keySecret = this.config.get<string>("RAZORPAY_KEY_SECRET");
    const mode = this.config.get<string>("RAZORPAY_MODE", "test");
    if (mode !== "test" || !keyId?.startsWith("rzp_test_") || !keySecret) {
      throw new ServiceUnavailableException(
        "Razorpay test mode is not configured. No payment was processed.",
      );
    }
    return { keyId, keySecret };
  }

  async createOrder(user: ResidentClaims, invoiceId: string) {
    if (!Types.ObjectId.isValid(invoiceId))
      throw new NotFoundException("Invoice not found.");
    const invoice = await this.records
      .findOne({
        _id: invoiceId,
        kind: "payment",
        ownerId: user.sub,
        societyId: user.societyId,
      })
      .lean();
    if (!invoice) throw new NotFoundException("Invoice not found.");
    if (invoice.status === "completed")
      throw new ConflictException("This invoice is already paid.");
    const amountRupees = Number((invoice.data as any)?.amount);
    if (!Number.isFinite(amountRupees) || amountRupees <= 0)
      throw new ConflictException("The invoice amount is invalid.");
    const amount = Math.round(amountRupees * 100);
    const { keyId, keySecret } = this.credentials();
    const receipt = `nivora_${invoice._id.toString()}`.slice(0, 40);
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt,
        notes: { invoiceId: invoice._id.toString(), residentId: user.sub },
      }),
      signal: AbortSignal.timeout(12000),
    }).catch(() => {
      throw new ServiceUnavailableException(
        "Razorpay could not be reached. No payment was processed.",
      );
    });
    const order = await response.json().catch(() => ({}));
    if (!response.ok || !order.id)
      throw new ServiceUnavailableException(
        "Razorpay could not create a test order. No payment was processed.",
      );
    await this.records.updateOne(
      { _id: invoice._id, ownerId: user.sub, kind: "payment" },
      { $set: { "data.razorpayOrderId": order.id, "data.currency": "INR" } },
    );
    return {
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      invoiceId: invoice._id.toString(),
      name: invoice.title,
      description: invoice.title,
    };
  }

  async verify(user: ResidentClaims, input: VerifyPaymentDto) {
    const { keyId, keySecret } = this.credentials();
    if (!Types.ObjectId.isValid(input.invoiceId))
      throw new NotFoundException("Invoice not found.");
    const invoice = await this.records
      .findOne({
        _id: input.invoiceId,
        kind: "payment",
        ownerId: user.sub,
        societyId: user.societyId,
      })
      .lean();
    if (!invoice) throw new NotFoundException("Invoice not found.");
    const expectedOrderId = (invoice.data as any)?.razorpayOrderId;
    if (!expectedOrderId || expectedOrderId !== input.razorpay_order_id)
      throw new UnauthorizedException(
        "The payment order does not match this invoice.",
      );
    const expected = createHmac("sha256", keySecret)
      .update(`${expectedOrderId}|${input.razorpay_payment_id}`)
      .digest();
    let provided: Buffer;
    try {
      provided = Buffer.from(input.razorpay_signature, "hex");
    } catch {
      throw new UnauthorizedException("Payment signature is invalid.");
    }
    if (
      provided.length !== expected.length ||
      !timingSafeEqual(expected, provided)
    )
      throw new UnauthorizedException("Payment signature is invalid.");

    // Signature confirmation is followed by a server-to-server status check.
    const statusResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(input.razorpay_payment_id)}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        },
        signal: AbortSignal.timeout(12000),
      },
    ).catch(() => {
      throw new ServiceUnavailableException(
        "Could not confirm payment status with Razorpay.",
      );
    });
    const payment = await statusResponse.json().catch(() => ({}));
    if (!statusResponse.ok || payment.order_id !== expectedOrderId)
      throw new UnauthorizedException(
        "Razorpay payment could not be verified.",
      );
    const expectedAmount = Math.round(
      Number((invoice.data as any)?.amount) * 100,
    );
    if (payment.amount !== expectedAmount || payment.currency !== "INR")
      throw new UnauthorizedException(
        "The payment amount does not match the invoice.",
      );
    if (payment.status !== "captured")
      throw new ConflictException(
        "Payment is not captured yet. The invoice remains unpaid.",
      );
    await this.records.updateOne(
      { _id: invoice._id, ownerId: user.sub, kind: "payment" },
      {
        $set: {
          status: "completed",
          "data.razorpayPaymentId": payment.id,
          "data.paidAt": new Date(),
        },
      },
    );
    return {
      success: true,
      invoiceId: invoice._id.toString(),
      paymentId: payment.id,
      status: "completed",
    };
  }
}
