import { notFound } from "next/navigation";
import { agents, agentById } from "@/lib/data";
import { AgentDetail } from "@/components/agent/AgentDetail";

export function generateStaticParams() {
  return agents.map((a) => ({ id: a.id }));
}

export default async function AgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = agentById(id);
  if (!agent) notFound();
  return <AgentDetail agent={agent} />;
}
