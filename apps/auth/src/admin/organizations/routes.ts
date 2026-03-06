import type { AppRouteObject } from "../routes";
import { AddOrganizationRoute } from "./routes/add-organization";
import { EditOrganizationRoute } from "./routes/edit-organization";
import { OrganizationsRoute } from "./routes/organizations";

const routes: AppRouteObject[] = [
    OrganizationsRoute,
    AddOrganizationRoute,
    EditOrganizationRoute
];

export default routes;
