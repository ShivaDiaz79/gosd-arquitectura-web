import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LeadForm from "@/components/leads/LeadForm";
import LeadsPage from "@/components/leads/LeadsList";

export default function Page() {
	return (
		<div>
			<PageBreadcrumb pageTitle="Leads" />

			<LeadsPage />
		</div>
	);
}
