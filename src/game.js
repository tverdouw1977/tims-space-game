import { Player } from './player.js';
import { Invader } from './invader.js';
import { Projectile } from './projectile.js';
import { SoundManager } from './soundManager.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.scoreElement = document.getElementById('score');
    this.livesElement = document.getElementById('lives');
    this.gameOverElement = document.getElementById('gameOver');
    this.finalScoreElement = document.getElementById('finalScore');
    this.controlsElement = document.getElementById('controls');
    
    // Game dimensions
    this.width = 600;
    this.height = 700;
    
    // Game state
    this.score = 0;
    this.lives = 3;
    this.isGameOver = false;
    this.isPaused = false;
    this.gameStarted = false;
    
    // Game objects
    this.player = null;
    this.invaders = [];
    this.playerProjectiles = [];
    this.invaderProjectiles = [];
    this.particles = [];
    
    // Game settings
    this.invaderRows = 5;
    this.invaderCols = 10;
    this.invaderPadding = 15;
    this.invaderMoveSpeed = 1;
    this.invaderMoveDown = 20;
    this.invaderDirection = 1; // 1 for right, -1 for left
    this.invaderShootChance = 0.005;
    
    // Timing
    this.lastTime = 0;
    this.invaderMoveTimer = 0;
    this.invaderMoveInterval = 1000; // ms
    this.currentSoundIndex = 1;
    
    // Visual effects
    this.backgroundStars = [];
    this.createStars(100);
    
    // Sound manager
    this.soundManager = new SoundManager();
    
    // Bind methods
    this.gameLoop = this.gameLoop.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }
  
  init() {
    // Set canvas size
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // Create player
    this.player = new Player(this.width / 2, this.height - 50, this.ctx);
    
    // Create invaders
    this.createInvaders();
    
    // Add event listeners
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    
    // Load sounds
    this.soundManager.init();
    
    // Start game loop
    requestAnimationFrame(this.gameLoop);
  }
  
  createStars(count) {
    for (let i = 0; i < count; i++) {
      this.backgroundStars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.2 + 0.1,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinkleDirection: Math.random() > 0.5 ? 1 : -1
      });
    }
  }
  
  createInvaders() {
    const invaderWidth = 40;
    const invaderHeight = 30;
    const startX = (this.width - (this.invaderCols * (invaderWidth + this.invaderPadding))) / 2;
    const startY = 50;
    
    for (let row = 0; row < this.invaderRows; row++) {
      for (let col = 0; col < this.invaderCols; col++) {
        const x = startX + col * (invaderWidth + this.invaderPadding);
        const y = startY + row * (invaderHeight + this.invaderPadding);
        const type = row % 3; // Different types based on row
        this.invaders.push(new Invader(x, y, type, this.ctx));
      }
    }
  }
  
  createExplosionParticles(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 3 + 1,
        angle: Math.random() * Math.PI * 2,
        color,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.02
      });
    }
  }
  
  gameLoop(timestamp) {
    // Calculate delta time
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    if (!this.isPaused && !this.isGameOver) {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.width, this.height);
      
      // Draw background
      this.drawBackground(deltaTime);
      
      // Update and draw player
      this.player.update(deltaTime);
      this.player.draw();
      
      // Update and draw invaders
      this.updateInvaders(deltaTime, timestamp);
      this.drawInvaders();
      
      // Update and draw projectiles
      this.updateProjectiles(deltaTime);
      this.drawProjectiles();
      
      // Update and draw particles
      this.updateParticles(deltaTime);
      this.drawParticles();
      
      // Check collisions
      this.checkCollisions();
      
      // Check game over conditions
      this.checkGameOver();
      
      // Update UI
      this.updateUI();
    }
    
    // Request next frame
    requestAnimationFrame(this.gameLoop);
  }
  
  drawBackground(deltaTime) {
    // Create space background gradient
    const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    bgGradient.addColorStop(0, '#0a0b1a');
    bgGradient.addColorStop(1, '#1a1b3a');
    
    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw stars
    this.backgroundStars.forEach(star => {
      // Move star
      star.y += star.speed * deltaTime / 16;
      
      // Wrap around
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
      
      // Twinkle effect
      star.opacity += star.twinkleSpeed * star.twinkleDirection;
      if (star.opacity > 1 || star.opacity < 0.2) {
        star.twinkleDirection *= -1;
      }
      
      // Draw star
      this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    // Add subtle grid effect
    this.ctx.strokeStyle = 'rgba(110, 68, 255, 0.1)';
    this.ctx.lineWidth = 0.5;
    
    // Horizontal grid lines
    for (let y = 0; y < this.height; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
    
    // Vertical grid lines
    for (let x = 0; x < this.width; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
  }
  
  updateInvaders(deltaTime, timestamp) {
    // Update each invader animation
    this.invaders.forEach(invader => {
      invader.update(deltaTime);
    });
    
    // Move invaders
    this.invaderMoveTimer += deltaTime;
    
    if (this.invaderMoveTimer >= this.invaderMoveInterval) {
      this.invaderMoveTimer = 0;
      
      let moveDown = false;
      let leftEdge = this.width;
      let rightEdge = 0;
      
      // Find the leftmost and rightmost invaders
      this.invaders.forEach(invader => {
        leftEdge = Math.min(leftEdge, invader.x);
        rightEdge = Math.max(rightEdge, invader.x + invader.width);
      });
      
      // Check if invaders hit the edge
      if (rightEdge >= this.width - 10 && this.invaderDirection === 1) {
        this.invaderDirection = -1;
        moveDown = true;
      } else if (leftEdge <= 10 && this.invaderDirection === -1) {
        this.invaderDirection = 1;
        moveDown = true;
      }
      
      // Move invaders
      this.invaders.forEach(invader => {
        if (moveDown) {
          invader.y += this.invaderMoveDown;
          // Increase difficulty as invaders move down
          this.invaderMoveInterval = Math.max(200, this.invaderMoveInterval - 50);
        }
        invader.x += this.invaderMoveSpeed * this.invaderDirection * 10;
        
        // Random invader shooting
        if (Math.random() < this.invaderShootChance) {
          this.invaderProjectiles.push(
            new Projectile(
              invader.x + invader.width / 2,
              invader.y + invader.height,
              false,
              this.ctx
            )
          );
          this.soundManager.play('invaderShoot');
        }
      });
      
      // Play movement sound
      this.currentSoundIndex = (this.currentSoundIndex % 4) + 1;
      this.soundManager.play('invaderMove' + this.currentSoundIndex);
    }
  }
  
  drawInvaders() {
    this.invaders.forEach(invader => invader.draw());
  }
  
  updateProjectiles(deltaTime) {
    // Update player projectiles
    this.playerProjectiles.forEach(projectile => projectile.update(deltaTime));
    
    // Update invader projectiles
    this.invaderProjectiles.forEach(projectile => projectile.update(deltaTime));
    
    // Remove projectiles that are off screen
    this.playerProjectiles = this.playerProjectiles.filter(
      projectile => projectile.y > 0
    );
    
    this.invaderProjectiles = this.invaderProjectiles.filter(
      projectile => projectile.y < this.height
    );
  }
  
  drawProjectiles() {
    // Draw player projectiles
    this.playerProjectiles.forEach(projectile => projectile.draw());
    
    // Draw invader projectiles
    this.invaderProjectiles.forEach(projectile => projectile.draw());
  }
  
  updateParticles(deltaTime) {
    // Update particles
    this.particles.forEach(particle => {
      particle.x += Math.cos(particle.angle) * particle.speed * deltaTime / 16;
      particle.y += Math.sin(particle.angle) * particle.speed * deltaTime / 16;
      particle.alpha -= particle.decay * deltaTime / 16;
      particle.size -= 0.05 * deltaTime / 16;
    });
    
    // Remove dead particles
    this.particles = this.particles.filter(particle => particle.alpha > 0 && particle.size > 0);
  }
  
  drawParticles() {
    this.particles.forEach(particle => {
      this.ctx.globalAlpha = particle.alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    // Reset global alpha
    this.ctx.globalAlpha = 1;
  }
  
  checkCollisions() {
    // Check player projectiles vs invaders
    this.playerProjectiles.forEach((projectile, pIndex) => {
      this.invaders.forEach((invader, iIndex) => {
        if (this.checkCollision(projectile, invader)) {
          // Remove projectile
          this.playerProjectiles.splice(pIndex, 1);
          
          // Create explosion particles
          let color;
          switch (invader.type) {
            case 0: color = '#ff2a6d'; break;
            case 1: color = '#05ffa1'; break;
            case 2: color = '#6e44ff'; break;
          }
          
          this.createExplosionParticles(
            invader.x + invader.width / 2,
            invader.y + invader.height / 2,
            color,
            30
          );
          
          // Remove invader
          this.invaders.splice(iIndex, 1);
          
          // Increase score
          this.score += (3 - invader.type) * 10 + 10;
          
          // Play explosion sound
          this.soundManager.play('invaderExplode');
          
          // If all invaders are destroyed, create new wave
          if (this.invaders.length === 0) {
            this.createInvaders();
            this.invaderMoveInterval = Math.max(200, this.invaderMoveInterval - 100);
            this.invaderShootChance += 0.002;
          }
        }
      });
    });
    
    // Check invader projectiles vs player
    this.invaderProjectiles.forEach((projectile, index) => {
      if (this.checkCollision(projectile, this.player)) {
        // Remove projectile
        this.invaderProjectiles.splice(index, 1);
        
        // Create explosion particles
        this.createExplosionParticles(
          projectile.x,
          projectile.y,
          '#ff2a6d',
          15
        );
        
        // Decrease lives
        this.lives--;
        
        // Play player hit sound
        this.soundManager.play('playerHit');
        
        // Player flicker effect
        this.player.hit();
      }
    });
    
    // Check invaders vs player (collision or reaching bottom)
    this.invaders.forEach(invader => {
      if (this.checkCollision(invader, this.player) || invader.y + invader.height >= this.height - 50) {
        this.isGameOver = true;
        this.soundManager.play('gameOver');
      }
    });
  }
  
  checkCollision(obj1, obj2) {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }
  
  checkGameOver() {
    if (this.lives <= 0) {
      this.isGameOver = true;
      this.soundManager.play('gameOver');
    }
    
    if (this.isGameOver) {
      this.gameOverElement.classList.remove('hidden');
      this.finalScoreElement.textContent = `Final Score: ${this.score}`;
    }
  }
  
  updateUI() {
    this.scoreElement.textContent = `Score: ${this.score}`;
    this.livesElement.textContent = `Lives: ${this.lives}`;
  }
  
  handleKeyDown(e) {
    // If this is the first key press, hide the controls
    if (!this.gameStarted) {
      this.gameStarted = true;
      this.hideControls();
    }
    
    if (this.isGameOver && e.code === 'Space') {
      this.resetGame();
      return;
    }
    
    switch (e.code) {
      case 'ArrowLeft':
        this.player.moveLeft = true;
        break;
      case 'ArrowRight':
        this.player.moveRight = true;
        break;
      case 'Space':
        this.playerShoot();
        break;
      case 'KeyP':
        this.togglePause();
        break;
    }
  }
  
  handleKeyUp(e) {
    switch (e.code) {
      case 'ArrowLeft':
        this.player.moveLeft = false;
        break;
      case 'ArrowRight':
        this.player.moveRight = false;
        break;
    }
  }
  
  playerShoot() {
    // If this is the first shot, hide the controls
    if (!this.gameStarted) {
      this.gameStarted = true;
      this.hideControls();
    }
    
    // Limit shooting rate
    if (this.player.canShoot && !this.isPaused && !this.isGameOver) {
      this.playerProjectiles.push(
        new Projectile(
          this.player.x + this.player.width / 2,
          this.player.y,
          true,
          this.ctx
        )
      );
      
      this.player.canShoot = false;
      setTimeout(() => {
        this.player.canShoot = true;
      }, 500);
      
      this.soundManager.play('playerShoot');
    }
  }
  
  hideControls() {
    // Add a fade-out class to the controls
    if (this.controlsElement) {
      this.controlsElement.classList.add('fade-out');
      
      // Remove the controls after the animation completes
      setTimeout(() => {
        this.controlsElement.classList.add('hidden');
      }, 500); // Match this with the CSS animation duration
    }
  }
  
  togglePause() {
    this.isPaused = !this.isPaused;
  }
  
  resetGame() {
    // Reset game state
    this.score = 0;
    this.lives = 3;
    this.isGameOver = false;
    this.isPaused = false;
    
    // Reset game objects
    this.player = new Player(this.width / 2, this.height - 50, this.ctx);
    this.invaders = [];
    this.playerProjectiles = [];
    this.invaderProjectiles = [];
    this.particles = [];
    
    // Reset game settings
    this.invaderMoveInterval = 1000;
    this.invaderShootChance = 0.005;
    
    // Create new invaders
    this.createInvaders();
    
    // Hide game over screen
    this.gameOverElement.classList.add('hidden');
  }
}
