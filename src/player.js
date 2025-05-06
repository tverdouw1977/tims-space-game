export class Player {
  constructor(x, y, ctx) {
    this.x = x;
    this.y = y;
    this.ctx = ctx;
    this.width = 50;
    this.height = 30;
    this.speed = 5;
    this.moveLeft = false;
    this.moveRight = false;
    this.canShoot = true;
    this.isHit = false;
    this.hitTimer = 0;
    
    // Modern design properties
    this.thrusterAnimation = 0;
    this.thrusterDirection = 1;
    this.glowIntensity = 0.5;
    this.glowDirection = 0.02;
  }
  
  update(deltaTime) {
    // Movement
    if (this.moveLeft) {
      this.x = Math.max(10, this.x - this.speed);
    }
    if (this.moveRight) {
      this.x = Math.min(this.ctx.canvas.width - this.width - 10, this.x + this.speed);
    }
    
    // Hit effect
    if (this.isHit) {
      this.hitTimer += deltaTime;
      if (this.hitTimer >= 1000) {
        this.isHit = false;
        this.hitTimer = 0;
      }
    }
    
    // Animate thrusters
    this.thrusterAnimation += 0.1 * this.thrusterDirection;
    if (this.thrusterAnimation > 1 || this.thrusterAnimation < 0) {
      this.thrusterDirection *= -1;
    }
    
    // Animate glow
    this.glowIntensity += this.glowDirection;
    if (this.glowIntensity > 0.8 || this.glowIntensity < 0.3) {
      this.glowDirection *= -1;
    }
  }
  
  draw() {
    // Skip drawing every other frame when hit for flicker effect
    if (this.isHit && Math.floor(this.hitTimer / 100) % 2 === 0) {
      return;
    }
    
    // Save context for transformations
    this.ctx.save();
    
    // Draw glow effect
    const gradient = this.ctx.createRadialGradient(
      this.x + this.width / 2, this.y + this.height / 2, 5,
      this.x + this.width / 2, this.y + this.height / 2, 50
    );
    
    const glowColor = this.isHit ? 'rgba(255, 42, 109, ' : 'rgba(0, 238, 255, ';
    gradient.addColorStop(0, glowColor + this.glowIntensity * 0.5 + ')');
    gradient.addColorStop(1, 'rgba(10, 11, 26, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 50, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw ship body - modern sleek design
    this.ctx.fillStyle = '#ffffff';
    
    // Main body - sleek triangular shape
    this.ctx.beginPath();
    this.ctx.moveTo(this.x + this.width / 2, this.y);
    this.ctx.lineTo(this.x + this.width - 5, this.y + this.height - 5);
    this.ctx.lineTo(this.x + 5, this.y + this.height - 5);
    this.ctx.closePath();
    
    // Create gradient for ship body
    const shipGradient = this.ctx.createLinearGradient(
      this.x, this.y, 
      this.x + this.width, this.y + this.height
    );
    
    if (this.isHit) {
      shipGradient.addColorStop(0, '#ff2a6d');
      shipGradient.addColorStop(1, '#ff9e00');
    } else {
      shipGradient.addColorStop(0, '#6e44ff');
      shipGradient.addColorStop(1, '#00eeff');
    }
    
    this.ctx.fillStyle = shipGradient;
    this.ctx.fill();
    
    // Add details with subtle white lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.lineWidth = 1;
    
    // Center line
    this.ctx.beginPath();
    this.ctx.moveTo(this.x + this.width / 2, this.y + 5);
    this.ctx.lineTo(this.x + this.width / 2, this.y + this.height - 10);
    this.ctx.stroke();
    
    // Wing details
    this.ctx.beginPath();
    this.ctx.moveTo(this.x + 10, this.y + this.height - 10);
    this.ctx.lineTo(this.x + this.width - 10, this.y + this.height - 10);
    this.ctx.stroke();
    
    // Draw thrusters with animation
    const thrusterHeight = 5 + this.thrusterAnimation * 3;
    
    // Left thruster
    this.ctx.fillStyle = 'rgba(255, 184, 0, 0.8)';
    this.ctx.beginPath();
    this.ctx.moveTo(this.x + 15, this.y + this.height - 5);
    this.ctx.lineTo(this.x + 25, this.y + this.height - 5);
    this.ctx.lineTo(this.x + 20, this.y + this.height - 5 + thrusterHeight);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Right thruster
    this.ctx.beginPath();
    this.ctx.moveTo(this.x + this.width - 15, this.y + this.height - 5);
    this.ctx.lineTo(this.x + this.width - 25, this.y + this.height - 5);
    this.ctx.lineTo(this.x + this.width - 20, this.y + this.height - 5 + thrusterHeight);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw weapon
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(
      this.x + this.width / 2 - 2,
      this.y - 5,
      4,
      10
    );
    
    // Restore context
    this.ctx.restore();
  }
  
  hit() {
    this.isHit = true;
    this.hitTimer = 0;
  }
}
