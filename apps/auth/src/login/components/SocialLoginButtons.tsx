import { cn } from "@/lib/utils";

export type SocialProvider = {
    loginUrl: string;
    alias: string;
    providerId: string;
    displayName: string;
    iconClasses?: string;
};

/** Keycloak'tan sağlayıcı gelmezse kc_idp_hint ile fallback linkler oluşturur */
export function getFallbackSocialProviders(): SocialProvider[] {
    if (typeof window === "undefined") return [];
    const providers: SocialProvider[] = [
        { alias: "google", providerId: "google", displayName: "Google", loginUrl: "" },
        { alias: "apple", providerId: "apple", displayName: "Apple", loginUrl: "" },
        { alias: "facebook", providerId: "facebook", displayName: "Facebook", loginUrl: "" }
    ];
    providers.forEach((p) => {
        const u = new URL(window.location.href);
        u.searchParams.set("kc_idp_hint", p.alias);
        p.loginUrl = u.toString();
    });
    return providers;
}

function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={cn("size-5", className)} viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
        </svg>
    );
}

function AppleIcon({ className }: { className?: string }) {
    return (
        <svg className={cn("size-5 shrink-0", className)} viewBox="0 0 24 24" fill="#000" aria-hidden="true">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
    );
}

function FacebookIcon({ className }: { className?: string }) {
    return (
        <svg className={cn("size-5", className)} viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    );
}

function getProviderIcon(provider: SocialProvider) {
    const id = (provider.providerId || "").toLowerCase();
    const alias = (provider.alias || "").toLowerCase();
    const combined = `${id} ${alias} ${(provider.displayName || "").toLowerCase()}`;
    if (combined.includes("google")) return <GoogleIcon />;
    if (combined.includes("apple")) return <AppleIcon />;
    if (combined.includes("facebook")) return <FacebookIcon />;
    return null;
}

interface SocialLoginButtonsProps {
    providers: SocialProvider[];
    dividerLabel: string;
    /** Örn: (displayName) => `${displayName} ile devam edin` */
    getButtonLabel?: (displayName: string, alias: string) => string;
    className?: string;
}

export function SocialLoginButtons({ providers, dividerLabel, getButtonLabel, className }: SocialLoginButtonsProps) {
    if (!providers || providers.length === 0) return null;

    return (
        <div className={cn("mt-6 space-y-4", className)}>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-sm text-black">
                        {dividerLabel}
                    </span>
                </div>
            </div>
            <div className="grid gap-2">
                {providers.map((p) => {
                    const icon = getProviderIcon(p);
                    const label = getButtonLabel ? getButtonLabel(p.displayName, p.alias) : p.displayName;
                    return (
                        <a
                            key={p.alias}
                            href={p.loginUrl}
                            className="flex items-center justify-center gap-2 w-full h-12 rounded-lg bg-gray-100 hover:bg-gray-200 text-black font-medium text-sm transition-colors border-0"
                        >
                            {icon ? (
                                <span className="flex shrink-0 [&_svg]:pointer-events-none">
                                    {icon}
                                </span>
                            ) : (
                                p.iconClasses && (
                                    <i className={cn("shrink-0", p.iconClasses)} aria-hidden="true" />
                                )
                            )}
                            {label}
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
