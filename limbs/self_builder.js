// limbs/self_builder.js
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { callLLM } from './llm.js';

const execAsync = promisify(exec);

export class SelfBuilder {
  constructor(memory) {
    this.memory = memory;
    this.repos = [];
    this.tools = [];
  }

  async searchGitHub(query) {
    console.log(`[SelfBuilder] Searching GitHub for: ${query}`);
    try {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+language:javascript+language:python&sort=stars&order=desc`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'EKO-SelfBuilder'
          }
        }
      );
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('[SelfBuilder] GitHub search failed:', error.message);
      return [];
    }
  }

  async cloneRepo(url, targetDir) {
    console.log(`[SelfBuilder] Cloning: ${url}`);
    try {
      const repoName = url.split('/').pop().replace('.git', '');
      const clonePath = path.join(process.cwd(), 'cloned_repos', repoName);
      
      if (!fs.existsSync(path.dirname(clonePath))) {
        fs.mkdirSync(path.dirname(clonePath), { recursive: true });
      }

      await execAsync(`git clone ${url} ${clonePath}`);
      console.log(`[SelfBuilder] ✅ Cloned: ${repoName}`);
      return clonePath;
    } catch (error) {
      console.error('[SelfBuilder] Clone failed:', error.message);
      return null;
    }
  }

  async analyzeRepo(repoPath) {
    console.log(`[SelfBuilder] Analyzing: ${repoPath}`);
    const files = fs.readdirSync(repoPath);
    const readme = files.find(f => f.toLowerCase().includes('readme'));
    const sourceFiles = files.filter(f => f.endsWith('.js') || f.endsWith('.py') || f.endsWith('.ts'));

    let readmeContent = '';
    if (readme) {
      readmeContent = fs.readFileSync(path.join(repoPath, readme), 'utf8').slice(0, 5000);
    }

    let sourceContent = '';
    for (const file of sourceFiles.slice(0, 3)) {
      const content = fs.readFileSync(path.join(repoPath, file), 'utf8').slice(0, 3000);
      sourceContent += `\n--- ${file} ---\n${content}\n`;
    }

    return { readme: readmeContent, source: sourceContent, files };
  }

  async adaptToEKO(analysis, repoName) {
    console.log(`[SelfBuilder] Adapting ${repoName} to EKO...`);

    const prompt = `
You are EKO, a self-building AI agent. You've found a GitHub project and need to adapt it to your own architecture.

**Project Name:** ${repoName}
**README:** ${analysis.readme.slice(0, 2000)}
**Source Code:** ${analysis.source.slice(0, 2000)}

Your task:
1. Understand what this project does
2. Write a new module for EKO that uses this project's functionality
3. The module should export functions that EKO can call
4. Follow EKO's coding style (Node.js, ES modules)

Return ONLY the JavaScript code for the new module.
The module should be named "${repoName}_adapter.js"
Do not add explanations, just return the code.
`;

    try {
      const response = await callLLM(
        'You are an expert developer adapting open source projects.',
        prompt,
        null,
        0.3
      );
      return response;
    } catch (error) {
      console.error('[SelfBuilder] Adaptation failed:', error.message);
      return null;
    }
  }

  async saveNewModule(moduleName, code) {
    const modulePath = path.join(process.cwd(), 'limbs', moduleName);
    fs.writeFileSync(modulePath, code);
    console.log(`[SelfBuilder] ✅ Saved: ${moduleName}`);
    return modulePath;
  }

  async buildTool(query) {
    console.log(`[SelfBuilder] Building tool for: ${query}`);

    // 1. Search GitHub
    const repos = await this.searchGitHub(query);
    if (repos.length === 0) {
      console.log('[SelfBuilder] No repos found');
      return { success: false, reason: 'No repos found' };
    }

    // 2. Pick the top repo
    const repo = repos[0];
    console.log(`[SelfBuilder] Found: ${repo.name} (${repo.stargazers_count} stars)`);

    // 3. Clone it
    const repoPath = await this.cloneRepo(repo.clone_url);
    if (!repoPath) {
      return { success: false, reason: 'Clone failed' };
    }

    // 4. Analyze it
    const analysis = await this.analyzeRepo(repoPath);

    // 5. Adapt to EKO
    const adaptedCode = await this.adaptToEKO(analysis, repo.name);
    if (!adaptedCode) {
      return { success: false, reason: 'Adaptation failed' };
    }

    // 6. Save the new module
    const moduleName = `${repo.name}_adapter.js`;
    await this.saveNewModule(moduleName, adaptedCode);

    // 7. Record the tool
    this.tools.push({
      name: repo.name,
      module: moduleName,
      url: repo.clone_url,
      stars: repo.stargazers_count,
      addedAt: new Date().toISOString()
    });

    this.memory.remember('self_built', JSON.stringify({
      name: repo.name,
      module: moduleName,
      timestamp: new Date().toISOString()
    }));

    return { success: true, module: moduleName, repo: repo.name };
  }

  getTools() {
    return this.tools;
  }
}
