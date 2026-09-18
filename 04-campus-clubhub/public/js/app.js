/* ==========================================================================
   Router and pages
   ========================================================================== */

const main = document.getElementById('main');
const render = (html) => { main.innerHTML = html; };
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Split "#/clubs?category=sports" into a path and its parameters. */
function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, search = ''] = raw.split('?');
  return { path: path.replace(/\/$/, '') || '/', params: Object.fromEntries(new URLSearchParams(search)) };
}

const go = (path) => { location.hash = path; };

/* ==========================================================================
   Home
   ========================================================================== */
async function homePage(params) {
  render(`
    <section class="hero">
      <div class="wrap hero-grid">
        <div class="hero-settle">
          <span class="hero-eyebrow">Odd semester registration is open</span>
          <h1>Every club on campus, in one place.</h1>
          <p class="lede">Every student club and society at the institute, with its meeting times, its people and everything it has planned. Browse freely, join what interests you.</p>
          <form class="hero-search" id="heroSearch" role="search">
            <input name="q" placeholder="Search clubs — cricket, robotics, theatre…" aria-label="Search clubs" />
            <button class="btn btn--onDark btn--sm" type="submit">Search</button>
          </form>
          <div class="hero-actions">
            <a class="btn btn--primary" href="#/clubs">Browse all clubs</a>
            <a class="btn btn--onDark" href="#/events">See what is on this week</a>
          </div>
        </div>
        <div id="heroStats"></div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="wrap">
        <div class="section-head">
          <div>
            <h2>Happening soon</h2>
            <p>The next events across every club. Registration is open on all of them.</p>
          </div>
          <a class="btn btn--ghost btn--sm" href="#/events">Full calendar</a>
        </div>
        <div class="rail" id="soonRail">${skeletons(3, 'ticket')}</div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="wrap">
        <div class="section-head">
          <div>
            <h2>Browse by interest</h2>
            <p>Eight categories covering everything the campus runs.</p>
          </div>
        </div>
        <div class="grid grid--4" id="catGrid">${skeletons(8, 'tile')}</div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="wrap">
        <div class="section-head">
          <div>
            <h2>Clubs worth a look</h2>
            <p>The societies drawing the biggest crowds this semester.</p>
          </div>
          <a class="btn btn--ghost btn--sm" href="#/clubs" id="allClubsLink">All clubs</a>
        </div>
        <div class="grid grid--3" id="featuredGrid">${skeletons(3, 'card')}</div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="wrap board-split">
        <div>
          <div class="section-head">
            <div><h2>From the noticeboard</h2></div>
            <a class="btn btn--ghost btn--sm" href="#/noticeboard">All notices</a>
          </div>
          <div class="notice-list" id="noticeList"></div>
        </div>
        <div>
          <div class="section-head"><div><h2>Recently on campus</h2></div></div>
          <div class="grid" style="grid-template-columns:1fr 1fr;gap:.75rem" id="galleryGrid"></div>
        </div>
      </div>
    </section>
  `);

  $('#heroSearch').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = new FormData(e.target).get('q').trim();
    go(q ? `/clubs?search=${encodeURIComponent(q)}` : '/clubs');
  });

  const [stats, events, cats, featured, notices, gallery] = await Promise.all([
    API.stats(), API.events({ limit: 6 }), API.categories(),
    API.clubs({ featured: true, limit: 6 }), API.announcements(), API.gallery(),
  ]);

  $('#heroStats').innerHTML = `
    <div class="stat-row">
      <div class="stat"><b>${fmtNumber(stats.clubs)}</b><span>Active clubs</span></div>
      <div class="stat"><b>${fmtNumber(stats.members)}</b><span>Student members</span></div>
      <div class="stat"><b>${fmtNumber(stats.upcoming_events)}</b><span>Events ahead</span></div>
      <div class="stat"><b>${fmtNumber(stats.categories)}</b><span>Categories</span></div>
    </div>`;

  $('#allClubsLink').textContent = `All ${stats.clubs} clubs`;
  $('#soonRail').innerHTML = events.map(eventTicket).join('');
  $('#catGrid').innerHTML = cats.map(categoryTile).join('');
  $('#featuredGrid').innerHTML = featured.slice(0, 6).map(clubCard).join('');
  $('#noticeList').innerHTML = notices.slice(0, 4).map(noticeItem).join('');
  $('#galleryGrid').innerHTML = gallery.slice(0, 6).map((g) => `
    <a href="#/clubs/${esc(g.club_slug)}" style="border-radius:var(--r-sm);overflow:hidden;position:relative;aspect-ratio:4/3">
      <img src="${esc(g.image_url)}" alt="${esc(g.caption)}" loading="lazy" style="width:100%;height:100%;object-fit:cover" />
    </a>`).join('');
}

/* ==========================================================================
   Club directory
   ========================================================================== */
async function clubsPage(params) {
  const state = {
    category: params.category || 'all',
    search: params.search || '',
    sort: params.sort || 'popular',
    recruiting: params.recruiting === 'true',
  };

  render(`
    <section class="section section--tight">
      <div class="wrap">
        <div class="section-head">
          <div>
            <h2>Club directory</h2>
            <p id="resultCount">Loading the register…</p>
          </div>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;margin-bottom:1.25rem">
          <div class="search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
            <input class="input input--search" id="clubSearch" placeholder="Search by name, interest or activity"
                   value="${esc(state.search)}" aria-label="Search clubs" />
          </div>
          <select class="input" id="clubSort" style="width:auto" aria-label="Sort clubs">
            <option value="popular">Most members</option>
            <option value="name">Name A–Z</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <label class="pill" style="cursor:pointer">
            <input type="checkbox" id="recruitOnly" ${state.recruiting ? 'checked' : ''} />
            Recruiting only
          </label>
        </div>

        <div class="filters" id="catFilters" style="margin-bottom:1.75rem"></div>
        <div class="grid grid--3" id="clubGrid">${skeletons(6, 'card')}</div>
      </div>
    </section>
  `);

  $('#clubSort').value = state.sort;

  const cats = await API.categories();
  const total = cats.reduce((sum, c) => sum + c.club_count, 0);

  $('#catFilters').innerHTML = [
    `<button class="pill ${state.category === 'all' ? 'is-active' : ''}" data-cat="all">All clubs <span class="count">${total}</span></button>`,
    ...cats.map((c) => `
      <button class="pill ${state.category === c.slug ? 'is-active' : ''}" data-cat="${esc(c.slug)}">
        ${esc(c.icon)} ${esc(c.name)} <span class="count">${c.club_count}</span>
      </button>`),
  ].join('');

  async function load() {
    $('#clubGrid').innerHTML = skeletons(6, 'card');
    const clubs = await API.clubs({
      category: state.category,
      search: state.search,
      sort: state.sort,
      recruiting: state.recruiting ? 'true' : undefined,
    });

    $('#resultCount').textContent = clubs.length
      ? `${clubs.length} club${clubs.length === 1 ? '' : 's'}${state.category !== 'all' ? ' in this category' : ' across eight categories'}`
      : 'Nothing matched those filters';

    $('#clubGrid').innerHTML = clubs.length
      ? clubs.map(clubCard).join('')
      : emptyState(
          'No clubs match that',
          'Try a broader search, or clear the category filter to see the whole register.',
          '<button class="btn btn--primary" id="clearFilters">Clear filters</button>'
        );

    $('#clubGrid').style.gridTemplateColumns = clubs.length ? '' : '1fr';
    $('#clearFilters')?.addEventListener('click', () => go('/clubs'));
  }

  $$('#catFilters .pill').forEach((btn) => btn.addEventListener('click', () => {
    state.category = btn.dataset.cat;
    $$('#catFilters .pill').forEach((b) => b.classList.toggle('is-active', b === btn));
    load();
  }));

  let timer;
  $('#clubSearch').addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.search = e.target.value.trim(); load(); }, 250);
  });

  $('#clubSort').addEventListener('change', (e) => { state.sort = e.target.value; load(); });
  $('#recruitOnly').addEventListener('change', (e) => { state.recruiting = e.target.checked; load(); });

  load();
}

/* ==========================================================================
   Club detail
   ========================================================================== */
async function clubPage(slug) {
  render(`<div class="wrap section"><div class="skeleton" style="height:320px"></div></div>`);

  let club;
  try {
    club = await API.club(slug);
  } catch {
    return render(`<div class="wrap section">${emptyState(
      'That club is not on the register',
      'The address may have changed. The full directory is one click away.',
      '<a class="btn btn--primary" href="#/clubs">Back to the directory</a>'
    )}</div>`);
  }

  const accent = esc(club.category_accent);
  const upcoming = club.events.filter((e) => parseDate(e.event_date) >= new Date(new Date().toDateString()));
  const past = club.events.filter((e) => parseDate(e.event_date) < new Date(new Date().toDateString()));

  render(`
    <section class="club-hero">
      <div class="club-hero__img"><img src="${esc(club.cover_image)}" alt="" /></div>
      <div class="club-hero__overlay">
        <div class="wrap club-hero__inner">
          <div style="display:flex;gap:.4rem;flex-wrap:wrap">
            <span class="chip chip--cat" style="background:${accent}">${esc(club.category_icon)} ${esc(club.category_name)}</span>
            ${club.is_recruiting
              ? '<span class="chip chip--open">Taking new members</span>'
              : '<span class="chip chip--closed">Not recruiting</span>'}
            <span class="chip">Founded ${esc(club.founded_year)}</span>
          </div>
          <h1>${esc(club.name)}</h1>
          <p class="tagline">${esc(club.tagline)}</p>
        </div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="wrap detail-grid">
        <div>
          <div class="panel">
            <h4>About the club</h4>
            <p style="max-width:var(--measure);color:var(--ink-soft)">${esc(club.description)}</p>
            ${club.highlights?.length ? `
              <h4 style="margin-top:1.4rem">What they are known for</h4>
              <ul class="highlights">${club.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
          </div>

          ${club.announcements.length ? `
            <div class="panel">
              <h4>Club notices</h4>
              <div class="notice-list">${club.announcements.map(noticeItem).join('')}</div>
            </div>` : ''}

          <div class="panel">
            <h4>Upcoming events</h4>
            ${upcoming.length
              ? `<div class="grid" style="gap:.9rem">${upcoming.map(eventTicket).join('')}</div>`
              : `<p class="muted small">Nothing scheduled yet. Follow the club notices or email ${esc(club.contact_email)} to hear first.</p>`}
            ${past.length ? `
              <h4 style="margin:1.4rem 0 .85rem">Previously</h4>
              <div class="grid" style="gap:.9rem;opacity:.72">${past.slice(0, 3).map(eventTicket).join('')}</div>` : ''}
          </div>
        </div>

        <aside>
          <div class="panel">
            <div id="joinBox"></div>
            <dl class="datalist" style="margin-top:1.1rem">
              <div><dt>Meets</dt><dd>${esc(club.meeting_day)}</dd></div>
              <div><dt>Time</dt><dd>${esc(club.meeting_time)}</dd></div>
              <div><dt>Venue</dt><dd>${esc(club.venue)}</dd></div>
              <div><dt>Members</dt><dd>${fmtNumber(club.member_count)}</dd></div>
            </dl>
          </div>

          <div class="panel">
            <h4>Who runs it</h4>
            <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.9rem">
              ${avatar(club.lead_name, 'avatar--lg')}
              <div>
                <div style="font-weight:700">${esc(club.lead_name)}</div>
                <div class="small muted">Student lead</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:.75rem">
              ${avatar(club.faculty_advisor, 'avatar--lg')}
              <div>
                <div style="font-weight:700">${esc(club.faculty_advisor)}</div>
                <div class="small muted">Faculty advisor</div>
              </div>
            </div>
          </div>

          ${club.members.length ? `
            <div class="panel">
              <h4>Members on the portal</h4>
              <div class="avatar-row">${club.members.slice(0, 12).map((m) => avatar(m.name)).join('')}</div>
              <p class="small muted" style="margin-top:.7rem">
                ${fmtNumber(club.member_count)} students in total, including those who joined before the portal.
              </p>
            </div>` : ''}

          <div class="panel">
            <h4>Get in touch</h4>
            <dl class="datalist">
              <div><dt>Email</dt><dd><a href="mailto:${esc(club.contact_email)}" style="color:${accent}">${esc(club.contact_email)}</a></dd></div>
              ${club.instagram ? `<div><dt>Instagram</dt><dd>@${esc(club.instagram)}</dd></div>` : ''}
            </dl>
          </div>
        </aside>
      </div>
    </section>
  `);

  renderJoinBox(club);
}

function renderJoinBox(club) {
  const box = $('#joinBox');
  if (!box) return;

  if (!Session.isSignedIn) {
    box.innerHTML = `
      <button class="btn btn--primary btn--block" id="joinBtn">Sign in to join</button>
      <p class="small muted" style="margin-top:.6rem;text-align:center">Your college email is all you need.</p>`;
    $('#joinBtn').addEventListener('click', () => openAuth());
    return;
  }

  const status = club.membership?.status;

  if (status === 'approved') {
    box.innerHTML = `
      <button class="btn btn--joined btn--block" disabled>✓ You are a member</button>
      <button class="btn btn--quiet btn--sm btn--block" id="leaveBtn" style="margin-top:.5rem">Leave this club</button>`;
  } else if (status === 'pending') {
    box.innerHTML = `
      <button class="btn btn--pending btn--block" disabled>Request awaiting approval</button>
      <button class="btn btn--quiet btn--sm btn--block" id="leaveBtn" style="margin-top:.5rem">Withdraw request</button>`;
  } else if (!club.is_recruiting) {
    box.innerHTML = `
      <button class="btn btn--ghost btn--block" disabled>Not recruiting right now</button>
      <p class="small muted" style="margin-top:.6rem;text-align:center">Membership reopens next semester.</p>`;
  } else {
    box.innerHTML = `<button class="btn btn--primary btn--block" id="joinBtn">Request to join</button>`;
  }

  $('#joinBtn')?.addEventListener('click', async (e) => {
    e.target.disabled = true;
    try {
      await API.joinClub(club.slug);
      club.membership = { status: 'pending' };
      toast(`Request sent to ${club.name}.`, 'ok');
      renderJoinBox(club);
    } catch (err) {
      toast(err.message, 'error');
      e.target.disabled = false;
    }
  });

  $('#leaveBtn')?.addEventListener('click', async (e) => {
    e.target.disabled = true;
    try {
      await API.leaveClub(club.slug);
      club.membership = null;
      toast(`You have left ${club.name}.`);
      renderJoinBox(club);
    } catch (err) {
      toast(err.message, 'error');
      e.target.disabled = false;
    }
  });
}

/* ==========================================================================
   Events
   ========================================================================== */
async function eventsPage(params) {
  const state = {
    scope: params.scope || 'upcoming',
    category: params.category || 'all',
    search: params.search || '',
  };

  render(`
    <section class="section section--tight">
      <div class="wrap">
        <div class="section-head">
          <div>
            <h2>Event calendar</h2>
            <p id="eventCount">Loading the calendar…</p>
          </div>
          <div class="filters">
            <button class="pill ${state.scope === 'upcoming' ? 'is-active' : ''}" data-scope="upcoming">Upcoming</button>
            <button class="pill ${state.scope === 'past' ? 'is-active' : ''}" data-scope="past">Past</button>
          </div>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:.75rem;margin-bottom:1.25rem">
          <div class="search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
            <input class="input input--search" id="eventSearch" placeholder="Search events, clubs or venues"
                   value="${esc(state.search)}" aria-label="Search events" />
          </div>
        </div>

        <div class="filters" id="eventCats" style="margin-bottom:1.75rem"></div>
        <div id="eventList" class="grid grid--2">${skeletons(6, 'ticket')}</div>
      </div>
    </section>
  `);

  const cats = await API.categories();
  $('#eventCats').innerHTML = [
    `<button class="pill ${state.category === 'all' ? 'is-active' : ''}" data-cat="all">Everything</button>`,
    ...cats.map((c) => `<button class="pill ${state.category === c.slug ? 'is-active' : ''}" data-cat="${esc(c.slug)}">${esc(c.icon)} ${esc(c.name)}</button>`),
  ].join('');

  async function load() {
    $('#eventList').innerHTML = skeletons(6, 'ticket');
    const events = await API.events(state);

    $('#eventCount').textContent = events.length
      ? `${events.length} ${state.scope === 'past' ? 'past event' : 'event'}${events.length === 1 ? '' : 's'} listed`
      : 'Nothing on the calendar for those filters';

    $('#eventList').innerHTML = events.length
      ? events.map(eventTicket).join('')
      : emptyState(
          state.scope === 'past' ? 'No past events here' : 'Nothing scheduled yet',
          'Change the category or search term, or check the noticeboard for what is being planned.'
        );
    $('#eventList').style.gridTemplateColumns = events.length ? '' : '1fr';
  }

  $$('[data-scope]').forEach((b) => b.addEventListener('click', () => {
    state.scope = b.dataset.scope;
    $$('[data-scope]').forEach((x) => x.classList.toggle('is-active', x === b));
    load();
  }));

  $$('#eventCats .pill').forEach((b) => b.addEventListener('click', () => {
    state.category = b.dataset.cat;
    $$('#eventCats .pill').forEach((x) => x.classList.toggle('is-active', x === b));
    load();
  }));

  let timer;
  $('#eventSearch').addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.search = e.target.value.trim(); load(); }, 250);
  });

  load();
}

async function eventPage(id) {
  render(`<div class="wrap section"><div class="skeleton" style="height:300px"></div></div>`);

  let ev;
  try {
    ev = await API.event(id);
  } catch {
    return render(`<div class="wrap section">${emptyState(
      'That event is not on the calendar',
      'It may have been removed. The full calendar is one click away.',
      '<a class="btn btn--primary" href="#/events">Back to the calendar</a>'
    )}</div>`);
  }

  const accent = esc(ev.category_accent);
  const isPast = parseDate(ev.event_date) < new Date(new Date().toDateString());
  const filled = Math.min(100, Math.round((ev.rsvp_count / Math.max(ev.capacity, 1)) * 100));

  render(`
    <section class="club-hero">
      <div class="club-hero__img" style="height:clamp(180px,26vw,280px)"><img src="${esc(ev.banner_image)}" alt="" /></div>
      <div class="club-hero__overlay">
        <div class="wrap club-hero__inner">
          <div style="display:flex;gap:.4rem;flex-wrap:wrap">
            <a class="chip chip--cat" style="background:${accent};text-decoration:none" href="#/clubs/${esc(ev.club_slug)}">${esc(ev.club_name)}</a>
            ${ev.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}
          </div>
          <h1>${esc(ev.title)}</h1>
          <p class="tagline">${fmtDateLong(ev.event_date)} · ${fmtTime(ev.start_time)}${ev.end_time ? ` to ${fmtTime(ev.end_time)}` : ''}</p>
        </div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="wrap detail-grid">
        <div class="panel">
          <h4>About this event</h4>
          <p style="max-width:var(--measure);color:var(--ink-soft)">${esc(ev.description)}</p>
          <h4 style="margin-top:1.4rem">Where and when</h4>
          <dl class="datalist">
            <div><dt>Date</dt><dd>${fmtDateLong(ev.event_date)}</dd></div>
            <div><dt>Time</dt><dd>${fmtTime(ev.start_time)}${ev.end_time ? ` – ${fmtTime(ev.end_time)}` : ''}</dd></div>
            <div><dt>Venue</dt><dd>${esc(ev.venue)}</dd></div>
            <div><dt>Entry</dt><dd>${Number(ev.entry_fee) > 0 ? `₹${esc(ev.entry_fee)} per person` : 'Free for all students'}</dd></div>
            <div><dt>Hosted by</dt><dd><a href="#/clubs/${esc(ev.club_slug)}" style="color:${accent};font-weight:600">${esc(ev.club_name)}</a></dd></div>
          </dl>
        </div>

        <aside>
          <div class="panel">
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:.4rem">
              <strong>${fmtNumber(ev.rsvp_count)} registered</strong>
              <span class="small muted">${fmtNumber(ev.capacity)} capacity</span>
            </div>
            <div class="meter"><span style="width:${filled}%;background:${accent}"></span></div>
            <p class="small muted" style="margin:.5rem 0 1rem">
              ${ev.seats_left > 0 ? `${fmtNumber(ev.seats_left)} seats still open.` : 'This one is full.'}
            </p>
            <div id="rsvpBox"></div>
          </div>
        </aside>
      </div>
    </section>
  `);

  renderRsvpBox(ev, isPast);
}

function renderRsvpBox(ev, isPast) {
  const box = $('#rsvpBox');
  if (!box) return;

  if (isPast) {
    box.innerHTML = `<button class="btn btn--ghost btn--block" disabled>This event has finished</button>`;
    return;
  }
  if (!Session.isSignedIn) {
    box.innerHTML = `<button class="btn btn--primary btn--block" id="rsvpBtn">Sign in to register</button>`;
    $('#rsvpBtn').addEventListener('click', () => openAuth());
    return;
  }
  if (ev.rsvp) {
    box.innerHTML = `
      <button class="btn btn--joined btn--block" disabled>✓ Your seat is booked</button>
      <button class="btn btn--quiet btn--sm btn--block" id="cancelBtn" style="margin-top:.5rem">Cancel registration</button>`;
  } else if (ev.seats_left <= 0) {
    box.innerHTML = `<button class="btn btn--ghost btn--block" disabled>Fully booked</button>`;
  } else {
    box.innerHTML = `<button class="btn btn--primary btn--block" id="rsvpBtn">Register for this event</button>`;
  }

  $('#rsvpBtn')?.addEventListener('click', async (e) => {
    e.target.disabled = true;
    try {
      await API.rsvp(ev.id);
      ev.rsvp = { status: 'going' };
      ev.rsvp_count += 1;
      ev.seats_left -= 1;
      toast(`You are on the list for ${ev.title}.`, 'ok');
      renderRsvpBox(ev, isPast);
    } catch (err) {
      toast(err.message, 'error');
      e.target.disabled = false;
    }
  });

  $('#cancelBtn')?.addEventListener('click', async (e) => {
    e.target.disabled = true;
    try {
      await API.cancelRsvp(ev.id);
      ev.rsvp = null;
      ev.rsvp_count -= 1;
      ev.seats_left += 1;
      toast('Your seat has been released.');
      renderRsvpBox(ev, isPast);
    } catch (err) {
      toast(err.message, 'error');
      e.target.disabled = false;
    }
  });
}

/* ==========================================================================
   Noticeboard
   ========================================================================== */
async function noticeboardPage() {
  render(`
    <section class="section section--tight">
      <div class="wrap-narrow">
        <div class="section-head">
          <div>
            <h2>Campus noticeboard</h2>
            <p>Announcements from the Student Affairs Office and from individual clubs.</p>
          </div>
        </div>
        <div class="notice-list" id="board">${skeletons(4, 'ticket')}</div>
      </div>
    </section>
  `);

  const notices = await API.announcements();
  $('#board').innerHTML = notices.length
    ? notices.map(noticeItem).join('')
    : emptyState('The board is clear', 'Nothing has been posted this week. Check back after the weekend.');
}

/* ==========================================================================
   Dashboard
   ========================================================================== */
async function dashboardPage() {
  if (!Session.isSignedIn) {
    render(`<div class="wrap section">${emptyState(
      'Sign in to see your campus',
      'Your clubs, your bookings and any requests waiting on you all live here.',
      '<button class="btn btn--primary" id="dashSignIn">Sign in</button>'
    )}</div>`);
    $('#dashSignIn').addEventListener('click', () => openAuth());
    return;
  }

  const user = Session.user;
  render(`
    <section class="section section--tight">
      <div class="wrap">
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:2rem">
          ${avatar(user.name, 'avatar--lg')}
          <div>
            <h2 style="font-size:1.75rem">${esc(user.name)}</h2>
            <p class="small muted">
              ${esc(user.branch || 'Student')}${user.year_of_study ? ` · Year ${esc(user.year_of_study)}` : ''}
              ${user.enrollment_no ? ` · ${esc(user.enrollment_no)}` : ''}
            </p>
          </div>
        </div>

        <div id="requestsSection"></div>

        <div class="section-head"><div><h2>My clubs</h2></div>
          <a class="btn btn--ghost btn--sm" href="#/clubs">Find more</a></div>
        <div class="grid grid--3" id="myClubs">${skeletons(3, 'card')}</div>

        <div class="section-head" style="margin-top:3rem"><div><h2>My bookings</h2></div>
          <a class="btn btn--ghost btn--sm" href="#/events">Browse events</a></div>
        <div class="grid grid--2" id="myEvents">${skeletons(2, 'ticket')}</div>
      </div>
    </section>
  `);

  const [clubs, events, requests] = await Promise.all([
    API.myClubs(), API.myEvents(), API.myRequests().catch(() => []),
  ]);

  $('#myClubs').innerHTML = clubs.length
    ? clubs.map((c) => `
      <a class="club-card" href="#/clubs/${esc(c.slug)}">
        <div class="club-card__img">
          <img src="${esc(c.cover_image)}" alt="" loading="lazy" />
          <div class="club-card__badges">
            <span class="chip chip--cat" style="background:${esc(c.category_accent)}">${esc(c.category_name)}</span>
            ${c.status === 'approved'
              ? `<span class="chip chip--open">${esc(c.member_role === 'member' ? 'Member' : c.member_role)}</span>`
              : '<span class="chip chip--free">Awaiting approval</span>'}
          </div>
        </div>
        <div class="club-card__body">
          <h3>${esc(c.name)}</h3>
          <p class="club-card__tagline">${esc(c.tagline)}</p>
        </div>
      </a>`).join('')
    : emptyState('You have not joined a club yet',
        'Most of them are taking members right now — the directory is a good place to start.',
        '<a class="btn btn--primary" href="#/clubs">Browse the directory</a>');
  $('#myClubs').style.gridTemplateColumns = clubs.length ? '' : '1fr';

  $('#myEvents').innerHTML = events.length
    ? events.map((e) => `
      <a class="ticket" href="#/events/${esc(e.id)}">
        <div class="ticket__stub" style="background:${esc(e.category_accent)}">
          <span class="ticket__month">${MONTHS[parseDate(e.event_date).getMonth()].toUpperCase()}</span>
          <span class="ticket__day">${parseDate(e.event_date).getDate()}</span>
          <span class="ticket__weekday">${DAYS[parseDate(e.event_date).getDay()]}</span>
        </div>
        <div class="ticket__body">
          <span class="ticket__club" style="color:${esc(e.category_accent)}">${esc(e.club_name)}</span>
          <span class="ticket__title">${esc(e.title)}</span>
          <div class="ticket__facts">
            <span class="ticket__fact">🕒 ${fmtTime(e.start_time)}</span>
            <span class="ticket__fact">📍 ${esc(e.venue)}</span>
            ${relativeDay(e.event_date) ? `<span class="chip">${relativeDay(e.event_date)}</span>` : ''}
          </div>
        </div>
      </a>`).join('')
    : emptyState('No bookings yet', 'Registration is open on every upcoming event on the calendar.',
        '<a class="btn btn--primary" href="#/events">See what is on</a>');
  $('#myEvents').style.gridTemplateColumns = events.length ? '' : '1fr';

  if (requests.length) {
    $('#requestsSection').innerHTML = `
      <div class="panel" style="margin-bottom:2.5rem;border-left:4px solid var(--brass)">
        <h4>${requests.length} join request${requests.length === 1 ? '' : 's'} waiting on you</h4>
        <div class="stack" style="margin-top:.75rem">
          ${requests.map((r) => `
            <div style="display:flex;align-items:center;gap:.75rem;padding:.6rem 0;border-bottom:1px solid var(--line-soft)">
              ${avatar(r.student_name)}
              <div style="flex:1;min-width:0">
                <div style="font-weight:600">${esc(r.student_name)}</div>
                <div class="small muted">${esc(r.branch || 'Student')} · wants to join ${esc(r.club_name)}</div>
              </div>
              <span class="chip">${fmtDate(r.requested_at)}</span>
            </div>`).join('')}
        </div>
        <p class="small muted" style="margin-top:.85rem">Approvals are handled in the club office for now.</p>
      </div>`;
  }
}

/* ==========================================================================
   Authentication modal
   ========================================================================== */
const authModal = $('#authModal');

function openAuth(mode = 'login') {
  authModal.classList.add('is-open');
  switchAuthTab(mode);
  setTimeout(() => $(`#${mode === 'login' ? 'loginForm' : 'registerForm'} input`)?.focus(), 60);
}

function closeAuth() {
  authModal.classList.remove('is-open');
  $('#authError').hidden = true;
}

function switchAuthTab(mode) {
  const isLogin = mode === 'login';
  $('#tabLogin').classList.toggle('is-active', isLogin);
  $('#tabRegister').classList.toggle('is-active', !isLogin);
  $('#tabLogin').setAttribute('aria-selected', String(isLogin));
  $('#tabRegister').setAttribute('aria-selected', String(!isLogin));
  $('#loginForm').hidden = !isLogin;
  $('#registerForm').hidden = isLogin;
  $('#authTitle').textContent = isLogin ? 'Sign in to ClubHub' : 'Create your ClubHub account';
  $('#authError').hidden = true;
}

const showAuthError = (message) => {
  const box = $('#authError');
  box.textContent = message;
  box.hidden = false;
};

$('#tabLogin').addEventListener('click', () => switchAuthTab('login'));
$('#tabRegister').addEventListener('click', () => switchAuthTab('register'));
$('#authClose').addEventListener('click', closeAuth);
authModal.addEventListener('click', (e) => { if (e.target === authModal) closeAuth(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAuth(); });

$('#fillDemo').addEventListener('click', () => {
  const form = $('#loginForm');
  form.email.value = 'aarav@gecb.ac.in';
  form.password.value = 'student123';
});

$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;
  try {
    const data = new FormData(e.target);
    const session = await API.login(data.get('email'), data.get('password'));
    Session.set(session);
    closeAuth();
    toast(`Welcome back, ${session.user.name.split(' ')[0]}.`, 'ok');
    router();
  } catch (err) {
    showAuthError(err.message);
  } finally {
    btn.disabled = false;
  }
});

$('#registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;
  try {
    const payload = Object.fromEntries(new FormData(e.target));
    const session = await API.register(payload);
    Session.set(session);
    closeAuth();
    toast('Account created. Welcome to ClubHub.', 'ok');
    go('/clubs');
  } catch (err) {
    showAuthError(err.message);
  } finally {
    btn.disabled = false;
  }
});

/* ==========================================================================
   Navigation chrome
   ========================================================================== */
function renderNavAuth() {
  const slot = $('#navAuth');
  if (Session.isSignedIn) {
    const user = Session.user;
    slot.innerHTML = `
      <a href="#/dashboard" data-route="/dashboard" style="display:inline-flex;align-items:center;gap:.5rem">
        ${avatar(user.name)} <span>My campus</span>
      </a>
      <button class="btn btn--quiet btn--sm" id="signOut">Sign out</button>`;
    $('#signOut').addEventListener('click', () => {
      Session.clear();
      toast('Signed out.');
      go('/');
    });
  } else {
    slot.innerHTML = `<button class="btn btn--primary btn--sm" id="signIn">Sign in</button>`;
    $('#signIn').addEventListener('click', () => openAuth());
  }
  markActiveNav();
}

function markActiveNav() {
  const { path } = parseHash();
  $$('.nav a[data-route]').forEach((a) => {
    const route = a.dataset.route;
    a.classList.toggle('is-active', route === '/' ? path === '/' : path.startsWith(route));
  });
}

$('#navToggle').addEventListener('click', () => {
  const nav = $('#nav');
  const open = nav.classList.toggle('is-open');
  $('#navToggle').setAttribute('aria-expanded', String(open));
});

/* ==========================================================================
   Router
   ========================================================================== */
async function router() {
  const { path, params } = parseHash();
  $('#nav').classList.remove('is-open');
  markActiveNav();

  try {
    if (path === '/') await homePage(params);
    else if (path === '/clubs') await clubsPage(params);
    else if (path.startsWith('/clubs/')) await clubPage(decodeURIComponent(path.slice(7)));
    else if (path === '/events') await eventsPage(params);
    else if (path.startsWith('/events/')) await eventPage(decodeURIComponent(path.slice(8)));
    else if (path === '/noticeboard') await noticeboardPage();
    else if (path === '/dashboard') await dashboardPage();
    else {
      render(`<div class="wrap section">${emptyState(
        'That page does not exist',
        'The link may be out of date. Everything on the portal starts from the home page.',
        '<a class="btn btn--primary" href="#/">Go to the home page</a>'
      )}</div>`);
    }
  } catch (err) {
    render(`<div class="wrap section">${emptyState(
      'The portal could not load that',
      err.message + ' — if this keeps happening, check that the server and database are running.',
      '<button class="btn btn--primary" onclick="location.reload()">Try again</button>'
    )}</div>`);
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
}

window.addEventListener('hashchange', router);
window.addEventListener('session-changed', renderNavAuth);

$('#year').textContent = new Date().getFullYear();
if (!location.hash) location.hash = '#/';
renderNavAuth();
router();
