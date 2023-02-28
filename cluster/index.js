// const { Spot } = require('@binance/connector');
// var { whitelist,arbitrage } = require('./models/vDB');
 //const {spawn} = require('child_process').spawn('sleep', ['100']);

 const { fork } = require('child_process');
const data = {a:'a',b:'b'}
const instance = [];
for (let i = 0; i < 1; i++) {
  const forked = fork('./workers/index.js', [`worker-${i}`,JSON.stringify(data)], {
    stdio: 'inherit'
  });
  instance.push(forked);
  instance[i].on('exit', (msg) => {
    console.log(`child process ${i} exited with code ${msg}`);
  });
  instance[i].on('error', (err) => {
    console.log(`ERROR: spawn failed for child process ${i}! (${err})`);
  });
  instance[i].send({ cmd: 'init' ,data:{label:'test',apikey:'pQHZnNrAQ8I0lHHsNKrk8VCSDeSmcBwVvBsxWqBF6ymRY1B6RMXNo3Y6optOPFjN',apiserect:'',invest:11}});

  instance[i].on('message', (msg) => {
    console.log(`Message from child ${i}:`, msg);
  });
}

setTimeout(() => {
  for (let i = 0; i < instance.length; i++) {
    instance[i].send({ cmd: 'exit' });
  }
}, 10000);

setTimeout(() => {
  for (let i = 0; i < instance.length; i++) {
    instance[i].send({ cmd: 'arbitrage' });
  }
}, 5000);

setInterval(() => {
}, 1000);
// const client = new Spot();
// const getExchangeInfo = async () => {
//     try {
//         const response = await client.exchangeInfo();
//         const filteredFields = response.data.symbols
//             .filter(symbol => symbol.quoteAsset === 'BTC' || symbol.quoteAsset === 'USDT')
//             .filter(symbol => symbol.status !== 'BREAK');

//         return filteredFields;
//     } catch (error) {
//         console.error(error?.response?.data);
//     }
// }

// const exchangeInfo = async () => {
// 	const info = await getExchangeInfo();
// 	const btcusdt = info.find(x=>x.symbol === 'BTCUSDT');
// 	info.forEach(element => {
// 		const Asset = whitelist.find(x => x.baseAsset === element.baseAsset);
// 		if (!Asset) {
// 			if (element.quoteAsset === 'BUSD') {
// 				whitelist.push({
// 					baseAsset: element.baseAsset,
// 					busd: {
// 						symbol: element.symbol,
// 						quoteAsset: element.quoteAsset,
// 						lotsize: element.filters.find(x => x.filterType === 'LOT_SIZE').stepSize,
// 						pricefilter: element.filters.find(x => x.filterType === 'PRICE_FILTER').tickSize
// 					}
// 				});
// 			}
// 			if (element.quoteAsset === 'USDT') {
// 				whitelist.push({
// 					baseAsset: element.baseAsset,
// 					usdt: {
// 						symbol: element.symbol,
// 						quoteAsset: element.quoteAsset,
// 						lotsize: element.filters.find(x => x.filterType === 'LOT_SIZE').stepSize,
// 						pricefilter: element.filters.find(x => x.filterType === 'PRICE_FILTER').tickSize
// 					}
// 				});
// 			}
// 			if (element.quoteAsset === 'BTC') {
// 				whitelist.push({
// 					baseAsset: element.baseAsset,
// 					btc: {
// 						symbol: element.symbol,
// 						quoteAsset: element.quoteAsset,
// 						lotsize: element.filters.find(x => x.filterType === 'LOT_SIZE').stepSize,
// 						pricefilter: element.filters.find(x => x.filterType === 'PRICE_FILTER').tickSize
// 					}
// 				});
// 			}
// 		}
// 		else {
// 			if (element.quoteAsset === 'BUSD') {
// 				Asset.busd = {
// 					symbol: element.symbol,
// 					quoteAsset: element.quoteAsset,
// 					lotsize: element.filters.find(x => x.filterType === 'LOT_SIZE').stepSize,
// 					pricefilter: element.filters.find(x => x.filterType === 'PRICE_FILTER').tickSize
// 				}
// 			}
// 			if (element.quoteAsset === 'USDT') {
// 				Asset.usdt = {
// 					symbol: element.symbol,
// 					quoteAsset: element.quoteAsset,
// 					lotsize: element.filters.find(x => x.filterType === 'LOT_SIZE').stepSize,
// 					pricefilter: element.filters.find(x => x.filterType === 'PRICE_FILTER').tickSize
// 				}
// 			}
// 			if (element.quoteAsset === 'BTC') {
// 				Asset.btc = {
// 					symbol: element.symbol,
// 					quoteAsset: element.quoteAsset,
// 					lotsize: element.filters.find(x => x.filterType === 'LOT_SIZE').stepSize,
// 					pricefilter: element.filters.find(x => x.filterType === 'PRICE_FILTER').tickSize
// 				}
// 			}
// 			Asset.btcusdt = {
// 				symbol: btcusdt.symbol,
// 				quoteAsset: btcusdt.quoteAsset,
// 				lotsize: btcusdt.filters.find(x => x.filterType === 'LOT_SIZE').stepSize,
// 				pricefilter: btcusdt.filters.find(x => x.filterType === 'PRICE_FILTER').tickSize
// 			}
// 		}
	
// 	});
// 	whitelist = whitelist.filter(x => x.usdt && x.btc && x.btcusdt)
// }

// //exchangeInfo().then(() => new arbitrage(whitelist, new socket()));
// exchangeInfo().then(() => console.log(arbitrage));