
import React, { useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Icons } from '../components/icons';
import { ROLE_COLORS } from '../constants';
import { Post, Document, User, Memory, WebsiteConfig } from '../types';
import { cn } from '../lib/utils';
import { Skeleton } from '../components/ui/Skeleton';

interface DashboardProps {
    websiteConfig: WebsiteConfig;
    posts: Post[];
    documents: Document[];
    users: User[];
    memories: Memory[];
    isLoading: boolean;
}

const StatCard = React.memo<{ icon: React.ReactNode; title: string; value: string | number; color: string }>(({ icon, title, value, color }) => (
    <Card className="flex items-center gap-4">
        <div className={`p-3 rounded-full bg-gradient-to-br ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </Card>
));

const UpcomingBirthdaysCard: React.FC<{ users: User[] }> = ({ users }) => {
    const upcomingBirthdays = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of the day

        return users
            .filter(user => user.birthday)
            .map(user => {
                const [day, month] = user.birthday!.split('/').map(Number);
                let nextBirthday = new Date(today.getFullYear(), month - 1, day);

                if (nextBirthday < today) {
                    nextBirthday.setFullYear(today.getFullYear() + 1);
                }

                const diffTime = nextBirthday.getTime() - today.getTime();
                const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                return { ...user, daysUntil, birthdayDate: `${day}/${month}` };
            })
            .filter(user => user.daysUntil >= 0 && user.daysUntil <= 30)
            .sort((a, b) => a.daysUntil - b.daysUntil);
    }, [users]);

    return (
        <Card className="bg-gradient-to-r from-pink-400/20 to-purple-500/20">
            {upcomingBirthdays.length > 0 ? (
                <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2">
                    {upcomingBirthdays.map(user => (
                        <div key={user.id} className={cn(
                            'flex items-center gap-3 p-2 rounded-lg transition-colors',
                            user.daysUntil === 0 
                                ? 'bg-pink-500/20 dark:bg-pink-500/30 shadow-inner' 
                                : 'hover:bg-white/20 dark:hover:bg-black/20'
                        )}>
                            <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full" />
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{user.name}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-300">{user.birthdayDate}</p>
                            </div>
                            {user.daysUntil === 0 ? (
                                <span className="text-xs font-bold text-white bg-pink-500 px-2 py-1 rounded-full animate-pulse flex items-center gap-1">
                                    <Icons.Sparkles className="w-3 h-3 text-yellow-300" />
                                    Hôm nay! 🎉
                                </span>
                            ) : (
                                <span className="text-xs text-gray-600 dark:text-gray-300">còn {user.daysUntil} ngày</span>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-4">
                    <Icons.Cake className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Không có sinh nhật nào sắp tới.</p>
                </div>
            )}
        </Card>
    );
};

const DashboardSkeleton = () => (
    <div className="space-y-8">
        <Skeleton className="h-[250px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                 <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
            <div className="space-y-8">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ websiteConfig, posts, documents, users, memories, isLoading }) => {
    if (isLoading) {
        return <DashboardSkeleton />;
    }

    const latestPost = posts.find(p => p.pinned) || posts[0];
    const author = users.find(u => u.id === latestPost.authorId);
    const featuredDoc = documents[0];
    const uploader = users.find(u => u.id === featuredDoc.uploaderId);
    const topUser = [...users].sort((a,b) => b.points - a.points)[0];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="relative rounded-2xl overflow-hidden p-8 md:p-12 min-h-[250px] flex flex-col justify-end items-start text-white bg-cover bg-center" style={{ backgroundImage: `url('${websiteConfig.coverImage}')` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">{websiteConfig.className}</h1>
                    <p className="mt-2 text-lg md:text-xl opacity-90 drop-shadow-md">{websiteConfig.slogan}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Icons.User className="w-6 h-6 text-white"/>} title="Thành viên" value={users.length} color="from-blue-500 to-indigo-600" />
                <StatCard icon={<Icons.Newspaper className="w-6 h-6 text-white"/>} title="Bài đăng" value={posts.length} color="from-green-500 to-teal-600" />
                <StatCard icon={<Icons.Book className="w-6 h-6 text-white"/>} title="Tài liệu" value={documents.length} color="from-purple-500 to-pink-600" />
                <StatCard icon={<Icons.Camera className="w-6 h-6 text-white"/>} title="Kỷ niệm" value={memories.length} color="from-yellow-500 to-orange-600" />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Latest Announcement */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-semibold mb-4">Thông báo mới nhất</h2>
                    <Card>
                        {author && (
                            <div className="flex items-center gap-3 mb-4">
                                <img src={author.avatar} alt={author.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-semibold">{author.name}</p>
                                    <p className={`text-xs ${ROLE_COLORS[author.role].text}`}>{author.role}</p>
                                </div>
                            </div>
                        )}
                        <h3 className="text-xl font-bold text-blue-400 mb-2">{latestPost.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{latestPost.content}</p>
                        <span className="text-xs text-gray-400">{latestPost.timestamp}</span>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Tài liệu nổi bật</h2>
                        <Card>
                            <Icons.Book className="w-8 h-8 text-purple-400 mb-3"/>
                            <h4 className="font-semibold">{featuredDoc.title}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">bởi {uploader?.name}</p>
                        </Card>
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Icons.Cake className="w-6 h-6 text-pink-500" />Sinh nhật sắp tới</h2>
                        <UpcomingBirthdaysCard users={users} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Thành tích tuần</h2>
                        <Card className="flex items-center gap-4 bg-gradient-to-r from-yellow-400/20 to-orange-500/20">
                            <Icons.Trophy className="w-10 h-10 text-yellow-400"/>
                            <div>
                                <p className="font-bold text-lg">{topUser.name}</p>
                                <p className="text-sm text-yellow-500">{topUser.points} điểm</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
