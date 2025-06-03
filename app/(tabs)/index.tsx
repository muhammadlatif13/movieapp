import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  Text,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

import usefetch from '@/services/usefetch';
import { fetchMovies } from '@/services/api';
import { getTrendingMovies } from '@/services/appwrite';

import { images } from '@/constants/images';
import { icons } from '@/constants/icons';

import SearchBar from '@/components/SearchBar';
import MovieCard from '@/components/MovieCard';
import TrendingCard from '@/components/TrendingCard';

export default function Index() {
  const router = useRouter();

  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);

  // Load recently watched from AsyncStorage
  useEffect(() => {
    const loadRecentMovies = async () => {
      try {
        const json = await AsyncStorage.getItem('recentlyWatched');
        const movies = json ? JSON.parse(json) : [];
        setRecentMovies(movies.reverse()); // show latest first
      } catch (error) {
        console.error('Failed to load recently watched:', error);
      }
    };

    const unsubscribe = router.addListener('focus', loadRecentMovies);
    loadRecentMovies(); // initial load

    return unsubscribe;
  }, []);

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
  } = usefetch(getTrendingMovies);

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
  } = usefetch(() => fetchMovies({ query: '' }));

  const loading = trendingLoading || moviesLoading;
  const error = trendingError || moviesError;

  if (loading) {
    return (
      <View className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-primary justify-center items-center px-5">
        <Text className="text-red-500 text-center">
          {error instanceof Error ? error.message : String(error)}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary relative">
      <Image
        source={images.bg}
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
      />

      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: 'flex-start',
          gap: 20,
          paddingHorizontal: 16,
          marginBottom: 10,
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 32 }}
        ListHeaderComponent={() => (
          <>
            <Image
              source={icons.logo}
              className="w-12 h-10 self-center mt-20 mb-5"
            />

            <View className="px-5">
              <SearchBar
                onPress={() => router.push('/search')}
                placeholder="Search for a movie"
              />
            </View>

            {/* Trending */}
            {trendingMovies && trendingMovies.length > 0 && (
              <>
                <Text className="text-white text-lg font-bold px-5 mt-8 mb-3">
                  Trending Movies
                </Text>
                <FlatList
                  horizontal
                  data={trendingMovies}
                  keyExtractor={(item) => item.movie_id.toString()}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 16,
                    gap: 16,
                    marginBottom: 20,
                  }}
                  renderItem={({ item, index }) => (
                    <TrendingCard movie={item} index={index} />
                  )}
                />
              </>
            )}

            {/* Recently Watched */}
            {recentMovies.length > 0 && (
              <>
                <Text className="text-white text-lg font-bold px-5 mb-3">
                  Recently Watched
                </Text>
                <FlatList
                  horizontal
                  data={recentMovies}
                  keyExtractor={(item) => item.id.toString()}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 16,
                    gap: 16,
                    marginBottom: 20,
                  }}
                  renderItem={({ item }) => <MovieCard {...item} />}
                />
              </>
            )}

            {/* Latest Movies */}
            <Text className="text-white text-lg font-bold px-5 mb-3">
              Latest Movies
            </Text>
          </>
        )}
        renderItem={({ item }) => <MovieCard {...item} />}
      />
    </View>
  );
}
