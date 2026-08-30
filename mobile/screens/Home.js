// mobile/screens/Home.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { StatusCard } from '../components/StatusCard';
import { TradeList } from '../components/TradeList';

const API_URL = 'http://YOUR_IP:3000/api'; // Replace with your PC's IP

export default function Home() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [status, setStatus] = useState(null);
    const [memory, setMemory] = useState([]);
    const [skills, setSkills] = useState([]);

    const fetchData = async () => {
        try {
            const [statusRes, memoryRes, skillsRes] = await Promise.all([
                fetch(`${API_URL}/status`),
                fetch(`${API_URL}/memory?limit=5`),
                fetch(`${API_URL}/skills`),
            ]);

            const statusData = await statusRes.json();
            const memoryData = await memoryRes.json();
            const skillsData = await skillsRes.json();

            setStatus(statusData);
            setMemory(memoryData.memories || []);
            setSkills(skillsData.skills || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>Connecting to EKO...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />
            }
        >
            {/* Status Cards */}
            <View style={styles.grid}>
                <StatusCard
                    title="💰 Balance"
                    value={`$${status?.wallet?.balance?.toFixed(2) || '0.00'}`}
                    icon="cash"
                />
                <StatusCard
                    title="🔄 Cycle"
                    value={status?.cycleCount || 0}
                    icon="sync"
                />
                <StatusCard
                    title="🧠 Skills"
                    value={skills.length}
                    icon="bulb"
                />
                <StatusCard
                    title="👶 Children"
                    value={status?.stats?.children || 0}
                    icon="people"
                />
            </View>

            {/* Recent Memory */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📝 Recent Memory</Text>
                {memory.length > 0 ? (
                    memory.slice().reverse().slice(-5).map((mem, index) => (
                        <View key={index} style={styles.memoryItem}>
                            <Text style={styles.memoryRole}>[{mem.role || 'system'}]</Text>
                            <Text style={styles.memoryContent}>
                                {typeof mem.content === 'string'
                                    ? mem.content.slice(0, 120)
                                    : JSON.stringify(mem.content).slice(0, 120)}
                                {(mem.content?.length || 0) > 120 ? '...' : ''}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No memory yet</Text>
                )}
            </View>

            {/* Trades */}
            <TradeList trades={status?.trades || []} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111827',
    },
    loadingText: {
        color: '#9CA3AF',
        marginTop: 12,
        fontSize: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
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
        color: '#F3F4F6',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    memoryItem: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    memoryRole: {
        color: '#6B7280',
        fontSize: 12,
        marginRight: 6,
    },
    memoryContent: {
        color: '#D1D5DB',
        fontSize: 14,
        flex: 1,
    },
    emptyText: {
        color: '#6B7280',
        textAlign: 'center',
        padding: 16,
    },
});
