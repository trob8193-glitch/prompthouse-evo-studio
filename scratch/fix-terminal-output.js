import fs from 'node:fs';

const path = 'src/components/Terminal.jsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `        )}
      </div>

          </div>
        ))}`;

const replacement = `        )}
      </div>

      {/* Terminal Output */}
      <div 
        ref={scrollRef}
        className={\`flex-1 overflow-auto p-6 font-mono text-[11px] space-y-1.5 selection:bg-indigo-500/40 \${s.logBg} scrollbar-hide\`}
      >
        {logs.map((log) => (
          <div key={log.id} className="flex flex-col gap-1 mb-2 animate-in fade-in slide-in-from-left-1 duration-200">
            <div className="flex gap-4 leading-relaxed">
              <span className="text-slate-700 shrink-0 select-none text-[9px] mt-0.5">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
              <span className={\`break-all whitespace-pre-wrap flex-1 \${
                log.type === 'command' ? 'text-white font-bold' :
                log.type === 'error' ? 'text-rose-400 drop-shadow-[0_0_5px_rgba(251,113,133,0.3)]' :
                log.type === 'success' ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]' :
                log.type === 'system' ? 'text-indigo-400 font-black' : 
                s.text
              }\`}>
                {log.content}
              </span>
            </div>
            {log.signature && (
              <div className="flex items-center gap-3 ml-12 text-[8px] font-black uppercase tracking-widest text-indigo-500/60">
                <span className="flex items-center gap-1"><Shield size={8} /> TRUTH_SIG: {log.signature}</span>
                <span className="flex items-center gap-1"><Zap size={8} /> LATENCY: {log.duration}ms</span>
                <span className="text-emerald-500/50"> [REALITY_SIGNED]</span>
              </div>
            )}
          </div>
        ))}
      </div>`;

// Since there could be CRLF vs LF line endings, let's normalize line endings in both target and content to do the find & replace
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = targetStr.replace(/\r\n/g, '\n');
const normalizedReplacement = replacement.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
  const result = normalizedContent.replace(normalizedTarget, normalizedReplacement);
  // Write back using CRLF if the original file had CRLF
  const hasCRLF = content.includes('\r\n');
  fs.writeFileSync(path, hasCRLF ? result.replace(/\n/g, '\r\n') : result, 'utf8');
  console.log('Successfully restored Terminal Output container!');
} else {
  console.error('Target container block not found in Terminal.jsx!');
}
