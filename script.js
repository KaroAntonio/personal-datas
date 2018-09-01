var W = window.innerWidth;
var H = window.innerHeight;
var S = W > H ? H : W
var left_offset; 
var isMouseDown = false;

var isColor = true;

var myFont;

var initializedSplashes = {}

var randomSeedVal = Math.random()*100
var sendgridApiKey = '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'
var smtpjsToken = 'd48c379c-c7f6-4c20-9f95-a906e005e9d7'

// Elastic Email
var smtp_uname = 'karoantonio@gmail.com'
var smtp_pwd = '76479e50-aed0-4281-8e90-76f8e6ac87b0'
var smtp_server = 'smtp.elasticemail.com'
var smtp_port = '2525'

var printer_email = '54w9644w@hpeprint.com'
var my_email =  "karoantonio@gmail.com"
//var to_email = my_email
var to_email = printer_email

console.log('USING EMAIL: '+to_email)

var Y_AXIS = 1;
var X_AXIS = 2;

var lineStyle = 'solid'

var prompts;
var promptIndex;
var ctx;

function initPrompts() {
  // responses are inserted after prompts
  // [type, prompt, id, default, opts]
   prompts = [
    initPrompt('splash','SPLASH','#intro-page','',[]),
    initPrompt('splash','SPLASH','#demo-page','',[]),
    initPrompt('color','CHOOSE YOUR GENDER','genderColor',color('white'),[]),
    initPrompt('color','CHOOSE YOUR ETHNICITY','raceColor',color('white'),[]),
    initPrompt('scale','HOW LONG HAVE YOU LIVED?','age',.8,['Just a hot second','I run with Dinosaurs']),
    initPrompt('splash','SPLASH','#behavior-page','',[]),
    initPrompt('text','WHAT IS YOUR MOST IMPORTANT HABIT?','routine','',[]),
    initPrompt('line','DRAW WHO YOU INTERACT WITH MOST OFFLINE','realLines',[],['#ed65a9']),
    initPrompt('scale','HOW FREQUENT ARE YOUR OFFLINE INTERACTIONS?','irlDensity',.3,['I am my own everything','I need others to keep my blood pumping.']),
    initPrompt('line','DRAW WHO YOU INTERACT WITH MOST ONLINE','netLines',[],['#4c82ff']),
    initPrompt('scale','HOW FREQUENT ARE YOUR ONLINE INTERACTIONS?','netDensity',.3,['I lost my msn password in 2001','Memes are Oxygen']),
    initPrompt('splash','SPLASH','#mind-page','',[]),
    //initPrompt('scale','THE FUTURE OF THE INTERNET?','future',NaN,['COLD','HOT']),
    //initPrompt('text','DESCRIBE YESTERDAY\'S MAGIC MOMENT','magic','',[]),
    initPrompt('text','YOUR BIGGEST TECH ANXIETY','anxiety','',[]),
    initPrompt('line','DRAW YOUR FAVE DIGITAL DETOX','detoxLines',[],['#55a07c']),
    initPrompt('text','THE FUTURE OF THE INTERNET IS...','future','',[]),
    initPrompt('splash','SPLASH','#final-page','',[]),
    //initPrompt('text','WHAT IS YOUR FAVE PLACE ON THE NET','netHome','',[]),
    //initPrompt('ARE YOU SATISFIED WITH YOUR BODY','line',['pink']),
    //initPrompt('WHAT SEX ARE YOU','line',['black'])
  ]

  // prompts are in reverse, deal with it
  prompts.reverse()
  return prompts
}

$(document).ready(function() {
	$('#loading').hide();
})

function setup () {
  ctx = createCanvas(S, S);
  left_offset = (W-width)/2
  $(ctx.elt).css({
    marginLeft:(W-S)/2,
  })

  myFont = loadFont("assets/Favorit_Regular.otf");

  clearPrompts()
  prompts = initPrompts()
  promptIndex = prompts.length - 1
  setupPrompt()

  window.prompts = prompts

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
  ctx.mouseReleased(() => { 
    isMouseDown = false;
    if (prompts[promptIndex]) {
      if (prompts[promptIndex].type == 'line') {
        compose()
        drawLines(prompts[promptIndex].response)
      }
    }
  })

  isColor = true;

  $('#next-button').mousedown(() => {
    $('#synchronized-banner').show()
  })
  $('body').mouseup( () => {
    if($('#synchronized-banner').is(':visible') ) {
      $('#synchronized-banner').hide()
      nextPrompt()
    }
  })
  $('#color-button').click(toggleColorMode)

  $('#print-button').click( () => {
    console.log('ENABLE EMAIL PORTION')
    $('#print-button').hide()
    $('#end-instructions').show()
    $('#end-instructions').css({
      top: H*.2,
      fontSize: 40,
      zIndex: 10000,
      position: 'fixed',
      paddingLeft: W*.2,
      paddingRight: W*.2,
      background: 'transparent'
    })
    saveFrames('out', 'png', 1, 1, function(data) {
      var encodedData = data[0]['imageData'].split(',')[1]
      var datauri = 'data:image/png;base64,' + encodedData;
      sendEmailWithAttachment(datauri, to_email)
      sendEmailWithAttachment(datauri, my_email)
    });
  })
  $('#back-button').click(function (evt) {
    if (promptIndex < prompts.length-1)
      prevPrompt()
  }) 
  $('#undo-button').click(()=>{
    lines.pop() 
    compose()
    drawLines(lines)
  })

  $('#restart-button').click(() => {
    prompts = initPrompts()
    promptIndex = prompts.length - 1
    setupPrompt()
    $('#next-button').show()
    $('#back-button').show()
  })
}

function draw () {
  if (prompts[promptIndex]) {
    if (prompts[promptIndex].type == 'color'){
        background(encodeColor(mouseX,mouseY))
        compose()
        fill(encodeColor(mouseX,mouseY))
        noStroke()
        //rect(width/2-50,height/2-50, 100,100)
    } else if (prompts[promptIndex].type == 'line' && isMouseDown && promptIndex >= 0) {
      var lines = prompts[promptIndex].response
      var line = lines[lines.length-1]
      line.points.push([mouseX, mouseY])
      if (line) drawLine( line, style=lineStyle )
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

function initPrompt(type, prompt_str, id, default_response, opts) {
  return {
    'id': id,
    'prompt': prompt_str,
    'type': type,
    'opts': opts,
    'response': default_response
  }
}


function clearPrompts() {
  // hide existing prompts
  $('.jscolor').hide()
  $('.button-wrapper').hide()
  $('#scale').hide()
  $('#text-input').hide()
  $('#undo-button').hide()
  $('#restart-button').hide()
  $('#color-button').hide()
  $('#synchronized-banner').hide()

  $('#end-instructions').hide()
  $('#intro-page').hide()
  $('#demo-page').hide()
  $('#behavior-page').hide()
  $('#mind-page').hide()
  $('#final-page').hide()
}

function setupPrompt () {  
  clearPrompts()

  $('#prompt').html(prompts[promptIndex].prompt)
  $('#prompt').css({
    background:'rgba(255, 255, 255, 0.5)'
  })
  background('white')
  compose()

  if (prompts[promptIndex].type == 'color') {
    colorMode(HSB, width, height, 255);
    setupColorPicker()
  }
  else if (prompts[promptIndex].type == 'scale') {
    setupScale()
  }
  else if (prompts[promptIndex].type == 'text') {
    setupTextInput()
  }
  else if (prompts[promptIndex].type == 'line') {
    setupLinesInput()
  }
  else if (prompts[promptIndex].type == 'splash') {
    setupSplashPage()
  }

  $('#next-button').css('bottom',H/2)
  $('#back-button').css('bottom',H/2)

}

function flashBanner() {
  console.log('sync')
  $('#synchronized-banner').css({
    position: 'fixed',
    fontSize: 100,
    width: W,
    top:H*.25,
    background: 'white',
    textAlign: 'center',
    zIndex: 19000
    })

  //setInterval(()=>$('#synchronized-banner').hide(), 400)
}

function setupSplashPage() {
  var id = prompts[promptIndex].id
  $(id).show()
  $(id).css({
    position: 'fixed',
    zIndex: 100000,
    fontSize: 30,
    paddingLeft: W*.25,
    paddingRight: W*.25,
    background: 'white',
    paddingTop: 100,
    paddingBottom: 4000
    })
 
  console.log(initializedSplashes) 
  if (!(id in initializedSplashes)) {
    initializedSplashes[id] = null
    $(id).click( () => {
      $(id).hide()
      nextPrompt()
    })
  }
}

function setupLinesInput () {

    lines = prompts[promptIndex].response 
    $('#undo-button').show()
    $('#undo-button').css({
      left:W/2-100 
    })
    compose()
    drawLines(lines)
}

function hackilyAdjustPalette () {
  var pal = selectPalette()
  if (pal) {
    pal.css({
      left:W/2 - pal.width()/2,
      top:height/2 - pal.height()/2
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

function hackilySetupPalette() {
  var e1 = document.createEvent("MouseEvents");
  e1.initMouseEvent("mousedown", true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
  jQuery('.jscolor')[0].dispatchEvent(e1)
  hackilyAdjustPalette()
}

function setupColorPicker() {
  $('.jscolor')[0].jscolor.fromString('ffffff')
  $('.jscolor').show()
  $('.jscolor').css({
      position: 'fixed',
      zIndex: 20,
      left:W/2-100,
      top: height/2-100,
      height: 200, 
      width: 200
    })
  setTimeout( () => { 
    hackilySetupPalette()
  }, 00 )
  $('.jscolor').click(() => {
    hackilySetupPalette()
  })
  

}

function prevPrompt () {
  if ( promptIndex < prompts.length ) {
    promptIndex += 1
    setupPrompt()
  }
}

function nextPrompt () {
  if ( promptIndex > 0 ) {
    promptIndex -= 1
    setupPrompt()
    flashBanner()
  } else {
    // end
    clearPrompts()
    promptIndex -= 1
    console.log('END')
    $('#next-button').hide()
    $('#back-button').hide()
    $('#prompt').html('BEHOLD UR DATAS')
    $('#back-button').hide()
    $('#restart-button').show()
    $('#color-button').show()
    $('#restart-button').css({
      position: 'fixed',
      bottom: 0
    })
    $('#color-button').css({
      position: 'fixed',
      bottom: 0,
      right: 100 
    })
    $('#print-button').css({
      left:W/2-100 
    })
    $('#print-button').show()

    compose()
  }
}

function toggleColorMode() {
  isColor = !isColor
  compose()
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
  if (isColor) fill(line.color)
  else fill('black')

  lineData.points.forEach((pt) => {
    ellipse(pt[0], pt[1], 10, 10)
  })
}

function drawSolidLine( lineData ) {
  if (isColor) stroke(lineData.color)
  else stroke('black')
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

function setupTextInput() {
  $('#text-input').show()
  $('#text-input').val(prompts[promptIndex].response)
  $('#text-input').css({
    position:'fixed',
    width: 300,
    left: W/2-150,
    fontSize: 30,
    top: height*.2
  })
  $('#text-input').attr('maxlength',15)

  $('#text-input').on('keyup paste',() => {
    prompts[promptIndex].response = $('#text-input').val()
  })
}

function setupScale() {  
  $('#scale').show()
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
    width: width*.3,
    position: 'fixed',
    background:'rgba(255, 255, 255, 0.8)'
  })
  $('#scale-hi-label').css({
    textAlign: 'right',
    right: (left_offset)+25,
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

function compose() {
  var rsps = {} // responses
  prompts.forEach(function(p) {
    rsps[p.id] = p.response
  })

  colorMode(RGB, 100);
  background('white')
  stroke('black')
  strokeWeight(5)
  fill('white')
  rect(0,0, width, height)
  //if ( !isNaN(rsps.future) )
    //drawGrid(30, rsps.future*10|0)
  //setGradient(0, 0, width, height, rsps.genderColor, rsps.raceColor, Y_AXIS);
  draw_other_cloud(((rsps.irlDensity*10)|0)*3, rsps.raceColor, rsps.realLines, 0)
  draw_other_cloud(((rsps.netDensity*10)|0)*3, rsps.raceColor, rsps.netLines, 100)
  draw_age( rsps.genderColor, rsps.raceColor, rsps.age)
  // drawOrbitalCloud(rsps.realLines, 10, 20, 50)
  // Draw Personal Symbols
  drawLinesCopy(rsps.realLines, width/2-150,height/2-50,.4, 2)
  drawLinesCopy(rsps.netLines, width/2+150,height/2-50,.4, 2)
  drawLinesCopy(rsps.detoxLines, width/2,height/2+100,.4, 2)

  draw_text( rsps.future , width/2, height/2+50, 'grey', 32)
  draw_text( rsps.anxiety , width/2, height/2, 'grey', 32)
  draw_text( rsps.routine , width/2, height/2-50, 'grey', 32)
  colorMode(HSB, W, H, 255);
}

function draw_white_circle() {
  fill('white')
  stroke('white')
  ellipseMode(RADIUS);
  ellipse(width/2, height/2, 70, 70);
}

function draw_other_cloud(n, race_color, other_shape, randOffset) {
  randomSeed(randomSeedVal+randOffset)
  for( var i = 0; i < n; i++ ) {
    x = width * random()
    y = height * random()
    drawLinesCopy(other_shape, x, y, 0.15, 1)
  }
}


function updateLinesScaleForStroke(lines, ds) {
  lines.forEach(function(line) {
    line.s = line.s * ds
  })
}

function drawLinesCopy(lines, x, y, s, ds) {
    new_lines = deepcopy(lines)
    positionLines(new_lines, x,y)
    scaleLines(new_lines, s)
    updateLinesScaleForStroke(new_lines, ds)
    drawLines(new_lines)
    updateLinesScaleForStroke(new_lines, 1/ds)
}

function drawOther(x, y, c) {
  fill('white')
  stroke('white')
  ellipseMode(RADIUS);
  //ellipse(x, y, 5, 5);
  drawRadialGradientSize(color('white'),color(c),x, y, .09)
}

function drawRadialGradientSize(c1, c2,x, y, age) {
  var rad = age*width*.4
  var h = random(0, 360);
  noStroke();
  var thickness = 100;
  var minRad = rad < thickness ? 0 : rad-thickness;
  var maxAge = 200;
  ellipseMode(RADIUS);
  for (var r = rad; r > 0; --r) {
    var inter = map(r, minRad, rad, 0, 1);
    var c = lerpColor(c1, c2, inter);
    if (r < minRad) fill('white')
    else fill(c);
    ellipse(x, y, r, r);
  }
}

function drawOrbitalCloud(lines, n, innerRad, outerRad) {
  // of lines
  randomSeed(randomSeedVal)
  var radRange = outerRad - innerRad
  for (var i = 0; i < n; i++ ) {
    var rad = Math.PI * 2 * Math.random()
    var r = Math.PI * radRange + innerRad 
    var x = r * Math.cos(rad) + width/2
    var y = r * Math.sin(rad) + height/2
    drawLinesCopy(lines, x,y,.3)
  }
}

function drawGrid(s,text) {
  // s: scale of the grid
  var unitSize = width/s
  for (var x = 0; x < s; x++ ) {
    for (var y= 0; y < s; y++ ) {
      draw_text(text, x*unitSize+unitSize/2, y*unitSize+unitSize/2, '#e5e2ce', 27)
    }
  }
}

function drawRadialGradientRings(c1, c2,x, y, age) {
  var rad = age*50
  noStroke();
  var maxAge = 200;
  var thickness = 30;
  var minRad = age < thickness ? 0 : age-thickness;
  ellipseMode(RADIUS);
  for (var r = maxAge; r > minRad; --r) {
    var inter = map(r%(maxAge/rad), minRad, rad, 0, 1);
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

function draw_text(s,x,y, c, size) {
  textSize(size);
  strokeWeight(0)
  textAlign('center')
  textFont(myFont);
  fill(c)
  text(s, x, y);
}

function updateColor(picker) {
  prompts[promptIndex].response = color(picker.toHEXString())
}

function deepcopy(o) {
  return JSON.parse(JSON.stringify(o))
}

function sendEmailWithAttachment(datauri, to_email) {
  var from_email = "support@realgoodinternet.me"
  //var from_email = "karoantonio@gmail.com"
  Email.sendWithAttachment(
  from_email,
  to_email,
  "Data Image",
  "",
  smtp_server,
  smtp_uname,
  smtp_pwd,
  datauri,
  function (msg) {
    console.log(msg)
    }
  );
}

