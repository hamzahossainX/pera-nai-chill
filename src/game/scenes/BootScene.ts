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

    // 26. Scenario Maps: Sky & Near Buildings for Farmgate & New Market
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

    // Near buildings for Farmgate
    if (!this.textures.exists("bg-near-farmgate")) {
      const farmgateMap = MAP_SCENARIOS.find((m) => m.id === "farmgate")!;
      this.generateNearBuildingsTexture("bg-near-farmgate", farmgateMap.billboards, [
        "#1c1917", "#292524", "#44403c", "#1e1b4b", "#312e81"
      ]);
    }

    // Near buildings for New Market
    if (!this.textures.exists("bg-near-newmarket")) {
      const newmarketMap = MAP_SCENARIOS.find((m) => m.id === "newmarket")!;
      this.generateNearBuildingsTexture("bg-near-newmarket", newmarketMap.billboards, [
        "#3f1d38", "#1e1b4b", "#4a044e", "#172554", "#2e1065"
      ]);
    }

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
  }

  private generateNearBuildingsTexture(
    key: string,
    billboards: Array<{ main: string; sub: string; bg: string; fg: string }>,
    buildingColors: string[]
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = BALANCE.LOGICAL_WIDTH;
    canvas.height = 360;
    const ctx = canvas.getContext("2d")!;

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

      // Windows
      ctx.fillStyle = (x % 260 === 0) ? "rgba(56, 189, 248, 0.7)" : "rgba(254, 240, 138, 0.75)";
      for (let wy = 360 - h + 30; wy < 340; wy += 32) {
        for (let wx = x + 16; wx < x + 105; wx += 28) {
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
    }

    this.textures.addCanvas(key, canvas);
  }
}
