#!/bin/sh
# Replays persona answers through the real engine and prints the questions asked and the diagnosis page.
# Usage, with the server running on :8951 from the Friction folder:
#   sh qa/diagnose.sh qa/experts/my-answers.json [PERSONA_ID]
FILE="$1"; PID="$2"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --virtual-time-budget=20000 --dump-dom "http://127.0.0.1:8951/qa/diagnose.html?file=$FILE&pid=$PID" 2>/dev/null \
 | python3 -c 'import sys,re,html,io; d=io.TextIOWrapper(sys.stdin.buffer, encoding="utf-8").read(); sys.stdout.reconfigure(encoding="utf-8"); m=re.search(r"<pre id=\"out\">(.*?)</pre>", d, re.S); print(html.unescape(m.group(1)) if m else "no output; is the server running on 8951 from the Friction folder?")'
