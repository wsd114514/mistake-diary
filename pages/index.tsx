import type { NextPage } from 'next';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeSelector from '../components/ThemeSelector';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDate,
  isToday,
  formatISO,
  parseISO,
  differenceInSeconds,
  subDays,
  isAfter
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  PlusCircle, 
  AlertCircle, 
  CalendarDays, 
  Star, 
  ListChecks, 
  Award, 
  Smile, 
  Meh, 
  Frown, 
  PlayCircle, 
  StopCircle, 
  Clock, 
  X, 
  Send, 
  MessageSquare, 
  Save, 
  SkipForward, 
  Image as ImageIcon,
  BookOpen
} from 'lucide-react';

// 辅助函数：获取 YYYY-MM-DD 格式的日期键
const getDateKey = (date: Date): string => {
  return formatISO(date, { representation: 'date' });
};

// 格式化时长 (秒 -> HH:MM:SS 或 M分S秒)
const formatDuration = (seconds: number): string => {
  if (seconds < 0) return '无效时长';
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours}小时${minutes}分${remainingSeconds}秒`;
};

// 定义犯错记录的类型
interface MistakeRecord {
  id: number;
  category: string;
  startTime: number; // 时间戳
  endTime: number | null; // 时间戳, 结束时才有
  duration: number | null; // 秒, 结束时才有
  summary: string; // 总结
}

// 预设犯错类别
const mistakeCategories: string[] = [
  '这java代码好优美啊，来一发',
  '好困啊，来一发提提神',
  '拼好饭真好吃，来一发',
  '试试刚买的梯子，来一发',
  '宿舍没人来，该犯错了',
  '新飞机杯到了，来一发',
  '对奶龙犯错误了',
  '上班/上课时间看🥵犯错误了',
  '对群友犯错误了',
  '半夜emo犯错误了',
  '其他错误'
];

// 快捷总结选项
const quickSummaryOptions: string[] = [
  '下次注意',
  '纯属意外',
  '控制不住我自己',
  '都是惯性',
  '我能怎么办呢',
  '要图图了',
  '我忏悔',
  '我是烧鸡',
  '晶哥摇了我吧',
  '感觉要玉玉了',
  '马上就导',
  '贤者时间，索然无味',
  '空虚寂寞冷',
  '再冲我是狗',
  '我需要净化',
  '戒冲第一天',
  '感觉身体被掏空',
  '我是不是ed了',
  '活着还有什么意义',
  '想紫砂',
  '好想找个烧鸡doi'
];

// API 来源定义
interface ApiSource {
  name: string;
  url: string;
  type: 'redirect' | 'json_pics' | 'json_pic' | 'json_direct_url'; // type to handle response
}

const apiSources: ApiSource[] = [
  { name: '随机二次元2', url: 'https://www.loliapi.com/bg', type: 'redirect' },
  { name: '奶龙表情包', url: 'https://oiapi.net/API/FunBoxEmoji/?0=nailong', type: 'redirect' },
];

// 成就定义
interface Achievement {
  key: string;
  name: string;
  description: string;
  unlocked: boolean;
}

const initialAchievements: Achievement[] = [
  { key: 'firstMistakeRecorded', name: '迈出第一步', description: '首次成功记录一次犯错', unlocked: false },
  { key: 'firstLongMistake', name: '长时犯错', description: '记录了一次持续时间超过5分钟的犯错', unlocked: false },
  { key: 'mistakeSpree', name: '犯错连连', description: '在一天内记录了3次或更多的犯错', unlocked: false },
  { key: 'quickFix', name: '速战速决', description: '记录了一次持续时间少于1分钟的犯错', unlocked: false },
  { key: 'categoryExplorer', name: '分类大师', description: '使用了至少3种不同的犯错类别', unlocked: false },
  { key: 'perfectDay', name: '完美一天', description: '查看了一个没有任何犯错记录的日期', unlocked: false },
  { key: 'consistentRecorder', name: '坚持记录者', description: '连续3天都有犯错记录', unlocked: false },
];

const MistakeDiary: NextPage = () => {
  const { currentTheme } = useTheme();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mistakesByDate, setMistakesByDate] = useState<Record<string, MistakeRecord[]>>({});
  
  // 图片 API 相关状态
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loadingImage, setLoadingImage] = useState<boolean>(true);
  const [imageError, setImageError] = useState<string | null>(null);
  const [selectedApiUrl, setSelectedApiUrl] = useState<string>(apiSources[0].url);
  const [currentApiType, setCurrentApiType] = useState<ApiSource['type']>(apiSources[0].type);

  // 犯错计时模态框状态
  const [showTimerModal, setShowTimerModal] = useState<boolean>(false);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [timerElapsedTime, setTimerElapsedTime] = useState<number>(0);
  const [timerStopped, setTimerStopped] = useState<boolean>(false);
  const [modalSelectedCategory, setModalSelectedCategory] = useState<string>(mistakeCategories[0]);
  const [summaryInput, setSummaryInput] = useState<string>('');

  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchImage = useCallback(async () => {
    setLoadingImage(true);
    setImageError(null);
    const apiToUse = apiSources.find(api => api.url === selectedApiUrl);
    if (!apiToUse) {
      setImageError('选择的API无效');
      setLoadingImage(false);
      return;
    }

    const urlWithCacheBust = `${apiToUse.url}${apiToUse.url.includes('?') ? '&' : '?'}t=${Date.now()}`;

    try {
      const response = await fetch(urlWithCacheBust);

      if (!response.ok) {
        // Even redirects might have !ok status initially, but check final URL later
        // If it's a real error, throw
        if (response.status >= 400) {
          throw new Error(`网络响应错误: ${response.status}`);
        }
      }

      if (apiToUse.type === 'redirect') {
        // For redirecting APIs, the final URL is the image URL
        if (response.url) {
          setImageUrl(response.url);
        } else {
          // Fallback if URL is not available, maybe try blob (less likely for redirect)
          throw new Error('API重定向后无法获取图片URL');
        }
      } else if (apiToUse.type === 'json_pics') {
        const data = await response.json();
        if (data.pics && data.pics.length > 0) {
          setImageUrl(data.pics[0]);
        } else {
          throw new Error('API响应格式错误 (json_pics)');
        }
      } else if (apiToUse.type === 'json_pic') {
        const data = await response.json();
        if (data.pic) {
          setImageUrl(data.pic);
        } else {
          throw new Error('API响应格式错误 (json_pic)');
        }
      } else if (apiToUse.type === 'json_direct_url') {
         // If API returns JSON where the URL is the direct response
         const data = await response.json();
         // Assuming the URL is in a 'url' field, adjust if needed
         if (data.url) { 
            setImageUrl(data.url);
         } else {
            throw new Error('API响应格式错误 (json_direct_url)');
         }
      } else {
         // Default or fallback: try to use response.url, might work for some
         if (response.url) {
            setImageUrl(response.url);
         } else {
            throw new Error('无法识别的API类型或无法获取URL');
         }
      }

    } catch (error: any) {
      console.error('获取图片出错:', error);
      setImageError(`加载图片失败: ${error.message}`);
      setImageUrl(''); // Clear image on error
    } finally {
      setLoadingImage(false);
    }
  }, [selectedApiUrl]);

  useEffect(() => {
    fetchImage();
  }, [fetchImage]);

  // 实时计时器
  useEffect(() => {
    if (showTimerModal && !timerStopped && timerStartTime) {
      timerRef.current = setInterval(() => {
        setTimerElapsedTime(differenceInSeconds(new Date(), timerStartTime));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [showTimerModal, timerStopped, timerStartTime]);

  // 检查并解锁成就
  useEffect(() => {
    const allMistakes = Object.values(mistakesByDate).flat();
    const updatedAchievements = [...achievements];
    let changed = false;

    // 1. First Mistake Recorded
    if (!updatedAchievements.find(a => a.key === 'firstMistakeRecorded')?.unlocked && allMistakes.length > 0) {
      const achievement = updatedAchievements.find(a => a.key === 'firstMistakeRecorded');
      if (achievement) achievement.unlocked = true;
      changed = true;
    }

    // 2. First Long Mistake (> 5 minutes)
    if (!updatedAchievements.find(a => a.key === 'firstLongMistake')?.unlocked && allMistakes.some(m => m.duration !== null && m.duration >= 300)) {
      const achievement = updatedAchievements.find(a => a.key === 'firstLongMistake');
      if (achievement) achievement.unlocked = true;
      changed = true;
    }

    // 3. Mistake Spree (3+ in a day)
    if (!updatedAchievements.find(a => a.key === 'mistakeSpree')?.unlocked) {
      const spreeDayExists = Object.values(mistakesByDate).some(dayMistakes => dayMistakes.length >= 3);
      if (spreeDayExists) {
        const achievement = updatedAchievements.find(a => a.key === 'mistakeSpree');
        if (achievement) achievement.unlocked = true;
        changed = true;
      }
    }

    // 4. Quick Fix (< 1 minute)
    if (!updatedAchievements.find(a => a.key === 'quickFix')?.unlocked && allMistakes.some(m => m.duration !== null && m.duration < 60)) {
      const achievement = updatedAchievements.find(a => a.key === 'quickFix');
      if (achievement) achievement.unlocked = true;
      changed = true;
    }

    // 5. Category Explorer (used 3+ different categories)
    if (!updatedAchievements.find(a => a.key === 'categoryExplorer')?.unlocked) {
      const usedCategories = new Set(allMistakes.map(m => m.category));
      if (usedCategories.size >= 3) {
        const achievement = updatedAchievements.find(a => a.key === 'categoryExplorer');
        if (achievement) achievement.unlocked = true;
        changed = true;
      }
    }
    
    // 6. Perfect Day (selected day has 0 mistakes)
    // This is checked when a date is selected, see handleDateClick

    // 7. Consistent Recorder (3 consecutive days)
    if (!updatedAchievements.find(a => a.key === 'consistentRecorder')?.unlocked) {
      const recordedDates = Object.keys(mistakesByDate).sort();
      let consecutiveCount = 0;
      let maxConsecutive = 0;
      if (recordedDates.length >= 1) {
          maxConsecutive = 1; // Start with 1 if any record exists
          consecutiveCount = 1;
      }
      for (let i = 1; i < recordedDates.length; i++) {
        const currentDate = parseISO(recordedDates[i]);
        const prevDate = parseISO(recordedDates[i-1]);
        // Check if current date is exactly one day after the previous date
        if (isSameDay(currentDate, subDays(prevDate, -1))) { 
          consecutiveCount++;
        } else {
          // Reset count if not consecutive
          consecutiveCount = 1; 
        }
        maxConsecutive = Math.max(maxConsecutive, consecutiveCount);
      }

      if (maxConsecutive >= 3) {
        const achievement = updatedAchievements.find(a => a.key === 'consistentRecorder');
        if (achievement) achievement.unlocked = true;
        changed = true;
      }
    }

    if (changed) {
      setAchievements(updatedAchievements);
    }

  }, [mistakesByDate, achievements]);

  const start = startOfWeek(startOfMonth(currentMonth));
  const end = endOfWeek(endOfMonth(currentMonth));
  const daysInMonthGrid = eachDayOfInterval({ start, end });

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    
    // Check for Perfect Day achievement when a date is selected
    const dateKey = getDateKey(day);
    const mistakesOnDay = mistakesByDate[dateKey] || [];
    const perfectDayAchievement = achievements.find(a => a.key === 'perfectDay');
    
    // Unlock if not already unlocked and the day has 0 mistakes
    if (perfectDayAchievement && !perfectDayAchievement.unlocked && mistakesOnDay.length === 0) {
       // We need to make sure we are not checking a future date
       // Let's allow unlocking for today or past dates
       if (isToday(day) || isAfter(new Date(), day)) {
          setAchievements(prev => 
            prev.map(ach => 
              ach.key === 'perfectDay' ? { ...ach, unlocked: true } : ach
            )
          );
       }
    }
  };

  const handleApiChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newUrl = event.target.value;
    const newApi = apiSources.find(api => api.url === newUrl);
    if (newApi) {
      setSelectedApiUrl(newUrl);
      setCurrentApiType(newApi.type);
      // No need to fetch here, useEffect dependency on selectedApiUrl will trigger fetch
    } else {
      console.error("Selected API not found in sources");
    }
  };

  const handleOpenTimerModal = () => {
    setModalSelectedCategory(mistakeCategories[0]);
    setSummaryInput('');
    setTimerStartTime(Date.now());
    setTimerElapsedTime(0);
    setTimerStopped(false);
    setShowTimerModal(true);
  };

  const handleStopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerStopped(true);
  };

  const handleSaveMistake = (summary: string) => {
    if (!timerStartTime) return;

    const endTime = Date.now();
    const duration = timerStopped ? timerElapsedTime : differenceInSeconds(endTime, timerStartTime);
    const dateKey = getDateKey(new Date(timerStartTime));

    const newMistake: MistakeRecord = {
      id: timerStartTime,
      category: modalSelectedCategory,
      startTime: timerStartTime,
      endTime: endTime,
      duration: duration,
      summary: summary.trim() === '' ? '犯错了，但没写总结' : summary.trim(),
    };

    setMistakesByDate(prev => {
      const existingMistakes = prev[dateKey] || [];
      return {
        ...prev,
        [dateKey]: [...existingMistakes, newMistake]
      };
    });

    handleCloseModal();
  };

  const handleCloseModal = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setShowTimerModal(false);
    setTimerStartTime(null);
    setTimerElapsedTime(0);
    setTimerStopped(false);
    setSummaryInput('');
  };

  const totalMistakes = useMemo(() => {
    return Object.values(mistakesByDate).reduce((sum, mistakes) => sum + mistakes.length, 0);
  }, [mistakesByDate]);

  const mistakesOnSelectedDate = useMemo(() => {
    const dateKey = getDateKey(selectedDate);
    return (mistakesByDate[dateKey] || []).sort((a, b) => b.startTime - a.startTime);
  }, [mistakesByDate, selectedDate]);

  const mistakesTodayCount = useMemo(() => {
    const todayKey = getDateKey(new Date());
    return (mistakesByDate[todayKey] || []).length;
  }, [mistakesByDate]);

  const todayStatus = useMemo(() => {
    if (mistakesTodayCount === 0) {
      return { text: '今日无记录，状态良好！', icon: <Smile className="w-6 h-6 text-green-500" />, color: 'text-green-600' };
    } else if (mistakesTodayCount <= 2) {
      return { text: '有几条记录，正常波动~', icon: <Meh className="w-6 h-6 text-yellow-500" />, color: 'text-yellow-600' };
    } else {
      return { text: '记录有点多，需要关注！', icon: <Frown className="w-6 h-6 text-red-500" />, color: 'text-red-600' };
    }
  }, [mistakesTodayCount]);

  const renderHeader = () => {
    return (
      <div className={`flex justify-between items-center p-4 ${currentTheme.colors.calendarHeader} rounded-t-lg`}>
        <button
          onClick={handlePrevMonth}
          className={`p-2 rounded-full ${currentTheme.colors.calendarHeaderButton} transition-colors duration-150`}
          aria-label="上个月"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className={`text-xl font-semibold ${currentTheme.colors.calendarHeaderText}`}>
          {format(currentMonth, 'yyyy年 MMMM')}
        </h2>
        <button
          onClick={handleNextMonth}
          className={`p-2 rounded-full ${currentTheme.colors.calendarHeaderButton} transition-colors duration-150`}
          aria-label="下个月"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
    return (
      <div className={`grid grid-cols-7 gap-1 p-2 ${currentTheme.colors.calendarDaysBackground}`}>
        {daysOfWeek.map(day => (
          <div key={day} className={`text-center font-medium ${currentTheme.colors.calendarDaysText} text-sm`}>
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    return (
      <div className="grid grid-cols-7 gap-1 p-2">
        {daysInMonthGrid.map(day => {
          const dateKey = getDateKey(day);
          const mistakeCount = (mistakesByDate[dateKey] || []).length;
          const isCurrentMonthDay = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={day.toString()}
              className={`p-1 h-20 flex flex-col justify-start items-center border rounded-md cursor-pointer transition-all duration-150 
                ${!isCurrentMonthDay ? `${currentTheme.colors.calendarOtherMonthText} ${currentTheme.colors.calendarOtherMonthBackground}` : `${currentTheme.colors.calendarCurrentMonthText} ${currentTheme.colors.calendarCurrentMonthBackground}`}
                ${isSelected ? `ring-2 ${currentTheme.colors.calendarSelectedRing} ring-offset-1` : ''}
                ${isTodayDate ? `${currentTheme.colors.calendarTodayBorder} border-2` : currentTheme.colors.border}
                ${currentTheme.colors.calendarHoverBackground} hover:shadow-sm relative
              `}
              onClick={() => handleDateClick(day)}
            >
              <span className={`text-xs font-semibold ${isTodayDate ? currentTheme.colors.calendarDaysText : ''}`}>
                {getDate(day)}
              </span>
              {mistakeCount > 0 && (
                <div className={`mt-1 flex items-center justify-center text-xs ${currentTheme.colors.calendarMistakeCount} font-semibold rounded-full w-5 h-5`}>
                  {mistakeCount}
                </div>
              )}
              {mistakeCount > 0 && <div className={`absolute bottom-1 right-1 w-2 h-2 ${currentTheme.colors.calendarMistakeDot} rounded-full`}></div>}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${currentTheme.colors.background} p-4 md:p-8 ${currentTheme.colors.text} ${currentTheme.typography.fontFamily} ${currentTheme.typography.baseSize} ${currentTheme.typography.bodyWeight}`}>
      <div className={`max-w-7xl mx-auto ${currentTheme.colors.cardBackground} rounded-xl shadow-lg overflow-hidden`}>
        <header className={`p-6 ${currentTheme.colors.primary} text-center rounded-t-xl`}>
          <h1 className={`text-3xl ${currentTheme.typography.headingWeight} ${currentTheme.typography.headingFont} flex items-center justify-center gap-2`}><BookOpen/> 犯错日记</h1>
          <p className="mt-2 opacity-90">记录生活中的小失误，回顾与成长</p>
        </header>

        <main className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Image & Controls */}
          <div className="lg:col-span-1 flex flex-col items-center space-y-6">
            <h2 className={`text-2xl ${currentTheme.typography.headingWeight} ${currentTheme.typography.headingFont} text-center ${currentTheme.colors.headingText}`}>每日图片</h2>
            <div className="w-full max-w-xs aspect-square relative flex items-center justify-center border-4 border-indigo-200 rounded-lg overflow-hidden shadow-md bg-gray-100">
              {loadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <RefreshCw className="h-12 w-12 text-gray-500 animate-spin" />
                </div>
              )}
              {imageError && !loadingImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-red-100">
                  <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                  <p className="text-sm text-red-700">{imageError}</p>
                </div>
              )}
              {!loadingImage && !imageError && imageUrl && (
                <img 
                  src={imageUrl} 
                  alt="每日图片" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    console.error('图片加载失败:', e);
                    setImageError('图片加载失败');
                  }}
                />
              )}
              {!loadingImage && !imageError && !imageUrl && (
                 <div className="absolute inset-0 flex items-center justify-center bg-gray-200 border-2 border-dashed rounded-lg">
                    <ImageIcon className="h-12 w-12 text-gray-400"/>
                 </div>
              )}
            </div>
            
            <div className='w-full max-w-xs space-y-2'>
              <label htmlFor="api-select" className="block text-sm font-medium text-gray-700">选择图片来源:</label>
              <select 
                id="api-select"
                value={selectedApiUrl}
                onChange={handleApiChange}
                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                {apiSources.map(api => (
                  <option key={api.url} value={api.url}>{api.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchImage}
              disabled={loadingImage}
              className={`w-full max-w-xs flex items-center justify-center px-4 py-2 ${currentTheme.colors.accent} rounded-lg shadow transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${loadingImage ? 'animate-spin' : ''}`} />
              {loadingImage ? '加载中...' : '换一张图'}
            </button>

            <ThemeSelector />

            <div className={`w-full p-4 ${currentTheme.colors.secondary} rounded-lg shadow-inner text-center space-y-2`}>
              <h3 className={`text-lg ${currentTheme.typography.headingWeight} ${currentTheme.colors.headingText}`}>今日状态</h3>
              <div className={`flex items-center justify-center space-x-2 ${todayStatus.color}`}>
                {todayStatus.icon}
                <p className="text-md font-medium">{todayStatus.text}</p>
              </div>
            </div>

            <div className={`w-full p-4 ${currentTheme.colors.secondary} rounded-lg shadow-inner text-center`}>
              <h3 className={`text-lg ${currentTheme.typography.headingWeight} ${currentTheme.colors.headingText} mb-2`}>总计记录次数</h3>
              <p className={`text-4xl ${currentTheme.typography.headingWeight} ${currentTheme.colors.accent.split(' ')[0].replace('bg-', 'text-')}`}>{totalMistakes}</p>
            </div>

            {/* Achievement Section */}
            <div className={`w-full p-4 ${currentTheme.colors.secondary} rounded-lg shadow-inner text-left space-y-2`}>
              <h3 className={`text-lg ${currentTheme.typography.headingWeight} ${currentTheme.colors.headingText} mb-2 flex items-center`}>
                <Award className="w-5 h-5 mr-2"/> 成就榜
              </h3>
              <ul className="list-none space-y-1 max-h-80 overflow-y-auto pr-2 scrollbar-hide">
                {achievements.map(ach => (
                  <li key={ach.key} className={`flex items-start text-sm ${ach.unlocked ? currentTheme.colors.success.split(' ')[0] : currentTheme.colors.textMuted}`}>
                    <Star className={`w-4 h-4 mr-2 mt-0.5 flex-shrink-0 ${ach.unlocked ? currentTheme.colors.accent.split(' ')[0].replace('bg-', 'text-') : 'text-gray-400'}`}/>
                    <div>
                      <span className={`${currentTheme.typography.headingWeight}`}>{ach.name}</span>
                      <span className='ml-1'>{ach.unlocked ? '(已解锁)' : '(未解锁)'}</span>
                      <p className={`text-xs ${currentTheme.colors.textMuted}`}>{ach.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right Column: Calendar & Mistake Log */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Record Mistake Button Section */}
            <div className={`${currentTheme.colors.panelBackground} rounded-lg shadow-md border ${currentTheme.colors.border} p-6 text-center`}>
              <h3 className={`text-xl font-semibold ${currentTheme.colors.panelHeaderText} mb-4`}>记录新的错误</h3>
              <button
                onClick={handleOpenTimerModal}
                className={`w-full max-w-xs mx-auto flex items-center justify-center px-6 py-3 ${currentTheme.colors.accent} rounded-lg shadow transition-colors duration-150 text-lg font-semibold`}
              >
                <PlusCircle className="h-6 w-6 mr-2" />
                记录错误 (启动计时器)
              </button>
              <p className="text-sm text-gray-500 mt-3">点击按钮开始计时，记录错误时长</p>
            </div>

            {/* Calendar */}
            <div className={`${currentTheme.colors.panelBackground} rounded-lg shadow-md border ${currentTheme.colors.border}`}>
              {renderHeader()}
              {renderDays()}
              {renderCells()}
            </div>

            {/* Mistake Log for Selected Date */}
            <div className={`${currentTheme.colors.panelBackground} rounded-lg shadow-md border ${currentTheme.colors.border} p-6`}>
              <h3 className={`text-xl font-semibold ${currentTheme.colors.panelHeaderText} mb-4 flex items-center`}>
                <ListChecks className="w-6 h-6 mr-2"/> 
                {format(selectedDate, 'yyyy年M月d日')} 错误记录 ({mistakesOnSelectedDate.length}条)
              </h3>
              {mistakesOnSelectedDate.length === 0 ? (
                <p className="text-gray-500 text-center py-4">选定日期没有错误记录！</p>
              ) : (
                <ul className="space-y-4 max-h-[32rem] overflow-y-auto pr-2 scrollbar-hide">
                  {mistakesOnSelectedDate.map(mistake => (
                    <li key={mistake.id} className={`p-4 ${currentTheme.colors.mistakeItemBackground} rounded-md border ${currentTheme.colors.mistakeItemBorder} shadow-sm`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`font-semibold text-md ${currentTheme.colors.panelHeaderText}`}>{mistake.category}</span>
                        <span className={`text-sm font-medium ${currentTheme.colors.calendarMistakeCount} px-2 py-0.5 rounded`}>
                          {mistake.duration !== null ? formatDuration(mistake.duration) : '时长未知'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2 space-x-4">
                        <span>开始: {format(mistake.startTime, 'HH:mm:ss')}</span>
                        <span>结束: {mistake.endTime ? format(mistake.endTime, 'HH:mm:ss') : '-'}</span>
                      </div>
                      <p className={`text-sm ${currentTheme.colors.text} ${currentTheme.colors.mistakeSummaryBackground} p-2 rounded border border-dashed ${currentTheme.colors.mistakeSummaryBorder}`}>
                        <span className='font-semibold'>总结:</span> {mistake.summary}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </main>

        <footer className={`p-4 ${currentTheme.colors.secondary} text-center text-sm rounded-b-xl border-t ${currentTheme.colors.border}`}>
          犯错日记 &copy; {new Date().getFullYear()} - 记录生活点滴
        </footer>
      </div>

      {/* Timer Modal */}
      {showTimerModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`${currentTheme.colors.timerBackground} border-2 ${currentTheme.colors.timerBorder} rounded-lg shadow-xl p-6 w-full max-w-lg space-y-5 relative`}>
            <button 
              onClick={handleCloseModal} 
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              aria-label="关闭计时窗口"
            >
              <X className="w-6 h-6" />
            </button>
            
            {!timerStopped ? (
              // Timer Running View
              <div className='space-y-5'>
                <h4 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-blue-500 animate-pulse"/>
                  正在记录错误...
                </h4>
                <div className="text-center py-4">
                  <p className="text-4xl font-bold text-pink-600">{formatDuration(timerElapsedTime)}</p>
                  <p className="text-sm text-gray-500 mt-2">计时进行中</p>
                </div>
                <div>
                  <label htmlFor="modal-mistake-category" className="block text-sm font-medium text-gray-700 mb-1">错误类别：</label>
                  <select 
                    id="modal-mistake-category"
                    value={modalSelectedCategory}
                    onChange={(e) => setModalSelectedCategory(e.target.value)}
                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {mistakeCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={handleStopTimer}
                  className={`w-full flex items-center justify-center px-5 py-3 ${currentTheme.colors.buttonDanger} rounded-lg shadow transition-colors duration-150 font-semibold`}
                >
                  <StopCircle className="h-5 w-5 mr-2" />
                  停止计时
                </button>
              </div>
            ) : (
              // Summary View (after timer stopped)
              <div className='space-y-4'>
                <h4 className="text-xl font-semibold text-gray-800 flex items-center">
                  <MessageSquare className="w-6 h-6 mr-2 text-green-500"/>
                  错误结束 - 添加总结
                </h4>
                <div className="p-3 bg-gray-100 rounded-md text-center">
                  <p className="text-sm text-gray-600">错误类别: <span className='font-semibold'>{modalSelectedCategory}</span></p>
                  <p className="text-sm text-gray-600">持续时长: <span className='font-semibold text-pink-600'>{formatDuration(timerElapsedTime)}</span></p>
                </div>

                {/* Quick Summary Buttons */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">快捷总结：</p>
                  <div className="flex flex-wrap gap-2">
                    {quickSummaryOptions.map(option => (
                      <button 
                        key={option}
                        onClick={() => handleSaveMistake(option)}
                        className={`px-3 py-1 ${currentTheme.colors.quickSummaryButton} rounded-full text-sm ${currentTheme.colors.quickSummaryButtonHover} transition-colors`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Summary Input */}
                <div className="space-y-2">
                  <label htmlFor="summary-input" className="text-sm font-medium text-gray-700">或者，手动输入总结：</label>
                  <textarea 
                    id="summary-input"
                    rows={3}
                    value={summaryInput}
                    onChange={(e) => setSummaryInput(e.target.value)}
                    placeholder="详细描述一下本次错误..."
                    className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3">
                  <button 
                    onClick={() => handleSaveMistake('(总结被跳过)')} 
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <SkipForward className='w-4 h-4'/>
                    跳过总结并保存
                  </button>
                  <button 
                    onClick={() => handleSaveMistake(summaryInput)} 
                    className="px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Save className='w-4 h-4'/>
                    保存记录
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MistakeDiary;
