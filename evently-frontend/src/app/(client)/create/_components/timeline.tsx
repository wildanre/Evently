import React from "react";

const Timeline = () => {
  return (
    <div className="flex flex-row">
      <div className="flex flex-col items-center">
        {/* Titik atas */}
        <div className="w-2 h-2 mt-2 rounded-full bg-white border border-white" />

        {/* Garis putus-putus */}
        <div className="h-9 border-l border-dashed border-gray-400" />

        {/* Titik bawah */}
        <div className="w-2 h-2 rounded-full bg-transparent border border-gray-400" />
      </div>

      {/* Konten */}
      <div className="ml-4 gap-5 flex flex-col">
        <div className="">Start</div>
        <div className="">End</div>
      </div>
    </div>
  );
};

export default Timeline;
