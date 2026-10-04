import { IsDateString, IsIn, IsNumber, IsObject, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

export class CreateRecordDto {
  @IsString() @MaxLength(160) title: string;
  @IsOptional() @IsString() @MaxLength(4000) description?: string;
  @IsOptional() @IsObject() data?: Record<string, unknown>;
  @IsOptional() @IsString() @IsIn(['open','pending','approved','rejected','resolved','in-progress','completed']) status?: string;
  @IsOptional() @IsNumber() @Min(0) amount?: number;
  @IsOptional() @IsString() type?: string;
}

export class UpdateComplaintDto {
  @IsString() @IsIn(['open','in-progress','resolved']) status: string;
}

export class PayRequestDto {
  @IsString() invoiceId: string;
}

export class VerifyPaymentDto {
  @IsString() invoiceId: string;
  @IsString() razorpay_order_id: string;
  @IsString() razorpay_payment_id: string;
  @IsString() @Matches(/^[a-f\d]{64}$/i) razorpay_signature: string;
}

export class CreateInvoiceDto {
  @IsString() @MaxLength(160) title: string;
  @IsString() residentId: string;
  @IsNumber() @Min(1) amount: number;
  @IsOptional() @IsString() @IsIn(['maintenance','rent','utility']) type?: string;
  @IsDateString() dueDate: string;
}
