import "@babel/polyfill";
import { login, signup, logout } from "./login";
import {
  updateSettings,
  forgotPassword,
  resetPassword,
} from "./updateSettings";
import { bookTour } from "./stripe";
import { displayMap } from "./mapbox";

// DOM
const mapbox = document.getElementById("map");
const loginForm = document.querySelector(".form--login");
const signupForm = document.querySelector(".form--signup");
const logoutBtn = document.querySelector(".nav__el--logout");
const userDataForm = document.querySelector(".form-user-data");
const userPassowrdForm = document.querySelector(".form-user-password");
const forgotPasswordBtn = document.querySelector(".btn--forgot-password");
const resetPasswordForm = document.querySelector(".form--forgot-password");
const bookBtn = document.getElementById("book-btn");

// loggin in
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });
}

// signing up
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const name = document.getElementById("name").value;
    const password = document.getElementById("password").value;
    const confirmedPassword = document.getElementById("confirmedPassword")
      .value;
    signup({ name, email, password, confirmedPassword });
  });
}

// logging out
if (logoutBtn) logoutBtn.addEventListener("click", logout);

// updating info
if (userDataForm) {
  userDataForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let form = new FormData();
    form.append("email", document.getElementById("email").value);
    form.append("name", document.getElementById("name").value);
    form.append("photo", document.getElementById("photo").files[0]);
    updateSettings(form, "data");
  });
}

// updating password
if (userPassowrdForm) {
  userPassowrdForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelector(".btn--save-password").textContent = "Updating";
    const currentPassword = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const confirmedPassword = document.getElementById("password-confirm").value;
    await updateSettings(
      { currentPassword, password, confirmedPassword },
      "password"
    );
    document.querySelector(".btn--save-password").textContent = "Save Password";
  });
}

// fogetting password
if (forgotPasswordBtn) {
  forgotPasswordBtn.addEventListener("click", async () => {
    await forgotPassword(document.getElementById("email").value);
  });
}

// resetting password
if (resetPasswordForm) {
  resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelector(".btn--reset-password").textContent = "Updating";
    const currentPassword = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const confirmedPassword = document.getElementById("password-confirm").value;
    await resetPassword({ currentPassword, password, confirmedPassword });
    document.querySelector(".btn--reset-password").textContent =
      "Update Password";
  });
}

// booking a tour
if (bookBtn) {
  bookBtn.addEventListener("click", async (e) => {
    const originalTextContent = e.target.textContent;
    e.target.textContent = "Purchasing......";
    const tourId = e.target.dataset.tourId;
    await bookTour(tourId);
    e.target.textContent = originalTextContent;
  });
}

// delegate
if (mapbox) {
  const locations = JSON.parse(mapbox.dataset.locations);
  displayMap(locations);
}
