const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGODB_URI;
const DB_NAME = 'book_printing';
const SECRET = 'funidea-secret'; // 可改成環境變數

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    const user = await db.collection('admin_users').findOne({ username });

    if (!user) return res.status(401).json({ message: '帳號不存在' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: '密碼錯誤' });

    const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '登入錯誤' });
  }
});

module.exports = router;
