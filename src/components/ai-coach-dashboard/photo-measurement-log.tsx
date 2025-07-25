"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Image as ImageIcon } from "lucide-react";

const initialEntries = [
  { date: "2024-06-01", photo: null, weight: "72 kg", waist: "80 cm" },
  { date: "2024-06-07", photo: null, weight: "71 kg", waist: "79 cm" },
];

export default function PhotoMeasurementLog() {
  const [entries, setEntries] = useState(initialEntries);
  const [selected, setSelected] = useState<number | null>(null);

  // Placeholder for upload
  const handleUpload = () => {
    alert("Photo upload coming soon!");
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 shadow-lg border-0">
      <CardContent className="py-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Camera className="h-6 w-6 text-blue-500" />
          <span className="text-lg font-bold text-blue-700">Photo & Measurement Log</span>
        </div>
        <div className="flex flex-col gap-4">
          {entries.map((entry, idx) => (
            <div key={idx} className={`flex items-center gap-4 p-3 rounded-lg shadow-sm ${selected === idx ? "ring-2 ring-blue-400" : ""}`} onClick={() => setSelected(idx)}>
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                {entry.photo ? (
                  <img src={entry.photo} alt="Progress" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800 dark:text-gray-100">{entry.date}</div>
                <div className="text-xs text-gray-500">Weight: {entry.weight} | Waist: {entry.waist}</div>
              </div>
            </div>
          ))}
        </div>
        <Button onClick={handleUpload} className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <Camera className="h-5 w-5 mr-2" /> Upload New Photo
        </Button>
      </CardContent>
    </Card>
  );
} 