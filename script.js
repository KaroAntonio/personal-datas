var W = window.innerWidth;
var H = window.innerHeight;
var isMouseDown = false;

var randomSeedVal = Math.random()*100

var Y_AXIS = 1;
var X_AXIS = 2;

var lineStyle = 'solid'

// responses are inserted after prompts
// [prompt, type, opts, response]
var prompts = [
  initPrompt('CHOOSE YOUR GENDER','color',[]),
  initPrompt('CHOOSE YOUR RACE','color',[]),
  initPrompt('HOW LONG HAVE YOU LIVED?','scale',['Just a hot second','I run with Dinosaurs']),
  initPrompt('HOW POPULATION DENSE WAS YOUR YOUR BIRTHPLACE?','scale',['It was just me','I lived in the same room as everyone I ever met']),
  //initPrompt('HOW MUCH FAMILY WAS AROUND YOU GROWING UP?','scale',['It was just me','I lived in the same room as everyone I ever met']),
  //initPrompt('WHERE DO U COME FROM','line',['yellow']),
  initPrompt('DRAW A REPRESENTATION OF THE PEOPLE YOU GREW UP AROUND','line',['black']),
  initPrompt('DRAW A FAVOURITE CHILDHOOD TOOL','line',['black']),
  //initPrompt('ARE YOU SATISFIED WITH YOUR BODY','line',['pink']),
  //initPrompt('WHAT SEX ARE YOU','line',['black'])
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
    if (prompts[promptIndex]) {
      if (prompts[promptIndex].type == 'line') 
        addNewLineToCurrentResponse()
      if (prompts[promptIndex].type =='color'){
        if (isMouseDown) {
          prompts[promptIndex].response = encodeColor(mouseX, mouseY)
        }
        noStroke()
      }
      if (prompts[promptIndex].type =='scale'){
        var val = constrain(mouseX, 50, width-50)
        $('#scale-slider').css({
          'left': val
        })
        prompts[promptIndex].response = val/(width-50*2)
        compose()
      }
    }
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
  if (prompts[promptIndex]) {
    if (prompts[promptIndex].type == 'color'){
        background(encodeColor(mouseX,mouseY))
        compose()
        fill(encodeColor(mouseX,mouseY))
        noStroke()
        rect(width/2-50,height/2-50, 100,100)
    } else if (prompts[promptIndex].type == 'line' && isMouseDown && promptIndex >= 0) {
      var lines = prompts[promptIndex].response
      var line = lines[lines.length-1]
      line.points.push([mouseX, mouseY])
      drawLine( line, style=lineStyle )
    } else {
    }
  }
}

function addNewLineToCurrentResponse() {
  var lines = prompts[promptIndex].response 
  var color = prompts[promptIndex].opts[0]
  lines.push({'points':[],'color':color})
}

function encodeColor( x,y ) {
    return color(x, y, 255)
}

function initPrompt(prompt_str, type, opts) {
  return {
    'prompt': prompt_str,
    'type': type,
    'opts': opts,
    'response': null
  }
}

function setupPrompt () {  
  $('#scale').hide()
  $('#prompt').html(prompts[promptIndex].prompt)
  $('#question-counter').html((promptIndex).toString())
  background('white')

  if (prompts[promptIndex].type == 'color') {
    colorMode(HSB, W, H, 255);
    //setupColorPicker()
  }
  else if (prompts[promptIndex].type == 'scale') {
    $('#scale').show()
    setupScale()
  }
  else if (prompts[promptIndex].type == 'line') {
    lines = prompts[promptIndex].response 
    if (!lines) prompts[promptIndex].response = []
  }
  compose()

}

function setupColorPicker() {
  var width = 200 
  var height = 200 
  var x_offset = W/2- width/2
  var x_offset = H/2- height/2
  for ( var x=0; x<width; x++ ) {
    for ( var y=0; y<height; y++) {
      stroke((x+y)%255)
      //console.log(x,y,(x+y)%255)
      point(x,y)
    }
  }
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
    compose()
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

function setGradient(x, y, w, h, c1, c2, axis) {

  noFill();

  if (axis == Y_AXIS) {  // Top to bottom gradient
    for (var i = y; i <= y+h; i++) {
      var inter = map(i, y, y+h, 0, 1);
      var c = lerpColor(c1, c2, inter);
      stroke(c);
      line(x, i, x+w, i);
    }
  }  
  else if (axis == X_AXIS) {  // Left to right gradient
    for (var i = x; i <= x+w; i++) {
      var inter = map(i, x, x+w, 0, 1);
      var c = lerpColor(c1, c2, inter);
      stroke(c);
      line(i, y, i, y+h);
    }
  }
}

function setupScale() {  
  // format Scale
  prompts[promptIndex].response = .5
  $('#scale-bar, #scale-start, #scale-end').css({
    pointerEvents: 'none',
    position: 'fixed',
    background:'black',
    width:width-100,
    height:5,
    left: 50,
    top: height/2
  })

  $('#scale-start, #scale-end').css({
    width:5,
    height:50,
    top: height/2-25 
  })
    
  $('#scale-end').css({
    left: width-50,
  })
 
  $('#scale-lo-label, #scale-hi-label').css({
    pointerEvents: 'none',
    top: height/2+50,
    width: width*.3,
    position: 'fixed',
  })
  $('#scale-hi-label').css({
    textAlign: 'right',
    right:25
  })
  $('#scale-lo-label').css({
    textAlign: 'left',
    left:25
  })

  $('#scale-slider').css({
    pointerEvents: 'none',
    position: 'fixed',
    height:50,
    width: 10,
    textAlign: 'left',
    background:'white',
    border: '3px solid black',
    top: height/2-25,
    left:width/2
  })

  $('#scale-lo-label').html(prompts[promptIndex].opts[0])
  $('#scale-hi-label').html(prompts[promptIndex].opts[1])
}


function composeLvl1() {
  // Compose Body/Birth Data
  var gender_color,
    race_color = color('white'),
    age = 0, 
    density = 0,
    other_ppl = [];

  prompts.forEach(function(p) {
    if (p.prompt == 'CHOOSE YOUR GENDER') {
      if (p.response) 
        gender_color = p.response 
      else 
        gender_color = color('white')
    }
    if (p.prompt == 'CHOOSE YOUR RACE') {
      if (p.response) 
        race_color = p.response 
      else 
        race_color = color('white')
    }
    if (p.prompt == 'HOW LONG HAVE YOU LIVED?') {
      if (p.response) {
        age = p.response
      }   
    }
    if (p.prompt == 'HOW POPULATION DENSE WAS YOUR YOUR BIRTHPLACE?' && p.response) 
      density = p.response
    if (p.prompt == 'DRAW A REPRESENTATION OF THE PEOPLE YOU GREW UP AROUND' && p.response) 
      other_ppl = p.response
  })
  colorMode(RGB, 100);
  setGradient(0, 0, width, height, gender_color, race_color, Y_AXIS);
  generate_other_cloud(((density*20)|0)*10, race_color, other_ppl)
  draw_age( gender_color, race_color, age)
  colorMode(HSB, W, H, 255);
}

function generate_other_cloud(n, race_color, other_lines) {
  randomSeed(randomSeedVal)
  for( var i = 0; i < n; i++ ) {
    x = width * random()
    y = height * random()
    drawOther(x,y, race_color)
    //new_other = deepcopy(other_lines)
  }
}

function deepcopy(o) {
   var output, v, key;
   output = Array.isArray(o) ? [] : {};
   for (key in o) {
       v = o[key];
       output[key] = (typeof v === "object") ? copy(v) : v;
   }
   return output;
}

function drawOther(x, y, c) {
  fill('white')
  stroke('white')
  ellipseMode(RADIUS);
  //ellipse(x, y, 5, 5);
  drawRadialGradientSize(color('white'),color(c),x, y, .09)

}

function drawRadialGradientSize(c1, c2,x, y, age) {
  var rad = age*200
  var h = random(0, 360);
  noStroke();
  var maxAge = 200;
  ellipseMode(RADIUS);
  for (var r = rad; r > 0; --r) {
    var inter = map(r, 0, rad, 0, 1);
    var c = lerpColor(c1, c2, inter);
    fill(c);
    ellipse(x, y, r, r);
  }
}
function drawRadialGradientRings(c1, c2,x, y, age) {
  var rad = age*50
  var h = random(0, 360);
  noStroke();
  var maxAge = 200;
  ellipseMode(RADIUS);
  for (var r = maxAge; r > 0; --r) {
    var inter = map(r%(maxAge/rad), 0, rad, 0, 1);
    var c = lerpColor(c1, c2, inter);
    fill(c);
    ellipse(x, y, r, r);
  }
}

function draw_age(c1, c2, age) {
  // as a circle?
  //drawRadialGradientRings(c1,c2,width/2, height/2, age)
  drawRadialGradientSize(c1,c2,width/2, height/2, age)
}

function composeLvl2() {
  /*
  p.lines.forEach(function(line) {
    drawLine( line, style=lineStyle )
  }) */
}

function compose() {
  composeLvl1()
  composeLvl2()
}
