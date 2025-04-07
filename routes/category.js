const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const authenticateToken = require('../middleware/auth');

// 全カテゴリの取得
router.get('/', authenticateToken, async (req, res) => {
    try {
        const categories = await Category.getAllByUserId(req.user.id);
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// カテゴリの作成
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'カテゴリ名を入力してください' });
        }
        
        // 同じ名前のカテゴリが既に存在するかチェック
        const existingCategory = await Category.getByName(req.user.id, name);
        if (existingCategory) {
            return res.status(400).json({ message: 'このカテゴリ名は既に使用されています' });
        }
        
        const category = await Category.create(req.user.id, name);
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// カテゴリの更新
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        const category = await Category.getById(req.params.id);
        
        if (!category || category.user_id !== req.user.id) {
            return res.status(404).json({ message: 'カテゴリが見つかりません' });
        }
        
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'カテゴリ名を入力してください' });
        }
        
        // 同じ名前のカテゴリが既に存在するかチェック（自分自身は除く）
        const existingCategory = await Category.getByName(req.user.id, name);
        if (existingCategory && existingCategory.id !== parseInt(req.params.id)) {
            return res.status(400).json({ message: 'このカテゴリ名は既に使用されています' });
        }
        
        const updatedCategory = await Category.update(req.params.id, name);
        res.json(updatedCategory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// カテゴリの削除
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const category = await Category.getById(req.params.id);
        
        if (!category || category.user_id !== req.user.id) {
            return res.status(404).json({ message: 'カテゴリが見つかりません' });
        }
        
        await Category.delete(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// カテゴリに紐づくメモの取得
router.get('/:id/notes', authenticateToken, async (req, res) => {
    try {
        const category = await Category.getById(req.params.id);
        
        if (!category || category.user_id !== req.user.id) {
            return res.status(404).json({ message: 'カテゴリが見つかりません' });
        }
        
        const notes = await Category.getNotesByCategoryId(req.params.id, req.user.id);
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 