// ---------- views ----------
function home(){clearInterval(ses?.tm);ses=null;const t=stats(),acc=t.n?Math.round(t.k/t.n*100):0,st1=dayStreak();
app.innerHTML=`<div class="top"><span class="logo" onclick="home()">✨ LexiQuest</span><span class="sp"></span>
<span class="chip">🔥 ${st1} ngày</span><span class="chip">⭐ Lv ${Math.floor(Math.sqrt(S.xp/50))+1} · ${S.xp} XP</span>
<button class="btn g" onclick="words()">📚 Từ vựng (${t.all})</button><button class="btn g" onclick="theme()">🌓</button></div>
<div class="card"><h2>🎮 Chọn chế độ học</h2><p class="mu">Mỗi phiên học bạn sẽ chọn trình độ (B1–C2) và số câu. Từ lấy từ danh sách bạn nhập.</p>
<div class="modes">${Object.entries(MODES).map(([k,m])=>`<button class="mode" style="--a:${m.a};--b:${m.b}" onclick="setup('${k}')"><i>${m.i}</i><b>${m.n}</b><small>${m.d}${k=='rev'?` (${t.c.rev} từ)`:''}</small></button>`).join('')}</div></div>
<div class="card"><h2>📊 Dashboard</h2><div class="grid">
${[['Từ đã học',t.learned],['Đã thành thạo',t.c.mas],['Cần ôn tập',t.c.rev],['Đang học',t.c.lrn],['Từ mới',t.c.new],['Tỷ lệ đúng',acc+'%'],['Thời gian học',fmt(t.s)],['Streak ngày',st1+' 🔥']].map(a=>`<div class="tile"><b>${a[1]}</b><span>${a[0]}</span></div>`).join('')}</div></div>
<div class="card"><h2>📈 Tiến độ <button class="btn g" style="padding:2px 10px" onclick="per=per=='d'?'w':'d';home()">${per=='d'?'theo ngày':'theo tuần'}</button></h2>${chart()}</div>
<div class="two"><div class="card"><h2>Theo level</h2>${grp('lvl',Object.keys(LV))}</div><div class="card"><h2>Theo chế độ</h2>${grp('mode',Object.keys(MODES))}</div></div>`}
let per='d',ses=null;
function chart(){const N=per=='d'?14:8,b=[];for(let i=N-1;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i*(per=='d'?1:7));b.push(d)}
const key=t=>{const d=new Date(t);if(per=='d')return day(d);d.setDate(d.getDate()-((d.getDay()+6)%7));return day(d)};
const wk=d=>{if(per=='d')return day(d);d=new Date(d);d.setDate(d.getDate()-((d.getDay()+6)%7));return day(d)};
const m={};S.log.forEach(l=>{const k=key(l.t);m[k]=m[k]||{n:0,c:0};m[k].n+=l.n;m[k].c+=l.c});
const rows=b.map(d=>({k:wk(d),l:per=='d'?d.getDate():'T'+day(d).slice(5),...(m[wk(d)]||{n:0,c:0})})),mx=Math.max(1,...rows.map(r=>r.n));
return `<div class="bars">${rows.map(r=>`<div class="bar" title="${r.c}/${r.n} đúng">${r.n}<div style="height:${r.n/mx*85}%"><u style="height:${r.n?r.c/r.n*100:0}%"></u></div>${r.l}</div>`).join('')}</div><p class="mu">Cột = số câu đã làm, phần màu = số câu đúng.</p>`}
function grp(f,keys){return keys.map(k=>{const L=S.log.filter(l=>l[f]==k),n=L.reduce((a,l)=>a+l.n,0),c=L.reduce((a,l)=>a+l.c,0),p=n?Math.round(c/n*100):0;
const extra=f=='lvl'?` · ${Object.values(S.w).filter(x=>x.lv.includes(k)).length} từ`:'';
return `<div class="row"><span class="l">${f=='mode'?MODES[k].i+' '+MODES[k].n.split(' ')[0]:k}</span><div class="meter"><div style="width:${p}%"></div></div><span style="width:110px" class="mu">${n?p+'% · '+n+' câu':'—'}${extra}</span></div>`}).join('')}
function theme(){const d=document.documentElement,dark=getComputedStyle(d).colorScheme=='dark';S.theme=dark?'light':'dark';d.dataset.theme=S.theme;save()}
function words(msg){const e=Object.entries(S.w);
app.innerHTML=`<div class="top"><span class="logo" onclick="home()">✨ LexiQuest</span><span class="sp"></span><button class="btn g" onclick="home()">← Trang chủ</button></div>
<div class="card"><h2>📚 Thêm từ vựng của bạn</h2><p class="mu">Dán danh sách (mỗi từ/cụm từ một dòng, hoặc ngăn cách bằng dấu phẩy). Từ trùng và dữ liệu không hợp lệ sẽ bị bỏ qua.</p>
<textarea id="ta" placeholder="mitigate&#10;come to terms with&#10;ubiquitous"></textarea><p>${msg||''}</p><button class="btn" onclick="doImp()">Thêm vào danh sách</button></div>
<div class="card"><h2>Danh sách (${e.length})</h2>${e.length?e.map(([k,x])=>`<span class="tag s-${st(x)}" title="${SN[st(x)]} · đúng ${x.right}/sai ${x.wrong}">${esc(x.w)}<b onclick="delW('${encodeURIComponent(k)}')">×</b></span>`).join('')+`<p><button class="btn g" onclick="if(confirm('Xóa toàn bộ từ vựng?')){S.w={};save();words()}">Xóa tất cả</button></p>`:'<p class="mu">Chưa có từ nào.</p>'}
<p class="mu">Màu: tím=New, cam=Learning, xanh=Mastered, đỏ=Need Review.</p></div>`}
function doImp(){const t=$('#ta').value.trim();if(!t)return words('<span class="err">Danh sách đang trống.</span>');
const r=importWords(t);words(`Đã thêm <b>${r.add}</b> · trùng lặp bỏ qua <b>${r.dup}</b> · không hợp lệ <b>${r.bad}</b>`)}
function delW(k){delete S.w[decodeURIComponent(k)];save();words()}
