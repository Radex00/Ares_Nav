/*
  ARES NAV · NASA Space Apps Challenge 2026
  Este archivo se escribió con ayuda de IA (Claude, de Anthropic).

  historia.js: la parte narrativa. Las notas que dejó la expedición anterior
  en bases abandonadas (los TEXTOS los escribe el equipo, en estado.js).

  Cómo funciona la cadena:
    1) Un astronauta llega a una base abierta → se lee su nota (ventana grande).
    2) La nota enseña el código de acceso de la base siguiente.
    3) Con ese código se abre la base bloqueada (🔒) desde la sección "Misión".
    4) La nota de la Base 2 desbloquea la descarga de la zona nueva.
    5) La nota de la Base 5 es el final: "MISIÓN COMPLETADA".
*/

// Todas las notas, de todas las zonas, en orden (Base 1, Base 2, ...)
function todasLasNotas() {
  return estado.marcadores.filter(m => m.tipo === 'nota');
}

// Se llama cuando un astronauta llega a una nota (desde moverAstronautas, en mapa.js).
// No llama a dibujar(): ya lo hace moverAstronautas cuando alguien llega.
function leerNota(marcador) {
  marcador.nota.leida = true;
  estado.notaAbierta = marcador.id;   // se abre la ventana con la nota

  // Si esta nota desbloquea la descarga de un mapa, lo desbloqueamos
  if (marcador.nota.desbloqueaMapa) {
    buscarDispositivo(marcador.nota.desbloqueaMapa).bloqueado = false;
  }
}

// Volver a abrir una nota ya leída (botón "Leer" o clic en el mapa)
function abrirNota(id) {
  estado.notaAbierta = id;
  dibujar();
}

function cerrarNota() {
  estado.notaAbierta = null;
  dibujar();
}

// Pide el código de una base bloqueada y, si es el bueno, la abre.
// toUpperCase() pasa todo a mayúsculas: así da igual escribir "hollow" o "HOLLOW".
function introducirCodigo(id) {
  const marcador = buscarMarcador(id);
  const escrito = prompt('Access code for ' + marcador.nombre + ':');
  if (escrito === null) return;   // pulsó Cancelar

  if (escrito.trim().toUpperCase() === marcador.nota.codigo.toUpperCase()) {
    marcador.nota.desbloqueada = true;
    dibujar();
  } else {
    alert('Wrong code. Look for it in the note of the previous base.');
  }
}

// Clic sobre una nota en el mapa: abrirla si ya se leyó, o pedir su código si está bloqueada
function clicEnNota(id) {
  const marcador = buscarMarcador(id);
  if (marcador.nota.leida) {
    abrirNota(id);
  } else if (!marcador.nota.desbloqueada) {
    introducirCodigo(id);
  } else {
    seleccionarMarcador(id);   // abierta pero sin leer: su ficha dice que enviéis a alguien
  }
}

// El objetivo de ahora: la primera nota sin leer, y qué falta para leerla
function objetivoActual() {
  for (const marcador of todasLasNotas()) {
    if (marcador.nota.leida) continue;

    const mapa = buscarMapa(marcador.mapaId);
    if (!mapa.descargado) {
      return 'Download the new zone map (Devices tab)';
    }
    if (marcador.mapaId !== estado.mapaActivo) {
      return 'Go to the zone: ' + mapa.info.nombre;
    }
    if (!marcador.nota.desbloqueada) {
      return 'Enter the access code for ' + marcador.nombre;
    }
    return 'Send an astronaut to ' + marcador.nombre;
  }
  return 'MISSION COMPLETE';
}

// La sección "Misión" del panel del centro de control
function dibujarBitacora() {
  const notas = todasLasNotas();
  const leidas = notas.filter(m => m.nota.leida).length;
  const completada = leidas === notas.length;

  let html = `
    <div class="objetivo ${completada ? 'completado' : ''}">
      <span class="objetivo-titulo">Objective</span>
      ${textoSeguro(objetivoActual())}
    </div>
    <div class="progreso-notas">Notes found: ${leidas} / ${notas.length}</div>`;

  for (const marcador of notas) {
    const nota = marcador.nota;
    const mapa = buscarMapa(marcador.mapaId);
    let estadoTexto;
    let boton = '';

    if (nota.leida) {
      estadoTexto = '✓ Read';
      boton = `<button class="boton-mini" title="Read" onclick="abrirNota('${marcador.id}')">📄</button>`;
    } else if (!mapa.descargado) {
      estadoTexto = 'Zone not downloaded';
    } else if (!nota.desbloqueada) {
      estadoTexto = '🔒 Locked';
      boton = `<button class="boton-mini" title="Enter code" onclick="introducirCodigo('${marcador.id}')">🔑</button>`;
    } else {
      estadoTexto = 'Unread: send an astronaut';
    }

    html += `
      <div class="fila nota-fila ${nota.leida ? 'leida' : ''}">
        <span class="simbolo nota">✉</span>
        <div class="fila-texto">
          <div class="fila-nombre">${textoSeguro(marcador.nombre)}</div>
          <div class="fila-detalle">${textoSeguro(estadoTexto)}</div>
        </div>
        ${boton}
      </div>`;
  }

  // Para no mezclar historia con datos reales
  html += '<p class="aviso-ficcion">The notes are the story of the game (fiction). The real NASA data is in the ⓘ info cards.</p>';

  document.getElementById('bitacora').innerHTML = html;
}

// La ventana grande con la nota. Sale encima de cualquier vista (la llama dibujar()).
function dibujarVentanaNota() {
  const ventana = document.getElementById('ventana-nota');
  const marcador = buscarMarcador(estado.notaAbierta);

  if (!marcador) {
    ventana.classList.add('oculta');
    return;
  }

  const nota = marcador.nota;
  let html = '<div class="tarjeta-nota">';

  if (nota.final) {
    html += '<div class="nota-final">MISSION COMPLETE</div>';
  }
  html += `<div class="nota-cabecera">📄 Note found · ${textoSeguro(marcador.nombre)}</div>`;
  html += `<p class="nota-texto">${textoSeguro(nota.texto)}</p>`;

  // El código de la base siguiente (si esa base necesita código)
  const siguiente = buscarMarcador(nota.siguiente);
  if (siguiente && siguiente.nota.codigo) {
    html += `<div class="nota-codigo">Access code for ${textoSeguro(siguiente.nombre)}: <strong>${textoSeguro(siguiente.nota.codigo)}</strong></div>`;
  }
  if (nota.desbloqueaMapa) {
    html += '<div class="nota-pista">📡 You can now download the new zone map in the Devices tab.</div>';
  }

  html += '<button class="boton-tarjeta" onclick="cerrarNota()">Close (Esc)</button>';
  html += '</div>';

  ventana.innerHTML = html;
  ventana.classList.remove('oculta');
}
