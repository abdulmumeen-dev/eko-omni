// bridge/python_bridge.js
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const PYTHON_PATH = path.join(__dirname, '..', 'python', 'main.py');

// Check if Python is available
export async function pingPython() {
    return new Promise((resolve) => {
        try {
            const python = spawn('python3', ['--version']);
            let output = '';
            python.stdout.on('data', (data) => {
                output += data.toString();
            });
            python.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, version: output.trim() });
                } else {
                    resolve({ success: false });
                }
            });
            python.on('error', () => {
                resolve({ success: false });
            });
        } catch {
            resolve({ success: false });
        }
    });
}

// Call Python module
export function callPython(moduleName, method, params = {}) {
    return new Promise((resolve, reject) => {
        // Check if Python script exists
        if (!fs.existsSync(PYTHON_PATH)) {
            reject(new Error('Python script not found: ' + PYTHON_PATH));
            return;
        }

        const python = spawn('python3', [
            PYTHON_PATH,
            moduleName,
            method,
            JSON.stringify(params)
        ]);
        
        let output = '';
        let error = '';
        
        python.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        python.stderr.on('data', (data) => {
            error += data.toString();
        });
        
        python.on('close', (code) => {
            if (code === 0) {
                try {
                    const result = JSON.parse(output);
                    resolve(result);
                } catch {
                    resolve({ success: true, result: output.trim() });
                }
            } else {
                reject(new Error(error || 'Python process failed with code ' + code));
            }
        });
        
        python.on('error', (err) => {
            reject(new Error('Failed to start Python: ' + err.message));
        });
    });
}

// Convenience functions
export function callPythonAgent(prompt) {
    return callPython('brain.langchain_agent', 'run', { prompt });
}

export function callPythonML(inputData) {
    return callPython('models.pytorch_model', 'predict', { input_data: inputData });
}

export function callPythonAnalysis(query) {
    return callPython('brain.langchain_agent', 'analyze', { query });
}
