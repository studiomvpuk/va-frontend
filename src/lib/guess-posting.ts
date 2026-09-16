/**
 * A best guess at the role title and company from pasted job-description text.
 *
 * Wrong sometimes, and cheap to be wrong: it only labels the tracker row, which
 * the Client can correct. Asking the VA to fill two fields before every paste
 * would cost more than it saves, a hundred times a day.
 *
 * Lives here rather than in the page because a Next.js page file may only
 * export a default component and a fixed set of framework names — and because a
 * pure function belongs somewhere it can be tested.
 */
export function guessTitleAndCompany(jobDescription: string): {
  roleTitle: string;
  companyName: string;
} {
  const lines = jobDescription
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const roleTitle = lines[0]?.slice(0, 120) ?? 'Untitled role';

  // "Marketing Coordinator at Descasio Ltd" — the most common shape by far.
  //
  // Searched line by line rather than across a joined string: joining let a
  // capitalised word on the NEXT line get swallowed into the company name, so
  // "at Sky Capital Partners\nLagos based" came back as "Sky Capital Partners
  // Lagos". A company name does not wrap.
  const AT_COMPANY = /\bat\s+([A-Z][\w&.'-]*(?:\s+[A-Z][\w&.'-]*){0,4})/;

  for (const line of lines.slice(0, 3)) {
    const match = AT_COMPANY.exec(line);
    if (match) return { roleTitle, companyName: match[1].trim() };
  }

  return { roleTitle, companyName: 'Unknown company' };
}
