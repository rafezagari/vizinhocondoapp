(()=>{const RESET_POR_EMAIL=false; // mude para true quando o e-mail próprio (SMTP) estiver configurado
const C=window.VIZINHO_CFG||{},nota=document.querySelector('#lForm').parentElement.querySelector('.quote'),aviso=m=>{nota.textContent=m;nota.style.color='var(--bad)'};
if(!window.VIZINHO_CFG)return aviso('Diagnóstico: o arquivo config.js não foi encontrado no site.');
if(!C.url||!C.key)return; // sem configuração: segue em modo demonstração
if(!window.supabase)return aviso('Diagnóstico: não foi possível carregar a biblioteca do servidor. Verifique a internet e tente de novo.');
const sb=supabase.createClient(C.url,C.key);let me=null,chan=null,cad=false;
const err=m=>{$('#lErr').textContent=m||'';$('#lErr').style.color=''};const info=m=>{$('#lErr').textContent=m;$('#lErr').style.color='var(--ok)'};
const msg=e=>/invalid login/i.test(e.message)?'E-mail ou senha incorretos':/not confirmed/i.test(e.message)?'Confirme seu e-mail antes de entrar. Veja a caixa de entrada e o spam.':/rate limit|too many|security purposes/i.test(e.message)?'Muitas tentativas seguidas. Aguarde um minuto e tente de novo.':/already registered/i.test(e.message)?'Este e-mail já tem conta. Toque em "Já tenho conta".':e.message;
const bd=d=>d.split('-').reverse().join('/');
const chave=u=>String(u||'').toLowerCase().replace(/^(apartamento|apto|ap)\.?\s*/,'').replace(/[^a-z0-9]/g,'');
S.user=null;S.ch=[];S.avisos=[];S.votos=[];S.res=[];S.inad=[];
document.querySelector('#lForm').parentElement.querySelector('.quote').hidden=true;
$('#lSenha').placeholder='Mínimo de 6 caracteres';$('#lModo').hidden=false;$('#lEsq').hidden=!RESET_POR_EMAIL;$('#sConvite').hidden=false;
document.querySelectorAll('.hero,#sInad').forEach(e=>e.hidden=true);$('#sInad').previousElementSibling.hidden=true;
for(let e=$('#avisos').nextElementSibling;e;e=e.nextElementSibling)e.hidden=true;
$('#sPrest').hidden=false;
window.rAvisos=()=>{$('#avisos').innerHTML=S.avisos.length?S.avisos.map(a=>`<div class="card"><b>${esc(a.t)}</b><p class="mute">${esc(a.d)}</p></div>`).join(''):'<p class="mute">Nenhum aviso por enquanto.</p>'};
const rSin0=window.rSin;window.rSin=()=>{rSin0();if(!me)return;$('#sStats').firstElementChild.innerHTML=`<p class="mute">Código do prédio</p><p class="big" style="font-size:26px">${esc(me.condo.codigo)}</p><p class="mute">Passe aos moradores</p>`};
function setModo(c){cad=c;$('#lCad').hidden=!c;$('#lModo').textContent=c?'Já tenho conta':'Criar conta';$('#lForm button[type=submit]').textContent=c?'Criar conta':'Entrar';ajusta()}
function ajusta(){const s=perfil==='sindico';$('#lExtraL').textContent=s?'Nome do prédio':'Código do prédio';$('#lAptoW').hidden=false;$('#lAptoL').textContent=s?'Apartamento (opcional)':'Apartamento'}
$('#lModo').onclick=()=>setModo(!cad);document.querySelectorAll('[data-p]').forEach(b=>b.addEventListener('click',ajusta));
const finish=x=>x.papel==='sindico'?sb.rpc('criar_condominio',{p_nome:x.extra,p_usuario:x.nome,p_unidade:x.apto||null}):sb.rpc('entrar_condominio',{p_codigo:x.extra,p_usuario:x.nome,p_unidade:x.apto});
const getP=async id=>(await sb.from('perfis').select('*,condominios(nome,codigo,unidades,plano)').eq('id',id).maybeSingle()).data;
async function enter(){const {data:{user}}=await sb.auth.getUser();if(!user)return;let p=await getP(user.id);
 if(!p){let pend=null;try{pend=JSON.parse(localStorage.getItem('vz-pend')||'null')}catch(e){}if(!pend&&user.user_metadata&&user.user_metadata.papel)pend=user.user_metadata;
  if(pend){const r=await finish(pend);if(r.error){err(r.error.message);await sb.auth.signOut();return}try{localStorage.removeItem('vz-pend')}catch(e){}p=await getP(user.id)}}
 if(!p){err('Esta conta ainda não está ligada a um prédio. Use "Criar conta".');await sb.auth.signOut();return}
 me={id:user.id,condo:p.condominios,condoId:p.condominio_id,unidade:p.unidade,nome:p.nome,email:user.email,foto:p.foto_path};S.user={p:p.papel,n:p.nome.split(' ')[0]};apply();
 $('#local').textContent=p.condominios.nome+' · '+(p.papel==='sindico'?'Síndico':'Apto '+p.unidade);rPerfil();await load();subscribe()}
async function load(){if(!me)return;const t=n=>sb.from(n).select('*');
 const [a,c,v,vt,r,pr,av,pf]=await Promise.all([t('avisos').order('created_at',{ascending:false}),t('chamados').order('created_at',{ascending:false}),t('votacoes').order('created_at',{ascending:false}),t('votos'),t('reservas').order('data',{ascending:false}),t('prestadores').order('nome'),t('avaliacoes'),t('perfis')]);
 S.avisos=(a.data||[]).map(x=>({id:x.id,t:x.titulo,d:x.mensagem,at:x.created_at}));
 S.ch=(c.data||[]).map(x=>({id:x.id,tipo:x.tipo,d:x.descricao,st:x.status,preco:x.preco||'',foto:x.foto_path}));
 S.votos=(v.data||[]).map(x=>{const vs=(vt.data||[]).filter(y=>y.votacao_id===x.id),mine=vs.find(y=>y.user_id===me.id||(chave(me.unidade)&&y.unidade_chave===chave(me.unidade)));
  return{id:x.id,q:x.pergunta,o:x.opcoes,n:x.opcoes.map((_,i)=>vs.filter(y=>y.opcao===i).length),me:mine?mine.opcao:null}});
 S.resAll=r.data||[];S.perfis={};(pf.data||[]).forEach(x=>{S.perfis[x.id]=x});S.res=S.resAll.filter(x=>x.usuario_id===me.id).map(x=>({a:x.area,dt:bd(x.data),h:x.horario}));
 S.presTodos=(pr.data||[]).map(x=>{const as=(av.data||[]).filter(y=>y.prestador_id===x.id);return{id:x.id,n:x.nome,cat:x.categoria,preco:x.preco||'',soma:as.reduce((s,y)=>s+y.nota,0),qtd:as.length,c:'',ativo:x.ativo!==false}});S.pres=S.presTodos.filter(x=>x.ativo);
 S.minhas={};(av.data||[]).filter(y=>y.autor_id===me.id).forEach(y=>{S.minhas[y.prestador_id]=y.nota});
 const prox=(r.data||[]).filter(x=>x.usuario_id===me.id&&!acabou(x)).sort(asc)[0];
 $('#resumo').innerHTML=`<div class="card"><div class="row"><span>Chamados em aberto</span><b>${S.ch.filter(x=>x.st!=='feito').length}</b></div><div class="row" style="margin-top:8px"><span>Votações aguardando você</span><b>${S.votos.filter(x=>x.me===null).length}</b></div><div class="row" style="margin-top:8px"><span>Próxima reserva</span><b>${prox?bd(prox.data)+' · '+esc(prox.area)+' · '+esc(prox.horario):'Nenhuma'}</b></div></div>`;
 rAvisos();rCh();rSin();rVotos();rRes();rServ();rGer()}
function subscribe(){if(chan)return;chan=sb.channel('vz').on('postgres_changes',{event:'*',schema:'public'},()=>{clearTimeout(subscribe.t);subscribe.t=setTimeout(load,300)}).subscribe()}
$('#lForm').onsubmit=async e=>{e.preventDefault();err('');const em=$('#lMail').value.trim(),pw=$('#lSenha').value;
 if(!/^\S+@\S+\.\S+$/.test(em))return err('Digite um e-mail válido, como voce@email.com');
 if(pw.length<6)return err('A senha precisa ter pelo menos 6 caracteres');
 if(cad){const nome=$('#lNome').value.trim(),extra=$('#lExtra').value.trim(),apto=$('#lApto').value.trim();
  if(!nome||!extra||(perfil==='morador'&&!apto))return err('Preencha todos os campos');
  if(!$('#lAceite').checked)return err('Marque que você leu e concorda com a Política de Privacidade');
  try{localStorage.setItem('vz-pend',JSON.stringify({papel:perfil,nome,extra,apto}))}catch(x){}
  const r=await sb.auth.signUp({email:em,password:pw,options:{emailRedirectTo:location.origin+'/',data:{papel:perfil,nome,extra,apto,aceite_em:new Date().toISOString(),politica_versao:'3'}}});if(r.error)return err(msg(r.error));
  if(!r.data.session){err('Enviamos um e-mail de confirmação. Confirme e depois entre.');setModo(false);return}
 }else{const r=await sb.auth.signInWithPassword({email:em,password:pw});if(r.error)return err(msg(r.error))}
 $('#lSenha').value='';await enter()};
$('#sair').onclick=async()=>{await ntOff();await sb.auth.signOut();if(chan){sb.removeChannel(chan);chan=null}me=null;S.user=null;apply();toast('Você saiu da conta')};
$('#cEnviar').onclick=async()=>{const d=$('#cDesc').value.trim();if(!d){toast('Descreva o problema para abrir o chamado');return}
 const [tipo,preco]=$('#cTipo').value.split('|'),btn=$('#cEnviar'),f=$('#cFoto').files[0];let foto_path=null;btn.disabled=true;
 if(f){try{const blob=await reduz(f),path=me.condoId+'/'+me.id+'/'+crypto.randomUUID()+'.jpg';const u=await sb.storage.from('chamados').upload(path,blob,{contentType:'image/jpeg'});if(u.error)throw u.error;foto_path=path}catch(x){btn.disabled=false;return toast('Não foi possível enviar a foto. Tente de novo ou abra o chamado sem foto.')}}
 const {error}=await sb.from('chamados').insert({tipo,descricao:d,preco,foto_path});btn.disabled=false;
 if(error)return toast('Não foi possível abrir o chamado');$('#cDesc').value='';$('#cFoto').value='';await load();toast('Chamado aberto')};
$('#sCh').onchange=async e=>{const s=e.target.closest('[data-st]');if(!s)return;
 const {error}=await sb.from('chamados').update({status:s.value}).eq('id',s.dataset.st);if(error)return toast('Sem permissão para alterar');await load();toast('Status atualizado')};
$('#sPub').onclick=async()=>{const t=$('#aT').value.trim(),d=$('#aD').value.trim();if(!t){toast('Dê um título ao aviso');return}
 const {error}=await sb.from('avisos').insert({titulo:t,mensagem:d});if(error)return toast('Não foi possível publicar');$('#aT').value='';$('#aD').value='';await load();toast('Aviso publicado para os moradores')};
$('#vLista').onclick=async e=>{const b=e.target.closest('[data-v]');if(!b)return;const [id,i]=b.dataset.v.split(':');
 const {error}=await sb.from('votos').insert({votacao_id:id,opcao:Number(i)});
 if(error)return toast(error.code==='23505'?'Seu apartamento já votou nesta pauta':/apartamento/i.test(error.message)?error.message:'Não foi possível votar');await load();toast('Voto registrado')};
$('#sVoto').onclick=async()=>{const q=$('#qT').value.trim();if(!q){toast('Escreva a pergunta da votação');return}
 const {error}=await sb.from('votacoes').insert({pergunta:q,opcoes:['Aprovo','Reprovo']});if(error)return toast('Não foi possível abrir a votação');$('#qT').value='';await load();toast('Votação aberta aos moradores')};
$('#rSalvar').onclick=async()=>{const data=$('#rData').value;if(!data){toast('Escolha uma data');return}
 const hs=$('#rHora').selectedOptions[0];if(!hs||hs.disabled)return toast('Esse horário já está ocupado. Escolha outro.');if(acabou({data,horario:$('#rHora').value}))return toast('Esse horário já passou. Escolha outro.');
 const {error}=await sb.from('reservas').insert({area:$('#rArea').value,data,horario:$('#rHora').value});
 if(error)return toast(error.code==='23505'?'Esse horário já está reservado':'Não foi possível reservar');await load();toast('Reserva confirmada')};
$('#sServ').onclick=async e=>{const c=e.target.closest('[data-c]'),a=e.target.closest('[data-a]'),n=e.target.closest('[data-n]');
 if(c){const p=S.pres.find(x=>x.id===c.dataset.c);const {error}=await sb.from('chamados').insert({tipo:p.cat,descricao:'Contratado: '+p.n,preco:p.preco,prestador_id:p.id});
  if(error)return toast('Não foi possível contratar');await load();go('chamados');toast('Chamado aberto com '+p.n)}
 else if(a){const id=a.dataset.a;aberto=aberto===id?null:id;rServ()}
 else if(n){const [id,v]=n.dataset.n.split(':');
  const {error}=await sb.from('avaliacoes').upsert({prestador_id:id,autor_id:me.id,nota:Number(v)},{onConflict:'prestador_id,autor_id'});
  if(error)return toast('Só é possível avaliar depois do serviço resolvido');aberto=null;await load();toast('Obrigado pela avaliação')}};
$('#pSalvar').onclick=async()=>{const nome=$('#pN').value.trim(),preco=$('#pP').value.trim();if(!nome||!preco){toast('Preencha o nome e o preço');return}
 const {error}=await sb.from('prestadores').insert({nome,categoria:$('#pC').value,preco});if(error)return toast('Não foi possível cadastrar');$('#pN').value='';$('#pP').value='';await load();toast('Prestador cadastrado')};
$('#lEsq').onclick=async()=>{const em=$('#lMail').value.trim();if(!/^\S+@\S+\.\S+$/.test(em))return err('Digite seu e-mail no campo acima e toque aqui de novo');
 const {error}=await sb.auth.resetPasswordForEmail(em,{redirectTo:location.origin+'/'});if(error)return err(msg(error));info('Se esse e-mail estiver cadastrado, enviamos um link para criar uma nova senha.')};
sb.auth.onAuthStateChange(ev=>{if(ev==='PASSWORD_RECOVERY')$('#nova').hidden=false});
$('#nForm').onsubmit=async e=>{e.preventDefault();const s=$('#nSenha').value;if(s.length<6){$('#nErr').textContent='A senha precisa ter pelo menos 6 caracteres';return}
 const {error}=await sb.auth.updateUser({password:s});if(error){$('#nErr').textContent=msg(error);return}
 $('#nSenha').value='';$('#nErr').textContent='';$('#nova').hidden=true;toast('Senha alterada');await enter()};
$('#sConvite').onclick=()=>{const t='Entre no Vizinho, o app do nosso prédio '+me.condo.nome+': '+location.origin+'\nCódigo do prédio: '+me.condo.codigo+'\nToque em "Criar conta", escolha Morador e use este código.';
 if(navigator.share)navigator.share({text:t}).catch(()=>{});else window.open('https://wa.me/?text='+encodeURIComponent(t),'_blank')};
async function reduz(file,max=1280){const bmp=await createImageBitmap(file),k=Math.min(1,max/Math.max(bmp.width,bmp.height)),c=document.createElement('canvas');c.width=Math.round(bmp.width*k);c.height=Math.round(bmp.height*k);c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);return new Promise(r=>c.toBlob(r,'image/jpeg',.8))}
const urls=new Map();let nasc=Date.now();
async function fotos(sel){try{if(Date.now()-nasc>3000000){urls.clear();nasc=Date.now()}
 const need=S.ch.filter(c=>c.foto&&!urls.has(c.foto)).map(c=>c.foto);
 if(need.length){const {data}=await sb.storage.from('chamados').createSignedUrls(need,3600);(data||[]).forEach(x=>{if(x.signedUrl)urls.set(x.path,x.signedUrl)})}
 [...document.querySelector(sel).children].forEach((el,i)=>{const c=S.ch[i],u=c&&c.foto&&urls.get(c.foto);if(!u||el.querySelector('img'))return;
  el.insertAdjacentHTML('beforeend',`<a href="${u}" target="_blank" rel="noopener"><img alt="Foto do problema" loading="lazy" src="${u}" style="width:100%;max-height:220px;object-fit:cover;border-radius:12px;margin-top:10px"></a>`)})}catch(e){}}
const rCh0=window.rCh;window.rCh=()=>{rCh0();if(me)fotos('#cLista')};
const rSin1=window.rSin;window.rSin=()=>{rSin1();if(me)fotos('#sCh')};
function rGer(){if(!(S.user&&S.user.p==='sindico'))return;$('#gerDemo').hidden=true;
 const it=(tab,id,t,cls,lab,sub,extra,dim)=>`<div class="card"${dim?' style="opacity:.65"':''}><div class="row"><b style="min-width:0;overflow-wrap:anywhere">${esc(t)}</b><span class="pill s-${cls}">${esc(lab)}</span></div>${sub?`<p class="mute" style="margin-top:4px">${esc(sub)}</p>`:''}<div class="row" style="margin-top:10px;gap:8px">${extra||''}<button class="btn alt" style="flex:1;min-height:40px" data-del="${tab}:${id}">Apagar</button></div></div>`;
 const grp=(t,l)=>`<h2>${t}</h2>`+(l.length?l.join(''):'<p class="mute">Nada publicado.</p>');
 $('#sGer').innerHTML=grp('Avisos',S.avisos.map(x=>{const novo=Date.now()-new Date(x.at)<864e5;return it('avisos',x.id,x.t,novo?'andamento':'neutro',novo?'Novo':'Publicado',(x.d||'').slice(0,80))}))
  +grp('Votações',S.votos.map(x=>{const n=x.n.reduce((a,b)=>a+b,0);return it('votacoes',x.id,x.q,n?'andamento':'aberto',n?n+(n===1?' voto':' votos'):'Sem votos','')}))
  +grp('Prestadores',S.presTodos.map(x=>{const m=x.qtd?(x.soma/x.qtd).toFixed(1).replace('.',','):'',nota=x.qtd?'★ '+m+' ('+x.qtd+')':'Sem avaliações';
   return it('prestadores',x.id,x.n,x.ativo?(x.qtd?'feito':'neutro'):'neutro',x.ativo?nota:'Desativado',x.cat+' · '+x.preco+(x.ativo?'':' · '+nota),`<button class="btn alt" style="flex:1;min-height:40px" data-ativo="${x.id}:${x.ativo?0:1}">${x.ativo?'Desativar':'Reativar'}</button>`,!x.ativo)}))}
$('#sGer').onclick=async e=>{const ab=e.target.closest('[data-ativo]');
 if(ab){const [id,v]=ab.dataset.ativo.split(':');const {data,error}=await sb.from('prestadores').update({ativo:v==='1'}).eq('id',id).select();if(error||!data||!data.length)return toast('Não foi possível alterar');await load();return toast(v==='1'?'Prestador reativado':'Prestador desativado')}
 const b=e.target.closest('[data-del]');if(!b)return;const [tab,id]=b.dataset.del.split(':');
 const oq={avisos:'este aviso',votacoes:'esta votação e todos os votos dela',prestadores:'este prestador e as avaliações dele (para só escondê-lo, use Desativar)'};
 if(!confirm('Apagar '+oq[tab]+'? Isso não pode ser desfeito.'))return;
 const {data,error}=await sb.from(tab).delete().eq('id',id).select();if(error||!data||!data.length)return toast('Não foi possível apagar');await load();toast('Apagado')};
function rPerfil(){if(!me)return;const s=S.user.p==='sindico';$('#pfDemo').hidden=true;$('#pfBox').hidden=false;$('#pfNome').value=me.nome;$('#pfApto').value=me.unidade||'';
 $('#pfMail').textContent=me.email||'';$('#pfPredio').textContent=me.condo.nome;$('#pfAptoL').textContent=s?'Apartamento (opcional)':'Apartamento';$('#pfSub').textContent=s?'Síndico':'Morador';avatar();ntInit();rPlanos()}
$('#pfSalvar').onclick=async()=>{const nome=$('#pfNome').value.trim(),apto=$('#pfApto').value.trim(),er=$('#pfErr');er.textContent='';
 if(nome.length<2){er.textContent='Digite seu nome';return}
 if(S.user.p==='morador'&&!apto){er.textContent='Digite o número do apartamento';return}
 const {error}=await sb.rpc('atualizar_perfil',{p_nome:nome,p_unidade:apto});if(error){er.textContent=error.message;return}
 me.nome=nome;me.unidade=apto||null;S.user.n=nome.split(' ')[0];$('#ola').textContent='Olá, '+S.user.n;
 $('#local').textContent=me.condo.nome+' · '+(S.user.p==='sindico'?'Síndico':'Apto '+apto);avatar();await load();toast('Perfil atualizado')};
function hojeL(){return new Date().toLocaleDateString('sv-SE')}
function fim(h){const m=/(\d+)h\s*$/.exec(h||'');return m?Number(m[1]):24}
function acabou(x){const hj=hojeL();return x.data<hj||(x.data===hj&&new Date().getHours()>=fim(x.horario))}
function asc(x,y){return (x.data+x.horario).localeCompare(y.data+y.horario)}
function rHoras(){const a=$('#rArea').value,d=$('#rData').value,oc=new Set((S.resAll||[]).filter(x=>x.area===a&&x.data===d).map(x=>x.horario)),s=$('#rHora');
 [...s.options].forEach(o=>{const v=o.dataset.h||(o.dataset.h=o.value);o.value=v;o.disabled=oc.has(v);o.textContent=v+(oc.has(v)?' · ocupado':'')});
 if(s.selectedOptions[0]&&s.selectedOptions[0].disabled){const f=[...s.options].find(o=>!o.disabled);if(f)s.value=f.value}}
window.rRes=()=>{if(!me)return;const todas=S.resAll||[],sind=S.user.p==='sindico',minhas=todas.filter(x=>x.usuario_id===me.id);
 const quem=x=>{const p=S.perfis[x.usuario_id];return p?(p.unidade?'Apto '+p.unidade+' · ':'')+p.nome:''};
 const card=(x,cls,lab,q,canc)=>`<div class="card"><div class="row"><b>${esc(x.area)}</b><span class="pill s-${cls}">${lab}</span></div><p class="mute" style="margin-top:4px">${bd(x.data)} · ${esc(x.horario)}${q?' · '+esc(q):''}</p>${canc?`<button class="btn alt" style="margin-top:10px;min-height:40px" data-rc="${x.id}">Cancelar reserva</button>`:''}</div>`;
 const sec=(t,l)=>`<h2>${t}</h2>`+(l.length?l.join(''):'<p class="mute">Nenhuma por enquanto.</p>');
 $('#rLista').innerHTML=sec('Minhas próximas reservas',minhas.filter(x=>!acabou(x)).sort(asc).map(x=>card(x,'feito','Confirmada','',true)))
  +sec('Agenda do prédio',todas.filter(x=>x.usuario_id!==me.id&&!acabou(x)).sort(asc).map(x=>card(x,sind?'andamento':'neutro',sind?'Reservada':'Ocupado',sind?quem(x):'',sind)))
  +sec('Histórico',minhas.filter(acabou).sort((x,y)=>asc(y,x)).slice(0,20).map(x=>card(x,'neutro','Concluída','',false)));rHoras()};
$('#rH').hidden=true;$('#rArea').onchange=$('#rData').onchange=rHoras;
{const hj=hojeL();$('#rData').min=hj;if(!$('#rData').value||$('#rData').value<hj)$('#rData').value=hj}
$('#rLista').onclick=async e=>{const b=e.target.closest('[data-rc]');if(!b)return;if(!confirm('Cancelar esta reserva?'))return;
 const {data,error}=await sb.from('reservas').delete().eq('id',b.dataset.rc).select();if(error||!data||!data.length)return toast('Não foi possível cancelar');await load();toast('Reserva cancelada')};
async function avatar(){const ini=(me.nome||'?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();let url=null;
 if(me.foto){const {data}=await sb.storage.from('avatares').createSignedUrl(me.foto,3600);url=data&&data.signedUrl}
 [$('#avTop'),$('#pfAv')].forEach(e=>{e.hidden=false;e.textContent=url?'':ini;e.style.backgroundImage=url?'url("'+url+'")':''});$('#pfFotoRm').hidden=!me.foto}
$('#pfFotoBtn').onclick=()=>$('#pfFoto').click();
$('#pfFoto').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const blob=await reduz(f,512),path=me.id+'/avatar.jpg';
 const u=await sb.storage.from('avatares').upload(path,blob,{contentType:'image/jpeg',upsert:true});if(u.error)throw u.error;
 const r=await sb.rpc('definir_foto',{p_path:path});if(r.error)throw r.error;me.foto=path;await avatar();toast('Foto atualizada')}catch(x){toast('Não foi possível enviar a foto')}e.target.value=''};
$('#pfFotoRm').onclick=async()=>{await sb.storage.from('avatares').remove([me.foto]);const r=await sb.rpc('definir_foto',{p_path:null});if(r.error)return toast('Não foi possível remover');me.foto=null;await avatar();toast('Foto removida')};
const u8=s=>{const r=atob((s+'='.repeat((4-s.length%4)%4)).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from([...r].map(c=>c.charCodeAt(0)))};
async function ntSub(){try{return await (await navigator.serviceWorker.ready).pushManager.getSubscription()}catch(e){return null}}
async function ntInit(){if(!C.vapid||!('serviceWorker' in navigator)||!('PushManager' in window))return;$('#ntBox').hidden=false;
 const sub=await ntSub();$('#ntSwitch').checked=!!sub&&Notification.permission==='granted'}
async function ntOff(){try{const sub=await ntSub();if(sub){await sb.from('push_dispositivos').delete().eq('endpoint',sub.endpoint);await sub.unsubscribe()}}catch(e){}}
$('#ntSwitch').onchange=async e=>{const on=e.target.checked,h=$('#ntHint');
 try{if(on){if(await Notification.requestPermission()!=='granted'){e.target.checked=false;h.textContent='Permissão negada. Libere as notificações nas configurações do navegador.';return}
  const sub=await (await navigator.serviceWorker.ready).pushManager.subscribe({userVisibleOnly:true,applicationServerKey:u8(C.vapid)}),j=sub.toJSON();
  const {error}=await sb.from('push_dispositivos').upsert({endpoint:j.endpoint,chave_p256dh:j.keys.p256dh,chave_auth:j.keys.auth},{onConflict:'endpoint'});if(error)throw error;
  h.textContent='Notificações ativadas neste aparelho.'}else{await ntOff();h.textContent='Notificações desativadas.'}}
 catch(x){e.target.checked=!on;h.textContent='Não foi possível alterar as notificações.'}};
const PLANOS=C.planos||[{id:'starter',nome:'Starter',ate:20,preco:79},{id:'standard',nome:'Standard',ate:60,preco:149},{id:'pro',nome:'Pro',ate:120,preco:299},{id:'enterprise',nome:'Enterprise',ate:null,rotulo:'Sob consulta',nota:'R$ 2,50 a R$ 4,00 por unidade adicional'}];
function rPlanos(){if(!(me&&S.user&&S.user.p==='sindico'))return;$('#plDemo').hidden=true;$('#plBox').hidden=false;
 if(!$('#plUn').dataset.i){$('#plUn').dataset.i=1;if(me.condo.unidades)$('#plUn').value=me.condo.unidades}
 const n=Number($('#plUn').value)||0,rec=n?(PLANOS.find(p=>p.ate==null||n<=p.ate)||{}).id:null;let prev=0;
 $('#plLista').innerHTML=PLANOS.map(p=>{const faixa=p.ate==null?'Mais de '+prev+' unidades':(prev?'De '+(prev+1)+' a '+p.ate+' unidades':'Até '+p.ate+' unidades');if(p.ate!=null)prev=p.ate;
  const atual=me.condo.plano===p.id,preco=p.preco!=null?'R$ '+Number(p.preco).toLocaleString('pt-BR',{minimumFractionDigits:2})+'/mês':(p.rotulo||'Preço a definir');
  return `<div class="card"><div class="row"><b>${esc(p.nome)}</b>${atual?'<span class="pill s-feito">Plano atual</span>':p.id===rec?'<span class="pill s-andamento">Recomendado</span>':''}</div><p class="mute" style="margin-top:4px">${faixa}</p><p style="font-size:22px;font-weight:800;margin:8px 0">${preco}</p>${p.nota?`<p class="quote" style="margin:-4px 0 8px">${esc(p.nota)}</p>`:''}<button class="btn${atual?' alt':''}" data-pl="${p.id}"${atual?' disabled':''}>${atual?'Plano escolhido':'Escolher este plano'}</button></div>`}).join('')}
$('#plUn').oninput=rPlanos;
$('#plLista').onclick=async e=>{const b=e.target.closest('[data-pl]');if(!b)return;const n=Number($('#plUn').value);if(!n||n<1){toast('Informe quantas unidades o prédio tem');$('#plUn').focus();return}
 const {error}=await sb.rpc('escolher_plano',{p_unidades:n,p_plano:b.dataset.pl});if(error)return toast('Não foi possível registrar o plano');me.condo.plano=b.dataset.pl;me.condo.unidades=n;rPlanos();toast('Plano registrado')};
apply();sb.auth.getSession().then(({data})=>{if(data.session)enter()});
})();
