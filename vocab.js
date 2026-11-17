// ---------- vocabulary import ----------
function importWords(txt){const r={add:0,dup:0,bad:0};
txt.split(/[\n,;\t]+/).map(s=>s.replace(/^\s*(\d+[.)]|[-•*])\s*/,'').trim()).filter(Boolean).forEach(w=>{
if(w.length>60||!/[a-z]/i.test(w)){r.bad++;return}const k=w.toLowerCase();
if(S.w[k]){r.dup++;return}S.w[k]={w,seen:0,right:0,wrong:0,box:0,due:0,lw:0,lv:[],added:Date.now()};r.add++});save();return r}
