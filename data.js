/* ============================================================
   MOCK DATA
   One editable file. Everything the prototype renders comes from here.

   Scenario: Evi, a freelance product designer, ~6 months of history
   in Toggl. Three clients + internal work. The history matters —
   several tasks have been done before, with real variance between
   estimate and actual. That variance is the raw material for any
   "learn from your own history" feature.

   Dates are generated relative to TODAY so the prototype never
   goes stale. Do not hardcode absolute dates.
   ============================================================ */

const DAY = 86400000;
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const TODAY = startOfDay(new Date());
const rel = (days, h = 9, m = 0) =>
  new Date(TODAY.getTime() + days * DAY).setHours(h, m, 0, 0);

/* ---------- PROJECTS ---------- */
export const projects = [
  { id: 'p1', name: 'Northwind Rebrand',   client: 'Northwind Co',  color: '#a84c9d', rate: 65, currency: 'EUR', budgetH: 80,  active: true },
  { id: 'p2', name: 'Fable App v2',        client: 'Fable Studio',  color: '#9a5fb2', rate: 70, currency: 'EUR', budgetH: 120, active: true },
  { id: 'p3', name: 'Meridian Onboarding', client: 'Meridian',      color: '#e87161', rate: 60, currency: 'EUR', budgetH: 40,  active: true },
  { id: 'p4', name: 'Admin & Ops',         client: null,            color: '#c8910a', rate: 0,  currency: 'EUR', budgetH: null, active: true },
];
export const projectById = (id) => projects.find((p) => p.id === id) || null;

/* ---------- TAGS ---------- */
export const tags = ['urgent', 'deep work', 'client call', 'revisions', 'admin'];

/* ---------- STATUSES ---------- */
export const statuses = [
  { id: 'todo',   label: 'Todo',        emoji: '📝' },
  { id: 'doing',  label: 'In Progress', emoji: '🚧' },
  { id: 'review', label: 'In Review',   emoji: '👀' },
  { id: 'done',   label: 'Done',        emoji: '✅' },
];
export const statusById = (id) => statuses.find((s) => s.id === id) || statuses[0];

/* ---------- PRIORITY ---------- */
export const priorities = [
  { id: 'low',    label: 'Low',    bars: 1 },
  { id: 'medium', label: 'Medium', bars: 2 },
  { id: 'high',   label: 'High',   bars: 3 },
];

/* ============================================================
   COMPLETED HISTORY
   ~6 months of finished work. This is the asset Toggl uniquely has.
   `kind` groups similar work so history can be matched to new tasks.
   ============================================================ */
export const history = [
  // kind: 'wireframes'
  { id: 'h1',  kind: 'wireframes', title: 'Wireframe checkout flow',      projectId: 'p2', estH: 6,  actualH: 9.5,  finished: -142 },
  { id: 'h2',  kind: 'wireframes', title: 'Wireframe settings screens',   projectId: 'p2', estH: 4,  actualH: 7.0,  finished: -118 },
  { id: 'h3',  kind: 'wireframes', title: 'Wireframe onboarding',         projectId: 'p3', estH: 5,  actualH: 8.5,  finished: -96  },
  { id: 'h4',  kind: 'wireframes', title: 'Wireframe dashboard v1',       projectId: 'p1', estH: 6,  actualH: 8.0,  finished: -74  },
  { id: 'h5',  kind: 'wireframes', title: 'Wireframe reporting screens',  projectId: 'p2', estH: 5,  actualH: 9.0,  finished: -31  },

  // kind: 'research', the one thing she consistently OVER-estimates
  { id: 'h6',  kind: 'research',   title: 'Competitor teardown',          projectId: 'p1', estH: 8,  actualH: 4.5,  finished: -130 },
  { id: 'h7',  kind: 'research',   title: 'User interviews round 1',      projectId: 'p3', estH: 10, actualH: 6.0,  finished: -88  },
  { id: 'h8',  kind: 'research',   title: 'Market scan',                  projectId: 'p1', estH: 6,  actualH: 3.5,  finished: -45  },

  // kind: 'revisions', the killer. Always wildly under-estimated.
  { id: 'h9',  kind: 'revisions',  title: 'Client revisions, round 2',   projectId: 'p1', estH: 2,  actualH: 11.0, finished: -120 },
  { id: 'h10', kind: 'revisions',  title: 'Client revisions, round 3',   projectId: 'p1', estH: 2,  actualH: 8.5,  finished: -102 },
  { id: 'h11', kind: 'revisions',  title: 'Feedback revisions',           projectId: 'p2', estH: 3,  actualH: 12.5, finished: -67  },
  { id: 'h12', kind: 'revisions',  title: 'Stakeholder revisions',        projectId: 'p3', estH: 2,  actualH: 9.0,  finished: -38  },
  { id: 'h13', kind: 'revisions',  title: 'Final revisions pass',         projectId: 'p2', estH: 3,  actualH: 10.0, finished: -12  },

  // kind: 'design-system'
  { id: 'h14', kind: 'design-system', title: 'Build component library',   projectId: 'p2', estH: 12, actualH: 15.0, finished: -110 },
  { id: 'h15', kind: 'design-system', title: 'Type & colour tokens',      projectId: 'p1', estH: 5,  actualH: 6.5,  finished: -58  },

  // kind: 'handoff'
  { id: 'h16', kind: 'handoff',   title: 'Dev handoff, checkout',        projectId: 'p2', estH: 3,  actualH: 5.5,  finished: -84  },
  { id: 'h17', kind: 'handoff',   title: 'Dev handoff, onboarding',      projectId: 'p3', estH: 3,  actualH: 4.5,  finished: -29  },

  // kind: 'meeting'
  { id: 'h18', kind: 'meeting',   title: 'Kickoff workshop',              projectId: 'p1', estH: 2,  actualH: 2.5,  finished: -150 },
  { id: 'h19', kind: 'meeting',   title: 'Weekly sync',                   projectId: 'p2', estH: 1,  actualH: 1.0,  finished: -21  },
  { id: 'h20', kind: 'meeting',   title: 'Design review',                 projectId: 'p1', estH: 1,  actualH: 1.5,  finished: -14  },
];

/* ============================================================
   ACTIVE TASKS
   Note tasks t1–t6: created in one go by the AI (sparkle) flow.
   They land with estimate: null, exactly as the real product does.
   `aiGenerated: true` marks them.
   ============================================================ */
export const tasks = [
  { id: 't1', title: 'Wireframe the new pricing page', kind: 'wireframes',    projectId: null, status: 'todo',   priority: null,     estH: null, tags: [],           due: null,     aiGenerated: true,  createdRel: 0 },
  { id: 't2', title: 'Competitor research',            kind: 'research',      projectId: null, status: 'todo',   priority: null,     estH: null, tags: [],           due: null,     aiGenerated: true,  createdRel: 0 },
  { id: 't3', title: 'Client revisions',               kind: 'revisions',     projectId: null, status: 'todo',   priority: null,     estH: null, tags: [],           due: null,     aiGenerated: true,  createdRel: 0 },
  { id: 't4', title: 'Update the design system',       kind: 'design-system', projectId: null, status: 'todo',   priority: null,     estH: null, tags: [],           due: null,     aiGenerated: true,  createdRel: 0 },
  { id: 't5', title: 'Dev handoff',                    kind: 'handoff',       projectId: null, status: 'todo',   priority: null,     estH: null, tags: [],           due: null,     aiGenerated: true,  createdRel: 0 },
  { id: 't6', title: 'Kickoff call with Northwind',    kind: 'meeting',       projectId: null, status: 'todo',   priority: null,     estH: null, tags: [],           due: null,     aiGenerated: true,  createdRel: 0 },

  // pre-existing, properly set up tasks
  { id: 't7',  title: 'Logo exploration',            kind: 'design-system', projectId: 'p1', status: 'doing',  priority: 'high',   estH: 8,  tags: ['deep work'],  due: 1,  aiGenerated: false, createdRel: -6 },
  { id: 't8',  title: 'Brand guidelines draft',      kind: 'design-system', projectId: 'p1', status: 'todo',   priority: 'medium', estH: 6,  tags: [],             due: 3,  aiGenerated: false, createdRel: -6 },
  { id: 't9',  title: 'Onboarding flow revisions',   kind: 'revisions',     projectId: 'p3', status: 'doing',  priority: 'high',   estH: 3,  tags: ['urgent'],     due: 0,  aiGenerated: false, createdRel: -4 },
  { id: 't10', title: 'Weekly sync, Fable',         kind: 'meeting',       projectId: 'p2', status: 'todo',   priority: 'low',    estH: 1,  tags: ['client call'],due: 0,  aiGenerated: false, createdRel: -1 },
  { id: 't11', title: 'Invoice February',            kind: null,            projectId: 'p4', status: 'todo',   priority: 'low',    estH: 1,  tags: ['admin'],      due: -1, aiGenerated: false, createdRel: -8 },
  { id: 't12', title: 'Component library audit',     kind: 'design-system', projectId: 'p2', status: 'review', priority: 'medium', estH: 5,  tags: [],             due: 2,  aiGenerated: false, createdRel: -9 },
  { id: 't13', title: 'Handoff notes for Meridian',  kind: 'handoff',       projectId: 'p3', status: 'done',   priority: 'medium', estH: 3,  tags: [],             due: -2, aiGenerated: false, createdRel: -11 },
];

/* ============================================================
   TIME ENTRIES, two weeks of backdated, uneven, realistic work.
   Uneven on purpose: a light Monday, a heavy Wednesday, a day off.
   ============================================================ */
const entry = (id, taskId, projectId, dayRel, startH, startM, mins) => ({
  id, taskId, projectId,
  start: rel(dayRel, startH, startM),
  end:   rel(dayRel, startH, startM) + mins * 60000,
  mins,
});

export const timeEntries = [
  // last week
  entry('e1',  't7',  'p1', -7, 9, 15, 95),
  entry('e2',  't7',  'p1', -7, 11, 30, 140),
  entry('e3',  't12', 'p2', -7, 15, 0, 75),
  entry('e4',  't8',  'p1', -6, 9, 45, 55),
  entry('e5',  't12', 'p2', -6, 11, 0, 185),
  entry('e6',  't9',  'p3', -6, 15, 30, 90),
  entry('e7',  't13', 'p3', -5, 8, 50, 210),  // heavy day
  entry('e8',  't13', 'p3', -5, 13, 15, 165),
  entry('e9',  't11', 'p4', -5, 17, 0, 40),
  entry('e10', 't7',  'p1', -4, 10, 0, 120),
  entry('e11', 't10', 'p2', -4, 14, 0, 60),
  // -3 is a day off. No entries. Deliberate.
  entry('e12', 't9',  'p3', -2, 9, 30, 145),
  entry('e13', 't12', 'p2', -2, 13, 0, 95),
  entry('e14', 't7',  'p1', -1, 9, 0, 175),
  entry('e15', 't8',  'p1', -1, 12, 45, 80),
  entry('e16', 't9',  'p3', -1, 15, 0, 110),
  // today
  entry('e17', 't7',  'p1', 0, 9, 10, 85),
  entry('e18', 't9',  'p3', 0, 11, 0, 45),
];

/* ---------- CURRENT USER / WORKSPACE ---------- */
export const user = {
  name: 'Evi',
  initials: 'E',
  org: "Evi's workspace",
  weeklyHours: 32,          // deliberately not 40, she works a 4-day week
  workDays: [1, 2, 3, 4],   // Mon–Thu
  currency: 'EUR',
};

/* ============================================================
   HELPERS
   ============================================================ */

/** Toggl's duration format: "1h 41m", "45m", "2h". */
export function fmtDuration(mins) {
  if (mins == null) return null;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

export const fmtHours = (h) => (h == null ? null : fmtDuration(Math.round(h * 60)));

/** Toggl's timer readout: "0:14:57". */
export function fmtClock(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Toggl's date format: "Jul 21". */
export function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Relative day label with Toggl's wording. */
export function fmtDue(dayRel) {
  if (dayRel == null) return null;
  if (dayRel === 0) return 'Today';
  if (dayRel === 1) return 'Tomorrow';
  if (dayRel === -1) return 'Yesterday';
  return fmtDate(TODAY.getTime() + dayRel * DAY);
}

export const minsForTask = (taskId) =>
  timeEntries.filter((e) => e.taskId === taskId).reduce((a, e) => a + e.mins, 0);

export const minsForProject = (projectId) =>
  timeEntries.filter((e) => e.projectId === projectId).reduce((a, e) => a + e.mins, 0);

export const entriesForDay = (dayRel) => {
  const from = TODAY.getTime() + dayRel * DAY;
  return timeEntries.filter((e) => e.start >= from && e.start < from + DAY);
};

export const minsForDay = (dayRel) =>
  entriesForDay(dayRel).reduce((a, e) => a + e.mins, 0);

/**
 * History stats for a kind of work, the core of any
 * "estimate from your own past" feature.
 */
export function historyFor(kind) {
  const rows = history.filter((h) => h.kind === kind);
  if (!rows.length) return null;
  const est = rows.reduce((a, r) => a + r.estH, 0);
  const act = rows.reduce((a, r) => a + r.actualH, 0);
  const medianActual = [...rows.map((r) => r.actualH)].sort((a, b) => a - b)[
    Math.floor(rows.length / 2)
  ];
  return {
    kind,
    count: rows.length,
    avgEstimateH: est / rows.length,
    avgActualH: act / rows.length,
    medianActualH: medianActual,
    ratio: act / est,             // >1 = habitually under-estimates
    rows,
  };
}

export const totalLoggedMins = timeEntries.reduce((a, e) => a + e.mins, 0);

/* ============================================================
   ONBOARDING, first-session calendar events
   The new-user activation feature. This is what a freshly
   connected Google Calendar would surface for THIS week:
   real meetings, a couple of focus blocks, and some personal
   events that should NOT become billable time.

   Fields:
     day       0=Mon … 4=Fri
     startH/M  start time (24h)
     mins      duration
     personal  true = pre-dimmed, not real work
     projectId best-guess project (editable in the confirm step)
   Deliberately uneven: a heavy Monday, a light Thursday.
   ============================================================ */
export const onboardingEvents = [
  { id: 'c1',  day: 0, startH: 9,  startM: 0,  mins: 60,  title: 'Kickoff call, Northwind',   projectId: 'p1', personal: false },
  { id: 'c2',  day: 0, startH: 11, startM: 0,  mins: 60,  title: 'Design review',              projectId: 'p1', personal: false },
  { id: 'c3',  day: 0, startH: 13, startM: 0,  mins: 45,  title: 'Lunch',                      projectId: null, personal: true  },
  { id: 'c4',  day: 0, startH: 14, startM: 30, mins: 120, title: 'Deep work: brand concepts',  projectId: 'p1', personal: false },
  { id: 'c5',  day: 1, startH: 9,  startM: 30, mins: 30,  title: 'Standup, Fable',            projectId: 'p2', personal: false },
  { id: 'c6',  day: 1, startH: 12, startM: 0,  mins: 45,  title: '1:1 with client',            projectId: 'p2', personal: false },
  { id: 'c7',  day: 1, startH: 17, startM: 0,  mins: 60,  title: 'Gym',                        projectId: null, personal: true  },
  { id: 'c8',  day: 2, startH: 10, startM: 0,  mins: 60,  title: 'Meridian onboarding sync',   projectId: 'p3', personal: false },
  { id: 'c9',  day: 2, startH: 13, startM: 0,  mins: 90,  title: 'Sprint planning, Fable',    projectId: 'p2', personal: false },
  { id: 'c10', day: 2, startH: 15, startM: 30, mins: 60,  title: 'Dentist',                    projectId: null, personal: true  },
  { id: 'c11', day: 3, startH: 9,  startM: 0,  mins: 30,  title: 'Weekly sync, Northwind',    projectId: 'p1', personal: false },
  { id: 'c12', day: 3, startH: 11, startM: 30, mins: 60,  title: 'Design critique',            projectId: 'p2', personal: false },
  { id: 'c13', day: 4, startH: 10, startM: 0,  mins: 45,  title: 'Client call, Meridian',     projectId: 'p3', personal: false },
  { id: 'c14', day: 4, startH: 14, startM: 0,  mins: 60,  title: 'Retro, Fable',              projectId: 'p2', personal: false },
];

/** Calendar providers for the connect step. Only Google returns a full
    week, Outlook returns an empty calendar, iCloud fails to connect.
    That's how the prototype reaches its empty and error states honestly. */
export const calendarProviders = [
  { id: 'google',  label: 'Google Calendar',  dot: '#4285F4', result: 'events' },
  { id: 'outlook', label: 'Outlook Calendar', dot: '#0A66C2', result: 'empty'  },
  { id: 'icloud',  label: 'iCloud Calendar',  dot: '#8e8e93', result: 'error'  },
];
