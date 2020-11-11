import axios from "axios";
import { showAlert } from "./alert";
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === "password"
        ? "/api/v1/users/updatePassword"
        : "/api/v1/users/updateMe";

    const res = await axios({
      method: "PATCH",
      url,
      data,
    });
    console.log(res);

    if (res.data.status === "success") {
      showAlert("success", `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);
  }
};

export const forgotPassword = async (email) => {
  try {
    const url = "/api/v1/users/forgotPassword";
    const res = await axios({
      method: "POST",
      url,
      data: { email },
    });
    console.log(res);

    if (res.data.status === "success") {
      showAlert(
        "success",
        `Password reset link has been sent to your email address`
      );
    }
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);
  }
};

export const resetPassword = async (data) => {
  try {
    const token = window.location.href.split("/resetPassword/")[1];
    const url = `/api/v1/users/resetPassword/${token}`;
    const res = await axios({
      method: "PATCH",
      url,
      data,
    });
    if (res.data.status === "success") {
      showAlert("success", `Password has been updated successfully`);
    }
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);
  }
};
