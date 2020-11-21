import React from 'react';
import GameOpts, { VirtualMode } from "./GameOpts";
import beer1 from './assets/beer1.png'
import drink1 from './assets/drink1.png'
import shot1 from './assets/shot1.png'
import orator from './assets/orator.png'
import movie1 from './assets/movie1.png'
import confess from './assets/confess.png'
import male from './assets/male.png'
import female from './assets/female.png'
import jeop from './assets/jeop.png'
import think from './assets/think.png'
import superlatives from './assets/superlatives.png'
import alcoholism from './assets/alcoholism.png'
import ketchup from './assets/ketchup.png'
import categories from './assets/categories.png'
import hotseat from './assets/hotseat.png'
import hotseat2 from './assets/hotseat2.png'
import races from './assets/races.png'
import marriage from './assets/marriage.png'
import cake from './assets/cake.png'
import survey from './assets/survey.png'
import elephant from './assets/elephant.png'
import dare from './assets/dare.png'
import tune from './assets/tune.png'
import single from './assets/single.png'
import love from './assets/love.png'
import never from './assets/never.png'
import chug from './assets/chug.png'
import yenta from './assets/yenta.png'
import rps from './assets/rps.png'
import name from './assets/name.png'
import lovehate from './assets/lovehate.png'
import noah from './assets/noah.png'
import question from './assets/question.png'
import alcoholic from './assets/alcoholic.png'
import nickname from './assets/nickname.png'
import viking from './assets/viking.png'
import force from './assets/force.png'
import quiet from './assets/quiet.png'
import sponge from './assets/sponge.png'
import sleuth from './assets/sleuth.png'
import spy from './assets/spy.png'
import coin from './assets/coin.png'

import Card, { CardData, CardType } from "./Card";

function MakeCard(title: string, body: string, img: any, type: CardType) {
 return new CardData(title, body, img, type, [], VirtualMode.UNSET);
}

function MakeLiveCard(title: string, body: string, img: any, type: CardType) {
 return new CardData(title, body, img, type, [], VirtualMode.LIVE);
}

function MakeVirtualCard(title: string, body: string, img: any, type: CardType) {
 return new CardData(title, body, img, type, [], VirtualMode.VIRTUAL);
}

function MakeCardWithTips(title: string, body: string, img: any, type: CardType, tips: string[]) {
 return new CardData(title, body, img, type, tips, VirtualMode.UNSET);
}

function MakeLiveCardWithTips(title: string, body: string, img: any, type: CardType, tips: string[]) {
 return new CardData(title, body, img, type, tips, VirtualMode.LIVE);
}

function MakeVirtualCardWithTips(title: string, body: string, img: any, type: CardType, tips: string[]) {
 return new CardData(title, body, img, type, tips, VirtualMode.VIRTUAL);
}

let CardDataList = [
	MakeLiveCard(
		"Feeling Lucky?",
		`Flip a coin. Heads, each player drinks once. Tails, you drink once 
		for each player.`,
		coin,
		CardType.ACTION),

	MakeCard(
		"Force Field",
		`Every time selected player is ordered  to drink, everyone else must 
		also drink.`,
		force,
		CardType.STATUS),

	MakeVirtualCard(
		"I Spy",
		`Play the game I Spy with an object on someone else's Zoom screen. 
		Winner chooses a losing player to drink.`,
		spy,
		CardType.ACTION),

	MakeCardWithTips(
		"Seeker's Delight",
		`Choose a player. Now pick a rather mundane object in the house
		that they probably have somewhere. If they find one in under a minute
		everyone drinks.`,
		sleuth,
		CardType.ACTION,
		["A Pen", "A Checkbook", "Stamps", "TV Remote"]),

	MakeVirtualCard(
		"We Can't Hear You!",
		`All muted players drink.`,
		sponge,
		CardType.INTERRUPT),

	MakeVirtualCard(
		"Shut the Fuck Up",
		`All non-muted players drink.`,
		quiet,
		CardType.INTERRUPT),

	MakeCard(
		"Viking Master",
		`This player is now the Viking Master. If no one playing knows what 
		that means, google it and everyone drinks.`,
		viking,
		CardType.STATUS),

	MakeVirtualCard(
		"My Name is My Name",
		`Give a nickname to a player. Anyone who forgets to use the nickname
		must drink. They should update  their Zoom name`,
		nickname,
		CardType.STATUS),
	MakeLiveCard(
		"My Name is My Name",
		`Give a nickname to a player. Anyone who forgets to use the nickname
		must drink.`,
		nickname,
		CardType.STATUS),

	MakeCard(
		"Question Master",
		`If anyone answers a question from this player, that person must 
		drink. You can play this on yourself`,
		question,
		CardType.STATUS),

	MakeCardWithTips(
		"Categories",
		`Pick a category. Now go around the player order from the top of
		the screen and name things within the category. First to hesitate 
		or repeat a word must drink.`,
		categories,
		CardType.ACTION,
		[`You seriously needed to see examples for fucking categories?? 
		Jesus christ take two drinks for that and learn a little creativity`]),

	MakeCardWithTips(
		"Survey",
		`Pose a question. Go around the circle; everyone must answer. 
		They may abstain only if they take a shot.`,
		survey,
		CardType.ACTION,
		[
			"Where would your dream vacation be?",
			"What's the craziest place you have hooked up?",
			"Would you rather live in a world without music or without color?"
		]),

	MakeCard(
		"The Noah",
		`Everyone take a drink for your humble creator. Unless he is playing, 
		then he takes a fucking drink.`,
		noah,
		CardType.INTERRUPT),

	MakeCardWithTips(
		"Love it or Hate it",
		`Announce something that people might love or hate. Everyone goes 
		around and says either “love it” or “hate it.” You go last, everyone 
		drinks if they didn’t match your response.`,
		lovehate,
		CardType.ACTION,
		[
			"Sex with the lights on",
			"Smoking weed",
			"Eating sushi",
			"Contemplating the emptiness of the universe"
		]),

	MakeCard(
		"Name Game",
		`You must name everyone else playing the game. If you 
		fail, you drink. If everyone knows each other well, level it up 
		(last names, middle names, siblings names, etc etc)`,
		name,
		CardType.ACTION),

	MakeVirtualCard(
		"RPS",
		`Choose two players who are on the same screen. They play rock paper 
		scissors, best of three. Loser drinks. For every tie, the spectators 
		drink.`,
		rps,
		CardType.ACTION),
	MakeLiveCard(
		"RPS",
		`Choose two players to play rock paper scissors, best of three.
		Loser drinks. For every tie, the spectators drink.`,
		rps,
		CardType.ACTION),

	MakeCard(
		"Chug",
		`Finish your drink. If you do it in under 9 seconds, 
		everyone else must take a drink.`,
		chug,
		CardType.ACTION),

	MakeCard(
		"Yenta",
		`Pick 2 players. They must compliment each other, 
		then drink together. Mazel tov!`,
		yenta,
		CardType.ACTION),

	MakeCard(
		"Never Have I Ever",
		`Play Never Have I Ever with three fingers. You start.`,
		never,
		CardType.ACTION),

	MakeCard(
		"Name that Tune",
		`Start humming a song. First player to name the tune chooses 
		a losing player to drink.`,
		tune,
		CardType.ACTION),

	MakeCard(
		"Single",
		`All single players must drink. Toast to how awesome it is 
		or how lonely it is, your call.`,
		single,
		CardType.INTERRUPT),

	MakeCard(
		"Love Yourself",
		`All players must drink as many times as the number of times 
		that they have masturbated this past week. Everyone counts together.`,
		love,
		CardType.INTERRUPT),

	MakeCard(
		"Elephant in the Room",
		`If two players in the game have hooked up in the past, they must 
		both drink and silently recall the last time it happened.`,
		elephant,
		CardType.INTERRUPT),

	MakeCardWithTips(
		"Dare or Dare",
		`Dare a player to do something. They can refuse by taking a shot.`,
		dare,
		CardType.ACTION,
		[
			"Lick someone",
			"Do 10 pushups (on camera!)",
			"Do something sexy or whatever"
		]),

	MakeCard(
		"Birthday Party",
		`Player with the closest birthday must drink. If it is their 
		birthday today, they must take a shot.`,
		cake,
		CardType.INTERRUPT),

	MakeCard(
		"Mawwiage",
		`All players in a relationship must drink. If your SO is playing, 
		say something cute and drink twice.`,
		marriage,
		CardType.INTERRUPT),

	MakeVirtualCard(
		"Day at the Races",
		`Choose two players who are on the same screen to race to the bottom. 
		Loser drinks again. Everyone else should make racing noises.`,
		races,
		CardType.ACTION),
	MakeLiveCard(
		"Day at the Races",
		`Choose two players to race to the bottom. Loser drinks again. 
		Everyone else should make racing noises.`,
		races,
		CardType.ACTION),

	MakeLiveCard(
		"Race to the Bottom",
		`Everyone must finish their drink. Last two players get everyone 
		new drinks.`,
		// TODO(ncteisen): add new photo.
		races,
		CardType.INTERRUPT),

	MakeCard(
		"Burning Throne",
		`Select a player. They are now in the burning throne. They are 
		asked one question by every other player. They may refuse to 
		answer only if they drink. You ask the first question.`,
		hotseat2,
		CardType.ACTION),

	MakeCard(
		"Hot Seat",
		`YOU are in the hot seat! All other players get to ask you one 
		question. You may refuse to answer only if you drink. If you answer 
		all questions, everyone drinks.`,
		hotseat,
		CardType.ACTION),

	MakeCard(
		"Catch Up",
		`Everyone decide on the who the most sober player is. He or 
		she must take a shot.`,
		ketchup,
		CardType.INTERRUPT),

	MakeCard(
		"Alcoholism is Funny",
		`Everyone decide on who is the drunkest player. They must drink twice. 
		Laugh at how drunk they are.`,
		alcoholism,
		CardType.INTERRUPT),

	MakeVirtualCardWithTips(
		"Superlatives",
		`Create and announce a superlative. Pause for five seconds, 
		then everyone writes in the Zoom chat to who they think the winner 
		should be. Everyone drinks for each time they are named in the 
		chat.`,
		superlatives,
		CardType.ACTION,
		[
			"Most likely to get COVID",
			"Least likely to poop today",
			"Best dancer",
			"Most likely to be the star of a sitcom",
		]),
	MakeLiveCardWithTips(
		"Superlatives",
		`Create and announce a superlative. Pause for five seconds, 
		then everyone points to who they think the winner should be.
		Everyone drinks for each finger pointed at them.`,
		superlatives,
		CardType.ACTION,
		[
			"Most likely to get COVID",
			"Least likely to poop today",
			"Best dancer",
			"Most likely to be the star of a sitcom",
		]),

	MakeCardWithTips(
		"Think or Drink",
		`Ask another player a relatively easy question. They must
		immediately start drinking. They may only stop once they
		can answer the question.`,
		think,
		CardType.ACTION,
		[
			"Name a movie with Brad Pitt",
			"Who was the third president",
			"Name an NFL quarterback",
		]),

	MakeCardWithTips(
		"Quiz Bowl",
		`Create and announce a quiz-like question. First player to yell the 
		right answer chooses a losing player to drink. This might be similar 
		to some game show.`,
		jeop,
		CardType.ACTION,
		[
			"This is the only state in which the biggest three cities start with the letter C",
			"This was the only president to server two non-consecutive terms",
			"This chemical bond forms between two non metal elements and involves a shared electron",
		]),

	MakeCard(
		"Fuck Guys",
		"All male players must drink.",
		male,
		CardType.INTERRUPT),

	MakeCard(
		"Fuck Girls",
		"All female players must drink.",
		female,
		CardType.INTERRUPT),

	MakeCardWithTips(
		"Last Person To",
		`Announce an action or event. The player(s) who did that thing 
		most recently must drink. Figure it out.`,
		confess,
		CardType.ACTION,
		[
			"Last person to have sex",
			"Last person to puke from drinking",
			"Last person to masturbate",
			"Last person to smoke a cig",
		]),

	MakeVirtualCard(
		"Drink",
		"Take a drink! Make sure you do it on camera.",
		beer1,
		CardType.ACTION),
	MakeLiveCard(
		"Drink",
		"Take a drink!",
		beer1,
		CardType.ACTION),

	MakeVirtualCard(
		"Big Drink",
		"Take a big drink! Make sure you do it on camera.",
		drink1,
		CardType.ACTION),
	MakeLiveCard(
		"Big Drink",
		"Take a big drink!",
		drink1,
		CardType.ACTION),

	MakeCard(
		"The Orator",
		"Make a long toast. Everyone takes a long drink.",
		orator,
		CardType.ACTION),

	MakeCard(
		"Shot",
		`You must take a shot. Or, if you are a softy, go 
		ahead and take a big drink.`,
		shot1,
		CardType.ACTION),

	MakeLiveCard(
		"Molotov Cocktail",
		`Selected player must take a shot. The players to their right and 
		left must take a drink.`,
		// TODO(ncteisen): add a new photo.
		shot1,
		CardType.ACTION),

	MakeCard(
		"Movie Buff",
		`Start acting out a movie or movie character (no talking!). First 
		player to name the movie or character chooses a losing player to 
		drink.`,
		movie1,
		CardType.ACTION),

	MakeLiveCard(
		"Sobriety Test",
		`Select a player to stand on one foot and close their eyes for 10 
		seconds. If they fail, they drink. if they succeed, everyone else 
		drinks twice.`,
		// TODO(ncteisen): add a new photo.
		shot1,
		CardType.ACTION),

	MakeLiveCard(
		"Waterfall",
		`Everyone starts drinking, they must continue until the person to 
		their left stops. You may stop first.`,
		// TODO(ncteisen): add a new photo.
		shot1,
		CardType.ACTION),

	MakeLiveCard(
		"Let's Play a Game",
		`Selected player must flip a coin until they get two heads in a row. 
		They must drink for every tails.`,
		// TODO(ncteisen): add a new photo.
		shot1,
		CardType.ACTION),

	MakeLiveCard(
		"Copy Me",
		`Start by doing a motion. The next player repeats yours then add 
		one of their own. First player to forget the pattern must drink.`,
		// TODO(ncteisen): add a new photo.
		shot1,
		CardType.ACTION),

	MakeLiveCard(
		"Suave",
		`Chose two players to ad-lib a cool handshake. If it gets awkward 
		or clumsy, they both drink.`,
		// TODO(ncteisen): add a new photo.
		shot1,
		CardType.ACTION),

	MakeLiveCard(
		"Comedian",
		`Choose a player to tell a joke. If everyone agrees it is funny, 
		everyone drinks. If not, the teller drinks.`,
		// TODO(ncteisen): add a new photo.
		shot1,
		CardType.ACTION),

	MakeLiveCard(
		"Think You Can Dance?",
		`Select one or two players to dance in front of everyone else. If 
		the group decides they did a good job, everyone drinks. If not the 
		dancer(s) must drink.`,
		// TODO(ncteisen): add a new photo.
		shot1,
		CardType.ACTION),

	MakeCard(
		"The Rule Book",
		`Make some new rule. But don't be a dick about it. Also drink.`,
		// TODO(ncteisen): add a new photo.
		shot1,
		CardType.ACTION),

	MakeLiveCard(
		"Hockey",
		`Spin a coin and call out a player’s name. That player may flick the 
		coin. Anyone whose drink is hit (rebounds count!) must drink for the 
		duration of another coin spin.`,
		// TODO(ncteisen): add a new photo.
		shot1,
		CardType.ACTION),

	MakeLiveCard(
		"Sharpshooter",
		`Pick a reasonable projectile and target. Selected player must toss or 
		throw the projectile in or onto the target. If they hit everyone cheers 
		and drinks. If they miss everyone boos and they drink.`,
		// TODO(ncteisen): add a new photo.
		shot1,
		CardType.ACTION),

	MakeLiveCard(
		"Boner Alert",
		`This player may make a finger-boner at any time. First player to see 
		it and yell out "boner alert!" chooses a losing player to drink.`,
		// TODO(ncteisen): add a new photo.
		shot1,
		CardType.STATUS),

	MakeLiveCard(
		"Made You Look",
		`If this player is able to make anyone look at the ceiling, that 
		person must drink.`,
		// TODO(ncteisen): add a new photo.
		shot1,
		CardType.STATUS),

	MakeLiveCard(
		"Bartender",
		`If anyone needs a new drink, this player must get it for them.`,
		// TODO(ncteisen): add a new photo.
		shot1,
		CardType.STATUS),
]

export default CardDataList;