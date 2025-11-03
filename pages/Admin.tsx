import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card } from '../components/ui/Card';
import { ROLE_COLORS, ROLE_NAMES } from '../constants';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/icons';
import { cn } from '../lib/utils';
import { Role, User, Post, WebsiteConfig, Document as DocType, Memory as MemoryType, Badge, Report, Comment, ChatRoom, Notification } from '../types';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../hooks/useToast';

interface AdminProps {
    websiteConfig: WebsiteConfig;
    setWebsiteConfig: React.Dispatch<React.SetStateAction<WebsiteConfig>>;
    posts: Post[];
    setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    documents: DocType[];
    setDocuments: React.Dispatch<React.SetStateAction<DocType[]>>;
    memories: MemoryType[];
    setMemories: React.Dispatch<React.SetStateAction<MemoryType[]>>;
    chatRooms: ChatRoom[];
    setChatRooms: React.Dispatch<React.SetStateAction<ChatRoom[]>>;
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
    currentUser: User;
    badges: Badge[];
    setBadges: React.Dispatch<React.SetStateAction<Badge[]>>;
    reports: Report[];
    setReports: React.Dispatch<React.SetStateAction<Report[]>>;
    socket: any; // Socket for realtime updates
}

const initialNewUserState = {
    name: '',
    email: '',
    major: '',
    role: Role.ThanhVien,
};

const SystemMonitor = () => {
    const [status, setStatus] = useState({ text: 'All Systems Operational', color: 'text-green-500' });
    const [cpu, setCpu] = useState(0);
    const [memory, setMemory] = useState({ used: 0, total: 16 });
    const [db, setDb] = useState(0);
    const [apiTime, setApiTime] = useState(0);
    const [liveChartData, setLiveChartData] = useState<any[]>([]);
    const [activityLog, setActivityLog] = useState<string[]>([]);

    useEffect(() => {
        const initialData = Array.from({ length: 20 }, (_, i) => ({
            time: new Date(Date.now() - (20 - i) * 3000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            cpu: Math.floor(Math.random() * (60 - 30) + 30),
            memory: parseFloat((Math.random() * (10 - 8) + 8).toFixed(1)),
        }));
        setLiveChartData(initialData);

        const interval = setInterval(() => {
            const newCpu = Math.floor(Math.random() * (95 - 25) + 25);
            const newMem = parseFloat((Math.random() * (12 - 7) + 7).toFixed(1));

            setCpu(newCpu);
            setMemory(prev => ({ ...prev, used: newMem }));
            setDb(Math.floor(Math.random() * (85 - 20) + 20));
            setApiTime(Math.floor(Math.random() * (150 - 40) + 40));
            
            if (newCpu > 90) {
                setStatus({ text: 'High CPU Load', color: 'text-red-500' });
            } else if (newCpu > 70) {
                setStatus({ text: 'Moderate CPU Load', color: 'text-yellow-500' });
            } else {
                setStatus({ text: 'All Systems Operational', color: 'text-green-500' });
            }

            setLiveChartData(prev => [
                ...prev.slice(1),
                {
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    cpu: newCpu,
                    memory: newMem,
                }
            ]);

            const activities = ["User Nguyễn Văn An logged in", "New post created: 'Thông báo'", "Backup successful", "Database query executed in 75ms", "Memory usage reached 10.2GB"];
            if (Math.random() > 0.7) {
                setActivityLog(prev => [
                    `${new Date().toLocaleTimeString()} - ${activities[Math.floor(Math.random() * activities.length)]}`,
                    ...prev.slice(0, 4)
                ]);
            }

        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-lg font-semibold mb-2">Trạng thái hệ thống</h2>
                <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full animate-pulse", status.color.replace('text-', 'bg-'))}></div>
                    <p className={cn("font-bold", status.color)}>{status.text}</p>
                </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <div className="flex items-center gap-3 mb-2">
                        <Icons.Cpu className="w-6 h-6 text-blue-500"/>
                        <h3 className="font-semibold">CPU Usage</h3>
                    </div>
                    <p className="text-3xl font-bold">{cpu}<span className="text-lg">%</span></p>
                </Card>
                <Card>
                    <div className="flex items-center gap-3 mb-2">
                        <Icons.Server className="w-6 h-6 text-green-500"/>
                        <h3 className="font-semibold">Memory Usage</h3>
                    </div>
                    <p className="text-3xl font-bold">{memory.used.toFixed(1)}<span className="text-lg"> / {memory.total} GB</span></p>
                </Card>
                <Card>
                    <div className="flex items-center gap-3 mb-2">
                        <Icons.DatabaseZap className="w-6 h-6 text-purple-500"/>
                        <h3 className="font-semibold">DB Connections</h3>
                    </div>
                    <p className="text-3xl font-bold">{db}<span className="text-lg"> / 100</span></p>
                </Card>
                <Card>
                    <div className="flex items-center gap-3 mb-2">
                        <Icons.Timer className="w-6 h-6 text-yellow-500"/>
                        <h3 className="font-semibold">API Response</h3>
                    </div>
                    <p className="text-3xl font-bold">{apiTime}<span className="text-lg"> ms</span></p>
                </Card>
            </div>
            <Card>
                <h2 className="text-lg font-semibold mb-4">Hiệu suất theo thời gian thực</h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={liveChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
                            <XAxis dataKey="time" stroke="currentColor" fontSize={12} />
                            <YAxis yAxisId="left" stroke="#3b82f6" label={{ value: 'CPU (%)', angle: -90, position: 'insideLeft', fill: 'currentColor' }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#22c55e" label={{ value: 'Memory (GB)', angle: -90, position: 'insideRight', fill: 'currentColor' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', borderColor: 'rgba(128, 128, 0.5)', borderRadius: '0.5rem' }} />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="cpu" name="CPU Usage (%)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            <Line yAxisId="right" type="monotone" dataKey="memory" name="Memory (GB)" stroke="#22c55e" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>
            <Card>
                <h2 className="text-lg font-semibold mb-4">Nhật ký hoạt động gần đây</h2>
                <div className="space-y-2 text-sm font-mono max-h-48 overflow-y-auto pr-2">
                    {activityLog.length > 0 ? activityLog.map((log, index) => (
                         <p key={index} className="text-gray-500 dark:text-gray-400">{log}</p>
                    )) : <p className="text-gray-500">Chưa có hoạt động nào.</p>}
                </div>
            </Card>
        </div>
    );
}

const Admin: React.FC<AdminProps> = (props) => {
  const { 
    websiteConfig, setWebsiteConfig, 
    posts, setPosts, 
    users, setUsers,
    documents, setDocuments,
    memories, setMemories,
    chatRooms, setChatRooms,
    notifications, setNotifications,
    currentUser,
    badges, setBadges,
    reports, setReports,
    socket
  } = props;

  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('stats');
  
  // Calculate chart data from real data
  const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);
  const chartData = [
    { name: 'Bài đăng', value: posts.length },
    { name: 'Tài liệu', value: documents.length },
    { name: 'Bình luận', value: totalComments },
    { name: 'Kỷ niệm', value: memories.length },
    { name: 'Thành viên', value: users.length },
  ];
  
  // Member management state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmUserAction, setConfirmUserAction] = useState<{ type: 'lock' | 'unlock' | 'delete'; user: User } | null>(null);
  const [isCreateUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState(initialNewUserState);

  // General settings state
  const [configFormData, setConfigFormData] = useState<WebsiteConfig>(websiteConfig);

  // Content management state
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);

  // Moderation
  const [previewContent, setPreviewContent] = useState<DocType | MemoryType | null>(null);
  const pendingDocuments = documents.filter(d => d.status === 'ChoDuyet');
  const pendingMemories = memories.filter(m => m.status === 'ChoDuyet');
  
  // Achievement management state
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [deletingBadge, setDeletingBadge] = useState<Badge | null>(null);
  const [badgeFormData, setBadgeFormData] = useState<Omit<Badge, 'id'>>({ name: '', description: '', icon: 'Award', color: 'text-gray-400', requiredPoints: 0, category: 'all' });
  
  // User badge management state
  const [managingUserBadges, setManagingUserBadges] = useState<User | null>(null);
  const [userBadgeModalOpen, setUserBadgeModalOpen] = useState(false);
  
  // Report management state
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const pendingReports = reports.filter(r => r.status === 'pending');
  
  // Backup & Restore
  const [isRestoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [restoreData, setRestoreData] = useState<any>(null);
  const [backupList, setBackupList] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch backup list from server
  const fetchBackupList = async () => {
    try {
      const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
        ? import.meta.env.VITE_API_URL 
        : 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_URL}/backup/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const backups = await response.json();
        setBackupList(backups);
      }
    } catch (error) {
      console.error('Failed to fetch backup list:', error);
    }
  };
  
  // Restore from server backup
  const handleRestoreFromServer = async (filename: string) => {
    try {
      addToast({ title: 'Đang khôi phục...', message: 'Vui lòng đợi', type: 'info' });
      
      const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
        ? import.meta.env.VITE_API_URL 
        : 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');
      
      // Download backup file
      const downloadResponse = await fetch(`${API_URL}/backup/download/${filename}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!downloadResponse.ok) throw new Error('Failed to download backup');
      
      const backupData = await downloadResponse.json();
      
      // Restore to database
      const restoreResponse = await fetch(`${API_URL}/backup/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ backupData })
      });
      
      if (!restoreResponse.ok) throw new Error('Failed to restore backup');
      
      addToast({ 
        title: 'Thành công!', 
        message: 'Đã khôi phục dữ liệu. Trang sẽ tải lại...', 
        type: 'success' 
      });
      
      // Reload page after 2 seconds
      setTimeout(() => window.location.reload(), 2000);
      
    } catch (error) {
      console.error('Restore error:', error);
      addToast({ title: 'Lỗi!', message: 'Không thể khôi phục backup.', type: 'error' });
    }
  };
  
  // Track if admin data has been loaded to prevent duplicate API calls
  const adminDataLoaded = useRef(false);

  // Load data from backend on mount
  useEffect(() => {
    // Prevent duplicate loads (especially in React Strict Mode)
    if (adminDataLoaded.current) return;
    
    const loadAdminData = async () => {
      try {
        adminDataLoaded.current = true; // Mark as loading
        
        const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
          ? import.meta.env.VITE_API_URL 
          : 'http://localhost:5000/api';
        
        const token = localStorage.getItem('accessToken');
        
        if (!token) return;

        // Load users
        const usersRes = await fetch(`${API_URL}/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }

        // Load documents (including pending)
        const docsRes = await fetch(`${API_URL}/documents?includeAll=true`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          setDocuments(docsData);
        }

        // Load memories (including pending)
        const memsRes = await fetch(`${API_URL}/memories?includeAll=true`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (memsRes.ok) {
          const memsData = await memsRes.json();
          setMemories(memsData);
        }

        // Load posts
        const postsRes = await fetch(`${API_URL}/posts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData);
        }

        // Load badges
        const badgesRes = await fetch(`${API_URL}/badges`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (badgesRes.ok) {
          const badgesData = await badgesRes.json();
          setBadges(badgesData);
        }
        
        // Load backup list
        fetchBackupList();
        
      } catch (error) {
        console.error('Failed to load admin data:', error);
      }
    };

    loadAdminData();
  }, []);

  // Socket listener for realtime user updates (lock/unlock)
  useEffect(() => {
    if (!socket) return;

    const handleUserUpdate = (data: { action: string; user: any }) => {
      console.log('👤 Admin panel - User update:', data.action, data.user);
      
      // Update users list in real-time
      if (data.action === 'update' && data.user) {
        setUsers(prev => prev.map(u => 
          u.id === data.user.id ? { ...u, ...data.user } : u
        ));
      }
    };

    socket.on('user:update', handleUserUpdate);

    return () => {
      socket.off('user:update', handleUserUpdate);
    };
  }, [socket, setUsers]);

  const handleRestore = () => {
    const fileInput = document.getElementById('restore-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleBackup = () => {
    try {
        const appState = {
            websiteConfig, posts, users, documents, memories, chatRooms, notifications, badges, reports
        };
        const jsonString = JSON.stringify(appState, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().slice(0, 10);
        a.download = `classzone_backup_${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast({ title: 'Thành công!', message: 'Đã tạo bản sao lưu dữ liệu.', type: 'success' });
    } catch (error) {
        console.error("Backup failed:", error);
        addToast({ title: 'Lỗi!', message: 'Không thể tạo bản sao lưu.', type: 'error' });
    }
  };

  const handleRestoreFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const text = e.target?.result;
              if (typeof text === 'string') {
                  const data = JSON.parse(text);
                  // Basic validation
                  if (data && data.websiteConfig && data.users) {
                      setRestoreData(data);
                      setRestoreConfirmOpen(true);
                  } else {
                      throw new Error('Tệp không hợp lệ.');
                  }
              }
          } catch (error) {
              addToast({ title: 'Lỗi!', message: 'Tệp sao lưu không hợp lệ hoặc bị hỏng.', type: 'error' });
          }
      };
      reader.readAsText(file);
      // Reset input value to allow selecting the same file again
      event.target.value = '';
  };
  
  const handleConfirmRestore = () => {
      if (!restoreData) return;
      try {
          setWebsiteConfig(restoreData.websiteConfig);
          setPosts(restoreData.posts);
          setUsers(restoreData.users);
          setDocuments(restoreData.documents);
          setMemories(restoreData.memories);
          setChatRooms(restoreData.chatRooms);
          setNotifications(restoreData.notifications);
          setBadges(restoreData.badges);
          setReports(restoreData.reports);
          
          addToast({ title: 'Thành công!', message: 'Dữ liệu đã được khôi phục.', type: 'success' });
      } catch (error) {
          addToast({ title: 'Lỗi!', message: 'Đã xảy ra lỗi trong quá trình khôi phục.', type: 'error' });
      } finally {
          setRestoreConfirmOpen(false);
          setRestoreData(null);
      }
  };


  const handleApprove = async (type: 'document' | 'memory', id: number) => {
    try {
        const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
            ? import.meta.env.VITE_API_URL 
            : 'http://localhost:5000/api';
        
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            addToast({ title: 'Lỗi', message: 'Vui lòng đăng nhập lại.', type: 'error' });
            return;
        }

        const endpoint = type === 'document' ? 'documents' : 'memories';
        const response = await fetch(`${API_URL}/${endpoint}/${id}/approve`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to approve ${type}`);
        }

        if (type === 'document') {
            setDocuments(prev => prev.map(d => d.id === id ? { ...d, status: 'DaDuyet' } : d));
            addToast({ title: 'Đã duyệt!', message: 'Tài liệu đã được hiển thị công khai.', type: 'success' });
        } else {
            setMemories(prev => prev.map(m => m.id === id ? { ...m, status: 'DaDuyet' } : m));
            addToast({ title: 'Đã duyệt!', message: 'Kỷ niệm đã được hiển thị công khai.', type: 'success' });
        }
    } catch (error) {
        console.error('Approve error:', error);
        addToast({ title: 'Lỗi', message: 'Không thể duyệt.', type: 'error' });
    }
  };

  const handleReject = async (type: 'document' | 'memory', id: number) => {
    try {
        const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
            ? import.meta.env.VITE_API_URL 
            : 'http://localhost:5000/api';
        
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            addToast({ title: 'Lỗi', message: 'Vui lòng đăng nhập lại.', type: 'error' });
            return;
        }

        const endpoint = type === 'document' ? 'documents' : 'memories';
        const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete ${type}`);
        }

        if (type === 'document') {
            setDocuments(prev => prev.filter(d => d.id !== id));
            addToast({ title: 'Đã từ chối!', message: 'Tài liệu đã bị xóa.', type: 'info' });
        } else {
            setMemories(prev => prev.filter(m => m.id !== id));
            addToast({ title: 'Đã từ chối!', message: 'Kỷ niệm đã bị xóa.', type: 'info' });
        }
    } catch (error) {
        console.error('Reject error:', error);
        addToast({ title: 'Lỗi', message: 'Không thể xóa.', type: 'error' });
    }
  };


  const handleSaveRole = async (newRole: Role) => {
    if (!editingUser) return;
    
    try {
        const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
            ? import.meta.env.VITE_API_URL 
            : 'http://localhost:5000/api';
        
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            addToast({ title: 'Lỗi', message: 'Vui lòng đăng nhập lại.', type: 'error' });
            return;
        }

        // Use PATCH /users/:id/role endpoint
        const response = await fetch(`${API_URL}/users/${editingUser.id}/role`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role: newRole })
        });

        if (!response.ok) {
            throw new Error('Failed to update role');
        }

        const updatedUser = await response.json();
        
        // Update local state
        setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
        addToast({ title: 'Thành công!', message: `Đã cập nhật vai trò cho ${editingUser.name}.`, type: 'success' });
        setEditingUser(null);
    } catch (error) {
        console.error('Update role error:', error);
        addToast({ title: 'Lỗi', message: 'Không thể cập nhật vai trò.', type: 'error' });
    }
  };

  const handleConfirmUserAction = async () => {
    if (!confirmUserAction) return;
    const { type, user } = confirmUserAction;

    try {
        const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
            ? import.meta.env.VITE_API_URL 
            : 'http://localhost:5000/api';
        
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            addToast({ title: 'Lỗi', message: 'Vui lòng đăng nhập lại.', type: 'error' });
            return;
        }

        if (type === 'delete') {
            // Note: Backend might not have DELETE /users/:id endpoint
            // For now, just update local state
            setUsers(prev => prev.filter(u => u.id !== user.id));
            addToast({ title: 'Đã xóa!', message: `Thành viên ${user.name} đã được xóa.`, type: 'info' });
        } else if (type === 'lock' || type === 'unlock') {
            const response = await fetch(`${API_URL}/users/${user.id}/lock`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to lock/unlock user');
            }

            const response_data = await response.json();
            console.log('🔒 Lock/Unlock response:', response_data);
            const updatedUser = response_data.user || response_data; // Support both formats
            console.log('🔒 Updated user:', updatedUser);
            console.log('🔒 User locked status:', updatedUser.locked);
            setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, locked: updatedUser.locked } : u)));
            addToast({ title: 'Thành công!', message: `Đã ${updatedUser.locked ? 'khóa' : 'mở khóa'} tài khoản ${user.name}.`, type: 'success' });
        }
        setConfirmUserAction(null);
    } catch (error) {
        console.error('User action error:', error);
        addToast({ title: 'Lỗi', message: 'Không thể thực hiện hành động.', type: 'error' });
        setConfirmUserAction(null);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
      e.preventDefault();
      
      try {
          const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
              ? import.meta.env.VITE_API_URL 
              : 'http://localhost:5000/api';
          
          const token = localStorage.getItem('accessToken');
          
          if (!token) {
              addToast({ title: 'Lỗi', message: 'Vui lòng đăng nhập lại.', type: 'error' });
              return;
          }

          const response = await fetch(`${API_URL}/config`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(configFormData)
          });

          if (!response.ok) {
              throw new Error('Failed to update config');
          }

          const updatedConfig = await response.json();
          
          // Update local state
          setWebsiteConfig(updatedConfig);
          setConfigFormData(updatedConfig);
          
          addToast({ title: 'Thành công!', message: 'Cài đặt chung đã được cập nhật.', type: 'success' });
      } catch (error) {
          console.error('Update config error:', error);
          addToast({ title: 'Lỗi', message: 'Không thể cập nhật cài đặt. Vui lòng thử lại.', type: 'error' });
      }
  };
  
  const handleToggleMaintenance = async () => {
    const newMode = !configFormData.isMaintenanceMode;
    const updatedConfig = {...configFormData, isMaintenanceMode: newMode};
    
    try {
      // Save to backend
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedConfig),
      });

      if (!response.ok) throw new Error('Failed to update config');

      const savedConfig = await response.json();
      
      // Update local state
      setConfigFormData(savedConfig);
      setWebsiteConfig(savedConfig);
      
      addToast({
        title: 'Thành công!',
        message: newMode ? 'Chế độ bảo trì đã được bật.' : 'Chế độ bảo trì đã được tắt.',
        type: 'success'
      });
    } catch (error) {
      console.error('Toggle maintenance error:', error);
      addToast({
        title: 'Lỗi',
        message: 'Không thể thay đổi chế độ bảo trì. Vui lòng thử lại.',
        type: 'error'
      });
    }
  };

  const handleAllowedRolesChange = async (role: Role) => {
    // Admin cannot be removed from allowed roles
    if (role === Role.Admin) return;
    
    const currentRoles = configFormData.allowedPostRoles || [];
    let newRoles;
    if (currentRoles.includes(role)) {
        newRoles = currentRoles.filter(r => r !== role);
    } else {
        newRoles = [...currentRoles, role];
    }
    
    // Ensure Admin is always included
    if (!newRoles.includes(Role.Admin)) {
        newRoles.push(Role.Admin);
    }
    
    const updatedConfig = { ...configFormData, allowedPostRoles: newRoles };
    setConfigFormData(updatedConfig);
    setWebsiteConfig(updatedConfig);
    
    // Save to backend
    try {
      const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
        ? import.meta.env.VITE_API_URL 
        : 'http://localhost:5000/api';
      
      const token = localStorage.getItem('accessToken');
      
      console.log('💾 Saving config to backend:', updatedConfig);
      console.log('🔐 Saving allowedPostRoles:', updatedConfig.allowedPostRoles);
      
      const response = await fetch(`${API_URL}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedConfig)
      });
      
      if (response.ok) {
        const savedConfig = await response.json();
        console.log('✅ Config saved successfully:', savedConfig);
        console.log('✅ Saved allowedPostRoles:', savedConfig.allowedPostRoles);
        addToast({
          title: 'Thành công!',
          message: 'Quyền đăng bài đã được cập nhật.',
          type: 'success'
        });
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to save config:', response.status, errorText);
        addToast({
          title: 'Lỗi!',
          message: 'Không thể lưu cấu hình. Vui lòng thử lại.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      addToast({
        title: 'Lỗi!',
        message: 'Không thể lưu cấu hình. Vui lòng thử lại.',
        type: 'error'
      });
    }
  };


  const handlePinPost = async (postId: number) => {
      try {
          const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
              ? import.meta.env.VITE_API_URL 
              : 'http://localhost:5000/api';
          
          const token = localStorage.getItem('accessToken');
          
          if (!token) {
              addToast({ title: 'Lỗi', message: 'Vui lòng đăng nhập lại.', type: 'error' });
              return;
          }

          const response = await fetch(`${API_URL}/posts/${postId}/pin`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });

          if (!response.ok) {
              throw new Error('Failed to pin post');
          }

          const updatedPost = await response.json();
          setPosts(posts.map(p => p.id === postId ? { ...p, pinned: updatedPost.pinned } : p));
          addToast({ title: 'Thành công!', message: updatedPost.pinned ? 'Đã ghim bài viết.' : 'Đã bỏ ghim bài viết.', type: 'info' });
      } catch (error) {
          console.error('Pin post error:', error);
          addToast({ title: 'Lỗi', message: 'Không thể cập nhật.', type: 'error' });
      }
  };
  
  const handleConfirmDeletePost = async () => {
      if (!deletingPost) return;
      
      try {
          const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
              ? import.meta.env.VITE_API_URL 
              : 'http://localhost:5000/api';
          
          const token = localStorage.getItem('accessToken');
          
          if (!token) {
              addToast({ title: 'Lỗi', message: 'Vui lòng đăng nhập lại.', type: 'error' });
              return;
          }

          const response = await fetch(`${API_URL}/posts/${deletingPost.id}`, {
              method: 'DELETE',
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });

          if (!response.ok) {
              throw new Error('Failed to delete post');
          }

          setPosts(posts.filter(p => p.id !== deletingPost.id));
          addToast({ title: 'Đã xóa!', message: 'Bài viết đã được xóa.', type: 'info' });
          setDeletingPost(null);
      } catch (error) {
          console.error('Delete post error:', error);
          addToast({ title: 'Lỗi', message: 'Không thể xóa bài viết.', type: 'error' });
      }
  };

  const handleNewUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email || !newUserData.major) {
        addToast({ title: 'Lỗi!', message: 'Vui lòng điền đầy đủ các trường bắt buộc.', type: 'error' });
        return;
    }

    try {
        const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
            ? import.meta.env.VITE_API_URL 
            : 'http://localhost:5000/api';
        
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
            addToast({ title: 'Lỗi', message: 'Vui lòng đăng nhập lại.', type: 'error' });
            return;
        }

        // Create user via auth/register endpoint
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: newUserData.name,
                email: newUserData.email,
                password: '123456', // Default password - user must change on first login
                role: newUserData.role,
                major: newUserData.major,
                mustChangePassword: true // Force password change on first login
            })
        });

        if (!response.ok) {
            const error = await response.json();
            const errorMessage = error.error || 'Failed to create user';
            
            // Translate common errors to Vietnamese
            if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
                throw new Error('Email này đã được đăng ký. Vui lòng sử dụng email khác.');
            }
            throw new Error(errorMessage);
        }

        const newUser = await response.json();
        setUsers(prev => [...prev, newUser.user]);
        addToast({ title: 'Thành công!', message: `Đã tạo tài khoản cho ${newUser.user.name}. Mật khẩu mặc định: 123456 (sẽ được yêu cầu đổi khi đăng nhập lần đầu)`, type: 'success' });
        setCreateUserModalOpen(false);
        setNewUserData(initialNewUserState);
    } catch (error: any) {
        console.error('Create user error:', error);
        addToast({ title: 'Lỗi', message: error.message || 'Không thể tạo tài khoản.', type: 'error' });
    }
  };

  const handleOpenCreateBadgeModal = () => {
    setEditingBadge(null);
    setBadgeFormData({ name: '', description: '', icon: 'Award', color: 'text-gray-400', requiredPoints: 0 });
    setIsBadgeModalOpen(true);
  };

  const handleOpenEditBadgeModal = (badge: Badge) => {
      setEditingBadge(badge);
      setBadgeFormData({ name: badge.name, description: badge.description, icon: badge.icon, color: badge.color, requiredPoints: badge.requiredPoints || 0 });
      setIsBadgeModalOpen(true);
  };

  const handleSaveBadge = async (e: React.FormEvent) => {
      e.preventDefault();
      
      try {
          const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
              ? import.meta.env.VITE_API_URL 
              : 'http://localhost:5000/api';
          
          const token = localStorage.getItem('accessToken');
          
          if (!token) {
              addToast({ title: 'Lỗi', message: 'Vui lòng đăng nhập lại.', type: 'error' });
              return;
          }

          if (editingBadge) { 
              // Editing existing badge - call PUT API
              const response = await fetch(`${API_URL}/badges/${editingBadge.id}`, {
                  method: 'PUT',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify(badgeFormData)
              });

              if (!response.ok) {
                  throw new Error('Failed to update badge');
              }

              const updatedBadge = await response.json();
              
              // Update local state
              setBadges(prev => prev.map(b => b.id === updatedBadge.id ? updatedBadge : b));
              setUsers(prevUsers => prevUsers.map(user => ({
                  ...user,
                  badges: user.badges.map(b => b.id === updatedBadge.id ? updatedBadge : b)
              })));
              
              addToast({ title: 'Thành công!', message: 'Đã cập nhật danh hiệu.', type: 'success' });
          } else { 
              // Creating new badge - call POST API
              const newBadgeId = badgeFormData.name.toUpperCase().replace(/\s/g, '_');
              
              const response = await fetch(`${API_URL}/badges`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                      id: newBadgeId,
                      ...badgeFormData
                  })
              });

              if (!response.ok) {
                  const errorData = await response.json();
                  if (response.status === 409) {
                      addToast({ title: 'Lỗi!', message: 'Một danh hiệu với tên tương tự đã tồn tại.', type: 'error' });
                  } else {
                      throw new Error(errorData.error || 'Failed to create badge');
                  }
                  return;
              }

              const newBadge = await response.json();
              
              // Update local state
              setBadges(prev => [...prev, newBadge]);
              
              addToast({ title: 'Thành công!', message: 'Đã tạo danh hiệu mới.', type: 'success' });
          }
          
          setIsBadgeModalOpen(false);
      } catch (error) {
          console.error('Badge save error:', error);
          addToast({ title: 'Lỗi', message: 'Không thể lưu danh hiệu.', type: 'error' });
      }
  };

  const handleConfirmDeleteBadge = async () => {
      if (!deletingBadge) return;
      
      try {
          const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
              ? import.meta.env.VITE_API_URL 
              : 'http://localhost:5000/api';
          
          const token = localStorage.getItem('accessToken');
          
          if (!token) {
              addToast({ title: 'Lỗi', message: 'Vui lòng đăng nhập lại.', type: 'error' });
              return;
          }

          const badgeId = deletingBadge.id;
          
          console.log('🗑️ Deleting badge:', badgeId);
          
          // Call DELETE API
          const response = await fetch(`${API_URL}/badges/${badgeId}`, {
              method: 'DELETE',
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });

          console.log('🗑️ Delete response status:', response.status);

          if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              console.error('🗑️ Delete failed:', response.status, errorData);
              throw new Error(errorData.error || 'Failed to delete badge');
          }

          // Update local state
          setBadges(prev => prev.filter(b => b.id !== badgeId));
          setUsers(prevUsers => prevUsers.map(user => ({
              ...user,
              badges: user.badges.filter(b => b.id !== badgeId)
          })));
          
          addToast({ title: 'Đã xóa!', message: 'Danh hiệu đã được xóa.', type: 'info' });
          setDeletingBadge(null);
      } catch (error) {
          console.error('Badge delete error:', error);
          addToast({ title: 'Lỗi', message: 'Không thể xóa danh hiệu.', type: 'error' });
          setDeletingBadge(null);
      }
  };

  // Auto-award badges for all users
  // User Badge Management Functions
  const handleOpenUserBadgeModal = (user: User) => {
      setManagingUserBadges(user);
      setUserBadgeModalOpen(true);
  };

  const handleAddBadgeToUser = async (badgeId: string) => {
      if (!managingUserBadges) return;
      
      const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
        ? import.meta.env.VITE_API_URL 
        : 'http://localhost:5000/api';
      
      const token = localStorage.getItem('accessToken');
      
      try {
          const response = await fetch(`${API_URL}/users/${managingUserBadges.id}/badges`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              credentials: 'include',
              body: JSON.stringify({ badgeId })
          });

          if (response.ok) {
              const userBadge = await response.json();
              
              addToast({ title: 'Thành công!', message: 'Đã trao danh hiệu cho người dùng.', type: 'success' });
              
              // Reload to get updated badge list
              const updatedUserResponse = await fetch(`${API_URL}/users/${managingUserBadges.id}`, {
                  headers: {
                      'Authorization': `Bearer ${token}`
                  },
                  credentials: 'include'
              });
              
              if (updatedUserResponse.ok) {
                  const updatedUser = await updatedUserResponse.json();
                  setManagingUserBadges(updatedUser);
                  
                  // Update local users state
                  setUsers(prevUsers => prevUsers.map(user => 
                      user.id === managingUserBadges.id 
                          ? updatedUser
                          : user
                  ));
              }
          } else {
              const errorData = await response.json();
              addToast({ title: 'Lỗi!', message: errorData.error || 'Không thể trao danh hiệu.', type: 'error' });
          }
      } catch (error) {
          console.error('Add badge error:', error);
          addToast({ title: 'Lỗi', message: 'Không thể trao danh hiệu.', type: 'error' });
      }
  };

  const handleRemoveBadgeFromUser = async (badgeId: string) => {
      if (!managingUserBadges) return;
      
      const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
        ? import.meta.env.VITE_API_URL 
        : 'http://localhost:5000/api';
      
      const token = localStorage.getItem('accessToken');
      
      try {
          const response = await fetch(`${API_URL}/users/${managingUserBadges.id}/badges/${badgeId}`, {
              method: 'DELETE',
              headers: {
                  'Authorization': `Bearer ${token}`
              },
              credentials: 'include'
          });

          if (response.ok) {
              addToast({ title: 'Đã xóa!', message: 'Đã thu hồi danh hiệu.', type: 'info' });
              
              // Reload to get updated badge list
              const updatedUserResponse = await fetch(`${API_URL}/users/${managingUserBadges.id}`, {
                  headers: {
                      'Authorization': `Bearer ${token}`
                  },
                  credentials: 'include'
              });
              
              if (updatedUserResponse.ok) {
                  const updatedUser = await updatedUserResponse.json();
                  setManagingUserBadges(updatedUser);
                  
                  // Update local users state
                  setUsers(prevUsers => prevUsers.map(user => 
                      user.id === managingUserBadges.id 
                          ? updatedUser
                          : user
                  ));
              }
          } else {
              addToast({ title: 'Lỗi!', message: 'Không thể thu hồi danh hiệu.', type: 'error' });
          }
      } catch (error) {
          console.error('Remove badge error:', error);
          addToast({ title: 'Lỗi', message: 'Không thể thu hồi danh hiệu.', type: 'error' });
      }
  };

  const handleReportAction = async (reportId: number, action: 'dismiss' | 'deleteContent') => {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;
  
      try {
          const token = localStorage.getItem('accessToken');
          if (!token) {
              addToast({ title: 'Lỗi!', message: 'Bạn cần đăng nhập lại', type: 'error' });
              return;
          }

          // Update report status
          const statusResponse = await fetch(`http://localhost:5000/api/reports/${reportId}/status`, {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ status: 'Resolved' })
          });

          if (!statusResponse.ok) {
              throw new Error('Failed to update report status');
          }

          if (action === 'deleteContent') {
              // Delete the reported content
              if (report.contentType === 'post') {
                  const deleteResponse = await fetch(`http://localhost:5000/api/posts/${report.contentId}`, {
                      method: 'DELETE',
                      headers: { 'Authorization': `Bearer ${token}` }
                  });
                  
                  if (deleteResponse.ok) {
                      setPosts(prev => prev.filter(p => p.id !== report.contentId));
                      addToast({ title: 'Thành công!', message: 'Bài viết đã được xóa.', type: 'success' });
                  }
              } else if (report.contentType === 'comment') {
                  // Need to find which post this comment belongs to
                  const post = posts.find(p => p.comments.some(c => c.id === report.contentId));
                  if (post) {
                      const deleteResponse = await fetch(`http://localhost:5000/api/posts/${post.id}/comments/${report.contentId}`, {
                          method: 'DELETE',
                          headers: { 'Authorization': `Bearer ${token}` }
                      });
                      
                      if (deleteResponse.ok) {
                          setPosts(prev => prev.map(p => ({
                              ...p,
                              comments: p.comments.filter(c => c.id !== report.contentId)
                          })));
                          addToast({ title: 'Thành công!', message: 'Bình luận đã được xóa.', type: 'success' });
                      }
                  }
              }
          } else {
              addToast({ title: 'Đã bỏ qua', message: 'Báo cáo đã được bỏ qua.', type: 'info' });
          }
  
          setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
          setViewingReport(null);
          console.log('✅ Report resolved');
      } catch (error) {
          console.error('❌ Failed to handle report:', error);
          addToast({ title: 'Lỗi!', message: 'Không thể xử lý báo cáo', type: 'error' });
      }
  };

  const tabs = [
      { id: 'stats', name: 'Thống kê' },
      { id: 'settings', name: 'Cài đặt' },
      { id: 'content', name: 'Quản lý nội dung' },
      { id: 'moderation', name: 'Kiểm duyệt' },
      { id: 'reports', name: 'Nội dung bị báo cáo' },
      { id: 'members', name: 'Quản lý thành viên' },
      { id: 'achievements', name: 'Quản lý thành tựu' },
      { id: 'system', name: 'Theo dõi hệ thống' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Bảng Quản trị</h1>
      
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'stats' && (
        <Card>
            <h2 className="text-lg font-semibold mb-4">Thống kê hoạt động</h2>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
                    <XAxis dataKey="name" stroke="currentColor" />
                    <YAxis stroke="currentColor" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', borderColor: 'rgba(128, 128, 0.5)', borderRadius: '0.5rem' }} />
                    <Legend />
                    <Bar dataKey="value" name="Số lượng" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
            <Card className="p-4">
                <h2 className="text-base font-semibold mb-3 flex items-center gap-2"><Icons.Globe className="w-4 h-4"/> Cài đặt chung</h2>
                <form onSubmit={handleSaveConfig} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium mb-1">Tên Website</label>
                            <input value={configFormData.websiteName} onChange={(e) => setConfigFormData({...configFormData, websiteName: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1">Tiêu đề trang</label>
                            <input value={configFormData.websiteTitle} onChange={(e) => setConfigFormData({...configFormData, websiteTitle: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium mb-1">Tên lớp</label>
                            <input value={configFormData.className} onChange={(e) => setConfigFormData({...configFormData, className: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1">Slogan</label>
                            <input value={configFormData.slogan} onChange={(e) => setConfigFormData({...configFormData, slogan: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1">Link ảnh bìa trang chủ</label>
                        <input value={configFormData.coverImage} onChange={(e) => setConfigFormData({...configFormData, coverImage: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex justify-end pt-1">
                        <Button type="submit" size="sm">
                            <Icons.Save className="w-3 h-3 mr-1" />
                            Lưu thay đổi
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Move Backup card into left column under Cài đặt chung */}
            <Card className="p-4">
                <h2 className="text-base font-semibold mb-3 flex items-center gap-2"><Icons.Database className="w-4 h-4"/> Sao lưu & Khôi phục</h2>
                <div className="space-y-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Tạo bản sao lưu toàn bộ dữ liệu. 
                        <span className="text-orange-600 dark:text-orange-400 font-semibold"> ⚠️ Quan trọng!</span>
                    </p>
                    
                    {/* Backup Actions */}
                    <div className="grid grid-cols-3 gap-2">
                        <Button 
                            onClick={async () => {
                                try {
                                    addToast({ title: 'Đang tạo backup...', message: 'Vui lòng đợi', type: 'info' });
                                    
                                    const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
                                        ? import.meta.env.VITE_API_URL 
                                        : 'http://localhost:5000/api';
                                    const token = localStorage.getItem('accessToken');
                                    
                                    const response = await fetch(`${API_URL}/backup/create`, {
                                        method: 'POST',
                                        headers: {
                                            'Authorization': `Bearer ${token}`
                                        }
                                    });
                                    
                                    if (!response.ok) throw new Error('Backup failed');
                                    
                                    const result = await response.json();
                                    addToast({ 
                                        title: 'Thành công!', 
                                        message: `Đã tạo backup`, 
                                        type: 'success' 
                                    });
                                    
                                    // Refresh backup list
                                    fetchBackupList();
                                } catch (error) {
                                    console.error('Backup error:', error);
                                    addToast({ title: 'Lỗi!', message: 'Không thể tạo backup.', type: 'error' });
                                }
                            }} 
                            variant="secondary" 
                            size="sm"
                            className="w-full !text-xs"
                        >
                            <Icons.Database className="w-3 h-3 mr-1"/>
                            Backup Server
                        </Button>
                        
                        <Button 
                            onClick={handleBackup} 
                            variant="secondary" 
                            size="sm"
                            className="w-full !text-xs"
                        >
                            <Icons.Download className="w-3 h-3 mr-1"/>
                            Tải Local
                        </Button>
                        
                        <Button 
                            onClick={handleRestore} 
                            variant="secondary" 
                            size="sm"
                            className="w-full !text-xs"
                        >
                            <Icons.Upload className="w-3 h-3 mr-1"/>
                            Khôi phục
                        </Button>
                    </div>
                    
                    {/* Backup List */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-xs">Backup trên Server</h3>
                            <Button 
                                size="sm" 
                                variant="ghost"
                                className="!h-6 !w-6 !p-0"
                                onClick={fetchBackupList}
                            >
                                <Icons.RotateCw className="w-3 h-3" />
                            </Button>
                        </div>
                        
                        {backupList.length === 0 ? (
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-3">
                                Chưa có backup
                            </p>
                        ) : (
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                                {backupList.map((backup: any) => (
                                    <div 
                                        key={backup.filename} 
                                        className="flex items-center justify-between p-1.5 bg-gray-50 dark:bg-gray-800 rounded text-xs"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{backup.filename}</p>
                                            <p className="text-gray-500 dark:text-gray-400 text-xs">
                                                {new Date(backup.created).toLocaleString('vi-VN', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})} • {(backup.size / 1024).toFixed(0)}KB
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="!h-6 !w-6 !p-0"
                                                onClick={async () => {
                                                    try {
                                                        const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
                                                            ? import.meta.env.VITE_API_URL 
                                                            : 'http://localhost:5000/api';
                                                        const token = localStorage.getItem('accessToken');
                                                        
                                                        window.open(`${API_URL}/backup/download/${backup.filename}?token=${token}`, '_blank');
                                                    } catch (error) {
                                                        addToast({ title: 'Lỗi', message: 'Không thể tải', type: 'error' });
                                                    }
                                                }}
                                            >
                                                <Icons.Download className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="!h-6 !w-6 !p-0"
                                                onClick={() => {
                                                    if (confirm(`Khôi phục ${backup.filename}?`)) {
                                                        handleRestoreFromServer(backup.filename);
                                                    }
                                                }}
                                            >
                                                <Icons.Upload className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="!h-6 !w-6 !p-0"
                                                onClick={async () => {
                                                    if (confirm(`Xóa ${backup.filename}?`)) {
                                                        try {
                                                            const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
                                                                ? import.meta.env.VITE_API_URL 
                                                                : 'http://localhost:5000/api';
                                                            const token = localStorage.getItem('accessToken');
                                                            
                                                            await fetch(`${API_URL}/backup/${backup.filename}`, {
                                                                method: 'DELETE',
                                                                headers: { 'Authorization': `Bearer ${token}` }
                                                            });
                                                            
                                                            addToast({ title: 'Thành công', message: 'Đã xóa', type: 'success' });
                                                            fetchBackupList();
                                                        } catch (error) {
                                                            addToast({ title: 'Lỗi', message: 'Không thể xóa', type: 'error' });
                                                        }
                                                    }
                                                }}
                                            >
                                                <Icons.Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
            </div>

            <div className="space-y-4">
                <Card className="p-4">
                    <h2 className="text-base font-semibold mb-3 flex items-center gap-2"><Icons.Settings className="w-4 h-4"/> Cài đặt hệ thống</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                            <div>
                                <h3 className="font-medium text-sm">Chế độ bảo trì</h3>
                                <p className="text-xs text-gray-500">Chỉ admin có thể truy cập</p>
                            </div>
                            <button
                                onClick={handleToggleMaintenance}
                                className={cn(
                                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
                                    configFormData.isMaintenanceMode ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                                )}
                            >
                                <span
                                    className={cn(
                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                    configFormData.isMaintenanceMode ? "translate-x-5" : "translate-x-0"
                                    )}
                                />
                            </button>
                        </div>
                        <div className="p-2 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                            <h3 className="font-medium text-sm mb-2">Quyền đăng bài</h3>
                            <p className="text-xs text-gray-500 mb-2">Vai trò được phép đăng bài</p>
                            <div className="grid grid-cols-2 gap-1">
                                {Object.values(Role).map(role => {
                                    const isChecked = configFormData.allowedPostRoles?.includes(role);
                                    const isAdmin = role === Role.Admin;
                                    return (
                                        <label key={role} className={cn("flex items-center justify-between text-xs py-1", isAdmin ? "cursor-not-allowed" : "cursor-pointer")}>
                                            <span className={cn(isAdmin && "opacity-50")}>{ROLE_NAMES[role] || role}</span>
                                            <button
                                                type="button"
                                                onClick={() => !isAdmin && handleAllowedRolesChange(role)}
                                                disabled={isAdmin}
                                                className={cn(
                                                    "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
                                                    isChecked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600",
                                                    isAdmin ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                                    isChecked ? "translate-x-5" : "translate-x-0"
                                                    )}
                                                />
                                            </button>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-2 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                            <h3 className="font-medium text-sm mb-2">Danh mục bài viết</h3>
                            
                            {/* Category List */}
                            <div className="space-y-1 mb-2 max-h-32 overflow-y-auto">
                                {(configFormData.postCategories || ['Thông báo chung']).map((category, index) => (
                                    <div key={index} className="flex items-center justify-between p-1.5 bg-white dark:bg-gray-900 rounded text-xs">
                                        <span>{category}</span>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="!h-5 !w-5 !p-0"
                                            onClick={() => {
                                                const newCategories = configFormData.postCategories?.filter((_, i) => i !== index) || [];
                                                setConfigFormData({...configFormData, postCategories: newCategories});
                                            }}
                                        >
                                            <Icons.X className="w-2.5 h-2.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Add Category */}
                            <div className="flex items-center gap-1 mb-2">
                                <input
                                    type="text"
                                    placeholder="Thêm mới..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const input = e.currentTarget;
                                            const value = input.value.trim();
                                            if (value && !configFormData.postCategories?.includes(value)) {
                                                setConfigFormData({
                                                    ...configFormData, 
                                                    postCategories: [...(configFormData.postCategories || []), value]
                                                });
                                                input.value = '';
                                            }
                                        }
                                    }}
                                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <Button
                                    type="button"
                                    size="sm"
                                    className="!h-7 !text-xs"
                                    onClick={(e) => {
                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                        const value = input.value.trim();
                                        if (value && !configFormData.postCategories?.includes(value)) {
                                            setConfigFormData({
                                                ...configFormData, 
                                                postCategories: [...(configFormData.postCategories || []), value]
                                            });
                                            input.value = '';
                                        }
                                    }}
                                >
                                    <Icons.PlusCircle className="w-3 h-3" />
                                </Button>
                            </div>
                            
                            {/* Save Categories Button */}
                            <Button
                                type="button"
                                onClick={async () => {
                                    try {
                                        const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
                                            ? import.meta.env.VITE_API_URL 
                                            : 'http://localhost:5000/api';
                                        const token = localStorage.getItem('accessToken');
                                        
                                        const response = await fetch(`${API_URL}/config`, {
                                            method: 'PUT',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${token}`
                                            },
                                            body: JSON.stringify(configFormData)
                                        });
                                        
                                        if (!response.ok) throw new Error('Failed to save');
                                        
                                        const updatedConfig = await response.json();
                                        setWebsiteConfig(updatedConfig);
                                        setConfigFormData(updatedConfig);
                                        
                                        addToast({ title: 'Thành công!', message: 'Đã lưu danh mục bài viết.', type: 'success' });
                                    } catch (error) {
                                        console.error('Save categories error:', error);
                                        addToast({ title: 'Lỗi!', message: 'Không thể lưu danh mục.', type: 'error' });
                                    }
                                }}
                                className="w-full !h-7 !text-xs"
                                variant="secondary"
                            >
                                <Icons.Save className="w-3 h-3 mr-1" />
                                Lưu
                            </Button>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <h2 className="text-base font-semibold mb-3 flex items-center gap-2"><Icons.Bell className="w-4 h-4"/> Thông báo Banner</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium mb-1">Nội dung Banner</label>
                            <textarea value={configFormData.bannerText || ''} onChange={(e) => setConfigFormData({...configFormData, bannerText: e.target.value})} rows={2} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium mb-1">Loại Banner</label>
                                <select value={configFormData.bannerType || 'Info'} onChange={(e) => setConfigFormData({...configFormData, bannerType: e.target.value as 'Info' | 'Warning' | 'Critical'})} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="Info">Thông tin</option>
                                    <option value="Warning">Cảnh báo</option>
                                    <option value="Critical">Khẩn cấp</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <div className="flex items-center justify-between w-full">
                                    <label className="text-xs font-medium">Kích hoạt</label>
                                    <button
                                        onClick={async () => {
                                            const updatedConfig = {...configFormData, bannerIsActive: !configFormData.bannerIsActive};
                                            setConfigFormData(updatedConfig);
                                            setWebsiteConfig(updatedConfig);
                                            
                                            // Save to database
                                            try {
                                                const API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL 
                                                    ? import.meta.env.VITE_API_URL 
                                                    : 'http://localhost:5000/api';
                                                
                                                const token = localStorage.getItem('accessToken');
                                                
                                                await fetch(`${API_URL}/config`, {
                                                    method: 'PUT',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'Authorization': `Bearer ${token}`
                                                    },
                                                    body: JSON.stringify(updatedConfig)
                                                });
                                                
                                                addToast({ title: 'Thành công!', message: `Đã ${updatedConfig.bannerIsActive ? 'bật' : 'tắt'} banner.`, type: 'success' });
                                            } catch (error) {
                                                console.error('Update config error:', error);
                                                addToast({ title: 'Lỗi', message: 'Không thể cập nhật cài đặt.', type: 'error' });
                                            }
                                        }}
                                        className={cn(
                                            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
                                            configFormData.bannerIsActive ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                            configFormData.bannerIsActive ? "translate-x-5" : "translate-x-0"
                                            )}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <Button type="button" onClick={() => handleSaveConfig({ preventDefault: () => {} } as any)} size="sm" className="w-full">
                            <Icons.Save className="w-3 h-3 mr-1" />
                            Lưu Banner
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
      )}
      
      {activeTab === 'content' && (
        <Card>
            <h2 className="text-lg font-semibold mb-4">Quản lý nội dung ({posts.length} bài viết)</h2>
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[600px] text-sm text-left">
                     <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3">Tiêu đề</th>
                            <th scope="col" className="px-6 py-3">Tác giả</th>
                            <th scope="col" className="px-6 py-3">Trạng thái</th>
                            <th scope="col" className="px-6 py-3">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map(post => {
                            const author = users.find(u => u.id === post.authorId);
                            return (
                            <tr key={post.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{post.title}</td>
                                <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{author?.name || 'N/A'}</td>
                                <td className="px-6 py-4">{post.pinned && <span className="flex items-center gap-1 text-xs font-semibold text-yellow-500"><Icons.Pin className="w-3 h-3"/> Đã ghim</span>}</td>
                                <td className="px-6 py-4">
                                     <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handlePinPost(post.id)}><Icons.Pin className="w-4 h-4 text-yellow-500"/></Button>
                                        <Button variant="ghost" size="icon" onClick={() => setDeletingPost(post)}><Icons.Trash2 className="w-4 h-4 text-red-500"/></Button>
                                    </div>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        </Card>
      )}

       {activeTab === 'moderation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <h2 className="text-lg font-semibold mb-4">Tài liệu chờ duyệt ({pendingDocuments.length})</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {pendingDocuments.length > 0 ? pendingDocuments.map(doc => {
                        const uploader = users.find(u => u.id === doc.uploaderId);
                        return (
                            <div key={doc.id} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-sm">{doc.title}</p>
                                    <p className="text-xs text-gray-500">bởi {uploader?.name || 'Không rõ'} • {doc.timestamp}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button size="icon" variant="ghost" className="!w-8 !h-8" onClick={() => setPreviewContent(doc)}>
                                        <Icons.Eye className="w-4 h-4 text-blue-500" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="!w-8 !h-8" onClick={() => handleApprove('document', doc.id)}>
                                        <Icons.Check className="w-4 h-4 text-green-500" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="!w-8 !h-8" onClick={() => handleReject('document', doc.id)}>
                                        <Icons.Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        )
                    }) : <p className="text-sm text-gray-500 text-center py-4">Không có tài liệu nào chờ duyệt.</p>}
                </div>
            </Card>
            <Card>
                 <h2 className="text-lg font-semibold mb-4">Kỷ niệm chờ duyệt ({pendingMemories.length})</h2>
                 <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {pendingMemories.length > 0 ? pendingMemories.map(mem => {
                        const uploader = users.find(u => u.id === mem.uploaderId);
                        return (
                            <div key={mem.id} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={mem.thumbnail} alt="Kỷ niệm" className="w-12 h-12 rounded-md object-cover" />
                                    <div>
                                        <p className="font-semibold text-sm">{mem.semester}</p>
                                        <p className="text-xs text-gray-500">bởi {uploader?.name || 'Không rõ'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                     <Button size="icon" variant="ghost" className="!w-8 !h-8" onClick={() => setPreviewContent(mem)}>
                                        <Icons.Eye className="w-4 h-4 text-blue-500" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="!w-8 !h-8" onClick={() => handleApprove('memory', mem.id)}>
                                        <Icons.Check className="w-4 h-4 text-green-500" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="!w-8 !h-8" onClick={() => handleReject('memory', mem.id)}>
                                        <Icons.Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        )
                    }) : <p className="text-sm text-gray-500 text-center py-4">Không có kỷ niệm nào chờ duyệt.</p>}
                </div>
            </Card>
        </div>
      )}
      
      {activeTab === 'reports' && (
          <Card>
              <h2 className="text-lg font-semibold mb-4">Nội dung bị báo cáo ({pendingReports.length})</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {pendingReports.length > 0 ? pendingReports.map(report => {
                      const reporter = users.find(u => u.id === report.reporterId);
                      let contentPreview = 'Nội dung không tồn tại';
                      if (report.contentType === 'post') {
                          contentPreview = posts.find(p => p.id === report.contentId)?.title || 'Bài viết đã bị xóa';
                      } else if (report.contentType === 'comment') {
                          const comment = posts.flatMap(p => p.comments).find(c => c.id === report.contentId);
                          contentPreview = comment ? `"${comment.content}"` : 'Bình luận đã bị xóa';
                      }
                      
                      return (
                          <div key={report.id} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50 flex items-center justify-between">
                              <div>
                                  <p className="font-semibold text-sm truncate max-w-xs">{contentPreview}</p>
                                  <p className="text-xs text-gray-500">Lý do: {report.reason} • Bởi: {reporter?.name}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                  <Button size="icon" variant="ghost" className="!w-8 !h-8" onClick={() => setViewingReport(report)}>
                                      <Icons.Eye className="w-4 h-4 text-blue-500" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="!w-8 !h-8" onClick={() => handleReportAction(report.id, 'dismiss')}>
                                      <Icons.Check className="w-4 h-4 text-green-500" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="!w-8 !h-8" onClick={() => handleReportAction(report.id, 'deleteContent')}>
                                      <Icons.Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                              </div>
                          </div>
                      );
                  }) : <p className="text-sm text-gray-500 text-center py-4">Không có báo cáo nào đang chờ xử lý.</p>}
              </div>
          </Card>
      )}


      {activeTab === 'members' && (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Quản lý thành viên ({users.length})</h2>
                <Button onClick={() => setCreateUserModalOpen(true)}>
                    <Icons.Plus className="w-4 h-4 mr-2" />
                    Tạo tài khoản mới
                </Button>
            </div>
            <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[600px] text-sm text-left">
                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800">
                <tr>
                    <th scope="col" className="px-6 py-3">Tên</th>
                    <th scope="col" className="px-6 py-3">Vai trò</th>
                    <th scope="col" className="px-6 py-3">Điểm</th>
                    <th scope="col" className="px-6 py-3">Danh hiệu</th>
                    <th scope="col" className="px-6 py-3">Trạng thái</th>
                    <th scope="col" className="px-6 py-3">Hành động</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user) => {
                    const isCurrentUser = user.id === currentUser.id;
                    const roleColor = user.role && ROLE_COLORS[user.role] 
                        ? ROLE_COLORS[user.role] 
                        : { primary: '#8E8E93', text: 'text-gray-500', border: 'border-gray-500' }; // Fallback to ThanhVien color
                    
                    return (
                    <tr key={user.id} className={cn("border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50", user.locked && "opacity-60 bg-gray-100 dark:bg-gray-800/20")}>
                    <td className="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-3">
                        <img className="w-9 h-9 rounded-full" src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} alt={user.name} />
                        {user.name}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span
                        className="px-2 py-1 rounded-full text-xs font-semibold"
                        style={{
                            backgroundColor: `${roleColor.primary}20`,
                            color: roleColor.primary,
                        }}
                        >
                        {user.role ? (ROLE_NAMES[user.role] || user.role) : 'Thành viên'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{user.points || 0}</td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-1 flex-wrap max-w-[200px]">
                            {user.badges && user.badges.length > 0 ? (
                                user.badges.slice(0, 3).map((userBadge: any) => {
                                    const badge = userBadge.badge || userBadge;
                                    const BadgeIcon = Icons[badge.icon as keyof typeof Icons] || Icons.Award;
                                    return (
                                        <div 
                                            key={badge.id} 
                                            className="group relative"
                                            title={badge.name}
                                        >
                                            <div className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
                                                <BadgeIcon className={cn('w-4 h-4', badge.color)} />
                                            </div>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                {badge.name}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <span className="text-xs text-gray-500">Chưa có</span>
                            )}
                            {user.badges && user.badges.length > 3 && (
                                <span className="text-xs text-gray-500">+{user.badges.length - 3}</span>
                            )}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        {user.locked ? (
                            <span className="text-yellow-500 font-semibold flex items-center gap-1 text-xs"><Icons.Lock className="w-3 h-3"/> Đã khóa</span>
                        ) : (
                            <span className="text-green-500 font-semibold flex items-center gap-1 text-xs"><Icons.Unlock className="w-3 h-3"/> Hoạt động</span>
                        )}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenUserBadgeModal(user)} title="Quản lý danh hiệu">
                                <Icons.Award className="w-4 h-4 text-purple-500"/>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)}><Icons.Edit className="w-4 h-4 text-blue-500"/></Button>
                            <Button variant="ghost" size="icon" disabled={isCurrentUser} onClick={() => setConfirmUserAction({type: user.locked ? 'unlock' : 'lock', user})}>
                                {user.locked ? <Icons.Unlock className="w-4 h-4 text-green-500"/> : <Icons.Lock className="w-4 h-4 text-yellow-500"/>}
                            </Button>
                            <Button variant="ghost" size="icon" disabled={isCurrentUser} onClick={() => setConfirmUserAction({type: 'delete', user})}>
                                <Icons.Trash2 className="w-4 h-4 text-red-500"/>
                            </Button>
                        </div>
                    </td>
                    </tr>
                )})}
                </tbody>
            </table>
            </div>
        </Card>
      )}

      {activeTab === 'achievements' && (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Quản lý thành tựu ({badges.length})</h2>
                <div className="flex gap-2">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Icons.Info className="w-3 h-3" />
                        Tự động trao: Ngay sau hoạt động + Mỗi 2 phút
                    </div>
                    <Button onClick={handleOpenCreateBadgeModal}>
                        <Icons.Plus className="w-4 h-4 mr-2" />
                        Tạo danh hiệu mới
                    </Button>
                </div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[600px] text-sm text-left">
                    <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3">Icon</th>
                            <th scope="col" className="px-6 py-3">Tên</th>
                            <th scope="col" className="px-6 py-3">Mô tả</th>
                            <th scope="col" className="px-6 py-3">Danh mục</th>
                            <th scope="col" className="px-6 py-3">Điểm cần đạt</th>
                            <th scope="col" className="px-6 py-3">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {badges.map(badge => {
                            const IconComponent = Icons[badge.icon];
                            const categoryLabels = {
                                all: 'Tổng hợp',
                                posts: 'Bài viết',
                                documents: 'Tài liệu',
                                comments: 'Bình luận'
                            };
                            return (
                            <tr key={badge.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-6 py-4">
                                    {IconComponent && <IconComponent className={cn("w-6 h-6", badge.color)} />}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{badge.name}</td>
                                <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{badge.description}</td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-semibold",
                                        badge.category === 'posts' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                        badge.category === 'documents' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                        badge.category === 'comments' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                                        'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    )}>
                                        {categoryLabels[badge.category || 'all']}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{badge.requiredPoints || 0} điểm</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditBadgeModal(badge)}><Icons.Edit className="w-4 h-4 text-blue-500"/></Button>
                                        <Button variant="ghost" size="icon" onClick={() => setDeletingBadge(badge)}><Icons.Trash2 className="w-4 h-4 text-red-500"/></Button>
                                    </div>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        </Card>
      )}

      {activeTab === 'system' && (
        <SystemMonitor />
      )}

      {/* Hidden file input for restore */}
      <input
        id="restore-file-input"
        type="file"
        accept=".json"
        onChange={handleRestoreFileSelect}
        style={{ display: 'none' }}
      />

      {/* Create User Modal */}
      <Modal isOpen={isCreateUserModalOpen} onClose={() => setCreateUserModalOpen(false)} title="Tạo tài khoản thành viên mới">
        <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Tên đầy đủ</label>
                <input name="name" value={newUserData.name} onChange={handleNewUserFormChange} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
             <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input name="email" type="email" value={newUserData.email} onChange={handleNewUserFormChange} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
             <div>
                <label className="block text-sm font-medium mb-1">Chuyên ngành</label>
                <input name="major" value={newUserData.major} onChange={handleNewUserFormChange} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
             <div>
                <label className="block text-sm font-medium mb-1">Vai trò</label>
                <select 
                    name="role"
                    value={newUserData.role}
                    onChange={handleNewUserFormChange}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {Object.values(Role).map(role => (
                        <option key={role} value={role}>{role}</option>
                    ))}
                </select>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-yellow-400/10 rounded-md">
                Ghi chú: Mật khẩu mặc định cho tài khoản mới là "123456789". Người dùng sẽ được yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên.
            </p>
            <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                <Button type="button" variant="secondary" onClick={() => setCreateUserModalOpen(false)}>Hủy</Button>
                <Button type="submit">Tạo tài khoản</Button>
            </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      {editingUser && (
        <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title={`Chỉnh sửa vai trò của ${editingUser.name}`}>
            <div className="space-y-4">
                <p>Chọn một vai trò mới cho thành viên này.</p>
                <select 
                    defaultValue={editingUser.role}
                    onChange={(e) => handleSaveRole(e.target.value as Role)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {Object.values(Role).map(role => (
                        <option key={role} value={role}>{ROLE_NAMES[role] || role}</option>
                    ))}
                </select>
                <div className="flex justify-end">
                    <Button variant="secondary" onClick={() => setEditingUser(null)}>Đóng</Button>
                </div>
            </div>
        </Modal>
      )}
      
      {/* Badge Create/Edit Modal */}
      <Modal isOpen={isBadgeModalOpen} onClose={() => setIsBadgeModalOpen(false)} title={editingBadge ? "Chỉnh sửa danh hiệu" : "Tạo danh hiệu mới"}>
        <form onSubmit={handleSaveBadge} className="space-y-4">
            {/* Points Calculation Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <Icons.AlertCircle className="w-4 h-4" />
                    Cơ chế tính điểm hiện tại
                </h4>
                <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <div className="flex items-center gap-2">
                        <Icons.FileText className="w-3 h-3" />
                        <span>Đăng bài viết: <strong>+10 điểm/bài</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Icons.Book className="w-3 h-3" />
                        <span>Upload tài liệu (đã duyệt): <strong>+15 điểm/tài liệu</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Icons.MessageSquare className="w-3 h-3" />
                        <span>Bình luận: <strong>+5 điểm/comment</strong></span>
                    </div>
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium mb-1">Tên danh hiệu</label>
                <input value={badgeFormData.name} onChange={(e) => setBadgeFormData({...badgeFormData, name: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea value={badgeFormData.description} onChange={(e) => setBadgeFormData({...badgeFormData, description: e.target.value})} rows={3} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Số điểm để đạt</label>
                <input 
                    type="number" 
                    value={badgeFormData.requiredPoints || 0} 
                    onChange={(e) => setBadgeFormData({...badgeFormData, requiredPoints: parseInt(e.target.value) || 0})} 
                    min="0"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Danh mục thành tựu</label>
                <select 
                    value={badgeFormData.category || 'all'} 
                    onChange={(e) => setBadgeFormData({...badgeFormData, category: e.target.value as any})} 
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">Tổng hợp (Tất cả hoạt động)</option>
                    <option value="posts">Bài viết (10 điểm/bài)</option>
                    <option value="documents">Tài liệu (15 điểm/tài liệu)</option>
                    <option value="comments">Bình luận (5 điểm/comment)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                    Chọn danh mục để tính điểm riêng cho từng loại hoạt động
                </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Icon</label>
                    <select value={badgeFormData.icon} onChange={(e) => setBadgeFormData({...badgeFormData, icon: e.target.value as keyof typeof Icons})} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {Object.keys(Icons).sort().map(iconKey => (
                            <option key={iconKey} value={iconKey}>{iconKey}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Màu sắc</label>
                    <select 
                        value={badgeFormData.color} 
                        onChange={(e) => setBadgeFormData({...badgeFormData, color: e.target.value})} 
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <optgroup label="Đỏ / Hồng">
                            <option value="text-red-500">🔴 Đỏ</option>
                            <option value="text-red-600">🔴 Đỏ đậm</option>
                            <option value="text-pink-500">💗 Hồng</option>
                            <option value="text-rose-500">🌹 Hồng hoa hồng</option>
                        </optgroup>
                        <optgroup label="Cam / Vàng">
                            <option value="text-orange-500">🟠 Cam</option>
                            <option value="text-amber-500">🟡 Vàng hổ phách</option>
                            <option value="text-yellow-500">💛 Vàng</option>
                            <option value="text-yellow-600">💛 Vàng đậm</option>
                        </optgroup>
                        <optgroup label="Xanh lá">
                            <option value="text-green-500">💚 Xanh lá</option>
                            <option value="text-green-600">💚 Xanh lá đậm</option>
                            <option value="text-emerald-500">🟢 Xanh ngọc lục bảo</option>
                            <option value="text-lime-500">🍋 Xanh chanh</option>
                        </optgroup>
                        <optgroup label="Xanh dương / Tím">
                            <option value="text-blue-500">💙 Xanh dương</option>
                            <option value="text-blue-600">💙 Xanh dương đậm</option>
                            <option value="text-sky-500">🌤️ Xanh trời</option>
                            <option value="text-cyan-500">🩵 Xanh lơ</option>
                            <option value="text-purple-500">💜 Tím</option>
                            <option value="text-violet-500">💜 Tím violet</option>
                            <option value="text-indigo-500">🔵 Xanh chàm</option>
                        </optgroup>
                        <optgroup label="Xám / Nâu">
                            <option value="text-gray-500">⚫ Xám</option>
                            <option value="text-gray-400">⚪ Xám nhạt</option>
                            <option value="text-slate-500">🌫️ Xám đá phiến</option>
                        </optgroup>
                    </select>
                    <div className="mt-2 flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        <span className="text-xs text-gray-500">Xem trước:</span>
                        <Icons.Award className={cn('w-6 h-6', badgeFormData.color)} />
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                <Button type="button" variant="secondary" onClick={() => setIsBadgeModalOpen(false)}>Hủy</Button>
                <Button type="submit">{editingBadge ? 'Lưu thay đổi' : 'Tạo'}</Button>
            </div>
        </form>
      </Modal>

      {deletingBadge && (
          <Modal isOpen={!!deletingBadge} onClose={() => setDeletingBadge(null)} title="Xác nhận xóa danh hiệu">
              <p>Bạn có chắc chắn muốn xóa danh hiệu <span className="font-semibold">"{deletingBadge.name}"</span>? Hành động này sẽ xóa danh hiệu khỏi tất cả thành viên đang sở hữu.</p>
              <div className="flex justify-end gap-2 mt-4">
                  <Button variant="secondary" onClick={() => setDeletingBadge(null)}>Hủy</Button>
                  <Button variant="destructive" onClick={handleConfirmDeleteBadge}>Xóa</Button>
              </div>
          </Modal>
      )}

      {/* User Action Confirmation Modal */}
      {confirmUserAction && (
          <Modal isOpen={!!confirmUserAction} onClose={() => setConfirmUserAction(null)} title="Xác nhận hành động">
              <div className="space-y-4">
                  <p>Bạn có chắc chắn muốn {confirmUserAction.type === 'delete' ? 'xóa' : (confirmUserAction.type === 'lock' ? 'khóa' : 'mở khóa')} tài khoản của <span className="font-bold">{confirmUserAction.user.name}</span>?</p>
                   <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setConfirmUserAction(null)}>Hủy</Button>
                        <Button variant={confirmUserAction.type === 'delete' ? 'destructive' : 'primary'} onClick={handleConfirmUserAction}>Xác nhận</Button>
                    </div>
              </div>
          </Modal>
      )}
      
      {/* Delete Post Confirmation Modal */}
      {deletingPost && (
          <Modal isOpen={!!deletingPost} onClose={() => setDeletingPost(null)} title="Xác nhận xóa bài viết">
               <p>Bạn có chắc chắn muốn xóa bài viết <span className="font-semibold">"{deletingPost.title}"</span>?</p>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="secondary" onClick={() => setDeletingPost(null)}>Hủy</Button>
                    <Button variant="destructive" onClick={handleConfirmDeletePost}>Xóa</Button>
                </div>
          </Modal>
      )}

      {/* Preview Modal */}
      {previewContent && (
        <Modal isOpen={!!previewContent} onClose={() => setPreviewContent(null)} title="Xem trước nội dung">
            {'url' in previewContent ? (
                // Preview Memory
                <div>
                    <img src={previewContent.url} alt="Kỷ niệm" className="w-full h-auto rounded-lg object-contain max-h-[60vh]" />
                    <div className="mt-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                        <p className="text-sm"><strong>Học kỳ:</strong> {previewContent.semester}</p>
                        <p className="text-sm"><strong>Người đăng:</strong> {users.find(u => u.id === previewContent.uploaderId)?.name || 'Không rõ'}</p>
                    </div>
                </div>
            ) : (
                // Preview Document
                <div className="space-y-3">
                     <h3 className="text-lg font-bold">{previewContent.title}</h3>
                     <p className="text-sm"><strong>Người đăng:</strong> {users.find(u => u.id === previewContent.uploaderId)?.name || 'Không rõ'}</p>
                     <p className="text-sm"><strong>Môn học:</strong> {previewContent.subject}</p>
                     <p className="text-sm"><strong>Loại:</strong> {previewContent.type}</p>
                     <div className="pt-4 border-t dark:border-gray-700">
                        <a href={previewContent.link} target="_blank" rel="noopener noreferrer">
                            <Button>
                                <Icons.Book className="w-4 h-4 mr-2"/>
                                Đi đến tài liệu
                            </Button>
                        </a>
                     </div>
                </div>
            )}
        </Modal>
      )}

      {viewingReport && (() => {
          const report = viewingReport;
          const reporter = users.find(u => u.id === report.reporterId);
          let content: Post | Comment | DocType | null = null;
          let author: User | undefined;

          if (report.contentType === 'post') {
              content = posts.find(p => p.id === report.contentId) || null;
              if (content) author = users.find(u => u.id === (content as Post).authorId);
          } else if (report.contentType === 'comment') {
              content = posts.flatMap(p => p.comments).find(c => c.id === report.contentId) || null;
              if (content) author = users.find(u => u.id === (content as Comment).authorId);
          }

          return (
              <Modal isOpen={!!viewingReport} onClose={() => setViewingReport(null)} title="Chi tiết Báo cáo">
                  <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                          <h4 className="font-semibold text-sm mb-1">Nội dung bị báo cáo:</h4>
                          {content ? (
                            <p className="text-sm italic">
                                {report.contentType === 'post' ? (content as Post).title : `"${(content as Comment).content}"`}
                            </p>
                          ) : (
                            <p className="text-sm italic text-gray-500">Nội dung không còn tồn tại.</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">Bởi: {author?.name || 'Không rõ'}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                          <h4 className="font-semibold text-sm mb-1">Thông tin báo cáo:</h4>
                          <p className="text-sm"><strong>Người báo cáo:</strong> {reporter?.name}</p>
                          <p className="text-sm"><strong>Lý do:</strong> {report.reason}</p>
                          {report.details && <p className="text-sm"><strong>Chi tiết:</strong> {report.details}</p>}
                          <p className="text-xs text-gray-500 mt-1">Thời gian: {report.timestamp}</p>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                          <Button variant="secondary" onClick={() => handleReportAction(report.id, 'dismiss')}>Bỏ qua</Button>
                          <Button variant="destructive" onClick={() => handleReportAction(report.id, 'deleteContent')}>Xóa nội dung</Button>
                      </div>
                  </div>
              </Modal>
          );
      })()}

      <Modal isOpen={isRestoreConfirmOpen} onClose={() => setRestoreConfirmOpen(false)} title="Xác nhận Khôi phục Dữ liệu">
        <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <Icons.AlertTriangle className="w-8 h-8 text-red-500 mt-1"/>
                <div>
                    <h3 className="font-bold text-red-500">Cảnh báo!</h3>
                    <p className="text-sm text-red-400">Hành động này sẽ **xóa toàn bộ dữ liệu hiện tại** và thay thế bằng dữ liệu từ tệp sao lưu. Hành động này **không thể hoàn tác**.</p>
                </div>
            </div>
            <p>Bạn có chắc chắn muốn tiếp tục?</p>
            <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setRestoreConfirmOpen(false)}>Hủy</Button>
                <Button variant="destructive" onClick={handleConfirmRestore}>Xác nhận khôi phục</Button>
            </div>
        </div>
      </Modal>

      {/* User Badge Management Modal */}
      <Modal 
        isOpen={userBadgeModalOpen} 
        onClose={() => {
          setUserBadgeModalOpen(false);
          setManagingUserBadges(null);
        }} 
        title={`Quản lý danh hiệu - ${managingUserBadges?.name || ''}`}
      >
        <div className="space-y-4">
          {/* Current Badges */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Icons.Award className="w-4 h-4" />
              Danh hiệu hiện có ({managingUserBadges?.badges?.length || 0})
            </h3>
            {managingUserBadges?.badges && managingUserBadges.badges.length > 0 ? (
              <div className="space-y-2">
                {managingUserBadges.badges.map((userBadge: any) => {
                  // Handle both structure: direct Badge or UserBadge with nested badge
                  const badge = userBadge.badge || userBadge;
                  const BadgeIcon = Icons[badge.icon as keyof typeof Icons] || Icons.Award;
                  return (
                    <div key={badge.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <BadgeIcon className={cn('w-5 h-5', badge.color)} />
                        <div>
                          <p className="text-sm font-medium">{badge.name}</p>
                          <p className="text-xs text-gray-500">{badge.description}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveBadgeFromUser(badge.id)}
                      >
                        <Icons.X className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Chưa có danh hiệu nào</p>
            )}
          </div>

          {/* Available Badges */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Icons.Plus className="w-4 h-4" />
              Trao danh hiệu mới
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {badges
                .filter(badge => !managingUserBadges?.badges?.some((ub: any) => {
                  const userBadge = ub.badge || ub;
                  return userBadge.id === badge.id;
                }))
                .map(badge => {
                  const BadgeIcon = Icons[badge.icon as keyof typeof Icons] || Icons.Award;
                  return (
                    <div 
                      key={badge.id} 
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={() => handleAddBadgeToUser(badge.id)}
                    >
                      <div className="flex items-center gap-2">
                        <BadgeIcon className={cn('w-5 h-5', badge.color)} />
                        <div>
                          <p className="text-sm font-medium">{badge.name}</p>
                          <p className="text-xs text-gray-500">
                            {badge.description}
                            {badge.requiredPoints && badge.requiredPoints > 0 && (
                              <span className="ml-2 text-blue-500">• {badge.requiredPoints} điểm</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Icons.Plus className="w-4 h-4 text-green-500" />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Admin;