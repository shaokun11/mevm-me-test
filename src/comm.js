import { AptosAccount } from "aptos";
import { EVM_SENDER } from "./config.js";

export const DIR = "ethereum-tests/GeneralStateTests/VMTests/";
export const TEST_FORK = "Cancun"
export const SENDER_ACCOUNTS = [
    AptosAccount.fromAptosAccountObject({
        privateKeyHex: EVM_SENDER,
    })
];
console.log("sender account 0  ",SENDER_ACCOUNTS[0].address().hexString)
export const IGNORE_TEST =[
    // {
    //     name:"ethereum-tests/GeneralStateTests/VMTests/vmIOandFlowOperations/msize.json",
    //     label:"farChunk"
    // }
]
