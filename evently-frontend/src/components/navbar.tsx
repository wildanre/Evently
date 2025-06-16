"use client";

import { Bell, Compass, LogIn, LogOut, Search, Ticket, User, Loader2, X, Check, CheckCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { GoogleOAuthButton } from "./auth/GoogleOAuthButton";
import { useAuth } from "@/contexts/AuthContext";
import { loginUser, registerUser } from "@/lib/auth";
import { toast } from "sonner";
import React from "react";
import { 
  Notification, 
  getNotifications, 
  getUnreadNotificationsCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  formatNotificationTime,
  getNotificationIcon,
  NotificationType
} from "@/lib/notifications";

export default function Navbar() {
  const [isLogin, setIsLogin] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loginForm, setLoginForm] = React.useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = React.useState({ name: '', email: '', password: '' });
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  
  const { user, isAuthenticated, login, logout, isLoading: authLoading } = useAuth();
  const pathname = usePathname();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await loginUser(loginForm);
      login(response.token, response.user);
      toast.success('Login successful!');
      setIsDialogOpen(false);
      setLoginForm({ email: '', password: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await registerUser(registerForm);
      login(response.token, response.user);
      toast.success('Registration successful!');
      setIsDialogOpen(false);
      setRegisterForm({ name: '', email: '', password: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <nav className="shadow-sm w-full sticky top-0 bg-foreground/10 z-50 bg-gradient-to-t from-transparent to-background backdrop-blur-sm dark:border-foreground/20 dark:bg-foreground/10 dark:bg-gradient-to-b dark:from-transparent dark:to-neutral-900">
        <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-5">
              <div className="h-6 w-6 bg-gray-300 rounded-full animate-pulse" />
            </div>
            <div className="flex items-center gap-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="shadow-sm w-full sticky top-0 bg-foreground/10 z-50 bg-gradient-to-t from-transparent to-background backdrop-blur-sm dark:border-foreground/20 dark:bg-foreground/10 dark:bg-gradient-to-b dark:from-transparent dark:to-neutral-900">
      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-5">
            <Link
              href={"/events"}
              className="flex-shrink-0"
            >
              <Image
                src="/logo-white.png"
                alt="Logo"
                width={100}
                height={100}
                className="h-6 w-6 rounded-full"
              />
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href={"/events"}
                className="text-sm text-foreground"
              >
                <Button variant="ghost" className={cn("rounded-2xl text-sm px-4 h-8 text-gray-300", pathname === "/events" ? "text-white font-bold" : "font-regular")}>
                  <Ticket />
                  <span>
                    Events
                  </span>
                </Button>
              </Link>
              <Link
                href={"/discover"}
                className="text-sm text-foreground"
              >
                <Button variant="ghost" className={cn("rounded-2xl text-sm px-4 h-8 text-gray-300", pathname === "/discover" ? "text-white font-bold" : "font-regular")}>
                  <Compass />
                  <span>
                    Discover
                  </span>
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="font-bold px-0 text-gray-300"
              onClick={() => window.location.href = "/create"}
            >
              Create Event
            </Button>
            <Search className="size-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
            
            {isAuthenticated ? (
              <>
                <NotificationMenu>
                  <div className="relative">
                    <Bell className="size-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                  </div>
                </NotificationMenu>
                <UserMenu>
                  <Avatar className="cursor-pointer h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Image
                        src={user?.profileImageUrl || "/images/avatar1.jpg"}
                        alt={user?.name || "User Avatar"}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    </AvatarFallback>
                    {user?.profileImageUrl && (
                      <AvatarImage src={user.profileImageUrl} alt={user.name} />
                    )}
                  </Avatar>
                </UserMenu>
              </>
            ) : (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="font-bold px-0 w-16 text-gray-300">
                    Login
                    <LogIn className="size-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  {isLogin ? (
                    <React.Fragment>
                      <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Login to Your Account</DialogTitle>
                        <DialogDescription className="text-sm text-gray-500">
                          Please enter your email and password to login.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <GoogleOAuthButton />
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                          </div>
                        </div>
                        <form onSubmit={handleLogin} className="flex flex-col gap-4">
                          <Input
                            type="email"
                            placeholder="Email"
                            value={loginForm.email}
                            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                            required
                          />
                          <Input
                            type="password"
                            placeholder="Password"
                            value={loginForm.password}
                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                            required
                          />
                          <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                              </>
                            ) : (
                              'Login'
                            )}
                          </Button>
                          <span className="text-sm text-center text-gray-300">
                            Don't have an account?{' '}
                            <button 
                              type="button"
                              onClick={() => setIsLogin(false)} 
                              className="text-white cursor-pointer hover:underline"
                            >
                              Register
                            </button>
                          </span>
                        </form>
                      </div>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Create Account</DialogTitle>
                        <DialogDescription className="text-sm text-gray-500">
                          Please fill in the details below to create a new account.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <GoogleOAuthButton />
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                          </div>
                        </div>
                        <form onSubmit={handleRegister} className="flex flex-col gap-4">
                          <Input
                            type="text"
                            placeholder="Full Name"
                            value={registerForm.name}
                            onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                            required
                          />
                          <Input
                            type="email"
                            placeholder="Email"
                            value={registerForm.email}
                            onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                            required
                          />
                          <Input
                            type="password"
                            placeholder="Password"
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                            required
                          />
                          <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                              </>
                            ) : (
                              'Register'
                            )}
                          </Button>
                          <span className="text-sm text-center text-gray-300">
                            Already have an account?{' '}
                            <button 
                              type="button"
                              onClick={() => setIsLogin(true)} 
                              className="text-white cursor-pointer hover:underline"
                            >
                              Login
                            </button>
                          </span>
                        </form>
                      </div>
                    </React.Fragment>
                  )}
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

const UserMenu = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent overlay={false} close={false} className="w-70 h-fit absolute right-5 top-16 border rounded-xl bg-background/80">
        <SheetTitle className="hidden">
          User Menu
        </SheetTitle>

        <div className="flex flex-col items-start p-1 gap-1">
          <div className="flex items-center gap-3 w-full p-2 hover:bg-foreground/10 rounded-xl cursor-pointer">
            <Avatar className="cursor-pointer h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                      <Image
                        src={user?.profileImageUrl || "/images/avatar1.jpg"}
                        alt={user?.name || "User Avatar"}
                        width={32}
                        height={32}
                        className="rounded-full w-full h-full"
                      />
              </AvatarFallback>
              {user?.profileImageUrl && (
                <AvatarImage src={user.profileImageUrl} alt={user.name} />
              )}
            </Avatar>
            <div className="flex flex-col">
              <span className="font-bold">{user?.name}</span>
              <span className="text-xs text-gray-300 font-semibold">{user?.email}</span>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col w-full">
            <Link href="/profile" className="flex text-sm font-semibold items-center gap-2 p-2 hover:bg-foreground/10 rounded-md">
              <User className="h-4 w-4" />
              <span>View Profile</span>
            </Link>
            <Link href="/settings" className="flex text-sm font-semibold items-center gap-2 p-2 hover:bg-foreground/10 rounded-md">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="flex text-sm font-semibold items-center gap-2 p-2 hover:bg-foreground/10 rounded-md w-full text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

const NotificationMenu = ({
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

  // Fetch notifications when menu opens and user is authenticated
  React.useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchNotifications();
    }
  }, [isOpen, isAuthenticated]);

  // Fetch unread count on mount and periodically, but only when authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Update every 30 seconds
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
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
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
          {/* Header */}
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

          {/* Notifications List */}
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
                
                {/* Load More Button */}
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

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  isLast
}) => {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    // Optionally navigate to event if eventId exists
    if (notification.eventId) {
      // You can add navigation logic here
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
      {/* Notification Icon */}
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
          {getNotificationIcon(notification.type)}
        </div>
      </div>

      {/* Notification Content */}
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
            
            {/* Event Info */}
            {notification.events && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                📍 {notification.events.name}
                {notification.events.location && ` • ${notification.events.location}`}
              </div>
            )}
            
            {/* Timestamp */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">
                {formatNotificationTime(notification.createdAt)}
              </span>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>

          {/* Actions */}
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
