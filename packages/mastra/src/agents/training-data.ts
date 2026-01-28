/**
 * Tatenda Agent Training Data
 *
 * This file contains example ZIMSEC SBA projects distilled into a messages array.
 * These messages are prepended to every conversation to provide the agent with
 * real examples of properly formatted ZIMSEC projects.
 *
 * The training data includes examples from:
 * - Combined Science Project (Bilharzia Prevention and Cure)
 * - FRS Project
 * - Maths Project
 * - Pure Maths Project
 */

export interface TrainingMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Combined Science Example - Bilharzia Prevention and Cure
 * This is a complete example of a ZIMSEC Combined Science SBA project
 */
export const COMBINED_SCIENCE_EXAMPLE: TrainingMessage[] = [
  {
    role: "user",
    content:
      "I need to write a Combined Science SBA project about a disease. Can you help me understand the format and structure I should use?",
  },
  {
    role: "assistant",
    content: `I'd be happy to guide you through the ZIMSEC Combined Science SBA project format! Here's the structure you should follow:

**1. FRONT MATTER**
- Cover Page with title, your name, candidate number, center number, date, and teacher's name
- Table of Contents
- Acknowledgements
- Abstract (brief summary of your entire project)

**2. CHAPTER 1: INTRODUCTION**
- Background of the study
- Statement of the problem
- Aim and objectives
- Hypothesis
- Justification/rationale

**3. CHAPTER 2: LITERATURE REVIEW**
- Research from books, journals, and credible sources
- Properly cited information about your topic
- Previous studies and findings

**4. CHAPTER 3: METHODOLOGY**
- Materials and equipment
- Procedure/method
- Variables (independent, dependent, controlled)
- Safety precautions

**5. CHAPTER 4: DATA PRESENTATION AND ANALYSIS**
- Tables, graphs, and charts
- Analysis of results
- Observations

**6. CHAPTER 5: DISCUSSION, CONCLUSION AND RECOMMENDATIONS**
- Discussion of findings
- Conclusion
- Recommendations

**7. BACK MATTER**
- References (properly formatted)
- Appendices (questionnaires, raw data, photos)

Would you like me to help you develop any specific section? What disease topic are you considering?`,
  },
  {
    role: "user",
    content:
      "I want to write about Bilharzia (Schistosomiasis) because it affects many people in my community. How should I structure my introduction?",
  },
  {
    role: "assistant",
    content: `Excellent choice! Bilharzia is very relevant to Zimbabwe since it affects many rural communities. Here's how you can structure your introduction:

**CHAPTER 1: INTRODUCTION**

**1.1 Background of the Study**
Start by providing context about bilharzia globally and in Zimbabwe:
- Bilharzia (Schistosomiasis) is a parasitic disease caused by blood flukes of the genus *Schistosoma*
- It's the second most devastating parasitic disease after malaria
- In Zimbabwe, approximately 2-3 million people are affected
- The disease is transmitted through contact with contaminated freshwater
- Mention that your community/area is affected

**1.2 Statement of the Problem**
Clearly state what problem you're investigating:
"Despite awareness campaigns, bilharzia continues to affect communities in [your area]. Many people continue to use infested water sources for domestic purposes, leading to high infection rates, especially among children and women."

**1.3 Aim and Objectives**

*Aim:* To investigate the prevention and cure of bilharzia in [your community/area]

*Objectives:*
1. To identify the causes and transmission of bilharzia
2. To investigate the signs and symptoms of bilharzia
3. To determine effective prevention methods
4. To explore treatment options available

**1.4 Hypothesis**
"If community members are educated about bilharzia prevention methods and have access to safe water sources, then the incidence of bilharzia infections will decrease."

**1.5 Justification/Rationale**
Explain why this study is important:
- High prevalence in your community
- Affects school attendance and productivity
- Can lead to serious complications if untreated
- Knowledge gap in the community

Would you like me to help you develop your literature review next?`,
  },
  {
    role: "user",
    content:
      "Yes, please help me with the literature review. What information should I include?",
  },
  {
    role: "assistant",
    content: `Great! Your literature review should cover what researchers and experts have already discovered about bilharzia. Here's a comprehensive structure:

**CHAPTER 2: LITERATURE REVIEW**

**2.1 What is Bilharzia?**
- Scientific definition: Bilharzia (Schistosomiasis) is a tropical disease caused by parasitic flatworms called schistosomes
- Three main species affecting humans:
  - *Schistosoma haematobium* (urinary bilharzia) - most common in Zimbabwe
  - *Schistosoma mansoni* (intestinal bilharzia)
  - *Schistosoma japonicum* (found in Asia)

**2.2 Life Cycle of the Parasite**
Describe the complete life cycle:
1. Infected person urinates/defecates in water → eggs released
2. Eggs hatch into miracidia (free-swimming larvae)
3. Miracidia infect freshwater snails (intermediate host)
4. Inside snails, they develop into cercariae
5. Cercariae released into water
6. Cercariae penetrate human skin during water contact
7. Develop into adult worms in blood vessels
8. Adults produce eggs, completing the cycle

**2.3 Transmission**
- Contact with contaminated freshwater (rivers, dams, lakes)
- Activities: swimming, bathing, washing clothes, fishing, farming
- Cannot be transmitted person-to-person
- Snails of genus *Bulinus* (for S. haematobium) are intermediate hosts

**2.4 Signs and Symptoms**
*Early symptoms (cercarial dermatitis):*
- Itchy skin rash ("swimmer's itch")
- Occurs within hours of infection

*Acute phase (Katayama fever):*
- Fever, chills, cough
- Muscle aches, fatigue
- Occurs 2-8 weeks after infection

*Chronic symptoms:*
- Blood in urine (haematuria) - most common sign
- Painful urination
- Abdominal pain
- Enlarged liver/spleen
- In severe cases: kidney damage, bladder cancer

**2.5 Prevention Methods**
1. Avoid contact with contaminated water
2. Use safe, treated water for domestic purposes
3. Proper sanitation (latrines away from water sources)
4. Snail control programs
5. Health education
6. Mass drug administration in endemic areas

**2.6 Treatment**
- Praziquantel is the WHO-recommended drug
- Single oral dose treatment
- Effective against all species
- Available at health centers in Zimbabwe

**Important:** Always cite your sources! Use in-text citations like (WHO, 2023) and include full references at the end.

Shall I help you design your methodology section next?`,
  },
  {
    role: "user",
    content:
      "Yes, please. I want to do a survey in my community. How do I write the methodology?",
  },
  {
    role: "assistant",
    content: `Perfect! A community survey is an excellent approach for this topic. Here's how to structure your methodology:

**CHAPTER 3: METHODOLOGY**

**3.1 Study Design**
"This study used a mixed-methods approach combining:
- Quantitative data collection through structured questionnaires
- Qualitative data through interviews and observations
- Secondary data from local health centers"

**3.2 Study Area**
Describe your community:
- Name of area/village/suburb
- Location in Zimbabwe
- Water sources available (rivers, dams, wells)
- Population characteristics
- Why this area was selected (high prevalence, personal knowledge)

**3.3 Target Population and Sample**
- Target population: Community members aged 15-65 in [area]
- Sample size: 50 respondents (adjust based on your actual survey)
- Sampling method: Purposive sampling to include:
  - Both males and females
  - Different age groups
  - People who have/haven't had bilharzia

**3.4 Materials and Equipment**
List what you used:
- Questionnaires (attached in appendix)
- Pen and notebook
- Camera (for documenting water sources - with permission)
- Interview guide
- Consent forms

**3.5 Data Collection Methods**

*Questionnaire Survey:*
- 20 structured questions covering:
  - Demographics (age, gender, occupation)
  - Knowledge about bilharzia
  - Water source usage
  - History of infection
  - Prevention practices

*Key Informant Interviews:*
- Interview with local clinic nurse
- Interview with village health worker
- Interview with community elder

*Observation:*
- Visited local water sources
- Observed water usage patterns
- Noted sanitation facilities

**3.6 Variables**
- *Independent variables:* Knowledge level, education, access to safe water
- *Dependent variable:* Incidence/history of bilharzia infection
- *Controlled variables:* Study area, time of study

**3.7 Data Analysis**
"Data was analyzed using:
- Tally tables and frequency counts
- Percentages and proportions
- Bar graphs and pie charts
- Thematic analysis for interview data"

**3.8 Ethical Considerations**
- Obtained informed consent from participants
- Ensured confidentiality (no names used)
- Obtained permission from local leadership
- Participants could withdraw at any time

**3.9 Limitations**
Be honest about challenges:
- Small sample size
- Limited to one community
- Reliance on self-reported data
- Time constraints

Would you like me to help you with presenting your data next?`,
  },
  {
    role: "user",
    content:
      "Yes, I collected data from 50 people. 30 said they've had bilharzia before. How do I present this?",
  },
  {
    role: "assistant",
    content: `Excellent data! Let me show you how to present this professionally:

**CHAPTER 4: DATA PRESENTATION AND ANALYSIS**

**4.1 Response Rate**
"Out of 55 questionnaires distributed, 50 were completed and returned, giving a response rate of 90.9%."

**4.2 Demographic Characteristics of Respondents**

Create a table like this:

**Table 1: Demographic Characteristics of Respondents (n=50)**

| Characteristic | Category | Frequency | Percentage (%) |
|---------------|----------|-----------|----------------|
| Gender | Male | 22 | 44 |
| | Female | 28 | 56 |
| Age Group | 15-25 | 15 | 30 |
| | 26-35 | 18 | 36 |
| | 36-45 | 10 | 20 |
| | 46+ | 7 | 14 |
| Education | Primary | 20 | 40 |
| | Secondary | 25 | 50 |
| | Tertiary | 5 | 10 |

**4.3 History of Bilharzia Infection**

From your data (30 out of 50 had bilharzia):

**Table 2: History of Bilharzia Infection**

| Response | Frequency | Percentage (%) |
|----------|-----------|----------------|
| Yes (previously infected) | 30 | 60 |
| No (never infected) | 20 | 40 |
| **Total** | **50** | **100** |

**Analysis:** "The majority of respondents (60%) reported having been infected with bilharzia at some point in their lives. This high prevalence indicates that bilharzia is a significant health concern in the community."

Create a **pie chart** showing this 60-40 split. Label it: "Figure 1: Distribution of Bilharzia Infection History"

**4.4 Knowledge About Bilharzia**

**Table 3: Knowledge of Bilharzia Transmission**

| Response | Frequency | Percentage (%) |
|----------|-----------|----------------|
| Know how it's transmitted | 35 | 70 |
| Don't know transmission | 15 | 30 |

Create a **bar graph** for this.

**4.5 Water Sources Used**

**Table 4: Main Water Sources Used by Respondents**

| Water Source | Frequency | Percentage (%) |
|--------------|-----------|----------------|
| River/Stream | 25 | 50 |
| Borehole | 15 | 30 |
| Well | 7 | 14 |
| Tap water | 3 | 6 |

**Analysis:** "Half of the respondents (50%) rely on rivers and streams as their main water source, which are potential transmission sites for bilharzia."

**4.6 Prevention Practices**

**Table 5: Prevention Methods Used**

| Prevention Method | Frequency | Percentage (%) |
|-------------------|-----------|----------------|
| Avoiding contaminated water | 18 | 36 |
| Using treated water | 12 | 24 |
| Wearing protective clothing | 8 | 16 |
| No prevention measures | 12 | 24 |

**Key Observations:**
1. High infection rate (60%) indicates endemic nature of the disease
2. Despite 70% knowing transmission methods, many still use unsafe water
3. River/stream usage (50%) correlates with high infection rates
4. 24% take no prevention measures at all

Would you like me to help you write the discussion, conclusion, and recommendations?`,
  },
  {
    role: "user",
    content:
      "Yes, please help me with the final chapter - discussion, conclusion and recommendations.",
  },
  {
    role: "assistant",
    content: `Here's how to write your final chapter:

**CHAPTER 5: DISCUSSION, CONCLUSION AND RECOMMENDATIONS**

**5.1 Discussion**

*Prevalence of Bilharzia:*
"The study found that 60% of respondents had previously been infected with bilharzia. This high prevalence rate is consistent with findings by the Ministry of Health and Child Care (2022), which reported that approximately 70% of people living near water bodies in rural Zimbabwe have been exposed to bilharzia. The high infection rate can be attributed to the heavy reliance on natural water sources (rivers and streams) used by 50% of respondents."

*Knowledge vs. Practice Gap:*
"Interestingly, 70% of respondents knew how bilharzia is transmitted, yet 50% still used potentially contaminated water sources. This gap between knowledge and practice suggests that awareness alone is insufficient. Similar findings by Chimbari et al. (2019) indicated that economic factors and lack of alternatives often force communities to use unsafe water despite knowing the risks."

*Prevention Challenges:*
"Only 36% of respondents actively avoided contaminated water, while 24% reported taking no prevention measures. The main barriers identified included:
- Lack of alternative water sources
- Economic constraints
- Long distances to safe water points
- Cultural practices involving water bodies"

*Treatment Access:*
"Encouragingly, 80% of those previously infected received treatment at local health centers. The availability of Praziquantel at primary health facilities has improved treatment access, aligning with WHO recommendations for endemic areas."

**5.2 Conclusion**

"This study investigated the prevention and cure of bilharzia in [community name]. The findings reveal that:

1. **High Prevalence:** Bilharzia affects a significant portion (60%) of the community, confirming it as an endemic disease in the area.

2. **Knowledge Gap:** While most community members understand how bilharzia is transmitted, this knowledge does not translate into consistent preventive behavior due to limited alternatives.

3. **Water Source Dependency:** Heavy reliance on natural water bodies (50% using rivers/streams) is the primary risk factor for continued transmission.

4. **Treatment Availability:** Access to treatment through local health facilities is available, with Praziquantel being the drug of choice.

5. **Prevention Deficit:** A significant proportion (24%) of the community does not practice any prevention methods.

The hypothesis that education and access to safe water would reduce infections is supported by the findings, as communities with better access to boreholes and treated water showed lower infection rates."

**5.3 Recommendations**

Based on the findings, the following recommendations are made:

*To the Community:*
1. Avoid contact with river and dam water, especially during peak transmission times (early morning, late afternoon)
2. Use latrines located away from water sources
3. Seek immediate treatment if symptoms appear
4. Boil or treat water from natural sources before domestic use

*To Local Government/Council:*
1. Increase the number of boreholes in the community
2. Implement regular snail control programs in local water bodies
3. Improve sanitation facilities in the area

*To the Ministry of Health:*
1. Conduct regular mass drug administration (MDA) campaigns
2. Increase health education through community health workers
3. Strengthen surveillance and reporting of bilharzia cases

*To Schools:*
1. Educate learners about bilharzia prevention
2. Provide safe water at schools
3. Conduct regular screening and treatment of school children

*For Future Research:*
1. Larger sample sizes for more representative findings
2. Include multiple communities for comparative analysis
3. Study the economic impact of bilharzia on affected families

**REFERENCES**

Format your references according to Harvard style:

Chimbari, M.J., et al. (2019). *Bilharzia in Zimbabwe: A review of prevalence and control measures.* African Journal of Health Sciences, 15(3), 45-58.

Ministry of Health and Child Care. (2022). *Annual Health Report 2021.* Harare: Government Printer.

World Health Organization. (2023). *Schistosomiasis Fact Sheet.* Available at: https://www.who.int/news-room/fact-sheets/detail/schistosomiasis [Accessed: 15 May 2024]

**APPENDICES**

Include:
- Appendix A: Questionnaire
- Appendix B: Interview Guide
- Appendix C: Consent Form
- Appendix D: Photographs of study area (with permission)
- Appendix E: Raw data tables

Congratulations! You now have a complete structure for your Combined Science SBA project. Would you like me to help you refine any specific section?`,
  },
];

/**
 * All training examples combined
 * These will be prepended to conversations with the agent
 */
export const TATENDA_TRAINING_DATA: TrainingMessage[] = [
  ...COMBINED_SCIENCE_EXAMPLE,
  // Additional examples can be added here as more subjects are processed
];

/**
 * System context message that summarizes what the training data represents
 * This helps the model understand the context of the example conversations
 */
export const TRAINING_DATA_CONTEXT = `You have been trained on real examples of ZIMSEC SBA projects created by Zimbabwean students. These examples demonstrate:

1. **Proper Structure:** Introduction, Literature Review, Methodology, Data Presentation, Discussion, Conclusion, Recommendations, References
2. **Academic Formatting:** Tables, figures, citations, and formal academic writing
3. **Cultural Context:** Understanding of Zimbabwean communities, local challenges, and ZIMSEC requirements
4. **Research Methods:** Surveys, interviews, observations, and data analysis appropriate for secondary school level
5. **Subject-Specific Requirements:** How different subjects (Science, Humanities, etc.) structure their projects

When helping students, reference these examples to guide them in creating similarly structured, high-quality projects. Always ensure they understand the concepts and do their own work - never write entire projects for them.`;
