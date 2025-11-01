
import React, { useState, useMemo, useCallback } from 'react';
import { Notification as NotificationType } from '../types';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/icons';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/Card';

interface NotificationsProps {
    notifications: NotificationType[];
    setNotifications: React.Dispatch<React.SetStateAction<NotificationType[]>>;
}

const NotificationItem = React.memo<{ notification: NotificationType, onMarkAsRead: () => void }>(({ notification, onMarkAsRead }) => {
    const iconMap: Record<NotificationType['type'], React.ReactNode> = {
        post: <Icons.Newspaper className="w-6 h-6 text-blue-500" />,
        comment: <Icons.MessageSquare className="w-6 h-6 text-green-500" />,
        vote: <Icons.ArrowUpCircle className="w-6 h-6 text-orange-500" />,
        system: <Icons.Sparkles className="w-6 h-6 text-purple-500" />,
    };

    return (
        <div
            onClick={onMarkAsRead}
            className={cn(
                "relative flex items-start gap-4 p-4 border-b dark:border-gray-700/50 last:border-b-0 cursor-pointer transition-colors",
                notification.read ? "opacity-60" : "hover:bg-gray-100 dark:hover:bg-gray-800/50"
            )}
        >
            <div className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full transition-opacity", notification.read ? "opacity-0" : "opacity-100")}></div>
            <div className="flex-shrink-0 mt-1 ml-8">{iconMap[notification.type]}</div>
            <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-200">{notification.text}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.timestamp}</p>
            </div>
        </div>
    );
});

const Notifications: React.FC<NotificationsProps> = ({ notifications, setNotifications }) => {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    
    const filteredNotifications = useMemo(() => {
        if (filter === 'unread') {
            return notifications.filter(n => !n.read);
        }
        return notifications;
    }, [notifications, filter]);

    const handleMarkAsRead = useCallback((id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, [setNotifications]);

    const handleMarkAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, [setNotifications]);
    
    const hasUnread = useMemo(() => notifications.some(n => !n.read), [notifications]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Thông báo</h1>
            <Card className="p-0">
                <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b dark:border-gray-700/50 gap-2">
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant={filter === 'all' ? 'primary' : 'secondary'} onClick={() => setFilter('all')}>Tất cả ({notifications.length})</Button>
                        <Button size="sm" variant={filter === 'unread' ? 'primary' : 'secondary'} onClick={() => setFilter('unread')}>Chưa đọc ({notifications.filter(n => !n.read).length})</Button>
                    </div>
                    <Button variant="ghost" onClick={handleMarkAllAsRead} disabled={!hasUnread} className="text-blue-500 text-sm disabled:opacity-50">
                        <Icons.Check className="w-4 h-4 mr-2"/>
                        Đánh dấu tất cả là đã đọc
                    </Button>
                </div>
                <div className="max-h-[calc(100vh-22rem)] overflow-y-auto">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map(notif => (
                            <NotificationItem key={notif.id} notification={notif} onMarkAsRead={() => handleMarkAsRead(notif.id)} />
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <Icons.BellOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold">Không có thông báo nào</h3>
                            <p className="text-gray-500">
                                {filter === 'unread' ? "Bạn đã đọc tất cả thông báo." : "Hộp thư của bạn đang trống."}
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Notifications;
