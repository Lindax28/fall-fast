const app = new PIXI.Application({backgroundColor: 0x555251});
document.body.appendChild(app.view);

// query for words array
let words = [];
axios.get('/words')
.then((response) => {
    words = response.data; 
})
.catch(function (error) {
    console.log(error);
});

// initialize variables
let score = 0;
let misses = 0;
let richText;
let drops = [];
let totalDrops = 5;
let repeat = 1;
let speed = 0.5;
let wait = 2000;

// initialize sound effects
function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
    this.sound.currentTime = 0;
  }
}
const dropSound = new sound("public/sounds/drop.wav");
const splashSound = new sound("public/sounds/splash.wav");
const bubblingSound = new sound("public/sounds/bubbling.wav");
const rainSound = new sound("public/sounds/rain.wav");
const sheeshSound = new sound("public/sounds/sheesh.mp3");

// place volume button in bottom right corner
const volumeButton = PIXI.Sprite.from('public/images/volume.png')
volumeButton.anchor.set(-14, -9.5);
volumeButton.scale.set(0.1);
volumeButton.interactive = true;
volumeButton.buttonMode = true;
volumeButton.on('pointerdown', onClickMute);
app.stage.addChild(volumeButton);

// place mute button in bottom right corner
const muteButton = PIXI.Sprite.from('public/images/mute.png')
muteButton.anchor.set(-14.9, -11.4);
muteButton.scale.set(0.05);
muteButton.interactive = true;
muteButton.buttonMode = true;
muteButton.on('pointerdown', onClickVolume);

// place start buttons in center of screen
addTitle();
const easyButton = PIXI.Sprite.from('public/images/easy.png');
easyButton.anchor.set(-2.2, -4.8);
easyButton.scale.set(1.3);
easyButton.interactive = true;
easyButton.buttonMode = true;
easyButton.on('pointerdown', onClickEasy);
app.stage.addChild(easyButton);
const mediumButton = PIXI.Sprite.from('public/images/medium.png');
mediumButton.anchor.set(-1.6, -6);
mediumButton.scale.set(1.3);
mediumButton.interactive = true;
mediumButton.buttonMode = true;
mediumButton.on('pointerdown', onClickMedium);
app.stage.addChild(mediumButton);
const hardButton = PIXI.Sprite.from('public/images/hard.png');
hardButton.anchor.set(-2.2, -7.2);
hardButton.scale.set(1.3);
hardButton.interactive = true;
hardButton.buttonMode = true;
hardButton.on('pointerdown', onClickHard);
app.stage.addChild(hardButton);

// place clouds at top of screen
const cloud1 = PIXI.Sprite.from('public/images/cloud.png');
cloud1.width = 300;
cloud1.anchor.set(0, -0.1);
cloud1.scale.set(0.12);
app.stage.addChild(cloud1);
const cloud2 = PIXI.Sprite.from('public/images/cloud.png');
cloud2.width = 250;
cloud2.anchor.set(-1, -0.1);
cloud2.scale.set(0.12);
app.stage.addChild(cloud2);
const cloud3 = PIXI.Sprite.from('public/images/cloud.png');
cloud3.width = 300;
cloud3.anchor.set(-1.6, -0.1);
cloud3.scale.set(0.12);
app.stage.addChild(cloud3);

// place logs at bottom of screen
const log1 = PIXI.Sprite.from('public/images/log1.png');
log1.width = 250;
log1.anchor.set(0.1, -15);
log1.scale.set(0.12);
app.stage.addChild(log1);
const log2 = PIXI.Sprite.from('public/images/log2.png');
log2.width = 250;
log2.anchor.set(-0.6, -16);
log2.scale.set(0.05);
app.stage.addChild(log2);
const log3 = PIXI.Sprite.from('public/images/log3.png');
log3.width = 250;
log3.anchor.set(-1.2, -7.8);
log3.scale.set(0.2);
app.stage.addChild(log3);
const log4 = PIXI.Sprite.from('public/images/log1.png');
log4.width = 250;
log4.anchor.set(-1.8, -15);
log4.scale.set(0.12);
app.stage.addChild(log4);
const log5 = PIXI.Sprite.from('public/images/log2.png');
log5.width = 250;
log5.anchor.set(-2.2, -16);
log5.scale.set(0.05);
app.stage.addChild(log5);

// place waves below screen view
const waves = PIXI.Sprite.from('public/images/waves.png');
waves.anchor.set(0, 1);
waves.scale.set(0.4);
app.stage.addChild(waves);

// place replay button offscreen
const replayButton = PIXI.Sprite.from('public/images/replay.png');
replayButton.anchor.set(-0.9, -1.7);
replayButton.scale.set(2);
replayButton.interactive = true;
replayButton.buttonMode = true;
replayButton.on('pointerdown', onClickReplay);

// start game by clicking difficulty-level button
function onClickEasy() {
  app.stage.removeChild(easyButton);
  app.stage.removeChild(mediumButton);
  app.stage.removeChild(hardButton);
  app.stage.removeChild(title);
  app.stage.removeChild(instructions);
  totalDrops = 5;
  speed = 0.4;
  wait = 2500;
  addScore();
  myLoop();
}
function onClickMedium() {
  app.stage.removeChild(easyButton);
  app.stage.removeChild(mediumButton);
  app.stage.removeChild(hardButton);
  app.stage.removeChild(title);
  app.stage.removeChild(instructions);
  totalDrops = 10;
  speed = 0.7;
  wait = 2000;
  addScore();
  myLoop();
}
function onClickHard() {
  app.stage.removeChild(easyButton);
  app.stage.removeChild(mediumButton);
  app.stage.removeChild(hardButton);
  app.stage.removeChild(title);
  app.stage.removeChild(instructions);
  totalDrops = 15;
  speed = 1;
  wait = 1500;
  addScore();
  myLoop();
}

function addTitle() {
  const titleStyle = new PIXI.TextStyle({
    fontFamily: 'Comic Sans MS',
    fontSize: 80,
    fontWeight: 'bold',
    fill: ['#00e1ff', '#0067c2'], // gradient
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 8,
    wordWrap: true,
    wordWrapWidth: 440,
    letterSpacing: 8
  });

  title = new PIXI.Text("Raindrops", titleStyle);
  title.x = 190;
  title.y = 100;
  instructions = new PIXI.Text("Type the words on each raindrop before they fall and break the dam!")
  instructions.x = 190;
  instructions.y = 100;
  instructions.scale.set(0.9);
  instructions.anchor.set(0.2, -4.7);
  app.stage.addChild(title);
  app.stage.addChild(instructions);
}

function addScore() {
  const scoreStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: ['#ffffff', '#00ff99'], // gradient
    stroke: '#4a1850',
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: 440,
    lineJoin: 'round',
  });

  richText = new PIXI.Text(`Score: ${score}`, scoreStyle);
  richText.x = 20;
  richText.y = app.screen.height - 100;

  app.stage.addChild(richText);
}

function onClickReplay() {
  sheeshSound.stop();
  app.stage.removeChild(replayButton);
  waves.anchor.set(0, 1);
  wavePos = -1;
  score = 0;
  misses = 0;
  repeat = 1;
  drops = [];
  app.stage.addChild(log1);
  app.stage.addChild(log2);
  app.stage.addChild(log3);
  app.stage.addChild(log4);
  app.stage.addChild(log5);
  myLoop();
}

function onClickMute() {
  let sounds = document.querySelectorAll("audio");
  [].forEach.call(sounds, sound => {
    sound.muted = true;
    sound.pause();
  })
  app.stage.removeChild(volumeButton);
  app.stage.addChild(muteButton);
}

function onClickVolume() {
  let sounds = document.querySelectorAll("audio");
  [].forEach.call(sounds, sound => {
    sound.muted = false;
  })
  app.stage.removeChild(muteButton)
  app.stage.addChild(volumeButton);
}

function removeLog() {
  switch (misses) {
      case 1:
        app.stage.removeChild(log2)
        splashSound.play();
        break;
      case 2:
        app.stage.removeChild(log4)
        splashSound.play();
        break;
      case 3:
        app.stage.removeChild(log1)
        splashSound.play();
        break;
      case 4:
        app.stage.removeChild(log5)
        splashSound.play();
        break;
      case 5:
        app.stage.removeChild(log3)
        bubblingSound.play();
        app.stage.addChild(replayButton);
    }
}

function myLoop() {
  rainSound.play();
  setTimeout(() => {
    for (let i = 0; i < Math.random() * 2; i++) {
        // create a new Sprite that uses the image name that we just generated as its source
        const drop = PIXI.Sprite.from('public/images/raindrop.png');
    
        // set the anchor point so the texture is centered on the sprite
        drop.anchor.set(0.26, 0.45);
    
        // set a random scale for the drop - no point them all being the same size!
        // drop.scale.set(0.1 + Math.random() * 0.1);
        drop.scale.set(0.04);
        drop.width = 120;
    
        // finally lets set the drop to be at a random position..
        if (i % 2 == 0) {
          drop.x = Math.random() * (app.screen.width/2 - 60) + 50;
          drop.y = 100;
        } else {
          drop.x = Math.random() * (app.screen.width-60 - app.screen.width/2) + app.screen.width/2;
          drop.y = 100;
        }

        // drop.tint = Math.random() * 0xFFFFFF;
    
        // create some extra properties that will control movement :
        // create a random direction in radians. This is a number between 0 and PI*2 which is the equivalent of 0 - 360 degrees
        drop.direction = Math.PI * 2;
    
        // this number will be used to modify the direction of the drop over time
        // drop.turningSpeed = 0;
    
        // create a random speed for the drop between 2 - 4
        drop.speed = speed;
    
        // finally we push the drop into the drops array so it it can be easily accessed later
        drops.push(drop);
    
        app.stage.addChild(drop);

        // const text = new PIXI.Text(words[Math.Random() * words.size()],
        const text = new PIXI.Text(words[Math.floor(Math.random() * (words.length))],
            {
              fontSize: 50,
              fontFamily: 'Arial',
              cacheAsBitmap: true, // for better performance
            });    
        text.scale.set(6);
        drop.addChild(text);
        // text.anchor.x = 0.5;
        // text.anchor.y = -0.5;
    
    // create a bounding box for the little drops
    const dropBoundsPadding = 100;
    const dropBounds = new PIXI.Rectangle(-dropBoundsPadding,
        -dropBoundsPadding,
        app.screen.width + dropBoundsPadding * 2,
        app.screen.height + dropBoundsPadding * 2);
    }

    repeat++;
    if (repeat < totalDrops && misses < 5) {
      myLoop();
    }
  }, wait)
}

const maxBottom = app.screen.height - 80;
let typedKey = "";
let typedWord = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
let typedText = "";
let increment1 = 0.3;
let increment2 = 0.2;
let increment3 = 0.3;
let wavePos = -1;

app.ticker.add(() => {
  if (richText) {
    richText.text = `Score: ${score}`;
  }

  if (drops.length === 0 && repeat >= totalDrops) {
    app.stage.addChild(replayButton);
    sheeshSound.play();
  }

  cloud1.x += increment1;
  if (cloud1.x >= 30) {
    increment1 = -0.3;
  }
  if (cloud1.x <= 0) {
    increment1 = 0.3;
  }

   cloud2.x += increment2;
  if (cloud2.x >= 30) {
    increment2 = -0.2;
  }
  if (cloud2.x <= 0) {
    increment2 = 0.2;
  }

  cloud3.x += increment3;

  if (cloud3.x >= 30) {
    increment3 = -0.3;
  }
  if (cloud3.x <= 0) {
    increment3 = 0.3;
  }
  // iterate through the drops and update their position
  for (let i = 0; i < drops.length; i++) {
      const drop = drops[i];
      // drop.direction += drop.turningSpeed * 0.01;
      // drop.x += Math.sin(drop.direction) * drop.speed;
      drop.y += drop.speed;
      // drop.rotation = -drop.direction - Math.PI / 2;

      // wrap the drops by testing their bounds...
      // if (drop.x < dropBounds.x) {
      //     drop.x += dropBounds.width;
      // } else if (drop.x > dropBounds.x + dropBounds.width) {
      //     drop.x -= dropBounds.width;
      // }

      // if (drop.y < dropBounds.y) {
      //     drop.y += dropBounds.height;
      // } else if (drop.y > dropBounds.y + dropBounds.height) {
      //     drop.y -= dropBounds.height;
      // }
    if (drop.y >= maxBottom && typedWord[0] != " " && drop.children[0].text.startsWith(typedWord.join("").trim())) {
      typedWord = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];   
    }
    if (drop.y >= maxBottom && drop.parent) {
      app.stage.removeChild(drop);
      drops.splice(i, 1);
      misses += 1;
      removeLog();
    }
    if (misses === 5) {
      repeat = totalDrops;
      for (let i = drops.length - 1; i >= 0; i--) {
        deleteDrop = drops[i]
        app.stage.removeChild(deleteDrop)
      }
      if (wavePos > 0.1) {
        wavePos = 0.2;
      } else {
        wavePos += 0.01;
      }
      waves.anchor.set(0, wavePos);
    }
  }
});

const update = () => {
  for (let i = 0; i < drops.length; i++) {
    const drop = drops[i];
    if (!drop.children[0].text.startsWith(typedWord.join("").trim())) {
      typedText = new PIXI.Text(drop.children[0].text,
      {
        fontSize: 50,
        fontFamily: 'Arial',
        cacheAsBitmap: true, // for better performance
      });     
      typedText.scale.set(6);
      drop.addChild(typedText);
    }
    else if (typedWord[0] === ' ' && drop.children[0].text[0] === typedKey) {
      typedWord[0] = typedKey;
      typedText = new PIXI.Text(typedWord.join(""),
      {
        fontSize: 50,
        fontFamily: 'Arial',
        fill: '#FF0000',
        cacheAsBitmap: true, // for better performance
      });    
      typedText.scale.set(6);
      drop.addChild(typedText);
      break;
    }
    else if (drop.children[0].text.slice(0, 2) === typedWord.join("").trim() + typedKey) {
      typedWord[1] = typedKey;
      typedText = new PIXI.Text(typedWord.join(""),
      {
        fontSize: 50,
        fontFamily: 'Arial',
        fill: '#FF0000',
        cacheAsBitmap: true, // for better performance
      });    
      typedText.scale.set(6);
      drop.addChild(typedText);
      break;
    }
    else if (drop.children[0].text.slice(0, 3) === typedWord.join("").trim() + typedKey) {
      typedWord[2] = typedKey;
      typedText = new PIXI.Text(typedWord.join(""),
      {
        fontSize: 50,
        fontFamily: 'Arial',
        fill: '#FF0000',
        cacheAsBitmap: true, // for better performance
      });     
      typedText.scale.set(6);
      drop.addChild(typedText);
      break;
    }
    else if (drop.children[0].text.slice(0, 4) === typedWord.join("").trim() + typedKey) {
      typedWord[3] = typedKey;
      typedText = new PIXI.Text(typedWord.join(""),
      {
        fontSize: 50,
        fontFamily: 'Arial',
        fill: '#FF0000',
        cacheAsBitmap: true, // for better performance
      });     
      typedText.scale.set(6);
      drop.addChild(typedText);
      break;
    }
    else if (drop.children[0].text.slice(0, 5) === typedWord.join("").trim() + typedKey) {
      typedWord[4] = typedKey;
      typedText = new PIXI.Text(typedWord.join(""),
      {
        fontSize: 50,
        fontFamily: 'Arial',
        fill: '#FF0000',
        cacheAsBitmap: true, // for better performance
      });     
      typedText.scale.set(6);
      drop.addChild(typedText);
      break;
    }
    else if (drop.children[0].text.slice(0, 6) === typedWord.join("").trim() + typedKey) {
      typedWord[5] = typedKey;
      typedText = new PIXI.Text(typedWord.join(""),
      {
        fontSize: 50,
        fontFamily: 'Arial',
        fill: '#FF0000',
        cacheAsBitmap: true, // for better performance
      });     
      typedText.scale.set(6);
      drop.addChild(typedText);
      break;
    }
    else if (drop.children[0].text.slice(0, 7) === typedWord.join("").trim() + typedKey) {
      typedWord[6] = typedKey;
      typedText = new PIXI.Text(typedWord.join(""),
      {
        fontSize: 50,
        fontFamily: 'Arial',
        fill: '#FF0000',
        cacheAsBitmap: true, // for better performance
      });     
      typedText.scale.set(6);
      drop.addChild(typedText);
      break;
    }
    else if (drop.children[0].text.slice(0, 8) === typedWord.join("").trim() + typedKey) {
      typedWord[7] = typedKey;
      typedText = new PIXI.Text(typedWord.join(""),
      {
        fontSize: 50,
        fontFamily: 'Arial',
        fill: '#FF0000',
        cacheAsBitmap: true, // for better performance
      });     
      typedText.scale.set(6);
      drop.addChild(typedText);
      typedWord = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
      setTimeout(() => {
        app.stage.removeChild(drop);
        drops.splice(i, 1);
        dropSound.play();
        score += 1;
      }, 200)
      break;
    }
  }
}

document.addEventListener('keydown', e => {
  typedKey = e.key;
  update();
}, false);
