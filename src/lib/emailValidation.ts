const KNOWN_DOMAINS = [
  // International
  "gmail.com", "googlemail.com", "hotmail.com", "outlook.com", "outlook.fr",
  "yahoo.com", "yahoo.fr", "icloud.com", "live.com", "live.fr",
  "msn.com", "aol.com", "protonmail.com", "proton.me", "mail.com",
  // France
  "orange.fr", "free.fr", "sfr.fr", "laposte.net", "wanadoo.fr",
  "bbox.fr", "numericable.fr", "club-internet.fr", "neuf.fr",
  // Belgium / Switzerland / Canada
  "skynet.be", "proximus.be", "bluewin.ch", "videotron.ca", "bell.net",
];

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export interface EmailSuggestion {
  hasSuggestion: boolean;
  suggestedEmail: string;
  originalDomain: string;
  suggestedDomain: string;
}

export function checkEmailDomainTypo(email: string): EmailSuggestion {
  const noSuggestion: EmailSuggestion = { hasSuggestion: false, suggestedEmail: "", originalDomain: "", suggestedDomain: "" };

  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2 || !parts[1]) return noSuggestion;

  const domain = parts[1];

  // Exact match → no suggestion needed
  if (KNOWN_DOMAINS.includes(domain)) return noSuggestion;

  let bestDomain = "";
  let bestDist = Infinity;

  for (const known of KNOWN_DOMAINS) {
    const dist = levenshtein(domain, known);
    if (dist < bestDist) {
      bestDist = dist;
      bestDomain = known;
    }
  }

  if (bestDist > 0 && bestDist <= 2) {
    return {
      hasSuggestion: true,
      suggestedEmail: `${parts[0]}@${bestDomain}`,
      originalDomain: domain,
      suggestedDomain: bestDomain,
    };
  }

  return noSuggestion;
}
