import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ArticleView() {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);

  useEffect(() => {
    fetch('/api/articles')
      .then(r => r.json())
      .then(articles => {
        const found = articles.find((a: any) => a.id === parseInt(id || '0'));
        setArticle(found);
      });
  }, [id]);

  if (!article) return <div className="p-8 text-center opacity-70">Loading...</div>;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative -mt-8 mb-16 h-[200px] md:h-[250px] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        {article.featured_image ? (
          <img 
            src={article.featured_image} 
            alt={article.title} 
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer" 
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gray-800"></div>
        )}
        
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto mt-8">
          {article.category_name && (
            <Link 
              to={`/category/${article.category_id}`} 
              className="inline-block mb-6 text-sm font-bold uppercase tracking-widest text-[var(--primary)] hover:text-white transition-colors drop-shadow-md"
            >
              {article.category_name}
            </Link>
          )}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-sans font-bold mb-8 leading-tight tracking-tight drop-shadow-2xl">
            {article.title}
          </h1>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-medium text-gray-200 drop-shadow-md">
            <span className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-xs font-bold uppercase backdrop-blur-sm">
                {article.author.charAt(0)}
              </span>
              By {article.author}
            </span>
            <span className="hidden sm:inline">&bull;</span>
            <span>{new Date(article.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </section>
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div 
          className="markdown-body quill-content text-lg leading-relaxed font-sans"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </div>
  );
}
