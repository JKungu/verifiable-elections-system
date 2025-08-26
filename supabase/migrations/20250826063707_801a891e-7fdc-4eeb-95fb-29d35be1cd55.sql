-- Update election_candidates table IDs to follow the new naming structure

-- Presidential candidates: pres-{number}
UPDATE public.election_candidates 
SET id = 'pres-1' 
WHERE id = 'raila_odinga';

UPDATE public.election_candidates 
SET id = 'pres-2' 
WHERE id = 'william_ruto';

UPDATE public.election_candidates 
SET id = 'pres-3' 
WHERE id = 'george_wajackoyah';

UPDATE public.election_candidates 
SET id = 'pres-4' 
WHERE id = 'david_mwaure';

-- Governor candidates: gov-{county}-{number}
-- Kiambu County
UPDATE public.election_candidates 
SET id = 'gov-kiambu-1' 
WHERE id = 'gov_kiambu_1';

UPDATE public.election_candidates 
SET id = 'gov-kiambu-2' 
WHERE id = 'gov_kiambu_2';

UPDATE public.election_candidates 
SET id = 'gov-kiambu-3' 
WHERE id = 'gov_kiambu_3';

-- Nairobi County
UPDATE public.election_candidates 
SET id = 'gov-nairobi-1' 
WHERE id = 'gov_nairobi_1';

UPDATE public.election_candidates 
SET id = 'gov-nairobi-2' 
WHERE id = 'gov_nairobi_2';

UPDATE public.election_candidates 
SET id = 'gov-nairobi-3' 
WHERE id = 'gov_nairobi_3';

-- Nakuru County
UPDATE public.election_candidates 
SET id = 'gov-nakuru-1' 
WHERE id = 'gov_nakuru_1';

UPDATE public.election_candidates 
SET id = 'gov-nakuru-2' 
WHERE id = 'gov_nakuru_2';

UPDATE public.election_candidates 
SET id = 'gov-nakuru-3' 
WHERE id = 'gov_nakuru_3';

-- Kisumu County
UPDATE public.election_candidates 
SET id = 'gov-kisumu-1' 
WHERE id = 'gov_kisumu_1';

UPDATE public.election_candidates 
SET id = 'gov-kisumu-2' 
WHERE id = 'gov_kisumu_2';

UPDATE public.election_candidates 
SET id = 'gov-kisumu-3' 
WHERE id = 'gov_kisumu_3';

-- Mombasa County
UPDATE public.election_candidates 
SET id = 'gov-mombasa-1' 
WHERE id = 'gov_mombasa_1';

UPDATE public.election_candidates 
SET id = 'gov-mombasa-2' 
WHERE id = 'gov_mombasa_2';

UPDATE public.election_candidates 
SET id = 'gov-mombasa-3' 
WHERE id = 'gov_mombasa_3';

-- Women Representatives: wrep-{county}-{number}
UPDATE public.election_candidates 
SET id = 'wrep-kiambu-1' 
WHERE id = 'wrep_kiambu_1';

UPDATE public.election_candidates 
SET id = 'wrep-kiambu-2' 
WHERE id = 'wrep_kiambu_2';

UPDATE public.election_candidates 
SET id = 'wrep-kiambu-3' 
WHERE id = 'wrep_kiambu_3';

UPDATE public.election_candidates 
SET id = 'wrep-nairobi-1' 
WHERE id = 'wrep_nairobi_1';

UPDATE public.election_candidates 
SET id = 'wrep-nairobi-2' 
WHERE id = 'wrep_nairobi_2';

UPDATE public.election_candidates 
SET id = 'wrep-nairobi-3' 
WHERE id = 'wrep_nairobi_3';

UPDATE public.election_candidates 
SET id = 'wrep-nakuru-1' 
WHERE id = 'wrep_nakuru_1';

UPDATE public.election_candidates 
SET id = 'wrep-nakuru-2' 
WHERE id = 'wrep_nakuru_2';

UPDATE public.election_candidates 
SET id = 'wrep-nakuru-3' 
WHERE id = 'wrep_nakuru_3';

UPDATE public.election_candidates 
SET id = 'wrep-kisumu-1' 
WHERE id = 'wrep_kisumu_1';

UPDATE public.election_candidates 
SET id = 'wrep-kisumu-2' 
WHERE id = 'wrep_kisumu_2';

UPDATE public.election_candidates 
SET id = 'wrep-kisumu-3' 
WHERE id = 'wrep_kisumu_3';

UPDATE public.election_candidates 
SET id = 'wrep-mombasa-1' 
WHERE id = 'wrep_mombasa_1';

UPDATE public.election_candidates 
SET id = 'wrep-mombasa-2' 
WHERE id = 'wrep_mombasa_2';

UPDATE public.election_candidates 
SET id = 'wrep-mombasa-3' 
WHERE id = 'wrep_mombasa_3';

-- Member of Parliament: mp-{county}{constituency}-{number}
-- Kiambu County constituencies
UPDATE public.election_candidates 
SET id = 'mp-kiambumurera-1' 
WHERE id = 'mp_murera_1';

UPDATE public.election_candidates 
SET id = 'mp-kiambumurera-2' 
WHERE id = 'mp_murera_2';

UPDATE public.election_candidates 
SET id = 'mp-kiambumurera-3' 
WHERE id = 'mp_murera_3';

UPDATE public.election_candidates 
SET id = 'mp-kiambutown-1' 
WHERE id = 'mp-const-552-a';

UPDATE public.election_candidates 
SET id = 'mp-kiambutown-2' 
WHERE id = 'mp-const-552-b';

-- Nairobi County constituencies
UPDATE public.election_candidates 
SET id = 'mp-nairobiwestlands-1' 
WHERE id = 'mp_westlands_1';

UPDATE public.election_candidates 
SET id = 'mp-nairobiwestlands-2' 
WHERE id = 'mp_westlands_2';

UPDATE public.election_candidates 
SET id = 'mp-nairobiwestlands-3' 
WHERE id = 'mp_westlands_3';

UPDATE public.election_candidates 
SET id = 'mp-nairobiwestlands-4' 
WHERE id = 'mp-const-558-a';

UPDATE public.election_candidates 
SET id = 'mp-nairobiwestlands-5' 
WHERE id = 'mp-const-558-b';

-- Nakuru County constituencies
UPDATE public.election_candidates 
SET id = 'mp-nakurunakuruweast-1' 
WHERE id = 'mp_nakuru_west_1';

UPDATE public.election_candidates 
SET id = 'mp-nakurunakuruweast-2' 
WHERE id = 'mp_nakuru_west_2';

UPDATE public.election_candidates 
SET id = 'mp-nakurunakuruweast-3' 
WHERE id = 'mp_nakuru_west_3';

-- Kisumu County constituencies
UPDATE public.election_candidates 
SET id = 'mp-kisumukisumuweast-1' 
WHERE id = 'mp_kisumu_west_1';

UPDATE public.election_candidates 
SET id = 'mp-kisumukisumuweast-2' 
WHERE id = 'mp_kisumu_west_2';

UPDATE public.election_candidates 
SET id = 'mp-kisumukisumuweast-3' 
WHERE id = 'mp_kisumu_west_3';

-- Mombasa County constituencies
UPDATE public.election_candidates 
SET id = 'mp-mombasachangamwe-1' 
WHERE id = 'mp_changamwe_1';

UPDATE public.election_candidates 
SET id = 'mp-mombasachangamwe-2' 
WHERE id = 'mp_changamwe_2';

UPDATE public.election_candidates 
SET id = 'mp-mombasachangamwe-3' 
WHERE id = 'mp_changamwe_3';

-- Member of County Assembly: mca-{county}{constituency}{ward}-{number}
-- Kiambu County wards
UPDATE public.election_candidates 
SET id = 'mca-kiambumurera-1' 
WHERE id = 'mca_murera_1';

UPDATE public.election_candidates 
SET id = 'mca-kiambumurera-2' 
WHERE id = 'mca_murera_2';

UPDATE public.election_candidates 
SET id = 'mca-kiambumurera-3' 
WHERE id = 'mca_murera_3';

UPDATE public.election_candidates 
SET id = 'mca-kiambumurera-4' 
WHERE id = 'mca_murera_4';

UPDATE public.election_candidates 
SET id = 'mca-kiambubiashara-1' 
WHERE id = 'mca_biashara_1';

UPDATE public.election_candidates 
SET id = 'mca-kiambubiashara-2' 
WHERE id = 'mca_biashara_2';

UPDATE public.election_candidates 
SET id = 'mca-kiambubiashara-3' 
WHERE id = 'mca_biashara_3';

UPDATE public.election_candidates 
SET id = 'mca-kiambuward-0547-1' 
WHERE id = 'mca_ward0547_1';

UPDATE public.election_candidates 
SET id = 'mca-kiambuward-0547-2' 
WHERE id = 'mca_ward0547_2';

UPDATE public.election_candidates 
SET id = 'mca-kiambuward-0547-3' 
WHERE id = 'mca_ward0547_3';

UPDATE public.election_candidates 
SET id = 'mca-kiambuward-0547-4' 
WHERE id = 'mca_ward0547_4';

UPDATE public.election_candidates 
SET id = 'mca-kiambuward-0552-1' 
WHERE id = 'mca-ward-552-a';

UPDATE public.election_candidates 
SET id = 'mca-kiambuward-0552-2' 
WHERE id = 'mca-ward-552-b';

UPDATE public.election_candidates 
SET id = 'mca-kiambuward-0552-3' 
WHERE id = 'mca-ward-552-c';

UPDATE public.election_candidates 
SET id = 'mca-kiambuward-0552-4' 
WHERE id = 'mca-ward-0552-1';

UPDATE public.election_candidates 
SET id = 'mca-kiambuward-0552-5' 
WHERE id = 'mca-ward-0552-2';

UPDATE public.election_candidates 
SET id = 'mca-kiambuward-0552-6' 
WHERE id = 'mca-ward-0552-3';

UPDATE public.election_candidates 
SET id = 'mca-kiambuward-0558-1' 
WHERE id = 'mca-ward-558-a';

UPDATE public.election_candidates 
SET id = 'mca-kiambuward-0558-2' 
WHERE id = 'mca-ward-558-b';

UPDATE public.election_candidates 
SET id = 'mca-kiambuward-0558-3' 
WHERE id = 'mca-ward-558-c';

UPDATE public.election_candidates 
SET id = 'mca-kiambuward-0558-4' 
WHERE id = 'mca-ward-0558-1';

UPDATE public.election_candidates 
SET id = 'mca-kiambuward-0558-5' 
WHERE id = 'mca-ward-0558-2';

UPDATE public.election_candidates 
SET id = 'mca-kiambuward-0558-6' 
WHERE id = 'mca-ward-0558-3';

-- Nairobi County wards
UPDATE public.election_candidates 
SET id = 'mca-nairobiparklands-1' 
WHERE id = 'mca_parklands_1';

UPDATE public.election_candidates 
SET id = 'mca-nairobiparklands-2' 
WHERE id = 'mca_parklands_2';

UPDATE public.election_candidates 
SET id = 'mca-nairobiparklands-3' 
WHERE id = 'mca_parklands_3';

-- Nakuru County wards
UPDATE public.election_candidates 
SET id = 'mca-nakurutownship-1' 
WHERE id = 'mca_township_1';

UPDATE public.election_candidates 
SET id = 'mca-nakurutownship-2' 
WHERE id = 'mca_township_2';

UPDATE public.election_candidates 
SET id = 'mca-nakurutownship-3' 
WHERE id = 'mca_township_3';

-- Kisumu County wards
UPDATE public.election_candidates 
SET id = 'mca-kisumukolwacentral-1' 
WHERE id = 'mca_kolwacentral_1';

UPDATE public.election_candidates 
SET id = 'mca-kisumukolwacentral-2' 
WHERE id = 'mca_kolwacentral_2';

UPDATE public.election_candidates 
SET id = 'mca-kisumukolwacentral-3' 
WHERE id = 'mca_kolwacentral_3';

-- Mombasa County wards
UPDATE public.election_candidates 
SET id = 'mca-mombasamajengo-1' 
WHERE id = 'mca_majengo_1';

UPDATE public.election_candidates 
SET id = 'mca-mombasamajengo-2' 
WHERE id = 'mca_majengo_2';

UPDATE public.election_candidates 
SET id = 'mca-mombasamajengo-3' 
WHERE id = 'mca_majengo_3';