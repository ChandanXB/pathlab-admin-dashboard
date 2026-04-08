export interface Vaccine {
    name: string;
    description: string;
    dosage: string;
    status: 'critical' | 'upcoming';
}

export interface ImmunizationPeriod {
    age: string;
    color: string;
    vaccines: Vaccine[];
}

export const CHILD_IMMUNIZATION_SCHEDULE: ImmunizationPeriod[] = [
    {
        age: 'Birth',
        color: '#f472b6',
        vaccines: [
            { name: 'BCG', description: 'Bacillus Calmette Guerin - Protects against Tuberculosis.', dosage: 'Single dose', status: 'critical' },
            { name: 'OPV-0', description: 'Oral Polio Vaccine - Initial dose for Polio protection.', dosage: 'Single dose', status: 'critical' },
            { name: 'Hepatitis B', description: 'Hepatitis B birth dose - Prevents liver infection.', dosage: 'Single dose', status: 'critical' }
        ]
    },
    {
        age: '6 Weeks',
        color: '#60a5fa',
        vaccines: [
            { name: 'OPV-1', description: 'First regular dose of Oral Polio Vaccine.', dosage: 'Dose 1', status: 'upcoming' },
            { name: 'Pentavalent-1', description: 'Protects against 5 diseases (DPT, HepB, Hib).', dosage: 'Dose 1', status: 'upcoming' },
            { name: 'RVV-1', description: 'Rotavirus Vaccine - Protects against severe diarrhea.', dosage: 'Dose 1', status: 'upcoming' },
            { name: 'fIPV-1', description: 'Fractional dose of Inactivated Polio Vaccine.', dosage: 'Dose 1', status: 'upcoming' },
            { name: 'PCV-1', description: 'Pneumococcal Conjugate Vaccine - Protects against pneumonia.', dosage: 'Dose 1', status: 'upcoming' }
        ]
    },
    {
        age: '10 Weeks',
        color: '#a78bfa',
        vaccines: [
            { name: 'OPV-2', description: 'Second regular dose of Oral Polio Vaccine.', dosage: 'Dose 2', status: 'upcoming' },
            { name: 'Pentavalent-2', description: 'Second dose of Pentavalent combination.', dosage: 'Dose 2', status: 'upcoming' },
            { name: 'RVV-2', description: 'Second dose for Rotavirus protection.', dosage: 'Dose 2', status: 'upcoming' }
        ]
    },
    {
        age: '14 Weeks',
        color: '#34d399',
        vaccines: [
            { name: 'OPV-3', description: 'Third regular dose of Oral Polio Vaccine.', dosage: 'Dose 3', status: 'upcoming' },
            { name: 'Pentavalent-3', description: 'Third dose of Pentavalent combination.', dosage: 'Dose 3', status: 'upcoming' },
            { name: 'fIPV-2', description: 'Second fractional dose of IPV.', dosage: 'Dose 2', status: 'upcoming' },
            { name: 'RVV-3', description: 'Third dose for Rotavirus protection.', dosage: 'Dose 3', status: 'upcoming' },
            { name: 'PCV-2', description: 'Second dose for Pneumonia protection.', dosage: 'Dose 2', status: 'upcoming' }
        ]
    },
    {
        age: '9-12 Months',
        color: '#fb923c',
        vaccines: [
            { name: 'MR-1', description: 'Measles & Rubella - Protects against viral infections.', dosage: 'Dose 1', status: 'upcoming' },
            { name: 'JE-1', description: 'Japanese Encephalitis - Prevention for brain swelling.', dosage: 'Dose 1', status: 'upcoming' },
            { name: 'PCV-Booster', description: 'Booster dose for Pneumococcal protection.', dosage: 'Booster', status: 'upcoming' }
        ]
    },
    {
        age: '16-24 Months',
        color: '#f87171',
        vaccines: [
            { name: 'MR-2', description: 'Second dose of Measles & Rubella.', dosage: 'Dose 2', status: 'upcoming' },
            { name: 'JE-2', description: 'Second dose of Japanese Encephalitis.', dosage: 'Dose 2', status: 'upcoming' },
            { name: 'DPT-Booster-1', description: 'First booster for Diphtheria, Pertussis, Tetanus.', dosage: 'Booster 1', status: 'upcoming' },
            { name: 'OPV-Booster', description: 'Booster dose for Polio protection.', dosage: 'Booster', status: 'upcoming' }
        ]
    },
    {
        age: '5-6 Years',
        color: '#94a3b8',
        vaccines: [
            { name: 'DPT-Booster-2', description: 'Second booster for continued protection.', dosage: 'Booster 2', status: 'upcoming' }
        ]
    },
    {
        age: '10-16 Years',
        color: '#1e293b',
        vaccines: [
            { name: 'Td (Tetanus & adult Diphtheria)', description: 'Tetanus and adult Diphtheria - Recommended at 10 and 16 years.', dosage: 'Regular', status: 'upcoming' }
        ]
    }
];

export const VACCINATION_SCHEDULE = [
    {
        trimester: 1,
        color: '#f472b6',
        vaccines: [
            { name: 'Flu Shot (Influenza)', timing: 'Anytime', status: 'recommended', description: 'Protects against seasonal flu.' },
            { name: 'Tdap Vaccine', timing: '27-36 Weeks', status: 'upcoming', description: 'Protects baby from whooping cough.' }
        ]
    },
    {
        trimester: 2,
        color: '#60a5fa',
        vaccines: [
            { name: 'Hepatitis B', timing: 'Check with Doctor', status: 'optional', description: 'If not previously vaccinated.' }
        ]
    },
    {
        trimester: 3,
        color: '#34d399',
        vaccines: [
            { name: 'RSV Screen', timing: '32-36 Weeks', status: 'upcoming', description: 'Protects baby from severe lung infections.' }
        ]
    }
] as const;
