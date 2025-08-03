import { Component, OnInit } from '@angular/core';
import { EventAnalytics, EventAnalyticsService } from '../../../../core/services/user/dashboard/event.analytics.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserNavComponent } from "../../../../shared/user-nav/user-nav.component";
import { UserFooterComponent } from "../../../../shared/user-footer/user-footer.component";

@Component({
  selector: 'app-event-analytics',
  imports: [UserNavComponent, UserFooterComponent],
  templateUrl: './event-analytics.component.html',
  styleUrl: './event-analytics.component.css'
})
export class EventAnalyticsComponent implements OnInit {
analytics: EventAnalytics | null = null;
  loading = true;
  error: string | null = null;
  eventId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private analyticsService: EventAnalyticsService
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id') || '';
    if (this.eventId) {
      this.loadAnalytics();
    } else {
      this.error = 'Invalid event ID';
      this.loading = false;
    }
  }

  private loadAnalytics(): void {
    this.analyticsService.getEventAnalytics(this.eventId).subscribe({
      next: (response) => {
        if (response.success) {
          this.analytics = response.data;
        } else {
          this.error = response.message || 'Failed to load analytics';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load analytics data';
        this.loading = false;
        console.error('Analytics error:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getTicketSoldPercentage(soldTickets: number, totalTickets: number): number {
    return totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0;
  }
}
