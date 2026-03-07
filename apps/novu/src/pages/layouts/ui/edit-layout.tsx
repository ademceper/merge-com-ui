import { useParams } from "@tanstack/react-router";
import { FullPageLayout } from "@/widgets/full-page-layout";
import { PageMeta } from "@/shared/ui/page-meta";
import { LayoutBreadcrumbs } from "@/pages/layouts/ui/layout-breadcrumbs";
import { LayoutEditor } from "@/pages/layouts/ui/layout-editor";
import { LayoutEditorProvider } from "@/pages/layouts/ui/layout-editor-provider";
import { LayoutEditorSkeleton } from "@/pages/layouts/ui/layout-editor-skeleton";
import { useFetchLayout } from "@/pages/layouts/api/use-fetch-layout";

export const EditLayoutPage = () => {
	const { layoutSlug = "" } = useParams({ strict: false });
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
