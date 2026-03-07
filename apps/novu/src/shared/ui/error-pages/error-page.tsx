import { useRouterState } from "@tanstack/react-router";

export function ErrorPage() {
	const routerState = useRouterState();
	const error = (routerState as unknown as { error?: { statusText?: string; message?: string } }).error;

	return (
		<div id="error-page">
			<h1>Oops!</h1>
			<p>Sorry, an unexpected error has occurred.</p>
			<p>
				<i>{error?.statusText || error?.message || "Unknown error"}</i>
			</p>
		</div>
	);
}
