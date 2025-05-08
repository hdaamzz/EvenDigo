import { injectable, inject } from 'tsyringe';
import cron from 'node-cron';
import {logger} from '../../../utils/logger'
import { IRevenueDistributionCronService, IRevenueDistributionService } from '../../../../src/services/interfaces/IDistribution.service';

@injectable()
export class RevenueDistributionCronService implements IRevenueDistributionCronService{
  constructor(
    @inject("RevenueDistributionService") private revenueDistributionService: IRevenueDistributionService,
  ) {}

  startCronJob(): void {
    cron.schedule('15 * * * *', async () => {
      logger.info('Starting daily revenue distribution job');
      
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

    logger.info('Revenue distribution cron job scheduled to run daily at midnight (12 AM)');
  }
}