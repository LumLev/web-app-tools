
export class HTMLPage extends HTMLElement {
    static get TagName() {
        return `${this.Route}-page`;
    }

    set routeName(val) {
        this._routeName = val;
        this.loadHTMLAsync();
    }

    constructor() { super(); }

    static defineAndMain() {
        this.defineSelf();
        this.conquerMain();
    }

    static defineSelf() {
        if (this.canBeDefined() == false) { return; }
        customElements.define(this.TagName, this);
    }

    static conquerMain(elementSelector = "main") {
        document.querySelector(elementSelector).innerHTML = `<${this.TagName}> </${this.TagName}>`;
    }

    static canBeDefined() {
        if (this.Route == undefined) { console.log("Undefined Route"); return false; }
        if (this.isTagRegistered(this.TagName)) { return false; }

        return true;
    }

    static isTagRegistered(name) {
        return (document.createElement(name)?.constructor !== HTMLElement);
    }

    static safeDefine(name, type) {
        if (this.isTagRegistered(name)) { return; }
        customElements.define(name, type);
    }

    async loadHTMLAsync(route = null) {
        if (route == null) { route = this._routeName ?? "home"; }
        const homeReq = await fetch(`/pages/${route}.html`, { cache: "force-cache" });
        const homeHtml = await homeReq.text();
        this.innerHTML = homeHtml;
        this.dispatchEvent(new Event("loadeddata"));
    }
}

export class HTMLButtonSelect extends HTMLElement {
    static {
        customElements.define("buttons-select", this);
    }

    /**
     *  
     * @param {[]} opts
     * @returns {HTMLButtonSelect}
     */
    static create(opts, isRequired = false, isMultiple = false) {
        const selector = new this(false);
        if (isRequired) { selector.setAttribute("required", true); }
        if (isMultiple) { selector.setAttribute("multiple", true); }

        selector.options = opts;
        return selector;
    }

    /** @type {string[]}*/
    #options = [];

    get options() { return this.#options; }
    set options(val) {
        this.#options = val;
        this.innerHTML = "";
        for (let i = 0; i < val.length; i++) {
            const but = document.createElement("button");
            but.setAttribute("index", i);
            but.setAttribute("value", val[i]);
            but.innerHTML = `<t-xt key='${val[i]}'></t-xt>`;

            but.onclick = async () => {
                const index = Number.parseInt(but.getAttribute("index"));
                if (this.hasAttribute("multiple")) {
                    if (this.selectedRange.includes(index)) {
                        this.selectedRange.pop(index);
                        but.toggleAttribute("selected", false);
                        if (this.hasAttribute("required")) {
                            this.selectedIndex = "0";
                        }
                        return;
                    }
                }
                else if (but.getAttribute("index") == this.selectedIndex) {
                    this.selectedIndex = "-1";
                    but.toggleAttribute("selected", false);
                    if (this.hasAttribute("required")) {
                        this.selectedIndex = "0";
                    }
                    return;
                }

                this.selectedIndex = but.getAttribute("index");

            }

            this.insertAdjacentElement("beforeend", but);
        }

        if (this.hasAttribute("required")) {
            this.selectedIndex = "0";
        }

        return this.#options;
    }

    /** */
    #selectedIndex = "0";

    /** @type {number[]}*/
    selectedRange = [];

    get selectedRangeValues() {
        return this.selectedRange.map((index) => { return this.options[index]; });
    }

    get selectedValue() { return this.#options[Number.parseInt(this.#selectedIndex)]; }


    get selectedIndex() { return this.#selectedIndex; }
    set selectedIndex(val) {
        this.#selectedIndex = val;
        this.dispatchEvent(new Event("selectionchange"));

        if (this.hasAttribute("multiple")) {
            const indexNo = Number.parseInt(val);
            this.selectedRange.push(indexNo);
            this.querySelectorAll(`button[index]`)[indexNo].setAttribute("selected", true);
            return;
        }

        for (const button of this.querySelectorAll("button[index]")) {
            if (button.getAttribute("index") == this.selectedIndex) {
                button.toggleAttribute("selected", true);
            }
            else { button.toggleAttribute("selected", false); }
        }
    }

    // First one can never be disabled as its needed for fallback
    disableOptions(optionsIndexes) {
        const buttons = this.querySelectorAll("button[index]");
        for (let i = 1; i < buttons.length; i++) {
            if (optionsIndexes.includes(i)) {
                buttons[i].setAttribute("disabled", true);
            }
            else { buttons[i].removeAttribute("disabled"); }
        }
    }
    constructor(getAttributes = true) {
        super();
        if (getAttributes && this.hasAttribute("options")) {

            this.options = this.getAttribute("options").split("-");
            this.selectedIndex = this.getAttribute("selected") ?? "0";
        }
    }
}

export class LoadingDialog extends HTMLElement {
    static { this.safeDefine(); }

    constructor() {
        super();
    }


    connectedCallback()
    {
        this.start();
       
    }


start()
{
        this.innerHTML =
            `

                    <style>

                    loading-dialog[open]
 {
                        position: fixed;
                        display: block;
                        inset: 0;
                        height: 100vh;
                        width: 100vw;
                        background-color: var(--app-back);
                        color: var(--app-front);
                        border: 0;
                        margin: 0;
                        padding: 0;
                        z-index: 999;

                       

                        & svg {
                            width: 30vh;
                            height: 30vh;
                        }


& .container {
  width: 100vw;
  height: 100vh;
  display: grid;
  place-items: center;
}

& .loader {
  width: 100px;
  animation: rotate 1s ease-in-out infinite;
}

& .top {
  animation: top-load 1s ease-in-out infinite;
}

& .bottom {
  animation: bot-load 1s ease-in-out infinite;
}
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  12.5% {
    transform: rotate(45deg);
  }
  25% {
    transform: rotate(90deg);
  }
  37.5% {
    transform: rotate(135deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(180deg);
  }
}

@keyframes top-load {
  0% {
    fill: none;
  }
  50% {
    fill: none;
  }
  66.67% {
    fill: url(#lgt_03);
  }
  83.34%{
    fill: url(#lgt_02);
  }
  100% {
    fill: url(#lgt_01);
  }
}

@keyframes bot-load {
  0% {
    fill: url(#lgb_01);
  }
  50% {
    fill: url(#lgb_01);
  }
  66.67% {
    fill: url(#lgb_02);
  }
  83.34% {
    fill: url(#lgb_03);
  }
  100% {
    fill: none;
  }


                        }



                                </style>

                   <article class='container'>
                    <svg class='loader' viewBox="0 0 89 104" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path class='bottom' d="M2 102L87 102L44.5 52L2 102Z" fill="url(#lgb_01)" />
    <path d="M50.9394 59.5L87 102H2L87 2H2L38.0606 44" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    <path class='top' d="M87 2L2 2L44.5 52L87 2Z"/>
  </svg>

  <svg style='position: absolute;'>
    <defs>
      <linearGradient id="lgb_01" x1="44.5" y1="102" x2="44.5" y2="52" gradientUnits="userSpaceOnUse">
        <stop />
        <stop offset="0.6" />
        <stop offset="0.6" stop-color="#A2A2A2" stop-opacity="0" />
        <stop offset="1" stop-color="#C4C4C4" stop-opacity="0" />
      </linearGradient>

      <linearGradient id="lgb_02" x1="44.5" y1="102" x2="44.5" y2="52" gradientUnits="userSpaceOnUse">
        <stop />
        <stop offset="0.3" />
        <stop offset="0.3" stop-color="#696969" stop-opacity="0" />
        <stop offset="1" stop-color="#C4C4C4" stop-opacity="0" />
      </linearGradient>

      <linearGradient id="lgb_03" x1="44.5" y1="102" x2="44.5" y2="52" gradientUnits="userSpaceOnUse">
        <stop />
        <stop offset="0.1" />
        <stop offset="0.1" stop-color="#696969" stop-opacity="0" />
        <stop offset="1" stop-color="#C4C4C4" stop-opacity="0" />
      </linearGradient>

      <linearGradient id="lgt_01" x1="44.5" y1="2" x2="44.5" y2="52" gradientUnits="userSpaceOnUse">
        <stop />
        <stop offset="0.6" />
        <stop offset="0.6" stop-color="#A2A2A2" stop-opacity="0" />
        <stop offset="1" stop-color="#C4C4C4" stop-opacity="0" />
      </linearGradient>

      <linearGradient id="lgt_02" x1="44.5" y1="2" x2="44.5" y2="52" gradientUnits="userSpaceOnUse">
        <stop />
        <stop offset="0.3" />
        <stop offset="0.3" stop-color="#A2A2A2" stop-opacity="0" />
        <stop offset="1" stop-color="#C4C4C4" stop-opacity="0" />
      </linearGradient>

      <linearGradient id="lgt_03" x1="44.5" y1="2" x2="44.5" y2="52" gradientUnits="userSpaceOnUse">
        <stop />
        <stop offset="0.1" />
        <stop offset="0.1" stop-color="#A2A2A2" stop-opacity="0" />
        <stop offset="1" stop-color="#C4C4C4" stop-opacity="0" />
      </linearGradient>
    </defs>
  </svg>
                   </article>

`;



    }

    static self = document.querySelector("loading-dialog");


    static showModal() {
        this.self.toggleAttribute("open", true);
    }

    static close() {
        this.self.removeAttribute("open");
    }

    static safeDefine() { HTMLPage.safeDefine("loading-dialog", this); }
}

export class HTMLSwiper extends HTMLElement {
    static {
        customElements.define("html-swiper", HTMLSwiper);
    }


    constructor() {
        super();
    }

    /** @type {HTMLButtonElement[]}*/
    buttons;

    connectedCallback() {
        this.start();
    }


    start() {
        /** @type {HTMLElement}*/
        this.buttons = document.createElement("buttons");

        /** @type {HTMLElement[]}*/
        this.swipers = this.getElementsByTagName("swiper");





        for (let i = 0; i < this.swipers.length; i++) {
            const button = document.createElement("button");
            button.setAttribute("swiper-index", i);

            /** @type {HTMLElement}*/
            const swiper = this.swipers[i];


            const svgid = swiper.getAttribute("button-svgid");


            if (svgid) {
                const elsvg = document.getElementById(svgid);
                if (elsvg) {
                    button.insertAdjacentHTML("beforeend", `
                    <svg viewBox='${elsvg.getAttribute("viewBox")}'>
                     ${elsvg.innerHTML}
                    </svg>`);
                }
            }

            const buttonclassattr = swiper.getAttribute("buttonclass");


            if (buttonclassattr) {
                button.setAttribute("class", buttonclassattr);
            }

            button.setAttribute("command", "--select-swiper");
            button.setAttribute("commandfor", this.id);

            const span = document.createElement("span");
            span.textContent = swiper.getAttribute("swiper-name");
            button.appendChild(span);

            this.buttons.appendChild(button);
        }


        this.setCommand();
        this.appendChild(this.buttons);

        this.setStyle();
        this.selectByIndex(0);
    }


    setCommand() {

        this.oncommand = (cm) => {

            switch (cm.command) {
                case "--select-swiper":
                    const swindex = Number.parseInt(cm.source.getAttribute("swiper-index"));
                    this.selectByIndex(swindex);
                    return;

                case "--reload-swipers":
                    this.start();
                    return;
            }
        }
    }

    clearSelection() {
        for (const swiper of this.swipers) {
            swiper.setAttribute("hidden", true);
        }

        for (const button of this.buttons.getElementsByTagName("button")) {
            button.removeAttribute("selected");
        }
    }

    selectByIndex(index) {
        let i = 0;
        for (; i < this.swipers.length; i++) {
            this.swipers[i].toggleAttribute("hidden", (index != i));
        }

        const buttons = this.buttons.getElementsByTagName("button");

        for (i = 0; i < buttons.length; i++) {
            buttons[i].toggleAttribute("selected", (index == i));
        }
    }





    setStyle() {
        const style = document.createElement("style");



        style.innerHTML = `
html-swiper
{
    display: flex;
    }
    buttons {
        display: grid;
        grid-template-${this.getAttribute("grid-type") ?? "columns"}: repeat(${this.swipers.length}, 1fr);
    
        & > button[selected]
        {
            color: var(--swiper-color);
        }
    }


    swiper 
    {
        height: 100%;
        width: 100%;
        display: flex;
        grid-row:2;
        grid-column: span ${this.swipers.length};
    }

    swiper[hidden] 
    {
        display: none;
    }`;

        this.appendChild(style);
    }

}


export function DOWNLOAD(text, filename, type = "text/calendar") {
    const blob = new Blob([text], { type: type });
    DOWNLOADBLOB(blob, filename);
}

export function DOWNLOADBLOB(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export async function SHAREICS(icsText, title = "Event", filename = "event.ics") {




    const type = "text/calendar;charset=utf-8";
    const blob = new Blob([icsText], { type });
    const file = new File([blob], filename, { type });


    console.log({
        secure: window.isSecureContext,
        inIframe: window.self !== window.top,
        activation: navigator.userActivation?.isActive,
        canShareFile: navigator.canShare?.({ files: [file] }),
    });

    // 1. Prefer native file share (mobile, some desktop browsers)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({ title, files: [file] });
            return;
        } catch (e) {
            if (e.name === "AbortError") return; // user cancelled, don't download
            console.warn("Share failed, falling back to download:", e);
        }
    }

    // 2. Fallback: download the file
    // (sharing a blob: URL isn't useful, since other apps can't open it)
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}


async function shareLocationAsync(lat, lon, title, text) {
    const url = `https://maps.google.com/?q=${lat},${lon}`;

    if (navigator.share) {
        return navigator.share({
            title,
            text: `${text}\n${data}`,
            url
        });
    }

    window.open(url, "_blank");
}


export function UPDATEICONFILL(newColor) {
    // ensure "#"
    if (!newColor.startsWith('#')) newColor = '#' + newColor;

    // encode "#" → %23
    const encoded = newColor.replace('#', '%23');

    const link = document.querySelector("link[rel='icon'][type='image/svg+xml']");
    if (!link) return;

    // replace fill='%23xxxxxx'
    link.href = link.href.replace(/fill='%23[0-9A-Fa-f]{6}'/, `fill='${encoded}'`);
}
