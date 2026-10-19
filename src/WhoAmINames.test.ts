beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
  vi.spyOn(Math, 'random').mockReturnValue(0);
});

afterEach(() => vi.restoreAllMocks());

test('shares history across card visits and reloads until the whole pool is used', async () => {
  let names = await import('./WhoAmINames');
  const drawn: string[] = [];
  for (let i = 0; i < names.WHO_AM_I_NAMES.length; i++) {
    // A fresh module simulates reloading the page; a new picker simulates revisiting a card.
    vi.resetModules();
    names = await import('./WhoAmINames');
    drawn.push(names.createIdentityPicker()());
  }
  expect(new Set(drawn)).toEqual(new Set(names.WHO_AM_I_NAMES));
  const last = drawn[drawn.length - 1];
  vi.spyOn(Math, 'random').mockReturnValue(0.99999);
  vi.resetModules();
  names = await import('./WhoAmINames');
  expect(names.createIdentityPicker()()).not.toBe(last);
});

test('existing pickers read the latest shared history on every draw', async () => {
  const {createIdentityPicker} = await import('./WhoAmINames');
  const first = createIdentityPicker();
  const second = createIdentityPicker();
  expect(new Set([first(), second(), first(), second()]).size).toBe(4);
});

test.each(['{broken', 'null', '{"seen":42}', '{"seen":[null,42,"Removed identity","Beyoncé"]}'])(
  'recovers safely from invalid or outdated history: %s', async raw => {
    const {createIdentityPicker, IDENTITY_HISTORY_KEY, WHO_AM_I_NAMES} = await import('./WhoAmINames');
    localStorage.setItem(IDENTITY_HISTORY_KEY, raw);
    const name = createIdentityPicker()();
    expect(WHO_AM_I_NAMES).toContain(name);
    if (raw.includes('Beyoncé')) expect(name).not.toBe('Beyoncé');
    expect(JSON.parse(localStorage.getItem(IDENTITY_HISTORY_KEY)!).seen).toContain(name);
  });

test('new identities remain available when an older pool has been exhausted', async () => {
  const {createIdentityPicker, IDENTITY_HISTORY_KEY, WHO_AM_I_NAMES} = await import('./WhoAmINames');
  localStorage.setItem(IDENTITY_HISTORY_KEY, JSON.stringify({seen: WHO_AM_I_NAMES.slice(1)}));
  expect(createIdentityPicker()()).toBe(WHO_AM_I_NAMES[0]);
});

test.each(['getItem', 'setItem'] as const)('keeps playing without repeats when %s fails', async method => {
  const {createIdentityPicker, WHO_AM_I_NAMES} = await import('./WhoAmINames');
  const first = createIdentityPicker()();
  const storageCall = vi.spyOn(window.localStorage, method).mockImplementation(() => { throw new Error('Storage unavailable'); });
  const rest = Array.from({length: WHO_AM_I_NAMES.length - 1}, () => createIdentityPicker()());
  expect(storageCall).toHaveBeenCalled();
  expect(new Set([first, ...rest])).toEqual(new Set(WHO_AM_I_NAMES));
});
