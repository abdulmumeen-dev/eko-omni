// mobile/components/StatusCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const StatusCard = ({ title, value, icon }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1F2937',
        borderRadius: 12,
        padding: 16,
        width: '48%',
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#374151',
    },
    icon: {
        fontSize: 24,
        marginBottom: 4,
    },
    value: {
        color: '#F3F4F6',
        fontSize: 20,
        fontWeight: 'bold',
    },
    title: {
        color: '#9CA3AF',
        fontSize: 12,
    },
});
