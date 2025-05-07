const login = {
    async render(container) {
        container.innerHTML = `
          <main id="main">
            <h1>Login</h1>
            <form id="loginForm">
              <label for="email">Email:</label>
              <input type="email" id="email" name="email" required />
              <label for="password">Password:</label>
              <input type="password" id="password" name="password" required minlength="8" />
              <button type="submit">Login</button>
            </form>
            <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
          </main>
        `;

        const form = document.getElementById('login-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = form.email.value;
            const password = form.password.value;
            try {
                const response = await fetch('https://story-api.dicoding.dev/v1/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const result = await response.json();
                if (!response.error) {
                    localStorage.setItem('token', result.loginResult.token);
                    location.hash = '/home';
                } else {
                    alert('Login failed');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Login failed');
            }
        })
    }
};

export default login;