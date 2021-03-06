const filenames = [];
const w = 600;
const h = 450;
let globalImgData;

/*
to do list:
1. add an eraser
2. add a slider to change stroke size
3. 取色器？
4. guest's name
*/

//collect file names; assign EventListener to each photo and the frame
const table = document.getElementsByTagName('table');
//1 table for now; in case i add more tables in the future ↓
for(let i = 0; i < table.length; ++i) {
	//get all images in the current table
    const imageElements = table[i].getElementsByTagName('img');
    for(let j = 0; j < imageElements.length; ++j) { 
    	filenames.push(imageElements[j].src);
        imageElements[j].addEventListener('click', function(){changePhoto(this.src);});
        imageElements[j].addEventListener('click', function(){changeCaption(this.alt);});
    }
}

/*
This function changes the photo in the frame
	if click on a picture: display the picture in the frame
	if click on the frame: display a random picture
*/
function changePhoto(path){
	let frame = document.getElementById('photo_frame');
	//if click on a picture
    if(path) {
        frame.src = path;
        frame.scrollIntoView();
        return;
    }

    //if click on the fram (no path)
    let randIndex = Math.floor(Math.random() * filenames.length);
    while (frame.src === filenames[randIndex]){	
    	randIndex = Math.floor(Math.random() * filenames.length);
    }
    frame.src = filenames[randIndex];
    document.getElementById('photo_caption').innerHTML = '';	//clear caption if there's one
}
/*
This function changes the frame caption to the parameter
*/
function changeCaption(caption) {
    document.getElementById('photo_caption').innerHTML = caption;
}




///////////////////////

// function downloadImage() {
//     let imageURL = drawing.canvas.toDataURL('image/png');
//     let request = new XMLHttpRequest();
//     request.responseType = 'blob';

//     request.onload = function() {
//         let a = document.createElement('a');
//         a.href = window.URL.createObjectURL(request.response);
//         a.download = 'canvas.png';
//         a.style.display = 'none';
//         document.body.appendChild(a);
//         a.click();
//         a.remove();
//     }

//     request.open('GET', imageURL);
//     request.send();
// }

//for the canvas

//canvas buttons
/*
This function erases the pixels by using the API clearRect
*/
function clearCanvas() {
    drawing.context.clearRect(0, 0, drawing.canvas.width, drawing.canvas.height);
}
/*
This function cleans up and saves the current canvas, 
	append the current canvas to Guest Drawings, 
	and create a new canvas and append.
*/
function newCanvas() {
    //remove all event listeners from drawing.canvas
    drawing.canvas.removeEventListener("mousedown", drawing.canvas_mousedown);
    drawing.canvas.removeEventListener("mouseup", drawing.canvas_mouseup);
    drawing.canvas.removeEventListener("mousemove", drawing.canvas_mousemove);

    //save canvas
    saveCanvas();
    //append the current picture to Guest Past Drawings
    document.getElementById("past_drawings").append(document.getElementsByTagName('canvas')[0]);

    //create a new canvas
    let newCanvas = document.createElement('canvas');
    drawing = new Drawing(newCanvas, w, h, color);
    drawing.start();
    //append the newCanvas to the drawing area
    document.getElementById('drawing_area').appendChild(newCanvas);
}
/*
This function saves the canvas data, 
	append the picture to past drawings,
	and create a new canvas and append it to the drawing area
*/
function saveCanvas() {
	//get the current canvas and save it to a global variable globalImgData
    let imgData=drawing.context.getImageData(0, 0, drawing.canvas.width, drawing.canvas.height);
    globalImgData = imgData.data;

    //send this canvas to the server
    // drawing.canvas.toBlob(function(blob) {
    //     let image = new File([blob], 'tmp.png', {
    //         type: 'image/png'
    //     });

    //     const request = new XMLHttpRequest();

    //     let formdata = new FormData();
    //     formdata.append('image', image);

    //     request.open('POST', 'process_images.php');
    //     request.onload = function() {
    //         if(this.status === 200) {
    //             console.log(this.responseText.trim());
    //         }
    //     };

    //     request.send(formdata);
    // });
}
/*
This function loads our most recent saved canvas and put it on the current canvas, 
then remove the picture appended in Guest Drawings
*/
function loadCanvas() {
	//get saved canvas and current canvas
    let savedData = globalImgData;
    let imgData = drawing.context.getImageData(0, 0, drawing.canvas.width, drawing.canvas.height);

    //paste our saved canvas data to the current canvas
    let data = imgData.data;
    for(let i = 0; i < data.length; i++){
        data[i] = savedData[i];
    }

    //put the data into canvas
    drawing.context.putImageData(imgData, 0, 0);  
    //remove the picture from Guest Drawings
    let canvases = document.getElementById("past_drawings");
    canvases.removeChild(canvases.lastChild);
}

/*
This function updates the color of the stroke and save it to cookies
*/
function updateColors() {
    let r = document.getElementById('red').value;
    let g = document.getElementById('green').value;
    let b = document.getElementById('blue').value;

    drawing.set_color(r, g, b);
    document.getElementById('swatch').style.backgroundColor = "rgb(" + r + "," + g + "," + b + ")";

    document.cookie = "red=" + r;
    document.cookie = "green=" + g;
    document.cookie = "blue=" + b;
}




///////////////////////




//set up canvas
/*
This function sets up the canvas for a new drawing
*/
function Drawing(canvas, width, height, color) {
    this.canvas = canvas;
    this.canvas.width = width;
    this.canvas.height = height;

    this.context = canvas.getContext('2d');
    this.context.strokeStyle = color;
    this.context.lineWidth = 3;

    this.x = 0;
    this.y = 0;
};
//bind "this" to be the drawing object
/*
This function adds eventlistener when we do mousedown and mouse up
*/
Drawing.prototype.start = function() {
    this.canvas_mousedown = this.canvas_mousedown.bind(this);
    this.canvas_mouseup = this.canvas_mouseup.bind(this);
    this.canvas.addEventListener("mousedown", this.canvas_mousedown);
    this.canvas.addEventListener("mouseup", this.canvas_mouseup);
};
/*
This function draws from old x,y to new x,y
*/
Drawing.prototype.draw = function(newX, newY) {
    this.context.beginPath();
    this.context.moveTo(this.x, this.y);
    this.context.lineTo(newX, newY);
    this.context.stroke();
    this.context.closePath();
};
/*
When mousedown, we add eventlistener mousemove
*/
Drawing.prototype.canvas_mousedown = function(e) {
    this.x = e.offsetX;
    this.y = e.offsetY;
    this.canvas_mousemove = this.canvas_mousemove.bind(this);
    this.canvas.addEventListener("mousemove", this.canvas_mousemove);
};
/*
When mouseup, we remove the eventlistener and reset x,y
*/
Drawing.prototype.canvas_mouseup = function(e) {
    this.canvas.removeEventListener("mousemove", this.canvas_mousemove);
    this.draw(e.offsetX, e.offsetY);
    this.x = 0;
    this.y = 0;
};
/*
This function adds an EventListener 
*/
Drawing.prototype.canvas_mousemove = function(e) {
    this.draw(e.offsetX, e.offsetY);
    this.x = e.offsetX;
    this.y = e.offsetY;
};
/*
This function changes the color of our stroke
*/
Drawing.prototype.set_color = function(r, g, b) {
    this.context.strokeStyle = "rgb(" + r + "," + g + "," + b + ")";
}


//const colors = [[255, 0, 0], [0, 255, 0], [0, 0, 255]];
//const randIndex = Math.floor(Math.random() * colors.length);
//document.getElementById('swatch').style.backgroundColor = "rgb(" + colors[randIndex][0] + "," + colors[randIndex][1] + "," + colors[randIndex][2] + ")";
const color = '#70c2ff'
document.getElementById('swatch').style.backgroundColor = color;
let drawing = new Drawing(document.getElementsByTagName('canvas')[0], w, h, color);
window.onload = function() {
    drawing.start();
    //check to if any cookies for color have been set
    let cookieValues = document.cookie.split('; ')
    let r, g, b;
    for(let i = 0; i < cookieValues.length; i++) {
        let localCookie = cookieValues[i].split('=');
        if(localCookie[0] === 'red') {
            r = localCookie[1];
        } else if(localCookie[0] === 'green') {
            g = localCookie[1];
        } else if(localCookie[0] === 'blue') {
            b = localCookie[1];
        }
    }

    //set color of canvas based on cookie if such cookies exist
    if(r !== undefined && g !== undefined && b !== undefined) {
    	//change stroke color
        drawing.set_color(r, g, b);
        //change the values of the sliders
        document.getElementById('red').value = Number(r);
        document.getElementById('green').value = Number(g);
        document.getElementById('blue').value = Number(b);
        //change the swatch
        document.getElementById('swatch').style.backgroundColor = "rgb(" + r + "," + g + "," + b + ")";
    }


    // const request = new XMLHttpRequest();
    // request.onload = function() {
    //     if(this.status === 200) {
    //         let documents = this.responseText.trim();
    //         documents = documents.split(',');
    //         documents.forEach(name => {
    //             let newImage = new Image();
    //             newImage.src = 'saved/' + name;
    //             document.getElementById('past_drawings').append(newImage);
    //         });
    //     }
    // };

    // request.open('GET', 'get_images.php');
    // request.send();
}