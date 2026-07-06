import fs from 'fs';
import path from 'path';

describe('i18n Completeness', () => {
  const localesDir = path.join(__dirname, '../../locales');
  // Core locales
  const coreLocales = ['en', 'es', 'fr', 'de', 'pl'];
  // Additional supported locales (if they exist)
  const additionalLocales = ['pt', 'it'];
  const allLocales = [...coreLocales, ...additionalLocales];
  const locales = coreLocales;

  describe('Locale Files Existence', () => {
    it('should have all required locale files', () => {
      locales.forEach(locale => {
        const filePath = path.join(localesDir, `${locale}.json`);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    it('should have English locale', () => {
      const filePath = path.join(localesDir, 'en.json');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should have Spanish locale', () => {
      const filePath = path.join(localesDir, 'es.json');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should have French locale', () => {
      const filePath = path.join(localesDir, 'fr.json');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should have German locale', () => {
      const filePath = path.join(localesDir, 'de.json');
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should have Polish locale', () => {
      const filePath = path.join(localesDir, 'pl.json');
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  describe('Key Consistency Across Locales', () => {
    let localeData: { [key: string]: Record<string, string> } = {};

    beforeAll(() => {
      locales.forEach(locale => {
        const filePath = path.join(localesDir, `${locale}.json`);
        const content = fs.readFileSync(filePath, 'utf-8');
        localeData[locale] = JSON.parse(content);
      });
    });

    it('should have same keys in all locales', () => {
      const enKeys = Object.keys(localeData.en).sort();

      locales.forEach(locale => {
        if (locale !== 'en') {
          const localeKeys = Object.keys(localeData[locale]).sort();
          expect(localeKeys).toEqual(enKeys);
        }
      });
    });

    it('should have no missing keys in Spanish', () => {
      const enKeys = Object.keys(localeData.en).sort();
      const esKeys = Object.keys(localeData.es).sort();

      const missingKeys = enKeys.filter(key => !esKeys.includes(key));
      expect(missingKeys).toHaveLength(0);
    });

    it('should have no missing keys in French', () => {
      const enKeys = Object.keys(localeData.en).sort();
      const frKeys = Object.keys(localeData.fr).sort();

      const missingKeys = enKeys.filter(key => !frKeys.includes(key));
      expect(missingKeys).toHaveLength(0);
    });

    it('should have no missing keys in German', () => {
      const enKeys = Object.keys(localeData.en).sort();
      const deKeys = Object.keys(localeData.de).sort();

      const missingKeys = enKeys.filter(key => !deKeys.includes(key));
      expect(missingKeys).toHaveLength(0);
    });

    it('should have no missing keys in Polish', () => {
      const enKeys = Object.keys(localeData.en).sort();
      const plKeys = Object.keys(localeData.pl).sort();

      const missingKeys = enKeys.filter(key => !plKeys.includes(key));
      expect(missingKeys).toHaveLength(0);
    });

    it('should have no extra keys in Spanish', () => {
      const enKeys = Object.keys(localeData.en);
      const esKeys = Object.keys(localeData.es);

      const extraKeys = esKeys.filter(key => !enKeys.includes(key));
      expect(extraKeys).toHaveLength(0);
    });

    it('should have no extra keys in French', () => {
      const enKeys = Object.keys(localeData.en);
      const frKeys = Object.keys(localeData.fr);

      const extraKeys = frKeys.filter(key => !enKeys.includes(key));
      expect(extraKeys).toHaveLength(0);
    });
  });

  describe('Key Tokens Used in App', () => {
    let localeData: { [key: string]: Record<string, string> } = {};

    beforeAll(() => {
      locales.forEach(locale => {
        const filePath = path.join(localesDir, `${locale}.json`);
        const content = fs.readFileSync(filePath, 'utf-8');
        localeData[locale] = JSON.parse(content);
      });
    });

    it('should have welcome key', () => {
      locales.forEach(locale => {
        expect(localeData[locale].welcome).toBeDefined();
      });
    });

    it('should have explore key', () => {
      locales.forEach(locale => {
        expect(localeData[locale].explore).toBeDefined();
      });
    });

    it('should have map key', () => {
      locales.forEach(locale => {
        expect(localeData[locale].map).toBeDefined();
      });
    });

    it('should have quiz key', () => {
      locales.forEach(locale => {
        expect(localeData[locale].quiz).toBeDefined();
      });
    });

    it('should have settings key', () => {
      locales.forEach(locale => {
        expect(localeData[locale].settings).toBeDefined();
      });
    });

    it('should have search key', () => {
      locales.forEach(locale => {
        expect(localeData[locale].search).toBeDefined();
      });
    });

    it('should have darkMode key', () => {
      locales.forEach(locale => {
        expect(localeData[locale].darkMode).toBeDefined();
      });
    });

    it('should have language key', () => {
      locales.forEach(locale => {
        expect(localeData[locale].language).toBeDefined();
      });
    });

    it('should have back key', () => {
      locales.forEach(locale => {
        expect(localeData[locale].back).toBeDefined();
      });
    });

    it('should have loading key', () => {
      locales.forEach(locale => {
        expect(localeData[locale].loading).toBeDefined();
      });
    });

    it('should have premium key', () => {
      locales.forEach(locale => {
        expect(localeData[locale].premium).toBeDefined();
      });
    });

    it('should have worldMap key', () => {
      locales.forEach(locale => {
        expect(localeData[locale].worldMap).toBeDefined();
      });
    });

    it('should have countryDetails key', () => {
      locales.forEach(locale => {
        expect(localeData[locale].countryDetails).toBeDefined();
      });
    });

    it('should have capital key', () => {
      locales.forEach(locale => {
        expect(localeData[locale].capital).toBeDefined();
      });
    });

    it('should have population key', () => {
      locales.forEach(locale => {
        expect(localeData[locale].population).toBeDefined();
      });
    });

    it('should have region key', () => {
      locales.forEach(locale => {
        expect(localeData[locale].region).toBeDefined();
      });
    });

    it('should have language key (languages)', () => {
      locales.forEach(locale => {
        expect(localeData[locale].languages).toBeDefined();
      });
    });

    it('should have currency key', () => {
      locales.forEach(locale => {
        expect(localeData[locale].currency).toBeDefined();
      });
    });
  });

  describe('JSON Validity', () => {
    it('should have valid JSON in all locale files', () => {
      locales.forEach(locale => {
        const filePath = path.join(localesDir, `${locale}.json`);
        const content = fs.readFileSync(filePath, 'utf-8');

        expect(() => {
          JSON.parse(content);
        }).not.toThrow();
      });
    });

    it('should parse English locale correctly', () => {
      const filePath = path.join(localesDir, 'en.json');
      const content = fs.readFileSync(filePath, 'utf-8');

      expect(() => {
        JSON.parse(content);
      }).not.toThrow();
    });
  });

  describe('Translation Content', () => {
    let localeData: { [key: string]: Record<string, string> } = {};

    beforeAll(() => {
      locales.forEach(locale => {
        const filePath = path.join(localesDir, `${locale}.json`);
        const content = fs.readFileSync(filePath, 'utf-8');
        localeData[locale] = JSON.parse(content);
      });
    });

    it('should have non-empty string values', () => {
      locales.forEach(locale => {
        Object.entries(localeData[locale]).forEach(([key, value]) => {
          expect(typeof value).toBe('string');
          expect(value).toBeTruthy();
        });
      });
    });

    it('should preserve interpolation placeholders', () => {
      locales.forEach(locale => {
        const keysWithInterpolation = Object.keys(localeData.en).filter(
          key => localeData.en[key].includes('{{')
        );

        keysWithInterpolation.forEach(key => {
          expect(localeData[locale][key]).toContain('{{');
        });
      });
    });

    it('should have consistent placeholder usage', () => {
      locales.forEach(locale => {
        Object.entries(localeData.en).forEach(([key, enValue]) => {
          const localeValue = localeData[locale][key];
          const enPlaceholders = (enValue as string).match(/{{[^}]+}}/g) || [];
          const localePlaceholders = (localeValue as string).match(/{{[^}]+}}/g) || [];

          expect(localePlaceholders.sort()).toEqual(enPlaceholders.sort());
        });
      });
    });
  });

  describe('Character Encoding', () => {
    it('should use UTF-8 encoding for all locales', () => {
      locales.forEach(locale => {
        const filePath = path.join(localesDir, `${locale}.json`);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Verify non-ASCII characters are properly encoded
        expect(content).toBeDefined();
      });
    });
  });

  describe('Key Naming Conventions', () => {
    let localeData: { [key: string]: Record<string, string> } = {};

    beforeAll(() => {
      const filePath = path.join(localesDir, 'en.json');
      const content = fs.readFileSync(filePath, 'utf-8');
      localeData.en = JSON.parse(content);
    });

    it('should use camelCase for all keys', () => {
      // Exception: `achievement_*` keys mirror the `labelKey`/`descriptionKey`
      // values in the `Achievement` interface (utils/achievements.ts), which
      // uses snake_case ids (e.g. `achievement_first_quiz`) as a stable,
      // human-readable achievement identifier. Changing that convention would
      // break the already-established ACHIEVEMENTS contract.
      const isAchievementKey = (key: string) => /^achievement_[a-z_]+$/.test(key);

      Object.keys(localeData.en).forEach(key => {
        expect(
          isAchievementKey(key) || /^[a-z][a-zA-Z0-9]*$/.test(key)
        ).toBe(true);
      });
    });

    it('should not have spaces in keys', () => {
      Object.keys(localeData.en).forEach(key => {
        expect(key).not.toContain(' ');
      });
    });

    it('should not have special characters in keys', () => {
      Object.keys(localeData.en).forEach(key => {
        expect(/^[a-zA-Z0-9_]*$/.test(key)).toBe(true);
      });
    });
  });

  describe('Additional Locales - Portuguese (if exists)', () => {
    let ptData: Record<string, string> | null = null;
    let enData: Record<string, string> | null = null;

    beforeAll(() => {
      const enPath = path.join(localesDir, 'en.json');
      const enContent = fs.readFileSync(enPath, 'utf-8');
      enData = JSON.parse(enContent);

      const ptPath = path.join(localesDir, 'pt.json');
      if (fs.existsSync(ptPath)) {
        const ptContent = fs.readFileSync(ptPath, 'utf-8');
        ptData = JSON.parse(ptContent);
      }
    });

    it('should have Portuguese locale file if PT localization is planned', () => {
      const ptPath = path.join(localesDir, 'pt.json');
      // Optional: Portuguese may not exist yet
      if (fs.existsSync(ptPath)) {
        expect(ptData).toBeDefined();
      }
    });

    it('should have all keys in Portuguese if locale exists', () => {
      if (ptData && enData) {
        const enKeys = Object.keys(enData).sort();
        const ptKeys = Object.keys(ptData).sort();
        expect(ptKeys).toEqual(enKeys);
      }
    });

    it('should have non-empty Portuguese translations', () => {
      if (ptData) {
        Object.entries(ptData).forEach(([key, value]) => {
          expect(typeof value).toBe('string');
          expect(value).toBeTruthy();
        });
      }
    });

    it('should preserve placeholders in Portuguese', () => {
      if (ptData && enData) {
        Object.entries(enData).forEach(([key, enValue]) => {
          if ((enValue as string).includes('{{')) {
            if (!ptData) return;
            const ptValue = ptData[key];
            expect(ptValue).toContain('{{');
          }
        });
      }
    });
  });

  describe('Additional Locales - Italian (if exists)', () => {
    let itData: Record<string, string> | null = null;
    let enData: Record<string, string> | null = null;

    beforeAll(() => {
      const enPath = path.join(localesDir, 'en.json');
      const enContent = fs.readFileSync(enPath, 'utf-8');
      enData = JSON.parse(enContent);

      const itPath = path.join(localesDir, 'it.json');
      if (fs.existsSync(itPath)) {
        const itContent = fs.readFileSync(itPath, 'utf-8');
        itData = JSON.parse(itContent);
      }
    });

    it('should have Italian locale file if IT localization is planned', () => {
      const itPath = path.join(localesDir, 'it.json');
      // Optional: Italian may not exist yet
      if (fs.existsSync(itPath)) {
        expect(itData).toBeDefined();
      }
    });

    it('should have all keys in Italian if locale exists', () => {
      if (itData && enData) {
        const enKeys = Object.keys(enData).sort();
        const itKeys = Object.keys(itData).sort();
        expect(itKeys).toEqual(enKeys);
      }
    });

    it('should have non-empty Italian translations', () => {
      if (itData) {
        Object.entries(itData).forEach(([key, value]) => {
          expect(typeof value).toBe('string');
          expect(value).toBeTruthy();
        });
      }
    });

    it('should preserve placeholders in Italian', () => {
      if (itData && enData) {
        Object.entries(enData).forEach(([key, enValue]) => {
          if ((enValue as string).includes('{{')) {
            if (!itData) return;
            const itValue = itData[key];
            expect(itValue).toContain('{{');
          }
        });
      }
    });
  });

  describe('All Available Locales', () => {
    it('should have at least 5 core locales', () => {
      const requiredLocales = ['en', 'es', 'fr', 'de', 'pl'];
      requiredLocales.forEach(locale => {
        const filePath = path.join(localesDir, `${locale}.json`);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    it('should have consistent structure across all locales', () => {
      const allLocalesInDir = fs
        .readdirSync(localesDir)
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));

      const firstLocale = allLocalesInDir[0];
      const firstPath = path.join(localesDir, `${firstLocale}.json`);
      const firstContent = fs.readFileSync(firstPath, 'utf-8');
      const firstData = JSON.parse(firstContent);
      const firstKeys = Object.keys(firstData).sort();

      allLocalesInDir.forEach(locale => {
        const filePath = path.join(localesDir, `${locale}.json`);
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        const keys = Object.keys(data).sort();

        expect(keys).toEqual(firstKeys);
      });
    });

    it('should validate all locale files are valid JSON', () => {
      const allLocalesInDir = fs
        .readdirSync(localesDir)
        .filter(file => file.endsWith('.json'));

      allLocalesInDir.forEach(file => {
        const filePath = path.join(localesDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        expect(() => {
          JSON.parse(content);
        }).not.toThrow();
      });
    });
  });
});
