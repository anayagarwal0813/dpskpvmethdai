import { z } from 'zod'

export const MOOD_IDS = ['stressed', 'tired', 'excited', 'calm'] as const
export type MoodId = (typeof MOOD_IDS)[number]

export const analysisSchema = z.object({
  mood: z.enum(MOOD_IDS),
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  questTitle: z.string(),
  steps: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        minutes: z.number(),
      }),
    )
    .length(3),
})

export type AnalysisResult = z.infer<typeof analysisSchema> & {
  source: 'ai' | 'fallback'
}

export type MoodTheme = {
  id: MoodId
  label: string
  shortLabel: string
  tagline: string
  badge: string
  surface: string
  border: string
  text: string
  solid: string
  bar: string
}

export const MOODS: Record<MoodId, MoodTheme> = {
  stressed: {
    id: 'stressed',
    label: 'Stressed / Overwhelmed',
    shortLabel: 'Stressed',
    tagline: "Let's slow things down and lighten the load.",
    badge: 'Calm Commander',
    surface: 'bg-stressed-soft',
    border: 'border-stressed/40',
    text: 'text-stressed',
    solid: 'bg-stressed text-white',
    bar: 'bg-stressed',
  },
  tired: {
    id: 'tired',
    label: 'Tired / Low Energy',
    shortLabel: 'Tired',
    tagline: 'Gentle recharge mode activated.',
    badge: 'Battery Rebooter',
    surface: 'bg-tired-soft',
    border: 'border-tired/40',
    text: 'text-tired',
    solid: 'bg-tired text-white',
    bar: 'bg-tired',
  },
  excited: {
    id: 'excited',
    label: 'Excited / Energized',
    shortLabel: 'Excited',
    tagline: "Let's channel that spark into something great!",
    badge: 'Energy Rocket',
    surface: 'bg-excited-soft',
    border: 'border-excited/40',
    text: 'text-excited',
    solid: 'bg-excited text-white',
    bar: 'bg-excited',
  },
  calm: {
    id: 'calm',
    label: 'Calm / Happy',
    shortLabel: 'Calm',
    tagline: 'Good vibes! Time to spread and savor them.',
    badge: 'Sunshine Keeper',
    surface: 'bg-calm-soft',
    border: 'border-calm/40',
    text: 'text-calm',
    solid: 'bg-calm text-white',
    bar: 'bg-calm',
  },
}

export type SampleEntry = {
  id: string
  label: string
  text: string
  expected: MoodId
  challenging?: boolean
}

export const SAMPLE_ENTRIES: SampleEntry[] = [
  {
    id: 's1',
    label: 'Exam pile-up',
    text: 'I have a math test, a history essay and a science project all due this week. I keep making lists but I feel like I am drowning and I cannot focus on anything.',
    expected: 'stressed',
  },
  {
    id: 's2',
    label: 'Sleepy morning',
    text: 'Stayed up way too late finishing homework. I yawned through first period and my eyes kept closing in class. I just want to nap.',
    expected: 'tired',
  },
  {
    id: 's3',
    label: 'Made the team!',
    text: 'I MADE THE BASKETBALL TEAM!!! Coach called my name and I literally jumped. Cannot wait for the first practice tomorrow!',
    expected: 'excited',
  },
  {
    id: 's4',
    label: 'Peaceful lunch',
    text: 'Had a nice quiet lunch with my best friend under the big tree. We laughed about silly things. Today felt easy and good.',
    expected: 'calm',
  },
  {
    id: 's5',
    label: 'Sarcastic "great" day',
    text: "Oh great, another group project where I do everything. Just perfect. Love that for me. Totally fine. Everything's fine.",
    expected: 'stressed',
    challenging: true,
  },
  {
    id: 's6',
    label: 'Tired but happy',
    text: 'Field trip was amazing but we walked for like six hours. My legs are dead and I can barely keep my eyes open on the bus home.',
    expected: 'tired',
    challenging: true,
  },
  {
    id: 's7',
    label: 'Nervous-excited',
    text: 'My heart is racing! Presenting my robot at the science fair in 10 minutes. I practiced so much and I think it is going to be awesome.',
    expected: 'excited',
    challenging: true,
  },
  {
    id: 's8',
    label: 'Short & vague',
    text: 'meh. fine i guess. nothing happened.',
    expected: 'calm',
    challenging: true,
  },
  {
    id: 's9',
    label: 'Slang & emojis',
    text: "ngl today was lowkey a vibe 😌 finished my reading, drew for an hour, mom made tacos. no complaints fr",
    expected: 'calm',
    challenging: true,
  },
  {
    id: 's10',
    label: 'Mixed signals',
    text: 'I was so hyped for the concert tonight but then I remembered the chemistry quiz tomorrow that I have not studied for at all and now my stomach hurts.',
    expected: 'stressed',
    challenging: true,
  },
]

const KEYWORDS: Record<MoodId, string[]> = {
  stressed: [
    'stress', 'overwhelm', 'anxious', 'worried', 'drowning', 'deadline', 'too much',
    'panic', 'cannot focus', "can't focus", 'pressure', 'test', 'quiz', 'exam', 'stomach hurts', 'everything',
  ],
  tired: [
    'tired', 'sleepy', 'exhausted', 'yawn', 'nap', 'drained', 'late', 'eyes', 'dead', 'barely', 'sleep', 'low energy',
  ],
  excited: [
    'excited', 'hyped', 'cannot wait', "can't wait", 'awesome', 'amazing', '!!!', 'jumped', 'racing', 'thrilled', 'made the',
  ],
  calm: [
    'calm', 'peaceful', 'quiet', 'good', 'nice', 'happy', 'relaxed', 'easy', 'vibe', 'fine', 'laughed', 'chill',
  ],
}

const FALLBACK_QUESTS: Record<MoodId, Pick<AnalysisResult, 'questTitle' | 'steps'>> = {
  stressed: {
    questTitle: 'The Calm-Down Quest',
    steps: [
      { title: 'Box breathing', description: 'Breathe in 4s, hold 4s, out 4s, hold 4s. Repeat 4 times.', minutes: 2 },
      { title: 'Brain dump', description: 'Write every worry on paper, then circle just ONE to tackle first.', minutes: 5 },
      { title: 'Tiny win', description: 'Work on that one task for a focused 10-minute sprint.', minutes: 10 },
    ],
  },
  tired: {
    questTitle: 'The Recharge Quest',
    steps: [
      { title: 'Water break', description: 'Drink a full glass of water slowly.', minutes: 1 },
      { title: 'Stretch it out', description: 'Do 5 big stretches: reach up, touch toes, twist, roll shoulders, neck circles.', minutes: 3 },
      { title: 'Sunlight sprint', description: 'Step outside or near a window for fresh air and light.', minutes: 5 },
    ],
  },
  excited: {
    questTitle: 'The Spark Channeler Quest',
    steps: [
      { title: 'Capture it', description: 'Write down 3 things you are excited about right now.', minutes: 3 },
      { title: 'Plan a move', description: 'Pick one and write the very next step to make it happen.', minutes: 4 },
      { title: 'Share the joy', description: 'Tell a friend or family member your good news.', minutes: 5 },
    ],
  },
  calm: {
    questTitle: 'The Good Vibes Quest',
    steps: [
      { title: 'Gratitude trio', description: 'List 3 things that made today good.', minutes: 3 },
      { title: 'Kindness drop', description: 'Send a kind message or compliment to someone.', minutes: 3 },
      { title: 'Creative moment', description: 'Doodle, hum, or write a tiny poem about your day.', minutes: 7 },
    ],
  },
}

export function fallbackAnalyze(text: string): AnalysisResult {
  const lower = text.toLowerCase()
  const scores = MOOD_IDS.map((id) => ({
    id,
    score: KEYWORDS[id].reduce((sum, word) => (lower.includes(word) ? sum + 1 : sum), 0),
  })).sort((a, b) => b.score - a.score)

  const top = scores[0].score === 0 ? 'calm' : scores[0].id
  const total = scores.reduce((sum, s) => sum + s.score, 0) || 1

  return {
    mood: top,
    confidence: Math.round(Math.max(40, Math.min(85, (scores[0].score / total) * 100))),
    reasoning: `Keyword backup mode: your entry contains words often linked with feeling ${MOODS[top].shortLabel.toLowerCase()}.`,
    ...FALLBACK_QUESTS[top],
    source: 'fallback',
  }
}
