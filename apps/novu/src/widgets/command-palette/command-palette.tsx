import { Button } from "@merge-rd/ui/components/button";
import { Kbd } from "@merge-rd/ui/components/kbd";
import { cn } from "@merge-rd/ui/lib/utils";
import {
	ArrowDown,
	ArrowElbowDownLeft,
	ArrowUp,
	File,
	Gear,
	Lightning,
	MagnifyingGlass,
	Path,
	Play,
	Question,
	User,
	X,
} from "@phosphor-icons/react";
import { useCommandState } from "cmdk";
import { useCallback, useEffect, useState } from "react";
import { useTelemetry } from "@/shared/lib/hooks/use-telemetry";
import { TelemetryEvent } from "@/shared/lib/telemetry";
import * as CommandMenu from "./command-menu";
import type { CommandCategory, Command as CommandType } from "./command-types";
import { useCommandPalette } from "./hooks/use-command-palette";
import { useCommandRegistry } from "./hooks/use-command-registry";

const CategoryIconWrapper = ({ children }: { children: React.ReactNode }) => {
	return (
		<div
			className={
				"flex size-6 items-center justify-center rounded-8 bg-bg-weak text-text-sub border border-neutral-200"
			}
		>
			<div className="size-3.5 flex items-center justify-center">
				{children}
			</div>
		</div>
	);
};

const getDefaultIcon = (category: CommandCategory): React.ReactNode => {
	const defaultIcons: Record<CommandCategory, React.ReactNode> = {
		"current-workflow": <Play weight="fill" />,
		workflow: <Path weight="fill" />,
		navigation: <File />,
		data: <User />,
		action: <Lightning />,
		search: <MagnifyingGlass />,
		settings: <Gear />,
		help: <Question />,
	};
	return defaultIcons[category];
};

const getCategoryActionLabel = (
	category: CommandCategory | undefined,
): string => {
	const actionLabels: Record<CommandCategory, string> = {
		"current-workflow": "Execute action",
		workflow: "Go to workflow",
		navigation: "Navigate to",
		data: "Open command",
		action: "Execute action",
		search: "Search for",
		settings: "Open settings",
		help: "Get help",
	};

	if (!category) {
		return "Open Command";
	}

	return actionLabels[category];
};

// Footer component that has access to command state
function CommandFooter({ commands }: { commands: CommandType[] }) {
	const selectedValue = useCommandState((state) => state.value);
	const selectedCommand = commands.find(
		(cmd) => `${cmd.label} ${cmd.keywords?.join(" ") || ""}` === selectedValue,
	);

	return (
		<CommandMenu.Footer className="border-t border-stroke-soft bg-bg-weak">
			<div className="flex items-center justify-between w-full py-2 pt-1.5">
				<div className="flex items-center gap-1.5">
					<div className="flex items-center gap-0.5">
						<CommandMenu.FooterKeyBox className="border-stroke-soft bg-bg-white">
							<ArrowUp className="size-3 text-icon-sub" />
						</CommandMenu.FooterKeyBox>
						<CommandMenu.FooterKeyBox className="border-stroke-soft bg-bg-white">
							<ArrowDown className="size-3 text-icon-sub" />
						</CommandMenu.FooterKeyBox>
					</div>
					<span className="text-paragraph-xs text-text-soft">Navigate</span>
				</div>
				<Button variant="primary" size="2xs" mode="gradient">
					<span>
						{getCategoryActionLabel(selectedCommand?.category)}
					</span>
					<Kbd className="border border-white/30 bg-transparent ring-transparent px-0 size-4 justify-center items-center">
						<ArrowElbowDownLeft className="size-2.5 text-white" />
					</Kbd>
				</Button>
			</div>
		</CommandMenu.Footer>
	);
}

export function CommandPalette() {
	const { isOpen, closeCommandPalette } = useCommandPalette();
	const track = useTelemetry();
	const [search, setSearch] = useState("");
	const commandGroups = useCommandRegistry(search);

	// Create a flat list of all commands for easy lookup
	const allCommands = commandGroups.flatMap((group) => group.commands);

	// Reset search when dialog closes
	useEffect(() => {
		if (!isOpen) {
			setSearch("");
		}
	}, [isOpen]);

	const executeCommand = useCallback(
		async (command: CommandType) => {
			track(TelemetryEvent.COMMAND_PALETTE_COMMAND_SELECTED, {
				commandId: command.id,
				commandLabel: command.label,
				commandCategory: command.category,
			});

			closeCommandPalette();

			// Small delay to allow dialog to close smoothly
			setTimeout(async () => {
				try {
					await command.execute();
				} catch (error) {
					console.error("Error executing command:", error);
				}
			}, 100);
		},
		[closeCommandPalette, track],
	);

	return (
		<CommandMenu.Dialog open={isOpen} onOpenChange={closeCommandPalette}>
			<div className="group/cmd-input flex items-center gap-2 p-3 bg-bg-weak">
				<MagnifyingGlass className={cn("size-5 text-text-soft")} />
				<CommandMenu.Input
					value={search}
					onValueChange={setSearch}
					placeholder="Type a command or search..."
					autoFocus
					className="text-label-md text-text-sub placeholder:text-text-soft"
				/>
				<button
					onClick={closeCommandPalette}
					className="size-4 items-center justify-center rounded-6 text-text-soft hover:text-icon-sub transition-colors"
				>
					<X className="size-4" />
				</button>
			</div>

			<CommandMenu.List className="py-0 min-h-[400px]">
				{commandGroups.map((group) => (
					<CommandMenu.Group
						key={group.category}
						heading={group.label}
						className="px-2.5"
					>
						{group.commands.map((command) => {
							const isEnabled = command.isEnabled ? command.isEnabled() : true;

							return (
								<CommandMenu.Item
									key={command.id}
									value={`${command.label} ${command.keywords?.join(" ") || ""}`}
									onSelect={() => isEnabled && executeCommand(command)}
									disabled={!isEnabled}
									className="px-1.5 rounded-8"
								>
									<div className="flex items-center gap-1.5 flex-1">
										<CategoryIconWrapper>
											{command.icon || getDefaultIcon(command.category)}
										</CategoryIconWrapper>
										<span className="text-text-sub text-label-sm flex-1 truncate">
											{command.label}
										</span>
									</div>
									{command.metadata?.workflowId && (
										<span
											className="text-paragraph-sm text-text-soft ml-auto max-w-32 truncate"
											title={command.metadata.workflowId}
										>
											{command.metadata.workflowId}
										</span>
									)}
								</CommandMenu.Item>
							);
						})}
					</CommandMenu.Group>
				))}
			</CommandMenu.List>

			<CommandFooter commands={allCommands} />
		</CommandMenu.Dialog>
	);
}
