/**
 * search-text.spec.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit tests for the buildSearchText() utility function.
 *
 * What is buildSearchText()?
 *   It lives in search-text.ts and takes an array of profile/job field values
 *   (strings, numbers, nulls) and joins them into a single lowercase string.
 *   That string is stored in the search_text column in the database and is
 *   used by the pg_trgm fuzzy search index to match queries.
 *
 *   Example:
 *     buildSearchText(['Alice Smith', 'bachelor', 3, null, 'Python'])
 *     → 'Alice Smith bachelor 3 Python'
 *
 * Why no mocking is needed here:
 *   buildSearchText() is a pure function — it takes input and returns output
 *   with no database calls, no API calls, and no side effects. These tests
 *   run entirely in memory in milliseconds.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { buildSearchText } from './search-text';

describe('buildSearchText', () => {

  // ── Basic joining ──────────────────────────────────────────────────────────

  it('joins non-null string parts with spaces', () => {
    // Normal case: all valid strings are joined with a single space between them
    expect(buildSearchText(['Alice', 'bachelor', 'Python'])).toBe('Alice bachelor Python');
  });

  it('converts numbers to strings', () => {
    // yearsOfExperience is stored as a number; it must be included as a string
    // in search_text so "3 years experience" queries can match it
    expect(buildSearchText(['Alice', 3, 'years'])).toBe('Alice 3 years');
  });

  // ── Null / undefined filtering ─────────────────────────────────────────────

  it('filters out null values', () => {
    // Many profile fields are optional and will be null when not filled in.
    // Nulls should be silently skipped — not inserted as the word "null".
    expect(buildSearchText(['Alice', null, 'Python'])).toBe('Alice Python');
  });

  it('filters out undefined values', () => {
    // Same as null — optional fields that haven't been set should be skipped
    expect(buildSearchText(['Alice', undefined, 'React'])).toBe('Alice React');
  });

  it('returns empty string when all parts are null/undefined', () => {
    // If every field is empty (new profile with no data yet), the result
    // should be an empty string — not a string of "null null null"
    expect(buildSearchText([null, undefined, null])).toBe('');
  });

  it('returns empty string for empty array', () => {
    // Edge case: calling with no parts at all should return ''
    expect(buildSearchText([])).toBe('');
  });

  // ── Whitespace trimming ────────────────────────────────────────────────────

  it('trims whitespace from each part', () => {
    // User input or database values may have leading/trailing spaces.
    // These should be removed so the search index stays clean.
    expect(buildSearchText(['  Alice  ', '  Python  '])).toBe('Alice Python');
  });

  // ── Realistic usage ────────────────────────────────────────────────────────

  it('handles a realistic candidate profile concatenation', () => {
    // This mirrors exactly how CandidatesService calls buildSearchText()
    // before storing the search_text column. All key profile fields are
    // combined into one searchable string.
    const result = buildSearchText([
      'Alice Smith',       // fullName
      'alice@example.com', // contactInfo
      'bachelor',          // education level
      'Computer Science',  // major
      3,                   // yearsOfExperience (number)
      'Python,React',      // skills
      '3 years at TechCo', // workExperience
      'Sydney',            // preferredLocations
      'hybrid',            // preferredWorkMode
    ]);

    // The result should contain all the important searchable terms
    expect(result).toContain('Alice Smith');
    expect(result).toContain('bachelor');
    expect(result).toContain('Python,React');
    expect(result).toContain('Sydney');
  });

});
