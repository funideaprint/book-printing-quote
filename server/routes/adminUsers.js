// routes/adminUsers.js
const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

const url = process.env.MONGODB_URI;
const client = new MongoClient(url);
const dbName = 'book_printing';

// 📌 取得所有管理員帳號
router.get('/users', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = await db.collection('admin_users').find().toArray();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: '讀取管理員資料失敗', error: err.message });
  }
});

// 📌 新增管理員帳號
router.post('/users', async (req, res) => {
  const { username, password } = req.body;
  try {
    await client.connect();
    const db = client.db(dbName);
    const existing = await db.collection('admin_users').findOne({ username });
    if (existing) {
      return res.status(400).json({ message: '帳號已存在' });
    }
    await db.collection('admin_users').insertOne({ username, password });
    res.json({ message: '新增成功' });
  } catch (err) {
    res.status(500).json({ message: '新增失敗', error: err.message });
  }
});

// 📌 刪除管理員帳號
router.delete('/users/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await client.connect();
    const db = client.db(dbName);
    await db.collection('admin_users').deleteOne({ _id: new ObjectId(id) });
    res.json({ message: '刪除成功' });
  } catch (err) {
    res.status(500).json({ message: '刪除失敗', error: err.message });
  }
});

// 📌 管理員登入 API
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    await client.connect();
    const db = client.db(dbName);
    const user = await db.collection('admin_users').findOne({ username, password });

    if (user) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: '帳號或密碼錯誤' });
    }
  } catch (error) {
    console.error('[登入 API 錯誤]', error);
    res.status(500).json({ success: false, message: '伺服器錯誤，請稍後再試' });
  }
});


module.exports = router;
