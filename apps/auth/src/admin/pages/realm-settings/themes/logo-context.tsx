import { type PropsWithChildren, useContext, useState } from "react";
import { createNamedContext } from "../../../../shared/keycloak-ui-shared";

type LogoContextProps = {
    logo: string;
    setLogo: (logo: string) => void;
};

const LogoPreviewContext = createNamedContext<LogoContextProps | undefined>(
    "LogoContext",
    undefined
);

export const usePreviewLogo = () => useContext(LogoPreviewContext);

export const LogoContext = ({ children }: PropsWithChildren) => {
    const [logo, setLogo] = useState("");

    return (
        <LogoPreviewContext.Provider value={{ logo, setLogo }}>
            {children}
        </LogoPreviewContext.Provider>
    );
};
