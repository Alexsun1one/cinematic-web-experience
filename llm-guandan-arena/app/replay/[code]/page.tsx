import { ReplayScrubber } from "@/components/ReplayScrubber";

export default async function ReplayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <ReplayScrubber code={code} />;
}
