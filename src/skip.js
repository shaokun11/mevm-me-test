export const IGNORE_TEST = [
    {
        name: "ethereum-tests/GeneralStateTests/VMTests/vmPerformance/loopExp.json",
        label: "__all__",
        comment: "No need to test performance, it depends on the move-vm implementation",
    },
    {
        name: "ethereum-tests/GeneralStateTests/VMTests/vmPerformance/loopMul.json",
        label: "__all__",
        comment: "No need to test performance, it depends on the move-vm implementation",
    },
    {
        name: "ethereum-tests/GeneralStateTests/VMTests/vmPerformance/performanceTester.json",
        label: "____all____",
        comment: "No need to test performance, it depends on the move-vm implementation",
    },
    {
        name: "ethereum-tests/GeneralStateTests/VMTests/vmTests/suicide.json",
        label: "__all__",
        comment: "No implementation SELFDESTRUCT opcode",
    },
    {
        name: "ethereum-tests/GeneralStateTests/Cancun/stEIP1153-transientStorage/15_tstoreCannotBeDosd.json",
        label: "__all__",
        comment: "Will dropped from move-vm",
    },
    {
        name: "ethereum-tests/GeneralStateTests/Cancun/stEIP1153-transientStorage/21_tstoreCannotBeDosdOOO.json",
        label: "__all__",
        comment: "Will dropped from move-vm",
    },
];
