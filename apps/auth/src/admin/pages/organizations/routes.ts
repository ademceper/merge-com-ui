import type { AppRouteObject } from "../../app/routes";
import { AddOrganizationRoute } from "./routes/add-organization";
import { EditOrganizationRoute } from "./routes/edit-organization";
import { OrganizationsRoute } from "./routes/organizations";

const routes: AppRouteObject[] = [
    OrganizationsRoute,
    AddOrganizationRoute,
    EditOrganizationRoute
];

export default routes;
