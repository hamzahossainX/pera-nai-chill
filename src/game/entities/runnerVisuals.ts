import type Phaser from "phaser";
import { RUNNER_VISUALS as RV } from "@/config/characterVisuals";
type Sprite = Phaser.GameObjects.Sprite;
type Container = Phaser.GameObjects.Container;
type Limb = [Container, Sprite, Container, Sprite, Sprite, number];

/** Normalize only the refreshed outfits; legacy costumes keep their own rig. */
export function configureRunnerVisuals(parts: {
  torso: Sprite; head: Container; neck?: Sprite; headBack?: Sprite;
  headFront?: Sprite; shadow: Sprite; phone?: Sprite; arms: Limb[]; legs: Limb[];
}) {
  parts.torso.setPosition(0, RV.torso.y).setDisplaySize(RV.torso.width, RV.torso.height);
  parts.head.setPosition(0, RV.head.y).setScale(1);
  parts.headBack?.setDisplaySize(RV.head.width, RV.head.height);
  parts.headFront?.setDisplaySize(RV.head.width, RV.head.height);
  parts.neck?.setPosition(0, RV.neck.y).setDisplaySize(RV.neck.width, RV.neck.height);
  parts.shadow.setDisplaySize(RV.shadow.width, RV.shadow.height);
  for (const [group, upper, lowerGroup, lower, hand, side] of parts.arms) {
    group.setPosition(side * RV.shoulder.x, RV.shoulder.y).setScale(1);
    upper.setPosition(0, 0).setOrigin(0.5, 0.12).setDisplaySize(RV.upperArm.width, RV.upperArm.height);
    lowerGroup.setPosition(0, RV.elbow);
    lower.setPosition(0, 0).setOrigin(0.5, 0.12).setDisplaySize(RV.lowerArm.width, RV.lowerArm.height);
    hand.setPosition(0, RV.hand.y).setDisplaySize(RV.hand.width, RV.hand.height);
  }
  for (const [group, thigh, knee, shin, foot, side] of parts.legs) {
    group.setPosition(side * RV.hip.x, RV.hip.y).setScale(1);
    thigh.setPosition(0, 0).setOrigin(0.5, 0.12).setDisplaySize(RV.thigh.width, RV.thigh.height);
    knee.setPosition(0, RV.knee);
    shin.setPosition(0, 0).setOrigin(0.5, 0.12).setDisplaySize(RV.shin.width, RV.shin.height);
    foot.setPosition(5, RV.foot.y).setDisplaySize(RV.foot.width, RV.foot.height);
  }
  parts.phone?.setPosition(6, RV.hand.y).setDisplaySize(RV.phone.width, RV.phone.height);
}
