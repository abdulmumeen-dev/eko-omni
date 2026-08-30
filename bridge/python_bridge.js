// bridge/python_bridge.js
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PYTHON_PATH = path.join(__dirname, '..', 'python', 'main.py');

export function callPython(module, method, params) {
    return new Promise((resolve, reject) => {
        const python = spawn('python3', [
            PYTHON_PATH,
            module,
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
                    resolve(JSON.parse(output));
                } catch {
                    resolve(output);
                }
            } else {
                reject(new Error(error));
            }
        });
    });
}

export function callPythonAgent(prompt) {
    return callPython('brain.langchain_agent', 'run', { prompt });
}

export function callPythonML(input_data) {
    return callPython('models.pytorch_model', 'predict', { input_data });
}

export function callPythonAnalysis(query) {
    return callPython('brain.langchain_agent', 'analyze', { query });
}
