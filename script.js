var W = window.innerWidth;
var H = window.innerHeight;
var S = W > H ? H : W
var left_offset; 
var isMouseDown = false;

var randomSeedVal = Math.random()*100
var sendgridApiKey = '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'
var smtpjsToken = 'd48c379c-c7f6-4c20-9f95-a906e005e9d7'
// Elastic Email
var smtp_uname = 'karoantonio@gmail.com'
var smtp_pwd = '76479e50-aed0-4281-8e90-76f8e6ac87b0'
var smtp_server = 'smtp.elasticemail.com'
var smtp_port = '2525'

// SendGrid
/*
var smtp_server = 'smtp.sendgrid.net'
var smtp_uname = 'KaroAntonio'
var smtp_pwd = 'CJ*nl%0vL689'
*/

var Y_AXIS = 1;
var X_AXIS = 2;

var lineStyle = 'solid'

// responses are inserted after prompts
// [prompt, type, opts, response]
var prompts = [
  initPrompt('CHOOSE YOUR RACE','color',[]),
  initPrompt('CHOOSE YOUR GENDER','color',[]),
  initPrompt('HOW LONG HAVE YOU LIVED?','scale',['Just a hot second','I run with Dinosaurs']),
  initPrompt('HOW POPULATION DENSE WAS YOUR YOUR BIRTHPLACE?','scale',['It was just me','I lived in the same room as everyone I ever met']),
  //initPrompt('HOW MUCH FAMILY WAS AROUND YOU GROWING UP?','scale',['It was just me','I lived in the same room as everyone I ever met']),
  //initPrompt('WHERE DO U COME FROM','line',['yellow']),
  initPrompt('DRAW YOUR HOMIES','line',['black']),
  initPrompt('DRAW A FAVOURITE CHILDHOOD TOOL','line',['black'])
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
  ctx = createCanvas(S, S);
  left_offset = (W-width)/2
  $(ctx.elt).css({
    marginLeft:(W-S)/2,
  })

  window.prompts = prompts
  setupPrompt()

  ctx.mousePressed(() => { 
    isMouseDown = true;
    if (prompts[promptIndex]) {
      if (prompts[promptIndex].type == 'line') 
        addNewLineToCurrentResponse()
      if (prompts[promptIndex].type =='color'){
        if (isMouseDown) {
          //prompts[promptIndex].response = encodeColor(mouseX, mouseY)
        }
      }
      if (prompts[promptIndex].type =='scale'){
        var val = constrain(mouseX, 50, width-50)
        $('#scale-slider').css({
          'left': val+left_offset
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
  lines.push({'points':[],'color':color, 'cx':width/2, 'cy':height/2, 's':1})
}

function encodeColor( x,y ) {
    x = map(x, 0, W, 0, width)
    y = map(y, 0, H, 0, height)
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
  // hide existing prompts
  $('.jscolor').hide()
  $('#scale').hide()

  $('#prompt').html(prompts[promptIndex].prompt)
  $('#prompt').css({
    background:'rgba(255, 255, 255, 0.5)'
  })
  $('#question-counter').html((promptIndex).toString())
  background('white')

  if (prompts[promptIndex].type == 'color') {
    colorMode(HSB, width, height, 255);
    setupColorPicker()
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

function hackilyAdjustPalette () {
  var pal = selectPalette()
  if (pal) {
    pal.css({
      left:W/2 - pal.width()/2,
      top:H/2 - pal.height()/2
      })
  }
}

function selectPalette() {
  // use a hacky way of getting the palette via css styling
  var el; 
  var divs = $('div')
  for (var i = 0; i < divs.length; i++) {
    var e = $(divs[i])
    if ( e.css('borderRadius') == '8px')
      return e.parent()
  }
  return null
}

function setupColorPicker() {
  $('.jscolor')[0].jscolor.fromString('ffffff')
  $('.jscolor').show()
  $('.jscolor').css({
      position: 'fixed',
      zIndex: 20,
      left:W/2-100,
      top: H/2-100,
      height: 200, 
      width: 200
    })
  $('.jscolor').click( () => {
    console.log('triggerd')
    hackilyAdjustPalette()
  })
  setTimeout( () => { $('.jscolor').click()}, 300 )

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

    console.log('ENABLE EMAIL PORTION')
    saveFrames('out', 'png', 1, 1, function(data) {
      var encodedData = data[0]['imageData'].split(',')[1]
      var datauri = 'data:image/png;base64,' + encodedData;
      //sendEmailWithAttachment(datauri)
    });
    compose()
  }
}

function drawLines( lines ) {
  lines.forEach(function(line) {
    drawLine( line, style=lineStyle )
  }) 
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
  strokeWeight(5*lineData.s)
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
    left: 50+left_offset,
    top: height/2
  })

  $('#scale-start, #scale-end').css({
    width:5,
    height:50,
    top: height/2-25 
  })
    
  $('#scale-end').css({
    left: W/2+width/2-50,
  })
 
  $('#scale-lo-label, #scale-hi-label').css({
    pointerEvents: 'none',
    top: height/2+50,
    width: W*.3,
    position: 'fixed',
  })
  $('#scale-hi-label').css({
    textAlign: 'right',
    right: (left_offset)-50,
  })
  $('#scale-lo-label').css({
    textAlign: 'left',
    left:25+left_offset
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
    left:W/2
  })

  $('#scale-lo-label').html(prompts[promptIndex].opts[0])
  $('#scale-hi-label').html(prompts[promptIndex].opts[1])
}

function genLines() {
  var lines = []
  var points = []
  for (var i = 0; i < 10; i++) {
    points.push([Math.random()*W, Math.random()*H])
  } 
  //lines.push({'points':points, 'color':'black'})
  points = [[10,10],[W,10]]
  //lines.push({'points':points, 'color':'black'})
  points = [[10,10],[10,H]]
  //lines.push({'points':points, 'color':'black'})
  points = [[0,0],[width,height],[0,height],[width,0]]
  lines.push({'points':points, 'color':'black', 'cx':width/2, 'cy':height/2})
  return lines
}

function positionLines(lines, cx, cy) {
  var dx, dy;
  lines.forEach( line => {
    dx = line.cx - cx 
    dy = line.cy - cy
    line.cx = cx
    line.cy = cy
    line.points.forEach( pt => {
      pt[0] = pt[0] - dx
      pt[1] = pt[1] - dy
    })
  })
}

function scaleLines(lines,s) {
  // s: a ratio to scale by
  lines.forEach(function(line) {
    line.s = line.s*s
    line.points.forEach( pt => {
      pt[0] = line.cx + (pt[0] - line.cx) * s
      pt[1] = line.cy + (pt[1] - line.cy) * s
    })
  })
}

function composeLvl1() {
  // Compose Body/Birth Data
  var gender_color = color('white'),
    race_color = color('white'),
    age = 0, 
    density = 0, 
    other_shape = [];
  prompts.forEach(function(p) {
    if (p.prompt == 'CHOOSE YOUR GENDER' && p.response) {
        gender_color = p.response 
    }
    if (p.prompt == 'CHOOSE YOUR RACE' && p.response) {
        race_color = p.response 
    }
    if (p.prompt == 'DRAW YOUR HOMIES' && p.response) {
      other_shape = p.response
    }
    if (p.prompt == 'HOW LONG HAVE YOU LIVED?' && p.response) {
        age = p.response
    }
    if (p.prompt == 'HOW POPULATION DENSE WAS YOUR YOUR BIRTHPLACE?' && p.response) 
        density = p.response
  })
  colorMode(RGB, 100);
  setGradient(0, 0, width, height, gender_color, race_color, Y_AXIS);
  draw_other_cloud(((density*20)|0)*10, race_color, other_shape)
  draw_age( gender_color, race_color, age)
  colorMode(HSB, W, H, 255);

}

function draw_other_cloud(n, race_color, other_shape) {
  randomSeed(randomSeedVal)
  for( var i = 0; i < n; i++ ) {
    x = width * random()
    y = height * random()
    drawOther(x,y, race_color)
    new_other = deepcopy(other_shape)
    positionLines(new_other, x,y)
    scaleLines(new_other, 0.2)
    drawLines(new_other)
  }
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

function sendEmail() {
  Email.send(
  "karoantonio@gmail.com",
  "karoantonio@gmail.com",
  "This is a subject",
  "this is the body",
  smtp_server,
  smtp_uname,
  smtp_pwd,
  function (msg) {console.log(msg)}
  );
}

function updateColor(picker) {
  console.log(picker.toHEXString())
  prompts[promptIndex].response = color(picker.toHEXString())
}

function deepcopy(o) {
  return JSON.parse(JSON.stringify(o))
}


function sendEmailWithAttachment(datauri) {
  var from_email = "karoantonio@gmail.com"
  var to_email = "karoantonio@gmail.com"
  Email.sendWithAttachment(
  from_email,
  to_email,
  "This is a subject",
  "this is the body",
  smtp_server,
  smtp_uname,
  smtp_pwd,
  datauri,
  function (msg) {console.log(msg)}
  );
}

