import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@merge-rd/ui/components/accordion";
import { Button } from "@merge-rd/ui/components/button";
import { ArrowsClockwise, Info } from "@phosphor-icons/react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/ui/primitives/tooltip";
import { ACCORDION_STYLES } from "@/features/workflows/ui/workflow-editor/steps/constants/preview-context.constants";
import type { ContextSectionProps } from "@/features/workflows/ui/workflow-editor/steps/types/preview-context.types";
import { ContextSearchEditor } from "./context-search-editor";
import { ExternalLink } from "@/shared/ui/shared/external-link";

export function PreviewContextSection({
	error,
	context,
	schema,
	onUpdate,
	onClearPersisted,
}: ContextSectionProps) {
	return (
		<AccordionItem value="context" className={ACCORDION_STYLES.itemLast}>
			<AccordionTrigger className={ACCORDION_STYLES.trigger}>
				<div className="flex w-full items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="flex items-center gap-0.5">
							Context
							<Tooltip>
								<TooltipTrigger asChild>
									<span className="text-foreground-400 inline-block hover:cursor-help">
										<Info className="size-3" />
									</span>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									Context provides additional data that can be used in your
									workflow, such as tenant or application-specific information.{" "}
									<ExternalLink
										href="https://docs.novu.co/platform/workflow/advanced-features/contexts/contexts-in-workflows"
										target="_blank"
									>
										Learn more
									</ExternalLink>
								</TooltipContent>
							</Tooltip>
						</div>
					</div>
					{onClearPersisted && (
						<div className="mr-2">
							<Button
								onClick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									onClearPersisted();
								}}
								type="button"
								variant="secondary"
								mode="ghost"
								size="2xs"
								className="text-foreground-600 gap-1"
							>
								<ArrowsClockwise className="h-3 w-3" />
								Reset defaults
							</Button>
						</div>
					)}
				</div>
			</AccordionTrigger>
			<AccordionContent className="flex flex-col gap-2">
				<ContextSearchEditor
					value={context}
					schema={schema}
					onUpdate={(updatedData) => onUpdate("context", updatedData)}
					error={error ?? undefined}
				/>
				<div className="text-text-soft flex items-center gap-1.5 text-[10px] font-normal leading-[13px]">
					<Info className="h-3 w-3 shrink-0" />
					<span>
						Changes here only affect the preview and won't be saved to the
						context.
					</span>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}
