import { motion } from 'framer-motion';
import { Home, MessageCircle, DollarSign, Calendar, Bell } from 'lucide-react';
import { useNotificationStore } from '../utils/notificationstore';
import { NotificationType } from '../lib/notification';

export default function NotificationFilters() {
  const { activeFilter, setActiveFilter, notifications } = useNotificationStore();

  const getFilterCount = (filter: NotificationType | 'all') => {
    if (filter === 'all') {
      return notifications.length;
    }
    return notifications.filter(notification => notification.type === filter).length;
  };

  const filters = [
    { id: 'all', label: 'All', icon: Bell },
    { id: NotificationType.PROPERTY, label: 'Properties', icon: Home },
    { id: NotificationType.MESSAGE, label: 'Messages', icon: MessageCircle },
    { id: NotificationType.OFFER, label: 'Offers', icon: DollarSign },
    { id: NotificationType.VIEWING, label: 'Viewings', icon: Calendar },
  ];

  return (
    <div className="mb-6 -mx-4 px-4 overflow-x-auto">
      <div className="flex space-x-2 py-1 min-w-max">
        {filters.map((filter) => {
          const count = getFilterCount(filter.id as NotificationType | 'all');
          const isActive = activeFilter === filter.id;
          const Icon = filter.icon;
          
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as NotificationType | 'all')}
              className={`relative flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              <span>{filter.label}</span>
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                    isActive ? 'bg-white text-gray-800' : 'bg-gray-800 text-white'
                  }`}
                >
                  {count}
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}