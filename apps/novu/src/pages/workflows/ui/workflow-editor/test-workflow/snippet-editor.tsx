import { CodeBlock, type Language } from "@/shared/ui/primitives/code-block";

export const SnippetEditor = ({
	language,
	value,
}: {
	language: Language;
	value: string;
}) => {
	return (
		<CodeBlock
			theme="light"
			className="h-full overflow-auto"
			language={language}
			code={value}
		/>
	);
};
