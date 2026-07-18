const calcularFortaleza = (password) => {

    if (!password) return 0;

    let puntos = 0;

    if (password.length >= 6) puntos += 1;
    if (password.length >= 10) puntos += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) puntos += 1;
    if (/[0-9]/.test(password)) puntos += 1;
    if (/[^a-zA-Z0-9]/.test(password)) puntos += 1;

    return puntos;

};

const niveles = [
    { min: 0, label: "", clase: "" },
    { min: 1, label: "Débil", clase: "fuerza-debil" },
    { min: 3, label: "Media", clase: "fuerza-media" },
    { min: 4, label: "Fuerte", clase: "fuerza-fuerte" }
];

const obtenerNivel = (puntos) => {

    return niveles
        .slice()
        .reverse()
        .find((n) => puntos >= n.min);

};

const PasswordStrength = ({ password }) => {

    if (!password) return null;

    const puntos = calcularFortaleza(password);
    const nivel = obtenerNivel(puntos);

    return (

        <div className="password-strength">

            <div className="password-strength-barras">

                {[0, 1, 2, 3].map((i) => (

                    <span
                        key={i}
                        className={`password-strength-barra ${i < puntos ? nivel.clase : ""}`}
                    />

                ))}

            </div>

            <span className={`password-strength-label ${nivel.clase}`}>
                {nivel.label}
            </span>

        </div>

    );

};

export default PasswordStrength;
