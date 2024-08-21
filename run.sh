#!/bin/bash

start=34
end=60
for ((i=$start; i<=$end; i++))
do
  node src/index.js --index "$i" | npx tap-spec
done
