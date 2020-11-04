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
      showAlert("success", "You've been signed successfully.");
      setTimeout(() => {
        location.assign("/");
      }, 1000);
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
