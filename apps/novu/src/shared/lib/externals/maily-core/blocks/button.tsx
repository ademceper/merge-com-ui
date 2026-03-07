import type { BlockItem } from "./types";
import "../editor/nodes/button/button";
import "../editor/extensions/link-card";
import { ArrowSquareUpRight, Cursor } from "@phosphor-icons/react";

export const button: BlockItem = {
	title: "Button",
	description: "Add a call to action button to email.",
	searchTerms: ["link", "button", "cta"],
	icon: <Cursor className="mly-h-4 mly-w-4" />,
	command: ({ editor, range }) => {
		editor.chain().focus().deleteRange(range).setButton().run();
	},
};

export const linkCard: BlockItem = {
	title: "Link Card",
	description: "Add a link card to email.",
	searchTerms: ["link", "button", "image"],
	icon: <ArrowSquareUpRight className="mly-h-4 mly-w-4" />,
	command: ({ editor, range }) => {
		editor.chain().focus().deleteRange(range).setLinkCard().run();
	},
	render: (editor) => {
		return editor.extensionManager.extensions.findIndex(
			(ext) => ext.name === "linkCard",
		) === -1
			? null
			: true;
	},
};
