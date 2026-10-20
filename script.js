/* =========================================================
   BLOOMING ROSE FIELD & METEOR SHOWER - MỸ HẰNG (20/10)
   Dense Sea of Layered Red Roses (TikTok Trend & Heart Style)
   ========================================================= */

(function () {
  'use strict';

  const canvas = document.getElementById('gardenCanvas');
  const ctx = canvas.getContext('2d');
  const recipientTitle = document.getElementById('recipientTitle');
  const openCardBtn = document.getElementById('openCardBtn');
  const rebloomBtn = document.getElementById('rebloomBtn');
  const cardModal = document.getElementById('cardModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const backToGardenBtn = document.getElementById('backToGardenBtn');
  const burstHeartsBtn = document.getElementById('burstHeartsBtn');
  const cardBtnText = document.getElementById('cardBtnText');

  let width = 0;
  let height = 0;
  let dpr = 1;

  // Particle & FX systems
  const sparks = [];
  const ripples = [];
  const shootingStars = [];
  const fallingPetals = [];

  // Flowers array (Sea of 45-65 roses)
  let flowers = [];
  let growthTime = 0;
  let isBlooming = true;
  let time = 0;

  /* =========================================================
     1. AUDIO SYNTHESIZER: WARM ROMANTIC PIANO & CHIMES
     ========================================================= */
  let audioCtx = null;
  let isAudioPlaying = false;
  let melodyTimer = null;
  let chimeIndex = 0;

  const romanticChords = [
    [174.61, 220.00, 261.63, 329.63, 392.00, 523.25], // Fmaj7
    [196.00, 246.94, 293.66, 392.00, 440.00, 587.33], // Gadd9
    [164.81, 196.00, 246.94, 293.66, 329.63, 783.99], // Em7
    [220.00, 261.63, 329.63, 392.00, 493.88, 659.25], // Am9
    [146.83, 174.61, 220.00, 261.63, 349.23, 440.00], // Dm7
    [130.81, 164.81, 196.00, 246.94, 261.63, 659.25]  // Cmaj7
  ];

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, delay = 0, duration = 2.4, volume = 0.042) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime + delay;

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.0025, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.exponentialRampToValueAtTime(420, now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.05);
    osc2.stop(now + duration + 0.05);
  }

  function playSoftChime(xRatio = 0.5) {
    initAudio();
    if (!audioCtx) return;
    const chimes = [523.25, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
    const baseFreq = chimes[chimeIndex % chimes.length];
    chimeIndex++;
    playTone(baseFreq * (0.96 + xRatio * 0.08), 0, 1.6, 0.06);
    playTone(baseFreq * 1.5, 0.05, 1.8, 0.035);
  }

  function startBackgroundMelody() {
    initAudio();
    if (melodyTimer) clearInterval(melodyTimer);
    isAudioPlaying = true;
    updateAudioButtonUI();

    let step = 0;
    function playStep() {
      const chord = romanticChords[step % romanticChords.length];
      step++;
      chord.forEach((freq, idx) => {
        playTone(freq, idx * 0.28, 3.2, 0.038);
      });
    }

    playStep();
    melodyTimer = setInterval(playStep, 2600);
  }

  function stopBackgroundMelody() {
    if (melodyTimer) {
      clearInterval(melodyTimer);
      melodyTimer = null;
    }
    isAudioPlaying = false;
    updateAudioButtonUI();
  }

  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const audioIcon = document.getElementById('audioIcon');

  function updateAudioButtonUI() {
    if (isAudioPlaying) {
      audioToggleBtn.classList.add('playing');
      audioIcon.textContent = '🎶';
    } else {
      audioToggleBtn.classList.remove('playing');
      audioIcon.textContent = '🎵';
    }
  }

  audioToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isAudioPlaying) stopBackgroundMelody();
    else startBackgroundMelody();
  });

  /* =========================================================
     2. DENSE FLOWER MEADOW GENERATOR (45-60+ ROSES)
     ========================================================= */

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    initFlowerMeadow();
    initFallingPetals();
  }

  function initFlowerMeadow() {
    flowers = [];
    growthTime = 0;
    isBlooming = true;

    const isMobile = width < 600;
    const totalFlowers = isMobile ? 38 : 56;

    // Palette variants: Rich ruby, deep crimson, passion scarlet, warm velvet rose
    const colorVariations = [
      { outer: '#7a001a', mid: '#b8002a', inner: '#e60039', highlight: '#ff4d79' }, // Classic Ruby Red
      { outer: '#5c0014', mid: '#8f0022', inner: '#cc0029', highlight: '#ff3366' }, // Velvet Bordeaux
      { outer: '#8f0020', mid: '#d90429', inner: '#ff1a53', highlight: '#ff7597' }, // Passion Scarlet
      { outer: '#660018', mid: '#a30026', inner: '#e00034', highlight: '#ffa8ba' }, // Rose Petal Red
      { outer: '#940026', mid: '#cc113b', inner: '#ff2e63', highlight: '#ffd1dc' }  // Pinkish Warm Rose
    ];

    // Layers: 0 = Back (tall, small), 1 = Mid (medium), 2 = Front (large, prominent)
    for (let i = 0; i < totalFlowers; i++) {
      const layer = (i < totalFlowers * 0.35) ? 0 : ((i < totalFlowers * 0.75) ? 1 : 2);

      // Target head position
      let targetX, targetY, radius, isQueen = false;

      if (i === totalFlowers - 1) {
        // Grand Centerpiece Queen Rose (prominent, like the big pink flower in the TikTok photo)
        isQueen = true;
        targetX = width * (isMobile ? 0.50 : 0.52);
        targetY = height * (isMobile ? 0.38 : 0.36);
        radius = isMobile ? 54 : 72;
      } else if (layer === 0) {
        // Back layer: spread across width, higher up, smaller
        targetX = (Math.random() * 0.96 + 0.02) * width;
        targetY = height * (0.28 + Math.random() * 0.28);
        radius = 22 + Math.random() * 14;
      } else if (layer === 1) {
        // Mid layer: dense, medium height
        targetX = (Math.random() * 0.94 + 0.03) * width;
        targetY = height * (0.42 + Math.random() * 0.28);
        radius = 32 + Math.random() * 16;
      } else {
        // Front layer: lower down, larger blooms
        targetX = (Math.random() * 0.92 + 0.04) * width;
        targetY = height * (0.58 + Math.random() * 0.26);
        radius = 42 + Math.random() * 18;
      }

      // Root at bottom with slight spread
      const rootX = targetX + (Math.random() - 0.5) * 40;
      const rootY = height + 15;

      // Stem curve control point
      const cpX = (rootX + targetX) / 2 + (Math.random() - 0.5) * 35;
      const cpY = (rootY + targetY) / 2;

      // Leaf count along stem
      const leafCount = 2 + Math.floor(Math.random() * 3);
      const leaves = [];
      for (let l = 0; l < leafCount; l++) {
        const t = 0.25 + (l / leafCount) * 0.55;
        leaves.push({
          t: t,
          side: (l % 2 === 0) ? 1 : -1,
          size: (radius * 0.45) * (0.8 + Math.random() * 0.4),
          angle: (l % 2 === 0 ? 0.55 : -0.55) + (Math.random() - 0.5) * 0.2
        });
      }

      // Stagger growth start times
      const delay = Math.random() * 0.35 + (layer === 0 ? 0 : (layer === 1 ? 0.12 : 0.22));

      flowers.push({
        layer: isQueen ? 3 : layer,
        isQueen: isQueen,
        rootX: rootX,
        rootY: rootY,
        cpX: cpX,
        cpY: cpY,
        targetX: targetX,
        targetY: targetY,
        radius: radius,
        stemThick: Math.max(3, radius * 0.11),
        leaves: leaves,
        colors: colorVariations[Math.floor(Math.random() * colorVariations.length)],
        isBud: (!isQueen && Math.random() < 0.12), // Some flowers remain cute pointed buds
        delay: delay,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.015,
        rotation: (Math.random() - 0.5) * 0.4
      });
    }

    // Sort flowers so background layers render first, foreground & Queen render on top
    flowers.sort((a, b) => a.layer - b.layer);
  }

  function initFallingPetals() {
    fallingPetals.length = 0;
    const count = 35;
    for (let i = 0; i < count; i++) {
      fallingPetals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 13 + 9,
        vy: Math.random() * 1.3 + 0.7,
        vx: Math.random() * 0.8 - 0.4,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.03,
        flip: Math.random() * Math.PI,
        vFlip: Math.random() * 0.03 + 0.015,
        color: Math.random() > 0.4 ? '#ff0038' : (Math.random() > 0.5 ? '#ff4d73' : '#8c0022'),
        alpha: Math.random() * 0.45 + 0.55
      });
    }
  }

  // Shooting stars
  function spawnShootingStars() {
    if (shootingStars.length < 5 && Math.random() < 0.12) {
      const startX = Math.random() * width * 0.85;
      const startY = Math.random() * height * 0.35;
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.3;
      const speed = Math.random() * 11 + 9;

      shootingStars.push({
        x: startX,
        y: startY,
        length: Math.random() * 120 + 70,
        speed: speed,
        angle: angle,
        alpha: 1,
        fade: Math.random() * 0.018 + 0.012,
        thickness: Math.random() * 1.8 + 1.0,
        color: Math.random() > 0.3 ? '#ffffff' : '#ff4d73'
      });
    }
  }

  function createSoftBurst(x, y, count = 40) {
    const colors = ['#ffffff', '#ff0038', '#ff1a4a', '#e60033', '#ff4d79', '#ffd166'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5.0 + 1.5;
      sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2.4 + 0.8,
        alpha: 1,
        decay: Math.random() * 0.022 + 0.014,
        color: colors[Math.floor(Math.random() * colors.length)],
        isHeart: Math.random() > 0.6,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08
      });
    }

    ripples.push({
      x: x,
      y: y,
      radius: 4,
      maxRadius: Math.min(width, height) * 0.40,
      opacity: 0.65,
      speed: 7
    });
  }

  function drawMiniHeart(c, x, y, size, color, alpha, rot) {
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.scale(size / 10, size / 10);
    c.beginPath();
    c.moveTo(0, 0);
    c.bezierCurveTo(-5, -5, -10, 2, 0, 10);
    c.bezierCurveTo(10, 2, 5, -5, 0, 0);
    c.fillStyle = color;
    c.globalAlpha = alpha;
    c.fill();
    c.restore();
  }

  /* =========================================================
     3. DRAWING PROCEDURAL ROSE HEADS & LEAF STEMS
     ========================================================= */

  /* Pointed Rose Leaf */
  function drawLeaf(c, x, y, size, angle, progress) {
    if (progress <= 0.05) return;
    c.save();
    c.translate(x, y);
    c.rotate(angle);
    c.scale(progress, progress);

    c.beginPath();
    c.moveTo(0, 0);
    c.bezierCurveTo(-size * 0.35, -size * 0.3, -size * 0.4, -size * 0.75, 0, -size);
    c.bezierCurveTo(size * 0.4, -size * 0.75, size * 0.35, -size * 0.3, 0, 0);

    const grad = c.createLinearGradient(-size * 0.3, 0, size * 0.3, -size);
    grad.addColorStop(0, '#0c2e17');
    grad.addColorStop(0.5, '#195e30');
    grad.addColorStop(1, '#34d399');

    c.fillStyle = grad;
    c.shadowColor = 'rgba(12, 46, 23, 0.4)';
    c.shadowBlur = 4;
    c.fill();

    // Central vein
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(0, -size * 0.88);
    c.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    c.lineWidth = 1;
    c.stroke();

    c.restore();
  }

  /*
   * Paper-Cut Spiral Layered Rose (Matching TikTok aesthetic in luxury velvet red)
   */
  function drawSpiralRose(c, x, y, radius, bloomProg, colors, isQueen, rot) {
    if (bloomProg <= 0.02) return;

    c.save();
    c.translate(x, y);
    c.rotate(rot);

    // Elastic blossoming scale
    const scale = Math.min(1, bloomProg * 1.15) * (1 + Math.sin(time * 0.035 + rot) * 0.025);
    c.scale(scale, scale);

    // 1. Velvet Crimson Background Glow
    const glowGrad = c.createRadialGradient(0, 0, radius * 0.3, 0, 0, radius * 1.45);
    glowGrad.addColorStop(0, 'rgba(255, 25, 75, 0.35)');
    glowGrad.addColorStop(0.6, 'rgba(180, 0, 40, 0.12)');
    glowGrad.addColorStop(1, 'transparent');
    c.fillStyle = glowGrad;
    c.beginPath();
    c.arc(0, 0, radius * 1.45, 0, Math.PI * 2);
    c.fill();

    // 2. Green Sepals beneath flower
    c.fillStyle = '#114a24';
    for (let s = 0; s < 5; s++) {
      const a = (s / 5) * Math.PI * 2;
      c.save();
      c.rotate(a);
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-radius * 0.16, radius * 0.55);
      c.lineTo(0, radius * 1.08);
      c.lineTo(radius * 0.16, radius * 0.55);
      c.closePath();
      c.fill();
      c.restore();
    }

    // 3. Concentric Spiral Scalloped Petal Layers (Outer to Inner)
    // Layers: Outer Rim -> Mid Flurry -> Inner Cup -> Center Spiral
    const rings = [
      { r: radius * 1.00, petals: 8, fill: colors.outer, rim: colors.highlight, shadow: 'rgba(0,0,0,0.45)' },
      { r: radius * 0.82, petals: 7, fill: colors.mid,   rim: colors.highlight, shadow: 'rgba(0,0,0,0.40)' },
      { r: radius * 0.65, petals: 6, fill: colors.inner, rim: colors.highlight, shadow: 'rgba(0,0,0,0.38)' },
      { r: radius * 0.48, petals: 5, fill: colors.mid,   rim: colors.highlight, shadow: 'rgba(0,0,0,0.35)' },
      { r: radius * 0.32, petals: 4, fill: colors.inner, rim: colors.highlight, shadow: 'rgba(0,0,0,0.30)' },
      { r: radius * 0.18, petals: 3, fill: colors.outer, rim: colors.highlight, shadow: 'rgba(0,0,0,0.25)' }
    ];

    rings.forEach((ring, rIdx) => {
      c.save();
      c.shadowColor = ring.shadow;
      c.shadowBlur = 6;
      c.shadowOffsetY = 2;

      c.beginPath();
      const numPetals = ring.petals;
      const angleStep = (Math.PI * 2) / numPetals;
      const ringOffset = rIdx * 0.52; // Offset rotation between layers for natural interleaving

      for (let p = 0; p < numPetals; p++) {
        const startA = p * angleStep + ringOffset;
        const midA = startA + angleStep * 0.5;
        const endA = startA + angleStep;

        const scallopRadius = ring.r * 1.06;
        const innerRadius = ring.r * 0.88;

        const x0 = Math.cos(startA) * innerRadius;
        const y0 = Math.sin(startA) * innerRadius;
        const xc = Math.cos(midA) * scallopRadius;
        const yc = Math.sin(midA) * scallopRadius;
        const x1 = Math.cos(endA) * innerRadius;
        const y1 = Math.sin(endA) * innerRadius;

        if (p === 0) c.moveTo(x0, y0);
        c.quadraticCurveTo(xc, yc, x1, y1);
      }
      c.closePath();

      // Velvet gradient fill
      const grad = c.createRadialGradient(0, 0, ring.r * 0.2, 0, 0, ring.r);
      grad.addColorStop(0, ring.fill);
      grad.addColorStop(0.85, ring.fill);
      grad.addColorStop(1, colors.outer);
      c.fillStyle = grad;
      c.fill();

      // Scalloped highlight edge
      c.strokeStyle = ring.rim;
      c.globalAlpha = 0.45;
      c.lineWidth = isQueen ? 1.6 : 1.2;
      c.stroke();
      c.restore();
    });

    // 4. Center Rosebud Core Swirl
    c.save();
    c.beginPath();
    const coreR = radius * 0.14;
    c.arc(0, 0, coreR, 0, Math.PI * 2);
    c.fillStyle = colors.outer;
    c.fill();

    // Golden pollen stamen center
    const stamenGlow = c.createRadialGradient(0, 0, 1, 0, 0, coreR * 0.9);
    stamenGlow.addColorStop(0, '#fff4b8');
    stamenGlow.addColorStop(0.5, '#ffd166');
    stamenGlow.addColorStop(1, 'transparent');
    c.fillStyle = stamenGlow;
    c.beginPath();
    c.arc(0, 0, coreR * 0.9, 0, Math.PI * 2);
    c.fill();

    // Diamond Sparkle for Queen Rose
    if (isQueen && bloomProg > 0.8) {
      const spAlpha = (Math.sin(time * 0.08) + 1) * 0.5;
      c.fillStyle = `rgba(255, 255, 255, ${0.9 * spAlpha})`;
      c.beginPath();
      c.arc(0, 0, 3.2, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();

    c.restore();
  }

  /* Unopened Rosebud */
  function drawRosebud(c, x, y, radius, bloomProg, colors, rot) {
    if (bloomProg <= 0.02) return;
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.scale(bloomProg, bloomProg);

    const w = radius * 0.45;
    const h = radius * 0.95;

    // Red petal cone peeking out
    c.beginPath();
    c.moveTo(0, -h * 0.9);
    c.bezierCurveTo(-w * 0.7, -h * 0.4, -w * 0.5, 0, 0, 0);
    c.bezierCurveTo(w * 0.5, 0, w * 0.7, -h * 0.4, 0, -h * 0.9);
    c.fillStyle = colors.inner;
    c.fill();

    // Green wrapping sepals
    c.fillStyle = '#114a24';
    c.beginPath();
    c.moveTo(0, 0);
    c.bezierCurveTo(-w * 0.9, -h * 0.4, -w * 0.6, -h * 0.8, -w * 0.2, -h * 0.85);
    c.bezierCurveTo(-w * 0.3, -h * 0.4, 0, 0, 0, 0);
    c.fill();

    c.beginPath();
    c.moveTo(0, 0);
    c.bezierCurveTo(w * 0.9, -h * 0.4, w * 0.6, -h * 0.8, w * 0.2, -h * 0.85);
    c.bezierCurveTo(w * 0.3, -h * 0.4, 0, 0, 0, 0);
    c.fill();

    c.restore();
  }

  /* =========================================================
     4. ANIMATION & RENDER PIPELINE
     ========================================================= */

  function update() {
    time += 1;

    // Growth progression
    if (isBlooming) {
      growthTime += 0.007; // ~4 seconds for full growth & bloom
      if (growthTime >= 1.0) {
        growthTime = 1.0;
        isBlooming = false;
      }
    }

    spawnShootingStars();

    // Update shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.alpha -= s.fade;
      if (s.alpha <= 0 || s.x > width + 100 || s.y > height + 100) {
        shootingStars.splice(i, 1);
      }
    }

    // Update shockwave ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.radius += r.speed;
      r.opacity = 1 - (r.radius / r.maxRadius);
      if (r.radius >= r.maxRadius) {
        ripples.splice(i, 1);
      }
    }

    // Update 3D falling petals
    for (let i = 0; i < fallingPetals.length; i++) {
      const p = fallingPetals[i];
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.flip) * 0.55;
      p.rot += p.vRot;
      p.flip += p.vFlip;

      if (p.y > height + 25) {
        p.y = -25;
        p.x = Math.random() * width;
      }
      if (p.x < -30) p.x = width + 25;
      if (p.x > width + 30) p.x = -25;
    }

    // Update sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.045;
      s.vx *= 0.96;
      s.vy *= 0.96;
      s.rot += s.vRot;
      s.alpha -= s.decay;

      if (s.alpha <= 0) {
        sparks.splice(i, 1);
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Shooting Stars / Meteors
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < shootingStars.length; i++) {
      const s = shootingStars[i];
      const tailX = s.x - Math.cos(s.angle) * s.length;
      const tailY = s.y - Math.sin(s.angle) * s.length;

      const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.7, `rgba(255, 120, 160, ${s.alpha * 0.6})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${s.alpha})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = s.thickness;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.thickness * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    // 2. Draw Ripples
    for (let i = 0; i < ripples.length; i++) {
      const rp = ripples[i];
      const grad = ctx.createRadialGradient(rp.x, rp.y, Math.max(0, rp.radius - 15), rp.x, rp.y, rp.radius);
      grad.addColorStop(0, 'rgba(255, 20, 60, 0)');
      grad.addColorStop(0.7, `rgba(255, 20, 60, ${rp.opacity * 0.4})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // 3. Draw All Flowers (Stems, Leaves & Rose Blooms)
    const currentGlobalP = growthTime;

    for (let i = 0; i < flowers.length; i++) {
      const f = flowers[i];
      if (currentGlobalP < f.delay) continue;

      // Local progress for this flower (0 to 1)
      const localProg = Math.min(1, (currentGlobalP - f.delay) / 0.55);

      // Phase 1 (0 to 0.65): Stem grows up
      const stemProg = Math.min(1, localProg / 0.65);
      // Phase 2 (0.45 to 1.0): Rose head blossoms
      const bloomProg = Math.max(0, (localProg - 0.45) / 0.55);

      // Natural gentle wind sway
      const sway = Math.sin(time * f.swaySpeed + f.swayPhase) * (8 * stemProg);

      // Current tip position
      const headX = f.targetX + sway;
      const headY = f.rootY + (f.targetY - f.rootY) * stemProg;

      // Draw Stem
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(f.rootX, f.rootY);
      const curCpX = f.cpX + sway * 0.5;
      const curCpY = f.rootY + (f.cpY - f.rootY) * stemProg;
      ctx.quadraticCurveTo(curCpX, curCpY, headX, headY);

      const stemGrad = ctx.createLinearGradient(f.rootX, f.rootY, headX, headY);
      stemGrad.addColorStop(0, '#0c2e17');
      stemGrad.addColorStop(0.6, '#1a5c31');
      stemGrad.addColorStop(1, '#34d399');

      ctx.strokeStyle = stemGrad;
      ctx.lineWidth = f.stemThick;
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 4;
      ctx.stroke();

      // Draw Leaves along the stem as it rises
      for (let l = 0; l < f.leaves.length; l++) {
        const leaf = f.leaves[l];
        if (stemProg >= leaf.t) {
          const leafProg = Math.min(1, (stemProg - leaf.t) / 0.25);
          // Point on Bezier curve
          const t = leaf.t;
          const invT = 1 - t;
          const lx = invT * invT * f.rootX + 2 * invT * t * curCpX + t * t * headX;
          const ly = invT * invT * f.rootY + 2 * invT * t * curCpY + t * t * headY;
          drawLeaf(ctx, lx, ly, leaf.size, leaf.angle, leafProg);
        }
      }
      ctx.restore();

      // Draw Rose Head / Bud at the stem tip
      if (bloomProg > 0) {
        if (f.isBud) {
          drawRosebud(ctx, headX, headY, f.radius, bloomProg, f.colors, f.rotation + sway * 0.015);
        } else {
          drawSpiralRose(ctx, headX, headY, f.radius, bloomProg, f.colors, f.isQueen, f.rotation + sway * 0.015);
        }
      }
    }

    // 4. Draw 3D Falling Rose Petals
    for (let i = 0; i < fallingPetals.length; i++) {
      const p = fallingPetals[i];
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.flip));

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-p.size * 0.5, -p.size * 0.4, -p.size * 0.5, p.size * 0.8, 0, p.size);
      ctx.bezierCurveTo(p.size * 0.5, p.size * 0.8, p.size * 0.5, -p.size * 0.4, 0, 0);

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.shadowColor = 'rgba(255, 30, 70, 0.4)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }

    // 5. Draw Sparks & Interactive Hearts
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < sparks.length; i++) {
      const s = sparks[i];
      if (s.isHeart) {
        drawMiniHeart(ctx, s.x, s.y, s.size * 3.4, s.color, s.alpha, s.rot);
      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha;
        ctx.fill();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  /* =========================================================
     5. USER INTERACTIONS & CARD MODAL
     ========================================================= */

  function triggerRebloom() {
    initFlowerMeadow();
    playSoftChime(0.5);
    createSoftBurst(width / 2, height * 0.6, 35);
  }

  rebloomBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    triggerRebloom();
  });

  function openGreetingCard() {
    cardModal.classList.add('active');
    playSoftChime(0.65);
    createSoftBurst(width / 2, height / 2, 50);

    // Update button text to "Đọc Lại Thiệp" like TikTok
    if (cardBtnText) {
      cardBtnText.textContent = 'Đọc Lại Thiệp 20/10';
    }

    if (!isAudioPlaying) {
      startBackgroundMelody();
    }
  }

  function closeGreetingCard() {
    cardModal.classList.remove('active');
  }

  openCardBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openGreetingCard();
  });

  closeModalBtn.addEventListener('click', closeGreetingCard);
  backToGardenBtn.addEventListener('click', closeGreetingCard);

  cardModal.addEventListener('click', (e) => {
    if (e.target === cardModal) closeGreetingCard();
  });

  // Send hearts
  burstHeartsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playSoftChime(0.9);

    for (let k = 0; k < 5; k++) {
      setTimeout(() => {
        const rx = width * 0.15 + Math.random() * width * 0.7;
        const ry = height * 0.2 + Math.random() * height * 0.5;
        createSoftBurst(rx, ry, 35);
      }, k * 130);
    }
  });

  // Interactive tap / click on canvas
  function onCanvasTouch(x, y) {
    playSoftChime(x / width);
    createSoftBurst(x, y, 32);

    if (!isAudioPlaying) {
      startBackgroundMelody();
    }
  }

  canvas.addEventListener('click', (e) => {
    onCanvasTouch(e.clientX, e.clientY);
  });

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      onCanvasTouch(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  // Cursor sparkles trail
  let lastSparkTime = 0;
  window.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastSparkTime > 40 && !cardModal.classList.contains('active')) {
      lastSparkTime = now;
      if (Math.random() > 0.4) {
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2 - 0.4,
          size: Math.random() * 2 + 1,
          alpha: 0.9,
          decay: 0.03,
          color: Math.random() > 0.5 ? '#ff4d79' : '#ffffff',
          isHeart: Math.random() > 0.65,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.08
        });
      }
    }
  });

  window.addEventListener('resize', resize);

  // Initialize
  resize();
  loop();

})();
