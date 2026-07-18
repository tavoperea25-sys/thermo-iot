import { createContext, useContext, useState } from "react";

const DemoContext = createContext(null);

export const DemoProvider = ({ children }) => {

    const [demoActivo, setDemoActivo] = useState(
        localStorage.getItem("demo_activo") === "1"
    );

    const alternarDemo = () => {

        setDemoActivo((actual) => {

            const nuevo = !actual;

            if (nuevo) {
                localStorage.setItem("demo_activo", "1");
            } else {
                localStorage.removeItem("demo_activo");
            }

            return nuevo;

        });

    };

    return (

        <DemoContext.Provider value={{ demoActivo, alternarDemo }}>
            {children}
        </DemoContext.Provider>

    );

};

export const useDemo = () => useContext(DemoContext);
