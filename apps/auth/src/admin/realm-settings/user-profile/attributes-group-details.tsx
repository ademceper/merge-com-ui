import AttributesGroupForm from "./attributes-group-form";
import { UserProfileProvider } from "./user-profile-context";

const AttributesGroupDetails = () => (
    <UserProfileProvider>
        <AttributesGroupForm />
    </UserProfileProvider>
);

export default AttributesGroupDetails;
