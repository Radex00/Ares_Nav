# FUENTES · ARES NAV

Registro de **todos los datos y recursos externos** que usa el proyecto (regla del equipo, bloque 4.2).
Todas las páginas se consultaron el **14 y el 15 de noviembre de 2026**.
Este registro se preparó con ayuda de IA (Claude, de Anthropic); el equipo de Datos debe revisarlo antes de la entrega.
Versión en inglés (para los jueces): `SOURCES.md`, con la misma numeración. Si cambiáis algo aquí, cambiadlo también allí.

---

## 1. Cómo poner las fuentes en el escrito (guía)

**a) En el texto: un número entre corchetes** al final de la frase que tiene el dato.

> Los orbitadores Viking enviaron 52 663 imágenes de Marte **[2]**.

- Se numera en el orden en que aparece cada fuente por primera vez.
- Si una frase usa dos fuentes: **[2, 3]**.
- Las opiniones o conclusiones del propio equipo no llevan número.

**b) Al final: una lista "Referencias"** (en inglés, "References") con los mismos números.

**c) Formato de cada tipo de fuente** (en inglés, porque la entrega es en inglés):

| Tipo | Formato | Ejemplo |
|---|---|---|
| Página web de NASA | Organización. (Año o n.d.). *Título de la página*. URL (accessed 14 Nov 2026) | NASA Science. (n.d.). *Viking 1*. https://science.nasa.gov/mission/viking-1/ (accessed 14 Nov 2026) |
| Noticia | Organización. (Año, mes día). *Título*. URL | NASA/JPL. (2022, December 21). *NASA Retires InSight Mars Lander Mission After Years of Science*. https://www.jpl.nasa.gov/news/... |
| Imagen | Crédito exacto. (Año). *Título* (número PIA o ID) [Image]. Misión, instrumento. URL | NASA/JPL-Caltech/UArizona. (2024). *HiRISE Studies the Dust on InSight* (PIA26515) [Image]. Mars Reconnaissance Orbiter, HiRISE. https://science.nasa.gov/photojournal/hirise-studies-the-dust-on-insight/ |
| Artículo científico | Apellido, Inicial., ... et al. (Año). Título. *Revista*, volumen, número de artículo. DOI | Golombek, M., Warner, N. H., Grant, J. A., et al. (2020). Geology of the InSight landing site on Mars. *Nature Communications*, 11, 1014. https://doi.org/10.1038/s41467-020-14679-1 |

**d) Reglas importantes**

1. **El crédito de una imagen se copia exacto**, por ejemplo "NASA/JPL-Caltech/University of Arizona", y va junto a la imagen o en su pie.
2. **Nunca se usa el logo de NASA** ni nada que haga pensar que NASA patrocina el proyecto.
3. **Las imágenes hechas con IA llevan la marca "AI-generated"** y se nombran en la sección 6 de este archivo.
4. **Se explica con palabras propias.** Si se copia una frase, va entre comillas y con su número.
5. **Si dos fuentes no coinciden, se dice.** Hay un ejemplo real en la sección 2 (fotos de los módulos Viking).

---

## 2. Referencias del escrito del equipo (texto de 4 secciones)

Comprobé cada dato contra la fuente oficial. Pon el número al final de la frase indicada.

| Sección y frase del escrito | Lleva | ¿Lo dice la fuente? |
|---|---|---|
| 1. "Pathfinder utilizó instrumentos para estudiar la composición de las rocas, el suelo, el clima y la atmósfera" | [1] | Sí: instrumentos para analizar la atmósfera, el clima, la geología y la composición de rocas y suelo |
| 1. "Marte pudo haber sido un planeta cálido y húmedo en el pasado" | [1] | Sí: los resultados sugieren que Marte fue cálido y húmedo en el pasado |
| 2. "52 663 imágenes", "97 % de la superficie", "300 metros" | [2] | Sí, **pero** la fuente dice que esas imágenes las enviaron **los dos orbitadores** (no "ambas sondas" en general) |
| 2. "4500 fotografías de sus lugares de exploración" | [2] | Sí: 4500 fotos de los módulos de aterrizaje. **Ojo:** otra página oficial dice "más de 1400 imágenes" de los dos lugares [3]. Las fuentes no coinciden: usad [2] y, si queréis, comentadlo |
| 3. Pathfinder y Sojourner estudiaron rocas y suelo | [1] | Sí |
| 3. Spirit y Opportunity investigaron la historia geológica y las condiciones antiguas | [4] | Sí: ayudaron a cambiar lo que sabemos de la historia antigua de Marte; su objetivo era buscar señales de agua en el pasado |
| 3. InSight estudió el interior con investigaciones sísmicas | [5] | Sí: estudió el interior profundo de Marte (su nombre incluye "Seismic Investigations") |
| 4. Importancia de los mapas | sin número | Es la conclusión del equipo. Si queréis un ejemplo con fuente: vigilar cómo cambia el polvo ayuda a calcular la edad de los cráteres [7] |

**Lista de referencias para el escrito:**

1. NASA Science. (n.d.). *Mars Pathfinder*. https://science.nasa.gov/mission/mars-pathfinder/ (accessed 14 Nov 2026)
2. NASA Science. (n.d.). *Viking 1*. https://science.nasa.gov/mission/viking-1/ (accessed 14 Nov 2026)
3. NASA Space Science Data Coordinated Archive. (n.d.). *Viking Project Information*. https://nssdc.gsfc.nasa.gov/planetary/viking.html (accessed 14 Nov 2026)
4. NASA Science. (n.d.). *Mars Exploration Rovers: Spirit and Opportunity*. https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/ (accessed 14 Nov 2026)
5. NASA Science. (n.d.). *InSight Lander*. https://science.nasa.gov/mission/insight/ (accessed 14 Nov 2026)

---

## 3. Imágenes de NASA que usa la página

| Archivo en `img/` | Qué es | Misión / instrumento | Crédito | Enlace | Cambios hechos |
|---|---|---|---|---|---|
| `mapa-insight-2024.jpg` | Mapa de la **zona A**: InSight el 23 oct 2024, con el polvo encima | Mars Reconnaissance Orbiter / HiRISE · PIA26515 | NASA/JPL-Caltech/UArizona (*) | [7] | Ninguno: la imagen JPEG oficial tal cual |
| `mapa-insight-2018.jpg` | Mapa de la **zona nueva**: InSight, escudo térmico, y escudo trasero con paracaídas, el 11 dic 2018 | Mars Reconnaissance Orbiter / HiRISE · ESP_058005_1845 | NASA/JPL-Caltech/UArizona | [8] | Recortamos el panel grande de la imagen "labels" y quitamos los 3 recuadros de la izquierda |
| `mapa-insight-2018-mini.jpg` | Miniatura del mapa anterior para la tarjeta "Zona nueva" | Igual que el anterior | NASA/JPL-Caltech/UArizona | [8] | Reducida a 300 px de ancho |
| `horizonte-insight.jpg` | **Horizonte de la vista del casco** (tarea 4.6): panorama de 290° tomado por InSight el 9 dic 2018 (sol 14), con el borde de Homestead hollow y un panel solar del aterrizador | InSight / Instrument Deployment Camera (IDC) · PIA23136 | NASA/JPL-Caltech | [13] | Ver la sección 5: recorte de bordes negros, relleno de los 79° que faltan (marcado en la imagen), bordes difuminados y reducida al 70 % |

**Uso permitido:** el equipo de HiRISE dice que sus imágenes son de **dominio público** y pide poner el crédito "NASA/JPL-Caltech/UArizona" [8].

(*) La página de PIA26515 no muestra línea de crédito, y el número PIA26515 solo sale en el nombre del archivo oficial (`PIA26515.jpg`). Por eso usamos el crédito que pide HiRISE para todas sus imágenes.

---

## 4. Otras fuentes de los datos de la página

6. NASA/JPL. (2022, December 21). *NASA Retires InSight Mars Lander Mission After Years of Science*. https://www.jpl.nasa.gov/news/nasa-retires-insight-mars-lander-mission-after-years-of-science/
   → Última comunicación el 15 dic 2022; el polvo en los paneles solares; 1319 sismos marcianos.
7. NASA/JPL-Caltech/UArizona. (2024). *HiRISE Studies the Dust on InSight* (PIA26515) [Image]. Mars Reconnaissance Orbiter, HiRISE. https://science.nasa.gov/photojournal/hirise-studies-the-dust-on-insight/
   → Mapa de la zona A; el halo de los retrocohetes se borra con el tiempo; las rayas oscuras son huellas de remolinos de polvo; el polvo ayuda a fechar cráteres.
8. NASA/JPL-Caltech/UArizona. (2018). *InSight Lander on Mars* (ESP_058005_1845) [Image]. HiRISE. https://www.uahirise.org/ESP_058005_1845
   → Mapa de la zona nueva; fecha de aterrizaje (26 nov 2018); escudo térmico (arriba a la derecha), escudo trasero con paracaídas (abajo a la izquierda), posible huella de remolino; InSight mide unos 6 m con los paneles abiertos; 25 cm/píxel y norte arriba.
9. NASA/JPL-Caltech/University of Arizona. (2018). *InSight on Mars, As Seen by HiRISE* (PIA22875) [Image]. https://science.nasa.gov/photojournal/insight-on-mars-as-seen-by-hirise/
   → El suelo alrededor del aterrizador está oscuro por los retrocohetes.
10. Golombek, M., Warner, N. H., Grant, J. A., et al. (2020). Geology of the InSight landing site on Mars. *Nature Communications*, 11, 1014. https://doi.org/10.1038/s41467-020-14679-1
    → Posición de InSight (4,502° N, 135,623° E); Homestead hollow (cráter erosionado de unos 27 m); suelo de arena con gránulos y guijarros y pocas rocas; capas: polvo, arena suelta, duricostra y arena con rocas; regolito de 3 a 18 m sobre coladas de lava de basalto; terreno algo más rocoso al oeste; cráteres pequeños comunes; los retrocohetes quitaron el polvo y oscurecieron el suelo.
11. NASA Space Science Data Coordinated Archive. (n.d.). *Mars Fact Sheet*. https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html
    → Radio medio de Marte (3389,5 km), para calcular las coordenadas aproximadas.
12. NASA Space Apps Challenge. (2026). *Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars*. https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/
    → Enunciado y recursos del reto.
13. NASA/JPL-Caltech. (2019). *InSight Sol 14 Panorama* (PIA23136) [Image]. InSight, Instrument Deployment Camera. https://science.nasa.gov/photojournal/insight-sol-14-panorama
    → Horizonte del casco. Panorama de 290° hecho con 30 imágenes de la cámara del brazo, el 9 dic 2018; muestra el borde de Homestead hollow. Descarga original: PNG de 6446 × 962 px.
14. NASA/JPL. (2019, February 19). *InSight Is the Newest Mars Weather Service*. https://www.jpl.nasa.gov/news/news.php?feature=7337
    → Sala de control vital: temperatura de referencia en el sitio de InSight (máxima −17 °C, mínima −95 °C) y viento de hasta 16,9 m/s.
15. NASA/JPL. (2018). *Opportunity Hunkers Down During Dust Storm*. https://www.jpl.nasa.gov/news/opportunity-hunkers-down-during-dust-storm/
    → Sala de control vital: opacidad del polvo (τ) normal ≈ 0,5; en la tormenta de 2018, τ 10,8.
16. NASA Science. (2013, December 9). *Radiation Measurements on Mars* (PIA17600). https://science.nasa.gov/resource/radiation-measurements-on-mars/
    → Sala de control vital: dosis de radiación de rayos cósmicos en la superficie, unos 210 µGy al día (Curiosity, RAD).
17. NASA/JPL. (2022). *NASA's InSight Records Monster Quake on Mars*. https://www.jpl.nasa.gov/news/nasas-insight-records-monster-quake-on-mars/
    → Sala de control vital: el mayor sismo registrado por InSight, de magnitud ~5, el 4 de mayo de 2022.
18. NASA. (n.d.). *Rovers* (Johnson Space Center). https://www.nasa.gov/reference/jsc-rovers/
    → Historia (bitácora 2): el Space Exploration Vehicle (SEV) es un prototipo de róver presurizado para la Luna y Marte, probado en los campos de lava de Black Point (Arizona) en Desert RATS (2008 y 2022).

La Sala de control vital usa también la *Mars Fact Sheet* [11]: presión media de 636 Pa (400-870 Pa según la estación) y viento de 2-10 m/s normal y 17-30 m/s en tormentas de polvo (sitios Viking).

---

## 5. Datos calculados por el equipo (y cómo)

Estos números no vienen escritos en ninguna fuente: los calculamos nosotros con datos de las fuentes.

| Dato | Cómo se calculó |
|---|---|
| Escala de la zona A: 0,306 m/píxel, **339 × 299 m** | Barra de escala de PIA26515: 20 m = 65,3 píxeles. 1106 × 977 píxeles × 0,306 |
| Escala de la zona nueva: 0,562 m/píxel, **635 × 719 m** | Barra de escala de "100 m" = 178 píxeles. 1131 × 1280 píxeles × 0,562 |
| Posición de cada marcador (en %) | Píxel del objeto en la imagen ÷ tamaño de la imagen × 100. Los objetos turquesa (InSight, escudos) se localizaron por su color |
| Coordenadas aproximadas de cada zona | Desde InSight (4,502° N, 135,623° E) [10], moviéndose con la escala. En Marte, 1° de latitud ≈ 59,16 km (radio 3389,5 km [11]). Se supone el norte arriba, como en las imágenes de HiRISE proyectadas [8] |
| Cráter de la zona nueva: unos 50-60 m | Medido sobre la imagen con la escala |
| Peligros "Terreno más rocoso" y "Cráter (pendiente)" | Los datos del terreno vienen de [10] y [8]; tratarlos como **peligro** es una decisión de la simulación, y así lo dice su ficha |
| Horizonte de 360° a partir del panorama de 290° [13] | 6446 px ÷ 290° = 22,2 px por grado. Quitamos los bordes negros y blancos (sin datos), y quedan 6246 px = **281°** de foto real. Los **79°** que faltan se rellenaron mezclando los dos bordes en espejo, para que la tira se una sin corte; ese tramo lleva escrito "NO PHOTO IN THIS DIRECTION" (la página está en inglés). Los bordes de arriba y abajo se difuminan hacia el color del cielo y del suelo de la propia foto |
| Lecturas de la Sala de control vital | **Simuladas**: se mueven al azar alrededor de los valores reales de [11], [14], [15], [16] y [17]. La temperatura sube y baja como en un día de InSight, pero un "sol" dura 4 minutos. Los umbrales verde / naranja / rojo y los 3 eventos (tormenta de polvo, tormenta solar, sismo) son decisiones de la simulación; en la página se indica "(simulation)" |
| Orientación del horizonte | **No está calibrada:** la fuente no dice hacia dónde miraba la cámara. El paisaje es decorativo; los puntos flotantes y la brújula sí usan los rumbos reales del mapa |

---

## 6. Imágenes hechas con IA (todas llevan la marca "AI-generated")

| Archivo | Qué es | Hecho con |
|---|---|---|
| `img/rover.svg` | Dibujo del rover R-1 | Claude (Anthropic) |
| `img/dron.svg` | Dibujo del dron D-1 | Claude (Anthropic) |

Hasta la tarea 4.6 se usó un horizonte provisional dibujado con IA (`img/horizonte-provisional.svg`, con su marca). Se cambió por el panorama real de InSight [13] y ya no está en el proyecto (queda en el historial de Git).

---

## 7. Herramientas

- **Claude Opus 5.5 (Anthropic), usado desde Claude Code:** ayuda para escribir el código y para buscar y comprobar fuentes. También dibujó el rover y el dron (sección 6). Cada archivo de código empieza con un comentario que lo dice. También corrigió la ortografía de las bitácoras del equipo y las tradujo al inglés (los textos son del equipo; ver `HISTORIA.md`).
- **Python con la librería Pillow:** edición de imágenes. Recorte del mapa de HiRISE de 2018, su miniatura y el horizonte de 360° a partir del panorama de InSight (ver secciones 3 y 5).
- **Google Chrome (modo headless):** pruebas automáticas. Carga la página sin ventana y comprueba que todo funcione, también en tres tamaños de pantalla.
- **GitHub y GitHub Pages:** el código se guarda en GitHub y la página se publica con GitHub Pages.
- **Sin librerías externas:** HTML, CSS y JavaScript escritos a mano. Las letras son fuentes que ya vienen en el ordenador (Consolas, Segoe UI).
