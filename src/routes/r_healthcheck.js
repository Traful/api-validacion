import { Router } from "express";

const rHealthcheck = Router();

//[GET]

rHealthcheck.get("/healthcheck", async (req, res) => {
	let resp = {
		ok: true,
		msg: "Api - Validación de Identidad"
	};
	res.status(resp.ok ? 200 : 409).json(resp);
});

export default rHealthcheck;