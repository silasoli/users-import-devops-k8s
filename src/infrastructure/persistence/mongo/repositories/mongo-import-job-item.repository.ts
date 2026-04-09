import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoServerError } from 'mongodb';
import { Model, Types } from 'mongoose';
import { ImportJobItemEntity } from '../../../../domain/imports/import-job-item.entity';
import { ImportJobItemRepository } from '../../../../domain/imports/import-job.repository';
import { PageResult } from '../../../../shared/types/pagination';
import {
  ImportJobItemDocument,
  ImportJobItemMongo,
} from '../schemas/import-job-item.schema';

@Injectable()
export class MongoImportJobItemRepository implements ImportJobItemRepository {
  constructor(
    @InjectModel(ImportJobItemMongo.name)
    private readonly importJobItemModel: Model<ImportJobItemDocument>,
  ) {}

  async create(item: {
    job_id: string;
    row_number: number;
    payload: Record<string, unknown>;
    status: 'success' | 'error';
    error_code?: string;
    error_message?: string;
  }): Promise<ImportJobItemEntity> {
    try {
      const created = await this.importJobItemModel.create({
        ...item,
        job_id: new Types.ObjectId(item.job_id),
      });

      return this.toEntity(created);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        const existent = await this.importJobItemModel.findOne({
          job_id: new Types.ObjectId(item.job_id),
          row_number: item.row_number,
        });

        if (existent) {
          return this.toEntity(existent);
        }
      }

      throw error;
    }
  }

  async listErrors(params: {
    job_id: string;
    page: number;
    limit: number;
  }): Promise<PageResult<ImportJobItemEntity>> {
    const page = Math.max(1, params.page);
    const limit = Math.min(200, Math.max(1, params.limit));
    const skip = (page - 1) * limit;

    if (!Types.ObjectId.isValid(params.job_id)) {
      return { items: [], total: 0, page, limit };
    }

    const filter = {
      job_id: new Types.ObjectId(params.job_id),
      status: 'error' as const,
    };

    const [items, total] = await Promise.all([
      this.importJobItemModel
        .find(filter)
        .sort({ row_number: 1 })
        .skip(skip)
        .limit(limit),
      this.importJobItemModel.countDocuments(filter),
    ]);

    return {
      items: items.map((item) => this.toEntity(item)),
      total,
      page,
      limit,
    };
  }

  private toEntity(doc: ImportJobItemDocument): ImportJobItemEntity {
    return {
      id: doc._id.toString(),
      job_id: doc.job_id.toString(),
      row_number: doc.row_number,
      payload: doc.payload,
      status: doc.status,
      error_code: doc.error_code,
      error_message: doc.error_message,
      created_at: doc.created_at,
    };
  }
}
