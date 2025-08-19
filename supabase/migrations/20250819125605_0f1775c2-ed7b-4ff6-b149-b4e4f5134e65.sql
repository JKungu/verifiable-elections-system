-- Add missing presidential candidates (make existing ones national)
UPDATE election_candidates 
SET location_level = 'national', location_id = NULL 
WHERE position_id = 'president';

-- Add missing Women Representative candidates based on existing governors
INSERT INTO election_candidates (id, name, party, position_id, location_level, location_id, image_url)
SELECT 
    'women_rep_' || location_id || '_' || ROW_NUMBER() OVER (PARTITION BY location_id ORDER BY name),
    CASE 
        WHEN name LIKE '%John%' THEN REPLACE(name, 'John', 'Jane')
        WHEN name LIKE '%Michael%' THEN REPLACE(name, 'Michael', 'Michelle')
        WHEN name LIKE '%David%' THEN REPLACE(name, 'David', 'Diana')
        WHEN name LIKE '%Peter%' THEN REPLACE(name, 'Peter', 'Patricia')
        WHEN name LIKE '%James%' THEN REPLACE(name, 'James', 'Jessica')
        ELSE 'Hon. ' || SPLIT_PART(name, ' ', -1) || ' Women Rep'
    END as name,
    party,
    'women_rep' as position_id,
    'county' as location_level,
    location_id,
    image_url
FROM election_candidates 
WHERE position_id = 'governor'
AND NOT EXISTS (
    SELECT 1 FROM election_candidates wr 
    WHERE wr.position_id = 'women_rep' 
    AND wr.location_id = election_candidates.location_id
);

-- Add missing MP candidates for constituencies that don't have them
-- First, let's get all unique ward locations and map them to constituencies
WITH ward_constituency_mapping AS (
    SELECT DISTINCT 
        CASE 
            WHEN location_id = 'parklands' THEN 'westlands'
            WHEN location_id = 'majengo' THEN 'mvita'
            WHEN location_id = 'township' THEN 'nakurutowneast'
            WHEN location_id = 'kolwacentral' THEN 'kisumueast'
            WHEN location_id = 'biashara' THEN 'kiambutown'
            WHEN location_id = 'murera' THEN 'kiambutown'
            WHEN location_id = 'ward-0547' THEN 'kiambutown'
            ELSE 'westlands'  -- default constituency
        END as constituency_id,
        location_id as ward_id
    FROM election_candidates 
    WHERE position_id = 'mca'
),
missing_constituencies AS (
    SELECT DISTINCT constituency_id
    FROM ward_constituency_mapping wcm
    WHERE NOT EXISTS (
        SELECT 1 FROM election_candidates mp 
        WHERE mp.position_id = 'mp' 
        AND mp.location_id = wcm.constituency_id
    )
)
INSERT INTO election_candidates (id, name, party, position_id, location_level, location_id, image_url)
SELECT 
    'mp_' || mc.constituency_id || '_' || (row_number() OVER (PARTITION BY mc.constituency_id)) as id,
    CASE 
        WHEN row_number() OVER (PARTITION BY mc.constituency_id) = 1 THEN 'Hon. ' || INITCAP(mc.constituency_id) || ' MP (UDA)'
        WHEN row_number() OVER (PARTITION BY mc.constituency_id) = 2 THEN 'Hon. ' || INITCAP(mc.constituency_id) || ' MP (ODM)'
        ELSE 'Hon. ' || INITCAP(mc.constituency_id) || ' MP (Independent)'
    END as name,
    CASE 
        WHEN row_number() OVER (PARTITION BY mc.constituency_id) = 1 THEN 'UDA'
        WHEN row_number() OVER (PARTITION BY mc.constituency_id) = 2 THEN 'ODM'
        ELSE 'Independent'
    END as party,
    'mp' as position_id,
    'constituency' as location_level,
    mc.constituency_id as location_id,
    '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png' as image_url
FROM missing_constituencies mc
CROSS JOIN generate_series(1, 3) as candidate_number;

-- Add additional MCA candidates to ensure each ward has at least 3 candidates
WITH ward_candidate_counts AS (
    SELECT 
        location_id,
        COUNT(*) as current_count,
        3 - COUNT(*) as needed_count
    FROM election_candidates 
    WHERE position_id = 'mca'
    GROUP BY location_id
    HAVING COUNT(*) < 3
)
INSERT INTO election_candidates (id, name, party, position_id, location_level, location_id, image_url)
SELECT 
    'mca_' || wcc.location_id || '_additional_' || generate_series as id,
    'Hon. ' || INITCAP(wcc.location_id) || ' MCA ' || generate_series as name,
    CASE 
        WHEN generate_series % 3 = 1 THEN 'UDA'
        WHEN generate_series % 3 = 2 THEN 'ODM'
        ELSE 'Independent'
    END as party,
    'mca' as position_id,
    'ward' as location_level,
    wcc.location_id,
    '/lovable-uploads/0b1b8989-c5d9-4bb6-9e81-4ad147a3cdfe.png' as image_url
FROM ward_candidate_counts wcc
CROSS JOIN generate_series(1, wcc.needed_count);