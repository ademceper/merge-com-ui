import { EnvironmentTypeEnum } from "@/shared";
import { AnimatedOutlet } from "@/shared/ui/animated-outlet";
import { PageMeta } from "@/shared/ui/page-meta";
import { Badge } from "@/shared/ui/primitives/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/ui/primitives/tooltip";
import { useEnvironment } from "@/app/context/environment/hooks";
import { useSetPageHeader } from "@/app/context/page-header";
import { TranslationList } from "@/pages/translations/ui/translation-list";

export const TranslationsPage = () => {
	const { currentEnvironment } = useEnvironment();
	const isDevEnvironment = currentEnvironment?.type === EnvironmentTypeEnum.DEV;

	useSetPageHeader(
		<h1 className="text-foreground-950 flex items-center gap-1">
			Translations{" "}
			<Tooltip>
				<TooltipTrigger>
					<Badge color="gray" size="sm">
						BETA
					</Badge>
				</TooltipTrigger>
				{!isDevEnvironment && (
					<TooltipContent>
						<div className="max-w-xs">
							<p className="font-medium">View-only mode</p>
							<p className="mt-1 text-xs text-neutral-400">
								Edit translations in your development environment.
							</p>
						</div>
					</TooltipContent>
				)}
			</Tooltip>
		</h1>,
	);

	return (
		<>
			<PageMeta title="Translations" />
			<TranslationList />
			<AnimatedOutlet />
		</>
	);
};
