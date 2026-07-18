import { AlertTriangle } from "lucide-react";

import "../styles/confirmmodal.css";

const ConfirmModal = ({

    titulo,
    mensaje,
    textoConfirmar = "Eliminar",
    procesando = false,
    onConfirmar,
    onCancelar

}) => {

    return (

        <div className="confirm-overlay" onClick={onCancelar}>

            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>

                <AlertTriangle size={28} className="confirm-icono" />

                <h3>{titulo}</h3>

                <p>{mensaje}</p>

                <div className="confirm-botones">

                    <button
                        className="confirm-btn-cancelar"
                        onClick={onCancelar}
                        disabled={procesando}
                    >
                        Cancelar
                    </button>

                    <button
                        className="confirm-btn-confirmar"
                        onClick={onConfirmar}
                        disabled={procesando}
                    >
                        {procesando ? "Eliminando..." : textoConfirmar}
                    </button>

                </div>

            </div>

        </div>

    );

};

export default ConfirmModal;
