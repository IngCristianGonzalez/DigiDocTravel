import '@angular/compiler';

// Always ensure localStorage mock is available (jsdom opaque origin + vitest without --localstorage-file)
const createMock = () => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const k in store) delete store[k]; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] || null,
  };
};
const mock = createMock();
try {
  // Try to use jsdom's localStorage if available with url
  const test = (globalThis as any).localStorage;
  if (test && typeof test.getItem === 'function') {
    test.getItem('test');
    // jsdom localStorage works, keep it
  } else {
    throw new Error('no localStorage');
  }
} catch {
  (globalThis as any).localStorage = mock;
  if (typeof window !== 'undefined') (window as any).localStorage = mock;
}

