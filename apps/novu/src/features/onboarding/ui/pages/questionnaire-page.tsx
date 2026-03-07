import { AuthCard } from "@/shared/ui/auth/auth-card";
import { MobileMessage } from "@/shared/ui/auth/mobile-message";
import { QuestionnaireForm } from "@/features/onboarding/ui/questionnaire-form";
import { PageMeta } from "@/shared/ui/page-meta";

export function QuestionnairePage() {
	return (
		<>
			<PageMeta title="Setup your workspace" />
			<div className="hidden md:block">
				<AuthCard>
					<QuestionnaireForm />
				</AuthCard>
			</div>
			<div className="block md:hidden">
				<MobileMessage />
			</div>
		</>
	);
}
