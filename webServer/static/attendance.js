doc = document;
studentPageDiv = doc.getElementById('students');

class Student{
  constructor({name="", classTime=[]} = {}){
    this.name = name;
    this.classTime = classTime;
  }
}

class confirmWindow{
  constructor({parentDivId="students", divId='confirmWindow', ws=undefined} = {}){

    this.parentDivId = parentDivId;
    this.divId = divId;
    this.ws = ws;
    this.iPads = iPads;

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
  }

  makeOptions(t){
    let optionsDiv = doc.createElement("div");
    optionsDiv.classList.add("student_opts");

    //sign in
    this.makeSignInButton(optionsDiv, t, "Sign In");
    this.makeSignInButton(optionsDiv, t, "Sign Out");

    //checkout
    this.makeCheckoutButton(optionsDiv, t, 'iPad', "Check Out");
    this.makeCheckoutButton(optionsDiv, t, 'iPad', "Check In");

    this.div.appendChild(optionsDiv);
  }

  makeSignInButton(div, t, action="Sign In"){
    let signInButton = getButton(action, t.time);
    if (action == 'Sign Out'){
      signInButton.style.gridColumn = 2;
      signInButton.style.gridRow = 2;
    }
    else if (action == 'Sign In'){
      signInButton.style.gridColumn = 2;
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

  makeCheckoutButton(div, t, item="iPad", action="Check Out"){
    this.button[item] = getCheckoutButton(action, item);

    if (action == 'Check Out'){
      this.button[item].style.gridColumn = 3;
      this.button[item].style.gridRow = 1;
    }
    else if (action == 'Check In'){
      this.button[item].style.gridColumn = 3;
      this.button[item].style.gridRow = 2;
    }

    div.appendChild(this.button[item]);


    this.button[item].addEventListener("click", () => {

      if (item == 'iPad'){
        var inventory = iPads; //from iPads.js
      }

      let inventoryWindow = new checkoutControl({
        parentDiv: this.parentDiv,
        itemName: item,
        items: inventory,
        ws: this.ws,
        student: this.student,
        action: action
      });

    })
  }

}

class checkoutControl{
  constructor({
                itemName = "iPad",
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
  }
}
class cancelButton{
  constructor(parentDiv){
    this.parentDiv = parentDiv;
    this.button = doc.createElement("input");
    this.button.setAttribute("type", "button");
    this.button.setAttribute("value", "Close");
    this.button.classList.add('closeButton');

    this.parentDiv.appendChild(this.button);

    this.button.addEventListener('click', () => {
      this.parentDiv.remove();

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

function getTime(){
  //time
  let t = new Date();
  let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  let dt = {
    dateObject: t,
    date: t.toLocaleDateString('en-US', options),
    time: t.toLocaleTimeString()
  };

  return dt;

}

// confWin = new confirmWindow();

//Load student data
students = roll;
// for (let i=0; i<roll.length; i++){
//   students.push(new Student(roll[i]));
// }

function makeStudentPage(ws){
  //put students on page
  for (let i=0; i<students.length; i++){
    let div = doc.createElement('div');
    div.classList.add("student");
    div.setAttribute("id", `id_${students[i].id}`);

    let nameDiv = doc.createElement('div');
    nameDiv.classList.add("studentName");
    nameDiv.innerHTML = students[i].name;
    div.appendChild(nameDiv);

    let timeDiv = doc.createElement('div');
    timeDiv.classList.add("classTime");
    let txt = '';
    for (const dt of students[i].classTime) {
      txt += `${dt.day} ${dt.time}<br>`;
    }
    timeDiv.innerHTML = txt;
    div.appendChild(timeDiv);
    studentPageDiv.appendChild(div);

    //listener
    div.addEventListener("click", function(){
      confWin.makeWindow(students[i]);
    });
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
  }
}
