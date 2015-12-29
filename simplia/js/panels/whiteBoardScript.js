var whiteboardApp = {};

whiteboardApp.color = "black";
whiteboardApp.penWidth = '3';
whiteboardApp.episodesAndSnapsImages = [];
whiteboardApp.startRecording;
whiteboardApp.stopRecording;
whiteboardApp.playbackRecording;
whiteboardApp.undoSegment;
whiteboardApp.redoSegment;
whiteboardApp.showPreviousEpisodeImage;
whiteboardApp.saveCurrentWork;
whiteboardApp.getCurrentWork;
whiteboardApp.resetCanvas;
whiteboardApp.clearCanvas;
whiteboardApp.openLocalImage;
whiteboardApp.removeDrawingListners;
whiteboardApp.drawCanvasImage;
whiteboardApp.drawCanvasImageFromURL;
whiteboardApp.downEvent;
whiteboardApp.moveEvent;
whiteboardApp.upEvent;
whiteboardApp.canvas;
whiteboardApp.ctx;

whiteboardApp.isActive = false;
whiteboardApp.plots = [];
whiteboardApp.startDrawingTime = 0;

whiteboardApp.isRecording = false;
whiteboardApp.drawingRecording = [];
whiteboardApp.drawingRecordingHistory = [];
whiteboardApp.fileList;
whiteboardApp.isTouchSupported;
whiteboardApp.isPointerSupported;
whiteboardApp.isMSPointerSupported;
whiteboardApp.intializeWhiteboard;

//if (typeof canvas === 'undefined') {
//    console.log("Reload dom elements to get canvas");
//    //TODO  : Find better solution to detect if canvas element still doesn't load
//    location.reload();
//    console.log("reloaded");
//} else {

/* ---------------------- Draw on canvas ----------------------*/
whiteboardApp.drawOnCanvas = function (color, plots) {
    console.log($(".drawCanvas").parent());
    if (plots !== undefined && plots.length > 0) {
        whiteboardApp.ctx.strokeStyle = color;
        whiteboardApp.ctx.fillStyle = color;
        whiteboardApp.ctx.lineWidth = whiteboardApp.penWidth;
        whiteboardApp.ctx.beginPath();
        whiteboardApp.ctx.moveTo(plots[0].x, plots[0].y);

        for (var i = 1; i < plots.length; i++) {
            whiteboardApp.ctx.lineTo(plots[i].x, plots[i].y);
        }
        whiteboardApp.ctx.stroke();
    }
}

/* ---------------------- Draw on canvas ----------------------*/
whiteboardApp.drawLine = function (delay, x, y) {
    setTimeout(function () {
        whiteboardApp.ctx.lineTo(x, y);
        whiteboardApp.ctx.stroke();
    }, delay);
};


/*----------------------------------------------------------*/
whiteboardApp.drawTimedOnCanvas = function (color, penWidth, plots, delayedTime, startTime, endTime, imageSrc) {
    console.log("Color = " + color);
    console.log("Pen Width = " + penWidth);
    console.log("delayed Time = " + delayedTime);

    if (plots !== undefined && plots.length > 0) {
        var deltaTime = (endTime - startTime) / plots.length;

        setTimeout(function (x, y) {
            if (color == "") {
                setTimeout(function (imageSrc) {
                    whiteboardApp.drawCanvasImage(imageSrc);
                }, (delayedTime + endTime - startTime), imageSrc);
            } else {
                setTimeout(function (x, y, color, penWidth, imageSrc) {
                    whiteboardApp.ctx.beginPath();
                    whiteboardApp.ctx.strokeStyle = color;
                    whiteboardApp.ctx.lineWidth = penWidth;
                    whiteboardApp.ctx.moveTo(x, y);
                }, (delayedTime + deltaTime), plots[0].x, plots[0].y, color, penWidth, imageSrc);

                for (var i = 1; i < plots.length; i++) {
                    whiteboardApp.drawLine(delayedTime + (deltaTime * (i + 1)), plots[i].x, plots[i].y);
                }
            }
        }, delayedTime, plots[0].x, plots[0].y);
    }
}

/*----------------------------------------------------------*/
whiteboardApp.openLocalImage = function () {
    $(".uploadImage").click();
}

/*----------------------------------------------------------*/
whiteboardApp.uplaodImage = function () {
    if (($(".uploadImage"))[0].files && ($(".uploadImage"))[0].files[0]) {
        var fileReader = new FileReader();
        fileReader.onload = function (e) {
            var img = new Image();
            img.onload = function () {
                whiteboardApp.ctx.drawImage(img, 0, 0);
                whiteboardApp.saveCurrentWork();
            };
            img.src = e.target.result;
        };
        fileReader.readAsDataURL(($(".uploadImage"))[0].files[0]);
    }
}

/*----------------------------------------------------------*/

whiteboardApp.draw = function (e) {
    e.preventDefault(); // prevent continuous touch event process e.g. scrolling!
    if (!whiteboardApp.isActive) return;
    var cursorPosition = whiteboardApp.fitCursor(e);
    whiteboardApp.plots.push({x: (cursorPosition.x << 0), y: (cursorPosition.y << 0)}); // round numbers for touch screens
    whiteboardApp.drawOnCanvas(whiteboardApp.color, whiteboardApp.plots);
}

/*----------------------------------------------------------*/

whiteboardApp.startDraw = function (e) {
    e.preventDefault();
    console.log($(".drawCanvas").parent());

    whiteboardApp.isActive = true;
    if (whiteboardApp.isRecording) {
        whiteboardApp.startDrawingTime = new Date().getTime();
    }
    console.log('Mouse Down');
    whiteboardApp.fitCursor(e);
    document.body.style.cursor = 'none';
    $('#mycursor').show();
}

/*----------------------------------------------------------*/

whiteboardApp.endDraw = function (e) {
    e.preventDefault();
    whiteboardApp.isActive = false;
    whiteboardApp.saveEpisodeSegment(whiteboardApp.color, whiteboardApp.startDrawingTime);
    whiteboardApp.plots = [];
    document.body.style.cursor = '';
    $('#mycursor').hide();
    //drawingRecordingHistory = [];
}

/*----------------------------------------------------------*/
whiteboardApp.fitCursor = function (e) {
    var rect = whiteboardApp.canvas.getBoundingClientRect();

    whiteboardApp.isTouchSupported && e.originalEvent.touches !== undefined ? (console.log(e.originalEvent.touches[0].pageX)) : (console.log(e.clientX));
    whiteboardApp.isTouchSupported && e.originalEvent.touches !== undefined ? (console.log(e.originalEvent.touches[0].pageY)) : (console.log(e.clientY));

    var x = whiteboardApp.isTouchSupported && e.originalEvent.touches !== undefined ? (e.originalEvent.touches[0].pageX - rect.left) : (e.clientX - rect.left);
    var y = whiteboardApp.isTouchSupported && e.originalEvent.touches !== undefined ? (e.originalEvent.touches[0].pageY - rect.top) : (e.clientY - rect.top);
    //
    console.log('Mouse Moving');
    console.log("X: " + x);
    console.log("Y: " + y);

    $('#mycursor').css("left", x - 12).css("top", y + 20);

    return {x: x, y: y};
}

/*----------------------------------------------------------*/
whiteboardApp.startRecording = function () {
    if (!whiteboardApp.isRecording) {
        //ctx.clearRect(0, 0, canvas.width, canvas.height);
        whiteboardApp.isRecording = true;
        whiteboardApp.drawingRecording = [];
        whiteboardApp.drawingRecordingHistory = [];
        whiteboardApp.saveCurrentWork();
    }
}

/*----------------------------------------------------------*/
whiteboardApp.stopRecording = function () {
    if (whiteboardApp.isRecording) {
        whiteboardApp.isRecording = false;
        whiteboardApp.saveCurrentWork();
    }
}

/*----------------------------------------------------------*/
whiteboardApp.playbackRecording = function (p_drawingRecording) {
    var drawingRecording;

    if (p_drawingRecording !== undefined) {
        drawingRecording = p_drawingRecording;
    } else {
        drawingRecording = whiteboardApp.drawingRecording;
    }

    if (drawingRecording.length > 0) {
        whiteboardApp.ctx.clearRect(0, 0, whiteboardApp.canvas.width, whiteboardApp.canvas.height);
        var timeDelay = 0;

        for (var i = 0; i < drawingRecording.length; i++) {
            if (i != 0) {
                timeDelay += (drawingRecording[i - 1].endTime - drawingRecording[i - 1].startTime) + 500;
            }
            whiteboardApp.drawTimedOnCanvas(drawingRecording[i].color,
                drawingRecording[i].penWidth,
                drawingRecording[i].plots,
                timeDelay,
                drawingRecording[i].startTime,
                drawingRecording[i].endTime,
                drawingRecording[i].image);
        }
    }
}

/*----------------------------------------------------------*/
whiteboardApp.undoSegment = function () {
    if (whiteboardApp.drawingRecording != "" && whiteboardApp.drawingRecording.length > 0) {
        whiteboardApp.drawingRecordingHistory.push(whiteboardApp.drawingRecording.pop());
        whiteboardApp.clearCanvas();
        if (whiteboardApp.drawingRecording.length > 0) {
            whiteboardApp.drawCanvasImage(whiteboardApp.drawingRecording[whiteboardApp.drawingRecording.length - 1].image);
        }
    }
}

/*----------------------------------------------------------*/
whiteboardApp.redoSegment = function () {
    if (whiteboardApp.drawingRecordingHistory != "" && whiteboardApp.drawingRecordingHistory.length > 0) {
        whiteboardApp.drawingRecording.push(whiteboardApp.drawingRecordingHistory.pop());
        whiteboardApp.clearCanvas();
        whiteboardApp.drawCanvasImage(whiteboardApp.drawingRecording[whiteboardApp.drawingRecording.length - 1].image);
    }
}

/*----------------------------------------------------------*/
whiteboardApp.showPreviousEpisodeImage = function (imageIndex) {
    whiteboardApp.clearCanvas();
    if (whiteboardApp.episodesAndSnapsImages.length > 0) {
        whiteboardApp.drawCanvasImage(whiteboardApp.episodesAndSnapsImages[imageIndex]);
    }
}

/*----------------------------------------------------------*/
whiteboardApp.saveCurrentWork = function () {
    console.log("Save Current Work ======> ");
    console.log(whiteboardApp.canvas.toDataURL());
    whiteboardApp.episodesAndSnapsImages[whiteboardApp.episodesAndSnapsImages.length.toString()] = whiteboardApp.canvas.toDataURL();
    whiteboardApp.saveEpisodeSegment("", new Date().getTime() - 1000);
}

/*----------------------------------------------------------*/
whiteboardApp.saveEpisodeSegment = function (color, startTime) {
    whiteboardApp.drawingRecording.push({
        color: color,
        penWidth: whiteboardApp.penWidth,
        plots: whiteboardApp.plots,
        startTime: startTime,
        endTime: new Date().getTime(),
        image: whiteboardApp.canvas.toDataURL()
    });
}

/*----------------------------------------------------------*/
whiteboardApp.drawCanvasImage = function (imageData, x, y, callback) {
    console.log("Draw Canvas Image =======>");
    console.log(imageData);
    var image = new Image();
    image.onload = function () {
        whiteboardApp.ctx.drawImage(image, (x == undefined ? 0 : x), (y == undefined ? 0 : y));
        if (callback !== undefined && callback) {
            callback();
        }
    }
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = imageData;
}

/*----------------------------------------------------------*/
whiteboardApp.drawCanvasImageFromURL = function (imageURL) {
    //Loading of the home test image - img1
    var image = new Image();
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = function () {
        whiteboardApp.ctx.drawImage(image, 0, 0);
        whiteboardApp.saveCurrentWork();
    };
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = imageURL;
}

/*----------------------------------------------------------*/
whiteboardApp.getCurrentWork = function () {
    whiteboardApp.saveCurrentWork();
    return whiteboardApp.drawingRecording;
}

/*----------------------------------------------------------*/
whiteboardApp.resetCanvas = function () {
    whiteboardApp.ctx.clearRect(0, 0, whiteboardApp.canvas.width, whiteboardApp.canvas.height);
    whiteboardApp.isActive = false;
    whiteboardApp.plots = [];
    whiteboardApp.startDrawingTime = 0;

    if (whiteboardApp.isRecording)
        whiteboardApp.stopRecording();

    whiteboardApp.isRecording = false;
    whiteboardApp.drawingRecording = [];
    whiteboardApp.drawingRecordingHistory = [];
    //episodesAndSnapsImages = [];
    whiteboardApp.startRecording();
}
/*----------------------------------------------------------*/
whiteboardApp.clearCanvas = function () {
    whiteboardApp.ctx.clearRect(0, 0, whiteboardApp.canvas.width, whiteboardApp.canvas.height);
}

/*----------------------------------------------------------*/
whiteboardApp.removeDrawingListners = function () {
    if (whiteboardApp.isTouchSupported) {
        $(".drawCanvas").off("touchstart", whiteboardApp.startDraw);
        $(".drawCanvas").off("touchmove", whiteboardApp.draw);
        $(".drawCanvas").off("touchend", whiteboardApp.endDraw);
        $("#mycursor").off("touchmove", whiteboardApp.draw);
        $("#mycursor").off("touchend", whiteboardApp.endDraw);
    }
    if (whiteboardApp.isPointerSupported) {
        $(".drawCanvas").off("pointerdown", whiteboardApp.startDraw);
        $(".drawCanvas").off("pointermove", whiteboardApp.draw);
        $(".drawCanvas").off("pointerup", whiteboardApp.endDraw);
        $("#mycursor").off("pointermove", whiteboardApp.draw);
        $("#mycursor").off("pointerup", whiteboardApp.endDraw);
    }
    if (whiteboardApp.isMSPointerSupported) {
        $(".drawCanvas").off("MSPointerDown", whiteboardApp.startDraw);
        $(".drawCanvas").off("MSPointerMove", whiteboardApp.draw);
        $(".drawCanvas").off("MSPointerUp", whiteboardApp.endDraw);
        $("#mycursor").off("MSPointerMove", whiteboardApp.draw);
        $("#mycursor").off("MSPointerUp", whiteboardApp.endDraw);
    }
    $(".drawCanvas").off("mousedown", whiteboardApp.startDraw);
    $(".drawCanvas").off("mousemove", whiteboardApp.draw);
    $(".drawCanvas").off("mouseup", whiteboardApp.endDraw);
    $("#mycursor").off("mousemove", whiteboardApp.draw);
    $("#mycursor").off("mouseup", whiteboardApp.endDraw);
}

whiteboardApp.setupWhiteboardListners = function () {
    console.log("setting up the listners on ===>");
    console.log($(".drawCanvas"));
    console.log($("#mycursor"));

    whiteboardApp.downEvent = whiteboardApp.isTouchSupported ? 'touchstart' :
        (whiteboardApp.isPointerSupported ? 'pointerdown' :
            (whiteboardApp.isMSPointerSupported ? 'MSPointerDown' : 'mousedown'));

    whiteboardApp.moveEvent = whiteboardApp.isTouchSupported ? 'touchmove' :
        (whiteboardApp.isPointerSupported ? 'pointermove' :
            (whiteboardApp.isMSPointerSupported ? 'MSPointerMove' : 'mousemove'));

    whiteboardApp.upEvent = whiteboardApp.isTouchSupported ? 'touchend' :
        (whiteboardApp.isPointerSupported ? 'pointerup' :
            (whiteboardApp.isMSPointerSupported ? 'MSPointerUp' : 'mouseup'));

    console.log(whiteboardApp.downEvent);
    console.log(whiteboardApp.moveEvent);
    console.log(whiteboardApp.upEvent);

    if (whiteboardApp.isTouchSupported) {
        $(".drawCanvas").on("touchstart", whiteboardApp.startDraw);
        $(".drawCanvas").on("touchmove", whiteboardApp.draw);
        $(".drawCanvas").on("touchend", whiteboardApp.endDraw);
        $("#mycursor").on("touchmove", whiteboardApp.draw);
        $("#mycursor").on("touchend", whiteboardApp.endDraw);
    }
    if (whiteboardApp.isPointerSupported) {
        $(".drawCanvas").on("pointerdown", whiteboardApp.startDraw);
        $(".drawCanvas").on("pointermove", whiteboardApp.draw);
        $(".drawCanvas").on("pointerup", whiteboardApp.endDraw);
        $("#mycursor").on("pointermove", whiteboardApp.draw);
        $("#mycursor").on("pointerup", whiteboardApp.endDraw);
    }
    if (whiteboardApp.isMSPointerSupported) {
        $(".drawCanvas").on("MSPointerDown", whiteboardApp.startDraw);
        $(".drawCanvas").on("MSPointerMove", whiteboardApp.draw);
        $(".drawCanvas").on("MSPointerUp", whiteboardApp.endDraw);
        $("#mycursor").on("MSPointerMove", whiteboardApp.draw);
        $("#mycursor").on("MSPointerUp", whiteboardApp.endDraw);
    }
    $(".drawCanvas").on("mousedown", whiteboardApp.startDraw);
    $(".drawCanvas").on("mousemove", whiteboardApp.draw);
    $(".drawCanvas").on("mouseup", whiteboardApp.endDraw);
    $("#mycursor").on("mousemove", whiteboardApp.draw);
    $("#mycursor").on("mouseup", whiteboardApp.endDraw);

    console.log("Finish setting up the listners on ===>");
}

whiteboardApp.intializeWhiteboard = function () {
    whiteboardApp.canvas = $('.drawCanvas')[0];
    whiteboardApp.ctx = whiteboardApp.canvas.getContext('2d');

    whiteboardApp.isTouchSupported = 'ontouchstart' in window;
    whiteboardApp.isPointerSupported = navigator.pointerEnabled;
    whiteboardApp.isMSPointerSupported = navigator.msPointerEnabled;

    whiteboardApp.episodesAndSnapsImages = [];
    whiteboardApp.ctx.strokeStyle = whiteboardApp.color;
    whiteboardApp.ctx.lineWidth = whiteboardApp.penWidth;
    whiteboardApp.ctx.lineCap = whiteboardApp.ctx.lineJoin = 'round';

    $('body').css("overflow", "hidden");
    $(".uploadImage").on("change", whiteboardApp.uplaodImage);
}
