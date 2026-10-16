/* Build deterministic physical states, then feed the original named-bone FK. */
(()=>{'use strict';const result=Director.simulate();window.SIM=result;window.FILM_DATA={width:1920,height:1080,duration:result.duration,cast:{hero:{rgb:'#111111',hollow:false}},tracks:{hero:result.track},scenes:[],weapons:[],effects:[]};})();
