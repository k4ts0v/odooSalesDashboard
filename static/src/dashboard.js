/** @odoo-module **/

import { Component, onWillStart, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Layout } from "@web/search/layout";
import { useService } from "@web/core/utils/hooks";
import { DashboardItem } from "./dashboardItem";
import { ChartRenderer } from "./chartRenderer";

export class AwesomeDashboard extends Component {
    static template = "awesome_dashboard.AwesomeDashboard";
    static components = { Layout, DashboardItem, ChartRenderer };

    setup() {
        this.orm = useService("orm");
        this.action = useService("action");

        // Use useState to create a reactive state for the dataset
        this.dataset = useState({
            average_quantity: 0,
            average_time: "0 days",
            nb_new_orders: 0,
            nb_cancelled_orders: 0,
            total_amount: 0,
            orders_by_size: { s: 0, m: 0, xl: 0 },
        });

        onWillStart(async () => {
            try {
                this.generateRandomData();
                console.log("Getting data from the model...");
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
                
                if (data && data.length > 0) {
                    console.log("There is data available for the dashboard.");
                    const record = data[0];

                    // Update the dataset state with the fetched data
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

    async generateRandomData() {
    try {
        // Try to get session ID from the global window object
        const sessionId = window.session_id;  // session_id is usually available globally
        if (!sessionId) {
            console.error("Session ID is missing.");
            return;
        }

        const response = await fetch('/generate_random_dashboard_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionId}`  // Use the session ID directly from the window
            },
            body: JSON.stringify({})  // No need to pass data, we're just triggering the backend process
        });

        const data = await response.json();
        if (data.status === "success") {
            console.log("Random data generated successfully.");
            await this.loadData();  // Refresh the data after generation
        } else {
            console.error("Error generating data:", data.message);
        }
    } catch (error) {
        console.error("Failed to generate random data:", error);
    }
}


    openCustomers() {
        this.action.doAction("base.action_partner_form");
    }

    openLeads() {
        this.action.doAction({
            type: "ir.actions.act_window",
            name: "All leads",
            res_model: "crm.lead",
            views: [[false, "list"], [false, "form"]],
        });
    }
}

registry.category("actions").add("awesome_dashboard.dashboard", AwesomeDashboard);
