import Phaser from "phaser";
import { Villain } from "@/game/entities/Villain";
import { Chaser } from "@/game/entities/Chaser";
import { Projectile } from "@/game/entities/Projectile";
import { FxSystem } from "@/game/systems/FxSystem";
import { WEAPONS, ULTIMATE_WEAPON, WeaponConfig } from "@/config/weapons";
import { calculateComboMultiplier } from "@/config/balance";
import { useGameStore } from "@/store/useGameStore";
import { gameBus } from "@/game/bus";
import { audioService } from "@/services/audio";

export class CombatSystem {
  private scene: Phaser.Scene;
  private villain: Villain;
  private chaser: Chaser;
  private fxSystem: FxSystem;
  private projectiles: Projectile[] = [];

  constructor(
    scene: Phaser.Scene,
    villain: Villain,
    chaser: Chaser,
    fxSystem: FxSystem
  ) {
    this.scene = scene;
    this.villain = villain;
    this.chaser = chaser;
    this.fxSystem = fxSystem;

    // Listen to weapon triggers from UI Dock
    gameBus.on("weapon:use", this.handleWeaponUse);
  }

  public destroy() {
    gameBus.off("weapon:use", this.handleWeaponUse);
    this.projectiles.forEach((p) => p.destroy());
    this.projectiles = [];
  }

  private handleWeaponUse = (data: { weaponId: string }) => {
    if (data.weaponId === ULTIMATE_WEAPON.id) {
      this.executeUltimate();
      return;
    }

    const weapon = WEAPONS.find((w) => w.id === data.weaponId);
    if (!weapon) return;

    this.executeWeapon(weapon);
  };

  private executeWeapon(weapon: WeaponConfig) {
    const store = useGameStore.getState();
    const currentCombo = store.combo;
    const multiplier = calculateComboMultiplier(currentCombo);
    const finalDamage = Math.round(weapon.damage * multiplier);

    if (weapon.type === "projectile") {
      // Throw Flying Chappal from chaser hand to villain head
      this.chaser.attack("throw");
      audioService.play(weapon.soundKey);

      const startX = this.chaser.rig.x + 20;
      const startY = this.chaser.rig.y - 65;
      const targetX = this.villain.rig.x;
      const targetY = this.villain.rig.y - 75;

      const p = new Projectile({
        scene: this.scene,
        startX,
        startY,
        targetX,
        targetY,
        texture: "projectile-chappal",
        onHit: (hitX, hitY) => {
          this.applyHit({
            x: hitX,
            y: hitY,
            damage: finalDamage,
            comicWord: "ঠাস করে জুতা!",
            weapon,
            isCrit: true,
            knockback: 45,
          });
        },
      });

      this.projectiles.push(p);
    } else {
      // Melee Attacks: Slap, Punch, Kick
      const attackType =
        weapon.id === "kick"
          ? "kick"
          : weapon.id === "punch"
          ? "punch"
          : "slap";

      this.chaser.attack(attackType);
      audioService.play(weapon.soundKey);

      // Impact timing
      const delay = attackType === "kick" ? 140 : 90;
      const slapWords = ["ঠাস!", "চড়াত!", "ফটাস!"];
      const punchWords = ["ধুম!", "ধপাস!", "ঘ্যাচাং!"];
      const kickWords = ["দড়াম!", "বোম!", "প্যাঁক!"];

      const comicWord =
        attackType === "slap"
          ? slapWords[Math.floor(Math.random() * slapWords.length)]
          : attackType === "punch"
          ? punchWords[Math.floor(Math.random() * punchWords.length)]
          : kickWords[Math.floor(Math.random() * kickWords.length)];

      this.scene.time.delayedCall(delay, () => {
        const hitX = this.villain.rig.x - 20;
        const hitY = this.villain.rig.y - 60;
        this.applyHit({
          x: hitX,
          y: hitY,
          damage: finalDamage,
          comicWord,
          weapon,
          isCrit: attackType === "kick",
          knockback: attackType === "kick" ? 35 : 20,
        });
      });
    }
  }

  private executeUltimate() {
    const store = useGameStore.getState();
    if (store.rage < 100) return;

    store.resetRage();
    audioService.play(ULTIMATE_WEAPON.soundKey);

    // 1. Slow-Mo
    this.scene.time.timeScale = 0.4;
    this.scene.time.delayedCall(700, () => {
      this.scene.time.timeScale = 1.0;
    });

    // 2. Chappal Storm Barrage (10 rapid-fire flying chappals)
    const barrageCount = 10;
    for (let i = 0; i < barrageCount; i++) {
      this.scene.time.delayedCall(i * 50, () => {
        const startX = 100 + Math.random() * 200;
        const startY = 100 + Math.random() * 200;
        const targetX = this.villain.rig.x + (Math.random() - 0.5) * 40;
        const targetY = this.villain.rig.y - 70 + (Math.random() - 0.5) * 30;

        const p = new Projectile({
          scene: this.scene,
          startX,
          startY,
          targetX,
          targetY,
          texture: "projectile-chappal",
          duration: 320,
          onHit: (hx, hy) => {
            this.applyHit({
              x: hx,
              y: hy,
              damage: Math.round(ULTIMATE_WEAPON.damage / barrageCount),
              comicWord: "জুতার ঝড়!",
              weapon: ULTIMATE_WEAPON,
              isCrit: true,
              knockback: 10,
            });
          },
        });
        this.projectiles.push(p);
      });
    }
  }

  private applyHit(params: {
    x: number;
    y: number;
    damage: number;
    comicWord: string;
    weapon: WeaponConfig;
    isCrit: boolean;
    knockback: number;
  }) {
    // 1. Villain reactions
    this.villain.hit(params.damage, params.knockback, params.isCrit);
    this.fxSystem.triggerArchetypeHitReaction(
      this.villain.archetype.id,
      params.x,
      params.y
    );

    // 2. Visual & Sound FX
    this.fxSystem.triggerHitFx(
      params.x,
      params.y,
      params.comicWord,
      params.damage,
      params.isCrit
    );

    // 3. Update Zustand Game Store
    const store = useGameStore.getState();
    store.inflictDamage(params.damage);
    store.addRage(params.weapon.rageGain);
    store.incrementCombo();
    store.addTaka(params.weapon.takaReward);

    // 4. Emit to typed EventBus
    gameBus.emit("hit", {
      weaponId: params.weapon.id,
      damage: params.damage,
      isCrit: params.isCrit,
      position: { x: params.x, y: params.y },
    });
    gameBus.emit("combo", {
      count: store.combo + 1,
      multiplier: calculateComboMultiplier(store.combo + 1),
    });
  }

  public update(_time: number, delta: number) {
    // Update active projectiles and prune destroyed ones
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (p.active) {
        p.update(_time, delta);
      } else {
        this.projectiles.splice(i, 1);
      }
    }
  }
}
