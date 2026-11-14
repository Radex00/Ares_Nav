/*
  ARES NAV · NASA Space Apps Challenge 2026
  Este archivo se escribió con ayuda de IA (Claude, de Anthropic).

  vital.js: la Sala de control vital. Mide las amenazas y los cambios del ambiente
  de Marte (temperatura, presión, viento, polvo, radiación, sismos) y el oxígeno
  de los astronautas.

  Las lecturas son SIMULADAS, pero se mueven alrededor de valores REALES medidos
  por misiones de NASA (fuentes en FUENTES.md y en cada tarjeta).
  Los umbrales verde / naranja / rojo son decisiones de la simulación.
*/

// =========================================================
// LOS SENSORES
//   base: el valor normal (de una fuente real)
//   precaucion / peligro: a partir de qué valor la tarjeta se pone naranja / roja
//   referencia: el dato real que se enseña en la tarjeta, con su fuente
// =========================================================
const SENSORES = [
  {
    id: 'temperatura', nombre: 'Air temperature', unidad: '°C', decimales: 0,
    precaucion: null, peligro: null,   // solo mide cambios: sube y baja cada sol
    referencia: 'InSight, Feb 2019: high −17 °C, low −95 °C',
    fuente: 'https://www.jpl.nasa.gov/news/news.php?feature=7337'
  },
  {
    id: 'presion', nombre: 'Air pressure', unidad: 'Pa', decimales: 0,
    precaucion: null, peligro: null,
    referencia: 'Mars: 636 Pa on average, 400–870 Pa depending on the season',
    fuente: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html'
  },
  {
    id: 'viento', nombre: 'Wind speed', unidad: 'm/s', decimales: 1,
    precaucion: 15, peligro: 17,
    referencia: 'Viking sites: 2–10 m/s normal, 17–30 m/s in dust storms',
    fuente: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html'
  },
  {
    id: 'polvo', nombre: 'Dust in the air (opacity τ)', unidad: 'τ', decimales: 1,
    precaucion: 2, peligro: 5,
    referencia: 'Normal τ ≈ 0.5. In the 2018 storm that ended Opportunity: τ 10.8',
    fuente: 'https://www.jpl.nasa.gov/news/opportunity-hunkers-down-during-dust-storm/'
  },
  {
    id: 'radiacion', nombre: 'Radiation dose', unidad: 'µGy/day', decimales: 0,
    precaucion: 400, peligro: 1000,
    referencia: 'Curiosity (RAD): about 210 µGy per day from cosmic rays',
    fuente: 'https://science.nasa.gov/resource/radiation-measurements-on-mars/'
  },
  {
    id: 'sismo', nombre: 'Last marsquake (magnitude)', unidad: 'M', decimales: 1,
    precaucion: 3, peligro: 4,
    referencia: 'InSight detected 1,319 marsquakes; the largest was about magnitude 5 (May 4, 2022)',
    fuente: 'https://www.jpl.nasa.gov/news/nasas-insight-records-monster-quake-on-mars/'
  }
];

// Los valores normales hacia los que vuelve cada sensor cuando no pasa nada
const NORMAL = { presion: 720, viento: 6, polvo: 0.5, radiacion: 210 };

// Los 3 eventos que se pueden simular en la demo
//   duracion: segundos que dura. objetivos: hacia qué valores suben los sensores.
const EVENTOS = {
  tormenta: {
    nombre: 'DUST STORM', duracion: 30,
    objetivos: { viento: 22, polvo: 9.5 },
    texto: 'Strong winds and dust: visibility and solar power are dropping.'
  },
  solar: {
    nombre: 'SOLAR PARTICLE EVENT', duracion: 20,
    objetivos: { radiacion: 1800 },
    texto: 'Radiation is high: crew should take shelter.'
  },
  sismo: {
    nombre: 'MARSQUAKE', duracion: 12,
    objetivos: {},
    texto: 'A strong marsquake was detected near the base.'
  }
};

// El estado de la sala (lo que cambia) va dentro de `estado`, como todo lo demás
estado.ambiente = {
  valores: { temperatura: -60, presion: 720, viento: 6, polvo: 0.5, radiacion: 210, sismo: 1.2 },
  evento: null,       // el evento que está pasando: 'tormenta', 'solar', 'sismo' o null
  finEvento: 0        // cuándo termina (en milisegundos del reloj, como Date.now())
};

// =========================================================
// CADA SEGUNDO: las lecturas cambian un poco
// =========================================================

// Número al azar entre -1 y 1 (para que las lecturas "tiemblen" como un sensor de verdad)
function ruido() {
  return Math.random() * 2 - 1;
}

function actualizarSensores() {
  const v = estado.ambiente.valores;
  const ahora = Date.now();

  // ¿Terminó el evento?
  if (estado.ambiente.evento && ahora > estado.ambiente.finEvento) {
    if (estado.ambiente.evento === 'sismo') {
      v.sismo = 1.5;   // después del sismo fuerte, vuelve la calma
    }
    estado.ambiente.evento = null;
    dibujar();   // quitar la barra roja y el polvo del casco
  }

  // Temperatura: un "sol" (día de Marte) dura 4 minutos en la simulación.
  // Math.sin sube y baja entre -1 y 1: así va de -95 °C a -17 °C, como midió InSight.
  const parteDelSol = (ahora / 1000 % 240) / 240;
  v.temperatura = -56 + 39 * Math.sin(2 * Math.PI * parteDelSol);

  // Los demás se acercan poco a poco a su objetivo (el normal, o el del evento)
  const evento = EVENTOS[estado.ambiente.evento];
  for (const id of ['presion', 'viento', 'polvo', 'radiacion']) {
    let objetivo = NORMAL[id];
    if (evento && evento.objetivos[id] !== undefined) objetivo = evento.objetivos[id];
    // Cada segundo recorre el 15 % de lo que le falta, más un poco de ruido
    v[id] = v[id] + (objetivo - v[id]) * 0.15 + ruido() * objetivo * 0.02;
  }

  // Sismos: de vez en cuando uno pequeño (magnitud 1-2,5), como los que oía InSight
  if (estado.ambiente.evento !== 'sismo' && Math.random() < 0.05) {
    v.sismo = 1 + Math.random() * 1.5;
  }

  actualizarLecturas();
}

// =========================================================
// ESTADO DE CADA SENSOR Y DE LA TRIPULACIÓN
// =========================================================

// 'ok', 'precaucion' o 'peligro' según los umbrales del sensor
function nivelDe(sensor, valor) {
  if (sensor.peligro !== null && valor >= sensor.peligro) return 'peligro';
  if (sensor.precaucion !== null && valor >= sensor.precaucion) return 'precaucion';
  return 'ok';
}

const TEXTO_NIVEL = { ok: 'NORMAL', precaucion: 'CAUTION', peligro: 'DANGER' };

// =========================================================
// DIBUJAR LA SALA
// =========================================================

// Crea las tarjetas (una vez, al abrir la pestaña). Los números los pone actualizarLecturas().
function dibujarSalaVital() {
  let html = '';
  for (const sensor of SENSORES) {
    html += `
      <div class="tarjeta-sensor" id="sensor-${sensor.id}">
        <div class="sensor-nombre">${sensor.nombre}</div>
        <div class="sensor-valor"><span class="numero">–</span> <span class="unidad">${sensor.unidad}</span></div>
        <div class="sensor-nivel"></div>
        <div class="sensor-referencia">Real reference: ${sensor.referencia} ·
          <a href="${sensor.fuente}" target="_blank" rel="noopener">source</a></div>
      </div>`;
  }
  document.getElementById('sensores').innerHTML = html;

  // Tripulación: el oxígeno de cada astronauta (viene de estado.astronautas)
  let tripulacion = '';
  for (const astronauta of estado.astronautas) {
    tripulacion += `
      <div class="fila-o2">
        <span class="nombre-astronauta">${textoSeguro(astronauta.nombre)}</span>
        <div class="barra-o2"><div class="relleno-o2 ${claseOxigeno(astronauta.oxigeno)}" style="width: ${astronauta.oxigeno}%;"></div></div>
        <span>O₂ ${astronauta.oxigeno} %</span>
      </div>`;
  }
  document.getElementById('tripulacion').innerHTML = tripulacion;

  actualizarLecturas();
}

// Cambia SOLO los números y colores (cada segundo), sin crear las tarjetas otra vez
function actualizarLecturas() {
  for (const sensor of SENSORES) {
    const tarjeta = document.getElementById('sensor-' + sensor.id);
    if (!tarjeta) continue;   // la sala todavía no se ha dibujado
    const valor = estado.ambiente.valores[sensor.id];
    const nivel = nivelDe(sensor, valor);

    tarjeta.querySelector('.numero').textContent = valor.toFixed(sensor.decimales);
    tarjeta.querySelector('.sensor-nivel').textContent = TEXTO_NIVEL[nivel];
    tarjeta.classList.toggle('precaucion', nivel === 'precaucion');
    tarjeta.classList.toggle('peligro', nivel === 'peligro');
  }
}

// La barra roja de aviso, encima de todas las vistas. Y el polvo del casco si hay tormenta.
// La llama dibujar() (estado.js).
function dibujarAvisoAmenaza() {
  const barra = document.getElementById('aviso-amenaza');
  const evento = EVENTOS[estado.ambiente.evento];

  document.body.classList.toggle('tormenta', estado.ambiente.evento === 'tormenta');

  if (!evento) {
    barra.classList.add('oculta');
    return;
  }
  barra.innerHTML = `⚠ ${evento.nombre} · ${evento.texto} <span class="aviso-simulado">(simulation)</span>`;
  barra.classList.remove('oculta');
}

// =========================================================
// SIMULAR UN EVENTO (botones de la sala)
// =========================================================
function simularEvento(id) {
  estado.ambiente.evento = id;
  estado.ambiente.finEvento = Date.now() + EVENTOS[id].duracion * 1000;

  // El sismo es instantáneo: la lectura salta de golpe (el mayor real fue de magnitud ~5)
  if (id === 'sismo') {
    estado.ambiente.valores.sismo = 4.2;
  }
  dibujar();
}

// Las lecturas cambian cada segundo desde que carga la página
setInterval(actualizarSensores, 1000);
