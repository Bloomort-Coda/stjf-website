import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';

export default function BulletinDetailView() {
  const { id } = useParams();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then(r => r.json())
      .then(data => {
        setDoc(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-12 text-center text-lg opacity-60">Loading bulletin...</div>;
  if (!doc || doc.error) return <div className="p-12 text-center text-lg text-red-500">Bulletin not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/bulletins" className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline mb-8 font-medium">
        <ArrowLeft size={18} /> Back to Bulletins
      </Link>
      
      <div className="bg-[var(--card)] p-8 md:p-12 rounded-3xl border border-[var(--border)] shadow-lg mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 pb-10 border-b border-[var(--border)]">
          <div className="bg-[var(--primary)]/10 p-5 rounded-2xl text-[var(--primary)] shadow-sm">
            <FileText size={40} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-sans font-bold mb-4 tracking-tight">{doc.title}</h1>
            <div className="flex items-center gap-2 text-sm font-medium opacity-70">
              <Calendar size={16} />
              <span>{new Date(doc.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
        
        <div className="prose prose-lg dark:prose-invert max-w-none font-sans leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: doc.html_content }} />
        </div>
      </div>
    </div>
  );
}
