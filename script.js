const STORAGE_KEY = 'mahasiswahub_students';

function buildDefaultData() {
  const today = new Date();
  return [
    {
      id: crypto.randomUUID(),
      nama: 'Andi Pratama',
      nim: '221001',
      prodi: 'Informatika',
      semester: 4,
      createdAt: today.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      nama: 'Salsabila Putri',
      nim: '221015',
      prodi: 'Sistem Informasi',
      semester: 6,
      createdAt: today.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      nama: 'Rizki Maulana',
      nim: '221030',
      prodi: 'Teknik Komputer',
      semester: 5,
      createdAt: today.toISOString(),
    },
  ];
}

function getStudents() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildDefaultData()));
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  }
  try {
    return JSON.parse(saved);
  } catch (error) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildDefaultData()));
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  }
}

function saveStudents(students) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function setMessage(element, message, type = 'success') {
  if (!element) return;
  element.textContent = message;
  element.className = `form-message ${type}`;
}

function setTableMessage(element, message, type = 'success') {
  if (!element) return;
  element.textContent = message;
  element.className = `table-message ${type}`;
}

function renderDashboard() {
  const students = getStudents();
  const totalMahasiswa = students.length;
  const programs = [...new Set(students.map((student) => student.prodi.trim()))].filter(Boolean).length;
  const avgSemester = students.length
    ? (students.reduce((sum, student) => sum + Number(student.semester || 0), 0) / students.length).toFixed(1)
    : '0';

  document.getElementById('totalMahasiswa').textContent = totalMahasiswa;
  document.getElementById('totalProdi').textContent = programs;
  document.getElementById('avgSemester').textContent = avgSemester;
  document.getElementById('totalAktif').textContent = totalMahasiswa;

  const recentData = [...students].slice(-4).reverse();
  const tableBody = document.getElementById('recentTableBody');
  if (!tableBody) return;

  if (!recentData.length) {
    tableBody.innerHTML = '<tr><td colspan="4" class="empty-state">Belum ada data mahasiswa.</td></tr>';
    return;
  }

  tableBody.innerHTML = recentData
    .map(
      (student) => `
        <tr>
          <td>${student.nama}</td>
          <td>${student.nim}</td>
          <td>${student.prodi}</td>
          <td>Semester ${student.semester}</td>
        </tr>
      `
    )
    .join('');
}

function renderStudentTable() {
  const students = getStudents();
  const searchInput = document.getElementById('searchInput');
  const tableBody = document.getElementById('studentTableBody');
  const tableMessage = document.getElementById('tableMessage');

  if (!tableBody) return;

  const keyword = (searchInput?.value || '').trim().toLowerCase();
  const filtered = students.filter((student) => {
    const haystack = `${student.nama} ${student.nim} ${student.prodi}`.toLowerCase();
    return haystack.includes(keyword);
  });

  if (!filtered.length) {
    tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">Data yang Anda cari tidak ditemukan.</td></tr>';
    if (tableMessage) setTableMessage(tableMessage, 'Tidak ada hasil pencarian.', 'error');
    return;
  }

  tableBody.innerHTML = filtered
    .map(
      (student, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${student.nama}</td>
          <td>${student.nim}</td>
          <td>${student.prodi}</td>
          <td>${student.semester}</td>
          <td>
            <div class="action-group">
              <button class="icon-btn edit-btn" data-action="edit" data-id="${student.id}">Edit</button>
              <button class="icon-btn delete-btn" data-action="delete" data-id="${student.id}">Hapus</button>
            </div>
          </td>
        </tr>
      `
    )
    .join('');

  if (tableMessage) {
    const statusText = keyword ? `Menampilkan ${filtered.length} data dari pencarian.` : `Total ${filtered.length} mahasiswa.`;
    setTableMessage(tableMessage, statusText, 'success');
  }
}

function bindDataPageEvents() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', renderStudentTable);
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === 'edit') {
      window.location.href = `form.html?edit=${id}`;
      return;
    }

    if (action === 'delete') {
      const students = getStudents();
      const updated = students.filter((student) => student.id !== id);
      saveStudents(updated);
      renderStudentTable();
    }
  });

  renderStudentTable();
}

function initFormPage() {
  const form = document.getElementById('studentForm');
  const resetBtn = document.getElementById('resetBtn');
  const formTitle = document.getElementById('formTitle');
  const formMessage = document.getElementById('formMessage');
  const params = new URLSearchParams(window.location.search);
  const editId = params.get('edit');

  if (!form) return;

  const students = getStudents();
  const target = students.find((student) => student.id === editId);

  if (target) {
    formTitle.textContent = 'Edit Mahasiswa';
    document.getElementById('nama').value = target.nama;
    document.getElementById('nim').value = target.nim;
    document.getElementById('prodi').value = target.prodi;
    document.getElementById('semester').value = target.semester;
  }

  resetBtn?.addEventListener('click', () => {
    form.reset();
    if (formMessage) setMessage(formMessage, 'Form telah direset.', 'success');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const nama = document.getElementById('nama').value.trim();
    const nim = document.getElementById('nim').value.trim();
    const prodi = document.getElementById('prodi').value.trim();
    const semester = Number(document.getElementById('semester').value);

    if (!nama) {
      setMessage(formMessage, 'Nama tidak boleh kosong.', 'error');
      return;
    }

    if (!nim) {
      setMessage(formMessage, 'NIM tidak boleh kosong.', 'error');
      return;
    }

    if (!prodi) {
      setMessage(formMessage, 'Program studi tidak boleh kosong.', 'error');
      return;
    }

    if (!semester || semester < 1 || semester > 14) {
      setMessage(formMessage, 'Semester harus diisi dan berada di rentang 1-14.', 'error');
      return;
    }

    if (!/^\d{5,15}$/.test(nim)) {
      setMessage(formMessage, 'Format NIM tidak valid.', 'error');
      return;
    }

    const allStudents = getStudents();
    const duplicate = allStudents.find((student) => student.nim === nim && student.id !== editId);
    if (duplicate) {
      setMessage(formMessage, 'NIM sudah terdaftar, silakan gunakan NIM lain.', 'error');
      return;
    }

    if (editId) {
      const updated = allStudents.map((student) =>
        student.id === editId ? { ...student, nama, nim, prodi, semester } : student
      );
      saveStudents(updated);
      setMessage(formMessage, 'Data mahasiswa berhasil diperbarui.', 'success');
    } else {
      const newStudent = {
        id: crypto.randomUUID(),
        nama,
        nim,
        prodi,
        semester,
        createdAt: new Date().toISOString(),
      };
      saveStudents([...allStudents, newStudent]);
      setMessage(formMessage, 'Data berhasil disimpan.', 'success');
      form.reset();
    }

    setTimeout(() => {
      window.location.href = 'data.html';
    }, 700);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  if (page === 'dashboard') {
    renderDashboard();
  }

  if (page === 'data') {
    bindDataPageEvents();
  }

  if (page === 'form') {
    initFormPage();
  }
});
