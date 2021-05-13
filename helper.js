var overlap = null;

function blockView() {
    if (overlap !=null) {return;}
    overlap = document.createElement("div");
    overlap.style.height = "100%";
    overlap.style.width = "100%";
    overlap.style.position = "absolute";
    overlap.style.top = "0";
    overlap.style.zIndex = "999";
    overlap.style.opacity = "0.5";
    overlap.style.backgroundColor ="gray";
    document.body.appendChild(overlap);
}

function unblockView() {
    if (overlap == null) { return; }
    overlap.remove();
    overlap = null;
}