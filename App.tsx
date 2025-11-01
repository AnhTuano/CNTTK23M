
import React, { useState, createContext, useMemo, useCallback, useEffect } from 'react';
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
import { Post, Document as Doc, User, Memory as Mem, ChatRoom, Notification, WebsiteConfig, Role, Badge, Report } from './types';
import { 
  MOCK_POSTS, 
  MOCK_DOCUMENTS, 
  MOCK_USERS, 
  MOCK_MEMORIES, 
  MOCK_CHAT_ROOMS, 
  MOCK_NOTIFICATIONS,
  MOCK_WEBSITE_CONFIG,
  BADGES,
  MOCK_REPORTS,
  currentUser as loggedInUser
} from './constants';

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
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig>(MOCK_WEBSITE_CONFIG);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [documents, setDocuments] = useState<Doc[]>(MOCK_DOCUMENTS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [memories, setMemories] = useState<Mem[]>(MOCK_MEMORIES);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(MOCK_CHAT_ROOMS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [currentUser, setCurrentUser] = useState<User>(loggedInUser);
  const [badges, setBadges] = useState<Badge[]>(Object.values(BADGES));
  const [animateBell, setAnimateBell] = useState(false);
  
  const updateUser = useCallback((updatedUser: User) => {
    setUsers(currentUsers => currentUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  }, [currentUser]);

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
    const loggedIn = users.find(u => u.id === loggedInUser.id) || loggedInUser;
    setCurrentUser(loggedIn);
    if (loggedIn.mustChangePassword) {
      setPasswordChangeRequired(true);
    }
  }, [users]);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setPasswordChangeRequired(false);
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

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
        if (!isAuthenticated || isLoading) return;
        const newNotif: Notification = {
            id: Date.now(),
            type: 'system',
            text: `Đây là một thông báo hệ thống tự động. Thời gian: ${new Date().toLocaleTimeString('vi-VN')}`,
            timestamp: 'Vừa xong',
            read: false,
        };
        setNotifications(prev => [newNotif, ...prev]);
        setAnimateBell(true);
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, isLoading]);

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
        return <Chat chatRooms={chatRooms} setChatRooms={setChatRooms} users={users} currentUser={currentUser} />;
      case 'Kỷ niệm':
        return <Memories memories={memories} setMemories={setMemories} users={users} currentUser={currentUser} isLoading={isLoading} />;
      case 'Hồ sơ':
        return <Profile 
          user={currentUser} 
          updateUser={updateUser}
          posts={posts} 
          documents={documents} 
          setActivePage={setActivePage}
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
        />;
      case 'Thành tích':
        return <Leaderboard users={users} />;
      case 'Thông báo':
        return <Notifications notifications={notifications} setNotifications={setNotifications} />;
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
        </div>
      </ToastProvider>
    </ThemeContext.Provider>
  );
};

export default App;
