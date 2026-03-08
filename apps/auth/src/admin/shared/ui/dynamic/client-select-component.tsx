import { ClientSelect } from "../client/client-select";
import type { ComponentProps } from "./components";

export const ClientSelectComponent = (props: ComponentProps) => (
    <ClientSelect {...props} name={props.convertToName(props.name!)} />
);
