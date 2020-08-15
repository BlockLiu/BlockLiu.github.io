var hours = 0;
var ms = 0;
var mins = 0;
var secs = 0;
var isCounting = false;
var timeoutId;
var isLocked = false;
var hasAnswer = false;
var hasConflict = Array();
var conflictCnt = 0;
var cells = new Array();
var answer = new Array();

function init(){
      for(var i = 0; i < 9; ++i){
            // cells[i] = new Array("", "", "", "", "", "", "", "", "");
            answer[i] = new Array("", "", "", "", "", "", "", "", "");
            hasConflict[i] = new Array(false, false, false, false, false, false, false, false, false);
      }
      cells[0] = new Array("", "7", "6", "", "", "", "1", "9", "3");
      cells[1] = new Array("", "1", "4", "", "7", "3", "", "", "");
      cells[2] = new Array("", "8", "", "", "1", "2", "", "7", "");
      cells[3] = new Array("", "", "3", "", "6", "9", "", "", "");
      cells[4] = new Array("1", "", "", "7", "4", "5", "", "3", "9");
      cells[5] = new Array("", "5", "9", "1", "", "8", "", "4", "");
      cells[6] = new Array("", "6", "2", "5", "", "1", "3", "", "7");
      cells[7] = new Array("", "", "1", "", "", "", "", "6", "");
      cells[8] = new Array("", "3", "7", "", "8", "", "", "", "");
      drawEmptyTable("divSudokuTable");
      createTimer("timer");
      drawControlPanel("divControlPanel");
}
function drawEmptyTable(tableDivName){
      var divTable = document.getElementById(tableDivName);
      var timerDiv = document.createElement("div");
      timerDiv.id = "timer";
      divTable.appendChild(timerDiv);

      var tableSudoku = document.createElement("table");
      for(var i = 0; i < 9; ++i)
      {
            var lRow = document.createElement("tr");
            for(var j = 0; j < 9; ++j)
            {     
                  var cell = document.createElement("td");
                  cell.width = "11%";
                  cell.id = "cell_" + i + "_" + j;
                  cell.classList.add("cell");                  
                  cell.contentEditable = "true";            
                  cell.innerHTML = cells[i][j];
                  cell.onkeydown = function(){
                        var x = event.which || event.keyCode;
                        if(x != 8 && (x < 49 || x > 57))    return false;//event.preventDefault();
                        if(x != 8 && this.innerHTML.length > 0) {
                              return false;
                        }
                        if(x == 8 && this.innerHTML != ""){
                              var cell_id = this.id;
                              var i = cell_id[5] - '0';
                              var j = cell_id[7] - '0';
                              var base_row = Math.floor(i / 3); var base_col = Math.floor(j / 3);
                              for(var k = 0; k < 9; ++k){
                                    if(k != j && cells[i][j] == cells[i][k] && hasConflict[i][k] == true)  reCheck(i, k, i, j);
                                    if(k != i && cells[i][j] == cells[k][j] && hasConflict[k][j] == true)  reCheck(k, j, i, j);
                                    var tmp_i = base_row * 3 + Math.floor(k/3);
                                    var tmp_j = base_col * 3 + (k%3);
                                    if(tmp_i != i && tmp_j != j && cells[i][j] == cells[tmp_i][tmp_j] && hasConflict[tmp_i][tmp_j] == true)
                                          reCheck(tmp_i, tmp_j, i, j);
                              }
                        }
                  };
                  cell.onkeyup = function(){
                        var x = event.which || event.keyCode;
                        if(x == 8)  {this.innerHTML = "";}
                        var cell_id = this.id;
                        var i = cell_id[5] - '0';
                        var j = cell_id[7] - '0';
                        cells[i][j] = this.innerHTML;
                        var conflict = false;
                        if(cells[i][j] != ""){
                              var base_row = Math.floor(i / 3); var base_col = Math.floor(j / 3);
                              for(var k = 0; k < 9; ++k){
                                    if(k != j && cells[i][j] == cells[i][k])  {conflict = true; break;}
                                    if(k != i && cells[i][j] == cells[k][j])  {conflict = true; break;}
                                    var tmp_i = base_row * 3 + Math.floor(k/3);
                                    var tmp_j = base_col * 3 + (k%3);
                                    if(tmp_i != i && tmp_j != j && cells[i][j] == cells[tmp_i][tmp_j])
                                          {conflict = true; break;}
                              }                              
                        }
                        if(conflict == true){
                              if(hasConflict[i][j] == false){conflictCnt++;   hasConflict[i][j] = true;}
                              this.style.backgroundColor = "#FFB6C1";
                        }
                        else{
                              if(hasConflict[i][j] == true){conflictCnt--;    hasConflict[i][j] = false;}
                              this.style.backgroundColor = "transparent";
                        }
                  }
                  if(j == 2 || j == 5)
                        cell.style.borderRight = "3px solid #000";
                  if(i == 2 || i == 5)
                        cell.style.borderBottom = "3px solid #000";
                  lRow.appendChild(cell);
            }
            tableSudoku.appendChild(lRow);
      }

      divTable.appendChild(tableSudoku);
}

function drawControlPanel(controlPanelName){
      var divControlPanel = document.getElementById(controlPanelName);

      var divSolve = document.createElement("div");
      divSolve.innerHTML = "求解";
      divSolve.id = "btnSolve";
      divSolve.classList.add("solveBtn");
      divControlPanel.appendChild(divSolve);
      addClickEvent_changeColor("btnSolve");
      divSolve.style.marginTop = "0px";
      divSolve.onclick = function(){callSolver();};

      var divTip = document.createElement("div");
      divTip.innerHTML = "提示一步";
      divTip.id = "btnTip";
      divTip.classList.add("solveBtn");
      divControlPanel.appendChild(divTip);
      addClickEvent_changeColor("btnTip");
      divTip.onclick = function(){oneTipSolver();};

      var divLocker = document.createElement("div");
      divLocker.innerHTML = "锁定棋盘";
      divLocker.id = "btnLocker";
      divLocker.classList.add("solveBtn");
      divControlPanel.appendChild(divLocker);
      addClickEvent_changeColor("btnLocker");
      divLocker.onclick = function(){lockTable();};

      var divRecover = document.createElement("div");
      divRecover.innerHTML = "恢复";
      divRecover.id = "btnRecover";
      divRecover.classList.add("solveBtn");
      divControlPanel.appendChild(divRecover);
      addClickEvent_changeColor("btnRecover");
      divRecover.onclick = function(){recoverTable();};


      var divClearTable = document.createElement("div");
      divClearTable.innerHTML = "重置";
      divClearTable.id = "btnClearTable";
      divClearTable.classList.add("solveBtn");
      divControlPanel.appendChild(divClearTable);
      addClickEvent_changeColor("btnClearTable");
      divClearTable.onclick = function(){clearCells();};
}

function createTimer(timerName){
      var timer = document.getElementById(timerName);

      var img1 = document.createElement("img");
      img1.src = "images/refresh.png";
      img1.id = "btnRefresh";
      img1.ondragstart = function(){return false;};
      img1.onclick = function(){refreshTimer();};
      timer.appendChild(img1);
      addClickEvent_changeOpacity("btnRefresh");

      var img2 = document.createElement("img");
      img2.src = "images/execute.png";
      img2.id = "btnControl";
      img2.ondragstart = function(){return false;};
      img2.onclick = function(){timeControl();};
      timer.appendChild(img2);
      addClickEvent_changeOpacity("btnControl");

      var d = document.createElement("div");
      d.innerHTML = "00:00:00";
      d.id = "timerController";
      timer.appendChild(d);
}
function refreshTimer(){
      if(isCounting){
            clearTimeout(timeoutId);
            var controller = document.getElementById("btnControl");
            controller.src = "images/execute.png";
      }
      hours = 0;
      mins = 0;
      secs = 0;
      isCounting = false;
      var d = document.getElementById("timerController");
      d.innerHTML = "00:00:00";
}
function timeControl(){
      if(!isCounting){
            isCounting = true;
            var controller = document.getElementById("btnControl");
            controller.src = "images/stop.png";
            timeoutId = setInterval(countTime, 10);
      }
      else{
            isCounting = false;
            clearTimeout(timeoutId);
            var controller = document.getElementById("btnControl");
            controller.src = "images/execute.png";
      }
}
function countTime(){
      ms += 10;
      if(ms >= 1000){   secs += 1;  ms = 0;     }
      if(secs >= 60){   mins += 1;  secs = 0;   }
      if(mins >= 60){   hours += 1; mins = 0;   }
      if(hours >= 24){  hours = 0;  }
      var timer = document.getElementById("timerController");
      var t = "";
      // if(hours < 10) t = "0" + hours + ":";     else t = hours + ":";
      if(mins < 10) t += "0" + mins + ":";      else t += mins + ":";
      if(secs < 10) t += "0" + secs + ":";      else t += secs + ":";
      if(ms / 10 < 10)  t += "0" + ms / 10;     else t += ms / 10;
      timer.innerHTML = t;
}

function addClickEvent_changeColor(btnName){
      var btn = document.getElementById(btnName);
      btn.onmousedown = function(){
            btn.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
            return false;
      }
      btn.onmouseup = function(){
            btn.style.backgroundColor = "rgba(0, 0, 0, 1)";
            return false;
      }
      btn.onmouseout = function(){
            btn.style.backgroundColor = "rgba(0, 0, 0, 1)";
            return false;
      }
}
function addClickEvent_changeOpacity(btnName){
      var btn = document.getElementById(btnName);
      btn.onmousedown = function(){
            btn.style.opacity = "0.3";
            return false;
      }
      btn.onmouseup = function(){
            btn.style.opacity = "1.0";
            return false;
      }
      btn.onmouseout = function(){
            btn.style.opacity = "1.0";
            return false;
      }
}

function clearCells(){
      for(var i = 0; i < 9; ++i)
            for(var j = 0; j < 9; ++j){
                  hasConflict[i][j] = false;
                  conflictCnt = 0;
                  cells[i][j] = "";
                  var cell = document.getElementById("cell_" + i + "_" + j);
                  cell.innerHTML = "";
                  cell.classList.remove("setBefore");
                  cell.contentEditable = true;
                  cell.style.backgroundColor = "transparent";
            }
      isLocked = false;
      hasAnswer = false;
      var d = document.getElementById("btnLocker");
      d.innerHTML = "锁定棋盘";
      refreshTimer();
}

function lockTable(){
      if(!isLocked){
            if(conflictCnt > 0){ alert("棋盘中存在冲突数字, 无法锁定!"); return;}
            isLocked = true;
            var d = document.getElementById("btnLocker");
            d.innerHTML = "解锁棋盘";
            for(var i = 0; i < 9; ++i)
                  for(var j = 0; j < 9; ++j){
                        if(cells[i][j] == "")   continue;
                        var cell = document.getElementById("cell_" + i + "_" + j);
                        cell.classList.add("setBefore");
                        cell.contentEditable = false;
                        
                  }
      }
      else{
            isLocked = false;
            hasAnswer = false;
            var d = document.getElementById("btnLocker");
            d.innerHTML = "锁定棋盘";
            for(var i = 0; i < 9; ++i)
                  for(var j = 0; j < 9; ++j){
                        if(cells[i][j] == "")   continue;
                        var cell = document.getElementById("cell_" + i + "_" + j);
                        cell.classList.remove("setBefore");
                        cell.contentEditable = true;
                        
                  }
      }
}

function recoverTable(){
      for(var i = 0; i < 9; ++i)
            for(var j = 0; j < 9; ++j){
                  hasConflict[i][j] = false;
                  conflictCnt = 0;
                  var cell = document.getElementById("cell_" + i + "_" + j);
                  if(cell.classList.contains("setBefore") == true)      continue;
                  cells[i][j] = "";
                  cell.innerHTML = "";
                  cell.contentEditable = true;            
                  cell.style.backgroundColor = "transparent";
            }

}


function callSolver(){
      if(conflictCnt > 0){ alert("棋盘中存在冲突数字!"); return;}
      if(isLocked == false){ alert("请先锁定棋盘!");  return;}
      var sudokuTable = new Array();      var cnt = 0;
      for(var i = 0; i < 9; ++i){
            sudokuTable[i] = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
            for(var j = 0; j < 9; ++j){
                  var cell = document.getElementById("cell_" + i + "_" + j);
                  if(cell.classList.contains("setBefore") == true){
                        cnt++;
                        sudokuTable[i][j] = cells[i][j][0] - '0';
                  }
            }
      }
      if(cnt < 17){ alert("请至少锁定17个数字!");  return;}
      solver = new Solver(sudokuTable);
      if(solver.cnt != 81){alert("此锁定棋盘无可行解!");return;}
      for(var i = 0; i < 9; ++i)
            for(var j = 0; j < 9; ++j){
                  var cell = document.getElementById("cell_" + i + "_" + j);
                  cells[i][j] = answer[i][j];
                  cell.innerHTML = answer[i][j];
            }
}

function oneTipSolver(){
      if(conflictCnt > 0){ alert("棋盘中存在冲突数字!"); return;}
      if(isLocked == false){ alert("请先锁定棋盘!");  return;}
      var sudokuTable1 = new Array();     
      var sudokuTable2 = new Array();     var cnt = 0;
      for(var i = 0; i < 9; ++i){
            sudokuTable1[i] = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
            sudokuTable2[i] = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
            for(var j = 0; j < 9; ++j){
                  if(cells[i][j] != "")   sudokuTable2[i][j] = cells[i][j][0] - '0';
                  var cell = document.getElementById("cell_" + i + "_" + j);                  
                  if(cell.classList.contains("setBefore") == true){
                        sudokuTable1[i][j] = cells[i][j][0] - '0';
                        cnt++;
                  }
            }
      }
      if(cnt < 17){ alert("请至少锁定17个数字!");  return;}
      if(hasAnswer == false){
            solver1 = new Solver(sudokuTable1);
            if(solver1.cnt != 81){alert("此锁定棋盘无可行解!");return;}
            hasAnswer = true;
      }
      solver2 = new Solver(sudokuTable2);
      if(solver2.cnt != 81){alert("此锁定棋盘有解, 但当前填法有误!");return;}
      for(var i = 0; i < 9; ++i)
            for(var j = 0; j < 9; ++j)
                  if(cells[i][j] == ""){
                        var cell = document.getElementById("cell_" + i + "_" + j);
                        cells[i][j] = answer[i][j];
                        cell.innerHTML = answer[i][j];
                        return;
                  }
}

function reCheck(i, j, avoid_i, avoid_j){
      var conflict = false;
      var base_row = Math.floor(i / 3); var base_col = Math.floor(j / 3);
      for(var k = 0; k < 9; ++k){
            if((i != avoid_i || k != avoid_j) && k != j && cells[i][j] == cells[i][k])  {conflict = true; break;}
            if((k != avoid_i || j != avoid_j) && k != i && cells[i][j] == cells[k][j])  {conflict = true; break;}
            var tmp_i = base_row * 3 + Math.floor(k/3);
            var tmp_j = base_col * 3 + (k%3);
            if((tmp_i != avoid_i || tmp_j != avoid_j) && tmp_i != i && tmp_j != j && cells[i][j] == cells[tmp_i][tmp_j])
                  {conflict = true; break;}
      }
      if(conflict == false){
            conflictCnt--;    hasConflict[i][j] = false;
            var cell = document.getElementById("cell_" + i + "_" + j);
            cell.style.backgroundColor = "transparent";
      }
}


class Solver{
      set_cell(i, j, val){
            var base_row = Math.floor(i / 3), base_col = Math.floor(j / 3);
            this.complete[i][j] = val;
            for(var k = 0; k < 9; ++k){
                  this.state[i][k][val - 1]++;
                  if(k != i) this.state[k][j][val - 1]++;
                  if((base_row * 3 + Math.floor(k/3) != i) && (base_col * 3 + (k%3) != j))
                        this.state[base_row * 3 + Math.floor(k/3)][base_col * 3 + (k%3)][val - 1]++;
            }
            this.cnt++;
      }
      reset_cell(i, j, val){
            var base_row = Math.floor(i / 3), base_col = Math.floor(j / 3);
            this.complete[i][j] = 0;
            for(var k = 0; k < 9; ++k){
                  this.state[i][k][val - 1]--;
                  if(k != i) this.state[k][j][val - 1]--;
                  if((base_row * 3 + Math.floor(k/3) != i) && (base_col * 3 + (k%3) != j))
                        this.state[base_row * 3 + Math.floor(k/3)][base_col * 3 + (k%3)][val - 1]--;                  
            }
            this.cnt--;
      }
      DFS(){
            if(this.cnt == 81)      return 1;
            var S = new Array();
            var C = new Array();
            var _cnt = this.cnt;
            for(var i = 0; i < 9; ++i){
                  C[i] = this.complete[i].concat();
                  S[i] = new Array();
                  for(var j = 0; j < 9; ++j)
                        S[i][j] = this.state[i][j].concat();
            }

            var min_i;  var min_j;  var min_choice_num = 10;
            for(var i = 0; i < 9; ++i)
                  for(var j = 0; j < 9; ++j)
                        if(this.complete[i][j] == 0){
                              var choice_cnt = 0;     var choice = -1;
                              for(var k = 0; k < 9; ++k)
                                    if(this.state[i][j][k] == 0){
                                          choice = k;
                                          choice_cnt++;
                                    }
                              if(choice_cnt == 0){
                                    this.cnt = _cnt;
                                    for(var idx_i = 0; idx_i < 9; ++idx_i){
                                          this.complete[idx_i] = C[idx_i].concat();                        
                                          for(var idx_j = 0; idx_j < 9; ++idx_j)
                                                this.state[idx_i][idx_j] = S[idx_i][idx_j].concat();
                                    }
                                    return 0;
                              }
                              if(choice_cnt == 1) this.set_cell(i, j, choice + 1);
                              if(min_choice_num > choice_cnt){
                                    min_choice_num = choice_cnt;  min_i = i;  min_j = j;
                              }
                        }
            if(min_choice_num == 1){
                  var res = this.DFS();
                  if(res == 0){
                        this.cnt = _cnt;
                        for(var idx_i = 0; idx_i < 9; ++idx_i){
                              this.complete[idx_i] = C[idx_i].concat();                        
                              for(var idx_j = 0; idx_j < 9; ++idx_j)
                                    this.state[idx_i][idx_j] = S[idx_i][idx_j].concat();
                        }
                  }
                  return res;
            }

            for(var k = 0; k < 9; ++k)
                  if(this.state[min_i][min_j][k] == 0){
                        this.set_cell(min_i, min_j, k + 1);
                        if(this.DFS() == 1)     return 1;
                        this.reset_cell(min_i, min_j, k + 1);
                  }
            this.cnt = _cnt;
            for(var idx_i = 0; idx_i < 9; ++idx_i){
                  this.complete[idx_i] = C[idx_i].concat();                        
                  for(var idx_j = 0; idx_j < 9; ++idx_j)
                        this.state[idx_i][idx_j] = S[idx_i][idx_j].concat();
            }
            return 0;
      }
      constructor(sudokuTable){
            this.state = new Array();
            this.complete = new Array();
            this.cnt = 0;
            for(var i = 0; i < 9; ++i){
                  this.complete[i] = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
                  this.state[i] = new Array();
                  for(var j = 0; j < 9; ++j)
                        this.state[i][j] = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
            }
            for(var i = 0; i < 9; ++i)
                  for(var j = 0; j < 9; ++j)
                        if(sudokuTable[i][j] != 0)
                              this.set_cell(i, j, sudokuTable[i][j]);
     
            var res = this.DFS();
            for(var i = 0; i < 9; ++i)
                  for(var j = 0; j < 9; ++j)
                        if(this.complete[i][j] == 0)
                              answer[i][j] = "";
                        else
                              answer[i][j] = "" + this.complete[i][j];
            console.log("res="+res, "cnt="+this.cnt);
      }

}


