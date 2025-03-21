/** @odoo-module **/

import { Component, onWillStart, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Layout } from "@web/search/layout";
import { useService } from "@web/core/utils/hooks";
import { DashboardItem } from "./dashboardItem";
import { ChartRenderer } from "./chartRenderer";

export class AwesomeDashboard extends Component {
    // Define the template for the AwesomeDashboard component
    static template = "awesome_dashboard.AwesomeDashboard";
    
    // Register child components that will be used within this component's template
    static components = { Layout, DashboardItem, ChartRenderer };

    setup() {
        // Use the ORM service to interact with Odoo's model system and fetch data
        this.orm = useService("orm");

        // Use the RPC service for making RPC calls
        this.rpc = useService("rpc");

        // Use the action service to perform actions such as opening windows, form views, etc.
        this.action = useService("action");

        // Create a reactive state object using useState for holding various dashboard data values
        this.dataset = useState({
            cancelled_orders: 0,
            average_processing_time: "0 hours",
            new_orders: 0,
            total_revenue: 0,
            average_quantity: 0,
        });

        // Store the selected time period (default: none)
        this.selectedPeriod = "";  // Plain string, not reactive

        // Bind the onPeriodChange method to the component instance
        this.onPeriodChange = this.onPeriodChange.bind(this);

        // The onWillStart lifecycle hook is executed before the component is mounted
        // It is used to initialize or fetch data before rendering the component
        onWillStart(async () => {
            await this.fetchDashboardData(this.selectedPeriod);
        });
    }

    /**
     * Fetch all dashboard data for the selected period.
     */
    async fetchDashboardData(period) {
        try {
            // Fetch metrics (cancelled orders, average processing time, new orders, total revenue, average quantity)
            const metrics = await this.orm.call("dashboard.data", "fetch_metrics", [period]);
            this.dataset.cancelled_orders = metrics.cancelled_orders;
            this.dataset.average_processing_time = metrics.average_processing_time.toFixed(2) + " hours";
            this.dataset.new_orders = metrics.new_orders;
            this.dataset.total_revenue = metrics.total_revenue;
            this.dataset.average_quantity = metrics.average_quantity.toFixed(2);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        }
    }

    /**
     * Handle time period change (e.g., when the user selects a new period).
     */
    async onPeriodChange(period) {
        const periodLabels = {
            "none": "Last period",
            "month": "This month",
            "3months": "Last 3 months",
            "week": "This week",
            "year": "This year",
        };
    
        // // Update selected period and its label immediately before making the RPC call
        this.selectedPeriod = period || "period";
        this.selectedPeriodLabel = periodLabels[period] || "period";
    
        try {
            // Fetch updated metrics
            const data = await this.rpc("/dashboard/metrics", {
                period: period,
            });
    
            // Update dashboard with the new data
            this.updateDashboard(data);
        } catch (error) {
            console.error("Failed to fetch metrics:", error);
        }
    }
    

    /**
     * Update the dashboard with new data.
     */
    updateDashboard(data) {
        this.dataset.cancelled_orders = data.cancelled_orders;
        this.dataset.average_processing_time = data.average_processing_time.toFixed(2) + " hours";
        this.dataset.new_orders = data.new_orders;
        this.dataset.total_revenue = data.total_revenue.toFixed(2);
        this.dataset.average_quantity = data.average_quantity.toFixed(2);
    }
}

// Register the AwesomeDashboard class as an action in Odoo
registry.category("actions").add("awesome_dashboard.dashboard", AwesomeDashboard);