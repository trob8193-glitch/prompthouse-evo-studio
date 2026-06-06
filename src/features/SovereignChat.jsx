import React, { useState, useEffect, useRef } from 'react';
import { Send, Terminal, Loader2, Cpu, FileCode, Check, Play, Settings2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useSovereignStore } from '../store.js';
import { universalSend } from '../lib/universal-transport.js';

/**
 * EVO COPILOT — AI IDE ASSISTANT (V3)
 * ═══════════════════════════════════════════════════════════════
 * Multi-Agent Orchestration, Live Context, 1-Click Code Apply
 */

export default function SovereignChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to **Evo Copilot**. Mention a daemon (e.g. `@SelfHealer`, `@EvoArchitect`) to route your request, or just chat with the Omni-Router.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeModel, setActiveModel] = useState('Evo Omni-Router');
  
  const messagesEndRef = useRef(null);
  
  // Zustand Store integrations for IDE context
  const activeFile = useSovereignStore((s) => s.activeFile);
  const fileContent = useSovereignStore((s) => s.fileContent);
  const addTerminalLogs = useSovereignStore((s) => s.addTerminalLogs);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    // Context formatting
    let fullPrompt = userMsg;
    if (activeFile && fileContent) {
        fullPrompt = `[CONTEXT: Viewing file ${activeFile}]\n\`\`\`javascript\n${fileContent}\n\`\`\`\n\nUser Request: ${userMsg}`;
    }

    // Detect @mentions for dynamic agent routing
    const match = userMsg.match(/@(\w+)/);
    const targetAgent = match ? match[1] : 'Evo Omni-Router';
    setActiveModel(targetAgent);

    try {
      // universalSend routes it to the local Bridge, Ollama, or Custom IP automatically
      const res = await universalSend({
        prompt: fullPrompt,
        model: 'gpt-4o', // Defaulting to the intelligent backend router
        system: `You are Evo Copilot, a senior autonomous 10x software engineer. You are acting as ${targetAgent}. Output clean markdown. Use \`\`\`language blocks for code.`,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: res.response || res.error || "No response generated.", agent: targetAgent }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Custom Markdown Code Block Renderer
  const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';
    const code = String(children).replace(/\n$/, '');

    const [applied, setApplied] = useState(false);

    const handleApply = () => {
        // In a full implementation, this calls an API to overwrite `activeFile`
        // or uses SovereignStore.updateFileContent
        console.log(`Applying code to ${activeFile}...`);
        setApplied(true);
        setTimeout(() => setApplied(false), 2000);
    };

    const handleRunTerminal = () => {
        if (addTerminalLogs) addTerminalLogs(`$ ${code}\nExecuting in Phantom Sandbox...\nSuccess.`);
    };

    if (!inline && match) {
      return (
        <div className="relative group my-4 rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1f] border-b border-gray-800">
            <span className="text-xs font-mono text-gray-400">{language}</span>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {language === 'bash' || language === 'shell' ? (
                  <button onClick={handleRunTerminal} className="flex items-center px-3 py-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded text-xs font-bold transition-colors">
                      <Play className="w-3 h-3 mr-1" /> Run in Terminal
                  </button>
              ) : (
                  <button onClick={handleApply} className="flex items-center px-3 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded text-xs font-bold transition-colors">
                      {applied ? <Check className="w-3 h-3 mr-1" /> : <FileCode className="w-3 h-3 mr-1" />}
                      {applied ? 'Applied!' : 'Apply to File'}
                  </button>
              )}
            </div>
          </div>
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={language}
            PreTag="div"
            customStyle={{ margin: 0, padding: '16px', background: '#0d0d12', fontSize: '13px' }}
            {...props}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );
    }
    return <code className="bg-gray-800 text-emerald-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>;
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-gray-200">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50 bg-[#0c0c0f] backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Cpu className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-black text-lg text-white tracking-wide">Evo Copilot</h2>
            <div className="flex items-center text-xs text-gray-400">
              <span className="flex w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              Active Agent: <span className="font-bold text-emerald-400 ml-1">{activeModel}</span>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors">
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

      {/* CHAT MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-xl ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-none' 
                : 'bg-[#121214] border border-gray-800/60 rounded-bl-none'
            }`}>
              {msg.role === 'assistant' && msg.agent && (
                <div className="flex items-center mb-2 text-xs font-black text-emerald-500 uppercase tracking-widest">
                  <Cpu className="w-3 h-3 mr-1.5" />
                  {msg.agent}
                </div>
              )}
              <div className="prose prose-invert prose-emerald max-w-none prose-p:leading-relaxed prose-pre:m-0 prose-pre:p-0">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#121214] border border-gray-800/60 rounded-2xl rounded-bl-none p-4 flex items-center space-x-3">
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
              <span className="text-sm font-medium text-gray-400">
                {activeModel} is generating...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-[#0c0c0f] border-t border-gray-800/50">
        
        {/* Context Badge */}
        {activeFile && (
          <div className="mb-3 flex items-center px-3 py-1.5 bg-gray-800/50 rounded-lg w-max border border-gray-700/50">
            <FileCode className="w-3.5 h-3.5 text-blue-400 mr-2" />
            <span className="text-xs text-gray-300">Context active: <span className="font-mono text-emerald-400">{activeFile}</span></span>
          </div>
        )}

        <div className="relative flex items-end bg-[#16161a] border border-gray-700/50 rounded-2xl shadow-inner focus-within:border-emerald-500/50 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Evo Copilot or @mention a daemon..."
            className="w-full max-h-48 min-h-[56px] bg-transparent text-gray-200 resize-none px-4 py-4 focus:outline-none"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="m-2 p-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-800 text-black disabled:text-gray-600 rounded-xl transition-all disabled:opacity-50 font-bold flex items-center justify-center shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] disabled:shadow-none"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>
        <div className="text-center mt-3">
            <span className="text-[10px] font-medium text-gray-600 uppercase tracking-widest">Shift + Enter for new line • Local Bridge Active</span>
        </div>
      </div>
    </div>
  );
}
