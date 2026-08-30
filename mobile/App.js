// mobile/App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Home from './screens/Home';
import Chat from './screens/Chat';
import Settings from './screens/Settings';

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;
                        if (route.name === 'Home') {
                            iconName = focused ? 'home' : 'home-outline';
                        } else if (route.name === 'Chat') {
                            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
                        } else if (route.name === 'Settings') {
                            iconName = focused ? 'settings' : 'settings-outline';
                        }
                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: '#8B5CF6',
                    tabBarInactiveTintColor: 'gray',
                    tabBarStyle: {
                        backgroundColor: '#1F2937',
                        borderTopColor: '#374151',
                    },
                    headerStyle: {
                        backgroundColor: '#1F2937',
                    },
                    headerTintColor: '#fff',
                })}
            >
                <Tab.Screen name="Home" component={Home} options={{ title: '🧠 EKO' }} />
                <Tab.Screen name="Chat" component={Chat} options={{ title: '💬 Chat' }} />
                <Tab.Screen name="Settings" component={Settings} options={{ title: '⚙️ Settings' }} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
