import React from 'react';
import { cn } from '../../lib/utils';
import { Icons } from '../icons';
import { Role, User, WebsiteConfig } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activePage: string;
  setActivePage: (page: string) => void;
  currentUser: User;
  websiteConfig: WebsiteConfig;
}

const navItems = [
  { name: 'Bảng điều khiển', icon: Icons.Home },
  { name: 'Tin tức', icon: Icons.Newspaper },
  { name: 'Thông báo', icon: Icons.Bell },
  { name: 'Trò chuyện', icon: Icons.MessageSquare },
  { name: 'Tài liệu', icon: Icons.Book },
  { name: 'Kỷ niệm', icon: Icons.Camera },
  { name: 'Thành tích', icon: Icons.Trophy },
  { name: 'Quản trị', icon: Icons.Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, activePage, setActivePage, currentUser, websiteConfig }) => {
  const handleNavigation = (page: string) => {
    setActivePage(page);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsOpen(false)}
      ></div>
      <aside
        className={cn(
          'fixed lg:relative lg:translate-x-0 z-40 flex h-full w-64 flex-shrink-0 flex-col bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 flex-shrink-0 items-center justify-between px-4 border-b dark:border-gray-800">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
            {websiteConfig.websiteName}
          </h1>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
            <Icons.X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul>
            {navItems.map((item) => {
              if (item.name === 'Quản trị' && currentUser.role !== Role.Admin) {
                return null;
              }
              return (
              <li key={item.name}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(item.name);
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all',
                    activePage === item.name
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </a>
              </li>
            );
            })}
          </ul>
        </nav>
        {/* The logout button was here and is now removed */}
      </aside>
    </>
  );
};