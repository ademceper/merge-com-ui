import { BookOpen, ChatCircle } from "@phosphor-icons/react";
import { useTelemetry } from "@/shared/lib/hooks/use-telemetry";
import { TelemetryEvent } from "@/shared/lib/telemetry";
import type { Command, CommandExecutionContext } from "../command-types";

export function useHelpCommands(_context: CommandExecutionContext): Command[] {
	const track = useTelemetry();

	const commands: Command[] = [
		{
			id: "help-docs",
			label: "Open Documentation",
			description: "View the Novu documentation",
			category: "help",
			icon: <BookOpen />,
			priority: "medium",
			keywords: ["docs", "documentation", "help", "guide"],
			execute: () => {
				window.open("https://docs.novu.co", "_blank");
			},
		},
		{
			id: "help-feedback",
			label: "Share Feedback",
			description: "Send feedback or get help from our team",
			category: "help",
			icon: <ChatCircle />,
			priority: "medium",
			keywords: ["feedback", "support", "help", "chat"],
			execute: () => {
				track(TelemetryEvent.SHARE_FEEDBACK_LINK_CLICKED);
				try {
					window?.Plain?.open();
				} catch (error) {
					console.error("Error opening Plain chat:", error);
				}
			},
		},
	];

	return commands;
}
