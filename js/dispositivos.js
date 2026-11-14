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
    // La imagen sale de dispositivo.imagen. La clase con el tipo (rover, dron, mapa)
    // deja dar estilo a cada uno: el mapa sin descargar se ve borroso.
    html += `
      <div class="tarjeta-dispositivo ${dispositivo.tipo} ${dispositivo.conectado ? 'conectado' : ''}" data-id="${dispositivo.id}">
        <img src="${dispositivo.imagen}" alt="${textoSeguro(dispositivo.nombre)}">
        <h3>${textoSeguro(dispositivo.nombre)}</h3>
        <p class="tipo-dispositivo">${textoSeguro(dispositivo.camara)}</p>
        <div class="parte-inferior">${parteInferiorDeTarjeta(dispositivo)}</div>
      </div>`;
  }
  document.getElementById('tarjetas-dispositivos').innerHTML = html;
}

// 10.3 La parte de abajo de la tarjeta cambia según el estado del dispositivo
function parteInferiorDeTarjeta(dispositivo) {
  const esMapa = dispositivo.tipo === 'mapa';

  // 3) Conectado → mensaje y botón: el mapa lleva a la zona nueva; el resto, a su cámara
  if (dispositivo.conectado && esMapa) {
    return `
      <div class="mensaje-tarjeta ok">✓ Mapa descargado</div>
      <button class="boton-tarjeta" onclick="cambiarMapa('${dispositivo.mapaId}')">Ir a la zona</button>`;
  }
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

  // 1) Sin conectar → botón Conectar (o Descargar, si es el mapa)
  return `
    <div class="mensaje-tarjeta apagado">${esMapa ? 'Zona sin explorar' : 'Sin conectar'}</div>
    <button class="boton-tarjeta" onclick="conectarDispositivo('${dispositivo.id}')">${esMapa ? 'Descargar' : 'Conectar'}</button>`;
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

  // Cada dispositivo trae sus dos mensajes en "fases" (el mapa tiene los suyos)
  await llenarBarra(dispositivo, dispositivo.fases[0]);   // fase 1
  await llenarBarra(dispositivo, dispositivo.fases[1]);   // fase 2

  dispositivo.conectando = false;
  dispositivo.conectado = true;

  // Bloque 4: si era el mapa de la zona nueva, esa zona ya se puede usar
  if (dispositivo.tipo === 'mapa') {
    buscarMapa(dispositivo.mapaId).descargado = true;
  }

  dibujar();   // ahora sí, todo: la tarjeta queda conectada y el dispositivo sale en el mapa
}

// =========================================================
// BLOQUE 11 · CÁMARAS
// =========================================================

// 11.1 Todas las cámaras que se pueden ver: los cascos de los astronautas
// y las cámaras de los dispositivos YA conectados.
function obtenerCamarasDisponibles() {
  // El mapa de la zona nueva no tiene cámara
  const conectados = estado.dispositivos.filter(d => d.conectado && d.tipo !== 'mapa');
  return estado.astronautas.concat(conectados);
}

// 11.2 El panel "Dispositivos conectados" del centro de control, con su botón VER
function dibujarListaConectados() {
  const lista = document.getElementById('lista-conectados');
  const conectados = estado.dispositivos.filter(d => d.conectado && d.tipo !== 'mapa');

  if (conectados.length === 0) {
    lista.innerHTML = '<p class="vacio">Ningún dispositivo conectado. Conéctalos en la pestaña Dispositivos.</p>';
    return;
  }

  let html = '';
  for (const dispositivo of conectados) {
    html += `
      <div class="fila">
        <span class="simbolo dispositivo">■</span>
        <div class="fila-texto">
          <div class="fila-nombre">${textoSeguro(dispositivo.nombre)}</div>
          <div class="fila-detalle">${textoSeguro(dispositivo.camara)}</div>
        </div>
        <button class="boton-ver" onclick="verCamara('${dispositivo.id}')">VER</button>
      </div>`;
  }
  lista.innerHTML = html;
}

// 11.3 Abre la cámara de alguien:
//   - si es un astronauta → la vista del casco
//   - si es un dispositivo → la misma vista, pero en "modo cámara" (11.5)
// Las dos usan la vista 'pov': lo que cambia es quién mira (estado.camaraActiva).
function verCamara(id) {
  estado.camaraActiva = id;
  estado.vista = 'pov';
  mostrarEstatica();   // ⭐ un instante de estática, como al cambiar de canal
  dibujar();
}

// 11.4 Botones para cambiar de cámara dentro de la vista del casco
function dibujarSelectorCamaras(observador) {
  let html = '';
  for (const camara of obtenerCamarasDisponibles()) {
    // Los astronautas tienen casco; los dispositivos, cámara
    const tipo = buscarAstronauta(camara.id) ? 'CASCO' : 'CÁM';
    const activa = camara.id === observador.id ? 'activa' : '';
    html += `<button class="boton-camara ${activa}" onclick="verCamara('${camara.id}')">${tipo} · ${textoSeguro(camara.nombre)}</button>`;
  }
  document.getElementById('selector-camaras').innerHTML = html;
}

// 11.5 Si quien mira es un dispositivo, la vista pasa a "modo cámara":
// gris, con rayas de televisión (todo eso lo hace el CSS con la clase modo-camara)
function aplicarModoCamara(observador) {
  const esDispositivo = !buscarAstronauta(observador.id);
  document.getElementById('vista-pov').classList.toggle('modo-camara', esDispositivo);
}

// 11.6 ⭐ Estática de televisión durante un instante.
// Es solo un efecto de 0,4 segundos, no un dato: por eso no se guarda en `estado`.
function mostrarEstatica() {
  const estatica = document.getElementById('estatica');
  estatica.classList.remove('oculta');
  setTimeout(function () {
    estatica.classList.add('oculta');
  }, 400);
}
