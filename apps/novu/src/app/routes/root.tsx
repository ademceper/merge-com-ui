import { ErrorBoundary, withProfiler } from "@sentry/react";
import {
	QueryCache,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Outlet } from "react-router-dom";
import { ToastIcon } from "@/shared/ui/primitives/sonner";
import { showToast } from "@/shared/ui/primitives/sonner-helpers";
import { TooltipProvider } from "@/shared/ui/primitives/tooltip";
import { EscapeKeyManagerProvider } from "@/app/context/escape-key-manager/escape-key-manager";
import { SegmentProvider } from "@/app/context/segment";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
		},
	},
	queryCache: new QueryCache({
		onError: (error, query) => {
			if (query.meta?.showError !== false) {
				showToast({
					children: () => (
						<>
							<ToastIcon variant="error" />
							<span className="text-sm">
								{(query.meta?.errorMessage as string | undefined) ||
									error.message ||
									"Issue fetching."}
							</span>
						</>
					),
					options: {
						position: "bottom-right",
						classNames: {
							toast: "mb-4 right-0",
						},
					},
				});
			}
		},
	}),
});

const RootRouteInternal = () => {
	return (
		<ErrorBoundary
			fallback={({ error, eventId }) => (
				<>
					We apologize, but something unexpected happened. <br />
					Please try refreshing the page.
					<br />
					<code>
						<small style={{ color: "lightGrey" }}>
							Event ID: {eventId}
							<br />
							{(error as object).toString()}
						</small>
					</code>
				</>
			)}
		>
			<QueryClientProvider client={queryClient}>
				<SegmentProvider>
					<HelmetProvider>
						<TooltipProvider delayDuration={100}>
							<EscapeKeyManagerProvider>
								<Outlet />
							</EscapeKeyManagerProvider>
						</TooltipProvider>
					</HelmetProvider>
				</SegmentProvider>
			</QueryClientProvider>
		</ErrorBoundary>
	);
};

export const RootRoute = withProfiler(RootRouteInternal);
