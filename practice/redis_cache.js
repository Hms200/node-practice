const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
const morgan = require('morgan');
const axios = require('axios');

// express app generate
const express = require('express');
const app = express();

// redis connect
const redis = require('redis');
const client = redis.createClient();
client.on('error', (err) => console.log('Redis client error', err));

// set port
app.set('port', process.env.PORT || 8085);

// middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set routing
app.get('/naver/news',async (req, res) => {
    await client.connect();
    console.log('connect')
    await client.lRange(('naverNews', 0, -1, async (err, cachedItems) => {
        console.log('lrange');
        if(err) throw new err;
        if(cachedItems.length){
            res.send(cachedItems);
        }else{
            const client_id = 'hZoaCRNYTirfH2CTEkCF';
            const client_secret = 'VkoVCB65pK';
            const api_url = 'https://openapi.naver.com/v1/search/news?query=' + encodeURI('코스피');
            const option = {};
            const options = {
                method: 'get',
                url: api_url,
                ps: option,
                headers: {
                    'X-Naver-Client-Id': client_id,
                    'X-Naver-Client-Secret': client_secret,
                },
            };

            try{
               const result = await axios(options);
               for (const val of result.data) {
                   console.log('rpush')
                   await client.rPush('naverNews', val);
               }
                await client.expire('naverNews', 60 * 60);
               res.send(result.data);
            }catch (err){
                console.log(err.stackTrace);
            }


        }
    }))

});

// port listening
app.listen(app.get('port'), () => {
    console.log(app.get('port') + ' is listening...')
})