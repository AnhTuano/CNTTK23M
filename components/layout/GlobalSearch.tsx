
import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icons } from '../icons';
import { Post, Document as Doc, User } from '../../types';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  documents: Doc[];
  users: User[];
  setActivePage: (page: any) => void;
}

const SearchResultItem = ({ icon, title, subtitle, onClick }: { icon: React.ReactNode, title: string, subtitle: string, onClick: () => void }) => (
    <button onClick={onClick} className="flex items-center gap-4 w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 text-left">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1 overflow-hidden">
            <p className="font-semibold truncate">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>
        </div>
        <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
    </button>
);

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, posts, documents, users, setActivePage }) => {
    const [query, setQuery] = useState('');

    const searchResults = useMemo(() => {
        if (!query.trim()) {
            return { posts: [], documents: [], users: [] };
        }
        const lowerCaseQuery = query.toLowerCase();
        const filteredPosts = posts.filter(p => p.title.toLowerCase().includes(lowerCaseQuery) || p.content.toLowerCase().includes(lowerCaseQuery));
        const filteredDocs = documents.filter(d => d.title.toLowerCase().includes(lowerCaseQuery) || d.subject.toLowerCase().includes(lowerCaseQuery));
        const filteredUsers = users.filter(u => u.name.toLowerCase().includes(lowerCaseQuery));
        return { posts: filteredPosts, documents: filteredDocs, users: filteredUsers };
    }, [query, posts, documents, users]);

    useEffect(() => {
        if (!isOpen) {
            // Delay clearing query to prevent flash of "no results"
            setTimeout(() => setQuery(''), 300);
        }
    }, [isOpen]);
    
    const handleNavigation = (page: any) => {
        setActivePage(page);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-[10vh]"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: -20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: -20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b dark:border-gray-700/50 relative">
                            <Icons.Search className="absolute left-7 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm bài viết, tài liệu, thành viên..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-transparent p-2 pl-10 focus:outline-none text-lg"
                                autoFocus
                            />
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                            {query.trim() === '' ? (
                                <div className="p-10 text-center text-gray-500">
                                    <Icons.Search className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                                    Bắt đầu gõ để tìm kiếm.
                                </div>
                            ) : (
                                <div className="p-2 space-y-2">
                                    {searchResults.posts.length > 0 && (
                                        <div>
                                            <h3 className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Bài viết</h3>
                                            {searchResults.posts.map(post => <SearchResultItem key={`post-${post.id}`} icon={<Icons.Newspaper className="w-5 h-5 text-blue-500"/>} title={post.title} subtitle={`Trong mục ${post.category}`} onClick={() => handleNavigation('Tin tức')} />)}
                                        </div>
                                    )}
                                     {searchResults.documents.length > 0 && (
                                        <div>
                                            <h3 className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Tài liệu</h3>
                                            {searchResults.documents.map(doc => <SearchResultItem key={`doc-${doc.id}`} icon={<Icons.Book className="w-5 h-5 text-green-500"/>} title={doc.title} subtitle={`Môn ${doc.subject}`} onClick={() => handleNavigation('Tài liệu')} />)}
                                        </div>
                                    )}
                                     {searchResults.users.length > 0 && (
                                        <div>
                                            <h3 className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Thành viên</h3>
                                            {searchResults.users.map(user => <SearchResultItem key={`user-${user.id}`} icon={<Icons.User className="w-5 h-5 text-purple-500"/>} title={user.name} subtitle={user.role} onClick={() => handleNavigation('Thành tích')} />)}
                                        </div>
                                    )}
                                    {searchResults.posts.length === 0 && searchResults.documents.length === 0 && searchResults.users.length === 0 && (
                                         <div className="p-10 text-center text-gray-500">
                                            <Icons.Search className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                                            Không tìm thấy kết quả nào cho "{query}".
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
