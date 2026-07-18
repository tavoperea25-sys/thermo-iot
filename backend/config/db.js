const mysql = require("mysql2");

// Un pool en vez de una sola conexión: si un query falla por un
// corte momentáneo de red (como el que puede pasar justo cuando
// MySQL todavía está terminando de arrancar en Docker), el pool
// simplemente abre una conexión nueva en el siguiente intento,
// en vez de quedar roto para siempre hasta reiniciar el backend.

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    decimalNumbers: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificación inicial, solo informativa — si falla acá, el pool
// igual sigue disponible y reintentará solo en el próximo query.

pool.getConnection((err, connection) => {

    if (err) {
        console.error("Aviso: no se pudo verificar la conexión inicial a MySQL:", err.message);
        return;
    }

    console.log("✅ Conectado correctamente a MySQL");
    connection.release();

});

module.exports = pool;
