import { createContext, useContext, useState } from "react";

const TourContext = createContext(null);

export const TourProvider = ({ children }) => {

    const [solicitudId, setSolicitudId] = useState(0);

    const iniciarTour = () => {
        setSolicitudId((id) => id + 1);
    };

    return (

        <TourContext.Provider value={{ solicitudId, iniciarTour }}>
            {children}
        </TourContext.Provider>

    );

};

// eslint-disable-next-line react-refresh/only-export-components
export const useTour = () => useContext(TourContext);
