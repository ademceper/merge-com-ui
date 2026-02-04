import {
    Cube,
    GithubLogo,
    FacebookLogo,
    GitlabLogo,
    GoogleLogo,
    InstagramLogo,
    LinkedinLogo,
    StackOverflowLogo,
    TwitterLogo,
    PaypalLogo
} from "@phosphor-icons/react";

type IconMapperProps = {
    icon: string;
};

export const IconMapper = ({ icon }: IconMapperProps) => {
    const SpecificIcon = getIcon(icon);
    return (
        <span className="inline-flex items-center justify-center [&_svg]:size-6" aria-hidden>
            <SpecificIcon size={24} alt={icon} />
        </span>
    );
};

function getIcon(icon: string) {
    switch (icon) {
        case "github":
            return GithubLogo;
        case "facebook":
            return FacebookLogo;
        case "gitlab":
            return GitlabLogo;
        case "google":
            return GoogleLogo;
        case "linkedin":
        case "linkedin-openid-connect":
            return LinkedinLogo;
        case "openshift-v4":
            return Cube;
        case "stackoverflow":
            return StackOverflowLogo;
        case "twitter":
            return TwitterLogo;
        case "microsoft":
            return Cube; // Phosphor has no Microsoft logo
        case "bitbucket":
            return Cube;
        case "instagram":
            return InstagramLogo;
        case "paypal":
            return PaypalLogo;
        default:
            return Cube;
    }
}
