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
    }
};

module.exports = Note;