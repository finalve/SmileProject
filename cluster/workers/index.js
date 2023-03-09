const { Spot } = require('@binance/connector');

class Worker {
    #client;
    #wsRef;
    #listenkey;
    #serect;
    async Initializel({ label, apikey, apiserect, invest }) {
        this.started = true;
        this.available = false;
        this.label = label;
        this.apikey = apikey;
        this.#serect = apiserect;
        this.investment = 0;
        this.bnb = 0;
        this.pnl = 0;
        this.btc = 0;
        this.ipo = invest >= 11 ? invest : 11;
        this.takeOrder = 0;
        this.orderLength = 5;
        this.errorMessage = '';
        this.alive = new Date().getTime();
        this.openOrder = [];
        this.trading = [];
        this.success = [];
        this.catchmessage = [];
        this.backlist = [];
        this.#client = new Spot(this.apikey, this.#serect);
        await this.#apiPermissions()
        if (this.available) {
            this.#log(`Initializel Worker ${this.label}`)
            this.#myWallet();
            await this.#createListenKey();
            if (this.#listenkey) {
                this.#report();
                this.#running();
            }

        }
    }

    Setup(req) {
        this.ipo = req?.invest ? req.invest : this.ipo;
        this.orderLength = req?.maxlen ? req?.maxlen : this.orderLength;
        this.backlist = Array.isArray(req.blacklist) ? req.blacklist : this.backlist;
    }

    Data() {
        return {
            label: this.label,
            status: this.available,
            error: this.errorMessage,
            maxlen: this.orderLength,
            len: this.openOrder.length,
            investment: this.investment,
            ipo: this.ipo,
            alive: this.alive,
            pnl: this.pnl.toFixed(8),
            btc: this.btc.toFixed(8),
            bnb: this.bnb,
            takeorder: this.takeOrder,
            success: this.success,
            errorlogs: this.catchmessage,
            openorder: this.openOrder,
            blacklist: this.backlist
        }
    }
    TrushInvest(data) {
        if (data[0].pattern === 'A') return (ipo) => {
            const quantity = this.#lot(ipo / data[1].price, data[0].lotsize);
            const invest = this.#lot(quantity * data[1].price, '0.0001');
            const target_quantity = this.#lot(quantity * data[2].price, '0.00001');
            const true_target_quantity = this.#lot(quantity * data[2].price, '0.00000001');
            const true_quantity = this.#lot(true_target_quantity - target_quantity, '0.00000001')
            return { invest, quantity, target_quantity, true_quantity }
        }
        else
            if (data[0].pattern === 'B') return (ipo) => {
                const quantity = this.#lot(ipo / data[1].price, '0.00001');
                const invest = this.#lot(quantity * data[1].price, '0.0001');
                const target_quantity = this.#lot(quantity / data[2].price, data[0].lotsize);
                const true_quantity = this.#lot(target_quantity * data[2].price, '0.00000001');
                return { invest, quantity, target_quantity, true_quantity }
            }
    }
    Arbitrage({ data }) {
        if (this.started)
            if (this.available) {
                if (this.investment > this.ipo)
                    if (!this.backlist.some(x => x === data[0].symbol))
                    {
                        if (this.bnb > 0)
                        if (this.openOrder.length < this.orderLength) {
                            const userIPR = this.TrushInvest(data)(this.ipo)
                            data.userIPR = userIPR;
                            this.#newOrder(data[1].symbol, 'BUY', userIPR.quantity, data[1].price).then(response => {
                                this.openOrder.push({
                                    data: data, response:
                                    {
                                        symbol: response.data.symbol,
                                        orderId: response.data.orderId,
                                        status: response.data.status,
                                        origQty: response.data.origQty,
                                        step: 1
                                    }
                                });
                            }).catch(error => {
                                this.#error(`tradeing parttern ${data[0].pattern} step 1`, error.response?.data?.msg);
                                this.#pushError(
                                    {
                                        error: error.response?.data?.msg,
                                        symbol: [
                                            {
                                                symbol: data[1].symbol,
                                                price: data[1].price,
                                                quantity: data.userIPR.quantity
                                            }, {
                                                symbol: data[2].symbol,
                                                price: data[2].price,
                                                quantity: data.userIPR.quantity
                                            }, {
                                                symbol: data[3].symbol,
                                                price: data[3].price,
                                                quantity: data.userIPR.target_quantity
                                            }],
                                        invest: data.userIPR.invest,
                                        quote: 'usdt'
                                    });
                            })
                        }
                    } else{
                        this.#log(`Blacklist ${ data[0].symbol}`);
                    }
            }
    }

    #report() {
        const _this = this;
        this.#wsRef = this.#client.userData(this.#listenkey, this.#callback);
        setTimeout(() => _this.#refresh(), 3600000)
    }

    #callback = {
        open: () => this.#log(`Connected to Server`),
        message: async data => {
            // x = [NEW,CANCELED,PARTIALLY_FILLED,FILLED]
            // e = [executionReport,outboundAccountPosition]
            const response = JSON.parse(data)
            let json = {};
            if (response.e == "executionReport") {
                json = {
                    report: response.e,
                    symbol: response.s,
                    order: response.o,
                    signal: response.S,
                    price: response.p,
                    quote: response.Z,
                    quantity: response.Q,
                    execution_type: response.x,
                    currentOrder: response.X,
                    orderId: response.i
                };
                this.trading.push(json)

            }
            if (response.e == "outboundAccountPosition") {
                json = {
                    report: response.e,
                    symbol: response.B
                };

                try {
                    let usdt = json.symbol.find(x => x.a === 'USDT');
                    let bnb = json.symbol.find(x => x.a === 'BNB');
                    if (usdt) this.investment = usdt.f;
                    if (bnb) this.bnb = bnb.f;
                    this.#log(`balance of ${this.investment} USDT`)
                    this.#log(`balance of ${this.bnb} bnb`)
                } catch (error) {
                }

            }
        }
    };

    #running() {
        const _this = this;
        setTimeout(() => _this.#Nextstep(), 1000);
    }

    #Nextstep() {
        this.trading.map(async json => {
            switch (json.currentOrder) {
                case "NEW":
                    this.#log(`Created Order ${json.orderId} Symbol ${json.symbol} data length ${this.openOrder.length}`);
                    break;
                case "CANCELED":
                    this.openOrder = this.openOrder.filter(x => x.response?.orderId !== json.orderId);
                    this.#log(`Canceled Order ${json.orderId} Symbol ${json.symbol} data length ${this.openOrder.length}`);
                    break;
                case "FILLED":
                    {
                        this.#log(`Filled Order ${json.orderId} Symbol ${json.symbol} data length ${this.openOrder.length}`);
                        const order = this.openOrder.find(x => x.response?.orderId == json.orderId);
                        if (order) {
                            if (order.data[0].pattern === "A") {
                                if (order.response.symbol === 'BTCUSDT') {
                                    this.openOrder = this.openOrder.filter(x => x.response.orderId !== json.orderId);
                                    let lot_btc = order.data.userIPR.true_quantity > 0 ? this.#lot(order.data.userIPR.true_quantity, '0.00000001') : 0;
                                    let lot_usdt = lot_btc > 0 ? this.#lot(lot_btc * order.data[3].price, '0.000001') : 0;
                                    let profit_origin = parseFloat(json.quote) + parseFloat(lot_usdt)
                                    let profit = profit_origin - order.data.userIPR.invest
                                    this.pnl += profit;
                                    this.btc += parseFloat(lot_btc);
                                    this.#log(`Arbitrage Success Symbol [${order.data[1].symbol} ${order.data[2].symbol} ${order.data[3].symbol}] profit ${profit.toFixed(6)} usdt`);
                                    this.#pushSuccess(
                                        {
                                            symbol: [
                                                {
                                                    symbol: order.data[1].symbol,
                                                    price: order.data[1].price,
                                                    quantity: order.data.userIPR.quantity
                                                }, {
                                                    symbol: order.data[2].symbol,
                                                    price: order.data[2].price,
                                                    quantity: order.data.userIPR.quantity
                                                }, {
                                                    symbol: order.data[3].symbol,
                                                    price: order.data[3].price,
                                                    quantity: order.data.userIPR.target_quantity
                                                }],
                                            profit: profit.toFixed(6),
                                            invest: order.data.userIPR.invest,
                                            quote: 'usdt'
                                        });

                                    this.takeOrder += 1;
                                }
                                else if (order.response.symbol.includes('USDT')) {

                                    this.#newOrder(order.data[2].symbol, 'SELL', order.data.userIPR.quantity, order.data[2].price).then(response => {
                                        order.response = {
                                            symbol: response.data.symbol,
                                            orderId: response.data.orderId,
                                            status: response.data.status,
                                            origQty: response.data.origQty,
                                            step: 2
                                        }
                                    }).catch(error => {
                                        this.openOrder = this.openOrder.filter(x => x.response.orderId !== json.orderId);
                                        this.#error(`tradeing parttern ${order.data[0].pattern} step 2`, error.response?.data?.msg);
                                        this.#pushError(
                                            {
                                                error: error.response?.data?.msg,
                                                symbol: [
                                                    {
                                                        symbol: order.data[1].symbol,
                                                        price: order.data[1].price,
                                                        quantity: order.data.userIPR.quantity
                                                    }, {
                                                        symbol: order.data[2].symbol,
                                                        price: order.data[2].price,
                                                        quantity: order.data.userIPR.quantity
                                                    }, {
                                                        symbol: order.data[3].symbol,
                                                        price: order.data[3].price,
                                                        quantity: order.data.userIPR.target_quantity
                                                    }],
                                                invest: order.data.userIPR.invest,
                                                quote: 'usdt'
                                            });
                                    })
                                } else if (order.response.symbol.includes('BTC')) {

                                    this.#newOrder(order.data[3].symbol, 'SELL', order.data.userIPR.target_quantity, order.data[3].price).then(response => {
                                        order.response = {
                                            symbol: response.data.symbol,
                                            orderId: response.data.orderId,
                                            status: response.data.status,
                                            origQty: response.data.origQty,
                                            step: 3
                                        }
                                    }).catch(error => {
                                        this.openOrder = this.openOrder.filter(x => x.response.orderId !== json.orderId);
                                        this.#error(`tradeing parttern ${order.data[0].pattern} step 3`, error.response?.data?.msg);
                                        this.#pushError(
                                            {
                                                error: error.response?.data?.msg,
                                                symbol: [
                                                    {
                                                        symbol: order.data[1].symbol,
                                                        price: order.data[1].price,
                                                        quantity: order.data.userIPR.quantity
                                                    }, {
                                                        symbol: order.data[2].symbol,
                                                        price: order.data[2].price,
                                                        quantity: order.data.userIPR.quantity
                                                    }, {
                                                        symbol: order.data[3].symbol,
                                                        price: order.data[3].price,
                                                        quantity: order.data.userIPR.target_quantity
                                                    }],
                                                invest: order.data.userIPR.invest,
                                                quote: 'usdt'
                                            });
                                    })
                                }
                            } else if (order.data[0].pattern === "B") {
                                if (order.response.symbol.includes('USDT') && order.response.symbol !== 'BTCUSDT') {
                                    this.openOrder = this.openOrder.filter(x => x.response.orderId !== json.orderId);
                                    let lot_btc = order.data.userIPR.true_quantity > 0 ? this.#lot(order.data.userIPR.quantity - order.data.userIPR.true_quantity, '0.00000001') : 0;
                                    let lot_usdt = lot_btc > 0 ? this.#lot(lot_btc * order.data[1].price, '0.00000001') : 0;
                                    let profit_origin = parseFloat(json.quote) + parseFloat(lot_usdt)
                                    let profit = profit_origin - order.data.userIPR.invest
                                    this.btc += parseFloat(lot_btc);
                                    this.pnl += profit;

                                    this.#log(`Arbitrage Success Symbol [${order.data[1].symbol} ${order.data[2].symbol} ${order.data[3].symbol}] profit ${profit.toFixed(6)} usdt`);
                                    this.#pushSuccess(
                                        {
                                            symbol: [
                                                {
                                                    symbol: order.data[1].symbol,
                                                    price: order.data[1].price,
                                                    quantity: order.data.userIPR.quantity
                                                }, {
                                                    symbol: order.data[2].symbol,
                                                    price: order.data[2].price,
                                                    quantity: order.data.userIPR.target_quantity
                                                }, {
                                                    symbol: order.data[3].symbol,
                                                    price: order.data[3].price,
                                                    quantity: order.data.userIPR.target_quantity
                                                }],
                                            profit: profit.toFixed(6),
                                            invest: order.data.userIPR.invest,
                                            quote: 'usdt'

                                        });
                                    this.takeOrder += 1;
                                }
                                else if (order.response.symbol === 'BTCUSDT') {
                                    this.#newOrder(order.data[2].symbol, 'BUY', order.data.userIPR.target_quantity, order.data[2].price).then(response => {
                                        order.response = {
                                            symbol: response.data.symbol,
                                            orderId: response.data.orderId,
                                            status: response.data.status,
                                            origQty: response.data.origQty,
                                            step: 2
                                        }
                                    }).catch(error => {
                                        this.openOrder = this.openOrder.filter(x => x.response.orderId !== json.orderId);
                                        this.#error(`tradeing parttern ${order.data[0].pattern} step 2`, error.response?.data?.msg);
                                        this.#pushError(
                                            {
                                                error: error.response?.data?.msg,
                                                symbol: [
                                                    {
                                                        symbol: order.data[1].symbol,
                                                        price: order.data[1].price,
                                                        quantity: order.data.userIPR.quantity
                                                    }, {
                                                        symbol: order.data[2].symbol,
                                                        price: order.data[2].price,
                                                        quantity: order.data.userIPR.quantity
                                                    }, {
                                                        symbol: order.data[3].symbol,
                                                        price: order.data[3].price,
                                                        quantity: order.data.userIPR.target_quantity
                                                    }],
                                                invest: order.data.userIPR.invest,
                                                quote: 'usdt'
                                            });
                                    })
                                }
                                else if (order.response.symbol.includes('BTC')) {

                                    await this.#newOrder(order.data[3].symbol, 'SELL', order.data.userIPR.target_quantity, order.data[3].price).then(response => {
                                        order.response = {
                                            symbol: response.data.symbol,
                                            orderId: response.data.orderId,
                                            status: response.data.status,
                                            origQty: response.data.origQty,
                                            step: 3
                                        }
                                    }).catch(error => {
                                        this.openOrder = this.openOrder.filter(x => x.response.orderId !== json.orderId);
                                        this.#error(`tradeing parttern ${order.data[0].pattern} step 3`, error.response?.data?.msg);
                                        this.#pushError(
                                            {
                                                error: error.response?.data?.msg,
                                                symbol: [
                                                    {
                                                        symbol: order.data[1].symbol,
                                                        price: order.data[1].price,
                                                        quantity: order.data.userIPR.quantity
                                                    }, {
                                                        symbol: order.data[2].symbol,
                                                        price: order.data[2].price,
                                                        quantity: order.data.userIPR.quantity
                                                    }, {
                                                        symbol: order.data[3].symbol,
                                                        price: order.data[3].price,
                                                        quantity: order.data.userIPR.target_quantity
                                                    }],
                                                invest: order.data.userIPR.invest,
                                                quote: 'usdt'
                                            });
                                    })
                                }
                            }
                        }
                    }
                    break;
                default:
                    this.#log(`${json.currentOrder} Order ${json.orderId} Symbol ${json.symbol} `);
            }
            this.trading = this.trading.filter(x => x !== json);
        })
        this.#running();
    }

    async #refresh() {
        this.#disconnect();
        this.#client = new Spot(this.apikey, this.#serect);
        await this.#createListenKey();
        if (this.#listenkey) {
            this.#log(`worker restart userData!`);
            this.#report();
        }
    }

    #disconnect() {
        this.#listenkey = null;
        this.#client.unsubscribe(this.#wsRef);
    }

    async #apiPermissions() {
        try {
            const res = await this.#client.apiPermissions({ recvWindow: 5000 });
            const { ipRestrict, enableReading, enableSpotAndMarginTrading } = res.data;
            if (!ipRestrict)
                return this.#error('apiPermissions', `ipRestrict disabled`)
            if (!enableReading)
                return this.#error('apiPermissions', `enableReading disabled`)
            if (!enableSpotAndMarginTrading)
                return this.#error('apiPermissions', `enableSpotAndMarginTrading disabled`)
            this.#starter(true);
        } catch (err) {
            this.#error('apiPermissions', err?.response?.data?.msg)
            this.#starter(false);
        }
    }

    async #createListenKey() {
        try {
            const response = await this.#client.createListenKey()
            this.#listenkey = response.data.listenKey;
        } catch (err) {
            this.#error('createListenKey', err?.response?.data?.msg)
        }
    }

    #myWallet() {
        this.#client.userAsset().then(res => {
            let usdt = res.data.find(x => x.asset === 'USDT');
            let bnb = res.data.find(x => x.asset === 'BNB');
            if (usdt) this.investment = usdt.free;
            if (bnb) this.bnb = bnb.free;
            this.#log(`balance of ${this.investment} USDT`)
        }).catch(err => {
            this.#error('myWallet', err?.response?.data?.msg)
        });
    }

    async #newOrder(symbol, signal, quantity, price) {
        const response = await this.#client.newOrder(symbol, signal, 'LIMIT',
            {
                quantity: quantity,
                price: price,
                timeInForce: 'GTC'
            });
        return response;
    }

    async #openOrder() {
        const response = await this.#client.openOrders()
        return response;
    }

    #starter(bool) {
        this.available = bool;
    }

    #pushSuccess(msg) {
        let d = new Date();
        let n = d.toLocaleTimeString();
        msg.localtime = n;
        if (this.success > 100)
            this.success.shift();
        this.success.push(msg);
    }
    #pushError(msg) {
        let d = new Date();
        let n = d.toLocaleTimeString();
        msg.localtime = n;
        if (this.catchmessage > 100)
            this.catchmessage.shift();
        this.catchmessage.push(msg);
    }

    removeOrder(orderId) {
        this.openOrder = this.openOrder.filter(x => x.response.orderId != orderId);
        return orderId;
    }

    #error(header, msg) {
        this.errorMessage = msg
        var d = new Date();
        var n = d.toLocaleTimeString();
        console.log(
            {
                localtime: n,
                worker: this.label,
                header: header,
                message: msg
            })
    }

    Start(bool) {
        this.started = bool;
    }
    #log(msg) {
        var d = new Date();
        var n = d.toLocaleTimeString();
        console.log(`${n} user: [${this.label}] message: [${msg}]`)
    }

    #lot(price, size) {
        const decimalSize = size.toString().split('.')[1]?.length || 0;
        return Number(Math.floor(price / size) * size).toFixed(decimalSize);
    }
}
const worker = new Worker();
const label = worker.label;
process.on('message', (res) => {
    switch (res.cmd) {
        case 'init':
            worker.Initializel(res.data)
            process.send(worker.Data());
            break;
        case 'start':
            worker.Start(res.data)
            break;
        case 'setup':
            worker.Setup(res.data)
            process.send({ message: `Worker ${this.label} setup successfully` });
            break;
        case 'userdata':
            process.send(worker.Data());
            break;
        case 'arbitrage':
            try {
                worker.Arbitrage(res)
            } catch (err) {
                console.error(`Error in arbitrage: ${err} `);
            }
            break;
        case 'exit':
            exit();
            break;
        default:
        // code block
    }
});

let forkName = process.argv[2];

process.on('unhandledException', (err) => {
    console.error(`Error in child process: ${err} `);
    process.send({ child: 0, message: `${forkName} Error: ${err} ` });
    process.exit(1);
});

const exit = () => {
    process.send({ message: `Worker ${label} deleted successfully` });
    process.exit()
}
