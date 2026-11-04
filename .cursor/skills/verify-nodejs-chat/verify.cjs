#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const {spawn, spawnSync} = require('node:child_process');
const net = require('node:net');
const root = process.cwd();
const out = process.env.VERIFY_EVIDENCE_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'verify-nodejs-chat-'));
fs.mkdirSync(out, {recursive:true});
const evidence = {app:'nodejs-chat', startedAt:new Date().toISOString(), actions:[]};
const children=[];const sockets=[];
const reserve=()=>new Promise(r=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>r(p));});});
function launch(cmd,args,env){const log=fs.openSync(path.join(out,`process-${children.length}.log`),'a');const child=spawn(cmd,args,{cwd:root,env:{...process.env,...env},stdio:['ignore',log,log]});fs.closeSync(log);children.push(child);child.on('error',e=>{evidence.processError=e.message;});return child;}
async function request(url, options={}) {const res=await fetch(url,{...options,signal:AbortSignal.timeout(5000)});const text=await res.text(); evidence.actions.push({method:options.method||'GET',url,status:res.status,body:text});return {status:res.status,text,json:()=>JSON.parse(text)};}
async function ready(base,route,child){for(let i=0;i<100;i++){if(evidence.processError)throw Error(evidence.processError);if(child.exitCode!==null)throw Error(`server exited ${child.exitCode}`);try{const r=await fetch(base+route,{signal:AbortSignal.timeout(300)});if(r.ok)return;}catch{} await new Promise(r=>setTimeout(r,100));}throw Error('readiness timeout');}
(async()=>{
const port=await reserve();const base=`http://127.0.0.1:${port}`;
const child=launch(process.execPath,['index.js'],{PORT:String(port)});await ready(base,'/register',child);
assert((await request(base+'/register')).text.includes('Create Account'));assert((await request(base+'/login')).text.includes('Login'));
const post=async(route,body)=>request(base+route,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams(body).toString()});
const user='verify-'+Date.now();const password='disposable-local-test';
assert.equal((await post('/registerAPI',{username:user,password})).status,200);
assert.equal((await post('/registerAPI',{username:user,password})).status,409);
assert.equal((await post('/loginAPI',{username:'absent',password})).status,401);
assert.equal((await post('/loginAPI',{username:user,password:'wrong'})).status,401);
const login=await post('/loginAPI',{username:user,password});assert.equal(login.status,200);const token=login.json().token;assert(login.json().success);evidence.actions[evidence.actions.length-1].body='success:true; disposable token redacted';
const {io}=require('socket.io-client');
const open=(auth)=>new Promise((resolve,reject)=>{const s=io(base,{auth,forceNew:true,reconnection:false,timeout:3000});sockets.push(s);s.once('connect',()=>resolve(s));s.once('connect_error',e=>{s.close();reject(e)});});
let refused=false;try{await open({})}catch(e){refused=/not authenticated/.test(e.message)}assert(refused);evidence.actions.push({socket:'unauthenticated rejected'});
const a=await open({token});const b=await open({token});
try {const received=new Promise((resolve,reject)=>{b.once('message',resolve);setTimeout(()=>reject(Error('message timeout')),3000).unref();});a.emit('message','local verification hello');const message=await received;assert.deepEqual(message,{user,message:'local verification hello'});evidence.actions.push({socket:'authenticated peer broadcast',message});} finally {a.close();b.close();}
assert.equal((await request(base+'/login')).status,200);
if(process.env.VERIFY_BROWSER==='1') {
 const {chromium}=require('@playwright/test');
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});
 try {const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base+'/register');await page.getByPlaceholder('Username').fill('browser-'+Date.now());await page.getByPlaceholder('Password').fill('local-test-only');await page.screenshot({path:path.join(out,'chat-register-form.png'),fullPage:true});await page.getByRole('button',{name:'Create Account'}).click();await page.getByText('User Registration is Successful').waitFor();await page.screenshot({path:path.join(out,'chat-registered.png'),fullPage:true});await page.goto(base+'/login');await page.screenshot({path:path.join(out,'chat-login-form.png'),fullPage:true});
 fs.writeFileSync(path.join(out,'final-page.txt'),await page.locator('body').innerText());
 assert.deepEqual(errors,[]);evidence.actions.push({browser:'user journey passed',initialViewport:'390x844',finalViewport:page.viewportSize(),errors});
 } finally {await browser.close();}
}
 evidence.result='passed';
})().catch(e=>{evidence.result='failed';evidence.error=e.stack;process.exitCode=1;}).finally(async()=>{
 for(const s of sockets)s.close();
 for(const c of children.reverse()){if(c.exitCode===null){c.kill('SIGTERM');await Promise.race([new Promise(r=>c.once('exit',r)),new Promise(r=>setTimeout(r,2000))]);if(c.exitCode===null)c.kill('SIGKILL');}}
 evidence.cleaned=children.every(c=>c.exitCode!==null||c.signalCode!==null);
 fs.writeFileSync(path.join(out,'evidence.json'),JSON.stringify(evidence,null,2));
 assert(fs.existsSync(path.join(out,'evidence.json')));console.log(JSON.stringify({result:evidence.result,evidence:out,cleaned:evidence.cleaned}));
});
