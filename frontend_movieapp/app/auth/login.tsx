import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StatusBar,
    Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        Keyboard.dismiss();

        if (!username.trim() || !password.trim()) {
            Alert.alert(
                'Input Tidak Lengkap',
                'Username dan password tidak boleh kosong.'
            );
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert(
                    'Login Gagal',
                    data?.message || 'Username atau password salah.'
                );
                console.error('Login gagal:', data);
                return;
            }

            if (!data?.user?.id || !data?.user?.username) {
                Alert.alert(
                    'Login Gagal',
                    'Data pengguna tidak valid dari server.'
                );
                console.error('Data user tidak lengkap:', data);
                return;
            }

            // Simpan user_id dan username ke AsyncStorage
            await AsyncStorage.setItem('user_id', String(data.user.id));
            await AsyncStorage.setItem('username', data.user.username);

            console.log('Login berhasil - user_id:', data.user.id);
            Alert.alert(
                'Login Berhasil',
                `Selamat datang ${data.user.username}`
            );
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Terjadi kesalahan saat login:', error);
            Alert.alert('Error', 'Tidak dapat menghubungi server.');
        }
    };

    return (
        <LinearGradient colors={['#1A0B3E', '#0F0321']} style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" />

            <View className="flex-1 justify-center px-6">
                <Text className="text-white text-3xl font-bold text-center mb-2">
                    Welcome Back
                </Text>
                <Text className="text-gray-400 text-base text-center mb-10">
                    Sign in to continue
                </Text>

                <View className="flex-row items-center bg-white/10 rounded-full px-4 h-12 mb-4">
                    <Feather
                        name="user"
                        size={20}
                        color="#8A8A8A"
                        className="mr-2"
                    />
                    <TextInput
                        className="flex-1 text-white text-base"
                        placeholder="Username"
                        placeholderTextColor="#8A8A8A"
                        value={username}
                        onChangeText={setUsername}
                        keyboardAppearance="dark"
                        autoCapitalize="none"
                    />
                </View>

                <View className="flex-row items-center bg-white/10 rounded-full px-4 h-12">
                    <Feather
                        name="lock"
                        size={20}
                        color="#8A8A8A"
                        className="mr-2"
                    />
                    <TextInput
                        className="flex-1 text-white text-base"
                        placeholder="Password"
                        placeholderTextColor="#8A8A8A"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        keyboardAppearance="dark"
                    />
                </View>

                <TouchableOpacity
                    onPress={handleLogin}
                    className="bg-[#6A3DE8] py-3 rounded-full mt-6"
                >
                    <Text className="text-white text-center font-bold text-base">
                        Login
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.push('/auth/register')}
                    className="mt-4"
                >
                    <Text className="text-center text-gray-400 text-sm">
                        Dont have an account?{' '}
                        <Text className="text-white font-bold">
                            Register now
                        </Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}
