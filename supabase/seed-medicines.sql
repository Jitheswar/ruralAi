-- =============================================================================
-- RURALAI COMPLETE MEDICINE SEED DATA — ~340+ medicines
-- =============================================================================

-- Clear existing data (safe for re-seeding)
TRUNCATE public.medicines;

-- =============================================================================
-- CATEGORY: analgesic (15 medicines)
-- =============================================================================
INSERT INTO public.medicines (brand_name, generic_name, salt_composition, category, market_price, jan_aushadhi_name, jan_aushadhi_price, savings_percent, dosage_form, strength, manufacturer, uses, side_effects, contraindications, hindi_name, is_nlem) VALUES

('Crocin Advance', 'Paracetamol', 'Paracetamol 500mg', 'analgesic', 30.00, 'Paracetamol Tablets', 5.00, 83.33, 'Tablet', '500mg', 'GSK Pharmaceuticals',
 ARRAY['Fever reduction', 'Mild to moderate pain relief', 'Headache', 'Body ache'],
 ARRAY['Nausea', 'Liver damage in overdose', 'Allergic rash'],
 ARRAY['Severe liver disease', 'Alcohol dependence'],
 'पैरासिटामोल', true),

('Dolo 650', 'Paracetamol', 'Paracetamol 650mg', 'analgesic', 32.00, 'Paracetamol Tablets', 6.50, 79.69, 'Tablet', '650mg', 'Micro Labs Ltd',
 ARRAY['Fever', 'Pain relief', 'Headache', 'Post-vaccination fever'],
 ARRAY['Nausea', 'Liver toxicity on overdose', 'Skin rash'],
 ARRAY['Severe hepatic impairment', 'Known hypersensitivity'],
 'पैरासिटामोल', true),

('Calpol', 'Paracetamol', 'Paracetamol 120mg/5ml', 'analgesic', 65.00, 'Paracetamol Suspension', 12.00, 81.54, 'Suspension', '120mg/5ml', 'GSK Pharmaceuticals',
 ARRAY['Fever in children', 'Pain relief in children', 'Teething pain'],
 ARRAY['Nausea', 'Allergic rash', 'Vomiting'],
 ARRAY['Severe liver disease', 'Hypersensitivity to paracetamol'],
 'पैरासिटामोल सिरप', true),

('Brufen', 'Ibuprofen', 'Ibuprofen 400mg', 'analgesic', 35.00, 'Ibuprofen Tablets', 6.00, 82.86, 'Tablet', '400mg', 'Abbott India',
 ARRAY['Pain and inflammation', 'Arthritis pain', 'Menstrual cramps', 'Dental pain'],
 ARRAY['Stomach upset', 'Nausea', 'Dizziness'],
 ARRAY['Peptic ulcer disease', 'Aspirin-sensitive asthma'],
 'आइबुप्रोफेन', true),

('Combiflam', 'Ibuprofen + Paracetamol', 'Ibuprofen 400mg + Paracetamol 325mg', 'analgesic', 42.00, 'Ibuprofen+Paracetamol Tablets', 8.50, 79.76, 'Tablet', '400mg+325mg', 'Sanofi India',
 ARRAY['Moderate pain relief', 'Fever with body pain', 'Toothache', 'Headache'],
 ARRAY['Stomach pain', 'Nausea', 'Heartburn'],
 ARRAY['Peptic ulcer', 'Severe renal impairment'],
 'कॉम्बिफ्लेम', false),

('Voveran', 'Diclofenac', 'Diclofenac Sodium 50mg', 'analgesic', 38.00, 'Diclofenac Sodium Tablets', 4.50, 88.16, 'Tablet', '50mg', 'Novartis India',
 ARRAY['Joint pain', 'Muscle pain', 'Post-operative pain', 'Arthritis'],
 ARRAY['Gastric irritation', 'Nausea', 'Headache'],
 ARRAY['GI bleeding history', 'Severe heart failure'],
 'डाइक्लोफेनेक', true),

('Disprin', 'Aspirin', 'Acetylsalicylic Acid 350mg', 'analgesic', 18.00, 'Aspirin Tablets', 3.50, 80.56, 'Dispersible Tablet', '350mg', 'Reckitt Benckiser',
 ARRAY['Headache', 'Cold and flu symptoms', 'Mild pain relief'],
 ARRAY['Stomach irritation', 'Bleeding risk', 'Nausea'],
 ARRAY['Children under 12 (Reye syndrome)', 'Active peptic ulcer'],
 'एस्पिरिन', true),

('Hifenac', 'Aceclofenac', 'Aceclofenac 100mg', 'analgesic', 70.00, 'Aceclofenac Tablets', 10.00, 85.71, 'Tablet', '100mg', 'Intas Pharmaceuticals',
 ARRAY['Osteoarthritis pain', 'Rheumatoid arthritis', 'Ankylosing spondylitis'],
 ARRAY['Diarrhoea', 'Abdominal pain', 'Nausea'],
 ARRAY['Active GI bleeding', 'Severe hepatic impairment'],
 'एसिक्लोफेनेक', false),

('Nimesulide (Nice)', 'Nimesulide', 'Nimesulide 100mg', 'analgesic', 40.00, 'Nimesulide Tablets', 5.50, 86.25, 'Tablet', '100mg', 'Dr. Reddys Laboratories',
 ARRAY['Acute pain', 'Fever', 'Inflammatory conditions'],
 ARRAY['Hepatotoxicity risk', 'Nausea', 'Skin rash'],
 ARRAY['Children under 12', 'Liver disease'],
 'निमेसुलाइड', false),

('Ultracet', 'Tramadol + Paracetamol', 'Tramadol 37.5mg + Paracetamol 325mg', 'analgesic', 85.00, 'Tramadol+Paracetamol Tablets', 15.00, 82.35, 'Tablet', '37.5mg+325mg', 'Johnson & Johnson',
 ARRAY['Moderate to severe pain', 'Post-surgical pain', 'Chronic pain'],
 ARRAY['Drowsiness', 'Nausea', 'Constipation'],
 ARRAY['Epilepsy', 'Concurrent MAO inhibitors'],
 'ट्रामाडोल', false),

('Meftal Spas', 'Mefenamic Acid + Dicyclomine', 'Mefenamic Acid 250mg + Dicyclomine 10mg', 'analgesic', 58.00, 'Mefenamic Acid+Dicyclomine Tablets', 9.00, 84.48, 'Tablet', '250mg+10mg', 'Blue Cross Laboratories',
 ARRAY['Menstrual cramps', 'Abdominal pain', 'Spasmodic pain'],
 ARRAY['Drowsiness', 'Nausea', 'Diarrhoea'],
 ARRAY['Inflammatory bowel disease', 'GI bleeding'],
 'मेफ्टल स्पास', false),

('Meftal Forte', 'Mefenamic Acid', 'Mefenamic Acid 500mg', 'analgesic', 45.00, 'Mefenamic Acid Tablets', 7.00, 84.44, 'Tablet', '500mg', 'Blue Cross Laboratories',
 ARRAY['Mild to moderate pain', 'Dysmenorrhoea', 'Dental pain'],
 ARRAY['Stomach upset', 'Diarrhoea', 'Headache'],
 ARRAY['Peptic ulcer', 'Renal impairment'],
 'मेफेनामिक एसिड', true),

('Flexon', 'Ibuprofen + Paracetamol', 'Ibuprofen 400mg + Paracetamol 500mg', 'analgesic', 48.00, 'Ibuprofen+Paracetamol Tablets', 9.00, 81.25, 'Tablet', '400mg+500mg', 'Aristo Pharmaceuticals',
 ARRAY['Pain and fever', 'Joint pain', 'Muscular pain', 'Toothache'],
 ARRAY['Gastric discomfort', 'Nausea', 'Dizziness'],
 ARRAY['Peptic ulcer', 'Renal failure'],
 'फ्लेक्सन', false),

('Zerodol SP', 'Aceclofenac + Paracetamol + Serratiopeptidase', 'Aceclofenac 100mg + Paracetamol 325mg + Serratiopeptidase 15mg', 'analgesic', 115.00, 'Aceclofenac+Paracetamol Tablets', 12.00, 89.57, 'Tablet', '100mg+325mg+15mg', 'IPCA Laboratories',
 ARRAY['Inflammation and pain', 'Post-operative swelling', 'Arthritis'],
 ARRAY['Gastric irritation', 'Nausea', 'Dizziness'],
 ARRAY['GI bleeding', 'Aspirin-sensitive asthma'],
 'ज़ीरोडोल', false),

('Sumo', 'Nimesulide + Paracetamol', 'Nimesulide 100mg + Paracetamol 325mg', 'analgesic', 38.00, 'Nimesulide+Paracetamol Tablets', 6.50, 82.89, 'Tablet', '100mg+325mg', 'Alkem Laboratories',
 ARRAY['Fever with pain', 'Body ache', 'Headache'],
 ARRAY['Nausea', 'Abdominal pain', 'Liver enzyme elevation'],
 ARRAY['Liver disease', 'Children under 12'],
 'सूमो', false);


-- =============================================================================
-- CATEGORY: antibiotic (20 medicines)
-- =============================================================================
INSERT INTO public.medicines (brand_name, generic_name, salt_composition, category, market_price, jan_aushadhi_name, jan_aushadhi_price, savings_percent, dosage_form, strength, manufacturer, uses, side_effects, contraindications, hindi_name, is_nlem) VALUES

('Mox 500', 'Amoxicillin', 'Amoxicillin 500mg', 'antibiotic', 85.00, 'Amoxicillin Capsules', 12.00, 85.88, 'Capsule', '500mg', 'Ranbaxy Laboratories',
 ARRAY['Bacterial infections', 'Ear infections', 'Urinary tract infections', 'Respiratory infections'],
 ARRAY['Diarrhoea', 'Nausea', 'Skin rash'],
 ARRAY['Penicillin allergy', 'Infectious mononucleosis'],
 'एमोक्सिसिलिन', true),

('Augmentin 625 Duo', 'Amoxicillin + Clavulanic Acid', 'Amoxicillin 500mg + Clavulanic Acid 125mg', 'antibiotic', 210.00, 'Amoxicillin+Clavulanate Tablets', 35.00, 83.33, 'Tablet', '625mg', 'GSK Pharmaceuticals',
 ARRAY['Resistant bacterial infections', 'Sinusitis', 'Pneumonia', 'Skin infections'],
 ARRAY['Diarrhoea', 'Nausea', 'Vomiting'],
 ARRAY['Penicillin allergy', 'Cholestatic jaundice history with amoxicillin'],
 'ऑगमेंटिन', true),

('Azithral 500', 'Azithromycin', 'Azithromycin 500mg', 'antibiotic', 105.00, 'Azithromycin Tablets', 15.00, 85.71, 'Tablet', '500mg', 'Alembic Pharmaceuticals',
 ARRAY['Upper respiratory infections', 'Skin infections', 'Typhoid', 'Ear infections'],
 ARRAY['Nausea', 'Diarrhoea', 'Abdominal pain'],
 ARRAY['Hepatic impairment', 'Known macrolide allergy'],
 'एज़िथ्रोमाइसिन', true),

('Ciplox 500', 'Ciprofloxacin', 'Ciprofloxacin 500mg', 'antibiotic', 60.00, 'Ciprofloxacin Tablets', 8.00, 86.67, 'Tablet', '500mg', 'Cipla Ltd',
 ARRAY['Urinary tract infections', 'Gastroenteritis', 'Typhoid', 'Bone infections'],
 ARRAY['Nausea', 'Tendon damage risk', 'Diarrhoea'],
 ARRAY['Children under 18', 'Tendon disorder history with fluoroquinolones'],
 'सिप्रोफ्लोक्सेसिन', true),

('Flagyl', 'Metronidazole', 'Metronidazole 400mg', 'antibiotic', 22.00, 'Metronidazole Tablets', 4.00, 81.82, 'Tablet', '400mg', 'Abbott India',
 ARRAY['Amoebiasis', 'Giardiasis', 'Dental infections', 'Anaerobic bacterial infections'],
 ARRAY['Metallic taste', 'Nausea', 'Darkened urine'],
 ARRAY['First trimester pregnancy', 'Alcohol consumption during use'],
 'मेट्रोनिडाजोल', true),

('Taxim-O', 'Cefixime', 'Cefixime 200mg', 'antibiotic', 120.00, 'Cefixime Tablets', 18.00, 85.00, 'Tablet', '200mg', 'Alkem Laboratories',
 ARRAY['Gonorrhoea', 'Urinary tract infections', 'Pharyngitis', 'Bronchitis'],
 ARRAY['Diarrhoea', 'Stomach pain', 'Nausea'],
 ARRAY['Cephalosporin allergy', 'Severe penicillin allergy'],
 'सेफिक्सीम', true),

('Doxt-SL', 'Doxycycline', 'Doxycycline 100mg', 'antibiotic', 55.00, 'Doxycycline Capsules', 7.00, 87.27, 'Capsule', '100mg', 'Dr. Reddys Laboratories',
 ARRAY['Acne', 'Malaria prophylaxis', 'Chlamydia', 'Rickettsial infections'],
 ARRAY['Photosensitivity', 'Nausea', 'Oesophageal irritation'],
 ARRAY['Pregnancy', 'Children under 8 years'],
 'डॉक्सीसाइक्लिन', true),

('Levoflox 500', 'Levofloxacin', 'Levofloxacin 500mg', 'antibiotic', 95.00, 'Levofloxacin Tablets', 14.00, 85.26, 'Tablet', '500mg', 'Cipla Ltd',
 ARRAY['Community-acquired pneumonia', 'Urinary tract infections', 'Sinusitis'],
 ARRAY['Nausea', 'Headache', 'Tendon rupture risk'],
 ARRAY['Epilepsy', 'Tendon disorder with quinolone use'],
 'लीवोफ्लॉक्सेसिन', true),

('Sporidex', 'Cephalexin', 'Cephalexin 500mg', 'antibiotic', 90.00, 'Cephalexin Capsules', 12.00, 86.67, 'Capsule', '500mg', 'Sun Pharma',
 ARRAY['Skin infections', 'Urinary tract infections', 'Respiratory infections', 'Bone infections'],
 ARRAY['Diarrhoea', 'Nausea', 'Abdominal discomfort'],
 ARRAY['Cephalosporin allergy', 'Severe penicillin allergy'],
 'सेफालेक्सिन', true),

('Norflox 400', 'Norfloxacin', 'Norfloxacin 400mg', 'antibiotic', 48.00, 'Norfloxacin Tablets', 6.50, 86.46, 'Tablet', '400mg', 'Cipla Ltd',
 ARRAY['Urinary tract infections', 'Prostatitis', 'Gastroenteritis'],
 ARRAY['Nausea', 'Headache', 'Dizziness'],
 ARRAY['Children under 18', 'Tendon disorders with quinolone use'],
 'नॉरफ्लोक्सेसिन', true),

('Zenflox', 'Ofloxacin', 'Ofloxacin 200mg', 'antibiotic', 58.00, 'Ofloxacin Tablets', 8.00, 86.21, 'Tablet', '200mg', 'Mankind Pharma',
 ARRAY['Respiratory tract infections', 'Urinary infections', 'Skin infections'],
 ARRAY['Nausea', 'Diarrhoea', 'Headache'],
 ARRAY['Epilepsy', 'Pregnancy'],
 'ओफ्लोक्सेसिन', true),

('Ampicillin (Roscillin)', 'Ampicillin', 'Ampicillin 500mg', 'antibiotic', 45.00, 'Ampicillin Capsules', 8.00, 82.22, 'Capsule', '500mg', 'Ranbaxy Laboratories',
 ARRAY['Bacterial meningitis', 'Respiratory infections', 'UTI', 'Endocarditis'],
 ARRAY['Diarrhoea', 'Skin rash', 'Nausea'],
 ARRAY['Penicillin allergy', 'Infectious mononucleosis'],
 'एम्पीसिलिन', true),

('Erythrocin', 'Erythromycin', 'Erythromycin 500mg', 'antibiotic', 65.00, 'Erythromycin Tablets', 10.00, 84.62, 'Tablet', '500mg', 'Abbott India',
 ARRAY['Respiratory infections', 'Skin infections', 'Chlamydial infections', 'Diphtheria'],
 ARRAY['Nausea', 'Abdominal cramps', 'Diarrhoea'],
 ARRAY['Hepatic dysfunction', 'Concurrent use with terfenadine'],
 'एरिथ्रोमाइसिन', true),

('Bactrim DS', 'Cotrimoxazole', 'Sulfamethoxazole 800mg + Trimethoprim 160mg', 'antibiotic', 35.00, 'Cotrimoxazole DS Tablets', 5.50, 84.29, 'Tablet', '800mg+160mg', 'Abbott India',
 ARRAY['Urinary tract infections', 'Respiratory infections', 'Travellers diarrhoea', 'PCP prophylaxis'],
 ARRAY['Nausea', 'Skin rash', 'Blood dyscrasias'],
 ARRAY['Sulfonamide allergy', 'Severe renal impairment'],
 'कोट्रिमोक्साज़ोल', true),

('Dalacin C', 'Clindamycin', 'Clindamycin 300mg', 'antibiotic', 180.00, 'Clindamycin Capsules', 30.00, 83.33, 'Capsule', '300mg', 'Pfizer India',
 ARRAY['Bone and joint infections', 'Skin infections', 'Pelvic infections', 'Dental infections'],
 ARRAY['Diarrhoea', 'Pseudomembranous colitis risk', 'Nausea'],
 ARRAY['History of C. difficile colitis', 'Known hypersensitivity to lincosamides'],
 'क्लिंडामाइसिन', true),

('Gentamicin Injection', 'Gentamicin', 'Gentamicin 80mg/2ml', 'antibiotic', 25.00, 'Gentamicin Injection', 5.50, 78.00, 'Injection', '80mg/2ml', 'Cipla Ltd',
 ARRAY['Severe gram-negative infections', 'Septicaemia', 'Neonatal sepsis'],
 ARRAY['Nephrotoxicity', 'Ototoxicity', 'Neuromuscular blockade'],
 ARRAY['Myasthenia gravis', 'Renal failure'],
 'जेंटामाइसिन', true),

('Nitrofurantoin (Furadantin)', 'Nitrofurantoin', 'Nitrofurantoin 100mg', 'antibiotic', 55.00, 'Nitrofurantoin Capsules', 9.00, 83.64, 'Capsule', '100mg', 'Sun Pharma',
 ARRAY['Uncomplicated urinary tract infections', 'UTI prophylaxis'],
 ARRAY['Nausea', 'Pulmonary toxicity with long-term use', 'Peripheral neuropathy'],
 ARRAY['Renal impairment (CrCl <60)', 'G6PD deficiency'],
 'नाइट्रोफ्यूरेंटोइन', true),

('Cifran CT', 'Ciprofloxacin + Tinidazole', 'Ciprofloxacin 500mg + Tinidazole 600mg', 'antibiotic', 75.00, 'Ciprofloxacin+Tinidazole Tablets', 12.00, 84.00, 'Tablet', '500mg+600mg', 'Sun Pharma',
 ARRAY['Mixed infections', 'Diarrhoea with amoebic component', 'Abdominal infections'],
 ARRAY['Nausea', 'Metallic taste', 'Diarrhoea'],
 ARRAY['Alcohol use', 'Pregnancy'],
 'सिफ्रान सीटी', false),

('Zifi 200', 'Cefixime', 'Cefixime 200mg', 'antibiotic', 135.00, 'Cefixime Tablets', 18.00, 86.67, 'Tablet', '200mg', 'FDC Ltd',
 ARRAY['Typhoid', 'Respiratory tract infections', 'Urinary infections'],
 ARRAY['Diarrhoea', 'Abdominal pain', 'Flatulence'],
 ARRAY['Cephalosporin allergy', 'Severe renal impairment'],
 'सेफिक्सीम', true),

('Amikacin Injection', 'Amikacin', 'Amikacin 500mg/2ml', 'antibiotic', 60.00, 'Amikacin Injection', 12.00, 80.00, 'Injection', '500mg/2ml', 'Cipla Ltd',
 ARRAY['Serious gram-negative infections', 'Hospital-acquired pneumonia', 'Septicaemia'],
 ARRAY['Nephrotoxicity', 'Ototoxicity', 'Neuromuscular blockade'],
 ARRAY['Myasthenia gravis', 'Concurrent nephrotoxic drug use'],
 'एमिकासिन', true);


-- =============================================================================
-- CATEGORY: antidiabetic (12 medicines)
-- =============================================================================
INSERT INTO public.medicines (brand_name, generic_name, salt_composition, category, market_price, jan_aushadhi_name, jan_aushadhi_price, savings_percent, dosage_form, strength, manufacturer, uses, side_effects, contraindications, hindi_name, is_nlem) VALUES

('Glycomet 500', 'Metformin', 'Metformin Hydrochloride 500mg', 'antidiabetic', 28.00, 'Metformin Tablets', 4.50, 83.93, 'Tablet', '500mg', 'USV Pvt Ltd',
 ARRAY['Type 2 diabetes mellitus', 'Insulin resistance', 'PCOS-related insulin resistance'],
 ARRAY['Nausea', 'Diarrhoea', 'Lactic acidosis (rare)'],
 ARRAY['Renal failure (eGFR <30)', 'Metabolic acidosis'],
 'मेटफॉर्मिन', true),

('Glycomet GP 1', 'Metformin + Glimepiride', 'Metformin 500mg + Glimepiride 1mg', 'antidiabetic', 65.00, 'Metformin+Glimepiride Tablets', 10.00, 84.62, 'Tablet', '500mg+1mg', 'USV Pvt Ltd',
 ARRAY['Type 2 diabetes not controlled by metformin alone', 'Combination therapy for blood sugar control'],
 ARRAY['Hypoglycaemia', 'Nausea', 'Weight gain'],
 ARRAY['Type 1 diabetes', 'Diabetic ketoacidosis'],
 'ग्लाइकोमेट जीपी', false),

('Amaryl 2', 'Glimepiride', 'Glimepiride 2mg', 'antidiabetic', 75.00, 'Glimepiride Tablets', 8.00, 89.33, 'Tablet', '2mg', 'Sanofi India',
 ARRAY['Type 2 diabetes mellitus', 'Blood sugar control as add-on therapy'],
 ARRAY['Hypoglycaemia', 'Weight gain', 'Nausea'],
 ARRAY['Type 1 diabetes', 'Diabetic ketoacidosis'],
 'ग्लिमेपिराइड', true),

('Daonil', 'Glibenclamide', 'Glibenclamide 5mg', 'antidiabetic', 15.00, 'Glibenclamide Tablets', 3.00, 80.00, 'Tablet', '5mg', 'Sanofi India',
 ARRAY['Type 2 diabetes mellitus', 'Blood sugar lowering'],
 ARRAY['Hypoglycaemia', 'Weight gain', 'GI upset'],
 ARRAY['Type 1 diabetes', 'Severe renal or hepatic disease'],
 'ग्लिबेंक्लेमाइड', true),

('Januvia 100', 'Sitagliptin', 'Sitagliptin 100mg', 'antidiabetic', 650.00, 'Sitagliptin Tablets', 95.00, 85.38, 'Tablet', '100mg', 'MSD Pharmaceuticals',
 ARRAY['Type 2 diabetes mellitus', 'Blood sugar control alongside diet and exercise'],
 ARRAY['Headache', 'Nasopharyngitis', 'Upper respiratory infection'],
 ARRAY['Type 1 diabetes', 'Diabetic ketoacidosis'],
 'सीटाग्लिप्टिन', false),

('Vobose 0.3', 'Voglibose', 'Voglibose 0.3mg', 'antidiabetic', 110.00, 'Voglibose Tablets', 15.00, 86.36, 'Tablet', '0.3mg', 'Ranbaxy Laboratories',
 ARRAY['Type 2 diabetes', 'Post-meal blood sugar control'],
 ARRAY['Flatulence', 'Diarrhoea', 'Abdominal distention'],
 ARRAY['Diabetic ketoacidosis', 'Severe intestinal disorders'],
 'वोग्लिबोज', false),

('Pioz 15', 'Pioglitazone', 'Pioglitazone 15mg', 'antidiabetic', 80.00, 'Pioglitazone Tablets', 10.00, 87.50, 'Tablet', '15mg', 'USV Pvt Ltd',
 ARRAY['Type 2 diabetes mellitus', 'Insulin sensitizer'],
 ARRAY['Weight gain', 'Oedema', 'Fracture risk in women'],
 ARRAY['Heart failure', 'Bladder cancer history'],
 'पियोग्लिटाजोन', true),

('Galvus 50', 'Vildagliptin', 'Vildagliptin 50mg', 'antidiabetic', 350.00, 'Vildagliptin Tablets', 55.00, 84.29, 'Tablet', '50mg', 'Novartis India',
 ARRAY['Type 2 diabetes mellitus', 'DPP-4 inhibitor for glycaemic control'],
 ARRAY['Headache', 'Dizziness', 'Tremor'],
 ARRAY['Type 1 diabetes', 'Hepatic impairment'],
 'विल्डाग्लिप्टिन', false),

('Glycomet 850', 'Metformin', 'Metformin Hydrochloride 850mg', 'antidiabetic', 35.00, 'Metformin Tablets', 6.00, 82.86, 'Tablet', '850mg', 'USV Pvt Ltd',
 ARRAY['Type 2 diabetes mellitus', 'Higher dose for inadequate control at 500mg'],
 ARRAY['Nausea', 'Diarrhoea', 'Metallic taste'],
 ARRAY['Renal failure', 'Severe dehydration'],
 'मेटफॉर्मिन', true),

('Gluformin G2', 'Metformin + Glimepiride', 'Metformin 1000mg + Glimepiride 2mg', 'antidiabetic', 95.00, 'Metformin+Glimepiride Tablets', 14.00, 85.26, 'Tablet', '1000mg+2mg', 'Torrent Pharmaceuticals',
 ARRAY['Type 2 diabetes requiring dual oral therapy', 'Uncontrolled blood sugar on monotherapy'],
 ARRAY['Hypoglycaemia', 'GI disturbances', 'Weight gain'],
 ARRAY['Type 1 diabetes', 'Severe hepatic or renal impairment'],
 'मेटफॉर्मिन + ग्लिमेपिराइड', false),

('Gliclazide (Diamicron MR)', 'Gliclazide', 'Gliclazide 60mg MR', 'antidiabetic', 120.00, 'Gliclazide MR Tablets', 16.00, 86.67, 'Modified Release Tablet', '60mg', 'Serdia Pharmaceuticals',
 ARRAY['Type 2 diabetes mellitus', 'Particularly in overweight patients'],
 ARRAY['Hypoglycaemia', 'Nausea', 'Weight gain'],
 ARRAY['Type 1 diabetes', 'Severe renal or hepatic impairment'],
 'ग्लिक्लाजाइड', true),

('Human Mixtard 30/70', 'Insulin Human', 'Insulin Human 30/70 (soluble/isophane)', 'antidiabetic', 185.00, 'Insulin Human 30/70', 65.00, 64.86, 'Injection', '100 IU/ml (10ml vial)', 'Novo Nordisk India',
 ARRAY['Type 1 diabetes', 'Type 2 diabetes requiring insulin', 'Gestational diabetes'],
 ARRAY['Hypoglycaemia', 'Injection site reactions', 'Weight gain'],
 ARRAY['Hypoglycaemia', 'Known hypersensitivity'],
 'इंसुलिन', true);


-- =============================================================================
-- CATEGORY: cardiac (15 medicines)
-- =============================================================================
INSERT INTO public.medicines (brand_name, generic_name, salt_composition, category, market_price, jan_aushadhi_name, jan_aushadhi_price, savings_percent, dosage_form, strength, manufacturer, uses, side_effects, contraindications, hindi_name, is_nlem) VALUES

('Stamlo 5', 'Amlodipine', 'Amlodipine 5mg', 'cardiac', 45.00, 'Amlodipine Tablets', 5.00, 88.89, 'Tablet', '5mg', 'Dr. Reddys Laboratories',
 ARRAY['Hypertension', 'Angina pectoris', 'Coronary artery disease'],
 ARRAY['Ankle oedema', 'Headache', 'Flushing'],
 ARRAY['Severe aortic stenosis', 'Cardiogenic shock'],
 'एम्लोडिपिन', true),

('Aten 50', 'Atenolol', 'Atenolol 50mg', 'cardiac', 28.00, 'Atenolol Tablets', 4.00, 85.71, 'Tablet', '50mg', 'Zydus Cadila',
 ARRAY['Hypertension', 'Angina', 'Cardiac arrhythmias', 'Heart attack prevention'],
 ARRAY['Bradycardia', 'Fatigue', 'Cold extremities'],
 ARRAY['Asthma', 'Severe bradycardia'],
 'एटेनोलोल', true),

('Losacar 50', 'Losartan', 'Losartan Potassium 50mg', 'cardiac', 55.00, 'Losartan Tablets', 7.00, 87.27, 'Tablet', '50mg', 'Micro Labs Ltd',
 ARRAY['Hypertension', 'Diabetic nephropathy protection', 'Heart failure'],
 ARRAY['Dizziness', 'Hyperkalaemia', 'Fatigue'],
 ARRAY['Pregnancy', 'Bilateral renal artery stenosis'],
 'लोसार्टन', true),

('Telma 40', 'Telmisartan', 'Telmisartan 40mg', 'cardiac', 70.00, 'Telmisartan Tablets', 8.00, 88.57, 'Tablet', '40mg', 'Glenmark Pharmaceuticals',
 ARRAY['Hypertension', 'Cardiovascular risk reduction', 'Diabetic renal disease'],
 ARRAY['Dizziness', 'Diarrhoea', 'Hypotension'],
 ARRAY['Pregnancy', 'Biliary obstruction'],
 'टेल्मिसार्टन', true),

('Cardace 5', 'Ramipril', 'Ramipril 5mg', 'cardiac', 85.00, 'Ramipril Tablets', 10.00, 88.24, 'Tablet', '5mg', 'Sanofi India',
 ARRAY['Hypertension', 'Heart failure', 'Post-MI prevention', 'Diabetic nephropathy'],
 ARRAY['Dry cough', 'Dizziness', 'Hyperkalaemia'],
 ARRAY['Pregnancy', 'Angioedema history with ACE inhibitors'],
 'रेमिप्रिल', true),

('Envas 5', 'Enalapril', 'Enalapril 5mg', 'cardiac', 38.00, 'Enalapril Tablets', 5.00, 86.84, 'Tablet', '5mg', 'Cadila Healthcare',
 ARRAY['Hypertension', 'Congestive heart failure', 'Left ventricular dysfunction'],
 ARRAY['Dry cough', 'Hypotension', 'Dizziness'],
 ARRAY['Pregnancy', 'History of angioedema'],
 'एनालाप्रिल', true),

('Betaloc 50', 'Metoprolol', 'Metoprolol Tartrate 50mg', 'cardiac', 40.00, 'Metoprolol Tablets', 5.50, 86.25, 'Tablet', '50mg', 'AstraZeneca India',
 ARRAY['Hypertension', 'Angina', 'Heart failure', 'Arrhythmia'],
 ARRAY['Fatigue', 'Bradycardia', 'Dizziness'],
 ARRAY['Severe bradycardia', 'Uncontrolled heart failure'],
 'मेटोप्रोलोल', true),

('Clopitab 75', 'Clopidogrel', 'Clopidogrel 75mg', 'cardiac', 55.00, 'Clopidogrel Tablets', 7.00, 87.27, 'Tablet', '75mg', 'Lupin Ltd',
 ARRAY['Prevention of heart attack and stroke', 'Acute coronary syndrome', 'Post-stent placement'],
 ARRAY['Bleeding', 'Bruising', 'GI discomfort'],
 ARRAY['Active bleeding', 'Severe hepatic impairment'],
 'क्लोपिडोग्रेल', true),

('Ecosprin 75', 'Aspirin (Low-dose)', 'Aspirin 75mg', 'cardiac', 12.00, 'Aspirin Tablets', 2.50, 79.17, 'Enteric Coated Tablet', '75mg', 'USV Pvt Ltd',
 ARRAY['Heart attack prevention', 'Stroke prevention', 'Post-angioplasty antiplatelet'],
 ARRAY['GI bleeding', 'Bruising', 'Dyspepsia'],
 ARRAY['Active peptic ulcer', 'Bleeding disorders'],
 'एस्पिरिन', true),

('Atorva 10', 'Atorvastatin', 'Atorvastatin 10mg', 'cardiac', 90.00, 'Atorvastatin Tablets', 8.00, 91.11, 'Tablet', '10mg', 'Zydus Cadila',
 ARRAY['High cholesterol', 'Prevention of cardiovascular events', 'Dyslipidaemia'],
 ARRAY['Muscle pain', 'Liver enzyme elevation', 'Headache'],
 ARRAY['Active liver disease', 'Pregnancy'],
 'एटोरवास्टैटिन', true),

('Rosulip 10', 'Rosuvastatin', 'Rosuvastatin 10mg', 'cardiac', 130.00, 'Rosuvastatin Tablets', 12.00, 90.77, 'Tablet', '10mg', 'Cipla Ltd',
 ARRAY['High cholesterol', 'Atherosclerosis prevention', 'Dyslipidaemia'],
 ARRAY['Myalgia', 'Headache', 'Abdominal pain'],
 ARRAY['Active liver disease', 'Pregnancy and breastfeeding'],
 'रोसुवास्टैटिन', true),

('Dilzem', 'Diltiazem', 'Diltiazem 30mg', 'cardiac', 35.00, 'Diltiazem Tablets', 5.00, 85.71, 'Tablet', '30mg', 'Torrent Pharmaceuticals',
 ARRAY['Angina pectoris', 'Hypertension', 'Supraventricular tachycardia'],
 ARRAY['Ankle oedema', 'Headache', 'Bradycardia'],
 ARRAY['Severe bradycardia', 'Heart block'],
 'डिल्टिएज़ेम', true),

('Nitrocontin', 'Nitroglycerin', 'Nitroglycerin 2.6mg', 'cardiac', 50.00, 'Nitroglycerin Tablets', 8.00, 84.00, 'Sustained Release Tablet', '2.6mg', 'Cipla Ltd',
 ARRAY['Angina prophylaxis', 'Chest pain due to coronary artery disease'],
 ARRAY['Headache', 'Flushing', 'Hypotension'],
 ARRAY['Severe hypotension', 'Concurrent use with PDE5 inhibitors (sildenafil)'],
 'नाइट्रोग्लिसरीन', true),

('Lasix', 'Furosemide', 'Furosemide 40mg', 'cardiac', 18.00, 'Furosemide Tablets', 3.00, 83.33, 'Tablet', '40mg', 'Sanofi India',
 ARRAY['Oedema in heart failure', 'Pulmonary oedema', 'Ascites', 'Hypertension'],
 ARRAY['Dehydration', 'Electrolyte imbalance', 'Hypotension'],
 ARRAY['Anuria', 'Severe electrolyte depletion'],
 'फ्यूरोसेमाइड', true),

('Aldactone', 'Spironolactone', 'Spironolactone 25mg', 'cardiac', 40.00, 'Spironolactone Tablets', 6.00, 85.00, 'Tablet', '25mg', 'RPG Life Sciences',
 ARRAY['Heart failure', 'Resistant hypertension', 'Ascites in liver cirrhosis', 'Primary hyperaldosteronism'],
 ARRAY['Hyperkalaemia', 'Gynaecomastia', 'Menstrual irregularity'],
 ARRAY['Severe renal impairment', 'Hyperkalaemia'],
 'स्पिरोनोलैक्टोन', true);


-- =============================================================================
-- CATEGORY: gi (gastro-intestinal) (12 medicines)
-- =============================================================================
INSERT INTO public.medicines (brand_name, generic_name, salt_composition, category, market_price, jan_aushadhi_name, jan_aushadhi_price, savings_percent, dosage_form, strength, manufacturer, uses, side_effects, contraindications, hindi_name, is_nlem) VALUES

('Pan 40', 'Pantoprazole', 'Pantoprazole 40mg', 'gi', 80.00, 'Pantoprazole Tablets', 10.00, 87.50, 'Tablet', '40mg', 'Alkem Laboratories',
 ARRAY['Acidity', 'Gastric ulcer', 'GERD', 'Zollinger-Ellison syndrome'],
 ARRAY['Headache', 'Diarrhoea', 'Flatulence'],
 ARRAY['Known hypersensitivity to PPIs', 'Concurrent use with rilpivirine'],
 'पैंटोप्राज़ोल', true),

('Omez 20', 'Omeprazole', 'Omeprazole 20mg', 'gi', 60.00, 'Omeprazole Capsules', 8.00, 86.67, 'Capsule', '20mg', 'Dr. Reddys Laboratories',
 ARRAY['Peptic ulcer disease', 'GERD', 'H. pylori eradication (part of triple therapy)'],
 ARRAY['Headache', 'Nausea', 'Diarrhoea'],
 ARRAY['Known PPI allergy', 'Long-term use risk of B12 deficiency'],
 'ओमेप्राज़ोल', true),

('Rantac 150', 'Ranitidine', 'Ranitidine 150mg', 'gi', 25.00, 'Ranitidine Tablets', 4.00, 84.00, 'Tablet', '150mg', 'J B Chemicals',
 ARRAY['Hyperacidity', 'Peptic ulcer', 'GERD'],
 ARRAY['Headache', 'Dizziness', 'Constipation'],
 ARRAY['Porphyria', 'Known hypersensitivity'],
 'रैनिटिडीन', true),

('Domstal 10', 'Domperidone', 'Domperidone 10mg', 'gi', 30.00, 'Domperidone Tablets', 4.50, 85.00, 'Tablet', '10mg', 'Torrent Pharmaceuticals',
 ARRAY['Nausea and vomiting', 'Bloating', 'Gastroparesis'],
 ARRAY['Dry mouth', 'Headache', 'Galactorrhoea'],
 ARRAY['Prolactinoma', 'GI haemorrhage or obstruction'],
 'डॉम्पेरिडोन', true),

('Emeset 4', 'Ondansetron', 'Ondansetron 4mg', 'gi', 38.00, 'Ondansetron Tablets', 5.00, 86.84, 'Tablet', '4mg', 'Cipla Ltd',
 ARRAY['Nausea and vomiting due to chemotherapy', 'Post-operative nausea', 'Gastroenteritis-induced vomiting'],
 ARRAY['Headache', 'Constipation', 'Fatigue'],
 ARRAY['Congenital long QT syndrome', 'Concurrent use with apomorphine'],
 'ऑन्डैनसेट्रॉन', true),

('Eldoper', 'Loperamide', 'Loperamide 2mg', 'gi', 22.00, 'Loperamide Capsules', 4.00, 81.82, 'Capsule', '2mg', 'Elder Pharmaceuticals',
 ARRAY['Acute diarrhoea', 'Chronic diarrhoea', 'Travellers diarrhoea'],
 ARRAY['Constipation', 'Abdominal cramps', 'Dizziness'],
 ARRAY['Dysentery (bloody diarrhoea)', 'Children under 2 years'],
 'लोपेरामाइड', true),

('Sucrafil O', 'Sucralfate + Oxetacaine', 'Sucralfate 1g + Oxetacaine 20mg per 10ml', 'gi', 120.00, 'Sucralfate Suspension', 25.00, 79.17, 'Suspension', '1g/10ml', 'Cipla Ltd',
 ARRAY['Gastric ulcer', 'Duodenal ulcer', 'Acid reflux symptom relief'],
 ARRAY['Constipation', 'Dry mouth', 'Nausea'],
 ARRAY['Renal failure (aluminium accumulation)', 'Dysphagia'],
 'सुक्रालफेट', true),

('Razo 20', 'Rabeprazole', 'Rabeprazole 20mg', 'gi', 90.00, 'Rabeprazole Tablets', 12.00, 86.67, 'Tablet', '20mg', 'Dr. Reddys Laboratories',
 ARRAY['GERD', 'Peptic ulcer', 'Zollinger-Ellison syndrome'],
 ARRAY['Headache', 'Diarrhoea', 'Abdominal pain'],
 ARRAY['Known PPI allergy', 'Severe hepatic impairment'],
 'रेबेप्राज़ोल', true),

('Nexpro 40', 'Esomeprazole', 'Esomeprazole 40mg', 'gi', 150.00, 'Esomeprazole Tablets', 18.00, 88.00, 'Tablet', '40mg', 'Torrent Pharmaceuticals',
 ARRAY['Erosive oesophagitis', 'GERD', 'H. pylori eradication'],
 ARRAY['Headache', 'Nausea', 'Flatulence'],
 ARRAY['Known PPI allergy', 'Concurrent nelfinavir use'],
 'एसोमेप्राज़ोल', false),

('Cyclopam', 'Dicyclomine + Paracetamol', 'Dicyclomine 20mg + Paracetamol 325mg', 'gi', 32.00, 'Dicyclomine+Paracetamol Tablets', 5.00, 84.38, 'Tablet', '20mg+325mg', 'Indoco Remedies',
 ARRAY['Abdominal cramps', 'Irritable bowel syndrome', 'Menstrual cramps'],
 ARRAY['Dry mouth', 'Drowsiness', 'Blurred vision'],
 ARRAY['Glaucoma', 'Myasthenia gravis'],
 'साइक्लोपाम', false),

('Pan D', 'Pantoprazole + Domperidone', 'Pantoprazole 40mg + Domperidone 30mg', 'gi', 95.00, 'Pantoprazole+Domperidone Capsules', 14.00, 85.26, 'Capsule', '40mg+30mg', 'Alkem Laboratories',
 ARRAY['Acidity with nausea', 'GERD with bloating', 'Dyspepsia'],
 ARRAY['Headache', 'Dry mouth', 'Diarrhoea'],
 ARRAY['GI obstruction', 'Prolactinoma'],
 'पैन डी', false),

('Gelusil MPS', 'Aluminium Hydroxide + Magnesium Hydroxide + Simethicone', 'Aluminium Hydroxide 250mg + Magnesium Hydroxide 250mg + Simethicone 50mg', 'gi', 55.00, 'Antacid Tablets', 8.00, 85.45, 'Chewable Tablet', '250mg+250mg+50mg', 'Pfizer India',
 ARRAY['Acidity', 'Heartburn', 'Gas and bloating'],
 ARRAY['Constipation', 'Diarrhoea', 'Nausea'],
 ARRAY['Severe renal impairment', 'Hypophosphataemia'],
 'जेलुसिल', false);


-- =============================================================================
-- CATEGORY: respiratory (10 medicines)
-- =============================================================================
INSERT INTO public.medicines (brand_name, generic_name, salt_composition, category, market_price, jan_aushadhi_name, jan_aushadhi_price, savings_percent, dosage_form, strength, manufacturer, uses, side_effects, contraindications, hindi_name, is_nlem) VALUES

('Asthalin', 'Salbutamol', 'Salbutamol 2mg', 'respiratory', 22.00, 'Salbutamol Tablets', 3.50, 84.09, 'Tablet', '2mg', 'Cipla Ltd',
 ARRAY['Bronchial asthma', 'Wheezing', 'COPD', 'Exercise-induced bronchospasm'],
 ARRAY['Tremor', 'Palpitations', 'Headache'],
 ARRAY['Hypertrophic cardiomyopathy', 'Tachyarrhythmia'],
 'सालबुटामोल', true),

('Montair 10', 'Montelukast', 'Montelukast 10mg', 'respiratory', 130.00, 'Montelukast Tablets', 15.00, 88.46, 'Tablet', '10mg', 'Cipla Ltd',
 ARRAY['Asthma prophylaxis', 'Allergic rhinitis', 'Exercise-induced bronchoconstriction'],
 ARRAY['Headache', 'Abdominal pain', 'Mood changes'],
 ARRAY['Phenylketonuria (chewable tablets)', 'Known hypersensitivity'],
 'मॉन्टेलुकास्ट', true),

('Cetcip', 'Cetirizine', 'Cetirizine 10mg', 'respiratory', 25.00, 'Cetirizine Tablets', 3.00, 88.00, 'Tablet', '10mg', 'Cipla Ltd',
 ARRAY['Allergic rhinitis', 'Urticaria (hives)', 'Hay fever', 'Allergic skin conditions'],
 ARRAY['Drowsiness', 'Dry mouth', 'Headache'],
 ARRAY['Severe renal impairment', 'Known hypersensitivity'],
 'सेटीरिज़ीन', true),

('Xyzal', 'Levocetirizine', 'Levocetirizine 5mg', 'respiratory', 45.00, 'Levocetirizine Tablets', 5.00, 88.89, 'Tablet', '5mg', 'UCB India Pvt Ltd',
 ARRAY['Allergic rhinitis', 'Chronic urticaria', 'Seasonal allergies'],
 ARRAY['Drowsiness', 'Dry mouth', 'Fatigue'],
 ARRAY['Severe renal impairment', 'Children under 2 years'],
 'लेवोसेटिरिज़ीन', true),

('Benadryl Cough Syrup', 'Dextromethorphan + Phenylephrine + Chlorpheniramine', 'Dextromethorphan 10mg + Phenylephrine 5mg + Chlorpheniramine 2mg per 5ml', 'respiratory', 95.00, 'Cough Syrup (DPH)', 18.00, 81.05, 'Syrup', '100ml', 'Johnson & Johnson',
 ARRAY['Dry cough', 'Cold symptoms', 'Nasal congestion', 'Runny nose'],
 ARRAY['Drowsiness', 'Nausea', 'Dry mouth'],
 ARRAY['Concurrent MAO inhibitor use', 'Severe hypertension'],
 'खांसी की दवाई', false),

('Bromhexine (Solvin)', 'Bromhexine', 'Bromhexine 8mg', 'respiratory', 32.00, 'Bromhexine Tablets', 4.50, 85.94, 'Tablet', '8mg', 'Cipla Ltd',
 ARRAY['Productive cough', 'Chest congestion', 'Mucolytic action'],
 ARRAY['Nausea', 'Gastric irritation', 'Diarrhoea'],
 ARRAY['Peptic ulcer disease', 'Known hypersensitivity'],
 'ब्रोम्हेक्सीन', true),

('Mucinac 600', 'Ambroxol', 'Ambroxol Hydrochloride 30mg', 'respiratory', 40.00, 'Ambroxol Tablets', 5.00, 87.50, 'Tablet', '30mg', 'Cipla Ltd',
 ARRAY['Wet cough', 'Bronchitis', 'Mucus clearance from airways'],
 ARRAY['Nausea', 'Diarrhoea', 'Allergic skin reactions (rare)'],
 ARRAY['Peptic ulcer', 'First trimester pregnancy'],
 'एम्ब्रोक्सोल', true),

('Budecort 200', 'Budesonide', 'Budesonide 200mcg', 'respiratory', 250.00, 'Budesonide Inhaler', 55.00, 78.00, 'Inhaler', '200mcg/dose', 'Cipla Ltd',
 ARRAY['Chronic asthma maintenance', 'Prevention of asthma attacks', 'COPD'],
 ARRAY['Oral thrush', 'Hoarseness', 'Cough'],
 ARRAY['Status asthmaticus', 'Untreated fungal infections'],
 'बुडेसोनाइड', true),

('Deriphyllin Retard', 'Theophylline + Etophylline', 'Theophylline 100mg + Etophylline 77mg', 'respiratory', 30.00, 'Theophylline Tablets', 5.00, 83.33, 'Sustained Release Tablet', '100mg+77mg', 'Zydus Cadila',
 ARRAY['Bronchial asthma', 'COPD', 'Chronic bronchitis'],
 ARRAY['Nausea', 'Palpitations', 'Insomnia'],
 ARRAY['Peptic ulcer', 'Seizure disorders'],
 'थियोफ़ाइलिन', true),

('Asthalin Inhaler', 'Salbutamol', 'Salbutamol 100mcg/puff', 'respiratory', 125.00, 'Salbutamol Inhaler', 30.00, 76.00, 'Metered Dose Inhaler', '100mcg/puff (200 doses)', 'Cipla Ltd',
 ARRAY['Acute asthma attacks', 'Bronchospasm relief', 'Exercise-induced asthma', 'COPD exacerbations'],
 ARRAY['Tremor', 'Palpitations', 'Tachycardia'],
 ARRAY['Tachyarrhythmia', 'Severe hypertension'],
 'सालबुटामोल इनहेलर', true);


-- =============================================================================
-- CATEGORY: antihypertensive (8 medicines)
-- =============================================================================
INSERT INTO public.medicines (brand_name, generic_name, salt_composition, category, market_price, jan_aushadhi_name, jan_aushadhi_price, savings_percent, dosage_form, strength, manufacturer, uses, side_effects, contraindications, hindi_name, is_nlem) VALUES

('Aquazide', 'Hydrochlorothiazide', 'Hydrochlorothiazide 12.5mg', 'antihypertensive', 18.00, 'Hydrochlorothiazide Tablets', 3.00, 83.33, 'Tablet', '12.5mg', 'Sun Pharma',
 ARRAY['Hypertension', 'Oedema in heart failure', 'Nephrogenic diabetes insipidus'],
 ARRAY['Electrolyte imbalance', 'Hyperuricaemia', 'Dizziness'],
 ARRAY['Anuria', 'Severe electrolyte depletion'],
 'हाइड्रोक्लोरोथियाज़ाइड', true),

('Arkamin', 'Clonidine', 'Clonidine 100mcg', 'antihypertensive', 15.00, 'Clonidine Tablets', 3.00, 80.00, 'Tablet', '100mcg', 'Unichem Laboratories',
 ARRAY['Hypertensive emergencies', 'Resistant hypertension', 'Migraine prophylaxis'],
 ARRAY['Drowsiness', 'Dry mouth', 'Rebound hypertension on sudden withdrawal'],
 ARRAY['Severe bradycardia', 'Sick sinus syndrome'],
 'क्लोनिडीन', true),

('Minipress XL', 'Prazosin', 'Prazosin 5mg', 'antihypertensive', 55.00, 'Prazosin Tablets', 8.00, 85.45, 'Extended Release Tablet', '5mg', 'Pfizer India',
 ARRAY['Hypertension', 'Benign prostatic hyperplasia (urinary symptoms)', 'Raynaud phenomenon'],
 ARRAY['First-dose hypotension', 'Dizziness', 'Headache'],
 ARRAY['History of orthostatic hypotension', 'Concurrent PDE5 inhibitors'],
 'प्राज़ोसिन', true),

('Natrilix SR', 'Indapamide', 'Indapamide 1.5mg SR', 'antihypertensive', 85.00, 'Indapamide SR Tablets', 10.00, 88.24, 'Sustained Release Tablet', '1.5mg', 'Serdia Pharmaceuticals',
 ARRAY['Hypertension', 'Mild oedema'],
 ARRAY['Hypokalaemia', 'Dizziness', 'Fatigue'],
 ARRAY['Severe renal failure', 'Hepatic encephalopathy'],
 'इन्डापामाइड', true),

('Telma H', 'Telmisartan + Hydrochlorothiazide', 'Telmisartan 40mg + Hydrochlorothiazide 12.5mg', 'antihypertensive', 95.00, 'Telmisartan+HCTZ Tablets', 12.00, 87.37, 'Tablet', '40mg+12.5mg', 'Glenmark Pharmaceuticals',
 ARRAY['Hypertension not controlled by monotherapy', 'Combination antihypertensive'],
 ARRAY['Dizziness', 'Hypotension', 'Electrolyte imbalance'],
 ARRAY['Pregnancy', 'Anuria'],
 'टेल्मा एच', false),

('Amlokind AT', 'Amlodipine + Atenolol', 'Amlodipine 5mg + Atenolol 50mg', 'antihypertensive', 65.00, 'Amlodipine+Atenolol Tablets', 8.00, 87.69, 'Tablet', '5mg+50mg', 'Mankind Pharma',
 ARRAY['Hypertension with angina', 'Dual BP lowering mechanism'],
 ARRAY['Ankle oedema', 'Fatigue', 'Bradycardia'],
 ARRAY['Asthma', 'Severe bradycardia or heart block'],
 'एम्लोडिपिन+एटेनोलोल', false),

('Losacar H', 'Losartan + Hydrochlorothiazide', 'Losartan 50mg + Hydrochlorothiazide 12.5mg', 'antihypertensive', 80.00, 'Losartan+HCTZ Tablets', 10.00, 87.50, 'Tablet', '50mg+12.5mg', 'Micro Labs Ltd',
 ARRAY['Hypertension requiring combination therapy', 'Renal protection in diabetics'],
 ARRAY['Dizziness', 'Hyperkalaemia', 'Hypotension'],
 ARRAY['Pregnancy', 'Severe renal impairment'],
 'लोसार्टन+एचसीटीजेड', false),

('Cilnidipine (Cilacar)', 'Cilnidipine', 'Cilnidipine 10mg', 'antihypertensive', 120.00, 'Cilnidipine Tablets', 16.00, 86.67, 'Tablet', '10mg', 'J B Chemicals',
 ARRAY['Hypertension', 'Less ankle oedema compared to amlodipine'],
 ARRAY['Headache', 'Flushing', 'Palpitations'],
 ARRAY['Cardiogenic shock', 'Severe aortic stenosis'],
 'सिल्निडिपीन', false);


-- =============================================================================
-- CATEGORY: vitamin (10 medicines)
-- =============================================================================
INSERT INTO public.medicines (brand_name, generic_name, salt_composition, category, market_price, jan_aushadhi_name, jan_aushadhi_price, savings_percent, dosage_form, strength, manufacturer, uses, side_effects, contraindications, hindi_name, is_nlem) VALUES

('Folvite', 'Folic Acid', 'Folic Acid 5mg', 'vitamin', 20.00, 'Folic Acid Tablets', 3.00, 85.00, 'Tablet', '5mg', 'Pfizer India',
 ARRAY['Folate deficiency anaemia', 'Neural tube defect prevention in pregnancy', 'Megaloblastic anaemia'],
 ARRAY['Nausea', 'Bloating', 'Bitter taste (rare)'],
 ARRAY['Untreated B12 deficiency (may mask symptoms)', 'Known hypersensitivity'],
 'फोलिक एसिड', true),

('Autrin', 'Ferrous Sulphate + Folic Acid', 'Ferrous Sulphate 150mg + Folic Acid 0.5mg', 'vitamin', 35.00, 'Ferrous Sulphate+Folic Acid Tablets', 5.00, 85.71, 'Tablet', '150mg+0.5mg', 'Bayer India',
 ARRAY['Iron deficiency anaemia', 'Pregnancy-related anaemia', 'Nutritional anaemia'],
 ARRAY['Constipation', 'Dark stools', 'Nausea'],
 ARRAY['Haemochromatosis', 'Haemolytic anaemia'],
 'आयरन+फोलिक एसिड', true),

('Shelcal 500', 'Calcium Carbonate + Vitamin D3', 'Calcium Carbonate 1250mg (500mg elemental Ca) + Vitamin D3 250 IU', 'vitamin', 120.00, 'Calcium+Vitamin D3 Tablets', 18.00, 85.00, 'Tablet', '500mg+250IU', 'Torrent Pharmaceuticals',
 ARRAY['Calcium and Vitamin D supplementation', 'Osteoporosis prevention', 'Pregnancy supplementation'],
 ARRAY['Constipation', 'Gas', 'Bloating'],
 ARRAY['Hypercalcaemia', 'Severe renal stones'],
 'कैल्शियम+विटामिन डी3', true),

('Becosules', 'Vitamin B Complex + Vitamin C', 'Thiamine + Riboflavin + Niacinamide + Pyridoxine + B12 + Folic Acid + Vitamin C', 'vitamin', 30.00, 'Vitamin B Complex Capsules', 5.00, 83.33, 'Capsule', 'Standard Strength', 'Pfizer India',
 ARRAY['Vitamin B deficiency', 'Mouth ulcers', 'General weakness', 'Nutritional support'],
 ARRAY['Mild GI discomfort', 'Yellow urine discolouration', 'Nausea (rare)'],
 ARRAY['Known hypersensitivity to any component'],
 'विटामिन बी कॉम्प्लेक्स', false),

('Limcee', 'Vitamin C', 'Ascorbic Acid 500mg', 'vitamin', 25.00, 'Vitamin C Tablets', 4.00, 84.00, 'Chewable Tablet', '500mg', 'Abbott India',
 ARRAY['Vitamin C deficiency (scurvy)', 'Immune support', 'Antioxidant'],
 ARRAY['GI upset at high doses', 'Kidney stones with prolonged high doses', 'Diarrhoea'],
 ARRAY['History of oxalate kidney stones', 'Haemochromatosis'],
 'विटामिन सी', false),

('Zincovit', 'Zinc + Multivitamins', 'Zinc 22mg + Vitamins A, B, C, D3, E + Minerals', 'vitamin', 65.00, 'Zinc+Multivitamin Tablets', 10.00, 84.62, 'Tablet', 'Multivitamin+Zinc', 'Apex Laboratories',
 ARRAY['Nutritional supplementation', 'Zinc deficiency', 'Immune support', 'Recovery from illness'],
 ARRAY['Nausea', 'Metallic taste', 'GI upset'],
 ARRAY['Hypercalcaemia', 'Wilson disease (zinc caution)'],
 'जिंक+मल्टीविटामिन', false),

('Supradyn', 'Multivitamin', 'Vitamins A, B1, B2, B6, B12, C, D3, E + Minerals (Ca, Fe, Zn, Mg, Cu, Mn)', 'vitamin', 85.00, 'Multivitamin Mineral Tablets', 12.00, 85.88, 'Tablet', 'Multivitamin+Mineral', 'Bayer India',
 ARRAY['General health maintenance', 'Nutritional deficiencies', 'Convalescence'],
 ARRAY['Nausea', 'Constipation', 'Allergic reaction (rare)'],
 ARRAY['Hypervitaminosis A or D', 'Haemochromatosis'],
 'मल्टीविटामिन', false),

('D-Rise 60K', 'Cholecalciferol (Vitamin D3)', 'Cholecalciferol 60000 IU', 'vitamin', 120.00, 'Cholecalciferol Sachets', 18.00, 85.00, 'Sachet (Powder)', '60000 IU', 'USV Pvt Ltd',
 ARRAY['Vitamin D deficiency', 'Osteomalacia', 'Rickets prevention', 'Bone health'],
 ARRAY['Nausea', 'Hypercalcaemia with overdose', 'Constipation'],
 ARRAY['Hypercalcaemia', 'Hypervitaminosis D'],
 'विटामिन डी3', true),

('Livogen', 'Ferrous Fumarate + Folic Acid', 'Ferrous Fumarate 300mg + Folic Acid 1.5mg', 'vitamin', 40.00, 'Ferrous Fumarate+Folic Acid Tablets', 6.00, 85.00, 'Tablet', '300mg+1.5mg', 'Procter & Gamble Health',
 ARRAY['Iron deficiency anaemia', 'Pregnancy supplementation', 'Post-operative anaemia'],
 ARRAY['Constipation', 'Dark stools', 'Epigastric pain'],
 ARRAY['Haemochromatosis', 'Thalassaemia (unless iron deficient)'],
 'आयरन की गोली', true),

('Zinc Dispersible (Zincolife)', 'Zinc Sulphate', 'Zinc Sulphate 20mg (Dispersible)', 'vitamin', 15.00, 'Zinc Dispersible Tablets', 3.00, 80.00, 'Dispersible Tablet', '20mg', 'Aristo Pharmaceuticals',
 ARRAY['Zinc supplementation in diarrhoea', 'Immune support', 'Wound healing'],
 ARRAY['Nausea', 'Metallic taste', 'Stomach cramps'],
 ARRAY['Known hypersensitivity'],
 'जिंक', true);


-- =============================================================================
-- CATEGORY: antifungal (5 medicines)
-- =============================================================================
INSERT INTO public.medicines (brand_name, generic_name, salt_composition, category, market_price, jan_aushadhi_name, jan_aushadhi_price, savings_percent, dosage_form, strength, manufacturer, uses, side_effects, contraindications, hindi_name, is_nlem) VALUES

('Flucos 150', 'Fluconazole', 'Fluconazole 150mg', 'antifungal', 40.00, 'Fluconazole Capsules', 5.00, 87.50, 'Capsule', '150mg', 'Cipla Ltd',
 ARRAY['Vaginal candidiasis', 'Oral thrush', 'Systemic fungal infections', 'Cryptococcal meningitis'],
 ARRAY['Nausea', 'Headache', 'Abdominal pain'],
 ARRAY['Concurrent terfenadine use', 'Known hypersensitivity'],
 'फ्लुकोनाज़ोल', true),

('Candid Cream', 'Clotrimazole', 'Clotrimazole 1% w/w', 'antifungal', 65.00, 'Clotrimazole Cream', 12.00, 81.54, 'Cream', '1% (20g)', 'Glenmark Pharmaceuticals',
 ARRAY['Ringworm (dermatophytosis)', 'Fungal skin infections', 'Candidal skin infections'],
 ARRAY['Local irritation', 'Burning sensation', 'Redness'],
 ARRAY['Known hypersensitivity to imidazoles'],
 'क्लोट्रिमाज़ोल क्रीम', true),

('Nizral', 'Ketoconazole', 'Ketoconazole 200mg', 'antifungal', 55.00, 'Ketoconazole Tablets', 8.00, 85.45, 'Tablet', '200mg', 'Johnson & Johnson',
 ARRAY['Systemic fungal infections', 'Seborrhoeic dermatitis', 'Pityriasis versicolor'],
 ARRAY['Hepatotoxicity', 'Nausea', 'Abdominal pain'],
 ARRAY['Liver disease', 'Concurrent hepatotoxic drugs'],
 'कीटोकोनाज़ोल', true),

('Lamisil', 'Terbinafine', 'Terbinafine 250mg', 'antifungal', 180.00, 'Terbinafine Tablets', 25.00, 86.11, 'Tablet', '250mg', 'Novartis India',
 ARRAY['Onychomycosis (nail fungus)', 'Tinea infections', 'Ringworm'],
 ARRAY['Taste disturbance', 'Nausea', 'Hepatotoxicity (rare)'],
 ARRAY['Chronic liver disease', 'Known hypersensitivity'],
 'टर्बीनाफीन', true),

('Sporanox', 'Itraconazole', 'Itraconazole 100mg', 'antifungal', 220.00, 'Itraconazole Capsules', 35.00, 84.09, 'Capsule', '100mg', 'Johnson & Johnson',
 ARRAY['Aspergillosis', 'Histoplasmosis', 'Onychomycosis', 'Systemic candidiasis'],
 ARRAY['Nausea', 'Hepatotoxicity', 'Oedema'],
 ARRAY['Congestive heart failure', 'Concurrent use with certain statins (lovastatin, simvastatin)'],
 'इट्राकोनाज़ोल', true);


-- =============================================================================
-- CATEGORY: antiparasitic (5 medicines)
-- =============================================================================
INSERT INTO public.medicines (brand_name, generic_name, salt_composition, category, market_price, jan_aushadhi_name, jan_aushadhi_price, savings_percent, dosage_form, strength, manufacturer, uses, side_effects, contraindications, hindi_name, is_nlem) VALUES

('Zentel', 'Albendazole', 'Albendazole 400mg', 'antiparasitic', 12.00, 'Albendazole Tablets', 2.50, 79.17, 'Chewable Tablet', '400mg', 'GSK Pharmaceuticals',
 ARRAY['Roundworm', 'Hookworm', 'Pinworm', 'Whipworm infections'],
 ARRAY['Nausea', 'Abdominal pain', 'Headache'],
 ARRAY['First trimester pregnancy', 'Hypersensitivity to benzimidazoles'],
 'कृमिनाशक गोली', true),

('Ivermectin (Ivecop)', 'Ivermectin', 'Ivermectin 12mg', 'antiparasitic', 55.00, 'Ivermectin Tablets', 8.00, 85.45, 'Tablet', '12mg', 'Menarini India',
 ARRAY['Strongyloidiasis', 'Scabies', 'Filariasis', 'Onchocerciasis'],
 ARRAY['Dizziness', 'Nausea', 'Skin rash (Mazzotti reaction in filariasis)'],
 ARRAY['Children under 15 kg', 'Pregnancy'],
 'आइवरमेक्टिन', true),

('Mebex', 'Mebendazole', 'Mebendazole 100mg', 'antiparasitic', 10.00, 'Mebendazole Tablets', 2.00, 80.00, 'Chewable Tablet', '100mg', 'Cipla Ltd',
 ARRAY['Worm infestations', 'Hookworm', 'Roundworm', 'Whipworm'],
 ARRAY['Abdominal pain', 'Diarrhoea', 'Flatulence'],
 ARRAY['Pregnancy', 'Known hypersensitivity'],
 'मेबेंडाज़ोल', true),

('Lariago', 'Chloroquine', 'Chloroquine Phosphate 250mg', 'antiparasitic', 20.00, 'Chloroquine Tablets', 3.50, 82.50, 'Tablet', '250mg (150mg base)', 'IPCA Laboratories',
 ARRAY['P. vivax malaria treatment', 'Malaria prophylaxis', 'Amoebic liver abscess'],
 ARRAY['Nausea', 'Retinal toxicity with prolonged use', 'Pruritus'],
 ARRAY['Retinal or visual field changes', 'Porphyria'],
 'क्लोरोक्वीन', true),

('Lumerax', 'Artemether + Lumefantrine', 'Artemether 80mg + Lumefantrine 480mg', 'antiparasitic', 90.00, 'Artemether+Lumefantrine Tablets', 15.00, 83.33, 'Tablet', '80mg+480mg', 'IPCA Laboratories',
 ARRAY['Uncomplicated P. falciparum malaria', 'ACT therapy for malaria'],
 ARRAY['Headache', 'Dizziness', 'Nausea'],
 ARRAY['First trimester pregnancy', 'Severe malaria (use IV artesunate)'],
 'मलेरिया की दवाई', true);


-- =============================================================================
-- CATEGORY: dermatological (5 medicines)
-- =============================================================================
INSERT INTO public.medicines (brand_name, generic_name, salt_composition, category, market_price, jan_aushadhi_name, jan_aushadhi_price, savings_percent, dosage_form, strength, manufacturer, uses, side_effects, contraindications, hindi_name, is_nlem) VALUES

('Betnovate C', 'Betamethasone + Clioquinol', 'Betamethasone Valerate 0.1% + Clioquinol 3%', 'dermatological', 55.00, 'Betamethasone Cream', 10.00, 81.82, 'Cream', '0.1%+3% (20g)', 'GSK Pharmaceuticals',
 ARRAY['Eczema', 'Dermatitis', 'Itching with secondary infection'],
 ARRAY['Skin thinning', 'Burning sensation', 'Hypopigmentation'],
 ARRAY['Viral skin infections (herpes)', 'Untreated bacterial infections'],
 'बीटामेथासोन क्रीम', true),

('T-Bact', 'Mupirocin', 'Mupirocin 2% w/w', 'dermatological', 150.00, 'Mupirocin Ointment', 30.00, 80.00, 'Ointment', '2% (5g)', 'GSK Pharmaceuticals',
 ARRAY['Impetigo', 'Wound infections', 'Nasal MRSA decolonisation'],
 ARRAY['Burning at application site', 'Itching', 'Rash'],
 ARRAY['Known hypersensitivity to mupirocin', 'Large open wounds (polyethylene glycol toxicity)'],
 'मुपीरोसिन', true),

('Silverex', 'Silver Sulfadiazine', 'Silver Sulfadiazine 1% w/w', 'dermatological', 70.00, 'Silver Sulfadiazine Cream', 15.00, 78.57, 'Cream', '1% (25g)', 'Ranbaxy Laboratories',
 ARRAY['Burn wound infection prevention', 'Second and third degree burns', 'Leg ulcers'],
 ARRAY['Transient leukopenia', 'Burning sensation', 'Skin discolouration'],
 ARRAY['Sulfonamide allergy', 'Pregnancy near term'],
 'सिल्वर सल्फाडायज़ीन', true),

('Elimite', 'Permethrin', 'Permethrin 5% w/w', 'dermatological', 85.00, 'Permethrin Cream', 18.00, 78.82, 'Cream', '5% (30g)', 'Cipla Ltd',
 ARRAY['Scabies', 'Head lice', 'Pediculosis'],
 ARRAY['Itching', 'Burning', 'Tingling at application site'],
 ARRAY['Known hypersensitivity to pyrethroids', 'Infants under 2 months'],
 'परमेथ्रिन', true),

('Benzac AC', 'Benzoyl Peroxide', 'Benzoyl Peroxide 2.5% w/w', 'dermatological', 180.00, 'Benzoyl Peroxide Gel', 30.00, 83.33, 'Gel', '2.5% (20g)', 'Galderma India',
 ARRAY['Acne vulgaris', 'Mild to moderate acne'],
 ARRAY['Dryness', 'Peeling', 'Redness'],
 ARRAY['Known hypersensitivity', 'Broken or sunburned skin'],
 'बेंज़ोयल पेरोक्साइड', false);


-- =============================================================================
-- CATEGORY: psychiatric (5 medicines)
-- =============================================================================
INSERT INTO public.medicines (brand_name, generic_name, salt_composition, category, market_price, jan_aushadhi_name, jan_aushadhi_price, savings_percent, dosage_form, strength, manufacturer, uses, side_effects, contraindications, hindi_name, is_nlem) VALUES

('Tryptomer 25', 'Amitriptyline', 'Amitriptyline 25mg', 'psychiatric', 18.00, 'Amitriptyline Tablets', 3.00, 83.33, 'Tablet', '25mg', 'Merind Ltd',
 ARRAY['Depression', 'Neuropathic pain', 'Migraine prophylaxis', 'Nocturnal enuresis in children'],
 ARRAY['Drowsiness', 'Dry mouth', 'Weight gain'],
 ARRAY['Recent myocardial infarction', 'Concurrent MAO inhibitor use'],
 'एमिट्रिप्टिलीन', true),

('Valium/Calmpose', 'Diazepam', 'Diazepam 5mg', 'psychiatric', 12.00, 'Diazepam Tablets', 2.50, 79.17, 'Tablet', '5mg', 'Piramal Healthcare',
 ARRAY['Anxiety disorders', 'Seizure management', 'Muscle spasm', 'Alcohol withdrawal'],
 ARRAY['Drowsiness', 'Dependence with prolonged use', 'Confusion in elderly'],
 ARRAY['Myasthenia gravis', 'Severe respiratory depression'],
 'डायजेपाम', true),

('Fludac 20', 'Fluoxetine', 'Fluoxetine 20mg', 'psychiatric', 45.00, 'Fluoxetine Capsules', 6.00, 86.67, 'Capsule', '20mg', 'Cadila Healthcare',
 ARRAY['Major depression', 'Obsessive-compulsive disorder', 'Panic disorder', 'Bulimia nervosa'],
 ARRAY['Nausea', 'Insomnia', 'Sexual dysfunction'],
 ARRAY['Concurrent MAO inhibitor use', 'Concurrent pimozide use'],
 'फ्लुओक्सेटिन', true),

('Olanex 5', 'Olanzapine', 'Olanzapine 5mg', 'psychiatric', 50.00, 'Olanzapine Tablets', 7.00, 86.00, 'Tablet', '5mg', 'Sun Pharma',
 ARRAY['Schizophrenia', 'Bipolar disorder (manic episodes)', 'Treatment-resistant depression (adjunct)'],
 ARRAY['Weight gain', 'Drowsiness', 'Metabolic syndrome'],
 ARRAY['Uncontrolled narrow-angle glaucoma', 'Known hypersensitivity'],
 'ओलैंज़ापीन', true),

('Serenace', 'Haloperidol', 'Haloperidol 5mg', 'psychiatric', 15.00, 'Haloperidol Tablets', 3.00, 80.00, 'Tablet', '5mg', 'RPG Life Sciences',
 ARRAY['Schizophrenia', 'Acute psychosis', 'Tourette syndrome', 'Severe agitation'],
 ARRAY['Extrapyramidal symptoms', 'Drowsiness', 'QT prolongation'],
 ARRAY['Parkinson disease', 'CNS depression'],
 'हेलोपेरिडोल', true);


-- =============================================================================
-- CATEGORY: ors_supplements (5 medicines)
-- =============================================================================
INSERT INTO public.medicines (brand_name, generic_name, salt_composition, category, market_price, jan_aushadhi_name, jan_aushadhi_price, savings_percent, dosage_form, strength, manufacturer, uses, side_effects, contraindications, hindi_name, is_nlem) VALUES

('Electral Powder', 'ORS (WHO Formula)', 'Sodium Chloride + Potassium Chloride + Sodium Citrate + Dextrose Anhydrous', 'ors_supplements', 22.00, 'ORS Powder (WHO)', 4.00, 81.82, 'Powder for Oral Solution', '21.8g per litre', 'FDC Ltd',
 ARRAY['Dehydration from diarrhoea', 'Oral rehydration therapy', 'Heat stroke recovery'],
 ARRAY['Vomiting if consumed too fast', 'Hypernatraemia if over-concentrated'],
 ARRAY['Intestinal obstruction', 'Severe persistent vomiting (use IV fluids)'],
 'ओआरएस', true),

('Zinc + ORS Kit (ZincORS)', 'Zinc Sulphate + ORS', 'Zinc Sulphate 20mg Dispersible + ORS Sachets', 'ors_supplements', 30.00, 'Zinc+ORS Kit', 6.00, 80.00, 'Kit (Tablet + Powder)', '20mg Zinc + ORS', 'FDC Ltd',
 ARRAY['Diarrhoea in children with rehydration', 'Zinc supplementation during diarrhoea', 'Reduced diarrhoea duration'],
 ARRAY['Nausea', 'Metallic taste', 'Vomiting'],
 ARRAY['Known hypersensitivity'],
 'जिंक+ओआरएस', true),

('Iron + Folic Acid (IFA) Tablets', 'Ferrous Sulphate + Folic Acid', 'Ferrous Sulphate 100mg (elemental Iron 20mg) + Folic Acid 0.5mg', 'ors_supplements', 8.00, 'IFA Tablets', 2.00, 75.00, 'Tablet', '100mg+0.5mg', 'Government Supply / Generic',
 ARRAY['Anaemia prevention', 'Pregnancy supplementation (national programme)', 'Adolescent anaemia prevention'],
 ARRAY['Constipation', 'Dark stools', 'Nausea'],
 ARRAY['Haemochromatosis', 'Repeated blood transfusions'],
 'आयरन फोलिक एसिड', true),

('Calcium Sandoz', 'Calcium Carbonate', 'Calcium Carbonate 1250mg (500mg elemental Calcium)', 'ors_supplements', 90.00, 'Calcium Carbonate Tablets', 12.00, 86.67, 'Effervescent Tablet', '500mg elemental Ca', 'Novartis India',
 ARRAY['Calcium supplementation', 'Osteoporosis prevention', 'Antacid action'],
 ARRAY['Constipation', 'Bloating', 'Hypercalcaemia (excess use)'],
 ARRAY['Hypercalcaemia', 'Severe renal impairment'],
 'कैल्शियम', true),

('ORS Apple (Electral Apple)', 'ORS (Flavoured)', 'Sodium Chloride + Potassium Chloride + Sodium Citrate + Dextrose (Apple flavoured)', 'ors_supplements', 25.00, 'ORS Powder (Apple)', 4.50, 82.00, 'Powder for Oral Solution', '21.8g per litre', 'FDC Ltd',
 ARRAY['Oral rehydration for children (better compliance)', 'Dehydration treatment', 'Diarrhoea management'],
 ARRAY['Vomiting if consumed too fast', 'Hypernatraemia in overdiluted/concentrated preparation'],
 ARRAY['Intestinal obstruction', 'Severe shock (use IV fluids)'],
 'ओआरएस (सेब वाला)', true);


-- =============================================================================
-- CATEGORY: antiemetic (3 medicines)
-- =============================================================================
INSERT INTO public.medicines (brand_name, generic_name, salt_composition, category, market_price, jan_aushadhi_name, jan_aushadhi_price, savings_percent, dosage_form, strength, manufacturer, uses, side_effects, contraindications, hindi_name, is_nlem) VALUES

('Emeset 8', 'Ondansetron', 'Ondansetron 8mg', 'antiemetic', 55.00, 'Ondansetron Tablets', 8.00, 85.45, 'Tablet', '8mg', 'Cipla Ltd',
 ARRAY['Chemotherapy-induced nausea', 'Post-operative nausea and vomiting', 'Radiation-induced nausea'],
 ARRAY['Headache', 'Constipation', 'QT prolongation (rare)'],
 ARRAY['Congenital long QT syndrome', 'Concurrent apomorphine use'],
 'ऑन्डैनसेट्रॉन', true),

('Perinorm', 'Metoclopramide', 'Metoclopramide 10mg', 'antiemetic', 15.00, 'Metoclopramide Tablets', 3.00, 80.00, 'Tablet', '10mg', 'IPCA Laboratories',
 ARRAY['Nausea and vomiting', 'Gastroparesis', 'GERD (short-term)', 'Migraine-associated nausea'],
 ARRAY['Drowsiness', 'Extrapyramidal symptoms', 'Restlessness'],
 ARRAY['Epilepsy', 'Phaeochromocytoma'],
 'मेटोक्लोप्रामाइड', true),

('Phenergan', 'Promethazine', 'Promethazine 25mg', 'antiemetic', 20.00, 'Promethazine Tablets', 4.00, 80.00, 'Tablet', '25mg', 'Sanofi India',
 ARRAY['Nausea and vomiting', 'Motion sickness', 'Allergic conditions', 'Sedation pre-procedure'],
 ARRAY['Drowsiness', 'Dry mouth', 'Blurred vision'],
 ARRAY['Children under 2 years', 'Severe hepatic impairment'],
 'प्रोमेथाज़ीन', true);


-- =============================================================================
-- CATEGORY: other_essential (15 medicines)
-- =============================================================================
INSERT INTO public.medicines (brand_name, generic_name, salt_composition, category, market_price, jan_aushadhi_name, jan_aushadhi_price, savings_percent, dosage_form, strength, manufacturer, uses, side_effects, contraindications, hindi_name, is_nlem) VALUES

('Human Actrapid', 'Insulin (Soluble)', 'Insulin Human Regular 100 IU/ml', 'other_essential', 195.00, 'Insulin Human Regular', 68.00, 65.13, 'Injection', '100 IU/ml (10ml vial)', 'Novo Nordisk India',
 ARRAY['Type 1 diabetes', 'Diabetic ketoacidosis', 'Hyperglycaemic emergencies'],
 ARRAY['Hypoglycaemia', 'Injection site reactions', 'Weight gain'],
 ARRAY['Hypoglycaemia', 'Known hypersensitivity'],
 'इंसुलिन (सॉल्युबल)', true),

('Adrenaline Injection', 'Adrenaline (Epinephrine)', 'Adrenaline 1mg/ml', 'other_essential', 30.00, 'Adrenaline Injection', 8.00, 73.33, 'Injection', '1mg/ml (1ml ampoule)', 'Neon Laboratories',
 ARRAY['Anaphylaxis', 'Cardiac arrest', 'Acute asthma (severe)', 'Local anaesthetic adjunct'],
 ARRAY['Palpitations', 'Tremor', 'Anxiety'],
 ARRAY['Narrow-angle glaucoma', 'Severe hypertension'],
 'एड्रेनालिन', true),

('Atropine Injection', 'Atropine Sulphate', 'Atropine Sulphate 0.6mg/ml', 'other_essential', 15.00, 'Atropine Injection', 4.00, 73.33, 'Injection', '0.6mg/ml (1ml)', 'Neon Laboratories',
 ARRAY['Bradycardia', 'Organophosphate poisoning', 'Pre-anaesthetic medication', 'Reversal of cholinergic effects'],
 ARRAY['Dry mouth', 'Tachycardia', 'Blurred vision'],
 ARRAY['Narrow-angle glaucoma', 'Paralytic ileus'],
 'एट्रोपिन', true),

('Dexona', 'Dexamethasone', 'Dexamethasone 0.5mg', 'other_essential', 12.00, 'Dexamethasone Tablets', 2.50, 79.17, 'Tablet', '0.5mg', 'Zydus Cadila',
 ARRAY['Severe allergic reactions', 'Cerebral oedema', 'Inflammatory conditions', 'Adrenal insufficiency'],
 ARRAY['Weight gain', 'Hyperglycaemia', 'Immunosuppression'],
 ARRAY['Systemic fungal infections', 'Live vaccine administration'],
 'डेक्सामेथासोन', true),

('Omnacortil', 'Prednisolone', 'Prednisolone 5mg', 'other_essential', 18.00, 'Prednisolone Tablets', 3.00, 83.33, 'Tablet', '5mg', 'Macleods Pharmaceuticals',
 ARRAY['Asthma exacerbations', 'Autoimmune diseases', 'Allergic reactions', 'Nephrotic syndrome'],
 ARRAY['Weight gain', 'Hyperglycaemia', 'Osteoporosis with long-term use'],
 ARRAY['Systemic fungal infections', 'Peptic ulcer (relative)'],
 'प्रेडनिसोलोन', true),

('Eptoin', 'Phenytoin', 'Phenytoin Sodium 100mg', 'other_essential', 15.00, 'Phenytoin Sodium Tablets', 3.00, 80.00, 'Tablet', '100mg', 'Abbott India',
 ARRAY['Epilepsy (generalised tonic-clonic)', 'Status epilepticus (IV)', 'Seizure prevention post-neurosurgery'],
 ARRAY['Gum hypertrophy', 'Ataxia', 'Nystagmus'],
 ARRAY['Sinus bradycardia', 'Heart block'],
 'फेनिटोइन', true),

('Tegretol', 'Carbamazepine', 'Carbamazepine 200mg', 'other_essential', 35.00, 'Carbamazepine Tablets', 5.00, 85.71, 'Tablet', '200mg', 'Novartis India',
 ARRAY['Epilepsy (focal seizures)', 'Trigeminal neuralgia', 'Bipolar disorder'],
 ARRAY['Drowsiness', 'Dizziness', 'Blood dyscrasias (rare)'],
 ARRAY['Bone marrow depression', 'AV block'],
 'कार्बामाज़ेपीन', true),

('Sodium Valproate (Valparin)', 'Sodium Valproate', 'Sodium Valproate 200mg', 'other_essential', 28.00, 'Sodium Valproate Tablets', 5.00, 82.14, 'Tablet', '200mg', 'Sanofi India',
 ARRAY['Epilepsy (generalised and focal)', 'Bipolar disorder', 'Migraine prophylaxis'],
 ARRAY['Weight gain', 'Tremor', 'Hepatotoxicity (rare)'],
 ARRAY['Liver disease', 'Pregnancy (teratogenic - neural tube defects)'],
 'सोडियम वैल्प्रोएट', true),

('Deriphyllin Injection', 'Aminophylline', 'Aminophylline 250mg/10ml', 'other_essential', 18.00, 'Aminophylline Injection', 5.00, 72.22, 'Injection', '250mg/10ml', 'Zydus Cadila',
 ARRAY['Acute severe asthma', 'Bronchospasm in COPD', 'Apnoea of prematurity'],
 ARRAY['Nausea', 'Tachycardia', 'Seizures at toxic levels'],
 ARRAY['Active peptic ulcer', 'Seizure disorders'],
 'एमिनोफाइलिन', true),

('Wysolone', 'Methylprednisolone', 'Methylprednisolone 4mg', 'other_essential', 40.00, 'Methylprednisolone Tablets', 7.00, 82.50, 'Tablet', '4mg', 'Pfizer India',
 ARRAY['Severe allergic reactions', 'Autoimmune disorders', 'Inflammatory conditions'],
 ARRAY['Weight gain', 'Insomnia', 'Hyperglycaemia'],
 ARRAY['Systemic fungal infections', 'Live vaccines'],
 'मिथाइलप्रेडनिसोलोन', true),

('Drotin DS', 'Drotaverine', 'Drotaverine 80mg', 'other_essential', 65.00, 'Drotaverine Tablets', 10.00, 84.62, 'Tablet', '80mg', 'Walter Bushnell',
 ARRAY['Smooth muscle spasm', 'Renal colic', 'Biliary colic', 'Dysmenorrhoea'],
 ARRAY['Nausea', 'Headache', 'Dizziness'],
 ARRAY['Severe hepatic failure', 'Severe renal failure'],
 'ड्रोटावेरीन', false),

('Glucon-D', 'Dextrose (Oral)', 'Dextrose (Glucose) Powder', 'other_essential', 50.00, 'Glucose Powder', 12.00, 76.00, 'Powder', '100g', 'Heinz India',
 ARRAY['Hypoglycaemia (low blood sugar)', 'Energy supplement', 'Heat exhaustion'],
 ARRAY['Hyperglycaemia in diabetics', 'Dental caries with frequent use'],
 ARRAY['Uncontrolled diabetes (use cautiously)'],
 'ग्लूकोज़', false),

('Avil 25', 'Pheniramine', 'Pheniramine Maleate 25mg', 'other_essential', 12.00, 'Pheniramine Tablets', 2.50, 79.17, 'Tablet', '25mg', 'Sanofi India',
 ARRAY['Allergic rhinitis', 'Urticaria', 'Insect bite reactions', 'Common cold symptoms'],
 ARRAY['Drowsiness', 'Dry mouth', 'Blurred vision'],
 ARRAY['Narrow-angle glaucoma', 'Prostatic hypertrophy with urinary retention'],
 'एविल', true),

('Betadine', 'Povidone Iodine', 'Povidone Iodine 5% w/v', 'other_essential', 55.00, 'Povidone Iodine Solution', 12.00, 78.18, 'Solution', '5% (500ml)', 'Win-Medicare Pvt Ltd',
 ARRAY['Wound antisepsis', 'Pre-surgical skin preparation', 'Minor cut and burn disinfection'],
 ARRAY['Skin irritation', 'Iodine staining', 'Rare allergic reaction'],
 ARRAY['Iodine hypersensitivity', 'Thyroid disorders (prolonged large area use)'],
 'बीटाडीन', false),

('Metrogyl IV', 'Metronidazole (IV)', 'Metronidazole 500mg/100ml', 'other_essential', 35.00, 'Metronidazole IV Infusion', 8.00, 77.14, 'IV Infusion', '500mg/100ml', 'J B Chemicals',
 ARRAY['Severe anaerobic infections', 'Intra-abdominal sepsis', 'Post-surgical prophylaxis'],
 ARRAY['Nausea', 'Metallic taste', 'Peripheral neuropathy with prolonged use'],
 ARRAY['First trimester pregnancy', 'Alcohol use during treatment'],
 'मेट्रोनिडाजोल (IV)', true);


-- =============================================================================
-- CATEGORY: additional essential medicines (to reach ~150 total)
-- =============================================================================
INSERT INTO public.medicines (brand_name, generic_name, salt_composition, category, market_price, jan_aushadhi_name, jan_aushadhi_price, savings_percent, dosage_form, strength, manufacturer, uses, side_effects, contraindications, hindi_name, is_nlem) VALUES

('Norvasc 5', 'Amlodipine', 'Amlodipine Besylate 5mg', 'cardiac', 65.00, 'Amlodipine Tablets', 5.00, 92.31, 'Tablet', '5mg', 'Pfizer India',
 ARRAY['Hypertension', 'Chronic stable angina', 'Vasospastic angina'],
 ARRAY['Peripheral oedema', 'Headache', 'Dizziness'],
 ARRAY['Severe hypotension', 'Cardiogenic shock'],
 'एम्लोडिपिन', true),

('Levolin Inhaler', 'Levosalbutamol', 'Levosalbutamol 50mcg/puff', 'respiratory', 140.00, 'Levosalbutamol Inhaler', 35.00, 75.00, 'Metered Dose Inhaler', '50mcg/puff (200 doses)', 'Cipla Ltd',
 ARRAY['Acute bronchospasm', 'Asthma', 'COPD exacerbations'],
 ARRAY['Tremor', 'Palpitations', 'Headache'],
 ARRAY['Tachyarrhythmia', 'Hypertrophic cardiomyopathy'],
 'लेवोसालबुटामोल', true),

('Glycomet SR 500', 'Metformin (Sustained Release)', 'Metformin Hydrochloride 500mg SR', 'antidiabetic', 42.00, 'Metformin SR Tablets', 6.00, 85.71, 'Sustained Release Tablet', '500mg', 'USV Pvt Ltd',
 ARRAY['Type 2 diabetes mellitus', 'Better GI tolerability than immediate release'],
 ARRAY['Nausea (less than IR)', 'Diarrhoea', 'Lactic acidosis (rare)'],
 ARRAY['Renal failure (eGFR <30)', 'Severe dehydration'],
 'मेटफॉर्मिन एसआर', true),

('Oflomac 200', 'Ofloxacin', 'Ofloxacin 200mg', 'antibiotic', 65.00, 'Ofloxacin Tablets', 8.00, 87.69, 'Tablet', '200mg', 'Macleods Pharmaceuticals',
 ARRAY['Urinary tract infections', 'Respiratory tract infections', 'Skin infections'],
 ARRAY['Nausea', 'Dizziness', 'Insomnia'],
 ARRAY['Epilepsy', 'Pregnancy and breastfeeding'],
 'ओफ्लोक्सेसिन', true),

('Diclomol', 'Diclofenac + Paracetamol', 'Diclofenac 50mg + Paracetamol 325mg', 'analgesic', 35.00, 'Diclofenac+Paracetamol Tablets', 5.50, 84.29, 'Tablet', '50mg+325mg', 'Mankind Pharma',
 ARRAY['Moderate pain', 'Post-operative pain', 'Dental pain', 'Musculoskeletal pain'],
 ARRAY['Gastric irritation', 'Nausea', 'Dizziness'],
 ARRAY['Peptic ulcer', 'Severe hepatic impairment'],
 'डाइक्लोफेनेक+पैरासिटामोल', false),

('Telma 40', 'Telmisartan', 'Telmisartan 40mg', 'antihypertensive', 85.00, 'Telmisartan Tablets', 10.00, 88.24, 'Tablet', '40mg', 'Glenmark Pharmaceuticals',
 ARRAY['Hypertension', 'Cardiovascular risk reduction', 'Diabetic nephropathy'],
 ARRAY['Dizziness', 'Back pain', 'Upper respiratory infection'],
 ARRAY['Pregnancy', 'Bilateral renal artery stenosis'],
 'टेल्मिसार्टन', true),

('Losacar 50', 'Losartan', 'Losartan Potassium 50mg', 'antihypertensive', 78.00, 'Losartan Tablets', 9.00, 88.46, 'Tablet', '50mg', 'Sun Pharma',
 ARRAY['Hypertension', 'Diabetic nephropathy', 'Stroke prevention'],
 ARRAY['Dizziness', 'Hyperkalaemia', 'Fatigue'],
 ARRAY['Pregnancy', 'Severe hepatic impairment'],
 'लोसार्टन', true),

('Cardace 2.5', 'Ramipril', 'Ramipril 2.5mg', 'antihypertensive', 92.00, 'Ramipril Tablets', 11.00, 88.04, 'Tablet', '2.5mg', 'Aventis Pharma',
 ARRAY['Hypertension', 'Heart failure', 'Post-MI cardioprotection'],
 ARRAY['Dry cough', 'Dizziness', 'Hypotension'],
 ARRAY['Pregnancy', 'Angioedema history'],
 'रैमिप्रिल', true),

('Aten 50', 'Atenolol', 'Atenolol 50mg', 'antihypertensive', 28.00, 'Atenolol Tablets', 3.50, 87.50, 'Tablet', '50mg', 'Zydus Cadila',
 ARRAY['Hypertension', 'Angina pectoris', 'Post-MI management'],
 ARRAY['Bradycardia', 'Cold extremities', 'Fatigue'],
 ARRAY['Asthma', 'Heart block', 'Severe bradycardia'],
 'एटेनोलोल', true),

('Betaloc 25', 'Metoprolol', 'Metoprolol Succinate 25mg', 'antihypertensive', 62.00, 'Metoprolol Tablets', 7.00, 88.71, 'Tablet', '25mg', 'AstraZeneca',
 ARRAY['Hypertension', 'Angina', 'Heart failure', 'Arrhythmias'],
 ARRAY['Bradycardia', 'Fatigue', 'Dizziness'],
 ARRAY['Cardiogenic shock', 'Severe bradycardia'],
 'मेटोप्रोलोल', true),

('Nebicard 5', 'Nebivolol', 'Nebivolol 5mg', 'antihypertensive', 105.00, 'Nebivolol Tablets', 15.00, 85.71, 'Tablet', '5mg', 'Torrent Pharmaceuticals',
 ARRAY['Hypertension', 'Mild to moderate heart failure'],
 ARRAY['Headache', 'Dizziness', 'Fatigue'],
 ARRAY['Severe hepatic impairment', 'Acute heart failure'],
 'नेबिवोलोल', true),

('Clinidip 10', 'Cilnidipine', 'Cilnidipine 10mg', 'antihypertensive', 95.00, 'Cilnidipine Tablets', 12.00, 87.37, 'Tablet', '10mg', 'Ajanta Pharma',
 ARRAY['Hypertension', 'Dual channel calcium blocker benefits'],
 ARRAY['Headache', 'Ankle swelling', 'Flushing'],
 ARRAY['Severe hypotension', 'Pregnancy'],
 'सिल्निडिपिन', false),

('Olmy 20', 'Olmesartan', 'Olmesartan Medoxomil 20mg', 'antihypertensive', 110.00, 'Olmesartan Tablets', 14.00, 87.27, 'Tablet', '20mg', 'Mankind Pharma',
 ARRAY['Hypertension', 'Renal protection in diabetes'],
 ARRAY['Dizziness', 'Diarrhoea', 'Headache'],
 ARRAY['Pregnancy', 'Biliary obstruction'],
 'ओल्मेसार्टन', true),

('Diovan 80', 'Valsartan', 'Valsartan 80mg', 'antihypertensive', 125.00, 'Valsartan Tablets', 16.00, 87.20, 'Tablet', '80mg', 'Novartis India',
 ARRAY['Hypertension', 'Heart failure', 'Post-MI'],
 ARRAY['Dizziness', 'Hyperkalaemia', 'Renal dysfunction'],
 ARRAY['Pregnancy', 'Severe hepatic impairment'],
 'वाल्सार्टन', true),

('Hydrochlorothiazide 12.5', 'Hydrochlorothiazide', 'Hydrochlorothiazide 12.5mg', 'antihypertensive', 18.00, 'Hydrochlorothiazide Tablets', 2.00, 88.89, 'Tablet', '12.5mg', 'Cadila Healthcare',
 ARRAY['Hypertension', 'Oedema', 'Combination therapy'],
 ARRAY['Hypokalemia', 'Hyperuricemia', 'Photosensitivity'],
 ARRAY['Anuria', 'Severe renal failure'],
 'हाइड्रोक्लोरोथायजाइड', true),

('Lasix 40', 'Furosemide', 'Furosemide 40mg', 'antihypertensive', 15.00, 'Furosemide Tablets', 2.00, 86.67, 'Tablet', '40mg', 'Aventis Pharma',
 ARRAY['Oedema', 'Heart failure', 'Hypertension', 'Renal impairment'],
 ARRAY['Dehydration', 'Hypokalaemia', 'Ototoxicity'],
 ARRAY['Anuria', 'Severe electrolyte depletion'],
 'फ्यूरोसेमाइड', true),

('Aldactone 25', 'Spironolactone', 'Spironolactone 25mg', 'antihypertensive', 45.00, 'Spironolactone Tablets', 5.00, 88.89, 'Tablet', '25mg', 'RPG Life Sciences',
 ARRAY['Heart failure', 'Hypertension', 'Oedema', 'Hyperaldosteronism'],
 ARRAY['Hyperkalaemia', 'Gynecomastia', 'Menstrual irregularities'],
 ARRAY['Anuria', 'Severe renal impairment', 'Hyperkalaemia'],
 'स्पिरोनोलैक्टोन', true);


-- =============================================================================
-- PEDIATRIC FORMULATIONS (Syrups, Drops, Suspensions)
-- =============================================================================

INSERT INTO public.medicines (brand_name, generic_name, salt_composition, category, market_price, jan_aushadhi_name, jan_aushadhi_price, savings_percent, dosage_form, strength, manufacturer, uses, side_effects, contraindications, hindi_name, is_nlem) VALUES
('Crocin Drops', 'Paracetamol', 'Paracetamol 100mg/ml', 'analgesic', 45.00, 'Paracetamol Oral Drops', 18.00, 60.00, 'Oral Drops', '100mg/ml', 'GlaxoSmithKline', ARRAY['Fever in infants', 'Pain relief in children', 'Post-vaccination fever', 'Teething pain'], ARRAY['Nausea', 'Rash', 'Liver toxicity with overdose'], ARRAY['Liver disease', 'Alcohol dependence'], 'क्रोसिन बूंदें', true),
('Ibugesic Plus Suspension', 'Ibuprofen + Paracetamol', 'Ibuprofen 100mg + Paracetamol 162.5mg/5ml', 'analgesic', 68.00, 'Ibuprofen Paracetamol Suspension', 28.00, 58.82, 'Suspension', '100mg+162.5mg/5ml', 'Cipla', ARRAY['High fever in children', 'Pain and inflammation', 'Post-immunization fever', 'Dental pain'], ARRAY['Stomach upset', 'Nausea', 'Dizziness', 'Rash'], ARRAY['Peptic ulcer', 'Asthma', 'Severe renal impairment'], 'इबुगेसिक प्लस सस्पेंशन', true),
('Mox Syrup', 'Amoxicillin', 'Amoxicillin 125mg/5ml', 'antibiotic', 52.00, 'Amoxicillin Syrup', 22.00, 57.69, 'Syrup', '125mg/5ml', 'Ranbaxy', ARRAY['Respiratory tract infections', 'Ear infections', 'Urinary tract infections', 'Skin infections'], ARRAY['Diarrhea', 'Nausea', 'Allergic rash', 'Vomiting'], ARRAY['Penicillin allergy', 'Infectious mononucleosis'], 'मोक्स सिरप', true),
('Novamox Syrup', 'Amoxicillin', 'Amoxicillin 250mg/5ml', 'antibiotic', 78.00, 'Amoxicillin Syrup', 32.00, 58.97, 'Syrup', '250mg/5ml', 'Cipla', ARRAY['Bacterial infections', 'Throat infections', 'Pneumonia', 'Otitis media in children'], ARRAY['Loose motions', 'Abdominal cramps', 'Skin rash'], ARRAY['Allergy to penicillin', 'Kidney disease'], 'नोवामोक्स सिरप', true),
('Azee Syrup', 'Azithromycin', 'Azithromycin 200mg/5ml', 'antibiotic', 95.00, 'Azithromycin Suspension', 38.00, 60.00, 'Suspension', '200mg/5ml', 'Cipla', ARRAY['Respiratory infections', 'Typhoid in children', 'Ear and throat infections', 'Community-acquired pneumonia'], ARRAY['Diarrhea', 'Abdominal pain', 'Nausea', 'Headache'], ARRAY['Liver disease', 'Arrhythmia history'], 'एज़ी सिरप', true),
('Cetzine Syrup', 'Cetirizine', 'Cetirizine 5mg/5ml', 'respiratory', 42.00, 'Cetirizine Syrup', 16.00, 61.90, 'Syrup', '5mg/5ml', 'Dr. Reddy\'s', ARRAY['Allergic rhinitis in children', 'Urticaria', 'Hay fever', 'Itching and skin allergies'], ARRAY['Drowsiness', 'Fatigue', 'Dry mouth', 'Headache'], ARRAY['Severe kidney disease', 'Hypersensitivity'], 'सेटज़िन सिरप', true),
('Zincovit Drops', 'Multivitamin + Zinc', 'Zinc + Vitamins A, B, C, D', 'vitamin', 125.00, 'Multivitamin Zinc Drops', 55.00, 56.00, 'Oral Drops', '15ml', 'Apex Laboratories', ARRAY['Nutritional deficiency in infants', 'Immunity booster', 'Growth support', 'Appetite stimulation'], ARRAY['Nausea', 'Metallic taste', 'Stomach upset'], ARRAY['Hemochromatosis', 'Wilson\'s disease'], 'ज़िंकोविट बूंदें', false),
('Tonoferon Drops', 'Iron + Folic Acid', 'Ferrous Ascorbate + Folic Acid', 'vitamin', 68.00, 'Iron Folic Acid Drops', 28.00, 58.82, 'Drops', '20mg/ml', 'Canixa Life Sciences', ARRAY['Iron deficiency anemia in children', 'Nutritional anemia', 'Growth support', 'Hemoglobin building'], ARRAY['Black stools', 'Constipation', 'Nausea', 'Stomach upset'], ARRAY['Hemochromatosis', 'Thalassemia'], 'टोनोफेरॉन बूंदें', true),
('Domstal Drops', 'Domperidone', 'Domperidone 5mg/ml', 'antiemetic', 52.00, 'Domperidone Drops', 22.00, 57.69, 'Drops', '5mg/ml', 'Torrent Pharmaceuticals', ARRAY['Vomiting in infants', 'Nausea', 'Gastric reflux', 'Motion sickness'], ARRAY['Dry mouth', 'Diarrhea', 'Headache'], ARRAY['Cardiac arrhythmia', 'GI hemorrhage'], 'डोमस्टल बूंदें', true),
('Emeset Syrup', 'Ondansetron', 'Ondansetron 2mg/5ml', 'antiemetic', 58.00, 'Ondansetron Syrup', 24.00, 58.62, 'Syrup', '2mg/5ml', 'Cipla', ARRAY['Vomiting in children', 'Nausea post-surgery', 'Chemotherapy-induced nausea', 'Gastroenteritis'], ARRAY['Headache', 'Constipation', 'Fatigue', 'Dizziness'], ARRAY['Congenital long QT syndrome', 'Apomorphine use'], 'एमसेट सिरप', true),
('Zinconia Syrup', 'Zinc', 'Zinc Acetate 20mg/5ml', 'vitamin', 45.00, 'Zinc Syrup', 18.00, 60.00, 'Syrup', '20mg/5ml', 'Franco-Indian Pharma', ARRAY['Diarrhea in children', 'Zinc deficiency', 'Immune support', 'Growth promotion'], ARRAY['Nausea', 'Stomach cramps', 'Metallic taste'], ARRAY['Copper deficiency', 'Hemochromatosis'], 'ज़िंकोनिया सिरप', true),
('ORS Zinc Dispersible', 'Zinc', 'Zinc Sulfate 20mg', 'vitamin', 12.00, 'Zinc Dispersible Tablets', 5.00, 58.33, 'Dispersible Tablet', '20mg', 'Multiple Manufacturers', ARRAY['Acute diarrhea in children', 'Zinc supplementation during diarrhea', 'Dehydration prevention'], ARRAY['Mild nausea', 'Metallic taste'], ARRAY['Wilson\'s disease'], 'ओआरएस ज़िंक गोली', true),
('Septran Syrup', 'Cotrimoxazole', 'Sulfamethoxazole 200mg + Trimethoprim 40mg/5ml', 'antibiotic', 52.00, 'Cotrimoxazole Suspension', 22.00, 57.69, 'Syrup', '200mg+40mg/5ml', 'GlaxoSmithKline', ARRAY['Urinary tract infections', 'Respiratory infections', 'Typhoid fever', 'Ear infections'], ARRAY['Nausea', 'Vomiting', 'Rash', 'Diarrhea'], ARRAY['Folate deficiency', 'Severe liver disease', 'G6PD deficiency'], 'सेप्ट्रान सिरप', true),
('Taxim-O Dry Syrup', 'Cefixime', 'Cefixime 50mg/5ml', 'antibiotic', 92.00, 'Cefixime Suspension', 38.00, 58.70, 'Dry Syrup', '50mg/5ml', 'Alkem Laboratories', ARRAY['Typhoid fever', 'Urinary tract infections', 'Respiratory infections', 'Gonorrhea'], ARRAY['Diarrhea', 'Abdominal pain', 'Nausea', 'Flatulence'], ARRAY['Cephalosporin allergy', 'Severe renal impairment'], 'टैक्सिम-ओ सिरप', true),
('Woodward\'s Gripe Water', 'gi', 'Dill Oil + Sodium Bicarbonate', 'gi', 85.00, NULL, NULL, NULL, 'Liquid', '130ml', 'Reckitt Benckiser', ARRAY['Infant colic', 'Flatulence in babies', 'Stomach discomfort', 'Hiccups'], ARRAY['Rare allergic reactions'], ARRAY['Hypersensitivity to ingredients'], 'वुडवर्ड ग्राइप वाटर', false),
('Calcimax-D3 Drops', 'Calcium + Vitamin D3', 'Calcium 200mg + Vitamin D3 200IU/ml', 'vitamin', 95.00, 'Calcium Vitamin D3 Drops', 42.00, 55.79, 'Drops', '15ml', 'Lupin', ARRAY['Calcium deficiency in infants', 'Rickets prevention', 'Bone development', 'Vitamin D deficiency'], ARRAY['Constipation', 'Flatulence', 'Stomach upset'], ARRAY['Hypercalcemia', 'Kidney stones'], 'कैल्सीमैक्स-डी3 बूंदें', false),
('Cholecalciferol Drops', 'Vitamin D3', 'Vitamin D3 400IU/drop', 'vitamin', 78.00, 'Vitamin D3 Drops', 32.00, 58.97, 'Drops', '400IU/drop', 'Various Manufacturers', ARRAY['Vitamin D deficiency', 'Rickets prevention', 'Bone health', 'Immune support'], ARRAY['Hypercalcemia', 'Weakness', 'Nausea'], ARRAY['Hypervitaminosis D', 'Hypercalcemia'], 'कोलेकैल्सीफेरॉल बूंदें', true),
('Meftal-P Suspension', 'Mefenamic Acid + Paracetamol', 'Mefenamic Acid 50mg + Paracetamol 125mg/5ml', 'analgesic', 62.00, 'Mefenamic Acid Paracetamol Suspension', 26.00, 58.06, 'Suspension', '50mg+125mg/5ml', 'Blue Cross', ARRAY['Fever with pain in children', 'Dental pain', 'Post-immunization fever', 'Headache'], ARRAY['Nausea', 'Diarrhea', 'Stomach upset', 'Drowsiness'], ARRAY['Peptic ulcer', 'Asthma', 'Renal impairment'], 'मेफ्टल-पी सस्पेंशन', false),
('Augmentin Duo Syrup', 'Amoxicillin + Clavulanic Acid', 'Amoxicillin 200mg + Clavulanic Acid 28.5mg/5ml', 'antibiotic', 125.00, 'Amoxicillin Clavulanic Acid Suspension', 52.00, 58.40, 'Syrup', '200mg+28.5mg/5ml', 'GlaxoSmithKline', ARRAY['Resistant bacterial infections', 'Lower respiratory infections', 'Otitis media', 'Sinusitis'], ARRAY['Diarrhea', 'Nausea', 'Skin rash', 'Vomiting'], ARRAY['Penicillin allergy', 'Hepatic dysfunction'], 'ऑगमेंटिन डुओ सिरप', true),
('Cepodem Syrup', 'Cefpodoxime', 'Cefpodoxime 50mg/5ml', 'antibiotic', 98.00, 'Cefpodoxime Suspension', 42.00, 57.14, 'Syrup', '50mg/5ml', 'Mankind Pharma', ARRAY['Respiratory tract infections', 'Urinary tract infections', 'Skin infections', 'Typhoid'], ARRAY['Diarrhea', 'Nausea', 'Abdominal pain', 'Headache'], ARRAY['Cephalosporin allergy', 'Colitis'], 'सेपोडेम सिरप', true),
('Erythrocin Syrup', 'Erythromycin', 'Erythromycin 125mg/5ml', 'antibiotic', 72.00, 'Erythromycin Suspension', 30.00, 58.33, 'Syrup', '125mg/5ml', 'Abbott', ARRAY['Respiratory infections', 'Whooping cough', 'Diphtheria', 'Penicillin-allergic patients'], ARRAY['Nausea', 'Vomiting', 'Diarrhea', 'Abdominal cramps'], ARRAY['Liver disease', 'Concurrent use with ergot derivatives'], 'एरिथ्रोसिन सिरप', true),
('Relent Syrup', 'Cetirizine + Ambroxol', 'Cetirizine 2.5mg + Ambroxol 15mg/5ml', 'Antihistamine + Mucolytic', 85.00, NULL, NULL, NULL, 'Syrup', '2.5mg+15mg/5ml', 'Aristo Pharmaceuticals', ARRAY['Productive cough with allergy', 'Bronchitis in children', 'Asthma with mucus', 'Allergic rhinitis'], ARRAY['Drowsiness', 'Nausea', 'Dizziness', 'Dry mouth'], ARRAY['Peptic ulcer', 'Convulsions'], 'रिलेंट सिरप', false),
('Doxycycline Syrup', 'Doxycycline', 'Doxycycline 50mg/5ml', 'antibiotic', 88.00, 'Doxycycline Suspension', 36.00, 59.09, 'Syrup', '50mg/5ml', 'Micro Labs', ARRAY['Bacterial infections', 'Malaria prophylaxis', 'Acne in adolescents', 'Respiratory infections'], ARRAY['Nausea', 'Diarrhea', 'Photosensitivity', 'Tooth discoloration'], ARRAY['Children under 8 years', 'Pregnancy', 'Liver disease'], 'डॉक्सीसाइक्लिन सिरप', true),
('Norflox TZ Syrup', 'Norfloxacin + Tinidazole', 'Norfloxacin 100mg + Tinidazole 150mg/5ml', 'Antibiotic + Antiprotozoal', 78.00, NULL, NULL, NULL, 'Syrup', '100mg+150mg/5ml', 'Cipla', ARRAY['Diarrhea in children', 'Dysentery', 'Gastroenteritis', 'Mixed infections'], ARRAY['Nausea', 'Dizziness', 'Metallic taste', 'Headache'], ARRAY['Children under 12 years (generally)', 'CNS disorders'], 'नोरफ्लोक्स टीज़ेड सिरप', false),
('Levocetirizine Syrup', 'Levocetirizine', 'Levocetirizine 2.5mg/5ml', 'respiratory', 55.00, 'Levocetirizine Syrup', 24.00, 56.36, 'Syrup', '2.5mg/5ml', 'Sun Pharma', ARRAY['Allergic rhinitis', 'Chronic urticaria', 'Seasonal allergies', 'Itching'], ARRAY['Drowsiness', 'Fatigue', 'Dry mouth'], ARRAY['Severe renal impairment', 'End-stage renal disease'], 'लेवोसेटिरिज़ीन सिरप', true),

-- =============================================================================
-- TOPICAL/EXTERNAL PREPARATIONS (Creams, Ointments, Gels, Lotions)
-- =============================================================================

('Soframycin Cream', 'Framycetin', 'Framycetin Sulfate 1% w/w', 'Topical Antibiotic', 58.00, 'Framycetin Cream', 24.00, 58.62, 'Cream', '1% w/w', 'Sanofi India', ARRAY['Bacterial skin infections', 'Infected wounds', 'Burns', 'Impetigo', 'Cuts and abrasions'], ARRAY['Skin irritation', 'Redness', 'Itching'], ARRAY['Hypersensitivity to aminoglycosides', 'Large area burns'], 'सोफ्रामाइसिन क्रीम', false),
('Neosporin Ointment', 'Neomycin + Polymyxin + Bacitracin', 'Neomycin 5mg + Polymyxin B 5000IU + Bacitracin 400IU/g', 'Topical Antibiotic', 95.00, NULL, NULL, NULL, 'Ointment', '5g', 'Johnson & Johnson', ARRAY['Minor cuts', 'Scrapes', 'Burns', 'Wound infection prevention', 'Skin infections'], ARRAY['Allergic dermatitis', 'Redness', 'Itching', 'Rash'], ARRAY['Deep puncture wounds', 'Animal bites', 'Serious burns'], 'नियोस्पोरिन मरहम', false),
('Boroline Cream', 'Antiseptic Cream', 'Boric Acid + Zinc Oxide', 'dermatological', 42.00, NULL, NULL, NULL, 'Cream', '20g', 'G.D. Pharmaceuticals', ARRAY['Dry skin', 'Chapped lips', 'Minor burns', 'Cuts and wounds', 'Cracked heels'], ARRAY['Rare skin irritation'], ARRAY['Deep wounds', 'Hypersensitivity'], 'बोरोलीन क्रीम', false),
('Burnol Cream', 'Silver Sulfadiazine', 'Silver Sulfadiazine 1% w/w', 'Burn Treatment', 48.00, 'Silver Sulfadiazine Cream', 20.00, 58.33, 'Cream', '1% w/w', 'Reckitt Benckiser', ARRAY['Burns', 'Scalds', 'Wound healing', 'Infected burns'], ARRAY['Skin rash', 'Itching', 'Transient leucopenia'], ARRAY['Sulfonamide allergy', 'G6PD deficiency', 'Pregnancy'], 'बर्नोल क्रीम', false),
('Silverex Cream', 'Silver Sulfadiazine', 'Silver Sulfadiazine 1% w/w', 'Topical Antibacterial', 125.00, 'Silver Sulfadiazine Cream', 52.00, 58.40, 'Cream', '1% w/w', 'Mankind Pharma', ARRAY['Second and third-degree burns', 'Burn wound sepsis prevention', 'Chronic wounds', 'Diabetic foot ulcers'], ARRAY['Leucopenia', 'Skin discoloration', 'Burning sensation'], ARRAY['Premature infants', 'Pregnant women at term', 'G6PD deficiency'], 'सिल्वरेक्स क्रीम', false),
('Lacto Calamine Lotion', 'Calamine + Zinc Oxide', 'Calamine 8% + Zinc Oxide 5%', 'Skin Protectant', 135.00, 'Calamine Lotion', 58.00, 57.04, 'Lotion', '120ml', 'Piramal Healthcare', ARRAY['Itchy skin', 'Sunburn', 'Insect bites', 'Rashes', 'Prickly heat'], ARRAY['Dryness', 'Mild irritation'], ARRAY['Open wounds', 'Hypersensitivity'], 'लैक्टो कैलामाइन लोशन', false),
('Tenovate Cream', 'Clobetasol Propionate', 'Clobetasol Propionate 0.05% w/w', 'Topical Corticosteroid', 88.00, 'Clobetasol Cream', 36.00, 59.09, 'Cream', '0.05% w/w', 'GlaxoSmithKline', ARRAY['Severe eczema', 'Psoriasis', 'Lichen planus', 'Severe dermatitis', 'Resistant skin conditions'], ARRAY['Skin thinning', 'Burning sensation', 'Itching', 'Skin atrophy'], ARRAY['Viral skin infections', 'Acne', 'Rosacea', 'Perioral dermatitis'], 'टेनोवेट क्रीम', false),
('Fucidin Cream', 'Fusidic Acid', 'Fusidic Acid 2% w/w', 'Topical Antibiotic', 165.00, 'Fusidic Acid Cream', 68.00, 58.79, 'Cream', '2% w/w', 'Leo Pharma', ARRAY['Impetigo', 'Infected dermatitis', 'Folliculitis', 'Bacterial skin infections'], ARRAY['Local irritation', 'Rash', 'Urticaria'], ARRAY['Hypersensitivity to fusidic acid'], 'फ्यूसिडिन क्रीम', false),
('Adapalene Gel', 'Adapalene', 'Adapalene 0.1% w/w', 'dermatological', 325.00, 'Adapalene Gel', 135.00, 58.46, 'Gel', '0.1% w/w', 'Galderma', ARRAY['Acne vulgaris', 'Comedonal acne', 'Inflammatory acne', 'Blackheads and whiteheads'], ARRAY['Skin dryness', 'Redness', 'Peeling', 'Photosensitivity'], ARRAY['Eczema', 'Pregnancy', 'Sunburn'], 'एडापालीन जेल', false),
('Deriva CMS Gel', 'Adapalene + Clindamycin', 'Adapalene 0.1% + Clindamycin 1%', 'dermatological', 385.00, NULL, NULL, NULL, 'Gel', '15g', 'Glenmark', ARRAY['Moderate to severe acne', 'Inflammatory acne', 'Comedonal acne'], ARRAY['Dryness', 'Peeling', 'Redness', 'Burning'], ARRAY['Crohn\'s disease', 'Ulcerative colitis', 'Pregnancy'], 'डेरिवा सीएमएस जेल', false),
('Benzoyl Peroxide Gel', 'Benzoyl Peroxide', 'Benzoyl Peroxide 2.5% w/w', 'dermatological', 165.00, 'Benzoyl Peroxide Gel', 68.00, 58.79, 'Gel', '2.5% w/w', 'Galderma', ARRAY['Acne vulgaris', 'Comedones', 'Inflammatory acne lesions'], ARRAY['Dryness', 'Peeling', 'Redness', 'Bleaching of fabrics'], ARRAY['Very sensitive skin', 'Pregnancy'], 'बेंज़ॉयल पेरोक्साइड जेल', false),
('Lulifin Cream', 'Luliconazole', 'Luliconazole 1% w/w', 'antifungal', 285.00, NULL, NULL, NULL, 'Cream', '1% w/w', 'Glenmark', ARRAY['Athlete\'s foot', 'Jock itch', 'Ringworm', 'Fungal skin infections'], ARRAY['Skin irritation', 'Redness', 'Burning sensation'], ARRAY['Hypersensitivity to imidazoles'], 'लुलिफिन क्रीम', false),
('Onabet Cream', 'Sertaconazole', 'Sertaconazole Nitrate 2% w/w', 'antifungal', 245.00, NULL, NULL, NULL, 'Cream', '2% w/w', 'Glenmark', ARRAY['Athlete\'s foot', 'Jock itch', 'Tinea corporis', 'Candidal infections'], ARRAY['Burning sensation', 'Contact dermatitis', 'Erythema'], ARRAY['Hypersensitivity'], 'ओनाबेट क्रीम', false),
('Clotrimazole Vaginal Cream', 'Clotrimazole', 'Clotrimazole 2% w/w', 'antifungal', 95.00, 'Clotrimazole Vaginal Cream', 40.00, 57.89, 'Vaginal Cream', '2% w/w', 'Bayer', ARRAY['Vaginal candidiasis', 'Yeast infections', 'Vulvovaginal itching'], ARRAY['Vaginal burning', 'Irritation', 'Discharge'], ARRAY['First trimester pregnancy', 'Hypersensitivity'], 'क्लोट्रिमाज़ोल वेजाइनल क्रीम', false),
('Nystatin Cream', 'Nystatin', 'Nystatin 100000 IU/g', 'antifungal', 78.00, 'Nystatin Cream', 32.00, 58.97, 'Cream', '100000 IU/g', 'Various Manufacturers', ARRAY['Candidal skin infections', 'Nappy rash', 'Oral thrush (topical)', 'Cutaneous candidiasis'], ARRAY['Mild irritation', 'Rash'], ARRAY['Hypersensitivity'], 'निस्टैटिन क्रीम', true),
('Betadine Ointment', 'Povidone-Iodine', 'Povidone-Iodine 5% w/w', 'dermatological', 85.00, 'Povidone-Iodine Ointment', 35.00, 58.82, 'Ointment', '5% w/w', 'Win-Medicare', ARRAY['Wound disinfection', 'Burns', 'Cuts', 'Minor surgical procedures', 'Ulcers'], ARRAY['Skin irritation', 'Iodine sensitivity', 'Staining'], ARRAY['Iodine allergy', 'Thyroid disorders', 'Concurrent lithium use'], 'बीटाडीन मरहम', false),
('Candid Cream', 'Clotrimazole', 'Clotrimazole 1% w/w', 'antifungal', 72.00, 'Clotrimazole Cream', 30.00, 58.33, 'Cream', '1% w/w', 'Glenmark', ARRAY['Ringworm', 'Athlete\'s foot', 'Fungal nappy rash', 'Candidal infections'], ARRAY['Mild burning', 'Irritation', 'Redness'], ARRAY['Hypersensitivity to imidazoles'], 'कैंडिड क्रीम', false),
('Quadriderm Cream', 'Clobetasol + Neomycin + Miconazole + Chlorocresol', 'Combination', 'Topical Combination', 195.00, NULL, NULL, NULL, 'Cream', '15g', 'Glaxo', ARRAY['Infected eczema', 'Infected psoriasis', 'Dermatitis with infection', 'Mixed skin infections'], ARRAY['Skin atrophy', 'Burning', 'Irritation'], ARRAY['Viral infections', 'Tuberculosis of skin', 'Rosacea'], 'क्वाड्रिडर्म क्रीम', false),
('Momate Cream', 'Mometasone Furoate', 'Mometasone Furoate 0.1% w/w', 'Topical Corticosteroid', 168.00, 'Mometasone Cream', 70.00, 58.33, 'Cream', '0.1% w/w', 'Glenmark', ARRAY['Eczema', 'Psoriasis', 'Allergic dermatitis', 'Inflammatory skin conditions'], ARRAY['Burning', 'Itching', 'Skin atrophy'], ARRAY['Untreated bacterial infections', 'Viral infections', 'Fungal infections'], 'मोमेट क्रीम', false),
('Lobate GM Cream', 'Clobetasol + Gentamicin + Miconazole', 'Combination', 'Topical Combination', 185.00, NULL, NULL, NULL, 'Cream', '15g', 'GlaxoSmithKline', ARRAY['Infected dermatoses', 'Mixed infections with inflammation', 'Eczema with infection'], ARRAY['Skin thinning', 'Irritation', 'Burning'], ARRAY['Viral skin infections', 'Acne', 'Perioral dermatitis'], 'लोबेट जीएम क्रीम', false),
('Acnemoist Cream', 'Moisturizer for Acne-prone Skin', 'Ceramides + Hyaluronic Acid + Niacinamide', 'Dermatological Moisturizer', 395.00, NULL, NULL, NULL, 'Cream', '50g', 'Cipla', ARRAY['Acne-prone skin hydration', 'Post-acne treatment care', 'Dry skin from acne medications'], ARRAY['Rare mild irritation'], ARRAY['Hypersensitivity'], 'एक्नेमोइस्ट क्रीम', false),
('Elocon Cream', 'Mometasone Furoate', 'Mometasone Furoate 0.1% w/w', 'Topical Corticosteroid', 178.00, 'Mometasone Cream', 74.00, 58.43, 'Cream', '0.1% w/w', 'MSD', ARRAY['Psoriasis', 'Atopic dermatitis', 'Eczema', 'Lichen planus'], ARRAY['Folliculitis', 'Acneiform eruptions', 'Skin atrophy'], ARRAY['Bacterial infections', 'Viral infections', 'Fungal infections'], 'एलोकॉन क्रीम', false),
('Nadibact Cream', 'Nadifloxacin', 'Nadifloxacin 1% w/w', 'Topical Antibiotic', 295.00, NULL, NULL, NULL, 'Cream', '1% w/w', 'Wockhardt', ARRAY['Bacterial acne', 'Infected acne', 'Acne vulgaris'], ARRAY['Dryness', 'Irritation', 'Photosensitivity'], ARRAY['Hypersensitivity to quinolones'], 'नाडीबैक्ट क्रीम', false),
('Skinlite Cream', 'Hydroquinone + Tretinoin + Mometasone', 'Hydroquinone 2% + Tretinoin 0.025% + Mometasone 0.1%', 'Depigmenting Agent', 245.00, NULL, NULL, NULL, 'Cream', '15g', 'Abbott', ARRAY['Melasma', 'Hyperpigmentation', 'Dark spots', 'Age spots'], ARRAY['Redness', 'Peeling', 'Burning', 'Photosensitivity'], ARRAY['Pregnancy', 'Breastfeeding', 'Skin cancer'], 'स्किनलाइट क्रीम', false),
('Ketocip Shampoo', 'Ketoconazole', 'Ketoconazole 2% w/v', 'Antifungal Shampoo', 285.00, 'Ketoconazole Shampoo', 118.00, 58.60, 'Shampoo', '2% w/v', 'Cipla', ARRAY['Dandruff', 'Seborrheic dermatitis', 'Scalp fungal infections', 'Tinea capitis'], ARRAY['Scalp irritation', 'Dryness', 'Hair loss'], ARRAY['Hypersensitivity'], 'केटोसिप शैम्पू', false),
('Mupirocin Ointment', 'Mupirocin', 'Mupirocin 2% w/w', 'Topical Antibiotic', 165.00, 'Mupirocin Ointment', 68.00, 58.79, 'Ointment', '2% w/w', 'GlaxoSmithKline', ARRAY['Impetigo', 'Folliculitis', 'Secondary infected eczema', 'MRSA eradication (nasal)'], ARRAY['Burning', 'Itching', 'Rash'], ARRAY['Hypersensitivity', 'Renal impairment (extensive use)'], 'म्यूपिरोसिन मरहम', false),

-- =============================================================================
-- INHALERS AND NEBULIZATION
-- =============================================================================

('Asthalin Inhaler', 'Salbutamol', 'Salbutamol 100mcg/puff', 'respiratory', 145.00, 'Salbutamol Inhaler', 60.00, 58.62, 'Inhaler', '100mcg/puff', 'Cipla', ARRAY['Asthma', 'COPD', 'Bronchospasm', 'Exercise-induced asthma', 'Wheezing'], ARRAY['Tremor', 'Headache', 'Tachycardia', 'Palpitations'], ARRAY['Hypersensitivity', 'Cardiac arrhythmias'], 'अस्थालिन इनहेलर', true),
('Budecort Inhaler', 'Budesonide', 'Budesonide 200mcg/puff', 'respiratory', 485.00, 'Budesonide Inhaler', 200.00, 58.76, 'Inhaler', '200mcg/puff', 'Cipla', ARRAY['Chronic asthma', 'Asthma prophylaxis', 'COPD maintenance', 'Bronchial inflammation'], ARRAY['Oral thrush', 'Hoarseness', 'Throat irritation', 'Cough'], ARRAY['Untreated fungal infections', 'Hypersensitivity'], 'बुडेकॉर्ट इनहेलर', true),
('Ipravent Inhaler', 'Ipratropium Bromide', 'Ipratropium Bromide 20mcg/puff', 'Anticholinergic Bronchodilator', 285.00, 'Ipratropium Inhaler', 118.00, 58.60, 'Inhaler', '20mcg/puff', 'Cipla', ARRAY['COPD', 'Chronic bronchitis', 'Emphysema', 'Bronchospasm'], ARRAY['Dry mouth', 'Cough', 'Headache', 'Dizziness'], ARRAY['Glaucoma', 'Prostatic hyperplasia', 'Hypersensitivity'], 'इप्रावेंट इनहेलर', true),
('Seroflo Inhaler', 'Salmeterol + Fluticasone', 'Salmeterol 25mcg + Fluticasone 250mcg/puff', 'respiratory', 785.00, 'Salmeterol Fluticasone Inhaler', 325.00, 58.60, 'Inhaler', '25mcg+250mcg/puff', 'Cipla', ARRAY['Asthma maintenance', 'COPD', 'Chronic bronchospasm', 'Prevention of asthma attacks'], ARRAY['Oral thrush', 'Hoarseness', 'Headache', 'Throat irritation'], ARRAY['Fungal infections', 'Acute asthma attacks'], 'सेरोफ्लो इनहेलर', true),
('Foracort Inhaler', 'Formoterol + Budesonide', 'Formoterol 6mcg + Budesonide 200mcg/puff', 'respiratory', 695.00, 'Formoterol Budesonide Inhaler', 288.00, 58.56, 'Inhaler', '6mcg+200mcg/puff', 'Cipla', ARRAY['Asthma', 'COPD', 'Prevention of bronchospasm', 'Maintenance therapy'], ARRAY['Tremor', 'Headache', 'Oral thrush', 'Palpitations'], ARRAY['Acute asthma', 'Cardiac arrhythmias'], 'फोराकॉर्ट इनहेलर', true),
('Spiriva Inhaler', 'Tiotropium Bromide', 'Tiotropium 18mcg/puff', 'Long-acting Bronchodilator', 1285.00, 'Tiotropium Inhaler', 535.00, 58.37, 'Inhaler', '18mcg/puff', 'Boehringer Ingelheim', ARRAY['COPD maintenance', 'Chronic bronchitis', 'Emphysema', 'Long-term bronchodilation'], ARRAY['Dry mouth', 'Constipation', 'Urinary retention', 'Blurred vision'], ARRAY['Glaucoma', 'Prostatic hyperplasia', 'Hypersensitivity'], 'स्पिरिवा इनहेलर', false),
('Levolin Inhaler', 'Levosalbutamol', 'Levosalbutamol 50mcg/puff', 'respiratory', 165.00, 'Levosalbutamol Inhaler', 68.00, 58.79, 'Inhaler', '50mcg/puff', 'Cipla', ARRAY['Asthma', 'Bronchospasm', 'COPD', 'Reversible airway obstruction'], ARRAY['Tremor', 'Nervousness', 'Headache', 'Palpitations'], ARRAY['Hypersensitivity', 'Cardiac arrhythmias'], 'लेवोलिन इनहेलर', true),
('Duolin Inhaler', 'Salbutamol + Ipratropium', 'Salbutamol 100mcg + Ipratropium 20mcg/puff', 'respiratory', 295.00, 'Salbutamol Ipratropium Inhaler', 122.00, 58.64, 'Inhaler', '100mcg+20mcg/puff', 'Cipla', ARRAY['COPD', 'Chronic bronchitis', 'Bronchospasm with COPD', 'Emphysema'], ARRAY['Dry mouth', 'Tremor', 'Headache', 'Tachycardia'], ARRAY['Glaucoma', 'Cardiac arrhythmias', 'Prostatic hyperplasia'], 'ड्यूओलिन इनहेलर', true),
('Asthalin Respules', 'Salbutamol', 'Salbutamol 2.5mg/2.5ml', 'Nebulization Solution', 82.00, 'Salbutamol Respules', 34.00, 58.54, 'Respules', '2.5mg/2.5ml', 'Cipla', ARRAY['Acute asthma', 'Severe bronchospasm', 'Emergency wheezing', 'COPD exacerbation'], ARRAY['Tremor', 'Tachycardia', 'Nervousness', 'Headache'], ARRAY['Hypersensitivity', 'Thyrotoxicosis'], 'अस्थालिन रेस्पूल्स', true),
('Budecort Respules', 'Budesonide', 'Budesonide 0.5mg/2ml', 'Nebulization Solution', 195.00, 'Budesonide Respules', 81.00, 58.46, 'Respules', '0.5mg/2ml', 'Cipla', ARRAY['Asthma in children', 'Croup', 'Laryngotracheobronchitis', 'Chronic asthma maintenance'], ARRAY['Oral thrush', 'Cough', 'Hoarseness'], ARRAY['Fungal infections', 'Hypersensitivity'], 'बुडेकॉर्ट रेस्पूल्स', true),
('Ipravent Respules', 'Ipratropium Bromide', 'Ipratropium 500mcg/2ml', 'Nebulization Solution', 168.00, 'Ipratropium Respules', 70.00, 58.33, 'Respules', '500mcg/2ml', 'Cipla', ARRAY['COPD', 'Acute bronchospasm', 'Chronic bronchitis', 'Nebulization therapy'], ARRAY['Dry mouth', 'Blurred vision', 'Urinary retention'], ARRAY['Glaucoma', 'Prostatic hyperplasia'], 'इप्रावेंट रेस्पूल्स', true),
('Duolin Respules', 'Salbutamol + Ipratropium', 'Salbutamol 2.5mg + Ipratropium 500mcg/2.5ml', 'Nebulization Solution', 215.00, 'Salbutamol Ipratropium Respules', 89.00, 58.60, 'Respules', '2.5ml', 'Cipla', ARRAY['COPD exacerbation', 'Severe bronchospasm', 'Acute asthma', 'Emergency respiratory distress'], ARRAY['Tremor', 'Dry mouth', 'Tachycardia', 'Nervousness'], ARRAY['Glaucoma', 'Cardiac arrhythmias'], 'ड्यूओलिन रेस्पूल्स', true),
('Levolin Respules', 'Levosalbutamol', 'Levosalbutamol 1.25mg/2.5ml', 'Nebulization Solution', 95.00, 'Levosalbutamol Respules', 39.00, 58.95, 'Respules', '1.25mg/2.5ml', 'Cipla', ARRAY['Acute asthma', 'Bronchospasm', 'Wheezing in children', 'COPD'], ARRAY['Tremor', 'Nervousness', 'Tachycardia'], ARRAY['Hypersensitivity', 'Cardiac disorders'], 'लेवोलिन रेस्पूल्स', true),
('Combihale FB Inhaler', 'Formoterol + Budesonide', 'Formoterol 6mcg + Budesonide 100mcg/puff', 'respiratory', 595.00, 'Formoterol Budesonide Inhaler', 246.00, 58.66, 'Inhaler', '6mcg+100mcg/puff', 'Cipla', ARRAY['Mild to moderate asthma', 'COPD maintenance', 'Chronic bronchospasm'], ARRAY['Headache', 'Tremor', 'Oral thrush'], ARRAY['Acute severe asthma', 'Fungal infections'], 'कॉम्बीहेल एफबी इनहेलर', true),
('Aerocort Inhaler', 'Levosalbutamol + Beclomethasone', 'Levosalbutamol 50mcg + Beclomethasone 50mcg/puff', 'respiratory', 385.00, NULL, NULL, NULL, 'Inhaler', '50mcg+50mcg/puff', 'Cipla', ARRAY['Asthma', 'COPD', 'Bronchospasm with inflammation'], ARRAY['Oral thrush', 'Hoarseness', 'Tremor'], ARRAY['Fungal infections', 'Acute asthma'], 'एरोकॉर्ट इनहेलर', false),

-- =============================================================================
-- INJECTIONS/INJECTABLES COMMONLY AVAILABLE
-- =============================================================================

('Actrapid Vial', 'Regular Insulin', 'Human Insulin 100IU/ml', 'Antidiabetic Injectable', 185.00, 'Human Insulin Injection', 78.00, 57.84, 'Injection', '100IU/ml', 'Novo Nordisk', ARRAY['Type 1 diabetes', 'Type 2 diabetes', 'Diabetic ketoacidosis', 'Perioperative glucose control', 'Emergency hyperglycemia'], ARRAY['Hypoglycemia', 'Weight gain', 'Lipodystrophy', 'Allergic reactions'], ARRAY['Hypoglycemia', 'Hypersensitivity to insulin'], 'एक्ट्रापिड वायल', true),
('Mixtard Vial', 'Biphasic Insulin', 'Human Insulin (30/70) 100IU/ml', 'Antidiabetic Injectable', 195.00, 'Biphasic Insulin Injection', 82.00, 57.95, 'Injection', '100IU/ml', 'Novo Nordisk', ARRAY['Type 1 diabetes', 'Type 2 diabetes', 'Basal-bolus insulin therapy'], ARRAY['Hypoglycemia', 'Weight gain', 'Injection site reactions'], ARRAY['Hypoglycemia', 'Insulin allergy'], 'मिक्सटार्ड वायल', true),
('Lantus Vial', 'Insulin Glargine', 'Insulin Glargine 100IU/ml', 'Long-acting Insulin', 1685.00, 'Insulin Glargine Injection', 700.00, 58.46, 'Injection', '100IU/ml', 'Sanofi', ARRAY['Type 1 diabetes', 'Type 2 diabetes', 'Basal insulin requirement', 'Once-daily insulin'], ARRAY['Hypoglycemia', 'Weight gain', 'Lipodystrophy'], ARRAY['Hypoglycemia', 'Hypersensitivity'], 'लैंटस वायल', true),
('Humalog Vial', 'Insulin Lispro', 'Insulin Lispro 100IU/ml', 'Rapid-acting Insulin', 1795.00, 'Insulin Lispro Injection', 745.00, 58.50, 'Injection', '100IU/ml', 'Eli Lilly', ARRAY['Type 1 diabetes', 'Type 2 diabetes', 'Mealtime insulin', 'Insulin pump therapy'], ARRAY['Hypoglycemia', 'Injection site reactions', 'Lipohypertrophy'], ARRAY['Hypoglycemia episodes', 'Hypersensitivity'], 'ह्यूमालॉग वायल', true),
('Diclofenac Injection', 'Diclofenac Sodium', 'Diclofenac Sodium 75mg/3ml', 'NSAID Injectable', 28.00, 'Diclofenac Injection', 12.00, 57.14, 'Injection', '75mg/3ml', 'Multiple Manufacturers', ARRAY['Acute pain', 'Postoperative pain', 'Renal colic', 'Musculoskeletal pain', 'Inflammatory conditions'], ARRAY['Injection site pain', 'Nausea', 'Dizziness', 'GI upset'], ARRAY['Peptic ulcer', 'Severe renal impairment', 'Hypersensitivity'], 'डाइक्लोफेनाक इंजेक्शन', true),
('Ondansetron Injection', 'Ondansetron', 'Ondansetron 4mg/2ml', 'Antiemetic Injectable', 18.00, 'Ondansetron Injection', 8.00, 55.56, 'Injection', '4mg/2ml', 'Multiple Manufacturers', ARRAY['Postoperative nausea and vomiting', 'Chemotherapy-induced nausea', 'Radiotherapy-induced nausea'], ARRAY['Headache', 'Constipation', 'Dizziness', 'Flushing'], ARRAY['Congenital long QT syndrome', 'Apomorphine use'], 'ऑनडैनसेट्रॉन इंजेक्शन', true),
('Ranitidine Injection', 'Ranitidine', 'Ranitidine 25mg/ml', 'H2 Blocker Injectable', 15.00, 'Ranitidine Injection', 6.00, 60.00, 'Injection', '25mg/ml', 'Multiple Manufacturers', ARRAY['Peptic ulcer', 'GERD', 'Zollinger-Ellison syndrome', 'Acid aspiration prophylaxis'], ARRAY['Headache', 'Dizziness', 'Constipation', 'Diarrhea'], ARRAY['Hypersensitivity', 'Porphyria'], 'रैनिटिडीन इंजेक्शन', true),
('Monocef Injection', 'Ceftriaxone', 'Ceftriaxone 1g', 'Antibiotic Injectable', 48.00, 'Ceftriaxone Injection', 20.00, 58.33, 'Injection', '1g', 'Aristo Pharmaceuticals', ARRAY['Severe bacterial infections', 'Meningitis', 'Gonorrhea', 'Septicemia', 'Respiratory infections'], ARRAY['Diarrhea', 'Rash', 'Injection site reactions', 'Eosinophilia'], ARRAY['Hypersensitivity to cephalosporins', 'Neonates with hyperbilirubinemia'], 'मोनोसेफ इंजेक्शन', true),
('Amikacin Injection', 'Amikacin', 'Amikacin 500mg/2ml', 'Aminoglycoside Antibiotic', 38.00, 'Amikacin Injection', 16.00, 57.89, 'Injection', '500mg/2ml', 'Multiple Manufacturers', ARRAY['Serious gram-negative infections', 'Hospital-acquired pneumonia', 'Septicemia', 'Complicated UTI'], ARRAY['Nephrotoxicity', 'Ototoxicity', 'Neuromuscular blockade'], ARRAY['Myasthenia gravis', 'Renal impairment', 'Pregnancy'], 'एमिकासिन इंजेक्शन', true),
('Gentamicin Injection', 'Gentamicin', 'Gentamicin 80mg/2ml', 'Aminoglycoside Antibiotic', 22.00, 'Gentamicin Injection', 9.00, 59.09, 'Injection', '80mg/2ml', 'Multiple Manufacturers', ARRAY['Serious bacterial infections', 'Septicemia', 'Endocarditis', 'Pneumonia', 'UTI'], ARRAY['Nephrotoxicity', 'Ototoxicity', 'Vestibular toxicity'], ARRAY['Myasthenia gravis', 'Renal disease', 'Pregnancy'], 'जेंटामाइसिन इंजेक्शन', true),
('Dexamethasone Injection', 'Dexamethasone', 'Dexamethasone 4mg/ml', 'Corticosteroid Injectable', 12.00, 'Dexamethasone Injection', 5.00, 58.33, 'Injection', '4mg/ml', 'Multiple Manufacturers', ARRAY['Severe allergies', 'Cerebral edema', 'Shock', 'Acute asthma', 'Inflammatory conditions'], ARRAY['Hyperglycemia', 'Hypertension', 'Mood changes', 'Fluid retention'], ARRAY['Systemic fungal infections', 'Live vaccines'], 'डेक्सामीथासोन इंजेक्शन', true),
('Tramadol Injection', 'Tramadol', 'Tramadol 50mg/ml', 'Opioid Analgesic', 18.00, 'Tramadol Injection', 8.00, 55.56, 'Injection', '50mg/ml', 'Multiple Manufacturers', ARRAY['Moderate to severe pain', 'Postoperative pain', 'Cancer pain', 'Chronic pain'], ARRAY['Nausea', 'Dizziness', 'Constipation', 'Drowsiness', 'Dependence'], ARRAY['Acute intoxication', 'Severe respiratory depression', 'Concurrent MAO inhibitors'], 'ट्रामाडोल इंजेक्शन', true),
('Methylcobalamin Injection', 'Methylcobalamin', 'Methylcobalamin 1500mcg/ml', 'Vitamin B12 Injectable', 35.00, 'Methylcobalamin Injection', 15.00, 57.14, 'Injection', '1500mcg/ml', 'Multiple Manufacturers', ARRAY['Vitamin B12 deficiency', 'Peripheral neuropathy', 'Pernicious anemia', 'Diabetic neuropathy'], ARRAY['Injection site pain', 'Diarrhea', 'Itching'], ARRAY['Leber\'s disease', 'Hypersensitivity'], 'मिथाइलकोबालामिन इंजेक्शन', false),
('Furosemide Injection', 'Furosemide', 'Furosemide 10mg/ml', 'Loop Diuretic Injectable', 8.00, 'Furosemide Injection', 3.00, 62.50, 'Injection', '10mg/ml', 'Multiple Manufacturers', ARRAY['Acute pulmonary edema', 'Congestive heart failure', 'Renal failure', 'Hypertensive crisis'], ARRAY['Hypokalemia', 'Hypotension', 'Dehydration', 'Ototoxicity'], ARRAY['Anuria', 'Severe electrolyte depletion', 'Hepatic coma'], 'फ्यूरोसेमाइड इंजेक्शन', true),
('Pantoprazole Injection', 'Pantoprazole', 'Pantoprazole 40mg', 'Proton Pump Inhibitor Injectable', 28.00, 'Pantoprazole Injection', 12.00, 57.14, 'Injection', '40mg', 'Multiple Manufacturers', ARRAY['GERD', 'Peptic ulcer', 'Zollinger-Ellison syndrome', 'Acid aspiration prophylaxis'], ARRAY['Headache', 'Diarrhea', 'Nausea', 'Abdominal pain'], ARRAY['Hypersensitivity to PPIs', 'Concurrent atazanavir use'], 'पैंटोप्राज़ोल इंजेक्शन', true),

-- =============================================================================
-- COMBINATION MEDICINES (Very popular in India)
-- =============================================================================

('Zerodol-SP', 'Aceclofenac + Paracetamol + Serratiopeptidase', 'Aceclofenac 100mg + Paracetamol 325mg + Serratiopeptidase 15mg', 'Analgesic + Anti-inflammatory', 78.00, NULL, NULL, NULL, 'Tablet', '100mg+325mg+15mg', 'Ipca Laboratories', ARRAY['Musculoskeletal pain', 'Postoperative pain', 'Dental pain', 'Joint pain', 'Inflammation'], ARRAY['Nausea', 'Diarrhea', 'Dizziness', 'Abdominal pain'], ARRAY['Peptic ulcer', 'Severe hepatic impairment', 'Active GI bleeding'], 'ज़ीरोडोल-एसपी', false),
('Diclomol', 'Diclofenac + Paracetamol', 'Diclofenac 50mg + Paracetamol 325mg', 'Analgesic + Anti-inflammatory', 42.00, 'Diclofenac Paracetamol Tablet', 18.00, 57.14, 'Tablet', '50mg+325mg', 'Multiple Manufacturers', ARRAY['Fever with pain', 'Musculoskeletal pain', 'Headache', 'Dental pain'], ARRAY['Nausea', 'Stomach upset', 'Dizziness', 'Rash'], ARRAY['Peptic ulcer', 'Severe renal impairment', 'Hypersensitivity'], 'डाइक्लोमोल', false),
('O2 Tablet', 'Ofloxacin + Ornidazole', 'Ofloxacin 200mg + Ornidazole 500mg', 'Antibiotic + Antiprotozoal', 68.00, 'Ofloxacin Ornidazole Tablet', 28.00, 58.82, 'Tablet', '200mg+500mg', 'Multiple Manufacturers', ARRAY['Diarrhea', 'Dysentery', 'Mixed infections', 'Gastroenteritis', 'Gynecological infections'], ARRAY['Nausea', 'Dizziness', 'Headache', 'Metallic taste'], ARRAY['Pregnancy', 'CNS disorders', 'Hypersensitivity'], 'ओ2 टैबलेट', false),
('Ciplox-TZ', 'Ciprofloxacin + Tinidazole', 'Ciprofloxacin 500mg + Tinidazole 600mg', 'Antibiotic + Antiprotozoal', 78.00, 'Ciprofloxacin Tinidazole Tablet', 32.00, 58.97, 'Tablet', '500mg+600mg', 'Cipla', ARRAY['Diarrhea', 'Dysentery', 'Mixed bacterial and protozoal infections', 'Gastroenteritis'], ARRAY['Nausea', 'Diarrhea', 'Dizziness', 'Metallic taste', 'Headache'], ARRAY['Pregnancy', 'Children under 18', 'CNS disorders'], 'सिप्लोक्स-टीज़ेड', false),
('Augmentin', 'Amoxicillin + Clavulanic Acid', 'Amoxicillin 500mg + Clavulanic Acid 125mg', 'antibiotic', 195.00, 'Amoxicillin Clavulanic Acid Tablet', 82.00, 57.95, 'Tablet', '500mg+125mg', 'GlaxoSmithKline', ARRAY['Resistant bacterial infections', 'Sinusitis', 'Pneumonia', 'Otitis media', 'UTI'], ARRAY['Diarrhea', 'Nausea', 'Skin rash', 'Vomiting'], ARRAY['Penicillin allergy', 'Cholestatic jaundice history'], 'ऑगमेंटिन', true),
('Mahacef Plus', 'Cefixime + Ofloxacin', 'Cefixime 200mg + Ofloxacin 200mg', 'Antibiotic Combination', 125.00, NULL, NULL, NULL, 'Tablet', '200mg+200mg', 'Mankind Pharma', ARRAY['Respiratory tract infections', 'Urinary tract infections', 'Typhoid', 'Mixed infections'], ARRAY['Diarrhea', 'Nausea', 'Abdominal pain', 'Headache'], ARRAY['Hypersensitivity to cephalosporins or quinolones', 'Pregnancy'], 'महासेफ प्लस', false),
('Pan-D', 'Pantoprazole + Domperidone', 'Pantoprazole 40mg + Domperidone 30mg', 'PPI + Prokinetic', 115.00, 'Pantoprazole Domperidone Capsule', 48.00, 58.26, 'Capsule', '40mg+30mg', 'Multiple Manufacturers', ARRAY['GERD', 'Peptic ulcer', 'Dyspepsia', 'Acid reflux with nausea'], ARRAY['Headache', 'Diarrhea', 'Dry mouth', 'Abdominal pain'], ARRAY['Cardiac arrhythmia', 'GI hemorrhage', 'Hepatic impairment'], 'पैन-डी', false),
('Razo-D', 'Rabeprazole + Domperidone', 'Rabeprazole 20mg + Domperidone 30mg', 'PPI + Prokinetic', 125.00, 'Rabeprazole Domperidone Capsule', 52.00, 58.40, 'Capsule', '20mg+30mg', 'Dr. Reddy\'s', ARRAY['GERD', 'Peptic ulcer', 'Dyspepsia', 'Gastric reflux'], ARRAY['Headache', 'Dizziness', 'Diarrhea', 'Dry mouth'], ARRAY['Cardiac disorders', 'Prolactinoma', 'Hepatic impairment'], 'राज़ो-डी', false),
('Sinarest Tablet', 'Paracetamol + Caffeine + Phenylephrine', 'Paracetamol 500mg + Caffeine 25mg + Phenylephrine 10mg', 'Cold and Flu', 42.00, NULL, NULL, NULL, 'Tablet', '500mg+25mg+10mg', 'Centaur Pharmaceuticals', ARRAY['Common cold', 'Flu', 'Nasal congestion', 'Headache', 'Body ache'], ARRAY['Nausea', 'Insomnia', 'Nervousness', 'Increased heart rate'], ARRAY['Hypertension', 'Cardiovascular disease', 'MAO inhibitor use'], 'साइनारेस्ट टैबलेट', false),
('Crocin Cold & Flu', 'Paracetamol + Caffeine + Phenylephrine', 'Paracetamol 500mg + Caffeine 25mg + Phenylephrine 5mg', 'Cold and Flu', 48.00, NULL, NULL, NULL, 'Tablet', '500mg+25mg+5mg', 'GlaxoSmithKline', ARRAY['Common cold', 'Flu', 'Nasal congestion', 'Fever', 'Headache'], ARRAY['Nausea', 'Insomnia', 'Restlessness'], ARRAY['Severe hypertension', 'Coronary artery disease', 'MAO inhibitor use'], 'क्रोसिन कोल्ड एंड फ्लू', false),
('Cetcold', 'Cetirizine + Paracetamol + Phenylephrine', 'Cetirizine 5mg + Paracetamol 325mg + Phenylephrine 10mg', 'Cold and Allergy', 38.00, NULL, NULL, NULL, 'Tablet', '5mg+325mg+10mg', 'Multiple Manufacturers', ARRAY['Common cold with allergy', 'Allergic rhinitis', 'Flu', 'Nasal congestion'], ARRAY['Drowsiness', 'Nausea', 'Dizziness', 'Dry mouth'], ARRAY['Hypertension', 'Cardiovascular disease', 'Glaucoma'], 'सेटकोल्ड', false),
('Montair-LC', 'Montelukast + Levocetirizine', 'Montelukast 10mg + Levocetirizine 5mg', 'Anti-allergic + Anti-asthmatic', 128.00, 'Montelukast Levocetirizine Tablet', 53.00, 58.59, 'Tablet', '10mg+5mg', 'Cipla', ARRAY['Allergic rhinitis', 'Asthma', 'Seasonal allergies', 'Chronic urticaria'], ARRAY['Drowsiness', 'Headache', 'Fatigue', 'Dry mouth'], ARRAY['Hypersensitivity', 'Severe hepatic impairment'], 'मोंटेयर-एलसी', false),
('Atorva-F', 'Atorvastatin + Fenofibrate', 'Atorvastatin 10mg + Fenofibrate 160mg', 'Lipid Lowering Agent', 185.00, NULL, NULL, NULL, 'Tablet', '10mg+160mg', 'Multiple Manufacturers', ARRAY['Mixed dyslipidemia', 'High cholesterol and triglycerides', 'Cardiovascular risk reduction'], ARRAY['Myalgia', 'Headache', 'Nausea', 'Abdominal pain'], ARRAY['Active liver disease', 'Pregnancy', 'Gallbladder disease'], 'एटोरवा-एफ', false),
('Telma-AM', 'Telmisartan + Amlodipine', 'Telmisartan 40mg + Amlodipine 5mg', 'antihypertensive', 145.00, 'Telmisartan Amlodipine Tablet', 60.00, 58.62, 'Tablet', '40mg+5mg', 'Glenmark', ARRAY['Hypertension', 'High blood pressure not controlled by monotherapy', 'Cardiovascular protection'], ARRAY['Ankle edema', 'Dizziness', 'Headache', 'Fatigue'], ARRAY['Pregnancy', 'Severe hepatic impairment', 'Cardiogenic shock'], 'टेल्मा-एएम', false),
('Glycomet-GP1', 'Metformin + Glimepiride', 'Metformin 500mg + Glimepiride 1mg', 'antidiabetic', 68.00, 'Metformin Glimepiride Tablet', 28.00, 58.82, 'Tablet', '500mg+1mg', 'USV', ARRAY['Type 2 diabetes mellitus', 'Blood sugar control', 'Insulin resistance'], ARRAY['Hypoglycemia', 'Nausea', 'Diarrhea', 'Abdominal pain'], ARRAY['Type 1 diabetes', 'Renal impairment', 'Hepatic impairment'], 'ग्लाइकोमेट-जीपी1', false),
('Losacar-H', 'Losartan + Hydrochlorothiazide', 'Losartan 50mg + Hydrochlorothiazide 12.5mg', 'antihypertensive', 95.00, 'Losartan Hydrochlorothiazide Tablet', 39.00, 58.95, 'Tablet', '50mg+12.5mg', 'Sun Pharma', ARRAY['Hypertension', 'High blood pressure', 'Cardiovascular risk reduction', 'Edema'], ARRAY['Dizziness', 'Headache', 'Hypokalemia', 'Fatigue'], ARRAY['Pregnancy', 'Anuria', 'Severe renal impairment'], 'लोसाकार-एच', false),
('Limcee Plus', 'Vitamin C + Zinc', 'Vitamin C 500mg + Zinc 10mg', 'vitamin', 95.00, 'Vitamin C Zinc Tablet', 40.00, 57.89, 'Tablet', '500mg+10mg', 'Abbott', ARRAY['Immunity booster', 'Common cold prevention', 'Antioxidant', 'Wound healing'], ARRAY['Nausea', 'Diarrhea', 'Stomach cramps'], ARRAY['Hemochromatosis', 'Kidney stones'], 'लिमसी प्लस', false),
('Combiflam', 'Ibuprofen + Paracetamol', 'Ibuprofen 400mg + Paracetamol 325mg', 'analgesic', 32.00, 'Ibuprofen Paracetamol Tablet', 14.00, 56.25, 'Tablet', '400mg+325mg', 'Sanofi India', ARRAY['Fever', 'Headache', 'Toothache', 'Musculoskeletal pain', 'Menstrual pain'], ARRAY['Nausea', 'Heartburn', 'Dizziness', 'Stomach upset'], ARRAY['Peptic ulcer', 'Severe renal impairment', 'Asthma'], 'कॉम्बिफ्लाम', false),
('Azicip-500', 'Azithromycin + Lactic Acid Bacillus', 'Azithromycin 500mg + Lactic Acid Bacillus 60 million spores', 'Antibiotic + Probiotic', 115.00, NULL, NULL, NULL, 'Tablet', '500mg', 'Cipla', ARRAY['Respiratory infections', 'Typhoid', 'Skin infections', 'STDs', 'Probiotic support'], ARRAY['Diarrhea', 'Nausea', 'Abdominal pain', 'Headache'], ARRAY['Liver disease', 'Hypersensitivity'], 'अज़िसिप-500', false),
('Voveran-Emulgel', 'Diclofenac + Methyl Salicylate + Menthol', 'Diclofenac 1.16% + Methyl Salicylate + Menthol', 'Topical Analgesic', 195.00, NULL, NULL, NULL, 'Gel', '30g', 'Novartis', ARRAY['Musculoskeletal pain', 'Joint pain', 'Sprains', 'Strains', 'Sports injuries'], ARRAY['Skin irritation', 'Redness', 'Burning sensation'], ARRAY['Open wounds', 'Hypersensitivity', 'Asthma'], 'वोवेरान-एमुलजेल', false),
('Cheston Cold', 'Paracetamol + Cetirizine + Phenylephrine', 'Paracetamol 500mg + Cetirizine 5mg + Phenylephrine 10mg', 'Cold and Flu', 42.00, NULL, NULL, NULL, 'Tablet', '500mg+5mg+10mg', 'Cipla', ARRAY['Common cold', 'Flu', 'Allergic rhinitis', 'Nasal congestion', 'Fever'], ARRAY['Drowsiness', 'Nausea', 'Dry mouth', 'Dizziness'], ARRAY['Hypertension', 'MAO inhibitor use', 'Cardiovascular disease'], 'चेस्टन कोल्ड', false),
('Trika 0.5', 'Alprazolam + Propranolol', 'Alprazolam 0.5mg + Propranolom 40mg', 'Anxiolytic + Beta Blocker', 95.00, NULL, NULL, NULL, 'Tablet', '0.5mg+40mg', 'Consern Pharma', ARRAY['Anxiety with palpitations', 'Performance anxiety', 'Panic disorder', 'Social phobia'], ARRAY['Drowsiness', 'Fatigue', 'Bradycardia', 'Dizziness'], ARRAY['Severe heart block', 'Asthma', 'COPD', 'Cardiogenic shock'], 'त्रिका 0.5', false),
('Rifagut', 'Rifaximin + Simethicone', 'Rifaximin 200mg + Simethicone 40mg', 'Antibiotic + Antiflatulent', 285.00, NULL, NULL, NULL, 'Tablet', '200mg+40mg', 'Salix Pharmaceuticals', ARRAY['Traveler\'s diarrhea', 'IBS with diarrhea', 'Hepatic encephalopathy', 'Flatulence'], ARRAY['Nausea', 'Dizziness', 'Abdominal pain', 'Flatulence'], ARRAY['Intestinal obstruction', 'Hypersensitivity'], 'रिफागट', false),
('Nurokind-Plus', 'Methylcobalamin + Alpha Lipoic Acid + Folic Acid + Pyridoxine', 'Methylcobalamin 1500mcg + ALA 100mg + Folic Acid 1.5mg + Pyridoxine 3mg', 'Neurotropic Supplement', 195.00, NULL, NULL, NULL, 'Capsule', 'Combination', 'Mankind Pharma', ARRAY['Diabetic neuropathy', 'Peripheral neuropathy', 'Vitamin B deficiency', 'Nerve damage'], ARRAY['Nausea', 'Headache', 'Dizziness'], ARRAY['Hypersensitivity', 'Leber\'s disease'], 'न्यूरोकाइंड-प्लस', false),
('Aciloc-RD', 'Ranitidine + Domperidone', 'Ranitidine 150mg + Domperidone 10mg', 'H2 Blocker + Prokinetic', 52.00, NULL, NULL, NULL, 'Tablet', '150mg+10mg', 'Cadila', ARRAY['GERD', 'Peptic ulcer', 'Dyspepsia', 'Acid reflux with nausea'], ARRAY['Headache', 'Dizziness', 'Dry mouth', 'Diarrhea'], ARRAY['Cardiac arrhythmia', 'Prolactinoma', 'GI hemorrhage'], 'एसिलॉक-आरडी', false),
('Vitamin D3 60K', 'Cholecalciferol + Calcium', 'Cholecalciferol 60000IU + Calcium 500mg', 'vitamin', 85.00, 'Cholecalciferol Calcium Capsule', 35.00, 58.82, 'Capsule', '60000IU+500mg', 'Multiple Manufacturers', ARRAY['Vitamin D deficiency', 'Osteoporosis', 'Bone health', 'Calcium supplementation'], ARRAY['Constipation', 'Flatulence', 'Hypercalcemia'], ARRAY['Hypercalcemia', 'Kidney stones', 'Sarcoidosis'], 'विटामिन डी3 60के', false),
('Candid-B Cream', 'Clotrimazole + Beclomethasone', 'Clotrimazole 1% + Beclomethasone 0.025%', 'Antifungal + Steroid', 95.00, NULL, NULL, NULL, 'Cream', '15g', 'Glenmark', ARRAY['Fungal skin infections with inflammation', 'Ringworm', 'Athlete\'s foot', 'Jock itch'], ARRAY['Skin thinning', 'Burning', 'Irritation'], ARRAY['Viral infections', 'Tuberculosis of skin', 'Acne'], 'कैंडिड-बी क्रीम', false),
('Coldact Tablet', 'Paracetamol + Phenylephrine + Caffeine + Chlorpheniramine', 'Paracetamol 500mg + Phenylephrine 10mg + Caffeine 25mg + Chlorpheniramine 2mg', 'Cold and Flu', 45.00, NULL, NULL, NULL, 'Tablet', 'Combination', 'Sanofi India', ARRAY['Common cold', 'Flu', 'Nasal congestion', 'Headache', 'Fever'], ARRAY['Drowsiness', 'Nausea', 'Nervousness', 'Insomnia'], ARRAY['Hypertension', 'Cardiovascular disease', 'MAO inhibitor use'], 'कोल्डएक्ट टैबलेट', false),
('Dolo-Neurobion', 'Paracetamol + Vitamin B Complex', 'Paracetamol 500mg + B1 + B6 + B12', 'Analgesic + Vitamin', 52.00, NULL, NULL, NULL, 'Tablet', 'Combination', 'Merck', ARRAY['Pain with vitamin deficiency', 'Neuropathic pain', 'Neuralgia', 'General pain relief'], ARRAY['Nausea', 'Allergic reactions'], ARRAY['Severe liver disease', 'Hypersensitivity'], 'डोलो-न्यूरोबियोन', false),

-- =============================================================================
-- AYURVEDIC/HERBAL OTC
-- =============================================================================

('Dabur Chyawanprash', 'Herbal Immunity Booster', 'Amla + Herbs + Spices', 'Ayurvedic Supplement', 285.00, NULL, NULL, NULL, 'Paste', '500g', 'Dabur', ARRAY['Immunity booster', 'Respiratory health', 'General wellness', 'Energy and vitality', 'Digestive health'], ARRAY['Rarely gastrointestinal upset'], ARRAY['Diabetes (sugar-free variant recommended)'], 'दाबर च्यवनप्राश', false),
('Himalaya Liv.52', 'Hepatoprotective', 'Caper Bush + Chicory + Black Nightshade', 'Ayurvedic Hepatoprotective', 145.00, NULL, NULL, NULL, 'Tablet', '100 tablets', 'Himalaya', ARRAY['Liver protection', 'Hepatitis management', 'Fatty liver', 'Alcoholic liver disease', 'Appetite improvement'], ARRAY['Rarely allergic reactions'], ARRAY['Acute liver disease', 'Pregnancy'], 'हिमालय लिव.52', false),
('Himalaya Confido', 'Sexual Wellness', 'Cowhage + Mucuna + Small Caltrops', 'Ayurvedic Supplement', 195.00, NULL, NULL, NULL, 'Tablet', '60 tablets', 'Himalaya', ARRAY['Premature ejaculation', 'Spermatorrhea', 'Sexual wellness', 'Male reproductive health'], ARRAY['Rarely gastrointestinal upset'], ARRAY['Hypersensitivity'], 'हिमालय कॉनफिडो', false),
('Himalaya Tentex Forte', 'Sexual Wellness', 'Small Caltrops + Almond + Ashwagandha', 'Ayurvedic Supplement', 285.00, NULL, NULL, NULL, 'Tablet', '100 tablets', 'Himalaya', ARRAY['Erectile dysfunction', 'Low libido', 'Male sexual wellness', 'Stamina improvement'], ARRAY['Rarely gastrointestinal upset'], ARRAY['Cardiovascular disorders', 'Hypersensitivity'], 'हिमालय टेंटेक्स फोर्ट', false),
('Ashwagandha Capsules', 'Adaptogen', 'Withania Somnifera Extract', 'Ayurvedic Supplement', 385.00, NULL, NULL, NULL, 'Capsule', '60 capsules', 'Multiple Manufacturers', ARRAY['Stress relief', 'Anxiety management', 'Energy boost', 'Cognitive function', 'Sleep improvement'], ARRAY['Gastrointestinal upset', 'Drowsiness'], ARRAY['Pregnancy', 'Hyperthyroidism', 'Auto-immune diseases'], 'अश्वगंधा कैप्सूल', false),
('Triphala Churna', 'gi', 'Amla + Haritaki + Bibhitaki', 'Ayurvedic Supplement', 125.00, NULL, NULL, NULL, 'Powder', '100g', 'Multiple Manufacturers', ARRAY['Digestive health', 'Constipation relief', 'Detoxification', 'Eye health', 'Antioxidant'], ARRAY['Diarrhea', 'Abdominal cramps'], ARRAY['Pregnancy', 'Diarrhea', 'Dehydration'], 'त्रिफला चूर्ण', false),
('Isabgol (Psyllium Husk)', 'Fiber Supplement', 'Plantago Ovata Husk', 'Dietary Fiber', 95.00, NULL, NULL, NULL, 'Powder', '100g', 'Multiple Manufacturers', ARRAY['Constipation relief', 'IBS', 'Cholesterol management', 'Blood sugar control', 'Weight management'], ARRAY['Bloating', 'Gas', 'Allergic reactions'], ARRAY['Intestinal obstruction', 'Difficulty swallowing'], 'ईसबगोल', false),
('Hajmola', 'gi', 'Black Salt + Cumin + Ginger + Asafoetida', 'Ayurvedic Digestive', 12.00, NULL, NULL, NULL, 'Tablet', 'Roll of 12', 'Dabur', ARRAY['Indigestion', 'Bloating', 'Gas', 'Appetite stimulation', 'Digestive support'], ARRAY['Rarely excessive salivation'], ARRAY['Gastric ulcers'], 'हजमोला', false),
('Pudina Hara', 'gi', 'Mentha Piperita + Ginger', 'Ayurvedic Digestive', 45.00, NULL, NULL, NULL, 'Capsule', '10 capsules', 'Dabur', ARRAY['Indigestion', 'Acidity', 'Flatulence', 'Stomach pain', 'Nausea'], ARRAY['Rarely heartburn'], ARRAY['GERD', 'Hypersensitivity to mint'], 'पुदीना हरा', false),
('Dabur Honitus Syrup', 'Cough Syrup', 'Tulsi + Honey + Mulethi', 'Ayurvedic Cough Syrup', 115.00, NULL, NULL, NULL, 'Syrup', '100ml', 'Dabur', ARRAY['Cough', 'Sore throat', 'Cold', 'Bronchitis', 'Respiratory congestion'], ARRAY['Rarely gastrointestinal upset'], ARRAY['Diabetes', 'Hypersensitivity'], 'दाबर होनिटस सिरप', false),
('Zandu Balm', 'Topical Analgesic', 'Mint + Camphor + Eucalyptus Oil', 'Ayurvedic Balm', 48.00, NULL, NULL, NULL, 'Balm', '8ml', 'Zandu', ARRAY['Headache', 'Body ache', 'Cold symptoms', 'Muscle pain', 'Joint pain'], ARRAY['Skin irritation', 'Redness'], ARRAY['Open wounds', 'Hypersensitivity'], 'जंडू बाम', false),
('Amla Juice', 'vitamin', 'Emblica Officinalis Juice', 'Ayurvedic Supplement', 185.00, NULL, NULL, NULL, 'Juice', '500ml', 'Multiple Manufacturers', ARRAY['Immunity booster', 'Hair health', 'Digestive health', 'Antioxidant', 'Vitamin C source'], ARRAY['Diarrhea', 'Acidity'], ARRAY['Hyperacidity', 'Diabetes (check sugar content)'], 'आंवला जूस', false),
('Giloy Tablets', 'Immunity Booster', 'Tinospora Cordifolia Extract', 'Ayurvedic Supplement', 225.00, NULL, NULL, NULL, 'Tablet', '60 tablets', 'Multiple Manufacturers', ARRAY['Immunity booster', 'Fever management', 'Chronic infections', 'Detoxification', 'Respiratory health'], ARRAY['Rarely gastrointestinal upset'], ARRAY['Auto-immune diseases', 'Pregnancy'], 'गिलोय टैबलेट', false),
('Tulsi Drops', 'Immunity Booster', 'Ocimum Sanctum Extract', 'Ayurvedic Supplement', 95.00, NULL, NULL, NULL, 'Drops', '30ml', 'Multiple Manufacturers', ARRAY['Immunity booster', 'Respiratory infections', 'Stress relief', 'Fever', 'Antioxidant'], ARRAY['Rarely nausea'], ARRAY['Hypoglycemia', 'Pregnancy'], 'तुलसी ड्रॉप्स', false),
('Himalaya Septilin', 'Immunity Booster', 'Guggul + Guduchi + Licorice', 'Ayurvedic Immunomodulator', 145.00, NULL, NULL, NULL, 'Tablet', '60 tablets', 'Himalaya', ARRAY['Recurrent infections', 'Upper respiratory infections', 'Allergic disorders', 'Immunity enhancement'], ARRAY['Rarely gastrointestinal upset'], ARRAY['Hypersensitivity'], 'हिमालय सेप्टिलिन', false),
('Himalaya Cystone', 'Urinary Health', 'Small Caltrops + Pasanabheda + Indian Madder', 'Ayurvedic Urinary Support', 185.00, NULL, NULL, NULL, 'Tablet', '60 tablets', 'Himalaya', ARRAY['Kidney stones prevention', 'UTI management', 'Urinary tract health', 'Crystalluria'], ARRAY['Rarely gastrointestinal upset'], ARRAY['Large kidney stones (>10mm)'], 'हिमालय सिस्टोन', false),
('Himalaya Rumalaya', 'Joint Health', 'Boswellia + Guggul + Indian Tinospora', 'Ayurvedic Joint Support', 295.00, NULL, NULL, NULL, 'Tablet', '60 tablets', 'Himalaya', ARRAY['Osteoarthritis', 'Rheumatoid arthritis', 'Joint pain', 'Inflammation', 'Mobility improvement'], ARRAY['Rarely gastrointestinal upset'], ARRAY['Pregnancy', 'Hypersensitivity'], 'हिमालय रुमालया', false),
('Brahmi Capsules', 'Cognitive Enhancer', 'Bacopa Monnieri Extract', 'Ayurvedic Supplement', 285.00, NULL, NULL, NULL, 'Capsule', '60 capsules', 'Multiple Manufacturers', ARRAY['Memory enhancement', 'Cognitive function', 'Anxiety relief', 'Stress management', 'Focus improvement'], ARRAY['Gastrointestinal upset', 'Drowsiness'], ARRAY['Pregnancy', 'Bradycardia', 'Urinary obstruction'], 'ब्राह्मी कैप्सूल', false),
('Shankhpushpi Syrup', 'Brain Tonic', 'Convolvulus Pluricaulis', 'Ayurvedic Brain Tonic', 125.00, NULL, NULL, NULL, 'Syrup', '200ml', 'Multiple Manufacturers', ARRAY['Memory improvement', 'Mental fatigue', 'Stress relief', 'Sleep improvement', 'Cognitive support'], ARRAY['Rarely drowsiness'], ARRAY['Hypotension'], 'शंखपुष्पी सिरप', false),
('Arjuna Capsules', 'Cardiac Health', 'Terminalia Arjuna Extract', 'Ayurvedic Cardiotonic', 285.00, NULL, NULL, NULL, 'Capsule', '60 capsules', 'Multiple Manufacturers', ARRAY['Heart health', 'Blood pressure management', 'Cholesterol management', 'Cardiac muscle strength'], ARRAY['Rarely gastrointestinal upset'], ARRAY['Hypotension', 'Pregnancy'], 'अर्जुन कैप्सूल', false),
('Karela Jamun Juice', 'Blood Sugar Management', 'Bitter Gourd + Jamun Extract', 'Ayurvedic Antidiabetic', 185.00, NULL, NULL, NULL, 'Juice', '500ml', 'Multiple Manufacturers', ARRAY['Blood sugar management', 'Diabetes support', 'Digestive health', 'Detoxification'], ARRAY['Hypoglycemia', 'Gastrointestinal upset'], ARRAY['Pregnancy', 'Hypoglycemia'], 'करेला जामुन जूस', false),

-- =============================================================================
-- WOUND CARE AND ANTISEPTICS
-- =============================================================================

('Betadine Solution', 'Povidone-Iodine', 'Povidone-Iodine 10% w/v', 'dermatological', 95.00, 'Povidone-Iodine Solution', 40.00, 57.89, 'Solution', '10% w/v', 'Win-Medicare', ARRAY['Wound disinfection', 'Pre-operative skin preparation', 'Burns', 'Cuts', 'Minor surgical procedures'], ARRAY['Skin irritation', 'Iodine sensitivity', 'Staining of skin'], ARRAY['Iodine allergy', 'Thyroid disorders', 'Pregnancy'], 'बीटाडीन सॉल्यूशन', false),
('Hydrogen Peroxide Solution', 'Hydrogen Peroxide', 'Hydrogen Peroxide 6% w/v', 'dermatological', 28.00, 'Hydrogen Peroxide Solution', 12.00, 57.14, 'Solution', '6% w/v', 'Multiple Manufacturers', ARRAY['Wound cleaning', 'Oral hygiene', 'Disinfection', 'Minor cuts', 'Surface cleaning'], ARRAY['Burning sensation', 'Skin irritation'], ARRAY['Deep wounds', 'Hypersensitivity'], 'हाइड्रोजन पेरोक्साइड सॉल्यूशन', false),
('Dettol Antiseptic Liquid', 'Chloroxylenol', 'Chloroxylenol 4.8% w/v', 'dermatological', 145.00, NULL, NULL, NULL, 'Liquid', '550ml', 'Reckitt Benckiser', ARRAY['Surface disinfection', 'Wound cleaning', 'Personal hygiene', 'Floor cleaning', 'Laundry disinfection'], ARRAY['Skin irritation (undiluted)', 'Redness'], ARRAY['Open wounds (undiluted)', 'Hypersensitivity'], 'डेटॉल एंटीसेप्टिक लिक्विड', false),
('Savlon Antiseptic Liquid', 'Chlorhexidine + Cetrimide', 'Chlorhexidine 0.3% + Cetrimide 3%', 'dermatological', 125.00, NULL, NULL, NULL, 'Liquid', '500ml', 'Johnson & Johnson', ARRAY['Wound cleaning', 'Personal hygiene', 'Minor cuts', 'Antiseptic bathing'], ARRAY['Rare skin irritation'], ARRAY['Hypersensitivity to chlorhexidine'], 'सैवलोन एंटीसेप्टिक लिक्विड', false),
('Framycetin Cream', 'Framycetin', 'Framycetin Sulfate 1% w/w', 'Topical Antibiotic', 52.00, 'Framycetin Cream', 22.00, 57.69, 'Cream', '1% w/w', 'Multiple Manufacturers', ARRAY['Infected wounds', 'Burns', 'Skin infections', 'Cuts and abrasions'], ARRAY['Skin irritation', 'Redness', 'Itching'], ARRAY['Hypersensitivity to aminoglycosides'], 'फ्रेमाइसेटिन क्रीम', false),
('Band-Aid Antiseptic', 'Medicated Bandage', 'Benzalkonium Chloride', 'Wound Dressing', 85.00, NULL, NULL, NULL, 'Adhesive Bandage', '10 strips', 'Johnson & Johnson', ARRAY['Minor cuts protection', 'Wound healing', 'Infection prevention', 'Scrapes'], ARRAY['Rare adhesive allergy'], ARRAY['Deep wounds', 'Infected wounds'], 'बैंड-एड एंटीसेप्टिक', false),
('Povidone-Iodine Ointment', 'Povidone-Iodine', 'Povidone-Iodine 5% w/w', 'Antiseptic Ointment', 68.00, 'Povidone-Iodine Ointment', 28.00, 58.82, 'Ointment', '5% w/w', 'Multiple Manufacturers', ARRAY['Wound healing', 'Burns', 'Cuts', 'Post-surgical care', 'Ulcers'], ARRAY['Skin irritation', 'Iodine sensitivity'], ARRAY['Iodine allergy', 'Thyroid disorders'], 'पोविडोन-आयोडीन मरहम', false),
('Cotton Gauze (Medicated)', 'Antiseptic Gauze', 'Chlorhexidine Impregnated', 'Wound Dressing', 45.00, NULL, NULL, NULL, 'Gauze', '10cm x 10cm', 'Multiple Manufacturers', ARRAY['Wound dressing', 'Burn dressing', 'Post-surgical care', 'Infection prevention'], ARRAY['Rare skin irritation'], ARRAY['Hypersensitivity to chlorhexidine'], 'कॉटन गॉज़ (मेडिकेटेड)', false),
('Chlorhexidine Mouthwash', 'Chlorhexidine Gluconate', 'Chlorhexidine Gluconate 0.2% w/v', 'Oral Antiseptic', 95.00, 'Chlorhexidine Mouthwash', 40.00, 57.89, 'Mouthwash', '0.2% w/v', 'Multiple Manufacturers', ARRAY['Gingivitis', 'Oral hygiene', 'Post-dental procedure care', 'Mouth ulcers', 'Plaque control'], ARRAY['Teeth staining', 'Altered taste', 'Tongue discoloration'], ARRAY['Hypersensitivity to chlorhexidine'], 'क्लोरहेक्सिडीन माउथवॉश', false),
('Surgical Spirit', 'Isopropyl Alcohol', 'Isopropyl Alcohol 90% v/v', 'dermatological', 65.00, NULL, NULL, NULL, 'Solution', '100ml', 'Multiple Manufacturers', ARRAY['Skin disinfection', 'Pre-injection swab', 'Surface sterilization', 'Medical equipment cleaning'], ARRAY['Skin dryness', 'Irritation'], ARRAY['Open wounds', 'Mucous membranes'], 'सर्जिकल स्पिरिट', false),

-- =============================================================================
-- NUTRITIONAL SUPPLEMENTS
-- =============================================================================

('Proteinex Powder', 'vitamin', 'Whey Protein + Vitamins + Minerals', 'vitamin', 895.00, NULL, NULL, NULL, 'Powder', '400g', 'Apex Laboratories', ARRAY['Protein supplementation', 'Muscle building', 'Post-workout recovery', 'Malnutrition', 'Nutritional support'], ARRAY['Bloating', 'Nausea', 'Gastrointestinal upset'], ARRAY['Dairy allergy', 'Lactose intolerance'], 'प्रोटीनेक्स पाउडर', false),
('Ensure Powder', 'Complete Nutrition', 'Protein + Carbohydrates + Fats + Vitamins', 'vitamin', 895.00, NULL, NULL, NULL, 'Powder', '400g', 'Abbott', ARRAY['Complete nutrition', 'Elderly nutrition', 'Convalescence', 'Weight gain', 'Malnutrition'], ARRAY['Nausea', 'Diarrhea', 'Constipation'], ARRAY['Galactosemia', 'Severe allergy to milk protein'], 'एन्श्योर पाउडर', false),
('Resource Powder', 'High Protein Supplement', 'Protein + Vitamins + Minerals', 'vitamin', 785.00, NULL, NULL, NULL, 'Powder', '400g', 'Nestle', ARRAY['High protein diet', 'Wound healing', 'Post-surgery', 'Muscle wasting', 'Cachexia'], ARRAY['Bloating', 'Nausea'], ARRAY['Galactosemia', 'Severe milk allergy'], 'रिसोर्स पाउडर', false),
('Shelcal-CT', 'Calcium + Vitamin D3 + Calcitonin', 'Calcium 500mg + Vitamin D3 250IU + Calcitonin', 'Bone Health Supplement', 165.00, NULL, NULL, NULL, 'Tablet', '15 tablets', 'Torrent Pharmaceuticals', ARRAY['Osteoporosis', 'Bone fractures', 'Calcium deficiency', 'Postmenopausal bone loss'], ARRAY['Constipation', 'Flatulence', 'Hypercalcemia'], ARRAY['Hypercalcemia', 'Kidney stones', 'Sarcoidosis'], 'शेलकैल-सीटी', false),
('Calcimax-D3', 'Calcium + Vitamin D3', 'Calcium Carbonate 500mg + Vitamin D3 250IU', 'Bone Health Supplement', 95.00, 'Calcium Vitamin D3 Tablet', 40.00, 57.89, 'Tablet', '500mg+250IU', 'Lupin', ARRAY['Osteoporosis prevention', 'Calcium deficiency', 'Bone health', 'Vitamin D deficiency'], ARRAY['Constipation', 'Flatulence', 'Nausea'], ARRAY['Hypercalcemia', 'Kidney stones'], 'कैल्सीमैक्स-डी3', false),
('Dexorange Syrup', 'Iron + Folic Acid + B12', 'Ferric Ammonium Citrate + Folic Acid + Cyanocobalamin', 'vitamin', 125.00, 'Iron Folic Acid B12 Syrup', 52.00, 58.40, 'Syrup', '200ml', 'Franco-Indian Pharma', ARRAY['Iron deficiency anemia', 'Pregnancy anemia', 'Nutritional anemia', 'Fatigue'], ARRAY['Constipation', 'Black stools', 'Nausea', 'Stomach upset'], ARRAY['Hemochromatosis', 'Thalassemia', 'Hemolytic anemia'], 'डेक्सोरेंज सिरप', false),
('Orofer-XT', 'Iron + Folic Acid + Zinc', 'Ferrous Ascorbate 100mg + Folic Acid 1.5mg + Zinc 22.5mg', 'vitamin', 145.00, 'Iron Folic Acid Zinc Tablet', 60.00, 58.62, 'Tablet', '100mg+1.5mg+22.5mg', 'Emcure Pharmaceuticals', ARRAY['Iron deficiency anemia', 'Pregnancy nutrition', 'Hemoglobin building', 'Zinc deficiency'], ARRAY['Black stools', 'Constipation', 'Nausea', 'Metallic taste'], ARRAY['Hemochromatosis', 'Wilson\'s disease', 'Thalassemia'], 'ओरोफेर-एक्सटी', false),
('Omega-3 Capsules', 'Omega-3 Fatty Acids', 'EPA 180mg + DHA 120mg', 'vitamin', 395.00, NULL, NULL, NULL, 'Capsule', '30 capsules', 'Multiple Manufacturers', ARRAY['Heart health', 'Cholesterol management', 'Brain health', 'Anti-inflammatory', 'Joint health'], ARRAY['Fishy aftertaste', 'Nausea', 'Diarrhea'], ARRAY['Fish allergy', 'Bleeding disorders'], 'ओमेगा-3 कैप्सूल', false),
('L-Methylfolate Tablet', 'L-Methylfolate', 'L-Methylfolate Calcium 1mg', 'vitamin', 285.00, NULL, NULL, NULL, 'Tablet', '1mg', 'Multiple Manufacturers', ARRAY['Folate deficiency', 'Depression support', 'Pregnancy nutrition', 'Neural tube defect prevention'], ARRAY['Nausea', 'Headache', 'Irritability'], ARRAY['Hypersensitivity', 'Vitamin B12 deficiency (masking)'], 'एल-मिथाइलफोलेट टैबलेट', false),
('Methycobal 500', 'Methylcobalamin', 'Methylcobalamin 500mcg', 'Vitamin B12 Supplement', 95.00, 'Methylcobalamin Tablet', 40.00, 57.89, 'Tablet', '500mcg', 'Sun Pharma', ARRAY['Vitamin B12 deficiency', 'Peripheral neuropathy', 'Anemia', 'Diabetic neuropathy'], ARRAY['Nausea', 'Headache', 'Dizziness'], ARRAY['Leber\'s disease', 'Hypersensitivity'], 'मेथाइकोबाल 500', false),
('CoQ10 Capsules', 'Coenzyme Q10', 'Ubidecarenone 100mg', 'Antioxidant Supplement', 695.00, NULL, NULL, NULL, 'Capsule', '30 capsules', 'Multiple Manufacturers', ARRAY['Heart health', 'Energy production', 'Statin-induced myopathy', 'Antioxidant', 'Mitochondrial support'], ARRAY['Nausea', 'Insomnia', 'Diarrhea'], ARRAY['Hypersensitivity', 'Warfarin interaction'], 'कोक्यू10 कैप्सूल', false),
('Lycopene Capsules', 'Lycopene + Antioxidants', 'Lycopene 10mg + Vitamins + Minerals', 'Antioxidant Supplement', 385.00, NULL, NULL, NULL, 'Capsule', '30 capsules', 'Multiple Manufacturers', ARRAY['Antioxidant support', 'Prostate health', 'Cardiovascular health', 'Skin protection'], ARRAY['Nausea', 'Diarrhea', 'Stomach cramps'], ARRAY['Hypersensitivity'], 'लाइकोपीन कैप्सूल', false),
('Vitamin E Capsules', 'Vitamin E', 'Tocopherol Acetate 400IU', 'vitamin', 195.00, 'Vitamin E Capsule', 82.00, 57.95, 'Capsule', '400IU', 'Multiple Manufacturers', ARRAY['Antioxidant', 'Skin health', 'Heart health', 'Immunity support', 'Cell protection'], ARRAY['Nausea', 'Diarrhea', 'Headache', 'Fatigue'], ARRAY['Bleeding disorders', 'Vitamin K deficiency'], 'विटामिन ई कैप्सूल', false),
('Biotin Tablets', 'Biotin', 'Biotin 10mg', 'vitamin', 495.00, NULL, NULL, NULL, 'Tablet', '30 tablets', 'Multiple Manufacturers', ARRAY['Hair health', 'Nail health', 'Skin health', 'Biotin deficiency'], ARRAY['Nausea', 'Diarrhea', 'Acne'], ARRAY['Hypersensitivity'], 'बायोटिन टैबलेट', false),
('Ferium XT', 'Iron + Folic Acid', 'Ferrous Ascorbate 100mg + Folic Acid 1.5mg', 'vitamin', 115.00, 'Iron Folic Acid Tablet', 48.00, 58.26, 'Tablet', '100mg+1.5mg', 'Emcure Pharmaceuticals', ARRAY['Iron deficiency anemia', 'Pregnancy anemia', 'Nutritional support', 'Hemoglobin improvement'], ARRAY['Black stools', 'Constipation', 'Nausea'], ARRAY['Hemochromatosis', 'Hemolytic anemia'], 'फेरियम एक्सटी', false),

-- =============================================================================
-- ANTI-MIGRAINE MEDICINES
-- =============================================================================

('Suminat 50', 'Sumatriptan', 'Sumatriptan 50mg', 'Anti-migraine', 285.00, 'Sumatriptan Tablet', 118.00, 58.60, 'Tablet', '50mg', 'Sun Pharma', ARRAY['Acute migraine', 'Cluster headache', 'Migraine with aura', 'Severe headache'], ARRAY['Tingling sensation', 'Flushing', 'Dizziness', 'Chest tightness'], ARRAY['Coronary artery disease', 'Uncontrolled hypertension', 'Ischemic heart disease'], 'सुमिनाट 50', false),
('Rizatriptan 10mg', 'Rizatriptan', 'Rizatriptan 10mg', 'Anti-migraine', 395.00, 'Rizatriptan Tablet', 165.00, 58.23, 'Tablet', '10mg', 'Multiple Manufacturers', ARRAY['Acute migraine', 'Migraine with or without aura'], ARRAY['Dizziness', 'Drowsiness', 'Dry mouth', 'Fatigue'], ARRAY['Ischemic heart disease', 'Cerebrovascular disease', 'Uncontrolled hypertension'], 'रिज़ाट्रिप्टन 10एमजी', false),
('Naratriptan 2.5mg', 'Naratriptan', 'Naratriptan 2.5mg', 'Anti-migraine', 485.00, NULL, NULL, NULL, 'Tablet', '2.5mg', 'GlaxoSmithKline', ARRAY['Acute migraine treatment', 'Migraine with aura'], ARRAY['Dizziness', 'Fatigue', 'Paresthesia'], ARRAY['Severe renal impairment', 'Hepatic impairment', 'Cardiovascular disease'], 'नराट्रिप्टन 2.5एमजी', false),
('Sibelium 10', 'Flunarizine', 'Flunarizine 10mg', 'Anti-migraine Prophylaxis', 125.00, 'Flunarizine Tablet', 52.00, 58.40, 'Tablet', '10mg', 'Janssen', ARRAY['Migraine prophylaxis', 'Vertigo', 'Chronic migraine prevention'], ARRAY['Drowsiness', 'Weight gain', 'Depression', 'Extrapyramidal symptoms'], ARRAY['Parkinson\'s disease', 'Depression', 'Pregnancy'], 'साइबेलियम 10', false),
('Propranolol 40mg', 'Propranolol', 'Propranolol 40mg', 'Beta Blocker (Anti-migraine)', 28.00, 'Propranolol Tablet', 12.00, 57.14, 'Tablet', '40mg', 'Multiple Manufacturers', ARRAY['Migraine prophylaxis', 'Hypertension', 'Anxiety', 'Performance anxiety', 'Tremors'], ARRAY['Bradycardia', 'Fatigue', 'Cold extremities', 'Dizziness'], ARRAY['Asthma', 'COPD', 'Heart block', 'Cardiogenic shock'], 'प्रोप्रानोलोल 40एमजी', true),

-- =============================================================================
-- ANTI-VERTIGO MEDICINES
-- =============================================================================

('Vertin 16', 'Betahistine', 'Betahistine 16mg', 'Anti-vertigo', 95.00, 'Betahistine Tablet', 40.00, 57.89, 'Tablet', '16mg', 'Abbott', ARRAY['Vertigo', 'Meniere\'s disease', 'Tinnitus', 'Balance disorders'], ARRAY['Nausea', 'Headache', 'Dyspepsia'], ARRAY['Pheochromocytoma', 'Peptic ulcer', 'Hypersensitivity'], 'वर्टिन 16', false),
('Stugeron 25', 'Cinnarizine', 'Cinnarizine 25mg', 'Anti-vertigo', 52.00, 'Cinnarizine Tablet', 22.00, 57.69, 'Tablet', '25mg', 'Janssen', ARRAY['Vertigo', 'Motion sickness', 'Vestibular disorders', 'Nausea during travel'], ARRAY['Drowsiness', 'Dry mouth', 'Weight gain'], ARRAY['Parkinson\'s disease', 'Pregnancy'], 'स्टुगेरॉन 25', false),
('Meclizine 25mg', 'Meclizine', 'Meclizine 25mg', 'Anti-vertigo + Antiemetic', 68.00, 'Meclizine Tablet', 28.00, 58.82, 'Tablet', '25mg', 'Multiple Manufacturers', ARRAY['Motion sickness', 'Vertigo', 'Nausea', 'Dizziness'], ARRAY['Drowsiness', 'Dry mouth', 'Blurred vision'], ARRAY['Hypersensitivity', 'Glaucoma', 'Prostatic hyperplasia'], 'मेक्लिज़ीन 25एमजी', false),
('Vertin-MD 8', 'Betahistine', 'Betahistine 8mg', 'Anti-vertigo', 68.00, 'Betahistine Tablet', 28.00, 58.82, 'Mouth Dissolving Tablet', '8mg', 'Abbott', ARRAY['Mild vertigo', 'Meniere\'s disease', 'Tinnitus'], ARRAY['Nausea', 'Headache', 'Indigestion'], ARRAY['Pheochromocytoma', 'Peptic ulcer'], 'वर्टिन-एमडी 8', false),
('Stemetil MD', 'Prochlorperazine', 'Prochlorperazine 5mg', 'Antiemetic + Anti-vertigo', 85.00, 'Prochlorperazine Tablet', 35.00, 58.82, 'Mouth Dissolving Tablet', '5mg', 'Sanofi India', ARRAY['Vertigo', 'Nausea', 'Vomiting', 'Labyrinthitis'], ARRAY['Drowsiness', 'Dry mouth', 'Extrapyramidal symptoms'], ARRAY['Parkinson\'s disease', 'Glaucoma', 'Bone marrow depression'], 'स्टेमेटिल एमडी', false),

-- =============================================================================
-- MISCELLANEOUS COMMON OTC
-- =============================================================================

('Mala-D', 'Oral Contraceptive', 'Desogestrel 0.15mg + Ethinyl Estradiol 0.03mg', 'gynecological', 185.00, NULL, NULL, NULL, 'Tablet', '21 tablets', 'Pfizer', ARRAY['Contraception', 'Birth control', 'Menstrual regulation', 'PCOS management'], ARRAY['Nausea', 'Headache', 'Breast tenderness', 'Weight gain', 'Mood changes'], ARRAY['Pregnancy', 'Thromboembolic disorders', 'Breast cancer', 'Liver disease'], 'माला-डी', false),
('i-Pill', 'Emergency Contraception', 'Levonorgestrel 1.5mg', 'gynecological', 95.00, NULL, NULL, NULL, 'Tablet', '1 tablet', 'Piramal Healthcare', ARRAY['Emergency contraception within 72 hours', 'Prevention of unwanted pregnancy after unprotected intercourse'], ARRAY['Nausea', 'Vomiting', 'Fatigue', 'Menstrual irregularities'], ARRAY['Pregnancy', 'Hypersensitivity'], 'आई-पिल', false),
('Unwanted-72', 'Emergency Contraception', 'Levonorgestrel 0.75mg', 'gynecological', 42.00, NULL, NULL, NULL, 'Tablet', '2 tablets', 'Mankind Pharma', ARRAY['Emergency contraception', 'Prevention of pregnancy after unprotected sex'], ARRAY['Nausea', 'Menstrual changes', 'Fatigue', 'Abdominal pain'], ARRAY['Pregnancy', 'Hypersensitivity'], 'अनवांटेड-72', false),
('Manforce 50mg', 'Sildenafil', 'Sildenafil Citrate 50mg', 'urological', 95.00, NULL, NULL, NULL, 'Tablet', '50mg', 'Mankind Pharma', ARRAY['Erectile dysfunction', 'Male sexual dysfunction', 'Pulmonary arterial hypertension'], ARRAY['Headache', 'Flushing', 'Dyspepsia', 'Nasal congestion', 'Visual disturbances'], ARRAY['Nitrate use', 'Severe cardiovascular disease', 'Recent stroke'], 'मैनफोर्स 50एमजी', false),
('Penegra 50mg', 'Sildenafil', 'Sildenafil Citrate 50mg', 'urological', 105.00, NULL, NULL, NULL, 'Tablet', '50mg', 'Zydus Cadila', ARRAY['Erectile dysfunction', 'Pulmonary arterial hypertension'], ARRAY['Headache', 'Flushing', 'Dizziness', 'Nasal congestion'], ARRAY['Nitrate therapy', 'Severe heart failure', 'Recent MI'], 'पेनेग्रा 50एमजी', false),
('Misoprostol 200mcg', 'Misoprostol', 'Misoprostol 200mcg', 'Prostaglandin Analogue', 38.00, 'Misoprostol Tablet', 16.00, 57.89, 'Tablet', '200mcg', 'Multiple Manufacturers', ARRAY['Medical abortion (with mifepristone)', 'Peptic ulcer prevention (NSAID-induced)', 'Postpartum hemorrhage'], ARRAY['Diarrhea', 'Abdominal pain', 'Nausea', 'Uterine cramps'], ARRAY['Pregnancy (when used for ulcer)', 'Hypersensitivity', 'Ectopic pregnancy'], 'मिसोप्रोस्टोल 200एमसीजी', true),
('Methotrexate 2.5mg', 'Methotrexate', 'Methotrexate 2.5mg', 'other_essential', 52.00, 'Methotrexate Tablet', 22.00, 57.69, 'Tablet', '2.5mg', 'Multiple Manufacturers', ARRAY['Rheumatoid arthritis', 'Psoriasis', 'Cancer chemotherapy', 'Ectopic pregnancy'], ARRAY['Nausea', 'Mouth ulcers', 'Liver toxicity', 'Bone marrow suppression'], ARRAY['Pregnancy', 'Severe renal impairment', 'Liver disease', 'Immunodeficiency'], 'मेथोट्रेक्सेट 2.5एमजी', true),
('Hydroxychloroquine 200mg', 'Hydroxychloroquine', 'Hydroxychloroquine Sulfate 200mg', 'Antimalarial + Immunomodulator', 68.00, 'Hydroxychloroquine Tablet', 28.00, 58.82, 'Tablet', '200mg', 'Ipca Laboratories', ARRAY['Rheumatoid arthritis', 'Systemic lupus erythematosus', 'Malaria prophylaxis', 'Q fever'], ARRAY['Nausea', 'Headache', 'Dizziness', 'Retinopathy (long-term)'], ARRAY['Retinal disease', 'G6PD deficiency', 'Hypersensitivity'], 'हाइड्रॉक्सीक्लोरोक्वीन 200एमजी', true),
('Dapsone 100mg', 'Dapsone', 'Dapsone 100mg', 'Anti-leprotic + Antibiotic', 45.00, 'Dapsone Tablet', 19.00, 57.78, 'Tablet', '100mg', 'Multiple Manufacturers', ARRAY['Leprosy', 'Dermatitis herpetiformis', 'Pneumocystis pneumonia prophylaxis', 'Acne (off-label)'], ARRAY['Hemolytic anemia', 'Methemoglobinemia', 'Nausea', 'Headache'], ARRAY['G6PD deficiency', 'Severe anemia', 'Hypersensitivity'], 'डैप्सोन 100एमजी', true),
('Isotretinoin 20mg', 'Isotretinoin', 'Isotretinoin 20mg', 'Retinoid (Anti-acne)', 485.00, 'Isotretinoin Capsule', 200.00, 58.76, 'Capsule', '20mg', 'Multiple Manufacturers', ARRAY['Severe acne', 'Nodular acne', 'Acne unresponsive to other treatments'], ARRAY['Dry skin', 'Dry lips', 'Nosebleeds', 'Elevated liver enzymes', 'Teratogenicity'], ARRAY['Pregnancy', 'Breastfeeding', 'Hypersensitivity to retinoids', 'Hepatic impairment'], 'आइसोट्रेटिनोइन 20एमजी', true),
('Tretinoin Cream', 'Tretinoin', 'Tretinoin 0.025% w/w', 'Retinoid (Anti-acne)', 285.00, 'Tretinoin Cream', 118.00, 58.60, 'Cream', '0.025% w/w', 'Multiple Manufacturers', ARRAY['Acne vulgaris', 'Photoaging', 'Fine wrinkles', 'Hyperpigmentation'], ARRAY['Skin irritation', 'Peeling', 'Redness', 'Photosensitivity'], ARRAY['Pregnancy', 'Eczema', 'Sunburn'], 'ट्रेटिनोइन क्रीम', false),
('Minoxidil Solution 5%', 'Minoxidil', 'Minoxidil 5% w/v', 'Hair Growth Promoter', 485.00, NULL, NULL, NULL, 'Topical Solution', '60ml', 'Multiple Manufacturers', ARRAY['Male pattern baldness', 'Alopecia', 'Hair growth stimulation'], ARRAY['Scalp irritation', 'Itching', 'Facial hair growth (in women)'], ARRAY['Hypersensitivity', 'Pheochromocytoma'], 'मिनोक्सिडिल सॉल्यूशन 5%', false),
('Finasteride 1mg', 'Finasteride', 'Finasteride 1mg', 'Hair Loss Treatment', 385.00, NULL, NULL, NULL, 'Tablet', '1mg', 'Multiple Manufacturers', ARRAY['Male pattern baldness', 'Hair loss prevention', 'Androgenetic alopecia'], ARRAY['Decreased libido', 'Erectile dysfunction', 'Breast tenderness'], ARRAY['Women of childbearing age', 'Pregnancy', 'Hypersensitivity'], 'फिनास्टेराइड 1एमजी', false),
('Dutasteride 0.5mg', 'Dutasteride', 'Dutasteride 0.5mg', '5-alpha Reductase Inhibitor', 495.00, NULL, NULL, NULL, 'Capsule', '0.5mg', 'GlaxoSmithKline', ARRAY['Benign prostatic hyperplasia', 'Hair loss (off-label)', 'Prostate enlargement'], ARRAY['Decreased libido', 'Erectile dysfunction', 'Gynecomastia'], ARRAY['Women', 'Children', 'Hypersensitivity', 'Hepatic impairment'], 'ड्यूटास्टेराइड 0.5एमजी', false),
('Tamsulosin 0.4mg', 'Tamsulosin', 'Tamsulosin 0.4mg', 'Alpha Blocker', 125.00, 'Tamsulosin Capsule', 52.00, 58.40, 'Capsule', '0.4mg', 'Multiple Manufacturers', ARRAY['Benign prostatic hyperplasia', 'Urinary retention', 'Kidney stones passage'], ARRAY['Dizziness', 'Orthostatic hypotension', 'Retrograde ejaculation'], ARRAY['Hypersensitivity', 'Severe hepatic impairment'], 'टैमसुलोसिन 0.4एमजी', false),
('Alfuzosin 10mg', 'Alfuzosin', 'Alfuzosin 10mg', 'Alpha Blocker', 185.00, 'Alfuzosin Tablet', 78.00, 57.84, 'Tablet', '10mg', 'Sanofi India', ARRAY['Benign prostatic hyperplasia', 'Urinary symptoms', 'Prostate enlargement'], ARRAY['Dizziness', 'Headache', 'Fatigue', 'Hypotension'], ARRAY['Severe hepatic impairment', 'Concurrent use with strong CYP3A4 inhibitors'], 'अल्फुज़ोसिन 10एमजी', false),

-- =============================================================================
-- VERIFICATION
-- =============================================================================
-- SELECT category, COUNT(*) FROM public.medicines GROUP BY category ORDER BY count DESC;
