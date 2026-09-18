# Campus ClubHub

The student clubs and societies portal for Government Engineering College, Bhavnagar. Students browse
the club register, see what is happening on campus this week, request to join a club and
book a seat at an event. Club leads see the requests waiting on them.

Built with Node.js, Express and PostgreSQL.

---

## What is in it

**For students**
- A directory of 24 clubs across 8 categories, with live search, category filters and sorting
- A page per club: what they do, when and where they meet, who runs it, what they have coming up
- An event calendar with seat counts, entry fees and one-click registration
- A campus noticeboard
- A personal dashboard showing the clubs you have joined and the events you are booked into

**For club leads and staff**
- Membership requests appear on the dashboard
- Club leads can publish events; staff accounts can add new clubs

**Under the hood**
- JWT sign-in with bcrypt-hashed passwords
- Member counts and seat availability computed in SQL, not stored and left to drift
- Cover artwork generated locally, so the site looks complete with no internet connection

---

## Setup

### 1. Requirements

- Node.js 18 or newer
- PostgreSQL 14 or newer, running locally

### 2. Create the database

```bash
psql -U postgres -c "CREATE DATABASE clubhub;"
```

### 3. Configure

Copy `.env.example` to `.env` and fill in your PostgreSQL password:

```
PORT=5000

DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clubhub

JWT_SECRET=a_long_random_string
JWT_EXPIRES_IN=7d
```

### 4. Install and build

```bash
npm install
npm run setup     # generates artwork, creates the tables, loads the sample data
npm start
```

Open http://localhost:5000

`npm run setup` is a shortcut for three separate scripts, which you can also run on their own:

| Command | What it does |
| --- | --- |
| `npm run images` | Regenerates every club and event cover into `public/img` |
| `npm run db:setup` | Applies `db/schema.sql` — safe to re-run, it uses `CREATE TABLE IF NOT EXISTS` |
| `npm run db:seed` | Wipes and reloads the sample data (this one **does** clear your tables) |
| `npm run dev` | Starts the server with auto-restart on file changes |

### Demo accounts

| Email | Password | Role |
| --- | --- | --- |
| `aarav@gecb.ac.in` | `student123` | Club lead — has pending requests on the dashboard |
| `priya@gecb.ac.in` | `student123` | Student — member of two clubs |
| `admin@gecb.ac.in` | `admin123` | Staff — can create clubs |

---

## Project structure

```
campus-clubhub/
├── db/
│   ├── index.js            Shared pg connection pool + query helpers
│   ├── schema.sql          The full PostgreSQL schema
│   ├── migrate.js          Applies schema.sql
│   ├── data.js             The club/event/notice catalogue — edit content here
│   └── seed.js             Loads data.js into PostgreSQL
│
├── models/                 SQL query layer (no ORM)
│   ├── Club.js
│   ├── Event.js
│   └── User.js
│
├── routes/
│   ├── authRoutes.js       register, login, me
│   ├── clubRoutes.js       list, detail, join, leave, create
│   ├── eventRoutes.js      list, detail, RSVP, cancel, create
│   └── meRoutes.js         dashboard data
│
├── middleware/auth.js      JWT signing and route guards
├── scripts/
│   └── generate-images.js  Procedural cover artwork
│
├── public/
│   ├── index.html          App shell
│   ├── css/styles.css      Design system
│   ├── js/api.js           fetch wrapper + session storage
│   ├── js/ui.js            Formatters and card components
│   ├── js/app.js           Router and page renderers
│   └── img/                Generated artwork
│
├── server.js
└── .env
```

---

## Database schema

| Table | Holds |
| --- | --- |
| `users` | Students, club leads and staff. Passwords are bcrypt hashes. |
| `categories` | The 8 interest areas, each with an accent colour and icon used by the UI |
| `clubs` | One row per club, keyed by a URL slug, with a `base_members` count carried over from the old paper register |
| `memberships` | Join requests — `pending`, `approved` or `rejected`. Unique per club + student. |
| `events` | Dates, times, venue, capacity, entry fee and tags |
| `rsvps` | Seat bookings. Unique per event + student. |
| `announcements` | Noticeboard posts, either campus-wide or from one club |
| `gallery` | Photos shown on the home page |

Member counts are `clubs.base_members` plus the approved rows in `memberships`, computed at
query time. Seats left is `events.capacity` minus `base_rsvps` plus the rows in `rsvps`.

---

## API reference

### Auth

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | — | Create an account, returns a JWT |
| `POST` | `/api/auth/login` | — | Sign in, returns a JWT |
| `GET` | `/api/auth/me` | Bearer | The signed-in user |

### Clubs

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/clubs` | — | List clubs. Query: `category`, `search`, `sort`, `recruiting`, `featured`, `limit` |
| `GET` | `/api/clubs/:slug` | optional | Full club page: events, members, notices, and your membership status if signed in |
| `POST` | `/api/clubs/:slug/join` | Bearer | Request to join |
| `DELETE` | `/api/clubs/:slug/join` | Bearer | Withdraw a request or leave |
| `POST` | `/api/clubs` | Bearer (admin) | Create a club |

### Events

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/events` | — | List events. Query: `scope` (`upcoming`/`past`/`all`), `club`, `category`, `search`, `limit` |
| `GET` | `/api/events/:id` | optional | Event detail, including your RSVP if signed in |
| `POST` | `/api/events/:id/rsvp` | Bearer | Book a seat |
| `DELETE` | `/api/events/:id/rsvp` | Bearer | Release your seat |
| `POST` | `/api/events` | Bearer (lead/admin) | Publish an event |

### Dashboard and general

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/me/clubs` | Bearer | Clubs you have joined or applied to |
| `GET` | `/api/me/events` | Bearer | Your bookings |
| `GET` | `/api/me/requests` | Bearer | Requests waiting on you, if you lead a club |
| `GET` | `/api/categories` | — | Categories with club counts |
| `GET` | `/api/stats` | — | Home page counters |
| `GET` | `/api/announcements` | — | Noticeboard |
| `GET` | `/api/gallery` | — | Home page photos |
| `GET` | `/api/health` | — | Server and database status |

---

## Adding your own content

Everything on the site comes from `db/data.js`. To add a club, append an entry to the
`CLUBS` array:

```js
{
  slug: 'astronomy-society',        // becomes /#/clubs/astronomy-society
  name: 'Astronomy Society',
  category: 'technology',           // must match a slug in CATEGORIES
  tagline: 'Two telescopes and a very dark field.',
  description: '...',
  founded_year: 2021,
  meeting_day: 'Friday', meeting_time: '9:00 – 11:00 PM',
  venue: 'North Campus Field',
  lead_name: 'Your Name', faculty_advisor: 'Prof. Someone',
  contact_email: 'astro@gecb.ac.in', instagram: 'astro.sit',
  highlights: ['...', '...'],
  is_recruiting: true, is_featured: false, base_members: 0,
}
```

Then run `npm run setup` again. The artwork for the new club is generated automatically
from its slug and category.

### Using real photographs instead of the generated artwork

The generated SVGs exist so the project works with no internet connection. To use real
photos, drop image files into `public/img/clubs/` and point the club at them — either by
setting `cover_image` on the row in PostgreSQL:

```sql
UPDATE clubs SET cover_image = '/img/clubs/cricket-photo.jpg' WHERE slug = 'willow-cricket';
```

…or by editing the path in `db/seed.js` where `cover_image` is inserted. Landscape images
around 960×600 work best; the cards crop to 16:9.

---

## Notes

- `npm run db:seed` truncates every table before loading. Do not run it against data you
  want to keep.
- Change `JWT_SECRET` before putting this anywhere other than your own machine.
- The front end is plain JavaScript with a hash router, so there is no build step. Edit a
  file in `public/` and refresh.

## License

MIT. Built as a college course project.
