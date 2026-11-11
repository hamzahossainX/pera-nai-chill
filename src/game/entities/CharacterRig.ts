import Phaser from "phaser";
import { OutfitDefinition, OUTFITS } from "@/config/outfits";
import { VillainArchetype } from "@/config/villains";
import { SecondaryMotion } from "@/game/systems/SecondaryMotion";

export interface RigOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  isSilhouette?: boolean;
  faceKey?: string;
  outfit?: OutfitDefinition;
  archetype?: VillainArchetype;
  outfitColor?: number;
  pantColor?: number;
  scale?: number;
  isChaser?: boolean;
}

export class CharacterRig extends Phaser.GameObjects.Container {
  public isSilhouette: boolean;
  public faceKey: string;
  public outfit?: OutfitDefinition;
  public archetype?: VillainArchetype;
  public isChaser: boolean;

  // Rig Components
  private shadowSprite!: Phaser.GameObjects.Sprite;
  private torsoSprite!: Phaser.GameObjects.Sprite;
  private headGroup!: Phaser.GameObjects.Container;
  private headBackSprite?: Phaser.GameObjects.Sprite;
  private faceSprite!: Phaser.GameObjects.Sprite;
  private maskUpperSprite?: Phaser.GameObjects.Sprite;
  private maskLowerSprite?: Phaser.GameObjects.Sprite;
  private headFrontSprite?: Phaser.GameObjects.Sprite;
  private expressionSprite!: Phaser.GameObjects.Sprite;

  // Comic Reactive Face Props
  private propDizzyStars!: Phaser.GameObjects.Sprite;
  private propBandAid!: Phaser.GameObjects.Sprite;
  private propTears!: Phaser.GameObjects.Sprite;
  private propShockedEyes!: Phaser.GameObjects.Sprite;

  // Limbs & Props
  private backPropSprite?: Phaser.GameObjects.Sprite;
  private frontPropSprite?: Phaser.GameObjects.Sprite;
  private handPropSprite?: Phaser.GameObjects.Sprite;

  private backArmGroup!: Phaser.GameObjects.Container;
  private backArmUpper!: Phaser.GameObjects.Sprite;
  private backArmLowerGroup!: Phaser.GameObjects.Container;
  private backArmLower!: Phaser.GameObjects.Sprite;
  private backHand!: Phaser.GameObjects.Sprite;

  private frontArmGroup!: Phaser.GameObjects.Container;
  private frontArmUpper!: Phaser.GameObjects.Sprite;
  private frontArmLowerGroup!: Phaser.GameObjects.Container;
  private frontArmLower!: Phaser.GameObjects.Sprite;
  private frontHand!: Phaser.GameObjects.Sprite;

  private backLegGroup!: Phaser.GameObjects.Container;
  private backLegThigh!: Phaser.GameObjects.Sprite;
  private backLegShinGroup!: Phaser.GameObjects.Container;
  private backLegShin!: Phaser.GameObjects.Sprite;
  private backFoot!: Phaser.GameObjects.Sprite;

  private frontLegGroup!: Phaser.GameObjects.Container;
  private frontLegThigh!: Phaser.GameObjects.Sprite;
  private frontLegShinGroup!: Phaser.GameObjects.Container;
  private frontLegShin!: Phaser.GameObjects.Sprite;
  private frontFoot!: Phaser.GameObjects.Sprite;

  // Mask slip state
  public maskSlipped = false;
  public maskFallen = false;

  // Secondary Motion Physics
  private secondaryMotion = new SecondaryMotion();

  // State
  public stateName: "RUN" | "HIT_STUN" | "DEAD" | "ATTACK" | "TRIPPED" = "RUN";
  public runSpeedFactor = 1.0;
  private isHitStunned = false;
  private attackTimer = 0;

  constructor(options: RigOptions) {
    super(options.scene, options.x, options.y);
    this.isSilhouette = options.isSilhouette ?? false;
    this.faceKey = options.faceKey ?? "target-face";
    this.outfit = options.outfit;
    this.archetype = options.archetype;
    this.isChaser = options.isChaser ?? false;

    // Default to Phone Snatcher outfit if not specified and not chaser
    if (!this.outfit && !this.isChaser) {
      this.outfit = OUTFITS.phoneSnatcher;
    }

    this.scene.add.existing(this);
    this.setScale(options.scale ?? 1.0);

    this.buildHierarchy(
      options.outfitColor ?? 0xffffff,
      options.pantColor ?? 0x1e293b
    );
  }

  private resolveTexture(keyCandidate?: string, fallbackKey: string = "rig-limb-upper"): string {
    if (keyCandidate && this.scene.textures.exists(keyCandidate)) {
      return keyCandidate;
    }
    if (this.scene.textures.exists(fallbackKey)) {
      return fallbackKey;
    }
    return "particle-star";
  }

  private buildHierarchy(outfitColor: number, pantColor: number) {
    const slots = this.outfit?.slots;
    const bodyScale = this.archetype?.bodyScale ?? { head: 1.0, torso: 1.0, limbs: 1.0 };

    // 1. Shadow (at ground origin)
    const shadowKey = this.resolveTexture(slots?.shadow, "rig-shadow");
    this.shadowSprite = this.scene.add.sprite(0, 10, shadowKey).setOrigin(0.5, 0.5);
    this.add(this.shadowSprite);

    // 2. Back Prop (e.g. backpack, loot bag)
    if (slots?.backProp && this.scene.textures.exists(slots.backProp)) {
      this.backPropSprite = this.scene.add
        .sprite(-15, -60, slots.backProp)
        .setOrigin(0.5, 0.5);
      this.add(this.backPropSprite);
    }

    // 3. Back Arm
    const upperArmKey = this.resolveTexture(slots?.upperArm, "rig-limb-upper");
    const lowerArmKey = this.resolveTexture(slots?.lowerArm, "rig-limb-lower");
    const handKey = this.resolveTexture(slots?.hand, "rig-hand");

    this.backArmGroup = this.scene.add.container(-10, -65);
    this.backArmGroup.setScale(bodyScale.limbs);
    this.backArmUpper = this.scene.add.sprite(0, 12, upperArmKey).setOrigin(0.5, 0.2);
    this.backArmLowerGroup = this.scene.add.container(0, 22);
    this.backArmLower = this.scene.add.sprite(0, 10, lowerArmKey).setOrigin(0.5, 0.2);
    this.backHand = this.scene.add.sprite(0, 22, handKey).setOrigin(0.5, 0.5);

    this.backArmLowerGroup.add([this.backArmLower, this.backHand]);
    this.backArmGroup.add([this.backArmUpper, this.backArmLowerGroup]);
    this.add(this.backArmGroup);

    // 4. Back Leg
    const thighKey = this.resolveTexture(slots?.thigh, "rig-limb-upper");
    const shinKey = this.resolveTexture(slots?.shin, "rig-limb-lower");
    const footKey = this.resolveTexture(slots?.foot, "rig-foot");

    this.backLegGroup = this.scene.add.container(-6, -30);
    this.backLegGroup.setScale(bodyScale.limbs);
    this.backLegThigh = this.scene.add.sprite(0, 12, thighKey).setOrigin(0.5, 0.2);
    this.backLegShinGroup = this.scene.add.container(0, 24);
    this.backLegShin = this.scene.add.sprite(0, 10, shinKey).setOrigin(0.5, 0.2);
    this.backFoot = this.scene.add.sprite(4, 22, footKey).setOrigin(0.5, 0.5);

    this.backLegShinGroup.add([this.backLegShin, this.backFoot]);
    this.backLegGroup.add([this.backLegThigh, this.backLegShinGroup]);
    this.add(this.backLegGroup);

    // 5. Torso
    const torsoKey = this.resolveTexture(slots?.torso, "rig-torso");
    this.torsoSprite = this.scene.add.sprite(0, -55, torsoKey).setOrigin(0.5, 0.5);
    this.torsoSprite.setScale(bodyScale.torso);
    this.add(this.torsoSprite);

    // 6. Front Prop (e.g. chest harness, badge)
    if (slots?.frontProp && this.scene.textures.exists(slots.frontProp)) {
      this.frontPropSprite = this.scene.add
        .sprite(0, -55, slots.frontProp)
        .setOrigin(0.5, 0.5);
      this.add(this.frontPropSprite);
    }

    // 7. Front Leg
    this.frontLegGroup = this.scene.add.container(6, -30);
    this.frontLegGroup.setScale(bodyScale.limbs);
    this.frontLegThigh = this.scene.add.sprite(0, 12, thighKey).setOrigin(0.5, 0.2);
    this.frontLegShinGroup = this.scene.add.container(0, 24);
    this.frontLegShin = this.scene.add.sprite(0, 10, shinKey).setOrigin(0.5, 0.2);
    this.frontFoot = this.scene.add.sprite(4, 22, footKey).setOrigin(0.5, 0.5);

    this.frontLegShinGroup.add([this.frontLegShin, this.frontFoot]);
    this.frontLegGroup.add([this.frontLegThigh, this.frontLegShinGroup]);
    this.add(this.frontLegGroup);

    // 8. Front Arm
    this.frontArmGroup = this.scene.add.container(10, -65);
    this.frontArmGroup.setScale(bodyScale.limbs);
    this.frontArmUpper = this.scene.add.sprite(0, 12, upperArmKey).setOrigin(0.5, 0.2);
    this.frontArmLowerGroup = this.scene.add.container(0, 22);
    this.frontArmLower = this.scene.add.sprite(0, 10, lowerArmKey).setOrigin(0.5, 0.2);
    this.frontHand = this.scene.add.sprite(0, 22, handKey).setOrigin(0.5, 0.5);

    this.frontArmLowerGroup.add([this.frontArmLower, this.frontHand]);

    // Front Hand Prop (e.g. Phone Snatcher's stolen smartphone)
    if (slots?.handProp && this.scene.textures.exists(slots.handProp)) {
      this.handPropSprite = this.scene.add
        .sprite(4, 24, slots.handProp)
        .setOrigin(0.5, 0.5);
      this.frontArmLowerGroup.add(this.handPropSprite);
    }

    this.frontArmGroup.add([this.frontArmUpper, this.frontArmLowerGroup]);
    this.add(this.frontArmGroup);

    // 9. Head Group (Head Container)
    this.headGroup = this.scene.add.container(0, -90);
    this.headGroup.setScale(bodyScale.head);

    // Slot: HeadBack (e.g. hoodie back cavity / back hair)
    if (slots?.headBack && this.scene.textures.exists(slots.headBack)) {
      this.headBackSprite = this.scene.add
        .sprite(0, 0, slots.headBack)
        .setOrigin(0.5, 0.5);
      this.headGroup.add(this.headBackSprite);
    }

    // Face Sprite (Uploaded target face texture or placeholder)
    const effectiveFaceKey = this.scene.textures.exists(this.faceKey)
      ? this.faceKey
      : "particle-star";

    this.faceSprite = this.scene.add
      .sprite(0, 0, effectiveFaceKey)
      .setOrigin(0.5, 0.5)
      .setDisplaySize(68, 68);
    this.headGroup.add(this.faceSprite);

    // Slot: MaskUpper (balaclava forehead band)
    if (slots?.maskUpper && this.scene.textures.exists(slots.maskUpper)) {
      this.maskUpperSprite = this.scene.add
        .sprite(0, -14, slots.maskUpper)
        .setOrigin(0.5, 0.5);
      this.headGroup.add(this.maskUpperSprite);
    }

    // Slot: MaskLower (balaclava mouth cover, slips at 66% HP and flies at 33% HP)
    if (slots?.maskLower && this.scene.textures.exists(slots.maskLower)) {
      this.maskLowerSprite = this.scene.add
        .sprite(0, 14, slots.maskLower)
        .setOrigin(0.5, 0.5);
      this.headGroup.add(this.maskLowerSprite);
    }

    // Slot: HeadFront (hood brim arch framing face)
    if (slots?.headFront && this.scene.textures.exists(slots.headFront)) {
      this.headFrontSprite = this.scene.add
        .sprite(0, -2, slots.headFront)
        .setOrigin(0.5, 0.5);
      this.headGroup.add(this.headFrontSprite);
    }

    // Expression Overlays
    this.expressionSprite = this.scene.add
      .sprite(0, 0, "rig-expression-shock")
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    // Comic Reaction Face Props
    this.propDizzyStars = this.scene.add
      .sprite(0, -42, "prop-dizzy-stars")
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    this.propBandAid = this.scene.add
      .sprite(12, 10, "prop-band-aid")
      .setOrigin(0.5, 0.5)
      .setScale(0.8)
      .setVisible(false);

    this.propTears = this.scene.add
      .sprite(0, 8, "prop-crying-tears")
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    this.propShockedEyes = this.scene.add
      .sprite(0, -4, "prop-shocked-eyes")
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    this.headGroup.add([
      this.expressionSprite,
      this.propShockedEyes,
      this.propBandAid,
      this.propTears,
      this.propDizzyStars,
    ]);
    this.add(this.headGroup);

    // Apply color styling if using default procedural shapes
    if (this.isSilhouette) {
      this.applySilhouette();
    } else if (!this.outfit) {
      this.applyOutfitColors(outfitColor, pantColor);
    }

    // Initialize Secondary Motion for props and cloth
    if (this.handPropSprite) {
      const isChicken = this.outfit?.id === "chickenChor";
      const isBags = this.outfit?.id === "eidMarketChor";
      this.secondaryMotion.register(this.handPropSprite, {
        stiffness: isChicken ? 0.35 : 0.18,
        damping: isChicken ? 0.6 : 0.82,
        oscillationFreq: isChicken ? 14 : isBags ? 7 : 8,
        oscillationAmp: isChicken ? 0.28 : isBags ? 0.18 : 0.08,
      });
    }

    if (this.backPropSprite) {
      this.secondaryMotion.register(this.backPropSprite, {
        stiffness: 0.14,
        damping: 0.78,
        oscillationFreq: 6,
        oscillationAmp: 0.1,
      });
    }

    if (this.maskLowerSprite) {
      this.secondaryMotion.register(this.maskLowerSprite, {
        stiffness: 0.22,
        damping: 0.85,
        oscillationFreq: 9,
        oscillationAmp: 0.05,
      });
    }
  }

  public updateHealth(hpPercent: number) {
    if (this.stateName === "DEAD") return;

    // At 66% HP: mask slips down
    if (hpPercent <= 0.66 && !this.maskSlipped && this.maskLowerSprite) {
      this.maskSlipped = true;
      this.scene.tweens.add({
        targets: this.maskLowerSprite,
        y: 26, // Slips down revealing mouth
        angle: 4,
        duration: 260,
        ease: "Bounce.Out",
      });
      // Momentary sweat/alarm
      this.propTears.setVisible(true);
      this.scene.time.delayedCall(700, () => {
        if (this.stateName !== "DEAD") {
          this.propTears.setVisible(false);
        }
      });
    }

    // At 33% HP: mask flies completely off in a parabolic arc
    if (hpPercent <= 0.33 && !this.maskFallen && this.maskLowerSprite) {
      this.maskFallen = true;
      const mask = this.maskLowerSprite;
      this.scene.tweens.add({
        targets: mask,
        x: mask.x + 90,
        y: mask.y - 120,
        rotation: 4.5,
        alpha: 0,
        duration: 650,
        ease: "Quad.Out",
        onComplete: () => {
          mask.setVisible(false);
        },
      });

      // Exposed face shock reaction
      this.propShockedEyes.setVisible(true);
      this.expressionSprite.setVisible(true);
      this.scene.time.delayedCall(1200, () => {
        if (this.stateName !== "DEAD") {
          this.propShockedEyes.setVisible(false);
          this.expressionSprite.setVisible(false);
        }
      });
    }
  }

  public applyOutfitColors(outfit: number, pants: number) {
    this.torsoSprite.setTint(outfit);
    this.backArmUpper.setTint(outfit);
    this.frontArmUpper.setTint(outfit);
    this.backLegThigh.setTint(pants);
    this.frontLegThigh.setTint(pants);
    this.backLegShin.setTint(pants);
    this.frontLegShin.setTint(pants);
  }

  public applySilhouette() {
    const silhouetteColor = 0x0f172a;
    this.torsoSprite.setTint(silhouetteColor);
    this.backArmUpper.setTint(silhouetteColor);
    this.backArmLower.setTint(silhouetteColor);
    this.backHand.setTint(silhouetteColor);
    this.frontArmUpper.setTint(silhouetteColor);
    this.frontArmLower.setTint(silhouetteColor);
    this.frontHand.setTint(silhouetteColor);
    this.backLegThigh.setTint(silhouetteColor);
    this.backLegShin.setTint(silhouetteColor);
    this.backFoot.setTint(silhouetteColor);
    this.frontLegThigh.setTint(silhouetteColor);
    this.frontLegShin.setTint(silhouetteColor);
    this.frontFoot.setTint(silhouetteColor);
    this.faceSprite.setTint(0x1e293b);
  }

  public setFaceTexture(key: string) {
    if (this.scene.textures.exists(key)) {
      this.faceKey = key;
      this.faceSprite.setTexture(key).setDisplaySize(68, 68);
    }
  }

  public triggerHitStun(knockbackX: number = 40, isCrit: boolean = false) {
    if (this.stateName === "DEAD") return;

    this.isHitStunned = true;
    this.stateName = "HIT_STUN";

    // Hit-Stop Flash: red fill on parts
    const flashColor = 0xff0000;
    this.torsoSprite.setTint(flashColor);
    this.faceSprite.setTint(flashColor);
    this.expressionSprite.setVisible(true);

    // Show comic popped eyes or band-aid on big hit
    if (isCrit || knockbackX >= 30) {
      this.propShockedEyes.setVisible(true);
      this.propBandAid.setVisible(true);
      this.scene.time.delayedCall(450, () => {
        if (this.stateName !== "DEAD") {
          this.propShockedEyes.setVisible(false);
          this.scene.time.delayedCall(1200, () => {
            if (this.stateName !== "DEAD") {
              this.propBandAid.setVisible(false);
            }
          });
        }
      });
    }

    // Shock scale on Face
    this.scene.tweens.add({
      targets: this.faceSprite,
      scaleX: 1.35,
      scaleY: 1.35,
      ease: "Back.Out",
      duration: 120,
      yoyo: true,
      onComplete: () => {
        this.faceSprite.setDisplaySize(68, 68);
      },
    });

    // Knockback
    const targetX = this.x + knockbackX;
    this.secondaryMotion.applyImpulse(knockbackX * 0.4, -18, isCrit ? 0.35 : 0.15);
    this.scene.tweens.add({
      targets: this,
      x: targetX,
      ease: "Quad.Out",
      duration: 180,
    });

    // Recover after 160 ms
    this.scene.time.delayedCall(160, () => {
      this.torsoSprite.clearTint();
      this.faceSprite.clearTint();
      this.expressionSprite.setVisible(false);
      this.isHitStunned = false;
      this.stateName = "RUN";
    });
  }

  public triggerDead(onComplete?: () => void) {
    if (this.stateName === "DEAD") return;
    this.stateName = "DEAD";
    this.expressionSprite.setVisible(true);
    this.propShockedEyes.setVisible(true);
    this.propBandAid.setVisible(true);
    this.propDizzyStars.setVisible(true);

    // Spin dizzy stars around dead head
    this.scene.tweens.add({
      targets: this.propDizzyStars,
      rotation: Math.PI * 6,
      duration: 1200,
      repeat: -1,
    });

    this.scene.tweens.add({
      targets: this,
      rotation: 1.57,
      y: this.y + 35,
      x: this.x + 60,
      alpha: 0.9,
      duration: 600,
      ease: "Bounce.Out",
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });
  }

  public triggerTrip(durationMs: number = 1600) {
    if (this.stateName === "DEAD" || this.stateName === "TRIPPED") return;
    this.stateName = "TRIPPED";

    this.scene.tweens.add({
      targets: this,
      rotation: 1.3,
      y: this.y + 20,
      duration: 150,
      ease: "Quad.Out",
    });

    this.expressionSprite.setVisible(true);

    // Comic Spinning Dizzy Stars orbiting above head during trip
    this.propDizzyStars.setVisible(true);
    this.propDizzyStars.rotation = 0;
    this.scene.tweens.add({
      targets: this.propDizzyStars,
      rotation: Math.PI * 4,
      duration: durationMs,
      ease: "Linear",
      onComplete: () => {
        if (this.stateName !== "DEAD") {
          this.propDizzyStars.setVisible(false);
          this.propDizzyStars.rotation = 0;
        }
      },
    });

    this.scene.time.delayedCall(durationMs, () => {
      if (this.stateName === "DEAD") return;
      this.scene.tweens.add({
        targets: this,
        rotation: 0,
        y: this.y - 20,
        duration: 200,
        ease: "Back.Out",
        onComplete: () => {
          this.expressionSprite.setVisible(false);
          this.stateName = "RUN";
        },
      });
    });
  }

  public triggerAttack(type: "slap" | "punch" | "kick" | "throw") {
    this.attackTimer = 250; // ms
    if (type === "kick") {
      this.frontLegGroup.rotation = -1.2;
    } else if (type === "slap" || type === "punch") {
      this.frontArmGroup.rotation = -1.4;
      this.frontArmLowerGroup.rotation = -0.8;
    } else {
      // Throw
      this.frontArmGroup.rotation = 1.2;
    }
  }

  public update(time: number, delta: number) {
    if (this.stateName === "DEAD" || this.isHitStunned) return;

    if (this.attackTimer > 0) {
      this.attackTimer -= delta;
      return;
    }

    // Dynamic Run Style
    const cadence = this.archetype?.runStyle?.cadence ?? 1.6;
    const armSwing = this.archetype?.runStyle?.armSwing ?? 0.8;
    const hunch = this.archetype?.runStyle?.hunch ?? 0;
    const bounce = this.archetype?.runStyle?.bounce ?? 6;

    const t = time * 0.001 * this.runSpeedFactor * 2 * Math.PI * cadence;

    this.frontLegGroup.rotation = Math.sin(t) * 0.9;
    this.frontLegShinGroup.rotation = Math.max(0, -Math.sin(t + 0.6)) * 1.1;

    this.backLegGroup.rotation = Math.sin(t + Math.PI) * 0.9;
    this.backLegShinGroup.rotation = Math.max(0, -Math.sin(t + Math.PI + 0.6)) * 1.1;

    this.frontArmGroup.rotation = Math.sin(t + Math.PI) * armSwing;
    this.backArmGroup.rotation = Math.sin(t) * armSwing;

    // Torso vertical bounce and posture hunch
    this.torsoSprite.y = -55 + Math.abs(Math.sin(t)) * -bounce;
    this.torsoSprite.rotation = hunch;

    // Head wobble & secondary motion lag
    this.headGroup.rotation = hunch + Math.sin(t * 2) * 0.08;
    this.headGroup.y = -90 + (this.torsoSprite.y + 55) + Math.sin(t * 2 + 0.5) * 2;

    // Update Secondary Motion (cloth fluttering & prop spring bounce)
    this.secondaryMotion.update(time, delta, this.runSpeedFactor * 120);
  }
}
