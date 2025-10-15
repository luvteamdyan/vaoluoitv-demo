'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Match, CreateMatchDto, UpdateMatchDto, MatchFilters, MatchStats, MatchStatus } from '@/types/match';
import { matchService } from '@/services/matchService';
import { streamKeyService } from '@/services/streamKeyService';
import MatchFiltersComponent from '@/components/match/MatchFilters';
import MatchTable from '@/components/match/MatchTable';
import MatchForm from '@/components/match/MatchFormImproved';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Toast } from '@/components/ui/toast';
import { Plus, Trophy, Clock, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';

/**
 * Trang quản lý matches với pagination, filtering và CRUD operations
 */
export default function MatchesPage() {
  // ==================== AUTH & ROLE ====================
  const { user } = useAuth();
  const userRole = user?.role as UserRole;
  
  // ==================== STATE MANAGEMENT ====================
  
  // Data states
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<MatchStats | null>(null);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  
  // Delete modal states
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; match: Match | null }>({ 
    isOpen: false, 
    match: null 
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Restore modal states
  const [restoreConfirm, setRestoreConfirm] = useState<{ isOpen: boolean; match: Match | null }>({ 
    isOpen: false, 
    match: null 
  });
  const [restoreLoading, setRestoreLoading] = useState(false);
  
  // Success notification states
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Pagination states
  const [filters, setFilters] = useState<MatchFilters>({
    page: 1,
    limit: 10,
    sort: 'asc', // Default sort by match time ascending  
    sort_by: 'match_date', // Sort by match time
    has_commentator: 'true', // Mặc định chỉ hiển thị trận đấu có bình luận viên
    // Để mặc định hiển thị tất cả trận đấu (bao gồm cả đã dừng hoạt động)
    // User có thể filter qua dropdown "Trạng thái" để xem cụ thể:
    // - "Tất cả" (undefined): Hiển thị tất cả trận đấu
    // - "Đang hoạt động" (true): Chỉ hiển thị trận đang hoạt động  
    // - "Đã dừng hoạt động" (false): Chỉ hiển thị trận đã dừng hoạt động
    // Loại bỏ status filter để hiển thị tất cả trận đấu theo thứ tự ưu tiên:
    // 1. Trận có bình luận viên (priority cao nhất)
    // 2. Trận status LIVE (trực tiếp) - priority 4
    // 3. Trận status SCHEDULED (lên lịch) - priority 3  
    // 4. Trận status NOT_STARTED (chưa bắt đầu) - priority 2
    // 5. Trận status FINISHED (kết thúc) - priority 1
  });

  const [totalMatches, setTotalMatches] = useState(0);
  const [, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<string>('match_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // ==================== DATA LOADING FUNCTIONS ====================

  /**
   * Load stats - chỉ chạy 1 lần duy nhất khi component mount
   */
  const loadStats = useCallback(async () => {
    try {
      const statsData = await matchService.getMatchStats();
      setStats(statsData);
    } catch (err) {
      // Silently handle error
    }
  }, []);

  /**
   * Load matches - chạy mỗi khi pagination hoặc filter thay đổi
   */
  const loadMatches = useCallback(async (currentFilters: MatchFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      // Chỉ gửi các filter mà backend hỗ trợ
      const backendFilters = {
        page: currentFilters.page,
        limit: currentFilters.limit,
        status: currentFilters.status,
        league_id: currentFilters.league_id,
        team_id: currentFilters.team_id,
        date: currentFilters.date,
        search: currentFilters.search,
        featured: currentFilters.featured,
        is_active: currentFilters.is_active,
        type: currentFilters.type,
        sort: currentFilters.sort,
        sort_by: currentFilters.sort_by,
        has_commentator: currentFilters.has_commentator,
      };
      
      
      const matchesData = await matchService.getAllMatches(backendFilters);
      
      // Cập nhật state với dữ liệu mới
      setMatches(matchesData.matches);
      setTotalMatches(matchesData.total);
      setCurrentPage(matchesData.page);
      
      // Tính toán lại totalPages vì backend có thể trả về sai
      const correctTotalPages = Math.ceil(matchesData.total / (currentFilters.limit || 10));
      setTotalPages(correctTotalPages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array

  // ==================== EFFECTS ====================

  // Load stats chỉ 1 lần duy nhất khi component mount
  useEffect(() => {
    loadStats();
  }, []); // Empty dependency array - chỉ chạy 1 lần

  // Load matches khi filters thay đổi
  useEffect(() => {
    loadMatches(filters);
  }, [filters, loadMatches]); // Dependency với loadMatches để eslint OK

  // ==================== SORT HANDLING ====================

  // Map UI field names to backend field names
  const getBackendFieldName = (uiField: string): string => {
    const fieldMap: { [key: string]: string } = {
      'match_teams': 'home_team.name', // Sort by home team name
      'league': 'league.name',
      'match_date': 'match_date', // Will use computed datetime sorting
      'match_time': 'match_time', // Will use computed datetime sorting
      'status': 'status',
      'commentator': 'stream_key_id.user.username', // Sort by caster username
    };
    return fieldMap[uiField] || uiField;
  };

  const handleSort = (field: string) => {
    let newSortOrder: 'asc' | 'desc' = 'asc';
    
    if (sortBy === field) {
      // Toggle sort order if same field
      newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    
    setSortBy(field);
    setSortOrder(newSortOrder);
    
    // Update filters with new sort
    const newFilters = {
      ...filters,
      sort: newSortOrder,
      sort_by: getBackendFieldName(field), // Send backend field name
      page: 1, // Reset to first page when sorting
    };
    
    setFilters(newFilters);
  };

  // ==================== CRUD OPERATIONS ====================

  /**
   * Xử lý tạo match mới với tích hợp stream key assignment
   */
  const handleCreateMatch = async (matchData: CreateMatchDto): Promise<void> => {
    try {
      // Extract stream key assignment info trước khi tạo match
      const streamKeyId = matchData.streamKeyId;
      const assignToCaster = matchData.assignToCaster;
      
      // Tạo pure match data (loại bỏ các field không được backend chấp nhận)
      const pureMatchData: CreateMatchDto = {
        home_team: matchData.home_team,
        away_team: matchData.away_team,
        league: matchData.league,
        match_time: matchData.match_time,
        match_date: matchData.match_date,
        venue: matchData.venue,
        status: matchData.status,
        type: matchData.type,
        home_score: matchData.home_score,
        away_score: matchData.away_score,
        is_active: matchData.is_active,
        is_featured: matchData.is_featured,
        description: matchData.description,
        tags: matchData.tags,
      };
      
      // 1. Tạo match trước (chỉ với pure match data)
      const createdMatch = await matchService.createMatch(pureMatchData);
      
      // 2. Nếu có lên lịch cho caster, thêm match vào lịch stream key
      if (assignToCaster && streamKeyId && createdMatch.id) {
        try {
          // Sử dụng POST /api/v1/stream-keys/:id/add-matches để thêm vào lịch
          await streamKeyService.addMatchesToStreamKey(streamKeyId, [createdMatch.id]);
          setSuccessMessage(`Trận đấu đã được tạo và lên lịch thành công cho bình luận viên!`);
        } catch (scheduleError) {
          // Không throw error ở đây để match vẫn được tạo thành công
          setError('Trận đấu đã được tạo nhưng có lỗi khi lên lịch. Vui lòng lên lịch thủ công.');
        }
      } else {
        setSuccessMessage(`Trận đấu đã được tạo thành công!`);
      }
      
      setShowForm(false);
      await loadMatches(filters); // Reload matches để hiển thị data mới
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo trận đấu';
      setError(errorMessage);
      throw err; // Re-throw để MatchForm có thể xử lý
    }
  };

  /**
   * Xử lý gán stream key cho match sau khi tạo (legacy - giữ lại cho backward compatibility)
   */
  const handleMatchCreated = async (matchId: string, streamKeyId?: string) => {
    // Logic này đã được tích hợp vào handleCreateMatch
    // Giữ lại function này để tránh break existing code
  };

  /**
   * Xử lý cập nhật match
   */
  const handleUpdateMatch = async (matchData: UpdateMatchDto): Promise<void> => {
    if (!editingMatch) return;
    
    try {
      await matchService.updateMatch(editingMatch.id, matchData);
      setEditingMatch(null);
      setShowForm(false);
      setSuccessMessage('Trận đấu đã được cập nhật thành công!');
      await loadMatches(filters); // Chỉ reload matches, không reload stats
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật trận đấu';
      setError(errorMessage);
      throw err; // Re-throw để MatchForm có thể xử lý
    }
  };

  /**
   * Xử lý xóa match - mở confirm modal
   */
  const handleDeleteMatch = (match: Match) => {
    setDeleteConfirm({ isOpen: true, match });
  };

  /**
   * Xác nhận xóa match
   * STAFF: Cập nhật status thành không hoạt động và xóa stream key
   * ADMIN: Xóa hoàn toàn trận đấu
   */
  const handleConfirmDelete = async () => {
    if (!deleteConfirm.match) return;

    setDeleteLoading(true);
    try {
      if (userRole === UserRole.STAFF) {
        // STAFF: Cập nhật status thành không hoạt động
        
        // 1. Cập nhật trận đấu thành không hoạt động với các status liên quan (ưu tiên làm trước)
        const updateData: UpdateMatchDto = {
          is_active: false,
          is_featured: false, // Set nổi bật về false
          status: MatchStatus.CANCELLED, // Đặt status thành cancelled
        };
        
        await matchService.updateMatch(deleteConfirm.match.id, updateData);
        
        // 2. Sau khi cập nhật match thành công, thực hiện cleanup stream key (nếu có)
        let streamKeyCleanupSuccess = true;
        if (deleteConfirm.match.stream_key) {
          try {
            // Lấy stream key ID từ match
            const streamKeyId = deleteConfirm.match.stream_key.id;
            
            if (streamKeyId) {
              await streamKeyService.unassignStreamKeyFromMatch(streamKeyId, deleteConfirm.match.id);
            }
          } catch (streamKeyError) {
            streamKeyCleanupSuccess = false;
          }
        }
        
        // Set success message dựa trên kết quả cleanup
        if (streamKeyCleanupSuccess) {
          setSuccessMessage('Trận đấu đã được đánh dấu không hoạt động, xóa lịch bình luận viên và gỡ nổi bật!');
        } else {
          setSuccessMessage('Trận đấu đã được đánh dấu không hoạt động và gỡ nổi bật (lưu ý: có thể chưa bỏ gán bình luận viên hoàn toàn)!');
        }
      } else {
        // ADMIN: Xóa hoàn toàn trận đấu
        await matchService.deleteMatch(deleteConfirm.match.id);
        setSuccessMessage('Trận đấu đã được xóa thành công!');
      }
      
      await loadMatches(filters); // Reload matches sau khi thao tác
      setDeleteConfirm({ isOpen: false, match: null }); // Close modal on success
    } catch (err) {
      const actionText = userRole === UserRole.STAFF ? 'đánh dấu không hoạt động' : 'xóa';
      const errorMessage = err instanceof Error ? err.message : `Có lỗi xảy ra khi ${actionText} trận đấu`;
      setError(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  /**
   * Hủy xóa match
   */
  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, match: null });
  };

  /**
   * Khởi tạo restore match
   */
  const handleRestoreMatch = (match: Match) => {
    setRestoreConfirm({ isOpen: true, match });
  };

  /**
   * Xác nhận restore match
   */
  const handleConfirmRestore = async () => {
    if (!restoreConfirm.match) return;

    setRestoreLoading(true);
    try {
      // Phục hồi trận đấu thành trạng thái hoạt động
      const updateData: UpdateMatchDto = {
        is_active: true,
        status: MatchStatus.SCHEDULED, // Set về scheduled để có thể quản lý lại
      };

      await matchService.updateMatch(restoreConfirm.match.id, updateData);

      setSuccessMessage('Trận đấu đã được phục hồi thành công!');
      await loadMatches(filters); // Reload matches sau khi thao tác
      setRestoreConfirm({ isOpen: false, match: null }); // Close modal on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi phục hồi trận đấu';
      setError(errorMessage);
    } finally {
      setRestoreLoading(false);
    }
  };

  /**
   * Hủy restore match
   */
  const handleCancelRestore = () => {
    setRestoreConfirm({ isOpen: false, match: null });
  };

  // ==================== UI HANDLERS ====================

  /**
   * Xử lý chỉnh sửa match
   */
  const handleEditMatch = (match: Match) => {
    setEditingMatch(match);
    setShowForm(true);
  };

  /**
   * Xử lý hủy form
   */
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingMatch(null);
  };


  /**
   * Xử lý reset filters về mặc định
   */
  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
    });
  };

  /**
   * Xử lý thay đổi filters
   */
  const handleFiltersChange = (newFilters: MatchFilters) => {
    setFilters(newFilters);
  };

  /**
   * Xử lý thay đổi trang
   */
  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };


  /**
   * Xử lý click vào stat cards để filter
   */
  const handleStatClick = (filterType: 'total' | 'live' | 'scheduled' | 'finished' | 'not_started' | 'inactive') => {
    let newFilters = { ...filters, page: 1 }; // Reset về trang 1

    switch (filterType) {
      case 'total':
        // Hiển thị tất cả matches - chỉ clear status filter
        newFilters = {
          ...newFilters,
          status: undefined,
        };
        break;
      case 'live':
        // Lọc chỉ matches đang diễn ra
        newFilters = {
          ...newFilters,
          status: MatchStatus.LIVE,
        };
        break;
      case 'scheduled':
        // Lọc chỉ matches đã lên lịch
        newFilters = {
          ...newFilters,
          status: MatchStatus.SCHEDULED,
        };
        break;
      case 'finished':
        // Lọc chỉ matches đã kết thúc
        newFilters = {
          ...newFilters,
          status: MatchStatus.FINISHED,
          search: undefined,
          featured: undefined,
          is_active: undefined,
        };
        break;
      case 'not_started':
        // Lọc chỉ matches chưa bắt đầu
        newFilters = {
          ...newFilters,
          status: MatchStatus.NOT_STARTED,
          search: undefined,
          featured: undefined,
          is_active: undefined,
        };
        break;
      case 'inactive':
        // Lọc chỉ matches đã dừng hoạt động
        newFilters = {
          ...newFilters,
          is_active: '0',
          status: undefined,
          search: undefined,
          featured: undefined,
        };
        break;
    }

    setFilters(newFilters);
  };

  // ==================== RENDER ====================

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Quản lý Trận đấu
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
              Quản lý và theo dõi các trận đấu bóng đá trực tiếp
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            style={{ 
              backgroundColor: 'var(--primary)', 
              color: 'var(--primary-foreground)' 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)';
            }}
          >
            <Plus className="w-4 h-4" />
            Tạo trận đấu mới
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="font-medium">{error}</span>
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
            <p className="text-sm">{successMessage}</p>
          </div>
        </Toast>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card 
            onClick={() => handleStatClick('total')}
            className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[var(--muted-foreground)]">Tổng trận đấu</p>
                  <p className="text-2xl font-bold text-[var(--foreground)]">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-[var(--muted)] flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-[var(--accent)]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div 
            onClick={() => handleStatClick('live')}
            className="rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 group"
            style={{ 
              backgroundColor: 'var(--card-bg)', 
              border: '1px solid var(--border)' 
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold transition-colors" style={{ color: 'var(--text-muted)' }}>Đang diễn ra</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{stats.live}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: 'var(--muted)' }}>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => handleStatClick('scheduled')}
            className="rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 group"
            style={{ 
              backgroundColor: 'var(--card-bg)', 
              border: '1px solid var(--border)' 
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold transition-colors" style={{ color: 'var(--text-muted)' }}>Đã lên lịch</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{stats.scheduled}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: 'var(--muted)' }}>
                <Clock className="w-6 h-6" style={{ color: '#eab308' }} />
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => handleStatClick('finished')}
            className="rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 group"
            style={{ 
              backgroundColor: 'var(--card-bg)', 
              border: '1px solid var(--border)' 
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold transition-colors" style={{ color: 'var(--text-muted)' }}>Đã kết thúc</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{stats.finished}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: 'var(--muted)' }}>
                <CheckCircle className="w-6 h-6" style={{ color: '#10b981' }} />
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => handleStatClick('not_started')}
            className="rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 group"
            style={{ 
              backgroundColor: 'var(--card-bg)', 
              border: '1px solid var(--border)' 
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold transition-colors" style={{ color: 'var(--text-muted)' }}>Chưa bắt đầu</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{stats.not_started}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: 'var(--muted)' }}>
                <svg className="w-6 h-6" style={{ color: '#8b5cf6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Inactive Matches Card */}
          <div 
            onClick={() => handleStatClick('inactive')}
            className="rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 group"
            style={{ 
              backgroundColor: 'var(--card-bg)', 
              border: '1px solid var(--border)' 
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold transition-colors" style={{ color: 'var(--text-muted)' }}>Đã dừng hoạt động</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{stats.total - stats.active}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: 'var(--muted)' }}>
                <AlertTriangle className="w-6 h-6" style={{ color: '#ef4444' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Toggle Button */}
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <svg 
            className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
        </Button>
        
        {/* Quick Stats Display */}
        <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
          <span>Hiển thị {matches.length} / {totalMatches} trận đấu</span>
          {filters.status && (
            <span className="px-2 py-1 bg-[var(--muted)] rounded text-xs">
              Trạng thái: {filters.status}
            </span>
          )}
          {filters.search && (
            <span className="px-2 py-1 bg-[var(--muted)] rounded text-xs">
              Tìm kiếm: &quot;{filters.search}&quot;
            </span>
          )}
          {filters.has_commentator === 'true' && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              ⭐ Chỉ hiển thị trận có BLV
            </span>
          )}
          {filters.is_active === 'true' && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
              🟢 Chỉ hiển thị trận active
            </span>
          )}
          {filters.is_active === 'false' && (
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
              🔴 Chỉ hiển thị trận đã dừng hoạt động
            </span>
          )}
        </div>
      </div>

      {/* Match Table with Filters */}
      <div className="">
        {showFilters && (
          <div className="mb-6">
            <Card>
              <CardContent className="p-6">
                <MatchFiltersComponent
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onReset={handleResetFilters}
                  onCreateMatch={() => setShowForm(true)}
                />
              </CardContent>
            </Card>
          </div>
        )}
        
        <MatchTable
          matches={matches}
          onEdit={handleEditMatch}
          onDelete={handleDeleteMatch}
          onRestore={handleRestoreMatch}
          loading={loading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </div>

      {/* Pagination Info & Controls */}
      <div className="mt-6 flex flex-col items-center gap-4">
        {/* Pagination Info */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Hiển thị {matches.length} trong tổng số {totalMatches} trận đấu 
          (Trang {filters.page || 1} / {totalPages})
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={(filters.page || 1) === 1}
              className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Trang đầu"
            >
              ««
            </button>
            <button
              onClick={() => handlePageChange((filters.page || 1) - 1)}
              disabled={(filters.page || 1) === 1}
              className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            
            <div className="flex items-center gap-1">
              {(() => {
                const pages = [];
                const maxVisiblePages = 7; // Hiển thị tối đa 7 trang
                
                const currentPageNum = filters.page || 1;
                
                if (totalPages <= maxVisiblePages) {
                  // Nếu ít hơn hoặc bằng 7 trang, hiển thị tất cả
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Logic hiển thị trang thông minh
                  if (currentPageNum <= 4) {
                    // Hiển thị 5 trang đầu + ... + trang cuối
                    for (let i = 1; i <= 5; i++) {
                      pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                  } else if (currentPageNum >= totalPages - 3) {
                    // Hiển thị trang đầu + ... + 5 trang cuối
                    pages.push(1);
                    pages.push('...');
                    for (let i = totalPages - 4; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Hiển thị trang đầu + ... + 3 trang quanh trang hiện tại + ... + trang cuối
                    pages.push(1);
                    pages.push('...');
                    for (let i = currentPageNum - 1; i <= currentPageNum + 1; i++) {
                      pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                  }
                }
                
                return pages.map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page as number)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        currentPageNum === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ));
              })()}
            </div>
            
            <button
              onClick={() => handlePageChange((filters.page || 1) + 1)}
              disabled={(filters.page || 1) === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={(filters.page || 1) === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Trang cuối"
            >
              »»
            </button>
          </div>
        )}
      </div>

      {/* Match Form Modal */}
      <MatchForm
        isOpen={showForm}
        match={editingMatch}
        onSubmit={async (matchData: CreateMatchDto | UpdateMatchDto) => {
          if (editingMatch) {
            await handleUpdateMatch(matchData as UpdateMatchDto);
          } else {
            await handleCreateMatch(matchData as CreateMatchDto);
          }
        }}
        onCancel={handleCancelForm}
        loading={loading}
        onMatchCreated={handleMatchCreated}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && deleteConfirm.match && (
        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title={
            userRole === UserRole.STAFF 
              ? "Đánh dấu trận đấu không hoạt động" 
              : "Xác nhận xóa trận đấu"
          }
          message={
            userRole === UserRole.STAFF
              ? `Bạn có chắc chắn muốn đánh dấu trận đấu giữa ${deleteConfirm.match.home_team?.name} và ${deleteConfirm.match.away_team?.name} là không hoạt động? Sẽ thực hiện:
• Bỏ gán bình luận viên
• Gỡ trạng thái nổi bật
• Đặt trạng thái thành đã hủy
• Không hiển thị trong danh sách trận đấu`
              : `Bạn có chắc chắn muốn xóa trận đấu giữa ${deleteConfirm.match.home_team?.name} và ${deleteConfirm.match.away_team?.name}? Hành động này không thể hoàn tác.`
          }
          confirmText={
            userRole === UserRole.STAFF 
              ? "Đánh dấu không hoạt động" 
              : "Xóa trận đấu"
          }
          cancelText="Hủy"
          type="danger"
          loading={deleteLoading}
        />
      )}

      {/* Restore Modal */}
      {restoreConfirm.isOpen && restoreConfirm.match && (
        <ConfirmModal
          isOpen={restoreConfirm.isOpen}
          onClose={handleCancelRestore}
          onConfirm={handleConfirmRestore}
          title="Phục hồi trận đấu"
          message={`Bạn có chắc chắn muốn phục hồi trận đấu giữa ${restoreConfirm.match.home_team?.name} và ${restoreConfirm.match.away_team?.name}? Trận đấu sẽ được đặt về trạng thái hoạt động và có thể được quản lý lại.`}
          confirmText="Phục hồi"
          cancelText="Hủy"
          type="warning"
          loading={restoreLoading}
        />
      )}
    </div>
  );
}
