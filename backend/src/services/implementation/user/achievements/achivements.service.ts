import { IAchievement } from "../../../../models/interfaces/achievements.interface";
import { IUserAchievementRepository } from "../../../../repositories/interfaces/IBadge.repository";
import { IEventRepository } from "../../../../repositories/interfaces/IEvent.repository";
import { IUserRepository } from "../../../../repositories/interfaces/IUser.repository";
import { IUserAchievementService } from "../../../../services/interfaces/IAchievement";
import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../../repositories/interfaces/IBooking.repository";

@injectable()
export class UserAchievementService implements IUserAchievementService {
  constructor(
    @inject('UserAchievementRepository') private userAchievementRepository: IUserAchievementRepository,
    @inject("UserRepository") private userRepository: IUserRepository,
    @inject("EventRepository") private eventRepository: IEventRepository,
    @inject("BookingRepository") private bookingRepository: IBookingRepository
  ) {}

  async checkUserAchievements(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);    
    if (!user) throw new Error('User not found');

    const eventsCreated = await this.eventRepository.findDocumentCount(userId);
    await this.userAchievementRepository.checkAndAssignAchievement(
      userId, 
      'events_created', 
      eventsCreated
    );
    
    const userBookings = await this.bookingRepository.findBookingByUserId(userId);
    const completedBookings = userBookings.filter(booking => 
      booking.paymentStatus === "Completed" && 
      booking.tickets && 
      booking.tickets.some(ticket => ticket.status !== "Cancelled")
    );
    const eventsAttended = completedBookings.length;
    await this.userAchievementRepository.checkAndAssignAchievement(
      userId,
      'events_attended',
      eventsAttended
    );

    const vipBookings = userBookings.filter(booking => 
      booking.paymentStatus === "Completed" && 
      booking.tickets && 
      booking.tickets.some(ticket => 
        ticket.type && 
        ticket.type.toLowerCase() === "vip" && 
        ticket.status !== "Cancelled"
      )
    );
    const vipEventsCount = vipBookings.length;
    await this.userAchievementRepository.checkAndAssignAchievement(
      userId,
      'vip_events_taker',
      vipEventsCount
    );

    const goldBookings = userBookings.filter(booking => 
      booking.paymentStatus === "Completed" && 
      booking.tickets && 
      booking.tickets.some(ticket => 
        ticket.type && 
        ticket.type.toLowerCase() === "gold" && 
        ticket.status !== "Cancelled"
      )
    );
    const goldEventsCount = goldBookings.length;
    await this.userAchievementRepository.checkAndAssignAchievement(
      userId,
      'gold_events_taker',
      goldEventsCount
    );
  }

  async getUserAchievements(userId: string): Promise<IAchievement[]> {
    return this.userAchievementRepository.getUserAchievements(userId);
  }
}