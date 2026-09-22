import { RoomTable } from "@/components/RoomTable";

export default async function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <RoomTable code={code} />;
}
