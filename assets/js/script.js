// Harvest Hub Assam Tea Website

window.addEventListener("scroll", () => {
    const header = document.querySelector("header");

    if (window.scrollY > 50) {
        header.style.background = "#082314";
    } else {
        header.style.background = "rgba(8,35,20,.95)";
    }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {
            target.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});
// Scroll Animation

const revealElements = document.querySelectorAll(
".about,.gallery,.contact,.hero"
);

window.addEventListener("scroll", reveal);

function reveal(){

const trigger = window.innerHeight * 0.85;

revealElements.forEach(section=>{

const top = section.getBoundingClientRect().top;

if(top<trigger){

section.style.opacity="1";
section.style.transform="translateY(0)";

}

});

}

reveal();

revealElements.forEach(section=>{

section.style.opacity="0";

section.style.transform="translateY(60px)";

section.style.transition="all .8s ease";

});
