"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const codes_1 = require("./config/codes");
const rawmodel_1 = require("rawmodel");
class ERC721Validator extends rawmodel_1.Model {
    constructor(web3) {
        super();
        this.defineWeb3(web3);
    }
    defineWeb3(web3) {
        Object.defineProperty(this, 'web3', {
            get: () => web3
        });
    }
    basic(test, contract) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!contract) {
                    reject('You must provide contract address as input');
                }
                try {
                    const validator = new this.web3.eth.Contract(codes_1.default.ABI_BASIC);
                    yield validator
                        .deploy({
                        data: codes_1.default.DATA_BASIC,
                        arguments: [test, contract]
                    })
                        .estimateGas((err, gas) => {
                        if (!err) {
                            resolve(true);
                        }
                        else if (String(err).includes('always failing transaction')) {
                            resolve(false);
                        }
                        else {
                            resolve(err);
                        }
                    });
                }
                catch (e) {
                    reject(e);
                }
            }));
        });
    }
    token(test, contract, tokenId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (!contract) {
                        reject('You must provide contract address as input');
                    }
                    if (!tokenId) {
                        reject('You must provide tokenId as input');
                    }
                    const validator = new this.web3.eth.Contract(codes_1.default.ABI_TOKEN);
                    yield validator
                        .deploy({
                        data: codes_1.default.DATA_TOKEN,
                        arguments: [test, contract, tokenId]
                    })
                        .estimateGas((err, gas) => {
                        if (!err) {
                            resolve(true);
                        }
                        else if (String(err).includes('always failing transaction')) {
                            resolve(false);
                        }
                        else {
                            resolve(err);
                        }
                    });
                }
                catch (e) {
                    reject(e);
                }
            }));
        });
    }
    transfer(test, contract, tokenId, giver) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (!contract) {
                        reject('You must provide contract address as input');
                    }
                    if (!tokenId) {
                        reject('You must provide tokenId as input');
                    }
                    if (!giver) {
                        reject('You must provide giver address as input');
                    }
                    const validator = new this.web3.eth.Contract(codes_1.default.ABI_TRANSFER);
                    yield validator
                        .deploy({
                        data: codes_1.default.DATA_TRANSFER,
                        arguments: [test, contract, tokenId, giver]
                    })
                        .estimateGas({
                        from: '0x281055afc982d96fab65b3a49cac8b878184cb16',
                        value: '1000000000000000000000000'
                    }, (err, gas) => {
                        if (!err) {
                            resolve(true);
                        }
                        else if (String(err).includes('always failing transaction')) {
                            resolve(false);
                        }
                        else {
                            resolve(err);
                        }
                    });
                }
                catch (e) {
                    reject(e);
                }
            }));
        });
    }
}
exports.ERC721Validator = ERC721Validator;
//# sourceMappingURL=validator.js.map