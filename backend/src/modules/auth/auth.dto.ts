import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString() @MinLength(2) name: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsOptional() @IsString() phone?: string;
}

export class LoginDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
}

export class ForgotPasswordDto { @IsEmail() email: string; }
export class ResetPasswordDto {
  @IsEmail() email: string;
  @IsString() token: string;
  @IsString() @MinLength(8) password: string;
}
