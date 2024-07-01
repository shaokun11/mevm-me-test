import { AptosAccount } from "aptos";
import { EVM_SENDER } from "./config.js";

export const DIR = "ethereum-tests/GeneralStateTests/VMTests/";
export const TEST_FORK = "Cancun"
export const SENDER_ACCOUNTS = [
    AptosAccount.fromAptosAccountObject({
        privateKeyHex: EVM_SENDER,
    })
];
console.log("sender account 0  ", SENDER_ACCOUNTS[0].address().hexString)
export const IGNORE_TEST = [
    {
        name: "ethereum-tests/GeneralStateTests/VMTests/vmPerformance/loopExp.json",
        label: "all",
        comment: "No need to test performance, it depends on the move-vm implementation"
    },
    {
        name: "ethereum-tests/GeneralStateTests/VMTests/vmPerformance/loopMul.json",
        label: "all",
        comment: "No need to test performance, it depends on the move-vm implementation"
    },
    {
        name: "ethereum-tests/GeneralStateTests/VMTests/vmPerformance/performanceTester.json",
        label: "all",
        comment: "No need to test performance, it depends on the move-vm implementation"
    },
    {
        name: "ethereum-tests/GeneralStateTests/VMTests/vmTests/blockInfo.json",
        label: "all",
        comment: "Block info  depends on the aptos block info, so we skip it"
    },
]
