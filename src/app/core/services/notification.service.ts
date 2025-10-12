import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Notification, NotificationStatus } from '../models/notification.model';
import { environment } from '../../../environments/environment';

/**
 * Notification service for managing real-time notifications via WebSocket
 * Matches backend notification-service implementation
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/api/notifications`;
  // WebSocket connects directly to notification service to avoid CORS header duplication from Gateway
  private wsUrl = environment.wsUrl || `${environment.apiUrl}/ws`;
  
  private stompClient: Client | null = null;
  private connected = new BehaviorSubject<boolean>(false);
  
  // Observable state for notifications
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private unreadCount$ = new BehaviorSubject<number>(0);
  private latestNotification$ = new BehaviorSubject<Notification | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Get connection status
   */
  isConnected(): Observable<boolean> {
    return this.connected.asObservable();
  }

  /**
   * Get all notifications observable
   */
  getNotificationsObservable(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  /**
   * Get unread count observable
   */
  getUnreadCountObservable(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  /**
   * Get latest notification observable (for toast notifications)
   */
  getLatestNotificationObservable(): Observable<Notification | null> {
    return this.latestNotification$.asObservable();
  }

  /**
   * Connect to WebSocket server
   * Subscribes to /user/{userId}/notifications as configured in backend
   */
  connect(token: string, userId: string): void {
    if (this.stompClient && this.stompClient.connected) {
      console.log('WebSocket already connected');
      return;
    }

    console.log('Connecting to WebSocket...');

    // Create STOMP client over SockJS
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl) as any,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    // Handle successful connection
    this.stompClient.onConnect = (frame) => {
      console.log('WebSocket Connected:', frame);
      this.connected.next(true);

      // Subscribe to user-specific notifications
      // Matches backend destination: /user/{userId}/notifications
      const destination = `/user/${userId}/notifications`;
      console.log('Subscribing to:', destination);

      this.stompClient!.subscribe(destination, (message: IMessage) => {
        console.log('Received WebSocket notification:', message.body);
        
        try {
          const notification: Notification = JSON.parse(message.body);
          console.log('Parsed notification:', notification);
          
          // Add to notifications list
          const currentNotifications = this.notifications$.value;
          this.notifications$.next([notification, ...currentNotifications]);
          
          // Update unread count
          this.updateUnreadCount();
          
          // Emit latest notification for toast
          this.latestNotification$.next(notification);
          
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      });

      // Load initial notifications via REST API
      this.loadNotifications();
    };

    // Handle connection errors
    this.stompClient.onStompError = (frame) => {
      console.error('STOMP Error:', frame);
      this.connected.next(false);
    };

    // Handle WebSocket errors
    this.stompClient.onWebSocketError = (event) => {
      console.error('WebSocket Error:', event);
      this.connected.next(false);
    };

    // Handle disconnection
    this.stompClient.onDisconnect = () => {
      console.log('WebSocket Disconnected');
      this.connected.next(false);
    };

    // Activate the client
    this.stompClient.activate();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.stompClient) {
      console.log('Disconnecting WebSocket...');
      this.stompClient.deactivate();
      this.stompClient = null;
      this.connected.next(false);
    }
  }

  /**
   * Load all notifications via REST API
   * Matches backend endpoint: GET /api/notifications/my
   */
  loadNotifications(): void {
    this.http.get<Notification[]>(`${this.apiUrl}/my`)
      .pipe(
        tap(notifications => {
          console.log('Loaded notifications from REST API:', notifications.length);
          this.notifications$.next(notifications);
          this.updateUnreadCount();
        })
      )
      .subscribe({
        next: () => console.log('Notifications loaded successfully'),
        error: (error) => {
          console.error('Error loading notifications:', error);
          // Don't throw error - just log it and continue
          // This prevents breaking the UI if notifications fail to load
        }
      });
  }

  /**
   * Get all user notifications
   * Matches backend endpoint: GET /api/notifications/my
   */
  getAllNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/my`);
  }

  /**
   * Get unread notifications
   * Matches backend endpoint: GET /api/notifications/my/unread
   */
  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/my/unread`);
  }

  /**
   * Get unread count
   * Matches backend endpoint: GET /api/notifications/my/unread/count
   */
  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/my/unread/count`)
      .pipe(
        tap(count => this.unreadCount$.next(count))
      );
  }

  /**
   * Mark notification as read
   * Matches backend endpoint: PUT /api/notifications/{id}/read
   */
  markAsRead(notificationId: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/${notificationId}/read`, {})
      .pipe(
        tap(updatedNotification => {
          // Update in local state
          const notifications = this.notifications$.value.map(n => 
            n.id === notificationId ? updatedNotification : n
          );
          this.notifications$.next(notifications);
          this.updateUnreadCount();
        })
      );
  }

  /**
   * Mark all notifications as read
   * Matches backend endpoint: PUT /api/notifications/read-all
   */
  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read-all`, {})
      .pipe(
        tap(() => {
          // Update all notifications to READ status
          const notifications = this.notifications$.value.map(n => ({
            ...n,
            status: NotificationStatus.READ,
            readAt: new Date().toISOString()
          }));
          this.notifications$.next(notifications);
          this.unreadCount$.next(0);
        })
      );
  }

  /**
   * Update unread count from current notifications
   */
  private updateUnreadCount(): void {
    const unreadCount = this.notifications$.value.filter(
      n => n.status === NotificationStatus.UNREAD
    ).length;
    this.unreadCount$.next(unreadCount);
  }
}
