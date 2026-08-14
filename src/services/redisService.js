import redis, { createClient } from 'redis';

export const client = createClient({
    socket: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }
});

await client.connect();