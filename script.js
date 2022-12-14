import init, {output_highlight_span, init_panic_hook, emulate}  from "./pkg/urcl_rs.js"

/**
 * @template T
 * @param {{new(...args: any): T}} clazz 
 * @param {*} obj 
 * @returns {T}
 */
function with_class(clazz, obj) {
    if (obj instanceof clazz) {
        return obj;
    } else {
        throw new Error(`expected ${clazz.name} but got ${obj?.constructor?.name}`);
    }
}

/**
 * @template {HTMLElement} T
 * @param {{new(...args: any): T}} clazz 
 * @param {string} name 
 * @returns {T}
 */
function by_id(clazz, name) {
    return with_class(clazz, document.getElementById(name));
}

const stdout = by_id(HTMLElement, "stdout");
const highlight = by_id(HTMLElement, "highlight");
const code_input = by_id(HTMLTextAreaElement, "code_input");
const auto_emulate = by_id(HTMLInputElement, "auto-emulate");

export function now() {
    return performance.now();
}

export function out_graphics(x, y, colour) {
    // 
}

export function out_err(text) {
    //
}

export function clear_text() {
    stdout.innerText = "";
}

export function in_text() { // needs to have a null terminate character if null terminate box is pressed
    // like stdin
}

export function out_text(text) {
    stdout.innerText = stdout.innerText + text;
}

let htmlBuf = "";


export function out_html(text) {
    htmlBuf += text + '\n';
    highlight.innerText = htmlBuf;
}
/**
 * @param {string} text 
 * @param {string} clazz 
 */
export function out_span(text, class_name) {
    const span = document.createElement("span");
    span.textContent = text;
    span.className = class_name;
    highlight.appendChild(span);
}

export function output_registers(regs) {

}

export async function clear_span() {
    htmlBuf = "";
    highlight.innerHTML = "";
}

export function resync_highlight() {
    highlight.style.top      = code_input.getBoundingClientRect().top + "px";
    highlight.style.left     = code_input.getBoundingClientRect().left + "px";
    highlight.style.width    = (code_input.getBoundingClientRect().width  - parseFloat(getComputedStyle(highlight).fontSize)) + "px";
    highlight.style.height   = (code_input.getBoundingClientRect().height - parseFloat(getComputedStyle(highlight).fontSize)) + "px";
}

init().then(() => { // all code should go in here
    init_panic_hook();
    
    code_input.oninput = e => { output_highlight_span(code_input.value); }
    
    code_input.onkeydown = e => {
        if (e.key == 'Tab') {
            e.preventDefault();
            let a = code_input.selectionStart+1;
            code_input.value = code_input.value.substring(0, code_input.selectionStart) + "\t" + code_input.value.substring(code_input.selectionEnd);
            code_input.setSelectionRange(a, a);
            output_highlight_span(code_input.value);
        }
    };

    code_input.onscroll = e => {
        highlight.scrollTo(0, code_input.scrollTop);
    };

    resync_highlight();
    
    document.getElementById("emulate").onclick = function() {
        emulate(code_input.value);
    };

    document.getElementById("document_link").onclick = function() {
        window.open("https://github.com/ModPunchtree/URCL/releases/latest", "_blank");
    };

    document.getElementById("clear").onclick = function() {
        clear_text();
    };

    document.getElementById("settings").onclick = function() {
        document.getElementById("settings_sec").style.opacity       = 1;
        document.getElementById("settings_sec").style.zIndex        = 999;
        document.getElementById("settings_sec").style.pointerEvents = "auto";
    };

    document.getElementById("exit_settings").onclick = function() {
        document.getElementById("settings_sec").style.opacity           = 0;
        setTimeout(() => {
            document.getElementById("settings_sec").style.zIndex        = -999;
            document.getElementById("settings_sec").style.pointerEvents = "none";
        }, 250);
    };

    document.getElementsByTagName("body")[0].onbeforeunload = function() {
        localStorage.setItem("auto_emulate", auto_emulate.checked ? "t" : "f");
    };

    document.getElementsByTagName("body")[0].onresize = function() {
        resync_highlight();
    };

    auto_emulate.checked = localStorage.getItem("auto_emulate") == "t" ? true : false;
    output_highlight_span(code_input.value);
});
