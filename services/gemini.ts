import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisReport, Role } from "../types";

// Model Configuration
export type ModelProvider = 'deepseek' | 'gemini-1.5-flash' | 'gemini-1.5-pro';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are "Matrix Agent", a highly specialized blockchain forensics AI. 
Your capabilities include: on-chain risk scoring, transaction tracing, and smart contract auditing.
You speak in a professional, concise, and technical tone.
If the user provides an Ethereum or Solana address, you simulate a deep analysis.
Always format addresses in monospace.
`;

// Helper to generate a mock analysis for demonstration purposes
// In a real app, this would call Etherscan/Solscan/Chainalysis APIs
export const generateMockAnalysis = (address: string): AnalysisReport => {
  const isHighRisk = Math.random() > 0.5;
  const score = isHighRisk ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 30);
  
  let riskLevel: AnalysisReport['riskLevel'] = 'Safe';
  if (score > 50) riskLevel = 'Caution';
  if (score > 75) riskLevel = 'High Risk';
  if (score > 90) riskLevel = 'Critical';

  return {
    address,
    riskScore: score,
    riskLevel,
    labels: isHighRisk ? ['Phishing', 'Tornado.Cash', 'Heist'] : ['Wallet', 'DeFi User'],
    entity: isHighRisk ? 'Fake_Phishing182' : undefined,
    volume24h: `${(Math.random() * 1000).toFixed(2)} ETH`,
    
    executiveSummary: isHighRisk 
      ? `This investigation report analyzes blockchain transaction patterns for address ${address}. The analysis covers 10 linked addresses and 9 critical transactions, with a total volume of 3009.35 tokens. Evidence suggests a "Zero-Transfer Approval Phishing" attack where the victim was induced to sign an infinite approval for USDT. Funds were subsequently drained and routed through a complex "Peel Chain" laundering network before depositing into centralized exchanges.` 
      : `The target address ${address} shows normal DeFi activity consistent with retail user behavior. Interactions include liquidity provision on Uniswap V3 and staking on Aave. No direct links to sanctioned entities or known hacks were identified in the last 180 days.`,
    
    attackerProfile: {
      identity: isHighRisk ? 'Southeast Asia Telecom Fraud Group' : 'N/A',
      location: isHighRisk ? 'UTC+8 (likely Myanmar/Cambodia)' : 'Unknown',
      fingerprints: isHighRisk 
        ? ['High Gas Price (Flashbots)', 'Peel Chain Structuring', 'Automated Collection Bots', 'Industrialized Money Laundering']
        : ['Normal Gas Usage', 'Manual Transactions']
    },

    fundsFlow: isHighRisk ? [
      { id: 0, stage: 'Lure', action: 'Gas Deposit', from: '0x82cf0...(CEX)', to: 'Victim', amount: '+0.25 ETH', details: 'Victim prepares for "mining" participation.', timestamp: '2025-12-17 10:00' },
      { id: 1, stage: 'Auth', action: 'Approve', from: 'Victim', to: 'USDT Contract', amount: 'Unlimited', details: 'Victim signs malicious infinite approval to 0xScamContract.', timestamp: '2025-12-17 10:15' },
      { id: 2, stage: 'Theft', action: 'TransferFrom', from: 'Victim', to: '0x2cc306...(Attacker)', amount: '-66,024.58 USDT', details: 'Attacker executes drain function.', timestamp: '2025-12-17 10:16' },
      { id: 3, stage: 'Cleanup', action: 'Transfer', from: 'Victim', to: '0xf8ee30...(Attacker)', amount: '-0.1 ETH', details: 'Attacker script sweeps remaining gas.', timestamp: '2025-12-17 10:17' },
      { id: 4, stage: 'Split', action: 'Peel Chain', from: '0x2cc306...', to: '0xLayer2_A...Z', amount: '~2,000 USDT/tx', details: 'Funds split into 30+ micro-transactions to intermediate wallets.', timestamp: '2025-12-17 10:30' },
      { id: 5, stage: 'Mix', action: 'Swap/Bridge', from: '0xLayer2...', to: 'Uniswap/ThorChain', amount: 'ETH/DAI', details: 'Converted to ETH to sever USDT blacklist tracking.', timestamp: '2025-12-17 11:00' },
      { id: 6, stage: 'Collect', action: 'Deposit', from: '0xLayer3...', to: 'CEX Deposit Addr', amount: 'Aggregated', details: 'Final flow into Binance/Huobi/OKX deposit addresses.', timestamp: '2025-12-17 12:45' },
    ] : [],

    keyAddresses: isHighRisk ? [
      { role: 'Victim', address: address, tag: 'Risk / Phishing', riskLevel: 'high', note: 'Source of funds (Compromised)' },
      { role: 'Laundering Hub', address: '0x2cc306...ecf488', tag: 'Phishing (Red Triangle)', riskLevel: 'critical', note: 'Layer 1 Aggregation Wallet (Received 66k USDT)' },
      { role: 'Gas Drainer', address: '0x3b91fc...06d008', tag: 'High Risk', riskLevel: 'high', note: 'Received stolen ETH for gas fees' },
      { role: 'Deposit Addr', address: '0xExchange_Deposit', tag: 'Exchange', riskLevel: 'medium', note: 'Final destination (Binance/OKX)' }
    ] : [],

    graphData: {
      nodes: [
        { id: 'root', label: address.slice(0,6), type: 'wallet', risk: isHighRisk ? 'high' : 'low', x: 50, y: 50 },
        { id: 'attacker', label: 'Attacker', type: 'wallet', risk: 'critical', x: 80, y: 50 },
        { id: 'dex', label: 'Uniswap', type: 'contract', risk: 'low', x: 20, y: 80 },
        { id: 'mix', label: 'Tornado', type: 'mixer', risk: 'critical', x: 80, y: 80 },
        { id: 'cex', label: 'Binance', type: 'exchange', risk: 'low', x: 50, y: 20 },
        { id: 'peel1', label: 'Peel #1', type: 'wallet', risk: 'high', x: 70, y: 30 },
        { id: 'peel2', label: 'Peel #2', type: 'wallet', risk: 'high', x: 90, y: 30 },
      ],
      links: [
        { source: 'root', target: 'dex', amount: '10.5', token: 'ETH' },
        { source: 'root', target: 'attacker', amount: '66k', token: 'USDT' },
        { source: 'attacker', target: 'peel1', amount: '2k', token: 'USDT' },
        { source: 'attacker', target: 'peel2', amount: '2k', token: 'USDT' },
        { source: 'attacker', target: 'mix', amount: '50k', token: 'USDT' },
        { source: 'cex', target: 'root', amount: '0.25', token: 'ETH' },
      ]
    },
    recentTransactions: [
      { hash: '0x3a...1f', method: 'TransferFrom', from: address, to: '0x2cc3...88', value: '66,024 USDT', timestamp: '2 mins ago' },
      { hash: '0x9b...2c', method: 'Approve', from: address, to: '0xScam...99', value: 'Unlimited', timestamp: '5 mins ago' },
      { hash: '0x7c...8d', method: 'Transfer', from: '0x82cf...22', to: address, value: '0.25 ETH', timestamp: '1 hr ago' },
    ]
  };
};

export const sendMessageToGemini = async (
  message: string,
  history: { role: Role; text: string }[],
  attachment?: { type: string; data: string },
  model: ModelProvider = 'deepseek'
): Promise<string> => {
  try {
    // DeepSeek API
    if (model === 'deepseek') {
      const messages = [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        ...history.map(h => ({
          role: h.role === Role.USER ? 'user' : 'assistant',
          content: h.text
        })),
        { role: 'user', content: message }
      ];

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "Analysis incomplete. Network error.";
    }

    // Gemini API
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    let messageParam: string | Array<any> = message;
    
    if (attachment) {
      messageParam = [
        { text: message },
        { inlineData: { mimeType: attachment.type, data: attachment.data } }
      ];
    }

    const result = await chat.sendMessage({ message: messageParam });
    return result.text || "Analysis incomplete. Network error.";
  } catch (error) {
    console.error("API Error:", error);
    return "I encountered an error connecting to the Matrix node. Please check your API key or model availability.";
  }
};