import { ClientRegistrationList } from "./ClientRegistrationList";

type ClientRegistrationProps = {
    subTab?: string;
};

export const ClientRegistration = ({ subTab = "anonymous" }: ClientRegistrationProps) => {
    const subType = subTab === "authenticated" ? "authenticated" : "anonymous";

    return <ClientRegistrationList subType={subType} />;
};
