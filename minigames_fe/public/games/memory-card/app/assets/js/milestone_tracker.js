/**
 * Milestone Tracker cho Memory Card Game
 * Theo dõi hoàn thành 5 levels và tự động trao 5 spins
 */


function MemoryCardMilestoneTracker() {
  this.initialized = false;
  this.userId = null;
  this.apiBaseUrl = null;
  this.completedToday = false;
  
  // Load trạng thái từ cookies
  this.loadState();
}

MemoryCardMilestoneTracker.prototype.loadState = function() {
  if (typeof window !== 'undefined' && window.CookieUtils) {
    const savedState = window.CookieUtils.getGameData('memory_card_completion');
    if (savedState) {
      try {
        // Kiểm tra nếu là cùng ngày
        const today = new Date().toDateString();
        if (savedState.date === today && savedState.completed === true) {
          this.completedToday = true;
        } else {
          // Nếu là ngày mới, reset
          this.completedToday = false;
          this.saveState();
        }
      } catch (e) {
        console.error('[MemoryCard] Error loading completion state:', e);
      }
    }
  }
};

MemoryCardMilestoneTracker.prototype.saveState = function() {
  if (typeof window !== 'undefined' && window.CookieUtils) {
    const today = new Date().toDateString();
    const state = {
      date: today,
      completed: this.completedToday
    };
    window.CookieUtils.setGameData('memory_card_completion', state, 1); // 1 day expiry
  }
};

MemoryCardMilestoneTracker.prototype.init = function(userId, apiBaseUrl) {
  this.userId = userId;
  this.apiBaseUrl = apiBaseUrl || (window.MINIGAMES_CONFIG?.API_BASE_URL) || 'https://games-api.vaoluoitv.com';
  this.initialized = true;
  
  
  // Sync với server để kiểm tra trạng thái
  this.syncWithServer();
};

MemoryCardMilestoneTracker.prototype.syncWithServer = async function() {
  if (!this.userId || !this.initialized) return;
  
  try {
    const token = window.CookieUtils ? window.CookieUtils.getAuthToken() : null;
    
    if (!token) {
      console.warn('[MemoryCard] No auth token found, skipping sync');
      return;
    }
    
    const response = await fetch(`${this.apiBaseUrl}/spins/${this.userId}/memory-card-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.completedToday !== undefined) {
        this.completedToday = data.completedToday;
        this.saveState();
      }
    } else {
      // Nếu endpoint chưa có, không làm gì
    }
  } catch (error) {
  }
};

/**
 * Gọi khi người chơi hoàn thành level 5 (đã hoàn thành tất cả 5 levels)
 */
MemoryCardMilestoneTracker.prototype.onCompleteAllLevels = function() {
  if (!this.initialized || !this.userId) {
    console.warn('[MemoryCard] Tracker not initialized');
    return;
  }
  
  // Nếu đã hoàn thành hôm nay rồi thì không làm gì
  if (this.completedToday) {
    this.showAlreadyCompletedNotification();
    return;
  }
  
  // Đánh dấu đã hoàn thành
  this.completedToday = true;
  this.saveState();
  
  // Gửi lên server để nhận thưởng
  this.reportCompletion();
};

MemoryCardMilestoneTracker.prototype.reportCompletion = async function() {
  if (!this.userId || !this.initialized) return;
  
  try {
    const token = window.CookieUtils ? window.CookieUtils.getAuthToken() : null;
    if (!token) {
      console.error('[MemoryCard] No auth token found');
      return;
    }
    
    
    const response = await fetch(`${this.apiBaseUrl}/spins/${this.userId}/memory-card-complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        completed: true,
        timestamp: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      
      if (result.success) {
        this.showCompletionNotification(result.spinsEarned || 5);
      } else {
        this.showAlreadyCompletedNotification();
      }
    } else {
      const errorText = await response.text();
      console.error('[MemoryCard] Failed to report completion:', response.status, errorText);
    }
  } catch (error) {
    console.error('[MemoryCard] Error reporting completion:', error);
  }
};

MemoryCardMilestoneTracker.prototype.showCompletionNotification = function(spinsEarned) {
  // Tạo notification element
  const notification = document.createElement('div');
  notification.className = 'memory-card-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">🎉</div>
      <div class="notification-text">
        <strong>Chúc mừng!</strong><br>
        <span>Bạn đã hoàn thành tất cả 5 levels và nhận được ${spinsEarned} lượt quay!</span>
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
    padding: 20px 25px;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    z-index: 10000;
    animation: slideInRight 0.5s ease-out;
    min-width: 320px;
    max-width: 400px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;
  
  // Thêm vào body
  document.body.appendChild(notification);
  
  // Tự động xóa sau 6 giây
  setTimeout(function() {
    notification.style.animation = 'slideOutRight 0.5s ease-out';
    setTimeout(function() {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 500);
  }, 6000);
};

MemoryCardMilestoneTracker.prototype.showAlreadyCompletedNotification = function() {
  // Tạo notification element
  const notification = document.createElement('div');
  notification.className = 'memory-card-notification info';
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">ℹ️</div>
      <div class="notification-text">
        <strong>Đã hoàn thành!</strong><br>
        <span>Bạn đã nhận thưởng cho ngày hôm nay. Quay lại vào ngày mai nhé!</span>
      </div>
    </div>
  `;
  
  // Thêm styles inline
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
    color: white;
    padding: 20px 25px;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    z-index: 10000;
    animation: slideInRight 0.5s ease-out;
    min-width: 320px;
    max-width: 400px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;
  
  // Thêm vào body
  document.body.appendChild(notification);
  
  // Tự động xóa sau 4 giây
  setTimeout(function() {
    notification.style.animation = 'slideOutRight 0.5s ease-out';
    setTimeout(function() {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 500);
  }, 4000);
};

MemoryCardMilestoneTracker.prototype.reset = function() {
  this.completedToday = false;
  this.saveState();
};

/**
 * Show level progress modal (for levels 1-4)
 */
MemoryCardMilestoneTracker.prototype.showLevelProgressModal = function(completedLevel, stats) {
  // Remove existing modal if any
  this.hideLevelProgressModal();
  
  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'milestone-backdrop';
  backdrop.id = 'milestone-backdrop';
  
  // Create modal container
  const container = document.createElement('div');
  container.className = 'memory-card-milestone-container';
  container.id = 'memory-card-milestone';
  
  // Check if already completed today
  const alreadyCompletedToday = this.completedToday;
  
  // Calculate progress (if already completed, show 100%)
  const displayLevel = alreadyCompletedToday ? 5 : completedLevel;
  const progressPercent = (displayLevel / 5) * 100;
  
  // Determine subtitle and reward message
  let subtitle = '';
  let rewardMessage = '';
  
  if (alreadyCompletedToday) {
    subtitle = 'Bạn đã nhận thưởng hôm nay';
    rewardMessage = `
      <div class="reward-info completed">
        <div class="reward-icon">✅</div>
        <p class="reward-text"><strong>Đã hoàn thành hôm nay!</strong></p>
        <p class="reward-subtext">Bạn đã nhận +5 lượt quay. Quay lại vào ngày mai để nhận thêm phần thưởng!</p>
      </div>
    `;
  } else {
    subtitle = 'Tiếp tục để nhận thưởng 5 lượt quay';
    rewardMessage = `
      <div class="reward-info">
        <div class="reward-icon">🎁</div>
        <p class="reward-text">Hoàn thành tất cả 5 levels để nhận <strong>+5 lượt quay!</strong></p>
      </div>
    `;
  }
  
  // Build HTML
  container.innerHTML = `
    <div class="milestone-header">
      <h2>Level ${completedLevel} Hoàn Thành!</h2>
      <p class="milestone-subtitle">${subtitle}</p>
    </div>
    
    <div class="level-stats">
      <div class="stat-item">
        <div class="stat-label">Thời gian</div>
        <div class="stat-value">${stats.time}s</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Số bước</div>
        <div class="stat-value">${stats.moves}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Level</div>
        <div class="stat-value">${completedLevel}/5</div>
      </div>
    </div>
    
    <div class="milestone-progress-wrapper">
      <div class="milestone-track">
        <div class="progress-line">
          <div class="progress-line-fill" style="width: ${progressPercent}%"></div>
        </div>
        ${this.generateLevelItems(displayLevel, alreadyCompletedToday)}
      </div>
    </div>
    
    ${rewardMessage}
    
    <div class="milestone-actions">
      ${completedLevel < 5 ? `
        <button class="milestone-btn milestone-btn-primary" id="continue-next-level">
          Tiếp tục Level ${completedLevel + 1} →
        </button>
      ` : ''}
      <button class="milestone-btn milestone-btn-secondary" id="exit-game">
        Thoát
      </button>
    </div>
  `;
  
  // Add to DOM
  document.body.appendChild(backdrop);
  document.body.appendChild(container);
  
  // Add event listeners
  document.getElementById('continue-next-level').addEventListener('click', function() {
    window.memoryCardMilestoneTracker.hideLevelProgressModal();
    if (window.game && typeof window.game.continueToNextLevel === 'function') {
      window.game.continueToNextLevel(completedLevel + 1);
    }
  });
  
  document.getElementById('exit-game').addEventListener('click', function() {
    window.memoryCardMilestoneTracker.hideLevelProgressModal();
    if (window.game && typeof window.game.exitGame === 'function') {
      window.game.exitGame();
    }
  });
};

/**
 * Generate level items HTML
 */
MemoryCardMilestoneTracker.prototype.generateLevelItems = function(completedLevel, alreadyCompletedToday) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    let itemClass = 'level-item';
    
    // If already completed today, show all as completed
    if (alreadyCompletedToday) {
      itemClass += ' completed';
    } else {
      // Normal flow: show current progress
      if (i <= completedLevel) {
        itemClass += ' completed';
      } else if (i === completedLevel + 1) {
        itemClass += ' current';
      }
    }
    
    html += `
      <div class="${itemClass}">
        <div class="level-circle">
          <span class="level-number">${i}</span>
          <span class="checkmark">✓</span>
        </div>
        <div class="level-label">Level ${i}</div>
      </div>
    `;
  }
  return html;
};

/**
 * Hide level progress modal
 */
MemoryCardMilestoneTracker.prototype.hideLevelProgressModal = function() {
  const modal = document.getElementById('memory-card-milestone');
  const backdrop = document.getElementById('milestone-backdrop');
  
  if (modal) modal.remove();
  if (backdrop) backdrop.remove();
};

/**
 * Show completion celebration (for level 5)
 */
MemoryCardMilestoneTracker.prototype.showCompletionCelebration = function(stats) {
  // Remove existing if any
  this.hideCompletionCelebration();
  
  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'milestone-backdrop';
  backdrop.id = 'completion-backdrop';
  
  // Create celebration container
  const container = document.createElement('div');
  container.className = 'completion-celebration';
  container.id = 'completion-celebration';
  
  // Check if already completed today
  const alreadyCompletedToday = this.completedToday;
  
  // Determine reward message
  let rewardHTML = '';
  if (alreadyCompletedToday) {
    rewardHTML = `
      <div class="celebration-reward completed">
        <p class="celebration-reward-text">✅ Đã nhận thưởng hôm nay!</p>
      </div>
      <p class="celebration-message secondary">
        Bạn đã nhận +5 lượt quay. Quay lại vào ngày mai để nhận thêm phần thưởng!
      </p>
    `;
  } else {
    rewardHTML = `
      <div class="celebration-reward">
        <p class="celebration-reward-text">🎁 Bạn nhận được +5 lượt quay!</p>
      </div>
    `;
  }
  
  // Build HTML
  container.innerHTML = `
    <div class="celebration-icon">🎉</div>
    <h1 class="celebration-title">Xuất Sắc!</h1>
    <p class="celebration-message">
      Bạn đã hoàn thành tất cả 5 levels của Memory Card game!
    </p>
    
    <div class="celebration-stats">
      <div class="celebration-stat">
        <div class="celebration-stat-value">${stats.totalTime}s</div>
        <div class="celebration-stat-label">Tổng thời gian</div>
      </div>
      <div class="celebration-stat">
        <div class="celebration-stat-value">${stats.totalMoves}</div>
        <div class="celebration-stat-label">Tổng số bước</div>
      </div>
    </div>
    
    ${rewardHTML}
    
    <div class="celebration-actions">
      <button class="celebration-btn celebration-btn-primary" id="play-again-btn">
        🔄 Chơi lại
      </button>
    </div>
  `;
  
  // Add to DOM
  document.body.appendChild(backdrop);
  document.body.appendChild(container);
  
  // Add confetti effect only if this is first completion today
  if (!alreadyCompletedToday) {
    this.createConfetti();
  }
  
  // Add event listener
  document.getElementById('play-again-btn').addEventListener('click', function() {
    window.memoryCardMilestoneTracker.hideCompletionCelebration();
    if (window.game && typeof window.game.restartGame === 'function') {
      window.game.restartGame();
    }
  });
};

/**
 * Hide completion celebration
 */
MemoryCardMilestoneTracker.prototype.hideCompletionCelebration = function() {
  const modal = document.getElementById('completion-celebration');
  const backdrop = document.getElementById('completion-backdrop');
  
  if (modal) modal.remove();
  if (backdrop) backdrop.remove();
  
  // Remove confetti
  const confettiElements = document.querySelectorAll('.confetti');
  confettiElements.forEach(el => el.remove());
};

/**
 * Create confetti animation
 */
MemoryCardMilestoneTracker.prototype.createConfetti = function() {
  const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
  const confettiCount = 50;
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 3 + 's';
    confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';
    document.body.appendChild(confetti);
    
    // Remove after animation
    setTimeout(() => confetti.remove(), 6000);
  }
};

// Thêm styles cho notification animations
if (typeof window !== 'undefined' && !document.getElementById('memory-card-notification-styles')) {
  const style = document.createElement('style');
  style.id = 'memory-card-notification-styles';
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
    
    .memory-card-notification .notification-content {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .memory-card-notification .notification-icon {
      font-size: 36px;
      animation: bounce 1s infinite;
      flex-shrink: 0;
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    .memory-card-notification .notification-text {
      line-height: 1.5;
    }
    
    .memory-card-notification .notification-text strong {
      font-size: 18px;
      display: block;
      margin-bottom: 6px;
    }
    
    .memory-card-notification .notification-text span {
      font-size: 15px;
      opacity: 0.95;
    }
  `;
  document.head.appendChild(style);
}

// Export global instance
window.memoryCardMilestoneTracker = new MemoryCardMilestoneTracker();

