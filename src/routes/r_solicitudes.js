import { Router } from "express";
import { getSolicitudes, getSolicitudesByEstado, getSolicitud, getFirmantesByIdSolicitud, postSolicitud, deleteSolicitud } from "../controllers/c_solicitudes.js";

const rSolicitudes = Router();

//[GET]

rSolicitudes.get("/solicitudes", getSolicitudes); //Todas las solicitudes
rSolicitudes.get("/solicitudes/estado/:id", getSolicitudesByEstado); //Todas las solicitudes en un estado en particular
rSolicitudes.get("/solicitud/:id", getSolicitud); //Una solicitud en particular
rSolicitudes.get("/solicitud/:id/firmantes", getFirmantesByIdSolicitud);

//[POST]
rSolicitudes.post("/solicitud", postSolicitud); //Ingresar una nueva solicitud

//[DELETE]
rSolicitudes.delete("/solicitud/:id", deleteSolicitud); //Ingresar una nueva solicitud

export default rSolicitudes;