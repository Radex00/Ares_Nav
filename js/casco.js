/*
  ARES NAV · NASA Space Apps Challenge 2026
  Este archivo se escribió con ayuda de IA (Claude, de Anthropic).

  casco.js: la vista del casco (horizonte, brújula, puntos flotantes y minimapa).
*/

// Cuántos grados gira la vista con cada botón o cada flecha del teclado
const GIRO_GRADOS = 10;

// Las 8 direcciones de la brújula, cada 45°, empezando por el norte (0°).
// En español el oeste es "O" (SO = suroeste, NO = noroeste).
const LETRAS_BRUJULA = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];

// =========================================================
// 8.4 DIBUJAR LA VISTA DEL CASCO
// =========================================================

// Dibuja todo lo que ve el observador (astronauta o dispositivo)
function dibujarPuntoDeVista() {
  const observador = buscarObservador();
  dibujarHorizonte(observador);
  dibujarHUD(observador);
}

// El HUD es todo lo que se dibuja "en el cristal" del casco
function dibujarHUD(observador) {
  dibujarBrujula(observador.rumbo);
  // Bloque 9: dibujarPuntosEnPantalla(), dibujarInfoObservador() y dibujarMinimapa()
}

// Desliza el paisaje según el rumbo.
// La pantalla enseña CAMPO_DE_VISION grados (90°), así que la vuelta completa
// (360°) mide 360 ÷ 90 = 4 pantallas de ancho.
function dibujarHorizonte(observador) {
  const horizonte = document.getElementById('horizonte');
  const anchoPantalla = horizonte.clientWidth;
  const anchoImagen = anchoPantalla * (360 / CAMPO_DE_VISION);   // 4 pantallas

  // El borde izquierdo de la imagen (x = 0) es el norte (0°).
  // Queremos que el punto de la imagen que corresponde al rumbo quede
  // en el CENTRO de la pantalla: por eso movemos la imagen hacia la izquierda
  // (número negativo) y le sumamos media pantalla.
  const puntoDelRumbo = (observador.rumbo / 360) * anchoImagen;
  const desplazamiento = anchoPantalla / 2 - puntoDelRumbo;

  horizonte.style.backgroundSize = anchoImagen + 'px 100%';
  horizonte.style.backgroundPositionX = desplazamiento + 'px';
  // Con un panorama real cuyo borde izquierdo NO sea el norte, habría que
  // sumar aquí la diferencia (lo vemos en el bloque 4.6).
}

// =========================================================
// 8.5 GIRAR CON BOTONES Y TECLADO
// =========================================================

// Conecta los botones del casco y el teclado. Se llama una vez, desde iniciar().
function prepararCasco() {
  document.getElementById('boton-girar-izquierda').addEventListener('click', function () {
    girar(-GIRO_GRADOS);
  });
  document.getElementById('boton-girar-derecha').addEventListener('click', function () {
    girar(GIRO_GRADOS);
  });
  document.getElementById('boton-volver').addEventListener('click', function () {
    cambiarVista('control');
  });
  // El botón "Minimapa (M)" se conecta en el bloque 9

  document.addEventListener('keydown', alPresionarTecla);
}

// Gira la cabeza del observador. Números negativos = izquierda, positivos = derecha.
function girar(grados) {
  const observador = buscarObservador();
  observador.rumbo = normalizarAngulo(observador.rumbo + grados);
  dibujar();
}

// Teclas: ← y → para girar, Esc para volver al centro de control.
// Solo funcionan cuando se está viendo la vista del casco.
function alPresionarTecla(evento) {
  if (estado.vista !== 'pov') return;

  if (evento.key === 'ArrowLeft') {
    evento.preventDefault();          // que la flecha no mueva la página
    girar(-GIRO_GRADOS);
  } else if (evento.key === 'ArrowRight') {
    evento.preventDefault();
    girar(GIRO_GRADOS);
  } else if (evento.key === 'Escape') {
    cambiarVista('control');
  }
  // Bloque 9: la tecla M amplía el minimapa
}

// =========================================================
// 8.6 BRÚJULA
// =========================================================

// Cuántos grados hay que girar para pasar de "rumbo" a "angulo",
// por el camino más corto: entre -180 (izquierda) y 180 (derecha).
// Ejemplo: de 350° a 10° son +20° (no -340°).
function diferenciaDeAngulo(rumbo, angulo) {
  let diferencia = normalizarAngulo(angulo - rumbo);   // de 0 a 360
  if (diferencia > 180) {
    diferencia = diferencia - 360;                     // de -180 a 180
  }
  return diferencia;
}

// En qué parte de la pantalla (en %, de izquierda a derecha) se ve un ángulo.
// El centro (50 %) es justo hacia donde se mira. Con 90° de visión:
// 45° a la izquierda → 0 % (borde izquierdo), 45° a la derecha → 100 %.
// Si da menos de 0 o más de 100, ese ángulo está fuera de la vista.
function posicionEnPantalla(rumbo, angulo) {
  return 50 + diferenciaDeAngulo(rumbo, angulo) / CAMPO_DE_VISION * 100;
}

// Escribe un rumbo con 3 cifras: 7 → "007°"
function textoRumbo(rumbo) {
  const redondeado = normalizarAngulo(Math.round(rumbo));   // 359,6 → 360 → 0
  return String(redondeado).padStart(3, '0') + '°';
}

// Dibuja la tira de la brújula para un rumbo
function dibujarBrujula(rumbo) {
  let html = '';

  // Primer ángulo múltiplo de 15 que entra por la izquierda de la vista
  const primero = Math.ceil((rumbo - CAMPO_DE_VISION / 2) / 15) * 15;
  const ultimo = rumbo + CAMPO_DE_VISION / 2;

  for (let angulo = primero; angulo <= ultimo; angulo += 15) {
    const x = posicionEnPantalla(rumbo, angulo);
    const grados = normalizarAngulo(angulo);   // -15 → 345

    if (grados % 45 === 0) {
      // Cada 45°: raya grande y letra (N, NE, E...)
      const letra = LETRAS_BRUJULA[grados / 45];
      const claseNorte = letra === 'N' ? 'norte' : '';
      html += `<div class="brujula-raya grande" style="left: ${x}%;"></div>`;
      html += `<div class="brujula-letra ${claseNorte}" style="left: ${x}%;">${letra}</div>`;
    } else {
      // Cada 15°: raya pequeña y el número de grados
      html += `<div class="brujula-raya" style="left: ${x}%;"></div>`;
      html += `<div class="brujula-grados" style="left: ${x}%;">${grados}</div>`;
    }
  }

  // El centro: triangulito y el rumbo exacto con su dirección más cercana
  const direccion = LETRAS_BRUJULA[Math.round(normalizarAngulo(rumbo) / 45) % 8];
  html += '<div class="brujula-centro">▼</div>';
  html += `<div class="brujula-numero">${textoRumbo(rumbo)} ${direccion}</div>`;

  document.getElementById('brujula').innerHTML = html;
}
