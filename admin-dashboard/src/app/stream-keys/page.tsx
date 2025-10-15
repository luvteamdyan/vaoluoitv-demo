'use client';

import { useState, useEffect, useCallback } from 'react';
import { StreamKey, CreateStreamKeyDto, StreamKeyQueryDto } from '@/types/stream-key';
import { streamKeyService } from '@/services/streamKeyService';
import { matchService } from '@/services/matchService';
import { formatMatchDateTime } from '@/utils/dateFormatter';
import { MatchStatus } from '@/types/match';
import StreamKeyTable from '@/components/stream-key/StreamKeyTableClean';
import StreamKeyForm from '@/components/stream-key/StreamKeyFormImproved';
import StreamKeyEditForm from '@/components/stream-key/StreamKeyEditForm';
import StreamKeyScheduleManager from '@/components/stream-key/StreamKeyScheduleManager';
import StreamKeyFilters from '@/components/stream-key/StreamKeyFiltersImproved';
import EditBlvForm from '@/components/stream-key/EditBlvForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Toast } from '@/components/ui/toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Key, SquarePlus, RefreshCw, AlertTriangle, Play, Square, X, Calendar, Clock, ArrowUp, ArrowDown } from 'lucide-react';

export default function StreamKeysPage() {
  const [streamKeys, setStreamKeys] = useState<StreamKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStreamKey, setEditingStreamKey] = useState<StreamKey | null>(null);
  const [editingBlvStreamKey, setEditingBlvStreamKey] = useState<StreamKey | null>(null);
  const [managingScheduleStreamKey, setManagingScheduleStreamKey] = useState<StreamKey | null>(null);
  const [viewingMatchesStreamKey, setViewingMatchesStreamKey] = useState<StreamKey | null>(null);
  const [streamKeyMatches, setStreamKeyMatches] = useState<unknown[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [matchSortBy, setMatchSortBy] = useState<'date' | 'time'>('date');
  const [matchSortOrder, setMatchSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [filters, setFilters] = useState<StreamKeyQueryDto>({
    page: 1,
    limit: 10,
  });
  
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
  });

  const loadData = useCallback(async (currentFilters: StreamKeyQueryDto) => {
    try {
      setLoading(true);
      setError(null);
      const response = await streamKeyService.getAll(currentFilters);
      setStreamKeys(response.streamKeys);
      
      // Tính toán lại totalPages vì backend có thể trả về sai
      const correctTotalPages = Math.ceil(response.total / (currentFilters.limit || 10));
      setPagination({
        total: response.total,
        totalPages: correctTotalPages,
        currentPage: response.page,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải stream keys');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array

  useEffect(() => {
    loadData(filters);
  }, [filters, loadData]);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleCreateStreamKey = async (streamKeyData: CreateStreamKeyDto) => {
    try {
      await streamKeyService.create(streamKeyData);
      setShowForm(false);
      setSuccessMessage('Stream key đã được tạo thành công!');
      await loadData(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo stream key');
    }
  };


  const handleEditStreamKey = (streamKey: StreamKey) => {
    setEditingStreamKey(streamKey);
  };

  const handleEditSuccess = () => {
    setSuccessMessage('Stream key đã được cập nhật thành công!');
    loadData(filters);
  };

  const handleEditBlv = (streamKey: StreamKey) => {
    setEditingBlvStreamKey(streamKey);
  };

  const handleEditBlvSuccess = () => {
    setSuccessMessage('Tên bình luận viên đã được cập nhật thành công!');
    loadData(filters);
  };

  const handleManageSchedule = (streamKey: StreamKey) => {
    setManagingScheduleStreamKey(streamKey);
  };

  const handleScheduleSuccess = () => {
    setSuccessMessage('Lịch trận đấu đã được cập nhật thành công!');
    loadData(filters);
  };

  const handleMatchSortChange = (newSortBy: 'date' | 'time') => {
    if (matchSortBy === newSortBy) {
      setMatchSortOrder(matchSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setMatchSortBy(newSortBy);
      setMatchSortOrder('asc');
    }
  };

  const sortedStreamKeyMatches = [...streamKeyMatches].sort((a, b) => {
    const matchA = a as { match_date?: string; match_time?: string };
    const matchB = b as { match_date?: string; match_time?: string };
    
    let aValue = '';
    let bValue = '';
    
    if (matchSortBy === 'date') {
      aValue = matchA.match_date || '';
      bValue = matchB.match_date || '';
    } else if (matchSortBy === 'time') {
      aValue = matchA.match_time || '';
      bValue = matchB.match_time || '';
    }
    
    if (matchSortOrder === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const handleViewMatches = async (streamKey: StreamKey) => {
    setViewingMatchesStreamKey(streamKey);
    setLoadingMatches(true);
    try {
      const response = await streamKeyService.getMatchesByStreamKey(streamKey.id);
      setStreamKeyMatches(response.matches || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải matches');
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleDeleteStreamKey = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa stream key này?')) {
      return;
    }
    
    try {
      await streamKeyService.delete(id);
      setSuccessMessage('Stream key đã được xóa thành công!');
      await loadData(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa stream key');
    }
  };

  const handleStartStream = async (streamKey: StreamKey & { selectedMatch?: unknown }) => {
    const match = streamKey.selectedMatch;
    if (!match) return;
    
    const matchInfo = match as { home_team: { name: string }; away_team: { name: string }; _id?: string; id?: string };
    
    if (confirm(`Bạn có chắc chắn muốn bắt đầu phát sóng trận ${matchInfo.home_team.name} vs ${matchInfo.away_team.name}?`)) {
      try {
        const matchId = matchInfo._id || matchInfo.id;
        if (matchId) {
          // Sử dụng matchService để cập nhật status trận đấu trực tiếp
          await matchService.updateMatch(matchId, {
            status: MatchStatus.LIVE,
            status_code: 'LIVE'
          });
          setSuccessMessage(`Đã bắt đầu phát sóng trận ${matchInfo.home_team.name} vs ${matchInfo.away_team.name}`);
          await loadData(filters);
        } else {
          setError('Không tìm thấy ID của trận đấu');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi bắt đầu phát sóng');
      }
    }
  };

  const handleStopStream = async (streamKey: StreamKey & { selectedMatch?: unknown }) => {
    const match = streamKey.selectedMatch;
    if (!match) return;
    
    const matchInfo = match as { home_team: { name: string }; away_team: { name: string }; _id?: string; id?: string };
    
    if (confirm(`Bạn có chắc chắn muốn dừng phát sóng trận ${matchInfo.home_team.name} vs ${matchInfo.away_team.name}?`)) {
      try {
        const matchId = matchInfo._id || matchInfo.id;
        if (matchId) {
          // Sử dụng matchService để cập nhật status trận đấu trực tiếp
          await matchService.updateMatch(matchId, {
            status: MatchStatus.FINISHED,
            status_code: 'FT',
            is_featured: false
          });
          setSuccessMessage(`Đã dừng phát sóng trận ${matchInfo.home_team.name} vs ${matchInfo.away_team.name}`);
          await loadData(filters);
        } else {
          setError('Không tìm thấy ID của trận đấu');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi dừng phát sóng');
      }
    }
  };

  // Xử lý thay đổi filters
  const handleFiltersChange = (newFilters: StreamKeyQueryDto) => {
    setFilters(newFilters);
  };

  // Xử lý reset filters
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
    });
  };

  return (
    <div className="p-4 md:p-6 min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2 text-[var(--foreground)]">
              <Key className="w-8 h-8" /> 
              Quản lý Bình luận viên
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Tạo và quản lý stream keys cho bình luận viên phát sóng trận đấu
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => loadData(filters)}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </Button>
            
            <Button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2"
            >
              <SquarePlus className="w-4 h-4" />
              Tạo Stream Key cho Bình luận viên
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setError(null)}
              className="h-6 w-6 ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {successMessage && (
        <Toast variant="success" className="mb-6" onClose={() => setSuccessMessage(null)}>
          <div>
            <p className="font-medium">Thành công!</p>
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        </Toast>
      )}




      {/* Combined Filter and Table */}
      <Card className="overflow-hidden">
        {/* Filters */}
        <CardHeader className="border-b">
          <StreamKeyFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
            onCreateStreamKey={() => setShowForm(true)}
          />
        </CardHeader>

        {/* Stream Keys Table */}
        <CardContent className="p-0">
          <StreamKeyTable
            streamKeys={streamKeys}
            loading={loading}
            onDelete={handleDeleteStreamKey}
            onEdit={handleEditStreamKey}
            onEditBlv={handleEditBlv}
            onManageSchedule={handleManageSchedule}
            onStartStream={handleStartStream}
            onStopStream={handleStopStream}
            onViewMatches={handleViewMatches}
          />
        </CardContent>
      </Card>

      {/* Pagination Info & Controls */}
      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="text-sm text-[var(--muted-foreground)]">
          Hiển thị {streamKeys.length} trong tổng số {pagination.total} stream keys
          (Trang {filters.page || 1} / {pagination.totalPages})
        </div>
        {pagination.totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, page: 1 }))}
              disabled={(filters.page || 1) === 1}
            >
              ««
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
              disabled={(filters.page || 1) === 1}
            >
              Trước
            </Button>
            
            <div className="flex items-center gap-1">
              {(() => {
                const pages = [];
                const maxVisiblePages = 7;
                const currentPageNum = filters.page || 1;
                const totalPages = pagination.totalPages;
                
                if (totalPages <= maxVisiblePages) {
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  const halfVisible = Math.floor(maxVisiblePages / 2);
                  let startPage = Math.max(1, currentPageNum - halfVisible);
                  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  
                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }
                  
                  if (startPage > 1) {
                    pages.push(1);
                    if (startPage > 2) {
                      pages.push('...');
                    }
                  }
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                  }
                  
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push('...');
                    }
                    pages.push(totalPages);
                  }
                }
                
                return pages.map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm text-[var(--muted-foreground)]">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPageNum === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, page: page as number }))}
                    >
                      {page}
                    </Button>
                  )
                ));
              })()}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
              disabled={(filters.page || 1) >= pagination.totalPages}
            >
              Sau
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, page: pagination.totalPages }))}
              disabled={(filters.page || 1) === pagination.totalPages}
            >
              »»
            </Button>
          </div>
        )}
      </div>

      {/* Stream Key Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Tạo Stream Key mới
            </DialogTitle>
            <DialogDescription>
              Tạo stream key cho bình luận viên để phát sóng trực tiếp
            </DialogDescription>
          </DialogHeader>
          <StreamKeyForm
            onSubmit={handleCreateStreamKey}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Stream Key Edit Modal */}
      {editingStreamKey && (
        <StreamKeyEditForm
          streamKey={editingStreamKey}
          isOpen={!!editingStreamKey}
          onClose={() => setEditingStreamKey(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Schedule Management Modal */}
      {managingScheduleStreamKey && (
        <StreamKeyScheduleManager
          streamKey={managingScheduleStreamKey}
          isOpen={!!managingScheduleStreamKey}
          onClose={() => setManagingScheduleStreamKey(null)}
          onSuccess={handleScheduleSuccess}
        />
      )}


      {/* Edit BLV Modal */}
      {editingBlvStreamKey && (
        <EditBlvForm
          streamKey={editingBlvStreamKey}
          isOpen={!!editingBlvStreamKey}
          onClose={() => setEditingBlvStreamKey(null)}
          onSuccess={handleEditBlvSuccess}
        />
      )}

      {/* View Matches Modal */}
      <Dialog open={!!viewingMatchesStreamKey} onOpenChange={() => {
        setViewingMatchesStreamKey(null);
        setStreamKeyMatches([]);
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Trận đấu đã được lên lịch cho bình luận viên.
              </DialogTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--muted-foreground)] mr-2">Sắp xếp:</span>
                <Button
                  variant={matchSortBy === 'date' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleMatchSortChange('date')}
                  className="flex items-center gap-1"
                >
                  <Calendar className="w-3 h-3" />
                  Ngày
                  {matchSortBy === 'date' && (
                    matchSortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  variant={matchSortBy === 'time' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleMatchSortChange('time')}
                  className="flex items-center gap-1"
                >
                  <Clock className="w-3 h-3" />
                  Giờ
                  {matchSortBy === 'time' && (
                    matchSortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            {loadingMatches ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto mb-2"></div>
                <div className="text-[var(--muted-foreground)]">Đang tải matches...</div>
              </div>
            ) : streamKeyMatches.length > 0 ? (
              <div className="space-y-4">
                {sortedStreamKeyMatches.map((match, index) => {
                  const matchData = match as { 
                    _id?: string; 
                    id?: string;
                    home_team: { name: string };
                    away_team: { name: string };
                    league: { name: string };
                    match_date: string;
                    match_time: string;
                    status: string;
                    status_code?: string;
                    home_score?: number;
                    away_score?: number;
                  };
                  
                  return (
                    <Card key={matchData._id || matchData.id || index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-lg">
                              {matchData.home_team.name} vs {matchData.away_team.name}
                            </div>
                            <div className="text-sm text-[var(--muted-foreground)] mt-1">
                              {matchData.league.name} • {formatMatchDateTime(matchData.match_date, matchData.match_time)}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                matchData.status === 'live' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                matchData.status === 'scheduled' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                matchData.status === 'finished' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                              }`}>
                                {matchData.status}
                              </span>
                              {matchData.status_code && (
                                <span className="px-2 py-1 text-xs bg-[var(--muted)] text-[var(--muted-foreground)] rounded-full">
                                  {matchData.status_code}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-sm text-[var(--muted-foreground)]">
                              Score: {matchData.home_score || 0} - {matchData.away_score || 0}
                            </div>
                            <div className="flex gap-2">
                              {matchData.status === 'scheduled' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStartStream({ 
                                    ...viewingMatchesStreamKey!, 
                                    selectedMatch: match 
                                  })}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Play className="w-3 h-3 mr-1" />
                                  Phát sóng
                                </Button>
                              )}
                              {matchData.status === 'not_started' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStartStream({ 
                                    ...viewingMatchesStreamKey!, 
                                    selectedMatch: match 
                                  })}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Play className="w-3 h-3 mr-1" />
                                  Phát sóng
                                </Button>
                              )}
                              {matchData.status === 'live' && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleStopStream({ 
                                    ...viewingMatchesStreamKey!, 
                                    selectedMatch: match 
                                  })}
                                >
                                  <Square className="w-3 h-3 mr-1" />
                                  Dừng sóng
                                </Button>
                              )}
                              {matchData.status === 'finished' && (
                                <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 border border-gray-200 rounded dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/30">
                                  Đã kết thúc
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Key className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
                <div className="text-[var(--muted-foreground)]">Không có matches nào được gán cho stream key này</div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}