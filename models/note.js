const pool = require('../db/connection');

const Note = {
    create: async (user_id, title, content, note_date) => {
        const result = await pool.query(
            'INSERT INTO notes (user_id, title, content, note_date) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, title, content, note_date]
        );
        return result.rows[0];
    },

    getAll: async (user_id) => {
        const result = await pool.query(
            'SELECT * FROM notes WHERE user_id = $1 ORDER BY note_date DESC, created_at DESC',  //日付順にソート
            [user_id]
        );
        return result.rows;
    },

    getById: async (id) => {
        const result = await pool.query('SELECT * FROM notes WHERE id = $1', [id]);
        return result.rows[0];
    },

    update: async (id, title, content, note_date) => {
        const result = await pool.query(
            'UPDATE notes SET title = $1, content = $2, note_date = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
            [title, content, note_date, id]
        );
        return result.rows[0];
    },

    delete: async (id) => {
        await pool.query('DELETE FROM notes WHERE id = $1' , [id]);
    },
    
    checkDateExists: async (user_id, note_date) => {
        const result = await pool.query(
            'SELECT EXISTS(SELECT 1 FROM notes WHERE user_id = $1 AND note_date = $2)',
            [user_id, note_date]
        );
        return result.rows[0].exists;
    },

    // カテゴリ関連の機能追加

    // メモとカテゴリの関連付け
    addCategory: async (note_id, category_id) => {
        try {
            const result = await pool.query(
                'INSERT INTO note_categories (note_id, category_id) VALUES ($1, $2) RETURNING *',
                [note_id, category_id]
            );
            return result.rows[0];
        } catch (err) {
            // 既に関連付けされている場合は無視する（一意性制約違反）
            if (err.code === '23505') {
                return null;
            }
            throw err;
        }
    },

    // メモからカテゴリを削除
    removeCategory: async (note_id, category_id) => {
        await pool.query(
            'DELETE FROM note_categories WHERE note_id = $1 AND category_id = $2',
            [note_id, category_id]
        );
    },

    // メモの全カテゴリを削除
    clearCategories: async (note_id) => {
        await pool.query('DELETE FROM note_categories WHERE note_id = $1', [note_id]);
    },

    // メモのカテゴリを取得
    getCategories: async (note_id) => {
        const result = await pool.query(
            'SELECT c.* FROM categories c ' +
            'JOIN note_categories nc ON c.id = nc.category_id ' +
            'WHERE nc.note_id = $1 ' +
            'ORDER BY c.name',
            [note_id]
        );
        return result.rows;
    },

    // カテゴリによるメモのフィルタリング
    getByCategoryId: async (user_id, category_id) => {
        const result = await pool.query(
            'SELECT n.* FROM notes n ' +
            'JOIN note_categories nc ON n.id = nc.note_id ' +
            'WHERE n.user_id = $1 AND nc.category_id = $2 ' +
            'ORDER BY n.note_date DESC, n.created_at DESC',
            [user_id, category_id]
        );
        return result.rows;
    },

    // カテゴリ付きのメモ一覧を取得
    getAllWithCategories: async (user_id) => {
        // メモとカテゴリを結合して取得
        const result = await pool.query(
            'SELECT n.*, COALESCE(json_agg(c) FILTER (WHERE c.id IS NOT NULL), \'[]\') as categories ' +
            'FROM notes n ' +
            'LEFT JOIN note_categories nc ON n.id = nc.note_id ' +
            'LEFT JOIN categories c ON nc.category_id = c.id ' +
            'WHERE n.user_id = $1 ' +
            'GROUP BY n.id ' +
            'ORDER BY n.note_date DESC, n.created_at DESC',
            [user_id]
        );
        return result.rows;
    }
};

module.exports = Note;