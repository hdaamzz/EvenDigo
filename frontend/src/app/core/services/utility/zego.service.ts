import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ZegoConfig } from '../../interfaces/user/zego';
declare global {
  interface Window {
    ZegoUIKitPrebuilt: any;
  }
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
      if (window.ZegoUIKitPrebuilt) {
        this.sdkLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@zegocloud/zego-uikit-prebuilt@latest/zego-uikit-prebuilt.js';
      script.async = true;
      script.crossOrigin = 'anonymous';

      script.onload = () => {
        setTimeout(() => {
          this.sdkLoaded = true;
          resolve();
        }, 500);
      };

      script.onerror = (error) => {
        reject(new Error('Failed to load Zego SDK'));
      };

      document.head.appendChild(script);
    });
  }

  private async waitForSDK(): Promise<void> {
    if (this.sdkLoaded && window.ZegoUIKitPrebuilt) {
      return;
    }

    let attempts = 0;
    const maxAttempts = 50;

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
    if (this.isInitializing && this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.zg) {
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
    await this.waitForSDK();

    if (!window.ZegoUIKitPrebuilt) {
      throw new Error('Zego SDK not available after loading');
    }

    if (config.role === 'host') {
      await this.requestMediaPermissions();
    }

    const { token, roomId, userId, userName, role } = config;

    if (!token || !roomId || !userId) {
      throw new Error('Missing required parameters: token, roomId, or userId');
    }

    this.setupContainer(containerElement);
    await new Promise(resolve => setTimeout(resolve, 200));

    const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
      environment.zegoAppId,
      token,
      roomId,
      userId,
      userName || userId
    );

    const kit = window.ZegoUIKitPrebuilt.create(kitToken);

    if (!kit) {
      throw new Error('Failed to create ZegoUIKitPrebuilt instance');
    }

    const zegoConfig: any = {
      container: containerElement,
      scenario: {
        mode: window.ZegoUIKitPrebuilt.Audience,
      },
      showPreJoinView: false,
      showRoomTimer: true,
      maxUsers: 50,
      layout: "Auto",
      showUserOfflineMessage: false,
      showUserOnlineMessage: false,
      onJoinRoom: () => {
      },
      onLeaveRoom: () => {
      },
      onUserJoin: (users: any[]) => {
      },
      onUserLeave: (users: any[]) => {
      }
    };

    if (role === 'host') {
      zegoConfig.scenario.config = {
        role: window.ZegoUIKitPrebuilt.Host,
      };
      zegoConfig.turnOnCameraWhenJoining = true;
      zegoConfig.turnOnMicrophoneWhenJoining = true;
      zegoConfig.showMyCameraToggleButton = true;
      zegoConfig.showMyMicrophoneToggleButton = true;
      zegoConfig.showAudioVideoSettingsButton = true;
      zegoConfig.showScreenSharingButton = true;
      zegoConfig.showTextChat = true;
      zegoConfig.showUserList = true;
    } else {
      zegoConfig.scenario.config = {
          role: window.ZegoUIKitPrebuilt.Audience,
        };
        zegoConfig.turnOnCameraWhenJoining = false;
        zegoConfig.turnOnMicrophoneWhenJoining = false;
        zegoConfig.showMyCameraToggleButton = false;
        zegoConfig.showMyMicrophoneToggleButton = false;
        zegoConfig.showAudioVideoSettingsButton = false;
        zegoConfig.showScreenSharingButton = false;
        zegoConfig.showTextChat = true;
        zegoConfig.showUserList = true;
        zegoConfig.useFrontFacingCamera = false;
        zegoConfig.showLeavingView = false;
        zegoConfig.enableCamera = false;
        zegoConfig.enableMicrophone = false;
    }

    await kit.joinRoom(zegoConfig);

    this.zg = kit;

  } catch (error) {
    this.zg = null;
    throw new Error(`Zego initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

  private async requestMediaPermissions(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      throw new Error('Camera and microphone permissions are required for hosting');
    }
  }

  private setupContainer(containerElement: HTMLElement): void {
    containerElement.innerHTML = '';

    const style = containerElement.style;
    style.width = '100%';
    style.height = '600px';
    style.minHeight = '400px';
    style.position = 'relative';
    style.backgroundColor = '#000';
    style.display = 'block';
    style.visibility = 'visible';
    style.overflow = 'hidden';

    containerElement.offsetHeight;
  }

  async leaveRoom(): Promise<void> {
    try {
      if (this.zg) {
        if (typeof this.zg.destroy === 'function') {
          await this.zg.destroy();
        } else if (typeof this.zg.leaveRoom === 'function') {
          await this.zg.leaveRoom();
        } else if (typeof this.zg.hangUp === 'function') {
          await this.zg.hangUp();
        }

        this.zg = null;
      }
    } catch (error) {
      this.zg = null;
    }
  }

  isInitialized(): boolean {
    return this.zg !== null && !this.isInitializing && this.sdkLoaded;
  }

  getZegoInstance(): any {
    return this.zg;
  }

  async forceCleanup(): Promise<void> {
    this.isInitializing = false;
    this.initializationPromise = null;
    await this.leaveRoom();
  }
}