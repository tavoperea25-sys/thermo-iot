import { Component } from "react";
import { AlertOctagon } from "lucide-react";

import "../styles/errorboundary.css";

class ErrorBoundary extends Component {

    constructor(props) {

        super(props);

        this.state = { conError: false };

    }

    static getDerivedStateFromError() {

        return { conError: true };

    }

    componentDidCatch(error, info) {

        // Se deja en consola para poder diagnosticar durante desarrollo
        // o al revisar el navegador en la sustentación.

        console.error("Error atrapado por ErrorBoundary:", error, info);

    }

    render() {

        if (this.state.conError) {

            return (

                <div className="error-boundary">

                    <AlertOctagon size={40} className="error-boundary-icono" />

                    <h1>Algo salió mal</h1>

                    <p>
                        Ocurrió un error inesperado en la aplicación.
                        Intenta recargar la página — si el problema
                        persiste, revisa la consola del navegador.
                    </p>

                    <button onClick={() => window.location.reload()}>
                        Recargar página
                    </button>

                </div>

            );

        }

        return this.props.children;

    }

}

export default ErrorBoundary;
