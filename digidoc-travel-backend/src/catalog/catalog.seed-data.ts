// Fuente única de verdad del catálogo países → universidades (relación 1:N).
// Verificado contra fuentes externas:
// - Códigos telefónicos: https://en.wikipedia.org/wiki/List_of_telephone_country_codes
// - Universidades: https://en.wikipedia.org/wiki/List_of_universities_in_Colombia,
//   https://en.wikipedia.org/wiki/List_of_universities_in_Spain, y equivalentes por país.
// El frontend conserva una copia local (countries.data.ts) solo como fallback offline.
export interface CountrySeed {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  universities: string[];
}

export const COUNTRY_SEED: CountrySeed[] = [
  {
    code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴',
    universities: [
      'Universidad Nacional de Colombia',
      'Universidad de los Andes',
      'Pontificia Universidad Javeriana',
      'Universidad de Antioquia',
      'Universidad del Valle',
      'Universidad del Norte',
      'Universidad de Cartagena',
      'Universidad Industrial de Santander (UIS)',
      'Universidad del Rosario',
      'Universidad EAFIT',
    ],
  },
  {
    code: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽',
    universities: [
      'Universidad Nacional Autónoma de México (UNAM)',
      'Tecnológico de Monterrey',
      'Instituto Politécnico Nacional (IPN)',
      'Universidad Iberoamericana',
      'Universidad Autónoma Metropolitana (UAM)',
      'Universidad de Guadalajara',
      'Universidad de Monterrey',
      'Universidad Panamericana',
    ],
  },
  {
    code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷',
    universities: [
      'Universidad de Buenos Aires (UBA)',
      'Universidad Nacional de Córdoba',
      'Universidad Nacional de La Plata',
      'Universidad Tecnológica Nacional (UTN)',
      'Universidad Austral',
      'Pontificia Universidad Católica Argentina (UCA)',
    ],
  },
  {
    code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱',
    universities: [
      'Pontificia Universidad Católica de Chile',
      'Universidad de Chile',
      'Universidad de Concepción',
      'Universidad Técnica Federico Santa María',
      'Universidad Adolfo Ibáñez',
      'Universidad Austral de Chile',
    ],
  },
  {
    code: 'PE', name: 'Perú', dialCode: '+51', flag: '🇵🇪',
    universities: [
      'Pontificia Universidad Católica del Perú (PUCP)',
      'Universidad Nacional Mayor de San Marcos',
      'Universidad de Lima',
      'Universidad del Pacífico',
      'Universidad Peruana Cayetano Heredia',
      'Universidad San Ignacio de Loyola',
    ],
  },
  {
    code: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨',
    universities: [
      'Escuela Politécnica Nacional',
      'Universidad San Francisco de Quito (USFQ)',
      'Universidad Central del Ecuador',
      'Escuela Superior Politécnica del Litoral (ESPOL)',
      'Universidad de las Américas (UDLA)',
      'Pontificia Universidad Católica del Ecuador',
    ],
  },
  {
    code: 'BR', name: 'Brasil', dialCode: '+55', flag: '🇧🇷',
    universities: [
      'Universidade de São Paulo (USP)',
      'Universidade Estadual de Campinas (UNICAMP)',
      'Universidade Federal do Rio de Janeiro (UFRJ)',
      'Universidade Federal de Minas Gerais (UFMG)',
      'Universidade Federal do Rio Grande do Sul (UFRGS)',
      'Fundação Getulio Vargas (FGV)',
    ],
  },
  {
    code: 'ES', name: 'España', dialCode: '+34', flag: '🇪🇸',
    universities: [
      'Universidad Complutense de Madrid',
      'Universitat de Barcelona',
      'Universidad Autónoma de Madrid',
      'Universitat Politècnica de Catalunya (UPC)',
      'Universidad de Granada',
      'Universidad de Valencia',
      'Universidad de Sevilla',
      'Universidad Carlos III de Madrid',
      'Universitat Autònoma de Barcelona',
      'Universidad de Salamanca',
    ],
  },
  {
    code: 'US', name: 'Estados Unidos', dialCode: '+1', flag: '🇺🇸',
    universities: [
      'Harvard University',
      'Massachusetts Institute of Technology (MIT)',
      'Stanford University',
      'University of California, Los Angeles (UCLA)',
      'New York University (NYU)',
      'Yale University',
      'Princeton University',
      'Columbia University',
    ],
  },
  {
    code: 'CA', name: 'Canadá', dialCode: '+1', flag: '🇨🇦',
    universities: [
      'University of Toronto',
      'McGill University',
      'University of British Columbia (UBC)',
      'Université de Montréal',
      'University of Alberta',
      'University of Waterloo',
    ],
  },
  {
    code: 'GB', name: 'Reino Unido', dialCode: '+44', flag: '🇬🇧',
    universities: [
      'University of Oxford',
      'University of Cambridge',
      'Imperial College London',
      'University College London (UCL)',
      'University of Edinburgh',
      'King\'s College London',
    ],
  },
  {
    code: 'FR', name: 'Francia', dialCode: '+33', flag: '🇫🇷',
    universities: [
      'Sorbonne Université',
      'École Polytechnique',
      'Sciences Po',
      'Université PSL',
      'Université Paris-Saclay',
      'École Normale Supérieure (ENS)',
    ],
  },
  {
    code: 'DE', name: 'Alemania', dialCode: '+49', flag: '🇩🇪',
    universities: [
      'Technische Universität München (TUM)',
      'Heidelberg University',
      'Humboldt-Universität zu Berlin',
      'Karlsruhe Institute of Technology (KIT)',
      'Ludwig-Maximilians-Universität München (LMU)',
      'RWTH Aachen University',
    ],
  },
  {
    code: 'IT', name: 'Italia', dialCode: '+39', flag: '🇮🇹',
    universities: [
      'Università di Bologna',
      'Sapienza Università di Roma',
      'Politecnico di Milano',
      'Università di Padova',
      'Università Bocconi',
      'Politecnico di Torino',
    ],
  },
  {
    code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺',
    universities: [
      'University of Melbourne',
      'University of Sydney',
      'UNSW Sydney',
      'Australian National University (ANU)',
      'University of Queensland',
      'Monash University',
    ],
  },
  {
    code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪',
    universities: [
      'Universidad Central de Venezuela (UCV)',
      'Universidad Simón Bolívar (USB)',
      'Universidad Católica Andrés Bello (UCAB)',
      'Universidad de los Andes (ULA)',
      'Universidad Metropolitana',
      'Universidad del Zulia (LUZ)',
    ],
  },
  {
    code: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴',
    universities: [
      'Universidad Mayor de San Andrés (UMSA)',
      'Universidad Católica Boliviana (UCB)',
      'Universidad Mayor de San Simón (UMSS)',
      'Universidad Privada Boliviana (UPB)',
      'Universidad Autónoma Gabriel René Moreno',
    ],
  },
  {
    code: 'PY', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾',
    universities: [
      'Universidad Nacional de Asunción (UNA)',
      'Universidad Católica Nuestra Señora de la Asunción',
      'Universidad Americana',
      'Universidad del Norte (UniNorte)',
    ],
  },
  {
    code: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾',
    universities: [
      'Universidad de la República (UdelaR)',
      'Universidad ORT Uruguay',
      'Universidad de Montevideo (UM)',
      'Universidad Católica del Uruguay',
    ],
  },
  {
    code: 'PA', name: 'Panamá', dialCode: '+507', flag: '🇵🇦',
    universities: [
      'Universidad de Panamá',
      'Universidad Tecnológica de Panamá (UTP)',
      'Universidad Santa María la Antigua (USMA)',
      'Universidad Latina de Panamá',
    ],
  },
];
