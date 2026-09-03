// bridge/captcha_bridge.js
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const PYTHON_PATH = path.join(__dirname, '..', 'python', 'captcha_solver.py');

export function solveCaptchaFile(imagePath) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(imagePath)) {
            reject(new Error(`Image file not found: ${imagePath}`));
            return;
        }

        const python = spawn('python3', [
            PYTHON_PATH,
            'solve_file',
            imagePath
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
                    resolve({ success: true, text: output.trim() });
                }
            } else {
                reject(new Error(error || 'Python process failed'));
            }
        });
    });
}

export function solveCaptchaURL(imageUrl) {
    return new Promise((resolve, reject) => {
        const python = spawn('python3', [
            PYTHON_PATH,
            'solve_url',
            imageUrl
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
                    resolve({ success: true, text: output.trim() });
                }
            } else {
                reject(new Error(error || 'Python process failed'));
            }
        });
    });
}

export function solveCaptchaOnPage(url, selector = 'iframe[src*="recaptcha"]') {
    return new Promise((resolve, reject) => {
        const python = spawn('python3', [
            PYTHON_PATH,
            'solve_page',
            url,
            selector
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
                reject(new Error(error || 'Python process failed'));
            }
        });
    });
}
