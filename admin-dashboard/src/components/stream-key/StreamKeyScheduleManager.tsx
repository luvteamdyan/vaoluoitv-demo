'use client';

import { useState, useEffect } from 'react';
import { StreamKey } from '@/types/stream-key';
import { streamKeyService } from '@/services/streamKeyService';
import { matchService } from '@/services/matchService';
import { formatMatchDateTime } from '@/utils/dateFormatter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import MatchSearchSelector from '@/components/match/MatchSearchSelector';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Users,
  PlayCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface StreamKeyScheduleManagerProps {
  streamKey: StreamKey;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StreamKeyScheduleManager({ 
  streamKey, 
  isOpen, 
  onClose, 
  onSuccess 
}: StreamKeyScheduleManagerProps) {
  const [selectedMatches, setSelectedMatches] = useState<unknown[]>([]);
  const [matchesToRemove, setMatchesToRemove] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'time'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedMatches([]);
      setMatchesToRemove(new Set());
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  const handleAddMatches = async () => {
    if (selectedMatches.length === 0) {
      setError('Vui lòng chọn ít nhất 1 trận đấu để thêm vào lịch');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const matchIds = selectedMatches
        .map(match => (match as { id?: string; _id?: string }).id || (match as { id?: string; _id?: string })._id)
        .filter((id): id is string => !!id);
      await streamKeyService.addMatchesToStreamKey(streamKey.id, matchIds);
      
      setSuccessMessage(`Đã thêm ${selectedMatches.length} trận đấu vào lịch stream key!`);
      setSelectedMatches([]);
      onSuccess();
      
      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi thêm trận đấu');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMatches = async () => {
    if (matchesToRemove.size === 0) {
      setError('Vui lòng chọn ít nhất 1 trận đấu để xóa khỏi lịch');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const matchIds = Array.from(matchesToRemove);
      
      // Thực hiện cả 3 hành động cho từng match:
      // 1. Xóa trận đấu khỏi lịch stream key
      // 2. Bỏ gán stream key khỏi match
      // 3. Cập nhật match với is_featured = false
      
      for (const matchId of matchIds) {
        // 1. Xóa khỏi lịch stream key
        await streamKeyService.removeMatchesFromStreamKey(streamKey.id, [matchId]);
        
        // 2. Bỏ gán stream key khỏi match
        await streamKeyService.unassignStreamKeyFromMatch(streamKey.id, matchId);
        
        // 3. Cập nhật match với is_featured = false
        await matchService.updateMatch(matchId, { is_featured: false });
      }
      
      setSuccessMessage(`Đã xóa ${matchesToRemove.size} trận đấu khỏi lịch và bỏ gán thành công!`);
      setMatchesToRemove(new Set());
      onSuccess();
      
      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa trận đấu');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSelect = (match: unknown) => {
    if (!match) return;
    
    const m = match as { id?: string; _id?: string };
    // Check if match already selected
    const alreadySelected = selectedMatches.some(item => {
      const i = item as { id?: string; _id?: string };
      return (i.id || i._id) === (m.id || m._id);
    });
    
    if (!alreadySelected) {
      setSelectedMatches(prev => [...prev, match]);
    }
  };

  const removeSelectedMatch = (matchId: string) => {
    setSelectedMatches(prev => prev.filter(item => {
      const m = item as { id?: string; _id?: string };
      return (m.id || m._id) !== matchId;
    }));
  };

  const toggleMatchForRemoval = (matchId: string) => {
    setMatchesToRemove(prev => {
      const newSet = new Set(prev);
      if (newSet.has(matchId)) {
        newSet.delete(matchId);
      } else {
        newSet.add(matchId);
      }
      return newSet;
    });
  };


  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { variant: 'secondary' as const, icon: Clock, text: 'Đã lên lịch' },
      live: { variant: 'default' as const, icon: PlayCircle, text: 'Đang live' },
      finished: { variant: 'outline' as const, icon: CheckCircle2, text: 'Đã kết thúc' },
      cancelled: { variant: 'destructive' as const, icon: AlertTriangle, text: 'Đã hủy' },
      not_started: { variant: 'secondary' as const, icon: Clock, text: 'Chưa bắt đầu' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  // Sort matches based on current sort settings
  const currentMatches = streamKey.matches || [];
  const sortedMatches = [...currentMatches].sort((a, b) => {
    const matchA = a as { match_date?: string; match_time?: string };
    const matchB = b as { match_date?: string; match_time?: string };
    
    let aValue = '';
    let bValue = '';
    
    if (sortBy === 'date') {
      aValue = matchA.match_date || '';
      bValue = matchB.match_date || '';
    } else if (sortBy === 'time') {
      aValue = matchA.match_time || '';
      bValue = matchB.match_time || '';
    }
    
    if (sortOrder === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const handleSortChange = (newSortBy: 'date' | 'time') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Quản lý lịch trận đấu
          </DialogTitle>
          <DialogDescription>
            Lên lịch và quản lý các trận đấu cho stream key của{' '}
            {streamKey.user ? 
              streamKey.user.display_name || streamKey.user.username : 
              (typeof streamKey.user_id === 'object' && streamKey.user_id ? 
                streamKey.user_id.display_name || streamKey.user_id.username : 
                'bình luận viên')
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Success/Error Messages */}
          {successMessage && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Current Schedule */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Lịch hiện tại ({currentMatches.length} trận)
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--muted-foreground)] mr-2">Sắp xếp:</span>
                  <Button
                    variant={sortBy === 'date' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSortChange('date')}
                    className="flex items-center gap-1"
                  >
                    <Calendar className="w-3 h-3" />
                    Ngày
                    {sortBy === 'date' && (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    variant={sortBy === 'time' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSortChange('time')}
                    className="flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" />
                    Giờ
                    {sortBy === 'time' && (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {currentMatches.length > 0 ? (
                <div className="space-y-3">
                  {sortedMatches.map((matchItem: unknown, index: number) => {
                    const match = matchItem as { _id?: string; id?: string; home_team?: { name?: string }; away_team?: { name?: string }; status?: string; match_date?: string; match_time?: string };
                    const matchId = match._id || match.id || '';
                    return (
                    <div 
                      key={matchId || index} 
                      className={`p-3 border rounded-lg transition-colors ${
                        matchesToRemove.has(matchId) 
                          ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {match.home_team?.name || 'Team A'} vs {match.away_team?.name || 'Team B'}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(match.status || 'scheduled')}
                            <span className="text-xs text-[var(--muted-foreground)]">
                              {match.match_date ? formatMatchDateTime(match.match_date, match.match_time || '') : 'N/A'}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant={matchesToRemove.has(matchId) ? "destructive" : "ghost"}
                          size="sm"
                          onClick={() => toggleMatchForRemoval(matchId)}
                          disabled={loading}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          {matchesToRemove.has(matchId) ? 'Đã chọn' : 'Xóa'}
                        </Button>
                      </div>
                    </div>
                  );})}
                  
                  {matchesToRemove.size > 0 && (
                    <div className="pt-3 border-t">
                      <Button 
                        variant="destructive" 
                        onClick={handleRemoveMatches}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Đang xóa...
                          </div>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa {matchesToRemove.size} trận đã chọn
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-[var(--muted-foreground)]">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Chưa có trận đấu nào trong lịch</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add New Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Thêm trận đấu mới
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MatchSearchSelector
                onMatchSelect={handleMatchSelect}
                selectedMatch={null}
                placeholder="Tìm kiếm trận đấu để thêm vào lịch..."
                includeMatchesWithoutCommentator={true}
              />

              {selectedMatches.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm font-medium">
                    Trận đấu đã chọn ({selectedMatches.length}):
                  </div>
                  {selectedMatches.map((matchItem, index) => {
                    const match = matchItem as { _id?: string; id?: string; home_team?: { name?: string }; away_team?: { name?: string }; status?: string; match_date?: string; match_time?: string };
                    const matchId = match.id || match._id || '';
                    return (
                    <div key={matchId || index} className="p-3 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {match.home_team?.name || 'Team A'} vs {match.away_team?.name || 'Team B'}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(match.status || 'scheduled')}
                            <span className="text-xs text-[var(--muted-foreground)]">
                              {match.match_date ? formatMatchDateTime(match.match_date, match.match_time || '') : 'N/A'}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSelectedMatch(matchId)}
                          disabled={loading}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );})}

                  <Button 
                    onClick={handleAddMatches}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang thêm...
                      </div>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm {selectedMatches.length} trận vào lịch
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
