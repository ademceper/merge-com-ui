import type { AppRouteObject } from "../routes";
import { ClientScopeRoute } from "./routes/client-scope";
import { ClientScopesRoute } from "./routes/client-scopes";
import { MapperRoute } from "./routes/mapper";
import { NewClientScopeRoute } from "./routes/new-client-scope";

const routes: AppRouteObject[] = [
    NewClientScopeRoute,
    MapperRoute,
    ClientScopeRoute,
    ClientScopesRoute
];

export default routes;
