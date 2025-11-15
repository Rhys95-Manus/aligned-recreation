import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Link } from "wouter";

interface SavedSession {
  id: string;
  timestamp: string;
  motionName: string;
  duration: string;
  frameCount: number;
  detailedAnalysis?: any;
}

export default function SessionHistory() {
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  useEffect(() => {
    // Load sessions from localStorage
    const savedSessions = JSON.parse(localStorage.getItem('alignedSessions') || '[]');
    // Sort by timestamp (newest first)
    savedSessions.sort((a: SavedSession, b: SavedSession) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setSessions(savedSessions);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      const updatedSessions = sessions.filter(s => s.id !== id);
      setSessions(updatedSessions);
      localStorage.setItem('alignedSessions', JSON.stringify(updatedSessions));
    }
  };

  const toggleSessionSelection = (id: string) => {
    setSelectedSessions(prev => 
      prev.includes(id) 
        ? prev.filter(sid => sid !== id)
        : [...prev, id]
    );
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="outline">
              ← Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Session History</h1>
          <div className="w-32"></div>
        </div>

        {/* Stats Summary */}
        <div className="bg-[#1a1f2e] rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400">{sessions.length}</div>
              <div className="text-gray-400">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400">
                {sessions.filter(s => s.motionName.includes('Throw')).length}
              </div>
              <div className="text-gray-400">Throwing Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400">
                {selectedSessions.length}
              </div>
              <div className="text-gray-400">Selected for Comparison</div>
            </div>
          </div>
        </div>

        {/* Comparison View */}
        {selectedSessions.length >= 2 && (
          <div className="bg-[#1a1f2e] rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Comparison View</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedSessions.slice(0, 2).map(sessionId => {
                const session = sessions.find(s => s.id === sessionId);
                if (!session) return null;
                
                return (
                  <div key={sessionId} className="bg-gray-800 rounded-lg p-4">
                    <h3 className="font-bold text-lg mb-2">{session.motionName}</h3>
                    <p className="text-sm text-gray-400 mb-2">{formatDate(session.timestamp)}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="font-semibold">{session.duration}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Frames:</span>
                        <span className="font-semibold">{session.frameCount}</span>
                      </div>
                      {session.detailedAnalysis?.overallScore && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Score:</span>
                          <span className="font-semibold text-green-400">
                            {session.detailedAnalysis.overallScore}/100
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedSessions.length > 2 && (
              <p className="text-sm text-yellow-400 mt-4">
                ⚠️ Only the first 2 selected sessions are shown in comparison view
              </p>
            )}
          </div>
        )}

        {/* Sessions List */}
        <div className="bg-[#1a1f2e] rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">All Sessions</h2>
          
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No saved sessions yet</p>
              <p className="text-gray-500">Complete a motion analysis and click "Save Session" to track your progress</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map(session => (
                <div 
                  key={session.id} 
                  className={`bg-gray-800 rounded-lg p-4 flex items-center justify-between border-2 ${
                    selectedSessions.includes(session.id) ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedSessions.includes(session.id)}
                      onChange={() => toggleSessionSelection(session.id)}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{session.motionName}</h3>
                      <p className="text-sm text-gray-400">{formatDate(session.timestamp)}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-gray-500">Duration: {session.duration}s</span>
                        <span className="text-gray-500">Frames: {session.frameCount}</span>
                        {session.detailedAnalysis?.overallScore && (
                          <span className="text-green-400 font-semibold">
                            Score: {session.detailedAnalysis.overallScore}/100
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleDelete(session.id)} 
                      variant="outline" 
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
