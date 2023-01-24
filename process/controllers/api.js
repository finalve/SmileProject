const { Spot } = require('@binance/connector');
const client = new Spot();

exports.exchangeInfo = async () => {
    try {
        const response = await client.exchangeInfo();
        const filteredFields = response.data.symbols
            .filter(symbol => symbol.quoteAsset === 'BTC' || symbol.quoteAsset === 'USDT')
            .filter(symbol => symbol.status !== 'BREAK');
	
        return filteredFields;
    } catch (error) {
        console.error(error);
    }
};
// filteredFields.filter((symbol, _, allSymbols) => 
// allSymbols.filter(s => s.baseAsset === symbol.baseAsset).length > 1);