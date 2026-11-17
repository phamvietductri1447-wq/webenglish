// ---------- question UI ----------
const fq=t=>esc(t).replace(/___/g,'<span class="blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>').replace(/\*(.+?)\*/g,'<b>$1</b>');
function head(){const s=ses,pct=s.done/s.n*100;return `<div class="top"><span class="logo" onclick="quit()">✨ LexiQuest</span><span class="chip">${s.M.i} ${s.M.n} · ${s.lvl}</span><span class="sp"></span><span class="chip">🎯 ${s.score}</span><span class="chip">🔥 ${s.streak}</span>${s.M.timed?'<span class="chip" id="tm">⏱</span>':''}<button class="btn g" onclick="quit()">Thoát</button></div><div class="prog"><div style="width:${pct}%"></div></div>`}
function showQ(){const s=ses;if(!s)return;clearInterval(s.tm);s.wait=0;s.lock=0;
if(s.i>=s.n||(s.i>=s.qs.length&&s.fin))return finish();
if(s.i>=s.qs.length){s.wait=1;if(s.err){const c=s.err.code;return app.innerHTML=head()+`<div class="card"><h2>⚠️ Không tạo được câu hỏi</h2><p class="err">${c=='unavailable'?'Không kết nối được máy chủ AI. Kiểm tra API_URL trong js/config.js và chắc chắn Worker đã được deploy.':c=='not_granted'?'Máy chủ AI từ chối yêu cầu. Kiểm tra cấu hình ALLOWED_ORIGIN.':c=='rate_limited'?'Đã chạm giới hạn tốc độ. Đợi một lát rồi thử lại.':'Lỗi: '+esc(s.err.message||c)}</p><button class="btn" onclick="retry()">Thử lại</button> <button class="btn g" onclick="finish()">Kết thúc</button></div>`}
return app.innerHTML=head()+`<div class="card"><h2>🤖 Claude đang soạn câu hỏi ${s.lvl}…</h2><p class="mu">Câu hỏi được tạo từ danh sách từ của bạn, thường mất vài giây.</p></div>`}
const q=s.qs[s.i];s.q=q;s.t1=Date.now();const rec=q.type=='rec';
app.innerHTML=head()+`<div class="card" id="qc"><p class="mu">Câu ${s.i+1}/${s.n} · ${{ctx:'Context',syn:'Synonym',wf:'Word Formation',col:'Collocation',err:'Error Detection',rec:'Active Recall'}[q.type]||''}</p><div class="q">${fq(q.q)}</div>
${rec?`<p><input type="text" id="ans" placeholder="Nhập từ còn thiếu…" autocomplete="off"></p><button class="btn" onclick="chkRec()">Kiểm tra</button> <button class="btn g" onclick="hint()">💡 Gợi ý</button> <button class="btn g" onclick="giveUp()">Không nhớ</button><p class="mu" id="ht"></p>`:q.options.map((o,i)=>`<button class="opt" onclick="ans(${i})"><b>${'ABCD'[i]}.</b> ${esc(o)}</button>`).join('')}</div><div id="fb"></div>`;
if(rec)$('#ans').focus();
if(s.M.timed){s.left=25;const u=()=>{$('#tm').textContent='⏱ '+Math.ceil(s.left)+'s';};u();s.tm=setInterval(()=>{s.left-=.25;u();if(s.left<=0){clearInterval(s.tm);ans(-1)}},250)}}
function retry(){const s=ses;s.err=null;s.fin=false;s.chunks=s.chunks.slice(Math.floor(s.qs.length/5));
if(!s.chunks.length){s.chunks=[[...[]]]}pumpAgain()}
function pumpAgain(){const s=ses,need=s.n-s.qs.length;if(need<=0)return finish();
const pool=poolFor(s.m).sort((a,b)=>rank(a)-rank(b)),M=s.M,its=[];
for(let i=0;i<need;i++){const x=pool[i%pool.length];its.push({w:x.w,k:x.w.toLowerCase(),t:M.t[i%M.t.length]})}
s.chunks=[];for(let i=0;i<its.length;i+=5)s.chunks.push(its.slice(i,i+5));pump(s);showQ()}
function hint(){const w=ses.q.w;$('#ht').textContent=`Bắt đầu bằng “${w[0]}”, dài ${w.length} ký tự.`}
function chkRec(){const v=$('#ans').value.trim().toLowerCase();if(!v)return;grade(ses.q.accept.includes(v),-1,v)}
function giveUp(){grade(false,-1,'')}
function ans(i){if(ses.lock)return;grade(i==ses.q.a,i)}
function grade(ok,i){const s=ses;if(s.lock)return;s.lock=1;clearInterval(s.tm);const q=s.q;
const x=S.w[q.k];if(x){x.seen++;x.lv.includes(s.lvl)||x.lv.push(s.lvl);
if(ok){x.right++;x.box=Math.min(5,x.box+1);x.lw=0}else{x.wrong++;x.box=Math.max(0,x.box-1);x.lw=1}x.due=Date.now()+SL[x.box]*864e5}
s.done++;let pts=0;
if(ok){s.ok++;s.streak++;s.best=Math.max(s.best,s.streak);pts=100+s.streak*10+(s.M.timed?Math.floor(s.left*4):0);s.score+=pts;S.xp+=10+Math.min(s.streak,10)}
else{s.streak=0;S.xp+=1;s.miss.push(q.w)}
save();
if(q.type!='rec'){document.querySelectorAll('.opt').forEach((b,j)=>{b.disabled=true;if(j==q.a)b.classList.add('ok');else if(j==i)b.classList.add('no')})}
else{const a=$('#ans');if(a)a.disabled=true}
const qc=$('#qc');qc.classList.add(ok?'pop':'shake');if(ok)burst();
$('#fb').innerHTML=`<div class="card fb ${ok?'':'bad'}"><h2>${ok?'✅ Chính xác! +'+pts:i==-1&&s.M.timed&&s.left<=0?'⏰ Hết giờ':'❌ Chưa đúng'}</h2>
${q.type=='rec'?`<p><b>Đáp án:</b> ${esc(q.w)}</p>`:`<p><b>Đáp án:</b> ${esc(q.options[q.a])}</p>`}
<p><b>📖 Nghĩa trong ngữ cảnh:</b> ${esc(q.meaning)}</p>${q.why?`<p><b>💡 Vì sao đúng:</b> ${esc(q.why)}</p>`:''}${q.wrong?`<p><b>🚫 Các phương án còn lại:</b> ${esc(q.wrong)}</p>`:''}${q.colloc?`<p><b>🔗 Collocation / ngữ pháp:</b> ${esc(q.colloc)}</p>`:''}${q.example?`<p><b>✍️ Ví dụ khác:</b> ${esc(q.example)}</p>`:''}
<button class="btn" id="nx" onclick="ses.i++;showQ()">Tiếp tục ↵</button></div>`;
$('#nx').focus();head&&(document.querySelector('.prog div').style.width=s.done/s.n*100+'%')}
function burst(){const e=['✨','🎉','⭐','💫'],r=$('#qc').getBoundingClientRect();for(let i=0;i<12;i++){const f=document.createElement('span');f.className='fly';f.textContent=e[i%4];f.style.left=r.left+r.width/2+'px';f.style.top=r.top+40+'px';f.style.setProperty('--x',(Math.random()*300-150)+'px');f.style.setProperty('--y',(Math.random()*-200-20)+'px');document.body.appendChild(f);setTimeout(()=>f.remove(),950)}}
function logSes(){const s=ses;if(s.done>0)S.log.push({t:Date.now(),lvl:s.lvl,mode:s.m,n:s.done,c:s.ok,s:Math.round((Date.now()-s.t0)/1000)});save()}
function quit(){if(ses&&ses.done>0&&!confirm('Thoát phiên học? Kết quả đã làm vẫn được lưu.'))return;if(ses){ses.dead=1;logSes()}home()}
function finish(){const s=ses;clearInterval(s.tm);s.dead=1;logSes();const n=s.done,p=n?Math.round(s.ok/n*100):0;
app.innerHTML=`<div class="top"><span class="logo" onclick="home()">✨ LexiQuest</span></div><div class="card" style="text-align:center"><h2>${p>=80?'🏆 Xuất sắc!':p>=50?'👍 Khá tốt!':'💪 Tiếp tục cố gắng!'}</h2>
<div class="grid"><div class="tile"><b>${s.score}</b><span>Điểm</span></div><div class="tile"><b>${s.ok}/${n}</b><span>Đúng</span></div><div class="tile"><b>${p}%</b><span>Chính xác</span></div><div class="tile"><b>${s.best}🔥</b><span>Streak tốt nhất</span></div><div class="tile"><b>${fmt(Math.round((Date.now()-s.t0)/1000))}</b><span>Thời gian</span></div></div>
${s.miss.length?`<p>Từ cần ôn: ${[...new Set(s.miss)].map(w=>`<span class="tag s-rev">${esc(w)}</span>`).join('')}<br><span class="mu">Các từ này đã được đưa vào lịch ôn tập (spaced repetition).</span></p>`:''}
${n<s.n?'<p class="mu">Một số câu không tạo được nên phiên kết thúc sớm.</p>':''}
<button class="btn" onclick="setup('${s.m}')">Chơi lại</button> <button class="btn g" onclick="home()">Về trang chủ / đổi level</button></div>`}
addEventListener('keydown',e=>{if(!ses||!ses.q||$('#md'))return;
if(e.key=='Enter'){if(ses.lock)$('#nx')?.click();else if(ses.q.type=='rec')chkRec()}
else if(!ses.lock&&ses.q.type!='rec'&&/^[1-4]$/.test(e.key))ans(+e.key-1)});
