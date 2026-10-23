"use client";
export default function Error({retry}:{retry:()=>void}){return <section><h1>Les œuvres ne peuvent pas être chargées</h1><p role="alert">Le catalogue est momentanément indisponible. Réessayez dans quelques instants.</p><button onClick={retry}>Réessayer</button></section>;}
