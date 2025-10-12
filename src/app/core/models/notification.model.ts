/**
 * Notification model matching backend Notification entity
 */
export interface Notification {
  id: number;
  userId: string;
  claimNumber: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  createdAt: string;  // ISO date string
  readAt?: string;    // ISO date string
}

export enum NotificationType {
  CLAIM_APPROVED = 'CLAIM_APPROVED',
  CLAIM_REJECTED = 'CLAIM_REJECTED',
  CLAIM_UNDER_REVIEW = 'CLAIM_UNDER_REVIEW',
  CLAIM_SETTLED = 'CLAIM_SETTLED',
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION'
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ'
}
