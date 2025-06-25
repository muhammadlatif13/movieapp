import React from 'react';
import { View, Text } from 'react-native';

interface Comment {
    id: number;
    user: string;
    content: string;
}

interface CommentSectionProps {
    comments: Comment[];
}

const CommentSection = ({ comments }: CommentSectionProps) => {
    return (
        <View className="mt-6">
            <Text className="text-white font-semibold text-lg mb-2">
                Comments
            </Text>
            {comments.length === 0 ? (
                <View className="mb-2 bg-white/10 p-3 rounded-lg">
                    <Text className="text-light-100">
                        No comments yet. Be the first to review!
                    </Text>
                </View>
            ) : (
                comments.map((comment) => (
                    <View
                        key={comment.id}
                        className="mb-2 bg-white/10 p-3 rounded-lg"
                    >
                        <Text className="text-white font-bold">
                            {comment.user}
                        </Text>
                        <Text className="text-light-100 mt-1">
                            {comment.content}
                        </Text>
                    </View>
                ))
            )}
        </View>
    );
};

export default CommentSection;
