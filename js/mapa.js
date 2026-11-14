/*
  ARES NAV · NASA Space Apps Challenge 2026
  Este archivo se escribió con ayuda de IA (Claude, de Anthropic).

  mapa.js: el centro de control (mapa, marcadores y astronautas).
*/

// Se llena en los bloques 5, 6 y 7.

// =========================================================
// BLOQUE 6 · PONER Y EDITAR MARCADORES
// =========================================================

// 6.1 Conecta los botones + Interés / + Alerta y el clic sobre el mapa.
// Se llama una sola vez, desde iniciar().
function prepararMapa() {
  document.getElementById('boton-interes').addEventListener('click', function () {
    elegirModoMarcador('interes');
  });
  document.getElementById('boton-alerta').addEventListener('click', function () {
    elegirModoMarcador('alerta');
  });
  document.getElementById('mapa').addEventListener('click', alHacerClicEnElMapa);
}

// 6.2 Enciende o apaga un modo. Si pulsas el botón que ya estaba encendido, se apaga.
function elegirModoMarcador(tipo) {
  if (estado.modoMarcador === tipo) {
    estado.modoMarcador = null;
  } else {
    estado.modoMarcador = tipo;
  }
  dibujar();
}

// 6.2 Pone la barra de herramientas igual que dice estado.modoMarcador
function dibujarBarraHerramientas() {
  const modo = estado.modoMarcador;

  // Botón encendido: el del modo elegido
  document.getElementById('boton-interes').classList.toggle('encendido', modo === 'interes');
  document.getElementById('boton-alerta').classList.toggle('encendido', modo === 'alerta');

  // Cursor en cruz sobre el mapa mientras haya un modo elegido
  document.getElementById('mapa').classList.toggle('modo-poner', modo !== null);

  // Texto de ayuda según el modo
  const ayuda = document.getElementById('texto-ayuda');
  if (modo === 'interes') {
    ayuda.textContent = 'Haz clic en el mapa para poner el punto. Para cancelar, pulsa otra vez el botón.';
  } else if (modo === 'alerta') {
    ayuda.textContent = 'Haz clic en el mapa para poner la alerta. Para cancelar, pulsa otra vez el botón.';
  } else {
    ayuda.textContent = 'Elige + Interés o + Alerta y haz clic en el mapa';
  }
}

// 6.3 Al hacer clic en el mapa: pasar la posición del clic de píxeles a porcentaje
function alHacerClicEnElMapa(evento) {
  // Si no hay ningún modo elegido, el clic no hace nada
  if (estado.modoMarcador === null) return;

  // getBoundingClientRect() dice dónde está el mapa en la pantalla y cuánto mide.
  // Usamos siempre el #mapa (y no evento.target) porque el clic puede caer
  // encima de un marcador, que es mucho más pequeño que el mapa.
  const caja = document.getElementById('mapa').getBoundingClientRect();

  // evento.clientX / clientY: dónde se hizo clic, en píxeles desde la esquina de la ventana.
  // Restando la esquina del mapa sabemos los píxeles DENTRO del mapa,
  // y dividiendo por su tamaño (× 100) lo pasamos a porcentaje.
  const x = (evento.clientX - caja.left) / caja.width * 100;
  const y = (evento.clientY - caja.top) / caja.height * 100;

  // Redondeamos a 1 decimal para que los números queden cortos (ej.: 37.4)
  agregarMarcador(estado.modoMarcador, Math.round(x * 10) / 10, Math.round(y * 10) / 10);

  // Después de poner el marcador apagamos el modo, para no poner otro sin querer
  estado.modoMarcador = null;
  dibujar();
}

// 6.4 Crea un marcador nuevo y lo guarda en estado.marcadores
function agregarMarcador(tipo, x, y) {
  // Id nuevo: 'm' + el número siguiente (y sumamos 1 para el próximo)
  const id = 'm' + estado.siguienteId;
  estado.siguienteId = estado.siguienteId + 1;

  // Las alertas toman el nombre del menú; los puntos de interés, un nombre provisional
  let nombre;
  if (tipo === 'alerta') {
    nombre = document.getElementById('tipo-alerta').value;
  } else {
    const cuantos = estado.marcadores.filter(m => m.tipo === 'interes').length;
    nombre = 'Punto de interés ' + (cuantos + 1);
  }

  const marcador = { id: id, tipo: tipo, nombre: nombre, x: x, y: y, atendida: false };
  estado.marcadores.push(marcador);
  return marcador;
}

// 6.5 Número de prioridad: cuanto más pequeño, más arriba en la lista.
//   0 = alerta sin atender (PRIORIDAD MÁXIMA)
//   1 = punto de interés
//   2 = alerta ya atendida
function prioridadDe(marcador) {
  if (marcador.tipo === 'alerta' && !marcador.atendida) return 0;
  if (marcador.tipo === 'interes') return 1;
  return 2;
}

// 6.5 Devuelve los marcadores ordenados por prioridad.
// slice() hace una copia: así ordenamos la copia y no cambiamos estado.marcadores.
// sort() compara de dos en dos: si la resta es negativa, "a" va antes que "b".
function marcadoresOrdenados() {
  return estado.marcadores.slice().sort(function (a, b) {
    return prioridadDe(a) - prioridadDe(b);
  });
}

// 6.5 Dibuja la lista "Marcadores" del panel derecho
function dibujarListaMarcadores() {
  const lista = document.getElementById('lista-marcadores');

  if (estado.marcadores.length === 0) {
    lista.innerHTML = '<p class="vacio">No hay marcadores. Usa + Interés o + Alerta.</p>';
    return;
  }

  let html = '';
  for (const marcador of marcadoresOrdenados()) {
    const prioridad = prioridadDe(marcador);

    // Clase de la fila, símbolo y texto pequeño de debajo del nombre
    let clase = 'fila';
    let simbolo = '◆';
    let detalle = 'Punto de interés';
    if (prioridad === 0) {
      clase = 'fila urgente';
      simbolo = '⚠';
      detalle = 'PRIORIDAD MÁXIMA';
    } else if (prioridad === 2) {
      clase = 'fila atendida';
      simbolo = '⚠';
      detalle = 'Alerta atendida ✓';
    }

    // onclick="..." llama a la función con el id de ESTE marcador
    html += `
      <div class="${clase}">
        <span class="simbolo ${marcador.tipo}">${simbolo}</span>
        <div class="fila-texto">
          <div class="fila-nombre">${textoSeguro(marcador.nombre)}</div>
          <div class="fila-detalle">${detalle}</div>
        </div>
        <button class="boton-mini" title="Renombrar" onclick="renombrarMarcador('${marcador.id}')">✎</button>
        <button class="boton-mini" title="Borrar" onclick="borrarMarcador('${marcador.id}')">✕</button>
      </div>`;
  }
  lista.innerHTML = html;
}

// 6.6 Cambia el nombre de un marcador con una ventanita prompt()
function renombrarMarcador(id) {
  const marcador = buscarMarcador(id);
  if (!marcador) return;

  // prompt() devuelve el texto escrito, o null si se pulsa Cancelar
  const nuevoNombre = prompt('Nuevo nombre del marcador:', marcador.nombre);
  if (nuevoNombre === null) return;

  // trim() quita los espacios de los lados. Si queda vacío, no cambiamos nada.
  const limpio = nuevoNombre.trim();
  if (limpio === '') return;

  marcador.nombre = limpio.slice(0, 40);   // máximo 40 letras, para que quepa en el mapa
  dibujar();
}

// 6.6 Borra un marcador. filter() crea una lista nueva SIN el marcador de ese id.
function borrarMarcador(id) {
  estado.marcadores = estado.marcadores.filter(m => m.id !== id);

  // Si algún astronauta iba hacia ese marcador, se queda sin destino (bloque 7)
  for (const astronauta of estado.astronautas) {
    if (astronauta.destinoId === id) {
      astronauta.destinoId = null;
    }
  }
  dibujar();
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
  dibujarBarraHerramientas();   // bloque 6
  dibujarListaMarcadores();     // bloque 6
  dibujarInfoMapa();
  // Más adelante se añaden aquí: dibujarListaAstronautas() y dibujarRutas() (bloque 7)
  // y dibujarListaConectados() (bloque 11).
}
