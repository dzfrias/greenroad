async function translateText() {
    const input = document.getElementById("userBox").value;
    const lang = getCurrentLang();
    const translated = await Parse.Cloud.run("translate", {text: input, to: abbrevLang(lang)});
    const output = document.getElementById("translation");
    cleanupInfo()
    if (typeof(translated) == "string") {
        output.innerText = translated;
        return;
    }
    let newInner = "";
    for (const segment of translated.characters) {
        newInner += "<span class=\"segment\" onmouseover=\"getInfo(this.innerText)\">" + segment + "</span>";
    }
    output.innerHTML = newInner + "<br><span class=\"small\">" + translated.pinyin + "</span>";
    document.getElementById("info").style.display = "none";
}

function cleanupInfo() {
    document.getElementById("info").style.display = "none";
    document.querySelectorAll(".cleanup").forEach(elem => elem.remove());
}

let definitionCache = {};
async function getInfo(segment) {
    const info = document.getElementById("info");

    // Get definition
    let definition;
    if (definitionCache.hasOwnProperty(segment)) {
        definition = definitionCache[segment]
    } else {
        definition = await Parse.Cloud.run("define", {word: segment});
    }
    definitionCache[segment] = definition;
    cleanupInfo()

    // Make header for the character
    const characterHeader = document.getElementById("character");
    characterHeader.innerText = definition.simplified;

    // Add each definition for the character
    for (const def of Object.values(definition.definitions)) {
        // Add the pinyin for each definition
        const pinyinElem = document.createElement("span");
        pinyinElem.innerText = def.pinyin;
        pinyinElem.classList.add("pinyin");
        pinyinElem.classList.add("cleanup");
        info.appendChild(pinyinElem);

        // Add each translation
        const transList = document.createElement("ul");
        transList.classList.add("translations");
        transList.classList.add("cleanup");
        info.appendChild(transList);
        for (const trans of def.translations) {
            const translationElem = document.createElement("li");
            translationElem.innerText = trans;
            transList.appendChild(translationElem);
        }

        // Add each character classifier
        if (def.classifiers === undefined || def.classifiers === null) {
            continue;
        }
        const classifiersElem = document.createElement("span");
        classifiersElem.classList.add("cleanup");
        classifiersElem.classList.add("bold");
        classifiersElem.innerText = "Classifiers:"
        info.appendChild(classifiersElem);
        const classifiersList = document.createElement("ul");
        classifiersList.classList.add("cleanup");
        info.appendChild(classifiersList);
        for (const classifier of Object.values(def.classifiers)) {
            const classifierListElem = document.createElement("li");
            if (classifier.simplified != undefined) {
                classifierListElem.innerText = classifier.simplified + " (" + classifier.pinyin + ")";
                classifiersList.appendChild(classifierListElem);
            }
        }
    }

    info.style.display = "";
}

function getCurrentLang() {
    return document.getElementById("langSwitch").innerText;
}

function abbrevLang(language) {
    if (language == "Chinese") {
        return "zh";
    } else {
        return "en";
    }
}

async function toggleLang() {
    const button = document.getElementById("langSwitch");
    const userBox = document.getElementById("userBox");
    if (getCurrentLang() == "Chinese") {
        button.innerText = "English";
        userBox.placeholder = "Enter Chinese here";
    } else {
        button.innerText = "Chinese";
        userBox.placeholder = "Enter English here";
    }
}
