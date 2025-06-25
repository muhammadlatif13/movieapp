import { icons } from '@/constants/icons';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const Profile = () => {
    const router = useRouter();
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const storedUsername = await AsyncStorage.getItem('username');
                if (storedUsername) {
                    setUsername(storedUsername);
                }
            } catch (error) {
                console.error('Gagal mengambil username:', error);
            }
        };

        fetchUsername();
    }, []);

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('username');
            Alert.alert('Logout Berhasil', 'Anda telah keluar dari akun.');
            router.replace('/auth/login');
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Gagal saat mencoba logout.');
        }
    };

    return (
        <LinearGradient colors={['#1A0B3E', '#0F0321']} className="flex-1">
            <SafeAreaView className="flex-1">
                <View className="w-full justify-center items-center mt-6 mb-12 px-4">
                    <Text className="text-white text-2xl font-bold">
                        Profile
                    </Text>
                </View>

                <View className="justify-center items-center mb-10">
                    <View className="w-24 h-24 border-2 border-gray-500 rounded-full justify-center items-center bg-white/10">
                        <Image
                            source={icons.person}
                            className="w-16 h-16"
                            tintColor="#A0A0A0"
                        />
                    </View>
                    <Text className="text-white text-2xl font-semibold mt-4">
                        {username || 'Guest User'}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                        {username
                            ? `${username.toLowerCase()}@movieapp.com`
                            : 'email@example.com'}
                    </Text>
                </View>

                <View className="px-6">
                    <TouchableOpacity className="bg-white/5 p-4 rounded-lg flex-row items-center mb-4">
                        <Feather name="edit" size={20} color="#FFFFFF" />
                        <Text className="text-white text-base ml-4">
                            Edit Profile
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-white/5 p-4 rounded-lg flex-row items-center mb-4">
                        <Feather name="settings" size={20} color="#FFFFFF" />
                        <Text className="text-white text-base ml-4">
                            Settings
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className="bg-red-600/20 p-4 rounded-lg flex-row items-center"
                    >
                        <Feather name="log-out" size={20} color="#F87171" />
                        <Text className="text-red-400 font-semibold text-base ml-4">
                            Logout
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

export default Profile;
