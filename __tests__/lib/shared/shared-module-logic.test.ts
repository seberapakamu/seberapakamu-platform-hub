/**
 * Property-Based Tests for shared module logic (lib/shared/registry.ts, lib/shared/helpers.ts)
 *
 * **Validates: Requirements 2.1, 3.3, 3.6, 7.2, 7.3, 7.4**
 */

// Feature: shared-module-logic, Property 1: MODULES entries conform to UnifiedModule interface
// Feature: shared-module-logic, Property 2: MODULES uniqueness invariant
// Feature: shared-module-logic, Property 3: getModuleBySlug round-trip

import * as fc from 'fast-check';
import { MODULES } from '../../../lib/shared/registry';
import { getModuleBySlug, getActiveModules, getComingSoonModules } from '../../../lib/shared/helpers';
import type { ModuleStatus } from '../../../lib/shared/types';

const VALID_STATUSES: ModuleStatus[] = ['active', 'coming_soon'];

describe('Property 1: MODULES entries conform to UnifiedModule interface', () => {
  /**
   * **Validates: Requirements 2.1, 7.2, 7.3, 7.4**
   *
   * For every entry in MODULES, all required fields must be truthy and
   * status must be one of the valid ModuleStatus values.
   */
  it('every MODULES entry has all required fields truthy and a valid status', () => {
    fc.assert(
      fc.property(fc.constantFrom(...MODULES), (module) => {
        // All required string fields must be truthy (non-empty)
        expect(module.id).toBeTruthy();
        expect(module.slug).toBeTruthy();
        expect(module.name).toBeTruthy();
        expect(module.description).toBeTruthy();
        expect(module.mascotEmoji).toBeTruthy();
        expect(module.mascotAlt).toBeTruthy();
        expect(module.accentColor).toBeTruthy();
        expect(module.href).toBeTruthy();

        // status must be a valid ModuleStatus
        expect(VALID_STATUSES).toContain(module.status);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 2: MODULES uniqueness invariant', () => {
  /**
   * **Validates: Requirements 2.5, 2.6**
   *
   * id, slug, and accentColor must each be unique across the entire MODULES array.
   */
  it('all id values are unique', () => {
    const ids = MODULES.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all slug values are unique', () => {
    const slugs = MODULES.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('all accentColor values are unique', () => {
    const colors = MODULES.map((m) => m.accentColor);
    expect(new Set(colors).size).toBe(colors.length);
  });
});

describe('Property 4: getActiveModules filter correctness', () => {
  /**
   * **Validates: Requirements 3.4**
   *
   * Every module returned by getActiveModules() must have status === 'active',
   * and every active module in MODULES must appear in the result.
   */
  // Feature: shared-module-logic, Property 4: getActiveModules filter correctness
  it('getActiveModules returns only active modules and includes all active modules', () => {
    const result = getActiveModules();
    result.forEach(m => expect(m.status).toBe('active'));
    const allActive = MODULES.filter(m => m.status === 'active');
    expect(result).toHaveLength(allActive.length);
  });
});

describe('Property 5: getComingSoonModules filter correctness', () => {
  /**
   * **Validates: Requirements 3.5**
   *
   * Every module returned by getComingSoonModules() must have status === 'coming_soon',
   * and every coming_soon module in MODULES must appear in the result.
   */
  // Feature: shared-module-logic, Property 5: getComingSoonModules filter correctness
  it('getComingSoonModules returns only coming_soon modules and includes all of them', () => {
    const result = getComingSoonModules();
    result.forEach(m => expect(m.status).toBe('coming_soon'));
    const allComingSoon = MODULES.filter(m => m.status === 'coming_soon');
    expect(result).toHaveLength(allComingSoon.length);
  });
});

describe('Property 3: getModuleBySlug round-trip', () => {
  /**
   * **Validates: Requirements 3.3, 3.6**
   *
   * For any module in MODULES, getModuleBySlug(module.slug) must return that exact module.
   * For any string that is not a known slug, getModuleBySlug must return undefined.
   */
  it('returns the correct module for every valid slug', () => {
    fc.assert(
      fc.property(fc.constantFrom(...MODULES), (module) => {
        expect(getModuleBySlug(module.slug)).toEqual(module);
      }),
      { numRuns: 100 }
    );
  });

  it('returns undefined for any unknown slug', () => {
    const knownSlugs = new Set(MODULES.map((m) => m.slug));
    fc.assert(
      fc.property(
        fc.string().filter((s) => !knownSlugs.has(s)),
        (unknownSlug) => {
          expect(getModuleBySlug(unknownSlug)).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('isMascotImage unit tests', () => {
  /**
   * **Validates: Requirements 3.1**
   */
  it('returns false for an emoji', () => {
    const { isMascotImage } = require('../../../lib/shared/helpers');
    expect(isMascotImage('🌸')).toBe(false);
  });

  it('returns true for an absolute image path', () => {
    const { isMascotImage } = require('../../../lib/shared/helpers');
    expect(isMascotImage('/images/mascot.png')).toBe(true);
  });

  it('returns true for a relative filename with extension', () => {
    const { isMascotImage } = require('../../../lib/shared/helpers');
    expect(isMascotImage('mascot.png')).toBe(true);
  });

  it('returns false for an empty string', () => {
    const { isMascotImage } = require('../../../lib/shared/helpers');
    expect(isMascotImage('')).toBe(false);
  });
});

import { baseCardStyle, getActiveCardStyle, getInactiveCardStyle } from '../../../lib/shared/styles';

describe('Property 6: baseCardStyle contains required CSS properties', () => {
  /**
   * **Validates: Requirements 4.1**
   *
   * baseCardStyle must contain all required layout properties.
   */
  // Feature: shared-module-logic, Property 6: baseCardStyle contains required CSS properties
  it('baseCardStyle contains all required layout properties', () => {
    expect(baseCardStyle).toHaveProperty('display');
    expect(baseCardStyle).toHaveProperty('flexDirection');
    expect(baseCardStyle).toHaveProperty('alignItems');
    expect(baseCardStyle).toHaveProperty('textAlign');
    expect(baseCardStyle).toHaveProperty('padding');
    expect(baseCardStyle).toHaveProperty('borderRadius');
    expect(baseCardStyle).toHaveProperty('background');
    expect(baseCardStyle).toHaveProperty('transition');
  });
});

describe('Style functions unit tests', () => {
  /**
   * **Validates: Requirements 4.2, 4.3**
   */
  it('getActiveCardStyle returns an object with border containing the accentColor', () => {
    const style = getActiveCardStyle('#FF9A9E');
    expect(style.border).toContain('#FF9A9E');
    expect(style.cursor).toBe('pointer');
  });

  it('getInactiveCardStyle returns an object with opacity < 1 and pointerEvents none', () => {
    const style = getInactiveCardStyle('#FF9A9E');
    expect(typeof style.opacity).toBe('number');
    expect(style.opacity as number).toBeLessThan(1);
    expect(style.pointerEvents).toBe('none');
  });

  it('getInactiveCardStyle border contains the accentColor', () => {
    const style = getInactiveCardStyle('#FF9A9E');
    expect(style.border).toContain('#FF9A9E');
  });
});
