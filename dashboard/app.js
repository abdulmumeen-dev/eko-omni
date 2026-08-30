// dashboard/app.js
const API_BASE = 'http://localhost:3000/api';

async function fetchData() {
    try {
        const [statusRes, memoryRes, skillsRes] = await Promise.all([
            fetch(`${API_BASE}/status`),
            fetch(`${API_BASE}/memory?limit=10`),
            fetch(`${API_BASE}/skills`)
        ]);

        const status = await statusRes.json();
        const memory = await memoryRes.json();
        const skills = await skillsRes.json();

        updateUI(status, memory, skills);
    } catch (err) {
        console.error('Dashboard error:', err);
    }
}

function updateUI(status, memory, skills) {
    // Wallet
    document.getElementById('wallet-balance').textContent = `$${status.wallet?.balance?.toFixed(2) || '0.00'}`;
    document.getElementById('wallet-address').textContent = status.identity || '0x...';

    // Stats
    document.getElementById('stats-cycles').textContent = status.cycleCount || 0;
    document.getElementById('stats-discoveries').textContent = status.stats?.discoveries || 0;
    document.getElementById('stats-patents').textContent = status.stats?.patents || 0;
    document.getElementById('stats-children').textContent = status.stats?.children || 0;

    // Cycle count
    document.getElementById('cycle-count').textContent = `Cycle: ${status.cycleCount || 0}`;

    // Skills
    const skillsList = document.getElementById('skills-list');
    skillsList.innerHTML = '';
    if (skills.skills && skills.skills.length > 0) {
        skills.skills.slice(0, 10).forEach(skill => {
            const li = document.createElement('li');
            li.textContent = `⚡ ${skill.name || skill}`;
            skillsList.appendChild(li);
        });
    } else {
        skillsList.innerHTML = '<li class="text-gray-500">No skills yet</li>';
    }
    document.getElementById('skills-count').textContent = `${skills.skills?.length || 0} skills`;

    // Goals (from status — if available)
    const goalsList = document.getElementById('goals-list');
    goalsList.innerHTML = '';
    if (status.goals && status.goals.length > 0) {
        status.goals.forEach(goal => {
            const li = document.createElement('li');
            li.textContent = `🎯 ${goal}`;
            goalsList.appendChild(li);
        });
    } else {
        goalsList.innerHTML = '<li class="text-gray-500">No active goals</li>';
    }

    // Memory
    const memoryList = document.getElementById('memory-list');
    memoryList.innerHTML = '';
    if (memory.memories && memory.memories.length > 0) {
        memory.memories.slice().reverse().slice(-10).forEach(mem => {
            const li = document.createElement('li');
            const role = mem.role || 'system';
            const content = mem.content || JSON.stringify(mem);
            li.innerHTML = `<span class="text-xs text-gray-500">[${role}]</span> ${content.slice(0, 120)}${content.length > 120 ? '...' : ''}`;
            memoryList.appendChild(li);
        });
    } else {
        memoryList.innerHTML = '<li class="text-gray-500">No memory yet</li>';
    }
}

// Refresh every 3 seconds
fetchData();
setInterval(fetchData, 3000);
