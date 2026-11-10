import Phaser from "phaser";
import { BALANCE } from "@/config/balance";

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

    // 4. Dhaka 3-Lane Asphalt Road (1280 x 280)
    if (!this.textures.exists("bg-road")) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Asphalt
      g.fillStyle(0x0f172a, 1);
      g.fillRect(0, 0, BALANCE.LOGICAL_WIDTH, 280);

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
        g.fillRect(x, 90, 40, 5); // Lane 1-2 divider
        g.fillRect(x, 180, 40, 5); // Lane 2-3 divider
      }
      g.generateTexture("bg-road", BALANCE.LOGICAL_WIDTH, 280);
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
  }
}
