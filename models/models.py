import random
from odoo import models, fields, api

class dashboard(models.Model):
    _name = "dashboard.data"
    _description = "Dashboard Data"

    average_quantity = fields.Float("Average Quantity", default=0)
    average_time = fields.Char("Average Time", default="0 days")
    nb_new_orders = fields.Integer("New Orders", default=0)
    nb_cancelled_orders = fields.Integer("Cancelled Orders", default=0)
    total_amount = fields.Float("Total Amount", default=0)
    orders_by_size_s = fields.Integer("Orders Size S", default=0)
    orders_by_size_m = fields.Integer("Orders Size M", default=0)
    orders_by_size_xl = fields.Integer("Orders Size XL", default=0)

    @api.model
    def get_statistics(self):
        """Fetch statistics data from the database."""
        record = self.search([], limit=1)
        if record:
            result = {
                "average_quantity": record.average_quantity,
                "average_time": record.average_time,
                "nb_new_orders": record.nb_new_orders,
                "nb_cancelled_orders": record.nb_cancelled_orders,
                "total_amount": record.total_amount,
                "orders_by_size": {
                    "s": record.orders_by_size_s,
                    "m": record.orders_by_size_m,
                    "xl": record.orders_by_size_xl,
                },
            }
            print("Result from get_statistics:", result)  # Log for debugging
            return result
        return {
            "average_quantity": 0,
            "average_time": "0 days",
            "nb_new_orders": 0,
            "nb_cancelled_orders": 0,
            "total_amount": 0,
            "orders_by_size": { "s": 0, "m": 0, "xl": 0 },
    }

    
    @api.model
    def generate_random_data(self):
        """Generate random data for the dashboard"""
        self.create({
            'average_quantity': random.randint(4, 12),
            'average_time': f"{random.randint(1, 10)} days",
            'nb_cancelled_orders': random.randint(0, 50),
            'nb_new_orders': random.randint(10, 200),
            'orders_by_size_s': random.randint(0, 150),
            'orders_by_size_m': random.randint(0, 150),
            'orders_by_size_xl': random.randint(0, 150),
            'total_amount': random.randint(100, 1000)
        })

    @api.model
    def init_random_data(self):
        """This method will be called when the module is loaded or reloaded"""
        # Ensure that any previous random data is deleted first (optional)
        self.search([]).unlink()
        # Generate new random data
        self.generate_random_data()
