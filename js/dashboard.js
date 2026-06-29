import { db } from "./firebase.js";

import {
  ref,
  onValue,
  get,
  set,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
}

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

setInterval(updateClock, 1000);

updateClock();

//=========================================
// GRAFIK
//=========================================

let chart;

function createChart(ready, keluar) {
  const ctx = document.getElementById("chartStatus");

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "doughnut",

    data: {
      labels: ["READY", "KELUAR"],
      datasets: [
        {
          data: [ready, keluar],
          backgroundColor: ["#22C55E", "#F59E0B"],
          borderWidth: 2,
          radius: "75%",
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 15,
            padding: 15,
            font: {
              size: 13,
            },
          },
        },
      },
    },
  });
}

//=========================================
// FIREBASE
//=========================================

const motorRef = ref(db, "daftar_motor");

onValue(motorRef, (snapshot) => {
  const tbody = document.getElementById("tableMotor");

  tbody.innerHTML = "";

  let no = 1;
  let total = 0;
  let ready = 0;
  let keluar = 0;

  if (snapshot.exists()) {
    const data = snapshot.val();

    Object.keys(data).forEach((uid) => {
      const motor = data[uid];

      total++;

      if (motor.status == "READY") ready++;
      if (motor.status == "KELUAR") keluar++;

      let badge = "";

      if (motor.status == "READY") {
        badge = "<span class='status-ready'>READY</span>";
      } else if (motor.status == "KELUAR") {
        badge = "<span class='status-keluar'>KELUAR</span>";
      }

      tbody.innerHTML += `

            <tr>
                <td>${no++}</td>
                <td>${uid}</td>
                <td>${motor.merk}</td>
                <td>${motor.tipe}</td>
                <td>${motor.plat}</td>
                <td>${motor.tahun}</td>
                <td>${badge}</td>
                <td>Rp ${Number(motor.harga).toLocaleString("id-ID")}</td>
            </tr>
            `;
    });
  } else {
    tbody.innerHTML = `

        <tr>
            <td colspan="8" style="text-align: center;">
                Belum ada data motor.
            </td>
        </tr>
        `;
  }

  document.getElementById("totalMotor").innerHTML = total;
  document.getElementById("motorReady").innerHTML = ready;
  document.getElementById("motorKeluar").innerHTML = keluar;

  createChart(
    ready,
    keluar,
  );
});

//=========================================
// LOGOUT
//=========================================

document.getElementById("logoutBtn").addEventListener("click", logout);

//=========================================
// DETEKSI MOTOR BARU
//=========================================

const pendingRef = ref(db, "pending_motor");

let popupMotor = false;

onValue(pendingRef, (snapshot) => {
  if (!snapshot.exists()) return;

  if (popupMotor) return;
  const data = snapshot.val();
  const uid = Object.keys(data)[0];
  if (!uid) return;
  popupMotor = true;
  tampilFormMotor(uid);
  
});

let uidSekarang = "";

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
    simpanMotor(data);
  };
}

function simpanMotor(data) {

  const waktu = new Date().toLocaleString("id-ID");

  set(ref(db, "daftar_motor/" + data.uid),

    {
      merk: data.merk,
      tipe: data.tipe,
      warna: data.warna,
      tahun: data.tahun,
      plat: data.plat,
      harga: data.harga,
      status: "READY",
    },
  )
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
    })

    .catch((err) => {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err.message,
        heightAuto: false,
        scrollbarPadding: false,
      });
    });
}
