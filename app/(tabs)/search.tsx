import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, FlatList, Image } from 'react-native';

import { images } from '@/constants/images';
import { icons } from '@/constants/icons';

import usefetch from '@/services/usefetch';
import { fetchMovies } from '@/services/api';
import { updateSearchCount } from '@/services/appwrite';

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
    } = usefetch<Movie[]>(() => fetchMovies({ query: searchQuery }), false); // Tambahkan tipe generik untuk usefetch

    const handleSearch = (text: string) => {
        setSearchQuery(text);
    };

    // Handler baru untuk ketika kartu film ditekan
    const handleMovieSelect = (movie: Movie) => {
        console.log('Film dipilih:', movie.title); // Log film yang dipilih untuk debugging

        // --- PENTING: Logika untuk menampilkan film di beranda ---
        // Ada beberapa cara untuk melakukan ini di React Native, tergantung
        // pada bagaimana aplikasi Anda dibangun:

        // 1. Menggunakan React Navigation (paling umum):
        //    Jika Anda menggunakan React Navigation, Anda bisa menavigasi ke
        //    layar beranda dan meneruskan objek film sebagai parameter.
        //    Contoh (Anda perlu mengimpor `useNavigation` dari '@react-navigation/native'):
        //    const navigation = useNavigation();
        //    navigation.navigate('Home', { selectedMovie: movie });
        //    Pastikan rute 'Home' Anda dapat menerima parameter ini.

        // 2. Menggunakan Global State Management (Context API, Redux, Zustand, dll.):
        //    Jika Anda memiliki sistem manajemen status global, Anda bisa
        //    memperbarui status global dengan film yang dipilih. Komponen
        //    beranda kemudian akan mendengarkan perubahan status ini.
        //    Contoh (jika Anda memiliki Context untuk film yang dipilih):
        //    import { useSelectedMovie } from '@/context/SelectedMovieContext';
        //    const { setSelectedMovie } = useSelectedMovie();
        //    setSelectedMovie(movie);

        // 3. Menggunakan Callback Prop (jika Search adalah anak dari Beranda):
        //    Jika komponen Search ini adalah anak langsung dari komponen Beranda,
        //    Anda bisa meneruskan fungsi callback dari Beranda ke Search.
        //    Contoh (jika Search menerima prop `onSelectMovie`):
        //    if (onSelectMovie) {
        //        onSelectMovie(movie);
        //    }

        // Untuk tujuan demonstrasi, saya akan menambahkan `console.log`
        // dan Anda perlu mengimplementasikan salah satu dari metode di atas
        // di aplikasi Anda.
    };

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.trim()) {
                await loadMovies();
                // `movies` di sini mungkin belum diperbarui setelah `loadMovies` selesai
                // karena `loadMovies` adalah async.
                // Untuk memastikan `updateSearchCount` menggunakan data terbaru,
                // Anda mungkin perlu memanggilnya setelah `loadMovies` mengupdate state `movies`
                // atau mengambil data langsung dari hasil `loadMovies` jika memungkinkan.
                // Namun, untuk saat ini, kita akan biarkan seperti ini dan asumsikan `movies` akan diperbarui.
            } else {
                reset();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, loadMovies, reset]); // Tambahkan `loadMovies` dan `reset` ke dependency array

    // Efek terpisah untuk `updateSearchCount` yang bergantung pada `movies`
    useEffect(() => {
        if (searchQuery.trim() && movies?.length > 0 && movies[0]) {
            // Panggil updateSearchCount hanya jika ada hasil dan setelah `movies` diperbarui
            updateSearchCount(searchQuery, movies[0]);
        }
    }, [searchQuery, movies]); // `movies` di sini akan diperbarui setelah `loadMovies` selesai

    return (
        <View className="flex-1 bg-primary">
            <Image
                source={images.bg}
                className="flex-1 absolute w-full z-0"
                resizeMode="cover"
            />

            <FlatList
                className="px-5"
                data={movies as Movie[]} // Pastikan tipe data sesuai
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <MovieDisplayCard
                        {...item}
                        // Teruskan handler `onPress` ke MovieDisplayCard
                        onPress={() => handleMovieSelect(item)}
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
