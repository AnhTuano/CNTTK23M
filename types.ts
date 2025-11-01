
import { Icons } from './components/icons';

export enum Role {
  Admin = 'Admin',
  LopTruong = 'Lớp trưởng',
  LopPhoHocTap = 'Lớp phó học tập',
  LopPhoDoiSong = 'Lớp phó đời sống',
  BiThu = 'Bí thư',
  PhoBiThu = 'Phó bí thư',
  ThanhVien = 'Thành viên',
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Icons;
  color: string;
}

export interface User {
  id: number;
  name: string;
  avatar: string;
  coverImage: string;
  role: Role;
  bio: string;
  major: string;
  joinDate: string;
  birthday?: string;
  contact: {
    email: string;
    phone?: string;
  };
  socials: {
    facebook?: string;
    github?: string;
  };
  posts: number;
  documents: number;
  comments: number;
  points: number;
  badges: Badge[];
  locked: boolean;
  mustChangePassword?: boolean;
}

export interface PollOption {
  id: number;
  text: string;
  votedBy: number[];
}

export interface Poll {
  question: string;
  options: PollOption[];
}

export interface Post {
  id: number;
  authorId: number;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  upvotedBy: number[];
  downvotedBy: number[];
  timestamp: string;
  pinned: boolean;
  attachments?: { name: string; url: string }[];
  comments: Comment[];
  poll?: Poll;
}

export interface Comment {
    id: number;
    postId: number;
    authorId: number;
    content: string;
    timestamp: string;
}

export interface Document {
  id: number;
  title: string;
  uploaderId: number;
  subject: string;
  type: 'Bài giảng' | 'Đề' | 'Ghi chú' | 'Khác';
  link: string;
  timestamp: string;
  status: 'đã duyệt' | 'chờ duyệt';
}

export interface Memory {
    id: number;
    type: 'image';
    url: string;
    thumbnail: string;
    semester: string;
    uploaderId: number;
    reactions: Record<string, number>;
    status: 'đã duyệt' | 'chờ duyệt';
}

export interface ChatMessage {
  id: number;
  senderId: number;
  text: string;
  timestamp: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  icon: keyof typeof Icons;
  description: string;
  messages: ChatMessage[];
  allowedRoles?: Role[];
}

export interface Notification {
  id: number;
  type: 'post' | 'comment' | 'vote' | 'system';
  text: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export type ReportReason = 'Spam' | 'Nội dung không phù hợp' | 'Quấy rối' | 'Thông tin sai lệch' | 'Khác';

export interface Report {
  id: number;
  contentType: 'post' | 'comment' | 'document';
  contentId: number;
  reporterId: number;
  reason: ReportReason;
  details?: string;
  timestamp: string;
  status: 'pending' | 'resolved';
}

export interface BannerConfig {
  text: string;
  type: 'info' | 'warning' | 'critical';
  isActive: boolean;
}

export interface WebsiteConfig {
  className: string;
  slogan: string;
  coverImage: string;
  websiteName: string;
  websiteTitle: string;
  isMaintenanceMode: boolean;
  allowedPostRoles: Role[];
  banner: BannerConfig;
}
