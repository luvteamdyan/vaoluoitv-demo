/**
 * AuthDebugInfo Component
 * 
 * Component để hiển thị thông tin debug về authentication
 * Chỉ hiển thị trong môi trường development
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { decodeJWT, getTokenExpiryString } from '../../utils/jwt';

interface AuthDebugInfoProps {
  show?: boolean;
}

export const AuthDebugInfo: React.FC<AuthDebugInfoProps> = ({ show = false }) => {
  const { user, tokenSource, isPostMessageListening } = useAuth();

  // Chỉ hiển thị trong development hoặc khi được bật
  if (process.env.NODE_ENV !== 'development' && !show) {
    return null;
  }

  // Get token info for debugging
  const token = authService.getToken();
  const decodedToken = token ? decodeJWT(token) : null;
  const tokenExpiry = decodedToken ? getTokenExpiryString(decodedToken.payload) : 'N/A';
  
  // Check if token is in URL
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const hasTokenInURL = urlParams.has('token');

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-sm z-50">
      <div className="mb-2 font-bold text-yellow-400">Auth Debug Info</div>
      
      <div className="space-y-1">
        <div>
          <span className="text-gray-400">Token Source:</span> 
          <span className={`ml-2 px-2 py-1 rounded text-xs ${
            tokenSource === 'luck8event' ? 'bg-green-600' : 
            tokenSource === 'url-token' ? 'bg-blue-600' : 
            'bg-gray-600'
          }`}>
            {tokenSource || 'none'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">PostMessage:</span> 
          <span className={`ml-2 px-2 py-1 rounded text-xs ${
            isPostMessageListening ? 'bg-green-600' : 'bg-gray-600'
          }`}>
            {isPostMessageListening ? 'listening' : 'idle'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">Token in URL:</span> 
          <span className={`ml-2 px-2 py-1 rounded text-xs ${
            hasTokenInURL ? 'bg-yellow-600' : 'bg-gray-600'
          }`}>
            {hasTokenInURL ? 'yes' : 'no'}
          </span>
        </div>
        
        {token && (
          <div>
            <span className="text-gray-400">Token Expiry:</span> 
            <span className="ml-2 text-orange-400 text-xs">
              {tokenExpiry}
            </span>
          </div>
        )}
        
        {user && (
          <div>
            <span className="text-gray-400">User:</span> 
            <span className="ml-2 text-green-400">
              {user.username || user.email}
            </span>
          </div>
        )}
        
        <div>
          <span className="text-gray-400">Domain:</span> 
          <span className="ml-2 text-blue-400">
            {typeof window !== 'undefined' ? window.location.hostname : 'unknown'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">In iframe:</span> 
          <span className={`ml-2 px-2 py-1 rounded text-xs ${
            typeof window !== 'undefined' && window.self !== window.top ? 'bg-yellow-600' : 'bg-gray-600'
          }`}>
            {typeof window !== 'undefined' && window.self !== window.top ? 'yes' : 'no'}
          </span>
        </div>
      </div>
    </div>
  );
};
