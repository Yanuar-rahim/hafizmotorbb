//=========================================
// AUTH SESSION
//=========================================

const halaman = window.location.pathname.split("/").pop();

// Jika sudah login, tidak boleh kembali ke login
if (halaman === "login.html") {
  if (sessionStorage.getItem("login") === "true") {
    window.location.replace("dashboard.html");
  }
}

// Semua halaman selain login wajib login
else {
  if (sessionStorage.getItem("login") !== "true") {
    window.location.replace("login.html");
  }
}

//=========================================
// FUNGSI LOGOUT
//=========================================

window.logout = function () {
  Swal.fire({
    title: "Logout?",

    text: "Apakah Anda yakin ingin keluar?",

    icon: "question",

    showCancelButton: true,

    confirmButtonText: "Logout",

    cancelButtonText: "Batal",

    confirmButtonColor: "#2563EB",

    cancelButtonColor: "#DC2626",

    heightAuto: false,

    scrollbarPadding: false,
  }).then((result) => {
    if (result.isConfirmed) {
      sessionStorage.clear();

      window.location.replace("login.html");
    }
  });
};
