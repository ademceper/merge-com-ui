import "@merge-rd/ui/globals.css";

import { KeycloakProvider } from "@merge-rd/auth";
import { Providers } from "@merge-rd/ui/components/providers";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import { FeatureFlagsProvider } from "./context/feature-flags-provider";
import { initializeSentry } from "@/shared/lib/sentry";
import { overrideZodErrorMap } from "@/shared/lib/validation";

initializeSentry();
overrideZodErrorMap();

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<KeycloakProvider
			issuerUri={import.meta.env.VITE_OIDC_ISSUER_URI}
			clientId={import.meta.env.VITE_OIDC_CLIENT_ID}
			fallback={
				<div className="flex h-svh items-center justify-center">Loading...</div>
			}
		>
			<Providers>
				<FeatureFlagsProvider>
					<RouterProvider router={router} />
				</FeatureFlagsProvider>
			</Providers>
		</KeycloakProvider>
	</StrictMode>,
);
