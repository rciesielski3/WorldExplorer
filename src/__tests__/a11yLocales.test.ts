import fs from 'fs';
import path from 'path';

const localesDir = path.join(__dirname, '../../locales');
const locales = ['en', 'es', 'fr', 'de', 'pl'];

const load = (locale: string): Record<string, string> =>
  JSON.parse(fs.readFileSync(path.join(localesDir, `${locale}.json`), 'utf-8'));

const placeholders = (value: string) => (value.match(/{{\s*\w+\s*}}/g) ?? []).sort();

describe('accessibility label translations', () => {
  const en = load('en');
  const a11yKeys = Object.keys(en).filter(key => key.startsWith('a11y'));

  it('defines accessibility keys in English', () => {
    expect(a11yKeys.length).toBeGreaterThan(0);
  });

  locales.forEach(locale => {
    it(`has non-empty a11y labels with the same placeholders in ${locale}`, () => {
      const data = load(locale);
      a11yKeys.forEach(key => {
        expect(typeof data[key]).toBe('string');
        expect(data[key].trim()).not.toBe('');
        expect(placeholders(data[key])).toEqual(placeholders(en[key]));
      });
    });
  });
});
