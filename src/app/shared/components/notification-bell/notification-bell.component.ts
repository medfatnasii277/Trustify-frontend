import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Notification, NotificationStatus, NotificationType } from '../../../core/models/notification.model';
import { NotificationService } from '../../../core/services/notification.service';
import { KeycloakService } from '../../../core/services/keycloak.service';

/**
 * Notification bell component with real-time WebSocket updates
 * Displays notification count badge and dropdown menu
 */
@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatBadgeModule,
    MatButtonModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  isConnected = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private keycloakService: KeycloakService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Only connect WebSocket if user is authenticated
    this.subscriptions.push(
      this.keycloakService.isAuthenticated().subscribe(
        (authenticated: boolean) => {
          if (authenticated) {
            this.connectWebSocket();
          }
        }
      )
    );

    // Subscribe to notifications
    this.subscriptions.push(
      this.notificationService.getNotificationsObservable().subscribe(
        (notifications: Notification[]) => {
          this.notifications = notifications;
        }
      )
    );

    // Subscribe to unread count
    this.subscriptions.push(
      this.notificationService.getUnreadCountObservable().subscribe(
        (count: number) => {
          this.unreadCount = count;
        }
      )
    );

    // Subscribe to connection status
    this.subscriptions.push(
      this.notificationService.isConnected().subscribe(
        (connected: boolean) => {
          this.isConnected = connected;
          if (connected) {
            console.log('WebSocket connected - notifications will update in real-time');
          }
        }
      )
    );

    // Subscribe to latest notifications for toast
    this.subscriptions.push(
      this.notificationService.getLatestNotificationObservable()
        .pipe(filter((notification: Notification | null) => notification !== null))
        .subscribe((notification: Notification | null) => {
          this.showToastNotification(notification!);
        })
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Disconnect WebSocket
    this.notificationService.disconnect();
  }

  /**
   * Connect to WebSocket using Keycloak token and user ID
   */
  private connectWebSocket(): void {
    this.keycloakService.getToken().subscribe({
      next: (token: string | null) => {
        if (!token) {
          console.warn('No token available for WebSocket connection');
          return;
        }

        this.keycloakService.getUserProfile().subscribe({
          next: (profile: any) => {
            // Keycloak profile has 'id' field which is the Keycloak user ID (sub claim)
            const userId = profile?.id;
            
            if (userId) {
              console.log('Connecting to WebSocket with userId:', userId);
              this.notificationService.connect(token, userId);
            } else {
              console.warn('No userId available for WebSocket connection', profile);
            }
          },
          error: (error: any) => {
            console.error('Error getting user profile for WebSocket:', error);
          }
        });
      },
      error: (error: any) => {
        console.error('Error getting token for WebSocket:', error);
      }
    });
  }

  /**
   * Show toast notification using Material Snackbar
   */
  private showToastNotification(notification: Notification): void {
    const icon = this.getNotificationIcon(notification.type);
    const message = `${icon} ${notification.message}`;
    
    const snackBarRef = this.snackBar.open(message, 'View', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: this.getNotificationClass(notification.type)
    });

    // Handle "View" button click
    snackBarRef.onAction().subscribe(() => {
      this.markAsRead(notification);
    });
  }

  /**
   * Mark notification as read
   */
  markAsRead(notification: Notification): void {
    if (notification.status === NotificationStatus.UNREAD) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          console.log('Marked notification as read:', notification.id);
        },
        error: (error: any) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        console.log('Marked all notifications as read');
        this.snackBar.open('All notifications marked as read', 'OK', {
          duration: 2000
        });
      },
      error: (error: any) => {
        console.error('Error marking all as read:', error);
      }
    });
  }

  /**
   * Get icon for notification type
   */
  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.CLAIM_APPROVED:
        return '✅';
      case NotificationType.CLAIM_REJECTED:
        return '❌';
      case NotificationType.CLAIM_UNDER_REVIEW:
        return '🔍';
      case NotificationType.CLAIM_SETTLED:
        return '💰';
      case NotificationType.SYSTEM_NOTIFICATION:
        return 'ℹ️';
      default:
        return '📬';
    }
  }

  /**
   * Get CSS class for notification type
   */
  getNotificationClass(type: NotificationType): string {
    switch (type) {
      case NotificationType.CLAIM_APPROVED:
        return 'notification-success';
      case NotificationType.CLAIM_REJECTED:
        return 'notification-error';
      case NotificationType.CLAIM_UNDER_REVIEW:
        return 'notification-info';
      case NotificationType.CLAIM_SETTLED:
        return 'notification-success';
      case NotificationType.SYSTEM_NOTIFICATION:
        return 'notification-info';
      default:
        return 'notification-default';
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }

  /**
   * Get display limit for notifications in dropdown
   */
  getDisplayedNotifications(): Notification[] {
    return this.notifications.slice(0, 10); // Show latest 10
  }

  /**
   * Check if notification is unread
   */
  isUnread(notification: Notification): boolean {
    return notification.status === NotificationStatus.UNREAD;
  }
}
