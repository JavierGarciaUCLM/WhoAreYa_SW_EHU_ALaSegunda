fetch('../competitions.json')
  .then(r => r.json())
  .then(data => {
    const comps = data.competitions;
    const spanish = comps.filter(c => c.area.code === 'ESP');
    console.log(spanish);
  });