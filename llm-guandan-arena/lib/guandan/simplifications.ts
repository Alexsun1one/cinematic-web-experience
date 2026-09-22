export const SIMPLIFICATIONS: { zh: string; en: string }[] = [
  {
    zh: "两副牌 108 张，四人各 27 张。座位 0+2 为南北，1+3 为东西。",
    en: "Two decks, 108 cards, 27 each. Seats 0+2 are North-South; seats 1+3 are East-West.",
  },
  {
    zh: "级牌为当前庄家队伍的等级。红桃级牌两张为逢人配，可补点数与花色，不能当王。",
    en: "The level is the dealer team's rank. Both heart level-cards are wild. They fill ranks and suits; they are never jokers.",
  },
  {
    zh: "牌型：单张、对子、三张、三带二、五张顺子、三连对、钢板、四至八炸、同花顺、四大天王。同花顺只当炸弹，不降为顺子。",
    en: "Combos: single, pair, triple, full house, 5-straight, three consecutive pairs, two consecutive triples, bombs of 4–8, straight flush, and four jokers. A straight flush is only a bomb.",
  },
  {
    zh: "顺子、三连对、钢板按自然点数比较，A 最大且不回头（没有 A-2-3-4-5）。对子、三张、三带二和炸弹按级牌大于 A、小于王。",
    en: "Straights, pair-tubes, and plates use natural rank, ace high, no wrap. Pairs, triples, full houses, and bombs rank the level card above aces and below jokers.",
  },
  {
    zh: "同点同型只保留一组代表牌，优先少用逢人配。炸弹可压任意非炸弹；更大的炸弹压较小炸弹。同花顺大于五炸、小于六炸。",
    en: "One representative holding is kept per pattern and rank, spending as few wilds as possible. Bombs beat non-bombs; bigger bombs beat smaller ones. A straight flush sits between a 5-bomb and a 6-bomb.",
  },
  {
    zh: "无人压过则赢墩者领出；若其已出完，对家接风。下一局发牌后先进贡或抗贡，再由头游领出。",
    en: "The trick winner leads. If they are out, their partner takes the lead. The next hand tributes or resists, then first-out leads.",
  },
  {
    zh: "升级只升不降，直到 A：双下 +3，头游+三游 +2，头游+末游 +1。升到 A 不算赢。在 A 上头游且对家不是末游才过 A；头游+末游留在 A。同一方累计 3 次失败退回打 2，过 A 成功则次数清零。竞赛可以一直停在 A（GUANDAN_ACE_STRIKES=0）。打满约定局数时，级牌高的一方领先。",
    en: "Winners upgrade only until A: both opponents trail +3, first and third +2, first and last +1. Reaching A does not win. On A the attacking side passes only with first place and a partner who is not last. First and last stays on A. Three such failures drop that side to 2; a successful pass clears the counter. Set GUANDAN_ACE_STRIKES=0 to stay on A. A fixed-length series is led by the higher level.",
  },
];
