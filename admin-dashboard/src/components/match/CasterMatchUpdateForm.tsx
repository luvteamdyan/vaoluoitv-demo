'use client';

import React, { useState, useEffect } from 'react';
import { Match, UpdateMatchDto, MatchStatus } from '@/types/match';
import { formatDateToVietnamese, convertHtmlDateToBackendFormat, convertBackendDateToHtmlFormat } from '@/utils/dateFormatter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Star,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  X
} from 'lucide-react';

interface CasterMatchUpdateFormProps {
  isOpen: boolean;
  match: Match | null;
  onSubmit: (matchData: UpdateMatchDto) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const CasterMatchUpdateForm: React.FC<CasterMatchUpdateFormProps> = ({
  isOpen,
  match,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [formData, setFormData] = useState<UpdateMatchDto>({
    home_team: undefined,
    away_team: undefined,
    league: undefined,
    match_time: '',
    match_date: '',
    venue: '',
    status: MatchStatus.SCHEDULED,
    home_score: 0,
    away_score: 0,
    is_active: true,
    is_featured: false,
    description: '',
    tags: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});


  // Load form data when match changes
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
        home_score: match.home_score,
        away_score: match.away_score,
        is_active: match.is_active,
        is_featured: match.is_featured,
        description: match.description,
        tags: match.tags,
      });
    }
  }, [match]);

  const handleInputChange = (field: string, value: string | number | boolean | MatchStatus) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate scores
    if ((formData.home_score || 0) < 0 || (formData.away_score || 0) < 0) {
      newErrors.scores = 'Điểm số không được âm';
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
      // Convert HTML date format to backend format before submitting
      const submitData: UpdateMatchDto = {
        ...formData,
        match_date: convertHtmlDateToBackendFormat(formData.match_date || ''), // Convert YYYY-MM-DD to DD/MM/YYYY for backend
      };
      
      await onSubmit(submitData);
    } catch (error) {
      // Error handling is done in parent component
    }
  };


  if (!match) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--accent)]" />
            Cập nhật thông tin trận đấu
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin chi tiết của trận đấu {match.home_team.name} vs {match.away_team.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Match Info Card - Read Only */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5" />
                Thông tin trận đấu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Match Time - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Giờ thi đấu
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={formData.match_time}
                      disabled
                      className="bg-[var(--muted)] cursor-not-allowed flex-1"
                    />
                  </div>
                </div>

                {/* Match Date - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Ngày thi đấu
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={formData.match_date}
                      disabled
                      placeholder="DD/MM/YYYY"
                      className="bg-[var(--muted)] cursor-not-allowed flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Teams Info - Read Only */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Đội nhà
                  </label>
                  <Input
                    type="text"
                    value={formData.home_team?.name || ''}
                    disabled
                    className="bg-[var(--muted)] cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Đội khách
                  </label>
                  <Input
                    type="text"
                    value={formData.away_team?.name || ''}
                    disabled
                    className="bg-[var(--muted)] cursor-not-allowed"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status and Featured Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5" />
                Cài đặt trận đấu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    <Activity className="w-4 h-4 inline mr-1" />
                    Trạng thái trận đấu
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value as MatchStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ 
                      backgroundColor: 'var(--card-bg)', 
                      border: '1px solid var(--border)' 
                    }}>
                      <SelectItem value={MatchStatus.NOT_STARTED}>Chưa bắt đầu</SelectItem>
                      <SelectItem value={MatchStatus.SCHEDULED}>Đã lên lịch</SelectItem>
                      <SelectItem value={MatchStatus.LIVE}>Đang diễn ra</SelectItem>
                      <SelectItem value={MatchStatus.FINISHED}>Đã kết thúc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Is Featured */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    <Star className="w-4 h-4 inline mr-1" />
                    Trận nổi bật
                  </label>
                  <Select
                    value={formData.is_featured ? 'true' : 'false'}
                    onValueChange={(value) => handleInputChange('is_featured', value === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái nổi bật">
                        {formData.is_featured ? 'Nổi bật' : 'Không nổi bật'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent style={{ 
                      backgroundColor: 'var(--card-bg)', 
                      border: '1px solid var(--border)' 
                    }}>
                      <SelectItem value="false">Không nổi bật</SelectItem>
                      <SelectItem value="true">Nổi bật</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Card - Using MatchFormImproved style */}
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
                    {formData.home_team?.name || 'Đội nhà'}
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

                {/* Away Score */}
                <div className="flex flex-col items-center p-4 bg-[var(--muted)]/30 rounded-lg">
                  <div className="text-sm font-medium text-[var(--muted-foreground)] mb-2">
                    Tỉ số đội khách
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)] mb-3">
                    {formData.away_team?.name || 'Đội khách'}
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
                    <div className="font-medium text-lg">{formData.home_team?.name || 'Đội nhà'}</div>
                  </div>
                  <div className="flex items-center gap-2 px-6 py-3 bg-[var(--muted)] rounded-lg">
                    <span className="text-3xl font-bold">{formData.home_score}</span>
                    <span className="text-2xl text-[var(--muted-foreground)]">-</span>
                    <span className="text-3xl font-bold">{formData.away_score}</span>
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-lg">{formData.away_team?.name || 'Đội khách'}</div>
                  </div>
                </div>
              </div>
              {errors.scores && (
                <p className="text-red-500 text-sm mt-2 text-center">{errors.scores}</p>
              )}
            </CardContent>
          </Card>

          {/* Error Alert */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Vui lòng kiểm tra và sửa các lỗi trong form trước khi tiếp tục.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Đang cập nhật...' : 'Cập nhật trận đấu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CasterMatchUpdateForm;
