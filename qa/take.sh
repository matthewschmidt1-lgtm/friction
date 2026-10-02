#!/bin/sh
# Shows the next question the app would ask for one case, given the answers recorded so far.
# Usage, with the server running on :8951 from the Friction folder:
#   sh qa/take.sh qa/experts/v5/my-cases.json CASE_ID
FILE="$1"; PID="$2"; TMP=$(mktemp -d)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --virtual-time-budget=20000 --dump-dom "http://127.0.0.1:8951/qa/take.html?file=$FILE&pid=$PID" 2>/dev/null \
 | python3 -c 'import sys,re,html,io; d=io.TextIOWrapper(sys.stdin.buffer, encoding="utf-8").read(); sys.stdout.reconfigure(encoding="utf-8"); m=re.search(r"<pre id=\"out\">(.*?)</pre>", d, re.S); print(html.unescape(m.group(1)) if m else "no output; is the server running on 8951 from the Friction folder?")'
rm -rf "$TMP"
