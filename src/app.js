import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

import { API_JWT_KEY } from "./config.js";

import swaggerUI from "swagger-ui-express";
import swaggerSpec from "./openapi.json" assert { type: "json" };

// Rutas
import rLogin from "./routes/r_login.js";
import rUsers from "./routes/r_users.js";
import rSolicitudes from "./routes/r_solicitudes.js";
import rFirmantes from "./routes/r_firmantes.js";

import rHealthcheck from "./routes/r_healthcheck.js";

const app = express();

// Settings
app.set("API_PORT", process.env?.PORT || 3001);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(express.multipart());

app.use(cors({
	origin: "*",
	methods: ["GET","POST","DELETE","UPDATE","PUT","PATCH"]
}));

app.use((req, res, next) => {
	console.log(`[${req.method}] From: ${req.ip} - To: ${req.hostname}:${API_PORT}${req.originalUrl}`);
	next();
});

const base = "/api";
//const base = "";

app.use((req, res, next) => {
	let authorized = [`${base}/login`, `${base}/healthcheck`];
	if(authorized.includes(req.originalUrl) || req.originalUrl.startsWith(`${base}/token/validate/`) || req.originalUrl.startsWith(`${base}/firmante/`) || req.originalUrl.startsWith(`${base}/docs`)) {
		next();
		return;
	}

	if(!req.headers["authorization"]) {
		res.status(401).json({
			ok: false,
			msg: "Unauthorized."
		});
		return;
	}

	var authHeader = req.headers["authorization"];
	
	if(authHeader.startsWith("Bearer")) {
		authHeader = authHeader.split(" ")[1];
	}

	//Authorization: Bearer JWT_ACCESS_TOKEN
	//const token = authHeader && authHeader.split(" ")[1];
	const token = authHeader;

	if(token === null) {
		res.status(401).json({
			ok: false,
			msg: "Unauthorized."
		});
		return;
	}

	jwt.verify(token, API_JWT_KEY, (err, user) => {
		if(err) {
			res.status(401).json({
				ok: false,
				msg: `${err.name} - ${err.message}`
			});
		} else {
			req.user = user.data;
			next();
		}
	});
});

// Rutas
if(base.length > 0) {
	app.use(base, rLogin);
	app.use(base, rUsers);
	app.use(base, rSolicitudes);
	app.use(base, rFirmantes);
	app.use(base, rHealthcheck);
} else {
	app.use(rLogin);
	app.use(rUsers);
	app.use(rSolicitudes);
	app.use(rFirmantes);
	app.use(rHealthcheck);
}

//Swagger
app.use(`${base}/docs`, swaggerUI.serve, swaggerUI.setup(swaggerSpec));

export default app;