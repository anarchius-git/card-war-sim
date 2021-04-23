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
const gameSpeed = 50; // This is the constant that is handling game speed. Smaller the number, faster the gameplay. All pauses should key off this value.

function getSuit(cardID){
	// A foundational function that returns the suite of a card given the card id
	// Card ID is 0 through 51 representing all the cards of a deck
	return Math.floor(parseInt(cardID) / 13);
}

function getRank(cardID) {
	// A foundational function that returns the rank of a given card id
	// Card ID is 0 through 51. Rank is the mod of 13 and adding 1 to account for the 0-base.
	// This function returns the rank, but it does not return the FACE of a card
	return (parseInt(cardID) % 13) + 1;
}

function printCard(playerID, cardID, emptyFlag = false) {
	// This function prints a card in the Arena for a given player and a given card. This function does not print the "Hand" of a player
	// playerID 1 or 2 refering to either player
	// cardID 0..51 refering to a 0-base suit and rank definitions; -1 refers to a facedown card in the Arena
	// emptyFlag refers to whether the arena is empty or not. If this flag comes in as true, then the rest of the information is ignored
	
	var suitClass = "";
	var rankData = "";
	
	if (emptyFlag) {
		// There are no cards to display. So the UI should be changed to be lighter and not show rank
		document.getElementById("p" + playerID + "-play-card").className = "card bg-light text-muted";
		suitClass = "playing-card empty";
	} else {
		// We are displaying a card, either face up or face down, determined by the cardID that is presented
		document.getElementById("p" + playerID + "-play-card").className = "card bg-dark text-white";
		if (cardID < 0) {
			suitClass = "playing-card facedown";
			rankData = "";
		} else {

			var suitID = getSuit(cardID);
			var rankID = getRank(cardID);
			// Translate the Suit ID to the set of classes needed to display the suit
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
			// Translate the Rank ID to the Rank Face (called data below). Translate the face cards and Aces
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
	// First set the Suit Classes on the Card, which allows the display of the suit.
	// This handles all four suits as well as the facedown and empty scenario
	document.getElementById("p" + playerID + "-play-header").className = suitClass;
	document.getElementById("p" + playerID + "-play-body").className = suitClass;
	document.getElementById("p" + playerID + "-play-footer").className = suitClass;
	// Then set the custom attributes to handle the rank display
	// Actual rank display happens via custom attributes in CSS
	document.getElementById("p" + playerID + "-play-header").setAttribute("data-rank",rankData);
	document.getElementById("p" + playerID + "-play-body").setAttribute("data-rank",rankData);
	document.getElementById("p" + playerID + "-play-footer").setAttribute("data-rank",rankData);
}

function printHand(playerID, emptyFlag){
	// The purpose of this page is to print the hand of a given player. This is different from the Arena display
	// Player is 1 or 2
	// emptyFlag is boolean, true means we print an empty hand. false means we print face down
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
	await sleep(40 * gameSpeed); // sleep for 2 seconds
	// Empty the front of the card
	printCard(1,-1,false);
	printCard(2,-1,false);
	await dealDeck();
	pause(30 * gameSpeed);
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
			logArena();
			await doBattle();
		}
	}
}

async function doBattle(){
	// This is the battle function.
	// This compares the last cards on the Arena (i.e., the cards on the top of the arena pile) and decides based on their relative ranks
	await sleep(20 * gameSpeed);
	if(getRank(p1Arena[p1Arena.length - 1]) > getRank(p2Arena[p2Arena.length - 1])){
		// player 1 wins battle
		gameTaunt = "Player 1 Wins!"
		while(p2Arena.length > 0){ p1Arena.push(p2Arena.shift()); } // collect all cards in the winner's arena
		await sleep(10 * gameSpeed);
		logArena();
		while(p1Arena.length > 0){
			p1Hand.push(p1Arena.pop());
			await sleep(2 * gameSpeed);
			logArena();
		}
	} else if(getRank(p1Arena[p1Arena.length - 1]) < getRank(p2Arena[p2Arena.length - 1])){
		// player 2 wins
		gameTaunt = "Player 2 Wins!"
		while(p1Arena.length > 0){ p2Arena.push(p1Arena.shift()); } // collect all cards in the winner's arena
		await sleep(10 * gameSpeed);
		logArena();
		while(p2Arena.length > 0){
			p2Hand.push(p2Arena.pop());
			await sleep(2 * gameSpeed);
			logArena();
		}
	} else {
		// war
		gameTaunt = "This is War!"
		await sleep(500);
	}
}

function logArena(){
	console.log("Player 1 Arena: ", p1Arena);
	console.log("Player 2 Arena: ", p2Arena);
}

function logHands(){
	console.log("Player 1 Hand: ", p1Hand);
	console.log("Player 2 Hand: ", p2Hand);
}

function printArena(){
	// This function refreshes the whole playing Arena. This function is designed to be set to an Interval
	// Print the correct cards
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
	// Update the scores and taunt messages
	document.getElementById("p1-score").innerText = p1Hand.length;
	document.getElementById("p2-score").innerText = p2Hand.length;
	document.getElementById("taunt").innerText = gameTaunt;
}

function dealDeck() {
	// This function deals a deck
	while(deck.length > 0){
		p1Hand.push(deck.shift());
		p2Hand.push(deck.shift());
	}
	logHands();
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