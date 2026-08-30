// swarm/manager.js
export class SwarmManager {
    constructor(memory) {
        this.memory = memory;
        this.children = [];
        this.roles = ['trader', 'researcher', 'coder', 'marketer', 'analyst'];
        this.maxChildren = 10;
        this.init();
    }

    init() {
        // Load existing children from memory
        const memories = this.memory.search('child');
        if (memories && memories.length > 0) {
            for (const mem of memories) {
                try {
                    const child = JSON.parse(mem.content);
                    if (child && child.id) {
                        this.children.push(child);
                    }
                } catch {
                    // Skip invalid entries
                }
            }
        }
        console.log(`[Swarm] Loaded ${this.children.length} children`);
    }

    async spawnChild(role, name) {
        if (this.children.length >= this.maxChildren) {
            return { success: false, error: 'Max children reached' };
        }

        if (!this.roles.includes(role)) {
            return { success: false, error: `Invalid role: ${role}. Available: ${this.roles.join(', ')}` };
        }

        const child = {
            id: `child_${Date.now()}_${role}`,
            name: name || `EKO-${role.charAt(0).toUpperCase() + role.slice(1)}`,
            role: role,
            status: 'active',
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            tasksCompleted: 0,
            skills: [],
            parentId: 'eko_main'
        };

        this.children.push(child);
        this.memory.remember('child', JSON.stringify(child));

        console.log(`[Swarm] ✅ Spawned ${role} child: ${child.name}`);
        return { success: true, child };
    }

    async delegateTask(task, role, data) {
        const child = this.children.find(c => c.role === role && c.status === 'active');
        if (!child) {
            return { success: false, error: `No active ${role} child found` };
        }

        child.lastActive = new Date().toISOString();
        child.tasksCompleted += 1;

        this.memory.remember('task', JSON.stringify({
            task,
            role,
            childId: child.id,
            data,
            timestamp: new Date().toISOString()
        }));

        console.log(`[Swarm] 📤 Delegated "${task}" to ${child.name} (${role})`);
        return { success: true, child, task };
    }

    getChildById(id) {
        return this.children.find(c => c.id === id);
    }

    getChildrenByRole(role) {
        return this.children.filter(c => c.role === role && c.status === 'active');
    }

    getStats() {
        return {
            total: this.children.length,
            active: this.children.filter(c => c.status === 'active').length,
            max: this.maxChildren,
            roles: this.roles,
            children: this.children.map(c => ({
                name: c.name,
                role: c.role,
                tasks: c.tasksCompleted,
                status: c.status
            }))
        };
    }
}
