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

function mostrarTransicionCapa(nombre) {
  const panel = document.getElementById('panel-capa');
  const titulo = document.getElementById('capa-titulo');

  if (!panel || !titulo) return;

  titulo.textContent = nombre;

  panel.classList.remove('activo');
  void panel.offsetWidth;
  panel.classList.add('activo');

  sfxLayer();

  if (capaOverlayTimer) clearTimeout(capaOverlayTimer);
  capaOverlayTimer = setTimeout(() => {
    panel.classList.remove('activo');
  }, 1200);
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
