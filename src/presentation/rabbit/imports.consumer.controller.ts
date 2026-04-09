import { Controller, Logger } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { ProcessImportUserRowUseCase } from '../../application/imports/use-cases/process-import-user-row.usecase';
import { QUEUES } from '../../shared/constants/queues';
import { ImportUserRowMessage } from '../../domain/imports/import-job-item.entity';

@Controller()
export class ImportsConsumerController {
  private readonly logger = new Logger(ImportsConsumerController.name);

  constructor(
    private readonly processImportUserRowUseCase: ProcessImportUserRowUseCase,
  ) {}

  @MessagePattern(QUEUES.IMPORT_USERS_PATTERN)
  async handleImportRow(
    @Payload() message: ImportUserRowMessage,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    try {
      await this.processImportUserRowUseCase.execute(message);
    } catch (error) {
      this.logger.error(
        `Error processing row ${message.row_number} from job ${message.job_id}: ${String(error)}`,
      );
    } finally {
      const channel = context.getChannelRef();
      const originalMessage = context.getMessage();
      channel.ack(originalMessage);
    }
  }
}
