import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ImportJobDocument = HydratedDocument<ImportJobMongo>;

@Schema({
  collection: 'import_jobs',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class ImportJobMongo {
  @Prop({ required: true, trim: true })
  filename: string;

  @Prop({
    required: true,
    enum: ['pending', 'processing', 'completed', 'completed_with_errors', 'failed'],
    default: 'pending',
  })
  status: 'pending' | 'processing' | 'completed' | 'completed_with_errors' | 'failed';

  @Prop({ required: true, min: 0 })
  total_rows: number;

  @Prop({ required: true, min: 0, default: 0 })
  processed_rows: number;

  @Prop({ required: true, min: 0, default: 0 })
  success_rows: number;

  @Prop({ required: true, min: 0, default: 0 })
  error_rows: number;

  @Prop({ required: true, default: () => new Date() })
  started_at: Date;

  @Prop({ type: Date, required: false, default: null })
  finished_at?: Date | null;

  created_at: Date;
  updated_at: Date;
}

export const ImportJobSchema = SchemaFactory.createForClass(ImportJobMongo);
