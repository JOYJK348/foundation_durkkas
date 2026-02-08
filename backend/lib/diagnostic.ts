import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'dashboard_diagnostic.log');

export function logDiagnostic(msg: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${msg} ${data ? JSON.stringify(data, null, 2) : ''}\n`;
    try {
        fs.appendFileSync(LOG_FILE, logMsg);
        console.log(`[Diagnostic] ${msg}`);
    } catch (e) {
        console.error('Failed to write diagnostic log:', e);
    }
}
