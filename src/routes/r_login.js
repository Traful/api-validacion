import { Router } from "express";
import { tokenValidate, logIn } from "../controllers/c_login.js";

const rLogin = Router();

//[GET]

rLogin.get("/token/validate/:token", tokenValidate);

//[POST]

rLogin.post("/login", logIn);

export default rLogin;