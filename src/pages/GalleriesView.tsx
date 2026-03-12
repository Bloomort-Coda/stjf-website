import React, { useState, useEffect } from 'react';

export default function GalleriesView() {
  const [galleries, setGalleries] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/galleries').then(r => r.json()).then(setGalleries);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-sans font-bold mb-4 tracking-tight">Galleries</h1>
        <div className="w-24 h-1 bg-[var(--primary)] mx-auto rounded-full opacity-80"></div>
      </div>
      
      <div className="bg-[var(--card)] p-8 md:p-12 rounded-3xl border border-[var(--border)] mb-16 shadow-lg flex flex-col md:flex-row gap-12 items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--primary)] to-blue-400"></div>
        <div className="flex-1">
          <h2 className="text-3xl font-sans font-bold mb-6">Share Your Memories</h2>
          <p className="mb-6 text-lg opacity-80 leading-relaxed">
            Please indicate which parish event the photos and videos are for. I will create an album on Facebook with the appropriate title.
          </p>
          <div className="mb-8">
            <a 
              href="mailto:stjf.media@gmail.com?subject=photos%20for%20event%20..." 
              className="inline-flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] px-8 py-4 rounded-full font-bold text-lg hover:bg-[var(--primary)]/90 transition-all shadow-md hover:shadow-xl hover:-translate-y-1"
            >
              Email Photos and Videos &rarr;
            </a>
          </div>
          <p className="mb-4 text-sm opacity-70 border-l-4 border-[var(--border)] pl-4">
            All media is published in good faith. If anyone requires an item to be removed, please email me with the subject <strong>"Please remove"</strong> and include a link to the item in the body of the email.
          </p>
          <a 
            href="mailto:stjf.media@gmail.com?subject=Please%20remove" 
            className="inline-block text-[var(--primary)] text-sm font-medium hover:underline"
          >
            Request Removal
          </a>
        </div>
        <div className="w-56 shrink-0 flex flex-col items-center justify-center bg-white p-4 rounded-2xl border border-[var(--border)] shadow-xl rotate-3 hover:rotate-0 transition-transform duration-300">
          <img src="/maileventpics-2.png" alt="QR Code to email photos" className="w-full h-auto rounded-xl mb-4" />
          <span className="text-xs text-center text-gray-500 font-bold uppercase tracking-widest">Scan to Email</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {galleries.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
            <p className="text-lg opacity-60">No galleries available.</p>
          </div>
        ) : null}
        {galleries.map(gallery => (
          <a key={gallery.id} href={gallery.facebook_link} target="_blank" rel="noopener noreferrer" className="group block relative overflow-hidden rounded-2xl border border-[var(--border)] shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <img src={gallery.cover_image_url} alt={gallery.album_title} className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-8 opacity-90 group-hover:opacity-100 transition-opacity">
              <span className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">View Gallery</span>
              <h3 className="text-white font-sans font-bold text-2xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">{gallery.album_title}</h3>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
