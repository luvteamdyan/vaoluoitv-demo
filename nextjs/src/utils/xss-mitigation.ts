/**
 * Immediate XSS mitigation utilities
 * Use these functions if XSS attacks are detected in real-time
 */

/**
 * Convert all chat messages to plain text (immediate mitigation)
 */
export function convertMessagesToText(): void {
  const chatMessages = document.querySelectorAll('.chat-message');
  let convertedCount = 0;
  
  chatMessages.forEach((element) => {
    const textContent = element.textContent || '';
    element.textContent = textContent;
    convertedCount++;
  });
  
  
  // Show user notification
  showMitigationNotification(`Đã chuyển ${convertedCount} tin nhắn thành văn bản thuần để bảo vệ khỏi XSS`);
}

/**
 * Remove suspicious messages from DOM
 */
export function removeSuspiciousMessages(): void {
  const chatMessages = document.querySelectorAll('.chat-message');
  let removedCount = 0;
  
  chatMessages.forEach((element) => {
    const textContent = element.textContent || '';
    
    // Check for dangerous patterns
    if (/eval\s*\(|decodeURIComponent|atob|<script|javascript:|on\w+\s*=/i.test(textContent)) {
      element.remove();
      removedCount++;
    }
  });
  
  
  if (removedCount > 0) {
    showMitigationNotification(`Đã xóa ${removedCount} tin nhắn đáng ngờ khỏi chat`);
  }
}

/**
 * Sanitize all message content in real-time
 */
export function sanitizeAllMessages(): void {
  const chatMessages = document.querySelectorAll('.chat-message');
  let sanitizedCount = 0;
  
  chatMessages.forEach((element) => {
    const originalContent = element.innerHTML;
    
    // Remove HTML tags and escape special characters
    const sanitizedContent = originalContent
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\//g, '&#x2F;');
    
    if (originalContent !== sanitizedContent) {
      element.innerHTML = sanitizedContent;
      sanitizedCount++;
    }
  });
  
  
  if (sanitizedCount > 0) {
    showMitigationNotification(`Đã làm sạch ${sanitizedCount} tin nhắn để bảo vệ khỏi XSS`);
  }
}

/**
 * Disable all interactive elements temporarily
 */
export function disableInteractiveElements(): void {
  const interactiveElements = document.querySelectorAll('button, input, textarea, select, a[href]');
  let disabledCount = 0;
  
  interactiveElements.forEach((element) => {
    if (element instanceof HTMLElement) {
      element.style.pointerEvents = 'none';
      element.style.opacity = '0.5';
      element.setAttribute('data-disabled-by-mitigation', 'true');
      disabledCount++;
    }
  });
  
  
  showMitigationNotification(`Đã tạm thời vô hiệu hóa ${disabledCount} phần tử tương tác để bảo vệ khỏi XSS`);
  
  // Re-enable after 30 seconds
  setTimeout(() => {
    reEnableInteractiveElements();
  }, 30000);
}

/**
 * Re-enable interactive elements
 */
export function reEnableInteractiveElements(): void {
  const disabledElements = document.querySelectorAll('[data-disabled-by-mitigation="true"]');
  let enabledCount = 0;
  
  disabledElements.forEach((element) => {
    if (element instanceof HTMLElement) {
      element.style.pointerEvents = '';
      element.style.opacity = '';
      element.removeAttribute('data-disabled-by-mitigation');
      enabledCount++;
    }
  });
  
  
  if (enabledCount > 0) {
    showMitigationNotification(`Đã khôi phục ${enabledCount} phần tử tương tác`);
  }
}

/**
 * Clear all form inputs
 */
export function clearFormInputs(): void {
  const inputs = document.querySelectorAll('input, textarea, select');
  let clearedCount = 0;
  
  inputs.forEach((input) => {
    if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement) {
      input.value = '';
      clearedCount++;
    }
  });
  
  
  if (clearedCount > 0) {
    showMitigationNotification(`Đã xóa nội dung của ${clearedCount} trường nhập liệu`);
  }
}

/**
 * Block all external requests
 */
export function blockExternalRequests(): void {
  // Override fetch
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && !url.startsWith(window.location.origin)) {
      console.warn('XSS Mitigation: Blocked external request to', url);
      return Promise.reject(new Error('External requests blocked by XSS mitigation'));
    }
    return originalFetch.apply(this, args);
  };
  
  // Override XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
    if (typeof url === 'string' && !url.startsWith(window.location.origin)) {
      console.warn('XSS Mitigation: Blocked external XHR request to', url);
      throw new Error('External requests blocked by XSS mitigation');
    }
    return originalXHROpen.call(this, method, url, async ?? true, username, password);
  };
  
  showMitigationNotification('Đã chặn tất cả yêu cầu đến các trang web bên ngoài');
}

/**
 * Show mitigation notification to user
 */
function showMitigationNotification(message: string): void {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff4444;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    max-width: 400px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    line-height: 1.4;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <div style="font-size: 18px;">🛡️</div>
      <div>
        <strong>Bảo vệ XSS</strong><br>
        ${message}
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}

/**
 * Emergency XSS mitigation - run all protective measures
 */
export function emergencyXSSMitigation(): void {
  console.warn('XSS Mitigation: Emergency mode activated');
  
  // Run all mitigation measures
  convertMessagesToText();
  removeSuspiciousMessages();
  sanitizeAllMessages();
  disableInteractiveElements();
  clearFormInputs();
  blockExternalRequests();
  
  // Show emergency notification
  const emergencyNotification = document.createElement('div');
  emergencyNotification.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #ff0000;
    color: white;
    padding: 20px;
    text-align: center;
    z-index: 10001;
    font-family: Arial, sans-serif;
    font-size: 16px;
    font-weight: bold;
  `;
  
  emergencyNotification.innerHTML = `
    🚨 CẢNH BÁO BẢO MẬT: Đã phát hiện tấn công XSS. Hệ thống đã tự động bảo vệ. Vui lòng làm mới trang để tiếp tục sử dụng an toàn.
  `;
  
  document.body.insertBefore(emergencyNotification, document.body.firstChild);
  
  // Auto-refresh after 10 seconds
  setTimeout(() => {
    window.location.reload();
  }, 10000);
}

/**
 * Initialize XSS monitoring
 */
export function initializeXSSMonitoring(): void {
  // Monitor for suspicious DOM changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const textContent = element.textContent || '';
            
            // Check for dangerous patterns in new content
            if (/<script|javascript:|on\w+\s*=|eval\s*\(/i.test(textContent)) {
              console.warn('XSS Mitigation: Suspicious content detected in new DOM node');
              element.remove();
              showMitigationNotification('Đã xóa nội dung đáng ngờ vừa được thêm vào trang');
            }
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  
}

// Auto-initialize monitoring when script loads
if (typeof window !== 'undefined') {
  initializeXSSMonitoring();
}
