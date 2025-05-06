export class SoundManager {
  constructor() {
    this.sounds = {};
    this.isMuted = false;
    this.backgroundMusic = null;
    this.backgroundMusicGain = null;
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
    
    // Create background music
    this.createBackgroundMusic();
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
  
  createBackgroundMusic() {
    // Create gain node for background music volume control
    this.backgroundMusicGain = this.audioContext.createGain();
    this.backgroundMusicGain.gain.value = 0.3; // Set initial volume
    this.backgroundMusicGain.connect(this.audioContext.destination);
    
    // Add a bit of reverb to the background music
    const musicReverb = this.audioContext.createGain();
    musicReverb.gain.value = 0.2;
    this.backgroundMusicGain.connect(musicReverb);
    musicReverb.connect(this.convolver);
  }
  
  playBackgroundMusic() {
    if (this.isMuted) return;
    
    // Stop any existing background music
    this.stopBackgroundMusic();
    
    // Create a sequence of notes for the background music
    this.playBackgroundSequence();
  }
  
  playBackgroundSequence() {
    if (this.isMuted) return;
    
    // Define a sequence of notes for the arpeggio
    const baseNotes = [
      // Minor scale with some variations
      220, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00,
      // Higher octave
      523.25, 587.33, 659.25
    ];
    
    // Create a pattern of notes
    const pattern = [];
    const patternLength = 16;
    
    // Create a semi-random pattern that sounds good
    for (let i = 0; i < patternLength; i++) {
      // Choose notes that form a coherent progression
      let noteIndex;
      
      if (i % 8 === 0) {
        // Root note on main beats
        noteIndex = 0;
      } else if (i % 4 === 0) {
        // Fifth on secondary beats
        noteIndex = 4;
      } else if (i % 2 === 0) {
        // Other chord tones on other even beats
        noteIndex = [2, 4, 6][Math.floor(Math.random() * 3)];
      } else {
        // Random notes from scale on odd beats
        noteIndex = Math.floor(Math.random() * baseNotes.length);
      }
      
      pattern.push(baseNotes[noteIndex]);
    }
    
    // Schedule all the notes in the pattern
    const now = this.audioContext.currentTime;
    const noteDuration = 0.2; // Duration of each note
    const totalDuration = noteDuration * pattern.length;
    
    // Create a bass line
    this.scheduleBassPulse(now, totalDuration);
    
    // Schedule the arpeggio notes
    pattern.forEach((frequency, index) => {
      this.scheduleArpeggioNote(frequency, now + index * noteDuration, noteDuration);
    });
    
    // Schedule the next sequence
    this.backgroundMusicTimeout = setTimeout(() => {
      this.playBackgroundSequence();
    }, totalDuration * 1000);
  }
  
  scheduleArpeggioNote(frequency, startTime, duration) {
    // Create oscillator for the note
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    // Create filter for a more interesting sound
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 5;
    
    // Create gain node for envelope
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0;
    
    // Connect nodes
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.backgroundMusicGain);
    
    // Apply envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.2, startTime + duration * 0.1);
    gainNode.gain.linearRampToValueAtTime(0.1, startTime + duration * 0.5);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
    
    // Start and stop the oscillator
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }
  
  scheduleBassPulse(startTime, totalDuration) {
    // Create oscillator for the bass
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.value = 110; // Low A
    
    // Create filter
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    
    // Create gain node
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0;
    
    // Connect nodes
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.backgroundMusicGain);
    
    // Create a pulsing effect
    const pulseCount = Math.floor(totalDuration / 0.5); // Pulse every half second
    
    for (let i = 0; i < pulseCount; i++) {
      const pulseTime = startTime + i * 0.5;
      gainNode.gain.setValueAtTime(0, pulseTime);
      gainNode.gain.linearRampToValueAtTime(0.3, pulseTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, pulseTime + 0.5);
    }
    
    // Start and stop
    oscillator.start(startTime);
    oscillator.stop(startTime + totalDuration);
  }
  
  pauseBackgroundMusic() {
    if (this.backgroundMusicTimeout) {
      clearTimeout(this.backgroundMusicTimeout);
      this.backgroundMusicTimeout = null;
    }
    
    // Fade out current music
    if (this.backgroundMusicGain) {
      const now = this.audioContext.currentTime;
      this.backgroundMusicGain.gain.linearRampToValueAtTime(0, now + 0.5);
    }
  }
  
  resumeBackgroundMusic() {
    if (!this.isMuted) {
      // Fade in music
      if (this.backgroundMusicGain) {
        const now = this.audioContext.currentTime;
        this.backgroundMusicGain.gain.linearRampToValueAtTime(0.3, now + 0.5);
      }
      
      // Restart sequence
      this.playBackgroundSequence();
    }
  }
  
  stopBackgroundMusic() {
    if (this.backgroundMusicTimeout) {
      clearTimeout(this.backgroundMusicTimeout);
      this.backgroundMusicTimeout = null;
    }
    
    // Immediately silence any playing music
    if (this.backgroundMusicGain) {
      this.backgroundMusicGain.gain.value = 0;
    }
  }
  
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
    
    return this.isMuted;
  }
}
