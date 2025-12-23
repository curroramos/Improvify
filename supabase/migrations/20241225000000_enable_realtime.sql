-- Enable realtime for users table
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Set replica identity to full for proper change tracking
ALTER TABLE users REPLICA IDENTITY FULL;
