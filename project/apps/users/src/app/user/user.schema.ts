import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  collection: 'users',
  timestamps: { createdAt: 'createdAt', updatedAt: false },
})
export class User {
  @Prop({ required: true, unique: true })
  public email!: string;

  @Prop({ required: true })
  public name!: string;

  @Prop({ required: true })
  public passwordHash!: string;

  @Prop()
  public avatarUrl?: string;

  public createdAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
