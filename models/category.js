const pool = require('../db/connection');

const Category = {
    // カテゴリの作成
    create: async (user_id, name) => {
        const result = await pool.query(
            'INSERT INTO categories (user_id, name) VALUES ($1, $2) RETURNING *',
            [user_id, name]
        );
        return result.rows[0];
    },

    // ユーザーの全カテゴリ取得
    getAllByUserId: async (user_id) => {
        const result = await pool.query(
            'SELECT * FROM categories WHERE user_id = $1 ORDER BY name',
            [user_id]
        );
        return result.rows;
    },

    // カテゴリ名で検索
    getByName: async (user_id, name) => {
        const result = await pool.query(
            'SELECT * FROM categories WHERE user_id = $1 AND name = $2',
            [user_id, name]
        );
        return result.rows[0];
    },

    // IDでカテゴリ取得
    getById: async (id) => {
        const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        return result.rows[0];
    },

    // カテゴリの更新
    update: async (id, name) => {
        const result = await pool.query(
            'UPDATE categories SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [name, id]
        );
        return result.rows[0];
    },

    // カテゴリの削除
    delete: async (id) => {
        await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    },

    // メモにカテゴリを割り当てる
    assignToNote: async (note_id, category_id) => {
        const result = await pool.query(
            'INSERT INTO note_categories (note_id, category_id) VALUES ($1, $2) RETURNING *',
            [note_id, category_id]
        );
        return result.rows[0];
    },

    // メモからカテゴリを削除
    removeFromNote: async (note_id, category_id) => {
        await pool.query(
            'DELETE FROM note_categories WHERE note_id = $1 AND category_id = $2',
            [note_id, category_id]
        );
    },

    // メモの全カテゴリを削除
    removeAllFromNote: async (note_id) => {
        await pool.query('DELETE FROM note_categories WHERE note_id = $1', [note_id]);
    },

    // メモに紐づくカテゴリを取得
    getCategoriesByNoteId: async (note_id) => {
        const result = await pool.query(
            'SELECT c.* FROM categories c ' +
            'JOIN note_categories nc ON c.id = nc.category_id ' +
            'WHERE nc.note_id = $1 ' +
            'ORDER BY c.name',
            [note_id]
        );
        return result.rows;
    },

    // カテゴリに紐づくメモを取得
    getNotesByCategoryId: async (category_id, user_id) => {
        const result = await pool.query(
            'SELECT n.* FROM notes n ' +
            'JOIN note_categories nc ON n.id = nc.note_id ' +
            'WHERE nc.category_id = $1 AND n.user_id = $2 ' +
            'ORDER BY n.note_date DESC, n.created_at DESC',
            [category_id, user_id]
        );
        return result.rows;
    }
};

module.exports = Category; 