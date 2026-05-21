// Statuts de rétention inspirés de PMV
// Adaptés pour Respirfacile (exercices respiratoires)

export type RetentionStatus = "active" | "slipping" | "dropout" | "new";

export interface RetentionInfo {
  status: RetentionStatus;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
}

export function getRetentionStatus(daysSinceLastSession: number, hasEverDone: boolean): RetentionStatus {
  if (!hasEverDone) return "new";
  if (daysSinceLastSession <= 2) return "active";
  if (daysSinceLastSession <= 5) return "slipping";
  return "dropout";
}

export function getRetentionInfo(status: RetentionStatus): RetentionInfo {
  switch (status) {
    case "active":
      return {
        status,
        label: "Actif",
        emoji: "✅",
        color: "green",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-700",
        description: "Pratique régulière",
      };
    case "slipping":
      return {
        status,
        label: "En baisse",
        emoji: "⚠️",
        color: "amber",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        textColor: "text-amber-700",
        description: "Risque d'abandon",
      };
    case "dropout":
      return {
        status,
        label: "Inactif",
        emoji: "🔴",
        color: "red",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-700",
        description: "Plus de 5 jours sans séance",
      };
    case "new":
      return {
        status,
        label: "Nouveau",
        emoji: "🆕",
        color: "blue",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-700",
        description: "Aucune séance encore",
      };
  }
}

export function daysSince(dateStr?: string | null): number {
  if (!dateStr) return 999;
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}
