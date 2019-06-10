
const havasKep = document.querySelector(".havaskep");
const bezuhan = document.querySelector(".bezuhan");

function checkScroll() {
    const rectPic = havasKep.getBoundingClientRect();
    if(rectPic.top <= 215 && rectPic.top >= -600) {
        bezuhan.classList.remove('eltunik-animate');
        bezuhan.classList.add('bezuhan-animate');
    } else {
        bezuhan.classList.remove('bezuhan-animate');
        bezuhan.classList.add('eltunik-animate');
    }
}

window.addEventListener('scroll', checkScroll, false);
window.addEventListener('resize', checkScroll, false);