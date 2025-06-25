import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface RatingInputProps {
    onSubmit: (rating: number) => void;
    value?: number;
}

const RatingInput = ({ onSubmit, value = 0 }: RatingInputProps) => {
    const [selectedRating, setSelectedRating] = useState(value);

    useEffect(() => {
        setSelectedRating(value);
    }, [value]);

    const handleRate = (rate: number) => {
        setSelectedRating(rate);
        onSubmit(rate);
    };

    return (
        <View className="flex-row">
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleRate(star)}>
                    <FontAwesome
                        name={selectedRating >= star ? 'star' : 'star-o'}
                        size={32}
                        color="#FFD700"
                        style={{ marginRight: 6 }}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default RatingInput;
