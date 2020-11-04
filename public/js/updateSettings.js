import axios from "axios";
import { showAlert } from "./alert";
export const updateMe = async ({ name, password }) => {
  try {
    const result = await axios({
      method: "PATCH",
      url: "http://localhost:8080/api/v1/users/updateMe",
      data: {
        name,
        password,
      },
    });
    if ((result.status = "success")) {
      showAlert("success", "You've updated successfully.");
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};

export const updatePassword = async ({
  currentPassword,
  password,
  confirmedPassword,
}) => {
  try {
    const result = await axios({
      method: "PATCH",
      url: "http://localhost:8080/api/v1/users/updatePassword",
      data: {
        currentPassword,
        password,
        confirmedPassword,
      },
    });
    if ((result.status = "success")) {
      showAlert("success", "Password've been updated successfully.");
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};
