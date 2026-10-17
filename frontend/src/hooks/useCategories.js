import { useState, useEffect } from 'react';
import { expenseApi } from '../api/expenseApi';
import { DEFAULT_CATEGORIES } from '../constants/categories';

export function useCategories() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const names = await expenseApi.getCategories();
        if (isMounted && Array.isArray(names) && names.length > 0) {
          // Merge with DEFAULT_CATEGORIES metadata if matching
          const mapped = names.map((name) => {
            const found = DEFAULT_CATEGORIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
            return found || {
              id: name.toLowerCase().replace(/\s+/g, '_'),
              name,
              shortLabel: name,
              color: '#868E96',
              icon: 'Tag',
            };
          });
          setCategories(mapped);
        }
      } catch {
        // Fall back to DEFAULT_CATEGORIES silently
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return { categories, isLoading };
}
