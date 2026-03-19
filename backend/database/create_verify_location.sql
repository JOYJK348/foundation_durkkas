-- Function to verify location
CREATE OR REPLACE FUNCTION public.verify_location(
    p_company_id BIGINT,
    p_latitude DECIMAL,
    p_longitude DECIMAL,
    p_radius_meters INTEGER DEFAULT 100
) RETURNS JSONB AS $$
DECLARE
    v_location_name VARCHAR;
    v_distance DECIMAL;
    v_is_valid BOOLEAN := FALSE;
    loc RECORD;
BEGIN
    -- Check against all authorized locations for this company
    -- Simple distance calculation using Haversine formula approximation or Postgres earthdistance if available
    -- For standard Postgres without extensions, we use a spherical approximation
    
    FOR loc IN 
        SELECT name, latitude, longitude 
        FROM core.locations 
        WHERE company_id = p_company_id AND is_active = true
    LOOP
        -- Calculate distance in meters (approximate)
        -- 6371000 is earth radius in meters
        -- Using simple Euclidean distance for small distances for performance, or proper formula
        -- Here using a simplified Pythagorean theorem on lat/long degrees ( rough approx for small areas)
        -- 1 degree lat ~= 111111 meters
        -- 1 degree long ~= 111111 * cos(lat) meters
        
        v_distance := 6371000 * 2 * ASIN(SQRT(
            POWER(SIN((RADIANS(loc.latitude) - RADIANS(p_latitude)) / 2), 2) +
            COS(RADIANS(p_latitude)) * COS(RADIANS(loc.latitude)) *
            POWER(SIN((RADIANS(loc.longitude) - RADIANS(p_longitude)) / 2), 2)
        ));

        IF v_distance <= p_radius_meters THEN
            v_is_valid := TRUE;
            v_location_name := loc.name;
            EXIT; -- Found a valid location
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'is_valid', v_is_valid,
        'location_name', v_location_name,
        'distance_meters', v_distance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
