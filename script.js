/* ================================================================
   ATTENDANCE MANAGEMENT SYSTEM - script.js
   Organized Sections:
   1. Constants & Credentials
   2. LocalStorage Layer (future-proof for API/DB migration)
   3. Utilities
   4. Authentication
   5. Students
   6. Subjects
   7. Attendance
   8. Student Records
   9. Dashboard
   10. UI (navigation, modals, toasts, rendering)
   11. Init / Event Bindings
   ================================================================ */

/* ================================================================
   1. CONSTANTS & CREDENTIALS
   ================================================================ */
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "Admin@corp236"
};

const DEFAULT_SUBJECTS = [
  { id: 1, name: "Analog Electronics", code: "AEC" },
  { id: 2, name: "Digital Electronics", code: "DE" },
  { id: 3, name: "Effective Technical Communication", code: "ETC" },
  { id: 4, name: "Mathematics-III (Calculus)", code: "MATH-III" },
  { id: 5, name: "Data Structure and Algorithm", code: "DSA" },
  { id: 6, name: "IT Workshop", code: "IT" },
  { id: 7, name: "Analog Electronics Lab", code: "AEC Lab" },
  { id: 8, name: "Digital Electronics Lab", code: "DE Lab" },
  { id: 9, name: "Data Structure and Algorithm Lab", code: "DSA Lab" },
  { id: 10, name: "Capstone Project", code: "Project Lab" },
  { id: 11, name: "Introduction To AI", code: "AI" },
  { id: 12, name: "Introduction to AI Lab", code: "AI Lab" }
];

/* ================================================================
   2. LOCALSTORAGE LAYER
   (Centralized so it can be swapped for API calls later)
   ================================================================ */
const STORAGE_KEYS = {
  students: "students",
  subjects: "subjects",
  attendance: "attendance",
  isLoggedIn: "isLoggedIn"
};

function initStorage() {
  if (localStorage.getItem(STORAGE_KEYS.students) === null) {
    localStorage.setItem(STORAGE_KEYS.students, JSON.stringify([]));
  }
  if (localStorage.getItem(STORAGE_KEYS.subjects) === null) {
    localStorage.setItem(STORAGE_KEYS.subjects, JSON.stringify(DEFAULT_SUBJECTS));
  }
  if (localStorage.getItem(STORAGE_KEYS.attendance) === null) {
    localStorage.setItem(STORAGE_KEYS.attendance, JSON.stringify([]));
  }
  if (localStorage.getItem(STORAGE_KEYS.isLoggedIn) === null) {
    localStorage.setItem(STORAGE_KEYS.isLoggedIn, "false");
  }
}

function getStudents() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.students)) || [];
}
function saveStudents(students) {
  localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
}

function getSubjects() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.subjects)) || [];
}
function saveSubjects(subjects) {
  localStorage.setItem(STORAGE_KEYS.subjects, JSON.stringify(subjects));
}

function getAttendance() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.attendance)) || [];
}
function saveAttendance(records) {
  localStorage.setItem(STORAGE_KEYS.attendance, JSON.stringify(records));
}

/* ================================================================
   3. UTILITIES
   ================================================================ */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function findStudentByRoll(roll) {
  if (roll === undefined || roll === null) return null;
  const target = String(roll).trim().toLowerCase();
  return getStudents().find(s => String(s.rollNumber).trim().toLowerCase() === target) || null;
}

function findStudentById(id) {
  return getStudents().find(s => s.id === id) || null;
}

function findSubjectById(id) {
  const numId = Number(id);
  return getSubjects().find(s => s.id === numId) || null;
}

function todayDMY() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// Converts yyyy-mm-dd (from <input type="date">) to dd-mm-yyyy
function isoToDMY(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

function percentage(part, total) {
  if (!total || total <= 0) return "0.00";
  return ((part / total) * 100).toFixed(2);
}

function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ================================================================
   4. AUTHENTICATION
   ================================================================ */
function isLoggedIn() {
  return localStorage.getItem(STORAGE_KEYS.isLoggedIn) === "true";
}

function login(username, password) {
  if (!username || !password) {
    return { ok: false, message: "Username and password are required." };
  }
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    localStorage.setItem(STORAGE_KEYS.isLoggedIn, "true");
    return { ok: true };
  }
  return { ok: false, message: "Invalid login credentials" };
}

function logout() {
  localStorage.setItem(STORAGE_KEYS.isLoggedIn, "false");
  showLoginPage();
}

function showLoginPage() {
  document.getElementById("loginPage").classList.remove("hidden");
  document.getElementById("app").classList.add("hidden");
  document.getElementById("loginUsername").value = "";
  document.getElementById("loginPassword").value = "";
  document.getElementById("loginError").textContent = "";
}

function showApp() {
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  refreshAllPages();
}

/* ================================================================
   5. STUDENTS
   ================================================================ */
function addStudent(rollNumber, name, branch) {
  rollNumber = (rollNumber || "").trim();
  name = (name || "").trim();
  branch = (branch || "").trim();

  if (!rollNumber || !name || !branch) {
    return { ok: false, message: "All fields (Roll Number, Name, Branch) are required." };
  }
  if (findStudentByRoll(rollNumber)) {
    return { ok: false, message: "Roll number already exists. Please use a unique roll number." };
  }

  const students = getStudents();
  students.push({
    id: generateId(),
    rollNumber,
    name,
    branch
  });
  saveStudents(students);
  return { ok: true };
}

function updateStudent(id, name, branch) {
  name = (name || "").trim();
  branch = (branch || "").trim();
  if (!name || !branch) {
    return { ok: false, message: "Name and Branch are required." };
  }
  const students = getStudents();
  const student = students.find(s => s.id === id);
  if (!student) return { ok: false, message: "Student not found" };
  student.name = name;
  student.branch = branch;
  saveStudents(students);
  return { ok: true };
}

function deleteStudent(id) {
  let students = getStudents();
  students = students.filter(s => s.id !== id);
  saveStudents(students);

  let attendance = getAttendance();
  attendance = attendance.filter(a => a.studentId !== id);
  saveAttendance(attendance);
}

function filterStudents({ branch = "all", roll = "", name = "" } = {}) {
  let students = getStudents();
  if (branch && branch !== "all") {
    students = students.filter(s => s.branch.toLowerCase() === branch.toLowerCase());
  }
  if (roll) {
    students = students.filter(s => String(s.rollNumber).toLowerCase().includes(roll.toLowerCase()));
  }
  if (name) {
    students = students.filter(s => s.name.toLowerCase().includes(name.toLowerCase()));
  }
  return students;
}

/* ================================================================
   6. SUBJECTS
   ================================================================ */
function populateSubjectSelects() {
  const subjects = getSubjects();

  const markSelect = document.getElementById("markSubjectSelect");
  markSelect.innerHTML = `<option value="">Select Subject</option>` +
    subjects.map(s => `<option value="${s.id}">${escapeHtml(s.name)} (${escapeHtml(s.code)})</option>`).join("");

  const recordsSelect = document.getElementById("recordsSubjectSelect");
  recordsSelect.innerHTML = `<option value="all">All Subjects</option>` +
    subjects.map(s => `<option value="${s.id}">${escapeHtml(s.name)} (${escapeHtml(s.code)})</option>`).join("");

  const historySelect = document.getElementById("historySubjectFilter");
  historySelect.innerHTML = `<option value="all">All Subjects</option>` +
    subjects.map(s => `<option value="${s.id}">${escapeHtml(s.name)} (${escapeHtml(s.code)})</option>`).join("");
}

/* ================================================================
   7. ATTENDANCE
   ================================================================ */
function findAttendanceRecord(date, studentId, subjectId) {
  return getAttendance().find(a =>
    a.date === date && a.studentId === studentId && a.subjectId === Number(subjectId)
  ) || null;
}

// Saves/updates attendance for a subject on today's date for a list of {studentId, status}
function saveAttendanceForSubject(subjectId, entries) {
  const date = todayDMY();
  const attendance = getAttendance();
  let updatedCount = 0;
  let createdCount = 0;

  entries.forEach(({ studentId, status }) => {
    const existingIndex = attendance.findIndex(a =>
      a.date === date && a.studentId === studentId && a.subjectId === Number(subjectId)
    );
    if (existingIndex !== -1) {
      attendance[existingIndex].status = status;
      updatedCount++;
    } else {
      attendance.push({
        id: generateId(),
        date,
        studentId,
        subjectId: Number(subjectId),
        status
      });
      createdCount++;
    }
  });

  saveAttendance(attendance);
  return { updatedCount, createdCount };
}

// Aggregate stats per subject: total, present, absent, percentage
function getSubjectStats(subjectId, dateFilter) {
  let records = getAttendance().filter(a => a.subjectId === Number(subjectId));
  if (dateFilter) records = records.filter(a => a.date === dateFilter);
  const total = records.length;
  const present = records.filter(a => a.status === "P").length;
  const absent = total - present;
  return { total, present, absent, pct: percentage(present, total) };
}

function getAllSubjectsStats(dateFilter) {
  return getSubjects().map(subject => {
    const stats = getSubjectStats(subject.id, dateFilter);
    return { subject, ...stats };
  });
}

/* ================================================================
   8. STUDENT RECORDS
   ================================================================ */
function getStudentSubjectStats(studentId) {
  const attendance = getAttendance().filter(a => a.studentId === studentId);
  return getSubjects().map(subject => {
    const subjectRecords = attendance.filter(a => a.subjectId === subject.id);
    const present = subjectRecords.filter(a => a.status === "P").length;
    const absent = subjectRecords.filter(a => a.status === "A").length;
    const total = present + absent;
    return {
      subject,
      present,
      absent,
      total,
      pct: percentage(present, total)
    };
  });
}

function getStudentOverallStats(studentId) {
  const stats = getStudentSubjectStats(studentId);
  const totalPresent = stats.reduce((sum, s) => sum + s.present, 0);
  const totalAbsent = stats.reduce((sum, s) => sum + s.absent, 0);
  const totalClasses = totalPresent + totalAbsent;
  return {
    totalPresent,
    totalAbsent,
    totalClasses,
    overallPct: percentage(totalPresent, totalClasses)
  };
}

function getStudentHistory(studentId, { subjectId = "all", date = "" } = {}) {
  let records = getAttendance().filter(a => a.studentId === studentId);
  if (subjectId !== "all") {
    records = records.filter(a => a.subjectId === Number(subjectId));
  }
  if (date) {
    records = records.filter(a => a.date === date);
  }
  return records.sort((a, b) => parseDMY(b.date) - parseDMY(a.date));
}

function parseDMY(dmy) {
  const [d, m, y] = dmy.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

/* ================================================================
   9. DASHBOARD
   ================================================================ */
function renderDashboard() {
  const students = getStudents();
  const subjects = getSubjects();
  const attendance = getAttendance();

  document.getElementById("statTotalStudents").textContent = students.length;
  document.getElementById("statTotalSubjects").textContent = subjects.length;

  const today = todayDMY();
  const todayRecords = attendance.filter(a => a.date === today);
  const todayPresent = todayRecords.filter(a => a.status === "P").length;
  document.getElementById("statTodayAttendance").textContent = percentage(todayPresent, todayRecords.length) + "%";

  const totalPresent = attendance.filter(a => a.status === "P").length;
  document.getElementById("statOverallAttendance").textContent = percentage(totalPresent, attendance.length) + "%";
}

/* ================================================================
   10. UI — NAVIGATION, TOASTS, MODALS, RENDERING
   ================================================================ */

/* ---------- Toasts ---------- */
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ---------- Confirm Modal ---------- */
let confirmCallback = null;
function openConfirmModal(title, message, onConfirm) {
  document.getElementById("confirmTitle").textContent = title;
  document.getElementById("confirmMessage").textContent = message;
  confirmCallback = onConfirm;
  document.getElementById("confirmModal").classList.remove("hidden");
}
function closeConfirmModal() {
  document.getElementById("confirmModal").classList.add("hidden");
  confirmCallback = null;
}

/* ---------- Edit Student Modal ---------- */
function openEditModal(student) {
  document.getElementById("editStudentId").value = student.id;
  document.getElementById("editRoll").value = student.rollNumber;
  document.getElementById("editName").value = student.name;
  document.getElementById("editBranch").value = student.branch;
  document.getElementById("editModal").classList.remove("hidden");
}
function closeEditModal() {
  document.getElementById("editModal").classList.add("hidden");
}

/* ---------- Navigation ---------- */
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(`page-${pageId}`).classList.add("active");

  document.querySelectorAll(".nav-link").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.querySelector(`.nav-link[data-page="${pageId}"]`);
  if (activeBtn) activeBtn.classList.add("active");

  const titles = {
    "dashboard": "Dashboard",
    "students": "Students",
    "mark-attendance": "Mark Attendance",
    "attendance-records": "Attendance Records",
    "student-records": "Student Records"
  };
  document.getElementById("pageTitle").textContent = titles[pageId] || "Dashboard";

  // Refresh relevant data
  if (pageId === "dashboard") renderDashboard();
  if (pageId === "students") renderStudentsTable();
  if (pageId === "attendance-records") renderAttendanceRecords();

  closeSidebarMobile();
}

function refreshAllPages() {
  populateSubjectSelects();
  renderDashboard();
  renderStudentsTable();
  renderAttendanceRecords();
}

/* ---------- Sidebar Mobile ---------- */
function openSidebarMobile() {
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("sidebarOverlay").classList.add("show");
}
function closeSidebarMobile() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.remove("show");
}

/* ---------- Students Table Rendering ---------- */
function renderStudentsTable() {
  const branch = document.getElementById("branchFilter").value;
  const roll = document.getElementById("searchRoll").value.trim();
  const name = document.getElementById("searchName").value.trim();

  const students = filterStudents({ branch, roll, name });
  const tbody = document.getElementById("studentsTableBody");

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state">No students found.</td></tr>`;
    return;
  }

  tbody.innerHTML = students.map(s => `
    <tr>
      <td>${escapeHtml(s.rollNumber)}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.branch)}</td>
      <td class="actions-cell">
        <button class="btn btn-secondary btn-sm" onclick="handleViewRecordFromStudents('${s.id}')">View Record</button>
        <button class="btn btn-secondary btn-sm" onclick="handleEditStudent('${s.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="handleDeleteStudent('${s.id}')">Delete</button>
      </td>
    </tr>
  `).join("");
}

function handleViewRecordFromStudents(studentId) {
  const student = findStudentById(studentId);
  if (!student) return;
  showPage("student-records");
  document.getElementById("recordRollSearch").value = student.rollNumber;
  performStudentRecordSearch();
}

function handleEditStudent(studentId) {
  const student = findStudentById(studentId);
  if (!student) return;
  openEditModal(student);
}

function handleDeleteStudent(studentId) {
  const student = findStudentById(studentId);
  if (!student) return;
  openConfirmModal(
    "Delete Student",
    `Are you sure you want to delete ${student.name} (Roll: ${student.rollNumber})? This will also remove all their attendance records.`,
    () => {
      deleteStudent(studentId);
      renderStudentsTable();
      renderDashboard();
      renderAttendanceRecords();
      showToast("Student deleted successfully", "success");
    }
  );
}

/* ---------- Mark Attendance Rendering ---------- */
function renderMarkAttendance() {
  const subjectId = document.getElementById("markSubjectSelect").value;
  const container = document.getElementById("markAttendanceContainer");
  document.getElementById("markDateDisplay").textContent = todayDMY();

  if (!subjectId) {
    container.innerHTML = `<p class="empty-state">Please select a subject to mark attendance.</p>`;
    return;
  }

  const students = getStudents();
  if (students.length === 0) {
    container.innerHTML = `<p class="empty-state">No students available. Please add students first.</p>`;
    return;
  }

  const date = todayDMY();
  let alreadyMarkedCount = 0;

  const rows = students.map(s => {
    const existing = findAttendanceRecord(date, s.id, subjectId);
    if (existing) alreadyMarkedCount++;
    const presentChecked = existing && existing.status === "P" ? "checked" : "";
    const absentChecked = existing && existing.status === "A" ? "checked" : "";
    return `
      <tr>
        <td>${escapeHtml(s.rollNumber)}</td>
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.branch)}</td>
        <td>
          <div class="radio-group">
            <label><input type="radio" name="att_${s.id}" value="P" ${presentChecked}> Present</label>
            <label><input type="radio" name="att_${s.id}" value="A" ${absentChecked}> Absent</label>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  container.innerHTML = `
    <div class="mark-toolbar">
      <button class="btn btn-secondary" id="markAllPresentBtn">Mark All Present</button>
      <button class="btn btn-secondary" id="markAllAbsentBtn">Mark All Absent</button>
      <button class="btn btn-primary" id="saveAttendanceBtn">Save Attendance</button>
    </div>
    <div class="table-wrapper">
      <table>
        <thead><tr><th>Roll Number</th><th>Name</th><th>Branch</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;

  document.getElementById("markAllPresentBtn").addEventListener("click", () => {
    students.forEach(s => {
      const radio = document.querySelector(`input[name="att_${s.id}"][value="P"]`);
      if (radio) radio.checked = true;
    });
  });
  document.getElementById("markAllAbsentBtn").addEventListener("click", () => {
    students.forEach(s => {
      const radio = document.querySelector(`input[name="att_${s.id}"][value="A"]`);
      if (radio) radio.checked = true;
    });
  });
  document.getElementById("saveAttendanceBtn").addEventListener("click", () => {
    handleSaveAttendance(subjectId, students);
  });

  if (alreadyMarkedCount > 0 && alreadyMarkedCount === students.length) {
    showToast("Attendance already marked for this subject today. You can update it below.", "info");
  }
}

function handleSaveAttendance(subjectId, students) {
  const entries = [];
  for (const s of students) {
    const selected = document.querySelector(`input[name="att_${s.id}"]:checked`);
    if (!selected) {
      showToast(`Please mark Present/Absent for ${s.name} (Roll: ${s.rollNumber}).`, "error");
      return;
    }
    entries.push({ studentId: s.id, status: selected.value });
  }

  const { updatedCount, createdCount } = saveAttendanceForSubject(subjectId, entries);

  if (updatedCount > 0 && createdCount === 0) {
    showToast("Attendance updated successfully", "success");
  } else {
    showToast("Attendance saved successfully", "success");
  }

  renderDashboard();
  renderAttendanceRecords();
}

/* ---------- Attendance Records Rendering ---------- */
let lastExportData = { headers: [], rows: [] };

function renderAttendanceRecords() {
  const subjectId = document.getElementById("recordsSubjectSelect").value;
  const dateFilterIso = document.getElementById("recordsDateFilter").value;
  const dateFilter = dateFilterIso ? isoToDMY(dateFilterIso) : "";
  const rollFilter = document.getElementById("recordsRollFilter").value.trim().toLowerCase();
  const nameFilter = document.getElementById("recordsNameFilter").value.trim().toLowerCase();
  const branchFilter = document.getElementById("recordsBranchFilter").value;
  const statusFilter = document.getElementById("recordsStatusFilter").value;

  const thead = document.getElementById("recordsTableHead");
  const tbody = document.getElementById("recordsTableBody");

  if (!subjectId || subjectId === "all") {
    // Aggregate view across all subjects
    thead.innerHTML = `<tr><th>Subject</th><th>Total Classes</th><th>Present</th><th>Absent</th><th>Attendance %</th></tr>`;
    const stats = getAllSubjectsStats(dateFilter);

    if (stats.every(s => s.total === 0)) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No attendance records found.</td></tr>`;
    } else {
      tbody.innerHTML = stats.map(s => `
        <tr>
          <td>${escapeHtml(s.subject.name)} (${escapeHtml(s.subject.code)})</td>
          <td>${s.total}</td>
          <td>${s.present}</td>
          <td>${s.absent}</td>
          <td>${s.pct}%</td>
        </tr>
      `).join("");
    }

    lastExportData = {
      headers: ["Subject", "Total Classes", "Present", "Absent", "Attendance %"],
      rows: stats.map(s => [`${s.subject.name} (${s.subject.code})`, s.total, s.present, s.absent, s.pct + "%"])
    };
    return;
  }

  // Detailed view for a specific subject
  thead.innerHTML = `<tr><th>Date</th><th>Roll Number</th><th>Name</th><th>Branch</th><th>Status</th></tr>`;

  let records = getAttendance().filter(a => a.subjectId === Number(subjectId));

  // Join with student data + apply filters
  let rows = records.map(r => {
    const student = findStudentById(r.studentId);
    return {
      date: r.date,
      roll: student ? student.rollNumber : "N/A",
      name: student ? student.name : "Unknown (deleted)",
      branch: student ? student.branch : "-",
      status: r.status
    };
  });

  if (dateFilter) rows = rows.filter(r => r.date === dateFilter);
  if (rollFilter) rows = rows.filter(r => String(r.roll).toLowerCase().includes(rollFilter));
  if (nameFilter) rows = rows.filter(r => r.name.toLowerCase().includes(nameFilter));
  if (branchFilter !== "all") rows = rows.filter(r => r.branch.toLowerCase() === branchFilter.toLowerCase());
  if (statusFilter !== "all") rows = rows.filter(r => r.status === statusFilter);

  rows.sort((a, b) => parseDMY(b.date) - parseDMY(a.date));

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No attendance records found.</td></tr>`;
  } else {
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${escapeHtml(r.date)}</td>
        <td>${escapeHtml(r.roll)}</td>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.branch)}</td>
        <td><span class="badge ${r.status === 'P' ? 'badge-present' : 'badge-absent'}">${r.status === 'P' ? 'Present' : 'Absent'}</span></td>
      </tr>
    `).join("");
  }

  lastExportData = {
    headers: ["Date", "Roll Number", "Name", "Branch", "Status"],
    rows: rows.map(r => [r.date, r.roll, r.name, r.branch, r.status === "P" ? "Present" : "Absent"])
  };
}

function exportRecordsToCSV() {
  if (!lastExportData.rows || lastExportData.rows.length === 0) {
    showToast("No data available to export.", "error");
    return;
  }
  const csvLines = [lastExportData.headers.join(",")];
  lastExportData.rows.forEach(row => {
    csvLines.push(row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","));
  });
  const csvContent = csvLines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `attendance_records_${todayDMY()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast("CSV exported successfully", "success");
}

/* ---------- Student Records Rendering ---------- */
let currentRecordStudentId = null;

function performStudentRecordSearch() {
  const roll = document.getElementById("recordRollSearch").value.trim();
  if (!roll) {
    showToast("Please enter a roll number to search.", "error");
    return;
  }
  const student = findStudentByRoll(roll);
  if (!student) {
    showToast("Student not found", "error");
    document.getElementById("studentRecordResult").classList.add("hidden");
    document.getElementById("printReportBtn").disabled = true;
    currentRecordStudentId = null;
    return;
  }

  currentRecordStudentId = student.id;
  document.getElementById("studentRecordResult").classList.remove("hidden");
  document.getElementById("printReportBtn").disabled = false;

  document.getElementById("recRoll").textContent = student.rollNumber;
  document.getElementById("recName").textContent = student.name;
  document.getElementById("recBranch").textContent = student.branch;

  renderStudentSubjectStats(student.id);
  renderStudentOverallStats(student.id);
  renderStudentHistory(student.id);
}

function renderStudentSubjectStats(studentId) {
  const stats = getStudentSubjectStats(studentId);
  const tbody = document.getElementById("recSubjectTableBody");
  tbody.innerHTML = stats.map(s => `
    <tr>
      <td>${escapeHtml(s.subject.name)} (${escapeHtml(s.subject.code)})</td>
      <td>${s.present}</td>
      <td>${s.absent}</td>
      <td>${s.total}</td>
      <td>${s.pct}%</td>
    </tr>
  `).join("");
}

function renderStudentOverallStats(studentId) {
  const overall = getStudentOverallStats(studentId);
  document.getElementById("recTotalPresent").textContent = overall.totalPresent;
  document.getElementById("recTotalAbsent").textContent = overall.totalAbsent;
  document.getElementById("recTotalClasses").textContent = overall.totalClasses;
  document.getElementById("recOverallPercentage").textContent = overall.overallPct + "%";
}

function renderStudentHistory(studentId) {
  const subjectId = document.getElementById("historySubjectFilter").value;
  const dateIso = document.getElementById("historyDateFilter").value;
  const date = dateIso ? isoToDMY(dateIso) : "";

  const history = getStudentHistory(studentId, { subjectId, date });
  const tbody = document.getElementById("historyTableBody");

  if (history.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="empty-state">No attendance history found.</td></tr>`;
    return;
  }

  tbody.innerHTML = history.map(r => {
    const subject = findSubjectById(r.subjectId);
    return `
      <tr>
        <td>${escapeHtml(r.date)}</td>
        <td>${subject ? escapeHtml(subject.name) + " (" + escapeHtml(subject.code) + ")" : "Unknown"}</td>
        <td><span class="badge ${r.status === 'P' ? 'badge-present' : 'badge-absent'}">${r.status === 'P' ? 'Present' : 'Absent'}</span></td>
      </tr>
    `;
  }).join("");
}

/* ================================================================
   11. INIT / EVENT BINDINGS
   ================================================================ */
document.addEventListener("DOMContentLoaded", () => {
  initStorage();

  // Show correct page (login vs app) based on stored login state
  if (isLoggedIn()) {
    showApp();
  } else {
    showLoginPage();
  }

  /* ---- Login ---- */
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;
    const result = login(username, password);
    if (result.ok) {
      showApp();
      showToast("Login successful. Welcome Admin!", "success");
    } else {
      document.getElementById("loginError").textContent = result.message;
      showToast(result.message, "error");
    }
  });

  /* ---- Logout ---- */
  document.getElementById("logoutBtn").addEventListener("click", () => {
    logout();
    showToast("Logged out successfully", "info");
  });

  /* ---- Sidebar Navigation ---- */
  document.querySelectorAll(".nav-link").forEach(btn => {
    btn.addEventListener("click", () => showPage(btn.dataset.page));
  });

  /* ---- Mobile Sidebar Toggle ---- */
  document.getElementById("menuToggle").addEventListener("click", openSidebarMobile);
  document.getElementById("sidebarClose").addEventListener("click", closeSidebarMobile);
  document.getElementById("sidebarOverlay").addEventListener("click", closeSidebarMobile);

  /* ---- Add Student ---- */
  document.getElementById("addStudentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const roll = document.getElementById("newRoll").value;
    const name = document.getElementById("newName").value;
    const branch = document.getElementById("newBranch").value;
    const result = addStudent(roll, name, branch);
    if (result.ok) {
      document.getElementById("addStudentForm").reset();
      renderStudentsTable();
      renderDashboard();
      showToast("Student added successfully", "success");
    } else {
      showToast(result.message, "error");
    }
  });

  /* ---- Students Filters/Search ---- */
  document.getElementById("branchFilter").addEventListener("change", renderStudentsTable);
  document.getElementById("searchRoll").addEventListener("input", renderStudentsTable);
  document.getElementById("searchName").addEventListener("input", renderStudentsTable);

  /* ---- Edit Student Modal ---- */
  document.getElementById("editStudentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("editStudentId").value;
    const name = document.getElementById("editName").value;
    const branch = document.getElementById("editBranch").value;
    const result = updateStudent(id, name, branch);
    if (result.ok) {
      closeEditModal();
      renderStudentsTable();
      showToast("Student updated successfully", "success");
    } else {
      showToast(result.message, "error");
    }
  });
  document.getElementById("cancelEditBtn").addEventListener("click", closeEditModal);

  /* ---- Confirm Modal ---- */
  document.getElementById("confirmOkBtn").addEventListener("click", () => {
    if (typeof confirmCallback === "function") confirmCallback();
    closeConfirmModal();
  });
  document.getElementById("confirmCancelBtn").addEventListener("click", closeConfirmModal);

  /* ---- Mark Attendance ---- */
  document.getElementById("markSubjectSelect").addEventListener("change", renderMarkAttendance);

  /* ---- Attendance Records Filters ---- */
  ["recordsSubjectSelect", "recordsDateFilter", "recordsRollFilter",
   "recordsNameFilter", "recordsBranchFilter", "recordsStatusFilter"]
    .forEach(id => {
      const el = document.getElementById(id);
      el.addEventListener("input", renderAttendanceRecords);
      el.addEventListener("change", renderAttendanceRecords);
    });

  document.getElementById("clearRecordsFilters").addEventListener("click", () => {
    document.getElementById("recordsSubjectSelect").value = "all";
    document.getElementById("recordsDateFilter").value = "";
    document.getElementById("recordsRollFilter").value = "";
    document.getElementById("recordsNameFilter").value = "";
    document.getElementById("recordsBranchFilter").value = "all";
    document.getElementById("recordsStatusFilter").value = "all";
    renderAttendanceRecords();
  });

  document.getElementById("exportCsvBtn").addEventListener("click", exportRecordsToCSV);

  /* ---- Student Records ---- */
  document.getElementById("searchStudentRecordBtn").addEventListener("click", performStudentRecordSearch);
  document.getElementById("recordRollSearch").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      performStudentRecordSearch();
    }
  });
  document.getElementById("historySubjectFilter").addEventListener("change", () => {
    if (currentRecordStudentId) renderStudentHistory(currentRecordStudentId);
  });
  document.getElementById("historyDateFilter").addEventListener("change", () => {
    if (currentRecordStudentId) renderStudentHistory(currentRecordStudentId);
  });
  document.getElementById("printReportBtn").addEventListener("click", () => {
    if (currentRecordStudentId) window.print();
  });
});
