/** biome-ignore-all lint/correctness/useUniqueElementIds: working correctly */

import { useOrganization } from "@merge-rd/auth";
import { Button } from "@merge-rd/ui/components/button";
import { Separator } from "@merge-rd/ui/components/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@merge-rd/ui/components/table";
import { BookBookmark, Sparkle } from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Badge } from "@/shared/ui/primitives/badge";
import { LinkButton } from "@/shared/ui/primitives/button-link";
import { CopyButton } from "@/shared/ui/primitives/copy-button";
import { EnvironmentBranchIcon } from "@/shared/ui/primitives/environment-branch-icon";
import TruncatedText from "@/shared/ui/truncated-text";
import { IS_SELF_HOSTED, SELF_HOSTED_UPGRADE_REDIRECT_URL } from "@/shared/config";
import {
	useEnvironment,
	useFetchEnvironments,
} from "@/app/context/environment/hooks";
import { useTelemetry } from "@/shared/lib/hooks/use-telemetry";
import { ROUTES } from "@/shared/lib/routes";
import { TelemetryEvent } from "@/shared/lib/telemetry";
import { openInNewTab } from "@/shared/lib/url";
import { EmptyStateSvg } from "./environment-empty-state";

export function FreeTierState() {
	const track = useTelemetry();
	const navigate = useNavigate();
	const { organization: currentOrganization } = useOrganization();
	const { environments = [] } = useFetchEnvironments({
		organizationId: currentOrganization?.id,
	});
	const { currentEnvironment } = useEnvironment();

	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-6 px-4">
			<div className="flex w-full max-w-[480px] flex-col items-center gap-6 text-center">
				<div className="flex w-full flex-col gap-3">
					<div className="flex flex-col items-center gap-2">
						<div className="mb-[50px]">
							<EmptyStateSvg />
						</div>
						<h2 className="text-foreground-900 text-label-md">
							Manage Your Environments
						</h2>
						<p className="text-text-soft text-label-xs mb-3 max-w-[300px]">
							Create additional environments to test, stage, or experiment
							without affecting your live systems.
						</p>
					</div>
					<Separator variant="line-text">YOUR ENVIRONMENTS</Separator>
					<div className="flex w-full items-center justify-center px-5">
						<Table>
							<TableHeader className="w-full">
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Identifier</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{environments.map((environment) => (
									<TableRow
										key={environment._id}
										className="group relative isolate"
									>
										<TableCell className="font-medium">
											<div className="flex items-center gap-2">
												<EnvironmentBranchIcon
													size="sm"
													environment={environment}
												/>
												<div className="flex items-center gap-1">
													<TruncatedText className="max-w-[32ch]">
														{environment.name}
													</TruncatedText>
													{environment._id === currentEnvironment?._id && (
														<Badge color="blue" size="sm" variant="lighter">
															Current
														</Badge>
													)}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1 transition-opacity duration-200">
												<TruncatedText className="text-foreground-400 font-code block text-xs">
													{environment.identifier}
												</TruncatedText>
												<CopyButton
													className="z-10 flex size-2 p-0 px-1 opacity-0 group-hover:opacity-100"
													valueToCopy={environment.identifier}
													size="2xs"
												/>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>

				<div className="flex flex-col items-center gap-1">
					<p className="text-text-soft text-label-xs mb-3 text-center">
						To create additional custom environments, upgrade your plan.
					</p>
					<Button
						variant="default"
						mode="gradient"
						size="xs"
						className="mb-3.5"
						onClick={() => {
							track(TelemetryEvent.UPGRADE_TO_TEAM_TIER_CLICK, {
								source: "environments-page",
							});

							if (IS_SELF_HOSTED) {
								openInNewTab(
									SELF_HOSTED_UPGRADE_REDIRECT_URL +
										"?utm_campaign=custom_environemnts",
								);
							} else {
								navigate({ to: ROUTES.SETTINGS_BILLING });
							}
						}}
						leadingIcon={Sparkle}
					>
						{IS_SELF_HOSTED ? "Contact Sales" : "Upgrade to Team Tier"}
					</Button>
					<Link
						to={"https://docs.novu.co/platform/developer/environments"}
						target="_blank"
					>
						<LinkButton size="sm" leadingIcon={BookBookmark}>
							How does this help?
						</LinkButton>
					</Link>
				</div>
			</div>
		</div>
	);
}


