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
