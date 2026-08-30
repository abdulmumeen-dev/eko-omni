// swarm/manager.js
export class SwarmManager {
    constructor(memory) {
        this.memory = memory;
        this.children = [];
        this.roles = ['trader', 'researcher', 'coder', 'marketer'];
    }

    async spawnChild(role) {
        const child = {
            id: `child_${Date.now()}_${role}`,
            role,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        this.children.push(child);
        this.memory.remember('swarm', `Spawned ${role} child`, { child });
        return child;
    }

    async delegateTask(task, role) {
        const child = this.children.find(c => c.role === role && c.status === 'active');
        if (!child) return { error: `No active ${role} child` };
        // Delegate task to child
        this.memory.remember('swarm', `Delegated ${task} to ${role}`, { task, child: child.id });
        return { success: true, child: child.id, task };
    }

    getStats() {
        return {
            total: this.children.length,
            active: this.children.filter(c => c.status === 'active').length,
            roles: this.roles
        };
    }
}
