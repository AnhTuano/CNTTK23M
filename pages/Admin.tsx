import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card } from '../components/ui/Card';
import { ROLE_COLORS } from '../constants';
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
}

const chartData = [
  { name: 'Bài đăng', value: 50 },
  { name: 'Tài liệu', value: 80 },
  { name: 'Bình luận', value: 250 },
  { name: 'Kỷ niệm', value: 15 },
  { name: 'Thành viên', value: 60 },
];

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
    reports, setReports
  } = props;

  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('stats');
  
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
  const pendingDocuments = documents.filter(d => d.status === 'chờ duyệt');
  const pendingMemories = memories.filter(m => m.status === 'chờ duyệt');
  
  // Achievement management state
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [deletingBadge, setDeletingBadge] = useState<Badge | null>(null);
  const [badgeFormData, setBadgeFormData] = useState<Omit<Badge, 'id'>>({ name: '', description: '', icon: 'Award', color: 'text-gray-400' });
  
  // Report management state
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const pendingReports = reports.filter(r => r.status === 'pending');
  
  // Backup & Restore
  const [isRestoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [restoreData, setRestoreData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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


  const handleApprove = (type: 'document' | 'memory', id: number) => {
    if (type === 'document') {
        setDocuments(prev => prev.map(d => d.id === id ? { ...d, status: 'đã duyệt' } : d));
        addToast({ title: 'Đã duyệt!', message: 'Tài liệu đã được hiển thị công khai.', type: 'success' });
    } else {
        setMemories(prev => prev.map(m => m.id === id ? { ...m, status: 'đã duyệt' } : m));
        addToast({ title: 'Đã duyệt!', message: 'Kỷ niệm đã được hiển thị công khai.', type: 'success' });
    }
  };

  const handleReject = (type: 'document' | 'memory', id: number) => {
    if (type === 'document') {
        setDocuments(prev => prev.filter(d => d.id !== id));
        addToast({ title: 'Đã từ chối!', message: 'Tài liệu đã bị xóa.', type: 'info' });
    } else {
        setMemories(prev => prev.filter(m => m.id !== id));
        addToast({ title: 'Đã từ chối!', message: 'Kỷ niệm đã bị xóa.', type: 'info' });
    }
  };


  const handleSaveRole = (newRole: Role) => {
    if (!editingUser) return;
    setUsers(prev => prev.map(u => (u.id === editingUser.id ? { ...u, role: newRole } : u)));
    addToast({ title: 'Thành công!', message: `Đã cập nhật vai trò cho ${editingUser.name}.`, type: 'success' });
    setEditingUser(null);
  };

  const handleConfirmUserAction = () => {
    if (!confirmUserAction) return;
    const { type, user } = confirmUserAction;

    if (type === 'delete') {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      addToast({ title: 'Đã xóa!', message: `Thành viên ${user.name} đã được xóa.`, type: 'info' });
    } else if (type === 'lock' || type === 'unlock') {
      setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, locked: type === 'lock' } : u)));
      addToast({ title: 'Thành công!', message: `Đã ${type === 'lock' ? 'khóa' : 'mở khóa'} tài khoản ${user.name}.`, type: 'success' });
    }
    setConfirmUserAction(null);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
      e.preventDefault();
      setWebsiteConfig(configFormData);
      addToast({ title: 'Thành công!', message: 'Cài đặt chung đã được cập nhật.', type: 'success' });
  };
  
  const handleToggleMaintenance = () => {
    const newMode = !configFormData.isMaintenanceMode;
    setConfigFormData({...configFormData, isMaintenanceMode: newMode});
    setWebsiteConfig({...websiteConfig, isMaintenanceMode: newMode}); // Apply immediately
    addToast({
      title: 'Thành công!',
      message: newMode ? 'Chế độ bảo trì đã được bật.' : 'Chế độ bảo trì đã được tắt.',
      type: 'info'
    });
  };

  const handleAllowedRolesChange = (role: Role) => {
    const currentRoles = configFormData.allowedPostRoles || [];
    let newRoles;
    if (currentRoles.includes(role)) {
        newRoles = currentRoles.filter(r => r !== role);
    } else {
        newRoles = [...currentRoles, role];
    }
    const updatedConfig = { ...configFormData, allowedPostRoles: newRoles };
    setConfigFormData(updatedConfig);
    setWebsiteConfig(updatedConfig);
    addToast({
      title: 'Thành công!',
      message: 'Quyền đăng bài đã được cập nhật.',
      type: 'info'
    });
};


  const handlePinPost = (postId: number) => {
      setPosts(posts.map(p => p.id === postId ? { ...p, pinned: !p.pinned } : p));
      const post = posts.find(p => p.id === postId);
      addToast({ title: 'Thành công!', message: post?.pinned ? 'Đã bỏ ghim bài viết.' : 'Đã ghim bài viết.', type: 'info' });
  };
  
  const handleConfirmDeletePost = () => {
      if (!deletingPost) return;
      setPosts(posts.filter(p => p.id !== deletingPost.id));
      addToast({ title: 'Đã xóa!', message: 'Bài viết đã được xóa.', type: 'info' });
      setDeletingPost(null);
  };

  const handleNewUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email || !newUserData.major) {
        addToast({ title: 'Lỗi!', message: 'Vui lòng điền đầy đủ các trường bắt buộc.', type: 'error' });
        return;
    }

    const newUser: User = {
        id: Date.now(),
        name: newUserData.name,
        avatar: `https://picsum.photos/seed/user${Date.now()}/100`,
        coverImage: `https://picsum.photos/seed/cover${Date.now()}/1000/300`,
        role: newUserData.role,
        bio: 'Chào mọi người, mình là thành viên mới!',
        major: newUserData.major,
        joinDate: new Date().toLocaleDateString('vi-VN'),
        contact: {
            email: newUserData.email,
        },
        socials: {},
        posts: 0,
        documents: 0,
        comments: 0,
        points: 0,
        badges: [],
        locked: false,
        mustChangePassword: true,
    };

    setUsers(prev => [...prev, newUser]);
    addToast({ title: 'Thành công!', message: `Đã tạo tài khoản cho ${newUser.name}.`, type: 'success' });
    setCreateUserModalOpen(false);
    setNewUserData(initialNewUserState);
  };

  const handleOpenCreateBadgeModal = () => {
    setEditingBadge(null);
    setBadgeFormData({ name: '', description: '', icon: 'Award', color: 'text-gray-400' });
    setIsBadgeModalOpen(true);
  };

  const handleOpenEditBadgeModal = (badge: Badge) => {
      setEditingBadge(badge);
      setBadgeFormData({ name: badge.name, description: badge.description, icon: badge.icon, color: badge.color });
      setIsBadgeModalOpen(true);
  };

  const handleSaveBadge = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingBadge) { // Editing existing badge
          const updatedBadge = { ...editingBadge, ...badgeFormData };
          setBadges(prev => prev.map(b => b.id === updatedBadge.id ? updatedBadge : b));
          setUsers(prevUsers => prevUsers.map(user => ({
              ...user,
              badges: user.badges.map(b => b.id === updatedBadge.id ? updatedBadge : b)
          })));
          addToast({ title: 'Thành công!', message: 'Đã cập nhật danh hiệu.', type: 'success' });
      } else { // Creating new badge
          const newBadgeId = badgeFormData.name.toUpperCase().replace(/\s/g, '_');
          if (badges.some(b => b.id === newBadgeId)) {
              addToast({ title: 'Lỗi!', message: 'Một danh hiệu với tên tương tự đã tồn tại.', type: 'error' });
              return;
          }
          const newBadge = {
              id: newBadgeId,
              ...badgeFormData
          };
          setBadges(prev => [...prev, newBadge]);
          addToast({ title: 'Thành công!', message: 'Đã tạo danh hiệu mới.', type: 'success' });
      }
      setIsBadgeModalOpen(false);
  };

  const handleConfirmDeleteBadge = () => {
      if (!deletingBadge) return;
      const badgeId = deletingBadge.id;
      setBadges(prev => prev.filter(b => b.id !== badgeId));
      setUsers(prevUsers => prevUsers.map(user => ({
          ...user,
          badges: user.badges.filter(b => b.id !== badgeId)
      })));
      addToast({ title: 'Đã xóa!', message: 'Danh hiệu đã được xóa.', type: 'info' });
      setDeletingBadge(null);
  };

  const handleReportAction = (reportId: number, action: 'dismiss' | 'deleteContent') => {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;
  
      if (action === 'deleteContent') {
          if (report.contentType === 'post') {
              setPosts(prev => prev.filter(p => p.id !== report.contentId));
              addToast({ title: 'Thành công!', message: 'Bài viết đã được xóa.', type: 'success' });
          } else if (report.contentType === 'comment') {
              setPosts(prev => prev.map(p => ({
                  ...p,
                  comments: p.comments.filter(c => c.id !== report.contentId)
              })));
              addToast({ title: 'Thành công!', message: 'Bình luận đã được xóa.', type: 'success' });
          }
      } else {
        addToast({ title: 'Đã bỏ qua', message: 'Báo cáo đã được bỏ qua.', type: 'info' });
      }
  
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
      setViewingReport(null);
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Icons.Globe className="w-5 h-5"/> Cài đặt chung</h2>
                <form onSubmit={handleSaveConfig} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tên Website</label>
                        <input value={configFormData.websiteName} onChange={(e) => setConfigFormData({...configFormData, websiteName: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tiêu đề trang (Tab trình duyệt)</label>
                        <input value={configFormData.websiteTitle} onChange={(e) => setConfigFormData({...configFormData, websiteTitle: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tên lớp</label>
                        <input value={configFormData.className} onChange={(e) => setConfigFormData({...configFormData, className: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Slogan</label>
                        <input value={configFormData.slogan} onChange={(e) => setConfigFormData({...configFormData, slogan: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Link ảnh bìa trang chủ</label>
                        <input value={configFormData.coverImage} onChange={(e) => setConfigFormData({...configFormData, coverImage: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit">Lưu thay đổi</Button>
                    </div>
                </form>
            </Card>
             <div className="space-y-6">
                <Card>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Icons.Settings className="w-5 h-5"/> Cài đặt hệ thống</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                            <div>
                                <h3 className="font-semibold">Chế độ bảo trì</h3>
                                <p className="text-xs text-gray-500">Khi được bật, chỉ admin mới có thể truy cập trang.</p>
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
                        <div className="p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
                            <h3 className="font-semibold">Quyền đăng bài</h3>
                            <p className="text-xs text-gray-500 mb-2">Chọn những vai trò được phép đăng bài trên trang Tin tức.</p>
                            <div className="space-y-2">
                                {Object.values(Role).map(role => {
                                    const isChecked = configFormData.allowedPostRoles?.includes(role);
                                    const isAdmin = role === Role.Admin;
                                    return (
                                        <label key={role} className={cn("flex items-center justify-between text-sm", isAdmin ? "cursor-not-allowed" : "cursor-pointer")}>
                                            <span className={cn(isAdmin && "opacity-50")}>{role}</span>
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
                    </div>
                </Card>
                <Card>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Icons.Bell className="w-5 h-5"/> Thông báo Banner</h2>
                    <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nội dung Banner</label>
                        <textarea value={configFormData.banner?.text || ''} onChange={(e) => setConfigFormData({...configFormData, banner: {...configFormData.banner, text: e.target.value}})} rows={3} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Loại Banner</label>
                        <select value={configFormData.banner?.type || 'info'} onChange={(e) => setConfigFormData({...configFormData, banner: {...configFormData.banner, type: e.target.value as 'info' | 'warning' | 'critical'}})} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="info">Thông tin (Xanh)</option>
                            <option value="warning">Cảnh báo (Vàng)</option>
                            <option value="critical">Khẩn cấp (Đỏ)</option>
                        </select>
                    </div>
                        <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">Kích hoạt Banner</h3>
                        <button
                            onClick={() => {
                                const updatedConfig = {...configFormData, banner: {...configFormData.banner, isActive: !configFormData.banner.isActive}};
                                setConfigFormData(updatedConfig);
                                setWebsiteConfig(updatedConfig);
                            }}
                            className={cn(
                                "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
                                configFormData.banner?.isActive ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                            )}
                        >
                            <span
                                className={cn(
                                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                configFormData.banner?.isActive ? "translate-x-5" : "translate-x-0"
                                )}
                            />
                        </button>
                    </div>
                    </div>
                </Card>
                <Card>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Icons.Database className="w-5 h-5"/> Sao lưu & Khôi phục</h2>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tạo một bản sao lưu toàn bộ dữ liệu của trang hoặc khôi phục từ một tệp đã có.</p>
                        <div className="flex items-center gap-2">
                             <Button onClick={handleBackup} variant="secondary" className="w-full">
                                <Icons.Download className="w-4 h-4 mr-2"/>
                                Tạo bản sao lưu
                            </Button>
                            <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="w-full">
                                <Icons.Upload className="w-4 h-4 mr-2"/>
                                Khôi phục từ tệp
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleRestoreFileSelect}
                                className="hidden"
                                accept="application/json"
                            />
                        </div>
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
                    <th scope="col" className="px-6 py-3">Trạng thái</th>
                    <th scope="col" className="px-6 py-3">Hành động</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user) => {
                    const isCurrentUser = user.id === currentUser.id;
                    return (
                    <tr key={user.id} className={cn("border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50", user.locked && "opacity-60 bg-gray-100 dark:bg-gray-800/20")}>
                    <td className="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-3">
                        <img className="w-9 h-9 rounded-full" src={user.avatar} alt={user.name} />
                        {user.name}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span
                        className="px-2 py-1 rounded-full text-xs font-semibold"
                        style={{
                            backgroundColor: `${ROLE_COLORS[user.role].primary}20`,
                            color: ROLE_COLORS[user.role].primary,
                        }}
                        >
                        {user.role}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{user.points}</td>
                    <td className="px-6 py-4">
                        {user.locked ? (
                            <span className="text-yellow-500 font-semibold flex items-center gap-1 text-xs"><Icons.Lock className="w-3 h-3"/> Đã khóa</span>
                        ) : (
                            <span className="text-green-500 font-semibold flex items-center gap-1 text-xs"><Icons.Unlock className="w-3 h-3"/> Hoạt động</span>
                        )}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
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
                <Button onClick={handleOpenCreateBadgeModal}>
                    <Icons.Plus className="w-4 h-4 mr-2" />
                    Tạo danh hiệu mới
                </Button>
            </div>
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[600px] text-sm text-left">
                    <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3">Icon</th>
                            <th scope="col" className="px-6 py-3">Tên</th>
                            <th scope="col" className="px-6 py-3">Mô tả</th>
                            <th scope="col" className="px-6 py-3">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {badges.map(badge => {
                            const IconComponent = Icons[badge.icon];
                            return (
                            <tr key={badge.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-6 py-4">
                                    {IconComponent && <IconComponent className={cn("w-6 h-6", badge.color)} />}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{badge.name}</td>
                                <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{badge.description}</td>
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
                        <option key={role} value={role}>{role}</option>
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
            <div>
                <label className="block text-sm font-medium mb-1">Tên danh hiệu</label>
                <input value={badgeFormData.name} onChange={(e) => setBadgeFormData({...badgeFormData, name: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea value={badgeFormData.description} onChange={(e) => setBadgeFormData({...badgeFormData, description: e.target.value})} rows={3} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
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
                    <label className="block text-sm font-medium mb-1">Màu sắc (Tailwind class)</label>
                    <input value={badgeFormData.color} onChange={(e) => setBadgeFormData({...badgeFormData, color: e.target.value})} placeholder="e.g., text-blue-500" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
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

    </div>
  );
};

export default Admin;