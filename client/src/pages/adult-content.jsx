import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RefreshCw } from "lucide-react";

const sites = [
  { id: "pornhub", name: "Pornhub", url: "https://www.pornhub.com" },
  { id: "xvideos", name: "XVideos", url: "https://www.xvideos.com" },
  { id: "xnxx", name: "XNXX", url: "https://www.xnxx.com" },
  { id: "redtube", name: "RedTube", url: "https://www.redtube.com" }
];

export default function AdultContent() {
  const [selectedSite, setSelectedSite] = useState(sites[0].id);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef(null);

  const currentSite = sites.find(site => site.id === selectedSite);

  const handleSiteChange = (siteId) => {
    setIsLoading(true);
    setSelectedSite(siteId);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = currentSite?.url || "";
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [selectedSite]);

  return (
    <div className="min-h-screen bg-zinc-50/50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 z-50 border-b border-zinc-200/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Adult Content</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Site Selection */}
      <div className="fixed top-14 left-0 right-0 bg-white/80 backdrop-blur border-b border-zinc-200/50 p-4">
        <div className="container mx-auto flex gap-2 overflow-x-auto pb-2">
          {sites.map(site => (
            <Button
              key={site.id}
              variant={selectedSite === site.id ? "default" : "outline"}
              className="whitespace-nowrap"
              onClick={() => handleSiteChange(site.id)}
            >
              {site.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-32 h-[calc(100vh-8rem)] w-full">
        <div className="relative h-full w-full">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-4 border-zinc-200 border-t-zinc-800 animate-spin mb-4"></div>
                <p className="text-zinc-500 font-medium">Loading content...</p>
              </div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={currentSite?.url}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            title="Adult Content"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
          />
        </div>
      </main>
    </div>
  );
}