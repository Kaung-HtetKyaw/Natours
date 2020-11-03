import "@babel/polyfill";
import { login } from "./login";
import { displayMap } from "./mapbox";

// DOM
const mapbox = document.getElementById("map");
const loginForm = document.querySelector(".form--login");

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

// delegate
if (mapbox) {
  const locations = JSON.parse(mapbox.dataset.locations);
  displayMap(locations);
}
