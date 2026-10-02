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
  conflict_avoidance: { lens: 'P', name: 'Disagreement is avoided rather than worked through', importance: 1.0 },
  blame:           { lens: 'P', name: 'Problems are met with blame rather than ownership', importance: .9 },
  loss:            { lens: 'P', name: 'The organization is carrying a loss it hasn\'t processed', importance: 1.0 },
  pressure:        { lens: 'S', name: 'Targets and incentives reward the wrong behaviour', importance: 1.0 },
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
// sig: log likelihood ratios toward each hypothesis (+ supports, − contradicts). Scales are centred: the middle of an
// ordinal scale is close to zero, because ordinary organizations answer in the middle.
// obs: the observation in plain words (used in exports; the page quotes the person's own answer instead).
// short: how the question is named when an answer is quoted back as evidence.
// event: the question asks about something that happened, not an opinion. The read needs at least one for High confidence.
// required: always asked before the engine may stop. own: the option names the respondent's own part in a hypothesis.
// gate: asked only while the named hypotheses are live. act: actionability 0–1.
const o = (t, sig = {}, obs = null, extra = {}) => ({ t, sig, obs, ...extra });

export const OPENER = {
  id: 'opener', lens: null, act: .6, opener: true, short: 'What gets in the way most',
  eyebrow: 'Start with the signal',
  title: 'What\'s getting in the way most right now?',
  help: 'Pick the one that sounds most like your week.',
  options: [
    o('Too many decisions end up with me', { centralized: .8, decision_rights: .6, information: .3, capability: .3 }, 'Decisions escalate to the top'),
    o('We agree on things that then don\'t happen', { execution: .8, focus: .4, decision_rights: .2 }, 'Agreed priorities don\'t get delivered'),
    o('We keep solving the same problems', { leverage: .8, execution: .3, information: .2 }, 'Problems recur'),
    o('Leaders don\'t agree on what matters', { direction: 1.0, economics: .2, conflict_avoidance: -.2 }, 'Leadership holds different priorities'),
    o('Too many priorities, nothing gets finished', { focus: 1.0, execution: .3 }, 'Priorities exceed capacity'),
    o('Our best people are stuck on fires', { talent: .9, leverage: .4 }, 'Top people spend their time on rescue work'),
    o('People don\'t say what they think', { trust: .9, conflict_avoidance: .5 }, 'Problems aren\'t raised openly'),
    o('Effort is high but results aren\'t', { economics: .5, focus: .4, execution: .3, talent: .2 }, 'Effort isn\'t converting to results'),
    o('Cash or margin is tighter than it should be', { economics: 1.0, pressure: .2 }, 'Cash or margin is tight'),
    o('We can\'t hire or keep the right people', { talent: .7, capability: .5, pressure: .2 }, 'Hiring and keeping the right people is hard'),
    o('Nothing major is in the way', {}, 'Nothing major named', { nothing: true }),
    o('I\'m tired, and I can\'t tell if it\'s the business or me', { loss: .4 }, 'The leader is tired and unsure where the problem sits', { tired: true }),
  ],
};

export const QUESTIONS = [
  // ----- Business -----
  { id: 'direction', lens: 'B', act: .8, short: 'How similar leaders\' top three would be', eyebrow: 'Business · Do you know what matters?',
    title: 'If you asked your leadership team to name the three most important things the business needs to accomplish right now, how similar would their answers be?',
    options: [
      o('Almost identical', { direction: -1.0 }, 'Leadership names the same top three'),
      o('Mostly similar', { direction: -.2 }, 'Leadership mostly agrees on the top three'),
      o('Quite different', { direction: 1.0, economics: .2 }, 'Leaders name different top priorities'),
      o('Very different', { direction: 1.5, economics: .3, execution: .2 }, 'Leaders hold very different priorities'),
      o('I\'m not sure what they\'d say', { direction: .4, conflict_avoidance: .4 }, 'The leader doesn\'t know what the team would say'),
    ] },
  { id: 'focus', lens: 'B', act: .9, short: 'Whether you\'d know what to stop', eyebrow: 'Business · Do you know what matters?',
    title: 'If you had to eliminate 20% of your current priorities tomorrow, would you know what to stop?',
    options: [
      o('Definitely', { focus: -1.0 }, 'Leadership could name what to stop'),
      o('Probably', { focus: -.2 }, 'Leadership could probably name what to stop'),
      o('Not really', { focus: .6, economics: .3 }, 'It\'s unclear what could be stopped'),
      o('No idea', { focus: 1.3, economics: .5 }, 'Nobody could say what to stop'),
    ] },
  { id: 'economics', lens: 'B', act: .8, short: 'How priorities connect to value', eyebrow: 'Business · Do you know what matters?',
    title: 'How clearly can you connect your biggest priorities to what creates value: customers, revenue, margin and cash, or for a nonprofit, mission and funding?',
    options: [
      o('Very clearly', { economics: -1.0 }, 'Priorities trace to value drivers'),
      o('Mostly clearly', { economics: -.2 }, 'Priorities mostly trace to value drivers'),
      o('Somewhat', { economics: .5, focus: .2 }, 'The link from priorities to value is loose'),
      o('Not clearly', { economics: 1.4, focus: .3, direction: .2 }, 'Priorities aren\'t connected to what creates value'),
    ] },
  { id: 'business_uncertainty', lens: 'B', act: .7, short: 'The biggest uncertainty', gate: p => Math.max(p.direction, p.focus, p.economics) >= .4,
    eyebrow: 'Business · Following up', title: 'Where is the biggest uncertainty?',
    options: [
      o('What to prioritize', { focus: .8, direction: .3 }, 'The organization hasn\'t chosen what comes first'),
      o('Which customers matter most', { economics: .9 }, 'It\'s unclear which customers matter most'),
      o('Where to invest', { economics: .8, direction: .2 }, 'Investment isn\'t guided by economics'),
      o('What to stop', { focus: 1.0 }, 'Nothing is formally stopped'),
      o('How to grow', { direction: .8 }, 'The growth path isn\'t chosen'),
      o('Where profit comes from', { economics: 1.2 }, 'The economics of the business aren\'t explicit'),
      o('There isn\'t a big one', { focus: -.6, economics: -.6, direction: -.4 }, 'No large business uncertainty'),
    ] },
  // ----- System -----
  { id: 'decisions', lens: 'S', act: .9, short: 'Why decisions get stuck', eyebrow: 'System · Can the organization execute?',
    title: 'When an important decision gets stuck, what is usually the reason?',
    options: [
      o('Nobody clearly owns it', { decision_rights: 1.4, centralized: .2 }, 'Important decisions have no clear owner'),
      o('Too many people have to approve it', { decision_rights: 1.2 }, 'Decisions need too many approvals'),
      o('We don\'t have enough information', { information: 1.2, economics: .2 }, 'Decisions wait on information'),
      o('Leaders disagree', { direction: 1.1, decision_rights: .2 }, 'Leadership disagreement stalls decisions'),
      o('People don\'t feel authorized to decide', { centralized: 1.1, decision_rights: .5 }, 'People don\'t feel authorized to decide'),
      o('We keep revisiting the decision', { direction: .5, trust: .3, decision_rights: .3, conflict_avoidance: .3 }, 'Decisions get reopened'),
      o('Decisions don\'t really get stuck', { decision_rights: -1.0, centralized: -.8, information: -.8 }, 'Decisions don\'t stall'),
      o('I find it hard to let go of it', { centralized: 1.4 }, 'The leader finds it hard to let go', { own: 'centralized' }),
      o('I decide after others have discussed it', { centralized: .4 }, 'The leader decides after discussion'),
    ] },
  { id: 'comeback', lens: 'S', act: 1.0, short: 'Why decisions come back up', gate: p => Math.max(p.centralized, p.decision_rights, p.information, p.capability) >= .4,
    eyebrow: 'System · Following up', title: 'What usually causes decisions to come back up to senior leadership?',
    options: [
      o('No clear owner', { decision_rights: 1.3, centralized: -.2 }, 'Decisions escalate because ownership is unclear'),
      o('Not enough information', { information: 1.3, capability: -.2 }, 'Decisions escalate for lack of information'),
      o('I\'m not confident the person will get it right', { capability: 1.1, centralized: .5 }, 'The leader isn\'t confident in the decider'),
      o('High consequence of getting it wrong', { centralized: .8, decision_rights: .3 }, 'High-stakes decisions are held at the top'),
      o('I want to be the one who decides', { centralized: 1.5 }, 'The leader wants to decide', { own: 'centralized' }),
      o('They don\'t come back up', { centralized: -1.0, decision_rights: -.6, information: -.5, capability: -.5 }, 'Decisions stay where they were made'),
      o('I get nervous when it\'s out of my hands', { centralized: 1.2, trust: .3 }, 'The leader gets nervous when it\'s out of their hands', { own: 'centralized' }),
    ] },
  { id: 'overrule', lens: 'P', act: .9, event: true, required: true, short: 'When a manager\'s call differs from yours',
    eyebrow: 'People · What actually happens', title: 'When a manager makes a call you would have made differently, what usually happens?',
    options: [
      o('It stands', { centralized: -1.0, capability: -.3 }, 'Managers\' decisions stand'),
      o('We talk it through afterwards', { centralized: -.5, capability: .2 }, 'Decisions are debriefed, not reversed'),
      o('It gets reversed', { centralized: 1.4, trust: .3 }, 'Managers\' decisions get reversed', { own: 'centralized' }),
      o('They check first, so it rarely happens', { centralized: .6, decision_rights: .4, trust: .3 }, 'Managers check before deciding'),
      o('They aren\'t making those calls', { centralized: .4, capability: .9 }, 'Managers aren\'t making those calls'),
    ] },
  { id: 'given', lens: 'P', act: .9, event: true, short: 'When someone is given a decision', gate: p => Math.max(p.capability, p.information, p.centralized) >= .4,
    eyebrow: 'People · Following up', title: 'When someone is given a decision to make, what happens most often?',
    options: [
      o('They make it well', { capability: -1.0, information: -.4 }, 'People decide well when given the decision'),
      o('They make it, but slowly', { information: .6, capability: .2 }, 'People decide slowly when given the decision'),
      o('They make it, but it needs rework', { capability: 1.3, information: .3 }, 'Delegated decisions need rework'),
      o('They hand it back', { centralized: .8, capability: .6, trust: .5 }, 'People hand decisions back up'),
      o('They wait for a steer', { direction: .6, centralized: .7, capability: .3 }, 'People wait for direction before deciding'),
      o('They decide, and I step in', { centralized: 1.3 }, 'The leader steps in on delegated decisions', { own: 'centralized' }),
    ] },
  { id: 'waiting', lens: 'S', act: .9, event: true, short: 'What decisions wait for', gate: p => Math.max(p.information, p.decision_rights, p.direction, p.conflict_avoidance) >= .4,
    eyebrow: 'System · Following up', title: 'When a decision waits, what is it usually waiting for?',
    options: [
      o('A person', { centralized: 1.2, decision_rights: .3 }, 'Decisions wait on a person'),
      o('A meeting', { decision_rights: 1.1, execution: .3 }, 'Decisions wait for a meeting'),
      o('Data or analysis', { information: 1.0 }, 'Decisions wait on analysis'),
      o('Agreement between leaders', { direction: 1.1, conflict_avoidance: .3 }, 'Decisions wait on leadership agreement'),
      o('They don\'t wait', { decision_rights: -.9, information: -.9, centralized: -.7 }, 'Decisions don\'t wait'),
      o('Nobody wants to be the one who says no', { conflict_avoidance: 1.3, direction: .3 }, 'Nobody wants to be the one who says no'),
    ] },
  { id: 'analysis', lens: 'S', act: .9, event: true, short: 'When the analysis arrives', gate: p => Math.max(p.information, p.economics) >= .4,
    eyebrow: 'System · Following up', title: 'When the analysis finally arrives, what usually happens?',
    options: [
      o('It settles the question', { information: .8, economics: -.9 }, 'Analysis settles decisions once it arrives'),
      o('It starts a debate about what it means', { direction: 1.0, economics: .5, information: -.7 }, 'Analysis starts a debate about what it means'),
      o('It gets requested again in a different form', { direction: .7, trust: .4, economics: .4, information: -.4 }, 'Analysis is re-requested rather than acted on'),
      o('It arrives after the decision was made', { information: 1.2 }, 'Analysis arrives after the decision'),
      o('It rarely arrives at all', { information: .9, leverage: .3 }, 'Analysis rarely arrives'),
    ] },
  { id: 'execution', lens: 'S', act: .8, short: 'Whether agreed work happens', eyebrow: 'System · Can the organization execute?',
    title: 'When your organization agrees that something is important, how reliably does it actually happen?',
    options: [
      o('Almost always', { execution: -1.0, focus: -.2 }, 'Agreed priorities get delivered'),
      o('Usually', { execution: -.2 }, 'Agreed priorities usually get delivered'),
      o('Sometimes', { execution: .4, focus: .1 }, 'Agreed priorities sometimes slip'),
      o('Rarely', { execution: 1.5, focus: .3, leverage: .2 }, 'Agreed priorities rarely get delivered'),
    ] },
  { id: 'execution_why', lens: 'S', act: .9, short: 'What gets in the way of agreed work', gate: p => p.execution >= .4, multi: true, max: 2,
    eyebrow: 'System · Following up', title: 'When it doesn\'t happen, what usually gets in the way?', help: 'Pick up to two.',
    options: [
      o('Too many competing priorities', { focus: 1.0, execution: .2 }, 'Commitments compete for the same capacity'),
      o('No clear owner', { decision_rights: 1.0, execution: .2 }, 'Work has no single owner'),
      o('Lack of capacity', { focus: .6, talent: .3 }, 'Capacity is committed past what exists'),
      o('Lack of capability', { capability: .6 }, 'The people asked to deliver lack the skills or support'),
      o('Poor process', { leverage: 1.0 }, 'The process doesn\'t carry the work'),
      o('Leadership changes direction', { direction: 1.0, execution: .2 }, 'Direction changes before delivery'),
      o('Dependencies between teams', { leverage: .5, decision_rights: .5 }, 'Work stalls at handoffs'),
      o('Follow-through', { execution: .7, trust: .2 }, 'Follow-through'),
      o('Something else, or not sure', {}, 'Something else'),
    ] },
  { id: 'leverage', lens: 'S', act: .8, short: 'How much depends on workarounds', eyebrow: 'System · Can the organization execute?',
    title: 'How much of your organization\'s performance depends on people working around the system or personally "making it happen"?',
    options: [
      o('Very little', { leverage: -1.0 }, 'Systems carry the work'),
      o('Some', { leverage: 0 }, 'Some reliance on individuals'),
      o('A lot', { leverage: 1.0, talent: .3 }, 'Performance depends on workarounds'),
      o('Almost everything depends on it', { leverage: 1.5, talent: .4, centralized: .2 }, 'Performance depends almost entirely on heroics'),
    ] },
  { id: 'repeat', lens: 'S', act: .7, short: 'Whether successes repeat', gate: p => Math.max(p.leverage, p.execution) >= .4,
    eyebrow: 'System · Following up', title: 'When something works, can the organization repeat it?',
    options: [
      o('Usually', { leverage: -.8 }, 'Successes are repeatable'),
      o('Sometimes', { leverage: .1 }, 'Successes are sometimes repeatable'),
      o('Rarely', { leverage: .9, execution: .3 }, 'Successes are rarely repeated'),
      o('It depends on the person', { leverage: 1.1, talent: .4 }, 'Repeatability depends on the person'),
      o('We tend to reinvent it', { leverage: .9, information: .3 }, 'Successes get reinvented'),
    ] },
  // ----- People -----
  { id: 'authority', lens: 'P', act: .8, short: 'Whether authority matches accountability', eyebrow: 'People · Can people act on it?',
    title: 'Do people generally have enough authority to make the decisions they are accountable for?',
    options: [
      o('Almost always', { centralized: -.9, decision_rights: -.3 }, 'Authority matches accountability'),
      o('Usually', { centralized: -.2 }, 'Authority mostly matches accountability'),
      o('Sometimes', { centralized: .5, decision_rights: .3 }, 'Authority often falls short of accountability'),
      o('Rarely', { centralized: 1.4, decision_rights: .5 }, 'People lack the authority they\'re accountable for'),
    ] },
  { id: 'talent', lens: 'P', act: .8, short: 'Where your best people\'s time goes', eyebrow: 'People · Can people act on it?',
    title: 'Are your best people spending most of their time on the highest-value problems, rather than the most urgent ones?',
    options: [
      o('Almost always', { talent: -1.0 }, 'Best people are on the highest-value problems'),
      o('Usually', { talent: -.2 }, 'Best people are mostly on high-value problems'),
      o('Sometimes', { talent: .5, leverage: .2 }, 'Best people are often on urgent, low-value work'),
      o('Rarely', { talent: 1.4, leverage: .3 }, 'Best people are consumed by urgent work'),
      o('I\'m not sure', { talent: .2, information: .2 }, 'Where top talent\'s time goes isn\'t known'),
    ] },
  { id: 'trust', lens: 'P', act: .9, event: true, required: true, short: 'The last time you heard something you didn\'t want to',
    eyebrow: 'People · What actually happens', title: 'Think of the last time someone told you something you didn\'t want to hear. What did you do in the next ten seconds?',
    help: 'The first ten seconds, not what you did later.',
    options: [
      o('Thanked them and asked more', { trust: -.8, blame: -.3 }, 'The leader thanked them and asked more'),
      o('Listened, then explained why I saw it differently', { trust: .1, centralized: .1 }, 'The leader explained why they saw it differently'),
      o('Got tense, or went quiet', { trust: 1.1 }, 'The leader got tense or went quiet'),
      o('Moved on to something else', { trust: .4, conflict_avoidance: .6 }, 'The leader moved on'),
      o('I can\'t remember anyone telling me something like that', { trust: 1.3, centralized: .3 }, 'The leader can\'t remember hearing unwelcome news'),
    ] },
  { id: 'trust_last', lens: 'P', act: .9, event: true, required: true, short: 'The last time someone raised a serious problem',
    eyebrow: 'People · What actually happens', title: 'What happened the last time someone raised a serious problem or disagreed with a decision?',
    options: [
      o('It was acted on', { trust: -1.0 }, 'Raised problems get acted on'),
      o('It was heard, and nothing changed', { trust: .2, execution: .5 }, 'Raised problems are heard but not acted on'),
      o('The person paid for it', { trust: 1.7, blame: .4, centralized: -.2 }, 'The last person to raise a problem paid for it'),
      o('It didn\'t get raised, so nothing happened', { trust: 1.3, conflict_avoidance: .5 }, 'Serious problems go unraised'),
      o('It depends who raised it', { trust: .6, direction: .2 }, 'Whether a problem is heard depends on who raises it'),
    ] },
  { id: 'conflict', lens: 'P', act: .9, event: true, required: true, short: 'The last open disagreement between leaders',
    eyebrow: 'People · What actually happens', title: 'When did two of your leaders last disagree openly, in front of others, about something that mattered?',
    options: [
      o('This month', { conflict_avoidance: -1.0, trust: -.3 }, 'Leaders disagreed openly this month'),
      o('This quarter', { conflict_avoidance: -.3 }, 'Leaders disagreed openly this quarter'),
      o('I can\'t remember one', { conflict_avoidance: 1.2, trust: .3 }, 'No open disagreement the leader can remember'),
      o('Never', { conflict_avoidance: 1.5, trust: .4 }, 'Leaders never disagree openly'),
      o('Constantly, and it doesn\'t get resolved', { direction: 1.0, conflict_avoidance: -.5, trust: .3 }, 'Leaders disagree constantly without resolution'),
    ] },
  { id: 'blame_first', lens: 'P', act: .9, event: true, short: 'The first question when something goes wrong',
    eyebrow: 'People · What actually happens', title: 'When something goes wrong, what is the first question usually asked?',
    options: [
      o('"Who did this?"', { blame: 1.4, trust: .4 }, 'The first question is who did it'),
      o('"What happened?"', { blame: -.3 }, 'The first question is what happened'),
      o('"What did we do to create this?"', { blame: -1.0, trust: -.3 }, 'The first question is what we did to create it'),
      o('We don\'t really talk about it', { conflict_avoidance: .8, trust: .5, blame: .2 }, 'Failures aren\'t discussed'),
    ] },
  { id: 'gossip', lens: 'P', act: .8, event: true, short: 'How frustrations travel', gate: p => Math.max(p.blame, p.trust, p.conflict_avoidance) >= .35,
    eyebrow: 'People · Following up', title: 'How often do you hear about someone\'s frustration with a colleague from a third person, before it reaches that colleague?',
    options: [
      o('Often', { blame: 1.1, trust: .4, conflict_avoidance: .3 }, 'Frustrations travel through third people'),
      o('Sometimes', { blame: .3 }, 'Frustrations sometimes travel through third people'),
      o('Rarely', { blame: -.6 }, 'Frustrations go to the person directly'),
      o('I\'m not sure', { blame: .2 }, 'The leader isn\'t sure how frustrations travel'),
    ] },
  { id: 'people_limits', lens: 'P', act: .8, short: 'What limits people\'s ability to act', gate: p => Math.max(p.centralized, p.capability, p.trust, p.talent, p.blame) >= .4,
    eyebrow: 'People · Following up', title: 'What most limits people\'s ability to act?',
    options: [
      o('How I and the other leaders respond when something goes wrong', { trust: .9, centralized: .7, blame: .3 }, 'Leaders\' response to problems limits action', { own: 'trust' }),
      o('Lack of clarity', { direction: .7, focus: .3 }, 'People aren\'t sure what matters most'),
      o('Lack of authority', { centralized: 1.1, decision_rights: .4 }, 'People lack the authority to act'),
      o('Lack of capability', { capability: 1.2 }, 'People lack the skills or support'),
      o('Lack of information', { information: 1.1 }, 'People lack the information to act'),
      o('Fear of mistakes', { trust: 1.2, blame: .4 }, 'Mistakes are costly, so people don\'t act'),
      o('Conflicting incentives', { economics: .8, talent: .3 }, 'Incentives point elsewhere'),
      o('Nothing in particular', { direction: -.3, centralized: -.3, capability: -.3, information: -.3, trust: -.3 }, 'Nothing in particular limits action'),
    ] },
  // ----- You -----
  { id: 'self', lens: 'P', act: .9, required: true, multi: true, max: 2, short: 'Your own part',
    eyebrow: 'You · Your own part', title: 'When this problem shows up, what is your own part in it, honestly?',
    help: 'Everyone who leads is part of the pattern somewhere. Pick up to two.',
    options: [
      o('I step in and decide, so it doesn\'t land on others', { centralized: 1.1 }, 'The leader steps in and decides', { own: 'centralized' }),
      o('I avoid the hard conversation', { conflict_avoidance: 1.1, trust: .3 }, 'The leader avoids the hard conversation', { own: 'conflict_avoidance' }),
      o('I keep changing what I ask for', { direction: .8, focus: .5 }, 'The leader keeps changing the ask', { own: 'direction' }),
      o('I haven\'t shown people how I\'d decide it', { capability: 1.0 }, 'The leader hasn\'t taught the decision', { own: 'capability' }),
      o('I\'m too stretched to see it closely', { leverage: .4, talent: .3, information: .3 }, 'The leader is too stretched to see it'),
      o('I look for who dropped the ball', { blame: 1.2, trust: .3 }, 'The leader looks for who dropped the ball', { own: 'blame' }),
      o('I don\'t think I\'m part of it', {}, 'The leader doesn\'t see their part', { denial: true }),
      o('I\'m not sure yet', {}, 'The leader isn\'t sure of their part'),
    ] },
  { id: 'loss', lens: 'P', act: 1.0, event: true, required: true, short: 'A loss in the last year',
    eyebrow: 'Before we go further', title: 'Has the organization lost someone or something it cared about that it hasn\'t fully moved past: a person, a team, a client, a product, people in a layoff?',
    help: 'Recent or not. Some losses are years old and still in the room.',
    options: [
      o('No', { loss: -1.0 }, 'No significant loss'),
      o('Yes, and we\'ve talked about it openly', { loss: .2 }, 'A loss that has been talked about openly'),
      o('Yes, and we haven\'t really talked about it', { loss: 1.6, trust: .3 }, 'A loss that hasn\'t been talked about', { grief: true }),
      o('Yes, recently, and it\'s still raw', { loss: 1.8 }, 'A recent loss that is still raw', { grief: true }),
    ] },
  { id: 'missed', lens: 'S', act: 1.0, event: true, required: true, short: 'The last missed number',
    eyebrow: 'System · What actually happens', title: 'Think of the last person who missed an important number or deadline. What happened next?',
    options: [
      o('We looked at why together and changed something', { pressure: -1.0, blame: -.6 }, 'A miss led to a shared look at the cause'),
      o('A hard conversation, then support', { pressure: -.3, blame: -.2 }, 'A miss led to a hard conversation and support'),
      o('They were put on a plan, or moved out', { pressure: 1.0, blame: .6 }, 'Missing a number costs the person'),
      o('Nothing much. Targets slip here', { pressure: -.4, execution: .9 }, 'Missed targets carry no consequence'),
      o('The number was quietly made to work', { pressure: 1.4, trust: .3 }, 'Numbers are quietly made to work'),
      o('I let them know I was disappointed', { blame: .7, pressure: .4 }, 'The leader shows disappointment at a miss', { own: 'blame' }),
      o('I don\'t know what happened', { information: .7, pressure: .3 }, 'The leader doesn\'t know what happens after a miss'),
    ] },
  { id: 'rulebreak', lens: 'S', act: .9, event: true, short: 'When a target is hit the wrong way', gate: p => Math.max(p.pressure, p.blame) >= .3 || p.trust >= .4,
    eyebrow: 'System · Following up', title: 'When someone hits their target by bending a rule or cutting a corner, what usually happens?',
    options: [
      o('It\'s addressed, even if it costs us the number', { pressure: -1.0 }, 'Corners cut are addressed even at the cost of the number'),
      o('A quiet word, and the result still counts', { pressure: .9 }, 'Results count even when a corner was cut'),
      o('Nobody says much', { pressure: 1.0, conflict_avoidance: .5 }, 'Corners cut go unremarked'),
      o('They\'re held up as someone who gets it done', { pressure: 1.5 }, 'People who cut corners to hit targets are held up as examples'),
      o('I\'d probably not hear about it', { pressure: .5, information: .6, trust: .4 }, 'The leader wouldn\'t hear about corners cut'),
      o('I haven\'t seen it happen', { pressure: -.2 }, 'The leader hasn\'t seen a target hit the wrong way'),
    ] },
  { id: 'collide', lens: 'S', act: .9, event: true, short: 'When a deadline met a concern', gate: p => p.pressure >= .22,
    eyebrow: 'System · Following up', title: 'The last time a deadline or target collided with a quality, safety or customer concern, which gave way?',
    options: [
      o('The deadline or target moved', { pressure: -1.0 }, 'The deadline gave way to the concern'),
      o('We found an honest way to do both', { pressure: -.4 }, 'Both the deadline and the concern were met'),
      o('The concern was noted, and we shipped', { pressure: 1.3, trust: .3 }, 'The concern gave way to the deadline'),
      o('The person raising it was asked to find a way around it', { pressure: 1.1, trust: .6 }, 'The person raising a concern was asked to work around it'),
      o('It hasn\'t come up', { pressure: -.1 }, 'No collision the leader can recall'),
    ] },
  { id: 'margin_last', lens: 'B', act: .9, event: true, short: 'Who set the price', gate: p => p.economics >= .22,
    eyebrow: 'Business · What actually happens', title: 'Think of the last piece of work you lost money on, or won mostly on price. Who set the price or the discount?',
    options: [
      o('We don\'t know which work loses money', { economics: 1.4, information: .5 }, 'Which work loses money isn\'t known'),
      o('Whoever was selling, case by case', { economics: 1.3, decision_rights: .3 }, 'Price is set case by case by whoever sells'),
      o('I did, personally', { economics: .4, centralized: .7 }, 'The leader sets price personally', { own: 'centralized' }),
      o('A clear rule, applied the same way every time', { economics: -.8 }, 'Pricing follows a clear rule'),
      o('We walked away because the margin was wrong', { economics: -1.0 }, 'Work is turned down when the margin is wrong'),
    ] },
];

export const INVERSION = {
  id: 'inversion', lens: null, act: .5, multi: true, max: 2, terminal: true, short: 'What would make it worse',
  intro: { kicker: 'One more, and it\'s a strange one.', line: 'Invert the problem. What would make it worse is usually what is quietly keeping it alive.' },
  eyebrow: 'Inversion', title: 'If you wanted this problem to get significantly worse, what would you do?', help: 'Pick up to two. Be honest about which ones are already happening.',
  options: [
    o('Add more priorities', { focus: .2 }, 'Adding more priorities', { force: 'Adding more priorities.' }),
    o('Centralize more decisions', { centralized: .2 }, 'Centralizing more decisions', { force: 'Centralizing more decisions.' }),
    o('Add another approval layer', { decision_rights: .15, centralized: .1 }, 'Adding another approval layer', { force: 'Adding another approval layer.' }),
    o('Avoid the difficult conversation', { trust: .1, conflict_avoidance: .2 }, 'Avoiding the difficult conversation', { force: 'Avoiding the difficult conversation.' }),
    o('Keep measuring activity instead of outcomes', { economics: .2 }, 'Measuring activity instead of outcomes', { force: 'Measuring activity instead of outcomes.' }),
    o('Continue rewarding the current behavior', { economics: .1, trust: .1 }, 'Rewarding the current behaviour', { force: 'Rewarding the current behaviour.' }),
    o('Keep solving the symptom', { leverage: .2 }, 'Solving the symptom again', { force: 'Solving the symptom again.' }),
    o('Do nothing', { execution: .1 }, 'Doing nothing', { force: 'Doing nothing.' }),
    o('Take the criticism personally and defend myself', { trust: .2, blame: .1 }, 'Taking criticism personally', { force: 'Taking the criticism personally and defending yourself.', admits: true }),
    o('Keep things comfortable instead of saying what I see', { conflict_avoidance: .2 }, 'Keeping things comfortable', { force: 'Keeping things comfortable instead of saying what you see.', admits: true }),
  ],
};
export const ALL_QUESTIONS = [OPENER, ...QUESTIONS, INVERSION];

// The actor's budget. Required questions are always asked before the engine may stop.
export const ACTOR = { minQuestions: 9, maxQuestions: 13, stopConfidence: .8, stopMargin: .2 };

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
    pressure: 'The business sets targets the system can only hit by cutting corners, and the numbers don\'t show how they were hit.',
    direction: 'Leadership hasn\'t settled what matters most, so the organization is executing several answers at once and experiencing it as slowness.',
    focus: 'The business keeps committing to more than the system has capacity to deliver, and nothing is formally stopped to make room.',
    economics: 'Priorities aren\'t tied to what creates value, so the system executes hard against a scoreboard that doesn\'t decide anything.',
    decision_rights: 'You know what you want. Decisions about how to get there have no clear owner, so the machine waits.',
    execution: 'You know what matters. Commitments don\'t reliably turn into work, because they are made without the capacity or ownership to deliver them.',
    leverage: 'You know what matters. The system doesn\'t carry it, so people carry it by hand, and that works until it doesn\'t.',
    information: 'You know what you want. The facts that decisions need don\'t reach the people making them, so the system waits.',
  },
  SP: {
    decision_rights: 'Capable people are waiting on decisions that have no clear owner, and escalation has become the way work gets done.',
    execution: 'People are willing, but agreed work slips because the system doesn\'t give it an owner, capacity or follow-through.',
    leverage: 'Your people appear capable and willing. The system around them doesn\'t carry the work, so they are compensating for it by hand.',
    centralized: 'People are accountable for outcomes without the authority to make the decisions those outcomes require, so they check before acting.',
    talent: 'The system pulls your most capable people into rescue work, so the problems that need them most get whoever is free.',
    trust: 'The system runs on filtered information, because raising a problem or disagreeing carries a cost. Everything else is downstream of that.',
    information: 'People are ready to decide, but the information they need sits somewhere else in the system, so they wait or escalate.',
    capability: 'Decisions were handed down without the skill or practice to make them well, so they keep coming back up.',
    conflict_avoidance: 'The system runs on decisions nobody really tested, because disagreeing in the room feels riskier than working around it later.',
    blame: 'The system makes problems expensive to report, because the first question is who. So problems surface late and sideways.',
    loss: 'The organization is carrying something it hasn\'t talked about, and the system is absorbing it as slowness.',
    pressure: 'The system rewards hitting the number more than raising a problem, so people protect the number and the problems go quiet.',
  },
  PB: {
    centralized: 'People are working hard, but the authority to act on what matters hasn\'t reached them, so effort turns into escalation.',
    talent: 'People are working hard. Your best people are on the wrong problems, so the effort isn\'t landing where the business needs it.',
    trust: 'People are working hard and saying little. What the business needs to hear isn\'t reaching it, because it isn\'t safe to say.',
    direction: 'People are working hard toward different versions of what matters, because leadership holds different versions too.',
    focus: 'People are working hard across more priorities than the business can actually use, and nobody has been told what to stop.',
    economics: 'People are working hard on priorities chosen by advocacy rather than value, so effort isn\'t translating into results.',
    capability: 'People want to deliver what matters but haven\'t been shown how the important decisions are made.',
    conflict_avoidance: 'People are working toward a priority that sounds agreed but isn\'t, because the disagreement was never had out loud.',
    blame: 'People are working hard to avoid being the one blamed, which is not the same as working on what matters.',
    loss: 'People are carrying a loss into the work. What looks like a gap between effort and results may be grief.',
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
    diagnosis: 'Important decisions aren\'t clearly held: either nobody owns them, or too many people have to say yes. Either way they wait. They travel upward, management becomes the bottleneck, and leaders spend their time on decisions that should have been made two levels down. The organization reads this as caution. It is the absence of decision rights.',
    chain: ['Decision rights are unclear', 'People escalate to be safe', 'Management becomes a bottleneck', 'Execution slows', 'Leaders spend more time firefighting', 'Less capacity for strategic work'],
    forces: ['Decision authority is unclear, so escalation is the rational choice.', 'Leaders intervene before teams have a chance to solve problems.', 'People are accountable for outcomes without equivalent authority.', 'Existing processes quietly reward escalation over judgment.'],
    consequences: ['Slower decisions', 'Management capacity', 'Delayed revenue'],
    leverage: ['Strategy', 'Talent', 'Customers'],
    blind: 'Your organization may have normalised management intervention as part of how work gets done.',
    notDo: { t: 'Don\'t fix this by adding another approval layer.', d: 'Your answers suggest the problem is not insufficient control. It is unclear decision ownership. Adding governance would increase the friction.' },
    policy: 'Move decisions to the lowest competent level, explicitly.',
    move: { t: 'Fix the five decisions that escalate most.', steps: ['Identify the five decisions that most frequently reach senior leadership.', 'For each one write down: who recommends, who decides, who must be consulted, what information is required, what guardrails apply, and when it is reviewed.', 'Move each decision to the lowest competent level, and tell the people who used to make it that they no longer do.'] },
    question: 'Which of our important decisions wait because it isn\'t clear who makes them, or because too many people have to say yes?',
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
  conflict_avoidance: {
    reading: [
      bk('lencioni', 'Artificial harmony: a team that never argues has not agreed; it has postponed the argument into the work. Lencioni\'s point is that commitment only follows conflict. A meeting that ends with everyone nodding and nobody changing their mind is the signature of a team that has learned agreeing is how you show respect.'),
      bk('conscious', 'Candour is a commitment, and so is its absence. The authors describe how much energy a team spends withholding: saying what is safe in the room and what is true in the corridor. The fix is not a technique. It is one person saying the true thing out loud, first, and the others noticing that nothing bad happened.'),
    ],
    constraint: 'Disagreement is avoided rather than worked through',
    diagnosis: 'The leadership team agrees in the room and diverges afterwards. Nobody wants to be the one who says no, so decisions sound firmer than they are, real objections surface later as slow execution or quiet workarounds, and the same discussion comes back. The team reads this as harmony. It is a disagreement that has not been had yet.',
    chain: ['Disagreeing feels unsafe or impolite', 'Objections stay unspoken in the room', 'Decisions sound firmer than they are', 'People act on their own version afterwards', 'The same question comes back', 'The team concludes it needs more alignment work'],
    forces: ['Agreeing is treated as a sign of respect, so disagreeing feels like disrespect.', 'The most senior person speaks first, and the room settles around them.', 'Nobody has seen an open disagreement end well, so nobody starts one.', 'Meetings end on time rather than on a decision everyone has actually tested.'],
    consequences: ['Slower decisions', 'Lost time', 'Employee frustration'],
    leverage: ['Strategy', 'Talent', 'Innovation'],
    blind: 'Your team may have learned that agreeing is how you show respect.',
    notDo: { t: 'Don\'t fix this with an alignment offsite.', d: 'More time agreeing produces more agreement that doesn\'t hold. The missing step is the disagreement, and it is cheaper to have it in a normal meeting than at an offsite.' },
    policy: 'Make disagreement a normal part of every decision, starting with the most senior person.',
    move: { t: 'Run one decision with a required objection.', steps: ['Pick the next real decision in your leadership meeting.', 'Before it is made, each person must state one way it could be wrong. The most senior person goes last.', 'Write the strongest objection next to the decision. Revisit it in thirty days.'] },
    question: 'What did someone in our last leadership meeting think and not say?',
    metric: { t: 'Objections voiced in the meeting before a decision is made', d: 'Count them for the next five decisions. Zero is the signal.' },
  },
  blame: {
    reading: [
      bk('conscious', 'Above the line, the question is "what can I learn from this?" Below the line, it is "who did this?" The authors\' first commitment is radical responsibility: each person asks what they did to create the situation before they ask what others did. When the first question in a room is "who", everyone learns to hide the problem rather than report it.'),
      bk('lencioni', 'Accountability sits near the top of the pyramid, above trust and conflict. Teams that blame are often trying to get accountability without the layers underneath it. The result is the opposite: people protect themselves, problems surface later, and the leader concludes that people won\'t take ownership.'),
    ],
    constraint: 'Problems are met with blame rather than ownership',
    diagnosis: 'When something goes wrong, the first move is to find who did it. So people learn to protect themselves: problems are reported late, framed carefully, or routed around the person who should hear them. Frustrations travel through third people. The organization experiences this as a lack of ownership, and the usual response, more accountability, makes it worse.',
    chain: ['Something goes wrong', 'The first question is who', 'People learn to protect themselves', 'Problems surface late and travel sideways', 'Leaders see a lack of ownership', 'Accountability is tightened, and blame grows'],
    forces: ['Leaders ask "who" before "what happened", and everyone notices the order.', 'Complaints about a person reach a third person before they reach the person.', 'Being wrong costs more than being late, so problems are reported late.', 'Nobody, starting with the leaders, says "this was mine" out loud.'],
    consequences: ['Slower decisions', 'Customer experience', 'Employee frustration'],
    leverage: ['Talent', 'Customers', 'Innovation'],
    blind: 'Your organization may have mistaken blame for accountability.',
    notDo: { t: 'Don\'t fix this with tighter accountability.', d: 'More consequences for mistakes teach people to hide mistakes. The missing piece is ownership, and ownership starts with a leader saying what they did to create the problem.' },
    policy: 'Lead with your own part, every time something goes wrong.',
    move: { t: 'Open the next post-mortem with your own part.', steps: ['The next time something goes wrong, start the review by saying, out loud, what you did to create it.', 'Ask "what happened?" before "who?", and hold the order for the whole meeting.', 'For one month, any complaint about a person goes to that person first, starting with you.'] },
    question: 'What was our own part in the last thing that went wrong, and did anyone say it out loud?',
    metric: { t: 'Problems reported by the person closest to them, before anyone else finds them', d: 'Count them monthly. It should rise as the cost of reporting falls.' },
  },
  pressure: {
    reading: [
      bk('munger', 'Munger\'s rule is to look at the incentive before anything else. People rarely set out to cut corners; they respond to what the system pays for and what it punishes. When a number decides who is safe, the number gets hit, and whatever it was meant to measure stops mattering.'),
      bk('meadows', 'Meadows calls it seeking the wrong goal: a system produces exactly what its measures reward, even when that defeats the purpose. The fix is rarely more oversight. It is changing what gets counted, and what happens to the people who say the measure is wrong.'),
    ],
    constraint: 'Targets and incentives reward the wrong behaviour',
    diagnosis: 'The numbers people are measured on, and what happens when they miss them, have become the real strategy. People hit the target, or make it look hit, even when that means cutting corners, hiding problems or overriding a concern. Leaders see results and conclude the system works. The cost arrives later, and all at once.',
    chain: ['A target becomes the measure of a person', 'Missing it carries a real cost', 'People protect the number, not the purpose', 'Concerns that threaten the number go quiet', 'Leaders see the number and trust it', 'The cost arrives late, and large'],
    forces: ['Missing a number costs a person more than raising a problem costs the business.', 'People who hit their numbers by bending rules are held up as examples.', 'Concerns about quality or safety are treated as obstacles to the deadline.', 'Leaders see the dashboard, not how it was produced.'],
    consequences: ['Customer experience', 'Risk and reputation', 'Employee frustration'],
    leverage: ['Customers', 'Talent', 'Trust'],
    blind: 'Your best numbers may be where your biggest risk is hiding.',
    notDo: { t: 'Don\'t fix this by adding compliance checks on top of the same targets.', d: 'More oversight on top of the same pressure teaches people to hide the corners more carefully. Change what happens when someone misses a number, or raises a concern that threatens one.' },
    policy: 'Make it safe to miss a number for a good reason, and costly to hit one the wrong way.',
    move: { t: 'Look behind your best number.', steps: ['Pick the target your organization is proudest of hitting this year.', 'Ask three people who do the work, privately, what it took to hit it and what they would stop doing if the target went away.', 'For the next quarter, publicly back one person who missed a number for a good reason.'] },
    question: 'What would people stop doing tomorrow if their target disappeared, and is that what we want them doing?',
    metric: { t: 'Concerns raised that put a target at risk', d: 'Count them each month. If it stays at zero while every target is hit, the targets are winning.' },
  },
  loss: {
    reading: [
      bk('conscious', 'Feeling feelings is one of the commitments, and the authors are direct about why: emotions that are not felt do not go away, they go into the work. A leadership team that is carrying a loss and treating it as a performance problem will see slower decisions, flatter energy and more friction, and will try to fix them with structure.'),
      bk('coach', 'Bill Campbell started meetings with the people, not the agenda: how are you, really, and how is your family. His view was that you cannot get the best from people you do not know as people. After a loss, that is not a soft step before the real work. It is the real work.'),
    ],
    constraint: 'The organization is carrying a loss it hasn\'t processed',
    diagnosis: 'Something the organization cared about is gone, and it hasn\'t really been talked about. What looks like friction (slower decisions, low energy, people going through the motions) may be grief doing what grief does. Structural fixes applied now will feel like being asked to perform while it still hurts, and they will not work well until the loss has been named.',
    chain: ['The organization loses someone or something it cared about', 'It isn\'t named or talked about', 'People carry it into the work', 'Energy and pace drop', 'Leaders read it as a performance problem', 'Structural fixes land on people who are grieving'],
    forces: ['Moving on quickly is treated as strength.', 'Leaders are carrying the loss too, and have not said so.', 'There has been no moment where it was named together.', 'The work did not slow down, so the feeling went underground.'],
    consequences: ['Employee frustration', 'Talent risk', 'Lost time'],
    leverage: ['Talent', 'Capability building', 'Strategy'],
    blind: 'Your organization may be treating grief as a performance problem.',
    notDo: { t: 'Don\'t fix this with a structural change, yet.', d: 'A reorganisation, a new process or a performance push asks people to perform while it still hurts. Name the loss first. Most of what looked like friction often eases once it has been said out loud.' },
    policy: 'Name the loss before you change the structure.',
    move: { t: 'Name it together, before anything else.', steps: ['Say out loud, to the team, what was lost and that it matters. If you are carrying it too, say so.', 'Make room for people to talk about it: a facilitated session, or an unhurried meeting with no other agenda.', 'Then wait two or three weeks before any structural change, and notice what eases on its own.'] },
    question: 'What have we lost this year that we haven\'t yet talked about together?',
    metric: { t: 'Whether the loss has been named together, and what eased afterwards', d: 'Not a number. Notice energy, pace and how meetings feel in the month after.' },
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
      if (r['Number of escalations'] === 'up' && r['Decisions reopened after being made'] === 'down') return { text: 'Decision ownership improved, but decision quality did not: fewer escalations, more reopening. This points toward an information or capability constraint rather than decision rights alone.', delta: { decision_rights: .3, information: .8, capability: .6 }, weakened: 'the part of the read that said ownership alone would fix it' };
      if (r['Decision cycle time'] === 'up' && r['Decisions reopened after being made'] !== 'up') return { text: 'Decisions moved faster but are still being reopened. Ownership helped; the reopening points to leadership disagreement underneath.', delta: { decision_rights: .5, direction: .8 }, weakened: 'the part of the read that put the whole delay on ownership' };
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
  conflict_avoidance: { hypothesis: 'Disagreement is avoided, so decisions don\'t hold.',
    steps: ['For the next three decisions in your leadership meeting, each person states one way the decision could be wrong before it is made.', 'The most senior person speaks last, every time.', 'Write the strongest objection next to each decision and revisit it after thirty days.'],
    days: 30, watch: ['Objections voiced before decisions', 'Decisions reopened after being made', 'Things raised privately that were never raised in the meeting'],
    outcome: r => {
      if (r['Objections voiced before decisions'] === 'up' && r['Decisions reopened after being made'] !== 'up') return { text: 'People disagreed in the room and decisions still came back. The disagreement is real but it isn\'t only about candour; the priority underneath may not have been chosen.', delta: { conflict_avoidance: .3, direction: .8 } };
      return null;
    } },
  blame: { hypothesis: 'Problems are met with blame, so they surface late.',
    steps: ['Open the next review of something that went wrong with your own part, out loud.', 'Ask "what happened?" before "who?" for the whole meeting.', 'For a month, any complaint about a person goes to that person first, starting with you.'],
    days: 30, watch: ['Problems reported by the person closest to them', 'Complaints that went to a third person first', 'Time from problem noticed to problem raised'],
    outcome: r => {
      if (r['Problems reported by the person closest to them'] === 'up' && r['Time from problem noticed to problem raised'] !== 'up') return { text: 'People report more of their own problems, but still late. The cost of reporting has fallen; something else, perhaps how much they can act on, still slows it.', delta: { blame: .3, centralized: .5, information: .4 } };
      return null;
    } },
  pressure: { hypothesis: 'Targets reward the wrong behaviour, so problems that threaten the number go quiet.',
    steps: ['Pick the target the organization is proudest of hitting this year.', 'Ask three people who do the work, privately, what it took to hit it and what they would stop doing if it went away.', 'For the next quarter, publicly back one person who missed a number for a good reason, and say why.'],
    days: 60, watch: ['Concerns raised that put a target at risk', 'Corners people admit to cutting', 'Misses explained openly rather than hidden'],
    outcome: r => {
      if (r['Corners people admit to cutting'] === 'up' && r['Concerns raised that put a target at risk'] !== 'up') return { text: 'People admit the corners in private but still don\'t raise them in the open. The targets matter, and so does the cost of speaking up; this may be as much about safety to speak as about the targets.', delta: { pressure: .4, trust: .7 } };
      return null;
    } },
  loss: { hypothesis: 'The organization is carrying a loss that hasn\'t been named.',
    steps: ['Name the loss to the team, out loud, and say that it matters. Include your own part of it if you are carrying it too.', 'Make unhurried room for people to talk about it, with someone from outside the leadership team to facilitate. Get support for yourself first if you are carrying it too.', 'Wait two or three weeks before any structural change, and notice what eases on its own.'],
    days: 30, watch: ['Energy and pace in meetings', 'Whether people talk about the loss openly', 'Friction that eased without any structural change'],
    outcome: r => {
      if (r['Friction that eased without any structural change'] === 'up') return { text: 'Some of the friction eased once the loss was named. That part was grief, not structure. Run Friction again to see what is left.', delta: { loss: 1.0 } };
      if (r['Whether people talk about the loss openly'] === 'up' && r['Friction that eased without any structural change'] !== 'up') return { text: 'The loss is being talked about and the friction hasn\'t eased. It may be structural after all. Run Friction again; it will start from there.', delta: { loss: -.6 } };
      return null;
    } },
};

// ---------- Economic shadow: what the operating profile suggests ----------
// Rules only. Financial ranges are optional. Never presented as fact.
export const ECON_READS = [
  { when: (p, f) => p.loss >= .55, t: null },
  { when: (p, f) => p.trust >= .6 && p.trust >= Math.max(p.centralized, p.leverage, p.focus),
    t: 'The cost of this friction is problems that reach you late.', d: 'When it isn\'t safe to raise a problem, the organization pays for it at the most expensive moment: after the customer, the auditor or the market has noticed.', conf: 'Moderate' },
  { when: (p, f) => p.blame >= .6,
    t: 'Blame makes problems expensive to report, so they are found later and cost more.', d: 'The visible cost is the incident. The larger cost is the time between someone noticing a problem and someone being willing to say so.', conf: 'Emerging' },
  { when: (p, f) => p.conflict_avoidance >= .6,
    t: 'Disagreement that isn\'t had in the room is had in the work.', d: 'It shows up as duplicated effort, decisions reopened, and plans quietly executed differently from what was agreed.', conf: 'Emerging' },
  { when: (p, f) => p.talent >= .6 && p.talent >= Math.max(p.leverage, p.centralized),
    t: 'Your scarcest resource is your best people\'s time, and it is going to fires.', d: 'The cost is not the fires. It is the growth work that gets whoever is free.', conf: 'Moderate' },
  { when: (p, f) => p.leverage >= .6 && ['Loss-making', 'Break-even', '1–5%'].includes(f.profit),
    t: 'At the profitability you gave, manual work and rework are a likely place the margin is going.', d: 'Performance that depends on people working around the system costs labour hours that never appear as a line item.', conf: 'Moderate' },
  { when: (p, f) => p.leverage >= .6 && ['10–20%', '20%+'].includes(f.profit),
    t: 'Margin is holding despite the friction, which usually means heroics are absorbing it.', d: 'That holds until growth adds volume to a process that already needs manual rescue.', conf: 'Moderate' },
  { when: (p, f) => Math.max(p.centralized, p.decision_rights, p.information) >= .6,
    t: 'The scarce resource is leadership capacity, and the cost shows up as delay long before it shows up in the results.', d: 'Decisions that wait cost the work behind them. The illustrative estimate, if you gave one, is the visible part.', conf: 'Moderate' },
  { when: (p, f) => Math.max(p.focus, p.execution) >= .6,
    t: 'Results are likely being delayed rather than lost.', d: 'Commitments that slip push outcomes to later quarters. They usually recover when the number of concurrent priorities falls.', conf: 'Emerging' },
];

// Expected vs observed on the operating traits the answers can actually see. Qualitative on purpose:
// numeric benchmarks need real data by industry and size, and this file does not invent them.
export const PROFILE_ROWS = [
  { k: 'Dependence on specific people', expected: 'Low to moderate', good: ['Low', 'Moderate'], hyps: ['centralized', 'leverage'], floor: 'High', from: ['leverage', 'repeat', 'overrule', 'given', 'self'], observe: p => Math.max(p.centralized, p.leverage) >= .65 ? 'High' : Math.max(p.centralized, p.leverage) >= .45 ? 'Moderate' : 'Low' },
  { k: 'Decision latency', expected: 'Days, not weeks', good: ['Low'], hyps: ['decision_rights', 'information'], floor: 'Moderate', from: ['decisions', 'comeback', 'waiting', 'given', 'analysis'], observe: p => Math.max(p.decision_rights, p.information) >= .65 ? 'High' : Math.max(p.decision_rights, p.information) >= .45 ? 'Moderate' : 'Low' },
  { k: 'Priority load', expected: 'A handful, with a stop-doing list', good: ['Low'], hyps: ['focus'], floor: 'Moderate', from: ['focus', 'execution_why', 'business_uncertainty'], observe: p => p.focus >= .65 ? 'High' : p.focus >= .45 ? 'Moderate' : 'Low' },
  { k: 'Rework and workarounds', expected: 'Rare, and traced to cause', good: ['Low'], hyps: ['leverage'], floor: 'Moderate', from: ['leverage', 'repeat', 'execution_why'], observe: p => p.leverage >= .65 ? 'High' : p.leverage >= .45 ? 'Moderate' : 'Low' },
  { k: 'Candour', expected: 'Problems raised early', good: ['High'], hyps: ['trust', 'conflict_avoidance', 'blame', 'pressure'], floor: 'Mixed', from: ['trust', 'trust_last', 'conflict', 'blame_first', 'gossip', 'missed', 'rulebreak', 'collide'], observe: p => Math.max(p.trust, p.conflict_avoidance, p.blame, p.pressure) >= .65 ? 'Low' : Math.max(p.trust, p.conflict_avoidance, p.blame, p.pressure) >= .45 ? 'Mixed' : 'High' },
];
export const LOW_FRICTION = {
  name: 'No clear constraint',
  summary: 'Your answers didn\'t point to a constraint.',
  detail: 'That doesn\'t rule one out. It means nothing you described rose above a weak signal, and this is a reading of your own answers. The most useful next step is to ask two or three people who report to you the same questions and see whether their answers match yours.',
  watch: 'Run Friction again in a quarter, and ask someone who reports to you to run it too. If both pictures match, you can trust it more.',
};


// When the belief is low but the person gave answers that usually point to a problem, the page says so instead.
export const LOW_MIXED = {
  name: 'No single constraint stood out',
  summary: 'But some of your answers usually mean something, and they are worth a second look before you conclude nothing is wrong.',
  detail: 'Leaders tend to describe their organizations more favourably than the people who work in them do. That isn\'t a flaw in you; it is where you sit. The most useful next step is to ask two or three people who report to you the same questions and compare.',
  watch: 'Ask two or three people who report to you to run Friction. Where their answers differ from yours is where to look first.',
};
// How answers are weighed. Leaders over-report health, so reassuring answers about general impressions count for less than
// reassuring answers about something that actually happened. Admissions about your own part, and problems described
// through something that actually happened, count for more.
export const SELF_REPORT = { reassuringImpression: .6, admission: 1.25, event: 1.2 };

export const OUTCOME_OPTIONS = [ { key: 'up', t: 'Improved' }, { key: 'same', t: 'No change' }, { key: 'down', t: 'Worse' } ];

// ---------- Critic-facing structure per hypothesis ----------
// The causal chain, stage by stage: where the friction originates, how it transmits, where it amplifies, what it costs.
// Labels line up one-to-one with PLAYBOOKS[h].chain.
export const CHAIN_STAGES = {
  direction:       ['BUSINESS', 'BUSINESS', 'PEOPLE', 'EXECUTION', 'SYSTEM', 'ECONOMICS'],
  focus:           ['BUSINESS', 'SYSTEM', 'EXECUTION', 'EXECUTION', 'BUSINESS', 'ECONOMICS'],
  economics:       ['BUSINESS', 'BUSINESS', 'SYSTEM', 'ECONOMICS', 'MANAGEMENT', 'ECONOMICS'],
  decision_rights: ['SYSTEM', 'PEOPLE', 'MANAGEMENT', 'EXECUTION', 'MANAGEMENT', 'ECONOMICS'],
  information:     ['SYSTEM', 'PEOPLE', 'EXECUTION', 'MANAGEMENT', 'SYSTEM', 'SYSTEM'],
  execution:       ['BUSINESS', 'SYSTEM', 'PEOPLE', 'EXECUTION', 'MANAGEMENT', 'ECONOMICS'],
  leverage:        ['SYSTEM', 'PEOPLE', 'MANAGEMENT', 'PEOPLE', 'SYSTEM', 'ECONOMICS'],
  centralized:     ['MANAGEMENT', 'PEOPLE', 'SYSTEM', 'EXECUTION', 'MANAGEMENT', 'PEOPLE'],
  capability:      ['MANAGEMENT', 'EXECUTION', 'MANAGEMENT', 'PEOPLE', 'PEOPLE', 'BUSINESS'],
  talent:          ['MANAGEMENT', 'PEOPLE', 'BUSINESS', 'ECONOMICS', 'PEOPLE', 'ECONOMICS'],
  trust:           ['PEOPLE', 'MANAGEMENT', 'SYSTEM', 'EXECUTION', 'PEOPLE', 'PEOPLE'],
  conflict_avoidance: ['PEOPLE', 'MANAGEMENT', 'SYSTEM', 'EXECUTION', 'MANAGEMENT', 'BUSINESS'],
  blame:           ['MANAGEMENT', 'PEOPLE', 'PEOPLE', 'SYSTEM', 'MANAGEMENT', 'PEOPLE'],
  pressure:        ['BUSINESS', 'MANAGEMENT', 'PEOPLE', 'PEOPLE', 'MANAGEMENT', 'ECONOMICS'],
  loss:            ['BUSINESS', 'PEOPLE', 'PEOPLE', 'EXECUTION', 'MANAGEMENT', 'PEOPLE'],
};
export const STAGE_ROLE = { 0: 'Origin', 1: 'Transmission', 2: 'Transmission', 3: 'Amplification', 4: 'Amplification', 5: 'Consequence' };

// ---------- The blind spot as a real secondary hypothesis ----------
// Each one states what the cheapest test would show if it is true and if it is false, so it can lose.
// The result is evidence in the belief (held / didn't hold), and if it holds, the experiment changes:
// an extra step and an extra thing to watch. Untested until the person reports the result.
export const BLIND_SPOTS = {
  direction: {
    test: 'Ask each leader, separately, to write the top three. Count the distinct lists.',
    ifTrue: 'You get three or more different lists, and each leader is confident theirs is the shared one.',
    ifFalse: 'The lists match on at least two of three items, and the differences are about wording, not direction.',
    held: { direction: .9, focus: .3 }, notHeld: { direction: -1.0, execution: .3 },
    step: 'Before the three-things session, show each leader the other lists. The exercise is not to agree; it is to see that they had not.',
    watch: 'Leaders who revise their own list after seeing the others',
  },
  focus: {
    test: 'Ask three managers to name one thing that was formally stopped this year. Count the silences.',
    ifTrue: 'Nobody can name one, or they name something that quietly faded rather than something that was decided.',
    ifFalse: 'At least two name a specific stop, with a date and a reason.',
    held: { focus: .9, execution: .2 }, notHeld: { focus: -.9, direction: .3 },
    step: 'Announce the stop-doing list as a decision, with a date, in the same channel used for new priorities.',
    watch: 'Stopped items that quietly restart',
  },
  economics: {
    test: 'Ask three people which of the top five priorities makes the most money. Compare the answers.',
    ifTrue: 'Three different answers, or "all of them", or "that\'s not how we think about it."',
    ifFalse: 'The same answer twice, with a reason that mentions customers, margin or cash.',
    held: { economics: .9, information: .2 }, notHeld: { economics: -.9, focus: .3 },
    step: 'Publish the five value lines to everyone delivering them, not only to leadership.',
    watch: 'People below leadership who can name the value driver of their own work',
  },
  decision_rights: {
    test: 'Pick the last three stalled decisions and ask who owned each. Count the shrugs.',
    ifTrue: 'At least two of three get a shrug, two names, or "it depends."',
    ifFalse: 'Each gets one name, and the name matches who actually moved it.',
    held: { decision_rights: .9, centralized: .2 }, notHeld: { decision_rights: -1.0, information: .4 },
    step: 'Publish the three decision rights where the stalls happen, not in a governance document.',
    watch: 'Decisions still routed to the old owner after publication',
  },
  information: {
    test: 'Take the last decision that waited "for data". Ask whether the data existed somewhere at the time.',
    ifTrue: 'It existed. Someone had it, or a system had it, and it did not reach the decider in time.',
    ifFalse: 'It did not exist, or it existed but would not have settled the question.',
    held: { information: .9, decision_rights: .2 }, notHeld: { information: -1.0, economics: .4 },
    step: 'Name the person who had the fact and the person who needed it, and connect them directly for the next instance.',
    watch: 'Decisions made on the first pass without a second request for data',
  },
  execution: {
    test: 'List last quarter\'s commitments. Mark the ones that happened. Ask what happened to the rest.',
    ifTrue: 'Nobody asked. The rest were quietly re-planned or forgotten, without a decision.',
    ifFalse: 'Each slip has a reason and a decision attached: stopped, delayed on purpose, or replaced.',
    held: { execution: .9, focus: .3 }, notHeld: { execution: -.9, focus: .4 },
    step: 'Review the three protected commitments in public every two weeks, and record any slip as a decision, not an event.',
    watch: 'Slips that were decided versus slips that just happened',
  },
  leverage: {
    test: 'Ask the three most relied-upon people what they do by hand that the process should do.',
    ifTrue: 'Each names several things without hesitating, and nobody above them knew.',
    ifFalse: 'They struggle to name one, or the ones they name are already known and scheduled.',
    held: { leverage: .9, talent: .3 }, notHeld: { leverage: -1.0, execution: .3 },
    step: 'Give the person who did the workaround the job of designing its replacement, and the time to do it.',
    watch: 'New workarounds appearing as old ones are removed',
  },
  centralized: {
    test: 'Ask three managers which decisions they believe they own without escalation. Compare with what you believe they own.',
    ifTrue: 'Their lists are shorter than yours, or empty, and they are not surprised by the difference.',
    ifFalse: 'The lists match, and they can name a decision they made this month that you did not see.',
    held: { centralized: .9, capability: -.3 }, notHeld: { centralized: -1.0, decision_rights: .5 },
    step: 'Tell the former approvers, by name, that they no longer approve those two decisions, and tell the managers that you have told them.',
    watch: 'Decisions quietly re-escalated in the first two weeks',
  },
  capability: {
    test: 'Ask a manager who "isn\'t ready" what they have been shown about how the decision is made. Listen for "nothing".',
    ifTrue: 'They describe being told the outcome was wrong, never how the decision should have been weighed.',
    ifFalse: 'They describe a specific walk-through, a debrief, or a rule of thumb someone gave them.',
    held: { capability: .9, centralized: .2 }, notHeld: { capability: -1.0, centralized: .5 },
    step: 'Write down the three things you weigh when you make this decision, and give them the page before the first coached instance.',
    watch: 'Debriefs that name a judgment, not a mistake',
  },
  talent: {
    test: 'Pull last week\'s calendars for your five best people. Mark the hours on the top three priorities.',
    ifTrue: 'Under a third of their hours, and most of the rest is unplanned.',
    ifFalse: 'Half or more, and the rest is planned work they chose.',
    held: { talent: .9, leverage: .2 }, notHeld: { talent: -1.0, focus: .4 },
    step: 'Name who takes the fires that used to go to your best people, before you move the time.',
    watch: 'Fires that still find their way to the best people',
  },
  trust: {
    test: 'Ask three people, privately, what they would say in the leadership meeting if there were no cost. Note what they haven\'t said.',
    ifTrue: 'Each has at least one thing, and at least one of them names something you had not heard.',
    ifFalse: 'They have little to add, and what they have they have already said in the room.',
    held: { trust: .9, information: .2 }, notHeld: { trust: -1.0, centralized: .4 },
    step: 'Raise one of the unsaid things yourself in the next meeting, without naming who said it, and act on it.',
    watch: 'Things said in the meeting that were previously only said privately',
  },
  conflict_avoidance: {
    test: 'In your next three leadership meetings, count how many times someone changes their mind because of what another person said.',
    ifTrue: 'Zero or one. Decisions land where the most senior person started.',
    ifFalse: 'Several, and at least one decision ended somewhere nobody proposed at the start.',
    held: { conflict_avoidance: .9, trust: .2 }, notHeld: { conflict_avoidance: -1.0, direction: .4 },
    step: 'Before each decision, ask the quietest person what they think first.',
    watch: 'Decisions that changed because of what was said in the room',
  },
  blame: {
    test: 'Think of the last three things that went wrong. Who said "this was mine" first, and how long did it take?',
    ifTrue: 'Nobody, or only after it was found. The first conversation was about who.',
    ifFalse: 'Someone said it early, without being asked, and nothing bad happened to them.',
    held: { blame: .9, trust: .3 }, notHeld: { blame: -1.0, decision_rights: .3 },
    step: 'Say "this was mine" yourself, first, about something real, in front of the team.',
    watch: 'People who name their own part without being asked',
  },
  pressure: {
    test: 'Ask the person closest to your best number, privately: "What would you stop doing if this target went away?"',
    ifTrue: 'They name something the business shouldn\'t be doing, or hesitate before they answer.',
    ifFalse: 'They name nothing they\'d stop, and the way they hit it is how you would want it hit.',
    held: { pressure: .9, trust: .3 }, notHeld: { pressure: -1.0, economics: .3 },
    step: 'Put one measure next to the target that counts how it was hit, not only whether.',
    watch: 'Corners people admit to cutting',
  },
  loss: {
    test: 'Ask two people you trust, privately: "Have we really talked about what happened?"',
    ifTrue: 'They pause, and then they talk. Something hasn\'t been said.',
    ifFalse: 'They answer quickly and easily, and point to a time it was talked about openly.',
    held: { loss: .9 }, notHeld: { loss: -1.0 },
    step: 'Bring in a facilitator for the conversation, so the leaders can take part rather than run it.',
    watch: 'Whether people speak about the loss in their own words',
  },
};
export const BLIND_RESULT_OPTIONS = [
  { key: 'held', t: 'It held' },
  { key: 'notHeld', t: 'It didn\'t hold' },
  { key: 'skipped', t: 'Didn\'t run it' },
];


// What not to do, as a counterfactual: if the read is right, the sensible-looking fix should make it worse.
export const COUNTERFACTUALS = {
  direction:       { should: 'communicating the strategy more clearly', worse: 'produce three clearer versions of three strategies', because: 'the evidence points to a choice not made, not a message not sent' },
  focus:           { should: 'a prioritisation framework', worse: 'produce a ranked list of everything you already have', because: 'the evidence points to nothing being stopped, not to a lack of ranking' },
  economics:       { should: 'more reporting', worse: 'add measurement without adding a decision', because: 'the evidence points to value drivers never made explicit, not to missing numbers' },
  decision_rights: { should: 'adding another approval layer', worse: 'slow the next decision further', because: 'the evidence points to unclear ownership, not insufficient oversight' },
  information:     { should: 'a dashboard', worse: 'show everything to everyone and route nothing', because: 'the evidence points to a specific fact not reaching a specific decision' },
  execution:       { should: 'a tighter tracking cadence', worse: 'show the slippage in higher resolution', because: 'the evidence points to commitments made without capacity, not to weak monitoring' },
  leverage:        { should: 'hiring more of the people who make it happen', worse: 'scale the workaround', because: 'the evidence points to a process that doesn\'t carry the work, not to a shortage of heroes' },
  centralized:     { should: 'an empowerment programme', worse: 'tell people they are empowered while the next decision still gets reversed', because: 'the evidence points to authority withheld in practice, not to people unaware of it' },
  capability:      { should: 'pushing the decisions down again', worse: 'produce the same result and make the conclusion permanent', because: 'the evidence points to decisions never taught, not to people unwilling' },
  talent:          { should: 'hiring more senior people', worse: 'add talent that will be spent the same way', because: 'the evidence points to how the best people\'s time is allocated, not to how much talent exists' },
  trust:           { should: 'an anonymous survey', worse: 'confirm to everyone that speaking directly is unsafe', because: 'the evidence points to what happens when someone speaks, not to a lack of channels' },
  conflict_avoidance: { should: 'an alignment offsite', worse: 'produce more agreement that doesn\'t hold', because: 'the evidence points to a disagreement that hasn\'t been had, not to a lack of time together' },
  blame:           { should: 'tighter accountability', worse: 'teach people to hide problems longer', because: 'the evidence points to the cost of reporting a problem, not to a lack of consequences' },
  pressure:        { should: 'stricter controls and compliance', worse: 'teach people to hide the corners more carefully', because: 'the evidence points to what the targets reward, not to a lack of oversight' },
  loss:            { should: 'a structural change', worse: 'ask people to perform while it still hurts', because: 'the evidence points to a loss that hasn\'t been named, not to a broken structure' },
};

// The experiment as the Actor sees it: action, target, expected effect. Steps and watch stay in EXPERIMENTS.
export const EXPERIMENT_SPECS = {
  direction:       { action: 'Choose one list', target: 'The leadership team', expected: ['↓ distinct top priorities', '↓ reopened decisions', '↓ conflicting requests'] },
  focus:           { action: 'Stop the bottom fifth', target: 'Every active priority', expected: ['↑ capacity on the top three', '↑ agreed work delivered', 'little gets worse'] },
  economics:       { action: 'Trace priorities to value', target: 'Your top five priorities', expected: ['↑ priorities with a named driver', '↑ resource shifts on economics', '↓ analysis that changes nothing'] },
  decision_rights: { action: 'Define decision rights', target: '3 recurring decisions', expected: ['↓ decision latency', '↓ escalation', '↓ reopened decisions'] },
  information:     { action: 'Design one information path', target: 'The decision that waits most', expected: ['↓ time for facts to arrive', '↓ decision latency', '↓ requests for more analysis'] },
  execution:       { action: 'Protect three commitments', target: 'This quarter\'s commitments', expected: ['↑ delivered as committed', '↓ mid-quarter re-planning', 'blockers named early'] },
  leverage:        { action: 'Design out one workaround', target: 'The biggest manual step', expected: ['↓ hours on workarounds', '↓ recurrences', 'results hold when the key person is away'] },
  centralized:     { action: 'Move decisions down one level', target: '2 of the 5 most-escalated decisions', expected: ['↓ decision cycle time', '↓ escalations', '↑ leadership hours recovered'] },
  capability:      { action: 'Coach one decision across', target: 'One manager, one recurring decision', expected: ['↑ decisions made below the top', '↓ rework on delegated decisions', '↑ leadership hours recovered'] },
  talent:          { action: 'Reallocate your best people\'s week', target: 'Your five most capable people', expected: ['↑ top-talent time on top priorities', '↑ fires handled by others', 'progress on the protected problem'] },
  trust:           { action: 'Change one meeting', target: 'The main leadership meeting', expected: ['↑ problems raised before incidents', '↓ time from noticed to raised', '↑ disagreements voiced'] },
  conflict_avoidance: { action: 'Require one objection per decision', target: 'The next three leadership decisions', expected: ['↑ objections voiced in the room', '↓ decisions reopened', '↓ things said only privately'] },
  blame:           { action: 'Lead with your own part', target: 'The next review of something that went wrong', expected: ['↑ problems reported by the person closest', '↓ complaints routed through third people', '↓ time to raise a problem'] },
  pressure:        { action: 'Look behind your best number', target: 'The target you are proudest of', expected: ['↑ concerns raised that put a target at risk', '↑ corners admitted', '↑ misses explained openly'] },
  loss:            { action: 'Name the loss together', target: 'The whole team', expected: ['↑ energy and pace', 'the loss is talked about openly', 'some friction eases without structural change'] },
};

// Which expected-vs-observed rows are primary signals for each read. Others are shown as "not a primary signal".
export const PROFILE_PRIMARY = {
  direction:       ['Priority load'],
  focus:           ['Priority load'],
  economics:       ['Priority load'],
  decision_rights: ['Decision latency'],
  information:     ['Decision latency'],
  execution:       ['Priority load', 'Decision latency'],
  leverage:        ['Rework and workarounds', 'Dependence on specific people'],
  centralized:     ['Decision latency', 'Dependence on specific people'],
  capability:      ['Decision latency'],
  talent:          ['Dependence on specific people'],
  trust:           ['Candour'],
  conflict_avoidance: ['Candour'],
  blame:           ['Candour'],
  pressure:        ['Candour'],
  loss:            [],
};

// ---------- The causal model: a Bayesian network over the eleven hypotheses ----------
// Each node is a binary state ("this is happening"). Roots carry a prior. Children use a noisy-OR:
// P(child | parents) = 1 − (1 − leak) × Π over true parents of (1 − strength).
// The signal weights on answer options are treated as log likelihood ratios against these states,
// so every piece of content tuned so far carries over unchanged.
export const MODEL_VERSION = '5.1';
export const NETWORK = {
  direction:       { prior: .18, parents: {} },
  economics:       { prior: .18, parents: {} },
  capability:      { prior: .16, parents: {} },
  trust:           { prior: .18, parents: {} },
  loss:            { prior: .08, parents: {} },
  pressure:        { prior: .12, parents: {} },
  focus:           { leak: .08, parents: { direction: .35, economics: .25 } },
  information:     { leak: .09, parents: { economics: .2, trust: .25, pressure: .15 } },
  decision_rights: { leak: .10, parents: { direction: .25, trust: .12 } },
  conflict_avoidance: { leak: .09, parents: { trust: .35 } },
  blame:           { leak: .08, parents: { trust: .3, pressure: .3 } },
  centralized:     { leak: .06, parents: { decision_rights: .3, capability: .35, trust: .2 } },
  execution:       { leak: .08, parents: { focus: .4, decision_rights: .25, information: .15, conflict_avoidance: .3 } },
  leverage:        { leak: .10, parents: { execution: .25, decision_rights: .2 } },
  talent:          { leak: .09, parents: { leverage: .35, focus: .25 } },
};
export const NETWORK_ORDER = ['direction', 'economics', 'capability', 'trust', 'loss', 'pressure', 'focus', 'information', 'decision_rights', 'conflict_avoidance', 'blame', 'centralized', 'execution', 'leverage', 'talent'];
// Answers about the same thing are correlated, so their evidence is tempered and capped per hypothesis
// rather than multiplied as if each were independent. Experiment results are not tempered.
export const EVIDENCE = { temper: .6, capPos: 3.2, capNeg: -2.4 };

// ---------- The decision model ----------
// Each intervention relieves its own hypothesis fully and others partly (its causal children, mostly).
// Expected value = Σ_h P(h) × relief × importance − cost. The experiment is the highest-EV intervention,
// which need not be the most probable hypothesis: fixing the upstream cause can be worth more.
export const INTERVENTIONS = {
  direction:       { relief: { direction: 1.0, focus: .25, decision_rights: .15, execution: .10 }, cost: .06, effort: 'A leadership session and a published list' },
  focus:           { relief: { focus: 1.0, execution: .25, talent: .15 }, cost: .05, effort: 'Stopping a fifth of the active priorities' },
  economics:       { relief: { economics: 1.0, focus: .20, information: .15 }, cost: .05, effort: 'Five one-line value traces' },
  decision_rights: { relief: { decision_rights: 1.0, centralized: .30, execution: .20, leverage: .10 }, cost: .04, effort: 'Three decisions written up and published' },
  information:     { relief: { information: 1.0, execution: .15 }, cost: .04, effort: 'One information path designed and tested' },
  execution:       { relief: { execution: 1.0, leverage: .20, talent: .10 }, cost: .06, effort: 'Three protected commitments for a quarter' },
  leverage:        { relief: { leverage: 1.0, talent: .30, execution: .10 }, cost: .06, effort: 'One workaround designed into the process' },
  centralized:     { relief: { centralized: 1.0, decision_rights: .15, execution: .15, capability: -.10 }, cost: .05, effort: 'Two decisions moved down for thirty days' },
  capability:      { relief: { capability: 1.0, centralized: .30 }, cost: .07, effort: 'Four coached instances of one decision' },
  talent:          { relief: { talent: 1.0, leverage: .15 }, cost: .05, effort: 'One week audited, one block moved' },
  trust:           { relief: { trust: 1.0, information: .25, centralized: .15, decision_rights: .10 }, cost: .07, effort: 'One meeting changed, every week, for a quarter' },
  conflict_avoidance: { relief: { conflict_avoidance: 1.0, direction: .2, decision_rights: .1 }, cost: .05, effort: 'One objection per decision, three decisions' },
  blame:           { relief: { blame: 1.0, trust: .2, information: .1 }, cost: .06, effort: 'Your own part, said first, for a month' },
  pressure:        { relief: { pressure: 1.0, blame: .2, trust: .15, information: .1 }, cost: .06, effort: 'One target examined, one miss backed in public' },
  loss:            { relief: { loss: 1.0, trust: .1 }, cost: .04, effort: 'One unhurried conversation, then wait' },
};

// ---------- The actor's economics ----------
// A question costs attention. Value of information has to beat that cost before a question is worth asking.
export const QUESTION_COST = { base: .006, multi: .004 };
export const VOI = { minToAsk: .008, infoGainWeight: .06 };
