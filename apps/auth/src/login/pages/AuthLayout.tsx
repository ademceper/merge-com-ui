import { ReactNode } from "react";

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    description: string;
    features: Array<{
        title: string;
        description: string;
    }>;
}

export default function AuthLayout({ children, title, description, features }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary to-[oklch(0.35_0.2132_27.92)] relative">
            <div className="flex flex-col lg:flex-row min-h-screen">
                {/* Mobile Logo - Takes remaining space */}
                <div className="lg:hidden flex-1 flex justify-center items-center px-4 relative z-10">
                    <div className="text-center text-white">
                        <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-3">
                            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold">{title}</h1>
                    </div>
                </div>
                {/* Left Side - Branding/Info (Desktop Only) */}
                <div className="hidden lg:flex lg:w-1/2 p-12 items-center justify-center relative z-10">
                    <div className="max-w-md text-white space-y-6">
                        <div className="mb-8">
                            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-6">
                                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                                </svg>
                            </div>
                            <h1 className="text-4xl font-bold mb-3">{title}</h1>
                            <p className="text-lg text-white/90">{description}</p>
                        </div>
                        <div className="space-y-4 pt-8">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                        ✓
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{feature.title}</h3>
                                        <p className="text-sm text-white/80">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="w-full lg:w-1/2 flex items-end lg:items-center justify-center lg:justify-end px-2 lg:p-0 relative z-10 lg:flex-none">
                    <div className="w-full lg:h-[calc(100vh-30px)] lg:my-0.5 flex items-center justify-center bg-background rounded-t-[20px] lg:rounded-t-none lg:rounded-tl-[20px] lg:rounded-bl-[20px] px-8 py-8 lg:px-12">
                        <div className="w-full max-w-md">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
