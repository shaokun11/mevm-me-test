```bash
 dr -t GeneralStateTests/VMTests -- --clients t8ntool
 dr -t GeneralStateTests/VMTests/vmIOandFlowOperations -- --clients t8ntool --vmtrace
 dr -t GeneralStateTests  --  --clients t8ntool --vmtrace --testfile  GeneralStateTests/VMTests/vmIOandFlowOperations/gas.json 

 dr -t GeneralStateTests  --  --clients t8ntool --vmtrace --testfile  GeneralStateTests/VMTests/vmIOandFlowOperations/loopsConditionals.json --nologcolor >1.log 2>&1

mv 1.log ../../ethereumjs-monorepo/
```