// Friction v2 — content
// What the user sees: three lenses (Business, System, People).
// What the engine uses: nine mechanisms, three per lens, scored 0 (fine) to 3 (severe).
//   Business: direction, focus, economics
//   System:   decisions, execution, leverage
//   People:   authority, talent, trust
// The reading behind the playbooks (Buffett, Munger, Grove, Schmidt, Campbell, Charan, Rumelt)
// shapes the content and is never named to the user.

export const LENSES = {
  B: { key: 'B', name: 'Business', line: 'Do you know what matters?', mechs: ['direction', 'focus', 'economics'] },
  S: { key: 'S', name: 'System',   line: 'Can the organization execute?', mechs: ['decisions', 'execution', 'leverage'] },
  P: { key: 'P', name: 'People',   line: 'Can people act on it?', mechs: ['authority', 'talent', 'trust'] },
};
export const MECH_LENS = { direction: 'B', focus: 'B', economics: 'B', decisions: 'S', execution: 'S', leverage: 'S', authority: 'P', talent: 'P', trust: 'P' };

export const STAGES = [
  { code: '01', name: 'Business' },
  { code: '02', name: 'System' },
  { code: '03', name: 'People' },
  { code: '04', name: 'Follow-ups' },
  { code: '05', name: 'Inversion' },
  { code: '06', name: 'Diagnosis' },
];

// Option shape: { t, s: severity for this question's mechanism, side: {mech: bump}, e: {edge: bump}, force: 'text', tag }
const o = (t, s, extra = {}) => ({ t, s, ...extra });

export const CORE = [
  {
    id: 'direction', stage: 0, lens: 'B', mech: 'direction', type: 'single',
    eyebrow: 'Business · Do you know what matters?',
    title: 'If you asked your leadership team to name the three most important things the business needs to accomplish right now, how similar would their answers be?',
    options: [o('Almost identical', 0), o('Mostly similar', 1), o('Quite different', 2), o('Very different', 3)],
  },
  {
    id: 'focus', stage: 0, lens: 'B', mech: 'focus', type: 'single',
    eyebrow: 'Business · Do you know what matters?',
    title: 'If you had to eliminate 20% of your current priorities tomorrow, would you know what to stop?',
    options: [o('Definitely', 0), o('Probably', 1), o('Not really', 2), o('No idea', 3)],
  },
  {
    id: 'economics', stage: 0, lens: 'B', mech: 'economics', type: 'single',
    eyebrow: 'Business · Do you know what matters?',
    title: 'How clearly can you connect your biggest priorities to the things that create financial value?',
    options: [o('Very clearly', 0), o('Mostly clearly', 1), o('Somewhat', 2), o('Not clearly', 3)],
  },
  {
    id: 'decisions', stage: 1, lens: 'S', mech: 'decisions', type: 'single',
    intro: { kicker: 'Now the machine.', line: 'Not whether the strategy is right, but whether the organization can turn it into reality.' },
    eyebrow: 'System · Can the organization execute?',
    title: 'When an important decision gets stuck, what is usually the reason?',
    options: [
      o('Nobody clearly owns it', 3, { detail: 'owner', e: { SP: .5 }, force: 'Important decisions have no explicit owner, so they wait for whoever is most senior.' }),
      o('Too many people need to agree', 3, { detail: 'consensus', e: { SP: .5 }, force: 'Consensus is required where a decision right would do, so every decision runs at the speed of the slowest agreement.' }),
      o('We don\'t have enough information', 2, { detail: 'information', side: { economics: .5 }, force: 'Decisions wait on information that may never be enough, because the real gap is who is allowed to decide under uncertainty.' }),
      o('Leaders disagree', 2, { detail: 'leaders', side: { direction: 1.5 }, e: { PB: .5 }, force: 'Leadership disagreement is settled case by case instead of once, so it re-runs inside every decision.' }),
      o('People don\'t feel authorized to decide', 2, { detail: 'authorized', side: { authority: 1.5 }, e: { SP: 1 }, force: 'People who could decide don\'t believe they are allowed to, so they escalate to be safe.' }),
      o('We keep revisiting the decision', 2, { detail: 'revisited', side: { trust: .5, direction: .5 }, force: 'Decisions are reopened after they are made, which teaches people to wait rather than act.' }),
      o('Decisions don\'t really get stuck', 0, { detail: 'none' }),
    ],
  },
  {
    id: 'execution', stage: 1, lens: 'S', mech: 'execution', type: 'single',
    eyebrow: 'System · Can the organization execute?',
    title: 'When your organization agrees that something is important, how reliably does it actually happen?',
    options: [o('Almost always', 0), o('Usually', 1), o('Sometimes', 2), o('Rarely', 3)],
  },
  {
    id: 'execution_why', stage: 1, lens: 'S', mech: 'execution', type: 'multi', max: 2, when: a => (a.execution ?? 0) >= 1,
    eyebrow: 'System · Can the organization execute?',
    title: 'When it doesn\'t happen, what usually gets in the way?',
    help: 'Pick up to two.',
    options: [
      o('Too many competing priorities', 0, { side: { focus: 1 }, e: { BS: .75 }, force: 'Commitments are made without anything being removed, so they compete for the same capacity.' }),
      o('No clear owner', 0, { side: { decisions: 1 }, force: 'Important work has no single owner, so it belongs to everyone and moves for no one.' }),
      o('Lack of capacity', 0, { side: { focus: .5 }, force: 'Capacity is committed past what exists, and the shortfall lands on the least protected work.' }),
      o('Lack of capability', 0, { side: { talent: 1 }, e: { SP: .5 }, force: 'The people asked to deliver don\'t yet have the skills or support to do it.' }),
      o('Poor process', 0, { side: { leverage: 1 }, force: 'The process for turning a decision into work doesn\'t carry it, so people carry it by hand.' }),
      o('Leadership changes direction', 0, { side: { direction: 1 }, e: { BS: .75 }, force: 'Direction changes from the top before the last direction has been delivered, which teaches teams to wait.' }),
      o('Dependencies between teams', 0, { side: { leverage: .5, decisions: .5 }, force: 'Work stalls at handoffs between teams, where no one owns the whole.' }),
      o('Follow-through', 0, { side: { trust: .5 }, force: 'Commitments quietly lapse without consequence, so commitment has stopped meaning much.' }),
    ],
  },
  {
    id: 'leverage', stage: 1, lens: 'S', mech: 'leverage', type: 'single',
    eyebrow: 'System · Can the organization execute?',
    title: 'How much of your organization\'s performance still depends on people working around the system or personally "making it happen"?',
    options: [o('Very little', 0), o('Some', 1), o('A lot', 2), o('Almost everything depends on it', 3)],
  },
  {
    id: 'authority', stage: 2, lens: 'P', mech: 'authority', type: 'single',
    intro: { kicker: 'Now the people.', line: 'Not whether they are capable, but whether the organization lets them act.' },
    eyebrow: 'People · Can people act on it?',
    title: 'Do people generally have enough authority to make the decisions they are accountable for?',
    options: [o('Almost always', 0), o('Usually', 1), o('Sometimes', 2, { e: { SP: .5 } }), o('Rarely', 3, { e: { SP: 1 } })],
  },
  {
    id: 'talent', stage: 2, lens: 'P', mech: 'talent', type: 'single',
    eyebrow: 'People · Can people act on it?',
    title: 'Are your best people spending most of their time on the problems where they create the most value?',
    options: [o('Almost always', 0), o('Usually', 1), o('Sometimes', 2, { e: { PB: .5 } }), o('Rarely', 3, { e: { PB: 1 } }), o('I\'m not sure', 2, { e: { PB: .25 }, tag: 'unsure' })],
  },
  {
    id: 'trust', stage: 2, lens: 'P', mech: 'trust', type: 'single',
    eyebrow: 'People · Can people act on it?',
    title: 'When someone sees a problem or disagrees with a decision, how safe is it to say so directly?',
    options: [o('Very safe', 0), o('Usually safe', 1), o('Depends on the situation', 2), o('Usually difficult', 2.5), o('Very difficult', 3)],
  },
];

// Adaptive follow-ups. Asked only where the signal is strong; at most three.
export const FOLLOWUPS = [
  {
    id: 'decisions_where', stage: 3, lens: 'S', mech: 'decisions', type: 'single', priority: m => m.decisions, when: m => m.decisions >= 2,
    eyebrow: 'Following up · Decisions',
    title: 'Which decisions get stuck most often?',
    options: ['Customer', 'People', 'Money', 'Operations', 'Product', 'Strategy'].map(x => o(x, 0, { detail: x.toLowerCase(), force: `The decisions that stall most are about ${x.toLowerCase()}, which suggests ownership there was never made explicit.` })),
  },
  {
    id: 'decisions_after', stage: 3, lens: 'S', mech: 'decisions', type: 'single', priority: m => m.decisions - .1, when: m => m.decisions >= 2,
    eyebrow: 'Following up · Decisions',
    title: 'What happens when the decision is finally made?',
    options: [
      o('People act quickly', 0),
      o('People wait for more direction', 0, { side: { authority: .5 }, force: 'Even once decided, people wait for direction, so the decision doesn\'t convert to action.' }),
      o('Teams disagree', 0, { side: { direction: .5, trust: .25 }, force: 'Decisions are made without the disagreement being resolved, so they get relitigated in execution.' }),
      o('The decision gets revisited', 0, { side: { trust: .5 }, force: 'Decisions are reopened, which teaches people to wait rather than act.' }),
      o('It depends who decided', 0, { side: { leverage: .5 }, force: 'Follow-through depends on who decided, not on the decision.' }),
    ],
  },
  {
    id: 'execution_change', stage: 3, lens: 'S', mech: 'execution', type: 'single', priority: m => m.execution, when: m => m.execution >= 2,
    eyebrow: 'Following up · Execution',
    title: 'What most often causes priorities to change?',
    options: [
      o('Leadership', 0, { side: { direction: .75 }, force: 'Priorities change from the top, which teaches teams to wait before investing effort.' }),
      o('Customers', 0, { force: 'Customer demands override the plan. That may be right, but the plan should expect it.' }),
      o('Sales', 0, { side: { economics: .5 }, force: 'Sales commitments reset priorities, so the plan is effectively made twice.' }),
      o('Operations', 0, { side: { leverage: .5 }, force: 'Operational fires displace planned work, and the fires keep coming.' }),
      o('New opportunities', 0, { side: { focus: 1 }, force: 'New opportunities are added without anything being removed.' }),
      o('External events', 0, { force: 'External events reset priorities, and there is no rule for what protects the core plan.' }),
      o('We aren\'t sure', 0, { side: { direction: .5 }, force: 'Priorities change for reasons nobody can name, which is itself the signal.' }),
    ],
  },
  {
    id: 'people_limits', stage: 3, lens: 'P', mech: 'people', type: 'single', priority: m => (m.authority + m.talent + m.trust) / 3, when: m => (m.authority + m.talent + m.trust) / 3 >= 1.5,
    eyebrow: 'Following up · People',
    title: 'What most limits people\'s ability to act?',
    options: [
      o('Lack of clarity', 0, { side: { direction: .75 }, e: { PB: .5 }, force: 'People don\'t act because they aren\'t sure what matters most, and guessing wrong is costly.' }),
      o('Lack of authority', 0, { side: { authority: .75 }, e: { SP: .5 }, force: 'People are accountable for outcomes without the authority to make the decisions those outcomes require.' }),
      o('Lack of capability', 0, { side: { talent: .75 }, force: 'People understand the goal but haven\'t been given the skills or support to reach it.' }),
      o('Lack of information', 0, { side: { decisions: .5 }, force: 'The information people need to act sits somewhere else in the organization.' }),
      o('Fear of mistakes', 0, { side: { trust: 1 }, force: 'Mistakes are costly enough that not acting is the safer choice.' }),
      o('Conflicting incentives', 0, { side: { economics: .5 }, e: { PB: .75 }, force: 'Incentives point somewhere other than the stated priority, and people follow the incentive.' }),
      o('Leadership behavior', 0, { side: { trust: .75, authority: .5 }, force: 'Leaders intervene before teams have a chance to solve problems, so teams stop trying.' }),
    ],
  },
  {
    id: 'business_uncertainty', stage: 3, lens: 'B', mech: 'business', type: 'single', priority: m => (m.direction + m.focus + m.economics) / 3, when: m => (m.direction + m.focus + m.economics) / 3 >= 1.5,
    eyebrow: 'Following up · Business',
    title: 'Where is the biggest uncertainty?',
    options: [
      o('What to prioritize', 0, { side: { focus: .75 }, force: 'The organization hasn\'t chosen what comes first, so everything does.' }),
      o('Which customers matter most', 0, { side: { economics: .75 }, force: 'Without a view on which customers matter most, effort spreads evenly across customers who don\'t.' }),
      o('Where to invest', 0, { side: { economics: .75 }, force: 'Investment follows the strongest advocate rather than the strongest economics.' }),
      o('What to stop', 0, { side: { focus: 1 }, force: 'Nothing is formally stopped, so capacity is spent maintaining the past.' }),
      o('How to grow', 0, { side: { direction: .75 }, force: 'Growth is the goal but the path isn\'t chosen, so several are pursued at once.' }),
      o('Where profit comes from', 0, { side: { economics: 1 }, force: 'The economics of the business aren\'t explicit, so priorities can\'t be tested against them.' }),
    ],
  },
];

export const INVERSION = {
  id: 'inversion', stage: 4, type: 'multi', max: 2,
  intro: { kicker: 'One more, and it\'s a strange one.', line: 'Invert the problem. What would make it worse is usually what is quietly keeping it alive.' },
  eyebrow: 'Inversion',
  title: 'If you wanted this problem to get significantly worse, what would you do?',
  help: 'Pick up to two. Be honest about which ones are already happening.',
  options: [
    o('Add more priorities', 0, { side: { focus: .5 }, force: 'New priorities are added faster than old ones are retired.' }),
    o('Centralize more decisions', 0, { side: { authority: .5 }, force: 'Decisions drift upward whenever things feel risky.' }),
    o('Add another approval layer', 0, { side: { decisions: .5 }, force: 'Control is added in response to problems, and each layer slows the next decision.' }),
    o('Avoid the difficult conversation', 0, { side: { trust: .5 }, force: 'The difficult conversation is being avoided, so the cause stays unnamed.' }),
    o('Keep measuring activity instead of outcomes', 0, { side: { economics: .5 }, force: 'Activity is measured and rewarded, so activity is what grows.' }),
    o('Continue rewarding the current behavior', 0, { side: { economics: .25, trust: .25 }, force: 'Current incentives reward the behaviour that produces the friction.' }),
    o('Keep solving the symptom', 0, { side: { leverage: .5 }, force: 'Each recurrence is solved as a new event rather than traced to its cause.' }),
    o('Do nothing', 0, { force: 'Nothing about the current pattern requires anyone to act, so it persists.' }),
  ],
};

export const COST = {
  id: 'cost', stage: 5,
  eyebrow: 'Optional · Make it tangible',
  title: 'Roughly how much management time does this friction consume?',
  help: 'A rough guess is fine. This produces an illustrative estimate, not an audit. Skip it if you prefer.',
  fields: [
    { key: 'managers', label: 'Managers who deal with it each week', placeholder: 'e.g. 8', min: 0, max: 10000 },
    { key: 'hours', label: 'Hours per manager per week', placeholder: 'e.g. 4', min: 0, max: 80 },
    { key: 'rate', label: 'Loaded cost per hour (optional)', placeholder: 'e.g. 175', min: 0, max: 100000, optional: true },
  ],
};

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
export const PLAYBOOKS = {
  direction: {
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
  decisions: {
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
  authority: {
    constraint: 'People are accountable for outcomes without the authority to deliver them',
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

export const CONFIDENCE = {
  high:     { label: 'High',     d: 'Your answers point in one direction, and the follow-ups agreed with the core pattern.' },
  moderate: { label: 'Moderate', d: 'The pattern is clear but a second friction is close behind it. Treat the diagnosis as the first hypothesis to test.' },
  emerging: { label: 'Emerging', d: 'The signal is spread across lenses. This is a starting hypothesis, not a conclusion. The follow-up question will tell you more than the diagnosis.' },
};

export const LEARNING_OPTIONS = [
  { key: 'narrowed',   t: 'The friction decreased.' },
  { key: 'same',       t: 'About the same.' },
  { key: 'worse',      t: 'It got worse.' },
  { key: 'notyet',     t: 'We haven\'t acted yet.' },
];
export const LEARNING_RESPONSES = {
  narrowed: 'Good. Write down what you changed, in one line. That\'s the part worth repeating, and the metric should show it.',
  same:     'That\'s a signal too. Either the move was aimed at a symptom, or the system absorbed it. Run Friction again and see whether the constraint has moved.',
  worse:    'Worth knowing early. Something is reinforcing the friction harder than expected. The inversion question is the place to look.',
  notyet:   'Then the friction is upstream of the move. What stopped it from happening is the next diagnosis.',
};
