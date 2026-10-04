import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true }) name: string;
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;
  @Prop({ required: true, select: false }) passwordHash: string;
  @Prop({ trim: true }) phone?: string;
  @Prop({ enum: ["resident", "admin", "security"], default: "resident" })
  role: string;
  @Prop({ default: "Maple Heights" }) societyId: string;
  @Prop({ type: [{ name: String, relation: String }] }) familyMembers: Array<{
    name: string;
    relation: string;
  }>;
  @Prop({ type: [String] }) vehicles: string[];
  @Prop({ type: [String] }) pets: string[];
  @Prop({ type: [String] }) dailyHelp: string[];
  @Prop({ default: false }) shareContactDetails: boolean;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
