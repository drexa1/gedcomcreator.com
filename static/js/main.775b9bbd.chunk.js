(this.webpackJsonpgedcomcreator=this.webpackJsonpgedcomcreator||[]).push([[0],{106:function(e){e.exports=JSON.parse('{"header.h1":"Digitalice sus registros geneal\xf3gicos en un fichero familiar","header.p":"Gratuito (y lo ser\xe1 para siempre) hasta 50 familiares. Para m\xe1s de 50 familiares, 0.5\u20ac por pariente","instructions.h2":"Como funciona la herramienta","instructions.download.h3":"Descargar","instructions.download.p":"Descargue las plantillas para rellenar. Necesita: individuos, padres, y relaciones.","instructions.fill-in.h3":"Rellenar","instructions.fill-in.p":"Rellene las plantillas con la informaci\xf3n de los familiares. Consulte aqu\xed si tiene dudas.","instructions.collect.h3":"Recibir","instructions.collect.p":"Recoja su fichero familiar y visual\xedcelo en cualquier visor. \xbfNo conoce uno? Pruebe aqu\xed","instructions.templates.downloaded":"Revise su carpeta de descargas","instructions.templates.compressed":"Encontrar\xe1 las 3 plantillas dentro del archivo comprimido:","dropzone.p.drag-n-drop":"Arrastre aqu\xed las plantillas ya rellenadas, o ","dropzone.p.browse-them":"explore sus archivos","dropzone.p.files-needed":"Necesitaremos los 3 archivos","dropzone.button.browse-files":"Explorar archivos","dropzone.button.submit":"Enviar"}')},107:function(e){e.exports=JSON.parse('{"instructions.download.h3":"Pobierz"}')},135:function(e,s,t){},137:function(e,s,t){"use strict";t.r(s);var a=t(99),n=t.n(a),i=t(0),r=t(149),o=t(152),l=t(53),c=t(146),d=t(100),u=t(101),j=t(3);var p=t(147),h=t(103);const f=e=>{let{direction:s,onClick:t,onMouseDown:a,onMouseUp:n,hidden:i}=e;const r="left"===s?"left-arrow":"right-arrow",o="left"===s?"M15 4l-8 20 8 20":"M9 4l8 20-8 20";return Object(j.jsx)("div",{className:`arrow ${r} ${i?"hidden":""}`,onClick:t,onMouseDown:a,onMouseUp:n,children:Object(j.jsx)("svg",{width:"80",height:"100%",viewBox:"0 0 24 48",children:Object(j.jsx)("path",{d:o,stroke:"lightgray",strokeWidth:"2",fill:"none",strokeLinecap:"round",strokeLinejoin:"round"})})})},b=e=>{let{currentIndex:s,totalCards:t}=e;return Object(j.jsxs)("div",{className:"carousel-content",children:[Object(j.jsxs)(o.a,{as:"h1",children:["Card ",s+1," Header"]}),Object(j.jsxs)("div",{className:"carousel-body",children:["This is the content of card ",s+1]}),Object(j.jsx)("div",{className:"dots-container",children:Array.from({length:t}).map(((e,t)=>Object(j.jsx)("span",{className:"dot "+(t===s?"active":"")},t)))})]})},m=Object(i.forwardRef)(((e,s)=>{const[t,a]=Object(i.useState)(!1),[n,r]=Object(i.useState)(!1),[o,l]=Object(i.useState)(0);Object(i.useEffect)((()=>{t&&l(0)}),[t]);const c=()=>{o<3&&l(o+1)},d=()=>{o>0&&l(o-1)},u=()=>r(!0),m=()=>r(!1),O=Object(h.a)({onSwipedLeft:c,onSwipedRight:d,preventScrollOnSwipe:!0,trackMouse:!0});return Object(i.useImperativeHandle)(s,(()=>({open:()=>a(!0)}))),Object(j.jsx)(p.a,{open:t,onClose:()=>a(!1),className:"instructions-popup",children:Object(j.jsxs)("div",{className:"carousel-wrapper",...O,children:[Object(j.jsx)(f,{direction:"left",onClick:d,onMouseDown:u,onMouseUp:m,hidden:0===o}),Object(j.jsx)(b,{currentIndex:o,totalCards:4}),Object(j.jsx)(f,{direction:"right",onClick:c,onMouseDown:u,onMouseUp:m,hidden:3===o})]})})})),O=Object(i.forwardRef)(((e,s)=>{let{showMessage:t,instructionsRef:a}=e;return Object(j.jsxs)("div",{className:"instructions-wrapper",ref:s,children:[Object(j.jsx)("h2",{children:Object(j.jsx)(c.a,{id:"instructions.h2",defaultMessage:"How the tool works"})}),Object(j.jsxs)("div",{className:"instructions-container",children:[Object(j.jsxs)("div",{className:"instruction-box",onClick:()=>(e=>{let{showMessage:s}=e;const{formatMessage:t}=Object(u.a)(),a=t({id:"templates.zip",defaultMessage:"templates.zip"}),n=`/gedcomcreator/templates/${E}/${a}`,i=t({id:"individuals.csv",defaultMessage:"1-individuals.csv"}),r=t({id:"parents.csv",defaultMessage:"2-parents.csv"}),o=t({id:"relationships.csv",defaultMessage:"3-relationships.csv"});fetch(n).then((e=>e.blob())).then((e=>{Object(d.saveAs)(e,a),s({type:"positive",header:Object(j.jsx)(c.a,{id:"instructions.templates.downloaded",defaultMessage:"Review your Downloads folder"}),text:Object(j.jsxs)(j.Fragment,{children:[Object(j.jsx)(c.a,{id:"instructions.templates.compressed",defaultMessage:"You will find the assets.templates in the compressed file:"}),"\xa0",Object(j.jsx)("span",{children:i}),",\xa0",Object(j.jsx)("span",{children:r}),",\xa0",Object(j.jsx)("span",{children:o})]})})})).catch((e=>console.error("Download failed:",e)))})({showMessage:t}),children:[Object(j.jsx)("h3",{children:Object(j.jsx)(c.a,{id:"instructions.download.h3",defaultMessage:"Download"})}),Object(j.jsx)("p",{children:Object(j.jsx)(c.a,{id:"instructions.download.p",defaultMessage:"Get here the assets.templates to fill-in. You need: individuals, parents, and relationships."})})]}),Object(j.jsxs)("div",{className:"instruction-box",onClick:()=>{var e;return null===(e=a.current)||void 0===e?void 0:e.open()},children:[Object(j.jsx)("h3",{children:Object(j.jsx)(c.a,{id:"instructions.fill-in.h3",defaultMessage:"Fill-in"})}),Object(j.jsx)("p",{children:Object(j.jsx)(c.a,{id:"instructions.fill-in.p",defaultMessage:"Fill-in each template with the family records. Check here if you have doubts."})})]}),Object(j.jsx)(m,{ref:a}),Object(j.jsxs)("div",{className:"instruction-box",children:[Object(j.jsx)("h3",{children:Object(j.jsx)(c.a,{id:"instructions.collect.h3",defaultMessage:"Collect"})}),Object(j.jsx)("p",{children:Object(j.jsx)(c.a,{id:"instructions.collect.p",defaultMessage:"Collect your family file so you can visualize it anywhere. Know no one? Check this."})})]})]})]})}));var g=t(150),x=t(105),v=t.n(x);const w=()=>{Object(u.a)().formatMessage({id:"individuals.csv",defaultMessage:"1-individuals.csv"}),Object(u.a)().formatMessage({id:"parents.csv",defaultMessage:"2-parents.csv"}),Object(u.a)().formatMessage({id:"relationships.csv",defaultMessage:"3-relationships.csv"});return{individualsFilename:Object(u.a)().formatMessage({id:"individuals.file.columns",defaultMessage:"individual_id, name, surname1, surname2, nickname, gender, birth_date, birth_place, notes"}).split(", "),parentsFilename:Object(u.a)().formatMessage({id:"parents.file.columns",defaultMessage:"individual_id, father_id, mother_id"}).split(", "),relationshipsFilename:Object(u.a)().formatMessage({id:"relationships.file.columns",defaultMessage:"husband_id, wife_id, notes"}).split(", ")}};function M(e,s){const t=v.a.parse(s,{header:!0,skipEmptyLines:!0});if(t.errors.length)return console.error("CSV loading errors:",t.errors),!1;return function(e,s,t){const a=Object.keys(s[0]),n=t.filter((e=>!a.includes(e)));if(n.length){const s=`${e}: the following required columns are missing: ${n.join(", ")}`;return console.error(s),!1}return!0}(e,t.data,w()[e])}const y=e=>{if(!e)return null;const s=Object.keys(w());if(!function(e,s){for(const t of e){const e=t.name;if(!s.includes(e))return console.error(`Invalid filename: ${e}`),!1}return!0}(Array.from(e),s))return null;const t=Array.from(e).map((e=>new Promise((s=>{const t=new FileReader;t.readAsText(e,"UTF-8"),t.onload=()=>{const a=t.result,n=M(e.name,a);s(n?e:null)},t.onerror=()=>{console.error("Error reading file:",e.name),s(null)}}))));Promise.all(t).then((s=>{const t=s.filter((e=>null!==e));Array.from(e).filter((e=>!t.some((s=>s.name===e.name)))).map((e=>`'${e.name}'`)).join(", ");return!t||t.length<3||t.length>3?(console.error("Wrong number of uploaded files..."),null):t}))};const k=e=>{let{setMessage:s}=e;const[t,a]=Object(i.useState)([]),n=Object(i.useRef)(null),r=async e=>{try{if(e){const s=y(e);s&&a([...t,...s])}}catch(n){n instanceof Error&&s({type:"negative",header:"File Upload Error",text:n.message})}};return Object(j.jsxs)("div",{className:"ui upload-container",children:[Object(j.jsxs)("div",{className:"ui dropzone",onClick:()=>{var e;null===(e=n.current)||void 0===e||e.click()},onDrop:async e=>{e.preventDefault(),await r(e.dataTransfer.files)},onDragOver:e=>e.preventDefault(),children:[Object(j.jsx)("input",{type:"file",multiple:!0,ref:n,onChange:async e=>{await r(e.target.files)},style:{display:"none"}}),Object(j.jsxs)("p",{children:[Object(j.jsx)(c.a,{id:"dropzone.p.drag-n-drop",defaultMessage:"Drag & drop here your filled assets.templates, or "}),Object(j.jsx)("span",{children:Object(j.jsx)(c.a,{id:"dropzone.p.browse-them",defaultMessage:"browse them"})})]}),Object(j.jsx)("p",{children:Object(j.jsx)(c.a,{id:"dropzone.p.files-needed",defaultMessage:"We need all the 3 files"})}),Object(j.jsxs)(g.a,{children:[Object(j.jsx)(l.a,{name:"upload"}),Object(j.jsx)(c.a,{id:"dropzone.button.browse-files",defaultMessage:"Browse files"})]})]}),Object(j.jsx)(g.a,{primary:!0,disabled:!0,children:Object(j.jsx)(c.a,{id:"dropzone.button.submit",defaultMessage:"Submit"})})]})},N=()=>{const[e,s]=Object(i.useState)(null),[t,a]=Object(i.useState)(!1),n=Object(i.useRef)(null);return Object(j.jsxs)("div",{className:"body",children:[e&&Object(j.jsx)("div",{className:"message-container "+(t?"expanded":"collapsed"),children:Object(j.jsxs)(r.a,{info:!0,positive:"positive"===e.type,negative:"negative"===e.type,onDismiss:()=>s(null),children:[Object(j.jsx)(r.a.Header,{children:e.header}),Object(j.jsx)("p",{children:e.text})]})}),Object(j.jsx)(o.a,{as:"h1",children:Object(j.jsx)(c.a,{id:"header.h1",defaultMessage:"Digitalize all your genealogy records into a family file"})}),Object(j.jsxs)("p",{children:[Object(j.jsx)(c.a,{id:"header.p",defaultMessage:"It is (and will always be) free up to 50 relatives. Above 50 relatives, $0.5 per relative"}),"\xa0",Object(j.jsx)(l.a,{name:"credit card"})]}),Object(j.jsx)(O,{showMessage:e=>{s(e),a(!0)},instructionsRef:n}),Object(j.jsx)(k,{setMessage:s})]})};t(135),t(136);var C=t(106),D=t(107),z=t(148);const R={es:C,pl:D},S=navigator.language&&navigator.language.split(/[-_]/)[0];n.a.createRoot(document.getElementById("root")).render(Object(j.jsx)(z.a,{locale:S,messages:R[S],children:Object(j.jsx)(N,{})}));var E=s.default=S}},[[137,1,2]]]);
//# sourceMappingURL=main.775b9bbd.chunk.js.map