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
      if (!result.data.data) {
        showAlert("success", result.data.message);
        return;
      }
      showAlert("success", "You've been logged in successfully.");
      setTimeout(() => {
        location.assign("/");
      }, 1000);
    }
  } catch (error) {
    console.log(error.response);
    showAlert("error", error.response.data.message);
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
      showAlert("success", result.data.message);
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};

export const logout = async () => {
  try {
    const result = await axios({
      method: "GET",
      url: "http://localhost:8080/api/v1/users/logout",
    });
    if ((result.status = "success")) {
      location.assign("/");
    }
  } catch (error) {
    console.log(error.response);
    showAlert("error", error.response.data.message);
  }
};

export const verify = async () => {
  try {
    const token = window.location.href.split("/verify/")[1];
    const url = `http://localhost:8080/api/v1/users/verify/${token}`;
    const result = await axios({
      method: "PATCH",
      url,
    });
    if ((result.status = "success")) {
      showAlert("success", "Your account is verified now.");
      setTimeout(() => {
        location.assign("/");
      }, 1000);
    }
  } catch (error) {
    console.log(error.response);
    showAlert("error", error.response.data.message);
  }
};
