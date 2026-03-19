const audioFX = {
  ctx: null,
  master: null,
  musicTimer: null,
  musicStep: 0,
  jetOsc: null,
  jetGain: null,
  unlocked: false
};

function initAudio() {
  if (!audioFX.ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioFX.ctx = new AC();
    audioFX.master = audioFX.ctx.createGain();
    audioFX.master.gain.value = 0.16;
    audioFX.master.connect(audioFX.ctx.destination);
  }

  if (audioFX.ctx.state === 'suspended') {
    audioFX.ctx.resume();
  }

  audioFX.unlocked = true;
}

function beep(freq, duration, type, volume, when) {
  if (!audioFX.ctx) return;
  const t = when || audioFX.ctx.currentTime;

  const osc = audioFX.ctx.createOscillator();
  const gain = audioFX.ctx.createGain();

  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t);

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume || 0.05, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(gain);
  gain.connect(audioFX.master);

  osc.start(t);
  osc.stop(t + duration + 0.02);
}

function noiseBurst(duration, volume, when, hpFreq) {
  if (!audioFX.ctx) return;
  const t = when || audioFX.ctx.currentTime;
  const bufferSize = Math.max(1, Math.floor(audioFX.ctx.sampleRate * duration));
  const buffer = audioFX.ctx.createBuffer(1, bufferSize, audioFX.ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const src = audioFX.ctx.createBufferSource();
  src.buffer = buffer;

  const filter = audioFX.ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = hpFreq || 500;

  const gain = audioFX.ctx.createGain();
  gain.gain.setValueAtTime(volume || 0.04, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(audioFX.master);

  src.start(t);
  src.stop(t + duration + 0.02);
}

function startMenuMusic() {
  if (!audioFX.ctx || audioFX.musicTimer) return;

  const notas = [392, 523.25, 659.25, 523.25];
  audioFX.musicStep = 0;

  audioFX.musicTimer = setInterval(() => {
    if (!audioFX.ctx) return;
    const f = notas[audioFX.musicStep % notas.length];
    beep(f, 0.18, 'triangle', 0.035);
    beep(f * 2, 0.08, 'sine', 0.015, audioFX.ctx.currentTime + 0.02);
    audioFX.musicStep++;
  }, 320);
}

function stopMenuMusic() {
  if (audioFX.musicTimer) {
    clearInterval(audioFX.musicTimer);
    audioFX.musicTimer = null;
  }
}

function sfxShoot() {
  if (!audioFX.ctx) return;
  const t = audioFX.ctx.currentTime;
  beep(880, 0.06, 'square', 0.045, t);
  beep(640, 0.08, 'square', 0.03, t + 0.03);
}

function sfxFuel() {
  if (!audioFX.ctx) return;
  const t = audioFX.ctx.currentTime;
  beep(520, 0.08, 'triangle', 0.04, t);
  beep(740, 0.10, 'triangle', 0.05, t + 0.06);
}

function sfxHeart() {
  if (!audioFX.ctx) return;
  const t = audioFX.ctx.currentTime;
  beep(660, 0.09, 'sine', 0.04, t);
  beep(880, 0.11, 'sine', 0.05, t + 0.08);
  beep(1100, 0.13, 'sine', 0.04, t + 0.16);
}

function sfxDeath() {
  if (!audioFX.ctx) return;
  const t = audioFX.ctx.currentTime;
  beep(420, 0.12, 'sawtooth', 0.05, t);
  beep(260, 0.18, 'sawtooth', 0.045, t + 0.08);
  noiseBurst(0.18, 0.03, t + 0.02, 300);
}

function sfxHit() {
  if (!audioFX.ctx) return;
  const t = audioFX.ctx.currentTime;
  beep(240, 0.05, 'sawtooth', 0.05, t);
  beep(170, 0.08, 'sawtooth', 0.04, t + 0.04);
  noiseBurst(0.10, 0.03, t + 0.01, 450);
}

function sfxRanking() {
  if (!audioFX.ctx) return;
  const t = audioFX.ctx.currentTime;
  beep(784, 0.08, 'triangle', 0.035, t);
  beep(988, 0.08, 'triangle', 0.04, t + 0.08);
  beep(1174, 0.14, 'triangle', 0.045, t + 0.16);
}

function sfxLayer() {
  if (!audioFX.ctx) return;
  const t = audioFX.ctx.currentTime;
  beep(440, 0.10, 'triangle', 0.03, t);
  beep(660, 0.12, 'triangle', 0.04, t + 0.08);
  beep(990, 0.16, 'sine', 0.05, t + 0.18);
  noiseBurst(0.10, 0.015, t + 0.04, 900);
}

function sfxBoost() {
  if (!audioFX.ctx) return;
  const t = audioFX.ctx.currentTime;
  beep(520, 0.06, 'square', 0.035, t);
  beep(780, 0.08, 'square', 0.04, t + 0.05);
  beep(1170, 0.11, 'triangle', 0.05, t + 0.11);
  noiseBurst(0.12, 0.018, t + 0.02, 1200);
}

function startJetpackSound() {
  if (!audioFX.ctx) return;
  if (audioFX.jetOsc) return;

  const osc = audioFX.ctx.createOscillator();
  const gain = audioFX.ctx.createGain();
  const filter = audioFX.ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.value = 120;

  filter.type = 'lowpass';
  filter.frequency.value = 700;

  gain.gain.value = 0.0001;
  gain.gain.exponentialRampToValueAtTime(0.028, audioFX.ctx.currentTime + 0.04);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioFX.master);

  osc.start();

  audioFX.jetOsc = osc;
  audioFX.jetGain = gain;
}

function updateJetpackSound() {
  if (!audioFX.ctx || !audioFX.jetOsc) return;
  const t = audioFX.ctx.currentTime;
  const wobble = 110 + Math.random() * 35;
  audioFX.jetOsc.frequency.cancelScheduledValues(t);
  audioFX.jetOsc.frequency.linearRampToValueAtTime(wobble, t + 0.05);
}

function stopJetpackSound() {
  if (!audioFX.ctx || !audioFX.jetOsc) return;

  const osc = audioFX.jetOsc;
  const gain = audioFX.jetGain;
  const t = audioFX.ctx.currentTime;

  gain.gain.cancelScheduledValues(t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

  osc.stop(t + 0.06);

  audioFX.jetOsc = null;
  audioFX.jetGain = null;
}
