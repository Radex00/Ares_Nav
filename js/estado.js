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
// 2.1 CONSTANTES
// Las posiciones van en porcentaje del mapa (0 a 100).
// Bloque 4: cada mapa real tiene su propio tamaño en metros (está en estado.mapas),
// así que los metros de cada punto los calculan metrosPorPuntoX() y metrosPorPuntoY().
// =========================================================

// Cuántos grados ve el astronauta a la vez en la vista del casco
const CAMPO_DE_VISION = 90;

// Cuántos metros avanza un astronauta en cada paso, y cada cuánto da un paso.
// 12.3: 0,5 m cada 50 ms = 10 m/s. Así, de la base a una alerta (unos 150 m)
// se tarda unos 15 s: da tiempo a pasar al casco y ver la alerta flotando.
const PASO_METROS = 0.5;          // ajustado en el bloque 12 para la demo
const TIEMPO_ENTRE_PASOS = 50;    // en milisegundos (50 ms = 20 pasos por segundo)

// Bloque 4: fuentes que se repiten en las fichas de los marcadores.
// Los datos completos de cada una están en FUENTES.md.
const FUENTE_GOLOMBEK = {
  texto: 'Golombek et al. (2020), Nature Communications 11, 1014',
  enlace: 'https://doi.org/10.1038/s41467-020-14679-1'
};
const FUENTE_PIA26515 = {
  texto: 'NASA/JPL-Caltech/UArizona · PIA26515 (HiRISE, 2024)',
  enlace: 'https://science.nasa.gov/photojournal/hirise-studies-the-dust-on-insight/'
};
const FUENTE_HIRISE_2018 = {
  texto: 'NASA/JPL-Caltech/UArizona · HiRISE ESP_058005_1845 (2018)',
  enlace: 'https://www.uahirise.org/ESP_058005_1845'
};
const FUENTE_PIA22875 = {
  texto: 'NASA/JPL-Caltech/UArizona · PIA22875 (2018)',
  enlace: 'https://science.nasa.gov/photojournal/insight-on-mars-as-seen-by-hirise/'
};
const FUENTE_JPL_2022 = {
  texto: 'NASA/JPL, "NASA Retires InSight Mars Lander Mission After Years of Science" (Dec 21, 2022)',
  enlace: 'https://www.jpl.nasa.gov/news/nasa-retires-insight-mars-lander-mission-after-years-of-science/'
};

// Los nombres de las 3 vistas (coinciden con los id "vista-..." del HTML)
const VISTAS = ['control', 'pov', 'dispositivos', 'vital'];   // 'vital': Sala de control vital

// =========================================================
// 2.2 y 2.3 EL OBJETO ESTADO
// Todos los datos de la página están aquí dentro.
// =========================================================

const estado = {
  // ----- 2.2 Qué se está viendo y qué está haciendo el usuario -----
  vista: 'control',          // la vista que se ve: 'control', 'pov' o 'dispositivos'
  camaraActiva: 'a1',        // id de quien "mira" en la vista del casco (astronauta o dispositivo)
  ultimoCasco: 'a1',         // el último astronauta cuyo casco se vio (lo usa la pestaña del casco)
  modoMarcador: null,        // null (ninguno), 'interes' o 'alerta' (bloque 6)
  minimapaAmpliado: false,   // true cuando el minimapa está en grande (bloque 9)
  siguienteId: 20,           // número del próximo marcador nuevo: 'm20', 'm21', ... (los reales usan m1-m9)
  mapaActivo: 'zona-a',      // bloque 4: el id del mapa que se está usando
  marcadorSeleccionado: null, // bloque 4: el marcador cuya ficha se ve en el panel
  notaAbierta: null,         // historia: el id de la nota que se está leyendo en la ventana (o null)

  // =========================================================
  // BLOQUE 4 · LOS MAPAS REALES DE NASA
  // anchoPx / altoPx: tamaño de la imagen en píxeles (para que no se deforme).
  // anchoMetros / altoMetros: medidos con la barra de escala que trae cada imagen.
  // base: dónde aparecen los astronautas y los dispositivos al llegar a la zona.
  // descargado: si ya se puede usar. La zona nueva se descarga en "Dispositivos".
  // info: lo que sale en "Sobre este mapa". Fuentes completas en FUENTES.md.
  // Las coordenadas son aproximadas: salen de la posición de InSight
  // (4,502° N, 135,623° E, Golombek et al. 2020) y de la escala, con el norte arriba.
  // =========================================================
  mapas: [
    {
      id: 'zona-a',
      imagen: 'img/mapa-insight-2024.jpg',
      anchoPx: 1106, altoPx: 977,
      anchoMetros: 339, altoMetros: 299,     // barra de escala: 100 m = 327 px
      base: { x: 12, y: 80 },
      velocidad: 1,                          // × PASO_METROS (zona pequeña: velocidad normal)
      descargado: true,
      info: {
        nombre: 'Elysium Planitia · InSight in 2024',
        mision: 'Mars Reconnaissance Orbiter (MRO)',
        instrumento: 'HiRISE camera · image PIA26515',
        fecha: 'October 23, 2024',
        coordenadas: '4.4994°–4.5045° N · 135.6206°–135.6264° E (approx.)',
        tamano: '339 × 299 m',
        credito: 'NASA/JPL-Caltech/UArizona',
        enlace: 'https://science.nasa.gov/photojournal/hirise-studies-the-dust-on-insight/',
        descripcion: ''   // texto del equipo: qué es este lugar y por qué lo elegimos
      }
    },
    {
      id: 'zona-b',
      imagen: 'img/mapa-insight-2018.jpg',
      anchoPx: 1131, altoPx: 1280,
      anchoMetros: 635, altoMetros: 719,     // barra de escala: 100 m = 178 px
      base: { x: 8, y: 64 },
      velocidad: 3,                          // × PASO_METROS: es el doble de grande, así la demo no se alarga
      descargado: false,
      info: {
        nombre: 'InSight landing zone in 2018',
        mision: 'Mars Reconnaissance Orbiter (MRO)',
        instrumento: 'HiRISE camera · image ESP_058005_1845',
        fecha: 'December 11, 2018',
        coordenadas: '4.4949°–4.5071° N · 135.6211°–135.6319° E (approx.)',
        tamano: '635 × 719 m',
        credito: 'NASA/JPL-Caltech/UArizona',
        enlace: 'https://www.uahirise.org/ESP_058005_1845',
        descripcion: ''   // texto del equipo
      }
    }
  ],

  // ----- 2.3 LAS TRES LISTAS -----
  // Cada cosa tiene un id distinto: 'm' = marcador, 'a' = astronauta, 'd' = dispositivo.

  // tipo: 'interes' o 'alerta'. atendida: solo importa en las alertas.
  // mapaId: en qué mapa está. x e y: medidos sobre la imagen de ese mapa.
  // ficha: lo que sale al pulsar ⓘ (texto y fuentes). Los marcadores nuevos no tienen.
  marcadores: [
    // ----- Zona A: InSight en 2024 (PIA26515) -----
    {
      id: 'm1', mapaId: 'zona-a', tipo: 'interes', nombre: 'InSight', x: 41.2, y: 49.3, atendida: false,
      ficha: {
        texto: 'NASA lander that arrived on November 26, 2018 to study the interior of Mars. ' +
               'Its seismometer detected 1,319 marsquakes. Dust slowly covered its solar panels ' +
               'until it ran out of power: it last talked to Earth on December 15, 2022. ' +
               'In this 2024 photo it already has the same reddish color as the ground.',
        fuentes: [FUENTE_HIRISE_2018, FUENTE_JPL_2022, FUENTE_PIA26515]
      }
    },
    {
      id: 'm2', mapaId: 'zona-a', tipo: 'interes', nombre: 'Retrorocket halo', x: 37.5, y: 54.2, atendida: false,
      ficha: {
        texto: 'During landing, the retrorockets swept away the fine dust and left the ground darker. ' +
               'Over the years dust settles again and the halo fades. Measuring how fast it fades ' +
               'helps estimate the age of craters.',
        fuentes: [FUENTE_GOLOMBEK, FUENTE_PIA26515]
      }
    },
    {
      id: 'm3', mapaId: 'zona-a', tipo: 'interes', nombre: 'Homestead hollow soil', x: 45.1, y: 45.0, atendida: false,
      ficha: {
        texto: 'InSight sits on the west side of Homestead hollow, a very eroded impact crater about 27 m wide. ' +
               'The ground is sand with granules and pebbles, with very few rocks. In layers: dust on top, ' +
               'a thin layer of loose sand, a hardened crust (duricrust) of varying thickness and, below, sand with rocks.',
        fuentes: [FUENTE_GOLOMBEK]
      }
    },
    {
      id: 'm4', mapaId: 'zona-a', tipo: 'alerta', nombre: 'Rockier terrain', x: 26.2, y: 40.4, atendida: false,
      ficha: {
        texto: 'West of Homestead hollow the terrain is somewhat rockier and rougher than the sandy floor of the crater. ' +
               'In the simulation we mark it as an area to walk with care.',
        fuentes: [FUENTE_GOLOMBEK]
      }
    },
    {
      id: 'm5', mapaId: 'zona-a', tipo: 'interes', nombre: 'Impact crater', x: 71.1, y: 80.4, atendida: false,
      ficha: {
        texto: 'Small impact crater. Small craters are common on this plain. ' +
               'The ground is regolith (rock broken up by impacts) 3 to 18 m thick, on top of ancient basaltic lava flows.',
        fuentes: [FUENTE_GOLOMBEK, FUENTE_PIA26515]
      }
    },

    // ----- Zona B: la zona nueva, InSight en 2018 (HiRISE ESP_058005_1845) -----
    {
      id: 'm6', mapaId: 'zona-b', tipo: 'interes', nombre: 'InSight (2018)', x: 17.5, y: 42.0, atendida: false,
      ficha: {
        texto: 'InSight two weeks after landing. The ground around it is dark because the retrorockets ' +
               'swept it. With its solar panels open it is about 6 m wide.',
        fuentes: [FUENTE_HIRISE_2018, FUENTE_PIA22875]
      }
    },
    {
      id: 'm7', mapaId: 'zona-b', tipo: 'interes', nombre: 'Heat shield', x: 90.8, y: 17.1, atendida: false,
      ficha: {
        texto: 'The heat shield of InSight came off during the descent and ended up here. ' +
               'It shines so much because it reflects sunlight, like a mirror.',
        fuentes: [FUENTE_HIRISE_2018, FUENTE_PIA22875]
      }
    },
    {
      id: 'm8', mapaId: 'zona-b', tipo: 'interes', nombre: 'Backshell and parachute', x: 37.5, y: 90.3, atendida: false,
      ficha: {
        texto: 'The backshell is still attached to the parachute that slowed down the descent of InSight. ' +
               'The streak going south is probably an old dust devil track.',
        fuentes: [FUENTE_HIRISE_2018, FUENTE_PIA22875]
      }
    },
    {
      id: 'm9', mapaId: 'zona-b', tipo: 'alerta', nombre: 'Crater (slope)', x: 60.1, y: 52.1, atendida: false,
      ficha: {
        texto: 'Impact crater about 50-60 m wide (measured by the team on the image). ' +
               'Craters are common on this plain. In the simulation its sloping walls are a dangerous area.',
        fuentes: [FUENTE_HIRISE_2018, FUENTE_GOLOMBEK]
      }
    },

    // =========================================================
    // HISTORIA · LAS NOTAS DEL EQUIPO ANTERIOR (ficción: textos del equipo)
    // Son marcadores de tipo 'nota'. Una nota se lee cuando un astronauta LLEGA a ella.
    //   codigo: el código para abrir ESTA base (null = abierta desde el principio)
    //   siguiente: la base cuyo código se enseña al leer esta nota
    //   desbloqueaMapa: el dispositivo-mapa que se puede descargar al leerla
    //   final: true en la última nota (sale "MISIÓN COMPLETADA")
    //   ps: postdata de guía de Rick: enseña la parte de la página que toca usar ahora
    //       (escrita con ayuda de IA a petición del equipo; no es parte del texto del equipo)
    //   audio: la bitácora leída en voz alta (voz generada con IA; ver SOURCES.md)
    // Las bases de la zona nueva están junto a las 3 piezas reales de NASA.
    // =========================================================
    {
      id: 'n1', mapaId: 'zona-a', tipo: 'nota', nombre: 'Crash site', x: 30, y: 72, atendida: false, ficha: null,
      nota: {
        // Texto del equipo (bitácora de Rick, traducida al inglés; ver HISTORIA.md)
        texto: "Log #1. First entry. My crew and I were on a simple reconnaissance mission, flying over the area. There were four of us: Mikey, Juno, Laika and me, Rick. Each of us had a job. I'm mainly an engineer: I keep everything on the ship in order. So I was at my monitoring panel, checking that every part and device was working properly, when something went wrong. One of the engines suddenly failed, and the controllers failed at the same time. We didn't even have time to react. Luckily, we were quite high above the ground, so at least we had time to put on our suits.\n\n" +
          "When we hit the ground, we all passed out. Luckily, none of us was hurt. Laika, our captain, tried to keep us calm. She ordered Mikey, our navigation expert, to check the map and find out exactly where we were. His map was distorted by the crash, but he could see that there was a supply depot near us. I don't have much hope, but I hope everything turns out fine. End of log #1.",
        ps: "P.S. To whoever finds this: the first supply depot is locked. Its code is HOLLOW, like Homestead hollow, the old crater next to the InSight lander. In the Mission panel of your Control center, press the key next to Supply depot 1 and type the code. Then pick the depot in an astronaut's menu and press Deploy. While they walk, open the Helmet view to see Mars through their visor.",
        audio: 'audio/log-1.mp3',
        codigo: null, desbloqueada: true, leida: false,
        siguiente: 'n2', desbloqueaMapa: null, final: false
      }
    },
    {
      id: 'n2', mapaId: 'zona-a', tipo: 'nota', nombre: 'Supply depot 1', x: 52, y: 60, atendida: false, ficha: null,
      nota: {
        // Texto del equipo (bitácora de Rick, traducida al inglés; ver HISTORIA.md)
        texto: "Log #2. When we arrived, we saw that the depot was completely abandoned. The doors were jammed from years without use, but luckily I found the control panel and got them open by hot-wiring it. Inside, we swapped the gas tanks in our suits and made some repairs.\n\n" +
          "At the back of the depot we found a vehicle: a pressurized rover, a version of NASA's Space Exploration Vehicle (SEV), the Moon and Mars rover prototype that NASA tested on the lava fields of Arizona. Thank God.\n\n" +
          "Getting ready went smoothly, until Juno finished the inventory and told us we only had enough power left for three hours. We'll have to find another depot soon to restock. We're about to leave. Our chances of survival look better and better. End of log #2.",
        ps: "P.S. Mikey's map only shows this area, but this depot's computer had the map of the next zone. Open the Devices tab, press Download on the New zone card, and then press Go to zone. The second depot is open, so you won't need a code. In the Devices tab you can also connect our rover and our drone and look through their cameras.",
        audio: 'audio/log-2.mp3',
        codigo: 'HOLLOW', desbloqueada: false, leida: false,
        siguiente: 'n3', desbloqueaMapa: 'd3', final: false
      }
    },
    {
      id: 'n3', mapaId: 'zona-b', tipo: 'nota', nombre: 'Supply depot 2', x: 23, y: 48, atendida: false, ficha: null,
      nota: {
        // Texto del equipo (bitácora de Rick, traducida al inglés; ver HISTORIA.md)
        texto: "Log #3. Even though we're not a field team, just researchers, seeing Mars from here is... breathtaking. Something I couldn't describe to anyone unless they saw it with their own eyes. Or maybe it's just scientist's bias, and I'm simply excited about the great achievement of reaching this planet.\n\n" +
          "Enough rambling: we reached the second depot. It still had electricity, because its solar panels were still working. Inside, we took three spare power packs and changed a wheel.\n\n" +
          "Laika also contacted orbital command to ask them to send help. They told us there is a base in a remote spot on the surface of Mars, but we'll have to wait a few days for them to reach us, and the depots aren't equipped to house so many people. The good news is that a few kilometers away there is another depot and a habitat. That depot holds the key to the habitat; without it, we couldn't even open the habitat, no matter how hard we tried to force it. I see a glimmer of hope. End of log #3.",
        ps: "P.S. Before you drive on, check the Vital room: click the Base on your map, or open the Vital room tab. It shows the temperature, the wind, the dust and the radiation, with numbers based on real data from NASA missions like InSight. If a dust storm or a marsquake hits, a red warning appears on every screen. The code for the third depot is MARSQUAKE.",
        audio: 'audio/log-3.mp3',
        codigo: null, desbloqueada: true, leida: false,
        siguiente: 'n4', desbloqueaMapa: null, final: false
      }
    },
    {
      id: 'n4', mapaId: 'zona-b', tipo: 'nota', nombre: 'Supply depot 3', x: 84, y: 25, atendida: false, ficha: null,
      nota: {
        // Texto del equipo (bitácoras 4 y 5 de Rick unidas, traducidas al inglés; ver HISTORIA.md)
        texto: "Log #4. We almost crashed. One of the rover's tires went flat, so we had to replace it with the spare, which took a while. On top of that, Mikey's suit got a small tear: something to keep in mind, because if we don't make it to the depot, the consequences could be serious.\n\n" +
          "We finally reached the depot. The electricity here was flickering and unstable. Luckily, there was oxygen and something to rivet Mikey's suit so it would hold until we reach the habitat. We split up to search: I took the office, Juno the tool area and Laika the vault. In the office I found a computer saying that the vault had a three-digit code: the code to open it and find the key to the habitat. I passed it to Laika over the intercom. We had it! All that was left was to head for the habitat.\n\n" +
          "That code just gave me an idea: I'll send an encrypted signal to each of the recorders I've been leaving behind, to protect the messages. That way, whoever finds the first recording will be able to unlock the others, one after another.\n\n" +
          "We finally reached the habitat. It has power and it's quite comfortable. It has an artificial gravity system that simulates Earth's gravity almost exactly, thanks to a rotating structure inside the building itself. I explored the place with Juno: we found a hydroponic farming area, the bunks where we would sleep, a dining room and an infirmary. It's a comfortable place; I think I could get used to it.\n\n" +
          "A few hours later, we were talking in the dining room when the lights went out. I ran to the fuse area and checked the connection panel: it said the solar panels had broken down and we had just switched to backup power. We only have power for a few hours, so we'll use it to send a message saying we're here, so they make us a priority.\n\n" +
          "Laika sent the message. They say the astronauts are already quite close, thanks to my notes. That makes me a little happier. So all that's left is to wait, and keep the faith. End of log #4.",
        ps: "P.S. The habitat's code is SOL14. A sol is one day on Mars. On the way, keep an eye on the crater: its slope is dangerous. If you find a new danger, press plus Alert and mark it on the map. If you choose High radiation, the radiation meter in the Helmet view will rise as your astronaut gets close to it. And in the Helmet view, press M to open the minimap.",
        audio: 'audio/log-4.mp3',
        codigo: 'MARSQUAKE', desbloqueada: false, leida: false,
        siguiente: 'n5', desbloqueaMapa: null, final: false
      }
    },
    {
      id: 'n5', mapaId: 'zona-b', tipo: 'nota', nombre: 'Habitat', x: 45, y: 83, atendida: false, ficha: null,
      nota: {
        // Mensaje final de Rick a quienes los rescatan (texto del equipo, traducido al inglés; ver HISTORIA.md)
        texto: "Log #5. I'm glad you were able to follow all my notes. Sorry about the encryption: it's just protocol and safety. Mikey, Laika, Juno and I owe you our lives. But enough talk. We have to go. We'll celebrate later. End of log #5.",
        ps: null,   // la bitácora 5 no lleva postdata: es entera del equipo
        audio: 'audio/log-5.mp3',
        codigo: 'SOL14', desbloqueada: false, leida: false,
        siguiente: null, desbloqueaMapa: null, final: true
      }
    }
  ],

  // rumbo: hacia dónde mira, en grados (0 = norte, 90 = este).
  // oxigeno: porcentaje de O₂ que le queda en el traje.
  // destinoId: el id del marcador al que camina (null = está quieto).
  // lugarId: el id del marcador donde está ahora (null = en la base).
  // destinoElegido: lo que está elegido en su menú de destino (bloque 7).
  // Empiezan en la base de la zona A.
  astronautas: [
    { id: 'a1', nombre: 'Vega', x: 12, y: 80, rumbo: 0, oxigeno: 100,
      destinoId: null, lugarId: null, destinoElegido: null },
    { id: 'a2', nombre: 'Ríos', x: 12, y: 85, rumbo: 0, oxigeno: 86,
      destinoId: null, lugarId: null, destinoElegido: null }
  ],

  // tipo: 'rover', 'dron' o 'mapa'. imagen: el dibujo de su tarjeta.
  // fases: los dos mensajes de la barra de carga (bloque 10).
  // El de tipo 'mapa' es la ZONA NUEVA: se "conecta" como un dispositivo y al terminar
  // su mapa (mapaId) queda descargado. No sale en el mapa ni tiene cámara.
  dispositivos: [
    {
      id: 'd1', tipo: 'rover', nombre: 'Rover R-1', camara: 'Navigation camera',
      imagen: 'img/rover.svg', x: 21, y: 80, rumbo: 90,
      fases: ['Scanning device…', 'Installing navigation system…'],
      conectado: false, conectando: false, progreso: 0, mensaje: ''
    },
    {
      id: 'd2', tipo: 'dron', nombre: 'Drone D-1', camara: 'Bottom camera',
      imagen: 'img/dron.svg', x: 21, y: 85, rumbo: 0,
      fases: ['Scanning device…', 'Installing navigation system…'],
      conectado: false, conectando: false, progreso: 0, mensaje: ''
    },
    {
      id: 'd3', tipo: 'mapa', nombre: 'New zone', camara: 'HiRISE map of the landing zone (2018)',
      imagen: 'img/mapa-insight-2018-mini.jpg', mapaId: 'zona-b', x: 0, y: 0, rumbo: 0,
      fases: ['Searching for the MRO orbiter signal…', 'Downloading the new zone map…'],
      bloqueado: true,   // historia: no se puede descargar hasta leer la nota de la Base abandonada 2
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
// BLOQUE 4 · FUNCIONES DE LOS MAPAS
// =========================================================

function buscarMapa(id) {
  return estado.mapas.find(m => m.id === id);
}

// El mapa que se está usando ahora
function mapaActual() {
  return buscarMapa(estado.mapaActivo);
}

// Cuántos metros hay en 1 punto de porcentaje DEL MAPA ACTUAL.
// Ejemplo en la zona A: 339 m / 100 = 3,39 m por cada punto en horizontal.
function metrosPorPuntoX() {
  return mapaActual().anchoMetros / 100;
}
function metrosPorPuntoY() {
  return mapaActual().altoMetros / 100;
}

// Solo los marcadores del mapa actual (cada marcador sabe su mapaId)
function marcadoresDelMapa() {
  return estado.marcadores.filter(m => m.mapaId === estado.mapaActivo);
}

// Lleva al equipo a otra zona: astronautas y dispositivos aparecen en su base
function cambiarMapa(id) {
  estado.mapaActivo = id;
  estado.modoMarcador = null;
  estado.marcadorSeleccionado = null;
  estado.notaAbierta = null;

  const base = mapaActual().base;

  // Los astronautas, uno debajo del otro (5 puntos de separación) para que
  // sus nombres no se pisen, y quietos
  for (let i = 0; i < estado.astronautas.length; i++) {
    const astronauta = estado.astronautas[i];
    astronauta.x = base.x;
    astronauta.y = base.y + i * 5;
    astronauta.destinoId = null;
    astronauta.lugarId = null;
    astronauta.destinoElegido = null;
  }

  // Los dispositivos (menos el mapa, que no es una máquina), en otra columna a la derecha
  const maquinas = estado.dispositivos.filter(d => d.tipo !== 'mapa');
  for (let i = 0; i < maquinas.length; i++) {
    maquinas[i].x = base.x + 9;
    maquinas[i].y = base.y + i * 5;
  }

  estado.vista = 'control';
  dibujar();
}

// =========================================================
// BLOQUE 3 · MATEMÁTICA DE NAVEGACIÓN
// "desde" y "hasta" son cualquier cosa con x e y en porcentaje:
// un astronauta, un marcador, un dispositivo...
//
// Cuidado con el eje y: en la pantalla, y CRECE HACIA ABAJO.
// Abajo del mapa es el sur y arriba es el norte.
// =========================================================

// 3.1 Distancia en metros entre dos puntos (teorema de Pitágoras)
function distanciaEnMetros(desde, hasta) {
  // Pasamos la diferencia de porcentaje a metros en cada eje.
  // Hay que hacerlo ANTES de Pitágoras porque el mapa no es cuadrado:
  // 1 % de ancho no mide lo mismo que 1 % de alto (zona A: 3,39 m y 2,99 m).
  const metrosX = (hasta.x - desde.x) * metrosPorPuntoX();
  const metrosY = (hasta.y - desde.y) * metrosPorPuntoY();

  // Hipotenusa = raíz cuadrada de (a² + b²)
  return Math.sqrt(metrosX * metrosX + metrosY * metrosY);
}

// 3.2 Deja cualquier ángulo entre 0 y 360 (sin llegar a 360).
// Ejemplos: -10 → 350,  370 → 10,  720 → 0.
function normalizarAngulo(grados) {
  while (grados < 0) {
    grados = grados + 360;
  }
  while (grados >= 360) {
    grados = grados - 360;
  }
  return grados;
}

// 3.3 Rumbo para ir de "desde" a "hasta", como en una brújula:
// 0 = norte, 90 = este, 180 = sur, 270 = oeste.
function anguloHacia(desde, hasta) {
  // Cuántos metros hay que ir hacia el este (positivo) o el oeste (negativo)
  const haciaEste = (hasta.x - desde.x) * metrosPorPuntoX();
  // Cuántos metros hacia el norte. Va al revés (desde − hasta)
  // porque en la pantalla y crece hacia abajo, o sea, hacia el sur.
  const haciaNorte = (desde.y - hasta.y) * metrosPorPuntoY();

  // Math.atan2 devuelve el ángulo en radianes.
  // En clase de mates el ángulo se mide desde el este y girando a la izquierda,
  // pero la brújula lo mide desde el norte y girando a la derecha.
  // Por eso le pasamos (este, norte) en vez del orden normal (y, x).
  const radianes = Math.atan2(haciaEste, haciaNorte);

  // Radianes → grados: una vuelta son 2π radianes o 360 grados
  const grados = radianes * 180 / Math.PI;

  // atan2 puede dar números negativos (por ejemplo, -90 para el oeste)
  return normalizarAngulo(grados);
}

// 3.4 Distancia bonita para la pantalla: "850 m" o "1.2 km" (en inglés el decimal va con punto)
function formatearDistancia(metros) {
  const redondeado = Math.round(metros);
  if (redondeado < 1000) {
    return redondeado + ' m';
  }
  // toFixed(1) deja un decimal ("1.2"), que es como se escribe en inglés
  const kilometros = (metros / 1000).toFixed(1);
  return kilometros + ' km';
}

// 3.5 Cambia los símbolos peligrosos por sus códigos de HTML.
// Así, si alguien llama a un marcador "<b>Base</b>", se ve el texto tal cual
// y no se rompe la página. Se usa siempre que metemos un nombre en el HTML.
function textoSeguro(texto) {
  return String(texto)
    .replaceAll('&', '&amp;')   // el & va PRIMERO: los otros códigos también llevan &
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// 3.6 PRUEBAS · Escríbelas en la consola del navegador (F12 › Console).
// Las de la lista usaban un mapa de prueba de 4000 × 2500 m. Con el mapa real
// (zona A: 339 × 299 m) las distancias cambian, pero los ángulos y formatos no:
//   anguloHacia({x: 50, y: 50}, {x: 50, y: 40})    → 0
//   anguloHacia({x: 50, y: 50}, {x: 60, y: 50})    → 90
//   distanciaEnMetros({x: 0, y: 0}, {x: 10, y: 0}) → 33,9 (era 400 con el mapa de prueba)
//   formatearDistancia(1240)                       → "1.2 km" (la página está en inglés)
//   normalizarAngulo(-10)                          → 350

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
  } else if (estado.vista === 'vital') {
    dibujarSalaVital();             // vital.js
  }

  // 4) Historia: la ventana de la nota sale encima de cualquier vista
  dibujarVentanaNota();             // historia.js

  // 5) Sala vital: la barra roja de aviso, si hay una amenaza, en todas las vistas
  dibujarAvisoAmenaza();            // vital.js
}

// Conecta cada pestaña con su vista.
// pestana.dataset.vista lee el atributo data-vista="..." del HTML.
function prepararPestanas() {
  const pestanas = document.querySelectorAll('.pestana');
  for (const pestana of pestanas) {
    pestana.addEventListener('click', function () {
      if (pestana.dataset.vista === 'pov') {
        // Bloque 11.3: la pestaña del casco abre el casco del último astronauta que se vio.
        // (Si lo último fue la cámara del rover, igualmente abre un CASCO, como dice la pestaña.)
        verCamara(estado.ultimoCasco);
      } else {
        cambiarVista(pestana.dataset.vista);
      }
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

  // 7.5 Los astronautas dan un paso cada TIEMPO_ENTRE_PASOS (50 ms)
  setInterval(moverAstronautas, TIEMPO_ENTRE_PASOS);   // mapa.js

  // Bloque 4: si cambia el tamaño de la ventana, el mapa se vuelve a ajustar
  window.addEventListener('resize', dibujar);

  dibujar();
}

// DOMContentLoaded ocurre cuando el HTML y LOS 4 SCRIPTS ya se cargaron.
// Esperamos a ese momento porque iniciar() usa funciones de mapa.js y casco.js,
// que se cargan DESPUÉS de este archivo.
document.addEventListener('DOMContentLoaded', iniciar);
