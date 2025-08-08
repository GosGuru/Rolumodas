import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ product, category }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbs = [
    { name: 'Inicio', path: '/' },
  ];

  if (
    pathnames.includes('tienda') ||
    pathnames.includes('categoria') ||
    pathnames.includes('producto')
  ) {
    breadcrumbs.push({ name: 'Tienda', path: '/tienda' });
  }

  if ((pathnames.includes('categoria') && category) || (product && product.categories)) {
    const cat = category || (product && product.categories);
    if (cat && !breadcrumbs.find(b => b.path === `/categoria/${cat.slug}`)) {
      breadcrumbs.push({ name: cat.name, path: `/categoria/${cat.slug}` });
    }
  }

  if (pathnames.includes('producto') && product) {
    breadcrumbs.push({ name: product.name, path: `/producto/${product.id}` });
  }

  return (
    <div className="bg-secondary/50">
      <nav className="container flex flex-col items-start px-4 py-2 mx-auto">
        <ol className="flex items-center space-x-1 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <li key={crumb.path} className="flex items-center space-x-1 sm:flex-row sm:items-center ">
                {index > 0 && <ChevronRight className="w-4 h-4" />}
                {isLast ? (
                  <span
                    className="font-semibold text-foreground truncate block overflow-hidden whitespace-nowrap max-w-[110px] sm:max-w-[160px] text-[0.97rem] sm:text-base"
                    title={crumb.name}
                  >
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="flex items-center transition-colors hover:text-primary truncate max-w-[90px] sm:max-w-[120px] overflow-hidden whitespace-nowrap"
                    title={crumb.name}
                  >
                    {index === 0 && <Home className="h-4 w-4 mr-1.5" />}
                    <span className="truncate block">{crumb.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumbs;