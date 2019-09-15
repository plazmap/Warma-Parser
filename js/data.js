//Objects for scrapping the third tab "team Browser" of the website .

function teamdata() {
    this.id=null,
    this.name=null,
    this.playersId=[]
    this.results = {}
}

function playerdata() {
    this.id = null,
    this.name=null,
    this.faction = null,
    this.teamId = null,
    this.listsId = [],
    this.results = {}
}

function listdata(){
    this.id,
    this.playerId,
    this.caster=null,
    this.theme=null,
    this.faction=null,
    this.listdetail=null,
    this.results = {}
}

function Round(){
    this.round=null,
    this.teamPairings={}
}

function TeamPairing(){
    this.zone=null,
    this.winner,
    this.loser
}

function TeamResult(){
    this.round = null,
    this.win = false,
    this.opponentId = null
}

function PlayerResult(){
    this.round = null,
    this.win = false,
    this.opponentId = null,
    this.listPlayedId = null
    this.opponentListplayed = null;
}

function ListResults(){
    this.round = null,
    this.played = false,
    this.win = false,
    this.opponentId = null,
    this.opponentListplayed = null;
}