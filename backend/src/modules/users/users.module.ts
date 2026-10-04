import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { UsersController } from "./users.controller";
import { User, UserSchema } from "./user.schema";
import { JwtStrategy } from "../auth/jwt.strategy";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({}),
  ],
  controllers: [UsersController],
  providers: [JwtStrategy],
})
export class UsersModule {}
