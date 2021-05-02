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
var player1Name = "Player 1"
var player2Name = "Player 2"
var gameSpeed = 50; // This is the constant that is handling game speed. Smaller the number, faster the gameplay. All pauses should key off this value.
var debugMode = false; // If you set debugMode to true, then all the hands and the deck will be printed in the console, remove for production

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

function printGameSpeed(){
	// Function updats the game speed badge
	var gameSpeedBadge = document.getElementById("game-speed-badge");
	gameSpeedBadge.innerHTML = (50 - gameSpeed)/10;
}

async function playGame() {
	// This function shuffles the cards, deals then and plays the game
	// The first step is to make sure the UI is ready to go
	document.getElementById("gme-ctr-play").disabled = true; // disable the button
	document.getElementById("gme-ctr-dynamic").innerText = "Speed Up Simulation"; // rename the button to Speed Up
	document.getElementById("gme-ctr-dynamic").disabled = false; // disable the button
	if(debugMode){console.log("Shuffling the deck");}
	shuffleDeck();
	await sleep(40 * gameSpeed); // sleep for 2 seconds
	// Empty the front of the card
	printCard(1,-1,false);
	printCard(2,-1,false);
	await dealDeck();
	// Show that the decks are dealt
	printCard(1,-1,true);
	printCard(2,-1,true);
	printHand(1,false);
	printHand(2,false);
	await sleep(20 * gameSpeed);
	// Main game loop
	gameRunning = true;
	refreshTimer = setInterval(printArena, 100);
	while(gameRunning){
		// confirm that neither hand is empty
		if((p1Hand.length == 0) || (p2Hand.length == 0)) {
			// stop the game
			gameRunning = false;
			clearInterval(refreshTimer); //stop the refresh
			printArena(); // Print one last time to make sure the UI is caught up
			if(p1Hand.length == 0) { printHand(1, true);}
			if(p2Hand.length == 0) { printHand(2, true);}
			// logic to determine winner goes here
		} else {
			// Each player deals a card from their hand
			p1Arena.push(p1Hand.shift());
			p2Arena.push(p2Hand.shift());
			logArena();
			await doBattle();
		}
	}
	// The game is done. We need to clean things up, so rename the dynamic button
	document.getElementById("gme-ctr-dynamic").innerText = "Reset Simulation"; // rename the button to Reset Simulation
}

function tweakGame(){
	// This function handles the dynamic button function during the game play
	var buttonText = document.getElementById("gme-ctr-dynamic").innerText;
	if (buttonText == "Speed Up Simulation") {
		// Speed up the simulation
		switch(gameSpeed) {
			case 50:
				gameSpeed = 40;
				break;
			case 40:
				gameSpeed = 30;
				break;
			case 30:
				gameSpeed = 20;
				break;
			case 20:
				gameSpeed = 10;
				break;
			default:
				gameSpeed = 0;
		}
		printGameSpeed();
	}
	if (buttonText == "Reset Simulation") {
		// Bring everything back to starting
		deck = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
		p1Hand = [];
		p1Arena = [];
		p2Hand = [];
		p2Arena = [];
		gameSpeed = 50;
		// Reflect the UI
		printCard(1, -1, true);
		printCard(2, -1, true);
		printHand(1, true);
		printHand(2, true);
		printGameSpeed();
		gameTaunt = "";
		printArena();
		document.getElementById("gme-ctr-dynamic").innerText = "Game Controls";
		document.getElementById("gme-ctr-dynamic").disabled = true;
		document.getElementById("gme-ctr-play").disabled = false;
	}
}

async function doBattle(){
	// This is the battle function.
	// This compares the last cards on the Arena (i.e., the cards on the top of the arena pile) and decides based on their relative ranks
	await sleep(20 * gameSpeed);
	if(getRank(p1Arena[p1Arena.length - 1]) > getRank(p2Arena[p2Arena.length - 1])){
		// player 1 wins battle
		gameTaunt = player1Name + " Wins!"
		while(p2Arena.length > 0){ p1Arena.push(p2Arena.shift()); await sleep(2 * gameSpeed); logArena();} // collect all cards in the winner's arena
		await sleep(6 * gameSpeed);
		while(p1Arena.length > 0){ p1Hand.push(p1Arena.pop()); await sleep(2 * gameSpeed); logArena();} // move the cards from the arena to the hand
		await sleep(6 * gameSpeed);
	} else if(getRank(p1Arena[p1Arena.length - 1]) < getRank(p2Arena[p2Arena.length - 1])){
		// player 2 wins battle
		gameTaunt = player2Name + " Wins!"
		while(p1Arena.length > 0){ p2Arena.push(p1Arena.shift()); await sleep(2 * gameSpeed); logArena();} // collect all cards in the winner's arena
		await sleep(6 * gameSpeed);
		while(p2Arena.length > 0){ p2Hand.push(p2Arena.pop()); await sleep(2 * gameSpeed); logArena();} // move the cards from the arena to the hand
		await sleep(6 * gameSpeed);
	} else {
		// war
		gameTaunt = "This is War!"
		await sleep(20 * gameSpeed);
		// Make sure there are enough cards in hand to war.
		if((p1Hand.length > 1) && (p2Hand.length > 1)){
			// Enough cards in hand for war
			// Play the extra card into the arena
			p1Arena.push(p1Hand.shift());
			p2Arena.push(p2Hand.shift());
			gameTaunt = "Up the Stakes!";
			logArena();
		} else { // Not enough cards for war. Someone lost the game
			if(p1Hand.length < 2){ // player 1 lost
				gameTaunt = "Not enough cards for " + player1Name;
				// Clear out Player 1's Hand
				while(p1Hand.length > 0){p1Arena.push(p1Hand.pop()); await sleep(2 * gameSpeed); logArena();} // bleed off player 1's hand to his arena
				await sleep(6 * gameSpeed);

				// Do standard moves for Player 2 victory
				while(p1Arena.length > 0){ p2Arena.push(p1Arena.shift()); await sleep(2 * gameSpeed); logArena();} // collect all cards in the winner's arena
				await sleep(6 * gameSpeed);
				while(p2Arena.length > 0){ p2Hand.push(p2Arena.pop()); await sleep(2 * gameSpeed); logArena();} // move the cards from the arena to the hand
				gameTaunt = player2Name + " Wins!"
				await sleep(6 * gameSpeed);
			}
			if(p2Hand.length < 2){ // player 2 lost
				gameTaunt = "Not enough cards for " + player2Name;
				// Clear out Player 2's Hand
				while(p2Hand.length > 0){p2Arena.push(p2Hand.pop()); await sleep(2 * gameSpeed); logArena();} // bleed off player 1's hand to his arena
				await sleep(6 * gameSpeed);
				
				// Do the standard moves for player 1 victory
				while(p2Arena.length > 0){ p1Arena.push(p2Arena.shift()); await sleep(2 * gameSpeed); logArena();} // collect all cards in the winner's arena
				await sleep(6 * gameSpeed);
				while(p1Arena.length > 0){ p1Hand.push(p1Arena.pop()); await sleep(2 * gameSpeed); logArena();} // move the cards from the arena to the hand
				gameTaunt = player1Name + " Wins!"
				await sleep(6 * gameSpeed);
			}
		}
	}
}

function logArena(){
	if(debugMode){
		console.log("Player 1 Arena: ", p1Arena);
		console.log("Player 2 Arena: ", p2Arena);
	}
}

function logHands(){
	if(debugMode){
		console.log("Player 1 Hand: ", p1Hand);
		console.log("Player 2 Hand: ", p2Hand);
	}
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