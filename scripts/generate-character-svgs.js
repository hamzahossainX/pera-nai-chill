/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const CHAR_DIR = path.join(__dirname, '..', 'public', 'assets', 'characters');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

ensureDir(CHAR_DIR);

// ==========================================
// 1. SHARED ASSETS (Neck, Shadow, Expressions)
// ==========================================
const sharedDir = path.join(CHAR_DIR, 'shared');
ensureDir(sharedDir);

// Neck: Tapered skin tone neck with collar shadow
fs.writeFileSync(path.join(sharedDir, 'neck.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 20" width="24" height="20">
  <defs>
    <linearGradient id="neckGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="30%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <!-- Tapered neck column with sternocleidomastoid shadow -->
  <path d="M 5 1 C 5 7 7 18 3 20 L 21 20 C 17 18 19 7 19 1 Z" fill="url(#neckGrad)" stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
  <!-- Under-chin ambient occlusion -->
  <ellipse cx="12" cy="3" rx="7" ry="2" fill="#78350f" opacity="0.6"/>
</svg>
`.trim());

// Soft Ground Shadow with blur & rim
fs.writeFileSync(path.join(sharedDir, 'shadow.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 28" width="80" height="28">
  <defs>
    <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#020617" stop-opacity="0.85"/>
      <stop offset="60%" stop-color="#090d16" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#090d16" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <ellipse cx="40" cy="14" rx="38" ry="12" fill="url(#shadowGrad)"/>
</svg>
`.trim());

// ==========================================
// 2. HERO CHASER (Aam-Janata Green Polo & Jeans)
// ==========================================
const chaserDir = path.join(CHAR_DIR, 'chaser');
ensureDir(chaserDir);

// Chaser Torso: Tapered green polo with white collar, button placket, belt & brass buckle
fs.writeFileSync(path.join(chaserDir, 'torso.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="chaserPolo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="70%" stop-color="#047857"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
  </defs>
  <!-- Tapered athletic polo torso -->
  <path d="M 12 10 Q 32 6 52 10 L 46 52 Q 32 54 18 52 Z" fill="url(#chaserPolo)" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Highlight rim on shoulder -->
  <path d="M 14 12 Q 32 8 50 12" stroke="#6ee7b7" stroke-width="1.5" fill="none"/>
  <!-- Crisp folded collar -->
  <polygon points="16,10 32,20 22,14" fill="#f8fafc" stroke="#000000" stroke-width="1.8"/>
  <polygon points="48,10 32,20 42,14" fill="#f8fafc" stroke="#000000" stroke-width="1.8"/>
  <!-- Button Placket -->
  <rect x="29" y="16" width="6" height="18" rx="1.5" fill="#f1f5f9" stroke="#000000" stroke-width="1.2"/>
  <circle cx="32" cy="21" r="1.5" fill="#047857"/>
  <circle cx="32" cy="29" r="1.5" fill="#047857"/>
  <!-- Belt & Brass Buckle -->
  <rect x="18" y="50" width="28" height="6" fill="#451a03" stroke="#000000" stroke-width="1.5"/>
  <rect x="28" y="49" width="8" height="8" rx="1" fill="#f59e0b" stroke="#000000" stroke-width="1.5"/>
  <rect x="30" y="51" width="4" height="4" fill="#78350f"/>
</svg>
`.trim());

// Upper Arm (Short Polo Sleeve + Muscular Bicep)
fs.writeFileSync(path.join(chaserDir, 'arm_upper.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 36" width="26" height="36">
  <!-- Sleeve -->
  <path d="M 4 4 C 4 1 22 1 22 4 L 23 18 C 23 20 3 20 3 18 Z" fill="#047857" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Sleeve cuff stripe -->
  <line x1="4" y1="17" x2="22" y2="17" stroke="#f8fafc" stroke-width="2"/>
  <!-- Muscular arm peaking out -->
  <path d="M 6 18 C 6 18 5 32 9 34 C 13 36 21 34 20 18 Z" fill="#d97706" stroke="#000000" stroke-width="2" stroke-linejoin="round"/>
</svg>
`.trim());

// Lower Arm (Forearm)
fs.writeFileSync(path.join(chaserDir, 'arm_lower.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 34" width="22" height="34">
  <path d="M 5 2 C 5 2 4 28 8 32 C 12 34 18 32 17 2 Z" fill="#d97706" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Wristband on hero -->
  <rect x="7" y="24" width="11" height="5" rx="1.5" fill="#dc2626" stroke="#000000" stroke-width="1.2"/>
</svg>
`.trim());

// Hand (Curled Clenched Punch Fist with Knuckles & Thumb)
fs.writeFileSync(path.join(chaserDir, 'hand.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" width="26" height="26">
  <!-- Clenched Knuckles -->
  <path d="M 4 10 C 2 5 14 3 18 6 C 22 9 24 18 20 22 C 16 26 6 25 4 18 Z" fill="#d97706" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- 4 Defined Knuckle creases -->
  <path d="M 7 11 C 7 8 11 8 11 11" stroke="#78350f" stroke-width="1.5" fill="none"/>
  <path d="M 11 9 C 11 6 15 6 15 9" stroke="#78350f" stroke-width="1.5" fill="none"/>
  <path d="M 15 8 C 15 5 19 5 19 8" stroke="#78350f" stroke-width="1.5" fill="none"/>
  <!-- Clamped Thumb -->
  <path d="M 5 14 C 5 11 14 12 14 17 C 14 20 9 20 5 17 Z" fill="#b45309" stroke="#000000" stroke-width="1.8"/>
</svg>
`.trim());

// Thigh (Blue Denim Jeans with Seams)
fs.writeFileSync(path.join(chaserDir, 'thigh.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 38" width="26" height="38">
  <path d="M 4 2 C 4 2 2 34 6 36 C 10 38 22 36 22 2 Z" fill="#1d4ed8" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Gold denim outer seam -->
  <path d="M 6 3 L 7 35" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="2,2"/>
  <!-- Knee wash highlight -->
  <ellipse cx="14" cy="28" rx="5" ry="6" fill="#3b82f6" opacity="0.4"/>
</svg>
`.trim());

// Shin (Jeans Cuff)
fs.writeFileSync(path.join(chaserDir, 'shin.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 36" width="22" height="36">
  <path d="M 4 2 L 6 30 C 6 33 18 33 18 30 L 19 2 Z" fill="#1e40af" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Rolled Jean Cuff -->
  <rect x="5" y="27" width="14" height="6" rx="1.5" fill="#93c5fd" stroke="#000000" stroke-width="1.5"/>
</svg>
`.trim());

// Foot (Sporty Red Runner Sneaker with White Soles & Laces)
fs.writeFileSync(path.join(chaserDir, 'foot.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 20" width="38" height="20">
  <!-- Sneaker Body -->
  <path d="M 8 5 C 10 2 16 2 20 6 L 34 10 C 37 11 37 16 34 16 L 4 16 C 2 14 2 8 8 5 Z" fill="#dc2626" stroke="#000000" stroke-width="2.2" stroke-linejoin="round"/>
  <!-- White Rubber Midsole & Toe Bumper -->
  <path d="M 3 14 L 36 14 C 37 14 37 18 35 18 L 2 18 C 1 18 1 14 3 14 Z" fill="#ffffff" stroke="#000000" stroke-width="1.8"/>
  <!-- Black Outsole Grip Grooves -->
  <line x1="8" y1="18" x2="12" y2="18" stroke="#000000" stroke-width="1.5"/>
  <line x1="16" y1="18" x2="20" y2="18" stroke="#000000" stroke-width="1.5"/>
  <line x1="24" y1="18" x2="28" y2="18" stroke="#000000" stroke-width="1.5"/>
  <!-- White Sport Swoop Stripe -->
  <path d="M 12 8 Q 20 12 30 11" stroke="#ffffff" stroke-width="2.5" fill="none"/>
  <!-- White Laces -->
  <line x1="15" y1="5" x2="19" y2="8" stroke="#ffffff" stroke-width="1.5"/>
  <line x1="18" y1="7" x2="22" y2="10" stroke="#ffffff" stroke-width="1.5"/>
</svg>
`.trim());

// ==========================================
// 3. ARCHETYPE 1: PHONE SNATCHER
// ==========================================
const snatcherDir = path.join(CHAR_DIR, 'phoneSnatcher');
ensureDir(snatcherDir);

// Torso: Black street hoodie with front kangaroo pocket, zipper, and drawstrings
fs.writeFileSync(path.join(snatcherDir, 'torso.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="hoodieGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="80%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
  </defs>
  <!-- Contoured hoodie torso with shoulder taper -->
  <path d="M 12 10 Q 32 7 52 10 L 46 54 Q 32 56 18 54 Z" fill="url(#hoodieGrad)" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Comic edge rim highlight -->
  <path d="M 14 11 Q 32 8 50 11" stroke="#475569" stroke-width="1.5" fill="none"/>
  <!-- Kangaroo front pocket -->
  <path d="M 20 36 L 44 36 L 42 50 L 22 50 Z" fill="#0f172a" stroke="#000000" stroke-width="1.8"/>
  <line x1="20" y1="36" x2="23" y2="46" stroke="#475569" stroke-width="1.2"/>
  <line x1="44" y1="36" x2="41" y2="46" stroke="#475569" stroke-width="1.2"/>
  <!-- Center Zipper -->
  <line x1="32" y1="12" x2="32" y2="36" stroke="#94a3b8" stroke-width="2" stroke-dasharray="2,1"/>
  <!-- Dangling Drawstrings with metal aglets -->
  <path d="M 27 12 Q 25 22 24 28" stroke="#f8fafc" stroke-width="1.5" fill="none"/>
  <rect x="23" y="27" width="2" height="3" fill="#cbd5e1"/>
  <path d="M 37 12 Q 39 22 40 28" stroke="#f8fafc" stroke-width="1.5" fill="none"/>
  <rect x="39" y="27" width="2" height="3" fill="#cbd5e1"/>
</svg>
`.trim());

// Arms & Legs for Snatcher
fs.writeFileSync(path.join(snatcherDir, 'arm_upper.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 38" width="24" height="38">
  <path d="M 4 6 C 4 2 20 2 20 6 L 19 32 C 19 35 5 35 5 32 Z" fill="#0f172a" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- White sporty racing stripes -->
  <line x1="8" y1="6" x2="8" y2="32" stroke="#f8fafc" stroke-width="1.8"/>
  <line x1="12" y1="6" x2="12" y2="32" stroke="#ef4444" stroke-width="1.2"/>
</svg>
`.trim());

fs.writeFileSync(path.join(snatcherDir, 'arm_lower.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 34" width="22" height="34">
  <path d="M 5 2 L 6 30 C 6 33 17 33 17 30 L 18 2 Z" fill="#0f172a" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Ribbed cuff -->
  <rect x="5" y="26" width="13" height="5" rx="1" fill="#1e293b" stroke="#000000" stroke-width="1.5"/>
</svg>
`.trim());

// Hand gripping stolen smartphone
fs.writeFileSync(path.join(snatcherDir, 'hand.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <defs>
    <linearGradient id="screenGlow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>
  </defs>
  <!-- Stolen Slim Smartphone -->
  <rect x="12" y="2" width="17" height="27" rx="3.5" fill="#020617" stroke="#000000" stroke-width="2"/>
  <rect x="14" y="5" width="13" height="19" rx="1.5" fill="url(#screenGlow)"/>
  <!-- Cracked screen lightning bolt -->
  <path d="M 16 7 L 22 13 L 18 16 L 25 21" stroke="#ffffff" stroke-width="1.2" fill="none" opacity="0.9"/>
  <!-- Gripping Hand Fingers wrapped around phone -->
  <path d="M 4 10 C 2 7 13 6 15 10 L 16 23 C 16 27 6 27 4 23 Z" fill="#b45309" stroke="#000000" stroke-width="2.2" stroke-linejoin="round"/>
  <!-- Individual finger ridges wrapped on phone -->
  <rect x="13" y="10" width="5" height="3.5" rx="1.5" fill="#92400e" stroke="#000000" stroke-width="1.2"/>
  <rect x="13" y="15" width="5" height="3.5" rx="1.5" fill="#92400e" stroke="#000000" stroke-width="1.2"/>
  <rect x="13" y="20" width="5" height="3.5" rx="1.5" fill="#92400e" stroke="#000000" stroke-width="1.2"/>
</svg>
`.trim());

fs.writeFileSync(path.join(snatcherDir, 'thigh.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 38" width="24" height="38">
  <path d="M 4 2 C 4 2 3 34 6 36 C 10 38 21 36 21 2 Z" fill="#1e293b" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- White jogger stripe -->
  <line x1="6" y1="4" x2="7" y2="35" stroke="#f8fafc" stroke-width="1.8"/>
</svg>
`.trim());

fs.writeFileSync(path.join(snatcherDir, 'shin.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 36" width="22" height="36">
  <path d="M 4 2 L 6 30 C 6 33 17 33 17 30 L 18 2 Z" fill="#1e293b" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"/>
  <rect x="5" y="26" width="13" height="6" rx="1.5" fill="#0f172a" stroke="#000000" stroke-width="1.5"/>
</svg>
`.trim());

// Foot: White/black Street High-Tops
fs.writeFileSync(path.join(snatcherDir, 'foot.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 20" width="38" height="20">
  <path d="M 8 4 C 10 2 16 2 19 5 L 34 10 C 37 11 37 16 34 16 L 4 16 C 2 14 2 7 8 4 Z" fill="#0f172a" stroke="#000000" stroke-width="2.2" stroke-linejoin="round"/>
  <!-- Chunky white sole -->
  <path d="M 3 14 L 36 14 C 37 14 37 18 35 18 L 2 18 C 1 18 1 14 3 14 Z" fill="#f8fafc" stroke="#000000" stroke-width="1.8"/>
  <!-- Red heel tag -->
  <rect x="4" y="6" width="3" height="7" fill="#ef4444"/>
</svg>
`.trim());

// Mask Upper & Lower (for dynamic mask slip at 66% and 33% HP)
fs.writeFileSync(path.join(snatcherDir, 'mask_upper.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 24" width="64" height="24">
  <!-- Balaclava forehead band & dark shades -->
  <path d="M 8 2 Q 32 0 56 2 L 54 18 Q 32 22 10 18 Z" fill="#0f172a" stroke="#000000" stroke-width="2"/>
  <!-- Mirrored gold sunglasses -->
  <rect x="14" y="6" width="16" height="10" rx="3" fill="#f59e0b" stroke="#000000" stroke-width="1.5"/>
  <rect x="34" y="6" width="16" height="10" rx="3" fill="#f59e0b" stroke="#000000" stroke-width="1.5"/>
  <line x1="30" y1="10" x2="34" y2="10" stroke="#000000" stroke-width="2"/>
  <!-- Glare reflections on shades -->
  <line x1="16" y1="8" x2="22" y2="14" stroke="#ffffff" stroke-width="1.5"/>
  <line x1="36" y1="8" x2="42" y2="14" stroke="#ffffff" stroke-width="1.5"/>
</svg>
`.trim());

fs.writeFileSync(path.join(snatcherDir, 'mask_lower.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 28" width="64" height="28">
  <!-- Balaclava lower jaw face mask -->
  <path d="M 12 2 Q 32 6 52 2 L 48 24 Q 32 28 16 24 Z" fill="#0f172a" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Breathing vent dots -->
  <circle cx="28" cy="14" r="1.2" fill="#475569"/>
  <circle cx="32" cy="14" r="1.2" fill="#475569"/>
  <circle cx="36" cy="14" r="1.2" fill="#475569"/>
  <circle cx="30" cy="18" r="1.2" fill="#475569"/>
  <circle cx="34" cy="18" r="1.2" fill="#475569"/>
</svg>
`.trim());

fs.writeFileSync(path.join(snatcherDir, 'hood_front.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 74 74" width="74" height="74">
  <!-- Hood framing arch around the face -->
  <path d="M 10 38 C 10 12 64 12 64 38 C 64 54 58 64 54 66 C 48 48 52 26 37 26 C 22 26 26 48 20 66 C 16 64 10 54 10 38 Z" fill="#1e293b" stroke="#000000" stroke-width="2.5"/>
</svg>
`.trim());

fs.writeFileSync(path.join(snatcherDir, 'hood_back.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
  <!-- Back of hoodie volume behind head -->
  <circle cx="40" cy="40" r="36" fill="#090d16" stroke="#000000" stroke-width="3"/>
</svg>
`.trim());

// ==========================================
// 4. ARCHETYPE 2: PICKPOCKET (Pocketmar)
// ==========================================
const pickpocketDir = path.join(CHAR_DIR, 'pickpocket');
ensureDir(pickpocketDir);

// Torso: Brown vintage waistcoat over striped collared shirt + pocket watch chain
fs.writeFileSync(path.join(pickpocketDir, 'torso.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- White/grey striped undershirt -->
  <path d="M 14 12 Q 32 8 50 12 L 46 54 Q 32 56 18 54 Z" fill="#f8fafc" stroke="#000000" stroke-width="2.5"/>
  <line x1="24" y1="12" x2="24" y2="54" stroke="#94a3b8" stroke-width="1"/>
  <line x1="32" y1="12" x2="32" y2="54" stroke="#94a3b8" stroke-width="1"/>
  <line x1="40" y1="12" x2="40" y2="54" stroke="#94a3b8" stroke-width="1"/>
  <!-- Brown Tweed Waistcoat Panels -->
  <path d="M 12 10 L 26 12 L 28 52 L 18 54 Z" fill="#78350f" stroke="#000000" stroke-width="2"/>
  <path d="M 52 10 L 38 12 L 36 52 L 46 54 Z" fill="#78350f" stroke="#000000" stroke-width="2"/>
  <!-- Golden Pocket Watch Chain -->
  <path d="M 24 38 Q 30 46 36 40" stroke="#f59e0b" stroke-width="2" fill="none"/>
  <!-- Buttons -->
  <circle cx="32" cy="24" r="1.5" fill="#451a03"/>
  <circle cx="32" cy="32" r="1.5" fill="#451a03"/>
</svg>
`.trim());

fs.writeFileSync(path.join(pickpocketDir, 'arm_upper.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
  <path d="M 4 4 C 4 1 20 1 20 4 L 19 32 C 19 35 5 35 5 32 Z" fill="#f8fafc" stroke="#000000" stroke-width="2.5"/>
  <!-- Rolled up sleeve band -->
  <rect x="4" y="26" width="16" height="5" rx="1.5" fill="#cbd5e1" stroke="#000000" stroke-width="1.5"/>
</svg>
`.trim());

fs.writeFileSync(path.join(pickpocketDir, 'arm_lower.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 34" width="22" height="34">
  <path d="M 5 2 L 6 30 C 6 33 17 33 17 30 L 18 2 Z" fill="#b45309" stroke="#000000" stroke-width="2.5"/>
</svg>
`.trim());

// Hand gripping stolen bulging leather wallet with sticking-out notes
fs.writeFileSync(path.join(pickpocketDir, 'hand.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <!-- Stolen Brown Bi-fold Wallet -->
  <rect x="8" y="6" width="22" height="18" rx="3" fill="#451a03" stroke="#000000" stroke-width="2"/>
  <!-- Green 500 Taka notes poking out -->
  <path d="M 12 4 L 24 3 L 26 8 L 14 9 Z" fill="#10b981" stroke="#000000" stroke-width="1.2"/>
  <text x="16" y="7" font-size="4" font-weight="bold" fill="#064e3b">৳</text>
  <!-- Sleight of hand nimble fingers -->
  <path d="M 2 12 C 2 7 12 7 14 12 L 15 24 C 15 28 4 28 2 24 Z" fill="#b45309" stroke="#000000" stroke-width="2.2"/>
</svg>
`.trim());

fs.writeFileSync(path.join(pickpocketDir, 'thigh.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 38" width="24" height="38">
  <path d="M 4 2 L 6 36 L 20 36 L 21 2 Z" fill="#334155" stroke="#000000" stroke-width="2.5"/>
</svg>
`.trim());

fs.writeFileSync(path.join(pickpocketDir, 'shin.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 36" width="22" height="36">
  <path d="M 4 2 L 6 30 C 6 33 17 33 17 30 L 18 2 Z" fill="#1e293b" stroke="#000000" stroke-width="2.5"/>
</svg>
`.trim());

// Foot: Classic polished formal leather shoe
fs.writeFileSync(path.join(pickpocketDir, 'foot.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 20" width="38" height="20">
  <path d="M 6 4 C 8 2 15 2 18 5 L 34 10 C 37 12 37 17 34 17 L 3 17 C 1 15 1 7 6 4 Z" fill="#291307" stroke="#000000" stroke-width="2.2"/>
  <rect x="2" y="14" width="8" height="4" fill="#0f0702"/>
  <line x1="16" y1="6" x2="18" y2="10" stroke="#f59e0b" stroke-width="1.2"/>
</svg>
`.trim());

// Pickpocket Mustache & Flat Cap
fs.writeFileSync(path.join(pickpocketDir, 'mask_lower.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 20" width="48" height="20">
  <!-- Comedic handlebar mustache -->
  <path d="M 8 10 Q 16 2 24 8 Q 32 2 40 10 Q 32 16 24 10 Q 16 16 8 10 Z" fill="#1e293b" stroke="#000000" stroke-width="2"/>
</svg>
`.trim());

// ==========================================
// 5. ARCHETYPE 3: CABLE CHOR (High-Vis Safety Vest & Bolt Clippers)
// ==========================================
const cableChorDir = path.join(CHAR_DIR, 'cableChor');
ensureDir(cableChorDir);

// Torso: High-visibility neon orange/green utility safety vest with reflective silver stripes
fs.writeFileSync(path.join(cableChorDir, 'torso.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- Bright Neon Orange/Yellow Safety Vest -->
  <path d="M 12 10 Q 32 6 52 10 L 46 54 Q 32 56 18 54 Z" fill="#f97316" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Silver Reflective Stripes with glow -->
  <rect x="14" y="22" width="36" height="7" fill="#e2e8f0" stroke="#000000" stroke-width="1.5"/>
  <rect x="16" y="38" width="32" height="7" fill="#e2e8f0" stroke="#000000" stroke-width="1.5"/>
  <!-- Inner dark undershirt V-neck -->
  <polygon points="24,10 32,24 40,10" fill="#0f172a" stroke="#000000" stroke-width="1.5"/>
  <!-- Radio / Tool Clip -->
  <rect x="36" y="24" width="4" height="12" fill="#020617"/>
</svg>
`.trim());

fs.writeFileSync(path.join(cableChorDir, 'arm_upper.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 38" width="24" height="38">
  <path d="M 4 4 C 4 1 20 1 20 4 L 19 32 C 19 35 5 35 5 32 Z" fill="#ea580c" stroke="#000000" stroke-width="2.5"/>
  <line x1="4" y1="20" x2="20" y2="20" stroke="#f8fafc" stroke-width="3"/>
</svg>
`.trim());

fs.writeFileSync(path.join(cableChorDir, 'arm_lower.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 34" width="22" height="34">
  <path d="M 5 2 L 6 30 C 6 33 17 33 17 30 L 18 2 Z" fill="#b45309" stroke="#000000" stroke-width="2.5"/>
  <!-- Heavy yellow rubber glove cuff -->
  <rect x="5" y="22" width="13" height="9" rx="2" fill="#eab308" stroke="#000000" stroke-width="1.8"/>
</svg>
`.trim());

// Hand: Heavy duty yellow work glove
fs.writeFileSync(path.join(cableChorDir, 'hand.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" width="26" height="26">
  <path d="M 3 10 C 2 5 14 3 18 6 C 22 9 24 18 20 22 C 16 26 5 25 3 18 Z" fill="#eab308" stroke="#000000" stroke-width="2.5"/>
  <!-- Grip pad lines -->
  <line x1="8" y1="12" x2="16" y2="12" stroke="#ca8a04" stroke-width="2"/>
  <line x1="9" y1="17" x2="17" y2="17" stroke="#ca8a04" stroke-width="2"/>
</svg>
`.trim());

fs.writeFileSync(path.join(cableChorDir, 'thigh.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 38" width="24" height="38">
  <path d="M 4 2 L 6 36 L 20 36 L 21 2 Z" fill="#334155" stroke="#000000" stroke-width="2.5"/>
  <!-- Cargo pocket -->
  <rect x="5" y="16" width="14" height="12" rx="2" fill="#1e293b" stroke="#000000" stroke-width="1.5"/>
</svg>
`.trim());

fs.writeFileSync(path.join(cableChorDir, 'shin.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 36" width="22" height="36">
  <path d="M 4 2 L 6 30 C 6 33 17 33 17 30 L 18 2 Z" fill="#1e293b" stroke="#000000" stroke-width="2.5"/>
</svg>
`.trim());

// Foot: Heavy steel-toe work boot
fs.writeFileSync(path.join(cableChorDir, 'foot.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 22" width="38" height="22">
  <path d="M 6 4 C 8 2 15 2 18 5 L 34 8 C 37 10 37 17 34 17 L 3 17 C 1 15 1 7 6 4 Z" fill="#78350f" stroke="#000000" stroke-width="2.5"/>
  <!-- Steel Toe Cap -->
  <path d="M 28 8 Q 36 12 34 17 L 26 17 Z" fill="#94a3b8" stroke="#000000" stroke-width="1.5"/>
  <!-- Deep lug tread -->
  <rect x="2" y="17" width="34" height="4" fill="#020617"/>
  <line x1="8" y1="18" x2="8" y2="21" stroke="#ffffff" stroke-width="1.5"/>
  <line x1="16" y1="18" x2="16" y2="21" stroke="#ffffff" stroke-width="1.5"/>
  <line x1="24" y1="18" x2="24" y2="21" stroke="#ffffff" stroke-width="1.5"/>
</svg>
`.trim());

// Props: Bolt Cutters & Copper Wire Coil
fs.writeFileSync(path.join(cableChorDir, 'prop_cutter.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44" width="44" height="44">
  <!-- Heavy Red Bolt Cutters -->
  <path d="M 6 38 L 22 22 L 26 26 L 10 42 Z" fill="#dc2626" stroke="#000000" stroke-width="2"/>
  <path d="M 38 6 L 22 22 L 26 26 L 42 10 Z" fill="#dc2626" stroke="#000000" stroke-width="2"/>
  <!-- Steel cutting jaw blades -->
  <polygon points="20,18 28,14 30,22" fill="#cbd5e1" stroke="#000000" stroke-width="1.5"/>
  <polygon points="18,20 14,28 22,30" fill="#cbd5e1" stroke="#000000" stroke-width="1.5"/>
  <circle cx="23" cy="23" r="3" fill="#475569" stroke="#000000" stroke-width="1.5"/>
</svg>
`.trim());

fs.writeFileSync(path.join(cableChorDir, 'prop_wire_coil.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <!-- Coiled copper wire roll carried on back -->
  <circle cx="24" cy="24" r="20" fill="none" stroke="#b45309" stroke-width="5"/>
  <circle cx="24" cy="24" r="16" fill="none" stroke="#d97706" stroke-width="4"/>
  <circle cx="24" cy="24" r="12" fill="none" stroke="#f59e0b" stroke-width="3"/>
  <!-- Exposed raw wire ends with sparks -->
  <line x1="24" y1="4" x2="32" y2="1" stroke="#b45309" stroke-width="3"/>
  <circle cx="33" cy="1" r="2" fill="#38bdf8"/>
</svg>
`.trim());

// ==========================================
// 6. ARCHETYPE 4: MANHOLE CHOR (Lungi & WASA Cover Shield)
// ==========================================
const manholeChorDir = path.join(CHAR_DIR, 'manholeChor');
ensureDir(manholeChorDir);

// Torso: Grimy ribbed white banyan (sleeveless tank) with sweat stains
fs.writeFileSync(path.join(manholeChorDir, 'torso.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <path d="M 14 12 Q 32 8 50 12 L 46 54 Q 32 56 18 54 Z" fill="#f1f5f9" stroke="#000000" stroke-width="2.5"/>
  <!-- Deep armhole cutouts -->
  <path d="M 22 10 Q 32 20 42 10" stroke="#000000" stroke-width="2.2" fill="none"/>
  <!-- Ribbed texture lines -->
  <line x1="22" y1="18" x2="22" y2="52" stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="28" y1="18" x2="28" y2="53" stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="36" y1="18" x2="36" y2="53" stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="42" y1="18" x2="42" y2="52" stroke="#cbd5e1" stroke-width="1.5"/>
  <!-- Dhaka summer sweat patch -->
  <ellipse cx="32" cy="30" rx="9" ry="6" fill="#e2e8f0" opacity="0.7"/>
</svg>
`.trim());

fs.writeFileSync(path.join(manholeChorDir, 'arm_upper.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 38" width="24" height="38">
  <!-- Bare muscular arm with shoulder definition -->
  <path d="M 4 4 C 4 1 20 1 20 4 L 19 32 C 19 35 5 35 5 32 Z" fill="#d97706" stroke="#000000" stroke-width="2.5"/>
</svg>
`.trim());

fs.writeFileSync(path.join(manholeChorDir, 'arm_lower.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 34" width="22" height="34">
  <path d="M 5 2 L 6 30 C 6 33 17 33 17 30 L 18 2 Z" fill="#d97706" stroke="#000000" stroke-width="2.5"/>
</svg>
`.trim());

fs.writeFileSync(path.join(manholeChorDir, 'hand.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" width="26" height="26">
  <path d="M 3 10 C 2 5 14 3 18 6 C 22 9 24 18 20 22 C 16 26 5 25 3 18 Z" fill="#b45309" stroke="#000000" stroke-width="2.5"/>
</svg>
`.trim());

// Hitched-Up Green Checkered Lungi (Pants/Thighs)
fs.writeFileSync(path.join(manholeChorDir, 'thigh.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 38" width="28" height="38">
  <!-- Folded hitched lungi around waist/thigh -->
  <path d="M 2 2 L 4 34 Q 14 38 24 34 L 26 2 Z" fill="#047857" stroke="#000000" stroke-width="2.5"/>
  <!-- Lungi Checks -->
  <line x1="2" y1="12" x2="26" y2="12" stroke="#a7f3d0" stroke-width="1.5"/>
  <line x1="3" y1="24" x2="25" y2="24" stroke="#a7f3d0" stroke-width="1.5"/>
  <line x1="10" y1="2" x2="10" y2="35" stroke="#a7f3d0" stroke-width="1.5"/>
  <line x1="18" y1="2" x2="18" y2="35" stroke="#a7f3d0" stroke-width="1.5"/>
</svg>
`.trim());

fs.writeFileSync(path.join(manholeChorDir, 'shin.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 36" width="22" height="36">
  <!-- Bare Muscular Calf -->
  <path d="M 4 2 L 6 30 C 6 33 17 33 17 30 L 18 2 Z" fill="#d97706" stroke="#000000" stroke-width="2.5"/>
</svg>
`.trim());

// Foot: Classic Bata Hawaii Blue/White Rubber Slipper
fs.writeFileSync(path.join(manholeChorDir, 'foot.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 18" width="38" height="18">
  <!-- Foot skin -->
  <path d="M 6 4 C 8 2 16 2 20 6 L 34 10 C 36 12 36 15 33 15 L 4 15 Z" fill="#d97706" stroke="#000000" stroke-width="2"/>
  <!-- Blue Rubber Sole -->
  <path d="M 2 13 L 36 13 C 37 13 37 16 35 16 L 2 16 Z" fill="#2563eb" stroke="#000000" stroke-width="1.5"/>
  <!-- White Insole Cushion -->
  <rect x="3" y="12" width="33" height="2" fill="#ffffff"/>
  <!-- V-strap (Hawaii Chappal) -->
  <path d="M 14 6 L 24 13" stroke="#2563eb" stroke-width="2.5"/>
  <circle cx="24" cy="13" r="1.5" fill="#1d4ed8"/>
</svg>
`.trim());

// Prop: Rusty Heavy Cast-Iron Manhole Cover with Dhaka WASA parody seal
fs.writeFileSync(path.join(manholeChorDir, 'prop_manhole_cover.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <radialGradient id="ironGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="70%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
  </defs>
  <!-- Cast Iron Round Shield -->
  <circle cx="32" cy="32" r="30" fill="url(#ironGrad)" stroke="#000000" stroke-width="3"/>
  <circle cx="32" cy="32" r="23" fill="none" stroke="#64748b" stroke-width="2"/>
  <!-- Center Drainage Cross Grate -->
  <line x1="32" y1="12" x2="32" y2="52" stroke="#000000" stroke-width="3"/>
  <line x1="12" y1="32" x2="52" y2="32" stroke="#000000" stroke-width="3"/>
  <line x1="18" y1="18" x2="46" y2="46" stroke="#000000" stroke-width="2.5"/>
  <line x1="18" y1="46" x2="46" y2="18" stroke="#000000" stroke-width="2.5"/>
  <!-- Parody Seal Stamp -->
  <circle cx="32" cy="32" r="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="32" y="34" font-size="5" font-weight="bold" fill="#f59e0b" text-anchor="middle">WASA</text>
</svg>
`.trim());

// ==========================================
// 7. ARCHETYPE 5: EID MARKET CHOR (Shiny Punjabi & Shopping Bags)
// ==========================================
const eidDir = path.join(CHAR_DIR, 'eidMarketChor');
ensureDir(eidDir);

// Torso: Shiny Magenta/Gold Embroidered Punjabi with Mandarin collar & golden buttons
fs.writeFileSync(path.join(eidDir, 'torso.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 68" width="64" height="68">
  <defs>
    <linearGradient id="punjabiGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="60%" stop-color="#be123c"/>
      <stop offset="100%" stop-color="#881337"/>
    </linearGradient>
  </defs>
  <!-- Long Flowing Punjabi Kurta -->
  <path d="M 12 10 Q 32 6 52 10 L 50 64 Q 32 66 14 64 Z" fill="url(#punjabiGrad)" stroke="#000000" stroke-width="2.5"/>
  <!-- Gold Zari Embroidery along collar & chest -->
  <path d="M 28 8 L 32 28 L 36 8" stroke="#f59e0b" stroke-width="3" fill="none"/>
  <!-- Golden buttons -->
  <circle cx="32" cy="14" r="1.5" fill="#fef08a" stroke="#000000" stroke-width="1"/>
  <circle cx="32" cy="20" r="1.5" fill="#fef08a" stroke="#000000" stroke-width="1"/>
  <circle cx="32" cy="26" r="1.5" fill="#fef08a" stroke="#000000" stroke-width="1"/>
  <!-- Gold Hem Border -->
  <path d="M 15 62 Q 32 65 49 62" stroke="#f59e0b" stroke-width="2.5" fill="none"/>
</svg>
`.trim());

fs.writeFileSync(path.join(eidDir, 'arm_upper.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 38" width="24" height="38">
  <path d="M 4 4 C 4 1 20 1 20 4 L 19 32 C 19 35 5 35 5 32 Z" fill="#be123c" stroke="#000000" stroke-width="2.5"/>
</svg>
`.trim());

fs.writeFileSync(path.join(eidDir, 'arm_lower.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 34" width="22" height="34">
  <path d="M 5 2 L 6 30 C 6 33 17 33 17 30 L 18 2 Z" fill="#be123c" stroke="#000000" stroke-width="2.5"/>
  <line x1="6" y1="28" x2="17" y2="28" stroke="#f59e0b" stroke-width="2"/>
</svg>
`.trim());

fs.writeFileSync(path.join(eidDir, 'hand.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" width="26" height="26">
  <path d="M 3 10 C 2 5 14 3 18 6 C 22 9 24 18 20 22 C 16 26 5 25 3 18 Z" fill="#fbcfe8" stroke="#000000" stroke-width="2.2"/>
</svg>
`.trim());

fs.writeFileSync(path.join(eidDir, 'thigh.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 38" width="24" height="38">
  <!-- Crisp white Churidar pajama -->
  <path d="M 4 2 L 6 36 L 20 36 L 21 2 Z" fill="#f8fafc" stroke="#000000" stroke-width="2.5"/>
</svg>
`.trim());

fs.writeFileSync(path.join(eidDir, 'shin.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 36" width="22" height="36">
  <!-- Churidar gathered pleats at bottom -->
  <path d="M 5 2 L 6 30 C 6 33 17 33 17 30 L 18 2 Z" fill="#f8fafc" stroke="#000000" stroke-width="2.5"/>
  <line x1="6" y1="18" x2="17" y2="18" stroke="#cbd5e1" stroke-width="1.2"/>
  <line x1="6" y1="24" x2="17" y2="24" stroke="#cbd5e1" stroke-width="1.2"/>
</svg>
`.trim());

// Foot: Traditional pointed Nagra shoes with upturned curly toe
fs.writeFileSync(path.join(eidDir, 'foot.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 20" width="38" height="20">
  <!-- Upturned Royal Nagra Slipper -->
  <path d="M 6 5 C 9 2 15 2 18 5 L 34 11 C 38 8 38 15 33 15 L 3 15 C 1 13 1 7 6 5 Z" fill="#e11d48" stroke="#000000" stroke-width="2.2"/>
  <!-- Gold embroidery on toe -->
  <path d="M 22 9 Q 30 11 34 8" stroke="#f59e0b" stroke-width="2" fill="none"/>
</svg>
`.trim());

// Prop: Multiple Stolen Luxury Eid Shopping Bags
fs.writeFileSync(path.join(eidDir, 'prop_shopping_bags.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 54" width="54" height="54">
  <!-- Yellow Shopping Bag -->
  <rect x="4" y="16" width="24" height="32" rx="3" fill="#eab308" stroke="#000000" stroke-width="2"/>
  <path d="M 10 16 Q 16 6 22 16" fill="none" stroke="#000000" stroke-width="2"/>
  <text x="16" y="34" font-size="6" font-weight="bold" fill="#000000" text-anchor="middle">AARONG</text>
  <!-- Purple Shopping Bag Overlapping -->
  <rect x="22" y="20" width="26" height="30" rx="3" fill="#a855f7" stroke="#000000" stroke-width="2"/>
  <path d="M 28 20 Q 35 10 42 20" fill="none" stroke="#000000" stroke-width="2"/>
  <text x="35" y="38" font-size="5" font-weight="bold" fill="#ffffff" text-anchor="middle">LUXURY</text>
</svg>
`.trim());

// ==========================================
// 8. ARCHETYPE 6: CHICKEN CHOR (Gamcha & Live Rooster)
// ==========================================
const chickenDir = path.join(CHAR_DIR, 'chickenChor');
ensureDir(chickenDir);

// Torso: Faded blue tee with rural Red Checkered Gamcha scarf slung over shoulder
fs.writeFileSync(path.join(chickenDir, 'torso.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- Faded Blue Cotton T-shirt -->
  <path d="M 12 10 Q 32 6 52 10 L 46 54 Q 32 56 18 54 Z" fill="#38bdf8" stroke="#000000" stroke-width="2.5"/>
  <!-- Red & White Checkered Gamcha Scarf draped diagonally -->
  <path d="M 14 10 L 26 12 L 48 54 L 36 56 Z" fill="#ef4444" stroke="#000000" stroke-width="2"/>
  <line x1="16" y1="18" x2="38" y2="54" stroke="#ffffff" stroke-width="1.8"/>
  <line x1="22" y1="12" x2="44" y2="48" stroke="#ffffff" stroke-width="1.8"/>
  <line x1="16" y1="26" x2="28" y2="18" stroke="#ffffff" stroke-width="1.5"/>
  <line x1="24" y1="38" x2="36" y2="30" stroke="#ffffff" stroke-width="1.5"/>
  <line x1="32" y1="50" x2="44" y2="42" stroke="#ffffff" stroke-width="1.5"/>
</svg>
`.trim());

fs.writeFileSync(path.join(chickenDir, 'arm_upper.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 38" width="24" height="38">
  <path d="M 4 4 C 4 1 20 1 20 4 L 19 32 C 19 35 5 35 5 32 Z" fill="#d97706" stroke="#000000" stroke-width="2.5"/>
</svg>
`.trim());

fs.writeFileSync(path.join(chickenDir, 'arm_lower.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 34" width="22" height="34">
  <path d="M 5 2 L 6 30 C 6 33 17 33 17 30 L 18 2 Z" fill="#d97706" stroke="#000000" stroke-width="2.5"/>
</svg>
`.trim());

fs.writeFileSync(path.join(chickenDir, 'hand.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" width="26" height="26">
  <path d="M 3 10 C 2 5 14 3 18 6 C 22 9 24 18 20 22 C 16 26 5 25 3 18 Z" fill="#b45309" stroke="#000000" stroke-width="2.5"/>
</svg>
`.trim());

fs.writeFileSync(path.join(chickenDir, 'thigh.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 38" width="26" height="38">
  <!-- Hitched Blue Checkered Lungi -->
  <path d="M 4 2 L 6 36 L 22 36 L 24 2 Z" fill="#1e3a8a" stroke="#000000" stroke-width="2.5"/>
  <line x1="5" y1="16" x2="23" y2="16" stroke="#60a5fa" stroke-width="1.5"/>
  <line x1="5" y1="28" x2="23" y2="28" stroke="#60a5fa" stroke-width="1.5"/>
</svg>
`.trim());

fs.writeFileSync(path.join(chickenDir, 'shin.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 36" width="22" height="36">
  <path d="M 4 2 L 6 30 C 6 33 17 33 17 30 L 18 2 Z" fill="#d97706" stroke="#000000" stroke-width="2.5"/>
</svg>
`.trim());

// Foot: Worn Bata Hawaii Slipper
fs.writeFileSync(path.join(chickenDir, 'foot.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 18" width="38" height="18">
  <path d="M 6 4 C 8 2 16 2 20 6 L 34 10 C 36 12 36 15 33 15 L 4 15 Z" fill="#d97706" stroke="#000000" stroke-width="2"/>
  <path d="M 2 13 L 36 13 C 37 13 37 16 35 16 L 2 16 Z" fill="#1e40af" stroke="#000000" stroke-width="1.5"/>
  <path d="M 14 6 L 24 13" stroke="#ef4444" stroke-width="2.5"/>
</svg>
`.trim());

// Prop: Panicked Squawking Deshi Rooster with feathers
fs.writeFileSync(path.join(chickenDir, 'prop_chicken.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 54" width="54" height="54">
  <!-- Plump Brown Feathered Body -->
  <ellipse cx="26" cy="30" rx="18" ry="14" fill="#b45309" stroke="#000000" stroke-width="2.5"/>
  <!-- Wing Feather Layer -->
  <path d="M 16 26 C 24 24 32 30 30 38 C 24 42 16 38 16 26 Z" fill="#d97706" stroke="#000000" stroke-width="2"/>
  <!-- Rooster Head & Open Beak -->
  <circle cx="40" cy="20" r="8" fill="#d97706" stroke="#000000" stroke-width="2"/>
  <polygon points="46,18 54,20 46,24" fill="#f59e0b" stroke="#000000" stroke-width="1.5"/>
  <!-- Red Comb & Wattle -->
  <path d="M 38 12 Q 41 6 44 12 Q 47 7 48 14" fill="#ef4444" stroke="#000000" stroke-width="1.5"/>
  <path d="M 46 24 C 48 28 44 32 42 28 Z" fill="#ef4444" stroke="#000000" stroke-width="1.5"/>
  <!-- Shocked Cartoon Eye -->
  <circle cx="42" cy="18" r="3" fill="#ffffff" stroke="#000000" stroke-width="1"/>
  <circle cx="43" cy="18" r="1.2" fill="#000000"/>
  <!-- Green Iridescent Tail Feathers -->
  <path d="M 10 26 Q 2 16 6 8 Q 14 14 12 24" fill="#047857" stroke="#000000" stroke-width="2"/>
  <path d="M 8 28 Q 0 22 2 14 Q 10 20 10 28" fill="#065f46" stroke="#000000" stroke-width="2"/>
</svg>
`.trim());

// ==========================================
// 9. ARCHETYPE 7: CHOR SARDAR (Boss: Safari Suit, Medallion, Briefcase)
// ==========================================
const sardarDir = path.join(CHAR_DIR, 'chorSardar');
ensureDir(sardarDir);

// Torso: Cream Safari Suit with Gold Chain Medallion
fs.writeFileSync(path.join(sardarDir, 'torso.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 68" width="68" height="68">
  <defs>
    <linearGradient id="safariGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="70%" stop-color="#fde68a"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <!-- Broad Boss Safari Jacket Torso -->
  <path d="M 10 10 Q 34 6 58 10 L 52 56 Q 34 58 16 56 Z" fill="url(#safariGrad)" stroke="#000000" stroke-width="2.5"/>
  <!-- Wide Safari Lapels -->
  <polygon points="14,10 26,18 20,28 14,24" fill="#f59e0b" stroke="#000000" stroke-width="1.8"/>
  <polygon points="54,10 42,18 48,28 54,24" fill="#f59e0b" stroke="#000000" stroke-width="1.8"/>
  <!-- Heavy Chunky Gold Medallion Chain -->
  <path d="M 22 14 Q 34 32 46 14" stroke="#eab308" stroke-width="3" fill="none"/>
  <circle cx="34" cy="30" r="5" fill="#facc15" stroke="#000000" stroke-width="1.8"/>
  <text x="34" y="32" font-size="5" font-weight="bold" fill="#713f12" text-anchor="middle">$</text>
  <!-- Four Flap Safari Pockets -->
  <rect x="18" y="24" width="10" height="8" rx="1.5" fill="#f59e0b" stroke="#000000" stroke-width="1.2"/>
  <rect x="40" y="24" width="10" height="8" rx="1.5" fill="#f59e0b" stroke="#000000" stroke-width="1.2"/>
  <rect x="18" y="42" width="11" height="9" rx="1.5" fill="#f59e0b" stroke="#000000" stroke-width="1.2"/>
  <rect x="39" y="42" width="11" height="9" rx="1.5" fill="#f59e0b" stroke="#000000" stroke-width="1.2"/>
</svg>
`.trim());

fs.writeFileSync(path.join(sardarDir, 'arm_upper.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 38" width="26" height="38">
  <path d="M 4 4 C 4 1 22 1 22 4 L 21 32 C 21 35 5 35 5 32 Z" fill="#fde68a" stroke="#000000" stroke-width="2.5"/>
</svg>
`.trim());

fs.writeFileSync(path.join(sardarDir, 'arm_lower.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 34" width="24" height="34">
  <path d="M 5 2 L 6 30 C 6 33 19 33 19 30 L 20 2 Z" fill="#fde68a" stroke="#000000" stroke-width="2.5"/>
  <!-- Chunky Gold Watch -->
  <rect x="5" y="24" width="14" height="5" rx="1" fill="#facc15" stroke="#000000" stroke-width="1.5"/>
</svg>
`.trim());

fs.writeFileSync(path.join(sardarDir, 'hand.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" width="26" height="26">
  <path d="M 3 10 C 2 5 14 3 18 6 C 22 9 24 18 20 22 C 16 26 5 25 3 18 Z" fill="#fbcfe8" stroke="#000000" stroke-width="2.2"/>
  <!-- Gold ring on pinky -->
  <circle cx="17" cy="18" r="2" fill="#facc15" stroke="#000000" stroke-width="1"/>
</svg>
`.trim());

fs.writeFileSync(path.join(sardarDir, 'thigh.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 38" width="26" height="38">
  <path d="M 4 2 L 6 36 L 22 36 L 24 2 Z" fill="#fde68a" stroke="#000000" stroke-width="2.5"/>
  <!-- Creased formal front line -->
  <line x1="14" y1="2" x2="14" y2="36" stroke="#d97706" stroke-width="1.2"/>
</svg>
`.trim());

fs.writeFileSync(path.join(sardarDir, 'shin.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 36" width="22" height="36">
  <path d="M 4 2 L 6 30 C 6 33 17 33 17 30 L 18 2 Z" fill="#fde68a" stroke="#000000" stroke-width="2.5"/>
</svg>
`.trim());

// Foot: Shiny Italian Black Leather Loafers with Gold Buckle
fs.writeFileSync(path.join(sardarDir, 'foot.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 20" width="38" height="20">
  <path d="M 6 4 C 8 2 15 2 18 5 L 34 10 C 37 12 37 17 34 17 L 3 17 C 1 15 1 7 6 4 Z" fill="#0f172a" stroke="#000000" stroke-width="2.2"/>
  <!-- Glossy Highlight -->
  <path d="M 12 5 Q 24 8 32 11" stroke="#475569" stroke-width="1.5" fill="none"/>
  <!-- Gold Horsebit Buckle -->
  <rect x="18" y="7" width="6" height="3" fill="#facc15" stroke="#000000" stroke-width="1"/>
</svg>
`.trim());

// Prop: Metallic Briefcase with spilling 1000 Taka notes
fs.writeFileSync(path.join(sardarDir, 'prop_briefcase.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 40" width="48" height="40">
  <!-- Silver Aluminum Hard Case Briefcase -->
  <rect x="4" y="10" width="40" height="26" rx="3" fill="#94a3b8" stroke="#000000" stroke-width="2"/>
  <line x1="4" y1="23" x2="44" y2="23" stroke="#000000" stroke-width="2"/>
  <!-- Chrome Latches -->
  <rect x="12" y="21" width="5" height="4" fill="#f8fafc" stroke="#000000" stroke-width="1.2"/>
  <rect x="31" y="21" width="5" height="4" fill="#f8fafc" stroke="#000000" stroke-width="1.2"/>
  <!-- Handle -->
  <path d="M 19 10 L 19 5 L 29 5 L 29 10" fill="none" stroke="#000000" stroke-width="2.5"/>
  <!-- 1000 Taka notes sticking out -->
  <rect x="22" y="20" width="12" height="6" fill="#a855f7" stroke="#000000" stroke-width="1"/>
  <text x="28" y="25" font-size="4" font-weight="bold" fill="#ffffff" text-anchor="middle">1000</text>
</svg>
`.trim());

// Chor Sardar Gold Aviator Sunglasses
fs.writeFileSync(path.join(sardarDir, 'headFront.svg'), `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 22" width="54" height="22">
  <!-- Aviator teardrop lenses -->
  <path d="M 8 4 Q 22 2 24 14 Q 18 20 10 16 Z" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <path d="M 46 4 Q 32 2 30 14 Q 36 20 44 16 Z" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
  <!-- Double Bridge -->
  <line x1="22" y1="6" x2="32" y2="6" stroke="#f59e0b" stroke-width="2"/>
  <line x1="23" y1="9" x2="31" y2="9" stroke="#f59e0b" stroke-width="1.5"/>
</svg>
`.trim());

console.log('SUCCESS: All 8 characters generated with layered human anatomy SVG parts!');
