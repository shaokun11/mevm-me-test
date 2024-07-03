export const SKIP_ALL_LABEL = "__all__";

export const IGNORE_TEST = [
    {
        path: "ethereum-tests/GeneralStateTests/VMTests/vmPerformance/loopExp.json",
        name: "loopExp",
        label: SKIP_ALL_LABEL,
        comment: "No need to test performance, it depends on the move-vm implementation",
    },
    {
        path: "ethereum-tests/GeneralStateTests/VMTests/vmPerformance/loopMul.json",
        name: "loopMul",
        label: SKIP_ALL_LABEL,
        comment: "No need to test performance, it depends on the move-vm implementation",
    },
    {
        path: "ethereum-tests/GeneralStateTests/VMTests/vmPerformance/performanceTester.json",
        name: "performanceTester",
        label: SKIP_ALL_LABEL,
        comment: "No need to test performance, it depends on the move-vm implementation",
    },
    {
        path: "ethereum-tests/GeneralStateTests/VMTests/vmTests/suicide.json",
        name: "suicide",
        label: SKIP_ALL_LABEL,
        comment: "No implementation SELFDESTRUCT opcode",
    },
    {
        path: "ethereum-tests/GeneralStateTests/Cancun/stEIP1153-transientStorage/15_tstoreCannotBeDosd.json",
        name: "15_tstoreCannotBeDosd",
        label: SKIP_ALL_LABEL,
        comment: "Will execute long time and dropped from move-vm",
    },
    {
        path: "ethereum-tests/GeneralStateTests/Cancun/stEIP1153-transientStorage/21_tstoreCannotBeDosdOOO.json",
        name: "21_tstoreCannotBeDosdOOO",
        label: SKIP_ALL_LABEL,
        comment: "Will execute long time and dropped from move-vm",
    },
];
