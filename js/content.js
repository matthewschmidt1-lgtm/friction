// Friction — content
// Every option carries silent weights: l = lens (B business, S system, P people),
// e = edge (BS, SP, PB), tags = signals used for the decision statements and blind spot.

export const LENSES = {
  B: { key: 'B', name: 'Business', line: 'Are we creating enough value?', verb: 'Create value' },
  S: { key: 'S', name: 'System',   line: 'Can the organization create it repeatedly?', verb: 'Create leverage' },
  P: { key: 'P', name: 'People',   line: 'Can people actually make it happen?', verb: 'Create capability' },
};

export const EDGES = {
  BS: {
    key: 'BS', a: 'B', b: 'S', name: 'Business ↔ System',
    primary: 'You appear to know what you want to accomplish, but the mechanisms for accomplishing it aren\'t aligned with it.',
    secondary: 'The way work gets done may also be quietly out of step with what the business is asking for.',
  },
  SP: {
    key: 'SP', a: 'S', b: 'P', name: 'System ↔ People',
    primary: 'The organization appears to be asking people to compensate for problems in the system.',
    secondary: 'People may also be absorbing friction the system should be carrying.',
  },
  PB: {
    key: 'PB', a: 'P', b: 'B', name: 'People ↔ Business',
    primary: 'People seem willing and able to act, but what matters most hasn\'t reached them clearly enough to act on.',
    secondary: 'What matters most may also not be landing with the people expected to deliver it.',
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
      o('Growth', { B: 1 }),
      o('Profitability', { B: 1 }),
      o('Customer performance', { B: 1, S: .5 }),
      o('Execution', { S: 1 }),
      o('Decision-making', { B: .5, S: .5 }, {}, ['decisions']),
      o('Productivity', { S: 1, P: .5 }),
      o('Organizational effectiveness', { S: .5, P: 1 }),
      o('Something else', {}, {}, [], { other: true }),
    ],
  },
  {
    id: 'symptoms', stage: 0, type: 'multi',
    eyebrow: 'What are you seeing?',
    title: 'Pick everything that sounds like you.',
    help: 'In your words, not ours. Choose as many as fit.',
    options: [
      o('We\'re working harder but results aren\'t improving.', { S: 1, B: .5 }, { BS: 1 }, ['harder', 'repeat']),
      o('We have plenty of data but struggle to make decisions.', { B: 1, P: .5 }, { PB: .5 }, ['lots-of-data', 'more-info', 'meaning']),
      o('Decisions are made but don\'t translate into action.', { S: 1, P: 1 }, { SP: 1 }, ['execute']),
      o('Everyone seems busy, but progress is slow.', { S: 1 }, { BS: .5, SP: .5 }, ['activity']),
      o('Different teams have different versions of reality.', { B: 1, P: .5 }, { PB: 1 }, ['meaning', 'different-realities']),
      o('We keep solving the same problems.', { S: 1 }, { SP: .5 }, ['repeat']),
      o('We have good strategy but poor execution.', { B: .5, S: 1 }, { BS: 1 }, ['execute']),
      o('People don\'t seem empowered to act.', { P: 1, S: .5 }, { SP: 1 }, ['authority', 'execute']),
      o('We keep adding processes, meetings, or tools.', { S: 1 }, { BS: .5 }, ['adding', 'repeat']),
      o('We aren\'t sure what actually matters anymore.', { B: 1, P: .5 }, { PB: 1 }, ['clarity', 'meaning']),
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
      o('We know what the problem is.', {}, {}, ['bs-know']),
      o('We have a lot of data about the problem.', {}, {}, ['bs-data', 'lots-of-data']),
      o('We\'ve tried several things already.', {}, {}, ['bs-tried']),
      o('Everyone agrees on what\'s causing it.', {}, {}, ['bs-agree']),
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
      o('Extremely clear', {}, {}, ['clear']),
      o('Mostly clear', { B: .25 }),
      o('Different groups prioritize different things', { B: 1, P: .5 }, { PB: 1 }, ['meaning', 'priorities-differ']),
      o('We\'re measuring a lot but aren\'t sure what matters', { B: 1 }, {}, ['lots-of-data', 'clarity', 'more-info']),
      o('Honestly, I\'m not sure', { B: 1 }, {}, ['clarity']),
    ],
  },
  {
    id: 'why', stage: 2, lens: 'B', type: 'single',
    eyebrow: 'Business · Create value',
    title: 'When performance changes, how quickly can you identify why?',
    options: [
      o('We usually know', {}),
      o('We have hypotheses', { B: .25 }),
      o('We debate competing explanations', { B: .75, P: .25 }, { PB: .5 }, ['meaning', 'debate']),
      o('We produce more analysis', { B: 1 }, {}, ['more-info', 'more-analysis', 'activity']),
      o('We often don\'t know', { B: 1 }, {}, ['info']),
    ],
  },
  {
    id: 'noise', stage: 2, lens: 'B', type: 'multi',
    eyebrow: 'Business · Create value',
    title: 'What gets more attention than it probably deserves?',
    help: 'Choose as many as fit.',
    options: [
      o('Reporting', { B: .5, S: .25 }, {}, ['noise', 'more-info']),
      o('Internal processes', { S: .75 }, {}, ['noise', 'adding']),
      o('Short-term targets', { B: .75 }, { BS: .5 }, ['noise']),
      o('Legacy metrics', { B: .75 }, {}, ['noise', 'lots-of-data']),
      o('Meetings', { S: .5 }, {}, ['noise', 'activity']),
      o('Firefighting', { S: .75, P: .25 }, { SP: .5 }, ['noise', 'repeat']),
      o('Something else', {}, {}, [], { other: true }),
    ],
  },
  {
    id: 'slow', stage: 2, lens: 'S', type: 'multi',
    eyebrow: 'System · Create leverage',
    title: 'Where does work slow down?',
    help: 'Choose as many as fit.',
    options: [
      o('Too many approvals', { S: 1, P: .5 }, { SP: 1 }, ['authority', 'execute']),
      o('Too many handoffs', { S: 1 }, {}, ['execute', 'handoffs']),
      o('Conflicting priorities', { B: .75, S: .5 }, { BS: 1 }, ['meaning', 'priorities-differ']),
      o('Poor processes', { S: 1 }, {}, ['execute']),
      o('Technology or tools', { S: 1 }),
      o('Organizational structure', { S: 1 }, { BS: .5 }),
      o('Decision rights', { S: .5, P: 1 }, { SP: 1 }, ['authority']),
      o('Meetings', { S: .75 }, {}, ['activity']),
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
      o('It depends on the person', { S: 1, P: .5 }, { SP: 1 }, ['hero']),
      o('We tend to reinvent it', { S: 1 }, {}, ['repeat']),
    ],
  },
  {
    id: 'act', stage: 2, lens: 'P', type: 'single',
    eyebrow: 'People · Create capability',
    title: 'Can people act on what the organization knows?',
    options: [
      o('They know what to do and can act.', {}),
      o('They know what to do but need approval.', { P: .75, S: .5 }, { SP: 1 }, ['authority']),
      o('They aren\'t sure what they\'re allowed to decide.', { P: 1, S: .5 }, { SP: 1 }, ['authority']),
      o('They understand the goal but lack the capability.', { P: 1 }, {}, ['capability']),
      o('The incentives point somewhere else.', { P: 1, B: .5 }, { PB: 1 }, ['incentive']),
      o('Different leaders are giving different signals.', { P: .75, B: .75 }, { PB: 1 }, ['meaning', 'clarity', 'priorities-differ']),
    ],
  },
  {
    id: 'inway', stage: 2, lens: 'P', type: 'single',
    eyebrow: 'People · Create capability',
    title: 'What\'s most likely getting in the way?',
    options: [
      o('Clarity', { P: .75, B: .5 }, { PB: 1 }, ['clarity'], { sub: 'They don\'t know what matters.' }),
      o('Authority', { P: .75, S: .5 }, { SP: 1 }, ['authority'], { sub: 'They aren\'t sure they\'re allowed to act.' }),
      o('Capability', { P: 1 }, {}, ['capability'], { sub: 'They don\'t know how.' }),
      o('Incentive', { P: .75, B: .5 }, { PB: .5 }, ['incentive'], { sub: 'They don\'t have a reason to.' }),
    ],
  },
];

// Synthesised "real problem" statements. Ranked by tag fit, never labelled.
export const DECISIONS = {
  info:    { key: 'info',    t: 'We don\'t have enough information.',                                   tags: ['more-info', 'info', 'lots-of-data', 'more-analysis'] },
  meaning: { key: 'meaning', t: 'We don\'t agree on what the information means.',                        tags: ['meaning', 'debate', 'different-realities', 'priorities-differ', 'clarity'] },
  execute: { key: 'execute', t: 'We know what needs to happen, but the organization can\'t execute it.', tags: ['execute', 'authority', 'capability', 'handoffs'] },
  repeat:  { key: 'repeat',  t: 'We keep doing things that aren\'t changing the result.',                tags: ['repeat', 'adding', 'activity', 'harder', 'hero'] },
};

// Blind spot rules. First match wins. `when` receives the analysis.
export const BLIND_SPOTS = [
  { when: a => a.decision === 'info' && (a.has('lots-of-data') || a.has('more-analysis')),
    t: 'You may be trying to solve a clarity problem with more information.',
    why: 'You described plenty of data and chose "not enough information." Those rarely sit together unless the missing piece is agreement, not analysis.' },
  { when: a => a.decision === 'execute' && a.primary === 'SP',
    t: 'You may be asking people to perform around a system that is working against them.',
    why: 'The execution gap you chose lines up with approvals, decision rights and handoffs. That\'s a system shape, not a people shape.' },
  { when: a => a.decision === 'execute' && a.primary === 'BS',
    t: 'You may be treating a business problem as an execution problem.',
    why: 'The organization struggles to execute, but your answers about what matters most were not clear either. Execution can\'t outrun ambiguity.' },
  { when: a => a.bs === 'bs-agree',
    t: 'When everyone agrees on the cause, the cause has usually stopped being examined.',
    why: 'You chose "everyone agrees on what\'s causing it." Agreement is comfortable. It is not the same as being right.' },
  { when: a => a.bs === 'bs-external',
    t: 'Waiting for conditions to improve may be the most expensive decision you\'re currently making.',
    why: 'You described waiting on external conditions. Waiting is a choice, and it protects the things that would otherwise have to change.' },
  { when: a => a.bs === 'bs-tried',
    t: 'You may have tried several solutions to a problem you haven\'t fully defined.',
    why: 'Several attempts and the same result usually means the attempts were aimed at the symptom.' },
  { when: a => a.bs === 'bs-know' && a.decision === 'meaning',
    t: 'Knowing what the problem is and agreeing on what it means are different problems.',
    why: 'You said the organization knows the problem, then chose "we don\'t agree on what the information means." One of those is doing more work than the other.' },
  { when: a => a.bs === 'bs-unsure',
    t: 'You may be the only one asking whether this is the right problem. That is usually the most valuable seat in the room.',
    why: 'Doubt about the problem is a signal, not a weakness. Most organizations lose it early.' },
  { when: a => a.decision === 'repeat' && a.has('adding'),
    t: 'You may be adding activity because changing the underlying system feels harder.',
    why: 'More processes, meetings or tools showed up in your answers. Activity is often what an organization does instead of a decision.' },
  { when: a => a.decision === 'meaning' && a.primary === 'PB',
    t: 'You may be asking people to be clearer than the business has been with them.',
    why: 'Different versions of reality across teams usually trace back to a priority that was never actually chosen.' },
  { when: a => a.decision === 'repeat',
    t: 'You may keep solving this problem because solving it has become part of how the organization works.',
    why: 'A problem that returns on schedule is usually being maintained by something: a metric, a meeting, a role that exists to manage it.' },
  { when: a => a.bs === 'bs-data',
    t: 'The data about the problem may be standing in for a decision about the problem.',
    why: 'You said there is a lot of data about it. Data that hasn\'t changed a decision is a form of waiting.' },
  { when: a => a.primary === 'BS',
    t: 'You know what you want. The machine was built for something else.',
    why: 'Your answers about direction were stronger than your answers about how work gets done.' },
  { when: a => a.primary === 'SP',
    t: 'Someone is quietly compensating for the system. That person is the reason the problem is still invisible.',
    why: 'When results depend on the person, the system has stopped carrying its share.' },
  { when: () => true,
    t: 'You may be looking for the problem inside a lens, when it lives in the gap between two.',
    why: 'Your answers spread across all three lenses. The friction is in how they connect.' },
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

// The next move, by decision × primary edge.
export const NEXT_MOVES = {
  info: {
    BS: { t: 'Stop measuring everything.', d: 'Identify the three measures that actually change a decision. Retire the reports that don\'t feed one of them.' },
    SP: { t: 'Find the decision, not the data.', d: 'Pick one recurring decision that stalls. Write down the information it actually needs. Cut everything else from the pack.' },
    PB: { t: 'Ask before you analyze.', d: 'Ask the people closest to the work what they would need to know to act. Build that first, and nothing else this month.' },
  },
  meaning: {
    BS: { t: 'Put one number on the table.', d: 'Choose the single measure that would define success this quarter. Argue until it\'s one. Then let every other target answer to it.' },
    SP: { t: 'Write the decision down.', d: 'For the next contested decision, record who decided, on what basis, and what would change their mind. Share it.' },
    PB: { t: 'Say the priority out loud.', d: 'Have each leader write what matters most this quarter, alone. Compare the lists in the same room. Resolve the differences before anyone leaves.' },
  },
  execute: {
    BS: { t: 'Retire one conflicting goal.', d: 'Find the target that quietly contradicts the priority you say matters. Drop it, and say why in public.' },
    SP: { t: 'Clarify one decision right.', d: 'Find one recurring decision that requires unnecessary escalation and explicitly assign the authority to make it.' },
    PB: { t: 'Trade a request for a reason.', d: 'Pick the thing people aren\'t doing. Ask what would make it worth doing. Change that, not the request.' },
  },
  repeat: {
    BS: { t: 'Kill one recurring activity.', d: 'Take one meeting, report, approval or process that exists because "we\'ve always done it" and test what happens without it.' },
    SP: { t: 'Fix the process once.', d: 'Take the problem you keep solving and change the step that keeps producing it, instead of solving the output again.' },
    PB: { t: 'Stop rewarding the workaround.', d: 'Find the heroics that keep this problem invisible. Make the problem visible instead, and thank the person for showing it.' },
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
