import { Skeleton } from "@merge-rd/ui/components/skeleton";

interface FormSkeletonProps {
    fields?: number;
    hasTitle?: boolean;
}

export function FormSkeleton({ fields = 5, hasTitle = true }: FormSkeletonProps) {
    return (
        <div className="pt-4 pb-6 px-0 space-y-6">
            {hasTitle && <Skeleton className="h-7 w-48" />}
            <div className="space-y-4 max-w-2xl">
                {Array.from({ length: fields }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ))}
            </div>
            <div className="flex gap-2 pt-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
            </div>
        </div>
    );
}
