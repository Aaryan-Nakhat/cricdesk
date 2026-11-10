/**
 * Plain-words definitions for terms that appear on more than one page. A visitor can land on any page
 * from a link, so every term a table or badge uses is explained where it appears (the <Term> (i) button),
 * not only on "How it works". Page-only terms live beside their page and go through <Term tip=…>.
 * Keep each entry to what a franchise analyst needs to read the number: what it is, its unit, which way is good.
 */
export interface GlossaryEntry {
  title: string;
  text: string;
}

export const GLOSSARY = {
  // --- players and where they come from
  free_agent: {
    title: "Free agent",
    text: "Not under contract with any IPL franchise, so he can be bought at the auction (a player released last time and unsold, or one who has never been in the IPL).",
  },
  released_by: {
    title: "Released by",
    text: "Under contract with that franchise now, but our Keep or release call says it lets him go before the retention deadline, so he would enter the auction.",
  },
  overseas: {
    title: "Overseas",
    text: "Not an Indian player. A squad may hold at most 8 overseas players and field at most 4 in a match.",
  },
  uncapped: {
    title: "Uncapped",
    text: "An Indian player who has not played international cricket for India. Uncapped players have lower base prices and retention costs.",
  },
  home_grown: {
    title: "Home-grown",
    text: "The franchise was his first IPL team. Franchises keep their own finds more often.",
  },
  acquired: {
    title: "How he joined",
    text: "retained = kept at the 2025 mega auction's retention; auction = bought at an auction; trade = traded in from another franchise; replacement = signed during a season to replace an injured or unavailable player.",
  },
  smat_stale: {
    title: "Old domestic data",
    text: "Part of his rating rests on a domestic league whose ball-by-ball data in our source stops early: the Syed Mushtaq Ali Trophy (India's domestic T20) ends Dec 2024, CSA T20 (South Africa's) Oct 2024. The share is how much of his rating comes from those matches: the higher it is, the more out of date the rating may be.",
  },
  // --- value and price
  value: {
    title: "Value",
    text: "Runs per 100 balls better (+) or worse (−) than an average IPL player, batting and bowling together, judged against the bowlers and batters he actually faced. 0 is average; +5 or more is a regular in a strong XI.",
  },
  value_range: {
    title: "± range",
    text: "How sure the rating is: the true value is within this distance about two times in three. A small sample (few balls) gives a wide range.",
  },
  market_price: {
    title: "Market price",
    text: "In crore (1 cr = 10 million rupees). The median price players like him (same value, age, caps, overseas or not) fetched at real IPL auctions 2018-2026, from a model fitted on every sale. A typical estimate is off by a factor of about 1.9 either way.",
  },
  dearer_quarter: {
    title: "Dearer quarter",
    text: "The price the dearer quarter of players like him fetched (the upper quartile): a high-end market price.",
  },
  pct_bought: {
    title: "% bought",
    text: "The chance a franchise buys a player like him if he is in the auction, fitted on past auctions. The rest go unsold.",
  },
  cr: {
    title: "cr (crore)",
    text: "1 crore = 10 million Indian rupees. All salaries, prices and purses are in crore.",
  },
  // --- retention
  cost_to_keep: {
    title: "Cost to keep",
    text: "What keeping him takes from the purse: his salary, or for a player retained at the 2025 mega auction the 2025 retention slab (18, 14, 11 cr ...) assumed to still apply.",
  },
  chance_kept: {
    title: "Chance kept",
    text: "How often franchises kept players like him at real retention deadlines 2018-2026 (a model of every deadline). It says what teams do, not what they should do.",
  },
  likely_call: {
    title: "Likely call",
    text: "Keep when the chance kept is 65% or more, Release under 35%, Toss-up in between (lean keep from 50%). A toss-up really is close to a coin flip.",
  },
  should_they: {
    title: "Worth his cost?",
    text: "Yes when players like him fetch at least his cost to keep at auction, No when even the dearer quarter fetch less, Close in between. Can't judge: bought on domestic form our data doesn't have.",
  },
  purse: {
    title: "Purse",
    text: "The money a franchise has for the auction: 125 cr assumed for 2027 (not yet announced) minus the cost of everyone kept.",
  },
  // --- match impact and form
  ngi: {
    title: "Win chance added (Net Game Impact)",
    text: "How much a player moves his side's chance of winning, per match, credited ball by ball (batting, bowling, fielding). +5% turns a 50-50 game into 55-45. Most IPL regulars sit between −4% and +3%.",
  },
  forecast: {
    title: "3-season outlook",
    text: "The form forecast: his value (runs per 100 balls above average) for each of the next three seasons, median, from a model of how players' levels move season to season and with age. Holding, improving or declining describes the path.",
  },
  // --- auction planning
  max_bid: {
    title: "Max bid",
    text: "Your walk-away price: the most he is worth to your squad, given what the same money and squad place would buy later in the auction.",
  },
  rivals_pay: {
    title: "Rivals pay",
    text: "The middle of the prices the other nine franchises would pay for him across the simulated auctions: the price to beat.",
  },
  usually_enough: {
    title: "Usually enough",
    text: "A bid that wins him in 9 of 10 simulated auctions.",
  },
  p_le_max: {
    title: "Chance at or under max",
    text: "The share of simulated auctions in which your max bid is enough to land him.",
  },
} satisfies Record<string, GlossaryEntry>;

export type GlossaryKey = keyof typeof GLOSSARY;
