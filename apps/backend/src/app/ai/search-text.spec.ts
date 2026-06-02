
import { buildSearchText } from './search-text';

describe('buildSearchText', () => {

  it('joins non-null string parts with spaces', () => {
    expect(buildSearchText(['Alice', 'bachelor', 'Python'])).toBe('Alice bachelor Python');
  });

  it('converts numbers to strings', () => {
    expect(buildSearchText(['Alice', 3, 'years'])).toBe('Alice 3 years');
  });

  it('filters out null values', () => {
    expect(buildSearchText(['Alice', null, 'Python'])).toBe('Alice Python');
  });

  it('filters out undefined values', () => {
    expect(buildSearchText(['Alice', undefined, 'React'])).toBe('Alice React');
  });

  it('returns empty string when all parts are null/undefined', () => {
    expect(buildSearchText([null, undefined, null])).toBe('');
  });

  it('returns empty string for empty array', () => {
    expect(buildSearchText([])).toBe('');
  });

  it('trims whitespace from each part', () => {
    expect(buildSearchText(['  Alice  ', '  Python  '])).toBe('Alice Python');
  });
  it('handles a realistic candidate profile concatenation', () => {
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
