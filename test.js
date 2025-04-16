function saveHTML() {
    let content = `<!DOCTYPE html>\n` + document.querySelector("*").outerHTML;
    let contentbase64 = window.btoa(encodeURIComponent(content));
    localStorage.setItem("accueiliframe", contentbase64);
}

// function setIframe() {
//     let contentbase64 = localStorage.getItem("accueiliframe");
//     let content = decodeURIComponent(window.atob(contentbase64));
//     let iframe = document.createElement("iframe");
//     iframe.id = "accueiliframe";
//     iframe.srcdoc = content;
//     document.body.append(iframe);
// }

function setIframe(w="600px", h="400px") {
    let contentbase64 = localStorage.getItem("accueiliframe");
    let content = decodeURIComponent(window.atob(contentbase64));

    let container = document.createElement("div");
    container.style.position = "relative";
    container.style.height = h;
    container.style.width = w;

    let iframe = document.createElement("iframe");
    iframe.id = "accueiliframe";
    iframe.srcdoc = content;
    iframe.style.height = h;
    iframe.style.width = w;
    iframe.style.borderRadius = "10px";
    iframe.style.border = "none";
    iframe.style.boxShadow = "rgba(149, 157, 165, 0.2) 0px 8px 24px";
    container.appendChild(iframe);

    let invisible = document.createElement("div");
    invisible.style.position = "absolute";
    invisible.style.top = "0";
    invisible.style.left = "0";
    invisible.style.width = "100%";
    invisible.style.height = "100%";
    invisible.style.background = "transparent";
    invisible.style.zIndex = "10";
    invisible.style.pointerEvents = "all";
    container.appendChild(invisible);

    document.body.append(container);
}






// Créer un conteneur
const container = document.createElement('div');
container.className = 'slidecontainer';
document.body.appendChild(container);

// Créer le slider
const slider = document.createElement('input');
slider.type = 'range';
slider.min = 0;
slider.max = 1;
slider.value = 0.9;
slider.className = 'slider';
slider.id = 'myRange';
container.appendChild(slider);

// Ajouter les styles dynamiquement
const style = document.createElement('style');
style.textContent = `
    .slidecontainer {
        width: 100%; /* Width of the outside container */
    }

    .slider {
        -webkit-appearance: none;
        width: 100%;
        height: 15px;
        border-radius: 5px;  
        background: #d3d3d3;
        outline: none;
        opacity: 0.7;
        -webkit-transition: .2s;
        transition: opacity .2s;
    }

    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 25px;
        height: 25px;
        border-radius: 50%; 
        background: #04AA6D;
        cursor: pointer;
    }

    .slider::-moz-range-thumb {
        width: 25px;
        height: 25px;
        border-radius: 50%;
        background: #04AA6D;
        cursor: pointer;
    }`;
document.head.appendChild(style);
