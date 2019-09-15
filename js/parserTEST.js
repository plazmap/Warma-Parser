let proxyUrl = "https://cors-anywhere.herokuapp.com/";
let targetUrl = "http://wmh-wtc.com/ajax.php";

let idArray = ["10355","10356","10357"];

Promise.all(idArray.map(id => {
  let formdata = new FormData();
  formdata.append("action", "player_info");
  formdata.append("player_id",id);

  return fetch(proxyUrl+targetUrl,
      {
          method: 'POST',
          body: formdata,
      })
      .then(resp => {
          console.log(id);
          return resp.text()
      })
}))
.then(results => {
    console.log(results);
});




// Promise.all(idArray.map(id => {

//     let formdata = new FormData();
//     formdata.append("action", "team_info");
//     formdata.append("team_id",id);
    
//     return fetch(proxyUrl+targetUrl,
//         {
//            method: 'POST',
//            body: formdata,
//         })
//         .then(resp => {
//             return resp.text()
//         })
// }))

// .then(results => console.log(results));


