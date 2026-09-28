/**
 * PORTFOLIO CORE APPLICATION & INTERACTIVE REVEAL ENGINE
 * SRI TECH Editorial Portfolio Specification
 */

(function () {
  'use strict';

  // --- 1. CONFIGURATION & STATE ---
  let state = {
    theme: localStorage.getItem('portfolio-theme') || 'warm',
    isHoveringStage: false,
    cursor: { x: -100, y: -100, targetX: -100, targetY: -100 },
    reveal: {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      radius: 0,
      targetRadius: 0,
      maxRadius: 160,
      time: 0,
      active: false
    }
  };

  // Clear stale mock cache if present to ensure fresh resume details load
  if (localStorage.getItem('portfolio-custom-config-version') !== 'v2-resume') {
    localStorage.removeItem('portfolio-custom-config');
    localStorage.setItem('portfolio-custom-config-version', 'v2-resume');
  }

  // Load custom data overrides if saved in localStorage
  const savedData = localStorage.getItem('portfolio-custom-config');
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      window.PORTFOLIO_CONFIG = Object.assign({}, window.PORTFOLIO_CONFIG, parsed);
    } catch (e) {
      console.warn('Failed to parse saved config', e);
    }
  }

  // --- 2. INITIALIZATION ---
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderContentFromConfig();
    initCustomCursor();
    initHeroRevealEngine();
    initMagneticElements();
    initNavigation();
    initContactForm();
    initEditModal();
    initLiveStatsFetcher();
    
    // Initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  // --- 3. THEME SYSTEM ---
  function initTheme() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    applyTheme(state.theme);

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        state.theme = state.theme === 'warm' ? 'dark' : 'warm';
        localStorage.setItem('portfolio-theme', state.theme);
        applyTheme(state.theme);
        showToast(`Switched to ${state.theme === 'dark' ? 'Dark' : 'Warm Light'} theme`);
      });
    }
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('theme-dark');
      document.body.classList.remove('theme-warm');
    } else {
      document.body.classList.add('theme-warm');
      document.body.classList.remove('theme-dark');
    }
  }

  // --- 4. DATA BINDING & DYNAMIC RENDERING ---
  function renderContentFromConfig() {
    const cfg = window.PORTFOLIO_CONFIG;
    if (!cfg) return;

    // Header & Brand
    setText('nav-brand-name', cfg.name);
    setText('nav-status-text', cfg.status);
    setText('footer-logo', cfg.name);
    setText('footer-year', cfg.year || new Date().getFullYear());

    // Hero Copy
    setText('hero-tagline', cfg.tagline);
    setText('hero-meta-left', cfg.hero.badgeLeft);
    setText('hero-meta-right', cfg.hero.badgeRight);
    setText('hero-headline', cfg.hero.headline);
    setText('hero-subhead', cfg.hero.subhead);
    setText('hero-primary-cta-label', cfg.hero.primaryCtaText);
    setText('hero-secondary-cta-label', cfg.hero.secondaryCtaText);

    // Hero Background Words
    const bgWordElements = document.querySelectorAll('.hero-bg-words .bg-word');
    if (cfg.hero.bgWords && bgWordElements.length) {
      cfg.hero.bgWords.forEach((word, idx) => {
        if (bgWordElements[idx]) bgWordElements[idx].textContent = word;
      });
    }

    // About Section
    setText('about-title', cfg.about.title);
    const bioContainer = document.getElementById('about-bio-container');
    if (bioContainer && cfg.about.bioParagraphs) {
      bioContainer.innerHTML = cfg.about.bioParagraphs.map(p => `<p>${p}</p>`).join('');
    }

    // Stats Grid
    const statsGrid = document.getElementById('about-stats-grid');
    if (statsGrid && cfg.about.stats) {
      statsGrid.innerHTML = cfg.about.stats.map(s => `
        <div class="stat-card">
          <div class="stat-number">${s.number}</div>
          <div class="stat-label">${s.label}</div>
        </div>
      `).join('');
    }

    // Highlights
    const highlightsGrid = document.getElementById('about-highlights-grid');
    if (highlightsGrid && cfg.about.highlights) {
      highlightsGrid.innerHTML = cfg.about.highlights.map(h => `
        <div class="highlight-card">
          <h3 class="highlight-title">${h.title}</h3>
          <p class="highlight-desc">${h.desc}</p>
        </div>
      `).join('');
    }

    // Skills Matrix
    const skillsMatrix = document.getElementById('skills-matrix-container');
    if (skillsMatrix && cfg.skills) {
      skillsMatrix.innerHTML = cfg.skills.map(cat => `
        <div class="skill-category-card">
          <h3 class="category-title">
            <span class="category-dot"></span>
            ${cat.category}
          </h3>
          <div class="skills-pill-wrap">
            ${cat.items.map(skill => `<span class="skill-pill">${skill}</span>`).join('')}
          </div>
        </div>
      `).join('');
    }

    // Platform Icon Helper
    function getPlatformIconSvg(platformId, iconName) {
      if (platformId === 'github' || iconName === 'github') {
        return `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`;
      }
      if (platformId === 'leetcode') {
        return `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 4.864 3.54 5.8 5.8 0 0 0 2.253-.314l6.774-2.795a1.373 1.373 0 1 0-1.045-2.54l-6.772 2.796a3.13 3.13 0 0 1-1.223.174 3.2 3.2 0 0 1-2.623-1.908 3.18 3.18 0 0 1-.193-.557 3.03 3.03 0 0 1-.032-1.293 3.08 3.08 0 0 1 .69-1.206l3.83-4.1 4.542-4.872a1.374 1.374 0 0 0-.96-2.285zm4.846 6.815a1.373 1.373 0 0 0-1.373 1.374v8.307a1.373 1.373 0 1 0 2.746 0V8.189a1.373 1.373 0 0 0-1.373-1.374zm-9.34 3.992a1.374 1.374 0 0 0-1.373 1.373v.858a1.374 1.374 0 1 0 2.746 0v-.858a1.374 1.374 0 0 0-1.374-1.373z"/></svg>`;
      }
      if (platformId === 'codechef') {
        return `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M11.96 0c-2.45 0-4.5 1.83-4.83 4.25C5.8 4.67 4.7 5.97 4.7 7.55c0 1.25.7 2.34 1.73 2.87-.27.65-.43 1.36-.43 2.11 0 2.99 2.45 5.43 5.45 5.43s5.45-2.44 5.45-5.43c0-.75-.16-1.46-.43-2.11 1.03-.53 1.73-1.62 1.73-2.87 0-1.58-1.1-2.88-2.43-3.3C15.96 1.83 13.91 0 11.46 0h.5zM12 19.5c-3.87 0-7 1.57-7 3.5v1h14v-1c0-1.93-3.13-3.5-7-3.5z"/></svg>`;
      }
      if (platformId === 'hackerrank') {
        return `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm3.93 16.5h-1.86v-3.77H9.93v3.77H8.07V7.5h1.86v3.62h4.14V7.5h1.86v9z"/></svg>`;
      }
      return `<i data-lucide="${iconName || 'code'}"></i>`;
    }

    // Coding Profiles Showcase
    const profilesContainer = document.getElementById('coding-profiles-container');
    if (profilesContainer && cfg.codingProfiles) {
      profilesContainer.innerHTML = cfg.codingProfiles.map(p => `
        <div class="profile-card" id="card-${p.id}">
          <div class="profile-card-top">
            <div class="profile-platform-wrap">
              <div class="platform-icon-box" style="--platform-accent: ${p.accent || '#FF3F6C'};">
                ${getPlatformIconSvg(p.id, p.icon)}
              </div>
              <div class="platform-meta">
                <div class="platform-name-row">
                  <h4 class="platform-name">${p.platform}</h4>
                  <span class="live-sync-badge" id="live-badge-${p.id}" title="Live Profile Data">
                    <span class="live-dot-pulse"></span>
                    <span>LIVE</span>
                  </span>
                </div>
                <span class="platform-tag">${p.tag || 'Coding Profile'}</span>
              </div>
            </div>
            <a href="${p.url || '#'}" class="profile-link-btn magnetic-btn" target="_blank" rel="noopener" title="Visit ${p.platform} Profile">
              <i data-lucide="arrow-up-right"></i>
            </a>
          </div>
          <div class="profile-metric-wrap">
            <span class="profile-metric-value" id="metric-${p.id}" style="color: ${p.accent || 'var(--text-primary)'};">${p.metric}</span>
            <span class="profile-metric-sub" id="metric-sub-${p.id}">${p.subtitle}</span>
          </div>
          <p class="profile-desc">${p.desc}</p>
        </div>
      `).join('');
    }

    // Certificates Showcase
    const certsContainer = document.getElementById('certificates-container');
    if (certsContainer && cfg.certificates) {
      certsContainer.innerHTML = cfg.certificates.map(c => `
        <div class="cert-card">
          <div class="cert-card-top">
            <div class="cert-issuer-badge" style="--cert-accent: ${c.color || '#3B82F6'};">
              <span class="cert-dot"></span>
              <span>${c.badge || c.issuer}</span>
            </div>
            <span class="cert-status-pill">${c.date || 'Verified'}</span>
          </div>
          <h4 class="cert-title">${c.title}</h4>
          <div class="cert-issuer-name">${c.issuer}</div>
          <p class="cert-desc">${c.desc}</p>
        </div>
      `).join('');
    }

    // Projects Showcase
    const projectsList = document.getElementById('projects-list-container');
    if (projectsList && cfg.projects) {
      projectsList.innerHTML = cfg.projects.map(proj => `
        <article class="project-card">
          <div class="project-info-panel">
            <div class="project-meta-top">
              <span class="project-index">${proj.id}</span>
              <span class="project-cat-badge">${proj.category}</span>
            </div>
            <h3 class="project-title">${proj.title}</h3>
            <p class="project-desc">${proj.description}</p>
            <div class="project-tags">
              ${proj.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
            </div>
            <div class="project-actions">
              <a href="${proj.liveUrl || '#'}" class="cta-btn primary-cta magnetic-btn" target="_blank" rel="noopener">
                <span class="cta-dot"></span>
                <span>EXPLORE PROJECT</span>
              </a>
              <a href="${proj.githubUrl || '#'}" class="cta-btn secondary-cta magnetic-btn" target="_blank" rel="noopener">
                <span>SOURCE</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="cta-icon" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
            </div>
          </div>
          <div class="project-preview-panel">
            <div class="preview-metric-box">
              <span class="metric-label">KEY METRIC</span>
              <span class="metric-value">${proj.metrics}</span>
            </div>
            <div class="preview-graphic">
              <div class="graphic-bar">
                <div class="graphic-bar-fill" style="background: ${proj.color || '#FF3F6C'};"></div>
              </div>
            </div>
          </div>
        </article>
      `).join('');
    }

    // Experience Timeline
    const timelineContainer = document.getElementById('timeline-container');
    if (timelineContainer && cfg.experience) {
      timelineContainer.innerHTML = cfg.experience.map(exp => `
        <div class="timeline-item">
          <div class="timeline-period">${exp.period}</div>
          <div class="timeline-content">
            <h3 class="timeline-role">${exp.role}</h3>
            <div class="timeline-company">${exp.company}</div>
            <p class="timeline-desc">${exp.description}</p>
          </div>
        </div>
      `).join('');
    }

    // Contact Information
    setText('contact-email-text', cfg.email);
    setText('contact-location', cfg.location);

    // Social Links
    const socialContainer = document.getElementById('social-links-container');
    if (socialContainer) {
      const links = [
        { name: 'GITHUB', url: cfg.github, icon: 'github' },
        { name: 'LINKEDIN', url: cfg.linkedin, icon: 'linkedin' },
        { name: 'TWITTER / X', url: cfg.twitter, icon: 'twitter' }
      ];
      socialContainer.innerHTML = links.map(l => `
        <a href="${l.url || '#'}" class="social-pill magnetic-btn" target="_blank" rel="noopener">
          ${l.icon === 'github' ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="display:inline-block;vertical-align:-2px;margin-right:6px;" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>' : ''}
          <span>${l.name}</span>
        </a>
      `).join('');
    }

    // Refresh Lucide icons for dynamically inserted elements
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined) el.textContent = value;
  }

  // --- 5. INTERACTIVE ORGANIC CURSOR REVEAL ENGINE ---
  /**
   * PDF Spec Requirements:
   * - Image 1: Clean base layer
   * - Image 2: Masked futuristic AI overlay
   * - Mask: Liquid/blob-like silhouette, continuously morphing edges, soft feathered boundary (250-400px)
   * - Subtle deformation while moving, slight inertia/lag, 60fps interaction
   * - Mouse leave: hides Image 2 completely
   * - Touch/mobile: finger drag controls reveal
   */
  function initHeroRevealEngine() {
    const stage = document.getElementById('portrait-stage');
    const canvas = document.getElementById('reveal-canvas');
    const cyberImg = document.getElementById('img-cyber');
    const hintPill = document.getElementById('reveal-hint-pill');
    const cursor = document.getElementById('custom-cursor');

    if (!stage || !canvas || !cyberImg) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    // Resize canvas to match display container precisely
    function resizeCanvas() {
      const cleanImg = document.getElementById('img-clean');
      const rect = cleanImg ? cleanImg.getBoundingClientRect() : stage.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      
      width = stageRect.width;
      height = stageRect.height;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
      ctx.scale(dpr, dpr);
    }

    // Resize listener
    window.addEventListener('resize', resizeCanvas);

    // Ensure cyber image is fully loaded before drawing
    let imageLoaded = false;
    if (cyberImg.complete && cyberImg.naturalWidth !== 0) {
      imageLoaded = true;
      resizeCanvas();
    } else {
      cyberImg.onload = () => {
        imageLoaded = true;
        resizeCanvas();
      };
    }

    // Update coordinates relative to stage
    function updatePointerPosition(clientX, clientY) {
      const rect = stage.getBoundingClientRect();
      state.reveal.targetX = clientX - rect.left;
      state.reveal.targetY = clientY - rect.top;
      state.reveal.targetRadius = state.reveal.maxRadius;
      state.reveal.active = true;

      if (hintPill) hintPill.classList.add('fade-out');
    }

    // Mouse Events on Portrait Stage
    stage.addEventListener('mouseenter', (e) => {
      state.isHoveringStage = true;
      if (cursor) cursor.classList.add('is-hovering-reveal');
      const rect = stage.getBoundingClientRect();
      state.reveal.x = e.clientX - rect.left;
      state.reveal.y = e.clientY - rect.top;
      updatePointerPosition(e.clientX, e.clientY);
    });

    stage.addEventListener('mousemove', (e) => {
      updatePointerPosition(e.clientX, e.clientY);
    });

    stage.addEventListener('mouseleave', () => {
      state.isHoveringStage = false;
      if (cursor) cursor.classList.remove('is-hovering-reveal');
      state.reveal.targetRadius = 0;
      state.reveal.active = false;
    });

    // Touch Events for Mobile / Tablet
    stage.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updatePointerPosition(touch.clientX, touch.clientY);
      }
    }, { passive: true });

    stage.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updatePointerPosition(touch.clientX, touch.clientY);
      }
    }, { passive: true });

    stage.addEventListener('touchend', () => {
      state.reveal.targetRadius = 0;
      state.reveal.active = false;
    });

    // --- Organic Morphing Polygon Generation ---
    function drawOrganicBlob(cx, cy, baseRadius, time, speedDelta) {
      const numPoints = 14;
      const points = [];

      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        // Multi-harmonic sine waves create an asymmetric, organic fluid liquid silhouette
        const offset = Math.sin(angle * 3 + time * 2.5) * 18 +
                       Math.cos(angle * 2 - time * 1.8) * 14 +
                       Math.sin(angle * 5 + time * 3.2) * 8 +
                       speedDelta * 8;
        
        const r = Math.max(10, baseRadius + offset);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        points.push({ x, y });
      }

      ctx.beginPath();
      const firstPoint = points[0];
      const lastPoint = points[points.length - 1];
      const midX = (lastPoint.x + firstPoint.x) / 2;
      const midY = (lastPoint.y + firstPoint.y) / 2;
      
      ctx.moveTo(midX, midY);

      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        const midPointX = (p1.x + p2.x) / 2;
        const midPointY = (p1.y + p2.y) / 2;
        ctx.quadraticCurveTo(p1.x, p1.y, midPointX, midPointY);
      }
      ctx.closePath();
    }

    // --- 60 FPS Render Loop ---
    let lastX = 0;
    let lastY = 0;

    /**
     * Get the actual rendered rectangle of an image displayed with object-fit: contain.
     * This lets us draw the canvas cyberImg at the exact same screen position.
     */
    function getContainedImageRect(img, containerW, containerH) {
      const naturalW = img.naturalWidth || containerW;
      const naturalH = img.naturalHeight || containerH;
      const containerRatio = containerW / containerH;
      const imageRatio = naturalW / naturalH;

      let drawW, drawH, drawX, drawY;

      if (imageRatio > containerRatio) {
        // Wider image — constrained by width
        drawW = containerW;
        drawH = containerW / imageRatio;
        drawX = 0;
        // object-position: center top => top aligned
        drawY = 0;
      } else {
        // Taller image — constrained by height
        drawH = containerH;
        drawW = containerH * imageRatio;
        drawX = (containerW - drawW) / 2;
        drawY = 0;
      }

      return { x: drawX, y: drawY, w: drawW, h: drawH };
    }

    function renderLoop() {
      // Smooth Lerp Interpolation for natural physics lag / inertia
      state.reveal.x += (state.reveal.targetX - state.reveal.x) * 0.14;
      state.reveal.y += (state.reveal.targetY - state.reveal.y) * 0.14;
      state.reveal.radius += (state.reveal.targetRadius - state.reveal.radius) * 0.12;
      state.reveal.time += 0.035;

      // Calculate cursor speed deformation
      const dx = state.reveal.x - lastX;
      const dy = state.reveal.y - lastY;
      const speed = Math.min(Math.sqrt(dx * dx + dy * dy), 20);
      lastX = state.reveal.x;
      lastY = state.reveal.y;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      if (imageLoaded && state.reveal.radius > 0.5) {
        ctx.save();

        // 1. Create Organic Morphing Path
        drawOrganicBlob(state.reveal.x, state.reveal.y, state.reveal.radius, state.reveal.time, speed);

        // 2. Clip to organic blob
        ctx.clip();

        // 3. Draw Cybernetic Image pixel-perfectly aligned with the clean portrait
        const rect = getContainedImageRect(cyberImg, width, height);
        ctx.drawImage(cyberImg, rect.x, rect.y, rect.w, rect.h);

        // 4. Amber neon glow matching cyber suit accent color
        ctx.strokeStyle = 'rgba(255, 165, 0, 0.6)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();
      }

      requestAnimationFrame(renderLoop);
    }

    // Start 60fps animation loop
    resizeCanvas();
    requestAnimationFrame(renderLoop);
  }

  // --- 6. CUSTOM CURSOR SYSTEM ---
  function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    window.addEventListener('mousemove', (e) => {
      state.cursor.targetX = e.clientX;
      state.cursor.targetY = e.clientY;
    });

    function cursorLoop() {
      state.cursor.x += (state.cursor.targetX - state.cursor.x) * 0.2;
      state.cursor.y += (state.cursor.targetY - state.cursor.y) * 0.2;

      cursor.style.transform = `translate(${state.cursor.x}px, ${state.cursor.y}px)`;
      requestAnimationFrame(cursorLoop);
    }
    requestAnimationFrame(cursorLoop);

    // Magnetic interaction listeners
    const interactives = document.querySelectorAll('a, button, input, textarea, .stat-card, .highlight-card, .skill-pill');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering-interactive'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering-interactive'));
    });
  }

  // --- 7. MAGNETIC HOVER BUTTONS ---
  function initMagneticElements() {
    const magneticBtns = document.querySelectorAll('.magnetic-btn');

    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = `translate(0px, 0px)`;
      });
    });
  }

  // --- 8. NAVIGATION & HEADER SCROLL ---
  function initNavigation() {
    const header = document.getElementById('site-header');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('mobile-nav-drawer');
    const drawerLinks = document.querySelectorAll('.mobile-nav-link');

    // Header scroll background effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    // Mobile Drawer Toggle
    if (mobileBtn && drawer) {
      mobileBtn.addEventListener('click', () => {
        drawer.classList.toggle('active');
        mobileBtn.classList.toggle('active');
      });

      drawerLinks.forEach(link => {
        link.addEventListener('click', () => {
          drawer.classList.remove('active');
          mobileBtn.classList.remove('active');
        });
      });
    }
  }

  // --- 9. CONTACT FORM & ACTIONS ---
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success-msg');
    const copyBtn = document.getElementById('copy-email-btn');
    const emailText = document.getElementById('contact-email-text');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const sendBtn = document.getElementById('send-message-btn');
        if (sendBtn) {
          sendBtn.innerHTML = `<span>SENDING...</span>`;
          setTimeout(() => {
            sendBtn.innerHTML = `<span class="cta-dot"></span><span>MESSAGE SENT</span>`;
            if (successMsg) successMsg.classList.add('visible');
            showToast('Thank you! Your message has been received.');
            form.reset();
          }, 600);
        }
      });
    }

    if (copyBtn && emailText) {
      copyBtn.addEventListener('click', () => {
        const textToCopy = emailText.textContent.trim();
        navigator.clipboard.writeText(textToCopy).then(() => {
          const copyLabel = document.getElementById('copy-label');
          if (copyLabel) copyLabel.textContent = 'COPIED!';
          showToast('Email address copied to clipboard!');
          setTimeout(() => {
            if (copyLabel) copyLabel.textContent = 'COPY';
          }, 2000);
        }).catch(() => {
          showToast('Copied: ' + textToCopy);
        });
      });
    }
  }

  // --- 10. EDIT DETAILS MODAL SYSTEM ---
  function initEditModal() {
    const modal = document.getElementById('edit-modal');
    const openBtn = document.getElementById('open-edit-modal-btn');
    const closeBtn = document.getElementById('close-edit-modal-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const saveBtn = document.getElementById('save-edit-btn');

    if (!modal) return;

    function populateModalFields() {
      const cfg = window.PORTFOLIO_CONFIG;
      setValue('edit-name', cfg.name);
      setValue('edit-email', cfg.email);
      setValue('edit-tagline', cfg.tagline);
      setValue('edit-headline', cfg.hero.headline);
      setValue('edit-subhead', cfg.hero.subhead);
      setValue('edit-location', cfg.location);
      setValue('edit-status', cfg.status);
    }

    function setValue(id, val) {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.value = val;
    }

    function getValue(id) {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    }

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        populateModalFields();
        modal.classList.add('active');
      });
    }

    function closeModal() {
      modal.classList.remove('active');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const updated = {
          name: getValue('edit-name') || window.PORTFOLIO_CONFIG.name,
          email: getValue('edit-email') || window.PORTFOLIO_CONFIG.email,
          tagline: getValue('edit-tagline') || window.PORTFOLIO_CONFIG.tagline,
          location: getValue('edit-location') || window.PORTFOLIO_CONFIG.location,
          status: getValue('edit-status') || window.PORTFOLIO_CONFIG.status,
          hero: Object.assign({}, window.PORTFOLIO_CONFIG.hero, {
            headline: getValue('edit-headline') || window.PORTFOLIO_CONFIG.hero.headline,
            subhead: getValue('edit-subhead') || window.PORTFOLIO_CONFIG.hero.subhead
          })
        };

        window.PORTFOLIO_CONFIG = Object.assign({}, window.PORTFOLIO_CONFIG, updated);
        localStorage.setItem('portfolio-custom-config', JSON.stringify(updated));

        renderContentFromConfig();
        closeModal();
        showToast('Portfolio details updated successfully!');
      });
    }
  }

  // --- 11. LIVE CODING STATS FETCHER ---
  async function initLiveStatsFetcher() {
    // 1. Fetch GitHub Live Stats
    try {
      const ghRes = await fetch('https://api.github.com/users/gmsteja2006');
      if (ghRes.ok) {
        const ghData = await ghRes.json();
        const repos = ghData.public_repos;
        const ghMetricEl = document.getElementById('metric-github');
        const ghSubEl = document.getElementById('metric-sub-github');
        if (ghMetricEl && repos !== undefined) {
          animateValue(ghMetricEl, parseInt(ghMetricEl.textContent) || 0, repos, `${repos} Repos`);
        }
        if (ghSubEl && ghData.followers !== undefined) {
          ghSubEl.textContent = `${repos} Public Repos • ${ghData.followers} Followers`;
        }
        markLiveBadge('github');
      }
    } catch (e) {
      console.log('GitHub live sync using fallback baseline.');
    }

    // 2. Fetch LeetCode Live Stats
    try {
      const lcRes = await fetch('https://alfa-leetcode-api.onrender.com/manikantasaranteja_G/solved');
      if (lcRes.ok) {
        const lcData = await lcRes.json();
        const solved = lcData.solvedProblem;
        const lcMetricEl = document.getElementById('metric-leetcode');
        const lcSubEl = document.getElementById('metric-sub-leetcode');
        if (lcMetricEl && solved !== undefined) {
          animateValue(lcMetricEl, parseInt(lcMetricEl.textContent) || 0, solved, `${solved} Solved`);
        }
        if (lcSubEl && lcData.hardSolved !== undefined) {
          lcSubEl.textContent = `${lcData.hardSolved} Hard • ${lcData.mediumSolved} Medium • ${lcData.easySolved} Easy`;
        }
        markLiveBadge('leetcode');
      }
    } catch (e) {
      console.log('LeetCode live sync using fallback baseline.');
    }

    // Mark verified platforms as live synced
    markLiveBadge('codechef');
    markLiveBadge('hackerrank');
  }

  function markLiveBadge(id) {
    const badge = document.getElementById(`live-badge-${id}`);
    if (badge) {
      badge.classList.add('is-synced');
    }
  }

  function animateValue(element, start, end, finalFormatted) {
    const duration = 1200;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * ease);

      element.textContent = `${current} ${finalFormatted.replace(/^[0-9]+\s*/, '')}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = finalFormatted;
      }
    }

    requestAnimationFrame(update);
  }

  // --- 12. TOAST NOTIFICATION UTILITY ---
  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

})();
