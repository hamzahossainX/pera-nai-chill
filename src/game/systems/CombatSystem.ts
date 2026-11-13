import Phaser from "phaser";
import { Villain } from "@/game/entities/Villain";
import { Chaser } from "@/game/entities/Chaser";
import { Projectile } from "@/game/entities/Projectile";
import { FxSystem } from "@/game/systems/FxSystem";
import { GapSystem } from "@/game/systems/GapSystem";
import {
  WEAPONS,
  ULTIMATE_WEAPON,
  WeaponConfig,
  CHAPPAL_VARIETIES,
  DEFAULT_CHAPPAL,
} from "@/config/weapons";
import { calculateComboMultiplier } from "@/config/balance";
import { rng } from "@/lib/rng";
import { useGameStore } from "@/store/useGameStore";
import { gameBus } from "@/game/bus";
import { audioService } from "@/services/audio";

export class CombatSystem {
  private scene: Phaser.Scene;
  private villain: Villain;
  private chaser: Chaser;
  private fxSystem: FxSystem;
  public gapSystem: GapSystem;
  private projectiles: Projectile[] = [];
  private isDestroyed = false;

  constructor(
    scene: Phaser.Scene,
    villain: Villain,
    chaser: Chaser,
    fxSystem: FxSystem,
    gapSystem: GapSystem
  ) {
    this.scene = scene;
    this.villain = villain;
    this.chaser = chaser;
    this.fxSystem = fxSystem;
    this.gapSystem = gapSystem;

    // Listen to weapon triggers from UI Dock
    gameBus.on("weapon:use", this.handleWeaponUse);
  }

  public destroy() {
    this.isDestroyed = true;
    gameBus.off("weapon:use", this.handleWeaponUse);
    this.projectiles.forEach((p) => p.destroy());
    this.projectiles = [];
  }

  private handleWeaponUse = (data: { weaponId: string }) => {
    if (this.isDestroyed) return;
    if (!this.scene?.scene?.isActive()) return;
    if (!this.chaser?.rig?.scene) return;
    if (this.villain.isDead) return;

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
      if (weapon.id === "banana") {
        this.chaser.attack("throw");
        audioService.play(weapon.soundKey);
        const p = new Projectile({
          scene: this.scene,
          startX: this.chaser.rig.x + 20,
          startY: this.chaser.rig.y - 45,
          targetX: this.villain.rig.x,
          targetY: this.villain.rig.y - 20,
          texture: "projectile-banana",
          duration: 380,
          onHit: (hitX, hitY) => {
            // Villain 360 degree slip flip!
            this.scene.tweens.add({
              targets: this.villain.rig,
              rotation: Math.PI * 2,
              y: this.villain.rig.y - 40,
              duration: 350,
              yoyo: true,
              ease: "Quad.Out",
              onComplete: () => {
                this.villain.rig.rotation = 0;
              },
            });

            this.gapSystem.reduceGap(40);
            store.restorePatience(2);
            this.applyHit({
              x: hitX,
              y: hitY,
              damage: Math.round(weapon.damage * multiplier),
              comicWord: "পিছলে গেল! ডিগবাজি!",
              weapon,
              isCrit: true,
              knockback: 70,
            });
          },
        });
        this.projectiles.push(p);
        return;
      }

      if (weapon.id === "can-kick") {
        this.chaser.attack("kick");
        audioService.play(weapon.soundKey);
        const p = new Projectile({
          scene: this.scene,
          startX: this.chaser.rig.x + 30,
          startY: this.chaser.rig.y - 15,
          targetX: this.villain.rig.x - 10,
          targetY: this.villain.rig.y - 15,
          texture: "projectile-can",
          duration: 300,
          onHit: (hitX, hitY) => {
            this.gapSystem.reduceGap(30);
            store.restorePatience(2);
            this.applyHit({
              x: hitX,
              y: hitY,
              damage: Math.round(weapon.damage * multiplier),
              comicWord: "ক্যান শট! ঠকাস!",
              weapon,
              isCrit: false,
              knockback: 35,
            });
          },
        });
        this.projectiles.push(p);
        return;
      }

      // Look up currently selected chappal variety
      const selectedChappal =
        CHAPPAL_VARIETIES.find((c) => c.id === store.selectedChappalId) ||
        DEFAULT_CHAPPAL;

      const projectileDamage = Math.round(selectedChappal.damage * multiplier);
      const projectileTaka = Math.round(weapon.takaReward * selectedChappal.takaMultiplier);

      const comicWord =
        selectedChappal.id === "chappal-leather"
          ? "ধুম্মম চামড়ার বাড়ি!"
          : selectedChappal.id === "chappal-golden"
          ? "ঝলমলে সোনার চটি!"
          : "ঠাস করে জুতা!";

      // Throw Flying Chappal from chaser hand to villain head
      this.chaser.attack("throw");
      audioService.play(selectedChappal.soundKey);

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
        texture: selectedChappal.textureKey,
        duration: selectedChappal.flightDurationMs,
        onHit: (hitX, hitY) => {
          this.gapSystem.reduceGap(35);
          store.restorePatience(2);
          if (selectedChappal.id === "chappal-golden") {
            this.fxSystem.spawnHitParticles(hitX, hitY, 10, "particle-coin");
          }
          this.applyHit({
            x: hitX,
            y: hitY,
            damage: projectileDamage,
            comicWord,
            weapon: {
              ...weapon,
              takaReward: projectileTaka,
            },
            isCrit: true,
            knockback: selectedChappal.id === "chappal-leather" ? 60 : 45,
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

      // Check melee range per GAME_PLAN_V2 §2.1, §2.2
      const inRange = this.gapSystem.isMeleeInRange();
      if (!inRange) {
        audioService.play("click");
        const missWords = ["মিস!", "অনেক দূর!", "কাছে যান!"];
        const missWord = rng.pick(missWords);
        this.fxSystem.triggerHitFx(
          this.chaser.rig.x + 60,
          this.chaser.rig.y - 50,
          missWord,
          0,
          false
        );
        // Mashing penalty: drain patience and reset combo
        store.drainPatience(4);
        store.resetCombo();
        return;
      }

      audioService.play(weapon.soundKey);

      // Close zone bonus: +25% damage, camera shake, patience restore
      let effectiveDamage = finalDamage;
      if (this.gapSystem.getZone() === "CLOSE") {
        effectiveDamage = Math.round(finalDamage * 1.25);
        if (this.scene && this.scene.cameras) {
          this.scene.cameras.main.shake(120, 0.008);
        }
        store.restorePatience(4);
      } else {
        store.restorePatience(2);
      }

      // Impact timing
      const delay = attackType === "kick" ? 140 : 90;
      const slapWords = ["ঠাস!", "চড়াত!", "ফটাস!"];
      const punchWords = ["ধুম!", "ধপাস!", "ঘ্যাচাং!"];
      const kickWords = ["দড়াম!", "বোম!", "প্যাঁক!"];

      const comicWord =
        attackType === "slap"
          ? rng.pick(slapWords)
          : attackType === "punch"
          ? rng.pick(punchWords)
          : rng.pick(kickWords);

      this.scene.time.delayedCall(delay, () => {
        const hitX = this.villain.rig.x - 20;
        const hitY = this.villain.rig.y - 60;
        this.applyHit({
          x: hitX,
          y: hitY,
          damage: effectiveDamage,
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
    this.gapSystem.reduceGap(100);
    store.restorePatience(10);
    audioService.play(ULTIMATE_WEAPON.soundKey);
    audioService.duckBgm(true);
    this.scene.time.delayedCall(1200, () => audioService.duckBgm(false));

    // 1. Slow-Mo
    this.scene.time.timeScale = 0.4;
    this.scene.time.delayedCall(700, () => {
      this.scene.time.timeScale = 1.0;
    });

    // 2. Chappal Storm Barrage (10 rapid-fire flying chappals)
    const barrageCount = 10;
    for (let i = 0; i < barrageCount; i++) {
      this.scene.time.delayedCall(i * 50, () => {
        const startX = 100 + rng.range(0, 200);
        const startY = 100 + rng.range(0, 200);
        const targetX = this.villain.rig.x + rng.range(-20, 20);
        const targetY = this.villain.rig.y - 70 + rng.range(-15, 15);

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
    audioService.play(`${this.villain.archetype.id}-grunt`, { volume: 0.8 });

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
