import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<UserMongo>;

@Schema({
  collection: 'users',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class UserMongo {
  @Prop({ required: true, trim: true, minlength: 3, maxlength: 120 })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: false, trim: true })
  document?: string;

  @Prop({ required: true, enum: ['manual', 'import'], default: 'manual' })
  source: 'manual' | 'import';

  @Prop({ required: false, trim: true })
  external_ref?: string;

  @Prop({ type: Date, required: false, default: null })
  deleted_at?: Date | null;

  created_at: Date;
  updated_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserMongo);

UserSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { deleted_at: null },
  },
);

UserSchema.index(
  { document: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { deleted_at: null },
  },
);
