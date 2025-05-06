export class Projectile {
  constructor(x, y, isPlayer, ctx) {
    this.x = x;
    this.y = y;
    this.isPlayer = isPlayer;
    this.ctx = ctx;
    this.width = isPlayer ? 4 : 6;
    this.height = isPlayer ? 15 : 12;
    this.speed = isPlayer ? -8 : 5; // Negative for player (moving up)
    
    // Modern design properties
    this.trailLength = isPlayer ? 20 : 15;
    this.trailOpacity = isPlayer ? 0.7 : 0.5;
    this.pulseDirection = 1;
    this.pulseValue = 0;
    
    // Colors
    if (isPlayer) {
      this.primaryColor = '#00eeff';
      this.secondaryColor = '#6e44ff';
    } else {
      this.primaryColor = '#ff2a6d';
      this.secondaryColor = '#ff9e00';
    }
  }
  
  update(deltaTime) {
    // Move projectile
    this.y += this.speed;
    
    // Pulse effect
    this.pulseValue += 0.1 * this.pulseDirection;
    if (this.pulseValue > 1 || this.pulseValue < 0) {
      this.pulseDirection *= -1;
    }
  }
  
  draw() {
    // Save context
    this.ctx.save();
    
    if (this.isPlayer) {
      this.drawPlayerProjectile();
    } else {
      this.drawInvaderProjectile();
    }
    
    // Restore context
    this.ctx.restore();
  }
  
  drawPlayerProjectile() {
    // Draw trail
    const gradient = this.ctx.createLinearGradient(
      this.x, this.y, 
      this.x, this.y + this.trailLength
    );
    
    gradient.addColorStop(0, this.primaryColor);
    gradient.addColorStop(1, 'rgba(110, 68, 255, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.moveTo(this.x - this.width / 2, this.y);
    this.ctx.lineTo(this.x + this.width / 2, this.y);
    this.ctx.lineTo(this.x + this.width / 2 - 1, this.y + this.trailLength);
    this.ctx.lineTo(this.x - this.width / 2 + 1, this.y + this.trailLength);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw projectile head
    const headGradient = this.ctx.createLinearGradient(
      this.x - this.width, this.y - this.height / 2, 
      this.x + this.width, this.y + this.height / 2
    );
    
    headGradient.addColorStop(0, this.secondaryColor);
    headGradient.addColorStop(1, this.primaryColor);
    
    this.ctx.fillStyle = headGradient;
    this.ctx.beginPath();
    this.ctx.moveTo(this.x, this.y - this.height / 2);
    this.ctx.lineTo(this.x + this.width / 2, this.y);
    this.ctx.lineTo(this.x, this.y + this.height / 2);
    this.ctx.lineTo(this.x - this.width / 2, this.y);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw glow
    const glowSize = 10 + this.pulseValue * 5;
    const glowGradient = this.ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, glowSize
    );
    
    glowGradient.addColorStop(0, 'rgba(0, 238, 255, 0.5)');
    glowGradient.addColorStop(1, 'rgba(0, 238, 255, 0)');
    
    this.ctx.fillStyle = glowGradient;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  drawInvaderProjectile() {
    // Draw trail
    const gradient = this.ctx.createLinearGradient(
      this.x, this.y - this.trailLength, 
      this.x, this.y
    );
    
    gradient.addColorStop(0, 'rgba(255, 42, 109, 0)');
    gradient.addColorStop(1, this.primaryColor);
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.moveTo(this.x - this.width / 2, this.y - this.trailLength);
    this.ctx.lineTo(this.x + this.width / 2, this.y - this.trailLength);
    this.ctx.lineTo(this.x + this.width / 2, this.y);
    this.ctx.lineTo(this.x - this.width / 2, this.y);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw energy bolt
    const boltGradient = this.ctx.createLinearGradient(
      this.x - this.width, this.y, 
      this.x + this.width, this.y + this.height
    );
    
    boltGradient.addColorStop(0, this.primaryColor);
    boltGradient.addColorStop(1, this.secondaryColor);
    
    this.ctx.fillStyle = boltGradient;
    
    // Zigzag bolt
    this.ctx.beginPath();
    this.ctx.moveTo(this.x - this.width / 2, this.y);
    this.ctx.lineTo(this.x + this.width / 2, this.y);
    this.ctx.lineTo(this.x, this.y + this.height / 3);
    this.ctx.lineTo(this.x + this.width / 2, this.y + this.height / 3);
    this.ctx.lineTo(this.x - this.width / 2, this.y + this.height * 2/3);
    this.ctx.lineTo(this.x, this.y + this.height * 2/3);
    this.ctx.lineTo(this.x, this.y + this.height);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw glow
    const glowSize = 8 + this.pulseValue * 4;
    const glowGradient = this.ctx.createRadialGradient(
      this.x, this.y + this.height / 2, 0,
      this.x, this.y + this.height / 2, glowSize
    );
    
    glowGradient.addColorStop(0, 'rgba(255, 42, 109, 0.4)');
    glowGradient.addColorStop(1, 'rgba(255, 42, 109, 0)');
    
    this.ctx.fillStyle = glowGradient;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y + this.height / 2, glowSize, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
