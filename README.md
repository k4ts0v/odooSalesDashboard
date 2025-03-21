# Sales Dashboard Odoo Module

The **Sales Dashboard** is an Odoo module designed to provide a comprehensive overview of your sales performance. It tracks key sales metrics and displays them in an easy-to-understand dashboard, helping you make data-driven decisions. The module offers useful statistics such as average order processing time, new and cancelled orders, and total revenue for different time periods (week, month, 3 months, and year). Additionally, it provides visual graphs to analyze top-performing products and sales trends over time.

## Key Features

### **1. Sales Metrics**

- **Average Order Processing Time**: Track the average time taken to process orders.
    
- **New Orders**: Monitor the number of new orders placed.
    
- **Cancelled Orders**: Keep an eye on the number of cancelled orders.
    
- **Total Revenue**: View the total revenue generated for the selected period (week, month, 3 months, or year).
    

### **2. Visual Graphs**

- **Top Products**: A graph displaying the top 3 products by quantity sold.
    
- **Sales Over Time**: A graph showing sales trends over the selected period (daily or monthly).
    

### **3. Time Periods**

- **This week**: View metrics and graphs for this week.
    
- **THis month**: View metrics and graphs for this month.
    
- **Last 3 months**: View metrics and graphs for the last 3 months.
    
- **This year**: View metrics and graphs for the current year.

## Installation Steps

Follow these steps to install and use the Sales Dashboard module in your Odoo instance:

### **Step 1: Clone the Repository**

Clone the repository containing the Sales Dashboard module to your local machine.

```bash
git clone https://github.com/k4ts0v/odooSalesDashboard.git
```

### **Step 2: Copy the Module to the Addons Path**

Copy the `sales_dashboard` module folder to your Odoo addons directory. This is typically where other custom or third-party addons are stored.

Example:

```bash
cp -r sales_dashboard /path/to/odoo/addons/
```
### **Step 3: Update the App List**

1. Log in to your Odoo instance as an administrator.
    
2. Go to **Apps** > **Update Apps List**.
    
3. Click **Update** to refresh the list of available modules.
    

### **Step 4: Install the Module**

1. In the Odoo Apps menu, search for **Sales Dashboard**.
    
2. Click **Install** to enable the module.

### **Step 5: Access the Sales Dashboard**

Once installed, you can access the Sales Dashboard by navigating to:

- **Sales** > **Dashboard** (or a similar menu item, depending on your Odoo version).

## Usage

### **1. View Sales Metrics**

- Select a time period (Last Week, Last Month, Last 3 Months, or Last Year) from the dropdown or buttons.
    
- The dashboard will display key metrics such as:
    
    - Average Order Processing Time
        
    - New Orders
        
    - Cancelled Orders
        
    - Total Revenue
        

### **2. Analyze Top Products**

- The **Top Products** graph shows the top 3 products by quantity sold for the selected period.
    
- Hover over the graph to see the exact quantity sold for each product.
    

### **3. Track Sales Over Time**

- The **Sales Over Time** graph displays sales trends for the selected period.
    
- For weekly and monthly views, the graph shows daily sales.
    
- For yearly views, the graph shows monthly sales.
  

## Customization

The Sales Dashboard module is designed to be flexible and can be customized to suit your business needs. You can:

- Add additional metrics or graphs.
    
- Modify the time periods or date ranges.
    
- Integrate with other Odoo modules (e.g., inventory, CRM).
## Demo
![Demo animation](./assets/demo.gif?raw=true)
