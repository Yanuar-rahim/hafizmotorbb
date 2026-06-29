import { db } from "./firebase.js";

import {
  ref,
  get,
  onValue,
  set,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

let chartStatus = null;
let chartPie = null;
let chartAktivitas = null;

//=========================================
// SESSION LOGIN
//=========================================

if (sessionStorage.getItem("login") != "true") {
  window.location.href = "login.html";
}

//=========================================
// JAM
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

get(ref(db, "admin")).then((snapshot) => {
  if (snapshot.exists()) {
    document.getElementById("namaAdmin").innerHTML = snapshot.val().nama;
  }
});

//=========================================
// FIREBASE
//=========================================

const laporanRef = ref(db, "riwayat_motor");

let semuaRiwayat = {};

let popupMotor = false;
let uidSekarang = "";

//=========================================
// LOAD DATA
//=========================================

onValue(laporanRef, (snapshot) => {
  semuaRiwayat = {};

  if (!snapshot.exists()) {
    document.getElementById("tableLaporan").innerHTML = `
        <tr>
            <td colspan="7" style="text-align:center;padding:30px;">
                Belum ada riwayat monitoring.
            </td>
        </tr>
        `;

    document.getElementById("totalRiwayat").innerHTML = 0;
    document.getElementById("totalReady").innerHTML = 0;
    document.getElementById("totalKeluar").innerHTML = 0;
    document.getElementById("aktivitasHariIni").innerHTML = 0;

    return;
  }

  semuaRiwayat = snapshot.val();
  renderTable(semuaRiwayat);
  hitungStatistik();
  buatChartStatus();
  buatChartPie();
  buatChartAktivitas();
});

//=========================================
// RENDER TABLE
//=========================================

function renderTable(data) {
  const tbody = document.getElementById("tableLaporan");

  tbody.innerHTML = "";

  let no = 1;

  Object.keys(data)
    .reverse()
    .forEach((key) => {
      const item = data[key];
      let badge = "";
      if (item.status == "READY") {
        badge = "<span class='status-ready'>READY</span>";
      } else {
        badge = "<span class='status-keluar'>KELUAR</span>";
      }

      tbody.innerHTML += `

        <tr>
            <td>${no++}</td>
            <td>${item.uid}</td>
            <td>${item.merk}</td>
            <td>${item.tipe}</td>
            <td>${item.plat}</td>
            <td>${badge}</td>
            <td>${item.waktu}</td>
        </tr>
        `;
    });
}

//=========================================
// STATISTIK
//=========================================

function hitungStatistik() {
  let total = 0;
  let ready = 0;
  let keluar = 0;
  let hariIni = 0;
  const hari = new Date().toLocaleDateString("id-ID");

  Object.keys(semuaRiwayat).forEach((key) => {
    total++;

    const item = semuaRiwayat[key];

    if (item.status == "READY") ready++;
    if (item.status == "KELUAR") keluar++;
    if (item.waktu.includes(hari)) hariIni++;
  });

  document.getElementById("totalRiwayat").innerHTML = total;
  document.getElementById("totalReady").innerHTML = ready;
  document.getElementById("totalKeluar").innerHTML = keluar;
  document.getElementById("aktivitasHariIni").innerHTML = hariIni;
}

//=========================================
// SEARCH
//=========================================

document.getElementById("searchLaporan").addEventListener("keyup", function () {
  const keyword = this.value.toLowerCase();

  let hasil = {};

  Object.keys(semuaRiwayat).forEach((key) => {
    const item = semuaRiwayat[key];

    const teks = (
      item.uid +
      item.merk +
      item.tipe +
      item.plat +
      item.status
    ).toLowerCase();

    if (teks.includes(keyword)) {
      hasil[key] = item;
    }
  });

  if (Object.keys(hasil).length == 0) {
    document.getElementById("tableLaporan").innerHTML = `

        <tr>
            <td colspan="7"
            style="text-align:center;padding:30px;">
            Tidak Ada Riwayat
            </td>
        </tr>
        `;
    return;
  }

  renderTable(hasil);
});

//=========================================
// FILTER STATUS
//=========================================

document.getElementById("filterStatus").addEventListener("change", function () {
  const status = this.value;

  if (status == "SEMUA") {
    renderTable(semuaRiwayat);

    return;
  }

  let hasil = {};

  Object.keys(semuaRiwayat).forEach((key) => {
    if (semuaRiwayat[key].status == status) {
      hasil[key] = semuaRiwayat[key];
    }
  });

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

function buatChartStatus() {
  let ready = 0;
  let keluar = 0;

  Object.values(semuaRiwayat).forEach((item) => {
    if (item.status == "READY") ready++;
    if (item.status == "KELUAR") keluar++;
  });

  if (chartStatus) chartStatus.destroy();

  chartStatus = new Chart(document.getElementById("chartStatus"), {
    type: "bar",

    data: {
      labels: ["READY", "KELUAR"],

      datasets: [
        {
          label: "Jumlah Motor",
          data: [ready, keluar],
          backgroundColor: ["#22c55e", "#ef4444"],
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      // plugins: {
      //   legend: {
      //     display: false,
      //   },
      // },
    },
  });
}

function buatChartPie() {
  let ready = 0;
  let keluar = 0;

  Object.values(semuaRiwayat).forEach((item) => {
    if (item.status == "READY") ready++;
    else keluar++;
  });

  if (chartPie) chartPie.destroy();

  chartPie = new Chart(document.getElementById("chartPie"), {
    type: "pie",

    data: {
      labels: ["READY", "KELUAR"],

      datasets: [
        {
          data: [ready, keluar],
          backgroundColor: ["#16a34a", "#dc2626"],
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function buatChartAktivitas() {
  let label = [];
  let jumlah = [];

  for (let i = 6; i >= 0; i--) {
    let tgl = new Date();

    tgl.setDate(tgl.getDate() - i);

    let nama = tgl.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });

    label.push(nama);

    let total = 0;

    Object.values(semuaRiwayat).forEach((item) => {
      if (item.waktu.includes(tgl.toLocaleDateString("id-ID"))) {
        total++;
      }
    });

    jumlah.push(total);
  }

  if (chartAktivitas) chartAktivitas.destroy();

  chartAktivitas = new Chart(document.getElementById("chartAktivitas"), {
    type: "line",

    data: {
      labels: label,
      datasets: [
        {
          label: "Aktivitas",
          data: jumlah,
          borderColor: "#2563eb",
          backgroundColor: "#60a5fa",
          fill: false,
          tension: 0.3,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,   
    },
  });
}

document.getElementById("btnPdf").onclick = () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("l", "mm", "a4");

  pdf.setFontSize(18);
  pdf.text("Laporan Monitoring Stok Motor", 14, 15);
  pdf.setFontSize(11);
  pdf.text("Tanggal : " + new Date().toLocaleString("id-ID"), 14, 22);

  pdf.text(
    "Total Riwayat : " + document.getElementById("totalRiwayat").innerHTML,
    14,
    30,
  );

  pdf.text(
    "READY : " + document.getElementById("totalReady").innerHTML,
    14,
    37,
  );

  pdf.text(
    "KELUAR : " + document.getElementById("totalKeluar").innerHTML,
    14,
    44,
  );

  let body = [];
  let no = 1;

  Object.values(semuaRiwayat)
    .reverse()
    .forEach((item) => {
      body.push([
        no++,
        item.uid,
        item.merk,
        item.tipe,
        item.plat,
        item.status,
        item.waktu,
      ]);
    });

  pdf.autoTable({
    startY: 55,
    head: [["No", "UID", "Merk", "Tipe", "Plat", "Status", "Waktu"]],
    body: body,
  });

  pdf.save("Laporan Monitoring Motor.pdf");
};

document.getElementById("btnExcel").addEventListener("click", exportExcel);

async function exportExcel() {
  const workbook = new ExcelJS.Workbook();

  const sheet = workbook.addWorksheet("Laporan Monitoring");

  //=========================================
  // JUDUL
  //=========================================

  sheet.mergeCells("A1:G1");

  sheet.getCell("A1").value = "LAPORAN MONITORING STOK MOTOR";

  sheet.getCell("A1").font = {
    size: 18,
    bold: true,
    color: { argb: "FFFFFF" },
  };

  sheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  sheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "1E3A8A" },
  };

  sheet.getRow(1).height = 28;

  //=========================================
  // INFORMASI
  //=========================================

  sheet.getCell("A3").value = "Tanggal Cetak";
  sheet.getCell("B3").value = new Date().toLocaleString("id-ID");

  sheet.getCell("A4").value = "Total Riwayat";
  sheet.getCell("B4").value = document.getElementById("totalRiwayat").innerText;

  sheet.getCell("A5").value = "Motor READY";
  sheet.getCell("B5").value = document.getElementById("totalReady").innerText;

  sheet.getCell("A6").value = "Motor KELUAR";
  sheet.getCell("B6").value = document.getElementById("totalKeluar").innerText;

  sheet.getCell("A7").value = "Aktivitas Hari Ini";
  sheet.getCell("B7").value =
    document.getElementById("aktivitasHariIni").innerText;

  //=========================================
  // HEADER TABEL
  //=========================================

  const headerRow = sheet.addRow([]);

  const row = sheet.addRow([
    "No",
    "UID",
    "Merk",
    "Tipe",
    "Plat",
    "Status",
    "Waktu",
  ]);

  row.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: "FFFFFF" },
    };

    cell.alignment = {
      horizontal: "center",
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "2563EB" },
    };

    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  //=========================================
  // DATA
  //=========================================

  let no = 1;

  Object.values(semuaRiwayat)
    .reverse()
    .forEach((item) => {
      const r = sheet.addRow([
        no++,
        item.uid,
        item.merk,
        item.tipe,
        item.plat,
        item.status,
        item.waktu,
      ]);

      r.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      if (item.status === "READY") {
        r.getCell(6).fill = {
          type: "pattern",

          pattern: "solid",

          fgColor: { argb: "22C55E" },
        };

        r.getCell(6).font = {
          color: { argb: "FFFFFF" },
          bold: true,
        };
      }

      if (item.status === "KELUAR") {
        r.getCell(6).fill = {
          type: "pattern",

          pattern: "solid",

          fgColor: { argb: "DC2626" },
        };

        r.getCell(6).font = {
          color: { argb: "FFFFFF" },
          bold: true,
        };
      }
    });

  //=========================================
  // LEBAR KOLOM
  //=========================================

  sheet.columns = [
    { width: 8 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
    { width: 18 },
    { width: 15 },
    { width: 30 },
  ];

  //=========================================
  // DOWNLOAD
  //=========================================

  const buffer = await workbook.xlsx.writeBuffer();

  saveAs(
    new Blob([buffer]),

    "Laporan Monitoring Stok Motor.xlsx",
  );
}
