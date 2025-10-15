'use client';

import React, { useState, useEffect } from 'react';
import { Match, CreateMatchDto, UpdateMatchDto, MatchStatus, MatchType, Team, League } from '@/types/match';
import { User, UserRole } from '@/types/user';
import { StreamKey } from '@/types/stream-key';
import { streamKeyService } from '@/services/streamKeyService';
import { convertHtmlDateToBackendFormat, convertBackendDateToHtmlFormat } from '@/utils/dateFormatter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Calendar, 
  Clock, 
  Users, 
  Trophy, 
  MapPin, 
  FileText, 
  Star, 
  Activity,
  AlertTriangle,
  CheckCircle2,
  User as UserIcon,
  RefreshCw,
  X,
  Plus
} from 'lucide-react';

interface MatchFormProps {
  isOpen: boolean;
  match?: Match | null;
  onSubmit: (matchData: CreateMatchDto | UpdateMatchDto) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  onMatchCreated?: (matchId: string, streamKeyId?: string) => Promise<void>;
}

interface CasterWithStreamKey {
  user: User;
  streamKey: StreamKey;
}

const MatchForm: React.FC<MatchFormProps> = ({
  isOpen,
  match,
  onSubmit,
  onCancel,
  loading,
  onMatchCreated,
}) => {
  // Generate random 5-digit ID
  const generateRandomId = (): string => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  const [formData, setFormData] = useState<CreateMatchDto>({
    home_team: {
      id: generateRandomId(),
      name: '',
      logo: 'https://via.placeholder.com/64'
    },
    away_team: {
      id: generateRandomId(),
      name: '',
      logo: 'https://via.placeholder.com/64'
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
  
  // Caster assignment states (for new matches)
  const [castersWithStreamKeys, setCastersWithStreamKeys] = useState<CasterWithStreamKey[]>([]);
  const [selectedCaster, setSelectedCaster] = useState<CasterWithStreamKey | null>(null);
  const [assignToCaster, setAssignToCaster] = useState(false);
  const [loadingCasters, setLoadingCasters] = useState(false);

  // Caster management states (for edit matches)
  const [currentCaster, setCurrentCaster] = useState<CasterWithStreamKey | null>(null);
  const [manageCasterOpened, setManageCasterOpened] = useState(false);


  // Load form data when editing
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

      // Load current caster if exists
      if (match.stream_key) {
        const caster: CasterWithStreamKey = {
          user: {
            _id: match.stream_key.user.id,
            id: match.stream_key.user.id,
            username: match.stream_key.user.username,
            display_name: match.stream_key.user.display_name,
            email: match.stream_key.user.email,
            role: UserRole.CASTER,
            sms_verified: false,
            points: 0,
            referral_code: '',
            is_active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          streamKey: {
            id: match.stream_key.id,
            key_value: match.stream_key.key_value,
            rtmp_url: match.stream_key.rtmp_url,
            created_at: new Date().toISOString(),
            revoked_at: null,
          }
        };
        setCurrentCaster(caster);
      } else {
        setCurrentCaster(null);
      }
    } else {
      // Reset form for new match
      setFormData({
        home_team: {
          id: generateRandomId(),
          name: '',
          logo: 'https://via.placeholder.com/64'
        },
        away_team: {
          id: generateRandomId(),
          name: '',
          logo: 'https://via.placeholder.com/64'
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
    }
  }, [match]);

  // Load casters with active stream keys (only for new matches)
  useEffect(() => {
    if (!match) {
      loadCastersWithStreamKeys();
    }
  }, [match]);

  // Load casters when caster management modal opens (for edit matches)
  useEffect(() => {
    if (manageCasterOpened && match) {
      loadCastersWithStreamKeys();
    }
  }, [manageCasterOpened, match]);

  const loadCastersWithStreamKeys = async () => {
    setLoadingCasters(true);
    try {
      // Use new service method to get casters with available stream keys
      const castersData = await streamKeyService.getCastersWithAvailableStreamKeys();
      
      // Transform data to match our interface
      const castersWithKeys: CasterWithStreamKey[] = castersData.map(item => ({
        user: item.user as User,
        streamKey: item.streamKey
      }));

      setCastersWithStreamKeys(castersWithKeys);
    } catch (error) {
      setCastersWithStreamKeys([]);
    } finally {
      setLoadingCasters(false);
    }
  };

  const handleInputChange = (field: keyof CreateMatchDto, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTeamChange = (teamType: 'home_team' | 'away_team', field: keyof Team, value: string) => {
    setFormData(prev => ({
      ...prev,
      [teamType]: {
        ...prev[teamType],
        [field]: value
      }
    }));
  };

  const handleLeagueChange = (field: keyof League, value: string) => {
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
    }

    // Validate Away Team
    if (!formData.away_team.name.trim()) {
      newErrors.away_team_name = 'Tên đội khách là bắt buộc';
    }

    // Validate League
    if (!formData.league.name.trim()) {
      newErrors.league_name = 'Tên giải đấu là bắt buộc';
    }

    // Validate Match Date
    if (!formData.match_date) {
      newErrors.match_date = 'Ngày thi đấu là bắt buộc';
    }

    // Validate Match Time
    if (!formData.match_time) {
      newErrors.match_time = 'Giờ thi đấu là bắt buộc';
    }

    // Validate Team names are different
    if (formData.home_team.name.trim() && formData.away_team.name.trim()) {
      if (formData.home_team.name.trim().toLowerCase() === formData.away_team.name.trim().toLowerCase()) {
        newErrors.away_team_name = 'Tên đội khách phải khác tên đội nhà';
      }
    }

    // Validate caster selection if enabled
    if (assignToCaster && !selectedCaster) {
      newErrors.caster = 'Vui lòng chọn bình luận viên';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Prepare pure match data (không bao gồm các field không được backend chấp nhận)
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
        // Thêm assignment info để parent component xử lý sau khi match được tạo
        submitData.streamKeyId = selectedCaster.streamKey.id;
        submitData.selectedCasterId = selectedCaster.user._id || selectedCaster.user.id;
        submitData.assignToCaster = true;
      }
      
      await onSubmit(submitData);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            {match ? 'Chỉnh sửa trận đấu' : 'Tạo trận đấu mới'}
          </DialogTitle>
          <DialogDescription>
            {match ? 'Cập nhật thông tin trận đấu' : 'Tạo trận đấu mới và có thể gán bình luận viên ngay'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Options */}
          <div className="flex items-center gap-6 justify-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="rounded"
              />
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Đang hoạt động</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                className="rounded"
              />
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Trận đấu nổi bật</span>
            </label>
          </div>

          {/* Caster Management Section - Only for edit matches */}
          {match && (
            <Card className="border-[var(--border)]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="w-4 h-4" />
                  Quản lý bình luận viên
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {currentCaster ? (
                  // Có bình luận viên hiện tại
                  <div className="space-y-3">
                    {/* Current Caster Info - simpler */}
                    <div className="flex items-center justify-between border border-[var(--border)] rounded-lg p-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">
                            {currentCaster.user.display_name || currentCaster.user.username}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)] ml-6">
                          {currentCaster.user.email}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setManageCasterOpened(true)}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Thay đổi
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            if (currentCaster && match?.stream_key) {
                              try {
                                // Unassign stream key from match
                                await streamKeyService.unassignStreamKeyFromMatch(
                                  currentCaster.streamKey.id, 
                                  match.id
                                );
                                setCurrentCaster(null);
                                // Optionally show success message or reload parent
                                if (typeof onMatchCreated === 'function') {
                                  await onMatchCreated(match.id);
                                }
                              } catch (error) {
                                // Silently handle error
                              }
                            }
                          }}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Không có bình luận viên
                  <div className="space-y-3">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Trận đấu này chưa có bình luận viên
                      </AlertDescription>
                    </Alert>

                    <Button
                      type="button"
                      onClick={() => setManageCasterOpened(true)}
                      className="w-full"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm bình luận viên
                    </Button>
                  </div>
                )}

                {/* Caster Selection Modal */}
                {manageCasterOpened && (
                  <div className="mt-3 p-4 border rounded-lg bg-white/5">
                    <div className="space-y-3">
                      {loadingCasters ? (
                        <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                          <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                          Đang tải danh sách bình luận viên...
                        </div>
                      ) : castersWithStreamKeys.length > 0 ? (
                        <div>
                          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                            Chọn bình luận viên
                          </label>
                          <Select
                            value={currentCaster?.user._id || currentCaster?.user.id || ''}
                            onValueChange={(value) => {
                              const caster = castersWithStreamKeys.find(c => 
                                (c.user._id || c.user.id) === value
                              );
                              setCurrentCaster(caster || null);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="-- Chọn bình luận viên --" />
                            </SelectTrigger>
                            <SelectContent
                              style={{ 
                                backgroundColor: 'var(--card-bg)', 
                                border: '1px solid var(--border)' 
                              }}
                            >
                              {castersWithStreamKeys.map((caster) => (
                                <SelectItem 
                                  key={caster.user._id || caster.user.id} 
                                  value={caster.user._id || caster.user.id || ''}
                                >
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary">
                                      {caster.user.display_name || caster.user.username}
                                    </Badge>
                                    <span className="text-xs text-[var(--muted-foreground)]">
                                      ({caster.user.email})
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {/* Selected Caster Info */}
                          {currentCaster && (
                            <Card className="mt-3 bg-[var(--muted)]/50">
                              <CardContent className="p-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-[var(--accent)]" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-[var(--foreground)]">
                                      {currentCaster.user.display_name || currentCaster.user.username}
                                    </div>
                                    <div className="text-xs text-[var(--muted-foreground)]">
                                      {currentCaster.user.email}
                                    </div>
                                  </div>
                                  <Badge variant="outline">
                                    Có stream key
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-[var(--muted-foreground)] text-sm bg-[var(--muted)]/50 rounded-lg">
                          <div className="text-2xl mb-2">🎙️</div>
                          Không có caster nào có stream key active
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setManageCasterOpened(false)}
                          className="flex-1"
                        >
                          Đóng
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={async () => {
                            if (currentCaster && match) {
                              try {
                                // Assign stream key to match
                                await streamKeyService.addMatchesToStreamKey(
                                  currentCaster.streamKey.id, 
                                  [match.id]
                                );
                                setManageCasterOpened(false);
                                // Optionally show success message or reload parent
                                if (typeof onMatchCreated === 'function') {
                                  await onMatchCreated(match.id);
                                }
                              } catch (error) {
                                // Silently handle error
                              }
                            }
                          }}
                          disabled={!currentCaster}
                          className="flex-1"
                        >
                          Áp dụng
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Basic Match Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Ngày thi đấu *
              </label>
              <Input
                type="date"
                value={formData.match_date}
                onChange={(e) => handleInputChange('match_date', e.target.value)}
                placeholder="DD/MM/YYYY"
                className={errors.match_date ? 'border-red-500' : ''}
              />
              {errors.match_date && <p className="text-red-400 text-sm mt-1">{errors.match_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Giờ thi đấu *
              </label>
              <Input
                type="time"
                value={formData.match_time}
                onChange={(e) => handleInputChange('match_time', e.target.value)}
                className={errors.match_time ? 'border-red-500' : ''}
              />
              {errors.match_time && <p className="text-red-400 text-sm mt-1">{errors.match_time}</p>}
            </div>
          </div>

          {/* Teams Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Home Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5" />
                  Đội nhà
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Tên đội *
                  </label>
                  <Input
                    value={formData.home_team.name}
                    onChange={(e) => handleTeamChange('home_team', 'name', e.target.value)}
                    placeholder="Manchester United"
                    className={errors.home_team_name ? 'border-red-500' : ''}
                  />
                  {errors.home_team_name && <p className="text-red-400 text-sm mt-1">{errors.home_team_name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Logo đội
                  </label>
                  <Input
                    type="url"
                    value={formData.home_team.logo}
                    onChange={(e) => handleTeamChange('home_team', 'logo', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Away Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5" />
                  Đội khách
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Tên đội *
                  </label>
                  <Input
                    value={formData.away_team.name}
                    onChange={(e) => handleTeamChange('away_team', 'name', e.target.value)}
                    placeholder="Liverpool FC"
                    className={errors.away_team_name ? 'border-red-500' : ''}
                  />
                  {errors.away_team_name && <p className="text-red-400 text-sm mt-1">{errors.away_team_name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Logo đội
                  </label>
                  <Input
                    type="url"
                    value={formData.away_team.logo}
                    onChange={(e) => handleTeamChange('away_team', 'logo', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* League Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5" />
                Giải đấu
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Tên giải đấu *
                </label>
                <Input
                  value={formData.league.name}
                  onChange={(e) => handleLeagueChange('name', e.target.value)}
                  placeholder="Premier League"
                  className={errors.league_name ? 'border-red-500' : ''}
                />
                {errors.league_name && <p className="text-red-400 text-sm mt-1">{errors.league_name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Logo giải đấu
                </label>
                <Input
                  type="url"
                  value={formData.league.logo}
                  onChange={(e) => handleLeagueChange('logo', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </CardContent>
          </Card>

          {/* Match Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Trạng thái
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value as MatchStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  border: '1px solid var(--border)' 
                }}>
                  <SelectItem value={MatchStatus.SCHEDULED}>Sắp diễn ra</SelectItem>
                  <SelectItem value={MatchStatus.LIVE}>Đang diễn ra</SelectItem>
                  <SelectItem value={MatchStatus.FINISHED}>Đã kết thúc</SelectItem>
                  <SelectItem value={MatchStatus.CANCELLED}>Đã hủy</SelectItem>
                  <SelectItem value={MatchStatus.NOT_STARTED}>Chưa bắt đầu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Loại trận đấu
              </label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value as MatchType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  border: '1px solid var(--border)' 
                }}>
                  <SelectItem value={MatchType.LEAGUE}>Giải đấu</SelectItem>
                  <SelectItem value={MatchType.CUP}>Cúp</SelectItem>
                  <SelectItem value={MatchType.FRIENDLY}>Giao hữu</SelectItem>
                  <SelectItem value={MatchType.CHAMPIONSHIP}>Championship</SelectItem>
                  <SelectItem value={MatchType.INTERNATIONAL}>Quốc tế</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Sân vận động
              </label>
              <Input
                value={formData.venue || ''}
                onChange={(e) => handleInputChange('venue', e.target.value)}
                placeholder="Old Trafford"
              />
            </div>
          </div>

          {/* Score Section */}
          <Card className="border-[var(--accent)]/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5" />
                Tỉ số trận đấu
              </CardTitle>
              <CardDescription>
                Cập nhật tỉ số cho trận đấu (đặc biệt cho các trận đang diễn ra hoặc đã kết thúc)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Home Score */}
                <div className="flex flex-col items-center p-4 bg-[var(--muted)]/30 rounded-lg">
                  <div className="text-sm font-medium text-[var(--muted-foreground)] mb-2">
                    Tỉ số đội nhà
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)] mb-3">
                    {formData.home_team.name || 'Đội nhà'}
                  </div>
                  <Input
                    type="number"
                    min="0"
                    max="99"
                    value={formData.home_score}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      handleInputChange('home_score', Math.max(0, Math.min(99, value)));
                    }}
                    className="text-center text-3xl font-bold w-24 h-16"
                    placeholder="0"
                  />
                </div>

                {/* Score Separator */}
                <div className="flex flex-col items-center p-4 bg-[var(--muted)]/30 rounded-lg">
                  <div className="text-sm font-medium text-[var(--muted-foreground)] mb-2">
                    Tỉ số đội khách
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)] mb-3">
                    {formData.away_team.name || 'Đội khách'}
                  </div>
                  <Input
                    type="number"
                    min="0"
                    max="99"
                    value={formData.away_score}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      handleInputChange('away_score', Math.max(0, Math.min(99, value)));
                    }}
                    className="text-center text-3xl font-bold w-24 h-16"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Score Preview */}
              <div className="mt-4 p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-right flex-1">
                    <div className="font-medium text-lg">{formData.home_team.name || 'Đội nhà'}</div>
                  </div>
                  <div className="flex items-center gap-2 px-6 py-3 bg-[var(--muted)] rounded-lg">
                    <span className="text-3xl font-bold">{formData.home_score}</span>
                    <span className="text-2xl text-[var(--muted-foreground)]">-</span>
                    <span className="text-3xl font-bold">{formData.away_score}</span>
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-lg">{formData.away_team.name || 'Đội khách'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Mô tả
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="Mô tả về trận đấu..."
            />
          </div>


          {/* Caster Assignment Section - Only for new matches */}
          {!match && (
            <Card className="border-[var(--accent)]/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5" />
                  Lên lịch cho bình luận viên
                </CardTitle>
                <CardDescription>
                  Thêm trận đấu này vào lịch của bình luận viên có stream key
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="assignToCaster"
                    checked={assignToCaster}
                    onChange={(e) => {
                      setAssignToCaster(e.target.checked);
                      if (!e.target.checked) {
                        setSelectedCaster(null);
                      }
                    }}
                    className="rounded"
                  />
                  <label htmlFor="assignToCaster" className="text-sm font-medium">
                    Lên lịch cho bình luận viên ngay khi tạo trận đấu
                  </label>
                </div>

                {assignToCaster && (
                  <div className="space-y-4">
                    {loadingCasters ? (
                      <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                        <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                        Đang tải danh sách bình luận viên...
                      </div>
                    ) : castersWithStreamKeys.length > 0 ? (
                      <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                          Chọn bình luận viên *
                        </label>
                        <Select
                          value={selectedCaster?.user._id || selectedCaster?.user.id || ''}
                          onValueChange={(value) => {
                            const caster = castersWithStreamKeys.find(c => 
                              (c.user._id || c.user.id) === value
                            );
                            setSelectedCaster(caster || null);
                          }}
                        >
                          <SelectTrigger className={errors.caster ? 'border-red-500' : ''}>
                            <SelectValue placeholder="-- Chọn bình luận viên --" />
                          </SelectTrigger>
                          <SelectContent style={{ 
                            backgroundColor: 'var(--card-bg)', 
                            border: '1px solid var(--border)' 
                          }}>
                            {castersWithStreamKeys.map((casterData) => (
                              <SelectItem 
                                key={casterData.user._id || casterData.user.id} 
                                value={casterData.user._id || casterData.user.id || ''}
                              >
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">CASTER</Badge>
                                  {casterData.user.display_name || casterData.user.username}
                                  <span className="text-xs text-[var(--muted-foreground)]">
                                    ({casterData.user.email})
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.caster && <p className="text-red-400 text-sm mt-1">{errors.caster}</p>}
                      </div>
                    ) : (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Không có bình luận viên nào có stream key để lên lịch. 
                          Vui lòng tạo stream key cho caster trước.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Selected Caster Info */}
                    {selectedCaster && (
                      <Card className="bg-[var(--muted)]/50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Bình luận viên sẽ được lên lịch
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-[var(--muted-foreground)]">Tên:</span>
                              <span className="ml-2 font-medium">
                                {selectedCaster.user.display_name || selectedCaster.user.username}
                              </span>
                            </div>
                            <div>
                              <span className="text-[var(--muted-foreground)]">Email:</span>
                              <span className="ml-2">{selectedCaster.user.email}</span>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t">
                            <div className="text-xs text-[var(--muted-foreground)] mb-1">Stream Key:</div>
                            <code className="text-xs bg-[var(--background)] p-2 rounded border break-all block">
                              {selectedCaster.streamKey.key_value}
                            </code>
                            <div className="text-xs text-[var(--muted-foreground)] mt-1">
                              RTMP: {selectedCaster.streamKey.rtmp_url}
                            </div>
                          </div>
                          
                          <Alert className="mt-2">
                            <AlertDescription className="text-xs">
                              ⚠️ Stream key này sẽ được gán cho trận đấu mới
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </form>

        <DialogFooter className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang xử lý...
              </div>
            ) : (
              match ? 'Cập nhật' : 'Tạo trận đấu'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MatchForm;
