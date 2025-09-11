import { Vibrate as Vibration, BellRing, Trash2 } from 'lucide-react';
import { useNotificationStore } from '../utils/notificationstore';
import { motion } from 'framer-motion';

export default function NotificationsHeader() {
  const { notifications, clearAllNotifications } = useNotificationStore();
  
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-10 bg-white pb-4 pt-6 mb-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-blue-500 p-2 rounded-lg mr-3">
            <BellRing className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {notifications.length > 0 
                ? `${notifications.length} notification${notifications.length !== 1 ? 's' : ''}${
                    unreadCount > 0 ? `, ${unreadCount} unread` : ''
                  }`
                : 'No notifications'}
            </p>
          </div>
        </div>
        
        {notifications.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearAllNotifications}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear all
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}