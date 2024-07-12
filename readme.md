
### Getting Started

```bash
git clone <this repo>

git submodule update --init --recursive

npm i
```

### Running test
> The test result at static directory
```bash

# when run the test please make sure EVM_SENDER have enough move token
cp .env.example .env

# for all
node src/index.js --index 0 | tap-spec

# for special test

node src/index.js --index 1 | tap-spec

# get test result
node src/summary.js
```

### support index 
```javascript
    {
        1: "Cancun",
        2: "Pyspecs",
        3: "Shanghai",
        4: "VMTests",
        5: "stArgsZeroOneBalance",
        6: "stAttackTest",
        7: "stBadOpcode",
        8: "stBugs",
        9: "stCallCodes",
        10: "stCallCreateCallCodeTest",
        11: "stCallDelegateCodesCallCodeHomestead",
        12: "stCallDelegateCodesHomestead",
        13: "stChainId",
        14: "stCodeCopyTest",
        15: "stCodeSizeLimit",
        16: "stCreate2",
        17: "stCreateTest",
        18: "stDelegatecallTestHomestead",
        19: "stEIP150Specific",
        20: "stEIP150singleCodeGasPrices",
        21: "stEIP1559",
        22: "stEIP158Specific",
        23: "stEIP2930",
        24: "stEIP3607",
        25: "stExample",
        26: "stExtCodeHash",
        27: "stHomesteadSpecific",
        28: "stInitCodeTest",
        29: "stLogTests",
        30: "stMemExpandingEIP150Calls",
        31: "stMemoryStressTest",
        32: "stMemoryTest",
        33: "stNonZeroCallsTest",
        34: "stPreCompiledContracts",
        35: "stPreCompiledContracts2",
        36: "stQuadraticComplexityTest",
        37: "stRandom",
        38: "stRandom2",
        39: "stRecursiveCreate",
        40: "stRefundTest",
        41: "stReturnDataTest",
        42: "stRevertTest",
        43: "stSLoadTest",
        44: "stSStoreTest",
        45: "stSelfBalance",
        46: "stShift",
        47: "stSolidityTest",
        48: "stSpecialTest",
        49: "stStackTests",
        50: "stStaticCall",
        51: "stStaticFlagEnabled",
        52: "stSystemOperationsTest",
        53: "stTimeConsuming",
        54: "stTransactionTest",
        55: "stTransitionTest",
        56: "stWalletTest",
        57: "stZeroCallsRevert",
        58: "stZeroCallsTest",
        59: "stZeroKnowledge",
        60: "stZeroKnowledge2",
    }
```