'use client';

import React from 'react';
import { Match, MatchStatus, MatchType } from '@/types/match';
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
import { SquarePen, Trash2, Calendar, Clock, Trophy, Home, Plane } from 'lucide-react';
import ImageWithFallback from '@/components/media/ImageWithFallback';

interface MatchTableProps {
  matches: Match[];
  onEdit: (match: Match) => void;
  onDelete: (match: Match) => void;
  loading: boolean;
}

const MatchTable: React.FC<MatchTableProps> = ({
  matches,
  onEdit,
  onDelete,
  loading,
}) => {
  const getStatusBadge = (status: MatchStatus, statusCode?: string) => {
    const statusConfig = {
      [MatchStatus.SCHEDULED]: { variant: 'secondary' as const, label: 'Đã lên lịch' },
      [MatchStatus.LIVE]: { variant: 'destructive' as const, label: 'Đang diễn ra' },
      [MatchStatus.FINISHED]: { variant: 'success' as const, label: 'Đã kết thúc' },
      [MatchStatus.CANCELLED]: { variant: 'outline' as const, label: 'Đã hủy' },
      [MatchStatus.NOT_STARTED]: { variant: 'warning' as const, label: 'Chưa bắt đầu' },
    };

    const config = statusConfig[status] || { variant: 'outline' as const, label: status };
    
    return (
      <div className="flex items-center gap-2">
        <Badge variant={config.variant}>
          {config.label}
        </Badge>
        {statusCode && (
          <span className="text-xs text-[var(--muted-foreground)]">({statusCode})</span>
        )}
      </div>
    );
  };

  const getTypeBadge = (type: MatchType) => {
    const typeConfig = {
      [MatchType.LEAGUE]: { icon: <Trophy className="w-3 h-3" />, label: 'Giải đấu' },
      [MatchType.CUP]: { icon: <Trophy className="w-3 h-3" />, label: 'Cúp' },
      [MatchType.FRIENDLY]: { icon: <Home className="w-3 h-3" />, label: 'Giao hữu' },
      [MatchType.CHAMPIONSHIP]: { icon: <Trophy className="w-3 h-3" />, label: 'Vô địch' },
      [MatchType.INTERNATIONAL]: { icon: <Plane className="w-3 h-3" />, label: 'Quốc tế' },
    };

    const config = typeConfig[type] || { icon: null, label: type };
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const formatMatchDateTime = (matchDate: string, matchTime: string) => {
    if (!matchTime || matchTime === 'undefined' || matchTime === 'null') {
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="w-3 h-3" />
            Chưa có giờ
          </div>
        </div>
      );
    }
    
    if (!matchDate || matchDate === 'undefined' || matchDate === 'null') {
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="w-3 h-3" />
            Chưa có ngày
          </div>
        </div>
      );
    }
    
    try {
      // matchDate đã là string format DD/MM/YYYY từ API
      // Chỉ cần validate và hiển thị
      const dateParts = matchDate.split('/');
      
      if (dateParts.length !== 3) {
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-sm text-red-500">
              <Calendar className="w-3 h-3" />
              Định dạng ngày không đúng
            </div>
          </div>
        );
      }
      
      const [day, month, year] = dateParts;
      
      if (!day || !month || !year) {
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-sm text-red-500">
              <Calendar className="w-3 h-3" />
              Định dạng ngày không đúng
            </div>
          </div>
        );
      }
      
      // matchDate đã đúng định dạng DD/MM/YYYY
      const formattedDate = matchDate;
      
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
            <Clock className="w-3 h-3" />
            {matchTime}
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-sm text-red-500">
            <Calendar className="w-3 h-3" />
            Lỗi định dạng ngày
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--card-bg)] rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
          <span className="ml-3 text-[var(--muted-foreground)]">Đang tải trận đấu...</span>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-[var(--card-bg)] rounded-lg p-8">
        <div className="text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <p className="text-[var(--muted-foreground)]">Chưa có trận đấu nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] rounded-lg overflow-hidden border border-[var(--border)]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Giải đấu</TableHead>
            <TableHead>Đội nhà</TableHead>
            <TableHead className="text-center">Tỷ số</TableHead>
            <TableHead>Đội khách</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-center">Nổi bật</TableHead>
            <TableHead className="text-center">Hoạt động</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((match) => (
            <TableRow key={match.id} className="hover:bg-[var(--hover-bg)]">
              <TableCell>
                <div className="flex items-center gap-2">
                  <ImageWithFallback
                    src={match.league.logo}
                    alt={match.league.name}
                    className="w-8 h-8 rounded"
                  />
                  <span className="font-medium">{match.league.name}</span>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <ImageWithFallback
                    src={match.home_team.logo}
                    alt={match.home_team.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium">{match.home_team.name}</span>
                </div>
              </TableCell>
              
              <TableCell className="text-center">
                <div className="font-bold text-lg">
                  {match.home_score} - {match.away_score}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <ImageWithFallback
                    src={match.away_team.logo}
                    alt={match.away_team.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium">{match.away_team.name}</span>
                </div>
              </TableCell>
              
              <TableCell>
                {formatMatchDateTime(match.match_date, match.match_time)}
              </TableCell>
              
              <TableCell>
                {getTypeBadge(match.type)}
              </TableCell>
              
              <TableCell>
                {getStatusBadge(match.status, match.status_code)}
              </TableCell>
              
              <TableCell className="text-center">
                {match.is_featured ? (
                  <Badge variant="success">Có</Badge>
                ) : (
                  <Badge variant="outline">Không</Badge>
                )}
              </TableCell>
              
              <TableCell className="text-center">
                {match.is_active ? (
                  <Badge variant="success">Có</Badge>
                ) : (
                  <Badge variant="outline">Không</Badge>
                )}
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(match)}
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <SquarePen className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(match)}
                    className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MatchTable;
