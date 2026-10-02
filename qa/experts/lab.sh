#!/bin/sh
# usage: sh qa/experts/lab.sh "exp=opener"  (run from Friction folder)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --virtual-time-budget=${BUDGET:-120000} --dump-dom "http://127.0.0.1:8951/qa/experts/lab.html?$1" 2>/dev/null | python3 -c 'import sys,re,html,io; d=io.TextIOWrapper(sys.stdin.buffer, encoding="utf-8").read(); sys.stdout.reconfigure(encoding="utf-8"); m=re.search(r"<pre id=\"out\">(.*?)</pre>", d, re.S); print(html.unescape(m.group(1)) if m else "no output")'
