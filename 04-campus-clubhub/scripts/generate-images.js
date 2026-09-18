/**
 * Builds the artwork used across the site.
 *
 * Every club and event gets its own cover image, generated from its name so the
 * same club always produces the same picture. Nothing is downloaded, so the site
 * looks complete even on a laptop with no internet during a demo.
 *
 * Run with:  npm run images
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'public', 'img');

/* ---------- tiny deterministic random number generator ---------- */
function seeded(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13; h >>>= 0;
    h ^= h >> 17;
    h ^= h << 5; h >>>= 0;
    return h / 4294967296;
  };
}

/* ---------- colour helpers ---------- */
function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) =>
    Math.max(0, Math.min(255, Math.round(amount < 0 ? v * (1 + amount) : v + (255 - v) * amount)))
  );
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

/* ---------- motifs ---------- */
const motifs = {
  // overlapping rings — photography, film, music
  rings(rnd, w, h, ink) {
    let s = '';
    for (let i = 0; i < 7; i++) {
      const r = 60 + rnd() * 200;
      s += `<circle cx="${(rnd() * w).toFixed(0)}" cy="${(rnd() * h).toFixed(0)}" r="${r.toFixed(0)}" fill="none" stroke="${ink}" stroke-width="${(1 + rnd() * 3).toFixed(1)}" opacity="${(0.12 + rnd() * 0.25).toFixed(2)}"/>`;
    }
    return s;
  },

  // circuit traces — technology
  circuit(rnd, w, h, ink) {
    let s = '';
    for (let i = 0; i < 14; i++) {
      let x = Math.round((rnd() * w) / 20) * 20;
      let y = Math.round((rnd() * h) / 20) * 20;
      let d = `M${x} ${y}`;
      for (let j = 0; j < 4; j++) {
        const step = 40 + Math.round(rnd() * 3) * 40;
        if (rnd() > 0.5) x += rnd() > 0.5 ? step : -step;
        else y += rnd() > 0.5 ? step : -step;
        d += ` L${x} ${y}`;
      }
      s += `<path d="${d}" fill="none" stroke="${ink}" stroke-width="2" opacity="${(0.15 + rnd() * 0.2).toFixed(2)}" stroke-linecap="round"/>`;
      s += `<circle cx="${x}" cy="${y}" r="4" fill="${ink}" opacity="0.35"/>`;
    }
    return s;
  },

  // long arcs — sports, movement
  arcs(rnd, w, h, ink) {
    let s = '';
    for (let i = 0; i < 9; i++) {
      const y = rnd() * h;
      const lift = 60 + rnd() * 180;
      s += `<path d="M${-40} ${y.toFixed(0)} Q ${(w / 2).toFixed(0)} ${(y - lift).toFixed(0)} ${w + 40} ${y.toFixed(0)}" fill="none" stroke="${ink}" stroke-width="${(1.5 + rnd() * 3).toFixed(1)}" opacity="${(0.12 + rnd() * 0.22).toFixed(2)}"/>`;
    }
    return s;
  },

  // stacked bars like book spines or a page grid — literary, academic
  spines(rnd, w, h, ink) {
    let s = '';
    let x = -20;
    while (x < w) {
      const bw = 16 + rnd() * 46;
      const bh = h * (0.35 + rnd() * 0.6);
      s += `<rect x="${x.toFixed(0)}" y="${(h - bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" rx="6" fill="${ink}" opacity="${(0.08 + rnd() * 0.18).toFixed(2)}"/>`;
      x += bw + 6 + rnd() * 14;
    }
    return s;
  },

  // scattered triangles and strokes — arts, culture
  shards(rnd, w, h, ink) {
    let s = '';
    for (let i = 0; i < 16; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const sz = 30 + rnd() * 120;
      const rot = (rnd() * 360).toFixed(0);
      const op = (0.1 + rnd() * 0.22).toFixed(2);
      if (rnd() > 0.45) {
        s += `<polygon points="${x},${y} ${x + sz},${y + sz * 0.3} ${x + sz * 0.25},${y + sz}" fill="${ink}" opacity="${op}" transform="rotate(${rot} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
      } else {
        s += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${sz.toFixed(0)}" height="${(sz * 0.18).toFixed(0)}" rx="4" fill="${ink}" opacity="${op}" transform="rotate(${rot} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
      }
    }
    return s;
  },

  // soft leaf-like blobs — service, environment
  leaves(rnd, w, h, ink) {
    let s = '';
    for (let i = 0; i < 12; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const sz = 40 + rnd() * 110;
      s += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q ${sz} ${-sz * 0.2} ${sz} ${sz * 0.7} q ${-sz * 0.85} ${sz * 0.25} ${-sz} ${-sz * 0.7} z" fill="${ink}" opacity="${(0.1 + rnd() * 0.2).toFixed(2)}" transform="rotate(${(rnd() * 360).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
    }
    return s;
  },
};


/* ---------- subject silhouettes ----------
   Each is drawn inside a 0..200 square and then placed on the cover, so the
   picture says what the club actually does instead of being pure decoration. */
const subjects = {
  technology: `
    <rect x="18" y="34" width="164" height="112" rx="10" fill="none" stroke="currentColor" stroke-width="7"/>
    <path d="M18 62h164" stroke="currentColor" stroke-width="7"/>
    <circle cx="34" cy="48" r="4.5" fill="currentColor"/><circle cx="50" cy="48" r="4.5" fill="currentColor"/>
    <path d="M62 86l-18 20 18 20M138 86l18 20-18 20M112 82l-24 48" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M74 166h52l6 14H68z" fill="currentColor"/>`,

  sports: `
    <path d="M64 56v104M100 56v104M136 56v104" stroke="currentColor" stroke-width="11" stroke-linecap="round"/>
    <rect x="56" y="42" width="40" height="9" rx="4.5" fill="currentColor"/>
    <rect x="104" y="42" width="40" height="9" rx="4.5" fill="currentColor"/>
    <circle cx="164" cy="140" r="24" fill="currentColor"/>
    <path d="M148 128c11 8 21 19 26 33" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="3"/>
    <path d="M24 170h152" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>`,

  literary: `
    <path d="M100 56c-18-13-42-18-70-15v104c28-3 52 2 70 15 18-13 42-18 70-15V41c-28-3-52 2-70 15z" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/>
    <path d="M100 56v104" stroke="currentColor" stroke-width="7"/>
    <path d="M46 72h34M46 92h34M46 112h26M120 72h34M120 92h34M120 112h26" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>`,

  arts: `
    <path d="M100 30c39 0 70 28 70 62 0 22-18 30-32 30h-14c-12 0-20 7-20 17 0 6 3 10 3 16 0 9-7 15-17 15-38 0-70-32-70-70S61 30 100 30z" fill="none" stroke="currentColor" stroke-width="8"/>
    <circle cx="66" cy="70" r="10" fill="currentColor"/><circle cx="104" cy="58" r="10" fill="currentColor"/>
    <circle cx="136" cy="80" r="10" fill="currentColor"/><circle cx="60" cy="110" r="10" fill="currentColor"/>`,

  media: `
    <rect x="22" y="70" width="112" height="84" rx="10" fill="none" stroke="currentColor" stroke-width="8"/>
    <path d="M134 100l44-24v84l-44-24z" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/>
    <rect x="30" y="38" width="112" height="26" rx="6" fill="currentColor" transform="rotate(-9 86 51)"/>
    <path d="M44 34l10 26M74 30l10 26M104 26l10 26" stroke="#000" stroke-opacity=".3" stroke-width="5"/>`,

  cultural: `
    <rect x="80" y="26" width="40" height="76" rx="20" fill="none" stroke="currentColor" stroke-width="8"/>
    <path d="M58 88c0 23 19 42 42 42s42-19 42-42" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
    <path d="M100 130v34M74 164h52" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
    <circle cx="36" cy="150" r="13" fill="currentColor"/>
    <path d="M49 150V96l28-8v54" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="164" cy="140" r="13" fill="currentColor"/>`,

  service: `
    <path d="M100 148c0-38 24-66 62-70-4 38-26 62-62 70z" fill="currentColor"/>
    <path d="M100 148c0-30-19-52-49-56 3 30 21 49 49 56z" fill="currentColor" opacity=".72"/>
    <path d="M100 176v-34" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
    <path d="M30 176c14-12 30-18 70-18s56 6 70 18" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>`,

  academic: `
    <path d="M26 150h148" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
    <path d="M26 150V52" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
    <rect x="48" y="106" width="26" height="44" fill="currentColor" opacity=".8"/>
    <rect x="88" y="80" width="26" height="70" fill="currentColor" opacity=".8"/>
    <rect x="128" y="54" width="26" height="96" fill="currentColor" opacity=".8"/>
    <path d="M44 92l28-26 30 20 44-42" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M124 44h26v26" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
};

const MOTIF_FOR_CATEGORY = {
  technology: 'circuit',
  sports: 'arcs',
  literary: 'spines',
  arts: 'shards',
  media: 'rings',
  cultural: 'rings',
  service: 'leaves',
  academic: 'spines',
};

/* ---------- the cover builder ---------- */
function cover({ seed, accent, motif, category, width = 960, height = 600, label = '' }) {
  const rnd = seeded(seed);
  const dark = shade(accent, -0.66);
  const mid = shade(accent, -0.14);
  const light = shade(accent, 0.34);
  const angle = 20 + Math.floor(rnd() * 50);
  const body = motifs[motif](rnd, width, height, light);

  // two soft light sources so the flat gradient reads as depth
  const glowX = (0.2 + rnd() * 0.5) * width;
  const glowY = (0.05 + rnd() * 0.35) * height;

  // the subject sits to one side, large enough to read at card size
  const art = subjects[category];
  const size = height * 0.86;
  const sx = width - size * (0.78 + rnd() * 0.18);
  const sy = (height - size) / 2 + height * 0.04;
  const tilt = (rnd() * 10 - 5).toFixed(1);

  const subjectLayer = art ? `
  <g transform="translate(${sx.toFixed(0)} ${sy.toFixed(0)}) scale(${(size / 200).toFixed(3)}) rotate(${tilt} 100 100)">
    <g color="#000" opacity=".16" transform="translate(5 7)">${art}</g>
    <g color="#FFFFFF" opacity=".22">${art}</g>
  </g>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="bg" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${mid}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${light}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${light}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="40%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.55"/>
    </linearGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="${Math.floor(rnd() * 999)}"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <ellipse cx="${glowX.toFixed(0)}" cy="${glowY.toFixed(0)}" rx="${(width * 0.55).toFixed(0)}" ry="${(height * 0.65).toFixed(0)}" fill="url(#glow)"/>
  <g>${body}</g>${subjectLayer}
  <rect width="${width}" height="${height}" fill="url(#scrim)"/>
  <rect width="${width}" height="${height}" filter="url(#grain)" opacity="0.07"/>
</svg>`;
}

/* ---------- the college crest ---------- */
function crest() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="College crest">
  <path d="M32 3 58 12v22c0 14-11 24-26 27C17 58 6 48 6 34V12z" fill="#7B1E2B"/>
  <path d="M32 8 53 15v19c0 11.5-9 19.8-21 22.5C20 53.8 11 45.5 11 34V15z" fill="none" stroke="#D9A441" stroke-width="1.6"/>
  <path d="M15 26 32 19l17 7-17 7z" fill="#D9A441"/>
  <path d="M22 30v8c0 3.5 4.5 5.6 10 5.6S42 41.5 42 38v-8" fill="none" stroke="#F7F4EF" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M49 26v9" stroke="#D9A441" stroke-width="1.8" stroke-linecap="round"/>
  <circle cx="49" cy="37" r="2.2" fill="#D9A441"/>
</svg>`;
}

/* ---------- write everything ---------- */
function build(clubs, events) {
  fs.mkdirSync(path.join(OUT, 'clubs'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'events'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'brand'), { recursive: true });

  fs.writeFileSync(path.join(OUT, 'brand', 'crest.svg'), crest());

  clubs.forEach((c) => {
    const svg = cover({
      seed: c.slug,
      accent: c.accent,
      motif: MOTIF_FOR_CATEGORY[c.category] || 'shards',
      category: c.category,
      label: `${c.name} cover image`,
    });
    fs.writeFileSync(path.join(OUT, 'clubs', `${c.slug}.svg`), svg);
  });

  events.forEach((e) => {
    const svg = cover({
      seed: e.slug + '-event',
      accent: e.accent,
      motif: MOTIF_FOR_CATEGORY[e.category] || 'arcs',
      category: e.category,
      width: 960,
      height: 420,
      label: `${e.title} banner`,
    });
    fs.writeFileSync(path.join(OUT, 'events', `${e.slug}.svg`), svg);
  });

  console.log(`Generated ${clubs.length} club covers and ${events.length} event banners in public/img.`);
}

module.exports = { build, cover, crest, shade };

/* When run directly, read the catalogue from the seed data. */
if (require.main === module) {
  const { CATEGORIES, CLUBS, EVENTS } = require('../db/data');
  const accentOf = (cat) => CATEGORIES.find((c) => c.slug === cat).accent;

  build(
    CLUBS.map((c) => ({ slug: c.slug, name: c.name, category: c.category, accent: accentOf(c.category) })),
    EVENTS.map((e) => {
      const club = CLUBS.find((c) => c.slug === e.club);
      return { slug: e.slug, title: e.title, category: club.category, accent: accentOf(club.category) };
    })
  );
}
