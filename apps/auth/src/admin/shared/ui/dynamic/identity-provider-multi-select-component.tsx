import type { ComponentProps } from "./components";
import { IdentityProviderSelect } from "../identity-provider/identity-provider-select";

export const IdentityProviderMultiSelectComponent = (props: ComponentProps) => (
    <IdentityProviderSelect
        {...props}
        convertToName={props.convertToName}
        name={props.name!}
    />
);
