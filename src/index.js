import ReactPDF from "react-dom";
import {
  Page,
  Text,
  Link,
  Document,
  StyleSheet,
  PDFViewer,
  View,
  Image,
  Font,
  Svg,
  Line,
} from "@react-pdf/renderer";
import config from "./cv_config.json";

import ArchivoRegular from "./fonts/Archivo-Regular.ttf";
import ArchivoSemiBold from "./fonts/Archivo-SemiBold.ttf";
import ArchivoBold from "./fonts/Archivo-Bold.ttf";
import ArchivoExtraBold from "./fonts/Archivo-ExtraBold.ttf";
import JetbrainsMonoRegular from "./fonts/JetBrainsMono-Regular.ttf";
import JetbrainsMonoSemiBold from "./fonts/JetBrainsMono-SemiBold.ttf";

// Design tokens — from the dannyspina.com design system (DS·HP·01).
// The site runs the palette on a dark ground; on paper the roles are
// remapped: ink on paper instead of paper on ink, same brass.
const DS = {
  ink: "#26221c", // --ds-color-bg (site ground, here the ink + masthead)
  paper: "#ede7da", // --ds-color-ink (site ink, here the sheet)
  paperRaised: "#e6dfd0",
  brass: "#c99b3f", // --ds-color-brass
  muted: "#6b6355", // --ds-color-ink-faint, readable on paper
  faint: "#a79e8d", // --ds-color-ink-muted
  line: "#a7a298", // 35% ink on paper
  lineDashed: "#c1bcb0", // 22% ink on paper
  lineOnInk: "#6c675e", // 35% paper on ink
  gridOnInk: "#322e27",
  gridMajorOnInk: "#3b362e",
  tick: "#4e4a42",
};

const MONO = "JetBrains Mono";
const SANS = "Archivo";

const REVISION = process.env.REACT_APP_VERSION || "2.0.0";
const CONTENT_W = 515; // A4 width minus page padding
const MASTHEAD_H = 114;

const gridLines = [];
for (let x = 8; x < CONTENT_W; x += 8) {
  gridLines.push({ x1: x, y1: 0, x2: x, y2: MASTHEAD_H, major: x % 40 === 0 });
}
for (let y = 8; y < MASTHEAD_H; y += 8) {
  gridLines.push({ x1: 0, y1: y, x2: CONTENT_W, y2: y, major: y % 40 === 0 });
}

const rulerTicks = [];
for (let x = 0; x <= CONTENT_W; x += 10) {
  rulerTicks.push(x);
}

Font.register({
  family: SANS,
  fonts: [
    { src: ArchivoRegular, fontWeight: 400 },
    { src: ArchivoSemiBold, fontWeight: 600 },
    { src: ArchivoBold, fontWeight: 700 },
    { src: ArchivoExtraBold, fontWeight: 800 },
  ],
});

Font.register({
  family: MONO,
  fonts: [
    { src: JetbrainsMonoRegular, fontWeight: 400 },
    { src: JetbrainsMonoSemiBold, fontWeight: 600 },
    { src: JetbrainsMonoSemiBold, fontWeight: 700 },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  body: {
    paddingTop: 34,
    paddingBottom: 54,
    paddingHorizontal: 40,
    fontFamily: SANS,
    fontSize: 9.5,
    lineHeight: 1.6,
    color: DS.ink,
    backgroundColor: DS.paper,
  },

  // Masthead
  masthead: {
    backgroundColor: DS.ink,
    height: MASTHEAD_H,
    position: "relative",
  },
  mastheadGrid: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  mastheadContent: {
    paddingTop: 16,
    paddingHorizontal: 22,
  },
  mastheadTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mastheadLabel: {
    fontFamily: MONO,
    fontSize: 7,
    letterSpacing: 1,
    color: DS.faint,
  },
  mastheadRule: {
    borderBottom: `1px solid ${DS.lineOnInk}`,
    marginTop: 8,
    marginBottom: 12,
  },
  name: {
    fontFamily: SANS,
    fontWeight: 800,
    fontSize: 27,
    letterSpacing: -0.4,
    lineHeight: 1.05,
    color: DS.paper,
  },
  tagline: {
    fontFamily: MONO,
    fontSize: 8.5,
    letterSpacing: 1.2,
    color: DS.brass,
    marginTop: 6,
  },

  // Head area: spec table + photo
  headArea: {
    flexDirection: "row",
    marginTop: 14,
  },
  specTable: {
    flex: 1,
    border: `1px solid ${DS.line}`,
    backgroundColor: DS.paperRaised,
  },
  specHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: `1px solid ${DS.line}`,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  specHeadText: {
    fontFamily: MONO,
    fontSize: 7,
    letterSpacing: 1,
    color: DS.muted,
  },
  specRows: {
    paddingTop: 2,
    paddingBottom: 2,
    paddingHorizontal: 10,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 4,
    borderBottom: `1px dashed ${DS.lineDashed}`,
  },
  specKey: {
    fontFamily: MONO,
    fontSize: 7.5,
    color: DS.muted,
    width: 74,
    lineHeight: 1.4,
  },
  specValue: {
    fontFamily: MONO,
    fontSize: 8,
    color: DS.ink,
    textAlign: "right",
    flex: 1,
    lineHeight: 1.4,
  },
  specLink: {
    textDecoration: "none",
  },
  toolingValue: {
    fontFamily: MONO,
    fontSize: 7.5,
    color: DS.ink,
    textAlign: "right",
    flex: 1,
    lineHeight: 1.5,
  },
  photoColumn: {
    width: 112,
    marginLeft: 14,
  },
  photo: {
    width: 112,
    border: `1px solid ${DS.ink}`,
  },
  photoCaption: {
    fontFamily: MONO,
    fontSize: 6.5,
    letterSpacing: 0.8,
    color: DS.muted,
    textAlign: "center",
    marginTop: 5,
  },

  // Ruler divider
  ruler: {
    marginTop: 12,
  },
  rulerLabel: {
    fontFamily: MONO,
    fontSize: 6.5,
    letterSpacing: 0.8,
    color: DS.faint,
    textAlign: "right",
    marginBottom: 4,
  },

  // Sections
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottom: `1px solid ${DS.line}`,
    paddingBottom: 5,
    marginTop: 14,
    marginBottom: 8,
  },
  sectionLabel: {
    fontFamily: MONO,
    fontSize: 8,
    fontWeight: 600,
    letterSpacing: 1.2,
    color: DS.ink,
  },
  sectionNote: {
    fontFamily: MONO,
    fontSize: 6.5,
    letterSpacing: 0.8,
    color: DS.faint,
  },
  paragraph: {
    fontSize: 9.5,
    lineHeight: 1.65,
    marginBottom: 4,
  },

  // Service log entries
  logEntry: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 7,
    borderBottom: `1px dashed ${DS.lineDashed}`,
  },
  logYears: {
    fontFamily: MONO,
    fontSize: 7.5,
    color: DS.muted,
    width: 58,
    paddingTop: 2,
  },
  logMain: {
    flex: 1,
    paddingRight: 12,
  },
  logTitle: {
    fontFamily: SANS,
    fontWeight: 600,
    fontSize: 10.5,
    lineHeight: 1.3,
  },
  logMeta: {
    fontFamily: MONO,
    fontSize: 7,
    letterSpacing: 0.5,
    color: DS.muted,
    marginTop: 2,
    textTransform: "uppercase",
  },
  logDesc: {
    fontSize: 9,
    lineHeight: 1.55,
    color: DS.muted,
    marginTop: 2,
  },
  logTag: {
    fontFamily: MONO,
    fontSize: 7,
    color: DS.brass,
    paddingTop: 2,
  },
  projectLink: {
    fontFamily: MONO,
    fontSize: 7,
    color: DS.brass,
    textDecoration: "none",
    paddingTop: 2,
  },

  toolingTable: {
    border: `1px solid ${DS.line}`,
    backgroundColor: DS.paperRaised,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    borderTop: `1px solid ${DS.line}`,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontFamily: MONO,
    fontSize: 6.5,
    letterSpacing: 0.6,
    color: DS.faint,
  },
});

const SectionHead = ({ num, title, note }) => (
  <View style={styles.sectionHead} wrap={false}>
    <Text style={styles.sectionLabel}>
      <Text style={{ color: DS.brass }}>{num} — </Text>
      {title}
    </Text>
    {note ? <Text style={styles.sectionNote}>{note}</Text> : null}
  </View>
);

const SpecRow = ({ row, last }) => (
  <View style={[styles.specRow, last ? { borderBottom: "none" } : {}]}>
    <Text style={styles.specKey}>{row.k}</Text>
    {row.href ? (
      <Link src={row.href} style={[styles.specValue, styles.specLink]}>
        {row.v}
      </Link>
    ) : (
      <Text style={[styles.specValue, row.brass ? { color: DS.brass } : {}]}>
        {row.v}
      </Text>
    )}
  </View>
);

const specRows = [
  { k: "BASE", v: config.contacts.location },
  { k: "LANGUAGES", v: config.contacts.languages },
  { k: "EMAIL", v: config.contacts.email, href: "mailto:" + config.contacts.email },
  { k: "PHONE", v: config.contacts.telephone, href: "tel:" + config.contacts.telephone },
  { k: "WEB", v: config.contacts.website, href: "https://" + config.contacts.website },
  ...config.contacts.social.map((s) => ({
    k: s.social.toUpperCase(),
    v: s.username,
    href: s.url,
  })),
  { k: "FOCUS", v: "frontend · design ops", brass: true },
];

const experiences = config.experiences.map((exp, i) => (
  <View key={i} wrap={false} style={styles.logEntry}>
    <Text style={styles.logYears}>{exp.period}</Text>
    <View style={styles.logMain}>
      <Text style={styles.logTitle}>{exp.title}</Text>
      <Text style={styles.logMeta}>
        {exp.company} · {exp.type}
      </Text>
      <Text style={styles.logDesc}>{exp.summary}</Text>
    </View>
    <Text style={styles.logTag}>[{exp.tag}]</Text>
  </View>
));

const education = config.education.map((edu, i) => (
  <View key={i} wrap={false} style={styles.logEntry}>
    <Text style={styles.logYears}>{edu.period}</Text>
    <View style={styles.logMain}>
      <Text style={styles.logTitle}>{edu.title}</Text>
      <Text style={styles.logMeta}>{edu.institute}</Text>
    </View>
  </View>
));

const toolingRows = config.tech_skills.map((skill, i) => (
  <View
    key={i}
    style={[
      styles.specRow,
      i === config.tech_skills.length - 1 ? { borderBottom: "none" } : {},
    ]}
  >
    <Text style={styles.specKey}>{skill.type.toUpperCase()}</Text>
    <Text style={styles.toolingValue}>{skill.skills.join(" · ")}</Text>
  </View>
));

const sideProjects = config.side_projects.map((project, i) => (
  <View key={i} wrap={false} style={styles.logEntry}>
    <View style={styles.logMain}>
      <Text style={styles.logTitle}>{project.title}</Text>
      <Text style={styles.logDesc}>{project.description}</Text>
    </View>
    <Link src={project.url} style={styles.projectLink}>
      {project.url.replace("https://", "")} →
    </Link>
  </View>
));

const summary = config.summary.split("\n").map((paragraph, i) => (
  <Text key={i} style={styles.paragraph}>
    {paragraph}
  </Text>
));

const CV = () => (
  <PDFViewer width="100%" height="1000px">
    <Document
      title="Danny Spina — CV"
      author="Danny Spina"
      subject="Curriculum Vitae"
      creator="JSON.Resume"
    >
      <Page size="A4" style={styles.body}>
        {/* Masthead */}
        <View style={styles.masthead}>
          <Svg width={CONTENT_W} height={MASTHEAD_H} style={styles.mastheadGrid}>
            {gridLines.map((l, i) => (
              <Line
                key={i}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke={l.major ? DS.gridMajorOnInk : DS.gridOnInk}
                strokeWidth={0.5}
              />
            ))}
          </Svg>
          <View style={styles.mastheadContent}>
            <View style={styles.mastheadTopRow}>
              <Text style={styles.mastheadLabel}>CURRICULUM VITAE — FULL RECORD</Text>
              <Text style={[styles.mastheadLabel, { color: DS.brass }]}>
                {config.sheet_code} · REV {REVISION}
              </Text>
            </View>
            <View style={styles.mastheadRule} />
            <Text style={styles.name}>{config.name.toUpperCase()}</Text>
            <Text style={styles.tagline}>
              {config.profession.toUpperCase()} — {config.contacts.location.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Specifications + operator photo */}
        <View style={styles.headArea}>
          <View style={styles.specTable}>
            <View style={styles.specHead}>
              <Text style={styles.specHeadText}>SPECIFICATIONS</Text>
              <Text style={styles.specHeadText}>FIG. 01</Text>
            </View>
            <View style={styles.specRows}>
              {specRows.map((row, i) => (
                <SpecRow key={i} row={row} last={i === specRows.length - 1} />
              ))}
            </View>
          </View>
          <View style={styles.photoColumn}>
            <Image style={styles.photo} src={"/profile.jpg"} />
            <Text style={styles.photoCaption}>FIG. 02 — OPERATOR</Text>
          </View>
        </View>

        {/* Ruler divider */}
        <View style={styles.ruler}>
          <Text style={styles.rulerLabel}>
            PROCEDURE — MEASURE · DISASSEMBLE · REBUILD · DOCUMENT
          </Text>
          <Svg width={CONTENT_W} height={12}>
            {rulerTicks.map((x, i) => (
              <Line
                key={i}
                x1={x}
                y1={5}
                x2={x}
                y2={11.5}
                stroke={DS.tick}
                strokeWidth={0.8}
              />
            ))}
            <Line x1={0} y1={11.5} x2={CONTENT_W} y2={11.5} stroke={DS.tick} strokeWidth={1} />
          </Svg>
        </View>

        {/* 01 — Summary */}
        <SectionHead num="01" title="SUMMARY" />
        {summary}

        {/* 02 — Service log */}
        <SectionHead num="02" title="SERVICE LOG" note="EXPERIENCE — MOST RECENT FIRST" />
        {experiences}

        {/* 03 — Education */}
        <SectionHead num="03" title="EDUCATION" />
        {education}

        {/* 04 — Tooling */}
        <SectionHead num="04" title="TOOLING" note="SKILLS" />
        <View style={styles.toolingTable} wrap={false}>
          <View style={styles.specHead}>
            <Text style={styles.specHeadText}>SPECIFICATIONS — TOOLING</Text>
            <Text style={styles.specHeadText}>FIG. 03</Text>
          </View>
          <View style={styles.specRows}>{toolingRows}</View>
        </View>

        {/* 05 — Off the bench */}
        <SectionHead num="05" title="OFF THE BENCH" note="SIDE PROJECTS" />
        {sideProjects}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {config.name.toUpperCase()} — {config.sheet_code} · REV {REVISION}
          </Text>
          <Text style={styles.footerText}>
            GENERATED WITH JSON.RESUME · SET IN ARCHIVO & JETBRAINS MONO
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `SHEET ${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  </PDFViewer>
);

ReactPDF.render(<CV />, document.getElementById("root"));
