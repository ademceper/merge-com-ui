import { ReactNode } from "react";
import { useThemeToggle } from "@merge-rd/ui/components/theme-toggle";

const baseUrl = import.meta.env.BASE_URL;

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
    const { isDark } = useThemeToggle();
    const logoUrl = isDark ? `${baseUrl}merge-white-text.svg` : `${baseUrl}merge-black-text.svg`;

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8 relative">
            <div id="kc-header" className="flex justify-center mb-8 w-full">
                <div id="kc-header-wrapper" className="flex justify-center">
                    <img
                        key={logoUrl}
                        src={logoUrl}
                        alt="Merge"
                        className="h-11 w-auto max-w-52 object-contain"
                    />
                </div>
            </div>
            <div className="w-full max-w-85">
                {children}
            </div>
        </div>
    );
}
