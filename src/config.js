import { config } from "dotenv";

config();

//window._env_?.API_KEY

//Propias del sistema
export const API_JWT_KEY = process.env?.API_JWT_KEY || "example_key";
export const FRONT_HOST = process.env?.FRONT_HOST || "http://localhost:3000";

//DB (MySQL)
export const DB_USER = process.env?.DB_USER || "root";
export const DB_PWD = process.env?.DB_PWD || "";
export const DB_NAME = process.env?.DB_NAME || "validacion";
export const DB_SERVER = process.env?.DB_SERVER || "localhost";
export const DB_PORT = process.env?.DB_PORT || 3306;

//Api Manager
export const APIM_URL_L = process.env?.APIM_URL_L || "ERROR!";
export const APIM_URL_R = process.env?.APIM_URL_R || "ERROR!";
export const APIM_KEY = process.env?.APIM_KEY || "ERROR!";
export const APIM_NAME = process.env?.APIM_NAME || "ERROR!";
export const APIM_PASS = process.env?.APIM_PASS || "ERROR!";

//Terin (Api Manager)
export const APIM_TERIN_URL = process.env?.APIM_TERIN_URL || "ERROR!";
export const APIM_TERIN_TEMPLATE = process.env?.APIM_TERIN_TEMPLATE || "Validacion_de_identidad.html";
//Renaper (Api Manager)
export const APIM_RENAPER_URL = process.env?.APIM_RENAPER_URL || "ERROR!";