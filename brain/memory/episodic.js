// memory/episodic.js
class EpisodicMemory {
  constructor(memory) {
    this.memory = memory;
    this.episodes = [];
    this.maxEpisodes = 100;
  }

  // Save an episode (a complete experience)
  saveEpisode(episode) {
    const entry = {
      id: 'ep_' + Date.now(),
      timestamp: new Date().toISOString(),
      ...episode
    };
    this.episodes.push(entry);
    if (this.episodes.length > this.maxEpisodes) {
      this.episodes.shift();
    }
    this.memory.remember('episode', episode.summary || JSON.stringify(episode), {
      type: 'episode',
      id: entry.id
    });
    return entry;
  }

  // Recall episodes by type or pattern
  recall(pattern) {
    return this.episodes.filter(e => 
      JSON.stringify(e).toLowerCase().includes(pattern.toLowerCase())
    );
  }

  // Get recent episodes
  getRecent(limit = 10) {
    return this.episodes.slice(-limit);
  }

  // Get stats
  getStats() {
    return {
      totalEpisodes: this.episodes.length,
      maxEpisodes: this.maxEpisodes
    };
  }
}

export default EpisodicMemory;
