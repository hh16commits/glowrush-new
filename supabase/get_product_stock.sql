CREATE OR REPLACE FUNCTION public.get_product_stock()
RETURNS TABLE("productId" text, available integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT
    i."productId",
    COALESCE(SUM(i.available), 0)::integer AS available
  FROM public."Inventory" i
  INNER JOIN public."Warehouse" w
    ON w.id = i."warehouseId"
  WHERE w."isActive" = true
  GROUP BY i."productId";
$function$;
