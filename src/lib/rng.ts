/**
 * Seedable random number generator wrapping/matching Phaser's Alea RandomDataGenerator.
 * Supports seeded determinism via ?seed=N or explicit seed.
 */

export class SeededRNG {
  private s0 = 0;
  private s1 = 0;
  private s2 = 0;
  private c = 1;
  private n = 0;
  private currentSeed: string = "default";

  constructor(seed?: string | number) {
    this.init(seed);
  }

  public init(seed?: string | number): void {
    let s = "1234";
    if (seed !== undefined) {
      s = String(seed);
    } else if (typeof window !== "undefined") {
      const paramSeed = new URLSearchParams(window.location.search).get("seed");
      if (paramSeed) s = paramSeed;
    }
    this.currentSeed = s;
    this.sow([s]);
  }

  public getSeed(): string {
    return this.currentSeed;
  }

  private hash(data: string): number {
    let n = this.n;
    data = data.toString();
    for (let i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      let h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000;
    }
    this.n = n;
    return (n >>> 0) * 2.3283064365386963e-10;
  }

  private sow(seeds: string[]): void {
    this.n = 0xefc8249d;
    this.s0 = this.hash(" ");
    this.s1 = this.hash(" ");
    this.s2 = this.hash(" ");
    this.c = 1;

    for (let i = 0; i < seeds.length && seeds[i] != null; i++) {
      const seed = seeds[i];
      this.s0 -= this.hash(seed);
      this.s0 += ~~(this.s0 < 0);
      this.s1 -= this.hash(seed);
      this.s1 += ~~(this.s1 < 0);
      this.s2 -= this.hash(seed);
      this.s2 += ~~(this.s2 < 0);
    }
  }

  private rnd(): number {
    const t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10;
    this.c = t | 0;
    this.s0 = this.s1;
    this.s1 = this.s2;
    this.s2 = t - this.c;
    return this.s2;
  }

  /**
   * Returns a random float in [0, 1)
   */
  public next(): number {
    return this.rnd() + ((this.rnd() * 0x200000) | 0) * 1.1102230246251565e-16;
  }

  /**
   * Returns true with probability p (0..1)
   */
  public chance(p: number): boolean {
    return this.next() < p;
  }

  /**
   * Returns a random element from arr
   */
  public pick<T>(arr: readonly T[] | T[]): T {
    if (!arr || arr.length === 0) {
      throw new Error("rng.pick called on empty array");
    }
    const idx = Math.floor(this.next() * arr.length);
    return arr[Math.min(idx, arr.length - 1)];
  }

  /**
   * Returns a random float in [a, b)
   */
  public range(a: number, b: number): number {
    return a + this.next() * (b - a);
  }

  /**
   * Returns a random integer in [min, max]
   */
  public between(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
}

export const rng = new SeededRNG();
