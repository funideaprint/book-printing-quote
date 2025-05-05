// server/routes/admin.js
const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const url = process.env.MONGODB_URI;
const client = new MongoClient(url);
const dbName = 'book_printing';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    await client.connect();
    const db = client.db(dbName);
    const user = await db.collection('admin_users').findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: '帳號或密碼錯誤' });
    }

    res.json({ success: true, message: '登入成功' });
  } catch (err) {
    console.error('[登入錯誤]', err);
    res.status(500).json({ success: false, message: '登入失敗' });
  }
});

module.exports = router;
