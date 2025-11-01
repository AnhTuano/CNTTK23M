import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/icons';
import { ROLE_COLORS, REPORT_REASONS } from '../constants';
import { Post as PostType, User as UserType, Role, Comment, Poll, PollOption, WebsiteConfig, Report, ReportReason } from '../types';
import { cn } from '../lib/utils';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../hooks/useToast';
import { AnimatePresence, motion } from 'framer-motion';
import { Skeleton } from '../components/ui/Skeleton';

interface NewsProps {
    posts: PostType[];
    setPosts: React.Dispatch<React.SetStateAction<PostType[]>>;
    users: UserType[];
    currentUser: UserType;
    websiteConfig: WebsiteConfig;
    reports: Report[];
    setReports: React.Dispatch<React.SetStateAction<Report[]>>;
    isLoading: boolean;
}

const PostCard = React.memo<{ 
    post: PostType; 
    author?: UserType; 
    currentUser: UserType;
    onClick: () => void; 
    onVote: (type: 'up' | 'down') => void;
    hasUpvoted: boolean;
    hasDownvoted: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onPin: () => void;
    onReport: () => void;
}>(({ post, author, currentUser, onClick, onVote, hasUpvoted, hasDownvoted, onEdit, onDelete, onPin, onReport }) => {
    const voteCount = post.upvotedBy.length - post.downvotedBy.length;
    const canManage = [Role.Admin, Role.LopTruong, Role.BiThu].includes(currentUser.role);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        setMenuOpen(false);
        action();
    };

    return (
        <Card onClick={onClick} className="flex flex-col h-full">
            {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="rounded-lg mb-4 w-full h-40 object-cover" />}
            {author && (
                 <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <img src={author.avatar} alt={author.name} className="w-11 h-11 rounded-full" />
                        <div>
                            <p className="font-semibold">{author.name}</p>
                            <span
                                className="mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                                style={{ backgroundColor: ROLE_COLORS[author.role].primary }}
                            >
                                {author.role}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {post.pinned && <Icons.Pin className="w-5 h-5 text-yellow-500" />}
                        <div className="relative" ref={menuRef}>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="!w-8 !h-8" 
                                onClick={(e) => { e.stopPropagation(); setMenuOpen(prev => !prev); }}>
                                <Icons.MoreVertical className="w-4 h-4" />
                            </Button>
                            <AnimatePresence>
                            {menuOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute right-0 mt-1 w-36 origin-top-right rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20"
                                >
                                    <div className="py-1 text-gray-700 dark:text-gray-200" role="menu">
                                        {canManage ? (
                                            <>
                                                <button onClick={(e) => handleActionClick(e, onEdit)} className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                                                    <Icons.Edit className="w-4 h-4 mr-2" /> Sửa
                                                </button>
                                                <button onClick={(e) => handleActionClick(e, onPin)} className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                                                    <Icons.Pin className="w-4 h-4 mr-2" /> {post.pinned ? 'Bỏ ghim' : 'Ghim'}
                                                </button>
                                                <button onClick={(e) => handleActionClick(e, onReport)} className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                                                    <Icons.Flag className="w-4 h-4 mr-2" /> Báo cáo
                                                </button>
                                                <button onClick={(e) => handleActionClick(e, onDelete)} className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                                                    <Icons.Trash2 className="w-4 h-4 mr-2" /> Xóa
                                                </button>
                                            </>
                                        ) : (
                                            <button onClick={(e) => handleActionClick(e, onReport)} className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                                                <Icons.Flag className="w-4 h-4 mr-2" /> Báo cáo
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                    <Icons.Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">{post.category}</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                {post.poll ? (
                    <div className="mt-2 text-sm p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                        <div className="flex items-center gap-2 font-semibold">
                            <Icons.Vote className="w-4 h-4 text-gray-500"/>
                            <p>{post.poll.question}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{post.content}</p>
                )}
            </div>
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="!w-7 !h-7 group" onClick={(e) => {e.stopPropagation(); onVote('up')}}>
                        <Icons.ArrowUpCircle className={cn("w-5 h-5 group-hover:text-green-500 transition-colors", hasUpvoted && "text-green-500 fill-green-500/20")} />
                    </Button>
                    <span className="font-bold text-sm text-gray-700 dark:text-gray-300 min-w-[20px] text-center">{voteCount}</span>
                     <Button variant="ghost" size="icon" className="!w-7 !h-7 group" onClick={(e) => {e.stopPropagation(); onVote('down')}}>
                        <Icons.ArrowDownCircle className={cn("w-5 h-5 group-hover:text-red-500 transition-colors", hasDownvoted && "text-red-500 fill-red-500/20")} />
                    </Button>
                </div>
                <span>{post.comments.length} bình luận</span>
            </div>
        </Card>
    );
});

const PostCardSkeleton = () => (
    <div className="flex flex-col h-full p-6 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-300/30 dark:border-slate-700/30">
        <Skeleton className="h-40 w-full rounded-lg mb-4" />
        <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-11 h-11 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
            </div>
        </div>
        <div className="flex-grow space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
        </div>
    </div>
);

const initialPostState = { 
    title: '', 
    content: '', 
    imageUrl: '', 
    category: 'Thông báo chung',
    poll: null as { question: string; options: { text: string }[] } | null
};

type PostFormData = typeof initialPostState;

const News: React.FC<NewsProps> = ({ posts, setPosts, users, currentUser, websiteConfig, reports, setReports, isLoading }) => {
    const { addToast } = useToast();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<PostType | null>(null);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
    const [postFormData, setPostFormData] = useState<PostFormData>(initialPostState);
    const [deletingPost, setDeletingPost] = useState<PostType | null>(null);
    const [newComment, setNewComment] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tất cả');

    const [reportingContent, setReportingContent] = useState<{ type: 'post' | 'comment', id: number } | null>(null);
    const [reportReason, setReportReason] = useState<ReportReason>(REPORT_REASONS[0]);
    const [reportDetails, setReportDetails] = useState('');


    const categories = useMemo(() => ['Tất cả', ...new Set(posts.map(p => p.category))], [posts]);

    const filteredPosts = useMemo(() => {
        return posts
            .filter(post => {
                const searchMatch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.content.toLowerCase().includes(searchTerm.toLowerCase());
                const categoryMatch = activeCategory === 'Tất cả' || post.category === activeCategory;
                return searchMatch && categoryMatch;
            })
            .sort((a, b) => (b.upvotedBy.length - b.downvotedBy.length) - (a.upvotedBy.length - a.downvotedBy.length));
    }, [posts, searchTerm, activeCategory]);

    useEffect(() => {
        if (editingPost) {
            setPostFormData({ 
                title: editingPost.title, 
                content: editingPost.content, 
                imageUrl: editingPost.imageUrl || '', 
                category: editingPost.category,
                poll: editingPost.poll ? {
                    question: editingPost.poll.question,
                    options: editingPost.poll.options.map(o => ({ text: o.text }))
                } : null
            });
        } else {
            setPostFormData(initialPostState);
        }
    }, [editingPost, isModalOpen]);

    const handleOpenAddModal = useCallback(() => {
        setEditingPost(null);
        setModalOpen(true);
    }, []);

    const handleOpenEditModal = useCallback((post: PostType) => {
        setEditingPost(post);
        setModalOpen(true);
    }, []);
    
    const handleReportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reportingContent) return;

        const newReport: Report = {
            id: Date.now(),
            contentType: reportingContent.type,
            contentId: reportingContent.id,
            reporterId: currentUser.id,
            reason: reportReason,
            details: reportDetails,
            timestamp: new Date().toLocaleString('vi-VN'),
            status: 'pending',
        };
        setReports(prev => [...prev, newReport]);
        addToast({ title: 'Đã gửi báo cáo', message: 'Cảm ơn bạn đã giúp cộng đồng tốt hơn.', type: 'success' });
        setReportingContent(null);
        setReportDetails('');
    };


    const handleSavePost = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!postFormData.title.trim() || !postFormData.content.trim()) return;

        const postDataToSave = {
            title: postFormData.title,
            content: postFormData.content,
            category: postFormData.category,
            imageUrl: postFormData.imageUrl || undefined,
            poll: postFormData.poll && postFormData.poll.question.trim() ? {
                question: postFormData.poll.question,
                options: postFormData.poll.options
                    .filter(o => o.text.trim() !== '')
                    .map((o, index) => ({ id: index + 1, text: o.text, votedBy: [] }))
            } : undefined
        };

        if (editingPost) {
            setPosts(posts.map(p => p.id === editingPost.id ? { ...p, ...postDataToSave } : p));
            addToast({ title: 'Thành công!', message: 'Bài viết đã được cập nhật.', type: 'success' });
        } else {
            const newPost: PostType = {
                id: Date.now(),
                authorId: currentUser.id,
                ...postDataToSave,
                upvotedBy: [],
                downvotedBy: [],
                timestamp: 'Vừa xong',
                pinned: false,
                comments: []
            };
            setPosts(currentPosts => [newPost, ...currentPosts]);
            addToast({ title: 'Thành công!', message: '+20 điểm cho bài viết mới!', type: 'success' });
        }
        setModalOpen(false);
    }, [postFormData, editingPost, currentUser.id, posts, setPosts, addToast]);
    
    const handleAddComment = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !selectedPost) return;

        const comment: Comment = {
            id: Date.now(),
            postId: selectedPost.id,
            authorId: currentUser.id,
            content: newComment,
            timestamp: 'Vừa xong',
        };
        
        const updatedPosts = posts.map(p => {
            if (p.id === selectedPost.id) {
                return { ...p, comments: [...p.comments, comment] };
            }
            return p;
        });

        setPosts(updatedPosts);
        setSelectedPost(prev => prev ? { ...prev, comments: [...prev.comments, comment] } : null);
        setNewComment('');
        addToast({ title: 'Thành công!', message: '+5 điểm khi bình luận!', type: 'success' });
    }, [newComment, selectedPost, currentUser.id, posts, setPosts, addToast]);

    const handleVote = useCallback((postId: number, voteType: 'up' | 'down') => {
        setPosts(prevPosts => {
            const updatedPosts = prevPosts.map(post => {
                if (post.id === postId) {
                    const userId = currentUser.id;
                    let newUpvotedBy = [...post.upvotedBy];
                    let newDownvotedBy = [...post.downvotedBy];

                    if (voteType === 'up') {
                        if (newUpvotedBy.includes(userId)) {
                            newUpvotedBy = newUpvotedBy.filter(id => id !== userId);
                        } else {
                            newUpvotedBy.push(userId);
                            newDownvotedBy = newDownvotedBy.filter(id => id !== userId);
                        }
                    } else { // down
                        if (newDownvotedBy.includes(userId)) {
                            newDownvotedBy = newDownvotedBy.filter(id => id !== userId);
                        } else {
                            newDownvotedBy.push(userId);
                            newUpvotedBy = newUpvotedBy.filter(id => id !== userId);
                        }
                    }
                    return { ...post, upvotedBy: newUpvotedBy, downvotedBy: newDownvotedBy };
                }
                return post;
            });

            // Also update the selectedPost if it's the one being voted on
            if (selectedPost && selectedPost.id === postId) {
                const updatedPost = updatedPosts.find(p => p.id === postId);
                if (updatedPost) setSelectedPost(updatedPost);
            }
            
            return updatedPosts;
        });
        addToast({ title: 'Thành công!', message: 'Cảm ơn bạn đã bình chọn!', type: 'success' });
    }, [currentUser.id, setPosts, selectedPost, addToast]);
    
    const handlePin = useCallback((post: PostType) => {
        setPosts(currentPosts => currentPosts.map(p => p.id === post.id ? { ...p, pinned: !p.pinned } : p));
        addToast({ title: 'Thành công!', message: post.pinned ? 'Đã bỏ ghim bài viết.' : 'Đã ghim bài viết.', type: 'info' });
    }, [setPosts, addToast]);

    const handleConfirmDelete = useCallback(() => {
        if (!deletingPost) return;
        setPosts(currentPosts => currentPosts.filter(p => p.id !== deletingPost.id));
        addToast({ title: 'Đã xóa!', message: 'Bài viết đã được xóa.', type: 'info' });
        setDeletingPost(null);
    }, [deletingPost, setPosts, addToast]);

    const openPost = useCallback((post: PostType) => {
        setSelectedPost(post);
        setViewModalOpen(true);
    }, []);

    const handlePollVote = useCallback((postId: number, optionId: number) => {
        setPosts(prevPosts => {
            const updatedPosts = prevPosts.map(p => {
                if (p.id === postId && p.poll) {
                    const newPoll = { ...p.poll };
                    const newOptions = newPoll.options.map(opt => {
                        // Remove user from any option they might have voted for
                        let filteredVotedBy = opt.votedBy.filter(id => id !== currentUser.id);
                        if (opt.id === optionId) {
                            // If they clicked the same option they already voted for, unvote. Otherwise, vote.
                            if (!opt.votedBy.includes(currentUser.id)) {
                                filteredVotedBy = [...filteredVotedBy, currentUser.id];
                            }
                        }
                        return { ...opt, votedBy: filteredVotedBy };
                    });

                    return { ...p, poll: { ...newPoll, options: newOptions } };
                }
                return p;
            });
            
            if (selectedPost && selectedPost.id === postId) {
                 const updatedPost = updatedPosts.find(p => p.id === postId);
                if (updatedPost) setSelectedPost(updatedPost);
            }
            
            return updatedPosts;
        });
        addToast({ title: 'Thành công!', message: 'Cảm ơn bạn đã tham gia bình chọn.', type: 'success' });
    }, [currentUser.id, setPosts, selectedPost, addToast]);

    const canPost = websiteConfig.allowedPostRoles.includes(currentUser.role);
    const pinnedPosts = filteredPosts.filter(p => p.pinned);
    const otherPosts = filteredPosts.filter(p => !p.pinned);
    const postAuthor = selectedPost ? users.find(u => u.id === selectedPost.authorId) : null;

    // Poll form handlers
    const togglePollCreator = () => {
        setPostFormData(prev => ({
            ...prev,
            poll: prev.poll ? null : { question: '', options: [{ text: '' }, { text: '' }] }
        }));
    };
    const handlePollQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (postFormData.poll) {
            setPostFormData(prev => ({ ...prev, poll: { ...prev.poll!, question: e.target.value } }));
        }
    };
    const handlePollOptionChange = (index: number, value: string) => {
        if (postFormData.poll) {
            const newOptions = [...postFormData.poll.options];
            newOptions[index] = { text: value };
            setPostFormData(prev => ({ ...prev, poll: { ...prev.poll!, options: newOptions } }));
        }
    };
    const addPollOption = () => {
        if (postFormData.poll) {
            setPostFormData(prev => ({ ...prev, poll: { ...prev.poll!, options: [...prev.poll!.options, { text: '' }] } }));
        }
    };
    const removePollOption = (index: number) => {
        if (postFormData.poll && postFormData.poll.options.length > 2) {
            setPostFormData(prev => ({ ...prev, poll: { ...prev.poll!, options: prev.poll!.options.filter((_, i) => i !== index) } }));
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <Skeleton className="h-9 w-64 rounded-lg" />
                    <Skeleton className="h-10 w-40 rounded-lg" />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <Skeleton className="h-11 w-full md:flex-1 rounded-lg" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-24 rounded-md" />
                        <Skeleton className="h-9 w-24 rounded-md" />
                        <Skeleton className="h-9 w-24 rounded-md" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PostCardSkeleton />
                    <PostCardSkeleton />
                    <PostCardSkeleton />
                    <PostCardSkeleton />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold">Tin tức & Thông báo</h1>
                {canPost && (
                    <Button onClick={handleOpenAddModal}>
                        <Icons.Plus className="w-5 h-5 mr-2" />
                        Đăng bài mới
                    </Button>
                )}
            </div>
            
             <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full md:flex-1">
                    <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Tìm bài viết..." 
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
                    {categories.map(category => (
                        <Button 
                            key={category}
                            variant={activeCategory === category ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setActiveCategory(category)}
                            className="flex-shrink-0"
                        >
                            {category}
                        </Button>
                    ))}
                </div>
            </div>

            {filteredPosts.length === 0 ? (
                <div className="text-center py-20">
                    <Icons.Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">Không tìm thấy bài viết nào</h3>
                    <p className="text-gray-500">Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
                </div>
            ) : (
                <>
                {pinnedPosts.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Icons.Pin className="w-5 h-5 text-yellow-500"/> Tin đã ghim</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pinnedPosts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} author={users.find(u => u.id === post.authorId)} onClick={() => openPost(post)} onVote={(type) => handleVote(post.id, type)} hasUpvoted={post.upvotedBy.includes(currentUser.id)} hasDownvoted={post.downvotedBy.includes(currentUser.id)} onEdit={() => handleOpenEditModal(post)} onDelete={() => setDeletingPost(post)} onPin={() => handlePin(post)} onReport={() => setReportingContent({ type: 'post', id: post.id })} />)}
                        </div>
                    </div>
                )}
                
                <div>
                     <h2 className="text-xl font-semibold my-4">Bài viết gần đây</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {otherPosts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} author={users.find(u => u.id === post.authorId)} onClick={() => openPost(post)} onVote={(type) => handleVote(post.id, type)} hasUpvoted={post.upvotedBy.includes(currentUser.id)} hasDownvoted={post.downvotedBy.includes(currentUser.id)} onEdit={() => handleOpenEditModal(post)} onDelete={() => setDeletingPost(post)} onPin={() => handlePin(post)} onReport={() => setReportingContent({ type: 'post', id: post.id })} />)}
                    </div>
                </div>
                </>
            )}

            {/* Create/Edit Post Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingPost ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}>
                <form onSubmit={handleSavePost} className="space-y-4">
                    <input type="text" placeholder="Tiêu đề" value={postFormData.title} onChange={(e) => setPostFormData(prev => ({...prev, title: e.target.value}))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    <select value={postFormData.category} onChange={(e) => setPostFormData(prev => ({...prev, category: e.target.value}))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {categories.filter(c => c !== 'Tất cả').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="text" placeholder="Link ảnh minh họa (tùy chọn)" value={postFormData.imageUrl} onChange={(e) => setPostFormData(prev => ({...prev, imageUrl: e.target.value}))} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <textarea placeholder="Nội dung" value={postFormData.content} onChange={(e) => setPostFormData(prev => ({...prev, content: e.target.value}))} rows={5} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />

                    <div className="border-t dark:border-gray-700 pt-4">
                        <Button type="button" variant="secondary" onClick={togglePollCreator} className="w-full">
                            <Icons.Vote className="w-4 h-4 mr-2" />
                            {postFormData.poll ? "Hủy bình chọn" : "Thêm bình chọn"}
                        </Button>
                    </div>

                    <AnimatePresence>
                    {postFormData.poll && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                            <input type="text" placeholder="Câu hỏi bình chọn" value={postFormData.poll.question} onChange={handlePollQuestionChange} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                            {postFormData.poll.options.map((opt, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input type="text" placeholder={`Tùy chọn ${index + 1}`} value={opt.text} onChange={(e) => handlePollOptionChange(index, e.target.value)} className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removePollOption(index)} disabled={postFormData.poll!.options.length <= 2}>
                                        <Icons.X className="w-4 h-4 text-gray-500" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="ghost" onClick={addPollOption} className="text-sm">
                                <Icons.Plus className="w-4 h-4 mr-1" /> Thêm tùy chọn
                            </Button>
                        </motion.div>
                    )}
                    </AnimatePresence>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Hủy</Button>
                        <Button type="submit">{editingPost ? "Lưu thay đổi" : "Đăng bài"}</Button>
                    </div>
                </form>
            </Modal>
            
            {/* View Post Modal */}
            {selectedPost && (
                <Modal isOpen={isViewModalOpen} onClose={() => setViewModalOpen(false)} title={selectedPost.title} size="full">
                    <>
                        {selectedPost.imageUrl && <img src={selectedPost.imageUrl} alt={selectedPost.title} className="rounded-lg mb-4 w-full h-auto max-h-60 object-cover" />}
                        {postAuthor && (
                             <div className="flex items-center gap-3 mb-4">
                                <img src={postAuthor.avatar} alt={postAuthor.name} className="w-11 h-11 rounded-full" />
                                <div>
                                    <p className="font-semibold">{postAuthor.name}</p>
                                    <span
                                        className="mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                                        style={{ backgroundColor: ROLE_COLORS[postAuthor.role].primary }}
                                    >
                                        {postAuthor.role}
                                    </span>
                                </div>
                            </div>
                        )}
                        <p className="text-gray-600 dark:text-gray-400 mb-6 whitespace-pre-wrap">{selectedPost.content}</p>
                        
                        {selectedPost.poll && (() => {
                            const totalVotes = selectedPost.poll!.options.reduce((sum, opt) => sum + opt.votedBy.length, 0);
                            const userVote = selectedPost.poll!.options.find(opt => opt.votedBy.includes(currentUser.id));
                            return (
                                <div className="my-6 p-4 border rounded-lg dark:border-gray-700">
                                    <h4 className="font-bold mb-3">{selectedPost.poll!.question}</h4>
                                    <div className="space-y-2">
                                        {selectedPost.poll!.options.map(option => {
                                            const percentage = totalVotes > 0 ? (option.votedBy.length / totalVotes) * 100 : 0;
                                            const hasVotedForThis = userVote?.id === option.id;
                                            return (
                                                <div key={option.id}>
                                                    <button onClick={() => handlePollVote(selectedPost.id, option.id)} className="w-full text-left">
                                                        <div className={cn(
                                                            "p-2 rounded-md border transition-all",
                                                            userVote ? 'bg-transparent' : 'hover:bg-gray-100 dark:hover:bg-gray-800/50',
                                                            hasVotedForThis ? 'border-blue-500 ring-2 ring-blue-500/50' : 'dark:border-gray-700'
                                                        )}>
                                                            <div className="flex justify-between items-center text-sm font-semibold mb-1">
                                                                <span>{option.text}</span>
                                                                {userVote && <span>{percentage.toFixed(0)}%</span>}
                                                            </div>
                                                            {userVote && (
                                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                                    <motion.div
                                                                        className="bg-blue-500 h-2 rounded-full"
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${percentage}%` }}
                                                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3">{totalVotes} phiếu bầu</p>
                                </div>
                            );
                        })()}

                        <div className="flex items-center gap-2 my-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                            <Button variant="ghost" className="flex-1 group" onClick={() => handleVote(selectedPost.id, 'up')}>
                                <Icons.ArrowUpCircle className={cn("w-5 h-5 mr-2 group-hover:text-green-500 transition-colors", selectedPost.upvotedBy.includes(currentUser.id) && "text-green-500 fill-green-500/20")} /> Tán thành
                            </Button>
                            <span className="font-bold text-lg px-4">{selectedPost.upvotedBy.length - selectedPost.downvotedBy.length}</span>
                            <Button variant="ghost" className="flex-1 group" onClick={() => handleVote(selectedPost.id, 'down')}>
                                <Icons.ArrowDownCircle className={cn("w-5 h-5 mr-2 group-hover:text-red-500 transition-colors", selectedPost.downvotedBy.includes(currentUser.id) && "text-red-500 fill-red-500/20")} /> Phản đối
                            </Button>
                        </div>

                        <h4 className="font-semibold mb-4 border-t pt-4 dark:border-gray-700">Bình luận ({selectedPost.comments.length})</h4>
                        <div className="space-y-4 mb-6">
                            {selectedPost.comments.map(comment => {
                                const commentAuthor = users.find(u => u.id === comment.authorId);
                                return (
                                    <div key={comment.id} className="flex items-start gap-3 group">
                                        <img src={commentAuthor?.avatar} alt={commentAuthor?.name} className="w-8 h-8 rounded-full" />
                                        <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-3 w-full">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                                                    <p className="font-semibold text-sm">{commentAuthor?.name}</p>
                                                    {commentAuthor && (
                                                        <span
                                                            className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold text-white"
                                                            style={{ backgroundColor: ROLE_COLORS[commentAuthor.role].primary }}
                                                        >
                                                            {commentAuthor.role}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-500">{comment.timestamp}</span>
                                                </div>
                                                 <Button variant="ghost" size="icon" className="!w-7 !h-7 opacity-0 group-hover:opacity-100" onClick={() => setReportingContent({ type: 'comment', id: comment.id })}>
                                                    <Icons.Flag className="w-4 h-4 text-gray-500"/>
                                                </Button>
                                            </div>
                                            <p className="text-sm mt-1">{comment.content}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <form onSubmit={handleAddComment} className="flex items-center gap-2 border-t pt-4 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-slate-900 -mx-6 px-6 py-3">
                             <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full" />
                             <input
                                type="text"
                                placeholder="Viết bình luận..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Button type="submit" size="icon"><Icons.Send className="w-4 h-4"/></Button>
                        </form>
                    </>
                </Modal>
            )}

             {deletingPost && (
                <Modal isOpen={!!deletingPost} onClose={() => setDeletingPost(null)} title="Xác nhận xóa">
                    <p>Bạn có chắc chắn muốn xóa bài viết <span className="font-semibold">"{deletingPost.title}"</span>?</p>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="secondary" onClick={() => setDeletingPost(null)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>Xóa</Button>
                    </div>
                </Modal>
            )}

            {reportingContent && (
                <Modal isOpen={!!reportingContent} onClose={() => setReportingContent(null)} title="Báo cáo nội dung">
                    <form onSubmit={handleReportSubmit} className="space-y-4">
                        <p className="text-sm">Bạn đang báo cáo một {reportingContent.type === 'post' ? 'bài viết' : 'bình luận'}. Vui lòng chọn lý do:</p>
                        <select
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value as ReportReason)}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {REPORT_REASONS.map(reason => <option key={reason} value={reason}>{reason}</option>)}
                        </select>
                        {reportReason === 'Khác' && (
                            <textarea
                                placeholder="Vui lòng cung cấp thêm chi tiết..."
                                value={reportDetails}
                                onChange={(e) => setReportDetails(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        )}
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="secondary" onClick={() => setReportingContent(null)}>Hủy</Button>
                            <Button type="submit">Gửi báo cáo</Button>
                        </div>
                    </form>
                </Modal>
            )}

        </div>
    );
};

export default News;