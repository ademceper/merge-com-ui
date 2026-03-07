import { useParams } from "react-router-dom";
import { FullPageLayout } from "@/components/full-page-layout";
import { PageMeta } from "@/components/page-meta";
import { LayoutBreadcrumbs } from "@/features/layouts/components/layout-breadcrumbs";
import { LayoutEditor } from "@/features/layouts/components/layout-editor";
import { LayoutEditorProvider } from "@/features/layouts/components/layout-editor-provider";
import { LayoutEditorSkeleton } from "@/features/layouts/components/layout-editor-skeleton";
import { useFetchLayout } from "@/features/layouts/hooks/use-fetch-layout";

export const EditLayoutPage = () => {
	const { layoutSlug = "" } = useParams<{
		layoutSlug?: string;
	}>();
	const { layout, isPending } = useFetchLayout({ layoutSlug });

	if (!layout) {
		return (
			<>
				<PageMeta title={`Edit Layout`} />
				<FullPageLayout headerStartItems={<LayoutBreadcrumbs />}>
					<LayoutEditorSkeleton />
				</FullPageLayout>
			</>
		);
	}

	return (
		<>
			<PageMeta title={`Edit ${layout?.name} Layout`} />
			<FullPageLayout headerStartItems={<LayoutBreadcrumbs layout={layout} />}>
				<LayoutEditorProvider
					layout={layout}
					layoutSlug={layoutSlug}
					isPending={isPending}
				>
					<LayoutEditor />
				</LayoutEditorProvider>
			</FullPageLayout>
		</>
	);
};
