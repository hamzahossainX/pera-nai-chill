import type Phaser from "phaser";
import { ControlSource, InputCommand, CommandListener } from "./ControlSource";
import { gameBus } from "@/game/bus";

export class KeyboardTouchSource implements ControlSource {
  private listeners: Set<CommandListener> = new Set();
  private scene?: Phaser.Scene;

  private onKeyDownBound?: (e: KeyboardEvent) => void;
  private onPointerDownBound?: (pointer: Phaser.Input.Pointer) => void;
  private onPointerUpBound?: (pointer: Phaser.Input.Pointer) => void;
  private onBusCommandBound?: (data: { command: InputCommand }) => void;

  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;

  constructor(scene?: Phaser.Scene) {
    this.scene = scene;
    this.setupKeyboard();
    this.setupTouch();
    this.setupBus();
  }

  public onCommand(listener: CommandListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public emit(command: InputCommand): void {
    const enriched: InputCommand = {
      ...command,
      timestamp: command.timestamp ?? Date.now(),
    };
    for (const listener of this.listeners) {
      listener(enriched);
    }
  }

  private setupKeyboard(): void {
    if (typeof window === "undefined") return;

    this.onKeyDownBound = (e: KeyboardEvent) => {
      // Don't capture keys if typing in an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          e.preventDefault();
          this.emit({ type: "LANE_UP" });
          break;
        case "ArrowDown":
        case "KeyS":
          e.preventDefault();
          this.emit({ type: "LANE_DOWN" });
          break;
        case "Space":
          e.preventDefault();
          this.emit({ type: "JUMP" });
          break;
        case "ShiftLeft":
        case "ShiftRight":
          e.preventDefault();
          this.emit({ type: "DASH" });
          break;
        case "Digit1":
          this.emit({ type: "ATTACK", weaponId: "slap" });
          break;
        case "Digit2":
          this.emit({ type: "ATTACK", weaponId: "punch" });
          break;
        case "Digit3":
          this.emit({ type: "ATTACK", weaponId: "kick" });
          break;
        case "Digit4":
          this.emit({ type: "ATTACK", weaponId: "chappal" });
          break;
        case "KeyE":
          this.emit({ type: "ULTIMATE" });
          break;
        case "KeyT":
          this.emit({ type: "TAUNT" });
          break;
      }
    };

    window.addEventListener("keydown", this.onKeyDownBound);
  }

  private setupTouch(): void {
    if (!this.scene || !this.scene.input) return;

    this.onPointerDownBound = (pointer: Phaser.Input.Pointer) => {
      this.touchStartX = pointer.x;
      this.touchStartY = pointer.y;
      this.touchStartTime = Date.now();
    };

    this.onPointerUpBound = (pointer: Phaser.Input.Pointer) => {
      const deltaX = pointer.x - this.touchStartX;
      const deltaY = pointer.y - this.touchStartY;
      const duration = Date.now() - this.touchStartTime;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // 1. Swipe detection (fast gesture with movement > 35 px)
      if (duration < 500 && (absX > 35 || absY > 35)) {
        if (absY > absX) {
          // Vertical swipe
          if (deltaY < -35) {
            this.emit({ type: "LANE_UP" });
            return;
          } else if (deltaY > 35) {
            this.emit({ type: "LANE_DOWN" });
            return;
          }
        } else {
          // Horizontal swipe
          if (deltaX > 40) {
            this.emit({ type: "DASH" });
            return;
          }
        }
      }

      // 2. Tap detection (short tap with little movement)
      if (duration < 300 && absX < 20 && absY < 20) {
        const width = this.scene?.scale?.width ?? 1280;
        // Tap on right half triggers Jump
        if (pointer.x > width * 0.5) {
          this.emit({ type: "JUMP" });
        }
      }
    };

    this.scene.input.on("pointerdown", this.onPointerDownBound);
    this.scene.input.on("pointerup", this.onPointerUpBound);
  }

  private setupBus(): void {
    this.onBusCommandBound = (data: { command: InputCommand }) => {
      if (data && data.command) {
        this.emit(data.command);
      }
    };
    gameBus.on("input:command", this.onBusCommandBound);
  }

  public destroy(): void {
    this.listeners.clear();

    if (typeof window !== "undefined" && this.onKeyDownBound) {
      window.removeEventListener("keydown", this.onKeyDownBound);
      this.onKeyDownBound = undefined;
    }

    if (this.scene && this.scene.input) {
      if (this.onPointerDownBound) {
        this.scene.input.off("pointerdown", this.onPointerDownBound);
        this.onPointerDownBound = undefined;
      }
      if (this.onPointerUpBound) {
        this.scene.input.off("pointerup", this.onPointerUpBound);
        this.onPointerUpBound = undefined;
      }
    }

    if (this.onBusCommandBound) {
      gameBus.off("input:command", this.onBusCommandBound);
      this.onBusCommandBound = undefined;
    }
  }
}
