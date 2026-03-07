import type { Editor } from "@tiptap/core";
import type { EditorView } from "@uiw/react-codemirror";
import React, { useCallback, useMemo, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { EditorOverlays } from "@/widgets/editor-overlays";
import { HtmlEditor } from "@/shared/ui/html-editor";
import { Maily } from "@/shared/ui/maily/maily";
import { createEditorBlocks } from "@/shared/ui/maily/maily-config";
import { isMailyJson } from "@/shared/ui/maily/maily-utils";
import type { VariableFrom } from "@/shared/ui/maily/types";
import {
	MailyVariablesListView,
	type VariableSuggestionsPopoverRef,
} from "@/shared/ui/maily/views/maily-variables-list-view";
import {
	BubbleMenuVariablePill,
	createVariableNodeView,
} from "@/shared/ui/maily/views/variable-view";
import { FormField } from "@/shared/ui/primitives/form/form";
import type { CompletionRange } from "@/shared/ui/primitives/variable-editor";
import { useCreateTranslationKey } from "@/features/translations/lib/use-create-translation-key";
import { useEditorTranslationOverlay } from "@/features/translations/lib/use-editor-translation-overlay";
import { useFetchTranslationKeys } from "@/features/translations/lib/use-fetch-translation-keys";
import { useParseVariables } from "@/shared/lib/hooks/use-parse-variables";
import { useTelemetry } from "@/shared/lib/hooks/use-telemetry";
import type { Variable } from "@/shared/lib/externals/maily-core/extensions";
import { LocalizationResourceEnum } from "@/shared/model/translations";
import { LayoutControlInput } from "./layout-control-input";
import { useLayoutEditor } from "./layout-editor-provider";

const MailyVariablesListViewForLayouts = React.forwardRef<
	VariableSuggestionsPopoverRef,
	{
		items: Variable[];
		onSelectItem: (item: Variable) => void;
	}
>((props, ref) => {
	return <MailyVariablesListView {...props} ref={ref} />;
});

export const LayoutEmailBody = () => {
	const viewRef = useRef<EditorView | null>(null);
	const lastCompletionRef = useRef<CompletionRange | null>(null);
	const { layout } = useLayoutEditor();
	const { control, setValue } = useFormContext();
	const editorType = useWatch({ name: "editorType", control });
	const parsedVariables = useParseVariables(
		layout?.variables,
		undefined,
		undefined,
		true,
	);
	const resourceId = layout?.layoutId || "";
	const resourceType = LocalizationResourceEnum.LAYOUT;

	const track = useTelemetry();

	const onChange = useCallback(
		(value: string) => {
			setValue("body", value);
		},
		[setValue],
	);

	const blocks = useMemo(() => {
		return createEditorBlocks({ track });
	}, [track]);

	const renderVariable = useCallback(
		(opts: {
			variable: Variable;
			fallback?: string;
			editor: Editor;
			from: "content-variable" | "bubble-variable" | "button-variable";
		}) => {
			return (
				<BubbleMenuVariablePill
					isPayloadSchemaEnabled={false}
					variableName={opts.variable.name}
					className="h-5 text-xs"
					editor={opts.editor}
					from={opts.from as VariableFrom}
					variables={parsedVariables.variables}
					isAllowedVariable={parsedVariables.isAllowedVariable}
				/>
			);
		},
		[parsedVariables],
	);

	const {
		translationCompletionSource,
		translationPluginExtension,
		selectedTranslation,
		handleTranslationDelete,
		handleTranslationReplaceKey,
		handleTranslationPopoverOpenChange,
		translationTriggerPosition,
		isTranslationPopoverOpen,
		shouldEnableTranslations,
	} = useEditorTranslationOverlay({
		viewRef,
		lastCompletionRef,
		onChange,
		resourceId,
		resourceType,
		isTranslationEnabledOnResource: !!layout?.isTranslationEnabled,
	});

	const createTranslationKeyMutation = useCreateTranslationKey();

	const handleCreateNewTranslationKey = useCallback(
		async (translationKey: string) => {
			if (!resourceId) return;

			await createTranslationKeyMutation.mutateAsync({
				resourceId,
				resourceType,
				translationKey,
				defaultValue: `[${translationKey}]`, // Placeholder value to indicate missing translation
			});
		},
		[resourceId, resourceType, createTranslationKeyMutation],
	);

	const { translationKeys, isLoading: isTranslationKeysLoading } =
		useFetchTranslationKeys({
			resourceId,
			resourceType,
			enabled: shouldEnableTranslations && !!resourceId,
		});

	const isTranslationEnabled =
		shouldEnableTranslations && !isTranslationKeysLoading;
	const editorKey = useMemo(() => {
		const variableNames = [
			...parsedVariables.primitives,
			...parsedVariables.arrays,
			...parsedVariables.namespaces,
		]
			.map((v) => v.name)
			.sort()
			.join(",");

		const translationState = `translation-${isTranslationEnabled ? "enabled" : "disabled"}-${translationKeys.length}`;
		return `vars-${variableNames.length}-${variableNames.slice(0, 100)}-${translationState}`;
	}, [
		parsedVariables.primitives,
		parsedVariables.arrays,
		parsedVariables.namespaces,
		isTranslationEnabled,
		translationKeys.length,
	]);

	const extensions = useMemo(() => {
		if (!translationPluginExtension) return [];

		return [translationPluginExtension];
	}, [translationPluginExtension]);

	return (
		<FormField
			control={control}
			name="body"
			render={({ field }) => {
				// when switching to html/block editor, we still might have locally maily json or html content
				// so we need will show the empty string until we receive the updated value from the server
				const isMaily = isMailyJson(field.value);

				if (editorType === "html") {
					return (
						<HtmlEditor
							viewRef={viewRef}
							lastCompletionRef={lastCompletionRef}
							value={isMaily ? "" : field.value}
							variables={parsedVariables.variables}
							isAllowedVariable={parsedVariables.isAllowedVariable}
							onChange={field.onChange}
							isPayloadSchemaEnabled={false}
							completionSources={translationCompletionSource}
							isTranslationEnabled={isTranslationEnabled}
							extensions={extensions}
							skipContainerClick={isTranslationPopoverOpen}
							className="max-h-[calc(100%-45px)]"
						>
							<EditorOverlays
								isTranslationPopoverOpen={isTranslationPopoverOpen}
								selectedTranslation={selectedTranslation}
								onTranslationPopoverOpenChange={
									handleTranslationPopoverOpenChange
								}
								onTranslationDelete={handleTranslationDelete}
								onTranslationReplaceKey={handleTranslationReplaceKey}
								translationTriggerPosition={translationTriggerPosition}
								translationValueInput={LayoutControlInput}
								variables={parsedVariables.variables}
								isAllowedVariable={parsedVariables.isAllowedVariable}
								resourceId={resourceId}
								resourceType={resourceType}
							/>
						</HtmlEditor>
					);
				}

				return (
					<Maily
						key={editorKey}
						value={isMaily ? field.value : ""}
						onChange={field.onChange}
						variables={parsedVariables}
						blocks={blocks}
						addDigestVariables={false}
						isPayloadSchemaEnabled={false}
						isTranslationEnabled={isTranslationEnabled}
						isContextEnabled={true}
						translationKeys={translationKeys}
						translationValueInput={LayoutControlInput}
						onCreateNewTranslationKey={handleCreateNewTranslationKey}
						variableSuggestionsPopover={MailyVariablesListViewForLayouts}
						renderVariable={renderVariable}
						createVariableNodeView={createVariableNodeView}
						resourceId={resourceId}
						resourceType={resourceType}
					>
						<EditorOverlays
							isTranslationPopoverOpen={isTranslationPopoverOpen}
							selectedTranslation={selectedTranslation}
							onTranslationPopoverOpenChange={
								handleTranslationPopoverOpenChange
							}
							onTranslationDelete={handleTranslationDelete}
							onTranslationReplaceKey={handleTranslationReplaceKey}
							translationTriggerPosition={translationTriggerPosition}
							translationValueInput={LayoutControlInput}
							variables={parsedVariables.variables}
							isAllowedVariable={parsedVariables.isAllowedVariable}
							resourceId={resourceId}
							resourceType={resourceType}
						/>
					</Maily>
				);
			}}
		/>
	);
};
