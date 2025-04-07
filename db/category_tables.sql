-- カテゴリテーブルの作成
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 同一ユーザー内でカテゴリ名の重複を防ぐインデックス
CREATE UNIQUE INDEX idx_categories_user_id_name ON categories (user_id, name);

-- ノートとカテゴリの中間テーブル（多対多関係）
CREATE TABLE IF NOT EXISTS note_categories (
    note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (note_id, category_id)
);

-- インデックスの作成
CREATE INDEX idx_note_categories_note_id ON note_categories (note_id);
CREATE INDEX idx_note_categories_category_id ON note_categories (category_id); 