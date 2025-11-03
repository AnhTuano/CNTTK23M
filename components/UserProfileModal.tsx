import React from 'react';
import { Modal } from './ui/Modal';
import { User, Role } from '../types';
import { ROLE_COLORS, ROLE_NAMES } from '../constants';
import { Icons } from './icons';
import { Card } from './ui/Card';

interface UserProfileModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, isOpen, onClose }) => {
    if (!user) return null;

    const roleColor = ROLE_COLORS[user.role as Role]?.primary || '#8E8E93';
    const roleName = ROLE_NAMES[user.role as Role] || user.role;
    const userBadges = user.badges || [];
    const email = user.email || user.contact?.email;
    const phone = user.phone || user.contact?.phone;
    const facebookUrl = user.facebookUrl || user.socials?.facebook;
    const githubUrl = user.githubUrl || user.socials?.github;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="">
            <div className="space-y-3 pb-3">
                <div className="relative -mt-2 sm:-mt-6 -mx-2 sm:-mx-4">
                    <div 
                        className="h-20 sm:h-24 bg-gradient-to-r from-blue-500 to-purple-600"
                        style={{ 
                            backgroundImage: user.coverImage ? `url(${user.coverImage})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    />
                    <div className="absolute -bottom-8 left-4">
                        <img 
                            src={user.avatar} 
                            alt={user.name}
                            className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-900 shadow-lg"
                        />
                    </div>
                </div>

                <div className="pt-10 px-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                                {user.name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: roleColor }}>
                                    {roleName}
                                </span>
                                {user.locked && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                         Đã khóa
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {user.points}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">điểm</div>
                        </div>
                    </div>

                    {user.bio ? (
                        <div className="mt-3">
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                Giới thiệu
                            </h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                                {user.bio}
                            </p>
                        </div>
                    ) : (
                        <div className="mt-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center italic">
                                 Chưa có giới thiệu
                            </p>
                        </div>
                    )}

                    <div className="mt-3">
                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                            Thông tin & Liên hệ
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {user.major && (
                                <div className="flex items-center gap-2 text-sm min-w-0">
                                    <Icons.Book className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-600 dark:text-gray-400 truncate">{user.major}</span>
                                </div>
                            )}
                            {user.joinDate && (
                                <div className="flex items-center gap-2 text-sm min-w-0">
                                    <Icons.CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-600 dark:text-gray-400 truncate">
                                        Tham gia {new Date(user.joinDate).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            )}
                            {user.birthday && (
                                <div className="flex items-center gap-2 text-sm min-w-0">
                                    <Icons.Cake className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-600 dark:text-gray-400 truncate">
                                        {new Date(user.birthday).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            )}
                            {email && (
                                <div className="flex items-center gap-2 text-sm min-w-0">
                                    <Icons.Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-600 dark:text-gray-400 truncate">{email}</span>
                                </div>
                            )}
                            {phone && (
                                <div className="flex items-center gap-2 text-sm min-w-0">
                                    <Icons.Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-600 dark:text-gray-400 truncate">{phone}</span>
                                </div>
                            )}
                            {facebookUrl && (
                                <div className="flex items-center gap-2 text-sm min-w-0">
                                    <Icons.Facebook className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate">
                                        Facebook
                                    </a>
                                </div>
                            )}
                            {githubUrl && (
                                <div className="flex items-center gap-2 text-sm min-w-0">
                                    <Icons.Github className="w-4 h-4 text-gray-900 dark:text-gray-100 flex-shrink-0" />
                                    <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-900 dark:text-gray-100 hover:underline truncate">
                                        GitHub
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <Card>
                    <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                         Thống kê hoạt động
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{user.posts}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Bài viết</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">{user.documents}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Tài liệu</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{user.comments}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Bình luận</div>
                        </div>
                    </div>
                </Card>

                {userBadges.length > 0 ? (
                    <Card>
                        <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
                             Danh hiệu ({userBadges.length})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                            {userBadges.map((badge, index) => {
                                const BadgeIcon = Icons[badge.icon as keyof typeof Icons] || Icons.Award;
                                return (
                                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${badge.color}20` }}>
                                            <BadgeIcon className="w-4 h-4" style={{ color: badge.color }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-xs text-gray-900 dark:text-gray-100 truncate">{badge.name}</div>
                                            <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{badge.description}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                ) : (
                    <Card>
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                            <Icons.Award className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Chưa có danh hiệu nào</p>
                        </div>
                    </Card>
                )}
            </div>
        </Modal>
    );
};
