
import React, { useState, createContext, useMemo, useCallback, useEffect, useRef } from 'react';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import News from './pages/News';
import Documents from './pages/Documents';
import Chat from './pages/Chat';
import Memories from './pages/Memories';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Maintenance from './pages/Maintenance';
import ForcePasswordChange from './pages/ForcePasswordChange';
import Notifications from './pages/Notifications';
import { ToastProvider } from './hooks/useToast';
import { UserProfileModal } from './components/UserProfileModal';
import { Post, Document as Doc, User, Memory as Mem, ChatRoom, Notification, WebsiteConfig, Role, Badge, Report } from './types';
import { BADGES } from './constants';
import { initializeSocket, disconnectSocket, getSocket } from './lib/socket';

type Page = 'Bảng điều khiển' | 'Tin tức' | 'Tài liệu' | 'Trò chuyện' | 'Kỷ niệm' | 'Hồ sơ' | 'Quản trị' | 'Thành tích' | 'Thông báo';
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPasswordChangeRequired, setPasswordChangeRequired] = useState(false);
  const [activePage, setActivePage] = useState<Page>('Bảng điều khiển');
  const [theme, setTheme] = useState<Theme>('dark');
  const [isLoading, setIsLoading] = useState(true);
  
  // Lifted state
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig>({
    className: "ClassZone",
    slogan: '"Cùng nhau học, cùng nhau lớn"',
    coverImage: "https://picsum.photos/seed/classbg/1200/400",
    websiteName: "ClassZone",
    websiteTitle: "ClassZone",
    isMaintenanceMode: false,
    allowedPostRoles: [Role.Admin],
    postCategories: ['Thông báo chung', 'Học tập', 'Sự kiện', 'Giải trí'],
    bannerText: '',
    bannerType: 'Info',
    bannerIsActive: false,
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [memories, setMemories] = useState<Mem[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]); // Track online user IDs
  const [viewingUser, setViewingUser] = useState<User | null>(null); // For viewing other user's profile
  const [currentUser, setCurrentUser] = useState<User>({
    id: 0,
    name: '',
    avatar: '',
    coverImage: '',
    role: Role.ThanhVien,
    bio: '',
    major: '',
    joinDate: '',
    contact: { email: '' },
    socials: {},
    posts: 0,
    documents: 0,
    comments: 0,
    points: 0,
    badges: [],
    locked: false,
    mustChangePassword: false
  });
  const [badges, setBadges] = useState<Badge[]>(Object.values(BADGES));
  const [animateBell, setAnimateBell] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  
  // Helper function to transform document type from enum to display
  const transformDocumentType = (doc: any) => ({
    ...doc,
    type: doc.type === 'BaiGiang' ? 'Bài giảng' :
          doc.type === 'De' ? 'Đề' :
          doc.type === 'GhiChu' ? 'Ghi chú' :
          doc.type === 'Khac' ? 'Khác' :
          doc.type
  });

  const transformMemoryStatus = (memory: any) => ({
    ...memory,
    status: memory.status === 'DaDuyet' ? 'đã duyệt' :
            memory.status === 'ChoDuyet' ? 'chờ duyệt' :
            memory.status
  });
  
  // Track if data has been loaded to prevent duplicate API calls
  const dataLoaded = useRef(false);
  const configLoaded = useRef(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const user = JSON.parse(savedUser);
          
          // Check if user is locked
          if (user.locked) {
            console.warn('⚠️ User account is locked');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            const confirmOpen = window.confirm('⚠️ Tài khoản của bạn đã bị khoá.\n\nBấm OK để liên hệ quản trị viên qua Facebook.');
            if (confirmOpen) {
              window.open('https://facebook.com/tuanvik206', '_blank');
            }
            setIsLoading(false);
            return;
          }
          
          setCurrentUser(user);
          setIsAuthenticated(true);
          
          if (user.mustChangePassword) {
            setPasswordChangeRequired(true);
          }
        } catch (error) {
          console.error('Failed to parse user data:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Load website config from backend
  useEffect(() => {
    // Prevent duplicate loads - check and set IMMEDIATELY
    if (configLoaded.current) return;
    configLoaded.current = true;
    
    const loadConfig = async () => {
      try {
        const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
          ? import.meta.env.VITE_API_URL 
          : 'http://localhost:5000/api';
        
        const response = await fetch(`${API_URL}/config`);
        
        if (response.ok) {
          const config = await response.json();
          console.log('📋 Loaded website config:', config);
          console.log('🔐 Allowed post roles from backend:', config.allowedPostRoles);
          
          // Ensure allowedPostRoles has a default value if undefined
          if (!config.allowedPostRoles || config.allowedPostRoles.length === 0) {
            config.allowedPostRoles = [Role.Admin, Role.LopTruong, Role.BiThu];
            console.log('🔐 Using default allowedPostRoles:', config.allowedPostRoles);
          }
          
          setWebsiteConfig(config);
        } else {
          console.error('❌ Failed to load config:', response.status);
        }
      } catch (error) {
        console.error('Failed to load website config:', error);
        // Keep using MOCK_WEBSITE_CONFIG as fallback
      }
    };

    loadConfig();
  }, []);

  // Load posts from backend
  useEffect(() => {
    if (!isAuthenticated) {
      // Reset flag when logged out
      dataLoaded.current = false;
      return;
    }
    
    // Prevent duplicate loads - check and set IMMEDIATELY
    if (dataLoaded.current) return;
    dataLoaded.current = true;
    
    const loadAllData = async () => {
      try {
        const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
          ? import.meta.env.VITE_API_URL 
          : 'http://localhost:5000/api';
        
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          console.error('❌ No access token found, please login again');
          setIsAuthenticated(false);
          dataLoaded.current = false; // Reset flag on error
          return;
        }
        
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        // Reload website config to get latest settings (including allowedPostRoles)
        const configRes = await fetch(`${API_URL}/config`);
        if (configRes.ok) {
          const configData = await configRes.json();
          console.log('🔄 Reloaded config on login:', configData);
          console.log('🔐 Latest allowed post roles from backend:', configData.allowedPostRoles);
          
          // Ensure allowedPostRoles has a default value if undefined
          if (!configData.allowedPostRoles || configData.allowedPostRoles.length === 0) {
            configData.allowedPostRoles = [Role.Admin, Role.LopTruong, Role.BiThu];
            console.log('🔐 Using default allowedPostRoles:', configData.allowedPostRoles);
          }
          
          setWebsiteConfig(configData);
        }

        // Load all data in parallel
        const [postsRes, docsRes, memsRes, usersRes, chatRoomsRes, reportsRes, notificationsRes, badgesRes] = await Promise.all([
          fetch(`${API_URL}/posts`, { headers }),
          fetch(`${API_URL}/documents`, { headers }),
          fetch(`${API_URL}/memories`, { headers }),
          fetch(`${API_URL}/users`, { headers }),
          fetch(`${API_URL}/chat/rooms`, { headers }),
          fetch(`${API_URL}/reports`, { headers }),
          fetch(`${API_URL}/notifications`, { headers }),
          fetch(`${API_URL}/badges`, { headers })
        ]);
        
        // Check for authentication errors
        if (postsRes.status === 401 || docsRes.status === 401 || memsRes.status === 401 || usersRes.status === 401) {
          console.error('❌ Authentication failed (401). Token may be expired. Please login again.');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          dataLoaded.current = false; // Reset flag on error
          return;
        }
        
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          console.log('✅ Loaded posts:', postsData.length);
          
          // Transform backend data to frontend format
          const transformedPosts = postsData.map((post: any) => ({
            ...post,
            comments: post.comments?.map((comment: any) => ({
              id: comment.id,
              postId: post.id,
              authorId: comment.authorId,
              content: comment.content,
              timestamp: new Date(comment.createdAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Ho_Chi_Minh'
              }),
            })) || [],
            upvotedBy: post.votes?.filter((v: any) => v.isUpvote).map((v: any) => v.userId) || [],
            downvotedBy: post.votes?.filter((v: any) => !v.isUpvote).map((v: any) => v.userId) || [],
          }));
          
          setPosts(transformedPosts);
        } else {
          console.error('❌ Failed to load posts:', postsRes.status, postsRes.statusText);
        }

        if (docsRes.ok) {
          const docsData = await docsRes.json();
          console.log('✅ Loaded documents:', docsData.length);
          const transformedDocs = docsData.map(transformDocumentType);
          setDocuments(transformedDocs);
        } else {
          console.error('❌ Failed to load documents:', docsRes.status, docsRes.statusText);
        }

        if (memsRes.ok) {
          const memsData = await memsRes.json();
          console.log('✅ Loaded memories:', memsData.length);
          const transformedMems = memsData.map(transformMemoryStatus);
          setMemories(transformedMems);
        } else {
          console.error('❌ Failed to load memories:', memsRes.status, memsRes.statusText);
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          console.log('✅ Loaded users:', usersData.length);
          setUsers(usersData);
        } else {
          console.error('❌ Failed to load users:', usersRes.status, usersRes.statusText);
        }

        if (chatRoomsRes.ok) {
          const chatRoomsData = await chatRoomsRes.json();
          console.log('✅ Loaded chat rooms:', chatRoomsData.length);
          // Transform backend data to frontend format
          const transformedRooms = chatRoomsData.map((room: any) => ({
            id: room.id,
            name: room.name,
            description: room.description,
            icon: room.icon,
            messages: room.messages || [], // Keep existing messages or initialize empty
            allowedRoles: room.allowedRoles?.map((ar: any) => ar.role) || null,
            members: room.members?.map((m: any) => m.userId) || null,
          }));
          
          // Merge with existing rooms to preserve messages
          setChatRooms(prevRooms => {
            if (prevRooms.length === 0) return transformedRooms;
            
            return transformedRooms.map(newRoom => {
              const existingRoom = prevRooms.find(r => r.id === newRoom.id);
              return existingRoom ? { ...newRoom, messages: existingRoom.messages } : newRoom;
            });
          });
        } else {
          console.error('❌ Failed to load chat rooms:', chatRoomsRes.status, chatRoomsRes.statusText);
        }

        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          console.log('✅ Loaded reports:', reportsData.length);
          console.log('📋 Reports data:', reportsData);
          
          // Transform backend data to frontend format
          const transformedReports = reportsData.map((report: any) => ({
            id: report.id,
            contentType: report.contentType,
            contentId: report.contentId,
            reporterId: report.reporterId,
            reason: report.reason,
            details: report.details || '',
            timestamp: new Date(report.createdAt).toLocaleString('vi-VN'),
            status: report.status === 'Pending' ? 'pending' : 'resolved',
          }));
          
          setReports(transformedReports);
          console.log('✅ Transformed reports:', transformedReports);
        } else {
          console.error('❌ Failed to load reports:', reportsRes.status, reportsRes.statusText);
        }

        if (notificationsRes.ok) {
          const notificationsData = await notificationsRes.json();
          console.log('✅ Loaded notifications:', notificationsData.length);
          setNotifications(notificationsData);
        } else {
          console.error('❌ Failed to load notifications:', notificationsRes.status, notificationsRes.statusText);
        }

        if (badgesRes.ok) {
          const badgesData = await badgesRes.json();
          console.log('✅ Loaded badges:', badgesData.length);
          setBadges(badgesData);
        } else {
          console.error('❌ Failed to load badges:', badgesRes.status, badgesRes.statusText);
        }

        console.log('🎉 All data synced from backend!');
      } catch (error) {
        console.error('❌ Failed to load data:', error);
      }
    };

    loadAllData();
  }, [isAuthenticated]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      setOnlineUsers([]);
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // Initialize socket
    const socketInstance = initializeSocket(token);
    setSocket(socketInstance);

    // Listen for online users list
    socketInstance.on('users:online', (data: { userIds: number[] }) => {
      console.log('👥 Online users:', data.userIds);
      setOnlineUsers(data.userIds);
    });

    // Listen for user coming online
    socketInstance.on('user:online', (data: { userId: number }) => {
      console.log('✅ User online:', data.userId);
      setOnlineUsers(prev => {
        if (prev.includes(data.userId)) return prev;
        return [...prev, data.userId];
      });
    });

    // Listen for user going offline
    socketInstance.on('user:offline', (data: { userId: number }) => {
      console.log('❌ User offline:', data.userId);
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    });

    // Real-time updates for posts
    socketInstance.on('post:update', (data: { action: string; post: any }) => {
      console.log('📰 Post update:', data.action, data.post);
      if (data.action === 'create') {
        setPosts(prev => [data.post, ...prev]);
      } else if (data.action === 'update') {
        setPosts(prev => prev.map(p => p.id === data.post.id ? { ...p, ...data.post } : p));
      } else if (data.action === 'delete') {
        setPosts(prev => prev.filter(p => p.id !== data.post.id));
      }
    });

    // Real-time updates for comments
    socketInstance.on('comment:update', (data: { action: string; postId: number; comment?: any }) => {
      console.log('💬 Comment update:', data.action, data.postId);
      if (data.action === 'create' && data.comment) {
        const transformedComment = {
          id: data.comment.id,
          postId: data.postId,
          authorId: data.comment.authorId,
          content: data.comment.content,
          timestamp: new Date(data.comment.createdAt).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh'
          }),
        };
        setPosts(prev => prev.map(p => 
          p.id === data.postId 
            ? { ...p, comments: [...(p.comments || []), transformedComment] }
            : p
        ));
      } else if (data.action === 'delete') {
        setPosts(prev => prev.map(p => ({
          ...p,
          comments: p.comments?.filter(c => c.postId === data.postId) || []
        })));
      }
    });

    // Real-time updates for votes
    socketInstance.on('vote:update', (data: { postId: number; votes: any[] }) => {
      console.log('👍 Vote update:', data.postId);
      const upvotedBy = data.votes.filter((v: any) => v.isUpvote).map((v: any) => v.userId);
      const downvotedBy = data.votes.filter((v: any) => !v.isUpvote).map((v: any) => v.userId);
      setPosts(prev => prev.map(p => 
        p.id === data.postId 
          ? { ...p, upvotedBy, downvotedBy }
          : p
      ));
    });

    // Real-time updates for reports
    socketInstance.on('report:update', (data: { action: string; report: any }) => {
      console.log('🚩 Report update:', data.action);
      if (data.action === 'create') {
        const transformedReport: Report = {
          id: data.report.id,
          contentType: data.report.contentType,
          contentId: data.report.contentId,
          reporterId: data.report.reporterId,
          reason: data.report.reason,
          details: data.report.details || '',
          timestamp: new Date(data.report.createdAt).toLocaleString('vi-VN'),
          status: (data.report.status === 'Pending' ? 'pending' : 'resolved') as 'pending' | 'resolved',
        };
        setReports(prev => [transformedReport, ...prev]);
      } else if (data.action === 'update') {
        setReports(prev => prev.map(r => 
          r.id === data.report.id 
            ? { ...r, status: (data.report.status === 'Pending' ? 'pending' : 'resolved') as 'pending' | 'resolved' }
            : r
        ));
      }
    });

    // Real-time updates for documents
    socketInstance.on('document:update', (data: { action: string; document: any }) => {
      console.log('📄 Document update:', data.action, data.document);
      const transformedDoc = transformDocumentType(data.document);
      
      if (data.action === 'create') {
        setDocuments(prev => [transformedDoc, ...prev]);
      } else if (data.action === 'update') {
        setDocuments(prev => prev.map(d => d.id === transformedDoc.id ? { ...d, ...transformedDoc } : d));
      } else if (data.action === 'delete') {
        setDocuments(prev => prev.filter(d => d.id !== data.document.id));
      }
    });

    // Real-time updates for memories
    socketInstance.on('memory:update', (data: { action: string; memory: any }) => {
      console.log('🎞️ Memory update:', data.action, data.memory);
      const transformedMemory = transformMemoryStatus(data.memory);
      
      if (data.action === 'create') {
        setMemories(prev => [transformedMemory, ...prev]);
      } else if (data.action === 'update') {
        setMemories(prev => prev.map(m => m.id === transformedMemory.id ? { ...m, ...transformedMemory } : m));
      } else if (data.action === 'delete') {
        setMemories(prev => prev.filter(m => m.id !== data.memory.id));
      }
    });

    // Real-time updates for config (banner, maintenance mode, etc)
    socketInstance.on('config:update', (config: any) => {
      console.log('⚙️ Config update:', config);
      setWebsiteConfig(config);
    });

    // Real-time updates for notifications
    socketInstance.on('notification:update', (data: { action: string; notification: any }) => {
      console.log('🔔 Notification update:', data.action, data.notification);
      
      if (data.action === 'create' && data.notification) {
        setNotifications(prev => [data.notification, ...prev]);
        setAnimateBell(true);
        setTimeout(() => setAnimateBell(false), 1000);
      } else if (data.action === 'update' && data.notification) {
        setNotifications(prev => prev.map(n => 
          n.id === data.notification.id ? { ...n, ...data.notification } : n
        ));
      } else if (data.action === 'delete' && data.notification) {
        setNotifications(prev => prev.filter(n => n.id !== data.notification.id));
      }
    });

    // Real-time badge awards
    socketInstance.on('badge:awarded', async (data: { badge: any }) => {
      console.log('🎖️ Badge awarded:', data.badge);
      
      // Fetch updated user data to get correct badges format
      try {
        const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
          ? import.meta.env.VITE_API_URL 
          : 'http://localhost:5000/api';
          
        const response = await fetch(`${API_URL}/users/${currentUser.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(prev => ({ ...prev, badges: userData.badges }));
          
          // Show toast notification
          const toast = document.createElement('div');
          toast.className = 'fixed top-4 right-4 bg-emerald-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-slide-in';
          toast.innerHTML = `
            <div class="flex items-center gap-3">
              <div class="text-2xl">🎖️</div>
              <div>
                <div class="font-bold">Danh hiệu mới!</div>
                <div class="text-sm">Bạn vừa nhận được "${data.badge.name}"</div>
              </div>
            </div>
          `;
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 5000);
        }
      } catch (error) {
        console.error('Failed to fetch updated user badges:', error);
      }
    });

    // Real-time user badges update (for leaderboard)
    socketInstance.on('user:badges:update', async (data: { userId: number; badge: any }) => {
      console.log('👤 User badges update:', data.userId, data.badge);
      
      // Fetch updated user to get correct badges format
      try {
        const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
          ? import.meta.env.VITE_API_URL 
          : 'http://localhost:5000/api';
          
        const response = await fetch(`${API_URL}/users/${data.userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUsers(prev => prev.map(user => 
            user.id === data.userId ? { ...user, badges: userData.badges } : user
          ));
        }
      } catch (error) {
        console.error('Failed to fetch updated user badges:', error);
      }
    });

    // Real-time chat history cleared
    socketInstance.on('chat:history:cleared', (data: { roomId: string; period: string; deletedCount: number }) => {
      console.log('🗑️ Chat history cleared:', data.roomId, data.period, data.deletedCount);
      
      setChatRooms(prev => prev.map(room => {
        if (room.id === data.roomId) {
          // Calculate cutoff date based on period
          if (data.period === 'all') {
            return { ...room, messages: [] };
          } else {
            const now = new Date();
            let cutoffDate: Date;
            
            if (data.period === '7days') {
              cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            } else { // 1month
              cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }
            
            // Keep only messages newer than cutoff
            return {
              ...room,
              messages: room.messages.filter(msg => {
                const msgDate = new Date(msg.timestamp);
                return msgDate > cutoffDate;
              })
            };
          }
        }
        return room;
      }));
    });

    // Real-time updates for user status (locked/unlocked)
    socketInstance.on('user:update', (data: { action: string; user: any }) => {
      console.log('👤 User update:', data.action, data.user);
      if (data.action === 'update' && data.user) {
        // Update user in list
        setUsers(prev => prev.map(u => u.id === data.user.id ? { ...u, ...data.user } : u));
        
        // Check if current user was locked
        if (data.user.id === currentUser.id && data.user.locked) {
          // Show alert and logout
          setTimeout(() => {
            const confirmOpen = window.confirm('⚠️ Tài khoản của bạn đã bị khoá bởi quản trị viên.\n\nBấm OK để liên hệ quản trị viên qua Facebook.');
            if (confirmOpen) {
              window.open('https://facebook.com/tuanvik206', '_blank');
            }
            // Perform logout
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setPasswordChangeRequired(false);
            window.location.reload(); // Force reload to login page
          }, 500);
        } else if (data.user.id === currentUser.id) {
          // Update current user data
          setCurrentUser(prev => ({ ...prev, ...data.user }));
        }
      }
    });

    // Cleanup
    return () => {
      socketInstance.off('users:online');
      socketInstance.off('user:online');
      socketInstance.off('user:offline');
      socketInstance.off('post:update');
      socketInstance.off('comment:update');
      socketInstance.off('vote:update');
      socketInstance.off('report:update');
      socketInstance.off('document:update');
      socketInstance.off('memory:update');
      socketInstance.off('config:update');
      socketInstance.off('notification:update');
      socketInstance.off('user:update');
    };
  }, [isAuthenticated, currentUser.id]);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers(currentUsers => currentUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  }, [currentUser]);

  const handleLogin = useCallback(() => {
    // Get user from localStorage (set by Login.tsx)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        if (user.mustChangePassword) {
          setPasswordChangeRequired(true);
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, []);

  const handleLogout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    setIsAuthenticated(false);
    setPasswordChangeRequired(false);
    // Clear current user
    setCurrentUser({
      id: 0,
      name: '',
      avatar: '',
      coverImage: '',
      role: Role.ThanhVien,
      bio: '',
      major: '',
      joinDate: '',
      contact: { email: '' },
      socials: {},
      posts: 0,
      documents: 0,
      comments: 0,
      points: 0,
      badges: [],
      locked: false,
      mustChangePassword: false
    });
  }, []);

  const handlePasswordUpdated = useCallback(() => {
    const updatedUser = { ...currentUser, mustChangePassword: false };
    updateUser(updatedUser);
    setPasswordChangeRequired(false);
  }, [currentUser, updateUser]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newTheme;
    });
  }, []);
  
  // Set initial theme
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Removed: Simulate initial data loading - now handled by checkAuth
  // useEffect(() => {
  //   const timer = setTimeout(() => setIsLoading(false), 1500);
  //   return () => clearTimeout(timer);
  // }, []);

  // Simulate real-time notifications - DEPRECATED: Now using API
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //       if (!isAuthenticated || isLoading) return;
  //       const newNotif: Notification = {
  //           id: Date.now(),
  //           userId: currentUser.id,
  //           type: 'system',
  //           title: 'Thông báo hệ thống',
  //           text: `Đây là một thông báo hệ thống tự động. Thời gian: ${new Date().toLocaleTimeString('vi-VN')}`,
  //           createdAt: new Date().toISOString(),
  //           read: false,
  //       };
  //       setNotifications(prev => [newNotif, ...prev]);
  //       setAnimateBell(true);
  //   }, 30000); // Every 30 seconds

  //   return () => clearInterval(interval);
  // }, [isAuthenticated, isLoading]);

  // Set website title
  useEffect(() => {
    document.title = websiteConfig.websiteTitle;
  }, [websiteConfig.websiteTitle]);

  const themeValue = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  const renderPage = () => {
    switch (activePage) {
      case 'Bảng điều khiển':
        return <Dashboard 
          websiteConfig={websiteConfig} 
          posts={posts} 
          documents={documents} 
          users={users} 
          memories={memories} 
          isLoading={isLoading}
        />;
      case 'Tin tức':
        return <News posts={posts} setPosts={setPosts} users={users} currentUser={currentUser} websiteConfig={websiteConfig} reports={reports} setReports={setReports} isLoading={isLoading} />;
      case 'Tài liệu':
        return <Documents documents={documents} setDocuments={setDocuments} users={users} currentUser={currentUser} />;
      case 'Trò chuyện':
        return <Chat chatRooms={chatRooms} setChatRooms={setChatRooms} users={users} currentUser={currentUser} onlineUsers={onlineUsers} onViewProfile={setViewingUser} />;
      case 'Kỷ niệm':
        return <Memories memories={memories} setMemories={setMemories} users={users} currentUser={currentUser} isLoading={isLoading} />;
      case 'Hồ sơ':
        return <Profile 
          user={currentUser} 
          updateUser={updateUser}
          posts={posts} 
          documents={documents} 
          setActivePage={setActivePage}
          badges={badges}
        />;
      case 'Quản trị':
        return <Admin 
          websiteConfig={websiteConfig} 
          setWebsiteConfig={setWebsiteConfig}
          posts={posts}
          setPosts={setPosts}
          users={users}
          setUsers={setUsers}
          documents={documents}
          setDocuments={setDocuments}
          memories={memories}
          setMemories={setMemories}
          chatRooms={chatRooms}
          setChatRooms={setChatRooms}
          notifications={notifications}
          setNotifications={setNotifications}
          currentUser={currentUser}
          badges={badges}
          setBadges={setBadges}
          reports={reports}
          setReports={setReports}
          socket={socket}
        />;
      case 'Thành tích':
        return <Leaderboard users={users} onViewProfile={setViewingUser} />;
      case 'Thông báo':
        return <Notifications 
          socket={socket} 
          notifications={notifications}
          setNotifications={setNotifications}
        />;
      default:
        return <Dashboard 
          websiteConfig={websiteConfig} 
          posts={posts} 
          documents={documents} 
          users={users} 
          memories={memories}
          isLoading={isLoading}
        />;
    }
  };

  const isUnderMaintenance = websiteConfig.isMaintenanceMode;
  const isAdmin = isAuthenticated && currentUser.role === Role.Admin;

  const renderContent = () => {
    if (isUnderMaintenance && !isAdmin) {
        return <Maintenance />;
    }
    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} websiteConfig={websiteConfig} />;
    }
    if (isPasswordChangeRequired) {
        return <ForcePasswordChange onPasswordChanged={handlePasswordUpdated} />;
    }
    return (
        <Layout 
          activePage={activePage} 
          setActivePage={setActivePage} 
          onLogout={handleLogout}
          notifications={notifications}
          setNotifications={setNotifications}
          currentUser={currentUser}
          websiteConfig={websiteConfig}
          animateBell={animateBell}
          setAnimateBell={setAnimateBell}
          posts={posts}
          documents={documents}
          users={users}
        >
          {renderPage()}
        </Layout>
    );
  };
  
  return (
    <ThemeContext.Provider value={themeValue}>
      <ToastProvider>
        <div className="bg-slate-100 dark:bg-slate-950 text-gray-800 dark:text-gray-200 min-h-screen font-sans">
          {renderContent()}
          
          {/* User Profile Modal */}
          <UserProfileModal 
            user={viewingUser}
            isOpen={!!viewingUser}
            onClose={() => setViewingUser(null)}
          />
        </div>
      </ToastProvider>
    </ThemeContext.Provider>
  );
};

export default App;
