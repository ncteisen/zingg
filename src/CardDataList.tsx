import React from 'react';
import beer from './assets/beer.png'

import Card, { CardData, CardType } from "./Card";

let CardDataList = [
	new CardData(
		"Drink",
		"Drink a beer you scum",
		beer,
		CardType.ACTION),

    new CardData(
    	"Beast of Burden",
    	"Take one drink per round you fool",
    	beer,
    	CardType.STATUS),

    new CardData(
    	"Writer's Guild",
    	"Everyone must find a pen",
    	beer,
    	CardType.INTERRUPT),
]

export default CardDataList;