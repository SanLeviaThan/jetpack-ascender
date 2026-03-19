const SB_URL = 'https://moisurvmpoitmjgnzfew.supabase.co';
const SB_KEY = 'sb_publishable_sL2-HhknaCajZlsp1iFoJg_svcXZkJI';

let jugadorNombre = '';
let jugadorMejor = 0;
let gameInstance = null;

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

function sfxRanking() {
  if (!audioFX.ctx) return;
  const t = audioFX.ctx.currentTime;
  beep(784, 0.08, 'triangle', 0.035, t);
  beep(988, 0.08, 'triangle', 0.04, t + 0.08);
  beep(1174, 0.14, 'triangle', 0.045, t + 0.16);
}

function sfxLayerShift() {
  if (!audioFX.ctx) return;
  const t = audioFX.ctx.currentTime;
  beep(460, 0.08, 'triangle', 0.03, t);
  beep(690, 0.10, 'triangle', 0.04, t + 0.05);
  beep(920, 0.12, 'sine', 0.04, t + 0.12);
}

function sfxChest() {
  if (!audioFX.ctx) return;
  const t = audioFX.ctx.currentTime;
  beep(520, 0.08, 'square', 0.03, t);
  beep(780, 0.09, 'triangle', 0.04, t + 0.05);
  beep(1040, 0.15, 'sine', 0.05, t + 0.12);
}

function sfxPowerup() {
  if (!audioFX.ctx) return;
  const t = audioFX.ctx.currentTime;
  beep(660, 0.07, 'triangle', 0.03, t);
  beep(880, 0.07, 'triangle', 0.035, t + 0.05);
  beep(1175, 0.10, 'triangle', 0.04, t + 0.10);
  beep(1568, 0.18, 'sine', 0.045, t + 0.16);
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

function getGuardado() {
  try { return localStorage.getItem('jetpack_nombre') || ''; }
  catch (e) { return ''; }
}

function setGuardado(n) {
  try { localStorage.setItem('jetpack_nombre', n); }
  catch (e) { }
}

function normalizarNombre(nombre) {
  return nombre.replace(/\s+/g, ' ').trim();
}

function nombreValido(nombre) {
  return /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ_ ]{3,12}$/.test(nombre);
}

async function guardarScore(nombre, metros) {
  try {
    const r = await fetch(
      SB_URL + '/rest/v1/ranking?select=id,metros&nombre=eq.' + encodeURIComponent(nombre) + '&limit=1',
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY } }
    );
    const data = await r.json();

    if (Array.isArray(data) && data.length > 0) {
      if (metros > Number(data[0].metros || 0)) {
        await fetch(
          SB_URL + '/rest/v1/ranking?id=eq.' + data[0].id,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SB_KEY,
              'Authorization': 'Bearer ' + SB_KEY
            },
            body: JSON.stringify({ metros })
          }
        );
      }
    } else {
      await fetch(
        SB_URL + '/rest/v1/ranking',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SB_KEY,
            'Authorization': 'Bearer ' + SB_KEY
          },
          body: JSON.stringify({ nombre, metros })
        }
      );
    }
  } catch (e) { }
}

async function obtenerRanking() {
  const r = await fetch(
    SB_URL + '/rest/v1/ranking?select=nombre,metros&order=metros.desc&limit=10',
    { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY } }
  );
  return await r.json();
}

async function obtenerRecord(nombre) {
  try {
    const r = await fetch(
      SB_URL + '/rest/v1/ranking?select=metros&nombre=eq.' + encodeURIComponent(nombre) + '&limit=1',
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY } }
    );
    const d = await r.json();
    return (Array.isArray(d) && d.length > 0) ? (Number(d[0].metros) || 0) : 0;
  } catch (e) {
    return 0;
  }
}

async function existeNombre(nombre) {
  try {
    const r = await fetch(
      SB_URL + '/rest/v1/ranking?select=id&nombre=eq.' + encodeURIComponent(nombre) + '&limit=1',
      { headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY } }
    );
    const d = await r.json();
    return Array.isArray(d) && d.length > 0;
  } catch (e) {
    return false;
  }
}

function renderRanking(datos, olId, clases) {
  const ol = document.getElementById(olId);
  if (!ol) return;

  ol.innerHTML = '';

  if (!Array.isArray(datos) || datos.length === 0) {
    const li = document.createElement('li');
    li.style.color = '#1e2e44';
    li.textContent = 'Sin registros';
    ol.appendChild(li);
    return;
  }

  const medal = ['1°', '2°', '3°'];
  const cls = clases || ['r1', 'r2', 'r3'];

  datos.forEach((d, i) => {
    const li = document.createElement('li');
    if (cls[i]) li.className = cls[i];

    const pref = document.createTextNode(
      (medal[i] || ((i + 1) + '.')) + ' ' + (d.nombre || '') + ' — '
    );
    const span = document.createElement('span');
    span.textContent = (Number(d.metros) || 0).toLocaleString('es-AR') + ' m';

    li.appendChild(pref);
    li.appendChild(span);
    ol.appendChild(li);
  });
}

document.getElementById('btn-ver-ranking').addEventListener('click', async function () {
  initAudio();
  sfxRanking();
  const ol = document.getElementById('ranking-ol');
  ol.innerHTML = '<li style="color:#1e2e44">Cargando...</li>';
  document.getElementById('panel-ranking').style.display = 'flex';

  try {
    const d = await obtenerRanking();
    renderRanking(d, 'ranking-ol');
  } catch (e) {
    ol.innerHTML = '<li style="color:#1e2e44">Sin conexión</li>';
  }
});

document.getElementById('btn-cerrar-ranking').addEventListener('click', function () {
  document.getElementById('panel-ranking').style.display = 'none';
});

const _g = getGuardado();
if (_g) document.getElementById('inicio-input').value = _g;
document.addEventListener('pointerdown', initAudio, { once: true });
document.addEventListener('keydown', initAudio, { once: true });
setTimeout(() => {
  if (audioFX.unlocked) startMenuMusic();
}, 100);

document.getElementById('inicio-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('inicio-btn').click();
});

document.getElementById('inicio-btn').addEventListener('click', async function () {
  const input = document.getElementById('inicio-input');
  const nombre = normalizarNombre(input.value);
  const guardado = getGuardado();

  input.value = nombre;

  if (!nombre) {
    input.focus();
    return;
  }

  if (!nombreValido(nombre)) {
    alert('El nombre debe tener entre 3 y 12 caracteres. Solo letras, números, espacios y guion bajo.');
    input.focus();
    input.select();
    return;
  }

  if (guardado && nombre.toLowerCase() === guardado.toLowerCase()) {
    jugadorNombre = guardado;
    jugadorMejor = await obtenerRecord(guardado);
    initAudio();
    stopMenuMusic();
    document.getElementById('panel-inicio').style.display = 'none';
    arrancarJuego();
    return;
  }

  if (guardado && nombre.toLowerCase() !== guardado.toLowerCase()) {
    alert('Este dispositivo ya tiene el jugador: ' + guardado);
    input.value = guardado;
    input.focus();
    return;
  }

  const existe = await existeNombre(nombre);
  if (existe) {
    alert('Ese nombre ya está en uso. Elegí otro.');
    input.focus();
    input.select();
    return;
  }

  setGuardado(nombre);
  jugadorNombre = nombre;
  jugadorMejor = await obtenerRecord(nombre);
  initAudio();
  stopMenuMusic();
  document.getElementById('panel-inicio').style.display = 'none';
  arrancarJuego();
});

function mostrarMenu() {
  initAudio();
  startMenuMusic();
  stopJetpackSound();
  document.getElementById('hud').style.display = 'none';
  document.getElementById('panel-gameover').style.display = 'none';
  document.getElementById('panel-inicio').style.display = 'flex';
  document.getElementById('inicio-input').value = jugadorNombre;

  if (gameInstance) {
    gameInstance.input.keyboard.enabled = false;
    gameInstance.scene.stop('GameScene');
  }
}

async function mostrarGameOver(metros) {
  document.getElementById('hud').style.display = 'none';
  if (gameInstance) gameInstance.input.keyboard.enabled = false;

  document.getElementById('go-metros').textContent = metros.toLocaleString('es-AR') + ' m';
  document.getElementById('go-ranking').innerHTML = '<li style="color:#1e2e44">Cargando...</li>';

  let msg = '';
  if (metros > jugadorMejor) {
    jugadorMejor = metros;
    await guardarScore(jugadorNombre, metros);
    msg = '★  NUEVO RÉCORD PERSONAL  ★';
  } else {
    msg = 'TU RÉCORD ES ' + jugadorMejor.toLocaleString('es-AR') + ' m';
  }

  document.getElementById('go-msg').textContent = msg;
  document.getElementById('panel-gameover').style.display = 'flex';

  obtenerRanking().then(d => renderRanking(d, 'go-ranking')).catch(() => { });

  document.getElementById('go-reiniciar').onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('panel-gameover').style.display = 'none';

    if (gameInstance) {
      gameInstance.input.keyboard.enabled = true;
      gameInstance.scene.start('GameScene');
    }
  };

  document.getElementById('go-menu').onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();
    mostrarMenu();
  };
}

function arrancarJuego() {
  if (gameInstance) {
    gameInstance.input.keyboard.enabled = true;
    gameInstance.scene.start('GameScene');
    return;
  }

  const W = 480, H = 640;
  const WALL = 14;

  const CAPAS = [
    {
      nombre: 'ATMÓSFERA',
      desde: 0,
      hasta: 12000,
      bg: 0x04041a,
      platColor: 0x1133cc,
      glow: 0x3355ff,
      enemyColor: 0xff3333,
      enemySize: 22,
      move: 'horizontal',
      speed: 62,
      enemyDensity: 1,
      jetPower: 395,
      fuelUse: 0.52,
      fuelRegen: 0.17,
      fuelPickup: 36
    },
    {
      nombre: 'ESTRATÓSFERA',
      desde: 12000,
      hasta: 50000,
      bg: 0x0d0420,
      platColor: 0x6611bb,
      glow: 0xaa33ff,
      enemyColor: 0xff9933,
      enemySize: 24,
      move: 'vertical',
      speed: 72,
      enemyDensity: 1,
      jetPower: 390,
      fuelUse: 0.56,
      fuelRegen: 0.15,
      fuelPickup: 34
    },
    {
      nombre: 'MESÓSFERA',
      desde: 50000,
      hasta: 85000,
      bg: 0x041408,
      platColor: 0x117733,
      glow: 0x22ff66,
      enemyColor: 0xffff33,
      enemySize: 26,
      move: 'sine',
      speed: 84,
      enemyDensity: 1,
      jetPower: 385,
      fuelUse: 0.60,
      fuelRegen: 0.13,
      fuelPickup: 32
    },
    {
      nombre: 'TERMÓSFERA',
      desde: 85000,
      hasta: 150000,
      bg: 0x180404,
      platColor: 0xaa3300,
      glow: 0xff5500,
      enemyColor: 0x66e3ff,
      enemySize: 28,
      move: 'dash',
      speed: 98,
      enemyDensity: 2,
      jetPower: 378,
      fuelUse: 0.65,
      fuelRegen: 0.11,
      fuelPickup: 30
    },
    {
      nombre: 'EXÓSFERA',
      desde: 150000,
      hasta: 220000,
      bg: 0x041414,
      platColor: 0x007788,
      glow: 0x00ffee,
      enemyColor: 0xff66ff,
      enemySize: 30,
      move: 'circle',
      speed: 112,
      enemyDensity: 2,
      jetPower: 370,
      fuelUse: 0.70,
      fuelRegen: 0.09,
      fuelPickup: 28
    },
    {
      nombre: 'ESPACIO',
      desde: 220000,
      hasta: 999999,
      bg: 0x010108,
      platColor: 0x555555,
      glow: 0x999999,
      enemyColor: 0x888888,
      enemySize: 32,
      move: 'asteroid',
      speed: 132,
      enemyDensity: 0,
      jetPower: 365,
      fuelUse: 0.74,
      fuelRegen: 0.08,
      fuelPickup: 26
    }
  ];

  const ESCALA_METROS = 6;
  const POWERUP_INVUL_MS = 3000;
  const POWERUP_DSHOT_MS = 5000;

  const elMetros = document.getElementById('hud-metros');
  const elFuel = document.getElementById('hud-fuel');
  const elVida = document.getElementById('hud-vida');
  const elNivel = document.getElementById('hud-nivel');
  const elBar = document.getElementById('hud-bar');

  function getCapa(metrosReales) {
    for (let i = CAPAS.length - 1; i >= 0; i--) {
      if (metrosReales >= CAPAS[i].desde) return i;
    }
    return 0;
  }

  function dibujarJugador(scene, x, y) {
    const g = scene.add.graphics();
    g.fillStyle(0x00ffcc, 1); g.fillRoundedRect(-10, -16, 20, 28, 3);
    g.fillStyle(0x001a14, 1); g.fillRect(-5, -12, 10, 7);
    g.fillStyle(0x007755, 1); g.fillRect(7, -10, 7, 14);
    g.fillStyle(0x004433, 1); g.fillRect(8, 2, 5, 5);
    g.fillStyle(0x005533, 1); g.fillRect(-10, 10, 8, 6);
    g.fillRect(2, 10, 8, 6);
    g.x = x; g.y = y;
    return g;
  }

  function dibujarEnemigo(scene, x, y, capa) {
    const g = scene.add.graphics();

    if (capa.move === 'asteroid') {
      g.fillStyle(0x666666, 1);
      g.fillCircle(0, 0, 15);
      g.fillStyle(0x8f8f8f, 0.85);
      g.fillCircle(-4, -1, 5);
      g.fillCircle(5, 4, 3);
      g.fillStyle(0x333333, 1);
      g.fillCircle(2, -5, 3);
    } else {
      const r = Math.max(8, Math.floor(capa.enemySize / 2));

      g.fillStyle(capa.enemyColor, 1);
      g.fillCircle(0, 0, r);

      if (capa.move === 'vertical') {
        g.fillStyle(0xffffff, 0.18);
        g.fillCircle(0, -2, r - 4);
      } else if (capa.move === 'sine') {
        g.fillStyle(0xffffff, 0.22);
        g.fillTriangle(0, -r - 2, 6, -2, -6, -2);
      } else if (capa.move === 'dash') {
        g.fillStyle(0xffffff, 0.20);
        g.fillRect(-r + 3, -2, (r - 3) * 2, 4);
      } else if (capa.move === 'circle') {
        g.lineStyle(2, 0xffffff, 0.45);
        g.strokeCircle(0, 0, r + 4);
      }

      g.fillStyle(0x111111, 1);
      g.fillCircle(-4, -2, 2);
      g.fillCircle(4, -2, 2);
      g.fillStyle(0xffffff, 0.7);
      g.fillRect(-3, 4, 6, 2);
    }

    g.x = x;
    g.y = y;
    return g;
  }

  function dibujarPlataforma(scene, x, y, w, color, glow, rot) {
    const g = scene.add.graphics();
    g.fillStyle(glow, 0.12); g.fillRect(-w / 2 - 2, -2, w + 4, 14);
    g.fillStyle(color, 1); g.fillRect(-w / 2, 0, w, 8);
    g.fillStyle(glow, 0.9); g.fillRect(-w / 2, 0, w, 2);
    g.fillStyle(0xffffff, 0.25); g.fillRect(-w / 2 + 4, 0, 8, 1);
    g.x = x; g.y = y; g.rotation = rot || 0;
    return g;
  }

  function dibujarPickup(scene, x, y) {
    const g = scene.add.graphics();
    g.fillStyle(0x00ff88, 0.35); g.fillCircle(0, 0, 11);
    g.fillStyle(0x00ff88, 1); g.fillTriangle(0, -10, 9, 5, -9, 5);
    g.fillStyle(0xffffff, 0.9); g.fillRect(-1, -8, 2, 10);
    g.fillRect(-4, -2, 8, 2);
    g.x = x; g.y = y;
    return g;
  }

  function dibujarCorazon(scene, x, y) {
    const g = scene.add.graphics();
    g.fillStyle(0xff3366, 0.28);
    g.fillCircle(-6, -4, 8);
    g.fillCircle(6, -4, 8);
    g.fillTriangle(-14, 0, 14, 0, 0, 16);

    g.fillStyle(0xff5577, 1);
    g.fillCircle(-5, -3, 6);
    g.fillCircle(5, -3, 6);
    g.fillTriangle(-11, 1, 11, 1, 0, 13);

    g.fillStyle(0xffffff, 0.35);
    g.fillCircle(-7, -5, 2);

    g.x = x;
    g.y = y;
    return g;
  }

  function dibujarCofre(scene, x, y) {
    const g = scene.add.graphics();

    g.fillStyle(0xffdd55, 0.18);
    g.fillCircle(0, 0, 20);

    g.fillStyle(0xb06b12, 1);
    g.fillRoundedRect(-14, -8, 28, 20, 4);

    g.fillStyle(0xe3a42a, 1);
    g.fillRoundedRect(-14, -12, 28, 12, 6);

    g.fillStyle(0x6b3a00, 1);
    g.fillRect(-3, -12, 6, 24);

    g.fillStyle(0xfff2a8, 1);
    g.fillRect(-2, -2, 4, 6);

    g.lineStyle(2, 0xffe680, 0.9);
    g.strokeRoundedRect(-14, -8, 28, 20, 4);
    g.strokeRoundedRect(-14, -12, 28, 12, 6);

    g.x = x;
    g.y = y;
    return g;
  }

  class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    create() {
      document.getElementById('hud').style.display = 'block';
      this.cameras.main.setBackgroundColor(CAPAS[0].bg);

      const bg = this.add.graphics().setScrollFactor(0.04);
      for (let i = 0; i < 90; i++) {
        const x = Phaser.Math.Between(0, W);
        const y = Phaser.Math.Between(-6000, H);
        const s = Math.random() * 1.4 + 0.2;
        const a = 0.15 + Math.random() * 0.5;
        bg.fillStyle([0xffffff, 0xaaaaff, 0x88ccff][Math.floor(Math.random() * 3)], a);
        bg.fillRect(x, y, s, s);
      }

      this.wallGfx = this.add.graphics();
      this.playerGfx = dibujarJugador(this, W / 2, H - 60);
      this.player = this.add.rectangle(W / 2, H - 60, 20, 30, 0x000000, 0);
      this.physics.add.existing(this.player);
      this.player.body.setCollideWorldBounds(false);

      this.llamaGfx = this.add.graphics();

      const sueloGfx = this.add.graphics();
      sueloGfx.fillStyle(0x223344, 1);
      sueloGfx.fillRect(0, H - 16, W, 16);
      sueloGfx.fillStyle(0x00ffcc, 0.3);
      sueloGfx.fillRect(0, H - 16, W, 2);

      const suelo = this.add.rectangle(W / 2, H - 8, W, 16, 0x000000, 0);
      this.physics.add.existing(suelo, true);
      this.physics.add.collider(this.player, suelo);

      this.transitionOverlay = this.add.rectangle(W / 2, H / 2, W, H, 0xffffff, 0)
        .setScrollFactor(0)
        .setDepth(900);

      this.transitionText = this.add.text(W / 2, H / 2 - 10, '', {
        fontFamily: 'Orbitron',
        fontSize: '26px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
      })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(901)
        .setAlpha(0);

      this.powerText = this.add.text(W / 2, 120, '', {
        fontFamily: 'Orbitron',
        fontSize: '18px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
      })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(902)
        .setAlpha(0);

      this.fuel = 100;
      this.maxFuel = 100;
      this.metrosJuego = 0;
      this.metrosReales = 0;
      this.vivo = true;
      this.nivelActual = 0;
      this.alturaBase = this.player.y;
      this.ultimaGenY = H - 16;
      this.vida = 3;
      this.iFrames = 0;
      this.shootCD = 0;

      this.invulnerableUntil = 0;
      this.doubleShotUntil = 0;

      this.plats = [];
      this.platGfx = [];
      this.enems = [];
      this.enemGfx = [];
      this.pickups = [];
      this.pickGfx = [];
      this.heartItems = [];
      this.heartGfx = [];
      this.chests = [];
      this.chestGfx = [];
      this.heartSpawned = {};
      this.nextChestAt = 6000;
      this.balas = [];
      this.balaGfx = [];

      this.generarChunk(H - 16, H - 820);

      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

      this.cameras.main.startFollow(this.player, true, 1, 0.09);
    }

    showPowerText(msg, tint) {
      this.powerText.setText(msg);
      this.powerText.setColor(tint || '#ffffff');
      this.powerText.setAlpha(1);
      this.powerText.setScale(0.82);
      this.powerText.y = 120;

      this.tweens.killTweensOf(this.powerText);
      this.tweens.add({
        targets: this.powerText,
        alpha: 0,
        y: 82,
        scale: 1.05,
        duration: 1100,
        ease: 'Sine.easeOut'
      });
    }

    playLayerTransition(capaIndex) {
      const capa = CAPAS[capaIndex];
      const color = Phaser.Display.Color.IntegerToColor(capa.glow);

      this.transitionOverlay.fillColor = capa.bg;
      this.transitionOverlay.alpha = 0;
      this.transitionText.setText(capa.nombre);
      this.transitionText.alpha = 0;
      this.transitionText.setScale(0.86);

      this.tweens.add({
        targets: this.transitionOverlay,
        alpha: 0.22,
        duration: 220,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });

      this.tweens.add({
        targets: this.transitionText,
        alpha: 1,
        scale: 1,
        duration: 260,
        ease: 'Back.Out',
        yoyo: false
      });

      this.tweens.add({
        targets: this.transitionText,
        alpha: 0,
        delay: 650,
        duration: 340,
        ease: 'Sine.easeOut'
      });

      this.cameras.main.flash(220, color.red, color.green, color.blue, false);
      sfxLayerShift();
    }

    spawnChest(y) {
      const x = Phaser.Math.Between(WALL + 46, W - WALL - 46);
      const chest = this.add.rectangle(x, y, 28, 24, 0x000000, 0);
      this.physics.add.existing(chest);
      chest.body.setAllowGravity(false);
      chest.body.setVelocityX(Phaser.Math.Between(75, 110) * (Math.random() > 0.5 ? 1 : -1));
      chest.moveSpeed = Math.abs(chest.body.velocity.x);

      const cg = dibujarCofre(this, x, y);
      this.chests.push(chest);
      this.chestGfx.push(cg);

      this.tweens.add({
        targets: cg,
        y: '+=8',
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    aplicarPowerup() {
      const opciones = [];

      if (this.fuel < 85) opciones.push('fuel');
      if (this.vida < 4) opciones.push('vida');
      opciones.push('invul');
      opciones.push('dshot');

      const premio = Phaser.Utils.Array.GetRandom(opciones);
      const ahora = this.time.now;

      if (premio === 'fuel') {
        this.fuel = Math.min(this.maxFuel, this.fuel + 55);
        this.showPowerText('POWER UP: FUEL MAX', '#66ffcc');
      } else if (premio === 'vida') {
        this.vida = Math.min(4, this.vida + 1);
        this.showPowerText('POWER UP: VIDA +1', '#ff7799');
      } else if (premio === 'invul') {
        this.invulnerableUntil = Math.max(this.invulnerableUntil, ahora + POWERUP_INVUL_MS);
        this.iFrames = Math.max(this.iFrames, Math.ceil(POWERUP_INVUL_MS / 16));
        this.showPowerText('POWER UP: INVULNERABLE', '#ffee66');
      } else if (premio === 'dshot') {
        this.doubleShotUntil = Math.max(this.doubleShotUntil, ahora + POWERUP_DSHOT_MS);
        this.showPowerText('POWER UP: DISPARO DOBLE', '#66aaff');
      }

      sfxPowerup();
    }

    drawWalls() {
      const topY = this.cameras.main.scrollY - 200;
      this.wallGfx.clear();
      this.wallGfx.fillStyle(0x00ffcc, 0.08);
      this.wallGfx.fillRect(0, topY, WALL, 1200);
      this.wallGfx.fillRect(W - WALL, topY, WALL, 1200);
      this.wallGfx.fillStyle(0x00ffcc, 0.22);
      this.wallGfx.fillRect(WALL - 2, topY, 2, 1200);
      this.wallGfx.fillRect(W - WALL, topY, 2, 1200);
    }

    metrosDesdeY(y) {
      const metrosJuego = Math.max(0, Math.floor((this.alturaBase - y) / 8));
      return metrosJuego * ESCALA_METROS;
    }

    generarChunk(desdeY, hastaY) {
      for (let y = desdeY - 100; y > hastaY; y -= Phaser.Math.Between(96, 150)) {
        const metrosFila = this.metrosDesdeY(y);
        const capaIndex = getCapa(metrosFila);
        const capa = CAPAS[capaIndex];
        const enEspacio = capa.move === 'asteroid';

        if (!enEspacio) {
          const anchoMin = Math.max(58, 122 - capaIndex * 10);
          const anchoMax = Math.max(98, 160 - capaIndex * 12);
          const pw = Phaser.Math.Between(anchoMin, anchoMax);
          const px = Phaser.Math.Between(pw / 2 + WALL + 8, W - pw / 2 - WALL - 8);
          const rot = (capaIndex >= 2 && Math.random() < 0.25)
            ? Phaser.Math.FloatBetween(-0.12, 0.12)
            : 0;

          const pg = dibujarPlataforma(this, px, y, pw, capa.platColor, capa.glow, rot);
          const plat = this.add.rectangle(px, y + 4, pw, 8, 0x000000, 0);
          this.physics.add.existing(plat, true);
          this.physics.add.collider(this.player, plat);
          this.plats.push(plat);
          this.platGfx.push(pg);

          if (Phaser.Math.Between(0, 6) === 0) {
            const fx = Phaser.Math.Between(WALL + 20, W - WALL - 20);
            const fg = dibujarPickup(this, fx, y - 22);
            const fu = this.add.rectangle(fx, y - 22, 14, 14, 0x000000, 0);
            this.physics.add.existing(fu, true);
            this.pickups.push(fu);
            this.pickGfx.push(fg);
            this.tweens.add({
              targets: fg,
              y: '+=7',
              duration: 900,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
          }
        }

        if (!enEspacio && capaIndex < CAPAS.length - 1) {
          const cercaDelFinalDeCapa = metrosFila >= (capa.hasta - 7000);

          if (cercaDelFinalDeCapa && !this.heartSpawned[capaIndex]) {
            const hx = Phaser.Math.Between(WALL + 40, W - WALL - 40);
            const hy = y - 50;

            const hg = dibujarCorazon(this, hx, hy);
            const heart = this.add.rectangle(hx, hy, 22, 20, 0x000000, 0);
            this.physics.add.existing(heart);
            heart.body.setAllowGravity(false);
            heart.body.setVelocityX(Phaser.Math.Between(90, 140) * (Math.random() > 0.5 ? 1 : -1));
            heart.moveSpeed = Math.abs(heart.body.velocity.x);

            this.heartItems.push(heart);
            this.heartGfx.push(hg);
            this.heartSpawned[capaIndex] = true;

            this.tweens.add({
              targets: hg,
              y: '+=8',
              duration: 700,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
          }
        }

        const enemyDensity = enEspacio ? 0 : capa.enemyDensity;

        for (let n = 0; n < enemyDensity; n++) {
          if (enEspacio) break;

          if (Math.random() < (n === 1 ? 0.65 : 1)) {
            const ex = Phaser.Math.Between(WALL + 24, W - WALL - 24);
            const ey = y - 28 - (n * 20);

            const eg = dibujarEnemigo(this, ex, ey, capa);
            const en = this.add.rectangle(ex, ey, capa.enemySize, capa.enemySize, 0x000000, 0);
            this.physics.add.existing(en);
            en.body.setAllowGravity(false);
            en.moveType = capa.move;
            en.enemySpeed = capa.speed + (n * 10);
            en.baseX = ex;
            en.baseY = ey;
            en.phase = Math.random() * Math.PI * 2;
            en.radius = Phaser.Math.Between(20, 35);
            en.dashCD = Phaser.Math.Between(30, 70);

            if (en.moveType === 'horizontal') {
              en.body.setVelocityX(en.enemySpeed * (Math.random() > 0.5 ? 1 : -1));
            } else if (en.moveType === 'vertical') {
              en.body.setVelocityY(en.enemySpeed * (Math.random() > 0.5 ? 1 : -1));
            } else if (en.moveType === 'sine') {
              en.body.setVelocity(0, 0);
            } else if (en.moveType === 'dash') {
              en.body.setVelocityX(en.enemySpeed * (Math.random() > 0.5 ? 1 : -1));
            } else if (en.moveType === 'circle') {
              en.body.setVelocity(0, 0);
              en.radius = Phaser.Math.Between(24, 42);
            }

            this.enems.push(en);
            this.enemGfx.push(eg);
          }
        }
      }

      const metrosCentroChunk = this.metrosDesdeY((desdeY + hastaY) / 2);
      const capaCentro = CAPAS[getCapa(metrosCentroChunk)];

     
      if (capaCentro.move === 'asteroid') {
        for (let i = 0; i < 5; i++) {
          const ex = Phaser.Math.Between(WALL + 20, W - WALL - 20);
          const ey = Phaser.Math.Between(hastaY, desdeY - 100);
          const eg = dibujarEnemigo(this, ex, ey, capaCentro);
          const en = this.add.rectangle(ex, ey, 30, 30, 0x000000, 0);
          this.physics.add.existing(en);
          en.body.setAllowGravity(false);
          en.body.setVelocity(
            Phaser.Math.Between(-90, 90),
            Phaser.Math.Between(90, 170)
          );
          en.moveType = 'asteroid';
          en.enemySpeed = capaCentro.speed;
          en.baseX = ex;
          en.baseY = ey;
          en.phase = Math.random() * Math.PI * 2;
          en.radius = Phaser.Math.Between(20, 35);
          en.dashCD = Phaser.Math.Between(30, 70);
          en.rotSpeed = Phaser.Math.FloatBetween(-0.05, 0.05);

          this.enems.push(en);
          this.enemGfx.push(eg);
        }
      }

      this.ultimaGenY = hastaY;
    }

    hit(a, b, mg) {
      mg = mg || 0;
      if (!a.active || !b.active) return false;
      return Math.abs(a.x - b.x) < (a.width + b.width) / 2 - mg &&
        Math.abs(a.y - b.y) < (a.height + b.height) / 2 - mg;
    }

    clampPlayer() {
      if (this.player.x < WALL + 10) {
        this.player.x = WALL + 10;
        if (this.player.body.velocity.x < 0) this.player.body.setVelocityX(0);
      }
      if (this.player.x > W - WALL - 10) {
        this.player.x = W - WALL - 10;
        if (this.player.body.velocity.x > 0) this.player.body.setVelocityX(0);
      }
    }

    createBullet(x, y, vx, vy) {
      const br = this.add.rectangle(x, y, 4, 12, 0x000000, 0);
      this.physics.add.existing(br);
      br.body.setVelocity(vx, vy);
      br.body.setAllowGravity(false);

      const bgfx = this.add.graphics();
      bgfx.fillStyle(0xffff00, 1);
      bgfx.fillRect(-2, -6, 4, 12);
      bgfx.fillStyle(0xffffff, 0.6);
      bgfx.fillRect(-1, -6, 2, 12);

      this.balas.push(br);
      this.balaGfx.push(bgfx);

      this.time.delayedCall(1500, () => {
        if (br && br.active) {
          br.destroy();
          bgfx.destroy();
        }
      });
    }

    updateEnemies() {
      const t = this.time.now * 0.001;

      for (let i = this.enems.length - 1; i >= 0; i--) {
        const e = this.enems[i];
        const g = this.enemGfx[i];

        if (!e || !e.active) {
          if (g) g.destroy();
          this.enems.splice(i, 1);
          this.enemGfx.splice(i, 1);
          continue;
        }

        if (g) {
          g.x = e.x;
          g.y = e.y;
        }

        if (e.moveType === 'horizontal') {
          if (e.x < WALL + 12) e.body.setVelocityX(Math.abs(e.body.velocity.x));
          if (e.x > W - WALL - 12) e.body.setVelocityX(-Math.abs(e.body.velocity.x));
        } else if (e.moveType === 'vertical') {
          if (e.y < this.cameras.main.scrollY - 10) e.body.setVelocityY(Math.abs(e.enemySpeed));
          if (e.y > this.cameras.main.scrollY + H - 30) e.body.setVelocityY(-Math.abs(e.enemySpeed));
        } else if (e.moveType === 'sine') {
          e.y += 0.8;
          e.x = e.baseX + Math.sin(t * 2.2 + e.phase) * 52;
        } else if (e.moveType === 'dash') {
          e.dashCD--;
          if (e.dashCD <= 0) {
            const dir = this.player.x < e.x ? -1 : 1;
            e.body.setVelocityX(dir * 180);
            e.dashCD = Phaser.Math.Between(30, 70);
          }
          if (e.x < WALL + 12) e.body.setVelocityX(Math.abs(e.body.velocity.x));
          if (e.x > W - WALL - 12) e.body.setVelocityX(-Math.abs(e.body.velocity.x));
        } else if (e.moveType === 'circle') {
          e.phase += 0.04;
          e.x = e.baseX + Math.cos(e.phase) * e.radius;
          e.y = e.baseY + Math.sin(e.phase) * e.radius;
        } else if (e.moveType === 'asteroid') {
          if (g) g.rotation += e.rotSpeed || 0.02;
          if (e.x < WALL + 12 || e.x > W - WALL - 12) e.body.setVelocityX(-e.body.velocity.x);
        }

        if (e.y > this.cameras.main.scrollY + H + 220) {
          e.destroy();
          if (g) g.destroy();
          this.enems.splice(i, 1);
          this.enemGfx.splice(i, 1);
          continue;
        }
      }
    }

    updateHUD() {
      const ahora = this.time.now;
      const extras = [];

      if (this.invulnerableUntil > ahora) extras.push('🛡');
      if (this.doubleShotUntil > ahora) extras.push('✦');

      elMetros.textContent = '⬆ ' + this.metrosReales.toLocaleString('es-AR') + ' m';
      elFuel.textContent = '⚡ Fuel: ' + Math.floor(this.fuel) + '%' + (extras.length ? '  ' + extras.join(' ') : '');
      elVida.textContent = '❤ Vida: ' + this.vida;
      elNivel.textContent = CAPAS[this.nivelActual].nombre;
      elBar.style.width = Math.max(0, Math.min(100, (this.fuel / this.maxFuel) * 100)) + 'px';
    }

    update() {
      if (!this.vivo) return;

      this.drawWalls();

      const ahora = this.time.now;
      const pb = this.player.body;
      const izq = this.cursors.left.isDown || this.keyA.isDown;
      const der = this.cursors.right.isDown || this.keyD.isDown;
      const arr = this.cursors.up.isDown || this.keyW.isDown;

      this.metrosJuego = Math.max(0, Math.floor((this.alturaBase - this.player.y) / 8));
      this.metrosReales = this.metrosJuego * ESCALA_METROS;

      const nuevaCapa = getCapa(this.metrosReales);
      const capaData = CAPAS[nuevaCapa];

      while (this.metrosReales >= this.nextChestAt) {
  if (capaData.move !== 'asteroid') {
    const chestY = this.cameras.main.scrollY + Phaser.Math.Between(90, 170);
    this.spawnChest(chestY);
  }
  this.nextChestAt += Phaser.Math.Between(14000, 18000);
}

      if (nuevaCapa !== this.nivelActual) {
        this.nivelActual = nuevaCapa;
        this.cameras.main.setBackgroundColor(CAPAS[this.nivelActual].bg);
        this.playLayerTransition(this.nivelActual);
      }

      pb.setVelocityX(izq ? -250 : der ? 250 : 0);

      this.clampPlayer();

      this.playerGfx.x = this.player.x;
      this.playerGfx.y = this.player.y;
      this.playerGfx.scaleX = izq ? -1 : 1;

      if (this.invulnerableUntil > ahora) {
        this.playerGfx.alpha = (Math.floor(ahora / 80) % 2 === 0) ? 0.5 : 1;
      }

      this.llamaGfx.clear();

      if (arr && this.fuel > 0) {
        startJetpackSound();
        updateJetpackSound();
        pb.setVelocityY(-capaData.jetPower);
        this.fuel = Math.max(0, this.fuel - capaData.fuelUse);

        this.llamaGfx.fillStyle(0xff6600, 0.9);
        this.llamaGfx.fillTriangle(
          this.player.x - 5, this.player.y + 16,
          this.player.x + 5, this.player.y + 16,
          this.player.x, this.player.y + 16 + Phaser.Math.Between(10, 22)
        );
        this.llamaGfx.fillStyle(0xffcc00, 0.6);
        this.llamaGfx.fillTriangle(
          this.player.x - 3, this.player.y + 16,
          this.player.x + 3, this.player.y + 16,
          this.player.x, this.player.y + 16 + Phaser.Math.Between(6, 14)
        );
      } else {
        stopJetpackSound();
        if (!arr) this.fuel = Math.min(this.maxFuel, this.fuel + capaData.fuelRegen);
      }

      for (let i = 0; i < this.pickups.length; i++) {
        const p = this.pickups[i];
        const pg = this.pickGfx[i];
        if (!p || !p.active || !pg) continue;
        pg.x = p.x;
      }

      for (let i = 0; i < this.chests.length; i++) {
        const c = this.chests[i];
        const cg = this.chestGfx[i];
        if (!c || !c.active || !cg) continue;
        cg.x = c.x;
      }

      for (let i = this.chests.length - 1; i >= 0; i--) {
        const c = this.chests[i];
        const cg = this.chestGfx[i];

        if (!c || !c.active) {
          if (cg) cg.destroy();
          this.chests.splice(i, 1);
          this.chestGfx.splice(i, 1);
          continue;
        }

        if (c.x < WALL + 18) {
          c.body.setVelocityX(Math.abs(c.moveSpeed || 90));
        }
        if (c.x > W - WALL - 18) {
          c.body.setVelocityX(-Math.abs(c.moveSpeed || 90));
        }

        if (this.hit(this.player, c, 2)) {
          const fx = this.add.graphics();
          fx.fillStyle(0xffdd66, 0.7);
          fx.fillCircle(c.x, c.y, 22);
          this.tweens.add({
            targets: fx,
            alpha: 0,
            scaleX: 2.2,
            scaleY: 2.2,
            duration: 320,
            onComplete: () => fx.destroy()
          });

          sfxChest();
          this.aplicarPowerup();

          c.destroy();
          if (cg) cg.destroy();
          this.chests.splice(i, 1);
          this.chestGfx.splice(i, 1);
        }
      }

      for (let i = this.heartItems.length - 1; i >= 0; i--) {
        const h = this.heartItems[i];
        const hg = this.heartGfx[i];

        if (!h || !h.active) {
          if (hg) hg.destroy();
          this.heartItems.splice(i, 1);
          this.heartGfx.splice(i, 1);
          continue;
        }

        if (hg) {
          hg.x = h.x;
        }

        if (h.x < WALL + 14) {
          h.body.setVelocityX(Math.abs(h.moveSpeed || 100));
        }
        if (h.x > W - WALL - 14) {
          h.body.setVelocityX(-Math.abs(h.moveSpeed || 100));
        }

        if (this.hit(this.player, h, 2)) {
          const fx = this.add.graphics();
          fx.fillStyle(0xff6699, 0.6);
          fx.fillCircle(h.x, h.y, 18);
          this.tweens.add({
            targets: fx,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 260,
            onComplete: () => fx.destroy()
          });

          h.destroy();
          if (hg) hg.destroy();
          this.heartItems.splice(i, 1);
          this.heartGfx.splice(i, 1);

          this.vida = Math.min(4, this.vida + 1);
          sfxHeart();
        }
      }

      this.shootCD--;
      if (this.keyX.isDown && this.shootCD <= 0) {
        sfxShoot();
        this.shootCD = (this.doubleShotUntil > ahora) ? 13 : 16;

        this.createBullet(this.player.x, this.player.y - 28, 0, -680);

        if (this.doubleShotUntil > ahora) {
          this.createBullet(this.player.x - 10, this.player.y - 24, -90, -650);
          this.createBullet(this.player.x + 10, this.player.y - 24, 90, -650);
        }
      }

      for (let i = 0; i < this.balas.length; i++) {
        const b = this.balas[i];
        const bgfx = this.balaGfx[i];
        if (!b || !b.active || !bgfx) continue;
        bgfx.x = b.x;
        bgfx.y = b.y;
      }

      for (let i = this.balas.length - 1; i >= 0; i--) {
        const b = this.balas[i];
        if (!b || !b.active) {
          if (this.balaGfx[i]) this.balaGfx[i].destroy();
          this.balas.splice(i, 1);
          this.balaGfx.splice(i, 1);
          continue;
        }

        let balaDestruida = false;

        for (let p = this.plats.length - 1; p >= 0; p--) {
          const plat = this.plats[p];
          if (!plat || !plat.active) continue;

          if (this.hit(b, plat, 2)) {
            const spark = this.add.graphics();
            spark.fillStyle(0x66ccff, 0.75);
            spark.fillCircle(b.x, b.y, 6);
            this.tweens.add({
              targets: spark,
              alpha: 0,
              scaleX: 1.8,
              scaleY: 1.8,
              duration: 180,
              onComplete: () => spark.destroy()
            });

            b.destroy();
            if (this.balaGfx[i]) this.balaGfx[i].destroy();
            this.balas.splice(i, 1);
            this.balaGfx.splice(i, 1);
            balaDestruida = true;
            break;
          }
        }

        if (balaDestruida) continue;

        for (let j = this.enems.length - 1; j >= 0; j--) {
          const e = this.enems[j];
          if (!e || !e.active) {
            if (this.enemGfx[j]) this.enemGfx[j].destroy();
            this.enems.splice(j, 1);
            this.enemGfx.splice(j, 1);
            continue;
          }

          if (this.hit(b, e)) {
            const ex = this.add.graphics();
            ex.fillStyle(0xff4400, 0.8);
            ex.fillCircle(e.x, e.y, 18);
            ex.fillStyle(0xffcc00, 0.6);
            ex.fillCircle(e.x, e.y, 10);
            this.tweens.add({
              targets: ex,
              alpha: 0,
              scaleX: 2,
              scaleY: 2,
              duration: 300,
              onComplete: () => ex.destroy()
            });

            b.destroy();
            if (this.balaGfx[i]) this.balaGfx[i].destroy();
            this.balas.splice(i, 1);
            this.balaGfx.splice(i, 1);

            e.destroy();
            if (this.enemGfx[j]) this.enemGfx[j].destroy();
            this.enems.splice(j, 1);
            this.enemGfx.splice(j, 1);
            break;
          }
        }
      }

      for (let i = this.heartItems.length - 1; i >= 0; i--) {
        const h = this.heartItems[i];
        const hg = this.heartGfx[i];

        if (!h || !h.active) {
          if (hg) hg.destroy();
          this.heartItems.splice(i, 1);
          this.heartGfx.splice(i, 1);
          continue;
        }

        if (h.y > this.cameras.main.scrollY + H + 120) {
          h.destroy();
          if (hg) hg.destroy();
          this.heartItems.splice(i, 1);
          this.heartGfx.splice(i, 1);
        }
      }

      for (let i = this.chests.length - 1; i >= 0; i--) {
        const c = this.chests[i];
        const cg = this.chestGfx[i];

        if (!c || !c.active) {
          if (cg) cg.destroy();
          this.chests.splice(i, 1);
          this.chestGfx.splice(i, 1);
          continue;
        }

        if (c.y > this.cameras.main.scrollY + H + 140) {
          c.destroy();
          if (cg) cg.destroy();
          this.chests.splice(i, 1);
          this.chestGfx.splice(i, 1);
        }
      }

      for (let i = this.pickups.length - 1; i >= 0; i--) {
        const p = this.pickups[i];
        const pg = this.pickGfx[i];

        if (!p || !p.active) {
          if (pg) pg.destroy();
          this.pickups.splice(i, 1);
          this.pickGfx.splice(i, 1);
          continue;
        }

        if (this.hit(this.player, p)) {
          const fl = this.add.graphics();
          fl.fillStyle(0x00ff88, 0.5);
          fl.fillCircle(p.x, p.y, 20);
          this.tweens.add({
            targets: fl,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 250,
            onComplete: () => fl.destroy()
          });

          p.destroy();
          if (pg) pg.destroy();
          this.pickups.splice(i, 1);
          this.pickGfx.splice(i, 1);
          this.fuel = Math.min(this.maxFuel, this.fuel + capaData.fuelPickup);
          sfxFuel();
        }
      }

      this.updateEnemies();

      if (this.invulnerableUntil <= ahora) {
        if (this.iFrames > 0) {
          this.iFrames--;
          this.playerGfx.alpha = this.iFrames % 8 < 4 ? 0.3 : 1;
        } else {
          this.playerGfx.alpha = 1;
          for (const e of this.enems) {
            if (!e || !e.active) continue;
            if (this.hit(this.player, e, 4)) {
              this.vida--;
              this.iFrames = 100;
              this.cameras.main.shake(200, 0.013);
              this.cameras.main.flash(120, 255, 60, 60, true);

              if (this.vida <= 0) {
                this.vivo = false;
                stopJetpackSound();
                sfxDeath();
                mostrarGameOver(this.metrosReales);
                return;
              }
              break;
            }
          }
        }
      }

      if (this.cameras.main.scrollY < this.ultimaGenY + 400) {
        this.generarChunk(this.ultimaGenY, this.ultimaGenY - 800);
      }

      if (this.player.y > this.cameras.main.scrollY + H + 100) {
        this.vivo = false;
        stopJetpackSound();
        sfxDeath();
        mostrarGameOver(this.metrosReales);
        return;
      }

      this.updateHUD();
    }
  }

  gameInstance = new Phaser.Game({
    type: Phaser.AUTO,
    width: W,
    height: H,
    backgroundColor: '#04041a',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 480 },
        debug: false
      }
    },
    scene: [GameScene]
  });
}
