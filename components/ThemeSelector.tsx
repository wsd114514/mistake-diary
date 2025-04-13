import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Palette } from 'lucide-react';

const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  return (
    <div className="w-full max-w-xs space-y-2">
      <label htmlFor="theme-select" className="flex items-center text-sm font-medium">
        <Palette className="h-4 w-4 mr-1" />
        主题选择:
      </label>
      <select 
        id="theme-select"
        value={currentTheme.id}
        onChange={(e) => setTheme(e.target.value)}
        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
      >
        {availableThemes.map(theme => (
          <option key={theme.id} value={theme.id}>
            {theme.name} - {theme.description}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSelector;
