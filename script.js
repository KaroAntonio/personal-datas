var W = window.innerWidth;
var H = window.innerHeight;

var isMouseDown = false;

var drawings = [
]

var prompts = [
  ['WHO ARE YOU','red'],
  ['WHERE DO U COME FROM','yellow'],
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
    fill('black')
    var drawing = drawings[drawings.length-1]
    drawing.lines[drawing.lines.length-1].points.push([mouseX, mouseY])
    ellipse(mouseX, mouseY, 10, 10)
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

function composeDrawings() {
  background('white')
  drawings.forEach(function(drawing) {
    drawing.lines.forEach(function(line) {
      fill(line.color)
      line.points.forEach((pt) => {
        ellipse(pt[0], pt[1], 10, 10)
      })
    }) 
  })
}
