-- Historical rows (e.g. raw import) omitted required_education; default for search/display.
UPDATE job_postings
SET required_education = 'bachelor'
WHERE required_education IS NULL;
