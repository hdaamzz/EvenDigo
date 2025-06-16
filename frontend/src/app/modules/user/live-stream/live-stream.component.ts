import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ZegoConfig, ZegoService } from '../../../core/services/utility/zego.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LivestreamService } from '../../../core/services/user/stream/livestream.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-live-stream',
  imports: [CommonModule],
  templateUrl: './live-stream.component.html',
  styleUrl: './live-stream.component.css'
})
export class LiveStreamComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('streamContainer', { static: false }) streamContainer!: ElementRef;

  eventId: string = '';
  userRole: 'host' | 'audience' = 'audience';

  isLoading = true;
  error: string | null = null;
  loadingMessage = 'Initializing stream...';
  zegoInitialized = false;
  isStreamLive = false;
  viewerCount = 0;
  streamStartTime: Date | null = null;
  streamDuration = '00:00';

  eventTitle = '';

  cameraEnabled = true;
  microphoneEnabled = true;

  private subscriptions: Subscription[] = [];
  private durationInterval?: number;
  private streamConfig: ZegoConfig | null = null;
  private initializationRetryCount = 0;
  private maxRetries = 3;
  private viewInitialized = false;
  private containerCheckInterval?: number;
  private initializationInProgress = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private zegoService: ZegoService,
    private livestreamService: LivestreamService
  ) {}

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.initializeFromRoute();
    this.subscribeToLiveStreamStatus();
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit called');
    this.viewInitialized = true;
    
    setTimeout(() => {
      this.ensureContainerReady();
    }, 100);
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private async ensureContainerReady(): Promise<void> {
    if (this.initializationInProgress) {
      console.log('Initialization already in progress, skipping...');
      return;
    }

    
    let attempts = 0;
    const maxAttempts = 30; 

    const checkContainer = async (): Promise<boolean> => {
      if (this.zegoInitialized || this.error) {
        return true;
      }

      if (this.streamContainer?.nativeElement) {
        const element = this.streamContainer.nativeElement;
        
        element.style.display = 'block';
        element.offsetHeight;
        
        console.log('Container check:', {
          offsetWidth: element.offsetWidth,
          offsetHeight: element.offsetHeight,
          clientWidth: element.clientWidth,
          clientHeight: element.clientHeight,
          display: getComputedStyle(element).display,
          visibility: getComputedStyle(element).visibility
        });

        if (element.offsetWidth > 0 && element.offsetHeight > 0) {
          console.log('Container is ready, initializing stream...');
          await this.tryInitializeStream();
          return true;
        }
      }
      
      return false;
    };

    this.containerCheckInterval = window.setInterval(async () => {
      attempts++;
      
      if (await checkContainer()) {
        if (this.containerCheckInterval) {
          clearInterval(this.containerCheckInterval);
          this.containerCheckInterval = undefined;
        }
      } else if (attempts >= maxAttempts) {
        if (this.containerCheckInterval) {
          clearInterval(this.containerCheckInterval);
          this.containerCheckInterval = undefined;
        }
        
        if (!this.zegoInitialized && !this.error) {
          console.error('Container failed to become ready within timeout');
          this.error = 'Failed to initialize stream container. Please refresh the page.';
          this.isLoading = false;
        }
      }
    }, 100);
  }

  private async tryInitializeStream(): Promise<void> {
    if (!this.viewInitialized || this.zegoInitialized || this.initializationInProgress) {
      return;
    }

    if (this.initializationRetryCount >= this.maxRetries) {
      this.error = 'Failed to initialize stream after multiple attempts. Please refresh the page.';
      this.isLoading = false;
      return;
    }

    this.initializationInProgress = true;

    try {
      console.log('Trying to initialize stream, attempt:', this.initializationRetryCount + 1);
      
      if (!this.streamContainer?.nativeElement) {
        throw new Error('Stream container not available');
      }

      const containerElement = this.streamContainer.nativeElement;
      
      this.setupContainerElement(containerElement);

      if (!this.streamConfig) {
        console.log('Stream config not available, loading config...');
        this.loadingMessage = 'Loading stream configuration...';
        await this.loadStreamConfig();
        if (!this.streamConfig) {
          throw new Error('Failed to load stream configuration');
        }
      }

      console.log('Initializing with config:', { ...this.streamConfig, token: '[REDACTED]' });
      this.loadingMessage = 'Connecting to stream...';
      
      await this.zegoService.forceCleanup();
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      await this.zegoService.initializeZego(this.streamConfig, containerElement);
      
      this.zegoInitialized = true;
      this.isLoading = false;
      this.loadingMessage = '';
      this.initializationRetryCount = 0;
      this.error = null;

      console.log('Stream initialized successfully');
      this.checkStreamStatus();
      
    } catch (error) {
      console.error('Stream initialization failed:', error);
      this.initializationRetryCount++;
      this.error = `Failed to connect to stream: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      if (this.initializationRetryCount < this.maxRetries) {
        const delay = 2000 * this.initializationRetryCount; // Increase delay
        console.log(`Retrying initialization in ${delay}ms...`);
        this.loadingMessage = `Retrying in ${delay/1000} seconds...`;
        
        setTimeout(() => {
          this.error = null;
          this.loadingMessage = 'Retrying connection...';
          this.initializationInProgress = false;
          this.tryInitializeStream();
        }, delay);
      } else {
        this.isLoading = false;
        this.loadingMessage = '';
        this.initializationInProgress = false;
      }
    } finally {
      if (this.initializationRetryCount >= this.maxRetries || this.zegoInitialized) {
        this.initializationInProgress = false;
      }
    }
  }

  private setupContainerElement(element: HTMLElement): void {
  element.innerHTML = '';
  
  const style = element.style;
  style.width = '100%';
  style.height = '600px';
  style.minHeight = '400px';
  style.maxHeight = '600px';
  style.position = 'relative';
  style.backgroundColor = '#111827';
  style.display = 'block';
  style.visibility = 'visible';
  style.overflow = 'hidden';
  style.border = 'none';
  style.outline = 'none';
  
  element.setAttribute('data-stream-container', 'true');
  element.id = 'streamContainer';
  
  element.offsetHeight;
  element.offsetWidth;
  
  setTimeout(() => {
    element.offsetHeight;
  }, 50);
  
  console.log('Container element setup complete:', {
    width: element.offsetWidth,
    height: element.offsetHeight,
    display: getComputedStyle(element).display,
    visibility: getComputedStyle(element).visibility,
    position: getComputedStyle(element).position
  });
}
  private initializeFromRoute(): void {
    this.eventId = this.route.snapshot.queryParamMap.get('eventId') || 
                  this.route.snapshot.paramMap.get('eventId') || '';
    this.userRole = (this.route.snapshot.queryParamMap.get('role') as 'host' | 'audience') || 'audience';

    console.log('Route params:', { eventId: this.eventId, userRole: this.userRole });

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;

    console.log('Navigation state:', state);

    if (state?.['token'] && state?.['roomId']) {
      this.streamConfig = {
        appId: 21216645,
        token: state['token'],
        roomId: state['roomId'],
        userId: this.generateUserId(),
        userName: this.generateUserName(),
        role: this.userRole
      };
      console.log('Stream config loaded from navigation state');
    }

    if (!this.eventId) {
      this.error = 'Invalid event ID';
      this.isLoading = false;
      return;
    }
  }

  private async loadStreamConfig(): Promise<void> {
    try {
      console.log(`Loading stream config for ${this.userRole} role...`);
      
      let response;
      if (this.userRole === 'host') {
        response = await this.livestreamService.startLiveStream(this.eventId).toPromise();        
      } else {
        response = await this.livestreamService.joinLiveStream(this.eventId).toPromise();
      }

      console.log('Stream config response:', response);

      if (response?.success && response.data) {
        this.streamConfig = {
          appId: 21216645,
          token: response.data.token,
          roomId: response.data.roomId,
          userId: this.generateUserId(),
          userName: this.generateUserName(),
          role: this.userRole
        };
        console.log('Stream config loaded from API');
      } else {
        throw new Error(response?.message || 'Failed to get stream configuration');
      }
    } catch (error) {
      console.error('Failed to load stream configuration:', error);
      this.error = `Failed to load stream: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.isLoading = false;
      throw error;
    }
  }

  private subscribeToLiveStreamStatus(): void {
  const statusSub = this.livestreamService.liveStreamStatus$.subscribe(status => {
    console.log('Live stream status update:', status);
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
    console.log('Checking stream status...');
    this.livestreamService.getLiveStreamStatus(this.eventId).subscribe({
      next: (response) => {
        console.log('Stream status response:', response);
        if (response.success) {
          this.livestreamService.updateLiveStreamStatus(response.data);
        }
      },
      error: (error) => {
        console.error('Failed to get stream status:', error);
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
  // Clear any existing timer first
  this.stopDurationTimer();
  
  this.durationInterval = window.setInterval(() => {
    if (this.streamStartTime && this.streamStartTime instanceof Date) {
      try {
        const now = new Date();
        const diff = now.getTime() - this.streamStartTime.getTime();
        this.streamDuration = this.formatDuration(diff);
      } catch (error) {
        console.error('Error calculating stream duration:', error);
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

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  async retryConnection(): Promise<void> {
    console.log('Retrying connection...');
    this.error = null;
    this.isLoading = true;
    this.zegoInitialized = false;
    this.streamConfig = null;
    this.initializationRetryCount = 0;
    this.initializationInProgress = false;
    this.loadingMessage = 'Retrying connection...';
    
    if (this.containerCheckInterval) {
      clearInterval(this.containerCheckInterval);
      this.containerCheckInterval = undefined;
    }
    
    try {
      await this.zegoService.forceCleanup();
    } catch (e) {
      console.log('No existing instance to clean up');
    }
    
    setTimeout(() => {
      this.ensureContainerReady();
    }, 1000);
  }

  async toggleCamera(): Promise<void> {
    if (!this.zegoInitialized) {
      console.warn('Cannot toggle camera: Zego not initialized');
      return;
    }
    try {
      this.cameraEnabled = !this.cameraEnabled;
      await this.zegoService.toggleCamera(this.cameraEnabled);
    } catch (error) {
      console.error('Failed to toggle camera:', error);
      this.cameraEnabled = !this.cameraEnabled;
    }
  }

  async toggleMicrophone(): Promise<void> {
    if (!this.zegoInitialized) {
      console.warn('Cannot toggle microphone: Zego not initialized');
      return;
    }
    try {
      this.microphoneEnabled = !this.microphoneEnabled;
      await this.zegoService.toggleMicrophone(this.microphoneEnabled);
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
      this.microphoneEnabled = !this.microphoneEnabled;
    }
  }

  async endStream(): Promise<void> {
    if (this.userRole !== 'host') return;
    
    try {
      console.log('Ending stream...');
      const response = await this.livestreamService.endLiveStream(this.eventId).toPromise();
      if (response?.success) {
        this.router.navigate(['/events']);
      } else {
        this.error = `Failed to end stream: ${response?.message || 'Unknown error'}`;
      }
    } catch (error) {
      console.error('Failed to end stream:', error);
      this.error = `Failed to end stream: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private async cleanup(): Promise<void> {
    console.log('Cleaning up live stream component...');
    
    if (this.containerCheckInterval) {
      clearInterval(this.containerCheckInterval);
    }
    
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.stopDurationTimer();
    
    try {
      await this.zegoService.forceCleanup();
    } catch (error) {
      console.error('Failed to cleanup Zego service:', error);
    }
  }
}