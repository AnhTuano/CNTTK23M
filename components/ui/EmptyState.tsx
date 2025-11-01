
import React from 'react';
import { Icons } from '../icons';
import { Button } from './Button';

interface EmptyStateProps {
    icon: keyof typeof Icons;
    title: string;
    message: string;
    action?: {
        text: string;
        onClick: () => void;
    }
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, action }) => {
    const IconComponent = Icons[icon];
    return (
        <div className="text-center py-10 px-4">
            {IconComponent && <IconComponent className="w-16 h-16 text-gray-400 mx-auto mb-4" />}
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-gray-500 mt-2 mb-4">{message}</p>
            {action && (
                <Button onClick={action.onClick}>
                    {action.text}
                </Button>
            )}
        </div>
    );
};
