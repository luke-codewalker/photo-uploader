const upload = document.querySelector('.upload');
const resizer = document.querySelector('.resizer');
const uploadImg = document.querySelector('#uploadImg');
const uploadBtn = document.querySelector('#uploadBtn');
const preview = document.querySelector('.preview');
const maskImgContainer = document.querySelector('.mask-img-container');
const fullImgContainer = document.querySelector('.full-img-container');
const dragReceiver = document.querySelector('.drag-receiver');
const cutCanvas = document.querySelector('#cut');
const cutCtx = cutCanvas.getContext('2d');
const warning = document.querySelector('.warning')
let start = {};
let end = {};
// find % of coordinate in img where middle of cutout area is
let leftUpperCorner = { x: -0.5, y: -0.5 };

uploadBtn.addEventListener('click', () => {
    const src = URL.createObjectURL(uploadImg.files[0]);
    const fullImg = new Image();
    const originalSize = { w: 0, h: 0 }

    clearChildren(fullImgContainer);
    fullImgContainer.appendChild(fullImg);

    fullImg.classList.add('movable');
    fullImg.src = src;

    fullImg.addEventListener('load', () => {
        originalSize.w = fullImg.clientWidth;
        originalSize.h = fullImg.clientHeight;

        if (fullImg.width < fullImg.height) {
            fullImg.classList.add('fixed-width');
        } else {
            fullImg.classList.add('fixed-height');
        }
        URL.revokeObjectURL(src);
        upload.style.setProperty('--img-width', `${fullImg.clientWidth}px`);
        upload.style.setProperty('--img-height', `${fullImg.clientHeight}px`);
        resizer.value = fullImg.clientHeight / originalSize.h;

        start = { x: fullImg.offsetLeft, y: fullImg.offsetTop };
        end = { x: fullImg.offsetLeft, y: fullImg.offsetTop };
        copyImg();

        dragReceiver.addEventListener('mousedown', (e) => {
            start.x = e.offsetX;
            start.y = e.offsetY;
            dragReceiver.addEventListener('mousemove', moveImg);
        })

        dragReceiver.addEventListener('mouseup', copyImg);

        dragReceiver.addEventListener('mouseleave', copyImg);
    });

    function moveImg(e) {
        maskImg.setAttribute('style', `top:${limit(end.y + e.offsetY - start.y, dragReceiver.clientHeight - fullImg.clientHeight, 0)}px;left:${limit(end.x + e.offsetX - start.x, dragReceiver.clientWidth - fullImg.clientWidth, 0)}px;`);
        fullImg.setAttribute('style', `top:${limit(end.y + e.offsetY - start.y, dragReceiver.clientHeight - fullImg.clientHeight, 0)}px;left:${limit(end.x + e.offsetX - start.x, dragReceiver.clientWidth - fullImg.clientWidth, 0)}px;`);

        leftUpperCorner.x = (fullImg.offsetLeft - dragReceiver.clientWidth / 2) / fullImg.clientWidth;
        leftUpperCorner.y = (fullImg.offsetTop - dragReceiver.clientHeight / 2) / fullImg.clientHeight;
    }

    function copyImg() {
        end.x = fullImg.offsetLeft;
        end.y = fullImg.offsetTop;
        const scaleX = fullImg.naturalWidth / fullImg.clientWidth;
        const scaleY = fullImg.naturalHeight / fullImg.clientHeight;

        cutCtx.fillRect(0, 0, cutCanvas.width, cutCanvas.height);
        cutCtx.drawImage(fullImg,
            -1 * end.x * scaleX,
            -1 * end.y * scaleY,
            dragReceiver.clientWidth * scaleX,
            dragReceiver.clientHeight * scaleY,
            0, 0, cutCanvas.width, cutCanvas.height);
        dragReceiver.removeEventListener('mousemove', moveImg);
    }

    const src2 = URL.createObjectURL(uploadImg.files[0]);
    const maskImg = new Image();
    clearChildren(maskImgContainer);
    maskImgContainer.appendChild(maskImg);

    maskImg.classList.add('movable');
    maskImg.src = src2;

    maskImg.addEventListener('load', () => {
        if (maskImg.width < maskImg.height) {
            maskImg.classList.add('fixed-width');
        } else {
            maskImg.classList.add('fixed-height');
        }
        URL.revokeObjectURL(src2);
    });

    resizer.addEventListener('input', (e) => {
        const scale = e.target.value;
        if (scale > 1) {
            warning.classList.remove('inactive');
        } else {
            warning.classList.add('inactive');
        }

        fullImg.setAttribute('width', originalSize.w * e.target.value);
        fullImg.setAttribute('height', originalSize.h * e.target.value);

        maskImg.setAttribute('width', originalSize.w * e.target.value);
        maskImg.setAttribute('height', originalSize.h * e.target.value);

        upload.style.setProperty('--img-width', `${fullImg.clientWidth}px`);
        upload.style.setProperty('--img-height', `${fullImg.clientHeight}px`);

        maskImg.setAttribute('style', `top:${limit(maskImg.clientHeight * leftUpperCorner.y + dragReceiver.clientHeight / 2, dragReceiver.clientHeight - maskImg.clientHeight, 0)}px;left:${limit(maskImg.clientWidth * leftUpperCorner.x + dragReceiver.clientWidth / 2, dragReceiver.clientWidth - maskImg.clientWidth, 0)}px;`)
        fullImg.setAttribute('style', `top:${limit(fullImg.clientHeight * leftUpperCorner.y + dragReceiver.clientHeight / 2, dragReceiver.clientHeight - fullImg.clientHeight, 0)}px;left:${limit(fullImg.clientWidth * leftUpperCorner.x + dragReceiver.clientWidth / 2, dragReceiver.clientWidth - fullImg.clientWidth, 0)}px;`)

        copyImg();
    })

});

// function to limit a number between lower and higher bound
const limit = (n, low, high) => {
    if (n >= low && n <= high) {
        return n;
    } else if (n < low) {
        return low;
    } else if (n > high) {
        return high;
    }
}

// function to remove all children of an element
const clearChildren = (elt) => {
    while (elt.firstChild) {
        elt.removeChild(elt.firstChild);
    }
}