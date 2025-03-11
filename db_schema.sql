-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(30) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  karma INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Communities table
CREATE TABLE communities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(21) UNIQUE NOT NULL,
  description TEXT,
  creator_id INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Community members table (for memberships)
CREATE TABLE community_members (
  id SERIAL PRIMARY KEY,
  community_id INT REFERENCES communities(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  is_moderator BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Community visits table (for tracking recent visits)
CREATE TABLE community_visits (
  id SERIAL PRIMARY KEY,
  community_id INT REFERENCES communities(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  visited_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Posts table
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  content TEXT NOT NULL,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  community_id INT REFERENCES communities(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Comments table
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  post_id INT REFERENCES posts(id) ON DELETE CASCADE,
  parent_id INT REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Votes table
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  content_id INT NOT NULL,
  content_type VARCHAR(10) NOT NULL, -- 'post' or 'comment'
  value INT NOT NULL CHECK (value IN (-1, 1)), -- -1 for downvote, 1 for upvote
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, content_id, content_type) -- Each user can only vote once per content
);