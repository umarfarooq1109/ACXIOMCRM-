import { CustomerDetailClient } from "./CustomerDetailClient";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerDetailClient id={id} />;
}
