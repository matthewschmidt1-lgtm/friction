// Friction — content
// Every option carries silent weights: l = lens (B business, S system, P people),
// e = edge (BS, SP, PB), tags = signals used for the decision statements and blind spot.
// Everything a person reads lives in this file.
//
// Weighting principles
//   Business = does the organization know what creates value, and are the measures pointed at it
//   System   = can work flow and repeat without depending on a particular person
//   People   = do people have the clarity, authority, capability and reason to act
//   An edge is direct evidence of a conflict between two lenses. The engine also
//   needs both lenses to carry signal before it will call an edge the primary friction.
//
// Reading
//   Each part carries one book that explains it (book) and at most one more (more),
//   shown under "Further reading". Nothing gets a book unless the idea maps directly.

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
  B: { key: 'B', name: 'Business', line: 'Do we know what matters?', verb: 'Create value' },
  S: { key: 'S', name: 'System',   line: 'Can the organization execute it repeatedly?', verb: 'Create leverage' },
  P: { key: 'P', name: 'People',   line: 'Can people act on it?', verb: 'Create capability' },
};

// The framework, explained. Shown under "How to read this map".
export const LENS_DEPTH = {
  B: {
    what: 'The Business lens asks whether the organization knows what creates value and is pointed at it. Not whether it has a strategy document, but whether people could tell you which few things actually move the result, and whether the measures agree.',
    weak: 'When this lens is weak you see a lot of measurement and not much conviction. Targets multiply. Different groups optimise different numbers. Performance changes and the explanation arrives as more analysis rather than an answer.',
    book: bk('charan', 'Every business, however complex, runs on a small nucleus: customers, cash, margin, velocity and growth. Business acumen is the habit of tracing any problem back to which of those it is really about. A Business-lens problem is usually a nucleus nobody has named out loud.'),
    more: bk('collins', 'The hedgehog concept: knowing the one thing the organization can be best at, what drives its economic engine, and what it cares about, and saying no to everything outside that. An organization that has never chosen its hedgehog experiences everything as a priority.'),
  },
  S: {
    what: 'The System lens asks whether the organization can produce the result again without depending on a particular person. Processes, decision rights, structure, tools, meetings and measures are all part of the system. So is the absence of them.',
    weak: 'When this lens is weak, results depend on who is in the room. Work slows at approvals and handoffs. Good outcomes get reinvented instead of repeated. The same problem returns on a schedule.',
    book: bk('grove', 'A manager\'s output is the output of the organization under their influence. The way to raise it is leverage: the systems, indicators and decisions that let many people produce the result, rather than one person rescuing it. A System-lens problem is a place where leverage is missing and heroics are filling in.'),
    more: bk('meadows', 'A system\'s behaviour comes from its structure, not from the people inside it. If the same problem keeps appearing with different people in the seats, the structure is producing it.'),
  },
  P: {
    what: 'The People lens asks whether the people expected to act have what acting requires: clarity about what matters, the authority to decide, the capability to do it, and a reason to. Any one of the four missing looks, from the outside, like a motivation problem. It usually isn\'t.',
    weak: 'When this lens is weak, people know the answer and wait. Escalation replaces judgment. Effort is high and initiative is low. Leaders send different signals and people hedge between them.',
    book: bk('google', 'Talented people do their best work when they are given context rather than control: the goal, the constraints and the reasoning, then room to act. A People-lens problem is usually context that never arrived, or authority that was never actually granted.'),
    more: bk('lencioni', 'The five dysfunctions stack: without trust no real conflict, without conflict no commitment, without commitment no accountability. When people can\'t act, ask which layer is missing. It is usually commitment, because the disagreement was never had.'),
  },
};

export const EDGES = {
  BS: {
    key: 'BS', a: 'B', b: 'S', name: 'Business ↔ System',
    primary: 'Your organization appears to know what it wants to accomplish, but the way work gets done isn\'t built to deliver it.',
    secondary: 'The way work gets done may also be quietly out of step with what the business is asking for.',
    looksLike: 'The strategy is clear enough to repeat in a meeting. The processes, targets and structures underneath it were built for an earlier strategy, or for no strategy in particular, and they keep producing the old result. People experience this as "we decided, and nothing changed." Leadership experiences it as an execution problem. It usually isn\'t one.',
    mechanism: 'Systems are sticky. A reporting cadence, an approval path or an incentive plan outlives the priority that created it, and it keeps steering behaviour long after the priority has changed. The friction sits exactly where the new intention meets the old machine.',
    book: bk('christensen', 'An organization\'s processes and values are built to serve the priorities it had when they were designed, and they do not flex when the priority changes. Good management of the old system is precisely what makes it resist the new goal. The friction is not incompetence. It is a well-run machine pointed at yesterday.'),
    more: bk('grove', 'Define the output you want first, then work backwards to the indicators and process that produce it. Most Business ↔ System friction comes from doing it the other way round: keeping the process and hoping the output changes.'),
  },
  SP: {
    key: 'SP', a: 'S', b: 'P', name: 'System ↔ People',
    primary: 'Your organization appears to be asking people to compensate for problems in the system.',
    secondary: 'People may also be absorbing friction the system should be carrying.',
    looksLike: 'Results depend on particular people. Work waits for approval that adds no information. When something goes well it is because someone worked around the process, and when it goes badly the process is blamed. Good people are tired. The organization keeps hiring for resilience when it should be removing the thing that requires it.',
    mechanism: 'When the system doesn\'t carry a decision, a person has to. That works while the person is there and energetic, and it hides the gap, because the result still arrives. The friction becomes visible only when the person leaves, burns out or gets promoted, and the problem "suddenly" appears.',
    book: bk('grove', 'The test for a manager is whether the output survives their absence. Strong outcomes should not depend on someone constantly rescuing a broken process. If they do, the fix is in the process and the decision rights, not in finding more heroes.'),
    more: bk('meadows', 'The "shifting the burden" pattern: a symptomatic fix, such as a capable person absorbing the problem, relieves the pressure that would otherwise force the real fix. Each time the hero steps in, the system learns to depend on them a little more.'),
  },
  PB: {
    key: 'PB', a: 'P', b: 'B', name: 'People ↔ Business',
    primary: 'People seem willing and able to act, but what matters most hasn\'t reached them clearly enough to act on.',
    secondary: 'What matters most may also not be landing with the people expected to deliver it.',
    looksLike: 'Different teams hold different versions of reality and each one is internally consistent. Leaders send different signals, often without noticing. People hedge, because acting on one version of the priority risks being wrong about another. Effort is high and diffuse. Data exists, and the argument is about what it means.',
    mechanism: 'A priority that was never actually chosen gets interpreted locally. Each group fills in the gap with the version that fits its own work, and each version is defensible. The friction is not resistance. It is the absence of a shared answer to "what matters most, and why."',
    book: bk('lencioni', 'Artificial harmony: teams that avoid conflict produce meetings where everyone nods and then act on their own interpretation afterwards. Commitment requires that the disagreement be voiced first. Different versions of reality are the signature of a team that agreed without ever arguing.'),
    more: bk('google', 'Context is the leader\'s main product. People make good decisions without permission when they understand the goal, the constraints and the reasoning. When they don\'t, they make slow, hedged ones.'),
  },
};

export const STAGES = [
  { code: '01', name: 'Signal' },
  { code: '02', name: 'Blind Spot' },
  { code: '03', name: 'Lenses' },
  { code: '04', name: 'Decision' },
  { code: '05', name: 'Friction' },
  { code: '06', name: 'Action' },
];

const o = (t, l = {}, e = {}, tags = [], extra = {}) => ({ t, l, e, tags, ...extra });

export const QUESTIONS = [
  {
    id: 'goal', stage: 0, type: 'single',
    eyebrow: 'What are you trying to improve?',
    title: 'Start with what you\'re after.',
    help: 'Not the fix. The thing you want to be different.',
    options: [
      o('Growth', { B: .5 }),
      o('Profitability', { B: .5 }),
      o('Execution', { S: .5 }),
      o('Decision-making', { B: .25, S: .25 }, {}, ['decisions']),
      o('Organizational effectiveness', { P: .5 }),
      o('Something else', {}, {}, [], { other: true }),
    ],
  },
  {
    id: 'symptoms', stage: 0, type: 'multi', max: 3,
    evidenceLabel: 'What you\'re seeing',
    eyebrow: 'What are you seeing?',
    title: 'Pick the three that fit best.',
    help: 'In your words, not ours. Fewer, sharper choices give a better diagnosis.',
    options: [
      o('We\'re working harder but results aren\'t improving.', { B: .5, S: .75 }, { BS: 1 }, ['harder', 'repeat']),
      o('We have plenty of data but struggle to make decisions.', { B: 1, P: .25 }, { PB: .5 }, ['lots-of-data', 'more-info', 'meaning']),
      o('Decisions are made but don\'t translate into action.', { S: 1, P: .5 }, { SP: 1 }, ['execute']),
      o('Different teams have different versions of reality.', { B: .75, P: .5 }, { PB: 1 }, ['meaning', 'different-realities']),
      o('We keep solving the same problems.', { S: 1 }, {}, ['repeat']),
      o('People don\'t seem empowered to act.', { S: .5, P: 1 }, { SP: 1 }, ['authority', 'execute']),
      o('We keep adding processes, meetings, or tools.', { S: 1 }, { BS: .75 }, ['adding', 'repeat', 'activity']),
      o('We aren\'t sure what actually matters anymore.', { B: 1, P: .5 }, { PB: .75 }, ['clarity', 'meaning']),
    ],
  },
  {
    id: 'blindspot', stage: 1, type: 'single',
    intro: {
      kicker: 'Before we diagnose the problem, let\'s question the explanation.',
      line: 'Sometimes the hardest thing to see is what everyone has learned to accept.',
    },
    eyebrow: 'Which feels most familiar?',
    title: 'How does your organization talk about this problem?',
    help: 'Choose the one that sounds most like the room.',
    options: [
      o('We\'re confident we know what\'s causing it.', {}, {}, ['bs-agree']),
      o('We have a lot of data about the problem.', {}, {}, ['bs-data', 'lots-of-data']),
      o('We\'ve tried several things already.', {}, {}, ['bs-tried']),
      o('We keep doing more of the same.', {}, {}, ['bs-same', 'repeat']),
      o('We\'re waiting for external conditions to improve.', {}, {}, ['bs-external']),
      o('We\'re not sure we\'re solving the right problem.', {}, {}, ['bs-unsure']),
    ],
  },
  {
    id: 'hypothesis', stage: 2, type: 'multi', lensPick: true,
    intro: {
      kicker: 'Where does the friction live?',
      line: 'Three places to look. The problem is usually not inside one of them. It\'s in the gap between them.',
    },
    eyebrow: 'Your best guess',
    title: 'Where do you think the friction lives?',
    help: 'Pick one or more. We\'ll compare your instinct to the pattern later.',
    options: [
      o('Business', {}, {}, [], { lens: 'B', sub: LENSES.B.line }),
      o('System', {}, {}, [], { lens: 'S', sub: LENSES.S.line }),
      o('People', {}, {}, [], { lens: 'P', sub: LENSES.P.line }),
    ],
  },
  {
    id: 'clarity', stage: 2, lens: 'B', type: 'single',
    eyebrow: 'Business · Create value',
    title: 'How clear is the organization about what matters most?',
    options: [
      o('Extremely clear, and the measures agree', {}, {}, ['clear']),
      o('Mostly clear', { B: .25 }),
      o('Different groups prioritize different things', { B: 1, P: .25 }, { PB: .75 }, ['meaning', 'priorities-differ']),
      o('We measure a lot but aren\'t sure what matters', { B: 1 }, {}, ['lots-of-data', 'clarity', 'more-info', 'more-analysis']),
      o('Honestly, I\'m not sure', { B: 1 }, {}, ['clarity', 'info']),
    ],
  },
  {
    id: 'noise', stage: 2, lens: 'B', type: 'multi', max: 3,
    eyebrow: 'Business · Create value',
    title: 'What gets more attention than it probably deserves?',
    help: 'Up to three.',
    options: [
      o('Reporting', { B: .5 }, {}, ['noise', 'more-info']),
      o('Internal processes', { S: .75 }, {}, ['noise', 'adding']),
      o('Short-term targets', { B: .75 }, { BS: .5 }, ['noise']),
      o('Legacy metrics', { B: .75 }, {}, ['noise', 'lots-of-data']),
      o('Meetings', { S: .5 }, {}, ['noise', 'activity']),
      o('Firefighting', { S: .5, P: .25 }, { SP: .5 }, ['noise', 'repeat']),
    ],
  },
  {
    id: 'slow', stage: 2, lens: 'S', type: 'multi', max: 3,
    eyebrow: 'System · Create leverage',
    title: 'Where does work slow down?',
    help: 'Up to three.',
    options: [
      o('Too many approvals', { S: 1, P: .5 }, { SP: .75 }, ['authority', 'execute']),
      o('Too many handoffs', { S: 1 }, {}, ['execute', 'handoffs']),
      o('Conflicting priorities', { B: .75, S: .5 }, { BS: 1 }, ['meaning', 'priorities-differ']),
      o('Poor processes or tools', { S: 1 }, {}, ['execute']),
      o('Unclear decision rights', { S: .75, P: .75 }, { SP: .75 }, ['authority']),
      o('Organizational structure', { S: 1 }, { BS: .5 }, ['execute']),
      o('We don\'t know', { S: .5 }, {}, ['info']),
    ],
  },
  {
    id: 'repeat', stage: 2, lens: 'S', type: 'single',
    eyebrow: 'System · Create leverage',
    title: 'When something works, can the organization repeat it?',
    options: [
      o('Usually', {}),
      o('Sometimes', { S: .5 }),
      o('Rarely', { S: 1 }, {}, ['repeat']),
      o('It depends on the person', { S: .75, P: .5 }, { SP: .75 }, ['hero']),
      o('We tend to reinvent it', { S: 1 }, {}, ['repeat']),
    ],
  },
  {
    id: 'people', stage: 2, lens: 'P', type: 'single',
    eyebrow: 'People · Create capability',
    title: 'When people know what to do, what most often stops them?',
    help: 'Any one of these looks like a motivation problem from the outside.',
    options: [
      o('Nothing. They know what to do and can act.', {}),
      o('Clarity', { P: .75, B: .75 }, { PB: 1 }, ['clarity', 'meaning'], { sub: 'They don\'t know what matters most, or leaders send different signals.' }),
      o('Authority', { P: .75, S: .75 }, { SP: .75 }, ['authority', 'execute'], { sub: 'They aren\'t sure they\'re allowed to decide, or need approval to act.' }),
      o('Capability', { P: 1, S: .25 }, { SP: .25 }, ['capability'], { sub: 'They understand the goal but don\'t know how.' }),
      o('Incentive', { P: .75, B: .5 }, { PB: .75 }, ['incentive'], { sub: 'The rewards, or the risks, point somewhere else.' }),
    ],
  },
];

// Synthesised "real problem" statements. Ranked by tag fit, never labelled.
export const DECISIONS = {
  info:    { key: 'info',    t: 'We don\'t have enough information.',                                   tags: ['more-info', 'info', 'lots-of-data', 'more-analysis'] },
  meaning: { key: 'meaning', t: 'We don\'t agree on what the information means.',                        tags: ['meaning', 'different-realities', 'priorities-differ', 'clarity'] },
  execute: { key: 'execute', t: 'We know what needs to happen, but the organization can\'t execute it.', tags: ['execute', 'authority', 'capability', 'handoffs'] },
  repeat:  { key: 'repeat',  t: 'We keep doing things that aren\'t changing the result.',                tags: ['repeat', 'adding', 'activity', 'harder', 'hero'] },
};

// What each "real problem" choice tends to mean, in the framework.
export const DECISION_DEPTH = {
  info:    'You chose the information explanation. Take it seriously, and also test it: information is only missing if a specific decision is waiting on it. If no decision would change, the gap is not information. It is agreement, or authority.',
  meaning: 'You chose the interpretation explanation. That places the problem between people and the business: the facts are shared, the frame is not. This is rarely solved with more data. It is solved by making the disagreement explicit and choosing.',
  execute: 'You chose the execution explanation. Look carefully at what "can\'t execute" is made of. In most organizations it decomposes into a few approvals, handoffs or decision rights that were never designed, plus a goal that is less settled than it sounds.',
  repeat:  'You chose the activity explanation. This is the most honest of the four, and the hardest to act on, because activity is comfortable. Something is maintaining the loop: a measure, a meeting, a role. The work is to find what it is and stop it.',
};

// Blind spot rules. First match wins. `when` receives the analysis.
export const BLIND_SPOTS = [
  { when: a => a.decision === 'info' && (a.has('lots-of-data') || a.has('more-analysis')),
    t: 'You may be trying to solve a clarity problem with more information.',
    why: 'You described plenty of data and chose "not enough information." Those rarely sit together unless the missing piece is agreement, not analysis.',
    deeper: 'Organizations reach for more information when a decision feels risky, because analysis is safe and deciding is not. The tell is that each new report is received with interest and changes nothing. Ask which specific decision is waiting on which specific fact. If nobody can name one, the information is a form of waiting.',
    book: bk('davenport', 'Most organizations collect far more data than they use. The ones that actually compete on analytics have chosen a small number of decisions to be distinctively good at, and built the capability around those. Analytics is aimed at a decision, not a volume of reports.'),
    more: bk('munger', 'The person with a hammer sees every problem as a nail. An analytical organization treats every problem as an information problem. More perspectives, not more of the same data, is what breaks the pattern.') },
  { when: a => a.decision === 'execute' && a.primary === 'SP',
    t: 'You may be asking people to perform around a system that is working against them.',
    why: 'The execution gap you chose lines up with approvals, decision rights and handoffs. That\'s a system shape, not a people shape.',
    deeper: 'When execution fails and the response is to push people harder, coach them, or hire more resilient ones, the underlying process keeps its shape and keeps producing the gap. Look at the last three things that didn\'t get done. Trace each one to the step where it stalled. If it is the same step, or the same missing decision right, you have found the system.',
    book: bk('grove', 'When output is low, look first at the process and the indicators, not the individual. A capable person producing a poor result inside a bad process is the process telling you something.'),
    more: bk('meadows', 'A system\'s behaviour is a product of its structure. Replacing or pressuring the people in a structure that produces the problem will produce the same problem with new names attached.') },
  { when: a => a.decision === 'execute' && a.primary === 'BS',
    t: 'You may be treating a business problem as an execution problem.',
    why: 'The organization struggles to execute, but your answers about what matters most were not clear either. Execution can\'t outrun ambiguity.',
    deeper: 'A goal that has not been fully chosen produces something that looks exactly like poor execution: slow starts, rework, conflicting workstreams, escalation. People are not failing to execute the strategy. They are executing several versions of it at once. Before fixing execution, check whether the target is actually one target.',
    book: bk('drucker', 'There is nothing quite so useless as doing efficiently what should not be done at all. An execution push aimed at an unchosen goal makes the organization more efficient at producing the wrong result.'),
    more: bk('charan', 'Everyone in a business should be able to see how it makes money and what the priorities are this year. When that picture is fuzzy at the top, it arrives at the front line as contradiction, and the front line gets blamed.') },
  { when: a => a.bs === 'bs-agree',
    t: 'When everyone agrees on the cause, the cause has usually stopped being examined.',
    why: 'You chose "we\'re confident we know what\'s causing it." Confidence is comfortable. It is not the same as being right.',
    deeper: 'Shared explanations are efficient. They let a group stop arguing and start acting. But once an explanation is shared it stops being tested, and every new piece of evidence gets sorted into "supports it" or "exception." The question to ask is: what would we expect to see if this explanation were wrong, and have we looked?',
    book: bk('collins', 'The companies that made the leap confronted the brutal facts while keeping faith they would prevail. The mechanism was a climate where the truth was heard: leading with questions, real dialogue, and autopsies without blame. Confidence without that climate is the opposite of what Collins observed.'),
    more: bk('lencioni', 'Artificial harmony: when everyone agrees, check whether they agreed because the evidence was overwhelming, or because disagreeing felt unsafe. The two look identical in a meeting and behave very differently afterwards.') },
  { when: a => a.bs === 'bs-external',
    t: 'Waiting for conditions to improve may be the most expensive decision you\'re currently making.',
    why: 'You described waiting on external conditions. Waiting is a choice, and it protects the things that would otherwise have to change.',
    deeper: 'External conditions are real. But "waiting for them to improve" quietly excuses every internal decision that is also not being made. The test is to ask what the organization would change if it knew the conditions would not improve for three years. Whatever that list contains is probably worth doing now.',
    book: bk('conscious', 'The line between taking responsibility and blaming circumstances. Below the line, the organization is a victim of its market. Above it, the question becomes what we can do from here. Nothing about the market changes; the available moves do.'),
    more: bk('christensen', 'The companies that failed were not lazy. They waited for the numbers to justify a change, and the numbers never did. Waiting for conditions to improve is often waiting for the data to make a decision that only judgment can make.') },
  { when: a => a.bs === 'bs-tried',
    t: 'You may have tried several solutions to a problem you haven\'t fully defined.',
    why: 'Several attempts and the same result usually means the attempts were aimed at the symptom.',
    deeper: 'Write down, in one sentence each, what each attempt assumed the problem was. If the sentences differ, the organization has been running experiments without a hypothesis. If they are the same, the hypothesis has been tested and failed, and the next attempt should start from a different one.',
    book: bk('meadows', '"Fixes that fail": a solution that relieves the symptom, and in doing so weakens the pressure or the capability that would have addressed the cause. Each attempt makes the next one slightly less likely to work. The next fix should be aimed a level deeper.'),
    more: bk('munger', 'A latticework of models from many disciplines, applied to the same problem, so a single familiar pattern is not mistaken for the whole picture. Repeated failed fixes are usually one model applied repeatedly.') },
  { when: a => a.bs === 'bs-unsure',
    t: 'You may be the only one asking whether this is the right problem. That is usually the most valuable seat in the room.',
    why: 'Doubt about the problem is a signal, not a weakness. Most organizations lose it early.',
    deeper: 'Problem definition is the highest-leverage step and the one organizations spend least time on, because it feels like delay. Use the doubt. Ask the group to state the problem in one sentence, separately, and compare. The differences are the real diagnosis.',
    book: bk('drucker', 'The important and difficult job is never to find the right answer but to find the right question. Most management failure comes from answering the wrong question well.'),
    more: bk('coach', 'Bill Campbell\'s influence came less from answers than from questions, and from rooms where people could say "I\'m not sure this is the real problem." A leader who protects that question protects the organization\'s ability to learn.') },
  { when: a => a.decision === 'repeat' && a.has('adding'),
    t: 'You may be adding activity because changing the underlying system feels harder.',
    why: 'More processes, meetings or tools showed up in your answers. Activity is often what an organization does instead of a decision.',
    deeper: 'Each addition is reasonable on its own. A meeting to align, a report to track, an approval to reduce risk. Together they are a substitute for the harder change nobody has authority or appetite for. Take the most recent addition and ask what decision it was avoiding.',
    book: bk('grove', 'Meetings and reports are tools with a cost and an output, to be justified like any other. Activity is easy to measure and output is not. When an organization measures activity, it gets activity.'),
    more: bk('peters', 'Excellent companies had a bias for action, paired with a simple form and a lean staff. Adding process to fix a problem is action that adds structure. The question is what could be removed so the next action needs no new process.') },
  { when: a => a.decision === 'meaning' && a.primary === 'PB',
    t: 'You may be asking people to be clearer than the business has been with them.',
    why: 'Different versions of reality across teams usually trace back to a priority that was never actually chosen.',
    deeper: 'Ask five leaders, separately, what matters most this quarter and why. If the answers differ, the disagreement at the front line is not confusion. It is an accurate reflection of the top. Fixing communication downward will not help until there is one thing to communicate.',
    book: bk('lencioni', 'Teams commit to decisions when they have had the chance to disagree first. A leadership team that has never argued the priority out loud has not committed to it, whatever the slide says, and the organization below can tell.'),
    more: bk('google', 'Context is not a memo. It is the goal, the reasoning and the trade-offs, stated the same way by every leader.') },
  { when: a => a.decision === 'repeat',
    t: 'You may keep solving this problem because solving it has become part of how the organization works.',
    why: 'A problem that returns on schedule is usually being maintained by something: a metric, a meeting, a role that exists to manage it.',
    deeper: 'Recurring problems are stable because something benefits from them. A team that is valued for firefighting has a reason for fires. A metric that rewards throughput has a reason for rework. Look for who or what would lose something if the problem were actually gone, and start there.',
    book: bk('meadows', 'Look for the balancing loop: whatever pushes the problem back into its usual range every time someone tries to move it. That loop is the structure, and the structure is the thing to change.'),
    more: bk('collins', 'The flywheel, where consistent pushes in one direction accumulate momentum, against the doom loop, where organizations lurch from one new programme to the next and never build any. Repeatedly solving the same problem with new initiatives is the doom loop from the inside.') },
  { when: a => a.bs === 'bs-data',
    t: 'The data about the problem may be standing in for a decision about the problem.',
    why: 'You said there is a lot of data about it. Data that hasn\'t changed a decision is a form of waiting.',
    deeper: 'Ask what the organization would do differently if the data said the opposite. If the answer is "nothing," the data is not being used to decide. It is being used to feel informed. The useful question is what decision the data is supposed to inform, and who is supposed to make it.',
    book: bk('davenport', 'Organizations that have analytics versus organizations that compete on it. The difference is not the data. It is whether leaders have chosen specific decisions to make better.'),
    more: bk('grove', 'Indicators are chosen to trigger action, and paired so that improving one cannot quietly damage another. A number that does not change what anyone does is not an indicator. It is a report.') },
  { when: a => a.primary === 'BS',
    t: 'You know what you want. The machine was built for something else.',
    why: 'Your answers about direction were stronger than your answers about how work gets done.',
    deeper: 'Look at the processes, targets and approvals the organization runs on and ask when each was designed and for what. Most predate the current priority. They are not wrong. They are simply pointed elsewhere, and they are pulling harder than the strategy is.',
    book: bk('christensen', 'Processes and values are what an organization can and cannot do, and they are far harder to change than resources. A strategy that requires the system to behave differently, without changing the system, is asking the organization to do what it cannot.'),
    more: bk('grove', 'Start from the output you want and design backwards. Ask what each step of the system exists to produce, and remove the steps that produce something else.') },
  { when: a => a.primary === 'SP',
    t: 'Someone is quietly compensating for the system. That person is the reason the problem is still invisible.',
    why: 'When results depend on the person, the system has stopped carrying its share.',
    deeper: 'Find the person everyone routes around the process to reach. They are holding the organization together, and they are also masking the gap. The move is not to reward them more. It is to build the thing they are doing by hand into the way work flows, so it survives them.',
    book: bk('meadows', 'Shifting the burden: every time the hero absorbs the problem, the organization\'s own capacity to solve it atrophies a little more. The loop is stable and it is getting worse.'),
    more: bk('grove', 'Leverage is output that does not depend on the manager being present. Heroics are the opposite: high output that disappears with the hero. Build the former and stop relying on the latter.') },
  { when: () => true,
    t: 'You may be looking for the problem inside a lens, when it lives in the gap between two.',
    why: 'Your answers spread across all three lenses. The friction is in how they connect.',
    deeper: 'When no single lens dominates, the organization is usually fixing each area in isolation: a strategy refresh here, a process change there, a leadership programme somewhere else. Each is fine. None of them addresses the handoffs between them, which is where the friction sits.',
    book: bk('meadows', 'The behaviour of a system comes from how its parts interact, not from any one part. Fixing each lens separately is optimising the parts. The friction lives in the interactions.'),
    more: null },
];

// The one question worth answering, by decision × primary edge.
export const NEXT_QUESTIONS = {
  info:    { BS: 'What decision would change if you had the information you\'re asking for?',
             SP: 'Which recurring decision stalls, and what does it actually need to know to move?',
             PB: 'What do the people closest to the work already know that hasn\'t reached the people deciding?' },
  meaning: { BS: 'What are we doing today that reinforces the problem we\'re trying to solve?',
             SP: 'Where do two reasonable people, following the process correctly, arrive at different answers?',
             PB: 'If you asked five people what matters most this quarter, how many answers would you get?' },
  execute: { BS: 'What have you designed the organization to do that conflicts with what you\'re asking it to accomplish?',
             SP: 'What are people compensating for that the system should be doing?',
             PB: 'What would have to be true for this problem to improve without adding more activity?' },
  repeat:  { BS: 'If we stopped doing half of this work, what would actually get worse?',
             SP: 'What keeps producing this problem, and why is fixing the output easier than fixing that?',
             PB: 'Who is being rewarded for keeping this problem manageable instead of solved?' },
};

// Why that question, by decision.
export const QUESTION_WHY = {
  info:    'This question starts from the decision rather than the data. A piece of information earns its place only if it would change what someone does. If the answer is "no decision would change," the missing thing is not information.',
  meaning: 'This is an inversion question, in Munger\'s sense: instead of asking how to fix the problem, ask what is producing it. Organizations are usually maintaining the thing they say they want to remove, and the maintenance is easier to see than the cause.',
  execute: 'This question separates the system from the people inside it. It asks you to describe the machine as designed, not as intended. Most execution problems become obvious once the design is written down next to the goal.',
  repeat:  'This is an inversion question. Rather than asking what to add, it asks what would be lost by stopping. Munger\'s advice was to invert, always invert. The answer is usually shorter than the list of things you would have to stop.',
};

// The next move, by decision × primary edge. Each is an experiment: a move, three steps, and the signal that it is working.
export const NEXT_MOVES = {
  info: {
    BS: { t: 'Stop measuring everything.', d: 'Identify the three measures that actually change a decision. Retire the reports that don\'t feed one of them.',
          how: ['List every recurring report and metric, then next to each one write the decision it informs and who makes it.', 'Anything with a blank is a candidate to retire. Expect this to be most of the list.', 'Keep the three that pass, and pair each with a counter-measure so improving one can\'t quietly damage another.'],
          watch: 'Meetings get shorter, and at least one decision that used to wait for "more data" gets made.',
          book: bk('davenport', 'Choose the measures around the decisions you most want to be distinctively good at. That is what competing on analytics means in practice.'),
          more: bk('grove', 'Paired indicators: every measure matched with one that catches its side effects.') },
    SP: { t: 'Find the decision, not the data.', d: 'Pick one recurring decision that stalls. Write down the information it actually needs. Cut everything else from the pack.',
          how: ['Choose the decision people complain about most: the one that always needs "one more round."', 'Write the decision as a question with a yes/no answer, and list the two or three facts that would settle it.', 'Give the decision an owner and a date. Remove everything from the review that is not one of those facts.'],
          watch: 'The decision gets made in one round, and the same template gets borrowed for the next one.',
          book: bk('drucker', 'A decision has not been made until it has been converted into work, with someone responsible and a deadline.'),
          more: bk('grove', 'A decision is a process with a defined output, inputs and an owner, not a meeting that happens to end.') },
    PB: { t: 'Ask before you analyze.', d: 'Ask the people closest to the work what they would need to know to act. Build that first, and nothing else this month.',
          how: ['Sit with three people who do the work, separately, and ask what they would need to know to make the call themselves.', 'Compare the three lists. What appears on all of them is the information gap. Everything else is a management preference.', 'Deliver only that, in the form they asked for, and then stop and see what they do with it.'],
          watch: 'Fewer questions escalate. The people you asked start deciding without checking first.',
          book: bk('coach', 'Campbell\'s method was to ask, listen and then get out of the way. The people closest to the work usually already know what is missing.'),
          more: null },
  },
  meaning: {
    BS: { t: 'Put one number on the table.', d: 'Choose the single measure that would define success this quarter. Argue until it\'s one. Then let every other target answer to it.',
          how: ['Bring the leadership group together with one question: if we could only track one number this quarter, which one?', 'Do not leave with two. The argument is the work; it surfaces the disagreement that has been running underground.', 'Publish the number, and for every existing target ask how it serves it. Targets that don\'t get demoted, publicly.'],
          watch: 'People start using the number in conversations without being asked to. Conflicting priorities stop being a mystery and start being a choice.',
          book: bk('collins', 'The good-to-great companies each found a single economic denominator, the one ratio that best captured their engine. The argument about which number is the argument about what the business is.'),
          more: bk('charan', 'The nucleus: growth, margin, cash, velocity, customers. The one number should be one of these, or a direct driver of one.') },
    SP: { t: 'Write the decision down.', d: 'For the next contested decision, record who decided, on what basis, and what would change their mind. Share it.',
          how: ['Pick the next decision that two reasonable people would make differently.', 'When it is made, write one paragraph: who decided, what they weighed, what they chose and what evidence would reverse it.', 'Send it to everyone affected. Do it again for the next one. Three of these and you have the beginnings of decision rights.'],
          watch: 'The same disagreement stops recurring, because the reasoning is visible and can be argued with directly.',
          book: bk('lencioni', 'The commitment test: at the end of a decision, can everyone state what was decided and why, in the same words? Writing it down is how you find out.'),
          more: bk('google', 'Decisions made with data and reasoning that others can see and challenge. Transparency is what turns a decision into context.') },
    PB: { t: 'Say the priority out loud.', d: 'Have each leader write what matters most this quarter, alone. Compare the lists in the same room. Resolve the differences before anyone leaves.',
          how: ['Ask each leader to write, privately, the one thing that matters most this quarter and why.', 'Put the answers on one wall. Expect them to differ; the differences are the diagnosis.', 'Resolve them into one statement in that room. Then each leader repeats it, in their own words, to their own team within a week.'],
          watch: 'Ask a few front-line people what matters most a month later. If their answers match, it worked.',
          book: bk('lencioni', 'This exercise forces the productive conflict a team has been avoiding. The differences on the wall are the disagreement. Resolving them in the room is what produces commitment.'),
          more: bk('conscious', 'Candour as a commitment: saying the true thing in the room, rather than agreeing in the meeting and diverging afterwards.') },
  },
  execute: {
    BS: { t: 'Retire one conflicting goal.', d: 'Find the target that quietly contradicts the priority you say matters. Drop it, and say why in public.',
          how: ['List the targets teams are actually measured on. Not the strategy; the scorecards and the bonus plans.', 'Find the one that pulls against the stated priority. There is nearly always at least one.', 'Retire it, and explain the reasoning to the people who were carrying it. The explanation is the part that changes behaviour.'],
          watch: 'The workstream that always stalled starts moving, because the thing it was competing with is gone.',
          book: bk('munger', 'People respond to what they are measured on, not what they are told. A conflicting target is an instruction, whatever the strategy says.'),
          more: bk('drucker', 'Management by objectives assumed the objectives were few and consistent. A scorecard with contradictory targets is management by objectives without the management.') },
    SP: { t: 'Clarify one decision right.', d: 'Find one recurring decision that requires unnecessary escalation. Explicitly assign the authority to make it.',
          how: ['Ask a team which decision they most often wait on. Choose the one that comes up first.', 'Write down who will make it from now on, what limits apply, and what they should tell others afterwards.', 'Tell the people who used to approve it that they no longer do. This step is the one organizations skip.'],
          watch: 'The decision happens faster, and nobody above it needs to get involved.',
          book: bk('grove', 'Is the decision being made at the lowest level with the right knowledge? If not, the escalation is a cost with no output.'),
          more: bk('peters', 'Autonomy inside a few tight, non-negotiable values: loose on the how, tight on the what.') },
    PB: { t: 'Trade a request for a reason.', d: 'Pick the thing people aren\'t doing. Ask what would make it worth doing. Change that, not the request.',
          how: ['Choose one behaviour leadership keeps asking for and not getting.', 'Ask the people involved, without judgment, what makes the current behaviour the sensible choice for them. Listen for the incentive or the risk.', 'Change the incentive or remove the risk. Do not repeat the request.'],
          watch: 'The behaviour changes without another reminder, because the reason to change is now real.',
          book: bk('collins', 'The right people do not need to be tightly managed or fired up; they are self-motivated by the work when the conditions allow it. If the right people aren\'t doing the thing, look at the conditions before the people.'),
          more: bk('coach', 'People will tell you why they aren\'t doing something if they believe the answer will be used to help them rather than to judge them.') },
  },
  repeat: {
    BS: { t: 'Kill one recurring activity.', d: 'Take one meeting, report, approval or process that exists because "we\'ve always done it" and test what happens without it.',
          how: ['Choose the recurring activity whose purpose is hardest to state in one sentence.', 'Stop it for a month. Announce that you are doing so, and what you expect to get worse.', 'At the end of the month, check. If nothing got worse, it stays gone. If something did, you have learned what the activity was actually for.'],
          watch: 'Nothing gets worse. Then someone proposes the next one to stop.',
          book: bk('drucker', 'The test for any activity: if we were not already doing this, would we start it now? If not, stop it. The month without it is how you answer honestly.'),
          more: bk('grove', 'Every meeting and report has a cost in the time of the people involved, and must justify itself by its output.') },
    SP: { t: 'Fix the process once.', d: 'Take the problem you keep solving and change the step that keeps producing it, instead of solving the output again.',
          how: ['Take the last three occurrences of the recurring problem and trace each back to the step where it originated.', 'If it is the same step, change that step. If it is the same missing decision, assign it.', 'Stop treating each recurrence as a new event. Treat the next one as a test of whether the fix held.'],
          watch: 'The problem stops recurring, and the people who used to fix it get their time back.',
          book: bk('meadows', 'Changing the structure that generates a behaviour beats correcting the behaviour every time it appears. Fixing the step is a structural change. Fixing the output is not.'),
          more: bk('grove', 'Detect and fix a problem at the lowest-value stage, where it is cheapest. Repeated output fixes mean the detection is happening too late.') },
    PB: { t: 'Stop rewarding the workaround.', d: 'Find the heroics that keep this problem invisible. Make the problem visible instead, and thank the person for showing it.',
          how: ['Identify who absorbs this problem when it recurs. Usually one or two people everyone relies on.', 'Ask them to stop absorbing it for a defined period and to make each occurrence visible instead.', 'Treat what surfaces as the real diagnosis. Fix that, and recognise them for surfacing it, not for the old heroics.'],
          watch: 'The problem becomes visible to leadership for the first time, and its true size is different from what everyone assumed.',
          book: bk('meadows', 'The direct intervention for shifting the burden: remove the symptomatic fix so the pressure returns to the real cause. It gets uncomfortable before it gets better, which is why the period should be defined in advance.'),
          more: bk('munger', 'An organization that rewards heroics will get heroics, and heroics require problems.') },
  },
};

export const LEARNING_OPTIONS = [
  { key: 'improved',   t: 'It improved.' },
  { key: 'same',       t: 'It didn\'t improve.' },
  { key: 'unexpected', t: 'Something unexpected happened.' },
  { key: 'notyet',     t: 'We haven\'t acted yet.' },
];

export const LEARNING_RESPONSES = {
  improved:   'Good. Write down what changed, in one line. That\'s the part worth repeating.',
  same:       'That\'s a signal too. Either the move was aimed at the symptom, or the system absorbed it. Both are worth knowing.',
  unexpected: 'Surprise is the most useful outcome. It means the model of the problem was wrong somewhere. That\'s where to look next.',
  notyet:     'Then the friction is upstream of the move. What stopped it from happening is the next diagnosis.',
};
