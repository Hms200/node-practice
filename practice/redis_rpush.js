const redis = require('redis');

(async () => {
    const client = redis.createClient();

    client.on('error', (err) => {
        console.log('Redis client Error', err);
    });

    await client.connect();

    console.log('connected')

    await client.RPUSH('myKey', '0');
    await client.RPUSH('myKey', '1');
    await client.RPUSH('myKey', '2');

    await client.disconnect();
})();

