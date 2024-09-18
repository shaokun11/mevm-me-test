#!/bin/bash

start=1
end=60
rm move.log

for ((i=$start; i<=$end; i++))
do
  node src/index.js --index "$i" | npx tap-spec
done
