const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "Kusal Salpura";
pres.title = "TeamPulse - Technical Assignment";

// --- Midnight Executive palette ---
const NAVY = "1E2761";
const NAVY_DEEP = "141A45";
const ICE = "CADCFC";
const WHITE = "FFFFFF";
const INK = "1B1F3B";
const BODY = "3F4665";
const MUTED = "7A82A3";
const LINE = "DDE3F5";
const PAPER = "F7F9FE";
const OK = "1F7A5A";
const WARN = "B4741C";
const DANGER = "9B2C3B";

const H = "Cambria";
const B = "Calibri";

const W = 13.33;
const M = 0.7; // page margin

// ---------- helpers ----------

function darkSlide() {
  const s = pres.addSlide();
  s.background = { color: NAVY };
  return s;
}

function lightSlide(titleText, kicker) {
  const s = pres.addSlide();
  s.background = { color: WHITE };
  s.addText(kicker.toUpperCase(), {
    x: M, y: 0.42, w: 8, h: 0.28,
    fontFace: B, fontSize: 11, bold: true, color: MUTED,
    charSpacing: 2, isTextBox: true, margin: 0,
  });
  s.addText(titleText, {
    x: M, y: 0.72, w: W - M * 2, h: 0.62,
    fontFace: H, fontSize: 32, bold: true, color: NAVY,
    isTextBox: true, margin: 0,
  });
  return s;
}

// glyph inside a filled circle - the repeated motif
function bubble(s, x, y, glyph, fill, size) {
  const d = size || 0.46;
  s.addShape(pres.ShapeType.ellipse, {
    x, y, w: d, h: d, fill: { color: fill },
  });
  s.addText(glyph, {
    x, y, w: d, h: d,
    fontFace: B, fontSize: d > 0.5 ? 16 : 13, bold: true, color: WHITE,
    align: "center", valign: "middle", isTextBox: true, margin: 0,
  });
}

function card(s, x, y, w, h, fill) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.08,
    fill: { color: fill || PAPER },
    line: { color: LINE, width: 1 },
  });
}

function bodyText(s, text, x, y, w, h, size) {
  s.addText(text, {
    x, y, w, h,
    fontFace: B, fontSize: size || 14, color: BODY,
    lineSpacingMultiple: 1.15, isTextBox: true, margin: 0,
  });
}

function bullets(s, items, x, y, w, h, size) {
  s.addText(
    items.map((t, i) => ({
      text: t,
      options: { bullet: true, breakLine: i !== items.length - 1 },
    })),
    {
      x, y, w, h,
      fontFace: B, fontSize: size || 14, color: BODY,
      paraSpaceAfter: 8, isTextBox: true, margin: 0,
    }
  );
}

function stat(s, x, y, w, value, label, color) {
  s.addText(value, {
    x, y, w, h: 0.78,
    fontFace: H, fontSize: 44, bold: true, color: color || NAVY,
    align: "left", isTextBox: true, margin: 0,
  });
  s.addText(label, {
    x, y: y + 0.74, w, h: 0.5,
    fontFace: B, fontSize: 12, color: MUTED,
    align: "left", isTextBox: true, margin: 0,
  });
}

function arrowRight(s, x, y, w) {
  s.addShape(pres.ShapeType.line, {
    x, y, w, h: 0,
    line: { color: MUTED, width: 1.5, endArrowType: "triangle" },
  });
}

function codeBox(s, text, x, y, w, h) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.06,
    fill: { color: NAVY_DEEP }, line: { color: NAVY_DEEP, width: 1 },
  });
  s.addText(text, {
    x: x + 0.16, y: y + 0.12, w: w - 0.32, h: h - 0.24,
    fontFace: "Courier New", fontSize: 11.5, color: ICE,
    lineSpacingMultiple: 1.2, isTextBox: true, margin: 0,
  });
}

// =====================================================================
// 1. TITLE
// =====================================================================
{
  const s = darkSlide();
  s.addText("TeamPulse", {
    x: M, y: 2.05, w: 8.2, h: 1.1,
    fontFace: H, fontSize: 60, bold: true, color: WHITE,
    isTextBox: true, margin: 0,
  });
  s.addText("Weekly Report Generator & Team Dashboard", {
    x: M, y: 3.15, w: 8.2, h: 0.55,
    fontFace: H, fontSize: 22, color: ICE, isTextBox: true, margin: 0,
  });
  s.addText(
    "A full-stack internal tool for structured weekly reporting, manager review cycles, and team analytics.",
    { x: M, y: 3.82, w: 8.0, h: 0.8, fontFace: B, fontSize: 14, color: "9FB0DE", lineSpacingMultiple: 1.2, isTextBox: true, margin: 0 }
  );

  s.addText("Kusal Salpura", {
    x: M, y: 5.7, w: 6, h: 0.35,
    fontFace: B, fontSize: 15, bold: true, color: WHITE, isTextBox: true, margin: 0,
  });
  s.addText("Technical Assignment  |  Software Engineering", {
    x: M, y: 6.06, w: 6, h: 0.35,
    fontFace: B, fontSize: 12.5, color: MUTED, isTextBox: true, margin: 0,
  });

  const chips = ["NestJS", "PostgreSQL", "React", "Prisma"];
  chips.forEach((c, i) => {
    const x = 9.35, y = 2.2 + i * 0.72;
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w: 2.7, h: 0.56, rectRadius: 0.1,
      fill: { color: NAVY_DEEP }, line: { color: "34407A", width: 1 },
    });
    s.addText(c, {
      x, y, w: 2.7, h: 0.56,
      fontFace: B, fontSize: 14, bold: true, color: ICE,
      align: "center", valign: "middle", isTextBox: true, margin: 0,
    });
  });

  s.addNotes(
    "TeamPulse is a full-stack internal tool. Team members file a fixed-structure weekly report; " +
    "managers review it, approve it or send it back for correction, and analyse the whole team on a dashboard. " +
    "I'll walk through the architecture, the database design, how I implemented the review cycle, " +
    "the AI assistant, and what I'd do next."
  );
}

// =====================================================================
// 2. PROBLEM & OBJECTIVE
// =====================================================================
{
  const s = lightSlide("The problem, and what I built", "Objective");

  bodyText(s,
    "Weekly status updates usually live in chat threads and free-form docs. They are inconsistent between people, " +
    "impossible to compare, and there is no record of what feedback was given or what changed after it.",
    M, 1.6, 11.9, 0.9, 15);

  const roles = [
    {
      g: "M", t: "Team Member", c: NAVY,
      d: "Files a weekly report using a fixed set of fields. Edits it while it is a draft, or after a manager asks for corrections. Sees only their own reports.",
    },
    {
      g: "R", t: "Manager", c: OK,
      d: "Sees every member's reports, filters by member, project, week and status, and takes one review action: Approve, or Request Changes with a comment.",
    },
  ];
  roles.forEach((r, i) => {
    const x = M + i * 6.15;
    card(s, x, 2.7, 5.75, 2.1);
    bubble(s, x + 0.32, 3.0, r.g, r.c, 0.5);
    s.addText(r.t, {
      x: x + 0.98, y: 3.03, w: 4.4, h: 0.4,
      fontFace: H, fontSize: 19, bold: true, color: INK, isTextBox: true, margin: 0,
    });
    bodyText(s, r.d, x + 0.32, 3.68, 5.1, 1.0, 12.5);
  });

  s.addText("Design goals", {
    x: M, y: 5.02, w: 5, h: 0.35,
    fontFace: H, fontSize: 17, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });
  bullets(s, [
    "Fixed report structure - identical fields for everyone, so reports are comparable",
    "A real review cycle, not a one-way submission",
    "Full version history - nothing is silently overwritten",
    "Strict data isolation between team members",
  ], M, 5.42, 11.9, 1.6, 13.5);

  s.addNotes(
    "The core problem is that weekly updates are inconsistent and unreviewable. Two roles fall out of that: " +
    "the member who writes, and the manager who reviews and analyses. " +
    "My four design goals drove most of the technical decisions you'll see - especially the fixed structure " +
    "and the version history requirement, which is what shaped the database schema."
  );
}

// =====================================================================
// 3. TECH STACK & WHY
// =====================================================================
{
  const s = lightSlide("Stack, and why each piece", "Technology");

  const rows = [
    { g: "1", n: "NestJS 12 + TypeScript", w: "Modular DI, and guards/decorators give me declarative, testable access control instead of scattered if-statements.", c: NAVY },
    { g: "2", n: "Prisma 7 + PostgreSQL", w: "Schema-first with generated types. The version graph is deeply relational - foreign keys and a composite unique constraint do real work here.", c: OK },
    { g: "3", n: "React 19 + TanStack Query", w: "Query owns server state, so a manager's review action invalidates and refreshes the dashboard with no manual wiring.", c: WARN },
    { g: "4", n: "Tailwind + shadcn/ui", w: "Accessible primitives I compose, not a theme I fight. Keeps components reusable across both roles.", c: "5A3FA8" },
  ];

  rows.forEach((r, i) => {
    const y = 1.68 + i * 1.28;
    card(s, M, y, 11.9, 1.12);
    bubble(s, M + 0.3, y + 0.31, r.g, r.c, 0.5);
    s.addText(r.n, {
      x: M + 1.0, y: y + 0.14, w: 3.7, h: 0.44,
      fontFace: H, fontSize: 16, bold: true, color: INK, isTextBox: true, margin: 0,
    });
    bodyText(s, r.w, M + 4.85, y + 0.17, 6.75, 0.85, 12.5);
  });

  s.addNotes(
    "I chose NestJS mainly for its guard system - role checks become one decorator on a route rather than " +
    "repeated logic in every handler. Prisma with Postgres because the report/version/comment relationship is " +
    "genuinely relational and I wanted the database to enforce invariants. On the frontend, TanStack Query " +
    "removed almost all of my manual refetch logic."
  );
}

// =====================================================================
// 4. SYSTEM ARCHITECTURE
// =====================================================================
{
  const s = lightSlide("Request path, end to end", "Architecture");

  const boxes = [
    { t: "React SPA", sub: "Vite | Router", c: NAVY },
    { t: "axios", sub: "JWT interceptor", c: NAVY },
    { t: "Guards", sub: "JWT then Roles", c: DANGER },
    { t: "Controller", sub: "DTO binding", c: NAVY },
    { t: "Service", sub: "Business rules", c: OK },
    { t: "Prisma", sub: "PostgreSQL", c: NAVY },
  ];

  const bw = 1.78, gap = 0.26;
  boxes.forEach((b, i) => {
    const x = M + i * (bw + gap);
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 2.0, w: bw, h: 1.15, rectRadius: 0.08,
      fill: { color: i === 2 ? "FBECEE" : PAPER },
      line: { color: i === 2 ? DANGER : LINE, width: i === 2 ? 1.5 : 1 },
    });
    s.addText(b.t, {
      x, y: 2.2, w: bw, h: 0.34,
      fontFace: H, fontSize: 14, bold: true, color: i === 2 ? DANGER : INK,
      align: "center", isTextBox: true, margin: 0,
    });
    s.addText(b.sub, {
      x: x + 0.06, y: 2.56, w: bw - 0.12, h: 0.32,
      fontFace: B, fontSize: 10, color: MUTED,
      align: "center", isTextBox: true, margin: 0,
    });
    if (i < boxes.length - 1) arrowRight(s, x + bw + 0.03, 2.58, gap - 0.06);
  });

  s.addText("Every route is guarded by default", {
    x: M, y: 3.55, w: 6, h: 0.36,
    fontFace: H, fontSize: 17, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });
  bodyText(s,
    "JwtAuthGuard and RolesGuard are registered globally with APP_GUARD in app.module.ts. Nothing is public " +
    "unless it is explicitly opened with @Public() - only register and login are.",
    M, 3.95, 6.1, 1.0, 13);

  codeBox(s,
    "providers: [\n" +
    "  { provide: APP_GUARD, useClass: JwtAuthGuard },\n" +
    "  { provide: APP_GUARD, useClass: RolesGuard },\n" +
    "]",
    M, 5.0, 6.1, 1.3);

  card(s, 7.1, 3.55, 5.5, 2.75);
  s.addText("Six feature modules", {
    x: 7.42, y: 3.76, w: 4.9, h: 0.36,
    fontFace: H, fontSize: 17, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });
  bullets(s, [
    "auth - register, login, JWT strategy",
    "users - profile, roster, password change",
    "projects - category CRUD",
    "reports - drafts, submission, review, history",
    "ai - assistant endpoint",
    "prisma + common - DB module, guards, decorators",
  ], 7.42, 4.2, 4.85, 1.95, 12);

  s.addNotes(
    "A request carries a JWT attached by an axios interceptor. It hits the global guards before any controller " +
    "code runs - that's the important part: authorization is deny-by-default, so forgetting a decorator fails " +
    "closed rather than open. Controllers stay thin; all business rules live in services, which is also what " +
    "makes them straightforward to unit test."
  );
}

// =====================================================================
// 5. DATABASE DESIGN
// =====================================================================
{
  const s = lightSlide("Nine models, three enums", "Database design");

  const groups = [
    { t: "Identity", items: "User - role, email, passwordHash\nProject - two M:N links to User", c: NAVY },
    { t: "Report core", items: "Report - identity + current status\nReportVersion - content snapshot", c: OK },
    { t: "Version children", items: "TaskCompleted | Blocker\nAchievement | HoursWorked", c: WARN },
    { t: "Review", items: "ReviewComment - comment + action,\nbound to report AND version", c: DANGER },
  ];

  groups.forEach((g, i) => {
    const x = M + (i % 2) * 6.15;
    const y = 1.6 + Math.floor(i / 2) * 1.62;
    card(s, x, y, 5.75, 1.42);
    bubble(s, x + 0.3, y + 0.26, String(i + 1), g.c, 0.44);
    s.addText(g.t, {
      x: x + 0.92, y: y + 0.22, w: 4.5, h: 0.38,
      fontFace: H, fontSize: 16, bold: true, color: INK, isTextBox: true, margin: 0,
    });
    bodyText(s, g.items, x + 0.92, y + 0.66, 4.6, 0.68, 11.5);
  });

  s.addText("The database enforces one report per person per week", {
    x: M, y: 5.02, w: 11.9, h: 0.36,
    fontFace: H, fontSize: 17, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });
  bodyText(s,
    "An application-level check alone would race under concurrent submits. A composite unique constraint makes " +
    "it an invariant, and the service catches the resulting P2002 to return a readable 409 instead of a stack trace.",
    M, 5.42, 7.0, 1.1, 13);

  codeBox(s, "@@unique([userId, weekStart])", 7.95, 5.5, 4.65, 0.55);

  s.addNotes(
    "Nine models. The identity side is ordinary. The interesting half is the report side, which I've split " +
    "into a Report row that holds identity and status, and ReportVersion rows that hold content. " +
    "One detail I'd point to: the composite unique constraint. I wanted the one-report-per-week rule to be a " +
    "database invariant, not just an if-statement that two concurrent requests could both pass."
  );
}

// =====================================================================
// 6. VERSION HISTORY - KEY DECISION
// =====================================================================
{
  const s = lightSlide("Why Report and ReportVersion are separate", "Key design decision");

  card(s, M, 1.6, 5.75, 1.55, "FBECEE");
  s.addText("Rejected: one table", {
    x: M + 0.32, y: 1.78, w: 5.1, h: 0.36,
    fontFace: H, fontSize: 16, bold: true, color: DANGER, isTextBox: true, margin: 0,
  });
  bodyText(s,
    "Editing a report overwrites its content. The previous version is gone, so a manager can never see what " +
    "actually changed after their feedback.",
    M + 0.32, 2.18, 5.1, 0.85, 12.5);

  card(s, 6.85, 1.6, 5.75, 1.55, "EAF5F0");
  s.addText("Chosen: identity + snapshots", {
    x: 7.17, y: 1.78, w: 5.1, h: 0.36,
    fontFace: H, fontSize: 16, bold: true, color: OK, isTextBox: true, margin: 0,
  });
  bodyText(s,
    "Report holds identity and current status. Each correction cycle appends a new immutable ReportVersion, " +
    "so history is a side effect of the schema.",
    7.17, 2.18, 5.1, 0.85, 12.5);

  s.addText("What that buys", {
    x: M, y: 3.32, w: 6, h: 0.36,
    fontFace: H, fontSize: 17, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });
  bullets(s, [
    "Every past version stays readable, with its submission timestamp",
    "Task, blocker, achievement and hours rows hang off the version - each version is a complete snapshot",
    "ReviewComment stores both reportId and reportVersionId, so the UI shows which version a comment answered",
    "No diff engine needed - the assignment asks only for a list of past versions on demand",
  ], M, 3.72, 11.9, 1.7, 13.5);

  codeBox(s,
    "Report --+-- ReportVersion v1 ---- ReviewComment (REQUESTED_CHANGES)\n" +
    "         +-- ReportVersion v2 ---- ReviewComment (APPROVED)\n" +
    "         +-- status: APPROVED",
    M, 5.55, 11.9, 1.15);

  s.addNotes(
    "This is the decision I'd most want to defend. The naive schema is one report row that you update in place - " +
    "but then the version-history requirement is impossible, because each edit destroys the evidence. " +
    "By separating identity from content snapshots, history stops being a feature I maintain and becomes " +
    "a property of the schema. The comment carrying both IDs is what lets a manager see feedback anchored to " +
    "the exact version it was written against."
  );
}

// =====================================================================
// 7. AUTH & RBAC
// =====================================================================
{
  const s = lightSlide("Two layers of authorization", "Security");

  const layers = [
    {
      t: "Route level", c: DANGER,
      d: "@Roles('MANAGER') on manager-only endpoints. RolesGuard reads the metadata and rejects a TEAM_MEMBER before the handler runs.",
      code: "@Get()\n@Roles('MANAGER')\ngetAllReports(...)",
    },
    {
      t: "Record level", c: OK,
      d: "Route access is not row access. Services compare the report's owner against the caller and throw ForbiddenException on a mismatch.",
      code: "if (report.userId !== userId)\n  throw new ForbiddenException();",
    },
  ];

  layers.forEach((l, i) => {
    const x = M + i * 6.15;
    card(s, x, 1.6, 5.75, 3.35);
    bubble(s, x + 0.32, 1.9, String(i + 1), l.c, 0.5);
    s.addText(l.t, {
      x: x + 1.0, y: 1.93, w: 4.4, h: 0.4,
      fontFace: H, fontSize: 18, bold: true, color: INK, isTextBox: true, margin: 0,
    });
    bodyText(s, l.d, x + 0.32, 2.56, 5.1, 1.1, 12.5);
    codeBox(s, l.code, x + 0.32, 3.7, 5.1, 0.95);
  });

  s.addText("Why both are needed", {
    x: M, y: 5.22, w: 6, h: 0.36,
    fontFace: H, fontSize: 17, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });
  bodyText(s,
    "Route guards stop privilege escalation between roles. They do nothing about escalation within a role - one " +
    "team member requesting another member's report ID on an endpoint both are allowed to call. Passwords are " +
    "hashed with bcrypt; sessions are stateless JWTs signed server-side.",
    M, 5.62, 11.9, 1.1, 13.5);

  s.addNotes(
    "I want to call out why one layer isn't enough. Route guards answer 'is this role allowed on this endpoint'. " +
    "They don't answer 'does this row belong to this caller'. Two team members both legitimately call " +
    "GET /reports/:id - so without the ownership check, either could read the other's report just by changing " +
    "the ID. The assignment calls that out explicitly, and it's the check I made sure to unit test."
  );
}

// =====================================================================
// 8. API DESIGN
// =====================================================================
{
  const s = lightSlide("REST surface, grouped by who may call it", "API design");

  const raw = [
    ["POST /auth/register  |  /auth/login", "Account creation and JWT issue", "Public"],
    ["POST /reports", "Create a draft (version 1)", "Member"],
    ["PUT /reports/:id", "Edit draft, or file a correction", "Owner"],
    ["POST /reports/:id/submit", "Move draft to Submitted", "Owner"],
    ["GET /reports/my-history", "Own reports, newest week first", "Owner"],
    ["GET /reports?weekStart&userId&projectId&status", "Filtered team-wide list", "Manager"],
    ["GET /reports/manager/:id", "Any report, with all versions", "Manager"],
    ["POST /reports/:id/review", "Approve or Request Changes", "Manager"],
    ["GET POST PUT DELETE /projects", "Category management (read is open)", "Manager"],
    ["POST /ai/chat", "Assistant Q&A over team reports", "Manager"],
  ];

  const header = ["Endpoint", "Purpose", "Access"].map((t) => ({
    text: t,
    options: { bold: true, color: WHITE, fill: { color: NAVY }, fontFace: B, fontSize: 12 },
  }));

  const rows = [header].concat(
    raw.map((r, i) =>
      r.map((cell, j) => ({
        text: cell,
        options: {
          fontFace: j === 0 ? "Courier New" : B,
          fontSize: j === 0 ? 10 : 11.5,
          color: j === 2 ? NAVY : BODY,
          bold: j === 2,
          fill: { color: i % 2 === 0 ? PAPER : WHITE },
        },
      }))
    )
  );

  s.addTable(rows, {
    x: M, y: 1.6, w: 11.9,
    colW: [5.4, 4.4, 2.1],
    rowH: 0.33,
    border: { type: "solid", color: LINE, pt: 1 },
    valign: "middle",
    margin: 0.06,
  });

  bodyText(s,
    "Validation is declarative: DTOs use class-validator, with nested validation on the task, blocker, achievement " +
    "and hours arrays. Errors map to real status codes - 403 on ownership failure, 409 on a duplicate report week, " +
    "400 when Request Changes arrives without a comment.",
    M, 5.6, 11.9, 1.15, 13);

  s.addNotes(
    "The surface is deliberately small. Note the two report read paths: members hit GET /reports/:id which " +
    "enforces ownership, managers hit GET /reports/manager/:id which bypasses it but is role-guarded. " +
    "The manager list endpoint takes four optional filters, which is what the dashboard and Team Reports page use. " +
    "Managers can only change status and comment - there is deliberately no endpoint that lets a manager " +
    "rewrite a member's report content."
  );
}

// =====================================================================
// 9. REVIEW & CORRECTION WORKFLOW
// =====================================================================
{
  const s = lightSlide("The review and correction cycle", "Core workflow");

  const states = [
    { t: "DRAFT", c: MUTED, d: "Visible only to the author" },
    { t: "SUBMITTED", c: NAVY, d: "On the manager's queue" },
    { t: "NEEDS_CORRECTION", c: WARN, d: "Editable again, comment shown" },
    { t: "APPROVED", c: OK, d: "Locked, terminal" },
  ];

  const sw = 2.72, sgap = 0.32;
  states.forEach((st, i) => {
    const x = M + i * (sw + sgap);
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 1.62, w: sw, h: 1.05, rectRadius: 0.08,
      fill: { color: WHITE }, line: { color: st.c, width: 2 },
    });
    s.addText(st.t, {
      x, y: 1.76, w: sw, h: 0.34,
      fontFace: B, fontSize: 13, bold: true, color: st.c,
      align: "center", isTextBox: true, margin: 0,
    });
    s.addText(st.d, {
      x: x + 0.1, y: 2.12, w: sw - 0.2, h: 0.44,
      fontFace: B, fontSize: 10, color: MUTED,
      align: "center", isTextBox: true, margin: 0,
    });
    if (i < states.length - 1) arrowRight(s, x + sw + 0.04, 2.14, sgap - 0.08);
  });

  s.addText("resubmit loops back", {
    x: 3.74, y: 2.76, w: 5.9, h: 0.3,
    fontFace: B, fontSize: 11.5, bold: true, color: WARN,
    align: "center", isTextBox: true, margin: 0,
  });

  s.addText("One branch does the real work", {
    x: M, y: 3.26, w: 6, h: 0.36,
    fontFace: H, fontSize: 17, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });
  bodyText(s,
    "updateReport() behaves differently depending on the status it finds. A draft is still being written, so " +
    "editing mutates version 1 in place. A correction is a response to feedback, so it appends a new version " +
    "and leaves the old one intact.",
    M, 3.66, 6.1, 1.2, 13);

  codeBox(s,
    "if (status === 'NEEDS_CORRECTION')\n" +
    "  create version n+1       // history preserved\n" +
    "else\n" +
    "  update version in place  // draft churn",
    M, 4.92, 6.1, 1.32);

  card(s, 7.1, 3.26, 5.5, 2.98);
  s.addText("Review action is atomic", {
    x: 7.42, y: 3.46, w: 4.9, h: 0.36,
    fontFace: H, fontSize: 17, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });
  bullets(s, [
    "reviewReport() wraps the status update and the ReviewComment insert in one Prisma $transaction",
    "Status and feedback can never drift apart - no state where a report is returned but the reason is missing",
    "A comment is mandatory for Request Changes (400 otherwise)",
    "Editing is refused unless status is DRAFT or NEEDS_CORRECTION",
  ], 7.42, 3.9, 4.85, 2.15, 12);

  s.addNotes(
    "This is the heart of the assignment, so I'll spend a moment here. The state machine is four states with one " +
    "loop - a report can bounce between Needs Correction and Submitted as many times as needed. " +
    "The implementation detail I'd highlight is the branch in updateReport. Editing a draft and editing after " +
    "feedback look identical from the UI, but they must behave differently in the database: draft edits are " +
    "churn and shouldn't create versions, whereas a correction must preserve what came before. " +
    "And the review action is transactional, because a report sitting in Needs Correction with no comment " +
    "attached would be a dead end for the member."
  );
}

// =====================================================================
// 10. FRONTEND ARCHITECTURE
// =====================================================================
{
  const s = lightSlide("How the client is organised", "Frontend");

  const cols = [
    { t: "pages/", d: "13 routed screens, split into member/ and manager/ folders" },
    { t: "components/", d: "Shared building blocks plus ui/ shadcn primitives" },
    { t: "context/", d: "AuthContext for session, ThemeContext for light/dark" },
    { t: "lib/ routes/", d: "axios instance with JWT interceptor; ProtectedRoute" },
  ];
  cols.forEach((c, i) => {
    const x = M + i * 3.02;
    card(s, x, 1.6, 2.82, 1.6);
    s.addText(c.t, {
      x: x + 0.24, y: 1.8, w: 2.4, h: 0.34,
      fontFace: "Courier New", fontSize: 13, bold: true, color: NAVY, isTextBox: true, margin: 0,
    });
    bodyText(s, c.d, x + 0.24, 2.2, 2.36, 0.9, 11.5);
  });

  s.addText("Routing is role-gated", {
    x: M, y: 3.42, w: 6, h: 0.36,
    fontFace: H, fontSize: 17, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });
  bodyText(s,
    "17 routes wrapped in ProtectedRoute, which takes an optional requiredRole. The client gate is convenience, " +
    "not security - the API enforces the same rules independently, so a hand-typed URL still fails server-side.",
    M, 3.82, 6.1, 1.15, 13);

  codeBox(s,
    "<ProtectedRoute requiredRole=\"MANAGER\">\n  <ManagerDashboard />\n</ProtectedRoute>",
    M, 5.05, 6.1, 0.95);

  card(s, 7.1, 3.42, 5.5, 2.58);
  s.addText("State management", {
    x: 7.42, y: 3.62, w: 4.9, h: 0.36,
    fontFace: H, fontSize: 17, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });
  bullets(s, [
    "TanStack Query owns all server state - no duplicated data in local state",
    "A review action invalidates the report, dashboard and team-report queries at once",
    "Local state is only UI concerns: filters, sorting, dialogs",
  ], 7.42, 4.06, 4.85, 1.8, 12);

  s.addNotes(
    "Folder structure follows role and responsibility. The point I'd make about ProtectedRoute is that it's " +
    "a UX affordance, not a security boundary - every rule it expresses is independently enforced by the API. " +
    "On state: I deliberately avoided keeping server data in component state, so there's a single source of " +
    "truth and cache invalidation handles refreshes after mutations."
  );
}

// =====================================================================
// 11. KEY FRONTEND COMPONENTS
// =====================================================================
{
  const s = lightSlide("Three surfaces, clearly separated", "Key components");

  const surfaces = [
    { g: "W", t: "Personal report page", c: NAVY, d: "ReportFormPage - the fixed structure: week, project, task table, next week, blockers, achievements, hours. Users cannot add or reorder fields." },
    { g: "L", t: "Report history", c: WARN, d: "ReportHistoryPage - a list view separate from the editor, built on a reusable DataTable with search, per-column sorting, filters and pagination." },
    { g: "A", t: "Team dashboard", c: OK, d: "ManagerDashboard and ManagerReportsPage - the whole team, filterable by member, project, week and status." },
  ];
  surfaces.forEach((f, i) => {
    const x = M + i * 4.05;
    card(s, x, 1.6, 3.8, 2.4);
    bubble(s, x + 0.28, 1.86, f.g, f.c, 0.48);
    s.addText(f.t, {
      x: x + 0.28, y: 2.45, w: 3.3, h: 0.36,
      fontFace: H, fontSize: 15, bold: true, color: INK, isTextBox: true, margin: 0,
    });
    bodyText(s, f.d, x + 0.28, 2.85, 3.24, 1.05, 11.5);
  });

  s.addText("One component serves both roles", {
    x: M, y: 4.25, w: 7, h: 0.36,
    fontFace: H, fontSize: 17, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });
  bullets(s, [
    "ReportDetailPage picks its endpoint from the role, then conditionally renders the manager review panel",
    "Version history sits in a sticky sidebar - each version is selectable and shows how many comments it drew",
    "AlertDialog confirmations guard one-way actions: submitting locks editing, approving locks the report",
    "Reused throughout: DataTable, StatusBadge, AppLayout, ProtectedRoute",
  ], M, 4.65, 11.9, 1.8, 13.5);

  s.addNotes(
    "The assignment asks for clear separation between the personal page, history and the dashboard, so those are " +
    "three distinct surfaces rather than tabs on one screen. " +
    "The reusability example I'd give is ReportDetailPage: rather than writing a member view and a manager view, " +
    "it's one read-only component that swaps its data source by role and adds the review panel for managers. " +
    "That also means the version history I built for managers came free for members."
  );
}

// =====================================================================
// 12. DASHBOARD & INSIGHTS
// =====================================================================
{
  const s = lightSlide("What a manager sees first", "Dashboard");

  s.addChart(
    pres.ChartType.doughnut,
    [{
      name: "Reports by status",
      labels: ["Approved", "Submitted", "Draft", "Needs Correction"],
      values: [8, 4, 3, 2],
    }],
    {
      x: M, y: 1.62, w: 5.3, h: 3.5,
      showTitle: true,
      title: "Report status distribution (seeded data)",
      titleFontSize: 13,
      titleColor: NAVY,
      titleFontFace: B,
      chartColors: [OK, NAVY, MUTED, WARN],
      showLegend: true,
      legendPos: "b",
      legendFontSize: 11,
      legendColor: BODY,
      showValue: true,
      dataLabelColor: WHITE,
      dataLabelFontSize: 12,
      dataLabelFontBold: true,
      holeSize: 52,
    }
  );

  card(s, 6.5, 1.62, 6.1, 3.5);
  s.addText("On the dashboard today", {
    x: 6.82, y: 1.84, w: 5.5, h: 0.36,
    fontFace: H, fontSize: 17, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });
  bullets(s, [
    "Summary metrics - total reports, compliance rate, pending review, needs correction",
    "Status distribution across the team",
    "Report volume per project workspace",
    "Team reports table, filterable and drillable into any report",
    "Team Reports page adds a status bar whose legend doubles as a filter",
  ], 6.82, 2.28, 5.45, 2.6, 12);

  stat(s, M, 5.4, 2.6, "17", "reports seeded", NAVY);
  stat(s, M + 2.9, 5.4, 2.6, "5", "users, 1 manager", NAVY);
  stat(s, M + 5.8, 5.4, 2.6, "4", "projects", NAVY);
  stat(s, M + 8.7, 5.4, 3.0, "4", "statuses represented", NAVY);

  s.addNotes(
    "The dashboard opens on the numbers a manager acts on: what's waiting for review and what's been sent back. " +
    "These figures come from the seed script, so the dashboard is meaningful on a fresh clone rather than empty. " +
    "I'll be straight about scope here: I have status distribution and per-project volume charted. " +
    "The trend-over-time and time-by-task-type charts need an aggregation endpoint that returns version-level " +
    "data, which is the first item on my improvements list."
  );
}

// =====================================================================
// 13. AI CHAT ASSISTANT
// =====================================================================
{
  const s = lightSlide("Assistant grounded in real report data", "AI - bonus feature");

  const steps = [
    { n: "1", t: "Retrieve", d: "Query the 15 most recent reports with their latest version - tasks, blockers, achievements, hours, latest comment" },
    { n: "2", t: "Format", d: "Flatten into a compact structured text block, with key issues and highlights explicitly marked" },
    { n: "3", t: "Ground", d: "Inject as a system message; the question stays a separate user message so input cannot override instructions" },
    { n: "4", t: "Answer", d: "OpenRouter returns markdown, rendered in a floating chat widget" },
  ];
  steps.forEach((st, i) => {
    const x = M + i * 3.02;
    card(s, x, 1.6, 2.82, 2.25);
    bubble(s, x + 0.24, 1.84, st.n, NAVY, 0.44);
    s.addText(st.t, {
      x: x + 0.24, y: 2.34, w: 2.4, h: 0.32,
      fontFace: H, fontSize: 15, bold: true, color: INK, isTextBox: true, margin: 0,
    });
    bodyText(s, st.d, x + 0.24, 2.68, 2.36, 1.05, 10.5);
    if (i < steps.length - 1) arrowRight(s, x + 2.85, 2.7, 0.14);
  });

  card(s, M, 4.08, 5.75, 2.3);
  s.addText("Design choices", {
    x: M + 0.32, y: 4.26, w: 5, h: 0.34,
    fontFace: H, fontSize: 16, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });
  bullets(s, [
    "Retrieval-augmented context, not fine-tuning - data changes weekly",
    "Deterministic fallback if the key is missing or the API fails, so a demo never dies",
    "Context capped at 15 reports to bound tokens and exposure",
  ], M + 0.32, 4.64, 5.1, 1.6, 11.5);

  card(s, 6.85, 4.08, 5.75, 2.3);
  s.addText("Data privacy", {
    x: 7.17, y: 4.26, w: 5, h: 0.34,
    fontFace: H, fontSize: 16, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });
  bullets(s, [
    "Only report content a manager may already read is ever sent",
    "No password hashes or credentials enter the context",
    "The API key stays server-side, never reaching the browser",
    "Honest limit: data leaves to a third party - production needs redaction or a self-hosted model",
  ], 7.17, 4.64, 5.1, 1.6, 11.5);

  s.addNotes(
    "I treated this as a retrieval problem rather than a model problem. The service builds a context block from " +
    "live database rows and injects it as a system message, keeping the user's question in a separate role so " +
    "prompt injection can't trivially override the instructions. " +
    "Two things I'd point out: the fallback path means the widget still returns something useful with no API key, " +
    "which matters for a demo. And on privacy - I only send what the asking manager is already authorised to see, " +
    "but I'd flag honestly that this is third-party data egress and production would need more."
  );
}

// =====================================================================
// 14. TESTING & SEED DATA
// =====================================================================
{
  const s = lightSlide("Proving the rules hold", "Testing & data");

  stat(s, M, 1.65, 2.7, "33", "tests passing", OK);
  stat(s, M + 2.95, 1.65, 2.7, "11", "spec files", NAVY);
  stat(s, M + 5.9, 1.65, 2.7, "0", "failing", OK);
  stat(s, M + 8.85, 1.65, 3.0, "~1k", "line seed script", NAVY);

  card(s, M, 3.1, 5.75, 2.05);
  s.addText("The RBAC test", {
    x: M + 0.32, y: 3.28, w: 5, h: 0.34,
    fontFace: H, fontSize: 16, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });
  bodyText(s,
    "roles.guard.spec.ts asserts a TEAM_MEMBER is rejected on a @Roles('MANAGER') route and a MANAGER is " +
    "allowed. Service specs cover the ownership checks and the workflow's status rules.",
    M + 0.32, 3.68, 5.1, 1.25, 12.5);

  card(s, 6.85, 3.1, 5.75, 2.05);
  s.addText("Seeded dataset", {
    x: 7.17, y: 3.28, w: 5, h: 0.34,
    fontFace: H, fontSize: 16, bold: true, color: NAVY, isTextBox: true, margin: 0,
  });
  bullets(s, [
    "1 manager + 4 members across 4 projects",
    "Several weeks of reports in all four statuses",
    "Multi-version reports with review comments attached",
  ], 7.17, 3.68, 5.1, 1.3, 12),

  bodyText(s,
    "Vitest with a mocked PrismaService, so the suite runs in seconds with no database. The seed script means a " +
    "reviewer cloning the repo gets a populated dashboard and a report that already has version history - not an " +
    "empty shell they must fill in by hand before anything is reviewable.",
    M, 5.4, 11.9, 1.2, 13.5);

  s.addNotes(
    "The assignment strongly recommends at least one automated test covering role-based access, so that's the " +
    "one I made sure existed and named clearly. Everything is mocked at the Prisma boundary, which keeps the " +
    "suite fast and independent of a live database. " +
    "The seed script matters more than it looks - without it the dashboard is empty on a fresh clone and none " +
    "of the analytics or version-history work is visible to whoever is reviewing this."
  );
}

// =====================================================================
// 15. CHALLENGES & SOLUTIONS
// =====================================================================
{
  const s = lightSlide("Problems worth describing", "Challenges");

  const items = [
    { c: "Preserving history without a diff engine", d: "Split content into immutable ReportVersion snapshots and appended on correction. The requirement was a list of past versions, not a diff - append-only was enough." },
    { c: "One report per user per week, under concurrency", d: "An app-level existence check races. Moved the rule into a composite unique constraint and translated Prisma's P2002 into a readable 409." },
    { c: "Status and feedback drifting apart", d: "A failed insert after a status update leaves a report in Needs Correction with no reason attached. Wrapped both writes in one Prisma transaction." },
    { c: "Horizontal privilege escalation", d: "Route guards alone let one member fetch another's report by ID on a shared endpoint. Added ownership checks in the service layer, and a test for them." },
    { c: "Demoing AI without a guaranteed API key", d: "Built a deterministic fallback over the same database context, so the assistant degrades instead of failing." },
  ];

  items.forEach((it, i) => {
    const y = 1.6 + i * 1.0;
    card(s, M, y, 11.9, 0.88);
    bubble(s, M + 0.26, y + 0.21, String(i + 1), NAVY, 0.46);
    s.addText(it.c, {
      x: M + 0.92, y: y + 0.08, w: 4.0, h: 0.72,
      fontFace: B, fontSize: 12.5, bold: true, color: INK,
      valign: "middle", isTextBox: true, margin: 0,
    });
    s.addText(it.d, {
      x: M + 5.05, y: y + 0.08, w: 6.6, h: 0.72,
      fontFace: B, fontSize: 11, color: BODY,
      valign: "middle", isTextBox: true, margin: 0,
    });
  });

  s.addNotes(
    "These are the five decisions I actually had to think about. The concurrency one and the transaction one are " +
    "both cases where the obvious implementation looks correct in manual testing and fails under real use - " +
    "I'd rather push an invariant into the database than rely on a check-then-act sequence in application code. " +
    "The privilege escalation one is the security bug I was most worried about, which is why it has a test."
  );
}

// =====================================================================
// 16. FUTURE IMPROVEMENTS + CLOSE
// =====================================================================
{
  const s = darkSlide();

  s.addText("What I'd build next", {
    x: M, y: 0.7, w: 10, h: 0.6,
    fontFace: H, fontSize: 32, bold: true, color: WHITE, isTextBox: true, margin: 0,
  });

  const next = [
    { t: "Analytics endpoint", d: "Server-side aggregation returning open blockers, tasks-completed trend and time by task type - the version-level data the list endpoint does not expose today." },
    { t: "Server-side pagination", d: "The reports list filters but does not page. Fine at seed scale, not at a year of team history." },
    { t: "Deployment", d: "Currently local-only. Wasmer Edge's Node runtime is still beta and the NestJS workload does not boot there; a container host is the pragmatic route." },
    { t: "Notifications & audit log", d: "In-app notifications on review actions, and an append-only audit trail of who changed what, and when." },
  ];

  next.forEach((n, i) => {
    const x = M + (i % 2) * 6.15;
    const y = 1.6 + Math.floor(i / 2) * 1.75;
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w: 5.75, h: 1.55, rectRadius: 0.08,
      fill: { color: NAVY_DEEP }, line: { color: "34407A", width: 1 },
    });
    bubble(s, x + 0.3, y + 0.26, String(i + 1), "34407A", 0.44);
    s.addText(n.t, {
      x: x + 0.92, y: y + 0.23, w: 4.5, h: 0.36,
      fontFace: H, fontSize: 16, bold: true, color: WHITE, isTextBox: true, margin: 0,
    });
    s.addText(n.d, {
      x: x + 0.32, y: y + 0.68, w: 5.1, h: 0.78,
      fontFace: B, fontSize: 11, color: "9FB0DE",
      lineSpacingMultiple: 1.1, isTextBox: true, margin: 0,
    });
  });

  s.addText("Thank you - happy to walk through any part of the codebase.", {
    x: M, y: 5.4, w: 11.9, h: 0.44,
    fontFace: H, fontSize: 19, bold: true, color: ICE, isTextBox: true, margin: 0,
  });
  s.addText("Kusal Salpura  |  TeamPulse  |  Weekly Report Generator & Team Dashboard", {
    x: M, y: 5.9, w: 11.9, h: 0.35,
    fontFace: B, fontSize: 12.5, color: MUTED, isTextBox: true, margin: 0,
  });

  s.addNotes(
    "Four things I'd do next, in priority order. The analytics endpoint is first because it's the one place the " +
    "current dashboard is thinner than I'd like - the data is all in the database, it just needs aggregating " +
    "server-side rather than shipping every version to the browser. " +
    "On deployment I'd rather be accurate than impressive: I attempted Wasmer Edge, and its Node runtime is " +
    "beta enough that even a bare HTTP server didn't boot, so I'd move to a container host. " +
    "Happy to go deeper on any of this."
  );
}

pres.writeFile({ fileName: "TeamPulse-Technical-Presentation.pptx" })
  .then((f) => console.log("written:", f));
