(function () {
  const files = [
    'settings.js',
    'audio.js',
    'backend.js',
    'ui.js',
    'gameplay.js'
  ];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('No se pudo cargar ' + src));
      document.head.appendChild(s);
    });
  }

  (async () => {
    for (const f of files) {
      await loadScript(f);
    }
  })().catch(err => {
    console.error(err);
    alert('Error cargando módulos del juego: ' + err.message);
  });
})();
