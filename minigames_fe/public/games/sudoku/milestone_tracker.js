/**
 * Milestone Tracker cho Sudoku
 * Theo dõi việc hoàn thành game và tự động cập nhật spin count
 */

function SudokuMilestoneTracker() {
  this.initialized = false;
  this.userId = null;
  this.apiBaseUrl = null;
  this.completedToday = false;
  
  // Load trạng thái từ localStorage
  this.loadState();
}

SudokuMilestoneTracker.prototype.loadState = function() {
  if (typeof window !== 'undefined' && window.CookieUtils) {
    const savedState = window.CookieUtils.getGameData('sudoku_completion');
    if (savedState) {
      try {
        // Kiểm tra nếu là cùng ngày
        const today = new Date().toDateString();
        if (savedState.date === today) {
          this.completedToday = savedState.completed || false;
        } else {
          // Nếu là ngày mới, reset
          this.completedToday = false;
          this.saveState();
        }
      } catch (e) {
        console.error('Error loading sudoku completion state:', e);
      }
    }
  }
};

SudokuMilestoneTracker.prototype.saveState = function() {
  if (typeof window !== 'undefined' && window.CookieUtils) {
    const today = new Date().toDateString();
    const state = {
      date: today,
      completed: this.completedToday
    };
    window.CookieUtils.setGameData('sudoku_completion', state, 1); // 1 day expiry
  }
};

SudokuMilestoneTracker.prototype.init = function(userId, apiBaseUrl) {
  console.log('[SudokuMilestone] Initializing with userId:', userId, 'apiBaseUrl:', apiBaseUrl);
  this.userId = userId;
  this.apiBaseUrl = apiBaseUrl || (window.MINIGAMES_CONFIG?.API_BASE_URL) || 'https://games-api.vaoluoitv.com';
  this.initialized = true;
  
  console.log('[SudokuMilestone] Initialization complete');
  // Tạo UI milestone indicator
  this.createMilestoneUI();
  
  // Load trạng thái completion từ server
  this.syncWithServer();
};

SudokuMilestoneTracker.prototype.syncWithServer = async function() {
  if (!this.userId || !this.initialized) return;
  
  try {
    const token = window.CookieUtils ? window.CookieUtils.getAuthToken() : null;
    console.log('[SudokuMilestone] Syncing with server, token:', token ? 'exists (length: ' + token.length + ')' : 'NOT FOUND');
    
    if (!token) {
      console.warn('[SudokuMilestone] No auth token found, skipping sync');
      return;
    }
    
    const response = await fetch(`${this.apiBaseUrl}/spins/${this.userId}/sudoku-milestone-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('[SudokuMilestone] Sync successful, received:', data);
      if (data.completedToday !== undefined) {
        this.completedToday = data.completedToday;
        this.saveState();
        this.updateMilestoneUI();
      }
    } else {
      console.error('[SudokuMilestone] Sync failed with status:', response.status);
      const errorText = await response.text().catch(() => 'Unable to read error');
      console.error('[SudokuMilestone] Error response:', errorText);
    }
  } catch (error) {
    console.error('[SudokuMilestone] Error syncing completion status:', error);
  }
};

SudokuMilestoneTracker.prototype.onGameComplete = function() {
  console.log('[SudokuMilestone] onGameComplete called');
  console.log('[SudokuMilestone] initialized:', this.initialized);
  console.log('[SudokuMilestone] userId:', this.userId);
  console.log('[SudokuMilestone] completedToday:', this.completedToday);
  
  if (!this.initialized || !this.userId) {
    console.error('[SudokuMilestone] Not initialized or no userId');
    return;
  }
  
  // Nếu đã hoàn thành hôm nay rồi thì không làm gì
  if (this.completedToday) {
    console.log('[SudokuMilestone] Sudoku already completed today');
    return;
  }
  
  console.log('[SudokuMilestone] Processing completion...');
  // Đánh dấu là đã hoàn thành và report lên server
  this.completedToday = true;
  this.saveState();
  this.updateMilestoneUI();
  this.reportCompletion();
};

SudokuMilestoneTracker.prototype.reportCompletion = async function() {
  if (!this.userId || !this.initialized) return;
  
  try {
    const token = window.CookieUtils ? window.CookieUtils.getAuthToken() : null;
    if (!token) {
      console.log('No auth token found');
      return;
    }
    
    const response = await fetch(`${this.apiBaseUrl}/spins/${this.userId}/sudoku-milestone`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ completed: true })
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        this.showCompletionNotification(result.spinsEarned);
        console.log(`Sudoku completed! Earned ${result.spinsEarned} spins`);
      } else {
        console.log(result.message || 'Sudoku already completed today');
      }
    } else {
      console.error('Failed to report sudoku completion:', response.status);
    }
  } catch (error) {
    console.error('Error reporting sudoku completion:', error);
  }
};

SudokuMilestoneTracker.prototype.showCompletionNotification = function(spinsEarned) {
  // Tạo notification element
  const notification = document.createElement('div');
  notification.className = 'milestone-notification';
  notification.innerHTML = `
    <div class="milestone-content">
      <div class="milestone-icon">🎉</div>
      <div class="milestone-text">
        <strong>Hoàn thành Sudoku!</strong><br>
        <span>Bạn đã hoàn thành Sudoku và nhận ${spinsEarned} spins!</span>
      </div>
    </div>
  `;
  
  // Thêm styles inline
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideInRight 0.5s ease-out;
    min-width: 280px;
    font-family: Arial, sans-serif;
  `;
  
  // Thêm vào body
  document.body.appendChild(notification);
  
  // Tự động xóa sau 5 giây
  setTimeout(function() {
    notification.style.animation = 'slideOutRight 0.5s ease-out';
    setTimeout(function() {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 500);
  }, 5000);
};

SudokuMilestoneTracker.prototype.createMilestoneUI = function() {
  // Kiểm tra nếu đã có milestone indicator thì không tạo nữa
  if (document.getElementById('sudoku-milestone-indicator')) return;
  
  const container = document.createElement('div');
  container.id = 'sudoku-milestone-indicator';
  container.className = 'sudoku-milestone-container';
  
  container.innerHTML = `
    <div class="sudoku-milestone-header">
      <h3>🎯 Phần thưởng hôm nay</h3>
    </div>
    <div class="sudoku-milestone-item">
      <div class="sudoku-milestone-circle">
        <div class="sudoku-milestone-icon">🎁</div>
        <div class="sudoku-milestone-checkmark">✓</div>
      </div>
      <div class="sudoku-milestone-info">
        <div class="sudoku-milestone-label">Hoàn thành Sudoku</div>
        <div class="sudoku-milestone-reward">+3 spins</div>
      </div>
    </div>
  `;
  
  // Thêm vào body (ở đầu)
  document.body.insertBefore(container, document.body.firstChild);
  
  // Update UI với trạng thái hiện tại
  this.updateMilestoneUI();
};

SudokuMilestoneTracker.prototype.updateMilestoneUI = function() {
  const indicator = document.getElementById('sudoku-milestone-indicator');
  if (!indicator) return;
  
  const item = indicator.querySelector('.sudoku-milestone-item');
  if (item) {
    if (this.completedToday) {
      item.classList.add('completed');
    } else {
      item.classList.remove('completed');
    }
  }
};

SudokuMilestoneTracker.prototype.reset = function() {
  this.completedToday = false;
  this.saveState();
  this.updateMilestoneUI();
};

// Thêm styles cho notification animations và milestone UI
if (typeof window !== 'undefined' && !document.getElementById('sudoku-milestone-styles')) {
  const style = document.createElement('style');
  style.id = 'sudoku-milestone-styles';
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
    
    .milestone-notification .milestone-content {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .milestone-notification .milestone-icon {
      font-size: 32px;
      animation: bounce 1s infinite;
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    .milestone-notification .milestone-text {
      line-height: 1.4;
    }
    
    .milestone-notification .milestone-text strong {
      font-size: 16px;
      display: block;
      margin-bottom: 4px;
    }
    
    .milestone-notification .milestone-text span {
      font-size: 14px;
      opacity: 0.95;
    }
    
    /* Sudoku Milestone Indicator Styles */
    .sudoku-milestone-container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      margin: 15px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    
    .sudoku-milestone-header h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: bold;
    }
    
    .sudoku-milestone-item {
      display: flex;
      align-items: center;
      gap: 15px;
      background: rgba(255, 255, 255, 0.15);
      padding: 12px;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .sudoku-milestone-item.completed {
      background: rgba(65, 195, 0, 0.3);
    }
    
    .sudoku-milestone-circle {
      position: relative;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    
    .sudoku-milestone-item.completed .sudoku-milestone-circle {
      background: rgba(65, 195, 0, 0.5);
    }
    
    .sudoku-milestone-icon {
      font-size: 24px;
      transition: opacity 0.3s ease;
    }
    
    .sudoku-milestone-item.completed .sudoku-milestone-icon {
      opacity: 0;
    }
    
    .sudoku-milestone-checkmark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 28px;
      font-weight: bold;
      color: #41c300;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .sudoku-milestone-item.completed .sudoku-milestone-checkmark {
      opacity: 1;
    }
    
    .sudoku-milestone-info {
      flex: 1;
    }
    
    .sudoku-milestone-label {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .sudoku-milestone-reward {
      font-size: 13px;
      opacity: 0.9;
      font-weight: 500;
    }
  `;
  document.head.appendChild(style);
}

// Export global instance
window.sudokuMilestoneTracker = new SudokuMilestoneTracker();

