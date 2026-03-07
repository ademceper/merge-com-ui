import { EnvironmentTypeEnum } from "@novu/shared";
import { AnimatedOutlet } from "@/components/animated-outlet";
import { PageMeta } from "@/components/page-meta";
import { Badge } from "@/components/primitives/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/primitives/tooltip";
import { useEnvironment } from "@/context/environment/hooks";
import { useSetPageHeader } from "@/context/page-header";
import { TranslationList } from "@/features/translations/components/translation-list";

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
