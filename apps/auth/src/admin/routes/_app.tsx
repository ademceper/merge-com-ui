import { createFileRoute } from "@tanstack/react-router";
import { App } from "../app/app";

export const Route = createFileRoute("/_app")({
    component: App
});
