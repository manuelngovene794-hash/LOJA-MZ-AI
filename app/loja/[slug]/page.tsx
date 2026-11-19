
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export default async function PublicStore({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if(!url||!key)
    return <main className="container" style={{padding:40}}>Loja indisponível.</main>;

  const supabase=createClient(url,key);

  const {data:store}=await supabase
    .from("stores")
    .select("id,name,description,subscription_status")
    .eq("slug",slug)
    .eq("subscription_status","active")
    .maybeSingle();

  if(!store)
    return <main className="container" style={{padding:40}}>
      <h1>Loja não encontrada</h1>
      <Link href="/">Voltar ao início</Link>
    </main>;

  const {data:products}=await supabase
    .from("products")
    .select("id,name,description,price,image_url,stock")
    .eq("store_id",store.id)
    .eq("is_published",true)
    .order("created_at",{ascending:false});

  return <main className="container" style={{padding:"30px 0"}}>
    <Link className="brand" href="/">LOJA MZ AI</Link>
    <section style={{padding:"28px 0"}}>
      <h1 style={{fontSize:38}}>{store.name}</h1>
      <p className="muted">{store.description}</p>
    </section>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:16}}>
      {(products||[]).map(p=>
        <article className="panel" key={p.id}>
          {p.image_url&&
            <img src={p.image_url} alt={p.name}
              style={{width:"100%",height:180,objectFit:"cover",borderRadius:12}}/>
          }
          <h3>{p.name}</h3>
          <p className="muted">{p.description}</p>
          <b style={{color:"#c71920"}}>
            {Number(p.price).toLocaleString("pt-MZ")} MT
          </b>
          <p className="muted">Disponível: {p.stock}</p>
        </article>
      )}
    </div>

    {(!products||products.length===0)&&
      <p className="muted">Esta loja ainda não publicou produtos.</p>
    }
  </main>;
    }
        
