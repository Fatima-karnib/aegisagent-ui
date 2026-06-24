export type Verdict = "ALLOW" | "BLOCK" | "HUMAN_REVIEW";

export type AgentStatus = "Active" | "Paused" | "Killed";

export interface Agent {
  id: string;
  name: string;
  framework: string;
  status: AgentStatus;
  registered: string;
  owner: string;
  verifications24h: number;
  blockRate: number; // 0-1
  redTeamScore: number; // 0-100
  policyIds: string[];
}

export interface DebateTrace {
  prosecutor: string;
  defender: string;
  judge: string;
}

export interface ActionEvent {
  id: string;
  ts: string; // ISO
  agentId: string;
  agentName: string;
  tool: string;
  args: Record<string, unknown>;
  verdict: Verdict;
  latencyMs: number;
  layer: "Rules Engine" | "3-Agent Debate";
  policyId?: string;
  policyName?: string;
  regRef?: string;
  hash: string;
  s3Uri: string;
  rulesMs: number;
  debateMs: number;
  debate?: DebateTrace;
  reason?: string;
}

export interface Policy {
  id: string;
  name: string;
  type: "Natural Language" | "Cedar" | "Formal Logic";
  status: "Active" | "Draft";
  frameworks: string[];
  boundAgents: string[];
  updated: string;
  nl: string;
  cedar: string;
  formal: string;
}

export interface AttackResult {
  attack: string;
  status: "Caught" | "Escaped";
  layer: string;
  prompt: string;
  recommendation: string;
}

export interface RedTeamRun {
  id: string;
  date: string;
  agentId: string;
  trigger: "Scheduled" | "Manual";
  caught: number;
  total: number;
  results: AttackResult[];
}

export interface ComplianceControl {
  id: string;
  name: string;
  status: "Covered" | "Partial" | "Gap";
  evidenceCount: number;
  lastEvidence: string;
}

export interface ShadowAgent {
  id: string;
  fingerprint: string;
  source: string;
  method: "CloudTrail" | "VPC Flow" | "LLM API egress";
  status: "Registered" | "Unregistered";
  firstSeen: string;
  lastSeen: string;
}

export interface ReviewItem {
  id: string;
  agentId: string;
  agentName: string;
  tool: string;
  args: Record<string, unknown>;
  policyName: string;
  judgeReason: string;
  waitingMin: number;
  resolved?: { decision: "Approved" | "Rejected"; by: string; at: string };
}
