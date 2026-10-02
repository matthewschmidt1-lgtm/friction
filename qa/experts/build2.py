import json
exec(open('build.py').read().split("orgs={")[0])
o={}
# D5b: healthy firm, one candid "Sometimes" on execution
o["D5b"]=mk("Healthy control but answers 'Sometimes' to the execution item only",[1,0,0,0,0,6,5,0,0,4,0,2,[7],0,0,0,0,0,0,0,[7]])
# D6: typical decent company: 'Usually'/'Probably'/'Mostly' everywhere, no strong complaints
o["D6"]=mk("Typical decent firm: 'Usually/Mostly/Probably' everywhere; opener 'agree but don't happen'",[1,1,1,1,0,6,5,1,1,4,0,1,[7],1,0,1,1,1,0,0,[7]])
# D7: typical firm that answers 'Sometimes/Depends' (middle of the scales), no real problem
o["D7"]=mk("Normal firm: 'Sometimes/Depends/Mostly' (modest candour about ordinary imperfection)",[7,1,1,1,0,6,5,1,1,4,0,2,[7],1,1,2,2,2,0,0,[7]])
# D4c: bottleneck CEO, honest opener but denies everywhere else
o["D4c"]=mk("Bottleneck CEO picks honest opener but flatters elsewhere",[0,1,1,1,0,6,5,0,0,4,0,1,[7],1,1,1,1,0,0,0,[7]])
# D8: genuine tie, two causes: direction (leaders disagree) and trust (cannot disagree openly)
o["D8"]=mk("Two true causes: leaders disagree on priorities AND people can't say so (direction + trust), honest",[3,3,2,1,0,3,5,0,0,3,0,1,[5],1,1,1,1,3,2,4,[3,1]])
json.dump(o,open('decision-scientist-extra.json','w'),indent=1)
