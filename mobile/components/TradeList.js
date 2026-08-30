// mobile/components/TradeList.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TradeList = ({ trades }) => {
    if (!trades || trades.length === 0) {
        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>💹 Recent Trades</Text>
                <Text style={styles.emptyText}>No trades yet</Text>
            </View>
        );
    }

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>💹 Recent Trades</Text>
            {trades.slice(-5).reverse().map((trade, index) => (
                <View key={index} style={styles.tradeItem}>
                    <Text style={styles.tradeAction}>{trade.action || 'trade'}</Text>
                    <Text style={styles.tradeAmount}>${trade.amount?.toFixed(2) || '0.00'}</Text>
                    <Text style={trade.profit >= 0 ? styles.profitPositive : styles.profitNegative}>
                        {trade.profit >= 0 ? '+' : ''}{trade.profit?.toFixed(2) || '0.00'}
                    </Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
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
    tradeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    tradeAction: {
        color: '#D1D5DB',
        fontSize: 14,
        flex: 2,
    },
    tradeAmount: {
        color: '#D1D5DB',
        fontSize: 14,
        flex: 1,
        textAlign: 'center',
    },
    profitPositive: {
        color: '#34D399',
        fontSize: 14,
        flex: 1,
        textAlign: 'right',
    },
    profitNegative: {
        color: '#F87171',
        fontSize: 14,
        flex: 1,
        textAlign: 'right',
    },
    emptyText: {
        color: '#6B7280',
        textAlign: 'center',
        padding: 16,
    },
});
