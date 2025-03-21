/** @odoo-module **/

import { registry } from "@web/core/registry";
import { loadJS } from "@web/core/assets";
import { useService } from "@web/core/utils/hooks";
import { Component, onWillStart, useRef, useState, onMounted } from "@odoo/owl";

export class ChartRenderer extends Component {
    // Defining the template for the component, which is expected to be a reference to an HTML canvas element
    static template = "awesome_dashboard.chartRenderer";
    
    // Define the component's properties, with chartType having a default value of "bar" (this can be passed as an argument)
    static props = {
        chartType: { type: String, optional: true, default: "bar" },
    };

    setup() {
        // Create a reference to the canvas element for rendering the chart
        this.chartRef = useRef("chart");

        // Define a reactive state for the dataset, initially setting the values to zero
        this.dataset = useState({
            orders_by_size: { s: 0, m: 0, xl: 0 },
        });

        // Use the ORM service to interact with the Odoo model
        this.orm = useService("orm");

        // This lifecycle hook runs before the component is mounted. We use it to load the chart data and external JS libraries.
        onWillStart(async () => {
            // Load the data for the chart
            await this.loadData();

            // Check if Chart.js is loaded, if not, load it dynamically from a CDN
            if (!window.Chart) {
                await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js");
            }
        });

        // The onMounted lifecycle hook runs once the component is fully mounted in the DOM.
        // It triggers the chart rendering process after the component is ready.
        onMounted(() => {
            this.renderChart(); // Calls renderChart to actually draw the chart on the canvas.
        });
    }

    // This method fetches the required data for rendering the chart from the Odoo model "dashboard.data"
    async loadData() {
        try {
            // Fetch data from the "dashboard.data" model using ORM's searchRead method. 
            // We're retrieving the fields for order sizes (S, M, XL).
            const data = await this.orm.searchRead("dashboard.data", [], [
                "orders_by_size_s",
                "orders_by_size_m",
                "orders_by_size_xl"
            ]);

            console.log("Chart data:", data);

            // If data is available, update the dataset state with values for each order size.
            if (data && data.length > 0) {
                const record = data[0];
                this.dataset.orders_by_size = {
                    s: record.orders_by_size_s || 0,
                    m: record.orders_by_size_m || 0,
                    xl: record.orders_by_size_xl || 0
                };
            } else {
                // If no data was returned, set default values for the dataset
                this.dataset.orders_by_size = { s: 0, m: 0, xl: 0 }; 
            }
        } catch (error) {
            console.error("Failed to fetch chart data:", error);
            // In case of an error, set the dataset to default values
            this.dataset.orders_by_size = { s: 0, m: 0, xl: 0 };
        } finally {
            // Once the data has been processed (either successfully fetched or failed), render the chart
            this.renderChart();  
        }
    }

    // This method is responsible for rendering the chart using Chart.js
    renderChart() {
        const canvas = this.chartRef.el;  // Reference to the canvas element
        if (!canvas || !window.Chart) return;  // Ensure the canvas and Chart.js are available

        // Destroy any previous chart instance to avoid overlapping charts (i.e., clear old charts)
        if (this.chart) this.chart.destroy(); 

        // Create a new chart instance and render it on the canvas
        this.chart = new Chart(canvas.getContext("2d"), {
            type: this.props.chartType, // The chart type (e.g., bar, line) can be passed as a prop
            data: {
                labels: ["S", "M", "XL"],  // Labels for the chart (size categories for the orders)
                datasets: [{
                    label: "Orders by Size",  // Label for the dataset
                    data: [
                        this.dataset.orders_by_size.s, // S size orders
                        this.dataset.orders_by_size.m, // M size orders
                        this.dataset.orders_by_size.xl, // XL size orders
                    ],  // The data to plot on the chart
                    backgroundColor: ["blue", "green", "red"], // Colors for each bar in the chart
                    hoverOffset: 4,  // The offset when hovering over the bars
                }],
            },
            options: {
                responsive: true, // Makes the chart responsive to window resizing
                plugins: {
                    legend: { position: "bottom" } // Positions the chart legend at the bottom
                },
            },
        });
    }
}
