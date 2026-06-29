  import { db } from "./firebase.js";

  import {
    ref,
    get,
    onValue,
    set,
    remove,
  } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

  //=========================================
  // CEK SESSION LOGIN
  //=========================================

  if (sessionStorage.getItem("login") != "true") {
    window.location.href = "login.html";
  }

  //=========================================
  // JAM & TANGGAL
  //=========================================

  function updateClock() {
    const now = new Date();

    document.getElementById("jam").innerHTML = now.toLocaleTimeString("id-ID");

    document.getElementById("tanggal").innerHTML = now.toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      },
    );
  }

  updateClock();

  setInterval(updateClock, 1000);

  //=========================================
  // DATA ADMIN
  //=========================================

  const adminRef = ref(db, "admin");

  get(adminRef).then((snapshot) => {
    if (snapshot.exists()) {
      const admin = snapshot.val();
      document.getElementById("namaAdmin").innerHTML = admin.nama;
    }
  });

  //=========================================
  // VARIABEL GLOBAL
  //=========================================


  const motorRef = ref(db, "daftar_motor");

  let semuaMotor = {};
  let uidSekarang = "";
  let popupMotor = false;

  //=========================================
  // TAMPILKAN DATA MOTOR
  //=========================================

  onValue(motorRef, (snapshot) => {
    semuaMotor = {};

    const tbody = document.getElementById("tableMotor");

    tbody.innerHTML = "";

    let no = 1;

    let total = 0;
    let ready = 0;
    let keluar = 0;

    if (snapshot.exists()) {
      const data = snapshot.val();

      Object.keys(data).forEach((uid) => {
        total++;

        if (data[uid].status == "READY") ready++;
        if (data[uid].status == "KELUAR") keluar++;
      });

      renderTable(data);
    } else {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align:center">
            Belum ada data motor.
          </td>
        </tr>
      `;

      document.getElementById("totalMotor").innerHTML = 0;
      document.getElementById("motorReady").innerHTML = 0;
      document.getElementById("motorKeluar").innerHTML = 0;

      return;
    }

    const data = snapshot.val();
    semuaMotor = data;
    renderTable(data);

    document.getElementById("totalMotor").innerHTML = total;
    document.getElementById("motorReady").innerHTML = ready;
    document.getElementById("motorKeluar").innerHTML = keluar;
  });

  //=========================================
  // RENDER TABLE
  //=========================================

  function renderTable(dataMotor) {
    const tbody = document.getElementById("tableMotor");

    tbody.innerHTML = "";

    let no = 1;

    Object.keys(dataMotor).forEach((uid) => {
      const motor = dataMotor[uid];

      let badge = "";

      if (motor.status == "READY") {
        badge = "<span class='status-ready'>READY</span>";
      } else {
        badge = "<span class='status-keluar'>KELUAR</span>";
      }

      tbody.innerHTML += `

      <tr>
        <td>${no++}</td>
        <td>${uid}</td>
        <td>${motor.merk}</td>
        <td>${motor.tipe}</td>
        <td>${motor.warna}</td>
        <td>${motor.tahun}</td>
        <td>${motor.plat}</td>
        <td>Rp ${Number(motor.harga).toLocaleString("id-ID")}</td>
        <td>${badge}</td>
        <td>
          <button class="btn-edit"
          onclick="editMotor('${uid}')">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn-delete"
          onclick="hapusMotor('${uid}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
      `;
    });
  }

  //=========================================
  // EDIT MOTOR
  //=========================================

  window.editMotor = function (uid) {
    const motor = semuaMotor[uid];
    document.getElementById("editUid").value = uid;
    document.getElementById("editMerk").value = motor.merk;
    document.getElementById("editTipe").value = motor.tipe;
    document.getElementById("editWarna").value = motor.warna;
    document.getElementById("editTahun").value = motor.tahun;
    document.getElementById("editPlat").value = motor.plat;
    document.getElementById("editHarga").value = motor.harga;
    document.getElementById("editModal").style.display = "flex";
  };

  document.getElementById("btnUpdateMotor").onclick = function () {
    const uid = document.getElementById("editUid").value;

    const data = {
      merk: document.getElementById("editMerk").value,
      tipe: document.getElementById("editTipe").value,
      warna: document.getElementById("editWarna").value,
      tahun: document.getElementById("editTahun").value,
      plat: document.getElementById("editPlat").value,
      harga: document.getElementById("editHarga").value,
      status: semuaMotor[uid].status,
    };

    set(ref(db, "daftar_motor/" + uid), data).then(() => {
      document.getElementById("editModal").style.display = "none";

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data motor berhasil diperbarui.",
        timer: 1800,
        showConfirmButton: false,
        heightAuto: false,
        scrollbarPadding: false,
      });
    });
  };

  //=========================================
  // TUTUP MODAL EDIT
  //=========================================

  window.tutupEdit = function () {
    document.getElementById("editModal").style.display = "none";
  };

  //=========================================
  // HAPUS MOTOR
  //=========================================

  window.hapusMotor = function (uid) {
    const motor = semuaMotor[uid];

    Swal.fire({
      title: "Hapus Data?",
      html: `
              <b>${motor.merk} ${motor.tipe}</b><br>
              UID : ${uid}<br>
              Plat : ${motor.plat}
          `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
      heightAuto: false,
      scrollbarPadding: false,
    }).then((result) => {
      if (!result.isConfirmed) return;
      remove(ref(db, "daftar_motor/" + uid))
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Data motor berhasil dihapus.",
            timer: 1800,
            showConfirmButton: false,
            heightAuto: false,
            scrollbarPadding: false,
          });
        })
        .catch((err) => {
          Swal.fire({
            icon: "error",
            title: "Gagal",
            text: err.message,
            confirmButtonColor: "#2563EB",
            heightAuto: false,
            scrollbarPadding: false,
          });
        });
    });
  };

  //=========================================
  // SEARCH REALTIME
  //=========================================

  document.getElementById("searchMotor").addEventListener("keyup", function () {
    const keyword = this.value.toLowerCase();

    let hasil = {};

    Object.keys(semuaMotor).forEach((uid) => {
      const motor = semuaMotor[uid];

      const teks = (
        uid +
        " " +
        motor.merk +
        " " +
        motor.tipe +
        " " +
        motor.warna +
        " " +
        motor.plat
      ).toLowerCase();

      if (teks.includes(keyword)) {
        hasil[uid] = motor;
      }
    });

    // Jika tidak ada hasil
    if (Object.keys(hasil).length === 0) {
      document.getElementById("tableMotor").innerHTML = `
        <tr>
          <td colspan="10" style="text-align:center;padding:30px;color:#64748B;">
            <i class="fa-solid fa-circle-exclamation"
              style="font-size:22px;margin-bottom:10px;display:block;color:#DC2626;"></i>
            Tidak Ada Motor
          </td>
        </tr>
      `;

      return;
    }

    renderTable(hasil);
  });

  //=========================================
  // LOGOUT
  //=========================================

  document.getElementById("logoutBtn").addEventListener("click", logout);


  //=========================================
  // DETEKSI UID BARU
  //=========================================

  const pendingRef = ref(db, "pending_motor");

  onValue(pendingRef, (snapshot) => {
    if (!snapshot.exists()) return;
    if (popupMotor) return;
    const data = snapshot.val();
    const uid = Object.keys(data)[0];
    if (!uid) return;
    popupMotor = true;
    tampilFormMotor(uid);
  });

  //=========================================
  // TAMPILKAN MODAL
  //=========================================

  function tampilFormMotor(uid) {
    uidSekarang = uid;
    document.getElementById("uidMotor").value = uid;
    document.getElementById("merk").value = "";
    document.getElementById("tipe").value = "";
    document.getElementById("warna").value = "";
    document.getElementById("tahun").value = "";
    document.getElementById("plat").value = "";
    document.getElementById("harga").value = "";
    document.getElementById("motorModal").style.display = "flex";
  }

  //=========================================
  // TOMBOL SIMPAN
  //=========================================

  document.getElementById("btnSimpanMotor").onclick = function () {
    const data = {
      uid: uidSekarang,
      merk: document.getElementById("merk").value.trim(),
      tipe: document.getElementById("tipe").value.trim(),
      warna: document.getElementById("warna").value.trim(),
      tahun: document.getElementById("tahun").value.trim(),
      plat: document.getElementById("plat").value.trim(),
      harga: document.getElementById("harga").value.trim(),
    };

    if (
      data.merk == "" ||
      data.tipe == "" ||
      data.warna == "" ||
      data.tahun == "" ||
      data.plat == "" ||
      data.harga == ""
    ) {
      alert("Lengkapi semua data.");
      return;
    }

    document.getElementById("motorModal").style.display = "none";
    popupMotor = false;
    simpanMotor(data);
  };

  //=========================================
  // SIMPAN MOTOR
  //=========================================

  function simpanMotor(data) {
    const waktu = new Date().toLocaleString("id-ID");

    set(ref(db, "daftar_motor/" + data.uid), {
      merk: data.merk,
      tipe: data.tipe,
      warna: data.warna,
      tahun: data.tahun,
      plat: data.plat,
      harga: data.harga,
      status: "READY",
    })
      .then(() => {
        return remove(ref(db, "pending_motor/" + data.uid));
      })

      .then(() => {
        return set(ref(db, "riwayat_motor/" + Date.now()), {
          uid: data.uid,
          merk: data.merk,
          tipe: data.tipe,
          plat: data.plat,
          status: "READY",
          aktivitas: "Motor Terdaftar",
          waktu: waktu,
        });
      })

      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Motor berhasil ditambahkan.",
          timer: 1800,
          showConfirmButton: false,
          heightAuto: false,
          scrollbarPadding: false,
        });
      });
  }
