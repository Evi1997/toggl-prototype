/* ============================================================
   TOGGL 2.0, PROTOTYPE SHELL
   Preact + htm, no build step.

   This file is the *existing product*. Build your feature on top
   of it, do not rewrite it.

   Sections:
     1. State store
     2. Primitives (chips, buttons, checkbox…)
     3. Overlay primitives (Dialog, Menu, Field, Dropzone)
     4. Chrome (rail, sidebar, topbar)
     5. Toolbar menus (search, filters, group, sort, views)
     6. Views (List, Board, Calendar, Timeline, Reports, Projects)
     7. Task drawer (fully editable)
     8. Add-task dialog
     9. AI flows (Photo / Prompt / Text)
    10. Settings modal
    11. App root

   WHAT'S DELIBERATELY DEAD (and should stay dead, scope control
   is on the rubric): Members, Approvals, Time off, Upgrade,
   Download apps, org switcher, notifications, the calendar
   view-mode switcher, and report type switching.
   ============================================================ */

import { render } from 'https://esm.sh/preact@10.22.0';
import { useState, useEffect, useMemo, useRef, useCallback } from 'https://esm.sh/preact@10.22.0/hooks';
import { html } from 'https://esm.sh/htm@3.1.1/preact';
import { Icon } from './icons.js';
import * as D from './data.js';

const clone = (x) => JSON.parse(JSON.stringify(x));
const uid = () => Math.random().toString(36).slice(2, 9);

/* ============================================================
   1. STATE
   ============================================================ */

function useStore() {
  const [tasks, setTasks] = useState(() => []);
  const [entries, setEntries] = useState(() => []);
  const [view, setView] = useState('calendar');
  const [taskView, setTaskView] = useState('list');
  const [openTaskId, setOpenTaskId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [timer, setTimer] = useState({ running: false, taskId: null, seconds: 0 });

  // toolbar state
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ projects: [], statuses: [] });
  const [groupBy, setGroupBy] = useState(null);
  const [sortBy, setSortBy] = useState({ field: null, dir: 'asc' });

  // overlays
  const [dialog, setDialog] = useState(null);
  const [navOpen, setNavOpen] = useState(false);   // mobile sidebar drawer
  const [onbActive, setOnbActive] = useState(true); // first-session activation overlay (auto-opens)

  useEffect(() => {
    if (!timer.running) return;
    const t = setInterval(() => setTimer((s) => ({ ...s, seconds: s.seconds + 1 })), 1000);
    return () => clearInterval(t);
  }, [timer.running]);

  const toast = useCallback((message, action) => {
    const id = uid();
    setToasts((t) => [...t, { id, message, action }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000);
    return id;
  }, []);

  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const updateTask = useCallback((id, patch) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t))), []);

  const addTasks = useCallback((newOnes) => setTasks((ts) => [...newOnes, ...ts]), []);

  const deleteTask = useCallback((id) => {
    let removed, index;
    setTasks((ts) => {
      index = ts.findIndex((t) => t.id === id);
      removed = ts[index];
      return ts.filter((t) => t.id !== id);
    });
    setOpenTaskId(null);
    setTimeout(() => {
      toast(`"${removed.title}" deleted`, {
        label: 'Undo',
        onClick: () => setTasks((ts) => {
          const next = [...ts];
          next.splice(index, 0, removed);
          return next;
        }),
      });
    }, 0);
  }, [toast]);

  const startTimer = useCallback((taskId) => {
    setTimer({ running: true, taskId, seconds: 0 });
    const t = D.tasks.find((x) => x.id === taskId);
    toast(`Timer started${t ? `, ${t.title}` : ''}`);
  }, [toast]);

  const stopTimer = useCallback(() => {
    setTimer((s) => {
      if (s.running && s.seconds > 30) {
        const mins = Math.round(s.seconds / 60);
        const task = tasks.find((t) => t.id === s.taskId);
        setEntries((es) => [...es, {
          id: uid(), taskId: s.taskId, projectId: task ? task.projectId : null,
          start: Date.now() - s.seconds * 1000, end: Date.now(), mins,
        }]);
        toast(`${D.fmtDuration(mins)} logged`);
      }
      return { ...s, running: false };
    });
  }, [tasks, toast]);

  const updateEntry = useCallback((id, patch) =>
    setEntries((es) => es.map((e) => (e.id === id ? { ...e, ...patch } : e))), []);

  const addEntries = useCallback((list) => setEntries((es) => [...es, ...list]), []);

  const minsForTask = useCallback((taskId) =>
    entries.filter((e) => e.taskId === taskId).reduce((a, e) => a + e.mins, 0), [entries]);

  return {
    tasks, setTasks, updateTask, addTasks, deleteTask,
    entries, updateEntry, addEntries, minsForTask,
    view, setView, taskView, setTaskView,
    openTaskId, setOpenTaskId,
    toasts, toast, dismissToast,
    timer, setTimer, startTimer, stopTimer,
    search, setSearch, filters, setFilters,
    groupBy, setGroupBy, sortBy, setSortBy,
    dialog, setDialog,
    navOpen, setNavOpen,
    onbActive, setOnbActive,
  };
}

/* ============================================================
   2. PRIMITIVES
   ============================================================ */

const Btn = ({ variant = 'secondary', icon: I, children, ...rest }) => html`
  <button class=${`btn btn-${variant}`} ...${rest}>
    ${I && html`<${I} size=${16} />`}${children}
  </button>`;

const IconBtn = ({ icon: I, active, tip, size = 18, ...rest }) => html`
  <button class=${`icon-btn ${active ? 'is-active' : ''} ${tip ? 'tip' : ''}`}
          data-tip=${tip} aria-label=${tip} ...${rest}>
    <${I} size=${size} />
  </button>`;

const Ctrl = ({ icon: I, label, value, active, ...rest }) => html`
  <button class=${`btn btn-secondary ${active ? 'is-open' : ''}`} ...${rest}>
    ${I && html`<${I} size=${16} />`}
    <span>${label}${value ? ':' : ''}</span>
    ${value && html`<span class="ctrl-value">${value}</span>`}
  </button>`;

const CheckCircle = ({ done, onClick }) => html`
  <button class=${`check-circle ${done ? 'is-done' : ''}`}
          aria-label=${done ? 'Mark as not done' : 'Mark as done'}
          onClick=${onClick}>
    ${done && html`<${Icon.Check} size=${12} />`}
  </button>`;

const StatusChip = ({ statusId }) => {
  const s = D.statusById(statusId);
  return html`<span class="chip"><span>${s.emoji}</span>${s.label}</span>`;
};

const PriorityBars = ({ priority }) => {
  if (!priority) return null;
  const p = D.priorities.find((x) => x.id === priority);
  return html`<span class="tip" data-tip=${`${p.label} priority`}
    style="display:inline-flex;align-items:flex-end;gap:2px;height:14px">
    ${[1, 2, 3].map((i) => html`
      <span style=${`width:3px;border-radius:1px;height:${4 + i * 3}px;background:${
        i <= p.bars ? 'var(--fg-primary)' : 'var(--stroke-primary)'}`} />`)}
  </span>`;
};

const ProjectChip = ({ projectId }) => {
  const p = D.projectById(projectId);
  if (!p) return null;
  return html`<span class="project-chip">
    <span class="project-dot" style=${`background:${p.color}`} />
    <span class="truncate">${p.name}</span>
  </span>`;
};

const Tag = ({ label, onRemove }) => html`
  <span class="chip"><${Icon.Tag} size=${12} />${label}
    ${onRemove && html`<button class="chip-x" onClick=${onRemove} aria-label=${`Remove ${label}`}>
      <${Icon.Close} size=${11} /></button>`}
  </span>`;

const Empty = () => html`<span class="prop-empty">Empty</span>`;

const Bar = ({ pct, tone }) => html`
  <div class="bar"><div class=${`bar-fill ${tone ? `is-${tone}` : ''}`}
    style=${`width:${Math.min(100, Math.max(0, pct))}%`} /></div>`;

/** In-context attention banner (Toggl's pink nudge). Persistent + dismissible.
    Use for education/suggestions inside a view, NOT for transient confirmations
    (those are toasts). tone: 'muted' (default) | 'accent'. */
const Banner = ({ icon: I = Icon.Info, title, body, action, onDismiss, tone = 'muted' }) => html`
  <div class=${`banner banner-${tone}`}>
    <span class="banner-icon"><${I} size=${20} /></span>
    <div class="banner-text">
      <span class="banner-title">${title}</span>
      ${body && html`<span class="banner-body">${body}</span>`}
    </div>
    <div class="grow" />
    ${action && html`<${Btn} variant="primary" onClick=${action.onClick}>${action.label}<//>`}
    ${onDismiss && html`<${IconBtn} icon=${Icon.Close} tip="Dismiss" onClick=${onDismiss} />`}
  </div>`;

const EmptyState = ({ title, body, action }) => html`
  <div class="empty-state">
    <${Icon.Search} size=${32} style="color:var(--fg-tertiary)" />
    <h3>${title}</h3>
    <p>${body}</p>
    ${action}
  </div>`;

/* ============================================================
   3. OVERLAY PRIMITIVES
   ============================================================ */

/** Centered modal. Esc closes, click-outside closes, focus is trapped loosely. */
const Dialog = ({ title, onClose, footer, width = 520, children }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return html`
    <div class="scrim" onClick=${onClose} />
    <div class="modal" role="dialog" aria-label=${title} style=${`width:${width}px`}>
      <div class="modal-head">
        <span class="t-h4">${title}</span>
        <div class="grow" />
        <${IconBtn} icon=${Icon.Close} tip="Close" onClick=${onClose} />
      </div>
      <div class="modal-body">${children}</div>
      ${footer && html`<div class="modal-foot">${footer}</div>`}
    </div>`;
};

/** Anchored dropdown. Wrap the trigger in .anchor and render this inside it. */
const Menu = ({ onClose, align = 'left', width = 240, children }) => {
  const ref = useRef(null);
  useEffect(() => {
    const onDoc = (e) => ref.current && !ref.current.contains(e.target) && onClose();
    const onKey = (e) => e.key === 'Escape' && onClose();
    setTimeout(() => document.addEventListener('mousedown', onDoc), 0);
    window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); window.removeEventListener('keydown', onKey); };
  }, [onClose]);
  return html`
    <div ref=${ref} class="popover"
         style=${`${align === 'right' ? 'right:0' : 'left:0'};top:calc(100% + 6px);width:${width}px`}>
      ${children}
    </div>`;
};

const MenuItem = ({ icon: I, checked, children, ...rest }) => html`
  <button class="popover-item" ...${rest}>
    ${I && html`<${I} size=${16} />`}
    <span class="grow" style="text-align:left">${children}</span>
    ${checked && html`<${Icon.Check} size=${14} style="color:var(--accent)" />`}
  </button>`;

const MenuLabel = ({ children }) => html`<div class="popover-label">${children}</div>`;
const MenuSep = () => html`<div class="popover-sep" />`;

const Field = ({ label, children, hint }) => html`
  <label class="field">
    <span class="t-field-label">${label}</span>
    ${children}
    ${hint && html`<span class="field-hint">${hint}</span>`}
  </label>`;

const Select = ({ value, options, onChange, placeholder = 'Empty' }) => html`
  <div class="select-wrap">
    <select class="input" value=${value == null ? '' : value}
            onChange=${(e) => onChange(e.target.value === '' ? null : e.target.value)}>
      <option value="">${placeholder}</option>
      ${options.map((o) => html`<option key=${o.value} value=${o.value}>${o.label}</option>`)}
    </select>
    <span class="select-chevron"><${Icon.Chevron} size=${16} /></span>
  </div>`;

/** File dropzone that actually accepts a file and shows a preview. */
const Dropzone = ({ file, onFile }) => {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);
  const pick = () => inputRef.current && inputRef.current.click();
  const take = (f) => { if (f) onFile(f); };

  if (file) {
    return html`
      <div class="dropzone has-file">
        ${file.url
          ? html`<img src=${file.url} alt=${file.name} class="dropzone-preview" />`
          : html`<${Icon.Photo} size=${28} style="color:var(--accent)" />`}
        <div class="col g4" style="min-width:0">
          <span class="t-p1 truncate">${file.name}</span>
          <span class="fg-secondary" style="font-size:12px">${file.size}</span>
        </div>
        <div class="grow" />
        <${Btn} onClick=${() => onFile(null)}>Replace<//>
      </div>`;
  }

  return html`
    <button type="button"
      class=${`dropzone ${over ? 'is-over' : ''}`}
      onClick=${pick}
      onDragOver=${(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave=${() => setOver(false)}
      onDrop=${(e) => {
        e.preventDefault(); setOver(false);
        const f = e.dataTransfer.files[0];
        if (f) take({ name: f.name, size: `${Math.round(f.size / 1024)} KB`, url: URL.createObjectURL(f) });
      }}>
      <${Icon.Photo} size=${28} style="color:var(--fg-tertiary)" />
      <span class="t-p1">Drop an image, or click to browse</span>
      <span class="fg-secondary" style="font-size:12px">A whiteboard photo, a sticky-note wall, a screenshot of your notes</span>
      <input ref=${inputRef} type="file" accept="image/*" style="display:none"
        onChange=${(e) => {
          const f = e.target.files[0];
          if (f) take({ name: f.name, size: `${Math.round(f.size / 1024)} KB`, url: URL.createObjectURL(f) });
        }} />
    </button>`;
};

/* ============================================================
   4. CHROME
   ============================================================ */

const Rail = ({ store }) => html`
  <div class="rail">
    <div class="rail-logo"><span>◔</span><span>2.0</span></div>
    <div class="rail-spacer" />
    <${IconBtn} icon=${Icon.Collapse} tip="Collapse sidebar" />
    <div class="rail-spacer" />
    <div class="rail-avatar">${D.user.initials}</div>
    <${IconBtn} icon=${Icon.Bell} tip="Notifications" />
    <${IconBtn} icon=${Icon.Send} tip="Send feedback" />
    <${IconBtn} icon=${Icon.Help} tip="Help" />
  </div>`;

const NavItem = ({ icon: I, label, active, star, meta, onClick }) => html`
  <button class=${`nav-item ${active ? 'is-active' : ''}`} onClick=${onClick}>
    <span class="icon"><${I} size=${18} /></span>
    <span class="label">${label}</span>
    ${meta && html`<span class="meta">${meta}</span>`}
    ${star && html`<span class="star"><${Icon.Star} size=${12} /></span>`}
  </button>`;

const Sidebar = ({ store }) => {
  const { view, setView, timer, setDialog } = store;
  return html`
    <nav class="sidebar" onClick=${(e) => e.target.closest('.nav-item') && store.setNavOpen(false)}>
      <div class="sidebar-org">
        <span class="sidebar-org-name">${D.user.org}</span>
        <${Icon.Chevron} size=${16} />
      </div>

      <div class="sidebar-group">
        <div class="sidebar-group-label t-nav-section">Track</div>
        <${NavItem} icon=${Icon.Timer} label="Timer"
          active=${view === 'calendar'}
          meta=${timer.running ? D.fmtDuration(Math.round(timer.seconds / 60)) : null}
          onClick=${() => setView('calendar')} />
      </div>

      <div class="sidebar-group">
        <div class="sidebar-group-label t-nav-section">Analyze</div>
        <${NavItem} icon=${Icon.Reports} label="Reports"
          active=${view === 'reports'} onClick=${() => setView('reports')} />
      </div>

      <div class="sidebar-group">
        <div class="sidebar-group-label t-nav-section">Plan</div>
        <${NavItem} icon=${Icon.Folder} label="Projects"
          active=${view === 'projects'} onClick=${() => setView('projects')} />
        <${NavItem} icon=${Icon.Tasks} label="Tasks"
          active=${view === 'tasks'} onClick=${() => setView('tasks')} />
        <${NavItem} icon=${Icon.Timeline} label="Timeline" star
          active=${view === 'timeline'} onClick=${() => setView('timeline')} />
      </div>

      <div class="sidebar-group">
        <div class="sidebar-group-label t-nav-section">Manage</div>
        <${NavItem} icon=${Icon.Members} label="Members" />
        <${NavItem} icon=${Icon.Approve} label="Approvals" star />
        <${NavItem} icon=${Icon.TimeOff} label="Time off" star />
      </div>

      <div class="sidebar-spacer" />

      <div class="sidebar-group">
        <${NavItem} icon=${Icon.Upgrade} label="Upgrade"
          meta=${html`<span class="badge-days">30 DAYS</span>`} />
        <${NavItem} icon=${Icon.Download} label="Download apps" />
        <${NavItem} icon=${Icon.Settings} label="Settings"
          onClick=${() => setDialog({ type: 'settings' })} />
      </div>
    </nav>`;
};

const Topbar = ({ store }) => {
  const { timer, stopTimer, startTimer, tasks, setDialog } = store;
  const task = tasks.find((t) => t.id === timer.taskId);
  const [draft, setDraft] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setDialog({ type: 'addTask', prefill: draft.trim(), startTimer: true });
    setDraft('');
  };

  const project = task ? D.projectById(task.projectId) : null;

  return html`
    <form class="topbar" onSubmit=${onSubmit}>
      <button type="button" class="icon-btn mobile-only" aria-label="Open menu"
              onClick=${() => store.setNavOpen(true)}>
        <${Icon.Menu} size=${20} />
      </button>
      <input class="timer-input" placeholder="What are you working on?"
             value=${timer.running && task ? task.title : draft}
             readonly=${timer.running && !!task}
             onInput=${(e) => setDraft(e.target.value)} />

      <button type="button" class="entry-chip"><span class="entry-sym">@</span>Task</button>
      ${project
        ? html`<button type="button" class="entry-chip is-set">
            <span class="project-dot" style=${`background:${project.color}`} />
            ${project.name}${project.client ? html` · <span class="fg-secondary">${project.client}</span>` : ''}
          </button>`
        : html`<button type="button" class="entry-chip"><${Icon.Folder} size=${14} />Project</button>`}
      <button type="button" class="entry-chip"><span class="entry-sym">#</span>Tags</button>
      <${IconBtn} icon=${Icon.Dollar} tip="Billable" size=${16} />
      <button type="button" class="icon-btn tip" data-tip="Save entry" aria-label="Save entry">
        <${Icon.ArrowUp} size=${16} />
      </button>

      <span class="focus-pill">Focus: 15m <${Icon.Skip} size=${13} /></span>
      <span class="timer-readout">${D.fmtClock(timer.seconds)}</span>
      <button type="button" class=${`timer-btn ${timer.running ? 'is-running' : 'is-idle'}`}
              aria-label=${timer.running ? 'Stop timer' : 'Start timer'}
              onClick=${() => timer.running ? stopTimer() : startTimer(timer.taskId)}>
        <${timer.running ? Icon.Stop : Icon.Play} size=${16} />
      </button>
      <${IconBtn} icon=${Icon.More} tip="More" />
    </form>`;
};

const PageHead = ({ title, view, right }) => html`
  <div class="page-head">
    <div class="page-title">
      <span class="t-h3">${title}</span>
      ${view && html`<span class="sep">·</span><span class="view t-h3">${view}</span>`}
    </div>
    <div class="grow" />
    ${right}
  </div>`;

/* ============================================================
   5. TOOLBAR MENUS
   ============================================================ */

const SearchField = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => { if (open && ref.current) ref.current.focus(); }, [open]);
  if (!open && !value) {
    return html`<${IconBtn} icon=${Icon.Search} tip="Search" onClick=${() => setOpen(true)} />`;
  }
  return html`
    <div class="search-field">
      <${Icon.Search} size=${16} style="color:var(--fg-secondary)" />
      <input ref=${ref} placeholder="Search tasks" value=${value}
             onInput=${(e) => onChange(e.target.value)}
             onBlur=${() => !value && setOpen(false)} />
      ${value && html`<button class="icon-btn" style="width:24px;height:24px"
        aria-label="Clear search" onClick=${() => { onChange(''); setOpen(false); }}>
        <${Icon.Close} size=${14} /></button>`}
    </div>`;
};

const FiltersMenu = ({ store, onClose }) => {
  const { filters, setFilters } = store;
  const toggle = (key, id) => setFilters((f) => ({
    ...f,
    [key]: f[key].includes(id) ? f[key].filter((x) => x !== id) : [...f[key], id],
  }));
  const count = filters.projects.length + filters.statuses.length;
  return html`
    <${Menu} onClose=${onClose} width=${260}>
      <${MenuLabel}>Project<//>
      ${D.projects.map((p) => html`
        <${MenuItem} key=${p.id} checked=${filters.projects.includes(p.id)}
          onClick=${() => toggle('projects', p.id)}>
          <span class="row g8"><span class="project-dot" style=${`background:${p.color}`} />${p.name}</span>
        <//>`)}
      <${MenuSep} />
      <${MenuLabel}>Status<//>
      ${D.statuses.map((s) => html`
        <${MenuItem} key=${s.id} checked=${filters.statuses.includes(s.id)}
          onClick=${() => toggle('statuses', s.id)}>${s.emoji} ${s.label}<//>`)}
      ${count > 0 && html`
        <${MenuSep} />
        <${MenuItem} icon=${Icon.Close}
          onClick=${() => { setFilters({ projects: [], statuses: [] }); onClose(); }}>
          Clear all filters
        <//>`}
    <//>`;
};

const GroupByMenu = ({ store, onClose }) => {
  const { groupBy, setGroupBy } = store;
  const opts = [
    { id: null, label: 'None' },
    { id: 'status', label: 'Status' },
    { id: 'project', label: 'Project' },
    { id: 'due', label: 'Due date' },
  ];
  return html`
    <${Menu} onClose=${onClose} width=${200}>
      ${opts.map((o) => html`
        <${MenuItem} key=${String(o.id)} checked=${groupBy === o.id}
          onClick=${() => { setGroupBy(o.id); onClose(); }}>${o.label}<//>`)}
    <//>`;
};

const SortByMenu = ({ store, onClose }) => {
  const { sortBy, setSortBy } = store;
  const opts = [
    { id: null, label: 'Default' },
    { id: 'title', label: 'Name' },
    { id: 'estH', label: 'Estimate' },
    { id: 'due', label: 'Due date' },
    { id: 'priority', label: 'Priority' },
  ];
  return html`
    <${Menu} onClose=${onClose} width=${220}>
      ${opts.map((o) => html`
        <${MenuItem} key=${String(o.id)} checked=${sortBy.field === o.id}
          onClick=${() => { setSortBy({ field: o.id, dir: 'asc' }); onClose(); }}>${o.label}<//>`)}
      ${sortBy.field && html`
        <${MenuSep} />
        <${MenuItem} icon=${Icon.SortBy}
          onClick=${() => setSortBy((s) => ({ ...s, dir: s.dir === 'asc' ? 'desc' : 'asc' }))}>
          ${sortBy.dir === 'asc' ? 'Ascending' : 'Descending'}
        <//>`}
    <//>`;
};

const SavedViewsMenu = ({ onClose, store }) => html`
  <${Menu} onClose=${onClose} width=${240}>
    <${MenuLabel}>Saved views<//>
    <${MenuItem} icon=${Icon.Layers} checked
      onClick=${() => { store.setFilters({ projects: [], statuses: [] }); store.setGroupBy(null); onClose(); }}>
      All tasks
    <//>
    <${MenuItem} icon=${Icon.Layers}
      onClick=${() => { store.setFilters({ projects: [], statuses: ['todo', 'doing'] }); onClose(); }}>
      Active work
    <//>
    <${MenuItem} icon=${Icon.Layers}
      onClick=${() => { store.setGroupBy('project'); onClose(); }}>
      By project
    <//>
  <//>`;

/* ============================================================
   6. VIEWS
   ============================================================ */

/** Shared filter + sort + group pipeline. */
function useVisibleTasks(store) {
  const { tasks, search, filters, sortBy, groupBy } = store;
  return useMemo(() => {
    let out = tasks;
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.tags.some((g) => g.toLowerCase().includes(q)));
    }
    if (filters.projects.length) out = out.filter((t) => filters.projects.includes(t.projectId));
    if (filters.statuses.length) out = out.filter((t) => filters.statuses.includes(t.status));

    if (sortBy.field) {
      const rank = { low: 1, medium: 2, high: 3 };
      out = [...out].sort((a, b) => {
        let x = a[sortBy.field], y = b[sortBy.field];
        if (sortBy.field === 'priority') { x = rank[x] || 0; y = rank[y] || 0; }
        if (x == null) return 1;
        if (y == null) return -1;
        const c = typeof x === 'string' ? x.localeCompare(y) : x - y;
        return sortBy.dir === 'asc' ? c : -c;
      });
    }

    if (!groupBy) return [{ key: null, label: null, tasks: out }];

    const groups = new Map();
    out.forEach((t) => {
      let key, label;
      if (groupBy === 'status') { key = t.status; label = `${D.statusById(t.status).emoji} ${D.statusById(t.status).label}`; }
      else if (groupBy === 'project') { const p = D.projectById(t.projectId); key = t.projectId || 'none'; label = p ? p.name : 'No project'; }
      else { key = String(t.due); label = t.due == null ? 'No due date' : D.fmtDue(t.due); }
      if (!groups.has(key)) groups.set(key, { key, label, tasks: [] });
      groups.get(key).tasks.push(t);
    });
    return [...groups.values()];
  }, [tasks, search, filters, sortBy, groupBy]);
}

/* ---------- Tasks: List ---------- */
const TaskRow = ({ t, store }) => {
  const { updateTask, setOpenTaskId, minsForTask, startTimer, timer } = store;
  const logged = minsForTask(t.id);
  const isTiming = timer.running && timer.taskId === t.id;
  return html`
    <tr class=${isTiming ? 'is-timing' : ''} onClick=${() => setOpenTaskId(t.id)} style="cursor:pointer">
      <td onClick=${(e) => e.stopPropagation()}>
        <${CheckCircle} done=${t.status === 'done'}
          onClick=${() => updateTask(t.id, { status: t.status === 'done' ? 'todo' : 'done' })} />
      </td>
      <td>
        <div class="row g8">
          <span class=${`task-title ${t.status === 'done' ? 'is-done' : ''}`}>${t.title}</span>
          ${t.tags.map((g) => html`<${Tag} key=${g} label=${g} />`)}
        </div>
      </td>
      <td>${t.projectId ? html`<${ProjectChip} projectId=${t.projectId} />` : html`<${Empty} />`}</td>
      <td>${t.estH != null ? html`<span class="mono">${D.fmtHours(t.estH)}</span>` : html`<${Empty} />`}</td>
      <td class="mono">${logged ? D.fmtDuration(logged) : html`<${Empty} />`}</td>
      <td>${t.priority ? html`<${PriorityBars} priority=${t.priority} />` : html`<${Empty} />`}</td>
      <td>${t.due != null
        ? html`<span class=${t.due === 0 ? 'fg-accent' : t.due < 0 ? 'fg-error' : ''}>${D.fmtDue(t.due)}</span>`
        : html`<${Empty} />`}</td>
      <td onClick=${(e) => e.stopPropagation()}>
        <button class=${`row-play ${isTiming ? 'is-timing' : ''}`}
                aria-label=${isTiming ? 'Timer running' : `Start timer for ${t.title}`}
                onClick=${() => startTimer(t.id)}>
          <${isTiming ? Icon.Stop : Icon.Play} size=${13} />
        </button>
      </td>
    </tr>`;
};

const TasksList = ({ store }) => {
  const groups = useVisibleTasks(store);
  const { setDialog, search, filters } = store;
  const total = groups.reduce((a, g) => a + g.tasks.length, 0);

  if (!total) {
    const filtered = search.trim() || filters.projects.length || filters.statuses.length;
    return html`<${EmptyState}
      title=${filtered ? 'No tasks match' : 'Nothing here yet'}
      body=${filtered
        ? "Try a different search, or clear your filters to see everything again."
        : "Tasks you create will show up in this list. Add one to get started."}
      action=${filtered
        ? html`<${Btn} onClick=${() => { store.setSearch(''); store.setFilters({ projects: [], statuses: [] }); }}>Clear filters<//>`
        : html`<${Btn} variant="primary" icon=${Icon.Plus} onClick=${() => setDialog({ type: 'addTask' })}>Add task<//>`} />`;
  }

  return html`
    <table class="tbl">
      <thead>
        <tr>
          <th style="width:56px" /><th>Tasks</th>
          <th style="width:180px">Project</th><th style="width:110px">Estimate</th>
          <th style="width:110px">Logged</th><th style="width:90px">Priority</th>
          <th style="width:120px">Due</th><th style="width:56px" />
        </tr>
      </thead>
      ${groups.map((g) => html`
        <tbody key=${String(g.key)}>
          ${g.label && html`
            <tr class="group-row"><td colspan="8">
              <span class="t-p2">${g.label}</span>
              <span class="fg-secondary" style="font-weight:500"> ${g.tasks.length}</span>
            </td></tr>`}
          ${g.tasks.map((t) => html`<${TaskRow} key=${t.id} t=${t} store=${store} />`)}
        </tbody>`)}
    </table>
    <button class="add-inline" onClick=${() => setDialog({ type: 'addTask' })}>
      <${Icon.Plus} size=${14} /> Add task
    </button>`;
};

/* ---------- Tasks: Board ---------- */
const TasksBoard = ({ store }) => {
  const { setOpenTaskId, updateTask, setDialog } = store;
  const groups = useVisibleTasks(store);
  const all = groups.flatMap((g) => g.tasks);

  return html`
    <div class="board">
      ${D.statuses.map((s) => {
        const col = all.filter((t) => t.status === s.id);
        return html`
          <div class="board-col" key=${s.id}
            onDragOver=${(e) => e.preventDefault()}
            onDrop=${(e) => {
              const id = e.dataTransfer.getData('text/plain');
              if (id) updateTask(id, { status: s.id });
            }}>
            <div class="board-col-head">
              <span>${s.emoji}</span><span>${s.label}</span>
              <span class="board-col-count">${col.length}</span>
            </div>
            <div class="board-cards">
              ${col.map((t) => html`
                <div class="card" key=${t.id} draggable
                  onDragStart=${(e) => e.dataTransfer.setData('text/plain', t.id)}
                  onClick=${() => setOpenTaskId(t.id)} style="cursor:pointer">
                  <div class="card-head" onClick=${(e) => e.stopPropagation()}>
                    <${CheckCircle} done=${t.status === 'done'}
                      onClick=${() => updateTask(t.id, { status: t.status === 'done' ? 'todo' : 'done' })} />
                    <span class="card-title">${t.title}</span>
                  </div>
                  <div class="card-meta">
                    <${StatusChip} statusId=${t.status} />
                    <${PriorityBars} priority=${t.priority} />
                    ${t.due != null && html`<span class="chip chip-accent">${D.fmtDue(t.due)}</span>`}
                    ${t.estH != null && html`<span class="chip mono">${D.fmtHours(t.estH)}</span>`}
                  </div>
                  ${(t.projectId || t.tags.length) ? html`
                    <div class="card-meta">
                      ${t.projectId && html`<${ProjectChip} projectId=${t.projectId} />`}
                      ${t.tags.map((g) => html`<${Tag} key=${g} label=${g} />`)}
                    </div>` : null}
                </div>`)}
              <button class="add-inline" style="padding:8px 4px"
                onClick=${() => setDialog({ type: 'addTask', status: s.id })}>
                <${Icon.Plus} size=${14} /> Add task
              </button>
            </div>
          </div>`;
      })}
    </div>`;
};

/* ---------- Calendar ---------- */
const HOUR_H = 44, CAL_START = 8, CAL_END = 20, SNAP = HOUR_H / 4; // 15-min snap
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const hexA = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

const CalendarView = ({ store }) => {
  const { entries, updateEntry, tasks, toast } = store;
  const dow = D.TODAY.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const days = [0, 1, 2, 3, 4].map((i) => mondayOffset + i);

  const gridRef = useRef(null);
  const dragRef = useRef(null);
  const [drag, setDrag] = useState(null);

  const dayOf = (e) => {
    const s = new Date(e.start); s.setHours(0, 0, 0, 0);
    return Math.round((s.getTime() - D.TODAY.getTime()) / 86400000);
  };
  const topOf = (e) => {
    const s = new Date(e.start);
    return (s.getHours() + s.getMinutes() / 60 - CAL_START) * HOUR_H;
  };

  const entriesForDay = (d) => {
    const from = D.TODAY.getTime() + d * 86400000;
    return entries.filter((e) => e.start >= from && e.start < from + 86400000);
  };
  const loggedWeek = days.reduce((a, d) => a + entriesForDay(d).reduce((x, e) => x + e.mins, 0), 0);
  const plannedWeek = tasks.filter((t) => t.estH != null).reduce((a, t) => a + t.estH * 60, 0);

  const onMove = (ev) => {
    const d = dragRef.current; if (!d) return;
    const g = gridRef.current.getBoundingClientRect();
    const colW = (g.width - 64) / 5;
    const dayIdx = clamp(Math.floor((ev.clientX - g.left - 64) / colW), 0, 4);
    const maxTop = (CAL_END - CAL_START) * HOUR_H - d.h;
    const raw = ev.clientY - g.top - 56 - d.grabY;
    const topPx = clamp(Math.round(raw / SNAP) * SNAP, 0, maxTop);
    const moved = d.moved || Math.abs(topPx - d.startTop) > 3 || dayIdx !== d.startDayIdx;
    dragRef.current = { ...d, dayIdx, topPx, moved };
    setDrag(dragRef.current);
  };
  const onUp = () => {
    const d = dragRef.current;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    dragRef.current = null; setDrag(null);
    if (!d) return;
    if (d.moved) {
      const dayRel = days[d.dayIdx];
      const mins = (d.topPx / HOUR_H) * 60;
      const start = new Date(D.TODAY.getTime() + dayRel * 86400000);
      start.setHours(CAL_START, 0, 0, 0);
      const startMs = start.getTime() + mins * 60000;
      updateEntry(d.id, { start: startMs, end: startMs + d.entryMins * 60000 });
      const at = new Date(startMs);
      toast(`Moved to ${D.fmtDue(dayRel)}, ${at.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`);
    } else if (d.taskId) {
      store.setOpenTaskId(d.taskId);
    }
  };
  const onDown = (ev, e) => {
    ev.preventDefault();
    const rect = ev.currentTarget.getBoundingClientRect();
    const h = Math.max(18, (e.mins / 60) * HOUR_H);
    dragRef.current = {
      id: e.id, taskId: e.taskId, entryMins: e.mins, h,
      grabY: ev.clientY - rect.top,
      startTop: topOf(e), topPx: topOf(e),
      startDayIdx: days.indexOf(dayOf(e)), dayIdx: days.indexOf(dayOf(e)),
      moved: false,
    };
    setDrag(dragRef.current);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const renderDay = (e) => (drag && drag.id === e.id) ? days[drag.dayIdx] : dayOf(e);
  const renderTop = (e) => (drag && drag.id === e.id) ? drag.topPx : topOf(e);

  return html`
    <div class="summary-strip">
      <div class="summary-item">
        <span class="fg-secondary">Logged</span>
        <${Bar} pct=${(loggedWeek / Math.max(1, loggedWeek + plannedWeek)) * 100} />
        <span class="val">${D.fmtDuration(loggedWeek)}</span>
      </div>
      <div class="summary-item">
        <span class="fg-secondary">Planned</span>
        <${Bar} pct=${(plannedWeek / Math.max(1, loggedWeek + plannedWeek)) * 100} />
        <span class="val">${D.fmtDuration(plannedWeek)}</span>
      </div>
      <div class="grow" />
      <button class="row g4 fg-secondary" style="font-weight:600"
              onClick=${() => store.setView('reports')}>
        View reports <${Icon.ChevronR} size=${14} />
      </button>
    </div>

    <div ref=${gridRef} class="cal-grid" style="display:grid;grid-template-columns:64px repeat(5,1fr);height:100%">
      <div style="border-right:1px solid var(--stroke-primary)">
        <div style="height:56px;border-bottom:1px solid var(--stroke-primary)" />
        ${Array.from({ length: CAL_END - CAL_START }, (_, i) => html`
          <div key=${i} style=${`height:${HOUR_H}px;padding:2px 8px;text-align:right;font-size:11px;color:var(--fg-secondary)`}>
            ${((CAL_START + i) % 12 || 12)}${CAL_START + i < 12 ? 'AM' : 'PM'}
          </div>`)}
      </div>

      ${days.map((d) => {
        const date = new Date(D.TODAY.getTime() + d * 86400000);
        const isToday = d === 0;
        return html`
          <div key=${d} style="border-right:1px solid var(--stroke-primary);position:relative">
            <div style="height:56px;border-bottom:1px solid var(--stroke-primary);display:flex;align-items:center;justify-content:center;gap:6px">
              <span class="t-h3" style=${isToday
                ? 'background:var(--accent);color:#fff;border-radius:999px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:15px'
                : ''}>${date.getDate()}</span>
              <span class="fg-secondary">${date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            </div>
            <div style="position:relative">
              ${Array.from({ length: CAL_END - CAL_START }, (_, i) => html`
                <div key=${i} style=${`height:${HOUR_H}px;border-bottom:1px solid var(--stroke-muted)`} />`)}
              ${entries.filter((e) => renderDay(e) === d).map((e) => {
                const top = renderTop(e);
                const h = Math.max(18, (e.mins / 60) * HOUR_H);
                const p = D.projectById(e.projectId);
                const task = tasks.find((t) => t.id === e.taskId);
                const color = p ? p.color : '#a84c9d';
                const dragging = drag && drag.id === e.id && drag.moved;
                const roomForSubtitle = h >= 42;
                return html`
                  <div key=${e.id} class=${`cal-entry ${dragging ? 'is-dragging' : ''}`}
                    onPointerDown=${(ev) => onDown(ev, e)}
                    style=${`top:${top}px;height:${h}px;
                             background:${hexA(color, 0.16)};
                             border-left:4px solid ${color};
                             color:${color};`}
                    title=${`${task ? task.title : (e.title || 'Time entry')} · ${D.fmtDuration(e.mins)}`}>
                    <div class="truncate cal-entry-title">${task ? task.title : (e.title || 'Time entry')}</div>
                    ${roomForSubtitle && html`
                      <div class="truncate cal-entry-sub">
                        ${p ? p.name : ''} · ${D.fmtDuration(e.mins)}
                      </div>`}
                  </div>`;
              })}
            </div>
          </div>`;
      })}
    </div>`;
};

/* ---------- Timeline ---------- */
const TimelineView = ({ store }) => {
  const { tasks, setOpenTaskId } = store;
  const dow = D.TODAY.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const days = [0, 1, 2, 3, 4, 5, 6].map((i) => mondayOffset + i);

  const capacityFor = (d) => {
    const day = new Date(D.TODAY.getTime() + d * 86400000).getDay();
    return D.user.workDays.includes(day)
      ? (D.user.weeklyHours / D.user.workDays.length) * 60 : 0;
  };
  const plannedFor = (d) =>
    tasks.filter((t) => t.due === d && t.estH != null).reduce((a, t) => a + t.estH * 60, 0);

  return html`
    <div style="padding:16px">
      <div class="panel" style="margin:0">
        <div class="panel-head">
          <${Icon.Members} size=${18} />
          <span class="t-p1">People</span><span class="fg-secondary">1</span>
          <div class="grow" />
          <span class="fg-secondary" style="font-size:12px">
            Capacity ${D.user.weeklyHours}h/week · ${D.user.workDays.length}-day week
          </span>
        </div>

        <div style=${`display:grid;grid-template-columns:200px repeat(${days.length},1fr)`}>
          <div style="padding:12px 16px;border-right:1px solid var(--stroke-primary)" />
          ${days.map((d) => {
            const date = new Date(D.TODAY.getTime() + d * 86400000);
            const off = capacityFor(d) === 0;
            return html`<div key=${d} style=${`padding:12px 8px;text-align:center;font-size:12px;font-weight:600;
              border-right:1px solid var(--stroke-primary);
              ${off ? 'background:var(--bg-secondary);color:var(--fg-tertiary)' : ''}`}>
              ${date.toLocaleDateString('en-US', { weekday: 'short' })} ${date.getDate()}
            </div>`;
          })}

          <div style="padding:12px 16px;border-right:1px solid var(--stroke-primary);border-top:1px solid var(--stroke-primary)">
            <div class="row g8">
              <span class="rail-avatar" style="width:24px;height:24px;font-size:10px">${D.user.initials}</span>
              <span class="t-p1">${D.user.name}</span>
            </div>
          </div>
          ${days.map((d) => {
            const cap = capacityFor(d), isOff = cap === 0;
            const planned = plannedFor(d), over = planned - cap;
            return html`
              <div key=${d} style=${`padding:8px;border-right:1px solid var(--stroke-primary);
                border-top:1px solid var(--stroke-primary);min-height:96px;
                ${isOff ? 'background:var(--bg-secondary)' : ''}`}>
                ${planned > 0 ? html`
                  <div style="font-size:11px;font-weight:600;margin-bottom:6px"
                       class=${over > 0 ? 'fg-error' : 'fg-secondary'}>
                    ${isOff ? `${D.fmtDuration(planned)} on a day off`
                            : over > 0 ? `+${D.fmtDuration(over)} over` : D.fmtDuration(planned)}
                  </div>
                  <${Bar} pct=${cap ? (planned / cap) * 100 : 100} tone=${over > 0 ? 'over' : 'under'} />` : null}
                ${tasks.filter((t) => t.due === d).map((t) => html`
                  <button key=${t.id} class="timeline-chip truncate"
                          onClick=${() => setOpenTaskId(t.id)}>${t.title}</button>`)}
              </div>`;
          })}
        </div>
      </div>
    </div>`;
};

/* ---------- Reports ---------- */
const ReportsView = ({ store }) => {
  const { entries } = store;
  const days = [-6, -5, -4, -3, -2, -1, 0];
  const minsFor = (d) => {
    const from = D.TODAY.getTime() + d * 86400000;
    return entries.filter((e) => e.start >= from && e.start < from + 86400000)
                  .reduce((a, e) => a + e.mins, 0);
  };
  const series = days.map(minsFor);
  const max = Math.max(...series, 60);
  const total = series.reduce((a, b) => a + b, 0);
  const billable = Math.round(total * 0.82);
  const W = 900, H = 200;
  const pts = series.map((v, i) => `${(i / (series.length - 1)) * W},${H - (v / max) * H}`).join(' ');

  return html`
    <div class="kpi-card">
      <div class="kpi"><div class="kpi-label">Logged time</div>
        <div class="kpi-value">${D.fmtDuration(total)}</div></div>
      <div class="kpi"><div class="kpi-label">Billable time</div>
        <div class="kpi-value">${D.fmtDuration(billable)}
          <span class="unit">(${total ? ((billable / total) * 100).toFixed(2) : '0.00'}%)</span></div></div>
      <div class="kpi"><div class="kpi-label">Amount</div>
        <div class="kpi-value">${((billable / 60) * 65).toFixed(2)} <span class="unit">EUR</span></div></div>
      <div class="kpi"><div class="kpi-label">Average daily hours</div>
        <div class="kpi-value">${D.fmtDuration(Math.round(total / D.user.workDays.length))}</div></div>
    </div>

    <div class="panel">
      <div class="panel-head"><span class="t-p1">Logged time</span></div>
      <div class="panel-body">
        <svg viewBox=${`0 0 ${W} ${H}`} style="width:100%;height:220px;overflow:visible">
          ${[0, .25, .5, .75, 1].map((f) => html`
            <line key=${f} x1="0" x2=${W} y1=${H * f} y2=${H * f}
                  stroke="var(--stroke-primary)" stroke-dasharray="2 4" />`)}
          <polyline points=${pts} fill="none" stroke="var(--accent)" stroke-width="2"
                    stroke-linejoin="round" stroke-linecap="round" />
          ${series.map((v, i) => html`
            <circle key=${i} cx=${(i / (series.length - 1)) * W} cy=${H - (v / max) * H}
                    r="3.5" fill="var(--accent)">
              <title>${D.fmtDuration(v)}</title></circle>`)}
        </svg>
        <div class="row" style="justify-content:space-between;font-size:11px;color:var(--fg-secondary);margin-top:8px">
          ${days.map((d) => {
            const date = new Date(D.TODAY.getTime() + d * 86400000);
            return html`<span key=${d}>${date.toLocaleDateString('en-US', { weekday: 'short' })}<br/>
              ${date.getMonth() + 1}/${date.getDate()}</span>`;
          })}
        </div>
      </div>
    </div>`;
};

/* ---------- Projects ---------- */
const ProjectsView = ({ store }) => html`
  <table class="tbl">
    <thead><tr>
      <th>Project</th><th style="width:160px">Client</th>
      <th style="width:100px">Rate</th><th style="width:260px">Time status</th>
    </tr></thead>
    <tbody>
      ${D.projects.map((p) => {
        const logged = store.entries.filter((e) => e.projectId === p.id)
                          .reduce((a, e) => a + e.mins, 0) / 60;
        const pct = p.budgetH ? (logged / p.budgetH) * 100 : 0;
        return html`
          <tr key=${p.id} style="cursor:pointer"
              onClick=${() => { store.setFilters({ projects: [p.id], statuses: [] }); store.setView('tasks'); }}>
            <td><${ProjectChip} projectId=${p.id} /></td>
            <td class="fg-secondary">${p.client || html`<${Empty} />`}</td>
            <td class="mono">${p.rate ? `${p.rate} ${p.currency}` : html`<${Empty} />`}</td>
            <td>${p.budgetH ? html`
              <div class="col g4" style="padding:8px 0">
                <span style="font-size:12px">${D.fmtHours(logged)} of ${p.budgetH}h · ${Math.round(pct)}%</span>
                <${Bar} pct=${pct} tone=${pct > 100 ? 'over' : 'under'} />
              </div>` : html`<${Empty} />`}</td>
          </tr>`;
      })}
    </tbody>
  </table>
  <button class="add-inline"><${Icon.Plus} size=${14} /> Add project</button>`;

/* ============================================================
   7. TASK DRAWER, fully editable
   ============================================================ */

const PropRow = ({ icon: I, label, children }) => html`
  <div class="prop-row">
    <div class="prop-label"><span class="icon"><${I} size=${16} /></span>${label}</div>
    <div class="prop-value">${children}</div>
  </div>`;

/** Click-to-edit inline value. */
const InlineEdit = ({ value, render, children }) => {
  const [editing, setEditing] = useState(false);
  if (editing) return html`<div onBlur=${() => setTimeout(() => setEditing(false), 120)}>${children(() => setEditing(false))}</div>`;
  return html`<button class="inline-edit" onClick=${() => setEditing(true)}>
    ${value == null || value === '' ? html`<${Empty} />` : render}
  </button>`;
};

const TaskDrawer = ({ store }) => {
  const { openTaskId, setOpenTaskId, tasks, updateTask, deleteTask, minsForTask, startTimer, timer } = store;
  const task = tasks.find((t) => t.id === openTaskId);
  const [menu, setMenu] = useState(null);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showTime, setShowTime] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !menu && setOpenTaskId(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpenTaskId, menu]);

  if (!task) return null;
  const logged = minsForTask(task.id);
  const isTiming = timer.running && timer.taskId === task.id;

  return html`
    <div class="scrim" onClick=${() => setOpenTaskId(null)} />
    <aside class="drawer" role="dialog" aria-label=${task.title}>
      <div class="drawer-head">
        <${CheckCircle} done=${task.status === 'done'}
          onClick=${() => updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })} />
        <span class="fg-secondary">Task</span>
        <div class="grow" />
        <${IconBtn} icon=${Icon.Lock} tip="Lock" />
        <div class="anchor">
          <${IconBtn} icon=${Icon.More} tip="More" active=${menu === 'more'}
            onClick=${() => setMenu(menu === 'more' ? null : 'more')} />
          ${menu === 'more' && html`
            <${Menu} onClose=${() => setMenu(null)} align="right" width=${200}>
              <${MenuItem} icon=${Icon.Play}
                onClick=${() => { startTimer(task.id); setMenu(null); }}>Start timer<//>
              <${MenuItem} icon=${Icon.Undo}
                onClick=${() => { updateTask(task.id, { status: 'todo' }); setMenu(null); }}>Reset to Todo<//>
              <${MenuSep} />
              <${MenuItem} icon=${Icon.Trash}
                onClick=${() => { setMenu(null); deleteTask(task.id); }}>Delete task<//>
            <//>`}
        </div>
        <${IconBtn} icon=${Icon.Close} tip="Close" onClick=${() => setOpenTaskId(null)} />
      </div>

      <div class="drawer-body">
        <div class="row g16" style="align-items:flex-start">
          <input class="drawer-title grow" value=${task.title}
                 onInput=${(e) => updateTask(task.id, { title: e.target.value })} />
          <button class=${`timer-btn ${isTiming ? 'is-running' : 'is-idle'}`}
                  aria-label=${isTiming ? 'Stop timer' : 'Start timer for this task'}
                  onClick=${() => isTiming ? store.stopTimer() : startTimer(task.id)}>
            <${isTiming ? Icon.Stop : Icon.Play} size=${16} />
          </button>
        </div>

        <textarea class="drawer-desc" placeholder="Add task description"
                  value=${task.description || ''}
                  onInput=${(e) => updateTask(task.id, { description: e.target.value })} />

        <${PropRow} icon=${Icon.Folder} label="Project">
          <${Select} value=${task.projectId}
            options=${D.projects.map((p) => ({ value: p.id, label: p.name }))}
            onChange=${(v) => updateTask(task.id, { projectId: v })} />
        <//>

        <${PropRow} icon=${Icon.Calendar} label="Dates">
          <${Select} value=${task.due == null ? null : String(task.due)}
            options=${[-1, 0, 1, 2, 3, 4, 5].map((d) => ({ value: String(d), label: D.fmtDue(d) }))}
            onChange=${(v) => updateTask(task.id, { due: v == null ? null : Number(v) })} />
        <//>

        <${PropRow} icon=${Icon.Clock} label="Estimate">
          <div class="row g8">
            <input class="input mono" style="width:100px" type="number" min="0" step="0.5"
                   placeholder="Empty" value=${task.estH == null ? '' : task.estH}
                   onInput=${(e) => updateTask(task.id, {
                     estH: e.target.value === '' ? null : Number(e.target.value) })} />
            <span class="fg-secondary">hours</span>
            <div class="anchor">
              <button class="btn btn-ghost" style="height:32px;padding:0 8px"
                onClick=${() => setMenu(menu === 'est' ? null : 'est')}>
                ${task.estMode || 'total'} <${Icon.Chevron} size=${14} />
              </button>
              ${menu === 'est' && html`
                <${Menu} onClose=${() => setMenu(null)} width=${160}>
                  <${MenuItem} checked=${(task.estMode || 'total') === 'total'}
                    onClick=${() => { updateTask(task.id, { estMode: 'total' }); setMenu(null); }}>total<//>
                  <${MenuItem} checked=${task.estMode === 'daily'}
                    onClick=${() => { updateTask(task.id, { estMode: 'daily' }); setMenu(null); }}>daily<//>
                <//>`}
            </div>
          </div>
        <//>

        <${PropRow} icon=${Icon.Priority} label="Priority">
          <${Select} value=${task.priority}
            options=${D.priorities.map((p) => ({ value: p.id, label: p.label }))}
            onChange=${(v) => updateTask(task.id, { priority: v })} />
        <//>

        <${PropRow} icon=${Icon.Tag} label="Tags">
          <div class="row g6" style="flex-wrap:wrap">
            ${task.tags.map((g) => html`
              <${Tag} key=${g} label=${g}
                onRemove=${() => updateTask(task.id, { tags: task.tags.filter((x) => x !== g) })} />`)}
            <div class="anchor">
              <button class="chip chip-outline" onClick=${() => setMenu(menu === 'tags' ? null : 'tags')}>
                <${Icon.Plus} size=${12} /> Add tag
              </button>
              ${menu === 'tags' && html`
                <${Menu} onClose=${() => setMenu(null)} width=${180}>
                  ${D.tags.map((g) => html`
                    <${MenuItem} key=${g} checked=${task.tags.includes(g)}
                      onClick=${() => updateTask(task.id, {
                        tags: task.tags.includes(g) ? task.tags.filter((x) => x !== g) : [...task.tags, g] })}>
                      ${g}
                    <//>`)}
                <//>`}
            </div>
          </div>
        <//>

        <${PropRow} icon=${Icon.User} label="Assignee">
          <div class="row g8">
            <span class="rail-avatar" style="width:22px;height:22px;font-size:10px">${D.user.initials}</span>
            <span class="t-p1">${D.user.name}</span>
          </div>
        <//>

        <${PropRow} icon=${Icon.Approve} label="Status">
          <${Select} value=${task.status} placeholder="Todo"
            options=${D.statuses.map((s) => ({ value: s.id, label: `${s.emoji} ${s.label}` }))}
            onChange=${(v) => updateTask(task.id, { status: v || 'todo' })} />
        <//>

        <${PropRow} icon=${Icon.Dollar} label="Billable">
          <div class="row g8">
            <button class=${`toggle ${task.billable ? 'is-on' : ''}`}
                    aria-label="Toggle billable"
                    onClick=${() => updateTask(task.id, { billable: !task.billable })} />
            <${Icon.Info} size=${14} style="color:var(--fg-tertiary)" />
            <span class="star"><${Icon.Star} size=${12} /></span>
          </div>
        <//>

        <button class="section-head" onClick=${() => setShowSubtasks((v) => !v)}>
          <span style=${`transition:transform .15s;display:inline-flex;${showSubtasks ? 'transform:rotate(90deg)' : ''}`}>
            <${Icon.ChevronR} size=${16} /></span> Subtasks
        </button>
        ${showSubtasks && html`
          <div class="section-body">
            <p class="fg-secondary" style="margin:0 0 8px">No subtasks yet.</p>
            <button class="add-inline" style="padding:4px 0"><${Icon.Plus} size=${14} /> Add subtask</button>
          </div>`}

        <button class="section-head" onClick=${() => setShowTime((v) => !v)}>
          <span style=${`transition:transform .15s;display:inline-flex;${showTime ? 'transform:rotate(90deg)' : ''}`}>
            <${Icon.ChevronR} size=${16} /></span> Time
          <div class="grow" />
          <span class="fg-secondary mono" style="font-weight:500">${logged ? D.fmtDuration(logged) : '0m'}</span>
        </button>
        ${showTime && html`
          <div class="section-body">
            ${store.entries.filter((e) => e.taskId === task.id).length
              ? store.entries.filter((e) => e.taskId === task.id).map((e) => html`
                  <div key=${e.id} class="row g12 time-entry-row">
                    <span class="fg-secondary">${D.fmtDate(e.start)}</span>
                    <span class="fg-secondary">
                      ${new Date(e.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                    <div class="grow" />
                    <span class="mono t-p1">${D.fmtDuration(e.mins)}</span>
                  </div>`)
              : html`<p class="fg-secondary" style="margin:0">No time logged yet. Hit play to start.</p>`}
          </div>`}

        <!-- ▼▼ YOUR FEATURE CAN MOUNT HERE ▼▼ -->
      </div>
    </aside>`;
};

/* ============================================================
   8. ADD TASK DIALOG
   ============================================================ */

const AddTaskDialog = ({ store, onClose }) => {
  const { dialog, addTasks, toast, startTimer } = store;
  const [form, setForm] = useState({
    title: dialog.prefill || '',
    projectId: null, estH: '', due: null,
    priority: null, status: dialog.status || 'todo', tags: [],
  });
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.title.trim().length > 0;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    const id = uid();
    addTasks([{
      id, title: form.title.trim(), kind: null,
      projectId: form.projectId, status: form.status,
      priority: form.priority, estH: form.estH === '' ? null : Number(form.estH),
      tags: form.tags, due: form.due == null ? null : Number(form.due),
      aiGenerated: false, createdRel: 0,
    }]);
    toast('Task added');
    if (dialog.startTimer) startTimer(id);
    onClose();
  };

  return html`
    <${Dialog} title="Add task" onClose=${onClose} width=${560}
      footer=${html`
        <${Btn} onClick=${onClose}>Cancel<//>
        <${Btn} variant="primary" disabled=${!valid} onClick=${submit}>Add task<//>`}>
      <form onSubmit=${submit} class="col g16">
        <${Field} label="Task name">
          <input ref=${inputRef} class="input" placeholder="What needs doing?"
                 value=${form.title} onInput=${(e) => set('title', e.target.value)} />
        <//>
        <div class="form-grid">
          <${Field} label="Project">
            <${Select} value=${form.projectId}
              options=${D.projects.map((p) => ({ value: p.id, label: p.name }))}
              onChange=${(v) => set('projectId', v)} />
          <//>
          <${Field} label="Status">
            <${Select} value=${form.status} placeholder="Todo"
              options=${D.statuses.map((s) => ({ value: s.id, label: `${s.emoji} ${s.label}` }))}
              onChange=${(v) => set('status', v || 'todo')} />
          <//>
          <${Field} label="Estimate" hint="Leave blank if you're not sure">
            <input class="input mono" type="number" min="0" step="0.5" placeholder="Empty"
                   value=${form.estH} onInput=${(e) => set('estH', e.target.value)} />
          <//>
          <${Field} label="Due">
            <${Select} value=${form.due == null ? null : String(form.due)}
              options=${[0, 1, 2, 3, 4, 5].map((d) => ({ value: String(d), label: D.fmtDue(d) }))}
              onChange=${(v) => set('due', v)} />
          <//>
        </div>
        <${Field} label="Priority">
          <div class="row g6">
            ${D.priorities.map((p) => html`
              <button key=${p.id} type="button"
                class=${`chip ${form.priority === p.id ? 'chip-accent' : 'chip-outline'}`}
                onClick=${() => set('priority', form.priority === p.id ? null : p.id)}>${p.label}</button>`)}
          </div>
        <//>
        <${Field} label="Tags">
          <div class="row g6" style="flex-wrap:wrap">
            ${D.tags.map((g) => html`
              <button key=${g} type="button"
                class=${`chip ${form.tags.includes(g) ? 'chip-accent' : 'chip-outline'}`}
                onClick=${() => set('tags', form.tags.includes(g)
                  ? form.tags.filter((x) => x !== g) : [...form.tags, g])}>${g}</button>`)}
          </div>
        <//>
      </form>
    <//>`;
};

/* ============================================================
   9. AI FLOWS, Photo / Prompt / Text
   Each: input → generating → review → add.
   Generated tasks land with estH: null, exactly like the real app.
   ============================================================ */

const AI_SAMPLES = {
  photo: [
    { title: 'Sketch three homepage directions', kind: 'wireframes' },
    { title: 'Pick a typeface pairing', kind: 'design-system' },
    { title: 'Share directions with the client', kind: 'meeting' },
    { title: 'Revise based on feedback', kind: 'revisions' },
  ],
  prompt: [
    { title: 'Audit the current pricing page', kind: 'research' },
    { title: 'Draft three pricing layouts', kind: 'wireframes' },
    { title: 'Write the new pricing copy', kind: null },
    { title: 'Review with the client', kind: 'meeting' },
    { title: 'Handle the revision round', kind: 'revisions' },
  ],
  text: [
    { title: 'Set up the component library', kind: 'design-system' },
    { title: 'Migrate the old tokens', kind: 'design-system' },
    { title: 'Document usage guidelines', kind: null },
    { title: 'Dev handoff session', kind: 'handoff' },
  ],
};

const AI_META = {
  photo:  { title: 'Create tasks from a photo', cta: 'Extract tasks' },
  prompt: { title: 'Create tasks from a prompt', cta: 'Break it down' },
  text:   { title: 'Create tasks from your notes', cta: 'Turn into tasks' },
};

const AiDialog = ({ store, mode, onClose }) => {
  const { addTasks, toast } = store;
  const [stage, setStage] = useState('input');   // input | generating | review
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [results, setResults] = useState([]);
  const meta = AI_META[mode];

  const canGenerate = mode === 'photo' ? !!file : text.trim().length > 3;

  const generate = () => {
    setStage('generating');
    setTimeout(() => {
      setResults(AI_SAMPLES[mode].map((s) => ({ ...s, id: uid(), keep: true })));
      setStage('review');
    }, 1400);
  };

  const commit = () => {
    const keep = results.filter((r) => r.keep);
    addTasks(keep.map((r) => ({
      id: r.id, title: r.title, kind: r.kind, projectId: null,
      status: 'todo', priority: null, estH: null, tags: [], due: null,
      aiGenerated: true, createdRel: 0,
    })));
    toast(`${keep.length} task${keep.length === 1 ? '' : 's'} added`);
    onClose();
  };

  const footer =
    stage === 'input' ? html`
      <${Btn} onClick=${onClose}>Cancel<//>
      <${Btn} variant="primary" disabled=${!canGenerate} onClick=${generate}>${meta.cta}<//>`
    : stage === 'review' ? html`
      <${Btn} onClick=${() => setStage('input')}>Back<//>
      <${Btn} variant="primary" disabled=${!results.some((r) => r.keep)} onClick=${commit}>
        Add ${results.filter((r) => r.keep).length} tasks
      <//>`
    : null;

  return html`
    <${Dialog} title=${meta.title} onClose=${onClose} width=${580} footer=${footer}>
      ${stage === 'input' && mode === 'photo' && html`
        <${Dropzone} file=${file} onFile=${setFile} />`}

      ${stage === 'input' && mode === 'prompt' && html`
        <${Field} label="What do you want to do?"
          hint="We'll break it into tasks. You can edit them before they're added.">
          <textarea class="input textarea" rows="4" autofocus
            placeholder="Redesign the pricing page for a SaaS client"
            value=${text} onInput=${(e) => setText(e.target.value)} />
        <//>`}

      ${stage === 'input' && mode === 'text' && html`
        <${Field} label="Paste your notes"
          hint="Meeting notes, a brief, a bulleted list, whatever you've got.">
          <textarea class="input textarea" rows="7" autofocus
            placeholder=${'- set up component library\n- migrate old tokens\n- write usage docs\n- handoff session with devs'}
            value=${text} onInput=${(e) => setText(e.target.value)} />
        <//>`}

      ${stage === 'generating' && html`
        <div class="ai-loading">
          <span class="spinner" />
          <span class="t-p1">Reading ${mode === 'photo' ? 'your image' : 'your notes'}…</span>
          <span class="fg-secondary">This usually takes a few seconds.</span>
        </div>`}

      ${stage === 'review' && html`
        <div class="col g12">
          <p class="fg-secondary" style="margin:0">
            ${results.length} tasks found. Uncheck anything you don't want.
          </p>
          <div class="col g6">
            ${results.map((r) => html`
              <div key=${r.id} class="ai-result">
                <button class=${`check-box ${r.keep ? 'is-on' : ''}`}
                  aria-label=${`Include ${r.title}`}
                  onClick=${() => setResults((rs) => rs.map((x) =>
                    x.id === r.id ? { ...x, keep: !x.keep } : x))}>
                  ${r.keep && html`<${Icon.Check} size=${11} />`}
                </button>
                <input class="ai-result-input" value=${r.title}
                  onInput=${(e) => setResults((rs) => rs.map((x) =>
                    x.id === r.id ? { ...x, title: e.target.value } : x))} />
                <span class="prop-empty" style="font-size:12px">No estimate</span>
              </div>`)}
          </div>
        </div>`}
    <//>`;
};

/* ============================================================
   10. SETTINGS MODAL
   ============================================================ */

const SettingsModal = ({ onClose }) => {
  const [page, setPage] = useState('work-hours');
  const nav = [
    { group: 'Toggl account', items: [
      { id: 'personal', label: 'Personal details' },
      { id: 'time-prefs', label: 'Time preferences' },
      { id: 'appearance', label: 'Appearance' },
    ]},
    { group: 'Availability', items: [
      { id: 'work-hours', label: 'Work hours' },
      { id: 'time-off', label: 'Time off', star: true },
      { id: 'holidays', label: 'Public holidays', star: true },
    ]},
  ];
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [workDays, setWorkDays] = useState(D.user.workDays);
  const [weekly, setWeekly] = useState(D.user.weeklyHours);

  return html`
    <${Dialog} title="Settings & Preferences" onClose=${onClose} width=${880}>
      <div class="settings-layout">
        <div class="settings-nav">
          ${nav.map((g) => html`
            <div key=${g.group} class="col g4" style="margin-bottom:16px">
              <div class="t-nav-section" style="padding:4px 8px">${g.group}</div>
              ${g.items.map((it) => html`
                <button key=${it.id} class=${`settings-nav-item ${page === it.id ? 'is-active' : ''}`}
                  onClick=${() => setPage(it.id)}>
                  <span class="grow" style="text-align:left">${it.label}</span>
                  ${it.star && html`<span class="star"><${Icon.Star} size=${11} /></span>`}
                </button>`)}
            </div>`)}
        </div>

        <div class="settings-content">
          ${page === 'work-hours' ? html`
            <div class="col g16">
              <div>
                <div class="t-h4">Work hours</div>
                <p class="fg-secondary" style="margin:4px 0 0">
                  Your capacity is worked out from these. Change them and the Timeline updates.
                </p>
              </div>
              <${Field} label="Working days">
                <div class="row g6">
                  ${DAYS.map((d, i) => html`
                    <button key=${d} class=${`chip ${workDays.includes(i) ? 'chip-accent' : 'chip-outline'}`}
                      onClick=${() => setWorkDays((w) =>
                        w.includes(i) ? w.filter((x) => x !== i) : [...w, i].sort())}>${d}</button>`)}
                </div>
              <//>
              <${Field} label="Total hours per week"
                hint=${`That's ${workDays.length ? (weekly / workDays.length).toFixed(1) : '0'}h on each working day.`}>
                <input class="input mono" style="width:140px" type="number" min="0" max="80"
                  value=${weekly} onInput=${(e) => setWeekly(Number(e.target.value) || 0)} />
              <//>
            </div>`
          : html`
            <div class="empty-state" style="padding:48px 24px">
              <h3>Not part of this prototype</h3>
              <p>Only Work hours is wired up here, it's the one that affects capacity.</p>
            </div>`}
        </div>
      </div>
    <//>`;
};

/* ============================================================
   11. APP ROOT
   ============================================================ */

const Toasts = ({ store }) => html`
  <div class="toast-wrap">
    ${store.toasts.map((t) => html`
      <div class="toast" key=${t.id}>
        <span>${t.message}</span>
        ${t.action && html`
          <button onClick=${() => { t.action.onClick(); store.dismissToast(t.id); }}>
            ${t.action.label}
          </button>`}
      </div>`)}
  </div>`;

function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

const DateNav = ({ label }) => html`
  <div class="row g4">
    <${IconBtn} icon=${Icon.ChevronL} tip="Previous" />
    <button class="btn btn-secondary">
      <${Icon.Calendar} size=${16} /><span>${label}</span>
      <span class="fg-tertiary">• W${isoWeek(D.TODAY)}</span>
    </button>
    <${IconBtn} icon=${Icon.ChevronR} tip="Next" />
  </div>`;

const TITLES = { tasks: 'Tasks', calendar: 'Calendar', timeline: 'Timeline', reports: 'Reports', projects: 'Projects' };

/* ============================================================
   ONBOARDING, first-session activation: "Bring in your week"
   A self-contained first-run overlay. Turns the empty calendar
   into the fastest path to a personal, tracked week, without
   making calendar connection mandatory.
   Flow: intro → connect → consent → filling → confirm → ready → tools
   Branches: manual (sparse), empty, error. Esc / X leaves anywhere.
   ============================================================ */
const ONB_START = 8, ONB_END = 19, ONB_HH = 38;

const GoogleG = ({ size = 18 }) => html`
  <svg width=${size} height=${size} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.1-3.8 6.5-9.4 6.5-16z"/>
    <path fill="#FBBC05" d="M10.3 28.6c-.5-1.4-.7-2.9-.7-4.6s.3-3.2.7-4.6l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.8-6.1z"/>
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.3-4.6 2.1-8.8 2.1-6.4 0-11.8-3.7-13.7-9.9l-7.8 6.1C6.4 42.6 14.6 48 24 48z"/>
  </svg>`;

const Onboarding = ({ store }) => {
  const close = () => store.setOnbActive(false);
  const finish = () => { store.setOnbActive(false); store.setView('calendar'); };

  const [step, setStep] = useState('intro');
  const [provider, setProvider] = useState('google');
  const [events, setEvents] = useState(() =>
    D.onboardingEvents.map((e) => ({ ...e, checked: !e.personal })));
  const [autoTrack, setAutoTrack] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [tools, setTools] = useState({ ext: false, shortcut: false, mobile: false, idle: false });
  const [quick, setQuick] = useState({ text: '', running: false });

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Fill animation: reveal events one by one, then advance to confirm.
  useEffect(() => {
    if (step !== 'filling') return;
    setRevealed(0);
    let i = 0;
    const t = setInterval(() => {
      i += 1; setRevealed(i);
      if (i >= events.length) { clearInterval(t); setTimeout(() => setStep('confirm'), 550); }
    }, 85);
    return () => clearInterval(t);
  }, [step]);

  const updateEvent = (id, patch) =>
    setEvents((es) => es.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const dow = D.TODAY.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const dateFor = (i) => new Date(D.TODAY.getTime() + (mondayOffset + i) * 86400000);
  const projOpts = D.projects.map((p) => ({ value: p.id, label: p.name }));

  const checked = events.filter((e) => e.checked);
  const totalMins = checked.reduce((a, e) => a + e.mins, 0);
  const byProject = D.projects
    .map((p) => ({ p, mins: checked.filter((e) => e.projectId === p.id).reduce((a, e) => a + e.mins, 0) }))
    .filter((x) => x.mins > 0);
  const uncategorized = checked.filter((e) => !e.projectId).reduce((a, e) => a + e.mins, 0);

  const doConnect = () => setStep('consent');
  const commit = () => {
    const list = events.filter((e) => e.checked).map((e) => {
      const st = new Date(D.TODAY.getTime() + (mondayOffset + e.day) * 86400000);
      st.setHours(e.startH, e.startM, 0, 0);
      const s = st.getTime();
      return { id: 'onb-' + e.id, taskId: null, projectId: e.projectId, title: e.title, start: s, end: s + e.mins * 60000, mins: e.mins };
    });
    store.addEntries(list);
    setStep('ready');
  };

  // ---- calendar canvas behind the cards ----
  const solidSteps = ['confirm', 'ready', 'tools'];
  const canvas = () => {
    const showReveal = step === 'filling';
    return html`
      <div class="onb-cal">
        <div class="onb-cal-gutter">
          <div class="onb-col-head" />
          ${Array.from({ length: ONB_END - ONB_START }, (_, i) => html`
            <div key=${i} class="onb-hour-label" style=${`height:${ONB_HH}px`}>
              ${((ONB_START + i) % 12 || 12)}${ONB_START + i < 12 ? 'AM' : 'PM'}
            </div>`)}
        </div>
        ${[0, 1, 2, 3, 4].map((day) => {
          const d = dateFor(day);
          const isToday = (mondayOffset + day) === 0;
          const dayEvents = events.filter((e) => e.day === day);
          return html`
            <div key=${day} class="onb-col">
              <div class="onb-col-head">
                <span class=${`onb-col-day ${isToday ? 'is-today' : ''}`}>${d.getDate()}</span>
                <span class="onb-col-dow">${d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              </div>
              <div class="onb-col-body">
                ${Array.from({ length: ONB_END - ONB_START }, (_, i) => html`
                  <div key=${i} class="onb-hour" style=${`height:${ONB_HH}px`} />`)}
                ${dayEvents.map((e) => {
                  const idx = events.indexOf(e);
                  const shown = step === 'intro' ? true : (showReveal ? idx < revealed : true);
                  const top = (e.startH + e.startM / 60 - ONB_START) * ONB_HH;
                  const h = Math.max(15, (e.mins / 60) * ONB_HH);
                  const p = e.projectId ? D.projectById(e.projectId) : null;
                  const color = p ? p.color : 'var(--fg-tertiary)';
                  let cls = 'onb-ev';
                  if (step === 'intro') cls += ' is-ghost';
                  else if (showReveal) cls += idx < revealed ? ' is-pop' : ' is-hidden';
                  else if (solidSteps.includes(step)) cls += e.checked ? ' is-solid' : ' is-dim';
                  else cls += ' is-ghost';
                  if (e.personal) cls += ' is-personal';
                  return html`
                    <div key=${e.id} class=${cls}
                      style=${`top:${top}px;height:${h}px;--ev:${color};opacity:${shown ? '' : 0}`}>
                      <span class="onb-ev-title">${e.title}</span>
                    </div>`;
                })}
              </div>
            </div>`;
        })}
      </div>`;
  };

  // ---- step cards ----
  const Eyebrow = (t) => html`<div class="onb-eyebrow">${t}</div>`;
  const Xbtn = html`<button class="onb-x" aria-label="Close" onClick=${close}><${Icon.Close} size=${18} /></button>`;
  const privacy = html`
    <div class="onb-privacy">
      <${Icon.Shield} size=${15} />
      <span>Toggl only reads event titles and times, never who's invited. Calendar data is deleted after 3 months.</span>
    </div>`;

  let card = null;

  if (step === 'intro') {
    card = html`
      <div class="onb-card">
        ${Xbtn}
        ${Eyebrow('Bring in your week')}
        <h2 class="onb-title">See where your time already goes.</h2>
        <p class="onb-body">Bring in your calendar and we'll show you what your week actually looked like, before you track a single minute.</p>
        <div class="onb-options">
          <button class="onb-option is-primary" onClick=${() => setStep('connect')}>
            <span class="onb-option-icon"><${Icon.Calendar} size=${20} /></span>
            <span class="onb-option-title">Connect calendar</span>
            <span class="onb-option-sub">Fastest, fills your week</span>
          </button>
          <button class="onb-option" onClick=${finish}>
            <span class="onb-option-icon"><${Icon.Edit} size=${20} /></span>
            <span class="onb-option-title">Add manually</span>
            <span class="onb-option-sub">Start a timer yourself</span>
          </button>
        </div>
        ${privacy}
        <button class="onb-link onb-skip" onClick=${close}>Skip for now</button>
      </div>`;
  }

  if (step === 'connect') {
    card = html`
      <div class="onb-card">
        ${Xbtn}
        <button class="onb-back" onClick=${() => setStep('intro')}><${Icon.ChevronL} size=${16} /> Back</button>
        ${Eyebrow('Connect your calendar')}
        <h2 class="onb-title">Bring in your week</h2>
        <p class="onb-body">We'll pull in this week's events so you can see where your time went.</p>
        <button class="onb-google-btn" onClick=${() => setStep('consent')}>
          <${GoogleG} size=${18} /> Continue with Google
        </button>
        <button class="onb-link onb-skip" onClick=${finish}>Can't connect? Add manually instead</button>
      </div>`;
  }

  if (step === 'consent') {
    card = html`
      <div class="onb-card onb-consent">
        <div class="onb-consent-head"><${GoogleG} size=${20} /> <span>Sign in with Google</span></div>
        <h2 class="onb-title" style="font-size:20px">Toggl wants to access your Google Account</h2>
        <div class="onb-consent-acct"><span class="onb-consent-avatar">d</span> demo@gmail.com</div>
        <div class="onb-scope">
          <div class="onb-scope-row allow"><${Icon.Check} size=${15} /><span>See the title and time of events on your calendar</span></div>
          <div class="onb-scope-row deny"><${Icon.Close} size=${15} /><span>Won't see attendees, emails, or event details</span></div>
        </div>
        <div class="onb-consent-actions">
          <button class="onb-link" onClick=${() => setStep('connect')}>Cancel</button>
          <button class="onb-btn-primary" onClick=${() => setStep('filling')}>Allow</button>
        </div>
      </div>`;
  }

  if (step === 'empty') {
    card = html`
      <div class="onb-card">
        ${Xbtn}
        <div class="onb-state-icon"><${Icon.Calendar} size=${26} /></div>
        <h2 class="onb-title">No events this week</h2>
        <p class="onb-body">That calendar's clear for the week, so there's nothing to bring in yet. You can add time as you go, or try another calendar.</p>
        <div class="onb-stack">
          <button class="onb-btn-primary" onClick=${finish}>Add time manually</button>
          <button class="onb-link" onClick=${() => setStep('connect')}>Try a different calendar</button>
        </div>
      </div>`;
  }

  if (step === 'error') {
    card = html`
      <div class="onb-card">
        ${Xbtn}
        <div class="onb-state-icon is-error"><${Icon.Info} size=${26} /></div>
        <h2 class="onb-title">We couldn't connect to iCloud</h2>
        <p class="onb-body">The connection timed out. This is usually temporary, try again, or bring your week in a different way.</p>
        <div class="onb-stack">
          <button class="onb-btn-primary" onClick=${() => setStep('filling')}>Try again</button>
          <button class="onb-link" onClick=${() => setStep('connect')}>Use a different calendar</button>
          <button class="onb-link" onClick=${() => setStep('manual')}>Add manually instead</button>
        </div>
      </div>`;
  }

  if (step === 'filling') {
    card = html`
      <div class="onb-pill">
        <span class="onb-spinner" /> Bringing in your week…
      </div>`;
  }

  if (step === 'confirm') {
    const n = checked.length;
    card = html`
      <div class="onb-card onb-card-wide">
        ${Xbtn}
        <button class="onb-back" onClick=${() => setStep('intro')}><${Icon.ChevronL} size=${16} /> Back</button>
        ${Eyebrow('From your calendar')}
        <h2 class="onb-title">Turn the ones that were real work into tracked time.</h2>
        <p class="onb-body">These are commitments, not tracked work, a meeting you skipped shouldn't be billable. Pick the ones that were real work, and we'll file them under a project.</p>
        <div class="onb-list">
          ${events.map((e) => html`
            <div key=${e.id} class=${`onb-row ${e.checked ? 'is-checked' : ''} ${e.personal ? 'is-personal' : ''}`}>
              <button class="onb-check" role="checkbox" aria-checked=${e.checked}
                onClick=${() => updateEvent(e.id, { checked: !e.checked })}>
                ${e.checked && html`<${Icon.Check} size=${13} />`}
              </button>
              <div class="onb-row-main" onClick=${() => updateEvent(e.id, { checked: !e.checked })}>
                <span class="onb-row-title">${e.title}</span>
                <span class="onb-row-meta">${D.fmtDuration(e.mins)}${e.personal ? html` · <span class="onb-personal-tag">Looks personal</span>` : ''}</span>
              </div>
              <div class="onb-proj" style=${`visibility:${e.checked ? 'visible' : 'hidden'}`}>
                <${Select} value=${e.projectId} options=${projOpts}
                  onChange=${(v) => updateEvent(e.id, { projectId: v })} placeholder="No project" />
              </div>
            </div>`)}
        </div>
        <button class="onb-link" onClick=${() => setEvents((es) => es.map((e) => ({ ...e, checked: true })))}>
          <${Icon.Check} size=${14} /> Select all
        </button>
        <button class=${`onb-toggle ${autoTrack ? 'is-on' : ''}`} onClick=${() => setAutoTrack((v) => !v)}>
          <span class="onb-toggle-sw" />
          <span class="onb-toggle-text">
            <b>Track new meetings automatically</b>
            <span>New calendar events become tracked time as they happen. Turn it off anytime in Settings.</span>
          </span>
        </button>
        <div class="onb-foot">
          ${n === 0
            ? html`<div class="onb-foot-empty">Nothing selected yet. Pick the events that were real work, or <button class="onb-link inline" onClick=${() => setStep('tools')}>skip for now</button>.</div>`
            : html`<button class="onb-btn-primary block" onClick=${commit}>Add ${n} ${n === 1 ? 'entry' : 'entries'} as tracked time</button>`}
        </div>
      </div>`;
  }

  if (step === 'ready') {
    card = html`
      <div class="onb-card">
        ${Xbtn}
        <div class="onb-ready-check"><${Icon.Check} size=${20} /></div>
        <div class="onb-eyebrow" style="color:var(--fg-success)">Week ready</div>
        <div class="onb-ready-total">${D.fmtDuration(totalMins)}<span> tracked this week</span></div>
        <div class="onb-ready-proj">
          ${byProject.map(({ p, mins }) => html`
            <div key=${p.id} class="onb-ready-row">
              <span class="onb-dot" style=${`background:${p.color}`} />
              <span class="onb-ready-name">${p.name}</span>
              <span class="onb-ready-mins">${D.fmtDuration(mins)}</span>
            </div>`)}
          ${uncategorized > 0 && html`
            <div class="onb-ready-row">
              <span class="onb-dot" style="background:var(--fg-tertiary)" />
              <span class="onb-ready-name fg-secondary">No project</span>
              <span class="onb-ready-mins">${D.fmtDuration(uncategorized)}</span>
            </div>`}
        </div>
        <p class="onb-body">That's your week, tracked, without typing it out. ${autoTrack ? 'New meetings will track themselves from here.' : 'Your timer\'s ready whenever you are.'}</p>
        <div class="onb-stack">
          <button class="onb-btn-primary" onClick=${() => setStep('tools')}>See what's next</button>
          <button class="onb-link" onClick=${finish}>Go to my week</button>
        </div>
      </div>`;
  }

  if (step === 'tools') {
    const finder = ([x, y]) => html`
      <rect x=${x} y=${y} width="7" height="7" fill="#131213" />
      <rect x=${x + 1} y=${y + 1} width="5" height="5" fill="#fff" />
      <rect x=${x + 2} y=${y + 2} width="3" height="3" fill="#131213" />`;
    const mods = [[10,2],[12,2],[9,4],[11,5],[13,4],[2,10],[4,11],[6,10],[8,12],[10,10],[12,11],[14,10],[16,12],[18,10],[20,11],[22,13],[10,14],[12,15],[9,16],[11,18],[13,17],[15,19],[10,20],[12,21],[14,22],[16,20],[9,9],[11,9],[9,11]];
    const qr = html`
      <svg class="onb-qr" viewBox="0 0 25 25" width="104" height="104" shape-rendering="crispEdges" aria-hidden="true">
        <rect width="25" height="25" fill="#fff" />
        ${[[0, 0], [18, 0], [0, 18]].map(finder)}
        ${mods.map(([x, y]) => html`<rect x=${x} y=${y} width="1.5" height="1.5" fill="#131213" />`)}
      </svg>`;
    card = html`
      <div class="onb-card onb-card-wide">
        ${Xbtn}
        ${Eyebrow('One more thing')}
        <h2 class="onb-title">Download apps</h2>
        <p class="onb-body">Your week's in. Track the rest from your desktop, browser, or phone, wherever work happens.</p>
        <div class="onb-dl-desktop">
          <div class="onb-dl-desktop-eyebrow">Desktop app</div>
          <div class="onb-dl-desktop-title">Track without thinking about it</div>
          <ul class="onb-dl-bullets">
            <li><${Icon.Timer} size=${15} /> Auto-capture your activity as you work</li>
            <li><${Icon.Info} size=${15} /> Reminders when no timer is running</li>
            <li><${Icon.Sparkle} size=${15} /> Suggestions based on your activity</li>
          </ul>
          <button class="onb-btn-secondary block" onClick=${() => store.toast('Download starts in the real product')}>Get Toggl for Mac</button>
        </div>
        <div class="onb-dl-grid">
          <div class="onb-dl-card">
            <div class="onb-dl-card-title">Browser extension</div>
            <p class="onb-dl-card-body">Track time inside GitHub, Jira, Notion, Asana, Trello and 10+ more.</p>
            <a class="onb-dl-link" href="https://chromewebstore.google.com/detail/toggl-track-productivity/oejgccbfbmkkpaidnkphaiaecficdnfn" target="_blank" rel="noopener">Add to Chrome</a>
          </div>
          <div class="onb-dl-card onb-dl-mobile">
            <div class="onb-dl-card-title">Mobile</div>
            <p class="onb-dl-card-body">Scan with your phone, track on the go.</p>
            ${qr}
          </div>
        </div>
        <div class="onb-stack">
          <button class="onb-btn-primary block" onClick=${finish}>Finish, go to my week</button>
          <button class="onb-link" onClick=${finish}>Maybe later</button>
        </div>
      </div>`;
  }

  if (step === 'manual') {
    card = html`
      <div class="onb-card">
        ${Xbtn}
        <button class="onb-back" onClick=${() => setStep('intro')}><${Icon.ChevronL} size=${16} /> Back</button>
        ${Eyebrow('Not meeting-heavy?')}
        <h2 class="onb-title">Your work doesn't live in a calendar? No problem.</h2>
        <p class="onb-body">Start a timer as you go, it's two seconds, and nothing gets lost.</p>
        <div class=${`onb-quick ${quick.running ? 'is-running' : ''}`}>
          <input class="onb-quick-input" placeholder="What are you working on?"
            value=${quick.text} disabled=${quick.running}
            onInput=${(e) => setQuick((q) => ({ ...q, text: e.target.value }))} />
          ${quick.running
            ? html`<span class="onb-quick-timer">0:00:04</span>`
            : html`<button class="onb-quick-start" onClick=${() => setQuick((q) => ({ ...q, running: true }))}>
                <${Icon.Play} size=${16} /> Start</button>`}
        </div>
        ${quick.running && html`<div class="onb-quick-note"><${Icon.Check} size=${14} /> Tracking${quick.text ? `, ${quick.text}` : ''}. That's it, you're live.</div>`}
        <div class="onb-tool" style="margin-top:16px">
          <span class="onb-tool-icon"><${Icon.Download} size=${18} /></span>
          <div class="onb-tool-main">
            <span class="onb-tool-title">Prefer your tools?</span>
            <span class="onb-tool-body">Get the extension, it drops a timer into Jira, Figma, Notion and 100+ more.</span>
          </div>
          <button class=${`onb-tool-cta ${tools.ext ? 'is-done' : ''}`}
            onClick=${() => setTools((s) => ({ ...s, ext: true }))}>
            ${tools.ext ? html`<${Icon.Check} size=${14} /> Added` : 'Add to Chrome'}
          </button>
        </div>
        <button class="onb-link onb-skip" onClick=${finish}>Skip for now</button>
      </div>`;
  }

  const centered = ['consent', 'empty', 'error'].includes(step);

  return html`
    <div class="onb">
      <div class="onb-head">
        <span class="onb-head-title">My Time</span>
        <span class="onb-head-sub">This week</span>
      </div>
      <div class="onb-stage">
        ${canvas()}
        <div class=${`onb-overlay ${step === 'filling' ? 'is-filling' : ''} ${centered ? 'is-centered' : ''}`}>
          ${card}
        </div>
      </div>
    </div>`;
};

function App() {
  const store = useStore();
  const { view, taskView, setTaskView, setDialog, dialog, search, setSearch,
          filters, groupBy, sortBy } = store;
  const [menu, setMenu] = useState(null);
  const close = () => setMenu(null);

  const filterCount = filters.projects.length + filters.statuses.length;
  const groupLabel = groupBy && { status: 'Status', project: 'Project', due: 'Due date' }[groupBy];
  const sortLabel = sortBy.field && { title: 'Name', estH: 'Estimate', due: 'Due date', priority: 'Priority' }[sortBy.field];

  const viewLabel = view === 'tasks' ? (taskView === 'list' ? 'List' : 'Board') : null;

  return html`
    <div class=${`app ${store.navOpen ? 'nav-open' : ''}`}>
      <${Rail} store=${store} />
      <${Sidebar} store=${store} />
      ${store.navOpen && html`<div class="nav-scrim" onClick=${() => store.setNavOpen(false)} />`}
      <main class="main">
        <${Topbar} store=${store} />

        <${PageHead} title=${TITLES[view]} view=${viewLabel} right=${html`
          <${Btn} variant="primary" icon=${Icon.Plus}
            onClick=${() => setDialog({ type: view === 'projects' ? 'addProject' : 'addTask' })}>
            ${view === 'projects' ? 'New project' : 'Add task'}
          <//>`} />

        ${view === 'tasks' && html`
          <div class="toolbar">
            <div class="anchor">
              <${Ctrl} icon=${Icon.Layers} label="Saved views" active=${menu === 'views'}
                onClick=${() => setMenu(menu === 'views' ? null : 'views')} />
              ${menu === 'views' && html`<${SavedViewsMenu} store=${store} onClose=${close} />`}
            </div>
            <div class="toolbar-divider" />
            <div class="anchor">
              <${Ctrl} icon=${Icon.Filter} label="Filters" active=${menu === 'filters'}
                value=${filterCount ? String(filterCount) : null}
                onClick=${() => setMenu(menu === 'filters' ? null : 'filters')} />
              ${menu === 'filters' && html`<${FiltersMenu} store=${store} onClose=${close} />`}
            </div>
            <div class="anchor">
              <${Ctrl} icon=${Icon.GroupBy} label="Group by" value=${groupLabel} active=${menu === 'group'}
                onClick=${() => setMenu(menu === 'group' ? null : 'group')} />
              ${menu === 'group' && html`<${GroupByMenu} store=${store} onClose=${close} />`}
            </div>
            <div class="anchor">
              <${Ctrl} icon=${Icon.SortBy} label="Sort by" value=${sortLabel} active=${menu === 'sort'}
                onClick=${() => setMenu(menu === 'sort' ? null : 'sort')} />
              ${menu === 'sort' && html`<${SortByMenu} store=${store} onClose=${close} />`}
            </div>
            <div class="toolbar-spacer" />
            <${SearchField} value=${search} onChange=${setSearch} />
            <div class="seg">
              <${IconBtn} icon=${Icon.ListView} tip="List view"
                active=${taskView === 'list'} onClick=${() => setTaskView('list')} />
              <${IconBtn} icon=${Icon.BoardView} tip="Board view"
                active=${taskView === 'board'} onClick=${() => setTaskView('board')} />
            </div>
            <div class="anchor">
              <${IconBtn} icon=${Icon.Sparkle} tip="Create tasks with AI"
                active=${menu === 'ai'} onClick=${() => setMenu(menu === 'ai' ? null : 'ai')} />
              ${menu === 'ai' && html`
                <${Menu} onClose=${close} align="right" width=${300}>
                  <${MenuItem} icon=${Icon.Photo}
                    onClick=${() => { close(); setDialog({ type: 'ai', mode: 'photo' }); }}>
                    <span class="col"><span class="t-p1">Photo</span>
                      <span class="fg-secondary" style="font-size:12px">Upload a photo and we'll do the magic</span></span>
                  <//>
                  <${MenuItem} icon=${Icon.Prompt}
                    onClick=${() => { close(); setDialog({ type: 'ai', mode: 'prompt' }); }}>
                    <span class="col"><span class="t-p1">Prompt</span>
                      <span class="fg-secondary" style="font-size:12px">Tell us what you want to do and we'll break down the tasks</span></span>
                  <//>
                  <${MenuItem} icon=${Icon.Text}
                    onClick=${() => { close(); setDialog({ type: 'ai', mode: 'text' }); }}>
                    <span class="col"><span class="t-p1">Text</span>
                      <span class="fg-secondary" style="font-size:12px">Paste free-form text from your notes and we'll turn it into a list of tasks</span></span>
                  <//>
                <//>`}
            </div>
            <${IconBtn} icon=${Icon.Settings} tip="View settings"
              onClick=${() => setDialog({ type: 'settings' })} />
          </div>`}

        ${view === 'calendar' && html`
          <div class="toolbar">
            <${DateNav} label="This week" />
            <div class="toolbar-spacer" />
            <${Ctrl} label="5 Days" icon=${Icon.Chevron} />
            <${IconBtn} icon=${Icon.Settings} tip="View settings"
              onClick=${() => setDialog({ type: 'settings' })} />
          </div>`}

        ${view === 'timeline' && html`
          <div class="toolbar">
            <${Ctrl} icon=${Icon.Members} label="People" />
            <${Ctrl} icon=${Icon.Calendar} label="Capacity" value="This week" />
            <div class="toolbar-spacer" />
            <${DateNav} label="This week" />
            <${IconBtn} icon=${Icon.Settings} tip="Work hours"
              onClick=${() => setDialog({ type: 'settings' })} />
          </div>`}

        ${view === 'reports' && html`
          <div class="toolbar">
            <${Ctrl} icon=${Icon.Reports} label="Summary" />
            <${DateNav} label="This week" />
            <div class="toolbar-spacer" />
            <${Btn} variant="primary" icon=${Icon.Download}
              onClick=${() => store.toast('Export is not part of this prototype')}>
              Export CSV
            <//>
          </div>`}

        ${view === 'projects' && html`
          <div class="toolbar">
            <${Ctrl} icon=${Icon.ListView} label="Active" />
            <div class="toolbar-spacer" />
            <${SearchField} value=${search} onChange=${setSearch} />
          </div>`}

        <div class="content">
          ${view === 'tasks' && (taskView === 'list'
            ? html`<${TasksList} store=${store} />`
            : html`<${TasksBoard} store=${store} />`)}
          ${view === 'calendar' && html`<${CalendarView} store=${store} />`}
          ${view === 'timeline' && html`<${TimelineView} store=${store} />`}
          ${view === 'reports'  && html`<${ReportsView} store=${store} />`}
          ${view === 'projects' && html`<${ProjectsView} store=${store} />`}
        </div>
      </main>

      <${TaskDrawer} store=${store} />

      ${dialog && dialog.type === 'addTask' && html`
        <${AddTaskDialog} store=${store} onClose=${() => setDialog(null)} />`}
      ${dialog && dialog.type === 'ai' && html`
        <${AiDialog} store=${store} mode=${dialog.mode} onClose=${() => setDialog(null)} />`}
      ${dialog && dialog.type === 'settings' && html`
        <${SettingsModal} onClose=${() => setDialog(null)} />`}
      ${dialog && dialog.type === 'addProject' && html`
        <${Dialog} title="New project" onClose=${() => setDialog(null)}
          footer=${html`<${Btn} onClick=${() => setDialog(null)}>Close<//>`}>
          <div class="empty-state" style="padding:24px">
            <h3>Not part of this prototype</h3>
            <p>Projects are fixed mock data. Tasks are where the interaction lives.</p>
          </div>
        <//>`}

      ${store.onbActive && html`<${Onboarding} store=${store} />`}

      <${Toasts} store=${store} />
    </div>`;
}

render(html`<${App} />`, document.getElementById('app'));
