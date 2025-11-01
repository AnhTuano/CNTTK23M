import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToast } from '../hooks/useToast';
import { Icons } from '../components/icons';

interface ForcePasswordChangeProps {
    onPasswordChanged: () => void;
}

const ForcePasswordChange: React.FC<ForcePasswordChangeProps> = ({ onPasswordChanged }) => {
    const { addToast } = useToast();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setIsLoading(true);
        // Simulate API call to change password
        setTimeout(() => {
            setIsLoading(false);
            addToast({
                title: 'Thành công!',
                message: 'Mật khẩu của bạn đã được cập nhật. Chào mừng bạn đến với ClassZone!',
                type: 'success',
            });
            onPasswordChanged();
        }, 1000);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 z-0"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-30 dark:opacity-50"></div>
                 <motion.div 
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30"
                    animate={{ x: [-50, 50, -50], y: [-50, 50, -50] }}
                    transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                ></motion.div>
                <motion.div 
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30"
                    animate={{ x: [50, -50, 50], y: [50, -50, 50] }}
                    transition={{ duration: 25, repeat: Infinity, repeatType: "reverse" }}
                ></motion.div>
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                <Card className="p-8">
                    <div className="text-center mb-6">
                        <Icons.Lock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold">Đổi mật khẩu lần đầu</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Vì lý do bảo mật, bạn cần tạo mật khẩu mới để tiếp tục.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Mật khẩu mới</label>
                             <input
                                type="password"
                                placeholder="Ít nhất 8 ký tự"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                         <div className="space-y-1">
                            <label className="text-sm font-medium">Xác nhận mật khẩu mới</label>
                             <input
                                type="password"
                                placeholder="Nhập lại mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                        <Button type="submit" className="w-full !py-3 !mt-6" disabled={isLoading}>
                            {isLoading ? (
                                 <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                ></motion.div>
                            ) : (
                                'Lưu mật khẩu'
                            )}
                        </Button>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
};

export default ForcePasswordChange;
