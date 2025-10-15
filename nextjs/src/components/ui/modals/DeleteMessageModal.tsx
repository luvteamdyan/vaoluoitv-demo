"use client";
import React, { useState } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";

interface DeleteMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  username: string;
  message: string;
}

export default function DeleteMessageModal({
  isOpen,
  onClose,
  onConfirm,
  username,
  message,
}: DeleteMessageModalProps) {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do xóa tin nhắn");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onConfirm(reason.trim());
      onClose();
      setReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa tin nhắn");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason("");
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-red-500/30 rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-red-500/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Xóa tin nhắn
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Warning */}
          <div className="flex items-start space-x-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-red-300 font-medium mb-1">
                Cảnh báo: Hành động này không thể hoàn tác
              </p>
              <p className="text-gray-400">
                Tin nhắn sẽ bị xóa vĩnh viễn và không thể khôi phục.
              </p>
            </div>
          </div>

          {/* Message preview */}
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Tin nhắn từ <span className="text-yellow-400 font-medium">{username}</span>:</p>
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
              <p className="text-gray-200 text-sm break-words">
                {message.length > 100 ? `${message.substring(0, 100)}...` : message}
              </p>
            </div>
          </div>

          {/* Reason input */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-2">
                Lý do xóa tin nhắn <span className="text-red-400">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do xóa tin nhắn..."
                disabled={isLoading}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading || !reason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa tin nhắn</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
