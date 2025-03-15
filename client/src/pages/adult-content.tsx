import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, Loader2 } from "lucide-react";

const sites = [
  { id: "pornhub", name: "Pornhub", url: "https://www.pornhub.com" },
  { id: "xvideos", name: "XVideos", url: "https://www.xvideos.com" },
  { id: "xnxx", name: "XNXX", url: "https://www.xnxx.com" },
  { id: "redtube", name: "RedTube", url: "https://www.redtube.com" }
];

export default function AdultContent() {
  const [activeTab, setActiveTab] = useState("pornhub");
  const [isLoading, setIsLoading] = useState(true);

  const currentSite = sites.find(site => site.id === activeTab);

  const handleTabChange = (siteId: string) => {
    setActiveTab(siteId);
    setIsLoading(true);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Back Button */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Link href="/">
            <button className="rounded-full bg-white p-2 focus:outline-none hover:bg-gray-50">
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
          </Link>
          <h1 className="text-xl font-semibold ml-2">Adult Content</h1>
        </div>
      </div>

      {/* Site Selection */}
      <div className="fixed top-14 left-0 right-0 bg-white z-50 border-b border-gray-200">
        <div className="flex">
          {sites.map(site => (
            <button
              key={site.id}
              onClick={() => handleTabChange(site.id)}
              className={`flex-1 h-12 text-center focus:outline-none transition-colors ${
                activeTab === site.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {site.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="fixed top-[104px] left-0 right-0 bottom-0">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
        <iframe
          key={activeTab}
          src={currentSite?.url}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
          onLoad={() => setIsLoading(false)}
          allow="fullscreen *; geolocation; autoplay; clipboard-write"
          allowFullScreen
        />
      </div>
    </div>
  );
}