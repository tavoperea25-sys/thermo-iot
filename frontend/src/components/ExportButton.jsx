import { Download } from "lucide-react";

import "../styles/exportbutton.css";

const ExportButton = ({ onClick, disabled }) => {

    return (

        <button
            className="export-btn"
            onClick={onClick}
            disabled={disabled}
            title={disabled ? "No hay datos para exportar todavía" : "Exportar a CSV"}
        >
            <Download size={16} />
            Exportar CSV
        </button>

    );

};

export default ExportButton;
