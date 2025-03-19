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
                const result = await this.orm.call("/awesome_dashboard/statistics", {});
                if (result) {
                    Object.assign(this.dataset, result);
                }
            } catch (error) {
                //console.error("Failed to fetch dashboard data:", error);
            }
        });
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