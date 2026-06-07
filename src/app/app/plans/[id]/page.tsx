import { redirect } from "next/navigation";
interface Props { params: Promise<{ id: string }> }
export default async function PlanDetailPage({ params }: Props) {
  const { id } = await params;
  redirect(`/bibleapp/plans/${id}`);
}
