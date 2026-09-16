// Friction v3 — content
// Signal → Hypothesis → Question → Evidence → Decision → Act → Learn.
// The user sees three lenses and a conversation. The engine sees signals, hypotheses with confidence,
// and a question pool it chooses from. Everything a person reads lives in this file.
const BK = {
  grove:       { title: 'High Output Management', author: 'Andrew S. Grove' },
  google:      { title: 'How Google Works', author: 'Eric Schmidt & Jonathan Rosenberg' },
  coach:       { title: 'Trillion Dollar Coach', author: 'Schmidt, Rosenberg & Eagle' },
  charan:      { title: 'What the CEO Wants You to Know', author: 'Ram Charan' },
  conscious:   { title: 'The 15 Commitments of Conscious Leadership', author: 'Dethmer, Chapman & Klemp' },
  munger:      { title: 'Poor Charlie\'s Almanack', author: 'Charlie Munger' },
  collins:     { title: 'Good to Great', author: 'Jim Collins' },
  davenport:   { title: 'Competing on Analytics', author: 'Davenport & Harris' },
  peters:      { title: 'In Search of Excellence', author: 'Peters & Waterman' },
  drucker:     { title: 'The Practice of Management', author: 'Peter Drucker' },
  christensen: { title: 'The Innovator\'s Dilemma', author: 'Clayton Christensen' },
  meadows:     { title: 'Thinking in Systems', author: 'Donella Meadows' },
  lencioni:    { title: 'The Five Dysfunctions of a Team', author: 'Patrick Lencioni' },
};
const bk = (k, idea) => ({ ...BK[k], idea });


export const LENSES = {
  B: { key: 'B', name: 'Business', line: 'Do you know what matters?' },
  S: { key: 'S', name: 'System',   line: 'Can the organization execute?' },
  P: { key: 'P', name: 'People',   line: 'Can people act on it?' },
};

// ---------- Hypotheses: what could be creating the friction ----------
// Each has a lens and an importance weight used by the actor. The playbook of the same key
// supplies everything the user reads once a hypothesis becomes the current read.
export const HYPOTHESES = {
  direction:       { lens: 'B', name: 'Leadership isn\'t aligned on what matters most', importance: 1.0 },
  focus:           { lens: 'B', name: 'Too many priorities, nothing formally stopped', importance: .9 },
  economics:       { lens: 'B', name: 'Priorities aren\'t tied to what creates value', importance: .9 },
  decision_rights: { lens: 'S', name: 'Decision rights are unclear', importance: 1.0 },
  information:     { lens: 'S', name: 'Decisions wait on information that doesn\'t reach them', importance: .8 },
  execution:       { lens: 'S', name: 'Agreed priorities don\'t reliably happen', importance: .9 },
  leverage:        { lens: 'S', name: 'Performance depends on people working around the system', importance: .9 },
  centralized:     { lens: 'P', name: 'Decision authority is more centralized than the business requires', importance: 1.0 },
  capability:      { lens: 'P', name: 'People haven\'t been given the capability to decide well', importance: .8 },
  talent:          { lens: 'P', name: 'The best people aren\'t on the highest-value problems', importance: .9 },
  trust:           { lens: 'P', name: 'It isn\'t safe to raise problems or disagree', importance: 1.0 },
};
export const HYP_ORDER = Object.keys(HYPOTHESES);

// Confidence is a 0–1 value inside. The user sees a label.
export const CONFIDENCE_LABELS = [
  { min: .8,  key: 'high',     label: 'High confidence', d: 'Several independent answers point the same way and nothing you said cuts against it.' },
  { min: .65, key: 'strong',   label: 'Strong pattern',  d: 'The evidence leans clearly one way. One or two answers could still move it.' },
  { min: .45, key: 'emerging', label: 'Emerging pattern', d: 'A pattern is forming but a competing explanation is still live. The open question below is how to tell them apart.' },
  { min: 0,   key: 'early',    label: 'Early signal',    d: 'This is the strongest of several weak signals. Treat it as a hypothesis to test, not a finding.' },
];
export const confidenceLabel = p => CONFIDENCE_LABELS.find(c => p >= c.min);

// ---------- Question pool with metadata ----------
// sig: log-odds contribution to each hypothesis (+ supports, − contradicts).
// obs: the factual signal, in plain words, shown under "what supports this".
// act: actionability 0–1. gate: asked only while the named hypotheses are live. The actor chooses among these.
const o = (t, sig = {}, obs = null, extra = {}) => ({ t, sig, obs, ...extra });

export const OPENER = {
  id: 'opener', lens: null, act: .6, opener: true,
  eyebrow: 'Start with the signal',
  title: 'What\'s getting in the way most right now?',
  help: 'Pick the one that sounds most like your week.',
  options: [
    o('Too many decisions come to me', { centralized: 1.4, decision_rights: 1.0, information: .5, capability: .5 }, 'Decisions escalate to the top'),
    o('We agree on things that then don\'t happen', { execution: 1.4, focus: .6, decision_rights: .4 }, 'Agreed priorities don\'t get delivered'),
    o('We keep solving the same problems', { leverage: 1.3, execution: .5, information: .3 }, 'Problems recur'),
    o('Leaders don\'t agree on what matters', { direction: 1.6, economics: .4 }, 'Leadership holds different priorities'),
    o('Too many priorities, nothing gets finished', { focus: 1.6, execution: .5 }, 'Priorities exceed capacity'),
    o('Our best people are stuck on fires', { talent: 1.5, leverage: .6 }, 'Top people spend their time on rescue work'),
    o('People don\'t say what they think', { trust: 1.6, centralized: .3 }, 'Problems aren\'t raised openly'),
    o('Effort is high but results aren\'t', { economics: .9, focus: .6, execution: .5, talent: .3 }, 'Effort isn\'t converting to results'),
  ],
};

export const QUESTIONS = [
  // ----- Business -----
  { id: 'direction', lens: 'B', act: .8, eyebrow: 'Business · Do you know what matters?',
    title: 'If you asked your leadership team to name the three most important things the business needs to accomplish right now, how similar would their answers be?',
    options: [
      o('Almost identical', { direction: -1.6 }, 'Leadership names the same top three'),
      o('Mostly similar', { direction: -.4 }, 'Leadership mostly agrees on the top three'),
      o('Quite different', { direction: 1.1, economics: .2 }, 'Leaders name different top priorities'),
      o('Very different', { direction: 1.8, economics: .3, execution: .3 }, 'Leaders hold very different priorities'),
    ] },
  { id: 'focus', lens: 'B', act: .9, eyebrow: 'Business · Do you know what matters?',
    title: 'If you had to eliminate 20% of your current priorities tomorrow, would you know what to stop?',
    options: [
      o('Definitely', { focus: -1.6 }, 'Leadership could name what to stop'),
      o('Probably', { focus: -.4 }, 'Leadership could probably name what to stop'),
      o('Not really', { focus: 1.1, economics: .4 }, 'It\'s unclear what could be stopped'),
      o('No idea', { focus: 1.7, economics: .6 }, 'Nobody could say what to stop'),
    ] },
  { id: 'economics', lens: 'B', act: .8, eyebrow: 'Business · Do you know what matters?',
    title: 'How clearly can you connect your biggest priorities to the things that create value: customers, revenue, margin, cash?',
    options: [
      o('Very clearly', { economics: -1.6 }, 'Priorities trace to value drivers'),
      o('Mostly clearly', { economics: -.4 }, 'Priorities mostly trace to value drivers'),
      o('Somewhat', { economics: 1.0, focus: .3 }, 'The link from priorities to value is loose'),
      o('Not clearly', { economics: 1.7, focus: .4, direction: .3 }, 'Priorities aren\'t connected to what creates value'),
    ] },
  { id: 'business_uncertainty', lens: 'B', act: .7, gate: p => Math.max(p.direction, p.focus, p.economics) >= .45,
    eyebrow: 'Business · Following up', title: 'Where is the biggest uncertainty?',
    options: [
      o('What to prioritize', { focus: .9, direction: .3 }, 'The organization hasn\'t chosen what comes first'),
      o('Which customers matter most', { economics: 1.0 }, 'It\'s unclear which customers matter most'),
      o('Where to invest', { economics: .9, direction: .2 }, 'Investment isn\'t guided by economics'),
      o('What to stop', { focus: 1.2 }, 'Nothing is formally stopped'),
      o('How to grow', { direction: .9 }, 'The growth path isn\'t chosen'),
      o('Where profit comes from', { economics: 1.4 }, 'The economics of the business aren\'t explicit'),
    ] },
  // ----- System -----
  { id: 'decisions', lens: 'S', act: .9, eyebrow: 'System · Can the organization execute?',
    title: 'When an important decision gets stuck, what is usually the reason?',
    options: [
      o('Nobody clearly owns it', { decision_rights: 1.6, centralized: .3 }, 'Important decisions have no clear owner'),
      o('Too many people need to agree', { decision_rights: 1.2, centralized: .6 }, 'Decisions require broad agreement'),
      o('We don\'t have enough information', { information: 1.5, economics: .3 }, 'Decisions wait on information'),
      o('Leaders disagree', { direction: 1.3, decision_rights: .3 }, 'Leadership disagreement stalls decisions'),
      o('People don\'t feel authorized to decide', { centralized: 1.4, decision_rights: .6 }, 'People don\'t feel authorized to decide'),
      o('We keep revisiting the decision', { direction: .6, trust: .5, decision_rights: .4 }, 'Decisions get reopened'),
      o('Decisions don\'t really get stuck', { decision_rights: -1.3, centralized: -1.0, information: -1.0 }, 'Decisions don\'t stall'),
    ] },
  { id: 'comeback', lens: 'S', act: 1.0, gate: p => Math.max(p.centralized, p.decision_rights, p.information, p.capability) >= .45,
    eyebrow: 'System · Following up', title: 'What usually causes decisions to come back up to senior leadership?',
    options: [
      o('No clear owner', { decision_rights: 1.5, centralized: -.2 }, 'Decisions escalate because ownership is unclear'),
      o('Not enough information', { information: 1.6, capability: -.2 }, 'Decisions escalate for lack of information'),
      o('Lack of confidence in the person', { capability: 1.5, centralized: .4 }, 'Leaders lack confidence in the decider'),
      o('High consequence of getting it wrong', { centralized: 1.2, decision_rights: .3 }, 'High-stakes decisions are held at the top'),
      o('We simply prefer to decide centrally', { centralized: 1.8, capability: -.4, decision_rights: -.3 }, 'Leadership prefers to decide centrally'),
      o('They don\'t come back up', { centralized: -1.4, decision_rights: -.8, information: -.6, capability: -.6 }, 'Decisions stay where they were made'),
    ] },
  { id: 'overrule', lens: 'P', act: .9, gate: p => Math.max(p.centralized, p.capability) >= .45,
    eyebrow: 'People · Following up', title: 'When a manager makes a call you would have made differently, what usually happens?',
    options: [
      o('It stands', { centralized: -1.4, capability: -.4 }, 'Managers\' decisions stand'),
      o('We talk it through afterwards', { centralized: -.8, capability: .2 }, 'Decisions are debriefed, not reversed'),
      o('It gets reversed', { centralized: 1.5, trust: .4 }, 'Managers\' decisions get reversed'),
      o('They check first, so it rarely happens', { centralized: 1.2, decision_rights: .5 }, 'Managers check before deciding'),
      o('They aren\'t making those calls', { centralized: .9, capability: .9 }, 'Managers aren\'t making those calls'),
    ] },
  { id: 'given', lens: 'P', act: .9, gate: p => Math.max(p.capability, p.information, p.centralized) >= .45,
    eyebrow: 'People · Following up', title: 'When someone is given a decision to make, what happens most often?',
    options: [
      o('They make it well', { capability: -1.5, information: -.5 }, 'People decide well when given the decision'),
      o('They make it, but slowly', { information: 1.2, capability: .2 }, 'People decide slowly when given the decision'),
      o('They make it, but it needs rework', { capability: 1.5, information: .3 }, 'Delegated decisions need rework'),
      o('They hand it back', { centralized: .9, capability: .7, trust: .3 }, 'People hand decisions back up'),
      o('They wait for a steer', { direction: .7, centralized: .8, capability: .3 }, 'People wait for direction before deciding'),
    ] },
  { id: 'waiting', lens: 'S', act: .9, gate: p => Math.max(p.information, p.decision_rights, p.direction) >= .45,
    eyebrow: 'System · Following up', title: 'When a decision waits, what is it usually waiting for?',
    options: [
      o('A person', { centralized: 1.3, decision_rights: .3 }, 'Decisions wait on a person'),
      o('A meeting', { decision_rights: 1.2, execution: .3 }, 'Decisions wait for a meeting'),
      o('Data or analysis', { information: 1.6 }, 'Decisions wait on analysis'),
      o('Agreement between leaders', { direction: 1.4, trust: .2 }, 'Decisions wait on leadership agreement'),
      o('They don\'t wait', { decision_rights: -1.0, information: -1.0, centralized: -.8 }, 'Decisions don\'t wait'),
    ] },
  { id: 'execution', lens: 'S', act: .8, eyebrow: 'System · Can the organization execute?',
    title: 'When your organization agrees that something is important, how reliably does it actually happen?',
    options: [
      o('Almost always', { execution: -1.6, focus: -.3 }, 'Agreed priorities get delivered'),
      o('Usually', { execution: -.4 }, 'Agreed priorities usually get delivered'),
      o('Sometimes', { execution: 1.1, focus: .3 }, 'Agreed priorities sometimes slip'),
      o('Rarely', { execution: 1.8, focus: .4, leverage: .2 }, 'Agreed priorities rarely get delivered'),
    ] },
  { id: 'execution_why', lens: 'S', act: .9, gate: p => p.execution >= .45, multi: true, max: 2,
    eyebrow: 'System · Following up', title: 'When it doesn\'t happen, what usually gets in the way?', help: 'Pick up to two.',
    options: [
      o('Too many competing priorities', { focus: 1.2, execution: .2 }, 'Commitments compete for the same capacity'),
      o('No clear owner', { decision_rights: 1.2, execution: .2 }, 'Work has no single owner'),
      o('Lack of capacity', { focus: .8, talent: .3 }, 'Capacity is committed past what exists'),
      o('Lack of capability', { capability: 1.2 }, 'The people asked to deliver lack the skills or support'),
      o('Poor process', { leverage: 1.2 }, 'The process doesn\'t carry the work'),
      o('Leadership changes direction', { direction: 1.2, execution: .2 }, 'Direction changes before delivery'),
      o('Dependencies between teams', { leverage: .6, decision_rights: .6 }, 'Work stalls at handoffs'),
      o('Follow-through', { execution: .8, trust: .3 }, 'Commitments lapse without consequence'),
    ] },
  { id: 'leverage', lens: 'S', act: .8, eyebrow: 'System · Can the organization execute?',
    title: 'How much of your organization\'s performance depends on people working around the system or personally "making it happen"?',
    options: [
      o('Very little', { leverage: -1.6 }, 'Systems carry the work'),
      o('Some', { leverage: -.2 }, 'Some reliance on individuals'),
      o('A lot', { leverage: 1.2, talent: .4 }, 'Performance depends on workarounds'),
      o('Almost everything depends on it', { leverage: 1.9, talent: .5, centralized: .2 }, 'Performance depends almost entirely on heroics'),
    ] },
  { id: 'repeat', lens: 'S', act: .7, gate: p => Math.max(p.leverage, p.execution) >= .45,
    eyebrow: 'System · Following up', title: 'When something works, can the organization repeat it?',
    options: [
      o('Usually', { leverage: -1.2 }, 'Successes are repeatable'),
      o('Sometimes', { leverage: .2 }, 'Successes are sometimes repeatable'),
      o('Rarely', { leverage: 1.0, execution: .3 }, 'Successes are rarely repeated'),
      o('It depends on the person', { leverage: 1.3, talent: .5 }, 'Repeatability depends on the person'),
      o('We tend to reinvent it', { leverage: 1.0, information: .4 }, 'Successes get reinvented'),
    ] },
  // ----- People -----
  { id: 'authority', lens: 'P', act: .8, eyebrow: 'People · Can people act on it?',
    title: 'Do people generally have enough authority to make the decisions they are accountable for?',
    options: [
      o('Almost always', { centralized: -1.5, decision_rights: -.5 }, 'Authority matches accountability'),
      o('Usually', { centralized: -.4 }, 'Authority mostly matches accountability'),
      o('Sometimes', { centralized: 1.0, decision_rights: .5 }, 'Authority often falls short of accountability'),
      o('Rarely', { centralized: 1.7, decision_rights: .6 }, 'People lack the authority they\'re accountable for'),
    ] },
  { id: 'talent', lens: 'P', act: .8, eyebrow: 'People · Can people act on it?',
    title: 'Are your best people spending most of their time on the highest-value problems, rather than the most urgent ones?',
    options: [
      o('Almost always', { talent: -1.6 }, 'Best people are on the highest-value problems'),
      o('Usually', { talent: -.4 }, 'Best people are mostly on high-value problems'),
      o('Sometimes', { talent: 1.0, leverage: .3 }, 'Best people are often on urgent, low-value work'),
      o('Rarely', { talent: 1.7, leverage: .4 }, 'Best people are consumed by urgent work'),
      o('I\'m not sure', { talent: .6, information: .3 }, 'Where top talent\'s time goes isn\'t known'),
    ] },
  { id: 'trust', lens: 'P', act: .8, eyebrow: 'People · Can people act on it?',
    title: 'When someone sees a problem or disagrees with a decision, how safe is it to say so directly?',
    options: [
      o('Very safe', { trust: -1.7 }, 'Problems are raised openly'),
      o('Usually safe', { trust: -.5 }, 'Problems are usually raised openly'),
      o('Depends on the situation', { trust: .8, centralized: .2 }, 'Raising problems depends on the situation'),
      o('Usually difficult', { trust: 1.4, centralized: .3 }, 'Raising problems is difficult'),
      o('Very difficult', { trust: 1.9, centralized: .4 }, 'It isn\'t safe to raise problems'),
    ] },
  { id: 'people_limits', lens: 'P', act: .8, gate: p => Math.max(p.centralized, p.capability, p.trust, p.talent) >= .45,
    eyebrow: 'People · Following up', title: 'What most limits people\'s ability to act?',
    options: [
      o('Lack of clarity', { direction: 1.0, focus: .3 }, 'People aren\'t sure what matters most'),
      o('Lack of authority', { centralized: 1.2, decision_rights: .4 }, 'People lack the authority to act'),
      o('Lack of capability', { capability: 1.4 }, 'People lack the skills or support'),
      o('Lack of information', { information: 1.3 }, 'People lack the information to act'),
      o('Fear of mistakes', { trust: 1.3, centralized: .3 }, 'Mistakes are costly, so people don\'t act'),
      o('Conflicting incentives', { economics: .9, talent: .3 }, 'Incentives point elsewhere'),
      o('Leadership behavior', { trust: .9, centralized: .8 }, 'Leaders intervene before teams can act'),
    ] },
];

export const INVERSION = {
  id: 'inversion', lens: null, act: .5, multi: true, max: 2, terminal: true,
  intro: { kicker: 'One more, and it\'s a strange one.', line: 'Invert the problem. What would make it worse is usually what is quietly keeping it alive.' },
  eyebrow: 'Inversion', title: 'If you wanted this problem to get significantly worse, what would you do?', help: 'Pick up to two. Be honest about which ones are already happening.',
  options: [
    o('Add more priorities', { focus: .6 }, 'New priorities are added faster than old ones are retired', { force: 'New priorities are added faster than old ones are retired.' }),
    o('Centralize more decisions', { centralized: .6 }, 'Decisions drift upward when things feel risky', { force: 'Decisions drift upward whenever things feel risky.' }),
    o('Add another approval layer', { decision_rights: .5, centralized: .3 }, 'Control is added after problems', { force: 'Control is added in response to problems, and each layer slows the next decision.' }),
    o('Avoid the difficult conversation', { trust: .6, direction: .2 }, 'The difficult conversation is avoided', { force: 'The difficult conversation is being avoided, so the cause stays unnamed.' }),
    o('Keep measuring activity instead of outcomes', { economics: .6 }, 'Activity is measured instead of outcomes', { force: 'Activity is measured and rewarded, so activity is what grows.' }),
    o('Continue rewarding the current behavior', { economics: .3, trust: .2, talent: .2 }, 'Current incentives reward the friction', { force: 'Current incentives reward the behaviour that produces the friction.' }),
    o('Keep solving the symptom', { leverage: .6 }, 'Recurrences are solved as new events', { force: 'Each recurrence is solved as a new event rather than traced to its cause.' }),
    o('Do nothing', {}, 'Nothing forces anyone to act', { force: 'Nothing about the current pattern requires anyone to act, so it persists.' }),
  ],
};
export const ALL_QUESTIONS = [OPENER, ...QUESTIONS, INVERSION];

// The actor's budget: at least this many questions, at most this many, and stop early when the lead is clear.
export const ACTOR = { minQuestions: 8, maxQuestions: 12, stopConfidence: .82, stopMargin: .2 };

export const COST = {
  id: 'cost', eyebrow: 'Optional · Make it tangible',
  title: 'Roughly how much management time does this friction consume?',
  help: 'A rough guess is fine. This produces an illustrative estimate, not an audit. Skip it if you prefer.',
  fields: [
    { key: 'managers', label: 'Managers who deal with it each week', placeholder: 'e.g. 8', min: 0, max: 10000 },
    { key: 'hours', label: 'Hours per manager per week', placeholder: 'e.g. 4', min: 0, max: 80 },
    { key: 'rate', label: 'Loaded cost per hour (optional)', placeholder: 'e.g. 175', min: 0, max: 100000, optional: true },
  ],
  ranges: [
    { key: 'revenue', label: 'Revenue (optional)', options: ['Prefer not to say', 'Under $1M', '$1–5M', '$5–10M', '$10–25M', '$25M+'] },
    { key: 'profit', label: 'Profitability (optional)', options: ['Prefer not to say', 'Loss-making', 'Break-even', '1–5%', '5–10%', '10–20%', '20%+'] },
  ],
};

export const STAGES = [
  { code: '01', name: 'Signal' }, { code: '02', name: 'Business' }, { code: '03', name: 'System' }, { code: '04', name: 'People' }, { code: '05', name: 'Inversion' }, { code: '06', name: 'Diagnosis' },
];
export const ZONES = {
  BS: { key: 'BS', a: 'B', b: 'S', name: 'Business ↔ System', label: 'Strategy–Execution Friction',
        summary: 'You seem to know what matters, but the organization isn\'t set up to make it happen.',
        detail: 'Direction exists and it is reasonably shared. The processes, decision rights and operating rhythm underneath it were built for something else, and they keep producing the old result. Leadership tends to read this as an execution problem. It is usually a design problem: the machine and the strategy were never reconciled.' },
  SP: { key: 'SP', a: 'S', b: 'P', name: 'System ↔ People', label: 'Enablement Friction',
        summary: 'Your people appear to have the capability and intent to perform, but the system around them is creating unnecessary dependency, escalation or rework.',
        detail: 'The organization has processes, and they are not enabling the people inside them. Decisions travel upward, work waits for permission, and capable people spend their judgment navigating the system instead of the problem. Results still arrive, because people make them arrive, which is why the gap stays invisible.' },
  PB: { key: 'PB', a: 'P', b: 'B', name: 'People ↔ Business', label: 'Alignment Friction',
        summary: 'People are working hard, but their effort isn\'t translating into business value.',
        detail: 'Effort is high and diffuse. What matters most hasn\'t reached people clearly enough to act on, or the incentives point somewhere else, or the best people are spent on the wrong problems. The organization is busy in ways the business doesn\'t need.' },
  BSP: { key: 'BSP', a: 'B', b: 'S', c: 'P', name: 'Business ↔ System ↔ People', label: 'Coherence Friction',
        summary: 'The three parts each look reasonable on their own, but together they are producing conflicting behaviour.',
        detail: 'No single lens is failing badly, and no single fix will move the result, because the friction is in how the parts interact. Strategy, operating system and people practices were each designed sensibly and separately. The work is to make them agree, starting with the constraint below.' },
};

// Mechanism playbooks. Everything the diagnosis says about the constraint comes from here.
// Structure follows diagnosis → guiding policy → coherent action.
// The zone summary, tailored to which constraint fired inside it. Falls back to ZONES[zone].summary.
export const ZONE_BY_CONSTRAINT = {
  BS: {
    direction: 'Leadership hasn\'t settled what matters most, so the organization is executing several answers at once and experiencing it as slowness.',
    focus: 'The business keeps committing to more than the system has capacity to deliver, and nothing is formally stopped to make room.',
    economics: 'Priorities aren\'t tied to what creates value, so the system executes hard against a scoreboard that doesn\'t decide anything.',
    decision_rights: 'You know what you want. Decisions about how to get there have no clear owner, so the machine waits.',
    execution: 'You know what matters. Commitments don\'t reliably turn into work, because they are made without the capacity or ownership to deliver them.',
    leverage: 'You know what matters. The system doesn\'t carry it, so people carry it by hand, and that works until it doesn\'t.',
  },
  SP: {
    decision_rights: 'Capable people are waiting on decisions that have no clear owner, and escalation has become the way work gets done.',
    execution: 'People are willing, but agreed work slips because the system doesn\'t give it an owner, capacity or follow-through.',
    leverage: 'Your people appear capable and willing. The system around them doesn\'t carry the work, so they are compensating for it by hand.',
    centralized: 'People are accountable for outcomes without the authority to make the decisions those outcomes require, so they check before acting.',
    talent: 'The system pulls your most capable people into rescue work, so the problems that need them most get whoever is free.',
    trust: 'The system runs on filtered information, because raising a problem or disagreeing carries a cost. Everything else is downstream of that.',
  },
  PB: {
    centralized: 'People are working hard, but the authority to act on what matters hasn\'t reached them, so effort turns into escalation.',
    talent: 'People are working hard. Your best people are on the wrong problems, so the effort isn\'t landing where the business needs it.',
    trust: 'People are working hard and saying little. What the business needs to hear isn\'t reaching it, because it isn\'t safe to say.',
    direction: 'People are working hard toward different versions of what matters, because leadership holds different versions too.',
    focus: 'People are working hard across more priorities than the business can actually use, and nobody has been told what to stop.',
    economics: 'People are working hard on priorities chosen by advocacy rather than value, so effort isn\'t translating into results.',
  },
};

export const PLAYBOOKS = {
  direction: {
    reading: [
      bk('lencioni', 'Lencioni calls it artificial harmony: a leadership team that nods in the meeting and acts on its own interpretation afterwards. Real commitment only follows real disagreement. If your leaders\' top-three lists differ, the argument that would have produced one list has not been had yet, and the organization below can tell.'),
      bk('collins', 'The hedgehog concept: the great companies knew the one thing they could be best at, what drove their economic engine, and what they cared about, and they said no to everything outside it. Several versions of "what matters" is what an organization looks like before it has chosen its hedgehog.'),
    ],
    constraint: 'Leadership isn\'t aligned on what matters most',
    diagnosis: 'Your leadership team appears to hold different versions of what the business must accomplish. Each version is defensible, which is why it persists. The organization below is executing several strategies at once and experiencing it as slowness.',
    chain: ['Leaders hold different top priorities', 'Each function optimises its own version', 'Teams receive conflicting signals', 'Work is duplicated or cancelled mid-flight', 'Decisions get revisited', 'Effort rises, progress doesn\'t'],
    forces: ['Priorities are set function by function rather than for the business as a whole.', 'The disagreement at the top has never been surfaced directly, so it is settled quietly in every meeting below.', 'Every initiative is described as strategic, so none of them is.', 'Measures reward functional performance over business outcomes.'],
    consequences: ['Slower decisions', 'Duplicated work', 'Lost management capacity'],
    leverage: ['Strategy', 'Capital allocation', 'Customers'],
    blind: 'Your leadership team may have learned to treat polite agreement as alignment.',
    notDo: { t: 'Don\'t fix this with a communication plan.', d: 'The problem isn\'t that the strategy hasn\'t been communicated. It\'s that it hasn\'t been chosen. Communicating three versions more clearly produces three clearer versions.' },
    policy: 'Choose fewer things, out loud, together.',
    move: { t: 'Run the three-things exercise.', steps: ['Ask each leader to write, alone, the three most important things the business must accomplish this year, and why.', 'Put the lists on one wall in one room. Expect them to differ. The differences are the diagnosis.', 'Don\'t leave until there is one list. Publish it, and retire anything from the old lists that didn\'t survive.'] },
    question: 'If our leadership team\'s top-three lists differ, whose list is the organization actually executing?',
    metric: { t: 'Distinct "top priorities" named across the leadership team', d: 'Ask each leader separately, once a quarter. The target is one list.' },
  },
  focus: {
    reading: [
      bk('collins', 'Collins found that the good-to-great companies kept a "stop doing" list and treated it as seriously as their to-do list. Discipline was defined less by what they started than by what they refused to continue. Your 20% cut is a stop-doing list with a deadline.'),
      bk('drucker', 'Drucker\'s test for any activity: if we were not already doing this, would we start it now? If not, stop it. He argued that the systematic abandonment of yesterday is what frees the resources for tomorrow, and that most organizations never build the habit.'),
    ],
    constraint: 'Too many priorities, and no clear sense of what to stop',
    diagnosis: 'Priorities accumulate and nothing is formally retired. Capacity is spread across more work than exists to do it, so everything moves slowly and the urgent displaces the important. The missing decision is not what to start. It is what to stop.',
    chain: ['Priorities are added, none are removed', 'Capacity is spread thin', 'Everything moves slowly', 'Urgent work displaces important work', 'More initiatives are added to compensate', 'Overload becomes the operating model'],
    forces: ['Stopping something feels like failure, so nothing is formally stopped.', 'Every function protects its own initiatives, so the total never shrinks.', 'Capacity is assumed rather than counted when commitments are made.', 'The reward for starting things is visible; the reward for finishing them is not.'],
    consequences: ['Delayed delivery on what matters', 'Employee frustration', 'Growth constraints'],
    leverage: ['Strategy', 'Customers', 'Capability building'],
    blind: 'Your organization may have normalised overload as a sign of ambition.',
    notDo: { t: 'Don\'t add a prioritisation framework.', d: 'Scoring forty initiatives produces a ranked list of forty initiatives. The missing decision is what to stop, and frameworks are how organizations avoid making it.' },
    policy: 'Treat stopping as a decision with the same weight as starting.',
    move: { t: 'Cut 20% this month.', steps: ['List every active priority, everywhere. Expect the list to be longer than anyone thought.', 'Rank by contribution to the one thing that matters most this year. Stop the bottom fifth, explicitly, with a note saying what is no longer expected.', 'Watch for a month what actually gets worse. Usually less than feared, and that is the lesson.'] },
    question: 'What are we willing to stop doing to make room for what matters most?',
    metric: { t: 'Share of capacity on the top three priorities', d: 'Estimate it monthly from where people\'s time actually went, not from the plan.' },
  },
  economics: {
    reading: [
      bk('charan', 'Every business, however complex, runs on a small nucleus: customers, cash, margin, velocity and growth. Charan\'s argument is that anyone at any level can learn to see it, and that once people can trace their work to the nucleus, priorities stop being a matter of advocacy. Your one-line exercise is exactly that trace.'),
      bk('davenport', 'Organizations that have analytics and organizations that compete on it are separated not by data but by choice: the ones that win pick a small number of decisions to be distinctively good at and aim the measurement there. Measuring everything is the sign that nothing has been chosen.'),
    ],
    constraint: 'Priorities aren\'t clearly connected to how the business creates value',
    diagnosis: 'The economics of the business aren\'t explicit enough to test priorities against. So priorities are chosen by advocacy, resources follow the strongest case, and activity rises without margin following. Analysis multiplies to explain it.',
    chain: ['Value drivers aren\'t explicit', 'Priorities are chosen by advocacy, not economics', 'Resources flow to the loudest case', 'Activity rises, value doesn\'t', 'More analysis is produced to explain it', 'Confidence in the plan erodes'],
    forces: ['Few people outside finance can say where the profit actually comes from.', 'Measures track activity and effort rather than value created.', 'Investment cases are argued on strategy language, not on customers, margin or cash.', 'Costs are reviewed line by line; value is never reviewed at all.'],
    consequences: ['Lower margin', 'Higher cost', 'Slower decisions'],
    leverage: ['Capital allocation', 'Customers', 'Strategy'],
    blind: 'The organization may be optimising for functional performance while sacrificing overall business value.',
    notDo: { t: 'Don\'t fix this with more reporting.', d: 'More metrics on activity won\'t reveal which activities create value. Start from the economics and work back to the measures, not the other way round.' },
    policy: 'Make the economics of every priority explicit.',
    move: { t: 'Trace each top priority to a value driver.', steps: ['Take your top five priorities. For each, write one line: which of customers, revenue growth, margin, cash or velocity it moves, by roughly how much, by when.', 'Anything you can\'t write a line for is a candidate to stop or to redesign.', 'Share the five lines with the people delivering them. Most have never seen the connection.'] },
    question: 'Which activities consume the most resources without creating proportional value?',
    metric: { t: 'Share of resources on priorities with a named value driver', d: 'Count it once. Then count it again next quarter.' },
  },
  decision_rights: {
    reading: [
      bk('grove', 'Grove\'s rule is that a decision should be made at the lowest level where the right knowledge exists, and that escalation beyond that point is a cost with no output. He treated a decision as a process with a named owner, defined inputs and a deadline, which is precisely what the five-decision exercise writes down.'),
      bk('google', 'Decision velocity was treated at Google as a competitive advantage in its own right. The authors describe giving smart people context and then letting them decide, on the grounds that a good decision made quickly and corrected beats a perfect one made late. Stuck decisions are the opposite of that design.'),
    ],
    constraint: 'Decisions get stuck',
    diagnosis: 'Important decisions don\'t have a clear owner, so they wait. They travel upward, management becomes the bottleneck, and leaders spend their time on decisions that should have been made two levels down. The organization reads this as caution. It is the absence of decision rights.',
    chain: ['Decision rights are unclear', 'People escalate to be safe', 'Management becomes a bottleneck', 'Execution slows', 'Leaders spend more time firefighting', 'Less capacity for strategic work'],
    forces: ['Decision authority is unclear, so escalation is the rational choice.', 'Leaders intervene before teams have a chance to solve problems.', 'People are accountable for outcomes without equivalent authority.', 'Existing processes quietly reward escalation over judgment.'],
    consequences: ['Slower decisions', 'Management capacity', 'Delayed revenue'],
    leverage: ['Strategy', 'Talent', 'Customers'],
    blind: 'Your organization may have normalised management intervention as part of how work gets done.',
    notDo: { t: 'Don\'t fix this by adding another approval layer.', d: 'Your answers suggest the problem is not insufficient control. It is unclear decision ownership. Adding governance would increase the friction.' },
    policy: 'Move decisions to the lowest competent level, explicitly.',
    move: { t: 'Fix the five decisions that escalate most.', steps: ['Identify the five decisions that most frequently reach senior leadership.', 'For each one write down: who recommends, who decides, who must be consulted, what information is required, what guardrails apply, and when it is reviewed.', 'Move each decision to the lowest competent level, and tell the people who used to make it that they no longer do.'] },
    question: 'Which decisions are we still making at the top because we don\'t trust the organization to make them, and what would need to be true to move them down?',
    metric: { t: 'Median time from issue raised to decision made', d: 'Track it for the five decisions you moved. It should fall within a quarter.' },
  },
  execution: {
    reading: [
      bk('charan', 'Charan\'s work on execution rests on one link: strategy connected to the people who will deliver it, with named accountability and a follow-through rhythm. A commitment without an owner, a date and the capacity to do it is, in his terms, not a commitment. It is a hope with a meeting attached.'),
      bk('grove', 'Grove measured a manager by the output of the organization under them, not by the activity in it. Agreeing that something is important is activity. Protecting the capacity that makes it happen is output. The three-commitments move is a deliberate shift from the first to the second.'),
    ],
    constraint: 'Agreed priorities don\'t reliably happen',
    diagnosis: 'The organization agrees that things are important and then they don\'t happen. Commitments are made without a capacity check, they collide with everything else that was also agreed, ownership blurs, and leaders re-plan. Over time, commitment stops meaning much.',
    chain: ['Commitments are made without a capacity check', 'They collide with competing priorities', 'Ownership blurs', 'Follow-through slips', 'Leaders re-plan', 'Commitment loses its meaning'],
    forces: ['Agreement in the room is mistaken for commitment outside it.', 'Nothing is removed when something is added, so the new commitment competes with the old ones.', 'Owners are named for initiatives but not given the capacity to deliver them.', 'Slippage carries no consequence, so it is the path of least resistance.'],
    consequences: ['Delayed revenue', 'Lost time', 'Employee frustration'],
    leverage: ['Customers', 'Innovation', 'Strategy'],
    blind: 'Your organization may have learned that commitments are aspirations.',
    notDo: { t: 'Don\'t fix this with a tighter tracking cadence.', d: 'Tracking makes slippage visible. It doesn\'t remove what causes it. If the cause is competing priorities, a better dashboard shows them competing in higher resolution.' },
    policy: 'Commit to less, with a named owner and protected capacity.',
    move: { t: 'Protect three commitments this quarter.', steps: ['Pick the three commitments that matter most this quarter. Only three.', 'Give each one owner, a date, and the capacity it needs, written down and subtracted from something else.', 'Declare everything else "not this quarter", in public, so the three are actually protected.'] },
    question: 'What did we commit to last quarter that didn\'t happen, and what did we do about it?',
    metric: { t: 'Share of priority initiatives completed as committed', d: 'Count it per quarter. The number matters less than whether it moves.' },
  },
  leverage: {
    reading: [
      bk('grove', 'Leverage, in Grove\'s sense, is output that does not depend on one person being present. Heroics are its opposite: high output that vanishes with the hero. He argued that a manager\'s highest-value work is building the systems and indicators that let many people produce the result, rather than producing it personally.'),
      bk('meadows', 'Meadows named the pattern "shifting the burden": a symptomatic fix, such as a capable person absorbing the problem by hand, relieves the pressure that would otherwise force the real fix. Each rescue makes the system a little more dependent on the rescuer. Designing out the workaround is the direct intervention she recommends.'),
    ],
    constraint: 'Performance depends on people working around the system',
    diagnosis: 'The system doesn\'t carry the work, so capable people carry it personally. Results still arrive, which is why the gap is invisible, and the heroics get rewarded, which is why it persists. This works at the current size and breaks at the next one.',
    chain: ['The process doesn\'t carry the work', 'Capable people fill the gap by hand', 'Results still arrive, so the gap stays hidden', 'Heroics become the norm and get rewarded', 'The system never gets fixed', 'Growth multiplies the workarounds'],
    forces: ['The people who make it happen are the most valued, so the workaround is the career path.', 'Fixing the process is nobody\'s job; using it is everyone\'s.', 'Each recurrence is solved as a new event rather than traced to the step that produced it.', 'Growth adds volume to a process that already needs manual rescue.'],
    consequences: ['Growth constraints', 'Higher cost', 'Employee frustration'],
    leverage: ['Capability building', 'Innovation', 'Customers'],
    blind: 'Your team may have learned to work around the system rather than improve it.',
    notDo: { t: 'Don\'t fix this by hiring more of the people who make it happen.', d: 'Heroics that work at this size won\'t at the next. You would be scaling the workaround, and paying for it twice.' },
    policy: 'Build the workaround into the system so it survives the person.',
    move: { t: 'Design out the biggest workaround.', steps: ['Ask your three most relied-upon people what they do by hand that the process should do. Write the list down; it will be longer than expected.', 'Pick the one that consumes the most time across the organization.', 'Design it into the process, remove the manual step, and give the people who used to do it credit for surfacing it.'] },
    question: 'Where are exceptional people compensating for a system that should work without heroics?',
    metric: { t: 'Hours per week spent on recurring workarounds', d: 'Ask the same three people to estimate it monthly. It should fall as each workaround is designed out.' },
  },
  centralized: {
    reading: [
      bk('google', 'The authors\' central idea is context, not control: give talented people the goal, the constraints and the reasoning, then get out of the way. They observed that most organizations say they do this and then require approval anyway. Authority that has not been written down and honoured is not authority.'),
      bk('peters', 'Peters and Waterman found excellent companies were "loose-tight": tight on a few non-negotiable values, loose on how people achieved them. Autonomy inside clear guardrails produced both speed and discipline. Clarifying one decision right per team, with its guardrails, is that structure in miniature.'),
    ],
    constraint: 'Decision authority is more centralized than the business requires',
    diagnosis: 'Accountability has been assigned without matching authority. So people check before acting, decisions queue upward, and speed drops. Leaders see the hesitancy and hold tighter, which shrinks the authority further. The loop is stable and it is getting worse.',
    chain: ['Accountability is assigned without authority', 'People check before acting', 'Decisions queue upward', 'Speed drops and escalation rises', 'Leaders see hesitancy and hold tighter', 'Authority shrinks further'],
    forces: ['Authority was never written down, so it defaults to whoever is most senior.', 'Leaders overrule decisions after they are made, which teaches people not to make them.', 'Being wrong is more costly than being slow, so slow is the rational choice.', 'Escalation is treated as diligence rather than as a cost.'],
    consequences: ['Slower decisions', 'Management capacity', 'Employee frustration'],
    leverage: ['Talent', 'Customers', 'Strategy'],
    blind: 'The organization may have normalised escalation as diligence.',
    notDo: { t: 'Don\'t fix this with an empowerment programme.', d: 'People don\'t need to be told they are empowered. They need one decision they are allowed to make, in writing, and a leader who doesn\'t overrule it.' },
    policy: 'Match authority to accountability, one decision at a time.',
    move: { t: 'Clarify one decision right per team.', steps: ['Ask each team which decision they most often wait on. Take the first answer.', 'Write down that they now own it, the guardrails that apply, and who they inform afterwards.', 'Tell the people who used to approve it that they no longer do. This is the step organizations skip.'] },
    question: 'Where are we holding people accountable for outcomes without giving them enough authority to achieve them?',
    metric: { t: 'Share of key decisions made without escalation', d: 'Sample the decisions you moved. If they are coming back up, find out why before adding any control.' },
  },
  talent: {
    reading: [
      bk('collins', 'First who, then what. Collins found the great companies put their best people on their biggest opportunities, not their biggest problems. The reverse, spending the best people on rescue, is the pattern your answers describe, and it quietly caps the organization at the size its heroes can carry.'),
      bk('coach', 'Bill Campbell\'s measure of a leader was whether the people around them got better. That requires putting them on work where they can grow and matter. A leader who uses the best people as an emergency service is spending them, not developing them, and Campbell would have said so directly.'),
    ],
    constraint: 'Your best people aren\'t on the highest-value problems',
    diagnosis: 'Your most capable people have become the default fix for everything. Their time fills with urgent, low-leverage work, and the highest-value problems get whoever is free. Results plateau, the best people are stretched thinner, and eventually they leave or disengage.',
    chain: ['The best people become the default fix', 'Their time fills with urgent, low-leverage work', 'The highest-value problems get whoever is free', 'Results plateau', 'The best people are stretched thinner', 'They disengage or leave'],
    forces: ['Whoever is most capable gets pulled into every fire, because it works.', 'Nobody allocates the best people\'s time deliberately; it is taken by whoever asks first.', 'Doing the urgent thing is visible and rewarded; protecting the important thing is not.', 'The organization has no view of where its scarcest resource actually goes.'],
    consequences: ['Innovation capacity', 'Growth constraints', 'Talent risk'],
    leverage: ['Innovation', 'Strategy', 'Capability building'],
    blind: 'Your organization may have normalised using its best people as the emergency service.',
    notDo: { t: 'Don\'t fix this by hiring more senior people.', d: 'You are not short of talent. You are spending the talent you have on the wrong problems, and new talent would be spent the same way.' },
    policy: 'Allocate your best people\'s time as deliberately as capital.',
    move: { t: 'Audit one week of your five best people.', steps: ['For your five most capable people, list honestly where their time went last week.', 'Find each one\'s largest block of low-value work. Move it to someone else or stop it.', 'Put the freed time on the one problem that matters most, and protect it for a quarter.'] },
    question: 'If our best people\'s calendars are the real strategy, what strategy are we executing?',
    metric: { t: 'Share of top talent time on the top three priorities', d: 'Estimate it monthly from calendars, not from intentions.' },
  },
  trust: {
    reading: [
      bk('coach', 'Campbell built teams on trust and candour: people said the hard thing because they believed it would be used to help, not to judge. His method was to listen fully, then respond with a question, and the effect was that problems reached him early. Your changed meeting is an attempt to create that condition on purpose.'),
      bk('lencioni', 'Trust is the base of Lencioni\'s pyramid. Without it there is no productive conflict, without conflict no commitment, and without commitment no accountability. If it isn\'t safe to raise a problem, every layer above trust is compromised, which is why this friction hides all the others.'),
    ],
    constraint: 'It isn\'t safe to raise problems or disagree',
    diagnosis: 'Raising a problem carries risk, so problems surface late and decisions rest on filtered information. Bad decisions persist longer than they should, trust in leadership erodes, and even less gets said. This is the friction that hides all the others.',
    chain: ['Raising problems carries risk', 'Problems surface late or not at all', 'Decisions rest on filtered information', 'Bad decisions persist longer', 'Trust in leadership drops', 'Even less gets said'],
    forces: ['The last person who raised a hard truth paid for it, and everyone remembers.', 'Leaders respond to bad news with a reaction rather than a question.', 'Disagreement is read as disloyalty rather than as data.', 'Meetings are for status, so there is no place where problems are supposed to appear.'],
    consequences: ['Slower decisions', 'Customer experience', 'Innovation capacity'],
    leverage: ['Talent', 'Innovation', 'Customers'],
    blind: 'The organization may have learned that silence is loyalty.',
    notDo: { t: 'Don\'t fix this with an anonymous survey or a values poster.', d: 'Safety is created in the moment a leader responds to bad news, and destroyed the same way. Everything else is theatre.' },
    policy: 'Reward the messenger, visibly, every time.',
    move: { t: 'Change one meeting.', steps: ['In your main leadership meeting, open with "what\'s not working?" before any status. The most senior person speaks last.', 'Thank the first person who names a real problem, in front of everyone, and act on it within the week.', 'Repeat every week. It takes about a quarter before people believe it.'] },
    question: 'What is the problem everyone knows about that hasn\'t been said in a leadership meeting?',
    metric: { t: 'Time between a problem being noticed and being raised with someone who can act', d: 'Ask about the last three problems. Then ask again next quarter.' },
  },
  information: {
    reading: [
      bk('grove', 'Grove\'s indicators were chosen so that a manager could act on them the same day. Information that arrives late, or in a form nobody can decide from, is not information in his sense. It is reporting. The test is whether the person deciding could name the two facts they would need, and whether those two facts reach them in time.'),
      bk('davenport', 'Organizations that compete on analytics chose a small number of decisions to be distinctively good at and built the flow of information around those. When decisions wait on data, the fix is rarely more data. It is deciding which decisions deserve a designed information path.'),
    ],
    constraint: 'The information needed to decide isn\'t reaching the people who decide',
    diagnosis: 'Decisions are waiting on facts that exist somewhere in the organization but don\'t arrive where the decision is made, or arrive too late, or in a form nobody can act on. People are not indecisive. They are deciding blind, so they wait, escalate, or ask for one more analysis.',
    chain: ['The facts a decision needs sit somewhere else', 'The person deciding asks for more analysis', 'The decision waits', 'Someone senior decides on instinct instead', 'The analysis arrives after the decision', 'Nobody designs the information path, so it repeats'],
    forces: ['Information is organised by who produces it, not by who has to decide with it.', 'Asking for more analysis is safer than deciding, so it is the default.', 'The people closest to the facts are not in the room where the decision is made.', 'Reports are built for review meetings, not for the decision that needs them.'],
    consequences: ['Slower decisions', 'Lost time', 'Management capacity'],
    leverage: ['Customers', 'Strategy', 'Capability building'],
    blind: 'Your organization may have normalised "we need more data" as a reason rather than a symptom.',
    notDo: { t: 'Don\'t fix this with a dashboard.', d: 'A dashboard shows everything to everyone. The gap is a specific decision waiting on a specific fact. Design that path first; the dashboard can come after, if it is still needed.' },
    policy: 'Design the information path for the decisions that matter, one at a time.',
    move: { t: 'Trace one waiting decision back to its missing fact.', steps: ['Take the decision that most often waits. Write down, with the person who makes it, the two or three facts that would settle it.', 'Find where each fact currently lives and who has it. Usually it exists; it just isn\'t routed.', 'Build the path: who sends what to whom, by when, in what form. Test it on the next three instances of that decision.'] },
    question: 'Which decision is waiting on information right now, and does the information actually exist somewhere in the organization?',
    metric: { t: 'Time from a decision being needed to the facts reaching the person who makes it', d: 'Track it for the decision you traced. If the facts exist, it should fall to days.' },
  },
  capability: {
    reading: [
      bk('coach', 'Campbell\'s coaching started from the belief that people could be developed into the decision, not selected for it. His method was to put someone in the seat, stay close, and make it safe to be wrong the first time. Capability grows in the doing, with a leader who treats the first misstep as tuition rather than evidence.'),
      bk('grove', 'Task-relevant maturity: how much direction a person needs depends on how experienced they are at this task, not on how senior they are. Grove\'s point is that delegation without training produces the failure that justifies pulling the decision back. The fix is to teach the task before handing over the decision.'),
    ],
    constraint: 'The people being asked to decide haven\'t yet been given the capability to decide well',
    diagnosis: 'Decisions were handed down without the skill, context or practice to make them, so the first few went badly, and leadership pulled them back. Now everyone agrees the managers "aren\'t ready", which is true and is also the result of never having been made ready. The constraint is development, not authority.',
    chain: ['Decisions are delegated without training or context', 'Early decisions go wrong', 'Leadership takes the decisions back', 'Managers stop practising', 'Capability doesn\'t develop', '"They aren\'t ready" becomes permanent'],
    forces: ['Nobody has taught the decision; it was assumed that a title conferred the skill.', 'A wrong decision is treated as evidence about the person rather than about the preparation.', 'Leaders find it faster to decide than to coach, so they decide.', 'Managers are measured on outcomes they have never been shown how to produce.'],
    consequences: ['Management capacity', 'Slower decisions', 'Talent risk'],
    leverage: ['Talent', 'Strategy', 'Capability building'],
    blind: 'Your organization may have concluded that people can\'t decide, when it has never actually taught them to.',
    notDo: { t: 'Don\'t fix this by pushing the decisions down again.', d: 'Delegating the same decisions to the same people with the same preparation will produce the same result, and this time the conclusion will be permanent.' },
    policy: 'Teach the decision, then hand it over, then stay close for the first three.',
    move: { t: 'Coach one decision into one manager.', steps: ['Pick one recurring decision and one manager. Sit with them through the next instance and narrate how you would decide it: what you weigh, what you ignore, what would change your mind.', 'Let them make the next two with you in the room but silent. Debrief each one for ten minutes.', 'Hand it over on the fourth. Agree in advance that the first mistake is tuition, not evidence.'] },
    question: 'Which decision are we withholding because someone "isn\'t ready", and what have we actually done to make them ready?',
    metric: { t: 'Number of recurring decisions made below the top level without being reversed', d: 'Count it quarterly. It should rise by one each time a decision is coached across.' },
  },
};

export const CONSEQUENCE_WHY = {
  'Slower decisions': 'Every stalled decision delays the work behind it.',
  'Duplicated work': 'Different versions of the priority produce different versions of the work.',
  'Lost management capacity': 'Senior time goes to arbitration and rescue instead of direction.',
  'Management capacity': 'Senior time goes to decisions that should be made lower down.',
  'Lost time': 'Re-planning and re-deciding consume weeks that never show on a budget.',
  'Delayed revenue': 'Commitments to customers and markets slip with the initiatives behind them.',
  'Delayed delivery on what matters': 'The important work gets the capacity left over after the urgent.',
  'Higher cost': 'Manual effort and rework are paid for, usually in hours nobody counts.',
  'Lower margin': 'Resources flow to activity that doesn\'t create proportional value.',
  'Customer experience': 'Problems reach customers before they reach leadership.',
  'Employee frustration': 'Capable people spend their judgment on the system instead of the work.',
  'Growth constraints': 'What works by heroics at this size will not at the next.',
  'Innovation capacity': 'The people who could build the next thing are busy rescuing the current one.',
  'Talent risk': 'The best people are the first to notice, and the first to have options.',
};

export const LEVERAGE_WHY = {
  'Strategy': 'thinking about where the business goes next, rather than arbitrating where it is now',
  'Customers': 'time with the customers who decide whether any of this matters',
  'Talent': 'developing the people who will carry the next stage',
  'Innovation': 'building the thing the business will need in two years',
  'Capital allocation': 'deciding deliberately where the next dollar goes',
  'Capability building': 'fixing the system once so it stops needing rescue',
};


// ---------- Experiments: the action engine ----------
// One experiment per hypothesis: what to test, for how long, what to watch.
// outcome(results) turns per-metric results ('up' improved, 'same', 'down' worse) into an interpretation and
// hypothesis updates. Where no specific rule fires, the engine applies a generic one.
export const EXPERIMENTS = {
  centralized: { hypothesis: 'Decision authority is too concentrated at the top.',
    steps: ['Identify the five recurring decisions consuming the most senior-leadership time.', 'Move two of them down one level for 30 days, with written guardrails and a named owner.', 'Tell the people who used to make them that they no longer do.'],
    days: 30, watch: ['Decision cycle time', 'Number of escalations', 'Leadership hours recovered'],
    outcome: r => {
      const u = k => r[k] === 'up';
      if (u('Number of escalations') && u('Leadership hours recovered') && !u('Decision cycle time')) return { text: 'Delegation reduced leadership involvement but did not make decisions faster. Centralized authority is still supported; the remaining delay looks like information, not permission.', delta: { centralized: .4, information: .9, decision_rights: .2 } };
      if (u('Decision cycle time') && u('Number of escalations')) return { text: 'Decisions got faster and stopped coming back up. Centralized authority was the constraint. Move the next two.', delta: { centralized: 1.0 } };
      return null;
    } },
  decision_rights: { hypothesis: 'Important decisions have no clear owner.',
    steps: ['Pick the three decisions that most often stall.', 'For each, write who recommends, who decides, who is consulted, and when it is reviewed. Publish it.', 'Run the next instance of each under the new rights.'],
    days: 30, watch: ['Decision cycle time', 'Decisions reopened after being made', 'Number of escalations'],
    outcome: r => {
      if (r['Decision cycle time'] === 'up' && r['Decisions reopened after being made'] !== 'up') return { text: 'Decisions moved faster but are still being reopened. Ownership helped; the reopening points to leadership disagreement underneath.', delta: { decision_rights: .5, direction: .8 } };
      return null;
    } },
  information: { hypothesis: 'Decisions wait on information that exists but doesn\'t reach them.',
    steps: ['Take the decision that most often waits. Write down the two or three facts that would settle it.', 'Find where each fact lives and who has it.', 'Build the path (who sends what, to whom, by when) and run it for the next three instances.'],
    days: 30, watch: ['Time for facts to reach the decider', 'Decision cycle time', 'Requests for more analysis'],
    outcome: r => {
      if (r['Time for facts to reach the decider'] === 'up' && r['Decision cycle time'] !== 'up') return { text: 'The facts arrived faster and the decision still waited. The information gap was real but not the constraint; the person is waiting for permission, not data.', delta: { information: -.4, centralized: .9 } };
      return null;
    } },
  capability: { hypothesis: 'People haven\'t been taught the decisions they\'re expected to make.',
    steps: ['Pick one recurring decision and one manager. Narrate the next instance to them: what you weigh, what you ignore.', 'Let them make the next two with you silent in the room. Ten-minute debrief each.', 'Hand it over on the fourth, with the first mistake agreed in advance to be tuition.'],
    days: 45, watch: ['Decisions made below the top without reversal', 'Rework on delegated decisions', 'Leadership hours recovered'],
    outcome: r => {
      if (r['Decisions made below the top without reversal'] === 'up' && r['Rework on delegated decisions'] !== 'up') return { text: 'Decisions are staying down but still need rework. The coaching transferred authority faster than skill; slow the handover.', delta: { capability: .6, centralized: -.3 } };
      return null;
    } },
  direction: { hypothesis: 'Leadership holds different versions of what matters most.',
    steps: ['Ask each leader to write, alone, the three things the business must accomplish this year.', 'Compare the lists in one room. Do not leave until it is one list.', 'Publish it and retire what didn\'t survive.'],
    days: 30, watch: ['Distinct top priorities named across leadership', 'Decisions reopened after being made', 'Conflicting requests reaching teams'],
    outcome: r => {
      if (r['Distinct top priorities named across leadership'] === 'up' && r['Conflicting requests reaching teams'] !== 'up') return { text: 'Leadership agreed on one list and teams still get conflicting requests. The agreement hasn\'t reached the system: targets and scorecards still carry the old priorities.', delta: { direction: .3, focus: .6, economics: .4 } };
      return null;
    } },
  focus: { hypothesis: 'The organization has committed to more than it can deliver and stops nothing.',
    steps: ['List every active priority, everywhere.', 'Rank by contribution to the one thing that matters most. Stop the bottom fifth explicitly.', 'Watch for a month what actually gets worse.'],
    days: 30, watch: ['Share of capacity on the top three priorities', 'Agreed work delivered on time', 'Things that got worse after stopping'],
    outcome: r => {
      if (r['Share of capacity on the top three priorities'] === 'up' && r['Agreed work delivered on time'] !== 'up') return { text: 'Capacity concentrated but delivery didn\'t improve. Volume wasn\'t the only constraint; look at ownership and handoffs on the three that remain.', delta: { focus: .3, execution: .7, decision_rights: .4 } };
      return null;
    } },
  economics: { hypothesis: 'Priorities are chosen by advocacy rather than by what creates value.',
    steps: ['For each of your top five priorities, write one line: which of customers, revenue, margin, cash or velocity it moves, by how much, by when.', 'Stop or redesign anything without a line.', 'Share the five lines with the people delivering them.'],
    days: 30, watch: ['Priorities with a named value driver', 'Resource shifts made on economics rather than advocacy', 'Analysis requested that didn\'t change a decision'],
    outcome: null },
  execution: { hypothesis: 'Commitments are made without the capacity or ownership to deliver them.',
    steps: ['Pick the three commitments that matter most this quarter. Only three.', 'Give each an owner, a date, and capacity written down and subtracted from something else.', 'Declare everything else "not this quarter", in public.'],
    days: 60, watch: ['Priority initiatives completed as committed', 'Commitments re-planned mid-quarter', 'Owner-reported blockers'],
    outcome: null },
  leverage: { hypothesis: 'The system doesn\'t carry the work, so people carry it by hand.',
    steps: ['Ask your three most relied-upon people what they do by hand that the process should do.', 'Pick the one that consumes the most time.', 'Design it into the process, remove the manual step, and credit them for surfacing it.'],
    days: 45, watch: ['Hours per week on recurring workarounds', 'Recurrences of the problem', 'Results when the key person is away'],
    outcome: null },
  talent: { hypothesis: 'Your best people are being spent on urgent work instead of the highest-value problems.',
    steps: ['For your five most capable people, list where their time went last week.', 'Move each one\'s largest block of low-value work to someone else, or stop it.', 'Put the freed time on the one problem that matters most and protect it for a quarter.'],
    days: 60, watch: ['Top talent time on the top three priorities', 'Fires handled by someone other than the best people', 'Progress on the protected problem'],
    outcome: null },
  trust: { hypothesis: 'Raising problems carries a cost, so problems surface late.',
    steps: ['Open your main leadership meeting with "what\'s not working?" before any status. The most senior person speaks last.', 'Thank the first person who names a real problem, publicly, and act on it within the week.', 'Repeat weekly for a quarter.'],
    days: 90, watch: ['Problems raised before they become incidents', 'Time from problem noticed to problem raised', 'Disagreements voiced in the meeting'],
    outcome: null },
};

// ---------- Economic shadow: what the operating profile suggests ----------
// Rules only. Financial ranges are optional. Never presented as fact.
export const ECON_READS = [
  { when: (p, f) => p.leverage >= .6 && ['Loss-making', 'Break-even', '1–5%'].includes(f.profit),
    t: 'Your operating profile suggests margin is being absorbed by manual work and rework.', d: 'Performance that depends on people working around the system costs labour hours that never appear as a line item. At your stated profitability, that is likely where a meaningful share of the margin is going.', conf: 'Moderate' },
  { when: (p, f) => p.leverage >= .6 && ['10–20%', '20%+'].includes(f.profit),
    t: 'Margin is holding despite the friction, which usually means heroics are absorbing it.', d: 'That holds until growth adds volume to a process that already needs manual rescue. The cost arrives as a step change, not a slope.', conf: 'Moderate' },
  { when: (p, f) => p.leverage >= .6,
    t: 'Your operating profile suggests margin may be below the range for a business like yours.', d: 'High reliance on workarounds usually shows up as labour intensity and rework before it shows up in reporting.', conf: 'Emerging' },
  { when: (p, f) => Math.max(p.centralized, p.decision_rights, p.information) >= .6,
    t: 'The scarce resource is leadership capacity, and the cost shows up as delay before it shows up in the P&L.', d: 'Decisions that wait cost the revenue behind them. The illustrative estimate above is the visible part; the delayed work is the larger, uncounted part.', conf: 'Moderate' },
  { when: (p, f) => Math.max(p.focus, p.execution) >= .6,
    t: 'Your operating profile suggests revenue is being delayed rather than lost.', d: 'Commitments that slip push customer and market outcomes to later quarters. The economics usually recover when the number of concurrent priorities falls.', conf: 'Emerging' },
  { when: (p, f) => p.economics >= .6,
    t: 'Your operating profile suggests resources are flowing to activity that doesn\'t create proportional value.', d: 'Without explicit value drivers, spend follows the strongest case. The margin effect is gradual and easy to normalise.', conf: 'Emerging' },
];

// Expected vs observed on the operating traits the answers can actually see. Qualitative on purpose:
// numeric benchmarks need real data by industry and size, and this file does not invent them.
export const PROFILE_ROWS = [
  { k: 'Leadership dependency', expected: 'Low to moderate', observe: p => Math.max(p.centralized, p.leverage) >= .65 ? 'High' : Math.max(p.centralized, p.leverage) >= .45 ? 'Moderate' : 'Low' },
  { k: 'Decision latency', expected: 'Days, not weeks', observe: p => Math.max(p.decision_rights, p.information) >= .65 ? 'High' : Math.max(p.decision_rights, p.information) >= .45 ? 'Moderate' : 'Low' },
  { k: 'Priority load', expected: 'A handful, with a stop-doing list', observe: p => p.focus >= .65 ? 'High' : p.focus >= .45 ? 'Moderate' : 'Low' },
  { k: 'Rework and workarounds', expected: 'Rare, and traced to cause', observe: p => p.leverage >= .65 ? 'High' : p.leverage >= .45 ? 'Moderate' : 'Low' },
  { k: 'Candour', expected: 'Problems raised early', observe: p => p.trust >= .65 ? 'Low' : p.trust >= .45 ? 'Mixed' : 'High' },
];
export const LOW_FRICTION = {
  name: 'Low friction',
  summary: 'Nothing in your answers rose to the level of a constraint worth acting on. That is unusual, and worth protecting.',
  detail: 'The three lenses are each carrying their share. When that is true, the risk is not a current problem but the quiet arrival of one: a priority added without one removed, a decision pulled upward after a scare, an approval layer added after a mistake. The inversion question you answered is the best guard you have.',
  watch: 'Run Friction again in a quarter. If the same picture holds, the system is doing its job. If one lens has moved, you will see it before it costs anything.',
};


export const OUTCOME_OPTIONS = [ { key: 'up', t: 'Improved' }, { key: 'same', t: 'No change' }, { key: 'down', t: 'Worse' } ];
