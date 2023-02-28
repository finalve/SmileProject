const { Spot } = require('@binance/connector');
class Worker {
    #client;
    #wsRef;
    #listenkey;
    #serect;
    async Initializel({ label, apikey, apiserect, invest }) {
        this.started = false;
        this.label = label;
        this.apikey = apikey;
        this.#serect = apiserect;
        this.investment = 0;
        this.bnb = 0;
        this.ipo = invest >= 11 ? invest : 11;
        this.takeOrder = 0;
        this.orderLength = 5;
        this.openOrder = [];
        this.errorMessage = 'hh';
        this.#client = new Spot(this.apikey, this.#serect);
        await this.#apiPermissions()
        if (this.started) {
            this.#log(`Initializel Worker ${this.label}`)
            this.#myWallet();
        }
    }
    #Arbitrage(res) {
        console.log(res)
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
            this.#error('apiPermissions',err?.response?.data?.msg)
        }
    }
    #starter(bool) {
        this.started = bool;
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
    #log(msg) {
        var d = new Date();
        var n = d.toLocaleTimeString();
        console.log(`${n} user:[${this.label}] message:[${msg}]`)
    }

}
const worker = new Worker();
process.on('message', (res) => {
    switch (res.cmd) {
        case 'init':
            worker.Initializel(res.data)
            break;
        case 'arbitrage':
            try {
                // this.#Arbitrage(res.data);
            } catch (err) {
                console.error(`Error in arbitrage: ${err}`);
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
let data = process.argv[3];
let error = {};


process.on('unhandledException', (err) => {
    console.error(`Error in child process: ${err}`);
    process.send({ child: 0, message: `${forkName} Error: ${err}` });
    process.exit(1);
});

const exit = () => {
    process.send({ child: 0, message: `${forkName} Disconnected` });
    process.exit()
}

// setInterval(() => {
//     process.send({ counter: counter++, child: forkName });
//     console.log(JSON.parse(data))
// }, 1000);