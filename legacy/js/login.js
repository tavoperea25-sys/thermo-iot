async function login() {

    const correo = document.getElementById("correo").value;
    const password = document.getElementById("password").value;

    if (!correo || !password) {
        alert("Completa todos los campos");
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:3000/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    correo,
                    password
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "usuario",
                JSON.stringify(data.usuario)
            );

            window.location.href = "dashboard.html";

        } else {

            alert(data.mensaje);

        }

    } catch (error) {

        console.error(error);

        alert("No se pudo conectar con el servidor");

    }

}