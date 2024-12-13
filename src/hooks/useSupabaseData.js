import { useEffect, useState } from 'react';
import { supabase } from '@/lib/SupabaseClient';

export const useSupabaseData = () => {
  const [ordersSupabase, setOrdersSupabase] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: ordersSupabaseData, error: ordersSupabaseError } = await supabase.from('orders').select('*');
      if (ordersSupabaseError) throw ordersSupabaseError;

      const { data: storesData, error: storesError } = await supabase.from('stores').select('*');
      if (storesError) throw storesError;

      setOrdersSupabase(ordersSupabaseData);
      setStores(storesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { ordersSupabase, stores, loading, error, fetchData };
};
