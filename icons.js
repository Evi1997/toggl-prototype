/* Icons — 20px stroke set, matching Toggl's weight (1.6–1.75).
   Usage: html`<${Icon.Timer} />`  or  html`<${Icon.Timer} size=${16} />` */

import { html } from 'https://esm.sh/htm@3.1.1/preact';

const svg = (paths, vb = '0 0 24 24') => ({ size = 20, fill = 'none', ...rest } = {}) => html`
  <svg width=${size} height=${size} viewBox=${vb} fill=${fill} stroke="currentColor"
       stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ...${rest}>
    ${paths}
  </svg>`;

export const Icon = {
  Timer:    svg(html`<circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" />`),
  Reports:  svg(html`<rect x="3.5" y="4" width="17" height="16" rx="2" /><path d="M7.5 15v-3M12 15V9M16.5 15v-5" />`),
  Folder:   svg(html`<path d="M3.5 7a2 2 0 0 1 2-2h3.6l1.8 2h7.6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />`),
  Tasks:    svg(html`<path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6l1.2 1.2L7.5 5M4 12l1.2 1.2L7.5 11M4 18l1.2 1.2L7.5 17" />`),
  Timeline: svg(html`<rect x="3.5" y="5" width="12" height="4" rx="1.5" /><rect x="7.5" y="14" width="13" height="4" rx="1.5" />`),
  Members:  svg(html`<circle cx="12" cy="8" r="3.5" /><path d="M5 19a7 7 0 0 1 14 0" />`),
  Approve:  svg(html`<circle cx="12" cy="12" r="9" /><path d="M8.5 12.2l2.4 2.4 4.6-4.8" />`),
  TimeOff:  svg(html`<path d="M12 21V11" /><path d="M12 11c0-3 2.5-5.5 5.5-5.5C19 5.5 20 6.5 20 8c-3 0-5.5 1.5-8 3z" /><path d="M12 11c0-3-2.5-5.5-5.5-5.5C5 5.5 4 6.5 4 8c3 0 5.5 1.5 8 3z" />`),
  Upgrade:  svg(html`<circle cx="12" cy="12" r="9" /><path d="M12 16V8M8.5 11.5L12 8l3.5 3.5" />`),
  Download: svg(html`<path d="M12 4v11M8 11.5l4 4 4-4" /><path d="M4.5 19h15" />`),
  Settings: svg(html`<circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .32 1.77l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-1 1.47V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.77.32l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.6 1.6 0 0 0 4.72 15a1.6 1.6 0 0 0-1.47-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.32-1.77l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.6 1.6 0 0 0 9 4.72h.08A1.6 1.6 0 0 0 10 3.25V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.47 1.6 1.6 0 0 0 1.77-.32l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.6 1.6 0 0 0 19.4 9v.08a1.6 1.6 0 0 0 1.47 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />`),
  Bell:     svg(html`<path d="M18 8.5a6 6 0 0 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5" /><path d="M13.7 19.5a2 2 0 0 1-3.4 0" />`),
  Send:     svg(html`<path d="M20.5 3.5L10.5 13.5" /><path d="M20.5 3.5l-6.4 17-3.6-7-7-3.6z" />`),
  Help:     svg(html`<circle cx="12" cy="12" r="9" /><path d="M9.6 9.5a2.5 2.5 0 1 1 3.3 2.4c-.6.2-.9.8-.9 1.4v.4" /><path d="M12 17h.01" />`),
  Search:   svg(html`<circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" />`),
  Sparkle:  svg(html`<path d="M12 3.5l1.7 4.3 4.3 1.7-4.3 1.7L12 15.5l-1.7-4.3L6 9.5l4.3-1.7z" /><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />`),
  Filter:   svg(html`<path d="M4 5.5h16l-6.2 7.3V19l-3.6-2v-4.2z" fill="currentColor" stroke="none" />`),
  GroupBy:  svg(html`<rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M3.5 9.5h17M9 9.5V19.5" />`),
  SortBy:   svg(html`<path d="M7 4.5v15M7 4.5L4 7.5M7 4.5l3 3" /><path d="M17 19.5v-15M17 19.5l-3-3M17 19.5l3-3" />`),
  Layers:   svg(html`<path d="M12 3.5l8.5 4.5-8.5 4.5L3.5 8z" /><path d="M3.5 12.5L12 17l8.5-4.5" /><path d="M3.5 16.5L12 21l8.5-4.5" />`),
  ListView: svg(html`<path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.8" cy="6" r="1.3" fill="currentColor" stroke="none" /><circle cx="4.8" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="4.8" cy="18" r="1.3" fill="currentColor" stroke="none" />`),
  BoardView:svg(html`<rect x="3.5" y="4.5" width="4.5" height="15" rx="1.5" /><rect x="9.8" y="4.5" width="4.5" height="10" rx="1.5" /><rect x="16" y="4.5" width="4.5" height="13" rx="1.5" />`),
  Calendar: svg(html`<rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3.5V6.5M16 3.5V6.5" />`),
  Edit:     svg(html`<path d="M16.5 4.5l3 3M4 20l1-4L16.5 4.5l3 3L8 19z" />`),
  Shield:   svg(html`<path d="M12 3.5l7 2.5v5c0 4.2-2.9 7.4-7 8.5-4.1-1.1-7-4.3-7-8.5v-5z" /><path d="M9 11.5l2 2 4-4" />`),
  Panel:    svg(html`<rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M15 4.5v15" />`),
  Chevron:  svg(html`<path d="M6 9l6 6 6-6" />`),
  ChevronR: svg(html`<path d="M9 6l6 6-6 6" />`),
  ChevronL: svg(html`<path d="M15 6l-6 6 6 6" />`),
  Plus:     svg(html`<path d="M12 5v14M5 12h14" />`),
  Minus:    svg(html`<path d="M5 12h14" />`),
  Close:    svg(html`<path d="M6 6l12 12M18 6L6 18" />`),
  Check:    svg(html`<path d="M5 12.5l4.5 4.5L19 7.5" />`),
  Play:     svg(html`<path d="M8 5.5l11 6.5-11 6.5z" fill="currentColor" stroke="none" />`),
  Stop:     svg(html`<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none" />`),
  Skip:     svg(html`<path d="M6 5.5l9 6.5-9 6.5z" fill="currentColor" stroke="none" /><path d="M18 5.5v13" />`),
  More:     svg(html`<circle cx="12" cy="5.5" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="18.5" r="1.4" fill="currentColor" stroke="none" />`),
  Lock:     svg(html`<rect x="5" y="10.5" width="14" height="9.5" rx="2" /><path d="M8.2 10.5V7.8a3.8 3.8 0 0 1 7.6 0v2.7" />`),
  Tag:      svg(html`<path d="M3.5 11.5V5a1.5 1.5 0 0 1 1.5-1.5h6.5l9 9-8 8z" /><circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none" />`),
  Clock:    svg(html`<circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" />`),
  Priority: svg(html`<path d="M5.5 19v-5M12 19V9.5M18.5 19V5" />`),
  User:     svg(html`<circle cx="12" cy="8" r="3.5" /><path d="M5 19a7 7 0 0 1 14 0" />`),
  Dollar:   svg(html`<path d="M12 3.5v17" /><path d="M16 7.5c-.8-1.4-2.3-2-4-2-2.2 0-3.8 1.1-3.8 3s1.6 2.6 3.8 3.1c2.4.5 4 1.2 4 3.2s-1.9 3.2-4.2 3.2c-1.9 0-3.5-.8-4.3-2.2" />`),
  Collapse: svg(html`<path d="M3.5 6h13M3.5 12h9M3.5 18h13" /><path d="M20.5 9l-3 3 3 3" />`),
  Pencil:   svg(html`<path d="M15.5 4.5l4 4L8 20H4v-4z" />`),
  Photo:    svg(html`<rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="8.8" cy="9.5" r="1.6" /><path d="M3.5 16.5l4.8-4.2 4.4 3.7 2.8-2.4 4.5 3.9" />`),
  Text:     svg(html`<path d="M6 4.5h12M12 4.5V19" />`),
  Prompt:   svg(html`<path d="M20.5 12a8.5 8.5 0 1 1-3.6-6.9" /><path d="M8.5 12l2.6 2.6 6.4-6.6" />`),
  Warning:  svg(html`<path d="M12 4l8.5 15h-17z" /><path d="M12 10v3.5M12 16.5h.01" />`),
  Info:     svg(html`<circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" />`),
  Star:     svg(html`<path d="M12 4l2.3 4.9 5.2.7-3.8 3.7.9 5.3-4.6-2.5-4.6 2.5.9-5.3L4.5 9.6l5.2-.7z" fill="currentColor" stroke="none" />`),
  Trash:    svg(html`<path d="M4.5 6.5h15M9.5 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" /><path d="M6.5 6.5l1 13h9l1-13" />`),
  Undo:     svg(html`<path d="M4 9.5h10a5.5 5.5 0 0 1 0 11H8" /><path d="M7.5 5.5L4 9.5l3.5 4" />`),
  ArrowUp:  svg(html`<path d="M12 19V5M6 11l6-6 6 6" />`),
  Menu:     svg(html`<path d="M4 6h16M4 12h16M4 18h16" />`),
};
