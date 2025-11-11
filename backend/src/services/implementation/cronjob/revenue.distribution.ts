import { injectable, inject } from 'tsyringe';
import cron from 'node-cron';
import { logger } from '../../../utils/logger'
import { IRevenueDistributionCronService, IRevenueDistributionService } from '../../../services/interfaces/IDistribution.service';

@injectable()
export class RevenueDistributionCronService implements IRevenueDistributionCronService {
  constructor(
    @inject("RevenueDistributionService") private revenueDistributionService: IRevenueDistributionService,
  ) { }

  startCronJob(): void {
    cron.schedule('*/30 * * * *', async () => {
      logger.info('Starting revenue distribution job (every 5 minutes)');

      try {
        const result = await this.revenueDistributionService.processFinishedEvents();

        if (result.success) {
          logger.info(`Revenue distribution job completed successfully: ${result.message}`);
        } else {
          logger.error(`Revenue distribution job failed: ${result.message}`);
        }
      } catch (error) {
        logger.error(`Error running revenue distribution job: ${(error as Error).message}`);
      }
    });

    logger.info('Revenue distribution cron job scheduled to run every 5 minutes');
  }
}