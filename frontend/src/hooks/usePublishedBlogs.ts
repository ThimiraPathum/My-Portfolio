import { useEffect, useState } from 'react';
import { getBlogs } from '../api';

export function usePublishedBlogs() {
  const [hasPosts, setHasPosts] = useState(false);
  useEffect(() => {
    let active = true;
    getBlogs().then(({ data }) => {
      if (active) setHasPosts(Array.isArray(data) && data.some(post => post.status === 'published' && !post.coming_soon));
    }).catch(() => { /* Keep unavailable blog links out of the navigation. */ });
    return () => { active = false; };
  }, []);
  return hasPosts;
}
