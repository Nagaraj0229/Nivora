import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/jwt.strategy';
import { User, UserSchema } from '../users/user.schema';
import { CommunityRecord, CommunityRecordSchema } from './community-record.schema';
import { ResourcesController } from './resources.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: CommunityRecord.name, schema: CommunityRecordSchema }, { name: User.name, schema: UserSchema }]), JwtModule.register({})],
  controllers: [ResourcesController], providers: [JwtStrategy, PaymentsService],
})
export class ResourcesModule {}
