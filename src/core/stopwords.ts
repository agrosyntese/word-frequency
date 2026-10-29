import type { WordCount } from './types';

// Articles, prepositions, pronouns, conjunctions and auxiliary verbs: frequent but say little about the text.
const PORTUGUESE = `
a à ao aos aquela aquelas aquele aqueles aquilo as às até com como contra da das de dela delas dele deles
depois do dos e é ela elas ele eles em entre era eram essa essas esse esses esta está estão estas estava
estavam este estes eu foi foram há isso isto já lhe lhes mais mas me mesmo meu meus minha minhas muito na
não nas nem no nos nós nossa nossas nosso nossos num numa o os ou para pela pelas pelo pelos por quais qual
quando que quem se sem ser será seu seus si sido só sob sobre sua suas também te tem têm tinha tinham tu
teu teus tua tuas um uma umas uns você vocês vos são sua seja sejam ser estar ter havia pois porque então
lá aqui ali cada todo toda todos todas outro outra outros outras tão tanto quanto onde enquanto ainda
`;

const ENGLISH = `
a about above after again against all am an and any are as at be because been before being below between
both but by can could did do does doing down during each few for from further had has have having he her
here hers herself him himself his how i if in into is it its itself just me more most my myself no nor not
now of off on once only or other our ours ourselves out over own same she should so some such than that the
their theirs them themselves then there these they this those through to too under until up very was we
were what when where which while who whom why will with would you your yours yourself yourselves
don't doesn't didn't isn't aren't wasn't weren't won't can't couldn't shouldn't wouldn't i'm i've i'll
i'd you're you've you'll you'd he's she's it's we're we've they're they've that's there's let's
`;

export const STOPWORDS: ReadonlySet<string> = new Set(`${PORTUGUESE} ${ENGLISH}`.split(/\s+/).filter(Boolean));

export function removeStopwords(rows: WordCount[]): WordCount[] {
  return rows.filter(({ word }) => !STOPWORDS.has(word));
}
