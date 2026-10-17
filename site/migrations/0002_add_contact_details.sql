-- Optional reply channel chosen by the sender, e.g. ('discord', 'sqrt_1').
ALTER TABLE messages ADD COLUMN contact_method TEXT;
ALTER TABLE messages ADD COLUMN contact_handle TEXT;
