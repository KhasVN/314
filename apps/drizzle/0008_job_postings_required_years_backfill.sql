-- Backfill only NULL required_years_of_experience from title + description keywords
-- (tiers aligned with scripts/load-raw-data.mjs experienceToYears). Non-null rows unchanged.

UPDATE job_postings AS jp
SET required_years_of_experience = v.years
FROM (
  SELECT
    jp2.id,
    CASE
      WHEN lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE '%internship%'
        OR lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE '%entry level%'
        OR lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE '%entry-level%'
        OR lower(jp2.title) LIKE '% intern %'
        OR lower(jp2.title) LIKE 'intern %'
        OR lower(jp2.title) LIKE '% intern'
        OR lower(jp2.title) = 'intern'
      THEN 0
      WHEN lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE '%associate%'
      THEN 2
      WHEN lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE '%mid-level%'
        OR lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE '%mid level%'
        OR lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE '%mid-senior%'
      THEN 4
      WHEN lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE '%senior%'
        OR lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE '% sr.%'
        OR lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE '% sr %'
        OR lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE 'sr %'
        OR lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE '%lead %'
        OR lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE '% lead'
        OR lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE '%principal %'
      THEN 6
      WHEN lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE '%director%'
        OR lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE '%executive%'
        OR lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE '%vice president%'
        OR lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE '%vp %'
        OR lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE '% vp%'
        OR lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE '%head of %'
        OR lower(jp2.title || ' ' || coalesce(jp2.description, '')) LIKE '%chief %'
      THEN 8
      ELSE 2
    END AS years
  FROM job_postings AS jp2
  WHERE jp2.required_years_of_experience IS NULL
) AS v
WHERE jp.id = v.id
  AND jp.required_years_of_experience IS NULL;
