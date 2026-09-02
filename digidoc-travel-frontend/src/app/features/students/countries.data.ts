export interface University {
  name: string;
}

export interface Country {
  code: string;        // ISO2
  name: string;
  dialCode: string;    // +57
  flag: string;        // emoji
  universities: string[];
}

export const COUNTRIES: Country[] = [
  {
    code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴',
    universities: [
      'Universidad Nacional de Colombia',
      'Universidad de los Andes',
      'Universidad Javeriana',
      'Universidad de Antioquia',
      'Universidad del Valle',
      'Universidad del Norte'
    ]
  },
  {
    code: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽',
    universities: [
      'UNAM', 'Tecnológico de Monterrey', 'IPN', 'Universidad Iberoamericana', 'UAM'
    ]
  },
  {
    code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷',
    universities: [
      'Universidad de Buenos Aires (UBA)', 'Universidad Nacional de Córdoba', 'Universidad Nacional de La Plata', 'UTN'
    ]
  },
  {
    code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱',
    universities: [
      'Pontificia Universidad Católica de Chile', 'Universidad de Chile', 'Universidad de Concepción'
    ]
  },
  {
    code: 'PE', name: 'Perú', dialCode: '+51', flag: '🇵🇪',
    universities: [
      'Pontificia Universidad Católica del Perú', 'Universidad Nacional Mayor de San Marcos', 'Universidad de Lima'
    ]
  },
  {
    code: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨',
    universities: [
      'Escuela Politécnica Nacional', 'USFQ', 'Universidad Central del Ecuador'
    ]
  },
  {
    code: 'BR', name: 'Brasil', dialCode: '+55', flag: '🇧🇷',
    universities: [
      'USP', 'UNICAMP', 'UFRJ', 'UFMG'
    ]
  },
  {
    code: 'ES', name: 'España', dialCode: '+34', flag: '🇪🇸',
    universities: [
      'Universidad Complutense de Madrid', 'Universidad de Barcelona', 'Universidad Autónoma de Madrid', 'UPC'
    ]
  },
  {
    code: 'US', name: 'Estados Unidos', dialCode: '+1', flag: '🇺🇸',
    universities: [
      'Harvard University', 'MIT', 'Stanford University', 'UCLA', 'NYU'
    ]
  },
  {
    code: 'CA', name: 'Canadá', dialCode: '+1', flag: '🇨🇦',
    universities: [
      'University of Toronto', 'McGill University', 'UBC', 'Université de Montréal'
    ]
  },
  {
    code: 'GB', name: 'Reino Unido', dialCode: '+44', flag: '🇬🇧',
    universities: [
      'University of Oxford', 'University of Cambridge', 'Imperial College London', 'UCL'
    ]
  },
  {
    code: 'FR', name: 'Francia', dialCode: '+33', flag: '🇫🇷',
    universities: [
      'Sorbonne Université', 'École Polytechnique', 'Sciences Po', 'Université PSL'
    ]
  },
  {
    code: 'DE', name: 'Alemania', dialCode: '+49', flag: '🇩🇪',
    universities: [
      'TU Munich', 'Heidelberg University', 'Humboldt-Universität zu Berlin', 'KIT'
    ]
  },
  {
    code: 'IT', name: 'Italia', dialCode: '+39', flag: '🇮🇹',
    universities: [
      'Università di Bologna', 'Sapienza di Roma', 'Politecnico di Milano'
    ]
  },
  {
    code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺',
    universities: [
      'University of Melbourne', 'University of Sydney', 'UNSW Sydney'
    ]
  },
  {
    code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪',
    universities: [
      'UCV', 'USB', 'UCAB', 'Universidad de los Andes (VE)'
    ]
  },
  {
    code: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴',
    universities: [
      'UMSA', 'UCB', 'Universidad Mayor de San Simón'
    ]
  },
  {
    code: 'PY', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾',
    universities: [
      'Universidad Nacional de Asunción', 'Universidad Católica de Paraguay'
    ]
  },
  {
    code: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾',
    universities: [
      'Universidad de la República', 'Universidad ORT Uruguay'
    ]
  },
  {
    code: 'PA', name: 'Panamá', dialCode: '+507', flag: '🇵🇦',
    universities: [
      'Universidad de Panamá', 'Universidad Tecnológica de Panamá'
    ]
  },
];
