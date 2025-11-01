
import React, { useContext } from 'react';
import { ThemeContext } from '../App';
import { Icons } from './icons';
import { Button } from './ui/Button';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Icons.Moon className="h-5 w-5" />
      ) : (
        <Icons.Sun className="h-5 w-5" />
      )}
    </Button>
  );
};
