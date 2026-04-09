import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ImportPublisherPort } from '../../../application/imports/ports/import-publisher.port';
import { ImportUserRowMessage } from '../../../domain/imports/import-job-item.entity';
import { QUEUES } from '../../../shared/constants/queues';

@Injectable()
export class RabbitImportPublisherAdapter implements ImportPublisherPort {
  constructor(
    @Inject(QUEUES.IMPORT_USERS_QUEUE)
    private readonly client: ClientProxy,
  ) {}

  async publishImportRow(message: ImportUserRowMessage): Promise<void> {
    await firstValueFrom(
      this.client.emit(QUEUES.IMPORT_USERS_PATTERN, message),
    );
  }
}
