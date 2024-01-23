import { query } from "./../database/connection.js";

import Validate from "../utils/validate.js";
import { v4 as uuidv4 } from "uuid";

import { getApiManagerData } from "./../utils/apiManager.js";
import { sendMail } from "./utils.js";

export const getSolicitudes = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};

	try {
		let sql = `SELECT
			sol.*,
			(SELECT count(*) FROM firmantes fir WHERE fir.idsolicitud = sol.id) AS totFirm,
			e.descripcion as estado
		FROM solicitudes sol
		LEFT JOIN estados e ON
			e.id = sol.idestado 
		ORDER BY sol.id DESC`;
		resp.data = await query(sql, []);
	} catch (error) {
		resp.ok = false;
		resp.msg = error.message;
	}

	res.status(resp.ok ? 200 : 409).json(resp);
};

export const getSolicitudesByEstado = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};

	try {
		resp.data = await query("SELECT * FROM solicitudes WHERE idestado = ? ORDER BY id DESC", [req.params.id]);
	} catch (error) {
		resp.ok = false;
		resp.msg = error.message;
	}

	res.status(resp.ok ? 200 : 409).json(resp);
};

export const getSolicitud = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};

	try {
		resp.data = await query("SELECT sol.*, e.descripcion as estado FROM solicitudes sol LEFT JOIN estados e ON e.id = sol.idestado WHERE sol.id = ?", [req.params.id])
	} catch (error) {
		resp.ok = false;
		resp.msg = error.message;
	}

	res.status(resp.ok ? 200 : 409).json(resp);
};

export const getFirmantesByIdSolicitud = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};

	try {
		resp.data = await query("SELECT * FROM firmantes WHERE idsolicitud = ?", [req.params.id]);
	} catch (error) {
		resp.ok = false;
		resp.msg = error.message;
	}

	res.status(resp.ok ? 200 : 409).json(resp);
};

export const postSolicitud = async (req, res) => {
	let resp = {
		ok: false,
		msg: "Ocurrió un error al procesar la solicitud.",
		data: null,
		errores: []
	};

	let valid = new Validate(null);
	let verificar = {
		nrosolicitud: { type: "string", min: 3, max: 100 },
		firmantes: { type: "array", min: 1 }
	};

	valid.validar(req.body, verificar);

	if(valid.hasErrors()) {
		res.status(409).json(valid.getErrors());
		return;
	}

	let insertedId = null;
	let affected = null;
	let results = null;
	try {
		//results = await query("INSERT INTO solicitudes (nrosolicitud, f_ingreso, f_estado, idestado) OUTPUT INSERTED.id AS lastId VALUES(?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)", [req.body.nrosolicitud, 1]);
		results = await query("INSERT INTO solicitudes (nrosolicitud, f_ingreso, f_estado, idestado) VALUES(?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)", [req.body.nrosolicitud, 1]);
		insertedId = parseInt(results.insertId, 10);
		affected = parseInt(results.affectedRows, 10);
		resp.data = {
			insertedId: insertedId,
			rowsAffected: affected
		};

		if(affected && insertedId && (affected > 0) && (insertedId > 0)) {
			//Agregar los firmantes
			var am = await getApiManagerData();
			var amToken = null;
			if(am.ok) {
				amToken = am.token;
			} else {
				console.log("Error al obtener el token de Api Manager");
				console.log(am);
			}
			req.body.firmantes.forEach(async firmante => {
				let token = uuidv4() + "--" + insertedId;
				//Si se debe validar en renaper se envía el mail para realizar el proceso.
				let tToken = null;
				if(firmante.validarenaper && amToken) {
					//console.log("Envio: " + firmante.email);
					let respMail = await sendMail(firmante.email, token, amToken); //.catch(console.error);
					if(respMail.ok) {
						tToken = respMail.respuestaTerin.ADDMSG_OK;
					}
				}
				results = await query(
					"INSERT INTO firmantes (idsolicitud, sexo, dni, email, phone, validarenaper, token, intentos, mailid, idvalidacionestado) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)",
					[insertedId, firmante.sexo, firmante.dni, firmante.email, firmante.phone, firmante.validarenaper, token, tToken, (firmante.validarenaper ?  1 : 4)]
				);
			});
		}
		resp.ok = true;
		resp.msg = "";
	} catch (error) {
		resp = {
			ok: false,
			msg: "Ocurrió un error al procesar la solicitud.",
			data: null,
			errores: [error.message]
		};
	}
	res.status(resp.ok ? 201 : 409).json(resp);
};

export const deleteSolicitud = async (req, res) => {
	let resp = {
		ok: false,
		msg: "Ocurrió un error al procesar la solicitud."
	};

	try {
		//Se elimina la solicitud
		await query("DELETE FROM solicitudes WHERE id = ?", [req.params.id]);
		//Se eliminan los firmantes
		await query("DELETE FROM solicitudes WHERE idsolicitud = ?", [req.params.id]);
		resp.ok = true;
		resp.msg =  "";
	} catch (error) {
		resp = {
			ok: false,
			msg: error.message,
		};
	}
	res.status(resp.ok ? 201 : 409).json(resp);
};