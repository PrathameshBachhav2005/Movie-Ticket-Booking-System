
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(100) UNIQUE NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seats (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(255),
  isbooked INT DEFAULT 0
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'seats' AND column_name = 'booked_by'
  ) THEN
    ALTER TABLE seats ADD COLUMN booked_by INT REFERENCES users(id);
  END IF;
END
$$;

INSERT INTO seats (isbooked)
SELECT 0 FROM generate_series(1, 20)
WHERE NOT EXISTS (SELECT 1 FROM seats LIMIT 1);

CREATE TABLE IF NOT EXISTS bookings (
  id        SERIAL PRIMARY KEY,
  user_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seat_id   INT NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
  movie_id  VARCHAR(50) NOT NULL,
  booked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (seat_id, movie_id)   
);


SELECT 'Migration completed successfully!' AS status;
