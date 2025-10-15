"use client";
import React, { useState } from "react";
import { X, Shield, MicOff, UserX, Clock } from "lucide-react";

interface AdminActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, duration?: number) => void;
  action: 'ban' | 'mute' | 'kick';
  username: string;
  userId: string;
}

export default function AdminActionModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  username,
  userId,
}: AdminActionModalProps) {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState<number>(action === 'kick' ? 15 : 0);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const getActionInfo = () => {
    switch (action) {
      case 'ban':
        return {
          title: 'Ban User',
          icon: <Shield className="w-6 h-6 text-red-500" />,
          description: `Ban ${username || 'user'} from this chat`,
          color: 'red',
          showDuration: true,
        };
      case 'mute':
        return {
          title: 'Mute User',
          icon: <MicOff className="w-6 h-6 text-yellow-500" />,
          description: `Mute ${username || 'user'} in this chat`,
          color: 'yellow',
          showDuration: true,
        };
      case 'kick':
        return {
          title: 'Kick User',
          icon: <UserX className="w-6 h-6 text-orange-500" />,
          description: `Kick ${username || 'user'} from this chat`,
          color: 'orange',
          showDuration: true,
        };
      default:
        return {
          title: 'Admin Action',
          icon: <Shield className="w-6 h-6 text-gray-500" />,
          description: 'Perform admin action',
          color: 'gray',
          showDuration: false,
        };
    }
  };

  const actionInfo = getActionInfo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsLoading(true);
    try {
      await onConfirm(reason.trim(), action === 'kick' ? duration : (duration > 0 ? duration : undefined));
      onClose();
      setReason("");
      setDuration(0);
    } catch (error) {
      console.error('Error performing admin action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDurationOptions = () => {
    if (action === 'kick') {
      // Kick options: shorter durations (temporary removal)
      return [
        { value: 5, label: '5 minutes' },
        { value: 15, label: '15 minutes' },
        { value: 30, label: '30 minutes' },
        { value: 60, label: '1 hour' },
        { value: 120, label: '2 hours' },
      ];
    } else {
      // Ban/Mute options: longer durations (serious punishment)
      return [
        { value: 0, label: 'Permanent' },
        { value: 60, label: '1 hour' },
        { value: 240, label: '4 hours' },
        { value: 1440, label: '24 hours' },
        { value: 4320, label: '3 days' },
        { value: 10080, label: '7 days' },
        { value: 43200, label: '30 days' },
      ];
    }
  };

  const durationOptions = getDurationOptions();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            {actionInfo.icon}
            <div>
              <h3 className="text-lg font-semibold text-white">{actionInfo.title}</h3>
              <p className="text-sm text-gray-400">{actionInfo.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* User Info */}
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {(username || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">{username || 'Unknown User'}</p>
                <p className="text-xs text-gray-400">ID: {userId}</p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for this action..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows={3}
              required
            />
          </div>

          {/* Duration */}
          {actionInfo.showDuration && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration
              </label>
              <div className="relative">
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
                >
                  {durationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Clock className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason.trim() || isLoading}
              className={`flex-1 px-4 py-2 bg-${actionInfo.color}-600 text-white rounded-lg hover:bg-${actionInfo.color}-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {actionInfo.icon}
                  <span>{actionInfo.title}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
