export class SoundManager {
  constructor() {
    this.sounds = {};
    this.isMuted = false;
  }
  
  init() {
    // Create audio context
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create modern sounds
    this.createSound('playerShoot', [0.0, 0.2, 0.3, 0.1, 0.0], 0.3, 0.8, 'sine', 880);
    this.createSound('invaderShoot', [0.0, 0.1, 0.2, 0.1, 0.0], 0.4, 0.6, 'sawtooth', 220);
    this.createSound('invaderExplode', [0.0, 0.3, 0.2, 0.1, 0.0], 0.5, 0.7, 'noise');
    this.createSound('playerHit', [0.3, 0.2, 0.1, 0.3, 0.2, 0.1, 0.0], 0.6, 0.8, 'square', 110);
    this.createSound('gameOver', [0.3, 0.4, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0], 2.0, 0.7, 'triangle', 220);
    
    // Create invader movement sounds - more electronic/digital
    this.createSound('invaderMove1', [0.0, 0.1, 0.0], 0.1, 0.3, 'sine', 440);
    this.createSound('invaderMove2', [0.0, 0.1, 0.0], 0.1, 0.3, 'sine', 466);
    this.createSound('invaderMove3', [0.0, 0.1, 0.0], 0.1, 0.3, 'sine', 494);
    this.createSound('invaderMove4', [0.0, 0.1, 0.0], 0.1, 0.3, 'sine', 523);
    
    // Add reverb to make sounds more spacious
    this.setupReverb();
  }
  
  setupReverb() {
    // Create convolver node for reverb effect
    this.convolver = this.audioContext.createConvolver();
    
    // Create impulse response for reverb
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * 2; // 2 seconds
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);
    const leftChannel = impulse.getChannelData(0);
    const rightChannel = impulse.getChannelData(1);
    
    // Fill impulse with noise and apply decay
    for (let i = 0; i < length; i++) {
      const decay = Math.pow(0.9, i / 5000);
      leftChannel[i] = (Math.random() * 2 - 1) * decay;
      rightChannel[i] = (Math.random() * 2 - 1) * decay;
    }
    
    this.convolver.buffer = impulse;
    this.convolver.connect(this.audioContext.destination);
  }
  
  createSound(name, envelope, duration, volume, type, frequency = 440) {
    this.sounds[name] = {
      envelope,
      duration,
      volume,
      type,
      frequency
    };
  }
  
  play(name) {
    if (this.isMuted || !this.sounds[name]) return;
    
    const sound = this.sounds[name];
    
    // Create nodes
    const gainNode = this.audioContext.createGain();
    let sourceNode;
    
    if (sound.type === 'noise') {
      // Create noise
      const bufferSize = 2 * this.audioContext.sampleRate;
      const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      sourceNode = this.audioContext.createBufferSource();
      sourceNode.buffer = noiseBuffer;
    } else {
      // Create oscillator
      sourceNode = this.audioContext.createOscillator();
      sourceNode.type = sound.type;
      sourceNode.frequency.value = sound.frequency;
      
      // Add slight detune for more interesting sound
      sourceNode.detune.value = Math.random() * 20 - 10;
    }
    
    // Create filter for more interesting sound
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000 + Math.random() * 500;
    filter.Q.value = 5;
    
    // Connect nodes
    sourceNode.connect(filter);
    filter.connect(gainNode);
    
    // Connect to both direct output and reverb
    gainNode.connect(this.audioContext.destination);
    
    // Add reverb for some sounds
    if (['invaderExplode', 'playerHit', 'gameOver'].includes(name)) {
      const reverbGain = this.audioContext.createGain();
      reverbGain.gain.value = 0.3; // Reverb level
      gainNode.connect(reverbGain);
      reverbGain.connect(this.convolver);
    }
    
    // Set initial gain to 0
    gainNode.gain.value = 0;
    
    // Apply envelope
    const now = this.audioContext.currentTime;
    const envelopeStepTime = sound.duration / (sound.envelope.length - 1);
    
    sound.envelope.forEach((value, index) => {
      gainNode.gain.setValueAtTime(
        value * sound.volume,
        now + index * envelopeStepTime
      );
    });
    
    // Start and stop
    sourceNode.start();
    sourceNode.stop(now + sound.duration);
  }
  
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}
