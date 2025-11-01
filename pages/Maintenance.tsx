import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../components/icons';
import { Card } from '../components/ui/Card';

const Maintenance: React.FC = () => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 z-0"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-900 to-black opacity-30 dark:opacity-50"></div>
                <motion.div 
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl opacity-20"
                    animate={{ x: [-50, 50, -50], y: [-50, 50, -50] }}
                    transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                ></motion.div>
                <motion.div 
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400 rounded-full mix-blend-screen filter blur-3xl opacity-20"
                    animate={{ x: [50, -50, 50], y: [50, -50, 50] }}
                    transition={{ duration: 25, repeat: Infinity, repeatType: "reverse" }}
                ></motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg z-10 text-center"
            >
                <Card className="p-10">
                    <motion.div
                         animate={{ rotate: [0, 10, -10, 10, 0] }}
                         transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                         className="inline-block"
                    >
                        <Icons.Settings className="w-20 h-20 text-blue-500 mx-auto mb-6" />
                    </motion.div>
                    
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
                        Website Đang Bảo Trì
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                        Chúng tôi đang thực hiện một số nâng cấp để cải thiện trải nghiệm của bạn. Vui lòng quay lại sau. Cảm ơn sự kiên nhẫn của bạn!
                    </p>
                </Card>
            </motion.div>
        </div>
    );
};

export default Maintenance;
