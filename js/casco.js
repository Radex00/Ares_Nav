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

// Bloque 9: alturas en la pantalla del casco (en %, desde arriba)
const ALTURA_HORIZONTE = 58;     // dónde está más o menos el horizonte del paisaje
const ALTURA_PUNTO_CERCA = 24;   // un punto muy cerca flota alto...
const ALTURA_PUNTO_LEJOS = 48;   // ...y uno muy lejos, cerca del horizonte
const DISTANCIA_LEJOS = 4000;    // a partir de estos metros, un punto ya cuenta como "muy lejos"
const RUMBO_DEL_SOL = 90;        // ⭐ el sol decorativo está al este

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
  dibujarPuntosEnPantalla(observador);   // bloque 9
  dibujarInfoObservador(observador);     // bloque 9
  dibujarMinimapa(observador);           // bloque 9
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
  document.getElementById('boton-minimapa').addEventListener('click', alternarMinimapa);   // bloque 9

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
  } else if (evento.key === 'm' || evento.key === 'M') {
    alternarMinimapa();               // bloque 9: el "botón del traje"
  }
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

// =========================================================
// BLOQUE 9 · PUNTOS, INFORMACIÓN Y MINIMAPA
// =========================================================

// Para que el parpadeo de las alertas no vuelva a empezar cada vez que se
// redibuja la pantalla (20 veces por segundo mientras alguien camina),
// le decimos en qué momento del parpadeo tiene que estar AHORA.
// Date.now() son los milisegundos del reloj; % 1000 se queda con lo que va del segundo.
function retrasoDeParpadeo() {
  return '-' + (Date.now() % 1000) + 'ms';
}

// 9.1 Cada marcador que se ve flota en su sitio, con su nombre y su distancia.
// 9.3 Los que no se ven y son importantes salen como aviso en el borde (◀ o ▶).
function dibujarPuntosEnPantalla(observador) {
  // El destino del observador (solo si es un astronauta que va a algún sitio)
  const destinoId = observador.destinoId || null;

  // Primero calculamos todo de cada marcador
  const puntos = [];
  for (const marcador of estado.marcadores) {
    const distancia = distanciaEnMetros(observador, marcador);
    if (distancia < 2) continue;   // está justo encima: no lo enseñamos

    const angulo = anguloHacia(observador, marcador);
    puntos.push({
      marcador: marcador,
      distancia: distancia,
      x: posicionEnPantalla(observador.rumbo, angulo),
      diferencia: diferenciaDeAngulo(observador.rumbo, angulo)
    });
  }

  // Los más lejanos primero: así los cercanos se dibujan encima
  puntos.sort(function (a, b) {
    return b.distancia - a.distancia;
  });

  let html = dibujarSol(observador);
  let avisosIzquierda = '';
  let avisosDerecha = '';

  for (const punto of puntos) {
    const marcador = punto.marcador;
    const esDestino = marcador.id === destinoId;
    const textoNombre = textoSeguro(marcador.nombre);
    const textoDistancia = formatearDistancia(punto.distancia);

    if (punto.x >= 0 && punto.x <= 100) {
      // ----- 9.1 Se ve: flota en su sitio -----
      // Más lejos = más abajo (más cerca del horizonte). Math.min no deja pasar de 1.
      const cuantoLejos = Math.min(punto.distancia / DISTANCIA_LEJOS, 1);
      const y = ALTURA_PUNTO_CERCA + cuantoLejos * (ALTURA_PUNTO_LEJOS - ALTURA_PUNTO_CERCA);

      let clases = 'punto-hud ' + marcador.tipo;
      if (marcador.atendida) clases += ' atendida';
      if (esDestino) clases += ' destino';

      // La línea punteada baja desde el punto hasta el horizonte
      html += `<div class="linea-hud ${marcador.tipo}" style="left: ${punto.x}%; top: ${y}%; height: ${ALTURA_HORIZONTE - y}%;"></div>`;
      html += `
        <div class="${clases}" style="left: ${punto.x}%; top: ${y}%; animation-delay: ${retrasoDeParpadeo()};">
          ${esDestino ? '<span class="etiqueta-destino">DESTINO</span>' : ''}
          <span class="nombre-hud">${textoNombre}</span>
          <span class="distancia-hud">${textoDistancia}</span>
          <span class="icono-hud"></span>
        </div>`;

    } else {
      // ----- 9.3 No se ve: aviso en el borde, solo si es importante -----
      const esAlertaPendiente = marcador.tipo === 'alerta' && !marcador.atendida;
      if (!esAlertaPendiente && !esDestino) continue;

      const simbolo = marcador.tipo === 'alerta' ? '⚠' : '◆';
      const clase = 'aviso-borde ' + marcador.tipo;
      if (punto.diferencia < 0) {
        avisosIzquierda += `<div class="${clase}">◀ ${simbolo} ${textoNombre} · ${textoDistancia}</div>`;
      } else {
        avisosDerecha += `<div class="${clase}">${simbolo} ${textoNombre} · ${textoDistancia} ▶</div>`;
      }
    }
  }

  // Los avisos de cada lado van en una columna, uno debajo del otro
  html += `<div class="avisos-borde izquierda">${avisosIzquierda}</div>`;
  html += `<div class="avisos-borde derecha">${avisosDerecha}</div>`;

  document.getElementById('capa-hud').innerHTML = html;
}

// ⭐ El sol decorativo: un círculo brillante que solo se ve al mirar al este.
// (Desde Marte el sol se ve más pequeño que desde la Tierra: unos 2/3 de su tamaño.)
function dibujarSol(observador) {
  const x = posicionEnPantalla(observador.rumbo, RUMBO_DEL_SOL);
  if (x < -10 || x > 110) return '';   // fuera de la vista: no se dibuja
  return `<div class="sol" style="left: ${x}%;"></div>`;
}

// 9.4 Quién está mirando: un astronauta (casco) o un dispositivo (cámara)
function dibujarInfoObservador(observador) {
  const caja = document.getElementById('info-observador');
  const astronauta = buscarAstronauta(observador.id);

  if (astronauta) {
    // ----- Casco de un astronauta: nombre, barra de O₂ y ruta -----
    let ruta = textoEstadoAstronauta(astronauta);
    const destino = buscarMarcador(astronauta.destinoId);
    if (destino) {
      ruta = 'Destino: ' + destino.nombre + ' · ' + formatearDistancia(distanciaEnMetros(astronauta, destino));
    }

    caja.innerHTML = `
      <div class="info-titulo">CASCO · ${textoSeguro(astronauta.nombre)}</div>
      <div class="info-o2">
        <span>O₂</span>
        <div class="barra-o2"><div class="relleno-o2 ${claseOxigeno(astronauta.oxigeno)}" style="width: ${astronauta.oxigeno}%;"></div></div>
        <span>${astronauta.oxigeno} %</span>
      </div>
      <div class="info-ruta">${textoSeguro(ruta)}</div>`;
  } else {
    // ----- Cámara de un dispositivo: REC y nombre de la cámara -----
    caja.innerHTML = `
      <div class="info-titulo"><span class="rec" style="animation-delay: ${retrasoDeParpadeo()};">● REC</span> ${textoSeguro(observador.nombre)}</div>
      <div class="info-ruta">${textoSeguro(observador.camara)}</div>`;
  }
}

// 9.5 El minimapa usa la MISMA función que el mapa grande.
// Resaltamos al observador para saber dónde estamos.
function dibujarMinimapa(observador) {
  pintarElementosDelMapa(document.getElementById('capa-minimapa'), observador.id);
  document.getElementById('minimapa').classList.toggle('ampliado', estado.minimapaAmpliado);
}

// 9.5 Amplía o encoge el minimapa (botón "Minimapa (M)" o tecla M)
function alternarMinimapa() {
  estado.minimapaAmpliado = !estado.minimapaAmpliado;   // ! cambia true por false y al revés
  dibujar();
}
