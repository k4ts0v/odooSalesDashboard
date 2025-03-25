# -*- coding: utf-8 -*-
{
    'name': "Sales Dashboard",

    'summary': """
        Dashboard for viewing sales statistics, with KPI and graphs.
    """,

    'description': """
        Dashboard for viewing sales statistics, with KPI and graphs.
    """,

    'author': "Lucas Villa",
    'website': "https://www.odoo.com/",
    'category': 'Dashboards/SalesDashboard',
    'version': '0.1',
    'application': True,
    'installable': True,
    'depends': ['base', 'web', 'sales'],

    'data': [
        'views/views.xml',
        'security/ir.model.access.csv',
    ],
    'assets': {
        'web.assets_backend': [
            'sales_dashboard/static/src/**/*',
        ],
    },
    'license': 'AGPL-3'
}
