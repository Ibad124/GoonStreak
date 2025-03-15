import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, Maximize2, Minimize2, Loader2 } from "lucide-react";

const sites = [
  { id: "pornhub", name: "Pornhub", url: "https://www.pornhub.com" },
  { id: "xvideos", name: "XVideos", url: "https://www.xvideos.com" },
  { id: "xnxx", name: "XNXX", url: "https://www.xnxx.com" },
  { id: "redtube", name: "RedTube", url: "https://www.redtube.com" }
];

export default function AdultContent() {
  const [selectedSite, setSelectedSite] = useState("pornhub");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentSite = sites.find(site => site.id === selectedSite);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <ChevronLeft className="h-5 w-5 text-gray-700" />
          <span className="text-xl font-semibold">Adult Content</span>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-zinc-900 text-white flex items-center justify-between px-2 h-10 border-b border-zinc-800">
        <div className="flex gap-1">
          {sites.map(site => (
            <button
              key={site.id}
              onClick={() => {
                setSelectedSite(site.id);
                setIsLoading(true);
              }}
              className={`px-4 h-8 rounded text-sm transition-colors ${
                selectedSite === site.id
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {site.name}
            </button>
          ))}
        </div>
        <button
          onClick={toggleFullscreen}
          className="p-2 hover:bg-zinc-800 rounded transition-colors"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Content Viewer */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
        <iframe
          key={selectedSite}
          src={currentSite?.url}
          className="w-full h-full"
          style={{ border: 'none' }}
          onLoad={() => setIsLoading(false)}
          allowFullScreen
          allow="fullscreen"
        />
      </div>
    </div>
  );
}