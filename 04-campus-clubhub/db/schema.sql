-- ============================================================
--  Campus ClubHub — PostgreSQL schema
--  Run with:  npm run db:setup
-- ============================================================

-- ---------- Students, club leads and staff coordinators ----------
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  enrollment_no VARCHAR(30),
  branch        VARCHAR(80),
  year_of_study SMALLINT CHECK (year_of_study BETWEEN 1 AND 5),
  password_hash VARCHAR(200) NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'student'
                CHECK (role IN ('student', 'lead', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- Categories give every club a colour and an icon ----------
CREATE TABLE IF NOT EXISTS categories (
  slug       VARCHAR(40) PRIMARY KEY,
  name       VARCHAR(60) NOT NULL,
  blurb      VARCHAR(160) NOT NULL,
  accent     VARCHAR(9)  NOT NULL,   -- hex colour used by the UI
  icon       VARCHAR(8)  NOT NULL,   -- emoji shown on chips
  sort_order SMALLINT    NOT NULL DEFAULT 0
);

-- ---------- Clubs ----------
CREATE TABLE IF NOT EXISTS clubs (
  id              SERIAL PRIMARY KEY,
  slug            VARCHAR(80)  NOT NULL UNIQUE,
  name            VARCHAR(120) NOT NULL,
  category        VARCHAR(40)  NOT NULL REFERENCES categories(slug),
  tagline         VARCHAR(160) NOT NULL,
  description     TEXT         NOT NULL,
  cover_image     VARCHAR(255) NOT NULL,
  founded_year    SMALLINT     NOT NULL,
  meeting_day     VARCHAR(40)  NOT NULL,
  meeting_time    VARCHAR(40)  NOT NULL,
  venue           VARCHAR(120) NOT NULL,
  lead_name       VARCHAR(100) NOT NULL,
  faculty_advisor VARCHAR(100) NOT NULL,
  contact_email   VARCHAR(160) NOT NULL,
  instagram       VARCHAR(80),
  highlights      TEXT[]       NOT NULL DEFAULT '{}',
  is_recruiting   BOOLEAN      NOT NULL DEFAULT TRUE,
  is_featured     BOOLEAN      NOT NULL DEFAULT FALSE,
  base_members    INTEGER      NOT NULL DEFAULT 0,  -- members carried over from the old register
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clubs_category ON clubs(category);

-- ---------- Membership requests ----------
CREATE TABLE IF NOT EXISTS memberships (
  id           SERIAL PRIMARY KEY,
  club_id      INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       VARCHAR(20) NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'rejected')),
  member_role  VARCHAR(40) NOT NULL DEFAULT 'member',
  message      TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (club_id, user_id)
);

-- ---------- Events ----------
CREATE TABLE IF NOT EXISTS events (
  id           SERIAL PRIMARY KEY,
  club_id      INTEGER NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  title        VARCHAR(140) NOT NULL,
  description  TEXT NOT NULL,
  event_date   DATE NOT NULL,
  start_time   TIME NOT NULL,
  end_time     TIME,
  venue        VARCHAR(140) NOT NULL,
  capacity     INTEGER NOT NULL DEFAULT 60,
  entry_fee    INTEGER NOT NULL DEFAULT 0,       -- in rupees, 0 = free
  banner_image VARCHAR(255) NOT NULL,
  tags         TEXT[] NOT NULL DEFAULT '{}',
  base_rsvps   INTEGER NOT NULL DEFAULT 0,       -- seats already taken offline
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

-- ---------- RSVPs ----------
CREATE TABLE IF NOT EXISTS rsvps (
  id         SERIAL PRIMARY KEY,
  event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status     VARCHAR(20) NOT NULL DEFAULT 'going'
             CHECK (status IN ('going', 'maybe')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

-- ---------- Noticeboard ----------
CREATE TABLE IF NOT EXISTS announcements (
  id         SERIAL PRIMARY KEY,
  club_id    INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
  title      VARCHAR(160) NOT NULL,
  body       TEXT NOT NULL,
  pinned     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- Gallery shown on the home page ----------
CREATE TABLE IF NOT EXISTS gallery (
  id         SERIAL PRIMARY KEY,
  club_id    INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
  caption    VARCHAR(160) NOT NULL,
  image_url  VARCHAR(255) NOT NULL,
  taken_on   DATE
);
