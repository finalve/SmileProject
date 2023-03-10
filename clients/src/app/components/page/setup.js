import React, { useState, useEffect } from 'react';
export default function Setup({ data ,AuthService }) {
    const optionsData = ["ETH",
        "LTC",
        "BNB",
        "NEO",
        "GAS",
        "WTC",
        "LRC",
        "QTUM",
        "OMG",
        "ZRX",
        "KNC",
        "SNM",
        "IOTA",
        "LINK",
        "MTL",
        "EOS",
        "SNT",
        "ETC",
        "ZEC",
        "BNT",
        "AST",
        "DASH",
        "OAX",
        "REQ",
        "VIB",
        "TRX",
        "POWR",
        "XRP",
        "ENJ",
        "STORJ",
        "KMD",
        "NULS",
        "XMR",
        "AMB",
        "BAT",
        "LSK",
        "MANA",
        "ADX",
        "ADA",
        "XLM",
        "WABI",
        "WAVES",
        "ICX",
        "ELF",
        "NEBL",
        "RLC",
        "PIVX",
        "IOST",
        "STEEM",
        "BLZ",
        "ZIL",
        "ONT",
        "WAN",
        "QLC",
        "SYS",
        "LOOM",
        "ZEN",
        "THETA",
        "IOTX",
        "QKC",
        "DATA",
        "ARDR",
        "VET",
        "DOCK",
        "RVN",
        "DCR",
        "REN",
        "ONG",
        "FET",
        "CELR",
        "MATIC",
        "ATOM",
        "PHB",
        "TFUEL",
        "ONE",
        "FTM",
        "ALGO",
        "DOGE",
        "DUSK",
        "ANKR",
        "COS",
        "TOMO",
        "CHZ",
        "BAND",
        "XTZ",
        "HBAR",
        "NKN",
        "STX",
        "KAVA",
        "ARPA",
        "CTXC",
        "BCH",
        "VITE",
        "OGN",
        "DREP",
        "WRX",
        "LTO",
        "COTI",
        "STPT",
        "SOL",
        "CTSI",
        "HIVE",
        "CHR",
        "MDT",
        "STMX",
        "DGB",
        "COMP",
        "SXP",
        "SNX",
        "IRIS",
        "MKR",
        "RUNE",
        "FIO",
        "AVA",
        "BAL",
        "YFI",
        "JST",
        "ANT",
        "CRV",
        "SAND",
        "OCEAN",
        "NMR",
        "DOT",
        "IDEX",
        "PAXG",
        "TRB",
        "WBTC",
        "SUSHI",
        "KSM",
        "EGLD",
        "DIA",
        "UMA",
        "BEL",
        "WING",
        "UNI",
        "OXT",
        "AVAX",
        "FLM",
        "SCRT",
        "ORN",
        "UTK",
        "XVS",
        "ALPHA",
        "VIDT",
        "AAVE",
        "NEAR",
        "FIL",
        "INJ",
        "AERGO",
        "AUDIO",
        "CTK",
        "AXS",
        "HARD",
        "STRAX",
        "FOR",
        "UNFI",
        "ROSE",
        "SKL",
        "GLM",
        "GRT",
        "PSG",
        "1INCH",
        "OG",
        "ATM",
        "CELO",
        "RIF",
        "TRU",
        "TWT",
        "FIRO",
        "LIT",
        "SFP",
        "FXS",
        "DODO",
        "FRONT",
        "CAKE",
        "ACM",
        "AUCTION",
        "PHA",
        "TVK",
        "BADGER",
        "FIS",
        "OM",
        "POND",
        "DEGO",
        "ALICE",
        "LINA",
        "PERP",
        "SUPER",
        "CFX",
        "AUTO",
        "TKO",
        "TLM",
        "BAR",
        "FORTH",
        "ICP",
        "AR",
        "POLS",
        "MDX",
        "LPT",
        "AGIX",
        "ATA",
        "GTC",
        "BAKE",
        "KLAY",
        "BOND",
        "MLN",
        "QUICK",
        "C98",
        "CLV",
        "QNT",
        "FLOW",
        "MINA",
        "FARM",
        "ALPACA",
        "MBOX",
        "WAXP",
        "PROM",
        "DYDX",
        "GALA",
        "ILV",
        "YGG",
        "FIDA",
        "AGLD",
        "RAD",
        "BETA",
        "RARE",
        "SSV",
        "LAZIO",
        "CHESS",
        "DAR",
        "BNX",
        "MOVR",
        "CITY",
        "ENS",
        "QI",
        "PORTO",
        "JASMY",
        "AMP",
        "PLA",
        "PYR",
        "RNDR",
        "ALCX",
        "SANTOS",
        "MC",
        "BICO",
        "FLUX",
        "VOXEL",
        "HIGH",
        "CVX",
        "PEOPLE",
        "JOE",
        "ACH",
        "IMX",
        "GLMR",
        "LOKA",
        "API3",
        "ACA",
        "XNO",
        "WOO",
        "ALPINE",
        "GMT",
        "KDA",
        "APE",
        "MULTI",
        "ASTR",
        "MOB",
        "NEXO",
        "GAL",
        "LDO",
        "OP",
        "STG",
        "GMX",
        "POLYX",
        "APT",
        "OSMO",
        "HFT",
        "HOOK",
        "MAGIC",
        "RPL",
        "GNS",
        "SYN",
        "LQTY"]
    const [blacklist, setBlacklist] = useState(data.blacklist);

    const handleOptionChange = (event) => {
        const selected = event.target.value
        if(!blacklist.some(x=>x===selected))
        setBlacklist((prev) => {
            return [...prev, selected]
        });
    };

    const removeOptionChange = (event) => {
        const selected = event.target.value;
        const result = blacklist.filter(x=>x!==selected);
        setBlacklist(result);
    };


    const [options, setOption] = useState(optionsData);
    const [modifyData, setmodifyData] = useState({
        invest: data?.ipo,
        maxlen: data?.maxlen,
        rate:data?.minrate,
        rate:data?.maxrate,
    });

    const setInput = (e) => {
        const { name, value } = e.target;
        setmodifyData((prev) => {
            return {
                ...prev,
                [name]: value
            }
        })
    }

    const filterOnChange = (e) => {
        const value = e.target.value;
        const filter = optionsData.filter(x => x.toLocaleLowerCase().includes(value.toLocaleLowerCase()))
        setOption(filter);
    }

    const submit = () => {
        AuthService.setup(modifyData,blacklist).then((res) => {
			console.log(res.data)
		}, error => {
			alert(error.response.data.message)
		})
    }
    return (
        <div className="row">
            <div className="col-12 grid-margin stretch-card">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body" onKeyDown={event => {
                            if (event.key === 'Enter') {
                                submit()
                            }
                        }}>
                            <h4 className="card-title mb-0"><i className="menu-icon mdi mdi-lock me-2"></i>ตั้งค่า ระบบ<small className="card-description" style={{ marginLeft: "5px" }}></small></h4>
                            <hr></hr>
                            <div className="forms mt-3">
                                <div className="form-group">
                                    <label>จำนวนการถือออเดอร์สูงสุด</label>
                                    <input type="number" className="form-control form-control-lg" name='maxlen' value={modifyData.maxlen} onChange={setInput} placeholder="จำนวนการถือออเดอร์สูงสุด" required />
                                </div>
                                <div className="form-group">
                                    <label>การลงทุนต่อออเดอร์ <span className="text-warning"> ( ขั้นต่ำ 11 USDT ) </span></label>
                                    <input type="number" className="form-control form-control-lg" name='invest' value={modifyData.invest} onChange={setInput} placeholder="การลงทุนต่อออเดอร์ ( ขั้นต่ำ 11 USDT )" />
                                </div>
                                <div className="form-group">
                                    <label>ผลกำไรขั้นต่ำ  <span className="text-warning"> ( ขั้นต่ำ 0.15 ) **  คิดเป็นเปอร์เซน  </span></label>
                                    <input type="number" className="form-control form-control-lg" name='rate' value={modifyData.minrate} onChange={setInput} placeholder="ผลกำไรขั้นต่ำ ( ขั้นต่ำ 0.15 ) ** คิดเป็นเปอร์เซน" />
                                </div>
                                <div className="form-group">
                                    <label>ผลกำไรสูงสุด  <span className="text-warning"> ( ค่าตั้งต้น 1 ) **  คิดเป็นเปอร์เซน  </span></label>
                                    <input type="number" className="form-control form-control-lg" name='rate' value={modifyData.maxrate} onChange={setInput} placeholder="ผลกำไรสูงสุด ( ค่าตั้งต้น 1 ) ** คิดเป็นเปอร์เซน" />
                                </div>
                                <div className="alert alert-dark mb-4 mt-3" role="alert">
                                    <i className="mdi mdi-pin me-1"></i>
                                    เหรียญที่ไม่ต้องการดำเนินการ ** <span className="text-warning">Blacklist </span> หากไม่เลือกจะถือว่า อนุญาติทุกคู่เหรียญ
                                </div>
                                <div className="form-group">
                                    <label>ค้นหา</label>
                                    <input type="text" className="form-control form-control-lg" name='filter' onChange={filterOnChange} placeholder="ค้นหาเหรียญที่ต้องการ" />
                                </div>
                                <div className="form-group d-flex">
                                    <select id="multi-selector" name='blacklist' className='form-select form-select-lg mb-3 bg-transparent' onChange={handleOptionChange} multiple >
                                        {options.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                    <select id="multi-selector" name='sbl' className='form-select form-select-lg mb-3 bg-transparent' onChange={removeOptionChange} multiple >
                                        {blacklist.map((option, index) => (
                                            <option key={index} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-warning me-2" onClick={() => {
                                    submit();
                                }}>Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}