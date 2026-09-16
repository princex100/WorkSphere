CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'SOLO',
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'OWNER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_workspace_user UNIQUE (workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_created_by ON workspaces(created_by);

-- Idempotent backfill: Create a personal workspace for pre-existing users without one
DO $$
DECLARE
    u RECORD;
    w_id UUID;
BEGIN
    FOR u IN SELECT id, name FROM users LOOP
        IF NOT EXISTS (SELECT 1 FROM workspace_members WHERE user_id = u.id) THEN
            INSERT INTO workspaces (name, type, created_by)
            VALUES (COALESCE(NULLIF(u.name, ''), 'Personal') || '''s Workspace', 'SOLO', u.id)
            RETURNING id INTO w_id;

            INSERT INTO workspace_members (workspace_id, user_id, role)
            VALUES (w_id, u.id, 'OWNER');
        END IF;
    END LOOP;
END $$;
