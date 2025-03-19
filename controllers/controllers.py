# -*- coding: utf-8 -*-

import logging
from odoo import http
from odoo.http import request

logger = logging.getLogger(__name__)

class AwesomeDashboard(http.Controller):
    @http.route('/awesome_dashboard/statistics', type='json', auth='public')
    def get_statistics(self):
        """
        Returns a dict of statistics about the orders:
            'average_quantity': the average number of t-shirts by order
            'average_time': the average time (in hours) elapsed between the
                moment an order is created, and the moment is it sent
            'nb_cancelled_orders': the number of cancelled orders, this month
            'nb_new_orders': the number of new orders, this month
            'total_amount': the total amount of orders, this month
        """
        try:
            # Fetch data from the dashboard.data model
            logger.debug("The /awesome_dashboard/statistics route is being called")
            data = request.env["dashboard.data"].get_statistics()
            logger.info("Fetched statistics data: %s", data)
            return data  # Return the data as JSON
        except Exception as e:
            logger.error("Error fetching statistics: %s", e)
            return {
                'error': 'Failed to fetch statistics',
                'average_quantity': 0,
                'average_time': "0 days",
                'nb_new_orders': 0,
                'nb_cancelled_orders': 0,
                'total_amount': 0,
                'orders_by_size': { "s": 0, "m": 0, "xl": 0 },
            }