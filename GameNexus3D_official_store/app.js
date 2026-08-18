const API_KEY = "4b8f247902074ddea77f64c35a4cfdc3"; // Optional: paste your RAWG API key here.
const API = "https://api.rawg.io/api";
const fallback = [
["Cyberpunk 2077","2020","RPG • Action","4.6","https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900"],
["Red Dead Redemption 2","2018","Action • Adventure","4.7","https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900"],
["Elden Ring","2022","RPG • Action","4.8","https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900"],
["The Witcher 3: Wild Hunt","2015","RPG • Adventure","4.7","https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=900"],
["Grand Theft Auto V","2013","Action • Open World","4.5","https://images.unsplash.com/photo-1605899435973-ca2d1a8861cf?w=900"],
["Minecraft","2011","Adventure • Sandbox","4.4","https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=900"],
["Hogwarts Legacy","2023","RPG • Adventure","4.3","https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=900"],
["Forza Horizon 5","2021","Racing • Open World","4.5","https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=900"]
].map((x,i)=>({id:"demo"+i,name:x[0],released:x[1],genre:x[2],rating:+x[3],background_image:x[4],platforms:[{platform:{name:"PC"}}],metacritic:80+i,description:"A featured GameNexus title. Connect a RAWG API key to load live game data and detailed requirements."}));

let games=[...fallback], page=1, library=JSON.parse(localStorage.getItem("gamenexus-library")||"[]");

const $=s=>document.querySelector(s);
const escapeHTML=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

async function fetchGames(extra=""){
  if(!API_KEY){renderGames(games); fillPC(); return;}
  const params=new URLSearchParams({key:API_KEY,page,page_size:20,ordering:$("#sort").value,...(extra?{search:extra}:{})});
  if($("#genre").value) params.set("genres",{"Action":"4","RPG":"5","Adventure":"3","Strategy":"10","Shooter":"2","Racing":"1"}[$("#genre").value]||"");
  try{const r=await fetch(`${API}/games?${params}`);if(!r.ok)throw Error();const d=await r.json();games=page===1?d.results:[...games,...d.results];renderGames(games);fillPC()}catch(e){toast("Using demo data — add your RAWG key for live data.");renderGames(games)}}

function renderGames(list){
 const q=$("#heroSearch").value.toLowerCase();
 let shown=list.filter(g=>!q||g.name.toLowerCase().includes(q)||(g.genres||[]).some(x=>x.name?.toLowerCase().includes(q))||String(g.genre||"").toLowerCase().includes(q));
 $("#games").innerHTML=shown.map(card).join("")||`<div class="loading">No games found.</div>`;
}
function card(g){
 const saved=library.includes(String(g.id));
 const genres=g.genres?.map(x=>x.name).join(" • ")||g.genre||"Game";
 return `<article class="game-card"><div class="cover" style="background-image:url('${g.background_image||""}')"><span class="rating">★ ${Number(g.rating||0).toFixed(1)}</span></div><div class="game-info"><h3>${escapeHTML(g.name)}</h3><div class="meta">${escapeHTML(genres)} · ${g.released||"TBA"}</div><div class="card-actions"><button onclick="details('${g.id}')">View details</button><button onclick="toggleLibrary('${g.id}')">${saved?"★ Saved":"☆ Save"}</button></div></div></article>`;
}
async function details(id){
 let g=games.find(x=>String(x.id)===String(id));
 let stores=[];
 if(API_KEY && !String(id).startsWith("demo")){
   try{const r=await fetch(`${API}/games/${id}?key=${API_KEY}`);if(r.ok)g=await r.json()}catch{}
   try{const r=await fetch(`${API}/games/${id}/stores?key=${API_KEY}&page_size=20`);if(r.ok){const d=await r.json();stores=d.results||[]}}catch{}
 }
 const storeButtons=stores.filter(x=>x.url).map(x=>`<a class="store-btn" href="${escapeAttr(x.url)}" target="_blank" rel="noopener noreferrer">🛒 ${escapeHTML(storeName(x.store_id))} — Official Store</a>`).join("");
 const storeArea=storeButtons||`<button class="ghost store-disabled" disabled>🛒 Official Store Link Unavailable</button>`;
 $("#modalContent").innerHTML=`<div class="detail"><img src="${g.background_image||""}"><div><span class="label">GAME PROFILE</span><h2>${escapeHTML(g.name)}</h2><div class="chips">${(g.genres||[]).map(x=>`<span>${escapeHTML(x.name)}</span>`).join("")}</div><p>${strip(g.description_raw||g.description||"No description available.")}</p><p><b>Release:</b> ${g.released||"TBA"}<br><b>Rating:</b> ${g.rating||"—"} / 5<br><b>Metacritic:</b> ${g.metacritic||"—"}<br><b>Platforms:</b> ${(g.platforms||[]).map(x=>x.platform?.name).join(", ")||"PC"}</p><div class="store-actions">${storeArea}</div><button class="primary download-btn" onclick="downloadGameInfo('${String(g.id).replace(/'/g,"\'")}')">⬇ Download Game Info</button><p class="download-note">Official store links open the legitimate storefront provided by the game database.</p></div></div>`;
 $("#modal").classList.add("open");
}
function downloadGameInfo(id){
 const g=games.find(x=>String(x.id)===String(id));
 if(!g){toast("Game information is unavailable.");return;}
 const info=[
   "GameNexus 3D - Game Information",
   "================================",
   `Title: ${g.name||"Unknown"}`,
   `Release Date: ${g.released||"TBA"}`,
   `Rating: ${g.rating||"—"} / 5`,
   `Metacritic: ${g.metacritic||"—"}`,
   `Genres: ${(g.genres||[]).map(x=>x.name).join(", ")||g.genre||"—"}`,
   `Platforms: ${(g.platforms||[]).map(x=>x.platform?.name).join(", ")||"PC"}`,
   "",
   "Description:",
   strip(g.description_raw||g.description||"No description available."),
   "",
   "Generated by GameNexus 3D."
 ].join("\\n");
 const blob=new Blob([info],{type:"text/plain;charset=utf-8"});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");
 a.href=url;
 a.download=(g.name||"game").replace(/[^a-z0-9]+/gi,"_").replace(/^_|_$/g,"")+"_GameInfo.txt";
 document.body.appendChild(a); a.click(); a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 toast("Download started.");
}
function escapeAttr(s){return String(s??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function storeName(id){const names={1:"Steam",2:"Xbox Store",3:"PlayStation Store",4:"App Store",5:"GOG",6:"Nintendo Store",7:"Xbox 360 Store",8:"Google Play",9:"itch.io",11:"Epic Games"};return names[String(id)]||"Official Store"}
function strip(x){const d=document.createElement("div");d.innerHTML=x;return d.textContent||d.innerText||""}
function closeModal(){$("#modal").classList.remove("open")}
function toggleLibrary(id){id=String(id);library=library.includes(id)?library.filter(x=>x!==id):[...library,id];localStorage.setItem("gamenexus-library",JSON.stringify(library));renderGames(games);renderLibrary();toast(library.includes(id)?"Added to library":"Removed from library")}
function renderLibrary(){const list=games.filter(g=>library.includes(String(g.id)));$("#libraryGrid").innerHTML=list.map(card).join("");$("#emptyLibrary").style.display=list.length?"none":"block"}
function fillPC(){$("#pcgame").innerHTML=games.slice(0,30).map(g=>`<option value="${g.id}">${escapeHTML(g.name)}</option>`).join("")}
function toast(t){$("#toast").textContent=t;$("#toast").classList.add("show");setTimeout(()=>$("#toast").classList.remove("show"),2400)}
$("#heroSearch").addEventListener("input",()=>renderGames(games));
$("#heroSearch").addEventListener("keydown",e=>{if(e.key==="Enter"){$("#discover").scrollIntoView({behavior:"smooth"});fetchGames($("#heroSearch").value)}});
$("#genre").addEventListener("change",()=>{page=1;fetchGames($("#heroSearch").value)});
$("#sort").addEventListener("change",()=>{page=1;fetchGames($("#heroSearch").value)});
$("#loadMore").onclick=()=>{page++;fetchGames($("#heroSearch").value)};
$("#checkPc").onclick=()=>{const g=games.find(x=>String(x.id)===$("#pcgame").value),ram=parseInt($("#ram").value);let score=ram>=16?92:ram>=8?75:50;$("#pcResult").innerHTML=`<div class="result"><b>Compatibility: ${score>=85?"EXCELLENT":score>=70?"GOOD":"LIMITED"}</b><br><small>${escapeHTML(g?.name||"Selected game")} — estimated result based on your entered ${ram} GB RAM profile. GPU/CPU checks require detailed game requirements from the API.</small></div>`};
$("#themeBtn").onclick=()=>document.body.classList.toggle("bright");
renderLibrary();fetchGames();

const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.1,1000), renderer=new THREE.WebGLRenderer({canvas:$("#space"),alpha:true,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);camera.position.z=5;
const group=new THREE.Group();scene.add(group);
const geo=new THREE.BufferGeometry(), count=1500, pos=new Float32Array(count*3);
for(let i=0;i<count*3;i++)pos[i]=(Math.random()-.5)*18;
geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
const stars=new THREE.Points(geo,new THREE.PointsMaterial({color:0x57e9ff,size:.018,transparent:true,opacity:.8}));group.add(stars);
const grid=new THREE.GridHelper(30,30,0x1b5a70,0x0b1d29);grid.position.y=-3;grid.rotation.x=0;group.add(grid);
const wire=new THREE.Mesh(new THREE.IcosahedronGeometry(2.8,1),new THREE.MeshBasicMaterial({color:0x294cff,wireframe:true,transparent:true,opacity:.06}));wire.position.set(3,.5,-2);group.add(wire);
let mx=0,my=0;addEventListener("pointermove",e=>{mx=(e.clientX/innerWidth-.5)*.35;my=(e.clientY/innerHeight-.5)*.2});
function animate(t){requestAnimationFrame(animate);stars.rotation.y=t*.00002;wire.rotation.x=t*.00015;wire.rotation.y=t*.0002;camera.position.x+=(mx-camera.position.x)*.02;camera.position.y+=(-my-camera.position.y)*.02;camera.lookAt(0,0,0);renderer.render(scene,camera)}animate(0);
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
