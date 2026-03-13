import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function CategoryView() {
  const { id } = useParams();
  const [articles, setArticles] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories')
      .then(r => r.json())
      .then(cats => {
        setAllCategories(cats);
        const catId = parseInt(id || '0');
        const cat = cats.find((c: any) => c.id === catId);
        setCategory(cat);
        
        const subcats = cats.filter((c: any) => c.parent_id === catId);
        setSubcategories(subcats);
      });

    // Fetch articles
    fetch('/api/articles')
      .then(r => r.json())
      .then(allArticles => {
        setArticles(allArticles);
      });
  }, [id]);

  if (!category) return <div className="p-8 text-center opacity-70">Loading...</div>;

  const categoryArticles = articles.filter((a: any) => a.category_id === category.id);
  const coverArticle = categoryArticles.find((a: any) => a.featured_image);
  const coverImage = coverArticle ? coverArticle.featured_image : 'https://picsum.photos/seed/catholic/1920/1080';

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative -mt-8 mb-16 h-[150px] md:h-[200px] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <img 
          src={coverImage} 
          alt={category.name} 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer" 
        />
        
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto mt-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-sans font-bold mb-4 tracking-tight drop-shadow-2xl">
            {category.name}
          </h1>
          <div className="w-24 h-1 bg-[var(--primary)] mx-auto rounded-full opacity-80 shadow-lg"></div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
      
      {subcategories.length > 0 && (
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subcategories.map(subcat => {
              const subcatArticles = articles.filter(a => a.category_id === subcat.id);
              const coverArticle = subcatArticles.find(a => a.featured_image);
              const coverImage = coverArticle ? coverArticle.featured_image : null;

              return (
                <Link 
                  key={subcat.id} 
                  to={`/category/${subcat.id}`}
                  className="group flex flex-col bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {coverImage ? (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={coverImage} 
                        alt={subcat.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        referrerPolicy="no-referrer" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <span className="opacity-30 font-sans text-2xl">No Image</span>
                    </div>
                  )}
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-2xl font-sans font-bold mb-4 group-hover:text-[var(--primary)] transition-colors">
                      {subcat.name}
                    </h2>
                    
                    {subcatArticles.length > 0 ? (
                      <ul className="space-y-2 flex-grow">
                        {subcatArticles.slice(0, 4).map(article => (
                          <li key={article.id} className="text-sm opacity-80 line-clamp-1">
                            • {article.title}
                          </li>
                        ))}
                        {subcatArticles.length > 4 && (
                          <li className="text-sm text-[var(--primary)] font-medium mt-2">
                            + {subcatArticles.length - 4} more articles
                          </li>
                        )}
                      </ul>
                    ) : (
                      <p className="text-sm opacity-60 italic flex-grow">No articles yet.</p>
                    )}
                    
                    <div className="flex items-center justify-end mt-4 pt-4 border-t border-[var(--border)]">
                      <span className="text-[var(--primary)] font-medium text-sm group-hover:translate-x-1 transition-transform">View Category &rarr;</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {categoryArticles.length > 0 && (
        <div>
          {subcategories.length > 0 && (
            <h2 className="text-3xl font-sans font-bold mb-8">Articles in {category.name}</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryArticles.map(article => (
              <Link 
                key={article.id} 
                to={`/article/${article.id}`}
                className="group flex flex-col bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {article.featured_image ? (
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={article.featured_image} 
                      alt={article.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span className="opacity-30 font-sans text-2xl">No Image</span>
                  </div>
                )}
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--primary)] mb-3">
                    <span>{new Date(article.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  
                  <h2 className="text-2xl font-sans font-bold mb-3 group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  
                  <p className="text-sm opacity-70 mb-6 line-clamp-3 flex-grow">
                    {new DOMParser().parseFromString(article.content, 'text/html').body.textContent || ''}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border)]">
                    <span className="text-sm font-medium opacity-80">By {article.author}</span>
                    <span className="text-[var(--primary)] font-medium text-sm group-hover:translate-x-1 transition-transform">Read &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {subcategories.length === 0 && categoryArticles.length === 0 && (
        <div className="text-center py-12 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
          <p className="text-lg opacity-60">No articles or subcategories found in this category.</p>
        </div>
      )}
      </div>
    </div>
  );
}
