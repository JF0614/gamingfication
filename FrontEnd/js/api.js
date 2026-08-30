const API_URL = "http://localhost:3000";

async function apiFetch(url, options = {}) {

    const token = localStorage.getItem("token");

    const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "index.html";

        return null;
    }

    return response;
}