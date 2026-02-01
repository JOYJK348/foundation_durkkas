/**
 * Attendance Service - Professional Validation Logic
 */

export class AttendanceService {
    /**
     * Calculate distance between two GPS points in Meters (Haversine Formula)
     */
    static getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371e3; // Earth Radius in Meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    /**
     * Check if current time falls within valid attendance window
     * @param classStartTime ISO String or Date
     * @param classEndTime ISO String or Date
     * @param type 'IN' (start) or 'OUT' (end)
     * @param windowMinutes Duration in minutes (default 5)
     */
    static isInsideWindow(classStartTime: Date, classEndTime: Date, type: 'IN' | 'OUT', windowMinutes: number = 5): { isValid: boolean; message: string } {
        const now = new Date();
        const start = new Date(classStartTime);
        const end = new Date(classEndTime);

        if (type === 'IN') {
            const windowEnd = new Date(start.getTime() + windowMinutes * 60000);
            if (now < start) return { isValid: false, message: 'Class has not started yet' };
            if (now > windowEnd) return { isValid: false, message: 'Check-in window closed' };
            return { isValid: true, message: 'Check-in window open' };
        } else {
            const windowStart = new Date(end.getTime() - windowMinutes * 60000);
            if (now < windowStart) return { isValid: false, message: 'Checkout is only allowed in the last 5 minutes' };
            if (now > end) return { isValid: false, message: 'Class already ended' };
            return { isValid: true, message: 'Checkout window open' };
        }
    }
}
