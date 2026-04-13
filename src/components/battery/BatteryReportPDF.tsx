/**
 * BatteryReportPDF — Professional PDF export of the cluttering battery
 * Uses @react-pdf/renderer to generate a clinical-grade PDF
 * Mirrors BatteryResults data but in print-ready format
 */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import {
  SPONTANEOUS_SPEECH_NORMS,
  OMAS_NORMS,
  SPA_NORMS,
  RETELLING_NORMS,
  READING_NORMS,
  COPY_NORMS_SLOW,
  COPY_NORMS_FAST,
  WRITING_NORMS_FREE,
  WRITING_NORMS_TIMED,
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

// ── Styles ──────────────────────────────────────────────
const colors = {
  primary: "#1a1a2e",
  accent: "#6366f1",
  green: "#16a34a",
  red: "#dc2626",
  orange: "#ea580c",
  lightGreen: "#f0fdf4",
  lightRed: "#fef2f2",
  lightOrange: "#fff7ed",
  gray: "#6b7280",
  lightGray: "#f3f4f6",
  border: "#e5e7eb",
  white: "#ffffff",
};

const s = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: colors.primary,
    lineHeight: 1.4,
  },
  // Header
  header: {
    textAlign: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: `1.5px solid ${colors.accent}`,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: colors.accent,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  headerMeta: {
    fontSize: 8,
    color: colors.gray,
    marginTop: 4,
  },
  // Section
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.accent,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottom: `1px solid ${colors.border}`,
  },
  // Table
  table: {
    width: "100%",
    marginBottom: 6,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.lightGray,
    borderBottom: `1px solid ${colors.border}`,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: `0.5px solid ${colors.border}`,
    paddingVertical: 3,
    paddingHorizontal: 4,
    minHeight: 16,
  },
  tableRowGreen: {
    backgroundColor: colors.lightGreen,
  },
  tableRowRed: {
    backgroundColor: colors.lightRed,
  },
  tableRowOrange: {
    backgroundColor: colors.lightOrange,
  },
  colLabel: { width: "30%", fontSize: 8 },
  colCenter: { width: "12%", textAlign: "center", fontSize: 8 },
  colStatus: { width: "14%", textAlign: "center", fontSize: 8 },
  thText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: colors.gray,
    textTransform: "uppercase" as const,
  },
  bold: { fontFamily: "Helvetica-Bold" },
  // Cards
  card: {
    border: `0.5px solid ${colors.border}`,
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  // Interpretation
  alertBox: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 6,
    fontSize: 8,
  },
  alertGreen: {
    backgroundColor: colors.lightGreen,
    color: colors.green,
  },
  alertRed: {
    backgroundColor: colors.lightRed,
    color: colors.red,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7,
    color: colors.gray,
    borderTop: `0.5px solid ${colors.border}`,
    paddingTop: 6,
  },
  // Misc
  row: { flexDirection: "row" },
  spacer: { height: 6 },
  smallText: { fontSize: 7, color: colors.gray },
  inlineGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  gridItem: { width: "30%", marginBottom: 4 },
  gridLabel: { fontSize: 7, color: colors.gray },
  gridValue: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  badgeGreen: { backgroundColor: colors.lightGreen, color: colors.green },
  badgeRed: { backgroundColor: colors.lightRed, color: colors.red },
  samplesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
  },
  sampleItem: { textAlign: "center", width: "14%" },
  sampleLabel: { fontSize: 6, color: colors.gray },
  sampleValue: { fontSize: 9, fontFamily: "Helvetica-Bold" },
});

// ── Props ───────────────────────────────────────────────
interface Props {
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

// ── Helper components ───────────────────────────────────
const StatusText: React.FC<{ status: "normal" | "borderline" | "atypical" }> = ({ status }) => {
  const map = {
    normal: { label: "Normal", color: colors.green },
    borderline: { label: "Limite", color: colors.orange },
    atypical: { label: "Atypique", color: colors.red },
  };
  const cfg = map[status];
  return <Text style={{ color: cfg.color, fontFamily: "Helvetica-Bold", fontSize: 7 }}>{cfg.label}</Text>;
};

const NormTablePDF: React.FC<{ task: TaskNorms; values: (number | null)[] }> = ({ task, values }) => (
  <View style={s.section}>
    <Text style={s.sectionTitle}>{task.taskName}</Text>
    <View style={s.table}>
      <View style={s.tableHeader}>
        <Text style={[s.colLabel, s.thText]}>Variable</Text>
        <Text style={[s.colCenter, s.thText]}>Observé</Text>
        <Text style={[s.colCenter, s.thText]}>Moyenne</Text>
        <Text style={[s.colCenter, s.thText]}>ET</Text>
        <Text style={[s.colCenter, s.thText]}>Borne sup.</Text>
        <Text style={[s.colCenter, s.thText]}>Borne inf.</Text>
        <Text style={[s.colStatus, s.thText]}>Statut</Text>
      </View>
      {task.variables.map((norm, i) => {
        const observed = values[i] ?? null;
        const status = observed !== null ? compareToNorm(observed, norm) : null;
        const rowBg =
          status === "atypical" ? s.tableRowRed :
          status === "borderline" ? s.tableRowOrange :
          status === "normal" ? s.tableRowGreen : {};

        return (
          <View key={i} style={[s.tableRow, rowBg]}>
            <Text style={s.colLabel}>
              {norm.label}{norm.unit ? ` (${norm.unit})` : ""}
            </Text>
            <Text style={[s.colCenter, s.bold]}>
              {observed !== null ? observed.toFixed(2) : "—"}
            </Text>
            <Text style={s.colCenter}>{norm.mean}</Text>
            <Text style={s.colCenter}>{norm.sd}</Text>
            <Text style={s.colCenter}>{norm.upperBound2SD ?? "—"}</Text>
            <Text style={s.colCenter}>{norm.lowerBound2SD ?? "—"}</Text>
            <Text style={s.colStatus}>
              {status ? <StatusText status={status} /> : "—"}
            </Text>
          </View>
        );
      })}
    </View>
  </View>
);

const SamplesRowPDF: React.FC<{
  title: string;
  samples: number[];
  avgRate: number;
  variability: number;
}> = ({ title, samples, avgRate, variability }) => (
  <View style={s.card}>
    <Text style={s.cardTitle}>{title} — 5 échantillons VA</Text>
    <View style={s.samplesRow}>
      {samples.map((val, i) => (
        <View key={i} style={s.sampleItem}>
          <Text style={s.sampleLabel}>Éch.{i + 1}</Text>
          <Text style={s.sampleValue}>{val > 0 ? val.toFixed(2) : "—"}</Text>
        </View>
      ))}
      <View style={s.sampleItem}>
        <Text style={s.sampleLabel}>Moyenne</Text>
        <Text style={s.sampleValue}>{avgRate > 0 ? avgRate.toFixed(2) : "—"} SPS</Text>
      </View>
      <View style={s.sampleItem}>
        <Text style={s.sampleLabel}>Variabilité</Text>
        <Text style={[s.sampleValue, variability > 3 ? { color: colors.red } : {}]}>
          {variability > 0 ? variability.toFixed(2) : "—"} SPS
        </Text>
      </View>
    </View>
  </View>
);

const DisfluencyTablePDF: React.FC<{
  title: string;
  details: Record<string, number>;
}> = ({ title, details }) => {
  const normalCount = DISFLUENCY_TYPES
    .filter(d => d.category === "normal")
    .reduce((sum, d) => sum + (details[d.key] || 0), 0);
  const telescopages = details["telescopage"] || 0;
  const stuttCount = DISFLUENCY_TYPES
    .filter(d => d.category === "stuttering")
    .reduce((sum, d) => sum + (details[d.key] || 0), 0);

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{title} — Détail des disfluences</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {DISFLUENCY_TYPES.map(d => (
          <View key={d.key} style={{ width: "50%", flexDirection: "row", justifyContent: "space-between", paddingRight: 12, marginBottom: 2 }}>
            <Text style={{ fontSize: 7, color: colors.gray }}>{d.label}</Text>
            <Text style={[{ fontSize: 7 }, (details[d.key] || 0) > 0 ? s.bold : {}]}>
              {details[d.key] || 0}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row", gap: 12, marginTop: 4, paddingTop: 4, borderTop: `0.5px solid ${colors.border}` }}>
        <Text style={{ fontSize: 7 }}>Normales : {normalCount}</Text>
        <Text style={[{ fontSize: 7 }, telescopages > 0 ? { color: colors.orange } : {}]}>Télescopages : {telescopages}</Text>
        <Text style={[{ fontSize: 7 }, stuttCount > 0 ? { color: colors.red } : {}]}>Bègues : {stuttCount}</Text>
      </View>
    </View>
  );
};

// ── Main Document ───────────────────────────────────────
const BatteryReportPDF: React.FC<Props> = ({
  patientName,
  patientAge,
  therapistName,
  predictiveTest,
  omas,
  spa,
  retelling,
  reading,
  writing,
  observations,
  date,
}) => {
  // Build observed values arrays (same logic as BatteryResults)
  const spontaneousValues = predictiveTest
    ? [
        predictiveTest.spontaneousSpeech.articulationRate || null,
        predictiveTest.spontaneousSpeech.variability || null,
        predictiveTest.spontaneousSpeech.normalDisfluencies,
        predictiveTest.spontaneousSpeech.telescopages,
        predictiveTest.spontaneousSpeech.stutteringDisfluencies,
        predictiveTest.spontaneousSpeech.syntaxErrors,
      ]
    : [];

  const omasValues = omas
    ? [
        omas.pa.success ? omas.pa.speed || null : null,
        omas.taka.success ? omas.taka.speed || null : null,
        omas.pataka.success ? omas.pataka.speed || null : null,
      ]
    : [];

  const spaValues = spa
    ? [
        spa.totals.precision ?? null,
        spa.totals.voisement ?? null,
        spa.totals.flux ?? null,
        spa.totals.sequentialisation ?? null,
        spa.totals.debit ?? null,
      ]
    : [];

  const retellingValues = retelling
    ? [
        retelling.articulationRate || null,
        retelling.variability || null,
        retelling.normalDisfluencies,
        retelling.telescopages,
        retelling.stutteringDisfluencies,
        retelling.syntaxErrors,
        retelling.mainCount,
        retelling.secondaryCount,
        retelling.additions,
      ]
    : [];

  const readingValues = reading
    ? [
        reading.articulationRate || null,
        reading.variability || null,
        reading.normalDisfluencies,
        reading.telescopages,
        reading.stutteringDisfluencies,
      ]
    : [];

  const copySlowValues = writing ? [writing.copySlowErrors, writing.copySlowTelescopages] : [];
  const copyFastValues = writing ? [writing.copyFastErrors, writing.copyFastTelescopages] : [];
  const writeFreeValues = writing ? [writing.writingFreeErrors, writing.writingFreeTelescopages, writing.writingFreeSyntaxErrors] : [];
  const writeTimedValues = writing ? [writing.writingTimedErrors, writing.writingTimedTelescopages, writing.writingTimedSyntaxErrors] : [];

  // Cross-mode analysis
  const speeds = [
    predictiveTest?.spontaneousSpeech.articulationRate,
    retelling?.articulationRate,
    reading?.articulationRate,
  ].filter((v): v is number => !!v && v > 0);

  const speedLabels = ["Parole spontanée", "Reformulation", "Lecture"];
  const speedEntries = [
    predictiveTest?.spontaneousSpeech.articulationRate,
    retelling?.articulationRate,
    reading?.articulationRate,
  ];

  const variabilities = [
    { label: "Parole spontanée", value: predictiveTest?.spontaneousSpeech.variability },
    { label: "Reformulation", value: retelling?.variability },
    { label: "Lecture", value: reading?.variability },
  ].filter(v => !!v.value && v.value > 0);

  const highVariabilityModes = variabilities.filter(
    v => v.value! > INTERPRETATION_RULES.variabilityThreshold
  );

  const speedDiff =
    speeds.length >= 2
      ? Math.max(...speeds) - Math.min(...speeds)
      : null;

  return (
    <Document>
      {/* ── Page 1: Header + PCI + Spontaneous Speech + OMAS ── */}
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Bilan Bredouillement</Text>
          <Text style={s.subtitle}>
            {patientName}
            {patientAge ? ` — ${patientAge} ans` : ""}
          </Text>
          {therapistName && (
            <Text style={{ fontSize: 9, color: colors.gray }}>
              Orthophoniste : {therapistName}
            </Text>
          )}
          <Text style={s.headerMeta}>
            Date : {date} — Batterie Van Zaalen, Aumont Boucand, Brejon,
            Desportes, Meyer (2018) — N = 61
          </Text>
        </View>

        {/* PCI */}
        {predictiveTest && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>
              1. Test prédictif (PCI) — Score : {predictiveTest.pciTotal}/50
            </Text>
            <View
              style={[
                s.alertBox,
                predictiveTest.pciTotal > PCI_THRESHOLD ? s.alertRed : s.alertGreen,
              ]}
            >
              <Text>
                {predictiveTest.pciTotal > PCI_THRESHOLD
                  ? `Score > ${PCI_THRESHOLD} : indication d'un bredouillement possible — poursuite de l'évaluation recommandée`
                  : `Score ≤ ${PCI_THRESHOLD} : pas d'indication de bredouillement au test prédictif`}
              </Text>
            </View>
          </View>
        )}

        {/* Spontaneous speech */}
        {predictiveTest && (
          <>
            <NormTablePDF task={SPONTANEOUS_SPEECH_NORMS} values={spontaneousValues} />
            {predictiveTest.spontaneousSpeech.samples && (
              <SamplesRowPDF
                title="Parole spontanée"
                samples={predictiveTest.spontaneousSpeech.samples}
                avgRate={predictiveTest.spontaneousSpeech.articulationRate}
                variability={predictiveTest.spontaneousSpeech.variability}
              />
            )}
            {predictiveTest.spontaneousSpeech.disfluencyDetails && (
              <DisfluencyTablePDF
                title="Parole spontanée"
                details={predictiveTest.spontaneousSpeech.disfluencyDetails}
              />
            )}
          </>
        )}

        {/* OMAS */}
        {omas && (
          <>
            <NormTablePDF task={OMAS_NORMS} values={omasValues} />
            <View style={s.card}>
              <Text style={s.cardTitle}>OMAS — Réussite par sous-épreuve</Text>
              <View style={{ flexDirection: "row", gap: 16 }}>
                {[
                  { label: "/pa/", data: omas.pa },
                  { label: "/taka/", data: omas.taka },
                  { label: "/pataka/", data: omas.pataka },
                ].map(({ label, data }) => (
                  <View key={label} style={{ textAlign: "center" }}>
                    <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold" }}>{label}</Text>
                    <Text
                      style={[
                        s.badge,
                        data.success ? s.badgeGreen : s.badgeRed,
                        { marginTop: 2 },
                      ]}
                    >
                      {data.success ? "Réussi" : "Échoué"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        <Text
          style={s.footer}
          render={({ pageNumber, totalPages }) =>
            `Bilan Bredouillement — ${patientName} — ${date} — Page ${pageNumber}/${totalPages}`
          }
          fixed
        />
      </Page>

      {/* ── Page 2: SPA + Retelling ── */}
      <Page size="A4" style={s.page}>
        {/* SPA */}
        {spa && <NormTablePDF task={SPA_NORMS} values={spaValues} />}

        {/* Retelling */}
        {retelling && (
          <>
            <NormTablePDF task={RETELLING_NORMS} values={retellingValues} />
            {retelling.samples && (
              <SamplesRowPDF
                title="Reformulation"
                samples={retelling.samples}
                avgRate={retelling.articulationRate}
                variability={retelling.variability}
              />
            )}
            {retelling.disfluencyDetails && (
              <DisfluencyTablePDF title="Reformulation" details={retelling.disfluencyDetails} />
            )}
          </>
        )}

        {/* Reading */}
        {reading && (
          <>
            <NormTablePDF task={READING_NORMS} values={readingValues} />
            {reading.samples && (
              <SamplesRowPDF
                title="Lecture"
                samples={reading.samples}
                avgRate={reading.articulationRate}
                variability={reading.variability}
              />
            )}
            {reading.disfluencyDetails && (
              <DisfluencyTablePDF title="Lecture" details={reading.disfluencyDetails} />
            )}
          </>
        )}

        <Text
          style={s.footer}
          render={({ pageNumber, totalPages }) =>
            `Bilan Bredouillement — ${patientName} — ${date} — Page ${pageNumber}/${totalPages}`
          }
          fixed
        />
      </Page>

      {/* ── Page 3: Writing + Cross-mode + Synthesis + Observations ── */}
      <Page size="A4" style={s.page}>
        {/* Writing */}
        {writing && (
          <>
            <NormTablePDF task={COPY_NORMS_SLOW} values={copySlowValues} />
            <NormTablePDF task={COPY_NORMS_FAST} values={copyFastValues} />
            <NormTablePDF task={WRITING_NORMS_FREE} values={writeFreeValues} />
            <NormTablePDF task={WRITING_NORMS_TIMED} values={writeTimedValues} />

            <View style={s.card}>
              <Text style={s.cardTitle}>Observations écriture</Text>
              <View style={{ flexDirection: "row", gap: 20 }}>
                <View>
                  <Text style={s.gridLabel}>Vitesse copie lente</Text>
                  <Text style={s.gridValue}>
                    {writing.copySlowSpeed ? `${writing.copySlowSpeed} car/s` : "—"}
                  </Text>
                </View>
                <View>
                  <Text style={s.gridLabel}>Vitesse copie rapide</Text>
                  <Text style={s.gridValue}>
                    {writing.copyFastSpeed ? `${writing.copyFastSpeed} car/s` : "—"}
                  </Text>
                </View>
                <View>
                  <Text style={s.gridLabel}>Graphisme</Text>
                  <Text style={s.gridValue}>
                    {writing.graphismSize === "small"
                      ? "Micrographie"
                      : writing.graphismSize === "large"
                      ? "Macrographie"
                      : "Normal"}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Cross-mode VA */}
        {speeds.length >= 2 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Comparaison inter-modes — Vitesse articulatoire</Text>
            <View style={{ flexDirection: "row", gap: 16, marginBottom: 6 }}>
              {speedLabels.map((label, i) => (
                <View key={label} style={{ textAlign: "center" }}>
                  <Text style={s.gridLabel}>{label}</Text>
                  <Text style={s.gridValue}>
                    {speedEntries[i] && speedEntries[i]! > 0
                      ? speedEntries[i]!.toFixed(2)
                      : "—"}{" "}
                    SPS
                  </Text>
                </View>
              ))}
            </View>
            {speedDiff !== null && (
              <View
                style={[
                  s.alertBox,
                  speedDiff <= INTERPRETATION_RULES.speedDifferenceThreshold
                    ? s.alertRed
                    : s.alertGreen,
                ]}
              >
                <Text>
                  {speedDiff <= INTERPRETATION_RULES.speedDifferenceThreshold
                    ? `Différence VA = ${speedDiff.toFixed(2)} SPS (≤ ${INTERPRETATION_RULES.speedDifferenceThreshold}) → Non-ajustement = indication bredouillement`
                    : `Différence VA = ${speedDiff.toFixed(2)} SPS (> ${INTERPRETATION_RULES.speedDifferenceThreshold}) → Ajustement normal`}
                </Text>
              </View>
            )}
            {highVariabilityModes.length > 0 && (
              <View style={[s.alertBox, s.alertRed]}>
                <Text>
                  Variabilité {">"} {INTERPRETATION_RULES.variabilityThreshold} SPS en :{" "}
                  {highVariabilityModes.map(m => m.label).join(", ")} → indication bredouillement
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Synthesis */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Synthèse</Text>
          <View style={s.card}>
            {predictiveTest && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 3 }}>
                <Text style={{ color: predictiveTest.pciTotal > PCI_THRESHOLD ? colors.red : colors.green, fontSize: 8 }}>
                  {predictiveTest.pciTotal > PCI_THRESHOLD ? "▲" : "✓"}
                </Text>
                <Text style={{ fontSize: 8 }}>
                  PCI : {predictiveTest.pciTotal}/50{" "}
                  {predictiveTest.pciTotal > PCI_THRESHOLD ? "(suspect)" : "(normal)"}
                </Text>
              </View>
            )}
            {speedDiff !== null && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 3 }}>
                <Text style={{ color: speedDiff <= INTERPRETATION_RULES.speedDifferenceThreshold ? colors.red : colors.green, fontSize: 8 }}>
                  {speedDiff <= INTERPRETATION_RULES.speedDifferenceThreshold ? "▲" : "✓"}
                </Text>
                <Text style={{ fontSize: 8 }}>
                  Ajustement VA inter-modes : Δ = {speedDiff.toFixed(2)} SPS
                </Text>
              </View>
            )}
            {highVariabilityModes.length > 0 && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 3 }}>
                <Text style={{ color: colors.red, fontSize: 8 }}>▲</Text>
                <Text style={{ fontSize: 8 }}>
                  Variabilité excessive en {highVariabilityModes.map(m => m.label).join(", ")}
                </Text>
              </View>
            )}
            {retelling && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 3 }}>
                <Text style={{ color: retelling.mainCount < 5 ? colors.red : colors.green, fontSize: 8 }}>
                  {retelling.mainCount < 5 ? "▲" : "✓"}
                </Text>
                <Text style={{ fontSize: 8 }}>
                  Reformulation : {retelling.mainCount}/13 items principaux,{" "}
                  {retelling.secondaryCount}/9 secondaires
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Observations */}
        {observations && Object.values(observations).some(v => v?.trim()) && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Observations cliniques</Text>
            {[
              { key: "predictive", label: "Parole spontanée" },
              { key: "omas", label: "OMAS" },
              { key: "spa", label: "SPA" },
              { key: "retelling", label: "Reformulation" },
              { key: "reading", label: "Lecture" },
              { key: "writing", label: "Écriture" },
            ]
              .filter(s => observations[s.key]?.trim())
              .map(sec => (
                <View key={sec.key} style={{ marginBottom: 4 }}>
                  <Text style={[s.smallText, s.bold]}>{sec.label}</Text>
                  <Text style={{ fontSize: 8 }}>{observations[sec.key]}</Text>
                </View>
              ))}
          </View>
        )}

        <Text
          style={s.footer}
          render={({ pageNumber, totalPages }) =>
            `Bilan Bredouillement — ${patientName} — ${date} — Page ${pageNumber}/${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export default BatteryReportPDF;
