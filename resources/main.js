var pageSize, agingBitSize, t, nextPageValue, pages, randomPages, oldPagesList, predefined, predefinedCounter;

function initialize() {
    this.pageSize = document.getElementById('page-size').value;
    this.agingBitSize = document.getElementById('aging-bit-size').value;
    this.pages = {};
    this.randomPages = true;
    this.oldPagesList = [];
    this.predefined = [7, 0, 1, 2, 0, 3, 0, 4, 0, 3, 3, 2, 1, 2, 0, 0, 10, 11, 8, 22, 99, 6, 55, 6, 4, 0, 0, 0, 1, 2, 3, 4, 4, 3, 1, 7];
    this.predefinedCounter = 0;
    this.nextPageValue = -1;
    document.getElementById('pages-list-pre-p').style.display = "none";
}

function pageSizeValue() {
    this.pageSize = document.getElementById('page-size').value;

    if (this.pageSize < 3) {
        document.getElementById('page-size').value = 3;
        this.pageSize = 3;
    } else if (this.pageSize > 10) {
        document.getElementById('page-size').value = 10;
        this.pageSize = 10;
    }
}

function agingBitSizeValue() {
    this.agingBitSize = document.getElementById('aging-bit-size').value;

    if (this.agingBitSize < 4) {
        document.getElementById('aging-bit-size').value = 4;
        this.agingBitSize = 4;
    } else if (this.agingBitSize > 8) {
        document.getElementById('aging-bit-size').value = 8;
        this.agingBitSize = 8;
    }
}

function startSim() {
    document.getElementById("start").disabled = true;
    document.getElementById("pause").disabled = false;
    document.getElementById("continue").disabled = true;
    document.getElementById("reset").disabled = false;
    document.getElementById('page-size').readOnly = true;
    document.getElementById('aging-bit-size').readOnly = true;
    document.getElementById("random").disabled = true;
    document.getElementById("defined").disabled = true;
    reDrawTable();
    nextPage();
}

function pauseSim() {
    document.getElementById("start").disabled = true;
    document.getElementById("pause").disabled = true;
    document.getElementById("continue").disabled = false;
    document.getElementById("reset").disabled = false;
    document.getElementById('page-size').readOnly = true;
    document.getElementById('aging-bit-size').readOnly = true;
    clearTimeout(t);
}

function continueSim() {
    document.getElementById("start").disabled = true;
    document.getElementById("pause").disabled = false;
    document.getElementById("continue").disabled = true;
    document.getElementById("reset").disabled = false;
    document.getElementById('page-size').readOnly = true;
    document.getElementById('aging-bit-size').readOnly = true;
    t = setTimeout(nextPage, 2000);
}

function resetSim() {
    clearTimeout(t);
    document.getElementById("start").disabled = false;
    document.getElementById("pause").disabled = true;
    document.getElementById("continue").disabled = true;
    document.getElementById("reset").disabled = true;
    document.getElementById('next-page').value = "";
    document.getElementById('page-size').readOnly = false;
    document.getElementById('aging-bit-size').readOnly = false;
    document.getElementById("random").checked = true;
    document.getElementById("random").disabled = false;
    document.getElementById("defined").disabled = false;
    this.predefinedCounter = 0;
    document.getElementById('pages-list-pre-p').style.display = "none";
    resetTable();
    resetPagesTable();
}

function nextPage() {
    radioButtonChanged();

    if (this.nextPageValue > -1) {
        this.oldPagesList.push(this.nextPageValue);
        updatePagesListTable();
    }

    if (this.randomPages) {
        nextPageValue = document.getElementById('next-page').value = Math.floor((Math.random() * 20) + 1);
    } else {
        nextPageValue = document.getElementById('next-page').value = this.predefined[this.predefinedCounter];
        this.predefinedCounter++;
    }

    if (this.randomPages || (!this.randomPages && nextPageValue != undefined)) {
        updatePages();
        continueSim();
    }
}

function updatePages() {
    var pageHit = false;

    //find page
    for (var i = 0; i < this.pageSize; i++) {
        if (this.pages[i] == undefined) break;

        if (this.pages[i][0] == nextPageValue) {
            this.pages[i][1] = 1; // set R-bit to 1
            handleBinaryCounter(i, true);
            pageHit = true;
	    this.pages[i][4] = 0;
        } else if (this.pages[i][0] != nextPageValue) {
            this.pages[i][1] = 0; // set R-bit to 0
            handleBinaryCounter(i, true);
	    this.pages[i][4]++;
        }
    }

    if (!pageHit) {
        if (Object.keys(this.pages).length == this.pageSize) {
            var smallestValue, pageKey, largestValue;

            for (var i = 0; i < this.pageSize; i++) {
                if (i == 0) {
                    smallestValue = this.pages[i][3];
                    pageKey = i;
		    largestValue = this.pages[i][4];
                } else {
                    if ((this.pages[i][3] < smallestValue && this.pages[i][4] > largestValue) ||
			(this.pages[i][3] == 0 && this.pages[i][4] > largestValue)) {
                        smallestValue = this.pages[i][3];
                        pageKey = i;
			largestValue = this.pages[i][4];
                    }
                }
            }

            this.pages[pageKey] = [
                nextPageValue,
                1,
                "",
                "",
		0
            ];
            handleBinaryCounter(pageKey, false);

        } else {
            populatePagesDictionary();
        }
    }

    newCellContent();
}

function populatePagesDictionary() {
    for (var i = 0; i < this.pageSize; i++) {
        if (this.pages[i] == undefined) {
            this.pages[i] = [
                nextPageValue,
                1,
                "",
                "",
		0
            ];
            handleBinaryCounter(i, false);
            break;
        }
    }
}

function handleBinaryCounter(pageKey, hasValue) {
    var binArray = []

    if (hasValue) {
        var arrayStr = this.pages[pageKey][2].split("");
        for (var i = 0; i < this.agingBitSize; i++) {
            if (i == 0) {
                binArray[i] = this.pages[pageKey][1];
            } else {
                binArray[i] = arrayStr[i - 1];
            }
        }
    } else {
        for (var i = 0; i < this.agingBitSize; i++) {
            if (i == 0) {
                binArray[i] = 1;
            } else {
                binArray[i] = 0;
            }
        }
    }

    var binaryStr = binArray.toString();
    binaryStr = binaryStr.replace(/,/g, '');

    this.pages[pageKey][2] = binaryStr;
    this.pages[pageKey][3] = parseInt(binaryStr, 2);
}

function resetTable() {
    var table = document.getElementById("sim-table");

    while (table.rows.length > 1) {
        table.deleteRow(table.rows.length - 1);
    }

    this.pages = {};
}

function resetPagesTable() {
    document.getElementById("pages-list").value = "";
    this.nextPageValue = -1;
    this.oldPagesList = [];
}

function reDrawTable() {
    var table = document.getElementById("sim-table");

    for (var i = 1; i <= parseInt(pageSize); i++) {
        var newRow = table.insertRow(i);

        for (var j = 0; j < 6; j++) {
            var newCell = newRow.insertCell(j);
            if (j == 0) {
                var newText = document.createTextNode(i - 1);
                newCell.appendChild(newText);
            }
        }
    }
}

function newCellContent() {
    var table = document.getElementById("sim-table");

    for (var i = 1; i <= this.pageSize; i++) {
        var row = table.rows[i].cells;
        if (this.pages[i - 1] != undefined) {
            row[1].innerHTML = this.pages[i - 1][0];
            row[2].innerHTML = this.pages[i - 1][1];
            row[3].innerHTML = this.pages[i - 1][2];
            row[4].innerHTML = this.pages[i - 1][3];
	    row[5].innerHTML = this.pages[i - 1][4];

            if (row[2].innerHTML == 1) {
                row[1].style.color = 'red';
                row[2].style.color = 'red';
                row[1].style.fontWeight = 'bold';
                row[2].style.fontWeight = 'bold';
            } else {
                row[1].style.color = 'black';
                row[2].style.color = 'black';
                row[1].style.fontWeight = 'normal';
                row[2].style.fontWeight = 'normal';
            }
	    row[5].style.color = this.pages[i - 1][4] == 0 ? 'red' : 'black';
            row[5].style.fontWeight = this.pages[i - 1][4] == 0 ? 'bold' : 'normal';
        }
    }
}

function radioButtonChanged() {
    if (document.getElementById("random").checked == true) {
        this.randomPages = true;
	document.getElementById('pages-list-pre-p').style.display = "none";
    } else {
        this.randomPages = false;
	document.getElementById('pages-list-pre-p').style.display = "block";
	updatePagesListPreTable();
    }
}

function updatePagesListPreTable() {
    var textValue = document.getElementById("pages-list-pre").value;
    var len = this.predefined.length;
    var newText = "";

    for(var i=0; i < len; i++) {
	if (i!=0) newText += ", ";
        newText += this.predefined[i];
    }
    document.getElementById("pages-list-pre").value = newText;
}

function updatePagesListTable() {
    var textValue = document.getElementById("pages-list").value;
    var len = this.oldPagesList.length;
    var text = this.oldPagesList[len - 1];
    var newText = "";

    if (len == 1) {
        document.getElementById("pages-list").value = text;
    } else {
        newText += textValue;
        newText += ", ";
        newText += text;
        document.getElementById("pages-list").value = newText;
    }
}