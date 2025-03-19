/** @odoo-module **/

import { registry } from "@web/core/registry";
import { loadJS } from "@web/core/assets";
import { useService } from "@web/core/utils/hooks";
import { Component, onWillStart, useRef, useState, onMounted } from "@odoo/owl";
import { rpc } from "@web/core/network/rpc";

export class ChartRenderer extends Component {
    static template = "awesome_dashboard.chartRenderer";
    
    
    static props = {
        chartType: { type: String, optional: false },
    };

    setup() {
        this.chartRef = useRef("chart");
        this.dataset = useState({
            ordersBySize: { s: 0, m: 0, xl: 0 },
        });

        this.orm = useService("orm");

        onWillStart(async () => {
            await this.loadData();
            if (!window.Chart) {
                await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js");
            }
        });

        onMounted(() => {
            this.renderChart();
        });
    }

    async loadData() {
        try {
            // Fetch data from the controller.
            const data = await this.orm.call("dashboard.data", "get_statistics", []);
            if (data) {
                this.dataset.ordersBySize = data.orders_by_size || { s: 0, m: 0, xl: 0 };
            } else {
                console.log(data)
            }
        } catch (error) {
            console.error("Failed to fetch chart data:", error);
            this.dataset.ordersBySize = { s: 0, m: 0, xl: 0 };  // Use default data if fetch fails
        } finally {
            this.renderChart();  // Ensure the chart is rendered even if the data is unavailable
        }
    }

    renderChart() {
        const canvas = this.chartRef.el;
        if (!canvas || !window.Chart) return;

        if (this.chart) this.chart.destroy(); // Clear previous instance

        // Use the dynamic chartType prop passed from XML
        this.chart = new Chart(canvas.getContext("2d"), {
            type: this.props.chartType, 
            data: {
                labels: ["S", "M", "XL"],
                datasets: [{
                    label: "Orders by Size",
                    data: [
                        this.dataset.ordersBySize.s,
                        this.dataset.ordersBySize.m,
                        this.dataset.ordersBySize.xl,
                    ],
                    backgroundColor: ["blue", "green", "red"],
                    hoverOffset: 4,
                }],
            },
            options: {
                responsive: true,
                plugins: { legend: { position: "bottom" } },
            },
        });
    }
}