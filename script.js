var W = window.innerWidth;
var H = window.innerHeight;

var isMouseDown = false;

var lineStyle = 'solid'

var drawings = [
]

var prompts = [
  ['WHO ARE YOU','red'],
  ['WHERE DO U COME FROM','yellow'],
  ['WHO DO YOU FOLLOW','orange'],
  ['ARE YOU SATISFIED WITH YOUR BODY','pink'],
  ['WHAT SEX ARE YOU','black']
]

// prompts are in reverse, deal with it
prompts.reverse()

var promptIndex = prompts.length - 1
var ctx;

$(document).ready(function() {
	$('#loading').hide();
})

function setup () {
  ctx = createCanvas(W, H);
  setupPrompt()

  ctx.mousePressed(() => { 
    isMouseDown = true;
    console.log(drawings)
    drawings[drawings.length-1].lines.push({'points':[],'color':prompts[promptIndex][1]})
  })
  ctx.mouseReleased(() => { isMouseDown = false;})

  $('#next-button').click(function (evt) {
    evt.stopPropagation() 
    evt.preventDefault();
    console.log('NEXT')
    nextPrompt()
  }) 
}

function draw () {
  if (isMouseDown && promptIndex >= 0) {
    var drawing = drawings[drawings.length-1]
    drawing.lines[drawing.lines.length-1].points.push([mouseX, mouseY])
    drawLine( drawing.lines[drawing.lines.length-1], style=lineStyle )
  }
}

function setupPrompt () {  
  console.log(promptIndex)
  $('#prompt').html(prompts[promptIndex][0])
  $('#question-counter').html((promptIndex).toString())
  background('white')

  drawings.push({
    'lines':[]
  })
}

function nextPrompt () {
  if ( promptIndex > 0 ) {
    promptIndex -= 1
    setupPrompt()
  } else {
    // end
    promptIndex -= 1
    console.log('END')
    $('#next-button').remove()
    $('#prompt').html('BEHOLD UR DATAS')
    composeDrawings()
  }
}

function drawLine ( lineData , style='points') {
  if (style=='points') drawPointsLine(lineData)
  if (style=='solid') drawSolidLine(lineData)
}

function drawPointsLine( lineData ) {
  fill(line.color)
  lineData.points.forEach((pt) => {
    ellipse(pt[0], pt[1], 10, 10)
  })
}

function drawSolidLine( lineData ) {
  fill(lineData.color)
  stroke(lineData.color)
  strokeWeight(5)
  for ( var i = 0; i < lineData.points.length-1; i++) {
    var p1 = lineData.points[i]
    var p2 = lineData.points[i+1]
    line(p1[0], p1[1], p2[0], p2[1]) 
  }
}

function composeDrawings() {
  background('white')
  drawings.forEach(function(drawing) {
    drawing.lines.forEach(function(line) {
      drawLine( line, style=lineStyle )
    }) 
  })
}
