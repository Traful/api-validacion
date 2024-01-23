//import { getConnection } from "./../database/connection.js";
import { query } from "./../database/connection.js";

//import { ADOBE_API_USER, ADOBE_AUTH_TOKEN, ADOBE_BASE_URL, APIM_TERIN_URL, APIM_TERIN_TEMPLATE, FRONT_HOST } from "./../config.js";
import { APIM_TERIN_URL, APIM_TERIN_TEMPLATE, FRONT_HOST } from "./../config.js";

//import fs from "fs";

export const getSolicitudState = async (idSolicitud) => {
	let resp = {
		ok: false,
		msg: "Ocurrió un error al intentar verificar el estado de la solicitud.",
		idsolicitud: 0,
		fecha: null,
		idestado: 0,
		estado: ""
	};
	try {
		//Estado de la solicitud
		let results = await query(
			`
				SELECT
					sol.id,
					sol.idestado,
					sol.f_estado,
					est.descripcion 
				FROM DB_Onboarding.dbo.solicitudes sol
				LEFT JOIN DB_Onboarding.dbo.estados est ON	
					est.id = sol.idestado 
				WHERE
				sol.id = ?
			`,
			[idSolicitud]
		);
		resp = {
			ok: true,
			msg: "",
			idsolicitud: results[0].id,
			fecha: results[0].f_estado,
			idestado: results[0].idestado,
			estado: results[0].descripcion
		};
	} catch (error) {
		resp.msg = error.message;
	}
	return resp;
};

export const checkValidacionesIdentidad = async (idSolicitud) => {
	let resp = {
		ok: true,
		msg: "",
		pendientes: false,
		cantidad: 0,
	};
	try {
		//Estado de la solicitud
		let eSol = await getSolicitudState(idSolicitud);
		if(parseInt(eSol.idestado, 10) === 1) {
			//Verificar si hay solicitudes de validación de identidad pendientes
			let results = await query(
				`
					SELECT
						COUNT(*) AS faltan
					FROM DB_Onboarding.dbo.firmantes
					WHERE
						idvalidacionestado = 1
						AND idsolicitud = @idsolicitud
				`,
				[idSolicitud]
			)
			if(parseInt(results[0].faltan, 10) > 0) {
				resp = {
					...resp,
					pendientes: true,
					cantidad: results[0].faltan
				};
			}
		}
	} catch (error) {
		resp = {
			...resp,
			ok: false,
			msg: error.message
		};
	}
	return resp;
};

export const checkInitSign = async (idSolicitud) => {
	let resp = {
		ok: false,
		msg: ""
	};
	return resp; //Que no pase a Adobe por ahora por los SMS 29/08/2023!!!

	let val = await checkValidacionesIdentidad(idSolicitud);
	if(val.ok && !val.pendientes) {
		//Chequear si no tiene un Id del servicio de firma
		let pool = await getConnection();
		let results = await pool.request()
			.input("id", idSolicitud)
			.query(`
				SELECT
					id,
					idsign
				FROM DB_Onboarding.dbo.solicitudes
				WHERE
					id = @id
			`);
		if(!results.recordset[0].idsign) {
			//Armado del cuerpo de la solicitud a Adobe Sign
			try {
				//Datos de la Solicitud
				results = await pool.request()
					.input("id", idSolicitud)
					.query(`
						SELECT
							sol.id,
							sol.workflowid,
							sol.adobename,
							sol.adobemessage 
						FROM DB_Onboarding.dbo.solicitudes sol
						WHERE
							sol.id = @id
					`);
				let body = {
					workflowId: results.recordset[0].workflowid,
					signatureType: "ESIGN",
					state: "IN_PROCESS",
					name: results.recordset[0].adobename, 
					message: results.recordset[0].adobemessage,
					fileInfos: null,
					participantSetsInfo: null
				};
				//Archivos
				results = await pool.request()
					.input("id", idSolicitud)
					.query(`
						SELECT
							name,
							label,
							originalname,
							extension,
							mimetype,
							buffer 
						FROM DB_Onboarding.dbo.documentos doc
						WHERE
							doc.idsolicitud = @id
					`);
				let archivos = await Promise.all(
					results.recordset.map(async (a) => {
						let formdata = new FormData();
						formdata.append("File-Name", `${a.originalname}.${a.extension}`);
						formdata.append("Mime-Type", a.mimetype);
						let buffer = Buffer.from(a.buffer, "base64");
						let xFile = new File([buffer], `${a.originalname}.${a.extension}`, {
							type: a.mimetype,
						});
						formdata.append("File", xFile);
						let Adobe = await fetch(`${ADOBE_BASE_URL}transientDocuments`, {
							method: "POST",
							body: formdata,
							headers: {
								"x-api-user": ADOBE_API_USER,
								"Authorization": "Bearer " + ADOBE_AUTH_TOKEN
							}
						});
						let jsonAdobe = await Adobe.json();
						return ({
							name: a.name,
							label: a.label,
							transientDocumentId: jsonAdobe.transientDocumentId
						});
					})
				);
				body.fileInfos = archivos;
				//Firmantes
				results = await pool.request()
					.input("id", idSolicitud)
					.query(`
						SELECT
							fir.frole,
							fir.label,
							fir.authenticationmethod,
							fir.email,
							fir.phone 
						FROM DB_Onboarding.dbo.firmantes fir
						WHERE
							fir.idsolicitud = @id
					`);
				let firmantes = results.recordset.map(f => {
					let sec = {
						authenticationMethod: f.authenticationmethod
					};
					if(f.authenticationmethod !== "NONE") {
						sec.phoneInfo = {
							countryIsoCode: "AR",
							countryCode: "+54",
							phone: f.phone
						}
					};
					return ({
						label: f.label,
						memberInfos: [
							{
								email: f.email,
								securityOption: sec
							}
						],
						order: 1,
						role: f.frole
					});
				});
				body.participantSetsInfo = firmantes;

				//Carga de la solicitud en adobe
				let Adobe = await fetch(`${ADOBE_BASE_URL}agreements`, {
					method: "POST",
					body: JSON.stringify(body),
					headers: {
						"x-api-user": ADOBE_API_USER,
						"Authorization": "Bearer " + ADOBE_AUTH_TOKEN,
						"Content-Type": "application/json"
					}
				});
				let jsonAdobe = await Adobe.json();
				if(jsonAdobe.hasOwnProperty("id")) { //Se dió de alta!
					results = await pool.request()
						.input("idsign", jsonAdobe.id)
						.input("id", idSolicitud)
						.query("UPDATE DB_Onboarding.dbo.solicitudes SET idsign = @idsign WHERE id = @id");
					resp.ok = true;
					resp.msg = jsonAdobe.id
				} else { //Ocurrió un error
					if(jsonAdobe.hasOwnProperty("code") && jsonAdobe.hasOwnProperty("message")) {
						resp.msg = `Ocurrió un error al enviar la solicitud de firma (${jsonAdobe.code} :: ${jsonAdobe.message})`;
					} else {
						resp.msg = `Ocurrió un error al enviar la solicitud de firma`;
					}
				}
			} catch(error) {
				console.log(error);
				resp.msg = `Todos los firmantes están validados, pero ocurrió un error al inciar la solicitud!`;
			}
		} else {
			resp.msg = `La solicitud ya tiene asignado el id de firma: ${results.recordset[0].idsign}`;
		}
	} else {
		resp.msg = "El estado de la solicitud no es el adecuado o se adeudan validaciones de identidad";
	}
	return resp;
};

/*
export const archivoPdf = async (idSolicitud) => {
	//Archivos
	let pool = await getConnection();
	let results = await pool.request()
		.input("id", idSolicitud)
		.query(`
			SELECT
				name,
				label,
				originalname,
				extension,
				mimetype,
				buffer 
			FROM DB_Onboarding.dbo.documentos doc
			WHERE
				doc.idsolicitud = @id
		`);
	console.log(results.recordset);
	let archivos = await Promise.all(
		results.recordset.map(async (a) => {
			let formdata = new FormData();
			formdata.append("File-Name", `${a.originalname}.${a.extension}`);
			formdata.append("Mime-Type", a.mimetype);
			formdata.append("File", a.buffer);

			var buffer = Buffer.from(a.buffer, "base64");
			//fs.writeFileSync('./caca.pdf', buffer);

			const file = new File([buffer], "foo.pdf", {
				type: a.mimetype,
			});

			console.log(file);

			return "AAAaaa";
		})
	);
	return archivos;
};
*/

export const sendMail = async (to, token, amToken) => {
	let resp = {
		ok: false,
		msg: "Ocurrió un error al comunicarse con Terin.",
		respuestaTerin: null
	};
	try {
		let headers = {
			"Authorization": amToken
		};
		let body = {
			to: to,
			template: APIM_TERIN_TEMPLATE,
			subject: "Prueba (Hans) - Regla Api Manager Terin",
			custom: [
				{
					name: "link",
					value: `${FRONT_HOST}/validate/${token}`
				}
			]
		};
		//console.log(APIM_TERIN_URL, headers, body);
		let respTerin = await fetch(APIM_TERIN_URL, {
			method: "POST",
			headers: headers,
			body: JSON.stringify(body)
		});
		let json = await respTerin.json();
		if(respTerin.ok) {
			resp.ok = true;
			resp.msg = `Mail enviado a Terin para ${to}.`;
		}
		resp.respuestaTerin = json;
	} catch(error) {
		console.log(error);
	};
	return resp;
};

export const removerUltimaOcurrencia = (originalString, stringARemover) => {
	const ultimaPosicion = originalString.lastIndexOf(stringARemover);
	if (ultimaPosicion === -1) {
		return originalString;
	} else {
		return originalString.slice(0, ultimaPosicion) + originalString.slice(ultimaPosicion + stringARemover.length);
	}
};