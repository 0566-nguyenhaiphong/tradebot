const ccxt = require('ccxt');
const moment = require('moment');
// Sử dụng import() động cho delay
(async () => {
    const delay = await import('delay');

    const binance = new ccxt.binance({
        apiKey: 'atCc9hxLnBKBnXbRzqsJ1awuftOJRuSffh9HOV5ZPVgiMbMonJfSYTA6JlAHzQAN',
        secret: 'WgLw9lDYn1rE3bLujDypF4xJRvFCPFW4YRxHB3Oglx9W0ikv9wzQKAa9KodDMJ0H',
    });
    binance.setSandboxMode(true);

    async function printBalance(btcPrice) {
        const balance = await binance.fetchBalance();
        const total = balance.total
        console.log(`Balance: BTC ${total.BTC}, USDT: ${total.USDT}`);
        console.log(`Total USDT: ${(total.BTC -1) * btcPrice + total.USDT}.\n`);

    }

    async function tick() {
        const prices = await binance.fetchOHLCV('BTC/USDT', '1m', undefined, 5);
        const bPrices = prices.map(prices => {
            return {
                timestamp: moment(prices[0]).format(),
                open: prices[1],
                high: prices[2],
                low: prices[3],
                close: prices[4],
                volume: prices[5]
            };
        });
        const averagePrice = bPrices.reduce((acc, price) => acc + price.close, 0) / 5;
        const lastPrice = bPrices[bPrices.length - 1].close;
        console.log(bPrices.map(p => p.close), averagePrice, lastPrice);

        // Thuật toán dự đoán bán/mua
        const direction = lastPrice > averagePrice ? 'sell' : 'buy';
        const TRADE_SIZE = 100;
        const quantity = TRADE_SIZE / lastPrice;

        console.log(`Average price: ${averagePrice}, Last price: ${lastPrice}`);

        printBalance(lastPrice)
        
        // Chỉ định đúng đối số cho createMarketOrder
        const order = await binance.createMarketOrder('BTC/USDT', direction === 'buy' ? 'buy' : 'sell', quantity);
        console.log(`${moment().format()}: ${direction} ${quantity} BTC at ${lastPrice}`);
       
    }

    async function main() {
        while (true) {
            await tick();
            await delay.default(60 * 1000);  // Sử dụng delay.default vì import() động trả về một đối tượng với default
        }
    }

    main();
    // printBalance();
})();
