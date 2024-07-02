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
];
