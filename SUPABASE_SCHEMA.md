# Supabase Global Leaderboard Setup

To activate the Global Leaderboard in Aesthetic Block Master, follow these steps to set up your free Supabase project.

### 1. Create a Supabase Project
1. Go to [Supabase](https://supabase.com) and create an account if you haven't already.
2. Click **New Project** and follow the prompts.
3. Once your project is created, navigate to **Project Settings > API**.
4. Copy your **Project URL** and **anon public** API key.

### 2. Configure Environment Variables
1. Rename the `.env.example` file in the root of your project to `.env`.
2. Add your Supabase credentials to the file:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_api_key_here
```

### 3. Create the Database Table
1. In your Supabase dashboard, go to the **SQL Editor** (the terminal icon on the left).
2. Click **New Query** and paste the following SQL code:

```sql
-- Create the leaderboard table
CREATE TABLE leaderboard (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  lines INTEGER NOT NULL,
  level INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to SELECT (read) the high scores
CREATE POLICY "Allow public read access" 
  ON leaderboard FOR SELECT 
  USING (true);

-- Allow anonymous users to INSERT new scores
CREATE POLICY "Allow anonymous inserts" 
  ON leaderboard FOR INSERT 
  WITH CHECK (true);
```

3. Click **Run** to execute the query.

### 4. You're Done!
The game will automatically detect your configured environment variables on the next start and activate the **Local / Global** tabs in the Score History panel. It will gracefully fall back to local-only mode if the variables are removed.
