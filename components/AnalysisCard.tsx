import React, { useState } from 'react';
import { AnalysisReport, GraphNode, GraphLink } from '../types';
import { ShieldAlert, ShieldCheck, Activity, Share2, FileText, AlertTriangle, Layers, ChevronDown, ChevronUp, Copy, ExternalLink, MapPin, Fingerprint, Search, Download } from 'lucide-react';

interface AnalysisCardProps {
  data: AnalysisReport;
}

const GraphVisualizer: React.FC<{ nodes: GraphNode[]; links: GraphLink[] }> = ({ nodes, links }) => {
  // Simple SVG visualization of the mocked graph data
  return (
    <div className="w-full h-96 bg-slate-900 rounded-lg border border-slate-700 relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-4 left-4 z-10 bg-slate-800/80 p-2 rounded border border-slate-700 backdrop-blur-sm">
        <div className="text-xs font-semibold text-slate-400 mb-1">GRAPH TOPOLOGY</div>
        <div className="text-sm text-emerald-400 font-mono">Fan-out / Layering</div>
      </div>
      <svg className="w-full h-full pointer-events-none absolute top-0 left-0">
        <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="20" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
            </marker>
        </defs>
        {links.map((link, i) => {
          const start = nodes.find(n => n.id === link.source);
          const end = nodes.find(n => n.id === link.target);
          if (!start || !end) return null;
          
          // Simple coordinate mapping (0-100 to percentage)
          const x1 = `${start.x}%`;
          const y1 = `${start.y}%`;
          const x2 = `${end.x}%`;
          const y2 = `${end.y}%`;

          return (
            <g key={i}>
              <line 
                x1={x1} y1={y1} x2={x2} y2={y2} 
                stroke={link.amount.includes('66k') || link.amount.includes('50k') ? "#ef4444" : "#475569"} 
                strokeWidth={link.amount.includes('66k') ? "2" : "1"}
                markerEnd="url(#arrow)"
                strokeOpacity="0.6"
              />
              <text x={(start.x + end.x)/2 + '%'} y={(start.y + end.y)/2 + '%'} fill="#94a3b8" fontSize="10" textAnchor="middle" dy="-5">
                {link.amount} {link.token}
              </text>
            </g>
          );
        })}
        {nodes.map((node) => (
          <g key={node.id}>
             {/* Halo for high risk */}
             {node.risk === 'critical' && (
                <circle cx={`${node.x}%`} cy={`${node.y}%`} r="16" fill="rgba(239,68,68,0.2)" className="animate-pulse" />
             )}
             <circle 
              cx={`${node.x}%`} cy={`${node.y}%`} r="10" 
              fill={node.risk === 'critical' ? '#ef4444' : node.risk === 'high' ? '#f97316' : '#10b981'} 
              stroke="#1e293b" strokeWidth="2"
            />
            <text x={`${node.x}%`} y={`${node.y}%`} dy="22" textAnchor="middle" fill="#cbd5e1" fontSize="11" className="font-mono font-bold">
              {node.label}
            </text>
             <text x={`${node.x}%`} y={`${node.y}%`} dy="32" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="bold">
              {node.type.toUpperCase()}
            </text>
          </g>
        ))}
      </svg>
      <div className="absolute bottom-2 right-2 text-xs text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
        Visualization Depth: 2/5 • Nodes: {nodes.length}
      </div>
    </div>
  );
};

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'graph' | 'txs'>('report');
  const [showSummary, setShowSummary] = useState(true);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High Risk': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Caution': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const riskStyle = getRiskColor(data.riskLevel);

  return (
    <div className="mt-4 w-full max-w-4xl bg-slate-950 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50">
        <div className="flex items-center gap-4 min-w-0">
          <div className="p-3 bg-slate-800 rounded-xl shrink-0 border border-slate-700 shadow-sm">
             <Activity size={24} className="text-blue-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Investigation Target</h3>
            <div className="flex items-center gap-2">
               <p className="font-mono text-slate-200 text-sm md:text-lg font-semibold truncate max-w-[200px] md:max-w-md">{data.address}</p>
               <button className="text-slate-500 hover:text-blue-400 transition-colors" title="Copy Address"><Copy size={14}/></button>
               <button className="text-slate-500 hover:text-blue-400 transition-colors" title="View on Etherscan"><ExternalLink size={14}/></button>
            </div>
          </div>
        </div>
        <div className={`px-5 py-2 rounded-lg border flex items-center gap-3 shrink-0 ${riskStyle}`}>
          {data.riskLevel === 'Safe' ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
          <div className="flex flex-col">
            <span className="font-bold text-sm uppercase leading-none mb-0.5">{data.riskLevel}</span>
            <span className="text-xs opacity-80 font-mono">Score: {data.riskScore}/100</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/30">
        <button 
          onClick={() => setActiveTab('report')}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all relative ${activeTab === 'report' ? 'text-blue-400 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}`}
        >
          <FileText size={16} /> Forensic Report
          {activeTab === 'report' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('graph')}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all relative ${activeTab === 'graph' ? 'text-blue-400 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}`}
        >
          <Share2 size={16} /> Graph Topology
          {activeTab === 'graph' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('txs')}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all relative ${activeTab === 'txs' ? 'text-blue-400 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}`}
        >
          <Layers size={16} /> Raw Transactions
          {activeTab === 'txs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>}
        </button>
      </div>

      {/* Content */}
      <div className="p-0 bg-slate-950 min-h-[400px]">
        {activeTab === 'report' && (
          <div className="space-y-0 divide-y divide-slate-800">
             {/* 1. Key Stats Bar */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-900/20">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Total Addresses</div>
                  <div className="text-xl font-mono text-slate-200 mt-1">{data.graphData.nodes.length + 3}</div>
                </div>
                 <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Transactions</div>
                  <div className="text-xl font-mono text-slate-200 mt-1">{data.recentTransactions.length * 3}</div>
                </div>
                 <div className="bg-red-950/20 border border-red-900/30 p-3 rounded-lg">
                  <div className="text-xs text-red-400 uppercase font-semibold flex items-center gap-1"><AlertTriangle size={12}/> High Risk</div>
                  <div className="text-xl font-mono text-red-400 mt-1">{data.keyAddresses.filter(k => k.riskLevel === 'critical' || k.riskLevel === 'high').length}</div>
                </div>
                 <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Volume (Est.)</div>
                  <div className="text-xl font-mono text-slate-200 mt-1">{data.volume24h}</div>
                </div>
             </div>

             {/* 2. Executive Summary */}
             <div className="p-6">
               <button onClick={() => setShowSummary(!showSummary)} className="w-full flex items-center justify-between mb-3 group">
                 <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
                   1. Executive Summary <span className="bg-blue-900/30 text-blue-400 text-[10px] px-1.5 py-0.5 rounded border border-blue-800">AI Generated</span>
                 </h4>
                 {showSummary ? <ChevronUp size={16} className="text-slate-500 group-hover:text-slate-300"/> : <ChevronDown size={16} className="text-slate-500 group-hover:text-slate-300"/>}
               </button>
               {showSummary && (
                 <div className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                   {data.executiveSummary}
                 </div>
               )}
             </div>

             {/* 3. Funds Flow Reconstruction (Timeline) */}
             <div className="p-6">
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide mb-4 flex items-center gap-2">2. Detailed Funds Flow Reconstruction</h4>
                {data.fundsFlow.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-800 rounded-lg">
                    <table className="w-full text-left text-sm text-slate-400">
                      <thead className="bg-slate-900 text-xs uppercase font-bold text-slate-500">
                        <tr>
                           <th className="px-4 py-3 border-r border-slate-800 w-12">#</th>
                           <th className="px-4 py-3 border-r border-slate-800">Phase</th>
                           <th className="px-4 py-3 border-r border-slate-800">Action</th>
                           <th className="px-4 py-3 border-r border-slate-800">From / To</th>
                           <th className="px-4 py-3 border-r border-slate-800 text-right">Amount</th>
                           <th className="px-4 py-3">Analysis</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-950/50">
                        {data.fundsFlow.map((step) => (
                          <tr key={step.id} className="hover:bg-slate-900/50 transition-colors group">
                            <td className="px-4 py-3 font-mono text-slate-600 border-r border-slate-800">{step.id}</td>
                            <td className="px-4 py-3 border-r border-slate-800 font-semibold text-slate-300">{step.stage}</td>
                            <td className="px-4 py-3 border-r border-slate-800">
                               <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${
                                 step.action === 'Theft' ? 'bg-red-950/30 text-red-400 border-red-900/30' : 
                                 step.action === 'Mix' ? 'bg-orange-950/30 text-orange-400 border-orange-900/30' : 
                                 'bg-slate-800 text-slate-400 border-slate-700'
                               }`}>
                                 {step.action}
                               </span>
                            </td>
                            <td className="px-4 py-3 border-r border-slate-800 font-mono text-xs">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-slate-400">Fr: {step.from}</span>
                                <span className="text-slate-400">To: {step.to}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 border-r border-slate-800 text-right font-mono text-slate-200 whitespace-nowrap">{step.amount}</td>
                            <td className="px-4 py-3 text-xs text-slate-400 group-hover:text-slate-300">{step.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 bg-slate-900/20 rounded-lg border border-slate-800 border-dashed">
                    No complex fund flow patterns detected for this address.
                  </div>
                )}
             </div>

             {/* 4. Attacker Profiling */}
             <div className="p-6">
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide mb-4 flex items-center gap-2">3. Attacker Profiling & Attribution</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-semibold uppercase">
                        <Search size={14} className="text-blue-400"/> Attributed Organization
                      </div>
                      <div className="text-lg font-bold text-red-400">{data.attackerProfile.identity}</div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                         <MapPin size={10} /> {data.attackerProfile.location}
                      </div>
                   </div>
                   <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-semibold uppercase">
                        <Fingerprint size={14} className="text-blue-400"/> On-Chain Fingerprints
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.attackerProfile.fingerprints.map((fp, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300">{fp}</span>
                        ))}
                      </div>
                   </div>
                </div>
             </div>

             {/* 5. Appendix: Key Addresses */}
             <div className="p-6">
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide mb-4">Appendix: Key Suspect Addresses</h4>
                <div className="overflow-x-auto border border-slate-800 rounded-lg">
                   <table className="w-full text-left text-sm text-slate-400">
                      <thead className="bg-slate-900 text-xs uppercase font-bold text-slate-500">
                        <tr>
                           <th className="px-4 py-3 border-r border-slate-800">Role</th>
                           <th className="px-4 py-3 border-r border-slate-800">Address</th>
                           <th className="px-4 py-3 border-r border-slate-800">Tag / Risk</th>
                           <th className="px-4 py-3">Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-950/50">
                        {data.keyAddresses.map((addr, i) => (
                           <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                              <td className="px-4 py-3 border-r border-slate-800 font-medium text-slate-300">{addr.role}</td>
                              <td className="px-4 py-3 border-r border-slate-800 font-mono text-xs text-blue-400">{addr.address}</td>
                              <td className="px-4 py-3 border-r border-slate-800">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${
                                   addr.riskLevel === 'critical' ? 'bg-red-950/30 text-red-400 border-red-900/30' :
                                   addr.riskLevel === 'high' ? 'bg-orange-950/30 text-orange-400 border-orange-900/30' :
                                   addr.riskLevel === 'medium' ? 'bg-yellow-950/30 text-yellow-400 border-yellow-900/30' :
                                   'bg-emerald-950/30 text-emerald-400 border-emerald-900/30'
                                }`}>
                                   {addr.riskLevel === 'critical' && <AlertTriangle size={10}/>}
                                   {addr.tag}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-500">{addr.note}</td>
                           </tr>
                        ))}
                        {data.keyAddresses.length === 0 && (
                          <tr><td colSpan={4} className="px-4 py-3 text-center text-slate-600 italic">No key suspects identified.</td></tr>
                        )}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'graph' && (
          <div className="p-6">
             <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide mb-4">Transaction Topology</h4>
             <GraphVisualizer nodes={data.graphData.nodes} links={data.graphData.links} />
             <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-800 text-xs text-slate-400 leading-relaxed">
               <span className="text-slate-200 font-semibold block mb-1">Graph Interpretation:</span>
               The topology exhibits a classic "Peel Chain" structure, where high-value assets (Red/Orange Nodes) are systematically stripped into smaller amounts through a series of intermediary wallets (Green Nodes) to obfuscate the origin. The convergence at the centralized exchange nodes suggests an exit strategy.
             </div>
          </div>
        )}

        {activeTab === 'txs' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-900 text-xs uppercase font-medium text-slate-500">
                <tr>
                  <th className="px-3 py-2">Hash</th>
                  <th className="px-3 py-2">Method</th>
                  <th className="px-3 py-2">From/To</th>
                  <th className="px-3 py-2 text-right">Value</th>
                  <th className="px-3 py-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.recentTransactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="px-3 py-2 font-mono text-blue-400">{tx.hash.slice(0,10)}...</td>
                    <td className="px-3 py-2"><span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs">{tx.method}</span></td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col text-xs font-mono">
                        <span className="text-emerald-400/80">IN: {tx.from.slice(0,6)}..</span>
                        <span className="text-orange-400/80">OUT: {tx.to.slice(0,6)}..</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right text-slate-200 font-mono">{tx.value}</td>
                    <td className="px-3 py-2 text-right text-slate-500 text-xs">{tx.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-3 flex justify-between items-center text-xs">
         <div className="flex items-center gap-2 text-slate-500">
           <span>ChainTrace Intelligence Engine v2.1.0</span>
           <span className="w-1 h-1 rounded-full bg-slate-600"></span>
           <span>Confidential</span>
         </div>
         <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors font-medium">
           <Download size={14} /> PDF Report
         </button>
      </div>
    </div>
  );
};