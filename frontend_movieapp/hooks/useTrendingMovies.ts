import { useState, useEffect, useCallback } from 'react';
import { getTrendingMovies, subscribeTrendingMovies } from '../services/appwrite';

interface UseTrendingMoviesReturn {
    trendingMovies: TrendingMovie[] | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

const useTrendingMovies = (): UseTrendingMoviesReturn => {
    const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchTrendingMovies = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const movies = await getTrendingMovies();
            setTrendingMovies(movies || []);
        } catch (err) {
            setError(
                err instanceof Error 
                    ? err 
                    : new Error('Failed to fetch trending movies')
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const handleRealtimeUpdate = useCallback((updatedMovies: TrendingMovie[]) => {
        console.log('Trending movies updated via realtime:', updatedMovies);
        setTrendingMovies(updatedMovies);
    }, []);

    const handleRealtimeError = useCallback((error: any) => {
        console.error('Realtime error:', error);
        setError(new Error('Realtime connection error'));
    }, []);

    useEffect(() => {
        fetchTrendingMovies();

        const unsubscribe = subscribeTrendingMovies(
            handleRealtimeUpdate,
            handleRealtimeError
        );

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [fetchTrendingMovies, handleRealtimeUpdate, handleRealtimeError]);

    return {
        trendingMovies,
        loading,
        error,
        refetch: fetchTrendingMovies,
    };
};

export default useTrendingMovies;