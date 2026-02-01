import { ReactNode } from "react";

interface AuthLayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
    features?: Array<{
        title: string;
        description: string;
    }>;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
            <div className="w-full max-w-[340px]">
                {children}
            </div>
        </div>
    );
}
