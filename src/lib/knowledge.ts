/**
 * Shamba AI knowledge base + deterministic diagnosis engine.
 *
 * The same `diagnoseFromHash` function runs server-side (cloud model route)
 * and client-side (offline "TFLite" path), so offline and online results are
 * consistent for identical image bytes. This is the demo stand-in for the
 * CNN described in the product brief.
 */

export type CropKey = "maize" | "beans" | "tomato" | "potato" | "cassava";
export type ThreatType = "disease" | "pest" | "healthy";
export type SpreadRisk = "low" | "medium" | "high";

export const CROPS: CropKey[] = ["maize", "beans", "tomato", "potato", "cassava"];

export interface Threat {
  key: string;
  crop: CropKey;
  type: ThreatType;
  nameEn: string;
  nameSw: string;
  latinName?: string;
  descEn: string;
  descSw: string;
  organicEn: string[];
  organicSw: string[];
  chemicalEn: string[];
  chemicalSw: string[];
  baseSeverity: number; // 1-5
  spreadRisk: SpreadRisk;
  prevalence: number; // relative weight inside its crop
}

export const THREATS: Threat[] = [
  // ============ MAIZE ============
  {
    key: "fall_armyworm",
    crop: "maize",
    type: "pest",
    nameEn: "Fall Armyworm",
    nameSw: "Vifunjavifunja (Fall Armyworm)",
    latinName: "Spodoptera frugiperda",
    descEn:
      "Caterpillars that feed aggressively on maize leaves, whorls and cob, leaving ragged holes and sawdust-like droppings. Can wipe out a whole field if scouting is missed for a week.",
    descSw:
      "Viwavijeshi wanaokula majani, moyo na gunia la mahindi kwa hasara kubwa, wakiacha mashimo na kinyesi kama machungi ya mbao. Wanaweza kuangamiza shamba zima ndani ya wiki moja bila ufuatiliaji.",
    organicEn: [
      "Scout twice a week and hand-pick caterpillars into soapy water early morning.",
      "Apply neem seed extract (azadirachtin) into the whorl every 5–7 days.",
      "Release Telenomus remus parasitoid wasps or spray Bt (Bacillus thuringiensis).",
      "Apply wood ash or sand into the whorl as a local repellent.",
    ],
    organicSw: [
      "Chunguza mara mbili kwa wiki na uokote viwavijeshi uwatie maji ya sabuni alfajiri.",
      "Nyunyizia dondoo ya mwarobaini (azadirachtin) kwenye moyo wa mmea kila siku 5–7.",
      "Tumia vimelea vya Bt (Bacillus thuringiensis) au wadudu wanaomeza mayai (Telenomus remus).",
      "Weka majivu ya mbao au mchanga kwenye moyo wa mmea kuzuia.",
    ],
    chemicalEn: [
      "Emamectin benzoate 5 SG at first sighting; spray into the whorl in the evening.",
      "Chlorantraniliprole 200 SC for heavier infestations — rotate modes of action to avoid resistance.",
    ],
    chemicalSw: [
      "Emamectin benzoate 5 SG mara moja uone; nyunyizia moyoni mwa mmea jioni.",
      "Chlorantraniliprole 200 SC kwa uvamizi mkubwa — badilisha dawa ili kuzuia sugu.",
    ],
    baseSeverity: 4,
    spreadRisk: "high",
    prevalence: 30,
  },
  {
    key: "maize_stem_borer",
    crop: "maize",
    type: "pest",
    nameEn: "Maize Stem Borer",
    nameSw: "Mlatua-shina wa Mahindi",
    latinName: "Busseola fusca",
    descEn:
      "Larvae tunnel into stems and the central whorl, causing 'dead heart' in young plants and broken, lodge-prone stems later in the season.",
    descSw:
      "Viwavijeshi hutoa mashina ndani ya mmea na moyo, na kusababisha 'kufa kwa moyo' kwa mimea michanga na mashina yanayovunjika baadaye.",
    organicEn: [
      "Remove and destroy crop residues after harvest to kill overwintering larvae.",
      "Use push–pull: intercrop with desmodium and plant Napier grass on borders.",
      "Apply Bt or neem granules into the whorl at early infestation.",
    ],
    organicSw: [
      "Ondoa na uteketeze mabaki ya mazao baada ya kuvuna kuua viwavijeshi.",
      "Tumia njia ya s ukuma–vuta (push–pull): panda desmodium kati ya mistari na napier mipakani.",
      "Tia chembechembe za Bt au mwarobaini moyoni mwa mmea mapema.",
    ],
    chemicalEn: [
      "Lambda-cyhalothrin 2.5 EC as whorl application at early vegetative stage.",
      "Alpha-cypermethrin granules directly into the whorl.",
    ],
    chemicalSw: [
      "Lambda-cyhalothrin 2.5 EC kwenye moyo wa mmea katika hatua ya mapema.",
      "Chembechembe za alpha-cypermethrin mojawapo moyoni mwa mmea.",
    ],
    baseSeverity: 3,
    spreadRisk: "medium",
    prevalence: 12,
  },
  {
    key: "mln",
    crop: "maize",
    type: "disease",
    nameEn: "Maize Lethal Necrosis (MLN)",
    nameSw: "Ugonjwa wa Kuzisha wa Mahindi (MLN)",
    latinName: "MCMV + SCMV virus complex",
    descEn:
      "A viral complex spread by thrips and beetles that yellows and dries leaves from the edges, stunts cobs and can kill whole plants. One of the most destructive maize diseases in Kenya.",
    descSw:
      "Mchanganyiko wa virusi unaenezwa na thrips na mende, unaonyekeyesha na kukausha majani kutoka ncha, na kudumaza mabanda. Ni mojawapo ya magonjwa yenye uharibifu mkubwa zaidi Kenya.",
    organicEn: [
      "Uproot and burn infected plants immediately — there is no cure.",
      "Control insect vectors (thrips, leaf beetles) with neem or insecticidal soap.",
      "Plant certified MLN-tolerant seed and rotate with legumes for a season.",
    ],
    organicSw: [
      "Ng'oa na uteketeze mimea iliyoathirika mara moja — hakuna tiba.",
      "Dhibiti wadudu wanaoeneza virusi kwa dawa za mwarobaini au sabuni ya kuulia wadudu.",
      "Panda mbegu zilizoidhinishwa sugu za MLN na zungusha mazao na mimea ya kunde.",
    ],
    chemicalEn: [
      "No chemical cures the virus — spray Imidacloprid 200 SL only to suppress the thrips/beetle vectors.",
    ],
    chemicalSw: [
      "Hakuna dawa ya kuponya virusi — nyunyizia Imidacloprid 200 SL kupunguza wadudu wasambazaji tu.",
    ],
    baseSeverity: 5,
    spreadRisk: "high",
    prevalence: 16,
  },
  {
    key: "gray_leaf_spot",
    crop: "maize",
    type: "disease",
    nameEn: "Gray Leaf Spot",
    nameSw: "Madoa ya Kijivu Majanini",
    latinName: "Cercospora zeae-maydis",
    descEn:
      "Rectangular grey-brown lesions running along the leaf veins. Severe attacks dry out lower leaves early and cut grain fill, especially under continuous maize cropping.",
    descSw:
      "Michirizi ya kijivu-kahawia ya mstatili kando ya mishipa ya majani. Shambulio kubwa hukauka majani ya chini mapema na kupunguza mavuno, hasa mahindi yakifuatana.",
    organicEn: [
      "Rotate maize with legumes for at least one season.",
      "Bury or remove infected stover after harvest to reduce spores.",
      "Plant tolerant hybrids such as those recommended by KALRO.",
    ],
    organicSw: [
      "Zungusha mahindi na mimea ya kunde kwa angalau msimu mmoja.",
      "Zika au ondoa mabaki yaliyoambukizwa baada ya mavuno kupunguza mag sporos.",
      "Panda aina sugu zinazopendekezwa na KALRO.",
    ],
    chemicalEn: [
      "Azoxystrobin + cyproconazole at first lesion appearance; repeat after 14 days if humid.",
      "Mancozeb 80 WP as a protectant in high-pressure seasons.",
    ],
    chemicalSw: [
      "Azoxystrobin + cyproconazole michirizi itakapotokea; rudia baada ya siku 14 kukiwa na unyevu.",
      "Mancozeb 80 WP kama kinga wakati wa shinikizo kubwa.",
    ],
    baseSeverity: 3,
    spreadRisk: "medium",
    prevalence: 13,
  },
  {
    key: "northern_leaf_blight",
    crop: "maize",
    type: "disease",
    nameEn: "Northern Leaf Blight",
    nameSw: "Uoza wa Majani wa Kaskazini",
    latinName: "Exserohilum turcicum",
    descEn:
      "Long cigar-shaped grey-green lesions that expand in cool, humid highland weather. Heavy infection burns whole leaves and slashes yields.",
    descSw:
      "Michirizi mirefu kama sigara ya kijivu-kijani inayopanuka kwa hali ya baridi na unyevu. Maambukizi makali huchoma majani yote na kupunguza mavuno vibaya.",
    organicEn: [
      "Use resistant hybrids; avoid late planting into cold, wet weather.",
      "Destroy crop residues and rotate away from maize for a season.",
      "Space plants wider to improve airflow and reduce leaf wetness.",
    ],
    organicSw: [
      "Tumia aina sugu; epuka kupanda kuchelewa wakati wa baridi na unyevu.",
      "Haribu mabaki ya mazao na uzungushe zao kwa msimu mmoja.",
      "Achia nafasi kubwa kati ya mimea ili hewa ipite vizuri.",
    ],
    chemicalEn: [
      "Propiconazole 25 EC or mancozeb at early signs, two sprays 14 days apart.",
    ],
    chemicalSw: [
      "Propiconazole 25 EC au mancozeb mapema, mara mbili kwa tofauti ya siku 14.",
    ],
    baseSeverity: 3,
    spreadRisk: "medium",
    prevalence: 12,
  },
  {
    key: "common_rust_maize",
    crop: "maize",
    type: "disease",
    nameEn: "Common Rust",
    nameSw: "Kutu ya Kawaida ya Mahindi",
    latinName: "Puccinia sorghi",
    descEn:
      "Small cinnamon-brown powdery pustules on both sides of the leaf. Usually manageable, but severe early infection on susceptible hybrids reduces grain fill.",
    descSw:
      "Vidonge vidogo vya unga wa kahawia pande zote mbili za jani. Kwa kawaida hafuatiliwi kirahisi, lakini maambukizi mapema hupunguza mavuno.",
    organicEn: [
      "Plant rust-tolerant hybrids and avoid dense, shaded plots.",
      "Remove and destroy heavily infected lower leaves.",
    ],
    organicSw: [
      "Panda aina zinazostahimili kutu na epuka mashamba yenye kivuli kwingi.",
      "Ondoa na uharibu majani ya chini yaliyoambukizwa vikali.",
    ],
    chemicalEn: [
      "Tebuconazole or mancozeb spray if pustules appear before tasseling.",
    ],
    chemicalSw: [
      "Nyunyizia tebuconazole au mancozeb vidonge vikionekana kabla ya kutoa maua.",
    ],
    baseSeverity: 2,
    spreadRisk: "medium",
    prevalence: 9,
  },
  {
    key: "healthy_maize",
    crop: "maize",
    type: "healthy",
    nameEn: "Healthy Maize Leaf",
    nameSw: "Jani la Mahindi Lililo Mzima",
    descEn:
      "Leaf colour, veins and edges look normal with no lesions, mines or chewing damage. Keep up weekly scouting — especially for fall armyworm in the whorl.",
    descSw:
      "Rangi ya jani, mishipa na ncha zinaonekana kawaida bila michirizi au uharibifu. Endelea kuchunguza kila wiki — hasa vifunjavifunja moyoni.",
    organicEn: [
      "Maintain scouting twice weekly and keep field borders weed-free.",
      "Top-dress on time; well-fed plants tolerate pest pressure better.",
    ],
    organicSw: [
      "Endelea kuchunguza mara mbili kwa wiki na uondoe magugu mpakani.",
      "Tia mbolea ya kuongezeka kwa wakati; mimea yenye lishe hustahimili wadudu vyema.",
    ],
    chemicalEn: ["No chemical action needed.", "Hakuna haja ya dawa."],
    chemicalSw: ["Hakuna haja ya dawa."],
    baseSeverity: 0,
    spreadRisk: "low",
    prevalence: 8,
  },

  // ============ BEANS ============
  {
    key: "bean_fly",
    crop: "beans",
    type: "pest",
    nameEn: "Bean Stem Maggot (Bean Fly)",
    nameSw: "Funza wa Shina la Maharagwe",
    latinName: "Ophiomyia phaseoli",
    descEn:
      "Yellowing, stunted seedlings and swollen, cracked stem bases. Maggots tunnel inside the stem and can kill young plants within days of emergence.",
    descSw:
      "Miche inayonyekeya na kudumaa, na misingi ya mashina iliyovimba na kupasuka. Buu hutoa mashina ndani ya shina na kuua miche ndani ya siku chache.",
    organicEn: [
      "Earth up soil around stems early to encourage adventitious roots.",
      "Mulch thickly to deter egg-laying flies.",
      "Soak seed or drench with neem extract at planting; rotate with cereals.",
    ],
    organicSw: [
      "Funika shina na udongo mapema kuwezesha mizizi mipya.",
      "Tandika vumbo (mulch) nene kuzuia nzi kutaga mayai.",
      "Loweka mbegu au nyunyizia dondoo la mwarobaini wakati wa kupanda; zungusha na nafaka.",
    ],
    chemicalEn: [
      "Seed-dress with Imidacloprid 20 SL before planting.",
      "Drench Thiamethoxam at the stem base if damage appears early.",
    ],
    chemicalSw: [
      "Chovyachovya mbegu na Imidacloprid 20 SL kabla ya kupanda.",
      "Miminia Thiamethoxam msingini mwa shina uharibifu ukionekana mapema.",
    ],
    baseSeverity: 3,
    spreadRisk: "medium",
    prevalence: 18,
  },
  {
    key: "aphids_beans",
    crop: "beans",
    type: "pest",
    nameEn: "Black Bean Aphid",
    nameSw: "Kidukari Mweusi wa Maharagwe",
    latinName: "Aphis fabae",
    descEn:
      "Colonies of black aphids cluster on growing tips and undersides of leaves, curling young growth and spreading bean common mosaic virus as they feed.",
    descSw:
      "Makundi ya vidukari weusi hukusanyika kwenye ncha na nyuma ya majani, wakikunja ukuaji mpya na kueneza virusi vya mosaic wanapolisha.",
    organicEn: [
      "Spray a strong jet of water or 1% soap solution to dislodge colonies.",
      "Encourage ladybirds and lacewings; avoid broad-spectrum sprays.",
      "Apply neem oil to growing tips every 5 days until clear.",
    ],
    organicSw: [
      "Nyunyizia maji kwa nguvu au sabuni 1% kuwaondoa.",
      "Linda wadudu wala vidukari kama vile ladybird; epuka dawa za wigo mpana.",
      "Tumia mafuta ya mwarobaini kwenye ncha za ukuaji kila siku 5.",
    ],
    chemicalEn: [
      "Deltamethrin 2.5 EC or acetamiprid spot-spray on colonies only.",
    ],
    chemicalSw: [
      "Nyunyizia Deltamethrin 2.5 EC au acetamiprid kwenye makundi peke yake.",
    ],
    baseSeverity: 2,
    spreadRisk: "medium",
    prevalence: 12,
  },
  {
    key: "thrips_beans",
    crop: "beans",
    type: "pest",
    nameEn: "Bean Flower Thrips",
    nameSw: "Thrips wa Maua ya Maharagwe",
    latinName: "Megalurothrips sjostedti",
    descEn:
      "Tiny slender insects scraping flowers and young pods, causing flower abortion and rough, russeted pods. Numbers explode in dry spells.",
    descSw:
      "Wadudu wadogo wepesi wanaokwaruza maua na maganda mabichi, na kusababisha maua kuanguka na maganda kuwa mabaya. Huongezeka sana kwa ukame.",
    organicEn: [
      "Spray neem or insecticidal soap at first flowering.",
      "Blue sticky traps between rows to monitor and mass-trap.",
      "Keep the field irrigated during flowering to suppress populations.",
    ],
    organicSw: [
      "Nyunyizia mwarobaini au sabuni ya wadudu maua yanapoanza.",
      "Tega mitego ya bluu yenye gundi kati ya mistari.",
      "Mwagilia shamba wakati wa kuchanua kupunguza idadi yao.",
    ],
    chemicalEn: [
      "Spinosad 480 SC rotating with lambda-cyhalothrin; spray in the evening.",
    ],
    chemicalSw: [
      "Spinosad 480 SC kisha lambda-cyhalothri kwa mzunguko; nyunyizia jioni.",
    ],
    baseSeverity: 3,
    spreadRisk: "medium",
    prevalence: 10,
  },
  {
    key: "angular_leaf_spot",
    crop: "beans",
    type: "disease",
    nameEn: "Angular Leaf Spot",
    nameSw: "Madoa ya Pembe Majanini",
    latinName: "Phaeoisariopsis griseola",
    descEn:
      "Angular grey-brown spots bounded by leaf veins that merge and turn leaves yellow then crispy. Very common in cool, wet bean zones like Kisii and Embu.",
    descSw:
      "Madoa ya pembe ya rangi ya kahawia kando ya mishipa ambayo huunganishwa na kugeuza majani manjano kisha kukauka. Ya kawaida sana maeneo ya baridi na mvua kama Kisii na Embu.",
    organicEn: [
      "Plant certified disease-free seed (much of it is seed-borne).",
      "Avoid working in the field when leaves are wet to limit spread.",
      "Rotate 2–3 seasons away from beans and bury residues.",
    ],
    organicSw: [
      "Panda mbegu safi zilizoidhinishwa (mara nyingi hubebwa na mbegu).",
      "Epuka kufanya kazi shambani majani yanapokuwa mabichi kupunguza kusambaa.",
      "Zungusha mazao misimu 2–3 bila maharagwe na uzike mabaki.",
    ],
    chemicalEn: [
      "Copper oxychloride 50 WP protectant from flowering.",
      "Benomyl or carbendazim for established infections.",
    ],
    chemicalSw: [
      "Copper oxychloride 50 WP kama kinga tangu kuchanua.",
      "Benomyl au carbendazim kwa maambukizi yaliyoshika.",
    ],
    baseSeverity: 3,
    spreadRisk: "medium",
    prevalence: 16,
  },
  {
    key: "bcmv",
    crop: "beans",
    type: "disease",
    nameEn: "Bean Common Mosaic Virus",
    nameSw: "Virusi vya Mosaic ya Maharagwe",
    latinName: "BCMV / BCMNV",
    descEn:
      "Mottled light-and-dark-green mosaic, puckered and twisted leaves and stunted plants, often starting in patches. Carried by aphids and infected seed.",
    descSw:
      "Madoa ya kijani cheupe na cheusi, majani yaliyokunjamana na kupotelea, na mimea iliyodumaa. Huenea kwa vidukari na mbegu zilizoambukizwa.",
    organicEn: [
      "Use certified virus-free seed; rogue out infected plants early.",
      "Control aphid vectors with neem or reflective mulch.",
      "Wash hands/tools after handling infected plants.",
    ],
    organicSw: [
      "Tumia mbegu zilizoidhinishwa zisizo na virusi; ng'oa mimea iliyoambukizwa mapema.",
      "Dhibiti vidukari kwa mwarobaini au vumbo linalonyesha.",
      "Osha mikono na zana baada ya kushika mimea iliyoambukizwa.",
    ],
    chemicalEn: [
      "No direct chemical cure — suppress aphids with acetamiprid if pressure is high.",
    ],
    chemicalSw: [
      "Hakuna dawa ya moja kwa moja — punguza vidukari kwa acetamiprid shinikizo likiwa juu.",
    ],
    baseSeverity: 3,
    spreadRisk: "high",
    prevalence: 13,
  },
  {
    key: "anthracnose_beans",
    crop: "beans",
    type: "disease",
    nameEn: "Bean Anthracnose",
    nameSw: "Anthracnose ya Maharagwe",
    latinName: "Colletotrichum lindemuthianum",
    descEn:
      "Dark sunken lesions on pods with a pinkish centre, plus black vein streaks on leaves. Spreads fast in rainy weather and ruins market quality of pods and grain.",
    descSw:
      "Michirizi meusi iliyochubuka kwenye maganda yenye kiini cha waridi, na migongo myeusi kwenye majani. Huenea haraka kwa mvua na kuharibu ubora wa sokoni.",
    organicEn: [
      "Plant clean certified seed — anthracnose is mostly seed-borne.",
      "Rotate at least 2 seasons and never save seed from infected fields.",
      "Apply copper-based bio-fungicide preventatively in wet periods.",
    ],
    organicSw: [
      "Panda mbegu safi zilizoidhinishwa — ugonjwa huu hubebwa na mbegu.",
      "Zungusha angalau misimu 2 na usitunze mbegu kutoka mashamba yaliyoambukizwa.",
      "Tumia dawa za shaba za kinga wakati wa mvua.",
    ],
    chemicalEn: [
      "Mancozeb 80 WP or chlorothalonil 50 WP every 10–14 days in wet weather.",
    ],
    chemicalSw: [
      "Mancozeb 80 WP au chlorothalonil 50 WP kila siku 10–14 wakati wa mvua.",
    ],
    baseSeverity: 4,
    spreadRisk: "high",
    prevalence: 14,
  },
  {
    key: "bean_rust",
    crop: "beans",
    type: "disease",
    nameEn: "Bean Rust",
    nameSw: "Kutu ya Maharagwe",
    latinName: "Uromyces appendiculatus",
    descEn:
      "Rust-red powdery pustules mostly on the underside of leaves that yellow and drop early. Thrives in humid nights with morning dew.",
    descSw:
      "Vidonge vyeusi vya unga haswa nyuma ya majani, yanayonyekeya na kuanguka mapema. Hustawi kwa unyevu wa usiku na umande wa asubuhi.",
    organicEn: [
      "Space and stake plants for airflow; water at the base, not overhead.",
      "Remove badly infected leaves and destroy them away from the field.",
    ],
    organicSw: [
      "Acha nafasi na funika vizuri ili hewa ipite; mwagilia msingi, si juu ya majani.",
      "Ondoa majani yaliyoambukizwa vikali na uyaruhusie mbali na shamba.",
    ],
    chemicalEn: [
      "Triadimefon or mancozeb sprays at 14-day intervals while pustules spread.",
    ],
    chemicalSw: [
      "Nyunyiza triadimefon au mancozeb kila siku 14 vidonge vinapoenea.",
    ],
    baseSeverity: 2,
    spreadRisk: "medium",
    prevalence: 10,
  },
  {
    key: "healthy_beans",
    crop: "beans",
    type: "healthy",
    nameEn: "Healthy Bean Plant",
    nameSw: "Mmea wa Maharagwe Mzima",
    descEn:
      "Foliage looks clean — no mosaic mottling, pustules or tunnelling. Keep monitoring flower thrips and aphids as flowering starts.",
    descSw:
      "Majani yanaonekana safi — hakuna madoa, vidonge wala mashimo. Endelea kufuatilia thrips na vidukari maua yanapoanza.",
    organicEn: [
      "Scout weekly;keep borders weeded; mulch to conserve moisture.",
      "Use certified seed saved from clean fields.",
    ],
    organicSw: [
      "Chunguza kila wiki; ondoa magugu mpakani; tandika vumbo kuhifadhi unyevu.",
      "Tumia mbegu safi zilizoidhinishwa.",
    ],
    chemicalEn: ["No chemical action needed."],
    chemicalSw: ["Hakuna haja ya dawa."],
    baseSeverity: 0,
    spreadRisk: "low",
    prevalence: 9,
  },

  // ============ TOMATO ============
  {
    key: "tuta_absoluta",
    crop: "tomato",
    type: "pest",
    nameEn: "Tomato Leaf Miner (Tuta absoluta)",
    nameSw: "Mdudu Anayechimba Majani ya Nyanya (Tuta)",
    latinName: "Tuta absoluta ('Phthorimaea absoluta')",
    descEn:
      "Winding white mines inside leaves, dried blotch patches and bored fruits. Kenya's most feared tomato pest — can destroy 100% of an unprotected crop.",
    descSw:
      "Njia nyeupe zinazopinda ndani ya majani, mabaka yaliyokauka na matunda yaliyochimbwa. Ni mdudu anayeogopwa zaidi kwa nyanya Kenya — anaweza kuangamiza mavuno yote bila ulinzi.",
    organicEn: [
      "Use pheromone traps (4–6 per acre) to monitor and mass-trap males.",
      "Remove and burn mined leaves and infested fruits immediately.",
      "Spray neem (azadirachtin) or Bt weekly from transplanting.",
      "Practice strict field hygiene — destroy all crop debris after harvest.",
    ],
    organicSw: [
      "Tumia mitego ya feromon (4–6 kwa ekari) kuangalia na kutega wadume.",
      "Ondoa na uteketeze majani yaliyochimbwa na matunda yaliyoathirika mara moja.",
      "Nyunyizia mwarobaini (azadirachtin) au Bt kila wiki tangu kupandikiza.",
      "Ondoa mabaki yote ya mimea baada ya mavuna.",
    ],
    chemicalEn: [
      "Emamectin benzoate or abamectin at first mines; rotate MoA every 2 sprays.",
      "Chlorantraniliprole + lambda-cyhalothrin premix for heavy outbreaks.",
    ],
    chemicalSw: [
      "Emamectin benzoate au abamectin njia zionekane; badilisha aina ya dawa kila mara 2.",
      "Mchanganyiko wa chlorantraniliprole + lambda-cyhalothrin kwa mlipuko mkubwa.",
    ],
    baseSeverity: 5,
    spreadRisk: "high",
    prevalence: 24,
  },
  {
    key: "african_bollworm",
    crop: "tomato",
    type: "pest",
    nameEn: "African Bollworm",
    nameSw: "Kiwavi Cha Matunda (Bollworm)",
    latinName: "Helicoverpa armigera",
    descEn:
      "Caterpillars bore into green fruits leaving a clean round entry hole with frass; attacked fruits rot and drop. Also feeds on flowers and leaves.",
    descSw:
      "Viwavi huingia ndani ya matunda mabichi ukiondoa tundu safi na kinyesi; matunda huoza na kuanguka. Hula pia maua na majani.",
    organicEn: [
      "Release Trichogramma wasps and spray NPV (Helicoverpa baculovirus).",
      "Hand-pick bored fruits; deep-plough after harvest to expose pupae.",
    ],
    organicSw: [
      "Tia wadudu Trichogramma na nyunyizia NPV (virusi vya baculovirus).",
      "Okota matunda yaliyochimbwa; lima kwa kina baada ya mavuna kufichua pupae.",
    ],
    chemicalEn: [
      "Indoxacarb 15 SC or emamectin benzoate at fruit-set stage.",
    ],
    chemicalSw: [
      "Indoxacarb 15 SC au emamectin benzoate hatua ya matunda kuanza kuundwa.",
    ],
    baseSeverity: 3,
    spreadRisk: "medium",
    prevalence: 10,
  },
  {
    key: "red_spider_mite",
    crop: "tomato",
    type: "pest",
    nameEn: "Red Spider Mite",
    nameSw: "Ubu Mwekundu",
    latinName: "Tetranychus evansi / urticae",
    descEn:
      "Fine stippling that bronzes leaves, silky webbing under leaves, and scorched plants in hot dry weather. Resists many common insecticides.",
    descSw:
      "Madoa madogo yanayogeuzia majani rangi ya shaba, utando mwembamba nyuma ya majani, na mimea iliyochomeka kwa joto na ukame. Hustahimili dawa nyingi.",
    organicEn: [
      "Spray undersides with water + soft soap or sulphur-based bio-acaricide.",
      "Conserve predatory mites (Phytoseiulus); keep plants irrigated.",
    ],
    organicSw: [
      "Nyunyizia nyuma ya majani maji na sabuni laini au dawa ya sulfuri.",
      "Linda mite wanaowawinda; mwagilia mimea mara kwa mara.",
    ],
    chemicalEn: [
      "Abamectin or spiromesifen — true acaricides, not ordinary insecticides.",
    ],
    chemicalSw: [
      "Abamectin au spiromesifen — dawa maalum za mite, si dawa za kawaida za wadudu.",
    ],
    baseSeverity: 3,
    spreadRisk: "high",
    prevalence: 8,
  },
  {
    key: "late_blight_tomato",
    crop: "tomato",
    type: "disease",
    nameEn: "Tomato Late Blight",
    nameSw: "Uoza wa Kuchelewa wa Nyanya",
    latinName: "Phytophthora infestans",
    descEn:
      "Water-soaked grey-green lesions that turn brown-black overnight, white mould on leaf undersides and hard brown rot on fruits. Explodes in cool, wet weather.",
    descSw:
      "Michirizi yenye maji ya kijivu-kijani inayogeuka kahawia-usiku mmoja, ukabu mweupe nyuma ya majani na uoza mwekundu kwenye matunda. Hulipuka kwa baridi na mvua.",
    organicEn: [
      "Remove and bury infected leaves/plants far from the field immediately.",
      "Spray copper-based bio-fungicide (copper hydroxide) preventatively.",
      "Stake and mulch plants; avoid overhead irrigation.",
    ],
    organicSw: [
      "Ondoa na uzike mimea iliyoathirika mbali na shamba mara moja.",
      "Nyunyizia dawa za shaba kama kinga mara kwa mara.",
      "Funika na utandikie vumbo; epuka kumwagilia juu ya majani.",
    ],
    chemicalEn: [
      "Ridomil (metalaxyl + mancozeb) at first sign, repeat every 7–10 days.",
      "Cymoxanil + famoxadone mixes for curative action in wet spells.",
    ],
    chemicalSw: [
      "Ridomil (metalaxyl + mancozeb) kwa ishara za kwanza, rudia kila siku 7–10.",
      "Mchanganyiko wa cymoxanil + famoxadone kwa tiba wakati wa mvua.",
    ],
    baseSeverity: 5,
    spreadRisk: "high",
    prevalence: 18,
  },
  {
    key: "early_blight_tomato",
    crop: "tomato",
    type: "disease",
    nameEn: "Tomato Early Blight",
    nameSw: "Uoza wa Mapema wa Nyanya",
    latinName: "Alternaria solani",
    descEn:
      "Dark brown spots with concentric 'target board' rings on older lower leaves, gradually yellowing upward. Weakens plants and exposes fruits to sunscald.",
    descSw:
      "Madoa meusi yenye duara kama bao la shabaha kwenye majani ya chini, yanayonyekeya juu. Hudhoofisha mmea na kuacha matunda kuchomwa na jua.",
    organicEn: [
      "Mulch to stop soil splash, and remove oldest infected leaves.",
      "Rotate 2–3 seasons away from tomato/potato and stake plants well.",
    ],
    organicSw: [
      "Tandika vumbo kuzuia mud ya udongo, na uondoe majani ya chini yaliyoambukizwa.",
      "Zungusha misimu 2–3 bila nyanya/viazi na ufunike mizuri.",
    ],
    chemicalEn: [
      "Mancozeb or chlorothalonil protectant from the first spot; repeat 10–14 days.",
    ],
    chemicalSw: [
      "Mancozeb au chlorothalonil kama kinga tangu doa la kwanza; rudia siku 10–14.",
    ],
    baseSeverity: 3,
    spreadRisk: "medium",
    prevalence: 14,
  },
  {
    key: "bacterial_wilt_tomato",
    crop: "tomato",
    type: "disease",
    nameEn: "Bacterial Wilt",
    nameSw: "Ugonjwa wa Kunyauka kwa Bakteria",
    latinName: "Ralstonia solanacearum",
    descEn:
      "Sudden wilting of the whole plant while leaves stay green, with brown, bacterial-oozing cut stems. Spreads through soil and water; no cure once inside.",
    descSw:
      "Mmea wote hukauka ghafla huku majani yakibaki kijani, na mashina yaliyokatwa kutoa majimaji ya bakteria. Huenea kwa udongo na maji; hakuna tiba ikishika.",
    organicEn: [
      "Uproot and burn wilted plants — do not compost them.",
      "Rotate 3+ seasons with cereals; avoid moving soil from infected beds.",
      "Plant on raised beds with clean irrigation water.",
    ],
    organicSw: [
      "Ng'oa na uteketeze mimea iliyonyauka — usiweke kwenye samadi.",
      "Zungusha misimu 3+ na nafaka; epuka kuhamisha udongo kutoka vitanda vyenye ugonjwa.",
      "Panda kwenye vitanda vilivyoinuliwa na maji safi ya umwagiliaji.",
    ],
    chemicalEn: [
      "No effective chemical cure — copper drenches only slow spread around the outbreak.",
    ],
    chemicalSw: [
      "Hakuna dawa inayoponya — dawa za shaba hupunguza tu kuenea karibu na mlipuko.",
    ],
    baseSeverity: 5,
    spreadRisk: "high",
    prevalence: 10,
  },
  {
    key: "tylcv",
    crop: "tomato",
    type: "disease",
    nameEn: "Tomato Yellow Leaf Curl Virus",
    nameSw: "Virusi vya Kunyauka kwa Majani ya Nyanya (TYLCV)",
    latinName: "TYLCV (whitefly-borne)",
    descEn:
      "Small, curled, yellowing leaves and severely stunted, bushy plants that drop flowers. Carried plant-to-plant by whiteflies — worst in warm, dry lowland zones.",
    descSw:
      "Majani madogo yaliyokunjika na kugeuka manjano, mimea iliyodumaa na maua kuanguka. Huenezwa na nzi weupe kuhamia kutoka mmea hadi mwingine.",
    organicEn: [
      "Control whiteflies with yellow sticky traps and neem sprays from seedling stage.",
      "Use insect netting in the nursery and rogue out early infected plants.",
      "Plant tolerant varieties where available.",
    ],
    organicSw: [
      "Dhibiti nzi weupe kwa mitego ya njano yenye gundi na mwarobaini tangu miche.",
      "Tumia vyandarua vya wadudu kwenye kitalu na ung'oe mimea iliyoambukizwa mapema.",
      "Panda aina sugu zinapopatikana.",
    ],
    chemicalEn: [
      "Suppress whiteflies with imidacloprid drench at transplanting + acetamiprid sprays.",
    ],
    chemicalSw: [
      "Punguza nzi weupe kwa imidacloprid wakati wa kupandikiza + nyunyiza acetamiprid.",
    ],
    baseSeverity: 4,
    spreadRisk: "high",
    prevalence: 9,
  },
  {
    key: "healthy_tomato",
    crop: "tomato",
    type: "healthy",
    nameEn: "Healthy Tomato Plant",
    nameSw: "Mmea wa Nyanya Mzima",
    descEn:
      "No mines, lesions or wilting detected. Late blight and Tuta absoluta remain the two big threats — keep preventative copper cover in wet weeks.",
    descSw:
      "Hakuna mashimo, michirizi wala kunyauka kulikotambuliwa. Uoza wa kuchelewa na Tuta bado ni vitisho vikuu — endelea na dawa za shaba za kinga wiki za mvua.",
    organicEn: [
      "Weekly scouting for Tuta mines and blight lesions.",
      "Balanced feeding — excess nitrogen invites pests.",
    ],
    organicSw: [
      "Chunguza kila wiki njia za Tuta na michirizi ya uoza.",
      "Lisha mmea kwa usawa — nitrojeni nyingi huvutia wadudu.",
    ],
    chemicalEn: ["No curative chemical needed."],
    chemicalSw: ["Hakuna haja ya dawa ya tiba."],
    baseSeverity: 0,
    spreadRisk: "low",
    prevalence: 7,
  },

  // ============ POTATO ============
  {
    key: "late_blight_potato",
    crop: "potato",
    type: "disease",
    nameEn: "Potato Late Blight",
    nameSw: "Uoza wa Kuchelewa wa Viazi",
    latinName: "Phytophthora infestans",
    descEn:
      "The historic famine disease — dark water-soaked patches spreading from leaf tips, white mildew underneath, and firm brown rot on tubers. Moves through a field in days under misty highland weather.",
    descSw:
      "Ugonjwa wa kihistoria — mabaka meusi yenye maji yanayotoka ncha za majani, ukabu mweupe chini, na uoza wa kahawia kwenye viazi. Huenea shamba zima kwa siku chache kwa hali ya ukungu wa nyanda za juu.",
    organicEn: [
      "Hill soil high to protect tubers; cut and burn infected foliage before lifting.",
      "Use certified seed of tolerant varieties (e.g. Shangi is susceptible — rotate sources).",
      "Spray copper hydroxide / copper oxychloride preventatively in wet weeks.",
    ],
    organicSw: [
      "Zizika viazi kwa kufunika vizuri; kata na uteketeze majani yaliyoambukizwa kabla ya kuvuna.",
      "Tumia mbegu zilizoidhinishwa za aina sugu (Shangi ni rahisi kuambukizwa).",
      "Nyunyizia copper hydroxide / copper oxychloride kama kinga wiki za mvua.",
    ],
    chemicalEn: [
      "Ridomil Gold (metalaxyl + mancozeb) within 48 hours of first lesions.",
      "Alternate with cymoxanil-based curatives to avoid resistance.",
    ],
    chemicalSw: [
      "Ridomil Gold (metalaxyl + mancozeb) ndani ya saa 48 za michirizi ya kwanza.",
      "Badilisha na dawa za cymoxanil ili kuzuia sugu.",
    ],
    baseSeverity: 5,
    spreadRisk: "high",
    prevalence: 30,
  },
  {
    key: "early_blight_potato",
    crop: "potato",
    type: "disease",
    nameEn: "Potato Early Blight",
    nameSw: "Uoza wa Mapema wa Viazi",
    latinName: "Alternaria solani",
    descEn:
      "Concentric brown 'target spot' lesions on older leaves that dry out the canopy early and reduce tuber size — common where plants are under-fertilised.",
    descSw:
      "Michirizi ya kahawia yenye miduara kwenye majani ya zamani inayokauka mmea mapema na kupunguza ukubwa wa viazi — ya kawaida mimea isipopewa mbolea vya kutosha.",
    organicEn: [
      "Keep plants well fed and watered; remove oldest infected leaves.",
      "Rotate 2 seasons away from potato/tomato and bury vines after harvest.",
    ],
    organicSw: [
      "Lisha na kumwagilia mimea vizuri; ondoa majani ya zamani yaliyoambukizwa.",
      "Zungusha misimu 2 bila viazi/nyanya na uzike mabaki baada ya mavuna.",
    ],
    chemicalEn: [
      "Mancozeb or azoxystrobin sprays every 10–14 days from canopy closure.",
    ],
    chemicalSw: [
      "Nyunyiza mancozeb au azoxystrobin kila siku 10–14 tangu majani yajaze shamba.",
    ],
    baseSeverity: 3,
    spreadRisk: "medium",
    prevalence: 12,
  },
  {
    key: "bacterial_wilt_potato",
    crop: "potato",
    type: "disease",
    nameEn: "Potato Bacterial Wilt",
    nameSw: "Kunyauka kwa Bakteria kwa Viazi",
    latinName: "Ralstonia solanacearum (race 3)",
    descEn:
      "Plants wilt in full sun and never recover; cut stems ooze milky bacterial strands and tubers show brown rings that squeeze into rot. Quarantine-level serious for seed potato zones.",
    descSw:
      "Mimea hukauka jua kali bila kupona; mashina yaliyokatwa hutoa nyuzi nyeupe za bakteria na viazi kuonyesha pete za kahawia. Kwa maeneo ya mbegu za viazi ni hatari ya kiwango cha karantini.",
    organicEn: [
      "Do not replant potato in that field for 3 seasons; notify your ward officer.",
      "Uproot wilted plants with surrounding soil and burn them.",
      "Use certified seed only — saved seed is the main carrier.",
    ],
    organicSw: [
      "Usipande viazi tena shamba hilo kwa misimu 3; mjulishe afisa wa kata yako.",
      "Ng'oa mimea iliyonyauka na udongo wa karibu nayo na kuiharibu.",
      "Tumia mbegu zilizoidhinishwa pekee — mbegu zilizohifadhiwa ndizo zinasambaza zaidi.",
    ],
    chemicalEn: [
      "No curative chemical — sanitation and clean certified seed are the only defence.",
    ],
    chemicalSw: [
      "Hakuna dawa ya kuponya — usafi na mbegu safi zilizoidhinishwa ndizo ulinzi pekee.",
    ],
    baseSeverity: 5,
    spreadRisk: "high",
    prevalence: 14,
  },
  {
    key: "potato_tuber_moth",
    crop: "potato",
    type: "pest",
    nameEn: "Potato Tuber Moth",
    nameSw: "Nondo wa Viazi",
    latinName: "Phthorimaea operculella",
    descEn:
      "Silvery-windowed leaf mines and tunnelled tubers spoiled by larvae and frass — the main storage pest of ware potato in Kenya. Attack starts where tubers are exposed at hill cracks.",
    descSw:
      "Michimbo ya madirisha majanini na viazi vilivyochimbwa na buu na kinyesi — mdudu mkuu wa ghala la viazi Kenya. Shambulio huanzia viazi vinapoonekana kwenye migawanyiko ya mizizi.",
    organicEn: [
      "Hill up well and earth cracks closed so tubers are never exposed.",
      "Apply Bt or granulovirus on foliage; harvest promptly and cure tubers.",
      "Store with dried lantana or eucalyptus leaves as a local repellent.",
    ],
    organicSw: [
      "Funika vizuri na ufunge nyufa za udongo ili viazi visionekane.",
      "Tumia Bt au granulovirus kwenye majani; vuna haraka na utibu viazi kabla ya kuhifadhi.",
      "Hifadhi na majani makavu ya lantana au eucalyptus kama kirepelli cha kiasili.",
    ],
    chemicalEn: [
      "Deltamethrin on foliage at first moth flight; treat stores with pirimiphos-methyl.",
    ],
    chemicalSw: [
      "Deltamethrin kwenye majani nondo anapoanza; tibu ghala na pirimiphos-methyl.",
    ],
    baseSeverity: 3,
    spreadRisk: "medium",
    prevalence: 16,
  },
  {
    key: "healthy_potato",
    crop: "potato",
    type: "healthy",
    nameEn: "Healthy Potato Crop",
    nameSw: "Shamba la Viazi Lililo Mzima",
    descEn:
      "No blight lesions, wilting or mines detected. In misty highland weather, keep a protective copper or mancozeb cover against late blight.",
    descSw:
      "Hakuna michirizi ya uoza, kunyauka wala michimbo kulikotambuliwa. Kwa hali ya ukungu, endelea na dawa za kinga za shaba au mancozeb dhidi ya uoza wa kuchelewa.",
    organicEn: [
      "Scout leaf undersides weekly for early blight mildew.",
      "Hill up twice to protect tubers from moth and greening.",
    ],
    organicSw: [
      "Chunguza nyuma ya majani kila wiki kutafuta ukungu wa mapema.",
      "Funika mara mbili kulinda viazi dhidi ya nondo na kugeuka kijani.",
    ],
    chemicalEn: ["No curative chemical needed."],
    chemicalSw: ["Hakuna haja ya dawa ya tiba."],
    baseSeverity: 0,
    spreadRisk: "low",
    prevalence: 8,
  },

  // ============ CASSAVA ============
  {
    key: "cassava_mosaic",
    crop: "cassava",
    type: "disease",
    nameEn: "Cassava Mosaic Disease",
    nameSw: "Ugonjwa wa Mosaic wa Mihogo",
    latinName: "African cassava mosaic virus",
    descEn:
      "Yellow-and-green mosaic blotching with twisted, reduced leaf blades and stunted plants. Carried by whiteflies and infected cuttings — cuts root yields by up to 40%.",
    descSw:
      "Mabaka ya kijani na manjano na mabaka ya majani yaliyokunjika, mimea iliyodumaa. Huenezwa na nzi weupe na vipande vilivyoambukizwa — hupunguza mavuno hadi 40%.",
    organicEn: [
      "Plant clean, certified mosaic-free cuttings of tolerant varieties.",
      "Rogue and burn infected plants within the first 3 months.",
      "Control whiteflies and avoid planting near old infected fields.",
    ],
    organicSw: [
      "Panda vipande safi vilivyoidhinishwa vya aina sugu.",
      "Ng'oa na uteketeze mimea iliyoambukizwa ndani ya miezi 3 ya kwanza.",
      "Dhibiti nzi weupe na epuka kupanda karibu na mashamba mabovu.",
    ],
    chemicalEn: [
      "No chemical cure for the virus — suppress whiteflies with acetamiprid if needed.",
    ],
    chemicalSw: [
      "Hakuna dawa ya virusi — punguza nzi weupe kwa acetamiprid ikihitajika.",
    ],
    baseSeverity: 4,
    spreadRisk: "high",
    prevalence: 24,
  },
  {
    key: "cassava_brown_streak",
    crop: "cassava",
    type: "disease",
    nameEn: "Cassava Brown Streak Disease (CBSD)",
    nameSw: "Ugonjwa wa Mistari ya Kahawia (CBSD)",
    latinName: "Cassava brown streak viruses (UCBSV/CBSV)",
    descEn:
      "Yellow blotches along leaf veins, brown stem streaks and hard necrotic rot inside the roots — often invisible until harvest. Spreading up the coast and western corridor.",
    descSw:
      "Mabaka ya manjano kando ya mishipa, mistari ya kahawia kwenye shina na uoza mgumu ndani ya mizizi — mara nyingi huezekana hadi wakati wa kuvuna. Huenea pwani na magharibi.",
    organicEn: [
      "Use CBSD-free cuttings of tolerant varieties (contact KALRO/CEFORD lists).",
      "Uproot plants showing stem streaks; sample roots before sharing cuttings.",
      "Report suspect cases — CBSD is a regulated quarantine threat.",
    ],
    organicSw: [
      "Tumia vipande visivyo na CBSD vya aina sugu (angalia orodha za KALRO).",
      "Ng'oa mimea yenye mistari ya kahawia; angalia mizizi kabla ya kusambaza vipande.",
      "Ripoti kesi zinazoshukiwa — CBSD ni hatari ya kiwango cha karantini.",
    ],
    chemicalEn: [
      "No chemical control — clean planting material and resistant varieties only.",
    ],
    chemicalSw: [
      "Hakuna dawa — vipande safi na aina sugu pekee ndizo suluhisho.",
    ],
    baseSeverity: 5,
    spreadRisk: "high",
    prevalence: 18,
  },
  {
    key: "cassava_bacterial_blight",
    crop: "cassava",
    type: "disease",
    nameEn: "Cassava Bacterial Blight",
    nameSw: "Uogonjwa wa Bakteria wa Mihogo",
    latinName: "Xanthomonas axonopodis pv. manihotis",
    descEn:
      "Angular water-soaked leaf spots that blight and wilt whole shoots, with gummy ooze on stems. Spread by wind-driven rain and contaminated tools.",
    descSw:
      "Madoa ya pembe yenye maji yanayochafulia na kukauka matawi yote, na utomvu kwenye mashina. Huenezwa na mvua yenye upepo na zana zilizochafukana.",
    organicEn: [
      "Prune and burn blighted shoots; disinfect tools between plants.",
      "Use tolerant varieties and plant cuttings from disease-free fields.",
    ],
    organicSw: [
      "Tayarisha na uteketeze matawi yaliyoambukizwa; safisha zana kati ya mimea.",
      "Tumia aina sugu na vipande kutoka mashamba yasiyo na ugonjwa.",
    ],
    chemicalEn: [
      "Copper-based bactericide sprays can slow spread during rainy spells.",
    ],
    chemicalSw: [
      "Nyunyiza dawa za shaba kupunguza kuenea wakati wa mvua.",
    ],
    baseSeverity: 4,
    spreadRisk: "high",
    prevalence: 10,
  },
  {
    key: "cassava_mealybug",
    crop: "cassava",
    type: "pest",
    nameEn: "Cassava Mealybug",
    nameSw: "Mdudu Mweupe wa Mihogo",
    latinName: "Phenacoccus manihoti",
    descEn:
      "White waxy colonies on shoot tips that curl leaves, stunt shoots and excrete honeydew with sooty mould. Worst in dry spells; spread on cuttings.",
    descSw:
      "Makundi meupe ya uta kwenye ncha za matawi yanayokunja majani na kudumaza ukuaji, yakitoonga asali yenye ukungu mweusi. Mbaya zaidi kwa ukame; huenea kwa vipande.",
    organicEn: [
      "Release or conserve Anagyrus lopezi parasitoid wasps (biocontrol classic).",
      "Spot-spray soapy water or neem on colonies; avoid killing natural enemies.",
      "Use clean cuttings — mealybugs hitchhike on stems.",
    ],
    organicSw: [
      "Tia au linda wadudu wanaomeza (Anagyrus lopezi) — mfano maarufu wa udhibiti wa kibiolojia.",
      "Nyunyizia maji ya sabuni au mwarobaini kwenye makundi; epuka kuua adui wa asili.",
      "Tumia vipande safi — wadudu havanana kwenye mashina.",
    ],
    chemicalEn: [
      "Imidacloprid drench only for severe, isolated cases — protect biocontrol agents.",
    ],
    chemicalSw: [
      "Imidacloprid kwa kesi kali tu — linda wadudu wa kudhibiti kibiolojia.",
    ],
    baseSeverity: 3,
    spreadRisk: "medium",
    prevalence: 14,
  },
  {
    key: "cassava_green_mite",
    crop: "cassava",
    type: "pest",
    nameEn: "Cassava Green Mite",
    nameSw: "Ubu wa Kijani wa Mihogo",
    latinName: "Mononychellus tanajoa",
    descEn:
      "Tiny mites on young leaves that bleach and deform new growth, leaving shoots bare like a 'candlestick'. Peak damage in the long dry season.",
    descSw:
      "Ubu wadogo kwenye majani machanga wanaofifia na kupotosha ukuaji mpya, na kuacha matawi kama 'mshumaa'. Uharibifu mkubwa zaidi kwa msimu mrefu wa ukame.",
    organicEn: [
      "Plant mite-tolerant varieties; intercrop to shade and conserve predators.",
      "Irrigate where possible — dusty, dry plants suffer most.",
    ],
    organicSw: [
      "Panda aina zinazostahimili ubu; changanya mazao ili kuvusha kivuli na kulinda wadudu wanawinda.",
      "Mwagilia panapowezekana — mimea miwili na vumbi ndiyo huteseka zaidi.",
    ],
    chemicalEn: [
      "Abamectin (acaricide) for nursery and young plants under pressure.",
    ],
    chemicalSw: [
      "Abamectin (dawa ya ubu) kwa vitalu na mimea michanga inayoshinikizwa.",
    ],
    baseSeverity: 3,
    spreadRisk: "medium",
    prevalence: 12,
  },
  {
    key: "healthy_cassava",
    crop: "cassava",
    type: "healthy",
    nameEn: "Healthy Cassava",
    nameSw: "Mihogo Mzima",
    descEn:
      "Clean blade shape and colour — no mosaic blotching, streaks or wax colonies. Always source cuttings from certified clean fields before next planting.",
    descSw:
      "Umbo na rangi ya jani safi — hakuna mosaic, mistari wala makundi ya uta. Hakikisha unapata vipande kutoka mashamba safi kabla ya kupanda kijacho.",
    organicEn: [
      "Mark the healthiest plants as your next cutting source.",
      "Scout monthly for whitefly — the vector moving viruses around.",
    ],
    organicSw: [
      "Weka alama mimea yenye afya kama chanzo cha vipande vijacho.",
      "Chunguza kila mwezi nzi weupe — wasambazaji wa virusi.",
    ],
    chemicalEn: ["No chemical action needed."],
    chemicalSw: ["Hakuna haja ya dawa."],
    baseSeverity: 0,
    spreadRisk: "low",
    prevalence: 10,
  },
];

/* ------------------------------------------------------------------ */
/* Demo sample images (bundled)                                        */
/* ------------------------------------------------------------------ */

export interface SampleImage {
  src: string;
  crop: CropKey;
  forceKey: string;
  labelEn: string;
  labelSw: string;
}

export const SAMPLES: SampleImage[] = [
  {
    src: "/images/sample-fall-armyworm.jpg",
    crop: "maize",
    forceKey: "fall_armyworm",
    labelEn: "Fall armyworm on maize",
    labelSw: "Vifunjavifunja kwenye mahindi",
  },
  {
    src: "/images/sample-late-blight.jpg",
    crop: "potato",
    forceKey: "late_blight_potato",
    labelEn: "Late blight on potato",
    labelSw: "Uoza wa kuchelewa kwenye viazi",
  },
  {
    src: "/images/sample-cassava-mosaic.jpg",
    crop: "cassava",
    forceKey: "cassava_mosaic",
    labelEn: "Cassava mosaic",
    labelSw: "Mosaic ya mihogo",
  },
  {
    src: "/images/sample-tuta.jpg",
    crop: "tomato",
    forceKey: "tuta_absoluta",
    labelEn: "Tuta absoluta mines",
    labelSw: "Michimbo ya Tuta",
  },
];

/* ------------------------------------------------------------------ */
/* Diagnosis engine                                                    */
/* ------------------------------------------------------------------ */

export interface DiagnosisAlternative {
  key: string;
  nameEn: string;
  nameSw: string;
  confidence: number;
}

export interface Diagnosis {
  key: string;
  crop: CropKey;
  type: ThreatType;
  nameEn: string;
  nameSw: string;
  latinName?: string;
  descEn: string;
  descSw: string;
  organicEn: string[];
  organicSw: string[];
  chemicalEn: string[];
  chemicalSw: string[];
  confidence: number;
  severity: number;
  spreadRisk: SpreadRisk;
  alternatives: DiagnosisAlternative[];
}

function segmentInt(hex: string, start: number, len: number): number {
  return parseInt(hex.slice(start, start + len), 16) || 0;
}

const byKey = new Map(THREATS.map((t) => [t.key, t]));

export function getThreat(key: string): Threat | undefined {
  return byKey.get(key);
}

export function threatsForCrop(crop: CropKey): Threat[] {
  return THREATS.filter((t) => t.crop === crop);
}

export const THREAT_COUNTS = {
  diseases: THREATS.filter((t) => t.type === "disease").length,
  pests: THREATS.filter((t) => t.type === "pest").length,
  total: THREATS.filter((t) => t.type !== "healthy").length,
};

/**
 * Deterministic "inference": derive a stable pseudo-inference from image bytes.
 * The first hash bytes choose the class (weighted by prevalence), later bytes
 * jitter confidence/severity so the same image always yields the same result.
 */
export function diagnoseFromHash(hashHex: string, crop: CropKey, forceKey?: string): Diagnosis {
  const pool = threatsForCrop(crop);

  let primary: Threat | undefined;
  if (forceKey) {
    primary = byKey.get(forceKey);
  }
  if (!primary || primary.crop !== crop) {
    const totalW = pool.reduce((sum, t) => sum + t.prevalence, 0);
    let r = segmentInt(hashHex, 0, 8) % totalW;
    primary = pool[0];
    for (const t of pool) {
      if (r < t.prevalence) {
        primary = t;
        break;
      }
      r -= t.prevalence;
    }
  }

  const p = primary!;
  const healthy = p.type === "healthy";

  // Confidence: 71–98 for real findings, 79–97 for healthy reads
  const confBase = segmentInt(hashHex, 8, 4);
  const confidence = healthy ? 79 + (confBase % 19) : 71 + (confBase % 28);

  const severity = healthy ? 0 : p.baseSeverity;

  // Alternatives: next two most likely classes, excluding the primary
  const others = pool
    .filter((t) => t.key !== p.key)
    .sort((a, b) => b.prevalence - a.prevalence)
    .slice(0, 2);

  const alternatives: DiagnosisAlternative[] = others.map((t, i) => ({
    key: t.key,
    nameEn: t.nameEn,
    nameSw: t.nameSw,
    confidence: Math.max(12, confidence - 13 - i * 9 - (segmentInt(hashHex, 16 + i * 2, 2) % 5)),
  }));

  return {
    key: p.key,
    crop,
    type: p.type,
    nameEn: p.nameEn,
    nameSw: p.nameSw,
    latinName: p.latinName,
    descEn: p.descEn,
    descSw: p.descSw,
    organicEn: p.organicEn,
    organicSw: p.organicSw,
    chemicalEn: p.chemicalEn,
    chemicalSw: p.chemicalSw,
    confidence,
    severity,
    spreadRisk: p.spreadRisk,
    alternatives,
  };
}
