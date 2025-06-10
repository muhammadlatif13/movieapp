import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, FlatList, Image, TouchableOpacity } from 'react-native';
import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { images } from '@/constants/images';
import { icons } from '@/constants/icons';

import usefetch from '@/services/usefetch';
import { fetchMovies } from '@/services/api';
import { updateSearchCount } from '@/services/appwrite';

import { useRecentMovies } from '@/context/RecentMoviesContext'; 
import SearchBar from '@/components/SearchBar';
import MovieDisplayCard from '@/components/MovieCard';

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data: movies = [],
        loading,
        error,
        refetch: loadMovies,
        reset,
    } = usefetch(() => fetchMovies({ query: searchQuery }), false);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
    };

    // Simpan film yang diklik ke recently watched
    const RecentMoviesContext = createContext(null);

export const RecentMoviesProvider = ({ children }) => {
  const [recentMovies, setRecentMovies] = useState([]);

  const addRecentMovie = (movie) => {
    setRecentMovies((prev) => {
      const filtered = prev.filter((m) => m.id !== movie.id);
      return [movie, ...filtered].slice(0, 10); // max 10 movie
    });
  };

  return (
    <RecentMoviesContext.Provider value={{ recentMovies, addRecentMovie }}>
      {children}
    </RecentMoviesContext.Provider>
  );
};

export const useRecentMovies = () => useContext(RecentMoviesContext);

    // Ketika movie diklik
    const handleMovieClick = async (movie: Movie) => {
        await saveToRecentlyWatched(movie);

        // TODO: Navigasi ke halaman detail jika ada
        // router.push(`/movie/${movie.id}`);
    };

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.trim()) {
                await loadMovies();

                if (movies?.length! > 0 && movies?.[0]) {
                    await updateSearchCount(searchQuery, movies[0]);
                }
            } else {
                reset();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return (
        <View className="flex-1 bg-primary">
            <Image
                source={images.bg}
                className="flex-1 absolute w-full z-0"
                resizeMode="cover"
            />

            <FlatList
                className="px-5"
                data={movies as Movie[]}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleMovieClick(item)}>
                        <MovieDisplayCard {...item} />
                    </TouchableOpacity>
                )}
                numColumns={3}
                columnWrapperStyle={{
                    justifyContent: 'flex-start',
                    gap: 16,
                    marginVertical: 16,
                }}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListHeaderComponent={
                    <>
                        <View className="w-full flex-row justify-center mt-20 items-center">
                            <Image source={icons.logo} className="w-12 h-10" />
                        </View>

                        <View className="my-5">
                            <SearchBar
                                placeholder="Search for a movie"
                                value={searchQuery}
                                onChangeText={handleSearch}
                            />
                        </View>

                        {loading && (
                            <ActivityIndicator
                                size="large"
                                color="#0000ff"
                                className="my-3"
                            />
                        )}

                        {error && (
                            <Text className="text-red-500 px-5 my-3">
                                Error: {error.message}
                            </Text>
                        )}

                        {!loading &&
                            !error &&
                            searchQuery.trim() &&
                            movies?.length! > 0 && (
                                <Text className="text-xl text-white font-bold">
                                    Search Results for{' '}
                                    <Text className="text-accent">
                                        {searchQuery}
                                    </Text>
                                </Text>
                            )}
                    </>
                }
                ListEmptyComponent={
                    !loading && !error ? (
                        <View className="mt-10 px-5">
                            <Text className="text-center text-gray-500">
                                {searchQuery.trim()
                                    ? 'No movie found'
                                    : 'Start typing to search for movie'}
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

export default Search;
