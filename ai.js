// ---------- AI generation ----------
const TYPE_RULES={
ctx:'"q": ONE long sentence (25-45 words, several clauses) with a single blank "___" (or two blanks, then each option is "a / b"). The correct option is the target word in the right form. Distractors: same part of speech, similar register, plausible but wrong in collocation, meaning or grammar.',
syn:'"q": a sentence containing the target word wrapped in *asterisks*, then " — closest in meaning here?". Options: 4 near-synonyms; exactly one fits this context best.',
wf:'"q": a sentence with blank "___" followed by the ROOT in capitals in brackets, e.g. (DECIDE). Options: 4 derived forms of the root (noun/verb/adjective/adverb/negative). The target word is the root or the correct derivative.',
col:'"q": a short phrase or sentence fragment with "___" missing, testing a collocation containing the target word (IELTS, news, academic or professional). Options: 4 words/phrases.',
err:'"q": a sentence with exactly ONE error involving the target word (wrong word, collocation or grammar), prefixed "Choose the corrected sentence: ". Options: 4 full sentences; exactly one fully correct.',
rec:'"q": a sentence with blank "___" where only the target word fits (no options). Also "accept": array of valid inflected forms/spellings of the answer. Fields "meaning" and "example" required; options/a not needed.'};
async function genChunk(items,lvl,m){
const spec=items.map((x,i)=>`${i+1}. target="${x.w}" type=${x.t}`).join('\n');
const used=ses.qs.slice(-8).map(q=>q.q.slice(0,50)).join(' | ');
const p=`You are an expert EFL exam item writer. CEFR level: ${lvl} (${LVD[lvl]}). Write natural, modern English (academic, workplace, news, daily life). Never write trivial or translation-only items. ${m=='ctx'?'Difficulty rises gradually across items.':''}
Return ONLY a JSON array (no markdown), one object per numbered item, in order. Fields: "type","q",${items.some(x=>x.t!='rec')?'"options" (4 strings),"a" (0-3 index of correct option),':''}"meaning" (Vietnamese + short English gloss of the target in this context),"why" (Vietnamese: why the answer is right),"wrong" (Vietnamese: why each other option fails, one short clause each),"colloc" (notable collocations/grammar pattern, Vietnamese explanation with English examples),"example" (a NEW English sentence using the target, followed by a Vietnamese translation in parentheses).
Rules per type:\n${[...new Set(items.map(x=>x.t))].map(t=>t+': '+TYPE_RULES[t]).join('\n')}
Avoid repeating these earlier stems: ${used||'none'}.
Items:\n${spec}`;
return await callAI(p)}
async function pump(s){for(let c=0;c<s.chunks.length;c++){if(s.dead)return;
try{const r=await genChunk(s.chunks[c],s.lvl,s.m);const arr=Array.isArray(r)?r:(r&&r.questions)||[];
arr.forEach((q,i)=>{const it=s.chunks[c][i];if(!q||!it||typeof q.q!='string')return;q.k=it.k;q.w=it.w;q.type=it.t;
if(it.t=='rec'){if(!q.meaning)return;q.accept=(q.accept||[]).concat(it.w).map(x=>String(x).toLowerCase())}
else{if(!Array.isArray(q.options)||q.options.length!=4||!(q.a>=0&&q.a<4))return;const o=q.options.map((t,j)=>({t,r:j==q.a}));const sh=shuf(o);q.options=sh.map(x=>x.t);q.a=sh.findIndex(x=>x.r)}
s.qs.push(q)})}catch(e){s.err=e;break}
if(s.wait)showQ()}
s.fin=true;if(s.wait)showQ()}

async function callAI(prompt){let r;
try{r=await fetch(CONFIG.API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})})}catch(e){throw{code:'unavailable',message:e.message}}
if(r.status==429)throw{code:'rate_limited'};if(!r.ok)throw{code:'http',message:'HTTP '+r.status};
const d=await r.json();return JSON.parse(String(d.text).replace(/```json|```/g,'').trim())}
