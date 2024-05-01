// ==UserScript==
// @name         FB Scraper
// @namespace    https://github.com/bobclause/DigitalTools/blob/main/FBScraper.user.js
// @version      0.1
// @description  Scrapes information from Facebook pages and exports to .xlsx using sheetjs
// @match        https://www.facebook.com/*
// @icon         https://d3hjzzsa8cr26l.cloudfront.net/bdaa81b2-e0fb-11e6-9e79-73c7d73e30ad.jpg?pw=264
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @require      https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js
// ==/UserScript==


(function() {
let FBSstyles = document.createElement("style")
FBSstyles.id = "FBSstyles"
FBSstyles.type = "text/css"
FBSstyles.innerHTML = `
.tooltiptext{
  visibility: hidden;
  width: 120px;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;

  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
}
.tooltip:hover .tooltiptext{
  visibility: visible;
}
`

let FBScraperIncludeTerms = ""
let FBScraperExcludeTerms = ""
let FBScraperOptions = ""
let loading = false;
async function loadValues(){
    FBScraperIncludeTerms = await GM.getValue("FBScraperIncludeTerms", "")
    FBScraperExcludeTerms = await GM.getValue("FBScraperExcludeTerms", "")
    //first bit is bool include mutuals. second bit is bool exclude terms. next two bits are stateSelect index
    //0=false 1=true
    FBScraperOptions = await GM.getValue("FBScraperOptions", "0000")
}

function getDir(){
    exportOptions.id = "exportOptions"
    exportOptions.style = "color:#fff;background:#242526;font-size:small;display:flex;min-width:150px;"
    exportOptions.innerHTML = `
    <p><input type="text" value="File Name" size="15" id="fileNameText"><span class="tooltip"><input type="button" id="saveFile" value="Save File"><span class="tooltiptext" style="position:relative;top:-100px;left:150px;display:block">click to save. default file name is <br>"[search term][mo-day-hour.min].xlsx"<br>Can be changed in the provided text field.</span></span><br></p>
    <p>.XLSX</p>
    `
    menuFooter.append(exportOptions)
    let defaultName = document.querySelector('div.html-div.xe8uvvx.xdj266r.x11i5rnm.x1mh8g0r.xexx8yu.x18d9i69.x6s0dn4.x9f619.x78zum5.x1s65kcs.x1wsgfga.x1pi30zi.x1swvt13 > div > div > label > input').value
    const date = new Date();
    document.getElementById("fileNameText").value = defaultName + (date.getMonth() +1) + "-" + date.getDate() + "-" + date.getHours() + "." + date.getMinutes()
    document.getElementById("saveFile").addEventListener("click", (e) => {
          var wb = XLSX.utils.table_to_book(document.getElementById("resultsTable"));
          XLSX.writeFile(wb, document.getElementById("fileNameText").value + ".xlsx");
    })
}

loadValues()

'use strict';
let FBS_currentEdit = ""
let tags = ["✔️",'<font color="gold">367</font>',"SFWY","FM","STAFF","HAGGEN",'<img src="https://scontent-sea1-1.xx.fbcdn.net/v/t39.30808-6/310973217_201122492315939_1635682781250436343_n.jpg?stp=c14.0.64.64a_cp0_dst-jpg_p64x64&_nc_cat=102&ccb=1-7&_nc_sid=70495d&_nc_ohc=AJBoLyUwAw8AX-2qNAP&_nc_ht=scontent-sea1-1.xx&oh=00_AT-3Fv8OXy444DsZrcdXD9FtPhYVx818MEfBKQrljrFTYA&oe=635649BE">'];
let expanded = false;
let FBS_friends = GM_getValue("https://www.facebook.com/colton.rose1/friends");
let searching = false;
let targetNode = "";
let url = ""
let oldURL = ""

    // Your code here...
let groupMemberLoader = "/html/body/div[1]/div/div[1]/div/div[3]/div/div/div/div[1]/div[1]/div[2]/div/div/div[4]/div/div/div/div/div/div/div/div/div/div/div[3]/div/div/div[2]";
let groupMemberList = "/html/body/div[1]/div/div[1]/div/div[3]/div/div/div/div[1]/div[1]/div[2]/div/div/div[4]/div/div/div/div/div/div/div/div/div/div/div[3]/div/div/div[1]/div/div[";
let friendsListNode = document.getElementsByClassName("x78zum5 x1q0g3np x1a02dak x1qughib")[0];
let searchListNode = document.getElementsByClassName("x193iq5w x1xwk8fm")[0];
let updatedDivs = 0
const observer = new MutationObserver(loadSearch);
const pageChangeObserver = new MutationObserver(pageChange)
let loaded = false



function pageChange(){
    if (window.location.href != url){
        url = window.location.href
    if (window.location.href.contains("/search/people")){
        if (url.includes("/search/")){
        menuContents.innerHTML = `<span class="tooltip"><a id="loadSearch" class="tooltip">Load Results</a>
                                   <span class="tooltiptext">Click here to auto-scroll to buttom of page to load more. click again to disable the auto-scroll</span></span>
                                   <br><span class="tooltip"><a id="getSearch">Get Results</a><span class="tooltiptext">Click to generate a table of results. If you want filtered results you must first click the "filter" button.</span></span>
                                   <br><button type="button" id="filterSearch">Filter</button>`;
        FbScraperMenu.id = "FbScraperMenu";
        //FbScraperMenu.style="position:fixed; top:100px; left:0px; background-color:skyblue; max-height:60%; width:155px;";

        document.getElementById("getSearch").addEventListener('click', getSearch);
        document.getElementById("filterSearch").addEventListener('click', searchMenu);
             document.getElementById("loadSearch").addEventListener('click', (e) => {
                     if(!loading){
        document.getElementById("loadSearch").innerHTML = "Stop Loading"
        loading = !loading
    }
    else{
        document.getElementById("loadSearch").innerHTML = "Load Results"
        loading = !loading
    }
            if (searching == false){
                searching = true;
                loadSearch();
            }
            else{
                searching = false;

                observer.disconnect();
            }
        });
    }
        }
    else if (url.includes("/members")){
        menuContents.innerHTML = `<a id=loadSearch>Load Members</a>
        <br><a id=getSearch>Get Members</a>
        <br><button type="button" id="filterSearch">Filter</button>`
    }
    else if (url.includes("/friends") || url.includes("=friends")) {
        menuContents.innerHTML = `<a id=loadMembers>Load Members</a>
        <br><a id=getMembers>Get Members</a><br>
        <a id=getFriends>Get Friends</a>`
    document.getElementById("loadMembers").addEventListener('click', loadSearch);
    document.getElementById("getMembers").addEventListener('click', getMembers);
    document.getElementById("getFriends").addEventListener('click', getFriends);
    }
    else {menuContents.innerHTML = ""}
    }

}

function test () {
    alert("successful")
};

function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
};

function loadMembers() {
    alert(getElementByXpath(groupMemberLoader).innerHTML);
    getElementByXpath(groupMemberLoader).style = "position:fixed; left:100px; top:170px;";
};

function getMembers() {
    let memberList = "";
    alert(getElementByXpath(groupMemberList).childElementCount);
    for (let i = 1; i <= getElementByXpath(groupMemberList).childElementCount; i++) {
       memberList += getElementByXpath(groupMemberList + i + "]/div/div/div[2]/div/div/div/div[1]/span/div/div[1]/span/div/div[1]/span/span").innerHTML + "<br>";
    };
	FbScraperResults.innerHTML = memberList;
};

function loadSearch(){
    if (loaded == false){
        if (url.contains("/friends")){
            targetNode = document.getElementsByClassName("x78zum5 x1q0g3np x1a02dak x1qughib")[14];
        }
        else if (url.contains("/search/")){
            targetNode = document.getElementsByClassName("x193iq5w x1xwk8fm")[0];
            if (targetNode.lastChild.textContent == "End of results"){
                observer.disconnect()
                loaded = true
            }
        }
        else if (url.contains("/members")){
            targetNode = document.getElementsByClassName("html-div xe8uvvx x11i5rnm x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x1oo3vh0 x1rdy4ex")[5]
        }
    const config = { attributes: true, childList: true, subtree: false };


    observer.observe(targetNode, config);
        loaded = true;
    }
    else{
        loaded = false;
    }


        window.scrollTo({left:0, top:targetNode.scrollHeight, behavior:"smooth"})
};

function getFriends() {
    let friendList ="";
    let FBS_friends = [];
    for (let i = 1 ; i <= friendsListNode.childElementCount; i++) {
        try {
        friendList += getElementByXpath("/html/body/div[1]/div/div[1]/div/div[3]/div/div/div/div[1]/div[1]/div/div/div[4]/div/div/div/div/div/div/div/div/div[3]/div[" + i + "]/div[2]/div[1]").innerHTML + "<br>";
        //FBS_friends.push(getElementByXpath("/html/body/div[1]/div/div[1]/div/div[3]/div/div/div/div[1]/div[1]/div/div/div[4]/div/div/div/div/div/div/div/div/div[3]/div[" + i + "]/div[2]/div[1]/a").getAttribute("href"));
        //GM_setValue(string(window.location.href,)
	}
        catch{continue};
    };
    FbScraperResults.innerHTML = friendList;

        GM_setValue(window.location.href, FBS_friends);
        alert(friendsListNode.childElementCount);
};

function loadTags(){
       //creates tags
        let FBSAlters = document.querySelectorAll('[class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x9f619 x1ypdohk xt0psk2 xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz x1heor9g xt0b8zv"]');
        for (let i = 0 ; i <= FBSAlters.length; i++) {

            let FBSTags = document.createElement("div");
            FBSTags.id = "FBSTags" + i;
            if(!(FBSAlters[i].parentNode.parentNode.innerHTML.includes("FBSTags"))){
            FBSAlters[i].parentNode.parentNode.appendChild(FBSTags)}

            //Load tags from userToAnalyze
            let FBS_userToAnalyze = FBSAlters[i].getAttribute('href')
                //load users tags from GM
                let FBS_usersTags = []
                FBS_usersTags = GM_getValue(FBS_userToAnalyze)
                if(FBS_usersTags === undefined){
                    FBS_usersTags = []
                    GM.setValue(FBS_userToAnalyze, FBS_usersTags)
                }
                for (const item of FBS_usersTags){
                    if (!(FBSAlters[i].parentNode.parentNode.innerHTML.includes(item))){
                    document.getElementById("FBSTags" + i).insertAdjacentHTML('beforeend', item)
                        try{document.getElementsById("FBS_Tags" + 1).addEventListener('click', function(){})
                           }
                        catch{continue}
                }}

            if (!(document.getElementById("FBSTags" + i).innerHTML.includes('<font color="gold">test</font>'))){
            document.getElementById("FBSTags" + i).insertAdjacentHTML('afterBegin', '<a class=FBSTags><font color="gold">test</font></a>');}
            document.getElementsByClassName("FBSTags")[i].addEventListener('click', function(e){

    FBS_tagsMenu.id = "FBS_tagsMenu"
    FBS_tagsMenu.innerHTML = `
    <div style="background-color:lightgrey"><a id="newTag">New Tag</a>
    </div>
    `

//creates tags menu
                this.parentNode.appendChild(FBS_tagsMenu)
                    document.getElementById("FBS_tagsMenu").style = "position:absolute;"
                for (const items of tags){
        if(!(this.parentNode.innerHTML.includes("FBS_Tags" + tags.indexOf(items)))){
        FBS_tagsMenu.insertAdjacentHTML('beforeend', "<div style='background-color:grey'><a id=FBS_Tags" + tags.indexOf(items) + ">" + items + "</a></div>")
           }



    }
                //Creates tagMenu links and listener events
                let tagsCount = document.getElementById("FBS_tagsMenu").querySelectorAll("a");
                for (const each in tagsCount){
                    try{
                    tagsCount[each].addEventListener('click', function(){
                        //moves tags from menu to user
                    let newElem = this
                    this.parentNode.parentNode.insertAdjacentHTML('beforebegin', this.outerHTML)
                        FBS_usersTags.push(this.outerHTML)
                        GM.setValue(FBS_userToAnalyze, FBS_usersTags)
                        this.remove()
                    })
                    }
                    catch{continue}
                }
            }

                                                                          );

            updatedDivs = i;
        }
    }

function getSearch() {
  const searchContainer = document.getElementsByClassName("x193iq5w x1xwk8fm")[0];
  const searchElements = searchContainer.children;
  let excludeTerms = FBScraperExcludeTerms.toLowerCase().split(/<[\/]?dt*>/g)
  const includeTerms = FBScraperIncludeTerms.toLowerCase().split(/<[\/]?dt*>/i)

  // Get exclude terms from "excludeTerms" div (lowercase) and add "worked" and "former" if checked
try{
    if(parseInt(FBScraperOptions.substr(1,1))){
       excludeTerms.push("worked")
        excludeTerms.push("former")
   }
}
    catch{}
  // Get include terms from "includeTerms" div (lowercase)
  try{
    if (document.getElementById("stateSelect").value != "null"){
        includeTerms.push(document.getElementById("stateSelect").options[document.getElementById("stateSelect").selectedIndex].text.toLowerCase())
    }
  }
    catch{}

  let filteredResults = ""; // String to store filtered element HTML

  for (let i = 0; i < searchElements.length - 1; i++) {
    let excludeFound = false;
    let includeFound = false;
    let mutuals = false;

    const searchText = searchElements[i].textContent.toLowerCase();

    // Check for exclude terms
    for (let term of excludeTerms) {
        if (parseInt(FBScraperOptions.substr(0,1)) && searchText.includes("mutual friend")){
            mutuals = true;
            excludeFound = false;
        }
      else if (!mutuals && term.length > 0 && searchText.includes(term)) {
        excludeFound = true;
        break;
      }
    }
      //check for include terms
    for (let term of includeTerms) {
      if (term.length > 0 && searchText.includes(term)) {
        includeFound = true;
        break;
      }
    }

    // Show element if not excluded and include terms is empty OR element text includes an include term
    if ((!excludeFound && (includeTerms.length === 1 || includeFound)) || mutuals) {
        let textContent = []
        searchElements[i].hidden = false;
      filteredResults += "<tr><td>" + searchElements[i].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[1].children[0].children[0].children[0].children[0].children[0].children[0].innerHTML + "</td>";
        try{textContent = searchElements[i].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].children[1].children[0].children[0].children[0].children[1].textContent.split("·")}
        catch{textContent = []}
        filteredResults += "<td>" + textContent.filter((word) => word.includes(" at ")) + "</td>"
        filteredResults += "<td>" + textContent.filter((word) => word.includes("Lives in")) + "</td></tr>"
    } else {
      includeFound = false; // Reset includeFound for next iteration
        mutuals = false;
        searchElements[i].hidden = true;
    }
      mutuals = false;
      includeFound = false;
      excludeFound = false;
  }

  const resultsElement = document.getElementById("FbscraperResults");
  resultsElement.innerHTML = `<table id='resultsTable' border='1'>
                                  <tr><th colspan="3">` + document.querySelector('div.html-div.xe8uvvx.xdj266r.x11i5rnm.x1mh8g0r.xexx8yu.x18d9i69.x6s0dn4.x9f619.x78zum5.x1s65kcs.x1wsgfga.x1pi30zi.x1swvt13 > div > div > label > input').value.toUpperCase() + `</th></tr>
                                  <tr><th>Name</th><th>Position</th><th>Location</th></tr>` + filteredResults + `</table>`;
  if (menuFooter.parentNode === null){
      menuContents.appendChild(resultsExpand)
      menuFooter.id = "menuFooter"
      menuFooter.class = "FBSMenuContainer"
      menuFooter.style = "max-width:100px;background-color:black;"
      FbScraperMenu.appendChild(menuFooter)
  copyButton.type = "button"
    copyButton.value = "Select"
      copyButton.id = "copyButton"
  menuFooter.appendChild(copyButton)
    copyButton.addEventListener("click", copyResults)
      clearButton.type = "button"
      clearButton.value = "Clear"
      clearButton.id = "clearButton"
      menuFooter.appendChild(clearButton)
      clearButton.addEventListener("click", clearResults)
      exportButton.type = "button"
      exportButton.value = "Export"
      exportButton.id = "exportButton"
      menuFooter.appendChild(exportButton)
      exportButton.addEventListener("click", (e) => {
          getDir()
          //var wb = XLSX.utils.table_to_book(document.getElementById("resultsTable"));
          //XLSX.writeFile(wb, "SheetJSTable.xlsx");
      })
  }

    copyButton.hidden = false
    clearButton.hidden = false
    exportButton.hidden = false

  if (resultsElement.offsetHeight <= 0) {
    expandResults();
  }
}

function animate(){
    if (expanded == false){
      let timer = setInterval(function() {
        FbScraperMenu.style.left = FbScraperMenu.getBoundingClientRect().left + 3 + 'px';
        if (FbScraperMenu.getBoundingClientRect().left >= 0) clearInterval(timer);
      }, 1);
    expanded = true
    menuExpand.innerHTML = "<<"
        if (FbScraperResults.clientHeight <= 10 && FbScraperResults.innerHTML != ""){expandResults()}
    }
    else{
      let timer = setInterval(function() {
        FbScraperMenu.style.left = FbScraperMenu.getBoundingClientRect().left - 3 + 'px';
        if (FbScraperMenu.getBoundingClientRect().left <= (menuContents.clientWidth) * -1) clearInterval(timer);
          if (FbScraperMenu.getBoundingClientRect().left <= 3) {FbScraperMenu.style.left = menuContents.clientWidht * -1 + "px"}
      }, 1);
    expanded = false
    menuExpand.innerHTML = ">>"}
        if (FbScraperResults.clientHeight >= 10){expandResults()}
}

function expandResults(){
    let i = 0;
    if (FbScraperResults.offsetHeight <=87){
        menuFooter.hidden = false
    let timer = setInterval(function() {
        FbScraperResults.style.maxHeight = FbScraperResults.offsetHeight + 10 + 'px';
        FbScraperResults.style.maxWidth = FbScraperResults.offsetWidth + 10 + 'px';
        i++
        if (FbScraperResults.offsetHeight >= 500 || i > 170) clearInterval(timer);
      }, 1);
    resultsExpand.innerHTML = "<<"}
    else{
        menuFooter.hidden = true
      let timer = setInterval(function() {
          i++
        FbScraperResults.style.maxHeight = FbScraperResults.offsetHeight - 10 + 'px';
          FbScraperResults.style.maxWidth = FbScraperResults.offsetWidth - 10 + 'px';
        if (FbScraperResults.offsetHeight <= 0 || i > 170) clearInterval(timer);
          if (FbScraperResults.offsetHeight <= 10){FbScraperResults.style.maxHeight = "0px";
    resultsExpand.innerHTML = ">>"}
      }, 1);
    }
}

function searchMenu(){

    if (filterMenu.innerHTML == ""){
        filterMenu.innerHTML = `
        <div id="filterMenuTop" class="FBSmenuText" style="width: 100%; display:flex;">
    <div id="filterMenuLeft" style="float:left;width:50%">
      <span class="tooltip"><input type="checkbox" id="includeMutuals" checked="true">Include Mutuals
      <span class="tooltiptext">If checked anyone with mutual friends will be included in the results regardless of any other filters. Overrides all includes and excludes.</span></span><br>
      <span class="tooltip">
      <select id="stateSelect">
      <option value="null">-Select State-</option>
	<option value="AL">Alabama</option>
	<option value="AK">Alaska</option>
	<option value="AZ">Arizona</option>
	<option value="AR">Arkansas</option>
	<option value="CA">California</option>
	<option value="CO">Colorado</option>
	<option value="CT">Connecticut</option>
	<option value="DE">Delaware</option>
	<option value="DC">District Of Columbia</option>
	<option value="FL">Florida</option>
	<option value="GA">Georgia</option>
	<option value="HI">Hawaii</option>
	<option value="ID">Idaho</option>
	<option value="IL">Illinois</option>
	<option value="IN">Indiana</option>
	<option value="IA">Iowa</option>
	<option value="KS">Kansas</option>
	<option value="KY">Kentucky</option>
	<option value="LA">Louisiana</option>
	<option value="ME">Maine</option>
	<option value="MD">Maryland</option>
	<option value="MA">Massachusetts</option>
	<option value="MI">Michigan</option>
	<option value="MN">Minnesota</option>
	<option value="MS">Mississippi</option>
	<option value="MO">Missouri</option>
	<option value="MT">Montana</option>
	<option value="NE">Nebraska</option>
	<option value="NV">Nevada</option>
	<option value="NH">New Hampshire</option>
	<option value="NJ">New Jersey</option>
	<option value="NM">New Mexico</option>
	<option value="NY">New York</option>
	<option value="NC">North Carolina</option>
	<option value="ND">North Dakota</option>
	<option value="OH">Ohio</option>
	<option value="OK">Oklahoma</option>
	<option value="OR">Oregon</option>
	<option value="PA">Pennsylvania</option>
	<option value="RI">Rhode Island</option>
	<option value="SC">South Carolina</option>
	<option value="SD">South Dakota</option>
	<option value="TN">Tennessee</option>
	<option value="TX">Texas</option>
	<option value="UT">Utah</option>
	<option value="VT">Vermont</option>
	<option value="VA">Virginia</option>
	<option value="WA">Washington</option>
	<option value="WV">West Virginia</option>
	<option value="WI">Wisconsin</option>
	<option value="WY">Wyoming</option>
</select>
<span class="tooltiptext">If a state is selected all results that don't include that state will be excluded. Otherwise a state is not checked for.</span>
</span>
<span class="tooltip">
      <input type="text" id="includeText" value="include terms"><br>
      <span class="tooltiptext">results will be included if no exclude term is found and at least one include term is found.</span></span>
    </div>
    <div id="filterMenuRight" style="float:right;width:50%">
      <span class="tooltip"><input type="checkbox" id="excludeFormer" checked="true">exclude "former" and "worked"
      <span class="tooltiptext">If checked any instances of the words "former" or "worked" will be excluded from the results.</span></span><br>
      <span class="tooltip"><input type="text" id="excludeText" value="exclude terms"><span class="tooltiptext">if an exclude term is found then the result will be excluded. Overrides include terms.</span></span><br>
    </div>
  </div>
  <div id="filterMenuMain" style="display:flex;">
  <div id="includeTerms" style="background-color:gray; width:42%; float:left; height:100%; margin-left:1%; box-sizing: border-box;overflow:scroll;"></div>
  <div id="centerButtons" style="display: flex;flex-direction: column;justify-content: center;align-items: center;margin: 10px 0;">
  <button id="moveToExclude" style="margin: 5px;">>></button>
    <button id="moveToInclude" style="margin: 5px;"><<</button>
      <button id="buttonDelete">🗑️</button>
  </div>
  <div id="excludeTerms" style="background-color:gray; width:42%; float:right; height:100%; margin-right:1%; box-sizing: border-box;overflow:scroll;"></div><br>
  </div>
  <input type="button" id="filterSave" value="Save Filter Options">
        `
        document.getElementById("includeMutuals").checked = parseInt(FBScraperOptions.substr(0,1))
        document.getElementById("excludeFormer").checked = parseInt(FBScraperOptions.substr(1,1))
        document.getElementById("includeTerms").innerHTML = FBScraperIncludeTerms.replace('[object Promise]', '')
        document.getElementById("excludeTerms").innerHTML = FBScraperExcludeTerms.replace('[object Promise]', '')
        document.getElementById("stateSelect").selectedIndex = parseInt(FBScraperOptions.substr(2,4))
        document.getElementById("filterMenuTop").addEventListener("click", (e) =>{
            let FBSoptions = (document.getElementById("includeMutuals").checked ? "1":"0") + (document.getElementById("excludeFormer").checked ? "1":"0")
            if(document.getElementById("stateSelect").selectedIndex < 10){FBSoptions += "0"}
            FBSoptions += document.getElementById("stateSelect").selectedIndex
            FBScraperOptions = FBSoptions
            GM.setValue("FBScraperOptions", FBSoptions)
        })
        document.getElementById("includeText").addEventListener("keyup", (e) => {
            if (e.keyCode === 13 & document.getElementById("includeText").value !== ""){
                document.getElementById("includeTerms").innerHTML += "<dt>" + document.getElementById("includeText").value + "</dt>";
                document.getElementById("includeText").value = "";
                FBScraperIncludeTerms = document.getElementById("includeTerms").innerHTML
                GM.setValue("FBScraperIncludeTerms", document.getElementById("includeTerms").innerHTML)
            }
        })
        document.getElementById("excludeText").addEventListener("keyup", (e) => {
            if (e.keyCode === 13 & document.getElementById("excludeText").value !== ""){
                document.getElementById("excludeTerms").innerHTML += "<dt>" + document.getElementById("excludeText").value + "</dt>";
                document.getElementById("excludeText").value = "";
                FBScraperExcludeTerms = document.getElementById("excludeTerms").innerHTML
                GM.setValue("FBScraperExcludeTerms", document.getElementById("excludeTerms").innerHTML)
            }
        })
        document.getElementById("filterMenuMain").addEventListener('click', (e) => {
            //highlight search terms
            if(e.srcElement.nodeName == "DT"){
                if (e.srcElement.style.backgroundColor != "black"){
                     e.srcElement.style.backgroundColor = "black"
                }
                else{e.srcElement.style.backgroundColor = ""
                    }
            }
            if (e.srcElement.id == "buttonDelete"){
                  const includeTerms = document.getElementById("includeTerms");
  const excludeTerms = document.getElementById("excludeTerms");

  // Remove black terms from includeTerms
  const includeTermsChildren = includeTerms.children;
  for (let i = includeTermsChildren.length - 1; i >= 0; i--) {
    if (includeTermsChildren[i].style.backgroundColor === "black") {
      includeTerms.removeChild(includeTermsChildren[i]);
    }
  }

  // Remove black terms from excludeTerms
  const excludeTermsChildren = excludeTerms.children;
  for (let i = excludeTermsChildren.length - 1; i >= 0; i--) {
    if (excludeTermsChildren[i].style.backgroundColor === "black") {
      excludeTerms.removeChild(excludeTermsChildren[i]);
    }
  }
            FBScraperIncludeTerms = document.getElementById("includeTerms").innerHTML
            FBScraperExcludeTerms = document.getElementById("excludeTerms").innerHTML
            }
            else if( e.srcElement.id == "moveToExclude"){
              const includeTerms = document.getElementById("includeTerms");
  const excludeTerms = document.getElementById("excludeTerms");

  const includeTermsChildren = includeTerms.children;
  for (let i = includeTermsChildren.length - 1; i >= 0; i--) {
    const term = includeTermsChildren[i];
    if (term.style.backgroundColor === "black") {
        term.style.backgroundColor = ""
      excludeTerms.appendChild(term); // Move term to excludeTerms
    }
  }
            FBScraperIncludeTerms = document.getElementById("includeTerms").innerHTML
            FBScraperExcludeTerms = document.getElementById("excludeTerms").innerHTML
            }
            else if( e.srcElement.id == "moveToInclude"){
              const excludeTerms = document.getElementById("excludeTerms");
  const includeTerms = document.getElementById("includeTerms");

  const excludeTermsChildren = excludeTerms.children;
  for (let i = excludeTermsChildren.length - 1; i >= 0; i--) {
    const term = excludeTermsChildren[i];
    if (term.style.backgroundColor === "black") {
        term.style.backgroundColor = ""
      includeTerms.appendChild(term); // Move term to excludeTerms
    }
  }
            FBScraperIncludeTerms = document.getElementById("includeTerms").innerHTML
            FBScraperExcludeTerms = document.getElementById("excludeTerms").innerHTML
            }
            GM.setValue("FBScraperIncludeTerms", document.getElementById("includeTerms").innerHTML)
            GM.setValue("FBScraperExcludeTerms", document.getElementById("excludeTerms").innerHTML)
        })
        filterMenu.hidden = false;
        document.getElementById("filterSave").addEventListener("click", () =>{
            filterMenu.hidden = true
            GM.setValue("FBScraperIncludeTerms", document.getElementById("includeTerms").innerHTML)
            GM.setValue("FBScraperexcludeTerms", document.getElementById("excludeTerms").innerHTML)
        })
    }
    else{filterMenu.hidden = false}
    setTermDivHeights()
}

function setTermDivHeights() {
  const parentDiv = document.getElementById("filterMenu");
  const termDivs = parentDiv.querySelectorAll("#includeTerms, #excludeTerms");

  if (parentDiv && termDivs.length > 0) {
    let availableHeight = parentDiv.offsetHeight;
    const topDiv = document.getElementById("filterMenuTop"); // Get reference to filterMenuTop

    if (topDiv) {
      availableHeight -= topDiv.offsetHeight; // Subtract height of filterMenuTop
    }

    const adjustedHeight = availableHeight - 30; // Adjust for margins or paddings

    termDivs.forEach(termDiv => {
      termDiv.style.height = `${adjustedHeight}px`;
    });
  }
}

function copyResults() {
    window.getSelection().selectAllChildren(document.getElementById("FbscraperResults"))
}

function clearResults(){
    FbScraperResults.innerHTML = ""
    FbScraperResults.style.maxHeight="0px"
    clearButton.hidden = true
    copyButton.hidden = true
    exportButton.hidden = true
}

// Call the function on page load
window.addEventListener("load", setTermDivHeights);

// Optionally, call the function again on window resize
window.addEventListener("resize", setTermDivHeights);

        document.head.appendChild(FBSstyles)
    let FbScraperMenu = document.createElement("div");
        FbScraperMenu.id = "FbScraperMenu"
    let menuContents = document.createElement("div");
        menuContents.id = "menuContents"
        menuContents.style= "background-color:#121213; max-height:60%;min-height:30px;max-width:100px;";
    let menuExpand = document.createElement("div");
        menuExpand.id = "menuExpand"
        menuExpand.innerHTML = ">>"
    let resultsExpand = document.createElement("a")
        resultsExpand.id - "resultsExpand"
        resultsExpand.style = "font-family:cursive;font-size:large;writing-mode:vertical-rl;Float:right;"
        resultsExpand.innerHTML = ">>"
    let filterMenu = document.createElement("div")
        filterMenu.id = "filterMenu"
        filterMenu.style = "width:50%;max-width:500px;height:50%;max-height:50%;background-color:black;position:fixed;margin:auto;top:0px;bottom:0px;left:0px;right:0px;color:white;"
        filterMenu.hidden = true;
    document.body.appendChild(FbScraperMenu);
    FbScraperMenu.appendChild(menuExpand)
    FbScraperMenu.appendChild(menuContents)

  

  const menuFooter = document.createElement("div")
  const copyButton = document.createElement("input")
  const clearButton = document.createElement("input")
  const exportButton = document.createElement("input")
  const exportOptions = document.createElement("span")
let FbScraperResults = document.createElement("div");
	FbScraperResults.id = "FbscraperResults";
	FbScraperResults.style = "position:relative; background-color:grey; max-width:98%; max-height:0px; overflow:auto;max-width:100px;";
FbScraperMenu.appendChild(FbScraperResults);

let FBS_tagsMenu = document.createElement("div")
FbScraperMenu.style="position:fixed; top:100px; left:-100px;display:table;width:100px;";
menuExpand.style = "border-color:#ffffff40;border-style:solid;border-left-width:0px;font-family:cursive;font-size:large;background-color:black; display:inline; position:relative;left:" + (menuContents.clientWidth) + "px;color:#bcc7d5;opacity:50%;border-top-right-radius:10px;border-bottom-right-radius:10px;";
menuExpand.style.top = menuExpand.offsetHeight - 2 + "px"
    //document.getElementById("loadMembers").addEventListener('click', loadSearch);
    //document.getElementById("getMembers").addEventListener('click', getMembers);
    //alert("test")
    //document.getElementById("getFriends").addEventListener('click', getFriends);
menuExpand.addEventListener('click', animate)
resultsExpand.addEventListener('click', expandResults)
    document.body.appendChild(filterMenu)

    const pageChangeConfig = { attributes: true, childList: true, subtree: true};

    pageChangeObserver.observe(document.body, pageChangeConfig)




})




();
