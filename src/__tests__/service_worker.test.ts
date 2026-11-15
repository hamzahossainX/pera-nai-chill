import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";

/**
 * public/sw.js is a plain script, so it is run here in a sandbox with a fake
 * `caches`, `fetch` and `self`, and its event handlers are driven directly.
 *
 * What these protect: only content-hashed build output may be answered from the
 * cache without asking the network. The previous worker answered everything from
 * the cache first, so after a deploy it served OLD HTML whose script URLs no
 * longer exist (the page showed its splash but never started) and served old art
 * for one load.
 */

const ORIGIN = "https://game.test";
const SOURCE = readFileSync(path.resolve(import.meta.dirname, "../../public/sw.js"), "utf8");

interface WorkerEvent {
  request?: Req;
  waitUntil: (p: Promise<unknown>) => void;
  respondWith: (p: Promise<Response>) => void;
}
type Handler = (event: WorkerEvent) => void;
interface Req {
  url: string;
  method: string;
  mode: string;
}

const req = (p: string, init: Partial<Req> = {}): Req => ({
  url: p.startsWith("http") ? p : ORIGIN + p,
  method: "GET",
  mode: "no-cors",
  ...init,
});

function boot(opts: { network?: (r: Req) => Promise<Response>; clients?: { navigate: (u: string) => Promise<unknown>; url: string }[] } = {}) {
  const handlers: Record<string, Handler> = {};
  const store = new Map<string, Map<string, Response>>();
  const fetched: string[] = [];
  const navigated: string[] = [];

  const cacheApi = (name: string) => {
    if (!store.has(name)) store.set(name, new Map());
    const entries = store.get(name)!;
    return {
      add: async (p: string) => {
        entries.set(ORIGIN + p, await sandbox.fetch(req(p)));
      },
      put: async (r: Req, res: Response) => void entries.set(r.url, res),
    };
  };

  const sandbox: Record<string, unknown> & { fetch: (r: Req) => Promise<Response> } = {
    URL,
    Response,
    Promise,
    fetch: async (r: Req) => {
      fetched.push(new URL(r.url).pathname);
      if (opts.network) return opts.network(r);
      return new Response(`network:${new URL(r.url).pathname}`);
    },
    caches: {
      open: async (name: string) => cacheApi(name),
      keys: async () => [...store.keys()],
      delete: async (name: string) => store.delete(name),
      match: async (r: Req | string) => {
        const url = typeof r === "string" ? ORIGIN + r : r.url;
        for (const entries of store.values()) if (entries.has(url)) return entries.get(url)!.clone();
        return undefined;
      },
    },
    self: {
      location: { origin: ORIGIN },
      skipWaiting: () => {},
      addEventListener: (type: string, fn: Handler) => void (handlers[type] = fn),
      clients: {
        claim: async () => {},
        matchAll: async () =>
          (opts.clients ?? []).map((c) => ({
            url: c.url,
            navigate: async (u: string) => {
              navigated.push(u);
              return c.navigate(u);
            },
          })),
      },
    },
  };
  vm.runInNewContext(SOURCE, sandbox);

  const waiting: Promise<unknown>[] = [];
  const dispatch = async (type: string, extra: { request?: Req } = {}) => {
    let responded: Promise<Response> | undefined;
    handlers[type]({
      ...extra,
      waitUntil: (p: Promise<unknown>) => void waiting.push(p),
      respondWith: (p: Promise<Response>) => void (responded = p),
    });
    const response = responded ? await responded : undefined;
    await Promise.all(waiting.splice(0));
    return response;
  };

  return {
    store,
    fetched,
    navigated,
    install: () => dispatch("install"),
    activate: () => dispatch("activate"),
    fetchEvent: (r: Req) => dispatch("fetch", { request: r }),
    seed: (name: string, p: string, body: string) => {
      if (!store.has(name)) store.set(name, new Map());
      store.get(name)!.set(ORIGIN + p, new Response(body));
    },
  };
}

const text = async (r: Response | undefined) => (r ? r.text() : undefined);

describe("service worker", () => {
  it("uses a cache name that is not the old one, so old caches get dropped", () => {
    expect(SOURCE).toContain('"pernaichill-v2"');
  });

  describe("hashed build output (/_next/static/) is cache-first", () => {
    it("answers from the cache without touching the network", async () => {
      const sw = boot();
      sw.seed("pernaichill-v2", "/_next/static/chunks/abc.js", "cached-chunk");
      expect(await text(await sw.fetchEvent(req("/_next/static/chunks/abc.js")))).toBe("cached-chunk");
      expect(sw.fetched).toEqual([]);
    });

    it("also covers the /immutable/ layout used on Vercel", async () => {
      const sw = boot();
      sw.seed("pernaichill-v2", "/_next/static/immutable/chunks/abc.js", "cached-chunk");
      expect(await text(await sw.fetchEvent(req("/_next/static/immutable/chunks/abc.js")))).toBe("cached-chunk");
      expect(sw.fetched).toEqual([]);
    });

    it("fetches and remembers a chunk it has not seen yet", async () => {
      const sw = boot();
      expect(await text(await sw.fetchEvent(req("/_next/static/chunks/new.js")))).toBe("network:/_next/static/chunks/new.js");
      expect(await text(await sw.fetchEvent(req("/_next/static/chunks/new.js")))).toBe("network:/_next/static/chunks/new.js");
      expect(sw.fetched).toEqual(["/_next/static/chunks/new.js"]); // the second answer came from the cache
    });
  });

  describe("everything else is network-first, so a deploy shows on the next load", () => {
    it("serves fresh HTML even when stale HTML is cached", async () => {
      const sw = boot();
      sw.seed("pernaichill-v2", "/", "STALE html from the previous deploy");
      expect(await text(await sw.fetchEvent(req("/", { mode: "navigate" })))).toBe("network:/");
    });

    it("serves a file updated in place fresh on the first load", async () => {
      const sw = boot();
      sw.seed("pernaichill-v2", "/assets/characters/phoneSnatcher/torso.svg", "OLD art");
      expect(await text(await sw.fetchEvent(req("/assets/characters/phoneSnatcher/torso.svg")))).toBe(
        "network:/assets/characters/phoneSnatcher/torso.svg"
      );
    });

    it("keeps the latest good copy for offline use", async () => {
      let online = true;
      const sw = boot({
        network: async (r) => {
          if (!online) throw new TypeError("offline");
          return new Response(`v1:${new URL(r.url).pathname}`);
        },
      });
      await sw.fetchEvent(req("/assets/a.svg"));
      online = false;
      expect(await text(await sw.fetchEvent(req("/assets/a.svg")))).toBe("v1:/assets/a.svg");
    });

    it("falls back to the cached page for a navigation while offline", async () => {
      const sw = boot({ network: async () => Promise.reject(new TypeError("offline")) });
      sw.seed("pernaichill-v2", "/", "cached shell");
      expect(await text(await sw.fetchEvent(req("/anything", { mode: "navigate" })))).toBe("cached shell");
    });

    it("does not cache partial (206) responses", async () => {
      const sw = boot({ network: async () => new Response("part", { status: 206 }) });
      await sw.fetchEvent(req("/audio/track.mp3"));
      expect(sw.store.get("pernaichill-v2")?.has(ORIGIN + "/audio/track.mp3") ?? false).toBe(false);
    });
  });

  describe("what it leaves alone", () => {
    it("ignores non-GET requests", async () => {
      const sw = boot();
      expect(await sw.fetchEvent(req("/api/x", { method: "POST" }))).toBeUndefined();
    });

    it("ignores cross-origin requests such as the MediaPipe wasm and model", async () => {
      const sw = boot();
      expect(await sw.fetchEvent(req("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm/x.wasm"))).toBeUndefined();
      expect(sw.fetched).toEqual([]);
    });
  });

  describe("lifecycle", () => {
    it("precaches the shell without failing when one file is missing", async () => {
      const sw = boot({
        network: async (r) => (r.url.endsWith("/icon-192.svg") ? Promise.reject(new Error("404")) : new Response("ok")),
      });
      await sw.install();
      const cached = [...(sw.store.get("pernaichill-v2")?.keys() ?? [])];
      expect(cached).toContain(ORIGIN + "/");
      expect(cached).not.toContain(ORIGIN + "/icon-192.svg");
    });

    it("on upgrade deletes the older caches and reloads the open pages once", async () => {
      const sw = boot({ clients: [{ url: ORIGIN + "/", navigate: async () => undefined }] });
      sw.seed("pernaichill-v1", "/", "stale html");
      await sw.activate();
      expect([...sw.store.keys()]).not.toContain("pernaichill-v1");
      expect(sw.navigated).toEqual([ORIGIN + "/"]);
    });

    it("does not reload pages on a first install (nothing stale to replace)", async () => {
      const sw = boot({ clients: [{ url: ORIGIN + "/", navigate: async () => undefined }] });
      await sw.activate();
      expect(sw.navigated).toEqual([]);
    });
  });
});
