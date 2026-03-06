import type { AppRouteObject } from "../routes";
import { EventsRoute, EventsRouteWithTab } from "./routes/events";

const routes: AppRouteObject[] = [EventsRoute, EventsRouteWithTab];

export default routes;
