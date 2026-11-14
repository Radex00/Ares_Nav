/*
  ARES NAV · NASA Space Apps Challenge 2026
  Este archivo se escribió con ayuda de IA (Claude, de Anthropic).

  dispositivos.js: conectar el rover y el dron, y ver sus cámaras.
*/

// Velocidad de la barra de carga (se ajusta en el bloque 12)
const SALTO_BARRA = 5;        // cuánto avanza la barra en cada paso (en %)
const PAUSA_BARRA = 80;       // cuánto espera entre paso y paso (en milisegundos)

// =========================================================
// BLOQUE 10 · CONECTAR DISPOSITIVOS
// =========================================================

// 10.3 Dibuja una tarjeta por dispositivo
function dibujarTarjetasDispositivos() {
  let html = '';
  for (const dispositivo of estado.dispositivos) {
    // La imagen se llama igual que el tipo: img/rover.svg o img/dron.svg
    html += `
      <div class="tarjeta-dispositivo ${dispositivo.conectado ? 'conectado' : ''}" data-id="${dispositivo.id}">
        <img src="img/${dispositivo.tipo}.svg" alt="${textoSeguro(dispositivo.nombre)}">
        <h3>${textoSeguro(dispositivo.nombre)}</h3>
        <p class="tipo-dispositivo">${textoSeguro(dispositivo.camara)}</p>
        <div class="parte-inferior">${parteInferiorDeTarjeta(dispositivo)}</div>
      </div>`;
  }
  document.getElementById('tarjetas-dispositivos').innerHTML = html;
}

// 10.3 La parte de abajo de la tarjeta cambia según el estado del dispositivo
function parteInferiorDeTarjeta(dispositivo) {
  // 3) Conectado → mensaje y botón para ver su cámara (verCamara llega en el bloque 11)
  if (dispositivo.conectado) {
    return `
      <div class="mensaje-tarjeta ok">✓ Conectado</div>
      <button class="boton-tarjeta" onclick="verCamara('${dispositivo.id}')">Ver cámara</button>`;
  }

  // 2) Conectando → mensaje de la fase, barra de carga y porcentaje
  if (dispositivo.conectando) {
    return `
      <div class="mensaje-tarjeta">${dispositivo.mensaje}</div>
      <div class="barra-carga"><div class="relleno-carga" style="width: ${dispositivo.progreso}%;"></div></div>
      <div class="porcentaje-carga">${dispositivo.progreso} %</div>`;
  }

  // 1) Sin conectar → botón Conectar
  return `
    <div class="mensaje-tarjeta apagado">Sin conectar</div>
    <button class="boton-tarjeta" onclick="conectarDispositivo('${dispositivo.id}')">Conectar</button>`;
}

// 10.4 Cambia SOLO la parte de abajo de una tarjeta (no redibuja toda la vista).
// Así la barra puede avanzar muchas veces por segundo sin que nada parpadee.
function actualizarTarjeta(dispositivo) {
  const tarjeta = document.querySelector(`.tarjeta-dispositivo[data-id="${dispositivo.id}"]`);
  if (!tarjeta) return;   // por si la tarjeta todavía no está dibujada

  tarjeta.querySelector('.parte-inferior').innerHTML = parteInferiorDeTarjeta(dispositivo);
  tarjeta.classList.toggle('conectado', dispositivo.conectado);
}

// 10.4 Espera unos milisegundos.
// Devuelve una "promesa": algo que termina más tarde. Con "await esperar(80)"
// la función se queda quieta 80 ms y después sigue, sin congelar la página.
function esperar(ms) {
  return new Promise(function (terminar) {
    setTimeout(terminar, ms);
  });
}

// 10.4 Llena la barra de 0 a 100 % mostrando un mensaje.
// "async" significa que dentro de esta función se puede usar "await".
async function llenarBarra(dispositivo, mensaje) {
  dispositivo.mensaje = mensaje;
  for (let progreso = 0; progreso <= 100; progreso += SALTO_BARRA) {
    dispositivo.progreso = progreso;
    actualizarTarjeta(dispositivo);
    await esperar(PAUSA_BARRA);   // pausa antes del siguiente salto
  }
}

// 10.5 Conecta un dispositivo en dos fases y al final lo marca como conectado
async function conectarDispositivo(id) {
  const dispositivo = buscarDispositivo(id);
  // Si ya está conectado o conectándose, no hacemos nada (evita doble clic)
  if (dispositivo.conectado || dispositivo.conectando) return;

  dispositivo.conectando = true;

  await llenarBarra(dispositivo, 'Escaneando dispositivo…');             // fase 1
  await llenarBarra(dispositivo, 'Instalando sistema de navegación…');   // fase 2

  dispositivo.conectando = false;
  dispositivo.conectado = true;
  dibujar();   // ahora sí, todo: la tarjeta queda conectada y el dispositivo sale en el mapa
}

// ----- Función vacía por ahora (truco del bloque 2.5) -----

// Bloque 11: abre la cámara de un astronauta (casco) o de un dispositivo
function verCamara(id) {
}
