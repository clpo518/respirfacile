type StorageKind = "localStorage" | "sessionStorage";

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

function resolveStorage(kind: StorageKind): Storage {
  if (typeof window === "undefined") {
    return createMemoryStorage();
  }

  try {
    const storage = window[kind];
    const probeKey = `__pmv_${kind}_probe__`;
    storage.setItem(probeKey, "1");
    storage.removeItem(probeKey);
    return storage;
  } catch {
    return createMemoryStorage();
  }
}

export function installStorageFallbacks() {
  if (typeof window === "undefined") return;

  const safeLocalStorage = resolveStorage("localStorage");
  const safeSessionStorage = resolveStorage("sessionStorage");

  try {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: safeLocalStorage,
    });
  } catch {}

  try {
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      value: safeSessionStorage,
    });
  } catch {}
}
