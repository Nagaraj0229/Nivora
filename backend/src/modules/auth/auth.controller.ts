import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { IsEmail } from "class-validator";
import { Model } from "mongoose";
import { AuthService } from "./auth.service";
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from "./auth.dto";
import { User } from "../users/user.schema";

class LogoutDto {
  @IsEmail() email: string;
}

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
    @InjectModel(User.name) private readonly users: Model<User>,
  ) {}
  @Post("register") register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }
  @Post("login") @HttpCode(HttpStatus.OK) login(@Body() body: LoginDto) {
    return this.auth.login(body);
  }
  @Post("logout") @HttpCode(HttpStatus.OK) logout() {
    return {
      success: true,
      message: "Remove the bearer token from the client to sign out.",
    };
  }
  @Post("forgot-password") @HttpCode(HttpStatus.ACCEPTED) async forgot(
    @Body() body: ForgotPasswordDto,
  ) {
    // Deliberately uniform to avoid exposing whether an email has an account.
    const configured = Boolean(this.config.get("PASSWORD_RESET_DELIVERY_URL"));
    if (configured)
      await this.users.exists({ email: body.email.toLowerCase().trim() });
    return {
      accepted: true,
      message:
        "Account recovery will be available after a verified password-reset delivery provider is connected.",
    };
  }
  @Post("reset-password") @HttpCode(HttpStatus.NOT_IMPLEMENTED) reset(
    @Body() _body: ResetPasswordDto,
  ) {
    return {
      statusCode: 501,
      message:
        "Password reset requires a configured, verified email delivery provider.",
    };
  }
}
