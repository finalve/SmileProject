'use strict'

const { Spot } = require('@binance/connector');

const apiKey = 'pQHZnNrAQ8I0lHHsNKrk8VCSDeSmcBwVvBsxWqBF6ymRY1B6RMXNo3Y6optOPFjN'
const apiSecret = 'LYuvnjN6PoFVDk685zBK9cGjYkh9tC4n32DVgVvYbPcZe56kaVx72yxhjH7VnjgC'
const client = new Spot(apiKey, apiSecret)
const f = async () =>{
    const response = await client.exchangeInfo();
    const filteredFields = response.data.symbols
    .filter(symbol => symbol.quoteAsset === 'BTC')
    .filter(symbol => symbol.status !== 'BREAK').map(x=> console.log(`"${x.baseAsset}",` ));
}
f();