import BranchDetail from "@/components/pages/owner/branches/BranchDetail";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    return <BranchDetail branchId={id} />;
}
