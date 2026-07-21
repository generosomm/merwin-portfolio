// main.js
// Loads content from /data/*.json and renders each section.
// To change site content, just edit the JSON files — no need to touch this file.
// If a JSON file is missing/broken, that section shows a graceful fallback.

const DATA_FILES = {
  nav:          "data/nav.json",
  hero:         "data/hero.json",
  work:         "data/work.json",
  services:     "data/services.json",
  stats:        "data/stats.json",
  testimonials: "data/testimonials.json",
  skills:       "data/skills.json",
  dev:          "data/dev.json",
  about:        "data/about.json",
  contact:      "data/contact.json",
};

// ── Helpers ──────────────────────────────────────────────────

function esc(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function pick(obj, key, fallback = "") {
  const v = obj ? obj[key] : undefined;
  return v === undefined || v === null ? fallback : v;
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function emptyState(message) {
  return `<p class="load-msg" style="padding:32px 0;">${esc(message)}</p>`;
}

function revealDelay(i) {
  return `${Math.min(i, 8) * 65}ms`;
}

// Azurio-style section index label e.g. "01 / WORK"
function sectionIndex(num, label) {
  return `<span class="section-index">${String(num).padStart(2,"0")} / ${label}</span>`;
}

// ── Data loading ──────────────────────────────────────────────

async function loadData() {
  const results = await Promise.allSettled(
    Object.entries(DATA_FILES).map(async ([key, path]) => {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error(`${path} responded ${res.status}`);
      const json = await res.json();
      return [key, json];
    })
  );

  const data = {};
  const failed = [];

  results.forEach((result, i) => {
    const key = Object.keys(DATA_FILES)[i];
    if (result.status === "fulfilled") {
      data[result.value[0]] = result.value[1];
    } else {
      failed.push(key);
      data[key] = null;
      console.warn(`Couldn't load "${key}":`, result.reason?.message || result.reason);
    }
  });

  return { data, failed };
}

// ── Render functions ──────────────────────────────────────────

function renderNav(data) {
  const el = document.getElementById("nav-root");
  if (!el) return;
  const items = list(data && data.items);

  if (!items.length) { el.innerHTML = ""; return; }

  const brand = esc(pick(data, "brand", "MG"));
  // Split brand at first space for accent coloring e.g. "MERWIN GENEROSO"
  const brandParts = brand.split(" ");
  const brandHTML = brandParts.length > 1
    ? `${brandParts[0]} <strong>${brandParts.slice(1).join(" ")}</strong>`
    : brand;

  el.innerHTML = `
    <div class="timeline-track" id="timelineTrack">
      <span class="tl-brand">${brandHTML}</span>
      ${items
        .map((item) => {
          if (!item || !item.target || !item.label) return "";
          return `
        <button class="marker" data-target="${esc(item.target)}">
          <span class="tc">${esc(pick(item, "tc", ""))}</span>
          <span class="label">${esc(item.label)}</span>
        </button>`;
        })
        .join("")}
    </div>`;
}

function renderHero(data) {
  const el = document.getElementById("home");
  if (!el) return;
  if (!data) { el.innerHTML = emptyState("Hero content is missing."); return; }

  const stats        = list(data.stats);
  const ctaPrimary   = data.ctaPrimary   || {};
  const ctaSecondary = data.ctaSecondary || {};

  // Roles for the horizontal scrolling ticker
  const roles = data.roles || [
    "Video Editor",
    "Virtual Assistant",
    "Content Creator",
    "Content Operator",
  ];

  // Build one set of ticker items, duplicated for seamless loop
  const roleItem = (r) =>
    `<span class="role-ticker-item">
       <span class="role-prefix">Available as —</span>
       <span class="role-name">${esc(r)}</span>
       <span class="role-sep">/</span>
     </span>`;
  const roleTicker =
    `<div class="hero-role-wrap" aria-label="Available roles" role="marquee">
       <div class="role-ticker-track" id="roleTicker">
         ${roles.map(roleItem).join("")}
         ${roles.map(roleItem).join("")}
       </div>
     </div>`;

  el.innerHTML = `
    <div class="hero-main">
      <div class="hero-copy">
        <span class="hero-index">00 / INTRO</span>

        ${roleTicker}

        <h1>
          <span class="line">${esc(pick(data, "nameLine1", "MERWIN"))}</span>
          <span class="line">${esc(pick(data, "nameLine2Start", "GENE"))}<span class="accent">${esc(pick(data, "nameLine2Accent", "ROSO"))}</span></span>
        </h1>

        <p class="hero-sub">${esc(pick(data, "tagline", ""))}</p>

        <div class="hero-cta">
          ${ctaPrimary.label   ? `<a href="${esc(pick(ctaPrimary,  "href","#"))}" class="btn-primary">${esc(ctaPrimary.label)} →</a>`  : ""}
          ${ctaSecondary.label ? `<a href="${esc(pick(ctaSecondary,"href","#"))}" class="btn-ghost">${esc(ctaSecondary.label)}</a>`    : ""}
        </div>

        ${stats.length
          ? `<div class="hero-stats">
               ${stats.map((s) =>
                 `<div>
                    <strong>${esc(pick(s, "value", "N/A"))}</strong>
                    <span>${esc(pick(s, "label", ""))}</span>
                  </div>`).join("")}
             </div>`
          : ""}
      </div>
    </div>`;
}

function renderWork(data) {

  const el = document.getElementById("work");
  if (!el) return;
  if (!data) { el.innerHTML = emptyState("Work section is missing."); return; }

  const items = list(data.items);

  const cardHTML = (item) => {
    if (!item) return "";
    const hasVideo = !!item.video;
    const bg = item.image
      ? `background-image:url('${esc(item.image)}');`
      : `--c1:${esc(pick(item,"c1","#1a1b20"))}; --c2:${esc(pick(item,"c2","#0D0E10"))};`;
    return `
      <article class="case-card">
        <div class="case-frame${hasVideo ? " has-video" : ""}" style="${bg}"${
          hasVideo
            ? ` data-video="${esc(item.video)}" role="button" tabindex="0" aria-label="Play video: ${esc(pick(item,"title","project video"))}"`
            : ""
        }>
          <span class="case-badge">${esc(pick(item,"badge","Project"))}</span>
          ${hasVideo ? `<div class="play-icon"></div>` : ""}
        </div>
        <div class="case-body">
          <h3>${esc(pick(item,"title","Untitled project"))}</h3>
          ${item.stat ? `<p class="case-stat">${esc(item.stat)}</p>` : ""}
          <p>${esc(pick(item,"desc",""))}</p>
          ${item.postUrl
            ? `<a href="${esc(item.postUrl)}" target="_blank" rel="noopener" class="case-link">Watch original post →</a>`
            : ""}
        </div>
      </article>`;
  };

  el.innerHTML = `
    <div class="section-head reveal">
      ${sectionIndex(1, "Selected Work")}
      <h2>${esc(pick(data,"heading",""))}</h2>
      <p>${esc(pick(data,"sub",""))}</p>
    </div>
    ${items.length
      ? `<div class="case-marquee" id="workMarquee">
           <div class="case-track" id="workTrack">
             ${items.map(cardHTML).join("")}
             ${items.map(cardHTML).join("")}
           </div>
         </div>`
      : emptyState("No work added yet — add items to data/work.json.")}`;
}

function renderServices(data) {
  const el = document.getElementById("services");
  if (!el) return;
  if (!data) { el.innerHTML = ""; return; }

  const items   = list(data.items);
  const samples = list(data.samples);

  el.innerHTML = `
    <div class="section-head reveal">
      ${sectionIndex(2, "Services")}
      <h2>${esc(pick(data,"heading",""))}</h2>
      <p>${esc(pick(data,"sub",""))}</p>
    </div>
    ${items.length
      ? `<div class="service-grid">
           ${items.map((it,i) => {
             if (!it) return "";
             return `
             <div class="service-card reveal" style="transition-delay:${revealDelay(i)};">
               <h4>${esc(pick(it,"title",""))}</h4>
               <p>${esc(pick(it,"desc",""))}</p>
             </div>`;
           }).join("")}
         </div>`
      : emptyState("No services added yet.")}
    ${samples.length
      ? `<div class="service-samples reveal">
           <h4>${esc(pick(data,"samplesHeading","Sample Work"))}</h4>
           <ul>${samples.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
         </div>`
      : ""}
    ${data.note ? `<p class="service-note reveal">${esc(data.note)}</p>` : ""}`;
}

function renderStats(data) {
  const el = document.getElementById("stats");
  if (!el) return;
  if (!data) { el.innerHTML = emptyState("Stats section is missing."); return; }

  const rows = list(data.rows);
  const bars = list(data.bars);

  el.innerHTML = `
    <div class="section-inner">
      <div class="section-head reveal">
        ${sectionIndex(3, "By The Numbers")}
        <h2>${esc(pick(data,"heading",""))}</h2>
      </div>
      ${rows.length || bars.length
        ? `<div class="stats-cols">
             <div>
               ${rows.map((r,i) =>
                 `<div class="stat-row reveal" style="transition-delay:${revealDelay(i)};">
                    <span>${esc(pick(r,"label",""))}</span>
                    <span>${esc(pick(r,"value",""))}</span>
                  </div>`).join("")}
             </div>
             <div>
               ${bars.map((b,i) => {
                 const pct = Math.max(0, Math.min(100, Number(b.percent) || 0));
                 return `
                 <div class="reveal" style="margin-bottom:24px; transition-delay:${revealDelay(i)};">
                   <div class="stat-row" style="border:none; padding-bottom:6px;">
                     <span>${esc(pick(b,"label",""))}</span>
                     <span>${esc(pick(b,"value",""))}</span>
                   </div>
                   <div class="demo-bar"><div class="demo-fill" style="width:${pct}%;"></div></div>
                 </div>`;
               }).join("")}
             </div>
           </div>`
        : emptyState("No stats added yet.")}
    </div>`;
}

function renderTestimonials(data) {
  const el = document.getElementById("testimonials");
  if (!el) return;
  if (!data) { el.innerHTML = ""; return; }

  const items = list(data.items);

  if (!items.length) {
    if (!data.comingSoon) { el.innerHTML = ""; return; }
    el.innerHTML = `
      <div class="section-head reveal">
        ${sectionIndex(4, "Social Proof")}
        <h2>${esc(pick(data,"heading",""))}</h2>
        ${data.sub ? `<p>${esc(data.sub)}</p>` : ""}
      </div>
      <div class="coming-soon-card reveal">
        <span class="coming-soon-badge">New Section — In Progress</span>
        <p>${esc(pick(data,"comingSoonNote","Currently collecting real feedback from clients. Check back soon."))}</p>
      </div>`;
    return;
  }

  el.innerHTML = `
    <div class="section-head reveal">
      ${sectionIndex(4, "Social Proof")}
      <h2>${esc(pick(data,"heading",""))}</h2>
      ${data.sub ? `<p>${esc(data.sub)}</p>` : ""}
    </div>
    <div class="testimonial-grid">
      ${items.map((t,i) => {
        if (!t || !t.quote) return "";
        return `
        <figure class="testimonial-card reveal" style="transition-delay:${revealDelay(i)};">
          <blockquote>&ldquo;${esc(t.quote)}&rdquo;</blockquote>
          <figcaption>
            ${t.name ? `<span class="t-name">${esc(t.name)}</span>` : ""}
            ${t.role ? `<span class="t-role">${esc(t.role)}</span>` : ""}
          </figcaption>
        </figure>`;
      }).join("")}
    </div>`;
}

function renderSkills(data) {
  const el = document.getElementById("skills");
  if (!el) return;
  if (!data) { el.innerHTML = emptyState("Toolkit section is missing."); return; }

  const groups = list(data.groups);

  el.innerHTML = `
    <div class="section-head reveal">
      ${sectionIndex(5, "Toolkit")}
      <h2>${esc(pick(data,"heading",""))}</h2>
    </div>
    ${groups.length
      ? `<div class="toolkit-grid">
           ${groups.map((g,i) => {
             if (!g) return "";
             const items = list(g.items);
             return `
             <div class="tool-card reveal" style="transition-delay:${revealDelay(i)};">
               <h4>${esc(pick(g,"title","Tools"))}</h4>
               ${items.length ? `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>` : ""}
             </div>`;
           }).join("")}
         </div>`
      : emptyState("No toolkit groups added yet.")}`;
}

function renderDev(data) {
  const el = document.getElementById("dev");
  if (!el) return;
  if (!data) { el.innerHTML = ""; return; }

  const projects  = list(data.projects);
  const hasGithub = data.githubUrl && data.githubLabel;

  el.innerHTML = `
    <div class="dev-section reveal">
      <div class="dev-inner">
        <div class="dev-head">
          <div>
            ${sectionIndex(6, "Also Builds")}
            <h2>${esc(pick(data,"heading",""))}</h2>
            <p>${esc(pick(data,"sub",""))}</p>
          </div>
          ${hasGithub
            ? `<a class="gh-link" href="${esc(data.githubUrl)}" target="_blank" rel="noopener">${esc(data.githubLabel)}</a>`
            : ""}
        </div>
        ${projects.length
          ? `<div class="dev-grid">
               ${projects.map((p,i) => {
                 if (!p) return "";
                 const links = [
                   p.liveUrl ? `<a href="${esc(p.liveUrl)}" target="_blank" rel="noopener">Live site →</a>` : "",
                   p.repoUrl ? `<a href="${esc(p.repoUrl)}" target="_blank" rel="noopener">Repo →</a>`     : "",
                 ].filter(Boolean).join("");
                 return `
                 <div class="dev-card reveal" style="transition-delay:${revealDelay(i)};">
                   ${p.stack ? `<div class="stack">${esc(p.stack)}</div>` : ""}
                   <h4>${esc(pick(p,"title","Untitled project"))}</h4>
                   <p>${esc(pick(p,"desc",""))}</p>
                   ${links ? `<div class="dev-card-links">${links}</div>` : ""}
                 </div>`;
               }).join("")}
             </div>`
          : emptyState("No projects added yet.")}
      </div>
    </div>`;
}

function renderAbout(data) {
  const el = document.getElementById("about");
  if (!el) return;
  if (!data) { el.innerHTML = emptyState("About section is missing."); return; }

  const paragraphs     = list(data.paragraphs);
  const education      = list(data.education);
  const certifications = list(data.certifications);
  const languages      = list(data.languages);

  const renderPairList = (title, arr) =>
    arr.length
      ? `<h4>${esc(title)}</h4><ul>${arr
          .map((e) => `<li><span>${esc(pick(e,"label",""))}</span><span>${esc(pick(e,"value",""))}</span></li>`)
          .join("")}</ul>`
      : "";

  el.innerHTML = `
    <div class="section-head reveal">
      ${sectionIndex(7, "About")}
    </div>
    <div class="about-grid">
      <div class="about-copy reveal">
        <h2 style="font-size:clamp(28px,4vw,42px); margin-bottom:24px; line-height:1.08;">${esc(pick(data,"heading",""))}</h2>
        ${paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}
      </div>
      <div class="about-list reveal" style="transition-delay:120ms;">
        ${renderPairList("Education", education)}
        ${renderPairList("Certifications", certifications)}
        ${renderPairList("Languages", languages)}
      </div>
    </div>`;
}

function renderContact(data) {
  const el       = document.getElementById("contact");
  const footerEl = document.getElementById("footer-root");
  if (!el) return;
  if (!data) { el.innerHTML = emptyState("Contact section is missing."); return; }

  const phoneHref = data.phone ? String(data.phone).replace(/\s+/g, "") : "";

  const metaLinks = [
    data.phone     ? `<a href="tel:${esc(phoneHref)}">${esc(data.phone)}</a>`                                       : "",
    data.linkedin  ? `<a href="${esc(data.linkedin)}"  target="_blank" rel="noopener">LinkedIn</a>`                 : "",
    data.github    ? `<a href="${esc(data.github)}"    target="_blank" rel="noopener">GitHub</a>`                   : "",
    data.tiktok    ? `<a href="${esc(data.tiktok)}"    target="_blank" rel="noopener">TikTok</a>`                   : "",
    data.instagram ? `<a href="${esc(data.instagram)}" target="_blank" rel="noopener">Instagram</a>`               : "",
    data.location  ? `<span>${esc(data.location)}</span>`                                                           : "",
  ].filter(Boolean).join("");

  el.innerHTML = `
    <div class="reveal">
      <span class="section-index">08 / CONTACT</span>
      <h2>${esc(pick(data,"heading",""))}</h2>
      <p>${esc(pick(data,"sub",""))}</p>
    </div>
    <div class="contact-actions reveal" style="transition-delay:80ms;">
      ${data.email    ? `<a href="mailto:${esc(data.email)}" class="btn-primary">${esc(data.email)}  →</a>` : ""}
      ${data.linktree ? `<a href="${esc(data.linktree)}" class="btn-ghost" target="_blank" rel="noopener">All My Socials →</a>` : ""}
      ${data.resumeUrl? `<a href="${esc(data.resumeUrl)}" class="btn-ghost" target="_blank" rel="noopener">Download Resume</a>` : ""}
    </div>
    ${metaLinks ? `<div class="contact-meta reveal" style="transition-delay:150ms;">${metaLinks}</div>` : ""}
    ${data.availability
      ? `<div class="availability reveal" style="transition-delay:220ms;"><span class="dot-live"></span>${esc(data.availability)}</div>`
      : ""}`;

  if (footerEl) footerEl.innerHTML = esc(pick(data,"footerNote",""));
}

// ── Interactive behaviours ────────────────────────────────────

// Highlights the active nav link as you scroll
function initScrollSpy() {
  const markers = document.querySelectorAll(".marker");
  if (!markers.length) return;

  const sections = [...markers]
    .map((m) => document.querySelector(m.dataset.target))
    .filter(Boolean);

  markers.forEach((m) => {
    m.addEventListener("click", () => {
      const target = document.querySelector(m.dataset.target);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const idx = sections.indexOf(entry.target);
        if (idx === -1) return;
        markers.forEach((m) => m.classList.remove("active"));
        const activeMarker = [...markers].find(
          (m) => m.dataset.target === `#${entry.target.id}`
        );
        if (activeMarker) activeMarker.classList.add("active");
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((s) => observer.observe(s));
}

// Slowly auto-scrolls the work marquee; pauses on hover/touch/drag
function initWorkMarquee() {
  const marquee = document.getElementById("workMarquee");
  const track   = document.getElementById("workTrack");
  if (!marquee || !track) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let paused = false;
  let resumeTimer = null;
  const SPEED = 0.38;
  let pos = marquee.scrollLeft;

  function syncPosFromScroll() { pos = marquee.scrollLeft; }
  function pauseForAWhile() {
    paused = true;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { syncPosFromScroll(); paused = false; }, 1800);
  }

  marquee.addEventListener("mouseenter",  () => { paused = true; });
  marquee.addEventListener("mouseleave",  () => { clearTimeout(resumeTimer); syncPosFromScroll(); paused = false; });
  marquee.addEventListener("touchstart",  () => { paused = true; }, { passive: true });
  marquee.addEventListener("touchend",    pauseForAWhile, { passive: true });
  marquee.addEventListener("wheel",       pauseForAWhile, { passive: true });
  marquee.addEventListener("pointerdown", () => { paused = true; });
  marquee.addEventListener("pointerup",   pauseForAWhile);

  if (reduceMotion) return;

  function step() {
    if (!paused) {
      const half = track.scrollWidth / 2;
      pos += SPEED;
      if (pos >= half) pos -= half;
      marquee.scrollLeft = pos;
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Opens the video modal when a work card with video is clicked
function initWorkVideos() {
  const frames      = document.querySelectorAll(".case-frame[data-video]");
  const modal       = document.getElementById("videoModal");
  const modalVideo  = document.getElementById("videoModalPlayer");
  if (!frames.length || !modal || !modalVideo) return;

  function openModal(src) {
    modalVideo.src = src;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modalVideo.play().catch(() => {});
  }
  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();
  }

  frames.forEach((frame) => {
    frame.addEventListener("click", () => { const src = frame.dataset.video; if (src) openModal(src); });
    frame.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); const src = frame.dataset.video; if (src) openModal(src); }
    });
  });
  modal.querySelectorAll("[data-modal-close]").forEach((el) => { el.addEventListener("click", closeModal); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("open")) closeModal(); });
}

// Fade-in + slide-up as elements enter the viewport
function initScrollReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
  );
  els.forEach((el) => observer.observe(el));
}

// Cursor ambient glow that follows mouse position
function initCursorGlow() {
  const glow = document.getElementById("cursorGlow");
  if (!glow) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  let raf;
  let tx = -500, ty = -500;
  let cx = -500, cy = -500;

  document.addEventListener("mousemove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
    glow.style.opacity = "1";
  });

  document.addEventListener("mouseleave", () => { glow.style.opacity = "0"; });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    cx = lerp(cx, tx, 0.1);
    cy = lerp(cy, ty, 0.1);
    glow.style.left = cx + "px";
    glow.style.top  = cy + "px";
    raf = requestAnimationFrame(tick);
  }
  tick();
}

// Role ticker is CSS-only (role-scroll keyframe), no JS needed.

// Section wrapper: catches render errors gracefully
function renderSection(name, fn, data) {
  try {
    fn(data);
  } catch (err) {
    console.error(`Failed to render "${name}":`, err);
    const id  = name === "hero" ? "home" : name;
    const el  = document.getElementById(id);
    if (el) el.innerHTML = emptyState(`This section couldn't be displayed (check data/${name}.json).`);
  }
}

// ── Entry point ───────────────────────────────────────────────

async function init() {
  const { data, failed } = await loadData();

  renderSection("nav",          renderNav,          data.nav);
  renderSection("hero",         renderHero,         data.hero);
  renderSection("work",         renderWork,         data.work);
  initWorkVideos();
  initWorkMarquee();
  renderSection("services",     renderServices,     data.services);
  renderSection("stats",        renderStats,        data.stats);
  renderSection("testimonials", renderTestimonials, data.testimonials);
  renderSection("skills",       renderSkills,       data.skills);
  renderSection("dev",          renderDev,          data.dev);
  renderSection("about",        renderAbout,        data.about);
  renderSection("contact",      renderContact,      data.contact);

  initScrollSpy();
  initScrollReveal();
  initCursorGlow();

  if (failed.length === Object.keys(DATA_FILES).length) {
    document.body.innerHTML = `
      <div class="load-msg error">
        Couldn't load any site content.<br><br>
        This usually means the page was opened directly as a file (file://).<br>
        Run a local server instead — e.g. the VS Code "Live Server" extension,
        or <code>python -m http.server</code> in this folder, then reload.
      </div>`;
  } else if (failed.length) {
    console.warn("Some sections failed to load:", failed.join(", "));
  }
}

init();