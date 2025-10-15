'use client';

import { useState, useEffect } from 'react';
import { CreateStreamKeyDto } from '@/types/stream-key';
import { User, UserRole } from '@/types/user';
import { userService } from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Users, AlertTriangle, CheckCircle2, Copy, FileText } from 'lucide-react';

interface StreamKeyFormProps {
  onSubmit: (data: CreateStreamKeyDto) => Promise<void>;
  onCancel: () => void;
}

export default function StreamKeyForm({ onSubmit, onCancel }: StreamKeyFormProps) {
  const [formData, setFormData] = useState<CreateStreamKeyDto>({
    key_value: '',
    user_id: '',
    matches: [],
    description: '',
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load caster users
  useEffect(() => {
    loadCasterUsers();
  }, []);

  const loadCasterUsers = async () => {
    setLoadingUsers(true);
    try {
      const allUsers = await userService.getAllUsers();
      const casterUsers = allUsers.filter(user => 
        user.role === UserRole.CASTER && user.is_active
      );
      setUsers(casterUsers);
    } catch (err) {
      setError('Có lỗi xảy ra khi tải danh sách caster');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Generate random stream key
  const generateStreamKey = () => {
    const prefix = 'sk_live_';
    const randomPart = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
    return prefix + randomPart;
  };

  const handleGenerateKey = () => {
    const newKey = generateStreamKey();
    setFormData(prev => ({ ...prev, key_value: newKey }));
    setError(null);
  };

  const handleUserSelect = (userId: string) => {
    const user = users.find(u => (u._id || u.id) === userId);
    setSelectedUser(user || null);
    setFormData(prev => ({ ...prev, user_id: userId }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.key_value.trim()) {
      setError('Vui lòng nhập hoặc generate key value');
      return false;
    }
    if (!formData.user_id) {
      setError('Vui lòng chọn người dùng');
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
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo stream key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stream Key Value */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          <Key className="w-4 h-4 inline mr-1" />
          Stream Key Value *
        </label>
        <div className="flex gap-2">
          <Input
            value={formData.key_value}
            onChange={(e) => setFormData(prev => ({ ...prev, key_value: e.target.value }))}
            placeholder="sk_live_abc123def456"
            className="font-mono"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateKey}
          >
            Generate
          </Button>
          {formData.key_value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigator.clipboard.writeText(formData.key_value)}
              title="Copy key"
            >
              <Copy className="w-4 h-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">
          Stream key phải phù hợp với cấu hình RTMP server
        </p>
      </div>

      {/* User Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          <Users className="w-4 h-4 inline mr-1" />
          Bình luận viên *
        </label>
        
        {loadingUsers ? (
          <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
            <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
            Đang tải danh sách caster...
          </div>
        ) : users.length > 0 ? (
          <Select
            value={formData.user_id}
            onValueChange={handleUserSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="-- Chọn bình luận viên --" />
            </SelectTrigger>
            <SelectContent style={{ 
              backgroundColor: 'var(--card-bg)', 
              border: '1px solid var(--border)' 
            }}>
              {users.map((user) => (
                <SelectItem 
                  key={user._id || user.id} 
                  value={user._id || user.id || ''}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">CASTER</Badge>
                    <span>{user.display_name || user.username}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      ({user.email})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Không có caster nào trong hệ thống. Vui lòng tạo tài khoản caster trước.
            </AlertDescription>
          </Alert>
        )}

        {/* Selected User Info */}
        {selectedUser && (
          <Card className="bg-[var(--muted)]/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Thông tin bình luận viên được chọn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[var(--muted-foreground)]">Tên:</span>
                  <span className="ml-2 font-medium">
                    {selectedUser.display_name || selectedUser.username}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--muted-foreground)]">Email:</span>
                  <span className="ml-2">{selectedUser.email}</span>
                </div>
                <div>
                  <span className="text-[var(--muted-foreground)]">Username:</span>
                  <span className="ml-2">@{selectedUser.username}</span>
                </div>
                <div>
                  <span className="text-[var(--muted-foreground)]">Vai trò:</span>
                  <Badge variant="secondary" className="ml-2">
                    {selectedUser.role.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
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
          placeholder="Mô tả ngắn gọn về stream key này..."
        />
        <p className="text-xs text-[var(--muted-foreground)]">
          Mô tả sẽ giúp phân biệt các stream key khác nhau
        </p>
      </div>

      {/* RTMP Info */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Key className="w-4 h-4" />
            Thông tin RTMP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-xs text-[var(--muted-foreground)]">RTMP URL:</span>
            <code className="block text-xs bg-[var(--background)] p-2 rounded border mt-1">
              rtmp://entrypoint-livebong.cdnfastest.com/vaoluoitv/
            </code>
          </div>
          <div>
            <span className="text-xs text-[var(--muted-foreground)]">Stream Key:</span>
            <code className="block text-xs bg-[var(--background)] p-2 rounded border mt-1">
              {formData.key_value || 'Chưa có key value'}
            </code>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            💡 Caster sẽ sử dụng thông tin này trong phần mềm streaming (OBS, XSplit, etc.)
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
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
          disabled={loading || !formData.key_value || !formData.user_id}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang tạo...
            </div>
          ) : (
            'Tạo Stream Key'
          )}
        </Button>
      </div>
    </form>
  );
}
