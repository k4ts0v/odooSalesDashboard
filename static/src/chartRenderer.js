/** @odoo-module **/

import { registry } from "@web/core/registry";
import { loadJS } from "@web/core/assets";
import { useService } from "@web/core/utils/hooks";
import { Component, onWillStart, useRef, useState, onMounted } from "@odoo/owl";

export class ChartRenderer extends Component {
    static template = "awesome_dashboard.chartRenderer";
    
    // Make chartType a prop with default value of 'bar'
    static props = {
        chartType: { type: String, optional: true, default: "bar" },
    };

    setup() {
        this.chartRef = useRef("chart");
        this.dataset = useState({
            orders_by_size: { s: 0, m: 0, xl: 0 },
        });

        // Access the ORM service
        this.orm = useService("orm");

        onWillStart(async () => {
            await this.loadData();
            // Load Chart.js library if not already available
            if (!window.Chart) {
                await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js");
            }
        });

        onMounted(() => {
            this.renderChart(); // Render the chart once component is mounted
        });
    }

    // Method to fetch data for the chart
    async loadData() {
        try {
            // Fetch data from the dashboard.data model using the ORM
            const data = await this.orm.searchRead("dashboard.data", [], [
                "orders_by_size_s",
                "orders_by_size_m",
                "orders_by_size_xl"
            ]);

            console.log("Chart data:", data);
            if (data && data.length > 0) {
                const record = data[0];
                this.dataset.orders_by_size = {
                    s: record.orders_by_size_s || 0,
                    m: record.orders_by_size_m || 0,
                    xl: record.orders_by_size_xl || 0
                };
            } else {
                this.dataset.orders_by_size = { s: 0, m: 0, xl: 0 }; // Use default data if no data is found
            }
        } catch (error) {
            console.error("Failed to fetch chart data:", error);
            this.dataset.orders_by_size = { s: 0, m: 0, xl: 0 }; // Use default data if fetch fails
        } finally {
            this.renderChart();  // Ensure the chart is rendered even if the data is unavailable
        }
    }

    // Method to render the chart
    renderChart() {
        const canvas = this.chartRef.el;
        if (!canvas || !window.Chart) return;

        // Destroy previous chart instance if it exists
        if (this.chart) this.chart.destroy(); 

        // Render the new chart
        this.chart = new Chart(canvas.getContext("2d"), {
            type: this.props.chartType, 
            data: {
                labels: ["S", "M", "XL"],  // Labels for the chart
                datasets: [{
                    label: "Orders by Size",
                    data: [
                        this.dataset.orders_by_size.s,
                        this.dataset.orders_by_size.m,
                        this.dataset.orders_by_size.xl,
                    ],  // Use dynamic data from the dataset
                    backgroundColor: ["blue", "green", "red"],
                    hoverOffset: 4,
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "bottom" }
                },
            },
        });
    }
}
