import React, { useState } from 'react';

export function NightForgePanel() {
  const [jobs, setJobs] = useState([
    { id: 'NF-01', title: 'Refactoring utils.js', status: 'RUNNING', progress: 45 },
    { id: 'NF-02', title: 'Scanning memory ledger', status: 'PENDING', progress: 0 },
    { id: 'NF-03', title: 'Generating missing tests', status: 'PAUSED', progress: 12 },
  ]);

  const handleUpdateStatus = (id, status) => {
    setJobs(prev => prev.map(job => job.id === id ? { ...job, status } : job));
  };

  const handleDeleteJob = (id) => {
    setJobs(prev => prev.filter(job => job.id !== id));
  };

  return (
    <div className="flex-1 bg-gray-900 border-t border-gray-800 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-300 font-mono tracking-wider flex items-center">
          <span className="text-purple-500 mr-2">☾</span>
          NIGHTFORGE DAEMON
        </h3>
        <span className="px-2 py-0.5 bg-purple-900/30 text-purple-400 text-[10px] rounded border border-purple-500/30 animate-pulse">
          ACTIVE
        </span>
      </div>

      <div className="space-y-3">
        {jobs.map(job => (
          <div key={job.id} className="bg-gray-800 border border-gray-700 rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-300 font-medium">{job.title}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono
                ${job.status === 'RUNNING' ? 'bg-blue-900/50 text-blue-400' : ''}
                ${job.status === 'PENDING' ? 'bg-gray-700 text-gray-400' : ''}
                ${job.status === 'PAUSED' ? 'bg-yellow-900/50 text-yellow-500' : ''}
              `}>
                {job.status}
              </span>
            </div>
            
            <div className="w-full bg-gray-900 h-1 rounded overflow-hidden mb-2">
              <div 
                className={`h-full ${job.status === 'RUNNING' ? 'bg-blue-500' : 'bg-gray-600'}`} 
                style={{ width: `${job.progress}%` }}
              ></div>
            </div>

            <div className="flex justify-end space-x-2 mt-2">
              {job.status === 'RUNNING' && (
                <button 
                  onClick={() => handleUpdateStatus(job.id, 'PAUSED')}
                  className="text-[10px] text-gray-400 hover:text-white px-2 py-1 bg-gray-700 rounded transition-colors"
                >
                  PAUSE
                </button>
              )}
              {job.status === 'PAUSED' && (
                <button 
                  onClick={() => handleUpdateStatus(job.id, 'RUNNING')}
                  className="text-[10px] text-blue-400 hover:text-blue-300 px-2 py-1 bg-blue-900/30 border border-blue-500/30 rounded transition-colors"
                >
                  RESUME
                </button>
              )}
              <button 
                onClick={() => handleDeleteJob(job.id)}
                className="text-[10px] text-red-400 hover:text-red-300 px-2 py-1 bg-red-900/30 border border-red-500/30 rounded transition-colors"
              >
                ABORT
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
