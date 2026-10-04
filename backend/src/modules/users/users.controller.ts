import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IsArray, IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { User } from './user.schema';

class UpdateProfileDto {
  @IsOptional() @IsString() @MinLength(2) name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsArray() familyMembers?: Array<{ name: string; relation: string }>;
  @IsOptional() @IsArray() vehicles?: string[];
  @IsOptional() @IsArray() pets?: string[];
  @IsOptional() @IsArray() dailyHelp?: string[];
  @IsOptional() @IsBoolean() shareContactDetails?: boolean;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(@InjectModel(User.name) private readonly users: Model<User>) {}

  @Get('me')
  async me(@Req() req: any) {
    return this.users.findById(req.user.sub).select('-passwordHash').lean();
  }

  @Put('me')
  async update(@Req() req: any, @Body() body: UpdateProfileDto) {
    return this.users.findByIdAndUpdate(req.user.sub, { $set: body }, { new: true, runValidators: true }).select('-passwordHash').lean();
  }
}
