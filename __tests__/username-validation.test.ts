/**
 * Unit tests for validateUsername function
 * Requirements: 2.2, 2.3, 2.4
 */
import { validateUsername } from '../app/(wibu)/wibu/username/page';

describe('validateUsername - Boundary tests (Requirement 2.2)', () => {
  it('returns error for empty string (0 characters)', () => {
    expect(validateUsername('')).toBe('Username wajib diisi');
  });

  it('returns error for whitespace-only input', () => {
    expect(validateUsername('   ')).toBe('Username wajib diisi');
  });

  it('returns null for 1 character input', () => {
    expect(validateUsername('A')).toBeNull();
  });

  it('returns null for 30 character input', () => {
    expect(validateUsername('A'.repeat(30))).toBeNull();
  });

  it('returns error for 31 character input', () => {
    expect(validateUsername('A'.repeat(31))).toBe('Username maksimal 30 karakter');
  });
});

describe('validateUsername - Sanitization tests (Requirements 2.3, 2.4)', () => {
  it('rejects XSS script tag input', () => {
    expect(validateUsername("<script>alert('xss')</script>")).toBe(
      'Username mengandung karakter tidak valid'
    );
  });

  it('rejects HTML bold tag', () => {
    expect(validateUsername('<b>bold</b>')).toBe(
      'Username mengandung karakter tidak valid'
    );
  });

  it('rejects double quote character', () => {
    expect(validateUsername('"')).toBe('Username mengandung karakter tidak valid');
  });

  it('rejects single quote character', () => {
    expect(validateUsername("'")).toBe('Username mengandung karakter tidak valid');
  });

  it('rejects ampersand character', () => {
    expect(validateUsername('&')).toBe('Username mengandung karakter tidak valid');
  });

  it('rejects greater-than character', () => {
    expect(validateUsername('>')).toBe('Username mengandung karakter tidak valid');
  });

  it('rejects forward slash character', () => {
    expect(validateUsername('/')).toBe('Username mengandung karakter tidak valid');
  });

  it('rejects backslash character', () => {
    expect(validateUsername('\\')).toBe('Username mengandung karakter tidak valid');
  });
});

describe('validateUsername - Valid inputs', () => {
  it('accepts normal alphanumeric username', () => {
    expect(validateUsername('SepuhWibu99')).toBeNull();
  });

  it('accepts username with spaces', () => {
    expect(validateUsername('Wibu Sejati')).toBeNull();
  });

  it('accepts numeric-only username', () => {
    expect(validateUsername('12345')).toBeNull();
  });
});
