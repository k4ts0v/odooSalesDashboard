/** @odoo-module **/

import { Component, onWillStart, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Layout } from "@web/search/layout";
import { useService } from "@web/core/utils/hooks";
import { DashboardItem } from "./dashboardItem";  // A custom component for dashboard items (assumed to be defined)
import { ChartRenderer } from "./chartRenderer";  // A custom component for rendering charts (assumed to be defined)

export class AwesomeDashboard extends Component {
    // Define the template for the AwesomeDashboard component
    static template = "awesome_dashboard.AwesomeDashboard";
    
    // Register child components that will be used within this component's template
    static components = { Layout, DashboardItem, ChartRenderer };

    setup() {
        // Use the ORM service to interact with Odoo's model system and fetch data
        this.orm = useService("orm");

        // Use the action service to perform actions such as opening windows, form views, etc.
        this.action = useService("action");

        // Create a reactive state object using useState for holding various dashboard data values
        this.dataset = useState({
            average_quantity: 0,
            average_time: "0 days",
            nb_new_orders: 0,
            nb_cancelled_orders: 0,
            total_amount: 0,
            orders_by_size: { s: 0, m: 0, xl: 0 },
        });

        // The onWillStart lifecycle hook is executed before the component is mounted
        // It is used to initialize or fetch data before rendering the component
        onWillStart(async () => {
            try {
                // Generate random data (possibly as a placeholder or example data)
                this.generateRandomData();
                console.log("Getting data from the model...");

                // Fetch real data from the model "dashboard.data" using ORM's searchRead method
                const data = await this.orm.searchRead("dashboard.data", [], [
                    "average_quantity",
                    "average_time",
                    "nb_new_orders",
                    "nb_cancelled_orders",
                    "total_amount",
                    "orders_by_size_s",
                    "orders_by_size_m",
                    "orders_by_size_xl"
                ]);
                console.log(data);
                
                // If data is returned, update the dataset state with the fetched values
                if (data && data.length > 0) {
                    console.log("There is data available for the dashboard.");
                    const record = data[0];

                    // Update the state with the actual values fetched from the database
                    this.dataset = {
                        average_quantity: record.average_quantity || 0,
                        average_time: record.average_time || "0 days",
                        nb_new_orders: record.nb_new_orders || 0,
                        nb_cancelled_orders: record.nb_cancelled_orders || 0,
                        total_amount: record.total_amount || 0,
                        orders_by_size: {
                            s: record.orders_by_size_s || 0,
                            m: record.orders_by_size_m || 0,
                            xl: record.orders_by_size_xl || 0
                        },
                    };
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            }
        });
    }

    // This function generates random data by triggering a backend endpoint '/generate_random_dashboard_data'
    async generateRandomData() {
        try {
            // Try to get session ID from the global window object
            const sessionId = window.session_id;  // session_id is usually available globally in Odoo
            if (!sessionId) {
                console.error("Session ID is missing.");
                return;
            }

            // Send a POST request to the backend to generate random data for the dashboard
            const response = await fetch('/generate_random_dashboard_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionId}`  // Use the session ID directly from the window
                },
                body: JSON.stringify({})  // Empty body as we just want to trigger the backend action
            });

            // Parse the JSON response
            const data = await response.json();
            if (data.status === "success") {
                console.log("Random data generated successfully.");
                await this.loadData();  // Refresh the dashboard data after generation
            } else {
                console.error("Error generating data:", data.message);
            }
        } catch (error) {
            console.error("Failed to generate random data:", error);
        }
    }

    // These methods are used to open forms or views from other models such as customers or leads
    openCustomers() {
        this.action.doAction("base.action_partner_form");  // Opens the partner form (customers)
    }

    openLeads() {
        this.action.doAction({
            type: "ir.actions.act_window",
            name: "All leads",
            res_model: "crm.lead",  // Opens the CRM leads model in list and form view
            views: [[false, "list"], [false, "form"]],
        });
    }
}

// Register the AwesomeDashboard class as an action in Odoo
registry.category("actions").add("awesome_dashboard.dashboard", AwesomeDashboard);