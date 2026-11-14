/*
  ARES NAV · NASA Space Apps Challenge 2026
  Este archivo se escribió con ayuda de IA (Claude, de Anthropic).

  estado.js: aquí viven TODOS los datos de la página (el objeto estado)
  y las funciones que usan los demás archivos (buscar, cambiar de vista, matemática).

  LA REGLA DE ORO DEL PROYECTO:
    1) cambiar algo dentro de `estado`
    2) llamar a dibujar()
  Nunca cambiamos la pantalla "a mano": la pantalla siempre se dibuja a partir de `estado`.
*/

// =========================================================
// 2.1 CONSTANTES DEL MAPA
// Las posiciones van en porcentaje del mapa (0 a 100).
// Estas constantes sirven para pasar de porcentaje a metros reales.
// (Los metros se ajustan en el bloque 4 con la zona real de Marte.)
// =========================================================

const MAPA_ANCHO_METROS = 4000;   // de izquierda a derecha (oeste → este)
const MAPA_ALTO_METROS = 2500;    // de arriba abajo (norte → sur)

// Cuántos metros hay en 1 punto de porcentaje.
// Ejemplo: 4000 m / 100 = 40 m por cada punto en horizontal.
const METROS_POR_PUNTO_X = MAPA_ANCHO_METROS / 100;
const METROS_POR_PUNTO_Y = MAPA_ALTO_METROS / 100;

// Cuántos grados ve el astronauta a la vez en la vista del casco
const CAMPO_DE_VISION = 90;

// Cuántos metros avanza un astronauta en cada paso, y cada cuánto da un paso
const PASO_METROS = 3;            // se ajusta en el bloque 12 para la demo
const TIEMPO_ENTRE_PASOS = 50;    // en milisegundos (50 ms = 20 pasos por segundo)

// Los nombres de las 3 vistas (coinciden con los id "vista-..." del HTML)
const VISTAS = ['control', 'pov', 'dispositivos'];

// =========================================================
// 2.2 y 2.3 EL OBJETO ESTADO
// Todos los datos de la página están aquí dentro.
// =========================================================

const estado = {
  // ----- 2.2 Qué se está viendo y qué está haciendo el usuario -----
  vista: 'control',          // la vista que se ve: 'control', 'pov' o 'dispositivos'
  camaraActiva: 'a1',        // id de quien "mira" en la vista del casco (astronauta o dispositivo)
  modoMarcador: null,        // null (ninguno), 'interes' o 'alerta' (bloque 6)
  minimapaAmpliado: false,   // true cuando el minimapa está en grande (bloque 9)
  siguienteId: 3,            // número del próximo marcador nuevo: 'm3', 'm4', ...

  // ----- Espacio para la información del mapa real -----
  // Se rellena en el bloque 4 (con lo anotado en FUENTES.md)
  // y se muestra en el panel del centro de control en el bloque 5.
  infoMapa: {
    nombre: '',        // ej.: "Cráter Jezero, Marte"
    mision: '',        // misión que tomó la imagen
    instrumento: '',   // cámara o instrumento
    fecha: '',         // cuándo se tomó la imagen
    credito: '',       // ej.: "NASA/JPL-Caltech/University of Arizona"
    enlace: '',        // página oficial de la imagen
    descripcion: ''    // texto del equipo: qué es este lugar y por qué lo elegimos
  },

  // ----- 2.3 LAS TRES LISTAS (datos de prueba) -----
  // Los puntos reales de NASA llegan en el bloque 4.
  // Cada cosa tiene un id distinto: 'm' = marcador, 'a' = astronauta, 'd' = dispositivo.

  // tipo: 'interes' o 'alerta'. atendida: solo importa en las alertas.
  marcadores: [
    { id: 'm1', tipo: 'interes', nombre: 'Punto de prueba', x: 30, y: 40, atendida: false },
    { id: 'm2', tipo: 'alerta', nombre: 'Fuga de oxígeno (prueba)', x: 70, y: 30, atendida: false }
  ],

  // rumbo: hacia dónde mira, en grados (0 = norte, 90 = este).
  // destinoId: el id del marcador al que camina (null = está quieto).
  astronautas: [
    { id: 'a1', nombre: 'Vega', x: 50, y: 60, rumbo: 0, oxigeno: 100, destinoId: null },
    { id: 'a2', nombre: 'Ríos', x: 52, y: 62, rumbo: 0, oxigeno: 100, destinoId: null }
  ],

  // tipo: 'rover' o 'dron' (coincide con el nombre de su imagen: img/rover.svg, img/dron.svg).
  // conectado / conectando / progreso / mensaje: los usa la barra de carga del bloque 10.
  dispositivos: [
    {
      id: 'd1', tipo: 'rover', nombre: 'Rover R-1', camara: 'Cámara de navegación',
      x: 48, y: 64, rumbo: 90,
      conectado: false, conectando: false, progreso: 0, mensaje: ''
    },
    {
      id: 'd2', tipo: 'dron', nombre: 'Dron D-1', camara: 'Cámara inferior',
      x: 54, y: 58, rumbo: 0,
      conectado: false, conectando: false, progreso: 0, mensaje: ''
    }
  ]
};

// =========================================================
// 2.4 FUNCIONES DE BÚSQUEDA
// find() recorre la lista y devuelve el primero que cumple la condición.
// "m => m.id === id" se lee: "para cada m, ¿su id es igual al que busco?"
// Si no encuentra nada, find() devuelve undefined.
// =========================================================

function buscarMarcador(id) {
  return estado.marcadores.find(m => m.id === id);
}

function buscarAstronauta(id) {
  return estado.astronautas.find(a => a.id === id);
}

function buscarDispositivo(id) {
  return estado.dispositivos.find(d => d.id === id);
}

// El "observador" es quien mira en la vista del casco: puede ser un astronauta
// o un dispositivo. Si no se encuentra ninguno, usamos el primer astronauta.
// (El || significa "si lo de la izquierda no existe, prueba lo siguiente".)
function buscarObservador() {
  const id = estado.camaraActiva;
  return buscarAstronauta(id) || buscarDispositivo(id) || estado.astronautas[0];
}

// =========================================================
// 2.5 CAMBIO DE VISTAS Y DIBUJO
// =========================================================

// Cambia la vista y redibuja (siempre: primero estado, luego dibujar)
function cambiarVista(nuevaVista) {
  estado.vista = nuevaVista;
  dibujar();
}

// Pone la pantalla igual que dice `estado`
function dibujar() {
  // 1) Encender la pestaña de la vista actual y apagar las demás.
  //    classList.toggle('activa', true) pone la clase; con false la quita.
  const pestanas = document.querySelectorAll('.pestana');
  for (const pestana of pestanas) {
    const esLaActual = pestana.dataset.vista === estado.vista;
    pestana.classList.toggle('activa', esLaActual);
  }

  // 2) Mostrar solo la vista actual: a las demás les ponemos la clase "oculta"
  for (const nombre of VISTAS) {
    const vista = document.getElementById('vista-' + nombre);
    vista.classList.toggle('oculta', nombre !== estado.vista);
  }

  // 3) Dibujar por dentro solo la vista que se ve (las demás no hace falta)
  if (estado.vista === 'control') {
    dibujarMapa();                  // mapa.js
  } else if (estado.vista === 'pov') {
    dibujarPuntoDeVista();          // casco.js
  } else if (estado.vista === 'dispositivos') {
    dibujarTarjetasDispositivos();  // dispositivos.js
  }
}

// Conecta cada pestaña con su vista.
// pestana.dataset.vista lee el atributo data-vista="..." del HTML.
function prepararPestanas() {
  const pestanas = document.querySelectorAll('.pestana');
  for (const pestana of pestanas) {
    pestana.addEventListener('click', function () {
      cambiarVista(pestana.dataset.vista);
    });
  }
}

// =========================================================
// 2.6 RELOJ E INICIO
// =========================================================

// Convierte 7 en "07" para que el reloj siempre tenga dos cifras
function dosCifras(numero) {
  return String(numero).padStart(2, '0');
}

// Escribe la hora actual en el reloj de la barra superior
function actualizarReloj() {
  const ahora = new Date();
  const texto = dosCifras(ahora.getHours()) + ':' +
                dosCifras(ahora.getMinutes()) + ':' +
                dosCifras(ahora.getSeconds());
  document.getElementById('reloj').textContent = texto;
}

// Arranca todo una sola vez, cuando la página ya está cargada
function iniciar() {
  prepararPestanas();
  prepararMapa();     // mapa.js (se rellena en el bloque 6)
  prepararCasco();    // casco.js (se rellena en el bloque 8)

  actualizarReloj();                    // la hora aparece enseguida...
  setInterval(actualizarReloj, 1000);   // ...y se actualiza cada 1000 ms (1 segundo)

  dibujar();
}

// DOMContentLoaded ocurre cuando el HTML y LOS 4 SCRIPTS ya se cargaron.
// Esperamos a ese momento porque iniciar() usa funciones de mapa.js y casco.js,
// que se cargan DESPUÉS de este archivo.
document.addEventListener('DOMContentLoaded', iniciar);
