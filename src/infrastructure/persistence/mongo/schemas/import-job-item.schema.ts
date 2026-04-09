import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ImportJobItemDocument = HydratedDocument<ImportJobItemMongo>;

@Schema({
  collection: 'import_job_items',
  timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class ImportJobItemMongo {
  @Prop({ type: Types.ObjectId, required: true, ref: 'ImportJobMongo' })
  job_id: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  row_number: number;

  @Prop({ required: true, type: Object })
  payload: Record<string, unknown>;

  @Prop({ required: true, enum: ['success', 'error'] })
  status: 'success' | 'error';

  @Prop({ required: false })
  error_code?: string;

  @Prop({ required: false })
  error_message?: string;

  created_at: Date;
}

export const ImportJobItemSchema = SchemaFactory.createForClass(ImportJobItemMongo);

ImportJobItemSchema.index({ job_id: 1, row_number: 1 }, { unique: true });
ImportJobItemSchema.index({ job_id: 1, status: 1 });
