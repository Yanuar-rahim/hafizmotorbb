// =====================================
// FIREBASE CONFIG
// =====================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// =====================================
// KONFIGURASI FIREBASE
// =====================================

const firebaseConfig = {
  apiKey: "AIzaSyCt00ma_JI9TltEKrE-ZoWubZ4Ze6UvQq8",

  authDomain: "hafizmotor-iot-a1c64.firebaseapp.com",

  databaseURL:
    "https://hafizmotor-iot-a1c64-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId: "hafizmotor-iot-a1c64",

  storageBucket: "hafizmotor-iot-a1c64.firebasestorage.app",

  messagingSenderId: "773926648428",

  appId: "1:773926648428:web:4c7d6702c5f82f3ea1b649",
};

// =====================================
// INISIALISASI
// =====================================

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

// =====================================
// EXPORT
// =====================================

export { db };
