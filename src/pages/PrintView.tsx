import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Printer } from 'lucide-react';

export default function PrintView() {
  const { id } = useParams();
  const [doc, setDoc] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then(r => r.json())
      .then(setDoc);
  }, [id]);

  if (!doc) return <div className="p-8 text-center">Loading document...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:py-0 print:bg-white">
      {/* Floating Action Bar - Hidden during print */}
      <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 flex items-center gap-4 no-print border border-gray-200">
        <p className="text-sm text-gray-600 font-medium">A4 Landscape Print View</p>
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Printer size={18} /> Print Document
        </button>
      </div>

      {/* A4 Landscape Container */}
      <div className="print-container shadow-2xl">
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: doc.html_content }} 
        />
      </div>
    </div>
  );
}
