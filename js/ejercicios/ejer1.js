fetch('../competitions.json')
  .then(r => r.json())
  .then(data => {
    const competitions = data.competitions;
    const laLiga = competitions.filter(c => c.id === 2014);
    console.log(laLiga);
  });