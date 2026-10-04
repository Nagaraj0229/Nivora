import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { JwtAuthGuard } from "../../common/jwt-auth.guard";
import { User } from "../users/user.schema";
import { CommunityRecord } from "./community-record.schema";
import {
  CreateInvoiceDto,
  CreateRecordDto,
  PayRequestDto,
  UpdateComplaintDto,
  VerifyPaymentDto,
} from "./resource.dto";
import { PaymentsService } from "./payments.service";

@Controller()
@UseGuards(JwtAuthGuard)
export class ResourcesController {
  constructor(
    @InjectModel(CommunityRecord.name)
    private readonly records: Model<CommunityRecord>,
    @InjectModel(User.name) private readonly users: Model<User>,
    private readonly paymentsService: PaymentsService,
  ) {}

  private create(
    req: any,
    kind: string,
    body: CreateRecordDto,
    visibility: "owner" | "society" = "owner",
  ) {
    const scope = { ownerId: req.user.sub, societyId: req.user.societyId };
    return this.records.create({
      kind,
      ownerId: scope.ownerId,
      societyId: scope.societyId,
      title: body.title,
      description: body.description || "",
      status: body.status || "open",
      data: {
        ...(body.data || {}),
        ...(body.amount === undefined ? {} : { amount: body.amount }),
        ...(body.type ? { type: body.type } : {}),
      },
    });
  }

  private list(
    req: any,
    kind: string,
    visibility: "owner" | "society" = "owner",
  ) {
    return this.records
      .find(
        visibility === "society"
          ? { kind, societyId: req.user.societyId }
          : { kind, ownerId: req.user.sub },
      )
      .sort({ createdAt: -1 })
      .lean();
  }

  private async getOwned(
    req: any,
    kind: string,
    id: string,
    visibility: "owner" | "society" = "owner",
  ) {
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException("Record not found.");
    const scope =
      visibility === "society"
        ? { societyId: req.user.societyId }
        : { ownerId: req.user.sub };
    const record = await this.records
      .findOne({ _id: id, kind, ...scope })
      .lean();
    if (!record) throw new NotFoundException("Record not found.");
    return record;
  }
  private requireAdmin(req: any) {
    if (req.user.role !== "admin")
      throw new ForbiddenException(
        "Only society administrators can publish this content.",
      );
  }

  // Visitor passes
  @Post("visitors/pre-approve") preApprove(
    @Req() req: any,
    @Body() body: CreateRecordDto,
  ) {
    return this.create(req, "visitor", body);
  }
  @Get("visitors") visitors(@Req() req: any) {
    return this.list(req, "visitor");
  }
  @Get("visitors/:id") visitor(@Req() req: any, @Param("id") id: string) {
    return this.getOwned(req, "visitor", id);
  }
  @Delete("visitors/:id") async removeVisitor(
    @Req() req: any,
    @Param("id") id: string,
  ) {
    await this.getOwned(req, "visitor", id);
    await this.records.deleteOne({
      _id: id,
      kind: "visitor",
      ownerId: req.user.sub,
    });
    return { success: true };
  }

  // Payments use Razorpay test-mode credentials from the backend environment.
  @Get("payments") payments(@Req() req: any) {
    return this.list(req, "payment");
  }
  @Get("payments/invoice/:id") invoice(
    @Req() req: any,
    @Param("id") id: string,
  ) {
    return this.getOwned(req, "payment", id);
  }
  @Post("payments/invoices") async createInvoice(
    @Req() req: any,
    @Body() body: CreateInvoiceDto,
  ) {
    this.requireAdmin(req);
    if (!Types.ObjectId.isValid(body.residentId))
      throw new NotFoundException("Resident not found.");
    const resident = await this.users
      .findOne({ _id: body.residentId, societyId: req.user.societyId })
      .select("_id")
      .lean();
    if (!resident)
      throw new NotFoundException("Resident not found in this community.");
    return this.records.create({
      kind: "payment",
      ownerId: body.residentId,
      societyId: req.user.societyId,
      title: body.title,
      description: `${body.type || "maintenance"} · Due ${body.dueDate}`,
      status: "pending",
      data: {
        amount: body.amount,
        currency: "INR",
        type: body.type || "maintenance",
        dueDate: body.dueDate,
      },
    });
  }
  @Post("payments/pay") pay(@Req() req: any, @Body() body: PayRequestDto) {
    return this.paymentsService.createOrder(req.user, body.invoiceId);
  }
  @Post("payments/verify") @HttpCode(HttpStatus.OK) verifyPayment(
    @Req() req: any,
    @Body() body: VerifyPaymentDto,
  ) {
    return this.paymentsService.verify(req.user, body);
  }

  // Security requests and alerts
  @Post("security/alert") createAlert(
    @Req() req: any,
    @Body() body: CreateRecordDto,
  ) {
    return this.create(req, "security-alert", body, "society");
  }
  @Get("security/alerts") alerts(@Req() req: any) {
    return ["admin", "security"].includes(req.user.role)
      ? this.list(req, "security-alert", "society")
      : this.list(req, "security-alert");
  }
  @Get("security/alerts/:id") alert(@Req() req: any, @Param("id") id: string) {
    return this.getOwned(
      req,
      "security-alert",
      id,
      ["admin", "security"].includes(req.user.role) ? "society" : "owner",
    );
  }

  // Help desk tickets
  @Post("helpdesk/complaints") complaint(
    @Req() req: any,
    @Body() body: CreateRecordDto,
  ) {
    return this.create(req, "complaint", body, "society");
  }
  @Get("helpdesk/complaints") complaints(@Req() req: any) {
    return req.user.role === "admin"
      ? this.list(req, "complaint", "society")
      : this.list(req, "complaint");
  }
  @Get("helpdesk/complaints/:id") complaintDetails(
    @Req() req: any,
    @Param("id") id: string,
  ) {
    return this.getOwned(
      req,
      "complaint",
      id,
      req.user.role === "admin" ? "society" : "owner",
    );
  }
  @Put("helpdesk/complaints/:id") async updateComplaint(
    @Req() req: any,
    @Param("id") id: string,
    @Body() body: UpdateComplaintDto,
  ) {
    const visibility = req.user.role === "admin" ? "society" : "owner";
    await this.getOwned(req, "complaint", id, visibility);
    return this.records
      .findOneAndUpdate(
        {
          _id: id,
          kind: "complaint",
          ...(visibility === "society"
            ? { societyId: req.user.societyId }
            : { ownerId: req.user.sub }),
        },
        { $set: { status: body.status } },
        { new: true, runValidators: true },
      )
      .lean();
  }

  // Resident directory and society emergency contacts
  @Get("directory/residents") async residents(
    @Req() req: any,
    @Query("q") q = "",
  ) {
    const filter: any = {
      societyId: req.user.societyId,
      shareContactDetails: true,
    };
    if (q.trim())
      filter.$or = [
        { name: { $regex: q.trim(), $options: "i" } },
        { email: { $regex: q.trim(), $options: "i" } },
      ];
    return this.users.find(filter).select("name phone role").limit(50).lean();
  }
  @Get("directory/vehicles") async vehicles(
    @Req() req: any,
    @Query("q") q = "",
  ) {
    const filter: any = {
      societyId: req.user.societyId,
      vehicles: { $exists: true, $ne: [] },
    };
    if (q.trim())
      filter.vehicles = { $elemMatch: { $regex: q.trim(), $options: "i" } };
    return this.users.find(filter).select("name vehicles").limit(50).lean();
  }
  @Get("directory/emergency") emergency(@Req() req: any) {
    return this.list(req, "emergency-contact", "society");
  }
  @Post("directory/emergency") addEmergencyContact(
    @Req() req: any,
    @Body() body: CreateRecordDto,
  ) {
    this.requireAdmin(req);
    return this.create(req, "emergency-contact", body, "society");
  }

  // Home planner
  @Post("home-planner/reminders") reminder(
    @Req() req: any,
    @Body() body: CreateRecordDto,
  ) {
    return this.create(req, "reminder", body);
  }
  @Get("home-planner/reminders") reminders(@Req() req: any) {
    return this.list(req, "reminder");
  }
  @Delete("home-planner/reminders/:id") async deleteReminder(
    @Req() req: any,
    @Param("id") id: string,
  ) {
    await this.getOwned(req, "reminder", id);
    await this.records.deleteOne({
      _id: id,
      kind: "reminder",
      ownerId: req.user.sub,
    });
    return { success: true };
  }

  // Parking marketplace
  @Post("parking/rent") rentParking(
    @Req() req: any,
    @Body() body: CreateRecordDto,
  ) {
    return this.create(req, "parking", body);
  }
  @Get("parking/available") availableParking(@Req() req: any) {
    return this.records
      .find({ kind: "parking", societyId: req.user.societyId, status: "open" })
      .sort({ createdAt: -1 })
      .lean();
  }
  @Post("parking/book/:id") async bookParking(
    @Req() req: any,
    @Param("id") id: string,
  ) {
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException("Parking space not found.");
    const booked = await this.records
      .findOneAndUpdate(
        {
          _id: id,
          kind: "parking",
          societyId: req.user.societyId,
          status: "open",
          ownerId: { $ne: req.user.sub },
        },
        { $set: { status: "booked", "data.bookedBy": req.user.sub } },
        { new: true },
      )
      .lean();
    if (!booked)
      throw new NotFoundException("This parking space is no longer available.");
    return booked;
  }

  // Society notice board
  @Post("notice-board") createNotice(
    @Req() req: any,
    @Body() body: CreateRecordDto,
  ) {
    this.requireAdmin(req);
    return this.create(req, "notice", body, "society");
  }
  @Get("notice-board") notices(@Req() req: any) {
    return this.list(req, "notice", "society");
  }

  // Elections and surveys
  @Post("elections/surveys") createSurvey(
    @Req() req: any,
    @Body() body: CreateRecordDto,
  ) {
    this.requireAdmin(req);
    return this.create(req, "survey", body, "society");
  }
  @Get("elections/surveys") surveys(@Req() req: any) {
    return this.list(req, "survey", "society");
  }
  @Post("elections/vote/:id") async vote(
    @Req() req: any,
    @Param("id") id: string,
    @Body("option") option: string,
  ) {
    const survey = await this.getOwned(req, "survey", id, "society");
    if (!option?.trim())
      throw new BadRequestException("An option is required.");
    const updated = await this.records
      .findOneAndUpdate(
        {
          _id: id,
          kind: "survey",
          societyId: req.user.societyId,
          "data.responses.userId": { $ne: req.user.sub },
        },
        {
          $push: {
            "data.responses": {
              userId: req.user.sub,
              option: option.trim(),
              createdAt: new Date(),
            },
          },
        },
        { new: true },
      )
      .lean();
    if (!updated)
      return {
        accepted: false,
        message: "You have already responded to this survey.",
      };
    return { accepted: true, survey: updated };
  }

  // Neighbor marketplace
  @Post("marketplace/items") createItem(
    @Req() req: any,
    @Body() body: CreateRecordDto,
  ) {
    return this.create(req, "market-item", body);
  }
  @Get("marketplace/items") items(@Req() req: any) {
    return this.list(req, "market-item", "society");
  }
  @Post("marketplace/buy/:id") async reserveItem(
    @Req() req: any,
    @Param("id") id: string,
  ) {
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException("Listing not found.");
    const item = await this.records
      .findOneAndUpdate(
        {
          _id: id,
          kind: "market-item",
          societyId: req.user.societyId,
          status: "open",
          ownerId: { $ne: req.user.sub },
        },
        { $set: { status: "reserved", "data.reservedBy": req.user.sub } },
        { new: true },
      )
      .lean();
    if (!item)
      throw new NotFoundException("This listing is no longer available.");
    return {
      item,
      message:
        "Listing reserved. Arrange payment directly with the seller; no payment was processed.",
    };
  }

  // Apartment listings
  @Post("homes/list") createHome(
    @Req() req: any,
    @Body() body: CreateRecordDto,
  ) {
    return this.create(req, "home", body, "society");
  }
  @Get("homes") homes(@Req() req: any) {
    return this.list(req, "home", "society");
  }
  @Get("homes/:id") home(@Req() req: any, @Param("id") id: string) {
    return this.getOwned(req, "home", id, "society");
  }

  // Community conversations, support and service requests
  @Post("community/posts") createPost(
    @Req() req: any,
    @Body() body: CreateRecordDto,
  ) {
    return this.create(req, "community-post", body, "society");
  }
  @Get("community/posts") posts(@Req() req: any) {
    return this.list(req, "community-post", "society");
  }
  @Post("communications/messages") sendMessage(
    @Req() req: any,
    @Body() body: CreateRecordDto,
  ) {
    return this.create(req, "message", body);
  }
  @Get("communications/messages") messages(@Req() req: any) {
    return this.list(req, "message");
  }
  @Post("documents") addDocument(
    @Req() req: any,
    @Body() body: CreateRecordDto,
  ) {
    return this.create(req, "document-metadata", body);
  }
  @Get("documents") documents(@Req() req: any) {
    return this.list(req, "document-metadata");
  }
  @Post("support/feedback") feedback(
    @Req() req: any,
    @Body() body: CreateRecordDto,
  ) {
    return this.create(req, "feedback", body);
  }
  @Get("support/feedback") feedbackList(@Req() req: any) {
    return this.list(req, "feedback");
  }
  @Post("services/bookings") bookService(
    @Req() req: any,
    @Body() body: CreateRecordDto,
  ) {
    return this.create(req, "service-booking", body);
  }
  @Get("services/bookings") serviceBookings(@Req() req: any) {
    return this.list(req, "service-booking");
  }
  @Post("services/catalog") createServiceListing(
    @Req() req: any,
    @Body() body: CreateRecordDto,
  ) {
    this.requireAdmin(req);
    return this.create(req, "service-listing", body, "society");
  }
  @Get("services/catalog") serviceCatalog(
    @Req() req: any,
    @Query("category") category = "",
  ) {
    const filter: any = {
      kind: "service-listing",
      societyId: req.user.societyId,
      status: "open",
    };
    if (category.trim()) filter["data.category"] = category.trim();
    return this.records.find(filter).sort({ createdAt: -1 }).lean();
  }

  // Household exit permissions and locker listings
  @Post("security/exit-permissions") exitPermission(
    @Req() req: any,
    @Body() body: CreateRecordDto,
  ) {
    return this.create(req, "exit-permission", body);
  }
  @Get("security/exit-permissions") exitPermissions(@Req() req: any) {
    return this.list(req, "exit-permission");
  }
  @Post("locks/listings") listLock(
    @Req() req: any,
    @Body() body: CreateRecordDto,
  ) {
    return this.create(req, "locker", body, "society");
  }
  @Get("locks/available") availableLocks(@Req() req: any) {
    return this.records
      .find({ kind: "locker", societyId: req.user.societyId, status: "open" })
      .sort({ createdAt: -1 })
      .lean();
  }

  @Get("notifications") notifications(@Req() req: any) {
    return this.list(req, "notification", "society");
  }
  @Get("complex/overview") async overview(@Req() req: any) {
    const kinds = [
      "visitor",
      "payment",
      "complaint",
      "notice",
      "security-alert",
    ];
    const counts = await this.records.aggregate([
      { $match: { kind: { $in: kinds }, societyId: req.user.societyId } },
      { $group: { _id: "$kind", count: { $sum: 1 } } },
    ]);
    return {
      societyId: req.user.societyId,
      counts: Object.fromEntries(counts.map((item) => [item._id, item.count])),
    };
  }
}
