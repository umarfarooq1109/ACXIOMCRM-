import { EditCustomerClient } from "./EditCustomerClient";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditCustomerClient id={id} />;
}
