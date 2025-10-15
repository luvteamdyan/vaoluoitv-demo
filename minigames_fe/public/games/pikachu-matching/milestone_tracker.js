/**
 * Milestone Tracker cho Pikachu Matching Game
 * Theo dõi khi người chơi hoàn thành game và tự động cập nhật spin count
 */

function PikachuMilestoneTracker() {
  this.milestones = [1]; // 1 = hoàn thành tất cả các cặp
  this.achievedMilestones = new Set();
  this.initialized = false;
  this.userId = null;
  this.apiBaseUrl = null;
  
  // Load trạng thái từ localStorage
  this.loadState();
}

PikachuMilestoneTracker.prototype.loadState = function() {
  if (typeof window !== 'undefined' && window.CookieUtils) {
    const savedState = window.CookieUtils.getGameData('pikachu_milestones');
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

PikachuMilestoneTracker.prototype.saveState = function() {
  if (typeof window !== 'undefined' && window.CookieUtils) {
    const today = new Date().toDateString();
    const state = {
      date: today,
      achieved: Array.from(this.achievedMilestones)
    };
    window.CookieUtils.setGameData('pikachu_milestones', state, 1); // 1 day expiry for daily milestones
  }
};

PikachuMilestoneTracker.prototype.init = function(userId, apiBaseUrl) {
  this.userId = userId;
  this.apiBaseUrl = apiBaseUrl || (window.MINIGAMES_CONFIG?.API_BASE_URL) || 'https://games-api.vaoluoitv.com';
  this.initialized = true;
  
  // Load trạng thái milestone từ server
  this.syncWithServer();
};

PikachuMilestoneTracker.prototype.syncWithServer = async function() {
  if (!this.userId || !this.initialized) return;
  
  try {
    const token = window.CookieUtils ? window.CookieUtils.getAuthToken() : null;
    
    if (!token) {
      console.warn('[PikachuMilestone] No auth token found, skipping sync');
      return;
    }
    
    const response = await fetch(`${this.apiBaseUrl}/spins/${this.userId}/pikachu-milestone-status`, {
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
      }
    } else {
      console.error('[PikachuMilestone] Sync failed with status:', response.status);
      const errorText = await response.text().catch(() => 'Unable to read error');
      console.error('[PikachuMilestone] Error response:', errorText);
    }
  } catch (error) {
    console.error('[PikachuMilestone] Error syncing milestone status:', error);
  }
};

PikachuMilestoneTracker.prototype.checkGameComplete = function(isComplete) {
  if (!this.initialized || !this.userId) return;
  
  // Nếu game hoàn thành và chưa đạt milestone này hôm nay
  if (isComplete && !this.achievedMilestones.has(1)) {
    this.achievedMilestones.add(1);
    this.saveState();
    this.reportMilestone(1);
  }
};

PikachuMilestoneTracker.prototype.reportMilestone = async function(milestone) {
  if (!this.userId || !this.initialized) return;
  
  try {
    const token = window.CookieUtils ? window.CookieUtils.getAuthToken() : null;
    if (!token) {
      return;
    }
    
    const response = await fetch(`${this.apiBaseUrl}/spins/${this.userId}/pikachu-milestone`, {
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
      }
    } else {
      console.error('Failed to report milestone:', response.status);
    }
  } catch (error) {
    console.error('Error reporting milestone:', error);
  }
};

PikachuMilestoneTracker.prototype.showMilestoneNotification = function(milestone, spinsEarned) {
  // Tạo notification element
  const notification = document.createElement('div');
  notification.className = 'milestone-notification';
  notification.innerHTML = `
    <div class="milestone-content">
      <div class="milestone-icon">🎉</div>
      <div class="milestone-text">
        <strong>Chúc mừng hoàn thành!</strong><br>
        <span>Bạn đã hoàn thành Pikachu Matching và nhận ${spinsEarned} spins!</span>
      </div>
    </div>
  `;
  
  // Thêm styles inline
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #ffa500 0%, #ff6b00 100%);
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

PikachuMilestoneTracker.prototype.reset = function() {
  this.achievedMilestones.clear();
  this.saveState();
};

// Thêm styles cho notification animations
if (typeof window !== 'undefined' && !document.getElementById('pikachu-milestone-notification-styles')) {
  const style = document.createElement('style');
  style.id = 'pikachu-milestone-notification-styles';
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
window.pikachuMilestoneTracker = new PikachuMilestoneTracker();

