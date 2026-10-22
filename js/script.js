var CATS=["All","Earrings","Bangles","Necklaces","Rings"];
var P=[
 {n:"Gold Jhumka",c:"Earrings",p:250,nw:1,s:1},
 {n:"Kundan Chandbali",c:"Earrings",p:380,nw:1,s:1},
 {n:"Bridal Bangle Set",c:"Bangles",p:450,nw:1,s:1},
 {n:"Antique Kada",c:"Bangles",p:320,nw:0,s:1},
 {n:"Temple Necklace",c:"Necklaces",p:690,nw:1,s:1},
 {n:"Pearl Choker",c:"Necklaces",p:520,nw:0,s:0},
 {n:"Stone Adjustable Ring",c:"Rings",p:150,nw:0,s:1},
 {n:"Peacock Ring",c:"Rings",p:180,nw:1,s:1},
 {n:"Stud Earrings",c:"Earrings",p:29,nw:0,s:1},
 {n:"Thin Band Ring",c:"Rings",p:39,nw:0,s:1},
 {n:"Glass Bangle Pair",c:"Bangles",p:49,nw:0,s:1},
 {n:"Beaded Chain",c:"Necklaces",p:79,nw:0,s:1},
 {n:"Oxidised Hoops",c:"Earrings",p:99,nw:0,s:1}
];
function art(c,i){
 var g='#B58E45',s='';
 if(c==="Earrings")s='<circle cx="38" cy="36" r="4" fill="'+g+'"/><circle cx="62" cy="36" r="4" fill="'+g+'"/><path d="M38 40v12M62 40v12" stroke="'+g+'" stroke-width="1.6"/><circle cx="38" cy="62" r="9" fill="none" stroke="'+g+'" stroke-width="2.4"/><circle cx="62" cy="62" r="9" fill="none" stroke="'+g+'" stroke-width="2.4"/>';
 if(c==="Bangles")s='<circle cx="50" cy="50" r="26" fill="none" stroke="'+g+'" stroke-width="5"/><circle cx="50" cy="50" r="17" fill="none" stroke="'+g+'" stroke-width="2" stroke-dasharray="1.5 5"/>';
 if(c==="Necklaces")s='<path d="M22 28Q50 82 78 28" fill="none" stroke="'+g+'" stroke-width="2.2"/><circle cx="50" cy="66" r="6.5" fill="'+g+'"/><circle cx="36" cy="55" r="2.8" fill="'+g+'"/><circle cx="64" cy="55" r="2.8" fill="'+g+'"/>';
 if(c==="Rings")s='<circle cx="50" cy="58" r="20" fill="none" stroke="'+g+'" stroke-width="4"/><path d="M42 36l8-10 8 10-8 8z" fill="'+g+'"/>';
 return '<svg class="pic" viewBox="0 0 100 100" role="img" aria-label="'+c+' sample"><rect width="100" height="100" fill="rgba(127,127,127,.08)"/>'+s+'</svg>';
}
function card(x,i){
 var msg=encodeURIComponent("Hi, I’m interested in "+x.n+" (₹"+x.p+"). Is it available?");
 var tag=!x.s?'<span class="tag sold">Sold out</span>':(x.nw?'<span class="tag">New</span>':'');
 var btn=x.s?'<a class="ask" href="https://wa.me/917276566218?text='+msg+'">Ask on WhatsApp</a>':'<span class="ask off">Sold out</span>';
 return '<article class="card'+(x.s?'':' soldout')+'"><div style="position:relative">'+art(x.c,i)+tag+'</div><div class="info"><h3>'+x.n+'</h3><span class="price">₹'+x.p+'</span>'+btn+'</div></article>';
}
var sel="All";
var BUD=[49,99,199,299,499],bsel=49;
function drawB(){
 document.getElementById("bchips").innerHTML=BUD.map(function(b){return '<button class="chip" aria-pressed="'+(b===bsel)+'" data-b="'+b+'">Under ₹'+b+'</button>'}).join("");
 var h=P.map(function(x,i){return x.p<=bsel?card(x,i):""}).join("");
 document.getElementById("bgrid").innerHTML=h||'<p class="note">No designs in this budget right now.</p>';
}
function draw(){
 drawB();
 document.getElementById("new").innerHTML=P.map(function(x,i){return x.nw&&x.s?card(x,i):""}).join("");
 document.getElementById("grid").innerHTML=P.map(function(x,i){return sel==="All"||x.c===sel?card(x,i):""}).join("");
 document.getElementById("chips").innerHTML=CATS.map(function(c){return '<button class="chip" aria-pressed="'+(c===sel)+'" data-c="'+c+'">'+c+'</button>'}).join("");
}
document.getElementById("chips").addEventListener("click",function(e){var c=e.target.getAttribute("data-c");if(c){sel=c;draw()}});
document.getElementById("bchips").addEventListener("click",function(e){var b=e.target.getAttribute("data-b");if(b){bsel=+b;drawB()}});
draw();
