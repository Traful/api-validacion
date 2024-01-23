import mysql from "mysql2/promise";
import {
	DB_USER,
	DB_PWD,
	DB_NAME,
	DB_SERVER,
	DB_PORT
} from "./../config.js";

export const getConnection = async () => {
	let connection = null;
	let pool = null;
	try {
		pool = mysql.createPool({
			host: DB_SERVER,
			user: DB_USER,
			database: DB_NAME,
			port: DB_PORT,
			password: DB_PWD
		});
		connection = await pool.getConnection();
	} catch(error) {
		console.error(error);
	}
	return [pool, connection];
};

export const query = async (sql, params) => {
	try {
		const [pool, connection] = await getConnection();
		const [rows, fields] = await connection.execute(sql, params);
		pool.releaseConnection(connection);
		connection.release();
		return rows;
	} catch(error) {
		console.log(error);
	}
	return null;
};