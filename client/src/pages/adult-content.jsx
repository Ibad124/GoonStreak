import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const sites = [
  { id: "pornhub", name: "Pornhub", url: "https://www.pornhub.com" },
  { id: "xvideos", name: "XVideos", url: "https://www.xvideos.com" },
  { id: "xnxx", name: "XNXX", url: "https://www.xnxx.com" },
  { id: "redtube", name: "RedTube", url: "https://www.redtube.com" }
];

export default function AdultContent() {
  const [selectedSite, setSelectedSite] = useState(sites[0].id);

  const handleSiteClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur z-50 border-b border-zinc-200/50">
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
              onClick={() => handleSiteClick(sites.find(site => site.id === selectedSite)?.url)}
            >
              <ExternalLink className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Site Selection */}
      <main className="container mx-auto px-4 pt-24">
        <div className="max-w-lg mx-auto">
          <div className="flex flex-col gap-2">
            {sites.map(site => (
              <motion.div
                key={site.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={selectedSite === site.id ? "default" : "outline"}
                  className="w-full h-12 rounded-full flex items-center justify-between text-lg"
                  onClick={() => {
                    setSelectedSite(site.id);
                    handleSiteClick(site.url);
                  }}
                >
                  <span>{site.name}</span>
                  <ExternalLink className="h-5 w-5 opacity-50" />
                </Button>
              </motion.div>
            ))}
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
              onClick={() => handleSiteClick(site.url)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              {site.name}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}