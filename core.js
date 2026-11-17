const $=s=>document.querySelector(s),app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let S={};try{S=JSON.parse(localStorage.getItem('lexi1'))||{}}catch(e){}
S=Object.assign({w:{},log:[],xp:0,theme:''},S);
const save=()=>{try{localStorage.setItem('lexi1',JSON.stringify(S))}catch(e){}};
if(S.theme)document.documentElement.dataset.theme=S.theme;
const LV={B1:'Intermediate',B2:'Upper Intermediate',C1:'Advanced',C2:'Proficiency'};
const LVD={B1:'common everyday, study and work contexts; clear collocations; compound and some complex sentences',B2:'abstract and news topics; phrasal verbs; conditionals, passives, relative clauses',C1:'academic/formal register; nuanced collocations; inversion, participle and reduced clauses',C2:'sophisticated, idiomatic, literary or professional register; subtle connotation and near-synonyms'};
const ALL=['ctx','syn','wf','col','err'];
const MODES={
ctx:{n:'Context Master',i:'🧩',d:'Điền từ vào câu dài, độ khó tăng dần',t:['ctx'],a:'#6c5ce7',b:'#a29bfe'},
syn:{n:'Synonym Challenge',i:'🔀',d:'Chọn từ đồng nghĩa hợp ngữ cảnh',t:['syn'],a:'#0984e3',b:'#74b9ff'},
wf:{n:'Word Transformation',i:'🧬',d:'Biến đổi từ loại (word formation)',t:['wf'],a:'#00a896',b:'#55efc4'},
col:{n:'Collocation Master',i:'🔗',d:'Hoàn thành cụm từ IELTS, báo chí, công việc',t:['col'],a:'#e17055',b:'#fab1a0'},
err:{n:'Error Detection',i:'🔍',d:'Tìm lỗi và chọn câu sửa đúng',t:['err'],a:'#d63031',b:'#ff7675'},
chal:{n:'English Challenge',i:'⚡',d:'Trộn dạng câu, bấm giờ, điểm và streak',t:ALL,timed:1,a:'#f39c12',b:'#fdcb6e'},
rec:{n:'Active Recall',i:'🧠',d:'Nhớ lại từ đã học, không gợi ý, ưu tiên từ hay sai',t:['rec'],a:'#6c5ce7',b:'#fd79a8'},
rev:{n:'Ôn tập thông minh',i:'♻️',d:'Spaced repetition: chỉ các từ đến hạn / hay sai',t:ALL,a:'#2d3436',b:'#636e72'}};
const SL=[0.007,1,3,7,14,30]; // days per Leitner box
const st=x=>!x.seen?'new':(x.lw||x.due<=Date.now())?'rev':x.box>=4?'mas':'lrn';
const SN={new:'New Words',lrn:'Learning',mas:'Mastered',rev:'Need Review'};
const day=t=>new Date(t).toLocaleDateString('en-CA');
const shuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const fmt=s=>s<60?s+'s':Math.round(s/60)+' phút';
function dayStreak(){const d=new Set(S.log.map(l=>day(l.t)));let c=0,t=new Date();if(!d.has(day(t)))t.setDate(t.getDate()-1);while(d.has(day(t))){c++;t.setDate(t.getDate()-1)}return c}
function stats(){const ws=Object.values(S.w),c={new:0,lrn:0,mas:0,rev:0};ws.forEach(x=>c[st(x)]++);
const n=S.log.reduce((a,l)=>a+l.n,0),k=S.log.reduce((a,l)=>a+l.c,0),s=S.log.reduce((a,l)=>a+l.s,0);return{c,n,k,s,learned:ws.filter(x=>x.seen).length,all:ws.length}}
