// BUDGET CONTROLLER
var budgetController = (function() {

    var Expense = function(id, description, value) {        // function constructor
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {         // function constructor
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {                                            // object to store data
        allItems: {                                         // object
            exp: [],
            inc: []
        },
        totals: {                                           // object
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type) {                   // private function
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    }

    return {                                                // closure property ... this returns an object
        addItem: function(type, des, val) {                 // so that the functions become public.
            var newItem, ID;

            // create new id
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0;
            }

            // create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } 
            else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // push it into our data structure
            data.allItems[type].push(newItem);

            // return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;
            // id = 6
            // ids = [1 2 4 6 8]
            // index = 3

            // to create an array containing ids of all the object.
            ids = data.allItems[type].map(function(current) {                   // map property of array.
                return current.id;
            });     

            index = ids.indexOf(id);                                            // indexOf property of array.

            if(index !== -1) {                     // will remove exactly 1 element from index :- index
                data.allItems[type].splice(index, 1); 
            }                                                                   // splice property of array.
                                                                                
        },

        calculateBudget: function() {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }
            
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        calculatePercentages: function() {
            /*
            a = 20
            b = 10
            c = 40
            income = 100
            percentage of a = (20 / 100) * 100;
            and so on...            
            */

            data.allItems.exp.forEach(function(cur) {           // the word function here means callback function.
                cur.calcPercentage(data.totals.inc); 
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;                                     // array with all the percentages of all the expenses.
        },
        
        testing: function() {
            console.log(data);
        }
    };

})();




// UI CONTOLLER
var UIController = (function() {

    var DOMstrings = {              // created this object to avoid the effects of changes in class names of html file.
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',      
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber = function(num, type) {
        var len, dec;
        /*
        + or - before the number
        exactly 2 decimal points 
        , separating the thousands.
        */
        num = Math.abs(num);
        num = num.toFixed(2);
        num = num.split('.');
        dec = num[1];
        num = num[0];
        len = num.length;
        
        if(len > 3) {
            num = num.substr(0, len - 3) + ',' + num.substr(len - 3);
        }
        if(len > 6) {
            num = num.substr(0, len - 6) + ',' + num.substr(len - 6);
        }
        if(len > 9) {
            num = num.substr(0, len - 9) + ',' + num.substr(len - 9);
        }

        return (type === 'exp' ? '-' : '+') + ' ' + num + '.' + dec;
    }
    
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    }

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            
            // create html string with placeholder text

            if(type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // replace the placeholder text with some actual data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // insert the html into the DOM

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            // this returns a node list and forEach property doesn't work on node lists. that's why we have
            // to convert this node list into array using slice property of array.

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();            
        },

        displayBudget: function(obj) {
            var type;
            type = (obj.budget > 0) ? 'inc' : 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';            
            }
            else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);            

            nodeListForEach(fields, function(current, index) {

                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                }
                else {
                    current.textContent = '---';
                }
            });

        },       

        displayMonth: function() {
            var now, month, year, months;
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            // var christmas = new Date(2016, 11, 25);
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDescription + ',' + 
                DOMstrings.inputValue
            );
            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    };

})();




// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }    

    var updateBudget = function() {

        // 1. calculate the budget
        budgetCtrl.calculateBudget();

        // 2. return the budget
        var budget = budgetCtrl.getBudget();

        // 3. display the budget on UI
        UICtrl.displayBudget(budget);

    }

    var updatePercentages = function() {

        // 1. calculate percentage
        budgetCtrl.calculatePercentages();

        // 2. read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. update the UI with the new percentages.
        UICtrl.displayPercentages(percentages);

    }

    var ctrlAddItem = function() {
        
        // 1. get the field input data
        var input = UICtrl.getInput();        

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            
            // 2. add the item to the budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. clear the fields
            UICtrl.clearFields();

            // 5. calculate and update budget
            updateBudget(); 

            // 6. calculate and update the percentages
            updatePercentages();
        }                    
    }    

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        // itemID is a string which contains the id of the html element.

        if(itemID) {

            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. update and show the new budget
            updateBudget();

            // 4. calculate and update the percentages
            updatePercentages();
        }
    }

    return {
        init: function() {
            console.log('application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);




// initialisation function
controller.init();