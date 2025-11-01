import React, { useMemo } from 'react';
import { ROLE_COLORS, BADGES } from '../constants';
import { User } from '../types';
import { Icons } from '../components/icons';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/Card';

interface LeaderboardProps {
    users: User[];
}

const TopRankCard = React.memo<{ user: User; rank: number; className?: string }>(({ user, rank, className }) => {
  const rankConfig = {
    1: { iconColor: 'text-yellow-400', gradient: 'from-yellow-400/20 to-yellow-600/20', shadow: 'shadow-yellow-400/50' },
    2: { iconColor: 'text-gray-300', gradient: 'from-gray-300/20 to-gray-500/20', shadow: 'shadow-gray-300/20' },
    3: { iconColor: 'text-yellow-600', gradient: 'from-yellow-600/20 to-yellow-800/20', shadow: 'shadow-yellow-600/20' },
  }[rank] || { iconColor: 'text-gray-500', gradient: 'from-gray-500/10 to-gray-700/10', shadow: 'shadow-gray-500/20' };

  return (
    <Card className={cn('relative flex flex-col items-center justify-center p-6 text-center transition-all duration-300 group hover:shadow-2xl', rankConfig.gradient, rank === 1 ? 'lg:-translate-y-6' : '', className)}>
      <Icons.Crown className={cn('w-10 h-10 absolute -top-5', rankConfig.iconColor)} />
      <span className="absolute top-2 right-2 text-2xl font-bold opacity-20">{`#${rank}`}</span>
      <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full mb-4 border-4 border-white/50" />
      <h3 className="font-bold text-lg flex items-center gap-2">
        {user.name}
        {user.badges.some(b => b.id === BADGES.TOP_CONTRIBUTOR.id) && (
          <div className="group relative">
            <Icons.Sparkles className="w-5 h-5 text-yellow-400" />
             <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {BADGES.TOP_CONTRIBUTOR.name}
            </div>
          </div>
        )}
      </h3>
      <p className="text-sm" style={{ color: ROLE_COLORS[user.role].primary }}>{user.role}</p>
      <p className="text-2xl font-bold mt-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{user.points} <span className="text-sm">điểm</span></p>
      <div className="absolute inset-0 group-hover:bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </Card>
  );
});

const Leaderboard: React.FC<LeaderboardProps> = ({ users }) => {
    const sortedUsers = useMemo(() => 
        [...users].sort((a, b) => b.points - a.points), 
    [users]);
    
    const top3 = sortedUsers.slice(0, 3);
    const rest = sortedUsers.slice(3);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-center">Bảng Thành Tích</h1>
                <p className="text-center text-gray-500 dark:text-gray-400">Vinh danh những thành viên hoạt động tích cực nhất!</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
                {top3[0] && <TopRankCard user={top3[0]} rank={1} className="lg:order-2" />}
                {top3[1] && <TopRankCard user={top3[1]} rank={2} className="lg:order-1" />}
                {top3[2] && <TopRankCard user={top3[2]} rank={3} className="lg:order-3" />}
            </div>
            
            <Card>
                <div className="space-y-2">
                    {rest.map((user, index) => (
                        <div key={user.id} className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                            <span className="w-8 text-center font-bold text-gray-500">{index + 4}</span>
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mx-4" />
                            <div className="flex-grow">
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-xs" style={{ color: ROLE_COLORS[user.role].primary }}>{user.role}</p>
                            </div>
                            <p className="font-bold text-lg">{user.points}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default Leaderboard;