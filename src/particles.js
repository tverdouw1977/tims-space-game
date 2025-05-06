export function initParticles() {
  const particlesContainer = document.getElementById('particles');
  const particleCount = 50;
  
  // Create particles
  for (let i = 0; i < particleCount; i++) {
    createParticle(particlesContainer);
  }
}

function createParticle(container) {
  const particle = document.createElement('div');
  
  // Set particle styles
  particle.style.position = 'absolute';
  particle.style.width = `${Math.random() * 3 + 1}px`;
  particle.style.height = particle.style.width;
  particle.style.background = getRandomColor();
  particle.style.borderRadius = '50%';
  particle.style.opacity = Math.random() * 0.5 + 0.2;
  
  // Set initial position
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  particle.style.left = `${x}vw`;
  particle.style.top = `${y}vh`;
  
  // Set animation
  particle.style.animation = `float ${Math.random() * 30 + 20}s linear infinite`;
  particle.style.transform = `translateY(0)`;
  
  // Add keyframes for this specific particle
  const keyframes = `
    @keyframes float {
      0% {
        transform: translate(0, 0);
      }
      25% {
        transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px);
      }
      50% {
        transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px);
      }
      75% {
        transform: translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px);
      }
      100% {
        transform: translate(0, 0);
      }
    }
  `;
  
  // Add keyframes to document
  const style = document.createElement('style');
  style.innerHTML = keyframes;
  document.head.appendChild(style);
  
  // Add particle to container
  container.appendChild(particle);
  
  // Add subtle glow effect
  particle.style.boxShadow = `0 0 ${Math.random() * 5 + 2}px ${particle.style.background}`;
  
  // Add random delay to animation
  particle.style.animationDelay = `${Math.random() * 10}s`;
}

function getRandomColor() {
  const colors = [
    'rgba(110, 68, 255, 0.8)', // primary
    'rgba(0, 238, 255, 0.8)',  // secondary
    'rgba(255, 42, 109, 0.8)', // accent
    'rgba(5, 255, 161, 0.8)'   // success
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}
