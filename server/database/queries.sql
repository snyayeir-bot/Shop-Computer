-- =======================================================================
-- Required Analytical Queries & Reporting Scripts
-- =======================================================================

-- Query 1: Calculate net revenue and total units sold for a specific shop_id
-- Filters only completed/paid orders for exact accounting.
SELECT 
    oi.shop_id,
    s.shop_name,
    COUNT(DISTINCT oi.order_id) AS total_orders,
    SUM(oi.quantity) AS total_units_sold,
    SUM(oi.quantity * oi.price_each) AS gross_sales,
    SUM(oi.quantity * (oi.price_each - COALESCE(p.cost_price, 0))) AS net_estimated_profit
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN shops s ON oi.shop_id = s.id
JOIN products p ON oi.product_id = p.id
WHERE oi.shop_id = 1 
  AND o.payment_status = 'paid'
GROUP BY oi.shop_id, s.shop_name;


-- Query 2: Retrieve distinct customers who purchased from a specific seller with total spent
SELECT 
    u.id AS customer_id,
    u.name AS customer_name,
    u.email AS customer_email,
    u.phone AS customer_phone,
    COUNT(DISTINCT o.id) AS total_orders_placed,
    SUM(oi.quantity) AS total_items_purchased,
    SUM(oi.quantity * oi.price_each) AS total_spent_at_shop,
    MAX(o.created_at) AS last_purchase_date
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN users u ON o.buyer_id = u.id
WHERE oi.shop_id = 1 
  AND o.payment_status = 'paid'
GROUP BY u.id, u.name, u.email, u.phone
ORDER BY total_spent_at_shop DESC;


-- Query 3: Admin query for Daily Active Visitors, Traffic, and Gross Merchandise Value (GMV)
SELECT 
    DATE(o.created_at) AS report_date,
    COALESCE(sa.unique_visitors, 0) AS daily_unique_visitors,
    COALESCE(sa.page_views, 0) AS daily_page_views,
    COUNT(DISTINCT o.id) AS total_paid_orders,
    SUM(o.total_amount) AS daily_gmv,
    SUM(o.total_amount * 0.05) AS platform_commission_5_percent,
    ROUND(SUM(o.total_amount * 0.05) - 45.00, 2) AS net_platform_profit_after_server_costs
FROM orders o
LEFT JOIN site_analytics sa ON DATE(o.created_at) = sa.visit_date
WHERE o.payment_status = 'paid'
GROUP BY DATE(o.created_at), sa.unique_visitors, sa.page_views
ORDER BY report_date DESC
LIMIT 30;
