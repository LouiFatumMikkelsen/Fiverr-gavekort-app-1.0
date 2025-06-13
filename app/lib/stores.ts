interface Store {
  id: string;
  name: string;
  displayName?: string; // Fulde navn til visning
  logoUrl?: string;  // Valgfrit logo URL
  category?: string;
  address?: string;
}

// Liste over butikker med deres logo URLs
export const stores: Store[] = [
  {
    id: '1',
    name: 'H&M',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/320px-H%26M-Logo.svg.png'
  },
  {
    id: '2',
    name: 'Matas',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Matas_logo.svg/320px-Matas_logo.svg.png'
  },
  {
    id: '3',
    name: 'Magasin',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Magasin_du_Nord_Logo.svg/320px-Magasin_du_Nord_Logo.svg.png'
  },
  // Butikker uden logo URL vil automatisk vise navn i stedet
  {
    id: '4',
    name: 'Føtex',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/F%C3%B8tex_logo.svg/320px-F%C3%B8tex_logo.svg.png'
  },
  {
    id: '5',
    name: 'Bilka',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Bilka_Logo.svg/320px-Bilka_Logo.svg.png'
  },
  {
    id: '6',
    name: 'Normal',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Normal_Logo.svg/320px-Normal_Logo.svg.png'
  },
  {
    id: '7',
    name: 'Imerco',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Imerco_logo.svg/320px-Imerco_logo.svg.png'
  },
  {
    id: '8',
    name: 'Netto',
  },
  {
    id: '9',
    name: 'Rema 1000',
  },
  {
    id: '10',
    name: 'Lidl',
  },
  {
    id: '11',
    name: 'KANT Hair',  // Forenklet navn til søgning
    displayName: 'KANT Hair By Lulu & Jerris',
    category: 'Frisør',
    address: 'Skindergade 24, 1. th., 1159 København K',
  },
];

// Opdateret visningsfunktion
export const getStoreDisplay = (storeName: string): { type: 'logo' | 'text', value: any } => {
  const store = stores.find(s => s.name.toLowerCase() === storeName.toLowerCase());
  
  // Hvis butikken ikke findes, vis navnet som tekst
  if (!store) {
    return { 
      type: 'text', 
      value: { text: storeName, color: '#000000' }
    };
  }
  
  // Hvis butikken har et logo URL, brug det
  if (store.logoUrl) {
    return {
      type: 'logo',
      value: store.logoUrl
    };
  }
  
  // Ellers vis butikkens navn som tekst
  return {
    type: 'text',
    value: { text: store.name, color: '#000000' }
  };
};

// Opdater søgefunktionen til at søge i både name og displayName
export const searchStores = (query: string): Store[] => {
  console.log('Søger efter:', query);
  
  if (!query || query.length < 2) {
    console.log('Query for kort');
    return [];
  }
  
  const searchQuery = query.toLowerCase();
  console.log('Søger med:', searchQuery);
  
  const results = stores.filter(store => {
    const nameMatch = store.name.toLowerCase().includes(searchQuery);
    const displayMatch = store.displayName?.toLowerCase().includes(searchQuery);
    console.log(`Tjekker ${store.name}:`, { nameMatch, displayMatch });
    return nameMatch || displayMatch;
  });
  
  console.log('Fandt:', results);
  return results;
};

// Tilføj en funktion til at generere forskellige farver baseret på butiksnavn
export const getCardColor = (storeName: string) => {
  const colors = [
    '#1e3a8a', // Mørkeblå
    '#047857', // Mørkegrøn
    '#7c3aed', // Lilla
    '#b91c1c', // Mørkerød
    '#0369a1', // Ocean blå
  ];
  
  // Brug butiksnavn til at vælge en farve
  const index = storeName.length % colors.length;
  return colors[index];
}; 