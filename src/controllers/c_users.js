import { query } from "./../database/connection.js";
import { generateHash } from "./../utils/funcs.js";

export const getUsers = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};

	try {
		resp.data = await query("SELECT id, email, firstname, lastname FROM users", []);
	} catch (error) {
		resp.ok = false;
		resp.msg = error.message;
	}

	res.status(resp.ok ? 200 : 409).json(resp);
};

export const setUser = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};

	let valid = new Validate(null);
	let verificar = {
		username: {
			type: "string",
			max: 100,
			isValidMail: true
		},
		firstname: {
			type: "string",
			min: 3,
			max: 50
		},
		lastname: {
			type: "string",
			max: 50
		},
		password:  {
			type: "string",
			min: 3
		}
	};

	valid.validar(req.body, verificar);
	if(valid.hasErrors()) {
		res.status(409).json(valid.getErrors());
		return;
	}

	let xHash = await generateHash(req.body.password);

	try {
		let results = await query(
			"INSERT INTO users (email, firstname, lastname, password) VALUES (@email, @firstname, @lastname, @password)",
			[req.body.username, req.body.firstname, req.body.lastname, xHash]
		);
		resp.data = {
			rowsAffected: results.length
		};
	} catch (error) {
		console.error(error.message);
		resp = {
			ok: false,
			msg: "Ocurrió un error al procesar la solicitud.",
			data: null,
			errores: [error.message]
		};
	}
	
	res.status(resp.ok ? 200 : 409).json(resp);
};