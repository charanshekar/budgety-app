//IIFE and return an object containg methods

//Budget Controller
var budgetController = (function() {
    var Expense = function(id, desc, value)  {
        this.id = id;
        this.desc = desc;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPerc = function(totalIncome) {
        if (totalIncome > 0)
            this.percentage = Math.round((this.value / totalIncome) * 100);
        else
            this.percentage = -1;
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id, desc, value)  {
        this.id = id;
        this.desc = desc;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            //Create new ID
            if (data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            else
                ID = 0;

            //Create new item based on 'inc' or 'exp' type
            if (type === 'exp')
                newItem = new Expense(ID, des, val);
            else if (type === 'inc')
                newItem = new Income(ID,des, val);
            
            //Push it into the data structure
            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItem: function(type, id) {
            var ids, index;
            // ids = [1 2 4 6 8]
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);

            // splice() 
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function() {
            // 1. Calculate Total Income and Expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // 2. Calculate Budget = Income - Expenses
            data.budget = data.totals.inc - data.totals.exp;

            // 3. Calculate the percentage of Income Expediture.
            if (data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            else
                data.percentage = -1;
        },
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPerc(data.totals.inc);
            });
        },
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget: function() {
            return data;
        },
        testing: function() {
            console.log(data);
        }

    };
})();

//UI Controller
var UIController = (function() {
    var DOMstrings = {

        inputType: '.add__type',
        inputDesc: '.add__description',
        inputVal: '.add__value',
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
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type, sign;
        // + OR -;
        //exactly 2 decimal points;
        //comma separating thousands;
        num = Math.abs(num);
        num = num.toFixed(2); // outputs string
        
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {

            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // substr(index, n of characters)
        }
        dec = numSplit[1];


        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var NodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMstrings.inputVal).value)
            }

        },

        addListItem: function(obj, type) {
            var html, element;
            
            // Create HTML String w placeholder text
            if (type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }
            else {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }
            
            // Replace the placeholder text with actual data
            html = html.replace('%id%', obj.id);
            html = html.replace('%description%', obj.desc);
            html = html.replace('%value%', formatNumber(obj.value, type));
            
            // Inser the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },

        //In JS you can only remove a child
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputVal);
            
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totals.inc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totals.exp, 'exp');

            if (obj.percentage > 0)
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            else
            document.querySelector(DOMstrings.percentageLabel).textContent = '---';
        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            NodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0)
                    current.textContent = percentages[index] + '%';
                else
                    current.textContent = '---';
            });
        },

        displayMonth: function(){
            var now, year, month, months;
            now = new Date();
            //var christmas = new Date(2016, 11, 25);
            year = now.getFullYear();
            months = ["January","February","March","April","May","June","July",
            "August","September","October","November","December"];
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + DOMstrings.inputDesc + ',' + DOMstrings.inputVal
            );

            NodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    }
})();

//Global App Controller
var controller = (function(budgetCtrl,   UICtrl) {
//Not only click event but also at keypress event(Enter)

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13) {
                ctrlAddItem();
            };
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
    };

    var updatePercentages = function() {
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new Percentages
        UICtrl.displayPercentages(percentages);
    };

    var updateBudget = function() {
        //  1. Calc the budget.
        budgetCtrl.calculateBudget();
        //  2. Return the budget
        var budget = budgetCtrl.getBudget();
        //  3. Display the budget on UI.
        console.log(budget);
        UICtrl.displayBudget(budget);
    }

    var ctrlAddItem = function() {
        // TO-DO LIST
        var input, newItem;
        //  1. Get the field input data.
        input = UICtrl.getInput();
        //console.log(input);

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //  2. Add the item to the budget Controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //budgetCtrl.testing();

            //  3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
        
            //  4. Clear Fields
            UICtrl.clearFields();

            //  5. Calculate and Update Budget.
            updateBudget();

            //  6. Calc and update percentages
            updatePercentages();
        }       
        
       console.log('Listeners work')
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {

            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calc and update percentages
            updatePercentages();
        }
    };

    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                    allItems: {
                        exp: [],
                        inc: []
                    },
                    totals: {
                        exp: 0,
                        inc: 0
                    },
                    budget: 0,
                    percentage: '---'
            });
            setupEventListeners();
        }
    }


})(budgetController, UIController);

controller.init();