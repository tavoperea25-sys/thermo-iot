import "../styles/statcard.css";

const StatCard = ({
    title,
    value,
    color = "var(--ember)"
}) => {

    return (

        <div className="stat-card">

            <div
                className="stat-color"
                style={{
                    background: color
                }}
            />

            <div className="stat-info">

                <span className="stat-title">
                    {title}
                </span>

                <h2 className="stat-value">
                    {value}
                </h2>

            </div>

        </div>

    );

};

export default StatCard;