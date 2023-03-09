const socket = require("socket.io-client");
const config = require('../config');
var { workers, arbitrage, whitelist } = require('../models/vDB');
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
        this.#socket.on('authenticated', (res) => {
            console.log(res)
            this.#socket.emit('authenticated', { servername: config.servername, ip: this.#ipaddress });
        });

        this.#socket.on('changeservername', (req) => {
            if (req?.server !== config.servername)
                return;
            const oldname = config.servername;
            config.servername = req.servername;
            return this.#socket.emit('changeservername', {
                status: 200,
                id: req._id,
                server: config.servername,
                message: `Change Server Name ${oldname} to ${config.servername}`
            });
        })

        this.#socket.on('ipaddress', () => {
            this.#socket.emit('ipaddress', { ip: this.#ipaddress });
        })

        this.#socket.on('myserver', (req) => {
            if (workers.find((worker) => worker.label === req.label)) {
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
                data: arbitrage,
                server: config.servername
            });
        })
        this.#socket.on('exists', (req) => {
            if (workers.find((worker) => worker.apikey === req.apikey || worker.label === req.label)) {
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
            const forked = fork('./workers/index.js', [], {
                stdio: 'inherit'
            });
            forked.setMaxListeners(0);
            workers.push({ process: forked, apikey: req.apikey, label: req.label });
            forked.send({ cmd: 'init', data: req })

            return forked.once('message', (msg) => {
                this.#socket.emit('add', {
                    status: 200,
                    id: req._id,
                    server: config.servername,
                    message: `${req.label} connect to server!`,
                    data: msg
                })
                this.#log(`Worker ${req.label} IP::[${req._ip}] connect to server!`);
            })
        });

        this.#socket.on('blacklist', (req) => {
            const foundWorker = workers.find((worker) => worker.label === req.label);
            if (!foundWorker)
                return
            foundWorker.process.send({ cmd: 'blacklist', data: req });
            return foundWorker.process.once('message', (msg) => {
                this.#socket.emit('blacklist', {
                    status: 200,
                    id: req._id,
                    data: msg
                })
            })
        })

        this.#socket.on(('delete'), (req) => {
            const foundWorker = workers.find((worker) => worker.label === req.label);
            if (!foundWorker)
                return
            foundWorker.process.send({ cmd: 'exit' });

            return foundWorker.process.once('message', (msg) => {
                workers = workers.filter((worker) => worker.label !== req.label);
                this.#log(`Worker ${req.label} IP::[${req._ip}] deleted successfully! ${workers.length}`);
                this.#socket.emit('delete', {
                    status: 200,
                    id: req._id,
                    message: msg.message
                });
            })
        });

        this.#socket.on(('setup'), (req) => {
            const foundWorker = workers.find((worker) => worker.label === req.label);
            if (!foundWorker)
                return

            if (isNaN(req.invest) || isNaN(req.maxlen)) {
                this.#socket.emit('setup', {
                    status: 400,
                    id: req._id,
                    message: `invalid type`
                });
                this.#log(`Worker ${req.label} IP::[${req._ip}] invalid type!`);
                return
            }
            foundWorker.process.send({ cmd: 'setup', data: req });

            return foundWorker.process.once('message', (msg) => {
                this.#log(`Worker ${req.label} IP::[${req._ip}] setup successfully! ${workers.length}`);
                this.#socket.emit('setup', {
                    status: 200,
                    id: req._id,
                    message: msg.message
                });
            })
        });

        this.#socket.on(('rmorder'), (req) => {
            const foundWorker = workers.find((worker) => worker.label === req.label);
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
            this.#log(`Worker ${req.label} Remove Order ${req.orderId} successfully! ${workers.length}`);
            return
        });

        this.#socket.on(('admindelete'), (req) => {
            if (req?.server !== config.servername)
                return;
            const foundWorker = workers.find((worker) => worker.label === req.userlabel);
            if (!foundWorker) {
                this.#socket.emit('delete', {
                    status: 400,
                    id: req._id,
                    message: `User not found`
                });
                this.#log(`IP::[${req._ip}] User not found`);
                return
            }
            foundWorker.process.send({ cmd: 'exit' });
            workers = workers.filter((worker) => worker.label !== req.userlabel);
            this.#socket.emit('delete', {
                status: 200,
                id: req._id,
                message: `Worker ${req.userlabel} deleted successfully!`
            });
            this.#log(`Worker ${req.userlabel} IP::[${req._ip}] deleted successfully! ${workers.length}`);
            return
        });

        this.#socket.on(('adminrmorder'), (req) => {
            const foundWorker = workers.find((worker) => worker.label === req.userlabel);
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
            this.#log(`Worker ${req.userlabel} IP::[${req._ip}] Remove Order ${req.orderId} successfully! ${workers.length}`);
            return
        });


        this.#socket.on(('adminedit'), (req) => {
            const foundWorker = workers.find((worker) => worker.label === req.userlabel);
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
            this.#log(`Worker ${req.userlabel} IP::[${req._ip}] edit successfully! ${workers.length}`);
            return
        });

        this.#socket.on('userdata', (req) => {
            const foundWorker = workers.find((worker) => worker.label === req.label);
            if (!foundWorker)
                return
            foundWorker.process.send({ cmd: 'userdata' });
            return foundWorker.process.once('message', (msg) => {
                foundWorker.status = msg.status;
                foundWorker.error = msg.error;
                this.#socket.emit('userdata', {
                    status: 200,
                    id: req._id,
                    data: msg
                })
            })
        })

        this.#socket.on('alluser', (req) => {
            if (req?.server !== config.servername)
                return;
            const allworker = workers.map(x => {
                return { label: x.label ,error:x.error,statis:x.status}
            })
            return this.#socket.emit('alluser', {
                status: 200,
                id: req._id,
                data: allworker
            });
        })

        this.#socket.on('adminview', (req) => {
            const foundWorker = workers.find((worker) => worker.label === req.userlabel);
            if (!foundWorker)
                return
            foundWorker.process.send({ cmd: 'userdata' });
            return foundWorker.process.once('message', (msg) => {
                foundWorker.status = msg.status;
                foundWorker.error = msg.error;
                this.#socket.emit('userdata', {
                    status: 200,
                    id: req._id,
                    server:config.servername,
                    data: msg
                })
            })
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