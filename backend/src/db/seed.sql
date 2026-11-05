-- PRACTICE DATA ONLY. Doses are typical adult label values, NOT verified.
-- reviewed_by stays NULL until a pharmacist or clinician checks each row.
-- The app must only suggest medicines where reviewed_by IS NOT NULL.

TRUNCATE medicines RESTART IDENTITY;

INSERT INTO medicines (generic_name, category, used_for, label_dosing, min_age_years, avoid_conditions, notes) VALUES
('Paracetamol', 'pain_fever', 'Mild pain and fever',
 '500 mg to 1 g every 4 to 6 hours as needed. Do not exceed 4 g in 24 hours.',
 12, '{liver_disease}',
 '[SAMPLE] Do not combine with other paracetamol products. See a doctor if fever lasts more than 3 days.'),

('Oral rehydration salts (ORS)', 'rehydration', 'Replacing fluids lost in diarrhoea or vomiting',
 'Dissolve one sachet in the amount of clean water stated on the pack. Sip small amounts often.',
 0, '{}',
 '[SAMPLE] Seek care if diarrhoea lasts more than 2 days, or if there is blood or severe weakness.'),

('Antacid tablets', 'heartburn', 'Occasional heartburn and indigestion',
 '1 to 2 tablets chewed after meals and at bedtime, as stated on the pack.',
 12, '{kidney_disease}',
 '[SAMPLE] See a doctor if heartburn is frequent or lasts more than 2 weeks.'),

('Cetirizine', 'allergy', 'Hay fever and mild allergy symptoms',
 '10 mg once daily.',
 12, '{}',
 '[SAMPLE] May cause drowsiness. Avoid alcohol and driving if drowsy.'),

('Throat lozenges', 'sore_throat', 'Temporary relief of a sore throat',
 '1 lozenge every 2 to 3 hours as needed, up to the daily limit on the pack.',
 12, '{}',
 '[SAMPLE] See a doctor if a sore throat lasts more than 3 to 5 days or comes with high fever.');