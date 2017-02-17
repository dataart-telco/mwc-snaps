"use strict";

let WebCamera = require("webcamjs");
let axios = require("axios");
let moment = require("moment");


let currentTime = moment().format("HH:mm:ss");

function setTime() {
    document.getElementsByClassName("time_block")[0].innerHTML = currentTime;
    setTimeout(function () {
        currentTime = moment().format("HH:mm:ss")
        setTime()
    }, 1000)
}

function setCameraLight() {
    document.getElementsByClassName("icon_camera")[0].className = "icon_camera active";
    setTimeout(function () {
        document.getElementsByClassName("icon_camera")[0].className = "icon_camera"
    }, 1000)
}

function turnOnSiren() {
    let config = {headers: CONFIG.SIREN.HEADERS};

    axios.post(CONFIG.SIREN.SERVER + "/api/pwm/control", CONFIG.SIREN.BODY, config)
        .then(function (res) {
            console.log(res)
        })
}

function callRestcom() {
    let config = {
        headers: {
            "Authorization": "Basic " + btoa(CONFIG.RESTCOM.BASIC.USER + ":" + CONFIG.RESTCOM.BASIC.PASS),
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };
    let form = []
    for (let k in CONFIG.RESTCOM.FORM) {
        form.push(k+"="+CONFIG.RESTCOM.FORM[k])
    }
    axios.post(CONFIG.RESTCOM.SERVER, form.join("&"), config)
        .then(function (res) {
            console.log(res)
        })
}

function sendToSalesForce() {
    let config = {headers: CONFIG.SALESFORCE.HEADERS};
    axios.post(CONFIG.SALESFORCE.SERVER, CONFIG.SALESFORCE.BODY, config)
        .then(function (res) {
            console.log(res)
        })
}

function maskIsFound() {
    if (document.getElementsByTagName("body")[0].className != "mask_color") {
        document.getElementsByTagName("body")[0].className = "mask_color";
        turnOnSiren();
        callRestcom();
        sendToSalesForce();
    }


}


function maskIsGone() {
    document.getElementsByTagName("body")[0].className = ""
}

function createFromForSend(data) {
    let form_elem_name = "file";
    let image_fmt = '';
    if (data.match(/^data\:image\/(\w+)/)) {
        image_fmt = RegExp.$1;
    }
    else {
        throw "Cannot locate image format in Data URI";
    }
    let raw_image_data = data.replace(/^data\:image\/\w+\;base64\,/, '');
    let blob = new Blob([WebCamera.base64DecToArr(raw_image_data)], {type: 'image/' + image_fmt});
    let form = new FormData();

    form.append(form_elem_name, blob, form_elem_name + "." + image_fmt.replace(/e/, ''));

    return form
}

function renderImage(data, time) {
    let wrap = document.getElementById("photos");
    let photo = document.createElement("div");
    photo.className = "preview_item";
    photo.innerHTML = ` <div class="photo_wrapper"><img src="${data}" /></div>
                            <div class="row desc_wrapper">
                                <div class="col-md-8">
                                    Today, ${time}
                                </div>
                                <div class="col-md-4 text-right">
                                    <span class="icon_camera">
                                        <svg width="14px" height="8px" viewBox="0 0 28 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                            <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                <g id="icon-camera" transform="translate(-1044.000000, -64.000000)" fill="#FFFFFF">
                                                    <g id="camera" transform="translate(1044.000000, 64.000000)">
                                                        <g id="Group-2">
                                                            <path d="M18,5.13015787 L18,0 L0,0 L0,14 L18,14 L18,9.25783857 L24.5,12.8351618 L24.5,2 L18,5.13015787 Z" id="Combined-Shape"></path>
                                                        </g>
                                                    </g>
                                                </g>
                                            </g>
                                        </svg>
                                    </span>
                                    <span></span>
                                </div>
                            </div>`;
    wrap.appendChild(photo);
}

function writeLog() {

}

function snap() {
    WebCamera.snap(function (data) {
        setCameraLight()
        let time = currentTime;
        let form = createFromForSend(data);

        const config = {headers: {"api-key": CONFIG.API_KEY}};

        axios.post(CONFIG.SERVER, form, config)
            .then(function (res) {
                let mask = false;
                for (let i = 0; i < res.data.length; i++) {
                    if (res.data[i].name == CONFIG.NAME_MASK && res.data[i].score > CONFIG.ACCURACY) {
                        maskIsFound();
                        renderImage(data, time);
                        mask = true
                    }
                }

                if (!mask) {
                    maskIsGone()
                }

                snap()
            });

    })
}


setTime();
WebCamera.set({
    image_format: 'jpeg',
    jpeg_quality: 90,
    force_flash: false,
    flip_horiz: true,
    fps: 45
});
WebCamera.attach('#video');
WebCamera.on('load', function () {
    snap();
    console.log("The camera has been started")
});
;