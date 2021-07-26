#!/bin/bash

echo -n "{\"version\":\"" > src/version.json
yarn release --next-version | tr -d '\n' >> src/version.json
echo "\"}" >> src/version.json
yarn vite build
