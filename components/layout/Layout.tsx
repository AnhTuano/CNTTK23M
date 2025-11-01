
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Notification, User, WebsiteConfig, Post, Document as Doc } from '../../types';
import { cn } from '../../lib/utils';
import { Icons } from '../icons';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalSearch } from './GlobalSearch';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: any) => void;
  onLogout: () => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  currentUser: User;
  websiteConfig: WebsiteConfig;
  animateBell: boolean;
  setAnimateBell: React.Dispatch<React.SetStateAction<boolean>>;
  posts: Post[];
  documents: Doc[];
  users: User[];
}

const GlobalBanner: React.FC<{ websiteConfig: WebsiteConfig }> = ({ websiteConfig }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!websiteConfig.banner.isActive || !isVisible) {
    return null;
  }

  const bannerStyles = {
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
  };
  const Icon = {
    info: Icons.Bell,
    warning: Icons.AlertTriangle,
    critical: Icons.AlertCircle,
  }[websiteConfig.banner.type] || Icons.Bell;


  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className={cn(
            "relative z-50 text-white text-sm font-medium px-4 py-2 flex items-center justify-center gap-3",
            bannerStyles[websiteConfig.banner.type]
          )}
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="text-center">{websiteConfig.banner.text}</p>
            <button onClick={() => setIsVisible(false)} className="absolute right-2 p-1 rounded-md hover:bg-white/20">
              <Icons.X className="w-5 h-5"/>
            </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


export const Layout: React.FC<LayoutProps> = ({ children, activePage, setActivePage, onLogout, notifications, setNotifications, currentUser, websiteConfig, animateBell, setAnimateBell, posts, documents, users }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      <GlobalBanner websiteConfig={websiteConfig} />
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setSearchOpen(false)}
        posts={posts}
        documents={documents}
        users={users}
        setActivePage={setActivePage}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} activePage={activePage} setActivePage={setActivePage} currentUser={currentUser} websiteConfig={websiteConfig} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
              setSidebarOpen={setSidebarOpen} 
              pageTitle={activePage}
              notifications={notifications}
              setNotifications={setNotifications}
              currentUser={currentUser}
              setActivePage={setActivePage}
              onLogout={onLogout}
              animateBell={animateBell}
              setAnimateBell={setAnimateBell}
              onSearchClick={() => setSearchOpen(true)}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
