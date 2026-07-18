import "../styles/emptystate.css";

const EmptyState = ({ icon: Icon, mensaje, variante = "vacio" }) => {

    return (

        <div className={`empty-state-block ${variante === "error" ? "empty-state-error" : ""}`}>

            <Icon size={26} />

            <p>{mensaje}</p>

        </div>

    );

};

export default EmptyState;
