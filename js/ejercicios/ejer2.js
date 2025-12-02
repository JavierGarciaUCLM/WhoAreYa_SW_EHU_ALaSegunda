fetch('../competitions.json')
  .then(r => r.json())
  .then(data => {
    const competitions = data.competitions;
    const tierOne = competitions.filter(c => c.plan === 'TIER_ONE');
    console.log(tierOne);
  });