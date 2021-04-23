// Global Variables
var deck = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
var p1Hand = [];
var p1Arena = [];
var p2Hand = [];
var p2Arena = [];
var shuffleTimes = 0;
var refreshTimer;
var gameRunning = false;
var gameTaunt = "";

function getSuit(cardID){
	// A foundational function that returns the suite of a card given the card id
	// Card ID is 0 through 51 representing all the cards of a deck
	return Math.floor(parseInt(cardID) / 13);
}

function getRank(cardID) {
	// A foundational function that returns the rank of a given card id
	// Card ID is 0 through 51. Rank is the mod of 13 and adding 1 to account for the 0-base.
	return (parseInt(cardID) % 13) + 1;
}

function printCard(playerID, cardID, emptyFlag = false) {
	// This function prints a card for a given player and a given card
	// playerID 1 or 2 refering to either player
	// cardID 0..51 refering to a 0-base suit and rank definitions; -1 refers to facedown
	var suitClass = "";
	var rankData = "";
	
	//console.log("Printing Card. Player - " + playerID + " card ID - " + cardID + " empty flag - " + emptyFlag);
	
	if (emptyFlag) {
		// The card set is empty, make the card lighter
		document.getElementById("p" + playerID + "-play-card").className = "card bg-light text-muted";
		suitClass = "playing-card empty";
	} else {
		// A card exists to make the card dark
		document.getElementById("p" + playerID + "-play-card").className = "card bg-dark text-white";
		if (cardID < 0) {
			suitClass = "playing-card facedown";
			rankData = "";
		} else {

			var suitID = getSuit(cardID); //Math.floor(parseInt(cardID) / 13);
			var rankID = getRank(cardID); //(parseInt(cardID) % 13) + 1;
			// determine the suit class
			// 0 = clubs; 1 = diamonds; 2 = hearts; 3 = spades
			switch(suitID) {
				case 0:
					suitClass = "playing-card clubs"
					break;
				case 1:
					suitClass = "playing-card diamonds"
					break;
				case 2:
					suitClass = "playing-card hearts"
					break;
				case 3:
					suitClass = "playing-card spades"
					break;
				default:
				console.log("Error: incorrect Suit ID: " + suitID);		
			}
			// RankID correction
			rankData = rankID.toString();
			switch(rankID) {
				case 1:
					rankData = "A";
					break;
				case 11:
					rankData = "J";
					break;
				case 12:
					rankData = "Q";
					break;
				case 13:
					rankData = "K";
					break;
			}
		}
	}
	//console.log(cardID, suitID, rankID, suitClass, rankData);
	// First set the classes on the card
	document.getElementById("p" + playerID + "-play-header").className = suitClass;
	document.getElementById("p" + playerID + "-play-body").className = suitClass;
	document.getElementById("p" + playerID + "-play-footer").className = suitClass;
	// Then set the custom attributes
	document.getElementById("p" + playerID + "-play-header").setAttribute("data-rank",rankData);
	document.getElementById("p" + playerID + "-play-body").setAttribute("data-rank",rankData);
	document.getElementById("p" + playerID + "-play-footer").setAttribute("data-rank",rankData);
	// Add the handling for empty cards
	//if (cardID < 0) {
	//	document.getElementById("p" + playerID + "-play-body").setAttribute("data-rank","•");
	//}
}

function printHand(playerID, emptyFlag){
	// The purpose of this page is to print the hand of a given player.
	// Player is 1 or 2
	// Count is basically binary, 0 means we print an empty hand. Else we print face down
	if (emptyFlag) {
		document.getElementById("p" + playerID + "-hand-card").className = "card bg-light text-muted";
		document.getElementById("p" + playerID + "-hand-header").className = "playing-card empty";
		document.getElementById("p" + playerID + "-hand-body").className = "playing-card empty";
		document.getElementById("p" + playerID + "-hand-footer").className = "playing-card empty";
	} else {
		// facedown for player 1
		document.getElementById("p" + playerID + "-hand-card").className = "card bg-dark text-white";
		document.getElementById("p" + playerID + "-hand-header").className = "playing-card facedown";
		document.getElementById("p" + playerID + "-hand-body").className = "playing-card facedown";
		document.getElementById("p" + playerID + "-hand-footer").className = "playing-card facedown";
	}
}

async function playGame() {
	// This function shuffles the cards, deals then and plays the game
	//shuffleDeck();
	console.log("Shuffling the deck");
	shuffleDeck();
	await sleep(2000); // sleep for 2 seconds
	// Empty the front of the card
	printCard(1,-1,false);
	printCard(2,-1,false);
	await dealDeck();
	pause(1500);
	// Show that the decks are dealt
	printCard(1,-1,true);
	printCard(2,-1,true);
	printHand(1,false);
	printHand(2,false);
	// Main game loop
	gameRunning = true;
	refreshTimer = setInterval(printArena, 100);
	while(gameRunning){
		// confirm that neither hand is empty
		if((p1Hand.length == 0) || (p2Hand.length == 0)) {
			// stop the game
			gameRunning = false;
			clearInterval(refreshTimer); //stop the refresh
			printArena(); // just print it at some point
			if(p1Hand.length == 0) { printHand(1, true);}
			if(p2Hand.length == 0) { printHand(2, true);}
			// logic to determine winner goes here
		} else {
			// Each player deals a hand
			//await sleep(2000); // this is needed for some reason, pause does not work here
			p1Arena.push(p1Hand.shift());
			p2Arena.push(p2Hand.shift());
			logDecks();
			await doBattle();
		}
	}
}

async function doBattle(){
	// returns whether the game is still running
	await sleep(1000);
	if(getRank(p1Arena[p1Arena.length - 1]) > getRank(p2Arena[p2Arena.length - 1])){
		// player 1 wins battle
		gameTaunt = "Player 1 Wins!"
		while(p2Arena.length > 0){ p1Arena.push(p2Arena.shift()); } // collect all cards in the winner's arena
		await sleep(500);
		logDecks();
		while(p1Arena.length > 0){
			p1Hand.push(p1Arena.pop());
			await sleep(75);
			logDecks();
		}
	} else if(getRank(p1Arena[p1Arena.length - 1]) < getRank(p2Arena[p2Arena.length - 1])){
		// player 2 wins
		gameTaunt = "Player 2 Wins!"
		while(p1Arena.length > 0){ p2Arena.push(p1Arena.shift()); } // collect all cards in the winner's arena
		await sleep(500);
		logDecks();
		while(p2Arena.length > 0){
			p2Hand.push(p2Arena.pop());
			await sleep(75);
			logDecks();
		}
	} else {
		// war
		gameTaunt = "This is War!"
		await sleep(500);
	}
}

function logDecks(){
	console.log(p1Arena);
	console.log(p2Arena);
}

function printArena(){
	if(p1Arena.length == 0){
		printCard(1,-1,true);
	} else {
		printCard(1,p1Arena[p1Arena.length - 1],false);
	}
	if(p2Arena.length == 0){
		printCard(2,-1,true);
	} else {
		printCard(2,p2Arena[p2Arena.length - 1],false);
	}
	document.getElementById("p1-score").innerHTML = p1Hand.length;
	document.getElementById("p2-score").innerHTML = p2Hand.length;
	document.getElementById("taunt").innerHTML = gameTaunt;
	//pause(500);
}

function dealDeck() {
	// This function deals a deck
	while(deck.length > 0){
		p1Hand.push(deck.shift());
		p2Hand.push(deck.shift());
	}
	console.log(p1Hand);
	console.log(p2Hand);
}

function shuffleDeck() {
	// This function initializes and shuffles a deck of cards
	for(i=0; i<52; i++){
		deck[i] = i;
	}
	// Shuffle cards slowly
	shuffleTimes = 100;
	refreshTimer = setInterval(swap2RandomCards, 10);
}

function swap2RandomCards(){
	// Pick random card numbers to swap
	var randomCard1 = Math.floor((Math.random() * 52));
	var randomCard2 = Math.floor((Math.random() * 52));
	//console.log("Swapping cards: ", randomCard1, " & ", randomCard2)
	printCard(1,deck[randomCard1], false);
	printCard(2,deck[randomCard2], false);
	if (randomCard1 != randomCard2){
		swapCards(randomCard1, randomCard2);
	}
	//printCard(1,deck[randomCard1]);
	//printCard(2,deck[randomCard2]);
	
	// Decrement the shuffle timer
	shuffleTimes--;
	// Stop shuffling
	if(shuffleTimes < 0) {
		clearInterval(refreshTimer);
		console.log(deck);
		printCard(1,-1,false);
		printCard(2,-1,false);
	}
}

function swapCards(card1, card2){
	var tmp = deck[card1];
	deck[card1] = deck[card2];
	deck[card2] = tmp;
}

function randomCard() {
	// prints a random card to test
	var randomCard = Math.floor((Math.random() * 52));
	printCard(2,randomCard, false);
	//printCard(2,-1);
	//printCard(1,52);
}

// https://www.sitepoint.com/delay-sleep-pause-wait/
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function pause(miliseconds) {
	var currentTime = new Date().getTime();
	while (currentTime + miliseconds >= new Date().getTime()) {
	}
}

//async function delayedGreeting() {
//  console.log("Hello");
//  await sleep(2000);
//  console.log("World!");
//}

//delayedGreeting();
//console.log("Goodbye!");