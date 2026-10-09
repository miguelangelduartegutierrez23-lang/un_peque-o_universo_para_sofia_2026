# Sofi ✦ Un Pequeño Universo (Edición Profesional)

Una experiencia web interactiva, responsiva y estática desarrollada con **HTML5 semántico, CSS3 moderno y Vanilla JavaScript** (sin dependencias ni frameworks pesados).

---

## 🌟 Concepto y Propósito

El proyecto está inspirado en los misterios del cosmos, las constelaciones y los pequeños descubrimientos. Fue concebido como un detalle digital creativo: una expedición relajada, visualmente envolvente y con toques de humor y curiosidad cósmica, diseñada para ser explorada con total libertad, sin presiones sentimentales ni expectativas forzadas.

---

## 🚀 Cómo Ejecutar el Proyecto

1. **Abrir directamente:**
   - Haz doble clic en el archivo `index.html` para abrirlo en cualquier navegador moderno (Google Chrome, Firefox, Microsoft Edge, Safari o navegadores móviles Android/iOS).
2. **Con servidor local (Recomendado para desarrollo):**
   - Si utilizas Visual Studio Code, haz clic derecho en `index.html` y selecciona **Open with Live Server**.
   - O usando Python desde la terminal:
     ```bash
     python3 -m http.server 8080
     ```
     Y abre `http://localhost:8080` en tu navegador.

---

## 📁 Estructura del Proyecto

```text
sofi_un_pequeno_universo/
├── index.html                  # Estructura semántica, accesible y enriquecida
├── styles.css                  # Sistema de diseño cósmico, Glassmorphism, 3D flips y responsive
├── app.js                      # Lógica interactiva, canvas de estrellas, reproductor y juegos
├── README.md                   # Esta documentación completa
└── assets/
    ├── audio/
    │   └── cosmic-lofi.wav     # Pista ambiental lofi original libre de derechos
    └── illustrations/
        ├── gravity.svg         # Ilustración de atracción gravitacional
        ├── aurora.svg          # Ilustración de auroras y luces del vacío
        ├── orbital-pause.svg   # Ilustración de estación orbital y pausa estelar
        ├── supernova.svg       # Carta del memorama: Supernova
        ├── satellite.svg       # Carta del memorama: Satélite
        ├── comet.svg           # Carta del memorama: Cometa
        ├── eclipse.svg         # Carta del memorama: Eclipse
        ├── telescope.svg       # Carta del memorama: Telescopio
        ├── astronaut.svg       # Carta del memorama: Astronauta
        └── secret-constellation.svg # Constelación dorada del telescopio secreto
```

---

## ✨ Funcionalidades Implementadas

1. **Fondo de Polvo Cósmico Interactivo (Canvas):**
   - 120 estrellas con profundidad, parpadeo y gravedad sutil al pasar el cursor o tocar la pantalla.
   - Generación periódica de estrellas fugaces realistas.
2. **Bienvenida & Planeta 3D Volumétrico:**
   - Planeta estilizado con atmósfera difusa, sombra terminadora, anillos orbitales luminosos y satélite en órbita continua.
3. **Mapa Estelar Interactivo:**
   - Constelación con líneas estelares conectadas y seguimiento en tiempo real del progreso de exploración (0 a 5 sectores).
4. **Sector 01 · Archivos del Cosmos:**
   - 3 tarjetas con ilustraciones SVG originales sobre física y astronomía con reflexiones reflexivas y respetuosas.
5. **Sector 02 · Órbita Sonora Funcional:**
   - Reproductor con vinilo giratorio, pista lofi ambiental relajante incluida (`cosmic-lofi.wav`), barra interactiva de progreso (seekable), control de volumen y tiempo transcurrido.
   - **Generador de Viento Cósmico:** Sintetizador ambiental en tiempo real usando la **Web Audio API** (cero archivos externos requeridos).
6. **Sector 03 · Desafíos Cósmicos (Juegos):**
   - **Trivia Espacial:** 4 preguntas científicas con sentido del humor, puntaje en vivo, retroalimentación formativa y medalla final.
   - **Memorama 3D:** Tablero de 12 cartas con efecto *flip* 3D real, 6 parejas temáticas espaciales en SVG, contador de movimientos y validación de victoria.
7. **Sector 04 · Sintonizador Estelar (Oráculo Cósmico):**
   - Esfera holográfica con animación de escaneo de radiofrecuencias que entrega mensajes diarios de buen ánimo y simpatía.
8. **Sector 05 · El Telescopio Secreto (Easter Egg):**
   - 3 destellos dorados ocultos en la portada, el reproductor y el sintonizador.
   - Al encontrar los 3 (o activar el permiso de observadora), se desbloquea una constelación especial y una dedicatoria sincera de Miguel Ángel.
9. **Cierre de Expedición:**
   - Botón interactivo para "Lanzar un deseo al cosmos" con confirmación estelar.
10. **Accesibilidad & Responsive:**
    - Modo de reducción de movimiento (`prefers-reduced-motion` y botón manual).
    - Modo de matiz ambiental.
    - Soporte completo para pantallas táctiles y móviles estrechos (sin desbordamiento horizontal).

---

## 🛠️ Personalización

### Cambiar Textos y Mensajes
- Para modificar la dedicatoria secreta, edita el bloque `#secretUnlockedState` en `index.html`.
- Para agregar o editar frases en el sintonizador diario, modifica el arreglo `quotes` dentro de `initOracleResonator()` en `app.js`.

### Cambiar o Agregar Música
- Coloca cualquier archivo de audio en formato `.mp3`, `.wav` u `.ogg` dentro de `assets/audio/`.
- Actualiza la etiqueta `<audio id="audioPlayer" src="assets/audio/tu-cancion.mp3">` en `index.html`.
- *(Nota de seguridad y respeto:* Utiliza siempre archivos con licencia libre o autorizados).

---

## 🧪 Pruebas Realizadas

- [x] Navegación y anclas entre las 5 constelaciones y sectores.
- [x] Renderizado responsivo verificado en pantallas móviles (<400px) y escritorio (>1200px).
- [x] Reproducción de audio y control de volumen.
- [x] Sintetizador Web Audio API de viento cósmico.
- [x] Funcionamiento y bloqueo de trampas en el Memorama 3D.
- [x] Lógica de preguntas, puntuación y reinicio de la Trivia.
- [x] Detección de los 3 destellos secretos y desbloqueo del telescopio.
- [x] Respeto a las directivas de accesibilidad y movimiento reducido.
