/* Explicit source-time absence windows; no global floor shifting or angle filtering. */
(()=>{const original=ElasticRig.at;ElasticRig.at=(name,t)=>Story.active(name,t)?original(name,t):null})();
