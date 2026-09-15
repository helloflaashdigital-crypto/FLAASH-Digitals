import { useEffect, useState } from 'react';
import { getCollection } from '../services/api';

export function usePublicContent(type, slug, fallback) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ item: fallback, loading: !fallback, error: null });
  useEffect(() => {
    let active = true;
    setState({ item: fallback, loading: !fallback, error: null });
    getCollection(type + '/' + slug).then(item => {
      if (active) setState({ item, loading: false, error: null });
    }).catch(error => {
      if (active) setState({ item: fallback, loading: false, error });
    });
    return () => { active = false; };
  }, [type, slug, fallback, attempt]);
  return { ...state, retry: () => setAttempt(value => value + 1) };
}
