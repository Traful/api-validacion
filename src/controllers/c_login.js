import jwt from "jsonwebtoken";
import { API_JWT_KEY } from "./../config.js";
import { query } from "./../database/connection.js";
import Validate from "../utils/validate.js";
import { isValidPassword, generateAccessToken } from "./../utils/funcs.js";

export const tokenValidate = async (req, res) => {
	let resp = {
		ok: false,
		msg: "Token inválido.",
		data: null,
		errores: []
	};

	if(req.params.token) {
		let token = req.params.token.split(" ")[1]; //Authorization: Bearer JWT_ACCESS_TOKEN
		jwt.verify(token, API_JWT_KEY, (err, user) => {
			if(err) {
				resp.msg = `${err.name} - ${err.message}`;
			} else {
				resp.ok = true;
				resp.msg = "";
				resp.data = {
					...user.data,
					jwt: req.params.token
				}
			}
		});
	}

	res.status(resp.ok ? 200 : 401).json(resp);
};


export const logIn = async (req, res) => {
	let resp = {
		ok: false,
		msg: "Nombre de usuario o contraseña no válido/s.",
		data: null,
		errores: []
	};

	let valid = new Validate(null);
	let verificar = {
		username: {
			type: "string",
			isValidMail: true
		},
		password:  {
			type: "string"
		}
	};

	valid.validar(req.body, verificar);

	if(valid.hasErrors()) {
		res.status(409).json(valid.getErrors());
		return;
	}

	let results = await query("SELECT * FROM users WHERE email = ?", [req.body.username]);

	if(results.length > 0) {
		let userData = results[0];
		let validPass = await isValidPassword(req.body.password, userData.password);
		if(validPass) {
			resp.ok = true;
			resp.msg = "";
			resp.data = {
				id: userData.id,
				email: userData.email,
				firstname: userData.firstname,
				lastname: userData.lastname,
				jwt: "Bearer " + generateAccessToken(userData)
			};
		}
	}

	res.status(resp.ok ? 200 : 409).json(resp);
};