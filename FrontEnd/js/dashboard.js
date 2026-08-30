

if (!token) {
    window.location.href = "index.html";
}

const studentList = document.getElementById("studentList");
const searchInput = document.getElementById("searchStudent");
const currentUser = JSON.parse(localStorage.getItem("user"));

let students = [];

if (currentUser) {
    document.getElementById("teacherName").textContent =
        currentUser.username;
}

async function loadStudents() {

    try {

        const response = await apiFetch(
            `${API_URL}/api/teacher/students`
        );

        if (!response) return;

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Gagal mengambil siswa"
            );
        }

        students = data.students;

        renderStudents(students);

    } catch (error) {

        studentList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    ${error.message}
                </div>
            </div>
        `;

    }
}


function renderStudents(data) {

    if (data.length === 0) {

        studentList.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">
                    Tidak ada siswa ditemukan.
                </p>
            </div>
        `;

        return;
    }


    studentList.innerHTML = data.map(student => `

        <div class="col-md-6 col-lg-4">

            <div class="card student-card h-100 shadow-sm">

                <div class="card-body">

                    <div class="d-flex align-items-center mb-3">

                        <div class="student-avatar">
                            ${student.username.charAt(0).toUpperCase()}
                        </div>

                        <div class="ms-3">

                            <h5 class="mb-1 fw-bold">
                                ${student.username}
                            </h5>

                            <small class="text-muted">
                                Siswa
                            </small>

                        </div>

                    </div>


                    <div class="mb-3">

                        <small class="text-muted">
                            XP
                        </small>

                        <h4 class="fw-bold mb-0">
                            ${student.gem}
                        </h4>

                    </div>


                    <button
                        class="btn btn-primary w-100"
                        onclick="viewStudent(${student.id})"
                    >
                        Lihat Profile
                    </button>

                </div>

            </div>

        </div>

    `).join("");
}


function viewStudent(id) {

    window.location.href =
        `student.html?id=${id}`;
}


searchInput.addEventListener("input", () => {

    const keyword =
        searchInput.value.toLowerCase();

    const filtered =
        students.filter(student =>
            student.username
                .toLowerCase()
                .includes(keyword)
        );

    renderStudents(filtered);
});


document
    .getElementById("logoutBtn")
    .addEventListener("click", () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "index.html";

    });


loadStudents();

function checkTeacher() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "teacher") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "index.html";
    }
}

checkTeacher();