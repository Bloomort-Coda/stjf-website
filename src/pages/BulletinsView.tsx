import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar } from 'lucide-react';

export default function BulletinsView() {
  const [bulletins, setBulletins] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/documents').then(r => r.json()).then(setBulletins);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-sans font-bold mb-4 tracking-tight">Weekly Bulletins</h1>
        <div className="w-24 h-1 bg-[var(--primary)] mx-auto rounded-full opacity-80"></div>
      </div>
      
      <div className="bg-[var(--card)] p-8 rounded-3xl border border-[var(--border)] mb-12 shadow-md text-center">
        <p className="text-lg opacity-80 leading-relaxed max-w-2xl mx-auto">
          Catch up on the latest news, announcements, and events in our parish. Bulletins are uploaded weekly.
        </p>
      </div>

      <div className="space-y-6">
        {bulletins.length === 0 ? (
          <div className="text-center py-12 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
            <p className="text-lg opacity-60">No bulletins available at the moment.</p>
          </div>
        ) : null}
        
        {bulletins.map(doc => (
          <Link 
            key={doc.id} 
            to={`/bulletin/${doc.id}`}
            className="block bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="flex items-center gap-6">
              <div className="bg-[var(--primary)]/10 p-4 rounded-xl text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-[var(--primary-foreground)] transition-colors shadow-sm">
                <FileText size={28} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-sans font-bold mb-2 group-hover:text-[var(--primary)] transition-colors">{doc.title}</h2>
                <div className="flex items-center gap-2 text-sm font-medium opacity-70">
                  <Calendar size={16} />
                  <span>{new Date(doc.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
              <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)] transition-colors">
                <span className="text-xl">&rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
