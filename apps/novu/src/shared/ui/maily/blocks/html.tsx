import { Code } from "@phosphor-icons/react";

import type { useTelemetry } from "@/shared/lib/hooks/use-telemetry";
import type { BlockItem } from "@/shared/lib/externals/maily-core/blocks";
import { TelemetryEvent } from "@/shared/lib/telemetry";

export const createHtmlCodeBlock = (props: {
	track: ReturnType<typeof useTelemetry>;
}): BlockItem => {
	const { track } = props;

	return {
		title: "Custom HTML code",
		description: "Add a block of HTML",
		searchTerms: ["html", "code", "custom"],
		icon: <Code className="mly-h-4 mly-w-4" />,
		preview: "/images/email-editor/html-block-preview.webp",
		command: ({ editor, range }) => {
			track(TelemetryEvent.EMAIL_BLOCK_ADDED, {
				type: "custom_html",
			});

			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setHtmlCodeBlock({ language: "html" })
				.run();
		},
	};
};
