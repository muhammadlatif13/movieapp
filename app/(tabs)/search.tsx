// src/services/appwrite.ts

// Pastikan Anda sudah mengimpor Client, Databases, Query, ID, Permission, dan Role dari Appwrite
import { Client, Databases, Query, ID, Permission, Role } from 'appwrite'; // Tambahkan Permission dan Role

// Definisikan konfigurasi Appwrite Anda
// Pastikan variabel-variabel ini sudah diatur dengan benar di lingkungan Anda
const appwriteConfig = {
    projectId: process.env.APPWRITE_PROJECT_ID, // Contoh
    endpoint: process.env.APPWRITE_ENDPOINT,   // Contoh
    databaseId: process.env.APPWRITE_DATABASE_ID, // Contoh
    latestMoviesCollectionId: process.env.APPWRITE_LATEST_MOVIES_COLLECTION_ID, // ID koleksi untuk film terbaru
    searchCountCollectionId: process.env.APPWRITE_SEARCH_COUNT_COLLECTION_ID, // ID koleksi untuk search count
};

// Inisialisasi klien Appwrite
const client = new Client();
client
    .setEndpoint(appwriteConfig.endpoint!)
    .setProject(appwriteConfig.projectId!);

const databases = new Databases(client);

// Definisikan interface Movie yang sama seperti di Search.tsx
interface Movie {
    id: number;
    title: string;
    poster_path?: string;
    // Tambahkan properti lain yang relevan
}

// Fungsi untuk memperbarui jumlah pencarian
export const updateSearchCount = async (query: string, movie: Movie) => {
    try {
        if (!appwriteConfig.databaseId || !appwriteConfig.searchCountCollectionId) {
            throw new Error("Appwrite databaseId or searchCountCollectionId is not configured.");
        }

        console.log(`Updating search count for "${query}" with movie "${movie.title}"`);

        // Contoh bagaimana Anda mungkin mengelola search count:
        // Anda bisa mencari dokumen yang ada dan memperbarui, atau membuat yang baru.
        // Untuk tujuan perbaikan izin, kita akan fokus pada bagian `createDocument` atau `updateDocument`.

        // Misalnya, kita akan membuat dokumen baru setiap kali pencarian dilakukan
        // dengan izin yang benar.
        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.searchCountCollectionId,
            ID.unique(),
            {
                query,
                movieId: movie.id.toString(),
                movieTitle: movie.title,
                timestamp: new Date().toISOString()
            },
            // --- PERBAIKAN DI SINI: Atur izin dengan benar ---
            [
                Permission.read(Role.any()),    // Siapa saja bisa membaca
                Permission.write(Role.users())  // Hanya pengguna yang terautentikasi yang bisa menulis
            ]
        );
        console.log('Search count updated successfully with correct permissions.');

    } catch (error) {
        console.error('Error updating search count:', error);
        throw error;
    }
};

// Fungsi untuk menambahkan film ke daftar "Latest Movies"
export const addMovieToLatest = async (movie: Movie) => {
    try {
        if (!appwriteConfig.databaseId || !appwriteConfig.latestMoviesCollectionId) {
            throw new Error("Appwrite databaseId or latestMoviesCollectionId is not configured.");
        }

        const existingMovies = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.latestMoviesCollectionId,
            [Query.equal('movieId', movie.id.toString())]
        );

        if (existingMovies.documents.length > 0) {
            console.log(`Film "${movie.title}" (ID: ${movie.id}) sudah ada di Latest Movies. Memperbarui timestamp.`);
            const docId = existingMovies.documents[0].$id;
            await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.latestMoviesCollectionId,
                docId,
                {
                    timestamp: new Date().toISOString(),
                },
                // --- PERBAIKAN DI SINI: Atur izin dengan benar untuk update ---
                [
                    Permission.read(Role.any()),
                    Permission.write(Role.users())
                ]
            );
        } else {
            console.log(`Menambahkan film "${movie.title}" (ID: ${movie.id}) ke Latest Movies.`);
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.latestMoviesCollectionId,
                ID.unique(),
                {
                    movieId: movie.id.toString(),
                    title: movie.title,
                    poster_path: movie.poster_path || '',
                    timestamp: new Date().toISOString(),
                },
                // --- PERBAIKAN DI SINI: Atur izin dengan benar untuk create ---
                [
                    Permission.read(Role.any()),
                    Permission.write(Role.users())
                ]
            );
        }

        // Opsional: Batasi jumlah "Latest Movies" (misalnya, hanya 10 film terbaru)
        const allLatestMovies = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.latestMoviesCollectionId,
            [Query.orderDesc('timestamp'), Query.limit(100)]
        );

        if (allLatestMovies.documents.length > 10) {
            const moviesToDelete = allLatestMovies.documents.slice(10);
            for (const doc of moviesToDelete) {
                await databases.deleteDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.latestMoviesCollectionId,
                    doc.$id
                );
                console.log(`Menghapus film lama: ${doc.title}`);
            }
        }

    } catch (error) {
        console.error('Error adding movie to latest:', error);
        throw error;
    }
};

// Fungsi untuk mendapatkan daftar "Latest Movies" (tidak ada perubahan izin di sini karena ini operasi read)
export const getLatestMovies = async (): Promise<Movie[]> => {
    try {
        if (!appwriteConfig.databaseId || !appwriteConfig.latestMoviesCollectionId) {
            throw new Error("Appwrite databaseId or latestMoviesCollectionId is not configured.");
        }

        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.latestMoviesCollectionId,
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
