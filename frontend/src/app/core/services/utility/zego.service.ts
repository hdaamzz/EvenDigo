import { Injectable } from '@angular/core';

// Declare Zego types to avoid TypeScript errors
declare global {
  interface Window {
    ZegoUIKitPrebuilt: any;
  }
}

export interface ZegoConfig {
  appId: number;
  token: string;
  roomId: string;
  userId: string;
  userName: string;
  role: 'host' | 'audience';
}

@Injectable({
  providedIn: 'root'
})
export class ZegoService {
  private zg: any = null;
  private isInitializing = false;
  private sdkLoaded = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.loadZegoSDK();
  }

  private async loadZegoSDK(): Promise<void> {
    if (this.sdkLoaded || typeof window === 'undefined') {
      return;
    }

    return new Promise((resolve, reject) => {
      // Check if SDK is already loaded
      if (window.ZegoUIKitPrebuilt) {
        this.sdkLoaded = true;
        resolve();
        return;
      }

      // Use the correct versioned SDK URL
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@zegocloud/zego-uikit-prebuilt@latest/zego-uikit-prebuilt.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        console.log('Zego SDK loaded successfully');
        // Add a small delay to ensure SDK is fully initialized
        setTimeout(() => {
          this.sdkLoaded = true;
          resolve();
        }, 500);
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Zego SDK:', error);
        reject(new Error('Failed to load Zego SDK'));
      };

      document.head.appendChild(script);
    });
  }

  private async waitForSDK(): Promise<void> {
    if (this.sdkLoaded && window.ZegoUIKitPrebuilt) {
      return;
    }

    // Wait for SDK to load with timeout
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds total

    return new Promise((resolve, reject) => {
      const checkSDK = () => {
        attempts++;
        
        if (window.ZegoUIKitPrebuilt) {
          this.sdkLoaded = true;
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('Zego SDK failed to load within timeout'));
        } else {
          setTimeout(checkSDK, 100);
        }
      };
      
      checkSDK();
    });
  }

  async initializeZego(config: ZegoConfig, containerElement: HTMLElement): Promise<void> {
    // Prevent multiple simultaneous initialization attempts
    if (this.isInitializing && this.initializationPromise) {
      console.log('Already initializing, waiting for existing initialization...');
      return this.initializationPromise;
    }

    if (this.zg) {
      console.log('Zego already initialized, cleaning up first...');
      await this.leaveRoom();
    }

    this.isInitializing = true;
    
    this.initializationPromise = this._initializeZego(config, containerElement);
    
    try {
      await this.initializationPromise;
    } finally {
      this.isInitializing = false;
      this.initializationPromise = null;
    }
  }

  private async _initializeZego(config: ZegoConfig, containerElement: HTMLElement): Promise<void> {
    try {
      console.log('Starting Zego initialization...');
      
      // Ensure SDK is loaded first
      await this.waitForSDK();
      
      if (!window.ZegoUIKitPrebuilt) {
        throw new Error('Zego SDK not available after loading');
      }

      console.log('Initializing Zego with config:', { ...config, token: '[REDACTED]' });
      console.log('Container element:', containerElement);

      const { token, roomId, userId, userName, role } = config;

      // Validate required parameters
      if (!token || !roomId || !userId) {
        throw new Error('Missing required parameters: token, roomId, or userId');
      }

      if (!containerElement) {
        throw new Error('Container element is null or undefined');
      }

      // Ensure container has proper dimensions
      this.setupContainer(containerElement);

      // Wait a bit to ensure container is properly rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('Generating kit token...');
      const kitToken = this.generateKitToken(config.appId, token, roomId, userId);

      // Create new instance
      console.log('Creating ZegoUIKitPrebuilt instance...');
      const kit = window.ZegoUIKitPrebuilt.create(kitToken);

      if (!kit) {
        throw new Error('Failed to create ZegoUIKitPrebuilt instance');
      }

      // Configure the kit with corrected settings
      const zegoConfig: any = {
        container: containerElement,
        scenario: {
          mode: window.ZegoUIKitPrebuilt.LiveStreaming,
        },
        turnOnCameraWhenJoining: role === 'host',
        turnOnMicrophoneWhenJoining: role === 'host',
        showPreJoinView: false,
        showScreenSharingButton: role === 'host',
        showNonVideoUser: false, // This was causing the error - set to false for LiveStreaming
        showRoomTimer: true,
        maxUsers: 50,
        layout: "Auto",
        // Additional configuration for live streaming
        showUserOfflineMessage: false,
        showUserOnlineMessage: false,
        onJoinRoom: () => {
          console.log('Successfully joined the room');
        },
        onLeaveRoom: () => {
          console.log('Left the room');
        },
        onUserJoin: (users: any[]) => {
          console.log('Users joined:', users);
        },
        onUserLeave: (users: any[]) => {
          console.log('Users left:', users);
        }
      };

      // Set role-specific configuration
      if (role === 'host') {
        zegoConfig.scenario.config = {
          role: window.ZegoUIKitPrebuilt.Host,
        };
        // Host-specific settings
        zegoConfig.showMyCameraToggleButton = true;
        zegoConfig.showMyMicrophoneToggleButton = true;
        zegoConfig.showAudioVideoSettingsButton = true;
      } else {
        zegoConfig.scenario.config = {
          role: window.ZegoUIKitPrebuilt.Audience,
        };
        // Audience-specific settings
        zegoConfig.showMyCameraToggleButton = false;
        zegoConfig.showMyMicrophoneToggleButton = false;
        zegoConfig.showAudioVideoSettingsButton = false;
      }

      console.log('Final Zego config:', zegoConfig);
      console.log('Joining room...');

      // Join the room
      await kit.joinRoom(zegoConfig);

      this.zg = kit;
      console.log('Zego initialized successfully');

    } catch (error) {
      console.error('Failed to initialize Zego:', error);
      this.zg = null;
      throw new Error(`Zego initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private setupContainer(containerElement: HTMLElement): void {
    // Clear any existing content
    containerElement.innerHTML = '';
    
    // Ensure container has proper styling and dimensions
    const style = containerElement.style;
    style.width = '100%';
    style.height = '600px';
    style.minHeight = '400px';
    style.position = 'relative';
    style.backgroundColor = '#000';
    style.display = 'block';
    style.visibility = 'visible';
    style.overflow = 'hidden';
    
    // Force reflow to ensure dimensions are applied
    containerElement.offsetHeight;
    
    console.log('Container dimensions after setup:', {
      width: containerElement.offsetWidth,
      height: containerElement.offsetHeight,
      clientWidth: containerElement.clientWidth,
      clientHeight: containerElement.clientHeight
    });

    if (containerElement.offsetWidth === 0 || containerElement.offsetHeight === 0) {
      console.warn('Container has zero dimensions!');
    }
  }

  private generateKitToken(appId: number, serverToken: string, roomId: string, userId: string): string {
    try {
      const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        serverToken,
        roomId,
        userId,
        userId 
      );
      return kitToken;
    } catch (error) {
      console.error('Failed to generate kit token:', error);
      return serverToken;
    }
  }

  async leaveRoom(): Promise<void> {
    try {
      if (this.zg) {
        console.log('Leaving Zego room...');
        
        // Try different cleanup methods
        if (typeof this.zg.destroy === 'function') {
          await this.zg.destroy();
        } else if (typeof this.zg.leaveRoom === 'function') {
          await this.zg.leaveRoom();
        } else if (typeof this.zg.hangUp === 'function') {
          await this.zg.hangUp();
        }
        
        this.zg = null;
        console.log('Successfully left Zego room');
      }
    } catch (error) {
      console.error('Error leaving room:', error);
      this.zg = null;
    }
  }

  async toggleCamera(enable: boolean): Promise<void> {
    try {
      if (!this.zg) {
        throw new Error('Zego not initialized');
      }

      // For ZegoUIKitPrebuilt, use the correct method names
      if (typeof this.zg.turnOnCamera === 'function') {
        await this.zg.turnOnCamera(enable);
      } else if (typeof this.zg.enableCamera === 'function') {
        await this.zg.enableCamera(enable);
      } else {
        // Try accessing the core engine
        const engine = this.zg.getEngine?.();
        if (engine) {
          if (typeof engine.mutePublishStreamVideo === 'function') {
            await engine.mutePublishStreamVideo(!enable);
          } else if (typeof engine.enableCamera === 'function') {
            await engine.enableCamera(enable);
          }
        } else {
          console.warn('Camera toggle method not found');
        }
      }
      
      console.log(`Camera ${enable ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to toggle camera:', error);
      throw error;
    }
  }

  async toggleMicrophone(enable: boolean): Promise<void> {
    try {
      if (!this.zg) {
        throw new Error('Zego not initialized');
      }

      // For ZegoUIKitPrebuilt, use the correct method names
      if (typeof this.zg.turnOnMicrophone === 'function') {
        await this.zg.turnOnMicrophone(enable);
      } else if (typeof this.zg.enableMicrophone === 'function') {
        await this.zg.enableMicrophone(enable);
      } else {
        // Try accessing the core engine
        const engine = this.zg.getEngine?.();
        if (engine) {
          if (typeof engine.mutePublishStreamAudio === 'function') {
            await engine.mutePublishStreamAudio(!enable);
          } else if (typeof engine.enableMicrophone === 'function') {
            await engine.enableMicrophone(enable);
          }
        } else {
          console.warn('Microphone toggle method not found');
        }
      }
      
      console.log(`Microphone ${enable ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.zg !== null && !this.isInitializing && this.sdkLoaded;
  }

  getZegoInstance(): any {
    return this.zg;
  }

  // Add a method to force cleanup if needed
  async forceCleanup(): Promise<void> {
    this.isInitializing = false;
    this.initializationPromise = null;
    await this.leaveRoom();
  }
}