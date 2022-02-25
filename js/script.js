const video = document.getElementById('video')

const element = document.getElementById('search-button')

const faceData = {
  angry: 0,
  disgusted: 0,
  fearful: 0,
  happy: 0,
  neutral: 0,
  sad: 0,
  surprised: 0
}

// ineffienct by lib..
let angry = new ldBar(".barAngry");
let disgusted = new ldBar(".barDisgusted");
let fearful = new ldBar(".barFearful");
let happy = new ldBar(".barHappy");
let neutral = new ldBar(".barNeutral");
let sad = new ldBar(".barSad");
let surprised = new ldBar(".barSurprised");

element.addEventListener("click", () => {
  let url = document.getElementsByName('search')[0].value
  makeEmbed(url)
});

function youtube_parser(url){
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  var match = url.match(regExp);
  return (match&&match[7].length==11)? match[7] : false;
}

function makeEmbed(url) {
  let id = youtube_parser(url)
  document.getElementById("videoObject").setAttribute('src', 'https://www.youtube.com/embed/' + id + '?autoplay=0')
  // start detect face
  startDetect()
}

function startDetect() {
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
  ]).then(startVideo)
}

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  //bug...
  // document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    // const resizedDetections = faceapi.resizeResults(detections, displaySize)
		
    if (detections.length > 0 && detections[0].detection.score > 0.7) {
      laughDetection(detections)
      let highestValue = Object.entries(detections[0].expressions).sort((x,y)=>y[1]-x[1])[0]
      // give point for highest emotion
      faceData[highestValue[0]]++
      calculatePercentage()
    }
  }, 250)
})

function laughDetection(detections) {
  if (detections[0].expressions.happy > 0.5) {
    console.log('Jaja je lacht!');
  }
}

function calculatePercentage() {
  //effiencter maken
  // let dominantExpression = Object.entries(faceData).sort((x,y)=>y[1]-x[1])[0]
  var totalSum = Object.keys(faceData).reduce((sum,key)=>sum+parseFloat(faceData[key]||0),0)
  console.log('totaal:'+totalSum)
  for (const [key, value] of Object.entries(faceData)) {
    let emotionPercentage = 0
    if (value != 0) {
      //formule verzinnen hier...
      //(3/150)*100
      emotionPercentage = (value/totalSum) * 100
    }
    let emotion = key
    switch(emotion) {
      case 'angry':
        angry.set(emotionPercentage);
        break;
      case 'disgusted':
        disgusted.set(emotionPercentage);
        break;
      case 'fearful':
        fearful.set(emotionPercentage);
        break;
      case 'happy':
        happy.set(emotionPercentage);
        break;
      case 'neutral':
        neutral.set(emotionPercentage);
        break;
      case 'sad':
        sad.set(emotionPercentage);
        break;
      case 'surprised':
        surprised.set(emotionPercentage);
        break;
      default:
        console.log('niks')
    }
  }
}