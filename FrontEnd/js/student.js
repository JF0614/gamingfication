

if (!token) {
    window.location.href = "index.html";
}

const params = new URLSearchParams(window.location.search);
const studentId = params.get("id");

const profileContainer =
    document.getElementById("profileContainer");


const rankNames = {
    0: "Noob Builder",
    1: "Junior Creator",
    2: "Studio Explorer",
    3: "Script Explorer",
    4: "Game Designer",
    5: "Roblox Engineer",
    6: "Master Developer"
};

function checkTeacher() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role != "teacher") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "index.html";
    }
}
checkTeacher();


async function loadStudentProfile() {

    try {

        const response = await apiFetch(
            `${API_URL}/api/teacher/students/${studentId}`
        );

        if (!response) return;

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Gagal mengambil profile"
            );
        }

        renderProfile(data.student);

    } catch (error) {

        profileContainer.innerHTML = `
            <div class="alert alert-danger">
                ${error.message}
            </div>
        `;

    }
}


function renderProfile(student) {

    const rankName =
        rankNames[student.rank] || "Unknown Rank";


    const badges = student.badges || [];


    profileContainer.innerHTML = `

        <div class="row justify-content-center">

            <div class="col-lg-8">

                <div class="card profile-card shadow-sm">

                    <div class="card-body p-4">


                        <!-- Profile Header -->

                        <div class="text-center mb-4">

                            <div class="profile-avatar">
                                ${student.username
            .charAt(0)
            .toUpperCase()}
                            </div>

                            <h2 class="fw-bold mt-3 mb-1">
                                ${student.username}
                            </h2>

                            <span class="badge bg-primary">
                                ${rankName}
                            </span>

                        </div>


                        <!-- XP -->

                        <div class="xp-box text-center mb-4">

                            <small class="text-muted">
                                EXPERIENCE POINT
                            </small>

                            <h1 class="fw-bold text-primary">
                                ${student.gem} XP
                            </h1>

                        </div>


                        <!-- XP Controls -->

                       <div class="xp-control mb-4">

    <label class="form-label fw-semibold">
        Jumlah XP
    </label>

    <div class="input-group">

        <input
            type="number"
            id="xpAmount"
            class="form-control"
            placeholder="Contoh: 50"
            min="1"
            step="1"
        >

        <button
            class="btn btn-success"
            onclick="addXP()"
        >
            + Tambah
        </button>

        <button
            class="btn btn-danger"
            onclick="removeXP()"
        >
            − Kurangi
        </button>

    </div>

    <small class="text-muted">
        Masukkan jumlah XP yang ingin ditambah atau dikurangi.
    </small>

</div>
<!-- Rank Control -->

<div class="rank-control mb-4">

    <label class="form-label fw-semibold">
        Rank Siswa
    </label>

    <div class="input-group">

        <select id="rankSelect" class="form-select">

            ${Object.entries(rankNames).map(([rank, name]) => `
                <option
                    value="${rank}"
                    ${Number(student.rank) === Number(rank) ? "selected" : ""}
                >
                    ${name}
                </option>
            `).join("")}

        </select>

        <button
            class="btn btn-warning"
            onclick="updateRank()"
        >
            Ubah Rank
        </button>

    </div>

    <small class="text-muted">
        Rank dapat diubah oleh guru.
    </small>

</div>      

                        <!-- Badge -->

                        <h5 class="fw-bold mb-3">
                            🏆 Badge
                        </h5>


                        ${badges.length === 0
            ?
            `
                                <div class="text-center text-muted py-4">
                                    Belum memiliki badge.
                                </div>
                            `
            :
            `
                                <div class="row g-3">

                                    ${badges.map(badge => `

                                            <div class="col-md-6">

                                                <div class="badge-card">

                                                    <h6 class="fw-bold">
                                                        🏆 ${badge.name}
                                                    </h6>

                                                    <p class="text-muted small mb-0">
                                                        ${badge.description || ""}
                                                    </p>

                                                </div>

                                            </div>

                                        `).join("")
            }

                                </div>
                            `
        }

                    </div>

                </div>

            </div>

        </div>

    `;
}


async function updateXP(amount) {

    const buttons = document.querySelectorAll(".xp-control button");

    buttons.forEach(button => {
        button.disabled = true;
    });

    try {

        const isAdd = amount > 0;

        const endpoint = isAdd
            ? `${API_URL}/api/teacher/users/${studentId}/gem`
            : `${API_URL}/api/teacher/users/${studentId}/gem/remove`;

        const response = await apiFetch(
            endpoint,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    gem: Math.abs(amount)
                })
            }
        );

        if (!response) return;

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Gagal mengubah XP"
            );
        }

        renderProfile(data.student);

        showNotification(data.message, "success");

    } catch (error) {

        showNotification(error.message, "danger");

    } finally {

        buttons.forEach(button => {
            button.disabled = false;
        });
    }
}

function addXP() {

    const amount = getXPAmount();

    if (amount === null) {
        return;
    }

    const confirmAction =
        confirm(`Tambahkan ${amount} XP kepada siswa?`);

    if (!confirmAction) {
        return;
    }

    updateXP(amount);
}

function removeXP() {

    const amount = getXPAmount();

    if (amount === null) {
        return;
    }

    const confirmAction =
        confirm(`Kurangi ${amount} XP dari siswa?`);

    if (!confirmAction) {
        return;
    }

    updateXP(-amount);
}

async function updateRank() {

    const select = document.getElementById("rankSelect");

    const rank = Number(select.value);

    const rankName = rankNames[rank];

    const confirmAction =
        confirm(`Ubah rank siswa menjadi ${rankName}?`);

    if (!confirmAction) {
        return;
    }

    try {

        const response = await apiFetch(
            `${API_URL}/api/teacher/users/${studentId}/rank`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    rank
                })
            }
        );

        if (!response) return;

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Gagal mengubah rank"
            );
        }

        renderProfile(data.student);

        showNotification(
            `Rank berhasil diubah menjadi ${rankName}`,
            "success"
        );

    } catch (error) {

        showNotification(
            error.message,
            "danger"
        );
    }
}

function showNotification(message, type = "success") {
    const notification =
        document.getElementById("notification");

    notification.className =
        `alert alert-${type} shadow position-fixed top-0 end-0 m-3`;

    notification.textContent = message;

    setTimeout(() => {
        notification.classList.add("d-none");
    }, 3000);
}

function getXPAmount() {

    const input =
        document.getElementById("xpAmount");

    const amount = Number(input.value);

    if (!Number.isInteger(amount) || amount <= 0) {

        showNotification(
            "Jumlah XP harus berupa angka bulat lebih dari 0.",
            "warning"
        );

        return null;
    }

    return amount;
}

document
    .getElementById("logoutBtn")
    .addEventListener("click", () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "index.html";

    });


if (!studentId) {

    profileContainer.innerHTML = `
        <div class="alert alert-warning">
            ID siswa tidak ditemukan.
        </div>
    `;

} else {

    loadStudentProfile();

}