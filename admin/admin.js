// admin/admin.js
document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.success) {
      alert('登入成功！');
      window.location.href = '/admin/dashboard.html';
    } else {
      alert('登入失敗：' + data.message);
    }
  } catch (error) {
    alert('登入錯誤，請稍後再試。');
    console.error('登入錯誤：', error);
  }
});
