import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, FlatList, Image } from 'react-native';

import { images } from '@/constants/images';
import { icons } from '@/constants/icons';

import usefetch from '@/services/usefetch';
import { fetchMovies } from '@/services/api';
import { updateSearchCount, addMovieToLatest } from '@/services/appwrite'; // Import fungsi baru

import SearchBar from '@/components/SearchBar';
import MovieDisplayCard from '@/components/MovieCard';

// Definisikan interface Movie jika belum ada di file lain.
// Ini penting agar TypeScript tahu properti apa saja yang dimiliki objek film.
interface Movie {
    id: number;
    title: string;
    poster_path?: string; // Contoh properti, sesuaikan dengan struktur data film Anda
    // Tambahkan properti lain yang relevan seperti overview, release_date, dll.
}

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data: movies = [],
        loading,
        error,
        refetch: loadMovies,
        reset,
    } = usefetch<Movie[]>(() => fetchMovies({ query: searchQuery }), false);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
    };

    // Handler ketika kartu film ditekan
    const handleMovieSelect = async (movie: Movie) => {
        console.log('Film dipilih:', movie.title);

        try {
            // Panggil fungsi untuk menambahkan film ke daftar "Latest Movies"
            await addMovieToLatest(movie);
            console.log(`Film "${movie.title}" berhasil ditambahkan ke Latest Movies.`);
            // Anda bisa menambahkan notifikasi visual di sini, seperti toast message
        } catch (err) {
            console.error('Gagal menambahkan film ke Latest Movies:', err);
            // Tangani error, mungkin tampilkan pesan kepada pengguna
        }

        // --- PENTING: Logika navigasi atau pembaruan UI lainnya ---
        // Jika Anda juga ingin menavigasi ke halaman detail film atau halaman beranda
        // setelah memilih, letakkan logika navigasi di sini.
        // Contoh dengan React Navigation:
        // navigation.navigate('MovieDetail', { movieId: movie.id });
        // navigation.navigate('Home'); // Jika Anda ingin kembali ke Home
    };

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.trim()) {
                await loadMovies();
            } else {
                reset();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, loadMovies, reset]);

    // Efek terpisah untuk `updateSearchCount` yang bergantung pada `movies`
    useEffect(() => {
        if (searchQuery.trim() && movies?.length > 0 && movies[0]) {
            updateSearchCount(searchQuery, movies[0]);
        }
    }, [searchQuery, movies]);

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
                    <MovieDisplayCard
                        {...item}
                        onPress={() => handleMovieSelect(item)} // Teruskan handler onPress
                    />
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
                            movies?.length > 0 && (
                                <Text className="text-xl text-white font-bold">
                                    Hasil Pencarian untuk{' '}
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
                                    ? 'Tidak ada film ditemukan'
                                    : 'Mulai mengetik untuk mencari film'}
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

export default Search;
