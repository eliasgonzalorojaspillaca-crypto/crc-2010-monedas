import { getStore } from "@netlify/blobs";

const store = getStore("lcrc-registros");

const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(data, status=200) {
  return new Response(JSON.stringify(data), { status, headers });
}

function cleanText(v, max=200) {
  return String(v ?? "").trim().slice(0,max);
}

async function allRecords() {
  const { blobs } = await store.list({ prefix: "registro/" });
  const result = [];
  for (const item of blobs) {
    const value = await store.get(item.key, { type: "json", consistency: "strong" });
    if (value) result.push(value);
  }
  return result.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
}

async function allSuggestions() {
  const { blobs } = await store.list({ prefix: "sugerencia/" });
  const result = [];
  for (const item of blobs) {
    const value = await store.get(item.key, { type: "json", consistency: "strong" });
    if (value) result.push(value);
  }
  return result.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).slice(0,50);
}

export default async (request) => {
  if (request.method === "OPTIONS") return new Response("", {status:204, headers});

  const url = new URL(request.url);
  const path = url.pathname.split("/").filter(Boolean);
  const isSuggestions = path[path.length - 1] === "sugerencias";

  try {
    if (isSuggestions) {
      if (request.method === "GET") {
        return json({sugerencias: await allSuggestions()});
      }
      if (request.method === "POST") {
        const body = await request.json();
        const texto = cleanText(body.texto, 1000);
        if (!texto) return json({error:"La sugerencia está vacía."},400);

        const id = crypto.randomUUID();
        const item = {id, texto, createdAt:Date.now()};
        await store.setJSON(`sugerencia/${id}`, item);
        return json(item,201);
      }
      return json({error:"Método no permitido."},405);
    }

    if (request.method === "GET") {
      return json({registros: await allRecords()});
    }

    if (request.method === "POST") {
      const body = await request.json();
      const nombre = cleanText(body.nombre,200);
      const talla = cleanText(body.talla,10).toUpperCase();
      const numero = cleanText(body.numero,30);

      if (!nombre || !talla || !numero)
        return json({error:"Complete nombre, talla y número."},400);

      const validTallas = new Set(["S","M","L","XL","XXL"]);
      if (!validTallas.has(talla))
        return json({error:"Talla no válida."},400);

      const existing = await allRecords();
      const duplicate = existing.some(
        r => String(r.numero).toLowerCase() === numero.toLowerCase()
      );

      const id = crypto.randomUUID();
      const item = {id,nombre,talla,numero,createdAt:Date.now()};
      await store.setJSON(`registro/${id}`, item);

      const registros = [item,...existing].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
      return json({item,duplicate,registros},201);
    }

    if (request.method === "DELETE") {
      const id = cleanText(url.searchParams.get("id"),100);
      if (!id) return json({error:"Falta el ID."},400);
      await store.delete(`registro/${id}`);
      return json({ok:true});
    }

    return json({error:"Método no permitido."},405);
  } catch (error) {
    console.error(error);
    return json({error:"Error interno al acceder a la base central."},500);
  }
};
