/**
 * BatteryReportDOCX — Generates an editable DOCX version of the battery report
 * Uses the `docx` library to create a professional Word document
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  Footer,
  PageNumber,
  LevelFormat,
} from "docx";
import { saveAs } from "file-saver";
import {
  SPONTANEOUS_SPEECH_NORMS,
  OMAS_NORMS,
  SPA_NORMS,
  RETELLING_NORMS,
  READING_NORMS,
  PCI_THRESHOLD,
  INTERPRETATION_RULES,
  DISFLUENCY_TYPES,
  compareToNorm,
  type NormValue,
  type TaskNorms,
} from "@/data/batteryNorms";
import type { PredictiveTestData } from "./steps/PredictiveTestStep";
import type { OMASData } from "./steps/OMASStep";
import type { SPAData } from "./steps/SPAStep";
import type { RetellingData } from "./steps/RetellingStep";
import type { ReadingData } from "./steps/ReadingStep";
import type { WritingData } from "./steps/WritingStep";

// ── Colors ──────────────────────────────────────────────
const COLORS = {
  accent: "6366F1",
  green: "16A34A",
  red: "DC2626",
  orange: "EA580C",
  lightGreen: "F0FDF4",
  lightRed: "FEF2F2",
  lightOrange: "FFF7ED",
  gray: "6B7280",
  lightGray: "F3F4F6",
  border: "E5E7EB",
};

// ── Helpers ─────────────────────────────────────────────
const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: COLORS.border };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function statusLabel(status: "normal" | "borderline" | "atypical"): string {
  return status === "normal" ? "Normal" : status === "borderline" ? "Limite" : "Atypique";
}

function statusColor(status: "normal" | "borderline" | "atypical"): string {
  return status === "normal" ? COLORS.green : status === "borderline" ? COLORS.orange : COLORS.red;
}

function statusBg(status: "normal" | "borderline" | "atypical"): string {
  return status === "normal" ? COLORS.lightGreen : status === "borderline" ? COLORS.lightOrange : COLORS.lightRed;
}

function makeHeaderCell(text: string, width: number): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: cellBorders,
    margins: cellMargins,
    shading: { fill: COLORS.lightGray, type: ShadingType.CLEAR },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, size: 16, font: "Arial", color: COLORS.gray })],
    })],
  });
}

function makeCell(text: string, width: number, opts?: { bold?: boolean; color?: string; align?: typeof AlignmentType.CENTER; bg?: string }): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: cellBorders,
    margins: cellMargins,
    shading: opts?.bg ? { fill: opts.bg, type: ShadingType.CLEAR } : undefined,
    children: [new Paragraph({
      alignment: opts?.align || AlignmentType.LEFT,
      children: [new TextRun({
        text,
        bold: opts?.bold,
        size: 18,
        font: "Arial",
        color: opts?.color,
      })],
    })],
  });
}

// ── Norm Table Builder ──────────────────────────────────
function buildNormTable(task: TaskNorms, values: (number | null)[]): Paragraph[] {
  const colWidths = [2400, 1200, 1000, 800, 1100, 1100, 1000];
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);

  const headerRow = new TableRow({
    children: [
      makeHeaderCell("Variable", colWidths[0]),
      makeHeaderCell("Observé", colWidths[1]),
      makeHeaderCell("Moyenne", colWidths[2]),
      makeHeaderCell("ET", colWidths[3]),
      makeHeaderCell("Borne sup.", colWidths[4]),
      makeHeaderCell("Borne inf.", colWidths[5]),
      makeHeaderCell("Statut", colWidths[6]),
    ],
  });

  const dataRows = task.variables.map((norm, i) => {
    const observed = values[i] ?? null;
    const status = observed !== null ? compareToNorm(observed, norm) : null;
    const bg = status ? statusBg(status) : undefined;

    return new TableRow({
      children: [
        makeCell(`${norm.label}${norm.unit ? ` (${norm.unit})` : ""}`, colWidths[0], { bg }),
        makeCell(observed !== null ? observed.toFixed(2) : "—", colWidths[1], { bold: true, align: AlignmentType.CENTER, bg }),
        makeCell(String(norm.mean), colWidths[2], { align: AlignmentType.CENTER, bg }),
        makeCell(String(norm.sd), colWidths[3], { align: AlignmentType.CENTER, bg }),
        makeCell(norm.upperBound2SD !== null ? String(norm.upperBound2SD) : "—", colWidths[4], { align: AlignmentType.CENTER, bg }),
        makeCell(norm.lowerBound2SD !== null ? String(norm.lowerBound2SD) : "—", colWidths[5], { align: AlignmentType.CENTER, bg }),
        makeCell(
          status ? statusLabel(status) : "—",
          colWidths[6],
          { bold: !!status, color: status ? statusColor(status) : undefined, align: AlignmentType.CENTER, bg }
        ),
      ],
    });
  });

  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 120 },
      children: [new TextRun({ text: task.taskName, bold: true, size: 24, font: "Arial", color: COLORS.accent })],
    }),
    new Paragraph({ children: [] }), // spacer
    new Table({
      width: { size: totalWidth, type: WidthType.DXA },
      columnWidths: colWidths,
      rows: [headerRow, ...dataRows],
    }) as unknown as Paragraph,
  ];
}

// ── Disfluency Table Builder ────────────────────────────
function buildDisfluencySection(title: string, details: Record<string, number>): Paragraph[] {
  const normalCount = DISFLUENCY_TYPES.filter(d => d.category === "normal").reduce((s, d) => s + (details[d.key] || 0), 0);
  const telescopages = details["telescopage"] || 0;
  const stuttCount = DISFLUENCY_TYPES.filter(d => d.category === "stuttering").reduce((s, d) => s + (details[d.key] || 0), 0);

  const rows = DISFLUENCY_TYPES.map(d => new TableRow({
    children: [
      makeCell(d.label, 4000),
      makeCell(String(details[d.key] || 0), 1500, {
        bold: (details[d.key] || 0) > 0,
        align: AlignmentType.CENTER,
      }),
    ],
  }));

  return [
    new Paragraph({
      spacing: { before: 200, after: 80 },
      children: [new TextRun({ text: `${title} — Détail des disfluences`, bold: true, size: 20, font: "Arial" })],
    }),
    new Table({
      width: { size: 5500, type: WidthType.DXA },
      columnWidths: [4000, 1500],
      rows,
    }) as unknown as Paragraph,
    new Paragraph({
      spacing: { before: 80 },
      children: [
        new TextRun({ text: `Normales : ${normalCount}  |  `, size: 16, font: "Arial" }),
        new TextRun({ text: `Télescopages : ${telescopages}`, size: 16, font: "Arial", color: telescopages > 0 ? COLORS.orange : undefined }),
        new TextRun({ text: `  |  `, size: 16, font: "Arial" }),
        new TextRun({ text: `Bègues : ${stuttCount}`, size: 16, font: "Arial", color: stuttCount > 0 ? COLORS.red : undefined }),
      ],
    }),
  ];
}

// ── Samples Row ─────────────────────────────────────────
function buildSamplesSection(title: string, samples: number[], avgRate: number, variability: number): Paragraph[] {
  return [
    new Paragraph({
      spacing: { before: 200, after: 80 },
      children: [new TextRun({ text: `${title} — 5 échantillons VA`, bold: true, size: 20, font: "Arial" })],
    }),
    new Paragraph({
      children: [
        ...samples.map((val, i) => new TextRun({
          text: `Éch.${i + 1}: ${val > 0 ? val.toFixed(2) : "—"}   `,
          size: 18,
          font: "Arial",
        })),
        new TextRun({ text: `  Moyenne: ${avgRate.toFixed(2)} SPS`, bold: true, size: 18, font: "Arial" }),
        new TextRun({
          text: `   Variabilité: ${variability.toFixed(2)} SPS`,
          bold: true,
          size: 18,
          font: "Arial",
          color: variability > 3 ? COLORS.red : undefined,
        }),
      ],
    }),
  ];
}

// ── Main Export Function ────────────────────────────────
interface DocxProps {
  patientName: string;
  patientAge?: number;
  therapistName?: string;
  predictiveTest?: PredictiveTestData;
  omas?: OMASData;
  spa?: SPAData;
  retelling?: RetellingData;
  reading?: ReadingData;
  writing?: WritingData;
  observations?: Record<string, string>;
  date: string;
}

export async function generateBatteryDOCX(props: DocxProps): Promise<void> {
  const { patientName, patientAge, therapistName, predictiveTest, omas, spa, retelling, reading, writing, observations, date } = props;

  const children: Paragraph[] = [];

  // ── Header ──
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: "Bilan Bredouillement", bold: true, size: 36, font: "Arial", color: COLORS.accent })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({
        text: `${patientName}${patientAge ? ` — ${patientAge} ans` : ""}`,
        bold: true, size: 24, font: "Arial",
      })],
    }),
  );

  if (therapistName) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Orthophoniste : ${therapistName}`, size: 18, font: "Arial", color: COLORS.gray })],
    }));
  }

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({
      text: `Date : ${date} — Batterie Van Zaalen, Aumont Boucand, Brejon, Desportes, Meyer (2018) — N = 61`,
      size: 16, font: "Arial", color: COLORS.gray, italics: true,
    })],
  }));

  // Separator
  children.push(new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.accent, space: 1 } },
    spacing: { after: 300 },
    children: [],
  }));

  // ── PCI ──
  if (predictiveTest) {
    const pciTotal = predictiveTest.pciTotal;
    const isSuspect = pciTotal > PCI_THRESHOLD;
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 120 },
        children: [new TextRun({ text: `1. Test prédictif (PCI) — Score : ${pciTotal}/50`, bold: true, size: 28, font: "Arial", color: COLORS.accent })],
      }),
      new Paragraph({
        spacing: { after: 200 },
        shading: { fill: isSuspect ? COLORS.lightRed : COLORS.lightGreen, type: ShadingType.CLEAR },
        children: [new TextRun({
          text: isSuspect
            ? `Score > ${PCI_THRESHOLD} : indication d'un bredouillement possible — poursuite de l'évaluation recommandée`
            : `Score ≤ ${PCI_THRESHOLD} : pas d'indication de bredouillement au test prédictif`,
          size: 20, font: "Arial", color: isSuspect ? COLORS.red : COLORS.green,
        })],
      }),
    );

    // Spontaneous speech table
    const spontaneousValues = [
      predictiveTest.spontaneousSpeech.articulationRate || null,
      predictiveTest.spontaneousSpeech.variability || null,
      predictiveTest.spontaneousSpeech.normalDisfluencies,
      predictiveTest.spontaneousSpeech.telescopages,
      predictiveTest.spontaneousSpeech.stutteringDisfluencies,
      predictiveTest.spontaneousSpeech.syntaxErrors,
    ];
    children.push(...buildNormTable(SPONTANEOUS_SPEECH_NORMS, spontaneousValues));

    if (predictiveTest.spontaneousSpeech.samples) {
      children.push(...buildSamplesSection(
        "Parole spontanée",
        predictiveTest.spontaneousSpeech.samples,
        predictiveTest.spontaneousSpeech.articulationRate,
        predictiveTest.spontaneousSpeech.variability,
      ));
    }

    if (predictiveTest.spontaneousSpeech.disfluencyDetails) {
      children.push(...buildDisfluencySection("Parole spontanée", predictiveTest.spontaneousSpeech.disfluencyDetails));
    }
  }

  // ── OMAS ──
  if (omas) {
    const omasValues = [
      omas.pa.success ? omas.pa.speed || null : null,
      omas.taka.success ? omas.taka.speed || null : null,
      omas.pataka.success ? omas.pataka.speed || null : null,
    ];
    children.push(...buildNormTable(OMAS_NORMS, omasValues));

    children.push(new Paragraph({
      spacing: { before: 120, after: 120 },
      children: [
        new TextRun({ text: "OMAS — Réussite : ", bold: true, size: 18, font: "Arial" }),
        ...[
          { label: "/pa/", data: omas.pa },
          { label: "/taka/", data: omas.taka },
          { label: "/pataka/", data: omas.pataka },
        ].map(({ label, data }) => new TextRun({
          text: `${label} ${data.success ? "✓" : "✗"}   `,
          size: 18, font: "Arial", color: data.success ? COLORS.green : COLORS.red, bold: true,
        })),
      ],
    }));
  }

  // ── SPA ──
  if (spa) {
    const spaValues = [
      spa.totals.precision ?? null,
      spa.totals.voisement ?? null,
      spa.totals.flux ?? null,
      spa.totals.sequentialisation ?? null,
      spa.totals.debit ?? null,
    ];
    children.push(...buildNormTable(SPA_NORMS, spaValues));
  }

  // ── Retelling ──
  if (retelling) {
    const retellingValues = [
      retelling.articulationRate || null,
      retelling.variability || null,
      retelling.normalDisfluencies,
      retelling.telescopages,
      retelling.stutteringDisfluencies,
      retelling.syntaxErrors,
      retelling.mainCount,
      retelling.secondaryCount,
      retelling.additions,
    ];
    children.push(...buildNormTable(RETELLING_NORMS, retellingValues));

    if (retelling.samples) {
      children.push(...buildSamplesSection("Reformulation", retelling.samples, retelling.articulationRate, retelling.variability));
    }
    if (retelling.disfluencyDetails) {
      children.push(...buildDisfluencySection("Reformulation", retelling.disfluencyDetails));
    }
  }

  // ── Reading ──
  if (reading) {
    const readingValues = [
      reading.articulationRate || null,
      reading.variability || null,
      reading.normalDisfluencies,
      reading.telescopages,
      reading.stutteringDisfluencies,
    ];
    children.push(...buildNormTable(READING_NORMS, readingValues));

    if (reading.samples) {
      children.push(...buildSamplesSection("Lecture", reading.samples, reading.articulationRate, reading.variability));
    }
    if (reading.disfluencyDetails) {
      children.push(...buildDisfluencySection("Lecture", reading.disfluencyDetails));
    }
  }

  // ── Writing ──
  if (writing) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 120 },
        children: [new TextRun({ text: "Écriture", bold: true, size: 24, font: "Arial", color: COLORS.accent })],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Copie lente — Erreurs : ${writing.copySlowErrors}, Télescopages : ${writing.copySlowTelescopages}`, size: 18, font: "Arial" }),
          writing.copySlowSpeed ? new TextRun({ text: `, Vitesse : ${writing.copySlowSpeed} car/s`, size: 18, font: "Arial" }) : new TextRun({ text: "", size: 18 }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Copie rapide — Erreurs : ${writing.copyFastErrors}, Télescopages : ${writing.copyFastTelescopages}`, size: 18, font: "Arial" }),
          writing.copyFastSpeed ? new TextRun({ text: `, Vitesse : ${writing.copyFastSpeed} car/s`, size: 18, font: "Arial" }) : new TextRun({ text: "", size: 18 }),
        ],
      }),
      new Paragraph({
        children: [new TextRun({ text: `Écriture libre — Erreurs : ${writing.writingFreeErrors}, Télescopages : ${writing.writingFreeTelescopages}, Erreurs syntaxe : ${writing.writingFreeSyntaxErrors}`, size: 18, font: "Arial" })],
      }),
      new Paragraph({
        children: [new TextRun({ text: `Écriture chronométrée — Erreurs : ${writing.writingTimedErrors}, Télescopages : ${writing.writingTimedTelescopages}, Erreurs syntaxe : ${writing.writingTimedSyntaxErrors}`, size: 18, font: "Arial" })],
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun({
          text: `Graphisme : ${writing.graphismSize === "small" ? "Micrographie" : writing.graphismSize === "large" ? "Macrographie" : "Normal"}`,
          size: 18, font: "Arial",
        })],
      }),
    );
  }

  // ── Cross-mode analysis ──
  const speeds = [
    predictiveTest?.spontaneousSpeech.articulationRate,
    retelling?.articulationRate,
    reading?.articulationRate,
  ].filter((v): v is number => !!v && v > 0);

  if (speeds.length >= 2) {
    const speedDiff = Math.max(...speeds) - Math.min(...speeds);
    const labels = ["Parole spontanée", "Reformulation", "Lecture"];
    const allSpeeds = [
      predictiveTest?.spontaneousSpeech.articulationRate,
      retelling?.articulationRate,
      reading?.articulationRate,
    ];

    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 120 },
        children: [new TextRun({ text: "Comparaison inter-modes — Vitesse articulatoire", bold: true, size: 24, font: "Arial", color: COLORS.accent })],
      }),
      new Paragraph({
        children: labels.map((label, i) => new TextRun({
          text: `${label} : ${allSpeeds[i] && allSpeeds[i]! > 0 ? allSpeeds[i]!.toFixed(2) : "—"} SPS   `,
          size: 18, font: "Arial", bold: true,
        })),
      }),
      new Paragraph({
        spacing: { before: 80 },
        shading: {
          fill: speedDiff <= INTERPRETATION_RULES.speedDifferenceThreshold ? COLORS.lightRed : COLORS.lightGreen,
          type: ShadingType.CLEAR,
        },
        children: [new TextRun({
          text: speedDiff <= INTERPRETATION_RULES.speedDifferenceThreshold
            ? `Différence VA = ${speedDiff.toFixed(2)} SPS (≤ ${INTERPRETATION_RULES.speedDifferenceThreshold}) → Non-ajustement = indication bredouillement`
            : `Différence VA = ${speedDiff.toFixed(2)} SPS (> ${INTERPRETATION_RULES.speedDifferenceThreshold}) → Ajustement normal`,
          size: 18, font: "Arial",
          color: speedDiff <= INTERPRETATION_RULES.speedDifferenceThreshold ? COLORS.red : COLORS.green,
        })],
      }),
    );
  }

  // ── Synthesis ──
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 120 },
      children: [new TextRun({ text: "Synthèse", bold: true, size: 28, font: "Arial", color: COLORS.accent })],
    }),
  );

  if (predictiveTest) {
    const isSuspect = predictiveTest.pciTotal > PCI_THRESHOLD;
    children.push(new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: isSuspect ? "▲ " : "✓ ", color: isSuspect ? COLORS.red : COLORS.green, size: 18, font: "Arial" }),
        new TextRun({ text: `PCI : ${predictiveTest.pciTotal}/50 ${isSuspect ? "(suspect)" : "(normal)"}`, size: 18, font: "Arial" }),
      ],
    }));
  }

  if (retelling) {
    const low = retelling.mainCount < 5;
    children.push(new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: low ? "▲ " : "✓ ", color: low ? COLORS.red : COLORS.green, size: 18, font: "Arial" }),
        new TextRun({ text: `Reformulation : ${retelling.mainCount}/13 items principaux, ${retelling.secondaryCount}/9 secondaires`, size: 18, font: "Arial" }),
      ],
    }));
  }

  // ── Observations ──
  if (observations && Object.values(observations).some(v => v?.trim())) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 120 },
        children: [new TextRun({ text: "Observations cliniques", bold: true, size: 28, font: "Arial", color: COLORS.accent })],
      }),
    );

    const sections = [
      { key: "predictive", label: "Parole spontanée" },
      { key: "omas", label: "OMAS" },
      { key: "spa", label: "SPA" },
      { key: "retelling", label: "Reformulation" },
      { key: "reading", label: "Lecture" },
      { key: "writing", label: "Écriture" },
    ];

    for (const sec of sections) {
      const text = observations[sec.key]?.trim();
      if (text) {
        children.push(
          new Paragraph({
            spacing: { before: 80 },
            children: [new TextRun({ text: sec.label, bold: true, size: 18, font: "Arial", color: COLORS.gray })],
          }),
          new Paragraph({
            children: [new TextRun({ text, size: 18, font: "Arial" })],
          }),
        );
      }
    }
  }

  // ── Disclaimer ──
  children.push(
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border, space: 8 } },
      spacing: { before: 400, after: 40 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: "Ce document constitue une aide instrumentale à la mesure du débit articulatoire.",
        italics: true, size: 14, font: "Arial", color: COLORS.gray,
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: "Il ne se substitue pas au diagnostic clinique de l'orthophoniste ni au bilan orthophonique réglementaire.",
        italics: true, size: 14, font: "Arial", color: COLORS.gray,
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({
        text: "Données collectées via ParlerMoinsVite.fr — Plateforme d'entraînement à la fluence",
        italics: true, size: 14, font: "Arial", color: COLORS.gray,
      })],
    }),
  );

  // ── Build document ──
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Arial", size: 20 },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
        },
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `Bilan Bredouillement — ${patientName} — ${date} — Page `, size: 14, font: "Arial", color: COLORS.gray }),
              new TextRun({ children: [PageNumber.CURRENT], size: 14, font: "Arial", color: COLORS.gray }),
            ],
          })],
        }),
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const patientSlug = (patientName || "patient").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const dateSlug = new Date().toISOString().slice(0, 10);
  saveAs(blob, `bilan-bredouillement-${patientSlug}-${dateSlug}.docx`);
}
