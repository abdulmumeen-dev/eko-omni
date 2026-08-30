// swarm/communication.js
export class SwarmCommunication {
    constructor(memory) {
        this.memory = memory;
        this.messages = [];
    }

    sendMessage(from, to, content, type = 'direct') {
        const message = {
            id: `msg_${Date.now()}`,
            from,
            to,
            content,
            type,
            timestamp: new Date().toISOString(),
            read: false
        };

        this.messages.push(message);
        this.memory.remember('swarm_message', JSON.stringify(message));

        console.log(`[Swarm] 💬 ${from} → ${to}: ${content}`);
        return message;
    }

    getMessagesFor(to) {
        return this.messages
            .filter(m => m.to === to || m.to === 'all')
            .filter(m => !m.read);
    }

    markAsRead(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            message.read = true;
            return true;
        }
        return false;
    }

    getConversation(agent1, agent2, limit = 20) {
        return this.messages
            .filter(m =>
                (m.from === agent1 && m.to === agent2) ||
                (m.from === agent2 && m.to === agent1)
            )
            .slice(-limit);
    }

    broadcast(from, content) {
        return this.sendMessage(from, 'all', content, 'broadcast');
    }
}
