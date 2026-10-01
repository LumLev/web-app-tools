export class LangText extends HTMLElement {
    static {
        customElements.define("t-xt", this);
    }

    static async getResourceAsync(newLang, resource = this._resource) 
    {
        const response = await fetch(`/assets/resources/${resource}/${resource}-lang.${newLang.slice(0,2)}.json`, { cache: "force-cache" });
        if (response.ok)
        {
            this._fields = await response.json();
            return true;
        }
        else return false;
    }


    static _resource;


    // _fields are inserted in the object like key value pairs.
    static _fields;
    constructor() { super(); }

    connectedCallback() {
        if (LangText._fields != null) { this.updateText(); }
    }
    updateText() {
        const key = this.getAttribute("key");
        if (key != null) {
            // Defaults to the key text identifier
            this.textContent = LangText._fields[key] ?? key;
        }
    }

    static updateAll() {
        for (const langText of document.querySelectorAll("t-xt")) { langText.updateText(); }
    }


    field(key) {
        if (LangText._fields) {
            return LangText._fields[key] ?? key;
        }
        else return key;
    }


}
// Set languages



export class LangSelect extends HTMLElement {

    static {
        customElements.define("lang-select", this);

    }

    static self = document.querySelector("lang-select");


    constructor() {

        super();
    }



    static get selectedLang() { return document.documentElement.getAttribute("lang"); }


    static set selectedLang(val) {
        document.documentElement.setAttribute("lang", val);
        localStorage.setItem("lang", val);
        document.querySelector("lang-select").dispatchEvent(new Event("langchanged"));
    }

    async connectedCallback() {

        /** @type {string[]}*/
        LangSelect._languages = ["en", "de", "fr", "es", "sq", "he", "da", "it"];
        /** @type {string}*/
        LangSelect.selectedLang = localStorage.getItem("lang") ?? this.getUserLangauge2chars();
        await this.startAsync();

    }


    async setLanguagesAsync(langs = ["en", "de"])
    {
        LangSelect._languages = langs;
        LangSelect.selectedLang = "en";
        await this.startAsync();
    }


    async startAsync() {
   
        const select = this.querySelector("select") ?? document.createElement("select");
        select.innerHTML = "";
        for (let lango of LangSelect._languages) {
            if (LangSelect.selectedLang == lango) {
                select.insertAdjacentHTML("beforeend", `<option value="${lango}" selected>${lango.toUpperCase()}</option>`);
            }
            else {
                select.insertAdjacentHTML("beforeend", `<option value="${lango}">${lango.toUpperCase()}</option>`);
            }
        }

        select.onchange = async () => {
            const val = select.value.trim();
            const changed = await LangSelect.changeLanguageAsync(val.toLowerCase());
            if (changed == false) {
                select.value = LangSelect.selectedLang;

            }

        };

        this.insertAdjacentElement("beforeend", select);
    }



    async changeResourceAsync(val) {
        await LangSelect.changeLanguageAsync(null, val);
    }



    static async changeLanguageAsync(val =null, resource = null)
    {

        if (resource == null) { resource = this.self.getAttribute("resource"); }
        if (val == null) { val = LangSelect.selectedLang ?? document.documentElement.getAttribute("lang") }
        let culture;
        if (navigator.language.startsWith(val) == false)
        {
            switch (val)
            {
                case "en":
                    culture = "en-US";
                    break;
                default:
                    culture = `${val}-${val.toUpperCase()}`;
                    break;
            }
        }
        else {
            culture = navigator.language;
        }



        try
        {
            const result = await LangText.getResourceAsync(val, resource);
            if (result)
            {
                document.querySelector('html').setAttribute("culture", culture);
                LangSelect.selectedLang = val;

               this.self?.setAttribute("resource", resource);

                LangText.updateAll();
         
                this.self?.dispatchEvent(new Event("selectionchanged"));
                return true;
            }
            return false;
        }
        catch (e)
        {
            alert(document.querySelector("t-xt").field("NetworkError"));
            return false;
        }
    }



    getUserLangauge2chars() {
        return navigator.language.toLowerCase().slice(0, 2);
    }

}



