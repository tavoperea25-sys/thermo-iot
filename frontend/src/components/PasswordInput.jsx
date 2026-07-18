import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const PasswordInput = ({ id, value, onChange, placeholder, required, autoComplete }) => {

    const [visible, setVisible] = useState(false);

    return (

        <div className="password-input-wrapper">

            <input
                id={id}
                type={visible ? "text" : "password"}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                autoComplete={autoComplete}
            />

            <button
                type="button"
                className="password-toggle"
                onClick={() => setVisible(!visible)}
                tabIndex={-1}
                title={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
                {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>

        </div>

    );

};

export default PasswordInput;
