const redis = require('redis');

const client = redis.createClient();

const users = [{a:1,b:2},{a:1,b:2},{a:1,b:2},{a:1,b:2}];
(async () => {
    await client.connect();
})();

client.on('connect', () => console.log('Redis Client Connected'));
client.on('error', (err) => console.log('Redis Client Connection Error', err));

(async () => {
    await client.set('key',users);
})();

(async () => {
	const key = await client.get('key')
	
console.log(key)
})();

(async () => {
    await client.set('key','value2');
})();

(async () => {
	const key = await client.get('key')
	
console.log(key)
})();