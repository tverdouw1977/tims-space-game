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
    this.startButtonElement = document.getElementById('startButton');
    
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
    this.startGame = this.startGame.bind(this);
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
    
    // Add start button event listener
    if (this.startButtonElement) {
      this.startButtonElement.addEventListener('click', this.startGame);
      this.startButtonElement.classList.remove('hidden');
    }
    
    // Load sounds
    this.soundManager.init();
    
    // Start game loop but don't start the actual game yet
    requestAnimationFrame(this.gameLoop);
  }
  
  startGame() {
    if (!this.gameStarted) {
      this.gameStarted = true;
      
      // Hide start button
      if (this.startButtonElement) {
        this.startButtonElement.classList.add('hidden');
      }
      
      // Hide controls after a short delay
      setTimeout(() => {
        this.hideControls();
      }, 1000);
      
      // Start background music
      this.soundManager.playBackgroundMusic();
    }
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
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw background
    this.drawBackground(deltaTime);
    
    if (!this.gameStarted) {
      // Draw title screen
      this.drawTitleScreen();
    } else if (!this.isPaused && !this.isGameOver) {
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
  
  drawTitleScreen() {
    // Draw game title
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 40px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('NEO SPACE', this.width / 2, this.height / 3 - 30);
    this.ctx.fillText('INVADERS', this.width / 2, this.height / 3 + 30);
    this.ctx.fillText('2025', this.width / 2, this.height / 3 + 90);
    
    // Draw subtitle
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.fillText('CLICK START OR PRESS ENTER TO PLAY', this.width / 2, this.height / 2 + 50);
    
    // Draw a pulsing effect around the title
    const time = Date.now() / 1000;
    const pulseSize = 150 + Math.sin(time * 2) * 20;
    
    const gradient = this.ctx.createRadialGradient(
      this.width / 2, this.height / 3, 10,
      this.width / 2, this.height / 3, pulseSize
    );
    
    gradient.addColorStop(0, 'rgba(110, 68, 255, 0.3)');
    gradient.addColorStop(0.5, 'rgba(5, 255, 161, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 42, 109, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(this.width / 2, this.height / 3, pulseSize, 0, Math.PI * 2);
    this.ctx.fill();
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
  
  // Find invaders that are connected to the given invader
  findConnectedInvaders(invader, visited = new Set()) {
    // Mark this invader as visited
    visited.add(invader);
    
    // Find all invaders that are close enough to be considered "connected"
    const connectedDistance = invader.width + this.invaderPadding / 2;
    
    this.invaders.forEach(otherInvader => {
      if (otherInvader !== invader && !visited.has(otherInvader)) {
        // Calculate distance between invaders
        const dx = otherInvader.x + otherInvader.width / 2 - (invader.x + invader.width / 2);
        const dy = otherInvader.y + otherInvader.height / 2 - (invader.y + invader.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If they're close enough, they're connected
        if (distance < connectedDistance) {
          // Recursively find invaders connected to this one
          this.findConnectedInvaders(otherInvader, visited);
        }
      }
    });
    
    return visited;
  }
  
  // Trigger chain reaction explosion
  triggerChainReaction(invader) {
    // Find all connected invaders
    const connectedInvaders = this.findConnectedInvaders(invader);
    
    // Create a copy of the invaders array to avoid modification during iteration
    const invadersCopy = [...this.invaders];
    
    // Remove all connected invaders and create explosions
    connectedInvaders.forEach(connectedInvader => {
      // Find the index in the original array
      const index = this.invaders.indexOf(connectedInvader);
      if (index !== -1) {
        // Remove from the original array
        this.invaders.splice(index, 1);
        
        // Create explosion particles
        let color;
        switch (connectedInvader.type) {
          case 0: color = '#ff2a6d'; break;
          case 1: color = '#05ffa1'; break;
          case 2: color = '#6e44ff'; break;
        }
        
        this.createExplosionParticles(
          connectedInvader.x + connectedInvader.width / 2,
          connectedInvader.y + connectedInvader.height / 2,
          color,
          30
        );
        
        // Increase score
        this.score += (3 - connectedInvader.type) * 10 + 10;
        
        // Add bonus for chain reaction
        if (connectedInvader !== invader) {
          this.score += 15; // Bonus points for chain reaction
        }
        
        // Play explosion sound (with slight delay for chain effect)
        setTimeout(() => {
          this.soundManager.play('invaderExplode');
        }, Math.random() * 200);
      }
    });
    
    // If all invaders are destroyed, create new wave
    if (this.invaders.length === 0) {
      this.createInvaders();
      this.invaderMoveInterval = Math.max(200, this.invaderMoveInterval - 100);
      this.invaderShootChance += 0.002;
    }
  }
  
  checkCollisions() {
    // Check player projectiles vs invaders
    this.playerProjectiles.forEach((projectile, pIndex) => {
      let projectileRemoved = false;
      
      for (let i = 0; i < this.invaders.length; i++) {
        const invader = this.invaders[i];
        
        if (this.checkCollision(projectile, invader)) {
          // Remove projectile if we haven't already
          if (!projectileRemoved) {
            this.playerProjectiles.splice(pIndex, 1);
            projectileRemoved = true;
          }
          
          // Check if this is an explosive invader
          if (invader.isExplosive) {
            // Trigger chain reaction
            this.triggerChainReaction(invader);
          } else {
            // Regular invader explosion
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
            this.invaders.splice(i, 1);
            i--; // Adjust index after removal
            
            // Increase score
            this.score += (3 - invader.type) * 10 + 10;
            
            // Play explosion sound
            this.soundManager.play('invaderExplode');
          }
          
          // If all invaders are destroyed, create new wave
          if (this.invaders.length === 0) {
            this.createInvaders();
            this.invaderMoveInterval = Math.max(200, this.invaderMoveInterval - 100);
            this.invaderShootChance += 0.002;
          }
          
          // If the projectile is removed, we can't hit any more invaders with it
          if (projectileRemoved) {
            break;
          }
        }
      }
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
      this.soundManager.stopBackgroundMusic();
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
    // Start game with Enter key
    if (!this.gameStarted && e.code === 'Enter') {
      this.startGame();
      return;
    }
    
    // If game is over, restart with Space
    if (this.isGameOver && e.code === 'Space') {
      this.resetGame();
      return;
    }
    
    // Only process movement if game has started
    if (this.gameStarted) {
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
  }
  
  handleKeyUp(e) {
    if (this.gameStarted) {
      switch (e.code) {
        case 'ArrowLeft':
          this.player.moveLeft = false;
          break;
        case 'ArrowRight':
          this.player.moveRight = false;
          break;
      }
    }
  }
  
  playerShoot() {
    // Only allow shooting if game has started
    if (this.gameStarted && this.player.canShoot && !this.isPaused && !this.isGameOver) {
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
    if (this.gameStarted) {
      this.isPaused = !this.isPaused;
      
      // Pause/resume background music
      if (this.isPaused) {
        this.soundManager.pauseBackgroundMusic();
      } else {
        this.soundManager.resumeBackgroundMusic();
      }
    }
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
    
    // Restart background music
    this.soundManager.playBackgroundMusic();
  }
}
