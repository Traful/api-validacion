import { APIM_URL_L, APIM_URL_R, APIM_KEY, APIM_NAME, APIM_PASS } from "./../config.js";

const obtenerHoraActual = () => {
	const ahora = new Date();
	let horas = ahora.getHours();
	let minutos = ahora.getMinutes();
	let segundos = ahora.getSeconds();
	horas = horas < 10 ? "0" + horas : horas;
	minutos = minutos < 10 ? "0" + minutos : minutos;
	segundos = segundos < 10 ? "0" + segundos : segundos;
	return horas + ":" + minutos + ":" + segundos;
};
  
export const getApiManagerData = async (token = null) => {
	let td = {
		ok: false,
		status: "Error al obtener datos de API Manager",
		time: "00:00:00",
		exp: null,
		token: null,
		data: null
	};

	//Body
	let data = { 
		device: {
			bloqueado: false,
			recordar: false,
			deviceid: "{device id del dispositivo móvil}",
			messagingid: "{messaging ID del dispositivo móvil}",
			devicename: "{Nombre del dispositivo}"
		}
	};

	if(!token) {
		data = {
			...data,
			apiKey: APIM_KEY,
			usrLoginName: APIM_NAME,
			password: APIM_PASS
		};
	}

	//headers
	let headers = new Headers();
	headers.append("Accept", "application/json");
	headers.append("Content-Type", "application/json");

	if(token) {
		headers.append("Authorization", token);
	}

	//Call [POST]
	try {
		let resp = await fetch(token ? APIM_URL_R : APIM_URL_L, {
			method: "POST",
			headers: headers,
			body: JSON.stringify(data)
		});

		if(resp.ok) {
			let json = await resp.json();
			td = {
				ok: true,
				status: "Api Manager Ok",
				time: obtenerHoraActual(),
				exp: json.exp,
				token: "Bearer " + json.token,
				data: json
			};
		} else {
			console.log(resp);
		}
	} catch(error) {
		console.log(error);
	}

	return td;
};