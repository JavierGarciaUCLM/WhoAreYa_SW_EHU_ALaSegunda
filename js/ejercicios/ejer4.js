const big4 = ['ESP', 'ENG', 'ITA', 'FRA'];
fetch('../competitions.json')
    .then(r => r.json())
    .then(data => {
    const comps = data.competitions;
    const big4TierOne = comps.filter(
        c => c.plan === 'TIER_ONE' && big4.includes(c.area.code)
    );
    console.log(big4TierOne);
});
