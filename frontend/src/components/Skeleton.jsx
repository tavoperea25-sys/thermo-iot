import "../styles/skeleton.css";

const Skeleton = ({ width, height = "16px", radius = "6px", style = {} }) => {

    return (

        <div
            className="skeleton"
            style={{
                width: width || "100%",
                height,
                borderRadius: radius,
                ...style
            }}
        />

    );

};

export default Skeleton;
