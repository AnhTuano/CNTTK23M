
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Notification as NotificationType } from '../types';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/icons';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { API_URL } from '../constants';
import { useToast } from '../hooks/useToast';

interface NotificationsProps {
    socket: any;
    notifications: NotificationType[];
    setNotifications: React.Dispatch<React.SetStateAction<NotificationType[]>>;
}

const NotificationItem = React.memo<{ 
    notification: NotificationType, 
    onMarkAsRead: () => void,
    onDelete: () => void
}>(({ notification, onMarkAsRead, onDelete }) => {
    const iconMap: Record<NotificationType['type'], React.ReactNode> = {
        post: <Icons.Newspaper className="w-6 h-6 text-blue-500" />,
        comment: <Icons.MessageSquare className="w-6 h-6 text-green-500" />,
        vote: <Icons.ArrowUpCircle className="w-6 h-6 text-orange-500" />,
        system: <Icons.Sparkles className="w-6 h-6 text-purple-500" />,
        document: <Icons.Book className="w-6 h-6 text-indigo-500" />,
        memory: <Icons.Heart className="w-6 h-6 text-pink-500" />,
    };

    return (
        <div
            className={cn(
                "relative flex items-start gap-4 p-4 border-b dark:border-gray-700/50 last:border-b-0 transition-colors group",
                notification.read ? "opacity-60" : "hover:bg-gray-100 dark:hover:bg-gray-800/50"
            )}
        >
            <div className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full transition-opacity", notification.read ? "opacity-0" : "opacity-100")}></div>
            <div className="flex-shrink-0 mt-1 ml-8">{iconMap[notification.type]}</div>
            <div className="flex-1 cursor-pointer" onClick={onMarkAsRead}>
                <p className="font-medium text-sm text-gray-800 dark:text-gray-100">{notification.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.text}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleString('vi-VN')}
                </p>
            </div>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Icons.Trash2 className="w-4 h-4 text-red-500" />
            </Button>
        </div>
    );
});

const Notifications: React.FC<NotificationsProps> = ({ socket, notifications, setNotifications }) => {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [loading, setLoading] = useState(false); // No need to fetch, App.tsx already loaded
    const { addToast } = useToast();

    // Show toast when new notification arrives (App.tsx handles the state update)
    useEffect(() => {
        if (!socket) return;

        const handleNotificationUpdate = ({ action, notification }: { action: string, notification?: NotificationType }) => {
            if (action === 'create' && notification) {
                addToast({
                    title: '🔔 ' + notification.title,
                    message: notification.text,
                    type: 'info'
                });
            }
        };

        socket.on('notification:update', handleNotificationUpdate);

        return () => {
            socket.off('notification:update', handleNotificationUpdate);
        };
    }, [socket, addToast]);
    
    const filteredNotifications = useMemo(() => {
        if (filter === 'unread') {
            return notifications.filter(n => !n.read);
        }
        return notifications;
    }, [notifications, filter]);

    const handleMarkAsRead = useCallback(async (id: number) => {
        try {
            const token = localStorage.getItem('accessToken');
            await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    }, []);

    const handleMarkAllAsRead = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            await fetch(`${API_URL}/notifications/read/all`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            addToast({ title: 'Thành công', message: 'Đã đánh dấu tất cả là đã đọc' });
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    }, [addToast]);

    const handleDelete = useCallback(async (id: number) => {
        try {
            const token = localStorage.getItem('accessToken');
            await fetch(`${API_URL}/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    }, []);

    const handleDeleteAllRead = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            await fetch(`${API_URL}/notifications/read/all`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setNotifications(prev => prev.filter(n => !n.read));
            addToast({ title: 'Thành công', message: 'Đã xóa tất cả thông báo đã đọc' });
        } catch (error) {
            console.error('Failed to delete read notifications:', error);
        }
    }, [addToast]);
    
    const hasUnread = useMemo(() => notifications.some(n => !n.read), [notifications]);
    const hasRead = useMemo(() => notifications.some(n => n.read), [notifications]);

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Thông báo</h1>
                <Card className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-500 mt-4">Đang tải...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Thông báo</h1>
            <Card className="p-0">
                <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b dark:border-gray-700/50 gap-2">
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant={filter === 'all' ? 'primary' : 'secondary'} onClick={() => setFilter('all')}>
                            Tất cả ({notifications.length})
                        </Button>
                        <Button size="sm" variant={filter === 'unread' ? 'primary' : 'secondary'} onClick={() => setFilter('unread')}>
                            Chưa đọc ({notifications.filter(n => !n.read).length})
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={handleMarkAllAsRead} disabled={!hasUnread} className="text-blue-500 text-sm disabled:opacity-50">
                            <Icons.Check className="w-4 h-4 mr-2"/>
                            Đánh dấu đã đọc
                        </Button>
                        <Button variant="ghost" onClick={handleDeleteAllRead} disabled={!hasRead} className="text-red-500 text-sm disabled:opacity-50">
                            <Icons.Trash2 className="w-4 h-4 mr-2"/>
                            Xóa đã đọc
                        </Button>
                    </div>
                </div>
                <div className="max-h-[calc(100vh-22rem)] overflow-y-auto">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map(notif => (
                            <NotificationItem 
                                key={notif.id} 
                                notification={notif} 
                                onMarkAsRead={() => handleMarkAsRead(notif.id)}
                                onDelete={() => handleDelete(notif.id)}
                            />
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
