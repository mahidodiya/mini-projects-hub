/* ==========================================================================
   Formatting helpers and the reusable pieces of markup
   ========================================================================== */

/** Anything that came from the database gets escaped before it reaches the DOM. */
const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Dates arrive as YYYY-MM-DD; parse them as local time so the day never shifts. */
function parseDate(value) {
  if (value instanceof Date) return value;
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

const fmtDate = (value) => {
  const d = parseDate(value);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const fmtDateLong = (value) => {
  const d = parseDate(value);
  return `${DAYS_FULL[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/** "18:30:00" becomes "6:30 PM". */
function fmtTime(value) {
  if (!value) return '';
  const [h, m] = String(value).split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour}:${String(m).padStart(2, '0')} ${suffix}` : `${hour} ${suffix}`;
}

/** "Today", "Tomorrow", "in 4 days" — how a noticeboard would put it. */
function relativeDay(value) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((parseDate(value) - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff > 1 && diff < 7) return `In ${diff} days`;
  if (diff < 0) return 'Past';
  return null;
}

const fmtNumber = (n) => Number(n || 0).toLocaleString('en-IN');

const initials = (name) =>
  String(name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

/** A stable colour per person, so the same student always gets the same avatar. */
function avatarColor(name) {
  const palette = ['#7B1E2B', '#1F6F8B', '#1B7A45', '#6B3FA0', '#C2582A', '#2E4A9B', '#A81F5C', '#9A6B15'];
  let h = 0;
  for (const ch of String(name || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
}

/* ---------- toasts ---------- */
function toast(message, kind = '') {
  const el = document.createElement('div');
  el.className = `toast ${kind ? 'toast--' + kind : ''}`;
  el.textContent = message;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .25s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 250);
  }, 3400);
}

/* ==========================================================================
   Components
   ========================================================================== */

function clubCard(club) {
  const accent = esc(club.category_accent);
  return `
    <a class="club-card" href="#/clubs/${esc(club.slug)}">
      <div class="club-card__img">
        <img src="${esc(club.cover_image)}" alt="" loading="lazy" width="960" height="600" />
        <div class="club-card__badges">
          <span class="chip chip--cat" style="background:${accent}">${esc(club.category_icon)} ${esc(club.category_name)}</span>
          ${club.is_recruiting ? '<span class="chip chip--open">Recruiting</span>' : ''}
        </div>
        <span class="club-card__members">${fmtNumber(club.member_count)} members</span>
      </div>
      <div class="club-card__body">
        <h3>${esc(club.name)}</h3>
        <p class="club-card__tagline">${esc(club.tagline)}</p>
        <div class="club-card__meta">
          <span>${esc(club.meeting_day)}</span>
          <span>${club.upcoming_events > 0
            ? `${club.upcoming_events} event${club.upcoming_events > 1 ? 's' : ''} coming up`
            : `Since ${esc(club.founded_year)}`}</span>
        </div>
      </div>
    </a>`;
}

function eventTicket(event) {
  const d = parseDate(event.event_date);
  const accent = esc(event.category_accent);
  const soon = relativeDay(event.event_date);
  const filled = Math.min(100, Math.round((event.rsvp_count / Math.max(event.capacity, 1)) * 100));
  const tight = event.seats_left <= event.capacity * 0.1;

  return `
    <a class="ticket" href="#/events/${esc(event.id)}">
      <div class="ticket__stub" style="background:${accent}">
        <span class="ticket__month">${MONTHS[d.getMonth()].toUpperCase()}</span>
        <span class="ticket__day">${d.getDate()}</span>
        <span class="ticket__weekday">${DAYS[d.getDay()]}</span>
      </div>
      <div class="ticket__body">
        <span class="ticket__club" style="color:${accent}">${esc(event.club_name)}</span>
        <span class="ticket__title">${esc(event.title)}</span>
        <div class="ticket__facts">
          <span class="ticket__fact">🕒 ${fmtTime(event.start_time)}</span>
          <span class="ticket__fact">📍 ${esc(event.venue)}</span>
          ${Number(event.entry_fee) > 0
            ? `<span class="ticket__fact">₹${esc(event.entry_fee)}</span>`
            : '<span class="chip chip--free">Free entry</span>'}
          ${soon && soon !== 'Past' ? `<span class="chip">${soon}</span>` : ''}
        </div>
        <div class="ticket__bar">
          <div class="meter"><span style="width:${filled}%;background:${tight ? 'var(--warn)' : accent}"></span></div>
          <span class="small muted" style="margin-top:.25rem;display:block">
            ${event.seats_left > 0
              ? `${fmtNumber(event.seats_left)} of ${fmtNumber(event.capacity)} seats left`
              : 'Fully booked'}
          </span>
        </div>
      </div>
    </a>`;
}

const categoryTile = (cat) => `
  <a class="cat-tile" href="#/clubs?category=${esc(cat.slug)}" style="background:${esc(cat.accent)}">
    <span class="cat-tile__icon" aria-hidden="true">${esc(cat.icon)}</span>
    <h4>${esc(cat.name)}</h4>
    <p>${esc(cat.blurb)}</p>
    <span class="count">${cat.club_count} club${cat.club_count === 1 ? '' : 's'}</span>
  </a>`;

const noticeItem = (n) => `
  <article class="notice">
    <div class="notice__mark" style="background:${esc(n.category_accent || '#C8922A')}"></div>
    <div>
      <h4>${esc(n.title)}${n.pinned ? ' <span class="chip" style="vertical-align:middle">Pinned</span>' : ''}</h4>
      <p>${esc(n.body)}</p>
      <div class="notice__from">
        ${n.club_name
          ? `Posted by <a href="#/clubs/${esc(n.club_slug)}" style="color:${esc(n.category_accent)};font-weight:600">${esc(n.club_name)}</a>`
          : 'Posted by the Student Affairs Office'}
      </div>
    </div>
  </article>`;

const avatar = (name, size = '') =>
  `<span class="avatar ${size}" style="background:${avatarColor(name)}" title="${esc(name)}">${esc(initials(name))}</span>`;

const skeletons = (count, kind = 'card') =>
  Array.from({ length: count }, () => `<div class="skeleton skeleton--${kind}"></div>`).join('');

const emptyState = (title, body, action = '') => `
  <div class="empty">
    <h3>${esc(title)}</h3>
    <p>${esc(body)}</p>
    ${action}
  </div>`;
