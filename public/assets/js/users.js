
const modal = document.getElementById('userModal');

function openModal() {
    document.getElementById('modalTitle').textContent =
        'Tambah Pengguna';

    document.querySelector('#userModal form').reset();

    document.getElementById('userId').value = '';
    document.getElementById('userPassword').required = true;
    document.getElementById('passwordHint').textContent =
        '(Minimal 8 karakter)';

    modal.classList.add('show');
}

function closeModal() {
    modal.classList.remove('show');
}

function editUser(user) {
    document.getElementById('modalTitle').textContent =
        'Edit Pengguna';

    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userIdentity').value =
        user.identity_number || '';
    document.getElementById('userPhone').value =
        user.phone || '';

    document.getElementById('userPassword').value = '';
    document.getElementById('userPassword').required = false;

    document.getElementById('passwordHint').textContent =
        '(Kosongkan jika tidak ingin mengganti password)';

    modal.classList.add('show');
}

// Tutup modal ketika klik area luar
modal.addEventListener('click', function (event) {
    if (event.target === modal) {
        closeModal();
    }
});

// PENCARIAN DAN FILTER
const searchInput = document.getElementById('searchUser');
const roleFilter = document.getElementById('filterRole');
const statusFilter = document.getElementById('filterStatus');

function filterUsers() {
    const search = searchInput.value.toLowerCase();
    const role = roleFilter.value;
    const status = statusFilter.value;

    const rows = document.querySelectorAll(
        '#userTableBody tr'
    );

    let visibleCount = 0;

    rows.forEach(row => {
        const name = row.dataset.name;
        const email = row.dataset.email;
        const rowRole = row.dataset.role;
        const rowStatus = row.dataset.status;

        const matchSearch =
            name.includes(search) || email.includes(search);

        const matchRole =
            role === '' || rowRole === role;

        const matchStatus =
            status === '' || rowStatus === status;

        const visible =
            matchSearch && matchRole && matchStatus;

        row.style.display = visible ? '' : 'none';

        if (visible) visibleCount++;
    });

    document.getElementById('emptyMessage').hidden =
        visibleCount !== 0;
}

searchInput.addEventListener('input', filterUsers);
roleFilter.addEventListener('change', filterUsers);
statusFilter.addEventListener('change', filterUsers);

// VALIDASI FORMULIR PENGGUNA
(() => {
    const form = document.querySelector('#userModal form');

    if (!form) return;

    const fields = {
        id: document.getElementById('userId'),
        name: document.getElementById('userName'),
        email: document.getElementById('userEmail'),
        password: document.getElementById('userPassword'),
        role: document.getElementById('userRole'),
        identity: document.getElementById('userIdentity'),
        phone: document.getElementById('userPhone')
    };

    const validatedFields = [
        fields.name,
        fields.email,
        fields.password,
        fields.role,
        fields.identity,
        fields.phone
    ];

    function clearErrors() {
        validatedFields.forEach((field) => {
            field.setCustomValidity('');
        });
    }

    validatedFields.forEach((field) => {
        field.addEventListener('input', () => {
            field.setCustomValidity('');
        });

        field.addEventListener('change', () => {
            field.setCustomValidity('');
        });
    });

    // Reset pesan validasi ketika membuka formulir tambah.
    form.addEventListener('reset', clearErrors);

    // Reset juga ketika berpindah dari tambah ke edit atau sebaliknya.
    const modalElement = document.getElementById('userModal');

    const observer = new MutationObserver(clearErrors);

    observer.observe(modalElement, {
        attributes: true,
        attributeFilter: ['class']
    });

    form.addEventListener('submit', (event) => {
        clearErrors();

        fields.name.value = fields.name.value.trim();
        fields.email.value = fields.email.value.trim().toLowerCase();
        fields.identity.value = fields.identity.value.trim();
        fields.phone.value = fields.phone.value.trim();

        const isNewUser =
            fields.id.value === '' ||
            fields.id.value === '0';

        fields.password.required = isNewUser;

        const nameLength = Array.from(fields.name.value).length;

        if (nameLength < 2 || nameLength > 100) {
            fields.name.setCustomValidity(
                'Nama harus terdiri dari 2–100 karakter.'
            );
        }

        const allowedRoles = ['admin', 'petugas', 'pelapor'];

        if (!allowedRoles.includes(fields.role.value)) {
            fields.role.setCustomValidity('Pilih role yang valid.');
        }

        if (Array.from(fields.identity.value).length > 30) {
            fields.identity.setCustomValidity(
                'NIM/NIP maksimal 30 karakter.'
            );
        }

        if (
            fields.phone.value !== '' &&
            !/^\+?[0-9]{8,15}$/.test(fields.phone.value)
        ) {
            fields.phone.setCustomValidity(
                'Nomor telepon harus berisi 8–15 angka, boleh diawali +.'
            );
        }

        // Password tidak di-trim agar nilainya tidak berubah.
        const password = fields.password.value;

        if (isNewUser && password === '') {
            fields.password.setCustomValidity(
                'Password wajib diisi untuk akun baru.'
            );
        } else if (password !== '') {
            const characterCount = Array.from(password).length;
            const byteCount = new TextEncoder().encode(password).length;

            if (
                characterCount < 8 ||
                byteCount > 72 ||
                password.includes('\0')
            ) {
                fields.password.setCustomValidity(
                    'Password minimal 8 karakter dan maksimal 72 byte.'
                );
            }
        }

        if (!form.checkValidity()) {
            event.preventDefault();
            form.reportValidity();
        }
    });
})();
