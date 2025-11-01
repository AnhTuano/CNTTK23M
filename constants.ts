import { Role, User, Post, Document, Memory, Badge, ChatRoom, Notification, WebsiteConfig, Report, ReportReason } from './types';

export const ROLE_COLORS: Record<Role, { primary: string; text: string; border: string }> = {
  [Role.Admin]: { primary: '#FF3B30', text: 'text-red-500', border: 'border-red-500' },
  [Role.LopTruong]: { primary: '#FF9500', text: 'text-orange-500', border: 'border-orange-500' },
  [Role.LopPhoHocTap]: { primary: '#34C759', text: 'text-green-500', border: 'border-green-500' },
  [Role.LopPhoDoiSong]: { primary: '#AF52DE', text: 'text-purple-500', border: 'border-purple-500' },
  [Role.BiThu]: { primary: '#007AFF', text: 'text-blue-500', border: 'border-blue-500' },
  [Role.PhoBiThu]: { primary: '#FFD60A', text: 'text-yellow-500', border: 'border-yellow-500' },
  [Role.ThanhVien]: { primary: '#8E8E93', text: 'text-gray-500', border: 'border-gray-500' },
};

export const COMMITTEE_ROLES: Role[] = [
  Role.Admin,
  Role.LopTruong,
  Role.LopPhoHocTap,
  Role.LopPhoDoiSong,
  Role.BiThu,
  Role.PhoBiThu,
];

export const BADGES: Record<string, Badge> = {
  TOP_CONTRIBUTOR: { id: 'TOP_CONTRIBUTOR', name: 'Người đóng góp hàng đầu', description: 'Đạt điểm cao nhất trên bảng thành tích!', icon: 'Sparkles', color: 'text-yellow-400' },
  PROLIFIC_POSTER: { id: 'PROLIFIC_POSTER', name: 'Người đăng bài tích cực', description: 'Đã đăng hơn 10 thông báo.', icon: 'Newspaper', color: 'text-blue-400' },
  LIBRARIAN: { id: 'LIBRARIAN', name: 'Thủ thư', description: 'Đã chia sẻ hơn 10 tài liệu.', icon: 'BookOpenCheck', color: 'text-green-400' },
  COMMUNICATOR: { id: 'COMMUNICATOR', name: 'Người giao tiếp', description: 'Đã viết hơn 50 bình luận.', icon: 'MessageCircleMore', color: 'text-purple-400' },
  FIRST_POST: { id: 'FIRST_POST', name: 'Người tiên phong', description: 'Đã tạo bài đăng đầu tiên.', icon: 'Award', color: 'text-orange-400' },
};

export const MOCK_USERS: User[] = [
  { id: 1, name: 'Nguyễn Văn An', avatar: 'https://picsum.photos/seed/user1/100', coverImage: 'https://picsum.photos/seed/cover1/1000/300', role: Role.Admin, bio: '"Work hard, play harder. Rất vui được làm quen với mọi người!"', major: 'Công nghệ Phần mềm', joinDate: '15/08/2021', birthday: '20/10/2003', contact: { email: 'an.nv@example.com', phone: '0123 456 789' }, socials: { github: 'https://github.com/example', facebook: 'https://facebook.com/example' }, posts: 15, documents: 10, comments: 50, points: 1250, badges: [BADGES.TOP_CONTRIBUTOR, BADGES.PROLIFIC_POSTER, BADGES.COMMUNICATOR], locked: false, mustChangePassword: false },
  { id: 2, name: 'Trần Thị Bình', avatar: 'https://picsum.photos/seed/user2/100', coverImage: 'https://picsum.photos/seed/cover2/1000/300', role: Role.LopTruong, bio: 'Luôn cố gắng vì một tập thể vững mạnh.', major: 'Hệ thống Thông tin', joinDate: '15/08/2021', birthday: '15/05/2003', contact: { email: 'binh.tt@example.com' }, socials: { facebook: 'https://facebook.com/example' }, posts: 12, documents: 5, comments: 40, points: 1100, badges: [BADGES.PROLIFIC_POSTER, BADGES.FIRST_POST], locked: false, mustChangePassword: false },
  { id: 3, name: 'Lê Văn Cường', avatar: 'https://picsum.photos/seed/user3/100', coverImage: 'https://picsum.photos/seed/cover3/1000/300', role: Role.LopPhoHocTap, bio: 'Chia sẻ kiến thức là niềm vui.', major: 'Khoa học Máy tính', joinDate: '16/08/2021', birthday: '11/12/2003', contact: { email: 'cuong.lv@example.com', phone: '0123 456 788' }, socials: { github: 'https://github.com/example', facebook: 'https://facebook.com/example' }, posts: 5, documents: 25, comments: 30, points: 1050, badges: [BADGES.LIBRARIAN], locked: false, mustChangePassword: false },
  { id: 4, name: 'Phạm Thị Dung', avatar: 'https://picsum.photos/seed/user4/100', coverImage: 'https://picsum.photos/seed/cover4/1000/300', role: Role.BiThu, bio: 'Nhiệt huyết, năng động, sáng tạo.', major: 'Công nghệ Phần mềm', joinDate: '20/08/2021', birthday: '25/03/2003', contact: { email: 'dung.pt@example.com' }, socials: { facebook: 'https://facebook.com/example' }, posts: 10, documents: 2, comments: 25, points: 900, badges: [BADGES.FIRST_POST], locked: false, mustChangePassword: false },
  { id: 5, name: 'Hoàng Văn Em', avatar: 'https://picsum.photos/seed/user5/100', coverImage: 'https://picsum.photos/seed/cover5/1000/300', role: Role.ThanhVien, bio: 'Thích học hỏi và khám phá những điều mới.', major: 'An toàn Thông tin', joinDate: '01/09/2021', birthday: '01/01/2003', contact: { email: 'em.hv@example.com' }, socials: {}, posts: 2, documents: 8, comments: 60, points: 850, badges: [BADGES.COMMUNICATOR], locked: true, mustChangePassword: false },
  { id: 6, name: 'Vũ Thị Giang', avatar: 'https://picsum.photos/seed/user6/100', coverImage: 'https://picsum.photos/seed/cover6/1000/300', role: Role.ThanhVien, bio: 'Một thành viên tích cực của lớp.', major: 'Hệ thống Thông tin', joinDate: '02/09/2021', birthday: '30/07/2003', contact: { email: 'giang.vt@example.com' }, socials: { facebook: 'https://facebook.com/example' }, posts: 3, documents: 5, comments: 20, points: 500, badges: [], locked: false, mustChangePassword: false },
  { id: 7, name: 'Đỗ Văn Hùng', avatar: 'https://picsum.photos/seed/user7/100', coverImage: 'https://picsum.photos/seed/cover7/1000/300', role: Role.PhoBiThu, bio: 'Luôn sẵn sàng hỗ trợ các hoạt động của lớp.', major: 'Khoa học Máy tính', joinDate: '15/08/2021', birthday: '12/02/2003', contact: { email: 'hung.dv@example.com' }, socials: {}, posts: 8, documents: 3, comments: 15, points: 720, badges: [], locked: false, mustChangePassword: false },
  { id: 8, name: 'Ngô Thị Yến', avatar: 'https://picsum.photos/seed/user8/100', coverImage: 'https://picsum.photos/seed/cover8/1000/300', role: Role.LopPhoDoiSong, bio: 'Gắn kết mọi người là sứ mệnh của mình.', major: 'Công nghệ Phần mềm', joinDate: '18/08/2021', birthday: '19/09/2003', contact: { email: 'yen.nt@example.com' }, socials: { facebook: 'https://facebook.com/example' }, posts: 7, documents: 1, comments: 22, points: 680, badges: [], locked: false, mustChangePassword: false },
];

export const MOCK_POSTS: Post[] = [
  { 
    id: 1, 
    authorId: 2, 
    title: 'Thông báo lịch thi cuối kỳ', 
    content: 'Lịch thi cuối kỳ đã được cập nhật trên trang web của trường. Các bạn chú ý theo dõi để không bỏ lỡ nhé. Chúc cả lớp thi tốt!', 
    imageUrl: 'https://picsum.photos/seed/post1/800/400', 
    upvotedBy: [1, 3, 4, 5, 6, 7, 8], 
    downvotedBy: [], 
    timestamp: '2 giờ trước', 
    pinned: true, 
    category: 'Học tập',
    comments: [
        { id: 1, postId: 1, authorId: 5, content: 'Cảm ơn lớp trưởng nhiều!', timestamp: '1 giờ trước' },
        { id: 2, postId: 1, authorId: 6, content: 'Tuyệt vời!', timestamp: '30 phút trước' },
        { id: 3, postId: 1, authorId: 1, content: 'Mọi người nhớ xem kỹ lịch thi nhé!', timestamp: '25 phút trước' },
    ],
    poll: {
      question: 'Mọi người đã sẵn sàng cho kỳ thi chưa?',
      options: [
        { id: 1, text: 'Sẵn sàng 100%!', votedBy: [1, 3, 8] },
        { id: 2, text: 'Vẫn đang cày cuốc', votedBy: [4, 5, 6] },
        { id: 3, text: 'Cần thêm thời gian', votedBy: [2, 7] },
      ]
    }
  },
  { id: 2, authorId: 4, title: 'Hoạt động tình nguyện Mùa Hè Xanh', content: 'Đoàn trường tổ chức chương trình Mùa Hè Xanh 2024. Các bạn đăng ký tham gia tại văn phòng Đoàn nhé. Đây là cơ hội để cống hiến và trải nghiệm.', imageUrl: 'https://picsum.photos/seed/post2/800/400', upvotedBy: [1, 2, 5, 7], downvotedBy: [3], timestamp: '1 ngày trước', pinned: false, category: 'Hoạt động',
    comments: [
        { id: 4, postId: 2, authorId: 7, content: 'Mình sẽ tham gia!', timestamp: '10 giờ trước' },
        { id: 5, postId: 2, authorId: 1, content: 'Hoan nghênh tinh thần của bạn!', timestamp: '9 giờ trước' },
    ]
  },
  { id: 3, authorId: 1, title: 'Cập nhật nội quy diễn đàn lớp', content: 'Admin đã cập nhật một số quy định mới về việc đăng bài và bình luận. Mọi người vui lòng đọc kỹ để tránh vi phạm. Cảm ơn sự hợp tác của các bạn.', upvotedBy: [2, 3, 4, 5], downvotedBy: [], timestamp: '3 ngày trước', pinned: false, category: 'Thông báo chung',
    comments: [
        { id: 6, postId: 3, authorId: 8, content: 'Đã đọc và nắm rõ. Cảm ơn admin.', timestamp: '2 ngày trước' }
    ]
  },
  { id: 4, authorId: 3, title: 'Tài liệu ôn tập môn Mạng Máy Tính', content: 'Mình đã tổng hợp một số tài liệu ôn tập quan trọng cho môn Mạng Máy Tính. Các bạn có thể truy cập trong mục Tài liệu của lớp nhé.', upvotedBy: [1, 2, 4, 5, 6], downvotedBy: [], timestamp: '5 ngày trước', pinned: false, category: 'Học tập',
    comments: [
      { id: 7, postId: 4, authorId: 6, content: 'Tài liệu rất hữu ích, cảm ơn Cường nhiều!', timestamp: '4 ngày trước' },
      { id: 8, postId: 4, authorId: 5, content: 'Đúng thứ mình đang cần!', timestamp: '4 ngày trước' },
    ]
  },
];

export const MOCK_DOCUMENTS: Document[] = [
  { id: 1, title: 'Slide bài giảng Mạng Máy Tính - Chương 1', uploaderId: 3, subject: 'Mạng Máy Tính', type: 'Bài giảng', link: '#', timestamp: '1 tuần trước', status: 'đã duyệt' },
  { id: 2, title: 'Tổng hợp đề thi Lập Trình Web', uploaderId: 5, subject: 'Lập Trình Web', type: 'Đề', link: '#', timestamp: '2 tuần trước', status: 'đã duyệt' },
  { id: 3, title: 'Ghi chú quan trọng môn Cơ Sở Dữ Liệu', uploaderId: 6, subject: 'Cơ Sở Dữ Liệu', type: 'Ghi chú', link: '#', timestamp: '3 ngày trước', status: 'đã duyệt' },
  { id: 4, title: 'Slide Trí Tuệ Nhân Tạo', uploaderId: 3, subject: 'Trí Tuệ Nhân Tạo', type: 'Bài giảng', link: '#', timestamp: '1 tháng trước', status: 'đã duyệt' },
  { id: 5, title: 'Đề cương ôn tập Triết học Mác-Lênin', uploaderId: 5, subject: 'Triết học', type: 'Đề', link: '#', timestamp: '1 giờ trước', status: 'chờ duyệt' },
  { id: 6, title: 'Ghi chú nhanh buổi học chiều nay', uploaderId: 2, subject: 'Lập Trình Web', type: 'Ghi chú', link: '#', timestamp: '2 giờ trước', status: 'chờ duyệt' },
];

export const MOCK_MEMORIES: Memory[] = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    type: 'image',
    url: `https://picsum.photos/seed/memory${i}/800/600`,
    thumbnail: `https://picsum.photos/seed/memory${i}/400/300`,
    semester: `Học kỳ ${i % 4 + 1} - Năm 2`,
    uploaderId: MOCK_USERS[i % MOCK_USERS.length].id,
    reactions: { '❤️': Math.floor(Math.random() * 50), '😆': Math.floor(Math.random() * 30), '😢': Math.floor(Math.random() * 5) },
    status: i < 12 ? 'đã duyệt' : 'chờ duyệt',
}));

export const MOCK_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 'general',
    name: 'Cả lớp',
    icon: 'Users',
    description: 'Kênh chat chung cho toàn bộ lớp',
    messages: [
      { id: 101, senderId: 2, text: 'Thông báo: Thứ 2 tuần sau lớp mình nghỉ học nhé.', timestamp: '10:00 AM' },
      { id: 102, senderId: 5, text: 'Wow, tin vui quá!', timestamp: '10:01 AM' },
      { id: 103, senderId: 6, text: 'Cảm ơn lớp trưởng đã thông báo ạ.', timestamp: '10:02 AM' },
    ],
  },
  {
    id: 'committee',
    name: 'Ban Cán Sự',
    icon: 'Shield',
    description: 'Kênh riêng cho Ban Cán Sự',
    allowedRoles: COMMITTEE_ROLES,
    messages: [
      { id: 201, senderId: 2, text: 'Chào mọi người, chúng ta cần họp gấp về kế hoạch cho sự kiện sắp tới.', timestamp: '09:00 AM' },
      { id: 202, senderId: 1, text: 'Chào lớp trưởng, mình sẵn sàng. Mấy giờ và ở đâu vậy?', timestamp: '09:01 AM' },
      { id: 203, senderId: 4, text: 'Mình cũng tham gia.', timestamp: '09:02 AM' },
      { id: 204, senderId: 2, text: 'Chúng ta họp online qua Google Meet lúc 8h tối nay nhé. Link mình sẽ gửi sau.', timestamp: '09:03 AM' },
      { id: 205, senderId: 3, text: 'Ok, mình sẽ chuẩn bị phần báo cáo tài liệu học tập.', timestamp: '09:05 AM' },
    ],
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, type: 'post', text: 'Trần Thị Bình đã đăng một bài viết mới: "Thông báo lịch thi cuối kỳ".', timestamp: '2 giờ trước', read: false },
  { id: 2, type: 'comment', text: 'Hoàng Văn Em đã bình luận về bài viết "Thông báo lịch thi cuối kỳ".', timestamp: '1 giờ trước', read: false },
  { id: 3, type: 'vote', text: 'Lê Văn Cường đã upvote bài viết "Hoạt động tình nguyện Mùa Hè Xanh".', timestamp: '5 giờ trước', read: false },
  { id: 4, type: 'system', text: 'Chào mừng bạn đến với ClassZone! Hãy khám phá các tính năng nhé.', timestamp: '1 ngày trước', read: true },
  { id: 5, type: 'comment', text: 'Vũ Thị Giang đã bình luận về bài viết "Thông báo lịch thi cuối kỳ".', timestamp: '30 phút trước', read: true },
];

export const REPORT_REASONS: ReportReason[] = ['Spam', 'Nội dung không phù hợp', 'Quấy rối', 'Thông tin sai lệch', 'Khác'];

export const MOCK_REPORTS: Report[] = [];

export const MOCK_WEBSITE_CONFIG: WebsiteConfig = {
  className: "Lớp CNTT K20",
  slogan: '"Cùng nhau học, cùng nhau lớn"',
  coverImage: "https://picsum.photos/seed/classbg/1200/400",
  websiteName: "ClassZone",
  websiteTitle: "ClassZone",
  isMaintenanceMode: false,
  allowedPostRoles: [Role.Admin, Role.LopTruong, Role.BiThu],
  banner: {
    text: 'Chào mừng đến với năm học mới! Hãy cùng nhau xây dựng một tập thể vững mạnh.',
    type: 'info',
    isActive: false,
  },
};

export const currentUser: User = MOCK_USERS[0];