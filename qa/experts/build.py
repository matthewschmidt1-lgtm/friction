import json
IDS=['opener','direction','focus','economics','business_uncertainty','decisions','comeback','overrule','given','waiting','analysis','execution','execution_why','leverage','repeat','authority','talent','trust','trust_last','people_limits','inversion']
def mk(name,vals):
    a={}
    for k,v in zip(IDS,vals): a[k]=v if isinstance(v,list) else [v]
    return {"name":name,"answers":a}
orgs={
"D1":mk("Founder-CEO, 90-person services firm; true constraint: centralized authority (CEO reverses managers). Honest respondent",
 [0,1,1,1,0,4,3,2,3,0,0,2,[1,6],2,3,3,2,2,1,1,[1,2]]),
"D2":mk("60-person SaaS; true constraint: too many priorities, nothing stopped",
 [4,1,3,2,3,6,5,0,0,4,0,3,[0,2],1,1,1,2,1,0,0,[0,4]]),
"D3":mk("Distribution firm; true: tie between information and capability",
 [0,0,1,1,0,2,2,1,2,2,3,1,[3,4],1,0,1,1,1,0,2,[1,7]]),
"D4":mk("CEO who IS the bottleneck (centralized) but answers flatteringly",
 [7,1,1,1,2,6,5,0,0,4,0,1,[2,7],1,1,1,2,0,0,0,[4,7]]),
"D5":mk("Healthy control; a well-run 150-person firm",
 [1,0,0,0,0,6,5,0,0,4,0,0,[0],0,0,0,0,0,0,0,[7]]),
}
json.dump(orgs,open('decision-scientist-answers.json','w'),indent=1)
