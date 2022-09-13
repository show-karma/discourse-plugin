export const getVoteBreakdown = (votes = []) => {
  const vb = { for: 0, abs: 0, no: 0, total: votes.length };
  votes.forEach((item) => {
    item.choice === 1 ? vb.for++ : item.choice === 2 ? vb.no++ : vb.abs++;
  });
  return vb;
};
