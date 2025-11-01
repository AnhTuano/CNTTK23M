import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ROLE_COLORS } from '../constants';
import { ChatMessage, User, ChatRoom as ChatRoomType, Role } from '../types';
import { cn } from '../lib/utils';
import { Icons } from '../components/icons';
import { Button } from '../components/ui/Button';
import { AnimatePresence, motion } from 'framer-motion';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../hooks/useToast';

interface ChatProps {
    chatRooms: ChatRoomType[];
    setChatRooms: React.Dispatch<React.SetStateAction<ChatRoomType[]>>;
    users: User[];
    currentUser: User;
}

const EMOJIS = ['😀', '😂', '❤️', '👍', '🙏', '😭', '🎉', '🤔'];
const RANDOM_REPLIES = [
    'Mình hiểu rồi, cảm ơn bạn nhé!',
    'Tuyệt vời!',
    'Ok, đã nhận thông tin.',
    'Có ai có ý kiến khác không?',
    'Để mình xem lại rồi báo sau nhé.',
    'Haha, hay đấy! 😂'
];

const MessageBubble = React.memo<{ message: ChatMessage, sender?: User, currentUser: User }>(({ message, sender, currentUser }) => {
    const isMe = message.senderId === currentUser.id;
    const roleColor = sender ? ROLE_COLORS[sender.role].primary : '#8E8E93';
    
    return (
        <div className={cn('flex items-end gap-2 max-w-[80%] w-fit', isMe ? 'self-end flex-row-reverse' : 'self-start')}>
            {sender && !isMe && <img src={sender.avatar} alt={sender.name} className="w-8 h-8 rounded-full" />}
            <div className={cn('p-3 rounded-2xl shadow-md', isMe ? 'bg-blue-600 text-white rounded-br-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md')}>
                {!isMe && sender && (
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-bold" style={{ color: roleColor }}>{sender.name}</p>
                        <span
                            className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold text-white"
                            style={{ backgroundColor: roleColor }}
                        >
                            {sender.role}
                        </span>
                    </div>
                )}
                <p className="text-sm break-words">{message.text}</p>
                <p className={cn('text-xs mt-1', isMe ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400', 'text-right')}>{message.timestamp}</p>
            </div>
        </div>
    );
});

const ChannelListItem = React.memo<{ room: ChatRoomType, isActive: boolean, isMuted: boolean, onClick: () => void }>(({ room, isActive, isMuted, onClick }) => {
    const Icon = Icons[room.icon];
    const lastMessage = room.messages[room.messages.length - 1];

    return (
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
    )
});


const Chat: React.FC<ChatProps> = ({ chatRooms, setChatRooms, users, currentUser }) => {
    const { addToast } = useToast();
    
    const availableRooms = useMemo(() => 
        chatRooms.filter(room => !room.allowedRoles || room.allowedRoles.includes(currentUser.role)), 
    [chatRooms, currentUser.role]);
    
    const [activeRoomId, setActiveRoomId] = useState<string | null>(availableRooms[0]?.id || null);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState<User | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isMembersModalOpen, setMembersModalOpen] = useState(false);
    const [mutedRooms, setMutedRooms] = useState<string[]>([]);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);


    const activeRoom = useMemo(() => chatRooms.find(r => r.id === activeRoomId), [chatRooms, activeRoomId]);
    const roomMembers = useMemo(() => {
        if (!activeRoom) return [];
        if (activeRoom.allowedRoles) {
            return users.filter(u => activeRoom.allowedRoles?.includes(u.role));
        }
        return users;
    }, [activeRoom, users]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [activeRoom, isTyping]);
    
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

        const message: ChatMessage = {
            id: Date.now(),
            senderId: currentUser.id,
            text: newMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setChatRooms(prevRooms => prevRooms.map(room => {
            if (room.id === activeRoomId) {
                return { ...room, messages: [...room.messages, message] };
            }
            return room;
        }));

        setNewMessage('');
        
        // Simulate a reply
        const otherMembers = roomMembers.filter(u => u.id !== currentUser.id);
        if (otherMembers.length === 0) return;

        const randomUser = otherMembers[Math.floor(Math.random() * otherMembers.length)];
        const randomReplyText = RANDOM_REPLIES[Math.floor(Math.random() * RANDOM_REPLIES.length)];

        setTimeout(() => {
            setIsTyping(true);
            setTypingUser(randomUser);
        }, 1000);

        setTimeout(() => {
            const reply: ChatMessage = {
                id: Date.now() + 1,
                senderId: randomUser.id,
                text: randomReplyText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setChatRooms(prevRooms => prevRooms.map(room => {
                if (room.id === activeRoomId) {
                    return { ...room, messages: [...room.messages, reply] };
                }
                return room;
            }));
            setIsTyping(false);
            setTypingUser(null);
        }, 3000 + Math.random() * 1000);
    }
    
    const addEmoji = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
    }

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
    
    const handleSelectRoom = useCallback((roomId: string) => {
        setActiveRoomId(roomId);
    }, []);

    return (
        <div className="h-[calc(100vh-8rem)] md:grid md:grid-cols-12 gap-6">
            {/* Channel List - Left Column */}
            <div className="hidden md:col-span-4 lg:col-span-3 md:flex flex-col bg-white/30 dark:bg-gray-950/30 rounded-2xl backdrop-blur-lg border border-white/10 shadow-lg">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-bold">Kênh Chat</h2>
                </div>
                <div className="flex-1 p-2 overflow-y-auto space-y-1">
                    {availableRooms.map(room => (
                        <ChannelListItem 
                            key={room.id} 
                            room={room} 
                            isActive={room.id === activeRoomId}
                            isMuted={mutedRooms.includes(room.id)}
                            onClick={() => handleSelectRoom(room.id)}
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
                                <p className="text-xs text-green-500">{roomMembers.length} thành viên, {Math.floor(roomMembers.length * 0.8)} đang hoạt động</p>
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
                                        </div>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                        </div>
                        
                        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                            {activeRoom.messages.map(msg => (
                                <MessageBubble key={msg.id} message={msg} sender={users.find(u => u.id === msg.senderId)} currentUser={currentUser} />
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
                                                className="absolute bottom-full mb-2 grid grid-cols-4 gap-2 p-2 rounded-lg bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600"
                                            >
                                                {EMOJIS.map(emoji => (
                                                    <button key={emoji} type="button" onClick={() => addEmoji(emoji)} className="text-xl p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                                        {emoji}
                                                    </button>
                                                ))}
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
                                    onChange={(e) => setNewMessage(e.target.value)}
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
                        <div key={user.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50">
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                            <div>
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-xs" style={{ color: ROLE_COLORS[user.role].primary }}>{user.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export default Chat;
