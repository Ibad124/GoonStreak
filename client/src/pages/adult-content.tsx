import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";

const sites = [
  { id: "pornhub", name: "Pornhub", url: "https://www.pornhub.com" },
  { id: "xvideos", name: "XVideos", url: "https://www.xvideos.com" },
  { id: "xnxx", name: "XNXX", url: "https://www.xnxx.com" },
  { id: "redtube", name: "RedTube", url: "https://www.redtube.com" }
];

export default function AdultContent() {
  const [activeTab, setActiveTab] = useState("pornhub");

  const handleSiteClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-white">
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
      <div className="fixed top-14 left-0 right-0 bg-white border-b border-gray-200">
        <div className="flex">
          {sites.map(site => (
            <button
              key={site.id}
              onClick={() => setActiveTab(site.id)}
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
      <div className="pt-28 pb-4 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex flex-col gap-2">
            {sites.map(site => (
              <button
                key={site.id}
                onClick={() => handleSiteClick(site.url)}
                className={`w-full h-12 px-4 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${
                  activeTab === site.id ? 'border-blue-600' : ''
                }`}
              >
                {site.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}