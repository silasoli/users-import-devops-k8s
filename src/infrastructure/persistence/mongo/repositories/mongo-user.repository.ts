import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreateUserEntityInput,
  UpdateUserEntityInput,
  UserEntity,
} from '../../../../domain/users/user.entity';
import { UserRepository } from '../../../../domain/users/user.repository';
import { PageResult } from '../../../../shared/types/pagination';
import { UserDocument, UserMongo } from '../schemas/user.schema';

@Injectable()
export class MongoUserRepository implements UserRepository {
  constructor(
    @InjectModel(UserMongo.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(input: CreateUserEntityInput): Promise<UserEntity> {
    const created = await this.userModel.create({
      ...input,
      source: input.source ?? 'manual',
      deleted_at: null,
    });

    return this.toEntity(created);
  }

  async findById(id: string): Promise<UserEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.userModel.findOne({
      _id: new Types.ObjectId(id),
      deleted_at: null,
    });

    return doc ? this.toEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await this.userModel.findOne({ email, deleted_at: null });
    return doc ? this.toEntity(doc) : null;
  }

  async findByDocument(document: string): Promise<UserEntity | null> {
    const doc = await this.userModel.findOne({ document, deleted_at: null });
    return doc ? this.toEntity(doc) : null;
  }

  async list(params: { page: number; limit: number }): Promise<PageResult<UserEntity>> {
    const page = Math.max(1, params.page);
    const limit = Math.min(100, Math.max(1, params.limit));
    const skip = (page - 1) * limit;

    const filter = { deleted_at: null };

    const [items, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      this.userModel.countDocuments(filter),
    ]);

    return {
      items: items.map((item) => this.toEntity(item)),
      total,
      page,
      limit,
    };
  }

  async update(id: string, input: UpdateUserEntityInput): Promise<UserEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const updates: Record<string, unknown> = {};

    if (input.name !== undefined) updates.name = input.name;
    if (input.email !== undefined) updates.email = input.email;

    if (input.document === null) {
      updates.$unset = { document: 1 };
    } else if (input.document !== undefined) {
      updates.document = input.document;
    }

    const updated = await this.userModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), deleted_at: null },
      updates,
      { new: true },
    );

    return updated ? this.toEntity(updated) : null;
  }

  async softDelete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const result = await this.userModel.updateOne(
      { _id: new Types.ObjectId(id), deleted_at: null },
      { $set: { deleted_at: new Date() } },
    );

    return result.modifiedCount > 0;
  }

  private toEntity(doc: UserDocument): UserEntity {
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      document: doc.document,
      source: doc.source,
      external_ref: doc.external_ref,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      deleted_at: doc.deleted_at,
    };
  }
}
