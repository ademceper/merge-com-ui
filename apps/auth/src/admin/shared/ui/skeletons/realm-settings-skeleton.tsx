import { Skeleton } from "@merge-rd/ui/components/skeleton";
import { FormSkeleton } from "./form-skeleton";

export function RealmSettingsSkeleton() {
    return (
        <div className="pt-4 pb-6 px-0 space-y-4">
            <div className="flex gap-2 border-b pb-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-24" />
                ))}
            </div>
            <FormSkeleton hasTitle={false} fields={4} />
        </div>
    );
}
