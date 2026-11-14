/*
  ARES NAV · NASA Space Apps Challenge 2026
  Este archivo se escribió con ayuda de IA (Claude, de Anthropic).

  mapa.js: el centro de control (mapa, marcadores y astronautas).
*/

// Se llena en los bloques 5, 6 y 7.

// ----- Funciones vacías por ahora (truco del bloque 2.5) -----
// Existen solo para que iniciar() y dibujar() no den error.
// Cuando llegue su bloque, se escribe lo que va dentro.

// Bloque 6: conecta los botones + Interés / + Alerta y el clic sobre el mapa
function prepararMapa() {
}

// =========================================================
// BLOQUE 5 · EL MAPA EN PANTALLA
// =========================================================

// 5.6 Pinta marcadores, astronautas y dispositivos conectados dentro de "capa".
// La usamos para el mapa grande y, en el bloque 9, también para el minimapa.
// idResaltado: el id de algo que queremos destacar (o null si ninguno).
//
// Usamos "plantillas de texto" (las comillas `invertidas`):
// todo lo que va dentro de ${ ... } se cambia por su valor.
function pintarElementosDelMapa(capa, idResaltado) {
  let html = '';

  // ----- Marcadores: rombo (interés) o triángulo (alerta) -----
  for (const marcador of estado.marcadores) {
    let clases = 'en-mapa marcador ' + marcador.tipo;   // "... interes" o "... alerta"
    if (marcador.atendida) clases += ' atendida';
    if (marcador.id === idResaltado) clases += ' resaltado';

    html += `
      <div class="${clases}" style="left: ${marcador.x}%; top: ${marcador.y}%;">
        <span class="icono"></span>
        <span class="etiqueta">${textoSeguro(marcador.nombre)}</span>
      </div>`;
  }

  // ----- Astronautas: círculo con flecha que apunta a su rumbo -----
  for (const astronauta of estado.astronautas) {
    let clases = 'en-mapa astronauta';
    if (astronauta.id === idResaltado) clases += ' resaltado';

    html += `
      <div class="${clases}" style="left: ${astronauta.x}%; top: ${astronauta.y}%;">
        <span class="flecha" style="transform: rotate(${astronauta.rumbo}deg);"></span>
        <span class="icono"></span>
        <span class="etiqueta">${textoSeguro(astronauta.nombre)}</span>
      </div>`;
  }

  // ----- Dispositivos: solo los que ya están conectados (bloque 10) -----
  for (const dispositivo of estado.dispositivos) {
    if (!dispositivo.conectado) continue;   // continue = saltar al siguiente

    let clases = 'en-mapa dispositivo';
    if (dispositivo.id === idResaltado) clases += ' resaltado';

    html += `
      <div class="${clases}" style="left: ${dispositivo.x}%; top: ${dispositivo.y}%;">
        <span class="icono"></span>
        <span class="etiqueta">${textoSeguro(dispositivo.nombre)}</span>
      </div>`;
  }

  // Cambiamos todo el contenido de la capa de una sola vez
  capa.innerHTML = html;
}

// Muestra en el panel la información del mapa real (estado.infoMapa).
// Solo enseña los datos que estén rellenos.
function dibujarInfoMapa() {
  const info = estado.infoMapa;
  const caja = document.getElementById('info-mapa');

  // Si todavía no hay mapa real, avisamos
  if (info.nombre === '') {
    caja.innerHTML = '<p class="vacio">Pendiente: se rellena en el bloque 4 con el mapa real de NASA.</p>';
    return;
  }

  // Cada fila: [nombre del dato, valor]
  const filas = [
    ['Lugar', info.nombre],
    ['Misión', info.mision],
    ['Instrumento', info.instrumento],
    ['Fecha', info.fecha],
    ['Crédito', info.credito]
  ];

  let html = '<dl>';
  for (const fila of filas) {
    if (fila[1] !== '') {
      html += `<dt>${fila[0]}</dt><dd>${textoSeguro(fila[1])}</dd>`;
    }
  }
  if (info.enlace !== '') {
    // target="_blank" abre el enlace en otra pestaña
    html += `<dt>Fuente</dt><dd><a href="${textoSeguro(info.enlace)}" target="_blank" rel="noopener">Ver imagen original</a></dd>`;
  }
  html += '</dl>';

  if (info.descripcion !== '') {
    html += `<p>${textoSeguro(info.descripcion)}</p>`;
  }

  caja.innerHTML = html;
}

// 5.6 Dibuja todo el centro de control
function dibujarMapa() {
  pintarElementosDelMapa(document.getElementById('capa-mapa'), null);
  dibujarInfoMapa();
  // Más adelante se añaden aquí: dibujarBarraHerramientas() y dibujarListaMarcadores() (bloque 6),
  // dibujarListaAstronautas() y dibujarRutas() (bloque 7) y dibujarListaConectados() (bloque 11).
}
