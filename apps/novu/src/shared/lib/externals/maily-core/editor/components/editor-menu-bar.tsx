import {
	Eraser,
	Link,
	Minus,
	TextAlignCenter,
	TextAlignLeft,
	TextAlignRight,
	TextB,
	TextItalic,
	TextStrikethrough,
	TextUnderline,
} from "@phosphor-icons/react";
import type { Editor as EditorType } from "@tiptap/core";
import { useMemo } from "react";
import type { EditorProps } from "..";
import { BubbleMenuButton } from "./bubble-menu-button";
import type { BubbleMenuItem } from "./text-menu/text-bubble-menu";

interface EditorMenuItem extends BubbleMenuItem {
	group: "alignment" | "image" | "mark" | "custom" | "email";
}

type EditorMenuBarProps = {
	config: EditorProps["config"];
	editor: EditorType;
};

export const EditorMenuBar = (props: EditorMenuBarProps) => {
	const { editor, config } = props;

	const items: EditorMenuItem[] = useMemo(
		() => [
			{
				name: "bold",
				command: () => editor.chain().focus().toggleBold().run(),
				isActive: () => editor.isActive("bold"),
				group: "mark",
				icon: TextB,
			},
			{
				name: "italic",
				command: () => editor.chain().focus().toggleItalic().run(),
				isActive: () => editor.isActive("italic"),
				group: "mark",
				icon: TextItalic,
			},
			{
				name: "underline",
				command: () => editor.chain().focus().toggleUnderline().run(),
				isActive: () => editor.isActive("underline"),
				group: "mark",
				icon: TextUnderline,
			},
			{
				name: "strike",
				command: () => editor.chain().focus().toggleStrike().run(),
				isActive: () => editor.isActive("strike"),
				group: "mark",
				icon: TextStrikethrough,
			},
			{
				name: "delete-line",
				command: () =>
					editor.chain().focus().selectParentNode().deleteSelection().run(),
				isActive: () => false,
				group: "mark",
				icon: Eraser,
			},
			{
				name: "divider",
				command: () => editor.chain().focus().setHorizontalRule().run(),
				isActive: () => editor.isActive("horizontalRule"),
				group: "custom",
				icon: Minus,
			},
			{
				name: "link",
				command: () => {
					const previousUrl = editor.getAttributes("link").href;
					const url = window.prompt("URL", previousUrl);
					// If the user cancels the prompt, we don't want to toggle the link
					if (url === null) return;
					// If the user deletes the URL entirely, we'll unlink the selected text
					if (url === "") {
						editor.chain().focus().extendMarkRange("link").unsetLink().run();
						return;
					}

					// Otherwise, we set the link to the given URL
					editor
						.chain()
						.focus()
						.extendMarkRange("link")
						.setLink({ href: url })
						.run();
				},
				isActive: () => editor.isActive("link"),
				group: "custom",
				icon: Link,
			},
			{
				name: "left",
				command: () => editor.chain().focus().setTextAlign("left").run(),
				isActive: () => editor.isActive({ textAlign: "left" }),
				group: "alignment",
				icon: TextAlignLeft,
			},
			{
				name: "center",
				command: () => editor.chain().focus().setTextAlign("center").run(),
				isActive: () => editor.isActive({ textAlign: "center" }),
				group: "alignment",
				icon: TextAlignCenter,
			},
			{
				name: "right",
				command: () => editor.chain().focus().setTextAlign("right").run(),
				isActive: () => editor.isActive({ textAlign: "right" }),
				group: "alignment",
				icon: TextAlignRight,
			},
		],
		[editor],
	);

	const groups = useMemo(
		() =>
			items.reduce((acc, item) => {
				if (!acc.includes(item.group)) {
					acc.push(item.group);
				}
				return acc;
			}, [] as string[]),
		[items],
	);

	if (!editor) {
		return null;
	}

	return (
		<div
			className={`mly-flex mly-items-center mly-gap-3 ${config?.toolbarClassName}`}
		>
			{groups.map((group, index) => (
				<div
					key={index}
					className="mly-flex mly-items-center mly-gap-1 mly-rounded-md mly-border mly-border-gray-200 mly-bg-white mly-p-1"
				>
					{items
						.filter((item) => item.group === group)
						.map((item, index) => (
							<BubbleMenuButton key={index} {...item} />
						))}
				</div>
			))}
		</div>
	);
};
