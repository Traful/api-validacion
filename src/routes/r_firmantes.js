import { Router } from "express";
import { getFirmanteByToken, reSendMail, forceValidation, setFirmanteRenaperByToken } from "../controllers/c_firmantes.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const rFirmantes = Router();

//[GET]

rFirmantes.get("/firmante/:token", getFirmanteByToken); //Datos de un firmante

rFirmantes.get("/firmante/:id/resendmail", reSendMail);

rFirmantes.get("/firmante/:id/force/validation", forceValidation);

//[POST]

rFirmantes.post("/firmante/:token/renaper", upload.any(), setFirmanteRenaperByToken);

export default rFirmantes;