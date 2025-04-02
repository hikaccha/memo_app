const pool = require('../db/connection');

const Note = {
    create: async (user_id, title, content) => {
        const result = await pool.query(
            'INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
            [user_id, title, content]
        );
        return result.rows[0];
    },

    getAll: async (user_id) => {
        const result = await pool.query(
            'SELECT * FROM notes WHERE user_id = $1',
            [user_id]
        );
        return result.rows;
    },

    getById: async (id) => {
        const result = await pool.query('SELECT * FROM notes WHERE id = [id]');
        return result.rows[0];
    },

    update: async (id, title, content) => {
        const result = await pool.query(
            'UPDATE notes SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [title, content, id]
        );
        return result.rows[0];
    },

    delete: async (id) => {
        await pool.query('DELETE FROM notes WHERE id = $1' , [id]);
    },
};

module.exports = Note;