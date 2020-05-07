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

import Card, { CardData, CardType } from "./Card";

let CardDataList = [

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
		should be. Everyone drinks for each finger pointed at him or her.`,
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
		CardType.INTERRUPT),

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