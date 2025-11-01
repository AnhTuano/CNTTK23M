
import React, { useState, useMemo, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/icons';
import { ROLE_COLORS } from '../constants';
import { cn } from '../lib/utils';
import { Badge as BadgeType, User, Post, Document as Doc } from '../types';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../hooks/useToast';
import { EmptyState } from '../components/ui/EmptyState';

interface ProfileProps {
    user: User;
    updateUser: (user: User) => void;
    posts: Post[];
    documents: Doc[];
    setActivePage: (page: any) => void;
}

const BadgeIcon = React.memo<{badge: BadgeType}>(({badge}) => {
    const IconComponent = Icons[badge.icon];
    return (
        <div className="group relative flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
                {IconComponent && <IconComponent className={cn('w-7 h-7', badge.color)} />}
            </div>
            <div className="absolute bottom-full mb-2 w-max max-w-xs text-center z-10 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <p className="font-bold">{badge.name}</p>
                <p>{badge.description}</p>
                <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
            </div>
        </div>
    )
});

const InfoItem = React.memo<{ icon: keyof typeof Icons, label: string, value?: string, href?: string }>(({ icon, label, value, href }) => {
    if (!value) return null;
    const IconComponent = Icons[icon];
    const content = <div className="flex items-center gap-3">
        <IconComponent className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-semibold text-sm">{value}</p>
        </div>
    </div>;

    if (href) {
        return <a href={href} target="_blank" rel="noopener noreferrer" className="block p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50">{content}</a>;
    }
    return <div className="p-2">{content}</div>;
});

const fileToDataUri = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        resolve(event.target?.result as string)
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
})

const Profile: React.FC<ProfileProps> = ({ user, updateUser, posts, documents, setActivePage }) => {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<'posts' | 'documents' | 'comments'>('posts');
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [formData, setFormData] = useState<User>(user);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const userRoleColor = ROLE_COLORS[user.role];
    const userPosts = useMemo(() => posts.filter(p => p.authorId === user.id), [user.id, posts]);
    const userDocs = useMemo(() => documents.filter(d => d.uploaderId === user.id), [user.id, documents]);
    const userComments = useMemo(() => posts.flatMap(p => 
        p.comments
         .filter(c => c.authorId === user.id)
         .map(c => ({ ...c, postTitle: p.title }))
    ), [user.id, posts]);

    const handleOpenEditModal = () => {
        setFormData(user);
        setEditModalOpen(true);
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser(formData);
        setEditModalOpen(false);
        addToast({ title: 'Thành công!', message: 'Hồ sơ đã được cập nhật.', type: 'success' });
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parentKey, childKey] = name.split('.') as [keyof User, string];
            const parentValue = formData[parentKey];
            if (typeof parentValue === 'object' && parentValue !== null) {
                setFormData(prev => ({
                    ...prev,
                    [parentKey]: {
                        ...parentValue,
                        [childKey]: value
                    }
                }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'coverImage') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            addToast({ title: 'Lỗi', message: 'Kích thước tệp không được vượt quá 2MB.', type: 'error' });
            return;
        }

        try {
            const dataUri = await fileToDataUri(file);
            setFormData(prev => ({ ...prev, [field]: dataUri }));
        } catch (error) {
            addToast({ title: 'Lỗi', message: 'Không thể đọc tệp hình ảnh.', type: 'error' });
        }
    };


    return (
        <div className="space-y-6">
            <Card className="p-0 overflow-hidden">
                <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url('${user.coverImage}')` }}>
                    <div className="absolute inset-0 bg-black/30"></div>
                </div>
                <div className="p-6 pt-0">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-20 relative z-10">
                         <img src={user.avatar} alt={user.name} className={cn("w-32 h-32 rounded-full border-4 shadow-lg", userRoleColor.border.replace('border-', 'border-'))} style={{borderColor: userRoleColor.primary}}/>
                        <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left">
                            <h1 className="text-2xl font-bold">{user.name}</h1>
                            <span
                                className="mt-2 inline-block px-3 py-1 text-sm font-semibold text-white rounded-full"
                                style={{ backgroundColor: userRoleColor.primary, boxShadow: `0 4px 14px 0 ${userRoleColor.primary}70` }}
                            >
                                {user.role}
                            </span>
                        </div>
                        <Button className="mt-4 sm:mt-0 sm:ml-auto" onClick={handleOpenEditModal}>
                            <Icons.Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa hồ sơ
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <h2 className="text-lg font-semibold mb-2">Giới thiệu</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-4">"{user.bio}"</p>
                        <div className="space-y-1">
                            <InfoItem icon="Building2" label="Chuyên ngành" value={user.major} />
                            <InfoItem icon="Cake" label="Ngày sinh" value={user.birthday} />
                            <InfoItem icon="CalendarDays" label="Ngày tham gia" value={user.joinDate} />
                        </div>
                    </Card>
                    <Card>
                        <h2 className="text-lg font-semibold mb-2">Liên hệ & Mạng xã hội</h2>
                         <div className="space-y-1">
                            <InfoItem icon="Mail" label="Email" value={user.contact.email} href={`mailto:${user.contact.email}`} />
                            <InfoItem icon="Phone" label="Số điện thoại" value={user.contact.phone} href={`tel:${user.contact.phone}`} />
                            <InfoItem icon="Facebook" label="Facebook" value={user.socials.facebook ? user.name : undefined} href={user.socials.facebook} />
                            <InfoItem icon="Github" label="GitHub" value={user.socials.github ? user.socials.github.replace('https://','') : undefined} href={user.socials.github} />
                        </div>
                    </Card>
                    <Card>
                         <h2 className="text-lg font-semibold mb-4">Thống kê</h2>
                         <div className="grid grid-cols-2 gap-4 text-center">
                            <div><p className="text-2xl font-bold">{userPosts.length}</p><p className="text-xs text-gray-500">Bài đăng</p></div>
                            <div><p className="text-2xl font-bold">{userDocs.length}</p><p className="text-xs text-gray-500">Tài liệu</p></div>
                            <div><p className="text-2xl font-bold">{userComments.length}</p><p className="text-xs text-gray-500">Bình luận</p></div>
                            <div><p className="text-2xl font-bold">{user.points}</p><p className="text-xs text-gray-500">Điểm</p></div>
                         </div>
                    </Card>
                    <Card>
                         <h2 className="text-lg font-semibold mb-4">Danh hiệu</h2>
                        <div className="flex flex-wrap gap-4 justify-center">
                            {user.badges.length > 0 ? user.badges.map(badge => (
                                <BadgeIcon key={badge.id} badge={badge} />
                            )) : <p className="text-sm text-gray-500 text-center w-full">Chưa có danh hiệu.</p>}
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <button onClick={() => setActiveTab('posts')} className={cn('py-3 px-1 border-b-2 font-medium text-sm', activeTab === 'posts' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600')}>
                                    Bài đăng ({userPosts.length})
                                </button>
                                <button onClick={() => setActiveTab('documents')} className={cn('py-3 px-1 border-b-2 font-medium text-sm', activeTab === 'documents' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600')}>
                                    Tài liệu ({userDocs.length})
                                </button>
                                 <button onClick={() => setActiveTab('comments')} className={cn('py-3 px-1 border-b-2 font-medium text-sm', activeTab === 'comments' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600')}>
                                    Bình luận ({userComments.length})
                                </button>
                            </nav>
                        </div>
                        <div className="mt-6 space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {activeTab === 'posts' && (userPosts.length > 0 ? userPosts.map(post => (
                                <div key={post.id} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
                                    <p className="font-semibold text-sm">{post.title}</p>
                                    <p className="text-xs text-gray-500">Trong mục "{post.category}" • {post.timestamp}</p>
                                </div>
                            )) : <EmptyState icon="Newspaper" title="Chưa có bài đăng nào" message="Hãy chia sẻ điều gì đó thú vị với cả lớp nhé!" action={{ text: 'Tạo bài đăng mới', onClick: () => setActivePage('Tin tức') }} />)}
                             {activeTab === 'documents' && (userDocs.length > 0 ? userDocs.map(doc => (
                                <div key={doc.id} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
                                    <p className="font-semibold text-sm">{doc.title}</p>
                                    <p className="text-xs text-gray-500">Môn "{doc.subject}" • {doc.timestamp}</p>
                                </div>
                            )) : <EmptyState icon="Book" title="Chưa có tài liệu nào" message="Chia sẻ tài liệu học tập hữu ích cho bạn bè." action={{ text: 'Chia sẻ tài liệu', onClick: () => setActivePage('Tài liệu') }} />)}
                            {activeTab === 'comments' && (userComments.length > 0 ? userComments.map(comment => (
                                <div key={comment.id} className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
                                    <p className="text-sm italic">"{comment.content}"</p>
                                    <p className="text-xs text-gray-500 mt-1">Trong bài viết "{comment.postTitle}" • {comment.timestamp}</p>
                                </div>
                            )) : <EmptyState icon="MessageSquare" title="Chưa có bình luận nào" message="Tham gia thảo luận trong các bài viết để nhận điểm tích cực." action={{ text: 'Khám phá tin tức', onClick: () => setActivePage('Tin tức') }} />)}
                        </div>
                    </Card>
                </div>
            </div>

            <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Chỉnh sửa hồ sơ">
                <form onSubmit={handleSaveProfile} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                        <div>
                            <label className="block text-sm font-medium mb-1">Ảnh đại diện</label>
                            <div className="relative group w-24 h-24">
                                <img src={formData.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Icons.Upload className="w-6 h-6" />
                                </button>
                                <input
                                    type="file"
                                    ref={avatarInputRef}
                                    onChange={(e) => handleFileChange(e, 'avatar')}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/gif"
                                />
                            </div>
                        </div>
                        <div className="w-full">
                            <label className="block text-sm font-medium mb-1">Ảnh bìa</label>
                            <div className="relative group w-full h-24">
                                <img src={formData.coverImage} alt="Cover" className="w-full h-24 rounded-lg object-cover" />
                                <button
                                    type="button"
                                    onClick={() => coverInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Icons.Upload className="w-6 h-6" />
                                </button>
                                <input
                                    type="file"
                                    ref={coverInputRef}
                                    onChange={(e) => handleFileChange(e, 'coverImage')}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/gif"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tên đầy đủ</label>
                        <input name="name" value={formData.name} onChange={handleFormChange} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Giới thiệu</label>
                        <textarea name="bio" value={formData.bio} onChange={handleFormChange} rows={3} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium mb-1">Chuyên ngành</label>
                            <input name="major" value={formData.major} onChange={handleFormChange} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                            <input name="birthday" value={formData.birthday || ''} onChange={handleFormChange} placeholder="DD/MM/YYYY" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input name="contact.email" value={formData.contact.email} onChange={handleFormChange} type="email" className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                            <input name="contact.phone" value={formData.contact.phone || ''} onChange={handleFormChange} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Link Facebook</label>
                            <input name="socials.facebook" value={formData.socials.facebook || ''} onChange={handleFormChange} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Link GitHub</label>
                            <input name="socials.github" value={formData.socials.github || ''} onChange={handleFormChange} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                     <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                        <Button type="button" variant="secondary" onClick={() => setEditModalOpen(false)}>Hủy</Button>
                        <Button type="submit">Lưu thay đổi</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Profile;
