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
