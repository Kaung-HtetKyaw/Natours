import axios from "axios";
import { showAlert } from "./alert";
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === "password"
        ? "http://localhost:8080/api/v1/users/updatePassword"
        : "http://localhost:8080/api/v1/users/updateMe";

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