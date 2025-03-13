import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const secret = process.env.JWT_SECRET;
const node_mode = process.env.NODE_ENV;

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, secret, {
    expiresIn: "1d",
  });

  // console.log("USER : ", userId);
  // console.log("TOKEN :", token);

  res.cookie("jwt", token, {
    maxAge: 24 * 60 * 60 * 1000, //MS
    httpOnly: true, //XSS Attacks
    sameSite: "strict", //CSRF attacks
    secure: node_mode !== "development", //HTTPS only
  });

  return token;
};
