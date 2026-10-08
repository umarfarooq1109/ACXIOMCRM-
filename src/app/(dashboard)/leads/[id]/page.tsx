import { LeadDetailClient } from "./LeadDetailClient";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LeadDetailClient id={id} />;
}
