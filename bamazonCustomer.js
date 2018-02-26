var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require("console.table");
var productArray = [];
var connection = mysql.createConnection({
    host: "35.224.16.152",
    port: 3306,

    user: "yoelchristian",
    password: "yoelyoel",
    database: "bamazon_db"
});

console.log("==== Welcome to Bamazon Marketplace ====");
connection.query("SELECT * FROM products", function(error, result){
    if(error) {
        console.log(error);
    }
    for(var i = 0; i < result.length; i++) {
        var tempArray = [];
        tempArray.push(result[i].item_id);
        tempArray.push(result[i].product_name);
        tempArray.push("$" + result[i].price);
        productArray.push(tempArray);
    }

    console.table(["Item ID", "Item Name", "Price"], productArray);
    customerPrompt();
    function customerPrompt() {
        inquirer.prompt([
        {
            type: "input",
            message: "Enter the item ID that you would like to purchase: ",
            name: "itemId"
        },
        {
            type: "input",
            message: "Enter the quantity of the item: ",
            name: "itemQty"
        }
    ]).then(function(iResponse) {
        connection.query("SELECT * FROM products WHERE ?",
        {
            item_id: iResponse.itemId,
        },
        function(err, res) {
            if(err) {
                console.log(err);
            }
            if(!res.length) {
                console.log("Item ID not found!");
                customerPrompt();
            } else {
                console.log("You have selected: " + res[0].product_name);
                if(res[0].stock_quantity >= iResponse.itemQty) {
                    console.log("Quantity: " + iResponse.itemQty);
                    inquirer.prompt([
                        {
                        type: "confirm",
                        message: "Please confirm your purchase",
                        name: "confirm",
                        default: true
                        },
                    ])
                    .then(function() {
                        connection.query("UPDATE products SET ? WHERE ?", [
                            {
                                stock_quantity: res[0].stock_quantity - iResponse.itemQty,
                            },
                            {
                                item_id: iResponse.itemId,
                            }
                        ], function(error, result) {
                            if(error) {
                                console.log(error);
                            }
                        }); 
                        console.log("Purchase Successful");
                        console.log("Total amount: $" + parseFloat(Number(iResponse.itemQty)*Number(res[0].price)).toFixed(2));
                    });
                }
                else {
                    console.log("Sorry we currently do not have that many in our stock");
                    console.log("Stock remaining for this item: " + res[0].stock_quantity);
                    customerPrompt();
                }
            }
        })
    })
    }
})
