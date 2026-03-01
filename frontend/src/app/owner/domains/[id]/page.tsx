import DomainDetail from "@/components/pages/owner/domains/DomainDetail";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    return <DomainDetail domainId={id} />;
}
