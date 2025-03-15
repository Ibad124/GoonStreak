import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ArrowUpRight } from "lucide-react";

const sites = [
  { id: "pornhub", name: "Pornhub", url: "https://www.pornhub.com" },
  { id: "xvideos", name: "XVideos", url: "https://www.xvideos.com" },
  { id: "xnxx", name: "XNXX", url: "https://www.xnxx.com" },
  { id: "redtube", name: "RedTube", url: "https://www.redtube.com" }
];

export default function AdultContent() {
  const [activeTab, setActiveTab] = useState("pornhub");

  const handleSiteClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold ml-2">Adult Content</h1>
        </div>
      </div>

      {/* Site Selection */}
      <div className="fixed top-14 left-0 right-0 bg-white border-b border-gray-200">
        <div className="container mx-auto flex overflow-x-auto">
          {sites.map(site => (
            <Button
              key={site.id}
              variant={activeTab === site.id ? "default" : "ghost"}
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 px-4 py-2 h-12"
              onClick={() => {
                setActiveTab(site.id);
                handleSiteClick(site.url);
              }}
            >
              {site.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-28 pb-4 container mx-auto px-4">
        <div className="bg-white rounded-lg p-4">
          <p className="text-gray-500 text-center mb-4">Select a site above to get started</p>
          <div className="grid gap-3">
            {sites.map(site => (
              <Button
                key={site.id}
                variant="outline"
                className="w-full h-12 justify-between"
                onClick={() => handleSiteClick(site.url)}
              >
                <span>{site.name}</span>
                <ArrowUpRight className="h-4 w-4 opacity-50" />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}