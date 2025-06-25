import {
    View,
    Text,
    Image,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { icons } from '@/constants/icons';
import { fetchMovieDetails } from '@/services/api';
import RatingInput from '@/components/RatingInput';
import UserReview from '@/components/UserReview';

interface MovieInfoProps {
    label: string;
    value?: string | number | null;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const MovieInfo = ({ label, value }: MovieInfoProps) => (
    <View className="flex-col items-start justify-center mt-5">
        <Text className="text-light-200 font-normal text-sm">{label}</Text>
        <Text className="text-light-100 font-bold text-sm mt-2">
            {value || 'N/A'}
        </Text>
    </View>
);

const Details = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [userId, setUserId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [movie, setMovie] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [userReview, setUserReview] = useState<{
        rating: number;
        comment: string;
    } | null>(null);
    const [comments, setComments] = useState<any[]>([]);

    const fetchAllReviews = async (movieId: string) => {
        try {
            const allReviewsRes = await fetch(
                `${API_BASE_URL}/api/reviews/movie/${movieId}`
            );
            const reviewData = await allReviewsRes.json();
            setComments(
                reviewData.map((r: any) => ({
                    id: r.id,
                    user: r.username,
                    content: r.comment,
                    user_id: r.user_id,
                }))
            );
        } catch (error) {
            console.error('Failed to fetch all reviews:', error);
        }
    };

    useEffect(() => {
        const getUserId = async () => {
            try {
                const storedId = await AsyncStorage.getItem('user_id');
                setUserId(storedId);
            } catch (e) {
                console.error('Error reading user ID:', e);
            }
        };

        getUserId();
    }, []);

    useEffect(() => {
        const loadMovie = async () => {
            if (!id || !userId) return;
            setLoading(true);
            const movieId = id as string;
            try {
                const result = await fetchMovieDetails(movieId);
                setMovie(result);

                await fetchAllReviews(movieId);

                const userReviewRes = await fetch(
                    `${API_BASE_URL}/api/reviews/movie/${movieId}/user/${userId}`
                );
                if (userReviewRes.ok) {
                    const data = await userReviewRes.json();
                    setUserReview({
                        rating: data.rating,
                        comment: data.comment,
                    });
                    setRating(data.rating);
                    setComment(data.comment);
                }
            } catch (error) {
                console.error('Failed to fetch movie or review:', error);
            } finally {
                setLoading(false);
            }
        };

        loadMovie();
    }, [id, userId]);

    useEffect(() => {
        if (!movie || !userId) return;

        const checkSavedStatus = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/watchlist/check?user_id=${userId}&movie_id=${movie.id}`
                );
                if (!response.ok) return setIsSaved(false);
                const result = await response.json();
                setIsSaved(result.saved);
            } catch (error) {
                setIsSaved(false);
            }
        };

        checkSavedStatus();
    }, [movie, userId]);

    const handleSaveMovie = async () => {
        if (!movie || !userId) return;
        setIsSaving(true);

        try {
            const endpoint = isSaved
                ? '/api/watchlist/remove'
                : '/api/watchlist/save';
            const method = isSaved ? 'DELETE' : 'POST';

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    movie_id: movie.id,
                    title: movie.title,
                    poster_path: movie.poster_path,
                    vote_average: movie.vote_average,
                    release_date: movie.release_date,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setIsSaved(!isSaved);
                Alert.alert(isSaved ? 'Dihapus' : 'Berhasil', data.message);
            } else {
                Alert.alert(
                    'Error',
                    data.message || 'Gagal mengubah watchlist'
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Terjadi kesalahan saat menyimpan/hapus');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReviewSubmit = async () => {
        if (!rating) {
            Alert.alert('Error', 'Please select a rating.');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    movie_id: movie.id,
                    rating,
                    comment,
                }),
            });

            const responseData = await res.json();
            if (res.ok) {
                setUserReview({ rating, comment });
                setComment('');
                Alert.alert('Success', responseData.message);
                await fetchAllReviews(movie.id);
            } else {
                Alert.alert(
                    'Error',
                    responseData.error || 'Failed to submit review.'
                );
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Gagal submit review');
        }
    };

    if (loading || !userId) {
        return (
            <SafeAreaView className="bg-primary flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#fff" />
            </SafeAreaView>
        );
    }

    return (
        <View className="bg-primary flex-1">
            <ScrollView contentContainerStyle={{ paddingBottom: 180 }}>
                <View>
                    <Image
                        source={{
                            uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,
                        }}
                        className="w-full h-[550px]"
                        resizeMode="stretch"
                    />

                    <TouchableOpacity className="absolute bottom-5 right-5 rounded-full size-14 bg-white flex items-center justify-center">
                        <Image
                            source={icons.play}
                            className="w-6 h-7 ml-1"
                            resizeMode="stretch"
                        />
                    </TouchableOpacity>
                </View>

                <View className="flex-col items-start justify-center mt-5 px-5">
                    <View className="flex-row items-center justify-between w-full mb-2">
                        <Text className="text-white font-bold text-xl flex-1 pr-3">
                            {movie?.title}
                        </Text>
                        <TouchableOpacity
                            className={`px-4 py-2 rounded ${isSaved ? 'bg-red-600' : 'bg-green-600'}`}
                            onPress={handleSaveMovie}
                            disabled={isSaving}
                        >
                            <Text className="text-white font-semibold text-sm">
                                {isSaving
                                    ? isSaved
                                        ? 'Removing...'
                                        : 'Saving...'
                                    : isSaved
                                      ? 'Remove'
                                      : 'Save'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center gap-x-1 mt-2">
                        <Text className="text-light-200 text-sm">
                            {movie?.release_date?.split('-')[0]} •
                        </Text>
                        <Text className="text-light-200 text-sm">
                            {movie?.runtime}m
                        </Text>
                    </View>

                    <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
                        <Image source={icons.star} className="size-4" />
                        <Text className="text-white font-bold text-sm">
                            {Math.round(movie?.vote_average ?? 0)}/10
                        </Text>
                        <Text className="text-light-200 text-sm">
                            ({movie?.vote_count} votes)
                        </Text>
                    </View>

                    <MovieInfo label="Overview" value={movie?.overview} />
                    <MovieInfo
                        label="Genres"
                        value={
                            movie?.genres
                                ?.map((g: any) => g.name)
                                .join(' • ') || 'N/A'
                        }
                    />
                    <View className="flex flex-row justify-between w-1/2">
                        <MovieInfo
                            label="Budget"
                            value={`$${(movie?.budget ?? 0) / 1_000_000} million`}
                        />
                        <MovieInfo
                            label="Revenue"
                            value={`$${Math.round((movie?.revenue ?? 0) / 1_000_000)} million`}
                        />
                    </View>

                    <MovieInfo
                        label="Production Companies"
                        value={
                            movie?.production_companies
                                ?.map((c: any) => c.name)
                                .join(' • ') || 'N/A'
                        }
                    />

                    {/* COMMENT SECTION */}
                    <View className="mt-8 w-full">
                        {/* User's existing review display */}
                        {userReview && (
                            <UserReview
                                rating={userReview.rating}
                                comment={userReview.comment}
                            />
                        )}

                        {/* Rating Input */}
                        <View className="mt-6">
                            <Text className="text-white font-semibold mb-3">
                                Rate this movie:
                            </Text>
                            <RatingInput
                                onSubmit={(r) => setRating(r)}
                                value={rating}
                            />
                        </View>

                        {/* Comment Input */}
                        <View className="mt-6">
                            <Text className="text-white font-semibold mb-3">
                                Write a comment:
                            </Text>
                            <TextInput
                                className="bg-white/10 rounded-lg px-4 py-3 text-white min-h-[100px]"
                                placeholder="Write a comment..."
                                placeholderTextColor="#aaa"
                                value={comment}
                                onChangeText={setComment}
                                multiline={true}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            onPress={handleReviewSubmit}
                            className="bg-accent py-3 mt-4 rounded-lg"
                        >
                            <Text className="text-white text-center font-semibold text-base">
                                Submit Review
                            </Text>
                        </TouchableOpacity>

                        {/* Comments List */}
                        <View className="mt-8">
                            <Text className="text-white font-semibold mb-4">
                                Comments (
                                {
                                    comments.filter((c) => c.user_id !== userId)
                                        .length
                                }
                                )
                            </Text>
                            {comments.filter((c) => c.user_id !== userId)
                                .length > 0 ? (
                                comments
                                    .filter((c) => c.user_id !== userId)
                                    .map((comment) => (
                                        <View
                                            key={comment.id}
                                            className="mb-3 bg-white/10 p-4 rounded-lg"
                                        >
                                            <Text className="text-white font-bold mb-1">
                                                {comment.user}
                                            </Text>
                                            <Text className="text-light-100 leading-5">
                                                {comment.content}
                                            </Text>
                                        </View>
                                    ))
                            ) : (
                                <Text className="text-light-200 text-center py-4">
                                    No comments yet. Be the first to comment!
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            <TouchableOpacity
                className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
                onPress={router.back}
            >
                <Image
                    source={icons.arrow}
                    className="size-5 mr-1 mt-0.5 rotate-180"
                    tintColor="#fff"
                />
                <Text className="text-white font-semibold text-base">
                    Go Back
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default Details;
