import { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  Home, 
  MessageCircle, 
  DollarSign, 
  Calendar, 
  Bell, 
  X 
} from 'lucide-react';
import { Notification, NotificationType } from '../lib/notification';
import { useNotificationStore } from '../utils/notificationstore';

interface NotificationItemProps {
  notification: Notification;
}

export default function NotificationItem({ notification }: NotificationItemProps) {
  const { markAsRead, clearNotification } = useNotificationStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMarkAsRead = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearNotification(notification.id);
  };

  const handleClick = () => {
    setIsExpanded(!isExpanded);
    handleMarkAsRead();
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case NotificationType.PROPERTY:
        return <Home className="h-6 w-6 text-blue-500" />;
      case NotificationType.MESSAGE:
        return <MessageCircle className="h-6 w-6 text-green-500" />;
      case NotificationType.OFFER:
        return <DollarSign className="h-6 w-6 text-amber-500" />;
      case NotificationType.VIEWING:
        return <Calendar className="h-6 w-6 text-purple-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -300 }}
      transition={{ duration: 0.3 }}
      className={`relative mb-3 overflow-hidden rounded-lg border ${
        notification.read ? 'border-gray-200 bg-white' : 'border-blue-100 bg-blue-50'
      } shadow-sm transition-all duration-200 hover:shadow-md`}
      onClick={handleClick}
    >
      <div className="flex items-start p-4">
        <div className="mr-4 flex-shrink-0 rounded-full bg-white p-2 shadow-sm">
          {getNotificationIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className={`text-sm font-semibold ${!notification.read ? 'text-blue-900' : 'text-gray-900'}`}>
              {notification.title}
            </h3>
            <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
              {formatDate(notification.createdAt)}
            </span>
          </div>
          
          <p className={`text-sm mt-1 ${!notification.read ? 'text-blue-800' : 'text-gray-700'}`}>
            {notification.message}
          </p>

          {isExpanded && notification.metadata && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 text-sm"
            >
              {notification.type === NotificationType.PROPERTY && notification.metadata.propertyImage && (
                <div className="mt-2 mb-2">
                  <img 
                    src={notification.metadata.propertyImage} 
                    alt={notification.metadata.propertyTitle || 'Property'} 
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <p className="text-gray-700 font-medium mt-1">{notification.metadata.propertyTitle}</p>
                </div>
              )}
              
              {notification.type === NotificationType.MESSAGE && notification.metadata.senderName && (
                <div className="flex items-center mt-2">
                  {notification.metadata.senderAvatar && (
                    <img 
                      src={notification.metadata.senderAvatar} 
                      alt={notification.metadata.senderName} 
                      className="w-8 h-8 rounded-full mr-2"
                    />
                  )}
                  <span className="text-gray-700">Message from {notification.metadata.senderName}</span>
                </div>
              )}
              
              {notification.type === NotificationType.OFFER && notification.metadata.offerAmount && (
                <div className="mt-2">
                  <p className="text-gray-700">
                    Offer amount: <span className="font-semibold">${notification.metadata.offerAmount.toLocaleString()}</span>
                  </p>
                </div>
              )}
              
              {notification.type === NotificationType.VIEWING && notification.metadata.viewingDate && (
                <div className="mt-2">
                  <p className="text-gray-700">
                    Scheduled for: <span className="font-semibold">{format(new Date(notification.metadata.viewingDate), 'EEEE, MMM d, yyyy \'at\' h:mm a')}</span>
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        <button 
          onClick={handleClear}
          className="ml-2 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          aria-label="Clear notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {!notification.read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
      )}
    </motion.div>
  );
}