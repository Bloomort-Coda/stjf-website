import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [articles, setArticles] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [galleries, setGalleries] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/articles').then(r => r.json()).then(setArticles);
    fetch('/api/events').then(r => r.json()).then(setEvents);
    fetch('/api/galleries').then(r => r.json()).then(setGalleries);
  }, []);

  return (
    <div className="space-y-16">
      <section className="relative -mt-8 -mx-4 sm:-mx-6 lg:-mx-8 mb-16 h-[600px] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <img 
          src="/hero-church.png" 
          alt="St. John Fisher Catholic Church Lynnwood" 
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            // Fallback if the user hasn't uploaded the image yet
            (e.target as HTMLImageElement).src = "https://picsum.photos/seed/church/1920/1080";
          }}
        />
        <div className="relative z-20 text-center text-white px-4 max-w-5xl mx-auto mt-16">
          <h1 className="text-5xl md:text-7xl font-sans font-bold tracking-tight mb-6 drop-shadow-2xl leading-tight">
            St. John Fisher Catholic Church Lynnwood
          </h1>
          <p className="text-2xl md:text-3xl font-medium mb-10 drop-shadow-md text-gray-200 font-sans italic">
            Welcome to our Parish
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link to="/article/5" className="bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              MASS TIMES
            </Link>
            <a href="https://stjf.co.za/site.php?articleid=43" target="_blank" rel="noopener noreferrer" className="bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              Catechism Registration 2026
            </a>
            <Link to="/article/6" className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              Come on in
            </Link>
          </div>
          <div className="bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/20 inline-block shadow-2xl">
            <p className="text-xs font-bold mb-2 text-gray-300 uppercase tracking-widest">Contact Detail</p>
            <p className="text-2xl font-sans font-bold mb-1">Fr. Thomas Vanderkunnel</p>
            <p className="text-base text-gray-200 font-medium">012 3611561 (normal hours) &bull; 068 481 4055</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        {/* Articles */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-sans font-bold">Latest News</h2>
            <div className="h-px bg-[var(--border)] flex-1"></div>
          </div>
          <div className="space-y-6">
            {articles.length === 0 ? <p className="opacity-60 italic">No news available.</p> : null}
            {articles.slice(0, 3).map(article => (
              <Link key={article.id} to={`/article/${article.id}`} className="group block bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                {article.featured_image && (
                  <div className="relative h-48 overflow-hidden">
                    <img src={article.featured_image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="p-5">
                  <div className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-2">
                    {new Date(article.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <h3 className="font-sans font-bold text-xl mb-2 group-hover:text-[var(--primary)] transition-colors line-clamp-2">{article.title}</h3>
                  <p className="text-sm opacity-70 mb-4 line-clamp-2">
                    {new DOMParser().parseFromString(article.content, 'text/html').body.textContent || ''}
                  </p>
                  <span className="text-[var(--primary)] text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">Read Article &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Events */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-sans font-bold">Upcoming Events</h2>
            <div className="h-px bg-[var(--border)] flex-1"></div>
          </div>
          <div className="space-y-4">
            {events.length === 0 ? <p className="opacity-60 italic">No events scheduled.</p> : null}
            {events.slice(0, 4).map(event => (
              <div key={event.id} className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] flex gap-5 hover:shadow-md transition-shadow group">
                <div className="bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl p-3 text-center min-w-[70px] flex flex-col justify-center items-center shadow-sm group-hover:bg-[var(--primary)] group-hover:text-[var(--primary-foreground)] transition-colors">
                  <span className="text-xs font-bold uppercase tracking-widest">{new Date(event.event_date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-2xl font-sans font-bold">{new Date(event.event_date).getDate()}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-[var(--primary)] transition-colors">{event.name}</h3>
                  <p className="text-sm font-medium opacity-70 mb-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {event.location}
                  </p>
                  <p className="text-sm opacity-60 line-clamp-2">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Galleries */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-sans font-bold">Galleries</h2>
            <div className="h-px bg-[var(--border)] flex-1"></div>
            <Link to="/galleries" className="text-[var(--primary)] text-sm font-bold uppercase tracking-widest hover:underline whitespace-nowrap">View All</Link>
          </div>
          <div className="grid grid-cols-1 gap-5">
            {galleries.length === 0 ? <p className="opacity-60 italic">No galleries available.</p> : null}
            {galleries.slice(0, 3).map(gallery => (
              <a key={gallery.id} href={gallery.facebook_link} target="_blank" rel="noopener noreferrer" className="group block relative overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-lg transition-all">
                <img src={gallery.cover_image_url} alt={gallery.album_title} className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">View Gallery</span>
                  <h3 className="text-white font-sans font-bold text-xl transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">{gallery.album_title}</h3>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
