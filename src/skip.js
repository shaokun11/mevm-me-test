export const SKIP_ALL_LABEL = "__all__";
export const SKIP_ALL_NAME = "__all__";

const MSG_NO_NEED = "No need to test performance, it depends on the move-vm implementation"
export const MSG_NOT_IMPLEMENTED_SELFDESTRUCT = "Not implementation SELFDESTRUCT opcode"
const MSG_DROP_FROM_MOVE_VM = "Will execute long time and dropped from move-vm"
const MSG_TO_DOUBLE_CHECK = "will execute error, need to double check"
const MST_TIMEOUT=" execute timeout"

export const MSG_NOT_SUPPORT_BLOB_TX = "Not support blob tx"
export const MSG_NOT_SUPPORT_BLOB_BASEFEE = "Not support blob basefee opcode"
export const MSG_NOT_SUPPORT_BLOB_HASH = "Not support blob hash opcode"
export const MOVE_VM_SKIP_BLOB_KEY = "Move abort in 0x1::evm_for_test: 0x4e2b"
export const MOVE_VM_SKIP_BLOB_BASEFEE_KEY = "Move abort in 0x1::evm_for_test: 0X4a"
export const MOVE_VM_SKIP_BLOB_HASH_KEY = "Move abort in 0x1::evm_for_test: 0X49"
export const MOVE_VM_SKIP_SELFDESTRUCT_KEY = "Move abort in 0x1::evm_for_test: 0xff"

export const IGNORE_TEST = [
    {
        path: "ethereum-tests/GeneralStateTests/VMTests/vmPerformance/",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_NO_NEED,
    },
    {
        path: "ethereum-tests/GeneralStateTests/VMTests/vmTests/suicide.json",
        name: "suicide",
        label: SKIP_ALL_LABEL,
        comment: MSG_NOT_IMPLEMENTED_SELFDESTRUCT,
    },
    {
        path: "ethereum-tests/GeneralStateTests/Cancun/stEIP1153-transientStorage/15_tstoreCannotBeDosd.json",
        name: SKIP_ALL_NAME,
        label: "1",
        comment: MSG_NOT_IMPLEMENTED_SELFDESTRUCT,
    },
    {
        path: "ethereum-tests/GeneralStateTests/Cancun/stEIP1153-transientStorage/21_tstoreCannotBeDosdOOO.json",
        name: SKIP_ALL_NAME,
        label: "1",
        comment: MSG_DROP_FROM_MOVE_VM,
    },
    {
        path: "ethereum-tests/GeneralStateTests/Pyspecs/cancun/eip1153_tstore/reentrant_selfdestructing_call.json",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_NOT_IMPLEMENTED_SELFDESTRUCT,
    },
    {
        path: "ethereum-tests/GeneralStateTests/Pyspecs/cancun/eip1153_tstore/run_until_out_of_gas.json",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_DROP_FROM_MOVE_VM,
    },
    {
        path: "ethereum-tests/GeneralStateTests/Pyspecs/cancun/eip4844_blobs/",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_NOT_SUPPORT_BLOB_TX,
    },
    {
        path: "ethereum-tests/GeneralStateTests/Pyspecs/cancun/eip6780_selfdestruct/",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_NOT_IMPLEMENTED_SELFDESTRUCT,
    },
    {
        path: "ethereum-tests/GeneralStateTests/Pyspecs/cancun/eip7516_blobgasfee/",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_NOT_SUPPORT_BLOB_TX,
    },
    {
        path: "ethereum-tests/GeneralStateTests/stArgsZeroOneBalance/suicideNonConst.json",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_NOT_IMPLEMENTED_SELFDESTRUCT,
    },
    {
        path: "ethereum-tests/GeneralStateTests/stAttackTest",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_NOT_IMPLEMENTED_SELFDESTRUCT,
    },
    {
        path: "ethereum-tests/GeneralStateTests/stCallCreateCallCodeTest/createInitFailStackSizeLargerThan1024.json",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_DROP_FROM_MOVE_VM,
    },
    {
        path: "ethereum-tests/GeneralStateTests/stCreate2/Create2Recursive.json",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_TO_DOUBLE_CHECK,
    },
    {
        path: "ethereum-tests/GeneralStateTests/stCreateTest/CreateOOGafterMaxCodesize.json",
        name: SKIP_ALL_NAME,
        label: "5,6",
        comment: MST_TIMEOUT,
    },
    {
        path: "ethereum-tests/GeneralStateTests/stMemoryTest/stackLimitPush3",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MST_TIMEOUT,
    },
];
