import axios from "axios";
import { showAlert } from "./alert";
export const login = async (email, password) => {
  try {
    const result = await axios({
      method: "POST",
      url: "http://localhost:8080/api/v1/users/login",
      data: {
        email,
        password,
      },
    });
    if ((result.status = "success")) {
      showAlert("success", "You've been logged in successfully.");
      setTimeout(() => {
        location.assign("/");
      }, 1000);
    }
  } catch (error) {
    showAlert("error", "Invalid email or password");
  }
};

export const signup = async (signUpData) => {
  try {
    const result = await axios({
      method: "POST",
      url: "http://localhost:8080/api/v1/users/signup",
      data: signUpData,
    });
    if ((result.status = "success")) {
      showAlert("success", "You've been signed successfully.");
      setTimeout(() => {
        location.assign("/");
      }, 1000);
    }
  } catch (error) {
    console.log(error.response);
    showAlert("error", "Invalid email or password");
  }
};
