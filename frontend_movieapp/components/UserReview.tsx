import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface UserReviewProps {
    rating: number;
    comment: string;
}

const UserReview = ({ rating, comment }: UserReviewProps) => {
    return (
        <View className="mt-6 bg-white/10 p-4 rounded-lg w-full">
            <Text className="text-white font-semibold mb-2">Your Review</Text>
            <View className="flex-row mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FontAwesome
                        key={star}
                        name={rating >= star ? 'star' : 'star-o'}
                        size={20}
                        color={rating >= star ? '#FFD700' : '#6b7280'}
                        style={{ marginRight: 4 }}
                    />
                ))}
            </View>
            <Text className="text-light-100 leading-5">
                {comment || 'No comment provided.'}
            </Text>
        </View>
    );
};

export default UserReview;
