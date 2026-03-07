import { useParams } from "react-router-dom";
import { FullPageLayout } from "@/widgets/full-page-layout";
import { PageMeta } from "@/shared/ui/page-meta";
import { LayoutBreadcrumbs } from "@/features/layouts/ui/layout-breadcrumbs";
import { LayoutEditor } from "@/features/layouts/ui/layout-editor";
import { LayoutEditorProvider } from "@/features/layouts/ui/layout-editor-provider";
import { LayoutEditorSkeleton } from "@/features/layouts/ui/layout-editor-skeleton";
import { useFetchLayout } from "@/features/layouts/lib/use-fetch-layout";

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
