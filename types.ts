import { Icons } from './components/icons';

export enum Role {
  Admin = 'Admin',
  LopTruong = 'LopTruong',
  LopPhoHocTap = 'LopPhoHocTap',
  LopPhoDoiSong = 'LopPhoDoiSong',
  BiThu = 'BiThu',
  PhoBiThu = 'PhoBiThu',
  UyVien = 'UyVien',
  ThanhVien = 'ThanhVien',
}

export type BadgeCategory = 'all' | 'posts' | 'documents' | 'comments';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Icons;
  color: string;
  requiredPoints?: number;
  category?: BadgeCategory;
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
  // Backend fields
  email?: string;
  phone?: string;
  facebookUrl?: string;
  githubUrl?: string;
  // Legacy mock fields (optional for backward compatibility)
  contact?: {
    email: string;
    phone?: string;
  };
  socials?: {
    facebook?: string;
    github?: string;
  };
  posts: number;
  documents: number;
  comments: number;
  points: number;
  badges?: Badge[];
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
  status: 'DaDuyet' | 'ChoDuyet' | 'đã duyệt' | 'chờ duyệt'; // Support both backend enum and frontend display
}

export interface Memory {
    id: number;
    type: 'image';
    url: string;
    thumbnail: string;
    semester: string;
    uploaderId: number;
    reactions: Record<string, number>;
    status: 'DaDuyet' | 'ChoDuyet' | 'đã duyệt' | 'chờ duyệt'; // Support both backend enum and frontend display
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
  members?: number[];
}

export interface Notification {
  id: number;
  userId: number;
  type: 'post' | 'comment' | 'vote' | 'system' | 'document' | 'memory';
  title: string;
  text: string;
  read: boolean;
  createdAt: string;
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
  id?: number;
  className: string;
  slogan: string;
  coverImage: string;
  websiteName: string;
  websiteTitle: string;
  isMaintenanceMode: boolean;
  allowedPostRoles?: Role[];
  postCategories?: string[];
  bannerText: string;
  bannerType: 'Info' | 'Warning' | 'Critical';
  bannerIsActive: boolean;
  updatedAt?: Date | string;
}