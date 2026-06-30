// ===============================
// NAVBAR SCROLL
// ===============================

const navbar = document.querySelector("nav");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.style.background = "#ffffff";
    navbar.style.boxShadow = "0 6px 20px rgba(0,0,0,.12)";
  } else {
    navbar.style.background = "#ffffff";
    navbar.style.boxShadow = "0 4px 15px rgba(0,0,0,.08)";
  }
});

// ===============================
// HERO ANIMATION
// ===============================

window.addEventListener("load", () => {
  document.querySelector(".hero-text").style.opacity = "1";
  document.querySelector(".hero-text").style.transform = "translateX(0)";

  document.querySelector(".hero-image").style.opacity = "1";
  document.querySelector(".hero-image").style.transform = "translateX(0)";
});

// ===============================
// SCROLL ANIMATION
// ===============================

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  {
    threshold: 0.15,
  },
);

document.querySelectorAll(".fitur-card,.step,.about").forEach((el) => {
  el.classList.add("hidden");

  observer.observe(el);
});

// ===============================
// SMOOTH MENU
// ===============================

document.querySelectorAll('nav a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

menuToggle.addEventListener("click", () => {

    navMenu.classList.toggle("active");

    if (navMenu.classList.contains("active")) {
        menuToggle.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    } else {
        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }

});

// Menutup menu setelah item diklik
document.querySelectorAll("#navMenu a").forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
});