import { describe, expect, it } from 'vitest';
import { guessTitleAndCompany } from './guess-posting';

describe('guessTitleAndCompany', () => {
  it('takes the first line as the role title', () => {
    expect(
      guessTitleAndCompany('Marketing Coordinator\n\nYou will own social media.'),
    ).toMatchObject({ roleTitle: 'Marketing Coordinator' });
  });

  it('finds the company after "at"', () => {
    expect(
      guessTitleAndCompany('Marketing Coordinator at Descasio Ltd\n\n1-2 years.'),
    ).toEqual({ roleTitle: 'Marketing Coordinator at Descasio Ltd', companyName: 'Descasio Ltd' });
  });

  it('handles a company name of several words', () => {
    expect(
      guessTitleAndCompany('Engineer at Sky Capital Partners\nLagos based.').companyName,
    ).toBe('Sky Capital Partners');
  });

  it('looks across the first few lines, not just the first', () => {
    expect(
      guessTitleAndCompany('Senior Developer\nFull time\nBased at Acme Industries').companyName,
    ).toBe('Acme Industries');
  });

  it('says so plainly when it cannot tell', () => {
    // Better an obvious placeholder the Client corrects than a confident guess.
    expect(guessTitleAndCompany('We need someone to do marketing.')).toMatchObject({
      companyName: 'Unknown company',
    });
  });

  it('does not fall over on empty input', () => {
    expect(guessTitleAndCompany('')).toEqual({
      roleTitle: 'Untitled role',
      companyName: 'Unknown company',
    });
  });

  it('skips leading blank lines', () => {
    expect(guessTitleAndCompany('\n\n  Data Analyst  \nSQL required.').roleTitle).toBe(
      'Data Analyst',
    );
  });

  it('caps an absurdly long first line', () => {
    expect(guessTitleAndCompany('x'.repeat(500)).roleTitle).toHaveLength(120);
  });

  it('does not treat a lowercase word after "at" as a company', () => {
    expect(guessTitleAndCompany('Developer\nYou will be at your best here.').companyName).toBe(
      'Unknown company',
    );
  });
});
