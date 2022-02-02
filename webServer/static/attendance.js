doc = document;
studentPageDiv = doc.getElementById('students');
openWindows = [];


class Student{
  constructor(student_info){
    this.info = student_info;
    //import all elements of info as properties
    Object.entries(student_info).forEach(([key, value]) => {
      this[key] = value;
    })
  }
  makeDiv(parentDiv){
    let div = doc.createElement('div');
    div.classList.add("student");
    div.setAttribute("id", `id_${this.id}`);

    div.style.backgroundColor = getStudentColorCode(this.grade);

    let nameDiv = doc.createElement('div');
    nameDiv.classList.add("studentName");
    nameDiv.innerHTML = this.name;
    div.appendChild(nameDiv);

    let timeDiv = doc.createElement('div');
    timeDiv.classList.add("classTime");
    let txt = '';
    for (const dt of this.classTime) {
      txt += `${dt.day} ${dt.time}<br>`;
    }
    timeDiv.innerHTML = txt;
    div.appendChild(timeDiv);
    parentDiv.appendChild(div);

    //listener
    div.addEventListener("click", () => {
      confWin.makeWindow(this);
    });
    this.div = div;
  }
  makeSelectOption(selDiv){
    let sel = doc.createElement('option');
    sel.value = this.id;
    sel.text = this.name;
    sel.style.backgroundColor = getStudentColorCode(this.grade);
    selDiv.add(sel);
  }
  outputTimes(loginTimes){

    loginTimes = JSON.parse(loginTimes);
    let loginTable = doc.createElement('table');

    //Make header
    let tHead = loginTable.createTHead();
    let row = tHead.insertRow();

    for (let key of Object.keys(loginTimes[0])){
      let th = doc.createElement('th');
      let txt = key == 'time' ? doc.createTextNode('Date') : doc.createTextNode(key);
      th.appendChild(txt);
      row.appendChild(th);
    }
    let th = doc.createElement('th');
    let txt = doc.createTextNode('Time');
    th.appendChild(txt);
    row.appendChild(th);

    //Table body
    let t;
    for (let element of loginTimes.reverse()){
      let row = loginTable.insertRow();

      for (let key in element){
        let cell = row.insertCell();
        let val;
        if (key == 'time'){
          t = getTime(element[key]);
          val = t.shortDate;
        }
        else {
          val = element[key]
        }
        let txt = doc.createTextNode(val);
        cell.appendChild(txt);
      }
      let cell = row.insertCell();
      let txt = doc.createTextNode(t.time);
      cell.appendChild(txt);
    }



    let outDiv = doc.getElementById("result");
    let h = doc.createElement('h3');
    h.innerHTML = "Login/Logout";
    outDiv.replaceChildren(h);
    outDiv.appendChild(loginTable);
  }
}

class confirmWindow{
  constructor({parentDivId="students", divId='confirmWindow', ws=undefined} = {}){

    this.parentDivId = parentDivId;
    this.divId = divId;
    this.ws = ws;
    this.iPads = iPads; //from iPads.js

    this.button = {};

    this.parentDiv = doc.getElementById(parentDivId);
  }

  makeWindow(student){
    this.student = student;

    this.div = doc.createElement("div");
    this.div.setAttribute("id", 'signIn');
    //this.div.classList.add('signIn');

    //this.makeCancelButton();
    this.cancelBut = new cancelButton(this.div);

    //put student name on page
    let nameTitle = doc.createElement('div');
    nameTitle.innerHTML = `<p>Hi<br><h1>${student.name}</h1>`;
    this.div.appendChild(nameTitle);

    // add time to page:
    let t = getTime();
    let tDiv = doc.createElement('div');
    tDiv.innerHTML = `${t.date} <br> ${t.time} `;
    this.div.appendChild(tDiv);

    this.makeOptions(t);

    this.parentDiv.appendChild(this.div);
    openWindows.push(this.div);
  }

  makeOptions(t){
    let optionsDiv = doc.createElement("div");
    optionsDiv.classList.add("student_opts");

    //sign in
    this.makeSignInButton(optionsDiv, t, "Sign In");
    this.makeSignInButton(optionsDiv, t, "Sign Out");

    //checkout buttons
    let i = 0;
    for (let item of Object.keys(inventory)){
      i += 1;
      this.makeCheckoutButton(optionsDiv, t, item, "Check Out", {row: 1, col:i});
      this.makeCheckoutButton(optionsDiv, t, item, "Check In", {row: 2, col:i});
    }

    //checkout iPads
    this.makeCheckoutButton(optionsDiv, t, 'iPads', "Check Out", {row: 1, col:1});
    this.makeCheckoutButton(optionsDiv, t, 'iPads', "Check In", {row: 2, col:1});

    this.makeCheckoutButton(optionsDiv, t, 'laptops', "Check Out", {row: 1, col:2});
    this.makeCheckoutButton(optionsDiv, t, 'laptops', "Check In", {row: 2, col:2});

    this.div.appendChild(optionsDiv);
  }

  makeSignInButton(div, t, action="Sign In"){
    let signInButton = getButton(action, t.time);
    if (action == 'Sign Out'){
      signInButton.style.gridColumn = 5;
      signInButton.style.gridRow = 2;
    }
    else if (action == 'Sign In'){
      signInButton.style.gridColumn = 5;
      signInButton.style.gridRow = 1;
    }
    div.appendChild(signInButton);
    signInButton.addEventListener("click", () => {
      //console.log("sign in", this);
      let msg = {
        what: "sign in",
        info: {
          name: this.student.name,
          id: this.student.id,
          action: action,
          time: t.dateObject.toJSON()
        }
      };
      this.ws.send(JSON.stringify(msg));
    })
  }

  makeCheckoutButton(div, t, item="iPads", action="Check Out", pos = {row:1, col:1}){
    this.button[item] = getCheckoutButton(action, item.slice(0,-1));

    this.button[item].style.gridColumn = pos.col;
    this.button[item].style.gridRow = pos.row;

    div.appendChild(this.button[item]);


    this.button[item].addEventListener("click", () => {

      // if (item == 'iPads'){
      //   var inventory = this.iPads;
      // }

      let inventoryWindow = new checkoutControl({
        parentDiv: this.parentDiv,
        itemName: item,
        items: inventory[item],
        ws: this.ws,
        student: this.student,
        action: action
      });

    })
  }

}

class checkoutControl{
  constructor({
                itemName = "iPads",
                items = iPads,
                parentDiv = undefined,
                ws = undefined,
                student = undefined,
                action = "Check Out"
              } = {}){

    this.ws = ws;
    this.itemName = itemName;
    this.items = items;
    this.parentDiv = parentDiv;
    this.student = student;
    this.action = action;

    this.makeWindow();
  }
  makeWindow(){
    this.window = doc.createElement('div');
    this.window.classList.add('inventoryWindow');
    this.cancelBut = new cancelButton(this.window);

    for (let i = 0; i < this.items.length; i++){
      this.items[i].button = getButton(this.items[i].name);
      //this.items[i].button = doc.createElement('div');
      this.items[i].button.classList.add('item');
      //this.items[i].button.innerHTML = this.items[i].name;
      this.window.append(this.items[i].button);

      this.items[i].button.addEventListener("click", () => {
        console.log( `${this.student.name} checking out ${this.items[i].name}`);
        let t = getTime();
        let msg = {
          what: "checkout",
          info: {
            action: this.action,
            itemType: this.itemName,
            name: this.student.name,
            id: this.student.id,
            item: this.items[i].name,
            time: t.dateObject.toJSON()
          }
        };
        this.ws.send(JSON.stringify(msg));
      });
    }

    this.parentDiv.appendChild(this.window);
    openWindows.push(this.window);
  }
}
class cancelButton{
  constructor(parentDiv = undefined){
    this.parentDiv = parentDiv;
    this.button = doc.createElement("input");
    this.button.setAttribute("type", "button");
    this.button.setAttribute("value", "Close");
    this.button.classList.add('closeButton');

    this.parentDiv.appendChild(this.button);

    this.button.addEventListener('click', () => {
      //this.parentDiv.remove();

      openWindows.forEach(div => div.remove());
      openWindows = [];

    })
    //return this.button;
  }
}


function getButton(title="Hello", info="-", className="bigButton"){
  let button = doc.createElement('div');
  button.classList.add(className);

  let titleDiv = doc.createElement('div');
  titleDiv.classList.add('bigButtonTitle');
  titleDiv.innerHTML = title;
  button.appendChild(titleDiv);

  let infoDiv = doc.createElement('div');
  infoDiv.classList.add("bigButtonInfo");
  infoDiv.innerHTML = info;
  button.appendChild(infoDiv);

  return button;

}

function getCheckoutButton(title="Hello", type='iPad', className='iPadButton'){
  let button = doc.createElement('div');

  button.classList.add(className);

  let titleDiv = doc.createElement('div');
  titleDiv.classList.add('bigButtonInfo');
  titleDiv.innerHTML = title;
  button.appendChild(titleDiv);

  let infoDiv = doc.createElement('div');
  infoDiv.classList.add("bigButtonTitle");
  infoDiv.innerHTML = type;
  button.appendChild(infoDiv);

  return button;

}

function getTime(setTime = undefined){
  //time
  let t = setTime === undefined ? new Date() : new Date(setTime);
  let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let shortDateOptions = { weekday: 'short', year: '2-digit', month: 'short', day: 'numeric'};
  let shortOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' , hour: '2-digit', minute: '2-digit'};

  let dt = {
    dateObject: t,
    date: t.toLocaleDateString('en-US', options),
    shortDate: t.toLocaleDateString('en-US', shortDateOptions),
    short: t.toLocaleString('en-US', shortOptions),
    time: t.toLocaleTimeString()
  };

  return dt;

}

function getStudentColorCode(grade){
  let bg;
  switch(parseInt(grade)){
    case 2021:
      bg = '#ffb795';
      break;
    case 2022:
      bg = '#ffec95';
      break;
    case 2023:
      bg = '#d695ff';
      break;
    case 2024:
      bg = '#95e6ff';
      break;
    default:
      bg = '#ffea95';
  }
  return bg;
}


//Load student data
//students = roll;


function makeStudentPage(ws){
  //put students on page
  for (let i=0; i<students.db.length; i++){
    let s = students.db[i];
    s.makeDiv(studentPageDiv);
  }

}

class messageWindow{
  constructor({
                parentDiv = doc.getElementById('students'),
                ws = undefined,
                msg = 'Hi!'
              } = {}){

    this.ws = ws;
    this.parentDiv = parentDiv;
    this.msg = msg;

    this.makeWindow();
  }
  makeWindow(){
    this.window = doc.createElement('div');
    this.window.classList.add('messageWindow');
    //this.window.innerHTML = this.msg;
    this.cancelBut = new cancelButton(this.window);

    let m = doc.createElement('div');
    m.classList.add('message');
    m.innerHTML = this.msg;
    this.window.appendChild(m);

    this.parentDiv.appendChild(this.window);
    openWindows.push(this.window);
  }
}

class studentDB{
  constructor(roll){
    this.roll = roll;
    this.db = [];
    for (let i=0; i<roll.length; i++){
      this.db.push( new Student(roll[i]) );
    }
    this.n = this.db.length;
  }
  getById(id){
    id = parseInt(id);
    for (let i=0; i<this.n; i++){
      if (this.db[i].id === id){
        return this.db[i];
      }
    }
    return undefined;
  }
}
students = new studentDB(roll);


//ADMIN STUFF

function studentPicker(ws){
  let queryDiv = doc.getElementById('query');
  let resultDiv = doc.getElementById('result');
  // //Title
  let studentSelDiv = doc.createElement("div");
  studentSelDiv.setAttribute('id', 'studentSelector');
  studentSelDiv.classList.add('queries');
  let title = doc.createElement('div');
  title.innerHTML = 'Students';
  studentSelDiv.appendChild(title);
  queryDiv.appendChild(studentSelDiv);

  //select box
  let selectBox = doc.createElement('select');
  selectBox.setAttribute('id', 'selectStudent');
  //default option:
  let defOpt = doc.createElement('option');
  defOpt.text = "Select Student";
  defOpt.value = '';
  selectBox.appendChild(defOpt);

  students.db.forEach(s => s.makeSelectOption(selectBox));

  studentSelDiv.appendChild(selectBox);

  selectBox.addEventListener('change', function() {
    let msg = {
      what: "selectStudent",
      studentId: this.value
    };
    ws.send(JSON.stringify(msg));
  })
}

function itemPicker(item, ws){
  let queryDiv = doc.getElementById('query');
  let resultDiv = doc.getElementById('result');
  // //Title
  let itemSelDiv = doc.createElement("div");
  itemSelDiv.setAttribute('id', 'itemSelector');
  itemSelDiv.classList.add('queries');
  let title = doc.createElement('div');
  title.innerHTML = item;
  itemSelDiv.appendChild(title);
  queryDiv.appendChild(itemSelDiv);

  //select box
  let selectBox = doc.createElement('select');
  selectBox.setAttribute('id', `select${item}`);
  //default option:
  let defOpt = doc.createElement('option');
  defOpt.text = "";
  defOpt.value = '';
  selectBox.appendChild(defOpt);

  students.db.forEach(s => s.makeSelectOption(selectBox));
  studentSelDiv.appendChild(selectBox);

  selectBox.addEventListener('change', function() {
    let msg = {
      what: "selectStudent",
      studentId: this.value
    };
    ws.send(JSON.stringify(msg));
  })
}
