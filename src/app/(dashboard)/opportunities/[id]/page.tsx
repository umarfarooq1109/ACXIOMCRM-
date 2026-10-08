import { OpportunityDetailClient } from "./OpportunityDetailClient";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OpportunityDetailClient id={id} />;
}
