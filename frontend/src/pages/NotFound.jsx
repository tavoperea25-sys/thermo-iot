import { Link } from "react-router-dom";

import "../styles/notfound.css";

const NotFound = () => {
    return (
        <div className="notfound-page">

            <span className="notfound-code">404</span>

            <h1 className="page-title">Página no encontrada</h1>

            <p className="page-subtitle">
                La ruta que buscas no existe o fue movida.
            </p>

            <Link to="/" className="notfound-link">
                Volver al Dashboard
            </Link>

        </div>
    );
};

export default NotFound;
