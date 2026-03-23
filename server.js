const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

// ─── Serve the frontend ───────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Laredo Deal Scanner</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #020817; color: #f1f5f9; font-family: sans-serif; min-height: 100vh; padding: 24px 16px; }
  h1 { font-size: 2rem; font-weight: 900; letter-spacing: -0.03em; }
  .subtitle { font-size: 0.7rem; color: #64748b; font-family: monospace; margin-top: 5px; }
  .badge { font-size: 0.58rem; color: #10b981; font-family: monospace; letter-spacing: 0.22em; margin-bottom: 6px; }
  .controls { background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 20px; margin: 24px 0 18px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
  .ctrl-label { font-size: 0.58rem; color: #64748b; font-family: monospace; letter-spacing: 0.1em; margin-bottom: 5px; }
  input[type=number] { background: #1e293b; border: 1px solid #334155; border-radius: 6px; color: #f1f5f9; padding: 9px 12px; font-size: 0.8rem; font-family: monospace; width: 100%; outline: none; }
  .filter-row { display: flex; gap: 8px; align-items: center; margin-bottom: 22px; flex-wrap: wrap; }
  .fbtn { padding: 7px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.68rem; font-family: monospace; letter-spacing: 0.1em; font-weight: 700; background: #1e293b; color: #94a3b8; transition: all 0.15s; }
  .fbtn.active-all { background: #94a3b8; color: #000; }
  .fbtn.active-flip { background: #f59e0b; color: #000; }
  .fbtn.active-rental { background: #3b82f6; color: #000; }
  .fbtn.active-str { background: #10b981; color: #000; }
  #scanBtn { background: linear-gradient(135deg,#10b981,#059669); color: #fff; border: none; border-radius: 8px; padding: 11px 28px; font-size: 0.75rem; font-family: monospace; letter-spacing: 0.14em; font-weight: 800; cursor: pointer; box-shadow: 0 0 18px #10b98138; margin-left: auto; }
  #scanBtn:disabled { background: #1e293b; color: #64748b; box-shadow: none; cursor: default; }
  #status { font-size: 0.67rem; color: #64748b; font-family: monospace; margin-bottom: 14px; }
  #error { background: #1a0a0a; border: 1px solid #7f1d1d; border-radius: 8px; padding: 16px; margin-bottom: 16px; font-size: 0.75rem; color: #fca5a5; font-family: monospace; display: none; }
  #loading { text-align: center; padding: 60px; color: #64748b; font-family: monospace; font-size: 0.78rem; display: none; }
  .spinner { width: 36px; height: 36px; border: 3px solid #1e293b; border-top-color: #10b981; border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 16px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  #grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(295px,1fr)); gap: 14px; }
  .card { background: #0f172a; border-radius: 10px; padding: 18px; position: relative; border: 1px solid #1e293b; border-top: 3px solid #10b981; }
  .card-badge { position: absolute; top: -1px; right: 14px; font-size: 0.58rem; font-weight: 900; font-family: monospace; letter-spacing: 0.14em; padding: 3px 9px; border-radius: 0 0 6px 6px; color: #000; }
  .card-addr { font-size: 0.77rem; font-weight: 700; line-height: 1.3; padding-right: 52px; margin-bottom: 2px; color: #f1f5f9; }
  .card-city { font-size: 0.63rem; color: #475569; font-family: monospace; margin-bottom: 12px; }
  .card-price { font-size: 1.45rem; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 14px; color: #f1f5f9; }
  .stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 6px; margin-bottom: 14px; }
  .stat { background: #1e293b; border-radius: 6px; padding: 7px 4px; text-align: center; }
  .stat-val { font-size: 0.85rem; font-weight: 700; color: #f1f5f9; }
  .stat-lbl { font-size: 0.53rem; color: #64748b; font-family: monospace; letter-spacing: 0.06em; }
  .bar-row { margin-bottom: 7px; }
  .bar-header { display: flex; justify-content: space-between; margin-bottom: 3px; }
  .bar-label { font-size: 0.67rem; font-family: monospace; color: #9ca3af; letter-spacing: 0.07em; }
  .bar-score { font-size: 0.67rem; font-family: monospace; font-weight: 800; }
  .bar-track { height: 4px; background: #1e293b; border-radius: 2px; }
  .bar-fill { height: 100%; border-radius: 2px; }
  .str-est { margin-top: 10px; padding: 7px 11px; background: #10b98112; border-radius: 6px; border: 1px solid #10b98125; font-size: 0.63rem; color: #10b981; font-family: monospace; }
  .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
  .card-meta { font-size: 0.6rem; color: #475569; font-family: monospace; }
  .zillow-link { font-size: 0.6rem; font-family: monospace; text-decoration: none; letter-spacing: 0.06em; }
  footer { margin-top: 48px; padding-top: 18px; border-top: 1px solid #0f172a; text-align: center; font-family: monospace; font-size: 0.57rem; color: #1e293b; }
  #empty { text-align: center; padding: 40px; color: #64748b; font-family: monospace; font-size: 0.78rem; display: none; }
</style>
</head>
<body>
<div style="max-width:1100px;margin:0 auto">
  <div class="badge">LAREDO, TX · INVESTMENT PROPERTY SCREENER</div>
  <h1>Deal Scanner</h1>
  <p class="subtitle">Live Zillow data · scored for Flip / Rental / STR</p>

  <div class="controls">
    <div><div class="ctrl-label">MIN PRICE</div><input type="number" id="minPrice" value="80000"></div>
    <div><div class="ctrl-label">MAX PRICE</div><input type="number" id="maxPrice" value="280000"></div>
    <div><div class="ctrl-label">MIN BEDS</div><input type="number" id="minBeds" value="2"></div>
  </div>

  <div class="filter-row">
    <button class="fbtn active-all" onclick="setFilter('ALL',this)">ALL</button>
    <button class="fbtn" onclick="setFilter('FLIP',this)">FLIP</button>
    <button class="fbtn" onclick="setFilter('RENTAL',this)">RENTAL</button>
    <button class="fbtn" onclick="setFilter('STR',this)">STR / AIRBNB</button>
    <button id="scanBtn" onclick="scan()">⬡ SCAN DEALS</button>
  </div>

  <div id="status"></div>
  <div id="error"></div>
  <div id="loading"><div class="spinner"></div>Pulling live Zillow listings...</div>
  <div id="empty">No properties match filters.</div>
  <div id="grid"></div>
  <footer>Live Zillow data via RapidAPI · scores are estimates · verify all data · not financial advice</footer>
</div>

<script>
let allListings = [];
let currentFilter = 'ALL';

function setFilter(f, el) {
  currentFilter = f;
  document.querySelectorAll('.fbtn').forEach(b => b.className = 'fbtn');
  const map = {ALL:'active-all',FLIP:'active-flip',RENTAL:'active-rental',STR:'active-str'};
  el.classList.add(map[f]);
  renderCards();
}

function scoreFlip(p) {
  let s = 0;
  const price = p.price||0, ppsf = p.sqft>0?price/p.sqft:999, dom = p.dom||0;
  if(price<=180000)s+=30;else if(price<=230000)s+=15;
  if(ppsf<70)s+=25;else if(ppsf<90)s+=15;else if(ppsf<110)s+=5;
  if(dom>=60)s+=20;else if(dom>=30)s+=10;else if(dom>=14)s+=5;
  if((p.cuts||0)>=2)s+=15;else if((p.cuts||0)===1)s+=8;
  if((p.beds||0)>=3)s+=10;
  return Math.min(s,100);
}
function scoreRental(p) {
  let s = 0;
  const price=p.price||0,beds=p.beds||0;
  const rent=beds>=4?1400:beds===3?1150:beds===2?900:700;
  const yld=price>0?((rent*12)/price)*100:0;
  if(yld>=8)s+=40;else if(yld>=6)s+=25;else if(yld>=5)s+=10;
  if(price<=150000)s+=25;else if(price<=200000)s+=15;else if(price<=250000)s+=5;
  if(beds>=3)s+=20;else if(beds===2)s+=10;
  const t=(p.type||'').toLowerCase();
  if(t.includes('single')||t.includes('house'))s+=15;
  else if(t.includes('town')||t.includes('condo'))s+=8;
  return Math.min(s,100);
}
function scoreSTR(p) {
  let s = 0;
  const price=p.price||0,beds=p.beds||0;
  const nightly=beds>=4?165:beds===3?135:beds===2?110:85;
  const yld=price>0?((nightly*365*0.65)/price)*100:0;
  if(yld>=12)s+=40;else if(yld>=9)s+=28;else if(yld>=7)s+=15;
  if(beds>=3)s+=25;else if(beds===2)s+=12;
  if((p.baths||0)>=3)s+=15;else if((p.baths||0)>=2)s+=8;
  if((p.sqft||0)>=1800)s+=10;else if((p.sqft||0)>=1400)s+=5;
  if(price<=200000)s+=10;else if(price<=250000)s+=5;else if(price>300000)s-=10;
  return Math.min(Math.max(s,0),100);
}
function topStrat(f,r,s){
  const m=Math.max(f,r,s);
  if(m===s)return{label:'STR',color:'#10b981'};
  if(m===f)return{label:'FLIP',color:'#f59e0b'};
  return{label:'RENTAL',color:'#3b82f6'};
}
function bar(label,score,color){
  return '<div class="bar-row"><div class="bar-header"><span class="bar-label">'+label+'</span><span class="bar-score" style="color:'+color+'">'+score+'</span></div><div class="bar-track"><div class="bar-fill" style="width:'+score+'%;background:'+color+'"></div></div></div>';
}
function cardHTML(p){
  const f=scoreFlip(p),r=scoreRental(p),s=scoreSTR(p);
  const top=topStrat(f,r,s);
  const ppsf=p.sqft>0?Math.round(p.price/p.sqft):'-';
  const nightly=p.beds>=4?165:p.beds===3?135:p.beds===2?110:85;
  const est=Math.round(nightly*30*0.65);
  const zurl=p.zpid?'https://www.zillow.com/homedetails/'+p.zpid+'_zpid/':
             p.url?p.url:'';
  return '<div class="card" style="border-top-color:'+top.color+';border-color:'+top.color+'35">'+
    '<div class="card-badge" style="background:'+top.color+'">'+top.label+'</div>'+
    '<div class="card-addr">'+p.address+'</div>'+
    '<div class="card-city">'+p.city+', TX '+p.zip+'</div>'+
    '<div class="card-price">$'+p.price.toLocaleString()+'</div>'+
    '<div class="stats">'+
      '<div class="stat"><div class="stat-val">'+(p.beds||'—')+'</div><div class="stat-lbl">BED</div></div>'+
      '<div class="stat"><div class="stat-val">'+(p.baths||'—')+'</div><div class="stat-lbl">BATH</div></div>'+
      '<div class="stat"><div class="stat-val">'+(p.sqft?p.sqft.toLocaleString():'—')+'</div><div class="stat-lbl">SQFT</div></div>'+
      '<div class="stat"><div class="stat-val">'+ppsf+'</div><div class="stat-lbl">$/SF</div></div>'+
    '</div>'+
    bar('FLIP',f,'#f59e0b')+bar('RENTAL',r,'#3b82f6')+bar('STR / AIRBNB',s,'#10b981')+
    '<div class="str-est">EST. STR ~$'+est.toLocaleString()+'/mo @ 65% occ.</div>'+
    '<div class="card-footer">'+
      '<span class="card-meta">'+(p.dom>0?p.dom+'d listed':'')+(p.type?(p.dom>0?' · ':'')+p.type:'')+'</span>'+
      (zurl?'<a class="zillow-link" href="'+zurl+'" target="_blank" style="color:'+top.color+'">ZILLOW →</a>':'')+
    '</div></div>';
}

function renderCards(){
  const f=currentFilter;
  const filtered=allListings.filter(p=>{
    if(f==='FLIP')return scoreFlip(p)>=45;
    if(f==='RENTAL')return scoreRental(p)>=45;
    if(f==='STR')return scoreSTR(p)>=45;
    return true;
  }).sort((a,b)=>Math.max(scoreFlip(b),scoreRental(b),scoreSTR(b))-Math.max(scoreFlip(a),scoreRental(a),scoreSTR(a)));
  document.getElementById('status').textContent=filtered.length+' of '+allListings.length+' listings · sorted by best score';
  document.getElementById('grid').innerHTML=filtered.map(cardHTML).join('');
  document.getElementById('empty').style.display=filtered.length===0&&allListings.length>0?'block':'none';
}

async function scan(){
  const btn=document.getElementById('scanBtn');
  const minP=document.getElementById('minPrice').value;
  const maxP=document.getElementById('maxPrice').value;
  const minB=document.getElementById('minBeds').value;
  btn.disabled=true; btn.textContent='SCANNING...';
  document.getElementById('error').style.display='none';
  document.getElementById('loading').style.display='block';
  document.getElementById('grid').innerHTML='';
  document.getElementById('status').textContent='';
  document.getElementById('empty').style.display='none';
  allListings=[];
  try{
    const results=[];
    for(let page=1;page<=2;page++){
      const params=new URLSearchParams({
        location:'Laredo, TX',
        page,
        home_status:'FOR_SALE',
        sort:'NEWEST',
        min_price:minP,
        max_price:maxP,
        min_bedrooms:minB
      });
      const res=await fetch('/search?'+params.toString());
      if(!res.ok)throw new Error('API error '+res.status);
      const data=await res.json();
      // Parse response - try multiple field name patterns
      const raw=data?.data?.results||data?.results||data?.data?.home_search?.results||[];
      if(raw.length===0)break;
      raw.forEach(p=>{
        const price=Number(p.price||p.listPrice||p.list_price||0);
        if(price>0)results.push({
          address:p.address||p.streetAddress||p.street_address||'Address unavailable',
          city:p.city||'Laredo',
          zip:p.zipcode||p.zip_code||p.zip||'',
          price,
          beds:Number(p.bedrooms||p.beds||0),
          baths:Number(p.bathrooms||p.baths||0),
          sqft:Number(p.livingArea||p.living_area||p.sqft||p.square_feet||0),
          type:p.homeType||p.home_type||p.propertyType||p.property_type||'',
          dom:Number(p.daysOnMarket||p.days_on_market||p.dom||0),
          cuts:Number(p.priceReductionCount||p.price_reduction_count||0),
          zpid:p.zpid||'',
          url:p.url||p.detailUrl||p.detail_url||''
        });
      });
      if(raw.length<10)break;
    }
    if(results.length===0){
      document.getElementById('error').textContent='⚠ No listings returned. Try again in a moment.';
      document.getElementById('error').style.display='block';
    } else {
      allListings=results;
      renderCards();
    }
  }catch(e){
    document.getElementById('error').textContent='⚠ '+e.message;
    document.getElementById('error').style.display='block';
  }finally{
    document.getElementById('loading').style.display='none';
    btn.disabled=false;btn.textContent='⬡ SCAN DEALS';
  }
}
</script>
</body>
</html>`);
});

// ─── Proxy RapidAPI ───────────────────────────────────────────────────────────
app.get("/search", async (req, res) => {
  try {
    const url = new URL("https://real-time-real-estate-data-mega.p.rapidapi.com/search");
    // Pass through all query params from the client
    const allowed = ['location','page','home_status','home_type','sort','min_price','max_price','min_bedrooms','max_bedrooms','min_bathrooms','min_sqft'];
    for (const key of allowed) {
      if (req.query[key] !== undefined) url.searchParams.set(key, req.query[key]);
    }
    const response = await fetch(url.toString(), {
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "real-time-real-estate-data-mega.p.rapidapi.com",
      },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Proxy running"));
