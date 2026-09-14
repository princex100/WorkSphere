ALTER TABLE email_verification_tokens
DROP CONSTRAINT IF EXISTS email_verification_tokens_user_id_fkey,
ADD CONSTRAINT email_verification_tokens_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;