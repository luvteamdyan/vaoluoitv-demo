'use client';

import { StreamKey } from '@/types/stream-key';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Trash2, Key, Play, Square, Eye, Calendar, Clock, Edit3, User } from 'lucide-react';

interface StreamKeyTableProps {
  streamKeys: StreamKey[];
  loading: boolean;
  onDelete: (id: string) => void;
  onEdit?: (streamKey: StreamKey) => void;
  onEditBlv?: (streamKey: StreamKey) => void;
  onManageSchedule?: (streamKey: StreamKey) => void;
  onStartStream?: (streamKey: StreamKey & { selectedMatch?: unknown }) => void;
  onStopStream?: (streamKey: StreamKey & { selectedMatch?: unknown }) => void;
  onViewMatches?: (streamKey: StreamKey) => void;
}

export default function StreamKeyTable({
  streamKeys,
  loading,
  onDelete,
  onEdit,
  onEditBlv,
  onManageSchedule,
  onStartStream,
  onStopStream,
  onViewMatches,
}: StreamKeyTableProps) {
  
  const formatMatchDateTime = (matchDate: string, matchTime: string) => {
    if (!matchTime || matchTime === 'undefined' || matchTime === 'null') {
      return (
        <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <Calendar className="w-3 h-3" />
          Chưa có giờ
        </div>
      );
    }
    
    if (!matchDate || matchDate === 'undefined' || matchDate === 'null') {
      return (
        <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <Calendar className="w-3 h-3" />
          Chưa có ngày
        </div>
      );
    }
    
    try {
      // matchDate đã là string format DD/MM/YYYY từ API
      // Chỉ cần validate và hiển thị
      const dateParts = matchDate.split('/');
      
      if (dateParts.length !== 3) {
        return (
          <div className="flex items-center gap-1 text-xs text-red-500">
            <Calendar className="w-3 h-3" />
            Định dạng ngày không đúng
          </div>
        );
      }
      
      const [day, month, year] = dateParts;
      
      if (!day || !month || !year) {
        return (
          <div className="flex items-center gap-1 text-xs text-red-500">
            <Calendar className="w-3 h-3" />
            Định dạng ngày không đúng
          </div>
        );
      }
      
      // matchDate đã đúng định dạng DD/MM/YYYY
      const formattedDate = matchDate;
      
      return (
        <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <Calendar className="w-3 h-3" />
          {formattedDate}
          <Clock className="w-3 h-3 ml-1" />
          {matchTime}
        </div>
      );
    } catch (error) {
      return (
        <div className="flex items-center gap-1 text-xs text-red-500">
          <Calendar className="w-3 h-3" />
          Lỗi định dạng ngày
        </div>
      );
    }
  };


  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-[var(--muted)] rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (streamKeys.length === 0) {
    return (
      <div className="text-center py-12">
        <Key className="w-16 h-16 mx-auto mb-4 text-[var(--muted-foreground)] opacity-50" />
        <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
          Chưa có stream key nào cho bình luận viên
        </h3>
        <p className="text-[var(--muted-foreground)] mb-4">
          Tạo stream key đầu tiên để bắt đầu quản lý bình luận viên
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>Người dùng</TableHead>
            <TableHead>Lịch trận đấu</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {streamKeys.map((streamKey, index) => (
            <TableRow key={streamKey.id} className="hover:bg-[var(--hover-bg)]">
              {/* STT - Đánh số thứ tự */}
              <TableCell>
                <div className="text-center">
                  <Badge variant="outline" className="font-mono">
                    {index + 1}
                  </Badge>
                </div>
              </TableCell>

              {/* User Info */}
              <TableCell>
                <div className="space-y-1">
                  {/* Check for user object first (current backend response) */}
                  {streamKey.user ? (
                    <>
                      <div className="font-medium text-sm">
                        {streamKey.user.display_name || streamKey.user.username}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        @{streamKey.user.username}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {streamKey.user.email}
                      </div>
                      <Badge 
                        variant={streamKey.revoked_at ? "destructive" : "secondary"} 
                        className="text-xs"
                      >
                        {streamKey.revoked_at ? "Đã thu hồi" : streamKey.user.role.toUpperCase()}
                      </Badge>
                    </>
                  ) : 
                  /* Fallback to user_id object (backward compatibility) */
                  typeof streamKey.user_id === 'object' && streamKey.user_id ? (
                    <>
                      <div className="font-medium text-sm">
                        {streamKey.user_id.display_name || streamKey.user_id.username}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        @{streamKey.user_id.username}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {streamKey.user_id.email}
                      </div>
                      <Badge 
                        variant={streamKey.revoked_at ? "destructive" : "secondary"} 
                        className="text-xs"
                      >
                        {streamKey.revoked_at ? "Đã thu hồi" : streamKey.user_id.role.toUpperCase()}
                      </Badge>
                    </>
                  ) : (
                    <div className="text-sm text-[var(--muted-foreground)]">
                      User ID: {streamKey.user_id}
                    </div>
                  )}
                </div>
              </TableCell>

              {/* Matches Schedule Display */}
              <TableCell>
                {/* Prioritize matches array (theo API docs: 1 Stream Key - N Matches) */}
                {streamKey.matches && streamKey.matches.length > 0 ? (
                  <div className="space-y-2">
                    {streamKey.matches.slice(0, 2).map((match, index) => (
                      <Card key={match._id || index} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {match.home_team.name} vs {match.away_team.name}
                            </div>
                            {formatMatchDateTime(match.match_date, match.match_time)}
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {match.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex gap-1 ml-2">
                            {match.status === 'scheduled' && onStartStream && (
                              <Button
                                size="sm"
                                onClick={() => onStartStream({ ...streamKey, selectedMatch: match })}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                title="Bắt đầu phát sóng"
                              >
                                <Play className="w-3 h-3" />
                              </Button>
                            )}
                            {match.status === 'not_started' && onStartStream && (
                              <Button
                                size="sm"
                                onClick={() => onStartStream({ ...streamKey, selectedMatch: match })}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                title="Bắt đầu phát sóng"
                              >
                                <Play className="w-3 h-3" />
                              </Button>
                            )}
                            {match.status === 'live' && onStopStream && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onStopStream({ ...streamKey, selectedMatch: match })}
                                title="Dừng phát sóng"
                              >
                                <Square className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    {/* View all button - always show */}
                    {onViewMatches && (
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewMatches(streamKey)}
                          className="w-full"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Xem tất cả ({streamKey.matches.length})
                        </Button>
                      </div>
                    )}
                  </div>
                ) : 
                /* Fallback: check singular match object (backward compatibility) */
                streamKey.match ? (
                  <Card className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {streamKey.match.home_team.name} vs {streamKey.match.away_team.name}
                        </div>
                        {formatMatchDateTime(streamKey.match.match_date, streamKey.match.match_time)}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {streamKey.match.status}
                          </Badge>
                          {streamKey.match.status_code && (
                            <Badge variant="secondary" className="text-xs">
                              {streamKey.match.status_code}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1 ml-2">
                        {streamKey.match.status === 'scheduled' && onStartStream && (
                          <Button
                            size="sm"
                            onClick={() => onStartStream({ ...streamKey, selectedMatch: streamKey.match })}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            title="Bắt đầu phát sóng"
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        )}
                        {streamKey.match.status === 'not_started' && onStartStream && (
                          <Button
                            size="sm"
                            onClick={() => onStartStream({ ...streamKey, selectedMatch: streamKey.match })}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            title="Bắt đầu phát sóng"
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        )}
                        {streamKey.match.status === 'live' && onStopStream && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onStopStream({ ...streamKey, selectedMatch: streamKey.match })}
                            title="Dừng phát sóng"
                          >
                            <Square className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ) : (
                  /* No matches assigned */
                  <div className="text-center py-4">
                    <div className="text-[var(--muted-foreground)] text-sm mb-2">
                      <Calendar className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      Chưa có lịch trận đấu
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)] opacity-60">
                      Sử dụng button &quot;Lịch&quot; để lên lịch trận đấu
                    </div>
                  </div>
                )}
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {onEditBlv && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditBlv(streamKey)}
                      title="Sửa tên bình luận viên"
                    >
                      <User className="w-4 h-4" />
                    </Button>
                  )}

                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(streamKey)}
                      title="Chỉnh sửa stream key"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  )}

                  {onManageSchedule && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onManageSchedule(streamKey)}
                      title="Quản lý lịch trận đấu"
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Lịch
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(streamKey.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Xóa stream key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
