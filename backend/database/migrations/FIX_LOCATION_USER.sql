
-- Add a location for Clown Innovations (ID 13)
-- Using the coordinates where the student is currently located
INSERT INTO ems.institution_locations (company_id, location_name, latitude, longitude, radius_meters)
VALUES (13, 'Rajapalayam Branch', 9.460327, 77.776939, 1000)
ON CONFLICT DO NOTHING;

-- Also ensure the SQL functions are updated (just in case)
CREATE OR REPLACE FUNCTION ems.calculate_distance_meters(
    lat1 NUMERIC, lon1 NUMERIC,
    lat2 NUMERIC, lon2 NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
    earth_radius CONSTANT NUMERIC := 6371000;
    dlat NUMERIC;
    dlon NUMERIC;
    a NUMERIC;
    c NUMERIC;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION ems.verify_location(
    p_company_id BIGINT,
    p_latitude NUMERIC,
    p_longitude NUMERIC
) RETURNS TABLE(
    is_valid BOOLEAN,
    location_name VARCHAR,
    distance_meters NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (distance <= radius_meters) as is_valid,
        il.location_name,
        distance as distance_meters
    FROM (
        SELECT 
            il.location_name,
            il.radius_meters,
            ems.calculate_distance_meters(
                p_latitude, p_longitude,
                il.latitude, il.longitude
            ) as distance
        FROM ems.institution_locations il
        WHERE il.company_id = p_company_id
    ) as il
    ORDER BY distance ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;
