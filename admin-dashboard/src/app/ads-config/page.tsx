'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdsConfig, AdsConfigFilters, AdsPosition, MediaType, ADS_POSITIONS, MEDIA_TYPES, CreateAdsConfigRequest, UpdateAdsConfigRequest } from '@/types/ads-config';
import { adsConfigService } from '@/services/adsConfigService';
import { Upload } from '@/types/upload';
import MediaGallery from '@/components/media/MediaGallery';
import ResetButton from '@/components/ui/ResetButton';
import { SquarePen, Trash2 } from 'lucide-react';

export default function AdsConfigPage() {
  const [configs, setConfigs] = useState<AdsConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AdsConfig | null>(null);
  const [filters, setFilters] = useState<AdsConfigFilters>({});
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Upload | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Reset toàn bộ state của trang
  const resetPageState = () => {
    setConfigs([]);
    setLoading(true);
    setError(null);
    setShowForm(false);
    setEditingConfig(null);
    setFilters({});
    setShowMediaSelector(false);
    setSelectedMedia(null);
    setNotification(null);
    // Reload data
    loadConfigs();
  };

  // Load ads configs
  const loadConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adsConfigService.getAllConfigs(filters);
      setConfigs(response.configs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
      if (process.env.NODE_ENV === 'development') {
        // Silently handle error
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleCreateConfig = async (configData: CreateAdsConfigRequest) => {
    try {
      await adsConfigService.create(configData);
      setShowForm(false);
      setEditingConfig(null);
      setSelectedMedia(null);
      setNotification({ type: 'success', message: 'Tạo cấu hình ads thành công!' });
      loadConfigs();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // Silently handle error
      }
      setNotification({ type: 'error', message: 'Có lỗi xảy ra khi tạo cấu hình ads' });
    }
  };

  const handleUpdateConfig = async (id: string, configData: UpdateAdsConfigRequest) => {
    try {
      await adsConfigService.update(id, configData);
      setShowForm(false);
      setEditingConfig(null);
      setSelectedMedia(null);
      setNotification({ type: 'success', message: 'Cập nhật cấu hình ads thành công!' });
      loadConfigs();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // Silently handle error
      }
      setNotification({ type: 'error', message: 'Có lỗi xảy ra khi cập nhật cấu hình ads' });
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa cấu hình này?')) {
      return;
    }

    try {
      await adsConfigService.delete(id);
      loadConfigs();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        // Silently handle error
      }
      alert('Có lỗi xảy ra khi xóa cấu hình');
    }
  };

  const handleEditConfig = (config: AdsConfig) => {
    setEditingConfig(config);
    setShowForm(true);
  };

  const handleCreateNewConfig = () => {
    setEditingConfig(null);
    setSelectedMedia(null);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingConfig(null);
    setShowMediaSelector(false);
    setSelectedMedia(null);
  };

  const handleSelectMedia = (upload: Upload) => {
    if (editingConfig) {
      // Update existing config - only send allowed fields
      const updateData: UpdateAdsConfigRequest = {
        title: editingConfig.title,
        description: editingConfig.description,
        media_url: upload.url,
        media_type: upload.file_type === 'video' ? MediaType.VIDEO : MediaType.IMAGE,
        upload_id: upload.upload_id,
        link_url: editingConfig.link_url,
        is_active: editingConfig.is_active,
        alt_text: editingConfig.alt_text,
        target_audience: editingConfig.target_audience,
        start_date: editingConfig.start_date ? editingConfig.start_date.toISOString() : undefined,
        end_date: editingConfig.end_date ? editingConfig.end_date.toISOString() : undefined,
        priority: editingConfig.priority,
        custom_data: editingConfig.custom_data,
      };
      handleUpdateConfig(editingConfig.id, updateData);
    } else {
      // Set selected media for new config
      setSelectedMedia(upload);
    }
    setShowMediaSelector(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-[var(--foreground)]">
              Quản lý Ads Banner
            </h1>
            <ResetButton onReset={resetPageState} disabled={loading} />
          </div>
          <p className="text-[var(--muted-foreground)]">
            Quản lý và cấu hình các banner quảng cáo trên website
          </p>
        </div>

        {/* Filters */}
        <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--sidebar-border)] p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Vị trí
              </label>
              <select
                value={filters.position || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value as AdsPosition || undefined }))}
                className="w-full px-3 py-2 border border-[var(--sidebar-border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] hover:border-[var(--accent)] transition-colors duration-200"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
              >
                <option value="" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Tất cả vị trí</option>
                {ADS_POSITIONS.map(position => (
                  <option key={position.value} value={position.value} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>
                    {position.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Loại media
              </label>
              <select
                value={filters.media_type || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, media_type: e.target.value as MediaType || undefined }))}
                className="w-full px-3 py-2 border border-[var(--sidebar-border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] hover:border-[var(--accent)] transition-colors duration-200"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
              >
                <option value="" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Tất cả loại</option>
                {MEDIA_TYPES.map(type => (
                  <option key={type.value} value={type.value} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Trạng thái
              </label>
              <select
                value={filters.is_active?.toString() || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, is_active: e.target.value === '' ? undefined : e.target.value === 'true' }))}
                className="w-full px-3 py-2 border border-[var(--sidebar-border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] hover:border-[var(--accent)] transition-colors duration-200"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
              >
                <option value="" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Tất cả</option>
                <option value="true" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Đang hoạt động</option>
                <option value="false" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>Không hoạt động</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleCreateNewConfig}
                className="w-full px-4 py-2 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent)]/90 hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
              >
                + Thêm cấu hình mới
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-900 dark:bg-red-900/30 dark:border-red-600 dark:text-red-100 px-4 py-3 rounded mb-6 font-medium">
            {error}
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className={`px-4 py-3 rounded mb-6 ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-300 text-green-900 dark:bg-green-900/30 dark:border-green-600 dark:text-green-100' 
              : 'bg-red-50 border border-red-300 text-red-900 dark:bg-red-900/30 dark:border-red-600 dark:text-red-100'
          }`}>
            <div className="flex justify-between items-center">
              <span className="font-medium">{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-4 text-lg font-bold hover:opacity-80 hover:bg-black/10 dark:hover:bg-white/10 rounded-full w-6 h-6 flex items-center justify-center transition-all duration-200"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Configs list */}
        <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--sidebar-border)] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-[var(--muted-foreground)]">Đang tải...</div>
            </div>
          ) : configs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-[var(--muted-foreground)]">Chưa có cấu hình nào</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--muted)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                      Vị trí
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                      Tiêu đề
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                      Lượt click
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sidebar-border)]">
                  {configs.map((config) => (
                    <tr key={config.id} className="hover:bg-[var(--muted)]/50 transition-colors duration-200 cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[var(--foreground)]">
                          {adsConfigService.getPositionLabel(config.position)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--foreground)]">
                          {config.title}
                        </div>
                        {config.description && (
                          <div className="text-xs text-[var(--muted-foreground)]">
                            {config.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          config.media_type === MediaType.VIDEO 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {config.media_type === MediaType.VIDEO ? 'Video' : 'Hình ảnh'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          config.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {config.is_active ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                        {adsConfigService.formatClickCount(config.click_count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleEditConfig(config)}
                            className="text-[var(--accent)] hover:text-[var(--accent)]/80 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-all duration-200 hover:scale-110"
                            title="Chỉnh sửa cấu hình"
                          >
                            <SquarePen className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteConfig(config.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all duration-200 hover:scale-110"
                            title="Xóa cấu hình"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <AdsConfigForm
            config={editingConfig}
            onSubmit={editingConfig ? 
              (data) => handleUpdateConfig(editingConfig.id, data as UpdateAdsConfigRequest) : 
              (data) => handleCreateConfig(data as CreateAdsConfigRequest)
            }
            onCancel={handleCancelForm}
            onSelectMedia={() => setShowMediaSelector(true)}
            selectedMedia={selectedMedia}
          />
        )}

        {/* Media Selector Modal */}
        {showMediaSelector && (
          <MediaSelectorModal
            onSelect={handleSelectMedia}
            onCancel={() => setShowMediaSelector(false)}
            mediaType={undefined} // Show all media types (images and videos)
          />
        )}
      </div>
    </div>
  );
}

// Ads Config Form Component
interface AdsConfigFormProps {
  config?: AdsConfig | null;
  onSubmit: (data: CreateAdsConfigRequest | UpdateAdsConfigRequest) => Promise<void>;
  onCancel: () => void;
  onSelectMedia: () => void;
  selectedMedia?: Upload | null;
}

function AdsConfigForm({ config, onSubmit, onCancel, onSelectMedia, selectedMedia }: AdsConfigFormProps) {
  const [formData, setFormData] = useState({
    position: config?.position || AdsPosition.MAIN_ADS,
    title: config?.title || '',
    description: config?.description || '',
    media_url: config?.media_url || '',
    media_type: config?.media_type || MediaType.IMAGE,
    upload_id: config?.upload_id || '',
    link_url: config?.link_url || '',
    is_active: config?.is_active ?? true,
    alt_text: config?.alt_text || '',
    target_audience: config?.target_audience || '',
    start_date: config?.start_date ? new Date(config.start_date).toISOString().slice(0, 16) : '',
    end_date: config?.end_date ? new Date(config.end_date).toISOString().slice(0, 16) : '',
    priority: config?.priority || 1,
  });

  // Update form data when selectedMedia changes
  useEffect(() => {
    if (selectedMedia && !config && selectedMedia.url) {
      setFormData(prev => ({
        ...prev,
        media_url: selectedMedia.url || '',
        media_type: selectedMedia.file_type === 'video' ? MediaType.VIDEO : MediaType.IMAGE,
        upload_id: selectedMedia.upload_id || '',
      }));
    }
  }, [selectedMedia, config]);

  // Reset form data when config changes (for new config)
  useEffect(() => {
    if (!config) {
      setFormData({
        position: AdsPosition.MAIN_ADS,
        title: '',
        description: '',
        media_url: '',
        media_type: MediaType.IMAGE,
        upload_id: '',
        link_url: '',
        is_active: true,
        alt_text: '',
        target_audience: '',
        start_date: '',
        end_date: '',
        priority: 1,
      });
    } else {
      setFormData({
        position: config.position,
        title: config.title,
        description: config.description || '',
        media_url: config.media_url || '',
        media_type: config.media_type,
        upload_id: config.upload_id || '',
        link_url: config.link_url || '',
        is_active: config.is_active,
        alt_text: config.alt_text || '',
        target_audience: config.target_audience || '',
        start_date: config.start_date ? new Date(config.start_date).toISOString().slice(0, 16) : '',
        end_date: config.end_date ? new Date(config.end_date).toISOString().slice(0, 16) : '',
        priority: config.priority,
      });
    }
  }, [config]);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data for submission based on whether it's create or update
      const submitData = config ? {
        // Update request - only include allowed fields
        title: formData.title,
        description: formData.description,
        media_url: formData.media_url,
        media_type: formData.media_type,
        upload_id: formData.upload_id,
        link_url: formData.link_url,
        is_active: formData.is_active,
        alt_text: formData.alt_text,
        target_audience: formData.target_audience,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
        priority: formData.priority,
      } : {
        // Create request - include all fields including position
        position: formData.position,
        title: formData.title,
        description: formData.description,
        media_url: formData.media_url,
        media_type: formData.media_type,
        upload_id: formData.upload_id,
        link_url: formData.link_url,
        is_active: formData.is_active,
        alt_text: formData.alt_text,
        target_audience: formData.target_audience,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
        priority: formData.priority,
      };
      
      await onSubmit(submitData);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // Error handling is done in parent component
      }
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-4 border border-[var(--sidebar-border)] w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-[var(--card-bg)] mb-4">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {config ? 'Sửa cấu hình Ads' : 'Thêm cấu hình Ads mới'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Vị trí *
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value as AdsPosition }))}
                className="w-full px-3 py-2 border border-[var(--sidebar-border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] hover:border-[var(--accent)] transition-colors duration-200"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
                required
              >
                {ADS_POSITIONS.map(position => (
                  <option key={position.value} value={position.value} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>
                    {position.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Loại media *
              </label>
              <select
                value={formData.media_type}
                onChange={(e) => setFormData(prev => ({ ...prev, media_type: e.target.value as MediaType }))}
                className="w-full px-3 py-2 border border-[var(--sidebar-border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] hover:border-[var(--accent)] transition-colors duration-200"
                style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}
                required
              >
                {MEDIA_TYPES.map(type => (
                  <option key={type.value} value={type.value} style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Tiêu đề *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-[var(--sidebar-border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="Nhập tiêu đề cho banner"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-[var(--sidebar-border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="Nhập mô tả cho banner"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Media
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.media_url}
                onChange={(e) => setFormData(prev => ({ ...prev, media_url: e.target.value }))}
                className="flex-1 px-3 py-2 border border-[var(--sidebar-border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] hover:border-[var(--accent)] transition-colors duration-200"
                placeholder="URL hình ảnh hoặc video"
              />
              <button
                type="button"
                onClick={onSelectMedia}
                className="px-4 py-2 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--accent)]/90 hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
              >
                Chọn từ thư viện
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Link URL
            </label>
            <input
              type="url"
              value={formData.link_url}
              onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
              className="w-full px-3 py-2 border border-[var(--sidebar-border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="URL khi click vào banner"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-[var(--foreground)]">Đang hoạt động</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--sidebar-border)]">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] bg-[var(--muted)] hover:bg-[var(--muted)]/80 hover:shadow-md hover:scale-105 rounded-md transition-all duration-200"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent)]/90 hover:shadow-lg hover:scale-105 rounded-md transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : (config ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Media Selector Modal Component
interface MediaSelectorModalProps {
  onSelect: (upload: Upload) => void;
  onCancel: () => void;
  mediaType?: MediaType;
}

function MediaSelectorModal({ onSelect, onCancel }: MediaSelectorModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-4 border border-[var(--sidebar-border)] w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-[var(--card-bg)] mb-4">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Chọn media từ thư viện
          </h2>
        </div>

        <div className="mb-6">
          <MediaGallery
            onSelect={onSelect}
            mediaType="all" // Always show all media types (images and videos)
            category="banners"
            showUpload={false}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] bg-[var(--muted)] hover:bg-[var(--muted)]/80 rounded-md transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
