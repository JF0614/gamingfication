const API_URL = "http://localhost:3000";

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username,
                password
            })
        });


        
                const data = await response.json();
        
                if (!response.ok) {
                    throw new Error(data.message || "Login gagal");
                }
        
                // Simpan JWT
                localStorage.setItem("token", data.token);
        
                // Simpan role kalau dikirim backend
                if (data.user) {
                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );
                }
        
                message.className = "alert alert-success";
                message.textContent = "Login berhasil!";
                message.classList.remove("d-none");
        
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 500);

    } catch (error) {

        message.className = "alert alert-danger";
        message.textContent = error.message;
        message.classList.remove("d-none");
    }
});