// 前端載入封面材質、扉頁材質、內頁材質、裝訂方式
window.onload = async function() {
  await loadOptions('coverMaterial', '/api/materials/cover');
  await loadOptions('flyleafMaterial', '/api/materials/flyleaf');
  await loadOptions('innerMaterial', '/api/materials/inner');
  await loadOptions('binding', '/api/materials/binding');
};

async function loadOptions(selectId, apiUrl) {
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    const select = document.getElementById(selectId);

    // 不移除"無封面"、"無扉頁"選項
    if (selectId !== 'coverMaterial' && selectId !== 'flyleafMaterial') {
      select.innerHTML = '';
    }

    data.forEach(item => {
      const option = document.createElement('option');
      option.value = item.name;
      option.textContent = item.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error(`載入${selectId}選項失敗：`, error);
  }
}

// 切換尺寸選擇，顯示或隱藏自訂尺寸欄位
function handleSizeChange() {
  const bookSize = document.getElementById('bookSize').value;
  const customArea = document.getElementById('customSizeArea');
  if (bookSize === 'custom') {
    customArea.style.display = 'block';
  } else {
    customArea.style.display = 'none';
  }
}

// 切換裝訂方向，橫式禁止騎馬釘
function handleBindingDirectionChange() {
  const bindingDirection = document.getElementById('bindingDirection').value;
  const bindingSelect = document.getElementById('binding');
  
  if (bindingDirection.includes('橫式')) {
    Array.from(bindingSelect.options).forEach(option => {
      if (option.value.includes('騎馬釘')) {
        option.disabled = true;
      }
    });
  } else {
    Array.from(bindingSelect.options).forEach(option => {
      if (option.value.includes('騎馬釘')) {
        option.disabled = false;
      }
    });
  }
}

// 表單送出處理
document.getElementById('quoteForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const formData = new FormData(this);
  const jsonData = {};

  formData.forEach((value, key) => {
    jsonData[key] = value;
  });

  // 自訂尺寸檢查
  if (jsonData.bookSize === 'custom') {
    const width = parseInt(jsonData.customWidth, 10);
    const height = parseInt(jsonData.customHeight, 10);

    if (width > 210 || height > 297) {
      alert('自訂尺寸長或寬不能超過A4（210x297mm）！');
      return;
    }

    // 自訂尺寸判斷價格區間（小於A5走A5價）
    if ((width <= 148 && height <= 210) || (width <= 210 && height <= 148)) {
      jsonData.calculatedSize = 'A5';
    } else {
      jsonData.calculatedSize = 'A4';
    }
  } else {
    jsonData.calculatedSize = jsonData.bookSize;
  }

  try {
    const res = await fetch('/api/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    });

    const result = await res.json();
    document.getElementById('quoteResult').innerHTML = `
      <h3>報價結果</h3>
      <p>${result.message}</p>
    `;
  } catch (error) {
    console.error('詢價失敗：', error);
    alert('送出詢價時發生錯誤，請稍後再試。');
  }
});
