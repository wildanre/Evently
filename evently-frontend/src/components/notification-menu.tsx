import { useAuth } from "@/contexts/AuthContext";
import {
  deleteNotification,
  formatNotificationTime,
  getNotificationIcon,
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  Notification
} from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { Bell, Check, CheckCheck, Loader2, Trash2, X } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";

export const NotificationMenu = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);

  React.useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchNotifications();
    }
  }, [isOpen, isAuthenticated]);

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async (pageNum = 1, append = false) => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const response = await getNotifications({ page: pageNum, limit: 10 });
      const newNotifications = response.notifications;
      
      if (append) {
        setNotifications(prev => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }
      
      setHasMore(pageNum < response.pagination.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      if (error instanceof Error && error.message !== 'Authentication required') {
        toast.error('Failed to load notifications');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await getUnreadNotificationsCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      // Don't show toast for authentication errors
      if (error instanceof Error && error.message !== 'Authentication required') {
        console.warn('Could not fetch unread count');
      }
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      fetchNotifications(page + 1, true);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div className="relative">
          {children}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] rounded-full h-3 w-3 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </SheetTrigger>
      <SheetContent 
        overlay={false} 
        close={false} 
        className="w-96 max-h-[600px] absolute right-5 top-16 border rounded-xl bg-background/95 backdrop-blur-sm shadow-lg"
      >
        <SheetTitle className="hidden">
          Notification Menu
        </SheetTitle>

        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-lg">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 font-medium">No notifications yet</p>
                <p className="text-gray-400 text-sm">You'll see notifications here when you have them</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification, index) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDeleteNotification}
                    isLast={index === notifications.length - 1}
                  />
                ))}
                
                {hasMore && (
                  <div className="p-4">
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={loadMore}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load more'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isLast: boolean;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  isLast
}) => {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.eventId) {
      console.log('Navigate to event:', notification.eventId);
    }
  };

  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-4 hover:bg-foreground/5 cursor-pointer transition-colors",
        !notification.isRead && "bg-blue-50/50 dark:bg-blue-950/20",
        isLast && "rounded-b-xl"
      )}
      onClick={handleClick}
    >
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
          {getNotificationIcon(notification.type)}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className={cn(
              "font-medium text-sm leading-tight",
              !notification.isRead && "font-semibold"
            )}>
              {notification.title}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 leading-relaxed line-clamp-2">
              {notification.message}
            </p>
            
            {notification.events && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                📍 {notification.events.name}
                {notification.events.location && ` • ${notification.events.location}`}
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">
                {formatNotificationTime(notification.createdAt)}
              </span>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 ml-2">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};