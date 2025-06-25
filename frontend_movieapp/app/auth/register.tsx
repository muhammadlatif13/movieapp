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

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function RegisterScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleRegister = async () => {
        Keyboard.dismiss();

        if (!username.trim() || !password.trim()) {
            Alert.alert(
                'Input Tidak Lengkap',
                'Username dan password tidak boleh kosong.'
            );
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
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
                    'Registrasi Gagal',
                    data?.message || 'Terjadi kesalahan saat registrasi.'
                );
                console.error('Registrasi gagal:', data);
                return;
            }

            Alert.alert(
                'Registrasi Berhasil',
                'Akun berhasil dibuat. Silakan login.',
                [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
            );
        } catch (error) {
            console.error('Terjadi kesalahan saat registrasi:', error);
            Alert.alert('Error', 'Tidak dapat menghubungi server.');
        }
    };

    return (
        <LinearGradient colors={['#1A0B3E', '#0F0321']} style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" />

            <View className="flex-1 justify-center px-6">
                <Text className="text-white text-3xl font-bold text-center mb-2">
                    Create Account
                </Text>
                <Text className="text-gray-400 text-base text-center mb-10">
                    Sign up to get started
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
                    onPress={handleRegister}
                    className="bg-[#6A3DE8] py-3 rounded-full mt-6"
                >
                    <Text className="text-white text-center font-bold text-base">
                        Register
                    </Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}
