import React, { useState } from "react";
import { ChevronDown, Home, Activity, Shield, Bot } from "lucide-react";

export const Navigation = () => {
  const [openGroups, setOpenGroups] = useState(["core"]);
  
  const toggle = (group) => {
    setOpenGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]);
  };

  const groups = [
    { id: "core", name: "Development", icon: <Home size={18} />, items: ["Dashboard", "Project Manager", "Workspace Shell", "Execution Queue"] },
    { id: "intel", name: "Intelligence", icon: <Bot size={18} />, items: ["Sovereign Control", "Evo Cast Router", "Prompt Registry", "Reality Twin"] },
    { id: "foundry", name: "Model Foundry", icon: <Activity size={18} />, items: ["Evo Model Foundry", "Forge Labs", "Evo Duel Arena", "AI Generator Hub"] },
    { id: "biz", name: "Business & Legal", icon: <Shield size={18} />, items: ["Proof Console", "Commerce Core", "Grading & Release", "Studio Settings"] }
  ];

  return (
    <nav className="w-64 border-r border-slate-800 h-full p-4 bg-slate-900/50">
      {groups.map(group => (
        <div key={group.id} className="mb-4">
          <button 
            onClick={() => toggle(group.id)} 
            className="flex items-center justify-between w-full p-2 text-slate-400 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              {group.icon} {group.name}
            </span>
            <ChevronDown 
              size={14} 
              className={`transition-transform ${openGroups.includes(group.id) ? "rotate-180" : ""}`} 
            />
          </button>
          {openGroups.includes(group.id) && (
            <div className="ml-8 mt-2 space-y-1">
              {group.items.map(item => (
                <div 
                  key={item} 
                  className="p-1.5 text-sm text-slate-500 hover:text-indigo-400 cursor-pointer transition-colors flex items-center gap-2"
                >
                  {item === 'Bot Automation' && <Bot size={14} />}
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};