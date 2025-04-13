import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, getThemeById, themes } from '../styles/themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

// 创建主题上下文
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 主题提供者组件
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 从本地存储中获取主题，如果没有则使用默认主题
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  useEffect(() => {
    // 在客户端加载时从localStorage获取主题设置
    if (typeof window !== 'undefined') {
      const savedThemeId = localStorage.getItem('themeId');
      if (savedThemeId) {
        setCurrentTheme(getThemeById(savedThemeId));
      }
    }
  }, []);

  // 设置主题并保存到本地存储
  const setTheme = (themeId: string) => {
    const theme = getThemeById(themeId);
    setCurrentTheme(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('themeId', themeId);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 使用主题的自定义Hook
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
