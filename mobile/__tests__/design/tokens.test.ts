/**
 * Design token sanity tests.
 *
 * These tests verify that the token structure is complete and
 * all required keys are present. They are not testing visual output —
 * they guard against accidental deletion of required token keys.
 *
 * Per AGENT_RULES.md §22.2: unit tests for all "business logic."
 * The token system is load-bearing configuration — changes to it
 * affect every screen.
 */

import { brandColors, darkColors, lightColors, radii, spacing, TAB_BAR_HEIGHT, MIN_TOUCH_TARGET } from '../../src/design/tokens';

describe('Design Tokens — lightColors', () => {
  it('has all required background tokens', () => {
    expect(lightColors.background.primary).toBeDefined();
    expect(lightColors.background.card).toBeDefined();
    expect(lightColors.background.subtle).toBeDefined();
  });

  it('has all required text tokens', () => {
    expect(lightColors.text.primary).toBeDefined();
    expect(lightColors.text.secondary).toBeDefined();
    expect(lightColors.text.placeholder).toBeDefined();
  });

  it('has all required border tokens', () => {
    expect(lightColors.border.default).toBeDefined();
  });

  it('has all required interactive tokens', () => {
    expect(lightColors.interactive.primary).toBeDefined();
    expect(lightColors.interactive.primaryText).toBeDefined();
  });
});

describe('Design Tokens — darkColors', () => {
  it('has the same structure as lightColors', () => {
    expect(Object.keys(darkColors)).toEqual(Object.keys(lightColors));
  });

  it('uses brand navy for dark background (DESIGN.md §9.3: never pure black)', () => {
    expect(darkColors.background.primary).toBe('#0F0F1A');
    expect(darkColors.background.primary).not.toBe('#000000');
  });
});

describe('Design Tokens — brandColors', () => {
  it('exports all six brand swatches from DESIGN.md §2.1', () => {
    expect(brandColors.electricViolet).toBe('#6C63FF');
    expect(brandColors.coralPink).toBe('#FF6584');
    expect(brandColors.mintGreen).toBe('#00C896');
    expect(brandColors.amber).toBe('#FFB84C');
    expect(brandColors.coolGray).toBe('#8B8FA8');
    expect(brandColors.brandNavy).toBe('#0F0F1A');
  });
});

describe('Design Tokens — spacing', () => {
  it('exports the base-4 spacing scale with all required keys', () => {
    expect(spacing.xs).toBe(4);
    expect(spacing.sm).toBe(8);
    expect(spacing.md).toBe(12);
    expect(spacing.base).toBe(16);
    expect(spacing.lg).toBe(20);
    expect(spacing.xl).toBe(24);
    expect(spacing['2xl']).toBe(32);
    expect(spacing['3xl']).toBe(40);
  });

  it('all spacing values are multiples of 4 (DESIGN.md §4.1)', () => {
    for (const value of Object.values(spacing)) {
      expect(value % 4).toBe(0);
    }
  });
});

describe('Design Tokens — radii', () => {
  it('exports all required radius values', () => {
    expect(radii.card).toBe(16);
    expect(radii.button).toBe(12);
    expect(radii.input).toBe(10);
    expect(radii.icon).toBe(8);
    expect(radii.avatar).toBeGreaterThan(100); // should be a very large number for circle
    expect(radii.tag).toBeGreaterThan(100);
  });
});

describe('Design Tokens — layout constants', () => {
  it('TAB_BAR_HEIGHT is 64px per DESIGN.md §4.2', () => {
    expect(TAB_BAR_HEIGHT).toBe(64);
  });

  it('MIN_TOUCH_TARGET is 44px per Apple HIG and DESIGN.md §4.2', () => {
    expect(MIN_TOUCH_TARGET).toBe(44);
  });
});
