import { View, Text, Image, FlatList, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { icons } from '@/constants/icons';
import MovieCard from '@/components/MovieCard';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const Save = () => {
    const [watchlist, setWatchlist] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [initializing, setInitializing] = useState(true);

    const fetchUserIdAndWatchlist = async () => {
        setLoading(true);
        try {
            const storedUserId = await AsyncStorage.getItem('user_id');

            if (!storedUserId) {
                console.error('User ID tidak ditemukan di AsyncStorage');
                setUserId(null);
                setWatchlist([]);
                setLoading(false);
                return;
            }

            setUserId(storedUserId);

            const response = await fetch(
                `${API_BASE_URL}/api/watchlist/${storedUserId}`
            );

            if (!response.ok) {
                const text = await response.text();
                console.error('Gagal fetch watchlist:', text);
                setWatchlist([]);
                return;
            }

            const data = await response.json();
            setWatchlist(data);
        } catch (error) {
            console.error('Error fetch watchlist:', error);
        } finally {
            setLoading(false);
            setInitializing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserIdAndWatchlist();
        }, [])
    );

    if (initializing) {
        return (
            <SafeAreaView className="bg-primary flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="bg-primary flex-1 px-5">
            {loading ? (
                <ActivityIndicator />
            ) : watchlist.length === 0 ? (
                <View className="flex justify-center items-center flex-1">
                    <Image
                        source={icons.save}
                        className="size-10"
                        tintColor="#fff"
                    />
                    <Text className="text-gray-500 text-base mt-2">
                        No saved movies
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={watchlist}
                    keyExtractor={(item) => item.movie_id.toString()}
                    numColumns={3}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    renderItem={({ item }) => (
                        <MovieCard
                            id={item.movie_id}
                            poster_path={item.poster_path}
                            title={item.title}
                            vote_average={item.vote_average}
                            release_date={item.release_date}
                            movie_id={0}
                            adult={false}
                            backdrop_path={''}
                            genre_ids={[]}
                            original_language={''}
                            original_title={''}
                            overview={''}
                            popularity={0}
                            video={false}
                            vote_count={0}
                        />
                    )}
                    contentContainerStyle={{
                        paddingBottom: 100,
                        paddingTop: 20,
                    }}
                />
            )}
        </SafeAreaView>
    );
};

export default Save;
