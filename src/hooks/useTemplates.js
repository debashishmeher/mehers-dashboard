import { useState, useEffect, useCallback } from 'react';
import { fetchTemplates } from '../Services/whatsappServices';

export const useTemplates = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchTemplates();
      // Gracefully handle different response formats
      const templates = response?.templates || response?.data || (Array.isArray(response) ? response : []);
      setData(templates);
    } catch (err) {
      console.error("Failed to fetch templates:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
};
