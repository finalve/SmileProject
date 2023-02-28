const socket = require("socket.io-client");
const config = require('../config');
const { workers } = require('../model/vDB');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const BASE = '103.252.119.56';
const API_URL = `http://${BASE}/api/`;
const { fork } = require('child_process');
class Bridge {
    #socket;
    #ipaddress;
    constructor() {
        this.#getipaddress().then((response) => {
            this.#ipaddress = response.data.ip;
        });
        const token = jwt.sign({ user: 'server' }, config.serect);
        this.#socket = socket.connect(`http://${BASE}/`, { path: '/socket', query: { token } });
        this.#socket.on('authenticated', () => {
            this.#socket.emit('authenticated', { servername: config.servername, ip: this.#ipaddress });
        });
        this.#socket.on('ipaddress', () => {
            this.#socket.emit('ipaddress', { ip: this.#ipaddress });
        })

        this.#socket.on('myserver', (req) => {
            if (Instance.worker.find((worker) => worker.label === req.label)) {
                return this.#socket.emit('myserver', {
                    status: 200,
                    id: req._id,
                    server: config.servername
                });
            }
        })

        this.#socket.on('arbitrage', (req) => {
            if (req?.server !== config.servername)
                return;
            return this.#socket.emit('arbitrage', {
                status: 200,
                id: req._id,
                data: Instance.arbitrage,
                server: config.servername
            });
        })
        this.#socket.on('exists', (req) => {
            if (Instance.worker.find((worker) => worker.apikey === req.apikey || worker.label === req.label)) {
                this.#socket.emit('add', {
                    status: 400,
                    id: req._id,
                    message: `KEY or Label already exists!`,
                    server: config.servername
                });
                this.#log(`Worker ${req.label} IP::[${req._ip}] already exists!`);
            }
        })
        this.#socket.on('add', (req) => {
            if (Instance.worker.find((worker) => worker.apikey === req.apikey || worker.label === req.label)) {
                this.#socket.emit('add', {
                    status: 400,
                    id: req._id,
                    message: `KEY or Label already exists!`,
                    server: config.servername
                });
                this.#log(`Worker ${req.label} IP::[${req._ip}] already exists!`);
                return
            }
            if (req?.server !== config.servername)
                return;
            if (isNaN(req.invest)) {
                this.#socket.emit('add', {
                    status: 400,
                    id: req._id,
                    message: `invalid invest`
                });
                this.#log(`Worker ${req.label} IP::[${req._ip}] invalid invest!`);
                return
            }
            const forked = fork('../workers/index.js', [JSON.stringify(req)], {
                stdio: 'inherit'
            });
            workers.push(forked);
            this.#socket.emit('add', {
                status: 200,
                id: req._id,
                server: config.servername,
                message: `${req.label} connect to server!`
            })
            this.#log(`Worker ${req.label} IP::[${req._ip}] connect to server!`);
            return

        });

        this.#socket.on(('delete'), (req) => {
            const foundWorker = Instance.worker.find((worker) => worker.label === req.label);
            if (!foundWorker)
                return
            foundWorker.delete();
            Instance.worker = Instance.worker.filter((worker) => worker.label !== req.label);
            this.#socket.emit('delete', {
                status: 200,
                id: req._id,
                message: `Worker ${req.label} deleted successfully!`
            });
            this.#log(`Worker ${req.label} IP::[${req._ip}] deleted successfully! ${Instance.worker.length}`);
            return
        });

        this.#socket.on(('rmorder'), (req) => {
            const foundWorker = Instance.worker.find((worker) => worker.label === req.label);
            if (!foundWorker) {
                this.#socket.emit('rmorder', {
                    status: 400,
                    id: req._id,
                    message: `User not found`
                });
                this.#log(`IP::[${req._ip}] User not found`);
                return
            }

            foundWorker.removeOrder(req.orderId);
            this.#socket.emit('rmorder', {
                status: 200,
                id: req._id,
                message: `Worker ${req.label} Remove Order ${req.orderId} successfully!`
            });
            this.#log(`Worker ${req.label} Remove Order ${req.orderId} successfully! ${Instance.worker.length}`);
            return
        });

        this.#socket.on(('edit'), (req) => {
            const foundWorker = Instance.worker.find((worker) => worker.label === req.label);
            if (!foundWorker) {
                this.#socket.emit('edit', {
                    status: 400,
                    id: req._id,
                    message: `User not found`
                });
                this.#log(`IP::[${req._ip}] User not found`);
                return
            }

            foundWorker.ipr = req.ipr;
            foundWorker.orderLength = req?.opl;
            this.#socket.emit('edit', {
                status: 200,
                id: req._id,
                message: `Worker ${req.label} edit successfully!`,
                data: foundWorker
            });
            this.#log(`Worker ${req.label} IP::[${req._ip}] edit successfully! ${Instance.worker.length}`);
            return
        });

        this.#socket.on(('admindelete'), (req) => {
            if (req?.server !== config.servername)
                return;
            const foundWorker = Instance.worker.find((worker) => worker.label === req.userlabel);
            if (!foundWorker) {
                this.#socket.emit('delete', {
                    status: 400,
                    id: req._id,
                    message: `User not found`
                });
                this.#log(`IP::[${req._ip}] User not found`);
                return
            }

            foundWorker.delete();
            Instance.worker = Instance.worker.filter((worker) => worker.label !== req.userlabel);
            this.#socket.emit('delete', {
                status: 200,
                id: req._id,
                message: `Worker ${req.userlabel} deleted successfully!`
            });
            this.#log(`Worker ${req.userlabel} IP::[${req._ip}] deleted successfully! ${Instance.worker.length}`);
            return
        });

        this.#socket.on(('adminrmorder'), (req) => {
            const foundWorker = Instance.worker.find((worker) => worker.label === req.userlabel);
            if (!foundWorker) {
                this.#socket.emit('rmorder', {
                    status: 400,
                    id: req._id,
                    message: `User not found`
                });
                this.#log(`IP::[${req._ip}] User not found`);
                return
            }

            foundWorker.removeOrder(req.orderId);
            this.#socket.emit('rmorder', {
                status: 200,
                id: req._id,
                message: `Worker ${req.userlabel} Remove Order ${req.orderId} successfully!`
            });
            this.#log(`Worker ${req.userlabel} IP::[${req._ip}] Remove Order ${req.orderId} successfully! ${Instance.worker.length}`);
            return
        });


        this.#socket.on(('adminedit'), (req) => {
            const foundWorker = Instance.worker.find((worker) => worker.label === req.userlabel);
            if (!foundWorker) {
                this.#socket.emit('edit', {
                    status: 400,
                    id: req._id,
                    message: `User not found`
                });
                this.#log(`IP::[${req._ip}] User not found`);
                return
            }

            foundWorker.ipr = req.ipr;
            foundWorker.orderLength = req?.opl;
            this.#socket.emit('edit', {
                status: 200,
                id: req._id,
                message: `Worker ${req.userlabel} edit successfully!`,
                data: foundWorker
            });
            this.#log(`Worker ${req.userlabel} IP::[${req._ip}] edit successfully! ${Instance.worker.length}`);
            return
        });

        this.#socket.on('userdata', (req) => {
            const foundWorker = Instance.worker.find((worker) => worker.label === req.label);
            if (!foundWorker)
                return

            return this.#socket.emit('userdata', {
                status: 200,
                id: req._id,
                data: {
                    label: foundWorker.label,
                    status: foundWorker.status(),
                    error: foundWorker.errorMessage,
                    maxlen: foundWorker.orderLength,
                    len: foundWorker.openOrder.length,
                    invesment: foundWorker.Invesment,
                    ipr: foundWorker.ipr,
                    alive: foundWorker.alive,
                    pnl: parseFloat(foundWorker.pnl).toFixed(8),
                    btc: parseFloat(foundWorker.btc).toFixed(8),
                    bnb: parseFloat(foundWorker.BNB).toFixed(8),
                    takeOrder: foundWorker.takeOrder,
                    success: foundWorker.success,
                    errorlogs: foundWorker.catchmessage,
                    orderOpen: foundWorker.openOrder

                }
            });
        })

        this.#socket.on('alluser', (req) => {
            if (req?.server !== config.servername)
                return;
            return this.#socket.emit('alluser', {
                status: 200,
                id: req._id,
                data: Instance.worker
            });
        })
    }
    #getipaddress() {
        return axios.get(API_URL + 'getipaddress');
    }
    #log(msg) {
        var d = new Date();
        var n = d.toLocaleTimeString();
        let message = `${n} user:[${config.servername}]  message:[${msg}]`;
        console.log(message)
    }
}
module.exports = Bridge;