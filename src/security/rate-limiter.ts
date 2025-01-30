import { Redis } from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';

export class RateLimiter {
    private limiter: RateLimiterRedis;
    
    constructor() {
        const redisClient = new Redis({
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            enableOfflineQueue: false
        });
        
        this.limiter = new RateLimiterRedis({
            storeClient: redisClient,
            keyPrefix: 'rate_limit',
            points: 10, // Number of points
            duration: 1, // Per second
            blockDuration: 60 * 15 // Block for 15 minutes
        });
    }
    
    async checkLimit(key: string): Promise<boolean> {
        try {
            await this.limiter.consume(key);
            return true;
        } catch (err) {
            return false;
        }
    }
    
    async getPoints(key: string): Promise<number> {
        try {
            const res = await this.limiter.get(key);
            return res.remainingPoints;
        } catch (err) {
            return 0;
        }
    }
}
