import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreateImportJobInput,
  ImportJobEntity,
  ImportJobStatus,
} from '../../../../domain/imports/import-job.entity';
import { ImportJobRepository } from '../../../../domain/imports/import-job.repository';
import {
  ImportJobDocument,
  ImportJobMongo,
} from '../schemas/import-job.schema';

@Injectable()
export class MongoImportJobRepository implements ImportJobRepository {
  constructor(
    @InjectModel(ImportJobMongo.name)
    private readonly importJobModel: Model<ImportJobDocument>,
  ) {}

  async create(input: CreateImportJobInput): Promise<ImportJobEntity> {
    const created = await this.importJobModel.create({
      filename: input.filename,
      total_rows: input.total_rows,
      processed_rows: 0,
      success_rows: 0,
      error_rows: 0,
      status: input.total_rows > 0 ? 'processing' : 'pending',
      started_at: new Date(),
      finished_at: null,
    });

    return this.toEntity(created);
  }

  async findById(id: string): Promise<ImportJobEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.importJobModel.findById(new Types.ObjectId(id));
    return doc ? this.toEntity(doc) : null;
  }

  async incrementProgress(
    id: string,
    outcome: 'success' | 'error',
  ): Promise<ImportJobEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const inc =
      outcome === 'success'
        ? { processed_rows: 1, success_rows: 1 }
        : { processed_rows: 1, error_rows: 1 };

    const updated = await this.importJobModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $inc: inc },
      { new: true },
    );

    return updated ? this.toEntity(updated) : null;
  }

  async updateStatus(id: string, status: ImportJobStatus): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;

    await this.importJobModel.updateOne(
      { _id: new Types.ObjectId(id) },
      {
        $set: {
          status,
          finished_at:
            status === 'completed' ||
            status === 'completed_with_errors' ||
            status === 'failed'
              ? new Date()
              : null,
        },
      },
    );
  }

  private toEntity(doc: ImportJobDocument): ImportJobEntity {
    return {
      id: doc._id.toString(),
      filename: doc.filename,
      status: doc.status,
      total_rows: doc.total_rows,
      processed_rows: doc.processed_rows,
      success_rows: doc.success_rows,
      error_rows: doc.error_rows,
      started_at: doc.started_at,
      finished_at: doc.finished_at,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };
  }
}
