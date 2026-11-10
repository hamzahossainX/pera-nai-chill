import Phaser from "phaser";

export interface RigOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  isSilhouette?: boolean;
  faceKey?: string;
  outfitColor?: number;
  pantColor?: number;
  scale?: number;
}

export class CharacterRig extends Phaser.GameObjects.Container {
  public isSilhouette: boolean;
  public faceKey: string;

  // Rig Components
  private shadowSprite!: Phaser.GameObjects.Sprite;
  private torsoSprite!: Phaser.GameObjects.Sprite;
  private headGroup!: Phaser.GameObjects.Container;
  private faceSprite!: Phaser.GameObjects.Sprite;
  private expressionSprite!: Phaser.GameObjects.Sprite;

  // Limbs
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

  // State
  public stateName: "RUN" | "HIT_STUN" | "DEAD" | "ATTACK" = "RUN";
  public runSpeedFactor = 1.0;
  private isHitStunned = false;
  private attackTimer = 0;

  constructor(options: RigOptions) {
    super(options.scene, options.x, options.y);
    this.isSilhouette = options.isSilhouette ?? false;
    this.faceKey = options.faceKey ?? "target-face";

    this.scene.add.existing(this);
    this.setScale(options.scale ?? 1.0);

    this.buildHierarchy(options.outfitColor ?? 0xffffff, options.pantColor ?? 0x1e293b);
  }

  private buildHierarchy(outfitColor: number, pantColor: number) {
    // 1. Shadow (at ground origin)
    this.shadowSprite = this.scene.add
      .sprite(0, 10, "rig-shadow")
      .setOrigin(0.5, 0.5);
    this.add(this.shadowSprite);

    // 2. Back Arm
    this.backArmGroup = this.scene.add.container(-10, -65);
    this.backArmUpper = this.scene.add
      .sprite(0, 12, "rig-limb-upper")
      .setOrigin(0.5, 0.2);
    this.backArmLowerGroup = this.scene.add.container(0, 22);
    this.backArmLower = this.scene.add
      .sprite(0, 10, "rig-limb-lower")
      .setOrigin(0.5, 0.2);
    this.backHand = this.scene.add
      .sprite(0, 22, "rig-hand")
      .setOrigin(0.5, 0.5);

    this.backArmLowerGroup.add([this.backArmLower, this.backHand]);
    this.backArmGroup.add([this.backArmUpper, this.backArmLowerGroup]);
    this.add(this.backArmGroup);

    // 3. Back Leg
    this.backLegGroup = this.scene.add.container(-6, -30);
    this.backLegThigh = this.scene.add
      .sprite(0, 12, "rig-limb-upper")
      .setOrigin(0.5, 0.2);
    this.backLegShinGroup = this.scene.add.container(0, 24);
    this.backLegShin = this.scene.add
      .sprite(0, 10, "rig-limb-lower")
      .setOrigin(0.5, 0.2);
    this.backFoot = this.scene.add
      .sprite(4, 22, "rig-foot")
      .setOrigin(0.5, 0.5);

    this.backLegShinGroup.add([this.backLegShin, this.backFoot]);
    this.backLegGroup.add([this.backLegThigh, this.backLegShinGroup]);
    this.add(this.backLegGroup);

    // 4. Torso
    this.torsoSprite = this.scene.add
      .sprite(0, -55, "rig-torso")
      .setOrigin(0.5, 0.5);
    this.add(this.torsoSprite);

    // 5. Front Leg
    this.frontLegGroup = this.scene.add.container(6, -30);
    this.frontLegThigh = this.scene.add
      .sprite(0, 12, "rig-limb-upper")
      .setOrigin(0.5, 0.2);
    this.frontLegShinGroup = this.scene.add.container(0, 24);
    this.frontLegShin = this.scene.add
      .sprite(0, 10, "rig-limb-lower")
      .setOrigin(0.5, 0.2);
    this.frontFoot = this.scene.add
      .sprite(4, 22, "rig-foot")
      .setOrigin(0.5, 0.5);

    this.frontLegShinGroup.add([this.frontLegShin, this.frontFoot]);
    this.frontLegGroup.add([this.frontLegThigh, this.frontLegShinGroup]);
    this.add(this.frontLegGroup);

    // 6. Front Arm
    this.frontArmGroup = this.scene.add.container(10, -65);
    this.frontArmUpper = this.scene.add
      .sprite(0, 12, "rig-limb-upper")
      .setOrigin(0.5, 0.2);
    this.frontArmLowerGroup = this.scene.add.container(0, 22);
    this.frontArmLower = this.scene.add
      .sprite(0, 10, "rig-limb-lower")
      .setOrigin(0.5, 0.2);
    this.frontHand = this.scene.add
      .sprite(0, 22, "rig-hand")
      .setOrigin(0.5, 0.5);

    this.frontArmLowerGroup.add([this.frontArmLower, this.frontHand]);
    this.frontArmGroup.add([this.frontArmUpper, this.frontArmLowerGroup]);
    this.add(this.frontArmGroup);

    // 7. Head Group (Head Container)
    this.headGroup = this.scene.add.container(0, -90);

    // Face Sprite (Uploaded target face texture or placeholder)
    const effectiveFaceKey = this.scene.textures.exists(this.faceKey)
      ? this.faceKey
      : "particle-star";

    this.faceSprite = this.scene.add
      .sprite(0, 0, effectiveFaceKey)
      .setOrigin(0.5, 0.5)
      .setDisplaySize(72, 72);

    this.expressionSprite = this.scene.add
      .sprite(0, 0, "rig-expression-shock")
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    this.headGroup.add([this.faceSprite, this.expressionSprite]);
    this.add(this.headGroup);

    // Apply color styling
    if (this.isSilhouette) {
      this.applySilhouette();
    } else {
      this.applyOutfitColors(outfitColor, pantColor);
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
      this.faceSprite.setTexture(key).setDisplaySize(72, 72);
    }
  }

  public triggerHitStun(knockbackX: number = 40) {
    if (this.stateName === "DEAD") return;

    this.isHitStunned = true;
    this.stateName = "HIT_STUN";

    // Hit-Stop Flash: red fill on parts
    const flashColor = 0xff0000;
    this.torsoSprite.setTint(flashColor);
    this.faceSprite.setTint(flashColor);
    this.expressionSprite.setVisible(true);

    // Shock scale on Face
    this.scene.tweens.add({
      targets: this.faceSprite,
      scaleX: 1.35,
      scaleY: 1.35,
      ease: "Back.Out",
      duration: 120,
      yoyo: true,
      onComplete: () => {
        this.faceSprite.setDisplaySize(72, 72);
      },
    });

    // Knockback
    const targetX = this.x + knockbackX;
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

    // Procedural run cycle math (Section 6.2)
    const cadence = 1.6;
    const t = time * 0.001 * this.runSpeedFactor * 2 * Math.PI * cadence;

    this.frontLegGroup.rotation = Math.sin(t) * 0.9;
    this.frontLegShinGroup.rotation = Math.max(0, -Math.sin(t + 0.6)) * 1.1;

    this.backLegGroup.rotation = Math.sin(t + Math.PI) * 0.9;
    this.backLegShinGroup.rotation = Math.max(0, -Math.sin(t + Math.PI + 0.6)) * 1.1;

    this.frontArmGroup.rotation = Math.sin(t + Math.PI) * 0.8;
    this.backArmGroup.rotation = Math.sin(t) * 0.8;

    // Torso vertical bounce
    this.torsoSprite.y = -55 + Math.abs(Math.sin(t)) * -6;

    // Head wobble & secondary motion lag
    this.headGroup.rotation = Math.sin(t * 2) * 0.08;
    this.headGroup.y = -90 + (this.torsoSprite.y + 55) + Math.sin(t * 2 + 0.5) * 2;
  }
}
