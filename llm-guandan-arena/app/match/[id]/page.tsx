import { Arena } from "@/components/Arena";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Arena id={id} />;
}
