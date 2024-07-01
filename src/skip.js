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
    {
        name: "ethereum-tests/GeneralStateTests/VMTests/vmTests/envInfo.json",
        label: "all",
        comment: "env info we think for our vm is not necessary"
    },
];
