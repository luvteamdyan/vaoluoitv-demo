// Pokemon Matching Game - Luck8 Event
class PikachuMatchingGame {
    constructor() {
        this.boardSize = 8;
        this.gameBoard = [];
        this.selectedTiles = [];
        this.matchesCount = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.isProcessing = false; // Flag để ngăn chọn pokemon khi đang xử lý
        this.hintsRemaining = 5; // Số lần gợi ý còn lại
        this.maxHints = 5; // Tối đa 5 lần gợi ý
        
        // Tạo bảng với border trống (boardSize + 2 để có border)
        this.extendedBoardSize = this.boardSize + 2;
        
        // Canvas cho vẽ đường nối
        this.canvas = null;
        this.ctx = null;
        this.animationFrameId = null;
        
        // Pokemon sprites - sử dụng từ các nguồn công khai
        this.pokemonSprites = [
            { name: 'Pikachu', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' },
            { name: 'Charmander', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png' },
            { name: 'Squirtle', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
            { name: 'Bulbasaur', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
            { name: 'Jigglypuff', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png' },
            { name: 'Psyduck', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/54.png' },
            { name: 'Meowth', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png' },
            { name: 'Eevee', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png' },
            { name: 'Snorlax', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png' },
            { name: 'Mewtwo', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png' },
            { name: 'Mew', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png' },
            { name: 'Vulpix', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png' },
            { name: 'Clefairy', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/35.png' },
            { name: 'Pidgey', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png' },
            { name: 'Caterpie', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png' },
            { name: 'Weedle', url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/13.png' }
        ];
        
        this.initializeGame();
        this.bindEvents();
    }
    
    initializeGame() {
        this.createBoard();
        this.renderBoard();
        this.updateDisplay();
        this.initializeCanvas();
    }
    
    initializeCanvas() {
        this.canvas = document.getElementById('linkLineCanvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }
    }
    
    resizeCanvas() {
        if (this.canvas) {
            const gameBoard = document.getElementById('gameBoard');
            if (gameBoard) {
                const rect = gameBoard.getBoundingClientRect();
                this.canvas.width = rect.width;
                this.canvas.height = rect.height;
                this.canvas.style.width = rect.width + 'px';
                this.canvas.style.height = rect.height + 'px';
            }
        }
    }
    
    createBoard() {
        // Tạo mảng 2D cho game board với border trống
        this.gameBoard = [];
        
        // Khởi tạo bảng mở rộng với border trống
        for (let row = 0; row < this.extendedBoardSize; row++) {
            this.gameBoard[row] = [];
            for (let col = 0; col < this.extendedBoardSize; col++) {
                // Border trống (row 0, row last, col 0, col last)
                if (row === 0 || row === this.extendedBoardSize - 1 || 
                    col === 0 || col === this.extendedBoardSize - 1) {
                    this.gameBoard[row][col] = {
                        pokemon: null,
                        matched: false,
                        selected: false,
                        isBorder: true
                    };
                } else {
                    // Vùng game chính (bỏ qua border)
                    this.gameBoard[row][col] = {
                        pokemon: null,
                        matched: false,
                        selected: false,
                        isBorder: false
                    };
                }
            }
        }
        
        // Tạo pairs Pokemon cho vùng game chính
        const totalTiles = this.boardSize * this.boardSize;
        const pairsNeeded = Math.floor(totalTiles / 2);
        
        const pokemonPairs = [];
        for (let i = 0; i < pairsNeeded; i++) {
            const pokemon = this.pokemonSprites[i % this.pokemonSprites.length];
            pokemonPairs.push(pokemon, pokemon); // Mỗi Pokemon xuất hiện 2 lần
        }
        
        // Shuffle array
        for (let i = pokemonPairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pokemonPairs[i], pokemonPairs[j]] = [pokemonPairs[j], pokemonPairs[i]];
        }
        
        // Fill vùng game chính (bỏ qua border)
        let index = 0;
        for (let row = 1; row <= this.boardSize; row++) {
            for (let col = 1; col <= this.boardSize; col++) {
                if (index < pokemonPairs.length) {
                    this.gameBoard[row][col] = {
                        pokemon: pokemonPairs[index],
                        matched: false,
                        selected: false,
                        isBorder: false
                    };
                    index++;
                }
            }
        }
    }
    
    renderBoard() {
        const gameBoardElement = document.getElementById('gameBoard');
        gameBoardElement.innerHTML = '';
        
        // Chỉ render vùng game chính (bỏ qua border)
        for (let row = 1; row <= this.boardSize; row++) {
            for (let col = 1; col <= this.boardSize; col++) {
                const tile = this.gameBoard[row][col];
                const tileElement = document.createElement('div');
                tileElement.className = 'pokemon-tile';
                tileElement.dataset.row = row;
                tileElement.dataset.col = col;
                
                if (tile.pokemon && !tile.matched) {
                    const img = document.createElement('img');
                    img.src = tile.pokemon.url;
                    img.alt = tile.pokemon.name;
                    img.className = 'pokemon-image';
                    img.onerror = () => {
                        // Fallback nếu không load được image
                        tileElement.innerHTML = `<div style="font-size: 0.8rem; color: #666;">${tile.pokemon.name}</div>`;
                    };
                    tileElement.appendChild(img);
                }
                // Ô matched vẫn giữ nguyên vị trí nhưng không hiển thị nội dung
                
                if (tile.selected) {
                    tileElement.classList.add('selected');
                }
                
                if (tile.matched) {
                    tileElement.classList.add('matched');
                }
                
                tileElement.addEventListener('click', () => this.handleTileClick(row, col));
                gameBoardElement.appendChild(tileElement);
            }
        }
        
        // Resize canvas sau khi render
        this.resizeCanvas();
    }
    
    handleTileClick(row, col) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const tile = this.gameBoard[row][col];
        if (!tile.pokemon || tile.matched || tile.selected) return;
        
        // Ngăn chọn pokemon thứ 3 khi đã có 2 pokemon được chọn hoặc đang xử lý
        if (this.selectedTiles.length >= 2 || this.isProcessing) return;
        
        // Select tile
        tile.selected = true;
        this.selectedTiles.push({ row, col });
        
        this.renderBoard();
        
        if (this.selectedTiles.length === 2) {
            this.isProcessing = true; // Bắt đầu xử lý, không cho chọn thêm
            setTimeout(() => this.checkMatch(), 500);
        }
    }
    
    checkMatch() {
        const [first, second] = this.selectedTiles;
        const tile1 = this.gameBoard[first.row][first.col];
        const tile2 = this.gameBoard[second.row][second.col];
        
        if (this.canConnect(first, second)) {
            // Match found!
            this.matchesCount++;
            
            // Lấy DOM elements của 2 tiles TRƯỚC KHI set matched = true
            const tile1Element = document.querySelector(`[data-row="${first.row}"][data-col="${first.col}"]`);
            const tile2Element = document.querySelector(`[data-row="${second.row}"][data-col="${second.col}"]`);
            
            // Lấy points của đường nối
            const points = this.getPathPoints(first, second);
            
            // Vẽ đường nối và animate cards đồng thời
            let linkLineCompleted = false;
            let cardsAnimationCompleted = false;
            
            const checkBothCompleted = () => {
                if (linkLineCompleted && cardsAnimationCompleted) {
                    // Clear canvas
                    if (this.ctx) {
                        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    }
                    
                    // BÂY GIỜ MỚI set matched = true và render lại board
                    tile1.matched = true;
                    tile2.matched = true;
                    this.renderBoard();
                    
                    // Play sound
                    this.playMatchSound();
                    
                    // Check win condition
                    if (this.checkWinCondition()) {
                        this.endGame();
                    } else {
                        // Kiểm tra xem còn cặp hợp lệ không, nếu không thì shuffle
                        if (!this.hasValidPairs()) {
                            this.shuffleBoard();
                        }
                    }
                }
            };
            
            // Vẽ đường nối
            this.drawLinkLine(points, () => {
                linkLineCompleted = true;
                checkBothCompleted();
                
                // Sau khi đường nối vẽ xong, mới bắt đầu animate cards
                this.animateCardDisappear(tile1Element, tile2Element, () => {
                    cardsAnimationCompleted = true;
                    checkBothCompleted();
                });
            });
        } else {
            // No match
            tile1.selected = false;
            tile2.selected = false;
        }
        
        this.selectedTiles = [];
        this.isProcessing = false; // Đã xử lý xong, cho phép chọn tiếp
        this.renderBoard();
        this.updateDisplay();
    }
    
    canConnect(first, second) {
        // Kiểm tra xem hai tile có thể kết nối với nhau không (tối đa 3 đoạn thẳng)
        const pokemon1 = this.gameBoard[first.row][first.col].pokemon;
        const pokemon2 = this.gameBoard[second.row][second.col].pokemon;
        
        if (!pokemon1 || !pokemon2 || pokemon1.name !== pokemon2.name) {
            return false;
        }
        
        return this.findPath(first, second);
    }
    
    findPath(start, end) {
        // I-line: Kiểm tra đường thẳng (0 rẽ)
        if (this.canConnectILine(start, end)) {
            return true;
        }
        
        // L-line: Kiểm tra đường 1 rẽ
        if (this.canConnectLLine(start, end)) {
            return true;
        }
        
        // Z-line/U-line: Kiểm tra đường 2 rẽ (3 đoạn thẳng)
        if (this.canConnectZLine(start, end)) {
            return true;
        }
        
        return false;
    }
    
    canConnectILine(start, end) {
        // I-line: đường thẳng cùng hàng hoặc cùng cột
        if (start.row === end.row) {
            // Cùng hàng - kiểm tra không bị chặn
            const minCol = Math.min(start.col, end.col);
            const maxCol = Math.max(start.col, end.col);
            for (let col = minCol + 1; col < maxCol; col++) {
                if (!this.isValidPosition(start.row, col)) {
                    return false;
                }
            }
            return true;
        } else if (start.col === end.col) {
            // Cùng cột - kiểm tra không bị chặn
            const minRow = Math.min(start.row, end.row);
            const maxRow = Math.max(start.row, end.row);
            for (let row = minRow + 1; row < maxRow; row++) {
                if (!this.isValidPosition(row, start.col)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    
    canConnectLLine(start, end) {
        // L-line: 1 rẽ (2 đoạn thẳng)
        // Thử rẽ tại (start.row, end.col)
        if (this.isValidPosition(start.row, end.col)) {
            if (this.canConnectILine(start, { row: start.row, col: end.col }) &&
                this.canConnectILine({ row: start.row, col: end.col }, end)) {
                return true;
            }
        }
        
        // Thử rẽ tại (end.row, start.col)
        if (this.isValidPosition(end.row, start.col)) {
            if (this.canConnectILine(start, { row: end.row, col: start.col }) &&
                this.canConnectILine({ row: end.row, col: start.col }, end)) {
                return true;
            }
        }
        
        return false;
    }
    
    canConnectZLine(start, end) {
        // Z-line/U-line: 2 rẽ (3 đoạn thẳng)
        // Thử tất cả các điểm trung gian trong bảng mở rộng (bao gồm border)
        for (let row = 0; row < this.extendedBoardSize; row++) {
            for (let col = 0; col < this.extendedBoardSize; col++) {
                if (this.isValidPosition(row, col)) {
                    // Kiểm tra: start -> trung gian -> end (có thể qua border)
                    if (this.canConnectILine(start, { row, col }) &&
                        this.canConnectLLine({ row, col }, end)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    isValidPosition(row, col) {
        // Kiểm tra trong phạm vi bảng mở rộng
        if (row < 0 || row >= this.extendedBoardSize || col < 0 || col >= this.extendedBoardSize) {
            return false;
        }
        
        const tile = this.gameBoard[row][col];
        // Border trống hoặc ô không có Pokemon hoặc đã matched
        return tile.isBorder || !tile.pokemon || tile.matched;
    }
    
    // Lấy tọa độ pixel của tile
    getTilePosition(row, col) {
        const gameBoard = document.getElementById('gameBoard');
        
        if (!gameBoard) {
            return { x: 0, y: 0 };
        }
        
        const boardRect = gameBoard.getBoundingClientRect();
        
        // Tính toán dựa trên grid thay vì DOM element
        const computedStyle = window.getComputedStyle(gameBoard);
        const gap = parseFloat(computedStyle.gap) || 2;
        const padding = parseFloat(computedStyle.padding) || 20;
        
        // Kích thước của mỗi ô (bao gồm cả gap)
        const cellSize = (boardRect.width - padding * 2 - gap * (this.boardSize - 1)) / this.boardSize;
        
        let x, y;
        
        // Xử lý các ô border ngoài cùng
        if (row === 0) {
            // Border phía trên
            y = padding / 2;
        } else if (row === this.extendedBoardSize - 1) {
            // Border phía dưới
            y = boardRect.height - padding / 2;
        } else {
            // Các ô trong game chính
            const renderedRow = row - 1;
            y = padding + renderedRow * (cellSize + gap) + cellSize / 2;
        }
        
        if (col === 0) {
            // Border bên trái
            x = padding / 2;
        } else if (col === this.extendedBoardSize - 1) {
            // Border bên phải
            x = boardRect.width - padding / 2;
        } else {
            // Các ô trong game chính
            const renderedCol = col - 1;
            x = padding + renderedCol * (cellSize + gap) + cellSize / 2;
        }
        
        return { x, y };
    }
    
    // Lấy points của đường nối
    getPathPoints(start, end) {
        const points = [];
        
        // I-line
        if (this.canConnectILine(start, end)) {
            points.push(this.getTilePosition(start.row, start.col));
            points.push(this.getTilePosition(end.row, end.col));
            return points;
        }
        
        // L-line
        if (this.isValidPosition(start.row, end.col)) {
            if (this.canConnectILine(start, { row: start.row, col: end.col }) &&
                this.canConnectILine({ row: start.row, col: end.col }, end)) {
                points.push(this.getTilePosition(start.row, start.col));
                points.push(this.getTilePosition(start.row, end.col));
                points.push(this.getTilePosition(end.row, end.col));
                return points;
            }
        }
        
        if (this.isValidPosition(end.row, start.col)) {
            if (this.canConnectILine(start, { row: end.row, col: start.col }) &&
                this.canConnectILine({ row: end.row, col: start.col }, end)) {
                points.push(this.getTilePosition(start.row, start.col));
                points.push(this.getTilePosition(end.row, start.col));
                points.push(this.getTilePosition(end.row, end.col));
                return points;
            }
        }
        
        // Z-line/U-line
        for (let row = 0; row < this.extendedBoardSize; row++) {
            for (let col = 0; col < this.extendedBoardSize; col++) {
                if (this.isValidPosition(row, col)) {
                    if (this.canConnectILine(start, { row, col }) &&
                        this.canConnectLLine({ row, col }, end)) {
                        points.push(this.getTilePosition(start.row, start.col));
                        points.push(this.getTilePosition(row, col));
                        
                        // Tìm điểm trung gian cho L-line
                        if (this.isValidPosition(row, end.col)) {
                            if (this.canConnectILine({ row, col }, { row, col: end.col }) &&
                                this.canConnectILine({ row, col: end.col }, end)) {
                                points.push(this.getTilePosition(row, end.col));
                                points.push(this.getTilePosition(end.row, end.col));
                                return points;
                            }
                        }
                        
                        if (this.isValidPosition(end.row, col)) {
                            if (this.canConnectILine({ row, col }, { row: end.row, col }) &&
                                this.canConnectILine({ row: end.row, col }, end)) {
                                points.push(this.getTilePosition(end.row, col));
                                points.push(this.getTilePosition(end.row, end.col));
                                return points;
                            }
                        }
                    }
                }
            }
        }
        
        return points;
    }
    
    // Vẽ đường nối với animation
    drawLinkLine(points, onComplete) {
        if (!this.ctx || points.length < 2) {
            if (onComplete) onComplete();
            return;
        }
        
        const duration = 300; // ms
        const startTime = Date.now();
        const segmentDuration = duration / (points.length - 1); // Thời gian cho mỗi đoạn
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Vẽ đường nối
            this.ctx.strokeStyle = '#ffd700';
            this.ctx.lineWidth = 4;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.shadowColor = '#ffd700';
            this.ctx.shadowBlur = 10;
            
            this.ctx.beginPath();
            
            // Vẽ từng đoạn một cách riêng biệt để đảm bảo đường vuông góc
            for (let i = 0; i < points.length - 1; i++) {
                const startPoint = points[i];
                const endPoint = points[i + 1];
                
                // Tính progress cho đoạn hiện tại
                const segmentStartTime = i * segmentDuration;
                const segmentEndTime = (i + 1) * segmentDuration;
                const segmentProgress = Math.max(0, Math.min(1, 
                    (elapsed - segmentStartTime) / segmentDuration
                ));
                
                if (i === 0) {
                    this.ctx.moveTo(startPoint.x, startPoint.y);
                }
                
                if (segmentProgress > 0) {
                    // Vẽ đến cuối đoạn trước
                    if (i > 0) {
                        this.ctx.lineTo(startPoint.x, startPoint.y);
                    }
                    
                    // Vẽ đoạn hiện tại
                    const currentX = startPoint.x + (endPoint.x - startPoint.x) * segmentProgress;
                    const currentY = startPoint.y + (endPoint.y - startPoint.y) * segmentProgress;
                    this.ctx.lineTo(currentX, currentY);
                }
            }
            
            this.ctx.stroke();
            
            if (progress < 1) {
                this.animationFrameId = requestAnimationFrame(animate);
            } else {
                if (onComplete) onComplete();
            }
        };
        
        animate();
    }
    
    // Animate card scale down và xóa
    animateCardDisappear(tile1, tile2, onComplete) {
        const duration = 300; // Tăng từ 300ms lên 600ms để biến mất chậm hơn
        const startTime = Date.now();
        
        // Xóa CSS transition để JavaScript animation hoạt động
        if (tile1) {
            tile1.style.transition = 'none';
        }
        if (tile2) {
            tile2.style.transition = 'none';
        }
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const scale = 1 - progress;
            
            if (tile1) {
                tile1.style.transform = `scale(${scale})`;
                tile1.style.opacity = scale;
            }
            
            if (tile2) {
                tile2.style.transform = `scale(${scale})`;
                tile2.style.opacity = scale;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                if (onComplete) onComplete();
            }
        };
        
        animate();
    }
    
    playMatchSound() {
        // Tạo âm thanh đơn giản bằng Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }
    
    checkWinCondition() {
        // Kiểm tra vùng game chính (bỏ qua border)
        for (let row = 1; row <= this.boardSize; row++) {
            for (let col = 1; col <= this.boardSize; col++) {
                const tile = this.gameBoard[row][col];
                if (tile.pokemon && !tile.matched) {
                    return false;
                }
            }
        }
        return true;
    }
    
    hasValidPairs() {
        // Kiểm tra xem còn cặp Pokemon nào có thể kết nối không
        for (let row1 = 1; row1 <= this.boardSize; row1++) {
            for (let col1 = 1; col1 <= this.boardSize; col1++) {
                const tile1 = this.gameBoard[row1][col1];
                if (!tile1.pokemon || tile1.matched) continue;
                
                for (let row2 = 1; row2 <= this.boardSize; row2++) {
                    for (let col2 = 1; col2 <= this.boardSize; col2++) {
                        if (row1 === row2 && col1 === col2) continue;
                        
                        const tile2 = this.gameBoard[row2][col2];
                        if (!tile2.pokemon || tile2.matched) continue;
                        
                        if (this.canConnect({ row: row1, col: col1 }, { row: row2, col: col2 })) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    
    shuffleBoard() {
        // Thu thập tất cả Pokemon chưa matched
        const remainingPokemon = [];
        for (let row = 1; row <= this.boardSize; row++) {
            for (let col = 1; col <= this.boardSize; col++) {
                const tile = this.gameBoard[row][col];
                if (tile.pokemon && !tile.matched) {
                    remainingPokemon.push(tile.pokemon);
                }
            }
        }
        
        // Shuffle array
        for (let i = remainingPokemon.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remainingPokemon[i], remainingPokemon[j]] = [remainingPokemon[j], remainingPokemon[i]];
        }
        
        // Đặt lại Pokemon vào bảng
        let index = 0;
        for (let row = 1; row <= this.boardSize; row++) {
            for (let col = 1; col <= this.boardSize; col++) {
                const tile = this.gameBoard[row][col];
                if (!tile.matched) {
                    if (index < remainingPokemon.length) {
                        tile.pokemon = remainingPokemon[index];
                        tile.selected = false;
                        index++;
                    } else {
                        tile.pokemon = null;
                    }
                }
            }
        }
        
        this.renderBoard();
    }
    
    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.matchesCount = 0;
        this.selectedTiles = [];
        this.isProcessing = false; // Reset flag khi bắt đầu game mới
        this.hintsRemaining = this.maxHints; // Reset số lượt gợi ý
        
        this.createBoard();
        this.renderBoard();
        this.updateDisplay();
        this.updateHintButton(); // Cập nhật UI button gợi ý
    }
    
    pauseGame() {
        this.gamePaused = !this.gamePaused;
        const pauseModal = document.getElementById('pauseModal');
        if (this.gamePaused) {
            pauseModal.classList.add('show');
        } else {
            pauseModal.classList.remove('show');
        }
    }
    
    endGame() {
        this.gameRunning = false;
        
        // Update final stats
        document.getElementById('matchesCount').textContent = this.matchesCount;
        
        // Check if user completed game and report to milestone tracker
        if (window.pikachuMilestoneTracker && window.pikachuMilestoneTracker.initialized) {
            window.pikachuMilestoneTracker.checkGameComplete(true);
        }
        
        // Show game over modal
        const gameOverModal = document.getElementById('gameOverModal');
        gameOverModal.classList.add('show');
    }
    
    showHint() {
        if (!this.gameRunning || this.gamePaused) return;
        
        // Kiểm tra còn lượt gợi ý không
        if (this.hintsRemaining <= 0) {
            return;
        }
        
        // Tìm một cặp có thể kết nối
        for (let row1 = 0; row1 < this.boardSize; row1++) {
            for (let col1 = 0; col1 < this.boardSize; col1++) {
                const tile1 = this.gameBoard[row1][col1];
                if (!tile1.pokemon || tile1.matched) continue;
                
                for (let row2 = 0; row2 < this.boardSize; row2++) {
                    for (let col2 = 0; col2 < this.boardSize; col2++) {
                        if (row1 === row2 && col1 === col2) continue;
                        
                        const tile2 = this.gameBoard[row2][col2];
                        if (!tile2.pokemon || tile2.matched) continue;
                        
                        if (this.canConnect({ row: row1, col: col1 }, { row: row2, col: col2 })) {
                            // Giảm số lần gợi ý còn lại
                            this.hintsRemaining--;
                            this.updateHintButton();
                            this.highlightHint(row1, col1, row2, col2);
                            return;
                        }
                    }
                }
            }
        }
    }
    
    highlightHint(row1, col1, row2, col2) {
        const tile1 = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
        const tile2 = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);
        
        if (tile1) tile1.classList.add('hint');
        if (tile2) tile2.classList.add('hint');
        
        setTimeout(() => {
            if (tile1) tile1.classList.remove('hint');
            if (tile2) tile2.classList.remove('hint');
        }, 2000);
    }
    
    updateDisplay() {
        // Không cần update display nữa vì đã bỏ điểm, thời gian và combo
    }
    
    updateHintButton() {
        const hintBtn = document.getElementById('hintBtn');
        if (hintBtn) {
            hintBtn.textContent = `Gợi Ý (${this.hintsRemaining})`;
            
            // Disable button khi hết lượt
            if (this.hintsRemaining <= 0) {
                hintBtn.disabled = true;
                hintBtn.classList.add('disabled');
            } else {
                hintBtn.disabled = false;
                hintBtn.classList.remove('disabled');
            }
        }
    }
    
    bindEvents() {
        // New game button
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        // Pause button
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseGame();
        });
        
        // Hint button
        document.getElementById('hintBtn').addEventListener('click', () => {
            this.showHint();
        });
        
        // Resume button
        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.pauseGame();
        });
        
        // Restart button
        document.getElementById('restartBtn').addEventListener('click', () => {
            document.getElementById('gameOverModal').classList.remove('show');
            this.startGame();
        });
        
        // Close modal button
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            document.getElementById('gameOverModal').classList.remove('show');
        });
        
        // Main menu button
        document.getElementById('mainMenuBtn').addEventListener('click', () => {
            document.getElementById('pauseModal').classList.remove('show');
            this.gameRunning = false;
        });
        
        // Close modals when clicking outside
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new PikachuMatchingGame();
    
    // Start game automatically
    setTimeout(() => {
        game.startGame();
    }, 1000);
});
