import { injectable, inject } from 'tsyringe';
import cron from 'node-cron';
import { Logger } from 'logger';
import { IRevenueDistributionCronService, IRevenueDistributionService } from '../../../../src/services/interfaces/IDistribution.service';

@injectable()
export class RevenueDistributionCronService implements IRevenueDistributionCronService{
  constructor(
    @inject("RevenueDistributionService") private revenueDistributionService: IRevenueDistributionService,
    @inject("Logger") private logger: Logger
  ) {}

  startCronJob(): void {
    // Run every minute for testing purposes
    cron.schedule('* * * * *', async () => {
      this.logger.info('Starting daily revenue distribution job');
      
      try {
        const result = await this.revenueDistributionService.processFinishedEvents();
        
        if (result.success) {
          this.logger.info(`Revenue distribution job completed successfully: ${result.message}`);
        } else {
          this.logger.error(`Revenue distribution job failed: ${result.message}`);
        }
      } catch (error) {
        this.logger.error(`Error running revenue distribution job: ${(error as Error).message}`);
      }
    });

    this.logger.info('Revenue distribution cron job scheduled for testing (running every minute)');
  }
}