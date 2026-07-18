const path = require("path");

// Se carga ANTES que cualquier archivo de test o el server —
// así, cuando server.js haga su propio require("dotenv").config(),
// estas variables ya están puestas y dotenv no las pisa
// (dotenv nunca sobreescribe una variable que ya existe).

require("dotenv").config({
    path: path.join(__dirname, "..", ".env.test")
});
