import{_ as e,l as s,H as o,m as i,I as g}from"./state.DEgKYUW7.js";import{p}from"./gitGraph-YCYPL57B.CWRbhFUA.js";var v={parse:e(async r=>{const a=await p("info",r);s.debug(a)},"parse")},d={version:g},m=e(()=>d.version,"getVersion"),c={getVersion:m},l=e((r,a,n)=>{s.debug(`rendering info diagram
`+r);const t=o(a);i(t,100,400,!0),t.append("g").append("text").attr("x",100).attr("y",40).attr("class","version").attr("font-size",32).style("text-anchor","middle").text(`v${n}`)},"draw"),f={draw:l},b={parser:v,db:c,renderer:f};export{b as diagram};
