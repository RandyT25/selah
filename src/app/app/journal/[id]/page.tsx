import { redirect } from "next/navigation";

interface Props { params: Promise<{ id: string }> }

export default async function JournalDetailPage({ params }: Props) {
  const { id } = await params;
  redirect(`/bibleapp/journal/${id}`);
}
