export { fetchJSON };

async function fetchJSON(what) {
  const url = `./json/${what}.json`; // p.ej.: ./json/fullplayers25.json, ./json/solution25.json
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error cargando ${url}: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data;
}
