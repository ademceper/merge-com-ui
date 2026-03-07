import { useUser } from "@merge-rd/auth";
import { ChannelTypeEnum } from "@/shared";
import { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";
import { useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import { IS_EU, MODE } from "@/shared/config";
import { useEnvironment } from "@/app/context/environment/hooks";
import { useFetchIntegrations } from "@/pages/integrations/api/use-fetch-integrations";
import { ROUTES } from "@/shared/lib/routes";
import { InboxConnectedGuide } from "./inbox-connected-guide";
import { InboxFrameworkGuide } from "./inbox-framework-guide";

const LAYOUT_CONSTANTS = {
	MAIN_PADDING_LEFT: "pl-[100px]",
	FOOTER_MARGIN_LEFT: "-ml-[100px]",
} as const;

export function InboxEmbed(): JSX.Element | null {
	const [showConfetti, setShowConfetti] = useState(false);
	const { user: currentUser } = useUser();
	const { integrations } = useFetchIntegrations({
		refetchInterval: 1000,
		refetchOnWindowFocus: true,
	});
	const { environments, areEnvironmentsInitialLoading } = useEnvironment();

	const search = useSearch({ strict: false });
	const navigate = useNavigate();
	const location = useLocation();
	const environmentHint = (search as Record<string, unknown>).environmentId as string | undefined;

	const selectedEnvironment = environments?.find((env) =>
		environmentHint ? env._id === environmentHint : !env._parentId,
	);
	const subscriberId = currentUser?.id;

	const foundIntegration = integrations?.find(
		(integration) =>
			integration._environmentId === selectedEnvironment?._id &&
			integration.channel === ChannelTypeEnum.IN_APP,
	);

	const isInAppConnected = foundIntegration?.connected ?? false;

	const primaryColor = ((search as Record<string, unknown>).primaryColor as string) || "#DD2450";
	const foregroundColor = ((search as Record<string, unknown>).foregroundColor as string) || "#0E121B";

	const validateUrl = (
		urlString: string | null,
		allowedProtocols: string[],
	): string | undefined => {
		if (!urlString) return undefined;

		const trimmedUrl = urlString.trim();
		if (!trimmedUrl) return undefined;

		try {
			const url = new URL(trimmedUrl);
			return allowedProtocols.includes(url.protocol) ? trimmedUrl : undefined;
		} catch {
			return undefined;
		}
	};

	const shouldShowCustomUrls = MODE !== "production" && !IS_EU;
	const backendUrl = shouldShowCustomUrls
		? validateUrl((search as Record<string, unknown>).backendUrl as string | null, ["http:", "https:"])
		: undefined;
	const socketUrl = shouldShowCustomUrls
		? validateUrl((search as Record<string, unknown>).socketUrl as string | null, [
				"ws:",
				"wss:",
				"http:",
				"https:",
			])
		: undefined;

	const isOnWelcomeRoute =
		location.pathname === ROUTES.WELCOME ||
		location.pathname.startsWith(`${ROUTES.WELCOME}/`);

	useEffect(() => {
		if (areEnvironmentsInitialLoading || isOnWelcomeRoute) {
			return;
		}

		if (!subscriberId || !selectedEnvironment) {
			navigate({ to: ROUTES.WELCOME, replace: true });
			return;
		}
	}, [
		subscriberId,
		selectedEnvironment,
		navigate,
		areEnvironmentsInitialLoading,
		isOnWelcomeRoute,
	]);

	useEffect(() => {
		if (isInAppConnected) {
			setShowConfetti(true);
			const timer = setTimeout(() => setShowConfetti(false), 10000);

			return () => clearTimeout(timer);
		}
	}, [isInAppConnected]);

	if (isOnWelcomeRoute) {
		return null;
	}

	if (areEnvironmentsInitialLoading) {
		return null;
	}

	if (!subscriberId || !selectedEnvironment) return null;

	if (!foundIntegration) {
		return (
			<main className={LAYOUT_CONSTANTS.MAIN_PADDING_LEFT}>
				<InboxFrameworkGuide
					currentEnvironment={selectedEnvironment}
					subscriberId={subscriberId}
					primaryColor={primaryColor}
					foregroundColor={foregroundColor}
					backendUrl={backendUrl}
					socketUrl={socketUrl}
				/>
			</main>
		);
	}

	return (
		<main className={LAYOUT_CONSTANTS.MAIN_PADDING_LEFT}>
			{showConfetti && <ReactConfetti recycle={false} numberOfPieces={1000} />}
			{foundIntegration?.connected ? (
				<InboxConnectedGuide
					subscriberId={subscriberId}
					environment={selectedEnvironment}
				/>
			) : (
				<InboxFrameworkGuide
					currentEnvironment={selectedEnvironment}
					subscriberId={subscriberId}
					primaryColor={primaryColor}
					foregroundColor={foregroundColor}
					backendUrl={backendUrl}
					socketUrl={socketUrl}
				/>
			)}
		</main>
	);
}
