import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "wouter";
import { useCloudStorage } from "@/hooks/useCloudStorage";
import { getLoginUrl } from "@/const";
import ProgressDashboard from "@/components/ProgressDashboard";

interface DisplaySession {
  id: string;
  timestamp: string;
  motionName: string;
  duration: string;
  frameCount: number;
  detailedAnalysis?: any;
  videoUrl?: string;
  cloudId?: number;
}

export default function SessionHistory() {
  const { sessions: rawSessions, sessionsLoading, deleteSession, isAuthenticated } = useCloudStorage();
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sessionToShare, setSessionToShare] = useState<DisplaySession | null>(null);

  // Sort by timestamp (newest first)
  const sessions: DisplaySession[] = [...rawSessions].sort((a: DisplaySession, b: DisplaySession) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      await deleteSession(id);
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

  const handleShare = (session: DisplaySession) => {
    setSessionToShare(session);
    setShareModalOpen(true);
  };

  const shareToTwitter = () => {
    if (!sessionToShare) return;
    const score = sessionToShare.detailedAnalysis?.overallScore || 'N/A';
    const text = `Just analyzed my ${sessionToShare.motionName} with Aligned! \ud83c\udfc8\n\nScore: ${score}/100\nDuration: ${sessionToShare.duration}s\n\n#Aligned #FormAnalysis #SportsTech`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    if (!sessionToShare) return;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const shareToReddit = () => {
    if (!sessionToShare) return;
    const score = sessionToShare.detailedAnalysis?.overallScore || 'N/A';
    const title = `Just analyzed my ${sessionToShare.motionName} - Score: ${score}/100`;
    const url = `https://www.reddit.com/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const shareToTikTok = () => {
    if (!sessionToShare) return;
    const score = sessionToShare.detailedAnalysis?.overallScore || 'N/A';
    const text = `Just analyzed my ${sessionToShare.motionName} with Aligned! \ud83c\udfc8\n\nScore: ${score}/100\nDuration: ${sessionToShare.duration}s\n\n#Aligned #FormAnalysis #SportsTech #FitnessCheck`;
    navigator.clipboard.writeText(text);
    alert('TikTok caption copied! Open TikTok app to create a video with this caption.');
  };

  const shareToInstagram = () => {
    if (!sessionToShare) return;
    const score = sessionToShare.detailedAnalysis?.overallScore || 'N/A';
    const text = `Just analyzed my ${sessionToShare.motionName} with Aligned! \ud83c\udfc8\n\nScore: ${score}/100 \ud83d\udcca\nDuration: ${sessionToShare.duration}s \u23f1\ufe0f\n\n#Aligned #FormAnalysis #SportsTech #FitnessMotivation #AthleteLife`;
    navigator.clipboard.writeText(text);
    alert('Instagram caption copied! Open Instagram app to create a post with this caption.');
  };

  const copyShareLink = () => {
    if (!sessionToShare) return;
    const score = sessionToShare.detailedAnalysis?.overallScore || 'N/A';
    const text = `Check out my ${sessionToShare.motionName} analysis on Aligned!\nScore: ${score}/100 | Duration: ${sessionToShare.duration}s\n${window.location.origin}`;
    navigator.clipboard.writeText(text);
    alert('Share text copied to clipboard!');
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

        {/* Auth Banner */}
        {!isAuthenticated && (
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-blue-300 font-semibold">Sign in to sync your sessions across devices</p>
              <p className="text-blue-400/70 text-sm">Your local sessions are shown below. Sign in to save them to the cloud.</p>
            </div>
            <Button 
              onClick={() => window.location.href = getLoginUrl()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Sign In
            </Button>
          </div>
        )}

        {/* Share Modal */}
        {shareModalOpen && sessionToShare && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShareModalOpen(false)}>
            <div className="bg-[#1a1f2e] rounded-lg p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Share Your Progress</h2>
                <button 
                  onClick={() => setShareModalOpen(false)}
                  className="text-gray-400 hover:text-white text-3xl leading-none"
                >
                  ×
                </button>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-lg mb-2">{sessionToShare.motionName}</h3>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span>Score: {sessionToShare.detailedAnalysis?.overallScore || 'N/A'}/100</span>
                  <span>Duration: {sessionToShare.duration}s</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={shareToTwitter}
                  className="w-full bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
                >
                  Share on Twitter
                </Button>
                <Button 
                  onClick={shareToFacebook}
                  className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white"
                >
                  Share on Facebook
                </Button>
                <Button 
                  onClick={shareToReddit}
                  className="w-full bg-[#FF4500] hover:bg-[#e63e00] text-white"
                >
                  Share on Reddit
                </Button>
                <Button 
                  onClick={shareToTikTok}
                  className="w-full bg-[#000000] hover:bg-[#1a1a1a] text-white border-2 border-[#00f2ea]"
                >
                  Copy for TikTok
                </Button>
                <Button 
                  onClick={shareToInstagram}
                  className="w-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white"
                >
                  Copy for Instagram
                </Button>
                <Button 
                  onClick={copyShareLink}
                  variant="outline"
                  className="w-full"
                >
                  Copy Share Text
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Progress Dashboard */}
        {!sessionsLoading && sessions.length > 0 && (
          <ProgressDashboard sessions={sessions} />
        )}

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
                Only the first 2 selected sessions are shown in comparison view
              </p>
            )}
          </div>
        )}

        {/* Sessions List */}
        <div className="bg-[#1a1f2e] rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">
            All Sessions
            {isAuthenticated && <span className="text-sm font-normal text-green-400 ml-2">Synced to cloud</span>}
          </h2>
          
          {sessionsLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
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
                      onClick={() => handleShare(session)} 
                      variant="outline" 
                      size="sm"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Share
                    </Button>
                    <Button 
                      onClick={() => handleDelete(session.id)} 
                      variant="outline" 
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
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
