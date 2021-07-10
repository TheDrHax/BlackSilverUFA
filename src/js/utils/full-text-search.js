export function tokenize(string) {
  return string.trim().split(' ').map((word) => {
    const match = word.toLowerCase().match(/[a-zа-я0-9]+/g);
    return match ? match.join('') : '';
  });
}

export default function fts(query, items, lambda) {
  query = tokenize(query);
  let maxRank = 0;

  return items
    .map((item) => {
      const words = tokenize(lambda(item));

      const rank = query.map((queryWord) => (
        words.filter((word) => word.startsWith(queryWord)).length > 0
      )).reduce((a, b) => a + b);

      if (rank > maxRank) {
        maxRank = rank;
      }

      return { item, rank };
    })
    .filter((item) => item.rank === maxRank && item.rank > 0)
    .map((item) => item.item);
}
