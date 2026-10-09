/**
 * SOFI ✦ UN PEQUEÑO UNIVERSO
 * Frontend Interactivo & Experiencia Cósmica
 * Vanilla JavaScript Modular, Accesible & Performante
 */

// Helper Selectors
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// --- STATE MANAGEMENT ---
const state = {
  visitedSectors: new Set(),
  totalSectors: 5,
  secretStarsFound: new Set(),
  totalSecrets: 3,
  isAudioPlaying: false,
  isSynthPlaying: false,
  synthAudioCtx: null,
  synthGainNode: null,
  synthSource: null
};

// --- INITIALIZATION ON DOM READY ---
document.addEventListener("DOMContentLoaded", () => {
  initCosmicCanvas();
  initNavigationAndProgress();
  initModals();
  initAudioPlayer();
  initTriviaGame();
  initMemoryGame();
  initOracleResonator();
  initSecretStars();
  initEndingWish();
  initAccessibilityControls();
  initCustomStarSection();
  initSmallDetailsSection();
  initPlanetBuddySection();
  initWishesSection();
  initCosmicCursor();
  initTelemetry();
});

// ==========================================
// 1. COSMIC INTERACTIVE CANVAS (STARS & GRAVITY)
// ==========================================
function initCosmicCanvas() {
  const canvas = $("#starCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let width, height;
  let mouse = { x: -1000, y: -1000, radius: 100 };
  let shootingStar = null;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // Track mouse/touch for gravity field
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });

  // Generate 110 background stars
  const starCount = Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / 9000));
  const stars = [];
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      baseX: 0,
      baseY: 0,
      size: Math.random() * 1.8 + 0.6,
      opacity: Math.random() * 0.7 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
      color: Math.random() > 0.3 ? "#ffffff" : (Math.random() > 0.5 ? "#c4b5fd" : "#7dd3fc")
    });
  }

  // Periodic Shooting Star
  function triggerShootingStar() {
    if (document.body.classList.contains("reduce-motion")) return;
    shootingStar = {
      x: Math.random() * (width * 0.7),
      y: Math.random() * (height * 0.4),
      length: Math.random() * 80 + 60,
      speed: Math.random() * 9 + 8,
      angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
      opacity: 1
    };
    const nextInterval = Math.random() * 14000 + 10000;
    setTimeout(triggerShootingStar, nextInterval);
  }
  setTimeout(triggerShootingStar, 4000);

  // Hyperspace warp state (Button / Navigation jump)
  let warpActive = false;
  let warpStartTime = 0;
  const WARP_DURATION = 800;

  window.triggerCosmicWarp = function() {
    if (document.body.classList.contains("reduce-motion")) return;
    warpActive = true;
    warpStartTime = performance.now();
    document.body.classList.add("hyperspace-active");
    setTimeout(() => {
      warpActive = false;
      document.body.classList.remove("hyperspace-active");
    }, WARP_DURATION);
  };

  // Scroll warp state (Touch swipe on mobile & wheel/trackpad scroll on desktop)
  let lastScrollY = window.scrollY || 0;
  let scrollWarpTarget = 0;
  let scrollWarp = 0;
  let scrollTimer = null;
  let scrollDirection = 0;

  window.addEventListener("scroll", () => {
    if (document.body.classList.contains("reduce-motion")) return;
    const currentY = window.scrollY || 0;
    const rawDelta = currentY - lastScrollY;
    const deltaY = Math.abs(rawDelta);
    lastScrollY = currentY;

    if (deltaY > 1.5) {
      scrollDirection = rawDelta > 0 ? 1 : -1;
      const intensity = Math.min(deltaY / 48, 0.9);
      if (intensity > scrollWarpTarget) {
        scrollWarpTarget = intensity;
      }
    }

    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      scrollWarpTarget = 0;
    }, 75);
  }, { passive: true });

  // Render loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Smooth lerp decay for natural inertia when scrolling stops
    scrollWarp += (scrollWarpTarget - scrollWarp) * 0.16;
    if (scrollWarp < 0.008) scrollWarp = 0;

    let currentWarp = 0;
    if (warpActive) {
      const elapsed = performance.now() - warpStartTime;
      const progress = Math.min(elapsed / WARP_DURATION, 1);
      currentWarp = Math.sin(progress * Math.PI);
    }

    const combinedWarp = Math.min(1, Math.max(currentWarp, scrollWarp));

    // Dynamic nebula response while moving
    if (combinedWarp > 0.28) {
      document.body.classList.add("hyperspace-active");
    } else if (!warpActive) {
      document.body.classList.remove("hyperspace-active");
    }

    const cx = width / 2;
    const cy = height / 2;

    // Draw and update stars
    for (const s of stars) {
      // Twinkle
      s.opacity += s.twinkleSpeed * s.twinkleDir;
      if (s.opacity > 0.95) { s.opacity = 0.95; s.twinkleDir = -1; }
      else if (s.opacity < 0.25) { s.opacity = 0.25; s.twinkleDir = 1; }

      // Subtle mouse gravity displacement
      const dx = mouse.x - s.x;
      const dy = mouse.y - s.y;
      const dist = Math.hypot(dx, dy);
      let renderX = s.x;
      let renderY = s.y;

      if (dist < mouse.radius && !document.body.classList.contains("reduce-motion")) {
        const force = (mouse.radius - dist) / mouse.radius;
        renderX -= (dx / dist) * force * 15;
        renderY -= (dy / dist) * force * 15;
      }

      if (combinedWarp > 0.02) {
        // Hyperspace velocity streaks emanating from center + directional drift
        const dxCenter = renderX - cx;
        const dyCenter = renderY - cy;
        const distCenter = Math.hypot(dxCenter, dyCenter) || 1;
        const streakLen = (distCenter / (cx * 0.75)) * 48 * combinedWarp;
        const verticalDrift = scrollWarp * scrollDirection * 10;
        const tailX = renderX + (dxCenter / distCenter) * streakLen;
        const tailY = renderY + (dyCenter / distCenter) * streakLen + verticalDrift;

        ctx.beginPath();
        ctx.moveTo(renderX, renderY);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size * (1 + combinedWarp * 0.8);
        ctx.globalAlpha = Math.min(1, s.opacity + combinedWarp * 0.35);
        ctx.stroke();
      } else {
        // Normal twinkling circular stars
        ctx.beginPath();
        ctx.arc(renderX, renderY, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.opacity;
        ctx.shadowBlur = s.size > 1.2 ? 6 : 0;
        ctx.shadowColor = s.color;
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;

    // Draw shooting star if active
    if (shootingStar) {
      const { x, y, length, speed, angle, opacity } = shootingStar;
      const tailX = x - Math.cos(angle) * length;
      const tailY = y - Math.sin(angle) * length;

      const grad = ctx.createLinearGradient(x, y, tailX, tailY);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.3, "rgba(244, 114, 182, 0.8)");
      grad.addColorStop(1, "rgba(167, 139, 250, 0)");

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.2;
      ctx.globalAlpha = opacity;
      ctx.stroke();

      shootingStar.x += Math.cos(angle) * speed;
      shootingStar.y += Math.sin(angle) * speed;
      shootingStar.opacity -= 0.015;

      if (shootingStar.opacity <= 0 || shootingStar.x > width || shootingStar.y > height) {
        shootingStar = null;
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }
  animate();
}

// ==========================================
// 2. MODAL SYSTEM
// ==========================================
function initModals() {
  const modalBackdrop = $("#modalBackdrop");
  const modalClose = $("#modalClose");
  const modalOkay = $("#modalOkay");

  window.openModal = function(message, title = "Un pequeño descubrimiento", category = "APUNTE ESTELAR") {
    $("#modalTitle").textContent = title;
    $("#modalText").textContent = message;
    $("#modalCategory").textContent = category;
    modalBackdrop.classList.remove("hidden");
    modalClose.focus();
    document.body.style.overflow = "hidden";
  };

  window.closeModal = function() {
    modalBackdrop.classList.add("hidden");
    document.body.style.overflow = "";
  };

  modalClose.addEventListener("click", closeModal);
  modalOkay.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modalBackdrop.classList.contains("hidden")) {
      closeModal();
    }
  });

  // Attach reveal buttons in Sector 01
  $$(".reveal-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const msg = btn.dataset.message;
      const title = btn.dataset.modalTitle || "Curiosidad Cósmica";
      openModal(msg, title, "ARCHIVOS DEL COSMOS");
      markVisitedSector("discover");
    });
  });
}

// ==========================================
// 3. NAVIGATION & PROGRESS TRACKING
// ==========================================
function initNavigationAndProgress() {
  function goToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const isReduced = document.body.classList.contains("reduce-motion");

    if (!isReduced) {
      if (typeof window.triggerCosmicWarp === "function") {
        window.triggerCosmicWarp();
      }
      el.classList.remove("orbital-arrival");
      void el.offsetWidth; // Force reflow
      el.classList.add("orbital-arrival");
      setTimeout(() => {
        el.classList.remove("orbital-arrival");
      }, 950);
    }

    el.scrollIntoView({ behavior: isReduced ? "auto" : "smooth", block: "start" });
    markVisitedSector(id);
  }

  // Constellation map buttons
  $$("[data-open]").forEach(btn => {
    btn.addEventListener("click", () => goToSection(btn.dataset.open));
  });

  // Hero CTAs
  $("#beginBtn")?.addEventListener("click", () => goToSection("map"));
  $("#gotoMusicBtn")?.addEventListener("click", () => goToSection("music"));
  $("#backToTopBtn")?.addEventListener("click", () => goToSection("home"));
}

function markVisitedSector(id) {
  // Mapping of section IDs to the 5 constellation nodes
  const mapKey = (id === "home") ? null : id;
  if (!mapKey) return;

  state.visitedSectors.add(mapKey);

  const node = $(`[data-open="${mapKey}"]`);
  if (node) node.classList.add("visited");

  const count = Math.min(state.visitedSectors.size, state.totalSectors);
  const textEl = $("#progressText");
  const barEl = $("#progressBar");
  const trackEl = $(".progress-track");

  if (textEl) textEl.textContent = `${count} de ${state.totalSectors} sectores explorados`;
  if (barEl) barEl.style.width = `${(count / state.totalSectors) * 100}%`;
  if (trackEl) trackEl.setAttribute("aria-valuenow", String(Math.round((count / state.totalSectors) * 100)));
}

// ==========================================
// 4. MUSIC PLAYER & WEB AUDIO SOLAR WIND
// ==========================================
function initAudioPlayer() {
  const audio = $("#audioPlayer");
  const playBtn = $("#playTrack");
  const playIcon = $("#playIcon");
  const playStatus = $("#playStatus");
  const trackTitle = $("#trackTitle");
  const trackArtist = $("#trackArtist");
  const trackBadge = $("#trackBadge");
  const vinylGenreLabel = $("#vinylGenreLabel");
  const trackTime = $("#trackTime");
  const trackProgressBar = $("#trackProgressBar");
  const progressContainer = $("#progressContainer");
  const volumeSlider = $("#volumeSlider");
  const vinyl = $("#albumVinyl");
  const soundToggle = $("#soundToggle");
  const synthToggle = $("#synthToggle");
  const synthStateText = $("#synthStateText");
  const prevBtn = $("#prevTrack");
  const nextBtn = $("#nextTrack");

  if (!audio) return;

  const playlist = [
    {
      title: "Cosmic Lofi · Ondas de Medianoche",
      artist: "Pista 01 · Acordes cálidos & campanadas estelares",
      badge: "PISTA 1 / 3",
      genre: "LO-FI",
      src: "assets/audio/cosmic-lofi.wav",
      vibe: "Para bajar revoluciones. A veces el día se pone denso, pero poner una buena música de fondo y charlar con alguien que te alegra el rato hace que todo se sienta más liviano. Cero estrés."
    },
    {
      title: "Gravedad Cero · Vibra Relajada",
      artist: "Pista 02 · Neo-soul espacial & ritmo suave",
      badge: "PISTA 2 / 3",
      genre: "CHILL",
      src: "assets/audio/gravedad-cero.wav",
      vibe: "Esta es para escuchar con calma. Dicen que en gravedad cero nada pesa, y la verdad es que pasar tiempo conociendo a alguien bacano debería sentirse justo así: relajado, espontáneo y sin complicaciones."
    },
    {
      title: "Nebulosa Tranquila · Piano del Cosmos",
      artist: "Pista 03 · Piano etéreo & atmósfera profunda",
      badge: "PISTA 3 / 3",
      genre: "AMBIENT",
      src: "assets/audio/nebulosa-calma.wav",
      vibe: "Un momento de paz. No sé cómo estuvo tu día hoy, pero ojalá esta melodía te deje una vibra bonita y una sonrisa. Te mereces estar tranquila y disfrutar las cosas buenas."
    }
  ];

  let currentTrackIdx = 0;
  const trackVibeText = $("#trackVibeText");

  function loadTrack(index, autoPlay = false) {
    currentTrackIdx = (index + playlist.length) % playlist.length;
    const item = playlist[currentTrackIdx];
    audio.src = item.src;
    if (trackTitle) trackTitle.textContent = item.title;
    if (trackArtist) trackArtist.textContent = item.artist;
    if (trackBadge) trackBadge.textContent = item.badge;
    if (vinylGenreLabel) vinylGenreLabel.textContent = item.genre;
    if (trackVibeText) trackVibeText.textContent = item.vibe;
    if (trackProgressBar) trackProgressBar.style.width = "0%";
    if (trackTime) trackTime.textContent = "00:00 / 00:00";

    if (autoPlay) {
      audio.play().then(() => {
        state.isAudioPlaying = true;
        playIcon.textContent = "⏸";
        playStatus.textContent = `Reproduciendo: ${item.title}`;
        vinyl.classList.add("spinning");
        soundToggle.setAttribute("aria-pressed", "true");
      }).catch(err => console.warn("Auto-play error:", err));
    }
  }

  function fmtTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  async function togglePlay() {
    markVisitedSector("music");
    try {
      if (audio.paused) {
        await audio.play();
        state.isAudioPlaying = true;
        if (typeof logTelemetryEvent === "function") logTelemetryEvent("music_played", { musicPlayed: true });
        playIcon.textContent = "⏸";
        playStatus.textContent = `Reproduciendo: ${playlist[currentTrackIdx].title}`;
        vinyl.classList.add("spinning");
        soundToggle.setAttribute("aria-pressed", "true");
      } else {
        audio.pause();
        state.isAudioPlaying = false;
        playIcon.textContent = "▶";
        playStatus.textContent = "En pausa";
        vinyl.classList.remove("spinning");
        soundToggle.setAttribute("aria-pressed", "false");
      }
    } catch (err) {
      console.warn("Audio playback issue:", err);
      openModal(
        "El navegador requirió una interacción previa para reproducir el audio. Vuelve a pulsar reproducir.",
        "Aviso del reproductor",
        "ÓRBITA SONORA"
      );
    }
  }

  playBtn?.addEventListener("click", togglePlay);
  soundToggle?.addEventListener("click", () => {
    const musicSection = document.getElementById("music");
    if (musicSection && window.scrollY < musicSection.offsetTop - 200) {
      musicSection.scrollIntoView({ behavior: "smooth" });
    }
    togglePlay();
  });

  prevBtn?.addEventListener("click", () => {
    loadTrack(currentTrackIdx - 1, state.isAudioPlaying);
  });

  nextBtn?.addEventListener("click", () => {
    loadTrack(currentTrackIdx + 1, state.isAudioPlaying);
  });

  audio.addEventListener("timeupdate", () => {
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      trackProgressBar.style.width = `${pct}%`;
      trackTime.textContent = `${fmtTime(audio.currentTime)} / ${fmtTime(audio.duration)}`;
      progressContainer.setAttribute("aria-valuenow", Math.round(pct));
    }
  });

  audio.addEventListener("ended", () => {
    // Automatically advance to next track in playlist
    loadTrack(currentTrackIdx + 1, true);
  });

  // Seek bar click
  progressContainer?.addEventListener("click", (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    if (audio.duration) {
      audio.currentTime = pct * audio.duration;
    }
  });

  // Volume slider
  volumeSlider?.addEventListener("input", (e) => {
    audio.volume = parseFloat(e.target.value);
  });

  // Web Audio API Cosmic Wind Synthesizer (Zero External Files!)
  function toggleCosmicSynth() {
    if (!state.isSynthPlaying) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        state.synthAudioCtx = new AudioCtx();

        // 2-second buffer of gentle filtered noise
        const bufferSize = state.synthAudioCtx.sampleRate * 2;
        const buffer = state.synthAudioCtx.createBuffer(1, bufferSize, state.synthAudioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Pink-noise filter approximation for deep ambient space rumble
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 2.8;
        }

        state.synthSource = state.synthAudioCtx.createBufferSource();
        state.synthSource.buffer = buffer;
        state.synthSource.loop = true;

        // Bandpass filter to make it sound like gentle solar wind
        const filter = state.synthAudioCtx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(320, state.synthAudioCtx.currentTime);
        filter.Q.setValueAtTime(1.8, state.synthAudioCtx.currentTime);

        state.synthGainNode = state.synthAudioCtx.createGain();
        state.synthGainNode.gain.setValueAtTime(0.08, state.synthAudioCtx.currentTime);

        state.synthSource.connect(filter);
        filter.connect(state.synthGainNode);
        state.synthGainNode.connect(state.synthAudioCtx.destination);

        state.synthSource.start();
        state.isSynthPlaying = true;
        synthToggle.classList.add("active");
        synthToggle.setAttribute("aria-pressed", "true");
        if (synthStateText) synthStateText.textContent = "ON";
      } catch (err) {
        console.warn("Web Audio synth not supported:", err);
      }
    } else {
      if (state.synthAudioCtx) {
        state.synthGainNode.gain.exponentialRampToValueAtTime(0.0001, state.synthAudioCtx.currentTime + 0.5);
        setTimeout(() => {
          state.synthAudioCtx.close();
          state.isSynthPlaying = false;
          synthToggle.classList.remove("active");
          synthToggle.setAttribute("aria-pressed", "false");
          if (synthStateText) synthStateText.textContent = "OFF";
        }, 500);
      }
    }
  }

  synthToggle?.addEventListener("click", toggleCosmicSynth);
}

// ==========================================
// 5. TRIVIA ASTRONÓMICA CON HUMOR & CIENCIA
// ==========================================
function initTriviaGame() {
  const questions = [
    {
      q: "¿Qué probabilidad hay en el cosmos de que dos personas retomen contacto tras un tiempo y surja curiosidad mutua?",
      options: ["0.001% según cálculos de la NASA", "50 / 50", "Altas, si la otra persona tiene una vibra increíble", "Depende de la fase lunar"],
      correct: 2,
      explain: "¡Respuesta correcta! Las matemáticas y la física no mienten: la buena energía siempre atrae."
    },
    {
      q: "¿Qué es lo más valioso que dos personas pueden compartir en este universo?",
      options: ["Un fragmento de meteorito de 10 kilos", "Una buena charla, tiempo sincero y un par de risas", "La clave del Wi-Fi de la nave", "Un mapa para no perderse en la Vía Láctea"],
      correct: 1,
      explain: "¡Exactamente! En un universo tan gigante, coincidir y pasar un rato agradable charlando no tiene precio."
    },
    {
      q: "¿A qué velocidad es más recomendable conocer a alguien que te parece interesante?",
      options: ["A la velocidad de la luz (300.000 km/s)", "Con prisa, afán y estrés", "Con calma, buena charla y cero presiones", "Esperando al próximo eclipse"],
      correct: 2,
      explain: "¡Exactamente! Al universo le tomó 13.800 millones de años formarse; nosotros no tenemos ningún afán."
    },
    {
      q: "Científicamente hablando, ¿qué sucede si te equivocas respondiendo una pregunta en esta trivia?",
      options: ["Se descalibra el telescopio espacial", "Colapsa una estrella enana", "Absolutamente nada: aquí se vino a pasar un buen rato", "Te ponen una multa intergaláctica"],
      correct: 2,
      explain: "¡Exacto! Cero exámenes, cero compromisos: 100% buena onda."
    }
  ];

  let qIndex = 0;
  let score = 0;
  let answered = false;

  const qCounter = $("#quizCounter");
  const qScore = $("#quizScore");
  const qText = $("#quizQuestion");
  const qOptions = $("#quizOptions");
  const qFeedback = $("#quizFeedback");
  const nextBtn = $("#nextQuestion");

  function renderQuestion() {
    answered = false;
    const curr = questions[qIndex];
    qCounter.textContent = `PREGUNTA ${qIndex + 1} / ${questions.length}`;
    qScore.textContent = `Aciertos: ${score}`;
    qText.textContent = curr.q;
    qFeedback.textContent = "Selecciona una opción para avanzar.";
    nextBtn.classList.add("hidden");
    qOptions.innerHTML = "";

    curr.options.forEach((optText, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-option";
      btn.textContent = optText;
      btn.addEventListener("click", () => handleAnswer(idx, btn));
      qOptions.appendChild(btn);
    });
  }

  function handleAnswer(selectedIdx, clickedBtn) {
    if (answered) return;
    answered = true;
    const curr = questions[qIndex];
    const allButtons = $$(".quiz-option", qOptions);

    allButtons.forEach((b, i) => {
      b.disabled = true;
      if (i === curr.correct) b.classList.add("correct");
    });

    if (selectedIdx === curr.correct) {
      score++;
      qScore.textContent = `Aciertos: ${score}`;
      qFeedback.textContent = curr.explain;
    } else {
      clickedBtn.classList.add("wrong");
      qFeedback.textContent = `¡Casi! La respuesta correcta está resaltada. ${curr.explain}`;
    }

    nextBtn.textContent = (qIndex === questions.length - 1) ? "Ver veredicto estelar ↗" : "Siguiente pregunta ↗";
    nextBtn.classList.remove("hidden");
  }

  nextBtn?.addEventListener("click", () => {
    if (qIndex < questions.length - 1) {
      qIndex++;
      renderQuestion();
    } else {
      markVisitedSector("games");
      const title = score >= 3 ? "✦ ¡Excelente Navegante Estelar!" : "✦ ¡Buen Intento Cósmico!";
      const msg = `Completaste la trivia con ${score} de ${questions.length} respuestas correctas. Tienes buen ojo para los misterios del universo.`;
      openModal(msg, title, "DESAFÍOS ESPACIALES");
      qIndex = 0;
      score = 0;
      renderQuestion();
    }
  });

  renderQuestion();
}

// ==========================================
// 6. MEMORAMA ESTELAR 3D
// ==========================================
function initMemoryGame() {
  const cardsData = [
    { id: "supernova", name: "Supernova", icon: "assets/illustrations/supernova.svg" },
    { id: "satellite", name: "Satélite", icon: "assets/illustrations/satellite.svg" },
    { id: "comet", name: "Cometa", icon: "assets/illustrations/comet.svg" },
    { id: "eclipse", name: "Eclipse", icon: "assets/illustrations/eclipse.svg" },
    { id: "telescope", name: "Telescopio", icon: "assets/illustrations/telescope.svg" },
    { id: "astronaut", name: "Astronauta", icon: "assets/illustrations/astronaut.svg" }
  ];

  let deck = [];
  let flippedCards = [];
  let lockBoard = false;
  let matches = 0;
  let moves = 0;

  const pairMessages = {
    telescope: "✦ Telescopios encontrados: «Buen ojo... como el mío cuando me fijé en ti.»",
    astronaut: "✦ Astronautas alineados: «Complicidad espacial desbloqueada.»",
    comet: "✦ Cometas emparejados: «Las mejores cosas llegan de imprevisto.»",
    satellite: "✦ Satélites sintonizados: «Buena energía y conexión en la frecuencia.»",
    eclipse: "✦ Eclipses sincronizados: «A veces hace falta una pausa para notar lo especial.»",
    supernova: "✦ Supernovas detonadas: «¡Brillante jugada!»"
  };

  const board = $("#memoryBoard");
  const statusText = $("#memoryStatus");
  const movesText = $("#memoryMoves");
  const resetBtn = $("#resetMemory");
  const victoryMsg = $("#memoryVictory");
  const victoryMoves = $("#victoryMoves");
  const pairToast = $("#pairMatchToast");

  function shuffle(arr) {
    const res = [...arr];
    for (let i = res.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [res[i], [res[j]]] = [res[j], [res[i]]];
    }
    return res;
  }

  function setupDeck() {
    deck = shuffle([...cardsData, ...cardsData].map((item, index) => ({
      ...item,
      uniqueId: index,
      matched: false
    })));

    flippedCards = [];
    lockBoard = false;
    matches = 0;
    moves = 0;
    if (statusText) statusText.textContent = `0 / ${cardsData.length} parejas`;
    if (movesText) movesText.textContent = "0";
    if (victoryMsg) victoryMsg.classList.add("hidden");
    if (pairToast) pairToast.classList.add("hidden");
    if (!board) return;

    board.innerHTML = "";

    deck.forEach((card, idx) => {
      const wrap = document.createElement("div");
      wrap.className = "card-3d-wrap";

      const inner = document.createElement("button");
      inner.type = "button";
      inner.className = "card-inner";
      inner.setAttribute("aria-label", `Carta cósmica ${idx + 1}, oculta`);
      inner.dataset.index = String(idx);

      const front = document.createElement("div");
      front.className = "card-front";
      front.textContent = "✧";

      const back = document.createElement("div");
      back.className = "card-back";
      const img = document.createElement("img");
      img.src = card.icon;
      img.alt = card.name;
      img.loading = "lazy";
      back.appendChild(img);

      inner.appendChild(front);
      inner.appendChild(back);
      wrap.appendChild(inner);
      board.appendChild(wrap);

      inner.addEventListener("click", () => handleFlip(inner, card, idx));
    });
  }

  function handleFlip(innerEl, card, index) {
    if (lockBoard) return;
    if (card.matched) return;
    if (flippedCards.some(f => f.index === index)) return;

    innerEl.classList.add("flipped");
    innerEl.setAttribute("aria-label", `Carta revelada: ${card.name}`);
    flippedCards.push({ el: innerEl, card, index });

    if (flippedCards.length === 2) {
      moves++;
      movesText.textContent = String(moves);
      lockBoard = true;

      const [first, second] = flippedCards;
      if (first.card.id === second.card.id) {
        // Match!
        first.card.matched = true;
        second.card.matched = true;
        first.el.classList.add("matched");
        second.el.classList.add("matched");
        matches++;
        statusText.textContent = `${matches} / ${cardsData.length} parejas`;

        if (pairToast) {
          pairToast.textContent = pairMessages[first.card.id] || "✦ ¡Pareja encontrada!";
          pairToast.classList.remove("hidden");
        }

        flippedCards = [];
        lockBoard = false;

        if (matches === cardsData.length) {
          markVisitedSector("games");
          victoryMoves.textContent = String(moves);
          victoryMsg.classList.remove("hidden");
          setTimeout(() => {
            openModal(
              `¡Has sincronizado las 6 parejas en ${moves} movimientos! Tu concentración y memoria visual son de primer nivel.`,
              "✦ Memoria Estelar Completada",
              "DESAFÍOS ESPACIALES"
            );
          }, 450);
        }
      } else {
        // No match: flip back
        setTimeout(() => {
          first.el.classList.remove("flipped");
          second.el.classList.remove("flipped");
          first.el.setAttribute("aria-label", `Carta ${first.index + 1}, oculta`);
          second.el.setAttribute("aria-label", `Carta ${second.index + 1}, oculta`);
          flippedCards = [];
          lockBoard = false;
        }, 800);
      }
    }
  }

  resetBtn?.addEventListener("click", setupDeck);
  setupDeck();
}

// ==========================================
// 7. SINTONIZADOR ESTELAR (ORÁCULO CON CHISPA)
// ==========================================
function initOracleResonator() {
  const quotes = [
    "Frecuencia 104.2 · Dicen que el espacio está vacío, pero a veces basta una buena charla con la persona indicada para que el día no se sienta tan plano.",
    "Frecuencia 98.7 · Pronóstico de hoy: Hay un 99% de posibilidades de que responder con calma sea mejor que apresurarse, y un 100% de que te veas genial hoy.",
    "Frecuencia 107.5 · Si alguien se sienta a programar una página web entera con planetas y música para ti, como mínimo te mereces un día tranquilo y con una sonrisa.",
    "Frecuencia 92.1 · Nota de órbita: Me caes súper bien. Sin condiciones, sin contratos cósmicos ni expectativas raras, solo la verdad.",
    "Frecuencia 101.9 · ¿Sabías que los átomos de tu cuerpo se formaron en estrellas? Así que técnicamente ya eres de otro mundo.",
    "Frecuencia 95.4 · Recordatorio de órbita: El universo se expande a mil por hora, pero conocer a alguien bacano se disfruta más yendo paso a paso.",
    "Frecuencia 108.0 · Si la curiosidad fue capaz de llevar a la humanidad a pisar la Luna, que nunca se pierdan las ganas de reírse y descubrir cosas nuevas.",
    "Frecuencia 90.3 · Los mejores descubrimientos de la ciencia ocurrieron por accidente y sin forzarlos. Dejar fluir las cosas suele dar los mejores resultados."
  ];

  let lastIdx = -1;
  const tuneBtn = $("#tuneBtn");
  const freqDisplay = $("#freqDisplay");
  const oracleText = $("#oracleText");
  const resonatorSphere = $("#resonatorSphere");

  tuneBtn?.addEventListener("click", () => {
    markVisitedSector("oracle");
    resonatorSphere?.classList.add("tuning");
    tuneBtn.disabled = true;

    // Fast frequency scanning effect
    let scanCount = 0;
    const interval = setInterval(() => {
      const randFreq = (88 + Math.random() * 20).toFixed(1);
      freqDisplay.textContent = `${randFreq} MHz`;
      scanCount++;
      if (scanCount > 6) {
        clearInterval(interval);
        resonatorSphere?.classList.remove("tuning");
        tuneBtn.disabled = false;

        let nextIdx = Math.floor(Math.random() * quotes.length);
        if (nextIdx === lastIdx) nextIdx = (nextIdx + 1) % quotes.length;
        lastIdx = nextIdx;

        const parts = quotes[nextIdx].split(" · ");
        freqDisplay.textContent = `${parts[0].replace("Frecuencia ", "")} MHz`;
        oracleText.textContent = parts[1];
      }
    }, 90);
  });
}

// ==========================================
// 8. LAS 3 ESTRELLAS SECRETAS & TELESCOPIO
// ==========================================
function initSecretStars() {
  const stars = [
    { btn: $("#star1"), name: "Órbita del planeta" },
    { btn: $("#star2"), name: "Cabina del reproductor" },
    { btn: $("#star3"), name: "Dial del sintonizador" }
  ];

  const trackerBtn = $("#secretTracker");
  const countEl = $("#secretCount");
  const lockedCount = $("#lockedCountText");
  const lockedState = $("#secretLockedState");
  const unlockedState = $("#secretUnlockedState");
  const hintBtn = $("#secretHintBtn");
  const hintBox = $("#secretHintBox");
  const extraHintBtn = $("#secretExtraHintBtn");
  const detailHint = $("#secretDetailHint");
  const overrideBtn = $("#secretOverrideBtn");
  const letterBox = $("#dedicationLetterBox");
  const letterWrapper = $("#letterWrapper");
  const letterClosedCard = $("#letterClosedCard");
  const letterContent = $("#letterTypedContent");
  const letterSig = $("#letterSignatureEl");
  const skipBtn = $("#skipLetterBtn");
  const replayBtn = $("#replayLetterBtn");
  const closeBtn = $("#closeLetterBtn");
  const reopenBtn = $("#reopenLetterBtn");

  const letterParagraphs = [
    "Hola, Sofi.",
    "No soy astrónomo ni pretendo predecir qué va a pasar en el futuro, pero sentarme a escribir código y diseñar este pequeño rincón fue una excusa completamente sincera para sacarte una sonrisa y demostrarte lo mucho que me llama la atención conocerte.",
    "Quizás el día que te lo dije te tomó por sorpresa, pero qué bacano es cuando uno puede ser transparente, sin rodeos, misterios raros ni libretos fingidos. Me caes muy bien, me parece que tienes una vibra única y un mundo propio bastante interesante al que da mucha curiosidad asomarse.",
    "La verdad es que no hay afanes, ni manuales de instrucciones, ni expectativas pesadas. Ya sabes bien que me gustas (no es ningún secreto), pero justamente por eso, antes que nada, primero quiero conocerte bien y que las cosas sean con calma. Las mejores conexiones y las buenas charlas siempre nacen así: compartiendo risas espontáneas, hablando de cualquier tontería o de cosas que nos apasionan, y dejando que la gravedad haga lo suyo al ritmo que se sienta natural para los dos.",
    "Al final, los parches que de verdad valen la pena no necesitan fórmulas complicadas: basta con un buen café (o lo que prefieras tomar), buena música de fondo y la tranquilidad de ser uno mismo sin tener que impresionar a nadie. Me encantaría que nos diéramos el espacio de charlar más seguido, descubrir qué cosas tenemos en común y pasar buenos ratos sin prisa.",
    "Ojalá este viaje por las estrellas te haya alegrado el día tanto como a mí me alegró construirlo pensando en ti."
  ];

  let typingTimeout = null;
  let isTyping = false;
  let letterStarted = false;

  function renderInstantLetter() {
    if (typingTimeout) clearTimeout(typingTimeout);
    isTyping = false;
    if (!letterContent) return;
    letterContent.innerHTML = "";
    letterParagraphs.forEach((pText, i) => {
      const p = document.createElement("p");
      if (i === 0) p.className = "letter-salutation";
      p.textContent = pText;
      letterContent.appendChild(p);
    });
    letterSig?.classList.remove("hidden");
    skipBtn?.classList.add("hidden");
    closeBtn?.classList.remove("hidden");
    replayBtn?.classList.remove("hidden");
    if (typeof logTelemetryEvent === "function") logTelemetryEvent("letter_opened", { letterOpened: true });
  }

  function startTypewriter() {
    if (typeof logTelemetryEvent === "function") logTelemetryEvent("letter_opened", { letterOpened: true });
    if (document.body.classList.contains("reduce-motion")) {
      renderInstantLetter();
      return;
    }
    if (typingTimeout) clearTimeout(typingTimeout);
    isTyping = true;
    if (!letterContent) return;

    letterContent.innerHTML = "";
    letterSig?.classList.add("hidden");
    closeBtn?.classList.add("hidden");
    skipBtn?.classList.remove("hidden");
    replayBtn?.classList.add("hidden");

    let pIndex = 0;
    let charIndex = 0;
    let currentP = null;
    const cursor = document.createElement("span");
    cursor.className = "typing-cursor";

    function typeNextChar() {
      if (!isTyping) return;

      if (!currentP) {
        currentP = document.createElement("p");
        if (pIndex === 0) currentP.className = "letter-salutation";
        letterContent.appendChild(currentP);
        currentP.appendChild(cursor);
      }

      const text = letterParagraphs[pIndex];

      if (charIndex < text.length) {
        const char = text.charAt(charIndex);
        currentP.insertBefore(document.createTextNode(char), cursor);
        charIndex++;

        // Natural typing rhythm with micro-pauses at punctuation
        let delay = 16;
        if (char === "." || char === "!" || char === "?") {
          delay = 170;
        } else if (char === "," || char === ":") {
          delay = 80;
        }

        typingTimeout = setTimeout(typeNextChar, delay);
      } else {
        // Current paragraph finished: detach cursor
        if (cursor.parentNode === currentP) {
          currentP.removeChild(cursor);
        }
        pIndex++;
        charIndex = 0;
        currentP = null;

        if (pIndex < letterParagraphs.length) {
          typingTimeout = setTimeout(typeNextChar, 240);
        } else {
          // Finished full letter
          isTyping = false;
          letterSig?.classList.remove("hidden");
          skipBtn?.classList.add("hidden");
          closeBtn?.classList.remove("hidden");
          replayBtn?.classList.remove("hidden");
        }
      }
    }

    typeNextChar();
  }

  skipBtn?.addEventListener("click", renderInstantLetter);
  replayBtn?.addEventListener("click", startTypewriter);

  closeBtn?.addEventListener("click", () => {
    if (!letterWrapper) return;
    letterWrapper.classList.remove("opening");
    letterWrapper.classList.add("closing");

    setTimeout(() => {
      letterWrapper.classList.add("hidden");
      letterWrapper.classList.remove("closing");
      letterClosedCard?.classList.remove("hidden", "closing");
    }, 400);
  });

  reopenBtn?.addEventListener("click", () => {
    if (!letterClosedCard) return;
    letterClosedCard.classList.add("closing");

    setTimeout(() => {
      letterClosedCard.classList.add("hidden");
      letterClosedCard.classList.remove("closing");

      letterWrapper?.classList.remove("hidden", "closing");
      letterWrapper?.classList.add("opening");
      renderInstantLetter();
    }, 280);
  });

  function unlockTelescope() {
    markVisitedSector("secrets");
    lockedState?.classList.add("hidden");
    unlockedState?.classList.remove("hidden");
    if (!letterStarted) {
      letterStarted = true;
      setTimeout(startTypewriter, 350);
    }
  }

  stars.forEach((s, idx) => {
    if (!s.btn) return;
    s.btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (state.secretStarsFound.has(idx)) return;

      state.secretStarsFound.add(idx);
      s.btn.classList.add("found");
      const foundCount = state.secretStarsFound.size;

      if (countEl) countEl.textContent = String(foundCount);
      if (lockedCount) lockedCount.textContent = `${foundCount} de 3`;

      if (foundCount === 3) {
        unlockTelescope();
        openModal(
          "¡Has descubierto los 3 destellos ocultos en el cosmos! El Telescopio Secreto se ha calibrado al 100%. Desciende al Sector 05 para ver la sorpresa.",
          "✦ ¡Todas las reliquias encontradas!",
          "ZONA SECRETA"
        );
      } else {
        openModal(
          `¡Encontraste el destello en: ${s.name}! Te faltan ${3 - foundCount} para calibrar el telescopio secreto.`,
          "✦ Destello Estelar Descubierto",
          "ZONA SECRETA"
        );
      }
    });
  });

  trackerBtn?.addEventListener("click", () => {
    const found = state.secretStarsFound.size;
    openModal(
      `Has encontrado ${found} de 3 destellos estelares ocultos en la página. Pista: uno está en el planeta de bienvenida, otro en la música y otro en el sintonizador estelar.`,
      "Misión Secreta: 3 Destellos",
      "REGISTRO ESTELAR"
    );
  });

  hintBtn?.addEventListener("click", () => {
    hintBox?.classList.toggle("hidden");
  });

  extraHintBtn?.addEventListener("click", () => {
    detailHint?.classList.remove("hidden");
    extraHintBtn.classList.add("hidden");
  });

  overrideBtn?.addEventListener("click", () => {
    unlockTelescope();
    openModal(
      "Has usado el permiso de observadora para alinear el telescopio sin necesidad de buscar todos los destellos.",
      "Telescopio Desbloqueado",
      "ZONA SECRETA"
    );
  });
}

// ==========================================
// 9. LANZAR DESEO / ESTRELLA FUGAZ AL FINAL
// ==========================================
function initEndingWish() {
  const wishBtn = $("#wishStarBtn");
  const wishFeedback = $("#wishFeedback");

  wishBtn?.addEventListener("click", () => {
    wishFeedback?.classList.remove("hidden");
    wishBtn.disabled = true;

    // Trigger visual celebration modal
    openModal(
      "Tu estrella ha sido lanzada al universo con la mejor energía. Gracias por tomarte el tiempo de recorrer este pequeño proyecto. Que tengas un día muy bonito.",
      "★ Deseo Elevado al Cosmos",
      "FIN DE LA EXPEDICIÓN"
    );

    setTimeout(() => {
      wishBtn.disabled = false;
    }, 4000);
  });
}

// ==========================================
// 10. ACCESIBILIDAD & AMBIENTE
// ==========================================
function initAccessibilityControls() {
  const motionToggle = $("#motionToggle");
  const themeToggle = $("#themeToggle");

  motionToggle?.addEventListener("click", () => {
    const active = document.body.classList.toggle("reduce-motion");
    motionToggle.setAttribute("aria-pressed", String(active));
  });

  themeToggle?.addEventListener("click", () => {
    const active = document.body.classList.toggle("light-mode");
    themeToggle.setAttribute("aria-pressed", String(active));
  });
}

// ==========================================
// 11. SECCIÓN 1: ESTRELLA CON MENSAJE PERSONALIZADO
// ==========================================
function initCustomStarSection() {
  const customStarBtn = $("#customStarBtn");
  const customStarDialog = $("#customStarDialog");
  const customStarQuote = $("#customStarQuote");
  const customStarSub = $("#customStarSub");
  const customStarAgainBtn = $("#customStarAgainBtn");

  if (!customStarBtn || !customStarDialog) return;

  const messages = [
    {
      quote: "«Hay personas que despiertan curiosidad sin hacer demasiado ruido. Tú eres un poquito así ✦»",
      sub: "Una señal sincera y sin misterios en este pequeño rincón del cosmos."
    },
    {
      quote: "«Qué bacano es coincidir con alguien con quien la charla fluye liviana y sin tener que forzar nada.»",
      sub: "La gravedad adecuada para pasar un buen rato sin afanes."
    },
    {
      quote: "«No hace falta inventarse poses raras cuando la autenticidad se nota desde el primer momento.»",
      sub: "Cero complicaciones, 100% buena vibra."
    }
  ];

  let currentMsgIndex = 0;

  function revealOrNextMessage() {
    if (customStarDialog.classList.contains("hidden")) {
      customStarDialog.classList.remove("hidden");
    } else {
      currentMsgIndex = (currentMsgIndex + 1) % messages.length;
    }

    const current = messages[currentMsgIndex];
    if (customStarQuote) customStarQuote.textContent = current.quote;
    if (customStarSub) customStarSub.textContent = current.sub;

    // Star bounce/glow animation trigger
    customStarBtn.style.transform = "scale(1.25) rotate(15deg)";
    setTimeout(() => {
      customStarBtn.style.transform = "";
    }, 350);
  }

  customStarBtn.addEventListener("click", revealOrNextMessage);
  customStarAgainBtn?.addEventListener("click", revealOrNextMessage);
}

// ==========================================
// 12. SECCIÓN 2: EL RINCÓN DE LOS PEQUEÑOS DETALLES
// ==========================================
function initSmallDetailsSection() {
  const cards = $$(".detail-card");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      card.style.transform = "translateY(-8px) scale(1.02)";
      setTimeout(() => {
        card.style.transform = "";
      }, 300);
    });
  });
}

// ==========================================
// 13. SECCIÓN 3: UN PLANETA CON PERSONALIDAD
// ==========================================
function initPlanetBuddySection() {
  const avatar = $("#planetBuddyAvatar");
  const pokeBtn = $("#pokePlanetBtn");
  const speechText = $("#planetSpeechText");
  const moodTag = $("#buddyMoodTag");
  const expCountEl = $("#buddyExpCount");
  const eyesGroup = $("#buddyEyes");
  const mouthGroup = $("#buddyMouth");
  const secretNote = $("#buddySecretNote");
  const secretText = $("#buddySecretText");

  if (!avatar || !speechText) return;

  const expressions = [
    {
      mood: "Estado: Amistoso ✧",
      text: "«Bienvenida, visitante. No garantizamos que encuentres vida inteligente por aquí, pero al menos hay buena vibra.»",
      eyesSvg: `<circle cx="76" cy="98" r="6" fill="#ffffff" /><circle cx="78" cy="96" r="2.5" fill="#1e1b4b" /><circle cx="124" cy="98" r="6" fill="#ffffff" /><circle cx="126" cy="96" r="2.5" fill="#1e1b4b" />`,
      mouthSvg: `<path d="M 90 114 Q 100 124 110 114" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>`
    },
    {
      mood: "Estado: Curioso ✦",
      text: "«Analizando parámetros... Sofi detectada: nivel de curiosidad al 100%, nivel de complicación en 0%.»",
      eyesSvg: `<circle cx="76" cy="96" r="7" fill="#ffffff" /><circle cx="78" cy="95" r="3" fill="#1e1b4b" /><path d="M 118 97 Q 124 90 130 97" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>`,
      mouthSvg: `<ellipse cx="100" cy="116" rx="6" ry="7" fill="#ffffff" />`
    },
    {
      mood: "Estado: Filosófico ☕",
      text: "«Girando a 1.200 km/h y todavía no entiendo cómo la gente se complica tanto la vida existiendo el café.»",
      eyesSvg: `<path d="M 70 98 Q 77 91 84 98" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/><path d="M 116 98 Q 123 91 130 98" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>`,
      mouthSvg: `<path d="M 88 114 Q 100 126 112 114" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>`
    },
    {
      mood: "Estado: Cómplice 😉",
      text: "«¡Cuidado con la gravedad! Si te acercas mucho, te contagio las ganas de reírte de cualquier tontería.»",
      eyesSvg: `<path d="M 70 98 Q 77 92 84 98" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/><circle cx="124" cy="98" r="6" fill="#ffffff" /><circle cx="126" cy="96" r="2.5" fill="#1e1b4b" />`,
      mouthSvg: `<path d="M 92 116 Q 103 125 113 113" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>`
    },
    {
      mood: "Estado: Radar Positivo ✨",
      text: "«Dicen los radares que alguien por aquí es bastante simpática y parchada. Y mis sensores nunca fallan.»",
      eyesSvg: `<text x="70" y="103" font-size="14" fill="#ffffff">✦</text><text x="118" y="103" font-size="14" fill="#ffffff">✦</text>`,
      mouthSvg: `<path d="M 87 112 Q 100 128 113 112" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>`
    },
    {
      mood: "Estado: Zen Orbital 🧘",
      text: "«Pausa en la estación orbital: respira profundo, toma agua y recuerda que hoy pinta ser un muy buen día.»",
      eyesSvg: `<line x1="70" y1="98" x2="84" y2="98" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/><line x1="116" y1="98" x2="130" y2="98" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>`,
      mouthSvg: `<path d="M 92 115 Q 100 122 108 115" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>`
    }
  ];

  let currentIndex = 0;
  const discoveredSet = new Set([0]);
  let clickTimes = [];
  let isDramatic = false;
  let dramaticTimeout = null;

  function triggerDramaticMode() {
    isDramatic = true;
    avatar.classList.remove("buddy-wiggle");
    avatar.classList.add("buddy-dramatic");
    const speechBubble = $(".buddy-bubble");
    if (speechBubble) speechBubble.classList.add("dramatic");
    if (secretNote) secretNote.classList.add("dramatic");
    if (secretText) secretText.innerHTML = `<strong>¡Te lo advertí!</strong> ¡Más de 4 clics seguidos es demasiado para un planeta! 😵‍💫🚨`;
    if (typeof logTelemetryEvent === "function") logTelemetryEvent("dramatic_buddy");

    if (moodTag) moodTag.textContent = "Estado: ¡Dramático al 100%! 🚨";

    // Ojos apretados de pánico (> <) y boca de grito cómico
    if (eyesGroup) {
      eyesGroup.innerHTML = `
        <path d="M 68 91 L 82 98 L 68 105" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M 132 91 L 118 98 L 132 105" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    }
    if (mouthGroup) {
      mouthGroup.innerHTML = `<ellipse cx="100" cy="118" rx="10" ry="13" fill="#ffffff" />`;
    }

    speechText.style.opacity = "0.3";
    setTimeout(() => {
      speechText.textContent = "«¡PARA! ¡Soy un planeta, no un botón de ascensor! 🪐😵‍💫 ¿Acaso tengo cara de timbre espacial?»";
      speechText.style.opacity = "1";
    }, 120);

    if (pokeBtn) pokeBtn.innerHTML = `Dejar descansar al planeta 😅`;

    clearTimeout(dramaticTimeout);
    dramaticTimeout = setTimeout(() => {
      avatar.classList.remove("buddy-dramatic");
      if (speechBubble) speechBubble.classList.remove("dramatic");
      if (secretNote) secretNote.classList.remove("dramatic");
      if (secretText) secretText.innerHTML = `<strong>Aviso orbital secreto:</strong> ¡No me des más de 4 clics seguidos! 😜🤣`;

      if (moodTag) moodTag.textContent = "Estado: Aliviado... 😮‍💨";
      if (eyesGroup) {
        eyesGroup.innerHTML = `
          <line x1="70" y1="98" x2="84" y2="98" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="116" y1="98" x2="130" y2="98" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
        `;
      }
      if (mouthGroup) {
        mouthGroup.innerHTML = `<ellipse cx="100" cy="116" rx="5" ry="6" fill="#ffffff"/>`;
      }

      speechText.style.opacity = "0.3";
      setTimeout(() => {
        speechText.textContent = "«Uf... casi me sacas de órbita. Menos mal aquí no hay gravedad. ¡Ya ves por qué te dije que no me dieras más de 4 clics seguidos! 😜🤣»";
        speechText.style.opacity = "1";
      }, 120);

      if (pokeBtn) pokeBtn.innerHTML = `Tocar al planeta <span>👉🪐</span>`;
      clickTimes = [];
      isDramatic = false;
    }, 4500);
  }

  function triggerPlanetReaction() {
    if (isDramatic) return;

    const now = Date.now();
    clickTimes = clickTimes.filter((t) => now - t < 2200);
    clickTimes.push(now);

    if (clickTimes.length >= 4) {
      triggerDramaticMode();
      return;
    }

    // Animate wiggle
    avatar.classList.remove("buddy-wiggle");
    // Force reflow
    void avatar.offsetWidth;
    avatar.classList.add("buddy-wiggle");

    // Advance expression
    currentIndex = (currentIndex + 1) % expressions.length;
    discoveredSet.add(currentIndex);
    const exp = expressions[currentIndex];

    // Fade out text slightly then update
    speechText.style.opacity = "0.3";
    setTimeout(() => {
      speechText.textContent = exp.text;
      speechText.style.opacity = "1";
    }, 150);

    if (moodTag) moodTag.textContent = exp.mood;
    if (eyesGroup) eyesGroup.innerHTML = exp.eyesSvg;
    if (mouthGroup) mouthGroup.innerHTML = exp.mouthSvg;
    if (expCountEl) expCountEl.textContent = Math.min(discoveredSet.size, 5);
  }

  avatar.addEventListener("click", triggerPlanetReaction);
  pokeBtn?.addEventListener("click", triggerPlanetReaction);
  avatar.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerPlanetReaction();
    }
  });
}

// ==========================================
// 14. SECCIÓN 4: CONSTELACIÓN DE BUENOS DESEOS
// ==========================================
function initWishesSection() {
  const starNodes = $$(".wish-star-node");
  const wishBadge = $("#wishBadge");
  const wishTitle = $("#wishTitle");
  const wishText = $("#wishText");
  const wishesCount = $("#wishesCount");
  const wishesCompletion = $("#wishesCompletion");

  if (!starNodes.length || !wishText) return;

  const wishesData = [
    {
      badge: "ESTRELLA 1 DE 5 · BUEN DÍA",
      title: "Que tengas un gran día",
      text: "Que lo que hoy tengas que hacer fluya fácil, sin enredos raros y con buena energía de principio a fin."
    },
    {
      badge: "ESTRELLA 2 DE 5 · BUEN HUMOR",
      title: "Que te rías un montón",
      text: "De esos ataques de risa sinceros que dejan dolor de barriga y te arreglan cualquier tarde pesada."
    },
    {
      badge: "ESTRELLA 3 DE 5 · DESCANSO REAL",
      title: "Que descanses de verdad",
      text: "Que cuando apagues las pantallas puedas desconectar la mente por completo y recargar toda tu batería."
    },
    {
      badge: "ESTRELLA 4 DE 5 · PROYECTOS & METAS",
      title: "Que te salga bien lo importante",
      text: "Ese asunto, proyecto, examen o idea que traes entre manos: que todo se alinee y salga con viento a favor."
    },
    {
      badge: "ESTRELLA 5 DE 5 · DISFRUTAR EL VIAJE",
      title: "Que disfrutes el camino",
      text: "Sin afanes cósmicos, disfrutando la buena música, las pequeñas pausas y la gente que de verdad suma."
    }
  ];

  const litStars = new Set([0]);

  starNodes.forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-wish-index"), 10);
      if (isNaN(idx) || !wishesData[idx]) return;

      // Update active state
      starNodes.forEach((n) => n.classList.remove("active"));
      btn.classList.add("active");

      litStars.add(idx);

      // Display wish
      const data = wishesData[idx];
      if (wishBadge) wishBadge.textContent = data.badge;
      if (wishTitle) wishTitle.textContent = data.title;
      if (wishText) {
        wishText.style.opacity = "0.3";
        setTimeout(() => {
          wishText.textContent = data.text;
          wishText.style.opacity = "1";
        }, 150);
      }

      // Update counter
      if (wishesCount) {
        wishesCount.textContent = `Estrellas encendidas: ${litStars.size} de 5`;
      }

      // If all 5 stars lit
      if (litStars.size === 5 && wishesCompletion) {
        wishesCompletion.classList.remove("hidden");
      }
    });
  });
}

// ==========================================
// 15. CURSOR CÓSMICO INTERACTIVO (ORBITAL HALO)
// ==========================================
function initCosmicCursor() {
  const follower = $("#cosmicCursorFollower");
  if (!follower) return;

  window.addEventListener("mousemove", (e) => {
    follower.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    if (!follower.classList.contains("visible")) {
      follower.classList.add("visible");
    }
  });

  document.addEventListener("mouseleave", () => {
    follower.classList.remove("visible");
  });

  window.addEventListener("touchstart", () => {
    follower.classList.remove("visible");
  }, { passive: true });

  window.addEventListener("mousedown", () => {
    follower.classList.add("clicking");
  });

  window.addEventListener("mouseup", () => {
    follower.classList.remove("clicking");
  });

  // Track hover on interactive elements
  const interactiveSelector = "button, a, input, [role='button'], .detail-card, .star-node, .wish-star-node, .hidden-star, .album-art-wrap, .buddy-avatar-wrap, .control-btn, .theme-toggle";

  document.addEventListener("mouseover", (e) => {
    if (e.target && e.target.closest && e.target.closest(interactiveSelector)) {
      follower.classList.add("hovering");
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target && e.target.closest && e.target.closest(interactiveSelector)) {
      follower.classList.remove("hovering");
    }
  });
}

// ==========================================
// 16. TELEMETRÍA ORBITAL (RADAR DE VISITAS)
// ==========================================
const TELEMETRY_KEY = "sofi_universe_telemetry_v1";
const CONFIG_KEY = "sofi_universe_radar_config";
let currentSessionId = "sess_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);

function getDeviceInfo() {
  const ua = navigator.userAgent || "";
  let device = "Computador 💻";
  if (/android/i.test(ua)) device = "Celular (Android) 📱";
  else if (/iphone/i.test(ua)) device = "Celular (iPhone) 📱";
  else if (/ipad/i.test(ua) || (navigator.maxTouchPoints > 1 && /macintosh/i.test(ua))) device = "Tablet (iPad) 📟";
  else if (/mobile/i.test(ua)) device = "Celular 📱";

  let browser = "Navegador";
  if (/opera|opr/i.test(ua)) browser = "Opera";
  else if (/chrome/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua)) browser = "Safari";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/edg/i.test(ua)) browser = "Edge";

  return { device, browser, resolution: `${window.innerWidth}x${window.innerHeight}` };
}

function logTelemetryEvent(action = "session_start", extra = {}) {
  try {
    const { device, browser, resolution } = getDeviceInfo();
    const entry = {
      id: currentSessionId + "_" + Date.now(),
      sessionId: currentSessionId,
      timestamp: new Date().toISOString(),
      action,
      device,
      browser,
      resolution,
      ...extra
    };

    // 1. Guardado local en localStorage
    const existing = JSON.parse(localStorage.getItem(TELEMETRY_KEY) || "[]");
    // Si es un heartbeat, actualizamos la última entrada de la misma sesión si ocurrió hace poco
    if (action === "heartbeat" && existing.length > 0 && existing[0].sessionId === currentSessionId) {
      existing[0].timestamp = entry.timestamp;
    } else {
      existing.unshift(entry);
    }

    if (existing.length > 80) existing.length = 80;
    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(existing));

    // 2. Transmisión instantánea a radar.html si está abierto en otra pestaña
    try {
      const channel = new BroadcastChannel("sofi_universe_telemetry_channel");
      channel.postMessage({ type: "new_log", entry });
    } catch (e) {}

    // 3. Enviar a endpoint remoto si está configurado en la nube
    const remoteUrl = localStorage.getItem(CONFIG_KEY);
    if (remoteUrl) {
      fetch(remoteUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      }).catch(() => {});
    }
  } catch (err) {
    // Modo silencioso para no interferir con la navegación del usuario
  }
}

function initTelemetry() {
  logTelemetryEvent("session_start");

  // Latido cada 45 segundos para mantener activo el estado en vivo
  setInterval(() => {
    if (document.visibilityState === "visible") {
      logTelemetryEvent("heartbeat");
    }
  }, 45000);
}
