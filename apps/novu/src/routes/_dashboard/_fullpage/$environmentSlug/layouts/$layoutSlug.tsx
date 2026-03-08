import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const EditLayoutPage = lazy(
	() => import("@/pages/layouts/ui/edit-layout"),
);

export const Route = createFileRoute(
	"/_dashboard/_fullpage/$environmentSlug/layouts/$layoutSlug",
)({
	component: EditLayoutPage,
});
