import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ROLE_COLORS, ROLE_NAMES } from '../constants';
import { ChatMessage, User, ChatRoom as ChatRoomType, Role } from '../types';
import { cn } from '../lib/utils';
import { Icons } from '../components/icons';
import { Button } from '../components/ui/Button';
import { AnimatePresence, motion } from 'framer-motion';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../hooks/useToast';
import { getSocket, joinRoom, leaveRoom, sendMessage } from '../lib/socket';

interface ChatProps {
    chatRooms: ChatRoomType[];
    setChatRooms: React.Dispatch<React.SetStateAction<ChatRoomType[]>>;
    users: User[];
    currentUser: User;
    onlineUsers: number[];
    onViewProfile?: (user: User) => void;
}

const EMOJI_CATEGORIES: Record<string, { icon: keyof typeof Icons; emojis: string[] }> = {
    'Biểu cảm & Con người': {
        icon: 'Smile',
        emojis: [
            '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃',
            '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪',
        ],
    },
    'Động vật & Thiên nhiên': {
        icon: 'Dog',
        emojis: [
            '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️',
            '🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄', '🐚', '🌾', '💐', '🌷', '🌹', '🥀', '🌺', '🌸', '🌼', '🌻',
        ],
    },
    'Đồ ăn & Thức uống': {
        icon: 'Grape',
        emojis: [
            '🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🥝', '🍅', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄',
            '🍔', '🍟', '🍕', '🌭', '🥪', '🥙', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡',
            '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪',
            '☕', '🍵', '🥤', '🧃', '🧉', '🥛', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🍾',
        ],
    },
    'Đối tượng & Biểu tượng': {
        icon: 'LampDesk',
        emojis: [
            '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟',
            '💯', '🔥', '🎉', '✨', '🚀', '👀', '🧠', '💣', '💤', '💥', '💦', '💨', '💫', '💬', '💭',
            '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '🏒', '🏑', '🏏', '🥍', '⛳', '🏹', '🎣', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿',
            '💻', '🖥️', '🖱️', '⌨️', '📱', '☎️', '💡', '💰', '👑', '💎',
        ],
    },
};

const MessageBubble = React.memo<{ message: ChatMessage, sender?: User, currentUser: User, onViewProfile?: (user: User) => void }>(({ message, sender, currentUser, onViewProfile }) => {
    const isMe = message.senderId === currentUser.id;
    const roleColor = sender ? ROLE_COLORS[sender.role].primary : '#8E8E93';
    
    return (
        <div className={cn('flex items-end gap-2 max-w-[80%] w-fit', isMe ? 'self-end flex-row-reverse' : 'self-start')}>
            {sender && !isMe && (
                <img 
                    src={sender.avatar} 
                    alt={sender.name} 
                    className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity" 
                    onClick={() => onViewProfile?.(sender)}
                />
            )}
            <div className={cn('p-3 rounded-2xl shadow-md', isMe ? 'bg-blue-600 text-white rounded-br-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md')}>
                {!isMe && sender && (
                    <div className="flex items-center gap-2 mb-1">
                        <p 
                            className="text-xs font-bold cursor-pointer hover:underline" 
                            style={{ color: roleColor }}
                            onClick={() => onViewProfile?.(sender)}
                        >
                            {sender.name}
                        </p>
                        <span
                            className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold text-white"
                            style={{ backgroundColor: roleColor }}
                        >
                            {sender.role ? (ROLE_NAMES[sender.role] || sender.role) : 'Thành viên'}
                        </span>
                    </div>
                )}
                <p className="text-sm break-words">{message.text}</p>
                <p className={cn('text-xs mt-1', isMe ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400', 'text-right')}>{message.timestamp}</p>
            </div>
        </div>
    );
});

const ChannelListItem = React.memo<{ 
    room: ChatRoomType; 
    isActive: boolean; 
    isMuted: boolean; 
    onClick: () => void;
    onDelete?: () => void;
    isAdmin: boolean;
}>(({ room, isActive, isMuted, onClick, onDelete, isAdmin }) => {
    const Icon = Icons[room.icon];
    const lastMessage = room.messages[room.messages.length - 1];

    return (
        <div className="relative group">
            <button onClick={onClick} className={cn('flex items-start p-3 rounded-lg w-full text-left transition-colors', isActive ? 'bg-blue-500/10 dark:bg-blue-500/20' : 'hover:bg-gray-200 dark:hover:bg-gray-800')}>
                <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg mr-3">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                         <h3 className={cn("text-sm font-semibold", isActive && "text-blue-600 dark:text-blue-400")}>{room.name}</h3>
                         {isMuted && <Icons.BellOff className="w-3.5 h-3.5 text-gray-400" />}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{lastMessage?.text || 'Chưa có tin nhắn'}</p>
                </div>
            </button>
            {isAdmin && onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-lg"
                    title="Xóa kênh"
                >
                    <Icons.Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>
    )
});

const initialChannelState = {
    name: '',
    description: '',
    icon: 'MessageSquare' as keyof typeof Icons,
    members: [] as number[],
};

const Chat: React.FC<ChatProps> = ({ chatRooms, setChatRooms, users, currentUser, onlineUsers, onViewProfile }) => {
    const { addToast } = useToast();
    
    const availableRooms = useMemo(() => 
        chatRooms.filter(room => 
            (!room.allowedRoles && !room.members) || 
            (room.allowedRoles && room.allowedRoles.includes(currentUser.role)) ||
            (room.members && room.members.includes(currentUser.id))
        ), 
    [chatRooms, currentUser.role, currentUser.id]);
    
    const [activeRoomId, setActiveRoomId] = useState<string | null>(availableRooms[0]?.id || null);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState<User | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeEmojiCategory, setActiveEmojiCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isMembersModalOpen, setMembersModalOpen] = useState(false);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [newChannelData, setNewChannelData] = useState(initialChannelState);
    const [mutedRooms, setMutedRooms] = useState<string[]>([]);
    const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
    const [clearingHistoryRoomId, setClearingHistoryRoomId] = useState<string | null>(null);
    const [clearHistoryPeriod, setClearHistoryPeriod] = useState<'7days' | '1month' | 'all'>('all');
    
    const isAdmin = currentUser.role === Role.Admin;
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);


    const activeRoom = useMemo(() => chatRooms.find(r => r.id === activeRoomId), [chatRooms, activeRoomId]);
    const roomMembers = useMemo(() => {
        if (!activeRoom) return [];
        if (activeRoom.members) {
            return users.filter(u => activeRoom.members!.includes(u.id));
        }
        if (activeRoom.allowedRoles) {
            return users.filter(u => activeRoom.allowedRoles!.includes(u.role));
        }
        return users;
    }, [activeRoom, users]);

    // Calculate online users in current room
    const onlineCount = useMemo(() => {
        if (!activeRoom) return 0;
        const memberIds = activeRoom.members 
            ? activeRoom.members 
            : activeRoom.allowedRoles 
                ? users.filter(u => activeRoom.allowedRoles!.includes(u.role)).map(u => u.id)
                : users.map(u => u.id);
        return memberIds.filter(id => onlineUsers.includes(id)).length;
    }, [activeRoom, users, onlineUsers]);

    const allOtherUsers = useMemo(() => users.filter(u => u.id !== currentUser.id), [users, currentUser.id]);
    const allOtherUserIds = useMemo(() => allOtherUsers.map(u => u.id), [allOtherUsers]);
    const allSelected = useMemo(() => 
        allOtherUserIds.length > 0 && 
        allOtherUserIds.every(id => newChannelData.members.includes(id)), 
    [allOtherUserIds, newChannelData.members]);
    
    const handleSelectAllMembers = useCallback(() => {
        if (allSelected) {
            setNewChannelData(prev => ({ ...prev, members: [] }));
        } else {
            setNewChannelData(prev => ({ ...prev, members: allOtherUserIds }));
        }
    }, [allSelected, allOtherUserIds]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [activeRoom, isTyping]);
    
    // Socket.IO: Join/leave rooms and load messages
    useEffect(() => {
        if (!activeRoomId) return;
        
        const socket = getSocket();
        if (!socket) return;

        // Join the active room
        joinRoom(activeRoomId);
        console.log('🚪 Joined room:', activeRoomId);

        // Load messages from backend
        const loadMessages = async () => {
            try {
                const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
                    ? import.meta.env.VITE_API_URL 
                    : 'http://localhost:5000/api';
                const token = localStorage.getItem('accessToken');
                
                const response = await fetch(`${API_URL}/chat/rooms/${activeRoomId}/messages`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const messages = await response.json();
                    console.log('📥 Loaded messages for room', activeRoomId, ':', messages);
                    
                    // Update room with messages from backend
                    setChatRooms(prevRooms => {
                        console.log('🔄 Before update - prevRooms:', prevRooms.map(r => ({ id: r.id, messageCount: r.messages.length })));
                        
                        const updatedRooms = prevRooms.map(room => {
                            if (room.id === activeRoomId) {
                                const updatedRoom = {
                                    ...room,
                                    messages: messages.map((msg: any) => ({
                                        id: msg.id,
                                        senderId: msg.senderId,
                                        text: msg.text,
                                        timestamp: new Date(msg.createdAt).toLocaleTimeString('vi-VN', { 
                                            hour: '2-digit', 
                                            minute: '2-digit',
                                            timeZone: 'Asia/Ho_Chi_Minh'
                                        }),
                                    }))
                                };
                                console.log('✅ Updated room', activeRoomId, 'with', updatedRoom.messages.length, 'messages');
                                return updatedRoom;
                            }
                            return room;
                        });
                        
                        console.log('🔄 After update - updatedRooms:', updatedRooms.map(r => ({ id: r.id, messageCount: r.messages.length })));
                        return updatedRooms;
                    });
                } else {
                    console.error('Failed to load messages:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('Failed to load messages:', error);
            }
        };

        loadMessages();

        // Cleanup: leave room when switching
        return () => {
            leaveRoom(activeRoomId);
            console.log('🚪 Left room:', activeRoomId);
        };
    }, [activeRoomId]);

    // Socket.IO: Listen for new messages
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handleNewMessage = (message: any) => {
            console.log('💬 New message received:', message);
            
            // Add message to the room (avoid duplicates)
            setChatRooms(prevRooms => prevRooms.map(room => {
                if (room.id === message.roomId) {
                    // Check if message already exists
                    const messageExists = room.messages.some(m => m.id === message.id);
                    if (messageExists) {
                        console.log('⚠️ Message already exists, skipping');
                        return room;
                    }
                    
                    return {
                        ...room,
                        messages: [...room.messages, {
                            id: message.id,
                            senderId: message.senderId,
                            text: message.text,
                            timestamp: new Date(message.createdAt).toLocaleTimeString('vi-VN', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                timeZone: 'Asia/Ho_Chi_Minh'
                            }),
                        }]
                    };
                }
                return room;
            }));
        };

        const handleUserTyping = (data: { userId: number; roomId: string }) => {
            if (data.roomId === activeRoomId && data.userId !== currentUser.id) {
                const typingUser = users.find(u => u.id === data.userId);
                setTypingUser(typingUser || null);
                setIsTyping(true);
            }
        };

        const handleUserStoppedTyping = (data: { userId: number; roomId: string }) => {
            if (data.roomId === activeRoomId && data.userId !== currentUser.id) {
                setIsTyping(false);
                setTypingUser(null);
            }
        };

        socket.on('message:new', handleNewMessage);
        socket.on('user:typing', handleUserTyping);
        socket.on('user:stopped-typing', handleUserStoppedTyping);

        return () => {
            socket.off('message:new', handleNewMessage);
            socket.off('user:typing', handleUserTyping);
            socket.off('user:stopped-typing', handleUserStoppedTyping);
        };
    }, [activeRoomId, currentUser.id, users]);
    
     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
             if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [emojiPickerRef, menuRef]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeRoomId) return;
        setShowEmojiPicker(false);

        // Send message via WebSocket
        sendMessage(activeRoomId, newMessage.trim());
        console.log('📤 Sent message:', newMessage.trim());

        setNewMessage('');
    }
    
    const addEmoji = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
    }

    // Typing indicator with debounce
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewMessage(value);

        if (!activeRoomId) return;

        // Send typing start
        const socket = getSocket();
        if (socket) {
            socket.emit('typing:start', { roomId: activeRoomId });
        }

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Send typing stop after 1 second of no typing
        typingTimeoutRef.current = setTimeout(() => {
            if (socket) {
                socket.emit('typing:stop', { roomId: activeRoomId });
            }
        }, 1000);
    };

    const handleToggleMute = useCallback(() => {
        if (!activeRoomId) return;
        const isMuted = mutedRooms.includes(activeRoomId);
        if (isMuted) {
            setMutedRooms(mutedRooms.filter(id => id !== activeRoomId));
            addToast({ title: 'Thông báo', message: `Đã bật thông báo cho kênh ${activeRoom?.name}.`, type: 'info' });
        } else {
            setMutedRooms([...mutedRooms, activeRoomId]);
            addToast({ title: 'Thông báo', message: `Đã tắt thông báo cho kênh ${activeRoom?.name}.`, type: 'info' });
        }
        setMenuOpen(false);
    }, [activeRoomId, mutedRooms, activeRoom?.name, addToast]);

    const handlePinMessage = useCallback(() => {
        addToast({ title: 'Tính năng đang phát triển', message: 'Ghim tin nhắn sẽ sớm được ra mắt!', type: 'info' });
        setMenuOpen(false);
    }, [addToast]);

    const handleClearHistory = useCallback(async () => {
        if (!clearingHistoryRoomId) return;

        try {
            const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
                ? import.meta.env.VITE_API_URL 
                : 'http://localhost:5000/api';
            
            const token = localStorage.getItem('accessToken');
            
            const response = await fetch(`${API_URL}/chat/rooms/${clearingHistoryRoomId}/clear?period=${clearHistoryPeriod}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                // Update local state to clear messages based on period
                if (clearHistoryPeriod === 'all') {
                    setChatRooms(prev => prev.map(room => 
                        room.id === clearingHistoryRoomId 
                            ? { ...room, messages: [] }
                            : room
                    ));
                } else {
                    // For partial deletion, refetch messages or filter locally
                    const now = new Date();
                    let cutoffDate: Date;
                    
                    if (clearHistoryPeriod === '7days') {
                        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    } else { // 1month
                        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    }
                    
                    setChatRooms(prev => prev.map(room => {
                        if (room.id === clearingHistoryRoomId) {
                            return {
                                ...room,
                                messages: room.messages.filter(msg => {
                                    const msgDate = new Date(msg.timestamp);
                                    return msgDate > cutoffDate;
                                })
                            };
                        }
                        return room;
                    }));
                }
                
                const periodText = 
                    clearHistoryPeriod === '7days' ? '7 ngày gần đây' :
                    clearHistoryPeriod === '1month' ? '1 tháng gần đây' :
                    'toàn bộ';
                
                addToast({ 
                    title: 'Thành công!', 
                    message: `Đã xóa lịch sử chat ${periodText} (${data.deletedCount || 0} tin nhắn).`, 
                    type: 'success' 
                });
            } else {
                addToast({ 
                    title: 'Lỗi!', 
                    message: 'Không thể xóa lịch sử chat.', 
                    type: 'error' 
                });
            }
        } catch (error) {
            console.error('Clear history error:', error);
            addToast({ 
                title: 'Lỗi', 
                message: 'Không thể xóa lịch sử chat.', 
                type: 'error' 
            });
        } finally {
            setClearingHistoryRoomId(null);
            setClearHistoryPeriod('all');
            setMenuOpen(false);
        }
    }, [clearingHistoryRoomId, clearHistoryPeriod, addToast]);
    
    const handleSelectRoom = useCallback((roomId: string) => {
        setActiveRoomId(roomId);
    }, []);

    const handleMemberSelect = (userId: number) => {
        setNewChannelData(prev => {
            const newMembers = prev.members.includes(userId)
                ? prev.members.filter(id => id !== userId)
                : [...prev.members, userId];
            return { ...prev, members: newMembers };
        });
    };

    const handleCreateChannel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChannelData.name.trim()) {
            addToast({ title: 'Lỗi', message: 'Tên kênh không được để trống.', type: 'error' });
            return;
        }

        const newRoom: ChatRoomType = {
            id: newChannelData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
            name: newChannelData.name,
            description: newChannelData.description,
            icon: newChannelData.icon,
            messages: [],
            members: [currentUser.id, ...newChannelData.members],
        };

                try {
                        // Save to backend
                        const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
                            ? import.meta.env.VITE_API_URL 
                            : 'http://localhost:5000/api';
                        const token = localStorage.getItem('accessToken');
                        const response = await fetch(`${API_URL}/chat/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: newRoom.name,
                    description: newRoom.description,
                    icon: newRoom.icon,
                    members: newRoom.members,
                }),
            });

            if (!response.ok) throw new Error('Failed to create chat room');

            const savedRoom = await response.json();
            
            // Transform backend data to frontend format
            const transformedRoom = {
                id: savedRoom.id,
                name: savedRoom.name,
                description: savedRoom.description,
                icon: savedRoom.icon,
                messages: [],
                allowedRoles: savedRoom.allowedRoles?.map((ar: any) => ar.role) || null,
                members: savedRoom.members?.map((m: any) => m.userId) || null,
            };
            
            // Update local state with the saved room
            setChatRooms(prev => [...prev, transformedRoom]);
            addToast({ title: 'Thành công!', message: `Kênh "${newRoom.name}" đã được tạo.`, type: 'success' });
            setCreateModalOpen(false);
            setNewChannelData(initialChannelState);
        } catch (error) {
            console.error('Create channel error:', error);
            addToast({ title: 'Lỗi', message: 'Không thể tạo kênh. Vui lòng thử lại.', type: 'error' });
        }
    };

    const handleDeleteChannel = async () => {
        if (!deletingRoomId) return;
        
        try {
            const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
                ? import.meta.env.VITE_API_URL 
                : 'http://localhost:5000/api';
            const token = localStorage.getItem('accessToken');
            
            const response = await fetch(`${API_URL}/chat/rooms/${deletingRoomId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to delete chat room');

            // Remove from local state
            setChatRooms(prev => prev.filter(room => room.id !== deletingRoomId));
            
            // If deleting active room, switch to another
            if (activeRoomId === deletingRoomId) {
                const remainingRooms = chatRooms.filter(r => r.id !== deletingRoomId);
                setActiveRoomId(remainingRooms[0]?.id || null);
            }
            
            addToast({ title: 'Đã xóa!', message: 'Kênh chat đã được xóa.', type: 'info' });
            setDeletingRoomId(null);
        } catch (error) {
            console.error('Delete channel error:', error);
            addToast({ title: 'Lỗi', message: 'Không thể xóa kênh. Vui lòng thử lại.', type: 'error' });
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] md:grid md:grid-cols-12 gap-6">
            {/* Channel List - Left Column */}
            <div className="hidden md:col-span-4 lg:col-span-3 md:flex flex-col bg-white/30 dark:bg-gray-950/30 rounded-2xl backdrop-blur-lg border border-white/10 shadow-lg">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Kênh Chat</h2>
                    {currentUser.role === Role.Admin && (
                        <Button variant="ghost" size="icon" onClick={() => setCreateModalOpen(true)} title="Tạo kênh mới">
                            <Icons.PlusCircle className="w-5 h-5"/>
                        </Button>
                    )}
                </div>
                <div className="flex-1 p-2 overflow-y-auto space-y-1">
                    {availableRooms.map(room => (
                        <ChannelListItem 
                            key={room.id} 
                            room={room} 
                            isActive={room.id === activeRoomId}
                            isMuted={mutedRooms.includes(room.id)}
                            onClick={() => handleSelectRoom(room.id)}
                            onDelete={isAdmin ? () => setDeletingRoomId(room.id) : undefined}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            </div>

            {/* Chat Area - Right Column */}
            <div className="col-span-12 md:col-span-8 lg:col-span-9 h-full flex flex-col bg-white/30 dark:bg-gray-950/30 rounded-2xl backdrop-blur-lg border border-white/10 shadow-lg overflow-hidden">
                {activeRoom ? (
                    <>
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
                            <div>
                                <h2 className="text-lg font-bold">{activeRoom.name}</h2>
                                <p className="text-xs text-green-500">{roomMembers.length} thành viên, {onlineCount} đang hoạt động</p>
                            </div>
                             <div className="relative" ref={menuRef}>
                                <Button variant="ghost" size="icon" onClick={() => setMenuOpen(prev => !prev)}>
                                    <Icons.MoreVertical className="w-5 h-5"/>
                                </Button>
                                <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="absolute right-0 mt-2 w-48 origin-top-right rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20"
                                    >
                                        <div className="py-1 text-gray-700 dark:text-gray-200" role="menu">
                                            <button onClick={() => { setMembersModalOpen(true); setMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                                                <Icons.Users className="w-4 h-4 mr-2" /> Xem thành viên
                                            </button>
                                            <button onClick={handleToggleMute} className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                                                {mutedRooms.includes(activeRoomId!) ? <Icons.Bell className="w-4 h-4 mr-2" /> : <Icons.BellOff className="w-4 h-4 mr-2" />}
                                                {mutedRooms.includes(activeRoomId!) ? 'Bật thông báo' : 'Tắt thông báo'}
                                            </button>
                                            {activeRoom.id === 'committee' && (
                                                <button onClick={handlePinMessage} className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                                                    <Icons.Pin className="w-4 h-4 mr-2" /> Ghim tin nhắn
                                                </button>
                                            )}
                                            {isAdmin && (
                                                <button 
                                                    onClick={() => { setClearingHistoryRoomId(activeRoomId!); setMenuOpen(false); }} 
                                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" 
                                                    role="menuitem"
                                                >
                                                    <Icons.Trash2 className="w-4 h-4 mr-2" /> Xóa lịch sử chat
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                        </div>
                        
                        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                            {activeRoom.messages.map(msg => (
                                <MessageBubble key={msg.id} message={msg} sender={users.find(u => u.id === msg.senderId)} currentUser={currentUser} onViewProfile={onViewProfile} />
                            ))}
                            {isTyping && typingUser && (
                                <div className="flex items-end gap-2 max-w-[80%] self-start">
                                    <img src={typingUser.avatar} alt={typingUser.name} className="w-8 h-8 rounded-full" />
                                    <div className="p-3 rounded-2xl shadow-md bg-gray-200 dark:bg-gray-700 rounded-bl-md">
                                        <motion.div
                                            className="flex items-center gap-1"
                                            initial="start"
                                            animate="end"
                                            variants={{
                                                start: { transition: { staggerChildren: 0.2 } },
                                                end: { transition: { staggerChildren: 0.2 } }
                                            }}
                                        >
                                            <motion.span className="w-2 h-2 bg-gray-400 rounded-full" variants={{ start: { y: "0%" }, end: { y: "100%" } }} transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }} />
                                            <motion.span className="w-2 h-2 bg-gray-400 rounded-full" variants={{ start: { y: "0%" }, end: { y: "100%" } }} transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }} />
                                            <motion.span className="w-2 h-2 bg-gray-400 rounded-full" variants={{ start: { y: "0%" }, end: { y: "100%" } }} transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }} />
                                        </motion.div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
                            <div className="relative flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-2">
                                <div ref={emojiPickerRef}>
                                    <AnimatePresence>
                                        {showEmojiPicker && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                className="absolute bottom-full mb-2 w-80 origin-bottom-left rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
                                            >
                                                <div className="p-2 h-64 overflow-y-auto">
                                                    <div className="grid grid-cols-8 gap-x-1 gap-y-2">
                                                        {EMOJI_CATEGORIES[activeEmojiCategory].emojis.map(emoji => (
                                                            <button
                                                                key={emoji}
                                                                type="button"
                                                                onClick={() => addEmoji(emoji)}
                                                                className="text-2xl p-0.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                                                            >
                                                                {emoji}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-around p-1 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
                                                    {Object.entries(EMOJI_CATEGORIES).map(([category, { icon }]) => {
                                                        const IconComponent = Icons[icon];
                                                        return (
                                                            <button
                                                                key={category}
                                                                type="button"
                                                                onClick={() => setActiveEmojiCategory(category)}
                                                                className={cn(
                                                                    "p-2 rounded-md transition-colors text-gray-500",
                                                                    activeEmojiCategory === category ? 'bg-blue-500/20 text-blue-500' : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                                                                )}
                                                                aria-label={category}
                                                                title={category}
                                                            >
                                                                <IconComponent className="w-5 h-5" />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => setShowEmojiPicker(prev => !prev)}>
                                        <Icons.Smile className="w-5 h-5 text-gray-500" />
                                    </Button>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Nhập tin nhắn..."
                                    value={newMessage}
                                    onChange={handleMessageChange}
                                    className="flex-1 bg-transparent focus:outline-none text-sm px-2"
                                />
                                <Button type="submit" size="icon" className="rounded-lg">
                                    <Icons.Send className="w-5 h-5" />
                                </Button>
                            </div>
                        </form>
                    </>
                ) : (
                     <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <Icons.MessageSquare className="w-16 h-16 text-gray-400 mb-4" />
                        <h2 className="text-xl font-semibold">Chào mừng đến với Chat</h2>
                        <p className="text-gray-500">Chọn một kênh bên trái để bắt đầu trò chuyện.</p>
                    </div>
                )}
            </div>
            
            <Modal isOpen={isMembersModalOpen} onClose={() => setMembersModalOpen(false)} title={`Thành viên (${roomMembers.length})`}>
                <div className="max-h-96 overflow-y-auto overflow-x-hidden space-y-3 pr-2">
                    {roomMembers.map(user => (
                        <div 
                            key={user.id} 
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                            onClick={() => {
                                onViewProfile?.(user);
                                setMembersModalOpen(false);
                            }}
                        >
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                            <div>
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-xs" style={{ color: ROLE_COLORS[user.role].primary }}>{user.role ? (ROLE_NAMES[user.role] || user.role) : 'Thành viên'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>
            
             <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Tạo kênh chat mới">
                <form onSubmit={handleCreateChannel} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tên kênh</label>
                        <input value={newChannelData.name} onChange={(e) => setNewChannelData(p => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Mô tả kênh</label>
                        <textarea value={newChannelData.description} onChange={(e) => setNewChannelData(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Icon kênh</label>
                        <select value={newChannelData.icon} onChange={(e) => setNewChannelData(p => ({ ...p, icon: e.target.value as keyof typeof Icons }))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                           {['MessageSquare', 'Users', 'Hash', 'Book', 'Award', 'Shield'].map(icon => <option key={icon} value={icon}>{icon}</option>)}
                        </select>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium">Thêm thành viên</label>
                            <Button type="button" variant="ghost" size="sm" onClick={handleSelectAllMembers} className="text-xs px-2 h-7">
                                {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                            </Button>
                        </div>
                        <div className="max-h-48 overflow-y-auto border rounded-lg p-2 dark:border-gray-700 space-y-2">
                            {allOtherUsers.map(user => (
                                <label key={user.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newChannelData.members.includes(user.id)}
                                        onChange={() => handleMemberSelect(user.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                                    <span>{user.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                     <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                        <Button type="button" variant="secondary" onClick={() => setCreateModalOpen(false)}>Hủy</Button>
                        <Button type="submit">Tạo kênh</Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal 
                isOpen={!!deletingRoomId} 
                onClose={() => setDeletingRoomId(null)} 
                title="Xác nhận xóa kênh"
            >
                <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        Bạn có chắc chắn muốn xóa kênh <strong>{chatRooms.find(r => r.id === deletingRoomId)?.name}</strong>?
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                        ⚠️ Hành động này sẽ xóa toàn bộ tin nhắn trong kênh và không thể hoàn tác!
                    </p>
                    <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                        <Button type="button" variant="secondary" onClick={() => setDeletingRoomId(null)}>
                            Hủy
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDeleteChannel}>
                            Xóa kênh
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Clear History Confirmation Modal */}
            <Modal 
                isOpen={!!clearingHistoryRoomId} 
                onClose={() => {
                    setClearingHistoryRoomId(null);
                    setClearHistoryPeriod('all');
                }} 
                title="Xóa lịch sử chat"
            >
                <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        Chọn khoảng thời gian cần xóa lịch sử chat trong kênh <strong>{chatRooms.find(r => r.id === clearingHistoryRoomId)?.name}</strong>:
                    </p>
                    
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                            <input
                                type="radio"
                                name="clearPeriod"
                                value="7days"
                                checked={clearHistoryPeriod === '7days'}
                                onChange={(e) => setClearHistoryPeriod(e.target.value as '7days')}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-gray-100">7 ngày gần đây</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Xóa tin nhắn trong vòng 7 ngày qua</div>
                            </div>
                        </label>
                        
                        <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                            <input
                                type="radio"
                                name="clearPeriod"
                                value="1month"
                                checked={clearHistoryPeriod === '1month'}
                                onChange={(e) => setClearHistoryPeriod(e.target.value as '1month')}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-gray-100">1 tháng gần đây</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Xóa tin nhắn trong vòng 30 ngày qua</div>
                            </div>
                        </label>
                        
                        <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer">
                            <input
                                type="radio"
                                name="clearPeriod"
                                value="all"
                                checked={clearHistoryPeriod === 'all'}
                                onChange={(e) => setClearHistoryPeriod(e.target.value as 'all')}
                                className="h-4 w-4 text-red-600 focus:ring-red-500"
                            />
                            <div className="flex-1">
                                <div className="font-medium text-red-900 dark:text-red-100">Toàn bộ lịch sử</div>
                                <div className="text-xs text-red-600 dark:text-red-400">⚠️ Xóa vĩnh viễn tất cả tin nhắn</div>
                            </div>
                        </label>
                    </div>
                    
                    <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                        💡 Lưu ý: Hành động này không thể hoàn tác. Tin nhắn đã xóa sẽ không thể khôi phục.
                    </p>
                    
                    <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={() => {
                                setClearingHistoryRoomId(null);
                                setClearHistoryPeriod('all');
                            }}
                        >
                            Hủy
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleClearHistory}>
                            Xóa lịch sử
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Chat;