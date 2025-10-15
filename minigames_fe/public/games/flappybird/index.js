//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;
let isMobile = false;

//bird
let birdWidth = 34; // width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let bird = {
  height: birdHeight,
  width: birdWidth,
  x: birdX,
  y: birdY,
};

//pipes
let pipeArray = [];
let pipeWidth = 64; // width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;
let gameStarted = false;

// Game Physics:
let xvel = -2; // pipes moving left speed;
let baseXvel = -2; // base speed for pipes
let yvel = 0; // bird jump speed;
let gravity = 0.2;
let gameOver = false;
let score = 0;
let pipeInterval;
let highScore;
let currentPipeDelay = 1500; // Thời gian giữa các cặp pipes (ms)
let basePipeDelay = 1500; // Base delay
let currentOpeningSpace; // Khoảng trống giữa pipes
let targetPipeDistance = 200; // Khoảng cách mong muốn giữa các cặp pipes (pixels)
let isTabVisible = true; // Track tab visibility
let lastPipeTime = 0; // Track last pipe creation time
let gameOverTime = 0; // Track when game over occurred

function startGame() {
  if (pipeInterval) {
    clearInterval(pipeInterval);
  }
  bird.y = birdY;
  pipeArray = [];
  score = 0;
  gameOver = false;
  yvel = 0;
  gameOverTime = 0; // Reset game over time
  
  // Reset difficulty
  xvel = baseXvel;
  currentPipeDelay = basePipeDelay;
  currentOpeningSpace = board.height / 3.5; // Reset opening space

  // Start placing pipes
  lastPipeTime = Date.now();
  pipeInterval = setInterval(placePipes, currentPipeDelay);
}

// Function để điều chỉnh độ khó dựa trên điểm
function adjustDifficulty() {
  // Tăng tốc độ pipes theo điểm
  // Mỗi 10 điểm tăng speed 5%
  const speedMultiplier = 1 + (Math.floor(score / 10) * 0.05);
  xvel = baseXvel * speedMultiplier;
  
  // Tính toán delay để duy trì khoảng cách cố định giữa các pipes
  // Distance = Speed × Time
  // Time = Distance / Speed
  // Chuyển đổi: xvel là pixels/frame, cần chuyển sang ms
  // Giả sử 60 FPS → 1 frame = 16.67ms
  const pixelsPerMs = Math.abs(xvel) / 16.67;
  currentPipeDelay = targetPipeDistance / pixelsPerMs;
  
  // Giảm khoảng trống giữa pipes
  // Từ board.height / 3.5 xuống tối thiểu board.height / 5
  const baseOpening = board.height / 3.5;
  const minOpening = board.height / 5;
  const openingReduction = Math.floor(score / 15) * 10;
  currentOpeningSpace = Math.max(minOpening, baseOpening - openingReduction);
  
  // Reset pipe interval với delay mới mỗi khi tốc độ thay đổi
  if (pipeInterval && Math.floor(score) % 10 === 0 && score > 0) {
    clearInterval(pipeInterval);
    lastPipeTime = Date.now();
    pipeInterval = setInterval(placePipes, currentPipeDelay);
  }
}

highScore = Number(sessionStorage.getItem("FlappyBirdScore")) || 0;

// Function to detect mobile and resize canvas
function detectMobileAndResize() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isSmallScreen = window.innerWidth <= 768;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  isMobile = isSmallScreen || (isMobileUserAgent && isTouchDevice);
  
  if (isMobile) {
    // For mobile, use full viewport dimensions
    boardWidth = window.innerWidth;
    boardHeight = window.innerHeight;
  } else {
    // For desktop, maintain original aspect ratio but use full height
    const originalWidth = 360;
    const originalHeight = 640;
    const aspectRatio = originalWidth / originalHeight;
    
    // Use full modal height, calculate width based on aspect ratio
    boardHeight = window.innerHeight;
    boardWidth = Math.floor(boardHeight * aspectRatio);
    
    console.log(`Desktop canvas: ${boardWidth}x${boardHeight}, aspect ratio: ${aspectRatio}`);
  }
  
  if (board) {
    board.width = boardWidth;
    board.height = boardHeight;
    board.style.width = boardWidth + 'px';
    board.style.height = boardHeight + 'px';
    birdX = boardWidth / 8;
    birdY = boardHeight / 2;
    bird.x = birdX;
    bird.y = birdY;
    pipeX = boardWidth;
  }
}

window.onload = function () {
  board = document.getElementById("board");
  detectMobileAndResize();
  context = board.getContext("2d"); // used for drawing on the board

  // load images:
  birdImg = new Image();
  birdImg.src = "./flappybird.gif";

  topPipeImg = new Image();
  topPipeImg.src = "./toppipe.png";

  bottomPipeImg = new Image();
  bottomPipeImg.src = "./bottompipe.png";

  requestAnimationFrame(update);

  // Function to handle jump action (for both keyboard and touch)
  function handleJump() {
    if (!gameStarted) {
      gameStarted = true; // mark game as started
      startGame(); // begin game loop & pipes
      yvel = -5; // initial jump on first press (optional)
    } else if (!gameOver) {
      yvel = -5; // bird jumps normally
    } else {
      // Game over, restart - only if restart message is showing
      const timeSinceGameOver = Date.now() - gameOverTime;
      if (timeSinceGameOver > 1500) {
        gameStarted = true;
        startGame();
        yvel = -5;
      }
    }
  }

  // Keyboard controls
  document.addEventListener("keydown", function (e) {
    if (e.code === "Space" || e.code === "ArrowUp") {
      handleJump();
    }
  });

  // Touch controls for mobile
  board.addEventListener("touchstart", function (e) {
    e.preventDefault(); // Prevent default touch behavior
    handleJump();
  });

  // Click controls (works on both desktop and mobile)
  board.addEventListener("click", function (e) {
    handleJump();
  });

  // Handle tab visibility changes to prevent pipe spam
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      isTabVisible = false;
      // Don't pause the interval, just mark tab as hidden
      // The placePipes function will handle timing
    } else {
      isTabVisible = true;
      // Reset timer when tab becomes visible to prevent immediate pipe creation
      lastPipeTime = Date.now();
    }
  });

  // Handle window focus/blur events as backup
  window.addEventListener("focus", function () {
    isTabVisible = true;
    lastPipeTime = Date.now();
  });

  window.addEventListener("blur", function () {
    isTabVisible = false;
  });

  // Handle orientation change and window resize for mobile
  window.addEventListener("orientationchange", function () {
    setTimeout(detectMobileAndResize, 100); // Delay to ensure proper dimensions
  });

  window.addEventListener("resize", function () {
    if (isMobile) {
      detectMobileAndResize();
    }
  });
};

function update() {
  requestAnimationFrame(update);

  if (!gameStarted) {
    // Show "Press Space to Start" message
    // Don't clear background - let CSS background image show
    context.fillStyle = "white";
    
    if (isMobile) {
      context.font = Math.min(boardWidth / 15, 24) + "px sans-serif";
      context.textAlign = "center";
      context.fillText("Chạm màn hình để bắt đầu", board.width / 2, board.height / 2 - 20);
      context.font = Math.min(boardWidth / 20, 18) + "px sans-serif";
      context.fillText("Đạt mốc để nhận spins!", board.width / 2, board.height / 2 + 10);
    } else {
      context.font = "22px sans-serif";
      context.textAlign = "center";
      context.fillText("Chạm màn hình hoặc nhấn Space", board.width / 2, board.height / 2 - 30);
      context.font = "22px sans-serif";
      context.fillText("để bắt đầu", board.width / 2, board.height / 2 - 5);
      context.font = "16px sans-serif";
      context.fillText("Đạt mốc để nhận spins!", board.width / 2, board.height / 2 + 25);
    }

    // Draw bird in initial position
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    return;
  }

  if (gameOver) {
    // Set game over time on first frame of game over
    if (gameOverTime === 0) {
      gameOverTime = Date.now();
      if(score > highScore){
        highScore = score;
        sessionStorage.setItem("FlappyBirdScore", highScore);
      }
      clearInterval(pipeInterval);
    }
    
    context.fillStyle = "white";
    const timeSinceGameOver = Date.now() - gameOverTime;
    const showRestartMessage = timeSinceGameOver > 1500; // Show restart message after 1.5 seconds
    
    // Draw semi-transparent overlay to ensure GAME OVER text is visible
    context.fillStyle = "rgba(0, 0, 0, 0.025)";
    context.fillRect(0, 0, board.width, board.height);
    
    if (isMobile) {
      context.font = "bold " + Math.min(boardWidth / 6, 50) + "px sans-serif";
      context.textAlign = "center";
      context.fillStyle = "white";
      context.strokeStyle = "black";
      context.lineWidth = 3;
      context.strokeText("GAME OVER", board.width / 2, board.height / 2 - 40);
      context.fillText("GAME OVER", board.width / 2, board.height / 2 - 40);
      
      // Only show restart message after delay
      if (showRestartMessage) {
        context.font = Math.min(boardWidth / 20, 18) + "px sans-serif";
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.strokeText("Chạm màn hình để chơi lại", board.width / 2, board.height / 2 + 20);
        context.fillText("Chạm màn hình để chơi lại", board.width / 2, board.height / 2 + 20);
      }
    } else {
      context.font = "bold 50px sans-serif";
      context.textAlign = "center";
      context.fillStyle = "white";
      context.strokeStyle = "black";
      context.lineWidth = 3;
      context.strokeText("GAME OVER", board.width / 2, board.height / 2 - 40);
      context.fillText("GAME OVER", board.width / 2, board.height / 2 - 40);
      
      // Only show restart message after delay
      if (showRestartMessage) {
        context.font = "18px sans-serif";
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.strokeText("Chạm màn hình hoặc Space để chơi lại", board.width / 2, board.height / 2 + 20);
        context.fillText("Chạm màn hình hoặc Space để chơi lại", board.width / 2, board.height / 2 + 20);
      }
    }
    
    // Don't set gameStarted to false here - keep it true to prevent showing start message
    return;
  }

  if (bird.y > board.height) {
    gameOver = true;
  }

  // Clear canvas for bird and pipes (but keep background image)
  context.clearRect(0, 0, board.width, board.height);

  // Bird physics
  yvel += gravity;
  bird.y = Math.max(bird.y + yvel, 0);
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  // Pipes movement and drawing
  for (let i = 0; i < pipeArray.length; i++) {
    let pipe = pipeArray[i];
    pipe.x += xvel;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5; // half point per pipe, full point per pair
      pipe.passed = true;
      
      // Adjust difficulty when score increases
      adjustDifficulty();
      
      // Check milestone achievement
      if (window.flappyMilestoneTracker) {
        window.flappyMilestoneTracker.checkMilestone(score);
      }
    }

    if (detectCollision(bird, pipe)) {
      gameOver = true;
    }
  }

  // Remove pipes that went off screen
  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
    pipeArray.shift();
  }

  // Score display - centered below milestone
  context.fillStyle = "white";
  context.textAlign = "center";
  
  if (isMobile) {
    // Mobile: larger font size, positioned below milestone area
    const fontSize = Math.min(boardWidth / 8, 40);
    context.font = "bold " + fontSize + "px sans-serif";
    context.fillText(score, boardWidth / 2, 220);
  } else {
    // Desktop: positioned below milestone area
    context.font = "bold 50px sans-serif";
    context.fillText(score, boardWidth / 2, 260);
  }
}

function placePipes() {
  const currentTime = Date.now();
  const timeSinceLastPipe = currentTime - lastPipeTime;
  
  // If tab was hidden for too long, reset timer and create pipe immediately
  if (!isTabVisible && timeSinceLastPipe > currentPipeDelay * 3) {
    lastPipeTime = currentTime;
    // Create pipe immediately after long absence
  }
  // If not enough time has passed since last pipe (for normal spacing), skip
  else if (timeSinceLastPipe < currentPipeDelay * 0.7) {
    return;
  }
  
  let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  // Sử dụng currentOpeningSpace thay vì giá trị cố định
  let openingSpace = currentOpeningSpace || board.height / 3.5;

  let topPipe = {
    img: topPipeImg,
    x: pipeX,
    y: randomPipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(topPipe);

  let bottomPipe = {
    img: bottomPipeImg,
    x: pipeX,
    y: randomPipeY + pipeHeight + openingSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(bottomPipe);
  
  // Update last pipe time
  lastPipeTime = currentTime;
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
