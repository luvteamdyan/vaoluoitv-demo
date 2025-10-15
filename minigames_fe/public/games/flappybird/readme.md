# 🐦 Flappy Bird Game

A classic Flappy Bird game implementation built with vanilla HTML5, CSS3, and JavaScript. Navigate your bird through pipes and achieve the highest score possible!

## 🎮 Game Features

### Core Gameplay
- **Classic Flappy Bird mechanics** - Jump to avoid pipes and stay airborne
- **Responsive controls** - Use Spacebar or Arrow Up key to make the bird jump
- **Realistic physics** - Gravity simulation with smooth bird movement
- **Collision detection** - Precise collision system between bird and pipes
- **Infinite gameplay** - Pipes generate continuously for endless fun

### System
- **Real-time scoring** - Earn points by successfully passing through pipes
- **High score tracking** - Your best score is saved and persists between sessions
- **Score display** - Current score and high score shown during gameplay

### Visual Elements
- **Custom sprites** - Animated bird character with pixel-art style
- **Pipe obstacles** - Top and bottom pipes with varied heights
- **Background scenery** - Immersive game environment
- **Clean UI** - Minimalist interface focusing on gameplay

### Game States
- **Start screen** - "Press Space to Start" instruction
- **Active gameplay** - Real-time bird and pipe movement
- **Game over screen** - Display final score and restart option
- **Automatic restart** - Press Space to play again after game over

## 📦 Getting Started

To run the game locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kartikeya042/flappy-bird-game.git
   ```

2. **Navigate to the project folder:**
   ```bash
   cd flappy-bird-game
   ```

3. **Open `index.html` in your web browser.**  
   Or use a [live server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in your code editor.

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional installations required

### File Structure
Ensure all files are in the same directory:
```
flappy-bird/
├── index.html
├── index.js
├── style.css
├── flappybird.gif
├── toppipe.png
├── bottompipe.png
└── flappybirdbg.png
```

## 🎯 How to Play

1. **Start the game** - Press `Spacebar` or `Arrow Up` key
2. **Control the bird** - Press `Spacebar` or `Arrow Up` to make the bird jump
3. **Avoid obstacles** - Navigate through the gaps between pipes
4. **Score points** - Successfully pass through pipe pairs to increase your score
5. **Game over** - The game ends if the bird hits a pipe or falls to the ground
6. **Restart** - Press `Spacebar` to play again after game over

## ⚙️ Technical Details

## 🛠️ Technologies Used

- **HTML5** - Game structure and Canvas element
- **JavaScript (Vanilla)** - Game logic, physics, and controls
- **CSS3** - Styling and layout
- **Canvas API** - For game rendering and graphics
- **Session Storage** - High score persistence

### Game Configuration
- **Canvas Size**: 360x640 pixels
- **Bird Dimensions**: 34x24 pixels
- **Pipe Dimensions**: 64x512 pixels
- **Gravity**: 0.175 units per frame
- **Pipe Speed**: 2 pixels per frame
- **Jump Velocity**: -5 pixels per frame
- **Pipe Generation**: Every 750ms

### Performance Features
- **60 FPS animation** using `requestAnimationFrame`
- **Efficient memory management** with automatic pipe cleanup
- **Smooth gameplay** with optimized collision detection
- **Responsive design** suitable for different screen sizes

## 🎨 Customization

The game is easily customizable:

- **Modify game physics** in the JavaScript variables section
- **Change visual assets** by replacing image files
- **Adjust difficulty** by modifying pipe spacing and generation timing
- **Customize styling** through the CSS file

## 🐛 Browser Compatibility

- ✅ Google Chrome
- ✅ Mozilla Firefox  
- ✅ Safari
- ✅ Microsoft Edge
- ✅ Other modern browsers with HTML5 Canvas support

## 📝 File Structure

```
├── index.html          # Main HTML file with canvas element
├── index.js            # Game logic, physics, and controls
├── style.css           # Styling and visual presentation
├── flappybird.gif      # Animated bird sprite
├── toppipe.png         # Top pipe obstacle image
├── bottompipe.png      # Bottom pipe obstacle image
└── flappybirdbg.png    # Background scenery image
```

## 🏆 High Score

Your high score is automatically saved using browser session storage and will persist until you close the browser tab. Try to beat your personal best!

## 🎮 Controls Summary

| Key | Action |
|-----|--------|
| `Spacebar` | Jump / Start Game / Restart |
| `Arrow Up` | Jump / Start Game / Restart |

---

**Made with ❤️ by [Kartikeya](https://github.com/kartikeya042)**

Enjoy playing Flappy Bird! 🐦✨