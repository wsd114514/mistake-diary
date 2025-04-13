// 主题配置文件
export interface Theme {
  id: string;
  name: string;
  description: string;
  // 字体设置
  typography: {
    fontFamily: string;
    headingFont: string;
    baseSize: string;
    headingWeight: string;
    bodyWeight: string;
  };
  colors: {
    // 基础颜色
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    cardBackground: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    headingText: string;
    linkText: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    
    // 计时器相关
    timerBackground: string;
    timerBorder: string;
    
    // 日历相关
    calendarHeader: string;
    calendarHeaderText: string;
    calendarHeaderButton: string;
    calendarDaysBackground: string;
    calendarDaysText: string;
    calendarCurrentMonthBackground: string;
    calendarCurrentMonthText: string;
    calendarOtherMonthBackground: string;
    calendarOtherMonthText: string;
    calendarTodayBorder: string;
    calendarSelectedRing: string;
    calendarHoverBackground: string;
    calendarMistakeCount: string;
    calendarMistakeDot: string;
    
    // 卡片和面板
    panelBackground: string;
    panelHeaderText: string;
    mistakeItemBackground: string;
    mistakeItemBorder: string;
    mistakeSummaryBackground: string;
    mistakeSummaryBorder: string;
    
    // 按钮和交互元素
    buttonPrimary: string;
    buttonDanger: string;
    quickSummaryButton: string;
    quickSummaryButtonHover: string;
  };
}

// 预设主题配置
export const themes: Theme[] = [
  {
    id: 'default',
    name: '默认主题',
    description: '蓝色基调的清新主题',
    typography: {
      fontFamily: 'font-sans',
      headingFont: 'font-sans',
      baseSize: 'text-base',
      headingWeight: 'font-semibold',
      bodyWeight: 'font-normal',
    },
    colors: {
      // 基础颜色
      primary: 'bg-indigo-600 text-white',
      secondary: 'bg-blue-100 text-blue-700',
      accent: 'bg-pink-500 text-white hover:bg-pink-600',
      background: 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50',
      cardBackground: 'bg-white',
      text: 'text-gray-800',
      textSecondary: 'text-gray-700',
      textMuted: 'text-gray-500',
      headingText: 'text-indigo-800',
      linkText: 'text-indigo-600 hover:text-indigo-800',
      border: 'border-gray-200',
      error: 'text-red-600 bg-red-100',
      success: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      
      // 计时器相关
      timerBackground: 'bg-indigo-50',
      timerBorder: 'border-indigo-200',
      
      // 日历相关
      calendarHeader: 'bg-blue-100',
      calendarHeaderText: 'text-blue-800',
      calendarHeaderButton: 'hover:bg-blue-200 text-blue-700',
      calendarDaysBackground: 'bg-blue-50',
      calendarDaysText: 'text-blue-600',
      calendarCurrentMonthBackground: 'bg-white',
      calendarCurrentMonthText: 'text-gray-800',
      calendarOtherMonthBackground: 'bg-gray-50',
      calendarOtherMonthText: 'text-gray-400',
      calendarTodayBorder: 'border-blue-500',
      calendarSelectedRing: 'ring-yellow-500',
      calendarHoverBackground: 'hover:bg-blue-50',
      calendarMistakeCount: 'text-pink-600 bg-pink-100',
      calendarMistakeDot: 'bg-pink-400',
      
      // 卡片和面板
      panelBackground: 'bg-white',
      panelHeaderText: 'text-gray-800',
      mistakeItemBackground: 'bg-gray-50',
      mistakeItemBorder: 'border-gray-200',
      mistakeSummaryBackground: 'bg-white',
      mistakeSummaryBorder: 'border-gray-300',
      
      // 按钮和交互元素
      buttonPrimary: 'bg-indigo-500 text-white hover:bg-indigo-600',
      buttonDanger: 'bg-red-500 text-white hover:bg-red-600',
      quickSummaryButton: 'bg-blue-100 text-blue-800',
      quickSummaryButtonHover: 'hover:bg-blue-200',
    },
  },
  {
    id: 'dark',
    name: '暗黑模式',
    description: '深色背景，保护眼睛',
    typography: {
      fontFamily: 'font-sans',
      headingFont: 'font-sans',
      baseSize: 'text-base',
      headingWeight: 'font-semibold',
      bodyWeight: 'font-normal',
    },
    colors: {
      // 基础颜色
      primary: 'bg-gray-800 text-white',
      secondary: 'bg-gray-700 text-gray-200',
      accent: 'bg-purple-600 text-white hover:bg-purple-700',
      background: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700',
      cardBackground: 'bg-gray-800',
      text: 'text-gray-200',
      textSecondary: 'text-gray-300',
      textMuted: 'text-gray-400',
      headingText: 'text-purple-300',
      linkText: 'text-purple-400 hover:text-purple-300',
      border: 'border-gray-700',
      error: 'text-red-400 bg-red-900 bg-opacity-30',
      success: 'text-green-400 bg-green-900 bg-opacity-30',
      warning: 'text-yellow-400 bg-yellow-900 bg-opacity-30',
      
      // 计时器相关
      timerBackground: 'bg-gray-700',
      timerBorder: 'border-gray-600',
      
      // 日历相关
      calendarHeader: 'bg-gray-700',
      calendarHeaderText: 'text-gray-200',
      calendarHeaderButton: 'hover:bg-gray-600 text-gray-300',
      calendarDaysBackground: 'bg-gray-800',
      calendarDaysText: 'text-gray-400',
      calendarCurrentMonthBackground: 'bg-gray-700',
      calendarCurrentMonthText: 'text-gray-300',
      calendarOtherMonthBackground: 'bg-gray-800',
      calendarOtherMonthText: 'text-gray-600',
      calendarTodayBorder: 'border-purple-500',
      calendarSelectedRing: 'ring-purple-400',
      calendarHoverBackground: 'hover:bg-gray-600',
      calendarMistakeCount: 'text-purple-300 bg-purple-900 bg-opacity-40',
      calendarMistakeDot: 'bg-purple-500',
      
      // 卡片和面板
      panelBackground: 'bg-gray-800',
      panelHeaderText: 'text-gray-200',
      mistakeItemBackground: 'bg-gray-700',
      mistakeItemBorder: 'border-gray-600',
      mistakeSummaryBackground: 'bg-gray-800',
      mistakeSummaryBorder: 'border-gray-600',
      
      // 按钮和交互元素
      buttonPrimary: 'bg-purple-600 text-white hover:bg-purple-700',
      buttonDanger: 'bg-red-700 text-white hover:bg-red-800',
      quickSummaryButton: 'bg-gray-700 text-gray-300',
      quickSummaryButtonHover: 'hover:bg-gray-600',
    },
  },
  {
    id: 'pastel',
    name: '柔和粉彩',
    description: '温柔的粉彩色调',
    typography: {
      fontFamily: 'font-sans',
      headingFont: 'font-sans',
      baseSize: 'text-base',
      headingWeight: 'font-medium',
      bodyWeight: 'font-normal',
    },
    colors: {
      // 基础颜色
      primary: 'bg-pink-400 text-white',
      secondary: 'bg-pink-100 text-pink-700',
      accent: 'bg-purple-400 text-white hover:bg-purple-500',
      background: 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50',
      cardBackground: 'bg-white',
      text: 'text-gray-700',
      textSecondary: 'text-pink-700',
      textMuted: 'text-pink-500',
      headingText: 'text-pink-600',
      linkText: 'text-purple-500 hover:text-purple-700',
      border: 'border-pink-200',
      error: 'text-red-500 bg-red-50',
      success: 'text-green-500 bg-green-50',
      warning: 'text-yellow-500 bg-yellow-50',
      
      // 计时器相关
      timerBackground: 'bg-pink-50',
      timerBorder: 'border-pink-200',
      
      // 日历相关
      calendarHeader: 'bg-pink-100',
      calendarHeaderText: 'text-pink-700',
      calendarHeaderButton: 'hover:bg-pink-200 text-pink-600',
      calendarDaysBackground: 'bg-pink-50',
      calendarDaysText: 'text-pink-600',
      calendarCurrentMonthBackground: 'bg-white',
      calendarCurrentMonthText: 'text-gray-700',
      calendarOtherMonthBackground: 'bg-gray-50',
      calendarOtherMonthText: 'text-gray-400',
      calendarTodayBorder: 'border-pink-400',
      calendarSelectedRing: 'ring-purple-400',
      calendarHoverBackground: 'hover:bg-pink-50',
      calendarMistakeCount: 'text-purple-600 bg-purple-100',
      calendarMistakeDot: 'bg-purple-400',
      
      // 卡片和面板
      panelBackground: 'bg-white',
      panelHeaderText: 'text-pink-700',
      mistakeItemBackground: 'bg-pink-50',
      mistakeItemBorder: 'border-pink-100',
      mistakeSummaryBackground: 'bg-white',
      mistakeSummaryBorder: 'border-pink-200',
      
      // 按钮和交互元素
      buttonPrimary: 'bg-pink-400 text-white hover:bg-pink-500',
      buttonDanger: 'bg-red-400 text-white hover:bg-red-500',
      quickSummaryButton: 'bg-purple-100 text-purple-700',
      quickSummaryButtonHover: 'hover:bg-purple-200',
    },
  },
  {
    id: 'nature',
    name: '自然绿意',
    description: '舒适的绿色调',
    typography: {
      fontFamily: 'font-sans',
      headingFont: 'font-sans',
      baseSize: 'text-base',
      headingWeight: 'font-semibold',
      bodyWeight: 'font-normal',
    },
    colors: {
      // 基础颜色
      primary: 'bg-green-600 text-white',
      secondary: 'bg-green-100 text-green-700',
      accent: 'bg-yellow-500 text-white hover:bg-yellow-600',
      background: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
      cardBackground: 'bg-white',
      text: 'text-gray-800',
      textSecondary: 'text-green-700',
      textMuted: 'text-green-600',
      headingText: 'text-green-800',
      linkText: 'text-teal-600 hover:text-teal-800',
      border: 'border-green-200',
      error: 'text-red-600 bg-red-50',
      success: 'text-green-600 bg-green-100',
      warning: 'text-amber-600 bg-amber-50',
      
      // 计时器相关
      timerBackground: 'bg-green-50',
      timerBorder: 'border-green-200',
      
      // 日历相关
      calendarHeader: 'bg-green-100',
      calendarHeaderText: 'text-green-800',
      calendarHeaderButton: 'hover:bg-green-200 text-green-700',
      calendarDaysBackground: 'bg-green-50',
      calendarDaysText: 'text-green-600',
      calendarCurrentMonthBackground: 'bg-white',
      calendarCurrentMonthText: 'text-gray-800',
      calendarOtherMonthBackground: 'bg-gray-50',
      calendarOtherMonthText: 'text-gray-400',
      calendarTodayBorder: 'border-green-500',
      calendarSelectedRing: 'ring-yellow-400',
      calendarHoverBackground: 'hover:bg-green-50',
      calendarMistakeCount: 'text-yellow-600 bg-yellow-100',
      calendarMistakeDot: 'bg-yellow-400',
      
      // 卡片和面板
      panelBackground: 'bg-white',
      panelHeaderText: 'text-green-700',
      mistakeItemBackground: 'bg-green-50',
      mistakeItemBorder: 'border-green-100',
      mistakeSummaryBackground: 'bg-white',
      mistakeSummaryBorder: 'border-green-200',
      
      // 按钮和交互元素
      buttonPrimary: 'bg-green-500 text-white hover:bg-green-600',
      buttonDanger: 'bg-red-500 text-white hover:bg-red-600',
      quickSummaryButton: 'bg-yellow-100 text-yellow-700',
      quickSummaryButtonHover: 'hover:bg-yellow-200',
    },
  }
];

// 获取主题
export const getThemeById = (id: string): Theme => {
  const theme = themes.find(t => t.id === id);
  return theme || themes[0]; // 如果找不到，返回默认主题
};
