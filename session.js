// ---------- session setup ----------
function setup(m){const M=MODES[m];let pool=poolFor(m);
if(!pool.length){return modal(`<h2>${M.i} ${M.n}</h2><p>${m=='rev'?'Chưa có từ nào đến hạn ôn tập.':m=='rec'?'Bạn cần học ít nhất một từ trước khi dùng Active Recall.':'Bạn chưa thêm từ vựng nào.'}</p><button class="btn" onclick="${m=='ctx'||m=='syn'||m=='wf'||m=='col'||m=='err'||m=='chal'?'words()':'home()'}">${m=='rec'||m=='rev'?'Đã hiểu':'Thêm từ vựng'}</button>`)}
window._m=m;window._l='';modal(`<h2>${M.i} ${M.n}</h2><p class="mu">${pool.length} từ khả dụng. Chọn trình độ cho phiên học này (không tự đổi giữa chừng):</p>
<div class="lv">${Object.entries(LV).map(([k,v])=>`<button onclick="pickL('${k}',this)"><b>${k}</b><br><small>${v}</small></button>`).join('')}</div>
<p>Số câu: <input type="number" id="cnt" min="3" max="40" value="10" style="width:90px"></p>
<button class="btn" id="go" disabled onclick="start()">Bắt đầu</button> <button class="btn g" onclick="closeM()">Hủy</button>`)}
function pickL(k,b){window._l=k;document.querySelectorAll('.lv button').forEach(x=>x.classList.remove('on'));b.classList.add('on');$('#go').disabled=false}
function modal(h){closeM();const d=document.createElement('div');d.className='modal';d.id='md';d.innerHTML=`<div class="card">${h}</div>`;document.body.appendChild(d)}
function closeM(){$('#md')?.remove()}
function poolFor(m){const ws=Object.values(S.w);
if(m=='rev')return ws.filter(x=>st(x)=='rev');if(m=='rec')return ws.filter(x=>x.seen);return ws}
function rank(x){const s=st(x);return(s=='rev'?(x.lw?0:1):s=='new'?2:s=='lrn'?3:4)+Math.random()*.9+(x.seen?0:0)-Math.min(x.wrong,5)*.1}
function start(){const m=window._m,lvl=window._l,n=Math.max(3,Math.min(40,+$('#cnt').value||10)),M=MODES[m];closeM();
const pool=poolFor(m).sort((a,b)=>rank(a)-rank(b)),items=[];
for(let i=0;i<n;i++){const x=pool[i%pool.length];items.push({w:x.w,k:x.w.toLowerCase(),t:M.t.length>1?M.t[i%M.t.length]:M.t[0]})}
const its=M.t.length>1?shuf(items):items;its.forEach((x,i)=>{if(M.t.length>1)x.t=M.t[i%M.t.length]});
ses={m,lvl,M,n,qs:[],i:0,score:0,ok:0,done:0,streak:0,best:0,t0:Date.now(),chunks:[],fin:false,miss:[]};
for(let i=0;i<its.length;i+=5)ses.chunks.push(its.slice(i,i+5));
pump(ses);showQ()}
