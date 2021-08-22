class CalcController {
    constructor() {
        this._audio = new Audio('click.mp3');
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';

        this._locale = 'pt-BR';
        this._operation = [];
        this._historicDisplay = document.querySelector('#historic');
        this._lastNumDisplay = document.querySelector('#last-num');
        this._operatorDisplay = document.querySelector('#opr');
        this._dateDisplay = document.querySelector('#data');
        this._currentDate;
        this.inicialize();
        this.initButtonsEvents();
        this.initKeyboard();
    }

    copyToClipboard() {
        var r = document.createRange();
        r.selectNode(this._lastNumDisplay);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(r);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
    }

    pasteFromClipboard() {
        document.addEventListener('paste', e => {
            let standardText = "0"
            let text = e.clipboardData.getData('text');

            if(parseFloat(text)) {
                standardText = parseFloat(text);
            }

            if(this.isOperator(this.getLastItem())) {
                if(standardText != "0") {
                    this._operation.push(standardText);
                    this._lastNumber = standardText;
                }
            } else {
                this.setLastNumber(standardText);
            }

            let verif = this.getLastItem(false) != "" || !(this.isOperator(this.getLastItem()));
            this.lastNumDisplay = verif ? this.getLastItem(false) : "0" ;
        });
    }

    inicialize() {
        this.showTime();
        setInterval(()=>{
            this.showTime();
        }, 1000);

        this.pasteFromClipboard();

        let btn = document.querySelector('.buttons > .button');
        btn.addEventListener('dblclick', e => {
            this.toggleAudio();
        });
    }

    toggleAudio() {
        this._audioOnOff = !this._audioOnOff;
    }

    playAudio() {
        if(this._audioOnOff) {
            this._audio.currentTime = 0;
            this._audio.play();
        }
    }

    initKeyboard() {
        document.addEventListener('keyup', e => {
            this.playAudio();
            switch(e.key) {
                case 'Escape':
                    this.clearAll();
                    break;
                case 'Backspace':
                    this.clearEntry();
                    break;
                case '+':
                case '-':
                case '*':
                case '/':
                case '%':
                    this.addOperation(e.key);
                    break;
                case '.':
                case ',':
                    this.addDot();
                    break;
                case 'Enter':
                case '=':
                    this.setHistoricToDisplay();
                    this.setOperatorToDisplay('=');
                    this.calc();
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;
                case 'c':
                    if(e.ctrlKey) this.copyToClipboard();
                    break;
                case 'v':
                    if(e.ctrlKey) this.pasteFromClipboard();
                    break;
            }
        });
    }

    showTime() {
        this.dateDisplay =
            `${this.currentDate.toLocaleTimeString(this._locale)} - ${this.currentDate.toLocaleDateString(this._locale)}`;
    }

    addEventListenerAll(element, events, fn) {
        events.split(' ').forEach(event => {
            element.addEventListener(event, fn, false);
        });
    }

    clearAll() {
        this.historicDisplay = '';
        this.lastNumDisplay = '0';
        this.operatorDisplay = '';
        this._lastNumber = '';
        this._lastOperator = '';

        this._operation.length = 0;
    }

    clearEntry() {
        let canceled = this._operation.pop();
        if(this.isOperator(canceled)) {
                this.operatorDisplay = '';
                this.historicDisplay = '';
        } else {
            this.lastNumDisplay = '0';
        }
    }

    getLastOperation() {
        return this._operation[this._operation.length-1];
    }

    setLastOperation(value) {
        this._operation[this._operation.length-1] = value;
    }

    isOperator(value) {
        return (['+', '-', '*', '/', '%'].indexOf(value) > -1);
    }

    pushOperation(value) {
        this._operation.push(value);

        if(this._operation.length == 2) {
            this.setHistoricToDisplay();
        }

        if(this._operation.length > 3) {
            this.setHistoricToDisplay();
            this.calc();
        }
    }

    getResult() {
        try {
            return eval(this._operation.join(''));
        } catch(e) {
            setTimeout(() => {
                this.setError();
            }, 0.1);
        }
    }

    calc() {
        let last = '';
        this._lastOperator = this.getLastItem();

        if(this._operation.length < 3) {
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }

        if(this._operation.length > 3) {
            last = this._operation.pop();

            this._lastNumber = this.getResult();
        } else if(this._operation.length == 3) {
            this._lastNumber = this.getLastItem(false);
        }

        let result;
        if(this._operation[1] == '%') {
            result = this._operation[0]*(this._operation[2]/100);
        } else {
            result = this.getResult();
        }
        
        this._operation = [result];
        if(last) this._operation.push(last);
        this.setLastNumberToDisplay();
    }

    getLastItem(isOperator = true) {
        let lastItem;
        for(let i = this._operation.length-1; i >= 0; i--) {
            if(this.isOperator(this._operation[i]) == isOperator) {
                lastItem = this._operation[i];
                break;
            }
        }

        if(!lastItem) {
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
        }

        return lastItem;
    }

    setLastNumber(value) {
        for(let i = this._operation.length-1; i >= 0; i--) {
            if(!(this.isOperator(this._operation[i]))) {
                if(value == "0") {
                    this._operation.splice(i,1);
                    break;
                }
                
                this._operation[i] = value;
                break;
            }
        }
    }

    setLastNumberToDisplay() {
        let lastNumber = this.getLastItem(false);

        this.lastNumDisplay = lastNumber;
    }

    setOperatorToDisplay(value) {
        let operator = this.getLastItem();
        if(value == '=') {
            this.operatorDisplay = '=';
        } else {
            this.operatorDisplay = operator;
        }
    }

    setHistoricToDisplay() {
        let fullHistory = '';
        for(let i = 0; i < this._operation.length; i++) {
            var aux = this._operation[i];
            fullHistory += aux.toString();
            if(this.isOperator(this.getLastOperation()) && i == this._operation.length-2) {
                break;
            }
        }
        this.historicDisplay = fullHistory;
    }

    addOperation(value) {
        if(isNaN(this.getLastOperation())) {
            if(this.isOperator(value)) {
                this.setLastOperation(value);
                this.setOperatorToDisplay();
            } else {
                this.pushOperation(value);
                this.setLastNumberToDisplay();
            }
        } else {
            if(this.isOperator(value)) {
                this.pushOperation(value);
                this.setOperatorToDisplay();
            } else {
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);

                this.setLastNumberToDisplay();
            }
        }
    }

    setError() {
        this.lastNumDisplay = 'ERROR';
    }

    addDot() {
        let lastOperation = this.getLastOperation();

        if(typeof lastOperation == 'string' && lastOperation.split('').indexOf('.') > -1) return;

        if(this.isOperator(lastOperation) || !lastOperation) {
            this.pushOperation('0.');
        } else {
            this.setLastOperation(lastOperation.toString() + '.');
        }

        this.setLastNumberToDisplay(); 
    }

    execButton(value) {
        this.playAudio();
        switch(value) {
            case 'AC':
                this.clearAll();
                break;
            case 'CE':
                this.clearEntry();
                break;
            case '+':
            case '-':
            case '*':
            case '/':
            case '%':
                this.addOperation(value);
                break;
            case '.':
                this.addDot();
                break;
            case '=':
                this.setHistoricToDisplay();
                this.setOperatorToDisplay(value);
                this.calc();
                break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;
            default:
                this.setError();
        }
    }

    initButtonsEvents() {
        let buttons = document.querySelectorAll('.buttons > .button');

        buttons.forEach((button, index) => {
            this.addEventListenerAll(button, 'click drag', e => {
                let txtButton;
                if(button.innerHTML.length > 2) {
                    txtButton = button.innerHTML[3];
                } else {
                    txtButton = button.innerHTML;
                }
                this.execButton(txtButton);
            });

            this.addEventListenerAll(button, 'mouseover mouseup mousedown', e => {
                button.style.cursor = 'pointer'
            });
        });
    }

    get historicDisplay() {
        return this._historicDisplay.innerHTML;
    }

    set historicDisplay(value) {
        this._historicDisplay.innerHTML = value;
    }

    get lastNumDisplay() {
        return this._lastNumDisplay.innerHTML;
    }

    set lastNumDisplay(value) {
        if(value.toString().length > 11) {
            this.setError();
            return false;
        }

        this._lastNumDisplay.innerHTML = value;
    }

    get operatorDisplay() {
        return this._operatorDisplay.innerHTML;
    }

    set operatorDisplay(value) {
        this._operatorDisplay.innerHTML = value;
    }

    get dateDisplay() {
        return this._dateDisplay.innerHTML;
    }

    set dateDisplay(value) {
        this._dateDisplay.innerHTML = value;
    }

    get currentDate() {
        return new Date();
    }

    set currentDate(value) {
        this._currentDate = value;
    }
}