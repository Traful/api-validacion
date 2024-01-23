import { Router } from "express";
import { getUsers, setUser } from "../controllers/c_users.js";

const rUsers = Router();

//[GET]
//rUsers.get("/users", getUsers);

//[POST]
rUsers.get("/user", setUser);

//[DELETE]
rUsers.get("/user/:id", setUser);

export default rUsers;