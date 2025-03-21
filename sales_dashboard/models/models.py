from odoo import models, fields, api
from datetime import datetime, timedelta
import random
import logging

_logger = logging.getLogger(__name__)

class DashboardData(models.Model):
    _name = "dashboard.data"
    _description = "Dashboard Data"


    cancelled_orders = fields.Integer("Cancelled orders", default=0)
    average_processing_time = fields.Char("Average processing time", default="0 hours")
    new_orders = fields.Integer("New orders", default=0)
    average_quantity = fields.Float("Average quantity", default=0)
    total_amount = fields.Float("Total amount", default=0)

    def _get_date_range(self, period):
        """
        Get the start and end dates based on the selected period.
        - period: 'month', '3months', 'week', 'year'
        """
        end_date = datetime.now()
        if period == 'month':
            start_date = end_date.replace(day=1)
        elif period == '3months':
            start_date = (end_date - timedelta(days=90)).replace(day=1)
        elif period == 'week':
            start_date = end_date - timedelta(days=end_date.weekday())
        elif period == 'year':
            start_date = end_date.replace(month=1, day=1)
        else:
            raise ValueError("Invalid period specified" + period)

        return start_date, end_date

    @api.model
    def fetch_metrics(self, period):
        """
        Fetch metrics for the selected period.
        - period: 'month', '3months', 'week', 'year'
        """
        # Define the start and end dates based on the period
        end_date = datetime.now()
        if period == 'month':
            start_date = end_date.replace(day=1)
        elif period == '3months':
            start_date = (end_date - timedelta(days=90)).replace(day=1)
        elif period == 'week':
            start_date = end_date - timedelta(days=end_date.weekday())
        elif period == 'year':
            start_date = end_date.replace(month=1, day=1)
        else:
            raise ValueError("Invalid period specified")

        # Fetch orders for the specified period
        orders = self.env['sale.order'].search([
            ('date_order', '>=', start_date),
            ('date_order', '<=', end_date),
        ])

        # Initialize variables for calculations
        cancelled_orders = 0
        total_processing_time = 0
        new_orders = 0
        total_revenue = 0
        total_quantity = 0
        total_orders = len(orders)

        # Calculate metrics
        for order in orders:
            # Number of cancelled orders
            if order.state == 'cancel':
                cancelled_orders += 1

            # Processing time (for cancelled or done orders)
            if order.state in ['cancel', 'done']:
                create_date = fields.Datetime.to_datetime(order.create_date)
                write_date = fields.Datetime.to_datetime(order.write_date)
                if create_date and write_date:
                    processing_time = (write_date - create_date).total_seconds() / 3600  # In hours
                    total_processing_time += processing_time

            # Number of new orders
            if order.state == 'sale':
                new_orders += 1

            # Total revenue
            total_revenue += order.amount_total

            # Total quantity of items
            for line in order.order_line:
                total_quantity += line.product_uom_qty

        # Calculate averages
        average_processing_time = total_processing_time / total_orders if total_orders > 0 else 0
        average_quantity = total_quantity / total_orders if total_orders > 0 else 0

        # Return the metrics
        return {
            'cancelled_orders': cancelled_orders,
            'average_processing_time': average_processing_time,
            'new_orders': new_orders,
            'total_revenue': total_revenue,
            'average_quantity': average_quantity,
        }

    @api.model
    def fetch_top_products(self, period):
        """
        Fetch the top 3 products by quantity sold for the selected period.
        - period: 'month', '3months', 'week', 'year'
        """
        _logger.info("Entering fetch_top_products method")
        try:
            _logger.info(f"Fetching top products for period: {period}")
            start_date, end_date = self._get_date_range(period)
            _logger.info(f"Start date: {start_date}, End date: {end_date}")
            
            # Fetch product data from sale.order.line
            self.env.cr.execute("""
                SELECT product_id, SUM(product_uom_qty) as total_quantity
                FROM sale_order_line
                WHERE order_id IN (
                    SELECT id
                    FROM sale_order
                    WHERE date_order >= %s AND date_order <= %s
                )
                GROUP BY product_id
                ORDER BY total_quantity DESC
                LIMIT 3
            """, (start_date, end_date))
            top_products = self.env.cr.dictfetchall()

            _logger.info(f"Top products raw data: {top_products}")

            # Fetch product names
            product_data = []
            for product in top_products:
                product_record = self.env['product.product'].browse(product['product_id'])
                product_data.append({
                    'name': product_record.name,
                    'total_quantity': product['total_quantity'],
                })
                _logger.info(f"Product {product_record.name}: Total quantity = {product['total_quantity']}")

            _logger.info(f"Top products processed data: {product_data}")

            return product_data
        except Exception as e:
            _logger.error(f"Error in fetch_top_products: {e}")
            raise

    @api.model
    def fetch_sales_over_time(self, period):
        """
        Fetch sales over time for the selected period.
        - period: 'month', '3months', 'week', 'year'
        """
        _logger.info(f"Fetching metrics for period: {period}")
        start_date, end_date = self._get_date_range(period)
        _logger.info(f"Fetching metrics for period: {period}")
        # Fetch orders for the specified period
        orders = self.env['sale.order'].search([
            ('date_order', '>=', start_date),
            ('date_order', '<=', end_date),
        ])

        # Group sales by period
        sales_data = {}
        for order in orders:
            if period == 'month':
                key = order.date_order.strftime('%Y-%m-%d')  # Daily
            elif period == '3months':
                key = order.date_order.strftime('%Y-%m-%d')  # Daily
            elif period == 'week':
                key = order.date_order.strftime('%Y-%m-%d')  # Daily
            elif period == 'year':
                key = order.date_order.strftime('%Y-%m')  # Monthly

            if key not in sales_data:
                sales_data[key] = 0
            sales_data[key] += order.amount_total

        # Convert to a list of dictionaries for the chart
        chart_data = [{'period': period, 'amount': amount} for period, amount in sales_data.items()]
        return chart_data
