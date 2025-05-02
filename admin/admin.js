document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('adminToken', data.token);
      window.location.href = 'dashboard.html';
    } else {
      document.getElementById('errorMessage').textContent = data.message;
    }
  } catch (err) {
    document.getElementById('errorMessage').textContent = '登入失敗，請稍後再試';
  }
});
