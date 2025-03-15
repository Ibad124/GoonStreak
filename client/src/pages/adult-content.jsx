import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RefreshCw, ExternalLink, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const sites = [
  { id: "pornhub", name: "Pornhub", url: "https://www.pornhub.com" },
  { id: "xvideos", name: "XVideos", url: "https://www.xvideos.com" },
  { id: "xnxx", name: "XNXX", url: "https://www.xnxx.com" },
  { id: "redtube", name: "RedTube", url: "https://www.redtube.com" }
];

export default function AdultContent() {
  const [selectedSite, setSelectedSite] = useState(sites[0].id);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const iframeRef = useRef(null);
  const { toast } = useToast();

  const currentSite = sites.find(site => site.id === selectedSite);

  const handleSiteChange = useCallback((siteId) => {
    setIsLoading(true);
    setLoadError(false);
    setSelectedSite(siteId);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setLoadError(false);
    if (iframeRef.current) {
      iframeRef.current.src = currentSite?.url;
    }
  }, [currentSite?.url]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setLoadError(true);
    toast({
      title: "Failed to load content",
      description: "Please try refreshing or selecting a different site.",
      variant: "destructive",
    });
  }, [toast]);

  const openInNewTab = useCallback((url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

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
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => openInNewTab(currentSite?.url)}
            >
              <ExternalLink className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
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
        <div className="relative h-full w-full bg-white rounded-lg shadow-lg overflow-hidden">
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10"
              >
                <div className="flex flex-col items-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-zinc-500 font-medium">Loading {currentSite?.name}...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loadError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-500 font-medium mb-4">Failed to load content</p>
                <Button onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              src={currentSite?.url}
              style={{ width: '100%', height: '100%', border: 'none' }}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="Adult Content"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
              allow="fullscreen"
              loading="eager"
              importance="high"
            />
          )}
        </div>
      </main>

      {/* Quick Access Links */}
      <div className="fixed bottom-4 left-4 right-4 flex justify-center">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur shadow-lg rounded-full px-6 py-3 flex space-x-4"
        >
          {sites.map(site => (
            <motion.a 
              key={site.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              {site.name}
            </motion.a>
          ))}
        </motion.div>
      </div>
    </div>
  );
}