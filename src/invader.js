export class Invader {
  constructor(x, y, type, ctx) {
    this.x = x;
    this.y = y;
    this.type = type; // 0, 1, or 2 for different invader types
    this.ctx = ctx;
    this.width = 40;
    this.height = 30;
    this.animationFrame = 0;
    this.animationTimer = 0;
    
    // Explosive invader property - increase chance to 30% (6 bombs per 20 invaders)
    this.isExplosive = Math.random() < 0.30; // 30% chance to be explosive
    
    // Modern design properties
    this.glowIntensity = 0.3 + Math.random() * 0.2;
    this.glowDirection = 0.01 + Math.random() * 0.01;
    this.hoverOffset = Math.random() * Math.PI * 2; // Random starting point for hover effect
  }
  
  update(deltaTime) {
    // Animation timing
    this.animationTimer += deltaTime;
    if (this.animationTimer >= 500) {
      this.animationTimer = 0;
      this.animationFrame = this.animationFrame === 0 ? 1 : 0;
    }
    
    // Animate glow
    this.glowIntensity += this.glowDirection;
    if (this.glowIntensity > 0.6 || this.glowIntensity < 0.2) {
      this.glowDirection *= -1;
    }
    
    // Update hover offset
    this.hoverOffset += 0.05;
  }
  
  draw() {
    // Save context
    this.ctx.save();
    
    // Get color based on invader type
    let primaryColor, secondaryColor, primaryRgb;
    
    switch (this.type) {
      case 0: // Elite invaders (top row)
        primaryColor = 'rgba(255, 42, 109,';
        primaryRgb = 'rgb(255, 42, 109)';
        secondaryColor = '#ff9e00';
        break;
      case 1: // Standard invaders (middle rows)
        primaryColor = 'rgba(5, 255, 161,';
        primaryRgb = 'rgb(5, 255, 161)';
        secondaryColor = '#00eeff';
        break;
      case 2: // Basic invaders (bottom rows)
        primaryColor = 'rgba(110, 68, 255,';
        primaryRgb = 'rgb(110, 68, 255)';
        secondaryColor = '#b44aff';
        break;
    }
    
    // Apply subtle hover effect
    const hoverY = Math.sin(this.hoverOffset) * 2;
    
    // Draw glow effect
    const gradient = this.ctx.createRadialGradient(
      this.x + this.width / 2, this.y + this.height / 2 + hoverY, 5,
      this.x + this.width / 2, this.y + this.height / 2 + hoverY, 40
    );
    
    gradient.addColorStop(0, primaryColor + ' ' + this.glowIntensity + ')');
    gradient.addColorStop(1, 'rgba(10, 11, 26, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(this.x + this.width / 2, this.y + this.height / 2 + hoverY, 40, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Create gradient for invader body
    const bodyGradient = this.ctx.createLinearGradient(
      this.x, this.y + hoverY, 
      this.x + this.width, this.y + this.height + hoverY
    );
    
    bodyGradient.addColorStop(0, primaryRgb);
    bodyGradient.addColorStop(1, secondaryColor);
    
    // Draw invader based on type and animation frame
    this.ctx.fillStyle = bodyGradient;
    
    if (this.type === 0) {
      this.drawEliteInvader(hoverY);
    } else if (this.type === 1) {
      this.drawStandardInvader(hoverY);
    } else {
      this.drawBasicInvader(hoverY);
    }
    
    // Draw bomb indicator for explosive invaders
    if (this.isExplosive) {
      this.drawBombIndicator(hoverY);
    }
    
    // Restore context
    this.ctx.restore();
  }
  
  drawBombIndicator(hoverY) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2 + hoverY;
    
    // Pulsing effect for the bomb
    const pulseScale = 1 + Math.sin(this.hoverOffset * 2) * 0.2;
    
    // Draw bomb body
    this.ctx.fillStyle = '#ff9e00';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 6 * pulseScale, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw bomb fuse
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY - 6 * pulseScale);
    
    // Curly fuse with animation
    const fuseOffset = Math.sin(this.hoverOffset * 3) * 2;
    this.ctx.bezierCurveTo(
      centerX + 5, centerY - 8 * pulseScale,
      centerX - 2 + fuseOffset, centerY - 12 * pulseScale,
      centerX + 3, centerY - 14 * pulseScale
    );
    this.ctx.stroke();
    
    // Draw spark at the end of the fuse
    if (this.animationFrame === 1) {
      this.ctx.fillStyle = '#ffffff';
    } else {
      this.ctx.fillStyle = '#ff9e00';
    }
    this.ctx.beginPath();
    this.ctx.arc(centerX + 3, centerY - 14 * pulseScale, 1.5, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw warning symbol
    this.ctx.fillStyle = '#000000';
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - 3 * pulseScale, centerY - 1 * pulseScale);
    this.ctx.lineTo(centerX + 3 * pulseScale, centerY - 1 * pulseScale);
    this.ctx.lineTo(centerX, centerY + 3 * pulseScale);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw exclamation mark
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY - 1 * pulseScale, 1, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  drawEliteInvader(hoverY) {
    // Elite invader - more complex design
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2 + hoverY;
    
    // Main body - hexagonal shape
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + (this.animationFrame * Math.PI / 12);
      const x = centerX + Math.cos(angle) * 15;
      const y = centerY + Math.sin(angle) * 15;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
    
    // Core
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Energy beams
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 2;
    
    for (let i = 0; i < 3; i++) {
      const angle = (Math.PI * 2 / 3) * i + (this.animationFrame * Math.PI / 6);
      const x = centerX + Math.cos(angle) * 20;
      const y = centerY + Math.sin(angle) * 20;
      
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    }
  }
  
  drawStandardInvader(hoverY) {
    // Standard invader - diamond shape with details
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2 + hoverY;
    
    // Main body - diamond
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY - 15);
    this.ctx.lineTo(centerX + 15, centerY);
    this.ctx.lineTo(centerX, centerY + 15);
    this.ctx.lineTo(centerX - 15, centerY);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Inner details
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Animated wings
    const wingExtension = this.animationFrame * 5;
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    
    // Left wing
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - 15, centerY);
    this.ctx.lineTo(centerX - 15 - wingExtension, centerY - 5);
    this.ctx.lineTo(centerX - 15 - wingExtension, centerY + 5);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Right wing
    this.ctx.beginPath();
    this.ctx.moveTo(centerX + 15, centerY);
    this.ctx.lineTo(centerX + 15 + wingExtension, centerY - 5);
    this.ctx.lineTo(centerX + 15 + wingExtension, centerY + 5);
    this.ctx.closePath();
    this.ctx.fill();
  }
  
  drawBasicInvader(hoverY) {
    // Basic invader - circular with segments
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2 + hoverY;
    const radius = 15;
    
    // Main body - circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Segments
    this.ctx.fillStyle = 'rgba(10, 11, 26, 0.5)';
    
    const segments = 6;
    const segmentAngle = Math.PI * 2 / segments;
    const rotationOffset = this.animationFrame * Math.PI / 12;
    
    for (let i = 0; i < segments; i += 2) {
      const startAngle = i * segmentAngle + rotationOffset;
      const endAngle = startAngle + segmentAngle;
      
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      this.ctx.closePath();
      this.ctx.fill();
    }
    
    // Center eye
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
