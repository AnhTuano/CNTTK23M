
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icons } from '../icons';
import { ThemeToggle } from '../ThemeToggle';
import { cn } from '../../lib/utils';
import { ROLE_COLORS } from '../../constants';
import { Button } from '../ui/Button';
import { AnimatePresence, motion } from 'framer-motion';
import { Notification, User } from '../../types';

interface HeaderProps {
  setSidebarOpen: (isOpen: boolean) => void;
  pageTitle: string;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  currentUser: User;
  setActivePage: (page: any) => void;
  onLogout: () => void;
  animateBell: boolean;
  setAnimateBell: React.Dispatch<React.SetStateAction<boolean>>;
  onSearchClick: () => void;
}

const NotificationItem = React.memo<{ notification: Notification; onClick: () => void }>(({ notification, onClick }) => {
    const iconMap: Record<Notification['type'], React.ReactNode> = {
        post: <Icons.Newspaper className="w-5 h-5 text-blue-500" />,
        comment: <Icons.MessageSquare className="w-5 h-5 text-green-500" />,
        vote: <Icons.ArrowUpCircle className="w-5 h-5 text-orange-500" />,
        system: <Icons.Sparkles className="w-5 h-5 text-purple-500" />,
    };

    return (
        <div 
            onClick={onClick}
            className="relative flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
        >
            {!notification.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>}
            <div className="flex-shrink-0 mt-1 ml-4">{iconMap[notification.type]}</div>
            <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-200">{notification.text}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.timestamp}</p>
            </div>
        </div>
    );
});

export const Header: React.FC<HeaderProps> = ({ setSidebarOpen, pageTitle, notifications, setNotifications, currentUser, setActivePage, onLogout, animateBell, setAnimateBell, onSearchClick }) => {
  const userRoleColor = ROLE_COLORS[currentUser.role];
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (animateBell) {
        const timer = setTimeout(() => {
            setAnimateBell(false);
        }, 1000); // Duration matches animation duration in index.html
        return () => clearTimeout(timer);
    }
  }, [animateBell, setAnimateBell]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
            setNotificationsOpen(false);
        }
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
            setProfileMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationRef, profileMenuRef]);

  const handleMarkAsRead = useCallback((id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, [setNotifications]);

  const handleMarkAllAsRead = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [setNotifications]);

  const handleViewAll = useCallback(() => {
    setActivePage('Thông báo');
    setNotificationsOpen(false);
  }, [setActivePage, setNotificationsOpen]);


  return (
    <header className="relative z-10 flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-lg px-4 sm:px-6 lg:px-8">
      <div className="flex items-center">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1 -ml-2 rounded-md text-gray-500 dark:text-gray-400 lg:hidden"
        >
          <Icons.Menu className="h-6 w-6" />
        </button>
        <h2 className="ml-2 text-xl font-semibold text-gray-800 dark:text-gray-200">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={onSearchClick} aria-label="Tìm kiếm">
            <Icons.Search className="h-5 w-5" />
        </Button>
        <ThemeToggle />
        
        <div className="relative" ref={notificationRef}>
            <Button variant="ghost" size="icon" onClick={() => setNotificationsOpen(prev => !prev)} className={cn(animateBell && 'animate-ring')}>
                <Icons.Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                    </div>
                )}
            </Button>
             <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 z-20"
                >
                    <div className="p-3 flex justify-between items-center border-b dark:border-gray-700/50">
                        <h3 className="font-semibold text-sm">Thông báo</h3>
                        {unreadCount > 0 && 
                            <button onClick={handleMarkAllAsRead} className="text-xs text-blue-500 hover:underline">
                                Đánh dấu tất cả là đã đọc
                            </button>
                        }
                    </div>
                    <div className="max-h-80 overflow-y-auto p-1">
                        {notifications.length > 0 ? (
                            notifications.slice(0, 5).map(notif => (
                                <NotificationItem key={notif.id} notification={notif} onClick={() => handleMarkAsRead(notif.id)} />
                            ))
                        ) : (
                            <p className="text-center text-sm text-gray-500 py-8">Không có thông báo mới.</p>
                        )}
                    </div>
                    <div className="p-2 border-t dark:border-gray-700/50 text-center">
                        <button onClick={handleViewAll} className="text-xs font-semibold text-blue-500 hover:underline w-full p-1 rounded-md">
                            Xem tất cả
                        </button>
                    </div>
                </motion.div>
              )}
            </AnimatePresence>
        </div>

        <div className="relative" ref={profileMenuRef}>
            <button onClick={() => setProfileMenuOpen(prev => !prev)} className="flex items-center gap-3 rounded-full p-0.5 transition-colors hover:bg-gray-200 dark:hover:bg-gray-800">
                <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className={cn('h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-900', userRoleColor.border.replace('border-', 'ring-'))}
                />
                <div className="hidden sm:block text-left pr-2">
                    <p className="text-sm font-semibold leading-tight">{currentUser.name}</p>
                    <span
                        className="mt-1 inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-white"
                        style={{ backgroundColor: userRoleColor.primary }}
                    >
                        {currentUser.role}
                    </span>
                </div>
            </button>

            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 z-20"
                >
                    <div className="p-2">
                        <button 
                            onClick={() => { setActivePage('Hồ sơ'); setProfileMenuOpen(false); }} 
                            className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                        >
                            <Icons.User className="h-5 w-5" />
                            <span>Hồ sơ</span>
                        </button>
                        <div className="my-1 h-px bg-gray-200 dark:bg-gray-700/50"></div>
                        <button 
                            onClick={() => { onLogout(); setProfileMenuOpen(false); }} 
                            className="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10"
                        >
                            <Icons.LogOut className="h-5 w-5" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </motion.div>
              )}
            </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
