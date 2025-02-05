import { Request, Response, NextFunction } from 'express';
import { RateLimiter } from './rate-limiter';
import { createHash } from 'crypto';

export class DDoSProtection {
    private rateLimiter: RateLimiter;
    private blacklist: Set<string>;
    private suspiciousIPs: Map<string, number>;
    
    constructor() {
        this.rateLimiter = new RateLimiter();
        this.blacklist = new Set();
        this.suspiciousIPs = new Map();
    }
    
    private generateRequestKey(req: Request): string {
        const ip = req.ip;
        const userAgent = req.headers['user-agent'] || '';
        return createHash('sha256')
            .update(`${ip}:${userAgent}`)
            .digest('hex');
    }
    
    async middleware(req: Request, res: Response, next: NextFunction) {
        const key = this.generateRequestKey(req);
        
        // Check blacklist
        if (this.blacklist.has(key)) {
            return res.status(403).json({
                error: 'Access denied'
            });
        }
        
        // Check rate limit
        const allowed = await this.rateLimiter.checkLimit(key);
        if (!allowed) {
            this.handleSuspiciousActivity(key);
            return res.status(429).json({
                error: 'Too many requests'
            });
        }
        
        // Check for suspicious patterns
        if (this.isSuspiciousRequest(req)) {
            this.handleSuspiciousActivity(key);
            return res.status(403).json({
                error: 'Suspicious activity detected'
            });
        }
        
        next();
    }
    
    private isSuspiciousRequest(req: Request): boolean {
        // Check for suspicious headers
        const suspiciousHeaders = [
            'x-forwarded-for',
            'forwarded',
            'x-real-ip',
            'x-originating-ip',
            'cf-connecting-ip'
        ];
        
        const hasMultipleProxyHeaders = suspiciousHeaders
            .filter(header => req.headers[header])
            .length > 2;
            
        // Check for suspicious user agent
        const userAgent = req.headers['user-agent'] || '';
        const isSuspiciousUA = !userAgent || userAgent.length < 10;
        
        // Check for payload size
        const contentLength = parseInt(req.headers['content-length'] || '0');
        const isLargePayload = contentLength > 1024 * 1024; // 1MB
        
        return hasMultipleProxyHeaders || isSuspiciousUA || isLargePayload;
    }
    
    private handleSuspiciousActivity(key: string) {
        const count = (this.suspiciousIPs.get(key) || 0) + 1;
        this.suspiciousIPs.set(key, count);
        
        if (count >= 5) {
            this.blacklist.add(key);
            this.suspiciousIPs.delete(key);
        }
    }
    
    // Cleanup method to run periodically
    public cleanup() {
        // Clear old blacklist entries
        this.blacklist.clear();
        
        // Clear old suspicious IP entries
        this.suspiciousIPs.clear();
    }
}
