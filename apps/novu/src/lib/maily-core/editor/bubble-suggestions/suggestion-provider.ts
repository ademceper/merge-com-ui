import type { Editor } from "@tiptap/core";
import type React from "react";
import type { RenderVariableOptions } from "../nodes/variable/variable";

export interface SuggestionItem {
	id: string;
	label?: string;
	data?: any;
}

export interface SuggestionProvider {
	name: string;
	triggerPattern: string | RegExp;
	getSuggestions: (
		query: string,
		editor: Editor,
	) => SuggestionItem[] | Promise<SuggestionItem[]>;
	formatValue: (item: SuggestionItem) => string; // How to store the value
	renderValue: (
		value: string,
		editor: Editor,
		from: RenderVariableOptions["from"],
	) => React.ReactNode; // How to display stored value
	isMatch: (value: string) => boolean; // Check if a value matches this provider's pattern
}

export interface SuggestionContext {
	query: string;
	provider: SuggestionProvider;
	triggerIndex: number;
}

export type SuggestionProviderFactory = (
	editor: Editor,
) => SuggestionProvider | null;
