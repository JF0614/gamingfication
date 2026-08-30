const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user || user.role !== "teacher") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "index.html";
}