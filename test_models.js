fetch("https://openrouter.ai/api/v1/models")
  .then(r => r.json())
  .then(d => {
     let c = 0;
     for(let m of d.data) {
       if(m.id.includes("flux") || m.id.includes("imagen") || m.id.includes("image")) {
           console.log(m.id);
           c++;
       }
     }
     console.log("Total matched:", c);
  });
