// mobile/screens/Settings.js
import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';

export default function Settings() {
    const [notifications, setNotifications] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>⚙️ Settings</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notifications</Text>
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Push Notifications</Text>
                    <Switch
                        value={notifications}
                        onValueChange={setNotifications}
                        trackColor={{ false: '#374151', true: '#8B5CF6' }}
                        thumbColor={notifications ? '#C4B5FD' : '#6B7280'}
                    />
                </View>
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Auto-Refresh</Text>
                    <Switch
                        value={autoRefresh}
                        onValueChange={setAutoRefresh}
                        trackColor={{ false: '#374151', true: '#8B5CF6' }}
                        thumbColor={autoRefresh ? '#C4B5FD' : '#6B7280'}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Server</Text>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>🔄 Test Connection</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>📋 Copy API URL</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.aboutText}>🧠 EKO Mobile v1.0.0</Text>
                <Text style={styles.aboutText}>The Digital Organism</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
        padding: 16,
    },
    title: {
        color: '#F3F4F6',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    section: {
        backgroundColor: '#1F2937',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#374151',
    },
    sectionTitle: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    settingLabel: {
        color: '#F3F4F6',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#374151',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#F3F4F6',
        fontSize: 16,
    },
    aboutText: {
        color: '#9CA3AF',
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 4,
    },
});
