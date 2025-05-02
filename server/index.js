const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS & JSON
app.use(cors());
app.use(express.json());

// 提供 client 資料夾的檔案（讓前端可以讀到）
app.use(express.static(path.join(__dirname, '../client')));

// 📌 MongoDB 連線設定
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'book_printing';

// 📌 載入材質API
app.get('/api/materials/:type', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('materials');

    const type = req.params.type; // cover, flyleaf, inner, binding
    const materials = await collection.find({ materialType: type }).toArray();
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: '讀取材質資料失敗' });
  }
});

// 📌 報價API
app.post('/api/quote', async (req, res) => {
  const {
    bookSize,
    calculatedSize,
    pages,
    coverMaterial,
    flyleafMaterial,
    flyleafPrinting,
    innerMaterial,
    binding,
    bindingDirection,
    printingType,
    quantity
  } = req.body;

  try {
    await client.connect();
    const db = client.db(dbName);
    const materialsCollection = db.collection('materials');

    let totalPrice = 0;

    // ===== 封面費用 =====
    if (coverMaterial !== 'none') {
      const coverDoc = await materialsCollection.findOne({ materialType: 'cover', name: coverMaterial });
      if (coverDoc) {
        const coverUnitPrice = getUnitPrice(coverDoc.pricing, printingType.includes('雙面') ? 'double' : 'single', quantity);
        let coverTotal = coverUnitPrice * quantity;
        if (bindingDirection.includes('橫式')) coverTotal *= 2;
        totalPrice += coverTotal;
      }
    }

    // ===== 扉頁費用 =====
    if (flyleafMaterial !== 'none') {
      const flyleafDoc = await materialsCollection.findOne({ materialType: 'flyleaf', name: flyleafMaterial });
      if (flyleafDoc) {
        const type = flyleafPrinting === '印刷' ? (printingType.includes('雙面') ? 'double' : 'single') : 'single';
        const flyleafUnitPrice = getUnitPrice(flyleafDoc.pricing, type, quantity);
        totalPrice += flyleafUnitPrice * quantity * 2;
      }
    }

    // ===== 內頁費用 =====
    if (innerMaterial) {
      const innerDoc = await materialsCollection.findOne({ materialType: 'inner', name: innerMaterial });
      if (innerDoc) {
        const innerUnitPrice = getUnitPrice(innerDoc.pricing, printingType.includes('雙面') ? 'double' : 'single', quantity);
        let pagesPerBook = parseInt(pages, 10);
        if (calculatedSize === 'A5') {
          pagesPerBook = Math.ceil(pagesPerBook / 4);
        }
        const innerTotalPages = pagesPerBook * quantity;
        const innerTotal = innerUnitPrice * innerTotalPages;
        totalPrice += innerTotal;
      }
    }

    // ===== 裝訂費（固定假設30元/本）
    const bindingFeePerBook = 30;
    totalPrice += bindingFeePerBook * quantity;

    // ===== 回傳報價結果 =====
    res.json({
      message: `報價完成！總金額為新台幣 ${totalPrice} 元`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '報價計算失敗，請稍後再試。' });
  }
});

// 📌 補助工具：取得級距價格
function getUnitPrice(pricing, side, qty) {
  const ranges = pricing[side];
  for (const range of ranges) {
    if (qty >= range.minQty && qty <= range.maxQty) {
      return range.price;
    }
  }
  return ranges[ranges.length - 1].price;
}

// 📌 預設首頁打開 index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// 📌 啟動伺服器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`伺服器已啟動：http://localhost:${PORT}`);
});
