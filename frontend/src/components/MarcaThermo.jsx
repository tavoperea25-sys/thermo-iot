const MarcaThermo = ({ size = 36 }) => (

    <svg
        className="marca-thermo"
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect width="36" height="36" rx="10" fill="var(--ember-soft)" />
        <path
            d="M15 9a3 3 0 0 1 6 0v10.28a5 5 0 1 1-6 0V9Z"
            stroke="var(--ember)"
            strokeWidth="1.6"
        />
        <circle cx="18" cy="24" r="2.4" fill="var(--ember)" />
    </svg>

);

export default MarcaThermo;
