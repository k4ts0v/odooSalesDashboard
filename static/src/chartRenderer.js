/** @odoo-module **/

// Import necessary modules from the Odoo framework
import { registry } from "@web/core/registry" // Used for registering components and services in Odoo
import { loadJS } from "@web/core/assets" // Used to dynamically load JavaScript files (in this case, Chart.js)
import { useService } from "@web/core/utils/hooks" // Used to access Odoo services, such as ORM (Object-Relational Mapping)
import { Component, onWillStart, useRef, useState, useEffect } from "@odoo/owl" // Imports required hooks and base classes from the Odoo OWL framework

export class ChartRenderer extends Component {
    // Defining the template for the component, linking it to the corresponding XML view
    static template = "awesome_dashboard.chartRenderer"

    // Defining the properties that this component will accept
    static props = {
        chartType: { type: String, optional: true, default: "bar" }, // Type of chart (e.g., bar, line), default is "bar"
        dataType: { type: String, optional: false }, // Type of data to fetch (e.g., sales_over_time, top_products)
        period: { type: String, optional: false }, // The period to display data for (e.g., "Last Month", "Last 3 Months")
    }

    // `setup` function is the main place to initialize state, services, and lifecycle hooks
    setup() {
        this.chartRef = useRef("chart") // Using `useRef` to create a reference to the chart container (HTML element)

        // Using `useState` to manage local state for dataset, which will hold fetched data
        this.dataset = useState({
            sales_over_time: [],
            top_products: [],
        })

        // Accessing the ORM service, which provides methods to interact with the backend
        this.orm = useService("orm")

        // `onWillStart` hook ensures that the `loadData` function is called when the component is about to start
        onWillStart(async () => {
            await this.loadData() // Fetch data as soon as the component starts

            // If the Chart.js library is not already loaded, dynamically load it from a CDN
            if (!window.Chart) {
                await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js")
            }
        })

        // `useEffect` hook to reload the chart data whenever the `period` property changes
        useEffect(() => {
            this.loadData() // Fetch new data when `period` is updated
        }, () => [this.props.period]) // Dependency array ensures the effect runs only when `period` changes
    }

    // `loadData` fetches the data based on the `dataType` and `period`
    async loadData() {
        try {
            // Log the data fetching process for debugging
            console.log("Fetching data for:", this.props.dataType, "Period:", this.props.period)

            let data = [] // Initialize an empty array to hold the fetched data

            // Fetch the correct data based on the `dataType` prop (either sales_over_time or top_products)
            if (this.props.dataType === "sales_over_time") {
                // If the dataType is sales_over_time, call the backend method `fetch_sales_over_time`
                data = await this.orm.call("dashboard.data", "fetch_sales_over_time", [this.props.period])
            } else if (this.props.dataType === "top_products") {
                // If the dataType is top_products, call the backend method `fetch_top_products`
                data = await this.orm.call("dashboard.data", "fetch_top_products", [this.props.period])
            }

            // Log the fetched data for debugging
            console.log("Fetched Data:", data)

            // Check if the data is valid, throw an error if there was a problem
            if (!data || data.error) {
                throw new Error("Backend Error: " + (data.error || "No data received"))
            }

            // Store the fetched data in the component's state
            this.dataset[this.props.dataType] = data
            // Once data is available, render the chart
            this.renderChart()
        } catch (error) {
            // Log any errors that occurred during the data fetching process
            console.error("Failed to fetch chart data:", error)
        }
    }

    // This function handles the chart rendering process using Chart.js
    renderChart() {
        const canvas = this.chartRef.el // Access the canvas element through the `chartRef` reference

        // If the canvas or Chart.js is not available, return early and do not render the chart
        if (!canvas || !window.Chart) return

        // If a chart already exists, destroy it before creating a new one to avoid memory leaks
        if (this.chart) this.chart.destroy()

        let chartData // Initialize a variable to store the chart data configuration

        // Depending on the `dataType`, prepare the appropriate chart data structure
        if (this.props.dataType === "sales_over_time" && this.dataset.sales_over_time.length) {
            // If the dataType is "sales_over_time" and data is available, configure the chart data
            chartData = {
                labels: this.dataset.sales_over_time.map(item => item.period), // Extract labels (e.g., months)
                datasets: [{
                    label: "Sales Over Time", // The label for the dataset
                    data: this.dataset.sales_over_time.map(item => item.amount), // Extract sales amounts
                    backgroundColor: "rgba(75, 192, 192, 0.2)", // Set the background color of the bars
                    borderColor: "rgba(75, 192, 192, 1)", // Set the border color of the bars
                    borderWidth: 1, // Set the border width
                }],
            }
        } else if (this.props.dataType === "top_products" && this.dataset.top_products.length) {
            // If the dataType is "top_products" and data is available, configure the chart data
            chartData = {
                labels: this.dataset.top_products.map(item => item.name), // Extract product names as labels
                datasets: [{
                    label: "Top Products", // The label for the dataset
                    data: this.dataset.top_products.map(item => item.total_quantity), // Extract total quantities
                    backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(255, 206, 86, 0.2)"], // Set the background colors for each bar
                    borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)"], // Set the border colors for each bar
                    borderWidth: 1, // Set the border width
                }],
            }
        } else {
            // If no valid data is available, log an error and do not render the chart
            console.error("No valid data to render chart")
            return
        }

        // Create a new chart using the Chart.js library
        this.chart = new Chart(canvas.getContext("2d"), {
            type: this.props.chartType, // Use the chart type passed as a prop (e.g., bar, line)
            data: chartData, // Use the prepared chart data
            options: {
                responsive: true, // Ensure the chart is responsive (adjusts to screen size)
                plugins: {
                    legend: { position: "bottom" }, // Position the chart legend at the bottom
                },
            },
        })
    }
}
