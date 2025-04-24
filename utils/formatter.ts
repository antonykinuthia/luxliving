import { formatDistance, format, isToday, isYesterday } from 'date-fns';

// Format message timestamp
export function formatMessageTime(date: Date): string {
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  return format(date, 'MMM d, h:mm a');
}

// Format conversation timestamp
export function formatConversationTime(date: Date): string {
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'MMM d');
}

// Format last active time
export function formatLastActive(date: Date | undefined): string {
  if (!date) return 'Offline';
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // If active in the last 2 minutes, show as online
  if (diff < 2 * 60 * 1000) {
    return 'Online';
  }
  
  return `Last seen ${formatDistance(date, now, { addSuffix: true })}`;
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}