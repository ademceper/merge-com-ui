import {
	CaretRight,
	SidebarSimple,
	Translate,
	Warning,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Dot, StatusBadge } from "@/shared/ui/primitives/status-badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/ui/primitives/tooltip";
import { TranslationDrawer } from "@/pages/translations/ui/translation-drawer/translation-drawer";
import { useFetchTranslationGroup } from "@/pages/translations/api/use-fetch-translation-group";
import { useIsTranslationEnabled } from "@/pages/translations/model/use-is-translation-enabled";
import type { LocalizationResourceEnum } from "@/shared/model/translations";

type WorkflowTranslationStatusProps = {
	resourceId: string;
	resourceType: LocalizationResourceEnum;
	isTranslationEnabledOnResource: boolean;
	className?: string;
};

export function TranslationStatus({
	resourceId,
	resourceType,
	isTranslationEnabledOnResource,
	className,
}: WorkflowTranslationStatusProps) {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const isTranslationsEnabled = useIsTranslationEnabled({
		isTranslationEnabledOnResource,
	});

	const { data: translationGroup } = useFetchTranslationGroup({
		resourceId,
		resourceType,
		enabled: isTranslationsEnabled,
	});

	if (!isTranslationsEnabled || !translationGroup) {
		return null;
	}

	const hasOutdatedLocales =
		translationGroup.outdatedLocales &&
		translationGroup.outdatedLocales.length > 0;

	const handleStatusBadgeClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDrawerOpen(true);
	};

	const statusBadge = (
		<StatusBadge
			variant="light"
			status={hasOutdatedLocales ? "pending" : "completed"}
			className={`hover:border-current/20 group ml-auto cursor-pointer border border-transparent transition-all duration-200 ${className || ""}`}
			onClick={handleStatusBadgeClick}
		>
			{hasOutdatedLocales ? (
				<>
					<Warning weight="fill" className="size-3.5" />
					<Translate className="size-3.5" />
				</>
			) : (
				<>
					<Dot />
					<Translate className="size-3.5" />
				</>
			)}
			{hasOutdatedLocales ? "Locales out of sync" : "All locales in sync"}
			<div className="relative size-3.5 overflow-hidden">
				<CaretRight className="absolute size-3.5 opacity-60 transition-all duration-200 group-hover:-translate-x-1 group-hover:opacity-0" />
				<SidebarSimple className="absolute size-3.5 translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-60" />
			</div>
		</StatusBadge>
	);

	if (hasOutdatedLocales) {
		return (
			<>
				<Tooltip>
					<TooltipTrigger asChild>{statusBadge}</TooltipTrigger>
					<TooltipContent sideOffset={10}>
						<div className="max-w-xs">
							<p className="font-medium">Locales out of sync</p>
							<p className="mt-1 text-xs text-neutral-400">
								Translation keys were added or removed from the default
								language. Click to update target languages.
							</p>
						</div>
					</TooltipContent>
				</Tooltip>

				<TranslationDrawer
					isOpen={isDrawerOpen}
					onOpenChange={setIsDrawerOpen}
					resourceType={resourceType}
					resourceId={resourceId}
				/>
			</>
		);
	}

	return (
		<>
			{statusBadge}

			<TranslationDrawer
				isOpen={isDrawerOpen}
				onOpenChange={setIsDrawerOpen}
				resourceType={resourceType}
				resourceId={resourceId}
			/>
		</>
	);
}
