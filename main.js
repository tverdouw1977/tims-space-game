import './style.css';
import { Game } from './src/game.js';
import { initParticles } from './src/particles.js';

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize background particles
  initParticles();
  
  // Initialize the game
  const game = new Game();
  game.init();
});
