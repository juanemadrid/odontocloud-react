(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(i){if(i.ep)return;i.ep=!0;const s=n(i);fetch(i.href,s)}})();function bC(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var Aw={exports:{}},xu={},Rw={exports:{}},me={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var rl=Symbol.for("react.element"),DC=Symbol.for("react.portal"),OC=Symbol.for("react.fragment"),LC=Symbol.for("react.strict_mode"),VC=Symbol.for("react.profiler"),jC=Symbol.for("react.provider"),MC=Symbol.for("react.context"),FC=Symbol.for("react.forward_ref"),UC=Symbol.for("react.suspense"),$C=Symbol.for("react.memo"),BC=Symbol.for("react.lazy"),cy=Symbol.iterator;function zC(t){return t===null||typeof t!="object"?null:(t=cy&&t[cy]||t["@@iterator"],typeof t=="function"?t:null)}var xw={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Pw=Object.assign,kw={};function Eo(t,e,n){this.props=t,this.context=e,this.refs=kw,this.updater=n||xw}Eo.prototype.isReactComponent={};Eo.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};Eo.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function Nw(){}Nw.prototype=Eo.prototype;function up(t,e,n){this.props=t,this.context=e,this.refs=kw,this.updater=n||xw}var dp=up.prototype=new Nw;dp.constructor=up;Pw(dp,Eo.prototype);dp.isPureReactComponent=!0;var uy=Array.isArray,bw=Object.prototype.hasOwnProperty,hp={current:null},Dw={key:!0,ref:!0,__self:!0,__source:!0};function Ow(t,e,n){var r,i={},s=null,o=null;if(e!=null)for(r in e.ref!==void 0&&(o=e.ref),e.key!==void 0&&(s=""+e.key),e)bw.call(e,r)&&!Dw.hasOwnProperty(r)&&(i[r]=e[r]);var l=arguments.length-2;if(l===1)i.children=n;else if(1<l){for(var c=Array(l),u=0;u<l;u++)c[u]=arguments[u+2];i.children=c}if(t&&t.defaultProps)for(r in l=t.defaultProps,l)i[r]===void 0&&(i[r]=l[r]);return{$$typeof:rl,type:t,key:s,ref:o,props:i,_owner:hp.current}}function qC(t,e){return{$$typeof:rl,type:t.type,key:e,ref:t.ref,props:t.props,_owner:t._owner}}function fp(t){return typeof t=="object"&&t!==null&&t.$$typeof===rl}function HC(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var dy=/\/+/g;function $d(t,e){return typeof t=="object"&&t!==null&&t.key!=null?HC(""+t.key):e.toString(36)}function cc(t,e,n,r,i){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var o=!1;if(t===null)o=!0;else switch(s){case"string":case"number":o=!0;break;case"object":switch(t.$$typeof){case rl:case DC:o=!0}}if(o)return o=t,i=i(o),t=r===""?"."+$d(o,0):r,uy(i)?(n="",t!=null&&(n=t.replace(dy,"$&/")+"/"),cc(i,e,n,"",function(u){return u})):i!=null&&(fp(i)&&(i=qC(i,n+(!i.key||o&&o.key===i.key?"":(""+i.key).replace(dy,"$&/")+"/")+t)),e.push(i)),1;if(o=0,r=r===""?".":r+":",uy(t))for(var l=0;l<t.length;l++){s=t[l];var c=r+$d(s,l);o+=cc(s,e,n,c,i)}else if(c=zC(t),typeof c=="function")for(t=c.call(t),l=0;!(s=t.next()).done;)s=s.value,c=r+$d(s,l++),o+=cc(s,e,n,c,i);else if(s==="object")throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.");return o}function Ll(t,e,n){if(t==null)return t;var r=[],i=0;return cc(t,r,"","",function(s){return e.call(n,s,i++)}),r}function WC(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var Ht={current:null},uc={transition:null},GC={ReactCurrentDispatcher:Ht,ReactCurrentBatchConfig:uc,ReactCurrentOwner:hp};function Lw(){throw Error("act(...) is not supported in production builds of React.")}me.Children={map:Ll,forEach:function(t,e,n){Ll(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return Ll(t,function(){e++}),e},toArray:function(t){return Ll(t,function(e){return e})||[]},only:function(t){if(!fp(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};me.Component=Eo;me.Fragment=OC;me.Profiler=VC;me.PureComponent=up;me.StrictMode=LC;me.Suspense=UC;me.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=GC;me.act=Lw;me.cloneElement=function(t,e,n){if(t==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+t+".");var r=Pw({},t.props),i=t.key,s=t.ref,o=t._owner;if(e!=null){if(e.ref!==void 0&&(s=e.ref,o=hp.current),e.key!==void 0&&(i=""+e.key),t.type&&t.type.defaultProps)var l=t.type.defaultProps;for(c in e)bw.call(e,c)&&!Dw.hasOwnProperty(c)&&(r[c]=e[c]===void 0&&l!==void 0?l[c]:e[c])}var c=arguments.length-2;if(c===1)r.children=n;else if(1<c){l=Array(c);for(var u=0;u<c;u++)l[u]=arguments[u+2];r.children=l}return{$$typeof:rl,type:t.type,key:i,ref:s,props:r,_owner:o}};me.createContext=function(t){return t={$$typeof:MC,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},t.Provider={$$typeof:jC,_context:t},t.Consumer=t};me.createElement=Ow;me.createFactory=function(t){var e=Ow.bind(null,t);return e.type=t,e};me.createRef=function(){return{current:null}};me.forwardRef=function(t){return{$$typeof:FC,render:t}};me.isValidElement=fp;me.lazy=function(t){return{$$typeof:BC,_payload:{_status:-1,_result:t},_init:WC}};me.memo=function(t,e){return{$$typeof:$C,type:t,compare:e===void 0?null:e}};me.startTransition=function(t){var e=uc.transition;uc.transition={};try{t()}finally{uc.transition=e}};me.unstable_act=Lw;me.useCallback=function(t,e){return Ht.current.useCallback(t,e)};me.useContext=function(t){return Ht.current.useContext(t)};me.useDebugValue=function(){};me.useDeferredValue=function(t){return Ht.current.useDeferredValue(t)};me.useEffect=function(t,e){return Ht.current.useEffect(t,e)};me.useId=function(){return Ht.current.useId()};me.useImperativeHandle=function(t,e,n){return Ht.current.useImperativeHandle(t,e,n)};me.useInsertionEffect=function(t,e){return Ht.current.useInsertionEffect(t,e)};me.useLayoutEffect=function(t,e){return Ht.current.useLayoutEffect(t,e)};me.useMemo=function(t,e){return Ht.current.useMemo(t,e)};me.useReducer=function(t,e,n){return Ht.current.useReducer(t,e,n)};me.useRef=function(t){return Ht.current.useRef(t)};me.useState=function(t){return Ht.current.useState(t)};me.useSyncExternalStore=function(t,e,n){return Ht.current.useSyncExternalStore(t,e,n)};me.useTransition=function(){return Ht.current.useTransition()};me.version="18.3.1";Rw.exports=me;var D=Rw.exports;const KC=bC(D);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var QC=D,YC=Symbol.for("react.element"),XC=Symbol.for("react.fragment"),JC=Object.prototype.hasOwnProperty,ZC=QC.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,eA={key:!0,ref:!0,__self:!0,__source:!0};function Vw(t,e,n){var r,i={},s=null,o=null;n!==void 0&&(s=""+n),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(o=e.ref);for(r in e)JC.call(e,r)&&!eA.hasOwnProperty(r)&&(i[r]=e[r]);if(t&&t.defaultProps)for(r in e=t.defaultProps,e)i[r]===void 0&&(i[r]=e[r]);return{$$typeof:YC,type:t,key:s,ref:o,props:i,_owner:ZC.current}}xu.Fragment=XC;xu.jsx=Vw;xu.jsxs=Vw;Aw.exports=xu;var d=Aw.exports,jw={exports:{}},mn={},Mw={exports:{}},Fw={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(t){function e(Y,se){var oe=Y.length;Y.push(se);e:for(;0<oe;){var ke=oe-1>>>1,Ne=Y[ke];if(0<i(Ne,se))Y[ke]=se,Y[oe]=Ne,oe=ke;else break e}}function n(Y){return Y.length===0?null:Y[0]}function r(Y){if(Y.length===0)return null;var se=Y[0],oe=Y.pop();if(oe!==se){Y[0]=oe;e:for(var ke=0,Ne=Y.length,F=Ne>>>1;ke<F;){var H=2*(ke+1)-1,z=Y[H],Q=H+1,J=Y[Q];if(0>i(z,oe))Q<Ne&&0>i(J,z)?(Y[ke]=J,Y[Q]=oe,ke=Q):(Y[ke]=z,Y[H]=oe,ke=H);else if(Q<Ne&&0>i(J,oe))Y[ke]=J,Y[Q]=oe,ke=Q;else break e}}return se}function i(Y,se){var oe=Y.sortIndex-se.sortIndex;return oe!==0?oe:Y.id-se.id}if(typeof performance=="object"&&typeof performance.now=="function"){var s=performance;t.unstable_now=function(){return s.now()}}else{var o=Date,l=o.now();t.unstable_now=function(){return o.now()-l}}var c=[],u=[],f=1,p=null,g=3,S=!1,v=!1,N=!1,b=typeof setTimeout=="function"?setTimeout:null,I=typeof clearTimeout=="function"?clearTimeout:null,E=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function y(Y){for(var se=n(u);se!==null;){if(se.callback===null)r(u);else if(se.startTime<=Y)r(u),se.sortIndex=se.expirationTime,e(c,se);else break;se=n(u)}}function L(Y){if(N=!1,y(Y),!v)if(n(c)!==null)v=!0,yn($);else{var se=n(u);se!==null&&Nn(L,se.startTime-Y)}}function $(Y,se){v=!1,N&&(N=!1,I(T),T=-1),S=!0;var oe=g;try{for(y(se),p=n(c);p!==null&&(!(p.expirationTime>se)||Y&&!P());){var ke=p.callback;if(typeof ke=="function"){p.callback=null,g=p.priorityLevel;var Ne=ke(p.expirationTime<=se);se=t.unstable_now(),typeof Ne=="function"?p.callback=Ne:p===n(c)&&r(c),y(se)}else r(c);p=n(c)}if(p!==null)var F=!0;else{var H=n(u);H!==null&&Nn(L,H.startTime-se),F=!1}return F}finally{p=null,g=oe,S=!1}}var B=!1,C=null,T=-1,A=5,x=-1;function P(){return!(t.unstable_now()-x<A)}function k(){if(C!==null){var Y=t.unstable_now();x=Y;var se=!0;try{se=C(!0,Y)}finally{se?R():(B=!1,C=null)}}else B=!1}var R;if(typeof E=="function")R=function(){E(k)};else if(typeof MessageChannel<"u"){var $e=new MessageChannel,Et=$e.port2;$e.port1.onmessage=k,R=function(){Et.postMessage(null)}}else R=function(){b(k,0)};function yn(Y){C=Y,B||(B=!0,R())}function Nn(Y,se){T=b(function(){Y(t.unstable_now())},se)}t.unstable_IdlePriority=5,t.unstable_ImmediatePriority=1,t.unstable_LowPriority=4,t.unstable_NormalPriority=3,t.unstable_Profiling=null,t.unstable_UserBlockingPriority=2,t.unstable_cancelCallback=function(Y){Y.callback=null},t.unstable_continueExecution=function(){v||S||(v=!0,yn($))},t.unstable_forceFrameRate=function(Y){0>Y||125<Y?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):A=0<Y?Math.floor(1e3/Y):5},t.unstable_getCurrentPriorityLevel=function(){return g},t.unstable_getFirstCallbackNode=function(){return n(c)},t.unstable_next=function(Y){switch(g){case 1:case 2:case 3:var se=3;break;default:se=g}var oe=g;g=se;try{return Y()}finally{g=oe}},t.unstable_pauseExecution=function(){},t.unstable_requestPaint=function(){},t.unstable_runWithPriority=function(Y,se){switch(Y){case 1:case 2:case 3:case 4:case 5:break;default:Y=3}var oe=g;g=Y;try{return se()}finally{g=oe}},t.unstable_scheduleCallback=function(Y,se,oe){var ke=t.unstable_now();switch(typeof oe=="object"&&oe!==null?(oe=oe.delay,oe=typeof oe=="number"&&0<oe?ke+oe:ke):oe=ke,Y){case 1:var Ne=-1;break;case 2:Ne=250;break;case 5:Ne=1073741823;break;case 4:Ne=1e4;break;default:Ne=5e3}return Ne=oe+Ne,Y={id:f++,callback:se,priorityLevel:Y,startTime:oe,expirationTime:Ne,sortIndex:-1},oe>ke?(Y.sortIndex=oe,e(u,Y),n(c)===null&&Y===n(u)&&(N?(I(T),T=-1):N=!0,Nn(L,oe-ke))):(Y.sortIndex=Ne,e(c,Y),v||S||(v=!0,yn($))),Y},t.unstable_shouldYield=P,t.unstable_wrapCallback=function(Y){var se=g;return function(){var oe=g;g=se;try{return Y.apply(this,arguments)}finally{g=oe}}}})(Fw);Mw.exports=Fw;var tA=Mw.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var nA=D,fn=tA;function q(t){for(var e="https://reactjs.org/docs/error-decoder.html?invariant="+t,n=1;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var Uw=new Set,Pa={};function ps(t,e){io(t,e),io(t+"Capture",e)}function io(t,e){for(Pa[t]=e,t=0;t<e.length;t++)Uw.add(e[t])}var Sr=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Fh=Object.prototype.hasOwnProperty,rA=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,hy={},fy={};function iA(t){return Fh.call(fy,t)?!0:Fh.call(hy,t)?!1:rA.test(t)?fy[t]=!0:(hy[t]=!0,!1)}function sA(t,e,n,r){if(n!==null&&n.type===0)return!1;switch(typeof e){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(t=t.toLowerCase().slice(0,5),t!=="data-"&&t!=="aria-");default:return!1}}function oA(t,e,n,r){if(e===null||typeof e>"u"||sA(t,e,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!e;case 4:return e===!1;case 5:return isNaN(e);case 6:return isNaN(e)||1>e}return!1}function Wt(t,e,n,r,i,s,o){this.acceptsBooleans=e===2||e===3||e===4,this.attributeName=r,this.attributeNamespace=i,this.mustUseProperty=n,this.propertyName=t,this.type=e,this.sanitizeURL=s,this.removeEmptyString=o}var At={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t){At[t]=new Wt(t,0,!1,t,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(t){var e=t[0];At[e]=new Wt(e,1,!1,t[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(t){At[t]=new Wt(t,2,!1,t.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(t){At[t]=new Wt(t,2,!1,t,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t){At[t]=new Wt(t,3,!1,t.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(t){At[t]=new Wt(t,3,!0,t,null,!1,!1)});["capture","download"].forEach(function(t){At[t]=new Wt(t,4,!1,t,null,!1,!1)});["cols","rows","size","span"].forEach(function(t){At[t]=new Wt(t,6,!1,t,null,!1,!1)});["rowSpan","start"].forEach(function(t){At[t]=new Wt(t,5,!1,t.toLowerCase(),null,!1,!1)});var pp=/[\-:]([a-z])/g;function mp(t){return t[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t){var e=t.replace(pp,mp);At[e]=new Wt(e,1,!1,t,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t){var e=t.replace(pp,mp);At[e]=new Wt(e,1,!1,t,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(t){var e=t.replace(pp,mp);At[e]=new Wt(e,1,!1,t,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(t){At[t]=new Wt(t,1,!1,t.toLowerCase(),null,!1,!1)});At.xlinkHref=new Wt("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(t){At[t]=new Wt(t,1,!1,t.toLowerCase(),null,!0,!0)});function gp(t,e,n,r){var i=At.hasOwnProperty(e)?At[e]:null;(i!==null?i.type!==0:r||!(2<e.length)||e[0]!=="o"&&e[0]!=="O"||e[1]!=="n"&&e[1]!=="N")&&(oA(e,n,i,r)&&(n=null),r||i===null?iA(e)&&(n===null?t.removeAttribute(e):t.setAttribute(e,""+n)):i.mustUseProperty?t[i.propertyName]=n===null?i.type===3?!1:"":n:(e=i.attributeName,r=i.attributeNamespace,n===null?t.removeAttribute(e):(i=i.type,n=i===3||i===4&&n===!0?"":""+n,r?t.setAttributeNS(r,e,n):t.setAttribute(e,n))))}var Or=nA.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,Vl=Symbol.for("react.element"),bs=Symbol.for("react.portal"),Ds=Symbol.for("react.fragment"),yp=Symbol.for("react.strict_mode"),Uh=Symbol.for("react.profiler"),$w=Symbol.for("react.provider"),Bw=Symbol.for("react.context"),vp=Symbol.for("react.forward_ref"),$h=Symbol.for("react.suspense"),Bh=Symbol.for("react.suspense_list"),_p=Symbol.for("react.memo"),Wr=Symbol.for("react.lazy"),zw=Symbol.for("react.offscreen"),py=Symbol.iterator;function Ho(t){return t===null||typeof t!="object"?null:(t=py&&t[py]||t["@@iterator"],typeof t=="function"?t:null)}var Xe=Object.assign,Bd;function na(t){if(Bd===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);Bd=e&&e[1]||""}return`
`+Bd+t}var zd=!1;function qd(t,e){if(!t||zd)return"";zd=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(e)if(e=function(){throw Error()},Object.defineProperty(e.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(e,[])}catch(u){var r=u}Reflect.construct(t,[],e)}else{try{e.call()}catch(u){r=u}t.call(e.prototype)}else{try{throw Error()}catch(u){r=u}t()}}catch(u){if(u&&r&&typeof u.stack=="string"){for(var i=u.stack.split(`
`),s=r.stack.split(`
`),o=i.length-1,l=s.length-1;1<=o&&0<=l&&i[o]!==s[l];)l--;for(;1<=o&&0<=l;o--,l--)if(i[o]!==s[l]){if(o!==1||l!==1)do if(o--,l--,0>l||i[o]!==s[l]){var c=`
`+i[o].replace(" at new "," at ");return t.displayName&&c.includes("<anonymous>")&&(c=c.replace("<anonymous>",t.displayName)),c}while(1<=o&&0<=l);break}}}finally{zd=!1,Error.prepareStackTrace=n}return(t=t?t.displayName||t.name:"")?na(t):""}function aA(t){switch(t.tag){case 5:return na(t.type);case 16:return na("Lazy");case 13:return na("Suspense");case 19:return na("SuspenseList");case 0:case 2:case 15:return t=qd(t.type,!1),t;case 11:return t=qd(t.type.render,!1),t;case 1:return t=qd(t.type,!0),t;default:return""}}function zh(t){if(t==null)return null;if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case Ds:return"Fragment";case bs:return"Portal";case Uh:return"Profiler";case yp:return"StrictMode";case $h:return"Suspense";case Bh:return"SuspenseList"}if(typeof t=="object")switch(t.$$typeof){case Bw:return(t.displayName||"Context")+".Consumer";case $w:return(t._context.displayName||"Context")+".Provider";case vp:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case _p:return e=t.displayName||null,e!==null?e:zh(t.type)||"Memo";case Wr:e=t._payload,t=t._init;try{return zh(t(e))}catch{}}return null}function lA(t){var e=t.type;switch(t.tag){case 24:return"Cache";case 9:return(e.displayName||"Context")+".Consumer";case 10:return(e._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return t=e.render,t=t.displayName||t.name||"",e.displayName||(t!==""?"ForwardRef("+t+")":"ForwardRef");case 7:return"Fragment";case 5:return e;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return zh(e);case 8:return e===yp?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e}return null}function _i(t){switch(typeof t){case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function qw(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function cA(t){var e=qw(t)?"checked":"value",n=Object.getOwnPropertyDescriptor(t.constructor.prototype,e),r=""+t[e];if(!t.hasOwnProperty(e)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var i=n.get,s=n.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return i.call(this)},set:function(o){r=""+o,s.call(this,o)}}),Object.defineProperty(t,e,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(o){r=""+o},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function jl(t){t._valueTracker||(t._valueTracker=cA(t))}function Hw(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),r="";return t&&(r=qw(t)?t.checked?"true":"false":t.value),t=r,t!==n?(e.setValue(t),!0):!1}function Dc(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}function qh(t,e){var n=e.checked;return Xe({},e,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??t._wrapperState.initialChecked})}function my(t,e){var n=e.defaultValue==null?"":e.defaultValue,r=e.checked!=null?e.checked:e.defaultChecked;n=_i(e.value!=null?e.value:n),t._wrapperState={initialChecked:r,initialValue:n,controlled:e.type==="checkbox"||e.type==="radio"?e.checked!=null:e.value!=null}}function Ww(t,e){e=e.checked,e!=null&&gp(t,"checked",e,!1)}function Hh(t,e){Ww(t,e);var n=_i(e.value),r=e.type;if(n!=null)r==="number"?(n===0&&t.value===""||t.value!=n)&&(t.value=""+n):t.value!==""+n&&(t.value=""+n);else if(r==="submit"||r==="reset"){t.removeAttribute("value");return}e.hasOwnProperty("value")?Wh(t,e.type,n):e.hasOwnProperty("defaultValue")&&Wh(t,e.type,_i(e.defaultValue)),e.checked==null&&e.defaultChecked!=null&&(t.defaultChecked=!!e.defaultChecked)}function gy(t,e,n){if(e.hasOwnProperty("value")||e.hasOwnProperty("defaultValue")){var r=e.type;if(!(r!=="submit"&&r!=="reset"||e.value!==void 0&&e.value!==null))return;e=""+t._wrapperState.initialValue,n||e===t.value||(t.value=e),t.defaultValue=e}n=t.name,n!==""&&(t.name=""),t.defaultChecked=!!t._wrapperState.initialChecked,n!==""&&(t.name=n)}function Wh(t,e,n){(e!=="number"||Dc(t.ownerDocument)!==t)&&(n==null?t.defaultValue=""+t._wrapperState.initialValue:t.defaultValue!==""+n&&(t.defaultValue=""+n))}var ra=Array.isArray;function Hs(t,e,n,r){if(t=t.options,e){e={};for(var i=0;i<n.length;i++)e["$"+n[i]]=!0;for(n=0;n<t.length;n++)i=e.hasOwnProperty("$"+t[n].value),t[n].selected!==i&&(t[n].selected=i),i&&r&&(t[n].defaultSelected=!0)}else{for(n=""+_i(n),e=null,i=0;i<t.length;i++){if(t[i].value===n){t[i].selected=!0,r&&(t[i].defaultSelected=!0);return}e!==null||t[i].disabled||(e=t[i])}e!==null&&(e.selected=!0)}}function Gh(t,e){if(e.dangerouslySetInnerHTML!=null)throw Error(q(91));return Xe({},e,{value:void 0,defaultValue:void 0,children:""+t._wrapperState.initialValue})}function yy(t,e){var n=e.value;if(n==null){if(n=e.children,e=e.defaultValue,n!=null){if(e!=null)throw Error(q(92));if(ra(n)){if(1<n.length)throw Error(q(93));n=n[0]}e=n}e==null&&(e=""),n=e}t._wrapperState={initialValue:_i(n)}}function Gw(t,e){var n=_i(e.value),r=_i(e.defaultValue);n!=null&&(n=""+n,n!==t.value&&(t.value=n),e.defaultValue==null&&t.defaultValue!==n&&(t.defaultValue=n)),r!=null&&(t.defaultValue=""+r)}function vy(t){var e=t.textContent;e===t._wrapperState.initialValue&&e!==""&&e!==null&&(t.value=e)}function Kw(t){switch(t){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Kh(t,e){return t==null||t==="http://www.w3.org/1999/xhtml"?Kw(e):t==="http://www.w3.org/2000/svg"&&e==="foreignObject"?"http://www.w3.org/1999/xhtml":t}var Ml,Qw=function(t){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(e,n,r,i){MSApp.execUnsafeLocalFunction(function(){return t(e,n,r,i)})}:t}(function(t,e){if(t.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in t)t.innerHTML=e;else{for(Ml=Ml||document.createElement("div"),Ml.innerHTML="<svg>"+e.valueOf().toString()+"</svg>",e=Ml.firstChild;t.firstChild;)t.removeChild(t.firstChild);for(;e.firstChild;)t.appendChild(e.firstChild)}});function ka(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var fa={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},uA=["Webkit","ms","Moz","O"];Object.keys(fa).forEach(function(t){uA.forEach(function(e){e=e+t.charAt(0).toUpperCase()+t.substring(1),fa[e]=fa[t]})});function Yw(t,e,n){return e==null||typeof e=="boolean"||e===""?"":n||typeof e!="number"||e===0||fa.hasOwnProperty(t)&&fa[t]?(""+e).trim():e+"px"}function Xw(t,e){t=t.style;for(var n in e)if(e.hasOwnProperty(n)){var r=n.indexOf("--")===0,i=Yw(n,e[n],r);n==="float"&&(n="cssFloat"),r?t.setProperty(n,i):t[n]=i}}var dA=Xe({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Qh(t,e){if(e){if(dA[t]&&(e.children!=null||e.dangerouslySetInnerHTML!=null))throw Error(q(137,t));if(e.dangerouslySetInnerHTML!=null){if(e.children!=null)throw Error(q(60));if(typeof e.dangerouslySetInnerHTML!="object"||!("__html"in e.dangerouslySetInnerHTML))throw Error(q(61))}if(e.style!=null&&typeof e.style!="object")throw Error(q(62))}}function Yh(t,e){if(t.indexOf("-")===-1)return typeof e.is=="string";switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Xh=null;function wp(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var Jh=null,Ws=null,Gs=null;function _y(t){if(t=ol(t)){if(typeof Jh!="function")throw Error(q(280));var e=t.stateNode;e&&(e=Du(e),Jh(t.stateNode,t.type,e))}}function Jw(t){Ws?Gs?Gs.push(t):Gs=[t]:Ws=t}function Zw(){if(Ws){var t=Ws,e=Gs;if(Gs=Ws=null,_y(t),e)for(t=0;t<e.length;t++)_y(e[t])}}function eE(t,e){return t(e)}function tE(){}var Hd=!1;function nE(t,e,n){if(Hd)return t(e,n);Hd=!0;try{return eE(t,e,n)}finally{Hd=!1,(Ws!==null||Gs!==null)&&(tE(),Zw())}}function Na(t,e){var n=t.stateNode;if(n===null)return null;var r=Du(n);if(r===null)return null;n=r[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(t=t.type,r=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!r;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(q(231,e,typeof n));return n}var Zh=!1;if(Sr)try{var Wo={};Object.defineProperty(Wo,"passive",{get:function(){Zh=!0}}),window.addEventListener("test",Wo,Wo),window.removeEventListener("test",Wo,Wo)}catch{Zh=!1}function hA(t,e,n,r,i,s,o,l,c){var u=Array.prototype.slice.call(arguments,3);try{e.apply(n,u)}catch(f){this.onError(f)}}var pa=!1,Oc=null,Lc=!1,ef=null,fA={onError:function(t){pa=!0,Oc=t}};function pA(t,e,n,r,i,s,o,l,c){pa=!1,Oc=null,hA.apply(fA,arguments)}function mA(t,e,n,r,i,s,o,l,c){if(pA.apply(this,arguments),pa){if(pa){var u=Oc;pa=!1,Oc=null}else throw Error(q(198));Lc||(Lc=!0,ef=u)}}function ms(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function rE(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function wy(t){if(ms(t)!==t)throw Error(q(188))}function gA(t){var e=t.alternate;if(!e){if(e=ms(t),e===null)throw Error(q(188));return e!==t?null:t}for(var n=t,r=e;;){var i=n.return;if(i===null)break;var s=i.alternate;if(s===null){if(r=i.return,r!==null){n=r;continue}break}if(i.child===s.child){for(s=i.child;s;){if(s===n)return wy(i),t;if(s===r)return wy(i),e;s=s.sibling}throw Error(q(188))}if(n.return!==r.return)n=i,r=s;else{for(var o=!1,l=i.child;l;){if(l===n){o=!0,n=i,r=s;break}if(l===r){o=!0,r=i,n=s;break}l=l.sibling}if(!o){for(l=s.child;l;){if(l===n){o=!0,n=s,r=i;break}if(l===r){o=!0,r=s,n=i;break}l=l.sibling}if(!o)throw Error(q(189))}}if(n.alternate!==r)throw Error(q(190))}if(n.tag!==3)throw Error(q(188));return n.stateNode.current===n?t:e}function iE(t){return t=gA(t),t!==null?sE(t):null}function sE(t){if(t.tag===5||t.tag===6)return t;for(t=t.child;t!==null;){var e=sE(t);if(e!==null)return e;t=t.sibling}return null}var oE=fn.unstable_scheduleCallback,Ey=fn.unstable_cancelCallback,yA=fn.unstable_shouldYield,vA=fn.unstable_requestPaint,ot=fn.unstable_now,_A=fn.unstable_getCurrentPriorityLevel,Ep=fn.unstable_ImmediatePriority,aE=fn.unstable_UserBlockingPriority,Vc=fn.unstable_NormalPriority,wA=fn.unstable_LowPriority,lE=fn.unstable_IdlePriority,Pu=null,tr=null;function EA(t){if(tr&&typeof tr.onCommitFiberRoot=="function")try{tr.onCommitFiberRoot(Pu,t,void 0,(t.current.flags&128)===128)}catch{}}var jn=Math.clz32?Math.clz32:SA,TA=Math.log,IA=Math.LN2;function SA(t){return t>>>=0,t===0?32:31-(TA(t)/IA|0)|0}var Fl=64,Ul=4194304;function ia(t){switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return t&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return t}}function jc(t,e){var n=t.pendingLanes;if(n===0)return 0;var r=0,i=t.suspendedLanes,s=t.pingedLanes,o=n&268435455;if(o!==0){var l=o&~i;l!==0?r=ia(l):(s&=o,s!==0&&(r=ia(s)))}else o=n&~i,o!==0?r=ia(o):s!==0&&(r=ia(s));if(r===0)return 0;if(e!==0&&e!==r&&!(e&i)&&(i=r&-r,s=e&-e,i>=s||i===16&&(s&4194240)!==0))return e;if(r&4&&(r|=n&16),e=t.entangledLanes,e!==0)for(t=t.entanglements,e&=r;0<e;)n=31-jn(e),i=1<<n,r|=t[n],e&=~i;return r}function CA(t,e){switch(t){case 1:case 2:case 4:return e+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function AA(t,e){for(var n=t.suspendedLanes,r=t.pingedLanes,i=t.expirationTimes,s=t.pendingLanes;0<s;){var o=31-jn(s),l=1<<o,c=i[o];c===-1?(!(l&n)||l&r)&&(i[o]=CA(l,e)):c<=e&&(t.expiredLanes|=l),s&=~l}}function tf(t){return t=t.pendingLanes&-1073741825,t!==0?t:t&1073741824?1073741824:0}function cE(){var t=Fl;return Fl<<=1,!(Fl&4194240)&&(Fl=64),t}function Wd(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function il(t,e,n){t.pendingLanes|=e,e!==536870912&&(t.suspendedLanes=0,t.pingedLanes=0),t=t.eventTimes,e=31-jn(e),t[e]=n}function RA(t,e){var n=t.pendingLanes&~e;t.pendingLanes=e,t.suspendedLanes=0,t.pingedLanes=0,t.expiredLanes&=e,t.mutableReadLanes&=e,t.entangledLanes&=e,e=t.entanglements;var r=t.eventTimes;for(t=t.expirationTimes;0<n;){var i=31-jn(n),s=1<<i;e[i]=0,r[i]=-1,t[i]=-1,n&=~s}}function Tp(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var r=31-jn(n),i=1<<r;i&e|t[r]&e&&(t[r]|=e),n&=~i}}var Le=0;function uE(t){return t&=-t,1<t?4<t?t&268435455?16:536870912:4:1}var dE,Ip,hE,fE,pE,nf=!1,$l=[],oi=null,ai=null,li=null,ba=new Map,Da=new Map,Kr=[],xA="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Ty(t,e){switch(t){case"focusin":case"focusout":oi=null;break;case"dragenter":case"dragleave":ai=null;break;case"mouseover":case"mouseout":li=null;break;case"pointerover":case"pointerout":ba.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":Da.delete(e.pointerId)}}function Go(t,e,n,r,i,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:r,nativeEvent:s,targetContainers:[i]},e!==null&&(e=ol(e),e!==null&&Ip(e)),t):(t.eventSystemFlags|=r,e=t.targetContainers,i!==null&&e.indexOf(i)===-1&&e.push(i),t)}function PA(t,e,n,r,i){switch(e){case"focusin":return oi=Go(oi,t,e,n,r,i),!0;case"dragenter":return ai=Go(ai,t,e,n,r,i),!0;case"mouseover":return li=Go(li,t,e,n,r,i),!0;case"pointerover":var s=i.pointerId;return ba.set(s,Go(ba.get(s)||null,t,e,n,r,i)),!0;case"gotpointercapture":return s=i.pointerId,Da.set(s,Go(Da.get(s)||null,t,e,n,r,i)),!0}return!1}function mE(t){var e=Gi(t.target);if(e!==null){var n=ms(e);if(n!==null){if(e=n.tag,e===13){if(e=rE(n),e!==null){t.blockedOn=e,pE(t.priority,function(){hE(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function dc(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=rf(t.domEventName,t.eventSystemFlags,e[0],t.nativeEvent);if(n===null){n=t.nativeEvent;var r=new n.constructor(n.type,n);Xh=r,n.target.dispatchEvent(r),Xh=null}else return e=ol(n),e!==null&&Ip(e),t.blockedOn=n,!1;e.shift()}return!0}function Iy(t,e,n){dc(t)&&n.delete(e)}function kA(){nf=!1,oi!==null&&dc(oi)&&(oi=null),ai!==null&&dc(ai)&&(ai=null),li!==null&&dc(li)&&(li=null),ba.forEach(Iy),Da.forEach(Iy)}function Ko(t,e){t.blockedOn===e&&(t.blockedOn=null,nf||(nf=!0,fn.unstable_scheduleCallback(fn.unstable_NormalPriority,kA)))}function Oa(t){function e(i){return Ko(i,t)}if(0<$l.length){Ko($l[0],t);for(var n=1;n<$l.length;n++){var r=$l[n];r.blockedOn===t&&(r.blockedOn=null)}}for(oi!==null&&Ko(oi,t),ai!==null&&Ko(ai,t),li!==null&&Ko(li,t),ba.forEach(e),Da.forEach(e),n=0;n<Kr.length;n++)r=Kr[n],r.blockedOn===t&&(r.blockedOn=null);for(;0<Kr.length&&(n=Kr[0],n.blockedOn===null);)mE(n),n.blockedOn===null&&Kr.shift()}var Ks=Or.ReactCurrentBatchConfig,Mc=!0;function NA(t,e,n,r){var i=Le,s=Ks.transition;Ks.transition=null;try{Le=1,Sp(t,e,n,r)}finally{Le=i,Ks.transition=s}}function bA(t,e,n,r){var i=Le,s=Ks.transition;Ks.transition=null;try{Le=4,Sp(t,e,n,r)}finally{Le=i,Ks.transition=s}}function Sp(t,e,n,r){if(Mc){var i=rf(t,e,n,r);if(i===null)nh(t,e,r,Fc,n),Ty(t,r);else if(PA(i,t,e,n,r))r.stopPropagation();else if(Ty(t,r),e&4&&-1<xA.indexOf(t)){for(;i!==null;){var s=ol(i);if(s!==null&&dE(s),s=rf(t,e,n,r),s===null&&nh(t,e,r,Fc,n),s===i)break;i=s}i!==null&&r.stopPropagation()}else nh(t,e,r,null,n)}}var Fc=null;function rf(t,e,n,r){if(Fc=null,t=wp(r),t=Gi(t),t!==null)if(e=ms(t),e===null)t=null;else if(n=e.tag,n===13){if(t=rE(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null);return Fc=t,null}function gE(t){switch(t){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(_A()){case Ep:return 1;case aE:return 4;case Vc:case wA:return 16;case lE:return 536870912;default:return 16}default:return 16}}var ni=null,Cp=null,hc=null;function yE(){if(hc)return hc;var t,e=Cp,n=e.length,r,i="value"in ni?ni.value:ni.textContent,s=i.length;for(t=0;t<n&&e[t]===i[t];t++);var o=n-t;for(r=1;r<=o&&e[n-r]===i[s-r];r++);return hc=i.slice(t,1<r?1-r:void 0)}function fc(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Bl(){return!0}function Sy(){return!1}function gn(t){function e(n,r,i,s,o){this._reactName=n,this._targetInst=i,this.type=r,this.nativeEvent=s,this.target=o,this.currentTarget=null;for(var l in t)t.hasOwnProperty(l)&&(n=t[l],this[l]=n?n(s):s[l]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?Bl:Sy,this.isPropagationStopped=Sy,this}return Xe(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Bl)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Bl)},persist:function(){},isPersistent:Bl}),e}var To={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Ap=gn(To),sl=Xe({},To,{view:0,detail:0}),DA=gn(sl),Gd,Kd,Qo,ku=Xe({},sl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Rp,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==Qo&&(Qo&&t.type==="mousemove"?(Gd=t.screenX-Qo.screenX,Kd=t.screenY-Qo.screenY):Kd=Gd=0,Qo=t),Gd)},movementY:function(t){return"movementY"in t?t.movementY:Kd}}),Cy=gn(ku),OA=Xe({},ku,{dataTransfer:0}),LA=gn(OA),VA=Xe({},sl,{relatedTarget:0}),Qd=gn(VA),jA=Xe({},To,{animationName:0,elapsedTime:0,pseudoElement:0}),MA=gn(jA),FA=Xe({},To,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),UA=gn(FA),$A=Xe({},To,{data:0}),Ay=gn($A),BA={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},zA={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},qA={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function HA(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=qA[t])?!!e[t]:!1}function Rp(){return HA}var WA=Xe({},sl,{key:function(t){if(t.key){var e=BA[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=fc(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?zA[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Rp,charCode:function(t){return t.type==="keypress"?fc(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?fc(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),GA=gn(WA),KA=Xe({},ku,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Ry=gn(KA),QA=Xe({},sl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Rp}),YA=gn(QA),XA=Xe({},To,{propertyName:0,elapsedTime:0,pseudoElement:0}),JA=gn(XA),ZA=Xe({},ku,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),eR=gn(ZA),tR=[9,13,27,32],xp=Sr&&"CompositionEvent"in window,ma=null;Sr&&"documentMode"in document&&(ma=document.documentMode);var nR=Sr&&"TextEvent"in window&&!ma,vE=Sr&&(!xp||ma&&8<ma&&11>=ma),xy=" ",Py=!1;function _E(t,e){switch(t){case"keyup":return tR.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function wE(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var Os=!1;function rR(t,e){switch(t){case"compositionend":return wE(e);case"keypress":return e.which!==32?null:(Py=!0,xy);case"textInput":return t=e.data,t===xy&&Py?null:t;default:return null}}function iR(t,e){if(Os)return t==="compositionend"||!xp&&_E(t,e)?(t=yE(),hc=Cp=ni=null,Os=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return vE&&e.locale!=="ko"?null:e.data;default:return null}}var sR={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function ky(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!sR[t.type]:e==="textarea"}function EE(t,e,n,r){Jw(r),e=Uc(e,"onChange"),0<e.length&&(n=new Ap("onChange","change",null,n,r),t.push({event:n,listeners:e}))}var ga=null,La=null;function oR(t){bE(t,0)}function Nu(t){var e=js(t);if(Hw(e))return t}function aR(t,e){if(t==="change")return e}var TE=!1;if(Sr){var Yd;if(Sr){var Xd="oninput"in document;if(!Xd){var Ny=document.createElement("div");Ny.setAttribute("oninput","return;"),Xd=typeof Ny.oninput=="function"}Yd=Xd}else Yd=!1;TE=Yd&&(!document.documentMode||9<document.documentMode)}function by(){ga&&(ga.detachEvent("onpropertychange",IE),La=ga=null)}function IE(t){if(t.propertyName==="value"&&Nu(La)){var e=[];EE(e,La,t,wp(t)),nE(oR,e)}}function lR(t,e,n){t==="focusin"?(by(),ga=e,La=n,ga.attachEvent("onpropertychange",IE)):t==="focusout"&&by()}function cR(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return Nu(La)}function uR(t,e){if(t==="click")return Nu(e)}function dR(t,e){if(t==="input"||t==="change")return Nu(e)}function hR(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var Fn=typeof Object.is=="function"?Object.is:hR;function Va(t,e){if(Fn(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),r=Object.keys(e);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var i=n[r];if(!Fh.call(e,i)||!Fn(t[i],e[i]))return!1}return!0}function Dy(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function Oy(t,e){var n=Dy(t);t=0;for(var r;n;){if(n.nodeType===3){if(r=t+n.textContent.length,t<=e&&r>=e)return{node:n,offset:e-t};t=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=Dy(n)}}function SE(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?SE(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function CE(){for(var t=window,e=Dc();e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=Dc(t.document)}return e}function Pp(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}function fR(t){var e=CE(),n=t.focusedElem,r=t.selectionRange;if(e!==n&&n&&n.ownerDocument&&SE(n.ownerDocument.documentElement,n)){if(r!==null&&Pp(n)){if(e=r.start,t=r.end,t===void 0&&(t=e),"selectionStart"in n)n.selectionStart=e,n.selectionEnd=Math.min(t,n.value.length);else if(t=(e=n.ownerDocument||document)&&e.defaultView||window,t.getSelection){t=t.getSelection();var i=n.textContent.length,s=Math.min(r.start,i);r=r.end===void 0?s:Math.min(r.end,i),!t.extend&&s>r&&(i=r,r=s,s=i),i=Oy(n,s);var o=Oy(n,r);i&&o&&(t.rangeCount!==1||t.anchorNode!==i.node||t.anchorOffset!==i.offset||t.focusNode!==o.node||t.focusOffset!==o.offset)&&(e=e.createRange(),e.setStart(i.node,i.offset),t.removeAllRanges(),s>r?(t.addRange(e),t.extend(o.node,o.offset)):(e.setEnd(o.node,o.offset),t.addRange(e)))}}for(e=[],t=n;t=t.parentNode;)t.nodeType===1&&e.push({element:t,left:t.scrollLeft,top:t.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<e.length;n++)t=e[n],t.element.scrollLeft=t.left,t.element.scrollTop=t.top}}var pR=Sr&&"documentMode"in document&&11>=document.documentMode,Ls=null,sf=null,ya=null,of=!1;function Ly(t,e,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;of||Ls==null||Ls!==Dc(r)||(r=Ls,"selectionStart"in r&&Pp(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),ya&&Va(ya,r)||(ya=r,r=Uc(sf,"onSelect"),0<r.length&&(e=new Ap("onSelect","select",null,e,n),t.push({event:e,listeners:r}),e.target=Ls)))}function zl(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var Vs={animationend:zl("Animation","AnimationEnd"),animationiteration:zl("Animation","AnimationIteration"),animationstart:zl("Animation","AnimationStart"),transitionend:zl("Transition","TransitionEnd")},Jd={},AE={};Sr&&(AE=document.createElement("div").style,"AnimationEvent"in window||(delete Vs.animationend.animation,delete Vs.animationiteration.animation,delete Vs.animationstart.animation),"TransitionEvent"in window||delete Vs.transitionend.transition);function bu(t){if(Jd[t])return Jd[t];if(!Vs[t])return t;var e=Vs[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in AE)return Jd[t]=e[n];return t}var RE=bu("animationend"),xE=bu("animationiteration"),PE=bu("animationstart"),kE=bu("transitionend"),NE=new Map,Vy="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Ri(t,e){NE.set(t,e),ps(e,[t])}for(var Zd=0;Zd<Vy.length;Zd++){var eh=Vy[Zd],mR=eh.toLowerCase(),gR=eh[0].toUpperCase()+eh.slice(1);Ri(mR,"on"+gR)}Ri(RE,"onAnimationEnd");Ri(xE,"onAnimationIteration");Ri(PE,"onAnimationStart");Ri("dblclick","onDoubleClick");Ri("focusin","onFocus");Ri("focusout","onBlur");Ri(kE,"onTransitionEnd");io("onMouseEnter",["mouseout","mouseover"]);io("onMouseLeave",["mouseout","mouseover"]);io("onPointerEnter",["pointerout","pointerover"]);io("onPointerLeave",["pointerout","pointerover"]);ps("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));ps("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));ps("onBeforeInput",["compositionend","keypress","textInput","paste"]);ps("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));ps("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));ps("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var sa="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),yR=new Set("cancel close invalid load scroll toggle".split(" ").concat(sa));function jy(t,e,n){var r=t.type||"unknown-event";t.currentTarget=n,mA(r,e,void 0,t),t.currentTarget=null}function bE(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var r=t[n],i=r.event;r=r.listeners;e:{var s=void 0;if(e)for(var o=r.length-1;0<=o;o--){var l=r[o],c=l.instance,u=l.currentTarget;if(l=l.listener,c!==s&&i.isPropagationStopped())break e;jy(i,l,u),s=c}else for(o=0;o<r.length;o++){if(l=r[o],c=l.instance,u=l.currentTarget,l=l.listener,c!==s&&i.isPropagationStopped())break e;jy(i,l,u),s=c}}}if(Lc)throw t=ef,Lc=!1,ef=null,t}function ze(t,e){var n=e[df];n===void 0&&(n=e[df]=new Set);var r=t+"__bubble";n.has(r)||(DE(e,t,2,!1),n.add(r))}function th(t,e,n){var r=0;e&&(r|=4),DE(n,t,r,e)}var ql="_reactListening"+Math.random().toString(36).slice(2);function ja(t){if(!t[ql]){t[ql]=!0,Uw.forEach(function(n){n!=="selectionchange"&&(yR.has(n)||th(n,!1,t),th(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[ql]||(e[ql]=!0,th("selectionchange",!1,e))}}function DE(t,e,n,r){switch(gE(e)){case 1:var i=NA;break;case 4:i=bA;break;default:i=Sp}n=i.bind(null,e,n,t),i=void 0,!Zh||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(i=!0),r?i!==void 0?t.addEventListener(e,n,{capture:!0,passive:i}):t.addEventListener(e,n,!0):i!==void 0?t.addEventListener(e,n,{passive:i}):t.addEventListener(e,n,!1)}function nh(t,e,n,r,i){var s=r;if(!(e&1)&&!(e&2)&&r!==null)e:for(;;){if(r===null)return;var o=r.tag;if(o===3||o===4){var l=r.stateNode.containerInfo;if(l===i||l.nodeType===8&&l.parentNode===i)break;if(o===4)for(o=r.return;o!==null;){var c=o.tag;if((c===3||c===4)&&(c=o.stateNode.containerInfo,c===i||c.nodeType===8&&c.parentNode===i))return;o=o.return}for(;l!==null;){if(o=Gi(l),o===null)return;if(c=o.tag,c===5||c===6){r=s=o;continue e}l=l.parentNode}}r=r.return}nE(function(){var u=s,f=wp(n),p=[];e:{var g=NE.get(t);if(g!==void 0){var S=Ap,v=t;switch(t){case"keypress":if(fc(n)===0)break e;case"keydown":case"keyup":S=GA;break;case"focusin":v="focus",S=Qd;break;case"focusout":v="blur",S=Qd;break;case"beforeblur":case"afterblur":S=Qd;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":S=Cy;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":S=LA;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":S=YA;break;case RE:case xE:case PE:S=MA;break;case kE:S=JA;break;case"scroll":S=DA;break;case"wheel":S=eR;break;case"copy":case"cut":case"paste":S=UA;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":S=Ry}var N=(e&4)!==0,b=!N&&t==="scroll",I=N?g!==null?g+"Capture":null:g;N=[];for(var E=u,y;E!==null;){y=E;var L=y.stateNode;if(y.tag===5&&L!==null&&(y=L,I!==null&&(L=Na(E,I),L!=null&&N.push(Ma(E,L,y)))),b)break;E=E.return}0<N.length&&(g=new S(g,v,null,n,f),p.push({event:g,listeners:N}))}}if(!(e&7)){e:{if(g=t==="mouseover"||t==="pointerover",S=t==="mouseout"||t==="pointerout",g&&n!==Xh&&(v=n.relatedTarget||n.fromElement)&&(Gi(v)||v[Cr]))break e;if((S||g)&&(g=f.window===f?f:(g=f.ownerDocument)?g.defaultView||g.parentWindow:window,S?(v=n.relatedTarget||n.toElement,S=u,v=v?Gi(v):null,v!==null&&(b=ms(v),v!==b||v.tag!==5&&v.tag!==6)&&(v=null)):(S=null,v=u),S!==v)){if(N=Cy,L="onMouseLeave",I="onMouseEnter",E="mouse",(t==="pointerout"||t==="pointerover")&&(N=Ry,L="onPointerLeave",I="onPointerEnter",E="pointer"),b=S==null?g:js(S),y=v==null?g:js(v),g=new N(L,E+"leave",S,n,f),g.target=b,g.relatedTarget=y,L=null,Gi(f)===u&&(N=new N(I,E+"enter",v,n,f),N.target=y,N.relatedTarget=b,L=N),b=L,S&&v)t:{for(N=S,I=v,E=0,y=N;y;y=Cs(y))E++;for(y=0,L=I;L;L=Cs(L))y++;for(;0<E-y;)N=Cs(N),E--;for(;0<y-E;)I=Cs(I),y--;for(;E--;){if(N===I||I!==null&&N===I.alternate)break t;N=Cs(N),I=Cs(I)}N=null}else N=null;S!==null&&My(p,g,S,N,!1),v!==null&&b!==null&&My(p,b,v,N,!0)}}e:{if(g=u?js(u):window,S=g.nodeName&&g.nodeName.toLowerCase(),S==="select"||S==="input"&&g.type==="file")var $=aR;else if(ky(g))if(TE)$=dR;else{$=cR;var B=lR}else(S=g.nodeName)&&S.toLowerCase()==="input"&&(g.type==="checkbox"||g.type==="radio")&&($=uR);if($&&($=$(t,u))){EE(p,$,n,f);break e}B&&B(t,g,u),t==="focusout"&&(B=g._wrapperState)&&B.controlled&&g.type==="number"&&Wh(g,"number",g.value)}switch(B=u?js(u):window,t){case"focusin":(ky(B)||B.contentEditable==="true")&&(Ls=B,sf=u,ya=null);break;case"focusout":ya=sf=Ls=null;break;case"mousedown":of=!0;break;case"contextmenu":case"mouseup":case"dragend":of=!1,Ly(p,n,f);break;case"selectionchange":if(pR)break;case"keydown":case"keyup":Ly(p,n,f)}var C;if(xp)e:{switch(t){case"compositionstart":var T="onCompositionStart";break e;case"compositionend":T="onCompositionEnd";break e;case"compositionupdate":T="onCompositionUpdate";break e}T=void 0}else Os?_E(t,n)&&(T="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(T="onCompositionStart");T&&(vE&&n.locale!=="ko"&&(Os||T!=="onCompositionStart"?T==="onCompositionEnd"&&Os&&(C=yE()):(ni=f,Cp="value"in ni?ni.value:ni.textContent,Os=!0)),B=Uc(u,T),0<B.length&&(T=new Ay(T,t,null,n,f),p.push({event:T,listeners:B}),C?T.data=C:(C=wE(n),C!==null&&(T.data=C)))),(C=nR?rR(t,n):iR(t,n))&&(u=Uc(u,"onBeforeInput"),0<u.length&&(f=new Ay("onBeforeInput","beforeinput",null,n,f),p.push({event:f,listeners:u}),f.data=C))}bE(p,e)})}function Ma(t,e,n){return{instance:t,listener:e,currentTarget:n}}function Uc(t,e){for(var n=e+"Capture",r=[];t!==null;){var i=t,s=i.stateNode;i.tag===5&&s!==null&&(i=s,s=Na(t,n),s!=null&&r.unshift(Ma(t,s,i)),s=Na(t,e),s!=null&&r.push(Ma(t,s,i))),t=t.return}return r}function Cs(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5);return t||null}function My(t,e,n,r,i){for(var s=e._reactName,o=[];n!==null&&n!==r;){var l=n,c=l.alternate,u=l.stateNode;if(c!==null&&c===r)break;l.tag===5&&u!==null&&(l=u,i?(c=Na(n,s),c!=null&&o.unshift(Ma(n,c,l))):i||(c=Na(n,s),c!=null&&o.push(Ma(n,c,l)))),n=n.return}o.length!==0&&t.push({event:e,listeners:o})}var vR=/\r\n?/g,_R=/\u0000|\uFFFD/g;function Fy(t){return(typeof t=="string"?t:""+t).replace(vR,`
`).replace(_R,"")}function Hl(t,e,n){if(e=Fy(e),Fy(t)!==e&&n)throw Error(q(425))}function $c(){}var af=null,lf=null;function cf(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var uf=typeof setTimeout=="function"?setTimeout:void 0,wR=typeof clearTimeout=="function"?clearTimeout:void 0,Uy=typeof Promise=="function"?Promise:void 0,ER=typeof queueMicrotask=="function"?queueMicrotask:typeof Uy<"u"?function(t){return Uy.resolve(null).then(t).catch(TR)}:uf;function TR(t){setTimeout(function(){throw t})}function rh(t,e){var n=e,r=0;do{var i=n.nextSibling;if(t.removeChild(n),i&&i.nodeType===8)if(n=i.data,n==="/$"){if(r===0){t.removeChild(i),Oa(e);return}r--}else n!=="$"&&n!=="$?"&&n!=="$!"||r++;n=i}while(n);Oa(e)}function ci(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?")break;if(e==="/$")return null}}return t}function $y(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"){if(e===0)return t;e--}else n==="/$"&&e++}t=t.previousSibling}return null}var Io=Math.random().toString(36).slice(2),Zn="__reactFiber$"+Io,Fa="__reactProps$"+Io,Cr="__reactContainer$"+Io,df="__reactEvents$"+Io,IR="__reactListeners$"+Io,SR="__reactHandles$"+Io;function Gi(t){var e=t[Zn];if(e)return e;for(var n=t.parentNode;n;){if(e=n[Cr]||n[Zn]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=$y(t);t!==null;){if(n=t[Zn])return n;t=$y(t)}return e}t=n,n=t.parentNode}return null}function ol(t){return t=t[Zn]||t[Cr],!t||t.tag!==5&&t.tag!==6&&t.tag!==13&&t.tag!==3?null:t}function js(t){if(t.tag===5||t.tag===6)return t.stateNode;throw Error(q(33))}function Du(t){return t[Fa]||null}var hf=[],Ms=-1;function xi(t){return{current:t}}function qe(t){0>Ms||(t.current=hf[Ms],hf[Ms]=null,Ms--)}function Ue(t,e){Ms++,hf[Ms]=t.current,t.current=e}var wi={},Vt=xi(wi),Zt=xi(!1),rs=wi;function so(t,e){var n=t.type.contextTypes;if(!n)return wi;var r=t.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===e)return r.__reactInternalMemoizedMaskedChildContext;var i={},s;for(s in n)i[s]=e[s];return r&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=e,t.__reactInternalMemoizedMaskedChildContext=i),i}function en(t){return t=t.childContextTypes,t!=null}function Bc(){qe(Zt),qe(Vt)}function By(t,e,n){if(Vt.current!==wi)throw Error(q(168));Ue(Vt,e),Ue(Zt,n)}function OE(t,e,n){var r=t.stateNode;if(e=e.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var i in r)if(!(i in e))throw Error(q(108,lA(t)||"Unknown",i));return Xe({},n,r)}function zc(t){return t=(t=t.stateNode)&&t.__reactInternalMemoizedMergedChildContext||wi,rs=Vt.current,Ue(Vt,t),Ue(Zt,Zt.current),!0}function zy(t,e,n){var r=t.stateNode;if(!r)throw Error(q(169));n?(t=OE(t,e,rs),r.__reactInternalMemoizedMergedChildContext=t,qe(Zt),qe(Vt),Ue(Vt,t)):qe(Zt),Ue(Zt,n)}var yr=null,Ou=!1,ih=!1;function LE(t){yr===null?yr=[t]:yr.push(t)}function CR(t){Ou=!0,LE(t)}function Pi(){if(!ih&&yr!==null){ih=!0;var t=0,e=Le;try{var n=yr;for(Le=1;t<n.length;t++){var r=n[t];do r=r(!0);while(r!==null)}yr=null,Ou=!1}catch(i){throw yr!==null&&(yr=yr.slice(t+1)),oE(Ep,Pi),i}finally{Le=e,ih=!1}}return null}var Fs=[],Us=0,qc=null,Hc=0,wn=[],En=0,is=null,vr=1,_r="";function zi(t,e){Fs[Us++]=Hc,Fs[Us++]=qc,qc=t,Hc=e}function VE(t,e,n){wn[En++]=vr,wn[En++]=_r,wn[En++]=is,is=t;var r=vr;t=_r;var i=32-jn(r)-1;r&=~(1<<i),n+=1;var s=32-jn(e)+i;if(30<s){var o=i-i%5;s=(r&(1<<o)-1).toString(32),r>>=o,i-=o,vr=1<<32-jn(e)+i|n<<i|r,_r=s+t}else vr=1<<s|n<<i|r,_r=t}function kp(t){t.return!==null&&(zi(t,1),VE(t,1,0))}function Np(t){for(;t===qc;)qc=Fs[--Us],Fs[Us]=null,Hc=Fs[--Us],Fs[Us]=null;for(;t===is;)is=wn[--En],wn[En]=null,_r=wn[--En],wn[En]=null,vr=wn[--En],wn[En]=null}var dn=null,cn=null,He=!1,Ln=null;function jE(t,e){var n=Sn(5,null,null,0);n.elementType="DELETED",n.stateNode=e,n.return=t,e=t.deletions,e===null?(t.deletions=[n],t.flags|=16):e.push(n)}function qy(t,e){switch(t.tag){case 5:var n=t.type;return e=e.nodeType!==1||n.toLowerCase()!==e.nodeName.toLowerCase()?null:e,e!==null?(t.stateNode=e,dn=t,cn=ci(e.firstChild),!0):!1;case 6:return e=t.pendingProps===""||e.nodeType!==3?null:e,e!==null?(t.stateNode=e,dn=t,cn=null,!0):!1;case 13:return e=e.nodeType!==8?null:e,e!==null?(n=is!==null?{id:vr,overflow:_r}:null,t.memoizedState={dehydrated:e,treeContext:n,retryLane:1073741824},n=Sn(18,null,null,0),n.stateNode=e,n.return=t,t.child=n,dn=t,cn=null,!0):!1;default:return!1}}function ff(t){return(t.mode&1)!==0&&(t.flags&128)===0}function pf(t){if(He){var e=cn;if(e){var n=e;if(!qy(t,e)){if(ff(t))throw Error(q(418));e=ci(n.nextSibling);var r=dn;e&&qy(t,e)?jE(r,n):(t.flags=t.flags&-4097|2,He=!1,dn=t)}}else{if(ff(t))throw Error(q(418));t.flags=t.flags&-4097|2,He=!1,dn=t}}}function Hy(t){for(t=t.return;t!==null&&t.tag!==5&&t.tag!==3&&t.tag!==13;)t=t.return;dn=t}function Wl(t){if(t!==dn)return!1;if(!He)return Hy(t),He=!0,!1;var e;if((e=t.tag!==3)&&!(e=t.tag!==5)&&(e=t.type,e=e!=="head"&&e!=="body"&&!cf(t.type,t.memoizedProps)),e&&(e=cn)){if(ff(t))throw ME(),Error(q(418));for(;e;)jE(t,e),e=ci(e.nextSibling)}if(Hy(t),t.tag===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(q(317));e:{for(t=t.nextSibling,e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"){if(e===0){cn=ci(t.nextSibling);break e}e--}else n!=="$"&&n!=="$!"&&n!=="$?"||e++}t=t.nextSibling}cn=null}}else cn=dn?ci(t.stateNode.nextSibling):null;return!0}function ME(){for(var t=cn;t;)t=ci(t.nextSibling)}function oo(){cn=dn=null,He=!1}function bp(t){Ln===null?Ln=[t]:Ln.push(t)}var AR=Or.ReactCurrentBatchConfig;function Yo(t,e,n){if(t=n.ref,t!==null&&typeof t!="function"&&typeof t!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(q(309));var r=n.stateNode}if(!r)throw Error(q(147,t));var i=r,s=""+t;return e!==null&&e.ref!==null&&typeof e.ref=="function"&&e.ref._stringRef===s?e.ref:(e=function(o){var l=i.refs;o===null?delete l[s]:l[s]=o},e._stringRef=s,e)}if(typeof t!="string")throw Error(q(284));if(!n._owner)throw Error(q(290,t))}return t}function Gl(t,e){throw t=Object.prototype.toString.call(e),Error(q(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t))}function Wy(t){var e=t._init;return e(t._payload)}function FE(t){function e(I,E){if(t){var y=I.deletions;y===null?(I.deletions=[E],I.flags|=16):y.push(E)}}function n(I,E){if(!t)return null;for(;E!==null;)e(I,E),E=E.sibling;return null}function r(I,E){for(I=new Map;E!==null;)E.key!==null?I.set(E.key,E):I.set(E.index,E),E=E.sibling;return I}function i(I,E){return I=fi(I,E),I.index=0,I.sibling=null,I}function s(I,E,y){return I.index=y,t?(y=I.alternate,y!==null?(y=y.index,y<E?(I.flags|=2,E):y):(I.flags|=2,E)):(I.flags|=1048576,E)}function o(I){return t&&I.alternate===null&&(I.flags|=2),I}function l(I,E,y,L){return E===null||E.tag!==6?(E=dh(y,I.mode,L),E.return=I,E):(E=i(E,y),E.return=I,E)}function c(I,E,y,L){var $=y.type;return $===Ds?f(I,E,y.props.children,L,y.key):E!==null&&(E.elementType===$||typeof $=="object"&&$!==null&&$.$$typeof===Wr&&Wy($)===E.type)?(L=i(E,y.props),L.ref=Yo(I,E,y),L.return=I,L):(L=wc(y.type,y.key,y.props,null,I.mode,L),L.ref=Yo(I,E,y),L.return=I,L)}function u(I,E,y,L){return E===null||E.tag!==4||E.stateNode.containerInfo!==y.containerInfo||E.stateNode.implementation!==y.implementation?(E=hh(y,I.mode,L),E.return=I,E):(E=i(E,y.children||[]),E.return=I,E)}function f(I,E,y,L,$){return E===null||E.tag!==7?(E=Zi(y,I.mode,L,$),E.return=I,E):(E=i(E,y),E.return=I,E)}function p(I,E,y){if(typeof E=="string"&&E!==""||typeof E=="number")return E=dh(""+E,I.mode,y),E.return=I,E;if(typeof E=="object"&&E!==null){switch(E.$$typeof){case Vl:return y=wc(E.type,E.key,E.props,null,I.mode,y),y.ref=Yo(I,null,E),y.return=I,y;case bs:return E=hh(E,I.mode,y),E.return=I,E;case Wr:var L=E._init;return p(I,L(E._payload),y)}if(ra(E)||Ho(E))return E=Zi(E,I.mode,y,null),E.return=I,E;Gl(I,E)}return null}function g(I,E,y,L){var $=E!==null?E.key:null;if(typeof y=="string"&&y!==""||typeof y=="number")return $!==null?null:l(I,E,""+y,L);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case Vl:return y.key===$?c(I,E,y,L):null;case bs:return y.key===$?u(I,E,y,L):null;case Wr:return $=y._init,g(I,E,$(y._payload),L)}if(ra(y)||Ho(y))return $!==null?null:f(I,E,y,L,null);Gl(I,y)}return null}function S(I,E,y,L,$){if(typeof L=="string"&&L!==""||typeof L=="number")return I=I.get(y)||null,l(E,I,""+L,$);if(typeof L=="object"&&L!==null){switch(L.$$typeof){case Vl:return I=I.get(L.key===null?y:L.key)||null,c(E,I,L,$);case bs:return I=I.get(L.key===null?y:L.key)||null,u(E,I,L,$);case Wr:var B=L._init;return S(I,E,y,B(L._payload),$)}if(ra(L)||Ho(L))return I=I.get(y)||null,f(E,I,L,$,null);Gl(E,L)}return null}function v(I,E,y,L){for(var $=null,B=null,C=E,T=E=0,A=null;C!==null&&T<y.length;T++){C.index>T?(A=C,C=null):A=C.sibling;var x=g(I,C,y[T],L);if(x===null){C===null&&(C=A);break}t&&C&&x.alternate===null&&e(I,C),E=s(x,E,T),B===null?$=x:B.sibling=x,B=x,C=A}if(T===y.length)return n(I,C),He&&zi(I,T),$;if(C===null){for(;T<y.length;T++)C=p(I,y[T],L),C!==null&&(E=s(C,E,T),B===null?$=C:B.sibling=C,B=C);return He&&zi(I,T),$}for(C=r(I,C);T<y.length;T++)A=S(C,I,T,y[T],L),A!==null&&(t&&A.alternate!==null&&C.delete(A.key===null?T:A.key),E=s(A,E,T),B===null?$=A:B.sibling=A,B=A);return t&&C.forEach(function(P){return e(I,P)}),He&&zi(I,T),$}function N(I,E,y,L){var $=Ho(y);if(typeof $!="function")throw Error(q(150));if(y=$.call(y),y==null)throw Error(q(151));for(var B=$=null,C=E,T=E=0,A=null,x=y.next();C!==null&&!x.done;T++,x=y.next()){C.index>T?(A=C,C=null):A=C.sibling;var P=g(I,C,x.value,L);if(P===null){C===null&&(C=A);break}t&&C&&P.alternate===null&&e(I,C),E=s(P,E,T),B===null?$=P:B.sibling=P,B=P,C=A}if(x.done)return n(I,C),He&&zi(I,T),$;if(C===null){for(;!x.done;T++,x=y.next())x=p(I,x.value,L),x!==null&&(E=s(x,E,T),B===null?$=x:B.sibling=x,B=x);return He&&zi(I,T),$}for(C=r(I,C);!x.done;T++,x=y.next())x=S(C,I,T,x.value,L),x!==null&&(t&&x.alternate!==null&&C.delete(x.key===null?T:x.key),E=s(x,E,T),B===null?$=x:B.sibling=x,B=x);return t&&C.forEach(function(k){return e(I,k)}),He&&zi(I,T),$}function b(I,E,y,L){if(typeof y=="object"&&y!==null&&y.type===Ds&&y.key===null&&(y=y.props.children),typeof y=="object"&&y!==null){switch(y.$$typeof){case Vl:e:{for(var $=y.key,B=E;B!==null;){if(B.key===$){if($=y.type,$===Ds){if(B.tag===7){n(I,B.sibling),E=i(B,y.props.children),E.return=I,I=E;break e}}else if(B.elementType===$||typeof $=="object"&&$!==null&&$.$$typeof===Wr&&Wy($)===B.type){n(I,B.sibling),E=i(B,y.props),E.ref=Yo(I,B,y),E.return=I,I=E;break e}n(I,B);break}else e(I,B);B=B.sibling}y.type===Ds?(E=Zi(y.props.children,I.mode,L,y.key),E.return=I,I=E):(L=wc(y.type,y.key,y.props,null,I.mode,L),L.ref=Yo(I,E,y),L.return=I,I=L)}return o(I);case bs:e:{for(B=y.key;E!==null;){if(E.key===B)if(E.tag===4&&E.stateNode.containerInfo===y.containerInfo&&E.stateNode.implementation===y.implementation){n(I,E.sibling),E=i(E,y.children||[]),E.return=I,I=E;break e}else{n(I,E);break}else e(I,E);E=E.sibling}E=hh(y,I.mode,L),E.return=I,I=E}return o(I);case Wr:return B=y._init,b(I,E,B(y._payload),L)}if(ra(y))return v(I,E,y,L);if(Ho(y))return N(I,E,y,L);Gl(I,y)}return typeof y=="string"&&y!==""||typeof y=="number"?(y=""+y,E!==null&&E.tag===6?(n(I,E.sibling),E=i(E,y),E.return=I,I=E):(n(I,E),E=dh(y,I.mode,L),E.return=I,I=E),o(I)):n(I,E)}return b}var ao=FE(!0),UE=FE(!1),Wc=xi(null),Gc=null,$s=null,Dp=null;function Op(){Dp=$s=Gc=null}function Lp(t){var e=Wc.current;qe(Wc),t._currentValue=e}function mf(t,e,n){for(;t!==null;){var r=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,r!==null&&(r.childLanes|=e)):r!==null&&(r.childLanes&e)!==e&&(r.childLanes|=e),t===n)break;t=t.return}}function Qs(t,e){Gc=t,Dp=$s=null,t=t.dependencies,t!==null&&t.firstContext!==null&&(t.lanes&e&&(Jt=!0),t.firstContext=null)}function Rn(t){var e=t._currentValue;if(Dp!==t)if(t={context:t,memoizedValue:e,next:null},$s===null){if(Gc===null)throw Error(q(308));$s=t,Gc.dependencies={lanes:0,firstContext:t}}else $s=$s.next=t;return e}var Ki=null;function Vp(t){Ki===null?Ki=[t]:Ki.push(t)}function $E(t,e,n,r){var i=e.interleaved;return i===null?(n.next=n,Vp(e)):(n.next=i.next,i.next=n),e.interleaved=n,Ar(t,r)}function Ar(t,e){t.lanes|=e;var n=t.alternate;for(n!==null&&(n.lanes|=e),n=t,t=t.return;t!==null;)t.childLanes|=e,n=t.alternate,n!==null&&(n.childLanes|=e),n=t,t=t.return;return n.tag===3?n.stateNode:null}var Gr=!1;function jp(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function BE(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,effects:t.effects})}function Tr(t,e){return{eventTime:t,lane:e,tag:0,payload:null,callback:null,next:null}}function ui(t,e,n){var r=t.updateQueue;if(r===null)return null;if(r=r.shared,Ae&2){var i=r.pending;return i===null?e.next=e:(e.next=i.next,i.next=e),r.pending=e,Ar(t,n)}return i=r.interleaved,i===null?(e.next=e,Vp(r)):(e.next=i.next,i.next=e),r.interleaved=e,Ar(t,n)}function pc(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194240)!==0)){var r=e.lanes;r&=t.pendingLanes,n|=r,e.lanes=n,Tp(t,n)}}function Gy(t,e){var n=t.updateQueue,r=t.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var i=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var o={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};s===null?i=s=o:s=s.next=o,n=n.next}while(n!==null);s===null?i=s=e:s=s.next=e}else i=s=e;n={baseState:r.baseState,firstBaseUpdate:i,lastBaseUpdate:s,shared:r.shared,effects:r.effects},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}function Kc(t,e,n,r){var i=t.updateQueue;Gr=!1;var s=i.firstBaseUpdate,o=i.lastBaseUpdate,l=i.shared.pending;if(l!==null){i.shared.pending=null;var c=l,u=c.next;c.next=null,o===null?s=u:o.next=u,o=c;var f=t.alternate;f!==null&&(f=f.updateQueue,l=f.lastBaseUpdate,l!==o&&(l===null?f.firstBaseUpdate=u:l.next=u,f.lastBaseUpdate=c))}if(s!==null){var p=i.baseState;o=0,f=u=c=null,l=s;do{var g=l.lane,S=l.eventTime;if((r&g)===g){f!==null&&(f=f.next={eventTime:S,lane:0,tag:l.tag,payload:l.payload,callback:l.callback,next:null});e:{var v=t,N=l;switch(g=e,S=n,N.tag){case 1:if(v=N.payload,typeof v=="function"){p=v.call(S,p,g);break e}p=v;break e;case 3:v.flags=v.flags&-65537|128;case 0:if(v=N.payload,g=typeof v=="function"?v.call(S,p,g):v,g==null)break e;p=Xe({},p,g);break e;case 2:Gr=!0}}l.callback!==null&&l.lane!==0&&(t.flags|=64,g=i.effects,g===null?i.effects=[l]:g.push(l))}else S={eventTime:S,lane:g,tag:l.tag,payload:l.payload,callback:l.callback,next:null},f===null?(u=f=S,c=p):f=f.next=S,o|=g;if(l=l.next,l===null){if(l=i.shared.pending,l===null)break;g=l,l=g.next,g.next=null,i.lastBaseUpdate=g,i.shared.pending=null}}while(!0);if(f===null&&(c=p),i.baseState=c,i.firstBaseUpdate=u,i.lastBaseUpdate=f,e=i.shared.interleaved,e!==null){i=e;do o|=i.lane,i=i.next;while(i!==e)}else s===null&&(i.shared.lanes=0);os|=o,t.lanes=o,t.memoizedState=p}}function Ky(t,e,n){if(t=e.effects,e.effects=null,t!==null)for(e=0;e<t.length;e++){var r=t[e],i=r.callback;if(i!==null){if(r.callback=null,r=n,typeof i!="function")throw Error(q(191,i));i.call(r)}}}var al={},nr=xi(al),Ua=xi(al),$a=xi(al);function Qi(t){if(t===al)throw Error(q(174));return t}function Mp(t,e){switch(Ue($a,e),Ue(Ua,t),Ue(nr,al),t=e.nodeType,t){case 9:case 11:e=(e=e.documentElement)?e.namespaceURI:Kh(null,"");break;default:t=t===8?e.parentNode:e,e=t.namespaceURI||null,t=t.tagName,e=Kh(e,t)}qe(nr),Ue(nr,e)}function lo(){qe(nr),qe(Ua),qe($a)}function zE(t){Qi($a.current);var e=Qi(nr.current),n=Kh(e,t.type);e!==n&&(Ue(Ua,t),Ue(nr,n))}function Fp(t){Ua.current===t&&(qe(nr),qe(Ua))}var Qe=xi(0);function Qc(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return e}else if(e.tag===19&&e.memoizedProps.revealOrder!==void 0){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var sh=[];function Up(){for(var t=0;t<sh.length;t++)sh[t]._workInProgressVersionPrimary=null;sh.length=0}var mc=Or.ReactCurrentDispatcher,oh=Or.ReactCurrentBatchConfig,ss=0,Ye=null,pt=null,_t=null,Yc=!1,va=!1,Ba=0,RR=0;function Pt(){throw Error(q(321))}function $p(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!Fn(t[n],e[n]))return!1;return!0}function Bp(t,e,n,r,i,s){if(ss=s,Ye=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,mc.current=t===null||t.memoizedState===null?NR:bR,t=n(r,i),va){s=0;do{if(va=!1,Ba=0,25<=s)throw Error(q(301));s+=1,_t=pt=null,e.updateQueue=null,mc.current=DR,t=n(r,i)}while(va)}if(mc.current=Xc,e=pt!==null&&pt.next!==null,ss=0,_t=pt=Ye=null,Yc=!1,e)throw Error(q(300));return t}function zp(){var t=Ba!==0;return Ba=0,t}function Xn(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return _t===null?Ye.memoizedState=_t=t:_t=_t.next=t,_t}function xn(){if(pt===null){var t=Ye.alternate;t=t!==null?t.memoizedState:null}else t=pt.next;var e=_t===null?Ye.memoizedState:_t.next;if(e!==null)_t=e,pt=t;else{if(t===null)throw Error(q(310));pt=t,t={memoizedState:pt.memoizedState,baseState:pt.baseState,baseQueue:pt.baseQueue,queue:pt.queue,next:null},_t===null?Ye.memoizedState=_t=t:_t=_t.next=t}return _t}function za(t,e){return typeof e=="function"?e(t):e}function ah(t){var e=xn(),n=e.queue;if(n===null)throw Error(q(311));n.lastRenderedReducer=t;var r=pt,i=r.baseQueue,s=n.pending;if(s!==null){if(i!==null){var o=i.next;i.next=s.next,s.next=o}r.baseQueue=i=s,n.pending=null}if(i!==null){s=i.next,r=r.baseState;var l=o=null,c=null,u=s;do{var f=u.lane;if((ss&f)===f)c!==null&&(c=c.next={lane:0,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null}),r=u.hasEagerState?u.eagerState:t(r,u.action);else{var p={lane:f,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null};c===null?(l=c=p,o=r):c=c.next=p,Ye.lanes|=f,os|=f}u=u.next}while(u!==null&&u!==s);c===null?o=r:c.next=l,Fn(r,e.memoizedState)||(Jt=!0),e.memoizedState=r,e.baseState=o,e.baseQueue=c,n.lastRenderedState=r}if(t=n.interleaved,t!==null){i=t;do s=i.lane,Ye.lanes|=s,os|=s,i=i.next;while(i!==t)}else i===null&&(n.lanes=0);return[e.memoizedState,n.dispatch]}function lh(t){var e=xn(),n=e.queue;if(n===null)throw Error(q(311));n.lastRenderedReducer=t;var r=n.dispatch,i=n.pending,s=e.memoizedState;if(i!==null){n.pending=null;var o=i=i.next;do s=t(s,o.action),o=o.next;while(o!==i);Fn(s,e.memoizedState)||(Jt=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,r]}function qE(){}function HE(t,e){var n=Ye,r=xn(),i=e(),s=!Fn(r.memoizedState,i);if(s&&(r.memoizedState=i,Jt=!0),r=r.queue,qp(KE.bind(null,n,r,t),[t]),r.getSnapshot!==e||s||_t!==null&&_t.memoizedState.tag&1){if(n.flags|=2048,qa(9,GE.bind(null,n,r,i,e),void 0,null),wt===null)throw Error(q(349));ss&30||WE(n,e,i)}return i}function WE(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=Ye.updateQueue,e===null?(e={lastEffect:null,stores:null},Ye.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function GE(t,e,n,r){e.value=n,e.getSnapshot=r,QE(e)&&YE(t)}function KE(t,e,n){return n(function(){QE(e)&&YE(t)})}function QE(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!Fn(t,n)}catch{return!0}}function YE(t){var e=Ar(t,1);e!==null&&Mn(e,t,1,-1)}function Qy(t){var e=Xn();return typeof t=="function"&&(t=t()),e.memoizedState=e.baseState=t,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:za,lastRenderedState:t},e.queue=t,t=t.dispatch=kR.bind(null,Ye,t),[e.memoizedState,t]}function qa(t,e,n,r){return t={tag:t,create:e,destroy:n,deps:r,next:null},e=Ye.updateQueue,e===null?(e={lastEffect:null,stores:null},Ye.updateQueue=e,e.lastEffect=t.next=t):(n=e.lastEffect,n===null?e.lastEffect=t.next=t:(r=n.next,n.next=t,t.next=r,e.lastEffect=t)),t}function XE(){return xn().memoizedState}function gc(t,e,n,r){var i=Xn();Ye.flags|=t,i.memoizedState=qa(1|e,n,void 0,r===void 0?null:r)}function Lu(t,e,n,r){var i=xn();r=r===void 0?null:r;var s=void 0;if(pt!==null){var o=pt.memoizedState;if(s=o.destroy,r!==null&&$p(r,o.deps)){i.memoizedState=qa(e,n,s,r);return}}Ye.flags|=t,i.memoizedState=qa(1|e,n,s,r)}function Yy(t,e){return gc(8390656,8,t,e)}function qp(t,e){return Lu(2048,8,t,e)}function JE(t,e){return Lu(4,2,t,e)}function ZE(t,e){return Lu(4,4,t,e)}function eT(t,e){if(typeof e=="function")return t=t(),e(t),function(){e(null)};if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function tT(t,e,n){return n=n!=null?n.concat([t]):null,Lu(4,4,eT.bind(null,e,t),n)}function Hp(){}function nT(t,e){var n=xn();e=e===void 0?null:e;var r=n.memoizedState;return r!==null&&e!==null&&$p(e,r[1])?r[0]:(n.memoizedState=[t,e],t)}function rT(t,e){var n=xn();e=e===void 0?null:e;var r=n.memoizedState;return r!==null&&e!==null&&$p(e,r[1])?r[0]:(t=t(),n.memoizedState=[t,e],t)}function iT(t,e,n){return ss&21?(Fn(n,e)||(n=cE(),Ye.lanes|=n,os|=n,t.baseState=!0),e):(t.baseState&&(t.baseState=!1,Jt=!0),t.memoizedState=n)}function xR(t,e){var n=Le;Le=n!==0&&4>n?n:4,t(!0);var r=oh.transition;oh.transition={};try{t(!1),e()}finally{Le=n,oh.transition=r}}function sT(){return xn().memoizedState}function PR(t,e,n){var r=hi(t);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},oT(t))aT(e,n);else if(n=$E(t,e,n,r),n!==null){var i=Bt();Mn(n,t,r,i),lT(n,e,r)}}function kR(t,e,n){var r=hi(t),i={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(oT(t))aT(e,i);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var o=e.lastRenderedState,l=s(o,n);if(i.hasEagerState=!0,i.eagerState=l,Fn(l,o)){var c=e.interleaved;c===null?(i.next=i,Vp(e)):(i.next=c.next,c.next=i),e.interleaved=i;return}}catch{}finally{}n=$E(t,e,i,r),n!==null&&(i=Bt(),Mn(n,t,r,i),lT(n,e,r))}}function oT(t){var e=t.alternate;return t===Ye||e!==null&&e===Ye}function aT(t,e){va=Yc=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function lT(t,e,n){if(n&4194240){var r=e.lanes;r&=t.pendingLanes,n|=r,e.lanes=n,Tp(t,n)}}var Xc={readContext:Rn,useCallback:Pt,useContext:Pt,useEffect:Pt,useImperativeHandle:Pt,useInsertionEffect:Pt,useLayoutEffect:Pt,useMemo:Pt,useReducer:Pt,useRef:Pt,useState:Pt,useDebugValue:Pt,useDeferredValue:Pt,useTransition:Pt,useMutableSource:Pt,useSyncExternalStore:Pt,useId:Pt,unstable_isNewReconciler:!1},NR={readContext:Rn,useCallback:function(t,e){return Xn().memoizedState=[t,e===void 0?null:e],t},useContext:Rn,useEffect:Yy,useImperativeHandle:function(t,e,n){return n=n!=null?n.concat([t]):null,gc(4194308,4,eT.bind(null,e,t),n)},useLayoutEffect:function(t,e){return gc(4194308,4,t,e)},useInsertionEffect:function(t,e){return gc(4,2,t,e)},useMemo:function(t,e){var n=Xn();return e=e===void 0?null:e,t=t(),n.memoizedState=[t,e],t},useReducer:function(t,e,n){var r=Xn();return e=n!==void 0?n(e):e,r.memoizedState=r.baseState=e,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:e},r.queue=t,t=t.dispatch=PR.bind(null,Ye,t),[r.memoizedState,t]},useRef:function(t){var e=Xn();return t={current:t},e.memoizedState=t},useState:Qy,useDebugValue:Hp,useDeferredValue:function(t){return Xn().memoizedState=t},useTransition:function(){var t=Qy(!1),e=t[0];return t=xR.bind(null,t[1]),Xn().memoizedState=t,[e,t]},useMutableSource:function(){},useSyncExternalStore:function(t,e,n){var r=Ye,i=Xn();if(He){if(n===void 0)throw Error(q(407));n=n()}else{if(n=e(),wt===null)throw Error(q(349));ss&30||WE(r,e,n)}i.memoizedState=n;var s={value:n,getSnapshot:e};return i.queue=s,Yy(KE.bind(null,r,s,t),[t]),r.flags|=2048,qa(9,GE.bind(null,r,s,n,e),void 0,null),n},useId:function(){var t=Xn(),e=wt.identifierPrefix;if(He){var n=_r,r=vr;n=(r&~(1<<32-jn(r)-1)).toString(32)+n,e=":"+e+"R"+n,n=Ba++,0<n&&(e+="H"+n.toString(32)),e+=":"}else n=RR++,e=":"+e+"r"+n.toString(32)+":";return t.memoizedState=e},unstable_isNewReconciler:!1},bR={readContext:Rn,useCallback:nT,useContext:Rn,useEffect:qp,useImperativeHandle:tT,useInsertionEffect:JE,useLayoutEffect:ZE,useMemo:rT,useReducer:ah,useRef:XE,useState:function(){return ah(za)},useDebugValue:Hp,useDeferredValue:function(t){var e=xn();return iT(e,pt.memoizedState,t)},useTransition:function(){var t=ah(za)[0],e=xn().memoizedState;return[t,e]},useMutableSource:qE,useSyncExternalStore:HE,useId:sT,unstable_isNewReconciler:!1},DR={readContext:Rn,useCallback:nT,useContext:Rn,useEffect:qp,useImperativeHandle:tT,useInsertionEffect:JE,useLayoutEffect:ZE,useMemo:rT,useReducer:lh,useRef:XE,useState:function(){return lh(za)},useDebugValue:Hp,useDeferredValue:function(t){var e=xn();return pt===null?e.memoizedState=t:iT(e,pt.memoizedState,t)},useTransition:function(){var t=lh(za)[0],e=xn().memoizedState;return[t,e]},useMutableSource:qE,useSyncExternalStore:HE,useId:sT,unstable_isNewReconciler:!1};function Dn(t,e){if(t&&t.defaultProps){e=Xe({},e),t=t.defaultProps;for(var n in t)e[n]===void 0&&(e[n]=t[n]);return e}return e}function gf(t,e,n,r){e=t.memoizedState,n=n(r,e),n=n==null?e:Xe({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Vu={isMounted:function(t){return(t=t._reactInternals)?ms(t)===t:!1},enqueueSetState:function(t,e,n){t=t._reactInternals;var r=Bt(),i=hi(t),s=Tr(r,i);s.payload=e,n!=null&&(s.callback=n),e=ui(t,s,i),e!==null&&(Mn(e,t,i,r),pc(e,t,i))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var r=Bt(),i=hi(t),s=Tr(r,i);s.tag=1,s.payload=e,n!=null&&(s.callback=n),e=ui(t,s,i),e!==null&&(Mn(e,t,i,r),pc(e,t,i))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=Bt(),r=hi(t),i=Tr(n,r);i.tag=2,e!=null&&(i.callback=e),e=ui(t,i,r),e!==null&&(Mn(e,t,r,n),pc(e,t,r))}};function Xy(t,e,n,r,i,s,o){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(r,s,o):e.prototype&&e.prototype.isPureReactComponent?!Va(n,r)||!Va(i,s):!0}function cT(t,e,n){var r=!1,i=wi,s=e.contextType;return typeof s=="object"&&s!==null?s=Rn(s):(i=en(e)?rs:Vt.current,r=e.contextTypes,s=(r=r!=null)?so(t,i):wi),e=new e(n,s),t.memoizedState=e.state!==null&&e.state!==void 0?e.state:null,e.updater=Vu,t.stateNode=e,e._reactInternals=t,r&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=i,t.__reactInternalMemoizedMaskedChildContext=s),e}function Jy(t,e,n,r){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,r),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,r),e.state!==t&&Vu.enqueueReplaceState(e,e.state,null)}function yf(t,e,n,r){var i=t.stateNode;i.props=n,i.state=t.memoizedState,i.refs={},jp(t);var s=e.contextType;typeof s=="object"&&s!==null?i.context=Rn(s):(s=en(e)?rs:Vt.current,i.context=so(t,s)),i.state=t.memoizedState,s=e.getDerivedStateFromProps,typeof s=="function"&&(gf(t,e,s,n),i.state=t.memoizedState),typeof e.getDerivedStateFromProps=="function"||typeof i.getSnapshotBeforeUpdate=="function"||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(e=i.state,typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount(),e!==i.state&&Vu.enqueueReplaceState(i,i.state,null),Kc(t,n,i,r),i.state=t.memoizedState),typeof i.componentDidMount=="function"&&(t.flags|=4194308)}function co(t,e){try{var n="",r=e;do n+=aA(r),r=r.return;while(r);var i=n}catch(s){i=`
Error generating stack: `+s.message+`
`+s.stack}return{value:t,source:e,stack:i,digest:null}}function ch(t,e,n){return{value:t,source:null,stack:n??null,digest:e??null}}function vf(t,e){try{console.error(e.value)}catch(n){setTimeout(function(){throw n})}}var OR=typeof WeakMap=="function"?WeakMap:Map;function uT(t,e,n){n=Tr(-1,n),n.tag=3,n.payload={element:null};var r=e.value;return n.callback=function(){Zc||(Zc=!0,xf=r),vf(t,e)},n}function dT(t,e,n){n=Tr(-1,n),n.tag=3;var r=t.type.getDerivedStateFromError;if(typeof r=="function"){var i=e.value;n.payload=function(){return r(i)},n.callback=function(){vf(t,e)}}var s=t.stateNode;return s!==null&&typeof s.componentDidCatch=="function"&&(n.callback=function(){vf(t,e),typeof r!="function"&&(di===null?di=new Set([this]):di.add(this));var o=e.stack;this.componentDidCatch(e.value,{componentStack:o!==null?o:""})}),n}function Zy(t,e,n){var r=t.pingCache;if(r===null){r=t.pingCache=new OR;var i=new Set;r.set(e,i)}else i=r.get(e),i===void 0&&(i=new Set,r.set(e,i));i.has(n)||(i.add(n),t=KR.bind(null,t,e,n),e.then(t,t))}function ev(t){do{var e;if((e=t.tag===13)&&(e=t.memoizedState,e=e!==null?e.dehydrated!==null:!0),e)return t;t=t.return}while(t!==null);return null}function tv(t,e,n,r,i){return t.mode&1?(t.flags|=65536,t.lanes=i,t):(t===e?t.flags|=65536:(t.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(e=Tr(-1,1),e.tag=2,ui(n,e,1))),n.lanes|=1),t)}var LR=Or.ReactCurrentOwner,Jt=!1;function Ut(t,e,n,r){e.child=t===null?UE(e,null,n,r):ao(e,t.child,n,r)}function nv(t,e,n,r,i){n=n.render;var s=e.ref;return Qs(e,i),r=Bp(t,e,n,r,s,i),n=zp(),t!==null&&!Jt?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~i,Rr(t,e,i)):(He&&n&&kp(e),e.flags|=1,Ut(t,e,r,i),e.child)}function rv(t,e,n,r,i){if(t===null){var s=n.type;return typeof s=="function"&&!Zp(s)&&s.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(e.tag=15,e.type=s,hT(t,e,s,r,i)):(t=wc(n.type,null,r,e,e.mode,i),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!(t.lanes&i)){var o=s.memoizedProps;if(n=n.compare,n=n!==null?n:Va,n(o,r)&&t.ref===e.ref)return Rr(t,e,i)}return e.flags|=1,t=fi(s,r),t.ref=e.ref,t.return=e,e.child=t}function hT(t,e,n,r,i){if(t!==null){var s=t.memoizedProps;if(Va(s,r)&&t.ref===e.ref)if(Jt=!1,e.pendingProps=r=s,(t.lanes&i)!==0)t.flags&131072&&(Jt=!0);else return e.lanes=t.lanes,Rr(t,e,i)}return _f(t,e,n,r,i)}function fT(t,e,n){var r=e.pendingProps,i=r.children,s=t!==null?t.memoizedState:null;if(r.mode==="hidden")if(!(e.mode&1))e.memoizedState={baseLanes:0,cachePool:null,transitions:null},Ue(zs,ln),ln|=n;else{if(!(n&1073741824))return t=s!==null?s.baseLanes|n:n,e.lanes=e.childLanes=1073741824,e.memoizedState={baseLanes:t,cachePool:null,transitions:null},e.updateQueue=null,Ue(zs,ln),ln|=t,null;e.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=s!==null?s.baseLanes:n,Ue(zs,ln),ln|=r}else s!==null?(r=s.baseLanes|n,e.memoizedState=null):r=n,Ue(zs,ln),ln|=r;return Ut(t,e,i,n),e.child}function pT(t,e){var n=e.ref;(t===null&&n!==null||t!==null&&t.ref!==n)&&(e.flags|=512,e.flags|=2097152)}function _f(t,e,n,r,i){var s=en(n)?rs:Vt.current;return s=so(e,s),Qs(e,i),n=Bp(t,e,n,r,s,i),r=zp(),t!==null&&!Jt?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~i,Rr(t,e,i)):(He&&r&&kp(e),e.flags|=1,Ut(t,e,n,i),e.child)}function iv(t,e,n,r,i){if(en(n)){var s=!0;zc(e)}else s=!1;if(Qs(e,i),e.stateNode===null)yc(t,e),cT(e,n,r),yf(e,n,r,i),r=!0;else if(t===null){var o=e.stateNode,l=e.memoizedProps;o.props=l;var c=o.context,u=n.contextType;typeof u=="object"&&u!==null?u=Rn(u):(u=en(n)?rs:Vt.current,u=so(e,u));var f=n.getDerivedStateFromProps,p=typeof f=="function"||typeof o.getSnapshotBeforeUpdate=="function";p||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(l!==r||c!==u)&&Jy(e,o,r,u),Gr=!1;var g=e.memoizedState;o.state=g,Kc(e,r,o,i),c=e.memoizedState,l!==r||g!==c||Zt.current||Gr?(typeof f=="function"&&(gf(e,n,f,r),c=e.memoizedState),(l=Gr||Xy(e,n,l,r,g,c,u))?(p||typeof o.UNSAFE_componentWillMount!="function"&&typeof o.componentWillMount!="function"||(typeof o.componentWillMount=="function"&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount=="function"&&o.UNSAFE_componentWillMount()),typeof o.componentDidMount=="function"&&(e.flags|=4194308)):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=r,e.memoizedState=c),o.props=r,o.state=c,o.context=u,r=l):(typeof o.componentDidMount=="function"&&(e.flags|=4194308),r=!1)}else{o=e.stateNode,BE(t,e),l=e.memoizedProps,u=e.type===e.elementType?l:Dn(e.type,l),o.props=u,p=e.pendingProps,g=o.context,c=n.contextType,typeof c=="object"&&c!==null?c=Rn(c):(c=en(n)?rs:Vt.current,c=so(e,c));var S=n.getDerivedStateFromProps;(f=typeof S=="function"||typeof o.getSnapshotBeforeUpdate=="function")||typeof o.UNSAFE_componentWillReceiveProps!="function"&&typeof o.componentWillReceiveProps!="function"||(l!==p||g!==c)&&Jy(e,o,r,c),Gr=!1,g=e.memoizedState,o.state=g,Kc(e,r,o,i);var v=e.memoizedState;l!==p||g!==v||Zt.current||Gr?(typeof S=="function"&&(gf(e,n,S,r),v=e.memoizedState),(u=Gr||Xy(e,n,u,r,g,v,c)||!1)?(f||typeof o.UNSAFE_componentWillUpdate!="function"&&typeof o.componentWillUpdate!="function"||(typeof o.componentWillUpdate=="function"&&o.componentWillUpdate(r,v,c),typeof o.UNSAFE_componentWillUpdate=="function"&&o.UNSAFE_componentWillUpdate(r,v,c)),typeof o.componentDidUpdate=="function"&&(e.flags|=4),typeof o.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof o.componentDidUpdate!="function"||l===t.memoizedProps&&g===t.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||l===t.memoizedProps&&g===t.memoizedState||(e.flags|=1024),e.memoizedProps=r,e.memoizedState=v),o.props=r,o.state=v,o.context=c,r=u):(typeof o.componentDidUpdate!="function"||l===t.memoizedProps&&g===t.memoizedState||(e.flags|=4),typeof o.getSnapshotBeforeUpdate!="function"||l===t.memoizedProps&&g===t.memoizedState||(e.flags|=1024),r=!1)}return wf(t,e,n,r,s,i)}function wf(t,e,n,r,i,s){pT(t,e);var o=(e.flags&128)!==0;if(!r&&!o)return i&&zy(e,n,!1),Rr(t,e,s);r=e.stateNode,LR.current=e;var l=o&&typeof n.getDerivedStateFromError!="function"?null:r.render();return e.flags|=1,t!==null&&o?(e.child=ao(e,t.child,null,s),e.child=ao(e,null,l,s)):Ut(t,e,l,s),e.memoizedState=r.state,i&&zy(e,n,!0),e.child}function mT(t){var e=t.stateNode;e.pendingContext?By(t,e.pendingContext,e.pendingContext!==e.context):e.context&&By(t,e.context,!1),Mp(t,e.containerInfo)}function sv(t,e,n,r,i){return oo(),bp(i),e.flags|=256,Ut(t,e,n,r),e.child}var Ef={dehydrated:null,treeContext:null,retryLane:0};function Tf(t){return{baseLanes:t,cachePool:null,transitions:null}}function gT(t,e,n){var r=e.pendingProps,i=Qe.current,s=!1,o=(e.flags&128)!==0,l;if((l=o)||(l=t!==null&&t.memoizedState===null?!1:(i&2)!==0),l?(s=!0,e.flags&=-129):(t===null||t.memoizedState!==null)&&(i|=1),Ue(Qe,i&1),t===null)return pf(e),t=e.memoizedState,t!==null&&(t=t.dehydrated,t!==null)?(e.mode&1?t.data==="$!"?e.lanes=8:e.lanes=1073741824:e.lanes=1,null):(o=r.children,t=r.fallback,s?(r=e.mode,s=e.child,o={mode:"hidden",children:o},!(r&1)&&s!==null?(s.childLanes=0,s.pendingProps=o):s=Fu(o,r,0,null),t=Zi(t,r,n,null),s.return=e,t.return=e,s.sibling=t,e.child=s,e.child.memoizedState=Tf(n),e.memoizedState=Ef,t):Wp(e,o));if(i=t.memoizedState,i!==null&&(l=i.dehydrated,l!==null))return VR(t,e,o,r,l,i,n);if(s){s=r.fallback,o=e.mode,i=t.child,l=i.sibling;var c={mode:"hidden",children:r.children};return!(o&1)&&e.child!==i?(r=e.child,r.childLanes=0,r.pendingProps=c,e.deletions=null):(r=fi(i,c),r.subtreeFlags=i.subtreeFlags&14680064),l!==null?s=fi(l,s):(s=Zi(s,o,n,null),s.flags|=2),s.return=e,r.return=e,r.sibling=s,e.child=r,r=s,s=e.child,o=t.child.memoizedState,o=o===null?Tf(n):{baseLanes:o.baseLanes|n,cachePool:null,transitions:o.transitions},s.memoizedState=o,s.childLanes=t.childLanes&~n,e.memoizedState=Ef,r}return s=t.child,t=s.sibling,r=fi(s,{mode:"visible",children:r.children}),!(e.mode&1)&&(r.lanes=n),r.return=e,r.sibling=null,t!==null&&(n=e.deletions,n===null?(e.deletions=[t],e.flags|=16):n.push(t)),e.child=r,e.memoizedState=null,r}function Wp(t,e){return e=Fu({mode:"visible",children:e},t.mode,0,null),e.return=t,t.child=e}function Kl(t,e,n,r){return r!==null&&bp(r),ao(e,t.child,null,n),t=Wp(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function VR(t,e,n,r,i,s,o){if(n)return e.flags&256?(e.flags&=-257,r=ch(Error(q(422))),Kl(t,e,o,r)):e.memoizedState!==null?(e.child=t.child,e.flags|=128,null):(s=r.fallback,i=e.mode,r=Fu({mode:"visible",children:r.children},i,0,null),s=Zi(s,i,o,null),s.flags|=2,r.return=e,s.return=e,r.sibling=s,e.child=r,e.mode&1&&ao(e,t.child,null,o),e.child.memoizedState=Tf(o),e.memoizedState=Ef,s);if(!(e.mode&1))return Kl(t,e,o,null);if(i.data==="$!"){if(r=i.nextSibling&&i.nextSibling.dataset,r)var l=r.dgst;return r=l,s=Error(q(419)),r=ch(s,r,void 0),Kl(t,e,o,r)}if(l=(o&t.childLanes)!==0,Jt||l){if(r=wt,r!==null){switch(o&-o){case 4:i=2;break;case 16:i=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:i=32;break;case 536870912:i=268435456;break;default:i=0}i=i&(r.suspendedLanes|o)?0:i,i!==0&&i!==s.retryLane&&(s.retryLane=i,Ar(t,i),Mn(r,t,i,-1))}return Jp(),r=ch(Error(q(421))),Kl(t,e,o,r)}return i.data==="$?"?(e.flags|=128,e.child=t.child,e=QR.bind(null,t),i._reactRetry=e,null):(t=s.treeContext,cn=ci(i.nextSibling),dn=e,He=!0,Ln=null,t!==null&&(wn[En++]=vr,wn[En++]=_r,wn[En++]=is,vr=t.id,_r=t.overflow,is=e),e=Wp(e,r.children),e.flags|=4096,e)}function ov(t,e,n){t.lanes|=e;var r=t.alternate;r!==null&&(r.lanes|=e),mf(t.return,e,n)}function uh(t,e,n,r,i){var s=t.memoizedState;s===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:i}:(s.isBackwards=e,s.rendering=null,s.renderingStartTime=0,s.last=r,s.tail=n,s.tailMode=i)}function yT(t,e,n){var r=e.pendingProps,i=r.revealOrder,s=r.tail;if(Ut(t,e,r.children,n),r=Qe.current,r&2)r=r&1|2,e.flags|=128;else{if(t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&ov(t,n,e);else if(t.tag===19)ov(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}r&=1}if(Ue(Qe,r),!(e.mode&1))e.memoizedState=null;else switch(i){case"forwards":for(n=e.child,i=null;n!==null;)t=n.alternate,t!==null&&Qc(t)===null&&(i=n),n=n.sibling;n=i,n===null?(i=e.child,e.child=null):(i=n.sibling,n.sibling=null),uh(e,!1,i,n,s);break;case"backwards":for(n=null,i=e.child,e.child=null;i!==null;){if(t=i.alternate,t!==null&&Qc(t)===null){e.child=i;break}t=i.sibling,i.sibling=n,n=i,i=t}uh(e,!0,n,null,s);break;case"together":uh(e,!1,null,null,void 0);break;default:e.memoizedState=null}return e.child}function yc(t,e){!(e.mode&1)&&t!==null&&(t.alternate=null,e.alternate=null,e.flags|=2)}function Rr(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),os|=e.lanes,!(n&e.childLanes))return null;if(t!==null&&e.child!==t.child)throw Error(q(153));if(e.child!==null){for(t=e.child,n=fi(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=fi(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function jR(t,e,n){switch(e.tag){case 3:mT(e),oo();break;case 5:zE(e);break;case 1:en(e.type)&&zc(e);break;case 4:Mp(e,e.stateNode.containerInfo);break;case 10:var r=e.type._context,i=e.memoizedProps.value;Ue(Wc,r._currentValue),r._currentValue=i;break;case 13:if(r=e.memoizedState,r!==null)return r.dehydrated!==null?(Ue(Qe,Qe.current&1),e.flags|=128,null):n&e.child.childLanes?gT(t,e,n):(Ue(Qe,Qe.current&1),t=Rr(t,e,n),t!==null?t.sibling:null);Ue(Qe,Qe.current&1);break;case 19:if(r=(n&e.childLanes)!==0,t.flags&128){if(r)return yT(t,e,n);e.flags|=128}if(i=e.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),Ue(Qe,Qe.current),r)break;return null;case 22:case 23:return e.lanes=0,fT(t,e,n)}return Rr(t,e,n)}var vT,If,_T,wT;vT=function(t,e){for(var n=e.child;n!==null;){if(n.tag===5||n.tag===6)t.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};If=function(){};_T=function(t,e,n,r){var i=t.memoizedProps;if(i!==r){t=e.stateNode,Qi(nr.current);var s=null;switch(n){case"input":i=qh(t,i),r=qh(t,r),s=[];break;case"select":i=Xe({},i,{value:void 0}),r=Xe({},r,{value:void 0}),s=[];break;case"textarea":i=Gh(t,i),r=Gh(t,r),s=[];break;default:typeof i.onClick!="function"&&typeof r.onClick=="function"&&(t.onclick=$c)}Qh(n,r);var o;n=null;for(u in i)if(!r.hasOwnProperty(u)&&i.hasOwnProperty(u)&&i[u]!=null)if(u==="style"){var l=i[u];for(o in l)l.hasOwnProperty(o)&&(n||(n={}),n[o]="")}else u!=="dangerouslySetInnerHTML"&&u!=="children"&&u!=="suppressContentEditableWarning"&&u!=="suppressHydrationWarning"&&u!=="autoFocus"&&(Pa.hasOwnProperty(u)?s||(s=[]):(s=s||[]).push(u,null));for(u in r){var c=r[u];if(l=i!=null?i[u]:void 0,r.hasOwnProperty(u)&&c!==l&&(c!=null||l!=null))if(u==="style")if(l){for(o in l)!l.hasOwnProperty(o)||c&&c.hasOwnProperty(o)||(n||(n={}),n[o]="");for(o in c)c.hasOwnProperty(o)&&l[o]!==c[o]&&(n||(n={}),n[o]=c[o])}else n||(s||(s=[]),s.push(u,n)),n=c;else u==="dangerouslySetInnerHTML"?(c=c?c.__html:void 0,l=l?l.__html:void 0,c!=null&&l!==c&&(s=s||[]).push(u,c)):u==="children"?typeof c!="string"&&typeof c!="number"||(s=s||[]).push(u,""+c):u!=="suppressContentEditableWarning"&&u!=="suppressHydrationWarning"&&(Pa.hasOwnProperty(u)?(c!=null&&u==="onScroll"&&ze("scroll",t),s||l===c||(s=[])):(s=s||[]).push(u,c))}n&&(s=s||[]).push("style",n);var u=s;(e.updateQueue=u)&&(e.flags|=4)}};wT=function(t,e,n,r){n!==r&&(e.flags|=4)};function Xo(t,e){if(!He)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:r.sibling=null}}function kt(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,r=0;if(e)for(var i=t.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags&14680064,r|=i.flags&14680064,i.return=t,i=i.sibling;else for(i=t.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags,r|=i.flags,i.return=t,i=i.sibling;return t.subtreeFlags|=r,t.childLanes=n,e}function MR(t,e,n){var r=e.pendingProps;switch(Np(e),e.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return kt(e),null;case 1:return en(e.type)&&Bc(),kt(e),null;case 3:return r=e.stateNode,lo(),qe(Zt),qe(Vt),Up(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(t===null||t.child===null)&&(Wl(e)?e.flags|=4:t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,Ln!==null&&(Nf(Ln),Ln=null))),If(t,e),kt(e),null;case 5:Fp(e);var i=Qi($a.current);if(n=e.type,t!==null&&e.stateNode!=null)_T(t,e,n,r,i),t.ref!==e.ref&&(e.flags|=512,e.flags|=2097152);else{if(!r){if(e.stateNode===null)throw Error(q(166));return kt(e),null}if(t=Qi(nr.current),Wl(e)){r=e.stateNode,n=e.type;var s=e.memoizedProps;switch(r[Zn]=e,r[Fa]=s,t=(e.mode&1)!==0,n){case"dialog":ze("cancel",r),ze("close",r);break;case"iframe":case"object":case"embed":ze("load",r);break;case"video":case"audio":for(i=0;i<sa.length;i++)ze(sa[i],r);break;case"source":ze("error",r);break;case"img":case"image":case"link":ze("error",r),ze("load",r);break;case"details":ze("toggle",r);break;case"input":my(r,s),ze("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!s.multiple},ze("invalid",r);break;case"textarea":yy(r,s),ze("invalid",r)}Qh(n,s),i=null;for(var o in s)if(s.hasOwnProperty(o)){var l=s[o];o==="children"?typeof l=="string"?r.textContent!==l&&(s.suppressHydrationWarning!==!0&&Hl(r.textContent,l,t),i=["children",l]):typeof l=="number"&&r.textContent!==""+l&&(s.suppressHydrationWarning!==!0&&Hl(r.textContent,l,t),i=["children",""+l]):Pa.hasOwnProperty(o)&&l!=null&&o==="onScroll"&&ze("scroll",r)}switch(n){case"input":jl(r),gy(r,s,!0);break;case"textarea":jl(r),vy(r);break;case"select":case"option":break;default:typeof s.onClick=="function"&&(r.onclick=$c)}r=i,e.updateQueue=r,r!==null&&(e.flags|=4)}else{o=i.nodeType===9?i:i.ownerDocument,t==="http://www.w3.org/1999/xhtml"&&(t=Kw(n)),t==="http://www.w3.org/1999/xhtml"?n==="script"?(t=o.createElement("div"),t.innerHTML="<script><\/script>",t=t.removeChild(t.firstChild)):typeof r.is=="string"?t=o.createElement(n,{is:r.is}):(t=o.createElement(n),n==="select"&&(o=t,r.multiple?o.multiple=!0:r.size&&(o.size=r.size))):t=o.createElementNS(t,n),t[Zn]=e,t[Fa]=r,vT(t,e,!1,!1),e.stateNode=t;e:{switch(o=Yh(n,r),n){case"dialog":ze("cancel",t),ze("close",t),i=r;break;case"iframe":case"object":case"embed":ze("load",t),i=r;break;case"video":case"audio":for(i=0;i<sa.length;i++)ze(sa[i],t);i=r;break;case"source":ze("error",t),i=r;break;case"img":case"image":case"link":ze("error",t),ze("load",t),i=r;break;case"details":ze("toggle",t),i=r;break;case"input":my(t,r),i=qh(t,r),ze("invalid",t);break;case"option":i=r;break;case"select":t._wrapperState={wasMultiple:!!r.multiple},i=Xe({},r,{value:void 0}),ze("invalid",t);break;case"textarea":yy(t,r),i=Gh(t,r),ze("invalid",t);break;default:i=r}Qh(n,i),l=i;for(s in l)if(l.hasOwnProperty(s)){var c=l[s];s==="style"?Xw(t,c):s==="dangerouslySetInnerHTML"?(c=c?c.__html:void 0,c!=null&&Qw(t,c)):s==="children"?typeof c=="string"?(n!=="textarea"||c!=="")&&ka(t,c):typeof c=="number"&&ka(t,""+c):s!=="suppressContentEditableWarning"&&s!=="suppressHydrationWarning"&&s!=="autoFocus"&&(Pa.hasOwnProperty(s)?c!=null&&s==="onScroll"&&ze("scroll",t):c!=null&&gp(t,s,c,o))}switch(n){case"input":jl(t),gy(t,r,!1);break;case"textarea":jl(t),vy(t);break;case"option":r.value!=null&&t.setAttribute("value",""+_i(r.value));break;case"select":t.multiple=!!r.multiple,s=r.value,s!=null?Hs(t,!!r.multiple,s,!1):r.defaultValue!=null&&Hs(t,!!r.multiple,r.defaultValue,!0);break;default:typeof i.onClick=="function"&&(t.onclick=$c)}switch(n){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(e.flags|=4)}e.ref!==null&&(e.flags|=512,e.flags|=2097152)}return kt(e),null;case 6:if(t&&e.stateNode!=null)wT(t,e,t.memoizedProps,r);else{if(typeof r!="string"&&e.stateNode===null)throw Error(q(166));if(n=Qi($a.current),Qi(nr.current),Wl(e)){if(r=e.stateNode,n=e.memoizedProps,r[Zn]=e,(s=r.nodeValue!==n)&&(t=dn,t!==null))switch(t.tag){case 3:Hl(r.nodeValue,n,(t.mode&1)!==0);break;case 5:t.memoizedProps.suppressHydrationWarning!==!0&&Hl(r.nodeValue,n,(t.mode&1)!==0)}s&&(e.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[Zn]=e,e.stateNode=r}return kt(e),null;case 13:if(qe(Qe),r=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(He&&cn!==null&&e.mode&1&&!(e.flags&128))ME(),oo(),e.flags|=98560,s=!1;else if(s=Wl(e),r!==null&&r.dehydrated!==null){if(t===null){if(!s)throw Error(q(318));if(s=e.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(q(317));s[Zn]=e}else oo(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;kt(e),s=!1}else Ln!==null&&(Nf(Ln),Ln=null),s=!0;if(!s)return e.flags&65536?e:null}return e.flags&128?(e.lanes=n,e):(r=r!==null,r!==(t!==null&&t.memoizedState!==null)&&r&&(e.child.flags|=8192,e.mode&1&&(t===null||Qe.current&1?mt===0&&(mt=3):Jp())),e.updateQueue!==null&&(e.flags|=4),kt(e),null);case 4:return lo(),If(t,e),t===null&&ja(e.stateNode.containerInfo),kt(e),null;case 10:return Lp(e.type._context),kt(e),null;case 17:return en(e.type)&&Bc(),kt(e),null;case 19:if(qe(Qe),s=e.memoizedState,s===null)return kt(e),null;if(r=(e.flags&128)!==0,o=s.rendering,o===null)if(r)Xo(s,!1);else{if(mt!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(o=Qc(t),o!==null){for(e.flags|=128,Xo(s,!1),r=o.updateQueue,r!==null&&(e.updateQueue=r,e.flags|=4),e.subtreeFlags=0,r=n,n=e.child;n!==null;)s=n,t=r,s.flags&=14680066,o=s.alternate,o===null?(s.childLanes=0,s.lanes=t,s.child=null,s.subtreeFlags=0,s.memoizedProps=null,s.memoizedState=null,s.updateQueue=null,s.dependencies=null,s.stateNode=null):(s.childLanes=o.childLanes,s.lanes=o.lanes,s.child=o.child,s.subtreeFlags=0,s.deletions=null,s.memoizedProps=o.memoizedProps,s.memoizedState=o.memoizedState,s.updateQueue=o.updateQueue,s.type=o.type,t=o.dependencies,s.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),n=n.sibling;return Ue(Qe,Qe.current&1|2),e.child}t=t.sibling}s.tail!==null&&ot()>uo&&(e.flags|=128,r=!0,Xo(s,!1),e.lanes=4194304)}else{if(!r)if(t=Qc(o),t!==null){if(e.flags|=128,r=!0,n=t.updateQueue,n!==null&&(e.updateQueue=n,e.flags|=4),Xo(s,!0),s.tail===null&&s.tailMode==="hidden"&&!o.alternate&&!He)return kt(e),null}else 2*ot()-s.renderingStartTime>uo&&n!==1073741824&&(e.flags|=128,r=!0,Xo(s,!1),e.lanes=4194304);s.isBackwards?(o.sibling=e.child,e.child=o):(n=s.last,n!==null?n.sibling=o:e.child=o,s.last=o)}return s.tail!==null?(e=s.tail,s.rendering=e,s.tail=e.sibling,s.renderingStartTime=ot(),e.sibling=null,n=Qe.current,Ue(Qe,r?n&1|2:n&1),e):(kt(e),null);case 22:case 23:return Xp(),r=e.memoizedState!==null,t!==null&&t.memoizedState!==null!==r&&(e.flags|=8192),r&&e.mode&1?ln&1073741824&&(kt(e),e.subtreeFlags&6&&(e.flags|=8192)):kt(e),null;case 24:return null;case 25:return null}throw Error(q(156,e.tag))}function FR(t,e){switch(Np(e),e.tag){case 1:return en(e.type)&&Bc(),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return lo(),qe(Zt),qe(Vt),Up(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 5:return Fp(e),null;case 13:if(qe(Qe),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(q(340));oo()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return qe(Qe),null;case 4:return lo(),null;case 10:return Lp(e.type._context),null;case 22:case 23:return Xp(),null;case 24:return null;default:return null}}var Ql=!1,Ot=!1,UR=typeof WeakSet=="function"?WeakSet:Set,ee=null;function Bs(t,e){var n=t.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(r){et(t,e,r)}else n.current=null}function Sf(t,e,n){try{n()}catch(r){et(t,e,r)}}var av=!1;function $R(t,e){if(af=Mc,t=CE(),Pp(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var i=r.anchorOffset,s=r.focusNode;r=r.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var o=0,l=-1,c=-1,u=0,f=0,p=t,g=null;t:for(;;){for(var S;p!==n||i!==0&&p.nodeType!==3||(l=o+i),p!==s||r!==0&&p.nodeType!==3||(c=o+r),p.nodeType===3&&(o+=p.nodeValue.length),(S=p.firstChild)!==null;)g=p,p=S;for(;;){if(p===t)break t;if(g===n&&++u===i&&(l=o),g===s&&++f===r&&(c=o),(S=p.nextSibling)!==null)break;p=g,g=p.parentNode}p=S}n=l===-1||c===-1?null:{start:l,end:c}}else n=null}n=n||{start:0,end:0}}else n=null;for(lf={focusedElem:t,selectionRange:n},Mc=!1,ee=e;ee!==null;)if(e=ee,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,ee=t;else for(;ee!==null;){e=ee;try{var v=e.alternate;if(e.flags&1024)switch(e.tag){case 0:case 11:case 15:break;case 1:if(v!==null){var N=v.memoizedProps,b=v.memoizedState,I=e.stateNode,E=I.getSnapshotBeforeUpdate(e.elementType===e.type?N:Dn(e.type,N),b);I.__reactInternalSnapshotBeforeUpdate=E}break;case 3:var y=e.stateNode.containerInfo;y.nodeType===1?y.textContent="":y.nodeType===9&&y.documentElement&&y.removeChild(y.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(q(163))}}catch(L){et(e,e.return,L)}if(t=e.sibling,t!==null){t.return=e.return,ee=t;break}ee=e.return}return v=av,av=!1,v}function _a(t,e,n){var r=e.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var i=r=r.next;do{if((i.tag&t)===t){var s=i.destroy;i.destroy=void 0,s!==void 0&&Sf(e,n,s)}i=i.next}while(i!==r)}}function ju(t,e){if(e=e.updateQueue,e=e!==null?e.lastEffect:null,e!==null){var n=e=e.next;do{if((n.tag&t)===t){var r=n.create;n.destroy=r()}n=n.next}while(n!==e)}}function Cf(t){var e=t.ref;if(e!==null){var n=t.stateNode;switch(t.tag){case 5:t=n;break;default:t=n}typeof e=="function"?e(t):e.current=t}}function ET(t){var e=t.alternate;e!==null&&(t.alternate=null,ET(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&(delete e[Zn],delete e[Fa],delete e[df],delete e[IR],delete e[SR])),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}function TT(t){return t.tag===5||t.tag===3||t.tag===4}function lv(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||TT(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Af(t,e,n){var r=t.tag;if(r===5||r===6)t=t.stateNode,e?n.nodeType===8?n.parentNode.insertBefore(t,e):n.insertBefore(t,e):(n.nodeType===8?(e=n.parentNode,e.insertBefore(t,n)):(e=n,e.appendChild(t)),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=$c));else if(r!==4&&(t=t.child,t!==null))for(Af(t,e,n),t=t.sibling;t!==null;)Af(t,e,n),t=t.sibling}function Rf(t,e,n){var r=t.tag;if(r===5||r===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(r!==4&&(t=t.child,t!==null))for(Rf(t,e,n),t=t.sibling;t!==null;)Rf(t,e,n),t=t.sibling}var Tt=null,On=!1;function qr(t,e,n){for(n=n.child;n!==null;)IT(t,e,n),n=n.sibling}function IT(t,e,n){if(tr&&typeof tr.onCommitFiberUnmount=="function")try{tr.onCommitFiberUnmount(Pu,n)}catch{}switch(n.tag){case 5:Ot||Bs(n,e);case 6:var r=Tt,i=On;Tt=null,qr(t,e,n),Tt=r,On=i,Tt!==null&&(On?(t=Tt,n=n.stateNode,t.nodeType===8?t.parentNode.removeChild(n):t.removeChild(n)):Tt.removeChild(n.stateNode));break;case 18:Tt!==null&&(On?(t=Tt,n=n.stateNode,t.nodeType===8?rh(t.parentNode,n):t.nodeType===1&&rh(t,n),Oa(t)):rh(Tt,n.stateNode));break;case 4:r=Tt,i=On,Tt=n.stateNode.containerInfo,On=!0,qr(t,e,n),Tt=r,On=i;break;case 0:case 11:case 14:case 15:if(!Ot&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){i=r=r.next;do{var s=i,o=s.destroy;s=s.tag,o!==void 0&&(s&2||s&4)&&Sf(n,e,o),i=i.next}while(i!==r)}qr(t,e,n);break;case 1:if(!Ot&&(Bs(n,e),r=n.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(l){et(n,e,l)}qr(t,e,n);break;case 21:qr(t,e,n);break;case 22:n.mode&1?(Ot=(r=Ot)||n.memoizedState!==null,qr(t,e,n),Ot=r):qr(t,e,n);break;default:qr(t,e,n)}}function cv(t){var e=t.updateQueue;if(e!==null){t.updateQueue=null;var n=t.stateNode;n===null&&(n=t.stateNode=new UR),e.forEach(function(r){var i=YR.bind(null,t,r);n.has(r)||(n.add(r),r.then(i,i))})}}function bn(t,e){var n=e.deletions;if(n!==null)for(var r=0;r<n.length;r++){var i=n[r];try{var s=t,o=e,l=o;e:for(;l!==null;){switch(l.tag){case 5:Tt=l.stateNode,On=!1;break e;case 3:Tt=l.stateNode.containerInfo,On=!0;break e;case 4:Tt=l.stateNode.containerInfo,On=!0;break e}l=l.return}if(Tt===null)throw Error(q(160));IT(s,o,i),Tt=null,On=!1;var c=i.alternate;c!==null&&(c.return=null),i.return=null}catch(u){et(i,e,u)}}if(e.subtreeFlags&12854)for(e=e.child;e!==null;)ST(e,t),e=e.sibling}function ST(t,e){var n=t.alternate,r=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:if(bn(e,t),Qn(t),r&4){try{_a(3,t,t.return),ju(3,t)}catch(N){et(t,t.return,N)}try{_a(5,t,t.return)}catch(N){et(t,t.return,N)}}break;case 1:bn(e,t),Qn(t),r&512&&n!==null&&Bs(n,n.return);break;case 5:if(bn(e,t),Qn(t),r&512&&n!==null&&Bs(n,n.return),t.flags&32){var i=t.stateNode;try{ka(i,"")}catch(N){et(t,t.return,N)}}if(r&4&&(i=t.stateNode,i!=null)){var s=t.memoizedProps,o=n!==null?n.memoizedProps:s,l=t.type,c=t.updateQueue;if(t.updateQueue=null,c!==null)try{l==="input"&&s.type==="radio"&&s.name!=null&&Ww(i,s),Yh(l,o);var u=Yh(l,s);for(o=0;o<c.length;o+=2){var f=c[o],p=c[o+1];f==="style"?Xw(i,p):f==="dangerouslySetInnerHTML"?Qw(i,p):f==="children"?ka(i,p):gp(i,f,p,u)}switch(l){case"input":Hh(i,s);break;case"textarea":Gw(i,s);break;case"select":var g=i._wrapperState.wasMultiple;i._wrapperState.wasMultiple=!!s.multiple;var S=s.value;S!=null?Hs(i,!!s.multiple,S,!1):g!==!!s.multiple&&(s.defaultValue!=null?Hs(i,!!s.multiple,s.defaultValue,!0):Hs(i,!!s.multiple,s.multiple?[]:"",!1))}i[Fa]=s}catch(N){et(t,t.return,N)}}break;case 6:if(bn(e,t),Qn(t),r&4){if(t.stateNode===null)throw Error(q(162));i=t.stateNode,s=t.memoizedProps;try{i.nodeValue=s}catch(N){et(t,t.return,N)}}break;case 3:if(bn(e,t),Qn(t),r&4&&n!==null&&n.memoizedState.isDehydrated)try{Oa(e.containerInfo)}catch(N){et(t,t.return,N)}break;case 4:bn(e,t),Qn(t);break;case 13:bn(e,t),Qn(t),i=t.child,i.flags&8192&&(s=i.memoizedState!==null,i.stateNode.isHidden=s,!s||i.alternate!==null&&i.alternate.memoizedState!==null||(Qp=ot())),r&4&&cv(t);break;case 22:if(f=n!==null&&n.memoizedState!==null,t.mode&1?(Ot=(u=Ot)||f,bn(e,t),Ot=u):bn(e,t),Qn(t),r&8192){if(u=t.memoizedState!==null,(t.stateNode.isHidden=u)&&!f&&t.mode&1)for(ee=t,f=t.child;f!==null;){for(p=ee=f;ee!==null;){switch(g=ee,S=g.child,g.tag){case 0:case 11:case 14:case 15:_a(4,g,g.return);break;case 1:Bs(g,g.return);var v=g.stateNode;if(typeof v.componentWillUnmount=="function"){r=g,n=g.return;try{e=r,v.props=e.memoizedProps,v.state=e.memoizedState,v.componentWillUnmount()}catch(N){et(r,n,N)}}break;case 5:Bs(g,g.return);break;case 22:if(g.memoizedState!==null){dv(p);continue}}S!==null?(S.return=g,ee=S):dv(p)}f=f.sibling}e:for(f=null,p=t;;){if(p.tag===5){if(f===null){f=p;try{i=p.stateNode,u?(s=i.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none"):(l=p.stateNode,c=p.memoizedProps.style,o=c!=null&&c.hasOwnProperty("display")?c.display:null,l.style.display=Yw("display",o))}catch(N){et(t,t.return,N)}}}else if(p.tag===6){if(f===null)try{p.stateNode.nodeValue=u?"":p.memoizedProps}catch(N){et(t,t.return,N)}}else if((p.tag!==22&&p.tag!==23||p.memoizedState===null||p===t)&&p.child!==null){p.child.return=p,p=p.child;continue}if(p===t)break e;for(;p.sibling===null;){if(p.return===null||p.return===t)break e;f===p&&(f=null),p=p.return}f===p&&(f=null),p.sibling.return=p.return,p=p.sibling}}break;case 19:bn(e,t),Qn(t),r&4&&cv(t);break;case 21:break;default:bn(e,t),Qn(t)}}function Qn(t){var e=t.flags;if(e&2){try{e:{for(var n=t.return;n!==null;){if(TT(n)){var r=n;break e}n=n.return}throw Error(q(160))}switch(r.tag){case 5:var i=r.stateNode;r.flags&32&&(ka(i,""),r.flags&=-33);var s=lv(t);Rf(t,s,i);break;case 3:case 4:var o=r.stateNode.containerInfo,l=lv(t);Af(t,l,o);break;default:throw Error(q(161))}}catch(c){et(t,t.return,c)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function BR(t,e,n){ee=t,CT(t)}function CT(t,e,n){for(var r=(t.mode&1)!==0;ee!==null;){var i=ee,s=i.child;if(i.tag===22&&r){var o=i.memoizedState!==null||Ql;if(!o){var l=i.alternate,c=l!==null&&l.memoizedState!==null||Ot;l=Ql;var u=Ot;if(Ql=o,(Ot=c)&&!u)for(ee=i;ee!==null;)o=ee,c=o.child,o.tag===22&&o.memoizedState!==null?hv(i):c!==null?(c.return=o,ee=c):hv(i);for(;s!==null;)ee=s,CT(s),s=s.sibling;ee=i,Ql=l,Ot=u}uv(t)}else i.subtreeFlags&8772&&s!==null?(s.return=i,ee=s):uv(t)}}function uv(t){for(;ee!==null;){var e=ee;if(e.flags&8772){var n=e.alternate;try{if(e.flags&8772)switch(e.tag){case 0:case 11:case 15:Ot||ju(5,e);break;case 1:var r=e.stateNode;if(e.flags&4&&!Ot)if(n===null)r.componentDidMount();else{var i=e.elementType===e.type?n.memoizedProps:Dn(e.type,n.memoizedProps);r.componentDidUpdate(i,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var s=e.updateQueue;s!==null&&Ky(e,s,r);break;case 3:var o=e.updateQueue;if(o!==null){if(n=null,e.child!==null)switch(e.child.tag){case 5:n=e.child.stateNode;break;case 1:n=e.child.stateNode}Ky(e,o,n)}break;case 5:var l=e.stateNode;if(n===null&&e.flags&4){n=l;var c=e.memoizedProps;switch(e.type){case"button":case"input":case"select":case"textarea":c.autoFocus&&n.focus();break;case"img":c.src&&(n.src=c.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(e.memoizedState===null){var u=e.alternate;if(u!==null){var f=u.memoizedState;if(f!==null){var p=f.dehydrated;p!==null&&Oa(p)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(q(163))}Ot||e.flags&512&&Cf(e)}catch(g){et(e,e.return,g)}}if(e===t){ee=null;break}if(n=e.sibling,n!==null){n.return=e.return,ee=n;break}ee=e.return}}function dv(t){for(;ee!==null;){var e=ee;if(e===t){ee=null;break}var n=e.sibling;if(n!==null){n.return=e.return,ee=n;break}ee=e.return}}function hv(t){for(;ee!==null;){var e=ee;try{switch(e.tag){case 0:case 11:case 15:var n=e.return;try{ju(4,e)}catch(c){et(e,n,c)}break;case 1:var r=e.stateNode;if(typeof r.componentDidMount=="function"){var i=e.return;try{r.componentDidMount()}catch(c){et(e,i,c)}}var s=e.return;try{Cf(e)}catch(c){et(e,s,c)}break;case 5:var o=e.return;try{Cf(e)}catch(c){et(e,o,c)}}}catch(c){et(e,e.return,c)}if(e===t){ee=null;break}var l=e.sibling;if(l!==null){l.return=e.return,ee=l;break}ee=e.return}}var zR=Math.ceil,Jc=Or.ReactCurrentDispatcher,Gp=Or.ReactCurrentOwner,Cn=Or.ReactCurrentBatchConfig,Ae=0,wt=null,ct=null,Ct=0,ln=0,zs=xi(0),mt=0,Ha=null,os=0,Mu=0,Kp=0,wa=null,Qt=null,Qp=0,uo=1/0,gr=null,Zc=!1,xf=null,di=null,Yl=!1,ri=null,eu=0,Ea=0,Pf=null,vc=-1,_c=0;function Bt(){return Ae&6?ot():vc!==-1?vc:vc=ot()}function hi(t){return t.mode&1?Ae&2&&Ct!==0?Ct&-Ct:AR.transition!==null?(_c===0&&(_c=cE()),_c):(t=Le,t!==0||(t=window.event,t=t===void 0?16:gE(t.type)),t):1}function Mn(t,e,n,r){if(50<Ea)throw Ea=0,Pf=null,Error(q(185));il(t,n,r),(!(Ae&2)||t!==wt)&&(t===wt&&(!(Ae&2)&&(Mu|=n),mt===4&&Qr(t,Ct)),tn(t,r),n===1&&Ae===0&&!(e.mode&1)&&(uo=ot()+500,Ou&&Pi()))}function tn(t,e){var n=t.callbackNode;AA(t,e);var r=jc(t,t===wt?Ct:0);if(r===0)n!==null&&Ey(n),t.callbackNode=null,t.callbackPriority=0;else if(e=r&-r,t.callbackPriority!==e){if(n!=null&&Ey(n),e===1)t.tag===0?CR(fv.bind(null,t)):LE(fv.bind(null,t)),ER(function(){!(Ae&6)&&Pi()}),n=null;else{switch(uE(r)){case 1:n=Ep;break;case 4:n=aE;break;case 16:n=Vc;break;case 536870912:n=lE;break;default:n=Vc}n=DT(n,AT.bind(null,t))}t.callbackPriority=e,t.callbackNode=n}}function AT(t,e){if(vc=-1,_c=0,Ae&6)throw Error(q(327));var n=t.callbackNode;if(Ys()&&t.callbackNode!==n)return null;var r=jc(t,t===wt?Ct:0);if(r===0)return null;if(r&30||r&t.expiredLanes||e)e=tu(t,r);else{e=r;var i=Ae;Ae|=2;var s=xT();(wt!==t||Ct!==e)&&(gr=null,uo=ot()+500,Ji(t,e));do try{WR();break}catch(l){RT(t,l)}while(!0);Op(),Jc.current=s,Ae=i,ct!==null?e=0:(wt=null,Ct=0,e=mt)}if(e!==0){if(e===2&&(i=tf(t),i!==0&&(r=i,e=kf(t,i))),e===1)throw n=Ha,Ji(t,0),Qr(t,r),tn(t,ot()),n;if(e===6)Qr(t,r);else{if(i=t.current.alternate,!(r&30)&&!qR(i)&&(e=tu(t,r),e===2&&(s=tf(t),s!==0&&(r=s,e=kf(t,s))),e===1))throw n=Ha,Ji(t,0),Qr(t,r),tn(t,ot()),n;switch(t.finishedWork=i,t.finishedLanes=r,e){case 0:case 1:throw Error(q(345));case 2:qi(t,Qt,gr);break;case 3:if(Qr(t,r),(r&130023424)===r&&(e=Qp+500-ot(),10<e)){if(jc(t,0)!==0)break;if(i=t.suspendedLanes,(i&r)!==r){Bt(),t.pingedLanes|=t.suspendedLanes&i;break}t.timeoutHandle=uf(qi.bind(null,t,Qt,gr),e);break}qi(t,Qt,gr);break;case 4:if(Qr(t,r),(r&4194240)===r)break;for(e=t.eventTimes,i=-1;0<r;){var o=31-jn(r);s=1<<o,o=e[o],o>i&&(i=o),r&=~s}if(r=i,r=ot()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*zR(r/1960))-r,10<r){t.timeoutHandle=uf(qi.bind(null,t,Qt,gr),r);break}qi(t,Qt,gr);break;case 5:qi(t,Qt,gr);break;default:throw Error(q(329))}}}return tn(t,ot()),t.callbackNode===n?AT.bind(null,t):null}function kf(t,e){var n=wa;return t.current.memoizedState.isDehydrated&&(Ji(t,e).flags|=256),t=tu(t,e),t!==2&&(e=Qt,Qt=n,e!==null&&Nf(e)),t}function Nf(t){Qt===null?Qt=t:Qt.push.apply(Qt,t)}function qR(t){for(var e=t;;){if(e.flags&16384){var n=e.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var i=n[r],s=i.getSnapshot;i=i.value;try{if(!Fn(s(),i))return!1}catch{return!1}}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function Qr(t,e){for(e&=~Kp,e&=~Mu,t.suspendedLanes|=e,t.pingedLanes&=~e,t=t.expirationTimes;0<e;){var n=31-jn(e),r=1<<n;t[n]=-1,e&=~r}}function fv(t){if(Ae&6)throw Error(q(327));Ys();var e=jc(t,0);if(!(e&1))return tn(t,ot()),null;var n=tu(t,e);if(t.tag!==0&&n===2){var r=tf(t);r!==0&&(e=r,n=kf(t,r))}if(n===1)throw n=Ha,Ji(t,0),Qr(t,e),tn(t,ot()),n;if(n===6)throw Error(q(345));return t.finishedWork=t.current.alternate,t.finishedLanes=e,qi(t,Qt,gr),tn(t,ot()),null}function Yp(t,e){var n=Ae;Ae|=1;try{return t(e)}finally{Ae=n,Ae===0&&(uo=ot()+500,Ou&&Pi())}}function as(t){ri!==null&&ri.tag===0&&!(Ae&6)&&Ys();var e=Ae;Ae|=1;var n=Cn.transition,r=Le;try{if(Cn.transition=null,Le=1,t)return t()}finally{Le=r,Cn.transition=n,Ae=e,!(Ae&6)&&Pi()}}function Xp(){ln=zs.current,qe(zs)}function Ji(t,e){t.finishedWork=null,t.finishedLanes=0;var n=t.timeoutHandle;if(n!==-1&&(t.timeoutHandle=-1,wR(n)),ct!==null)for(n=ct.return;n!==null;){var r=n;switch(Np(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&Bc();break;case 3:lo(),qe(Zt),qe(Vt),Up();break;case 5:Fp(r);break;case 4:lo();break;case 13:qe(Qe);break;case 19:qe(Qe);break;case 10:Lp(r.type._context);break;case 22:case 23:Xp()}n=n.return}if(wt=t,ct=t=fi(t.current,null),Ct=ln=e,mt=0,Ha=null,Kp=Mu=os=0,Qt=wa=null,Ki!==null){for(e=0;e<Ki.length;e++)if(n=Ki[e],r=n.interleaved,r!==null){n.interleaved=null;var i=r.next,s=n.pending;if(s!==null){var o=s.next;s.next=i,r.next=o}n.pending=r}Ki=null}return t}function RT(t,e){do{var n=ct;try{if(Op(),mc.current=Xc,Yc){for(var r=Ye.memoizedState;r!==null;){var i=r.queue;i!==null&&(i.pending=null),r=r.next}Yc=!1}if(ss=0,_t=pt=Ye=null,va=!1,Ba=0,Gp.current=null,n===null||n.return===null){mt=1,Ha=e,ct=null;break}e:{var s=t,o=n.return,l=n,c=e;if(e=Ct,l.flags|=32768,c!==null&&typeof c=="object"&&typeof c.then=="function"){var u=c,f=l,p=f.tag;if(!(f.mode&1)&&(p===0||p===11||p===15)){var g=f.alternate;g?(f.updateQueue=g.updateQueue,f.memoizedState=g.memoizedState,f.lanes=g.lanes):(f.updateQueue=null,f.memoizedState=null)}var S=ev(o);if(S!==null){S.flags&=-257,tv(S,o,l,s,e),S.mode&1&&Zy(s,u,e),e=S,c=u;var v=e.updateQueue;if(v===null){var N=new Set;N.add(c),e.updateQueue=N}else v.add(c);break e}else{if(!(e&1)){Zy(s,u,e),Jp();break e}c=Error(q(426))}}else if(He&&l.mode&1){var b=ev(o);if(b!==null){!(b.flags&65536)&&(b.flags|=256),tv(b,o,l,s,e),bp(co(c,l));break e}}s=c=co(c,l),mt!==4&&(mt=2),wa===null?wa=[s]:wa.push(s),s=o;do{switch(s.tag){case 3:s.flags|=65536,e&=-e,s.lanes|=e;var I=uT(s,c,e);Gy(s,I);break e;case 1:l=c;var E=s.type,y=s.stateNode;if(!(s.flags&128)&&(typeof E.getDerivedStateFromError=="function"||y!==null&&typeof y.componentDidCatch=="function"&&(di===null||!di.has(y)))){s.flags|=65536,e&=-e,s.lanes|=e;var L=dT(s,l,e);Gy(s,L);break e}}s=s.return}while(s!==null)}kT(n)}catch($){e=$,ct===n&&n!==null&&(ct=n=n.return);continue}break}while(!0)}function xT(){var t=Jc.current;return Jc.current=Xc,t===null?Xc:t}function Jp(){(mt===0||mt===3||mt===2)&&(mt=4),wt===null||!(os&268435455)&&!(Mu&268435455)||Qr(wt,Ct)}function tu(t,e){var n=Ae;Ae|=2;var r=xT();(wt!==t||Ct!==e)&&(gr=null,Ji(t,e));do try{HR();break}catch(i){RT(t,i)}while(!0);if(Op(),Ae=n,Jc.current=r,ct!==null)throw Error(q(261));return wt=null,Ct=0,mt}function HR(){for(;ct!==null;)PT(ct)}function WR(){for(;ct!==null&&!yA();)PT(ct)}function PT(t){var e=bT(t.alternate,t,ln);t.memoizedProps=t.pendingProps,e===null?kT(t):ct=e,Gp.current=null}function kT(t){var e=t;do{var n=e.alternate;if(t=e.return,e.flags&32768){if(n=FR(n,e),n!==null){n.flags&=32767,ct=n;return}if(t!==null)t.flags|=32768,t.subtreeFlags=0,t.deletions=null;else{mt=6,ct=null;return}}else if(n=MR(n,e,ln),n!==null){ct=n;return}if(e=e.sibling,e!==null){ct=e;return}ct=e=t}while(e!==null);mt===0&&(mt=5)}function qi(t,e,n){var r=Le,i=Cn.transition;try{Cn.transition=null,Le=1,GR(t,e,n,r)}finally{Cn.transition=i,Le=r}return null}function GR(t,e,n,r){do Ys();while(ri!==null);if(Ae&6)throw Error(q(327));n=t.finishedWork;var i=t.finishedLanes;if(n===null)return null;if(t.finishedWork=null,t.finishedLanes=0,n===t.current)throw Error(q(177));t.callbackNode=null,t.callbackPriority=0;var s=n.lanes|n.childLanes;if(RA(t,s),t===wt&&(ct=wt=null,Ct=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||Yl||(Yl=!0,DT(Vc,function(){return Ys(),null})),s=(n.flags&15990)!==0,n.subtreeFlags&15990||s){s=Cn.transition,Cn.transition=null;var o=Le;Le=1;var l=Ae;Ae|=4,Gp.current=null,$R(t,n),ST(n,t),fR(lf),Mc=!!af,lf=af=null,t.current=n,BR(n),vA(),Ae=l,Le=o,Cn.transition=s}else t.current=n;if(Yl&&(Yl=!1,ri=t,eu=i),s=t.pendingLanes,s===0&&(di=null),EA(n.stateNode),tn(t,ot()),e!==null)for(r=t.onRecoverableError,n=0;n<e.length;n++)i=e[n],r(i.value,{componentStack:i.stack,digest:i.digest});if(Zc)throw Zc=!1,t=xf,xf=null,t;return eu&1&&t.tag!==0&&Ys(),s=t.pendingLanes,s&1?t===Pf?Ea++:(Ea=0,Pf=t):Ea=0,Pi(),null}function Ys(){if(ri!==null){var t=uE(eu),e=Cn.transition,n=Le;try{if(Cn.transition=null,Le=16>t?16:t,ri===null)var r=!1;else{if(t=ri,ri=null,eu=0,Ae&6)throw Error(q(331));var i=Ae;for(Ae|=4,ee=t.current;ee!==null;){var s=ee,o=s.child;if(ee.flags&16){var l=s.deletions;if(l!==null){for(var c=0;c<l.length;c++){var u=l[c];for(ee=u;ee!==null;){var f=ee;switch(f.tag){case 0:case 11:case 15:_a(8,f,s)}var p=f.child;if(p!==null)p.return=f,ee=p;else for(;ee!==null;){f=ee;var g=f.sibling,S=f.return;if(ET(f),f===u){ee=null;break}if(g!==null){g.return=S,ee=g;break}ee=S}}}var v=s.alternate;if(v!==null){var N=v.child;if(N!==null){v.child=null;do{var b=N.sibling;N.sibling=null,N=b}while(N!==null)}}ee=s}}if(s.subtreeFlags&2064&&o!==null)o.return=s,ee=o;else e:for(;ee!==null;){if(s=ee,s.flags&2048)switch(s.tag){case 0:case 11:case 15:_a(9,s,s.return)}var I=s.sibling;if(I!==null){I.return=s.return,ee=I;break e}ee=s.return}}var E=t.current;for(ee=E;ee!==null;){o=ee;var y=o.child;if(o.subtreeFlags&2064&&y!==null)y.return=o,ee=y;else e:for(o=E;ee!==null;){if(l=ee,l.flags&2048)try{switch(l.tag){case 0:case 11:case 15:ju(9,l)}}catch($){et(l,l.return,$)}if(l===o){ee=null;break e}var L=l.sibling;if(L!==null){L.return=l.return,ee=L;break e}ee=l.return}}if(Ae=i,Pi(),tr&&typeof tr.onPostCommitFiberRoot=="function")try{tr.onPostCommitFiberRoot(Pu,t)}catch{}r=!0}return r}finally{Le=n,Cn.transition=e}}return!1}function pv(t,e,n){e=co(n,e),e=uT(t,e,1),t=ui(t,e,1),e=Bt(),t!==null&&(il(t,1,e),tn(t,e))}function et(t,e,n){if(t.tag===3)pv(t,t,n);else for(;e!==null;){if(e.tag===3){pv(e,t,n);break}else if(e.tag===1){var r=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(di===null||!di.has(r))){t=co(n,t),t=dT(e,t,1),e=ui(e,t,1),t=Bt(),e!==null&&(il(e,1,t),tn(e,t));break}}e=e.return}}function KR(t,e,n){var r=t.pingCache;r!==null&&r.delete(e),e=Bt(),t.pingedLanes|=t.suspendedLanes&n,wt===t&&(Ct&n)===n&&(mt===4||mt===3&&(Ct&130023424)===Ct&&500>ot()-Qp?Ji(t,0):Kp|=n),tn(t,e)}function NT(t,e){e===0&&(t.mode&1?(e=Ul,Ul<<=1,!(Ul&130023424)&&(Ul=4194304)):e=1);var n=Bt();t=Ar(t,e),t!==null&&(il(t,e,n),tn(t,n))}function QR(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),NT(t,n)}function YR(t,e){var n=0;switch(t.tag){case 13:var r=t.stateNode,i=t.memoizedState;i!==null&&(n=i.retryLane);break;case 19:r=t.stateNode;break;default:throw Error(q(314))}r!==null&&r.delete(e),NT(t,n)}var bT;bT=function(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps||Zt.current)Jt=!0;else{if(!(t.lanes&n)&&!(e.flags&128))return Jt=!1,jR(t,e,n);Jt=!!(t.flags&131072)}else Jt=!1,He&&e.flags&1048576&&VE(e,Hc,e.index);switch(e.lanes=0,e.tag){case 2:var r=e.type;yc(t,e),t=e.pendingProps;var i=so(e,Vt.current);Qs(e,n),i=Bp(null,e,r,t,i,n);var s=zp();return e.flags|=1,typeof i=="object"&&i!==null&&typeof i.render=="function"&&i.$$typeof===void 0?(e.tag=1,e.memoizedState=null,e.updateQueue=null,en(r)?(s=!0,zc(e)):s=!1,e.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,jp(e),i.updater=Vu,e.stateNode=i,i._reactInternals=e,yf(e,r,t,n),e=wf(null,e,r,!0,s,n)):(e.tag=0,He&&s&&kp(e),Ut(null,e,i,n),e=e.child),e;case 16:r=e.elementType;e:{switch(yc(t,e),t=e.pendingProps,i=r._init,r=i(r._payload),e.type=r,i=e.tag=JR(r),t=Dn(r,t),i){case 0:e=_f(null,e,r,t,n);break e;case 1:e=iv(null,e,r,t,n);break e;case 11:e=nv(null,e,r,t,n);break e;case 14:e=rv(null,e,r,Dn(r.type,t),n);break e}throw Error(q(306,r,""))}return e;case 0:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:Dn(r,i),_f(t,e,r,i,n);case 1:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:Dn(r,i),iv(t,e,r,i,n);case 3:e:{if(mT(e),t===null)throw Error(q(387));r=e.pendingProps,s=e.memoizedState,i=s.element,BE(t,e),Kc(e,r,null,n);var o=e.memoizedState;if(r=o.element,s.isDehydrated)if(s={element:r,isDehydrated:!1,cache:o.cache,pendingSuspenseBoundaries:o.pendingSuspenseBoundaries,transitions:o.transitions},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){i=co(Error(q(423)),e),e=sv(t,e,r,n,i);break e}else if(r!==i){i=co(Error(q(424)),e),e=sv(t,e,r,n,i);break e}else for(cn=ci(e.stateNode.containerInfo.firstChild),dn=e,He=!0,Ln=null,n=UE(e,null,r,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(oo(),r===i){e=Rr(t,e,n);break e}Ut(t,e,r,n)}e=e.child}return e;case 5:return zE(e),t===null&&pf(e),r=e.type,i=e.pendingProps,s=t!==null?t.memoizedProps:null,o=i.children,cf(r,i)?o=null:s!==null&&cf(r,s)&&(e.flags|=32),pT(t,e),Ut(t,e,o,n),e.child;case 6:return t===null&&pf(e),null;case 13:return gT(t,e,n);case 4:return Mp(e,e.stateNode.containerInfo),r=e.pendingProps,t===null?e.child=ao(e,null,r,n):Ut(t,e,r,n),e.child;case 11:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:Dn(r,i),nv(t,e,r,i,n);case 7:return Ut(t,e,e.pendingProps,n),e.child;case 8:return Ut(t,e,e.pendingProps.children,n),e.child;case 12:return Ut(t,e,e.pendingProps.children,n),e.child;case 10:e:{if(r=e.type._context,i=e.pendingProps,s=e.memoizedProps,o=i.value,Ue(Wc,r._currentValue),r._currentValue=o,s!==null)if(Fn(s.value,o)){if(s.children===i.children&&!Zt.current){e=Rr(t,e,n);break e}}else for(s=e.child,s!==null&&(s.return=e);s!==null;){var l=s.dependencies;if(l!==null){o=s.child;for(var c=l.firstContext;c!==null;){if(c.context===r){if(s.tag===1){c=Tr(-1,n&-n),c.tag=2;var u=s.updateQueue;if(u!==null){u=u.shared;var f=u.pending;f===null?c.next=c:(c.next=f.next,f.next=c),u.pending=c}}s.lanes|=n,c=s.alternate,c!==null&&(c.lanes|=n),mf(s.return,n,e),l.lanes|=n;break}c=c.next}}else if(s.tag===10)o=s.type===e.type?null:s.child;else if(s.tag===18){if(o=s.return,o===null)throw Error(q(341));o.lanes|=n,l=o.alternate,l!==null&&(l.lanes|=n),mf(o,n,e),o=s.sibling}else o=s.child;if(o!==null)o.return=s;else for(o=s;o!==null;){if(o===e){o=null;break}if(s=o.sibling,s!==null){s.return=o.return,o=s;break}o=o.return}s=o}Ut(t,e,i.children,n),e=e.child}return e;case 9:return i=e.type,r=e.pendingProps.children,Qs(e,n),i=Rn(i),r=r(i),e.flags|=1,Ut(t,e,r,n),e.child;case 14:return r=e.type,i=Dn(r,e.pendingProps),i=Dn(r.type,i),rv(t,e,r,i,n);case 15:return hT(t,e,e.type,e.pendingProps,n);case 17:return r=e.type,i=e.pendingProps,i=e.elementType===r?i:Dn(r,i),yc(t,e),e.tag=1,en(r)?(t=!0,zc(e)):t=!1,Qs(e,n),cT(e,r,i),yf(e,r,i,n),wf(null,e,r,!0,t,n);case 19:return yT(t,e,n);case 22:return fT(t,e,n)}throw Error(q(156,e.tag))};function DT(t,e){return oE(t,e)}function XR(t,e,n,r){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Sn(t,e,n,r){return new XR(t,e,n,r)}function Zp(t){return t=t.prototype,!(!t||!t.isReactComponent)}function JR(t){if(typeof t=="function")return Zp(t)?1:0;if(t!=null){if(t=t.$$typeof,t===vp)return 11;if(t===_p)return 14}return 2}function fi(t,e){var n=t.alternate;return n===null?(n=Sn(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&14680064,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n}function wc(t,e,n,r,i,s){var o=2;if(r=t,typeof t=="function")Zp(t)&&(o=1);else if(typeof t=="string")o=5;else e:switch(t){case Ds:return Zi(n.children,i,s,e);case yp:o=8,i|=8;break;case Uh:return t=Sn(12,n,e,i|2),t.elementType=Uh,t.lanes=s,t;case $h:return t=Sn(13,n,e,i),t.elementType=$h,t.lanes=s,t;case Bh:return t=Sn(19,n,e,i),t.elementType=Bh,t.lanes=s,t;case zw:return Fu(n,i,s,e);default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case $w:o=10;break e;case Bw:o=9;break e;case vp:o=11;break e;case _p:o=14;break e;case Wr:o=16,r=null;break e}throw Error(q(130,t==null?t:typeof t,""))}return e=Sn(o,n,e,i),e.elementType=t,e.type=r,e.lanes=s,e}function Zi(t,e,n,r){return t=Sn(7,t,r,e),t.lanes=n,t}function Fu(t,e,n,r){return t=Sn(22,t,r,e),t.elementType=zw,t.lanes=n,t.stateNode={isHidden:!1},t}function dh(t,e,n){return t=Sn(6,t,null,e),t.lanes=n,t}function hh(t,e,n){return e=Sn(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}function ZR(t,e,n,r,i){this.tag=e,this.containerInfo=t,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Wd(0),this.expirationTimes=Wd(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Wd(0),this.identifierPrefix=r,this.onRecoverableError=i,this.mutableSourceEagerHydrationData=null}function em(t,e,n,r,i,s,o,l,c){return t=new ZR(t,e,n,l,c),e===1?(e=1,s===!0&&(e|=8)):e=0,s=Sn(3,null,null,e),t.current=s,s.stateNode=t,s.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},jp(s),t}function ex(t,e,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:bs,key:r==null?null:""+r,children:t,containerInfo:e,implementation:n}}function OT(t){if(!t)return wi;t=t._reactInternals;e:{if(ms(t)!==t||t.tag!==1)throw Error(q(170));var e=t;do{switch(e.tag){case 3:e=e.stateNode.context;break e;case 1:if(en(e.type)){e=e.stateNode.__reactInternalMemoizedMergedChildContext;break e}}e=e.return}while(e!==null);throw Error(q(171))}if(t.tag===1){var n=t.type;if(en(n))return OE(t,n,e)}return e}function LT(t,e,n,r,i,s,o,l,c){return t=em(n,r,!0,t,i,s,o,l,c),t.context=OT(null),n=t.current,r=Bt(),i=hi(n),s=Tr(r,i),s.callback=e??null,ui(n,s,i),t.current.lanes=i,il(t,i,r),tn(t,r),t}function Uu(t,e,n,r){var i=e.current,s=Bt(),o=hi(i);return n=OT(n),e.context===null?e.context=n:e.pendingContext=n,e=Tr(s,o),e.payload={element:t},r=r===void 0?null:r,r!==null&&(e.callback=r),t=ui(i,e,o),t!==null&&(Mn(t,i,o,s),pc(t,i,o)),o}function nu(t){if(t=t.current,!t.child)return null;switch(t.child.tag){case 5:return t.child.stateNode;default:return t.child.stateNode}}function mv(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function tm(t,e){mv(t,e),(t=t.alternate)&&mv(t,e)}function tx(){return null}var VT=typeof reportError=="function"?reportError:function(t){console.error(t)};function nm(t){this._internalRoot=t}$u.prototype.render=nm.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(q(409));Uu(t,e,null,null)};$u.prototype.unmount=nm.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;as(function(){Uu(null,t,null,null)}),e[Cr]=null}};function $u(t){this._internalRoot=t}$u.prototype.unstable_scheduleHydration=function(t){if(t){var e=fE();t={blockedOn:null,target:t,priority:e};for(var n=0;n<Kr.length&&e!==0&&e<Kr[n].priority;n++);Kr.splice(n,0,t),n===0&&mE(t)}};function rm(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function Bu(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11&&(t.nodeType!==8||t.nodeValue!==" react-mount-point-unstable "))}function gv(){}function nx(t,e,n,r,i){if(i){if(typeof r=="function"){var s=r;r=function(){var u=nu(o);s.call(u)}}var o=LT(e,r,t,0,null,!1,!1,"",gv);return t._reactRootContainer=o,t[Cr]=o.current,ja(t.nodeType===8?t.parentNode:t),as(),o}for(;i=t.lastChild;)t.removeChild(i);if(typeof r=="function"){var l=r;r=function(){var u=nu(c);l.call(u)}}var c=em(t,0,!1,null,null,!1,!1,"",gv);return t._reactRootContainer=c,t[Cr]=c.current,ja(t.nodeType===8?t.parentNode:t),as(function(){Uu(e,c,n,r)}),c}function zu(t,e,n,r,i){var s=n._reactRootContainer;if(s){var o=s;if(typeof i=="function"){var l=i;i=function(){var c=nu(o);l.call(c)}}Uu(e,o,t,i)}else o=nx(n,e,t,i,r);return nu(o)}dE=function(t){switch(t.tag){case 3:var e=t.stateNode;if(e.current.memoizedState.isDehydrated){var n=ia(e.pendingLanes);n!==0&&(Tp(e,n|1),tn(e,ot()),!(Ae&6)&&(uo=ot()+500,Pi()))}break;case 13:as(function(){var r=Ar(t,1);if(r!==null){var i=Bt();Mn(r,t,1,i)}}),tm(t,1)}};Ip=function(t){if(t.tag===13){var e=Ar(t,134217728);if(e!==null){var n=Bt();Mn(e,t,134217728,n)}tm(t,134217728)}};hE=function(t){if(t.tag===13){var e=hi(t),n=Ar(t,e);if(n!==null){var r=Bt();Mn(n,t,e,r)}tm(t,e)}};fE=function(){return Le};pE=function(t,e){var n=Le;try{return Le=t,e()}finally{Le=n}};Jh=function(t,e,n){switch(e){case"input":if(Hh(t,n),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+e)+'][type="radio"]'),e=0;e<n.length;e++){var r=n[e];if(r!==t&&r.form===t.form){var i=Du(r);if(!i)throw Error(q(90));Hw(r),Hh(r,i)}}}break;case"textarea":Gw(t,n);break;case"select":e=n.value,e!=null&&Hs(t,!!n.multiple,e,!1)}};eE=Yp;tE=as;var rx={usingClientEntryPoint:!1,Events:[ol,js,Du,Jw,Zw,Yp]},Jo={findFiberByHostInstance:Gi,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},ix={bundleType:Jo.bundleType,version:Jo.version,rendererPackageName:Jo.rendererPackageName,rendererConfig:Jo.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:Or.ReactCurrentDispatcher,findHostInstanceByFiber:function(t){return t=iE(t),t===null?null:t.stateNode},findFiberByHostInstance:Jo.findFiberByHostInstance||tx,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Xl=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Xl.isDisabled&&Xl.supportsFiber)try{Pu=Xl.inject(ix),tr=Xl}catch{}}mn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=rx;mn.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!rm(e))throw Error(q(200));return ex(t,e,null,n)};mn.createRoot=function(t,e){if(!rm(t))throw Error(q(299));var n=!1,r="",i=VT;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(r=e.identifierPrefix),e.onRecoverableError!==void 0&&(i=e.onRecoverableError)),e=em(t,1,!1,null,null,n,!1,r,i),t[Cr]=e.current,ja(t.nodeType===8?t.parentNode:t),new nm(e)};mn.findDOMNode=function(t){if(t==null)return null;if(t.nodeType===1)return t;var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(q(188)):(t=Object.keys(t).join(","),Error(q(268,t)));return t=iE(e),t=t===null?null:t.stateNode,t};mn.flushSync=function(t){return as(t)};mn.hydrate=function(t,e,n){if(!Bu(e))throw Error(q(200));return zu(null,t,e,!0,n)};mn.hydrateRoot=function(t,e,n){if(!rm(t))throw Error(q(405));var r=n!=null&&n.hydratedSources||null,i=!1,s="",o=VT;if(n!=null&&(n.unstable_strictMode===!0&&(i=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onRecoverableError!==void 0&&(o=n.onRecoverableError)),e=LT(e,null,t,1,n??null,i,!1,s,o),t[Cr]=e.current,ja(t),r)for(t=0;t<r.length;t++)n=r[t],i=n._getVersion,i=i(n._source),e.mutableSourceEagerHydrationData==null?e.mutableSourceEagerHydrationData=[n,i]:e.mutableSourceEagerHydrationData.push(n,i);return new $u(e)};mn.render=function(t,e,n){if(!Bu(e))throw Error(q(200));return zu(null,t,e,!1,n)};mn.unmountComponentAtNode=function(t){if(!Bu(t))throw Error(q(40));return t._reactRootContainer?(as(function(){zu(null,null,t,!1,function(){t._reactRootContainer=null,t[Cr]=null})}),!0):!1};mn.unstable_batchedUpdates=Yp;mn.unstable_renderSubtreeIntoContainer=function(t,e,n,r){if(!Bu(n))throw Error(q(200));if(t==null||t._reactInternals===void 0)throw Error(q(38));return zu(t,e,n,!1,r)};mn.version="18.3.1-next-f1338f8080-20240426";function jT(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(jT)}catch(t){console.error(t)}}jT(),jw.exports=mn;var sx=jw.exports,MT,yv=sx;MT=yv.createRoot,yv.hydrateRoot;/**
 * react-router v7.9.6
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */var vv="popstate";function ox(t={}){function e(i,s){let{pathname:o="/",search:l="",hash:c=""}=gs(i.location.hash.substring(1));return!o.startsWith("/")&&!o.startsWith(".")&&(o="/"+o),bf("",{pathname:o,search:l,hash:c},s.state&&s.state.usr||null,s.state&&s.state.key||"default")}function n(i,s){let o=i.document.querySelector("base"),l="";if(o&&o.getAttribute("href")){let c=i.location.href,u=c.indexOf("#");l=u===-1?c:c.slice(0,u)}return l+"#"+(typeof s=="string"?s:Wa(s))}function r(i,s){pn(i.pathname.charAt(0)==="/",`relative pathnames are not supported in hash history.push(${JSON.stringify(s)})`)}return lx(e,n,r,t)}function We(t,e){if(t===!1||t===null||typeof t>"u")throw new Error(e)}function pn(t,e){if(!t){typeof console<"u"&&console.warn(e);try{throw new Error(e)}catch{}}}function ax(){return Math.random().toString(36).substring(2,10)}function _v(t,e){return{usr:t.state,key:t.key,idx:e}}function bf(t,e,n=null,r){return{pathname:typeof t=="string"?t:t.pathname,search:"",hash:"",...typeof e=="string"?gs(e):e,state:n,key:e&&e.key||r||ax()}}function Wa({pathname:t="/",search:e="",hash:n=""}){return e&&e!=="?"&&(t+=e.charAt(0)==="?"?e:"?"+e),n&&n!=="#"&&(t+=n.charAt(0)==="#"?n:"#"+n),t}function gs(t){let e={};if(t){let n=t.indexOf("#");n>=0&&(e.hash=t.substring(n),t=t.substring(0,n));let r=t.indexOf("?");r>=0&&(e.search=t.substring(r),t=t.substring(0,r)),t&&(e.pathname=t)}return e}function lx(t,e,n,r={}){let{window:i=document.defaultView,v5Compat:s=!1}=r,o=i.history,l="POP",c=null,u=f();u==null&&(u=0,o.replaceState({...o.state,idx:u},""));function f(){return(o.state||{idx:null}).idx}function p(){l="POP";let b=f(),I=b==null?null:b-u;u=b,c&&c({action:l,location:N.location,delta:I})}function g(b,I){l="PUSH";let E=bf(N.location,b,I);n&&n(E,b),u=f()+1;let y=_v(E,u),L=N.createHref(E);try{o.pushState(y,"",L)}catch($){if($ instanceof DOMException&&$.name==="DataCloneError")throw $;i.location.assign(L)}s&&c&&c({action:l,location:N.location,delta:1})}function S(b,I){l="REPLACE";let E=bf(N.location,b,I);n&&n(E,b),u=f();let y=_v(E,u),L=N.createHref(E);o.replaceState(y,"",L),s&&c&&c({action:l,location:N.location,delta:0})}function v(b){return cx(b)}let N={get action(){return l},get location(){return t(i,o)},listen(b){if(c)throw new Error("A history only accepts one active listener");return i.addEventListener(vv,p),c=b,()=>{i.removeEventListener(vv,p),c=null}},createHref(b){return e(i,b)},createURL:v,encodeLocation(b){let I=v(b);return{pathname:I.pathname,search:I.search,hash:I.hash}},push:g,replace:S,go(b){return o.go(b)}};return N}function cx(t,e=!1){let n="http://localhost";typeof window<"u"&&(n=window.location.origin!=="null"?window.location.origin:window.location.href),We(n,"No window.location.(origin|href) available to create URL");let r=typeof t=="string"?t:Wa(t);return r=r.replace(/ $/,"%20"),!e&&r.startsWith("//")&&(r=n+r),new URL(r,n)}function FT(t,e,n="/"){return ux(t,e,n,!1)}function ux(t,e,n,r){let i=typeof e=="string"?gs(e):e,s=xr(i.pathname||"/",n);if(s==null)return null;let o=UT(t);dx(o);let l=null;for(let c=0;l==null&&c<o.length;++c){let u=Tx(s);l=wx(o[c],u,r)}return l}function UT(t,e=[],n=[],r="",i=!1){let s=(o,l,c=i,u)=>{let f={relativePath:u===void 0?o.path||"":u,caseSensitive:o.caseSensitive===!0,childrenIndex:l,route:o};if(f.relativePath.startsWith("/")){if(!f.relativePath.startsWith(r)&&c)return;We(f.relativePath.startsWith(r),`Absolute route path "${f.relativePath}" nested under path "${r}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`),f.relativePath=f.relativePath.slice(r.length)}let p=Ir([r,f.relativePath]),g=n.concat(f);o.children&&o.children.length>0&&(We(o.index!==!0,`Index routes must not have child routes. Please remove all child routes from route path "${p}".`),UT(o.children,e,g,p,c)),!(o.path==null&&!o.index)&&e.push({path:p,score:vx(p,o.index),routesMeta:g})};return t.forEach((o,l)=>{var c;if(o.path===""||!((c=o.path)!=null&&c.includes("?")))s(o,l);else for(let u of $T(o.path))s(o,l,!0,u)}),e}function $T(t){let e=t.split("/");if(e.length===0)return[];let[n,...r]=e,i=n.endsWith("?"),s=n.replace(/\?$/,"");if(r.length===0)return i?[s,""]:[s];let o=$T(r.join("/")),l=[];return l.push(...o.map(c=>c===""?s:[s,c].join("/"))),i&&l.push(...o),l.map(c=>t.startsWith("/")&&c===""?"/":c)}function dx(t){t.sort((e,n)=>e.score!==n.score?n.score-e.score:_x(e.routesMeta.map(r=>r.childrenIndex),n.routesMeta.map(r=>r.childrenIndex)))}var hx=/^:[\w-]+$/,fx=3,px=2,mx=1,gx=10,yx=-2,wv=t=>t==="*";function vx(t,e){let n=t.split("/"),r=n.length;return n.some(wv)&&(r+=yx),e&&(r+=px),n.filter(i=>!wv(i)).reduce((i,s)=>i+(hx.test(s)?fx:s===""?mx:gx),r)}function _x(t,e){return t.length===e.length&&t.slice(0,-1).every((r,i)=>r===e[i])?t[t.length-1]-e[e.length-1]:0}function wx(t,e,n=!1){let{routesMeta:r}=t,i={},s="/",o=[];for(let l=0;l<r.length;++l){let c=r[l],u=l===r.length-1,f=s==="/"?e:e.slice(s.length)||"/",p=ru({path:c.relativePath,caseSensitive:c.caseSensitive,end:u},f),g=c.route;if(!p&&u&&n&&!r[r.length-1].route.index&&(p=ru({path:c.relativePath,caseSensitive:c.caseSensitive,end:!1},f)),!p)return null;Object.assign(i,p.params),o.push({params:i,pathname:Ir([s,p.pathname]),pathnameBase:Rx(Ir([s,p.pathnameBase])),route:g}),p.pathnameBase!=="/"&&(s=Ir([s,p.pathnameBase]))}return o}function ru(t,e){typeof t=="string"&&(t={path:t,caseSensitive:!1,end:!0});let[n,r]=Ex(t.path,t.caseSensitive,t.end),i=e.match(n);if(!i)return null;let s=i[0],o=s.replace(/(.)\/+$/,"$1"),l=i.slice(1);return{params:r.reduce((u,{paramName:f,isOptional:p},g)=>{if(f==="*"){let v=l[g]||"";o=s.slice(0,s.length-v.length).replace(/(.)\/+$/,"$1")}const S=l[g];return p&&!S?u[f]=void 0:u[f]=(S||"").replace(/%2F/g,"/"),u},{}),pathname:s,pathnameBase:o,pattern:t}}function Ex(t,e=!1,n=!0){pn(t==="*"||!t.endsWith("*")||t.endsWith("/*"),`Route path "${t}" will be treated as if it were "${t.replace(/\*$/,"/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${t.replace(/\*$/,"/*")}".`);let r=[],i="^"+t.replace(/\/*\*?$/,"").replace(/^\/*/,"/").replace(/[\\.*+^${}|()[\]]/g,"\\$&").replace(/\/:([\w-]+)(\?)?/g,(o,l,c)=>(r.push({paramName:l,isOptional:c!=null}),c?"/?([^\\/]+)?":"/([^\\/]+)")).replace(/\/([\w-]+)\?(\/|$)/g,"(/$1)?$2");return t.endsWith("*")?(r.push({paramName:"*"}),i+=t==="*"||t==="/*"?"(.*)$":"(?:\\/(.+)|\\/*)$"):n?i+="\\/*$":t!==""&&t!=="/"&&(i+="(?:(?=\\/|$))"),[new RegExp(i,e?void 0:"i"),r]}function Tx(t){try{return t.split("/").map(e=>decodeURIComponent(e).replace(/\//g,"%2F")).join("/")}catch(e){return pn(!1,`The URL path "${t}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${e}).`),t}}function xr(t,e){if(e==="/")return t;if(!t.toLowerCase().startsWith(e.toLowerCase()))return null;let n=e.endsWith("/")?e.length-1:e.length,r=t.charAt(n);return r&&r!=="/"?null:t.slice(n)||"/"}var Ix=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,Sx=t=>Ix.test(t);function Cx(t,e="/"){let{pathname:n,search:r="",hash:i=""}=typeof t=="string"?gs(t):t,s;if(n)if(Sx(n))s=n;else{if(n.includes("//")){let o=n;n=n.replace(/\/\/+/g,"/"),pn(!1,`Pathnames cannot have embedded double slashes - normalizing ${o} -> ${n}`)}n.startsWith("/")?s=Ev(n.substring(1),"/"):s=Ev(n,e)}else s=e;return{pathname:s,search:xx(r),hash:Px(i)}}function Ev(t,e){let n=e.replace(/\/+$/,"").split("/");return t.split("/").forEach(i=>{i===".."?n.length>1&&n.pop():i!=="."&&n.push(i)}),n.length>1?n.join("/"):"/"}function fh(t,e,n,r){return`Cannot include a '${t}' character in a manually specified \`to.${e}\` field [${JSON.stringify(r)}].  Please separate it out to the \`to.${n}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`}function Ax(t){return t.filter((e,n)=>n===0||e.route.path&&e.route.path.length>0)}function im(t){let e=Ax(t);return e.map((n,r)=>r===e.length-1?n.pathname:n.pathnameBase)}function sm(t,e,n,r=!1){let i;typeof t=="string"?i=gs(t):(i={...t},We(!i.pathname||!i.pathname.includes("?"),fh("?","pathname","search",i)),We(!i.pathname||!i.pathname.includes("#"),fh("#","pathname","hash",i)),We(!i.search||!i.search.includes("#"),fh("#","search","hash",i)));let s=t===""||i.pathname==="",o=s?"/":i.pathname,l;if(o==null)l=n;else{let p=e.length-1;if(!r&&o.startsWith("..")){let g=o.split("/");for(;g[0]==="..";)g.shift(),p-=1;i.pathname=g.join("/")}l=p>=0?e[p]:"/"}let c=Cx(i,l),u=o&&o!=="/"&&o.endsWith("/"),f=(s||o===".")&&n.endsWith("/");return!c.pathname.endsWith("/")&&(u||f)&&(c.pathname+="/"),c}var Ir=t=>t.join("/").replace(/\/\/+/g,"/"),Rx=t=>t.replace(/\/+$/,"").replace(/^\/*/,"/"),xx=t=>!t||t==="?"?"":t.startsWith("?")?t:"?"+t,Px=t=>!t||t==="#"?"":t.startsWith("#")?t:"#"+t;function kx(t){return t!=null&&typeof t.status=="number"&&typeof t.statusText=="string"&&typeof t.internal=="boolean"&&"data"in t}Object.getOwnPropertyNames(Object.prototype).sort().join("\0");var BT=["POST","PUT","PATCH","DELETE"];new Set(BT);var Nx=["GET",...BT];new Set(Nx);var So=D.createContext(null);So.displayName="DataRouter";var qu=D.createContext(null);qu.displayName="DataRouterState";D.createContext(!1);var zT=D.createContext({isTransitioning:!1});zT.displayName="ViewTransition";var bx=D.createContext(new Map);bx.displayName="Fetchers";var Dx=D.createContext(null);Dx.displayName="Await";var zn=D.createContext(null);zn.displayName="Navigation";var ll=D.createContext(null);ll.displayName="Location";var hr=D.createContext({outlet:null,matches:[],isDataRoute:!1});hr.displayName="Route";var om=D.createContext(null);om.displayName="RouteError";function Ox(t,{relative:e}={}){We(Co(),"useHref() may be used only in the context of a <Router> component.");let{basename:n,navigator:r}=D.useContext(zn),{hash:i,pathname:s,search:o}=cl(t,{relative:e}),l=s;return n!=="/"&&(l=s==="/"?n:Ir([n,s])),r.createHref({pathname:l,search:o,hash:i})}function Co(){return D.useContext(ll)!=null}function ki(){return We(Co(),"useLocation() may be used only in the context of a <Router> component."),D.useContext(ll).location}var qT="You should call navigate() in a React.useEffect(), not when your component is first rendered.";function HT(t){D.useContext(zn).static||D.useLayoutEffect(t)}function am(){let{isDataRoute:t}=D.useContext(hr);return t?Gx():Lx()}function Lx(){We(Co(),"useNavigate() may be used only in the context of a <Router> component.");let t=D.useContext(So),{basename:e,navigator:n}=D.useContext(zn),{matches:r}=D.useContext(hr),{pathname:i}=ki(),s=JSON.stringify(im(r)),o=D.useRef(!1);return HT(()=>{o.current=!0}),D.useCallback((c,u={})=>{if(pn(o.current,qT),!o.current)return;if(typeof c=="number"){n.go(c);return}let f=sm(c,JSON.parse(s),i,u.relative==="path");t==null&&e!=="/"&&(f.pathname=f.pathname==="/"?e:Ir([e,f.pathname])),(u.replace?n.replace:n.push)(f,u.state,u)},[e,n,s,i,t])}D.createContext(null);function cl(t,{relative:e}={}){let{matches:n}=D.useContext(hr),{pathname:r}=ki(),i=JSON.stringify(im(n));return D.useMemo(()=>sm(t,JSON.parse(i),r,e==="path"),[t,i,r,e])}function Vx(t,e){return WT(t,e)}function WT(t,e,n,r,i){var E;We(Co(),"useRoutes() may be used only in the context of a <Router> component.");let{navigator:s}=D.useContext(zn),{matches:o}=D.useContext(hr),l=o[o.length-1],c=l?l.params:{},u=l?l.pathname:"/",f=l?l.pathnameBase:"/",p=l&&l.route;{let y=p&&p.path||"";GT(u,!p||y.endsWith("*")||y.endsWith("*?"),`You rendered descendant <Routes> (or called \`useRoutes()\`) at "${u}" (under <Route path="${y}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${y}"> to <Route path="${y==="/"?"*":`${y}/*`}">.`)}let g=ki(),S;if(e){let y=typeof e=="string"?gs(e):e;We(f==="/"||((E=y.pathname)==null?void 0:E.startsWith(f)),`When overriding the location using \`<Routes location>\` or \`useRoutes(routes, location)\`, the location pathname must begin with the portion of the URL pathname that was matched by all parent routes. The current pathname base is "${f}" but pathname "${y.pathname}" was given in the \`location\` prop.`),S=y}else S=g;let v=S.pathname||"/",N=v;if(f!=="/"){let y=f.replace(/^\//,"").split("/");N="/"+v.replace(/^\//,"").split("/").slice(y.length).join("/")}let b=FT(t,{pathname:N});pn(p||b!=null,`No routes matched location "${S.pathname}${S.search}${S.hash}" `),pn(b==null||b[b.length-1].route.element!==void 0||b[b.length-1].route.Component!==void 0||b[b.length-1].route.lazy!==void 0,`Matched leaf route at location "${S.pathname}${S.search}${S.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`);let I=$x(b&&b.map(y=>Object.assign({},y,{params:Object.assign({},c,y.params),pathname:Ir([f,s.encodeLocation?s.encodeLocation(y.pathname.replace(/\?/g,"%3F").replace(/#/g,"%23")).pathname:y.pathname]),pathnameBase:y.pathnameBase==="/"?f:Ir([f,s.encodeLocation?s.encodeLocation(y.pathnameBase.replace(/\?/g,"%3F").replace(/#/g,"%23")).pathname:y.pathnameBase])})),o,n,r,i);return e&&I?D.createElement(ll.Provider,{value:{location:{pathname:"/",search:"",hash:"",state:null,key:"default",...S},navigationType:"POP"}},I):I}function jx(){let t=Wx(),e=kx(t)?`${t.status} ${t.statusText}`:t instanceof Error?t.message:JSON.stringify(t),n=t instanceof Error?t.stack:null,r="rgba(200,200,200, 0.5)",i={padding:"0.5rem",backgroundColor:r},s={padding:"2px 4px",backgroundColor:r},o=null;return console.error("Error handled by React Router default ErrorBoundary:",t),o=D.createElement(D.Fragment,null,D.createElement("p",null,"💿 Hey developer 👋"),D.createElement("p",null,"You can provide a way better UX than this when your app throws errors by providing your own ",D.createElement("code",{style:s},"ErrorBoundary")," or"," ",D.createElement("code",{style:s},"errorElement")," prop on your route.")),D.createElement(D.Fragment,null,D.createElement("h2",null,"Unexpected Application Error!"),D.createElement("h3",{style:{fontStyle:"italic"}},e),n?D.createElement("pre",{style:i},n):null,o)}var Mx=D.createElement(jx,null),Fx=class extends D.Component{constructor(t){super(t),this.state={location:t.location,revalidation:t.revalidation,error:t.error}}static getDerivedStateFromError(t){return{error:t}}static getDerivedStateFromProps(t,e){return e.location!==t.location||e.revalidation!=="idle"&&t.revalidation==="idle"?{error:t.error,location:t.location,revalidation:t.revalidation}:{error:t.error!==void 0?t.error:e.error,location:e.location,revalidation:t.revalidation||e.revalidation}}componentDidCatch(t,e){this.props.onError?this.props.onError(t,e):console.error("React Router caught the following error during render",t)}render(){return this.state.error!==void 0?D.createElement(hr.Provider,{value:this.props.routeContext},D.createElement(om.Provider,{value:this.state.error,children:this.props.component})):this.props.children}};function Ux({routeContext:t,match:e,children:n}){let r=D.useContext(So);return r&&r.static&&r.staticContext&&(e.route.errorElement||e.route.ErrorBoundary)&&(r.staticContext._deepestRenderedBoundaryId=e.route.id),D.createElement(hr.Provider,{value:t},n)}function $x(t,e=[],n=null,r=null,i=null){if(t==null){if(!n)return null;if(n.errors)t=n.matches;else if(e.length===0&&!n.initialized&&n.matches.length>0)t=n.matches;else return null}let s=t,o=n==null?void 0:n.errors;if(o!=null){let f=s.findIndex(p=>p.route.id&&(o==null?void 0:o[p.route.id])!==void 0);We(f>=0,`Could not find a matching route for errors on route IDs: ${Object.keys(o).join(",")}`),s=s.slice(0,Math.min(s.length,f+1))}let l=!1,c=-1;if(n)for(let f=0;f<s.length;f++){let p=s[f];if((p.route.HydrateFallback||p.route.hydrateFallbackElement)&&(c=f),p.route.id){let{loaderData:g,errors:S}=n,v=p.route.loader&&!g.hasOwnProperty(p.route.id)&&(!S||S[p.route.id]===void 0);if(p.route.lazy||v){l=!0,c>=0?s=s.slice(0,c+1):s=[s[0]];break}}}let u=n&&r?(f,p)=>{var g,S;r(f,{location:n.location,params:((S=(g=n.matches)==null?void 0:g[0])==null?void 0:S.params)??{},errorInfo:p})}:void 0;return s.reduceRight((f,p,g)=>{let S,v=!1,N=null,b=null;n&&(S=o&&p.route.id?o[p.route.id]:void 0,N=p.route.errorElement||Mx,l&&(c<0&&g===0?(GT("route-fallback",!1,"No `HydrateFallback` element provided to render during initial hydration"),v=!0,b=null):c===g&&(v=!0,b=p.route.hydrateFallbackElement||null)));let I=e.concat(s.slice(0,g+1)),E=()=>{let y;return S?y=N:v?y=b:p.route.Component?y=D.createElement(p.route.Component,null):p.route.element?y=p.route.element:y=f,D.createElement(Ux,{match:p,routeContext:{outlet:f,matches:I,isDataRoute:n!=null},children:y})};return n&&(p.route.ErrorBoundary||p.route.errorElement||g===0)?D.createElement(Fx,{location:n.location,revalidation:n.revalidation,component:N,error:S,children:E(),routeContext:{outlet:null,matches:I,isDataRoute:!0},onError:u}):E()},null)}function lm(t){return`${t} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`}function Bx(t){let e=D.useContext(So);return We(e,lm(t)),e}function zx(t){let e=D.useContext(qu);return We(e,lm(t)),e}function qx(t){let e=D.useContext(hr);return We(e,lm(t)),e}function cm(t){let e=qx(t),n=e.matches[e.matches.length-1];return We(n.route.id,`${t} can only be used on routes that contain a unique "id"`),n.route.id}function Hx(){return cm("useRouteId")}function Wx(){var r;let t=D.useContext(om),e=zx("useRouteError"),n=cm("useRouteError");return t!==void 0?t:(r=e.errors)==null?void 0:r[n]}function Gx(){let{router:t}=Bx("useNavigate"),e=cm("useNavigate"),n=D.useRef(!1);return HT(()=>{n.current=!0}),D.useCallback(async(i,s={})=>{pn(n.current,qT),n.current&&(typeof i=="number"?t.navigate(i):await t.navigate(i,{fromRouteId:e,...s}))},[t,e])}var Tv={};function GT(t,e,n){!e&&!Tv[t]&&(Tv[t]=!0,pn(!1,n))}D.memo(Kx);function Kx({routes:t,future:e,state:n,unstable_onError:r}){return WT(t,void 0,n,r,e)}function Df({to:t,replace:e,state:n,relative:r}){We(Co(),"<Navigate> may be used only in the context of a <Router> component.");let{static:i}=D.useContext(zn);pn(!i,"<Navigate> must not be used on the initial render in a <StaticRouter>. This is a no-op, but you should modify your code so the <Navigate> is only ever rendered in response to some user interaction or state change.");let{matches:s}=D.useContext(hr),{pathname:o}=ki(),l=am(),c=sm(t,im(s),o,r==="path"),u=JSON.stringify(c);return D.useEffect(()=>{l(JSON.parse(u),{replace:e,state:n,relative:r})},[l,u,r,e,n]),null}function xs(t){We(!1,"A <Route> is only ever to be used as the child of <Routes> element, never rendered directly. Please wrap your <Route> in a <Routes>.")}function Qx({basename:t="/",children:e=null,location:n,navigationType:r="POP",navigator:i,static:s=!1}){We(!Co(),"You cannot render a <Router> inside another <Router>. You should never have more than one in your app.");let o=t.replace(/^\/*/,"/"),l=D.useMemo(()=>({basename:o,navigator:i,static:s,future:{}}),[o,i,s]);typeof n=="string"&&(n=gs(n));let{pathname:c="/",search:u="",hash:f="",state:p=null,key:g="default"}=n,S=D.useMemo(()=>{let v=xr(c,o);return v==null?null:{location:{pathname:v,search:u,hash:f,state:p,key:g},navigationType:r}},[o,c,u,f,p,g,r]);return pn(S!=null,`<Router basename="${o}"> is not able to match the URL "${c}${u}${f}" because it does not start with the basename, so the <Router> won't render anything.`),S==null?null:D.createElement(zn.Provider,{value:l},D.createElement(ll.Provider,{children:e,value:S}))}function Yx({children:t,location:e}){return Vx(Of(t),e)}function Of(t,e=[]){let n=[];return D.Children.forEach(t,(r,i)=>{if(!D.isValidElement(r))return;let s=[...e,i];if(r.type===D.Fragment){n.push.apply(n,Of(r.props.children,s));return}We(r.type===xs,`[${typeof r.type=="string"?r.type:r.type.name}] is not a <Route> component. All component children of <Routes> must be a <Route> or <React.Fragment>`),We(!r.props.index||!r.props.children,"An index route cannot have child routes.");let o={id:r.props.id||s.join("-"),caseSensitive:r.props.caseSensitive,element:r.props.element,Component:r.props.Component,index:r.props.index,path:r.props.path,middleware:r.props.middleware,loader:r.props.loader,action:r.props.action,hydrateFallbackElement:r.props.hydrateFallbackElement,HydrateFallback:r.props.HydrateFallback,errorElement:r.props.errorElement,ErrorBoundary:r.props.ErrorBoundary,hasErrorBoundary:r.props.hasErrorBoundary===!0||r.props.ErrorBoundary!=null||r.props.errorElement!=null,shouldRevalidate:r.props.shouldRevalidate,handle:r.props.handle,lazy:r.props.lazy};r.props.children&&(o.children=Of(r.props.children,s)),n.push(o)}),n}var Ec="get",Tc="application/x-www-form-urlencoded";function Hu(t){return t!=null&&typeof t.tagName=="string"}function Xx(t){return Hu(t)&&t.tagName.toLowerCase()==="button"}function Jx(t){return Hu(t)&&t.tagName.toLowerCase()==="form"}function Zx(t){return Hu(t)&&t.tagName.toLowerCase()==="input"}function e1(t){return!!(t.metaKey||t.altKey||t.ctrlKey||t.shiftKey)}function t1(t,e){return t.button===0&&(!e||e==="_self")&&!e1(t)}var Jl=null;function n1(){if(Jl===null)try{new FormData(document.createElement("form"),0),Jl=!1}catch{Jl=!0}return Jl}var r1=new Set(["application/x-www-form-urlencoded","multipart/form-data","text/plain"]);function ph(t){return t!=null&&!r1.has(t)?(pn(!1,`"${t}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${Tc}"`),null):t}function i1(t,e){let n,r,i,s,o;if(Jx(t)){let l=t.getAttribute("action");r=l?xr(l,e):null,n=t.getAttribute("method")||Ec,i=ph(t.getAttribute("enctype"))||Tc,s=new FormData(t)}else if(Xx(t)||Zx(t)&&(t.type==="submit"||t.type==="image")){let l=t.form;if(l==null)throw new Error('Cannot submit a <button> or <input type="submit"> without a <form>');let c=t.getAttribute("formaction")||l.getAttribute("action");if(r=c?xr(c,e):null,n=t.getAttribute("formmethod")||l.getAttribute("method")||Ec,i=ph(t.getAttribute("formenctype"))||ph(l.getAttribute("enctype"))||Tc,s=new FormData(l,t),!n1()){let{name:u,type:f,value:p}=t;if(f==="image"){let g=u?`${u}.`:"";s.append(`${g}x`,"0"),s.append(`${g}y`,"0")}else u&&s.append(u,p)}}else{if(Hu(t))throw new Error('Cannot submit element that is not <form>, <button>, or <input type="submit|image">');n=Ec,r=null,i=Tc,o=t}return s&&i==="text/plain"&&(o=s,s=void 0),{action:r,method:n.toLowerCase(),encType:i,formData:s,body:o}}Object.getOwnPropertyNames(Object.prototype).sort().join("\0");function um(t,e){if(t===!1||t===null||typeof t>"u")throw new Error(e)}function s1(t,e,n){let r=typeof t=="string"?new URL(t,typeof window>"u"?"server://singlefetch/":window.location.origin):t;return r.pathname==="/"?r.pathname=`_root.${n}`:e&&xr(r.pathname,e)==="/"?r.pathname=`${e.replace(/\/$/,"")}/_root.${n}`:r.pathname=`${r.pathname.replace(/\/$/,"")}.${n}`,r}async function o1(t,e){if(t.id in e)return e[t.id];try{let n=await import(t.module);return e[t.id]=n,n}catch(n){return console.error(`Error loading route module \`${t.module}\`, reloading page...`),console.error(n),window.__reactRouterContext&&window.__reactRouterContext.isSpaMode,window.location.reload(),new Promise(()=>{})}}function a1(t){return t==null?!1:t.href==null?t.rel==="preload"&&typeof t.imageSrcSet=="string"&&typeof t.imageSizes=="string":typeof t.rel=="string"&&typeof t.href=="string"}async function l1(t,e,n){let r=await Promise.all(t.map(async i=>{let s=e.routes[i.route.id];if(s){let o=await o1(s,n);return o.links?o.links():[]}return[]}));return h1(r.flat(1).filter(a1).filter(i=>i.rel==="stylesheet"||i.rel==="preload").map(i=>i.rel==="stylesheet"?{...i,rel:"prefetch",as:"style"}:{...i,rel:"prefetch"}))}function Iv(t,e,n,r,i,s){let o=(c,u)=>n[u]?c.route.id!==n[u].route.id:!0,l=(c,u)=>{var f;return n[u].pathname!==c.pathname||((f=n[u].route.path)==null?void 0:f.endsWith("*"))&&n[u].params["*"]!==c.params["*"]};return s==="assets"?e.filter((c,u)=>o(c,u)||l(c,u)):s==="data"?e.filter((c,u)=>{var p;let f=r.routes[c.route.id];if(!f||!f.hasLoader)return!1;if(o(c,u)||l(c,u))return!0;if(c.route.shouldRevalidate){let g=c.route.shouldRevalidate({currentUrl:new URL(i.pathname+i.search+i.hash,window.origin),currentParams:((p=n[0])==null?void 0:p.params)||{},nextUrl:new URL(t,window.origin),nextParams:c.params,defaultShouldRevalidate:!0});if(typeof g=="boolean")return g}return!0}):[]}function c1(t,e,{includeHydrateFallback:n}={}){return u1(t.map(r=>{let i=e.routes[r.route.id];if(!i)return[];let s=[i.module];return i.clientActionModule&&(s=s.concat(i.clientActionModule)),i.clientLoaderModule&&(s=s.concat(i.clientLoaderModule)),n&&i.hydrateFallbackModule&&(s=s.concat(i.hydrateFallbackModule)),i.imports&&(s=s.concat(i.imports)),s}).flat(1))}function u1(t){return[...new Set(t)]}function d1(t){let e={},n=Object.keys(t).sort();for(let r of n)e[r]=t[r];return e}function h1(t,e){let n=new Set;return new Set(e),t.reduce((r,i)=>{let s=JSON.stringify(d1(i));return n.has(s)||(n.add(s),r.push({key:s,link:i})),r},[])}function KT(){let t=D.useContext(So);return um(t,"You must render this element inside a <DataRouterContext.Provider> element"),t}function f1(){let t=D.useContext(qu);return um(t,"You must render this element inside a <DataRouterStateContext.Provider> element"),t}var dm=D.createContext(void 0);dm.displayName="FrameworkContext";function QT(){let t=D.useContext(dm);return um(t,"You must render this element inside a <HydratedRouter> element"),t}function p1(t,e){let n=D.useContext(dm),[r,i]=D.useState(!1),[s,o]=D.useState(!1),{onFocus:l,onBlur:c,onMouseEnter:u,onMouseLeave:f,onTouchStart:p}=e,g=D.useRef(null);D.useEffect(()=>{if(t==="render"&&o(!0),t==="viewport"){let N=I=>{I.forEach(E=>{o(E.isIntersecting)})},b=new IntersectionObserver(N,{threshold:.5});return g.current&&b.observe(g.current),()=>{b.disconnect()}}},[t]),D.useEffect(()=>{if(r){let N=setTimeout(()=>{o(!0)},100);return()=>{clearTimeout(N)}}},[r]);let S=()=>{i(!0)},v=()=>{i(!1),o(!1)};return n?t!=="intent"?[s,g,{}]:[s,g,{onFocus:Zo(l,S),onBlur:Zo(c,v),onMouseEnter:Zo(u,S),onMouseLeave:Zo(f,v),onTouchStart:Zo(p,S)}]:[!1,g,{}]}function Zo(t,e){return n=>{t&&t(n),n.defaultPrevented||e(n)}}function m1({page:t,...e}){let{router:n}=KT(),r=D.useMemo(()=>FT(n.routes,t,n.basename),[n.routes,t,n.basename]);return r?D.createElement(y1,{page:t,matches:r,...e}):null}function g1(t){let{manifest:e,routeModules:n}=QT(),[r,i]=D.useState([]);return D.useEffect(()=>{let s=!1;return l1(t,e,n).then(o=>{s||i(o)}),()=>{s=!0}},[t,e,n]),r}function y1({page:t,matches:e,...n}){let r=ki(),{manifest:i,routeModules:s}=QT(),{basename:o}=KT(),{loaderData:l,matches:c}=f1(),u=D.useMemo(()=>Iv(t,e,c,i,r,"data"),[t,e,c,i,r]),f=D.useMemo(()=>Iv(t,e,c,i,r,"assets"),[t,e,c,i,r]),p=D.useMemo(()=>{if(t===r.pathname+r.search+r.hash)return[];let v=new Set,N=!1;if(e.forEach(I=>{var y;let E=i.routes[I.route.id];!E||!E.hasLoader||(!u.some(L=>L.route.id===I.route.id)&&I.route.id in l&&((y=s[I.route.id])!=null&&y.shouldRevalidate)||E.hasClientLoader?N=!0:v.add(I.route.id))}),v.size===0)return[];let b=s1(t,o,"data");return N&&v.size>0&&b.searchParams.set("_routes",e.filter(I=>v.has(I.route.id)).map(I=>I.route.id).join(",")),[b.pathname+b.search]},[o,l,r,i,u,e,t,s]),g=D.useMemo(()=>c1(f,i),[f,i]),S=g1(f);return D.createElement(D.Fragment,null,p.map(v=>D.createElement("link",{key:v,rel:"prefetch",as:"fetch",href:v,...n})),g.map(v=>D.createElement("link",{key:v,rel:"modulepreload",href:v,...n})),S.map(({key:v,link:N})=>D.createElement("link",{key:v,nonce:n.nonce,...N})))}function v1(...t){return e=>{t.forEach(n=>{typeof n=="function"?n(e):n!=null&&(n.current=e)})}}var YT=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u";try{YT&&(window.__reactRouterVersion="7.9.6")}catch{}function _1({basename:t,children:e,window:n}){let r=D.useRef();r.current==null&&(r.current=ox({window:n,v5Compat:!0}));let i=r.current,[s,o]=D.useState({action:i.action,location:i.location}),l=D.useCallback(c=>{D.startTransition(()=>o(c))},[o]);return D.useLayoutEffect(()=>i.listen(l),[i,l]),D.createElement(Qx,{basename:t,children:e,location:s.location,navigationType:s.action,navigator:i})}var XT=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,JT=D.forwardRef(function({onClick:e,discover:n="render",prefetch:r="none",relative:i,reloadDocument:s,replace:o,state:l,target:c,to:u,preventScrollReset:f,viewTransition:p,...g},S){let{basename:v}=D.useContext(zn),N=typeof u=="string"&&XT.test(u),b,I=!1;if(typeof u=="string"&&N&&(b=u,YT))try{let A=new URL(window.location.href),x=u.startsWith("//")?new URL(A.protocol+u):new URL(u),P=xr(x.pathname,v);x.origin===A.origin&&P!=null?u=P+x.search+x.hash:I=!0}catch{pn(!1,`<Link to="${u}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`)}let E=Ox(u,{relative:i}),[y,L,$]=p1(r,g),B=I1(u,{replace:o,state:l,target:c,preventScrollReset:f,relative:i,viewTransition:p});function C(A){e&&e(A),A.defaultPrevented||B(A)}let T=D.createElement("a",{...g,...$,href:b||E,onClick:I||s?e:C,ref:v1(S,L),target:c,"data-discover":!N&&n==="render"?"true":void 0});return y&&!N?D.createElement(D.Fragment,null,T,D.createElement(m1,{page:E})):T});JT.displayName="Link";var w1=D.forwardRef(function({"aria-current":e="page",caseSensitive:n=!1,className:r="",end:i=!1,style:s,to:o,viewTransition:l,children:c,...u},f){let p=cl(o,{relative:u.relative}),g=ki(),S=D.useContext(qu),{navigator:v,basename:N}=D.useContext(zn),b=S!=null&&x1(p)&&l===!0,I=v.encodeLocation?v.encodeLocation(p).pathname:p.pathname,E=g.pathname,y=S&&S.navigation&&S.navigation.location?S.navigation.location.pathname:null;n||(E=E.toLowerCase(),y=y?y.toLowerCase():null,I=I.toLowerCase()),y&&N&&(y=xr(y,N)||y);const L=I!=="/"&&I.endsWith("/")?I.length-1:I.length;let $=E===I||!i&&E.startsWith(I)&&E.charAt(L)==="/",B=y!=null&&(y===I||!i&&y.startsWith(I)&&y.charAt(I.length)==="/"),C={isActive:$,isPending:B,isTransitioning:b},T=$?e:void 0,A;typeof r=="function"?A=r(C):A=[r,$?"active":null,B?"pending":null,b?"transitioning":null].filter(Boolean).join(" ");let x=typeof s=="function"?s(C):s;return D.createElement(JT,{...u,"aria-current":T,className:A,ref:f,style:x,to:o,viewTransition:l},typeof c=="function"?c(C):c)});w1.displayName="NavLink";var E1=D.forwardRef(({discover:t="render",fetcherKey:e,navigate:n,reloadDocument:r,replace:i,state:s,method:o=Ec,action:l,onSubmit:c,relative:u,preventScrollReset:f,viewTransition:p,...g},S)=>{let v=A1(),N=R1(l,{relative:u}),b=o.toLowerCase()==="get"?"get":"post",I=typeof l=="string"&&XT.test(l),E=y=>{if(c&&c(y),y.defaultPrevented)return;y.preventDefault();let L=y.nativeEvent.submitter,$=(L==null?void 0:L.getAttribute("formmethod"))||o;v(L||y.currentTarget,{fetcherKey:e,method:$,navigate:n,replace:i,state:s,relative:u,preventScrollReset:f,viewTransition:p})};return D.createElement("form",{ref:S,method:b,action:N,onSubmit:r?c:E,...g,"data-discover":!I&&t==="render"?"true":void 0})});E1.displayName="Form";function T1(t){return`${t} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`}function ZT(t){let e=D.useContext(So);return We(e,T1(t)),e}function I1(t,{target:e,replace:n,state:r,preventScrollReset:i,relative:s,viewTransition:o}={}){let l=am(),c=ki(),u=cl(t,{relative:s});return D.useCallback(f=>{if(t1(f,e)){f.preventDefault();let p=n!==void 0?n:Wa(c)===Wa(u);l(t,{replace:p,state:r,preventScrollReset:i,relative:s,viewTransition:o})}},[c,l,u,n,r,e,t,i,s,o])}var S1=0,C1=()=>`__${String(++S1)}__`;function A1(){let{router:t}=ZT("useSubmit"),{basename:e}=D.useContext(zn),n=Hx();return D.useCallback(async(r,i={})=>{let{action:s,method:o,encType:l,formData:c,body:u}=i1(r,e);if(i.navigate===!1){let f=i.fetcherKey||C1();await t.fetch(f,n,i.action||s,{preventScrollReset:i.preventScrollReset,formData:c,body:u,formMethod:i.method||o,formEncType:i.encType||l,flushSync:i.flushSync})}else await t.navigate(i.action||s,{preventScrollReset:i.preventScrollReset,formData:c,body:u,formMethod:i.method||o,formEncType:i.encType||l,replace:i.replace,state:i.state,fromRouteId:n,flushSync:i.flushSync,viewTransition:i.viewTransition})},[t,e,n])}function R1(t,{relative:e}={}){let{basename:n}=D.useContext(zn),r=D.useContext(hr);We(r,"useFormAction must be used inside a RouteContext");let[i]=r.matches.slice(-1),s={...cl(t||".",{relative:e})},o=ki();if(t==null){s.search=o.search;let l=new URLSearchParams(s.search),c=l.getAll("index");if(c.some(f=>f==="")){l.delete("index"),c.filter(p=>p).forEach(p=>l.append("index",p));let f=l.toString();s.search=f?`?${f}`:""}}return(!t||t===".")&&i.route.index&&(s.search=s.search?s.search.replace(/^\?/,"?index&"):"?index"),n!=="/"&&(s.pathname=s.pathname==="/"?n:Ir([n,s.pathname])),Wa(s)}function x1(t,{relative:e}={}){let n=D.useContext(zT);We(n!=null,"`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?");let{basename:r}=ZT("useViewTransitionState"),i=cl(t,{relative:e});if(!n.isTransitioning)return!1;let s=xr(n.currentLocation.pathname,r)||n.currentLocation.pathname,o=xr(n.nextLocation.pathname,r)||n.nextLocation.pathname;return ru(i.pathname,o)!=null||ru(i.pathname,s)!=null}const P1=()=>{};var Sv={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eI=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let i=t.charCodeAt(r);i<128?e[n++]=i:i<2048?(e[n++]=i>>6|192,e[n++]=i&63|128):(i&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=i>>18|240,e[n++]=i>>12&63|128,e[n++]=i>>6&63|128,e[n++]=i&63|128):(e[n++]=i>>12|224,e[n++]=i>>6&63|128,e[n++]=i&63|128)}return e},k1=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const i=t[n++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=t[n++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=t[n++],o=t[n++],l=t[n++],c=((i&7)<<18|(s&63)<<12|(o&63)<<6|l&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const s=t[n++],o=t[n++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|o&63)}}return e.join("")},tI={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<t.length;i+=3){const s=t[i],o=i+1<t.length,l=o?t[i+1]:0,c=i+2<t.length,u=c?t[i+2]:0,f=s>>2,p=(s&3)<<4|l>>4;let g=(l&15)<<2|u>>6,S=u&63;c||(S=64,o||(g=64)),r.push(n[f],n[p],n[g],n[S])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(eI(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):k1(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<t.length;){const s=n[t.charAt(i++)],l=i<t.length?n[t.charAt(i)]:0;++i;const u=i<t.length?n[t.charAt(i)]:64;++i;const p=i<t.length?n[t.charAt(i)]:64;if(++i,s==null||l==null||u==null||p==null)throw new N1;const g=s<<2|l>>4;if(r.push(g),u!==64){const S=l<<4&240|u>>2;if(r.push(S),p!==64){const v=u<<6&192|p;r.push(v)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class N1 extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const b1=function(t){const e=eI(t);return tI.encodeByteArray(e,!0)},iu=function(t){return b1(t).replace(/\./g,"")},nI=function(t){try{return tI.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function D1(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const O1=()=>D1().__FIREBASE_DEFAULTS__,L1=()=>{if(typeof process>"u"||typeof Sv>"u")return;const t=Sv.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},V1=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&nI(t[1]);return e&&JSON.parse(e)},Wu=()=>{try{return P1()||O1()||L1()||V1()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},rI=t=>{var e,n;return(n=(e=Wu())==null?void 0:e.emulatorHosts)==null?void 0:n[t]},iI=t=>{const e=rI(t);if(!e)return;const n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),r]:[e.substring(0,n),r]},sI=()=>{var t;return(t=Wu())==null?void 0:t.config},oI=t=>{var e;return(e=Wu())==null?void 0:e[`_${t}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class j1{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ni(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function hm(t){return(await fetch(t,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aI(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n={alg:"none",type:"JWT"},r=e||"demo-project",i=t.iat||0,s=t.sub||t.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}},...t};return[iu(JSON.stringify(n)),iu(JSON.stringify(o)),""].join(".")}const Ta={};function M1(){const t={prod:[],emulator:[]};for(const e of Object.keys(Ta))Ta[e]?t.emulator.push(e):t.prod.push(e);return t}function F1(t){let e=document.getElementById(t),n=!1;return e||(e=document.createElement("div"),e.setAttribute("id",t),n=!0),{created:n,element:e}}let Cv=!1;function fm(t,e){if(typeof window>"u"||typeof document>"u"||!Ni(window.location.host)||Ta[t]===e||Ta[t]||Cv)return;Ta[t]=e;function n(g){return`__firebase__banner__${g}`}const r="__firebase__banner",s=M1().prod.length>0;function o(){const g=document.getElementById(r);g&&g.remove()}function l(g){g.style.display="flex",g.style.background="#7faaf0",g.style.position="fixed",g.style.bottom="5px",g.style.left="5px",g.style.padding=".5em",g.style.borderRadius="5px",g.style.alignItems="center"}function c(g,S){g.setAttribute("width","24"),g.setAttribute("id",S),g.setAttribute("height","24"),g.setAttribute("viewBox","0 0 24 24"),g.setAttribute("fill","none"),g.style.marginLeft="-6px"}function u(){const g=document.createElement("span");return g.style.cursor="pointer",g.style.marginLeft="16px",g.style.fontSize="24px",g.innerHTML=" &times;",g.onclick=()=>{Cv=!0,o()},g}function f(g,S){g.setAttribute("id",S),g.innerText="Learn more",g.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",g.setAttribute("target","__blank"),g.style.paddingLeft="5px",g.style.textDecoration="underline"}function p(){const g=F1(r),S=n("text"),v=document.getElementById(S)||document.createElement("span"),N=n("learnmore"),b=document.getElementById(N)||document.createElement("a"),I=n("preprendIcon"),E=document.getElementById(I)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(g.created){const y=g.element;l(y),f(b,N);const L=u();c(E,I),y.append(E,v,b,L),document.body.appendChild(y)}s?(v.innerText="Preview backend disconnected.",E.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(E.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,v.innerText="Preview backend running in this workspace."),v.setAttribute("id",S)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",p):p()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jt(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function U1(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(jt())}function $1(){var e;const t=(e=Wu())==null?void 0:e.forceEnvironment;if(t==="node")return!0;if(t==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function B1(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function lI(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function z1(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function q1(){const t=jt();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function H1(){return!$1()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function cI(){try{return typeof indexedDB=="object"}catch{return!1}}function uI(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},i.onupgradeneeded=()=>{n=!1},i.onerror=()=>{var s;e(((s=i.error)==null?void 0:s.message)||"")}}catch(n){e(n)}})}function W1(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const G1="FirebaseError";class kn extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=G1,Object.setPrototypeOf(this,kn.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ys.prototype.create)}}class ys{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},i=`${this.service}/${e}`,s=this.errors[e],o=s?K1(s,r):"Error",l=`${this.serviceName}: ${o} (${i}).`;return new kn(i,l,r)}}function K1(t,e){return t.replace(Q1,(n,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const Q1=/\{\$([^}]+)}/g;function Y1(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function Pr(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const i of n){if(!r.includes(i))return!1;const s=t[i],o=e[i];if(Av(s)&&Av(o)){if(!Pr(s,o))return!1}else if(s!==o)return!1}for(const i of r)if(!n.includes(i))return!1;return!0}function Av(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ul(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function oa(t){const e={};return t.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[i,s]=r.split("=");e[decodeURIComponent(i)]=decodeURIComponent(s)}}),e}function aa(t){const e=t.indexOf("?");if(!e)return"";const n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}function X1(t,e){const n=new J1(t,e);return n.subscribe.bind(n)}class J1{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let i;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");Z1(e,["next","error","complete"])?i=e:i={next:e,error:n,complete:r},i.next===void 0&&(i.next=mh),i.error===void 0&&(i.error=mh),i.complete===void 0&&(i.complete=mh);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Z1(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function mh(){}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eP=1e3,tP=2,nP=4*60*60*1e3,rP=.5;function Rv(t,e=eP,n=tP){const r=e*Math.pow(n,t),i=Math.round(rP*r*(Math.random()-.5)*2);return Math.min(nP,r+i)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ve(t){return t&&t._delegate?t._delegate:t}class Pn{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hi="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iP{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new j1;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:n});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){const n=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),r=(e==null?void 0:e.optional)??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(i){if(r)return null;throw i}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(oP(e))try{this.getOrInitializeService({instanceIdentifier:Hi})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(n);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=Hi){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Hi){return this.instances.has(e)}getOptions(e=Hi){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[s,o]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(s);r===l&&o.resolve(i)}return i}onInit(e,n){const r=this.normalizeInstanceIdentifier(n),i=this.onInitCallbacks.get(r)??new Set;i.add(e),this.onInitCallbacks.set(r,i);const s=this.instances.get(r);return s&&e(s,r),()=>{i.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const i of r)try{i(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:sP(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Hi){return this.component?this.component.multipleInstances?e:Hi:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function sP(t){return t===Hi?void 0:t}function oP(t){return t.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aP{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new iP(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var _e;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(_e||(_e={}));const lP={debug:_e.DEBUG,verbose:_e.VERBOSE,info:_e.INFO,warn:_e.WARN,error:_e.ERROR,silent:_e.SILENT},cP=_e.INFO,uP={[_e.DEBUG]:"log",[_e.VERBOSE]:"log",[_e.INFO]:"info",[_e.WARN]:"warn",[_e.ERROR]:"error"},dP=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),i=uP[e];if(i)console[i](`[${r}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Gu{constructor(e){this.name=e,this._logLevel=cP,this._logHandler=dP,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in _e))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?lP[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,_e.DEBUG,...e),this._logHandler(this,_e.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,_e.VERBOSE,...e),this._logHandler(this,_e.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,_e.INFO,...e),this._logHandler(this,_e.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,_e.WARN,...e),this._logHandler(this,_e.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,_e.ERROR,...e),this._logHandler(this,_e.ERROR,...e)}}const hP=(t,e)=>e.some(n=>t instanceof n);let xv,Pv;function fP(){return xv||(xv=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function pP(){return Pv||(Pv=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const dI=new WeakMap,Lf=new WeakMap,hI=new WeakMap,gh=new WeakMap,pm=new WeakMap;function mP(t){const e=new Promise((n,r)=>{const i=()=>{t.removeEventListener("success",s),t.removeEventListener("error",o)},s=()=>{n(pi(t.result)),i()},o=()=>{r(t.error),i()};t.addEventListener("success",s),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&dI.set(n,t)}).catch(()=>{}),pm.set(e,t),e}function gP(t){if(Lf.has(t))return;const e=new Promise((n,r)=>{const i=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",o),t.removeEventListener("abort",o)},s=()=>{n(),i()},o=()=>{r(t.error||new DOMException("AbortError","AbortError")),i()};t.addEventListener("complete",s),t.addEventListener("error",o),t.addEventListener("abort",o)});Lf.set(t,e)}let Vf={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return Lf.get(t);if(e==="objectStoreNames")return t.objectStoreNames||hI.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return pi(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function yP(t){Vf=t(Vf)}function vP(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(yh(this),e,...n);return hI.set(r,e.sort?e.sort():[e]),pi(r)}:pP().includes(t)?function(...e){return t.apply(yh(this),e),pi(dI.get(this))}:function(...e){return pi(t.apply(yh(this),e))}}function _P(t){return typeof t=="function"?vP(t):(t instanceof IDBTransaction&&gP(t),hP(t,fP())?new Proxy(t,Vf):t)}function pi(t){if(t instanceof IDBRequest)return mP(t);if(gh.has(t))return gh.get(t);const e=_P(t);return e!==t&&(gh.set(t,e),pm.set(e,t)),e}const yh=t=>pm.get(t);function fI(t,e,{blocked:n,upgrade:r,blocking:i,terminated:s}={}){const o=indexedDB.open(t,e),l=pi(o);return r&&o.addEventListener("upgradeneeded",c=>{r(pi(o.result),c.oldVersion,c.newVersion,pi(o.transaction),c)}),n&&o.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),l.then(c=>{s&&c.addEventListener("close",()=>s()),i&&c.addEventListener("versionchange",u=>i(u.oldVersion,u.newVersion,u))}).catch(()=>{}),l}const wP=["get","getKey","getAll","getAllKeys","count"],EP=["put","add","delete","clear"],vh=new Map;function kv(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(vh.get(e))return vh.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,i=EP.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(i||wP.includes(n)))return;const s=async function(o,...l){const c=this.transaction(o,i?"readwrite":"readonly");let u=c.store;return r&&(u=u.index(l.shift())),(await Promise.all([u[n](...l),i&&c.done]))[0]};return vh.set(e,s),s}yP(t=>({...t,get:(e,n,r)=>kv(e,n)||t.get(e,n,r),has:(e,n)=>!!kv(e,n)||t.has(e,n)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class TP{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(IP(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function IP(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const jf="@firebase/app",Nv="0.14.5";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kr=new Gu("@firebase/app"),SP="@firebase/app-compat",CP="@firebase/analytics-compat",AP="@firebase/analytics",RP="@firebase/app-check-compat",xP="@firebase/app-check",PP="@firebase/auth",kP="@firebase/auth-compat",NP="@firebase/database",bP="@firebase/data-connect",DP="@firebase/database-compat",OP="@firebase/functions",LP="@firebase/functions-compat",VP="@firebase/installations",jP="@firebase/installations-compat",MP="@firebase/messaging",FP="@firebase/messaging-compat",UP="@firebase/performance",$P="@firebase/performance-compat",BP="@firebase/remote-config",zP="@firebase/remote-config-compat",qP="@firebase/storage",HP="@firebase/storage-compat",WP="@firebase/firestore",GP="@firebase/ai",KP="@firebase/firestore-compat",QP="firebase",YP="12.5.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mf="[DEFAULT]",XP={[jf]:"fire-core",[SP]:"fire-core-compat",[AP]:"fire-analytics",[CP]:"fire-analytics-compat",[xP]:"fire-app-check",[RP]:"fire-app-check-compat",[PP]:"fire-auth",[kP]:"fire-auth-compat",[NP]:"fire-rtdb",[bP]:"fire-data-connect",[DP]:"fire-rtdb-compat",[OP]:"fire-fn",[LP]:"fire-fn-compat",[VP]:"fire-iid",[jP]:"fire-iid-compat",[MP]:"fire-fcm",[FP]:"fire-fcm-compat",[UP]:"fire-perf",[$P]:"fire-perf-compat",[BP]:"fire-rc",[zP]:"fire-rc-compat",[qP]:"fire-gcs",[HP]:"fire-gcs-compat",[WP]:"fire-fst",[KP]:"fire-fst-compat",[GP]:"fire-vertex","fire-js":"fire-js",[QP]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const su=new Map,JP=new Map,Ff=new Map;function bv(t,e){try{t.container.addComponent(e)}catch(n){kr.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function Un(t){const e=t.name;if(Ff.has(e))return kr.debug(`There were multiple attempts to register component ${e}.`),!1;Ff.set(e,t);for(const n of su.values())bv(n,t);for(const n of JP.values())bv(n,t);return!0}function bi(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function Tn(t){return t==null?!1:t.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ZP={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},mi=new ys("app","Firebase",ZP);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ek{constructor(e,n,r){this._isDeleted=!1,this._options={...e},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Pn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw mi.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vs=YP;function mm(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r={name:Mf,automaticDataCollectionEnabled:!0,...e},i=r.name;if(typeof i!="string"||!i)throw mi.create("bad-app-name",{appName:String(i)});if(n||(n=sI()),!n)throw mi.create("no-options");const s=su.get(i);if(s){if(Pr(n,s.options)&&Pr(r,s.config))return s;throw mi.create("duplicate-app",{appName:i})}const o=new aP(i);for(const c of Ff.values())o.addComponent(c);const l=new ek(n,r,o);return su.set(i,l),l}function Ku(t=Mf){const e=su.get(t);if(!e&&t===Mf&&sI())return mm();if(!e)throw mi.create("no-app",{appName:t});return e}function nn(t,e,n){let r=XP[t]??t;n&&(r+=`-${n}`);const i=r.match(/\s|\//),s=e.match(/\s|\//);if(i||s){const o=[`Unable to register library "${r}" with version "${e}":`];i&&o.push(`library name "${r}" contains illegal characters (whitespace or "/")`),i&&s&&o.push("and"),s&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),kr.warn(o.join(" "));return}Un(new Pn(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tk="firebase-heartbeat-database",nk=1,Ga="firebase-heartbeat-store";let _h=null;function pI(){return _h||(_h=fI(tk,nk,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(Ga)}catch(n){console.warn(n)}}}}).catch(t=>{throw mi.create("idb-open",{originalErrorMessage:t.message})})),_h}async function rk(t){try{const n=(await pI()).transaction(Ga),r=await n.objectStore(Ga).get(mI(t));return await n.done,r}catch(e){if(e instanceof kn)kr.warn(e.message);else{const n=mi.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});kr.warn(n.message)}}}async function Dv(t,e){try{const r=(await pI()).transaction(Ga,"readwrite");await r.objectStore(Ga).put(e,mI(t)),await r.done}catch(n){if(n instanceof kn)kr.warn(n.message);else{const r=mi.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});kr.warn(r.message)}}}function mI(t){return`${t.name}!${t.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ik=1024,sk=30;class ok{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new lk(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=Ov();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)==null?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(o=>o.date===s))return;if(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats.length>sk){const o=ck(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){kr.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=Ov(),{heartbeatsToSend:r,unsentEntries:i}=ak(this._heartbeatsCache.heartbeats),s=iu(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(n){return kr.warn(n),""}}}function Ov(){return new Date().toISOString().substring(0,10)}function ak(t,e=ik){const n=[];let r=t.slice();for(const i of t){const s=n.find(o=>o.agent===i.agent);if(s){if(s.dates.push(i.date),Lv(n)>e){s.dates.pop();break}}else if(n.push({agent:i.agent,dates:[i.date]}),Lv(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class lk{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return cI()?uI().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await rk(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Dv(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Dv(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function Lv(t){return iu(JSON.stringify({version:2,heartbeats:t})).length}function ck(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let r=1;r<t.length;r++)t[r].date<n&&(n=t[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uk(t){Un(new Pn("platform-logger",e=>new TP(e),"PRIVATE")),Un(new Pn("heartbeat",e=>new ok(e),"PRIVATE")),nn(jf,Nv,t),nn(jf,Nv,"esm2020"),nn("fire-js","")}uk("");var dk="firebase",hk="12.5.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */nn(dk,hk,"app");function gI(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const fk=gI,yI=new ys("auth","Firebase",gI());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ou=new Gu("@firebase/auth");function pk(t,...e){ou.logLevel<=_e.WARN&&ou.warn(`Auth (${vs}): ${t}`,...e)}function Ic(t,...e){ou.logLevel<=_e.ERROR&&ou.error(`Auth (${vs}): ${t}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $n(t,...e){throw gm(t,...e)}function rr(t,...e){return gm(t,...e)}function vI(t,e,n){const r={...fk(),[e]:n};return new ys("auth","Firebase",r).create(e,{appName:t.name})}function gi(t){return vI(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function gm(t,...e){if(typeof t!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return yI.create(t,...e)}function ae(t,e,...n){if(!t)throw gm(e,...n)}function wr(t){const e="INTERNAL ASSERTION FAILED: "+t;throw Ic(e),new Error(e)}function Nr(t,e){t||wr(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Uf(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.href)||""}function mk(){return Vv()==="http:"||Vv()==="https:"}function Vv(){var t;return typeof self<"u"&&((t=self.location)==null?void 0:t.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gk(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(mk()||lI()||"connection"in navigator)?navigator.onLine:!0}function yk(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dl{constructor(e,n){this.shortDelay=e,this.longDelay=n,Nr(n>e,"Short delay should be less than long delay!"),this.isMobile=U1()||z1()}get(){return gk()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ym(t,e){Nr(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _I{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;wr("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;wr("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;wr("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vk={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _k=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],wk=new dl(3e4,6e4);function _s(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function Di(t,e,n,r,i={}){return wI(t,i,async()=>{let s={},o={};r&&(e==="GET"?o=r:s={body:JSON.stringify(r)});const l=ul({key:t.config.apiKey,...o}).slice(1),c=await t._getAdditionalHeaders();c["Content-Type"]="application/json",t.languageCode&&(c["X-Firebase-Locale"]=t.languageCode);const u={method:e,headers:c,...s};return B1()||(u.referrerPolicy="no-referrer"),t.emulatorConfig&&Ni(t.emulatorConfig.host)&&(u.credentials="include"),_I.fetch()(await EI(t,t.config.apiHost,n,l),u)})}async function wI(t,e,n){t._canInitEmulator=!1;const r={...vk,...e};try{const i=new Tk(t),s=await Promise.race([n(),i.promise]);i.clearNetworkTimeout();const o=await s.json();if("needConfirmation"in o)throw Zl(t,"account-exists-with-different-credential",o);if(s.ok&&!("errorMessage"in o))return o;{const l=s.ok?o.errorMessage:o.error.message,[c,u]=l.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw Zl(t,"credential-already-in-use",o);if(c==="EMAIL_EXISTS")throw Zl(t,"email-already-in-use",o);if(c==="USER_DISABLED")throw Zl(t,"user-disabled",o);const f=r[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(u)throw vI(t,f,u);$n(t,f)}}catch(i){if(i instanceof kn)throw i;$n(t,"network-request-failed",{message:String(i)})}}async function Qu(t,e,n,r,i={}){const s=await Di(t,e,n,r,i);return"mfaPendingCredential"in s&&$n(t,"multi-factor-auth-required",{_serverResponse:s}),s}async function EI(t,e,n,r){const i=`${e}${n}?${r}`,s=t,o=s.config.emulator?ym(t.config,i):`${t.config.apiScheme}://${i}`;return _k.includes(n)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(o).toString():o}function Ek(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class Tk{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(rr(this.auth,"network-request-failed")),wk.get())})}}function Zl(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const i=rr(t,e,r);return i.customData._tokenResponse=n,i}function jv(t){return t!==void 0&&t.enterprise!==void 0}class Ik{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return Ek(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function Sk(t,e){return Di(t,"GET","/v2/recaptchaConfig",_s(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ck(t,e){return Di(t,"POST","/v1/accounts:delete",e)}async function au(t,e){return Di(t,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ia(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Ak(t,e=!1){const n=Ve(t),r=await n.getIdToken(e),i=vm(r);ae(i&&i.exp&&i.auth_time&&i.iat,n.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,o=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:Ia(wh(i.auth_time)),issuedAtTime:Ia(wh(i.iat)),expirationTime:Ia(wh(i.exp)),signInProvider:o||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function wh(t){return Number(t)*1e3}function vm(t){const[e,n,r]=t.split(".");if(e===void 0||n===void 0||r===void 0)return Ic("JWT malformed, contained fewer than 3 sections"),null;try{const i=nI(n);return i?JSON.parse(i):(Ic("Failed to decode base64 JWT payload"),null)}catch(i){return Ic("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function Mv(t){const e=vm(t);return ae(e,"internal-error"),ae(typeof e.exp<"u","internal-error"),ae(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ka(t,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof kn&&Rk(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function Rk({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xk{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $f{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=Ia(this.lastLoginAt),this.creationTime=Ia(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function lu(t){var p;const e=t.auth,n=await t.getIdToken(),r=await Ka(t,au(e,{idToken:n}));ae(r==null?void 0:r.users.length,e,"internal-error");const i=r.users[0];t._notifyReloadListener(i);const s=(p=i.providerUserInfo)!=null&&p.length?TI(i.providerUserInfo):[],o=kk(t.providerData,s),l=t.isAnonymous,c=!(t.email&&i.passwordHash)&&!(o!=null&&o.length),u=l?c:!1,f={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:o,metadata:new $f(i.createdAt,i.lastLoginAt),isAnonymous:u};Object.assign(t,f)}async function Pk(t){const e=Ve(t);await lu(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function kk(t,e){return[...t.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function TI(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Nk(t,e){const n=await wI(t,{},async()=>{const r=ul({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=t.config,o=await EI(t,i,"/v1/token",`key=${s}`),l=await t._getAdditionalHeaders();l["Content-Type"]="application/x-www-form-urlencoded";const c={method:"POST",headers:l,body:r};return t.emulatorConfig&&Ni(t.emulatorConfig.host)&&(c.credentials="include"),_I.fetch()(o,c)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function bk(t,e){return Di(t,"POST","/v2/accounts:revokeToken",_s(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xs{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){ae(e.idToken,"internal-error"),ae(typeof e.idToken<"u","internal-error"),ae(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Mv(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){ae(e.length!==0,"internal-error");const n=Mv(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(ae(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:i,expiresIn:s}=await Nk(e,n);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:i,expirationTime:s}=n,o=new Xs;return r&&(ae(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),i&&(ae(typeof i=="string","internal-error",{appName:e}),o.accessToken=i),s&&(ae(typeof s=="number","internal-error",{appName:e}),o.expirationTime=s),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Xs,this.toJSON())}_performRefresh(){return wr("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hr(t,e){ae(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class Vn{constructor({uid:e,auth:n,stsTokenManager:r,...i}){this.providerId="firebase",this.proactiveRefresh=new xk(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new $f(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const n=await Ka(this,this.stsTokenManager.getToken(this.auth,e));return ae(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return Ak(this,e)}reload(){return Pk(this)}_assign(e){this!==e&&(ae(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new Vn({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){ae(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await lu(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Tn(this.auth.app))return Promise.reject(gi(this.auth));const e=await this.getIdToken();return await Ka(this,Ck(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){const r=n.displayName??void 0,i=n.email??void 0,s=n.phoneNumber??void 0,o=n.photoURL??void 0,l=n.tenantId??void 0,c=n._redirectEventId??void 0,u=n.createdAt??void 0,f=n.lastLoginAt??void 0,{uid:p,emailVerified:g,isAnonymous:S,providerData:v,stsTokenManager:N}=n;ae(p&&N,e,"internal-error");const b=Xs.fromJSON(this.name,N);ae(typeof p=="string",e,"internal-error"),Hr(r,e.name),Hr(i,e.name),ae(typeof g=="boolean",e,"internal-error"),ae(typeof S=="boolean",e,"internal-error"),Hr(s,e.name),Hr(o,e.name),Hr(l,e.name),Hr(c,e.name),Hr(u,e.name),Hr(f,e.name);const I=new Vn({uid:p,auth:e,email:i,emailVerified:g,displayName:r,isAnonymous:S,photoURL:o,phoneNumber:s,tenantId:l,stsTokenManager:b,createdAt:u,lastLoginAt:f});return v&&Array.isArray(v)&&(I.providerData=v.map(E=>({...E}))),c&&(I._redirectEventId=c),I}static async _fromIdTokenResponse(e,n,r=!1){const i=new Xs;i.updateFromServerResponse(n);const s=new Vn({uid:n.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await lu(s),s}static async _fromGetAccountInfoResponse(e,n,r){const i=n.users[0];ae(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?TI(i.providerUserInfo):[],o=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),l=new Xs;l.updateFromIdToken(r);const c=new Vn({uid:i.localId,auth:e,stsTokenManager:l,isAnonymous:o}),u={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new $f(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(c,u),c}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fv=new Map;function Er(t){Nr(t instanceof Function,"Expected a class definition");let e=Fv.get(t);return e?(Nr(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,Fv.set(t,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class II{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}II.type="NONE";const Uv=II;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sc(t,e,n){return`firebase:${t}:${e}:${n}`}class Js{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=Sc(this.userKey,i.apiKey,s),this.fullPersistenceKey=Sc("persistence",i.apiKey,s),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const n=await au(this.auth,{idToken:e}).catch(()=>{});return n?Vn._fromGetAccountInfoResponse(this.auth,n,e):null}return Vn._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new Js(Er(Uv),e,r);const i=(await Promise.all(n.map(async u=>{if(await u._isAvailable())return u}))).filter(u=>u);let s=i[0]||Er(Uv);const o=Sc(r,e.config.apiKey,e.name);let l=null;for(const u of n)try{const f=await u._get(o);if(f){let p;if(typeof f=="string"){const g=await au(e,{idToken:f}).catch(()=>{});if(!g)break;p=await Vn._fromGetAccountInfoResponse(e,g,f)}else p=Vn._fromJSON(e,f);u!==s&&(l=p),s=u;break}}catch{}const c=i.filter(u=>u._shouldAllowMigration);return!s._shouldAllowMigration||!c.length?new Js(s,e,r):(s=c[0],l&&await s._set(o,l.toJSON()),await Promise.all(n.map(async u=>{if(u!==s)try{await u._remove(o)}catch{}})),new Js(s,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $v(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(RI(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(SI(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(PI(e))return"Blackberry";if(kI(e))return"Webos";if(CI(e))return"Safari";if((e.includes("chrome/")||AI(e))&&!e.includes("edge/"))return"Chrome";if(xI(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function SI(t=jt()){return/firefox\//i.test(t)}function CI(t=jt()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function AI(t=jt()){return/crios\//i.test(t)}function RI(t=jt()){return/iemobile/i.test(t)}function xI(t=jt()){return/android/i.test(t)}function PI(t=jt()){return/blackberry/i.test(t)}function kI(t=jt()){return/webos/i.test(t)}function _m(t=jt()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function Dk(t=jt()){var e;return _m(t)&&!!((e=window.navigator)!=null&&e.standalone)}function Ok(){return q1()&&document.documentMode===10}function NI(t=jt()){return _m(t)||xI(t)||kI(t)||PI(t)||/windows phone/i.test(t)||RI(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bI(t,e=[]){let n;switch(t){case"Browser":n=$v(jt());break;case"Worker":n=`${$v(jt())}-${t}`;break;default:n=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${vs}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lk{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=s=>new Promise((o,l)=>{try{const c=e(s);o(c)}catch(c){l(c)}});r.onAbort=n,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const i of n)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Vk(t,e={}){return Di(t,"GET","/v2/passwordPolicy",_s(t,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jk=6;class Mk{constructor(e){var r;const n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??jk,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((r=e.allowedNonAlphanumericCharacters)==null?void 0:r.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),i&&(n.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fk{constructor(e,n,r,i){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Bv(this),this.idTokenSubscription=new Bv(this),this.beforeStateQueue=new Lk(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=yI,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=Er(n)),this._initializationPromise=this.queue(async()=>{var r,i,s;if(!this._deleted&&(this.persistenceManager=await Js.create(this,e),(r=this._resolvePersistenceManagerAvailable)==null||r.call(this),!this._deleted)){if((i=this._popupRedirectResolver)!=null&&i._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((s=this.currentUser)==null?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await au(this,{idToken:e}),r=await Vn._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var s;if(Tn(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(l,l))}):this.directlySetCurrentUser(null)}const n=await this.assertedPersistence.getCurrentUser();let r=n,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(s=this.redirectUser)==null?void 0:s._redirectEventId,l=r==null?void 0:r._redirectEventId,c=await this.tryRedirectSignIn(e);(!o||o===l)&&(c!=null&&c.user)&&(r=c.user,i=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(r)}catch(o){r=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return ae(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await lu(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=yk()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Tn(this.app))return Promise.reject(gi(this));const n=e?Ve(e):null;return n&&ae(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&ae(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Tn(this.app)?Promise.reject(gi(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Tn(this.app)?Promise.reject(gi(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Er(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Vk(this),n=new Mk(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new ys("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await bk(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&Er(e)||this._popupRedirectResolver;ae(n,this,"argument-error"),this.redirectPersistenceManager=await Js.create(this,[Er(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)==null?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)==null?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((n=this.currentUser)==null?void 0:n.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,i){if(this._deleted)return()=>{};const s=typeof n=="function"?n:n.next.bind(n);let o=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(ae(l,this,"internal-error"),l.then(()=>{o||s(this.currentUser)}),typeof n=="function"){const c=e.addObserver(n,r,i);return()=>{o=!0,c()}}else{const c=e.addObserver(n);return()=>{o=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return ae(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=bI(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var i;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const n=await((i=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:i.getHeartbeatsHeader());n&&(e["X-Firebase-Client"]=n);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){var n;if(Tn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((n=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:n.getToken());return e!=null&&e.error&&pk(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function Ao(t){return Ve(t)}class Bv{constructor(e){this.auth=e,this.observer=null,this.addObserver=X1(n=>this.observer=n)}get next(){return ae(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Yu={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Uk(t){Yu=t}function DI(t){return Yu.loadJS(t)}function $k(){return Yu.recaptchaEnterpriseScript}function Bk(){return Yu.gapiScript}function zk(t){return`__${t}${Math.floor(Math.random()*1e6)}`}class qk{constructor(){this.enterprise=new Hk}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}class Hk{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}const Wk="recaptcha-enterprise",OI="NO_RECAPTCHA";class Gk{constructor(e){this.type=Wk,this.auth=Ao(e)}async verify(e="verify",n=!1){async function r(s){if(!n){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(o,l)=>{Sk(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(c=>{if(c.recaptchaKey===void 0)l(new Error("recaptcha Enterprise site key undefined"));else{const u=new Ik(c);return s.tenantId==null?s._agentRecaptchaConfig=u:s._tenantRecaptchaConfigs[s.tenantId]=u,o(u.siteKey)}}).catch(c=>{l(c)})})}function i(s,o,l){const c=window.grecaptcha;jv(c)?c.enterprise.ready(()=>{c.enterprise.execute(s,{action:e}).then(u=>{o(u)}).catch(()=>{o(OI)})}):l(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new qk().execute("siteKey",{action:"verify"}):new Promise((s,o)=>{r(this.auth).then(l=>{if(!n&&jv(window.grecaptcha))i(l,s,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let c=$k();c.length!==0&&(c+=l),DI(c).then(()=>{i(l,s,o)}).catch(u=>{o(u)})}}).catch(l=>{o(l)})})}}async function zv(t,e,n,r=!1,i=!1){const s=new Gk(t);let o;if(i)o=OI;else try{o=await s.verify(n)}catch{o=await s.verify(n,!0)}const l={...e};if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in l){const c=l.phoneEnrollmentInfo.phoneNumber,u=l.phoneEnrollmentInfo.recaptchaToken;Object.assign(l,{phoneEnrollmentInfo:{phoneNumber:c,recaptchaToken:u,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in l){const c=l.phoneSignInInfo.recaptchaToken;Object.assign(l,{phoneSignInInfo:{recaptchaToken:c,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return l}return r?Object.assign(l,{captchaResp:o}):Object.assign(l,{captchaResponse:o}),Object.assign(l,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(l,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),l}async function qv(t,e,n,r,i){var s;if((s=t._getRecaptchaConfig())!=null&&s.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const o=await zv(t,e,n,n==="getOobCode");return r(t,o)}else return r(t,e).catch(async o=>{if(o.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const l=await zv(t,e,n,n==="getOobCode");return r(t,l)}else return Promise.reject(o)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kk(t,e){const n=bi(t,"auth");if(n.isInitialized()){const i=n.getImmediate(),s=n.getOptions();if(Pr(s,e??{}))return i;$n(i,"already-initialized")}return n.initialize({options:e})}function Qk(t,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(Er);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function Yk(t,e,n){const r=Ao(t);ae(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!1,s=LI(e),{host:o,port:l}=Xk(e),c=l===null?"":`:${l}`,u={url:`${s}//${o}${c}/`},f=Object.freeze({host:o,port:l,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})});if(!r._canInitEmulator){ae(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),ae(Pr(u,r.config.emulator)&&Pr(f,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=u,r.emulatorConfig=f,r.settings.appVerificationDisabledForTesting=!0,Ni(o)?(hm(`${s}//${o}${c}`),fm("Auth",!0)):Jk()}function LI(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function Xk(t){const e=LI(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const s=i[1];return{host:s,port:Hv(r.substr(s.length+1))}}else{const[s,o]=r.split(":");return{host:s,port:Hv(o)}}}function Hv(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function Jk(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wm{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return wr("not implemented")}_getIdTokenResponse(e){return wr("not implemented")}_linkToIdToken(e,n){return wr("not implemented")}_getReauthenticationResolver(e){return wr("not implemented")}}async function Zk(t,e){return Di(t,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function eN(t,e){return Qu(t,"POST","/v1/accounts:signInWithPassword",_s(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function tN(t,e){return Qu(t,"POST","/v1/accounts:signInWithEmailLink",_s(t,e))}async function nN(t,e){return Qu(t,"POST","/v1/accounts:signInWithEmailLink",_s(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qa extends wm{constructor(e,n,r,i=null){super("password",r),this._email=e,this._password=n,this._tenantId=i}static _fromEmailAndPassword(e,n){return new Qa(e,n,"password")}static _fromEmailAndCode(e,n,r=null){return new Qa(e,n,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e;if(n!=null&&n.email&&(n!=null&&n.password)){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return qv(e,n,"signInWithPassword",eN);case"emailLink":return tN(e,{email:this._email,oobCode:this._password});default:$n(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":const r={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return qv(e,r,"signUpPassword",Zk);case"emailLink":return nN(e,{idToken:n,email:this._email,oobCode:this._password});default:$n(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Zs(t,e){return Qu(t,"POST","/v1/accounts:signInWithIdp",_s(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rN="http://localhost";class ls extends wm{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new ls(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):$n("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i,...s}=n;if(!r||!i)return null;const o=new ls(r,i);return o.idToken=s.idToken||void 0,o.accessToken=s.accessToken||void 0,o.secret=s.secret,o.nonce=s.nonce,o.pendingToken=s.pendingToken||null,o}_getIdTokenResponse(e){const n=this.buildRequest();return Zs(e,n)}_linkToIdToken(e,n){const r=this.buildRequest();return r.idToken=n,Zs(e,r)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,Zs(e,n)}buildRequest(){const e={requestUri:rN,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=ul(n)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function iN(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function sN(t){const e=oa(aa(t)).link,n=e?oa(aa(e)).deep_link_id:null,r=oa(aa(t)).deep_link_id;return(r?oa(aa(r)).link:null)||r||n||e||t}class Em{constructor(e){const n=oa(aa(e)),r=n.apiKey??null,i=n.oobCode??null,s=iN(n.mode??null);ae(r&&i&&s,"argument-error"),this.apiKey=r,this.operation=s,this.code=i,this.continueUrl=n.continueUrl??null,this.languageCode=n.lang??null,this.tenantId=n.tenantId??null}static parseLink(e){const n=sN(e);try{return new Em(n)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ro{constructor(){this.providerId=Ro.PROVIDER_ID}static credential(e,n){return Qa._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){const r=Em.parseLink(n);return ae(r,"argument-error"),Qa._fromEmailAndCode(e,r.code,r.tenantId)}}Ro.PROVIDER_ID="password";Ro.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Ro.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class VI{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hl extends VI{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yr extends hl{constructor(){super("facebook.com")}static credential(e){return ls._fromParams({providerId:Yr.PROVIDER_ID,signInMethod:Yr.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Yr.credentialFromTaggedObject(e)}static credentialFromError(e){return Yr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Yr.credential(e.oauthAccessToken)}catch{return null}}}Yr.FACEBOOK_SIGN_IN_METHOD="facebook.com";Yr.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xr extends hl{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return ls._fromParams({providerId:Xr.PROVIDER_ID,signInMethod:Xr.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return Xr.credentialFromTaggedObject(e)}static credentialFromError(e){return Xr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r}=e;if(!n&&!r)return null;try{return Xr.credential(n,r)}catch{return null}}}Xr.GOOGLE_SIGN_IN_METHOD="google.com";Xr.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jr extends hl{constructor(){super("github.com")}static credential(e){return ls._fromParams({providerId:Jr.PROVIDER_ID,signInMethod:Jr.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Jr.credentialFromTaggedObject(e)}static credentialFromError(e){return Jr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Jr.credential(e.oauthAccessToken)}catch{return null}}}Jr.GITHUB_SIGN_IN_METHOD="github.com";Jr.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zr extends hl{constructor(){super("twitter.com")}static credential(e,n){return ls._fromParams({providerId:Zr.PROVIDER_ID,signInMethod:Zr.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return Zr.credentialFromTaggedObject(e)}static credentialFromError(e){return Zr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:r}=e;if(!n||!r)return null;try{return Zr.credential(n,r)}catch{return null}}}Zr.TWITTER_SIGN_IN_METHOD="twitter.com";Zr.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ho{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,i=!1){const s=await Vn._fromIdTokenResponse(e,r,i),o=Wv(r);return new ho({user:s,providerId:o,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const i=Wv(r);return new ho({user:e,providerId:i,_tokenResponse:r,operationType:n})}}function Wv(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cu extends kn{constructor(e,n,r,i){super(n.code,n.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,cu.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,i){return new cu(e,n,r,i)}}function jI(t,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?cu._fromErrorAndOperation(t,s,e,r):s})}async function oN(t,e,n=!1){const r=await Ka(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return ho._forOperation(t,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function aN(t,e,n=!1){const{auth:r}=t;if(Tn(r.app))return Promise.reject(gi(r));const i="reauthenticate";try{const s=await Ka(t,jI(r,i,e,t),n);ae(s.idToken,r,"internal-error");const o=vm(s.idToken);ae(o,r,"internal-error");const{sub:l}=o;return ae(t.uid===l,r,"user-mismatch"),ho._forOperation(t,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&$n(r,"user-mismatch"),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function MI(t,e,n=!1){if(Tn(t.app))return Promise.reject(gi(t));const r="signIn",i=await jI(t,r,e),s=await ho._fromIdTokenResponse(t,r,i);return n||await t._updateCurrentUser(s.user),s}async function lN(t,e){return MI(Ao(t),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function cN(t){const e=Ao(t);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}function uN(t,e,n){return Tn(t.app)?Promise.reject(gi(t)):lN(Ve(t),Ro.credential(e,n)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&cN(t),r})}function dN(t,e,n,r){return Ve(t).onIdTokenChanged(e,n,r)}function hN(t,e,n){return Ve(t).beforeAuthStateChanged(e,n)}function fN(t,e,n,r){return Ve(t).onAuthStateChanged(e,n,r)}function pN(t){return Ve(t).signOut()}const uu="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FI{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(uu,"1"),this.storage.removeItem(uu),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mN=1e3,gN=10;class UI extends FI{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=NI(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),i=this.localCache[n];r!==i&&e(n,i,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((o,l,c)=>{this.notifyListeners(o,c)});return}const r=e.key;n?this.detachListener():this.stopPolling();const i=()=>{const o=this.storage.getItem(r);!n&&this.localCache[r]===o||this.notifyListeners(r,o)},s=this.storage.getItem(r);Ok()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,gN):i()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},mN)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}UI.type="LOCAL";const yN=UI;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $I extends FI{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}$I.type="SESSION";const BI=$I;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vN(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xu{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(i=>i.isListeningto(e));if(n)return n;const r=new Xu(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:r,eventType:i,data:s}=n.data,o=this.handlersMap[i];if(!(o!=null&&o.size))return;n.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const l=Array.from(o).map(async u=>u(n.origin,s)),c=await vN(l);n.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:c})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Xu.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tm(t="",e=10){let n="";for(let r=0;r<e;r++)n+=Math.floor(Math.random()*10);return t+n}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _N{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,r=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,o;return new Promise((l,c)=>{const u=Tm("",20);i.port1.start();const f=setTimeout(()=>{c(new Error("unsupported_event"))},r);o={messageChannel:i,onMessage(p){const g=p;if(g.data.eventId===u)switch(g.data.status){case"ack":clearTimeout(f),s=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),l(g.data.response);break;default:clearTimeout(f),clearTimeout(s),c(new Error("invalid_response"));break}}},this.handlers.add(o),i.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:u,data:n},[i.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ir(){return window}function wN(t){ir().location.href=t}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zI(){return typeof ir().WorkerGlobalScope<"u"&&typeof ir().importScripts=="function"}async function EN(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function TN(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)==null?void 0:t.controller)||null}function IN(){return zI()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qI="firebaseLocalStorageDb",SN=1,du="firebaseLocalStorage",HI="fbase_key";class fl{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function Ju(t,e){return t.transaction([du],e?"readwrite":"readonly").objectStore(du)}function CN(){const t=indexedDB.deleteDatabase(qI);return new fl(t).toPromise()}function Bf(){const t=indexedDB.open(qI,SN);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const r=t.result;try{r.createObjectStore(du,{keyPath:HI})}catch(i){n(i)}}),t.addEventListener("success",async()=>{const r=t.result;r.objectStoreNames.contains(du)?e(r):(r.close(),await CN(),e(await Bf()))})})}async function Gv(t,e,n){const r=Ju(t,!0).put({[HI]:e,value:n});return new fl(r).toPromise()}async function AN(t,e){const n=Ju(t,!1).get(e),r=await new fl(n).toPromise();return r===void 0?null:r.value}function Kv(t,e){const n=Ju(t,!0).delete(e);return new fl(n).toPromise()}const RN=800,xN=3;class WI{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Bf(),this.db)}async _withRetries(e){let n=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(n++>xN)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return zI()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Xu._getInstance(IN()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var n,r;if(this.activeServiceWorker=await EN(),!this.activeServiceWorker)return;this.sender=new _N(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(n=e[0])!=null&&n.fulfilled&&(r=e[0])!=null&&r.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||TN()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Bf();return await Gv(e,uu,"1"),await Kv(e,uu),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(r=>Gv(r,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(r=>AN(r,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>Kv(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(i=>{const s=Ju(i,!1).getAll();return new fl(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],r=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),n.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),n.push(i));return n}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),RN)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}WI.type="LOCAL";const PN=WI;new dl(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kN(t,e){return e?Er(e):(ae(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Im extends wm{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Zs(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Zs(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Zs(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function NN(t){return MI(t.auth,new Im(t),t.bypassAuthState)}function bN(t){const{auth:e,user:n}=t;return ae(n,e,"internal-error"),aN(n,new Im(t),t.bypassAuthState)}async function DN(t){const{auth:e,user:n}=t;return ae(n,e,"internal-error"),oN(n,new Im(t),t.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class GI{constructor(e,n,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:r,postBody:i,tenantId:s,error:o,type:l}=e;if(o){this.reject(o);return}const c={auth:this.auth,requestUri:n,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(c))}catch(u){this.reject(u)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return NN;case"linkViaPopup":case"linkViaRedirect":return DN;case"reauthViaPopup":case"reauthViaRedirect":return bN;default:$n(this.auth,"internal-error")}}resolve(e){Nr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Nr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ON=new dl(2e3,1e4);class qs extends GI{constructor(e,n,r,i,s){super(e,n,i,s),this.provider=r,this.authWindow=null,this.pollId=null,qs.currentPopupAction&&qs.currentPopupAction.cancel(),qs.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return ae(e,this.auth,"internal-error"),e}async onExecution(){Nr(this.filter.length===1,"Popup operations only handle one event");const e=Tm();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(rr(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(rr(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,qs.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,r;if((r=(n=this.authWindow)==null?void 0:n.window)!=null&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(rr(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,ON.get())};e()}}qs.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const LN="pendingRedirect",Cc=new Map;class VN extends GI{constructor(e,n,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,r),this.eventId=null}async execute(){let e=Cc.get(this.auth._key());if(!e){try{const r=await jN(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(n){e=()=>Promise.reject(n)}Cc.set(this.auth._key(),e)}return this.bypassAuthState||Cc.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function jN(t,e){const n=UN(e),r=FN(t);if(!await r._isAvailable())return!1;const i=await r._get(n)==="true";return await r._remove(n),i}function MN(t,e){Cc.set(t._key(),e)}function FN(t){return Er(t._redirectPersistence)}function UN(t){return Sc(LN,t.config.apiKey,t.name)}async function $N(t,e,n=!1){if(Tn(t.app))return Promise.reject(gi(t));const r=Ao(t),i=kN(r,e),o=await new VN(r,i,n).execute();return o&&!n&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const BN=10*60*1e3;class zN{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(n=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!qN(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var r;if(e.error&&!KI(e)){const i=((r=e.error.code)==null?void 0:r.split("auth/")[1])||"internal-error";n.onError(rr(this.auth,i))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const r=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=BN&&this.cachedEventUids.clear(),this.cachedEventUids.has(Qv(e))}saveEventToCache(e){this.cachedEventUids.add(Qv(e)),this.lastProcessedEventTime=Date.now()}}function Qv(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function KI({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function qN(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return KI(t);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function HN(t,e={}){return Di(t,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WN=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,GN=/^https?/;async function KN(t){if(t.config.emulator)return;const{authorizedDomains:e}=await HN(t);for(const n of e)try{if(QN(n))return}catch{}$n(t,"unauthorized-domain")}function QN(t){const e=Uf(),{protocol:n,hostname:r}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&r===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&o.hostname===r}if(!GN.test(n))return!1;if(WN.test(t))return r===t;const i=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const YN=new dl(3e4,6e4);function Yv(){const t=ir().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function XN(t){return new Promise((e,n)=>{var i,s,o;function r(){Yv(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Yv(),n(rr(t,"network-request-failed"))},timeout:YN.get()})}if((s=(i=ir().gapi)==null?void 0:i.iframes)!=null&&s.Iframe)e(gapi.iframes.getContext());else if((o=ir().gapi)!=null&&o.load)r();else{const l=zk("iframefcb");return ir()[l]=()=>{gapi.load?r():n(rr(t,"network-request-failed"))},DI(`${Bk()}?onload=${l}`).catch(c=>n(c))}}).catch(e=>{throw Ac=null,e})}let Ac=null;function JN(t){return Ac=Ac||XN(t),Ac}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ZN=new dl(5e3,15e3),eb="__/auth/iframe",tb="emulator/auth/iframe",nb={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},rb=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function ib(t){const e=t.config;ae(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?ym(e,tb):`https://${t.config.authDomain}/${eb}`,r={apiKey:e.apiKey,appName:t.name,v:vs},i=rb.get(t.config.apiHost);i&&(r.eid=i);const s=t._getFrameworks();return s.length&&(r.fw=s.join(",")),`${n}?${ul(r).slice(1)}`}async function sb(t){const e=await JN(t),n=ir().gapi;return ae(n,t,"internal-error"),e.open({where:document.body,url:ib(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:nb,dontclear:!0},r=>new Promise(async(i,s)=>{await r.restyle({setHideOnLeave:!1});const o=rr(t,"network-request-failed"),l=ir().setTimeout(()=>{s(o)},ZN.get());function c(){ir().clearTimeout(l),i(r)}r.ping(c).then(c,()=>{s(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ob={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},ab=500,lb=600,cb="_blank",ub="http://localhost";class Xv{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function db(t,e,n,r=ab,i=lb){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let l="";const c={...ob,width:r.toString(),height:i.toString(),top:s,left:o},u=jt().toLowerCase();n&&(l=AI(u)?cb:n),SI(u)&&(e=e||ub,c.scrollbars="yes");const f=Object.entries(c).reduce((g,[S,v])=>`${g}${S}=${v},`,"");if(Dk(u)&&l!=="_self")return hb(e||"",l),new Xv(null);const p=window.open(e||"",l,f);ae(p,t,"popup-blocked");try{p.focus()}catch{}return new Xv(p)}function hb(t,e){const n=document.createElement("a");n.href=t,n.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fb="__/auth/handler",pb="emulator/auth/handler",mb=encodeURIComponent("fac");async function Jv(t,e,n,r,i,s){ae(t.config.authDomain,t,"auth-domain-config-required"),ae(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:r,v:vs,eventId:i};if(e instanceof VI){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",Y1(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,p]of Object.entries({}))o[f]=p}if(e instanceof hl){const f=e.getScopes().filter(p=>p!=="");f.length>0&&(o.scopes=f.join(","))}t.tenantId&&(o.tid=t.tenantId);const l=o;for(const f of Object.keys(l))l[f]===void 0&&delete l[f];const c=await t._getAppCheckToken(),u=c?`#${mb}=${encodeURIComponent(c)}`:"";return`${gb(t)}?${ul(l).slice(1)}${u}`}function gb({config:t}){return t.emulator?ym(t,pb):`https://${t.authDomain}/${fb}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Eh="webStorageSupport";class yb{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=BI,this._completeRedirectFn=$N,this._overrideRedirectResult=MN}async _openPopup(e,n,r,i){var o;Nr((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const s=await Jv(e,n,r,Uf(),i);return db(e,s,Tm())}async _openRedirect(e,n,r,i){await this._originValidation(e);const s=await Jv(e,n,r,Uf(),i);return wN(s),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:i,promise:s}=this.eventManagers[n];return i?Promise.resolve(i):(Nr(s,"If manager is not set, promise should be"),s)}const r=this.initAndGetManager(e);return this.eventManagers[n]={promise:r},r.catch(()=>{delete this.eventManagers[n]}),r}async initAndGetManager(e){const n=await sb(e),r=new zN(e);return n.register("authEvent",i=>(ae(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=n,r}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(Eh,{type:Eh},i=>{var o;const s=(o=i==null?void 0:i[0])==null?void 0:o[Eh];s!==void 0&&n(!!s),$n(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=KN(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return NI()||CI()||_m()}}const vb=yb;var Zv="@firebase/auth",e_="1.11.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _b{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){ae(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wb(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Eb(t){Un(new Pn("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:o,authDomain:l}=r.options;ae(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const c={apiKey:o,authDomain:l,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:bI(t)},u=new Fk(r,i,s,c);return Qk(u,n),u},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),Un(new Pn("auth-internal",e=>{const n=Ao(e.getProvider("auth").getImmediate());return(r=>new _b(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),nn(Zv,e_,wb(t)),nn(Zv,e_,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tb=5*60,Ib=oI("authIdTokenMaxAge")||Tb;let t_=null;const Sb=t=>async e=>{const n=e&&await e.getIdTokenResult(),r=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(r&&r>Ib)return;const i=n==null?void 0:n.token;t_!==i&&(t_=i,await fetch(t,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function QI(t=Ku()){const e=bi(t,"auth");if(e.isInitialized())return e.getImmediate();const n=Kk(t,{popupRedirectResolver:vb,persistence:[PN,yN,BI]}),r=oI("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(r,location.origin);if(location.origin===s.origin){const o=Sb(s.toString());hN(n,o,()=>o(n.currentUser)),dN(n,l=>o(l))}}const i=rI("auth");return i&&Yk(n,`http://${i}`),n}function Cb(){var t;return((t=document.getElementsByTagName("head"))==null?void 0:t[0])??document}Uk({loadJS(t){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=i=>{const s=rr("internal-error");s.customData=i,n(s)},r.type="text/javascript",r.charset="UTF-8",Cb().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Eb("Browser");var n_=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var yi,YI;(function(){var t;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(C,T){function A(){}A.prototype=T.prototype,C.F=T.prototype,C.prototype=new A,C.prototype.constructor=C,C.D=function(x,P,k){for(var R=Array(arguments.length-2),$e=2;$e<arguments.length;$e++)R[$e-2]=arguments[$e];return T.prototype[P].apply(x,R)}}function n(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(r,n),r.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(C,T,A){A||(A=0);const x=Array(16);if(typeof T=="string")for(var P=0;P<16;++P)x[P]=T.charCodeAt(A++)|T.charCodeAt(A++)<<8|T.charCodeAt(A++)<<16|T.charCodeAt(A++)<<24;else for(P=0;P<16;++P)x[P]=T[A++]|T[A++]<<8|T[A++]<<16|T[A++]<<24;T=C.g[0],A=C.g[1],P=C.g[2];let k=C.g[3],R;R=T+(k^A&(P^k))+x[0]+3614090360&4294967295,T=A+(R<<7&4294967295|R>>>25),R=k+(P^T&(A^P))+x[1]+3905402710&4294967295,k=T+(R<<12&4294967295|R>>>20),R=P+(A^k&(T^A))+x[2]+606105819&4294967295,P=k+(R<<17&4294967295|R>>>15),R=A+(T^P&(k^T))+x[3]+3250441966&4294967295,A=P+(R<<22&4294967295|R>>>10),R=T+(k^A&(P^k))+x[4]+4118548399&4294967295,T=A+(R<<7&4294967295|R>>>25),R=k+(P^T&(A^P))+x[5]+1200080426&4294967295,k=T+(R<<12&4294967295|R>>>20),R=P+(A^k&(T^A))+x[6]+2821735955&4294967295,P=k+(R<<17&4294967295|R>>>15),R=A+(T^P&(k^T))+x[7]+4249261313&4294967295,A=P+(R<<22&4294967295|R>>>10),R=T+(k^A&(P^k))+x[8]+1770035416&4294967295,T=A+(R<<7&4294967295|R>>>25),R=k+(P^T&(A^P))+x[9]+2336552879&4294967295,k=T+(R<<12&4294967295|R>>>20),R=P+(A^k&(T^A))+x[10]+4294925233&4294967295,P=k+(R<<17&4294967295|R>>>15),R=A+(T^P&(k^T))+x[11]+2304563134&4294967295,A=P+(R<<22&4294967295|R>>>10),R=T+(k^A&(P^k))+x[12]+1804603682&4294967295,T=A+(R<<7&4294967295|R>>>25),R=k+(P^T&(A^P))+x[13]+4254626195&4294967295,k=T+(R<<12&4294967295|R>>>20),R=P+(A^k&(T^A))+x[14]+2792965006&4294967295,P=k+(R<<17&4294967295|R>>>15),R=A+(T^P&(k^T))+x[15]+1236535329&4294967295,A=P+(R<<22&4294967295|R>>>10),R=T+(P^k&(A^P))+x[1]+4129170786&4294967295,T=A+(R<<5&4294967295|R>>>27),R=k+(A^P&(T^A))+x[6]+3225465664&4294967295,k=T+(R<<9&4294967295|R>>>23),R=P+(T^A&(k^T))+x[11]+643717713&4294967295,P=k+(R<<14&4294967295|R>>>18),R=A+(k^T&(P^k))+x[0]+3921069994&4294967295,A=P+(R<<20&4294967295|R>>>12),R=T+(P^k&(A^P))+x[5]+3593408605&4294967295,T=A+(R<<5&4294967295|R>>>27),R=k+(A^P&(T^A))+x[10]+38016083&4294967295,k=T+(R<<9&4294967295|R>>>23),R=P+(T^A&(k^T))+x[15]+3634488961&4294967295,P=k+(R<<14&4294967295|R>>>18),R=A+(k^T&(P^k))+x[4]+3889429448&4294967295,A=P+(R<<20&4294967295|R>>>12),R=T+(P^k&(A^P))+x[9]+568446438&4294967295,T=A+(R<<5&4294967295|R>>>27),R=k+(A^P&(T^A))+x[14]+3275163606&4294967295,k=T+(R<<9&4294967295|R>>>23),R=P+(T^A&(k^T))+x[3]+4107603335&4294967295,P=k+(R<<14&4294967295|R>>>18),R=A+(k^T&(P^k))+x[8]+1163531501&4294967295,A=P+(R<<20&4294967295|R>>>12),R=T+(P^k&(A^P))+x[13]+2850285829&4294967295,T=A+(R<<5&4294967295|R>>>27),R=k+(A^P&(T^A))+x[2]+4243563512&4294967295,k=T+(R<<9&4294967295|R>>>23),R=P+(T^A&(k^T))+x[7]+1735328473&4294967295,P=k+(R<<14&4294967295|R>>>18),R=A+(k^T&(P^k))+x[12]+2368359562&4294967295,A=P+(R<<20&4294967295|R>>>12),R=T+(A^P^k)+x[5]+4294588738&4294967295,T=A+(R<<4&4294967295|R>>>28),R=k+(T^A^P)+x[8]+2272392833&4294967295,k=T+(R<<11&4294967295|R>>>21),R=P+(k^T^A)+x[11]+1839030562&4294967295,P=k+(R<<16&4294967295|R>>>16),R=A+(P^k^T)+x[14]+4259657740&4294967295,A=P+(R<<23&4294967295|R>>>9),R=T+(A^P^k)+x[1]+2763975236&4294967295,T=A+(R<<4&4294967295|R>>>28),R=k+(T^A^P)+x[4]+1272893353&4294967295,k=T+(R<<11&4294967295|R>>>21),R=P+(k^T^A)+x[7]+4139469664&4294967295,P=k+(R<<16&4294967295|R>>>16),R=A+(P^k^T)+x[10]+3200236656&4294967295,A=P+(R<<23&4294967295|R>>>9),R=T+(A^P^k)+x[13]+681279174&4294967295,T=A+(R<<4&4294967295|R>>>28),R=k+(T^A^P)+x[0]+3936430074&4294967295,k=T+(R<<11&4294967295|R>>>21),R=P+(k^T^A)+x[3]+3572445317&4294967295,P=k+(R<<16&4294967295|R>>>16),R=A+(P^k^T)+x[6]+76029189&4294967295,A=P+(R<<23&4294967295|R>>>9),R=T+(A^P^k)+x[9]+3654602809&4294967295,T=A+(R<<4&4294967295|R>>>28),R=k+(T^A^P)+x[12]+3873151461&4294967295,k=T+(R<<11&4294967295|R>>>21),R=P+(k^T^A)+x[15]+530742520&4294967295,P=k+(R<<16&4294967295|R>>>16),R=A+(P^k^T)+x[2]+3299628645&4294967295,A=P+(R<<23&4294967295|R>>>9),R=T+(P^(A|~k))+x[0]+4096336452&4294967295,T=A+(R<<6&4294967295|R>>>26),R=k+(A^(T|~P))+x[7]+1126891415&4294967295,k=T+(R<<10&4294967295|R>>>22),R=P+(T^(k|~A))+x[14]+2878612391&4294967295,P=k+(R<<15&4294967295|R>>>17),R=A+(k^(P|~T))+x[5]+4237533241&4294967295,A=P+(R<<21&4294967295|R>>>11),R=T+(P^(A|~k))+x[12]+1700485571&4294967295,T=A+(R<<6&4294967295|R>>>26),R=k+(A^(T|~P))+x[3]+2399980690&4294967295,k=T+(R<<10&4294967295|R>>>22),R=P+(T^(k|~A))+x[10]+4293915773&4294967295,P=k+(R<<15&4294967295|R>>>17),R=A+(k^(P|~T))+x[1]+2240044497&4294967295,A=P+(R<<21&4294967295|R>>>11),R=T+(P^(A|~k))+x[8]+1873313359&4294967295,T=A+(R<<6&4294967295|R>>>26),R=k+(A^(T|~P))+x[15]+4264355552&4294967295,k=T+(R<<10&4294967295|R>>>22),R=P+(T^(k|~A))+x[6]+2734768916&4294967295,P=k+(R<<15&4294967295|R>>>17),R=A+(k^(P|~T))+x[13]+1309151649&4294967295,A=P+(R<<21&4294967295|R>>>11),R=T+(P^(A|~k))+x[4]+4149444226&4294967295,T=A+(R<<6&4294967295|R>>>26),R=k+(A^(T|~P))+x[11]+3174756917&4294967295,k=T+(R<<10&4294967295|R>>>22),R=P+(T^(k|~A))+x[2]+718787259&4294967295,P=k+(R<<15&4294967295|R>>>17),R=A+(k^(P|~T))+x[9]+3951481745&4294967295,C.g[0]=C.g[0]+T&4294967295,C.g[1]=C.g[1]+(P+(R<<21&4294967295|R>>>11))&4294967295,C.g[2]=C.g[2]+P&4294967295,C.g[3]=C.g[3]+k&4294967295}r.prototype.v=function(C,T){T===void 0&&(T=C.length);const A=T-this.blockSize,x=this.C;let P=this.h,k=0;for(;k<T;){if(P==0)for(;k<=A;)i(this,C,k),k+=this.blockSize;if(typeof C=="string"){for(;k<T;)if(x[P++]=C.charCodeAt(k++),P==this.blockSize){i(this,x),P=0;break}}else for(;k<T;)if(x[P++]=C[k++],P==this.blockSize){i(this,x),P=0;break}}this.h=P,this.o+=T},r.prototype.A=function(){var C=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);C[0]=128;for(var T=1;T<C.length-8;++T)C[T]=0;T=this.o*8;for(var A=C.length-8;A<C.length;++A)C[A]=T&255,T/=256;for(this.v(C),C=Array(16),T=0,A=0;A<4;++A)for(let x=0;x<32;x+=8)C[T++]=this.g[A]>>>x&255;return C};function s(C,T){var A=l;return Object.prototype.hasOwnProperty.call(A,C)?A[C]:A[C]=T(C)}function o(C,T){this.h=T;const A=[];let x=!0;for(let P=C.length-1;P>=0;P--){const k=C[P]|0;x&&k==T||(A[P]=k,x=!1)}this.g=A}var l={};function c(C){return-128<=C&&C<128?s(C,function(T){return new o([T|0],T<0?-1:0)}):new o([C|0],C<0?-1:0)}function u(C){if(isNaN(C)||!isFinite(C))return p;if(C<0)return b(u(-C));const T=[];let A=1;for(let x=0;C>=A;x++)T[x]=C/A|0,A*=4294967296;return new o(T,0)}function f(C,T){if(C.length==0)throw Error("number format error: empty string");if(T=T||10,T<2||36<T)throw Error("radix out of range: "+T);if(C.charAt(0)=="-")return b(f(C.substring(1),T));if(C.indexOf("-")>=0)throw Error('number format error: interior "-" character');const A=u(Math.pow(T,8));let x=p;for(let k=0;k<C.length;k+=8){var P=Math.min(8,C.length-k);const R=parseInt(C.substring(k,k+P),T);P<8?(P=u(Math.pow(T,P)),x=x.j(P).add(u(R))):(x=x.j(A),x=x.add(u(R)))}return x}var p=c(0),g=c(1),S=c(16777216);t=o.prototype,t.m=function(){if(N(this))return-b(this).m();let C=0,T=1;for(let A=0;A<this.g.length;A++){const x=this.i(A);C+=(x>=0?x:4294967296+x)*T,T*=4294967296}return C},t.toString=function(C){if(C=C||10,C<2||36<C)throw Error("radix out of range: "+C);if(v(this))return"0";if(N(this))return"-"+b(this).toString(C);const T=u(Math.pow(C,6));var A=this;let x="";for(;;){const P=L(A,T).g;A=I(A,P.j(T));let k=((A.g.length>0?A.g[0]:A.h)>>>0).toString(C);if(A=P,v(A))return k+x;for(;k.length<6;)k="0"+k;x=k+x}},t.i=function(C){return C<0?0:C<this.g.length?this.g[C]:this.h};function v(C){if(C.h!=0)return!1;for(let T=0;T<C.g.length;T++)if(C.g[T]!=0)return!1;return!0}function N(C){return C.h==-1}t.l=function(C){return C=I(this,C),N(C)?-1:v(C)?0:1};function b(C){const T=C.g.length,A=[];for(let x=0;x<T;x++)A[x]=~C.g[x];return new o(A,~C.h).add(g)}t.abs=function(){return N(this)?b(this):this},t.add=function(C){const T=Math.max(this.g.length,C.g.length),A=[];let x=0;for(let P=0;P<=T;P++){let k=x+(this.i(P)&65535)+(C.i(P)&65535),R=(k>>>16)+(this.i(P)>>>16)+(C.i(P)>>>16);x=R>>>16,k&=65535,R&=65535,A[P]=R<<16|k}return new o(A,A[A.length-1]&-2147483648?-1:0)};function I(C,T){return C.add(b(T))}t.j=function(C){if(v(this)||v(C))return p;if(N(this))return N(C)?b(this).j(b(C)):b(b(this).j(C));if(N(C))return b(this.j(b(C)));if(this.l(S)<0&&C.l(S)<0)return u(this.m()*C.m());const T=this.g.length+C.g.length,A=[];for(var x=0;x<2*T;x++)A[x]=0;for(x=0;x<this.g.length;x++)for(let P=0;P<C.g.length;P++){const k=this.i(x)>>>16,R=this.i(x)&65535,$e=C.i(P)>>>16,Et=C.i(P)&65535;A[2*x+2*P]+=R*Et,E(A,2*x+2*P),A[2*x+2*P+1]+=k*Et,E(A,2*x+2*P+1),A[2*x+2*P+1]+=R*$e,E(A,2*x+2*P+1),A[2*x+2*P+2]+=k*$e,E(A,2*x+2*P+2)}for(C=0;C<T;C++)A[C]=A[2*C+1]<<16|A[2*C];for(C=T;C<2*T;C++)A[C]=0;return new o(A,0)};function E(C,T){for(;(C[T]&65535)!=C[T];)C[T+1]+=C[T]>>>16,C[T]&=65535,T++}function y(C,T){this.g=C,this.h=T}function L(C,T){if(v(T))throw Error("division by zero");if(v(C))return new y(p,p);if(N(C))return T=L(b(C),T),new y(b(T.g),b(T.h));if(N(T))return T=L(C,b(T)),new y(b(T.g),T.h);if(C.g.length>30){if(N(C)||N(T))throw Error("slowDivide_ only works with positive integers.");for(var A=g,x=T;x.l(C)<=0;)A=$(A),x=$(x);var P=B(A,1),k=B(x,1);for(x=B(x,2),A=B(A,2);!v(x);){var R=k.add(x);R.l(C)<=0&&(P=P.add(A),k=R),x=B(x,1),A=B(A,1)}return T=I(C,P.j(T)),new y(P,T)}for(P=p;C.l(T)>=0;){for(A=Math.max(1,Math.floor(C.m()/T.m())),x=Math.ceil(Math.log(A)/Math.LN2),x=x<=48?1:Math.pow(2,x-48),k=u(A),R=k.j(T);N(R)||R.l(C)>0;)A-=x,k=u(A),R=k.j(T);v(k)&&(k=g),P=P.add(k),C=I(C,R)}return new y(P,C)}t.B=function(C){return L(this,C).h},t.and=function(C){const T=Math.max(this.g.length,C.g.length),A=[];for(let x=0;x<T;x++)A[x]=this.i(x)&C.i(x);return new o(A,this.h&C.h)},t.or=function(C){const T=Math.max(this.g.length,C.g.length),A=[];for(let x=0;x<T;x++)A[x]=this.i(x)|C.i(x);return new o(A,this.h|C.h)},t.xor=function(C){const T=Math.max(this.g.length,C.g.length),A=[];for(let x=0;x<T;x++)A[x]=this.i(x)^C.i(x);return new o(A,this.h^C.h)};function $(C){const T=C.g.length+1,A=[];for(let x=0;x<T;x++)A[x]=C.i(x)<<1|C.i(x-1)>>>31;return new o(A,C.h)}function B(C,T){const A=T>>5;T%=32;const x=C.g.length-A,P=[];for(let k=0;k<x;k++)P[k]=T>0?C.i(k+A)>>>T|C.i(k+A+1)<<32-T:C.i(k+A);return new o(P,C.h)}r.prototype.digest=r.prototype.A,r.prototype.reset=r.prototype.u,r.prototype.update=r.prototype.v,YI=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.B,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=u,o.fromString=f,yi=o}).apply(typeof n_<"u"?n_:typeof self<"u"?self:typeof window<"u"?window:{});var ec=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var XI,la,JI,Rc,zf,ZI,e0,t0;(function(){var t,e=Object.defineProperty;function n(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof ec=="object"&&ec];for(var h=0;h<a.length;++h){var m=a[h];if(m&&m.Math==Math)return m}throw Error("Cannot find global object")}var r=n(this);function i(a,h){if(h)e:{var m=r;a=a.split(".");for(var _=0;_<a.length-1;_++){var O=a[_];if(!(O in m))break e;m=m[O]}a=a[a.length-1],_=m[a],h=h(_),h!=_&&h!=null&&e(m,a,{configurable:!0,writable:!0,value:h})}}i("Symbol.dispose",function(a){return a||Symbol("Symbol.dispose")}),i("Array.prototype.values",function(a){return a||function(){return this[Symbol.iterator]()}}),i("Object.entries",function(a){return a||function(h){var m=[],_;for(_ in h)Object.prototype.hasOwnProperty.call(h,_)&&m.push([_,h[_]]);return m}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var s=s||{},o=this||self;function l(a){var h=typeof a;return h=="object"&&a!=null||h=="function"}function c(a,h,m){return a.call.apply(a.bind,arguments)}function u(a,h,m){return u=c,u.apply(null,arguments)}function f(a,h){var m=Array.prototype.slice.call(arguments,1);return function(){var _=m.slice();return _.push.apply(_,arguments),a.apply(this,_)}}function p(a,h){function m(){}m.prototype=h.prototype,a.Z=h.prototype,a.prototype=new m,a.prototype.constructor=a,a.Ob=function(_,O,V){for(var W=Array(arguments.length-2),pe=2;pe<arguments.length;pe++)W[pe-2]=arguments[pe];return h.prototype[O].apply(_,W)}}var g=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?a=>a&&AsyncContext.Snapshot.wrap(a):a=>a;function S(a){const h=a.length;if(h>0){const m=Array(h);for(let _=0;_<h;_++)m[_]=a[_];return m}return[]}function v(a,h){for(let _=1;_<arguments.length;_++){const O=arguments[_];var m=typeof O;if(m=m!="object"?m:O?Array.isArray(O)?"array":m:"null",m=="array"||m=="object"&&typeof O.length=="number"){m=a.length||0;const V=O.length||0;a.length=m+V;for(let W=0;W<V;W++)a[m+W]=O[W]}else a.push(O)}}class N{constructor(h,m){this.i=h,this.j=m,this.h=0,this.g=null}get(){let h;return this.h>0?(this.h--,h=this.g,this.g=h.next,h.next=null):h=this.i(),h}}function b(a){o.setTimeout(()=>{throw a},0)}function I(){var a=C;let h=null;return a.g&&(h=a.g,a.g=a.g.next,a.g||(a.h=null),h.next=null),h}class E{constructor(){this.h=this.g=null}add(h,m){const _=y.get();_.set(h,m),this.h?this.h.next=_:this.g=_,this.h=_}}var y=new N(()=>new L,a=>a.reset());class L{constructor(){this.next=this.g=this.h=null}set(h,m){this.h=h,this.g=m,this.next=null}reset(){this.next=this.g=this.h=null}}let $,B=!1,C=new E,T=()=>{const a=Promise.resolve(void 0);$=()=>{a.then(A)}};function A(){for(var a;a=I();){try{a.h.call(a.g)}catch(m){b(m)}var h=y;h.j(a),h.h<100&&(h.h++,a.next=h.g,h.g=a)}B=!1}function x(){this.u=this.u,this.C=this.C}x.prototype.u=!1,x.prototype.dispose=function(){this.u||(this.u=!0,this.N())},x.prototype[Symbol.dispose]=function(){this.dispose()},x.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function P(a,h){this.type=a,this.g=this.target=h,this.defaultPrevented=!1}P.prototype.h=function(){this.defaultPrevented=!0};var k=function(){if(!o.addEventListener||!Object.defineProperty)return!1;var a=!1,h=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const m=()=>{};o.addEventListener("test",m,h),o.removeEventListener("test",m,h)}catch{}return a}();function R(a){return/^[\s\xa0]*$/.test(a)}function $e(a,h){P.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a&&this.init(a,h)}p($e,P),$e.prototype.init=function(a,h){const m=this.type=a.type,_=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement,this.g=h,h=a.relatedTarget,h||(m=="mouseover"?h=a.fromElement:m=="mouseout"&&(h=a.toElement)),this.relatedTarget=h,_?(this.clientX=_.clientX!==void 0?_.clientX:_.pageX,this.clientY=_.clientY!==void 0?_.clientY:_.pageY,this.screenX=_.screenX||0,this.screenY=_.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=a.pointerType,this.state=a.state,this.i=a,a.defaultPrevented&&$e.Z.h.call(this)},$e.prototype.h=function(){$e.Z.h.call(this);const a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var Et="closure_listenable_"+(Math.random()*1e6|0),yn=0;function Nn(a,h,m,_,O){this.listener=a,this.proxy=null,this.src=h,this.type=m,this.capture=!!_,this.ha=O,this.key=++yn,this.da=this.fa=!1}function Y(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function se(a,h,m){for(const _ in a)h.call(m,a[_],_,a)}function oe(a,h){for(const m in a)h.call(void 0,a[m],m,a)}function ke(a){const h={};for(const m in a)h[m]=a[m];return h}const Ne="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function F(a,h){let m,_;for(let O=1;O<arguments.length;O++){_=arguments[O];for(m in _)a[m]=_[m];for(let V=0;V<Ne.length;V++)m=Ne[V],Object.prototype.hasOwnProperty.call(_,m)&&(a[m]=_[m])}}function H(a){this.src=a,this.g={},this.h=0}H.prototype.add=function(a,h,m,_,O){const V=a.toString();a=this.g[V],a||(a=this.g[V]=[],this.h++);const W=Q(a,h,_,O);return W>-1?(h=a[W],m||(h.fa=!1)):(h=new Nn(h,this.src,V,!!_,O),h.fa=m,a.push(h)),h};function z(a,h){const m=h.type;if(m in a.g){var _=a.g[m],O=Array.prototype.indexOf.call(_,h,void 0),V;(V=O>=0)&&Array.prototype.splice.call(_,O,1),V&&(Y(h),a.g[m].length==0&&(delete a.g[m],a.h--))}}function Q(a,h,m,_){for(let O=0;O<a.length;++O){const V=a[O];if(!V.da&&V.listener==h&&V.capture==!!m&&V.ha==_)return O}return-1}var J="closure_lm_"+(Math.random()*1e6|0),re={};function te(a,h,m,_,O){if(Array.isArray(h)){for(let V=0;V<h.length;V++)te(a,h[V],m,_,O);return null}return m=Ge(m),a&&a[Et]?a.J(h,m,l(_)?!!_.capture:!1,O):ge(a,h,m,!1,_,O)}function ge(a,h,m,_,O,V){if(!h)throw Error("Invalid event type");const W=l(O)?!!O.capture:!!O;let pe=Fe(a);if(pe||(a[J]=pe=new H(a)),m=pe.add(h,m,_,W,V),m.proxy)return m;if(_=ie(),m.proxy=_,_.src=a,_.listener=m,a.addEventListener)k||(O=W),O===void 0&&(O=!1),a.addEventListener(h.toString(),_,O);else if(a.attachEvent)a.attachEvent(Se(h.toString()),_);else if(a.addListener&&a.removeListener)a.addListener(_);else throw Error("addEventListener and attachEvent are unavailable.");return m}function ie(){function a(m){return h.call(a.src,a.listener,m)}const h=Ce;return a}function K(a,h,m,_,O){if(Array.isArray(h))for(var V=0;V<h.length;V++)K(a,h[V],m,_,O);else _=l(_)?!!_.capture:!!_,m=Ge(m),a&&a[Et]?(a=a.i,V=String(h).toString(),V in a.g&&(h=a.g[V],m=Q(h,m,_,O),m>-1&&(Y(h[m]),Array.prototype.splice.call(h,m,1),h.length==0&&(delete a.g[V],a.h--)))):a&&(a=Fe(a))&&(h=a.g[h.toString()],a=-1,h&&(a=Q(h,m,_,O)),(m=a>-1?h[a]:null)&&ce(m))}function ce(a){if(typeof a!="number"&&a&&!a.da){var h=a.src;if(h&&h[Et])z(h.i,a);else{var m=a.type,_=a.proxy;h.removeEventListener?h.removeEventListener(m,_,a.capture):h.detachEvent?h.detachEvent(Se(m),_):h.addListener&&h.removeListener&&h.removeListener(_),(m=Fe(h))?(z(m,a),m.h==0&&(m.src=null,h[J]=null)):Y(a)}}}function Se(a){return a in re?re[a]:re[a]="on"+a}function Ce(a,h){if(a.da)a=!0;else{h=new $e(h,this);const m=a.listener,_=a.ha||a.src;a.fa&&ce(a),a=m.call(_,h)}return a}function Fe(a){return a=a[J],a instanceof H?a:null}var be="__closure_events_fn_"+(Math.random()*1e9>>>0);function Ge(a){return typeof a=="function"?a:(a[be]||(a[be]=function(h){return a.handleEvent(h)}),a[be])}function he(){x.call(this),this.i=new H(this),this.M=this,this.G=null}p(he,x),he.prototype[Et]=!0,he.prototype.removeEventListener=function(a,h,m,_){K(this,a,h,m,_)};function w(a,h){var m,_=a.G;if(_)for(m=[];_;_=_.G)m.push(_);if(a=a.M,_=h.type||h,typeof h=="string")h=new P(h,a);else if(h instanceof P)h.target=h.target||a;else{var O=h;h=new P(_,a),F(h,O)}O=!0;let V,W;if(m)for(W=m.length-1;W>=0;W--)V=h.g=m[W],O=j(V,_,!0,h)&&O;if(V=h.g=a,O=j(V,_,!0,h)&&O,O=j(V,_,!1,h)&&O,m)for(W=0;W<m.length;W++)V=h.g=m[W],O=j(V,_,!1,h)&&O}he.prototype.N=function(){if(he.Z.N.call(this),this.i){var a=this.i;for(const h in a.g){const m=a.g[h];for(let _=0;_<m.length;_++)Y(m[_]);delete a.g[h],a.h--}}this.G=null},he.prototype.J=function(a,h,m,_){return this.i.add(String(a),h,!1,m,_)},he.prototype.K=function(a,h,m,_){return this.i.add(String(a),h,!0,m,_)};function j(a,h,m,_){if(h=a.i.g[String(h)],!h)return!0;h=h.concat();let O=!0;for(let V=0;V<h.length;++V){const W=h[V];if(W&&!W.da&&W.capture==m){const pe=W.listener,ht=W.ha||W.src;W.fa&&z(a.i,W),O=pe.call(ht,_)!==!1&&O}}return O&&!_.defaultPrevented}function X(a,h){if(typeof a!="function")if(a&&typeof a.handleEvent=="function")a=u(a.handleEvent,a);else throw Error("Invalid listener argument");return Number(h)>2147483647?-1:o.setTimeout(a,h||0)}function fe(a){a.g=X(()=>{a.g=null,a.i&&(a.i=!1,fe(a))},a.l);const h=a.h;a.h=null,a.m.apply(null,h)}class ye extends x{constructor(h,m){super(),this.m=h,this.l=m,this.h=null,this.i=!1,this.g=null}j(h){this.h=arguments,this.g?this.i=!0:fe(this)}N(){super.N(),this.g&&(o.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function ve(a){x.call(this),this.h=a,this.g={}}p(ve,x);var at=[];function Te(a){se(a.g,function(h,m){this.g.hasOwnProperty(m)&&ce(h)},a),a.g={}}ve.prototype.N=function(){ve.Z.N.call(this),Te(this)},ve.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Ke=o.JSON.stringify,Re=o.JSON.parse,it=class{stringify(a){return o.JSON.stringify(a,void 0)}parse(a){return o.JSON.parse(a,void 0)}};function xt(){}function rn(){}var Lr={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function fr(){P.call(this,"d")}p(fr,P);function Do(){P.call(this,"c")}p(Do,P);var sn={},Vr=null;function Hn(){return Vr=Vr||new he}sn.Ia="serverreachability";function pr(a){P.call(this,sn.Ia,a)}p(pr,P);function on(a){const h=Hn();w(h,new pr(h))}sn.STAT_EVENT="statevent";function Mt(a,h){P.call(this,sn.STAT_EVENT,a),this.stat=h}p(Mt,P);function De(a){const h=Hn();w(h,new Mt(h,a))}sn.Ja="timingevent";function Sl(a,h){P.call(this,sn.Ja,a),this.size=h}p(Sl,P);function jr(a,h){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return o.setTimeout(function(){a()},h)}function mr(){this.g=!0}mr.prototype.ua=function(){this.g=!1};function Wn(a,h,m,_,O,V){a.info(function(){if(a.g)if(V){var W="",pe=V.split("&");for(let je=0;je<pe.length;je++){var ht=pe[je].split("=");if(ht.length>1){const yt=ht[0];ht=ht[1];const Kn=yt.split("_");W=Kn.length>=2&&Kn[1]=="type"?W+(yt+"="+ht+"&"):W+(yt+"=redacted&")}}}else W=null;else W=V;return"XMLHTTP REQ ("+_+") [attempt "+O+"]: "+h+`
`+m+`
`+W})}function dC(a,h,m,_,O,V,W){a.info(function(){return"XMLHTTP RESP ("+_+") [ attempt "+O+"]: "+h+`
`+m+`
`+V+" "+W})}function Ts(a,h,m,_){a.info(function(){return"XMLHTTP TEXT ("+h+"): "+fC(a,m)+(_?" "+_:"")})}function hC(a,h){a.info(function(){return"TIMEOUT: "+h})}mr.prototype.info=function(){};function fC(a,h){if(!a.g)return h;if(!h)return null;try{const V=JSON.parse(h);if(V){for(a=0;a<V.length;a++)if(Array.isArray(V[a])){var m=V[a];if(!(m.length<2)){var _=m[1];if(Array.isArray(_)&&!(_.length<1)){var O=_[0];if(O!="noop"&&O!="stop"&&O!="close")for(let W=1;W<_.length;W++)_[W]=""}}}}return Ke(V)}catch{return h}}var Cl={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},Sg={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},Cg;function Rd(){}p(Rd,xt),Rd.prototype.g=function(){return new XMLHttpRequest},Cg=new Rd;function Oo(a){return encodeURIComponent(String(a))}function pC(a){var h=1;a=a.split(":");const m=[];for(;h>0&&a.length;)m.push(a.shift()),h--;return a.length&&m.push(a.join(":")),m}function Mr(a,h,m,_){this.j=a,this.i=h,this.l=m,this.S=_||1,this.V=new ve(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Ag}function Ag(){this.i=null,this.g="",this.h=!1}var Rg={},xd={};function Pd(a,h,m){a.M=1,a.A=Rl(Gn(h)),a.u=m,a.R=!0,xg(a,null)}function xg(a,h){a.F=Date.now(),Al(a),a.B=Gn(a.A);var m=a.B,_=a.S;Array.isArray(_)||(_=[String(_)]),$g(m.i,"t",_),a.C=0,m=a.j.L,a.h=new Ag,a.g=sy(a.j,m?h:null,!a.u),a.P>0&&(a.O=new ye(u(a.Y,a,a.g),a.P)),h=a.V,m=a.g,_=a.ba;var O="readystatechange";Array.isArray(O)||(O&&(at[0]=O.toString()),O=at);for(let V=0;V<O.length;V++){const W=te(m,O[V],_||h.handleEvent,!1,h.h||h);if(!W)break;h.g[W.key]=W}h=a.J?ke(a.J):{},a.u?(a.v||(a.v="POST"),h["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.B,a.v,a.u,h)):(a.v="GET",a.g.ea(a.B,a.v,null,h)),on(),Wn(a.i,a.v,a.B,a.l,a.S,a.u)}Mr.prototype.ba=function(a){a=a.target;const h=this.O;h&&$r(a)==3?h.j():this.Y(a)},Mr.prototype.Y=function(a){try{if(a==this.g)e:{const pe=$r(this.g),ht=this.g.ya(),je=this.g.ca();if(!(pe<3)&&(pe!=3||this.g&&(this.h.h||this.g.la()||Kg(this.g)))){this.K||pe!=4||ht==7||(ht==8||je<=0?on(3):on(2)),kd(this);var h=this.g.ca();this.X=h;var m=mC(this);if(this.o=h==200,dC(this.i,this.v,this.B,this.l,this.S,pe,h),this.o){if(this.U&&!this.L){t:{if(this.g){var _,O=this.g;if((_=O.g?O.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!R(_)){var V=_;break t}}V=null}if(a=V)Ts(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Nd(this,a);else{this.o=!1,this.m=3,De(12),ji(this),Lo(this);break e}}if(this.R){a=!0;let yt;for(;!this.K&&this.C<m.length;)if(yt=gC(this,m),yt==xd){pe==4&&(this.m=4,De(14),a=!1),Ts(this.i,this.l,null,"[Incomplete Response]");break}else if(yt==Rg){this.m=4,De(15),Ts(this.i,this.l,m,"[Invalid Chunk]"),a=!1;break}else Ts(this.i,this.l,yt,null),Nd(this,yt);if(Pg(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),pe!=4||m.length!=0||this.h.h||(this.m=1,De(16),a=!1),this.o=this.o&&a,!a)Ts(this.i,this.l,m,"[Invalid Chunked Response]"),ji(this),Lo(this);else if(m.length>0&&!this.W){this.W=!0;var W=this.j;W.g==this&&W.aa&&!W.P&&(W.j.info("Great, no buffering proxy detected. Bytes received: "+m.length),Fd(W),W.P=!0,De(11))}}else Ts(this.i,this.l,m,null),Nd(this,m);pe==4&&ji(this),this.o&&!this.K&&(pe==4?ty(this.j,this):(this.o=!1,Al(this)))}else kC(this.g),h==400&&m.indexOf("Unknown SID")>0?(this.m=3,De(12)):(this.m=0,De(13)),ji(this),Lo(this)}}}catch{}finally{}};function mC(a){if(!Pg(a))return a.g.la();const h=Kg(a.g);if(h==="")return"";let m="";const _=h.length,O=$r(a.g)==4;if(!a.h.i){if(typeof TextDecoder>"u")return ji(a),Lo(a),"";a.h.i=new o.TextDecoder}for(let V=0;V<_;V++)a.h.h=!0,m+=a.h.i.decode(h[V],{stream:!(O&&V==_-1)});return h.length=0,a.h.g+=m,a.C=0,a.h.g}function Pg(a){return a.g?a.v=="GET"&&a.M!=2&&a.j.Aa:!1}function gC(a,h){var m=a.C,_=h.indexOf(`
`,m);return _==-1?xd:(m=Number(h.substring(m,_)),isNaN(m)?Rg:(_+=1,_+m>h.length?xd:(h=h.slice(_,_+m),a.C=_+m,h)))}Mr.prototype.cancel=function(){this.K=!0,ji(this)};function Al(a){a.T=Date.now()+a.H,kg(a,a.H)}function kg(a,h){if(a.D!=null)throw Error("WatchDog timer not null");a.D=jr(u(a.aa,a),h)}function kd(a){a.D&&(o.clearTimeout(a.D),a.D=null)}Mr.prototype.aa=function(){this.D=null;const a=Date.now();a-this.T>=0?(hC(this.i,this.B),this.M!=2&&(on(),De(17)),ji(this),this.m=2,Lo(this)):kg(this,this.T-a)};function Lo(a){a.j.I==0||a.K||ty(a.j,a)}function ji(a){kd(a);var h=a.O;h&&typeof h.dispose=="function"&&h.dispose(),a.O=null,Te(a.V),a.g&&(h=a.g,a.g=null,h.abort(),h.dispose())}function Nd(a,h){try{var m=a.j;if(m.I!=0&&(m.g==a||bd(m.h,a))){if(!a.L&&bd(m.h,a)&&m.I==3){try{var _=m.Ba.g.parse(h)}catch{_=null}if(Array.isArray(_)&&_.length==3){var O=_;if(O[0]==0){e:if(!m.v){if(m.g)if(m.g.F+3e3<a.F)bl(m),kl(m);else break e;Md(m),De(18)}}else m.xa=O[1],0<m.xa-m.K&&O[2]<37500&&m.F&&m.A==0&&!m.C&&(m.C=jr(u(m.Va,m),6e3));Dg(m.h)<=1&&m.ta&&(m.ta=void 0)}else Fi(m,11)}else if((a.L||m.g==a)&&bl(m),!R(h))for(O=m.Ba.g.parse(h),h=0;h<O.length;h++){let je=O[h];const yt=je[0];if(!(yt<=m.K))if(m.K=yt,je=je[1],m.I==2)if(je[0]=="c"){m.M=je[1],m.ba=je[2];const Kn=je[3];Kn!=null&&(m.ka=Kn,m.j.info("VER="+m.ka));const Ui=je[4];Ui!=null&&(m.za=Ui,m.j.info("SVER="+m.za));const Br=je[5];Br!=null&&typeof Br=="number"&&Br>0&&(_=1.5*Br,m.O=_,m.j.info("backChannelRequestTimeoutMs_="+_)),_=m;const zr=a.g;if(zr){const Ol=zr.g?zr.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Ol){var V=_.h;V.g||Ol.indexOf("spdy")==-1&&Ol.indexOf("quic")==-1&&Ol.indexOf("h2")==-1||(V.j=V.l,V.g=new Set,V.h&&(Dd(V,V.h),V.h=null))}if(_.G){const Ud=zr.g?zr.g.getResponseHeader("X-HTTP-Session-Id"):null;Ud&&(_.wa=Ud,Be(_.J,_.G,Ud))}}m.I=3,m.l&&m.l.ra(),m.aa&&(m.T=Date.now()-a.F,m.j.info("Handshake RTT: "+m.T+"ms")),_=m;var W=a;if(_.na=iy(_,_.L?_.ba:null,_.W),W.L){Og(_.h,W);var pe=W,ht=_.O;ht&&(pe.H=ht),pe.D&&(kd(pe),Al(pe)),_.g=W}else Zg(_);m.i.length>0&&Nl(m)}else je[0]!="stop"&&je[0]!="close"||Fi(m,7);else m.I==3&&(je[0]=="stop"||je[0]=="close"?je[0]=="stop"?Fi(m,7):jd(m):je[0]!="noop"&&m.l&&m.l.qa(je),m.A=0)}}on(4)}catch{}}var yC=class{constructor(a,h){this.g=a,this.map=h}};function Ng(a){this.l=a||10,o.PerformanceNavigationTiming?(a=o.performance.getEntriesByType("navigation"),a=a.length>0&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(o.chrome&&o.chrome.loadTimes&&o.chrome.loadTimes()&&o.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function bg(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function Dg(a){return a.h?1:a.g?a.g.size:0}function bd(a,h){return a.h?a.h==h:a.g?a.g.has(h):!1}function Dd(a,h){a.g?a.g.add(h):a.h=h}function Og(a,h){a.h&&a.h==h?a.h=null:a.g&&a.g.has(h)&&a.g.delete(h)}Ng.prototype.cancel=function(){if(this.i=Lg(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function Lg(a){if(a.h!=null)return a.i.concat(a.h.G);if(a.g!=null&&a.g.size!==0){let h=a.i;for(const m of a.g.values())h=h.concat(m.G);return h}return S(a.i)}var Vg=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function vC(a,h){if(a){a=a.split("&");for(let m=0;m<a.length;m++){const _=a[m].indexOf("=");let O,V=null;_>=0?(O=a[m].substring(0,_),V=a[m].substring(_+1)):O=a[m],h(O,V?decodeURIComponent(V.replace(/\+/g," ")):"")}}}function Fr(a){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let h;a instanceof Fr?(this.l=a.l,Vo(this,a.j),this.o=a.o,this.g=a.g,jo(this,a.u),this.h=a.h,Od(this,Bg(a.i)),this.m=a.m):a&&(h=String(a).match(Vg))?(this.l=!1,Vo(this,h[1]||"",!0),this.o=Mo(h[2]||""),this.g=Mo(h[3]||"",!0),jo(this,h[4]),this.h=Mo(h[5]||"",!0),Od(this,h[6]||"",!0),this.m=Mo(h[7]||"")):(this.l=!1,this.i=new Uo(null,this.l))}Fr.prototype.toString=function(){const a=[];var h=this.j;h&&a.push(Fo(h,jg,!0),":");var m=this.g;return(m||h=="file")&&(a.push("//"),(h=this.o)&&a.push(Fo(h,jg,!0),"@"),a.push(Oo(m).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),m=this.u,m!=null&&a.push(":",String(m))),(m=this.h)&&(this.g&&m.charAt(0)!="/"&&a.push("/"),a.push(Fo(m,m.charAt(0)=="/"?EC:wC,!0))),(m=this.i.toString())&&a.push("?",m),(m=this.m)&&a.push("#",Fo(m,IC)),a.join("")},Fr.prototype.resolve=function(a){const h=Gn(this);let m=!!a.j;m?Vo(h,a.j):m=!!a.o,m?h.o=a.o:m=!!a.g,m?h.g=a.g:m=a.u!=null;var _=a.h;if(m)jo(h,a.u);else if(m=!!a.h){if(_.charAt(0)!="/")if(this.g&&!this.h)_="/"+_;else{var O=h.h.lastIndexOf("/");O!=-1&&(_=h.h.slice(0,O+1)+_)}if(O=_,O==".."||O==".")_="";else if(O.indexOf("./")!=-1||O.indexOf("/.")!=-1){_=O.lastIndexOf("/",0)==0,O=O.split("/");const V=[];for(let W=0;W<O.length;){const pe=O[W++];pe=="."?_&&W==O.length&&V.push(""):pe==".."?((V.length>1||V.length==1&&V[0]!="")&&V.pop(),_&&W==O.length&&V.push("")):(V.push(pe),_=!0)}_=V.join("/")}else _=O}return m?h.h=_:m=a.i.toString()!=="",m?Od(h,Bg(a.i)):m=!!a.m,m&&(h.m=a.m),h};function Gn(a){return new Fr(a)}function Vo(a,h,m){a.j=m?Mo(h,!0):h,a.j&&(a.j=a.j.replace(/:$/,""))}function jo(a,h){if(h){if(h=Number(h),isNaN(h)||h<0)throw Error("Bad port number "+h);a.u=h}else a.u=null}function Od(a,h,m){h instanceof Uo?(a.i=h,SC(a.i,a.l)):(m||(h=Fo(h,TC)),a.i=new Uo(h,a.l))}function Be(a,h,m){a.i.set(h,m)}function Rl(a){return Be(a,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),a}function Mo(a,h){return a?h?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function Fo(a,h,m){return typeof a=="string"?(a=encodeURI(a).replace(h,_C),m&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function _C(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var jg=/[#\/\?@]/g,wC=/[#\?:]/g,EC=/[#\?]/g,TC=/[#\?@]/g,IC=/#/g;function Uo(a,h){this.h=this.g=null,this.i=a||null,this.j=!!h}function Mi(a){a.g||(a.g=new Map,a.h=0,a.i&&vC(a.i,function(h,m){a.add(decodeURIComponent(h.replace(/\+/g," ")),m)}))}t=Uo.prototype,t.add=function(a,h){Mi(this),this.i=null,a=Is(this,a);let m=this.g.get(a);return m||this.g.set(a,m=[]),m.push(h),this.h+=1,this};function Mg(a,h){Mi(a),h=Is(a,h),a.g.has(h)&&(a.i=null,a.h-=a.g.get(h).length,a.g.delete(h))}function Fg(a,h){return Mi(a),h=Is(a,h),a.g.has(h)}t.forEach=function(a,h){Mi(this),this.g.forEach(function(m,_){m.forEach(function(O){a.call(h,O,_,this)},this)},this)};function Ug(a,h){Mi(a);let m=[];if(typeof h=="string")Fg(a,h)&&(m=m.concat(a.g.get(Is(a,h))));else for(a=Array.from(a.g.values()),h=0;h<a.length;h++)m=m.concat(a[h]);return m}t.set=function(a,h){return Mi(this),this.i=null,a=Is(this,a),Fg(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[h]),this.h+=1,this},t.get=function(a,h){return a?(a=Ug(this,a),a.length>0?String(a[0]):h):h};function $g(a,h,m){Mg(a,h),m.length>0&&(a.i=null,a.g.set(Is(a,h),S(m)),a.h+=m.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],h=Array.from(this.g.keys());for(let _=0;_<h.length;_++){var m=h[_];const O=Oo(m);m=Ug(this,m);for(let V=0;V<m.length;V++){let W=O;m[V]!==""&&(W+="="+Oo(m[V])),a.push(W)}}return this.i=a.join("&")};function Bg(a){const h=new Uo;return h.i=a.i,a.g&&(h.g=new Map(a.g),h.h=a.h),h}function Is(a,h){return h=String(h),a.j&&(h=h.toLowerCase()),h}function SC(a,h){h&&!a.j&&(Mi(a),a.i=null,a.g.forEach(function(m,_){const O=_.toLowerCase();_!=O&&(Mg(this,_),$g(this,O,m))},a)),a.j=h}function CC(a,h){const m=new mr;if(o.Image){const _=new Image;_.onload=f(Ur,m,"TestLoadImage: loaded",!0,h,_),_.onerror=f(Ur,m,"TestLoadImage: error",!1,h,_),_.onabort=f(Ur,m,"TestLoadImage: abort",!1,h,_),_.ontimeout=f(Ur,m,"TestLoadImage: timeout",!1,h,_),o.setTimeout(function(){_.ontimeout&&_.ontimeout()},1e4),_.src=a}else h(!1)}function AC(a,h){const m=new mr,_=new AbortController,O=setTimeout(()=>{_.abort(),Ur(m,"TestPingServer: timeout",!1,h)},1e4);fetch(a,{signal:_.signal}).then(V=>{clearTimeout(O),V.ok?Ur(m,"TestPingServer: ok",!0,h):Ur(m,"TestPingServer: server error",!1,h)}).catch(()=>{clearTimeout(O),Ur(m,"TestPingServer: error",!1,h)})}function Ur(a,h,m,_,O){try{O&&(O.onload=null,O.onerror=null,O.onabort=null,O.ontimeout=null),_(m)}catch{}}function RC(){this.g=new it}function Ld(a){this.i=a.Sb||null,this.h=a.ab||!1}p(Ld,xt),Ld.prototype.g=function(){return new xl(this.i,this.h)};function xl(a,h){he.call(this),this.H=a,this.o=h,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}p(xl,he),t=xl.prototype,t.open=function(a,h){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=a,this.D=h,this.readyState=1,Bo(this)},t.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const h={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};a&&(h.body=a),(this.H||o).fetch(new Request(this.D,h)).then(this.Pa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,$o(this)),this.readyState=0},t.Pa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,Bo(this)),this.g&&(this.readyState=3,Bo(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof o.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;zg(this)}else a.text().then(this.Oa.bind(this),this.ga.bind(this))};function zg(a){a.j.read().then(a.Ma.bind(a)).catch(a.ga.bind(a))}t.Ma=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var h=a.value?a.value:new Uint8Array(0);(h=this.B.decode(h,{stream:!a.done}))&&(this.response=this.responseText+=h)}a.done?$o(this):Bo(this),this.readyState==3&&zg(this)}},t.Oa=function(a){this.g&&(this.response=this.responseText=a,$o(this))},t.Na=function(a){this.g&&(this.response=a,$o(this))},t.ga=function(){this.g&&$o(this)};function $o(a){a.readyState=4,a.l=null,a.j=null,a.B=null,Bo(a)}t.setRequestHeader=function(a,h){this.A.append(a,h)},t.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],h=this.h.entries();for(var m=h.next();!m.done;)m=m.value,a.push(m[0]+": "+m[1]),m=h.next();return a.join(`\r
`)};function Bo(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(xl.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function qg(a){let h="";return se(a,function(m,_){h+=_,h+=":",h+=m,h+=`\r
`}),h}function Vd(a,h,m){e:{for(_ in m){var _=!1;break e}_=!0}_||(m=qg(m),typeof a=="string"?m!=null&&Oo(m):Be(a,h,m))}function Ze(a){he.call(this),this.headers=new Map,this.L=a||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}p(Ze,he);var xC=/^https?$/i,PC=["POST","PUT"];t=Ze.prototype,t.Fa=function(a){this.H=a},t.ea=function(a,h,m,_){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);h=h?h.toUpperCase():"GET",this.D=a,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():Cg.g(),this.g.onreadystatechange=g(u(this.Ca,this));try{this.B=!0,this.g.open(h,String(a),!0),this.B=!1}catch(V){Hg(this,V);return}if(a=m||"",m=new Map(this.headers),_)if(Object.getPrototypeOf(_)===Object.prototype)for(var O in _)m.set(O,_[O]);else if(typeof _.keys=="function"&&typeof _.get=="function")for(const V of _.keys())m.set(V,_.get(V));else throw Error("Unknown input type for opt_headers: "+String(_));_=Array.from(m.keys()).find(V=>V.toLowerCase()=="content-type"),O=o.FormData&&a instanceof o.FormData,!(Array.prototype.indexOf.call(PC,h,void 0)>=0)||_||O||m.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[V,W]of m)this.g.setRequestHeader(V,W);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(a),this.v=!1}catch(V){Hg(this,V)}};function Hg(a,h){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=h,a.o=5,Wg(a),Pl(a)}function Wg(a){a.A||(a.A=!0,w(a,"complete"),w(a,"error"))}t.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=a||7,w(this,"complete"),w(this,"abort"),Pl(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Pl(this,!0)),Ze.Z.N.call(this)},t.Ca=function(){this.u||(this.B||this.v||this.j?Gg(this):this.Xa())},t.Xa=function(){Gg(this)};function Gg(a){if(a.h&&typeof s<"u"){if(a.v&&$r(a)==4)setTimeout(a.Ca.bind(a),0);else if(w(a,"readystatechange"),$r(a)==4){a.h=!1;try{const V=a.ca();e:switch(V){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var h=!0;break e;default:h=!1}var m;if(!(m=h)){var _;if(_=V===0){let W=String(a.D).match(Vg)[1]||null;!W&&o.self&&o.self.location&&(W=o.self.location.protocol.slice(0,-1)),_=!xC.test(W?W.toLowerCase():"")}m=_}if(m)w(a,"complete"),w(a,"success");else{a.o=6;try{var O=$r(a)>2?a.g.statusText:""}catch{O=""}a.l=O+" ["+a.ca()+"]",Wg(a)}}finally{Pl(a)}}}}function Pl(a,h){if(a.g){a.m&&(clearTimeout(a.m),a.m=null);const m=a.g;a.g=null,h||w(a,"ready");try{m.onreadystatechange=null}catch{}}}t.isActive=function(){return!!this.g};function $r(a){return a.g?a.g.readyState:0}t.ca=function(){try{return $r(this)>2?this.g.status:-1}catch{return-1}},t.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.La=function(a){if(this.g){var h=this.g.responseText;return a&&h.indexOf(a)==0&&(h=h.substring(a.length)),Re(h)}};function Kg(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.F){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function kC(a){const h={};a=(a.g&&$r(a)>=2&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let _=0;_<a.length;_++){if(R(a[_]))continue;var m=pC(a[_]);const O=m[0];if(m=m[1],typeof m!="string")continue;m=m.trim();const V=h[O]||[];h[O]=V,V.push(m)}oe(h,function(_){return _.join(", ")})}t.ya=function(){return this.o},t.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function zo(a,h,m){return m&&m.internalChannelParams&&m.internalChannelParams[a]||h}function Qg(a){this.za=0,this.i=[],this.j=new mr,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=zo("failFast",!1,a),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=zo("baseRetryDelayMs",5e3,a),this.Za=zo("retryDelaySeedMs",1e4,a),this.Ta=zo("forwardChannelMaxRetries",2,a),this.va=zo("forwardChannelRequestTimeoutMs",2e4,a),this.ma=a&&a.xmlHttpFactory||void 0,this.Ua=a&&a.Rb||void 0,this.Aa=a&&a.useFetchStreams||!1,this.O=void 0,this.L=a&&a.supportsCrossDomainXhr||!1,this.M="",this.h=new Ng(a&&a.concurrentRequestLimit),this.Ba=new RC,this.S=a&&a.fastHandshake||!1,this.R=a&&a.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=a&&a.Pb||!1,a&&a.ua&&this.j.ua(),a&&a.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&a&&a.detectBufferingProxy||!1,this.ia=void 0,a&&a.longPollingTimeout&&a.longPollingTimeout>0&&(this.ia=a.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}t=Qg.prototype,t.ka=8,t.I=1,t.connect=function(a,h,m,_){De(0),this.W=a,this.H=h||{},m&&_!==void 0&&(this.H.OSID=m,this.H.OAID=_),this.F=this.X,this.J=iy(this,null,this.W),Nl(this)};function jd(a){if(Yg(a),a.I==3){var h=a.V++,m=Gn(a.J);if(Be(m,"SID",a.M),Be(m,"RID",h),Be(m,"TYPE","terminate"),qo(a,m),h=new Mr(a,a.j,h),h.M=2,h.A=Rl(Gn(m)),m=!1,o.navigator&&o.navigator.sendBeacon)try{m=o.navigator.sendBeacon(h.A.toString(),"")}catch{}!m&&o.Image&&(new Image().src=h.A,m=!0),m||(h.g=sy(h.j,null),h.g.ea(h.A)),h.F=Date.now(),Al(h)}ry(a)}function kl(a){a.g&&(Fd(a),a.g.cancel(),a.g=null)}function Yg(a){kl(a),a.v&&(o.clearTimeout(a.v),a.v=null),bl(a),a.h.cancel(),a.m&&(typeof a.m=="number"&&o.clearTimeout(a.m),a.m=null)}function Nl(a){if(!bg(a.h)&&!a.m){a.m=!0;var h=a.Ea;$||T(),B||($(),B=!0),C.add(h,a),a.D=0}}function NC(a,h){return Dg(a.h)>=a.h.j-(a.m?1:0)?!1:a.m?(a.i=h.G.concat(a.i),!0):a.I==1||a.I==2||a.D>=(a.Sa?0:a.Ta)?!1:(a.m=jr(u(a.Ea,a,h),ny(a,a.D)),a.D++,!0)}t.Ea=function(a){if(this.m)if(this.m=null,this.I==1){if(!a){this.V=Math.floor(Math.random()*1e5),a=this.V++;const O=new Mr(this,this.j,a);let V=this.o;if(this.U&&(V?(V=ke(V),F(V,this.U)):V=this.U),this.u!==null||this.R||(O.J=V,V=null),this.S)e:{for(var h=0,m=0;m<this.i.length;m++){t:{var _=this.i[m];if("__data__"in _.map&&(_=_.map.__data__,typeof _=="string")){_=_.length;break t}_=void 0}if(_===void 0)break;if(h+=_,h>4096){h=m;break e}if(h===4096||m===this.i.length-1){h=m+1;break e}}h=1e3}else h=1e3;h=Jg(this,O,h),m=Gn(this.J),Be(m,"RID",a),Be(m,"CVER",22),this.G&&Be(m,"X-HTTP-Session-Id",this.G),qo(this,m),V&&(this.R?h="headers="+Oo(qg(V))+"&"+h:this.u&&Vd(m,this.u,V)),Dd(this.h,O),this.Ra&&Be(m,"TYPE","init"),this.S?(Be(m,"$req",h),Be(m,"SID","null"),O.U=!0,Pd(O,m,null)):Pd(O,m,h),this.I=2}}else this.I==3&&(a?Xg(this,a):this.i.length==0||bg(this.h)||Xg(this))};function Xg(a,h){var m;h?m=h.l:m=a.V++;const _=Gn(a.J);Be(_,"SID",a.M),Be(_,"RID",m),Be(_,"AID",a.K),qo(a,_),a.u&&a.o&&Vd(_,a.u,a.o),m=new Mr(a,a.j,m,a.D+1),a.u===null&&(m.J=a.o),h&&(a.i=h.G.concat(a.i)),h=Jg(a,m,1e3),m.H=Math.round(a.va*.5)+Math.round(a.va*.5*Math.random()),Dd(a.h,m),Pd(m,_,h)}function qo(a,h){a.H&&se(a.H,function(m,_){Be(h,_,m)}),a.l&&se({},function(m,_){Be(h,_,m)})}function Jg(a,h,m){m=Math.min(a.i.length,m);const _=a.l?u(a.l.Ka,a.l,a):null;e:{var O=a.i;let pe=-1;for(;;){const ht=["count="+m];pe==-1?m>0?(pe=O[0].g,ht.push("ofs="+pe)):pe=0:ht.push("ofs="+pe);let je=!0;for(let yt=0;yt<m;yt++){var V=O[yt].g;const Kn=O[yt].map;if(V-=pe,V<0)pe=Math.max(0,O[yt].g-100),je=!1;else try{V="req"+V+"_"||"";try{var W=Kn instanceof Map?Kn:Object.entries(Kn);for(const[Ui,Br]of W){let zr=Br;l(Br)&&(zr=Ke(Br)),ht.push(V+Ui+"="+encodeURIComponent(zr))}}catch(Ui){throw ht.push(V+"type="+encodeURIComponent("_badmap")),Ui}}catch{_&&_(Kn)}}if(je){W=ht.join("&");break e}}W=void 0}return a=a.i.splice(0,m),h.G=a,W}function Zg(a){if(!a.g&&!a.v){a.Y=1;var h=a.Da;$||T(),B||($(),B=!0),C.add(h,a),a.A=0}}function Md(a){return a.g||a.v||a.A>=3?!1:(a.Y++,a.v=jr(u(a.Da,a),ny(a,a.A)),a.A++,!0)}t.Da=function(){if(this.v=null,ey(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var a=4*this.T;this.j.info("BP detection timer enabled: "+a),this.B=jr(u(this.Wa,this),a)}},t.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,De(10),kl(this),ey(this))};function Fd(a){a.B!=null&&(o.clearTimeout(a.B),a.B=null)}function ey(a){a.g=new Mr(a,a.j,"rpc",a.Y),a.u===null&&(a.g.J=a.o),a.g.P=0;var h=Gn(a.na);Be(h,"RID","rpc"),Be(h,"SID",a.M),Be(h,"AID",a.K),Be(h,"CI",a.F?"0":"1"),!a.F&&a.ia&&Be(h,"TO",a.ia),Be(h,"TYPE","xmlhttp"),qo(a,h),a.u&&a.o&&Vd(h,a.u,a.o),a.O&&(a.g.H=a.O);var m=a.g;a=a.ba,m.M=1,m.A=Rl(Gn(h)),m.u=null,m.R=!0,xg(m,a)}t.Va=function(){this.C!=null&&(this.C=null,kl(this),Md(this),De(19))};function bl(a){a.C!=null&&(o.clearTimeout(a.C),a.C=null)}function ty(a,h){var m=null;if(a.g==h){bl(a),Fd(a),a.g=null;var _=2}else if(bd(a.h,h))m=h.G,Og(a.h,h),_=1;else return;if(a.I!=0){if(h.o)if(_==1){m=h.u?h.u.length:0,h=Date.now()-h.F;var O=a.D;_=Hn(),w(_,new Sl(_,m)),Nl(a)}else Zg(a);else if(O=h.m,O==3||O==0&&h.X>0||!(_==1&&NC(a,h)||_==2&&Md(a)))switch(m&&m.length>0&&(h=a.h,h.i=h.i.concat(m)),O){case 1:Fi(a,5);break;case 4:Fi(a,10);break;case 3:Fi(a,6);break;default:Fi(a,2)}}}function ny(a,h){let m=a.Qa+Math.floor(Math.random()*a.Za);return a.isActive()||(m*=2),m*h}function Fi(a,h){if(a.j.info("Error code "+h),h==2){var m=u(a.bb,a),_=a.Ua;const O=!_;_=new Fr(_||"//www.google.com/images/cleardot.gif"),o.location&&o.location.protocol=="http"||Vo(_,"https"),Rl(_),O?CC(_.toString(),m):AC(_.toString(),m)}else De(2);a.I=0,a.l&&a.l.pa(h),ry(a),Yg(a)}t.bb=function(a){a?(this.j.info("Successfully pinged google.com"),De(2)):(this.j.info("Failed to ping google.com"),De(1))};function ry(a){if(a.I=0,a.ja=[],a.l){const h=Lg(a.h);(h.length!=0||a.i.length!=0)&&(v(a.ja,h),v(a.ja,a.i),a.h.i.length=0,S(a.i),a.i.length=0),a.l.oa()}}function iy(a,h,m){var _=m instanceof Fr?Gn(m):new Fr(m);if(_.g!="")h&&(_.g=h+"."+_.g),jo(_,_.u);else{var O=o.location;_=O.protocol,h=h?h+"."+O.hostname:O.hostname,O=+O.port;const V=new Fr(null);_&&Vo(V,_),h&&(V.g=h),O&&jo(V,O),m&&(V.h=m),_=V}return m=a.G,h=a.wa,m&&h&&Be(_,m,h),Be(_,"VER",a.ka),qo(a,_),_}function sy(a,h,m){if(h&&!a.L)throw Error("Can't create secondary domain capable XhrIo object.");return h=a.Aa&&!a.ma?new Ze(new Ld({ab:m})):new Ze(a.ma),h.Fa(a.L),h}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function oy(){}t=oy.prototype,t.ra=function(){},t.qa=function(){},t.pa=function(){},t.oa=function(){},t.isActive=function(){return!0},t.Ka=function(){};function Dl(){}Dl.prototype.g=function(a,h){return new an(a,h)};function an(a,h){he.call(this),this.g=new Qg(h),this.l=a,this.h=h&&h.messageUrlParams||null,a=h&&h.messageHeaders||null,h&&h.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=h&&h.initMessageHeaders||null,h&&h.messageContentType&&(a?a["X-WebChannel-Content-Type"]=h.messageContentType:a={"X-WebChannel-Content-Type":h.messageContentType}),h&&h.sa&&(a?a["X-WebChannel-Client-Profile"]=h.sa:a={"X-WebChannel-Client-Profile":h.sa}),this.g.U=a,(a=h&&h.Qb)&&!R(a)&&(this.g.u=a),this.A=h&&h.supportsCrossDomainXhr||!1,this.v=h&&h.sendRawJson||!1,(h=h&&h.httpSessionIdParam)&&!R(h)&&(this.g.G=h,a=this.h,a!==null&&h in a&&(a=this.h,h in a&&delete a[h])),this.j=new Ss(this)}p(an,he),an.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},an.prototype.close=function(){jd(this.g)},an.prototype.o=function(a){var h=this.g;if(typeof a=="string"){var m={};m.__data__=a,a=m}else this.v&&(m={},m.__data__=Ke(a),a=m);h.i.push(new yC(h.Ya++,a)),h.I==3&&Nl(h)},an.prototype.N=function(){this.g.l=null,delete this.j,jd(this.g),delete this.g,an.Z.N.call(this)};function ay(a){fr.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var h=a.__sm__;if(h){e:{for(const m in h){a=m;break e}a=void 0}(this.i=a)&&(a=this.i,h=h!==null&&a in h?h[a]:void 0),this.data=h}else this.data=a}p(ay,fr);function ly(){Do.call(this),this.status=1}p(ly,Do);function Ss(a){this.g=a}p(Ss,oy),Ss.prototype.ra=function(){w(this.g,"a")},Ss.prototype.qa=function(a){w(this.g,new ay(a))},Ss.prototype.pa=function(a){w(this.g,new ly)},Ss.prototype.oa=function(){w(this.g,"b")},Dl.prototype.createWebChannel=Dl.prototype.g,an.prototype.send=an.prototype.o,an.prototype.open=an.prototype.m,an.prototype.close=an.prototype.close,t0=function(){return new Dl},e0=function(){return Hn()},ZI=sn,zf={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Cl.NO_ERROR=0,Cl.TIMEOUT=8,Cl.HTTP_ERROR=6,Rc=Cl,Sg.COMPLETE="complete",JI=Sg,rn.EventType=Lr,Lr.OPEN="a",Lr.CLOSE="b",Lr.ERROR="c",Lr.MESSAGE="d",he.prototype.listen=he.prototype.J,la=rn,Ze.prototype.listenOnce=Ze.prototype.K,Ze.prototype.getLastError=Ze.prototype.Ha,Ze.prototype.getLastErrorCode=Ze.prototype.ya,Ze.prototype.getStatus=Ze.prototype.ca,Ze.prototype.getResponseJson=Ze.prototype.La,Ze.prototype.getResponseText=Ze.prototype.la,Ze.prototype.send=Ze.prototype.ea,Ze.prototype.setWithCredentials=Ze.prototype.Fa,XI=Ze}).apply(typeof ec<"u"?ec:typeof self<"u"?self:typeof window<"u"?window:{});const r_="@firebase/firestore",i_="4.9.2";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bt{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}bt.UNAUTHENTICATED=new bt(null),bt.GOOGLE_CREDENTIALS=new bt("google-credentials-uid"),bt.FIRST_PARTY=new bt("first-party-uid"),bt.MOCK_USER=new bt("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let xo="12.3.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cs=new Gu("@firebase/firestore");function Ps(){return cs.logLevel}function Z(t,...e){if(cs.logLevel<=_e.DEBUG){const n=e.map(Sm);cs.debug(`Firestore (${xo}): ${t}`,...n)}}function br(t,...e){if(cs.logLevel<=_e.ERROR){const n=e.map(Sm);cs.error(`Firestore (${xo}): ${t}`,...n)}}function fo(t,...e){if(cs.logLevel<=_e.WARN){const n=e.map(Sm);cs.warn(`Firestore (${xo}): ${t}`,...n)}}function Sm(t){if(typeof t=="string")return t;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(n){return JSON.stringify(n)}(t)}catch{return t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function le(t,e,n){let r="Unexpected state";typeof e=="string"?r=e:n=e,n0(t,r,n)}function n0(t,e,n){let r=`FIRESTORE (${xo}) INTERNAL ASSERTION FAILED: ${e} (ID: ${t.toString(16)})`;if(n!==void 0)try{r+=" CONTEXT: "+JSON.stringify(n)}catch{r+=" CONTEXT: "+n}throw br(r),new Error(r)}function Pe(t,e,n,r){let i="Unexpected state";typeof n=="string"?i=n:r=n,t||n0(e,i,r)}function ue(t,e){return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const M={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class G extends kn{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sr{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class r0{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class Ab{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(bt.UNAUTHENTICATED))}shutdown(){}}class Rb{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}}class xb{constructor(e){this.t=e,this.currentUser=bt.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){Pe(this.o===void 0,42304);let r=this.i;const i=c=>this.i!==r?(r=this.i,n(c)):Promise.resolve();let s=new sr;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new sr,e.enqueueRetryable(()=>i(this.currentUser))};const o=()=>{const c=s;e.enqueueRetryable(async()=>{await c.promise,await i(this.currentUser)})},l=c=>{Z("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit(c=>l(c)),setTimeout(()=>{if(!this.auth){const c=this.t.getImmediate({optional:!0});c?l(c):(Z("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new sr)}},0),o()}getToken(){const e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(r=>this.i!==e?(Z("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(Pe(typeof r.accessToken=="string",31837,{l:r}),new r0(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return Pe(e===null||typeof e=="string",2055,{h:e}),new bt(e)}}class Pb{constructor(e,n,r){this.P=e,this.T=n,this.I=r,this.type="FirstParty",this.user=bt.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class kb{constructor(e,n,r){this.P=e,this.T=n,this.I=r}getToken(){return Promise.resolve(new Pb(this.P,this.T,this.I))}start(e,n){e.enqueueRetryable(()=>n(bt.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class s_{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Nb{constructor(e,n){this.V=n,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Tn(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,n){Pe(this.o===void 0,3512);const r=s=>{s.error!=null&&Z("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);const o=s.token!==this.m;return this.m=s.token,Z("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?n(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>r(s))};const i=s=>{Z("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(s=>i(s)),setTimeout(()=>{if(!this.appCheck){const s=this.V.getImmediate({optional:!0});s?i(s):Z("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new s_(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(Pe(typeof n.token=="string",44558,{tokenResult:n}),this.m=n.token,new s_(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bb(t){const e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let r=0;r<t;r++)n[r]=Math.floor(256*Math.random());return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cm{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const i=bb(40);for(let s=0;s<i.length;++s)r.length<20&&i[s]<n&&(r+=e.charAt(i[s]%62))}return r}}function we(t,e){return t<e?-1:t>e?1:0}function qf(t,e){const n=Math.min(t.length,e.length);for(let r=0;r<n;r++){const i=t.charAt(r),s=e.charAt(r);if(i!==s)return Th(i)===Th(s)?we(i,s):Th(i)?1:-1}return we(t.length,e.length)}const Db=55296,Ob=57343;function Th(t){const e=t.charCodeAt(0);return e>=Db&&e<=Ob}function po(t,e,n){return t.length===e.length&&t.every((r,i)=>n(r,e[i]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const o_="__name__";class Jn{constructor(e,n,r){n===void 0?n=0:n>e.length&&le(637,{offset:n,range:e.length}),r===void 0?r=e.length-n:r>e.length-n&&le(1746,{length:r,range:e.length-n}),this.segments=e,this.offset=n,this.len=r}get length(){return this.len}isEqual(e){return Jn.comparator(this,e)===0}child(e){const n=this.segments.slice(this.offset,this.limit());return e instanceof Jn?e.forEach(r=>{n.push(r)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,r=this.limit();n<r;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){const r=Math.min(e.length,n.length);for(let i=0;i<r;i++){const s=Jn.compareSegments(e.get(i),n.get(i));if(s!==0)return s}return we(e.length,n.length)}static compareSegments(e,n){const r=Jn.isNumericId(e),i=Jn.isNumericId(n);return r&&!i?-1:!r&&i?1:r&&i?Jn.extractNumericId(e).compare(Jn.extractNumericId(n)):qf(e,n)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return yi.fromString(e.substring(4,e.length-2))}}class Me extends Jn{construct(e,n,r){return new Me(e,n,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const n=[];for(const r of e){if(r.indexOf("//")>=0)throw new G(M.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);n.push(...r.split("/").filter(i=>i.length>0))}return new Me(n)}static emptyPath(){return new Me([])}}const Lb=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class St extends Jn{construct(e,n,r){return new St(e,n,r)}static isValidIdentifier(e){return Lb.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),St.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===o_}static keyField(){return new St([o_])}static fromServerFormat(e){const n=[];let r="",i=0;const s=()=>{if(r.length===0)throw new G(M.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(r),r=""};let o=!1;for(;i<e.length;){const l=e[i];if(l==="\\"){if(i+1===e.length)throw new G(M.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const c=e[i+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new G(M.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=c,i+=2}else l==="`"?(o=!o,i++):l!=="."||o?(r+=l,i++):(s(),i++)}if(s(),o)throw new G(M.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new St(n)}static emptyPath(){return new St([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ne{constructor(e){this.path=e}static fromPath(e){return new ne(Me.fromString(e))}static fromName(e){return new ne(Me.fromString(e).popFirst(5))}static empty(){return new ne(Me.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Me.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return Me.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new ne(new Me(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function i0(t,e,n){if(!n)throw new G(M.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function Vb(t,e,n,r){if(e===!0&&r===!0)throw new G(M.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function a_(t){if(!ne.isDocumentKey(t))throw new G(M.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`)}function l_(t){if(ne.isDocumentKey(t))throw new G(M.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function s0(t){return typeof t=="object"&&t!==null&&(Object.getPrototypeOf(t)===Object.prototype||Object.getPrototypeOf(t)===null)}function Zu(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":le(12329,{type:typeof t})}function zt(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new G(M.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=Zu(t);throw new G(M.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}function jb(t,e){if(e<=0)throw new G(M.INVALID_ARGUMENT,`Function ${t}() requires a positive number, but it was: ${e}.`)}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dt(t,e){const n={typeString:t};return e&&(n.value=e),n}function pl(t,e){if(!s0(t))throw new G(M.INVALID_ARGUMENT,"JSON must be an object");let n;for(const r in e)if(e[r]){const i=e[r].typeString,s="value"in e[r]?{value:e[r].value}:void 0;if(!(r in t)){n=`JSON missing required field: '${r}'`;break}const o=t[r];if(i&&typeof o!==i){n=`JSON field '${r}' must be a ${i}.`;break}if(s!==void 0&&o!==s.value){n=`Expected '${r}' field to equal '${s.value}'`;break}}if(n)throw new G(M.INVALID_ARGUMENT,n);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const c_=-62135596800,u_=1e6;class Oe{static now(){return Oe.fromMillis(Date.now())}static fromDate(e){return Oe.fromMillis(e.getTime())}static fromMillis(e){const n=Math.floor(e/1e3),r=Math.floor((e-1e3*n)*u_);return new Oe(n,r)}constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new G(M.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new G(M.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<c_)throw new G(M.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new G(M.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/u_}_compareTo(e){return this.seconds===e.seconds?we(this.nanoseconds,e.nanoseconds):we(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:Oe._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(pl(e,Oe._jsonSchema))return new Oe(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-c_;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}Oe._jsonSchemaVersion="firestore/timestamp/1.0",Oe._jsonSchema={type:dt("string",Oe._jsonSchemaVersion),seconds:dt("number"),nanoseconds:dt("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class de{static fromTimestamp(e){return new de(e)}static min(){return new de(new Oe(0,0))}static max(){return new de(new Oe(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ya=-1;function Mb(t,e){const n=t.toTimestamp().seconds,r=t.toTimestamp().nanoseconds+1,i=de.fromTimestamp(r===1e9?new Oe(n+1,0):new Oe(n,r));return new Ei(i,ne.empty(),e)}function Fb(t){return new Ei(t.readTime,t.key,Ya)}class Ei{constructor(e,n,r){this.readTime=e,this.documentKey=n,this.largestBatchId=r}static min(){return new Ei(de.min(),ne.empty(),Ya)}static max(){return new Ei(de.max(),ne.empty(),Ya)}}function Ub(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=ne.comparator(t.documentKey,e.documentKey),n!==0?n:we(t.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $b="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Bb{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Po(t){if(t.code!==M.FAILED_PRECONDITION||t.message!==$b)throw t;Z("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class U{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&le(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new U((r,i)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(r,i)},this.catchCallback=s=>{this.wrapFailure(n,s).next(r,i)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{const n=e();return n instanceof U?n:U.resolve(n)}catch(n){return U.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):U.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):U.reject(n)}static resolve(e){return new U((n,r)=>{n(e)})}static reject(e){return new U((n,r)=>{r(e)})}static waitFor(e){return new U((n,r)=>{let i=0,s=0,o=!1;e.forEach(l=>{++i,l.next(()=>{++s,o&&s===i&&n()},c=>r(c))}),o=!0,s===i&&n()})}static or(e){let n=U.resolve(!1);for(const r of e)n=n.next(i=>i?U.resolve(i):r());return n}static forEach(e,n){const r=[];return e.forEach((i,s)=>{r.push(n.call(this,i,s))}),this.waitFor(r)}static mapArray(e,n){return new U((r,i)=>{const s=e.length,o=new Array(s);let l=0;for(let c=0;c<s;c++){const u=c;n(e[u]).next(f=>{o[u]=f,++l,l===s&&r(o)},f=>i(f))}})}static doWhile(e,n){return new U((r,i)=>{const s=()=>{e()===!0?n().next(()=>{s()},i):r()};s()})}}function zb(t){const e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function ko(t){return t.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ed{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=r=>this.ae(r),this.ue=r=>n.writeSequenceNumber(r))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ue&&this.ue(e),e}}ed.ce=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Am=-1;function td(t){return t==null}function hu(t){return t===0&&1/t==-1/0}function qb(t){return typeof t=="number"&&Number.isInteger(t)&&!hu(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const o0="";function Hb(t){let e="";for(let n=0;n<t.length;n++)e.length>0&&(e=d_(e)),e=Wb(t.get(n),e);return d_(e)}function Wb(t,e){let n=e;const r=t.length;for(let i=0;i<r;i++){const s=t.charAt(i);switch(s){case"\0":n+="";break;case o0:n+="";break;default:n+=s}}return n}function d_(t){return t+o0+""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function h_(t){let e=0;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function Oi(t,e){for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function Gb(t,e){const n=[];for(const r in t)Object.prototype.hasOwnProperty.call(t,r)&&n.push(e(t[r],r,t));return n}function a0(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Je{constructor(e,n){this.comparator=e,this.root=n||It.EMPTY}insert(e,n){return new Je(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,It.BLACK,null,null))}remove(e){return new Je(this.comparator,this.root.remove(e,this.comparator).copy(null,null,It.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){const r=this.comparator(e,n.key);if(r===0)return n.value;r<0?n=n.left:r>0&&(n=n.right)}return null}indexOf(e){let n=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(e,r.key);if(i===0)return n+r.left.size;i<0?r=r.left:(n+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,r)=>(e(n,r),!1))}toString(){const e=[];return this.inorderTraversal((n,r)=>(e.push(`${n}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new tc(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new tc(this.root,e,this.comparator,!1)}getReverseIterator(){return new tc(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new tc(this.root,e,this.comparator,!0)}}class tc{constructor(e,n,r,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=n?r(e.key,n):1,n&&i&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class It{constructor(e,n,r,i,s){this.key=e,this.value=n,this.color=r??It.RED,this.left=i??It.EMPTY,this.right=s??It.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,r,i,s){return new It(e??this.key,n??this.value,r??this.color,i??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,r){let i=this;const s=r(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,n,r),null):s===0?i.copy(null,n,null,null,null):i.copy(null,null,null,null,i.right.insert(e,n,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return It.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let r,i=this;if(n(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,n),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),n(e,i.key)===0){if(i.right.isEmpty())return It.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,n))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,It.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,It.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw le(43730,{key:this.key,value:this.value});if(this.right.isRed())throw le(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw le(27949);return e+(this.isRed()?0:1)}}It.EMPTY=null,It.RED=!0,It.BLACK=!1;It.EMPTY=new class{constructor(){this.size=0}get key(){throw le(57766)}get value(){throw le(16141)}get color(){throw le(16727)}get left(){throw le(29726)}get right(){throw le(36894)}copy(e,n,r,i,s){return this}insert(e,n,r){return new It(e,n)}remove(e,n){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gt{constructor(e){this.comparator=e,this.data=new Je(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,r)=>(e(n),!1))}forEachInRange(e,n){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,e[1])>=0)return;n(i.key)}}forEachWhile(e,n){let r;for(r=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new f_(this.data.getIterator())}getIteratorFrom(e){return new f_(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(r=>{n=n.add(r)}),n}isEqual(e){if(!(e instanceof gt)||this.size!==e.size)return!1;const n=this.data.getIterator(),r=e.data.getIterator();for(;n.hasNext();){const i=n.getNext().key,s=r.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(n=>{e.push(n)}),e}toString(){const e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){const n=new gt(this.comparator);return n.data=e,n}}class f_{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class un{constructor(e){this.fields=e,e.sort(St.comparator)}static empty(){return new un([])}unionWith(e){let n=new gt(St.comparator);for(const r of this.fields)n=n.add(r);for(const r of e)n=n.add(r);return new un(n.toArray())}covers(e){for(const n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return po(this.fields,e.fields,(n,r)=>n.isEqual(r))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class l0 extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rt{constructor(e){this.binaryString=e}static fromBase64String(e){const n=function(i){try{return atob(i)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new l0("Invalid base64 string: "+s):s}}(e);return new Rt(n)}static fromUint8Array(e){const n=function(i){let s="";for(let o=0;o<i.length;++o)s+=String.fromCharCode(i[o]);return s}(e);return new Rt(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){const r=new Uint8Array(n.length);for(let i=0;i<n.length;i++)r[i]=n.charCodeAt(i);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return we(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Rt.EMPTY_BYTE_STRING=new Rt("");const Kb=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Ti(t){if(Pe(!!t,39018),typeof t=="string"){let e=0;const n=Kb.exec(t);if(Pe(!!n,46558,{timestamp:t}),n[1]){let i=n[1];i=(i+"000000000").substr(0,9),e=Number(i)}const r=new Date(t);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:st(t.seconds),nanos:st(t.nanos)}}function st(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function Ii(t){return typeof t=="string"?Rt.fromBase64String(t):Rt.fromUint8Array(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const c0="server_timestamp",u0="__type__",d0="__previous_value__",h0="__local_write_time__";function nd(t){var n,r;return((r=(((n=t==null?void 0:t.mapValue)==null?void 0:n.fields)||{})[u0])==null?void 0:r.stringValue)===c0}function rd(t){const e=t.mapValue.fields[d0];return nd(e)?rd(e):e}function Xa(t){const e=Ti(t.mapValue.fields[h0].timestampValue);return new Oe(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qb{constructor(e,n,r,i,s,o,l,c,u,f){this.databaseId=e,this.appId=n,this.persistenceKey=r,this.host=i,this.ssl=s,this.forceLongPolling=o,this.autoDetectLongPolling=l,this.longPollingOptions=c,this.useFetchStreams=u,this.isUsingEmulator=f}}const fu="(default)";class Ja{constructor(e,n){this.projectId=e,this.database=n||fu}static empty(){return new Ja("","")}get isDefaultDatabase(){return this.database===fu}isEqual(e){return e instanceof Ja&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const f0="__type__",Yb="__max__",nc={mapValue:{}},p0="__vector__",pu="value";function Si(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?nd(t)?4:Jb(t)?9007199254740991:Xb(t)?10:11:le(28295,{value:t})}function ur(t,e){if(t===e)return!0;const n=Si(t);if(n!==Si(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return Xa(t).isEqual(Xa(e));case 3:return function(i,s){if(typeof i.timestampValue=="string"&&typeof s.timestampValue=="string"&&i.timestampValue.length===s.timestampValue.length)return i.timestampValue===s.timestampValue;const o=Ti(i.timestampValue),l=Ti(s.timestampValue);return o.seconds===l.seconds&&o.nanos===l.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(i,s){return Ii(i.bytesValue).isEqual(Ii(s.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(i,s){return st(i.geoPointValue.latitude)===st(s.geoPointValue.latitude)&&st(i.geoPointValue.longitude)===st(s.geoPointValue.longitude)}(t,e);case 2:return function(i,s){if("integerValue"in i&&"integerValue"in s)return st(i.integerValue)===st(s.integerValue);if("doubleValue"in i&&"doubleValue"in s){const o=st(i.doubleValue),l=st(s.doubleValue);return o===l?hu(o)===hu(l):isNaN(o)&&isNaN(l)}return!1}(t,e);case 9:return po(t.arrayValue.values||[],e.arrayValue.values||[],ur);case 10:case 11:return function(i,s){const o=i.mapValue.fields||{},l=s.mapValue.fields||{};if(h_(o)!==h_(l))return!1;for(const c in o)if(o.hasOwnProperty(c)&&(l[c]===void 0||!ur(o[c],l[c])))return!1;return!0}(t,e);default:return le(52216,{left:t})}}function Za(t,e){return(t.values||[]).find(n=>ur(n,e))!==void 0}function mo(t,e){if(t===e)return 0;const n=Si(t),r=Si(e);if(n!==r)return we(n,r);switch(n){case 0:case 9007199254740991:return 0;case 1:return we(t.booleanValue,e.booleanValue);case 2:return function(s,o){const l=st(s.integerValue||s.doubleValue),c=st(o.integerValue||o.doubleValue);return l<c?-1:l>c?1:l===c?0:isNaN(l)?isNaN(c)?0:-1:1}(t,e);case 3:return p_(t.timestampValue,e.timestampValue);case 4:return p_(Xa(t),Xa(e));case 5:return qf(t.stringValue,e.stringValue);case 6:return function(s,o){const l=Ii(s),c=Ii(o);return l.compareTo(c)}(t.bytesValue,e.bytesValue);case 7:return function(s,o){const l=s.split("/"),c=o.split("/");for(let u=0;u<l.length&&u<c.length;u++){const f=we(l[u],c[u]);if(f!==0)return f}return we(l.length,c.length)}(t.referenceValue,e.referenceValue);case 8:return function(s,o){const l=we(st(s.latitude),st(o.latitude));return l!==0?l:we(st(s.longitude),st(o.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return m_(t.arrayValue,e.arrayValue);case 10:return function(s,o){var g,S,v,N;const l=s.fields||{},c=o.fields||{},u=(g=l[pu])==null?void 0:g.arrayValue,f=(S=c[pu])==null?void 0:S.arrayValue,p=we(((v=u==null?void 0:u.values)==null?void 0:v.length)||0,((N=f==null?void 0:f.values)==null?void 0:N.length)||0);return p!==0?p:m_(u,f)}(t.mapValue,e.mapValue);case 11:return function(s,o){if(s===nc.mapValue&&o===nc.mapValue)return 0;if(s===nc.mapValue)return 1;if(o===nc.mapValue)return-1;const l=s.fields||{},c=Object.keys(l),u=o.fields||{},f=Object.keys(u);c.sort(),f.sort();for(let p=0;p<c.length&&p<f.length;++p){const g=qf(c[p],f[p]);if(g!==0)return g;const S=mo(l[c[p]],u[f[p]]);if(S!==0)return S}return we(c.length,f.length)}(t.mapValue,e.mapValue);default:throw le(23264,{he:n})}}function p_(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return we(t,e);const n=Ti(t),r=Ti(e),i=we(n.seconds,r.seconds);return i!==0?i:we(n.nanos,r.nanos)}function m_(t,e){const n=t.values||[],r=e.values||[];for(let i=0;i<n.length&&i<r.length;++i){const s=mo(n[i],r[i]);if(s)return s}return we(n.length,r.length)}function go(t){return Hf(t)}function Hf(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){const r=Ti(n);return`time(${r.seconds},${r.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return Ii(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return ne.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let r="[",i=!0;for(const s of n.values||[])i?i=!1:r+=",",r+=Hf(s);return r+"]"}(t.arrayValue):"mapValue"in t?function(n){const r=Object.keys(n.fields||{}).sort();let i="{",s=!0;for(const o of r)s?s=!1:i+=",",i+=`${o}:${Hf(n.fields[o])}`;return i+"}"}(t.mapValue):le(61005,{value:t})}function xc(t){switch(Si(t)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=rd(t);return e?16+xc(e):16;case 5:return 2*t.stringValue.length;case 6:return Ii(t.bytesValue).approximateByteSize();case 7:return t.referenceValue.length;case 9:return function(r){return(r.values||[]).reduce((i,s)=>i+xc(s),0)}(t.arrayValue);case 10:case 11:return function(r){let i=0;return Oi(r.fields,(s,o)=>{i+=s.length+xc(o)}),i}(t.mapValue);default:throw le(13486,{value:t})}}function mu(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function Wf(t){return!!t&&"integerValue"in t}function Rm(t){return!!t&&"arrayValue"in t}function g_(t){return!!t&&"nullValue"in t}function y_(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function Pc(t){return!!t&&"mapValue"in t}function Xb(t){var n,r;return((r=(((n=t==null?void 0:t.mapValue)==null?void 0:n.fields)||{})[f0])==null?void 0:r.stringValue)===p0}function Sa(t){if(t.geoPointValue)return{geoPointValue:{...t.geoPointValue}};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:{...t.timestampValue}};if(t.mapValue){const e={mapValue:{fields:{}}};return Oi(t.mapValue.fields,(n,r)=>e.mapValue.fields[n]=Sa(r)),e}if(t.arrayValue){const e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=Sa(t.arrayValue.values[n]);return e}return{...t}}function Jb(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue===Yb}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xt{constructor(e){this.value=e}static empty(){return new Xt({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let r=0;r<e.length-1;++r)if(n=(n.mapValue.fields||{})[e.get(r)],!Pc(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=Sa(n)}setAll(e){let n=St.emptyPath(),r={},i=[];e.forEach((o,l)=>{if(!n.isImmediateParentOf(l)){const c=this.getFieldsMap(n);this.applyChanges(c,r,i),r={},i=[],n=l.popLast()}o?r[l.lastSegment()]=Sa(o):i.push(l.lastSegment())});const s=this.getFieldsMap(n);this.applyChanges(s,r,i)}delete(e){const n=this.field(e.popLast());Pc(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return ur(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let r=0;r<e.length;++r){let i=n.mapValue.fields[e.get(r)];Pc(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},n.mapValue.fields[e.get(r)]=i),n=i}return n.mapValue.fields}applyChanges(e,n,r){Oi(n,(i,s)=>e[i]=s);for(const i of r)delete e[i]}clone(){return new Xt(Sa(this.value))}}function m0(t){const e=[];return Oi(t.fields,(n,r)=>{const i=new St([n]);if(Pc(r)){const s=m0(r.mapValue).fields;if(s.length===0)e.push(i);else for(const o of s)e.push(i.child(o))}else e.push(i)}),new un(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lt{constructor(e,n,r,i,s,o,l){this.key=e,this.documentType=n,this.version=r,this.readTime=i,this.createTime=s,this.data=o,this.documentState=l}static newInvalidDocument(e){return new Lt(e,0,de.min(),de.min(),de.min(),Xt.empty(),0)}static newFoundDocument(e,n,r,i){return new Lt(e,1,n,de.min(),r,i,0)}static newNoDocument(e,n){return new Lt(e,2,n,de.min(),de.min(),Xt.empty(),0)}static newUnknownDocument(e,n){return new Lt(e,3,n,de.min(),de.min(),Xt.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(de.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Xt.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Xt.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=de.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Lt&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Lt(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yo{constructor(e,n){this.position=e,this.inclusive=n}}function v_(t,e,n){let r=0;for(let i=0;i<t.position.length;i++){const s=e[i],o=t.position[i];if(s.field.isKeyField()?r=ne.comparator(ne.fromName(o.referenceValue),n.key):r=mo(o,n.data.field(s.field)),s.dir==="desc"&&(r*=-1),r!==0)break}return r}function __(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!ur(t.position[n],e.position[n]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class el{constructor(e,n="asc"){this.field=e,this.dir=n}}function Zb(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class g0{}class ut extends g0{constructor(e,n,r){super(),this.field=e,this.op=n,this.value=r}static create(e,n,r){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,r):new tD(e,n,r):n==="array-contains"?new iD(e,r):n==="in"?new sD(e,r):n==="not-in"?new oD(e,r):n==="array-contains-any"?new aD(e,r):new ut(e,n,r)}static createKeyFieldInFilter(e,n,r){return n==="in"?new nD(e,r):new rD(e,r)}matches(e){const n=e.data.field(this.field);return this.op==="!="?n!==null&&n.nullValue===void 0&&this.matchesComparison(mo(n,this.value)):n!==null&&Si(this.value)===Si(n)&&this.matchesComparison(mo(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return le(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Bn extends g0{constructor(e,n){super(),this.filters=e,this.op=n,this.Pe=null}static create(e,n){return new Bn(e,n)}matches(e){return y0(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}}function y0(t){return t.op==="and"}function v0(t){return eD(t)&&y0(t)}function eD(t){for(const e of t.filters)if(e instanceof Bn)return!1;return!0}function Gf(t){if(t instanceof ut)return t.field.canonicalString()+t.op.toString()+go(t.value);if(v0(t))return t.filters.map(e=>Gf(e)).join(",");{const e=t.filters.map(n=>Gf(n)).join(",");return`${t.op}(${e})`}}function _0(t,e){return t instanceof ut?function(r,i){return i instanceof ut&&r.op===i.op&&r.field.isEqual(i.field)&&ur(r.value,i.value)}(t,e):t instanceof Bn?function(r,i){return i instanceof Bn&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce((s,o,l)=>s&&_0(o,i.filters[l]),!0):!1}(t,e):void le(19439)}function w0(t){return t instanceof ut?function(n){return`${n.field.canonicalString()} ${n.op} ${go(n.value)}`}(t):t instanceof Bn?function(n){return n.op.toString()+" {"+n.getFilters().map(w0).join(" ,")+"}"}(t):"Filter"}class tD extends ut{constructor(e,n,r){super(e,n,r),this.key=ne.fromName(r.referenceValue)}matches(e){const n=ne.comparator(e.key,this.key);return this.matchesComparison(n)}}class nD extends ut{constructor(e,n){super(e,"in",n),this.keys=E0("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}}class rD extends ut{constructor(e,n){super(e,"not-in",n),this.keys=E0("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}}function E0(t,e){var n;return(((n=e.arrayValue)==null?void 0:n.values)||[]).map(r=>ne.fromName(r.referenceValue))}class iD extends ut{constructor(e,n){super(e,"array-contains",n)}matches(e){const n=e.data.field(this.field);return Rm(n)&&Za(n.arrayValue,this.value)}}class sD extends ut{constructor(e,n){super(e,"in",n)}matches(e){const n=e.data.field(this.field);return n!==null&&Za(this.value.arrayValue,n)}}class oD extends ut{constructor(e,n){super(e,"not-in",n)}matches(e){if(Za(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const n=e.data.field(this.field);return n!==null&&n.nullValue===void 0&&!Za(this.value.arrayValue,n)}}class aD extends ut{constructor(e,n){super(e,"array-contains-any",n)}matches(e){const n=e.data.field(this.field);return!(!Rm(n)||!n.arrayValue.values)&&n.arrayValue.values.some(r=>Za(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lD{constructor(e,n=null,r=[],i=[],s=null,o=null,l=null){this.path=e,this.collectionGroup=n,this.orderBy=r,this.filters=i,this.limit=s,this.startAt=o,this.endAt=l,this.Te=null}}function w_(t,e=null,n=[],r=[],i=null,s=null,o=null){return new lD(t,e,n,r,i,s,o)}function xm(t){const e=ue(t);if(e.Te===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(r=>Gf(r)).join(","),n+="|ob:",n+=e.orderBy.map(r=>function(s){return s.field.canonicalString()+s.dir}(r)).join(","),td(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(r=>go(r)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(r=>go(r)).join(",")),e.Te=n}return e.Te}function Pm(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!Zb(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!_0(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!__(t.startAt,e.startAt)&&__(t.endAt,e.endAt)}function Kf(t){return ne.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Li{constructor(e,n=null,r=[],i=[],s=null,o="F",l=null,c=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=r,this.filters=i,this.limit=s,this.limitType=o,this.startAt=l,this.endAt=c,this.Ie=null,this.Ee=null,this.de=null,this.startAt,this.endAt}}function cD(t,e,n,r,i,s,o,l){return new Li(t,e,n,r,i,s,o,l)}function id(t){return new Li(t)}function E_(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function km(t){return t.collectionGroup!==null}function eo(t){const e=ue(t);if(e.Ie===null){e.Ie=[];const n=new Set;for(const s of e.explicitOrderBy)e.Ie.push(s),n.add(s.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let l=new gt(St.comparator);return o.filters.forEach(c=>{c.getFlattenedFilters().forEach(u=>{u.isInequality()&&(l=l.add(u.field))})}),l})(e).forEach(s=>{n.has(s.canonicalString())||s.isKeyField()||e.Ie.push(new el(s,r))}),n.has(St.keyField().canonicalString())||e.Ie.push(new el(St.keyField(),r))}return e.Ie}function or(t){const e=ue(t);return e.Ee||(e.Ee=T0(e,eo(t))),e.Ee}function uD(t){const e=ue(t);return e.de||(e.de=T0(e,t.explicitOrderBy)),e.de}function T0(t,e){if(t.limitType==="F")return w_(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(i=>{const s=i.dir==="desc"?"asc":"desc";return new el(i.field,s)});const n=t.endAt?new yo(t.endAt.position,t.endAt.inclusive):null,r=t.startAt?new yo(t.startAt.position,t.startAt.inclusive):null;return w_(t.path,t.collectionGroup,e,t.filters,t.limit,n,r)}}function Qf(t,e){const n=t.filters.concat([e]);return new Li(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function gu(t,e,n){return new Li(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function sd(t,e){return Pm(or(t),or(e))&&t.limitType===e.limitType}function I0(t){return`${xm(or(t))}|lt:${t.limitType}`}function ks(t){return`Query(target=${function(n){let r=n.path.canonicalString();return n.collectionGroup!==null&&(r+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(r+=`, filters: [${n.filters.map(i=>w0(i)).join(", ")}]`),td(n.limit)||(r+=", limit: "+n.limit),n.orderBy.length>0&&(r+=`, orderBy: [${n.orderBy.map(i=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(i)).join(", ")}]`),n.startAt&&(r+=", startAt: ",r+=n.startAt.inclusive?"b:":"a:",r+=n.startAt.position.map(i=>go(i)).join(",")),n.endAt&&(r+=", endAt: ",r+=n.endAt.inclusive?"a:":"b:",r+=n.endAt.position.map(i=>go(i)).join(",")),`Target(${r})`}(or(t))}; limitType=${t.limitType})`}function od(t,e){return e.isFoundDocument()&&function(r,i){const s=i.key.path;return r.collectionGroup!==null?i.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(s):ne.isDocumentKey(r.path)?r.path.isEqual(s):r.path.isImmediateParentOf(s)}(t,e)&&function(r,i){for(const s of eo(r))if(!s.field.isKeyField()&&i.data.field(s.field)===null)return!1;return!0}(t,e)&&function(r,i){for(const s of r.filters)if(!s.matches(i))return!1;return!0}(t,e)&&function(r,i){return!(r.startAt&&!function(o,l,c){const u=v_(o,l,c);return o.inclusive?u<=0:u<0}(r.startAt,eo(r),i)||r.endAt&&!function(o,l,c){const u=v_(o,l,c);return o.inclusive?u>=0:u>0}(r.endAt,eo(r),i))}(t,e)}function dD(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function S0(t){return(e,n)=>{let r=!1;for(const i of eo(t)){const s=hD(i,e,n);if(s!==0)return s;r=r||i.field.isKeyField()}return 0}}function hD(t,e,n){const r=t.field.isKeyField()?ne.comparator(e.key,n.key):function(s,o,l){const c=o.data.field(s),u=l.data.field(s);return c!==null&&u!==null?mo(c,u):le(42886)}(t.field,e,n);switch(t.dir){case"asc":return r;case"desc":return-1*r;default:return le(19790,{direction:t.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ws{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r!==void 0){for(const[i,s]of r)if(this.equalsFn(i,e))return s}}has(e){return this.get(e)!==void 0}set(e,n){const r=this.mapKeyFn(e),i=this.inner[r];if(i===void 0)return this.inner[r]=[[e,n]],void this.innerSize++;for(let s=0;s<i.length;s++)if(this.equalsFn(i[s][0],e))return void(i[s]=[e,n]);i.push([e,n]),this.innerSize++}delete(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r===void 0)return!1;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return r.length===1?delete this.inner[n]:r.splice(i,1),this.innerSize--,!0;return!1}forEach(e){Oi(this.inner,(n,r)=>{for(const[i,s]of r)e(i,s)})}isEmpty(){return a0(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fD=new Je(ne.comparator);function Dr(){return fD}const C0=new Je(ne.comparator);function ca(...t){let e=C0;for(const n of t)e=e.insert(n.key,n);return e}function A0(t){let e=C0;return t.forEach((n,r)=>e=e.insert(n,r.overlayedDocument)),e}function Yi(){return Ca()}function R0(){return Ca()}function Ca(){return new ws(t=>t.toString(),(t,e)=>t.isEqual(e))}const pD=new Je(ne.comparator),mD=new gt(ne.comparator);function Ee(...t){let e=mD;for(const n of t)e=e.add(n);return e}const gD=new gt(we);function yD(){return gD}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nm(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:hu(e)?"-0":e}}function x0(t){return{integerValue:""+t}}function vD(t,e){return qb(e)?x0(e):Nm(t,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ad{constructor(){this._=void 0}}function _D(t,e,n){return t instanceof tl?function(i,s){const o={fields:{[u0]:{stringValue:c0},[h0]:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return s&&nd(s)&&(s=rd(s)),s&&(o.fields[d0]=s),{mapValue:o}}(n,e):t instanceof vo?k0(t,e):t instanceof nl?N0(t,e):function(i,s){const o=P0(i,s),l=T_(o)+T_(i.Ae);return Wf(o)&&Wf(i.Ae)?x0(l):Nm(i.serializer,l)}(t,e)}function wD(t,e,n){return t instanceof vo?k0(t,e):t instanceof nl?N0(t,e):n}function P0(t,e){return t instanceof yu?function(r){return Wf(r)||function(s){return!!s&&"doubleValue"in s}(r)}(e)?e:{integerValue:0}:null}class tl extends ad{}class vo extends ad{constructor(e){super(),this.elements=e}}function k0(t,e){const n=b0(e);for(const r of t.elements)n.some(i=>ur(i,r))||n.push(r);return{arrayValue:{values:n}}}class nl extends ad{constructor(e){super(),this.elements=e}}function N0(t,e){let n=b0(e);for(const r of t.elements)n=n.filter(i=>!ur(i,r));return{arrayValue:{values:n}}}class yu extends ad{constructor(e,n){super(),this.serializer=e,this.Ae=n}}function T_(t){return st(t.integerValue||t.doubleValue)}function b0(t){return Rm(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class D0{constructor(e,n){this.field=e,this.transform=n}}function ED(t,e){return t.field.isEqual(e.field)&&function(r,i){return r instanceof vo&&i instanceof vo||r instanceof nl&&i instanceof nl?po(r.elements,i.elements,ur):r instanceof yu&&i instanceof yu?ur(r.Ae,i.Ae):r instanceof tl&&i instanceof tl}(t.transform,e.transform)}class TD{constructor(e,n){this.version=e,this.transformResults=n}}class An{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new An}static exists(e){return new An(void 0,e)}static updateTime(e){return new An(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function kc(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}class ld{}function O0(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new bm(t.key,An.none()):new ml(t.key,t.data,An.none());{const n=t.data,r=Xt.empty();let i=new gt(St.comparator);for(let s of e.fields)if(!i.has(s)){let o=n.field(s);o===null&&s.length>1&&(s=s.popLast(),o=n.field(s)),o===null?r.delete(s):r.set(s,o),i=i.add(s)}return new Vi(t.key,r,new un(i.toArray()),An.none())}}function ID(t,e,n){t instanceof ml?function(i,s,o){const l=i.value.clone(),c=S_(i.fieldTransforms,s,o.transformResults);l.setAll(c),s.convertToFoundDocument(o.version,l).setHasCommittedMutations()}(t,e,n):t instanceof Vi?function(i,s,o){if(!kc(i.precondition,s))return void s.convertToUnknownDocument(o.version);const l=S_(i.fieldTransforms,s,o.transformResults),c=s.data;c.setAll(L0(i)),c.setAll(l),s.convertToFoundDocument(o.version,c).setHasCommittedMutations()}(t,e,n):function(i,s,o){s.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,n)}function Aa(t,e,n,r){return t instanceof ml?function(s,o,l,c){if(!kc(s.precondition,o))return l;const u=s.value.clone(),f=C_(s.fieldTransforms,c,o);return u.setAll(f),o.convertToFoundDocument(o.version,u).setHasLocalMutations(),null}(t,e,n,r):t instanceof Vi?function(s,o,l,c){if(!kc(s.precondition,o))return l;const u=C_(s.fieldTransforms,c,o),f=o.data;return f.setAll(L0(s)),f.setAll(u),o.convertToFoundDocument(o.version,f).setHasLocalMutations(),l===null?null:l.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(p=>p.field))}(t,e,n,r):function(s,o,l){return kc(s.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):l}(t,e,n)}function SD(t,e){let n=null;for(const r of t.fieldTransforms){const i=e.data.field(r.field),s=P0(r.transform,i||null);s!=null&&(n===null&&(n=Xt.empty()),n.set(r.field,s))}return n||null}function I_(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(r,i){return r===void 0&&i===void 0||!(!r||!i)&&po(r,i,(s,o)=>ED(s,o))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}class ml extends ld{constructor(e,n,r,i=[]){super(),this.key=e,this.value=n,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class Vi extends ld{constructor(e,n,r,i,s=[]){super(),this.key=e,this.data=n,this.fieldMask=r,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function L0(t){const e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){const r=t.data.field(n);e.set(n,r)}}),e}function S_(t,e,n){const r=new Map;Pe(t.length===n.length,32656,{Re:n.length,Ve:t.length});for(let i=0;i<n.length;i++){const s=t[i],o=s.transform,l=e.data.field(s.field);r.set(s.field,wD(o,l,n[i]))}return r}function C_(t,e,n){const r=new Map;for(const i of t){const s=i.transform,o=n.data.field(i.field);r.set(i.field,_D(s,o,e))}return r}class bm extends ld{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class CD extends ld{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AD{constructor(e,n,r,i){this.batchId=e,this.localWriteTime=n,this.baseMutations=r,this.mutations=i}applyToRemoteDocument(e,n){const r=n.mutationResults;for(let i=0;i<this.mutations.length;i++){const s=this.mutations[i];s.key.isEqual(e.key)&&ID(s,e,r[i])}}applyToLocalView(e,n){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(n=Aa(r,e,n,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(n=Aa(r,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){const r=R0();return this.mutations.forEach(i=>{const s=e.get(i.key),o=s.overlayedDocument;let l=this.applyToLocalView(o,s.mutatedFields);l=n.has(i.key)?null:l;const c=O0(o,l);c!==null&&r.set(i.key,c),o.isValidDocument()||o.convertToNoDocument(de.min())}),r}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),Ee())}isEqual(e){return this.batchId===e.batchId&&po(this.mutations,e.mutations,(n,r)=>I_(n,r))&&po(this.baseMutations,e.baseMutations,(n,r)=>I_(n,r))}}class Dm{constructor(e,n,r,i){this.batch=e,this.commitVersion=n,this.mutationResults=r,this.docVersions=i}static from(e,n,r){Pe(e.mutations.length===r.length,58842,{me:e.mutations.length,fe:r.length});let i=function(){return pD}();const s=e.mutations;for(let o=0;o<s.length;o++)i=i.insert(s[o].key,r[o].version);return new Dm(e,n,r,i)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class RD{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xD{constructor(e,n,r){this.alias=e,this.aggregateType=n,this.fieldPath=r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class PD{constructor(e,n){this.count=e,this.unchangedNames=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var lt,Ie;function kD(t){switch(t){case M.OK:return le(64938);case M.CANCELLED:case M.UNKNOWN:case M.DEADLINE_EXCEEDED:case M.RESOURCE_EXHAUSTED:case M.INTERNAL:case M.UNAVAILABLE:case M.UNAUTHENTICATED:return!1;case M.INVALID_ARGUMENT:case M.NOT_FOUND:case M.ALREADY_EXISTS:case M.PERMISSION_DENIED:case M.FAILED_PRECONDITION:case M.ABORTED:case M.OUT_OF_RANGE:case M.UNIMPLEMENTED:case M.DATA_LOSS:return!0;default:return le(15467,{code:t})}}function V0(t){if(t===void 0)return br("GRPC error has no .code"),M.UNKNOWN;switch(t){case lt.OK:return M.OK;case lt.CANCELLED:return M.CANCELLED;case lt.UNKNOWN:return M.UNKNOWN;case lt.DEADLINE_EXCEEDED:return M.DEADLINE_EXCEEDED;case lt.RESOURCE_EXHAUSTED:return M.RESOURCE_EXHAUSTED;case lt.INTERNAL:return M.INTERNAL;case lt.UNAVAILABLE:return M.UNAVAILABLE;case lt.UNAUTHENTICATED:return M.UNAUTHENTICATED;case lt.INVALID_ARGUMENT:return M.INVALID_ARGUMENT;case lt.NOT_FOUND:return M.NOT_FOUND;case lt.ALREADY_EXISTS:return M.ALREADY_EXISTS;case lt.PERMISSION_DENIED:return M.PERMISSION_DENIED;case lt.FAILED_PRECONDITION:return M.FAILED_PRECONDITION;case lt.ABORTED:return M.ABORTED;case lt.OUT_OF_RANGE:return M.OUT_OF_RANGE;case lt.UNIMPLEMENTED:return M.UNIMPLEMENTED;case lt.DATA_LOSS:return M.DATA_LOSS;default:return le(39323,{code:t})}}(Ie=lt||(lt={}))[Ie.OK=0]="OK",Ie[Ie.CANCELLED=1]="CANCELLED",Ie[Ie.UNKNOWN=2]="UNKNOWN",Ie[Ie.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Ie[Ie.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Ie[Ie.NOT_FOUND=5]="NOT_FOUND",Ie[Ie.ALREADY_EXISTS=6]="ALREADY_EXISTS",Ie[Ie.PERMISSION_DENIED=7]="PERMISSION_DENIED",Ie[Ie.UNAUTHENTICATED=16]="UNAUTHENTICATED",Ie[Ie.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Ie[Ie.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Ie[Ie.ABORTED=10]="ABORTED",Ie[Ie.OUT_OF_RANGE=11]="OUT_OF_RANGE",Ie[Ie.UNIMPLEMENTED=12]="UNIMPLEMENTED",Ie[Ie.INTERNAL=13]="INTERNAL",Ie[Ie.UNAVAILABLE=14]="UNAVAILABLE",Ie[Ie.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ND(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bD=new yi([4294967295,4294967295],0);function A_(t){const e=ND().encode(t),n=new YI;return n.update(e),new Uint8Array(n.digest())}function R_(t){const e=new DataView(t.buffer),n=e.getUint32(0,!0),r=e.getUint32(4,!0),i=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new yi([n,r],0),new yi([i,s],0)]}class Om{constructor(e,n,r){if(this.bitmap=e,this.padding=n,this.hashCount=r,n<0||n>=8)throw new ua(`Invalid padding: ${n}`);if(r<0)throw new ua(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new ua(`Invalid hash count: ${r}`);if(e.length===0&&n!==0)throw new ua(`Invalid padding when bitmap length is 0: ${n}`);this.ge=8*e.length-n,this.pe=yi.fromNumber(this.ge)}ye(e,n,r){let i=e.add(n.multiply(yi.fromNumber(r)));return i.compare(bD)===1&&(i=new yi([i.getBits(0),i.getBits(1)],0)),i.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;const n=A_(e),[r,i]=R_(n);for(let s=0;s<this.hashCount;s++){const o=this.ye(r,i,s);if(!this.we(o))return!1}return!0}static create(e,n,r){const i=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),o=new Om(s,i,n);return r.forEach(l=>o.insert(l)),o}insert(e){if(this.ge===0)return;const n=A_(e),[r,i]=R_(n);for(let s=0;s<this.hashCount;s++){const o=this.ye(r,i,s);this.Se(o)}}Se(e){const n=Math.floor(e/8),r=e%8;this.bitmap[n]|=1<<r}}class ua extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cd{constructor(e,n,r,i,s){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=r,this.documentUpdates=i,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,n,r){const i=new Map;return i.set(e,gl.createSynthesizedTargetChangeForCurrentChange(e,n,r)),new cd(de.min(),i,new Je(we),Dr(),Ee())}}class gl{constructor(e,n,r,i,s){this.resumeToken=e,this.current=n,this.addedDocuments=r,this.modifiedDocuments=i,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,n,r){return new gl(r,n,Ee(),Ee(),Ee())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nc{constructor(e,n,r,i){this.be=e,this.removedTargetIds=n,this.key=r,this.De=i}}class j0{constructor(e,n){this.targetId=e,this.Ce=n}}class M0{constructor(e,n,r=Rt.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=n,this.resumeToken=r,this.cause=i}}class x_{constructor(){this.ve=0,this.Fe=P_(),this.Me=Rt.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=Ee(),n=Ee(),r=Ee();return this.Fe.forEach((i,s)=>{switch(s){case 0:e=e.add(i);break;case 2:n=n.add(i);break;case 1:r=r.add(i);break;default:le(38017,{changeType:s})}}),new gl(this.Me,this.xe,e,n,r)}qe(){this.Oe=!1,this.Fe=P_()}Qe(e,n){this.Oe=!0,this.Fe=this.Fe.insert(e,n)}$e(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}Ue(){this.ve+=1}Ke(){this.ve-=1,Pe(this.ve>=0,3241,{ve:this.ve})}We(){this.Oe=!0,this.xe=!0}}class DD{constructor(e){this.Ge=e,this.ze=new Map,this.je=Dr(),this.Je=rc(),this.He=rc(),this.Ye=new Je(we)}Ze(e){for(const n of e.be)e.De&&e.De.isFoundDocument()?this.Xe(n,e.De):this.et(n,e.key,e.De);for(const n of e.removedTargetIds)this.et(n,e.key,e.De)}tt(e){this.forEachTarget(e,n=>{const r=this.nt(n);switch(e.state){case 0:this.rt(n)&&r.Le(e.resumeToken);break;case 1:r.Ke(),r.Ne||r.qe(),r.Le(e.resumeToken);break;case 2:r.Ke(),r.Ne||this.removeTarget(n);break;case 3:this.rt(n)&&(r.We(),r.Le(e.resumeToken));break;case 4:this.rt(n)&&(this.it(n),r.Le(e.resumeToken));break;default:le(56790,{state:e.state})}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.ze.forEach((r,i)=>{this.rt(i)&&n(i)})}st(e){const n=e.targetId,r=e.Ce.count,i=this.ot(n);if(i){const s=i.target;if(Kf(s))if(r===0){const o=new ne(s.path);this.et(n,o,Lt.newNoDocument(o,de.min()))}else Pe(r===1,20013,{expectedCount:r});else{const o=this._t(n);if(o!==r){const l=this.ut(e),c=l?this.ct(l,e,o):1;if(c!==0){this.it(n);const u=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ye=this.Ye.insert(n,u)}}}}}ut(e){const n=e.Ce.unchangedNames;if(!n||!n.bits)return null;const{bits:{bitmap:r="",padding:i=0},hashCount:s=0}=n;let o,l;try{o=Ii(r).toUint8Array()}catch(c){if(c instanceof l0)return fo("Decoding the base64 bloom filter in existence filter failed ("+c.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw c}try{l=new Om(o,i,s)}catch(c){return fo(c instanceof ua?"BloomFilter error: ":"Applying bloom filter failed: ",c),null}return l.ge===0?null:l}ct(e,n,r){return n.Ce.count===r-this.Pt(e,n.targetId)?0:2}Pt(e,n){const r=this.Ge.getRemoteKeysForTarget(n);let i=0;return r.forEach(s=>{const o=this.Ge.ht(),l=`projects/${o.projectId}/databases/${o.database}/documents/${s.path.canonicalString()}`;e.mightContain(l)||(this.et(n,s,null),i++)}),i}Tt(e){const n=new Map;this.ze.forEach((s,o)=>{const l=this.ot(o);if(l){if(s.current&&Kf(l.target)){const c=new ne(l.target.path);this.It(c).has(o)||this.Et(o,c)||this.et(o,c,Lt.newNoDocument(c,e))}s.Be&&(n.set(o,s.ke()),s.qe())}});let r=Ee();this.He.forEach((s,o)=>{let l=!0;o.forEachWhile(c=>{const u=this.ot(c);return!u||u.purpose==="TargetPurposeLimboResolution"||(l=!1,!1)}),l&&(r=r.add(s))}),this.je.forEach((s,o)=>o.setReadTime(e));const i=new cd(e,n,this.Ye,this.je,r);return this.je=Dr(),this.Je=rc(),this.He=rc(),this.Ye=new Je(we),i}Xe(e,n){if(!this.rt(e))return;const r=this.Et(e,n.key)?2:0;this.nt(e).Qe(n.key,r),this.je=this.je.insert(n.key,n),this.Je=this.Je.insert(n.key,this.It(n.key).add(e)),this.He=this.He.insert(n.key,this.dt(n.key).add(e))}et(e,n,r){if(!this.rt(e))return;const i=this.nt(e);this.Et(e,n)?i.Qe(n,1):i.$e(n),this.He=this.He.insert(n,this.dt(n).delete(e)),this.He=this.He.insert(n,this.dt(n).add(e)),r&&(this.je=this.je.insert(n,r))}removeTarget(e){this.ze.delete(e)}_t(e){const n=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}Ue(e){this.nt(e).Ue()}nt(e){let n=this.ze.get(e);return n||(n=new x_,this.ze.set(e,n)),n}dt(e){let n=this.He.get(e);return n||(n=new gt(we),this.He=this.He.insert(e,n)),n}It(e){let n=this.Je.get(e);return n||(n=new gt(we),this.Je=this.Je.insert(e,n)),n}rt(e){const n=this.ot(e)!==null;return n||Z("WatchChangeAggregator","Detected inactive target",e),n}ot(e){const n=this.ze.get(e);return n&&n.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new x_),this.Ge.getRemoteKeysForTarget(e).forEach(n=>{this.et(e,n,null)})}Et(e,n){return this.Ge.getRemoteKeysForTarget(e).has(n)}}function rc(){return new Je(ne.comparator)}function P_(){return new Je(ne.comparator)}const OD={asc:"ASCENDING",desc:"DESCENDING"},LD={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},VD={and:"AND",or:"OR"};class jD{constructor(e,n){this.databaseId=e,this.useProto3Json=n}}function Yf(t,e){return t.useProto3Json||td(e)?e:{value:e}}function vu(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function F0(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function MD(t,e){return vu(t,e.toTimestamp())}function ar(t){return Pe(!!t,49232),de.fromTimestamp(function(n){const r=Ti(n);return new Oe(r.seconds,r.nanos)}(t))}function Lm(t,e){return Xf(t,e).canonicalString()}function Xf(t,e){const n=function(i){return new Me(["projects",i.projectId,"databases",i.database])}(t).child("documents");return e===void 0?n:n.child(e)}function U0(t){const e=Me.fromString(t);return Pe(W0(e),10190,{key:e.toString()}),e}function Jf(t,e){return Lm(t.databaseId,e.path)}function Ih(t,e){const n=U0(e);if(n.get(1)!==t.databaseId.projectId)throw new G(M.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new G(M.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new ne(B0(n))}function $0(t,e){return Lm(t.databaseId,e)}function FD(t){const e=U0(t);return e.length===4?Me.emptyPath():B0(e)}function Zf(t){return new Me(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function B0(t){return Pe(t.length>4&&t.get(4)==="documents",29091,{key:t.toString()}),t.popFirst(5)}function k_(t,e,n){return{name:Jf(t,e),fields:n.value.mapValue.fields}}function UD(t,e){let n;if("targetChange"in e){e.targetChange;const r=function(u){return u==="NO_CHANGE"?0:u==="ADD"?1:u==="REMOVE"?2:u==="CURRENT"?3:u==="RESET"?4:le(39313,{state:u})}(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],s=function(u,f){return u.useProto3Json?(Pe(f===void 0||typeof f=="string",58123),Rt.fromBase64String(f||"")):(Pe(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),Rt.fromUint8Array(f||new Uint8Array))}(t,e.targetChange.resumeToken),o=e.targetChange.cause,l=o&&function(u){const f=u.code===void 0?M.UNKNOWN:V0(u.code);return new G(f,u.message||"")}(o);n=new M0(r,i,s,l||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const i=Ih(t,r.document.name),s=ar(r.document.updateTime),o=r.document.createTime?ar(r.document.createTime):de.min(),l=new Xt({mapValue:{fields:r.document.fields}}),c=Lt.newFoundDocument(i,s,o,l),u=r.targetIds||[],f=r.removedTargetIds||[];n=new Nc(u,f,c.key,c)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const i=Ih(t,r.document),s=r.readTime?ar(r.readTime):de.min(),o=Lt.newNoDocument(i,s),l=r.removedTargetIds||[];n=new Nc([],l,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const i=Ih(t,r.document),s=r.removedTargetIds||[];n=new Nc([],s,i,null)}else{if(!("filter"in e))return le(11601,{Rt:e});{e.filter;const r=e.filter;r.targetId;const{count:i=0,unchangedNames:s}=r,o=new PD(i,s),l=r.targetId;n=new j0(l,o)}}return n}function $D(t,e){let n;if(e instanceof ml)n={update:k_(t,e.key,e.value)};else if(e instanceof bm)n={delete:Jf(t,e.key)};else if(e instanceof Vi)n={update:k_(t,e.key,e.data),updateMask:YD(e.fieldMask)};else{if(!(e instanceof CD))return le(16599,{Vt:e.type});n={verify:Jf(t,e.key)}}return e.fieldTransforms.length>0&&(n.updateTransforms=e.fieldTransforms.map(r=>function(s,o){const l=o.transform;if(l instanceof tl)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(l instanceof vo)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:l.elements}};if(l instanceof nl)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:l.elements}};if(l instanceof yu)return{fieldPath:o.field.canonicalString(),increment:l.Ae};throw le(20930,{transform:o.transform})}(0,r))),e.precondition.isNone||(n.currentDocument=function(i,s){return s.updateTime!==void 0?{updateTime:MD(i,s.updateTime)}:s.exists!==void 0?{exists:s.exists}:le(27497)}(t,e.precondition)),n}function BD(t,e){return t&&t.length>0?(Pe(e!==void 0,14353),t.map(n=>function(i,s){let o=i.updateTime?ar(i.updateTime):ar(s);return o.isEqual(de.min())&&(o=ar(s)),new TD(o,i.transformResults||[])}(n,e))):[]}function zD(t,e){return{documents:[$0(t,e.path)]}}function z0(t,e){const n={structuredQuery:{}},r=e.path;let i;e.collectionGroup!==null?(i=r,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(i=r.popLast(),n.structuredQuery.from=[{collectionId:r.lastSegment()}]),n.parent=$0(t,i);const s=function(u){if(u.length!==0)return H0(Bn.create(u,"and"))}(e.filters);s&&(n.structuredQuery.where=s);const o=function(u){if(u.length!==0)return u.map(f=>function(g){return{field:ei(g.field),direction:GD(g.dir)}}(f))}(e.orderBy);o&&(n.structuredQuery.orderBy=o);const l=Yf(t,e.limit);return l!==null&&(n.structuredQuery.limit=l),e.startAt&&(n.structuredQuery.startAt=function(u){return{before:u.inclusive,values:u.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(u){return{before:!u.inclusive,values:u.position}}(e.endAt)),{ft:n,parent:i}}function qD(t,e,n,r){const{ft:i,parent:s}=z0(t,e),o={},l=[];let c=0;return n.forEach(u=>{const f="aggregate_"+c++;o[f]=u.alias,u.aggregateType==="count"?l.push({alias:f,count:{}}):u.aggregateType==="avg"?l.push({alias:f,avg:{field:ei(u.fieldPath)}}):u.aggregateType==="sum"&&l.push({alias:f,sum:{field:ei(u.fieldPath)}})}),{request:{structuredAggregationQuery:{aggregations:l,structuredQuery:i.structuredQuery},parent:i.parent},gt:o,parent:s}}function HD(t){let e=FD(t.parent);const n=t.structuredQuery,r=n.from?n.from.length:0;let i=null;if(r>0){Pe(r===1,65062);const f=n.from[0];f.allDescendants?i=f.collectionId:e=e.child(f.collectionId)}let s=[];n.where&&(s=function(p){const g=q0(p);return g instanceof Bn&&v0(g)?g.getFilters():[g]}(n.where));let o=[];n.orderBy&&(o=function(p){return p.map(g=>function(v){return new el(Ns(v.field),function(b){switch(b){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(v.direction))}(g))}(n.orderBy));let l=null;n.limit&&(l=function(p){let g;return g=typeof p=="object"?p.value:p,td(g)?null:g}(n.limit));let c=null;n.startAt&&(c=function(p){const g=!!p.before,S=p.values||[];return new yo(S,g)}(n.startAt));let u=null;return n.endAt&&(u=function(p){const g=!p.before,S=p.values||[];return new yo(S,g)}(n.endAt)),cD(e,i,o,s,l,"F",c,u)}function WD(t,e){const n=function(i){switch(i){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return le(28987,{purpose:i})}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function q0(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":const r=Ns(n.unaryFilter.field);return ut.create(r,"==",{doubleValue:NaN});case"IS_NULL":const i=Ns(n.unaryFilter.field);return ut.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const s=Ns(n.unaryFilter.field);return ut.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=Ns(n.unaryFilter.field);return ut.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return le(61313);default:return le(60726)}}(t):t.fieldFilter!==void 0?function(n){return ut.create(Ns(n.fieldFilter.field),function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return le(58110);default:return le(50506)}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return Bn.create(n.compositeFilter.filters.map(r=>q0(r)),function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return le(1026)}}(n.compositeFilter.op))}(t):le(30097,{filter:t})}function GD(t){return OD[t]}function KD(t){return LD[t]}function QD(t){return VD[t]}function ei(t){return{fieldPath:t.canonicalString()}}function Ns(t){return St.fromServerFormat(t.fieldPath)}function H0(t){return t instanceof ut?function(n){if(n.op==="=="){if(y_(n.value))return{unaryFilter:{field:ei(n.field),op:"IS_NAN"}};if(g_(n.value))return{unaryFilter:{field:ei(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(y_(n.value))return{unaryFilter:{field:ei(n.field),op:"IS_NOT_NAN"}};if(g_(n.value))return{unaryFilter:{field:ei(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:ei(n.field),op:KD(n.op),value:n.value}}}(t):t instanceof Bn?function(n){const r=n.getFilters().map(i=>H0(i));return r.length===1?r[0]:{compositeFilter:{op:QD(n.op),filters:r}}}(t):le(54877,{filter:t})}function YD(t){const e=[];return t.fields.forEach(n=>e.push(n.canonicalString())),{fieldPaths:e}}function W0(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ii{constructor(e,n,r,i,s=de.min(),o=de.min(),l=Rt.EMPTY_BYTE_STRING,c=null){this.target=e,this.targetId=n,this.purpose=r,this.sequenceNumber=i,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=l,this.expectedCount=c}withSequenceNumber(e){return new ii(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new ii(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new ii(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new ii(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class XD{constructor(e){this.yt=e}}function JD(t){const e=HD({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?gu(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ZD{constructor(){this.Cn=new e2}addToCollectionParentIndex(e,n){return this.Cn.add(n),U.resolve()}getCollectionParents(e,n){return U.resolve(this.Cn.getEntries(n))}addFieldIndex(e,n){return U.resolve()}deleteFieldIndex(e,n){return U.resolve()}deleteAllFieldIndexes(e){return U.resolve()}createTargetIndexes(e,n){return U.resolve()}getDocumentsMatchingTarget(e,n){return U.resolve(null)}getIndexType(e,n){return U.resolve(0)}getFieldIndexes(e,n){return U.resolve([])}getNextCollectionGroupToUpdate(e){return U.resolve(null)}getMinOffset(e,n){return U.resolve(Ei.min())}getMinOffsetFromCollectionGroup(e,n){return U.resolve(Ei.min())}updateCollectionGroup(e,n,r){return U.resolve()}updateIndexEntries(e,n){return U.resolve()}}class e2{constructor(){this.index={}}add(e){const n=e.lastSegment(),r=e.popLast(),i=this.index[n]||new gt(Me.comparator),s=!i.has(r);return this.index[n]=i.add(r),s}has(e){const n=e.lastSegment(),r=e.popLast(),i=this.index[n];return i&&i.has(r)}getEntries(e){return(this.index[e]||new gt(Me.comparator)).toArray()}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const N_={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},G0=41943040;class Kt{static withCacheSize(e){return new Kt(e,Kt.DEFAULT_COLLECTION_PERCENTILE,Kt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,n,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=n,this.maximumSequenceNumbersToCollect=r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Kt.DEFAULT_COLLECTION_PERCENTILE=10,Kt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Kt.DEFAULT=new Kt(G0,Kt.DEFAULT_COLLECTION_PERCENTILE,Kt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Kt.DISABLED=new Kt(-1,0,0);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _o{constructor(e){this.ar=e}next(){return this.ar+=2,this.ar}static ur(){return new _o(0)}static cr(){return new _o(-1)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const b_="LruGarbageCollector",t2=1048576;function D_([t,e],[n,r]){const i=we(t,n);return i===0?we(e,r):i}class n2{constructor(e){this.Ir=e,this.buffer=new gt(D_),this.Er=0}dr(){return++this.Er}Ar(e){const n=[e,this.dr()];if(this.buffer.size<this.Ir)this.buffer=this.buffer.add(n);else{const r=this.buffer.last();D_(n,r)<0&&(this.buffer=this.buffer.delete(r).add(n))}}get maxValue(){return this.buffer.last()[0]}}class r2{constructor(e,n,r){this.garbageCollector=e,this.asyncQueue=n,this.localStore=r,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Vr(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Vr(e){Z(b_,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(n){ko(n)?Z(b_,"Ignoring IndexedDB error during garbage collection: ",n):await Po(n)}await this.Vr(3e5)})}}class i2{constructor(e,n){this.mr=e,this.params=n}calculateTargetCount(e,n){return this.mr.gr(e).next(r=>Math.floor(n/100*r))}nthSequenceNumber(e,n){if(n===0)return U.resolve(ed.ce);const r=new n2(n);return this.mr.forEachTarget(e,i=>r.Ar(i.sequenceNumber)).next(()=>this.mr.pr(e,i=>r.Ar(i))).next(()=>r.maxValue)}removeTargets(e,n,r){return this.mr.removeTargets(e,n,r)}removeOrphanedDocuments(e,n){return this.mr.removeOrphanedDocuments(e,n)}collect(e,n){return this.params.cacheSizeCollectionThreshold===-1?(Z("LruGarbageCollector","Garbage collection skipped; disabled"),U.resolve(N_)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(Z("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),N_):this.yr(e,n))}getCacheSize(e){return this.mr.getCacheSize(e)}yr(e,n){let r,i,s,o,l,c,u;const f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(p=>(p>this.params.maximumSequenceNumbersToCollect?(Z("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),i=this.params.maximumSequenceNumbersToCollect):i=p,o=Date.now(),this.nthSequenceNumber(e,i))).next(p=>(r=p,l=Date.now(),this.removeTargets(e,r,n))).next(p=>(s=p,c=Date.now(),this.removeOrphanedDocuments(e,r))).next(p=>(u=Date.now(),Ps()<=_e.DEBUG&&Z("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-f}ms
	Determined least recently used ${i} in `+(l-o)+`ms
	Removed ${s} targets in `+(c-l)+`ms
	Removed ${p} documents in `+(u-c)+`ms
Total Duration: ${u-f}ms`),U.resolve({didRun:!0,sequenceNumbersCollected:i,targetsRemoved:s,documentsRemoved:p})))}}function s2(t,e){return new i2(t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class o2{constructor(){this.changes=new ws(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,Lt.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();const r=this.changes.get(n);return r!==void 0?U.resolve(r):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class a2{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class l2{constructor(e,n,r,i){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=r,this.indexManager=i}getDocument(e,n){let r=null;return this.documentOverlayCache.getOverlay(e,n).next(i=>(r=i,this.remoteDocumentCache.getEntry(e,n))).next(i=>(r!==null&&Aa(r.mutation,i,un.empty(),Oe.now()),i))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.getLocalViewOfDocuments(e,r,Ee()).next(()=>r))}getLocalViewOfDocuments(e,n,r=Ee()){const i=Yi();return this.populateOverlays(e,i,n).next(()=>this.computeViews(e,n,i,r).next(s=>{let o=ca();return s.forEach((l,c)=>{o=o.insert(l,c.overlayedDocument)}),o}))}getOverlayedDocuments(e,n){const r=Yi();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,Ee()))}populateOverlays(e,n,r){const i=[];return r.forEach(s=>{n.has(s)||i.push(s)}),this.documentOverlayCache.getOverlays(e,i).next(s=>{s.forEach((o,l)=>{n.set(o,l)})})}computeViews(e,n,r,i){let s=Dr();const o=Ca(),l=function(){return Ca()}();return n.forEach((c,u)=>{const f=r.get(u.key);i.has(u.key)&&(f===void 0||f.mutation instanceof Vi)?s=s.insert(u.key,u):f!==void 0?(o.set(u.key,f.mutation.getFieldMask()),Aa(f.mutation,u,f.mutation.getFieldMask(),Oe.now())):o.set(u.key,un.empty())}),this.recalculateAndSaveOverlays(e,s).next(c=>(c.forEach((u,f)=>o.set(u,f)),n.forEach((u,f)=>l.set(u,new a2(f,o.get(u)??null))),l))}recalculateAndSaveOverlays(e,n){const r=Ca();let i=new Je((o,l)=>o-l),s=Ee();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(o=>{for(const l of o)l.keys().forEach(c=>{const u=n.get(c);if(u===null)return;let f=r.get(c)||un.empty();f=l.applyToLocalView(u,f),r.set(c,f);const p=(i.get(l.batchId)||Ee()).add(c);i=i.insert(l.batchId,p)})}).next(()=>{const o=[],l=i.getReverseIterator();for(;l.hasNext();){const c=l.getNext(),u=c.key,f=c.value,p=R0();f.forEach(g=>{if(!s.has(g)){const S=O0(n.get(g),r.get(g));S!==null&&p.set(g,S),s=s.add(g)}}),o.push(this.documentOverlayCache.saveOverlays(e,u,p))}return U.waitFor(o)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,n,r,i){return function(o){return ne.isDocumentKey(o.path)&&o.collectionGroup===null&&o.filters.length===0}(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):km(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,r,i):this.getDocumentsMatchingCollectionQuery(e,n,r,i)}getNextDocuments(e,n,r,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,r,i).next(s=>{const o=i-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,r.largestBatchId,i-s.size):U.resolve(Yi());let l=Ya,c=s;return o.next(u=>U.forEach(u,(f,p)=>(l<p.largestBatchId&&(l=p.largestBatchId),s.get(f)?U.resolve():this.remoteDocumentCache.getEntry(e,f).next(g=>{c=c.insert(f,g)}))).next(()=>this.populateOverlays(e,u,s)).next(()=>this.computeViews(e,c,u,Ee())).next(f=>({batchId:l,changes:A0(f)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new ne(n)).next(r=>{let i=ca();return r.isFoundDocument()&&(i=i.insert(r.key,r)),i})}getDocumentsMatchingCollectionGroupQuery(e,n,r,i){const s=n.collectionGroup;let o=ca();return this.indexManager.getCollectionParents(e,s).next(l=>U.forEach(l,c=>{const u=function(p,g){return new Li(g,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(n,c.child(s));return this.getDocumentsMatchingCollectionQuery(e,u,r,i).next(f=>{f.forEach((p,g)=>{o=o.insert(p,g)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,n,r,i){let s;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,r.largestBatchId).next(o=>(s=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,r,s,i))).next(o=>{s.forEach((c,u)=>{const f=u.getKey();o.get(f)===null&&(o=o.insert(f,Lt.newInvalidDocument(f)))});let l=ca();return o.forEach((c,u)=>{const f=s.get(c);f!==void 0&&Aa(f.mutation,u,un.empty(),Oe.now()),od(n,u)&&(l=l.insert(c,u))}),l})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class c2{constructor(e){this.serializer=e,this.Lr=new Map,this.kr=new Map}getBundleMetadata(e,n){return U.resolve(this.Lr.get(n))}saveBundleMetadata(e,n){return this.Lr.set(n.id,function(i){return{id:i.id,version:i.version,createTime:ar(i.createTime)}}(n)),U.resolve()}getNamedQuery(e,n){return U.resolve(this.kr.get(n))}saveNamedQuery(e,n){return this.kr.set(n.name,function(i){return{name:i.name,query:JD(i.bundledQuery),readTime:ar(i.readTime)}}(n)),U.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class u2{constructor(){this.overlays=new Je(ne.comparator),this.qr=new Map}getOverlay(e,n){return U.resolve(this.overlays.get(n))}getOverlays(e,n){const r=Yi();return U.forEach(n,i=>this.getOverlay(e,i).next(s=>{s!==null&&r.set(i,s)})).next(()=>r)}saveOverlays(e,n,r){return r.forEach((i,s)=>{this.St(e,n,s)}),U.resolve()}removeOverlaysForBatchId(e,n,r){const i=this.qr.get(r);return i!==void 0&&(i.forEach(s=>this.overlays=this.overlays.remove(s)),this.qr.delete(r)),U.resolve()}getOverlaysForCollection(e,n,r){const i=Yi(),s=n.length+1,o=new ne(n.child("")),l=this.overlays.getIteratorFrom(o);for(;l.hasNext();){const c=l.getNext().value,u=c.getKey();if(!n.isPrefixOf(u.path))break;u.path.length===s&&c.largestBatchId>r&&i.set(c.getKey(),c)}return U.resolve(i)}getOverlaysForCollectionGroup(e,n,r,i){let s=new Je((u,f)=>u-f);const o=this.overlays.getIterator();for(;o.hasNext();){const u=o.getNext().value;if(u.getKey().getCollectionGroup()===n&&u.largestBatchId>r){let f=s.get(u.largestBatchId);f===null&&(f=Yi(),s=s.insert(u.largestBatchId,f)),f.set(u.getKey(),u)}}const l=Yi(),c=s.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach((u,f)=>l.set(u,f)),!(l.size()>=i)););return U.resolve(l)}St(e,n,r){const i=this.overlays.get(r.key);if(i!==null){const o=this.qr.get(i.largestBatchId).delete(r.key);this.qr.set(i.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new RD(n,r));let s=this.qr.get(n);s===void 0&&(s=Ee(),this.qr.set(n,s)),this.qr.set(n,s.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class d2{constructor(){this.sessionToken=Rt.EMPTY_BYTE_STRING}getSessionToken(e){return U.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,U.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vm{constructor(){this.Qr=new gt(vt.$r),this.Ur=new gt(vt.Kr)}isEmpty(){return this.Qr.isEmpty()}addReference(e,n){const r=new vt(e,n);this.Qr=this.Qr.add(r),this.Ur=this.Ur.add(r)}Wr(e,n){e.forEach(r=>this.addReference(r,n))}removeReference(e,n){this.Gr(new vt(e,n))}zr(e,n){e.forEach(r=>this.removeReference(r,n))}jr(e){const n=new ne(new Me([])),r=new vt(n,e),i=new vt(n,e+1),s=[];return this.Ur.forEachInRange([r,i],o=>{this.Gr(o),s.push(o.key)}),s}Jr(){this.Qr.forEach(e=>this.Gr(e))}Gr(e){this.Qr=this.Qr.delete(e),this.Ur=this.Ur.delete(e)}Hr(e){const n=new ne(new Me([])),r=new vt(n,e),i=new vt(n,e+1);let s=Ee();return this.Ur.forEachInRange([r,i],o=>{s=s.add(o.key)}),s}containsKey(e){const n=new vt(e,0),r=this.Qr.firstAfterOrEqual(n);return r!==null&&e.isEqual(r.key)}}class vt{constructor(e,n){this.key=e,this.Yr=n}static $r(e,n){return ne.comparator(e.key,n.key)||we(e.Yr,n.Yr)}static Kr(e,n){return we(e.Yr,n.Yr)||ne.comparator(e.key,n.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class h2{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.tr=1,this.Zr=new gt(vt.$r)}checkEmpty(e){return U.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,r,i){const s=this.tr;this.tr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new AD(s,n,r,i);this.mutationQueue.push(o);for(const l of i)this.Zr=this.Zr.add(new vt(l.key,s)),this.indexManager.addToCollectionParentIndex(e,l.key.path.popLast());return U.resolve(o)}lookupMutationBatch(e,n){return U.resolve(this.Xr(n))}getNextMutationBatchAfterBatchId(e,n){const r=n+1,i=this.ei(r),s=i<0?0:i;return U.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return U.resolve(this.mutationQueue.length===0?Am:this.tr-1)}getAllMutationBatches(e){return U.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){const r=new vt(n,0),i=new vt(n,Number.POSITIVE_INFINITY),s=[];return this.Zr.forEachInRange([r,i],o=>{const l=this.Xr(o.Yr);s.push(l)}),U.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,n){let r=new gt(we);return n.forEach(i=>{const s=new vt(i,0),o=new vt(i,Number.POSITIVE_INFINITY);this.Zr.forEachInRange([s,o],l=>{r=r.add(l.Yr)})}),U.resolve(this.ti(r))}getAllMutationBatchesAffectingQuery(e,n){const r=n.path,i=r.length+1;let s=r;ne.isDocumentKey(s)||(s=s.child(""));const o=new vt(new ne(s),0);let l=new gt(we);return this.Zr.forEachWhile(c=>{const u=c.key.path;return!!r.isPrefixOf(u)&&(u.length===i&&(l=l.add(c.Yr)),!0)},o),U.resolve(this.ti(l))}ti(e){const n=[];return e.forEach(r=>{const i=this.Xr(r);i!==null&&n.push(i)}),n}removeMutationBatch(e,n){Pe(this.ni(n.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.Zr;return U.forEach(n.mutations,i=>{const s=new vt(i.key,n.batchId);return r=r.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)}).next(()=>{this.Zr=r})}ir(e){}containsKey(e,n){const r=new vt(n,0),i=this.Zr.firstAfterOrEqual(r);return U.resolve(n.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,U.resolve()}ni(e,n){return this.ei(e)}ei(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Xr(e){const n=this.ei(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class f2{constructor(e){this.ri=e,this.docs=function(){return new Je(ne.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){const r=n.key,i=this.docs.get(r),s=i?i.size:0,o=this.ri(n);return this.docs=this.docs.insert(r,{document:n.mutableCopy(),size:o}),this.size+=o-s,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){const r=this.docs.get(n);return U.resolve(r?r.document.mutableCopy():Lt.newInvalidDocument(n))}getEntries(e,n){let r=Dr();return n.forEach(i=>{const s=this.docs.get(i);r=r.insert(i,s?s.document.mutableCopy():Lt.newInvalidDocument(i))}),U.resolve(r)}getDocumentsMatchingQuery(e,n,r,i){let s=Dr();const o=n.path,l=new ne(o.child("__id-9223372036854775808__")),c=this.docs.getIteratorFrom(l);for(;c.hasNext();){const{key:u,value:{document:f}}=c.getNext();if(!o.isPrefixOf(u.path))break;u.path.length>o.length+1||Ub(Fb(f),r)<=0||(i.has(f.key)||od(n,f))&&(s=s.insert(f.key,f.mutableCopy()))}return U.resolve(s)}getAllFromCollectionGroup(e,n,r,i){le(9500)}ii(e,n){return U.forEach(this.docs,r=>n(r))}newChangeBuffer(e){return new p2(this)}getSize(e){return U.resolve(this.size)}}class p2 extends o2{constructor(e){super(),this.Nr=e}applyChanges(e){const n=[];return this.changes.forEach((r,i)=>{i.isValidDocument()?n.push(this.Nr.addEntry(e,i)):this.Nr.removeEntry(r)}),U.waitFor(n)}getFromCache(e,n){return this.Nr.getEntry(e,n)}getAllFromCache(e,n){return this.Nr.getEntries(e,n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class m2{constructor(e){this.persistence=e,this.si=new ws(n=>xm(n),Pm),this.lastRemoteSnapshotVersion=de.min(),this.highestTargetId=0,this.oi=0,this._i=new Vm,this.targetCount=0,this.ai=_o.ur()}forEachTarget(e,n){return this.si.forEach((r,i)=>n(i)),U.resolve()}getLastRemoteSnapshotVersion(e){return U.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return U.resolve(this.oi)}allocateTargetId(e){return this.highestTargetId=this.ai.next(),U.resolve(this.highestTargetId)}setTargetsMetadata(e,n,r){return r&&(this.lastRemoteSnapshotVersion=r),n>this.oi&&(this.oi=n),U.resolve()}Pr(e){this.si.set(e.target,e);const n=e.targetId;n>this.highestTargetId&&(this.ai=new _o(n),this.highestTargetId=n),e.sequenceNumber>this.oi&&(this.oi=e.sequenceNumber)}addTargetData(e,n){return this.Pr(n),this.targetCount+=1,U.resolve()}updateTargetData(e,n){return this.Pr(n),U.resolve()}removeTargetData(e,n){return this.si.delete(n.target),this._i.jr(n.targetId),this.targetCount-=1,U.resolve()}removeTargets(e,n,r){let i=0;const s=[];return this.si.forEach((o,l)=>{l.sequenceNumber<=n&&r.get(l.targetId)===null&&(this.si.delete(o),s.push(this.removeMatchingKeysForTargetId(e,l.targetId)),i++)}),U.waitFor(s).next(()=>i)}getTargetCount(e){return U.resolve(this.targetCount)}getTargetData(e,n){const r=this.si.get(n)||null;return U.resolve(r)}addMatchingKeys(e,n,r){return this._i.Wr(n,r),U.resolve()}removeMatchingKeys(e,n,r){this._i.zr(n,r);const i=this.persistence.referenceDelegate,s=[];return i&&n.forEach(o=>{s.push(i.markPotentiallyOrphaned(e,o))}),U.waitFor(s)}removeMatchingKeysForTargetId(e,n){return this._i.jr(n),U.resolve()}getMatchingKeysForTargetId(e,n){const r=this._i.Hr(n);return U.resolve(r)}containsKey(e,n){return U.resolve(this._i.containsKey(n))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class K0{constructor(e,n){this.ui={},this.overlays={},this.ci=new ed(0),this.li=!1,this.li=!0,this.hi=new d2,this.referenceDelegate=e(this),this.Pi=new m2(this),this.indexManager=new ZD,this.remoteDocumentCache=function(i){return new f2(i)}(r=>this.referenceDelegate.Ti(r)),this.serializer=new XD(n),this.Ii=new c2(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.li=!1,Promise.resolve()}get started(){return this.li}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new u2,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let r=this.ui[e.toKey()];return r||(r=new h2(n,this.referenceDelegate),this.ui[e.toKey()]=r),r}getGlobalsCache(){return this.hi}getTargetCache(){return this.Pi}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ii}runTransaction(e,n,r){Z("MemoryPersistence","Starting transaction:",e);const i=new g2(this.ci.next());return this.referenceDelegate.Ei(),r(i).next(s=>this.referenceDelegate.di(i).next(()=>s)).toPromise().then(s=>(i.raiseOnCommittedEvent(),s))}Ai(e,n){return U.or(Object.values(this.ui).map(r=>()=>r.containsKey(e,n)))}}class g2 extends Bb{constructor(e){super(),this.currentSequenceNumber=e}}class jm{constructor(e){this.persistence=e,this.Ri=new Vm,this.Vi=null}static mi(e){return new jm(e)}get fi(){if(this.Vi)return this.Vi;throw le(60996)}addReference(e,n,r){return this.Ri.addReference(r,n),this.fi.delete(r.toString()),U.resolve()}removeReference(e,n,r){return this.Ri.removeReference(r,n),this.fi.add(r.toString()),U.resolve()}markPotentiallyOrphaned(e,n){return this.fi.add(n.toString()),U.resolve()}removeTarget(e,n){this.Ri.jr(n.targetId).forEach(i=>this.fi.add(i.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,n.targetId).next(i=>{i.forEach(s=>this.fi.add(s.toString()))}).next(()=>r.removeTargetData(e,n))}Ei(){this.Vi=new Set}di(e){const n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return U.forEach(this.fi,r=>{const i=ne.fromPath(r);return this.gi(e,i).next(s=>{s||n.removeEntry(i,de.min())})}).next(()=>(this.Vi=null,n.apply(e)))}updateLimboDocument(e,n){return this.gi(e,n).next(r=>{r?this.fi.delete(n.toString()):this.fi.add(n.toString())})}Ti(e){return 0}gi(e,n){return U.or([()=>U.resolve(this.Ri.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Ai(e,n)])}}class _u{constructor(e,n){this.persistence=e,this.pi=new ws(r=>Hb(r.path),(r,i)=>r.isEqual(i)),this.garbageCollector=s2(this,n)}static mi(e,n){return new _u(e,n)}Ei(){}di(e){return U.resolve()}forEachTarget(e,n){return this.persistence.getTargetCache().forEachTarget(e,n)}gr(e){const n=this.wr(e);return this.persistence.getTargetCache().getTargetCount(e).next(r=>n.next(i=>r+i))}wr(e){let n=0;return this.pr(e,r=>{n++}).next(()=>n)}pr(e,n){return U.forEach(this.pi,(r,i)=>this.br(e,r,i).next(s=>s?U.resolve():n(i)))}removeTargets(e,n,r){return this.persistence.getTargetCache().removeTargets(e,n,r)}removeOrphanedDocuments(e,n){let r=0;const i=this.persistence.getRemoteDocumentCache(),s=i.newChangeBuffer();return i.ii(e,o=>this.br(e,o,n).next(l=>{l||(r++,s.removeEntry(o,de.min()))})).next(()=>s.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,n){return this.pi.set(n,e.currentSequenceNumber),U.resolve()}removeTarget(e,n){const r=n.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,n,r){return this.pi.set(r,e.currentSequenceNumber),U.resolve()}removeReference(e,n,r){return this.pi.set(r,e.currentSequenceNumber),U.resolve()}updateLimboDocument(e,n){return this.pi.set(n,e.currentSequenceNumber),U.resolve()}Ti(e){let n=e.key.toString().length;return e.isFoundDocument()&&(n+=xc(e.data.value)),n}br(e,n,r){return U.or([()=>this.persistence.Ai(e,n),()=>this.persistence.getTargetCache().containsKey(e,n),()=>{const i=this.pi.get(n);return U.resolve(i!==void 0&&i>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mm{constructor(e,n,r,i){this.targetId=e,this.fromCache=n,this.Es=r,this.ds=i}static As(e,n){let r=Ee(),i=Ee();for(const s of n.docChanges)switch(s.type){case 0:r=r.add(s.doc.key);break;case 1:i=i.add(s.doc.key)}return new Mm(e,n.fromCache,r,i)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class y2{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class v2{constructor(){this.Rs=!1,this.Vs=!1,this.fs=100,this.gs=function(){return H1()?8:zb(jt())>0?6:4}()}initialize(e,n){this.ps=e,this.indexManager=n,this.Rs=!0}getDocumentsMatchingQuery(e,n,r,i){const s={result:null};return this.ys(e,n).next(o=>{s.result=o}).next(()=>{if(!s.result)return this.ws(e,n,i,r).next(o=>{s.result=o})}).next(()=>{if(s.result)return;const o=new y2;return this.Ss(e,n,o).next(l=>{if(s.result=l,this.Vs)return this.bs(e,n,o,l.size)})}).next(()=>s.result)}bs(e,n,r,i){return r.documentReadCount<this.fs?(Ps()<=_e.DEBUG&&Z("QueryEngine","SDK will not create cache indexes for query:",ks(n),"since it only creates cache indexes for collection contains","more than or equal to",this.fs,"documents"),U.resolve()):(Ps()<=_e.DEBUG&&Z("QueryEngine","Query:",ks(n),"scans",r.documentReadCount,"local documents and returns",i,"documents as results."),r.documentReadCount>this.gs*i?(Ps()<=_e.DEBUG&&Z("QueryEngine","The SDK decides to create cache indexes for query:",ks(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,or(n))):U.resolve())}ys(e,n){if(E_(n))return U.resolve(null);let r=or(n);return this.indexManager.getIndexType(e,r).next(i=>i===0?null:(n.limit!==null&&i===1&&(n=gu(n,null,"F"),r=or(n)),this.indexManager.getDocumentsMatchingTarget(e,r).next(s=>{const o=Ee(...s);return this.ps.getDocuments(e,o).next(l=>this.indexManager.getMinOffset(e,r).next(c=>{const u=this.Ds(n,l);return this.Cs(n,u,o,c.readTime)?this.ys(e,gu(n,null,"F")):this.vs(e,u,n,c)}))})))}ws(e,n,r,i){return E_(n)||i.isEqual(de.min())?U.resolve(null):this.ps.getDocuments(e,r).next(s=>{const o=this.Ds(n,s);return this.Cs(n,o,r,i)?U.resolve(null):(Ps()<=_e.DEBUG&&Z("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),ks(n)),this.vs(e,o,n,Mb(i,Ya)).next(l=>l))})}Ds(e,n){let r=new gt(S0(e));return n.forEach((i,s)=>{od(e,s)&&(r=r.add(s))}),r}Cs(e,n,r,i){if(e.limit===null)return!1;if(r.size!==n.size)return!0;const s=e.limitType==="F"?n.last():n.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(i)>0)}Ss(e,n,r){return Ps()<=_e.DEBUG&&Z("QueryEngine","Using full collection scan to execute query:",ks(n)),this.ps.getDocumentsMatchingQuery(e,n,Ei.min(),r)}vs(e,n,r,i){return this.ps.getDocumentsMatchingQuery(e,r,i).next(s=>(n.forEach(o=>{s=s.insert(o.key,o)}),s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fm="LocalStore",_2=3e8;class w2{constructor(e,n,r,i){this.persistence=e,this.Fs=n,this.serializer=i,this.Ms=new Je(we),this.xs=new ws(s=>xm(s),Pm),this.Os=new Map,this.Ns=e.getRemoteDocumentCache(),this.Pi=e.getTargetCache(),this.Ii=e.getBundleCache(),this.Bs(r)}Bs(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new l2(this.Ns,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Ns.setIndexManager(this.indexManager),this.Fs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.Ms))}}function E2(t,e,n,r){return new w2(t,e,n,r)}async function Q0(t,e){const n=ue(t);return await n.persistence.runTransaction("Handle user change","readonly",r=>{let i;return n.mutationQueue.getAllMutationBatches(r).next(s=>(i=s,n.Bs(e),n.mutationQueue.getAllMutationBatches(r))).next(s=>{const o=[],l=[];let c=Ee();for(const u of i){o.push(u.batchId);for(const f of u.mutations)c=c.add(f.key)}for(const u of s){l.push(u.batchId);for(const f of u.mutations)c=c.add(f.key)}return n.localDocuments.getDocuments(r,c).next(u=>({Ls:u,removedBatchIds:o,addedBatchIds:l}))})})}function T2(t,e){const n=ue(t);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const i=e.batch.keys(),s=n.Ns.newChangeBuffer({trackRemovals:!0});return function(l,c,u,f){const p=u.batch,g=p.keys();let S=U.resolve();return g.forEach(v=>{S=S.next(()=>f.getEntry(c,v)).next(N=>{const b=u.docVersions.get(v);Pe(b!==null,48541),N.version.compareTo(b)<0&&(p.applyToRemoteDocument(N,u),N.isValidDocument()&&(N.setReadTime(u.commitVersion),f.addEntry(N)))})}),S.next(()=>l.mutationQueue.removeMutationBatch(c,p))}(n,r,e,s).next(()=>s.apply(r)).next(()=>n.mutationQueue.performConsistencyCheck(r)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(r,i,e.batch.batchId)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(l){let c=Ee();for(let u=0;u<l.mutationResults.length;++u)l.mutationResults[u].transformResults.length>0&&(c=c.add(l.batch.mutations[u].key));return c}(e))).next(()=>n.localDocuments.getDocuments(r,i))})}function Y0(t){const e=ue(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.Pi.getLastRemoteSnapshotVersion(n))}function I2(t,e){const n=ue(t),r=e.snapshotVersion;let i=n.Ms;return n.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{const o=n.Ns.newChangeBuffer({trackRemovals:!0});i=n.Ms;const l=[];e.targetChanges.forEach((f,p)=>{const g=i.get(p);if(!g)return;l.push(n.Pi.removeMatchingKeys(s,f.removedDocuments,p).next(()=>n.Pi.addMatchingKeys(s,f.addedDocuments,p)));let S=g.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(p)!==null?S=S.withResumeToken(Rt.EMPTY_BYTE_STRING,de.min()).withLastLimboFreeSnapshotVersion(de.min()):f.resumeToken.approximateByteSize()>0&&(S=S.withResumeToken(f.resumeToken,r)),i=i.insert(p,S),function(N,b,I){return N.resumeToken.approximateByteSize()===0||b.snapshotVersion.toMicroseconds()-N.snapshotVersion.toMicroseconds()>=_2?!0:I.addedDocuments.size+I.modifiedDocuments.size+I.removedDocuments.size>0}(g,S,f)&&l.push(n.Pi.updateTargetData(s,S))});let c=Dr(),u=Ee();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&l.push(n.persistence.referenceDelegate.updateLimboDocument(s,f))}),l.push(S2(s,o,e.documentUpdates).next(f=>{c=f.ks,u=f.qs})),!r.isEqual(de.min())){const f=n.Pi.getLastRemoteSnapshotVersion(s).next(p=>n.Pi.setTargetsMetadata(s,s.currentSequenceNumber,r));l.push(f)}return U.waitFor(l).next(()=>o.apply(s)).next(()=>n.localDocuments.getLocalViewOfDocuments(s,c,u)).next(()=>c)}).then(s=>(n.Ms=i,s))}function S2(t,e,n){let r=Ee(),i=Ee();return n.forEach(s=>r=r.add(s)),e.getEntries(t,r).next(s=>{let o=Dr();return n.forEach((l,c)=>{const u=s.get(l);c.isFoundDocument()!==u.isFoundDocument()&&(i=i.add(l)),c.isNoDocument()&&c.version.isEqual(de.min())?(e.removeEntry(l,c.readTime),o=o.insert(l,c)):!u.isValidDocument()||c.version.compareTo(u.version)>0||c.version.compareTo(u.version)===0&&u.hasPendingWrites?(e.addEntry(c),o=o.insert(l,c)):Z(Fm,"Ignoring outdated watch update for ",l,". Current version:",u.version," Watch version:",c.version)}),{ks:o,qs:i}})}function C2(t,e){const n=ue(t);return n.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=Am),n.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function A2(t,e){const n=ue(t);return n.persistence.runTransaction("Allocate target","readwrite",r=>{let i;return n.Pi.getTargetData(r,e).next(s=>s?(i=s,U.resolve(i)):n.Pi.allocateTargetId(r).next(o=>(i=new ii(e,o,"TargetPurposeListen",r.currentSequenceNumber),n.Pi.addTargetData(r,i).next(()=>i))))}).then(r=>{const i=n.Ms.get(r.targetId);return(i===null||r.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(n.Ms=n.Ms.insert(r.targetId,r),n.xs.set(e,r.targetId)),r})}async function ep(t,e,n){const r=ue(t),i=r.Ms.get(e),s=n?"readwrite":"readwrite-primary";try{n||await r.persistence.runTransaction("Release target",s,o=>r.persistence.referenceDelegate.removeTarget(o,i))}catch(o){if(!ko(o))throw o;Z(Fm,`Failed to update sequence numbers for target ${e}: ${o}`)}r.Ms=r.Ms.remove(e),r.xs.delete(i.target)}function O_(t,e,n){const r=ue(t);let i=de.min(),s=Ee();return r.persistence.runTransaction("Execute query","readwrite",o=>function(c,u,f){const p=ue(c),g=p.xs.get(f);return g!==void 0?U.resolve(p.Ms.get(g)):p.Pi.getTargetData(u,f)}(r,o,or(e)).next(l=>{if(l)return i=l.lastLimboFreeSnapshotVersion,r.Pi.getMatchingKeysForTargetId(o,l.targetId).next(c=>{s=c})}).next(()=>r.Fs.getDocumentsMatchingQuery(o,e,n?i:de.min(),n?s:Ee())).next(l=>(R2(r,dD(e),l),{documents:l,Qs:s})))}function R2(t,e,n){let r=t.Os.get(e)||de.min();n.forEach((i,s)=>{s.readTime.compareTo(r)>0&&(r=s.readTime)}),t.Os.set(e,r)}class L_{constructor(){this.activeTargetIds=yD()}zs(e){this.activeTargetIds=this.activeTargetIds.add(e)}js(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Gs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class x2{constructor(){this.Mo=new L_,this.xo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,r){}addLocalQueryTarget(e,n=!0){return n&&this.Mo.zs(e),this.xo[e]||"not-current"}updateQueryState(e,n,r){this.xo[e]=n}removeLocalQueryTarget(e){this.Mo.js(e)}isLocalQueryTarget(e){return this.Mo.activeTargetIds.has(e)}clearQueryState(e){delete this.xo[e]}getAllActiveQueryTargets(){return this.Mo.activeTargetIds}isActiveQueryTarget(e){return this.Mo.activeTargetIds.has(e)}start(){return this.Mo=new L_,Promise.resolve()}handleUserChange(e,n,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class P2{Oo(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const V_="ConnectivityMonitor";class j_{constructor(){this.No=()=>this.Bo(),this.Lo=()=>this.ko(),this.qo=[],this.Qo()}Oo(e){this.qo.push(e)}shutdown(){window.removeEventListener("online",this.No),window.removeEventListener("offline",this.Lo)}Qo(){window.addEventListener("online",this.No),window.addEventListener("offline",this.Lo)}Bo(){Z(V_,"Network connectivity changed: AVAILABLE");for(const e of this.qo)e(0)}ko(){Z(V_,"Network connectivity changed: UNAVAILABLE");for(const e of this.qo)e(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ic=null;function tp(){return ic===null?ic=function(){return 268435456+Math.round(2147483648*Math.random())}():ic++,"0x"+ic.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sh="RestConnection",k2={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class N2{get $o(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const n=e.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Uo=n+"://"+e.host,this.Ko=`projects/${r}/databases/${i}`,this.Wo=this.databaseId.database===fu?`project_id=${r}`:`project_id=${r}&database_id=${i}`}Go(e,n,r,i,s){const o=tp(),l=this.zo(e,n.toUriEncodedString());Z(Sh,`Sending RPC '${e}' ${o}:`,l,r);const c={"google-cloud-resource-prefix":this.Ko,"x-goog-request-params":this.Wo};this.jo(c,i,s);const{host:u}=new URL(l),f=Ni(u);return this.Jo(e,l,c,r,f).then(p=>(Z(Sh,`Received RPC '${e}' ${o}: `,p),p),p=>{throw fo(Sh,`RPC '${e}' ${o} failed with error: `,p,"url: ",l,"request:",r),p})}Ho(e,n,r,i,s,o){return this.Go(e,n,r,i,s)}jo(e,n,r){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+xo}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((i,s)=>e[s]=i),r&&r.headers.forEach((i,s)=>e[s]=i)}zo(e,n){const r=k2[e];return`${this.Uo}/v1/${n}:${r}`}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class b2{constructor(e){this.Yo=e.Yo,this.Zo=e.Zo}Xo(e){this.e_=e}t_(e){this.n_=e}r_(e){this.i_=e}onMessage(e){this.s_=e}close(){this.Zo()}send(e){this.Yo(e)}o_(){this.e_()}__(){this.n_()}a_(e){this.i_(e)}u_(e){this.s_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nt="WebChannelConnection";class D2 extends N2{constructor(e){super(e),this.c_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}Jo(e,n,r,i,s){const o=tp();return new Promise((l,c)=>{const u=new XI;u.setWithCredentials(!0),u.listenOnce(JI.COMPLETE,()=>{try{switch(u.getLastErrorCode()){case Rc.NO_ERROR:const p=u.getResponseJson();Z(Nt,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(p)),l(p);break;case Rc.TIMEOUT:Z(Nt,`RPC '${e}' ${o} timed out`),c(new G(M.DEADLINE_EXCEEDED,"Request time out"));break;case Rc.HTTP_ERROR:const g=u.getStatus();if(Z(Nt,`RPC '${e}' ${o} failed with status:`,g,"response text:",u.getResponseText()),g>0){let S=u.getResponseJson();Array.isArray(S)&&(S=S[0]);const v=S==null?void 0:S.error;if(v&&v.status&&v.message){const N=function(I){const E=I.toLowerCase().replace(/_/g,"-");return Object.values(M).indexOf(E)>=0?E:M.UNKNOWN}(v.status);c(new G(N,v.message))}else c(new G(M.UNKNOWN,"Server responded with status "+u.getStatus()))}else c(new G(M.UNAVAILABLE,"Connection failed."));break;default:le(9055,{l_:e,streamId:o,h_:u.getLastErrorCode(),P_:u.getLastError()})}}finally{Z(Nt,`RPC '${e}' ${o} completed.`)}});const f=JSON.stringify(i);Z(Nt,`RPC '${e}' ${o} sending request:`,i),u.send(n,"POST",f,r,15)})}T_(e,n,r){const i=tp(),s=[this.Uo,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=t0(),l=e0(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;u!==void 0&&(c.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(c.useFetchStreams=!0),this.jo(c.initMessageHeaders,n,r),c.encodeInitMessageHeaders=!0;const f=s.join("");Z(Nt,`Creating RPC '${e}' stream ${i}: ${f}`,c);const p=o.createWebChannel(f,c);this.I_(p);let g=!1,S=!1;const v=new b2({Yo:b=>{S?Z(Nt,`Not sending because RPC '${e}' stream ${i} is closed:`,b):(g||(Z(Nt,`Opening RPC '${e}' stream ${i} transport.`),p.open(),g=!0),Z(Nt,`RPC '${e}' stream ${i} sending:`,b),p.send(b))},Zo:()=>p.close()}),N=(b,I,E)=>{b.listen(I,y=>{try{E(y)}catch(L){setTimeout(()=>{throw L},0)}})};return N(p,la.EventType.OPEN,()=>{S||(Z(Nt,`RPC '${e}' stream ${i} transport opened.`),v.o_())}),N(p,la.EventType.CLOSE,()=>{S||(S=!0,Z(Nt,`RPC '${e}' stream ${i} transport closed`),v.a_(),this.E_(p))}),N(p,la.EventType.ERROR,b=>{S||(S=!0,fo(Nt,`RPC '${e}' stream ${i} transport errored. Name:`,b.name,"Message:",b.message),v.a_(new G(M.UNAVAILABLE,"The operation could not be completed")))}),N(p,la.EventType.MESSAGE,b=>{var I;if(!S){const E=b.data[0];Pe(!!E,16349);const y=E,L=(y==null?void 0:y.error)||((I=y[0])==null?void 0:I.error);if(L){Z(Nt,`RPC '${e}' stream ${i} received error:`,L);const $=L.status;let B=function(A){const x=lt[A];if(x!==void 0)return V0(x)}($),C=L.message;B===void 0&&(B=M.INTERNAL,C="Unknown error status: "+$+" with message "+L.message),S=!0,v.a_(new G(B,C)),p.close()}else Z(Nt,`RPC '${e}' stream ${i} received:`,E),v.u_(E)}}),N(l,ZI.STAT_EVENT,b=>{b.stat===zf.PROXY?Z(Nt,`RPC '${e}' stream ${i} detected buffering proxy`):b.stat===zf.NOPROXY&&Z(Nt,`RPC '${e}' stream ${i} detected no buffering proxy`)}),setTimeout(()=>{v.__()},0),v}terminate(){this.c_.forEach(e=>e.close()),this.c_=[]}I_(e){this.c_.push(e)}E_(e){this.c_=this.c_.filter(n=>n===e)}}function Ch(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ud(t){return new jD(t,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class X0{constructor(e,n,r=1e3,i=1.5,s=6e4){this.Mi=e,this.timerId=n,this.d_=r,this.A_=i,this.R_=s,this.V_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.V_=0}g_(){this.V_=this.R_}p_(e){this.cancel();const n=Math.floor(this.V_+this.y_()),r=Math.max(0,Date.now()-this.f_),i=Math.max(0,n-r);i>0&&Z("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.V_} ms, delay with jitter: ${n} ms, last attempt: ${r} ms ago)`),this.m_=this.Mi.enqueueAfterDelay(this.timerId,i,()=>(this.f_=Date.now(),e())),this.V_*=this.A_,this.V_<this.d_&&(this.V_=this.d_),this.V_>this.R_&&(this.V_=this.R_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.V_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const M_="PersistentStream";class J0{constructor(e,n,r,i,s,o,l,c){this.Mi=e,this.S_=r,this.b_=i,this.connection=s,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=l,this.listener=c,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new X0(e,n)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Mi.enqueueAfterDelay(this.S_,6e4,()=>this.k_()))}q_(e){this.Q_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}Q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,n){this.Q_(),this.U_(),this.M_.cancel(),this.D_++,e!==4?this.M_.reset():n&&n.code===M.RESOURCE_EXHAUSTED?(br(n.toString()),br("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):n&&n.code===M.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.K_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.r_(n)}K_(){}auth(){this.state=1;const e=this.W_(this.D_),n=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,i])=>{this.D_===n&&this.G_(r,i)},r=>{e(()=>{const i=new G(M.UNKNOWN,"Fetching auth token failed: "+r.message);return this.z_(i)})})}G_(e,n){const r=this.W_(this.D_);this.stream=this.j_(e,n),this.stream.Xo(()=>{r(()=>this.listener.Xo())}),this.stream.t_(()=>{r(()=>(this.state=2,this.v_=this.Mi.enqueueAfterDelay(this.b_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.t_()))}),this.stream.r_(i=>{r(()=>this.z_(i))}),this.stream.onMessage(i=>{r(()=>++this.F_==1?this.J_(i):this.onNext(i))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(e){return Z(M_,`close with error: ${e}`),this.stream=null,this.close(4,e)}W_(e){return n=>{this.Mi.enqueueAndForget(()=>this.D_===e?n():(Z(M_,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class O2 extends J0{constructor(e,n,r,i,s,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,r,i,o),this.serializer=s}j_(e,n){return this.connection.T_("Listen",e,n)}J_(e){return this.onNext(e)}onNext(e){this.M_.reset();const n=UD(this.serializer,e),r=function(s){if(!("targetChange"in s))return de.min();const o=s.targetChange;return o.targetIds&&o.targetIds.length?de.min():o.readTime?ar(o.readTime):de.min()}(e);return this.listener.H_(n,r)}Y_(e){const n={};n.database=Zf(this.serializer),n.addTarget=function(s,o){let l;const c=o.target;if(l=Kf(c)?{documents:zD(s,c)}:{query:z0(s,c).ft},l.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){l.resumeToken=F0(s,o.resumeToken);const u=Yf(s,o.expectedCount);u!==null&&(l.expectedCount=u)}else if(o.snapshotVersion.compareTo(de.min())>0){l.readTime=vu(s,o.snapshotVersion.toTimestamp());const u=Yf(s,o.expectedCount);u!==null&&(l.expectedCount=u)}return l}(this.serializer,e);const r=WD(this.serializer,e);r&&(n.labels=r),this.q_(n)}Z_(e){const n={};n.database=Zf(this.serializer),n.removeTarget=e,this.q_(n)}}class L2 extends J0{constructor(e,n,r,i,s,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",n,r,i,o),this.serializer=s}get X_(){return this.F_>0}start(){this.lastStreamToken=void 0,super.start()}K_(){this.X_&&this.ea([])}j_(e,n){return this.connection.T_("Write",e,n)}J_(e){return Pe(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,Pe(!e.writeResults||e.writeResults.length===0,55816),this.listener.ta()}onNext(e){Pe(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.M_.reset();const n=BD(e.writeResults,e.commitTime),r=ar(e.commitTime);return this.listener.na(r,n)}ra(){const e={};e.database=Zf(this.serializer),this.q_(e)}ea(e){const n={streamToken:this.lastStreamToken,writes:e.map(r=>$D(this.serializer,r))};this.q_(n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class V2{}class j2 extends V2{constructor(e,n,r,i){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=r,this.serializer=i,this.ia=!1}sa(){if(this.ia)throw new G(M.FAILED_PRECONDITION,"The client has already been terminated.")}Go(e,n,r,i){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,o])=>this.connection.Go(e,Xf(n,r),i,s,o)).catch(s=>{throw s.name==="FirebaseError"?(s.code===M.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new G(M.UNKNOWN,s.toString())})}Ho(e,n,r,i,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,l])=>this.connection.Ho(e,Xf(n,r),i,o,l,s)).catch(o=>{throw o.name==="FirebaseError"?(o.code===M.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new G(M.UNKNOWN,o.toString())})}terminate(){this.ia=!0,this.connection.terminate()}}class M2{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(e){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,e==="Online"&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){const n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(br(n),this.aa=!1):Z("OnlineStateTracker",n)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const us="RemoteStore";class F2{constructor(e,n,r,i,s){this.localStore=e,this.datastore=n,this.asyncQueue=r,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.da=[],this.Aa=s,this.Aa.Oo(o=>{r.enqueueAndForget(async()=>{Es(this)&&(Z(us,"Restarting streams for network reachability change."),await async function(c){const u=ue(c);u.Ea.add(4),await yl(u),u.Ra.set("Unknown"),u.Ea.delete(4),await dd(u)}(this))})}),this.Ra=new M2(r,i)}}async function dd(t){if(Es(t))for(const e of t.da)await e(!0)}async function yl(t){for(const e of t.da)await e(!1)}function Z0(t,e){const n=ue(t);n.Ia.has(e.targetId)||(n.Ia.set(e.targetId,e),zm(n)?Bm(n):No(n).O_()&&$m(n,e))}function Um(t,e){const n=ue(t),r=No(n);n.Ia.delete(e),r.O_()&&eS(n,e),n.Ia.size===0&&(r.O_()?r.L_():Es(n)&&n.Ra.set("Unknown"))}function $m(t,e){if(t.Va.Ue(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(de.min())>0){const n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}No(t).Y_(e)}function eS(t,e){t.Va.Ue(e),No(t).Z_(e)}function Bm(t){t.Va=new DD({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),At:e=>t.Ia.get(e)||null,ht:()=>t.datastore.serializer.databaseId}),No(t).start(),t.Ra.ua()}function zm(t){return Es(t)&&!No(t).x_()&&t.Ia.size>0}function Es(t){return ue(t).Ea.size===0}function tS(t){t.Va=void 0}async function U2(t){t.Ra.set("Online")}async function $2(t){t.Ia.forEach((e,n)=>{$m(t,e)})}async function B2(t,e){tS(t),zm(t)?(t.Ra.ha(e),Bm(t)):t.Ra.set("Unknown")}async function z2(t,e,n){if(t.Ra.set("Online"),e instanceof M0&&e.state===2&&e.cause)try{await async function(i,s){const o=s.cause;for(const l of s.targetIds)i.Ia.has(l)&&(await i.remoteSyncer.rejectListen(l,o),i.Ia.delete(l),i.Va.removeTarget(l))}(t,e)}catch(r){Z(us,"Failed to remove targets %s: %s ",e.targetIds.join(","),r),await wu(t,r)}else if(e instanceof Nc?t.Va.Ze(e):e instanceof j0?t.Va.st(e):t.Va.tt(e),!n.isEqual(de.min()))try{const r=await Y0(t.localStore);n.compareTo(r)>=0&&await function(s,o){const l=s.Va.Tt(o);return l.targetChanges.forEach((c,u)=>{if(c.resumeToken.approximateByteSize()>0){const f=s.Ia.get(u);f&&s.Ia.set(u,f.withResumeToken(c.resumeToken,o))}}),l.targetMismatches.forEach((c,u)=>{const f=s.Ia.get(c);if(!f)return;s.Ia.set(c,f.withResumeToken(Rt.EMPTY_BYTE_STRING,f.snapshotVersion)),eS(s,c);const p=new ii(f.target,c,u,f.sequenceNumber);$m(s,p)}),s.remoteSyncer.applyRemoteEvent(l)}(t,n)}catch(r){Z(us,"Failed to raise snapshot:",r),await wu(t,r)}}async function wu(t,e,n){if(!ko(e))throw e;t.Ea.add(1),await yl(t),t.Ra.set("Offline"),n||(n=()=>Y0(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{Z(us,"Retrying IndexedDB access"),await n(),t.Ea.delete(1),await dd(t)})}function nS(t,e){return e().catch(n=>wu(t,n,e))}async function hd(t){const e=ue(t),n=Ci(e);let r=e.Ta.length>0?e.Ta[e.Ta.length-1].batchId:Am;for(;q2(e);)try{const i=await C2(e.localStore,r);if(i===null){e.Ta.length===0&&n.L_();break}r=i.batchId,H2(e,i)}catch(i){await wu(e,i)}rS(e)&&iS(e)}function q2(t){return Es(t)&&t.Ta.length<10}function H2(t,e){t.Ta.push(e);const n=Ci(t);n.O_()&&n.X_&&n.ea(e.mutations)}function rS(t){return Es(t)&&!Ci(t).x_()&&t.Ta.length>0}function iS(t){Ci(t).start()}async function W2(t){Ci(t).ra()}async function G2(t){const e=Ci(t);for(const n of t.Ta)e.ea(n.mutations)}async function K2(t,e,n){const r=t.Ta.shift(),i=Dm.from(r,e,n);await nS(t,()=>t.remoteSyncer.applySuccessfulWrite(i)),await hd(t)}async function Q2(t,e){e&&Ci(t).X_&&await async function(r,i){if(function(o){return kD(o)&&o!==M.ABORTED}(i.code)){const s=r.Ta.shift();Ci(r).B_(),await nS(r,()=>r.remoteSyncer.rejectFailedWrite(s.batchId,i)),await hd(r)}}(t,e),rS(t)&&iS(t)}async function F_(t,e){const n=ue(t);n.asyncQueue.verifyOperationInProgress(),Z(us,"RemoteStore received new credentials");const r=Es(n);n.Ea.add(3),await yl(n),r&&n.Ra.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.Ea.delete(3),await dd(n)}async function Y2(t,e){const n=ue(t);e?(n.Ea.delete(2),await dd(n)):e||(n.Ea.add(2),await yl(n),n.Ra.set("Unknown"))}function No(t){return t.ma||(t.ma=function(n,r,i){const s=ue(n);return s.sa(),new O2(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(t.datastore,t.asyncQueue,{Xo:U2.bind(null,t),t_:$2.bind(null,t),r_:B2.bind(null,t),H_:z2.bind(null,t)}),t.da.push(async e=>{e?(t.ma.B_(),zm(t)?Bm(t):t.Ra.set("Unknown")):(await t.ma.stop(),tS(t))})),t.ma}function Ci(t){return t.fa||(t.fa=function(n,r,i){const s=ue(n);return s.sa(),new L2(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(t.datastore,t.asyncQueue,{Xo:()=>Promise.resolve(),t_:W2.bind(null,t),r_:Q2.bind(null,t),ta:G2.bind(null,t),na:K2.bind(null,t)}),t.da.push(async e=>{e?(t.fa.B_(),await hd(t)):(await t.fa.stop(),t.Ta.length>0&&(Z(us,`Stopping write stream with ${t.Ta.length} pending writes`),t.Ta=[]))})),t.fa}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qm{constructor(e,n,r,i,s){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=r,this.op=i,this.removalCallback=s,this.deferred=new sr,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,r,i,s){const o=Date.now()+r,l=new qm(e,n,o,i,s);return l.start(r),l}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new G(M.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Hm(t,e){if(br("AsyncQueue",`${e}: ${t}`),ko(t))return new G(M.UNAVAILABLE,`${e}: ${t}`);throw t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class to{static emptySet(e){return new to(e.comparator)}constructor(e){this.comparator=e?(n,r)=>e(n,r)||ne.comparator(n.key,r.key):(n,r)=>ne.comparator(n.key,r.key),this.keyedMap=ca(),this.sortedSet=new Je(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,r)=>(e(n),!1))}add(e){const n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){const n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof to)||this.size!==e.size)return!1;const n=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;n.hasNext();){const i=n.getNext().key,s=r.getNext().key;if(!i.isEqual(s))return!1}return!0}toString(){const e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,n){const r=new to;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=n,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class U_{constructor(){this.ga=new Je(ne.comparator)}track(e){const n=e.doc.key,r=this.ga.get(n);r?e.type!==0&&r.type===3?this.ga=this.ga.insert(n,e):e.type===3&&r.type!==1?this.ga=this.ga.insert(n,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.ga=this.ga.insert(n,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.ga=this.ga.insert(n,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.ga=this.ga.remove(n):e.type===1&&r.type===2?this.ga=this.ga.insert(n,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.ga=this.ga.insert(n,{type:2,doc:e.doc}):le(63341,{Rt:e,pa:r}):this.ga=this.ga.insert(n,e)}ya(){const e=[];return this.ga.inorderTraversal((n,r)=>{e.push(r)}),e}}class wo{constructor(e,n,r,i,s,o,l,c,u){this.query=e,this.docs=n,this.oldDocs=r,this.docChanges=i,this.mutatedKeys=s,this.fromCache=o,this.syncStateChanged=l,this.excludesMetadataChanges=c,this.hasCachedResults=u}static fromInitialDocuments(e,n,r,i,s){const o=[];return n.forEach(l=>{o.push({type:0,doc:l})}),new wo(e,n,to.emptySet(n),o,r,i,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&sd(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const n=this.docChanges,r=e.docChanges;if(n.length!==r.length)return!1;for(let i=0;i<n.length;i++)if(n[i].type!==r[i].type||!n[i].doc.isEqual(r[i].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class X2{constructor(){this.wa=void 0,this.Sa=[]}ba(){return this.Sa.some(e=>e.Da())}}class J2{constructor(){this.queries=$_(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(n,r){const i=ue(n),s=i.queries;i.queries=$_(),s.forEach((o,l)=>{for(const c of l.Sa)c.onError(r)})})(this,new G(M.ABORTED,"Firestore shutting down"))}}function $_(){return new ws(t=>I0(t),sd)}async function Wm(t,e){const n=ue(t);let r=3;const i=e.query;let s=n.queries.get(i);s?!s.ba()&&e.Da()&&(r=2):(s=new X2,r=e.Da()?0:1);try{switch(r){case 0:s.wa=await n.onListen(i,!0);break;case 1:s.wa=await n.onListen(i,!1);break;case 2:await n.onFirstRemoteStoreListen(i)}}catch(o){const l=Hm(o,`Initialization of query '${ks(e.query)}' failed`);return void e.onError(l)}n.queries.set(i,s),s.Sa.push(e),e.va(n.onlineState),s.wa&&e.Fa(s.wa)&&Km(n)}async function Gm(t,e){const n=ue(t),r=e.query;let i=3;const s=n.queries.get(r);if(s){const o=s.Sa.indexOf(e);o>=0&&(s.Sa.splice(o,1),s.Sa.length===0?i=e.Da()?0:1:!s.ba()&&e.Da()&&(i=2))}switch(i){case 0:return n.queries.delete(r),n.onUnlisten(r,!0);case 1:return n.queries.delete(r),n.onUnlisten(r,!1);case 2:return n.onLastRemoteStoreUnlisten(r);default:return}}function Z2(t,e){const n=ue(t);let r=!1;for(const i of e){const s=i.query,o=n.queries.get(s);if(o){for(const l of o.Sa)l.Fa(i)&&(r=!0);o.wa=i}}r&&Km(n)}function eO(t,e,n){const r=ue(t),i=r.queries.get(e);if(i)for(const s of i.Sa)s.onError(n);r.queries.delete(e)}function Km(t){t.Ca.forEach(e=>{e.next()})}var np,B_;(B_=np||(np={})).Ma="default",B_.Cache="cache";class Qm{constructor(e,n,r){this.query=e,this.xa=n,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=r||{}}Fa(e){if(!this.options.includeMetadataChanges){const r=[];for(const i of e.docChanges)i.type!==3&&r.push(i);e=new wo(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.Oa?this.Ba(e)&&(this.xa.next(e),n=!0):this.La(e,this.onlineState)&&(this.ka(e),n=!0),this.Na=e,n}onError(e){this.xa.error(e)}va(e){this.onlineState=e;let n=!1;return this.Na&&!this.Oa&&this.La(this.Na,e)&&(this.ka(this.Na),n=!0),n}La(e,n){if(!e.fromCache||!this.Da())return!0;const r=n!=="Offline";return(!this.options.qa||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}Ba(e){if(e.docChanges.length>0)return!0;const n=this.Na&&this.Na.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}ka(e){e=wo.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Oa=!0,this.xa.next(e)}Da(){return this.options.source!==np.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sS{constructor(e){this.key=e}}class oS{constructor(e){this.key=e}}class tO{constructor(e,n){this.query=e,this.Ya=n,this.Za=null,this.hasCachedResults=!1,this.current=!1,this.Xa=Ee(),this.mutatedKeys=Ee(),this.eu=S0(e),this.tu=new to(this.eu)}get nu(){return this.Ya}ru(e,n){const r=n?n.iu:new U_,i=n?n.tu:this.tu;let s=n?n.mutatedKeys:this.mutatedKeys,o=i,l=!1;const c=this.query.limitType==="F"&&i.size===this.query.limit?i.last():null,u=this.query.limitType==="L"&&i.size===this.query.limit?i.first():null;if(e.inorderTraversal((f,p)=>{const g=i.get(f),S=od(this.query,p)?p:null,v=!!g&&this.mutatedKeys.has(g.key),N=!!S&&(S.hasLocalMutations||this.mutatedKeys.has(S.key)&&S.hasCommittedMutations);let b=!1;g&&S?g.data.isEqual(S.data)?v!==N&&(r.track({type:3,doc:S}),b=!0):this.su(g,S)||(r.track({type:2,doc:S}),b=!0,(c&&this.eu(S,c)>0||u&&this.eu(S,u)<0)&&(l=!0)):!g&&S?(r.track({type:0,doc:S}),b=!0):g&&!S&&(r.track({type:1,doc:g}),b=!0,(c||u)&&(l=!0)),b&&(S?(o=o.add(S),s=N?s.add(f):s.delete(f)):(o=o.delete(f),s=s.delete(f)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const f=this.query.limitType==="F"?o.last():o.first();o=o.delete(f.key),s=s.delete(f.key),r.track({type:1,doc:f})}return{tu:o,iu:r,Cs:l,mutatedKeys:s}}su(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,r,i){const s=this.tu;this.tu=e.tu,this.mutatedKeys=e.mutatedKeys;const o=e.iu.ya();o.sort((f,p)=>function(S,v){const N=b=>{switch(b){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return le(20277,{Rt:b})}};return N(S)-N(v)}(f.type,p.type)||this.eu(f.doc,p.doc)),this.ou(r),i=i??!1;const l=n&&!i?this._u():[],c=this.Xa.size===0&&this.current&&!i?1:0,u=c!==this.Za;return this.Za=c,o.length!==0||u?{snapshot:new wo(this.query,e.tu,s,o,e.mutatedKeys,c===0,u,!1,!!r&&r.resumeToken.approximateByteSize()>0),au:l}:{au:l}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new U_,mutatedKeys:this.mutatedKeys,Cs:!1},!1)):{au:[]}}uu(e){return!this.Ya.has(e)&&!!this.tu.has(e)&&!this.tu.get(e).hasLocalMutations}ou(e){e&&(e.addedDocuments.forEach(n=>this.Ya=this.Ya.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Ya=this.Ya.delete(n)),this.current=e.current)}_u(){if(!this.current)return[];const e=this.Xa;this.Xa=Ee(),this.tu.forEach(r=>{this.uu(r.key)&&(this.Xa=this.Xa.add(r.key))});const n=[];return e.forEach(r=>{this.Xa.has(r)||n.push(new oS(r))}),this.Xa.forEach(r=>{e.has(r)||n.push(new sS(r))}),n}cu(e){this.Ya=e.Qs,this.Xa=Ee();const n=this.ru(e.documents);return this.applyChanges(n,!0)}lu(){return wo.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Za===0,this.hasCachedResults)}}const Ym="SyncEngine";class nO{constructor(e,n,r){this.query=e,this.targetId=n,this.view=r}}class rO{constructor(e){this.key=e,this.hu=!1}}class iO{constructor(e,n,r,i,s,o){this.localStore=e,this.remoteStore=n,this.eventManager=r,this.sharedClientState=i,this.currentUser=s,this.maxConcurrentLimboResolutions=o,this.Pu={},this.Tu=new ws(l=>I0(l),sd),this.Iu=new Map,this.Eu=new Set,this.du=new Je(ne.comparator),this.Au=new Map,this.Ru=new Vm,this.Vu={},this.mu=new Map,this.fu=_o.cr(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}}async function sO(t,e,n=!0){const r=hS(t);let i;const s=r.Tu.get(e);return s?(r.sharedClientState.addLocalQueryTarget(s.targetId),i=s.view.lu()):i=await aS(r,e,n,!0),i}async function oO(t,e){const n=hS(t);await aS(n,e,!0,!1)}async function aS(t,e,n,r){const i=await A2(t.localStore,or(e)),s=i.targetId,o=t.sharedClientState.addLocalQueryTarget(s,n);let l;return r&&(l=await aO(t,e,s,o==="current",i.resumeToken)),t.isPrimaryClient&&n&&Z0(t.remoteStore,i),l}async function aO(t,e,n,r,i){t.pu=(p,g,S)=>async function(N,b,I,E){let y=b.view.ru(I);y.Cs&&(y=await O_(N.localStore,b.query,!1).then(({documents:C})=>b.view.ru(C,y)));const L=E&&E.targetChanges.get(b.targetId),$=E&&E.targetMismatches.get(b.targetId)!=null,B=b.view.applyChanges(y,N.isPrimaryClient,L,$);return q_(N,b.targetId,B.au),B.snapshot}(t,p,g,S);const s=await O_(t.localStore,e,!0),o=new tO(e,s.Qs),l=o.ru(s.documents),c=gl.createSynthesizedTargetChangeForCurrentChange(n,r&&t.onlineState!=="Offline",i),u=o.applyChanges(l,t.isPrimaryClient,c);q_(t,n,u.au);const f=new nO(e,n,o);return t.Tu.set(e,f),t.Iu.has(n)?t.Iu.get(n).push(e):t.Iu.set(n,[e]),u.snapshot}async function lO(t,e,n){const r=ue(t),i=r.Tu.get(e),s=r.Iu.get(i.targetId);if(s.length>1)return r.Iu.set(i.targetId,s.filter(o=>!sd(o,e))),void r.Tu.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(i.targetId),r.sharedClientState.isActiveQueryTarget(i.targetId)||await ep(r.localStore,i.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(i.targetId),n&&Um(r.remoteStore,i.targetId),rp(r,i.targetId)}).catch(Po)):(rp(r,i.targetId),await ep(r.localStore,i.targetId,!0))}async function cO(t,e){const n=ue(t),r=n.Tu.get(e),i=n.Iu.get(r.targetId);n.isPrimaryClient&&i.length===1&&(n.sharedClientState.removeLocalQueryTarget(r.targetId),Um(n.remoteStore,r.targetId))}async function uO(t,e,n){const r=yO(t);try{const i=await function(o,l){const c=ue(o),u=Oe.now(),f=l.reduce((S,v)=>S.add(v.key),Ee());let p,g;return c.persistence.runTransaction("Locally write mutations","readwrite",S=>{let v=Dr(),N=Ee();return c.Ns.getEntries(S,f).next(b=>{v=b,v.forEach((I,E)=>{E.isValidDocument()||(N=N.add(I))})}).next(()=>c.localDocuments.getOverlayedDocuments(S,v)).next(b=>{p=b;const I=[];for(const E of l){const y=SD(E,p.get(E.key).overlayedDocument);y!=null&&I.push(new Vi(E.key,y,m0(y.value.mapValue),An.exists(!0)))}return c.mutationQueue.addMutationBatch(S,u,I,l)}).next(b=>{g=b;const I=b.applyToLocalDocumentSet(p,N);return c.documentOverlayCache.saveOverlays(S,b.batchId,I)})}).then(()=>({batchId:g.batchId,changes:A0(p)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(i.batchId),function(o,l,c){let u=o.Vu[o.currentUser.toKey()];u||(u=new Je(we)),u=u.insert(l,c),o.Vu[o.currentUser.toKey()]=u}(r,i.batchId,n),await vl(r,i.changes),await hd(r.remoteStore)}catch(i){const s=Hm(i,"Failed to persist write");n.reject(s)}}async function lS(t,e){const n=ue(t);try{const r=await I2(n.localStore,e);e.targetChanges.forEach((i,s)=>{const o=n.Au.get(s);o&&(Pe(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1,22616),i.addedDocuments.size>0?o.hu=!0:i.modifiedDocuments.size>0?Pe(o.hu,14607):i.removedDocuments.size>0&&(Pe(o.hu,42227),o.hu=!1))}),await vl(n,r,e)}catch(r){await Po(r)}}function z_(t,e,n){const r=ue(t);if(r.isPrimaryClient&&n===0||!r.isPrimaryClient&&n===1){const i=[];r.Tu.forEach((s,o)=>{const l=o.view.va(e);l.snapshot&&i.push(l.snapshot)}),function(o,l){const c=ue(o);c.onlineState=l;let u=!1;c.queries.forEach((f,p)=>{for(const g of p.Sa)g.va(l)&&(u=!0)}),u&&Km(c)}(r.eventManager,e),i.length&&r.Pu.H_(i),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function dO(t,e,n){const r=ue(t);r.sharedClientState.updateQueryState(e,"rejected",n);const i=r.Au.get(e),s=i&&i.key;if(s){let o=new Je(ne.comparator);o=o.insert(s,Lt.newNoDocument(s,de.min()));const l=Ee().add(s),c=new cd(de.min(),new Map,new Je(we),o,l);await lS(r,c),r.du=r.du.remove(s),r.Au.delete(e),Xm(r)}else await ep(r.localStore,e,!1).then(()=>rp(r,e,n)).catch(Po)}async function hO(t,e){const n=ue(t),r=e.batch.batchId;try{const i=await T2(n.localStore,e);uS(n,r,null),cS(n,r),n.sharedClientState.updateMutationState(r,"acknowledged"),await vl(n,i)}catch(i){await Po(i)}}async function fO(t,e,n){const r=ue(t);try{const i=await function(o,l){const c=ue(o);return c.persistence.runTransaction("Reject batch","readwrite-primary",u=>{let f;return c.mutationQueue.lookupMutationBatch(u,l).next(p=>(Pe(p!==null,37113),f=p.keys(),c.mutationQueue.removeMutationBatch(u,p))).next(()=>c.mutationQueue.performConsistencyCheck(u)).next(()=>c.documentOverlayCache.removeOverlaysForBatchId(u,f,l)).next(()=>c.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(u,f)).next(()=>c.localDocuments.getDocuments(u,f))})}(r.localStore,e);uS(r,e,n),cS(r,e),r.sharedClientState.updateMutationState(e,"rejected",n),await vl(r,i)}catch(i){await Po(i)}}function cS(t,e){(t.mu.get(e)||[]).forEach(n=>{n.resolve()}),t.mu.delete(e)}function uS(t,e,n){const r=ue(t);let i=r.Vu[r.currentUser.toKey()];if(i){const s=i.get(e);s&&(n?s.reject(n):s.resolve(),i=i.remove(e)),r.Vu[r.currentUser.toKey()]=i}}function rp(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(const r of t.Iu.get(e))t.Tu.delete(r),n&&t.Pu.yu(r,n);t.Iu.delete(e),t.isPrimaryClient&&t.Ru.jr(e).forEach(r=>{t.Ru.containsKey(r)||dS(t,r)})}function dS(t,e){t.Eu.delete(e.path.canonicalString());const n=t.du.get(e);n!==null&&(Um(t.remoteStore,n),t.du=t.du.remove(e),t.Au.delete(n),Xm(t))}function q_(t,e,n){for(const r of n)r instanceof sS?(t.Ru.addReference(r.key,e),pO(t,r)):r instanceof oS?(Z(Ym,"Document no longer in limbo: "+r.key),t.Ru.removeReference(r.key,e),t.Ru.containsKey(r.key)||dS(t,r.key)):le(19791,{wu:r})}function pO(t,e){const n=e.key,r=n.path.canonicalString();t.du.get(n)||t.Eu.has(r)||(Z(Ym,"New document in limbo: "+n),t.Eu.add(r),Xm(t))}function Xm(t){for(;t.Eu.size>0&&t.du.size<t.maxConcurrentLimboResolutions;){const e=t.Eu.values().next().value;t.Eu.delete(e);const n=new ne(Me.fromString(e)),r=t.fu.next();t.Au.set(r,new rO(n)),t.du=t.du.insert(n,r),Z0(t.remoteStore,new ii(or(id(n.path)),r,"TargetPurposeLimboResolution",ed.ce))}}async function vl(t,e,n){const r=ue(t),i=[],s=[],o=[];r.Tu.isEmpty()||(r.Tu.forEach((l,c)=>{o.push(r.pu(c,e,n).then(u=>{var f;if((u||n)&&r.isPrimaryClient){const p=u?!u.fromCache:(f=n==null?void 0:n.targetChanges.get(c.targetId))==null?void 0:f.current;r.sharedClientState.updateQueryState(c.targetId,p?"current":"not-current")}if(u){i.push(u);const p=Mm.As(c.targetId,u);s.push(p)}}))}),await Promise.all(o),r.Pu.H_(i),await async function(c,u){const f=ue(c);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>U.forEach(u,g=>U.forEach(g.Es,S=>f.persistence.referenceDelegate.addReference(p,g.targetId,S)).next(()=>U.forEach(g.ds,S=>f.persistence.referenceDelegate.removeReference(p,g.targetId,S)))))}catch(p){if(!ko(p))throw p;Z(Fm,"Failed to update sequence numbers: "+p)}for(const p of u){const g=p.targetId;if(!p.fromCache){const S=f.Ms.get(g),v=S.snapshotVersion,N=S.withLastLimboFreeSnapshotVersion(v);f.Ms=f.Ms.insert(g,N)}}}(r.localStore,s))}async function mO(t,e){const n=ue(t);if(!n.currentUser.isEqual(e)){Z(Ym,"User change. New user:",e.toKey());const r=await Q0(n.localStore,e);n.currentUser=e,function(s,o){s.mu.forEach(l=>{l.forEach(c=>{c.reject(new G(M.CANCELLED,o))})}),s.mu.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await vl(n,r.Ls)}}function gO(t,e){const n=ue(t),r=n.Au.get(e);if(r&&r.hu)return Ee().add(r.key);{let i=Ee();const s=n.Iu.get(e);if(!s)return i;for(const o of s){const l=n.Tu.get(o);i=i.unionWith(l.view.nu)}return i}}function hS(t){const e=ue(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=lS.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=gO.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=dO.bind(null,e),e.Pu.H_=Z2.bind(null,e.eventManager),e.Pu.yu=eO.bind(null,e.eventManager),e}function yO(t){const e=ue(t);return e.remoteStore.remoteSyncer.applySuccessfulWrite=hO.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=fO.bind(null,e),e}class Eu{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=ud(e.databaseInfo.databaseId),this.sharedClientState=this.Du(e),this.persistence=this.Cu(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Fu(e,this.localStore),this.indexBackfillerScheduler=this.Mu(e,this.localStore)}Fu(e,n){return null}Mu(e,n){return null}vu(e){return E2(this.persistence,new v2,e.initialUser,this.serializer)}Cu(e){return new K0(jm.mi,this.serializer)}Du(e){return new x2}async terminate(){var e,n;(e=this.gcScheduler)==null||e.stop(),(n=this.indexBackfillerScheduler)==null||n.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Eu.provider={build:()=>new Eu};class vO extends Eu{constructor(e){super(),this.cacheSizeBytes=e}Fu(e,n){Pe(this.persistence.referenceDelegate instanceof _u,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new r2(r,e.asyncQueue,n)}Cu(e){const n=this.cacheSizeBytes!==void 0?Kt.withCacheSize(this.cacheSizeBytes):Kt.DEFAULT;return new K0(r=>_u.mi(r,n),this.serializer)}}class ip{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>z_(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=mO.bind(null,this.syncEngine),await Y2(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new J2}()}createDatastore(e){const n=ud(e.databaseInfo.databaseId),r=function(s){return new D2(s)}(e.databaseInfo);return function(s,o,l,c){return new j2(s,o,l,c)}(e.authCredentials,e.appCheckCredentials,r,n)}createRemoteStore(e){return function(r,i,s,o,l){return new F2(r,i,s,o,l)}(this.localStore,this.datastore,e.asyncQueue,n=>z_(this.syncEngine,n,0),function(){return j_.v()?new j_:new P2}())}createSyncEngine(e,n){return function(i,s,o,l,c,u,f){const p=new iO(i,s,o,l,c,u);return f&&(p.gu=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){var e,n;await async function(i){const s=ue(i);Z(us,"RemoteStore shutting down."),s.Ea.add(5),await yl(s),s.Aa.shutdown(),s.Ra.set("Unknown")}(this.remoteStore),(e=this.datastore)==null||e.terminate(),(n=this.eventManager)==null||n.terminate()}}ip.provider={build:()=>new ip};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jm{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ou(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ou(this.observer.error,e):br("Uncaught Error in snapshot listener:",e.toString()))}Nu(){this.muted=!0}Ou(e,n){setTimeout(()=>{this.muted||e(n)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ai="FirestoreClient";class _O{constructor(e,n,r,i,s){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=r,this.databaseInfo=i,this.user=bt.UNAUTHENTICATED,this.clientId=Cm.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(r,async o=>{Z(Ai,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(r,o=>(Z(Ai,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new sr;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){const r=Hm(n,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function Ah(t,e){t.asyncQueue.verifyOperationInProgress(),Z(Ai,"Initializing OfflineComponentProvider");const n=t.configuration;await e.initialize(n);let r=n.initialUser;t.setCredentialChangeListener(async i=>{r.isEqual(i)||(await Q0(e.localStore,i),r=i)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function H_(t,e){t.asyncQueue.verifyOperationInProgress();const n=await wO(t);Z(Ai,"Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(r=>F_(e.remoteStore,r)),t.setAppCheckTokenChangeListener((r,i)=>F_(e.remoteStore,i)),t._onlineComponents=e}async function wO(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){Z(Ai,"Using user provided OfflineComponentProvider");try{await Ah(t,t._uninitializedComponentsProvider._offline)}catch(e){const n=e;if(!function(i){return i.name==="FirebaseError"?i.code===M.FAILED_PRECONDITION||i.code===M.UNIMPLEMENTED:!(typeof DOMException<"u"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11}(n))throw n;fo("Error using user provided cache. Falling back to memory cache: "+n),await Ah(t,new Eu)}}else Z(Ai,"Using default OfflineComponentProvider"),await Ah(t,new vO(void 0));return t._offlineComponents}async function Zm(t){return t._onlineComponents||(t._uninitializedComponentsProvider?(Z(Ai,"Using user provided OnlineComponentProvider"),await H_(t,t._uninitializedComponentsProvider._online)):(Z(Ai,"Using default OnlineComponentProvider"),await H_(t,new ip))),t._onlineComponents}function EO(t){return Zm(t).then(e=>e.syncEngine)}function TO(t){return Zm(t).then(e=>e.datastore)}async function Tu(t){const e=await Zm(t),n=e.eventManager;return n.onListen=sO.bind(null,e.syncEngine),n.onUnlisten=lO.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=oO.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=cO.bind(null,e.syncEngine),n}function IO(t,e,n={}){const r=new sr;return t.asyncQueue.enqueueAndForget(async()=>function(s,o,l,c,u){const f=new Jm({next:g=>{f.Nu(),o.enqueueAndForget(()=>Gm(s,p));const S=g.docs.has(l);!S&&g.fromCache?u.reject(new G(M.UNAVAILABLE,"Failed to get document because the client is offline.")):S&&g.fromCache&&c&&c.source==="server"?u.reject(new G(M.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):u.resolve(g)},error:g=>u.reject(g)}),p=new Qm(id(l.path),f,{includeMetadataChanges:!0,qa:!0});return Wm(s,p)}(await Tu(t),t.asyncQueue,e,n,r)),r.promise}function SO(t,e,n={}){const r=new sr;return t.asyncQueue.enqueueAndForget(async()=>function(s,o,l,c,u){const f=new Jm({next:g=>{f.Nu(),o.enqueueAndForget(()=>Gm(s,p)),g.fromCache&&c.source==="server"?u.reject(new G(M.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):u.resolve(g)},error:g=>u.reject(g)}),p=new Qm(l,f,{includeMetadataChanges:!0,qa:!0});return Wm(s,p)}(await Tu(t),t.asyncQueue,e,n,r)),r.promise}function CO(t,e,n){const r=new sr;return t.asyncQueue.enqueueAndForget(async()=>{try{const i=await TO(t);r.resolve(async function(o,l,c){var N;const u=ue(o),{request:f,gt:p,parent:g}=qD(u.serializer,uD(l),c);u.connection.$o||delete f.parent;const S=(await u.Ho("RunAggregationQuery",u.serializer.databaseId,g,f,1)).filter(b=>!!b.result);Pe(S.length===1,64727);const v=(N=S[0].result)==null?void 0:N.aggregateFields;return Object.keys(v).reduce((b,I)=>(b[p[I]]=v[I],b),{})}(i,e,n))}catch(i){r.reject(i)}}),r.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fS(t){const e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const W_=new Map;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pS="firestore.googleapis.com",G_=!0;class K_{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new G(M.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=pS,this.ssl=G_}else this.host=e.host,this.ssl=e.ssl??G_;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=G0;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<t2)throw new G(M.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Vb("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=fS(e.experimentalLongPollingOptions??{}),function(r){if(r.timeoutSeconds!==void 0){if(isNaN(r.timeoutSeconds))throw new G(M.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (must not be NaN)`);if(r.timeoutSeconds<5)throw new G(M.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (minimum allowed value is 5)`);if(r.timeoutSeconds>30)throw new G(M.INVALID_ARGUMENT,`invalid long polling timeout: ${r.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,i){return r.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class fd{constructor(e,n,r,i){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new K_({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new G(M.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new G(M.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new K_(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new Ab;switch(r.type){case"firstParty":return new kb(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new G(M.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){const r=W_.get(n);r&&(Z("ComponentProvider","Removing Datastore"),W_.delete(n),r.terminate())}(this),Promise.resolve()}}function AO(t,e,n,r={}){var u;t=zt(t,fd);const i=Ni(e),s=t._getSettings(),o={...s,emulatorOptions:t._getEmulatorOptions()},l=`${e}:${n}`;i&&(hm(`https://${l}`),fm("Firestore",!0)),s.host!==pS&&s.host!==l&&fo("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const c={...s,host:l,ssl:i,emulatorOptions:r};if(!Pr(c,o)&&(t._setSettings(c),r.mockUserToken)){let f,p;if(typeof r.mockUserToken=="string")f=r.mockUserToken,p=bt.MOCK_USER;else{f=aI(r.mockUserToken,(u=t._app)==null?void 0:u.options.projectId);const g=r.mockUserToken.sub||r.mockUserToken.user_id;if(!g)throw new G(M.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");p=new bt(g)}t._authCredentials=new Rb(new r0(f,p))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qn{constructor(e,n,r){this.converter=n,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new qn(this.firestore,e,this._query)}}class tt{constructor(e,n,r){this.converter=n,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new vi(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new tt(this.firestore,e,this._key)}toJSON(){return{type:tt._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,n,r){if(pl(n,tt._jsonSchema))return new tt(e,r||null,new ne(Me.fromString(n.referencePath)))}}tt._jsonSchemaVersion="firestore/documentReference/1.0",tt._jsonSchema={type:dt("string",tt._jsonSchemaVersion),referencePath:dt("string")};class vi extends qn{constructor(e,n,r){super(e,n,id(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new tt(this.firestore,null,new ne(e))}withConverter(e){return new vi(this.firestore,e,this._path)}}function ft(t,e,...n){if(t=Ve(t),i0("collection","path",e),t instanceof fd){const r=Me.fromString(e,...n);return l_(r),new vi(t,null,r)}{if(!(t instanceof tt||t instanceof vi))throw new G(M.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(Me.fromString(e,...n));return l_(r),new vi(t.firestore,null,r)}}function Yt(t,e,...n){if(t=Ve(t),arguments.length===1&&(e=Cm.newId()),i0("doc","path",e),t instanceof fd){const r=Me.fromString(e,...n);return a_(r),new tt(t,null,new ne(r))}{if(!(t instanceof tt||t instanceof vi))throw new G(M.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(Me.fromString(e,...n));return a_(r),new tt(t.firestore,t instanceof vi?t.converter:null,new ne(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Q_="AsyncQueue";class Y_{constructor(e=Promise.resolve()){this.Xu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new X0(this,"async_queue_retry"),this._c=()=>{const r=Ch();r&&Z(Q_,"Visibility state changed to "+r.visibilityState),this.M_.w_()},this.ac=e;const n=Ch();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;const n=Ch();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise(()=>{});const n=new sr;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Xu.push(e),this.lc()))}async lc(){if(this.Xu.length!==0){try{await this.Xu[0](),this.Xu.shift(),this.M_.reset()}catch(e){if(!ko(e))throw e;Z(Q_,"Operation failed with retryable error: "+e)}this.Xu.length>0&&this.M_.p_(()=>this.lc())}}cc(e){const n=this.ac.then(()=>(this.rc=!0,e().catch(r=>{throw this.nc=r,this.rc=!1,br("INTERNAL UNHANDLED ERROR: ",X_(r)),r}).then(r=>(this.rc=!1,r))));return this.ac=n,n}enqueueAfterDelay(e,n,r){this.uc(),this.oc.indexOf(e)>-1&&(n=0);const i=qm.createAndSchedule(this,e,n,r,s=>this.hc(s));return this.tc.push(i),i}uc(){this.nc&&le(47125,{Pc:X_(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ic(e){for(const n of this.tc)if(n.timerId===e)return!0;return!1}Ec(e){return this.Tc().then(()=>{this.tc.sort((n,r)=>n.targetTimeMs-r.targetTimeMs);for(const n of this.tc)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.Tc()})}dc(e){this.oc.push(e)}hc(e){const n=this.tc.indexOf(e);this.tc.splice(n,1)}}function X_(t){let e=t.message||"";return t.stack&&(e=t.stack.includes(t.message)?t.stack:t.message+`
`+t.stack),e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function J_(t){return function(n,r){if(typeof n!="object"||n===null)return!1;const i=n;for(const s of r)if(s in i&&typeof i[s]=="function")return!0;return!1}(t,["next","error","complete"])}class dr extends fd{constructor(e,n,r,i){super(e,n,r,i),this.type="firestore",this._queue=new Y_,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Y_(e),this._firestoreClient=void 0,await e}}}function mS(t,e){const n=typeof t=="object"?t:Ku(),r=typeof t=="string"?t:fu,i=bi(n,"firestore").getImmediate({identifier:r});if(!i._initialized){const s=iI("firestore");s&&AO(i,...s)}return i}function _l(t){if(t._terminated)throw new G(M.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||RO(t),t._firestoreClient}function RO(t){var r,i,s;const e=t._freezeSettings(),n=function(l,c,u,f){return new Qb(l,c,u,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,fS(f.experimentalLongPollingOptions),f.useFetchStreams,f.isUsingEmulator)}(t._databaseId,((r=t._app)==null?void 0:r.options.appId)||"",t._persistenceKey,e);t._componentsProvider||(i=e.localCache)!=null&&i._offlineComponentProvider&&((s=e.localCache)!=null&&s._onlineComponentProvider)&&(t._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),t._firestoreClient=new _O(t._authCredentials,t._appCheckCredentials,t._queue,n,t._componentsProvider&&function(l){const c=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(c),_online:c}}(t._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xO{constructor(e="count",n){this._internalFieldPath=n,this.type="AggregateField",this.aggregateType=e}}class PO{constructor(e,n,r){this._userDataWriter=n,this._data=r,this.type="AggregateQuerySnapshot",this.query=e}data(){return this._userDataWriter.convertObjectMap(this._data)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class In{constructor(e){this._byteString=e}static fromBase64String(e){try{return new In(Rt.fromBase64String(e))}catch(n){throw new G(M.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new In(Rt.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:In._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(pl(e,In._jsonSchema))return In.fromBase64String(e.bytes)}}In._jsonSchemaVersion="firestore/bytes/1.0",In._jsonSchema={type:dt("string",In._jsonSchemaVersion),bytes:dt("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pd{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new G(M.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new St(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wl{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lr{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new G(M.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new G(M.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return we(this._lat,e._lat)||we(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:lr._jsonSchemaVersion}}static fromJSON(e){if(pl(e,lr._jsonSchema))return new lr(e.latitude,e.longitude)}}lr._jsonSchemaVersion="firestore/geoPoint/1.0",lr._jsonSchema={type:dt("string",lr._jsonSchemaVersion),latitude:dt("number"),longitude:dt("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cr{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,i){if(r.length!==i.length)return!1;for(let s=0;s<r.length;++s)if(r[s]!==i[s])return!1;return!0}(this._values,e._values)}toJSON(){return{type:cr._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(pl(e,cr._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(n=>typeof n=="number"))return new cr(e.vectorValues);throw new G(M.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}cr._jsonSchemaVersion="firestore/vectorValue/1.0",cr._jsonSchema={type:dt("string",cr._jsonSchemaVersion),vectorValues:dt("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kO=/^__.*__$/;class NO{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return this.fieldMask!==null?new Vi(e,this.data,this.fieldMask,n,this.fieldTransforms):new ml(e,this.data,n,this.fieldTransforms)}}class gS{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return new Vi(e,this.data,this.fieldMask,n,this.fieldTransforms)}}function yS(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw le(40011,{Ac:t})}}class md{constructor(e,n,r,i,s,o){this.settings=e,this.databaseId=n,this.serializer=r,this.ignoreUndefinedProperties=i,s===void 0&&this.Rc(),this.fieldTransforms=s||[],this.fieldMask=o||[]}get path(){return this.settings.path}get Ac(){return this.settings.Ac}Vc(e){return new md({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}mc(e){var i;const n=(i=this.path)==null?void 0:i.child(e),r=this.Vc({path:n,fc:!1});return r.gc(e),r}yc(e){var i;const n=(i=this.path)==null?void 0:i.child(e),r=this.Vc({path:n,fc:!1});return r.Rc(),r}wc(e){return this.Vc({path:void 0,fc:!0})}Sc(e){return Iu(e,this.settings.methodName,this.settings.bc||!1,this.path,this.settings.Dc)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}Rc(){if(this.path)for(let e=0;e<this.path.length;e++)this.gc(this.path.get(e))}gc(e){if(e.length===0)throw this.Sc("Document fields must not be empty");if(yS(this.Ac)&&kO.test(e))throw this.Sc('Document fields cannot begin and end with "__"')}}class bO{constructor(e,n,r){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=r||ud(e)}Cc(e,n,r,i=!1){return new md({Ac:e,methodName:n,Dc:r,path:St.emptyPath(),fc:!1,bc:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function El(t){const e=t._freezeSettings(),n=ud(t._databaseId);return new bO(t._databaseId,!!e.ignoreUndefinedProperties,n)}function vS(t,e,n,r,i,s={}){const o=t.Cc(s.merge||s.mergeFields?2:0,e,n,i);ng("Data must be an object, but it was:",o,r);const l=wS(r,o);let c,u;if(s.merge)c=new un(o.fieldMask),u=o.fieldTransforms;else if(s.mergeFields){const f=[];for(const p of s.mergeFields){const g=sp(e,p,n);if(!o.contains(g))throw new G(M.INVALID_ARGUMENT,`Field '${g}' is specified in your field mask but missing from your input data.`);TS(f,g)||f.push(g)}c=new un(f),u=o.fieldTransforms.filter(p=>c.covers(p.field))}else c=null,u=o.fieldTransforms;return new NO(new Xt(l),c,u)}class gd extends wl{_toFieldTransform(e){if(e.Ac!==2)throw e.Ac===1?e.Sc(`${this._methodName}() can only appear at the top level of your update data`):e.Sc(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof gd}}function DO(t,e,n){return new md({Ac:3,Dc:e.settings.Dc,methodName:t._methodName,fc:n},e.databaseId,e.serializer,e.ignoreUndefinedProperties)}class eg extends wl{_toFieldTransform(e){return new D0(e.path,new tl)}isEqual(e){return e instanceof eg}}class tg extends wl{constructor(e,n){super(e),this.vc=n}_toFieldTransform(e){const n=DO(this,e,!0),r=this.vc.map(s=>bo(s,n)),i=new vo(r);return new D0(e.path,i)}isEqual(e){return e instanceof tg&&Pr(this.vc,e.vc)}}function OO(t,e,n,r){const i=t.Cc(1,e,n);ng("Data must be an object, but it was:",i,r);const s=[],o=Xt.empty();Oi(r,(c,u)=>{const f=rg(e,c,n);u=Ve(u);const p=i.yc(f);if(u instanceof gd)s.push(f);else{const g=bo(u,p);g!=null&&(s.push(f),o.set(f,g))}});const l=new un(s);return new gS(o,l,i.fieldTransforms)}function LO(t,e,n,r,i,s){const o=t.Cc(1,e,n),l=[sp(e,r,n)],c=[i];if(s.length%2!=0)throw new G(M.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let g=0;g<s.length;g+=2)l.push(sp(e,s[g])),c.push(s[g+1]);const u=[],f=Xt.empty();for(let g=l.length-1;g>=0;--g)if(!TS(u,l[g])){const S=l[g];let v=c[g];v=Ve(v);const N=o.yc(S);if(v instanceof gd)u.push(S);else{const b=bo(v,N);b!=null&&(u.push(S),f.set(S,b))}}const p=new un(u);return new gS(f,p,o.fieldTransforms)}function _S(t,e,n,r=!1){return bo(n,t.Cc(r?4:3,e))}function bo(t,e){if(ES(t=Ve(t)))return ng("Unsupported field value:",e,t),wS(t,e);if(t instanceof wl)return function(r,i){if(!yS(i.Ac))throw i.Sc(`${r._methodName}() can only be used with update() and set()`);if(!i.path)throw i.Sc(`${r._methodName}() is not currently supported inside arrays`);const s=r._toFieldTransform(i);s&&i.fieldTransforms.push(s)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.fc&&e.Ac!==4)throw e.Sc("Nested arrays are not supported");return function(r,i){const s=[];let o=0;for(const l of r){let c=bo(l,i.wc(o));c==null&&(c={nullValue:"NULL_VALUE"}),s.push(c),o++}return{arrayValue:{values:s}}}(t,e)}return function(r,i){if((r=Ve(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return vD(i.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const s=Oe.fromDate(r);return{timestampValue:vu(i.serializer,s)}}if(r instanceof Oe){const s=new Oe(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:vu(i.serializer,s)}}if(r instanceof lr)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof In)return{bytesValue:F0(i.serializer,r._byteString)};if(r instanceof tt){const s=i.databaseId,o=r.firestore._databaseId;if(!o.isEqual(s))throw i.Sc(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:Lm(r.firestore._databaseId||i.databaseId,r._key.path)}}if(r instanceof cr)return function(o,l){return{mapValue:{fields:{[f0]:{stringValue:p0},[pu]:{arrayValue:{values:o.toArray().map(u=>{if(typeof u!="number")throw l.Sc("VectorValues must only contain numeric values.");return Nm(l.serializer,u)})}}}}}}(r,i);throw i.Sc(`Unsupported field value: ${Zu(r)}`)}(t,e)}function wS(t,e){const n={};return a0(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Oi(t,(r,i)=>{const s=bo(i,e.mc(r));s!=null&&(n[r]=s)}),{mapValue:{fields:n}}}function ES(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof Oe||t instanceof lr||t instanceof In||t instanceof tt||t instanceof wl||t instanceof cr)}function ng(t,e,n){if(!ES(n)||!s0(n)){const r=Zu(n);throw r==="an object"?e.Sc(t+" a custom object"):e.Sc(t+" "+r)}}function sp(t,e,n){if((e=Ve(e))instanceof pd)return e._internalPath;if(typeof e=="string")return rg(t,e);throw Iu("Field path arguments must be of type string or ",t,!1,void 0,n)}const VO=new RegExp("[~\\*/\\[\\]]");function rg(t,e,n){if(e.search(VO)>=0)throw Iu(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new pd(...e.split("."))._internalPath}catch{throw Iu(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function Iu(t,e,n,r,i){const s=r&&!r.isEmpty(),o=i!==void 0;let l=`Function ${e}() called with invalid data`;n&&(l+=" (via `toFirestore()`)"),l+=". ";let c="";return(s||o)&&(c+=" (found",s&&(c+=` in field ${r}`),o&&(c+=` in document ${i}`),c+=")"),new G(M.INVALID_ARGUMENT,l+t+c)}function TS(t,e){return t.some(n=>n.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ig{constructor(e,n,r,i,s){this._firestore=e,this._userDataWriter=n,this._key=r,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new tt(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new jO(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const n=this._document.data.field(yd("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}}class jO extends ig{data(){return super.data()}}function yd(t,e){return typeof e=="string"?rg(t,e):e instanceof pd?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function IS(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new G(M.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class sg{}class Tl extends sg{}function Dt(t,e,...n){let r=[];e instanceof sg&&r.push(e),r=r.concat(n),function(s){const o=s.filter(c=>c instanceof og).length,l=s.filter(c=>c instanceof vd).length;if(o>1||o>0&&l>0)throw new G(M.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const i of r)t=i._apply(t);return t}class vd extends Tl{constructor(e,n,r){super(),this._field=e,this._op=n,this._value=r,this.type="where"}static _create(e,n,r){return new vd(e,n,r)}_apply(e){const n=this._parse(e);return CS(e._query,n),new qn(e.firestore,e.converter,Qf(e._query,n))}_parse(e){const n=El(e.firestore);return function(s,o,l,c,u,f,p){let g;if(u.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new G(M.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){nw(p,f);const v=[];for(const N of p)v.push(tw(c,s,N));g={arrayValue:{values:v}}}else g=tw(c,s,p)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||nw(p,f),g=_S(l,o,p,f==="in"||f==="not-in");return ut.create(u,f,g)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}}function vn(t,e,n){const r=e,i=yd("where",t);return vd._create(i,r,n)}class og extends sg{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new og(e,n)}_parse(e){const n=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return n.length===1?n[0]:Bn.create(n,this._getOperator())}_apply(e){const n=this._parse(e);return n.getFilters().length===0?e:(function(i,s){let o=i;const l=s.getFlattenedFilters();for(const c of l)CS(o,c),o=Qf(o,c)}(e._query,n),new qn(e.firestore,e.converter,Qf(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class ag extends Tl{constructor(e,n){super(),this._field=e,this._direction=n,this.type="orderBy"}static _create(e,n){return new ag(e,n)}_apply(e){const n=function(i,s,o){if(i.startAt!==null)throw new G(M.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(i.endAt!==null)throw new G(M.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new el(s,o)}(e._query,this._field,this._direction);return new qn(e.firestore,e.converter,function(i,s){const o=i.explicitOrderBy.concat([s]);return new Li(i.path,i.collectionGroup,o,i.filters.slice(),i.limit,i.limitType,i.startAt,i.endAt)}(e._query,n))}}function si(t,e="asc"){const n=e,r=yd("orderBy",t);return ag._create(r,n)}class lg extends Tl{constructor(e,n,r){super(),this.type=e,this._limit=n,this._limitType=r}static _create(e,n,r){return new lg(e,n,r)}_apply(e){return new qn(e.firestore,e.converter,gu(e._query,this._limit,this._limitType))}}function no(t){return jb("limit",t),lg._create("limit",t,"F")}class _d extends Tl{constructor(e,n,r){super(),this.type=e,this._docOrFields=n,this._inclusive=r}static _create(e,n,r){return new _d(e,n,r)}_apply(e){const n=SS(e,this.type,this._docOrFields,this._inclusive);return new qn(e.firestore,e.converter,function(i,s){return new Li(i.path,i.collectionGroup,i.explicitOrderBy.slice(),i.filters.slice(),i.limit,i.limitType,s,i.endAt)}(e._query,n))}}function Z_(...t){return _d._create("startAt",t,!0)}function MO(...t){return _d._create("startAfter",t,!1)}class cg extends Tl{constructor(e,n,r){super(),this.type=e,this._docOrFields=n,this._inclusive=r}static _create(e,n,r){return new cg(e,n,r)}_apply(e){const n=SS(e,this.type,this._docOrFields,this._inclusive);return new qn(e.firestore,e.converter,function(i,s){return new Li(i.path,i.collectionGroup,i.explicitOrderBy.slice(),i.filters.slice(),i.limit,i.limitType,i.startAt,s)}(e._query,n))}}function ew(...t){return cg._create("endAt",t,!0)}function SS(t,e,n,r){if(n[0]=Ve(n[0]),n[0]instanceof ig)return function(s,o,l,c,u){if(!c)throw new G(M.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${l}().`);const f=[];for(const p of eo(s))if(p.field.isKeyField())f.push(mu(o,c.key));else{const g=c.data.field(p.field);if(nd(g))throw new G(M.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+p.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(g===null){const S=p.field.canonicalString();throw new G(M.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${S}' (used as the orderBy) does not exist.`)}f.push(g)}return new yo(f,u)}(t._query,t.firestore._databaseId,e,n[0]._document,r);{const i=El(t.firestore);return function(o,l,c,u,f,p){const g=o.explicitOrderBy;if(f.length>g.length)throw new G(M.INVALID_ARGUMENT,`Too many arguments provided to ${u}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);const S=[];for(let v=0;v<f.length;v++){const N=f[v];if(g[v].field.isKeyField()){if(typeof N!="string")throw new G(M.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${u}(), but got a ${typeof N}`);if(!km(o)&&N.indexOf("/")!==-1)throw new G(M.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${u}() must be a plain document ID, but '${N}' contains a slash.`);const b=o.path.child(Me.fromString(N));if(!ne.isDocumentKey(b))throw new G(M.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${u}() must result in a valid document path, but '${b}' is not because it contains an odd number of segments.`);const I=new ne(b);S.push(mu(l,I))}else{const b=_S(c,u,N);S.push(b)}}return new yo(S,p)}(t._query,t.firestore._databaseId,i,e,n,r)}}function tw(t,e,n){if(typeof(n=Ve(n))=="string"){if(n==="")throw new G(M.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!km(e)&&n.indexOf("/")!==-1)throw new G(M.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);const r=e.path.child(Me.fromString(n));if(!ne.isDocumentKey(r))throw new G(M.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return mu(t,new ne(r))}if(n instanceof tt)return mu(t,n._key);throw new G(M.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Zu(n)}.`)}function nw(t,e){if(!Array.isArray(t)||t.length===0)throw new G(M.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function CS(t,e){const n=function(i,s){for(const o of i)for(const l of o.getFlattenedFilters())if(s.indexOf(l.op)>=0)return l.op;return null}(t.filters,function(i){switch(i){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new G(M.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new G(M.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}class FO{convertValue(e,n="none"){switch(Si(e)){case 0:return null;case 1:return e.booleanValue;case 2:return st(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(Ii(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw le(62114,{value:e})}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){const r={};return Oi(e,(i,s)=>{r[i]=this.convertValue(s,n)}),r}convertVectorValue(e){var r,i,s;const n=(s=(i=(r=e.fields)==null?void 0:r[pu].arrayValue)==null?void 0:i.values)==null?void 0:s.map(o=>st(o.doubleValue));return new cr(n)}convertGeoPoint(e){return new lr(st(e.latitude),st(e.longitude))}convertArray(e,n){return(e.values||[]).map(r=>this.convertValue(r,n))}convertServerTimestamp(e,n){switch(n){case"previous":const r=rd(e);return r==null?null:this.convertValue(r,n);case"estimate":return this.convertTimestamp(Xa(e));default:return null}}convertTimestamp(e){const n=Ti(e);return new Oe(n.seconds,n.nanos)}convertDocumentKey(e,n){const r=Me.fromString(e);Pe(W0(r),9688,{name:e});const i=new Ja(r.get(1),r.get(3)),s=new ne(r.popFirst(5));return i.isEqual(n)||br(`Document ${s} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function AS(t,e,n){let r;return r=t?n&&(n.merge||n.mergeFields)?t.toFirestore(e,n):t.toFirestore(e):e,r}function UO(){return new xO("count")}class da{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class es extends ig{constructor(e,n,r,i,s,o){super(e,n,r,i,o),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const n=new bc(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){const r=this._document.data.field(yd("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,n.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new G(M.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,n={};return n.type=es._jsonSchemaVersion,n.bundle="",n.bundleSource="DocumentSnapshot",n.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?n:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),n.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),n)}}es._jsonSchemaVersion="firestore/documentSnapshot/1.0",es._jsonSchema={type:dt("string",es._jsonSchemaVersion),bundleSource:dt("string","DocumentSnapshot"),bundleName:dt("string"),bundle:dt("string")};class bc extends es{data(e={}){return super.data(e)}}class ts{constructor(e,n,r,i){this._firestore=e,this._userDataWriter=n,this._snapshot=i,this.metadata=new da(i.hasPendingWrites,i.fromCache),this.query=r}get docs(){const e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(r=>{e.call(n,new bc(this._firestore,this._userDataWriter,r.key,r,new da(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new G(M.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(i,s){if(i._snapshot.oldDocs.isEmpty()){let o=0;return i._snapshot.docChanges.map(l=>{const c=new bc(i._firestore,i._userDataWriter,l.doc.key,l.doc,new da(i._snapshot.mutatedKeys.has(l.doc.key),i._snapshot.fromCache),i.query.converter);return l.doc,{type:"added",doc:c,oldIndex:-1,newIndex:o++}})}{let o=i._snapshot.oldDocs;return i._snapshot.docChanges.filter(l=>s||l.type!==3).map(l=>{const c=new bc(i._firestore,i._userDataWriter,l.doc.key,l.doc,new da(i._snapshot.mutatedKeys.has(l.doc.key),i._snapshot.fromCache),i.query.converter);let u=-1,f=-1;return l.type!==0&&(u=o.indexOf(l.doc.key),o=o.delete(l.doc.key)),l.type!==1&&(o=o.add(l.doc),f=o.indexOf(l.doc.key)),{type:$O(l.type),doc:c,oldIndex:u,newIndex:f}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new G(M.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=ts._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Cm.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const n=[],r=[],i=[];return this.docs.forEach(s=>{s._document!==null&&(n.push(s._document),r.push(this._userDataWriter.convertObjectMap(s._document.data.value.mapValue.fields,"previous")),i.push(s.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function $O(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return le(61501,{type:t})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Su(t){t=zt(t,tt);const e=zt(t.firestore,dr);return IO(_l(e),t._key).then(n=>xS(e,t,n))}ts._jsonSchemaVersion="firestore/querySnapshot/1.0",ts._jsonSchema={type:dt("string",ts._jsonSchemaVersion),bundleSource:dt("string","QuerySnapshot"),bundleName:dt("string"),bundle:dt("string")};class wd extends FO{constructor(e){super(),this.firestore=e}convertBytes(e){return new In(e)}convertReference(e){const n=this.convertDocumentKey(e,this.firestore._databaseId);return new tt(this.firestore,null,n)}}function _n(t){t=zt(t,qn);const e=zt(t.firestore,dr),n=_l(e),r=new wd(e);return IS(t._query),SO(n,t._query).then(i=>new ts(e,r,t,i))}function Cu(t,e,n){t=zt(t,tt);const r=zt(t.firestore,dr),i=AS(t.converter,e,n);return Ed(r,[vS(El(r),"setDoc",t._key,i,t.converter!==null,n).toMutation(t._key,An.none())])}function op(t,e,n,...r){t=zt(t,tt);const i=zt(t.firestore,dr),s=El(i);let o;return o=typeof(e=Ve(e))=="string"||e instanceof pd?LO(s,"updateDoc",t._key,e,n,r):OO(s,"updateDoc",t._key,e),Ed(i,[o.toMutation(t._key,An.exists(!0))])}function RS(t){return Ed(zt(t.firestore,dr),[new bm(t._key,An.none())])}function BO(t,e){const n=zt(t.firestore,dr),r=Yt(t),i=AS(t.converter,e);return Ed(n,[vS(El(t.firestore),"addDoc",r._key,i,t.converter!==null,{}).toMutation(r._key,An.exists(!1))]).then(()=>r)}function Ra(t,...e){var c,u,f;t=Ve(t);let n={includeMetadataChanges:!1,source:"default"},r=0;typeof e[r]!="object"||J_(e[r])||(n=e[r++]);const i={includeMetadataChanges:n.includeMetadataChanges,source:n.source};if(J_(e[r])){const p=e[r];e[r]=(c=p.next)==null?void 0:c.bind(p),e[r+1]=(u=p.error)==null?void 0:u.bind(p),e[r+2]=(f=p.complete)==null?void 0:f.bind(p)}let s,o,l;if(t instanceof tt)o=zt(t.firestore,dr),l=id(t._key.path),s={next:p=>{e[r]&&e[r](xS(o,t,p))},error:e[r+1],complete:e[r+2]};else{const p=zt(t,qn);o=zt(p.firestore,dr),l=p._query;const g=new wd(o);s={next:S=>{e[r]&&e[r](new ts(o,g,p,S))},error:e[r+1],complete:e[r+2]},IS(t._query)}return function(g,S,v,N){const b=new Jm(N),I=new Qm(S,b,v);return g.asyncQueue.enqueueAndForget(async()=>Wm(await Tu(g),I)),()=>{b.Nu(),g.asyncQueue.enqueueAndForget(async()=>Gm(await Tu(g),I))}}(_l(o),l,i,s)}function Ed(t,e){return function(r,i){const s=new sr;return r.asyncQueue.enqueueAndForget(async()=>uO(await EO(r),i,s)),s.promise}(_l(t),e)}function xS(t,e,n){const r=n.docs.get(e._key),i=new wd(t);return new es(t,i,e._key,r,new da(n.hasPendingWrites,n.fromCache),e.converter)}function zO(t){return qO(t,{count:UO()})}function qO(t,e){const n=zt(t.firestore,dr),r=_l(n),i=Gb(e,(s,o)=>new xD(o,s.aggregateType,s._internalFieldPath));return CO(r,t._query,i).then(s=>function(l,c,u){const f=new wd(l);return new PO(c,f,u)}(n,t,s))}function $i(){return new eg("serverTimestamp")}function HO(...t){return new tg("arrayUnion",t)}(function(e,n=!0){(function(i){xo=i})(vs),Un(new Pn("firestore",(r,{instanceIdentifier:i,options:s})=>{const o=r.getProvider("app").getImmediate(),l=new dr(new xb(r.getProvider("auth-internal")),new Nb(o,r.getProvider("app-check-internal")),function(u,f){if(!Object.prototype.hasOwnProperty.apply(u.options,["projectId"]))throw new G(M.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Ja(u.options.projectId,f)}(o,i),o);return s={useFetchStreams:n,...s},l._setSettings(s),l},"PUBLIC").setMultipleInstances(!0)),nn(r_,i_,e),nn(r_,i_,"esm2020")})();/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const PS="firebasestorage.googleapis.com",kS="storageBucket",WO=2*60*1e3,GO=10*60*1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rt extends kn{constructor(e,n,r=0){super(Rh(e),`Firebase Storage: ${n} (${Rh(e)})`),this.status_=r,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,rt.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return Rh(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var nt;(function(t){t.UNKNOWN="unknown",t.OBJECT_NOT_FOUND="object-not-found",t.BUCKET_NOT_FOUND="bucket-not-found",t.PROJECT_NOT_FOUND="project-not-found",t.QUOTA_EXCEEDED="quota-exceeded",t.UNAUTHENTICATED="unauthenticated",t.UNAUTHORIZED="unauthorized",t.UNAUTHORIZED_APP="unauthorized-app",t.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",t.INVALID_CHECKSUM="invalid-checksum",t.CANCELED="canceled",t.INVALID_EVENT_NAME="invalid-event-name",t.INVALID_URL="invalid-url",t.INVALID_DEFAULT_BUCKET="invalid-default-bucket",t.NO_DEFAULT_BUCKET="no-default-bucket",t.CANNOT_SLICE_BLOB="cannot-slice-blob",t.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",t.NO_DOWNLOAD_URL="no-download-url",t.INVALID_ARGUMENT="invalid-argument",t.INVALID_ARGUMENT_COUNT="invalid-argument-count",t.APP_DELETED="app-deleted",t.INVALID_ROOT_OPERATION="invalid-root-operation",t.INVALID_FORMAT="invalid-format",t.INTERNAL_ERROR="internal-error",t.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(nt||(nt={}));function Rh(t){return"storage/"+t}function ug(){const t="An unknown error occurred, please check the error payload for server response.";return new rt(nt.UNKNOWN,t)}function KO(t){return new rt(nt.OBJECT_NOT_FOUND,"Object '"+t+"' does not exist.")}function QO(t){return new rt(nt.QUOTA_EXCEEDED,"Quota for bucket '"+t+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function YO(){const t="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new rt(nt.UNAUTHENTICATED,t)}function XO(){return new rt(nt.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function JO(t){return new rt(nt.UNAUTHORIZED,"User does not have permission to access '"+t+"'.")}function ZO(){return new rt(nt.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function eL(){return new rt(nt.CANCELED,"User canceled the upload/download.")}function tL(t){return new rt(nt.INVALID_URL,"Invalid URL '"+t+"'.")}function nL(t){return new rt(nt.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+t+"'.")}function rL(){return new rt(nt.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+kS+"' property when initializing the app?")}function iL(){return new rt(nt.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function sL(){return new rt(nt.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function oL(t){return new rt(nt.UNSUPPORTED_ENVIRONMENT,`${t} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function ap(t){return new rt(nt.INVALID_ARGUMENT,t)}function NS(){return new rt(nt.APP_DELETED,"The Firebase app was deleted.")}function aL(t){return new rt(nt.INVALID_ROOT_OPERATION,"The operation '"+t+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function xa(t,e){return new rt(nt.INVALID_FORMAT,"String does not match format '"+t+"': "+e)}function ea(t){throw new rt(nt.INTERNAL_ERROR,"Internal error: "+t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $t{constructor(e,n){this.bucket=e,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,n){let r;try{r=$t.makeFromUrl(e,n)}catch{return new $t(e,"")}if(r.path==="")return r;throw nL(e)}static makeFromUrl(e,n){let r=null;const i="([A-Za-z0-9.\\-_]+)";function s(L){L.path.charAt(L.path.length-1)==="/"&&(L.path_=L.path_.slice(0,-1))}const o="(/(.*))?$",l=new RegExp("^gs://"+i+o,"i"),c={bucket:1,path:3};function u(L){L.path_=decodeURIComponent(L.path)}const f="v[A-Za-z0-9_]+",p=n.replace(/[.]/g,"\\."),g="(/([^?#]*).*)?$",S=new RegExp(`^https?://${p}/${f}/b/${i}/o${g}`,"i"),v={bucket:1,path:3},N=n===PS?"(?:storage.googleapis.com|storage.cloud.google.com)":n,b="([^?#]*)",I=new RegExp(`^https?://${N}/${i}/${b}`,"i"),y=[{regex:l,indices:c,postModify:s},{regex:S,indices:v,postModify:u},{regex:I,indices:{bucket:1,path:2},postModify:u}];for(let L=0;L<y.length;L++){const $=y[L],B=$.regex.exec(e);if(B){const C=B[$.indices.bucket];let T=B[$.indices.path];T||(T=""),r=new $t(C,T),$.postModify(r);break}}if(r==null)throw tL(e);return r}}class lL{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cL(t,e,n){let r=1,i=null,s=null,o=!1,l=0;function c(){return l===2}let u=!1;function f(...b){u||(u=!0,e.apply(null,b))}function p(b){i=setTimeout(()=>{i=null,t(S,c())},b)}function g(){s&&clearTimeout(s)}function S(b,...I){if(u){g();return}if(b){g(),f.call(null,b,...I);return}if(c()||o){g(),f.call(null,b,...I);return}r<64&&(r*=2);let y;l===1?(l=2,y=0):y=(r+Math.random())*1e3,p(y)}let v=!1;function N(b){v||(v=!0,g(),!u&&(i!==null?(b||(l=2),clearTimeout(i),p(0)):b||(l=1)))}return p(0),s=setTimeout(()=>{o=!0,N(!0)},n),N}function uL(t){t(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dL(t){return t!==void 0}function hL(t){return typeof t=="object"&&!Array.isArray(t)}function dg(t){return typeof t=="string"||t instanceof String}function rw(t){return hg()&&t instanceof Blob}function hg(){return typeof Blob<"u"}function lp(t,e,n,r){if(r<e)throw ap(`Invalid value for '${t}'. Expected ${e} or greater.`);if(r>n)throw ap(`Invalid value for '${t}'. Expected ${n} or less.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Il(t,e,n){let r=e;return n==null&&(r=`https://${e}`),`${n}://${r}/v0${t}`}function bS(t){const e=encodeURIComponent;let n="?";for(const r in t)if(t.hasOwnProperty(r)){const i=e(r)+"="+e(t[r]);n=n+i+"&"}return n=n.slice(0,-1),n}var ns;(function(t){t[t.NO_ERROR=0]="NO_ERROR",t[t.NETWORK_ERROR=1]="NETWORK_ERROR",t[t.ABORT=2]="ABORT"})(ns||(ns={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fL(t,e){const n=t>=500&&t<600,i=[408,429].indexOf(t)!==-1,s=e.indexOf(t)!==-1;return n||i||s}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pL{constructor(e,n,r,i,s,o,l,c,u,f,p,g=!0,S=!1){this.url_=e,this.method_=n,this.headers_=r,this.body_=i,this.successCodes_=s,this.additionalRetryCodes_=o,this.callback_=l,this.errorCallback_=c,this.timeout_=u,this.progressCallback_=f,this.connectionFactory_=p,this.retry=g,this.isUsingEmulator=S,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((v,N)=>{this.resolve_=v,this.reject_=N,this.start_()})}start_(){const e=(r,i)=>{if(i){r(!1,new sc(!1,null,!0));return}const s=this.connectionFactory_();this.pendingConnection_=s;const o=l=>{const c=l.loaded,u=l.lengthComputable?l.total:-1;this.progressCallback_!==null&&this.progressCallback_(c,u)};this.progressCallback_!==null&&s.addUploadProgressListener(o),s.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&s.removeUploadProgressListener(o),this.pendingConnection_=null;const l=s.getErrorCode()===ns.NO_ERROR,c=s.getStatus();if(!l||fL(c,this.additionalRetryCodes_)&&this.retry){const f=s.getErrorCode()===ns.ABORT;r(!1,new sc(!1,null,f));return}const u=this.successCodes_.indexOf(c)!==-1;r(!0,new sc(u,s))})},n=(r,i)=>{const s=this.resolve_,o=this.reject_,l=i.connection;if(i.wasSuccessCode)try{const c=this.callback_(l,l.getResponse());dL(c)?s(c):s()}catch(c){o(c)}else if(l!==null){const c=ug();c.serverResponse=l.getErrorText(),this.errorCallback_?o(this.errorCallback_(l,c)):o(c)}else if(i.canceled){const c=this.appDelete_?NS():eL();o(c)}else{const c=ZO();o(c)}};this.canceled_?n(!1,new sc(!1,null,!0)):this.backoffId_=cL(e,n,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&uL(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class sc{constructor(e,n,r){this.wasSuccessCode=e,this.connection=n,this.canceled=!!r}}function mL(t,e){e!==null&&e.length>0&&(t.Authorization="Firebase "+e)}function gL(t,e){t["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function yL(t,e){e&&(t["X-Firebase-GMPID"]=e)}function vL(t,e){e!==null&&(t["X-Firebase-AppCheck"]=e)}function _L(t,e,n,r,i,s,o=!0,l=!1){const c=bS(t.urlParams),u=t.url+c,f=Object.assign({},t.headers);return yL(f,e),mL(f,n),gL(f,s),vL(f,r),new pL(u,t.method,f,t.body,t.successCodes,t.additionalRetryCodes,t.handler,t.errorHandler,t.timeout,t.progressCallback,i,o,l)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wL(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function EL(...t){const e=wL();if(e!==void 0){const n=new e;for(let r=0;r<t.length;r++)n.append(t[r]);return n.getBlob()}else{if(hg())return new Blob(t);throw new rt(nt.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function TL(t,e,n){return t.webkitSlice?t.webkitSlice(e,n):t.mozSlice?t.mozSlice(e,n):t.slice?t.slice(e,n):null}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function IL(t){if(typeof atob>"u")throw oL("base-64");return atob(t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const er={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class xh{constructor(e,n){this.data=e,this.contentType=n||null}}function SL(t,e){switch(t){case er.RAW:return new xh(DS(e));case er.BASE64:case er.BASE64URL:return new xh(OS(t,e));case er.DATA_URL:return new xh(AL(e),RL(e))}throw ug()}function DS(t){const e=[];for(let n=0;n<t.length;n++){let r=t.charCodeAt(n);if(r<=127)e.push(r);else if(r<=2047)e.push(192|r>>6,128|r&63);else if((r&64512)===55296)if(!(n<t.length-1&&(t.charCodeAt(n+1)&64512)===56320))e.push(239,191,189);else{const s=r,o=t.charCodeAt(++n);r=65536|(s&1023)<<10|o&1023,e.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|r&63)}else(r&64512)===56320?e.push(239,191,189):e.push(224|r>>12,128|r>>6&63,128|r&63)}return new Uint8Array(e)}function CL(t){let e;try{e=decodeURIComponent(t)}catch{throw xa(er.DATA_URL,"Malformed data URL.")}return DS(e)}function OS(t,e){switch(t){case er.BASE64:{const i=e.indexOf("-")!==-1,s=e.indexOf("_")!==-1;if(i||s)throw xa(t,"Invalid character '"+(i?"-":"_")+"' found: is it base64url encoded?");break}case er.BASE64URL:{const i=e.indexOf("+")!==-1,s=e.indexOf("/")!==-1;if(i||s)throw xa(t,"Invalid character '"+(i?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let n;try{n=IL(e)}catch(i){throw i.message.includes("polyfill")?i:xa(t,"Invalid character found")}const r=new Uint8Array(n.length);for(let i=0;i<n.length;i++)r[i]=n.charCodeAt(i);return r}class LS{constructor(e){this.base64=!1,this.contentType=null;const n=e.match(/^data:([^,]+)?,/);if(n===null)throw xa(er.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const r=n[1]||null;r!=null&&(this.base64=xL(r,";base64"),this.contentType=this.base64?r.substring(0,r.length-7):r),this.rest=e.substring(e.indexOf(",")+1)}}function AL(t){const e=new LS(t);return e.base64?OS(er.BASE64,e.rest):CL(e.rest)}function RL(t){return new LS(t).contentType}function xL(t,e){return t.length>=e.length?t.substring(t.length-e.length)===e:!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ti{constructor(e,n){let r=0,i="";rw(e)?(this.data_=e,r=e.size,i=e.type):e instanceof ArrayBuffer?(n?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),r=this.data_.length):e instanceof Uint8Array&&(n?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),r=e.length),this.size_=r,this.type_=i}size(){return this.size_}type(){return this.type_}slice(e,n){if(rw(this.data_)){const r=this.data_,i=TL(r,e,n);return i===null?null:new ti(i)}else{const r=new Uint8Array(this.data_.buffer,e,n-e);return new ti(r,!0)}}static getBlob(...e){if(hg()){const n=e.map(r=>r instanceof ti?r.data_:r);return new ti(EL.apply(null,n))}else{const n=e.map(o=>dg(o)?SL(er.RAW,o).data:o.data_);let r=0;n.forEach(o=>{r+=o.byteLength});const i=new Uint8Array(r);let s=0;return n.forEach(o=>{for(let l=0;l<o.length;l++)i[s++]=o[l]}),new ti(i,!0)}}uploadData(){return this.data_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fg(t){let e;try{e=JSON.parse(t)}catch{return null}return hL(e)?e:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function PL(t){if(t.length===0)return null;const e=t.lastIndexOf("/");return e===-1?"":t.slice(0,e)}function kL(t,e){const n=e.split("/").filter(r=>r.length>0).join("/");return t.length===0?n:t+"/"+n}function VS(t){const e=t.lastIndexOf("/",t.length-2);return e===-1?t:t.slice(e+1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function NL(t,e){return e}class Ft{constructor(e,n,r,i){this.server=e,this.local=n||e,this.writable=!!r,this.xform=i||NL}}let oc=null;function bL(t){return!dg(t)||t.length<2?t:VS(t)}function jS(){if(oc)return oc;const t=[];t.push(new Ft("bucket")),t.push(new Ft("generation")),t.push(new Ft("metageneration")),t.push(new Ft("name","fullPath",!0));function e(s,o){return bL(o)}const n=new Ft("name");n.xform=e,t.push(n);function r(s,o){return o!==void 0?Number(o):o}const i=new Ft("size");return i.xform=r,t.push(i),t.push(new Ft("timeCreated")),t.push(new Ft("updated")),t.push(new Ft("md5Hash",null,!0)),t.push(new Ft("cacheControl",null,!0)),t.push(new Ft("contentDisposition",null,!0)),t.push(new Ft("contentEncoding",null,!0)),t.push(new Ft("contentLanguage",null,!0)),t.push(new Ft("contentType",null,!0)),t.push(new Ft("metadata","customMetadata",!0)),oc=t,oc}function DL(t,e){function n(){const r=t.bucket,i=t.fullPath,s=new $t(r,i);return e._makeStorageReference(s)}Object.defineProperty(t,"ref",{get:n})}function OL(t,e,n){const r={};r.type="file";const i=n.length;for(let s=0;s<i;s++){const o=n[s];r[o.local]=o.xform(r,e[o.server])}return DL(r,t),r}function MS(t,e,n){const r=fg(e);return r===null?null:OL(t,r,n)}function LL(t,e,n,r){const i=fg(e);if(i===null||!dg(i.downloadTokens))return null;const s=i.downloadTokens;if(s.length===0)return null;const o=encodeURIComponent;return s.split(",").map(u=>{const f=t.bucket,p=t.fullPath,g="/b/"+o(f)+"/o/"+o(p),S=Il(g,n,r),v=bS({alt:"media",token:u});return S+v})[0]}function VL(t,e){const n={},r=e.length;for(let i=0;i<r;i++){const s=e[i];s.writable&&(n[s.server]=t[s.local])}return JSON.stringify(n)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iw="prefixes",sw="items";function jL(t,e,n){const r={prefixes:[],items:[],nextPageToken:n.nextPageToken};if(n[iw])for(const i of n[iw]){const s=i.replace(/\/$/,""),o=t._makeStorageReference(new $t(e,s));r.prefixes.push(o)}if(n[sw])for(const i of n[sw]){const s=t._makeStorageReference(new $t(e,i.name));r.items.push(s)}return r}function ML(t,e,n){const r=fg(n);return r===null?null:jL(t,e,r)}class Td{constructor(e,n,r,i){this.url=e,this.method=n,this.handler=r,this.timeout=i,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pg(t){if(!t)throw ug()}function FL(t,e){function n(r,i){const s=MS(t,i,e);return pg(s!==null),s}return n}function UL(t,e){function n(r,i){const s=ML(t,e,i);return pg(s!==null),s}return n}function $L(t,e){function n(r,i){const s=MS(t,i,e);return pg(s!==null),LL(s,i,t.host,t._protocol)}return n}function mg(t){function e(n,r){let i;return n.getStatus()===401?n.getErrorText().includes("Firebase App Check token is invalid")?i=XO():i=YO():n.getStatus()===402?i=QO(t.bucket):n.getStatus()===403?i=JO(t.path):i=r,i.status=n.getStatus(),i.serverResponse=r.serverResponse,i}return e}function FS(t){const e=mg(t);function n(r,i){let s=e(r,i);return r.getStatus()===404&&(s=KO(t.path)),s.serverResponse=i.serverResponse,s}return n}function BL(t,e,n,r,i){const s={};e.isRoot?s.prefix="":s.prefix=e.path+"/",n.length>0&&(s.delimiter=n),r&&(s.pageToken=r),i&&(s.maxResults=i);const o=e.bucketOnlyServerUrl(),l=Il(o,t.host,t._protocol),c="GET",u=t.maxOperationRetryTime,f=new Td(l,c,UL(t,e.bucket),u);return f.urlParams=s,f.errorHandler=mg(e),f}function zL(t,e,n){const r=e.fullServerUrl(),i=Il(r,t.host,t._protocol),s="GET",o=t.maxOperationRetryTime,l=new Td(i,s,$L(t,n),o);return l.errorHandler=FS(e),l}function qL(t,e){const n=e.fullServerUrl(),r=Il(n,t.host,t._protocol),i="DELETE",s=t.maxOperationRetryTime;function o(c,u){}const l=new Td(r,i,o,s);return l.successCodes=[200,204],l.errorHandler=FS(e),l}function HL(t,e){return t&&t.contentType||e&&e.type()||"application/octet-stream"}function WL(t,e,n){const r=Object.assign({},n);return r.fullPath=t.path,r.size=e.size(),r.contentType||(r.contentType=HL(null,e)),r}function GL(t,e,n,r,i){const s=e.bucketOnlyServerUrl(),o={"X-Goog-Upload-Protocol":"multipart"};function l(){let y="";for(let L=0;L<2;L++)y=y+Math.random().toString().slice(2);return y}const c=l();o["Content-Type"]="multipart/related; boundary="+c;const u=WL(e,r,i),f=VL(u,n),p="--"+c+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+f+`\r
--`+c+`\r
Content-Type: `+u.contentType+`\r
\r
`,g=`\r
--`+c+"--",S=ti.getBlob(p,r,g);if(S===null)throw iL();const v={name:u.fullPath},N=Il(s,t.host,t._protocol),b="POST",I=t.maxUploadRetryTime,E=new Td(N,b,FL(t,n),I);return E.urlParams=v,E.headers=o,E.body=S.uploadData(),E.errorHandler=mg(e),E}class KL{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=ns.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=ns.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=ns.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,n,r,i,s){if(this.sent_)throw ea("cannot .send() more than once");if(Ni(e)&&r&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(n,e,!0),s!==void 0)for(const o in s)s.hasOwnProperty(o)&&this.xhr_.setRequestHeader(o,s[o].toString());return i!==void 0?this.xhr_.send(i):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw ea("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw ea("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw ea("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw ea("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}}class QL extends KL{initXhr(){this.xhr_.responseType="text"}}function Id(){return new QL}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ds{constructor(e,n){this._service=e,n instanceof $t?this._location=n:this._location=$t.makeFromUrl(n,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,n){return new ds(e,n)}get root(){const e=new $t(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return VS(this._location.path)}get storage(){return this._service}get parent(){const e=PL(this._location.path);if(e===null)return null;const n=new $t(this._location.bucket,e);return new ds(this._service,n)}_throwIfRoot(e){if(this._location.path==="")throw aL(e)}}function YL(t,e,n){t._throwIfRoot("uploadBytes");const r=GL(t.storage,t._location,jS(),new ti(e,!0),n);return t.storage.makeRequestWithTokens(r,Id).then(i=>({metadata:i,ref:t}))}function XL(t){const e={prefixes:[],items:[]};return US(t,e).then(()=>e)}async function US(t,e,n){const i=await JL(t,{pageToken:n});e.prefixes.push(...i.prefixes),e.items.push(...i.items),i.nextPageToken!=null&&await US(t,e,i.nextPageToken)}function JL(t,e){e!=null&&typeof e.maxResults=="number"&&lp("options.maxResults",1,1e3,e.maxResults);const n=e||{},r=BL(t.storage,t._location,"/",n.pageToken,n.maxResults);return t.storage.makeRequestWithTokens(r,Id)}function ZL(t){t._throwIfRoot("getDownloadURL");const e=zL(t.storage,t._location,jS());return t.storage.makeRequestWithTokens(e,Id).then(n=>{if(n===null)throw sL();return n})}function eV(t){t._throwIfRoot("deleteObject");const e=qL(t.storage,t._location);return t.storage.makeRequestWithTokens(e,Id)}function tV(t,e){const n=kL(t._location.path,e),r=new $t(t._location.bucket,n);return new ds(t.storage,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nV(t){return/^[A-Za-z]+:\/\//.test(t)}function rV(t,e){return new ds(t,e)}function $S(t,e){if(t instanceof gg){const n=t;if(n._bucket==null)throw rL();const r=new ds(n,n._bucket);return e!=null?$S(r,e):r}else return e!==void 0?tV(t,e):t}function iV(t,e){if(e&&nV(e)){if(t instanceof gg)return rV(t,e);throw ap("To use ref(service, url), the first argument must be a Storage instance.")}else return $S(t,e)}function ow(t,e){const n=e==null?void 0:e[kS];return n==null?null:$t.makeFromBucketSpec(n,t)}function sV(t,e,n,r={}){t.host=`${e}:${n}`;const i=Ni(e);i&&(hm(`https://${t.host}/b`),fm("Storage",!0)),t._isUsingEmulator=!0,t._protocol=i?"https":"http";const{mockUserToken:s}=r;s&&(t._overrideAuthToken=typeof s=="string"?s:aI(s,t.app.options.projectId))}class gg{constructor(e,n,r,i,s,o=!1){this.app=e,this._authProvider=n,this._appCheckProvider=r,this._url=i,this._firebaseVersion=s,this._isUsingEmulator=o,this._bucket=null,this._host=PS,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=WO,this._maxUploadRetryTime=GO,this._requests=new Set,i!=null?this._bucket=$t.makeFromBucketSpec(i,this._host):this._bucket=ow(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=$t.makeFromBucketSpec(this._url,e):this._bucket=ow(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){lp("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){lp("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const n=await e.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(Tn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new ds(this,e)}_makeRequest(e,n,r,i,s=!0){if(this._deleted)return new lL(NS());{const o=_L(e,this._appId,r,i,n,this._firebaseVersion,s,this._isUsingEmulator);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}async makeRequestWithTokens(e,n){const[r,i]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,n,r,i).getPromise()}}const aw="@firebase/storage",lw="0.14.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const BS="storage";function cw(t,e,n){return t=Ve(t),YL(t,e,n)}function uw(t){return t=Ve(t),XL(t)}function dw(t){return t=Ve(t),ZL(t)}function Ph(t){return t=Ve(t),eV(t)}function ta(t,e){return t=Ve(t),iV(t,e)}function Wi(t=Ku(),e){t=Ve(t);const r=bi(t,BS).getImmediate({identifier:e}),i=iI("storage");return i&&oV(r,...i),r}function oV(t,e,n,r={}){sV(t,e,n,r)}function aV(t,{instanceIdentifier:e}){const n=t.getProvider("app").getImmediate(),r=t.getProvider("auth-internal"),i=t.getProvider("app-check-internal");return new gg(n,r,i,e,vs)}function lV(){Un(new Pn(BS,aV,"PUBLIC").setMultipleInstances(!0)),nn(aw,lw,""),nn(aw,lw,"esm2020")}lV();const cV={apiKey:"AIzaSyC70mGCRrjE8iOap8iTHuid8HEuyadue8Y",authDomain:"odontocloud-d92ac.firebaseapp.com",projectId:"odontocloud-d92ac",storageBucket:"odontocloud-d92ac.firebasestorage.app",messagingSenderId:"267020714981",appId:"1:267020714981:web:a44416ea83aa1d1172650c",measurementId:"G-ZMCC5CFY0C"},yg=mm(cV),uV=QI(yg),dV=mS(yg);Wi(yg);const hV="/odontocloud-react/assets/fondo.png",zS="/odontocloud-react/assets/logo.png",fV=(t,e)=>{const n={email:t,rol:e,timestamp:Date.now()};localStorage.setItem("odc_session",JSON.stringify(n))},pV=()=>{try{const t=JSON.parse(localStorage.getItem("odc_session"));return t&&Date.now()-t.timestamp<1e3*60*60*24?t:null}catch{return null}},mV=()=>{const t=am(),[e,n]=D.useState(""),[r,i]=D.useState(""),[s,o]=D.useState(""),[l,c]=D.useState(navigator.onLine);D.useEffect(()=>{const p=()=>c(!0),g=()=>c(!1);return window.addEventListener("online",p),window.addEventListener("offline",g),()=>{window.removeEventListener("online",p),window.removeEventListener("offline",g)}},[]);const u=p=>{const g=(p||"").toLowerCase();g==="administrador"?t("/dashboard_admin",{replace:!0}):g==="doctor"?t("/dashboard_doctor",{replace:!0}):g==="recepcionista"?t("/dashboard_recepcion",{replace:!0}):o("Rol no reconocido. Contacte al administrador.")},f=async p=>{if(p.preventDefault(),o(""),!l){const g=pV();g!=null&&g.rol?u(g.rol):o("Sin conexión y no hay sesión guardada.");return}try{const S=(await uN(uV,e,r)).user,v=Dt(ft(dV,"users"),vn("correo","==",e)),N=await _n(v);if(N.empty){o("Usuario no encontrado en la base de datos.");return}const I=N.docs[0].data().rol||"sin_rol";fV(e,I),u(I)}catch(g){switch(console.error("Error login:",g),g.code){case"auth/user-not-found":o("Usuario no registrado.");break;case"auth/wrong-password":o("Contraseña incorrecta.");break;case"auth/invalid-email":o("Correo no válido.");break;default:o("Error al iniciar sesión.")}}};return d.jsx("div",{className:"login-root",style:{backgroundImage:`url(${hV})`,backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",backgroundAttachment:"fixed",width:"100vw",height:"100vh",display:"flex",justifyContent:"center",alignItems:"center",overflow:"hidden"},children:d.jsxs("div",{className:"container",children:[d.jsxs("div",{className:"left-panel",children:[d.jsx("img",{src:zS,alt:"OdontoCloud Logo",className:"logo"}),d.jsxs("h2",{children:["Su clínica, ",d.jsx("br",{})," más conectada."]}),d.jsx("p",{children:"OdontoCloud optimiza cada detalle de su gestión."})]}),d.jsxs("div",{className:"right-panel",children:[d.jsx("h3",{children:"Acceso a la plataforma"}),d.jsxs("form",{onSubmit:f,children:[d.jsx("input",{type:"email",placeholder:"usuario@ejemplo.com",value:e,onChange:p=>n(p.target.value),required:!0}),d.jsx("input",{type:"password",placeholder:"Contraseña",value:r,onChange:p=>i(p.target.value),required:!0}),d.jsx("button",{type:"submit",children:"Iniciar sesión"}),s&&d.jsx("p",{style:{color:"red",marginTop:10},children:s}),!l&&d.jsx("p",{style:{color:"orange",marginTop:10},children:"⚠️ Modo offline activado"})]})]})]})})},qS="@firebase/installations",vg="0.6.19";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const HS=1e4,WS=`w:${vg}`,GS="FIS_v2",gV="https://firebaseinstallations.googleapis.com/v1",yV=60*60*1e3,vV="installations",_V="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wV={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},hs=new ys(vV,_V,wV);function KS(t){return t instanceof kn&&t.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function QS({projectId:t}){return`${gV}/projects/${t}/installations`}function YS(t){return{token:t.token,requestStatus:2,expiresIn:TV(t.expiresIn),creationTime:Date.now()}}async function XS(t,e){const r=(await e.json()).error;return hs.create("request-failed",{requestName:t,serverCode:r.code,serverMessage:r.message,serverStatus:r.status})}function JS({apiKey:t}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t})}function EV(t,{refreshToken:e}){const n=JS(t);return n.append("Authorization",IV(e)),n}async function ZS(t){const e=await t();return e.status>=500&&e.status<600?t():e}function TV(t){return Number(t.replace("s","000"))}function IV(t){return`${GS} ${t}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function SV({appConfig:t,heartbeatServiceProvider:e},{fid:n}){const r=QS(t),i=JS(t),s=e.getImmediate({optional:!0});if(s){const u=await s.getHeartbeatsHeader();u&&i.append("x-firebase-client",u)}const o={fid:n,authVersion:GS,appId:t.appId,sdkVersion:WS},l={method:"POST",headers:i,body:JSON.stringify(o)},c=await ZS(()=>fetch(r,l));if(c.ok){const u=await c.json();return{fid:u.fid||n,registrationStatus:2,refreshToken:u.refreshToken,authToken:YS(u.authToken)}}else throw await XS("Create Installation",c)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eC(t){return new Promise(e=>{setTimeout(e,t)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function CV(t){return btoa(String.fromCharCode(...t)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const AV=/^[cdef][\w-]{21}$/,cp="";function RV(){try{const t=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(t),t[0]=112+t[0]%16;const n=xV(t);return AV.test(n)?n:cp}catch{return cp}}function xV(t){return CV(t).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sd(t){return`${t.appName}!${t.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tC=new Map;function nC(t,e){const n=Sd(t);rC(n,e),PV(n,e)}function rC(t,e){const n=tC.get(t);if(n)for(const r of n)r(e)}function PV(t,e){const n=kV();n&&n.postMessage({key:t,fid:e}),NV()}let Xi=null;function kV(){return!Xi&&"BroadcastChannel"in self&&(Xi=new BroadcastChannel("[Firebase] FID Change"),Xi.onmessage=t=>{rC(t.data.key,t.data.fid)}),Xi}function NV(){tC.size===0&&Xi&&(Xi.close(),Xi=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bV="firebase-installations-database",DV=1,fs="firebase-installations-store";let kh=null;function _g(){return kh||(kh=fI(bV,DV,{upgrade:(t,e)=>{switch(e){case 0:t.createObjectStore(fs)}}})),kh}async function Au(t,e){const n=Sd(t),i=(await _g()).transaction(fs,"readwrite"),s=i.objectStore(fs),o=await s.get(n);return await s.put(e,n),await i.done,(!o||o.fid!==e.fid)&&nC(t,e.fid),e}async function iC(t){const e=Sd(t),r=(await _g()).transaction(fs,"readwrite");await r.objectStore(fs).delete(e),await r.done}async function Cd(t,e){const n=Sd(t),i=(await _g()).transaction(fs,"readwrite"),s=i.objectStore(fs),o=await s.get(n),l=e(o);return l===void 0?await s.delete(n):await s.put(l,n),await i.done,l&&(!o||o.fid!==l.fid)&&nC(t,l.fid),l}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function wg(t){let e;const n=await Cd(t.appConfig,r=>{const i=OV(r),s=LV(t,i);return e=s.registrationPromise,s.installationEntry});return n.fid===cp?{installationEntry:await e}:{installationEntry:n,registrationPromise:e}}function OV(t){const e=t||{fid:RV(),registrationStatus:0};return sC(e)}function LV(t,e){if(e.registrationStatus===0){if(!navigator.onLine){const i=Promise.reject(hs.create("app-offline"));return{installationEntry:e,registrationPromise:i}}const n={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},r=VV(t,n);return{installationEntry:n,registrationPromise:r}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:jV(t)}:{installationEntry:e}}async function VV(t,e){try{const n=await SV(t,e);return Au(t.appConfig,n)}catch(n){throw KS(n)&&n.customData.serverCode===409?await iC(t.appConfig):await Au(t.appConfig,{fid:e.fid,registrationStatus:0}),n}}async function jV(t){let e=await hw(t.appConfig);for(;e.registrationStatus===1;)await eC(100),e=await hw(t.appConfig);if(e.registrationStatus===0){const{installationEntry:n,registrationPromise:r}=await wg(t);return r||n}return e}function hw(t){return Cd(t,e=>{if(!e)throw hs.create("installation-not-found");return sC(e)})}function sC(t){return MV(t)?{fid:t.fid,registrationStatus:0}:t}function MV(t){return t.registrationStatus===1&&t.registrationTime+HS<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function FV({appConfig:t,heartbeatServiceProvider:e},n){const r=UV(t,n),i=EV(t,n),s=e.getImmediate({optional:!0});if(s){const u=await s.getHeartbeatsHeader();u&&i.append("x-firebase-client",u)}const o={installation:{sdkVersion:WS,appId:t.appId}},l={method:"POST",headers:i,body:JSON.stringify(o)},c=await ZS(()=>fetch(r,l));if(c.ok){const u=await c.json();return YS(u)}else throw await XS("Generate Auth Token",c)}function UV(t,{fid:e}){return`${QS(t)}/${e}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Eg(t,e=!1){let n;const r=await Cd(t.appConfig,s=>{if(!oC(s))throw hs.create("not-registered");const o=s.authToken;if(!e&&zV(o))return s;if(o.requestStatus===1)return n=$V(t,e),s;{if(!navigator.onLine)throw hs.create("app-offline");const l=HV(s);return n=BV(t,l),l}});return n?await n:r.authToken}async function $V(t,e){let n=await fw(t.appConfig);for(;n.authToken.requestStatus===1;)await eC(100),n=await fw(t.appConfig);const r=n.authToken;return r.requestStatus===0?Eg(t,e):r}function fw(t){return Cd(t,e=>{if(!oC(e))throw hs.create("not-registered");const n=e.authToken;return WV(n)?{...e,authToken:{requestStatus:0}}:e})}async function BV(t,e){try{const n=await FV(t,e),r={...e,authToken:n};return await Au(t.appConfig,r),n}catch(n){if(KS(n)&&(n.customData.serverCode===401||n.customData.serverCode===404))await iC(t.appConfig);else{const r={...e,authToken:{requestStatus:0}};await Au(t.appConfig,r)}throw n}}function oC(t){return t!==void 0&&t.registrationStatus===2}function zV(t){return t.requestStatus===2&&!qV(t)}function qV(t){const e=Date.now();return e<t.creationTime||t.creationTime+t.expiresIn<e+yV}function HV(t){const e={requestStatus:1,requestTime:Date.now()};return{...t,authToken:e}}function WV(t){return t.requestStatus===1&&t.requestTime+HS<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function GV(t){const e=t,{installationEntry:n,registrationPromise:r}=await wg(e);return r?r.catch(console.error):Eg(e).catch(console.error),n.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function KV(t,e=!1){const n=t;return await QV(n),(await Eg(n,e)).token}async function QV(t){const{registrationPromise:e}=await wg(t);e&&await e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function YV(t){if(!t||!t.options)throw Nh("App Configuration");if(!t.name)throw Nh("App Name");const e=["projectId","apiKey","appId"];for(const n of e)if(!t.options[n])throw Nh(n);return{appName:t.name,projectId:t.options.projectId,apiKey:t.options.apiKey,appId:t.options.appId}}function Nh(t){return hs.create("missing-app-config-values",{valueName:t})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const aC="installations",XV="installations-internal",JV=t=>{const e=t.getProvider("app").getImmediate(),n=YV(e),r=bi(e,"heartbeat");return{app:e,appConfig:n,heartbeatServiceProvider:r,_delete:()=>Promise.resolve()}},ZV=t=>{const e=t.getProvider("app").getImmediate(),n=bi(e,aC).getImmediate();return{getId:()=>GV(n),getToken:i=>KV(n,i)}};function ej(){Un(new Pn(aC,JV,"PUBLIC")),Un(new Pn(XV,ZV,"PRIVATE"))}ej();nn(qS,vg);nn(qS,vg,"esm2020");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ru="analytics",tj="firebase_id",nj="origin",rj=60*1e3,ij="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig",Tg="https://www.googletagmanager.com/gtag/js";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qt=new Gu("@firebase/analytics");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sj={"already-exists":"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.","already-initialized":"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.","already-initialized-settings":"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.","interop-component-reg-failed":"Firebase Analytics Interop Component failed to instantiate: {$reason}","invalid-analytics-context":"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","indexeddb-unavailable":"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","fetch-throttle":"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.","config-fetch-failed":"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}","no-api-key":'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',"no-app-id":'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',"no-client-id":'The "client_id" field is empty.',"invalid-gtag-resource":"Trusted Types detected an invalid gtag resource: {$gtagURL}."},hn=new ys("analytics","Analytics",sj);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oj(t){if(!t.startsWith(Tg)){const e=hn.create("invalid-gtag-resource",{gtagURL:t});return qt.warn(e.message),""}return t}function lC(t){return Promise.all(t.map(e=>e.catch(n=>n)))}function aj(t,e){let n;return window.trustedTypes&&(n=window.trustedTypes.createPolicy(t,e)),n}function lj(t,e){const n=aj("firebase-js-sdk-policy",{createScriptURL:oj}),r=document.createElement("script"),i=`${Tg}?l=${t}&id=${e}`;r.src=n?n==null?void 0:n.createScriptURL(i):i,r.async=!0,document.head.appendChild(r)}function cj(t){let e=[];return Array.isArray(window[t])?e=window[t]:window[t]=e,e}async function uj(t,e,n,r,i,s){const o=r[i];try{if(o)await e[o];else{const c=(await lC(n)).find(u=>u.measurementId===i);c&&await e[c.appId]}}catch(l){qt.error(l)}t("config",i,s)}async function dj(t,e,n,r,i){try{let s=[];if(i&&i.send_to){let o=i.send_to;Array.isArray(o)||(o=[o]);const l=await lC(n);for(const c of o){const u=l.find(p=>p.measurementId===c),f=u&&e[u.appId];if(f)s.push(f);else{s=[];break}}}s.length===0&&(s=Object.values(e)),await Promise.all(s),t("event",r,i||{})}catch(s){qt.error(s)}}function hj(t,e,n,r){async function i(s,...o){try{if(s==="event"){const[l,c]=o;await dj(t,e,n,l,c)}else if(s==="config"){const[l,c]=o;await uj(t,e,n,r,l,c)}else if(s==="consent"){const[l,c]=o;t("consent",l,c)}else if(s==="get"){const[l,c,u]=o;t("get",l,c,u)}else if(s==="set"){const[l]=o;t("set",l)}else t(s,...o)}catch(l){qt.error(l)}}return i}function fj(t,e,n,r,i){let s=function(...o){window[r].push(arguments)};return window[i]&&typeof window[i]=="function"&&(s=window[i]),window[i]=hj(s,t,e,n),{gtagCore:s,wrappedGtag:window[i]}}function pj(t){const e=window.document.getElementsByTagName("script");for(const n of Object.values(e))if(n.src&&n.src.includes(Tg)&&n.src.includes(t))return n;return null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mj=30,gj=1e3;class yj{constructor(e={},n=gj){this.throttleMetadata=e,this.intervalMillis=n}getThrottleMetadata(e){return this.throttleMetadata[e]}setThrottleMetadata(e,n){this.throttleMetadata[e]=n}deleteThrottleMetadata(e){delete this.throttleMetadata[e]}}const cC=new yj;function vj(t){return new Headers({Accept:"application/json","x-goog-api-key":t})}async function _j(t){var o;const{appId:e,apiKey:n}=t,r={method:"GET",headers:vj(n)},i=ij.replace("{app-id}",e),s=await fetch(i,r);if(s.status!==200&&s.status!==304){let l="";try{const c=await s.json();(o=c.error)!=null&&o.message&&(l=c.error.message)}catch{}throw hn.create("config-fetch-failed",{httpStatus:s.status,responseMessage:l})}return s.json()}async function wj(t,e=cC,n){const{appId:r,apiKey:i,measurementId:s}=t.options;if(!r)throw hn.create("no-app-id");if(!i){if(s)return{measurementId:s,appId:r};throw hn.create("no-api-key")}const o=e.getThrottleMetadata(r)||{backoffCount:0,throttleEndTimeMillis:Date.now()},l=new Ij;return setTimeout(async()=>{l.abort()},rj),uC({appId:r,apiKey:i,measurementId:s},o,l,e)}async function uC(t,{throttleEndTimeMillis:e,backoffCount:n},r,i=cC){var l;const{appId:s,measurementId:o}=t;try{await Ej(r,e)}catch(c){if(o)return qt.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${o} provided in the "measurementId" field in the local Firebase config. [${c==null?void 0:c.message}]`),{appId:s,measurementId:o};throw c}try{const c=await _j(t);return i.deleteThrottleMetadata(s),c}catch(c){const u=c;if(!Tj(u)){if(i.deleteThrottleMetadata(s),o)return qt.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${o} provided in the "measurementId" field in the local Firebase config. [${u==null?void 0:u.message}]`),{appId:s,measurementId:o};throw c}const f=Number((l=u==null?void 0:u.customData)==null?void 0:l.httpStatus)===503?Rv(n,i.intervalMillis,mj):Rv(n,i.intervalMillis),p={throttleEndTimeMillis:Date.now()+f,backoffCount:n+1};return i.setThrottleMetadata(s,p),qt.debug(`Calling attemptFetch again in ${f} millis`),uC(t,p,r,i)}}function Ej(t,e){return new Promise((n,r)=>{const i=Math.max(e-Date.now(),0),s=setTimeout(n,i);t.addEventListener(()=>{clearTimeout(s),r(hn.create("fetch-throttle",{throttleEndTimeMillis:e}))})})}function Tj(t){if(!(t instanceof kn)||!t.customData)return!1;const e=Number(t.customData.httpStatus);return e===429||e===500||e===503||e===504}class Ij{constructor(){this.listeners=[]}addEventListener(e){this.listeners.push(e)}abort(){this.listeners.forEach(e=>e())}}async function Sj(t,e,n,r,i){if(i&&i.global){t("event",n,r);return}else{const s=await e,o={...r,send_to:s};t("event",n,o)}}async function Cj(t,e,n,r){if(r&&r.global){const i={};for(const s of Object.keys(n))i[`user_properties.${s}`]=n[s];return t("set",i),Promise.resolve()}else{const i=await e;t("config",i,{update:!0,user_properties:n})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Aj(){if(cI())try{await uI()}catch(t){return qt.warn(hn.create("indexeddb-unavailable",{errorInfo:t==null?void 0:t.toString()}).message),!1}else return qt.warn(hn.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;return!0}async function Rj(t,e,n,r,i,s,o){const l=wj(t);l.then(g=>{n[g.measurementId]=g.appId,t.options.measurementId&&g.measurementId!==t.options.measurementId&&qt.warn(`The measurement ID in the local Firebase config (${t.options.measurementId}) does not match the measurement ID fetched from the server (${g.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(g=>qt.error(g)),e.push(l);const c=Aj().then(g=>{if(g)return r.getId()}),[u,f]=await Promise.all([l,c]);pj(s)||lj(s,u.measurementId),i("js",new Date);const p=(o==null?void 0:o.config)??{};return p[nj]="firebase",p.update=!0,f!=null&&(p[tj]=f),i("config",u.measurementId,p),u.measurementId}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xj{constructor(e){this.app=e}_delete(){return delete ro[this.app.options.appId],Promise.resolve()}}let ro={},pw=[];const mw={};let bh="dataLayer",Pj="gtag",gw,Ig,yw=!1;function kj(){const t=[];if(lI()&&t.push("This is a browser extension environment."),W1()||t.push("Cookies are not available."),t.length>0){const e=t.map((r,i)=>`(${i+1}) ${r}`).join(" "),n=hn.create("invalid-analytics-context",{errorInfo:e});qt.warn(n.message)}}function Nj(t,e,n){kj();const r=t.options.appId;if(!r)throw hn.create("no-app-id");if(!t.options.apiKey)if(t.options.measurementId)qt.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${t.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);else throw hn.create("no-api-key");if(ro[r]!=null)throw hn.create("already-exists",{id:r});if(!yw){cj(bh);const{wrappedGtag:s,gtagCore:o}=fj(ro,pw,mw,bh,Pj);Ig=s,gw=o,yw=!0}return ro[r]=Rj(t,pw,mw,e,gw,bh,n),new xj(t)}function bj(t=Ku()){t=Ve(t);const e=bi(t,Ru);return e.isInitialized()?e.getImmediate():Dj(t)}function Dj(t,e={}){const n=bi(t,Ru);if(n.isInitialized()){const i=n.getImmediate();if(Pr(e,n.getOptions()))return i;throw hn.create("already-initialized")}return n.initialize({options:e})}function Oj(t,e,n){t=Ve(t),Cj(Ig,ro[t.app.options.appId],e,n).catch(r=>qt.error(r))}function Lj(t,e,n,r){t=Ve(t),Sj(Ig,ro[t.app.options.appId],e,n,r).catch(i=>qt.error(i))}const vw="@firebase/analytics",_w="0.10.19";function Vj(){Un(new Pn(Ru,(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("installations-internal").getImmediate();return Nj(r,i,n)},"PUBLIC")),Un(new Pn("analytics-internal",t,"PRIVATE")),nn(vw,_w),nn(vw,_w,"esm2020");function t(e){try{const n=e.getProvider(Ru).getImmediate();return{logEvent:(r,i,s)=>Lj(n,r,i,s),setUserProperties:(r,i)=>Oj(n,r,i)}}catch(n){throw hn.create("interop-component-reg-failed",{reason:n})}}}Vj();const jj={apiKey:"AIzaSyC70mGCRrjE8iOap8iTHuid8HEuyadue8Y",authDomain:"odontocloud-d92ac.firebaseapp.com",projectId:"odontocloud-d92ac",storageBucket:"odontocloud-d92ac.firebasestorage.app",messagingSenderId:"267020714981",appId:"1:267020714981:web:a44416ea83aa1d1172650c",measurementId:"G-ZMCC5CFY0C"},Ad=mm(jj),ww=QI(Ad),xe=mS(Ad);Wi(Ad);bj(Ad);const Dh="TU EMPRESA S.A.S.",Mj="Generado por OdontoCloud",ac=()=>{const t=new Date;return t.setHours(0,0,0,0),t},Bi=t=>{const e=new Date(t);return e.setHours(0,0,0,0),e},Oh=t=>{const e=new Date(t);return e.setHours(23,59,59,999),e},Yn=(t,e)=>{const n=new Date(t);return n.setDate(n.getDate()+e),n},Ew=t=>{const e=new Date(t),n=e.getDay(),r=(n===0?-6:1)-n;return e.setDate(e.getDate()+r),e.setHours(0,0,0,0),e},Tw=(t,e)=>t.getFullYear()===e.getFullYear()&&t.getMonth()===e.getMonth()&&t.getDate()===e.getDate();var Sw;const Gt=typeof navigator<"u"&&((Sw=navigator.language)!=null&&Sw.startsWith("es"))?"es-ES":"en-US",Lh=t=>{const e=t.getFullYear(),n=String(t.getMonth()+1).padStart(2,"0"),r=String(t.getDate()).padStart(2,"0");return`${e}-${n}-${r}`},As=t=>(t||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();function Fj(){const[t,e]=D.useState("day"),[n,r]=D.useState(ac()),[i,s]=D.useState(ac()),[o,l]=D.useState(!0),[c,u]=D.useState([]),[f,p]=D.useState(""),[g,S]=D.useState(""),[v,N]=D.useState("");D.useEffect(()=>{l(!0);const F=ft(xe,"citas"),H=Dt(F,si("fecha","asc")),z=Ra(H,Q=>{const J=Q.docs.map(ie=>{const K=ie.data(),ce=K.horaInicio||K.hora||"00:00",[Se="0",Ce="0"]=ce.split(":"),Fe=parseInt(Se,10)||0,be=parseInt(Ce,10)||0;let Ge;if(K.fecha&&K.fecha.toDate)Ge=K.fecha.toDate(),Ge.setHours(Fe,be,0,0);else if(typeof K.fecha=="string"){const[j,X,fe]=K.fecha.split("-");Ge=new Date(parseInt(j,10),parseInt(X,10)-1,parseInt(fe,10),Fe,be,0,0)}else K.fecha instanceof Date?(Ge=new Date(K.fecha),Ge.setHours(Fe,be,0,0)):(Ge=new Date,Ge.setHours(Fe,be,0,0));const he=K.documentoPaciente||K.docPaciente||K.pacienteDocumento||K.documento||"",w=K.celularPaciente||K.telefonoPaciente||K.celular||K.telefono||"";return{id:ie.id,raw:K,fecha:Ge,horaInicio:ce,paciente:K.paciente||K.pacienteNombre||"Sin nombre",doctor:K.doctor||K.doctorNombre||"—",sucursal:K.sucursal||"",espacio:K.espacio||K.consultorio||"",comentario:K.comentario||"",estado:K.estado||"En espera",recordatorio:K.recordatorio||"",documento:he,telefono:w}});let re,te;if(t==="day")re=Bi(n),te=Oh(n);else if(t==="week"){const ie=Ew(n),K=Yn(ie,6);re=Bi(ie),te=Oh(K)}else{const ie=Bi(n),K=Yn(ie,-30),ce=Yn(ie,60);re=Bi(K),te=Oh(ce)}const ge=J.filter(ie=>ie.fecha>=re&&ie.fecha<=te);u(ge),l(!1)},Q=>{console.error("Error leyendo citas:",Q),u([]),l(!1)});return()=>z()},[t,n]);const b=D.useMemo(()=>{const F=new Set;return c.forEach(H=>H.sucursal&&F.add(H.sucursal)),Array.from(F)},[c]),I=D.useMemo(()=>{const F=new Set;return c.forEach(H=>H.doctor&&F.add(H.doctor)),Array.from(F)},[c]),E=D.useMemo(()=>{const F=v.trim().toLowerCase();return c.filter(H=>{if(f&&H.sucursal!==f||g&&H.doctor!==g)return!1;if(!F)return!0;const z=[H.paciente,H.doctor,H.comentario,H.documento,H.sucursal,H.espacio,H.estado],Q=H.raw?JSON.stringify(H.raw):"";return[...z,Q].filter(Boolean).some(re=>String(re).toLowerCase().includes(F))})},[c,f,g,v]),y=D.useMemo(()=>o?"Ocupación: cargando...":E.length===0?"Ocupación: sin citas para el rango seleccionado.":`Ocupación: ${E.length} cita${E.length!==1?"s":""} en el rango actual.`,[E,o]),L=D.useMemo(()=>{const F=new Date(i.getFullYear(),i.getMonth(),1),H=(F.getDay()+6)%7,z=new Date(F);z.setDate(z.getDate()-H);const Q=[];for(let J=0;J<6;J++){const re=[];for(let te=0;te<7;te++){const ge=new Date(z),ie=ge.getMonth()===i.getMonth(),K=Tw(ge,ac()),ce=Tw(ge,n);re.push({date:ge,isCurrentMonth:ie,isToday:K,isSelected:ce}),z.setDate(z.getDate()+1)}Q.push(re)}return Q},[i,n]),$=()=>{const F=new Date(i);F.setMonth(F.getMonth()-1),s(F)},B=()=>{const F=new Date(i);F.setMonth(F.getMonth()+1),s(F)},C=F=>{r(Bi(F)),s(Bi(F)),e("day")},T=D.useMemo(()=>i.toLocaleDateString(Gt,{month:"long",year:"numeric"}),[i]),A=D.useMemo(()=>{if(t==="day")return n.toLocaleDateString(Gt,{weekday:"long",day:"2-digit",month:"long",year:"numeric"});if(t==="week"){const F=Ew(n),H=Yn(F,6);return F.toLocaleDateString(Gt,{day:"2-digit",month:"short"})+" - "+H.toLocaleDateString(Gt,{day:"2-digit",month:"short",year:"numeric"})}return"Últimas citas (detalle)"},[t,n]),x=()=>{r(t==="day"?Yn(n,-1):t==="week"?Yn(n,-7):Yn(n,-1))},P=()=>{r(t==="day"?Yn(n,1):t==="week"?Yn(n,7):Yn(n,1))},k=()=>{const F=ac();r(F),s(F),e("day")},R=()=>{var Se,Ce,Fe;const F=be=>String(be??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),H=((Se=document.querySelector('meta[name="company-name"]'))==null?void 0:Se.getAttribute("content"))||Dh,z=((Ce=document.querySelector('meta[name="company-logo"]'))==null?void 0:Ce.getAttribute("content"))||"",Q="Generado por OdontoCloud",J=E.length===0?'<tr><td colspan="6" style="padding:8px 6px;color:#6b7280">No hay citas registradas para este rango.</td></tr>':E.map(be=>{const Ge=be.fecha.toLocaleDateString(Gt),he=be.fecha.toLocaleTimeString(Gt,{hour:"2-digit",minute:"2-digit",hour12:!0});return`<tr>
              <td>${F(Ge)}</td>
              <td>${F(he)}</td>
              <td>${F(be.paciente)}</td>
              <td>${F(be.doctor)}</td>
              <td>${F(be.espacio)}</td>
              <td>${F(be.comentario)}</td>
            </tr>`}).join(""),te=`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Imprimir – ${F(H)}</title>
  <style>
    @page { size: A4 portrait; margin: 18mm; }
    body { font-family: Segoe UI, Roboto, Arial, sans-serif; color:#0f172a; }
    .hdr { display:flex; align-items:center; gap:12px; border-bottom:2px solid #e5e7eb; padding-bottom:8px; margin-bottom:12px; }
    .brand { font-size:18px; font-weight:700; color:#0a86d8; line-height:1.1; }
    .sub { font-size:12px; color:#6b7280; }
    table { width:100%; border-collapse:collapse; font-size:12px; }
    th { text-align:left; background:#f3f4f6; border-bottom:1px solid #e5e7eb; padding:8px 6px; }
    td { border-bottom:1px solid #f1f5f9; padding:7px 6px; vertical-align:top; }
    .note { margin-top:8px; font-size:10px; color:#9ca3af; }
    tr, .hdr { page-break-inside: avoid; }
  </style>
</head>
<body>
  <div class="hdr">
    ${z?`<img src="${z}" alt="Logo" style="height:36px;object-fit:contain">`:""}
    <div>
      <div class="brand">${F(H)}</div>
      <div class="sub">Agenda de citas · ${F(A)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:18%">Fecha</th>
        <th style="width:10%">Hora</th>
        <th style="width:22%">Paciente</th>
        <th style="width:20%">Doctor</th>
        <th style="width:15%">Espacio</th>
        <th>Comentario</th>
      </tr>
    </thead>
    <tbody>${J}</tbody>
  </table>

  <div class="note">${F(Q)}. ${F(new Date().toLocaleString(Gt))}</div>
  <script>
    // Imprimir cuando termine de cargar la pestaña (incluye el logo)
    window.addEventListener('load', function() {
      try { window.focus(); window.print(); } catch (e) {}
    });
  <\/script>
</body>
</html>`,ge=new Blob([te],{type:"text/html;charset=utf-8"}),ie=URL.createObjectURL(ge),K=window.open(ie,"_blank","noopener,noreferrer,width=900,height=700");if(!K){alert("El navegador bloqueó la ventana de impresión. Permite pop-ups para este sitio."),URL.revokeObjectURL(ie);return}const ce=()=>{try{URL.revokeObjectURL(ie)}catch{}};(Fe=K.addEventListener)==null||Fe.call(K,"load",ce),setTimeout(ce,15e3)},$e=()=>alert("Función de confirmar citas se integrará con n8n / correo."),Et=()=>k(),yn=()=>{if(E.length===0){alert("No hay citas para exportar.");return}const F=[`Empresa: ${Dh}`],H=["Fecha","Hora","Paciente","Doctor","Espacio","Comentario"],z=E.map(K=>{const ce=K.fecha.toLocaleDateString(Gt),Se=K.fecha.toLocaleTimeString(Gt,{hour:"2-digit",minute:"2-digit",hour12:!0});return[ce,Se,K.paciente||"",K.doctor||"",K.espacio||"",(K.comentario||"").replace(/\r?\n/g," ")]}),Q=[Mj],J=[F,[],H,...z,[],Q].map(K=>(K||[]).map(ce=>`"${String(ce??"").replace(/"/g,'""')}"`).join(",")).join(`
`),re=`citas_${Dh.toLowerCase().replace(/\s+/g,"_")}_${Lh(Bi(n))}`+(t==="week"?"_semana":t==="detail"?"_detalle":"")+".csv",te=new Blob(["\uFEFF"+J],{type:"text/csv;charset=utf-8;"}),ge=URL.createObjectURL(te),ie=document.createElement("a");ie.href=ge,ie.download=re,ie.click(),URL.revokeObjectURL(ge)},Nn=async(F,H)=>{try{const z=Yt(xe,"citas",F);await op(z,{estado:H})}catch(z){console.error("Error actualizando estado:",z),alert("No se pudo actualizar el estado de la cita.")}},Y=(F,H)=>{if(!F){alert("Este paciente no tiene celular registrado.");return}const z=String(F).replace(/\D/g,""),Q=H.fecha.toLocaleDateString(Gt),J=H.fecha.toLocaleTimeString(Gt,{hour:"numeric",minute:"2-digit",hour12:!0}),re=encodeURIComponent(`Hola ${H.paciente}, le recordamos su cita odontológica el ${Q} a las ${J}. Por favor confirme su asistencia.`),te=`https://wa.me/${z}?text=${re}`;window.open(te,"_blank")},se=async F=>{if(window.confirm(`¿Seguro que deseas eliminar la cita de ${F.paciente} del ${F.fecha.toLocaleDateString(Gt)}?`))try{const z=Yt(xe,"citas",F.id);await RS(z)}catch(z){console.error("Error eliminando cita:",z),alert("❌ No se pudo eliminar la cita.")}},oe=()=>{const F=document.createElement("div");Object.assign(F.style,{position:"fixed",top:"0",left:"0",width:"100%",height:"100%",background:"rgba(0,0,0,0.55)",display:"flex",justifyContent:"center",alignItems:"center",zIndex:"9999"});const H=document.createElement("div");Object.assign(H.style,{background:"#fff",padding:"25px 30px",borderRadius:"14px",width:"520px",maxWidth:"95%",maxHeight:"95%",overflowY:"auto",boxShadow:"0 8px 30px rgba(0,0,0,0.3)",fontFamily:"Segoe UI, Roboto, sans-serif"}),H.innerHTML=`
      <h2 style="margin-top:0;text-align:center;color:#0a86d8;font-weight:600;">🗓️ Nueva Cita</h2>
      <form id="formNuevaCita" style="display:flex;flex-direction:column;gap:12px;margin-top:10px;">
        <label style="font-weight:600;">Paciente existente</label>
        <div style="position:relative;">
          <input type="text" id="buscarPaciente" placeholder="Buscar por nombre, apellido o documento..." autocomplete="off"/>
          <div id="acResultados" style="position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:10000;display:none;background:#fff;border:1px solid #ddd;border-radius:8px;box-shadow:0 8px 22px rgba(0,0,0,.12);max-height:240px;overflow:auto;"></div>
        </div>
        <small style="color:gray;">Si el paciente no existe, marca “Registrar nuevo paciente”.</small>

        <label style="display:flex;align-items:center;gap:8px;margin-top:5px;">
          <input type="checkbox" id="esNuevoPaciente" />
          <span>Registrar nuevo paciente</span>
        </label>

        <div id="nuevoPacienteCampos" style="display:none;flex-direction:column;gap:8px;margin-top:10px;padding:10px;border-radius:8px;background:#f9f9f9;border:1px solid #ddd;">
          <h4 style="margin:0;text-align:center;color:#0a86d8;">Datos del paciente</h4>
          <div style="display:flex;gap:8px;">
            <input type="text" id="npNombre" placeholder="Nombre" style="flex:1;" />
            <input type="text" id="npApellido" placeholder="Apellido" style="flex:1;" />
          </div>
          <select id="npTipoDocumento">
            <option value="">Tipo de documento</option>
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="CE">Cédula de Extranjería</option>
            <option value="TI">Tarjeta de Identidad</option>
            <option value="PA">Pasaporte</option>
            <option value="DI">Documento Internacional</option>
            <option value="OTRO">Otro</option>
          </select>
          <input type="text" id="npDocumento" placeholder="Número de documento" />
          <input type="email" id="npCorreo" placeholder="Correo electrónico" />
          <div style="display:flex;gap:5px;">
            <select id="npIndicativo" style="width:40%;">
              <option value="+57">🇨🇴 +57</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+34">🇪🇸 +34</option>
              <option value="+52">🇲🇽 +52</option>
              <option value="+54">🇦🇷 +54</option>
              <option value="+593">🇪🇨 +593</option>
              <option value="+56">🇨🇱 +56</option>
              <option value="+58">🇻🇪 +58</option>
            </select>
            <input type="tel" id="npCelular" placeholder="Celular (obligatorio)" style="flex:1;" />
          </div>
          <input type="tel" id="npTelefono" placeholder="Teléfono fijo (opcional)" />
          <label style="font-weight:500;">Fecha de nacimiento:</label>
          <input type="date" id="npNacimiento" />
          <select id="npSexo">
            <option value="">Sexo</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
          <textarea id="npComentario" placeholder="Comentario o antecedentes del paciente" rows="2"></textarea>
        </div>

        <hr style="margin:10px 0;border:none;border-top:1px solid #ddd;" />
        <h4 style="margin:0;text-align:center;color:#0a86d8;">Detalles de la cita</h4>
        <input type="text" id="ncDoctor" placeholder="Doctor asignado" required />
        <input type="date" id="ncFecha" required value="${Lh(n)}" />
        <input type="time" id="ncHora" required />
        <input type="text" id="ncEspacio" placeholder="Espacio físico / Sala" />
        <textarea id="ncComentario" placeholder="Comentario sobre la cita" rows="3"></textarea>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
          <button type="button" id="btnCancelarModal" class="btn-cancelar">Cancelar</button>
          <button type="submit" class="btn-guardar">Guardar</button>
        </div>
      </form>
    `;const z=document.createElement("style");z.textContent=`
      .btn-cancelar, .btn-guardar { padding: 8px 14px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px; transition: .2s; }
      .btn-cancelar { background: #e0e0e0; color: #333; } .btn-cancelar:hover { background: #d5d5d5; }
      .btn-guardar { background: #0a86d8; color: white; } .btn-guardar:hover { background: #0669ac; }
      input, select, textarea { width: 100%; padding: 8px 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; outline: none; }
      input:focus, select:focus, textarea:focus { border-color: #0a86d8; box-shadow: 0 0 0 2px rgba(10,134,216,.2); }
      .ac-item { padding: 8px 10px; display:flex; gap:8px; align-items:baseline; cursor:pointer; }
      .ac-item:hover, .ac-item.active { background:#f5f7fb; }
      .ac-name { font-weight:600; } .ac-doc { color:#64748b; font-size:12px; } .ac-tel { margin-left:auto; font-size:12px; color:#0f172a; }
      .ac-empty { padding:10px; color:#9aa4b2; font-size:13px; }
    `,document.head.appendChild(z),F.appendChild(H),document.body.appendChild(F);const Q=H.querySelector("#esNuevoPaciente"),J=H.querySelector("#nuevoPacienteCampos"),re=H.querySelector("#buscarPaciente"),te=H.querySelector("#acResultados");Q.addEventListener("change",()=>{J.style.display=Q.checked?"flex":"none",Q.checked&&(te.style.display="none")}),H.querySelector("#btnCancelarModal").addEventListener("click",()=>F.remove());let ge=null,ie=null,K=-1,ce=[];const Se=w=>{if(ce=w||[],K=-1,!w||w.length===0){te.innerHTML='<div class="ac-empty">Sin resultados</div>',te.style.display="block";return}te.innerHTML=w.map((j,X)=>`
            <div class="ac-item" data-index="${X}" data-id="${j.id}">
              <span class="ac-name">${j.nombre}</span>
              <span class="ac-doc">· ${j.documento||"s/doc"}</span>
              <span class="ac-tel">${j.celular||j.telefono||""}</span>
            </div>`).join(""),te.style.display="block",[...te.querySelectorAll(".ac-item")].forEach(j=>{j.addEventListener("click",()=>{const X=Number(j.getAttribute("data-index"));Ce(X)})})},Ce=w=>{const j=ce[w];j&&(ie=j,re.value=j.nombre,te.style.display="none",Q.checked=!1,J.style.display="none")},Fe=w=>{ce.length&&(K=(K+w+ce.length)%ce.length,[...te.querySelectorAll(".ac-item")].forEach((j,X)=>{X===K?j.classList.add("active"):j.classList.remove("active")}))},be=(w,j)=>w.nombreCompleto||w.paciente||[w.nombres,w.apellidos].filter(Boolean).join(" ")||j,Ge=async w=>{const j=(w||"").toString().trim(),X=As(j);if(!X||X.length<2)return[];if(/^\d{5,}$/.test(j))try{const fe=Dt(ft(xe,"pacientes"),vn("documento","==",j)),ye=Dt(ft(xe,"pacientes"),vn("nroDocumento","==",j)),[ve,at]=await Promise.all([_n(fe),_n(ye)]),Te=ve.empty?at:ve;if(!Te.empty)return Te.docs.slice(0,10).map(Ke=>{const Re=Ke.data()||{};return{id:Ke.id,nombre:be(Re,Ke.id),documento:Re.documento||Re.nroDocumento||Ke.id,celular:Re.celularPaciente||Re.celular||"",telefono:Re.telefonoPaciente||Re.telefono||""}})}catch{}try{const fe=Dt(ft(xe,"pacientes"),si("nombre_busqueda"),Z_(X),ew(X+""),no(10)),ye=await _n(fe);if(!ye.empty)return ye.docs.map(ve=>{const at=ve.data()||{};return{id:ve.id,nombre:be(at,ve.id),documento:at.documento||at.nroDocumento||ve.id,celular:at.celularPaciente||at.celular||"",telefono:at.telefonoPaciente||at.telefono||""}})}catch{}try{const fe=Dt(ft(xe,"pacientes"),si("creado","desc"),no(50));return(await _n(fe)).docs.map(Te=>({id:Te.id,...Te.data()||{}})).map(Te=>({id:Te.id,nombre:be(Te,Te.id),documento:Te.documento||Te.nroDocumento||Te.id,celular:Te.celularPaciente||Te.celular||"",telefono:Te.telefonoPaciente||Te.telefono||"",_norm:As(`${Te.nombreCompleto||Te.paciente||""} ${Te.nombres||""} ${Te.apellidos||""} ${Te.documento||Te.nroDocumento||""}`)})).filter(Te=>Te._norm.includes(X)).slice(0,10).map(({_norm:Te,...Ke})=>Ke)}catch{}return[]};re.addEventListener("input",()=>{ie=null;const w=re.value;if(clearTimeout(ge),!w||w.trim().length<2){te.style.display="none";return}ge=setTimeout(async()=>{const j=await Ge(w.trim());Se(j)},220)}),re.addEventListener("keydown",w=>{te.style.display==="block"&&(w.key==="ArrowDown"?(w.preventDefault(),Fe(1)):w.key==="ArrowUp"?(w.preventDefault(),Fe(-1)):w.key==="Enter"?K>=0&&(w.preventDefault(),Ce(K)):w.key==="Escape"&&(te.style.display="none"))}),document.addEventListener("click",w=>{H.contains(w.target)&&!te.contains(w.target)&&w.target!==re&&(te.style.display="none")},{capture:!0});const he=H.querySelector("#formNuevaCita");he.addEventListener("submit",async w=>{w.preventDefault();const j=Q.checked,X=(he.querySelector("#buscarPaciente").value||"").trim(),fe=he.querySelector("#ncDoctor").value.trim(),ye=he.querySelector("#ncFecha").value,ve=he.querySelector("#ncHora").value,at=he.querySelector("#ncEspacio").value.trim(),Te=he.querySelector("#ncComentario").value.trim();if(!ye||!ve){alert("⚠️ Debes seleccionar fecha y hora para la cita.");return}if(!fe){alert("⚠️ Indica el doctor asignado.");return}try{let Ke=null,Re=null,it="",xt="",rn="";if(j){const sn=(he.querySelector("#npNombre").value||"").trim(),Vr=(he.querySelector("#npApellido").value||"").trim();if(it=`${sn} ${Vr}`.trim(),!it){alert("⚠️ Debes indicar nombre y apellido para el nuevo paciente.");return}const Hn=(he.querySelector("#npDocumento").value||"").trim(),pr=(he.querySelector("#npCelular").value||"").trim(),on=(he.querySelector("#npTelefono").value||"").trim();if(!pr&&!on){alert("⚠️ Debes registrar al menos un teléfono (celular o fijo) del paciente o de un acudiente.");return}if(Ke=Hn||it.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"_"),Re=Yt(xe,"pacientes",Ke),!(await Su(Re)).exists()){const De=As(it);await Cu(Re,{nombres:sn,apellidos:Vr,nombreCompleto:it,paciente:it,nombre_busqueda:De,variantes_busqueda:[De,As(sn),As(Vr)],tipoDocumento:he.querySelector("#npTipoDocumento").value,documento:Hn,correo:(he.querySelector("#npCorreo").value||"").trim(),indicativo:he.querySelector("#npIndicativo").value,celular:pr,telefono:on,celularPaciente:pr,telefonoPaciente:on,fechaNacimiento:he.querySelector("#npNacimiento").value,sexo:he.querySelector("#npSexo").value,notas:(he.querySelector("#npComentario").value||"").trim(),creado:new Date().toISOString(),activo:!0,citas:[]},{merge:!0})}xt=pr,rn=on}else if(ie)Ke=ie.id,it=ie.nombre,Re=Yt(xe,"pacientes",Ke),xt=ie.celular||"",rn=ie.telefono||"";else{if(!X){alert("⚠️ Por favor, escribe o selecciona un paciente.");return}const sn=Dt(ft(xe,"pacientes"),vn("documento","==",X)),Vr=Dt(ft(xe,"pacientes"),vn("nroDocumento","==",X)),[Hn,pr]=await Promise.all([_n(sn),_n(Vr)]),on=Hn.empty?pr:Hn;if(on.empty){let Mt=null;try{const De=As(X),Sl=Dt(ft(xe,"pacientes"),si("nombre_busqueda"),Z_(De),ew(De+""),no(1)),jr=await _n(Sl);if(!jr.empty){const mr=jr.docs[0],Wn=mr.data()||{};Mt={id:mr.id,ref:mr.ref,nombre:Wn.nombreCompleto||Wn.paciente||[Wn.nombres,Wn.apellidos].filter(Boolean).join(" "),cel:Wn.celularPaciente||Wn.celular||"",tel:Wn.telefonoPaciente||Wn.telefono||""}}}catch{}Mt?(Ke=Mt.id,Re=Mt.ref,it=Mt.nombre||X,xt=Mt.cel||"",rn=Mt.tel||""):it=X}else{const Mt=on.docs[0],De=Mt.data()||{};Ke=Mt.id,Re=Mt.ref,it=De.nombreCompleto||De.paciente||[De.nombres,De.apellidos].filter(Boolean).join(" ")||X,xt=De.celularPaciente||De.celular||"",rn=De.telefonoPaciente||De.telefono||""}}if(!(xt||rn||"").trim()){alert("⚠️ Este paciente no tiene ningún teléfono registrado. Edita sus datos y agrega un número antes de guardar la cita.");return}const fr={paciente:it||"Paciente",pacienteId:Ke||null,doctor:fe,fecha:ye,horaInicio:ve,espacio:at,comentario:Te,estado:"En espera",creado:new Date().toISOString(),celularPaciente:xt||"",telefonoPaciente:rn||""},Do=await BO(ft(xe,"citas"),fr);Re&&await Cu(Re,{citas:HO(Do.id)},{merge:!0}),alert("✅ Cita registrada correctamente y vinculada al paciente."),F.remove()}catch(Ke){console.error("❌ Error al guardar cita:",Ke),alert("❌ Error al guardar la cita. Revisa la consola para más detalles.")}})},ke=F=>{var ge,ie;const H=document.createElement("div");Object.assign(H.style,{position:"fixed",top:"0",left:"0",width:"100%",height:"100%",background:"rgba(0,0,0,0.55)",display:"flex",justifyContent:"center",alignItems:"center",zIndex:"9999"});const z=document.createElement("div");Object.assign(z.style,{background:"#fff",padding:"25px 30px",borderRadius:"14px",width:"520px",maxWidth:"95%",maxHeight:"95%",overflowY:"auto",boxShadow:"0 8px 30px rgba(0,0,0,0.3)",fontFamily:"Segoe UI, Roboto, sans-serif"});const Q=(ge=F.raw)!=null&&ge.fecha&&typeof F.raw.fecha=="string"?F.raw.fecha:Lh(F.fecha),J=((ie=F.raw)==null?void 0:ie.horaInicio)||F.fecha.toTimeString().slice(0,5);z.innerHTML=`
      <h2 style="margin-top:0;text-align:center;color:#0a86d8;font-weight:600;">✏️ Editar Cita</h2>
      <form id="formEditarCita" style="display:flex;flex-direction:column;gap:12px;margin-top:10px;">
        <label>Paciente</label>
        <input type="text" id="editPaciente" value="${F.paciente||""}" />

        <label>Doctor asignado</label>
        <input type="text" id="editDoctor" value="${F.doctor||""}" />

        <div style="display:flex;gap:8px;">
          <div style="flex:1;">
            <label>Fecha</label>
            <input type="date" id="editFecha" value="${Q}" />
          </div>
          <div style="flex:1;">
            <label>Hora</label>
            <input type="time" id="editHora" value="${J}" />
          </div>
        </div>

        <label>Espacio físico / Sala</label>
        <input type="text" id="editEspacio" value="${F.espacio||""}" />

        <label>Estado</label>
        <select id="editEstado" className="estado-select">
          <option value="En espera" ${F.estado==="En espera"?"selected":""}>En espera</option>
          <option value="En sala" ${F.estado==="En sala"?"selected":""}>En sala</option>
          <option value="Atendiendo" ${F.estado==="Atendiendo"?"selected":""}>Atendiendo</option>
          <option value="Finalizada" ${F.estado==="Finalizada"?"selected":""}>Finalizada</option>
          <option value="pendiente" ${F.estado==="pendiente"?"selected":""}>Pendiente</option>
          <option value="No asistió" ${F.estado==="No asistió"?"selected":""}>No asistió</option>
        </select>

        <label>Comentario</label>
        <textarea id="editComentario" rows="3">${F.comentario||""}</textarea>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
          <button type="button" id="btnCancelarEdit" className="btn-cancelar">Cancelar</button>
          <button type="submit" className="btn-guardar">Guardar cambios</button>
        </div>
      </form>
    `;const re=document.createElement("style");re.textContent=`
      .btn-cancelar, .btn-guardar { padding: 8px 14px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px; transition: .2s; }
      .btn-cancelar { background: #e0e0e0; color: #333; } .btn-cancelar:hover { background: #d5d5d5; }
      .btn-guardar { background: #0a86d8; color: white; } .btn-guardar:hover { background: #0669ac; }
      #formEditarCita input, #formEditarCita select, #formEditarCita textarea { width: 100%; padding: 8px 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; outline: none; }
      #formEditarCita input:focus, #formEditarCita select:focus, #formEditarCita textarea:focus { border-color: #0a86d8; box-shadow: 0 0 0 2px rgba(10,134,216,.2); }
    `,document.head.appendChild(re),H.appendChild(z),document.body.appendChild(H),z.querySelector("#btnCancelarEdit").addEventListener("click",()=>H.remove());const te=z.querySelector("#formEditarCita");te.addEventListener("submit",async K=>{K.preventDefault();const ce=te.querySelector("#editPaciente").value.trim(),Se=te.querySelector("#editDoctor").value.trim(),Ce=te.querySelector("#editFecha").value,Fe=te.querySelector("#editHora").value,be=te.querySelector("#editEspacio").value.trim(),Ge=te.querySelector("#editEstado").value,he=te.querySelector("#editComentario").value.trim();if(!ce)return alert("⚠️ El nombre del paciente es obligatorio.");if(!Ce||!Fe)return alert("⚠️ Debes indicar fecha y hora.");try{const w=Yt(xe,"citas",F.id);await op(w,{paciente:ce,doctor:Se,fecha:Ce,horaInicio:Fe,espacio:be,estado:Ge,comentario:he}),alert("✅ Cita actualizada correctamente."),H.remove()}catch(w){console.error("❌ Error al actualizar cita:",w),alert("❌ Error al actualizar la cita. Revisa la consola para más detalles.")}})},Ne=F=>{const H=F.fecha.toLocaleDateString(Gt),z=F.fecha.toLocaleTimeString(Gt,{hour:"numeric",minute:"2-digit",hour12:!0}),Q=`${H} · ${z}`;return d.jsxs("tr",{className:"fade-in-row",onClick:()=>ke(F),style:{cursor:"pointer"},children:[d.jsx("td",{children:Q}),d.jsx("td",{children:F.paciente}),d.jsx("td",{children:F.doctor}),d.jsx("td",{children:F.espacio}),d.jsx("td",{children:F.comentario}),d.jsx("td",{onClick:J=>{J.stopPropagation()},children:d.jsxs("select",{className:"estado-select",value:F.estado,onChange:J=>Nn(F.id,J.target.value),children:[d.jsx("option",{value:"En espera",children:"En espera"}),d.jsx("option",{value:"En sala",children:"En sala"}),d.jsx("option",{value:"Atendiendo",children:"Atendiendo"}),d.jsx("option",{value:"Finalizada",children:"Finalizada"}),d.jsx("option",{value:"pendiente",children:"Pendiente"}),d.jsx("option",{value:"No asistió",children:"No asistió"})]})}),d.jsxs("td",{className:"acciones-cell",onClick:J=>{J.stopPropagation()},children:[F.telefono?d.jsx("button",{type:"button",className:"btn-whatsapp",onClick:J=>{J.stopPropagation(),Y(F.telefono,F)},children:"WhatsApp"}):d.jsx("span",{className:"acciones-texto",children:"Sin celular"}),d.jsx("button",{type:"button",className:"btn-delete",onClick:J=>{J.stopPropagation(),se(F)},children:"Eliminar"}),F.recordatorio&&d.jsx("span",{className:"acciones-texto",children:F.recordatorio})]})]},F.id)};return d.jsxs(d.Fragment,{children:[d.jsx("div",{className:"odc-topbar-green"}),d.jsx("div",{className:"odc-topbar-blue",children:"Agenda"}),d.jsx("section",{className:"odc-agenda-root",children:d.jsxs("div",{className:"odc-agenda-inner",children:[d.jsxs("aside",{className:"odc-left","aria-label":"Panel izquierdo - calendario y filtros",children:[d.jsxs("div",{className:"odc-mini-calendar-card",role:"region","aria-label":"Mini calendario",children:[d.jsxs("div",{className:"mini-cal-header",children:[d.jsx("button",{className:"cal-arrow",id:"miniCalPrev","aria-label":"Mes anterior",onClick:$,children:"‹"}),d.jsx("div",{id:"miniCalMonthYear","aria-live":"polite",children:T}),d.jsx("button",{className:"cal-arrow",id:"miniCalNext","aria-label":"Mes siguiente",onClick:B,children:"›"})]}),d.jsxs("table",{className:"mini-month-table","aria-hidden":"false",children:[d.jsx("thead",{children:d.jsxs("tr",{children:[d.jsx("th",{children:"Lu"}),d.jsx("th",{children:"Ma"}),d.jsx("th",{children:"Mi"}),d.jsx("th",{children:"Ju"}),d.jsx("th",{children:"Vi"}),d.jsx("th",{children:"Sa"}),d.jsx("th",{children:"Do"})]})}),d.jsx("tbody",{id:"miniCalendar",children:L.map((F,H)=>d.jsx("tr",{children:F.map((z,Q)=>d.jsx("td",{className:[z.isCurrentMonth?"":"empty",z.isToday?"today":"",z.isSelected?"selected":""].filter(Boolean).join(" "),onClick:()=>z.isCurrentMonth&&C(z.date),children:z.date.getDate()},Q))},H))})]})]}),d.jsxs("div",{className:"odc-filters-card","aria-label":"Filtros de agenda",children:[d.jsx("label",{htmlFor:"filterSucursal",children:"Sucursal"}),d.jsxs("select",{id:"filterSucursal",value:f,onChange:F=>p(F.target.value),children:[d.jsx("option",{value:"",children:"— Todas —"}),b.map(F=>d.jsx("option",{value:F,children:F},F))]}),d.jsx("label",{htmlFor:"filterDoctor",children:"Doctores"}),d.jsxs("select",{id:"filterDoctor",value:g,onChange:F=>S(F.target.value),children:[d.jsx("option",{value:"",children:"— Todos —"}),I.map(F=>d.jsx("option",{value:F,children:F},F))]})]})]}),d.jsxs("main",{className:"odc-right","aria-label":"Panel principal - agenda",children:[d.jsxs("div",{className:"odc-header-bar",role:"region","aria-label":"Controles de la agenda",style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12},children:[d.jsxs("div",{className:"odc-header-left",style:{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"},children:[d.jsx("h3",{className:"odc-title",style:{marginRight:8},children:"Agenda"}),d.jsxs("div",{className:"view-buttons",role:"tablist","aria-label":"Vistas",style:{display:"flex",gap:6},children:[d.jsx("button",{className:`btn view ${t==="day"?"active":""}`,"data-view":"day",role:"tab","aria-selected":t==="day",onClick:()=>e("day"),children:"Día"}),d.jsx("button",{className:`btn view ${t==="week"?"active":""}`,"data-view":"week",role:"tab","aria-selected":t==="week",onClick:()=>e("week"),children:"Semana"}),d.jsx("button",{className:`btn view ${t==="detail"?"active":""}`,"data-view":"detail",role:"tab","aria-selected":t==="detail",onClick:()=>e("detail"),children:"Detalle"})]}),d.jsxs("div",{className:"date-nav",style:{display:"flex",alignItems:"center",gap:6,flex:"0 0 auto"},children:[d.jsx("button",{className:"btn icon",id:"btnPrev","aria-label":"Anterior",onClick:x,children:"‹"}),d.jsx("button",{className:"btn icon",id:"btnNext","aria-label":"Siguiente",onClick:P,children:"›"}),d.jsx("span",{id:"currentDateDisplay",className:"current-date","aria-live":"polite",style:{whiteSpace:"nowrap"},children:A}),d.jsx("button",{id:"btnHoy",className:"btn small",onClick:k,children:"Hoy"})]})]}),d.jsx("div",{className:"odc-header-right",style:{display:"flex",alignItems:"center",gap:8,flexShrink:0},children:d.jsxs("div",{className:"right-actions",style:{display:"flex",alignItems:"center",gap:8},children:[d.jsx("input",{id:"searchCitas",placeholder:"Buscar...",className:"search-input","aria-label":"Buscar citas",value:v,onChange:F=>N(F.target.value)}),d.jsx("button",{id:"btnNuevaCita",className:"btn green","aria-label":"Nueva cita",onClick:oe,children:"+ Nueva cita"})]})})]}),d.jsxs("div",{className:"odc-content-card",role:"region","aria-label":"Contenido agenda",children:[d.jsxs("div",{className:"tools-row",children:[d.jsx("div",{className:"tools-left",children:d.jsx("div",{id:"ocupacionInfo",className:"ocupacion-info",children:y})}),d.jsxs("div",{className:"tools-right",children:[d.jsx("button",{id:"btnPrint",className:"btn",title:"Imprimir agenda",onClick:R,children:"🖨️ Imprimir"}),d.jsx("button",{id:"btnConfirmar",className:"btn blue",title:"Confirmar citas",onClick:$e,children:"📧 Confirmar"}),d.jsx("button",{id:"btnHoyCitas",className:"btn",title:"Ver citas de hoy",onClick:Et,children:"📅 Hoy"}),d.jsx("button",{id:"btnExportar",className:"btn",title:"Exportar citas a CSV",onClick:yn,children:"📤 Exportar"})]})]}),d.jsx("div",{className:"table-wrap",role:"region","aria-label":"Lista de citas",children:d.jsxs("table",{className:"appointments-table","aria-live":"polite",children:[d.jsx("thead",{children:d.jsxs("tr",{children:[d.jsx("th",{style:{width:"180px"},children:"Fecha / Hora"}),d.jsx("th",{children:"Paciente"}),d.jsx("th",{children:"Doctor"}),d.jsx("th",{children:"Espacio físico"}),d.jsx("th",{children:"Comentario"}),d.jsx("th",{style:{width:"120px"},children:"Estado"}),d.jsx("th",{children:"Acciones"})]})}),d.jsx("tbody",{id:"citasTbody",children:o?d.jsx("tr",{children:d.jsx("td",{colSpan:7,className:"no-data",children:"Cargando citas..."})}):E.length===0?d.jsx("tr",{children:d.jsx("td",{colSpan:7,className:"no-data",children:"No hay citas registradas para este rango."})}):E.map(Ne)})]})})]})]})]})})]})}function Uj(){return d.jsxs("div",{style:{padding:"20px"},children:[d.jsx("h2",{children:"Módulo de Facturación"}),d.jsx("p",{children:"Aquí se registrarán los pagos, facturas y cobros."})]})}function $j(){return d.jsxs("div",{style:{padding:"20px"},children:[d.jsx("h2",{children:"Módulo de Facturación"}),d.jsx("p",{children:"Aquí se registrarán los pagos, facturas y cobros."})]})}function Bj(){return d.jsxs("div",{style:{padding:"20px"},children:[d.jsx("h2",{children:"Módulo de Facturación"}),d.jsx("p",{children:"Aquí se registrarán los pagos, facturas y cobros."})]})}var Cw;const lc=typeof navigator<"u"&&((Cw=navigator.language)!=null&&Cw.startsWith("es"))?"es-ES":"en-US",zj=["Colombia","Argentina","Bolivia","Chile","Costa Rica","Cuba","Ecuador","El Salvador","España","Guatemala","Honduras","México","Nicaragua","Panamá","Paraguay","Perú","Puerto Rico","República Dominicana","Uruguay","Venezuela","Estados Unidos","Canadá"],Iw={Colombia:["Bogotá","Medellín","Cali","Barranquilla","Cartagena","Cúcuta","Bucaramanga","Pereira","Santa Marta","Ibagué"],México:["Ciudad de México","Guadalajara","Monterrey","Puebla","Querétaro","Tijuana","Mérida","León"],Perú:["Lima","Arequipa","Trujillo","Chiclayo","Cusco","Piura"],Chile:["Santiago","Valparaíso","Concepción","La Serena","Antofagasta"],Argentina:["Buenos Aires","Córdoba","Rosario","Mendoza","La Plata"],España:["Madrid","Barcelona","Valencia","Sevilla","Zaragoza","Bilbao"],"Estados Unidos":["Miami","New York","Los Ángeles","Houston","Chicago"],Ecuador:["Quito","Guayaquil","Cuenca","Manta"],Venezuela:["Caracas","Maracaibo","Valencia","Barquisimeto","Maracay"]},qj=t=>{if(!t)return"";const[e,n,r]=t.split("-").map(c=>parseInt(c,10)),i=new Date(e,(n||1)-1,r||1),s=new Date;let o=s.getFullYear()-i.getFullYear();const l=s.getMonth()-i.getMonth();return(l<0||l===0&&s.getDate()<i.getDate())&&o--,isNaN(o)?"":String(o)};async function Hj(t,{maxW:e=900,maxH:n=900,quality:r=.82}={}){var g;if(!t||!((g=t.type)!=null&&g.startsWith("image/")))return t;const i=await new Promise((S,v)=>{const N=new Image;N.onload=()=>S(N),N.onerror=v,N.src=URL.createObjectURL(t)});let{width:s,height:o}=i;const l=Math.min(e/s,n/o,1);s=Math.round(s*l),o=Math.round(o*l);const c=document.createElement("canvas");c.width=s,c.height=o,c.getContext("2d").drawImage(i,0,0,s,o);const f=await new Promise(S=>c.toBlob(S,"image/jpeg",r)),p=new File([f],(t.name||"foto.jpg").replace(/\.[^.]+$/,".jpg"),{type:"image/jpeg",lastModified:Date.now()});return URL.revokeObjectURL(i.src),p}const ha=t=>(t||"").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim(),Wj=t=>ha([t.nombres,t.apellidos,t.nombreCompleto,t.nroDocumento,t.celular,t.email].filter(Boolean).join(" ")),Rs={tipoDocumento:"",nroDocumento:"",nroHistoria:"",nombres:"",apellidos:"",nombreCompleto:"",sexo:"",estadoCivil:"",paisNacimiento:"",ciudadNacimiento:"",fechaIngreso:"",fechaNacimiento:"",edad:"",paisDomicilio:"",ciudadDomicilio:"",barrio:"",lugarResidencia:"",estrato:"",zonaResidencial:"",esExtranjero:!1,permitePublicidad:!1,celular:"",telDomicilio:"",telOficina:"",extension:"",email:"",ocupacion:"",nombreResponsable:"",parentesco:"",celularResponsable:"",telefonoResponsable:"",emailResponsable:"",nombreAcompanante:"",telefonoAcompanante:"",convenioBeneficio:"",comoConocio:"",campania:"",remitidoPor:"",asesorComercial:"",tipoVinculacion:"",nombreEps:"",polizaSalud:"",doctor:"",notas:"",rxImagenes:[],historiaClinica:{antecedentes:"",alergias:"",medicamentos:"",motivoConsulta:"",notas:""},odontograma:[],periodontograma:[],presupuestos:[],evoluciones:[],facturacion:{saldoFavor:0,saldoCredito:0},fotoUrl:"",activo:!0},Vh=20;function Gj(){var ce,Se,Ce,Fe,be,Ge,he;const[t,e]=D.useState(!0),[n,r]=D.useState([]),[i,s]=D.useState(""),[o,l]=D.useState(null),[c,u]=D.useState(!0),[f,p]=D.useState(!1),[g,S]=D.useState(null),[v,N]=D.useState(null),b=D.useRef(null),[I,E]=D.useState("datos"),[y,L]=D.useState(Rs),[$,B]=D.useState(null),[C,T]=D.useState(""),[A,x]=D.useState([]),P=D.useMemo(()=>Iw[y.paisNacimiento]||[],[y.paisNacimiento]);D.useEffect(()=>((async()=>{e(!0);try{const X=(await _n(ft(xe,"eps"))).docs.map(ye=>{var ve;return(ve=ye.data())==null?void 0:ve.nombre}).filter(Boolean),fe=Array.from(new Map(X.map(ye=>[String(ye).toLowerCase(),ye])).values()).sort((ye,ve)=>ye.localeCompare(ve,"es"));x(fe),await Et(!0)}catch(j){console.error(j),alert("No se pudieron cargar pacientes/EPS.")}finally{e(!1)}})(),()=>{b.current&&(b.current(),b.current=null)}),[]),D.useEffect(()=>{L(w=>({...w,nombreCompleto:`${w.nombres} ${w.apellidos}`.trim()}))},[y.nombres,y.apellidos]),D.useEffect(()=>{L(w=>({...w,nroHistoria:w.nroDocumento}))},[y.nroDocumento]),D.useEffect(()=>{L(w=>({...w,edad:qj(w.fechaNacimiento)}))},[y.fechaNacimiento]),D.useEffect(()=>{const w=new Date,j=w.toLocaleDateString(lc)+" - "+w.toLocaleTimeString(lc,{hour:"2-digit",minute:"2-digit",hour12:!0});L(X=>({...X,fechaIngreso:j}))},[]);const k=(w,j)=>L(X=>({...X,[w]:j})),R=()=>{L(Rs);const w=new Date,j=w.toLocaleDateString(lc)+" - "+w.toLocaleTimeString(lc,{hour:"2-digit",minute:"2-digit",hour12:!0});L(X=>({...X,fechaIngreso:j})),B(null),T(""),S(null)},$e=async w=>{if(!w){B(null),T("");return}try{const j=await Hj(w,{maxW:900,maxH:900,quality:.82});B(j);const X=new FileReader;X.onload=fe=>T(fe.target.result),X.readAsDataURL(j)}catch{B(w);const j=new FileReader;j.onload=X=>T(X.target.result),j.readAsDataURL(w)}},Et=async(w=!1)=>{e(!0);try{let j;w||!o?j=Dt(ft(xe,"pacientes"),si("creado","desc"),no(Vh)):j=Dt(ft(xe,"pacientes"),si("creado","desc"),MO(o),no(Vh));const X=await _n(j),fe=X.docs.map(ye=>({id:ye.id,...ye.data()}));r(w?fe:ye=>[...ye,...fe]),l(X.docs[X.docs.length-1]||null),u(X.size===Vh)}catch(j){console.error(j),alert("No se pudo cargar pacientes.")}finally{e(!1)}},yn=async w=>{if(w.preventDefault(),!y.nroDocumento.trim())return alert("El número de documento es obligatorio.");if(!y.nombres.trim())return alert("Los nombres son obligatorios.");if(!y.apellidos.trim())return alert("Los apellidos son obligatorios.");if(!y.sexo.trim())return alert("El sexo es obligatorio.");if(!y.fechaNacimiento.trim())return alert("La fecha de nacimiento es obligatoria.");if(!y.celular.trim())return alert("El celular es obligatorio.");if(!y.email.trim())return alert("El correo electrónico es obligatorio.");if(!y.tipoVinculacion.trim())return alert("El tipo de vinculación es obligatorio.");if(!y.nombreEps.trim())return alert("El nombre de la EPS es obligatorio.");try{const j=y.nroDocumento.trim();if(!g&&(await Su(Yt(xe,"pacientes",j))).exists())return alert("Ya existe un paciente con ese número de documento.");const X=(y.nombreEps||"").trim(),fe=A.map(Re=>Re.toLowerCase()).includes(X.toLowerCase());if(X&&!fe&&window.confirm(`La EPS "${X}" no existe. ¿Deseas guardarla para futuras selecciones?`)){const it=X.toLowerCase().replace(/\s+/g,"_");await Cu(Yt(xe,"eps",it),{nombre:X,nombreLower:X.toLowerCase(),creado:$i()},{merge:!0})}let ye=y.fotoUrl||"",ve="";if($)try{const Re=Wi(),it=($.name||"foto.jpg").replace(/\s+/g,"_");ve=`pacientes/${j}/${Date.now()}_${it}`;const xt=ta(Re,ve),rn={contentType:$.type||"image/jpeg",cacheControl:"public, max-age=86400"};await cw(xt,$,rn),ye=await dw(xt)}catch(Re){console.error("Foto (warning):",Re)}const at=y.creado||null,Te=g&&at||$i(),Ke={...y,fotoUrl:ye,nombre_busqueda:Wj({...y,fotoUrl:ye}),nombresLower:ha(y.nombres),apellidosLower:ha(y.apellidos),documentoLower:ha(y.nroDocumento),emailLower:ha(y.email),creado:Te,createdAt:Te,actualizado:$i(),updatedAt:$i(),activo:y.activo??!0,celularPaciente:y.celular,telefonoPaciente:y.telDomicilio||"",documento:y.nroDocumento,paciente:y.nombreCompleto};if(await Cu(Yt(xe,"pacientes",j),Ke,{merge:!0}),ve)try{const Re=Wi(),it=ta(Re,`pacientes/${j}`),xt=await uw(it),rn=ve,Lr=xt.items.filter(fr=>fr.fullPath!==rn).map(fr=>Ph(fr).catch(()=>null));await Promise.allSettled(Lr)}catch(Re){console.warn("No se pudo limpiar fotos antiguas:",Re)}alert(g?"✅ Paciente actualizado.":"✅ Paciente guardado."),r(Re=>{const it=Re.filter(xt=>xt.id!==j);return[{id:j,...Ke},...it]}),p(!1),S(null),R()}catch(j){console.error("Error guardando paciente:",j),alert(`No se pudo guardar el paciente.

`+((j==null?void 0:j.message)||j))}},Nn=()=>{R(),p(!0)},Y=()=>{v&&(L({...Rs,...v,fotoUrl:v.fotoUrl||""}),B(null),T(v.fotoUrl||""),S(v.id),Ne(),p(!0))},se=async w=>{if(window.confirm(`¿Eliminar al paciente "${w.nombreCompleto}"?`))try{await RS(Yt(xe,"pacientes",w.id)),r(j=>j.filter(X=>X.id!==w.id));try{const j=Wi(),X=ta(j,`pacientes/${w.id}`),ye=(await uw(X)).items.map(ve=>Ph(ve).catch(()=>null));await Promise.allSettled(ye)}catch(j){console.warn("No se pudo borrar la carpeta de fotos:",j)}}catch(j){console.error(j),alert("No se pudo eliminar.")}},oe=D.useMemo(()=>{const w=i.trim().toLowerCase();return w?n.filter(j=>`${j.nombreCompleto||j.paciente||""} ${j.nroDocumento||""} ${j.celular||j.celularPaciente||""} ${j.email||""}`.toLowerCase().includes(w)):n},[n,i]),ke=w=>{Ne();const j=Yt(xe,"pacientes",w.id),X=Ra(j,fe=>{fe.exists()?N({id:fe.id,...F(fe.data())}):N(null)});b.current=X,E("datos")},Ne=()=>{b.current&&(b.current(),b.current=null),N(null)},F=w=>({...Rs,...w,historiaClinica:{...Rs.historiaClinica,...w.historiaClinica||{}},facturacion:{...Rs.facturacion,...w.facturacion||{}},rxImagenes:Array.isArray(w.rxImagenes)?w.rxImagenes:[],odontograma:Array.isArray(w.odontograma)?w.odontograma:[],periodontograma:Array.isArray(w.periodontograma)?w.periodontograma:[],presupuestos:Array.isArray(w.presupuestos)?w.presupuestos:[],evoluciones:Array.isArray(w.evoluciones)?w.evoluciones:[]}),H=async w=>{if(v!=null&&v.id)try{await op(Yt(xe,"pacientes",v.id),{...w,actualizado:$i(),updatedAt:$i()})}catch(j){console.error(j),alert("No se pudo actualizar.")}},z=async w=>{if(!(v!=null&&v.id)||!(w!=null&&w.length))return;const j=Wi(),X=[];for(const fe of w){const ye=(fe.name||"archivo").replace(/\s+/g,"_"),ve=`pacientes/${v.id}/rx/${Date.now()}_${ye}`,at=ta(j,ve);await cw(at,fe,{contentType:fe.type});const Te=await dw(at);X.push({url:Te,name:fe.name,type:fe.type,size:fe.size||0,created:Date.now(),path:ve})}await H({rxImagenes:[...v.rxImagenes||[],...X]})},Q=async w=>{if(!(v!=null&&v.id))return;const j=v.rxImagenes[w],X=v.rxImagenes.filter((fe,ye)=>ye!==w);await H({rxImagenes:X});try{if(j!=null&&j.path){const fe=Wi();await Ph(ta(fe,j.path))}}catch(fe){console.warn("No se pudo borrar del Storage:",fe)}},J=(w,j)=>{const X={...v.historiaClinica||{},[w]:j};H({historiaClinica:X})},re=w=>{const j=[...v.presupuestos||[],{id:String(Date.now()),...w}];H({presupuestos:j})},te=w=>{H({presupuestos:(v.presupuestos||[]).filter(j=>j.id!==w)})},ge=w=>{const j=[...v.evoluciones||[],{id:String(Date.now()),fechaISO:new Date().toISOString(),nota:w}];H({evoluciones:j})},ie=w=>{H({evoluciones:(v.evoluciones||[]).filter(j=>j.id!==w)})},K=(w,j)=>{const X=Array.isArray(v[w])?v[w]:[],fe=X.find(ve=>ve.pieza===j);let ye;fe?ye=X.filter(ve=>ve.pieza!==j):ye=[...X,{pieza:j,estado:"marcada"}],H({[w]:ye})};return d.jsxs("div",{className:"odc-container",children:[d.jsx("div",{className:"odc-topbar-green"}),d.jsx("div",{className:"odc-topbar-blue",children:d.jsx("div",{className:"odc-top-inner",children:d.jsx("div",{className:"odc-breadcrumbs",children:"Pacientes"})})}),d.jsxs("div",{className:"odc-card",children:[d.jsxs("div",{className:"odc-card-header",children:[d.jsx("h3",{className:"odc-title",children:"Pacientes"}),d.jsxs("div",{style:{display:"flex",gap:8,alignItems:"center"},children:[d.jsx("input",{className:"search-input",style:{minWidth:280},placeholder:"Buscar por nombre, documento o teléfono…",value:i,onChange:w=>s(w.target.value)}),d.jsx("button",{className:"btn green",onClick:Nn,children:"+ Nuevo paciente"})]})]}),d.jsx("div",{className:"table-wrap",children:d.jsxs("table",{className:"appointments-table",children:[d.jsx("thead",{children:d.jsxs("tr",{children:[d.jsx("th",{children:"Foto"}),d.jsx("th",{children:"Nombre"}),d.jsx("th",{children:"Documento"}),d.jsx("th",{children:"Celular"}),d.jsx("th",{children:"Correo"}),d.jsx("th",{children:"Estado"})]})}),d.jsx("tbody",{children:t&&n.length===0?d.jsx("tr",{children:d.jsx("td",{className:"no-data",colSpan:6,children:"Cargando…"})}):oe.length===0?d.jsx("tr",{children:d.jsx("td",{className:"no-data",colSpan:6,children:"No hay pacientes o no coinciden con la búsqueda."})}):oe.map(w=>d.jsxs("tr",{className:"row-click",onClick:()=>ke(w),children:[d.jsx("td",{onClick:j=>j.stopPropagation(),children:w.fotoUrl?d.jsx("img",{src:w.fotoUrl,alt:"Foto",style:{width:36,height:36,borderRadius:"50%",objectFit:"cover"}}):d.jsx("div",{className:"avatar-fallback",children:(w.nombreCompleto||"P")[0]})}),d.jsx("td",{children:w.nombreCompleto||w.paciente||"—"}),d.jsx("td",{children:w.nroDocumento||w.documento||"—"}),d.jsx("td",{children:w.celular||w.celularPaciente||"—"}),d.jsx("td",{children:w.email||"—"}),d.jsx("td",{children:d.jsx("span",{className:"pill pill-ok",children:w.activo?"Activo":"Inactivo"})})]},w.id))})]})}),d.jsxs("div",{className:"footer-actions",children:[d.jsx("button",{className:"btn",disabled:t||!c,onClick:()=>Et(!1),children:c?"Cargar más":"No hay más"}),d.jsxs("div",{className:"hint",children:[n.length," registros cargados"]})]})]}),f&&d.jsxs("div",{className:"odc-modal",role:"dialog","aria-modal":"true",children:[d.jsx("div",{className:"odc-modal-backdrop",onClick:()=>p(!1)}),d.jsxs("div",{className:"odc-card",style:{width:1e3,maxWidth:"95%",maxHeight:"92vh",overflowY:"auto"},children:[d.jsxs("div",{className:"odc-card-header",children:[d.jsx("h3",{className:"odc-title",children:g?"Editar paciente":"Nuevo paciente"}),d.jsx("button",{className:"btn",onClick:()=>p(!1),children:"✕"})]}),d.jsxs("form",{onSubmit:yn,children:[d.jsx("div",{className:"form-section-title",children:"Foto del paciente"}),d.jsxs("div",{className:"foto-row",children:[d.jsxs("label",{className:"foto-drop",children:[d.jsx("input",{type:"file",accept:"image/*",onChange:w=>{var j;return $e(((j=w.target.files)==null?void 0:j[0])||null)},style:{display:"none"}}),C?d.jsx("img",{src:C,alt:"Preview",className:"foto-preview"}):d.jsx("div",{className:"foto-empty",children:"Arrastra o haz clic para cargar"})]}),C&&d.jsx("button",{type:"button",className:"btn",onClick:()=>$e(null),children:"Quitar foto"})]}),d.jsx("div",{className:"form-section-title",children:"Datos de identificación"}),d.jsxs("div",{className:"form-grid",children:[d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Tipo de documento *"}),d.jsxs("select",{className:"form-input",value:y.tipoDocumento,onChange:w=>k("tipoDocumento",w.target.value),children:[d.jsx("option",{value:"",children:"Seleccione…"}),d.jsx("option",{value:"CC",children:"Cédula"}),d.jsx("option",{value:"TI",children:"Tarjeta de identidad"}),d.jsx("option",{value:"PA",children:"Pasaporte"}),d.jsx("option",{value:"OTRO",children:"Otro"})]})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Nro. de documento *"}),d.jsx("input",{className:"form-input",value:y.nroDocumento,onChange:w=>k("nroDocumento",w.target.value),placeholder:"Número de documento",required:!0})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Número de Historia"}),d.jsx("input",{className:"form-input",value:y.nroHistoria,readOnly:!0})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Nombres *"}),d.jsx("input",{className:"form-input",value:y.nombres,onChange:w=>k("nombres",w.target.value),required:!0})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Apellidos *"}),d.jsx("input",{className:"form-input",value:y.apellidos,onChange:w=>k("apellidos",w.target.value),required:!0})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Nombre completo"}),d.jsx("input",{className:"form-input",value:y.nombreCompleto,readOnly:!0})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Sexo *"}),d.jsxs("select",{className:"form-input",value:y.sexo,onChange:w=>k("sexo",w.target.value),required:!0,children:[d.jsx("option",{value:"",children:"Seleccione…"}),d.jsx("option",{children:"Masculino"}),d.jsx("option",{children:"Femenino"}),d.jsx("option",{children:"Otro"})]})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Estado civil *"}),d.jsxs("select",{className:"form-input",value:y.estadoCivil,onChange:w=>k("estadoCivil",w.target.value),required:!0,children:[d.jsx("option",{value:"",children:"Seleccione…"}),d.jsx("option",{children:"Soltero"}),d.jsx("option",{children:"Casado"}),d.jsx("option",{children:"Unión libre"}),d.jsx("option",{children:"Divorciado"}),d.jsx("option",{children:"Viudo"})]})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"País de nacimiento *"}),d.jsx("input",{className:"form-input",list:"listCountries",value:y.paisNacimiento,onChange:w=>k("paisNacimiento",w.target.value),placeholder:"Escribe y elige…",required:!0}),d.jsx("datalist",{id:"listCountries",children:zj.map(w=>d.jsx("option",{value:w},w))})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Ciudad de nacimiento"}),d.jsx("input",{className:"form-input",list:"listCitiesBirth",value:y.ciudadNacimiento,onChange:w=>k("ciudadNacimiento",w.target.value),placeholder:"Escribe y elige…"}),d.jsx("datalist",{id:"listCitiesBirth",children:P.map(w=>d.jsx("option",{value:w},w))})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Fecha de ingreso"}),d.jsx("input",{className:"form-input",value:y.fechaIngreso,readOnly:!0})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Fecha de nacimiento *"}),d.jsx("input",{type:"date",className:"form-input",value:y.fechaNacimiento,onChange:w=>k("fechaNacimiento",w.target.value),required:!0})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Edad"}),d.jsx("input",{className:"form-input",value:y.edad,readOnly:!0})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"País de domicilio *"}),d.jsx("input",{className:"form-input",list:"listCountries",value:y.paisDomicilio,onChange:w=>k("paisDomicilio",w.target.value),required:!0})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Ciudad de domicilio *"}),d.jsx("input",{className:"form-input",list:"listCitiesHome",value:y.ciudadDomicilio,onChange:w=>k("ciudadDomicilio",w.target.value),required:!0}),d.jsx("datalist",{id:"listCitiesHome",children:(Iw[y.paisDomicilio]||[]).map(w=>d.jsx("option",{value:w},w))})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Barrio *"}),d.jsx("input",{className:"form-input",value:y.barrio,onChange:w=>k("barrio",w.target.value),required:!0,placeholder:"Barrio"})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Lugar de residencia *"}),d.jsx("input",{className:"form-input",value:y.lugarResidencia,onChange:w=>k("lugarResidencia",w.target.value),required:!0})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Estrato"}),d.jsxs("select",{className:"form-input",value:y.estrato,onChange:w=>k("estrato",w.target.value),children:[d.jsx("option",{value:"",children:"Seleccione…"}),d.jsx("option",{children:"1"}),d.jsx("option",{children:"2"}),d.jsx("option",{children:"3"}),d.jsx("option",{children:"4"}),d.jsx("option",{children:"5"}),d.jsx("option",{children:"6"})]})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Zona residencial *"}),d.jsxs("select",{className:"form-input",value:y.zonaResidencial,onChange:w=>k("zonaResidencial",w.target.value),required:!0,children:[d.jsx("option",{value:"",children:"Seleccione…"}),d.jsx("option",{children:"Urbana"}),d.jsx("option",{children:"Rural"})]})]}),d.jsxs("div",{className:"checkbox-cell",children:[d.jsx("label",{className:"form-label",children:"¿Es extranjero?"}),d.jsx("input",{type:"checkbox",checked:y.esExtranjero,onChange:w=>k("esExtranjero",w.target.checked)})]}),d.jsxs("div",{className:"checkbox-cell",children:[d.jsx("label",{className:"form-label",children:"¿Permite publicidad?"}),d.jsx("input",{type:"checkbox",checked:y.permitePublicidad,onChange:w=>k("permitePublicidad",w.target.checked)})]})]}),d.jsx("div",{className:"form-section-title",children:"Contacto"}),d.jsxs("div",{className:"form-grid",children:[d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Celular *"}),d.jsx("input",{className:"form-input",value:y.celular,onChange:w=>k("celular",w.target.value),required:!0,placeholder:"Celular del paciente"})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Teléfono de domicilio"}),d.jsx("input",{className:"form-input",value:y.telDomicilio,onChange:w=>k("telDomicilio",w.target.value)})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Teléfono de oficina"}),d.jsx("input",{className:"form-input",value:y.telOficina,onChange:w=>k("telOficina",w.target.value)})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Extensión"}),d.jsx("input",{className:"form-input",value:y.extension,onChange:w=>k("extension",w.target.value)})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Correo electrónico *"}),d.jsx("input",{type:"email",className:"form-input",value:y.email,onChange:w=>k("email",w.target.value),required:!0,placeholder:"correo@dominio.com"})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Ocupación *"}),d.jsx("input",{className:"form-input",value:y.ocupacion,onChange:w=>k("ocupacion",w.target.value),required:!0})]})]}),d.jsx("div",{className:"form-section-title",children:"Datos de facturación"}),d.jsxs("div",{className:"form-grid",children:[d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Responsable"}),d.jsx("input",{className:"form-input",value:y.nombreResponsable,onChange:w=>k("nombreResponsable",w.target.value)})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Parentesco"}),d.jsxs("select",{className:"form-input",value:y.parentesco,onChange:w=>k("parentesco",w.target.value),children:[d.jsx("option",{value:"",children:"Seleccione…"}),d.jsx("option",{children:"Padre/Madre"}),d.jsx("option",{children:"Hermano"}),d.jsx("option",{children:"Esposo/a"}),d.jsx("option",{children:"Otro"})]})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Celular"}),d.jsx("input",{className:"form-input",value:y.celularResponsable,onChange:w=>k("celularResponsable",w.target.value)})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Teléfono"}),d.jsx("input",{className:"form-input",value:y.telefonoResponsable,onChange:w=>k("telefonoResponsable",w.target.value)})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Correo electrónico"}),d.jsx("input",{type:"email",className:"form-input",value:y.emailResponsable,onChange:w=>k("emailResponsable",w.target.value)})]})]}),d.jsx("div",{className:"form-section-title",children:"Acompañante"}),d.jsxs("div",{className:"form-grid",children:[d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Nombre"}),d.jsx("input",{className:"form-input",value:y.nombreAcompanante,onChange:w=>k("nombreAcompanante",w.target.value),placeholder:"Nombre acompañante"})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Teléfono"}),d.jsx("input",{className:"form-input",value:y.telefonoAcompanante,onChange:w=>k("telefonoAcompanante",w.target.value),placeholder:"Teléfono acompañante"})]})]}),d.jsx("div",{className:"form-section-title",children:"Mercadeo"}),d.jsxs("div",{className:"form-grid",children:[d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Convenio beneficio"}),d.jsx("input",{className:"form-input",value:y.convenioBeneficio,onChange:w=>k("convenioBeneficio",w.target.value)})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"¿Cómo nos conoció?"}),d.jsxs("select",{className:"form-input",value:y.comoConocio,onChange:w=>k("comoConocio",w.target.value),children:[d.jsx("option",{value:"",children:"Seleccione…"}),d.jsx("option",{children:"Redes sociales"}),d.jsx("option",{children:"Publicidad"}),d.jsx("option",{children:"Recomendación"}),d.jsx("option",{children:"Otro"})]})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Campaña"}),d.jsx("input",{className:"form-input",value:y.campania,onChange:w=>k("campania",w.target.value)})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Remitido por"}),d.jsx("input",{className:"form-input",value:y.remitidoPor,onChange:w=>k("remitidoPor",w.target.value)})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Asesor comercial"}),d.jsx("input",{className:"form-input",value:y.asesorComercial,onChange:w=>k("asesorComercial",w.target.value)})]})]}),d.jsx("div",{className:"form-section-title",children:"EPS"}),d.jsxs("div",{className:"form-grid",children:[d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Tipo de vinculación *"}),d.jsxs("select",{className:"form-input",value:y.tipoVinculacion,onChange:w=>k("tipoVinculacion",w.target.value),required:!0,children:[d.jsx("option",{value:"",children:"Seleccione…"}),d.jsx("option",{children:"Contributivo"}),d.jsx("option",{children:"Subsidiado"}),d.jsx("option",{children:"Particular"}),d.jsx("option",{children:"Otro"})]})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Nombre de la EPS *"}),d.jsx("input",{className:"form-input",list:"listEps",value:y.nombreEps,onChange:w=>k("nombreEps",w.target.value),placeholder:"Escribe y selecciona…",required:!0}),d.jsx("datalist",{id:"listEps",children:A.map(w=>d.jsx("option",{value:w},w))})]}),d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Póliza de salud"}),d.jsx("input",{className:"form-input",value:y.polizaSalud,onChange:w=>k("polizaSalud",w.target.value)})]})]}),d.jsx("div",{className:"form-section-title",children:"Doctor"}),d.jsx("div",{className:"form-grid",children:d.jsxs("div",{children:[d.jsx("label",{className:"form-label",children:"Doctor"}),d.jsx("input",{className:"form-input",value:y.doctor,onChange:w=>k("doctor",w.target.value),placeholder:"Usuario / Libre"})]})}),d.jsx("div",{className:"form-section-title",children:"Alertas y Notas"}),d.jsx("div",{className:"form-grid",children:d.jsx("textarea",{className:"form-input",rows:3,value:y.notas,onChange:w=>k("notas",w.target.value),placeholder:"Notas del paciente…"})}),d.jsxs("div",{style:{display:"flex",justifyContent:"space-between",gap:8,marginTop:12},children:[g?d.jsx("button",{type:"button",className:"btn",onClick:()=>se({id:g,nombreCompleto:y.nombreCompleto}),children:"Eliminar"}):d.jsx("div",{}),d.jsxs("div",{style:{display:"flex",gap:8},children:[d.jsx("button",{type:"button",className:"btn",onClick:()=>p(!1),children:"Cancelar"}),d.jsx("button",{type:"submit",className:"btn blue",children:g?"Actualizar":"Guardar paciente"})]})]})]})]})]}),v&&d.jsxs("div",{className:"odc-modal",role:"dialog","aria-modal":"true",children:[d.jsx("div",{className:"odc-modal-backdrop",onClick:Ne}),d.jsxs("div",{className:"odc-card ficha-card",children:[d.jsxs("div",{className:"ficha-header",children:[d.jsxs("div",{className:"ficha-header-left",children:[v.fotoUrl?d.jsx("img",{src:v.fotoUrl,alt:"Foto",className:"ficha-avatar"}):d.jsx("div",{className:"avatar-fallback ficha-avatar-fallback",children:(v.nombreCompleto||"P")[0]}),d.jsxs("div",{children:[d.jsx("div",{className:"ficha-nombre",children:v.nombreCompleto||"—"}),d.jsxs("div",{className:"ficha-doc",children:[v.tipoDocumento||"—"," ",v.nroDocumento||"—"]}),d.jsxs("div",{className:"ficha-badges",children:[d.jsx("span",{className:"ficha-badge blue",children:"En valoración"}),d.jsx("span",{className:"ficha-badge green",children:"Sin deuda"})]})]})]}),d.jsx("div",{className:"ficha-header-right",children:d.jsxs("div",{className:"ficha-actions",children:[d.jsx("button",{className:"btn",onClick:Ne,children:"Cerrar"}),d.jsx("button",{className:"btn blue",onClick:Y,children:"Editar"})]})})]}),d.jsxs("div",{className:"ficha-body",children:[d.jsxs("aside",{className:"ficha-sidebar",children:[d.jsx("div",{className:"ficha-sidebar-title",children:"Información general"}),d.jsx("button",{className:`ficha-link ${I==="datos"?"active":""}`,onClick:()=>E("datos"),children:"Datos personales"}),d.jsx("button",{className:`ficha-link ${I==="marketing"?"active":""}`,onClick:()=>E("marketing"),children:"Marketing"}),d.jsx("button",{className:`ficha-link ${I==="eps"?"active":""}`,onClick:()=>E("eps"),children:"EPS"}),d.jsx("button",{className:`ficha-link ${I==="prof"?"active":""}`,onClick:()=>E("prof"),children:"Profesionales"}),d.jsx("button",{className:`ficha-link ${I==="rx"?"active":""}`,onClick:()=>E("rx"),children:"Rx/Imágenes/Doc"}),d.jsx("button",{className:`ficha-link ${I==="citas"?"active":""}`,onClick:()=>E("citas"),children:"Citas"}),d.jsx("button",{className:`ficha-link ${I==="crm"?"active":""}`,onClick:()=>E("crm"),children:"CRM"}),d.jsx("div",{className:"ficha-sidebar-title mt",children:"Historia clínica"}),d.jsx("button",{className:`ficha-link ${I==="doc"?"active":""}`,onClick:()=>E("doc"),children:"Doc. Clínicos"}),d.jsx("button",{className:`ficha-link ${I==="odonto"?"active":""}`,onClick:()=>E("odonto"),children:"Odontogramas"}),d.jsx("button",{className:`ficha-link ${I==="perio"?"active":""}`,onClick:()=>E("perio"),children:"Periodontogramas"}),d.jsx("button",{className:`ficha-link ${I==="presu"?"active":""}`,onClick:()=>E("presu"),children:"Presupuestos"}),d.jsx("button",{className:`ficha-link ${I==="evo"?"active":""}`,onClick:()=>E("evo"),children:"Evoluciones"}),d.jsx("div",{className:"ficha-sidebar-title mt",children:"Facturación"}),d.jsx("button",{className:`ficha-link ${I==="fact"?"active":""}`,onClick:()=>E("fact"),children:"Resumen"})]}),d.jsxs("main",{className:"ficha-content",children:[I==="datos"&&d.jsxs("section",{className:"ficha-section",children:[d.jsx("h4",{className:"ficha-section-title",children:"Datos personales"}),d.jsx("div",{className:"ficha-grid",children:[["Tipo de documento",v.tipoDocumento],["Nro. de documento",v.nroDocumento],["Número de Historia",v.nroHistoria],["Fecha de ingreso",v.fechaIngreso],["Nombres",v.nombres],["Apellidos",v.apellidos],["Nombre completo",v.nombreCompleto],["Sexo",v.sexo],["Estado civil",v.estadoCivil],["País de nacimiento",v.paisNacimiento],["Ciudad de nacimiento",v.ciudadNacimiento],["Fecha de nacimiento",v.fechaNacimiento],["Edad",v.edad],["País de domicilio",v.paisDomicilio],["Ciudad de domicilio",v.ciudadDomicilio],["Barrio",v.barrio],["Lugar de residencia",v.lugarResidencia],["Estrato",v.estrato],["Zona residencial",v.zonaResidencial],["Extranjero",v.esExtranjero?"Sí":"No"],["Permite publicidad",v.permitePublicidad?"Sí":"No"],["Celular",v.celular||v.celularPaciente],["Teléfono domicilio",v.telDomicilio||v.telefonoPaciente],["Teléfono oficina",v.telOficina],["Extensión",v.extension],["Correo electrónico",v.email],["Ocupación",v.ocupacion],["Responsable",v.nombreResponsable],["Parentesco",v.parentesco],["Cel. responsable",v.celularResponsable],["Tel. responsable",v.telefonoResponsable],["Email responsable",v.emailResponsable],["Acompañante",v.nombreAcompanante],["Tel. acompañante",v.telefonoAcompanante]].map(([w,j])=>d.jsxs("div",{className:"field",children:[d.jsx("label",{children:w}),d.jsx("input",{className:"form-input",value:j||"",readOnly:!0})]},w))})]}),I==="marketing"&&d.jsxs("section",{className:"ficha-section",children:[d.jsx("h4",{className:"ficha-section-title",children:"Marketing"}),d.jsx("div",{className:"ficha-grid",children:[["Convenio beneficio",v.convenioBeneficio],["¿Cómo nos conoció?",v.comoConocio],["Campaña",v.campania],["Remitido por",v.remitidoPor],["Asesor comercial",v.asesorComercial]].map(([w,j])=>d.jsxs("div",{className:"field",children:[d.jsx("label",{children:w}),d.jsx("input",{className:"form-input",value:j||"",readOnly:!0})]},w))})]}),I==="eps"&&d.jsxs("section",{className:"ficha-section",children:[d.jsx("h4",{className:"ficha-section-title",children:"EPS"}),d.jsx("div",{className:"ficha-grid",children:[["Tipo de vinculación",v.tipoVinculacion],["Nombre EPS",v.nombreEps],["Póliza de salud",v.polizaSalud]].map(([w,j])=>d.jsxs("div",{className:"field",children:[d.jsx("label",{children:w}),d.jsx("input",{className:"form-input",value:j||"",readOnly:!0})]},w))})]}),I==="prof"&&d.jsxs("section",{className:"ficha-section",children:[d.jsx("h4",{className:"ficha-section-title",children:"Profesionales"}),d.jsx("div",{className:"ficha-grid",children:d.jsxs("div",{className:"field",children:[d.jsx("label",{children:"Doctor"}),d.jsx("input",{className:"form-input",value:v.doctor||"",readOnly:!0})]})})]}),I==="rx"&&d.jsxs("section",{className:"ficha-section",children:[d.jsx("h4",{className:"ficha-section-title",children:"Rx / Imágenes / Documentos"}),d.jsx("div",{className:"rx-actions",children:d.jsxs("label",{className:"btn blue",children:["Subir archivos",d.jsx("input",{type:"file",multiple:!0,style:{display:"none"},onChange:w=>z([...w.target.files])})]})}),d.jsxs("div",{className:"rx-grid",children:[(v.rxImagenes||[]).map((w,j)=>{var X;return d.jsxs("div",{className:"rx-item",children:[(X=w.type)!=null&&X.startsWith("image/")?d.jsx("a",{href:w.url,target:"_blank",rel:"noreferrer",children:d.jsx("img",{src:w.url,alt:w.name})}):d.jsx("a",{className:"rx-file",href:w.url,target:"_blank",rel:"noreferrer",children:w.name||"archivo"}),d.jsxs("div",{className:"rx-meta",children:[d.jsx("span",{children:w.name}),d.jsx("button",{className:"btn small",onClick:()=>Q(j),children:"Eliminar"})]})]},j)}),(!v.rxImagenes||v.rxImagenes.length===0)&&d.jsx("div",{className:"no-data",children:"Sin archivos aún."})]})]}),I==="doc"&&d.jsxs("section",{className:"ficha-section",children:[d.jsx("h4",{className:"ficha-section-title",children:"Doc. Clínicos"}),d.jsxs("div",{className:"ficha-grid",children:[d.jsxs("div",{className:"field",children:[d.jsx("label",{children:"Motivo de consulta"}),d.jsx("textarea",{className:"form-input",rows:3,value:((ce=v.historiaClinica)==null?void 0:ce.motivoConsulta)||"",onChange:w=>J("motivoConsulta",w.target.value)})]}),d.jsxs("div",{className:"field",children:[d.jsx("label",{children:"Antecedentes"}),d.jsx("textarea",{className:"form-input",rows:3,value:((Se=v.historiaClinica)==null?void 0:Se.antecedentes)||"",onChange:w=>J("antecedentes",w.target.value)})]}),d.jsxs("div",{className:"field",children:[d.jsx("label",{children:"Alergias"}),d.jsx("textarea",{className:"form-input",rows:2,value:((Ce=v.historiaClinica)==null?void 0:Ce.alergias)||"",onChange:w=>J("alergias",w.target.value)})]}),d.jsxs("div",{className:"field",children:[d.jsx("label",{children:"Medicamentos"}),d.jsx("textarea",{className:"form-input",rows:2,value:((Fe=v.historiaClinica)==null?void 0:Fe.medicamentos)||"",onChange:w=>J("medicamentos",w.target.value)})]}),d.jsxs("div",{className:"field",children:[d.jsx("label",{children:"Notas"}),d.jsx("textarea",{className:"form-input",rows:3,value:((be=v.historiaClinica)==null?void 0:be.notas)||"",onChange:w=>J("notas",w.target.value)})]})]})]}),I==="odonto"&&d.jsxs("section",{className:"ficha-section",children:[d.jsx("h4",{className:"ficha-section-title",children:"Odontograma (placeholder)"}),d.jsx("div",{className:"odont-grid",children:Array.from({length:32},(w,j)=>j+1).map(w=>{const j=(v.odontograma||[]).some(X=>X.pieza===w);return d.jsx("button",{className:`tooth ${j?"on":""}`,onClick:()=>K("odontograma",w),title:`Pieza ${w}`,children:w},w)})})]}),I==="perio"&&d.jsxs("section",{className:"ficha-section",children:[d.jsx("h4",{className:"ficha-section-title",children:"Periodontograma (placeholder)"}),d.jsx("div",{className:"odont-grid",children:Array.from({length:32},(w,j)=>j+1).map(w=>{const j=(v.periodontograma||[]).some(X=>X.pieza===w);return d.jsx("button",{className:`tooth ${j?"on":""}`,onClick:()=>K("periodontograma",w),title:`Pieza ${w}`,children:w},w)})})]}),I==="presu"&&d.jsxs("section",{className:"ficha-section",children:[d.jsx("h4",{className:"ficha-section-title",children:"Presupuestos & planes"}),d.jsx(Kj,{onAdd:re}),d.jsxs("div",{className:"presu-list",children:[(v.presupuestos||[]).map(w=>d.jsxs("div",{className:"presu-item",children:[d.jsxs("div",{children:[d.jsx("div",{className:"presu-title",children:w.titulo}),d.jsxs("div",{className:"presu-meta",children:["Costo: $",w.costo||0," · Estado: ",w.estado||"Pendiente"]})]}),d.jsx("button",{className:"btn small",onClick:()=>te(w.id),children:"Eliminar"})]},w.id)),(!v.presupuestos||v.presupuestos.length===0)&&d.jsx("div",{className:"no-data",children:"Sin presupuestos aún."})]})]}),I==="evo"&&d.jsxs("section",{className:"ficha-section",children:[d.jsx("h4",{className:"ficha-section-title",children:"Evoluciones & Remisiones"}),d.jsx(Qj,{onAdd:ge}),d.jsxs("div",{className:"evo-list",children:[(v.evoluciones||[]).map(w=>d.jsxs("div",{className:"evo-item",children:[d.jsx("div",{className:"evo-date",children:new Date(w.fechaISO).toLocaleString()}),d.jsx("div",{className:"evo-note",children:w.nota}),d.jsx("button",{className:"btn small",onClick:()=>ie(w.id),children:"Eliminar"})]},w.id)),(!v.evoluciones||v.evoluciones.length===0)&&d.jsx("div",{className:"no-data",children:"Sin evoluciones aún."})]})]}),I==="fact"&&d.jsxs("section",{className:"ficha-section",children:[d.jsx("h4",{className:"ficha-section-title",children:"Facturación"}),d.jsxs("div",{className:"ficha-grid",children:[d.jsxs("div",{className:"field",children:[d.jsx("label",{children:"Saldo a favor"}),d.jsx("input",{type:"number",className:"form-input",value:((Ge=v.facturacion)==null?void 0:Ge.saldoFavor)??0,onChange:w=>H({facturacion:{...v.facturacion||{},saldoFavor:Number(w.target.value||0)}})})]}),d.jsxs("div",{className:"field",children:[d.jsx("label",{children:"Saldo crédito"}),d.jsx("input",{type:"number",className:"form-input",value:((he=v.facturacion)==null?void 0:he.saldoCredito)??0,onChange:w=>H({facturacion:{...v.facturacion||{},saldoCredito:Number(w.target.value||0)}})})]})]}),d.jsxs("div",{className:"tools-right",style:{marginTop:8},children:[d.jsx("button",{className:"btn blue",onClick:()=>alert("Conecta aquí tu flujo de pago"),children:"Realizar pago"}),d.jsx("button",{className:"btn",onClick:()=>alert("Histórico de pagos (pendiente de tu backend)"),children:"Histórico de pagos"}),d.jsx("button",{className:"btn",onClick:()=>alert("Histórico de facturas (pendiente de tu backend)"),children:"Histórico de facturas"})]})]}),I==="citas"&&d.jsxs("section",{className:"ficha-section",children:[d.jsx("h4",{className:"ficha-section-title",children:"Citas"}),d.jsx("div",{className:"no-data",children:"Integra aquí la tabla de citas del paciente."})]}),I==="crm"&&d.jsxs("section",{className:"ficha-section",children:[d.jsx("h4",{className:"ficha-section-title",children:"CRM"}),d.jsx("div",{className:"no-data",children:"Notas / recordatorios comerciales del paciente."})]}),d.jsx("div",{className:"ficha-footer"})]})]})]})]})]})}function Kj({onAdd:t}){const[e,n]=D.useState(""),[r,i]=D.useState(""),[s,o]=D.useState("Pendiente");return d.jsxs("div",{className:"presu-form",children:[d.jsx("input",{className:"form-input",placeholder:"Procedimiento / plan",value:e,onChange:l=>n(l.target.value)}),d.jsx("input",{type:"number",className:"form-input",placeholder:"Costo",value:r,onChange:l=>i(l.target.value)}),d.jsxs("select",{className:"form-input",value:s,onChange:l=>o(l.target.value),children:[d.jsx("option",{children:"Pendiente"}),d.jsx("option",{children:"Aprobado"}),d.jsx("option",{children:"Rechazado"})]}),d.jsx("button",{className:"btn blue",onClick:()=>{if(!e)return alert("Título requerido");t({titulo:e,costo:Number(r||0),estado:s}),n(""),i(""),o("Pendiente")},children:"Agregar"})]})}function Qj({onAdd:t}){const[e,n]=D.useState("");return d.jsxs("div",{className:"evo-form",children:[d.jsx("textarea",{className:"form-input",rows:2,placeholder:"Escribe la evolución / remisión…",value:e,onChange:r=>n(r.target.value)}),d.jsx("button",{className:"btn blue",onClick:()=>{e.trim()&&(t(e.trim()),n(""))},children:"Guardar evolución"})]})}function Yj(){return d.jsxs("div",{style:{padding:"20px"},children:[d.jsx("h2",{children:"Módulo de Facturación"}),d.jsx("p",{children:"Aquí se registrarán los pagos, facturas y cobros."})]})}function Xj({items:t=[]}){return d.jsxs("div",{className:"card activity-card",children:[d.jsx("h4",{children:"Actividad reciente"}),d.jsx("ul",{className:"activity-list",children:t.map(e=>d.jsxs("li",{children:[d.jsx("strong",{children:e.title}),d.jsx("div",{className:"time",children:e.time})]},e.id))})]})}function Jj({status:t}){return t?d.jsxs("div",{className:"card",children:[d.jsx("h4",{children:"Automatizaciones (N8N)"}),d.jsxs("div",{className:"n8n-line",children:[d.jsx("strong",{children:"Conectado:"})," ",t.connected?"Sí":"No"]}),d.jsxs("div",{className:"n8n-line",children:[d.jsx("strong",{children:"Flujos activos:"})," ",t.flowsRunning]}),t.lastError&&d.jsxs("div",{className:"n8n-error",children:["Error: ",t.lastError]})]}):null}const Zj={es:{nav_home:"Inicio",nav_agenda:"Agenda",nav_patients:"Pacientes",nav_billing:"Facturación",nav_inventory:"Inventario",nav_odontogram:"Odontograma",nav_reports:"Reportes",welcomeTitle:"Bienvenido a OdontoCloud",welcomeSubtitle:"Administra tus pacientes, agenda, inventario y facturación de manera inteligente y moderna.",clinicLabel:"Clínica",userLabel:"Usuario",roleLabel:"Rol",searchPlaceholder:"Buscar...",stats_patientsToday:"Pacientes totales",stats_appointmentsToday:"Citas hoy",stats_revenueToday:"Facturación hoy",stats_waiting:"En espera",stats_currency:"COP",n8n_title:"Automatizaciones (n8n)",recent_title:"Actividad reciente",recent_empty:"Sin actividad registrada.",loading:"Cargando...",logout:"Cerrar sesión",module_coming:"Módulo próximamente.",todays_appts:"Citas de hoy",see_schedule:"Ir a Agenda",no_appts_today:"No hay citas programadas hoy.",at:"a las"},en:{nav_home:"Overview",nav_agenda:"Schedule",nav_patients:"Patients",nav_billing:"Billing",nav_inventory:"Inventory",nav_odontogram:"Odontogram",nav_reports:"Reports",welcomeTitle:"Welcome to OdontoCloud",welcomeSubtitle:"Manage your patients, schedule, inventory and billing in a smart and modern way.",clinicLabel:"Clinic",userLabel:"User",roleLabel:"Role",searchPlaceholder:"Search...",stats_patientsToday:"Total patients",stats_appointmentsToday:"Appointments today",stats_revenueToday:"Revenue today",stats_waiting:"In waiting room",stats_currency:"COP",n8n_title:"Automations (n8n)",recent_title:"Recent activity",recent_empty:"No activity yet.",loading:"Loading...",logout:"Log out",module_coming:"Module coming soon.",todays_appts:"Today's appointments",see_schedule:"Open Schedule",no_appts_today:"No appointments today.",at:"at"}},eM=()=>typeof navigator>"u"||(navigator.language||navigator.userLanguage||"es").toLowerCase().startsWith("es")?"es":"en",tM=()=>{try{const t=JSON.parse(localStorage.getItem("odc_session"));return t&&Date.now()-t.timestamp<1e3*60*60*24?t:null}catch{return null}},nM=()=>D.useMemo(()=>{const t=new Date,e=new Date(t.getFullYear(),t.getMonth(),t.getDate(),0,0,0,0),n=new Date(t.getFullYear(),t.getMonth(),t.getDate()+1,0,0,0,0);return{startToday:Oe.fromDate(e),endToday:Oe.fromDate(n),startTodayJS:e}},[]),rM=t=>{const e=t.getFullYear(),n=String(t.getMonth()+1).padStart(2,"0"),r=String(t.getDate()).padStart(2,"0");return`${e}-${n}-${r}`},iM=(t,e)=>t.toLocaleTimeString(e==="es"?"es-CO":"en-US",{hour:"2-digit",minute:"2-digit"}),sM=(t,e)=>{try{const[n,r,i]=(t||"").split("-").map(l=>parseInt(l,10)),[s=0,o=0]=(e||"00:00").split(":").map(l=>parseInt(l,10));return new Date(n,(r||1)-1,i||1,s,o,0,0)}catch{return new Date}};function oM({data:t=[]}){const i=Math.max(1,...t.map(u=>Number(u.value)||0)),s=t.length||7,o=10,l=Math.max(16,Math.min(44,(640-o*(s+1))/s)),c=(l+o)*s+o;return d.jsx("div",{style:{width:"100%",overflowX:"auto"},children:d.jsxs("svg",{width:c,height:240,role:"img","aria-label":"Pacientes registrados por día en la última semana",children:[[.25,.5,.75,1].map((u,f)=>{const p=18+(1-u)*182;return d.jsx("line",{x1:0,x2:c,y1:p,y2:p,stroke:"#e5e7eb",strokeDasharray:"4 4"},f)}),t.map((u,f)=>{const p=Number(u.value)||0,g=Math.round(p/i*182),S=o+f*(l+o),v=200-g;return d.jsxs("g",{children:[d.jsx("rect",{x:S,y:v,width:l,height:g,rx:"6",ry:"6",fill:p>0?"#0ea5e9":"#cbd5e1",children:d.jsx("title",{children:`${u.label||u.shortLabel||""} · ${p} paciente${p!==1?"s":""}`})}),p>0&&g>14&&d.jsx("text",{x:S+l/2,y:v-6,textAnchor:"middle",fontSize:"11",fill:"#0f172a",children:p}),d.jsx("text",{x:S+l/2,y:214,textAnchor:"middle",fontSize:"11",fill:"#64748b",children:u.shortLabel||""})]},f)})]})})}function jh(){const[t]=D.useState(eM()),e=z=>Zj[t][z]||z,[n,r]=D.useState("Inicio"),[i,s]=D.useState(()=>{try{return localStorage.getItem("odontocloud:dark")==="1"}catch{return!1}});D.useEffect(()=>{try{localStorage.setItem("odontocloud:dark",i?"1":"0")}catch{}document.documentElement.classList.toggle("dark",i)},[i]);const[o]=D.useState(()=>tM()),[l]=D.useState((o==null?void 0:o.rol)||""),[c]=D.useState((o==null?void 0:o.email)||""),[u,f]=D.useState("OdontoCloud"),[p,g]=D.useState(c||"Usuario"),[S,v]=D.useState(!0);D.useEffect(()=>{const z=fN(ww,async Q=>{try{if(!Q){g(c||"Usuario"),f("OdontoCloud"),v(!1);return}g(Q.displayName||Q.email||c||"Usuario");const J=Yt(xe,"empresas",Q.uid),re=await Su(J);re.exists()?f(re.data().nombre||"OdontoCloud"):f("OdontoCloud")}catch(J){console.error("Error cargando empresa/usuario:",J)}finally{v(!1)}});return()=>z()},[c]);const[N,b]=D.useState({pacientesHoy:0,citasHoy:0,facturacionHoy:0,enEspera:0}),[I,E]=D.useState(!0),[y,L]=D.useState([]),[$,B]=D.useState([]),[C,T]=D.useState(!0),{startToday:A,endToday:x,startTodayJS:P}=nM(),k=D.useMemo(()=>rM(P),[P]),R=D.useMemo(()=>{const z=new Date,Q=new Date(z.getFullYear(),z.getMonth(),z.getDate()-6),J=z,re=te=>te.toLocaleDateString(t==="es"?"es-ES":"en-US",{weekday:"short",day:"2-digit",month:"short"}).replace(".","");return`${re(Q)} – ${re(J)}`},[t]),$e=z=>{var ge;const Q=z.data()||{};let J;if((ge=Q.fecha)!=null&&ge.toDate){J=Q.fecha.toDate();const ie=Q.horaInicio||Q.hora;if(ie&&typeof ie=="string"){const[K=0,ce=0]=ie.split(":").map(Se=>parseInt(Se,10));J.setHours(K||0,ce||0,0,0)}}else if(typeof Q.fecha=="string"){const ie=Q.horaInicio||Q.hora||"00:00";J=sM(Q.fecha,ie)}else J=new Date;const re=Q.pacienteNombre||Q.paciente||"Paciente",te=Q.estado&&String(Q.estado)||"programada";return{id:z.id,fecha:J,pacienteId:Q.pacienteId||"",pacienteNombre:re,estado:te,motivo:Q.motivo||""}};D.useEffect(()=>{const z=Dt(ft(xe,"citas"),vn("fecha",">=",A),vn("fecha","<",x),si("fecha","asc")),Q=Dt(ft(xe,"citas"),vn("fecha","==",k));let J=new Map,re=!1,te=!1;const ge=()=>{const ce=Array.from(J.values()).sort((Ce,Fe)=>Ce.fecha.getTime()-Fe.fecha.getTime()),Se=ce.filter(Ce=>String(Ce.estado).toLowerCase().trim()==="en espera").length;B(ce),b(Ce=>({...Ce,citasHoy:ce.length,enEspera:Se})),re&&te&&T(!1)},ie=Ra(z,ce=>{re=!0;const Se=new Map(J);ce.docs.forEach(Ce=>Se.set(Ce.id,$e(Ce))),J=Se,ge()},ce=>{console.error("Realtime citas hoy (TS):",ce),re=!0,ge()}),K=Ra(Q,ce=>{te=!0;const Se=new Map(J);ce.docs.forEach(Ce=>Se.set(Ce.id,$e(Ce))),J=Se,ge()},ce=>{console.error("Realtime citas hoy (STR):",ce),te=!0,ge()});return()=>{try{ie()}catch{}try{K()}catch{}}},[A,x,k]),D.useEffect(()=>{(async()=>{try{const J=(await zO(ft(xe,"pacientes"))).data().count||0;let re=0;try{const te=Dt(ft(xe,"facturas"),vn("fecha",">=",A),vn("fecha","<",x));(await _n(te)).forEach(ie=>{const K=ie.data();typeof K.monto=="number"&&(re+=K.monto)})}catch{re=0}b(te=>({...te,pacientesHoy:J,facturacionHoy:re}))}catch(Q){console.error("Error cargando métricas:",Q),b(J=>({...J,pacientesHoy:0,facturacionHoy:0}))}finally{E(!1)}})()},[A,x]),D.useEffect(()=>{const z=new Date,Q=new Date(z.getFullYear(),z.getMonth(),z.getDate()-6),J=new Date(z.getFullYear(),z.getMonth(),z.getDate()+1),re=new Map;for(let ie=0;ie<7;ie++){const K=new Date(z.getFullYear(),z.getMonth(),z.getDate()-(6-ie)),ce=K.toISOString().slice(0,10),Se=K.toLocaleDateString(t==="es"?"es-ES":"en-US"),Ce=K.toLocaleDateString(t==="es"?"es-ES":"en-US",{weekday:"short",day:"2-digit"}).replace(".","");re.set(ce,{label:Se,shortLabel:Ce,value:0})}const te=Dt(ft(xe,"pacientes"),vn("createdAt",">=",Oe.fromDate(Q)),vn("createdAt","<",Oe.fromDate(J))),ge=Ra(te,ie=>{const K=new Map(re);ie.docs.forEach(ce=>{var Ge;const Se=ce.data()||{},Ce=(Ge=Se.createdAt)!=null&&Ge.toDate?Se.createdAt.toDate():Se.createdAt?new Date(Se.createdAt):null;if(!Ce||isNaN(Ce))return;const Fe=Ce.toISOString().slice(0,10);if(!K.has(Fe))return;const be=K.get(Fe);be.value+=1,K.set(Fe,be)}),L(Array.from(K.values()))},ie=>{console.error("Error realtime serie semanal (pacientes):",ie),L(Array.from(re.values()))});return()=>{try{ge()}catch{}}},[t]);const[Et,yn]=D.useState([]),[Nn,Y]=D.useState(!0);D.useEffect(()=>{(async()=>{try{const Q=Dt(ft(xe,"actividad"),si("fecha","desc"),no(5)),re=(await _n(Q)).docs.map(te=>{const ge=te.data();return{id:te.id,title:ge.descripcion||ge.titulo||"Actividad",time:ge.resumenTiempo||""}});yn(re)}catch(Q){console.error("Error cargando actividad:",Q),yn([])}finally{Y(!1)}})()},[]);const[se,oe]=D.useState(null),[ke,Ne]=D.useState(!0);D.useEffect(()=>{(async()=>{try{const Q=Yt(xe,"integraciones","n8n"),J=await Su(Q);if(J.exists()){const re=J.data();oe({connected:!!re.connected,flowsRunning:re.flowsRunning||0,lastError:re.lastError||null})}else oe({connected:!1,flowsRunning:0,lastError:null})}catch(Q){console.error("Error cargando estado n8n:",Q),oe({connected:!1,flowsRunning:0,lastError:"No se pudo leer el estado desde Firebase."})}finally{Ne(!1)}})()},[]);const F=async()=>{try{localStorage.removeItem("odc_session")}catch{}try{await pN(ww)}catch(z){console.error("Error al cerrar sesión:",z)}window.location.href="/"},H=()=>{switch(n){case"Agenda":return d.jsx(Fj,{});case"Pacientes":return d.jsx(Gj,{});case"Facturación":return d.jsx(Uj,{});case"Inventario":return d.jsx($j,{});case"Odontograma":return d.jsx(Bj,{});case"Reportes":return d.jsx(Yj,{});case"Inicio":default:return null}};return d.jsxs("div",{className:`oc-shell ${i?"oc-dark":""}`,children:[d.jsxs("header",{className:"oc-header",children:[d.jsxs("div",{className:"oc-header-left",children:[d.jsx("img",{src:zS,alt:"OdontoCloud",className:"oc-logo"}),d.jsxs("div",{className:"oc-brand-text",children:[d.jsx("span",{className:"oc-brand-main",children:"OdontoCloud"}),d.jsx("span",{className:"oc-brand-sub",children:S?"...":u})]})]}),d.jsxs("nav",{className:"oc-nav",children:[d.jsx("button",{className:n==="Inicio"?"oc-nav-btn active":"oc-nav-btn",onClick:()=>r("Inicio"),children:e("nav_home")}),d.jsx("button",{className:n==="Agenda"?"oc-nav-btn active":"oc-nav-btn",onClick:()=>r("Agenda"),children:e("nav_agenda")}),d.jsx("button",{className:n==="Pacientes"?"oc-nav-btn active":"oc-nav-btn",onClick:()=>r("Pacientes"),children:e("nav_patients")}),d.jsx("button",{className:n==="Facturación"?"oc-nav-btn active":"oc-nav-btn",onClick:()=>r("Facturación"),children:e("nav_billing")}),d.jsx("button",{className:n==="Inventario"?"oc-nav-btn active":"oc-nav-btn",onClick:()=>r("Inventario"),children:e("nav_inventory")}),d.jsx("button",{className:n==="Odontograma"?"oc-nav-btn active":"oc-nav-btn",onClick:()=>r("Odontograma"),children:e("nav_odontogram")}),d.jsx("button",{className:n==="Reportes"?"oc-nav-btn active":"oc-nav-btn",onClick:()=>r("Reportes"),children:e("nav_reports")})]}),d.jsxs("div",{className:"oc-header-right",children:[d.jsx("input",{className:"oc-search",placeholder:e("searchPlaceholder")}),d.jsx("button",{className:"oc-icon-btn",type:"button",onClick:()=>s(z=>!z),children:i?"🌙":"☀️"}),d.jsx("button",{className:"oc-icon-btn",type:"button",onClick:F,children:e("logout")})]})]}),d.jsxs("main",{className:"oc-main-wrapper",children:[n!=="Inicio"&&H(),n==="Inicio"&&d.jsxs("div",{className:"oc-main-content",children:[d.jsxs("section",{className:"oc-hero",children:[d.jsxs("div",{className:"oc-hero-text",children:[d.jsx("h1",{children:e("welcomeTitle")}),d.jsx("p",{children:e("welcomeSubtitle")}),d.jsxs("p",{className:"oc-hero-meta",children:[e("clinicLabel"),": ",u," · ",e("userLabel"),": ",p," · ",e("roleLabel"),": ",l||"—"]})]}),d.jsxs("div",{className:"oc-hero-badge",children:[d.jsx("span",{className:"oc-hero-badge-title",children:e("stats_appointmentsToday")}),d.jsx("span",{className:"oc-hero-badge-value",children:I&&C?"…":N.citasHoy}),d.jsxs("span",{className:"oc-hero-badge-sub",children:[e("stats_patientsToday"),": ",I?"…":N.pacientesHoy]})]})]}),d.jsxs("section",{className:"oc-stats-row",children:[d.jsxs("div",{className:"stat-card",children:[d.jsx("span",{className:"stat-label",children:e("stats_patientsToday")}),d.jsx("span",{className:"stat-value",children:N.pacientesHoy})]}),d.jsxs("div",{className:"stat-card",children:[d.jsx("span",{className:"stat-label",children:e("stats_appointmentsToday")}),d.jsx("span",{className:"stat-value",children:N.citasHoy})]}),d.jsxs("div",{className:"stat-card",children:[d.jsx("span",{className:"stat-label",children:e("stats_revenueToday")}),d.jsxs("span",{className:"stat-value",children:[N.facturacionHoy.toLocaleString("es-CO")," ",d.jsx("span",{className:"stat-currency",children:e("stats_currency")})]})]}),d.jsxs("div",{className:"stat-card",children:[d.jsx("span",{className:"stat-label",children:e("stats_waiting")}),d.jsx("span",{className:"stat-value",children:N.enEspera})]})]}),d.jsxs("section",{className:"oc-grid",children:[d.jsx("div",{className:"oc-grid-main",children:d.jsxs("div",{className:"card card-quickcharts",children:[d.jsxs("div",{className:"oc-card-head",style:{alignItems:"baseline"},children:[d.jsx("h3",{children:"Pacientes registrados · Últimos 7 días"}),d.jsx("span",{className:"oc-muted",style:{marginLeft:"8px",fontSize:12},children:R})]}),y.length===0||y.every(z=>((z==null?void 0:z.value)||0)===0)?d.jsx("p",{className:"oc-weekly-empty",children:"Sin pacientes registrados en la última semana."}):d.jsx(oM,{data:y})]})}),d.jsxs("div",{className:"oc-grid-side",children:[d.jsxs("div",{className:"card",children:[d.jsx("h3",{children:e("n8n_title")}),ke?d.jsx("span",{className:"oc-muted",children:e("loading")}):d.jsx(Jj,{status:se})]}),d.jsxs("div",{className:"card",children:[d.jsxs("div",{className:"oc-card-head",children:[d.jsx("h3",{children:e("todays_appts")}),d.jsx("button",{className:"oc-small-link",onClick:()=>r("Agenda"),children:e("see_schedule")})]}),C?d.jsx("span",{className:"oc-muted",children:e("loading")}):$.length===0?d.jsx("p",{className:"oc-muted",children:e("no_appts_today")}):d.jsx("ul",{className:"oc-list",children:$.slice(0,5).map(z=>d.jsxs("li",{className:"oc-list-item",children:[d.jsxs("div",{className:"oc-list-main",children:[d.jsx("b",{children:z.pacienteNombre||"Paciente"})," ",d.jsxs("span",{className:"oc-muted",children:[e("at")," ",iM(z.fecha,t)]})]}),d.jsx("div",{className:`oc-tag oc-tag-${(z.estado||"programada").toLowerCase().replace(/\s+/g,"-")}`,children:z.estado||"programada"})]},z.id))})]}),d.jsxs("div",{className:"card",children:[d.jsx("h3",{children:e("recent_title")}),Nn?d.jsx("span",{className:"oc-muted",children:e("loading")}):Et.length===0?d.jsx("p",{className:"oc-muted",children:e("recent_empty")}):d.jsx(Xj,{items:Et})]})]})]}),d.jsxs("footer",{className:"oc-footer",children:["© ",new Date().getFullYear()," OdontoCloud | Creado por Ingeniero Juan Madrid"]})]})]})]})}const aM=()=>{try{const t=JSON.parse(localStorage.getItem("odc_session"));return t&&Date.now()-t.timestamp<1e3*60*60*24?t:null}catch{return null}};function Mh({allowedRoles:t,children:e}){var i;const n=aM();if(!n)return d.jsx(Df,{to:"/",replace:!0});const r=(i=n.rol)==null?void 0:i.toLowerCase();return t.map(s=>s.toLowerCase()).includes(r)?e:d.jsx(Df,{to:"/",replace:!0})}function lM(){return d.jsxs(Yx,{children:[d.jsx(xs,{path:"/",element:d.jsx(mV,{})}),d.jsx(xs,{path:"/dashboard_admin",element:d.jsx(Mh,{allowedRoles:["administrador"],children:d.jsx(jh,{})})}),d.jsx(xs,{path:"/dashboard_doctor",element:d.jsx(Mh,{allowedRoles:["doctor"],children:d.jsx(jh,{})})}),d.jsx(xs,{path:"/dashboard_recepcion",element:d.jsx(Mh,{allowedRoles:["recepcionista"],children:d.jsx(jh,{})})}),d.jsx(xs,{path:"*",element:d.jsx(Df,{to:"/",replace:!0})})]})}const cM="/odontocloud-react/".replace(/\/+$/,"")||"/odontocloud-react";MT(document.getElementById("root")).render(d.jsx(KC.StrictMode,{children:d.jsx(_1,{basename:cM,children:d.jsx(lM,{})})}));
