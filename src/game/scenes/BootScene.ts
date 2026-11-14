import Phaser from "phaser";
import { BALANCE } from "@/config/balance";
import { MAP_SCENARIOS } from "@/config/maps";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    // Generate all Tier 0 procedural textures so the game never blocks on assets
    this.createProceduralTextures();
  }

  create() {
    this.scene.start("PreloadScene");
  }

  private createProceduralTextures() {
    // 1. Sky Gradient (1280 x 720)
    if (!this.textures.exists("bg-sky")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillGradientStyle(0x1e1b4b, 0x311042, 0xd97706, 0xf59e0b, 1);
      g.fillRect(0, 0, BALANCE.LOGICAL_WIDTH, 500);
      g.generateTexture("bg-sky", BALANCE.LOGICAL_WIDTH, 500);
      g.destroy();
    }

    // 2. Far Skyline Silhouettes (1280 x 300)
    if (!this.textures.exists("bg-far-buildings")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x1e1b4b, 0.7);
      // Draw various stepped building heights
      for (let x = 0; x < BALANCE.LOGICAL_WIDTH; x += 60) {
        const h = 80 + Math.sin(x * 0.05) * 40 + (x % 50);
        g.fillRect(x, 300 - h, 56, h);
      }
      g.generateTexture("bg-far-buildings", BALANCE.LOGICAL_WIDTH, 300);
      g.destroy();
    }

    // 3. Near Buildings & Authentic Dhaka Billboards (1280 x 360)
    if (!this.textures.exists("bg-near-buildings")) {
      const canvas = document.createElement("canvas");
      canvas.width = BALANCE.LOGICAL_WIDTH;
      canvas.height = 360;
      const ctx = canvas.getContext("2d")!;

      const buildingColors = ["#1e293b", "#0f172a", "#334155", "#1e1b4b", "#172554"];
      const billboards = [
        { main: "মিরপুর ১০ মেট্রো", sub: "MIRPUR 10 MRT", bg: "#0284c7", fg: "#ffffff" },
        { main: "সাউথইস্ট ইউনিভার্সিটি", sub: "SOUTHEAST UNI", bg: "#047857", fg: "#fef08a" },
        { main: "মিরপুর ১২ বাস স্ট্যান্ড", sub: "MIRPUR 12 STAND", bg: "#b91c1c", fg: "#ffffff" },
        { main: "কাচ্চি ভাই বিরিয়ানি", sub: "KACCHI BHAI", bg: "#d97706", fg: "#ffffff" },
        { main: "বাটার অরিজিনাল জুতো", sub: "BATA SHOES", bg: "#dc2626", fg: "#ffffff" },
        { main: "লোডশেডিং স্পেশাল আইপিএস", sub: "IPS BATTERY", bg: "#4f46e5", fg: "#fef08a" },
        { main: "প্যারা নাই চিল টি স্টল", sub: "PERA NAI CHILL", bg: "#e11d48", fg: "#ffffff" },
      ];

      let bbIndex = 0;
      for (let x = 0; x < BALANCE.LOGICAL_WIDTH; x += 130) {
        const col = buildingColors[(x / 130) % buildingColors.length];
        const h = 190 + ((x * 17) % 130);
        
        // Building facade
        ctx.fillStyle = col;
        ctx.fillRect(x, 360 - h, 120, h);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, 360 - h, 120, h);

        // Windows (glowing yellow/cyan)
        ctx.fillStyle = (x % 260 === 0) ? "rgba(56, 189, 248, 0.7)" : "rgba(254, 240, 138, 0.75)";
        for (let wy = 360 - h + 30; wy < 340; wy += 32) {
          for (let wx = x + 16; wx < x + 105; wx += 28) {
            ctx.fillRect(wx, wy, 16, 18);
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(wx, wy, 16, 18);
          }
        }

        // Authentic Dhaka Illuminated Neon Billboard
        const bb = billboards[bbIndex % billboards.length];
        bbIndex++;

        const bbWidth = 110;
        const bbHeight = 36;
        const bbX = x + 5;
        const bbY = 360 - h + 10;

        // Sign background with thick black outline
        ctx.fillStyle = bb.bg;
        ctx.fillRect(bbX, bbY, bbWidth, bbHeight);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.strokeRect(bbX, bbY, bbWidth, bbHeight);

        // Inner glowing border
        ctx.strokeStyle = bb.fg;
        ctx.lineWidth = 1;
        ctx.strokeRect(bbX + 2, bbY + 2, bbWidth - 4, bbHeight - 4);

        // Text rendering
        ctx.fillStyle = bb.fg;
        ctx.font = "bold 10px 'Hind Siliguri', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(bb.main, bbX + bbWidth / 2, bbY + 16);

        ctx.font = "bold 7px 'Luckiest Guy', Impact, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(bb.sub, bbX + bbWidth / 2, bbY + 28);
      }

      this.textures.addCanvas("bg-near-buildings", canvas);
    }

    // 4. Dhaka 3-Lane Asphalt Road (1280 x 370)
    if (!this.textures.exists("bg-road")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Asphalt
      g.fillStyle(0x0f172a, 1);
      g.fillRect(0, 0, BALANCE.LOGICAL_WIDTH, 370);

      // Top curb / sidewalk (Rickshaw art colors: red-green-yellow stripe)
      g.fillStyle(0x059669, 1);
      g.fillRect(0, 0, BALANCE.LOGICAL_WIDTH, 8);
      g.fillStyle(0xdc2626, 1);
      g.fillRect(0, 8, BALANCE.LOGICAL_WIDTH, 6);
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(0, 14, BALANCE.LOGICAL_WIDTH, 6);

      // Lane dividers (dashed yellow & white lines)
      g.fillStyle(0xfacc15, 0.9);
      for (let x = 0; x < BALANCE.LOGICAL_WIDTH; x += 70) {
        g.fillRect(x, 107, 40, 5); // Lane 0-1 divider
        g.fillRect(x, 162, 40, 5); // Lane 1-2 divider
      }
      g.generateTexture("bg-road", BALANCE.LOGICAL_WIDTH, 370);
      g.destroy();
    }

    // 5. Overhead Electric Cable Web (1280 x 150)
    if (!this.textures.exists("bg-wires")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.lineStyle(2, 0x020617, 0.9);

      // Wire 1
      g.beginPath();
      g.moveTo(0, 20);
      for (let x = 0; x <= BALANCE.LOGICAL_WIDTH; x += 40) {
        const sag = 45 * Math.sin((x / (BALANCE.LOGICAL_WIDTH / 2)) * Math.PI);
        g.lineTo(x, 25 + Math.abs(sag));
      }
      g.strokePath();

      // Wire 2
      g.beginPath();
      g.moveTo(0, 50);
      for (let x = 0; x <= BALANCE.LOGICAL_WIDTH; x += 40) {
        const sag = 55 * Math.sin((x / BALANCE.LOGICAL_WIDTH) * Math.PI);
        g.lineTo(x, 40 + Math.abs(sag));
      }
      g.strokePath();

      // Wire 3
      g.beginPath();
      g.moveTo(0, 80);
      for (let x = 0; x <= BALANCE.LOGICAL_WIDTH; x += 40) {
        const sag = 35 * Math.sin(((x + 200) / BALANCE.LOGICAL_WIDTH) * Math.PI);
        g.lineTo(x, 60 + Math.abs(sag));
      }
      g.strokePath();

      // Tangled colorful paper kite (ঘুড়ি) stuck in the electric wires
      g.fillStyle(0xef4444, 1);
      g.fillTriangle(480, 55, 505, 38, 505, 72);
      g.fillStyle(0xfacc15, 1);
      g.fillTriangle(530, 55, 505, 38, 505, 72);
      g.lineStyle(1.5, 0x000000, 1);
      g.strokeTriangle(480, 55, 505, 38, 505, 72);
      g.strokeTriangle(530, 55, 505, 38, 505, 72);

      g.generateTexture("bg-wires", BALANCE.LOGICAL_WIDTH, 150);
      g.destroy();
    }

    // 6. Flying Chappal Texture
    if (!this.textures.exists("projectile-chappal")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Chappal rubber sole (Bata hawai chappal)
      g.fillStyle(0x2563eb, 1); // Blue sole
      g.fillRoundedRect(5, 12, 60, 26, 12);
      g.lineStyle(3, 0x000000, 1);
      g.strokeRoundedRect(5, 12, 60, 26, 12);

      // Inner sole layer (White)
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(8, 14, 54, 22, 10);

      // Y-Strap (Red)
      g.lineStyle(5, 0xdc2626, 1);
      g.beginPath();
      g.moveTo(22, 14);
      g.lineTo(44, 25);
      g.lineTo(22, 36);
      g.strokePath();

      // Toe thong plug
      g.fillStyle(0x000000, 1);
      g.fillCircle(45, 25, 4);

      g.generateTexture("projectile-chappal", 70, 50);
      g.destroy();
    }

    // 6b. Heavy Leather Sandal Projectile (Paduka Pro)
    if (!this.textures.exists("projectile-chappal-leather")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Dark brown leather sole
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(5, 12, 62, 28, 10);
      g.lineStyle(3, 0x000000, 1);
      g.strokeRoundedRect(5, 12, 62, 28, 10);
      // Stitched edge
      g.lineStyle(1.5, 0xd97706, 1);
      g.strokeRoundedRect(8, 15, 56, 22, 8);
      // Broad leather cross strap
      g.fillStyle(0x451a03, 1);
      g.fillRect(24, 14, 20, 24);
      // Golden buckle
      g.fillStyle(0xfbbf24, 1);
      g.fillRect(30, 20, 8, 12);
      g.fillStyle(0x451a03, 1);
      g.fillRect(32, 22, 4, 8);
      g.generateTexture("projectile-chappal-leather", 72, 52);
      g.destroy();
    }

    // 6c. Shonar Chappal Projectile (Golden Bridal Sandal)
    if (!this.textures.exists("projectile-chappal-golden")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Shimmering gold sole
      g.fillStyle(0xf59e0b, 1);
      g.fillRoundedRect(5, 12, 60, 26, 12);
      g.lineStyle(2.5, 0x78350f, 1);
      g.strokeRoundedRect(5, 12, 60, 26, 12);
      // Glossy inner gold layer
      g.fillStyle(0xfef08a, 1);
      g.fillRoundedRect(8, 14, 54, 22, 10);
      // Sparkle gem straps
      g.lineStyle(4, 0xd97706, 1);
      g.beginPath();
      g.moveTo(22, 14);
      g.lineTo(44, 25);
      g.lineTo(22, 36);
      g.strokePath();
      // Gem jewel
      g.fillStyle(0xef4444, 1);
      g.fillCircle(44, 25, 4);
      g.generateTexture("projectile-chappal-golden", 70, 50);
      g.destroy();
    }

    // 6d. Comic Dash Dust Puff
    if (!this.textures.exists("fx-dash-dust")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xe2e8f0, 0.85);
      g.fillCircle(14, 14, 10);
      g.fillCircle(24, 12, 8);
      g.fillCircle(32, 16, 9);
      g.lineStyle(2, 0x94a3b8, 0.8);
      g.strokeCircle(14, 14, 10);
      g.strokeCircle(24, 12, 8);
      g.strokeCircle(32, 16, 9);
      g.generateTexture("fx-dash-dust", 46, 30);
      g.destroy();
    }

    // 7. Brick Projectile
    if (!this.textures.exists("projectile-brick")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xb91c1c, 1);
      g.fillRoundedRect(2, 2, 44, 24, 4);
      g.lineStyle(3, 0x450a0a, 1);
      g.strokeRoundedRect(2, 2, 44, 24, 4);
      // Holes in brick
      g.fillStyle(0x450a0a, 1);
      g.fillCircle(14, 14, 4);
      g.fillCircle(24, 14, 4);
      g.fillCircle(34, 14, 4);
      g.generateTexture("projectile-brick", 48, 28);
      g.destroy();
    }

    // 8. Barricade Obstacle
    if (!this.textures.exists("obstacle-barricade")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Red and White diagonal warning stripes
      g.fillStyle(0xef4444, 1);
      g.fillRect(10, 10, 100, 45);
      g.fillStyle(0xffffff, 1);
      for (let i = 0; i < 5; i++) {
        g.beginPath();
        g.moveTo(10 + i * 20, 10);
        g.lineTo(25 + i * 20, 10);
        g.lineTo(10 + i * 20, 55);
        g.lineTo(5 + i * 20, 55);
        g.fillPath();
      }
      g.lineStyle(3, 0x000000, 1);
      g.strokeRect(10, 10, 100, 45);
      // Metal stand legs
      g.lineStyle(5, 0x475569, 1);
      g.lineBetween(20, 55, 10, 95);
      g.lineBetween(100, 55, 110, 95);
      g.generateTexture("obstacle-barricade", 120, 100);
      g.destroy();
    }

    // 9. Burning Tire
    if (!this.textures.exists("obstacle-tire-fire")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Black tire
      g.fillStyle(0x1e293b, 1);
      g.fillEllipse(35, 45, 30, 15);
      g.lineStyle(3, 0x000000, 1);
      g.strokeEllipse(35, 45, 30, 15);
      // Flames
      g.fillStyle(0xf97316, 1);
      g.fillTriangle(25, 42, 35, 10, 45, 42);
      g.fillStyle(0xfacc15, 1);
      g.fillTriangle(28, 42, 35, 18, 42, 42);
      g.generateTexture("obstacle-tire-fire", 70, 60);
      g.destroy();
    }

    // 10. Star Particle
    if (!this.textures.exists("particle-star")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xfacc15, 1);
      g.fillCircle(8, 8, 8);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(8, 8, 4);
      g.generateTexture("particle-star", 16, 16);
      g.destroy();
    }

    // 11. Taka Coin
    if (!this.textures.exists("particle-coin")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xf59e0b, 1);
      g.fillCircle(12, 12, 11);
      g.lineStyle(2, 0x78350f, 1);
      g.strokeCircle(12, 12, 11);
      g.fillStyle(0x78350f, 1);
      // '৳' sign
      g.fillRect(10, 6, 4, 12);
      g.fillRect(8, 6, 8, 3);
      g.generateTexture("particle-coin", 24, 24);
      g.destroy();
    }

    // 12. Cash Note Particle (৳500 / ৳100 paper money)
    if (!this.textures.exists("particle-cash-note")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x15803d, 1);
      g.fillRect(1, 1, 30, 16);
      g.lineStyle(1.5, 0x14532d, 1);
      g.strokeRect(1, 1, 30, 16);
      g.fillStyle(0xdcfce7, 1);
      g.fillCircle(16, 9, 4);
      g.generateTexture("particle-cash-note", 32, 18);
      g.destroy();
    }

    // 13. Feather Particle (Deshi rooster)
    if (!this.textures.exists("particle-feather")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xea580c, 1);
      g.fillEllipse(12, 6, 22, 10);
      g.fillStyle(0xfef08a, 1);
      g.fillRect(4, 5, 14, 2);
      g.generateTexture("particle-feather", 24, 12);
      g.destroy();
    }

    // 14. Spark Particle (Wire cutter / Cable chor)
    if (!this.textures.exists("particle-spark")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x38bdf8, 1);
      g.fillRect(5, 1, 4, 12);
      g.fillRect(1, 5, 12, 4);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(7, 7, 3);
      g.generateTexture("particle-spark", 14, 14);
      g.destroy();
    }

    // 15. Stamped Document Particle (Sardar bribe papers)
    if (!this.textures.exists("particle-document")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffffff, 1);
      g.fillRect(2, 2, 22, 28);
      g.lineStyle(1.5, 0x000000, 1);
      g.strokeRect(2, 2, 22, 28);
      // Red stamp
      g.fillStyle(0xef4444, 0.8);
      g.fillCircle(13, 16, 5);
      g.generateTexture("particle-document", 26, 32);
      g.destroy();
    }

    // 16. Street Lamp Additive Glow (64 x 64)
    if (!this.textures.exists("fx-glow-lamp")) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 32);
      grad.addColorStop(0, "rgba(254, 240, 138, 0.95)");
      grad.addColorStop(0.4, "rgba(251, 191, 36, 0.5)");
      grad.addColorStop(1, "rgba(251, 191, 36, 0.0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(32, 32, 32, 0, Math.PI * 2);
      ctx.fill();
      this.textures.addCanvas("fx-glow-lamp", canvas);
    }

    // 17. Glowing Night Moon (60 x 60)
    if (!this.textures.exists("fx-moon")) {
      const canvas = document.createElement("canvas");
      canvas.width = 60;
      canvas.height = 60;
      const ctx = canvas.getContext("2d")!;
      // Outer halo
      const grad = ctx.createRadialGradient(30, 30, 12, 30, 30, 30);
      grad.addColorStop(0, "rgba(224, 242, 254, 0.8)");
      grad.addColorStop(0.5, "rgba(56, 189, 248, 0.25)");
      grad.addColorStop(1, "rgba(56, 189, 248, 0.0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 60, 60);
      // Crescent Moon
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(30, 30, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(36, 26, 14, 0, Math.PI * 2);
      ctx.fill();
      this.textures.addCanvas("fx-moon", canvas);
    }

    // 18. Rain Drop Texture
    if (!this.textures.exists("fx-raindrop")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x7dd3fc, 0.85);
      g.fillRect(0, 0, 2, 18);
      g.generateTexture("fx-raindrop", 2, 18);
      g.destroy();
    }

    // 19. Road Puddle Texture (70 x 24)
    if (!this.textures.exists("fx-puddle")) {
      const canvas = document.createElement("canvas");
      canvas.width = 70;
      canvas.height = 24;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "rgba(14, 116, 144, 0.55)";
      ctx.beginPath();
      ctx.ellipse(35, 12, 32, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      this.textures.addCanvas("fx-puddle", canvas);
    }

    // 20. Water Splash Particle
    if (!this.textures.exists("fx-splash")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x38bdf8, 0.9);
      g.fillCircle(4, 4, 4);
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(3, 3, 2);
      g.generateTexture("fx-splash", 8, 8);
      g.destroy();
    }

    // 21. Soft Fog Cloud (256 x 96)
    if (!this.textures.exists("fx-fog")) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 96;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createLinearGradient(0, 48, 256, 48);
      grad.addColorStop(0, "rgba(241, 245, 249, 0)");
      grad.addColorStop(0.3, "rgba(241, 245, 249, 0.45)");
      grad.addColorStop(0.7, "rgba(241, 245, 249, 0.45)");
      grad.addColorStop(1, "rgba(241, 245, 249, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(128, 48, 120, 40, 0, 0, Math.PI * 2);
      ctx.fill();
      this.textures.addCanvas("fx-fog", canvas);
    }

    // 22. Stray Floating Slipper (36 x 20)
    if (!this.textures.exists("fx-floating-slipper")) {
      const canvas = document.createElement("canvas");
      canvas.width = 36;
      canvas.height = 20;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.ellipse(18, 10, 16, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(10, 8, 16, 4);
      this.textures.addCanvas("fx-floating-slipper", canvas);
    }

    // 23. Phone Flashlight Beam (240 x 100)
    if (!this.textures.exists("fx-flashlight")) {
      const canvas = document.createElement("canvas");
      canvas.width = 240;
      canvas.height = 100;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createLinearGradient(10, 50, 230, 50);
      grad.addColorStop(0, "rgba(224, 242, 254, 0.95)");
      grad.addColorStop(0.3, "rgba(186, 230, 253, 0.65)");
      grad.addColorStop(0.8, "rgba(125, 211, 252, 0.25)");
      grad.addColorStop(1, "rgba(125, 211, 252, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(10, 50);
      ctx.lineTo(235, 12);
      ctx.lineTo(235, 88);
      ctx.closePath();
      ctx.fill();
      this.textures.addCanvas("fx-flashlight", canvas);
    }

    // 24. Generator-Lit Shop Window (80 x 60)
    if (!this.textures.exists("fx-shop-generator")) {
      const canvas = document.createElement("canvas");
      canvas.width = 80;
      canvas.height = 60;
      const ctx = canvas.getContext("2d")!;
      // Warm amber glow window
      const grad = ctx.createRadialGradient(40, 30, 6, 40, 30, 40);
      grad.addColorStop(0, "rgba(254, 240, 138, 0.95)");
      grad.addColorStop(0.6, "rgba(245, 158, 11, 0.7)");
      grad.addColorStop(1, "rgba(217, 119, 6, 0.1)");
      ctx.fillStyle = grad;
      ctx.fillRect(4, 4, 72, 52);
      // Small generator box at corner
      ctx.fillStyle = "#334155";
      ctx.fillRect(8, 42, 18, 14);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(10, 44, 4, 4);
      ctx.strokeStyle = "#1e293b";
      ctx.strokeRect(4, 4, 72, 52);
      this.textures.addCanvas("fx-shop-generator", canvas);
    }

    // 25. Smog Light Halo (100 x 100)
    if (!this.textures.exists("fx-light-halo")) {
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createRadialGradient(50, 50, 8, 50, 50, 50);
      grad.addColorStop(0, "rgba(254, 240, 138, 0.75)");
      grad.addColorStop(0.35, "rgba(245, 158, 11, 0.35)");
      grad.addColorStop(0.7, "rgba(217, 119, 6, 0.12)");
      grad.addColorStop(1, "rgba(217, 119, 6, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(50, 50, 50, 0, Math.PI * 2);
      ctx.fill();
      this.textures.addCanvas("fx-light-halo", canvas);
    }

    // 26. Burning Tyre Strike Flame (70 x 60)
    if (!this.textures.exists("fx-burning-tyre")) {
      const canvas = document.createElement("canvas");
      canvas.width = 70;
      canvas.height = 60;
      const ctx = canvas.getContext("2d")!;
      // Black tyre
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.ellipse(35, 48, 28, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.ellipse(35, 48, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Outer orange flame
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(18, 48);
      ctx.quadraticCurveTo(24, 25, 30, 8);
      ctx.quadraticCurveTo(36, 22, 42, 14);
      ctx.quadraticCurveTo(46, 24, 52, 48);
      ctx.closePath();
      ctx.fill();
      // Inner yellow flame
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.moveTo(25, 48);
      ctx.quadraticCurveTo(32, 28, 35, 16);
      ctx.quadraticCurveTo(38, 28, 45, 48);
      ctx.closePath();
      ctx.fill();
      this.textures.addCanvas("fx-burning-tyre", canvas);
    }

    // 27. Slippery Banana Peel (40 x 30)
    if (!this.textures.exists("projectile-banana")) {
      const canvas = document.createElement("canvas");
      canvas.width = 40;
      canvas.height = 30;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#facc15";
      ctx.strokeStyle = "#a16207";
      ctx.lineWidth = 1.5;
      // Peel 1 left
      ctx.beginPath();
      ctx.moveTo(20, 15);
      ctx.quadraticCurveTo(8, 12, 4, 25);
      ctx.quadraticCurveTo(12, 22, 20, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Peel 2 right
      ctx.beginPath();
      ctx.moveTo(20, 15);
      ctx.quadraticCurveTo(32, 12, 36, 25);
      ctx.quadraticCurveTo(28, 22, 20, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Peel 3 top
      ctx.beginPath();
      ctx.moveTo(20, 15);
      ctx.quadraticCurveTo(24, 6, 20, 3);
      ctx.quadraticCurveTo(16, 6, 20, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Brown stem tip
      ctx.fillStyle = "#78350f";
      ctx.fillRect(18, 2, 4, 3);
      this.textures.addCanvas("projectile-banana", canvas);
    }

    // 28. Crushed Soda Can (36 x 22)
    if (!this.textures.exists("projectile-can")) {
      const canvas = document.createElement("canvas");
      canvas.width = 36;
      canvas.height = 22;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.ellipse(18, 11, 14, 8, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#991b1b";
      ctx.lineWidth = 2;
      ctx.stroke();
      // Silver rim & pull tab
      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.ellipse(6, 11, 3, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(8, 9, 4, 4);
      this.textures.addCanvas("projectile-can", canvas);
    }

    // 29. Cartoon Policeman / Havildar Mama (110 x 140)
    if (!this.textures.exists("fx-policeman")) {
      const canvas = document.createElement("canvas");
      canvas.width = 110;
      canvas.height = 140;
      const ctx = canvas.getContext("2d")!;
      // Khaki shirt torso
      ctx.fillStyle = "#ca8a04";
      ctx.fillRect(25, 60, 60, 60);
      ctx.strokeStyle = "#713f12";
      ctx.lineWidth = 3;
      ctx.strokeRect(25, 60, 60, 60);
      // Red epaulets
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(20, 60, 10, 8);
      ctx.fillRect(80, 60, 10, 8);
      // Round head
      ctx.fillStyle = "#fde047";
      ctx.beginPath();
      ctx.arc(55, 42, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Big comic eyes
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(47, 38, 6, 0, Math.PI * 2);
      ctx.arc(63, 38, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(48, 38, 2.5, 0, Math.PI * 2);
      ctx.arc(62, 38, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // Giant comic mustache
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.moveTo(35, 46);
      ctx.quadraticCurveTo(55, 40, 75, 46);
      ctx.quadraticCurveTo(55, 56, 35, 46);
      ctx.fill();
      // Whistle in mouth
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(52, 48, 14, 6);
      ctx.strokeRect(52, 48, 14, 6);
      // Khaki Police Cap
      ctx.fillStyle = "#a16207";
      ctx.beginPath();
      ctx.ellipse(55, 24, 25, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(32, 22, 46, 5);
      this.textures.addCanvas("fx-policeman", canvas);
    }

    // 30. Police Rubber Stamp (280 x 110)
    if (!this.textures.exists("fx-police-stamp")) {
      const canvas = document.createElement("canvas");
      canvas.width = 280;
      canvas.height = 110;
      const ctx = canvas.getContext("2d")!;
      ctx.translate(140, 55);
      ctx.rotate(-0.08);
      // Outer red box
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 5;
      ctx.strokeRect(-130, -45, 260, 90);
      // Inner red border
      ctx.lineWidth = 2;
      ctx.strokeRect(-124, -39, 248, 78);
      // Stencil Text
      ctx.fillStyle = "#dc2626";
      ctx.textAlign = "center";
      ctx.font = "bold 24px 'Luckiest Guy', Impact, sans-serif";
      ctx.fillText("থানায় চালান!", 0, -4);
      ctx.font = "bold 13px 'Luckiest Guy', Impact, sans-serif";
      ctx.fillText("TO THE POLICE STATION!", 0, 20);
      this.textures.addCanvas("fx-police-stamp", canvas);
    }

    // 12. Rig Torso
    if (!this.textures.exists("rig-torso")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(2, 2, 40, 52, 6);
      g.lineStyle(2, 0x000000, 1);
      g.strokeRoundedRect(2, 2, 40, 52, 6);
      g.generateTexture("rig-torso", 44, 56);
      g.destroy();
    }

    // 13. Rig Upper Limb (Arm / Thigh)
    if (!this.textures.exists("rig-limb-upper")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(2, 2, 12, 26, 5);
      g.lineStyle(2, 0x000000, 1);
      g.strokeRoundedRect(2, 2, 12, 26, 5);
      g.generateTexture("rig-limb-upper", 16, 30);
      g.destroy();
    }

    // 14. Rig Lower Limb (Forearm / Shin)
    if (!this.textures.exists("rig-limb-lower")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(2, 2, 10, 24, 4);
      g.lineStyle(2, 0x000000, 1);
      g.strokeRoundedRect(2, 2, 10, 24, 4);
      g.generateTexture("rig-limb-lower", 14, 28);
      g.destroy();
    }

    // 15. Rig Hand
    if (!this.textures.exists("rig-hand")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xfbcfe8, 1);
      g.fillCircle(7, 7, 6);
      g.lineStyle(2, 0x000000, 1);
      g.strokeCircle(7, 7, 6);
      g.generateTexture("rig-hand", 14, 14);
      g.destroy();
    }

    // 16. Rig Foot
    if (!this.textures.exists("rig-foot")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(2, 2, 24, 10, 4);
      g.lineStyle(2, 0x000000, 1);
      g.strokeRoundedRect(2, 2, 24, 10, 4);
      g.generateTexture("rig-foot", 28, 14);
      g.destroy();
    }

    // 17. Rig Ground Shadow
    if (!this.textures.exists("rig-shadow")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x000000, 0.5);
      g.fillEllipse(36, 12, 34, 10);
      g.generateTexture("rig-shadow", 72, 24);
      g.destroy();
    }

    if (!this.textures.exists("rig-shadow-soft")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x000000, 0.4);
      g.fillEllipse(40, 14, 38, 12);
      g.fillStyle(0x000000, 0.7);
      g.fillEllipse(40, 14, 26, 8);
      g.generateTexture("rig-shadow-soft", 80, 28);
      g.destroy();
    }

    // 17b. Rig Neck
    if (!this.textures.exists("rig-neck")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xd97706, 1);
      g.fillRect(2, 2, 16, 12);
      g.lineStyle(2, 0x000000, 1);
      g.strokeRect(2, 2, 16, 12);
      g.generateTexture("rig-neck", 20, 16);
      g.destroy();
    }

    // 18. Rig Shock Expression Overlay
    if (!this.textures.exists("rig-expression-shock")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Sweat drops
      g.fillStyle(0x38bdf8, 1);
      g.fillCircle(12, 14, 6);
      g.fillCircle(58, 16, 7);
      // Comic exclamation marks
      g.lineStyle(3, 0xef4444, 1);
      g.lineBetween(32, 2, 32, 10);
      g.lineBetween(38, 2, 38, 10);
      g.generateTexture("rig-expression-shock", 70, 70);
      g.destroy();
    }

    // 19. Pickup Biriyani Box
    if (!this.textures.exists("pickup-biriyani")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xf59e0b, 1);
      g.fillRoundedRect(4, 4, 36, 26, 4);
      g.lineStyle(2, 0x000000, 1);
      g.strokeRoundedRect(4, 4, 36, 26, 4);
      g.fillStyle(0xd97706, 1);
      g.fillCircle(22, 16, 6); // Chicken roast piece
      g.generateTexture("pickup-biriyani", 44, 34);
      g.destroy();
    }

    // 20. Pickup Tong er Cha
    if (!this.textures.exists("pickup-cha")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xd97706, 1);
      g.fillRoundedRect(6, 8, 22, 24, 4);
      g.lineStyle(2, 0x000000, 1);
      g.strokeRoundedRect(6, 8, 22, 24, 4);
      g.fillStyle(0xfde68a, 1);
      g.fillRect(8, 10, 18, 6); // Hot milk tea
      g.generateTexture("pickup-cha", 34, 36);
      g.destroy();
    }

    // 21. Pickup Taka Bag
    if (!this.textures.exists("pickup-taka-bag")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x059669, 1);
      g.fillCircle(18, 22, 14);
      g.fillRect(12, 6, 12, 10);
      g.lineStyle(2, 0x000000, 1);
      g.strokeCircle(18, 22, 14);
      g.fillStyle(0xfef08a, 1);
      g.fillRect(16, 14, 4, 14); // ৳ sign
      g.generateTexture("pickup-taka-bag", 36, 38);
      g.destroy();
    }

    // 22. Pickup Helmet
    if (!this.textures.exists("pickup-helmet")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xdc2626, 1);
      g.fillCircle(18, 18, 14);
      g.lineStyle(2, 0x000000, 1);
      g.strokeCircle(18, 18, 14);
      g.fillStyle(0x0f172a, 1);
      g.fillRect(18, 14, 12, 8); // Visor
      g.generateTexture("pickup-helmet", 36, 36);
      g.destroy();
    }

    // 23. Normal Hero Chaser Face (The runner who hits)
    if (!this.textures.exists("hero-face")) {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d")!;

      // Normal Bengali skin tone
      ctx.beginPath();
      ctx.arc(64, 64, 56, 0, Math.PI * 2);
      ctx.fillStyle = "#fed7aa";
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#000000";
      ctx.stroke();

      // Stylized modern black hair
      ctx.beginPath();
      ctx.arc(64, 50, 56, Math.PI * 1.1, Math.PI * 1.9);
      ctx.fillStyle = "#0f172a";
      ctx.fill();

      // Determined comic eyes
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(46, 62, 10, 8, 0, 0, Math.PI * 2);
      ctx.ellipse(82, 62, 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(48, 62, 5, 0, Math.PI * 2);
      ctx.arc(84, 62, 5, 0, Math.PI * 2);
      ctx.fill();

      // Confident energetic smirk
      ctx.beginPath();
      ctx.arc(64, 82, 16, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#000000";
      ctx.stroke();

      this.textures.addCanvas("hero-face", canvas);
    }

    // 24. Street Crowd Obstacle (People gathering in lane)
    if (!this.textures.exists("obstacle-crowd")) {
      const canvas = document.createElement("canvas");
      canvas.width = 120;
      canvas.height = 90;
      const ctx = canvas.getContext("2d")!;

      // Crowd silhouettes (Colorful Bangladeshi shirts & panjabis)
      const colors = ["#2563eb", "#dc2626", "#059669"];
      [24, 60, 96].forEach((cx, idx) => {
        // Head
        ctx.beginPath();
        ctx.arc(cx, 32, 12, 0, Math.PI * 2);
        ctx.fillStyle = "#fcd34d";
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Body
        ctx.fillStyle = colors[idx];
        ctx.fillRect(cx - 14, 44, 28, 42);
        ctx.strokeRect(cx - 14, 44, 28, 42);
      });

      // Warning Comic Speech Bubble
      ctx.fillStyle = "#fef08a";
      ctx.fillRect(10, 4, 100, 18);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 4, 100, 18);

      ctx.fillStyle = "#000000";
      ctx.font = "bold 9px 'Hind Siliguri', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("ভিড়! রাস্তা ছাড়েন!", 60, 16);

      this.textures.addCanvas("obstacle-crowd", canvas);
    }

    // 25. Authentic Dhaka Rickshaw Obstacle
    if (!this.textures.exists("obstacle-rickshaw")) {
      const canvas = document.createElement("canvas");
      canvas.width = 110;
      canvas.height = 80;
      const ctx = canvas.getContext("2d")!;

      // Rickshaw hood (Vibrant yellow with red-green truck art floral)
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(45, 35, 28, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Hood floral stripes
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(25, 30, 40, 6);
      ctx.fillStyle = "#059669";
      ctx.fillRect(25, 22, 40, 5);

      // Frame & Seat
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(18, 35, 55, 14);
      ctx.strokeRect(18, 35, 55, 14);

      // Wheels
      [30, 75].forEach((wx) => {
        ctx.beginPath();
        ctx.arc(wx, 62, 14, 0, Math.PI * 2);
        ctx.fillStyle = "#f8fafc";
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#000000";
        ctx.stroke();

        // Spokes
        ctx.beginPath();
        ctx.moveTo(wx - 12, 62);
        ctx.lineTo(wx + 12, 62);
        ctx.moveTo(wx, 50);
        ctx.lineTo(wx, 74);
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      this.textures.addCanvas("obstacle-rickshaw", canvas);
    }

    // 26. Scenario Maps: distinct sky, skyline, buildings and road composition
    if (!this.textures.exists("bg-sky-mirpur")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillGradientStyle(0x1e1b4b, 0x311042, 0xd97706, 0xf59e0b, 1);
      g.fillRect(0, 0, BALANCE.LOGICAL_WIDTH, 500);
      g.generateTexture("bg-sky-mirpur", BALANCE.LOGICAL_WIDTH, 500);
      g.destroy();
    }

    if (!this.textures.exists("bg-sky-farmgate")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillGradientStyle(0x451a03, 0x78350f, 0xd97706, 0xfde047, 1);
      g.fillRect(0, 0, BALANCE.LOGICAL_WIDTH, 500);
      g.generateTexture("bg-sky-farmgate", BALANCE.LOGICAL_WIDTH, 500);
      g.destroy();
    }

    if (!this.textures.exists("bg-sky-newmarket")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillGradientStyle(0x3b0764, 0x581c87, 0xc026d3, 0xf43f5e, 1);
      g.fillRect(0, 0, BALANCE.LOGICAL_WIDTH, 500);
      g.generateTexture("bg-sky-newmarket", BALANCE.LOGICAL_WIDTH, 500);
      g.destroy();
    }

    this.generateMapEnvironmentTextures();

    // 27. Comic Face Reaction Props (Dizzy Stars, Band-Aid, Anime Tears, Shocked Eyes)
    if (!this.textures.exists("prop-dizzy-stars")) {
      const canvas = document.createElement("canvas");
      canvas.width = 80;
      canvas.height = 40;
      const ctx = canvas.getContext("2d")!;

      // 3 golden cartoon stars on an elliptical path
      const starPositions = [
        { x: 16, y: 22, r: 8, col: "#facc15" },
        { x: 40, y: 12, r: 11, col: "#fef08a" },
        { x: 64, y: 22, r: 8, col: "#facc15" },
      ];

      starPositions.forEach((s) => {
        ctx.fillStyle = s.col;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const px = s.x + Math.cos(angle) * s.r;
          const py = s.y + Math.sin(angle) * s.r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Sparkle dots
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(28, 28, 3, 0, Math.PI * 2);
      ctx.arc(52, 28, 3, 0, Math.PI * 2);
      ctx.fill();

      this.textures.addCanvas("prop-dizzy-stars", canvas);
    }

    if (!this.textures.exists("prop-band-aid")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 48;
      const ctx = canvas.getContext("2d")!;

      // Cross band-aid (medical plaster)
      ctx.fillStyle = "#fed7aa";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;

      // Diagonal strip 1
      ctx.save();
      ctx.translate(24, 24);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-18, -6, 36, 12);
      ctx.strokeRect(-18, -6, 36, 12);

      // Diagonal strip 2
      ctx.rotate(Math.PI / 2);
      ctx.fillRect(-18, -6, 36, 12);
      ctx.strokeRect(-18, -6, 36, 12);
      ctx.restore();

      // Plaster dots
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.arc(24, 24, 3, 0, Math.PI * 2);
      ctx.fill();

      this.textures.addCanvas("prop-band-aid", canvas);
    }

    if (!this.textures.exists("prop-crying-tears")) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;

      // Two anime crying tear waterfalls
      [14, 50].forEach((tx) => {
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.moveTo(tx - 6, 8);
        ctx.bezierCurveTo(tx - 12, 24, tx - 10, 48, tx, 58);
        ctx.bezierCurveTo(tx + 10, 48, tx + 12, 24, tx + 6, 8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 2;
        ctx.stroke();

        // White highlight
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(tx - 2, 28, 3, 0, Math.PI * 2);
        ctx.arc(tx - 1, 44, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      this.textures.addCanvas("prop-crying-tears", canvas);
    }

    if (!this.textures.exists("prop-shocked-eyes")) {
      const canvas = document.createElement("canvas");
      canvas.width = 72;
      canvas.height = 36;
      const ctx = canvas.getContext("2d")!;

      // Huge cartoon popped-out eyes
      [20, 52].forEach((ex) => {
        ctx.beginPath();
        ctx.arc(ex, 18, 15, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Spiral pupil
        ctx.beginPath();
        ctx.arc(ex, 18, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#dc2626";
        ctx.fill();
      });

      this.textures.addCanvas("prop-shocked-eyes", canvas);
    }

    // 28. Monsoon Waterlogging & Pickups
    if (!this.textures.exists("fx-water-layer")) {
      const canvas = document.createElement("canvas");
      canvas.width = BALANCE.LOGICAL_WIDTH;
      canvas.height = 200;
      const ctx = canvas.getContext("2d")!;

      // Translucent Dhaka rainwater flood
      ctx.fillStyle = "rgba(14, 165, 233, 0.45)";
      ctx.fillRect(0, 0, BALANCE.LOGICAL_WIDTH, 200);

      // Wavy surface ripples
      ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
      ctx.lineWidth = 3;
      for (let y = 10; y < 190; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= BALANCE.LOGICAL_WIDTH; x += 40) {
          ctx.lineTo(x, y + Math.sin(x * 0.08) * 4);
        }
        ctx.stroke();
      }

      this.textures.addCanvas("fx-water-layer", canvas);
    }

    if (!this.textures.exists("prop-paper-boat")) {
      const canvas = document.createElement("canvas");
      canvas.width = 44;
      canvas.height = 30;
      const ctx = canvas.getContext("2d")!;

      // Origami Paper Boat (কাগজের নৌকা)
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(4, 20);
      ctx.lineTo(40, 20);
      ctx.lineTo(34, 28);
      ctx.lineTo(10, 28);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Folded sail
      ctx.beginPath();
      ctx.moveTo(22, 4);
      ctx.lineTo(34, 20);
      ctx.lineTo(10, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Red mini flag on top
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(22, 4);
      ctx.lineTo(30, 8);
      ctx.lineTo(22, 12);
      ctx.closePath();
      ctx.fill();

      this.textures.addCanvas("prop-paper-boat", canvas);
    }

    // 29. Pickups: Fresh Daab & N95 Mask
    if (!this.textures.exists("pickup-daab")) {
      const canvas = document.createElement("canvas");
      canvas.width = 46;
      canvas.height = 46;
      const ctx = canvas.getContext("2d")!;

      // Green Coconut (তাজা ডাব)
      ctx.beginPath();
      ctx.arc(23, 25, 18, 0, Math.PI * 2);
      ctx.fillStyle = "#15803d";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#000000";
      ctx.stroke();

      // Coconut crown cut
      ctx.fillStyle = "#86efac";
      ctx.beginPath();
      ctx.ellipse(23, 14, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Drinking straw (Red & white stripe)
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(23, 14);
      ctx.lineTo(34, 4);
      ctx.stroke();

      this.textures.addCanvas("pickup-daab", canvas);
    }

    if (!this.textures.exists("pickup-mask")) {
      const canvas = document.createElement("canvas");
      canvas.width = 44;
      canvas.height = 36;
      const ctx = canvas.getContext("2d")!;

      // N95 Face Mask (মাস্ক)
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.moveTo(8, 16);
      ctx.lineTo(22, 6);
      ctx.lineTo(36, 16);
      ctx.lineTo(32, 28);
      ctx.lineTo(12, 28);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#000000";
      ctx.stroke();

      // Breath valve (Cyan dot)
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.arc(22, 18, 4, 0, Math.PI * 2);
      ctx.fill();

      // Elastic ear loops
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(8, 16);
      ctx.bezierCurveTo(2, 22, 2, 26, 12, 28);
      ctx.moveTo(36, 16);
      ctx.bezierCurveTo(42, 22, 42, 26, 32, 28);
      ctx.stroke();

      this.textures.addCanvas("pickup-mask", canvas);
    }

    // 30. Obstacle: Mirpur Construction Pothole (গর্ত ও বাঁশের ব্যারিকেড)
    if (!this.textures.exists("obstacle-pothole")) {
      const canvas = document.createElement("canvas");
      canvas.width = 120;
      canvas.height = 80;
      const ctx = canvas.getContext("2d")!;

      // Dark hole in road
      ctx.fillStyle = "#020617";
      ctx.beginPath();
      ctx.ellipse(60, 55, 48, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#451a03";
      ctx.stroke();

      // Dug-up dirt mounds around hole
      ctx.fillStyle = "#78350f";
      ctx.beginPath();
      ctx.arc(30, 48, 14, 0, Math.PI * 2);
      ctx.arc(90, 48, 14, 0, Math.PI * 2);
      ctx.fill();

      // Red-white caution banner on bamboo stakes
      ctx.fillStyle = "#fef08a";
      ctx.fillRect(20, 10, 80, 22);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(20, 10, 80, 22);

      // Warning text
      ctx.fillStyle = "#dc2626";
      ctx.font = "bold 9px 'Hind Siliguri', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("সাবধান! কাজ চলছে!", 60, 24);

      // Bamboo legs
      ctx.strokeStyle = "#ca8a04";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(28, 32);
      ctx.lineTo(28, 55);
      ctx.moveTo(92, 32);
      ctx.lineTo(92, 55);
      ctx.stroke();

      this.textures.addCanvas("obstacle-pothole", canvas);
    }

    // 31. Archetype Procedural Fallback Textures (Phone Snatcher reference)
    if (!this.textures.exists("snatcher-torso")) {
      const canvas = document.createElement("canvas");
      canvas.width = 56;
      canvas.height = 68;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.roundRect(4, 4, 48, 60, [8, 8, 4, 4]);
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = "#000000";
      ctx.stroke();
      // Pouch
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(12, 38, 32, 20);
      ctx.strokeRect(12, 38, 32, 20);
      // Zipper & drawstrings
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(28, 8);
      ctx.lineTo(28, 64);
      ctx.stroke();
      this.textures.addCanvas("snatcher-torso", canvas);
    }

    if (!this.textures.exists("snatcher-arm-upper")) {
      const canvas = document.createElement("canvas");
      canvas.width = 24;
      canvas.height = 38;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.roundRect(4, 4, 16, 30, 6);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#000000";
      ctx.stroke();
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(8, 8);
      ctx.lineTo(8, 32);
      ctx.stroke();
      this.textures.addCanvas("snatcher-arm-upper", canvas);
    }

    if (!this.textures.exists("snatcher-arm-lower")) {
      const canvas = document.createElement("canvas");
      canvas.width = 22;
      canvas.height = 36;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.roundRect(4, 4, 14, 28, 5);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#000000";
      ctx.stroke();
      // Wrist cuff
      ctx.fillStyle = "#020617";
      ctx.fillRect(5, 26, 12, 6);
      ctx.strokeRect(5, 26, 12, 6);
      this.textures.addCanvas("snatcher-arm-lower", canvas);
    }

    if (!this.textures.exists("snatcher-hand")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d")!;
      // Glowing Phone in hand
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(12, 2, 16, 26);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.strokeRect(12, 2, 16, 26);
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(14, 5, 12, 18);
      // Hand
      ctx.fillStyle = "#fbcfe8";
      ctx.beginPath();
      ctx.arc(10, 18, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.stroke();
      this.textures.addCanvas("snatcher-hand", canvas);
    }

    if (!this.textures.exists("snatcher-thigh")) {
      const canvas = document.createElement("canvas");
      canvas.width = 26;
      canvas.height = 42;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.roundRect(4, 4, 18, 34, 6);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#000000";
      ctx.stroke();
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(8, 6);
      ctx.lineTo(8, 36);
      ctx.stroke();
      this.textures.addCanvas("snatcher-thigh", canvas);
    }

    if (!this.textures.exists("snatcher-shin")) {
      const canvas = document.createElement("canvas");
      canvas.width = 24;
      canvas.height = 40;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.roundRect(4, 4, 16, 32, 5);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#000000";
      ctx.stroke();
      ctx.fillStyle = "#020617";
      ctx.fillRect(6, 32, 12, 6);
      ctx.strokeRect(6, 32, 12, 6);
      this.textures.addCanvas("snatcher-shin", canvas);
    }

    if (!this.textures.exists("snatcher-foot")) {
      const canvas = document.createElement("canvas");
      canvas.width = 38;
      canvas.height = 22;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.roundRect(4, 4, 30, 12, [4, 6, 2, 2]);
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#000000";
      ctx.stroke();
      // White sole
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(2, 14, 34, 6);
      ctx.strokeRect(2, 14, 34, 6);
      this.textures.addCanvas("snatcher-foot", canvas);
    }

    if (!this.textures.exists("snatcher-hood-back")) {
      const canvas = document.createElement("canvas");
      canvas.width = 86;
      canvas.height = 86;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#090d16";
      ctx.beginPath();
      ctx.arc(43, 43, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#000000";
      ctx.stroke();
      this.textures.addCanvas("snatcher-hood-back", canvas);
    }

    if (!this.textures.exists("snatcher-hood-front")) {
      const canvas = document.createElement("canvas");
      canvas.width = 88;
      canvas.height = 88;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.arc(44, 44, 42, 0, Math.PI * 2);
      ctx.fill();
      // Cutout face hole
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(44, 48, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = "#000000";
      ctx.stroke();
      this.textures.addCanvas("snatcher-hood-front", canvas);
    }

    if (!this.textures.exists("snatcher-mask-upper")) {
      const canvas = document.createElement("canvas");
      canvas.width = 74;
      canvas.height = 34;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.roundRect(6, 6, 62, 22, [6, 6, 2, 2]);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#000000";
      ctx.stroke();
      this.textures.addCanvas("snatcher-mask-upper", canvas);
    }

    if (!this.textures.exists("snatcher-mask-lower")) {
      const canvas = document.createElement("canvas");
      canvas.width = 74;
      canvas.height = 44;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.roundRect(6, 8, 62, 30, [4, 4, 12, 12]);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#000000";
      ctx.stroke();
      // Ventilation dots
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.arc(31, 24, 2, 0, Math.PI * 2);
      ctx.arc(37, 24, 2, 0, Math.PI * 2);
      ctx.arc(43, 24, 2, 0, Math.PI * 2);
      ctx.fill();
      this.textures.addCanvas("snatcher-mask-lower", canvas);
    }

    if (!this.textures.exists("snatcher-prop-phone")) {
      const canvas = document.createElement("canvas");
      canvas.width = 24;
      canvas.height = 38;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(2, 2, 20, 34);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, 20, 34);
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(4, 5, 16, 26);
      this.textures.addCanvas("snatcher-prop-phone", canvas);
    }

    // Archetype props fallbacks
    if (!this.textures.exists("pickpocket-prop-wallet")) {
      const canvas = document.createElement("canvas");
      canvas.width = 36;
      canvas.height = 30;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#78350f";
      ctx.fillRect(4, 8, 28, 20);
      ctx.fillStyle = "#15803d";
      ctx.fillRect(8, 2, 20, 6);
      this.textures.addCanvas("pickpocket-prop-wallet", canvas);
    }

    if (!this.textures.exists("cableChor-prop-cutter")) {
      const canvas = document.createElement("canvas");
      canvas.width = 34;
      canvas.height = 46;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(8, 16, 18, 26);
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(10, 4, 14, 12);
      this.textures.addCanvas("cableChor-prop-cutter", canvas);
    }

    if (!this.textures.exists("cableChor-prop-wire-coil")) {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 48;
      const ctx = canvas.getContext("2d")!;
      ctx.strokeStyle = "#b45309";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(24, 24, 18, 0, Math.PI * 2);
      ctx.stroke();
      this.textures.addCanvas("cableChor-prop-wire-coil", canvas);
    }

    if (!this.textures.exists("manholeChor-prop-manhole-cover")) {
      const canvas = document.createElement("canvas");
      canvas.width = 54;
      canvas.height = 54;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.arc(27, 27, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.stroke();
      this.textures.addCanvas("manholeChor-prop-manhole-cover", canvas);
    }

    if (!this.textures.exists("eidMarketChor-prop-shopping-bags")) {
      const canvas = document.createElement("canvas");
      canvas.width = 42;
      canvas.height = 46;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#e11d48";
      ctx.fillRect(4, 14, 24, 28);
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(16, 18, 22, 26);
      this.textures.addCanvas("eidMarketChor-prop-shopping-bags", canvas);
    }

    if (!this.textures.exists("chickenChor-prop-chicken")) {
      const canvas = document.createElement("canvas");
      canvas.width = 46;
      canvas.height = 44;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ea580c";
      ctx.beginPath();
      ctx.ellipse(22, 24, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.arc(34, 14, 8, 0, Math.PI * 2);
      ctx.fill();
      this.textures.addCanvas("chickenChor-prop-chicken", canvas);
    }

    if (!this.textures.exists("chorSardar-prop-briefcase")) {
      const canvas = document.createElement("canvas");
      canvas.width = 44;
      canvas.height = 34;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#18181b";
      ctx.fillRect(4, 8, 36, 24);
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(12, 14, 4, 6);
      ctx.fillRect(28, 14, 4, 6);
      this.textures.addCanvas("chorSardar-prop-briefcase", canvas);
    }

    // Street Kit-bash props and vehicles (P2-06)
    this.generateStreetKitBashTextures();
  }

  private generateStreetKitBashTextures() {
    // 1. Elevated Metro Rail Track (1280 x 50)
    if (!this.textures.exists("prop-metro-track")) {
      const canvas = document.createElement("canvas");
      canvas.width = BALANCE.LOGICAL_WIDTH;
      canvas.height = 50;
      const ctx = canvas.getContext("2d")!;
      // Rail horizontal beam
      ctx.fillStyle = "#64748b";
      ctx.fillRect(0, 10, BALANCE.LOGICAL_WIDTH, 18);
      ctx.fillStyle = "#475569";
      ctx.fillRect(0, 28, BALANCE.LOGICAL_WIDTH, 6);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 10, BALANCE.LOGICAL_WIDTH, 24);
      // Concrete pillars every 160 px
      for (let x = 40; x < BALANCE.LOGICAL_WIDTH; x += 160) {
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(x, 28, 28, 22);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, 28, 28, 22);
      }
      this.textures.addCanvas("prop-metro-track", canvas);
    }

    // 2. Metro Train MRT-6 (320 x 42)
    if (!this.textures.exists("prop-metro-train")) {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 42;
      const ctx = canvas.getContext("2d")!;
      // Streamlined body (White / Silver)
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.roundRect(4, 4, 312, 34, [16, 6, 6, 16]);
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      // Green and red stripe (Bangladesh flag / MRT colors)
      ctx.fillStyle = "#15803d";
      ctx.fillRect(10, 20, 302, 6);
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(10, 26, 302, 3);
      // Tinted passenger windows
      ctx.fillStyle = "#0284c7";
      for (let wx = 50; wx < 300; wx += 32) {
        ctx.fillRect(wx, 8, 24, 10);
      }
      // Cockpit windshield
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.roundRect(14, 8, 24, 10, [10, 2, 2, 2]);
      ctx.fill();
      this.textures.addCanvas("prop-metro-train", canvas);
    }

    // 3. Tong Tea Stall (110 x 70)
    if (!this.textures.exists("prop-tea-stall")) {
      const canvas = document.createElement("canvas");
      canvas.width = 110;
      canvas.height = 70;
      const ctx = canvas.getContext("2d")!;
      // Red tarpaulin awning
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.moveTo(10, 10);
      ctx.lineTo(100, 10);
      ctx.lineTo(105, 26);
      ctx.lineTo(5, 26);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.stroke();
      // Counter table
      ctx.fillStyle = "#78350f";
      ctx.fillRect(15, 26, 80, 34);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.strokeRect(15, 26, 80, 34);
      // Big yellow metal tea kettle
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(40, 22, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Red & blue plastic stools
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(5, 48, 14, 18);
      ctx.strokeRect(5, 48, 14, 18);
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(92, 48, 14, 18);
      ctx.strokeRect(92, 48, 14, 18);
      // Bangla sign
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px 'Hind Siliguri', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("রং চা ৫৳", 55, 44);
      this.textures.addCanvas("prop-tea-stall", canvas);
    }

    // 4. Jhalmuri Hawker Cart (90 x 65)
    if (!this.textures.exists("prop-hawker-cart")) {
      const canvas = document.createElement("canvas");
      canvas.width = 90;
      canvas.height = 65;
      const ctx = canvas.getContext("2d")!;
      // Colorful Dhaka umbrella
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(45, 18, 30, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.stroke();
      // Umbrella pole
      ctx.fillStyle = "#000000";
      ctx.fillRect(43, 18, 4, 30);
      // Wooden cart box
      ctx.fillStyle = "#a16207";
      ctx.fillRect(12, 34, 66, 18);
      ctx.strokeRect(12, 34, 66, 18);
      // Wheels
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(26, 52, 10, 0, Math.PI * 2);
      ctx.arc(64, 52, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      this.textures.addCanvas("prop-hawker-cart", canvas);
    }

    // 5. Dhaka Footbridge (220 x 130)
    if (!this.textures.exists("prop-footbridge")) {
      const canvas = document.createElement("canvas");
      canvas.width = 220;
      canvas.height = 130;
      const ctx = canvas.getContext("2d")!;
      // Green steel bridge overhead arch
      ctx.fillStyle = "#047857";
      ctx.fillRect(20, 20, 180, 26);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 20, 180, 26);
      // Support pillars / stairs
      ctx.fillStyle = "#065f46";
      ctx.fillRect(20, 46, 24, 76);
      ctx.strokeRect(20, 46, 24, 76);
      ctx.fillRect(176, 46, 24, 76);
      ctx.strokeRect(176, 46, 24, 76);
      // Civic awareness banner
      ctx.fillStyle = "#facc15";
      ctx.fillRect(48, 24, 124, 18);
      ctx.strokeRect(48, 24, 124, 18);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 9px 'Hind Siliguri', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("পাদচারী সেতু ব্যবহার করুন", 110, 36);
      this.textures.addCanvas("prop-footbridge", canvas);
    }

    // 6. Deshi Street Dog (50 x 30)
    if (!this.textures.exists("prop-street-dog")) {
      const canvas = document.createElement("canvas");
      canvas.width = 50;
      canvas.height = 30;
      const ctx = canvas.getContext("2d")!;
      // Curled body
      ctx.fillStyle = "#b45309";
      ctx.beginPath();
      ctx.ellipse(24, 18, 16, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.stroke();
      // Head
      ctx.beginPath();
      ctx.arc(36, 14, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Snout & ear
      ctx.fillStyle = "#78350f";
      ctx.beginPath();
      ctx.arc(41, 16, 4, 0, Math.PI * 2);
      ctx.fill();
      this.textures.addCanvas("prop-street-dog", canvas);
    }

    // 7. Iconic Dhaka Rickshaw (90 x 65)
    if (!this.textures.exists("vehicle-rickshaw")) {
      const canvas = document.createElement("canvas");
      canvas.width = 90;
      canvas.height = 65;
      const ctx = canvas.getContext("2d")!;
      // Passenger Hood (Blue / Yellow folds)
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.roundRect(14, 10, 44, 28, [18, 18, 4, 4]);
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      // Painted rickshaw art backboard (Red with floral pattern)
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(8, 26, 12, 18);
      ctx.strokeRect(8, 26, 12, 18);
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(14, 35, 4, 0, Math.PI * 2);
      ctx.fill();
      // Frame & handlebar
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(40, 36);
      ctx.lineTo(72, 36);
      ctx.lineTo(78, 22);
      ctx.stroke();
      // Two big wheels
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(26, 48, 13, 0, Math.PI * 2);
      ctx.arc(74, 48, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Spokes
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(26, 35); ctx.lineTo(26, 61);
      ctx.moveTo(13, 48); ctx.lineTo(39, 48);
      ctx.moveTo(74, 35); ctx.lineTo(74, 61);
      ctx.moveTo(61, 48); ctx.lineTo(87, 48);
      ctx.stroke();
      this.textures.addCanvas("vehicle-rickshaw", canvas);
    }

    // 8. Green CNG Auto (95 x 60)
    if (!this.textures.exists("vehicle-cng")) {
      const canvas = document.createElement("canvas");
      canvas.width = 95;
      canvas.height = 60;
      const ctx = canvas.getContext("2d")!;
      // Green body
      ctx.fillStyle = "#15803d";
      ctx.beginPath();
      ctx.roundRect(8, 8, 78, 38, [12, 12, 6, 6]);
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      // Yellow rooftop canvas
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.roundRect(14, 4, 66, 12, [6, 6, 2, 2]);
      ctx.fill();
      ctx.stroke();
      // Metal wire grill mesh on sides (Classic Dhaka CNG)
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.5;
      for (let gx = 22; gx < 65; gx += 8) {
        ctx.beginPath();
        ctx.moveTo(gx, 18);
        ctx.lineTo(gx, 34);
        ctx.stroke();
      }
      // Wheels
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(28, 48, 10, 0, Math.PI * 2);
      ctx.arc(70, 48, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      this.textures.addCanvas("vehicle-cng", canvas);
    }

    // 9. Murir Tin Local Bus (180 x 95)
    if (!this.textures.exists("vehicle-local-bus")) {
      const canvas = document.createElement("canvas");
      canvas.width = 180;
      canvas.height = 95;
      const ctx = canvas.getContext("2d")!;
      // Dented Bus Body (Blue / Yellow / Red livery)
      ctx.fillStyle = "#2563eb";
      ctx.beginPath();
      ctx.roundRect(8, 8, 164, 62, [14, 6, 4, 8]);
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.stroke();
      // Lower red stripe
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(8, 50, 164, 12);
      ctx.strokeRect(8, 50, 164, 12);
      // Windows with passenger silhouettes
      ctx.fillStyle = "#e0f2fe";
      for (let wx = 20; wx < 155; wx += 24) {
        ctx.fillRect(wx, 16, 18, 18);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(wx, 16, 18, 18);
        // Passenger head silhouette
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(wx + 9, 28, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#e0f2fe";
      }
      // Humorous Bumper Slogan
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 8px 'Hind Siliguri', sans-serif";
      ctx.fillText("দূরত্ব বজায় রাখুন", 90, 60);
      // Heavy wheels
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(42, 74, 14, 0, Math.PI * 2);
      ctx.arc(136, 74, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      this.textures.addCanvas("vehicle-local-bus", canvas);
    }

    // 10. Horn Please Highway Truck (190 x 100)
    if (!this.textures.exists("vehicle-truck")) {
      const canvas = document.createElement("canvas");
      canvas.width = 190;
      canvas.height = 100;
      const ctx = canvas.getContext("2d")!;
      // Cabin (Red)
      ctx.fillStyle = "#b91c1c";
      ctx.beginPath();
      ctx.roundRect(110, 16, 68, 56, [14, 4, 4, 4]);
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.stroke();
      // Wooden cargo bed (Yellow & green planks)
      ctx.fillStyle = "#eab308";
      ctx.fillRect(8, 20, 102, 52);
      ctx.strokeRect(8, 20, 102, 52);
      // Painted text
      ctx.fillStyle = "#b91c1c";
      ctx.font = "bold 10px 'Luckiest Guy', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("HORN PLEASE", 58, 48);
      // Large truck wheels
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(40, 78, 16, 0, Math.PI * 2);
      ctx.arc(80, 78, 16, 0, Math.PI * 2);
      ctx.arc(150, 78, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      this.textures.addCanvas("vehicle-truck", canvas);
    }

    // 11. Cartoon Dhaka Crow (32 x 28)
    if (!this.textures.exists("anim-crow")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 28;
      const ctx = canvas.getContext("2d")!;
      // Black body
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.ellipse(14, 16, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Head
      ctx.beginPath();
      ctx.arc(22, 10, 6, 0, Math.PI * 2);
      ctx.fill();
      // Eye
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(24, 9, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.fillRect(24, 9, 1, 1);
      // Yellow beak
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.moveTo(27, 9);
      ctx.lineTo(32, 11);
      ctx.lineTo(27, 13);
      ctx.closePath();
      ctx.fill();
      this.textures.addCanvas("anim-crow", canvas);
    }
  }

  private generateMapEnvironmentTextures() {
    const profiles = [
      {
        id: "mirpur",
        colors: ["#1e293b", "#334155", "#475569", "#1e3a5f"],
        skyline: "#0f2742",
        road: { curb: "#059669", stripe: "#facc15", detail: "#b45309" },
      },
      {
        id: "farmgate",
        colors: ["#292524", "#44403c", "#57534e", "#312e81"],
        skyline: "#292524",
        road: { curb: "#dc2626", stripe: "#f8fafc", detail: "#f59e0b" },
      },
      {
        id: "newmarket",
        colors: ["#3f1d38", "#581c87", "#7e22ce", "#172554"],
        skyline: "#2e1065",
        road: { curb: "#db2777", stripe: "#facc15", detail: "#ea580c" },
      },
    ] as const;

    for (const profile of profiles) {
      const map = MAP_SCENARIOS.find((item) => item.id === profile.id);
      if (!map) continue;

      if (!this.textures.exists(map.farKey)) {
        this.generateFarBuildingsTexture(map.farKey, profile.id, profile.skyline);
      }
      if (!this.textures.exists(map.nearKey)) {
        this.generateNearBuildingsTexture(
          map.nearKey,
          map.billboards,
          profile.colors,
          profile.id,
        );
      }
      if (!this.textures.exists(map.roadKey)) {
        this.generateRoadTexture(map.roadKey, profile.id, profile.road);
      }
    }
  }

  private generateFarBuildingsTexture(
    key: string,
    profile: "mirpur" | "farmgate" | "newmarket",
    color: string,
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = BALANCE.LOGICAL_WIDTH;
    canvas.height = 300;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.8;

    const widths = profile === "farmgate" ? [80, 145, 55, 180] : profile === "newmarket" ? [110, 75, 120, 95] : [135, 90, 160, 70];
    let x = 0;
    let index = 0;
    while (x < BALANCE.LOGICAL_WIDTH) {
      const width = widths[index % widths.length];
      const height =
        profile === "farmgate"
          ? 105 + (index % 4) * 28
          : profile === "newmarket"
          ? 90 + (index % 3) * 22
          : 120 + (index % 3) * 30;
      ctx.fillRect(x, 300 - height, width - 5, height);
      ctx.globalAlpha = 1;
      ctx.fillStyle = profile === "farmgate" && index % 3 === 0 ? "#f59e0b" : color;
      for (let wy = 300 - height + 18; wy < 285; wy += 28) {
        ctx.fillRect(x + 12, wy, 10, 12);
        if (width > 100) ctx.fillRect(x + width - 28, wy, 10, 12);
      }
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = color;
      x += width;
      index++;
    }

    if (profile === "farmgate") {
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#64748b";
      ctx.fillRect(80, 150, 1120, 14);
      for (let pillarX = 120; pillarX < 1200; pillarX += 180) {
        ctx.fillRect(pillarX, 164, 18, 136);
      }
    } else if (profile === "newmarket") {
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#facc15";
      ctx.fillRect(420, 105, 440, 16);
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(435, 121, 410, 10);
    } else {
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(520, 82, 180, 90);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(536, 98, 148, 58);
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(548, 108, 48, 36);
      ctx.fillRect(610, 108, 58, 36);
    }

    this.textures.addCanvas(key, canvas);
  }

  private generateRoadTexture(
    key: string,
    profile: "mirpur" | "farmgate" | "newmarket",
    colors: { curb: string; stripe: string; detail: string },
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = BALANCE.LOGICAL_WIDTH;
    canvas.height = 370;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = profile === "farmgate" ? "#292524" : profile === "newmarket" ? "#3f3f46" : "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = colors.curb;
    ctx.fillRect(0, 0, canvas.width, 10);
    ctx.fillStyle = colors.detail;
    ctx.fillRect(0, 10, canvas.width, 7);
    ctx.fillStyle = colors.stripe;

    if (profile === "farmgate") {
      for (let x = 0; x < canvas.width; x += 84) {
        ctx.fillRect(x, 105, 46, 5);
        ctx.fillRect(x + 25, 160, 46, 5);
      }
      ctx.fillStyle = "#f59e0b";
      for (let x = 45; x < canvas.width; x += 210) ctx.fillRect(x, 214, 100, 8);
    } else if (profile === "newmarket") {
      for (let x = 0; x < canvas.width; x += 56) {
        ctx.fillRect(x, 104, 28, 5);
        ctx.fillRect(x + 10, 160, 28, 5);
      }
      ctx.fillStyle = "#ea580c";
      ctx.fillRect(0, 28, canvas.width, 7);
    } else {
      for (let x = 0; x < canvas.width; x += 70) {
        ctx.fillRect(x, 107, 40, 5);
        ctx.fillRect(x, 162, 40, 5);
      }
      ctx.fillStyle = "#b45309";
      for (let x = 30; x < canvas.width; x += 240) ctx.fillRect(x, 38, 90, 5);
    }
    this.textures.addCanvas(key, canvas);
  }

  private generateNearBuildingsTexture(
    key: string,
    billboards: Array<{ main: string; sub: string; bg: string; fg: string }>,
    buildingColors: readonly string[],
    profile: "mirpur" | "farmgate" | "newmarket" = "mirpur",
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = BALANCE.LOGICAL_WIDTH;
    canvas.height = 360;
    const ctx = canvas.getContext("2d")!;

    let bbIndex = 0;
    const blockWidth = profile === "newmarket" ? 170 : profile === "farmgate" ? 150 : 130;
    for (let x = 0; x < BALANCE.LOGICAL_WIDTH; x += blockWidth) {
      const col = buildingColors[Math.floor(x / blockWidth) % buildingColors.length];
      const h =
        profile === "farmgate"
          ? 165 + ((x * 11) % 90)
          : profile === "newmarket"
          ? 145 + ((x * 7) % 75)
          : 190 + ((x * 17) % 130);

      // Building facade
      ctx.fillStyle = col;
      ctx.fillRect(x, 360 - h, blockWidth - 10, h);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, 360 - h, blockWidth - 10, h);

      // Windows
      ctx.fillStyle = (x % 260 === 0) ? "rgba(56, 189, 248, 0.7)" : "rgba(254, 240, 138, 0.75)";
      for (let wy = 360 - h + 30; wy < 340; wy += 32) {
        for (let wx = x + 16; wx < x + blockWidth - 20; wx += 28) {
          ctx.fillRect(wx, wy, 16, 18);
          ctx.strokeStyle = "#0f172a";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(wx, wy, 16, 18);
        }
      }

      // Authentic Dhaka Billboard
      const bb = billboards[bbIndex % billboards.length];
      bbIndex++;

      const bbWidth = 110;
      const bbHeight = 36;
      const bbX = x + 5;
      const bbY = 360 - h + 10;

      ctx.fillStyle = bb.bg;
      ctx.fillRect(bbX, bbY, bbWidth, bbHeight);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.strokeRect(bbX, bbY, bbWidth, bbHeight);

      ctx.strokeStyle = bb.fg;
      ctx.lineWidth = 1;
      ctx.strokeRect(bbX + 2, bbY + 2, bbWidth - 4, bbHeight - 4);

      ctx.fillStyle = bb.fg;
      ctx.font = "bold 10px 'Hind Siliguri', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(bb.main, bbX + bbWidth / 2, bbY + 16);

      ctx.font = "bold 7px 'Luckiest Guy', Impact, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(bb.sub, bbX + bbWidth / 2, bbY + 28);

      if (profile === "farmgate" && x % 300 === 0) {
        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(x + 16, 318, blockWidth - 34, 20);
        ctx.fillStyle = "#020617";
        ctx.font = "bold 9px sans-serif";
        ctx.fillText("BUS STOP", x + blockWidth / 2, 332);
      }
      if (profile === "newmarket" && x % 340 === 0) {
        ctx.fillStyle = "#facc15";
        ctx.fillRect(x + 2, 300, blockWidth - 14, 58);
        ctx.fillStyle = "#dc2626";
        ctx.font = "bold 12px 'Hind Siliguri', sans-serif";
        ctx.fillText("১০০ টাকা", x + blockWidth / 2, 326);
      }
    }

    this.textures.addCanvas(key, canvas);
  }
}
