import React, { useState } from "react";
import { Lineups } from "./LineUps";
import { Timeline } from "./TimeLine";

export function ScorecardMenu() {
  const [activeTab, setActiveTab] = useState<"lineups" | "timeline">("lineups");

  return (
    <div className="mt-6">
      {/* Tab menu */}
      <div className="flex border-b border-gray-300">
        <button
          onClick={() => setActiveTab("lineups")}
          className={`flex-1 py-2 text-center font-medium ${
            activeTab === "lineups"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Lineups
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`flex-1 py-2 text-center font-medium ${
            activeTab === "timeline"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Timeline
        </button>
      </div>

      {/* Tab content */}
      <div className="p-4">
        {activeTab === "lineups" && <Lineups />}
        {activeTab === "timeline" && <Timeline />}
      </div>
    </div>
  );
}
