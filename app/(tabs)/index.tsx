// app/index.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native';

import { fetchMovies } from '@/services/api';
import { getTrendingMovies } from '@/services/appwrite';
import usefetch from '@/services/usefetch';

import { icons } from '@/constants/icons';
import { images } from '@/constants/images';

import MovieCard from '@/components/MovieCard';
import SearchBar from '@/components/SearchBar';
import TrendingCard from '@/components/TrendingCard';

export default function Index() {
    const router = useRouter();

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
            {/* Background */}
            <Image
                source={images.bg}
                className="absolute inset-0 w-full h-full"
                resizeMode="cover"
            />

            {/* Combined scrolling via one FlatList */}
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
                        {/* Logo */}
                        <Image
                            source={icons.logo}
                            className="w-12 h-10 self-center mt-20 mb-5"
                        />

                        {/* Search */}
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
                                    keyExtractor={(item) =>
                                        item.movie_id.toString()
                                    }
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{
                                        paddingHorizontal: 16,
                                        gap: 16,
                                        marginBottom: 20,
                                    }}
                                    renderItem={({ item, index }) => (
                                        <TrendingCard
                                            movie={item}
                                            index={index}
                                        />
                                    )}
                                    ItemSeparatorComponent={() => (
                                        <View className="w-4" />
                                    )}
                                />
                            </>
                        )}

                        {/* Section title for latest */}
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
