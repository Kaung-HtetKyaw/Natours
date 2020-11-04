import "@babel/polyfill";
import { login, signup, logout } from "./login";
import { displayMap } from "./mapbox";

// DOM
const mapbox = document.getElementById("map");
const loginForm = document.querySelector(".form--login");
const signupForm = document.querySelector(".form--signup");
const logoutBtn = document.querySelector(".nav__el--logout");

// values
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    console.log(email, password);
    login(email, password);
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const name = document.getElementById("name").value;
    const password = document.getElementById("password").value;
    const confirmedPassword = document.getElementById("confirmedPassword")
      .value;
    console.log(name, email, password, confirmedPassword);
    signup({ name, email, password, confirmedPassword });
  });
}

if (logoutBtn) logoutBtn.addEventListener("click", logout);

// delegate
if (mapbox) {
  const locations = JSON.parse(mapbox.dataset.locations);
  displayMap(locations);
}