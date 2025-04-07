const express = require('express');
const router = express.Router();
const Note = require('../models/note');
const Category = require('../models/category');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, content, month, day, categories } = req.body;
        
        // 日付の検証
        if (!month || !day || isNaN(month) || isNaN(day)) {
            return res.status(400).json({ message: '月と日には有効な数値を入力してください' });
        }
        
        const monthNum = parseInt(month, 10);
        const dayNum = parseInt(day, 10);
        
        // 月と日の値の検証
        if (monthNum < 1 || monthNum > 12) {
            return res.status(400).json({ message: '月は1から12の間で入力してください' });
        }
        
        // 月によって日の最大値を設定
        const daysInMonth = new Date(new Date().getFullYear(), monthNum, 0).getDate();
        if (dayNum < 1 || dayNum > daysInMonth) {
            return res.status(400).json({ message: `日は1から${daysInMonth}の間で入力してください` });
        }
        
        // 日付フォーマット（YYYY-MM-DD）
        const today = new Date();
        const note_date = `${today.getFullYear()}-${monthNum.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
        
        // 同じ日付のメモがすでに存在するか確認
        const exists = await Note.checkDateExists(req.user.id, note_date);
        if (exists) {
            return res.status(400).json({ message: 'この日付のメモはすでに存在します' });
        }
        
        // メモの作成
        const note = await Note.create(req.user.id, title, content, note_date);
        
        // カテゴリの処理
        if (categories && Array.isArray(categories) && categories.length > 0) {
            for (const categoryName of categories) {
                // カテゴリが存在するか確認し、なければ作成
                let category = await Category.getByName(req.user.id, categoryName);
                if (!category) {
                    category = await Category.create(req.user.id, categoryName);
                }
                
                // メモにカテゴリを関連付け
                await Note.addCategory(note.id, category.id);
            }
        }
        
        // カテゴリ情報を含めたメモを取得
        const noteWithCategories = {
            ...note,
            categories: await Note.getCategories(note.id)
        };
        
        res.status(201).json(noteWithCategories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get('/', authenticateToken, async (req, res) => {
    try {
        // カテゴリでフィルタリングする場合
        const { category_id } = req.query;
        
        let notes;
        if (category_id) {
            notes = await Note.getByCategoryId(req.user.id, category_id);
        } else {
            notes = await Note.getAllWithCategories(req.user.id);
        }
        
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
        
        // カテゴリ情報を取得して追加
        const categories = await Note.getCategories(note.id);
        
        res.json({
            ...note,
            categories
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { title, content, month, day, categories } = req.body;
        const note = await Note.getById(req.params.id);
        
        if (!note || note.user_id !== req.user.id) {
            return res.status(404).json({ message: 'メモが見つかりません' });
        }
        
        // 日付の検証
        if (!month || !day || isNaN(month) || isNaN(day)) {
            return res.status(400).json({ message: '月と日には有効な数値を入力してください' });
        }
        
        const monthNum = parseInt(month, 10);
        const dayNum = parseInt(day, 10);
        
        // 月と日の値の検証
        if (monthNum < 1 || monthNum > 12) {
            return res.status(400).json({ message: '月は1から12の間で入力してください' });
        }
        
        // 月によって日の最大値を設定
        const daysInMonth = new Date(new Date().getFullYear(), monthNum, 0).getDate();
        if (dayNum < 1 || dayNum > daysInMonth) {
            return res.status(400).json({ message: `日は1から${daysInMonth}の間で入力してください` });
        }
        
        // 日付フォーマット（YYYY-MM-DD）
        const today = new Date();
        const note_date = `${today.getFullYear()}-${monthNum.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
        
        // 同じ日付のメモが既に存在するか確認（自分自身は除く）
        const existingNotes = await Note.getAll(req.user.id);
        const duplicateNote = existingNotes.find(n => n.note_date === note_date && n.id !== parseInt(req.params.id));
        
        if (duplicateNote) {
            return res.status(400).json({ message: 'この日付のメモはすでに存在します' });
        }
        
        // メモの更新
        const updatedNote = await Note.update(req.params.id, title, content, note_date);
        
        // カテゴリの更新処理
        if (categories !== undefined) {
            // 既存のカテゴリをすべて削除
            await Note.clearCategories(note.id);
            
            // 新しいカテゴリを追加
            if (Array.isArray(categories) && categories.length > 0) {
                for (const categoryName of categories) {
                    // カテゴリが存在するか確認し、なければ作成
                    let category = await Category.getByName(req.user.id, categoryName);
                    if (!category) {
                        category = await Category.create(req.user.id, categoryName);
                    }
                    
                    // メモにカテゴリを関連付け
                    await Note.addCategory(note.id, category.id);
                }
            }
        }
        
        // カテゴリ情報を含めたメモを取得
        const noteWithCategories = {
            ...updatedNote,
            categories: await Note.getCategories(updatedNote.id)
        };
        
        res.json(noteWithCategories);
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