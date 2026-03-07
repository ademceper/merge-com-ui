import { EnvironmentTypeEnum, PermissionsEnum } from "@/shared";
import { FilePlus, Path } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { useEnvironment } from "@/app/context/environment/hooks";
import { useFetchWorkflows } from "@/pages/workflows/api/use-fetch-workflows";
import { useHasPermission } from "@/shared/lib/hooks/use-has-permission";
import { buildRoute, ROUTES } from "@/shared/lib/routes";
import type { Command, CommandExecutionContext } from "../command-types";

export function useWorkflowCommands(
	context: CommandExecutionContext,
): Command[] {
	const navigate = useNavigate();
	const hasWorkflowWrite = useHasPermission();
	const { currentEnvironment } = useEnvironment();

	const { data: workflowsData } = useFetchWorkflows({
		limit: 50,
		offset: 0,
	});

	const commands: Command[] = [];

	// Create new workflow - only show in development environment
	if (
		hasWorkflowWrite({ permission: PermissionsEnum.WORKFLOW_WRITE }) &&
		context.environmentSlug &&
		currentEnvironment?.type === EnvironmentTypeEnum.DEV
	) {
		commands.push({
			id: "workflow-create",
			label: "Create New Workflow",
			description: "Create a new workflow from scratch",
			category: "workflow",
			icon: <FilePlus />,
			priority: "high",
			keywords: ["create", "new", "workflow", "add"],
			execute: () => {
				if (context.environmentSlug) {
					navigate({
						to: buildRoute(ROUTES.WORKFLOWS_CREATE, {
							environmentSlug: context.environmentSlug,
						}),
					});
				}
			},
			isVisible: () =>
				hasWorkflowWrite({ permission: PermissionsEnum.WORKFLOW_WRITE }) &&
				!!context.environmentSlug &&
				currentEnvironment?.type === EnvironmentTypeEnum.DEV,
		});
	}

	// Add individual workflow commands (will only show when searching)
	if (context.environmentSlug && workflowsData?.workflows) {
		for (const workflow of workflowsData.workflows) {
			commands.push({
				id: `workflow-edit-${workflow.workflowId}`,
				label: workflow.name,
				description: `Open ${workflow.name} workflow for editing`,
				category: "workflow",
				icon: <Path weight="fill" />,
				priority: "low", // Lower priority so main workflow commands appear first
				keywords: [
					"edit",
					"workflow",
					workflow.name,
					workflow.workflowId,
					"open",
				],
				metadata: {
					slug: workflow.slug,
					workflowId: workflow.workflowId,
				},
				execute: () => {
					if (context.environmentSlug && workflow.slug) {
						navigate({
							to: buildRoute(ROUTES.EDIT_WORKFLOW, {
								environmentSlug: context.environmentSlug,
								workflowSlug: workflow.slug,
							}),
						});
					}
				},
			});
		}
	}

	return commands;
}
