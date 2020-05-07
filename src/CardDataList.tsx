import React from 'react';
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
import judge from './assets/judge.png'
import chug from './assets/chug.png'
import yenta from './assets/yenta.png'
import rps from './assets/rps.png'
import name from './assets/name.png'
import lovehate from './assets/lovehate.png'

import Card, { CardData, CardType } from "./Card";

let CardDataList = [

	new CardData(
		"Love it or Hate it",
		`Announce something that people might love or hate. Everyone goes 
		around and says either “love it” or “hate it.” You go last, everyone 
		drinks if they didn’t match your response.`,
		lovehate,
		CardType.ACTION),

	new CardData(
		"Name Game",
		`You must name everyone else playing the game. If you 
		fail, you drink. If everyone knows each other well, level it up 
		(last names, middle names, siblings names, etc etc)`,
		name,
		CardType.ACTION),

	new CardData(
		"RPS",
		`Choose two players who are on the same screen. They play rock paper 
		scissors, best of three. Loser drinks. For every tie, the spectators 
		drink.`,
		rps,
		CardType.ACTION),

	new CardData(
		"Chug",
		`Finish your drink. If you do it in under 9 seconds, 
		everyone else must take a drink.`,
		chug,
		CardType.ACTION),

	new CardData(
		"Yenta",
		`Pick 2 players. They must compliment each other, 
		then drink together. Mazel tov!`,
		yenta,
		CardType.ACTION),

	new CardData(
		"Never Have I Ever",
		`Play Never Have I Ever with three fingers. You start.`,
		never,
		CardType.ACTION),

	new CardData(
		"Don't Judge Me But...",
		`Play Don’t Judge Me But with three fingers. Say something you have 
		done. Everyone drinks and puts a finger down if they haven’t done it. 
		(this is the opposite of Never Have I Ever)`,
		judge,
		CardType.ACTION),

	new CardData(
		"Name that Tune",
		`Start humming a song. First player to name the tune chooses 
		a losing player to drink.`,
		tune,
		CardType.ACTION),

	new CardData(
		"Single",
		`All single players must drink. Toast to how awesome it is 
		or how lonely it is, your call.`,
		single,
		CardType.INTERRUPT),

	new CardData(
		"Love Yourself",
		`All players must drink as many times as the number of times 
		that they have masturbated this past week. Everyone counts together.`,
		love,
		CardType.ACTION),

	new CardData(
		"Survey",
		`Pose a question. Go around the circle; everyone must answer. 
		They may abstain only if they take a shot.`,
		survey,
		CardType.ACTION),

	new CardData(
		"Elephant in the Room",
		`If two players in the game have hooked up in the past, they must 
		both drink and silently recall the last time it happened.`,
		elephant,
		CardType.INTERRUPT),

	new CardData(
		"Dare or Dare",
		`Dare a player to do something. They can refuse by taking a shot.`,
		dare,
		CardType.ACTION),

	new CardData(
		"Birthday Party",
		`Player with the closest birthday must drink. If it is their 
		birthday today, they must take a shot.`,
		cake,
		CardType.INTERRUPT),

	new CardData(
		"Mawwiage",
		`All players in a relationship must drink. If your SO is playing, 
		say something cute and drink twice.`,
		marriage,
		CardType.INTERRUPT),

	new CardData(
		"Day at the Races",
		`Choose two players who are on the same screen to race to the bottom. 
		Loser drinks again. Everyone else should make racing noises.`,
		races,
		CardType.ACTION),

	new CardData(
		"Burning Throne",
		`Select a player. They are now in the burning throne. They are 
		asked one question by every other player. They may refuse to 
		answer only if they drink.`,
		hotseat2,
		CardType.ACTION),

	new CardData(
		"Hot Seat",
		`YOU are in the hot seat! All other players get to ask you one 
		question. You may refuse to answer only if you drink.`,
		hotseat,
		CardType.ACTION),

	new CardData(
		"Categories",
		`Pick a category. Now go around the player order from the top of
		the screen and name things within the category. First to hesitate 
		or repeat a word must drink.`,
		categories,
		CardType.ACTION),

	new CardData(
		"Catch Up",
		`Everyone decide on the who the most sober player is. He or 
		she must take a shot.`,
		ketchup,
		CardType.INTERRUPT),

	new CardData(
		"Alcoholism is Funny",
		`Everyone decide on who is the drunkest player. They must drink twice. 
		Laugh at how drunk they are.`,
		alcoholism,
		CardType.INTERRUPT),

	new CardData(
		"Superlatives",
		`Create and announce a superlative. Pause for five seconds, 
		then everyone writes in the chat to who they think the winner 
		should be. Everyone drinks for each time they are named in the 
		chat.`,
		superlatives,
		CardType.ACTION),

	new CardData(
		"Think or Drink",
		`Ask another player a relatively easy question. They must
		immediately start drinking. They may only stop once they
		can answer the question.`,
		think,
		CardType.ACTION),

	new CardData(
		"Quiz Bowl",
		`Create and announce an answer. First player to yell the 
		right question for that answer chooses a losing player 
		to drink. This might be similar to some game show.`,
		jeop,
		CardType.ACTION),

	new CardData(
		"Fuck Guys",
		"All male players must drink.",
		male,
		CardType.INTERRUPT),

	new CardData(
		"Fuck Girls",
		"All female players must drink.",
		female,
		CardType.INTERRUPT),

	new CardData(
		"Last Person To",
		`Announce an action or event. The player(s) who did that thing 
		most recently must drink. Figure it out.`,
		confess,
		CardType.ACTION),

	new CardData(
		"Drink",
		"Take a drink! Make sure you do it on camera.",
		beer1,
		CardType.ACTION),

	new CardData(
		"Big Drink",
		"Take a big drink! Make sure you do it on camera.",
		drink1,
		CardType.ACTION),

	new CardData(
		"The Orator",
		"Make a long toast. Everyone takes a long drink.",
		orator,
		CardType.ACTION),

	new CardData(
		"Shot",
		`You must take a shot. Or, if you are a softy, go 
		ahead and take a big drink.`,
		shot1,
		CardType.ACTION),

	new CardData(
		"Movie Buff",
		`Start acting out a movie or movie character. First player 
		to name the movie or character chooses a losing player to drink.`,
		movie1,
		CardType.ACTION),
]

export default CardDataList;