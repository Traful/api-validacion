import { query } from "./../database/connection.js";
import { checkInitSign, sendMail } from "./utils.js";
import { getApiManagerData } from "./../utils/apiManager.js";
import { APIM_RENAPER_URL } from "./../config.js";

const checkIdentidad = async (dni, foto, sexo = "M") => {
	var resp = {
		ok: false,
		msg: "Error al procesar la solicitud [checkIdentidad]",
		data: null
	};

	try {
		let am = await getApiManagerData();
		let data = {
			dni: dni,
			sexo: sexo, //Ojo con este dato va si o si!!!!!
			foto: foto.toString("base64")
		};

		let check = await fetch(APIM_RENAPER_URL, {
			method: "POST",
			headers: {
				"Authorization": am.token
			},
			body: JSON.stringify(data)
		});
		if(check.ok) {
			/*
				Api Manager esta reformateando a texto la devolución del servicio!!! -.-
			*/
			let value = `{{"codigo":200,"mensaje":"OK","data":{"codigo":200,"type":"Success","detalle":"Probing successfully performed","mensaje":"SuccessProbing","score":91}}}`;
			let jsonCheck =  JSON.parse(value.substring(1, value.length - 1));

			//let jsonCheck = await check.json();

			resp.ok = true;
			resp.msg = null;
			resp.data = jsonCheck;
		} else {
			resp.msg = "Ocurrió un error al intentar el chequeo en Renaper [Api Manager - api_1a1].";
		}
	} catch(err) {
		console.log("[checkIdentidad]", err);
	}
	return resp;
};


export const getFirmanteByToken = async (req, res) => {
	let resp = {
		ok: true,
		msg: "",
		data: null,
		errores: []
	};

	try {
		let token = req.params.token;
		let idSolicitud = req.params.token.split("--")[1];
		resp.data = await query("SELECT * FROM firmantes WHERE idsolicitud = ? AND token = ?", [idSolicitud, token]);
	} catch (error) {
		resp.ok = false;
		resp.msg = error.message;
	}

	res.status(resp.ok ? 200 : 409).json(resp);
};

export const reSendMail = async (req, res) => {
	let resp = {
		ok: false,
		msg: "Ocurrió un error al intentar reenviar el mail.",
		data: null,
		errores: []
	};

	try {
		let id = req.params.id;
		let dataFirmante = await query("SELECT email, token FROM firmantes WHERE id = ?", [id]);
		dataFirmante = dataFirmante[0];
		let am = await getApiManagerData();
		let respMail = await sendMail(dataFirmante.email, dataFirmante.token, am.token);
		if(respMail.ok) {
			let tToken = respMail.respuestaTerin.ADDMSG_OK;
			await query("UPDATE firmantes SET mailid = ? WHERE id = ?", [tToken, id]);
			resp.ok = true;
			resp.msg = `Mail de solicitud de validación enviado a ${dataFirmante.email}`;
			resp.data = {
				...dataFirmante,
				mailid: tToken
			};
		}
	} catch (error) {
		console.log(error);
		resp.msg = error.message;
	}
	res.status(resp.ok ? 200 : 409).json(resp);
};

export const forceValidation = async (req, res) => {
	let resp = {
		ok: false,
		msg: "Ocurrió un error al intentar realizar la operación solicitada."
	};
	try {
		let id = req.params.id;
		let results = await query("UPDATE firmantes SET fechavalid = CURRENT_TIMESTAMP, idvalidacionestado = 3 WHERE id = ?", [id]);
		if(parseInt(results.rowsAffected[0], 10) === 1) {
			resp.ok = true;
			resp.msg = "Proceso concluido exitosamente.";
			results = await query("SELECT idsolicitud FROM firmantes WHERE id = ?", [id]);
			let checkSolId = results[0].idsolicitud;
			let check = await checkInitSign(checkSolId);
			if(check.ok) {
				resp.msg = "Se inició la solicitud de firmas.";
			}
		}
	} catch (error) {
		resp.msg = error.message;
	}
	res.status(resp.ok ? 200 : 409).json(resp);
};

export const setFirmanteRenaperByToken = async (req, res) => {
	let resp = {
		ok: false,
		msg: "Ocurrió un error al procesar la solicitud.",
		data: null,
		errores: []
	};
	if(!req.files) {
		resp.msg = "No se suministraron los archivos necesarios para la validación."
		res.status(409).json(resp);
		return;
	}
	if(req.files.length < 1) {
		resp.msg = "No se suministraron los archivos necesarios para la validación."
		res.status(409).json(resp);
		return;
	}
	try {
		let token = req.params.token;
		let idSolicitud = req.params.token.split("--")[1];
		let results = await query("SELECT id, sexo, dni, intentos FROM firmantes WHERE idsolicitud = ? AND token = ?", [idSolicitud, token]);
		let soliFirm = results[0];
		var dataFir = {
			id: soliFirm.id,
			sexo: soliFirm.sexo,
			dni: soliFirm.dni,
			intentos: parseInt(soliFirm.intentos, 10)
		};
		//let id = soliFirm[0].id;
		//let intentos = soliFirm[0].intentos;
		if(dataFir.intentos > 3) {
			resp.msg = "Número máximo de intentos para validar alcanzado.";
		} else {
			let selfie = req.files.filter(f => f.fieldname === "selfie")[0].buffer;
			let frente = req.files.filter(f => f.fieldname === "frente")[0].buffer;
			let dorso = req.files.filter(f => f.fieldname === "dorso")[0].buffer;
			let check = await checkIdentidad(dataFir.dni, selfie, dataFir.sexo);
			let idEstado = 1; //Pendiente
			if(check.ok) {
				if(parseInt(check.data.data.score, 10) > 60) {
					idEstado = 4;
				} else {
					if((dataFir.intentos + 1) === 3) {
						idEstado = 2;
					}
				}
			} else {
				resp.msg = check.msg;
			}
			await query(
				"UPDATE firmantes SET selfie = ?, frente = ?, dorso = ?, intentos = ?, fechavalid = GETDATE(), idvalidacionestado = ?, detalle = ? WHERE id = ?",
				[selfie, frente, dorso, (dataFir.intentos + 1), idEstado, JSON.stringify(check.data), dataFir.id]
			);
			if(idEstado === 4) {
				resp.ok = true;
			}
			resp.data = check.data.data;
			//Acá hay que ver el estado del trámite si ya todos se validaron hay que enviar a Adobe para las firma, se generan hojas en el PDF con los DNI?!!!
			//let estado = await checkInitSign(idSolicitud);
			//console.log(estado);
		}
	} catch (error) {
		resp.msg = error.message;
	}

	res.status(resp.ok ? 200 : 409).json(resp);
};