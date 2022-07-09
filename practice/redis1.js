const redis = require('redis');


(async () => {
    const client = redis.createClient();

    client.on('error', (err) => console.log('Redis Client Error', err));

    await client.connect();

    await client.set('hong', 'BBongBBong');
    const value = await client.get('hong');

    console.log(value);

    await client.disconnect();
})();
