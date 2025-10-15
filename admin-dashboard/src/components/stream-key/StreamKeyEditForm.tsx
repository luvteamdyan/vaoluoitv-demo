'use client';

import { useState, useEffect } from 'react';
import { StreamKey, UpdateStreamKeyDto } from '@/types/stream-key';
import { Match } from '@/types/match';
import { streamKeyService } from '@/services/streamKeyService';
import { formatMatchDateTime } from '@/utils/dateFormatter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MatchSearchSelector from '@/components/match/MatchSearchSelector';
import { 
  Key, 
  Edit3, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  FileText,
  Link2,
  Unlink2
} from 'lucide-react';

interface StreamKeyEditFormProps {
  streamKey: StreamKey;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StreamKeyEditForm({ 
  streamKey, 
  isOpen, 
  onClose, 
  onSuccess 
}: StreamKeyEditFormProps) {
  const [formData, setFormData] = useState<UpdateStreamKeyDto>({
    key_value: streamKey.key_value,
    description: streamKey.description || '',
    match_id: streamKey.match?._id || undefined,
  });
  
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  // Initialize form data when streamKey changes
  useEffect(() => {
    setFormData({
      key_value: streamKey.key_value,
      description: streamKey.description || '',
      match_id: streamKey.match?._id || undefined,
    });
    setSelectedMatch(null);
    setError(null);
    setValidationWarning(null);
  }, [streamKey]);

  const handleMatchSelect = (match: unknown) => {
    const selectedMatch = match as Match;
    setSelectedMatch(selectedMatch);
    setFormData(prev => ({ ...prev, match_id: selectedMatch?.id || selectedMatch?._id }));
    setError(null);
    setValidationWarning(null);
  };

  const handleUnassignMatch = () => {
    setSelectedMatch(null);
    setFormData(prev => ({ ...prev, match_id: null }));
    setValidationWarning('Sẽ bỏ gán match khỏi stream key này');
  };

  const validateForm = (): boolean => {
    if (!formData.key_value?.trim()) {
      setError('Key value là bắt buộc');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setValidationWarning(null);

    try {
      // Sử dụng PATCH endpoint theo API docs
      await streamKeyService.updateStreamKey(streamKey.id, formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật stream key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Chỉnh sửa Stream Key
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin stream key và gán/bỏ gán match
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Validation Warning */}
          {validationWarning && (
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{validationWarning}</AlertDescription>
            </Alert>
          )}

          {/* Current Stream Key Info */}
          <Card className="bg-[var(--muted)]/50">
            <CardHeader>
              <CardTitle className="text-sm">Thông tin hiện tại</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-[var(--muted-foreground)]">ID:</span>
                <code className="ml-2 px-2 py-1 bg-[var(--background)] rounded text-sm">
                  {streamKey.id}
                </code>
              </div>
              
              {typeof streamKey.user_id === 'object' && streamKey.user_id && (
                <div>
                  <span className="text-sm text-[var(--muted-foreground)]">Người dùng:</span>
                  <span className="ml-2 text-sm font-medium">
                    {streamKey.user_id.display_name || streamKey.user_id.username} 
                    ({streamKey.user_id.role})
                  </span>
                </div>
              )}

              {streamKey.match && (
                <div>
                  <span className="text-sm text-[var(--muted-foreground)]">Match hiện tại:</span>
                  <div className="ml-2 mt-1">
                    <Badge variant="secondary">
                      {streamKey.match.home_team.name} vs {streamKey.match.away_team.name}
                    </Badge>
                    <Badge variant="outline" className="ml-2">
                      {streamKey.match.status}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stream Key Value */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              <Key className="w-4 h-4 inline mr-1" />
              Stream Key Value *
            </label>
            <div className="flex gap-2">
              <Input
                value={formData.key_value || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, key_value: e.target.value }))}
                placeholder="sk_live_abc123def456"
                className="font-mono"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => navigator.clipboard.writeText(formData.key_value || '')}
                title="Copy key"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              <FileText className="w-4 h-4 inline mr-1" />
              Mô tả
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="Mô tả về stream key..."
            />
          </div>

          {/* Match Assignment */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-[var(--foreground)]">
                <Link2 className="w-4 h-4 inline mr-1" />
                Gán match
              </label>
              
              {streamKey.match && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUnassignMatch}
                >
                  <Unlink2 className="w-3 h-3 mr-1" />
                  Bỏ gán match hiện tại
                </Button>
              )}
            </div>

            <MatchSearchSelector
              onMatchSelect={handleMatchSelect}
              selectedMatch={selectedMatch}
              placeholder="Tìm kiếm match để gán..."
            />

            {selectedMatch && (
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">
                        {selectedMatch.home_team.name} vs {selectedMatch.away_team.name}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)] mt-1">
                        {formatMatchDateTime(selectedMatch.match_date, selectedMatch.match_time)} • {selectedMatch.status}
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            )}

            {formData.match_id === null && (
              <Alert>
                <Unlink2 className="h-4 w-4" />
                <AlertDescription>
                  Sẽ bỏ gán match khỏi stream key này
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* RTMP Info */}
          <Card className="bg-[var(--muted)]/30">
            <CardHeader>
              <CardTitle className="text-sm">Thông tin RTMP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-xs text-[var(--muted-foreground)]">RTMP URL:</span>
                <code className="block text-xs bg-[var(--background)] p-2 rounded border mt-1">
                  {streamKey.rtmp_url}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang cập nhật...
                </div>
              ) : (
                'Cập nhật Stream Key'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
