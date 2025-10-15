/**
 * Milestone Tracker cho game 2048
 * Theo dõi các mốc điểm và tự động cập nhật spin count
 */

function MilestoneTracker() {
  this.milestones = [256, 512, 1024, 2048];
  this.achievedMilestones = new Set();
  this.initialized = false;
  this.userId = null;
  this.apiBaseUrl = null;
  
  // Load trạng thái từ localStorage
  this.loadState();
}

MilestoneTracker.prototype.loadState = function() {
  if (typeof window !== 'undefined' && window.CookieUtils) {
    const savedState = window.CookieUtils.getGameData('2048_milestones');
    if (savedState) {
      try {
        // Kiểm tra nếu là cùng ngày
        const today = new Date().toDateString();
        if (savedState.date === today && Array.isArray(savedState.achieved)) {
          this.achievedMilestones = new Set(savedState.achieved);
        } else {
          // Nếu là ngày mới, reset
          this.achievedMilestones = new Set();
          this.saveState();
        }
      } catch (e) {
        console.error('Error loading milestone state:', e);
      }
    }
  }
};

MilestoneTracker.prototype.saveState = function() {
  if (typeof window !== 'undefined' && window.CookieUtils) {
    const today = new Date().toDateString();
    const state = {
      date: today,
      achieved: Array.from(this.achievedMilestones)
    };
    window.CookieUtils.setGameData('2048_milestones', state, 1); // 1 day expiry for daily milestones
  }
};

MilestoneTracker.prototype.init = function(userId, apiBaseUrl) {
  this.userId = userId;
  this.apiBaseUrl = apiBaseUrl || (window.MINIGAMES_CONFIG?.API_BASE_URL) || 'https://games-api.vaoluoitv.com';
  this.initialized = true;
  
  // Tạo UI milestone bar
  this.createMilestoneUI();
  
  // Load trạng thái milestone từ server
  this.syncWithServer();
};

MilestoneTracker.prototype.syncWithServer = async function() {
  if (!this.userId || !this.initialized) return;
  
  try {
    const token = window.CookieUtils ? window.CookieUtils.getAuthToken() : null;
    
    if (!token) {
      console.warn('[MilestoneTracker] No auth token found, skipping sync');
      return;
    }
    
    const response = await fetch(`${this.apiBaseUrl}/spins/${this.userId}/2048-milestone-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.achievedMilestones && Array.isArray(data.achievedMilestones)) {
        this.achievedMilestones = new Set(data.achievedMilestones);
        this.saveState();
        this.updateMilestoneUI();
      }
    } else {
      console.error('[MilestoneTracker] Sync failed with status:', response.status);
      const errorText = await response.text().catch(() => 'Unable to read error');
      console.error('[MilestoneTracker] Error response:', errorText);
    }
  } catch (error) {
    console.error('[MilestoneTracker] Error syncing milestone status:', error);
  }
};

MilestoneTracker.prototype.checkMilestone = function(tileValue) {
  if (!this.initialized || !this.userId) return;
  
  if (this.milestones.includes(tileValue) && !this.achievedMilestones.has(tileValue)) {
    this.achievedMilestones.add(tileValue);
    this.saveState();
    this.updateMilestoneUI();
    this.reportMilestone(tileValue);
  }
};

MilestoneTracker.prototype.reportMilestone = async function(milestone) {
  if (!this.userId || !this.initialized) return;
  
  try {
    const token = window.CookieUtils ? window.CookieUtils.getAuthToken() : null;
    if (!token) {
      return;
    }
    
    const response = await fetch(`${this.apiBaseUrl}/spins/${this.userId}/2048-milestone`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ milestone: milestone })
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        this.showMilestoneNotification(milestone, result.spinsEarned);
      } else {
      }
    } else {
      console.error('Failed to report milestone:', response.status);
    }
  } catch (error) {
    console.error('Error reporting milestone:', error);
  }
};

MilestoneTracker.prototype.showMilestoneNotification = function(milestone, spinsEarned) {
  // Tạo notification element
  const notification = document.createElement('div');
  notification.className = 'milestone-notification';
  notification.innerHTML = `
    <div class="milestone-content">
      <div class="milestone-icon">🎉</div>
      <div class="milestone-text">
        <strong>Milestone Đạt!</strong><br>
        <span>Bạn đạt ${milestone} điểm và nhận ${spinsEarned} spins!</span>
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

MilestoneTracker.prototype.createMilestoneUI = function() {
  // Kiểm tra nếu đã có milestone bar thì không tạo nữa
  if (document.getElementById('milestone-progress-bar')) return;
  
  const container = document.createElement('div');
  container.id = 'milestone-progress-bar';
  container.className = 'milestone-progress-container';
  
  // Tạo header
  const header = document.createElement('div');
  header.className = 'milestone-header';
  header.innerHTML = '<h3>Mốc phần thưởng</h3>';
  container.appendChild(header);
  
  // Tạo progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'milestone-bar';
  
  // Mapping rewards
  const rewards = {
    256: 2,
    512: 3,
    1024: 4,
    2048: 5
  };
  
  // Tạo từng milestone item
  this.milestones.forEach((milestone, index) => {
    const item = document.createElement('div');
    item.className = 'milestone-item';
    item.setAttribute('data-milestone', milestone);
    
    // Connector line (không có cho item đầu tiên)
    if (index > 0) {
      const connector = document.createElement('div');
      connector.className = 'milestone-connector';
      progressBar.appendChild(connector);
    }
    
    // Milestone circle
    const circle = document.createElement('div');
    circle.className = 'milestone-circle';
    
    // Milestone icon
    const icon = document.createElement('div');
    icon.className = 'milestone-icon';
    icon.textContent = '🎁';
    circle.appendChild(icon);
    
    // Checkmark for completed
    const checkmark = document.createElement('div');
    checkmark.className = 'milestone-checkmark';
    checkmark.innerHTML = '✓';
    circle.appendChild(checkmark);
    
    item.appendChild(circle);
    
    // Milestone info
    const info = document.createElement('div');
    info.className = 'milestone-info';
    info.innerHTML = `
      <div class="milestone-value">${milestone}</div>
      <div class="milestone-reward">+${rewards[milestone]} spins</div>
    `;
    item.appendChild(info);
    
    progressBar.appendChild(item);
  });
  
  container.appendChild(progressBar);
  
  // Thêm vào container chính của game
  const gameContainer = document.querySelector('.container');
  if (gameContainer) {
    // Insert sau heading
    const heading = gameContainer.querySelector('.heading');
    if (heading && heading.nextSibling) {
      gameContainer.insertBefore(container, heading.nextSibling);
    } else {
      gameContainer.insertBefore(container, gameContainer.firstChild);
    }
  }
  
  // Update UI với trạng thái hiện tại
  this.updateMilestoneUI();
};

MilestoneTracker.prototype.updateMilestoneUI = function() {
  this.milestones.forEach((milestone) => {
    const item = document.querySelector(`[data-milestone="${milestone}"]`);
    if (item) {
      if (this.achievedMilestones.has(milestone)) {
        item.classList.add('achieved');
        // Animate the achievement
        if (!item.classList.contains('animated')) {
          item.classList.add('animated');
          setTimeout(() => {
            item.classList.remove('animated');
          }, 1000);
        }
      } else {
        item.classList.remove('achieved');
      }
    }
  });
  
  // Update connectors
  const connectors = document.querySelectorAll('.milestone-connector');
  connectors.forEach((connector, index) => {
    const prevMilestone = this.milestones[index];
    const nextMilestone = this.milestones[index + 1];
    
    if (this.achievedMilestones.has(prevMilestone) && this.achievedMilestones.has(nextMilestone)) {
      connector.classList.add('completed');
    } else {
      connector.classList.remove('completed');
    }
  });
};

MilestoneTracker.prototype.reset = function() {
  this.achievedMilestones.clear();
  this.saveState();
  this.updateMilestoneUI();
};

// Thêm styles cho notification animations
if (typeof window !== 'undefined' && !document.getElementById('milestone-notification-styles')) {
  const style = document.createElement('style');
  style.id = 'milestone-notification-styles';
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
  `;
  document.head.appendChild(style);
}

// Export global instance
window.milestoneTracker = new MilestoneTracker();

