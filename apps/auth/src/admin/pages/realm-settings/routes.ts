import type { AppRouteObject } from "../../app/routes";
import { AddAttributeRoute } from "./routes/add-attribute";
import { AddClientPolicyRoute } from "./routes/add-client-policy";
import { AddClientProfileRoute } from "./routes/add-client-profile";
import { NewClientPolicyConditionRoute } from "./routes/add-condition";
import { AddExecutorRoute } from "./routes/add-executor";
import { AttributeRoute } from "./routes/attribute";
import { ClientPoliciesRoute } from "./routes/client-policies";
import { ClientProfileRoute } from "./routes/client-profile";
import { EditAttributesGroupRoute } from "./routes/edit-attributes-group";
import { EditClientPolicyRoute } from "./routes/edit-client-policy";
import { EditClientPolicyConditionRoute } from "./routes/edit-condition";
import { ExecutorRoute } from "./routes/executor";
import { KeyProviderFormRoute } from "./routes/key-provider";
import { KeysRoute } from "./routes/keys-tab";
import { NewAttributesGroupRoute } from "./routes/new-attributes-group";
import { RealmSettingsRoute, RealmSettingsRouteWithTab } from "./routes/realm-settings";
import { ThemeTabRoute } from "./routes/themes-tab";
import { UserProfileRoute } from "./routes/user-profile";

const routes: AppRouteObject[] = [
    RealmSettingsRoute,
    RealmSettingsRouteWithTab,
    KeysRoute,
    KeyProviderFormRoute,
    ClientPoliciesRoute,
    AddClientProfileRoute,
    AddExecutorRoute,
    ClientProfileRoute,
    ExecutorRoute,
    AddClientPolicyRoute,
    EditClientPolicyRoute,
    NewClientPolicyConditionRoute,
    EditClientPolicyConditionRoute,
    UserProfileRoute,
    AddAttributeRoute,
    AttributeRoute,
    NewAttributesGroupRoute,
    EditAttributesGroupRoute,
    ThemeTabRoute
];

export default routes;
