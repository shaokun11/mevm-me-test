export const SKIP_ALL_LABEL = "__all__";
export const SKIP_ALL_NAME = "__all__";

export const MSG_NOT_IMPLEMENTED_SELFDESTRUCT = "Not implementation SELFDESTRUCT opcode";
const MSG_TIMEOUT = "execute timeout";
const MSG_OUT_OF_GAS = "out of gas";
const MSG_ONLY_RUN_LOCAL = "only run local";
const MSG_RLP = "rlp decode error";
export const MSG_NOT_SUPPORT_BLOB_TX = "Not support blob tx";
export const MSG_NOT_SUPPORT_BLOB_BASEFEE = "Not support blob basefee opcode";
export const MSG_NOT_SUPPORT_BLOB_HASH = "Not support blob hash opcode";
export const MSG_NOT_SUPPORT_OPCODE_KZG = "Not support kzg opcode";
export const MSG_NOT_SUPPORT_OPCODE = "Not support opcode";

export const MOVE_VM_SKIP_BLOB_KEY = "0x1::evm_for_test: 0x4e2b";
export const MOVE_VM_SKIP_BLOB_BASEFEE_KEY = "0x1::evm_for_test: 0x4a";
export const MOVE_VM_SKIP_KZG_KEY = "0x1::evm_precompile: 0xa";
export const MOVE_VM_SKIP_BLOB_HASH_KEY = "0x1::evm_for_test: 0x49";
export const MOVE_VM_SKIP_SELFDESTRUCT_KEY = "0x1::evm_for_test: 0xff";
export const MOVE_VM_OPCODE_NOT_SUPPORT= "0x1::evm_for_test_v2: 0xd3";
const wrongTx = {
    path: "ethereum-tests/GeneralStateTests/stTransactionTest/ValueOverflowParis.json",
    name: SKIP_ALL_NAME,
    label: SKIP_ALL_LABEL,
    comment: MSG_RLP,
};
const blobTx = [
    {
        path: "ethereum-tests/GeneralStateTests/Cancun/stEIP4844-blobtransactions",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_NOT_SUPPORT_BLOB_TX,
    },
    {
        path: "ethereum-tests/GeneralStateTests/Pyspecs/cancun/eip4844_blobs",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_NOT_SUPPORT_BLOB_TX,
    },
]
export const IGNORE_TEST = [wrongTx, ...blobTx];
export const IGNORE_TEST1 = [
    wrongTx,
    ...blobTx,
    {
        path: "ethereum-tests/GeneralStateTests/Pyspecs/cancun/eip4844_blobs",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_NOT_SUPPORT_BLOB_TX,
    },
    {
        path: "ethereum-tests/GeneralStateTests/VMTests/vmPerformance",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_TIMEOUT,
    },
    {
        path: "ethereum-tests/GeneralStateTests/stAttackTest",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_TIMEOUT,
    },
    {
        path: "ethereum-tests/GeneralStateTests/Cancun/stEIP1153-transientStorage/15_tstoreCannotBeDosd.json",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_TIMEOUT,
    },

    {
        path: "ethereum-tests/GeneralStateTests/Cancun/stEIP1153-transientStorage/21_tstoreCannotBeDosdOOO.json",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_TIMEOUT,
    },
    {
        path: "ethereum-tests/GeneralStateTests/Pyspecs/cancun/eip1153_tstore/run_until_out_of_gas.json",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_TIMEOUT,
    },
    {
        path: "ethereum-tests/GeneralStateTests/stQuadraticComplexityTest/",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_TIMEOUT,
    },
    {
        path: "ethereum-tests/GeneralStateTests/stQuadraticComplexityTest/QuadraticComplexitySolidity_CallDataCopy.json",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_TIMEOUT,
    },
    {
        path: "ethereum-tests/GeneralStateTests/stStaticCall/static_Call1MB1024Calldepth.json",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_TIMEOUT,
    },
    {
        path: "ethereum-tests/GeneralStateTests/stStaticCall/static_Return50000_2.json",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_OUT_OF_GAS,
    },
    {
        path: "ethereum-tests/GeneralStateTests/stStaticCall/static_Call50000_identity.json",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_ONLY_RUN_LOCAL,
    },
    {
        path: "ethereum-tests/GeneralStateTests/stStaticCall/static_Call50000_identity2.json",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_TIMEOUT,
    },
    {
        path: "ethereum-tests/GeneralStateTests/stStaticCall",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_OUT_OF_GAS,
    },
    {
        path: "ethereum-tests/GeneralStateTests/stTimeConsuming/static_Call50000_sha256.json",
        name: SKIP_ALL_NAME,
        label: SKIP_ALL_LABEL,
        comment: MSG_OUT_OF_GAS,
    },
];
