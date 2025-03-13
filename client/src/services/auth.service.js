import api from "./api";
import { Cookies } from "react-cookie";
const API_URL = import.meta.env.VITE_BASE_URL + "/auth";

const cookies = new Cookies();

const signup = async (email, password) => {
  return await api.post(API_URL + "/signup", { email, password });
};

const signin = async (email, password) => {
  const response = await api.post(API_URL + "/signin", { email, password });

  //save data to cookies
  const { status, data } = response; // restruc data&response
  // console.log(status,data);

  if (status === 200) {
    console.log(data);

    if (data.accessToken) {
      cookies.set("accessToken", data.accessToken, {
        path: "/",
        expires: new Date(Date.now() + 86400 * 1000), //expire date 24h
      });
      cookies.set("user", data);
    }
  }
  return response;
};

const logout = () => {
  cookies.remove("accessToken", { path: "/" });
  cookies.remove("user", { path: "/" });
};

const AuthService = {
  signup,
  signin,
  logout,
};

export default AuthService;
