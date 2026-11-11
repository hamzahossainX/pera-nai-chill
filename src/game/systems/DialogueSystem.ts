import Phaser from "phaser";
import { Villain } from "@/game/entities/Villain";
import { Chaser } from "@/game/entities/Chaser";
import { DIALOGUE_GROUPS, DialogueLine } from "@/config/dialogue";
import { gameBus } from "@/game/bus";
import { useGameStore } from "@/store/useGameStore";

interface SpeechBubble {
  container: Phaser.GameObjects.Container;
  fadeTween?: Phaser.Tweens.Tween;
  owner: "villain" | "chaser";
}

export class DialogueSystem {
  private scene: Phaser.Scene;
  private villain: Villain;
  private chaser: Chaser;

  private villainBubble?: SpeechBubble;
  private chaserBubble?: SpeechBubble;

  private lastLineIndex: Record<string, number> = {};
  private idleChatterTimer = 7000; // ms

  constructor(scene: Phaser.Scene, villain: Villain, chaser: Chaser) {
    this.scene = scene;
    this.villain = villain;
    this.chaser = chaser;

    // Listen to game bus events
    gameBus.on("combat:hit", this.handleCombatHit);
    gameBus.on("player:taunt", this.handlePlayerTaunt);
    gameBus.on("event:started", this.handleEventStarted);
  }

  public destroy() {
    gameBus.off("combat:hit", this.handleCombatHit);
    gameBus.off("player:taunt", this.handlePlayerTaunt);
    gameBus.off("event:started", this.handleEventStarted);

    this.clearBubble("villain");
    this.clearBubble("chaser");
  }

  private handleCombatHit = () => {
    // 35% chance to trigger dialogue on hit
    if (Math.random() < 0.35) {
      if (Math.random() < 0.6) {
        this.triggerLine("villain", "villain_hit");
      } else {
        this.triggerLine("chaser", "chaser_hit");
      }
    }
  };

  private handlePlayerTaunt = () => {
    // Chaser shouts a taunt line
    this.triggerLine("chaser", "chaser_taunt");

    // Villain panics/retaliates 450ms later
    this.scene.time.delayedCall(450, () => {
      this.triggerLine("villain", "villain_taunt");
    });
  };

  private handleEventStarted = (data: { eventId: string }) => {
    if (data.eventId.includes("loadshedding")) {
      this.triggerLine("villain", "event_loadshedding");
    } else if (data.eventId.includes("pollution") || data.eventId.includes("smog")) {
      this.triggerLine("villain", "event_pollution");
    } else if (data.eventId.includes("strike") || data.eventId.includes("hartal")) {
      this.triggerLine("chaser", "event_strike");
    } else if (data.eventId.includes("waterlogging") || data.eventId.includes("flood")) {
      this.triggerLine("villain", "event_flood");
    }
  };

  public triggerLine(
    target: "villain" | "chaser",
    groupKey: keyof typeof DIALOGUE_GROUPS
  ) {
    const list = DIALOGUE_GROUPS[groupKey];
    if (!list || list.length === 0) return;

    // Pick random without immediate repeat
    const lastIdx = this.lastLineIndex[groupKey] ?? -1;
    let newIdx = Math.floor(Math.random() * list.length);
    if (list.length > 1 && newIdx === lastIdx) {
      newIdx = (newIdx + 1) % list.length;
    }
    this.lastLineIndex[groupKey] = newIdx;

    const line = list[newIdx];
    this.showBubble(target, line);
  }

  public showBubble(target: "villain" | "chaser", line: DialogueLine) {
    if (!this.scene || !this.scene.add || !this.scene.tweens) return;
    const charRig = target === "villain" ? this.villain?.rig : this.chaser?.rig;
    if (!charRig || !charRig.scene) return;

    // Clean up existing bubble for this character (never stack/overlap)
    this.clearBubble(target);

    const lang = useGameStore.getState().settings.lang || "bn";
    const displayText = lang === "en" ? line.en : line.bn;

    const startX = charRig.x;
    const startY = charRig.y - 140;

    const container = this.scene.add.container(startX, startY);
    container.setDepth(150);

    // Measure text
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: "var(--font-bangla), sans-serif",
      fontSize: "13px",
      color: "#0f172a",
      fontStyle: "bold",
      align: "center",
      wordWrap: { width: 190, useAdvancedWrap: true },
    };

    const textObj = this.scene.add.text(0, 0, displayText, textStyle);
    textObj.setOrigin(0.5, 0.5);

    const textBounds = textObj.getBounds();
    const padX = 14;
    const padY = 8;
    const bubbleW = Math.min(220, Math.max(90, textBounds.width + padX * 2));
    const bubbleH = textBounds.height + padY * 2;

    // Bubble Graphics Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xffffff, 0.95);
    bg.fillRoundedRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH, 8);
    bg.lineStyle(2, 0x000000, 1);
    bg.strokeRoundedRect(-bubbleW / 2, -bubbleH / 2, bubbleW, bubbleH, 8);

    // Comic pointer triangle pointing down towards character
    bg.fillStyle(0xffffff, 0.95);
    bg.beginPath();
    bg.moveTo(-6, bubbleH / 2);
    bg.lineTo(0, bubbleH / 2 + 8);
    bg.lineTo(6, bubbleH / 2);
    bg.closePath();
    bg.fillPath();

    bg.lineStyle(2, 0x000000, 1);
    bg.beginPath();
    bg.moveTo(-6, bubbleH / 2);
    bg.lineTo(0, bubbleH / 2 + 8);
    bg.lineTo(6, bubbleH / 2);
    bg.strokePath();

    container.add([bg, textObj]);

    // Initial pop-in animation
    container.setScale(0.6);
    container.setAlpha(0);
    this.scene.tweens.add({
      targets: container,
      scale: 1.0,
      alpha: 1,
      duration: 180,
      ease: "Back.Out",
    });

    // 2-second lifetime then fade out
    const fadeTween = this.scene.tweens.add({
      targets: container,
      alpha: 0,
      y: startY - 15,
      delay: 2000,
      duration: 250,
      ease: "Quad.In",
      onComplete: () => {
        this.clearBubble(target);
      },
    });

    const bubbleData: SpeechBubble = {
      container,
      fadeTween,
      owner: target,
    };

    if (target === "villain") {
      this.villainBubble = bubbleData;
    } else {
      this.chaserBubble = bubbleData;
    }
  }

  public clearBubble(target: "villain" | "chaser") {
    const bubble = target === "villain" ? this.villainBubble : this.chaserBubble;
    if (bubble) {
      if (bubble.fadeTween) bubble.fadeTween.stop();
      bubble.container.destroy();
      if (target === "villain") {
        this.villainBubble = undefined;
      } else {
        this.chaserBubble = undefined;
      }
    }
  }

  public update(_time: number, delta: number) {
    // 1. Keep active bubbles tracking with character rigs smoothly
    if (this.villainBubble) {
      this.villainBubble.container.x = this.villain.rig.x;
      this.villainBubble.container.y = this.villain.rig.y - 140;
    }
    if (this.chaserBubble) {
      this.chaserBubble.container.x = this.chaser.rig.x;
      this.chaserBubble.container.y = this.chaser.rig.y - 140;
    }

    // 2. Periodic idle banter every 8-12 seconds
    this.idleChatterTimer -= delta;
    if (this.idleChatterTimer <= 0) {
      this.idleChatterTimer = 8000 + Math.random() * 5000;
      if (Math.random() < 0.5) {
        this.triggerLine("villain", "villain_taunt");
      } else {
        this.triggerLine("chaser", "chaser_taunt");
      }
    }
  }

  public destroy() {
    this.clearBubble("villain");
    this.clearBubble("chaser");
  }
}
