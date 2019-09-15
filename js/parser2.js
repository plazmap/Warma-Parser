button = document.querySelector(".firebase-button");
button.addEventListener('click', function(){
   scrap();
});

function scrap () {
   let proxyUrl = "https://cors-anywhere.herokuapp.com/";
   let targetUrl = "http://wmh-wtc.com";
   let targetUrl2 = "http://wmh-wtc.com/ajax.php";
   
   //We fetch wmh-wtc.com's HTML

   fetch(proxyUrl+targetUrl)
   .then(response => response.text()) 
   .then(sourceHtml => {
      
      //Initiate new DOMParser so we can manipulate fetched HTML.

      let parser = new DOMParser().parseFromString(sourceHtml, "text/html");
      let teams = parser.querySelector("#team_list.table-bounded").querySelectorAll(".team-row");


// I) Start scrapping third tab : "team Browser" for team/players/and lists infos.
      
      //We fetch for every teams' info. Results will return an array of responseObject. Each responseObject contains the corresponding teamdata object with name id and playersid as well as all playerdata objects each with name and id.
      
      Promise.all(Array.from(teams).map(team => {
               
         let formdata = new FormData();
         formdata.append("action", "team_info");
         formdata.append("team_id",team.id);

         return fetch(proxyUrl+targetUrl2,
            {
               method: 'POST',
               body: formdata,
            })
         .then(resp => resp.text())
         .then(resp => {    

            //First we need the complete teamdata object for the current team.
            teamDetail = new teamdata();
            teamDetail.id = team.id;
            teamDetail.name = team.innerHTML;

            let teamParser = new DOMParser().parseFromString(resp, "text/html");
            
            let players = teamParser.querySelectorAll(".player-row");

            teamDetail.playersId = Array.from(players).map(player => player.id);
            

            //Then we need all playerdata to be initiated with id and name.

            let playersDetail = new Object();

            players.forEach(player => {
               playerDetail = new playerdata();
               playerDetail.id = player.id;
               playerDetail.name = player.firstChild.innerHTML;
               playerDetail.teamId = team.id;
               playersDetail[playerDetail.id] = playerDetail;

            //We now construct the response object.     
            })

            let responseObject = new Object();
            responseObject.team = teamDetail;
            responseObject.players = playersDetail;

            return responseObject;
         })
      }))

      .then(responseObjects => {

      //We now need to recreate a teamsDetail object and a playersDetail object with respectivelly all Teamdata and Playerdata objects.

         let teamsDetail = new Object();
         let playersDetail = new Object();

         responseObjects.forEach(responseObject => {
            teamsDetail[responseObject.team.id] = responseObject.team;
            Object.keys(responseObject.players).forEach(key => {
               playersDetail[responseObject.players[key].id] = responseObject.players[key];
            })
         })

         // We can now fecth all lists with each player's id.
         
         Promise.all(Object.keys(playersDetail).map(key => {
         
            let formdata = new FormData();
            formdata.append("action", "player_info");
            formdata.append("player_id",playersDetail[key].id);

            return fetch(proxyUrl+targetUrl2,
               {
                  method: 'POST',
                  body: formdata,
               })
            .then(resp => resp.text())
            .then(resp => {    

               //First we need the complete playerdata object for the current player.
               
               //We will need to generate id's for lists.These id's will be the player's id with "1" or "2" added at the end. 
               let playerDetail = playersDetail[key];
               playerDetail.listsId = [playersDetail[key].id+"1",playersDetail[key].id+"2"];


               //We now create each listdata object and complete it. 

               let playerParser = new DOMParser().parseFromString(resp, "text/html");
               let lists = playerParser.querySelectorAll(".table-slim");

               list1Detail = new listdata();
               list2Detail = new listdata();
               
               list1Detail.id = playersDetail[key].id+"1";
               list2Detail.id = playersDetail[key].id+"2";

               list1Detail.playerId = playersDetail[key].id;
               list2Detail.playerId = playersDetail[key].id;
               
               list1Detail.caster = lists[0].querySelector("h3").innerHTML;
               list2Detail.caster = lists[1].querySelector("h3").innerHTML;
               
               list1Detail.listdetail = lists[0].querySelector("h3").nextSibling.textContent;
               list2Detail.listdetail = lists[1].querySelector("h3").nextSibling.textContent;

               list1Detail.faction = lists[0].querySelector("h3").nextSibling.textContent.split("Army")[0];
               list2Detail.faction = list1Detail.faction;
               playerDetail.faction = list1Detail.faction;

               let liststring1 = lists[0].querySelector("h3").nextSibling.textContent;
               let liststring2 = lists[1].querySelector("h3").nextSibling.textContent;

               if (liststring1.includes("[Theme]")){
                  list1Detail.theme = liststring1.split("[Theme]")[1].split("[")[0];
               }
               else{
                  list1Detail.theme = "None";
               }
                  
               if (liststring2.includes("[Theme]")){
                  list2Detail.theme = liststring2.split("[Theme]")[1].split("[")[0];
               }
               else{
                  list2Detail.theme = "None";
               }

         
               let listsDetail = new Object();
               listsDetail[list1Detail.id] = list1Detail;
               listsDetail[list2Detail.id] = list2Detail;
         
            
               //We now return listsDetail.An object with both lists for each player.

               return listsDetail;
            })
         }))
         .then(resp => {

            //We now have to construct actual listsDetail main object with all lists. 

            let listsDetail = {};
            
            resp.forEach(listduo => {
               Object.keys(listduo).forEach(key => {
                  listsDetail[listduo[key].id] = listduo[key];
               })
            })
           

//II) We Now scrap for results.

            let urls = ["http://wmh-wtc.com/warmachine.php?round=1","http://wmh-wtc.com/warmachine.php?round=2","http://wmh-wtc.com/warmachine.php?round=3","http://wmh-wtc.com/warmachine.php?round=4","http://wmh-wtc.com/warmachine.php?round=5","http://wmh-wtc.com/"];

            //We map through all 6 round results URLS, and scrap for results, imbembed in page HTML.

            Promise.all(urls.map(url => 
               fetch(proxyUrl+url)
               .then(resp => resp.text())
               .then(resp => {
                  let roundResults = new Round();

                  let parser = new DOMParser();
                  let roundParser = parser.parseFromString(resp, 'text/html');
                  let round = roundParser.querySelector("header").querySelectorAll("h1")[1].innerHTML.substring(1).slice(0, -1);
                  roundResults.round = round;

                  //DO NOT ASK (they made some typo mistakes ...)
                  if (round == "Round 5"){
                     roundParser.getElementById("133").querySelectorAll(".game-row")[2].querySelector(".winner").firstElementChild.innerHTML = "Old Witch 2";
                  }
                  if (round == "Round 6"){
                     roundParser.getElementById("193").querySelectorAll(".game-row")[2].querySelector(".loser").firstElementChild.innerHTML = "Old Witch 2";
                     roundParser.getElementById("203").querySelectorAll(".game-row")[4].querySelector(".loser").firstElementChild.innerHTML = "Skarre 3";
                  }
                  
                  let pairingRows = roundParser.querySelectorAll(".pairing-row");
               
                  //We cycle through team match-ups.

                  pairingRows.forEach(pairingRow => {
                     let zone =  pairingRow.querySelector("div").querySelector("span").innerHTML;
                     let teamWinner = pairingRow.querySelector(".winner").querySelector(".team-title").querySelector("span").innerHTML;
                     let teamLoser = pairingRow.querySelector(".loser").querySelector(".team-title").querySelector("span").innerHTML;                    
                     let teamWinnerId = Object.keys(teamsDetail).filter( key => teamsDetail[key].name == teamWinner)[0];
                     let teamLoserId = Object.keys(teamsDetail).filter( key => teamsDetail[key].name == teamLoser)[0];
                     
                     let winnerTeamResult = new TeamResult();
                     winnerTeamResult.round = round;
                     winnerTeamResult.win = true;
                     winnerTeamResult.opponentId = teamLoserId;
                     teamsDetail[teamWinnerId].results[round] = winnerTeamResult;
                     
                     let loserTeamResult = new TeamResult();
                     loserTeamResult.round = round;
                     loserTeamResult.win = false;
                     loserTeamResult.opponentId = teamWinnerId;
                     teamsDetail[teamLoserId].results[round] = loserTeamResult;
                     
                     let teamPairing = new TeamPairing();
                     teamPairing.winner = teamWinnerId;
                     teamPairing.loser = teamLoserId;
                     teamPairing.zone = zone;
                     roundResults[teamPairing.zone] = teamPairing;

                     //Within each team match-up, we cycle through every player match-up.

                     let playerPairings = pairingRow.querySelectorAll(".game-row");

                     Array.from(playerPairings).forEach(playerPairing => {

                        let players = playerPairing.querySelectorAll(".table-slim");
                        let firstPlayerId = Object.keys(playersDetail).filter(key => playersDetail[key].name == players[0].firstChild.textContent)[0];
                        let secondPlayerId = Object.keys(playersDetail).filter(key => playersDetail[key].name == players[1].firstChild.textContent)[0];
                        
                        let firstPlayerResult = new PlayerResult();
                        let secondPlayerResult = new PlayerResult();
                        
                        firstPlayerResult.round = round;
                        secondPlayerResult.round = round;

                        firstPlayerResult.win = players[0].classList.contains("winner");
                        secondPlayerResult.win = players[1].classList.contains("winner");

                        firstPlayerResult.opponentId = secondPlayerId;
                        secondPlayerResult.opponentId = firstPlayerId;

                        firstPlayerResult.listPlayedId = playersDetail[firstPlayerId].listsId.filter(listId => listsDetail[listId].caster == players[0].firstElementChild.innerHTML)[0];
                        secondPlayerResult.listPlayedId = playersDetail[secondPlayerId].listsId.filter(listId => listsDetail[listId].caster == players[1].firstElementChild.innerHTML)[0];
                           
                        firstPlayerResult.opponentListplayed = secondPlayerResult.listPlayedId;
                        secondPlayerResult.opponentListplayed = firstPlayerResult.listPlayedId;

                        playersDetail[firstPlayerId].results[round] = firstPlayerResult;
                        playersDetail[secondPlayerId].results[round] = secondPlayerResult;

                        let firstPlayerListResult = new ListResults();
                        let secondPlayerListResult = new ListResults();

                        firstPlayerListResult.played = true;
                        secondPlayerListResult.played = true;

                        firstPlayerListResult.round = round;
                        secondPlayerListResult.round = round;

                        firstPlayerListResult.win = firstPlayerResult.win;
                        secondPlayerListResult.win = secondPlayerResult.win;

                        firstPlayerListResult.opponentId = secondPlayerId;
                        secondPlayerListResult.opponentId = firstPlayerId;

                        firstPlayerListResult.opponentListplayed = secondPlayerResult.listPlayedId;
                        secondPlayerListResult.opponentListplayed = firstPlayerResult.listPlayedId;

                        if (listsDetail[firstPlayerResult.listPlayedId]){
                           listsDetail[firstPlayerResult.listPlayedId].results[round] = firstPlayerListResult;
                        }
                        if (listsDetail[secondPlayerResult.listPlayedId]){
                           listsDetail[secondPlayerResult.listPlayedId].results[round] = secondPlayerListResult;
                        }
                     })
                  })

                  return roundResults;
               })
           )).then(roundsResults => {

               //We now construct the object that will be send to the database as one. 

               let yummyData = new Object();
               yummyData.results={};

               roundsResults.forEach(roundResult => {
                  yummyData.results[roundResult.round] = roundResult;    
               })

               yummyData.teams = teamsDetail;
               yummyData.players = playersDetail;
               yummyData.lists = listsDetail;

               //We can finally send Yummy Data to firebase as one.

               firebase.database().ref('/').set({ 
                  yummyData
               });

           })
         })
      }) 
   })
}
   