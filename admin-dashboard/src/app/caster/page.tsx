'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { StreamKey } from '../../types/stream-key';
import { MatchStatus, Match, UpdateMatchDto } from '../../types/match';
import { streamKeyService } from '../../services/streamKeyService';
import { matchService } from '../../services/matchService';
import { userService } from '../../services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { Key, Play, Square, RefreshCw, AlertTriangle, LogOut, Edit3, CheckCircle2, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import CasterMatchUpdateForm from '@/components/match/CasterMatchUpdateForm';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  display_name?: string;
}

interface StreamKeyInfo {
  id: string;
  key_value: string;
  rtmp_url: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    display_name?: string;
  };
}

export default function CasterDashboard() {
  const { logout } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [streamKeys, setStreamKeys] = useState<StreamKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Match update form states
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Filter states
  const [streamKeyFilter, setStreamKeyFilter] = useState<string>('all');
  
  // Expand/collapse matches states
  const [expandedStreamKeys, setExpandedStreamKeys] = useState<Set<string>>(new Set());

  const loadCasterStreamKeys = useCallback(async () => {
    try {
      if (!userProfile?.id) {
        setError('Không tìm thấy thông tin user để tải stream keys');
        return;
      }
      
      // Sử dụng GET /api/v1/stream-keys với user_id parameter theo API docs
      const response = await streamKeyService.getAll({
        user_id: userProfile.id,
        limit: 100,
        status: 'active'
      });
      
      setStreamKeys(response.streamKeys || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải stream keys');
    }
  }, [userProfile?.id]);

  const loadUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await userService.getProfile();
      const userProfile: UserProfile = {
        id: profile.id || profile._id || '',
        username: profile.username,
        email: profile.email,
        role: profile.role,
        display_name: profile.display_name
      };
      setUserProfile(userProfile);
      
      if (profile.role === 'caster') {
        // Load stream keys sau khi đã có userProfile
        // loadCasterStreamKeys sẽ được gọi trong useEffect riêng
      } else {
        setError('Bạn không có quyền truy cập trang này');
      }
    } catch (_err) {
      // Redirect về trang login khi có lỗi
      await logout();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [logout, router]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // Load stream keys sau khi có userProfile
  useEffect(() => {
    if (userProfile && userProfile.role === 'caster') {
      loadCasterStreamKeys();
    }
  }, [userProfile, loadCasterStreamKeys]);

  const handleStartStream = async (streamKey: StreamKey, match: { _id?: string; id?: string; home_team?: { name: string }; away_team?: { name: string } }) => {
    const matchId = match._id || match.id;
    if (!matchId) {
      setError('Không tìm thấy ID của trận đấu');
      return;
    }

    const matchName = match.home_team && match.away_team ? 
      `${match.home_team.name} vs ${match.away_team.name}` : 
      'trận đấu này';

    if (confirm(`Bạn có chắc chắn muốn bắt đầu phát sóng ${matchName}?`)) {
      try {
        // Sử dụng matchService để cập nhật status trận đấu trực tiếp
        await matchService.updateMatch(matchId, {
          status: MatchStatus.LIVE,
          status_code: 'LIVE'
        });
        await loadCasterStreamKeys();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi bắt đầu phát sóng');
      }
    }
  };

  const handleStopStream = async (streamKey: StreamKey, match: { _id?: string; id?: string; home_team?: { name: string }; away_team?: { name: string } }) => {
    const matchId = match._id || match.id;
    if (!matchId) {
      setError('Không tìm thấy ID của trận đấu');
      return;
    }

    const matchName = match.home_team && match.away_team ? 
      `${match.home_team.name} vs ${match.away_team.name}` : 
      'trận đấu này';

    if (confirm(`Bạn có chắc chắn muốn dừng phát sóng ${matchName}?`)) {
      try {
        // Sử dụng matchService để cập nhật status trận đấu trực tiếp
        await matchService.updateMatch(matchId, {
          status: MatchStatus.FINISHED,
          status_code: 'FT',
          is_featured: false
        });
        await loadCasterStreamKeys();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi dừng phát sóng');
      }
    }
  };

  /**
   * Convert match data from stream key to Match type
   */
  // const convertToMatch = (matchData: {
  //   _id?: string;
  //   id?: string;
  //   home_team: { id: string; name: string; logo: string };
  //   away_team: { id: string; name: string; logo: string };
  //   league?: { id: string; name: string; logo: string };
  //   match_time?: string;
  //   match_date?: string;
  //   venue?: string;
  //   status?: string;
  //   type?: string;
  //   home_score?: number;
  //   away_score?: number;
  //   is_active?: boolean;
  //   is_featured?: boolean;
  //   description?: string;
  //   tags?: string[];
  //   stream_key?: StreamKeyInfo;
  //   createdAt?: string;
  //   updatedAt?: string;
  // }): Match => {
  //   const matchId = matchData._id || matchData.id || '';
  //   return {
  //     id: matchId,
  //     _id: matchId,
  //     home_team: matchData.home_team,
  //     away_team: matchData.away_team,
  //     league: matchData.league || { id: '', name: '', logo: '' },
  //     match_time: matchData.match_time || '',
  //     match_date: matchData.match_date || '',
  //     venue: matchData.venue || '',
  //     status: (matchData.status as MatchStatus) || MatchStatus.SCHEDULED,
  //     type: (matchData.type as MatchType) || MatchType.LEAGUE,
  //     home_score: matchData.home_score || 0,
  //     away_score: matchData.away_score || 0,
  //     is_active: matchData.is_active !== undefined ? matchData.is_active : true,
  //     is_featured: matchData.is_featured || false,
  //     description: matchData.description || '',
  //     tags: matchData.tags || [],
  //     stream_key: matchData.stream_key,
  //     createdAt: matchData.createdAt || new Date().toISOString(),
  //     updatedAt: matchData.updatedAt || new Date().toISOString(),
  //   };
  // };

  /**
   * Mở form cập nhật trận đấu và gọi API GET để lấy thông tin chi tiết
   */
  const handleUpdateMatch = async (matchData: {
    _id?: string;
    id?: string;
    home_team: { id: string; name: string; logo: string };
    away_team: { id: string; name: string; logo: string };
    league?: { id: string; name: string; logo: string };
    match_time?: string;
    match_date?: string;
    venue?: string;
    status?: string;
    type?: string;
    home_score?: number;
    away_score?: number;
    is_active?: boolean;
    is_featured?: boolean;
    description?: string;
    tags?: string[];
    stream_key?: StreamKeyInfo;
    createdAt?: string;
    updatedAt?: string;
  }) => {
    try {
      setUpdateLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      // Lấy match ID từ stream key response
      const matchId = matchData.id || matchData._id;
      if (!matchId) {
        throw new Error('Không tìm thấy ID trận đấu');
      }
      
      // Gọi API GET để lấy thông tin chi tiết match
      const detailedMatch = await matchService.getMatchById(matchId);
      
      setEditingMatch(detailedMatch);
      setShowUpdateForm(true);
    } catch (_err) {
      const errorMessage = _err instanceof Error ? _err.message : 'Có lỗi xảy ra khi tải thông tin trận đấu';
      setError(errorMessage);
      throw _err;
    } finally {
      setUpdateLoading(false);
    }
  };

  /**
   * Xử lý cập nhật match
   */
  const handleUpdateMatchSubmit = async (matchData: UpdateMatchDto): Promise<void> => {
    if (!editingMatch) return;
    
    try {
      setUpdateLoading(true);
      await matchService.updateMatch(editingMatch.id, matchData);
      setEditingMatch(null);
      setShowUpdateForm(false);
      setSuccessMessage('Trận đấu đã được cập nhật thành công!');
      await loadCasterStreamKeys(); // Reload stream keys để cập nhật thông tin
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật trận đấu');
      throw err; // Re-throw để form có thể xử lý
    } finally {
      setUpdateLoading(false);
    }
  };

  /**
   * Đóng form cập nhật
   */
  const handleCloseUpdateForm = () => {
    setShowUpdateForm(false);
    setEditingMatch(null);
    setError(null);
    setSuccessMessage(null);
  };

  /**
   * Toggle expand/collapse matches list
   */
  const toggleExpandMatches = (streamKeyId: string) => {
    setExpandedStreamKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(streamKeyId)) {
        newSet.delete(streamKeyId);
      } else {
        newSet.add(streamKeyId);
      }
      return newSet;
    });
  };

  const formatMatchDateTime = (dateString: string, timeString: string) => {
    if (!timeString || timeString === 'undefined' || timeString === 'null') {
      return 'Chưa có giờ';
    }
    
    if (!dateString || dateString === 'undefined' || dateString === 'null') {
      return 'Chưa có ngày';
    }
    
    try {
      return `${timeString} ${dateString}`;
    } catch (error) {
      return 'Lỗi định dạng ngày';
    }
  };


  // Filter stream keys based on selected filter
  const filteredStreamKeys = streamKeys.filter(streamKey => {
    if (streamKeyFilter === 'all') return true;
    if (streamKeyFilter === 'active') return !streamKey.revoked_at;
    if (streamKeyFilter === 'revoked') return !!streamKey.revoked_at;
    if (streamKeyFilter === 'with_matches') return streamKey.matches && streamKey.matches.length > 0;
    if (streamKeyFilter === 'without_matches') return !streamKey.matches || streamKey.matches.length === 0;
    if (streamKeyFilter === 'live') {
      return streamKey.matches && streamKey.matches.some(match => match.status === 'live' && match.is_active);
    }
    if (streamKeyFilter === 'scheduled') {
      return streamKey.matches && streamKey.matches.some(match => match.status === 'scheduled' && match.is_active);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[var(--accent)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!userProfile || userProfile.role !== 'caster') {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">Bạn không có quyền truy cập trang này</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <Key className="w-8 h-8 text-[var(--accent)]" />
              <h1 className="text-3xl font-bold text-[var(--foreground)]">
                Dashboard Caster
              </h1>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-400 text-white rounded-lg transition-colors duration-200 cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
          <p className="text-[var(--muted-foreground)]">
            Quản lý stream keys và trận đấu của bạn
          </p>
        </div>

        {/* User Info */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            Thông tin cá nhân
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[var(--muted-foreground)]">Tên hiển thị</label>
              <p className="text-[var(--foreground)] font-medium">
                {userProfile.display_name || userProfile.username}
              </p>
            </div>
            <div>
              <label className="text-sm text-[var(--muted-foreground)]">Username</label>
              <p className="text-[var(--foreground)] font-medium">@{userProfile.username}</p>
            </div>
            <div>
              <label className="text-sm text-[var(--muted-foreground)]">Email</label>
              <p className="text-[var(--foreground)] font-medium">{userProfile.email}</p>
            </div>
            <div>
              <label className="text-sm text-[var(--muted-foreground)]">Vai trò</label>
              <p className="text-[var(--foreground)] font-medium capitalize">{userProfile.role}</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage(null)}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stream Keys */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg">

          {filteredStreamKeys.length === 0 ? (
            <div className="p-8 text-center">
              <Key className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
              <p className="text-[var(--muted-foreground)]">
                {streamKeys.length === 0 
                  ? "Bạn chưa có stream key nào cho bình luận viên"
                  : "Không có stream key nào phù hợp với bộ lọc đã chọn"
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[var(--border)] hover:bg-transparent">
                  <TableHead className="text-[var(--foreground)] w-[200px]">Stream Key</TableHead>
                  <TableHead className="text-[var(--foreground)] w-[200px]">RTMP URL</TableHead>
                  <TableHead className="text-[var(--foreground)] min-w-[450px]">Trận đấu & Điều khiển</TableHead>
                  <TableHead className="text-[var(--foreground)] w-[140px]">Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStreamKeys.map((streamKey) => (
                  <TableRow key={streamKey.id} className="border-[var(--border)] hover:bg-[var(--hover-bg)]">
                    {/* Stream Key Column */}
                    <TableCell className="align-top">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-[var(--foreground)] break-all">
                          {streamKey.key_value.length > 20 
                            ? `${streamKey.key_value.substring(0, 20)}...` 
                            : streamKey.key_value}
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(streamKey.key_value)}
                          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors flex-shrink-0"
                          title="Copy stream key"
                        >
                          📋
                        </button>
                      </div>
                    </TableCell>
                    
                    {/* RTMP URL Column */}
                    <TableCell className="align-top">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-[var(--foreground)] break-all">
                          {streamKey.rtmp_url && streamKey.rtmp_url.length > 20 
                            ? `${streamKey.rtmp_url.substring(0, 20)}...` 
                            : streamKey.rtmp_url || 'N/A'}
                        </span>
                        {streamKey.rtmp_url && (
                          <button
                            onClick={() => navigator.clipboard.writeText(streamKey.rtmp_url!)}
                            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors flex-shrink-0"
                            title="Copy RTMP URL"
                          >
                            📋
                          </button>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Matches Column */}
                    <TableCell className="align-top">
                      {streamKey.matches && streamKey.matches.length > 0 ? (
                        <div className="space-y-2">
                          {(expandedStreamKeys.has(streamKey.id) 
                            ? streamKey.matches 
                            : streamKey.matches.slice(0, 2)
                          ).map((match, index) => (
                            <div key={index} className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-[var(--muted)] rounded p-3 gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">
                                  {match.home_team.name} vs {match.away_team.name}
                                </div>
                                <div className="text-xs text-[var(--muted-foreground)] mt-1">
                                  {formatMatchDateTime(match.match_date, match.match_time)} • {match.status}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {/* Edit Match Button */}
                                <button
                                  onClick={() => handleUpdateMatch(match)}
                                  className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-black border border-blue-300 rounded hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1 dark:bg-blue-900/30 dark:text-blue-100 dark:border-blue-600 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                  title="Cập nhật thông tin trận đấu"
                                  disabled={updateLoading}
                                >
                                  {updateLoading ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Edit3 className="w-3 h-3" />
                                  )}
                                  {updateLoading ? 'Đang tải...' : 'Sửa'}
                                </button>
                                
                                {match.status === 'scheduled' && (
                                  <button
                                    onClick={() => handleStartStream(streamKey, match)}
                                    className="px-3 py-1.5 text-xs font-medium bg-green-50 text-black border border-green-300 rounded hover:bg-green-100 transition-colors cursor-pointer flex items-center gap-1 dark:bg-green-900/30 dark:text-green-100 dark:border-green-600 dark:hover:bg-green-900/50 whitespace-nowrap"
                                    title="Bắt đầu phát sóng"
                                  >
                                    <Play className="w-3 h-3" />
                                    Phát sóng
                                  </button>
                                )}
                                {match.status === 'not_started' && (
                                  <button
                                    onClick={() => handleStartStream(streamKey, match)}
                                    className="px-3 py-1.5 text-xs font-medium bg-green-50 text-black border border-green-300 rounded hover:bg-green-100 transition-colors cursor-pointer flex items-center gap-1 dark:bg-green-900/30 dark:text-green-100 dark:border-green-600 dark:hover:bg-green-900/50 whitespace-nowrap"
                                    title="Bắt đầu phát sóng"
                                  >
                                    <Play className="w-3 h-3" />
                                    Phát sóng
                                  </button>
                                )}
                                {match.status === 'live' && (
                                  <button
                                    onClick={() => handleStopStream(streamKey, match)}
                                    className="px-3 py-1.5 text-xs font-medium bg-red-50 text-black border border-red-300 rounded hover:bg-red-100 transition-colors cursor-pointer flex items-center gap-1 dark:bg-red-900/30 dark:text-red-100 dark:border-red-600 dark:hover:bg-red-900/50 whitespace-nowrap"
                                    title="Dừng phát sóng"
                                  >
                                    <Square className="w-3 h-3" />
                                    Dừng sóng
                                  </button>
                                )}
                                {match.status === 'finished' && (
                                  <span className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 border border-gray-200 rounded dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/30 whitespace-nowrap" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>
                                    Đã kết thúc
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          {streamKey.matches.length > 2 && (
                            <button
                              onClick={() => toggleExpandMatches(streamKey.id)}
                              className="w-full cursor-pointer text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] text-center py-2 rounded hover:bg-[var(--muted)] transition-colors font-medium"
                            >
                              {expandedStreamKeys.has(streamKey.id) 
                                ? '▲ Thu gọn' 
                                : `▼ Xem thêm ${streamKey.matches.length - 2} trận đấu`
                              }
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-[var(--muted-foreground)] text-center py-4">
                          <div className="font-medium">Chưa gán match</div>
                          <div className="text-xs opacity-60 mt-1">
                            Stream key chưa được gán cho trận đấu nào
                          </div>
                        </div>
                      )}
                    </TableCell>
                    
                    {/* Created Date Column */}
                    <TableCell className="align-top">
                      <div className="text-sm text-[var(--foreground)]">
                        {new Date(streamKey.created_at).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)] mt-1">
                        {new Date(streamKey.created_at).toLocaleTimeString('vi-VN')}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Match Update Form Modal */}
      <CasterMatchUpdateForm
        isOpen={showUpdateForm}
        match={editingMatch}
        onSubmit={handleUpdateMatchSubmit}
        onCancel={handleCloseUpdateForm}
        loading={updateLoading}
      />
    </div>
  );
}
