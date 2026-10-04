import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, minimize: false })
export class CommunityRecord {
  @Prop({ required: true, index: true }) kind: string;
  @Prop({ required: true, index: true }) ownerId: string;
  @Prop({ required: true, index: true }) societyId: string;
  @Prop({ required: true, trim: true }) title: string;
  @Prop({ default: '' }) description: string;
  @Prop({ default: 'open', index: true }) status: string;
  @Prop({ type: MongooseSchema.Types.Mixed, default: {} }) data: Record<string, unknown>;
}

export type CommunityRecordDocument = HydratedDocument<CommunityRecord>;
export const CommunityRecordSchema = SchemaFactory.createForClass(CommunityRecord);
CommunityRecordSchema.index({ kind: 1, societyId: 1, createdAt: -1 });
CommunityRecordSchema.index({ kind: 1, ownerId: 1, createdAt: -1 });
