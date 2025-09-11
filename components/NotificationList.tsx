import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../utils/notificationstore';
import NotificationItem from './NotificationItem';
import { format } from 'date-fns';
import { BellOff } from 'lucide-react';

export default function NotificationsList() {
  const { notifications, activeFilter, loading, error, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : notifications.filter(notification => notification.type === activeFilter);

  // Group notifications by date
  const groupNotificationsByDate = () => {
    const groups: { [key: string]: typeof filteredNotifications } = {};
    
    filteredNotifications.forEach(notification => {
      const date = new Date(notification.createdAt);
      const now = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey = 'Earlier';
      
      if (date.toDateString() === now.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(notification);
    });
    
    return groups;
  };
  
  const groupedNotifications = groupNotificationsByDate();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse flex flex-col w-full space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <div className="bg-red-50 p-4 rounded-lg inline-block mx-auto">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => fetchNotifications()}
            className="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (filteredNotifications.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-10 text-center"
      >
        <div className="bg-gray-100 p-5 rounded-full mb-4">
          <BellOff className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
        <p className="text-gray-500 max-w-xs">
          {activeFilter === 'all'
            ? "You don't have any notifications at the moment."
            : `You don't have any ${activeFilter} notifications at the moment.`}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedNotifications).map(([date, notifications]) => (
        <div key={date}>
          <h2 className="text-sm font-medium text-gray-500 mb-3">{date}</h2>
          <AnimatePresence>
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}