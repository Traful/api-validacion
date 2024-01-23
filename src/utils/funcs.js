import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { API_JWT_KEY } from "./../config.js";

const SALT_ROUNDS = 10;

export const generateHash = (password) => {
	return bcrypt.hash(password, SALT_ROUNDS);
};

export const isValidPassword = (password, hash) => {
	return bcrypt.compare(password, hash);
};

export const generateAccessToken = (user) => {
	let data = {
		exp: Math.floor(Date.now() / 1000) + (60 * 60 * 8), //8 Hs
		//exp: Math.floor(Date.now() / 1000) + (1), //1 seg?
		data: {
			id: user.id,
			email: user.email,
			firstname: user.firstname,
			lastname: user.lastname
		}
	};
	return jwt.sign(data, API_JWT_KEY, { algorithm: "HS256" });
};