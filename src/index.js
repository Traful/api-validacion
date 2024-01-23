import app from "./app.js";

app.listen(app.get("API_PORT"), () => {
	console.log(`Api-Identidad escuchando en el puerto: ${app.get("API_PORT")}`)
});