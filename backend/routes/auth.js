const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verificarToken = require("../middleware/authMiddleware");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimiter");
const { manejarErrorServidor } = require("../utils/errores");

// ================= REGISTRO =================
router.post("/register", registerLimiter, async (req, res) => {

    const { nombre, correo, usuario, password } = req.body;

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO usuarios
            (nombre, correo, usuario, password)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [nombre, correo, usuario, hashedPassword],
            (err, result) => {

                if (err) {
                    return manejarErrorServidor(res, err, "No se pudo registrar el usuario");
                }

                res.json({
                    mensaje: "Usuario registrado correctamente"
                });
            }
        );

    } catch (error) {
        manejarErrorServidor(res, error, "No se pudo registrar el usuario");
    }
});


// ================= LOGIN =================
router.post("/login", loginLimiter, (req, res) => {

    const { correo, password } = req.body;

    const sql = `
        SELECT * FROM usuarios
        WHERE correo = ?
    `;

    db.query(sql, [correo], async (err, results) => {

        if (err) {
            return manejarErrorServidor(res, err, "Error del servidor");
        }

        if (results.length === 0) {
            return res.status(401).json({
                mensaje: "Usuario no encontrado"
            });
        }

        const usuario = results[0];

        const passwordCorrecta = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!passwordCorrecta) {
            return res.status(401).json({
                mensaje: "Contraseña incorrecta"
            });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                correo: usuario.correo
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );

        res.json({
            mensaje: "Login exitoso",
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo
            }
        });

    });

});

// ================= OBTENER PERFIL =================
router.get("/me", verificarToken, (req, res) => {

    const sql = `
        SELECT id, nombre, correo, usuario
        FROM usuarios
        WHERE id = ?
    `;

    db.query(sql, [req.usuario.id], (err, results) => {

        if (err) {
            return manejarErrorServidor(res, err, "Error del servidor");
        }

        if (results.length === 0) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        res.json(results[0]);

    });

});


// ================= ACTUALIZAR PERFIL =================
router.put("/perfil", verificarToken, (req, res) => {

    const { nombre, correo } = req.body;

    const sql = `
        UPDATE usuarios
        SET nombre = ?, correo = ?
        WHERE id = ?
    `;

    db.query(sql, [nombre, correo, req.usuario.id], (err) => {

        if (err) {
            return manejarErrorServidor(res, err, "No se pudo actualizar el perfil");
        }

        res.json({
            mensaje: "Perfil actualizado correctamente",
            usuario: {
                id: req.usuario.id,
                nombre,
                correo
            }
        });

    });

});


// ================= CAMBIAR CONTRASEÑA =================
router.put("/password", verificarToken, (req, res) => {

    const { passwordActual, passwordNueva } = req.body;

    const sql = `SELECT password FROM usuarios WHERE id = ?`;

    db.query(sql, [req.usuario.id], async (err, results) => {

        if (err) {
            return manejarErrorServidor(res, err, "Error del servidor");
        }

        if (results.length === 0) {
            return res.status(404).json({
                mensaje: "Usuario no encontrado"
            });
        }

        const passwordCorrecta = await bcrypt.compare(
            passwordActual,
            results[0].password
        );

        if (!passwordCorrecta) {
            return res.status(401).json({
                mensaje: "La contraseña actual no es correcta"
            });
        }

        const nuevoHash = await bcrypt.hash(passwordNueva, 10);

        db.query(
            `UPDATE usuarios SET password = ? WHERE id = ?`,
            [nuevoHash, req.usuario.id],
            (errUpdate) => {

                if (errUpdate) {
                    return manejarErrorServidor(res, errUpdate, "No se pudo actualizar la contraseña");
                }

                res.json({
                    mensaje: "Contraseña actualizada correctamente"
                });

            }
        );

    });

});

module.exports = router;
