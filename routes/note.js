const express = require('express');
const router = express.Router();
const Note = require('../models/note');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, content } = req.body;
        const note = await Note.create(req.user.id, title, content);
        res.status(201).json(note);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get('/', authenticateToken, async (req, res) => {　　//ここでフィルタリングし、req.user.idを渡している
    try {
        const notes = await Note.getAll(req.user.id);
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const note = await Note.getById(req.params.id);
        if (!note || note.user_id !==req.user.id) {
            return res.status(404).json({ message: 'メモが見つかりません' });
        }
        res.json(note);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const{ title, content } = req.body;
        const note = await Note.getById(req.params.id);
        if (!note || note.user_id !== req.user.id) {
            return res.status(404).json({ message: 'メモが見つかりません' });
        }
        const updateNote = await Note.update(req.params.id, title, content);
        res.json(updateNote);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const note = await Note.getById(req.params.id);
        if (!note || note.user_id !== req.user.id) {
            return res.status(404).json({ message: 'メモが見つかりません'});
        }
        await Note.delete(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;