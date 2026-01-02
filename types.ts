export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'wallet' | 'contract' | 'mixer' | 'exchange';
  risk: 'low' | 'medium' | 'high' | 'critical';
  x: number;
  y: number;
}

export interface GraphLink {
  source: string;
  target: string;
  amount: string;
  token: string;
}

export interface FundsFlowStep {
  id: number;
  stage: string;
  action: string;
  from: string;
  to: string;
  amount: string;
  details: string;
  timestamp: string;
}

export interface KeyAddress {
  role: string;
  address: string;
  tag: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  note: string;
}

export interface AnalysisReport {
  address: string;
  riskScore: number; // 0-100
  riskLevel: 'Safe' | 'Caution' | 'High Risk' | 'Critical';
  labels: string[];
  entity?: string;
  volume24h: string;
  
  // New Forensic Fields
  executiveSummary: string;
  attackerProfile: {
    identity: string;
    location: string;
    fingerprints: string[];
  };
  fundsFlow: FundsFlowStep[];
  keyAddresses: KeyAddress[];

  graphData: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
  recentTransactions: {
    hash: string;
    method: string;
    from: string;
    to: string;
    value: string;
    timestamp: string;
  }[];
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  // If the message contains a generated analysis report
  analysis?: AnalysisReport;
  isThinking?: boolean;
  // File attachment
  attachment?: {
    name: string;
    type: string;
    preview: string; // Base64 Data URL for preview
  };
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[]; // Store the full history
}