#!/bin/bash

output_path="../小说下载器.user.js"
local_output_path="../小说下载器.local.user.js"

printf '\n\n\n' > black.tmp

cat meta.js black.tmp > $output_path
cat intro.js black.tmp >> $output_path
cat setting.js black.tmp >> $output_path
cat rules.js black.tmp >> $output_path
cat main.js black.tmp >> $output_path
cat lib.js black.tmp >> $output_path
cat lib_rule.js black.tmp >> $output_path
cat debug.js >> $output_path

rm black.tmp
cat $output_path | sed -e 's/enableDebug = false/enableDebug = true/g' > $local_output_path