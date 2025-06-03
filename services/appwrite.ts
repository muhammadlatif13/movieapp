import { Client, Databases, ID, Query, Permission, Role } from 'react-native-appwrite'; // Tambahkan Permission dan Role

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
// Asumsi Anda juga memiliki COLLECTION_ID untuk 'latest_movies' jika itu koleksi terpisah
const LATEST_MOVIES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_LATEST_MOVIES_COLLECTION_ID!; // Pastikan ini didefinisikan di .env

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

// Definisikan interface Movie dan TrendingMovie jika belum ada
interface Movie {
    id: number;
    title: string;
    poster_path?: string;
    // Tambahkan properti lain yang relevan
}

interface TrendingMovie {
    $id: string; // ID dokumen Appwrite
    searchTerm: string;
    movie_id: number;
    title: string;
    count: number;
    poster_url: string;
    // Tambahkan properti lain jika ada
}

export const updateSearchCount = async (query: string, movie: Movie) => {
    try {
        const result = await database.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.equal('searchTerm', query)]
        );

        if (result.documents.length > 0) {
            const existingMovie = result.documents[0];
            await database.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                existingMovie.$id,
                {
                    count: existingMovie.count + 1,
                },
                // Opsional: Anda bisa menambahkan izin di sini juga jika ingin memperbarui izin dokumen
                // [
                //     Permission.read(Role.any()),
                //     Permission.write(Role.users())
                // ]
            );
        } else {
            await database.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                {
                    searchTerm: query,
                    movie_id: movie.id,
                    title: movie.title,
                    count: 1,
                    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                },
                // --- PERBAIKAN DI SINI ---
                // Gunakan objek Permission dan Role yang benar
                [
                    Permission.read(Role.any()),    // Siapa saja bisa membaca
                    Permission.write(Role.users())  // Hanya pengguna yang terautentikasi yang bisa menulis
                ]
            );
        }
    } catch (error) {
        console.error('Error updating search count:', error);
        throw error;
    }
};

// Fungsi untuk menambahkan film ke daftar "Latest Movies"
// Ini adalah fungsi yang kita tambahkan sebelumnya. Pastikan juga izinnya benar di sini.
export const addMovieToLatest = async (movie: Movie) => {
    try {
        // Asumsi LATEST_MOVIES_COLLECTION_ID sudah didefinisikan
        if (!LATEST_MOVIES_COLLECTION_ID) {
            throw new Error("LATEST_MOVIES_COLLECTION_ID is not configured.");
        }

        const existingMovies = await database.listDocuments(
            DATABASE_ID,
            LATEST_MOVIES_COLLECTION_ID,
            [Query.equal('movieId', movie.id.toString())]
        );

        if (existingMovies.documents.length > 0) {
            const docId = existingMovies.documents[0].$id;
            await database.updateDocument(
                DATABASE_ID,
                LATEST_MOVIES_COLLECTION_ID,
                docId,
                {
                    timestamp: new Date().toISOString(),
                },
                // --- PERBAIKAN DI SINI untuk updateDocument di addMovieToLatest ---
                [
                    Permission.read(Role.any()),
                    Permission.write(Role.users())
                ]
            );
        } else {
            await database.createDocument(
                DATABASE_ID,
                LATEST_MOVIES_COLLECTION_ID,
                ID.unique(),
                {
                    movieId: movie.id.toString(),
                    title: movie.title,
                    poster_path: movie.poster_path || '',
                    timestamp: new Date().toISOString(),
                },
                // --- PERBAIKAN DI SINI untuk createDocument di addMovieToLatest ---
                [
                    Permission.read(Role.any()),
                    Permission.write(Role.users())
                ]
            );
        }
    } catch (error) {
        console.error('Error adding movie to latest:', error);
        throw error;
    }
};

export const getTrendingMovies = async (): Promise<
    TrendingMovie[] | undefined
> => {
    try {
        const result = await database.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.limit(5), Query.orderDesc('count')]
        );

        return result.documents as unknown as TrendingMovie[];
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

// Fungsi untuk mendapatkan daftar "Latest Movies" (dari diskusi sebelumnya)
export const getLatestMovies = async (): Promise<Movie[]> => {
    try {
        if (!LATEST_MOVIES_COLLECTION_ID) {
            throw new Error("LATEST_MOVIES_COLLECTION_ID is not configured.");
        }

        const response = await database.listDocuments(
            DATABASE_ID,
            LATEST_MOVIES_COLLECTION_ID,
            [
                Query.orderDesc('timestamp'),
                Query.limit(10)
            ]
        );

        return response.documents.map(doc => ({
            id: parseInt(doc.movieId),
            title: doc.title,
            poster_path: doc.poster_path,
        }));
    } catch (error) {
        console.error('Error fetching latest movies:', error);
        return [];
    }
};
