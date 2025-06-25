import {
    View,
    Text,
    ActivityIndicator,
    ScrollView,
    Image,
    FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';

import useFetch from '@/services/usefetch';
import { fetchMovies } from '@/services/api';
import useTrendingMovies from '@/hooks/useTrendingMovies';

import { icons } from '@/constants/icons';
import { images } from '@/constants/images';

import SearchBar from '@/components/SearchBar';
import MovieCard from '@/components/MovieCard';
import TrendingCard from '@/components/TrendingCard';

const Index = () => {
    const router = useRouter();

    const {
        trendingMovies,
        loading: trendingLoading,
        error: trendingError,
    } = useTrendingMovies();

    const {
        data: movies,
        loading: moviesLoading,
        error: moviesError,
    } = useFetch(() => fetchMovies({ query: '' }));

    return (
        <View className="flex-1 bg-primary">
            <Image
                source={images.bg}
                className="absolute w-full z-0"
                resizeMode="cover"
            />

            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ minHeight: '100%', paddingBottom: 10 }}
            >
                <Image
                    source={icons.logo}
                    className="w-12 h-10 mt-20 mb-5 mx-auto"
                />

                {moviesLoading || trendingLoading ? (
                    <ActivityIndicator
                        size="large"
                        color="#0000ff"
                        className="mt-10 self-center"
                    />
                ) : moviesError || trendingError ? (
                    <Text className="text-red-500 text-center mt-5">
                        Error: {moviesError?.message || trendingError?.message}
                    </Text>
                ) : (
                    <View className="flex-1 mt-5">
                        <SearchBar
                            onPress={() => {
                                router.push('/search');
                            }}
                            placeholder="Search for a movie"
                        />

                        {trendingMovies && trendingMovies.length > 0 && (
                            <View className="mt-10">
                                <View className="flex-row items-center mb-3">
                                    <Text className="text-lg text-white font-bold">
                                        Trending Movies
                                    </Text>
                                </View>
                                <FlatList
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    className="mb-4 mt-3"
                                    data={trendingMovies}
                                    contentContainerStyle={{
                                        gap: 26,
                                    }}
                                    renderItem={({ item, index }) => (
                                        <TrendingCard
                                            movie={item}
                                            index={index}
                                        />
                                    )}
                                    keyExtractor={(item) =>
                                        item.$id ||
                                        item.movie_id?.toString() ||
                                        Index.toString()
                                    }
                                    ItemSeparatorComponent={() => (
                                        <View className="w-4" />
                                    )}
                                />
                            </View>
                        )}

                        {/* Show message when no trending movies */}
                        {trendingMovies && trendingMovies.length === 0 && (
                            <View className="mt-10 bg-gray-800/50 rounded-lg p-4">
                                <Text className="text-white text-center">
                                    🎬 No trending movies yet
                                </Text>
                                <Text className="text-gray-400 text-center text-sm mt-1">
                                    Start searching to see trending content!
                                </Text>
                            </View>
                        )}

                        <>
                            <Text className="text-lg text-white font-bold mt-5 mb-3">
                                Latest Movies
                            </Text>

                            <FlatList
                                data={movies}
                                renderItem={({ item }) => (
                                    <MovieCard {...item} />
                                )}
                                keyExtractor={(item) => item.id.toString()}
                                numColumns={3}
                                columnWrapperStyle={{
                                    justifyContent: 'flex-start',
                                    gap: 20,
                                    paddingRight: 5,
                                    marginBottom: 10,
                                }}
                                className="mt-2 pb-32"
                                scrollEnabled={false}
                            />
                        </>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default Index;
