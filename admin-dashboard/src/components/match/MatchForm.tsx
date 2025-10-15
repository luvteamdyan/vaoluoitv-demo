'use client';

import React, { useState, useEffect } from 'react';
import { Match, CreateMatchDto, UpdateMatchDto, MatchStatus, MatchType } from '@/types/match';
import { User, UserRole } from '@/types/user';
import { userService } from '@/services/userService';
import { streamKeyService } from '@/services/streamKeyService';
import { convertHtmlDateToBackendFormat, convertBackendDateToHtmlFormat } from '@/utils/dateFormatter';

interface MatchFormProps {
  match?: Match | null;
  onSubmit: (matchData: CreateMatchDto | UpdateMatchDto) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  onMatchCreated?: (matchId: string, streamKeyId?: string) => Promise<void>;
}

const MatchForm: React.FC<MatchFormProps> = ({
  match,
  onSubmit,
  onCancel,
  loading,
}) => {
  // Generate random 5-digit ID
  const generateRandomId = (): string => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };
  const [formData, setFormData] = useState<CreateMatchDto>({
    home_team: {
      id: generateRandomId(),
      name: '',
      logo: ''
    },
    away_team: {
      id: generateRandomId(),
      name: '',
      logo: ''
    },
    league: {
      id: generateRandomId(),
      name: '',
      logo: 'https://logos-world.net/wp-content/uploads/2025/04/Asian-Cup-Logo.png'
    },
    match_time: '',
    match_date: '',
    venue: '',
    status: MatchStatus.SCHEDULED,
    type: MatchType.LEAGUE,
    home_score: 0,
    away_score: 0,
    is_active: true,
    is_featured: false,
    description: '',
    tags: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Caster assignment states
  const [casters, setCasters] = useState<User[]>([]);
  const [selectedCaster, setSelectedCaster] = useState<User | null>(null);
  const [assignToCaster, setAssignToCaster] = useState(false);
  const [loadingCasters, setLoadingCasters] = useState(false);
  const [casterStreamKeys, setCasterStreamKeys] = useState<Map<string, unknown>>(new Map());


  useEffect(() => {
    if (match) {
      setFormData({
        home_team: match.home_team,
        away_team: match.away_team,
        league: match.league,
        match_time: match.match_time,
        match_date: convertBackendDateToHtmlFormat(match.match_date), // Convert DD/MM/YYYY to YYYY-MM-DD for HTML input
        venue: match.venue,
        status: match.status,
        type: match.type,
        home_score: match.home_score,
        away_score: match.away_score,
        is_active: match.is_active,
        is_featured: match.is_featured,
        description: match.description,
        tags: match.tags,
      });
    }
  }, [match]);

  // Load casters with stream keys
  useEffect(() => {
    const loadCasters = async () => {
      if (!match) { // Only load for new matches
        setLoadingCasters(true);
        try {
          // Get all users with caster role
          const allUsers = await userService.getAllUsers();
          const casterUsers = allUsers.filter(user => user.role === UserRole.CASTER && user.is_active);
          
          // Get stream keys to check which casters have active stream keys
          const streamKeysResponse = await streamKeyService.getAll({ limit: 1000 });
          const streamKeys = streamKeysResponse?.streamKeys || [];
          
          // Create map of caster ID to their active stream key
          const streamKeyMap = new Map();
          const castersWithStreamKeys = casterUsers.filter(caster => {
            const activeStreamKey = streamKeys.find((sk: { user_id?: unknown; revoked_at?: unknown }) => 
              typeof sk.user_id === 'object' && 
              sk.user_id && 
              (sk.user_id as { _id?: string })._id === caster._id && 
              !sk.revoked_at
            );
            
            if (activeStreamKey && caster._id) {
              streamKeyMap.set(caster._id, activeStreamKey);
              return true;
            }
            return false;
          });
          
          setCasters(castersWithStreamKeys);
          setCasterStreamKeys(streamKeyMap);
        } catch (error) {
          // Silently handle error
        } finally {
          setLoadingCasters(false);
        }
      }
    };

    loadCasters();
  }, [match]);

  const handleInputChange = (field: keyof CreateMatchDto, value: CreateMatchDto[keyof CreateMatchDto]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTeamChange = (teamType: 'home_team' | 'away_team', field: 'id' | 'name' | 'logo', value: string) => {
    setFormData(prev => ({
      ...prev,
      [teamType]: {
        ...prev[teamType],
        [field]: value
      }
    }));
  };

  const handleLeagueChange = (field: 'id' | 'name' | 'logo', value: string) => {
    setFormData(prev => ({
      ...prev,
      league: {
        ...prev.league,
        [field]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate Home Team

    if (!formData.home_team.name.trim()) {
      newErrors.home_team_name = 'Tên đội nhà là bắt buộc';
    } else if (formData.home_team.name.trim().length < 2) {
      newErrors.home_team_name = 'Tên đội nhà phải có ít nhất 2 ký tự';
    } else if (formData.home_team.name.trim().length > 100) {
      newErrors.home_team_name = 'Tên đội nhà không được vượt quá 100 ký tự';
    }

    if (formData.home_team.logo && formData.home_team.logo.trim()) {
      const urlRegex = /^https?:\/\/.+\..+/;
      if (!urlRegex.test(formData.home_team.logo)) {
        newErrors.home_team_logo = 'URL logo đội nhà không hợp lệ';
      }
    }

    // Validate Away Team

    if (!formData.away_team.name.trim()) {
      newErrors.away_team_name = 'Tên đội khách là bắt buộc';
    } else if (formData.away_team.name.trim().length < 2) {
      newErrors.away_team_name = 'Tên đội khách phải có ít nhất 2 ký tự';
    } else if (formData.away_team.name.trim().length > 100) {
      newErrors.away_team_name = 'Tên đội khách không được vượt quá 100 ký tự';
    }

    if (formData.away_team.logo && formData.away_team.logo.trim()) {
      const urlRegex = /^https?:\/\/.+\..+/;
      if (!urlRegex.test(formData.away_team.logo)) {
        newErrors.away_team_logo = 'URL logo đội khách không hợp lệ';
      }
    }

    // Validate League

    if (!formData.league.name.trim()) {
      newErrors.league_name = 'Tên giải đấu là bắt buộc';
    } else if (formData.league.name.trim().length < 2) {
      newErrors.league_name = 'Tên giải đấu phải có ít nhất 2 ký tự';
    } else if (formData.league.name.trim().length > 100) {
      newErrors.league_name = 'Tên giải đấu không được vượt quá 100 ký tự';
    }

    if (formData.league.logo && formData.league.logo.trim()) {
      const urlRegex = /^https?:\/\/.+\..+/;
      if (!urlRegex.test(formData.league.logo)) {
        newErrors.league_logo = 'URL logo giải đấu không hợp lệ';
      }
    }

    // Validate Match Date
    if (!formData.match_date) {
      newErrors.match_date = 'Ngày thi đấu là bắt buộc';
    } else {
      const matchDate = new Date(formData.match_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (matchDate < today) {
        newErrors.match_date = 'Ngày thi đấu không được là ngày trong quá khứ';
      }
      
      // Check if date is too far in the future (2 years)
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 2);
      if (matchDate > maxDate) {
        newErrors.match_date = 'Ngày thi đấu không được vượt quá 2 năm từ hiện tại';
      }
    }

    // Validate Match Time
    if (!formData.match_time) {
      newErrors.match_time = 'Giờ thi đấu là bắt buộc';
    } else {
      // Validate time format HH:MM
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.match_time)) {
        newErrors.match_time = 'Định dạng giờ không hợp lệ. Sử dụng HH:MM (ví dụ: 20:00)';
      } else {
        // Check if time is reasonable (between 6:00 and 23:59)
        const [hours] = formData.match_time.split(':').map(Number);
        if (hours < 6 || hours > 23) {
          newErrors.match_time = 'Giờ thi đấu phải trong khoảng 06:00 - 23:59';
        }
      }
    }

    // Validate Venue
    if (formData.venue && formData.venue.trim()) {
      if (formData.venue.trim().length < 2) {
        newErrors.venue = 'Tên sân vận động phải có ít nhất 2 ký tự';
      } else if (formData.venue.trim().length > 200) {
        newErrors.venue = 'Tên sân vận động không được vượt quá 200 ký tự';
      }
    }


    // Validate Description
    if (formData.description && formData.description.trim()) {
      if (formData.description.trim().length > 1000) {
        newErrors.description = 'Mô tả không được vượt quá 1000 ký tự';
      }
    }


    // Validate Team names are different
    if (formData.home_team.name.trim() && formData.away_team.name.trim()) {
      if (formData.home_team.name.trim().toLowerCase() === formData.away_team.name.trim().toLowerCase()) {
        newErrors.away_team_name = 'Tên đội khách phải khác tên đội nhà';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Validate caster assignment
    if (assignToCaster && !selectedCaster) {
      setErrors(prev => ({ ...prev, caster: 'Vui lòng chọn caster' }));
      return;
    }

    try {
      // Prepare pure match data (không bao gồm stream key assignment info)
      const submitData: CreateMatchDto = {
        home_team: formData.home_team,
        away_team: formData.away_team,
        league: formData.league,
        match_time: formData.match_time,
        match_date: convertHtmlDateToBackendFormat(formData.match_date), // Convert YYYY-MM-DD to DD/MM/YYYY for backend
        venue: formData.venue,
        status: formData.status,
        type: formData.type,
        home_score: formData.home_score,
        away_score: formData.away_score,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        description: formData.description,
        tags: formData.tags,
      };
      
      // Nếu có gán caster và đang tạo mới (không phải edit)
      if (assignToCaster && selectedCaster && !match) {
        const activeStreamKey = casterStreamKeys.get(selectedCaster._id || '') as { id?: string; _id?: string } | undefined;
        if (activeStreamKey) {
          // Thêm assignment info nhưng không gửi lên API matches
          // Thông tin này sẽ được xử lý bởi parent component sau khi match được tạo
          submitData.streamKeyId = activeStreamKey.id || activeStreamKey._id;
          submitData.selectedCasterId = selectedCaster._id;
          submitData.assignToCaster = true;
        }
      }
      
      await onSubmit(submitData);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {match ? 'Chỉnh sửa trận đấu' : 'Tạo trận đấu mới'}
            </h2>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Match Time */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Giờ thi đấu (HH:MM) *
              </label>
              <input
                type="text"
                value={formData.match_time}
                onChange={(e) => handleInputChange('match_time', e.target.value)}
                className="w-full px-3 py-2 border border-[var(--sidebar-border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                placeholder="20:00"
                pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                title="Định dạng: HH:MM (ví dụ: 20:00)"
              />
              {errors.match_time && <p className="text-red-400 text-sm mt-1">{errors.match_time}</p>}
            </div>

            {/* Match Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ngày thi đấu *
              </label>
              <input
                type="date"
                value={formData.match_date}
                onChange={(e) => handleInputChange('match_date', e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {errors.match_date && <p className="text-red-400 text-sm mt-1">{errors.match_date}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as MatchStatus)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
              >
                <option value={MatchStatus.SCHEDULED} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Sắp diễn ra</option>
                <option value={MatchStatus.LIVE} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Đang diễn ra</option>
                <option value={MatchStatus.FINISHED} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Đã kết thúc</option>
                <option value={MatchStatus.CANCELLED} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Đã hủy</option>
                <option value={MatchStatus.NOT_STARTED} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Chưa bắt đầu</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Loại trận đấu
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as MatchType)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
              >
                <option value={MatchType.LEAGUE} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Giải đấu</option>
                <option value={MatchType.CUP} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Cúp</option>
                <option value={MatchType.FRIENDLY} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Giao hữu</option>
                <option value={MatchType.CHAMPIONSHIP} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Championship</option>
                <option value={MatchType.INTERNATIONAL} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Quốc tế</option>
              </select>
            </div>

            {/* Venue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sân vận động
              </label>
              <input
                type="text"
                value={formData.venue || ''}
                onChange={(e) => handleInputChange('venue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Old Trafford"
              />
            </div>
          </div>

          {/* Home Team */}
          <div className="border-t border-[var(--sidebar-border)] pt-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Đội nhà</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên đội *
                </label>
                <input
                  type="text"
                  value={formData.home_team.name}
                  onChange={(e) => handleTeamChange('home_team', 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Manchester United"
                />
                {errors.home_team_name && <p className="text-red-400 text-sm mt-1">{errors.home_team_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo đội
                </label>
                <input
                  type="url"
                  value={formData.home_team.logo}
                  onChange={(e) => handleTeamChange('home_team', 'logo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="https://example.com/logo.png"
                />
                {errors.home_team_logo && <p className="text-red-400 text-sm mt-1">{errors.home_team_logo}</p>}
              </div>
            </div>
          </div>

          {/* Away Team */}
          <div className="border-t border-[var(--sidebar-border)] pt-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Đội khách</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên đội *
                </label>
                <input
                  type="text"
                  value={formData.away_team.name}
                  onChange={(e) => handleTeamChange('away_team', 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Liverpool FC"
                />
                {errors.away_team_name && <p className="text-red-400 text-sm mt-1">{errors.away_team_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo đội
                </label>
                <input
                  type="url"
                  value={formData.away_team.logo}
                  onChange={(e) => handleTeamChange('away_team', 'logo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="https://example.com/logo.png"
                />
                {errors.away_team_logo && <p className="text-red-400 text-sm mt-1">{errors.away_team_logo}</p>}
              </div>
            </div>
          </div>

          {/* League */}
          <div className="border-t border-[var(--sidebar-border)] pt-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Giải đấu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên giải đấu *
                </label>
                <input
                  type="text"
                  value={formData.league.name}
                  onChange={(e) => handleLeagueChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Premier League"
                />
                {errors.league_name && <p className="text-red-400 text-sm mt-1">{errors.league_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo giải đấu
                </label>
                <input
                  type="url"
                  value={formData.league.logo}
                  onChange={(e) => handleLeagueChange('logo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="https://example.com/logo.png"
                />
                {errors.league_logo && <p className="text-red-400 text-sm mt-1">{errors.league_logo}</p>}
              </div>
            </div>
          </div>


          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-[var(--sidebar-border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              placeholder="Mô tả về trận đấu..."
            />
          </div>

          {/* Caster Assignment Section - Only for new matches */}
          {!match && (
            <div className="border-t-2 border-[var(--accent)] pt-6 bg-gradient-to-r from-[var(--muted)]/30 to-transparent rounded-lg p-4 -mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🎙️</span>
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)]">Chọn bình luận viên</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-[var(--accent)] to-transparent"></div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-[var(--card-bg)] border border-[var(--accent)]/30 rounded-lg p-4">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={assignToCaster}
                      onChange={(e) => {
                        setAssignToCaster(e.target.checked);
                        if (!e.target.checked) {
                          setSelectedCaster(null);
                        }
                      }}
                      className="mr-3 w-4 h-4 text-[var(--accent)] bg-[var(--background)] border-[var(--accent)] rounded focus:ring-[var(--accent)] focus:ring-2"
                    />
                    <span className="text-[var(--foreground)] font-medium group-hover:text-[var(--accent)] transition-colors">
                      Chọn bình luận viên cụ thể
                    </span>
                  </label>
                </div>

                {assignToCaster && (
                  <div className="bg-[var(--card-bg)] border border-[var(--accent)]/30 rounded-lg p-4 space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                      <span className="w-2 h-2 bg-[var(--accent)] rounded-full"></span>
                      Chọn Caster *
                    </label>
                    {loadingCasters ? (
                      <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-sm">
                        <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                        Đang tải danh sách caster...
                      </div>
                    ) : casters.length > 0 ? (
                      <select
                        value={selectedCaster?._id || ''}
                        onChange={(e) => {
                          const caster = casters.find(c => c._id === e.target.value);
                          setSelectedCaster(caster || null);
                        }}
                        className="w-full px-4 py-3 border-2 border-[var(--accent)]/30 rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all duration-200"
                        style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
                      >
                        <option value="" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>-- Chọn caster --</option>
                        {casters.map((caster) => (
                          <option key={caster._id} value={caster._id} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>
                            {caster.display_name || caster.username} ({caster.email}) - Có stream key
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-center py-4 text-[var(--muted-foreground)] text-sm bg-[var(--muted)]/50 rounded-lg">
                        <div className="text-2xl mb-2">🎙️</div>
                        Không có caster nào có stream key active
                      </div>
                    )}
                    
                    {errors.caster && (
                      <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-2 rounded-lg">
                        <span>⚠️</span>
                        {errors.caster}
                      </div>
                    )}
                  </div>
                )}

                {assignToCaster && selectedCaster && (
                  <div className="bg-gradient-to-r from-[var(--accent)]/10 to-[var(--muted)]/30 border border-[var(--accent)]/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <div className="text-sm font-semibold text-[var(--foreground)]">
                        Thông tin caster được chọn
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--muted-foreground)]">Tên:</span>
                        <span className="text-[var(--foreground)] font-medium">
                          {selectedCaster.display_name || selectedCaster.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--muted-foreground)]">Email:</span>
                        <span className="text-[var(--foreground)]">{selectedCaster.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--muted-foreground)]">Username:</span>
                        <span className="text-[var(--foreground)]">@{selectedCaster.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--muted-foreground)]">Trạng thái:</span>
                        <span className="text-green-400 font-medium">Có stream key active</span>
                      </div>
                    </div>
                    
                    {/* Display current stream key info */}
                    {selectedCaster._id && casterStreamKeys.has(selectedCaster._id) && (
                      <div className="mt-3 pt-3 border-t border-[var(--accent)]/20">
                        <div className="text-xs text-[var(--muted-foreground)] mb-2">Stream key hiện tại:</div>
                        <div className="bg-[var(--background)] p-2 rounded border border-[var(--accent)]/20">
                          <div className="font-mono text-xs text-[var(--foreground)] break-all">
                            {(casterStreamKeys.get(selectedCaster._id) as { key_value?: string })?.key_value || 'N/A'}
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)] mt-1">
                            RTMP: {(casterStreamKeys.get(selectedCaster._id) as { rtmp_url?: string })?.rtmp_url || 'N/A'}
                          </div>
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)] mt-2">
                          ⚠️ Stream key này sẽ được gán cho trận đấu mới
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Checkboxes */}
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Đang hoạt động</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                className="mr-2"
              />
              <span className="text-[var(--foreground)]">Đánh dấu trận đấu là nổi bật</span>
            </label>
          </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : (match ? 'Cập nhật' : 'Tạo mới')}
          </button>
        </div>
        </form>
          </div>
        </div>
  );
};

export default MatchForm;
