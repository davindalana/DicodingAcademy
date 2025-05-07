const regiter = {
    async render(container) {
        container.innerHTML = `
        <main id="main">
            <h2>Register</h2>
            <form id="registerform">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required />
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required />
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required minlength="8" />
                <button type="submit">Register</button>
            </form>
            <p>Sudah punya akun? <a href="#/">Login di sini</a></p>
        </main>
        `;


        const form = document.getElementById('registerform');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = form.name.value;
            const email = form.email.value;
            const password = form.password.value;
            try {
                const response = await fetch('https://story-api.dicoding.dev/v1/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, password }),
                });

                const result = await response.json();
                if (!result.error) {
                    alert('Registration Berhasil! Silahkan login');
                    window.location.hash = '/';
                } else {
                    alert('Gagal daftar'+ result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Registration failed');
            }
        })
    }
}

export default register;