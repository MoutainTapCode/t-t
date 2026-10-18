import * as THREE from './three.module.js';
const panel=document.getElementById('bouquet-finale'), host=document.getElementById('bouquet-view');
const openButton=document.getElementById('bouquet-open'), closeButton=document.getElementById('bouquet-close');
let renderer,scene,camera,bouquet,raf=0,visible=false,started=false,last=0,angle=0,tilt=.08,zoom=7.4,drag=false,previousX=0,previousY=0,pinch=0;
const pointers=new Map(), reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.68,side:THREE.DoubleSide,...extra});
const green=mat('#478054'), darkGreen=mat('#315b38'), ivory=mat('#fff8ee'), gold=mat('#e8bd65');
function mesh(geometry,material,parent){const m=new THREE.Mesh(geometry,material);parent.add(m);return m;}
function tube(points,radius,material,parent){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),18,radius,6,false),material,parent);}
function petal(width,height,depth,material,parent){
 const vertices=[],indices=[],nu=14,nv=18;
 for(let j=0;j<=nv;j++) {const t=j/nv; const w=width*Math.pow(Math.sin(Math.PI*t),.64);
  for(let i=0;i<=nu;i++){const u=2*i/nu-1;vertices.push(u*w,height*t,depth*Math.sin(Math.PI*t*.9)+.14*u*u*Math.sin(Math.PI*t));}}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+nu+1;indices.push(a,b,a+1,a+1,b,b+1);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();return mesh(geometry,material,parent);
}
function leaf(start,end,width,parent){const g=new THREE.Group();g.position.copy(start);g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.clone().sub(start).normalize());parent.add(g);petal(width,start.distanceTo(end),.18,green,g);}
function flower(x,y,z,index){
 const base=new THREE.Vector3((index%3-1)*.07,-1.65,(index%2-.5)*.13), top=new THREE.Vector3(x,y,z);
 tube([base,new THREE.Vector3(x*.48,-.15,z*.5),top],.028,green,bouquet);
 const blossom=new THREE.Group();blossom.position.copy(top);blossom.rotation.set(z*.28, index*1.37,-x*.28);bouquet.add(blossom);
 const pink=index%3!==0, colors=pink?['#f6a9c9','#ed8eb7','#ffd0e1']:['#fffefa','#f2e8eb','#ffffff'];
 for(let ring=0;ring<2;ring++)for(let p=0;p<3;p++){
  const g=new THREE.Group(),a=p*Math.PI*2/3+ring*Math.PI/3;g.rotation.y=a;g.position.set(Math.sin(a)*.075,ring*.07,Math.cos(a)*.075);blossom.add(g);
  petal(ring?.255:.31,ring?.8:.88,ring?.24:.36,mat(colors[(p+ring)%3]),g);
 }
 const from=new THREE.Vector3(x*.38,-.6,z*.4);leaf(from,new THREE.Vector3(x+(index%2?-.38:.38),y+.12,z-.2),.12,bouquet);
}
function daisy(x,y,z,index){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.set(.7,index,0);bouquet.add(g);
 tube([new THREE.Vector3(0,-1.15,0),new THREE.Vector3(x*.6,y-.3,z*.6),new THREE.Vector3(x,y,z)],.012,green,bouquet);
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5,m=mesh(new THREE.SphereGeometry(.075,8,6),ivory,g);m.scale.set(.7,1.5,.35);m.position.set(Math.sin(a)*.085,Math.cos(a)*.085,0);m.rotation.z=-a;}
 mesh(new THREE.SphereGeometry(.04,8,6),gold,g).position.z=.028;
}
function build(){
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;host.appendChild(renderer.domElement);
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(35,1,.1,40);scene.add(new THREE.HemisphereLight(0xfff7f5,0x879b8c,2.5));
 const light=new THREE.DirectionalLight(0xffffff,3.2);light.position.set(-3,5,5);scene.add(light);const rim=new THREE.DirectionalLight(0xffbbd7,1.6);rim.position.set(3,2,-3);scene.add(rim);
 bouquet=new THREE.Group();scene.add(bouquet);
 [[-.45,1.25,-.15],[.52,1.12,-.2],[-.94,.55,0],[.04,.55,.42],[.87,.42,.15],[-.65,-.12,.5],[.52,-.17,.57],[-.4,.56,-.55],[.48,.32,-.55]].forEach((p,i)=>flower(...p,i));
 for(let i=0;i<21;i++){const a=i*2.39996,r=.65+(i%4)*.12;daisy(Math.sin(a)*r,-.7+(i%7)*.22,Math.cos(a)*r,i);}
 for(let i=0;i<7;i++){const a=i*2.39996;leaf(new THREE.Vector3(0,-1,0),new THREE.Vector3(Math.sin(a)*1.17,.1+(i%3)*.55,Math.cos(a)*.7),.115,bouquet);}
 const wrap=mesh(new THREE.CylinderGeometry(.19,.15,.74,24),ivory,bouquet);wrap.position.y=-1.35;
 const ribbon=mat('#e7b4c1');mesh(new THREE.TorusGeometry(.19,.035,8,32),ribbon,bouquet).rotation.x=Math.PI/2;
 const belt=bouquet.children[bouquet.children.length-1];belt.position.y=-1.04;
 for(let side of [-1,1]){const bow=mesh(new THREE.TorusGeometry(.16,.035,8,32),ribbon,bouquet);bow.scale.set(1.4,.7,1);bow.position.set(side*.18,-1.07,.22);bow.rotation.z=side*.35;const tail=petal(.08,.5,.06,ribbon,bouquet);tail.rotation.z=Math.PI+side*.25;tail.position.set(side*.06,-1.09,.2);}
 resize();new ResizeObserver(resize).observe(host);
}
function resize(){if(!renderer)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
function render(now){if(!visible||document.hidden){raf=0;return;}const dt=Math.min((now-last)/1000,.05);last=now;if(!drag&&!reduced)angle+=dt*.13;bouquet.rotation.set(tilt,angle,0);bouquet.position.y=reduced?0:Math.sin(now*.0008)*.035;camera.position.set(0,.2,zoom);camera.lookAt(0,.1,0);renderer.render(scene,camera);raf=requestAnimationFrame(render);}
function start(){if(!raf&&visible&&!document.hidden){last=performance.now();raf=requestAnimationFrame(render);}}
function show(){panel.hidden=false;visible=true;try{if(!renderer)build();resize();start();host.focus();}catch(e){document.getElementById('bouquet-hint').textContent='Chưa bật được 3D. Hãy bật tăng tốc đồ họa của trình duyệt rồi tải lại trang.';}}
function hide(){visible=false;panel.hidden=true;cancelAnimationFrame(raf);raf=0;openButton.focus();}
openButton.addEventListener('click',show);closeButton.addEventListener('click',hide);
function setZoom(delta){zoom=THREE.MathUtils.clamp(zoom+delta,5.1,10.5);}
document.getElementById('bouquet-in').onclick=()=>setZoom(-.5);document.getElementById('bouquet-out').onclick=()=>setZoom(.5);
document.getElementById('bouquet-reset').onclick=()=>{angle=0;tilt=.08;zoom=7.4;};
host.addEventListener('pointerdown',e=>{e.stopPropagation();host.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});drag=true;previousX=e.clientX;previousY=e.clientY;pinch=0;});
host.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch)setZoom((pinch-d)*.015);pinch=d;}else{angle+=(e.clientX-previousX)*.009;tilt=THREE.MathUtils.clamp(tilt+(e.clientY-previousY)*.006,-.9,.9);}previousX=e.clientX;previousY=e.clientY;});
function release(e){pointers.delete(e.pointerId);drag=pointers.size>0;pinch=0;const p=[...pointers.values()][0];if(p){previousX=p.x;previousY=p.y;}}
['pointerup','pointercancel','lostpointercapture'].forEach(n=>host.addEventListener(n,release));
host.addEventListener('wheel',e=>{e.preventDefault();setZoom(e.deltaY*.005);},{passive:false});
host.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Escape'].includes(e.key))return;e.preventDefault();e.stopPropagation();if(e.key==='ArrowLeft')angle-=.15;if(e.key==='ArrowRight')angle+=.15;if(e.key==='ArrowUp')tilt=Math.max(-.9,tilt-.1);if(e.key==='ArrowDown')tilt=Math.min(.9,tilt+.1);if(e.key==='+')setZoom(-.3);if(e.key==='-')setZoom(.3);if(e.key==='Escape')hide();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)start();});
function checkFinal(){if(started||!document.body.classList.contains('luck-scene'))return;started=true;openButton.hidden=false;}
new MutationObserver(checkFinal).observe(document.body,{attributes:true,attributeFilter:['class']});checkFinal();
