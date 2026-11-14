import { ControlSource, InputCommand, CommandListener } from "./ControlSource";

interface QueuedCommand {
  delayMs: number;
  command: InputCommand;
}

export class BotSource implements ControlSource {
  private listeners: Set<CommandListener> = new Set();
  private queue: QueuedCommand[] = [];

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

  public queueCommand(delayMs: number, command: InputCommand): void {
    this.queue.push({ delayMs, command });
  }

  public update(deltaMs: number): void {
    if (this.queue.length === 0) return;

    for (let i = this.queue.length - 1; i >= 0; i--) {
      this.queue[i].delayMs -= deltaMs;
      if (this.queue[i].delayMs <= 0) {
        const item = this.queue.splice(i, 1)[0];
        this.emit(item.command);
      }
    }
  }

  public clearQueue(): void {
    this.queue = [];
  }

  public destroy(): void {
    this.listeners.clear();
    this.queue = [];
  }
}
