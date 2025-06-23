import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ZegoService } from '../../../core/services/utility/zego.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LivestreamService } from '../../../core/services/user/stream/livestream.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { UserNavComponent } from "../../../shared/user-nav/user-nav.component";
import { ZegoConfig } from '../../../core/interfaces/user/zego';

@Component({
  selector: 'app-live-stream',
  imports: [CommonModule, UserNavComponent],
  templateUrl: './live-stream.component.html',
  styleUrl: './live-stream.component.css'
})
export class LiveStreamComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('streamContainer', { static: false }) streamContainer!: ElementRef;

  eventId = '';
  userRole: 'host' | 'audience' = 'audience';

  isLoading = true;
  error: string | null = null;
  loadingMessage = 'Initializing stream...';
  zegoInitialized = false;
  isStreamLive = false;
  viewerCount = 0;
  streamStartTime: Date | null = null;
  streamDuration = '00:00:00';

  private readonly subscriptions: Subscription[] = [];
  private durationInterval?: number;
  private streamConfig: ZegoConfig | null = null;
  private initializationRetryCount = 0;
  private readonly maxRetries = 3;
  private viewInitialized = false;
  private containerCheckInterval?: number;
  private initializationInProgress = false;
  
  private readonly maxContainerAttempts = 30;
  private readonly containerCheckDelay = 100;
  private readonly retryBaseDelay = 2000;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly zegoService: ZegoService,
    private readonly livestreamService: LivestreamService
  ) {}

  ngOnInit(): void {
    this.initializeFromRoute();
    this.subscribeToLiveStreamStatus();
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    
    setTimeout(() => {
      this.ensureContainerReady();
    }, this.containerCheckDelay);
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private async ensureContainerReady(): Promise<void> {
    if (this.initializationInProgress) {
      return;
    }

    let attempts = 0;

    const checkContainer = async (): Promise<boolean> => {
      if (this.zegoInitialized || this.error) {
        return true;
      }

      if (this.streamContainer?.nativeElement) {
        const element = this.streamContainer.nativeElement;
        
        // Force layout calculation
        element.style.display = 'block';
        element.offsetHeight;

        if (element.offsetWidth > 0 && element.offsetHeight > 0) {
          await this.tryInitializeStream();
          return true;
        }
      }
      
      return false;
    };

    this.containerCheckInterval = window.setInterval(async () => {
      attempts++;
      
      if (await checkContainer()) {
        this.clearContainerCheckInterval();
      } else if (attempts >= this.maxContainerAttempts) {
        this.clearContainerCheckInterval();
        
        if (!this.zegoInitialized && !this.error) {
          this.handleContainerInitializationFailure();
        }
      }
    }, this.containerCheckDelay);
  }

  private clearContainerCheckInterval(): void {
    if (this.containerCheckInterval) {
      clearInterval(this.containerCheckInterval);
      this.containerCheckInterval = undefined;
    }
  }

  private handleContainerInitializationFailure(): void {
    this.error = 'Failed to initialize stream container. Please refresh the page.';
    this.isLoading = false;
  }

  private async tryInitializeStream(): Promise<void> {
    if (!this.canInitializeStream()) {
      return;
    }

    if (this.initializationRetryCount >= this.maxRetries) {
      this.handleMaxRetriesReached();
      return;
    }

    this.initializationInProgress = true;

    try {
      await this.performStreamInitialization();
      this.handleSuccessfulInitialization();
      
    } catch (error) {
      await this.handleInitializationError(error);
    } finally {
      if (this.shouldStopInitializationProgress()) {
        this.initializationInProgress = false;
      }
    }
  }

  private canInitializeStream(): boolean {
    return this.viewInitialized && !this.zegoInitialized && !this.initializationInProgress;
  }

  private handleMaxRetriesReached(): void {
    this.error = 'Failed to initialize stream after multiple attempts. Please refresh the page.';
    this.isLoading = false;
  }

  private async performStreamInitialization(): Promise<void> {
    if (!this.streamContainer?.nativeElement) {
      throw new Error('Stream container not available');
    }

    const containerElement = this.streamContainer.nativeElement;
    this.setupContainerElement(containerElement);

    if (!this.streamConfig) {
      this.loadingMessage = 'Loading stream configuration...';
      await this.loadStreamConfig();
      
      if (!this.streamConfig) {
        throw new Error('Failed to load stream configuration');
      }
    }

    this.loadingMessage = 'Connecting to stream...';
    
    await this.zegoService.forceCleanup();
    await this.delay(200);
    await this.zegoService.initializeZego(this.streamConfig, containerElement);
  }

  private handleSuccessfulInitialization(): void {
    this.zegoInitialized = true;
    this.isLoading = false;
    this.loadingMessage = '';
    this.initializationRetryCount = 0;
    this.error = null;
    this.checkStreamStatus();
  }

  private async handleInitializationError(error: unknown): Promise<void> {
    this.initializationRetryCount++;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    this.error = `Failed to connect to stream: ${errorMessage}`;
    
    if (this.initializationRetryCount < this.maxRetries) {
      await this.scheduleRetry();
    } else {
      this.finalizeFailedInitialization();
    }
  }

  private async scheduleRetry(): Promise<void> {
    const delay = this.retryBaseDelay * this.initializationRetryCount;
    this.loadingMessage = `Retrying in ${delay / 1000} seconds...`;
    
    setTimeout(() => {
      this.error = null;
      this.loadingMessage = 'Retrying connection...';
      this.initializationInProgress = false;
      this.tryInitializeStream();
    }, delay);
  }

  private finalizeFailedInitialization(): void {
    this.isLoading = false;
    this.loadingMessage = '';
    this.initializationInProgress = false;
  }

  private shouldStopInitializationProgress(): boolean {
    return this.initializationRetryCount >= this.maxRetries || this.zegoInitialized;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private setupContainerElement(element: HTMLElement): void {
    element.innerHTML = '';
    
    const style = element.style;
    Object.assign(style, {
      width: '100%',
      height: '600px',
      minHeight: '400px',
      maxHeight: '600px',
      position: 'relative',
      backgroundColor: '#000000',
      display: 'block',
      visibility: 'visible',
      overflow: 'hidden',
      border: 'none',
      outline: 'none'
    });
    
    element.setAttribute('data-stream-container', 'true');
    element.id = 'streamContainer';
    
    // Force layout calculations
    element.offsetHeight;
    element.offsetWidth;
    
    setTimeout(() => {
      element.offsetHeight;
    }, 50);
  }

  private initializeFromRoute(): void {
    this.eventId = this.route.snapshot.queryParamMap.get('eventId') || 
                  this.route.snapshot.paramMap.get('eventId') || '';
    this.userRole = (this.route.snapshot.queryParamMap.get('role') as 'host' | 'audience') || 'audience';

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;

    if (state?.['token'] && state?.['roomId']) {
      this.streamConfig = {
        appId: 21216645,
        token: state['token'],
        roomId: state['roomId'],
        userId: this.generateUserId(),
        userName: this.generateUserName(),
        role: this.userRole
      };
    }

    if (!this.eventId) {
      this.error = 'Invalid event ID';
      this.isLoading = false;
    }
  }

  private async loadStreamConfig(): Promise<void> {
    try {
      const response = await this.getStreamConfigResponse();

      if (response?.success && response.data) {
        this.streamConfig = {
          appId: environment.zegoAppId,
          token: response.data.token,
          roomId: response.data.roomId,
          userId: this.generateUserId(),
          userName: this.generateUserName(),
          role: this.userRole
        };
      } else {
        throw new Error(response?.message || 'Failed to get stream configuration');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.error = `Failed to load stream: ${errorMsg}`;
      this.isLoading = false;
      throw error;
    }
  }

  private async getStreamConfigResponse(): Promise<any> {
    if (this.userRole === 'host') {
      return await this.livestreamService.startLiveStream(this.eventId).toPromise();
    }

    const statusResponse = await this.livestreamService.getLiveStreamStatus(this.eventId).toPromise();
    
    if (!statusResponse?.success) {
      throw new Error('Unable to get stream status');
    }
    
    if (!statusResponse.data?.isLive) {
      throw new Error('This stream is not currently live. Please wait for the host to start streaming.');
    }
    
    // Wait before joining to ensure stream is ready
    await this.delay(1000);
    
    return await this.livestreamService.joinLiveStream(this.eventId).toPromise();
  }

  private subscribeToLiveStreamStatus(): void {
    const statusSub = this.livestreamService.liveStreamStatus$.subscribe(status => {
      this.isStreamLive = status.isLive;
      this.viewerCount = status.viewerCount;
      
      if (status.isLive && status.startTime && !this.streamStartTime) {
        this.streamStartTime = status.startTime instanceof Date 
          ? status.startTime 
          : new Date(status.startTime);
        this.startDurationTimer();
      } else if (!status.isLive) {
        this.streamStartTime = null;
        this.stopDurationTimer();
      }
    });
    
    this.subscriptions.push(statusSub);
  }

  private checkStreamStatus(): void {
    this.livestreamService.getLiveStreamStatus(this.eventId).subscribe({
      next: (response) => {
        if (response.success) {
          this.livestreamService.updateLiveStreamStatus(response.data);
        }
      },
      error: (error) => {
      }
    });
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateUserName(): string {
    return this.userRole === 'host' ? 'Host' : `Viewer_${Math.random().toString(36).substr(2, 4)}`;
  }

  private startDurationTimer(): void {
    this.stopDurationTimer();
    
    this.durationInterval = window.setInterval(() => {
      if (this.streamStartTime instanceof Date) {
        try {
          const now = new Date();
          const diff = now.getTime() - this.streamStartTime.getTime();
          this.streamDuration = this.formatDuration(diff);
        } catch (error) {
          this.streamDuration = '00:00:00';
        }
      }
    }, 1000);
  }

  private stopDurationTimer(): void {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = undefined;
    }
  }

  private formatDuration(milliseconds: number): string {
    if (isNaN(milliseconds) || milliseconds < 0) {
      return '00:00:00';
    }
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  goBack(role:string): void {
    if(role=='host'){
      this.router.navigate(['/dashboard']);
    }else{
      this.router.navigate(['/profile/bookings']); 
    }
    
  }

  async retryConnection(): Promise<void> {
    this.resetComponentState();
    
    try {
      await this.zegoService.forceCleanup();
    } catch (error) {
    }
    
    setTimeout(() => {
      this.ensureContainerReady();
    }, 1000);
  }

  private resetComponentState(): void {
    this.error = null;
    this.isLoading = true;
    this.zegoInitialized = false;
    this.streamConfig = null;
    this.initializationRetryCount = 0;
    this.initializationInProgress = false;
    this.loadingMessage = 'Retrying connection...';
    
    this.clearContainerCheckInterval();
  }

  async endStream(): Promise<void> {
    if (this.userRole !== 'host') {
      return;
    }
    
    try {
      const response = await this.livestreamService.endLiveStream(this.eventId).toPromise();
      
      if (response?.success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.error = `Failed to end stream: ${response?.message || 'Unknown error'}`;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.error = `Failed to end stream: ${errorMessage}`;
    }
  }

  private async cleanup(): Promise<void> {
    this.clearContainerCheckInterval();
    
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.stopDurationTimer();
    
    try {
      await this.zegoService.forceCleanup();
    } catch (error) {
    }
  }
}