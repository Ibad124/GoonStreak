import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const sites = [
  { id: "pornhub", name: "Pornhub", url: "https://www.pornhub.com" },
  { id: "xvideos", name: "XVideos", url: "https://www.xvideos.com" },
  { id: "xnxx", name: "XNXX", url: "https://www.xnxx.com" },
  { id: "redtube", name: "RedTube", url: "https://www.redtube.com" }
];

export default function AdultContent() {
  const [selectedSite, setSelectedSite] = useState(sites[0].id);
  const [viewerKey, setViewerKey] = useState(0); // Used to force viewer refresh
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur z-50 border-b border-zinc-200/50">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold ml-2">Adult Content</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {/* Site Selection Tabs */}
        <div className="bg-white border-b border-zinc-200/50">
          <div className="container mx-auto px-4">
            <div className="flex gap-2">
              {sites.map(site => (
                <Button
                  key={site.id}
                  variant={selectedSite === site.id ? "default" : "ghost"}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2 h-12"
                  onClick={() => {
                    setSelectedSite(site.id);
                    setViewerKey(prev => prev + 1);
                    setIsLoading(true);
                  }}
                >
                  {site.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="container mx-auto px-4 pt-4">
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            )}
            <iframe
              key={viewerKey}
              src={sites.find(site => site.id === selectedSite)?.url}
              style={{ width: '100%', height: '100%', border: 'none' }}
              onLoad={() => setIsLoading(false)}
              allowFullScreen
              allow="fullscreen"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-4 left-4 right-4 flex justify-center">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur shadow-lg rounded-full px-6 py-3 flex gap-4"
        >
          {sites.map(site => (
            <motion.button
              key={site.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedSite(site.id);
                setViewerKey(prev => prev + 1);
                setIsLoading(true);
              }}
              className={`text-sm font-medium transition-colors ${
                selectedSite === site.id 
                  ? 'text-primary'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {site.name}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}