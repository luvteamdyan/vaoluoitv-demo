'use client';

import { useState, useEffect } from 'react';
import { StreamKey } from '@/types/stream-key';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Save, X } from 'lucide-react';

interface EditBlvFormProps {
  streamKey: StreamKey;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditBlvForm({ 
  streamKey, 
  isOpen, 
  onClose, 
  onSuccess 
}: EditBlvFormProps) {
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy thông tin user từ streamKey
  const getUserInfo = () => {
    if (streamKey.user) {
      return streamKey.user;
    } else if (typeof streamKey.user_id === 'object' && streamKey.user_id) {
      return streamKey.user_id;
    }
    return null;
  };

  const userInfo = getUserInfo();

  // Khởi tạo display_name khi component mount
  useEffect(() => {
    if (userInfo) {
      setDisplayName(userInfo.display_name || userInfo.username);
    }
  }, [userInfo]);

  const validateForm = (): boolean => {
    if (!displayName.trim()) {
      setError('Tên hiển thị không được để trống');
      return false;
    }
    
    if (displayName.trim().length < 2) {
      setError('Tên hiển thị phải có ít nhất 2 ký tự');
      return false;
    }
    
    if (displayName.trim().length > 50) {
      setError('Tên hiển thị không được quá 50 ký tự');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!userInfo) {
      setError('Không tìm thấy thông tin người dùng');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Import userService dynamically để tránh circular dependency
      const { userService } = await import('@/services/userService');
      
      const userId = userInfo._id || (userInfo as { id?: string }).id || '';
      await userService.updateUser(userId, {
        display_name: displayName.trim()
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật tên bình luận viên');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(userInfo?.display_name || userInfo?.username || '');
    setError(null);
    onClose();
  };

  if (!isOpen || !userInfo) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)' }}>
        <CardHeader style={{ backgroundColor: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            <User className="w-5 h-5" />
            Sửa tên bình luận viên
          </CardTitle>
        </CardHeader>
        
        <CardContent style={{ backgroundColor: 'var(--card-bg)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Thông tin hiện tại */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Thông tin hiện tại
              </label>
              <div className="p-3 rounded-lg space-y-1" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                <div className="text-sm" style={{ color: 'var(--foreground)' }}>
                  <span className="font-medium">Username:</span> {userInfo.username}
                </div>
                <div className="text-sm" style={{ color: 'var(--foreground)' }}>
                  <span className="font-medium">Email:</span> {userInfo.email}
                </div>
                <div className="text-sm" style={{ color: 'var(--foreground)' }}>
                  <span className="font-medium">Role:</span> {userInfo.role.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Form input */}
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Tên hiển thị <span className="text-red-500">*</span>
              </label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nhập tên hiển thị cho bình luận viên"
                disabled={loading}
                className="w-full"
                maxLength={50}
                style={{ 
                  backgroundColor: 'var(--input)', 
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)'
                }}
              />
              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {displayName.length}/50 ký tự
              </div>
            </div>

            {/* Error message */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center gap-2"
                style={{ 
                  backgroundColor: 'var(--secondary)', 
                  color: 'var(--secondary-foreground)',
                  border: '1px solid var(--border)'
                }}
              >
                <X className="w-4 h-4" />
                Hủy
              </Button>
              
              <Button
                type="submit"
                disabled={loading || !displayName.trim()}
                className="flex items-center gap-2"
                style={{ 
                  backgroundColor: 'var(--primary)', 
                  color: 'var(--primary-foreground)'
                }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
