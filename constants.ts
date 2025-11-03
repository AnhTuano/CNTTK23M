import { Role, User, Post, Document, Memory, Badge, ChatRoom, Notification, WebsiteConfig, Report, ReportReason } from './types';

export const ROLE_NAMES: Record<Role, string> = {
  [Role.Admin]: 'Quản trị viên',
  [Role.LopTruong]: 'Lớp trưởng',
  [Role.LopPhoHocTap]: 'Lớp phó học tập',
  [Role.LopPhoDoiSong]: 'Lớp phó đời sống',
  [Role.BiThu]: 'Bí thư',
  [Role.PhoBiThu]: 'Phó bí thư',
  [Role.UyVien]: 'Ủy viên',
  [Role.ThanhVien]: 'Thành viên',
};

export const ROLE_COLORS: Record<Role, { primary: string; text: string; border: string }> = {
  [Role.Admin]: { primary: '#FF3B30', text: 'text-red-500', border: 'border-red-500' },
  [Role.LopTruong]: { primary: '#FF9500', text: 'text-orange-500', border: 'border-orange-500' },
  [Role.LopPhoHocTap]: { primary: '#34C759', text: 'text-green-500', border: 'border-green-500' },
  [Role.LopPhoDoiSong]: { primary: '#AF52DE', text: 'text-purple-500', border: 'border-purple-500' },
  [Role.BiThu]: { primary: '#007AFF', text: 'text-blue-500', border: 'border-blue-500' },
  [Role.PhoBiThu]: { primary: '#FFD60A', text: 'text-yellow-500', border: 'border-yellow-500' },
  [Role.UyVien]: { primary: '#5AC8FA', text: 'text-cyan-500', border: 'border-cyan-500' },
  [Role.ThanhVien]: { primary: '#8E8E93', text: 'text-gray-500', border: 'border-gray-500' },
};

export const COMMITTEE_ROLES: Role[] = [
  Role.Admin,
  Role.LopTruong,
  Role.LopPhoHocTap,
  Role.LopPhoDoiSong,
  Role.BiThu,
  Role.PhoBiThu,
  Role.UyVien,
];

export const BADGES: Record<string, Badge> = {
  TOP_CONTRIBUTOR: { id: 'TOP_CONTRIBUTOR', name: 'Người đóng góp hàng đầu', description: 'Đạt điểm cao nhất trên bảng thành tích!', icon: 'Sparkles', color: 'text-yellow-400' },
  PROLIFIC_POSTER: { id: 'PROLIFIC_POSTER', name: 'Người đăng bài tích cực', description: 'Đã đăng hơn 10 thông báo.', icon: 'Newspaper', color: 'text-blue-400' },
  LIBRARIAN: { id: 'LIBRARIAN', name: 'Thủ thư', description: 'Đã chia sẻ hơn 10 tài liệu.', icon: 'BookOpenCheck', color: 'text-green-400' },
  COMMUNICATOR: { id: 'COMMUNICATOR', name: 'Người giao tiếp', description: 'Đã viết hơn 50 bình luận.', icon: 'MessageCircleMore', color: 'text-purple-400' },
  FIRST_POST: { id: 'FIRST_POST', name: 'Người tiên phong', description: 'Đã tạo bài đăng đầu tiên.', icon: 'Award', color: 'text-orange-400' },
};

export const REPORT_REASONS: ReportReason[] = ['Spam', 'Nội dung không phù hợp', 'Quấy rối', 'Thông tin sai lệch', 'Khác'];

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
