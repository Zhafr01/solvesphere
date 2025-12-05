import { createContext, useContext, useState } from 'react';

const PartnerContext = createContext();

export const PartnerProvider = ({ children }) => {
    const [currentPartner, setCurrentPartner] = useState(null);

    return (
        <PartnerContext.Provider value={{ currentPartner, setCurrentPartner }}>
            {children}
        </PartnerContext.Provider>
    );
};

export const usePartner = () => useContext(PartnerContext);
