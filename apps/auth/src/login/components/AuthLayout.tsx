import { ReactNode } from "react";

const logoUrl = `${import.meta.env.BASE_URL}merge-black-text.svg`;

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
            <div id="kc-header" className="flex justify-center mb-8 w-full">
                <div id="kc-header-wrapper" className="flex justify-center">
                    <img
                        src={logoUrl}
                        alt="Merge"
                        className="h-11 w-auto max-w-[13rem] object-contain"
                    />
                </div>
            </div>
            <div className="w-full max-w-[340px]">
                {children}
            </div>
        </div>
    );
}
