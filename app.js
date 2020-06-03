// BUDGET CONTROLLER  MODULE
var budgetController = (function(){










    // Private Functions
    var Expense = function(id, description, value){
        this.id = id;                  // Function Constructor
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };












    // This method will calculate the Percentage
    Expense.prototype.calcPercentage = function(totalIncome){

        if (totalIncome > 0){
            this.percentage = Math.round((this.value/totalIncome)*100);
        }
        else{
            this.percentage = -1;
        }
    };










    // This method will return the percentage
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };











    // Private Functions
    var Income = function(id, description, value){
        this.id = id;                  // Function Constructor
        this.description = description;
        this.value = value;
    };












    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });

        data.totals[type] = sum;

        /*
        sum = 0
        [200, 400, 600]
        
        sum = 0 + 200
        sum = 200
        
        sum = 200 + 400
        sum = 600
        
        sum = 600 + 600
        sum = 1200
        */
    }











    // Creating a strong data structure to store all of Income, expenses, total, etc...
    // data object
    var data = {

        allItems: {    // allItems is also an object
            inc: [],   // array which will store all instances of incomes
            exp: []    // array which will store all instances of expenses
        },

        totals: {      // totals is an object 
            inc : 0,   // Total Incomes
            exp : 0    // Total expenses
        },

        budget : 0,

        percentage : -1             //Non existent
        
    };











    // Add New Item Public Method
    return {










        addItem: function(type, des, val){
            var newItem, ID;

            // Create new ID:                   ID = lastID + 1
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length-1].id+1;
            }
            else{
                ID = 0;
            }

            // Create new Item based on 'exp' or 'inc'
            if (type === 'exp'){
                newItem = new Expense(ID, des, val);        // Create an Expense object
            }
            else if (type === 'inc'){
                newItem = new Income(ID, des, val);         // Create an Income object
            }

            /*
            1. No need of if - else statements to determine the <type> as <'exp'> or <'inc'>.

            For example:

                1. Let's consider the type as 'exp'.

                2. So, from the data object...
                    a) 'allItems' object will be selected.
                    b) 'exp' array will be selected.
                
                3. Now the 'push' method will be used which will add the 'newItem' at the end of the array of the 'exp'. 
            */
            
            // Push into our data Structure
            data.allItems[type].push(newItem);
            // Finally return our new Item
            return newItem;
        },














        // Deleting Item from Budget Controller
        deleteItem: function(type, id){
            var ids, index;

            /*
                Array Map() method:
                    array.map(function(currentValue, index, arr), thisValue)

                Map returns the result in the form of an array
            */
            ids = data.allItems[type].map(function(current){
                return current.id;
            });


            index = ids.indexOf(id);


            /*
                Array Splice() method:
                    array.splice(index, howmany, item1, ....., itemX)
            */
            if(index!== -1){
                data.allItems[type].splice(index, 1);
            }
        },














        calculateBudget: function(){

            // Calculate total income and the expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
            }
            else {
                data.percentage = -1;
            }
            /*
            exp = 100
            inc = 200

            per = (100 / 200) * 100
            */
        },














        // Calculate the expense percentage for each of the expense objects that are stored in the expenses array
        // So for looping we use the forEach function
        calculatePercentages: function(){

            data.allItems.exp.forEach(function(cur){

                                                          // Each element will call the calcPercentage() method
                cur.calcPercentage(data.totals.inc);      // calcPercentage() calls the Expense.prototype.calcPercentage
                                                          // data.totals.inc is the Total Income Parameter
            });

        },















        // Loop over all of our expenses
        // Call the getPercentages() methodon each of our objects
        getPercentage: function(){

            /* The reason of using map:
            
                1. We have to loop over the array and do something 
                2. [Imp] We also want to return something, we want to store somewhere
                
                // Difference between map and forEach
                3. map returns something, and stores in a variable, while forEach doesn't  

            */
            var allPerc = data.allItems.exp.map(function(cur){
                
                return cur.getPercentage();   // We call the result of the getPercentage() method from Expense.prototype.getPercentage  
                                              // Return the percentage of a particular object in the exp array and store it in allPerc  
                                              /* 
                                                Ex: We have 5 object in exp array; 
                                                    1. So, return cur.getPercentage() will get called 5 times, for each of the 5 elements
                                                    2. So for each of them we will call the getPercentage mathod
                                                    3. Return it and store it in the allPerc array
                                                    4. Return the allPerc array
                                              */
            });
            
            return allPerc;    // It's an array of all of the percentages


        },














        getBudget: function(){
            //budget, total inc, total exp, percentage
            return{
                budget: data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            }
        },













        testing: function(){
            console.log(data);
        }

    };

    


})();








































// UI CONTROLLER MODULE
var UIController = (function(){








    // Private Method syntax (no return)
    // Eache element inside this DOM Tree is called a node

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };












    var formatNumber = function(num, type){

        var numSplit, int, dec, type, sign;
        
        /*
            1. + or - before the number
            2. exactly 2 decimal points (rounded off)
            3. comma sepreator for the thousands


            Example:
                2310.4567 -> + 2,310.46
                2000 -> + 2000.00
        */
        
        num = Math.abs(num);    // Absolute number, Overiding the num argument
        
        num = num.toFixed(2);   
                                /* 
                                    1. Till 2 decimal points
                                    2. Returns a string (rounded off automatically)

                                    3. (i) 2.4567.toFixed(2) => "2.46"
                                       (ii) 2.toFixed(2)     => "2.00"
                                */
        
        // Updated the 'num' to Strings Ex: 2.3456 as "2.35"
        
        numSplit = num.split('.');
        
        int = numSplit[0];
        
        if(int.length > 3){
            /*
                string.substr(start, length)
                1. start: The position where to start the extraction.
                2. length: The number of characters to extract
            */
            // int = int.substr(0, 1) + ',' + int.substr(1, 3); //2310 => 2,310 (hard coded) 
        
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length - 3, 3);        //Dynamic
        }
        
        dec = numSplit[1];
        
        // type = 'exp' ? sign = '-' : sign = '+';
        
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec ;



    };







    var nodeListForEach = function(list, callback){               // list refers to the nodeList (expensePercLabel)
        for (var i = 0; i < list.length; i++){             // For loop: In each iteration will call the callback Function
            callback(list[i], i);                  // current => list at position i;     index => i
        }
    };









    // Public method syntax: Return an object from the function i.e., the module
    return{     
        
        
        
        
        
        
        
        
        
        // We return an object
        getInput: function(){           //getInput is an object
            return{
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)         // String to Float
            };
        },













        // Add new item to the UI
        addListItem: function(obj, type){
            var html, newHtml, element;
            // Create HTML string with the placeholder text

            if (type === 'inc'){
                // Income
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }

            else if (type === 'exp'){
                // Expense
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }

            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },












        deleteListItem: function(selectorID){

            /*
                node.removeChild(node)
            */
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },












        // To clear the input fields after each entry
        clearFields: function(){
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            /* 
            1. querySelectorAll returns a LIST
            2. We need to convert into an array.
            3. array method ->  .slice()
            4. To return the copy of the array that it's called on.

            5. But we cannot implement using:
                fields.slice();
            6. Instead we use the syntax given below.
            */
            fieldsArr = Array.prototype.slice.call(fields);

            /*
            1. Syntax forEach:
                arr.forEach(callback(currentValue [, index [, array]])[, thisArg])

            2. callback:
                Function to execute on each element
            
            3. currentValue: 
                The current element being processed in the array
            
            4. index: [OPTIONAL]
                The index of the currentValue in the array

            5. array: [OPTIONAL]
                The array forEach was called upon.
            */
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });

            fieldsArr[0].focus();

        },











        displayBudget: function(obj){

            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            

            if(obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }

            else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },


        









        // Method to display the percentages of expenses besides the respective expenses
        displayPercentages: function(percentages){

            /*
                Reason we used the querySelectorAll():
                    1. We have to select all the elements which have the 'item__percentage' class
                    2. We don't know how many expense item would be on the list.
                    3. We cannot use the querySelector() because that only selects the first one.
                    4. So we need to use the querySelectorAll().
            */
            var fields = document.querySelectorAll(DOMStrings.expensePercLabel);        // This will return a node List


            /*  
                1. We need to loop over all of these elements in our querySelectorAll() / Nodes that contains the item__percentage class.
                2. Then we need to change the textContent property for all of them.


                Lists / NodeList does NOT have the property '.forEach'

                But... Lists / NodeList have '.length' property
            */
            //array.forEach(function(currentValue, index, arr), thisValue)

            

            // Call the function 
            nodeListForEach(fields, function(current, index){               // function(current, index) => callback(list[i], i)
                if (percentages[index] > 0){
                    current.textContent = percentages[index] + '%';    // current -> document.querySelectorAll(DOMStrings.expensePercLabel)
                }
                else {
                    current.textContent = '---';
                }
            });
        },













        // Method for displaying the current month
        displayMonth: function(){
            var now, year, month, monthArr;

            now = new Date();
            //var christmas = new Date(2020, 12, 25);

            monthArr = ['January', ' Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month = now.getMonth();                                           // Return the current month (For Example: 6)


            // getFullYear is a method, so we have to call it by getFullYear()
            year = now.getFullYear();                                        // Return the current year (For Example: 2020)
            
            // monthArr[month] => monthArr[6] => June
            document.querySelector(DOMStrings.dateLabel).textContent = monthArr[month] + ' ' + year;


        },













        changedType: function(){

            var fields = document.querySelectorAll(
                
                DOMStrings.inputType + ',' + 
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');


        },






        // Exposing the private DOMStrings method to public to be accessed by another module
        getDOMStrings: function(){
            return DOMStrings;
        }

    };

})();








































// GLOBAL APP CONTROLLER MODULE
var controller = (function(budgetCtrl, UICtrl){









    var setUpEventListeners = function(){
        
        // Accessing the Private DOMStrings method from the UI controller which was exposed  
        var DOM = UICtrl.getDOMStrings();
        
        //ctrlAddItem is the callback function
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);


        // If the user wants to press enter and continue rather than clicking on the tick mark button
        document.addEventListener('keypress', function(event){

            //console.log(event);

            if (event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        //ctrlDeleteItem is the callback function
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        //changedType is the callback function
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    
    };












    // Called each time we enter a new item in the user Interface
    var updateBudget = function(){

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();


        // 2. Method to Return the budget
        /*
        var1 <- method that returns budget
        */
       var budget = budgetCtrl.getBudget();


        // 3. Display the budget on the user interface
        /*
        Display : Pass on var1
        */
        UICtrl.displayBudget(budget);

    };













    var updatePercentages= function(){


        // Calculate the percentages
        budgetCtrl.calculatePercentages();
        

        // Read the percentages from the Budget Controller
        var percentages = budgetCtrl.getPercentage();

        
        
        // Update the new Percentages in the UI
        UICtrl.displayPercentages(percentages);
    };













    // Add Item
    var ctrlAddItem = function(){
        var input, newItem;


        // 1. Get the field input Data
        input = UICtrl.getInput();


        if (input.description !== "" && !isNaN(input.value) && input.value > 0){

            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            
            // 3. Add the item to the UI Controller
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate an update Budget
            updateBudget();

            // 6. Calculate and Update the Percentages
            updatePercentages();


        }
    };













    // Delete Item
    var ctrlDeleteItem = function(){
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){

            //inc-1
            splitID = itemID.split('-');

            type = splitID[0];
            ID = parseInt(splitID[1]);


            // 1. Delete the Item from the Data Structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the Item from UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new Budget
            updateBudget();

            // 4. Calculating and updating the Percentages
            updatePercentages();
        }

    }









    // It runs each time our application starts
    // Public Initialisation Block
    return{
        init: function(){
            console.log('Application has Started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc : 0,
                totalExp : 0,
                percentage : -1
            });
            setUpEventListeners();
        }
    };









    
})(budgetController, UIController);








// called the Initialisation block at the very start of the application
controller.init();





