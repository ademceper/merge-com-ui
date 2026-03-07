import { AuthCard } from "@/components/auth/auth-card";
import { MobileMessage } from "@/components/auth/mobile-message";
import { QuestionnaireForm } from "@/components/auth/questionnaire-form";
import { PageMeta } from "@/components/page-meta";

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
