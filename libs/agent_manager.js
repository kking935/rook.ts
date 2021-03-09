function agent_bet(player, match) {
    var pointsPercentage = (1 - match.round.bet / 200) * 100
    var random = Math.random(0, 100) * pointsPercentage
    if (pointsPercentage > random) {
        // bet
    } else {
        // pass
    }
    
}

function findCardValue(card) {
    switch(card.number) {
        case 20:
            return 20;
        case 1:
            return 15;
        case 5: 
            return 5
        case 10:
            return 10;
        case 14:
            return 10;
        default:
            return 0
    }
}

function agent_discard(player, tableCards) {

}

function agent_chooseTrumps(player) {
    var bestColor = 'black'
    var bestColorValue = -1;
    var blackValue = 0
    var redValue = 0
    var yellowValue = 0
    var greenValue = 0

    function addToColorValue(card) {
        switch (card.color) {
            case 'black':
                blackValue += findCardValue(card)
            case 'green':
                greenValue += findCardValue(card)
            case 'red':
                redValue += findCardValue(card)
            case 'yellow':
                yellowValue += findCardValue(card)
        }
    }
    player.cards.map(card => addToColorValue(card))

    function isMaximum(colorItem) {
        var curColorValue, curColor = colorItem
        if (curColorValue > bestColorValue) {
            bestColorValue = curColorValue
            bestColor = curColor
        }
    }

    var colorList = [(blackValue, 'black'), (redValue, 'red'), (yellowValue, 'yellow'), (greenValue, 'green')]
    colorList.map(colorValue => isMaximum(colorValue))

    return bestColor
}