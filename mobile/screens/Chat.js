// mobile/screens/Chat.js
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';

const API_URL = 'http://YOUR_IP:3000/api';

export default function Chat() {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'system', content: '🧠 Hello, I am EKO. Ask me anything!' },
    ]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!message.trim() || loading) return;

        const userMsg = { role: 'user', content: message };
        setChatHistory((prev) => [...prev, userMsg]);
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/goal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal: message }),
            });
            const data = await response.json();

            const aiMsg = {
                role: 'assistant',
                content: data.success
                    ? `✅ Goal received: "${message}"\nEKO is processing...`
                    : '⚠️ Error: Could not process goal.',
            };
            setChatHistory((prev) => [...prev, aiMsg]);
        } catch (error) {
            setChatHistory((prev) => [
                ...prev,
                { role: 'assistant', content: '❌ Connection error. Is EKO running?' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <ScrollView
                style={styles.chatContainer}
                ref={(ref) => {
                    if (ref) {
                        ref.scrollToEnd({ animated: true });
                    }
                }}
                onContentSizeChange={() => {
                    // Scroll to bottom when new messages arrive
                }}
            >
                {chatHistory.map((msg, index) => (
                    <View
                        key={index}
                        style={[
                            styles.messageBubble,
                            msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
                        ]}
                    >
                        <Text style={styles.messageText}>{msg.content}</Text>
                    </View>
                ))}
                {loading && (
                    <View style={[styles.messageBubble, styles.assistantBubble]}>
                        <Text style={styles.messageText}>⏳ Thinking...</Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    placeholderTextColor="#6B7280"
                    value={message}
                    onChangeText={setMessage}
                    onSubmitEditing={sendMessage}
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
    },
    chatContainer: {
        flex: 1,
        padding: 16,
        paddingBottom: 8,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#8B5CF6',
    },
    assistantBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#1F2937',
        borderWidth: 1,
        borderColor: '#374151',
    },
    messageText: {
        color: '#F3F4F6',
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#1F2937',
        borderTopWidth: 1,
        borderTopColor: '#374151',
    },
    input: {
        flex: 1,
        backgroundColor: '#111827',
        color: '#F3F4F6',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#374151',
    },
    sendButton: {
        backgroundColor: '#8B5CF6',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginLeft: 10,
        justifyContent: 'center',
    },
    sendButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
