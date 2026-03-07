import { useParams } from "@tanstack/react-router";
import { NewLayoutDrawer } from "@/pages/layouts/ui/new-layout-drawer";

export function DuplicateLayoutPage() {
	const { layoutId } = useParams({ strict: false });

	return <NewLayoutDrawer mode="duplicate" layoutId={layoutId} />;
}
