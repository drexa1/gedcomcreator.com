(this.webpackJsonpgedcomcreator=this.webpackJsonpgedcomcreator||[]).push([[0],{123:function(e,s,t){},125:function(e,s,t){"use strict";t.r(s);var i=t(87),a=t.n(i),l=t(0),n=t(136),o=t(138),r=t(48),c=t(137),d=t(139),p=t(88),u=t(56),j=t(57),h=t(3);const b={es:u,pl:j};var v=()=>{const[e,s]=Object(l.useState)(null),[t,i]=Object(l.useState)(!1),[a,u]=Object(l.useState)([]),j=Object(l.useRef)(null),v=e=>{s(e),i(!0),setTimeout((()=>i(!1)),15e3),setTimeout((()=>s(null)),2e4)},f=e=>{e&&u([...a,...Array.from(e)])};return Object(h.jsxs)("div",{className:"body",children:[e&&Object(h.jsx)("div",{className:"message-container "+(t?"expanded":"collapsed"),children:Object(h.jsxs)(n.a,{positive:"positive"===e.type,negative:"negative"===e.type,onDismiss:()=>s(null),children:[Object(h.jsx)(n.a.Header,{children:e.header}),Object(h.jsx)("p",{children:e.text})]})}),Object(h.jsx)(o.a,{as:"h1",children:Object(h.jsx)(d.a,{id:"header.h1",defaultMessage:"Digitalize all your genealogy records into a family file"})}),Object(h.jsxs)("p",{children:[Object(h.jsx)(d.a,{id:"header.p",defaultMessage:"It is (and will always be) free up to 50 relatives. Above 50 relatives, $0.5 per relative"})," ",Object(h.jsx)(r.a,{name:"credit card"})]}),Object(h.jsxs)("div",{className:"instructions-wrapper",children:[Object(h.jsx)("h2",{children:Object(h.jsx)(d.a,{id:"instructions.h2",defaultMessage:"How the tool works"})}),Object(h.jsxs)("div",{className:"instructions-container",children:[Object(h.jsxs)("div",{className:"instruction-box",onClick:()=>{var e,s;const t=null!==(e=null===(s=b[w])||void 0===s?void 0:s["templates.zip"])&&void 0!==e?e:"templates.zip";fetch(`/assets/templates/${w}/${t}`).then((e=>e.blob())).then((e=>{var s,i,a,l,n,o;Object(p.saveAs)(e,t),v({type:"positive",header:Object(h.jsx)(d.a,{id:"instructions.templates.downloaded",defaultMessage:"Review your Downloads folder"}),text:Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)(d.a,{id:"instructions.templates.compressed",defaultMessage:"You will find the assets.templates in the compressed file:"}),"\xa0",Object(h.jsx)("span",{children:null!==(s=null===(i=b[w])||void 0===i?void 0:i["individuals.csv"])&&void 0!==s?s:"1-individuals.csv"}),",\xa0",Object(h.jsx)("span",{children:null!==(a=null===(l=b[w])||void 0===l?void 0:l["parents.csv"])&&void 0!==a?a:"2-parents.csv"}),",\xa0",Object(h.jsx)("span",{children:null!==(n=null===(o=b[w])||void 0===o?void 0:o["relationships.csv"])&&void 0!==n?n:"3-relationships.csv"})]})})})).catch((e=>console.error("Download failed:",e)))},children:[Object(h.jsx)("h3",{children:Object(h.jsx)(d.a,{id:"instructions.download.h3",defaultMessage:"Download"})}),Object(h.jsx)("p",{children:Object(h.jsx)(d.a,{id:"instructions.download.p",defaultMessage:"Get here the assets.templates to fill-in. You need: individuals, parents, and relationships."})})]}),Object(h.jsxs)("div",{className:"instruction-box",children:[Object(h.jsx)("h3",{children:Object(h.jsx)(d.a,{id:"instructions.fill-in.h3",defaultMessage:"Fill-in"})}),Object(h.jsx)("p",{children:Object(h.jsx)(d.a,{id:"instructions.fill-in.p",defaultMessage:"Fill-in each template with the family records. Check here if you have doubts."})})]}),Object(h.jsxs)("div",{className:"instruction-box",children:[Object(h.jsx)("h3",{children:Object(h.jsx)(d.a,{id:"instructions.collect.h3",defaultMessage:"Collect"})}),Object(h.jsx)("p",{children:Object(h.jsx)(d.a,{id:"instructions.collect.p",defaultMessage:"Collect your family file so you can visualize it anywhere. Know no one? Check this."})})]})]})]}),Object(h.jsx)("div",{className:"ui upload-container",children:Object(h.jsxs)("div",{className:"ui dropzone",onClick:()=>{var e;null===(e=j.current)||void 0===e||e.click()},onDrop:e=>{e.preventDefault(),f(e.dataTransfer.files)},onDragOver:e=>e.preventDefault(),children:[Object(h.jsx)("input",{type:"file",multiple:!0,ref:j,onChange:e=>{f(e.target.files)},style:{display:"none"}}),Object(h.jsxs)("p",{children:[Object(h.jsx)(d.a,{id:"dropzone.p.drag-n-drop",defaultMessage:"Drag & drop here your filled assets.templates, or "}),Object(h.jsx)("span",{children:Object(h.jsx)(d.a,{id:"dropzone.p.browse-them",defaultMessage:"browse them"})})]}),Object(h.jsx)("p",{children:Object(h.jsx)(d.a,{id:"dropzone.p.files-needed",defaultMessage:"We need all the 3 files"})}),Object(h.jsxs)(c.a,{children:[Object(h.jsx)(r.a,{name:"upload"}),Object(h.jsx)(d.a,{id:"dropzone.button.browse-files",defaultMessage:"Browse files"})]})]})}),Object(h.jsx)("div",{children:Object(h.jsx)(c.a,{primary:!0,disabled:!0,children:Object(h.jsx)(d.a,{id:"dropzone.button.submit",defaultMessage:"Submit"})})})]})},f=(t(123),t(124),t(90)),x=t(91),m=t(135);const O={es:f,pl:x},g=navigator.language&&navigator.language.split(/[-_]/)[0];a.a.createRoot(document.getElementById("root")).render(Object(h.jsx)(m.a,{locale:g,messages:O[g],children:Object(h.jsx)(v,{})}));var w=s.default=g},56:function(e){e.exports=JSON.parse('{"templates.zip":"plantillas.zip","individuals.csv":"1-individuos.csv","parents.csv":"2-padres.csv","relationships.csv":"3-relaciones.csv"}')},57:function(e){e.exports=JSON.parse('{"templates.zip":"templates.zip"}')},90:function(e){e.exports=JSON.parse('{"header.h1":"Digitalice sus registros geneal\xf3gicos en un fichero familiar","header.p":"Gratuito (y lo ser\xe1 para siempre) hasta 50 familiares. Para m\xe1s de 50 familiares, 0.5\u20ac por pariente","instructions.h2":"Como funciona la herramienta","instructions.download.h3":"Descargar","instructions.download.p":"Descargue las plantillas para rellenar. Necesita: individuos, padres, y relaciones.","instructions.fill-in.h3":"Rellenar","instructions.fill-in.p":"Rellene las plantillas con la informaci\xf3n de los familiares. Consulte aqu\xed si tiene dudas.","instructions.collect.h3":"Recibir","instructions.collect.p":"Recoja su fichero familiar y visual\xedcelo en cualquier visor. \xbfNo conoce uno? Pruebe aqu\xed","instructions.templates.downloaded":"Revise su carpeta de descargas","instructions.templates.compressed":"Encontrar\xe1 las 3 plantillas dentro del archivo comprimido:","dropzone.p.drag-n-drop":"Arrastre aqu\xed las plantillas rellenadas, o ","dropzone.p.browse-them":"explore sus archivos","dropzone.p.files-needed":"Necesitaremos los 3 archivos","dropzone.button.browse-files":"Explorar archivos","dropzone.button.submit":"Enviar"}')},91:function(e){e.exports=JSON.parse('{"instructions.download.h3":"Pobierz"}')}},[[125,1,2]]]);
//# sourceMappingURL=main.d5a76d58.chunk.js.map